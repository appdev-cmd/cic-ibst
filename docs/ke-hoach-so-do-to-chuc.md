# Kế hoạch làm lại Sơ đồ tổ chức (trang Đơn vị - Tổ chức)

## 1. Vấn đề với bản hiện tại

- Màu sắc lòe loẹt (mỗi nhóm một màu: đỏ, xanh dương, xanh lá, cam...), không giống phong cách sơ đồ tổ chức chuẩn (ảnh mẫu ibst.vn dùng 1 tông xanh nhạt duy nhất, viền đơn giản).
- Cấu trúc sai: đang nhóm theo **loại đơn vị** (Lãnh đạo / Phòng chức năng / Viện chuyên ngành / Phân viện / Trung tâm / Công ty) — tức là 6 "cột" ngang hàng dưới gốc.
  Ảnh mẫu thực tế là **cây phân cấp báo cáo thật**: Viện trưởng → 3 Phó Viện trưởng → các đơn vị trực thuộc từng Phó phụ trách, xếp theo **cột dọc** dưới mỗi Phó.
- Đường nối kiểu CSS-tree nhiều nhánh rối mắt, không giống mũi tên đơn giản trong ảnh mẫu.

## 2. Giới hạn dữ liệu hiện có

Bảng `don_vi` trong Supabase **không có cột quan hệ cha–con** (không biết đơn vị nào báo cáo cho Phó Viện trưởng nào). Chỉ có:
- `loai_don_vi` (nhóm loại, không phải cấp báo cáo)
- `truong_don_vi` (người phụ trách đơn vị đó, lấy từ `nhan_su`)

Chức danh "Viện trưởng" / "Phó Viện trưởng" x3 đã có sẵn trong `nhan_su` (đơn vị "Lãnh đạo Viện", 4 người), nhưng **không có thông tin ai phụ trách khối nào**.

## 3. Vấn đề cần quyết định trước khi làm

Ảnh mẫu có 3 "PHÓ VIỆN TRƯỞNG" nhưng **4 cột đơn vị** bên dưới — nghĩa là ít nhất 1 Phó phụ trách 2 cột. Tôi không có dữ liệu để biết chính xác đơn vị nào thuộc Phó nào.

**Cần anh chọn 1 trong 2 hướng:**

### Phương án A — Cấu hình cứng (nhanh, không sửa DB)
Tạo 1 file cấu hình tĩnh trong code (`src/data/coCauToChuc.ts`) khai báo rõ: Phó Viện trưởng nào phụ trách những đơn vị nào (theo `ma_dinh_danh`), dựa đúng theo ảnh mẫu ibst.vn anh gửi. Component vẽ cây sẽ dùng file này để xếp cột, **không phụ thuộc** `loai_don_vi` nữa.
- Ưu điểm: làm ngay, không cần migration DB.
- Nhược điểm: khi tổ chức thay đổi (thêm/bớt đơn vị, đổi người phụ trách khối), phải sửa code thủ công, không sửa được qua giao diện.

➡️ **Nếu chọn phương án này, anh xác nhận giúp danh sách phân công theo đúng ảnh mẫu** (4 cột, đơn vị nào thuộc Phó nào) — tôi sẽ liệt kê để anh chốt trước khi code.

### Phương án B — Thêm quan hệ cha–con thật vào DB (đúng lâu dài, tốn công hơn)
Thêm cột `phu_trach_id` (tham chiếu `nhan_su.id`, là Phó Viện trưởng phụ trách) vào bảng `don_vi`, cập nhật dữ liệu mẫu, cập nhật form Thêm/Sửa đơn vị để chọn người phụ trách khối. Sơ đồ cây sẽ tự vẽ đúng theo dữ liệu thật, sửa được qua UI sau này.
- Ưu điểm: đúng bản chất, tự cập nhật khi đổi tổ chức, không cần sửa code.
- Nhược điểm: cần thêm migration SQL, cập nhật service (`org.ts`), cập nhật form, mất thời gian hơn phương án A.

## 4. Thiết kế trực quan mới (áp dụng cho cả 2 phương án)

- Bỏ hệ màu nhiều tông hiện tại → dùng **1 tông xanh dương nhạt** (giống ảnh mẫu: nền `primary-50`/`primary-100`, viền `primary-300`, chữ đen đậm), có thể tô đậm hơn cho khối gốc (Viện trưởng).
- Bố cục lại theo cấp bậc thật: Viện trưởng (giữa, trên cùng) → hàng ngang 3 Phó Viện trưởng → mỗi Phó có 1 cột dọc liệt kê các đơn vị phụ trách (khớp bố cục ảnh mẫu, không phải cây rẽ nhánh nhiều tầng).
- Mũi tên nối đơn giản (một đường thẳng + đầu mũi tên), không dùng kiểu "css-tree" nhiều nhánh như bản cũ.
- Click vào 1 ô đơn vị vẫn mở panel chi tiết bên dưới như hiện tại (giữ nguyên hành vi này).
- Thêm chú thích nhỏ nếu là Phương án A: "Cơ cấu tham khảo theo ibst.vn — cập nhật thủ công" để rõ đây là dữ liệu tĩnh, không phải từ CSDL.

## 5. Phạm vi kỹ thuật dự kiến

- Viết lại hoàn toàn `src/components/OrgChartTree.tsx` (bố cục cột dọc theo cấp bậc, không dùng list `LOAI_DON_VI` để nhóm nữa).
- (Phương án A) Thêm `src/data/coCauToChuc.ts`.
- (Phương án B) Thêm migration `supabase/migrations/0004_...sql`, cập nhật `src/services/org.ts`, `src/types.ts`, form trong `DonViPage.tsx`.
- Không đổi tab "Danh sách" (giữ nguyên như hiện tại).

## 6. Việc KHÔNG làm trong lần này

- Không sửa dữ liệu `nhan_su`, `loai_don_vi` hiện có.
- Không đổi cấu trúc trang khác (Nhân sự, Dashboard...).

---

**Cần anh xác nhận:** chọn Phương án A hay B, và nếu chọn A thì xác nhận danh sách phân công 4 cột theo ảnh mẫu để tôi liệt kê chính xác trước khi code.
