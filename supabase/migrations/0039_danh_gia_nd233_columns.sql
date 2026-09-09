-- Migration 0039: Bổ sung cột NĐ 233/2026 cho bảng danh_gia_cbvc
-- Trước đây các trường này lưu dạng JSON string trong cột nhan_xet
-- Nay tách ra cột riêng để truy vấn, index trực tiếp bằng SQL

-- Thêm cột điểm chung (tối đa 30 điểm)
alter table danh_gia_cbvc add column if not exists diem_chung smallint default null;
alter table danh_gia_cbvc add constraint chk_diem_chung check (diem_chung is null or (diem_chung >= 0 and diem_chung <= 30));

-- Thêm cột điểm nhiệm vụ (tối đa 70 điểm)
alter table danh_gia_cbvc add column if not exists diem_nhiem_vu smallint default null;
alter table danh_gia_cbvc add constraint chk_diem_nhiem_vu check (diem_nhiem_vu is null or (diem_nhiem_vu >= 0 and diem_nhiem_vu <= 70));

-- Cột đánh dấu bị kỷ luật trong năm đánh giá
alter table danh_gia_cbvc add column if not exists bi_ky_luat boolean default false;

-- Hình thức kỷ luật (nếu có): khiển trách, cảnh cáo, hạ bậc lương, buộc thôi việc
alter table danh_gia_cbvc add column if not exists hinh_thuc_ky_luat text default null;

-- Migrate dữ liệu hiện có từ JSON trong nhan_xet (nếu có)
-- Parse JSON an toàn: chỉ cập nhật khi nhan_xet chứa JSON hợp lệ và cột mới còn null
update danh_gia_cbvc
  set diem_chung = (nhan_xet::jsonb ->> 'diemChung')::smallint,
      diem_nhiem_vu = (nhan_xet::jsonb ->> 'diemNhiemVu')::smallint,
      bi_ky_luat = coalesce((nhan_xet::jsonb ->> 'biKyLuat')::boolean, false),
      hinh_thuc_ky_luat = nhan_xet::jsonb ->> 'hinhThucKyLuat'
  where nhan_xet is not null
    and nhan_xet like '{%}'
    and diem_chung is null;

-- Comment giải thích
comment on column danh_gia_cbvc.diem_chung is 'Điểm tiêu chí chung NĐ 233/2026, tối đa 30 điểm';
comment on column danh_gia_cbvc.diem_nhiem_vu is 'Điểm kết quả nhiệm vụ NĐ 233/2026, tối đa 70 điểm';
comment on column danh_gia_cbvc.bi_ky_luat is 'NĐ 233: CBVC bị kỷ luật Đảng/HC trong năm → auto xếp loại Không hoàn thành';
comment on column danh_gia_cbvc.hinh_thuc_ky_luat is 'Hình thức kỷ luật: khiển trách, cảnh cáo, hạ bậc lương, buộc thôi việc';
