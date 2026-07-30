-- ============================================================
-- 0014 — Cấp ký hợp đồng (Điều 6.1) & Đơn vị phối hợp (Điều 7.1)
--
--   • Điều 6.1: HĐ do Viện trưởng/Phó VT ký, hoặc phân cấp cho Trưởng đơn vị ký.
--     Cấp ký quyết định cả thẩm quyền lẫn tỷ lệ giao khoán (Ghi chú 6 Bảng 1:
--     giảm 0,5% nhóm 2 / 0,2% nhóm 3-4 khi đơn vị yêu cầu Viện ký).
--   • Điều 7.1 (ghi chú): HĐ do nhiều đơn vị cùng thực hiện thì Trưởng đơn vị chủ trì
--     thống nhất phân chia tỷ lệ giá trị HĐ giữa các đơn vị TRÊN PHIẾU GIAO VIỆC.
-- ============================================================

-- ─── 1. Cấp ký hợp đồng ───
alter table hop_dong add column if not exists cap_ky varchar(20);

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'hop_dong_cap_ky_check'
  ) then
    alter table hop_dong add constraint hop_dong_cap_ky_check
      check (cap_ky is null or cap_ky in ('vien-ky','don-vi-ky'));
  end if;
end $$;

comment on column hop_dong.cap_ky is 'Cấp ký HĐ theo Điều 6.1 QC 2815: vien-ky | don-vi-ky';

-- ─── 2. Đơn vị phối hợp trong phiếu giao việc ───
create table if not exists phieu_giao_viec_don_vi (
  id                 bigint generated always as identity primary key,
  phieu_giao_viec_id bigint not null references phieu_giao_viec(id) on delete cascade,
  don_vi_id          bigint not null references don_vi(id),
  -- % giá trị HĐ mà đơn vị này đảm nhận; tổng các dòng + đơn vị chủ trì = 100%
  ty_le_gia_tri      numeric(5,2) not null default 0 check (ty_le_gia_tri >= 0 and ty_le_gia_tri <= 100),
  vai_tro            varchar(20) not null default 'phoi-hop' check (vai_tro in ('chu-tri','phoi-hop')),
  ghi_chu            text,
  created_at         timestamptz not null default now(),
  unique (phieu_giao_viec_id, don_vi_id)
);
comment on table phieu_giao_viec_don_vi is 'Phân chia tỷ lệ giá trị HĐ giữa các đơn vị cùng thực hiện (Điều 7.1 QC 2815)';

alter table phieu_giao_viec_don_vi enable row level security;

drop policy if exists "pgvdv_doc" on phieu_giao_viec_don_vi;
create policy "pgvdv_doc" on phieu_giao_viec_don_vi
  for select to authenticated using (true);

-- Ghi/sửa danh sách đơn vị phối hợp là quyền của Trưởng đơn vị trở lên (Điều 7.1, Điều 9.1g).
drop policy if exists "pgvdv_ghi" on phieu_giao_viec_don_vi;
create policy "pgvdv_ghi" on phieu_giao_viec_don_vi
  for all to authenticated
  using (fn_truong_don_vi_tro_len())
  with check (fn_truong_don_vi_tro_len());
