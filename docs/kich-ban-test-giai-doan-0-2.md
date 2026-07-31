# Kịch bản test Giai đoạn 0–2 kế hoạch số hóa QC 2815

*Kèm dữ liệu mẫu đã seed sẵn bằng `node scripts/seed_kich_ban_test_gd2.js` (chạy lại nhiều lần an toàn — bản ghi test có tiền tố `[TEST]`). Đối chiếu kế hoạch: `docs/ke-hoach-so-hoa-quy-trinh-2815.md`.*

---

## Tài khoản test (mật khẩu đều là `Ibst@2026`)

| Tài khoản | Vai trò | Nhân sự gắn kèm | Đóng vai |
|---|---|---|---|
| `cic@ibst.vn` | Trưởng đơn vị | Hoàng Văn E (ĐV Kết cấu) | Đơn vị chủ trì: tạo HĐ, trình hồ sơ, đăng ký đầu mối |
| `khkt@ibst.vn` ⭐mới | **Phòng KHKT** | Phạm Kế Hoạch | Tiếp nhận đầu mối (Đ.5.1c), **ký tắt thẩm tra HĐ (Đ.9.6c)** |
| `tckt@ibst.vn` ⭐mới | **Phòng TCKT** | Lê Tài Chính | Quyết toán (Đ.11) — dùng nhiều ở Giai đoạn 3 |
| `admin@ibst.vn` | Quản trị (≈ Lãnh đạo Viện) | Nguyễn Hồng Hải | Cho ý kiến chỉ đạo, phê duyệt Viện trưởng |

> **Lưu ý đăng nhập:** bản chạy local đang bật tự đăng nhập `admin@ibst.vn` (file `.env`, `VITE_AUTO_LOGIN`). Muốn test đúng vai trò: bấm **Đăng xuất** rồi đăng nhập tài khoản cần test. Khi đổi tài khoản giữa 2 bước của cùng một kịch bản, chỉ cần đăng xuất/đăng nhập rồi quay lại đúng màn hình.

> **Điểm khác biệt lớn so với kịch bản cũ** (`kich-ban-test-quy-trinh-hop-dong.md`): trước đây Trưởng đơn vị "đóng thế" Phòng KHKT. Từ Giai đoạn 0, **KHKT là vai trò thật** — Trưởng đơn vị bấm nút của KHKT sẽ **bị chặn** (đây là hành vi ĐÚNG, có kịch bản test riêng bên dưới).

---

## KB1 — CRM Khách hàng (Giai đoạn 0.2 + 1A)

*Đăng nhập bất kỳ (dùng `cic@ibst.vn`). Vào **Hợp đồng & CRM** → tab **Khách hàng & CRM Tiềm năng**.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 1.1 | Nhìn 4 thẻ KPI đầu trang | Chủ đầu tư **8**, Nhà thầu **3**, Đối tác KHCN **1** (dữ liệu seed đã phân loại); Tổng HĐ liên kết ≥ 9 |
| 1.2 | Lọc "Phân loại = Chủ đầu tư" | Chỉ còn các Sở/Ban/CĐT/ACV/EVNNPC |
| 1.3 | Bấm vào **tên** "Sở Xây dựng tỉnh Quảng Ninh" (hoặc icon 👁) | Slide panel hồ sơ 360° trượt ra: thông tin pháp nhân, 4 KPI (tổng giá trị/công nợ/số HĐ/gói thầu), danh sách **HĐ đã ký** và **lịch sử gói thầu** |
| 1.4 | Thêm khách hàng mới với MST `0311687329` (trùng ACV) | Bị chặn, báo: *"Mã số thuế … đã được dùng cho Tổng công ty Cảng hàng không Việt Nam (ACV)"* |
| 1.5 | Thử **xóa** "Công ty TNHH Phát triển THT" (đang có 1 HĐ) | Bị chặn, báo: *"khách hàng đang gắn với 1 hợp đồng"* |
| 1.6 | Sửa một khách hàng "Khác" → phân loại lại | Lưu thành công, badge màu đổi ngay, F5 vẫn giữ (đã lưu CSDL thật) |

## KB2 — Quy trình 1: Đăng ký đầu mối dự thầu (Đ.5.1c)

*Vào **Đấu thầu** → tab **Đăng ký đầu mối (Đ.5.1c)**. Có sẵn 3 bản ghi `[TEST]` ở 3 trạng thái.*

| # | Tài khoản | Thao tác | Kỳ vọng |
|---|---|---|---|
| 2.1 | `cic@ibst.vn` | Bấm **Đăng ký đầu mối mới**, điền tên cơ hội bất kỳ, đơn vị = ĐV Kết cấu, chọn VCNLĐ phát hiện | Tạo thành công, trạng thái *"Đã đăng ký, chờ KHKT tiếp nhận"*; KPI "Chờ KHKT tiếp nhận" tăng |
| 2.2 | `cic@ibst.vn` | Tìm dòng vừa tạo — thử tìm nút "KHKT tiếp nhận" | **Không có nút** (Trưởng đơn vị không phải KHKT) — chỉ thấy trạng thái |
| 2.3 | `khkt@ibst.vn` | Cùng dòng đó → bấm **KHKT tiếp nhận** | Chuyển *"Chờ Lãnh đạo Viện chỉ đạo"* |
| 2.4 | `khkt@ibst.vn` | Dòng "[TEST] Khảo sát địa chất… Hòa Lạc GĐ2" (đang chờ LĐV) → bấm **Giao đầu mối** | Được phép (KHKT phản hồi thay theo Đ.5.1c) → *"Đã giao đầu mối"*, tự ghi ngày phản hồi |
| 2.5 | `admin@ibst.vn` | Dòng ở bước 2.3 → bấm **Không tham gia**, nhập lý do | Chuyển *"Không tham gia"*, hiện lý do màu đỏ |
| 2.6 | — | Xem dòng "[TEST] TV giám sát bệnh viện… Hưng Yên" | Mẫu sẵn trạng thái từ chối + lý do — đối chiếu hiển thị |

## KB3 — Gói thầu: Chủ trì HSDT + checklist năng lực (Đ.5.1d, 9.6g)

*Vào **Đấu thầu** → tab **Gói thầu & Kết quả**.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 3.1 | Nhìn dòng "[TEST] …sông Đuống GĐ3" | Cột *Chủ trì HSDT*: **Trần Cao Cường**, badge **"Hồ sơ năng lực 2/3"** màu vàng (thiếu CCNN của P.TCHC) |
| 3.2 | Nhìn dòng "[TEST] …cầu Vĩnh Tuy" | Badge **"3/3"** màu xanh, trạng thái *Trúng thầu* |
| 3.3 | Sửa gói sông Đuống → tick nốt ô CCNN → lưu | Badge chuyển **3/3 xanh** |

## KB4 — Luồng phê duyệt HĐ 4 bước + SLA KHKT (Đ.6.1, 9.6c) ⭐ trọng tâm

*Dùng HĐ seed sẵn `408/2026/HDGD` (Giám định N1A — Nhóm 1 nên **luôn** phải trình Viện trưởng). Vào **Hợp đồng & CRM**, mở chi tiết HĐ 408 → tab **Thông tin chung**.*

| # | Tài khoản | Thao tác | Kỳ vọng |
|---|---|---|---|
| 4.1 | `cic@ibst.vn` | Xem khối "Điều 6.1" | Thanh tiến trình 4 bước: *1. Soạn & trình → 2. KHKT thẩm tra → 3. Trình VT → 4. Đã duyệt*, đang ở bước 1; nút **"Trình KHKT thẩm tra"** |
| 4.2 | `cic@ibst.vn` | Bấm **Trình KHKT thẩm tra** | Sang bước 2, badge tím *"KHKT đang thẩm tra (Đ.9.6c)"* + dòng nhắc SLA *"≤ 01 ngày làm việc, báo lỗi trong 06 giờ"* |
| 4.3 | `cic@ibst.vn` | Tìm nút ký tắt | **Không có nút** — chỉ thấy *"Chờ Phòng KHKT ký tắt thẩm tra (Đ.9.6c) — Trưởng đơn vị không có thẩm quyền này"* |
| 4.4 | `khkt@ibst.vn` | Mở HĐ 408 → bấm **"KHKT ký tắt — trình Lãnh đạo Viện"** | Sang bước 3, badge xanh dương *"Đã trình, chờ VT duyệt"* |
| 4.5 | `khkt@ibst.vn` | Thử bấm **"Xác nhận Viện trưởng đã duyệt"** | **Không có nút** (KHKT không phải Lãnh đạo Viện) |
| 4.6 | `admin@ibst.vn` | Bấm **Xác nhận Viện trưởng đã duyệt** | Bước 4 hoàn thành, cả thanh xanh lá; dòng *"Ngày duyệt: … bởi **Nguyễn Hồng Hải**"* — đúng người thật đăng nhập |
| 4.7 | — | (Kiểm chứng SLA) Vào **Tài chính**, bảng phân bổ, cột SLA của HĐ 408 | Không còn SLA chạy (đã đóng "đạt" khi ký tắt ở 4.4) |

**Test chặn vượt cấp ở CSDL (không chỉ ẩn nút):** HĐ `409/2026/HDTV` seed sẵn ở bước *"KHKT đang thẩm tra"*. Đăng nhập `cic@ibst.vn` — ngoài việc không có nút, mọi cách gọi API trực tiếp cũng bị trigger chặn với thông báo *"Điều 9.6c … Thẩm quyền thuộc Phòng KHKT"* (muốn thử: sửa HĐ 409 và đổi trạng thái phê duyệt qua form sẽ không có tùy chọn đó — chốt chặn nằm ở CSDL).

## KB5 — Cờ HĐ phức tạp/chính trị/Bộ giao (Đ.6.1 điều kiện 2)

*HĐ `409/2026/HDTV` giá 3,8 tỷ — **DƯỚI** ngưỡng 5 tỷ Nhóm 2 nhưng tick "phức tạp".*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 5.1 | Mở chi tiết HĐ 409, tab Thông tin | Vẫn hiện khối Điều 6.1 với tiêu đề *"HĐ phức tạp/chính trị — buộc trình Viện trưởng"* (dù dưới ngưỡng tiền) |
| 5.2 | Mở form **Sửa** HĐ bất kỳ | Có checkbox *"HĐ kỹ thuật phức tạp / tính chính trị / pháp lý quan trọng / Bộ giao (Đ.6.1…)"* — tick vào một HĐ nhỏ → hàng đó lập tức hiện badge "QC 2815 Trình VT" |

## KB6 — Ủy quyền ký khi đơn vị ký (Đ.6.2)

*Seed sẵn: ĐV Kết cấu **có** ủy quyền `UQ-01/2026/QĐ-VKH` (hết 31/12); ĐV Địa kỹ thuật **không có**.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 6.1 | Mở HĐ `410/2026/HDKS` (đơn vị ký, ĐV Địa kỹ thuật), tab Thông tin | Cảnh báo **vàng**: *"⚠ Đ.6.2 — Chưa có ủy quyền ký HĐ còn hiệu lực…"* kèm link sang phân hệ Ủy quyền |
| 6.2 | Mở một HĐ đơn vị ký của **ĐV Kết cấu** (vd. `407/2026/HDTV` nếu có, hoặc sửa HĐ 410 đổi đơn vị thực hiện → ĐV Kết cấu) | Dòng **xanh**: *"✓ Đ.6.2 — Ủy quyền ký hợp lệ: Hoàng Văn E (QĐ UQ-01/2026/QĐ-VKH), hiệu lực đến 31/12/2026"* |
| 6.3 | Trong form Sửa HĐ 410: giữ cấp ký "Đơn vị ký", đổi qua lại đơn vị thực hiện | Cảnh báo vàng/xanh đổi theo ngay trong form (không cần lưu) |
| 6.4 | (Tùy chọn) Vào **Ủy quyền**, tạo ủy quyền `ky-hop-dong` cho một người thuộc ĐV Địa kỹ thuật, quay lại HĐ 410 | Cảnh báo chuyển xanh |

## KB7 — Liên danh: thông báo P.KHKT (Đ.4.7)

*Mở HĐ `409/2026/HDTV` → tab **Liên danh (Đ.5.3)**. Seed sẵn 2 đối tác.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 7.1 | Nhìn đầu tab | Banner **đỏ**: *"Đ.4.7 … 1 đối tác liên danh chưa ghi nhận văn bản thông báo P.KHKT… Vi phạm bị xử lý theo Điều 14"* |
| 7.2 | Nhìn 2 dòng | "Kỹ thuật địa chấn Nhật-Việt": ✓ `86/TB-KHKT` xanh; "QH-Structural": badge đỏ *"Chưa thông báo Đ.4.7"* |
| 7.3 | Thêm đối tác mới, điền số + ngày văn bản TB KHKT ngay trong form | Lưu xong hiện ✓ xanh, banner đỏ vẫn đếm đúng số dòng còn thiếu |

## KB8 — Checklist phân phối & lưu trữ HĐ (Đ.6.3)

*Mở HĐ `408/2026/HDGD` (Viện ký, ngày ký hôm nay) → tab **Phân phối HĐ (Đ.6.3)**.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 8.1 | Nhìn thanh hạn đầu tab | *"Hạn chuyển lưu HĐ (Đ.6.3): +30 ngày"*, còn ~30 ngày, nền xám (chưa gấp) |
| 8.2 | Bấm **"HĐ bản giấy (5 nơi nhận)"** | Sinh 5 dòng đúng Đ.6.3: P.TH ĐV chủ trì, P.TH ĐV phối hợp, P.TCHC 02 bộ, P.TCKT, P.KHKT bản scan |
| 8.3 | Tick 2 dòng | Gạch ngang + ngày gửi hôm nay; đếm *"đã gửi 2/5 nơi"* |
| 8.4 | Mở HĐ `410` (đơn vị ký) cùng tab → tạo checklist | Chỉ có nút **"Tạo checklist ĐV ký"** → sinh đúng 2 dòng (P.TH lưu + thống kê KHKT) |
| 8.5 | Xem HĐ `403/2026/HDTC` cùng tab | Mẫu **quá hạn**: thanh đỏ *"QUÁ HẠN … ngày"* (HĐ ký lâu chưa nộp) |

## KB9 — Đối chiếu CCNN khi chọn chủ trì (Đ.7.4)

*Seed sẵn: Vũ Thị F có chứng chỉ `KSXD-00999-TEST` **hết hạn 01/06/2025**; Ngô Văn Kiên/Bùi Thị Lan **không có** chứng chỉ.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 9.1 | Sửa HĐ bất kỳ → ô "Chủ trì hợp đồng" chọn **Vũ Thị F** | Ngay dưới ô hiện: *"⚠ Khảo sát địa chất công trình (hang-2) — HẾT HẠN 01/06/2025"* chữ đỏ |
| 9.2 | Đổi sang **Ngô Văn Kiên** | Cảnh báo vàng: *"Đ.7.4: nhân sự này chưa có chứng chỉ năng lực/hành nghề trong hồ sơ"* |
| 9.3 | Đổi sang **Trần Cao Cường** (có CC hợp lệ) | Dòng ✓ tên chứng chỉ + hạn, không cảnh báo |

## KB10 — CTV ngoài Viện + HĐ giao khoán (Đ.7.6)

*Mở một HĐ có phiếu giao việc (vd. tạo phiếu ở tab **Giao việc (Đ.7)** của HĐ 408) → bảng CTV.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 10.1 | Thêm CTV, tick **"CTV ngoài Viện"**, **bỏ trống** số HĐ giao khoán → Lưu | **Bị chặn**: *"Điều 7.6 QC 2815: CTV ngoài Viện bắt buộc phải có HĐ giao khoán…"* |
| 10.2 | Nhập số HĐ giao khoán (vd. `GK-05/2026`) → Lưu | Lưu được, cột "Ngoài Viện (Đ.7.6)" hiện badge xanh dương *"Giao khoán: GK-05/2026"* |
| 10.3 | Thêm CTV thường (không tick) | Cột hiện "—" |

## KB11 — Trang Tài chính đúng Bảng 1 (Giai đoạn 0.3/0.4)

*Vào **Tài chính**.*

| # | Thao tác | Kỳ vọng |
|---|---|---|
| 11.1 | Bảng "Phân bổ dòng tiền" | Mỗi HĐ có cột **Nhóm HĐ**; tỷ lệ đúng Bảng 1 (N2F = 59/15/26%, N3 = 89/6/5%, N1A = 89/7/4% trên số đã thực thu) |
| 11.2 | Khối "Cơ cấu giá trị HĐ theo Nhóm" | Thanh % tính từ dữ liệu thật, không còn Margin cố định 22/35/18/14% |
| 11.3 | HĐ chưa gán nhóm (nếu có) | Dòng vàng "Chưa phân nhóm" + cảnh báo tổng số HĐ chưa phân nhóm |

---

## Dọn dữ liệu test sau khi nghiệm thu

Toàn bộ bản ghi seed có tiền tố `[TEST]` (hợp đồng 408/409/410, gói thầu, đăng ký đầu mối, liên danh) và chứng chỉ `KSXD-00999-TEST`. Xóa bằng SQL:

```sql
delete from lien_danh where ten_doi_tac like '[TEST]%';
delete from hop_dong where ten_hop_dong like '[TEST]%';
delete from dau_thau where ten_goi_thau like '[TEST]%';
delete from dang_ky_dau_moi where ten_co_hoi like '[TEST]%';
delete from chung_chi_hanh_nghe where so_chung_chi = 'KSXD-00999-TEST';
-- Giữ lại: 2 tài khoản khkt/tckt, ủy quyền UQ-01, phân loại khách hàng (dữ liệu vận hành thật)
```

*(SLA và checklist phân phối gắn với HĐ test sẽ tự xóa theo do khóa ngoại `on delete cascade`.)*
