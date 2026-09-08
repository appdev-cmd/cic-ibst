---
trigger: always_on
description: Quy chuẩn bắt buộc về độ tương phản và hiển thị giao diện tối (Dark Mode)
---

# Quy chuẩn Thiết kế Dark Mode — IBST ERP

> ⚠️ Áp dụng **BẮT BUỘC** cho mọi component, bảng, lịch, thẻ và view được tạo mới hoặc chỉnh sửa.

## 1. Quy tắc Độ tương phản Viền (Border Contrast)
- Nền dark surface mặc định là `#1f2332`.
- Biến `--border-default` tối thiểu phải là `#38425d`. Tuyệt đối **KHÔNG ĐƯỢC** dùng `#222533` (lệch màu chỉ 1%, viền tàng hình).
- Biến `--border-subtle` tối thiểu là `#2a3246`.
- Mọi component có đường bao hoặc chia ô (Month Grid, Week Column, Table, Card, Nav, Search):
  - Dùng `border-border` hoặc bổ sung rõ ràng `dark:border-slate-700/80`.
  - Phân cách hàng bảng: `dark:divide-slate-700/80`.
  - Header bảng: `dark:bg-slate-900/60 text-ink border-b border-border dark:border-slate-700/80`.

## 2. Phân biệt Trạng thái & Phân cấp Thị giác
- **Ngày trong tháng vs ngoài tháng**:
  - Ngày trong tháng: `bg-surface` (`#1f2332`).
  - Ngày ngoài tháng: `dark:bg-slate-900/50 text-ink-muted/50`.
- **Ngày hiện tại (Today)**:
  - `dark:bg-primary-950/30 ring-1 ring-primary/40 dark:ring-primary/60`.
- **Hiệu ứng Hover**:
  - `dark:hover:bg-slate-800/40` (không bao giờ dùng hover màu sáng trắng trên nền dark).
- **SlidePanel**:
  - Luôn có viền mép trái `border-l border-border dark:border-slate-700/80`.
