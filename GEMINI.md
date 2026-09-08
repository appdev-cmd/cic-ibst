# IBST ERP — Quy tắc dự án (Dành cho Antigravity & AI Pair Programmer)

> ⚠️ **QUY ĐỊNH CHUNG:** Mọi quy tắc trong tài liệu này áp dụng **BẮT BUỘC**.
> Đồng bộ quy trình với dự án `cic-erp-contract` của CIC.

---

## 🇻🇳 Ngôn ngữ (BẮT BUỘC)

> Mọi tài liệu kế hoạch triển khai, rà soát, báo cáo, migration comment và artifact khác **PHẢI viết bằng tiếng Việt**.
> Code, tên biến/hàm/file dùng tiếng Anh hoặc tiếng Việt không dấu theo nếp sẵn có của repo
> (`hopDongId`, `phanBoHopDong`, `fn_kiem_soat_ky_giao_viec`...).
> ❌ KHÔNG viết kế hoạch hay báo cáo bằng tiếng Anh.

---

## ⚠️ Git Push (BẮT BUỘC mỗi khi user nói "push", "push github", "đẩy code")

Luôn tuân thủ đúng quy trình, KHÔNG ĐƯỢC bỏ bước nào:

```
1. git pull origin main          ← pull trước
2. git add .                     ← stage changes
3. git status                    ← kiểm tra files
4. git commit -m "type: mô tả"   ← commit (feat/fix/docs/refactor/chore)
5. git pull origin main          ← pull lại phòng conflict
6. git push origin main          ← push
```

> ❌ KHÔNG BAO GIỜ push thẳng mà không pull trước và sau commit.
> Dự án làm việc **trực tiếp trên `main`** (trunk-based), không bắt buộc tạo nhánh/PR cho mỗi thay đổi.
> Bước 2 `git add .` chỉ dùng khi toàn bộ thay đổi trong cây làm việc đều thuộc việc đang làm.
> Nếu trong repo còn thay đổi dở dang của người khác thì **stage đúng file của mình**, không `add .` bừa.

---

## 🗄️ Migration CSDL (BẮT BUỘC)

Chi tiết xem `scripts/README.md`. Tóm tắt bắt buộc:

```
export SUPABASE_ACCESS_TOKEN="sbp_..."      (hoặc lấy từ .env)
node scripts/apply_migration.js supabase/migrations/00XX_ten_migration.sql
```

- Mọi migration phải **idempotent**: `create table if not exists`, `add column if not exists`,
  `drop policy if exists` trước `create policy`, `drop trigger if exists` trước `create trigger`.
- **KHÔNG seed dữ liệu mẫu trong migration.**
- Sau khi chạy, **kiểm chứng bằng truy vấn thật** (`information_schema`, `pg_policies`, `pg_proc`),
  đừng chỉ tin việc "chạy không báo lỗi" — bài học từ migration 0012.
- Bật RLS **cùng lúc** với lệnh tạo bảng cho dữ liệu nhạy cảm (nhân sự, Đảng - Đoàn thể, tài chính),
  không để tồn tại khoảng thời gian bảng mở.

> ⚠️ Chạy SQL qua Supabase Management API thì `fn_vai_tro()` trả `chuyen-vien` (không có `auth.uid()`),
> nên mọi kiểm tra vai trò đều chặn — **không cô lập được từng quy tắc RLS bằng SQL**.
> Các chốt chặn theo vai trò phải kiểm chứng end-to-end trên trình duyệt với tài khoản thật.

---

## 🧾 Nguồn sự thật của số liệu (BẮT BUỘC)

> Một đại lượng chỉ được có **một** nơi ghi. Số tổng hợp phải là **số dẫn xuất** từ chứng từ,
> giữ bằng trigger CSDL — không nhập tay, không để tầng ứng dụng tự cộng song song.

Ví dụ đang áp dụng: `hop_dong.da_thanh_toan` do trigger `trg_dot_thanh_toan_dong_bo` (migration 0034)
cộng từ `dot_thanh_toan` có ngày thực thu.

> Bối cảnh: trước đó cột này có hai nơi ghi (service cộng đúng, form ghi đè bằng ô nhập tay để trống),
> khiến **cả 17/17 hợp đồng về 0** trong khi chứng từ ghi nhận 32,32 tỷ đã thu — trang Tài chính báo
> doanh thu 0 và công nợ 100% suốt thời gian dài.

---

## 🪟 Slide Panel (BẮT BUỘC)

> Mọi **view chi tiết** và **biểu mẫu thêm/sửa** dùng **slide panel**, không dùng `Modal` hay cột cố định.
> Dùng hook `useSlidePanelForm` / `useSlidePanelChiTiet` từ `hooks/useSlidePanelCrud.ts`.

- Mỗi panel phải truyền `storageKey` riêng để nhớ độ rộng người dùng đã kéo.
- Panel biểu mẫu xếp chồng lên panel chi tiết; panel dưới thu thành "tai thỏ", không bị đóng.
- ❌ KHÔNG dùng `window.prompt` / `window.alert` để nhập liệu nghiệp vụ.
- ❌ KHÔNG bỏ `pointer-events-auto` trên tay kéo đổi độ rộng — container ngăn xếp đặt
  `pointer-events-none`, thiếu dòng này thì kéo giãn không hoạt động (lỗi đã từng xảy ra).

---

## ♻️ Tái sử dụng khuôn mẫu sẵn có (BẮT BUỘC)

Trước khi viết mới, dùng lại:

| Việc | Dùng |
|---|---|
| Nạp dữ liệu bất đồng bộ | `hooks/useAsyncData.ts` |
| CRUD thêm/sửa/xóa | `hooks/useCrudForm.ts` |
| Tìm kiếm / lọc / phân trang | `hooks/useTableControls.ts` |
| Slide panel | `hooks/useSlidePanelCrud.ts` |
| Định mức, phân bổ, chế tài QC 2815 | `lib/qc2815.ts` — **nguồn sự thật duy nhất**, không tự đặt tỷ lệ |
| Luồng ký giao việc Đ.7.1c | `lib/kyGiaoViec.ts` (khớp trigger `fn_kiem_soat_ky_giao_viec`) |
| Rà soát tuân thủ quy chế | `lib/canhBao2815.ts` — chỉ **đề xuất**, không tự ghi phiếu phạt |

> ⚠️ `useAsyncData` trả `data = fallback` trong lúc đang nạp — **không phân biệt được với "chưa có dữ liệu"**.
> Khi effect có nhánh "chưa có thì tạo mới", **bắt buộc** chờ `loading === false` trước khi tạo,
> nếu không sẽ ghi đè dữ liệu thật (lỗi đã từng phá nội dung phiếu giao việc thật trên production).

---

## 🌗 Thiết kế Giao diện & Chế độ Tối / Dark Mode (BẮT BUỘC)

> ⚠️ Mọi tính năng giao diện mới **BẮT BUỘC kiểm thử trên cả 3 theme**:
> 1. `nature` (Bảo vệ mắt - nền cát ấm `#FCF9F2`)
> 2. `light` (Sáng - nền trắng thuần `#ffffff`)
> 3. `dark` (Tối - Navy slate `#0f1117` / `#1f2332`)

### 1. Quy tắc Đường viền (Border Contrast)
- Nền dark surface là `#1f2332` thì viền mặc định `--border-default` **phải tối thiểu `#38425d`** (độ tương phản rõ ràng).
  - ❌ **CẤM** đặt viền tối tiệp màu nền như `#222533` (lỗi kinh điển làm "tàng hình" mọi khung lưới ngày, viền bảng và viền thẻ).
  - Viền phụ `--border-subtle`: tối thiểu `#2a3246`.
  - Hiệu ứng shadow thẻ ở Dark Mode: phải có viền vi mô `--shadow-card: 0 1px 3px 0 rgb(0 0 0 / 0.45), 0 0 0 1px rgb(255 255 255 / 0.08)`.
- Khi dựng lưới (Grid), bảng (Table), danh sách ngày tháng hoặc thẻ card:
  - Luôn bổ sung variant `dark:border-slate-700/80` (hoặc `border-border` dựa trên token đã chuẩn hóa).
  - Bảng dữ liệu: `thead tr` dùng `dark:bg-slate-900/60`, `tbody` dùng `dark:divide-slate-700/80`, từng hàng có `hover:bg-muted/40 dark:hover:bg-slate-800/40`.

### 2. Phân định Trạng thái bằng Nền (State Separation)
- ❌ **CẤM** dùng opacity quá mờ cho nền tối trung tính (ví dụ: `dark:bg-slate-800/10` hay `dark:bg-slate-800/20` gần như trong suốt và không phân biệt được với nền xung quanh).
- Khi có các ô/phần tử khác trạng thái (như ngày ngoài tháng vs ngày trong tháng):
  - Ngày trong tháng: `bg-surface` (`#1f2332`).
  - Ngày ngoài tháng: `dark:bg-slate-900/50 text-ink-muted/50`.
  - Ngày hiện tại (Today): `dark:bg-primary-950/30 ring-1 ring-primary/40 dark:ring-primary/60`.
- Mọi hover tương tác phải có `dark:hover:` rõ rệt: `hover:bg-muted/20 dark:hover:bg-slate-800/40`.

### 3. SlidePanel & Modal / Popover
- SlidePanel, Dialog, Popover phải có viền ngăn cách cạnh trái / khung bao: `border-l border-border dark:border-slate-700/80`.

---

## ✅ Trước khi báo hoàn thành (BẮT BUỘC)

1. `npx tsc -b --noEmit` sạch.
2. `npm run build` sạch.
3. Kiểm chứng trên trình duyệt với dữ liệu thật (dev server có auto-login qua `.env`).
4. Dọn sạch dữ liệu test đã tạo trong quá trình kiểm thử.
5. Báo cáo trung thực: việc nào chưa xong, chỗ nào còn giả định — nói rõ, không nói vống.

---

## 📚 Tài liệu nghiệp vụ

| Tài liệu | Nội dung |
|---|---|
| `docs/quy-che-ibst-2815.md` | Quy chế 2815/QĐ-VKH — căn cứ nghiệp vụ gốc của phân hệ Hợp đồng |
| `docs/review-module-hop-dong-2026-09.md` | Rà soát & kế hoạch hoàn thiện module Hợp đồng |
| `docs/ke-hoach-hoan-thien-ph5-nhan-su-dang-doan-the.md` | Kế hoạch phân hệ Nhân sự & Đảng - Đoàn thể |
| `docs/chuan-du-lieu-theo-BXD.md` | Khung dữ liệu theo QĐ 942/945/946 Bộ Xây dựng |
| `scripts/README.md` | Cách chạy migration và những sai lầm đã gặp |
