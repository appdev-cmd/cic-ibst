-- ============================================================
-- 0008 — Quy chế 2815/QĐ-VKH: Phiếu giao việc chính thức (Điều 7)
--   và Quyết toán/Thanh lý hợp đồng (Điều 11)
-- ============================================================

-- ─── Quyết toán/thanh lý (tách khỏi trạng thái thực hiện & các đợt thu tiền) ───
alter table hop_dong
  add column trang_thai_quyet_toan varchar(20) not null default 'chua-quyet-toan'
    check (trang_thai_quyet_toan in ('chua-quyet-toan','da-quyet-toan')),
  add column ngay_quyet_toan date;
comment on column hop_dong.trang_thai_quyet_toan is 'Quyết toán/thanh lý hợp đồng (Điều 11) — độc lập với trạng thái thực hiện';

-- ─── Phiếu giao việc (1 phiếu chính thức / hợp đồng) ───
create table phieu_giao_viec (
  id                   bigint generated always as identity primary key,
  hop_dong_id          bigint not null unique references hop_dong(id) on delete cascade,
  chu_tri_ky_thuat_id  bigint references nhan_su(id),
  kinh_phi_giao        numeric(15,0) not null default 0,   -- triệu đồng
  noi_dung             varchar(1000),
  ngay_giao            date,
  ngay_duyet           date,
  nguoi_duyet_id       bigint references nhan_su(id),
  trang_thai           varchar(20) not null default 'du-thao' check (trang_thai in ('du-thao','da-duyet')),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table phieu_giao_viec is 'Phiếu đề nghị/Quyết định giao việc chính thức theo Điều 7 Quy chế 2815 — chủ trì hợp đồng lấy từ hop_dong.chu_tri_id';

-- ─── Cộng tác viên tham gia phiếu giao việc (Điều 3.2.l, Điều 9.6) ───
create table phieu_giao_viec_ctv (
  id                   bigint generated always as identity primary key,
  phieu_giao_viec_id   bigint not null references phieu_giao_viec(id) on delete cascade,
  nhan_su_id           bigint references nhan_su(id),
  ty_le_phan_chia       numeric(5,2),   -- % giá trị hợp đồng
  ghi_chu              varchar(300),
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table phieu_giao_viec_ctv is 'Cộng tác viên và tỷ lệ phân chia trong phiếu giao việc';

do $$
declare t text;
begin
  foreach t in array array['phieu_giao_viec','phieu_giao_viec_ctv']
  loop
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;
