# KẾ HOẠCH HOÀN THIỆN UI/UX VÀ FRONTEND IBST ERP

**Phạm vi rà soát:** giao diện tổng thể, điều hướng, dashboard, Hợp đồng & CRM, Đấu thầu, Tài chính, biểu mẫu, bảng dữ liệu, slide panel, responsive và accessibility.  
**Ngày rà soát:** 17/08/2026  
**Mục tiêu:** đưa phần mềm từ trạng thái “đầy đủ nghiệp vụ nhưng dày và thiên về desktop” sang giao diện thống nhất, dễ học, dễ thao tác, dùng tốt trên laptop/tablet/mobile và có nền tảng frontend dễ bảo trì.

---

## 1. Tóm tắt điều hành

Phần mềm hiện có nền tảng tốt: màu sắc nhận diện rõ, dashboard giàu thông tin, đã có component dùng chung (`PageHeader`, `KpiCard`, `Modal`, `MasterTable`, `SlidePanelStack`), hỗ trợ theme và các luồng nghiệp vụ QC 2815 được biểu diễn trực quan.

Tuy nhiên, trải nghiệm đang bị giới hạn bởi 5 vấn đề chính:

1. **Responsive chưa đạt:** toàn bộ ứng dụng được thu nhỏ bằng `transform: scale(0.75)`, sidebar vẫn cố định trên mobile; ở viewport 390px nội dung chính chỉ còn khoảng 190px và trang rộng 520px.
2. **Mật độ chữ quá cao:** có 265 lần dùng cỡ chữ tùy ý và nhiều nội dung ở 10px (`text-2xs`), sau khi scale còn nhỏ hơn nữa; 82 phần tử dưới 12px chỉ riêng màn hình Hợp đồng.
3. **Design system chưa được đóng gói:** 1.696 lần dùng màu Tailwind trực tiếp; button, badge, alert, tab và trạng thái được tạo thủ công ở nhiều nơi.
4. **Data table/form chưa tối ưu theo nhiệm vụ:** 50 bảng HTML, 38 `min-width` cố định; form Hợp đồng có 24 trường trong một trang cuộn dài, thiếu phân nhóm theo tác vụ và chưa có điều hướng nhanh/lưu nháp rõ ràng.
5. **Accessibility còn yếu:** toàn màn hình Hợp đồng có 62/62 mục tương tác nhỏ hơn 44px do cơ chế scale; 3/3 trường lọc không có accessible label; toàn mã nguồn chỉ có 2 `aria-label`; focus keyboard và dialog semantics chưa đồng nhất.

**Ưu tiên đề xuất:** xử lý nền tảng responsive + typography + component primitives trước, sau đó mới tối ưu từng phân hệ. Không nên “trang điểm” từng màn hình trong khi cơ chế zoom và component nền vẫn chưa chuẩn.

---

## 2. Hiện trạng và điểm mạnh

### 2.1. Điểm đang làm tốt

- Nhận diện IBST/Bộ Xây dựng rõ, tone màu nghiêm túc, phù hợp phần mềm quản trị nhà nước.
- Navigation phân nhóm theo phân hệ và có breadcrumb.
- Dashboard có KPI, biểu đồ, bảng cảnh báo và bộ lọc thời gian tương đối đầy đủ.
- Luồng Hợp đồng đã có stepper, badge trạng thái, cảnh báo SLA và slide panel chi tiết.
- Dữ liệu lỗi/rỗng/loading đã có `DataState` dùng chung.
- Theme light/nature/dark và màu chủ đạo đã có token CSS.
- Nhiều bảng đã có tìm kiếm, lọc và phân trang.
- Các nghiệp vụ phức tạp được giải thích bằng microcopy và dẫn chiếu điều khoản QC 2815.

### 2.2. Số liệu rà soát frontend

| Chỉ số | Hiện trạng | Nhận định |
|---|---:|---|
| File `HopDongPage.tsx` | 2.348 dòng | Quá lớn, khó bảo trì và khó kiểm soát nhất quán UI |
| File `DetailPanels.tsx` | 1.504 dòng | Nhiều pattern CRUD lặp lại |
| File `DashboardPage.tsx` | 1.117 dòng | Dashboard khó tùy biến theo vai trò |
| Cỡ chữ tùy ý `text-[…px]` | 265 | Thiếu typography scale chuẩn |
| Màu Tailwind hardcode | 1.696 | Semantic token chưa bao phủ |
| Bảng HTML | 50 | Cần một DataTable chuẩn |
| `min-w-[…]` cố định | 38 | Làm tăng horizontal scroll |
| Nút HTML trực tiếp | 335 | Component Button chưa được chuẩn hóa |
| `aria-label` | 2 | Accessibility naming rất thiếu |

---

## 3. Phát hiện UI/UX theo mức độ

### P0 — Cản trở sử dụng

#### P0.1. Loại bỏ zoom bằng transform toàn ứng dụng

**Hiện trạng:** `#root` dùng width/height đảo tỷ lệ và `transform: scale(var(--zoom-scale, 0.75))`.  
**Tác động:** sai kích thước viewport, touch target bị thu nhỏ, slide panel phải tự bù tỷ lệ, browser zoom/accessibility hoạt động không tự nhiên, mobile bị vỡ bố cục.

**Giải pháp:**
- Đưa `#root` về `width: 100%; min-height: 100dvh; transform: none`.
- Nếu cần “compact mode”, dùng density token (`--density`) để điều chỉnh padding/row height/font có kiểm soát, không scale toàn DOM.
- Cung cấp 2 mật độ: `comfortable` và `compact`; mặc định comfortable.

#### P0.2. Responsive App Shell

**Hiện trạng:** sidebar 256px/80px luôn hiện; header và main không có chiến lược mobile.  
**Giải pháp:**
- Desktop ≥ 1280: sidebar 248px, có collapse 72px.
- Tablet 768–1279: sidebar dạng icon rail 72px, submenu flyout.
- Mobile < 768: sidebar thành drawer; header có hamburger, tiêu đề ngắn và action overflow.
- Breadcrumb rút gọn trên mobile; search chuyển thành icon mở command palette.
- AI chatbot và slide panel không che CTA/footer.

#### P0.3. Typography và touch target

**Chuẩn đề xuất:**
- Body: 14px/20px; secondary: 13px/18px; caption tối thiểu 12px/16px.
- Không dùng chữ 10px cho thông tin nghiệp vụ.
- Button/input tối thiểu 40px desktop, 44px mobile.
- Icon-only button tối thiểu 36px desktop/44px mobile và bắt buộc `aria-label` + tooltip.

#### P0.4. DataTable responsive

**Giải pháp:**
- Tạo `DataTable` duy nhất: sticky header, column visibility, sort, filter chips, loading skeleton, empty state, row action menu.
- Desktop: bảng đầy đủ, người dùng tùy chọn cột.
- Tablet: ẩn cột phụ theo priority.
- Mobile: chuyển mỗi dòng thành card/list; không ép bảng rộng rồi scroll ngang toàn trang.
- Giữ cột nhận diện chính và trạng thái luôn nhìn thấy.

#### P0.5. Form và dialog accessibility

- `Modal`/slide panel cần `role="dialog"`, `aria-modal`, `aria-labelledby`, focus trap, trả focus về nút mở và khóa scroll nền.
- `Field` sinh `id`, liên kết `label htmlFor`; lỗi dùng `aria-describedby` và `aria-invalid`.
- Có summary lỗi ở đầu form, focus vào lỗi đầu tiên sau submit.
- Keyboard: Escape đóng, Tab không thoát dialog, Enter không gây submit ngoài ý muốn.

---

### P1 — Tăng hiệu quả công việc

#### P1.1. Chuẩn hóa design system

Tạo nhóm primitives trong `src/components/ui/`:

| Component | Nội dung chuẩn hóa |
|---|---|
| `Button` | primary/secondary/outline/ghost/danger; sm/md/lg; loading |
| `IconButton` | tooltip, aria-label, touch target |
| `Input`, `Select`, `Textarea` | label, hint, error, prefix/suffix |
| `Badge`, `StatusBadge` | semantic status map tập trung |
| `Alert` | info/success/warning/error; title/action |
| `Tabs` | keyboard arrows, responsive overflow/dropdown |
| `Card` | default/interactive/metric |
| `Dialog`, `Drawer`, `Sheet` | desktop/mobile adaptive |
| `DataTable` | filter/sort/pagination/responsive columns |
| `Skeleton`, `EmptyState` | loading và zero-data nhất quán |
| `Toast` | thông báo lưu/xóa/chuyển bước |
| `ConfirmDialog` | thay `window.confirm` |

#### P1.2. Tối ưu form Hợp đồng

Chuyển form 24 trường thành wizard hoặc section navigation:

1. **Thông tin cơ bản** — số/tên HĐ, nhóm, khách hàng, đơn vị.
2. **Nhân sự & thẩm quyền** — chủ trì, cấp ký, ủy quyền, CCNN.
3. **Tài chính & tiến độ** — giá trị, ngày ký, thời gian thực hiện.
4. **Quy chế & hồ sơ** — cờ phức tạp, đặc thù, dự thảo.
5. **Kiểm tra & lưu** — summary, cảnh báo và điều kiện còn thiếu.

Yêu cầu UX:
- Header/footer sticky; hiển thị “đã nhập X/Y trường bắt buộc”.
- Lưu nháp tự động hoặc cảnh báo khi đóng có thay đổi chưa lưu.
- Chỉ hiện trường phụ thuộc khi điều kiện liên quan được chọn.
- Cảnh báo QC 2815 đặt sát trường gây ra cảnh báo, không dồn về cuối.
- Trên mobile dùng full-screen drawer, một cột.

#### P1.3. Dashboard theo vai trò

- Lãnh đạo: KPI chiến lược, ngoại lệ, công nợ, việc chờ duyệt.
- KHKT: cơ hội thị trường, HĐ chờ thẩm tra, SLA, hồ sơ thiếu.
- TCKT: tiền về, hóa đơn, công nợ, quyết toán chờ xử lý.
- Trưởng đơn vị: HĐ đơn vị, tiến độ, hồ sơ sắp hạn, nhân sự.
- Chuyên viên: “Việc của tôi”, deadline, phiếu giao việc, thông báo.

Mỗi dashboard chỉ nên có 5–7 KPI/chỉ báo ưu tiên; phần chi tiết mở bằng drill-down thay vì dồn toàn bộ lên trang đầu.

#### P1.4. Navigation theo công việc

- Giữ menu phân hệ nhưng bổ sung khu vực **Việc cần xử lý**.
- Notification click phải đi đúng bản ghi/bước cần xử lý.
- Global Search chia nhóm Hợp đồng/Khách hàng/Gói thầu/Hồ sơ và hỗ trợ recent items.
- Breadcrumb chứa action gần nhất, không chỉ tên trang.

#### P1.5. Chuẩn hóa trạng thái và hành động

- Tạo state machine presentation map duy nhất: label, màu, icon, mô tả, hành động kế tiếp.
- Mỗi màn hình ưu tiên 1 CTA chính; hành động phụ vào menu `…`.
- Thao tác nguy hiểm dùng danger style + confirm dialog nêu rõ hậu quả.
- Sau thao tác hiển thị toast có tên bản ghi và action hoàn tác nếu phù hợp.

---

### P2 — Hoàn thiện và nâng cao

- Saved views/bộ lọc đã lưu theo người dùng.
- Bulk actions cho bảng Hợp đồng, Khách hàng, Hồ sơ.
- Column chooser và export theo cột đang chọn.
- Command palette mở bằng Ctrl/Cmd+K: tìm kiếm + tạo nhanh + chuyển trang.
- Onboarding theo vai trò và tooltip giải thích lần đầu.
- Dark mode kiểm tra contrast đầy đủ; nature theme chỉ giữ nếu thật sự có nhu cầu nghiệp vụ.
- Motion giảm theo `prefers-reduced-motion`.
- Offline/slow-network feedback và retry theo từng khối dữ liệu.

---

## 4. Kiến trúc frontend mục tiêu

```text
src/
├─ components/
│  ├─ ui/                 # Button, Input, Badge, Alert, Dialog, Tabs...
│  ├─ data-table/         # DataTable, filters, pagination, mobile cards
│  ├─ forms/              # Field, FormSection, FormErrorSummary
│  └─ workflow/           # Stepper, SLA banner, NextActionCard
├─ features/
│  ├─ hop-dong/
│  │  ├─ components/
│  │  ├─ forms/
│  │  ├─ panels/
│  │  ├─ hooks/
│  │  └─ pages/
│  ├─ khach-hang/
│  ├─ dau-thau/
│  └─ tai-chinh/
├─ layouts/               # Responsive AppShell
├─ lib/                   # workflow, permissions, formatting
├─ services/              # Supabase/API adapters
└─ styles/                # tokens, utilities, print
```

Nguyên tắc:
- Page chỉ điều phối dữ liệu và layout, không chứa hàng nghìn dòng UI.
- Mỗi feature sở hữu form/panel của mình.
- Business state tách khỏi visual state.
- Không viết lại class màu/trạng thái ở từng màn hình.
- Không thêm thư viện UI nặng nếu component hiện tại có thể chuẩn hóa bằng Tailwind + React.

---

## 5. Roadmap triển khai đề xuất

### Sprint UX-0 — Chuẩn hóa và đo lường (1 tuần)

- Chốt breakpoint, density, typography, spacing, semantic colors.
- Lập inventory component/màn hình/trạng thái.
- Thiết lập checklist UI review, accessibility và visual regression.
- Chụp baseline desktop 1440×900, laptop 1366×768, tablet 768×1024, mobile 390×844.

**Đầu ra:** UI foundation spec + backlog chi tiết + bộ ảnh baseline.

### Sprint UX-1 — Responsive App Shell & accessibility nền (2 tuần)

- Bỏ transform scale toàn root.
- Xây AppShell responsive, mobile drawer, header adaptive.
- Chuẩn hóa focus ring, touch target, reduced motion.
- Nâng cấp Dialog/Drawer/SlidePanel semantics và keyboard.

**Đầu ra:** mọi route truy cập được ở 390px mà không bị sidebar ép nội dung.

### Sprint UX-2 — Component system (2 tuần)

- Button, IconButton, Field/Input/Select, Alert, Badge, Tabs, Toast, ConfirmDialog.
- Semantic color/status map.
- Story/demo page nội bộ cho component và trạng thái.
- Thay dần `window.confirm`, button/style lặp lại.

**Đầu ra:** 80% hành động phổ biến dùng component chuẩn.

### Sprint UX-3 — DataTable & list responsive (2 tuần)

- DataTable chuẩn + mobile card mode.
- Áp dụng trước cho Hợp đồng, Khách hàng, Đấu thầu, Tài chính.
- Filter chips, clear-all, result count, column priority.

**Đầu ra:** 4 phân hệ trọng tâm dùng được tốt trên tablet/mobile.

### Sprint UX-4 — Hợp đồng & CRM (2–3 tuần)

- Tách `HopDongPage.tsx` theo feature.
- Form Hợp đồng dạng step/section navigation.
- Detail panel ưu tiên “trạng thái hiện tại + việc kế tiếp”.
- CRM 360°: timeline, công nợ, hợp đồng, đầu mối liên hệ rõ hơn.

**Đầu ra:** giảm thời gian tạo HĐ, giảm lỗi nhập thiếu và giảm cuộn tìm thông tin.

### Sprint UX-5 — Đấu thầu & Tài chính (2 tuần)

- Đấu thầu: funnel/trạng thái, checklist HSDT, deadline rõ.
- Tài chính: drill-down theo HĐ/khách hàng/đơn vị, bảng công nợ ưu tiên ngoại lệ.
- Chuẩn hóa chart tooltip, legend, màu và empty/error states.

### Sprint UX-6 — Dashboard theo vai trò & polish (2 tuần)

- Dashboard cá nhân hóa theo vai trò.
- Notification deep-link và “Việc của tôi”.
- Audit WCAG 2.1 AA, keyboard-only, 200% zoom.
- Performance, lazy loading, skeleton và visual regression.

**Tổng thời gian:** khoảng 11–14 tuần cho 1 frontend developer; 7–9 tuần nếu có 2 frontend developer làm song song sau Sprint UX-1.

---

## 6. Backlog ưu tiên

| ID | Hạng mục | Ưu tiên | Công sức | Giá trị |
|---|---|---|---:|---|
| UX-001 | Bỏ root transform scale | P0 | M | Rất cao |
| UX-002 | Responsive AppShell/mobile drawer | P0 | L | Rất cao |
| UX-003 | Typography tối thiểu 12/14px | P0 | M | Rất cao |
| UX-004 | Dialog/Sheet focus trap + ARIA | P0 | M | Cao |
| UX-005 | DataTable responsive/mobile card | P0 | L | Rất cao |
| UX-006 | Button/Input/Badge/Alert primitives | P1 | L | Rất cao |
| UX-007 | Status/action map tập trung | P1 | M | Cao |
| UX-008 | Form Hợp đồng theo bước | P1 | L | Rất cao |
| UX-009 | Toast + ConfirmDialog | P1 | M | Cao |
| UX-010 | Dashboard theo vai trò | P1 | L | Cao |
| UX-011 | Saved filters/column chooser | P2 | M | Trung bình |
| UX-012 | Command palette/quick actions | P2 | M | Trung bình |
| UX-013 | Onboarding contextual | P2 | M | Trung bình |
| UX-014 | Visual regression & a11y CI | P1 | M | Cao |

---

## 7. Tiêu chí nghiệm thu

### Responsive
- Không có horizontal overflow toàn trang tại 390, 768, 1024, 1366 và 1440px.
- Mobile navigation mở/đóng bằng bàn phím và touch; nội dung dùng toàn chiều rộng.
- Bảng trọng tâm có mobile card mode, không yêu cầu scroll ngang để thực hiện tác vụ chính.

### Accessibility
- WCAG 2.1 AA cho luồng đăng nhập, tạo/sửa HĐ, phê duyệt, CRM, đấu thầu và tài chính.
- 100% field có accessible name; 100% icon button có accessible name.
- Focus indicator rõ; dialog giữ focus; thao tác chính dùng được bằng keyboard.
- Touch target tối thiểu 44×44px trên mobile.

### Consistency
- ≥ 90% button dùng component chuẩn.
- ≥ 90% badge/trạng thái dùng semantic map chung.
- Không còn cỡ chữ dưới 12px cho thông tin nghiệp vụ.
- Giảm ít nhất 70% màu hardcode ở các phân hệ trọng tâm.

### Usability
- Tạo HĐ mới hoàn tất trong ≤ 5 phút với người đã được hướng dẫn.
- Người dùng xác định “đang ở bước nào” và “việc tiếp theo là gì” trong ≤ 5 giây.
- Bộ lọc luôn có result count, trạng thái đang áp dụng và nút xóa lọc.
- Lỗi nhập liệu hiển thị tại field và có summary; không mất dữ liệu đã nhập.

### Frontend maintainability
- `HopDongPage.tsx` còn dưới 500 dòng; panel/form tách theo feature.
- Component UI có tài liệu variants/states/accessibility.
- Có test tối thiểu cho primitives, form validation, workflow action và responsive critical paths.

---

## 8. Thứ tự nên bắt đầu

1. Không sửa từng màn hình lẻ trước khi bỏ root scale.
2. Làm AppShell + typography + Dialog/Drawer trước.
3. Làm DataTable và component primitives kế tiếp.
4. Chọn Hợp đồng làm phân hệ mẫu vì phức tạp nhất.
5. Nhân pattern sang CRM, Đấu thầu và Tài chính.
6. Cuối cùng cá nhân hóa Dashboard và polish toàn hệ thống.

Đề xuất bắt đầu bằng một **“UI Foundation Sprint”** gồm UX-001 đến UX-006. Đây là gói thay đổi có tác động rộng nhất, đồng thời giảm đáng kể chi phí sửa từng màn hình về sau.
