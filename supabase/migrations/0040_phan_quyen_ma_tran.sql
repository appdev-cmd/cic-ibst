-- ============================================================
-- 0040 — Nền tảng Ma trận Phân quyền (Tầng 3 — Tài nguyên × Hành động)
--   Xem docs/phan-quyen-he-thong-ibst.md và docs/ke-hoach-phan-quyen-ibst.md
--
--   Bổ sung tầng "RBAC cấu hình được" lên trên nền vai trò cứng đã có (0006).
--   KHÔNG thay thế trigger thẩm quyền Quy chế 2815 (fn_kiem_soat_tham_quyen_hop_dong,
--   fn_kiem_soat_ky_giao_viec) — hai lớp trả lời hai câu hỏi khác nhau:
--     • Tầng này (RBAC): "vào được màn hình nào, thấy được nút nào?"
--     • Trigger 2815:    "bước ký/duyệt này ai được ký?"
--
--   Ma trận seed dưới đây là DỰ THẢO dựa trên rà soát Quy chế 2815 + RLS hiện hành,
--   CHƯA được nghiệp vụ duyệt chính thức (xem docs/phan-quyen-he-thong-ibst.md §5).
--   Quản trị chỉnh sửa được qua Cài đặt → Quyền theo vai trò mà không cần migration mới.
-- ============================================================

-- ─── 0. Bổ sung 2 vai trò còn thiếu trong danh mục (đã dùng thật ở RLS từ 0033) ───
insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('vai_tro','phong-khkt','Phòng Kế hoạch – Kỹ thuật'),
  ('vai_tro','phong-tckt','Phòng Tài chính – Kế toán'),
  ('vai_tro','phong-tchc','Phòng Tổ chức – Hành chính'),
  ('vai_tro','phong-th-don-vi','Phòng Tổng hợp đơn vị'),
  ('vai_tro','phu-trach-ke-toan-dv','Phụ trách kế toán đơn vị'),
  ('vai_tro','can-bo-to-chuc','Cán bộ Tổ chức - Hành chính'),
  ('vai_tro','van-phong-dang-uy','Văn phòng Đảng ủy')
on conflict (nhom, ma_muc) do nothing;

-- ─── 1. Bảng ma trận quyền ───

create table if not exists quyen_vai_tro_mac_dinh (
  vai_tro     varchar(30) not null,
  tai_nguyen  varchar(40) not null,
  hanh_dong   text[] not null default '{}',
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (vai_tro, tai_nguyen)
);
comment on table quyen_vai_tro_mac_dinh is
  'Quyền mặc định theo vai trò — nguồn sự thật cho Tầng 3 (RBAC). '
  'Sửa qua Cài đặt → Quyền theo vai trò, không hard-code trong ứng dụng.';

create table if not exists quyen_nguoi_dung (
  user_id     uuid not null references auth.users(id) on delete cascade,
  tai_nguyen  varchar(40) not null,
  hanh_dong   text[] not null default '{}',
  granted_by  uuid references auth.users(id) on delete set null,
  updated_at  timestamptz not null default now(),
  primary key (user_id, tai_nguyen)
);
comment on table quyen_nguoi_dung is
  'Ghi đè quyền cho TỪNG người dùng — có bản ghi thì QUYẾT ĐỊNH LUÔN (kể cả mảng rỗng '
  '= thu hồi quyền), không rơi về quyền mặc định vai trò nữa. Xem fn_co_quyen().';

create table if not exists quyen_xem_lien_don_vi (
  nhan_su_id          bigint not null references nhan_su(id) on delete cascade,
  don_vi_duoc_xem_id  bigint not null references don_vi(id) on delete cascade,
  granted_by          uuid references auth.users(id) on delete set null,
  created_at          timestamptz not null default now(),
  primary key (nhan_su_id, don_vi_duoc_xem_id)
);
comment on table quyen_xem_lien_don_vi is
  'Mở rộng phạm vi XEM sang đơn vị khác (phối hợp thực hiện hợp đồng...). '
  'CHỈ mở quyền xem — không kèm thêm/sửa/xóa/duyệt của đơn vị được cấp.';

alter table quyen_vai_tro_mac_dinh enable row level security;
alter table quyen_nguoi_dung enable row level security;
alter table quyen_xem_lien_don_vi enable row level security;

drop policy if exists "qvtmd_doc_auth" on quyen_vai_tro_mac_dinh;
create policy "qvtmd_doc_auth" on quyen_vai_tro_mac_dinh for select to authenticated using (true);
drop policy if exists "qvtmd_ghi_quan_tri" on quyen_vai_tro_mac_dinh;
create policy "qvtmd_ghi_quan_tri" on quyen_vai_tro_mac_dinh for all to authenticated
  using (fn_la_quan_tri()) with check (fn_la_quan_tri());

drop policy if exists "qnd_doc_minh" on quyen_nguoi_dung;
create policy "qnd_doc_minh" on quyen_nguoi_dung for select to authenticated
  using (user_id = auth.uid() or fn_la_quan_tri());
drop policy if exists "qnd_ghi_quan_tri" on quyen_nguoi_dung;
create policy "qnd_ghi_quan_tri" on quyen_nguoi_dung for all to authenticated
  using (fn_la_quan_tri()) with check (fn_la_quan_tri());

drop policy if exists "qxldv_doc" on quyen_xem_lien_don_vi;
create policy "qxldv_doc" on quyen_xem_lien_don_vi for select to authenticated
  using (nhan_su_id = fn_nhan_su_id_hien_tai() or fn_lanh_dao_tro_len());
drop policy if exists "qxldv_ghi" on quyen_xem_lien_don_vi;
create policy "qxldv_ghi" on quyen_xem_lien_don_vi for all to authenticated
  using (fn_lanh_dao_tro_len()) with check (fn_lanh_dao_tro_len());

-- ─── 2. Nhật ký thay đổi quyền — bảng khóa chính ghép nên không tái dùng fn_ghi_nhat_ky() (giả định có cột id) ───

create or replace function fn_ghi_nhat_ky_quyen() returns trigger
language plpgsql security definer as $$
begin
  insert into nhat_ky_du_lieu (ten_bang, hanh_dong, du_lieu_cu, du_lieu_moi, nguoi_dung_id, vai_tro)
  values (
    tg_table_name,
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    auth.uid(),
    fn_vai_tro()
  );
  return coalesce(new, old);
end $$;
comment on function fn_ghi_nhat_ky_quyen is
  'Bản riêng của fn_ghi_nhat_ky() cho các bảng khóa chính ghép (không có cột id đơn) — '
  'dùng cho quyen_vai_tro_mac_dinh/quyen_nguoi_dung/quyen_xem_lien_don_vi.';

drop trigger if exists trg_nhat_ky_quyen_vai_tro on quyen_vai_tro_mac_dinh;
create trigger trg_nhat_ky_quyen_vai_tro after insert or update or delete on quyen_vai_tro_mac_dinh
  for each row execute function fn_ghi_nhat_ky_quyen();

drop trigger if exists trg_nhat_ky_quyen_nguoi_dung on quyen_nguoi_dung;
create trigger trg_nhat_ky_quyen_nguoi_dung after insert or update or delete on quyen_nguoi_dung
  for each row execute function fn_ghi_nhat_ky_quyen();

drop trigger if exists trg_nhat_ky_quyen_xem_lien_don_vi on quyen_xem_lien_don_vi;
create trigger trg_nhat_ky_quyen_xem_lien_don_vi after insert or update or delete on quyen_xem_lien_don_vi
  for each row execute function fn_ghi_nhat_ky_quyen();

-- ─── 3. Hàm kiểm tra quyền — dùng chung cho RouteGuard/menu/tab (app) và RLS (Giai đoạn 3) ───

create or replace function fn_co_quyen(p_tai_nguyen text, p_hanh_dong text) returns boolean
language plpgsql stable security definer as $$
declare
  v_ghi_de   text[];
  v_mac_dinh text[];
begin
  if fn_la_quan_tri() then
    return true;
  end if;

  select hanh_dong into v_ghi_de
  from quyen_nguoi_dung
  where user_id = auth.uid() and tai_nguyen = p_tai_nguyen;

  if found then
    -- Có bản ghi ghi đè thì QUYẾT ĐỊNH LUÔN — kể cả mảng rỗng nghĩa là đã bị thu hồi quyền,
    -- không rơi về quyền mặc định vai trò.
    return p_hanh_dong = any(v_ghi_de);
  end if;

  select hanh_dong into v_mac_dinh
  from quyen_vai_tro_mac_dinh
  where vai_tro = fn_vai_tro() and tai_nguyen = p_tai_nguyen;

  if found then
    return p_hanh_dong = any(v_mac_dinh);
  end if;

  return false; -- deny-by-default: tài nguyên chưa khai báo cho vai trò này
end $$;
comment on function fn_co_quyen is
  'Nguồn sự thật DUY NHẤT cho câu hỏi "vai trò/người dùng này có quyền HANH_DONG trên '
  'TAI_NGUYEN không?" — Tầng 3 (RBAC). Ứng dụng gọi qua src/hooks/usePhanQuyen.ts::can(). '
  'RLS Giai đoạn 3 gọi trực tiếp hàm này. KHÔNG thay thế trigger thẩm quyền Quy chế 2815.';
grant execute on function fn_co_quyen(text, text) to authenticated;

-- ─── 4. Phạm vi đơn vị mở rộng ───

create or replace function fn_don_vi_xem_duoc() returns bigint[]
language sql stable security definer as $$
  select coalesce(array_agg(distinct x) filter (where x is not null), '{}'::bigint[])
  from (
    select fn_don_vi_hien_tai() as x
    union all
    select don_vi_duoc_xem_id from quyen_xem_lien_don_vi where nhan_su_id = fn_nhan_su_id_hien_tai()
  ) t;
$$;
comment on function fn_don_vi_xem_duoc is
  'Đơn vị mình + các đơn vị được cấp qua quyen_xem_lien_don_vi (CHỈ quyền xem).';
grant execute on function fn_don_vi_xem_duoc() to authenticated;

-- ─── 5. Tên chuẩn cho "phạm vi toàn Viện" — PHẢI sửa cùng coPhamViToanVien() ở src/lib/phanQuyen.ts ───

create or replace function fn_pham_vi_toan_vien() returns boolean
language sql stable security definer as $$
  select fn_phong_chuc_nang_cap_vien_tro_len();
$$;
comment on function fn_pham_vi_toan_vien is
  'Tên chuẩn dùng từ Tầng 3 trở đi cho "phạm vi toàn Viện". Hiện alias '
  'fn_phong_chuc_nang_cap_vien_tro_len() (migration 0027) để không phá RLS đang chạy. '
  'PHẢI sửa cùng lúc với coPhamViToanVien() trong src/lib/phanQuyen.ts — xem '
  'docs/phan-quyen-he-thong-ibst.md §2 (bài học hai định nghĩa phạm vi lệch nhau ở cic-erp-contract).';
grant execute on function fn_pham_vi_toan_vien() to authenticated;

-- ─── 6. Seed ma trận mặc định (DỰ THẢO — xem docs/phan-quyen-he-thong-ibst.md §5) ───
-- Mã hành động: X=xem T=them S=sua D=xoa P=duyet E=xuat.
-- on conflict do nothing: không ghi đè cấu hình Quản trị đã chỉnh qua giao diện khi chạy lại.

do $$
declare
  v_map jsonb := '{
    "lanh-dao": {
      "dashboard":"XE","dashboard_tai_chinh":"XE","hop_dong":"XTSDPE","tai_chinh":"XE","khach_hang":"XTSD",
      "dau_thau":"XTSDP","pvqlnn":"XTSDP","bao_cao_khkt":"XE",
      "de_tai":"XTSDP","tap_chi":"XTSDP","so_huu_tri_tue":"XTSDP","chuyen_giao":"XTSDP",
      "co_cau_to_chuc":"XTSD","don_vi":"XTSD","nhan_su":"XTSDE","dao_tao_ncs":"XTSDP","dang_doan_the":"X","danh_gia":"XTSDPE",
      "mau_thu":"XP","thiet_bi_las":"X","dau_tu_cong":"XTSDP",
      "van_ban":"XTSDP","cong_viec":"XTSDP","ho_so_tai_lieu":"XTSD","ai_rag":"X","lich_co_quan":"XTSDP",
      "cai_dat":"X","phan_quyen":"X","nhat_ky":"X"
    },
    "truong-don-vi": {
      "dashboard":"X","dashboard_tai_chinh":"X","hop_dong":"XTSP","tai_chinh":"X","khach_hang":"XTS",
      "dau_thau":"XTSP","pvqlnn":"XTS","bao_cao_khkt":"X",
      "de_tai":"XTS","tap_chi":"X","so_huu_tri_tue":"XTS","chuyen_giao":"XTS",
      "co_cau_to_chuc":"X","don_vi":"X","nhan_su":"X","dao_tao_ncs":"XTS","danh_gia":"XTS",
      "mau_thu":"XTSP","thiet_bi_las":"XTS","dau_tu_cong":"X",
      "van_ban":"XTSP","cong_viec":"XTSP","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"XTSP"
    },
    "chuyen-vien": {
      "dashboard":"X","hop_dong":"XTS","tai_chinh":"X","khach_hang":"XTS","dau_thau":"XTS","pvqlnn":"XTS",
      "de_tai":"XTS","tap_chi":"X","so_huu_tri_tue":"X","chuyen_giao":"XTS",
      "co_cau_to_chuc":"X","don_vi":"X","nhan_su":"X","dao_tao_ncs":"X","dang_doan_the":"X","danh_gia":"X",
      "mau_thu":"XTS","thiet_bi_las":"X",
      "van_ban":"XTS","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"XT"
    },
    "phong-khkt": {
      "dashboard":"X","dashboard_tai_chinh":"X","hop_dong":"XSPE","tai_chinh":"X","khach_hang":"XTS",
      "dau_thau":"XTSPE","pvqlnn":"XTSE","bao_cao_khkt":"XTSDE",
      "de_tai":"XTSPE","tap_chi":"XTS","so_huu_tri_tue":"XTS","chuyen_giao":"XTS",
      "co_cau_to_chuc":"X","don_vi":"X","nhan_su":"X","dao_tao_ncs":"X",
      "mau_thu":"XP","thiet_bi_las":"XTS","dau_tu_cong":"XTSE",
      "van_ban":"XTS","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"XTS"
    },
    "phong-tckt": {
      "dashboard":"X","dashboard_tai_chinh":"XE","hop_dong":"XE","tai_chinh":"XTSDE","khach_hang":"X",
      "dau_thau":"X","pvqlnn":"X","bao_cao_khkt":"X",
      "de_tai":"X","so_huu_tri_tue":"X","chuyen_giao":"XE",
      "co_cau_to_chuc":"X","don_vi":"X","nhan_su":"X",
      "thiet_bi_las":"X","dau_tu_cong":"XE",
      "van_ban":"XTS","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"X"
    },
    "phong-tchc": {
      "dashboard":"X","hop_dong":"X","pvqlnn":"X",
      "co_cau_to_chuc":"XTS","don_vi":"XTS","nhan_su":"XTSD","dao_tao_ncs":"XTS","danh_gia":"XTS",
      "thiet_bi_las":"X",
      "van_ban":"XTSD","cong_viec":"XTS","ho_so_tai_lieu":"XTSD","ai_rag":"X","lich_co_quan":"XTSDP",
      "cai_dat":"X"
    },
    "phong-th-don-vi": {
      "dashboard":"X","hop_dong":"XP","tai_chinh":"X","khach_hang":"X","dau_thau":"X","pvqlnn":"X",
      "de_tai":"X","chuyen_giao":"X",
      "co_cau_to_chuc":"X","nhan_su":"X","dao_tao_ncs":"X","danh_gia":"X",
      "mau_thu":"X","thiet_bi_las":"X",
      "van_ban":"XTS","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"XTS"
    },
    "phu-trach-ke-toan-dv": {
      "dashboard":"X","dashboard_tai_chinh":"X","hop_dong":"X","tai_chinh":"XTS",
      "van_ban":"X","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"X"
    },
    "can-bo-to-chuc": {
      "dashboard":"X",
      "co_cau_to_chuc":"XTS","don_vi":"XTS","nhan_su":"XTSDE","dao_tao_ncs":"XTSD","danh_gia":"XTSDE",
      "van_ban":"XTS","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"XTS"
    },
    "van-phong-dang-uy": {
      "dashboard":"X",
      "co_cau_to_chuc":"X","nhan_su":"X","dang_doan_the":"XTSDPE",
      "van_ban":"XTS","cong_viec":"XTS","ho_so_tai_lieu":"XTS","ai_rag":"X","lich_co_quan":"XTS"
    }
  }'::jsonb;
  v_role text;
  v_res text;
  v_codes text;
  v_actions text[];
  c char;
  i int;
begin
  for v_role, v_res, v_codes in
    select r.key, res.key, res.value
    from jsonb_each(v_map) r, jsonb_each_text(r.value) res
  loop
    v_actions := '{}';
    for i in 1..length(v_codes) loop
      c := substr(v_codes, i, 1);
      v_actions := v_actions || case c
        when 'X' then 'xem'
        when 'T' then 'them'
        when 'S' then 'sua'
        when 'D' then 'xoa'
        when 'P' then 'duyet'
        when 'E' then 'xuat'
        else null
      end;
    end loop;
    insert into quyen_vai_tro_mac_dinh (vai_tro, tai_nguyen, hanh_dong)
    values (v_role, v_res, v_actions)
    on conflict (vai_tro, tai_nguyen) do nothing;
  end loop;
end $$;
