-- ============================================================
-- 0007 — Quy chế 2815/QĐ-VKH (hiệu lực 01/01/2026): phân hệ Hợp đồng
--   • Nhóm HĐKT theo Bảng 1 (N1a/N1b, N2a-g, N3, N4) + chủ trì hợp đồng
--   • Ngày nộp hồ sơ gốc về Viện (Điều 6.3 / Điều 8.2 — hạn 30 ngày)
--   • Trạng thái trình/duyệt Viện trưởng theo ngưỡng Điều 6.1
-- ============================================================

alter table hop_dong
  add column nhom_hd varchar(10)
    check (nhom_hd is null or nhom_hd in
      ('N1A','N1B','N2A','N2B','N2C','N2D','N2E','N2F','N2G','N3','N4')),
  add column chu_tri_id bigint references nhan_su(id),
  add column gia_du_thau numeric(15,0),                -- triệu đồng; null = lấy gia_tri
  add column ngay_nop_ho_so date,                       -- ngày nộp hồ sơ gốc về Viện
  add column trang_thai_phe_duyet varchar(20) not null default 'khong-ap-dung'
    check (trang_thai_phe_duyet in ('khong-ap-dung','chua-trinh','da-trinh','da-duyet')),
  add column ngay_trinh_duyet date,
  add column ngay_duyet date,
  add column nguoi_duyet_id bigint references nhan_su(id);

comment on column hop_dong.nhom_hd is 'Nhóm/phân nhóm HĐKT theo Bảng 1 Quy chế 2815/QĐ-VKH';
comment on column hop_dong.chu_tri_id is 'Chủ trì hợp đồng (Điều 3.2.a, Điều 9.4)';
comment on column hop_dong.gia_du_thau is 'Giá dự thầu — dùng để xét ngưỡng trình Viện trưởng (Điều 6.1) khi khác giá trị HĐ ký cuối; triệu đồng';
comment on column hop_dong.ngay_nop_ho_so is 'Ngày nộp hồ sơ gốc về Viện — hạn 30 ngày kể từ ngày ký (Điều 6.3, Điều 8.2)';
comment on column hop_dong.trang_thai_phe_duyet is 'Trạng thái trình/duyệt Viện trưởng khi vượt ngưỡng Điều 6.1: khong-ap-dung | chua-trinh | da-trinh | da-duyet';
