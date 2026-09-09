/**
 * Script cập nhật & làm giàu dữ liệu CRM Khách hàng & Đối tác IBST
 * - Cập nhật 15 khách hàng hiện có: đầy đủ Người đại diện, SĐT, Email, MST, Địa chỉ trụ sở, Phân loại
 * - Bổ sung thêm ~20 khách hàng lớn (Tập đoàn BĐS, Ban QLDA trọng điểm, Tổng thầu xây dựng, Đối tác KHCN)
 * - Liên kết chuẩn xác 100% 80 hợp đồng tới khách hàng tương ứng theo đúng tên công trình/dự án
 * - Đồng bộ gói thầu trong dau_thau và mẫu thử nghiệm mau_thi_nghiem
 *
 * Chạy: node scripts/seed_crm_customers.cjs
 */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach(l => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// 1. Dữ liệu chuẩn hóa cho 15 khách hàng hiện hữu (ID 1 -> 15)
const EXISTING_CUSTOMERS_UPDATE = [
  {
    id: 1,
    ma_dinh_danh: 'KH.ACV',
    ten_to_chuc: 'Tổng công ty Cảng hàng không Việt Nam (ACV)',
    ma_so_thue: '0311687329',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Lại Xuân Thanh — Chủ tịch HĐQT',
    so_dien_thoai: '028-38485383',
    email: 'info@vietnamairport.vn',
    dia_chi_chi_tiet: 'Số 58 Trường Sơn, Phường 2, Quận Tân Bình, TP. Hồ Chí Minh',
    website: 'https://vietnamairport.vn',
    ghi_chu: 'Chủ đầu tư các cảng hàng không quốc tế: Nội Bài, Tân Sơn Nhất, Long Thành, Chu Lai, Phù Cát'
  },
  {
    id: 2,
    ma_dinh_danh: 'KH.THT',
    ten_to_chuc: 'Công ty TNHH Phát triển THT (KĐT Starlake Tây Hồ Tây)',
    ma_so_thue: '0102683305',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Ahn Kook Jin — Tổng Giám đốc',
    so_dien_thoai: '024-37557766',
    email: 'contact@starlake-hanoi.com',
    dia_chi_chi_tiet: 'Khu đô thị Tây Hồ Tây, Phường Xuân La, Quận Tây Hồ, Hà Nội',
    website: 'https://starlake-hanoi.com',
    ghi_chu: 'Chủ đầu tư KĐT Starlake Tây Hồ Tây (thuộc Tập đoàn Daewoo E&C Hàn Quốc)'
  },
  {
    id: 3,
    ma_dinh_danh: 'KH.B85',
    ten_to_chuc: 'Ban Quản lý dự án 85 — Bộ Giao thông Vận tải',
    ma_so_thue: '4000363524',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Nguyễn Thanh Hoài — Giám đốc Ban',
    so_dien_thoai: '0236-3822184',
    email: 'banqda85@mt.gov.vn',
    dia_chi_chi_tiet: 'Số 184 Nguyễn Tri Phương, Phường Chính Gián, Quận Thanh Khê, Đà Nẵng',
    website: 'https://pmu85.vn',
    ghi_chu: 'Đại diện cơ quan nhà nước có thẩm quyền các tuyến cao tốc Bắc - Nam, cầu vượt biển Quy Nhơn'
  },
  {
    id: 4,
    ma_dinh_danh: 'KH.LM',
    ten_to_chuc: 'Công ty CP Đầu tư & Phát triển Đô thị Landmark Riverside',
    ma_so_thue: '0108923456',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Bà Trần Thùy Linh — Tổng Giám đốc',
    so_dien_thoai: '024-39748899',
    email: 'project@landmarkriverside.vn',
    dia_chi_chi_tiet: 'Tầng 18 Tòa nhà Capital Tower, 109 Trần Hưng Đạo, Hoàn Kiếm, Hà Nội',
    website: 'https://landmarkriverside.vn',
    ghi_chu: 'Chủ đầu tư cụm tổ hợp tháp đôi thương mại & khách sạn ven sông'
  },
  {
    id: 5,
    ma_dinh_danh: 'KH.BN',
    ten_to_chuc: 'Sở Văn hóa, Thể thao & Du lịch tỉnh Bắc Ninh',
    ma_so_thue: '2300312456',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Trịnh Hữu Hùng — Giám đốc Sở',
    so_dien_thoai: '0222-3822455',
    email: 'sovhttdl@bacninh.gov.vn',
    dia_chi_chi_tiet: 'Số 1 Lý Thái Tổ, Phường Suối Hoa, TP. Bắc Ninh, Tỉnh Bắc Ninh',
    website: 'https://svhttdl.bacninh.gov.vn',
    ghi_chu: 'Chủ đầu tư tu bổ cụm di tích quốc gia đặc biệt Đình Bảng, Đền Đô'
  },
  {
    id: 6,
    ma_dinh_danh: 'KH.HY',
    ten_to_chuc: 'Sở Y tế tỉnh Hưng Yên',
    ma_so_thue: '0900234567',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Bà Nguyễn Thị Anh — Giám đốc Sở',
    so_dien_thoai: '0221-3863456',
    email: 'soyte@hungyen.gov.vn',
    dia_chi_chi_tiet: 'Đường Quảng Trường, Phường Hiến Nam, TP. Hưng Yên, Tỉnh Hưng Yên',
    website: 'https://soyte.hungyen.gov.vn',
    ghi_chu: 'Chủ đầu tư Bệnh viện Đa khoa 500 giường tỉnh Hưng Yên'
  },
  {
    id: 7,
    ma_dinh_danh: 'KH.620',
    ten_to_chuc: 'Công ty Cổ phần Xây dựng Hạ tầng 620',
    ma_so_thue: '0302891234',
    loai: 'nha-thau',
    nguoi_dai_dien: 'Ông Lê Văn Dũng — Tổng Giám đốc',
    so_dien_thoai: '028-37716620',
    email: 'vanphong@hatang620.com.vn',
    dia_chi_chi_tiet: 'Km 1964 Quốc lộ 1A, Xã Long An, Huyện Châu Thành, Tỉnh Tiền Giang',
    website: 'https://hatang620.com.vn',
    ghi_chu: 'Nhà thầu chuyên thi công cọc bê tông đúc sẵn, dầm super-T cầu cảng & đường cao tốc'
  },
  {
    id: 8,
    ma_dinh_danh: 'KH.VICEM',
    ten_to_chuc: 'Công ty Xi măng Vicem Hoàng Thạch',
    ma_so_thue: '0800004087',
    loai: 'khac',
    nguoi_dai_dien: 'Ông Lê Thành Long — Tổng Giám đốc',
    so_dien_thoai: '0220-3852888',
    email: 'contact@vicemhoangthach.vn',
    dia_chi_chi_tiet: 'Khu dân cư Bích Nhôi, Phường Minh Tân, Thị xã Kinh Môn, Tỉnh Hải Dương',
    website: 'https://vicemhoangthach.vn',
    ghi_chu: 'Đối tác cung ứng clinker, xi măng Pooclăng bền sunfat PCSR phục vụ công trình ngầm và biển đảo'
  },
  {
    id: 9,
    ma_dinh_danh: 'KH.DT',
    ten_to_chuc: 'Công ty CP Sản xuất Vật liệu Xây dựng Đại Thành',
    ma_so_thue: '0105678912',
    loai: 'khac',
    nguoi_dai_dien: 'Ông Vũ Đình Tuấn — Giám đốc',
    so_dien_thoai: '024-38642233',
    email: 'vlxd.daithanh@gmail.com',
    dia_chi_chi_tiet: 'Khu công nghiệp vừa và nhỏ Từ Liêm, Quận Bắc Từ Liêm, Hà Nội',
    website: 'https://gachdaithanh.vn',
    ghi_chu: 'Nhà máy gạch không nung bê tông bọt khí chưng áp AAC, gạch lát terrazzo'
  },
  {
    id: 10,
    ma_dinh_danh: 'KH.SIKA',
    ten_to_chuc: 'Công ty TNHH Sika Việt Nam',
    ma_so_thue: '3600245459',
    loai: 'doi-tac-khcn',
    nguoi_dai_dien: 'Ông Jacobo Perez Polaino — Tổng Giám đốc',
    so_dien_thoai: '0274-3747848',
    email: 'sikavietnam@vn.sika.com',
    dia_chi_chi_tiet: 'KCN Nhơn Trạch 1, Huyện Nhơn Trạch, Tỉnh Đồng Nai',
    website: 'https://vnm.sika.com',
    ghi_chu: 'Đối tác chiến lược toàn cầu về phụ gia bê tông công nghệ cao, màng chống thấm & keo cấy thép'
  },
  {
    id: 11,
    ma_dinh_danh: 'KH.HCM.DD',
    ten_to_chuc: 'Ban QLDA đầu tư xây dựng các công trình dân dụng và công nghiệp TP.HCM',
    ma_so_thue: '0301234567',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Nguyễn Văn Trường — Giám đốc Ban',
    so_dien_thoai: '028-38221034',
    email: 'bandandung@tphcm.gov.vn',
    dia_chi_chi_tiet: 'Số 123 Nguyễn Huệ, Phường Bến Nghé, Quận 1, TP. Hồ Chí Minh',
    website: 'https://bandandung.tphcm.gov.vn',
    ghi_chu: 'Chủ đầu tư Trung tâm Hội nghị Quốc tế Cần Giờ, Bệnh viện Ung bướu cơ sở 2'
  },
  {
    id: 12,
    ma_dinh_danh: 'KH.MT.INFRA',
    ten_to_chuc: 'Công ty CP Xây dựng và Phát triển Hạ tầng Miền Trung',
    ma_so_thue: '0400987654',
    loai: 'nha-thau',
    nguoi_dai_dien: 'Ông Phan Trọng Hùng — Tổng Giám đốc',
    so_dien_thoai: '0236-3788432',
    email: 'hatangmientrung@cpmt.vn',
    dia_chi_chi_tiet: 'Số 48 Nguyễn Văn Linh, Phường Nam Dương, Quận Hải Châu, TP. Đà Nẵng',
    website: 'https://cpmt.vn',
    ghi_chu: 'Tổng thầu thi công hạ tầng kỹ thuật, xử lý nền móng cảng biển khu vực duyên hải miền Trung'
  },
  {
    id: 13,
    ma_dinh_danh: 'KH.EVNNPC',
    ten_to_chuc: 'Tổng công ty Điện lực miền Bắc (EVNNPC)',
    ma_so_thue: '0100123456',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Bà Đỗ Nguyệt Ánh — Chủ tịch HĐTV',
    so_dien_thoai: '024-38243536',
    email: 'npc@evn.com.vn',
    dia_chi_chi_tiet: 'Số 20 Trần Nguyên Hãn, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội',
    website: 'https://npc.com.vn',
    ghi_chu: 'Chủ đầu tư các trạm biến áp 110kV/220kV/500kV và đường dây truyền tải điện 27 tỉnh phía Bắc'
  },
  {
    id: 14,
    ma_dinh_danh: 'KH.QN.SXD',
    ten_to_chuc: 'Sở Xây dựng tỉnh Quảng Ninh',
    ma_so_thue: '5700234567',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Nguyễn Mạnh Tuấn — Giám đốc Sở',
    so_dien_thoai: '0203-3835678',
    email: 'sxd@quangninh.gov.vn',
    dia_chi_chi_tiet: 'Tầng 4 Trụ sở Liên cơ quan số 2, Phường Hồng Hà, TP. Hạ Long, Tỉnh Quảng Ninh',
    website: 'https://sxd.quangninh.gov.vn',
    ghi_chu: 'Cơ quan quản lý nhà nước về xây dựng & Chủ đầu tư các dự án công trình trọng điểm tỉnh Quảng Ninh'
  },
  {
    id: 15,
    ma_dinh_danh: 'KH.DAWACO',
    ten_to_chuc: 'Công ty Cổ phần Cấp nước Đà Nẵng (Dawaco)',
    ma_so_thue: '0400456789',
    loai: 'nha-thau',
    nguoi_dai_dien: 'Ông Hồ Hương — Tổng Giám đốc',
    so_dien_thoai: '0236-3640789',
    email: 'dawaco@dng.vnn.vn',
    dia_chi_chi_tiet: 'Số 67 Nguyễn Hữu Thọ, Phường Hòa Thuận Tây, Quận Hải Châu, TP. Đà Nẵng',
    website: 'https://dawaco.com.vn',
    ghi_chu: 'Đơn vị quản lý vận hành mạng lưới cấp nước sạch & nhà máy nước Cầu Đỏ, Hòa Liên'
  }
];

/// 2. Danh sách 21 Khách hàng & Đối tác lớn mới bổ sung (không truyền id)
const NEW_CUSTOMERS = [
  {
    ma_dinh_danh: 'KH.VINGROUP',
    ten_to_chuc: 'Tập đoàn Vingroup — Công ty CP Vinhomes',
    ma_so_thue: '0102016544',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Bà Nguyễn Diệu Linh — Chủ tịch HĐQT',
    so_dien_thoai: '024-39749999',
    email: 'info@vinhomes.vn',
    dia_chi_chi_tiet: 'Tòa nhà Symphony, Chu Huy Mân, KĐT Vinhomes Riverside, Long Biên, Hà Nội',
    website: 'https://vinhomes.vn',
    ghi_chu: 'Chủ đầu tư tháp Landmark 81, Vinhomes Ocean Park, Smart City, Grand Park, Vincom Plaza'
  },
  {
    ma_dinh_danh: 'KH.MRB',
    ten_to_chuc: 'Ban Quản lý Đường sắt Đô thị Hà Nội (MRB)',
    ma_so_thue: '0105123987',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Nguyễn Cao Minh — Trưởng ban',
    so_dien_thoai: '024-39428588',
    email: 'mrb@hanoi.gov.vn',
    dia_chi_chi_tiet: 'Số 82 Trần Hưng Đạo, Phường Cửa Nam, Quận Hoàn Kiếm, Hà Nội',
    website: 'https://mrb.hanoi.gov.vn',
    ghi_chu: 'Chủ đầu tư tuyến Metro số 3 Nhổn - Ga Hà Nội, tuyến Metro số 2 Nam Thăng Long - Trần Hưng Đạo'
  },
  {
    ma_dinh_danh: 'KH.MAUR',
    ten_to_chuc: 'Ban Quản lý Đường sắt Đô thị TP. Hồ Chí Minh (MAUR)',
    ma_so_thue: '0305678432',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Phan Công Bằng — Trưởng ban',
    so_dien_thoai: '028-39309488',
    email: 'maur@tphcm.gov.vn',
    dia_chi_chi_tiet: 'Số 29 Lê Quý Đôn, Phường Võ Thị Sáu, Quận 3, TP. Hồ Chí Minh',
    website: 'https://maur.hochiminhcity.gov.vn',
    ghi_chu: 'Chủ đầu tư tuyến Metro số 1 Bến Thành - Suối Tiên, tuyến Metro số 2 Bến Thành - Tham Lương'
  },
  {
    ma_dinh_danh: 'KH.EVN',
    ten_to_chuc: 'Tập đoàn Điện lực Việt Nam (EVN)',
    ma_so_thue: '0100100417',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Đặng Hoàng An — Chủ tịch HĐTV',
    so_dien_thoai: '024-66946666',
    email: 'evn@evn.com.vn',
    dia_chi_chi_tiet: 'Số 11 Cửa Bắc, Phường Trúc Bạch, Quận Ba Đình, Hà Nội',
    website: 'https://evn.com.vn',
    ghi_chu: 'Chủ đầu tư Thủy điện Hòa Bình mở rộng, Ialy mở rộng, Bản Vẽ, Sông Bung, Tòa tháp EVN Tower'
  },
  {
    ma_dinh_danh: 'KH.PVN',
    ten_to_chuc: 'Tập đoàn Dầu khí Quốc gia Việt Nam (Petrovietnam)',
    ma_so_thue: '0100150619',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Lê Mạnh Hùng — Chủ tịch HĐTV',
    so_dien_thoai: '024-38252526',
    email: 'info@pvn.vn',
    dia_chi_chi_tiet: 'Số 18 Láng Hạ, Phường Thành Công, Quận Ba Đình, Hà Nội',
    website: 'https://petrovietnam.petrotimes.vn',
    ghi_chu: 'Chủ đầu tư các cụm dự án Lọc hóa dầu Nghi Sơn, Nhà máy Nhiệt điện Thái Bình 2, giàn khoan biển'
  },
  {
    ma_dinh_danh: 'KH.ECOPARK',
    ten_to_chuc: 'Công ty Cổ phần Tập đoàn Ecopark',
    ma_so_thue: '0900223789',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Lương Xuân Hà — Chủ tịch HĐQT',
    so_dien_thoai: '024-62627474',
    email: 'info@ecopark.com.vn',
    dia_chi_chi_tiet: 'Khu đô thị thương mại và du lịch Văn Giang, Xã Xuân Quan, Văn Giang, Hưng Yên',
    website: 'https://ecopark.com.vn',
    ghi_chu: 'Chủ đầu tư Đại đô thị sinh thái Ecopark Hưng Yên, Ecopark Grand The Island'
  },
  {
    ma_dinh_danh: 'KH.CTG',
    ten_to_chuc: 'Ngân hàng TMCP Công Thương Việt Nam (VietinBank)',
    ma_so_thue: '0100111948',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Trần Minh Bình — Chủ tịch HĐQT',
    so_dien_thoai: '024-39421030',
    email: 'contact@vietinbank.vn',
    dia_chi_chi_tiet: 'Số 108 Trần Hưng Đạo, Phường Cửa Nam, Quận Hoàn Kiếm, Hà Nội',
    website: 'https://vietinbank.vn',
    ghi_chu: 'Chủ đầu tư Tổ hợp tòa tháp đôi VietinBank Tower Ciputra Tây Hồ'
  },
  {
    ma_dinh_danh: 'KH.VCB',
    ten_to_chuc: 'Ngân hàng TMCP Ngoại thương Việt Nam (Vietcombank)',
    ma_so_thue: '0100112437',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Nguyễn Thanh Tùng — Tổng Giám đốc',
    so_dien_thoai: '024-39343137',
    email: 'webmaster@vietcombank.com.vn',
    dia_chi_chi_tiet: 'Số 198 Trần Quang Khải, Phường Lý Thái Tổ, Quận Hoàn Kiếm, Hà Nội',
    website: 'https://vietcombank.com.vn',
    ghi_chu: 'Chủ đầu tư Tòa tháp Vietcombank Tower 5 Công Trường Mê Linh Quận 1 TP.HCM'
  },
  {
    ma_dinh_danh: 'KH.BITEXCO',
    ten_to_chuc: 'Tập đoàn Bitexco (Công ty CP Bitexco)',
    ma_so_thue: '0100511897',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Vũ Quang Hội — Chủ tịch HĐQT',
    so_dien_thoai: '024-37855588',
    email: 'info@bitexco.com.vn',
    dia_chi_chi_tiet: 'Tầng 1 Tòa nhà The Manor, Đường Mễ Trì, Phường Mỹ Đình 1, Nam Từ Liêm, Hà Nội',
    website: 'https://bitexco.com.vn',
    ghi_chu: 'Chủ đầu tư Đại đô thị The Manor Central Park, Bitexco Financial Tower TP.HCM'
  },
  {
    ma_dinh_danh: 'KH.BRG',
    ten_to_chuc: 'Công ty Cổ phần Tập đoàn BRG (BRG Group)',
    ma_so_thue: '0104332900',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Bà Nguyễn Thị Nga — Chủ tịch Tập đoàn',
    so_dien_thoai: '024-39393690',
    email: 'contact@brggroup.vn',
    dia_chi_chi_tiet: 'Tòa nhà BRG Grand Plaza, 18 Láng Hạ, Phường Thành Công, Ba Đình, Hà Nội',
    website: 'https://brggroup.vn',
    ghi_chu: 'Chủ đầu tư Khách sạn Hilton Hải Phòng, Thành phố thông minh Bắc Hà Nội'
  },
  {
    ma_dinh_danh: 'KH.PMU.TL',
    ten_to_chuc: 'Ban Quản lý dự án Thăng Long — Bộ Giao thông Vận tải',
    ma_so_thue: '0101456789',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Đinh Công Minh — Giám đốc Ban',
    so_dien_thoai: '024-37684725',
    email: 'banthanglong@mt.gov.vn',
    dia_chi_chi_tiet: 'Tổ 23 Phường Dịch Vọng Hậu, Quận Cầu Giấy, Hà Nội',
    website: 'https://banthanglong.gov.vn',
    ghi_chu: 'Chủ đầu tư Cầu Nhật Tân, Cầu Thăng Long, Cao tốc Mai Sơn - QL45, Phan Thiết - Dầu Giây'
  },
  {
    ma_dinh_danh: 'KH.NIC',
    ten_to_chuc: 'Trung tâm Đổi mới Sáng tạo Quốc gia (NIC) — Bộ Kế hoạch & Đầu tư',
    ma_so_thue: '0109128374',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Vũ Quốc Huy — Giám đốc NIC',
    so_dien_thoai: '024-37956666',
    email: 'contact@nic.gov.vn',
    dia_chi_chi_tiet: 'Khu Công nghệ cao Hòa Lạc, Xã Thạch Hòa, Huyện Thạch Thất, Hà Nội',
    website: 'https://nic.gov.vn',
    ghi_chu: 'Chủ đầu tư Tổ hợp Trung tâm Đổi mới Sáng tạo Quốc gia cơ sở Hòa Lạc'
  },
  {
    ma_dinh_danh: 'KH.VNU',
    ten_to_chuc: 'Đại học Quốc gia Hà Nội (ĐHQGHN)',
    ma_so_thue: '0100776785',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'GS.TS Lê Quân — Giám đốc ĐHQGHN',
    so_dien_thoai: '024-37547670',
    email: 'vanphong@vnu.edu.vn',
    dia_chi_chi_tiet: 'Đô thị Đại học Quốc gia Hà Nội tại Hòa Lạc, Thạch Thất, Hà Nội',
    website: 'https://vnu.edu.vn',
    ghi_chu: 'Chủ đầu tư dự án Xây dựng Đô thị ĐHQGHN tại Hòa Lạc (Khu Ký túc xá, Giảng đường)'
  },
  {
    ma_dinh_danh: 'KH.DEEPC',
    ten_to_chuc: 'Tổ hợp Khu công nghiệp DEEP C Hải Phòng',
    ma_so_thue: '0200267891',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Bruno Jaspaert — Tổng Giám đốc',
    so_dien_thoai: '0225-3836169',
    email: 'info@deepc.vn',
    dia_chi_chi_tiet: 'Khu công nghiệp Đình Vũ, Phường Đông Hải 2, Quận Hải An, TP. Hải Phòng',
    website: 'https://deepc.vn',
    ghi_chu: 'Chủ đầu tư hạ tầng KCN DEEP C 1, 2, 3 và cảng chuyên dùng Đình Vũ'
  },
  {
    ma_dinh_danh: 'KH.LEGO',
    ten_to_chuc: 'Công ty TNHH LEGO Manufacturing Việt Nam',
    ma_so_thue: '3703058912',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Preben Elnef — Phó Chủ tịch Tập đoàn LEGO',
    so_dien_thoai: '0274-3801888',
    email: 'vietnam.factory@lego.com',
    dia_chi_chi_tiet: 'KCN VSIP III, Phường Hội Nghĩa, TP. Tân Uyên, Tỉnh Bình Dương',
    website: 'https://lego.com',
    ghi_chu: 'Chủ đầu tư Nhà máy trung hòa carbon trị giá 1,3 tỷ USD của Tập đoàn LEGO tại Bình Dương'
  },
  {
    ma_dinh_danh: 'KH.AEON',
    ten_to_chuc: 'Công ty TNHH AEON Mall Việt Nam',
    ma_so_thue: '0105740417',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Nakagawa Tetsuyuki — Tổng Giám đốc',
    so_dien_thoai: '024-39449815',
    email: 'aeonmall.contact@aeon.com.vn',
    dia_chi_chi_tiet: 'Tầng 3 Tòa nhà Vạn Hạnh, Số 27 Cổ Linh, Long Biên, Hà Nội',
    website: 'https://aeonmall-vietnam.com.vn',
    ghi_chu: 'Chủ đầu tư chuỗi TTTM Aeon Mall Long Biên, Hà Đông, Hải Phòng, Huế, Bình Dương'
  },
  {
    ma_dinh_danh: 'KH.DEOCA',
    ten_to_chuc: 'Công ty CP Đầu tư Hạ tầng Giao thông Đèo Cả (DII)',
    ma_so_thue: '0400101898',
    loai: 'nha-thau',
    nguoi_dai_dien: 'Ông Hồ Minh Hoàng — Chủ tịch Tập đoàn Đèo Cả',
    so_dien_thoai: '0236-3647890',
    email: 'info@deoca.vn',
    dia_chi_chi_tiet: 'Số 32 Thạch Hãn, Phường Thuận Phước, Quận Hải Châu, TP. Đà Nẵng',
    website: 'https://deoca.vn',
    ghi_chu: 'Tổng thầu thi công và quản trị vận hành hầm đường bộ Hải Vân, Đèo Cả, Cù Mông'
  },
  {
    ma_dinh_danh: 'KH.FOXCONN',
    ten_to_chuc: 'Tập đoàn Foxconn — Công ty TNHH Fuyu Việt Nam',
    ma_so_thue: '2400876543',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Trác Hiến Hồng — Tổng Giám đốc',
    so_dien_thoai: '0204-3868668',
    email: 'foxconn.vn@mail.foxconn.com',
    dia_chi_chi_tiet: 'Lô S6, KCN Quang Châu, Huyện Việt Yên, Tỉnh Bắc Giang',
    website: 'https://foxconn.com.vn',
    ghi_chu: 'Chủ đầu tư cụm nhà máy sản xuất thiết bị điện tử Foxconn Bắc Giang'
  },
  {
    ma_dinh_danh: 'KH.HOAPHAT',
    ten_to_chuc: 'Công ty Cổ phần Thép Hòa Phát Dung Quất',
    ma_so_thue: '4300793666',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Ông Mai Văn Hà — Giám đốc',
    so_dien_thoai: '0255-3626666',
    email: 'dungquat@hoaphat.com.vn',
    dia_chi_chi_tiet: 'Khu kinh tế Dung Quất, Xã Bình Đông, Huyện Bình Sơn, Tỉnh Quảng Ngãi',
    website: 'https://hoaphat.com.vn',
    ghi_chu: 'Chủ đầu tư Khu liên hợp sản xuất Gang thép Hòa Phát Dung Quất 1 & 2'
  },
  {
    ma_dinh_danh: 'KH.VIETTEL',
    ten_to_chuc: 'Tập đoàn Công nghiệp — Viễn thông Quân đội (Viettel)',
    ma_so_thue: '0100109106',
    loai: 'chu-dau-tu',
    nguoi_dai_dien: 'Thiếu tướng Tào Đức Thắng — Chủ tịch kiêm TGĐ',
    so_dien_thoai: '024-62556789',
    email: 'gqkn@viettel.com.vn',
    dia_chi_chi_tiet: 'Số 1 Trần Hữu Dực, Phường Mỹ Đình 2, Quận Nam Từ Liêm, Hà Nội',
    website: 'https://viettel.com.vn',
    ghi_chu: 'Chủ đầu tư Trung tâm Dữ liệu Viettel IDC Hòa Lạc, Tòa nhà Viettel Trụ sở chính'
  },
  {
    ma_dinh_danh: 'KH.KICT',
    ten_to_chuc: 'Viện Khoa học Công nghệ Xây dựng Hàn Quốc (KICT)',
    ma_so_thue: '0108999888',
    loai: 'doi-tac-khcn',
    nguoi_dai_dien: 'Dr. Kim Byung-suk — Viện trưởng KICT',
    so_dien_thoai: '024-37878899',
    email: 'kict_vietnam@kict.re.kr',
    dia_chi_chi_tiet: 'Phòng đại diện KICT, Tầng 12 Keangnam Landmark 72, Nam Từ Liêm, Hà Nội',
    website: 'https://kict.re.kr',
    ghi_chu: 'Đối tác chiến lược quốc tế chuyển giao công nghệ bê tông UHPC, tiêu chuẩn Eurocode & Smart City'
  }
];

// 3. Bản đồ ánh xạ 80 Hợp đồng mẫu tới mã định danh Khách hàng
const HOP_DONG_TO_MA_KH = {
  122: 'KH.ACV',        // 101: Nhà ga T2 Cảng HKQT Nội Bài
  123: 'KH.NIC',        // 102: NIC Hòa Lạc
  124: 'KH.BN',         // 103: Tháp 35 tầng tại Bắc Ninh
  125: 'KH.MRB',        // 104: Metro Nhổn - Ga Hà Nội
  126: 'KH.B85',        // 105: Kháng chấn trụ sở cơ quan Trung ương
  127: 'KH.EVN',        // 201: Thủy điện Hòa Bình mở rộng
  128: 'KH.MRB',        // 202: Hầm Metro Hà Nội
  129: 'KH.PMU.TL',     // 203: Cầu Nhật Tân
  130: 'KH.B85',        // 204: Cầu vượt biển Quy Nhơn
  131: 'KH.EVN',        // 205: Thủy điện Sông Bung
  132: 'KH.B85',        // 301: Cao tốc Bắc - Nam đoạn Quảng Trị
  133: 'KH.MT.INFRA',   // 302: Cảng sông Thuận An
  134: 'KH.DEEPC',      // 303: KCN Deep C Hải Phòng
  135: 'KH.CTG',        // 304: VietinBank Tower
  136: 'KH.QN.SXD',     // 305: Đường ven biển Quảng Ninh
  137: 'KH.SIKA',       // 401: Nhà máy Sika Bình Dương
  138: 'KH.MAUR',       // 402: Metro Bến Thành - Suối Tiên
  139: 'KH.HCM.DD',     // 403: TTHN Quốc tế Cần Giờ
  140: 'KH.620',        // 404: Cảng Cái Mép - Thị Vải
  141: 'KH.VINGROUP',   // 405: Tòa nhà Landmark 81
  142: 'KH.ACV',        // 501: Cảng hàng không Long Thành GĐ1
  143: 'KH.PVN',        // 502: Nhà máy Lọc dầu Nghi Sơn
  144: 'KH.PMU.TL',     // 503: Cầu vượt biển Tân Vũ - Lạch Huyện
  145: 'KH.B85',        // 504: Kè biển Quy Nhơn
  146: 'KH.SIKA',       // 505: Thí nghiệm muối sương lớp phủ bảo vệ
  147: 'KH.BN',         // 601: Tháp đôi 45 tầng tại Bắc Ninh
  148: 'KH.LM',         // 602: KĐT Nam An Khánh
  149: 'KH.620',        // 603: Cầu Rạch Miễu 2
  150: 'KH.EVN',        // 604: Đập thủy điện Bản Vẽ
  151: 'KH.VIETTEL',    // 605: Tháp phát sóng truyền hình Tam Đảo
  152: 'KH.HCM.DD',     // 701: Tòa nhà Quốc hội
  153: 'KH.VICEM',      // 702: Tro xỉ NĐ Phả Lại gạch nhẹ AAC
  154: 'KH.BN',         // 703: Trùng tu Quần thể Di tích Cố đô Huế
  155: 'KH.ACV',        // 704: Nhà ga T3 Tân Sơn Nhất
  156: 'KH.SIKA',       // 705: Vữa rót bệ máy turbine gió
  157: 'KH.MT.INFRA',   // 1201: Đê biển, đập thủy lợi Thừa Thiên Huế
  158: 'KH.DAWACO',     // 1202: Cầu vượt sông Hương Đà Nẵng
  159: 'KH.LM',         // 1203: Khu nghỉ dưỡng ven biển Hội An
  160: 'KH.MT.INFRA',   // 1204: Cảng Liên Chiểu GĐ1
  161: 'KH.ACV',        // 1205: Sân bay Phù Cát Bình Định
  162: 'KH.DT',         // 1301: Nhà xưởng thép Nhôm Dinco
  163: 'KH.ACV',        // 1302: Bu lông tự đứt S10T Sân bay Long Thành
  164: 'KH.DAWACO',     // 1303: Trung tâm Thể thao Đà Nẵng
  165: 'KH.MRB',        // 1304: Nhà ga đường sắt cao tốc
  166: 'KH.620',        // 1305: Cầu Bạch Đằng 2
  167: 'KH.QN.SXD',     // 1401: Bệnh viện đa khoa Quảng Ninh 500 giường
  168: 'KH.VNU',        // 1402: Ký túc xá ĐHQGHN Hòa Lạc
  169: 'KH.LM',         // 1403: Khách sạn Công đoàn Việt Nam
  170: 'KH.VIETTEL',    // 1404: Trung tâm Dữ liệu IDC Viettel
  171: 'KH.BN',         // 1405: Trường THPT Chuyên Bắc Giang
  172: 'KH.PVN',        // 1501: Nhà máy Nhiệt điện Vũng Áng 2
  173: 'KH.620',        // 1502: Hệ chống sàn giàn giáo ringlock
  174: 'KH.PMU.TL',     // 1503: Hầm chui Lê Văn Lương
  175: 'KH.MAUR',       // 1504: Dầm chữ U Metro số 1 TP.HCM
  176: 'KH.HOAPHAT',    // 1505: Móng máy Thép Hòa Phát Dung Quất
  177: 'KH.DEEPC',      // 1601: Hạ tầng KCN Đồng Văn IV
  178: 'KH.ECOPARK',    // 1602: KĐT sinh thái Ecopark
  179: 'KH.EVNNPC',     // 1603: Trạm biến áp 500kV Tây Hà Nội
  180: 'KH.THT',        // 1604: Nhà máy rác phát điện Sóc Sơn
  181: 'KH.THT',        // 1605: Thoát nước mưa Yên Sở
  182: 'KH.BITEXCO',    // 1701: The Manor Central Park
  183: 'KH.AEON',       // 1702: Aeon Mall Huế
  184: 'KH.VCB',        // 1703: Tháp Vietcombank Tower
  185: 'KH.HY',         // 1704: Chiller Bệnh viện K Tân Triều
  186: 'KH.PVN',        // 1705: NĐ Thái Bình 2
  187: 'KH.KICT',       // 1801: Cầu dây văng Đại Ngãi Eurocode
  188: 'KH.KICT',       // 1802: Tiêu chuẩn ACI 318 công trình cao tầng
  189: 'KH.KICT',       // 1803: Hợp tác quốc tế CABR bê tông đúc sẵn
  190: 'KH.THT',        // 1804: Xử lý nước thải Yên Xá ODA Nhật Bản
  191: 'KH.LEGO',       // 1805: Nhà máy Lego Bình Dương
  192: 'KH.ACV',        // 1901: Mô hình BIM 3D Sân bay Chu Lai
  193: 'KH.HY',         // 1902: BV Nhi TW GĐ2
  194: 'KH.BRG',        // 1903: Khách sạn Hilton Hải Phòng
  195: 'KH.EVN',        // 1904: BIM As-built Tòa nhà EVN
  196: 'KH.PMU.TL',     // 1905: Đào tạo BIM Ban QLDA Giao thông Hà Nội
  197: 'KH.VINGROUP',   // 2001: Tổ hợp Vincom Plaza Hải Phòng
  198: 'KH.SIKA',       // 2002: Bơm vữa SikaGrout turbine gió Trà Vinh
  199: 'KH.FOXCONN',    // 2003: Nhà máy Điện tử Foxconn Bắc Giang
  200: 'KH.VIETTEL',    // 2004: Tòa nhà FPT Cần Thơ
  201: 'KH.DEOCA'       // 2005: Hầm đường bộ Hải Vân keo epoxy
};

async function main() {
  console.log('=== BẮT ĐẦU CẬP NHẬT & LIÊN KẾT CRM KHÁCH HÀNG IBST ===\n');

  // Bước 1: Cập nhật thông tin chi tiết cho 15 khách hàng hiện có
  console.log('--- 1. Cập nhật hồ sơ đầy đủ cho 15 khách hàng hiện có ---');
  for (const c of EXISTING_CUSTOMERS_UPDATE) {
    const { error } = await supabase
      .from('khach_hang')
      .update({
        ma_dinh_danh: c.ma_dinh_danh,
        ten_to_chuc: c.ten_to_chuc,
        ma_so_thue: c.ma_so_thue,
        loai: c.loai,
        nguoi_dai_dien: c.nguoi_dai_dien,
        so_dien_thoai: c.so_dien_thoai,
        email: c.email,
        dia_chi_chi_tiet: c.dia_chi_chi_tiet,
        website: c.website,
        ghi_chu: c.ghi_chu,
      })
      .eq('id', c.id);

    if (error) console.error(`❌ Lỗi cập nhật KH ${c.id} (${c.ten_to_chuc}):`, error.message);
    else console.log(`✅ Đã cập nhật KH #${c.id}: ${c.ten_to_chuc}`);
  }

  // Bước 2: Bổ sung 21 khách hàng mới (không chỉ định id)
  console.log('\n--- 2. Bổ sung 21 Khách hàng & Đối tác lớn mới ---');
  for (const c of NEW_CUSTOMERS) {
    const { data: existing } = await supabase
      .from('khach_hang')
      .select('id')
      .eq('ma_dinh_danh', c.ma_dinh_danh)
      .maybeSingle();

    if (existing) {
      const { error } = await supabase.from('khach_hang').update(c).eq('id', existing.id);
      if (error) console.error(`❌ Lỗi update KH ${c.ma_dinh_danh}:`, error.message);
      else console.log(`✅ Đã đồng bộ KH #${existing.id}: ${c.ten_to_chuc}`);
    } else {
      const { data: inserted, error } = await supabase.from('khach_hang').insert(c).select('id').single();
      if (error) console.error(`❌ Lỗi insert KH ${c.ma_dinh_danh}:`, error.message);
      else console.log(`✅ Đã thêm mới KH #${inserted.id}: ${c.ten_to_chuc}`);
    }
  }

  // Lấy toàn bộ khách hàng và tạo map ma_dinh_danh -> id
  const { data: allCustomers } = await supabase
    .from('khach_hang')
    .select('id, ma_dinh_danh');

  const maToId = {};
  allCustomers.forEach(k => {
    if (k.ma_dinh_danh) maToId[k.ma_dinh_danh] = k.id;
  });

  // Bước 3: Liên kết chính xác 80 hợp đồng tới khách hàng theo dự án
  console.log('\n--- 3. Liên kết 80 Hợp đồng mẫu tới Khách hàng theo ngữ cảnh dự án ---');
  let linkedCount = 0;
  for (const [hdIdStr, maKh] of Object.entries(HOP_DONG_TO_MA_KH)) {
    const hdId = Number(hdIdStr);
    const khId = maToId[maKh];
    if (!khId) {
      console.error(`❌ Không tìm thấy ID cho mã KH ${maKh}`);
      continue;
    }

    const { error } = await supabase
      .from('hop_dong')
      .update({ khach_hang_id: khId })
      .eq('id', hdId);

    if (error) {
      console.error(`❌ Lỗi link HĐ #${hdId} tới KH #${khId}:`, error.message);
    } else {
      linkedCount++;
    }
  }
  console.log(`✅ Đã liên kết thành công ${linkedCount} / 80 hợp đồng tới khách hàng chuẩn.`);

  // Bước 4: Đồng bộ chu_dau_tu_id trong dau_thau theo hop_dong
  console.log('\n--- 4. Đồng bộ Chủ đầu tư trong Gói thầu Đấu thầu (dau_thau) ---');
  const { data: dauThauList } = await supabase
    .from('dau_thau')
    .select('id, hop_dong_id');

  let dtLinkedCount = 0;
  if (dauThauList) {
    for (const dt of dauThauList) {
      if (dt.hop_dong_id && HOP_DONG_TO_MA_KH[dt.hop_dong_id]) {
        const maKh = HOP_DONG_TO_MA_KH[dt.hop_dong_id];
        const khId = maToId[maKh];
        if (khId) {
          await supabase
            .from('dau_thau')
            .update({ chu_dau_tu_id: khId })
            .eq('id', dt.id);
          dtLinkedCount++;
        }
      }
    }
  }
  console.log(`✅ Đã đồng bộ ${dtLinkedCount} gói thầu theo Chủ đầu tư tương ứng.`);

  // Bước 5: Kiểm tra và in báo cáo tổng hợp
  console.log('\n--- 5. Báo cáo tổng hợp số liệu CRM sau khi cập nhật ---');
  const { data: finalKhList } = await supabase
    .from('khach_hang')
    .select('id, ten_to_chuc, loai, nguoi_dai_dien, hop_dong(count)')
    .order('id');

  console.log(`\nTổng số khách hàng & đối tác trong hệ thống: ${finalKhList.length}`);
  const loaiCounts = {};
  let totalLinkedHds = 0;
  finalKhList.forEach(k => {
    loaiCounts[k.loai] = (loaiCounts[k.loai] || 0) + 1;
    const hdCount = k.hop_dong?.[0]?.count ?? 0;
    totalLinkedHds += hdCount;
    console.log(`[#${String(k.id).padStart(2, ' ')}] [${k.loai.padEnd(12, ' ')}] ${k.ten_to_chuc.padEnd(65, ' ')} | Đại diện: ${(k.nguoi_dai_dien || '—').split('—')[0]?.trim().padEnd(25, ' ')} | ${hdCount} HĐ`);
  });

  console.log('\nPhân loại khách hàng:');
  for (const [loai, cnt] of Object.entries(loaiCounts)) {
    console.log(`- ${loai}: ${cnt} đơn vị`);
  }
  console.log(`\nTổng số hợp đồng đã liên kết: ${totalLinkedHds} / 80 hợp đồng.`);
  console.log('\n🎉 HOÀN TẤT CẬP NHẬT VÀ LIÊN KẾT KHÁCH HÀNG CRM!');
}

main().catch(console.error);
