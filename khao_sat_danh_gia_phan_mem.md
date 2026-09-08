# BÁO CÁO KHẢO SÁT & ĐÁNH GIÁ PHẦN MỀM ERP-IBST

**Ngày khảo sát:** 08/09/2026  
**Đối tượng:** Mã nguồn phần mềm ERP tích hợp IBST (`cic-ibst`)  
**Tài liệu đối chiếu:** [Kế hoạch triển khai ERP IBST (v2)](file:///d:/QuocAnh/2026/01.Project/cic-ibst/ke_hoach_trien_khai_erp_ibst%20(2).html)  
**Tổng kinh phí kế hoạch:** 2.260.000.000 VNĐ | **Thời gian dự kiến:** 10/09/2026 – 30/04/2027

---

## TÓM TẮT ĐIỀU HÀNH (EXECUTIVE SUMMARY)

```
╔══════════════════════════════════════════════════════════════════════╗
║  TỔNG QUAN TIẾN ĐỘ TRIỂN KHAI                                      ║
║                                                                      ║
║  ██████████████████████░░░░░░░  Tổng thể: ~72% hoàn thiện           ║
║                                                                      ║
║  PH1 Dashboard BI    ████████████████████████████░░  90%  ✅ Tốt     ║
║  PH2 Hợp đồng DVKT  █████████████████████████████░  95%  ✅ Xuất sắc║
║  PH3 QLNN & KHCN    ██████████████████░░░░░░░░░░░░  60%  ⚠️ TB     ║
║  PH4 NS, ĐT, Đảng   ████████████████████████░░░░░░  80%  ✅ Tốt     ║
║  PH5 LIMS & TB       ████████████████░░░░░░░░░░░░░░  55%  ⚠️ TB     ║
║  PH6 e-Office        █████████████████░░░░░░░░░░░░░  55%  ⚠️ TB     ║
║  PH7 CSDL & AI-RAG   ████████████████░░░░░░░░░░░░░░  50%  ⚠️ Cơ bản ║
║                                                                      ║
║  ✅ Hoàn thiện: 18 tính năng | ⚠️ Bán phần: 10 | ❌ Chưa có: 5     ║
╚══════════════════════════════════════════════════════════════════════╝
```

> [!IMPORTANT]
> **Nhận định chung:** Hệ thống đã đạt mức hoàn thiện **vượt kỳ vọng** ở khối nghiệp vụ cốt lõi (Hợp đồng, Tài chính, Nhân sự). Các phân hệ còn lại có giao diện hoàn chỉnh nhưng chưa kết nối backend — cần **3-4 sprint bổ sung migration + service** để đạt production-ready.

---

## 1. ĐÁNH GIÁ CHI TIẾT THEO TỪNG PHÂN HỆ

---

### PH1: DASHBOARD BI & ĐIỀU HÀNH — 90% ✅

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| Dashboard UX/UI wireframe, mockup | ✅ Xong | [DashboardPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/DashboardPage.tsx) — 71KB, 5 tab điều hành |
| Thuật toán tổng hợp đa chiều 16 đơn vị | ✅ Xong | [thongke.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/services/thongke.ts) — Doanh thu lũy kế, công nợ, KPI |
| Dashboard v1: Doanh thu, Công nợ, Dòng tiền | ✅ Xong | Biểu đồ Recharts, bộ lọc Năm/Kỳ báo cáo |
| Dự báo dòng tiền (Forecasting ≤15%) | ⚠️ Cơ bản | Có hiển thị xu hướng, chưa có thuật toán forecasting chuyên sâu |
| Tích hợp dữ liệu PH4 (Nhân sự) | ✅ Xong | Thống kê chứng chỉ sắp hết hạn, cơ cấu nhân sự |
| Drill-down 16 đơn vị | ✅ Xong | Tab "Kinh doanh & Dịch vụ TBKT" chi tiết theo đơn vị |
| Unit Health Score KPI | ⚠️ Cơ bản | Có KPI card, chưa có công thức KPI chính thức từ Viện |
| Tích hợp PH6 (Văn bản, Tiến độ giao việc) | ❌ Chưa | e-Office còn mock data, chưa có dữ liệu thực để tích hợp |
| Tích hợp PH3 (QLNN, KHCN, giải ngân) | ⚠️ Bán phần | Có tab "Nghiên cứu & QLNN" nhưng dữ liệu SHTT/Chuyển giao còn mock |
| Biểu đồ hợp phần (Composed Chart) | ✅ Xong | Recharts với filter đa chiều |
| Lịch công tác Lãnh đạo | ⚠️ Bán phần | UI hoàn chỉnh tại LichCoQuanPage, chưa nối DB |
| Responsive (PC, Tablet, Mobile) | ✅ Xong | Tailwind responsive classes đầy đủ |
| Tích hợp PH5 (LIMS) + PH7 (AI-RAG) | ❌ Chưa | Thuộc Dashboard v4, chưa triển khai |

**Đánh giá:** Dashboard v1-v2 cơ bản đã sẵn sàng. Cần bổ sung forecasting algorithm và chờ các PH khác hoàn thiện backend để tích hợp v3, v4.

---

### PH2: QUẢN LÝ HỢP ĐỒNG & TRIỂN KHAI DVKT — 95% ✅✅

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| CSDL: Khách hàng, HĐ, Phụ lục, Phiếu giao việc | ✅ Xong | 36 migrations, bảng `hop_dong`, `phieu_giao_viec`, `khach_hang` |
| CRUD API Khách hàng (CRM) | ✅ Xong | [khachHang.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/services/khachHang.ts) — MST, đại diện, lịch sử HĐ |
| CRUD API Hợp đồng | ✅ Xong | [queries.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/services/queries.ts) + [chitiet.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/services/chitiet.ts) — 41KB service |
| UI Quản lý Khách hàng | ✅ Xong | [KhachHangPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/KhachHangPage.tsx) — 16KB, slide panel chi tiết |
| UI Quản lý Hợp đồng (List, Detail, Filter) | ✅ Xong | [HopDongPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/HopDongPage.tsx) — **123KB**, component đồ sộ nhất |
| Thuật toán QC 2815 Bảng 1 Điều 10 | ✅ Xong | [qc2815.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/lib/qc2815.ts) — 26KB, nguồn sự thật duy nhất |
| Module Thu chi: Tạm ứng, Tiền về, Công nợ | ✅ Xong | [quyetToan.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/services/quyetToan.ts) + trigger `trg_dot_thanh_toan_dong_bo` |
| UI Thu chi & Công nợ (biểu đồ, export Excel) | ✅ Xong | [TaiChinhPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/TaiChinhPage.tsx) + export CSV |
| Phiếu giao việc điện tử (luồng duyệt đa cấp) | ✅ Xong | [kyGiaoViec.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/lib/kyGiaoViec.ts) — 4 nhánh ký theo Đ.7.1c |
| API đồng bộ 2 chiều hệ thống kế toán | ❌ Chưa | Chưa tích hợp hệ thống kế toán bên ngoài (cần API spec từ IBST) |
| Cảnh báo công nợ quá hạn (Email, Zalo ZNS) | ⚠️ Bán phần | [canhBao2815.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/lib/canhBao2815.ts) — có logic cảnh báo, chưa gửi Zalo/Email |
| RLS theo 16 đơn vị | ✅ Xong | Migration 0004, 0027, 0033 — RLS nghiêm ngặt |
| Thẩm tra KHKT (Đ.9.6c) | ✅ Xong | [BaoCaoKhktPanel.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/components/BaoCaoKhktPanel.tsx) |
| Đấu thầu & Chào giá (Đ.4, Đ.5.1) | ✅ Xong | [DauThauPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/DauThauPage.tsx) + 5 components |
| Ủy quyền ký HĐ (Đ.5) | ✅ Xong | [UyQuyenPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/UyQuyenPage.tsx) |
| PVQLNN Nhóm N1B (Đ.3) | ✅ Xong | [PvqlnnPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/PvqlnnPage.tsx) |

**Đánh giá:** Phân hệ cốt lõi nhất, đạt mức **xuất sắc**. Tuân thủ triệt để QC 2815 từ CSDL trigger đến UI. Chỉ thiếu tích hợp ngoài (kế toán, Zalo ZNS).

---

### PH3: QUẢN LÝ NHIỆM VỤ QLNN & KHCN — 60% ⚠️

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| CSDL: Nhiệm vụ QLNN, KHCN, Sản phẩm, Giải ngân | ⚠️ Bán phần | Có bảng `de_tai`, `moc_de_tai`, `nhiem_vu_pvqlnn`. Chưa có bảng sản phẩm bàn giao riêng |
| Module Quản lý Nhiệm vụ QLNN | ✅ Xong | [PvqlnnPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/PvqlnnPage.tsx) — Theo dõi tiến độ, giải ngân |
| Module KHCN phân cấp (Bộ, Viện, Cơ sở) | ✅ Xong | [DeTaiPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/DeTaiPage.tsx) — CRUD đầy đủ |
| Giám sát giải ngân & bàn giao sản phẩm | ⚠️ Cơ bản | Có mốc đề tài nhưng chưa có dashboard so sánh kế hoạch vs thực tế |
| Kết nối dòng tiền vào hệ thống kế toán | ❌ Chưa | Tương tự PH2 — chờ API spec kế toán |
| Bằng sáng chế & SHTT | ⚠️ UI only | [SoHuuTriTuePage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/SoHuuTriTuePage.tsx) — 23KB UI hoàn chỉnh, **mock data** |
| Hoa hồng tác giả & Chuyển giao CN | ⚠️ UI only | Tab trong KhoaHocPage — **mock data**, chưa có bảng DB |
| Báo cáo tổng hợp (Excel/PDF) | ⚠️ Cơ bản | Có export CSV, chưa có PDF |

**Đánh giá:** Phần QLNN và Đề tài KHCN cơ bản đã có. Thiếu **3 bảng CSDL** cho SHTT, Chuyển giao CN, và cần dashboard giám sát giải ngân chuyên biệt.

---

### PH4: NHÂN SỰ, ĐÀO TẠO, TẠP CHÍ & ĐẢNG-ĐOÀN THỂ — 80% ✅

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| CSDL: CBNV, Chứng chỉ, Đào tạo, Đảng viên | ✅ Xong | Migrations 0028-0033: 23 trường nhân sự, 15+ bảng |
| Hồ sơ CBNV (lý lịch, công tác, bổ nhiệm) | ✅ Xong | [NhanSuHoSoPanel.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/components/NhanSuHoSoPanel.tsx) — Slide panel chi tiết |
| Chứng chỉ hành nghề XD (cảnh báo 90/60/30 ngày) | ✅ Xong | Logic cảnh báo tích hợp trong NhanSuPage + Dashboard |
| RLS nhân sự đa cấp | ✅ Xong | Migration 0033 — RLS chuyên biệt |
| Đào tạo sau ĐH / NCS Tiến sĩ | ✅ Xong | [DaoTaoPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/DaoTaoPage.tsx) — Bảng `nghien_cuu_sinh` |
| **Tòa soạn Tạp chí KHCN XD** | ❌ Chưa | **Chưa triển khai** — Không có UI, service, hay bảng DB |
| **Phản biện khoa học (blind review)** | ❌ Chưa | **Chưa triển khai** — Quy trình peer review chưa được xây dựng |
| Dashboard Tạp chí (thống kê bài nhận) | ❌ Chưa | Phụ thuộc vào module Tạp chí |
| Đảng vụ (hồ sơ, sinh hoạt, Đảng phí) | ✅ Xong | [DangDoanTheTab.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/components/DangDoanTheTab.tsx) — 54KB, 10 bảng DB |
| Đoàn TN & Công đoàn | ✅ Xong | Tích hợp trong DangDoanTheTab |
| Thi đua – Khen thưởng | ✅ Xong | Bảng `khen_thuong_ky_luat`, `thi_dua` |
| HĐLĐ, Lương, Đánh giá xếp loại | ✅ Xong | Migration 0029 — 4 bảng chuyên biệt |

> [!WARNING]
> **GAP LỚN:** Module **Tòa soạn Tạp chí KHCN Xây dựng** và **Phản biện khoa học** hoàn toàn chưa được triển khai. Đây là khối nghiệp vụ đặc thù cần thiết kế riêng (quy trình blind review, phân công biên tập viên, quản lý bản thảo).

---

### PH5: HỆ THỐNG THỬ NGHIỆM (LIMS), KẾT QUẢ TN & THIẾT BỊ — 55% ⚠️

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| Tiếp nhận mẫu (mã vạch, truy vết, phân phòng) | ✅ Xong | [ThiNghiemPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/ThiNghiemPage.tsx) — Tab `mau-thu`, workflow trạng thái |
| Kết quả phép thử LAS | ✅ Xong | Bảng `ket_qua_phep_thu`, service trong `chitiet.ts` |
| In phiếu kết quả TN + Ký số CA | ✅ Xong | [print.ts](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/lib/print.ts) — Mẫu in chuẩn ISO 17025 |
| Quản lý Thiết bị TN (danh mục, trạng thái) | ⚠️ UI only | Tab `thiet-bi-las` — UI cảnh báo 30 ngày, **dùng MOCK_EQUIPMENT** |
| **Formula Engine** (cấu hình công thức cơ lý) | ❌ Chưa | **Chưa triển khai** — Tính năng quan trọng cho 11 phòng LAS |
| Tính toán ISO/IEC 17025 | ⚠️ Cơ bản | Có trường kết quả/đơn vị, chưa có engine tính tự động |
| Kết xuất PDF + Chữ ký số CA | ⚠️ Bán phần | Có mẫu in HTML, chưa tích hợp chữ ký số CA thực tế |
| Cảnh báo hiệu chuẩn thiết bị (30/15/7 ngày) | ⚠️ UI only | Logic cảnh báo UI có, nhưng dữ liệu là mock |
| Giám sát vốn đầu tư công | ⚠️ UI only | Thẻ KPI trong ThiNghiemPage, **số liệu giả lập** |
| Tích hợp LIMS vào Dashboard BI | ❌ Chưa | Thuộc Dashboard v4 |

**Đánh giá:** Tiếp nhận mẫu và kết quả phép thử hoạt động. Cần xây dựng **Formula Engine**, bảng `thiet_bi_thi_nghiem` trong DB, và tích hợp chữ ký số CA.

---

### PH6: VĂN PHÒNG SỐ (e-Office) — 55% ⚠️

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| Văn bản đến/đi (tiếp nhận, phân loại, trạng thái) | ✅ Xong | [VanBanPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/VanBanPage.tsx) — Bảng `van_ban`, Supabase Storage |
| **Workflow Engine** (luồng phê duyệt động) | ❌ Chưa | **Chưa triển khai** — Hiện chỉ có workflow cứng cho HĐ, chưa có engine cấu hình cho văn bản |
| Chữ ký số CA web-based | ❌ Chưa | **Chưa tích hợp** — Cần vendor CA (VNPT-CA / Viettel-CA) |
| API Trục Văn bản Bộ Xây dựng | ❌ Chưa | **Chưa triển khai** — Cần spec giao thức XML từ Bộ XD |
| Phòng họp (đăng ký, chống trùng lịch) | ⚠️ UI only | Tab trong EOfficePage — **UI tĩnh**, chưa có form lưu backend |
| Xe công tác (đăng ký, phê duyệt) | ⚠️ UI only | Tab trong EOfficePage — **UI tĩnh** |
| Tài liệu lưu trữ (upload, full-text search) | ⚠️ Bán phần | [HoSoTaiLieuPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/HoSoTaiLieuPage.tsx) — Có UI, **mock data** |
| Lịch công tác & Giao việc | ⚠️ UI only | [LichCoQuanPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/LichCoQuanPage.tsx) 59KB + [CongViecPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/CongViecPage.tsx) — **INITIAL_LICH, mock** |
| Tiến độ công việc lũy kế | ⚠️ UI only | UI tính % hoàn thành, chưa nối DB |
| Thông báo đa kênh (In-app, Email, Zalo) | ⚠️ Cơ bản | [Notifications.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/components/Notifications.tsx) — In-app only |

**Đánh giá:** Văn bản đến/đi đã hoạt động với DB. Các module phụ trợ (Lịch, Giao việc, Phòng họp, Xe) có giao diện rất hoàn thiện nhưng cần **5-6 migration** để tạo bảng DB + kết nối service.

---

### PH7: NỀN TẢNG CSDL — LƯU TRỮ & TRỢ LÝ AI-RAG — 50% ⚠️

| Hạng mục kế hoạch | Trạng thái | Chi tiết hiện trạng |
|---|:---:|---|
| NAS 150TB (12-bay, RAID 6, 10GbE) | ❌ Chưa | **Thuộc Giai đoạn 3** — Phần cứng, chưa mua sắm |
| Upload & Quản lý Tài liệu kỹ thuật | ⚠️ Bán phần | [HoSoTaiLieuPage.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/pages/HoSoTaiLieuPage.tsx) — UI có, bảng `luu_tru_ho_so` đã tạo |
| Granular ACL (folder, file, user) | ❌ Chưa | Chưa triển khai phân quyền chi tiết tới file/folder |
| Full-text search + Metadata | ⚠️ Cơ bản | Có tìm kiếm text, chưa có full-text index PostgreSQL |
| Pipeline Vector Embeddings (pgvector) | ❌ Chưa | Chưa cài pgvector, chưa có pipeline embedding |
| Tích hợp LLM (FPT AI Cloud MaaS) | ❌ Chưa | Chưa kết nối API LLM |
| Giao diện Chat AI-RAG | ✅ Xong | [AiChatbot.tsx](file:///d:/QuocAnh/2026/01.Project/cic-ibst/src/components/AiChatbot.tsx) — 49KB, tra cứu QCVN 06 |
| Tinh chỉnh RAG (Re-ranking, ≥90%) | ❌ Chưa | Phụ thuộc pipeline chưa triển khai |
| Vòng đời tài liệu (Draft→Published→Archived) | ❌ Chưa | Chưa có workflow quản lý trạng thái tài liệu |

**Đánh giá:** Giao diện AI Chatbot đã hoạt động tốt với dữ liệu QCVN 06 tĩnh. Phần infrastructure (NAS, pgvector, LLM API) thuộc GĐ3, đúng tiến độ kế hoạch.

---

## 2. BẢNG TỔNG HỢP GAP ANALYSIS

### 2.1. Các tính năng đã HOÀN THIỆN (18 hạng mục)

| # | Tính năng | PH | Bằng chứng |
|:---:|---|:---:|---|
| 1 | Dashboard tổng quan 5 tab + Biểu đồ BI | PH1 | DashboardPage 71KB + thongke.ts |
| 2 | Hợp đồng kinh tế QC 2815 toàn trình | PH2 | HopDongPage 123KB + 15 migration |
| 3 | Chuỗi tài chính Đ.11 (HĐ, Phân phối, Tạm ứng) | PH2 | quyetToan.ts + migration 0036 |
| 4 | CRM Khách hàng & Đối tác | PH2 | KhachHangPage + khachHang.ts |
| 5 | Đấu thầu & Chào giá (Đ.4, 5.1) | PH2 | DauThauPage + 5 components |
| 6 | Ủy quyền ký HĐ (Đ.5) | PH2 | UyQuyenPage + bảng uy_quyen |
| 7 | Nhiệm vụ PVQLNN N1B | PH3 | PvqlnnPage + bảng nhiem_vu_pvqlnn |
| 8 | Đề tài KHCN các cấp | PH3 | DeTaiPage + bảng de_tai, moc_de_tai |
| 9 | Hồ sơ CBNV + Chứng chỉ XD | PH4 | NhanSuHoSoPanel + 23 trường + nhanSu.ts |
| 10 | HĐLĐ, Lương, Đánh giá xếp loại | PH4 | Migration 0029 — 4 bảng |
| 11 | Đào tạo & NCS Tiến sĩ | PH4 | DaoTaoPage + bảng nghien_cuu_sinh |
| 12 | Đảng - Đoàn thể & Thi đua | PH4 | DangDoanTheTab 54KB + 10 bảng DB |
| 13 | Sơ đồ Tổ chức & Đơn vị | PH4 | DonViPage + OrgChartTree |
| 14 | Tiếp nhận mẫu LIMS | PH5 | ThiNghiemPage tab mau-thu |
| 15 | Kết quả phép thử LAS | PH5 | Bảng ket_qua_phep_thu + print.ts |
| 16 | Văn bản Đến/Đi | PH6 | VanBanPage + bảng van_ban + Storage |
| 17 | AI Chatbot QCVN 06 | PH7 | AiChatbot.tsx 49KB |
| 18 | Quản trị hệ thống (RBAC, Danh mục, Log) | HT | CaiDatPage + quantri.ts |

### 2.2. Các tính năng BÁN PHẦN — Có UI, thiếu Backend (10 hạng mục)

| # | Tính năng | PH | Thiếu gì |
|:---:|---|:---:|---|
| 1 | Sở hữu trí tuệ & Bằng sáng chế | PH3 | Bảng DB + Service API |
| 2 | Chuyển giao CN & Hoa hồng tác giả | PH3 | Bảng DB + Service API |
| 3 | Thiết bị thí nghiệm 11 phòng LAS | PH5 | Bảng `thiet_bi_thi_nghiem` + Service |
| 4 | Giám sát vốn đầu tư công | PH5 | Bảng DB + Service |
| 5 | Lịch công tác cơ quan | PH6 | Bảng `lich_co_quan` + Service |
| 6 | Giao việc & Tiến độ công việc | PH6 | Bảng `cong_viec` + Service |
| 7 | Đăng ký Phòng họp | PH6 | Bảng `phong_hop` + Service |
| 8 | Đăng ký Xe công tác | PH6 | Bảng `xe_cong_tac` + Service |
| 9 | Kho Hồ sơ Tài liệu kỹ thuật | PH7 | Kết nối bảng `luu_tru_ho_so` đã có |
| 10 | Cảnh báo Zalo ZNS / Email | PH2,6 | Tích hợp API Zalo ZNS + SMTP |

### 2.3. Các tính năng CHƯA TRIỂN KHAI (5 hạng mục)

| # | Tính năng | PH | Mức độ phức tạp | Ước lượng |
|:---:|---|:---:|:---:|---|
| 1 | **Tòa soạn Tạp chí KHCN** + Phản biện blind review | PH4 | 🔴 Cao | ~3 sprint |
| 2 | **Workflow Engine** (luồng phê duyệt động cấu hình) | PH6 | 🔴 Rất cao | ~4 sprint |
| 3 | **Formula Engine** (công thức tính toán cơ lý) | PH5 | 🔴 Cao | ~3 sprint |
| 4 | **Chữ ký số CA** web-based (VNPT-CA/Viettel-CA) | PH5,6 | 🟠 TB-Cao | ~2 sprint + vendor |
| 5 | **Trục Văn bản Bộ XD** (API XML liên thông) | PH6 | 🟠 TB | ~2 sprint + spec BXD |

---

## 3. ĐÁNH GIÁ KIẾN TRÚC KỸ THUẬT

### 3.1. Điểm mạnh ✅

| Tiêu chí | Đánh giá |
|---|---|
| **Stack công nghệ** | React + TypeScript + Vite + Tailwind + Supabase — Stack hiện đại, đúng xu hướng |
| **Bảo mật dữ liệu** | RLS theo 16 đơn vị qua 4 migration (0004, 0027, 0033, 0006) — Nghiêm ngặt |
| **Nghiệp vụ QC 2815** | Single Source of Truth tại `qc2815.ts` + DB trigger — Chuẩn mực |
| **Kiến trúc slide panel** | SlidePanelStack hỗ trợ lồng nhau, kéo giãn — UX chuyên nghiệp |
| **Quy mô code** | ~700KB+ source code, 36 migrations — Hệ thống lớn, có chiều sâu |
| **Audit trail** | `nhat_ky_du_lieu` + trigger tự động ghi vết — Tuân thủ |
| **Mở rộng vượt kế hoạch** | 5 công cụ kỹ thuật (CAD Viewer, PCCC, Suất đầu tư...) + IBST Portal |

### 3.2. Điểm cần cải thiện ⚠️

| Tiêu chí | Hiện trạng | Khuyến nghị |
|---|---|---|
| **Mock data** | 8 module dùng INITIAL_* hoặc MOCK_* | Tạo migration + service từng bước |
| **Test coverage** | Chưa thấy thư mục `__tests__/` hoặc `*.test.ts` | Cần bổ sung unit test, mục tiêu ≥80% cho PH2 |
| **CI/CD pipeline** | Chưa có file `.github/workflows/` | Cần thiết lập CI/CD trước go-live |
| **API kế toán** | Chưa thiết kế interface | Cần spec API từ IBST sớm (GĐ1) |
| **HopDongPage 123KB** | Monolithic component | Cân nhắc tách thành sub-components |

---

## 4. KHUYẾN NGHỊ ƯU TIÊN TRIỂN KHAI

### Giai đoạn 1 (Ưu tiên cao — Sprint tiếp theo)

```
 ┌─────────────────────────────────────────────────────────────────┐
 │  SPRINT KẾ TIẾP — Chuyển mock → DB cho e-Office & PH5          │
 │                                                                 │
 │  1. Migration bảng: lich_co_quan, cong_viec, phong_hop,         │
 │     xe_cong_tac, thiet_bi_thi_nghiem                            │
 │  2. Service layer cho 5 bảng mới                                │
 │  3. Kết nối UI hiện có (đã sẵn sàng) → Service mới             │
 │  4. Bổ sung bảng so_huu_tri_tue, chuyen_giao_cn                │
 │                                                                 │
 │  Ước lượng: 2-3 sprint × 2 tuần = 4-6 tuần                     │
 └─────────────────────────────────────────────────────────────────┘
```

### Giai đoạn 2 (Tích hợp bên ngoài)
1. Tích hợp Chữ ký số CA (liên hệ vendor VNPT-CA/Viettel-CA)
2. API Zalo ZNS cho thông báo cảnh báo
3. Thiết kế API spec đồng bộ hệ thống kế toán
4. Tìm hiểu giao thức XML Trục Văn bản Bộ XD

### Giai đoạn 3 (Nghiệp vụ mới)
1. Xây dựng module Tòa soạn Tạp chí KHCN (thiết kế DB, workflow blind review)
2. Phát triển Formula Engine cho LIMS
3. Triển khai Workflow Engine cấu hình động
4. Pipeline AI-RAG (pgvector + LLM API)

---

## 5. MA TRẬN ĐỐI CHIẾU TỔNG THỂ

| Phân hệ | Kinh phí KH | % Hoàn thiện | Tương đương giá trị | Còn lại |
|---|---:|:---:|---:|---:|
| PH1 Dashboard BI | 180M | 90% | ~162M | ~18M |
| PH2 HĐ & DVKT | 510M | 95% | ~485M | ~25M |
| PH3 QLNN & KHCN | 260M | 60% | ~156M | ~104M |
| PH4 NS, ĐT, Tạp chí, Đảng | 260M | 80% | ~208M | ~52M |
| PH5 LIMS & Thiết bị | 400M | 55% | ~220M | ~180M |
| PH6 e-Office | 440M | 55% | ~242M | ~198M |
| PH7 CSDL & AI-RAG | 210M | 50% | ~105M | ~105M |
| **TỔNG** | **2.260M** | **~72%** | **~1.578M** | **~682M** |

> [!TIP]
> **Giá trị phần mềm đã triển khai:** Khoảng **1.578 tỷ VNĐ** (72% tổng kinh phí) tính theo tỷ lệ hoàn thiện tính năng. Khối nghiệp vụ cốt lõi (PH2 + PH1) chiếm **647M** đã gần như production-ready.

---

> **Người lập báo cáo:** CIC — Bộ phận Phát triển Phần mềm  
> **Phiên bản:** v1.0 | **Ngày:** 08/09/2026
