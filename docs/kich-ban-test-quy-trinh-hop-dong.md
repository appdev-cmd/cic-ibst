# Kịch bản test: tạo mới hợp đồng → phê duyệt → hoàn thành

Một kịch bản duy nhất, đi hết vòng đời hợp đồng, cố tình chọn giá trị **vượt ngưỡng Điều 6.1**
và **cấp ký = Đơn vị ký** để chỉ cần 1 lần đổi tài khoản là test được cả 2 luồng thẩm quyền
(Trưởng đơn vị và Lãnh đạo Viện), đồng thời test luôn tính năng vừa sửa: **ghi đúng tên người
thật ở mỗi bước ký/duyệt** (không chỉ ngày tháng).

## Tài khoản dùng

| Tài khoản | Vai trò | Nhân sự gắn kèm | Dùng cho |
|---|---|---|---|
| `cic@ibst.vn` | Trưởng đơn vị (Viện chuyên ngành Kết cấu công trình xây dựng) | Hoàng Văn E | Hầu hết các bước |
| `admin@ibst.vn` | Quản trị (tương đương Lãnh đạo Viện) | Nguyễn Hồng Hải | Chỉ 2 bước bắt buộc phải Lãnh đạo Viện (đánh dấu ⚠️ bên dưới) |

## Các phòng chức năng của Viện tham gia gì (Điều 9 QC 2815)

Ba phòng dưới đây **có vai trò thật trong quy chế** nhưng hệ thống hiện chỉ có 4 vai trò
(Quản trị / Lãnh đạo Viện / Trưởng đơn vị / Chuyên viên) — **chưa có tài khoản riêng cho từng
phòng**. Biết rõ việc thật của từng phòng để hiểu bước nào trong app đang "đóng thế" cho phòng
nào (ghi rõ trong code `kyGiaoViec.ts`, coi là giới hạn đã biết, chưa phải bug).

| Phòng | Việc thật theo Quy chế | Bước tương ứng trong app hiện tại |
|---|---|---|
| **KHKT** — Kế hoạch Kỹ thuật (Điều 9.6) | Đầu mối tiếp nhận thông tin đấu thầu (Đ.5.1c); **kiểm tra, ký tắt hồ sơ HĐ/kỹ thuật/dự toán/quyết toán/nghiệm thu/thanh lý trong vòng 01 ngày làm việc** (Đ.9.6c); với HĐ Viện ký — **thẩm tra Phiếu giao việc** sau khi Trưởng đơn vị xác nhận, trước khi trình Lãnh đạo Viện duyệt (Đ.7.1c); hỗ trợ cân đối nhân lực; kiểm tra định kỳ toàn Viện | Nút **"KHKT thẩm tra đạt"** ở Bước 2 — hiện do chính Trưởng đơn vị bấm (đứng thay Phòng KHKT), không phải một tài khoản KHKT riêng |
| **TCKT** — Tài chính Kế toán (Điều 9.7, Đ.11.1) | Hạch toán, quản lý chứng từ thu chi; thông báo công nợ, đôn đốc thanh quyết toán; **giải quyết mỗi việc quyết toán trong vòng 03 ngày làm việc**, trình Lãnh đạo Viện ký duyệt bản phân phối quyết toán (HĐ Viện ký) | Không có bước bấm riêng trong app — nút **"Đánh dấu đã quyết toán"** ở Bước 7 gộp luôn việc mà TCKT lẽ ra trình trước |
| **TCHC** — Tổ chức Hành chính (Điều 6.3, Đ.9.8) | Nhận, lưu trữ hồ sơ hợp đồng bản gốc trong vòng 30 ngày kể từ ngày ký (Đ.6.3); đóng dấu Quyết định giao việc sau khi được phê duyệt; quản lý con dấu, chữ ký số | Tab **"Lưu trữ TCHC (Đ.8)"** ở Bước 8 (tuỳ chọn) — đăng ký lưu trữ hồ sơ tương ứng việc TCHC nhận và lưu bản gốc |

*Ghi chú:* nếu hợp đồng là **Đơn vị ký** (không phải Viện ký) thì theo Điều 9.9, việc của cả 3
phòng trên do **Phòng Tổng hợp của chính đơn vị** đảm nhiệm ở quy mô nhỏ hơn — không phải 3
phòng cấp Viện. Kịch bản dưới đây dùng HĐ Đơn vị ký nên về bản chất bước "KHKT thẩm tra đạt" là
Phòng Tổng hợp đơn vị làm, càng khớp với việc Trưởng đơn vị (`cic@ibst.vn`) tự bấm được.

---

## Bước 1 — Tạo hợp đồng mới
*(đăng nhập `cic@ibst.vn`)*

Vào **Hợp đồng & CRM** → **+ Thêm hợp đồng**, điền:

| Trường | Giá trị |
|---|---|
| Số hợp đồng | `407/2026/HDTV` |
| Tên hợp đồng | `Tư vấn giám sát thi công cải tạo trụ sở Viện KHCN Xây dựng` |
| Khách hàng | chọn bất kỳ (vd. *Công ty TNHH Phát triển THT*) |
| Đơn vị thực hiện | *Viện chuyên ngành Kết cấu công trình xây dựng* |
| Nhóm hợp đồng | **N2a. Tư vấn quản lý dự án, tư vấn đầu tư xây dựng, chuyển giao công nghệ** |
| Giá trị HĐ | `5500` (triệu đồng — **vượt ngưỡng 5.000tr Nhóm 2** → cố ý để kích hoạt Điều 6.1) |
| Ngày ký | hôm nay |
| Hạn hoàn thành | +6 tháng |
| Chủ trì hợp đồng | *Trần Cao Cường* |
| Cấp ký hợp đồng | **Đơn vị ký (phân cấp, ủy quyền)** — hệ thống tự gợi ý sẵn giá trị này vì không phải Nhóm 1 |

Lưu lại.

**Kỳ vọng:** hàng vừa tạo hiện badge đỏ **"QC 2815 Trình VT"**; mở chi tiết → tab *Thông tin
chung* → **"Người tạo hồ sơ"** phải hiện đúng **Hoàng Văn E** — tức tài khoản `cic@ibst.vn` đang
đăng nhập, KHÔNG phải Trần Cao Cường (người chỉ được *chọn làm chủ trì*, một vai trò nghiệp vụ
khác với người thật bấm nút tạo — đây chính là điểm phân biệt vừa sửa: "chủ trì" là lựa chọn
nghiệp vụ, "người tạo" là tự động ghi nhận từ tài khoản đăng nhập, không thể trùng lẫn).

---

## Bước 2 — Lập & ký Phiếu giao việc (Điều 7.1c)
*(vẫn `cic@ibst.vn` — vì Cấp ký = Đơn vị ký, Trưởng đơn vị tự làm hết được cả 4 bước)*

Tab **Giao việc (Đ.7)**:
1. Chọn **Chủ trì kỹ thuật**: *Đặng Quốc Huy*.
2. Kiểm tra **Kinh phí giao** tự gợi ý = **5.005 triệu** (= 91% × 5.500tr theo cột "Tổng giao
   đơn vị" Bảng 1, nhóm N2a) — giữ nguyên hoặc chỉnh nhẹ (không thấp hơn mức trần Điều 12.4a).
3. Điền **Ngày giao** = hôm nay, **Nội dung công việc giao** = vài dòng bất kỳ.
4. Bấm **"Lưu Phiếu giao việc"**.

Sau khi lưu, phía dưới xuất hiện khung **"Luồng ký Quyết định giao việc (Điều 7.1c)"** — bấm lần
lượt, mỗi lần xong kiểm tra tên người thực hiện hiện đúng **Hoàng Văn E** (Trưởng đơn vị):

1. **"Trình Trưởng đơn vị"**
2. **"Trưởng đơn vị xác nhận"**
3. **"KHKT thẩm tra đạt"** *(việc thật của Phòng Tổng hợp đơn vị — xem bảng phòng chức năng ở
   trên; hệ thống chưa có tài khoản riêng nên Trưởng đơn vị bấm thay)*
4. **"Trưởng đơn vị phê duyệt"** *(nhãn nút đổi thành "Lãnh đạo Viện phê duyệt" nếu Cấp ký là
   Viện ký — ở đây là Đơn vị ký nên vẫn là Trưởng đơn vị)*

**Kỳ vọng:** sau bước 4, thanh tiến trình đủ 5/5 mốc xanh; phía trên phiếu chuyển thành khung
tóm tắt **chỉ đọc**, không còn nút "Lưu" (đã khoá theo Điều 7.1c); hiện đủ 4 dòng **Người soạn /
Đơn vị xác nhận / KHKT thẩm tra / Người duyệt** — tất cả cùng là Hoàng Văn E.

---

## Bước 3 — Trình & phê duyệt Điều 6.1 (vượt ngưỡng)

**3a. Trình duyệt** *(vẫn `cic@ibst.vn`)* — Tab *Thông tin chung* → bấm **"Đánh dấu đã trình"**.
Kỳ vọng: trạng thái đổi "Đã trình, chờ duyệt", hiện ngày trình.

**3b. Phê duyệt** ⚠️ *(đăng xuất, đăng nhập lại `admin@ibst.vn` — chỉ Lãnh đạo Viện được duyệt;
nếu vẫn ở `cic@ibst.vn` thì nút "Xác nhận đã duyệt" sẽ không hiện ra, thay bằng dòng "Chờ Viện
trưởng/Phó Viện trưởng phê duyệt — Trưởng đơn vị không có thẩm quyền này")* — mở lại HĐ 407 →
bấm **"Xác nhận đã duyệt"**.
Kỳ vọng: trạng thái "Đã duyệt", hiện đúng dòng **"Ngày duyệt: ... bởi Nguyễn Hồng Hải"**.

---

## Bước 4 — Chuyển hợp đồng sang "Đang thực hiện"
⚠️ *(vẫn `admin@ibst.vn` — bước "Chờ duyệt → Đang thực hiện" trong khung Workflow Engine chỉ
Lãnh đạo Viện/Quản trị được bấm, Trưởng đơn vị không có nút này)*

Tab *Thông tin chung* → khung **"Quy trình xử lý hợp đồng"** → bấm **"Chờ duyệt"**, rồi bấm tiếp
**"Đang thực hiện"**.

---

## Bước 5 — Theo dõi thực hiện & thanh toán
*(đăng nhập lại `cic@ibst.vn`)*

- Tab **Thực hiện (Đ.8.1)**: thêm 1 dòng tiến độ, vd *"Hoàn thành 50% khối lượng khảo sát hiện
  trạng"*, ngày báo cáo hôm nay.
- Tab **Thanh toán & QT (Đ.11)**: thêm 2 đợt thanh toán, đủ tổng **5.500 triệu** (vd. tạm ứng
  1.650tr + thanh toán 3.850tr), điền ngày thực thu cho cả 2 để "Còn phải thu" về 0.

---

## Bước 6 — Hoàn thành hợp đồng
*(vẫn `cic@ibst.vn` — bước "Đang thực hiện → Hoàn thành" Trưởng đơn vị được phép)*

Khung Workflow Engine → bấm **"Hoàn thành"**.

---

## Bước 7 — Quyết toán (Điều 11.2)
*(vẫn `cic@ibst.vn` — vì Cấp ký = Đơn vị ký, theo Điều 11.2 chính Trưởng đơn vị ký duyệt quyết
toán, KHÔNG cần Lãnh đạo Viện — đây là điểm vừa sửa trong phiên trước, nên test kỹ)*

Tab *Thanh toán & QT* → xác nhận dòng "Đã thu đủ tiền" → bấm **"Đánh dấu đã quyết toán"**.

**Kỳ vọng:** nút bấm được ngay (không bị khoá) vì hợp đồng là Đơn vị ký. *(Muốn kiểm chứng
ngược lại — thử đổi Cấp ký của một hợp đồng Viện ký khác sang xem nút này có bị khoá với thông
báo "thuộc Lãnh đạo Viện (HĐ Viện ký, Điều 11.1)" hay không.)*

---

## Bước 8 — Thanh lý & lưu trữ
*(vẫn `cic@ibst.vn`)*

Khung Workflow Engine → bấm **"Thanh lý"**. Thanh tiến trình phải hiện đủ 5/5 bước "Thanh lý &
Lưu trữ".

*(Tuỳ chọn) Tab Lưu trữ TCHC (Đ.8) → "Thêm mới" đăng ký lưu trữ hồ sơ để khớp đủ Điều 8.4, tab
Kiểm tra nội bộ (Đ.10) → thêm 1 lần kiểm tra để khớp Điều 10.*

---

## Bảng đối chiếu nhanh kỳ vọng cuối cùng

| Mục | Kỳ vọng |
|---|---|
| Badge danh sách | "QC 2815 Trình VT" (vì 5.500tr > 5.000tr) |
| `buoc_hien_tai` | `thanh-ly` |
| Trạng thái phê duyệt Đ.6.1 | Đã duyệt, bởi Nguyễn Hồng Hải |
| Phiếu giao việc | Đã duyệt 5/5 bước, đủ 4 tên người thật, form khoá không sửa được |
| Quyết toán | Đã quyết toán, bấm được bởi Trưởng đơn vị (không cần Lãnh đạo Viện) |
| Người tạo hồ sơ | Hiện tên thật, không để trống |
