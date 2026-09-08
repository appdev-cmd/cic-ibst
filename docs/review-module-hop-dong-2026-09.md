# REVIEW MODULE HỢP ĐỒNG & KẾ HOẠCH HOÀN THIỆN

> Rà soát ngày **08/09/2026** trên mã nguồn thực tế (`src/`) và **truy vấn trực tiếp CSDL Supabase production**.
> Căn cứ nghiệp vụ: `docs/quy-che-ibst-2815.md` (QĐ 2815/QĐ-VKH, hiệu lực 01/01/2026).
> Tham chiếu kỹ thuật: module hợp đồng dự án **CIC ERP Contract** (`D:\01_Projects\cic-erp-contract`).
> Kế thừa và cập nhật: `docs/ke-hoach-so-hoa-quy-trinh-2815.md` (lập 31/07/2026).

---

## 1. Phương pháp rà soát

Không đánh giá theo tài liệu cũ mà kiểm chứng lại bằng ba nguồn độc lập:

1. **Lược đồ CSDL thật** — truy vấn `information_schema` trên project Supabase đang chạy: liệt kê bảng, cột.
2. **Số liệu thật** — đếm bản ghi từng bảng nghiệp vụ.
3. **Mã nguồn** — đọc `HopDongPage.tsx` (2.497 dòng), `lib/qc2815.ts`, `lib/kyGiaoViec.ts`, `lib/quyenHopDong.ts`, `services/chitiet.ts`, `services/workflow.ts`, `TaiChinhPage.tsx`.

Số liệu hiện có trong CSDL:

| Bảng | Số dòng | | Bảng | Số dòng |
|---|---:|---|---|---:|
| `hop_dong` | 17 | | `dau_thau` | 17 |
| `phieu_giao_viec` | 17 | | `dang_ky_dau_moi` | 18 |
| `dot_thanh_toan` | 27 | | `sla_theo_doi` | 69 |
| `quyet_toan_giai_doan` | 9 | | `khach_hang` | 15 |
| `phan_phoi_hop_dong` | 5 | | `hop_dong_thuong_phat` | **0** |

---

## 2. Đã tiến bộ đáng kể so với kế hoạch 31/07

Kiểm chứng lại 6 phát hiện "cần xử lý sớm" của kế hoạch cũ — **5/6 đã xử lý xong**:

| Phát hiện 31/07 | Trạng thái 08/09 | Bằng chứng |
|---|:---:|---|
| `KhachHangPage` không kết nối CSDL | ✅ Đã sửa | [KhachHangPage.tsx:191](src/pages/KhachHangPage.tsx:191) dùng `fetchKhachHang` từ `services/khachHang.ts`; bảng `khach_hang` có 15 dòng thật |
| `TaiChinhPage` phân bổ sai quy chế | ✅ Đã sửa | [TaiChinhPage.tsx:29](src/pages/TaiChinhPage.tsx:29) gọi `phanBoHopDong(h.nhomHD, ...)` từ `lib/qc2815.ts` |
| Số liệu giả (SLA, margin) | ✅ Đã gỡ | Cơ cấu doanh thu theo nhóm HĐ tính thật; SLA đọc từ `sla_theo_doi` |
| Vai trò chỉ 4 cấp | ✅ Đã mở rộng | `AuthContext` có `phong-khkt`, `phong-tckt`, `phong-tchc`, `phong-th-don-vi` |
| Ủy quyền chưa nối nghiệp vụ | ✅ Đã nối | [HopDongPage.tsx:1755](src/pages/HopDongPage.tsx:1755) `fetchUyQuyenKyHopDong(donViId)` |
| Đấu thầu chỉ là sổ ghi chép | ✅ Đã có luồng | Bảng `dang_ky_dau_moi` (18 dòng) + panel đăng ký đầu mối |

Các hạng mục GĐ2 cũng đã xong: cờ `phuc_tap` trên `hop_dong` (Đ.6.1 điều kiện 2), `so_van_ban_khkt`/`ngay_thong_bao_khkt` trên `lien_danh` (Đ.4.7), bảng `phan_phoi_hop_dong` (Đ.6.3), `chu_tri_ky_thuat_id` trên phiếu giao việc (Đ.7.5), `la_ngoai_vien`/`so_hd_giao_khoan` trên CTV (Đ.7.6).

**Không còn dữ liệu mock trong module hợp đồng** — tìm `MOCK_`/`INITIAL_` trong `HopDongPage`, `DauThauPage`, `TaiChinhPage`, `UyQuyenPage`, `Phase2Panels`, `ThucHienHopDongPanel` → 0 kết quả.

`lib/qc2815.ts` vẫn là điểm mạnh nhất: Bảng 1 đủ 11 nhóm, `phanBoHopDong`, `tranGiamGiaoChuTri` (Đ.12.4a), `canTrinhVienTruong` (Đ.6.1), `HAN_NOP_HO_SO_NGAY = 30`, `DANH_MUC_VI_PHAM` (Đ.14.2).

---

## 3. Hai lỗ hổng nghiêm trọng còn lại

### 3.1. ✅ ĐÃ SỬA (08/09/2026) — Số tiền đã thu bị ghi đè về 0 trên toàn bộ 17 hợp đồng

**Không phải rủi ro tiềm ẩn mà là lỗi đang xảy ra.** Có **hai** nơi ghi vào `hop_dong.da_thanh_toan`, mâu thuẫn nhau:

| Nơi ghi | Hành vi | Đánh giá |
|---|---|---|
| `services/chitiet.ts` → `syncDaThanhToan()` | Cộng từ các đợt đã có ngày thực thu | Đúng |
| `services/queries.ts` → `hopDongRow()` | Ghi đè bằng ô nhập tay trên form HĐ | Sai |

Nơi thứ hai ghi sau cùng nên thắng. Ô nhập tay để trống → `Number('') || 0` → **0**.

Đối soát ngày 08/09/2026 trên CSDL thật:

```
17/17 hợp đồng có da_thanh_toan = 0
 9/17 hợp đồng thực tế đã thu tiền theo chứng từ đợt thanh toán
Tổng tiền về theo chứng từ: 32.320 triệu = 32,32 tỷ đồng — bị báo thành 0
```

Hệ quả đang hiển thị trên màn hình: trang Tài chính báo **thực thu 0 đ**, **công nợ 100%** giá trị kế hoạch, và **mọi quỹ phân bổ theo Bảng 1 đều = 0** (vì `phanBoHopDong` tính trên số 0).

**Đã xử lý — migration [0034](supabase/migrations/0034_dot_thanh_toan_hoa_don_va_dong_bo_tien_ve.sql):**

- `da_thanh_toan` thành **số dẫn xuất** do trigger CSDL `trg_dot_thanh_toan_dong_bo` giữ — không phụ thuộc tầng ứng dụng nên không thể bị ghi đè sai lần nữa.
- Bỏ `da_thanh_toan` khỏi `hopDongRow()`; ô nhập tay trên form thay bằng ô chỉ đọc kèm chỉ dẫn sang tab Thanh toán.
- Bỏ `syncDaThanhToan()` ở tầng ứng dụng — chỉ còn một cơ chế duy nhất.
- Backfill: 17/17 hợp đồng khớp chứng từ; kiểm chứng trigger bằng phép thử insert/delete có assertion.

Kết quả sau khi sửa (kiểm chứng trực tiếp trên trình duyệt): thực thu **32,32 tỷ**, công nợ **40,58 tỷ**, trích nộp về Viện theo Bảng 1 **1,76 tỷ**.

> **Lưu ý cho việc rà soát sau này:** đối soát trước khi sửa cho thấy **không có hợp đồng nào** ở trạng thái "nhập tay > 0 mà không có chứng từ", nên việc chuyển sang số dẫn xuất không làm mất bất kỳ dữ liệu nào do người dùng nhập — không cần TCKT phân xử từng dòng như dự kiến ban đầu.

### 3.2. ⚠️ Toàn bộ chuỗi tài chính QT5 (Điều 11) vẫn chưa tồn tại

Kế hoạch 31/07 xếp Giai đoạn 3 là "⭐ trọng tâm, giá trị nghiệp vụ lớn nhất". Kiểm tra `information_schema` trên CSDL thật: **cả 3 bảng đều chưa được tạo**.

| Bảng theo kế hoạch | Điều khoản | Trạng thái |
|---|:---:|:---:|
| `de_nghi_xuat_hoa_don` | Đ.11.1 | ❌ Chưa có |
| `to_phan_phoi` | Đ.11.1, 11.2, 12.4a | ❌ Chưa có |
| `tam_ung` | Đ.7.7, Đ.14 TT6 | ❌ Chưa có |

Nghĩa là chuỗi bắt buộc của quy chế **chưa có mắt xích nào**:

```
BBNT → đề nghị xuất hóa đơn → TCKT xuất HĐ → tiền về
     → tờ phân phối (Bảng 1) → LĐV/GĐ duyệt → TCKT chuyển tiền (SLA 3 ngày)
     → thanh quyết toán với chủ trì → đối chiếu niên độ
```

Kéo theo các chế tài Đ.14 không thể thực thi: TT6 (lãi 130% tạm ứng quá hạn), TT7 (nghĩa vụ VAT 1 năm kể từ ngày xuất hóa đơn), TT3 (thanh lý quá niên độ kế toán) — vì hệ thống không biết ngày xuất hóa đơn, không biết khoản tạm ứng.

---

## 4. Khoảng trống còn lại theo từng điều khoản

| Điều | Yêu cầu quy chế | Hiện trạng | Mức |
|:---:|---|---|:---:|
| **Đ.11.1** | Đề nghị xuất HĐ → xuất → tiền về → tờ phân phối → chuyển tiền, mỗi việc ≤ **3 ngày làm việc** | Chưa có chuỗi; `sla_theo_doi` có hạ tầng nhưng chưa gắn điểm phát sinh TCKT | **P0** |
| **Đ.11.1** | "Chứng từ hoàn chỉnh tới đâu thanh toán tới đó" | Chưa có bộ hồ sơ chứng từ theo giai đoạn | P1 |
| **Đ.11.4** | TCKT đối chiếu số liệu doanh thu với đơn vị, chốt niên độ | Chưa có màn hình đối chiếu | P1 |
| **Đ.7.1c** | **4 nhánh** ký giao việc | Mới 2 nhánh (Viện ký / ĐV ký) — [kyGiaoViec.ts:58](src/lib/kyGiaoViec.ts:58). Thiếu nhánh KHKT soạn (HĐ phức tạp) và nhánh quản lý tập trung | P1 |
| **Đ.8.2** | Đóng dấu sơ bộ khi HĐ chưa ký xong, phải có chấp thuận LĐV/GĐ, hoàn tất trong 30 ngày | Không có cột nào trên `hop_dong` | P1 |
| **Đ.8.3** | Trưởng ĐV là chủ trì → phải giao Phó ĐV quản lý HĐ đó | Chưa có quy tắc chặn tự phê duyệt | P1 |
| **Đ.8.4** | Hồ sơ phân 3 loại (pháp lý / kỹ thuật / tài chính); HS tài chính lưu ĐV, HS pháp lý-kỹ thuật nộp Viện hàng năm sau thanh lý | `LOAI_HO_SO_OPTIONS` là danh sách phẳng 7 mục ([chitiet.ts:818](src/services/chitiet.ts:818)), chưa có nhóm và chưa có nhắc nộp lưu trữ | P2 |
| **Đ.10** | Kiểm tra nội bộ **2 cấp**: đơn vị tự kiểm + Viện kiểm tra định kỳ/đột xuất | `kiem_tra_noi_bo` không có cột cấp kiểm tra; chưa có kế hoạch kiểm tra năm | P2 |
| **Đ.13** | Thưởng: thi thiết kế 1% ≤ 50tr; PVQLNN tập thể A/B/C (50–100tr / 30tr / 20tr); cá nhân A/B/C (30/20/10tr) theo **điểm nhiệm vụ** | `lib/qc2815.ts` chỉ có danh mục **phạt**, không có danh mục **thưởng**; `hop_dong_thuong_phat` 0 dòng | P2 |
| **Đ.14 TT6-7** | Lãi 130% tạm ứng quá hạn; VAT 1 năm | Không tính được (thiếu `tam_ung`, ngày xuất hóa đơn) | P0 (theo 3.2) |
| **Đ.14.4** | Chậm ≥ 5 nhiệm vụ (ĐV) / ≥ 4 (cá nhân) PVQLNN → **hạ một bậc thi đua** | `nhiem_vu_pvqlnn` có, bảng `thi_dua` vừa tạo ở PH5, nhưng **chưa nối** | P2 |
| **Đ.12.2** | PVQLNN không có HĐ, không kinh phí → trả lương chuyên gia theo TT 04/2025, chi khác thực thanh thực chi | Chưa số hóa | P3 |
| **Bảng 1 GC4** | HĐ thầu phụ: Viện giữ 3% (Viện ký) / 1% (ĐV ký) | Chưa có cờ "hợp đồng thầu phụ" | P2 |
| **Bảng 1 GC5** | Công ty cổ phần: nhóm 2 giao 97%, nhóm 3 giao 98% | Chưa có nhánh riêng cho pháp nhân công ty CP | P3 |

---

## 5. Đối chiếu `cic-erp-contract` — cái gì đáng mượn

Dự án tham chiếu quản lý hợp đồng theo mô hình doanh nghiệp (KPI doanh thu, biên lợi nhuận, PAKD). Không bê nguyên schema, nhưng **4 cơ chế dưới đây giải đúng những gì IBST đang thiếu**:

| Cơ chế bên `cic-erp-contract` | Vấn đề IBST nó giải | Cách chuyển đổi |
|---|---|---|
| **Trường tài chính dẫn xuất** — `invoicedAmount`, `cashReceived`, `receivables`, `advanceAmount` tính từ bảng con (`types/contract.ts:234-238`) | Lỗ hổng 3.1 — `da_thanh_toan` nhập tay | Bỏ ô nhập tay, tính `da_thanh_toan` từ `dot_thanh_toan`; thêm "đã xuất hóa đơn" và "tạm ứng" như trường dẫn xuất |
| **Rule engine cảnh báo bất thường** — `lib/contractAnomalies.ts`: 17 luật (`overdue_payment`, `accepted_no_invoice`, `receivable_large`, `overdue_advance`, `allocation_mismatch`...), ngưỡng cấu hình trong bảng `contract_anomaly_rules`, merge với mặc định trong code | Đ.14 hiện phải phát hiện vi phạm thủ công; `hop_dong_thuong_phat` 0 dòng suốt 9 tháng vận hành | Viết `lib/canhBao2815.ts` với luật theo quy chế: quá 30 ngày nộp HĐ (Đ.6.3), SLA KHKT 1 ngày (Đ.9.6c), SLA TCKT 3 ngày (Đ.11.1), nghiệm thu chưa xuất HĐ, VAT quá 1 năm (TT7), tạm ứng quá hạn (TT6), phân phối lệch Bảng 1 (TT4) → tự **đề xuất** phiếu phạt cho người có thẩm quyền duyệt |
| **Sinh việc theo mốc ngày** — `contractTaskDefinitionService.ts`: `MilestoneBaseDateType` = `signed_date` / `acceptance_date` / `invoice_date` / `advance_completed`... sinh nhắc việc theo mốc | Các hạn định lượng của quy chế (30 ngày, 3 ngày, 1 ngày, 6 giờ, 1 năm) hiện chỉ hiển thị tĩnh | Sinh bản ghi `sla_theo_doi` tự động tại đúng thời điểm phát sinh, thay vì tạo thủ công |
| **Hồ sơ thanh toán** — `payment_dossiers` + `payment_dossier_vendors` | Đ.11.1 "chứng từ hoàn chỉnh tới đâu thanh toán tới đó" | Bộ chứng từ gắn từng đợt thanh toán, đủ chứng từ mới cho chuyển tiền |
| *(tham khảo thêm)* `contractExportService.ts` dùng `xlsx` | Đ.6.3 thống kê HĐKT tuần/tháng gửi KHKT | `BaoCaoKhktPanel` đã có màn hình, bổ sung xuất Excel |
| *(tham khảo thêm)* `ContractForm` 4 bước + `StepIndicator` | Form HĐ IBST hiện là một modal dài | Cân nhắc chia bước khi form phình thêm ở Đợt 2 |

> Lưu ý khác biệt bản chất: `cic-erp-contract` tính **biên lợi nhuận** để ra quyết định kinh doanh; IBST phân bổ theo **định mức Bảng 1** đã được quy chế ấn định. Không mượn phần `margin`/PAKD/`profit_margin_*` — vô nghĩa với đơn vị sự nghiệp.

---

## 6. Kế hoạch hoàn thiện — 5 đợt

Nguyên tắc: **sửa cái đang sai trước khi thêm cái mới**; mỗi đợt tự đóng gói (migration + service + UI + kiểm chứng trên CSDL thật).

### ✅ Đợt 1 — Chốt nguồn sự thật của số tiền — HOÀN THÀNH 08/09/2026

| # | Việc | Kết quả |
|:---:|---|---|
| 1.1 | Mở rộng `dot_thanh_toan` | Đã thêm `so_hoa_don`, `ngay_xuat_hoa_don`, `nguoi_xac_nhan_id`. Không thêm cột `trang_thai` — trạng thái đợt (kế hoạch / quá hạn thu / đã xuất HĐ chờ thu / đã thu) **suy ra từ mốc ngày**, tránh thêm một nguồn có thể lệch nữa |
| 1.2 | `da_thanh_toan` thành số dẫn xuất | Trigger `trg_dot_thanh_toan_dong_bo`; gỡ khỏi `hopDongRow()`; ô nhập tay → ô chỉ đọc |
| 1.3 | Đối soát 17 HĐ | 17/17 khớp chứng từ sau backfill; không mất dữ liệu người dùng nhập (xem §3.1) |
| 1.4 | "Đã xuất hóa đơn" + công nợ VAT | Cột số hóa đơn / ngày xuất trên bảng đợt; dòng tổng "Đã xuất HĐ chưa thu"; cảnh báo khi có số hóa đơn mà thiếu ngày xuất (không tính được mốc VAT 1 năm) |

**Đã kiểm chứng:** `tsc -b` + `vite build` sạch; trigger có phép thử insert/delete với assertion; đối chiếu CSDL sau backfill 0 dòng lệch; kiểm tra trực tiếp trên trình duyệt với dữ liệu thật (Tài chính 32,32 tỷ; badge trạng thái đợt; cảnh báo thiếu ngày xuất hóa đơn). Dữ liệu test đã dọn sạch.

### Đợt 2 — Chuỗi tài chính QT5 (P0, ~3 tuần) ⭐ trọng tâm

| # | Việc | Kỹ thuật | Điều |
|:---:|---|---|:---:|
| 2.1 | `de_nghi_xuat_hoa_don` | Gắn HĐ + đợt thanh toán + BBNT; luồng: chủ trì lập → phụ trách KT đơn vị xác nhận → TCKT xuất (số HĐ, ngày xuất) | Đ.11.1 |
| 2.2 | `to_phan_phoi` | Tự tính từ `phanBoHopDong()` trên số tiền về; cho điều chỉnh trong trần `tranGiamGiaoChuTri()`; duyệt: HĐ Viện ký → TCKT trình LĐV; HĐ ĐV ký → GĐ duyệt | Đ.11.1-2, 12.4a |
| 2.3 | `tam_ung` | Khoản tạm ứng theo HĐ, hạn hoàn, **tự tính lãi 130%** khi quá hạn | Đ.7.7, 14 TT6 |
| 2.4 | SLA TCKT 3 ngày | Sinh `sla_theo_doi` tự động tại 3 điểm: nhận đề nghị xuất HĐ, nhận đủ hồ sơ tờ phân phối, chuyển tiền | Đ.11.1 |
| 2.5 | Công nợ VAT | Danh sách hóa đơn đã xuất mà bên A chưa trả; đếm ngược 1 năm nghĩa vụ VAT của chủ trì | Đ.14 TT7 |
| 2.6 | Đối chiếu niên độ | Màn hình TCKT ↔ đơn vị: doanh thu hoàn thành, HĐ nghiệm thu trong niên độ; cảnh báo thanh lý quá niên độ | Đ.11.4, 14 TT3 |

**DoD:** chạy trọn một hợp đồng thật từ BBNT đến thanh quyết toán với chủ trì, không thao tác ngoài hệ thống.

### ✅ Đợt 3 — Hoàn thiện QT3 & QT4 — HOÀN THÀNH 08/09/2026

Migration [0035](supabase/migrations/0035_qt3_qt4_bon_nhanh_ky_dau_so_bo_kiem_tra.sql) + mã nguồn:

| Hạng mục | Điều | Kết quả |
|---|:---:|---|
| **Đủ 4 nhánh ký giao việc** | Đ.7.1c | Hàm `fn_nhanh_ky_giao_viec` (CSDL) + `nhanhKyGiaoViec()` (`lib/kyGiaoViec.ts`) chọn nhánh theo `phuc_tap` / `quan_ly_tap_trung` / `cap_ky`. Nhánh B (P.KHKT soạn → Viện trưởng ký) và D (Trưởng ĐV đề xuất → LĐV ký) rút gọn còn 2 bước; A và C giữ 4 bước. Trigger `fn_kiem_soat_ky_giao_viec` viết lại theo từng nhánh. Form hợp đồng hiển thị ngay nhánh sẽ áp dụng khi tick cờ |
| **Đóng dấu sơ bộ** | Đ.8.2 | 4 cột trên `hop_dong` + trigger `fn_kiem_soat_dau_so_bo` chặn theo cấp ký (LĐV cho HĐ Viện ký, GĐ đơn vị cho HĐ đơn vị ký), tự ghi ngày để đếm ngược hạn 30 ngày |
| **Trưởng ĐV = chủ trì** | Đ.8.3 | Cột `pho_don_vi_quan_ly_id` + chốt chặn tại bước **phê duyệt phiếu giao việc** (không chặn lúc nhập liệu để khỏi cản công việc) |
| **Phân 3 nhóm hồ sơ** | Đ.8.4 | `LOAI_HO_SO_OPTIONS` gắn nhóm pháp lý / kỹ thuật / tài chính; panel hồ sơ hiện nhãn nhóm + nơi lưu; hợp đồng đã thanh lý thì nhắc số tệp thuộc diện nộp lưu trữ Viện (hồ sơ tài chính lưu tại đơn vị) |
| **Kiểm tra nội bộ 2 cấp** | Đ.10 | Cột `cap_kiem_tra` (đơn vị/Viện) + `theo_ke_hoach` + `nam_ke_hoach`; form và bảng biên bản phân biệt rõ |

**Đã kiểm chứng trên trình duyệt với tài khoản quản trị:**
- Bật/tắt cờ trong form → chỉ báo nhánh đổi đúng **A → D → B** (đúng thứ tự ưu tiên B > D > C/A).
- Chốt chặn Đ.8.3 chặn thật một **vi phạm có sẵn trong dữ liệu**: HĐ `501/2026/HDTV-VTB` có chủ trì Lê Văn C đồng thời là Trưởng đơn vị Trung tâm Tư vấn chống ăn mòn — bấm "Lãnh đạo Viện phê duyệt" hiện đúng thông báo Điều 8.3 và phiếu không được duyệt.

> **Lưu ý khi tự kiểm thử bằng SQL:** chạy qua Supabase Management API thì `fn_vai_tro()` trả `chuyen-vien` (không có `auth.uid()`), nên mọi kiểm tra vai trò đều chặn — không cô lập được từng quy tắc. Phải kiểm chứng end-to-end trên trình duyệt với tài khoản thật.

### 🐛 Lỗi mất dữ liệu phát hiện trong lúc kiểm thử Đợt 3 — ĐÃ SỬA

`PhieuGiaoViecForm` dùng `useAsyncData(... , null)`: trong lúc đang nạp, `data` = `null` — **không phân biệt được với "hợp đồng chưa có phiếu"**. Effect khởi tạo phiếu dự thảo chạy ngay khi mở tab và gọi `upsertPhieuGiaoViec`, **ghi đè nội dung phiếu thật bằng chuỗi mặc định** `"Giao việc thực hiện hợp đồng <số HĐ>"`.

Bằng chứng từ `nhat_ky_du_lieu`: phiếu của HĐ `102/2026/HDTV-VKCT` bị mất nội dung gốc *"Thẩm tra mô hình kết cấu 3D SAP2000/ETABS…"* lúc **07/09/2026 08:25** — trước phiên rà soát này, tức lỗi đã âm thầm phá dữ liệu thật trong vận hành.

- **Sửa:** thêm cờ `loading` vào điều kiện — chưa nạp xong thì không khởi tạo.
- **Khôi phục:** cả 2 phiếu bị ghi đè đã được phục hồi nguyên trạng từ `nhat_ky_du_lieu` (bảng audit của migration 0001 chứng minh giá trị đúng cơ chế truy vết QĐ 942 đã thiết kế).
- **Kiểm chứng:** sau bản vá, mở lại tab Giao việc không sinh thêm bản ghi UPDATE nào làm đổi nội dung.

### Đợt 4 — Thưởng, phạt & cảnh báo tự động (P2, ~2 tuần)

- **Danh mục thưởng Đ.13** vào `lib/qc2815.ts` (đối xứng với `DANH_MUC_VI_PHAM` đã có): 1% ≤ 50tr; PVQLNN tập thể A/B/C; cá nhân A/B/C theo **điểm nhiệm vụ** (+1 hoàn thành / −1 chậm) — tính điểm tự động từ `nhiem_vu_pvqlnn`.
- **`lib/canhBao2815.ts`** — rule engine theo mẫu `contractAnomalies.ts`, ngưỡng cấu hình trong DB, quét toàn bộ HĐ và **đề xuất** phiếu thưởng/phạt để người có thẩm quyền duyệt (không tự ghi phạt).
- **Nối Đ.14.4 với `thi_dua`**: ĐV chậm ≥ 5 / cá nhân ≥ 4 nhiệm vụ PVQLNN → gắn cờ hạ một bậc khi bình xét.
- **Chế tài chủ trì** (Đ.14): đếm HĐ chủ trì không hoàn thành trách nhiệm; > 1 → cảnh báo khi được chọn làm chủ trì HĐ mới.
- **Cờ thầu phụ** (Bảng 1 GC4): giữ 3%/1% theo cấp ký.

### Đợt 5 — Báo cáo điều hành & in biểu (P3, ~1 tuần)

- Xuất Excel báo cáo HĐKT tuần/tháng cho KHKT (Đ.6.3) — bổ sung vào `BaoCaoKhktPanel` đã có.
- In theo mẫu Viện: phiếu trình ký, QĐ giao việc, tờ phân phối (nền `lib/print.ts` đã có).
- Dashboard giao ban: HĐ quá hạn nộp hồ sơ, SLA vi phạm, công nợ VAT, tạm ứng quá hạn.

---

## 7. Ma trận ưu tiên

| Ưu tiên | Hạng mục | Lý do |
|:---:|---|---|
| ~~P0~~ ✅ | ~~Đợt 1~~ | Đã xong 08/09 — số tiền đã về đúng nguồn chứng từ |
| **P0** | **Đợt 2** | **Việc lớn còn lại.** Điều 11 là phần quy chế ràng buộc chặt nhất (SLA 3 ngày, chế tài TT3/TT6/TT7) mà hệ thống chưa đụng tới. Đang chờ mẫu tờ phân phối + phiếu đề nghị xuất hóa đơn từ P.TCKT |
| ~~P1~~ ✅ | ~~Đợt 3~~ | Đã xong 08/09 — đủ 4 nhánh ký, Đ.8.2/8.3/8.4, kiểm tra 2 cấp |
| P2 | Đợt 4 | Có giá trị khi đã có đủ dữ liệu từ Đợt 1–3 để phát hiện vi phạm |
| P3 | Đợt 5 | Tiện ích, không chặn nghiệp vụ |

**Phụ thuộc:** 1.1 → 1.2 → 2.1 → 2.2 → 2.4; 2.1 → 2.5; Đợt 1+2 → Đợt 4 (không đủ dữ liệu thì rule engine vô nghĩa).

Tổng: **~9 tuần** cho 1 dev fullstack + 0,5 BA. Đợt 1+2 (P0) là **~4 tuần** đầu.

---

## 8. Rủi ro

| Rủi ro | Mức | Xử lý |
|---|:---:|---|
| ~~Đổi `da_thanh_toan` thành số dẫn xuất làm lệch số của 17 HĐ~~ | ~~Cao~~ | **Đã xử lý.** Đối soát cho thấy không HĐ nào có số nhập tay cần giữ lại → chuyển đổi không mất dữ liệu |
| Vẫn còn 2 hợp đồng dữ liệu test `[TEST-FULL]` trong CSDL production, đang được tính vào KPI 72,9 tỷ | Trung bình | Không phải dữ liệu do tôi tạo. Cần xác nhận với người tạo trước khi xóa |
| Rule engine tự sinh phiếu phạt gây tranh cãi nội bộ | Trung bình | Chỉ **đề xuất**, người có thẩm quyền duyệt mới thành phiếu phạt; ghi rõ căn cứ điều khoản trên từng đề xuất |
| Mức thưởng/phạt và ngưỡng thay đổi theo quyết định mới của Viện | Trung bình | Không hardcode: đưa ngưỡng vào bảng cấu hình như `contract_anomaly_rules` bên dự án tham chiếu |
| Đơn vị đã quen thao tác ngoài hệ thống (Excel, email) cho khâu hóa đơn/phân phối | Trung bình | Đợt 2 phải chạy thử trọn vẹn 1 HĐ thật với TCKT trước khi bắt buộc toàn Viện |
| Chưa chốt được mẫu tờ phân phối và phiếu đề nghị xuất hóa đơn hiện hành | Trung bình | Lấy mẫu giấy đang dùng từ TCKT trước khi vào Đợt 2 (điều kiện tiên quyết) |

---

## 9. Ngoài phạm vi kế hoạch này

- Tích hợp hóa đơn điện tử với nhà cung cấp HĐĐT (chỉ ghi nhận số/ngày hóa đơn, chưa phát hành).
- Tích hợp phần mềm kế toán HCSN (MISA Mimosa hoặc tương đương) — theo lộ trình PH5 của kế hoạch tổng thể.
- Ký số hợp đồng điện tử (Đ.3.2m) — cần hạ tầng CA và quyết định riêng của Viện.
- Quy chế nội bộ từng đơn vị (Đ.4.4) — mỗi đơn vị một quy chế, số hóa sau khi các đơn vị ban hành.
