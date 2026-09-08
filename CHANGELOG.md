# Changelog — IBST ERP

## [2026-09-08]

### Added
- **Module Lịch công tác & Sự kiện cơ quan (`/lich-co-quan`)**:
  - Hỗ trợ 6 chế độ xem: Lưới Tháng (Month Grid), Cột Tuần (Week Columns), Dòng thời gian Ngày (Day Timeline), Danh sách Lịch trình (Agenda List), Bảng Quản lý (Manage Table), và Màn hình Tivi Sảnh (Lobby TV Display).
  - Bộ lọc chip thông minh (Loại sự kiện, Phòng họp, Người chủ trì, Tìm kiếm nhanh).
  - Chuẩn hóa cố định 3 phòng họp: Phòng họp số 1, Phòng họp số 2, Hội trường lớn.
  - Tích hợp 34 sự kiện mẫu phong phú phủ khắp tháng 9/2026.
  - Tích hợp màn hình Tivi sảnh: Câu chào đón (Greeting Banner) tùy biến lưu `localStorage`, đồng hồ số thời gian thực, cột "Thành phần tham gia".
- **SlidePanel Chuẩn hóa Toàn diện**:
  - Sử dụng `useSlidePanelChiTiet` và `useSlidePanelForm` (`SlidePanelStack`).
  - Hỗ trợ tai thỏ (Tab Ear) nhận diện, co giãn chiều rộng linh hoạt (Resize Handle), phân tab nội bộ `SlideOverTabs`.

### Fixed & Enhanced
- **Sửa triệt để độ tương phản viền trong Chế độ Tối (Dark Mode)**:
  - Nâng cấp token `--border-default` từ `#222533` lên `#38425d`, `--border-subtle` lên `#2a3246`, và shadow viền vi mô `--shadow-card`.
  - Bổ sung `dark:border-slate-700/80` cho toàn bộ các ô ngày, cột tuần, bảng quản lý, thanh công cụ và SlidePanel.
  - Phân biệt rõ rệt ngày trong tháng (`bg-surface`) và ngoài tháng (`dark:bg-slate-900/50`).
- **Sửa lỗi lệch múi giờ ngày tháng (UTC+7)**:
  - Thay thế `toISOString()` bằng `formatLocalDate(d: Date)` tránh lệch ngày tại Việt Nam.
- **Tạm ẩn Cổng thông tin IBST** khỏi menu chính theo yêu cầu giai đoạn.

### Documentation & Memory
- Bổ sung quy tắc bắt buộc về **Giao diện & Chế độ Tối (Dark Mode)** vào `CLAUDE.md`.
- Khởi tạo bộ nhớ tĩnh `.brain/brain.json` và bộ nhớ phiên `.brain/session.json`.
