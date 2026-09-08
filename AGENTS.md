# IBST ERP — Agent Rules (Dùng chung cho Antigravity & Toàn bộ AI Coding Agents)

> ⚠️ Mọi quy tắc trong tài liệu này áp dụng **BẮT BUỘC** cho tất cả các AI coding assistants.
> Chi tiết toàn văn xem tại: [GEMINI.md](file:///d:/QuocAnh/2026/01.Project/cic-ibst/GEMINI.md) hoặc [CLAUDE.md](file:///d:/QuocAnh/2026/01.Project/cic-ibst/CLAUDE.md).

---

## 1. Ngôn ngữ: 100% Tiếng Việt cho kế hoạch, tài liệu và trao đổi.

## 2. Thiết kế Giao diện & Chế độ Tối (Dark Mode) - BẮT BUỘC:
- **Kiểm thử cả 3 theme**: `nature` (Bảo vệ mắt), `light` (Sáng), `dark` (Tối).
- **Quy tắc viền (Border Contrast)**: Nền surface Dark Mode `#1f2332` thì viền `--border-default` **phải tối thiểu `#38425d`**. CẤM dùng `#222533` (gây tàng hình viền).
- **Mọi ô ngày trên lịch, bảng dữ liệu, card**: Phải có viền rõ ràng qua token `border-border` hoặc class `dark:border-slate-700/80`.
- **Phân định trạng thái bằng nền**: Ngày ngoài tháng dùng `dark:bg-slate-900/50 text-ink-muted/50`, ngày trong tháng dùng `bg-surface`. Cấm dùng opacity quá mờ làm mất tương phản.
- **Hover**: Luôn có `dark:hover:bg-slate-800/40`.
- **SlidePanel**: Luôn có viền mép trái `border-l border-border dark:border-slate-700/80`.

## 3. UI Kiến trúc:
- Chi tiết và biểu mẫu bắt buộc dùng **SlidePanel** (`useSlidePanelChiTiet` / `useSlidePanelForm`), không dùng Modal thô.
- Tay kéo SlidePanel phải có `pointer-events-auto`.

## 4. Xử lý Thời gian:
- Luôn dùng `formatLocalDate(d: Date)` thay vì `toISOString()` để tránh lệch ngày tại múi giờ Việt Nam (UTC+7).

## 5. Quy trình Kiểm thử & Verification:
- Trước khi báo hoàn thành bắt buộc chạy `npm run build` đạt 0 lỗi.
