# ĐÁNH GIÁ HIỆN TRẠNG & KẾ HOẠCH HOÀN THIỆN CÁC MODULE — IBST ERP

*Ngày đánh giá: 14/07/2026 — dựa trên mã nguồn thực tế (`src/`) và CSDL Supabase (3 migration).*

> **CẬP NHẬT 15/07/2026 — ĐÃ HOÀN THÀNH CẢ 3 GIAI ĐOẠN.**
> - **GĐ1**: 7 module nghiệp vụ đạt mức A− (CRUD thật + KPI thật + tìm kiếm/lọc/phân trang); migration 0004 RLS ghi.
> - **GĐ2** (migration 0005): đợt thanh toán + công nợ hợp đồng; quy trình phiếu LIMS (kết quả theo chỉ tiêu, chuyển trạng thái, in phiếu); mốc nghiệm thu đề tài; đính kèm văn bản qua Supabase Storage; CRUD chứng chỉ hành nghề; sơ đồ tổ chức theo phân công Phó Viện trưởng (PA-B).
> - **GĐ3** (migration 0006): phân quyền 4 vai trò + siết RLS (bỏ đọc anon, quản trị-only cho danh mục/vai trò, nhật ký chỉ lãnh đạo); trang Cài đặt (người dùng/danh mục/nhật ký); Dashboard + Tài chính + Báo cáo dùng số liệu thật (đã gỡ `data/mock.ts`) + xuất CSV + cổng tra cứu kết quả; tìm kiếm toàn cục Ctrl+K; chuông thông báo việc sắp/quá hạn.
>
> Mỗi hạng mục đã type-check sạch và kiểm thử trực tiếp trên trình duyệt với Supabase thật.

---

## PHẦN 1. ĐÁNH GIÁ HIỆN TRẠNG

### 1.1. Nền tảng chung (đã ổn)

| Hạng mục | Trạng thái |
|---|---|
| React 19 + Vite 7 + Tailwind + TypeScript | ✅ Chạy ổn, type-check sạch |
| Kết nối Supabase (Auth + PostgREST) | ✅ Hoạt động, có auto-login dev |
| CSDL: 12 bảng chuẩn hóa theo khung dữ liệu BXD | ✅ Có dữ liệu mẫu đầy đủ |
| Đăng nhập / phiên làm việc | ✅ 1 tài khoản `admin@ibst.vn` |
| Design system (3 theme sáng/bảo vệ mắt/tối) | ✅ Đồng bộ với `qlda-ddcn-ht` |
| Layout, sidebar, breadcrumb | ✅ Hoàn chỉnh |

### 1.2. Bảng tổng hợp mức độ hoàn thiện 10 module

Thang đánh giá: **A** = dùng được thật · **B** = đọc dữ liệu thật, chưa thao tác được · **C** = giao diện demo, số liệu giả

| # | Module | Mức | Đọc dữ liệu | Thêm/Sửa/Xóa | KPI thật | Tìm kiếm/Lọc | Ghi chú |
|---|--------|:---:|:---:|:---:|:---:|:---:|---|
| 1 | Đơn vị - Tổ chức | **A−** | ✅ | ✅ | ✅ | ➖ | Hoàn thiện nhất; sơ đồ cây ReactFlow mới làm; còn thiếu phân công Phó Viện trưởng (chờ chốt PA A/B) |
| 2 | Nhân sự | **A−** | ✅ | ✅ | ✅ | ✅ lọc đơn vị | Thiếu: CRUD chứng chỉ hành nghề, hồ sơ chi tiết từng người |
| 3 | Văn bản - Điều hành | **B** | ✅ | ❌ nút giả | ❌ hardcode | ❌ | Chưa có đính kèm file, chưa có luồng xử lý đến/đi |
| 4 | Đề tài KHCN | **B** | ✅ | ❌ nút giả | ❌ hardcode | ❌ | Chưa cập nhật được tiến độ, chưa có mốc nghiệm thu |
| 5 | Hợp đồng dịch vụ | **B** | ✅ | ❌ nút giả | ❌ hardcode | ❌ | Có cột đã thanh toán nhưng chưa quản lý đợt thanh toán/công nợ |
| 6 | Thí nghiệm (LIMS) | **B** | ✅ | ❌ nút giả | ❌ hardcode | ❌ | Chưa có quy trình phiếu: nhận mẫu → thử → duyệt → phát hành |
| 7 | Đào tạo - Hội nghị | **B** | ✅ | ❌ nút giả | ❌ hardcode | ❌ | Chưa quản lý học viên/NCS chi tiết |
| 8 | Tổng quan (Dashboard) | **C** | ❌ mock | — | ❌ hardcode | — | Biểu đồ + KPI toàn bộ từ `data/mock.ts`, không phản ánh CSDL |
| 9 | Tài chính - Kế toán | **C** | ❌ mock | — | ❌ hardcode | — | Định hướng là lớp tổng hợp, tích hợp API kế toán HCSN sau |
| 10 | Báo cáo - BI | **C** | ❌ mock | — | ❌ hardcode | — | Toàn bộ biểu đồ dùng số liệu giả |

### 1.3. Các lỗ hổng xuyên suốt (cross-cutting)

1. **KPI hardcode**: 8/10 trang hiển thị số cứng trong code ("127,6 tỷ", "24", "312"...) — gây hiểu nhầm là số thật.
2. **5 nút "Thêm..." là nút giả** (Văn bản, Đề tài, Hợp đồng, Thí nghiệm — không mở form nào).
3. **Không có tìm kiếm / phân trang** ở mọi bảng — dữ liệu thật vài nghìn dòng sẽ không dùng nổi.
4. **Chưa dùng Supabase Storage** — không đính kèm được file (văn bản, hợp đồng, phiếu kết quả đều cần).
5. **Phân quyền sơ khai**: RLS đang mở `select` cho cả `anon` (chính sách demo); ghi/sửa/xóa chỉ mở cho 3 bảng tổ chức; chưa có khái niệm vai trò (lãnh đạo / trưởng đơn vị / chuyên viên).
6. **Tiện ích giả trên header**: ô tìm kiếm Ctrl+K, chuông thông báo, nút "Cài đặt hệ thống" — đều chưa hoạt động.
7. **Bảng `nhat_ky_du_lieu` (audit log) có sẵn nhưng chưa ghi gì.**

---

## PHẦN 2. KẾ HOẠCH HOÀN THIỆN — 3 GIAI ĐOẠN

Nguyên tắc ưu tiên: **(1)** làm thật những gì đang giả trước khi thêm mới · **(2)** ưu tiên nghiệp vụ tạo doanh thu của IBST (hợp đồng, thí nghiệm) · **(3)** tái sử dụng khuôn mẫu CRUD đã chạy tốt ở module Đơn vị/Nhân sự.

### GIAI ĐOẠN 1 — Chuẩn hóa & CRUD toàn bộ (ưu tiên cao nhất)

> Mục tiêu: không còn nút giả, không còn số giả ở các trang nghiệp vụ. Mọi bảng tra cứu được.

| # | Việc | Phạm vi |
|---|------|---------|
| 1.1 | Trích khuôn mẫu CRUD dùng chung | Tách pattern từ `DonViPage`/`NhanSuPage` thành hook + component tái sử dụng (bảng + tìm kiếm + phân trang + modal form + xác nhận xóa) |
| 1.2 | KPI tính từ dữ liệu thật | Cả 7 trang nghiệp vụ: đếm/tổng từ Supabase thay số hardcode |
| 1.3 | Tìm kiếm + lọc + phân trang | Áp cho mọi bảng (lọc theo trạng thái, đơn vị, khoảng thời gian) |
| 1.4 | CRUD Văn bản | Form thêm/sửa/xóa + RLS ghi cho `van_ban` (migration mới) |
| 1.5 | CRUD Đề tài | Gồm cập nhật % tiến độ nhanh ngay trên bảng |
| 1.6 | CRUD Hợp đồng | Gồm cập nhật số đã thanh toán |
| 1.7 | CRUD Thí nghiệm | Gồm chuyển trạng thái phiếu theo quy trình |
| 1.8 | CRUD Đào tạo | Lớp/sự kiện |
| 1.9 | Migration RLS ghi cho 5 bảng còn lại | `van_ban`, `de_tai`, `hop_dong`, `mau_thi_nghiem`, `lop_dao_tao` (+`khach_hang`) |

**Kết quả GĐ1**: 7 module nghiệp vụ đạt mức **A−** (dùng thật được).

### GIAI ĐOẠN 2 — Nghiệp vụ chuyên sâu theo đặc thù IBST

> Mục tiêu: từ "quản lý danh sách" lên "quản lý quy trình".

| # | Việc | Chi tiết |
|---|------|---------|
| 2.1 | Hợp đồng: đợt thanh toán & công nợ | Bảng mới `dot_thanh_toan`; cảnh báo hợp đồng sắp đến hạn/quá hạn; tổng hợp công nợ phải thu theo đơn vị (nuôi trang Tài chính) |
| 2.2 | LIMS: quy trình phiếu thử | Bảng `phep_thu_ket_qua`; luồng trạng thái nhận mẫu → đang thử → chờ duyệt → phát hành; in phiếu kết quả (PDF) |
| 2.3 | Đề tài: mốc & nghiệm thu | Bảng `moc_de_tai`; lịch nghiệm thu, cảnh báo trễ |
| 2.4 | Văn bản: đính kèm & luồng xử lý | Supabase Storage (bucket `van-ban`); chuyển đơn vị xử lý, hạn xử lý, nhắc việc |
| 2.5 | Chứng chỉ hành nghề: CRUD + cảnh báo | Form quản lý trong hồ sơ nhân sự; cảnh báo hết hạn 90 ngày (đã có logic đếm, làm nốt danh sách + thao tác) |
| 2.6 | Sơ đồ tổ chức: phân công Phó Viện trưởng | Chốt phương án A (config cứng) hoặc B (thêm cột DB) theo `ke-hoach-so-do-to-chuc.md` |
| 2.7 | Hồ sơ nhân sự chi tiết | Trang chi tiết từng CBVC: quá trình công tác, chứng chỉ, đề tài/hợp đồng tham gia |

**Kết quả GĐ2**: Hợp đồng + LIMS + Đề tài đạt mức **A**, phản ánh đúng quy trình thật.

### GIAI ĐOẠN 3 — Điều hành, phân quyền & hoàn thiện

> Mục tiêu: số liệu điều hành thật, an toàn dữ liệu khi nhiều người dùng.

| # | Việc | Chi tiết |
|---|------|---------|
| 3.1 | Dashboard số thật | KPI + biểu đồ doanh thu/cơ cấu tính từ `hop_dong`, `de_tai`, `mau_thi_nghiem` — xóa `data/mock.ts` |
| 3.2 | Báo cáo - BI số thật | Bộ lọc kỳ báo cáo, xuất Excel |
| 3.3 | Tài chính: lớp tổng hợp thật | Doanh thu ghi nhận theo hợp đồng/đợt thanh toán; công nợ từ 2.1 (tích hợp API kế toán HCSN để giai đoạn sau) |
| 3.4 | Phân quyền vai trò | Bảng `vai_tro` + cột trên `nhan_su`↔`auth.users`; 4 vai trò: Quản trị / Lãnh đạo Viện / Trưởng đơn vị / Chuyên viên; siết lại RLS theo vai trò + đơn vị; bỏ chính sách đọc `anon` demo |
| 3.5 | Quản lý người dùng | Trang tạo/khóa tài khoản, gán vai trò, gán đơn vị |
| 3.6 | Tiện ích header thật | Tìm kiếm toàn cục Ctrl+K (hợp đồng/phiếu/đề tài/văn bản); chuông thông báo (việc sắp đến hạn); trang Cài đặt quản lý danh mục `dm_danh_muc` |
| 3.7 | Audit log | Trigger ghi `nhat_ky_du_lieu` cho thao tác ghi ở các bảng chính; trang tra cứu nhật ký |

**Kết quả GĐ3**: hệ thống đủ điều kiện chạy thử nhiều người dùng thật tại Viện.

---

## PHẦN 3. THỨ TỰ THỰC HIỆN ĐỀ XUẤT (nếu duyệt)

Làm tuần tự theo GĐ1 → GĐ2 → GĐ3. Trong GĐ1, thứ tự: **1.1 khuôn mẫu → 1.9 RLS → 1.6 Hợp đồng → 1.7 Thí nghiệm → 1.4 Văn bản → 1.5 Đề tài → 1.8 Đào tạo → 1.2+1.3 KPI & tìm kiếm** (hợp đồng/thí nghiệm trước vì là nguồn thu chính).

Mỗi mục hoàn thành sẽ: type-check sạch + kiểm tra trực tiếp trên trình duyệt (đã có auto-login dev) + commit riêng.

---

## PHẦN 4. VIỆC CẦN ANH QUYẾT ĐỊNH

1. **Duyệt kế hoạch 3 giai đoạn** này (hoặc điều chỉnh thứ tự ưu tiên).
2. **Chốt phương án sơ đồ tổ chức** (mục 2.6): PA-A config cứng hay PA-B thêm cột DB.
3. **Phạm vi Tài chính**: xác nhận giai đoạn này chỉ làm lớp tổng hợp (3.3), chưa tích hợp phần mềm kế toán HCSN.
4. **Danh sách vai trò** (mục 3.4): 4 vai trò đề xuất đã đúng thực tế Viện chưa?
