# KẾ HOẠCH SỐ HÓA QUY TRÌNH QC 2815 VÀO PHÂN HỆ HỢP ĐỒNG – KHÁCH HÀNG – TÀI CHÍNH

*Căn cứ: `docs/luu-do-quy-trinh-ibst-2815.md` (6 quy trình + RACI + Bảng 1) — Rà soát mã nguồn ngày 31/07/2026.*

---

## PHẦN A — KẾT QUẢ RÀ SOÁT HIỆN TRẠNG PHẦN MỀM

### A.1. Tổng quan mức độ số hóa theo 6 quy trình

| Quy trình | Mức độ số hóa | Đánh giá ngắn |
| :--- | :---: | :--- |
| QT1 — Thị trường & Hồ sơ dự thầu | ~30% | Có sổ đăng ký gói thầu (`DauThauPage`), **chưa có luồng đăng ký đầu mối → KHKT → Lãnh đạo Viện** |
| QT2 — Xây dựng & Ký kết HĐ | ~70% | Đã có phân nhóm HĐ, cấp ký, trình duyệt Điều 6.1, liên danh, hạn 30 ngày. **Thiếu bước thẩm tra KHKT có SLA, checklist phân phối HĐ Đ.6.3, kiểm tra ủy quyền khi đơn vị ký** |
| QT3 — Giao việc & Phân công nhân sự | ~65% | Phiếu giao việc có luồng ký 4 bước, CTV, đơn vị phối hợp, trần 12.4a, khóa phiếu đã duyệt. **Thiếu 4 nhánh ký (mới có 1), chủ trì kỹ thuật, HĐ giao khoán CTV ngoài, đối chiếu CCNN tự động** |
| QT4 — Thực hiện & Kiểm tra nội bộ | ~55% | Có tiến độ, kiểm tra nội bộ + khắc phục, lưu trữ hồ sơ, tệp hồ sơ theo loại. **Thiếu đóng dấu sơ bộ (Đ.8.2), quy tắc Trưởng ĐV = Chủ trì (Đ.8.3), phân loại 3 loại hồ sơ & nộp lưu trữ hàng năm (Đ.8.4)** |
| QT5 — Nghiệm thu, phân phối DT, quyết toán | ~40% | Có đợt thanh toán, quyết toán giai đoạn, cảnh báo phạt chứng từ. **Chuỗi nghiệp vụ TCKT (xuất hóa đơn → tiền về → tờ phân phối → thanh QT chủ trì) chưa tồn tại; trang Tài chính dùng công thức phân bổ SAI** |
| QT6 — Thưởng / Phạt | ~50% | Danh mục 8 loại vi phạm Đ.14.2 đủ, ghi nhận thưởng phạt theo HĐ. **Thiếu khen thưởng Đ.13, chế tài "cấm làm chủ trì", hạ bậc thi đua** |
| CRM Khách hàng | ~10% | **`KhachHangPage` hoàn toàn là dữ liệu mẫu trong bộ nhớ, không lưu CSDL** — trong khi hợp đồng lại tham chiếu bảng `khach_hang` thật qua `fetchKhachHangOptions` |

### A.2. Các phát hiện quan trọng (cần xử lý sớm)

1. **`KhachHangPage.tsx` không kết nối CSDL.** Toàn bộ CRUD chỉ thao tác trên mảng `INITIAL_KHACH_HANG` trong state — dữ liệu mất khi tải lại trang, và không đồng bộ với bảng `khach_hang` mà form Hợp đồng đang dùng. Đây là lỗ hổng lớn nhất của phân hệ Khách hàng.
2. **`TaiChinhPage.tsx` phân bổ kinh phí sai quy chế.** Hàm `computeContractDistribution` đoán nhóm HĐ bằng chuỗi ký tự trong số HĐ (`HĐKT`, `HĐTV`...) với tỷ lệ tự đặt, trong khi hệ thống đã có `nhomHD` chuẩn trên từng hợp đồng và thư viện `lib/qc2815.ts` (`phanBoHopDong`) đã cài đúng Bảng 1 kèm các trường hợp đặc thù. Hai nguồn cho ra hai kết quả khác nhau.
3. **Số liệu giả trên trang Tài chính:** cột "SLA TCKT: 1.5 ngày / SLA 3d" và khối "Margin 22%/35%/18%/14%" là hardcode, không tính từ dữ liệu — gây hiểu nhầm là hệ thống đang kiểm soát tự động.
4. **Mô hình vai trò chỉ có 4 cấp** (`quan-tri`, `lanh-dao`, `truong-don-vi`, `chuyen-vien`) — chưa tách được P.KHKT / P.TCKT / P.TCHC / P.Tổng hợp ĐV / Phụ trách kế toán ĐV, nên các bước "KHKT thẩm tra", "TCKT duyệt phân phối" hiện tạm quy về "trưởng đơn vị trở lên" (đã ghi chú trong `lib/kyGiaoViec.ts`). Đây là nền tảng phải mở rộng trước khi số hóa đúng RACI Điều 4.
5. **Ủy quyền (`UyQuyenPage`) đã có sổ quản lý nhưng chưa nối vào nghiệp vụ:** khi chọn `capKy = 'don-vi-ky'` hệ thống không kiểm tra "ủy quyền chung còn hiệu lực" (Đ.6.2) — nhánh DK1/DK2 của lưu đồ QT2 chưa được thực thi.
6. **Đấu thầu (`DauThauPage`) chỉ là sổ ghi chép**, chưa có luồng B2–B4 của QT1 (đăng ký đầu mối → KHKT tổng hợp → Lãnh đạo Viện cho ý kiến → phản hồi), chưa quản lý hồ sơ năng lực, chữ ký số đấu thầu (Đ.9.6g).

### A.3. Những gì đã làm tốt (giữ nguyên, tái sử dụng)

- `lib/qc2815.ts`: Bảng 1 đầy đủ 11 nhóm, đặc thù Ghi chú Bảng 1, ngưỡng trình Viện trưởng (Đ.6.1), trần giảm chủ trì (Đ.12.4a), cảnh báo phạt (Đ.14.2), hạn 30 ngày (Đ.6.3/8.2) — **đây là "nguồn sự thật" duy nhất, mọi màn hình phải dùng lại**.
- Luồng ký Phiếu giao việc 4 bước + trigger CSDL khóa phiếu đã duyệt (migrations 0015, 0019–0021).
- Slide panel chi tiết hợp đồng 10 tab (thông tin, giao việc, thanh toán, thưởng phạt, kiểm tra, hồ sơ, liên danh, lưu trữ, thực hiện, nhật ký) + nhật ký hợp đồng (audit log).
- Hạ tầng SLA (`sla_theo_doi`, migration 0016–0017) — đã có bảng, cần gắn thêm điểm phát sinh.

---

## PHẦN B — KẾ HOẠCH SỐ HÓA (5 GIAI ĐOẠN)

> Nguyên tắc: mỗi giai đoạn tự đóng gói (migration + service + UI + kịch bản test), làm xong dùng được ngay; ưu tiên sửa sai và nối chuỗi nghiệp vụ trước khi thêm màn hình mới.

### GIAI ĐOẠN 0 — Nền tảng & sửa lỗi kiến trúc (1–2 tuần)

| # | Việc | Nội dung kỹ thuật | Điều khoản |
| :---: | :--- | :--- | :---: |
| 0.1 | Mở rộng vai trò theo RACI | Thêm vai trò `phong-khkt`, `phong-tckt`, `phong-tchc`, `phong-th-don-vi`, `phu-trach-ke-toan-dv` vào `AuthContext` + bảng phân quyền; siết lại `lib/kyGiaoViec.ts` và trigger `fn_kiem_soat_ky_giao_viec` (đã có TODO sẵn) | Đ.4 |
| 0.2 | Kết nối `KhachHangPage` vào CSDL | Bổ sung cột còn thiếu vào bảng `khach_hang` (mã số thuế, phân loại, người đại diện, liên hệ, địa chỉ); viết `services/khachHang.ts` (CRUD); đếm `soHopDongDaKy` bằng truy vấn thật | — |
| 0.3 | Thay công thức phân bổ ở `TaiChinhPage` | Xóa `computeContractDistribution`, dùng `phanBoHopDong(nhomHD, ...)` từ `lib/qc2815.ts`; HĐ chưa gán nhóm → hiển thị "chưa phân nhóm" thay vì đoán | Bảng 1 |
| 0.4 | Gỡ số liệu giả | SLA TCKT và Margin tính từ dữ liệu thật (khi chưa có dữ liệu thì ẩn/ghi "chưa có dữ liệu") | — |

### GIAI ĐOẠN 1 — CRM Khách hàng & Quy trình 1 (2–3 tuần)

**1A. CRM Khách hàng hoàn chỉnh** (phân hệ Khách hàng)
- Hồ sơ 360°: tab chi tiết khách hàng (slide panel giống Hợp đồng) gồm: thông tin pháp nhân, danh sách HĐ đã ký (join `hop_dong`), tổng giá trị / đã thanh toán / công nợ theo khách hàng, lịch sử gói thầu tham gia (join `dau_thau.chuDauTuId`).
- Cảnh báo trùng mã số thuế khi thêm mới; lịch sử liên hệ (ghi chú tương tác).

**1B. Số hóa QT1 — Đăng ký đầu mối & dự thầu** (nâng cấp `DauThauPage`)
- Bảng mới `dang_ky_dau_moi`: người phát hiện cơ hội (VCNLĐ — để xét khen thưởng Đ.5.1a), đơn vị đăng ký, trạng thái luồng: `dang-ky → khkt-tiep-nhan → cho-ldv-chi-dao → giao-dau-moi / khong-tham-gia`.
- Nút hành động theo vai trò: GĐ ĐV đăng ký → `phong-khkt` tiếp nhận, báo cáo → `lanh-dao` cho ý kiến → KHKT phản hồi (B2–B4 lưu đồ QT1).
- Trên gói thầu: trường "Chủ trì lập HSDT" (B5), checklist hồ sơ năng lực (năng lực chung Viện / BC tài chính / CCNN — B6), liên kết sang tạo Hợp đồng khi `trung-thau` (B9, hiện đã có `hopDongId`).

### GIAI ĐOẠN 2 — Hoàn thiện QT2 & QT3 trên phân hệ Hợp đồng (3–4 tuần)

**2A. Quy trình ký kết (QT2)**
| Việc | Nội dung | Điều khoản |
| :--- | :--- | :---: |
| Bước thẩm tra KHKT thành trạng thái riêng | Thêm `cho-khkt-tham-tra` vào luồng phê duyệt HĐ Viện ký; tự tạo SLA `≤ 1 ngày làm việc` (và cảnh báo 6h báo lỗi) vào `sla_theo_doi` khi trình | Đ.9.6c |
| Kiểm tra ủy quyền khi đơn vị ký | Khi `capKy='don-vi-ky'`: truy vấn `uy_quyen` còn hiệu lực loại `ky-hop-dong` cho trưởng đơn vị; không có → chặn + gợi ý lập ủy quyền riêng (nhánh DK2 lưu đồ) | Đ.6.2 |
| Cờ "phức tạp / chính trị / Bộ giao" | Thêm trường boolean trên HĐ → buộc trình Viện trưởng bất kể giá trị (hiện `canTrinhVienTruong` mới xét nhóm + ngưỡng tiền, thiếu điều kiện số 2 của Bảng 2.A) | Đ.6.1 |
| Cảnh báo liên danh | HĐ có bản ghi liên danh mà chưa có "văn bản thông báo KHKT" (thêm trường ngày/số văn bản vào bảng `lien_danh`) → cảnh báo vi phạm Đ.4.7 | Đ.4.7 |
| Checklist phân phối HĐ | Bảng `phan_phoi_hop_dong`: sinh tự động danh sách nơi nhận theo loại (Viện ký điện tử / Viện ký giấy / ĐV ký — theo Đ.6.3), tick xác nhận từng nơi, đếm ngược hạn 30 ngày (tái dùng `ngayHanNopHoSo`) | Đ.6.3 |
| Thống kê HĐKT định kỳ | Báo cáo tuần/tháng cho KHKT: xuất bảng HĐ mới ký theo mẫu (in/Excel) từ dữ liệu sẵn có | Đ.6.3 |

**2B. Giao việc (QT3)**
| Việc | Nội dung | Điều khoản |
| :--- | :--- | :---: |
| 4 nhánh ký giao việc | Mở rộng `lib/kyGiaoViec.ts`: nhánh A (đã có), nhánh C (ĐV ký — đổi nhãn bước 3 thành "P.TH thẩm tra", đã gần đúng), thêm nhánh B (KHKT soạn → VT ký) và D (quản lý tập trung: GĐ đề xuất nhân sự → LĐV ký QĐ) — chọn nhánh tự động theo `capKy` + cờ phức tạp + cờ quản lý tập trung | Đ.7.1c |
| Chủ trì kỹ thuật | Thêm mục "Chủ trì kỹ thuật" (CN dự án, GS trưởng, CHT, chủ trì bộ môn) trên phiếu giao việc, kèm người duyệt | Đ.7.5 |
| CTV ngoài Viện | Trường `laNgoaiVien` + bắt buộc đính kèm HĐ giao khoán khi lưu CTV ngoài | Đ.7.6 |
| Đối chiếu CCNN tự động | Khi chọn chủ trì/chủ trì KT: truy vấn bảng chứng chỉ (`chung_chi` — đã có service) → hiển thị chứng chỉ + hạn; hết hạn/không có → cảnh báo | Đ.7.4, 7.5 |
| Thay đổi chủ trì | Hành động "Thay chủ trì" tạo phiên bản phiếu GV mới, giữ lịch sử phiếu cũ, ghi nhật ký | Đ.7.1 GC, 9.4c |

### GIAI ĐOẠN 3 — Chuỗi tài chính QT5 trên phân hệ Tài chính (4–5 tuần) ⭐ trọng tâm

Xây chuỗi nghiệp vụ dòng tiền đúng lưu đồ QT5, mỗi bước một trạng thái:

```
Nghiệm thu (BBNT) → Đề nghị xuất hóa đơn → TCKT xuất hóa đơn → Tiền về (xác nhận)
→ Tờ phân phối (tự tính theo Bảng 1) → LĐV/GĐ ĐV duyệt → TCKT chuyển tiền (SLA 3 ngày)
→ Thanh QT nội bộ với chủ trì → Đối chiếu cuối năm
```

| # | Việc | Nội dung kỹ thuật | Điều khoản |
| :---: | :--- | :--- | :---: |
| 3.1 | Bảng `de_nghi_xuat_hoa_don` | Gắn hợp đồng + đợt thanh toán + BBNT đính kèm; luồng: chủ trì lập → phụ trách KT ĐV xác nhận → TCKT xuất (số hóa đơn, ngày xuất) | Đ.11.1 |
| 3.2 | Ghi nhận tiền về | Trường trên đợt thanh toán: ngày tiền về, người xác nhận (phụ trách KT ĐV); tự cập nhật `daThanhToan` của HĐ (hiện nhập tay) | Đ.11.1 |
| 3.3 | Tờ phân phối quyết toán | Bảng `to_phan_phoi`: tự tính các quỹ từ `phanBoHopDong` (chủ trì / đơn vị / CPQL / KHTSCĐ / thuế) trên số tiền về; cho phép điều chỉnh trong trần Đ.12.4a (tái dùng `kiemTraKinhPhiChuTri`); luồng duyệt: HĐ Viện ký → TCKT trình LĐV; HĐ ĐV ký → GĐ ĐV duyệt | Đ.11.1, 11.2, 12.4a |
| 3.4 | SLA TCKT 3 ngày | Khi tờ phân phối đủ hồ sơ → tạo bản ghi `sla_theo_doi` hạn 3 ngày làm việc; quá hạn hiện cảnh báo trên trang Tài chính | Đ.11.1 |
| 3.5 | Công nợ VAT | Danh sách hóa đơn đã xuất mà bên A chưa chuyển tiền; đếm ngược 1 năm nghĩa vụ VAT của chủ trì; quá hạn → gợi ý lập thưởng phạt dòng 7 | Đ.14 TT7 |
| 3.6 | Tạm ứng | Bảng `tam_ung`: khoản tạm ứng theo HĐ, hạn hoàn, tự tính lãi 130% khi quá hạn (dòng 6a) | Đ.7.7, 14 TT6 |
| 3.7 | Đối chiếu cuối năm | Màn hình đối chiếu TCKT ↔ đơn vị: tổng doanh thu hoàn thành, HĐ đã nghiệm thu QT trong niên độ; chốt số liệu làm cơ sở BCTC; cảnh báo HĐ nghiệm thu quá niên độ (dòng 3) | Đ.11.4, 14 TT3 |
| 3.8 | Làm lại trang Tài chính | KPI thật: kế hoạch / thực thu / công nợ / trích nộp Viện (từ tờ phân phối đã duyệt); bảng SLA TCKT thật; bỏ margin hardcode | — |

### GIAI ĐOẠN 4 — QT4, QT6 & Báo cáo điều hành (2–3 tuần)

- **Đóng dấu sơ bộ (Đ.8.2):** trạng thái "đóng dấu sơ bộ" trên HĐ + văn bản chấp thuận + đếm ngược 30 ngày hoàn tất ký.
- **Quy tắc Trưởng ĐV = Chủ trì (Đ.8.3):** khi `chuTriId` trùng trưởng đơn vị → bắt buộc chọn Phó GĐ được giao ký hồ sơ, chặn tự phê duyệt.
- **Phân loại 3 loại hồ sơ (Đ.8.4):** map `LOAI_HO_SO_OPTIONS` về 3 nhóm pháp lý/kỹ thuật/tài chính; nhắc nộp lưu trữ P.TCHC hàng năm sau thanh lý (HS tài chính giữ tại ĐV).
- **Kiểm tra nội bộ 2 cấp (Đ.10):** thêm trường cấp kiểm tra (đơn vị/Viện) + kế hoạch kiểm tra năm; đã có sẵn khắc phục kiến nghị.
- **Khen thưởng Đ.13:** danh mục mức thưởng (thi thiết kế 1% ≤ 50tr; QLNN mức A/B/C...) vào bảng thưởng phạt; nguồn đề xuất từ `dang_ky_dau_moi` (người phát hiện cơ hội) và `nhiem_vu_pvqlnn`.
- **Chế tài chủ trì (Đ.14):** đếm số HĐ chủ trì "không hoàn thành trách nhiệm"; ≥ 1 → cờ cảnh báo khi được chọn làm chủ trì HĐ mới.
- **Dashboard giao ban:** HĐ quá hạn nộp hồ sơ, SLA vi phạm, công nợ VAT, thống kê HĐKT tuần/tháng cho KHKT.

### GIAI ĐOẠN 5 — Tùy chọn mở rộng

- Ký số / xuất PDF phiếu trình ký, tờ phân phối, QĐ giao việc theo mẫu Viện (đã có `lib/print.ts` làm nền).
- Thông báo (email/in-app) khi đến lượt xử lý bước workflow hoặc SLA sắp hết hạn (đã có `Notifications.tsx`).
- Báo cáo năng lực đấu thầu tổng hợp từ CCNN + lịch sử HĐ (phục vụ Đ.9.6g).

---

## PHẦN C — MA TRẬN ƯU TIÊN & PHỤ THUỘC

| Ưu tiên | Hạng mục | Lý do |
| :---: | :--- | :--- |
| P0 | 0.2 (Khách hàng vào CSDL), 0.3 (sửa phân bổ Tài chính) | Đang sai/mất dữ liệu ngay hiện tại |
| P0 | 0.1 (vai trò phòng chức năng) | Chặn mọi luồng RACI phía sau |
| P1 | Giai đoạn 3 (chuỗi tài chính) | Giá trị nghiệp vụ lớn nhất, quy chế ràng buộc chặt nhất (SLA, phạt) |
| P1 | 2A (thẩm tra KHKT + ủy quyền + phân phối HĐ) | Hoàn thiện vòng đời ký kết |
| P2 | Giai đoạn 1 (CRM + QT1), 2B (4 nhánh giao việc) | Mở rộng phạm vi số hóa |
| P3 | Giai đoạn 4, 5 | Hoàn thiện & tiện ích |

**Phụ thuộc chính:** 0.1 → (2A, 2B, 3.3); 0.2 → 1A; 0.3 → 3.3/3.8; 3.1→3.2→3.3→3.4 tuần tự theo chuỗi nghiệp vụ.

---

*Tài liệu lập ngày 31/07/2026 trên cơ sở rà soát mã nguồn thực tế (nhánh `main`, commit `63bdd94`).*
