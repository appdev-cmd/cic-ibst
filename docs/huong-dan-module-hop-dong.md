# Hướng dẫn Module Quản lý Hợp đồng (Phân hệ 2)

> Tuân thủ Quy chế 2815/QĐ-VKH ngày 01/12/2025 (hiệu lực 01/01/2026).
> Đường dẫn: `/hop-dong` — file chính: [`src/pages/HopDongPage.tsx`](../src/pages/HopDongPage.tsx)

---

## 1. Tổng quan 3 tab cấp cao

| Tab | Nội dung |
|---|---|
| **Quản lý Hợp đồng & QC 2815** | Danh sách hợp đồng, panel chi tiết, form Thêm/Sửa |
| **Khách hàng & CRM Tiềm năng** | Quản lý khách hàng, cơ hội tiềm năng |
| **Báo cáo KHKT (Đ.6.3)** | Bảng tổng hợp HĐKT theo đơn vị, xuất CSV gửi Phòng KHKT |

---

## 2. Tạo mới hợp đồng

Bấm **"+ Thêm hợp đồng"** → điền form theo 6 khối:

| Khối | Trường | Ghi chú |
|---|---|---|
| **Thông tin hợp đồng** | Số HĐ *, Nhóm HĐ (Bảng 1), Tên HĐ * | Nhóm HĐ quyết định toàn bộ tỷ lệ phân bổ kinh phí |
| **Khách hàng & đơn vị** | Khách hàng, Đơn vị thực hiện, Chủ trì, Giá dự thầu | Giá dự thầu để trống = mặc định lấy Giá trị HĐ |
| **Tài chính** | Giá trị HĐ, Đã thanh toán | **Đơn vị tính: triệu đồng** (không phải VNĐ) |
| **Thời hạn** | Ngày ký, Hạn hoàn thành, Ngày nộp hồ sơ gốc, Hạn nộp chứng từ quyết toán | Hạn nộp hồ sơ (Điều 6.3) tự tính = Ngày ký + 30 ngày, **không** liên quan Hạn hoàn thành |
| **Trường hợp đặc thù** | Trường hợp đặc thù, Cấp ký (Điều 6.1), 2 checkbox | Xem mục 4 |
| **Trạng thái** | Mới / Chờ duyệt / Đang thực hiện / Hoàn thành / Quá hạn | |

⚠️ **Lưu ý đơn vị tiền tệ**: mọi trường tài chính trong form (Giá trị HĐ, Đã thanh toán, Kinh phí giao...) đều nhập bằng **triệu đồng**. Ví dụ hợp đồng 6 tỷ → nhập `6000`.

---

## 3. Panel chi tiết hợp đồng — 10 tab

Bấm vào 1 dòng trong bảng để mở panel chi tiết (dạng slide-panel, có thể kéo giãn chiều rộng, xếp chồng "tai thỏ" khi mở đồng thời panel Sửa).

| # | Tab | Nội dung | Điều khoản |
|---|---|---|---|
| 1 | **Thông tin chung** | Tổng quan, luồng phê duyệt Điều 6.1, cảnh báo phạt trễ hạn | Đ.6.1, 14.2 |
| 2 | **Giao việc** | Bảng phân bổ Bảng 1, Phiếu giao việc, đơn vị phối hợp, luồng ký 4 cấp | Đ.7 |
| 3 | **Thanh toán & QT** | Đợt thanh toán, quyết toán từng giai đoạn, đánh dấu thanh lý | Đ.11, 12.1 |
| 4 | **Thưởng / Phạt** | Sổ ghi quyết định thưởng/phạt, 8 loại vi phạm có sẵn | Đ.13, 14 |
| 5 | **Kiểm tra nội bộ** | Biên bản kiểm tra định kỳ/đột xuất | Đ.10 |
| 6 | **Hồ sơ** | Tệp đính kèm theo loại (hồ sơ dự thầu, HĐ, biên bản...) | Đ.8.4 |
| 7 | **Liên danh** | Thông tin liên danh nhà thầu (nếu có) | Đ.5.3 |
| 8 | **Lưu trữ TCHC** | Hồ sơ lưu trữ vật lý tại Phòng TCHC | Đ.8 |
| 9 | **Thực hiện** | Mốc hạn SLA tự sinh (Đ.6.3/9.6c/11.1) + báo cáo tiến độ/khối lượng/chất lượng/ATLĐ | Đ.8.1 |
| 10 | **Nhật ký** | Vết mọi thay đổi (ai, lúc nào, giá trị cũ → mới) — chỉ đọc, do CSDL tự ghi | Đ.9, 10 |

---

## 4. Cấp ký hợp đồng (Điều 6.1)

Mỗi hợp đồng có 1 trong 2 cấp ký:

- **Viện ký** — Viện trưởng hoặc Phó Viện trưởng ký. **Bắt buộc** với hợp đồng Nhóm 1 (giám định, kiểm định theo yêu cầu cơ quan chức năng; nhiệm vụ PVQLNN) — chọn "Đơn vị ký" cho Nhóm 1 sẽ bị cảnh báo ngay trên form.
- **Đơn vị ký** — Trưởng đơn vị ký theo phân cấp/ủy quyền.

Ảnh hưởng tới **tỷ lệ giao khoán** (Ghi chú 6, Bảng 1): nếu hợp đồng **không thuộc Nhóm 1** và **do Viện ký theo đề nghị của đơn vị**, tick thêm ô "Đơn vị tự yêu cầu Viện ký" sẽ tự động giảm tỷ lệ giao khoán (0,5% Nhóm 2 / 0,2% Nhóm 3-4). Ô này **tự khóa** khi Cấp ký = Đơn vị ký, vì Ghi chú 6 chỉ áp dụng khi Viện ký.

---

## 5. Ngưỡng trình Viện trưởng phê duyệt (Điều 6.1)

Hệ thống tự động so **Giá trị HĐ** (hoặc Giá dự thầu nếu khác) với ngưỡng theo nhóm:

| Nhóm | Ngưỡng |
|---|---|
| N1a — Giám định, kiểm định sự cố | ≥ 2,0 tỷ |
| Nhóm 2 — Tất cả hợp đồng tư vấn | ≥ 5,0 tỷ |
| Nhóm 3 — Thi công | ≥ 10,0 tỷ |

Vượt ngưỡng → badge **"QC 2815 Trình VT"** hiện trên bảng danh sách, banner Điều 6.1 hiện trên tab Thông tin chung với 2 nút:

1. **"Đánh dấu đã trình"** — bất kỳ vai trò nào cũng bấm được
2. **"Xác nhận đã duyệt"** — **chỉ Lãnh đạo Viện / Quản trị** thấy nút này (vai trò khác chỉ thấy dòng chữ giải thích lý do)

Chốt chặn thẩm quyền nằm ở **cả 2 tầng**: giao diện ẩn nút, và trigger CSDL `fn_kiem_soat_tham_quyen_hop_dong` chặn nếu ai đó gọi thẳng API.

---

## 6. Phiếu giao việc & luồng ký 4 cấp (Điều 7)

Trong tab **Giao việc**:

1. **Phân bổ theo Bảng 1** — tự tính theo Nhóm HĐ đã chọn: % Chủ trì, % Đơn vị, CPQL Viện, Khấu hao TSCĐ, Thuế GTGT
2. **Đơn vị thực hiện & tỷ lệ chia giá trị** (Điều 7.1) — nếu HĐ do nhiều đơn vị cùng thực hiện, thêm từng đơn vị + vai trò (Chủ trì/Phối hợp) + tỷ lệ %. Hệ thống cảnh báo nếu tổng ≠ 100% hoặc có quá 1 đơn vị chủ trì.
3. **Phiếu giao việc** — nhập Chủ trì kỹ thuật, Kinh phí giao, Nội dung. Nếu kinh phí giao thấp hơn mức trần cho phép giảm (Điều 12.4a: tối đa 2% Nhóm 1, 5% Nhóm 2, 2% Nhóm 4), hệ thống cảnh báo ngay.
4. **Luồng ký** (Điều 7.1c) — sau khi lưu phiếu, thanh tiến trình 5 bước xuất hiện:

   ```
   1. Chủ trì soạn → 2. Trưởng đơn vị xác nhận → 3. KHKT thẩm tra → 4. Chờ Lãnh đạo Viện duyệt → 5. Đã duyệt
   ```

   Mỗi nút chuyển bước chỉ hiện với vai trò đủ thẩm quyền (chốt ở cả giao diện lẫn trigger CSDL `fn_kiem_soat_ky_giao_viec`):
   - Bước 2 (xác nhận): Trưởng đơn vị trở lên
   - Bước 3 (thẩm tra): Trưởng đơn vị trở lên *(hệ thống hiện chưa tách riêng vai trò Phòng KHKT/Tổng hợp — xem mục 8)*
   - Bước 4 (phê duyệt): **Lãnh đạo Viện** nếu HĐ Viện ký, **Trưởng đơn vị** nếu HĐ đơn vị ký

   Có thể **"Trả lại để sửa"** ở bất kỳ bước trung gian nào, kèm lý do.

---

## 7. Thanh toán & Quyết toán (Điều 11)

- **Đợt thanh toán** — mỗi đợt có ngày dự kiến/thực thu; tổng các đợt đã thu tự động cộng vào "Đã thanh toán" của hợp đồng
- **Quyết toán từng giai đoạn** (Điều 12.1) — "chứng từ hoàn chỉnh tới đâu thanh toán tới đó": ghi % hoàn thành từng giai đoạn
- **Đánh dấu quyết toán/thanh lý** — nút riêng, **chỉ Lãnh đạo Viện/Trưởng đơn vị/Quản trị** thao tác được

---

## 8. SLA tự động & theo dõi thực hiện (Điều 8.1, 6.3, 9.6c, 11.1)

Tab **Thực hiện** hiển thị 2 phần:

**a) Hạn xử lý theo Quy chế** — do trigger CSDL tự sinh, **không nhập tay**:

| SLA | Hạn | Sinh ra khi |
|---|---|---|
| Nộp hồ sơ HĐ gốc về Viện (Đ.6.3) | Ngày ký + 30 ngày | Tạo hợp đồng mới |
| KHKT kiểm tra, ký tắt (Đ.9.6c) | +1 ngày làm việc | Phiếu giao việc vào bước "KHKT thẩm tra" |
| TCKT giải quyết quyết toán (Đ.11.1) | +3 ngày làm việc | Đánh dấu "đã quyết toán" |

Trạng thái: **Đang chạy** / **Đạt hạn** / **Vi phạm hạn** — tự chuyển khi hoàn tất công việc tương ứng, có so sánh với hạn chót.

**b) Tiến độ, khối lượng, chất lượng, ATLĐ** (Điều 8.1) — nhập tay theo từng kỳ báo cáo: % khối lượng, đánh giá chất lượng (Đạt/Cần khắc phục/Không đạt), có sự cố ATLĐ hay không.

---

## 9. Báo cáo KHKT (Điều 6.3)

Tab riêng ở đầu trang, tổng hợp **tự động từ dữ liệu đang có** (không cần nhập gì thêm), nhóm theo đơn vị thực hiện:

- Số HĐ, Tổng giá trị, Đã thu, Còn phải thu
- Số HĐ quá hạn nộp hồ sơ, số HĐ chờ duyệt Viện trưởng, số HĐ đã quyết toán

Có nút **"Xuất CSV"** để gửi kèm báo cáo giao ban tuần/tháng.

---

## 10. Nhật ký truy vết (Điều 9, 10)

Tab **Nhật ký** — chỉ đọc, ghi tự động bởi trigger CSDL mỗi khi có `INSERT`/`UPDATE`/`DELETE` trên hợp đồng: loại thao tác, thời điểm, vai trò người thực hiện, và **diễn giải rõ trường nào đổi từ giá trị gì sang giá trị gì** (vd. "Trạng thái phê duyệt: chưa trình → đã duyệt").

---

## 11. Ma trận thẩm quyền (tham chiếu nhanh)

| Thao tác | Điều | Vai trò tối thiểu |
|---|---|---|
| Trình duyệt hợp đồng | 6.1 | Chuyên viên |
| Phê duyệt hợp đồng (vượt ngưỡng) | 6.1 | **Lãnh đạo Viện** |
| Trưởng đơn vị xác nhận phiếu giao việc | 7.1c | Trưởng đơn vị |
| KHKT thẩm tra phiếu giao việc | 7.1c, 9.6c | Trưởng đơn vị* |
| Phê duyệt Quyết định giao việc (HĐ Viện ký) | 7.1c | **Lãnh đạo Viện** |
| Phê duyệt Quyết định giao việc (HĐ đơn vị ký) | 7.1c | Trưởng đơn vị |
| Quyết toán / thanh lý hợp đồng | 11 | Trưởng đơn vị |
| Ghi/sửa đơn vị phối hợp | 7.1 | Trưởng đơn vị |

*\* Hệ thống hiện có 4 vai trò (`quan-tri`, `lanh-dao`, `truong-don-vi`, `chuyen-vien`), chưa tách riêng Phòng KHKT/Tổng hợp — bước thẩm tra tạm quy về "Trưởng đơn vị trở lên". Xem [`src/lib/kyGiaoViec.ts`](../src/lib/kyGiaoViec.ts) để siết lại khi bổ sung vai trò phòng chức năng.*

Mọi chốt chặn thẩm quyền đều có **2 lớp**: ẩn/khóa nút ở giao diện (UX) + trigger từ chối ở CSDL (bảo mật thật). Không được chỉ tin vào lớp giao diện.

---

## 12. Các quy tắc tính toán tự động (tham chiếu)

Toàn bộ nằm trong [`src/lib/qc2815.ts`](../src/lib/qc2815.ts):

- `timDinhMuc(nhom)` — tra định mức Bảng 1 theo nhóm HĐ
- `phanBoHopDong(...)` — tính phân bổ kinh phí, có xử lý trường hợp đặc thù (thầu phụ, công ty cổ phần, khảo sát địa chất...)
- `canTrinhVienTruong(...)` — kiểm tra vượt ngưỡng Điều 6.1
- `canhBaoCapKy(...)` — cảnh báo Nhóm 1 mà chọn Đơn vị ký
- `kiemTraKinhPhiChuTri(...)` — đối chiếu trần giảm giao chủ trì Điều 12.4a
- `ngayHanNopHoSo(ngayKy)` — hạn nộp hồ sơ = ngày ký + 30 ngày (Điều 6.3)
- `canhBaoPhatNopChamHoSo(...)`, `canhBaoPhatChungTuTre(...)` — gợi ý mức phạt Điều 14.2

---

## 13. Giới hạn đã biết

- Vai trò Phòng KHKT/Phòng Tổng hợp chưa tách riêng khỏi "Trưởng đơn vị" (mục 11)
- Chưa có luồng đấu thầu tích hợp trực tiếp vào hợp đồng (trang Đấu thầu là module riêng, `/dau-thau`)
- Chưa có thông báo tự động (email/app) khi hồ sơ chuyển bước — người dùng cần chủ động vào kiểm tra
