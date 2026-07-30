# Dữ liệu mẫu để test thủ công module Hợp đồng

6 hợp đồng, mỗi cái nhắm đúng 1 nhóm tính năng — gõ tay vào form **"+ Thêm hợp đồng"**.
Đơn vị tài chính: **triệu đồng**. Khách hàng/Đơn vị thực hiện/Chủ trì: chọn bất kỳ trong
dropdown trừ khi ghi chú cụ thể.

---

## A — Nhóm 1 chọn nhầm "Đơn vị ký" → phải bị cảnh báo ngay trên form

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `A01/2026/HDTN` |
| Nhóm hợp đồng | **N1a. Giám định xây dựng, kiểm định đánh giá sự cố theo yêu cầu của cơ quan chức năng** |
| Tên hợp đồng | `Giám định sự cố lún nứt công trình chung cư CT5` |
| Giá trị HĐ | `2500` |
| Ngày ký | hôm nay |
| Cấp ký hợp đồng | chọn **"Đơn vị ký (phân cấp, ủy quyền)"** |

**Kỳ vọng:** ngay khi chọn Cấp ký = Đơn vị ký, hiện dòng đỏ *"Nhóm 1 phải do Viện trưởng ký hoặc Phó Viện trưởng ký theo ủy quyền..."*. Đổi lại thành "Viện ký" thì cảnh báo biến mất.

---

## B — Nhóm 2 vượt ngưỡng + trễ hạn nộp hồ sơ → luồng phê duyệt + 2 cảnh báo phạt cùng lúc

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `B02/2026/HDKT` |
| Nhóm hợp đồng | **N2a. Tư vấn quản lý dự án, tư vấn đầu tư xây dựng, chuyển giao công nghệ** |
| Tên hợp đồng | `Tư vấn quản lý dự án cải tạo Quốc lộ 1A đoạn qua Thanh Hóa` |
| Giá trị HĐ | `7500` *(> ngưỡng 5.000 triệu Nhóm 2)* |
| Đã thanh toán | `0` |
| Ngày ký | **lùi lại ~40 ngày** so với hôm nay |
| Ngày nộp hồ sơ gốc | để trống |
| Cấp ký hợp đồng | **Viện ký** |
| Trạng thái | Đang thực hiện |

**Kỳ vọng:**
- Bảng danh sách: badge **"QC 2815 Trình VT"**
- Tab Thông tin chung: banner Điều 6.1 "Chờ trình Viện trưởng" + cảnh báo đỏ phạt nộp chậm hồ sơ (Điều 14.2, quá hạn ~10 ngày)
- Tab Thực hiện: SLA "Nộp hồ sơ hợp đồng gốc về Viện" đang chạy nhưng đã qua hạn (30 ngày kể từ ngày ký)
- Bấm "Đánh dấu đã trình" → "Xác nhận đã duyệt" để đi hết luồng Điều 6.1

---

## C — Nhóm 2 dưới ngưỡng → tập trung test luồng ký giao việc + đơn vị phối hợp

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `C03/2026/HDTN` |
| Nhóm hợp đồng | **N2f. Thí nghiệm vật liệu trong phòng** |
| Tên hợp đồng | `Thí nghiệm vật liệu bê tông dự án Cầu Rạch Miễu 2` |
| Giá trị HĐ | `1800` *(< ngưỡng 5.000 → không cần trình duyệt, form gọn để tập trung test Giao việc)* |
| Cấp ký hợp đồng | Viện ký |
| Trạng thái | Mới |

**Kỳ vọng sau khi tạo, vào tab Giao việc:**
- Phân bổ Bảng 1 tự tính theo N2f: Chủ trì 59%, Đơn vị 15%, CPQL 16%, Khấu hao TSCĐ 10%, Thuế 10%
- Thêm **2 đơn vị phối hợp** với tỷ lệ cộng lại ≠ 100% → thấy cảnh báo vàng; sửa lại đủ 100% → cảnh báo biến mất
- Thử thêm **2 đơn vị cùng chọn vai trò "Chủ trì"** → thấy cảnh báo đỏ Điều 4.3
- Lưu Phiếu giao việc → đi hết thanh 5 bước ký (Điều 7.1c)

---

## D — Nhóm 3 vượt ngưỡng, đơn vị ký → phê duyệt do Trưởng đơn vị (không phải Lãnh đạo Viện)

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `D04/2026/HDTC` |
| Nhóm hợp đồng | **N3. Thi công xây dựng** |
| Tên hợp đồng | `Thi công gia cố nền móng công trình Nhà điều hành sân bay` |
| Giá trị HĐ | `12000` *(> ngưỡng 10.000 triệu Nhóm 3)* |
| Cấp ký hợp đồng | **Đơn vị ký** |
| Trạng thái | Đang thực hiện |

**Kỳ vọng:**
- Vẫn hiện badge "QC 2815 Trình VT" (vượt ngưỡng 10 tỷ) nhưng nút "Xác nhận đã duyệt" của Điều 6.1 vẫn theo Lãnh đạo Viện như bình thường — **điểm khác biệt thật sự** nằm ở tab Giao việc: khi Phiếu giao việc tới bước 4 (Chờ phê duyệt), nút hiện là **"Trưởng đơn vị phê duyệt"** thay vì "Lãnh đạo Viện phê duyệt" (do `capKy = 'don-vi-ky'`)
- Tab Giao việc, thử nhập Kinh phí giao **thấp hơn nhiều** so với chuẩn Bảng 1 → **không** thấy cảnh báo trần Điều 12.4a, vì Nhóm 3 thuộc diện "quản lý tập trung, Giám đốc đơn vị tự quyết" — không áp trần giảm

---

## E — Nhóm 2 + 2 trường hợp đặc thù cùng lúc (giảm giao khoán + hỗ trợ đi lại)

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `E05/2026/HDKT` |
| Nhóm hợp đồng | **N2d. Khảo sát xây dựng, kiểm định chất lượng công trình, quan trắc, trắc đạc công trình, thí nghiệm hiện trường** |
| Tên hợp đồng | `Khảo sát địa chất công trình thủy lợi hồ chứa nước Krông Pách` |
| Giá trị HĐ | `3000` *(< ngưỡng, không vướng luồng phê duyệt)* |
| Cấp ký hợp đồng | **Viện ký** |
| ☑ Phân viện/TT ở xa | **tick** |
| ☑ Đơn vị tự yêu cầu Viện ký | **tick** |

**Kỳ vọng ở tab Giao việc:**
- Phân bổ Bảng 1 gốc N2d: Chủ trì 77%, Đơn vị 10%
- Vì tick "Đơn vị tự yêu cầu Viện ký" (Nhóm 2, không phải Nhóm 1) → tự giảm thêm 0,3% Chủ trì + 0,2% Đơn vị (Ghi chú 6)
- Vì tick "Phân viện/TT ở xa" → cộng thêm dòng **"Hỗ trợ đi lại"** = 0,5% giá trị HĐ trước thuế (Ghi chú 3)
- Thử đổi Cấp ký sang "Đơn vị ký" → ô "Đơn vị tự yêu cầu Viện ký" tự bỏ tick và khóa lại, phần giảm 0,3%/0,2% biến mất khỏi bảng phân bổ

---

## F — Nhóm 4, không có ngưỡng trình duyệt, trần giao chủ trì 2%

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `F06/2026/HDCU` |
| Nhóm hợp đồng | **N4. Cung ứng vật tư, máy móc, thiết bị** |
| Tên hợp đồng | `Cung ứng thiết bị thí nghiệm nén mẫu bê tông cho phòng LAS` |
| Giá trị HĐ | `15000` *(cố tình để rất lớn — vẫn không kích hoạt Điều 6.1 vì N4 không có ngưỡng)* |
| Cấp ký hợp đồng | Viện ký |

**Kỳ vọng:**
- Dù giá trị 15 tỷ (lớn hơn cả ngưỡng Nhóm 3), **không** xuất hiện badge "QC 2815 Trình VT" — đúng vì N4 không quy định ngưỡng (thanh toán/phê duyệt theo cơ chế khác)
- Tab Giao việc: Phân bổ Bảng 1 N4: Chủ trì 92%, Đơn vị 4%
- Nhập Kinh phí giao **thấp hơn 3% giá trị HĐ so với chuẩn** (vượt trần 2% cho phép của Nhóm 4) → cảnh báo đỏ Điều 12.4a hiện ra với đúng mức trần 2%

---

## Bảng đối chiếu nhanh (để tự kiểm tra kết quả)

| HĐ | Nhóm | Giá trị | Ngưỡng nhóm | Vượt ngưỡng? | Trần giảm chủ trì |
|---|---|---|---|---|---|
| A | N1a | 2.500 | 2.000 | Có | 2% |
| B | N2a | 7.500 | 5.000 | Có | 5% |
| C | N2f | 1.800 | 5.000 | Không | 5% |
| D | N3 | 12.000 | 10.000 | Có | *(không áp trần)* |
| E | N2d | 3.000 | 5.000 | Không | 5% |
| F | N4 | 15.000 | *(không có)* | Không | 2% |
