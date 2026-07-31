-- ============================================================
-- 0023 — Bổ sung cột CRM cho bảng khach_hang (Giai đoạn 0, mục 0.2)
--
--   Trang Khách hàng & Đối tác trước đây chạy trên dữ liệu mẫu trong bộ nhớ
--   (không lưu CSDL) trong khi form Hợp đồng lại tham chiếu bảng khach_hang
--   thật — migration này bổ sung các cột còn thiếu để chuyển trang sang CSDL:
--     • loai            — phân loại đối tác (chủ đầu tư / nhà thầu / đối tác KHCN / khác)
--     • nguoi_dai_dien  — người đại diện pháp luật
--     • email           — email liên hệ
--   (ma_so_thue, dia_chi_chi_tiet, so_dien_thoai, website, ghi_chu đã có từ 0001.)
-- ============================================================

alter table khach_hang
  add column if not exists loai varchar(30) not null default 'khac',
  add column if not exists nguoi_dai_dien varchar(150),
  add column if not exists email varchar(150);

do $$
begin
  alter table khach_hang
    add constraint ck_khach_hang_loai
    check (loai in ('chu-dau-tu','nha-thau','doi-tac-khcn','khac'));
exception when duplicate_object then null;
end $$;

comment on column khach_hang.loai is 'Phân loại đối tác: chu-dau-tu / nha-thau / doi-tac-khcn / khac';
comment on column khach_hang.nguoi_dai_dien is 'Người đại diện pháp luật (BXD-CDE-020)';

-- Tra cứu trùng mã số thuế khi thêm mới (cảnh báo phía client, không unique
-- vì dữ liệu cũ có thể trống/trùng).
create index if not exists idx_khach_hang_ma_so_thue on khach_hang (ma_so_thue);
