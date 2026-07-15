-- ============================================================
-- 0006 — Phân quyền theo vai trò (Giai đoạn 3)
--   • Bảng nguoi_dung: gắn auth.users ↔ nhan_su ↔ vai trò ↔ đơn vị
--   • Hàm tiện ích lấy vai trò hiện tại
--   • Siết RLS: bỏ đọc công khai (anon) cho dữ liệu nghiệp vụ;
--     quản trị vai trò + nhật ký chỉ dành cho quản trị/lãnh đạo
-- ============================================================

-- ─── Danh mục vai trò ───
insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('vai_tro','quan-tri','Quản trị hệ thống'),
  ('vai_tro','lanh-dao','Lãnh đạo Viện'),
  ('vai_tro','truong-don-vi','Trưởng đơn vị'),
  ('vai_tro','chuyen-vien','Chuyên viên')
on conflict (nhom, ma_muc) do nothing;

-- ─── Người dùng hệ thống ───
create table nguoi_dung (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  nhan_su_id  bigint references nhan_su(id),
  vai_tro     varchar(30) not null default 'chuyen-vien',
  don_vi_id   bigint references don_vi(id),
  trang_thai  varchar(20) not null default 'hoat-dong',   -- hoat-dong / khoa
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);
comment on table nguoi_dung is 'Tài khoản hệ thống: gắn auth.users với nhân sự, vai trò và đơn vị (phân quyền QĐ 942)';

create trigger trg_nguoi_dung_updated_at before update on nguoi_dung
  for each row execute function fn_cap_nhat_updated_at();

-- Gán quản trị cho tài khoản admin hiện có
insert into nguoi_dung (user_id, vai_tro)
select id, 'quan-tri' from auth.users where email = 'admin@ibst.vn'
on conflict (user_id) do update set vai_tro = 'quan-tri';

-- ─── Hàm tiện ích lấy vai trò của người dùng hiện tại ───
create or replace function fn_vai_tro() returns text
language sql stable security definer as $$
  select coalesce((select vai_tro from nguoi_dung where user_id = auth.uid() and trang_thai = 'hoat-dong'), 'chuyen-vien');
$$;

create or replace function fn_la_quan_tri() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() = 'quan-tri';
$$;

create or replace function fn_lanh_dao_tro_len() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in ('quan-tri','lanh-dao');
$$;

-- ─── RLS bảng nguoi_dung: ai cũng đọc được vai trò của mình; quản trị đọc/ghi tất cả ───
alter table nguoi_dung enable row level security;
create policy "nd_doc_minh"     on nguoi_dung for select to authenticated using (user_id = auth.uid() or fn_la_quan_tri());
create policy "nd_quan_tri_ghi" on nguoi_dung for all    to authenticated using (fn_la_quan_tri()) with check (fn_la_quan_tri());

-- ─── Bỏ đọc công khai (anon) cho dữ liệu nghiệp vụ — chỉ authenticated ───
do $$
declare t text;
begin
  foreach t in array array['dm_danh_muc','don_vi','khach_hang','van_ban','de_tai','hop_dong','mau_thi_nghiem','lop_dao_tao','sd_danh_muc_du_lieu']
  loop
    execute format('drop policy if exists "doc_cong_khai_demo" on %I', t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
  end loop;
end $$;

-- Dữ liệu mở (view chứng chỉ) vẫn cho anon theo QĐ 943 — giữ nguyên grant.

-- ─── Nhật ký dữ liệu: chỉ quản trị / lãnh đạo được đọc ───
create policy "nk_lanh_dao_doc" on nhat_ky_du_lieu for select to authenticated using (fn_lanh_dao_tro_len());

-- ─── Danh mục dùng chung: chỉ quản trị được ghi ───
create policy "dm_quan_tri_ghi" on dm_danh_muc for all to authenticated using (fn_la_quan_tri()) with check (fn_la_quan_tri());
