/**
 * Script nạp dữ liệu mẫu 18 Nhiệm vụ Phục vụ Quản lý Nhà nước (Nhóm N1B - Điều 3 QC 2815)
 * Căn cứ: Chức năng nhiệm vụ đầu ngành thực tế của Viện KHCN Xây dựng (IBST)
 *
 * Chạy: node scripts/seed_pvqlnn_data.cjs
 */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

// 1. Đọc cấu hình .env
const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// 2. Danh mục 18 Nhiệm vụ Phục vụ Quản lý Nhà nước (N1B)
const SAMPLE_PVQLNN = [
  // --- NHÓM 1: QUY CHUẨN KỸ THUẬT QUỐC GIA (QCVN) ---
  {
    ten_nhiem_vu: 'Soát xét, sửa đổi Quy chuẩn Kỹ thuật Quốc gia QCVN 06:2026/BXD về An toàn cháy cho nhà và công trình',
    co_quan_giao: 'Bộ Xây dựng — Vụ Khoa học Công nghệ và Môi trường',
    so_van_ban_giao: '312/QĐ-BXD',
    ngay_giao: '2025-03-15',
    han_hoan_thanh: '2026-12-30',
    don_vi_id: 17, // TTTB
    nguoi_phu_trach_id: 421, // Trần Đình Dương
    kinh_phi: 3200, // triệu VNĐ
    nguon_kinh_phi: 'Ngân sách sự nghiệp Khoa học Công nghệ (Bộ Xây dựng)',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Dự thảo QCVN 06:2026/BXD, Thuyết minh kỹ thuật, Báo cáo tổng hợp tiếp thu ý kiến giải trình của Cục C07 (Bộ Công an) và các Hiệp hội DN.',
    ghi_chu: 'Nhiệm vụ trọng điểm cấp Quốc gia tháo gỡ khó khăn vướng mắc về PCCC cho công trình hiện hữu và dự án đầu tư mới.'
  },
  {
    ten_nhiem_vu: 'Xây dựng Quy chuẩn Kỹ thuật Quốc gia QCVN 02:2026/BXD về Số liệu điều kiện tự nhiên dùng trong xây dựng',
    co_quan_giao: 'Bộ Xây dựng — Vụ Khoa học Công nghệ và Môi trường',
    so_van_ban_giao: '188/QĐ-BXD',
    ngay_giao: '2025-01-20',
    han_hoan_thanh: '2026-10-15',
    don_vi_id: 3, // VDKT
    nguoi_phu_trach_id: 867, // Trần Huy Tấn
    kinh_phi: 2650,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Khoa học Công nghệ (Bộ Xây dựng)',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Bản đồ phân vùng áp lực gió bão chu kỳ 20 năm và 50 năm, bản đồ gia tốc nền động đất cập nhật theo chuỗi số liệu khí tượng mới nhất.',
    ghi_chu: 'Phối hợp với Tổng cục Khí tượng Thủy văn và Viện Vật lý Địa cầu.'
  },
  {
    ten_nhiem_vu: 'Biên soạn Quy chuẩn Kỹ thuật Quốc gia QCVN 03:2026/BXD về Phân cấp công trình xây dựng và nguyên tắc áp dụng',
    co_quan_giao: 'Bộ Xây dựng — Cục Giám định Nhà nước về chất lượng CTXD',
    so_van_ban_giao: '845/QĐ-BXD',
    ngay_giao: '2024-06-10',
    han_hoan_thanh: '2025-06-15',
    don_vi_id: 1, // VKC
    nguoi_phu_trach_id: 863, // Đỗ Tiến Thịnh
    kinh_phi: 1450,
    nguon_kinh_phi: 'Ngân sách Quản lý Nhà nước thường xuyên (Bộ Xây dựng)',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Thông tư ban hành QCVN 03:2026/BXD thay thế Thông tư số 06/2021/TT-BXD, Bộ tài liệu hướng dẫn xác định cấp công trình cho các Sở Xây dựng toàn quốc.',
    ghi_chu: 'Đã nghiệm thu cấp Bộ đạt loại Xuất sắc tháng 06/2025.'
  },

  // --- NHÓM 2: TIÊU CHUẨN QUỐC GIA (TCVN) ---
  {
    ten_nhiem_vu: 'Soát xét Tiêu chuẩn Quốc gia TCVN 5574:2026 "Thiết kế kết cấu bê tông và bê tông cốt thép"',
    co_quan_giao: 'Bộ Xây dựng — Vụ Khoa học Công nghệ và Môi trường',
    so_van_ban_giao: '516/QĐ-BXD',
    ngay_giao: '2024-09-01',
    han_hoan_thanh: '2026-02-28',
    don_vi_id: 2, // VBT
    nguoi_phu_trach_id: 860, // Hoàng Minh Đức
    kinh_phi: 2800,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Khoa học Công nghệ (Bộ Xây dựng)',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Dự thảo TCVN 5574:2026 hài hòa hệ thống tiêu chuẩn quốc tế Eurocode 2 và ACI 318; bộ bảng biểu tra cứu và ví dụ tính toán thực hành.',
    ghi_chu: 'Tiêu chuẩn nền tảng quan trọng nhất của ngành xây dựng dân dụng & công nghiệp Việt Nam.'
  },
  {
    ten_nhiem_vu: 'Xây dựng Tiêu chuẩn Quốc gia TCVN 9386:2026 "Thiết kế công trình chịu động đất - Phần 1: Quy định chung"',
    co_quan_giao: 'Bộ Xây dựng — Vụ Khoa học Công nghệ và Môi trường',
    so_van_ban_giao: '702/QĐ-BXD',
    ngay_giao: '2024-04-15',
    han_hoan_thanh: '2025-08-30',
    don_vi_id: 1, // VKC
    nguoi_phu_trach_id: 863, // Đỗ Tiến Thịnh
    kinh_phi: 2400,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Khoa học Công nghệ (Bộ Xây dựng)',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Văn bản Tiêu chuẩn Quốc gia TCVN 9386:2026 đã được Bộ KH&CN ký Quyết định công bố; phần mềm tiện ích tính toán phổ phản ứng thiết kế kháng chấn.',
    ghi_chu: 'Áp dụng bắt buộc cho các công trình cấp I, cấp đặc biệt và nhà cao tầng.'
  },
  {
    ten_nhiem_vu: 'Biên soạn TCVN "Bảo vệ kết cấu bê tông và bê tông cốt thép vùng biển và hải đảo chống ăn mòn"',
    co_quan_giao: 'Bộ Xây dựng — Đề án phát triển bền vững kinh tế biển Việt Nam',
    so_van_ban_giao: '412/QĐ-BXD',
    ngay_giao: '2024-05-10',
    han_hoan_thanh: '2025-11-20',
    don_vi_id: 5, // TTAM
    nguoi_phu_trach_id: 116, // Nguyễn Đăng Khoa
    kinh_phi: 1850,
    nguon_kinh_phi: 'Ngân sách Đề án biển đảo Quốc gia (Bộ Xây dựng)',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Bộ tiêu chuẩn kỹ thuật thiết kế bảo vệ chống ăn mòn ca-tốt (anode hy sinh và dòng điện ngoài) cho cầu cảng, giàn khoan và công trình ven biển.',
    ghi_chu: 'Nghiệm thu cấp Quốc gia đạt loại Xuất sắc; đã chuyển giao tài liệu cho Vùng Cảnh sát biển & Quân chủng Hải quân.'
  },
  {
    ten_nhiem_vu: 'Xây dựng TCVN "Kết cấu thép - Yêu cầu chế tạo, lắp dựng và nghiệm thu nhà siêu cao tầng"',
    co_quan_giao: 'Bộ Xây dựng — Vụ Khoa học Công nghệ và Môi trường',
    so_van_ban_giao: '633/QĐ-BXD',
    ngay_giao: '2025-02-18',
    han_hoan_thanh: '2026-09-15',
    don_vi_id: 13, // TTKCT
    nguoi_phu_trach_id: 857, // Đỗ Duy Liêm
    kinh_phi: 1650,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Khoa học Công nghệ (Bộ Xây dựng)',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Dự thảo tiêu chuẩn kỹ thuật kiểm soát dung sai hình học, quy trình siêu âm kiểm tra khuyết tật mối hàn kết cấu thép tổ hợp cường độ cao.',
    ghi_chu: 'Phục vụ thi công các dự án tòa tháp trung tâm tài chính trên 50 tầng.'
  },
  {
    ten_nhiem_vu: 'Biên soạn TCVN "Khung thông tin và dữ liệu mô hình thông tin công trình (BIM) trong quản lý vòng đời dự án"',
    co_quan_giao: 'Bộ Xây dựng — Ban chỉ đạo BIM Quốc gia',
    so_van_ban_giao: '258/QĐ-BXD',
    ngay_giao: '2025-04-10',
    han_hoan_thanh: '2026-11-30',
    don_vi_id: 19, // TTBIM
    nguoi_phu_trach_id: 787, // Bùi Hồng Văn
    kinh_phi: 1950,
    nguon_kinh_phi: 'Ngân sách Chương trình Chuyển đổi số Quốc gia',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Quy định chuẩn IFC, hệ thống phân loại cấu kiện Omniclass/Uniclass phù hợp điều kiện thực tiễn quản lý dự án đầu tư công tại Việt Nam.',
    ghi_chu: 'Thực hiện theo chỉ đạo của Thủ tướng Chính phủ tại Quyết định số 258/QĐ-TTg.'
  },

  // --- NHÓM 3: GIÁM ĐỊNH CHẤT LƯỢNG & SỰ CỐ CÔNG TRÌNH TRỌNG ĐIỂM QUỐC GIA ---
  {
    ten_nhiem_vu: 'Kiểm tra công tác nghiệm thu chất lượng công trình phục vụ Hội đồng Kiểm tra Nhà nước tại Cảng Hàng không Quốc tế Long Thành (Giai đoạn 1)',
    co_quan_giao: 'Hội đồng Kiểm tra Nhà nước về công tác nghiệm thu công trình xây dựng',
    so_van_ban_giao: '45/HĐKTNN-BXD',
    ngay_giao: '2024-03-01',
    han_hoan_thanh: '2026-12-31',
    don_vi_id: 4, // PVMN
    nguoi_phu_trach_id: 867, // Trần Huy Tấn
    kinh_phi: 4800,
    nguon_kinh_phi: 'Vốn ngân sách Nhà nước cấp cho Hội đồng Kiểm tra Nhà nước',
    trang_thai: 'dang-thuc-hien',
    ket_qua: '08 Báo cáo kiểm định chuyên sâu về độ đầm nén nền đất đường cất hạ cánh, độ chính xác lắp dựng kết cấu vòm mái hoa sen nhà ga T1, thí nghiệm cọc khoan nhồi chịu tải lớn.',
    ghi_chu: 'Nhiệm vụ đặc biệt phục vụ Đại công trình trọng điểm Quốc gia do Thủ tướng làm Trưởng ban chỉ đạo.'
  },
  {
    ten_nhiem_vu: 'Giám định kỹ thuật độc lập nguyên nhân hiện tượng nứt dầm hộp bê tông cầu cạn Vành đai 3 trên cao',
    co_quan_giao: 'Cục Giám định Nhà nước về chất lượng công trình xây dựng',
    so_van_ban_giao: '68/QĐ-GĐCL',
    ngay_giao: '2024-08-15',
    han_hoan_thanh: '2025-01-10',
    don_vi_id: 2, // VBT
    nguoi_phu_trach_id: 860, // Hoàng Minh Đức
    kinh_phi: 1250,
    nguon_kinh_phi: 'Ngân sách Quản lý Nhà nước thường xuyên (Bộ Xây dựng)',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Báo cáo kết quả quan trắc ứng suất dư bằng phương pháp từ tính, mô phỏng 3D dòng nhiệt thủy hóa và phương án gia cường dầm bằng dán sợi carbon CFRP.',
    ghi_chu: 'Đã báo cáo Bộ trưởng Bộ Xây dựng và bàn giao cho Sở GTVT Hà Nội triển khai thi công sửa chữa.'
  },
  {
    ten_nhiem_vu: 'Thẩm tra, đánh giá an toàn đập và hồ chứa thủy điện Sơn La và Hòa Bình trong điều kiện mưa lũ cực đoan',
    co_quan_giao: 'Ban Chỉ đạo Quốc gia về Phòng chống thiên tai & Bộ Công Thương',
    so_van_ban_giao: '112/QĐ-PCTT',
    ngay_giao: '2024-05-02',
    han_hoan_thanh: '2025-08-25',
    don_vi_id: 3, // VDKT
    nguoi_phu_trach_id: 867, // Trần Huy Tấn
    kinh_phi: 3500,
    nguon_kinh_phi: 'Ngân sách Dự phòng Quốc gia về Phòng chống thiên tai',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Hồ sơ tính toán ổn định trượt cung tròn và trượt phẳng thân đập bê tông trọng lực; kịch bản mô phỏng xả lũ lịch sử và bản đồ nguy cơ sạt trượt bờ hồ.',
    ghi_chu: 'Được Ban Chỉ đạo Quốc gia đánh giá cao về tính chính xác và kịp thời trước mùa mưa bão năm 2025.'
  },
  {
    ten_nhiem_vu: 'Giám định sự cố nứt thấm vỏ hầm đường bộ qua Đèo Cả do ảnh hưởng rung chấn địa chất',
    co_quan_giao: 'Bộ Giao thông Vận tải — Cục Đường bộ Việt Nam',
    so_van_ban_giao: '3412/CĐBVN-QLBT',
    ngay_giao: '2024-10-10',
    han_hoan_thanh: '2025-04-15',
    don_vi_id: 12, // PVMT
    nguoi_phu_trach_id: 452, // Nguyễn Minh Dương
    kinh_phi: 980,
    nguon_kinh_phi: 'Quỹ Bảo trì Đường bộ Trung ương',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Báo cáo đo quét Laser 3D toàn tuyến vỏ hầm, xác định vết nứt động và chỉ định công nghệ bơm keo Polyurethane kỵ nước áp lực cao.',
    ghi_chu: 'Nhiệm vụ đột xuất bảo đảm an toàn thông suốt huyết mạch giao thông Quốc lộ 1A.'
  },

  // --- NHÓM 4: ĐỊNH MỨC KINH TẾ - KỸ THUẬT BỘ XÂY DỰNG ---
  {
    ten_nhiem_vu: 'Xây dựng định mức dự toán công tác thí nghiệm chuyên ngành xây dựng (Las-XD) phục vụ quản lý chi phí đầu tư',
    co_quan_giao: 'Bộ Xây dựng — Cục Kinh tế Xây dựng',
    so_van_ban_giao: '425/QĐ-BXD',
    ngay_giao: '2025-02-01',
    han_hoan_thanh: '2026-09-30',
    don_vi_id: 8, // KHKT
    nguoi_phu_trach_id: 853, // Đỗ Văn Mạnh
    kinh_phi: 1350,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Kinh tế (Bộ Xây dựng)',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Bộ dữ liệu 450 danh mục định mức hao phí nhân công, vật tư, máy đo cho công tác nén tĩnh cọc, thử tải dầm, siêu âm khuyết tật cọc khoan nhồi.',
    ghi_chu: 'Cơ sở để Bộ Xây dựng ban hành Thông tư sửa đổi định mức dự toán xây dựng công trình.'
  },
  {
    ten_nhiem_vu: 'Xây dựng định mức kinh tế kỹ thuật công tác kiểm định chất lượng, đánh giá an toàn chịu lực công trình cầu đường bộ lớn',
    co_quan_giao: 'Bộ Giao thông Vận tải — Cục Quản lý đầu tư xây dựng',
    so_van_ban_giao: '789/QĐ-BGTVT',
    ngay_giao: '2024-03-20',
    han_hoan_thanh: '2025-07-15',
    don_vi_id: 16, // TTCNHT
    nguoi_phu_trach_id: 388, // Đỗ Trần Hùng
    kinh_phi: 1100,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Kinh tế (Bộ GTVT)',
    trang_thai: 'hoan-thanh',
    ket_qua: 'Bộ định mức chuyên ngành kiểm định cầu dây văng, cầu dầm hộp liên tục nhịp lớn; bảng xác định đơn giá chuẩn cho các đơn vị tư vấn.',
    ghi_chu: 'Đã được Hội đồng thẩm định Bộ GTVT thông qua và chuẩn bị áp dụng trên hệ thống đường bộ cao tốc Bắc - Nam.'
  },

  // --- NHÓM 5: CHIẾN LƯỢC, CHUYỂN ĐỔI SỐ & NET ZERO ---
  {
    ten_nhiem_vu: 'Xây dựng Lộ trình áp dụng Mô hình thông tin công trình (BIM) và Khung cơ sở dữ liệu số cho công trình hạ tầng đô thị',
    co_quan_giao: 'Bộ Xây dựng — Vụ Quy hoạch Kiến trúc',
    so_van_ban_giao: '540/QĐ-BXD',
    ngay_giao: '2025-05-15',
    han_hoan_thanh: '2026-12-31',
    don_vi_id: 19, // TTBIM
    nguoi_phu_trach_id: 787, // Bùi Hồng Văn
    kinh_phi: 2100,
    nguon_kinh_phi: 'Ngân sách Đề án Đô thị thông minh Quốc gia',
    trang_thai: 'dang-thuc-hien',
    ket_qua: 'Bộ tài liệu hướng dẫn thiết lập Môi trường Dữ liệu Chung (CDE), khung phân loại dữ liệu tài sản GIS-BIM cho 5 thành phố trực thuộc Trung ương.',
    ghi_chu: 'Nhiệm vụ phối hợp liên ngành với Bộ Thông tin và Truyền thông.'
  },
  {
    ten_nhiem_vu: 'Nghiên cứu đánh giá hiện trạng phát thải khí nhà kính và giải pháp công nghệ giảm phát thải carbon trong sản xuất bê tông thương phẩm (Net Zero 2050)',
    co_quan_giao: 'Bộ Xây dựng — Vụ Vật liệu Xây dựng',
    so_van_ban_giao: '219/QĐ-BXD',
    ngay_giao: '2025-08-01',
    han_hoan_thanh: '2026-11-15',
    don_vi_id: 7, // TTCN
    nguoi_phu_trach_id: 859, // Trần Minh Đức
    kinh_phi: 2350,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Bảo vệ môi trường (Bộ Xây dựng)',
    trang_thai: 'moi',
    ket_qua: 'Đề cương chi tiết và khảo sát định lượng lượng CO2 phát thải trên 1m3 bê tông; giải pháp thay thế clinker bằng tro bay và xỉ lò cao nghiền mịn.',
    ghi_chu: 'Thực hiện cam kết Quốc gia của Việt Nam tại COP26 về mục tiêu phát thải ròng bằng 0.'
  },
  {
    ten_nhiem_vu: 'Khảo sát đánh giá độ an toàn phòng cháy chữa cháy đối với loại hình nhà ở nhiều căn hộ (chung cư mini) trên địa bàn TP. Hà Nội',
    co_quan_giao: 'Ủy ban Nhân dân TP. Hà Nội & Sở Xây dựng Hà Nội',
    so_van_ban_giao: '4892/QĐ-UBND',
    ngay_giao: '2025-09-05',
    han_hoan_thanh: '2026-02-28',
    don_vi_id: 17, // TTTB
    nguoi_phu_trach_id: 421, // Trần Đình Dương
    kinh_phi: 850,
    nguon_kinh_phi: 'Ngân sách Quản lý Nhà nước thường xuyên (UBND TP. Hà Nội)',
    trang_thai: 'moi',
    ket_qua: 'Báo cáo đánh giá hiện trạng an toàn PCCC 1.200 nhà chung cư mini, cẩm nang hướng dẫn giải pháp cải tạo thoát nạn khẩn cấp và ngăn khói lan truyền.',
    ghi_chu: 'Nhiệm vụ cấp bách bảo vệ an toàn tính mạng cư dân theo chỉ đạo của Thành ủy Hà Nội.'
  },
  {
    ten_nhiem_vu: 'Biên soạn Hướng dẫn kỹ thuật đánh giá rủi ro ngập úng và lún sụt đô thị do biến đổi khí hậu tại vùng Đồng bằng Sông Cửu Long',
    co_quan_giao: 'Bộ Xây dựng — Cục Phát triển Đô thị',
    so_van_ban_giao: '104/QĐ-BXD',
    ngay_giao: '2024-02-15',
    han_hoan_thanh: '2025-11-30', // Đã quá hạn
    don_vi_id: 4, // PVMN
    nguoi_phu_trach_id: 867, // Trần Huy Tấn
    kinh_phi: 1700,
    nguon_kinh_phi: 'Ngân sách sự nghiệp Ứng phó Biến đổi khí hậu',
    trang_thai: 'qua-han',
    ket_qua: 'Dự thảo Sổ tay hướng dẫn đánh giá sụt lún mặt đất dựa trên ảnh vệ tinh InSAR; đang chờ tổng hợp văn bản góp ý của 13 tỉnh thành ĐBSCL.',
    ghi_chu: 'Chậm tiến độ 2 tháng do thời gian khảo sát thực địa kéo dài và các địa phương chậm phản hồi văn bản góp ý.'
  }
];

async function main() {
  console.log('--- BẮT ĐẦU NẠP DỮ LIỆU MẪU NHIỆM VỤ PVQLNN (N1B) ---');

  // 1. Dọn dẹp dữ liệu cũ nếu có
  const { error: delErr } = await supabase.from('nhiem_vu_pvqlnn').delete().neq('id', 0);
  if (delErr) {
    console.warn('Cảnh báo khi xóa bảng cũ (có thể bảng đang rỗng):', delErr.message);
  } else {
    console.log('✔ Đã làm sạch bảng nhiem_vu_pvqlnn.');
  }

  // 2. Chèn 18 bản ghi mẫu
  const { data: inserted, error: insErr } = await supabase
    .from('nhiem_vu_pvqlnn')
    .insert(SAMPLE_PVQLNN)
    .select('id, ten_nhiem_vu, kinh_phi, trang_thai');

  if (insErr) {
    console.error('❌ Lỗi khi insert dữ liệu mẫu:', insErr);
    process.exit(1);
  }

  console.log(`✔ Đã nạp thành công ${inserted.length} nhiệm vụ PVQLNN vào CSDL!`);

  // 3. Thống kê KPI
  const totalKinhPhi = SAMPLE_PVQLNN.reduce((sum, item) => sum + item.kinh_phi, 0);
  const countMoi = SAMPLE_PVQLNN.filter(i => i.trang_thai === 'moi').length;
  const countDangTH = SAMPLE_PVQLNN.filter(i => i.trang_thai === 'dang-thuc-hien').length;
  const countHoanThanh = SAMPLE_PVQLNN.filter(i => i.trang_thai === 'hoan-thanh').length;
  const countQuaHan = SAMPLE_PVQLNN.filter(i => i.trang_thai === 'qua-han').length;

  console.log('\n================ TỔNG KẾT DỮ LIỆU PVQLNN ================');
  console.log(`- Tổng số nhiệm vụ      : ${SAMPLE_PVQLNN.length}`);
  console.log(`- Tổng kinh phí cấp     : ${totalKinhPhi.toLocaleString('vi-VN')} triệu đ (~${(totalKinhPhi / 1000).toFixed(2)} tỷ đ)`);
  console.log(`- Hoàn thành            : ${countHoanThanh} nhiệm vụ (${((countHoanThanh / SAMPLE_PVQLNN.length) * 100).toFixed(1)}%)`);
  console.log(`- Đang thực hiện        : ${countDangTH} nhiệm vụ (${((countDangTH / SAMPLE_PVQLNN.length) * 100).toFixed(1)}%)`);
  console.log(`- Mới giao              : ${countMoi} nhiệm vụ`);
  console.log(`- Quá hạn               : ${countQuaHan} nhiệm vụ (phục vụ cảnh báo)`);
  console.log('=========================================================\n');
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
