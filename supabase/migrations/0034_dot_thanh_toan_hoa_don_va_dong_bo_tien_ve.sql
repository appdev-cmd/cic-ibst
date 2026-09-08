-- ============================================================
-- 0034 — Đợt 1 kế hoạch hoàn thiện module Hợp đồng
--        (xem docs/review-module-hop-dong-2026-09.md §6 Đợt 1)
--
-- BỐI CẢNH — lỗi đang xảy ra trên dữ liệu thật:
--   `hop_dong.da_thanh_toan` có HAI nơi ghi mâu thuẫn nhau:
--     (1) services/chitiet.ts → syncDaThanhToan(): cộng từ các đợt đã thu — ĐÚNG;
--     (2) services/queries.ts → hopDongRow(): ghi đè bằng ô nhập tay trên form HĐ.
--   Nơi (2) ghi sau cùng nên thắng; ô nhập tay để trống → Number('') || 0 → 0.
--   Kết quả kiểm chứng 08/09/2026: cả 17/17 hợp đồng có da_thanh_toan = 0,
--   trong khi chứng từ đợt thanh toán ghi nhận 32.320 triệu đồng đã thu thực tế
--   trên 9 hợp đồng → trang Tài chính báo doanh thu 0 và công nợ 100%.
--
-- MIGRATION NÀY:
--   • Bổ sung trường hóa đơn cho đợt thanh toán (Đ.11.1) — nền cho Đợt 2 (QT5).
--   • Đưa da_thanh_toan thành SỐ DẪN XUẤT do trigger CSDL giữ, không phụ thuộc
--     tầng ứng dụng, để không thể bị ghi đè sai lần nữa.
--   • Backfill lại 17 hợp đồng theo chứng từ.
-- ============================================================

-- ─── 1. Trường hóa đơn trên đợt thanh toán (Đ.11.1) ───
alter table dot_thanh_toan
  add column if not exists so_hoa_don        varchar(50),
  add column if not exists ngay_xuat_hoa_don date,
  add column if not exists nguoi_xac_nhan_id bigint references nhan_su(id);

comment on column dot_thanh_toan.so_hoa_don is
  'Số hóa đơn GTGT do P.TCKT xuất (Đ.11.1). Mốc tính nghĩa vụ VAT 1 năm — Đ.14 mục 2 dòng 7.';
comment on column dot_thanh_toan.ngay_xuat_hoa_don is
  'Ngày xuất hóa đơn. Đã xuất mà chưa có ngay_thuc_thu = công nợ phải thu.';
comment on column dot_thanh_toan.nguoi_xac_nhan_id is
  'Người xác nhận tiền về (phụ trách kế toán đơn vị) — Đ.11.1.';

-- ─── 2. da_thanh_toan trở thành số dẫn xuất, do trigger giữ ───
create or replace function fn_dong_bo_da_thanh_toan() returns trigger
language plpgsql security definer as $$
declare
  v_hop_dong_id bigint;
begin
  v_hop_dong_id := coalesce(new.hop_dong_id, old.hop_dong_id);

  update hop_dong h
     set da_thanh_toan = coalesce((
           select sum(d.so_tien) from dot_thanh_toan d
           where d.hop_dong_id = v_hop_dong_id and d.ngay_thuc_thu is not null
         ), 0)
   where h.id = v_hop_dong_id
     and h.da_thanh_toan is distinct from coalesce((
           select sum(d.so_tien) from dot_thanh_toan d
           where d.hop_dong_id = v_hop_dong_id and d.ngay_thuc_thu is not null
         ), 0);

  return coalesce(new, old);
end $$;

comment on function fn_dong_bo_da_thanh_toan() is
  'Giữ hop_dong.da_thanh_toan = tổng đợt thanh toán đã có ngày thực thu. '
  'Đây là NGUỒN SỰ THẬT DUY NHẤT của số tiền đã thu — tầng ứng dụng không được ghi trực tiếp cột này.';

drop trigger if exists trg_dot_thanh_toan_dong_bo on dot_thanh_toan;
create trigger trg_dot_thanh_toan_dong_bo
  after insert or update or delete on dot_thanh_toan
  for each row execute function fn_dong_bo_da_thanh_toan();

comment on column hop_dong.da_thanh_toan is
  'SỐ DẪN XUẤT (triệu đồng) — tổng các đợt thanh toán đã có ngày thực thu, do trigger '
  'trg_dot_thanh_toan_dong_bo giữ. KHÔNG nhập tay, KHÔNG ghi từ form hợp đồng.';

-- ─── 3. Backfill toàn bộ hợp đồng theo chứng từ hiện có ───
update hop_dong h
   set da_thanh_toan = coalesce((
         select sum(d.so_tien) from dot_thanh_toan d
         where d.hop_dong_id = h.id and d.ngay_thuc_thu is not null
       ), 0)
 where h.da_thanh_toan is distinct from coalesce((
         select sum(d.so_tien) from dot_thanh_toan d
         where d.hop_dong_id = h.id and d.ngay_thuc_thu is not null
       ), 0);
