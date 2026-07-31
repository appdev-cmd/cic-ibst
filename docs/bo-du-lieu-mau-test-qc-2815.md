# 📋 BỘ DỮ LIỆU MẪU TEST TOÀN BỘ QUY TRÌNH HỆ THỐNG QUẢN TRỊ IBST (QUY CHẾ 2815/QĐ-VKH)

---

## 📌 GIỚI THIỆU TỔNG QUAN

Tài liệu này tổng hợp **Bộ dữ liệu mẫu chuẩn (Tiền tố `[TEST-FULL]`)** được nạp trực tiếp trên CSDL của Hệ thống Quản trị Tổng thể IBST nhằm phục vụ công tác kiểm thử (Testing & QA) toàn bộ luồng quy trình nghiệp vụ khép kín theo **Quy chế Quản lý Hợp đồng & Hoạt động KHCN số 2815/QĐ-VKH** (Có hiệu lực từ 01/01/2026).

---

## 🔑 DỮ LIỆU ĐĂNG NHẬP & PHÂN VAI KIỂM THỬ

Mật khẩu chung cho tất cả tài khoản kiểm thử: **`Ibst@2026`**

| Tài khoản Email | Họ và tên | Chức danh / Đơn vị | Quyền hạn & Vai trò nghiệp vụ |
|---|---|---|---|
| **`cic@ibst.vn`** | **Hoàng Văn E** | Giám đốc - Viện Chuyên ngành Kết cấu | • Đăng ký đầu mối thị trường (Đ.5.1c)<br>• Chỉ định Chủ trì lập HSDT (Đ.5.1d)<br>• Trình Lãnh đạo Viện duyệt HĐKT (Đ.6.1) |
| **`khkt@ibst.vn`** | **Phạm Kế Hoạch** | Chuyên viên - Phòng KHKT | • Tiếp nhận đăng ký đầu mối, báo cáo LĐV<br>• Thẩm tra hợp đồng (SLA 01 ngày LV - Đ.9.6c)<br>• Quản lý Chữ ký số & Hồ sơ năng lực chung Viện |
| **`admin@ibst.vn`** | **Nguyễn Hồng Hải** | Viện trưởng - Lãnh đạo Viện | • Chỉ đạo giao đầu mối dự thầu (Đ.5.1c)<br>• Ký duyệt Hợp đồng kinh tế (Đ.6.1)<br>• Ủy quyền ký HĐKT phân cấp (Đ.6.2) |
| **`tckt@ibst.vn`** | **Lê Tài Chính** | Chuyên viên - Phòng TCKT | • Cấp Báo cáo tài chính dự thầu (Đ.5.1d)<br>• Kiểm tra thu tạm ứng / dòng tiền Bên A (Đ.11)<br>• Quản lý trích nộp tài chính Viện 13% (Đ.12) |

---

## 💼 BỘ DỮ LIỆU MẪU ĐẦY ĐỦ THÔNG TIN (DỰ ÁN [TEST-FULL])

### 1️⃣ GIAI ĐOẠN 1: ĐĂNG KÝ ĐẦU MỐI THỊ TRƯỜNG (Điều 5.1c QC 2815)
* **Tên cơ hội / gói thầu:** `[TEST-FULL] Khảo sát & Đánh giá chất lượng đường cất hạ cánh Cảng HKQT Nội Bài GĐ2`
* **Chủ đầu tư (Bên A):** `Tổng công ty Cảng hàng không Việt Nam (ACV)` (MST: `0311687329`)
* **Đơn vị đăng ký đầu mối:** `Viện chuyên ngành Kết cấu công trình xây dựng` (ĐV Kết cấu - ID 1)
* **Người đại diện đăng ký:** `Hoàng Văn E` (Giám đốc ĐV Kết cấu)
* **VCNLĐ phát hiện thông tin:** `Nguyễn Văn A` (Chuyên viên ĐV Kết cấu - *Căn cứ xét thưởng Đ.5.1a*)
* **Ngày đăng ký:** `31/07/2026`
* **Mô tả thị trường:** *Dự án trọng điểm ACV làm CĐT, dự kiến phát hành HSMT tháng 8/2026. Đăng ký đầu mối tránh chồng chéo theo Đ.5.1c QC 2815.*
* **Trạng thái quy trình:** `Đã giao đầu mối` (*Phòng KHKT tiếp nhận & Lãnh đạo Viện đã cho ý kiến chỉ đạo*)
* **📍 Vị trí giao diện:** Phân hệ **Đấu thầu & Chào giá** ➔ Tab **Đăng ký đầu mối (Đ.5.1c)** ➔ Click dòng bản ghi mở **Slide Panel 360°**.

#### 🔄 TRÌNH TỰ CHUYỂN BƯỚC TỪ GIAI ĐOẠN 1 SANG GIAI ĐOẠN 2:
1. **Hoàn thành Giai đoạn 1:** Lãnh đạo Viện duyệt cơ hội ở trạng thái **"Đã giao đầu mối"** cho Đơn vị đăng ký.
2. **Kích hoạt Giai đoạn 2:** Đơn vị được giao đầu mối chuyển sang Tab **"Gói thầu & Kết quả"** ➔ Bấm nút **"+ Thêm gói thầu mới"**.
3. **Phân công & Lập Hồ sơ:**
   - Chọn Chủ đầu tư (Bên A), Đơn vị thực hiện.
   - Chọn cán bộ **Chủ trì lập HSDT** (Đ.5.1d).
   - Tích chọn bộ 3/3 Hồ sơ năng lực (HSNL chung Viện Đ.9.6g do P.KHKT giữ CKS, BCTC do P.TCKT cấp, CCNN do P.TCHC xác nhận).
4. **Cập nhật kết quả:** Lưu thông tin gói thầu ➔ Cập nhật trạng thái `Đã nộp HS` ➔ Khi trúng thầu cập nhật `Trúng thầu` để chuyển sang Giai đoạn 3 (Ký kết HĐ).

---

### 2️⃣ GIAI ĐOẠN 2: LẬP HSDT & KẾT QUẢ ĐẤU THẦU (Điều 5.1d, 9.6g QC 2815)
* **Tên gói thầu:** `[TEST-FULL] Gói thầu TV01: Khảo sát & Kiểm định đường cất hạ cánh Nội Bài GĐ2`
* **Chủ đầu tư:** `Tổng công ty Cảng hàng không Việt Nam (ACV)`
* **Hình thức lựa chọn nhà thầu:** `Đấu thầu rộng rãi` (`dau-thau-rong-rai`)
* **Đơn vị thực hiện / Phụ trách:** `Viện Chuyên ngành Kết cấu` / `Hoàng Văn E`
* **Chủ trì lập HSDT:** `Nguyễn Văn A` *(ĐV chỉ định người chủ trì theo Đ.5.1d)*
* **Giá dự thầu / Giá trúng thầu:** `4.800.000.000 VNĐ` / `4.650.000.000 VNĐ` (4.650 triệu VNĐ)
* **Checklist Hồ sơ năng lực (3/3 loại HSNL):**
  - `✓ HS Năng lực chung Viện` *(Do Phòng KHKT tổng hợp & quản lý Chữ ký số Viện - Đ.9.6g)*
  - `✓ Báo cáo tài chính 03 năm` *(Do Phòng TCKT cấp)*
  - `✓ CCNN & Bằng cấp cán bộ` *(Do Phòng TCHC xác nhận)*
* **Trạng thái thầu:** `Trúng thầu`
* **📍 Vị trí giao diện:** Phân hệ **Đấu thầu & Chào giá** ➔ Tab **Gói thầu & Kết quả** ➔ Click dòng bản ghi mở **Slide Panel 360°**.

---

### 3️⃣ GIAI ĐOẠN 3: KÝ KẾT & PHÂN BỔ TÀI CHÍNH HỢP ĐỒNG (Điều 6.1, 12 QC 2815)
* **Số Hợp đồng kinh tế:** `501/2026/HĐKT-IBST`
* **Tên Hợp đồng:** `[TEST-FULL] HĐKT Khảo sát & Đánh giá chất lượng đường cất hạ cánh Cảng HKQT Nội Bài GĐ2`
* **Phân nhóm HĐ (Bảng 1 QC 2815):** **Nhóm 2A** (Khảo sát XD, Kiểm định CLCT, Trắc đạc)
* **Thẩm quyền ký kết:** `Viện ký` (`vien-ky`)
* **Giá trị HĐ (trước thuế GTGT):** `4.650.000.000 VNĐ` (4.650 triệu VNĐ)
* **Thuế GTGT (10%):** `465.000.000 VNĐ` (465 triệu VNĐ)
* **Tổng giá trị HĐ (sau thuế):** `5.115.000.000 VNĐ` (5.115 triệu VNĐ)
* **Số tiền Bên A đã tạm ứng (30%):** `1.395.000.000 VNĐ` (1.395 triệu VNĐ)
* **Trạng thái phê duyệt HĐ:** `Đã phê duyệt` (*Đã trải qua luồng thẩm tra KHKT & Viện trưởng phê duyệt*)

#### 📊 BẢNG PHÂN BỔ KINH PHÍ TỰ ĐỘNG THEO BẢNG 1 — NHÓM 2A (ĐIỀU 12)

| Nội dung khoản mục | Tỷ lệ % | Giá trị trước thuế (VNĐ) | Quy chế 2815 đối chiếu |
|---|:---:|:---:|---|
| **Kinh phí giao Chủ trì HĐ** | **77.00%** | **`3.580.500.000 VNĐ`** | Chi trực tiếp nhân công, máy móc, vật liệu (Đ.12.4a) |
| **Chi phí quản lý tại Đơn vị** | **10.00%** | **`465.000.000 VNĐ`** | Chi lương VCNLĐ, điện nước, quản lý ĐV (Đ.12.4a) |
| **TỔNG KINH PHÍ GIAO ĐƠN VỊ (Cột 5)** | **87.00%** | **`4.045.500.000 VNĐ`** | Đơn vị Kết cấu quản lý & tự chủ quyết toán |
| **Chi phí quản lý & Lợi nhuận Viện** | **8.00%** | **`372.000.000 VNĐ`** | Trích nộp Quỹ quản lý tập trung Viện (Cột 6) |
| **Khấu hao Tài sản cố định Viện** | **5.00%** | **`232.500.000 VNĐ`** | Trích Quỹ khấu hao tài sản Viện (Cột 7) |
| **TỔNG KINH PHÍ NỘP VIỆN (13%)** | **13.00%** | **`604.500.000 VNĐ`** | Phòng TCKT Viện hạch toán & thu hồi |

* **📍 Vị trí giao diện:** Phân hệ **Hợp đồng & CRM** ➔ Tìm kiếm HĐ `501/2026/HĐKT-IBST` ➔ Click xem **Slide Panel 360°** ➔ Chọn Tab **Phân phối kinh phí (Đ.12)**.

---

## 🧪 KỊCH BẢN THAO TÁC TEST NICK DÂN LỰC THỰC TẾ

1. **Bước 1 (Đăng ký đầu mối):** Đăng nhập `cic@ibst.vn` ➔ Vào `/dau-thau` ➔ Bấm `+ Đăng ký đầu mối mới` ➔ Form Slide Panel hiện ra ➔ Chọn Chủ đầu tư `ACV`, chọn ĐV Kết cấu ➔ Bấm **Đăng ký đầu mối**.
2. **Bước 2 (Chỉ đạo Lãnh đạo Viện):** Đăng nhập `khkt@ibst.vn` bấm **KHKT tiếp nhận** ➔ Đăng nhập `admin@ibst.vn` bấm **Giao đầu mối**.
3. **Bước 3 (Đấu thầu & Kiểm tra Hồ sơ năng lực):** Vào `/dau-thau` tab *Gói thầu* ➔ Click gói thầu `[TEST-FULL]` ➔ Xem checklist 3/3 loại hồ sơ năng lực ➔ Chuyển trạng thái sang `Trúng thầu`.
4. **Bước 4 (Tự động Phân bổ Hợp đồng):** Vào `/hop-dong` ➔ Mở HĐ `501/2026/HĐKT-IBST` ➔ Kiểm tra bảng tỷ lệ **87% Đơn vị / 13% Viện** được tự động tính chính xác theo Bảng 1 Nhóm 2A QC 2815!

---
*Tài liệu được khởi tạo tự động & lưu trữ đồng bộ trên hệ thống IBST ERP 2026.*
