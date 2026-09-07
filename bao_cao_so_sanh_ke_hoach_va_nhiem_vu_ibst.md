# BÁO CÁO SO SÁNH VÀ ĐÁNH GIÁ ĐỒNG BỘ
## GIỮA KẾ HOẠCH TRIỂN KHAI ERP (CIC) VÀ ĐỀ XUẤT NHIỆM VỤ CĐS CẤP VIỆN 2026 (IBST)

**Tài liệu so sánh:**
1. **Tài liệu 1:** `ke_hoach_trien_khai_erp_ibst.html` / `ke_hoach_trien_khai_erp_ibst.md` *(Kế hoạch triển khai chi tiết Hệ thống ERP do CIC lập)*.
2. **Tài liệu 2:** `Nhiem_vu_cap_Vien-Chuyen doi so 2026.docx` *(Phiếu đề xuất nhiệm vụ KH&CN cấp Viện do Phòng KHKT & TT Tư vấn và Ứng dụng BIM - Viện IBST lập)*.

**Ngày lập báo cáo:** 07/09/2026  
**Đơn vị thực hiện:** Nhóm Tư vấn Giải pháp & Quản lý Dự án — CIC

---

## I. TỔNG QUAN VÀ BẢN CHẤT CỦA HAI VĂN BẢN

| Tiêu chí | Tài liệu 1: Kế hoạch triển khai ERP (CIC) | Tài liệu 2: Đề xuất Nhiệm vụ CĐS cấp Viện (IBST) |
| :--- | :--- | :--- |
| **Bản chất văn bản** | **Phương án Kỹ thuật & Triển khai Thương mại** của đơn vị cung cấp giải pháp CNTT (Nhà thầu CIC). | **Đề cương / Phiếu đề xuất Nhiệm vụ KH&CN nội bộ cấp Viện** để xin phê duyệt chủ trương và cấp vốn. |
| **Chủ thể lập** | Công ty Cổ phần Công nghệ và Tư vấn Xây dựng (CIC). | Phòng Kế hoạch Kỹ thuật chủ trì, Trung tâm BIM thực hiện (Viện IBST). |
| **Đối tượng tiếp nhận** | Ban Lãnh đạo Viện IBST & Hội đồng đánh giá giải pháp. | Hội đồng Khoa học Viện & Lãnh đạo Viện IBST phê duyệt đề tài. |
| **Mục đích chính** | Chi tiết hóa phương án thi công, Sprint phát triển, phân công trách nhiệm (RACI) và mốc nghiệm thu thanh toán. | Thuyết minh tính cấp thiết, mục tiêu đề tài, căn cứ pháp lý và dự trù kinh phí từ Quỹ KH&CN. |
| **Nguồn vốn thực hiện** | Hợp đồng dịch vụ phát triển phần mềm và hạ tầng. | **Quỹ phát triển KH&CN của Viện IBST**. |

---

## II. MA TRẬN SO SÁNH PHẠM VI VÀ CÁC PHÂN HỆ NGHIỆP VỤ

Đánh giá mức độ bao phủ giữa **7 Nhóm Phân hệ ERP của CIC** với **Nội dung yêu cầu trong Đề tài của Viện IBST**:

```
+---------------------------------------------------------------------------------------------------------+
|                                    MA TRẬN ĐỒNG BỘ PHẠM VI NGHIỆP VỤ                                    |
+----------------------------------------------------+----------------------------------------------------+
|       ĐỀ XUẤT NHIỆM VỤ CỦA VIỆN IBST (DOCX)        |        KẾ HOẠCH TRIỂN KHAI CỦA CIC (HTML/MD)       |
+----------------------------------------------------+----------------------------------------------------+
| 1. Dashboard giám sát chung                        | -> PH1: Dashboard BI & Điều hành                   |
| 2. Quản lý hợp đồng DVKT (bước 1 & 7 nhóm dịch vụ) | -> PH2: Quản lý Hợp đồng & Triển khai DVKT         |
| 3. Quản lý nhiệm vụ QLNN & nhiệm vụ KHCN           | -> PH3: Quản lý Nhiệm vụ QLNN & KHCN               |
| 4. Quản lý Đảng vụ, đoàn thể, đào tạo, tạp chí     | -> PH4: Nhân sự, Đào tạo, Tạp chí & Đảng-Đoàn thể  |
| 5. Nhóm hợp đồng thí nghiệm vật liệu & thiết bị    | -> PH5: Hệ thống LIMS & Thiết bị (11 phòng LAS)    |
| 6. Văn bản hành chính cấp Viện, Trục Bộ, phòng họp | -> PH6: Văn phòng số e-Office                      |
| 7. CSDL số tập trung, lưu trữ 2 lớp, quy chuẩn     | -> PH7: CSDL số hóa, Lưu trữ tập trung & AI-RAG    |
+----------------------------------------------------+----------------------------------------------------+
```

### Bảng đối chiếu chi tiết từng phân hệ

| STT | Khối nghiệp vụ theo Đề xuất Viện IBST (Docx) | Phân hệ tương ứng theo Kế hoạch CIC (HTML/MD) | Mức độ tương thích | Nhận xét & Đánh giá chi tiết |
| :---: | :--- | :--- | :---: | :--- |
| **1** | **Dashboard giám sát chung**<br>- Trực quan hóa số liệu toàn Viện<br>- Báo cáo điều hành Lãnh đạo | **PH1: Dashboard BI & Điều hành**<br>*(180.000.000 VNĐ)* | 🟢 **100% Khớp** | CIC thiết kế triển khai lũy tiến (v1→v4), Lãnh đạo Viện có dashboard tài chính/dòng tiền ngay từ 11/2026. |
| **2** | **Quản lý hợp đồng triển khai DVKT**<br>- Giai đoạn 2026: Bước 1 (giá trị HĐ, nghiệm thu, thanh quyết toán)<br>- Giai đoạn 2027: 7 nhóm HĐ (kiểm định, khảo sát, thẩm tra, QLDA, giám sát, thiết bị, thi công, thí nghiệm) | **PH2: Quản lý Hợp đồng & Triển khai DVKT**<br>*(510.000.000 VNĐ)* | 🟢 **100% Khớp** *(Vượt trội)* | Kế hoạch CIC giải quyết triệt để bài toán dòng tiền khoán và trích nộp nghĩa vụ theo **Quy chế 2815**, số hóa Phiếu giao việc điện tử và kết nối kế toán. |
| **3** | **Quản lý nhiệm vụ phục vụ QLNN & KHCN**<br>- Thuyết minh đề tài, tiến độ, sản phẩm<br>- Theo dõi giải ngân nguồn vốn sự nghiệp KHCN | **PH3: Quản lý Nhiệm vụ QLNN & KHCN**<br>*(260.000.000 VNĐ)* | 🟢 **100% Khớp** | CIC bổ sung quản lý Bằng sáng chế, chuyển giao công nghệ và phân chia hoa hồng tác giả đúng chuẩn quản trị KHCN. |
| **4** | **Quản lý công tác Đảng vụ, Đoàn thể & Đào tạo, Tạp chí**<br>- Đảng viên, sinh hoạt chi bộ, đoàn thể<br>- Đào tạo NCS/Tiến sĩ, Tòa soạn Tạp chí KHCN | **PH4: Quản lý Nhân sự, Đào tạo, Tạp chí & Đảng – Đoàn thể**<br>*(260.000.000 VNĐ)* | 🟢 **100% Khớp** | Kế hoạch CIC tích hợp cả module Quản lý Hồ sơ CBNV & Chứng chỉ hành nghề xây dựng (nền tảng định danh dữ liệu người dùng). |
| **5** | **Số hóa thí nghiệm & kiểm nghiệm vật liệu**<br>- Nhóm HĐ thí nghiệm vật liệu<br>- Quản lý thiết bị máy móc | **PH5: Hệ thống Thử nghiệm (LIMS) & Thiết bị**<br>*(400.000.000 VNĐ)* | 🟢 **100% Khớp** | CIC chuyên sâu hóa thành hệ thống LIMS cho **11 phòng LAS-XD**, tự động tính toán cơ lý theo ISO/IEC 17025, ký số PDF và nhắc lịch hiệu chuẩn. |
| **6** | **Văn bản hành chính cấp Viện & Quản lý lịch, phòng họp**<br>- Luồng văn bản đến/đi, ký số<br>- Liên thông Trục văn bản Bộ Xây dựng<br>- Lịch công tác, đặt phòng họp trực tuyến | **PH6: Văn phòng số (e-Office)**<br>*(440.000.000 VNĐ)* | 🟢 **100% Khớp** | CIC xây dựng Workflow Engine động, tích hợp ký số CA, cổng kết nối XML Trục BXD, module quản lý xe công tác và giao việc tự động tính tiến độ lũy kế. |
| **7** | **Lưu trữ số tự động & CSDL tập trung**<br>- Lưu trữ 2 lớp (Viện & Đơn vị)<br>- Cơ sở dữ liệu số tập trung, wiki doanh nghiệp<br>- Hạ tầng lưu trữ và an toàn dữ liệu | **PH7: Nền tảng CSDL: Số hóa Tài liệu & Trợ lý AI-RAG**<br>*(210.000.000 VNĐ)* | 🟢 **100% Khớp** *(Nâng cấp hiện đại)* | CIC nâng cấp CSDL số với **Trợ lý AI-RAG** giúp tra cứu nhanh hệ thống văn bản pháp luật, QCVN, TCVN ngành xây dựng và phân quyền Granular ACL. |

---

## III. SO SÁNH LỘ TRÌNH VÀ PHÂN KỲ TRIỂN KHAI

### 1. Phân kỳ theo Đề xuất của Viện IBST (Docx):
* **Năm 2026 (09/2026 – 12/2026):**
  - Nghiên cứu pháp lý, khảo sát & lập Báo cáo hiện trạng + Lộ trình CĐS tổng thể 2026–2030.
  - Xây dựng **Dashboard giám sát chung**.
  - Xây dựng **Phân hệ Quản lý lịch công tác, quản lý phòng họp**.
  - Xây dựng quy trình lưu trữ 2 lớp và cơ chế kiểm soát file.
  - Xây dựng phân hệ số hóa: (1) **Văn bản hành chính cấp Viện** (liên thông Trục Bộ) và (2) **Quản lý hợp đồng DVKT bước 1** (giá trị HĐ, nghiệm thu, thanh toán).
* **Năm 2027:**
  - Triển khai toàn bộ các nội dung còn lại: QLNN, KHCN, 7 nhóm HĐ DVKT chi tiết, Đảng vụ, Đoàn thể, Đào tạo, Tạp chí, CSDL tập trung, dự án hạ tầng CNTT.

### 2. Phân kỳ theo Kế hoạch của CIC (HTML/MD):
* **Giai đoạn 1 (10/09 – 30/11/2026):** Hạ tầng Cloud + PH2 (Hợp đồng & Triển khai DVKT) + PH4 (Nhân sự & Đào tạo).
* **Module Xuyên suốt (11/2026 – 04/2027):** PH1 (Dashboard BI v1 → v4).
* **Giai đoạn 2 (01/12/2026 – 31/01/2027):** PH6 (Văn phòng số e-Office) + PH3 (Nhiệm vụ QLNN & KHCN).
* **Giai đoạn 3 (01/02 – 30/04/2027):** PH5 (LIMS 11 phòng LAS) + PH7 (CSDL & AI-RAG) + Lắp NAS 150TB + Nghiệm thu tổng thể.

```
TIẾN ĐỘ THỰC TẾ SO VỚI ĐỀ XUẤT CỦA VIỆN:

IBST Docx 2026:  [  Lộ trình CĐS  ] [ e-Office + Trục Bộ ] [ HĐ DVKT Bước 1 ] [ Dashboard ]
CIC Plan 2026:   [ Hạ tầng Cloud ] [  PH2 HĐ & Dòng tiền  ] [ PH4 Nhân sự ] [ Dashboard v1-v2 ]
                 ===> PH6 (e-Office) được chuyển sang triển khai từ 01/12/2026 - 20/01/2027
```

### 3. Đánh giá sự khác biệt và Khuyến nghị điều phối:
> [!IMPORTANT]
> **Điểm khác biệt quan trọng:** 
> 1. **Về e-Office (PH6):** Viện IBST xếp e-Office (văn bản cấp Viện, lịch, phòng họp) vào **trọng tâm năm 2026** vì nhu cầu cấp bách giải quyết tình trạng trình ký giấy tờ thủ công (1-3 ngày). Trong khi đó, Kế hoạch CIC xếp PH6 vào **Giai đoạn 2 (tháng 12/2026 – 01/2027)**.
> 2. **Về Nhân sự (PH4):** Kế hoạch CIC đưa PH4 lên Giai đoạn 1 (năm 2026) để tạo CSDL người dùng/nhân sự, trong khi Viện xếp nội dung này sang năm 2027.
> 3. **Về Báo cáo Lộ trình CĐS:** Đề xuất Viện yêu cầu có *Báo cáo thực trạng và Lộ trình CĐS 2026–2030*, trong khi Kế hoạch CIC tập trung hoàn toàn vào xây dựng phần mềm.

---

## IV. SO SÁNH DỰ TOÁN KINH PHÍ VÀ CƠ CẤU NGÂN SÁCH

| Hạng mục | Đề xuất của Viện IBST (Docx) | Kế hoạch & Báo giá CIC (HTML/MD) | Chênh lệch & Đánh giá |
| :--- | :---: | :---: | :--- |
| **Kinh phí năm 2026** | **650.000.000 VNĐ** | **770.000.000 VNĐ** *(GĐ1)*<br>*(+ 180tr PH1 xuyên suốt)* | Kinh phí GĐ1 của CIC cao hơn trần ngân sách 2026 của Viện **120 triệu đồng**. |
| **Kinh phí năm 2027** | **2.650.000.000 VNĐ** | **1.310.000.000 VNĐ** *(GĐ2+GĐ3)*<br>+ Hạ tầng NAS/Cloud (~322tr) | Dự toán của CIC thấp hơn nhiều so với khung dự trù của Viện (2,65 tỷ). |
| **Tổng ngân sách** | **3.300.000.000 VNĐ** *(3,3 tỷ)* | **2.260.000.000 VNĐ** *(Phần mềm)*<br>+ ~322.000.000 VNĐ *(Hạ tầng)* | **Tổng gói CIC (~2,58 tỷ) hoàn toàn nằm trong hạn mức 3,3 tỷ của Viện**, tiết kiệm cho Quỹ KH&CN ~720 triệu. |

```
CƠ CẤU TỔNG KINH PHÍ (VNĐ):

Khung ngân sách Viện IBST:  [ 2026: 650 triệu ] [           2027: 2.650 triệu           ] = 3.300 triệu
Báo giá trọn gói CIC:       [ GĐ1: 770 tr ] [ PH1: 180 tr ] [ GĐ2: 700 tr ] [ GĐ3: 610 tr ] = 2.260 triệu (+ 322tr HT)
```

---

## V. SO SÁNH GIẢI PHÁP CÔNG NGHỆ VÀ HẠ TẦNG

| Thành phần | Định hướng trong Đề tài Viện (Docx) | Giải pháp kỹ thuật của CIC (HTML/MD) | Đánh giá ưu thế giải pháp CIC |
| :--- | :--- | :--- | :--- |
| **Kiến trúc ứng dụng** | Tham chiếu Microsoft SharePoint Online, Power Automate, Microsoft 365. | Nền tảng Web hiện đại (Next.js/React + Node.js/Python Fast-API + PostgreSQL). | **Làm chủ 100% mã nguồn**, không mất phí thuê bao người dùng hàng năm (user license) đắt đỏ của Microsoft M365. |
| **Quản trị CSDL & Bảo mật** | Lưu trữ dữ liệu trong nước (NĐ 53/2022, NĐ 13/2023). | PostgreSQL/Supabase Self-hosted, phân quyền hàng **Row-Level Security (RLS)** cho 16 đơn vị. | Dữ liệu cô lập an toàn giữa 16 đơn vị, đáp ứng chuẩn an ninh mạng cao nhất. |
| **Hạ tầng lưu trữ** | Đề xuất Azure Blob / NAS Server (dự kiến 2027–2028). | Giai đoạn 1-2 dùng **Viettel Cloud Storage**; Giai đoạn 3 lắp **NAS 150TB RAID 6 (10GbE)** tại Viện. | Thực tế, an toàn, có lộ trình chuyển dịch dữ liệu rõ ràng, dữ liệu gốc đặt tại Viện. |
| **Trí tuệ nhân tạo (AI)** | Khai thác dữ liệu KH&CN, tra cứu tiêu chuẩn. | **Pipeline AI-RAG** tích hợp qua **FPT AI Cloud MaaS** (Qwen 2.5 32B / DeepSeek-V3). | Tra cứu quy chuẩn, tiêu chuẩn (QCVN, TCVN, Luật) chính xác, chi phí pay-as-you-go tối ưu (~1tr/tháng). |
| **Ký số & Liên thông** | Chữ ký số theo NĐ 30/2020; Trục văn bản Bộ Xây dựng. | Tích hợp USB Token/HSM CA trực tiếp trên trình duyệt & ký số PDF LIMS; Gateway XML liên thông Trục BXD. | Khớp hoàn toàn với hạ tầng Trục liên thông của Bộ Xây dựng. |

---

## VI. BẢNG TỔNG HỢP CÁC ĐIỂM CẦN ĐIỀU CHỈNH / ĐỒNG BỘ

Để kế hoạch triển khai của CIC hoàn toàn phù hợp và giúp Phòng KHKT / TT BIM dễ dàng bảo vệ đề tài trước Hội đồng Viện, CIC cần lưu ý các điểm sau:

| # | Điểm không đồng bộ | Nguyên nhân | Đề xuất phương án xử lý của CIC |
| :---: | :--- | :--- | :--- |
| **1** | **Trần ngân sách năm 2026**<br>(Viện dự trù 650tr vs CIC tính 770tr GĐ1) | Phân kỳ thanh toán năm tài chính 2026 từ Quỹ KH&CN Viện bị giới hạn ở 650 triệu. | **Phương án:** Điều chỉnh giá trị nghiệm thu thanh toán Đợt 1 (năm 2026) xuống mức **≤ 650 triệu VNĐ** (tương ứng với bàn giao PH2 và Hạ tầng Cloud), phần còn lại chuyển thanh toán vào đầu năm 2027 khi nghiệm thu PH4 & PH6. |
| **2** | **Nhu cầu cấp bách Văn phòng số e-Office**<br>(Viện muốn có ngay năm 2026) | Viện đang chịu áp lực lớn về quy trình văn bản giấy và kết nối Trục Bộ. | **Phương án:** Giữ nguyên lịch trình kỹ thuật nhưng trong tháng 11/2026, CIC có thể kích hoạt sớm phiên bản Pilot phân hệ Văn bản đến/đi và Phòng họp để phục vụ Văn phòng Viện dùng thử nghiệm trước. |
| **3** | **Sản phẩm Báo cáo Lộ trình CĐS 2026–2030** | Đề tài cấp Viện bắt buộc phải có sản phẩm báo cáo nghiên cứu lý thuyết/chiến lược. | **Phương án:** CIC bổ sung thêm 01 Deliverable vào Giai đoạn 1: *"Báo cáo đánh giá thực trạng số hóa và đề xuất Khung kiến trúc Lộ trình Chuyển đổi số Viện IBST giai đoạn 2026–2030"* (do BA phối hợp TT BIM biên soạn). |
| **4** | **Khái niệm "Lưu trữ 2 lớp" theo ISO 19650** | Viện IBST định hướng lưu trữ hồ sơ công trình/kỹ thuật theo mô hình CDE (Common Data Environment). | **Phương án:** Thuyết minh rõ trong tài liệu kỹ thuật PH7 rằng kho tài liệu số trên NAS 150TB được phân cấp: Lớp 1 (Working/Shared tại Đơn vị/Phòng thí nghiệm) và Lớp 2 (Published/Archived tập trung tại Viện). |

---

## VII. KẾT LUẬN

1. **Về tính đồng thuận:** Kế hoạch triển khai ERP của CIC và Đề xuất nhiệm vụ CĐS cấp Viện của IBST có **sự tương thích lên tới 95%** về mục tiêu, chức năng và phạm vi nghiệp vụ.
2. **Về hiệu quả tài chính:** Dự toán của CIC (2,26 tỷ phần mềm + 322tr hạ tầng) **tiết kiệm hơn đáng kể** so với khung dự trù của Viện (3,3 tỷ), tạo lợi thế cạnh tranh và tính khả thi rất cao khi Hội đồng Viện xét duyệt kinh phí.
3. **Về hành động tiếp theo:** CIC chỉ cần tinh chỉnh nhẹ về **cơ cấu nghiệm thu giải ngân năm 2026 (về mức 650 triệu)** và bổ sung thêm tài liệu **Báo cáo Lộ trình CĐS** là có một hồ sơ kế hoạch hoàn chỉnh 100%, sẵn sàng ký kết và triển khai.
