# CHUẨN HÓA CSDL IBST ERP THEO KHUNG DỮ LIỆU BỘ XÂY DỰNG

Căn cứ áp dụng (các Quyết định ngày 17/6/2026 của Bộ trưởng Bộ Xây dựng):

| Văn bản | Nội dung | Áp dụng vào IBST ERP |
|---|---|---|
| **942/QĐ-BXD** | Khung kiến trúc dữ liệu; Khung quản trị, quản lý dữ liệu BXD v1.0 | Phân lớp dữ liệu, siêu dữ liệu, nhật ký truy vết, phân quyền |
| **945/QĐ-BXD** | Từ điển dữ liệu dùng chung ngành Xây dựng v1.0 | Tên trường, kiểu dữ liệu, độ dài, cấu trúc danh mục MaMuc/TenMuc |
| **946/QĐ-BXD** | Danh mục dữ liệu gốc, dữ liệu chủ, dữ liệu chuyên ngành v1.0 | Phân loại bảng theo gốc/chủ/giao dịch; bộ trường chứng chỉ hành nghề |
| **943/QĐ-BXD** | Danh mục dữ liệu mở + kế hoạch cung cấp 2026-2030 | View dữ liệu mở (chứng chỉ hành nghề, kết quả thí nghiệm) |

## 1. Phân lớp dữ liệu (theo mô hình lớp dữ liệu QĐ 942)

| Lớp | Bảng trong IBST ERP | Ghi chú |
|---|---|---|
| Danh mục dùng chung | `dm_danh_muc` | Cấu trúc MaMuc/TenMuc theo từ điển 945; nhóm: trạng thái, cấp đề tài, loại văn bản, hạng chứng chỉ, loại đào tạo |
| Dữ liệu chủ | `don_vi`, `nhan_su`, `khach_hang` | Tổ chức (BXD-CDE-033), Cá nhân (BXD-CDE-001) |
| Dữ liệu gốc | `chung_chi_hanh_nghe` | Đúng bộ trường tại Phụ lục 01 QĐ 946 (STT 22) — CSDL năng lực hành nghề HĐXD |
| Dữ liệu giao dịch | `van_ban`, `de_tai`, `hop_dong`, `mau_thi_nghiem`, `lop_dao_tao` | Phát sinh từ nghiệp vụ |
| Siêu dữ liệu | `sd_danh_muc_du_lieu` | Nội dung tối thiểu danh mục CSDL theo mục 3.3-3.5 QĐ 942 |
| Nhật ký (truy vết) | `nhat_ky_du_lieu` + trigger | Yêu cầu ghi nhận, truy vết mọi thay đổi (Chương III QĐ 942) |
| Dữ liệu mở | view `mo_chung_chi_hanh_nghe` | Theo danh mục dữ liệu mở QĐ 943: chỉ Họ tên, trình độ, lĩnh vực, hạng, thời hạn — không lộ định danh cá nhân |

## 2. Quy ước đặt tên và kiểu dữ liệu (theo Từ điển 945)

- Cột DB dùng `snake_case` ánh xạ 1-1 với Tên trường KT trong từ điển (PascalCase): `ho_va_ten` ↔ `HoVaTen`, `ma_dinh_danh` ↔ `MaDinhDanh`, `ngay_cap` ↔ `NgayCap`...
- Mã từ vựng BXD (BXD-CDE-xxx, BXD-HDXD-xxx) ghi trong `COMMENT ON COLUMN` để truy vết chuẩn.
- Độ dài theo từ điển: `ho_va_ten varchar(150)`, `ten_to_chuc varchar(150)`, `ma_so_thue varchar(15)`, `ghi_chu varchar(500)`, `dia_chi_chi_tiet varchar(255)`, `so_giay varchar(150)`, `ma_dinh_danh varchar(150)`, `so_dinh_danh_ca_nhan varchar(12)`.
- Ngày tháng: kiểu `date` (hiển thị YYYY-MM-DD theo BXD-CDE-014/017).
- Danh mục tham chiếu: bảng `dm_danh_muc(nhom, ma_muc, ten_muc)` — cấu trúc "Tham chiếu danh mục: Mã mục; Tên mục".

## 3. Quản trị dữ liệu (theo Chương III QĐ 942)

- **Đơn vị chủ quản dữ liệu** khai báo cho từng bảng trong `sd_danh_muc_du_lieu` (tên bảng, miền dữ liệu, loại lớp dữ liệu, đơn vị chủ quản, phạm vi, tần suất cập nhật, mức độ bảo mật).
- **Truy vết**: trigger ghi `nhat_ky_du_lieu` (bảng, id bản ghi, hành động, dữ liệu cũ/mới, thời điểm) cho các bảng giao dịch và dữ liệu gốc.
- **Phân quyền**: bật RLS toàn bộ. Bảng chứa **dữ liệu cá nhân** (`nhan_su`, `chung_chi_hanh_nghe` — nhãn "Dữ liệu cá nhân" theo QĐ 946) chỉ cho `authenticated` đọc; các bảng nghiệp vụ khác cho phép đọc demo (anon) ở giai đoạn phát triển, sẽ siết theo đơn vị khi có đăng nhập.
- **Dữ liệu mở**: cung cấp qua view, loại trừ trường định danh cá nhân, đúng phạm vi công bố tại QĐ 943.

## 4. Nguyên tắc "đúng, đủ, sạch, sống"

- `not null` + `check` cho trường bắt buộc; `unique` cho số hiệu/mã số (số văn bản, số hợp đồng, mã phiếu LAS, số chứng chỉ).
- `created_at`/`updated_at` (trigger tự cập nhật) trên mọi bảng — phục vụ tiêu chí "sống" và đối soát.
- Khóa ngoại đầy đủ giữa giao dịch ↔ dữ liệu chủ ↔ danh mục.
