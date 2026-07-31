const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seedData() {
  console.log('🚀 Starting rich contracts seed generation...');

  // 1. Fetch reference data
  const { data: units } = await supabase.from('don_vi').select('id, ten_don_vi, ma_dinh_danh').order('id');
  const { data: staff } = await supabase.from('nhan_su').select('id, ho_va_ten, don_vi_id').order('id');
  const { data: clients } = await supabase.from('khach_hang').select('id, ten_to_chuc').order('id');
  const { data: bids } = await supabase.from('dau_thau').select('id, ten_goi_thau, don_vi_id').order('id');
  const { data: leads } = await supabase.from('dang_ky_dau_moi').select('id, ten_du_an, don_vi_dang_ky_id').order('id');

  const staffByUnit = {};
  (staff || []).forEach(s => {
    if (!staffByUnit[s.don_vi_id]) staffByUnit[s.don_vi_id] = [];
    staffByUnit[s.don_vi_id].push(s);
  });

  const getLeader = (unitId) => {
    const list = staffByUnit[unitId] || staff || [];
    return list[0] ? list[0].id : 1;
  };

  const getMembers = (unitId) => {
    const list = staffByUnit[unitId] || staff || [];
    return list.slice(1);
  };

  // Sample contract items scattered across units (2-3 per unit)
  const seedContracts = [
    // --- ĐƠN VỊ 1: Viện Chuyên ngành Kết cấu công trình xây dựng (VKCT) ---
    {
      unitId: 1,
      soHD: '101/2026/HDKS-VKCT',
      ten: 'Khảo sát & Đánh giá an toàn chịu lực kết cấu nhà ga T2 Cảng HKQT Nội Bài',
      nhomHD: 'N1a',
      capKy: 'vien',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 1, // ACV
      bidId: bids?.[0]?.id || null,
      leadId: leads?.[0]?.id || null,
      giaTri: 5200, // 5.2 tỷ
      phanTramChuTri: 78,
      trangThai: 'da-ky',
      ngayKy: '2026-02-15',
      hanHoanThanh: '2026-08-15',
      soNgayThucHien: 180,
      noiDung: 'Thực hiện khảo sát chi tiết hiện trạng, siêu âm cốt thép, thí nghiệm nén mẫu bê tông và lập báo cáo đánh giá an toàn chịu lực tổng thể Nhà ga T2 Nội Bài.',
      hasJointVenture: true,
      jointVentureName: 'Tổng công ty Xây dựng LICOGI',
      jointVenturePct: 30,
    },
    {
      unitId: 1,
      soHD: '102/2026/HDTV-VKCT',
      ten: 'Tư vấn thẩm tra thiết kế kỹ thuật & dự toán công trình Trung tâm Thương mại Landmark',
      nhomHD: 'N2',
      capKy: 'don-vi',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 4, // Landmark
      bidId: null,
      leadId: null,
      giaTri: 1800, // 1.8 tỷ
      phanTramChuTri: 85,
      trangThai: 'khkt-tham-tra',
      ngayKy: '2026-04-10',
      hanHoanThanh: '2026-07-10',
      soNgayThucHien: 90,
      noiDung: 'Thẩm tra mô hình kết cấu 3D SAP2000/ETABS, kiểm tra khả năng chịu lực khung vách bê tông cốt thép toàn khối và khối lượng dự toán.',
      hasJointVenture: false,
    },
    {
      unitId: 1,
      soHD: '103/2026/HDGD-VKCT',
      ten: 'Giám định nguyên nhân nứt nẻ và lún lệch cụm chung cư cao tầng tại Bắc Ninh',
      nhomHD: 'N1b',
      capKy: 'vien',
      loaiDacThu: 'phong-chong-thien-tai',
      phanVienXa: false,
      clientId: 5, // Sở VHTT Bắc Ninh
      bidId: null,
      leadId: null,
      giaTri: 2400, // 2.4 tỷ
      phanTramChuTri: 78,
      trangThai: 'da-duyet',
      ngayKy: '2026-05-01',
      hanHoanThanh: '2026-09-01',
      soNgayThucHien: 120,
      noiDung: 'Giám định nguyên nhân nứt kết cấu, quan trắc lún nghiêng bằng thiết bị Leica TotalStation và đề xuất giải pháp xử lý gia cố móng.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 2: Viện Chuyên ngành Bê tông (VBT) ---
    {
      unitId: 2,
      soHD: '201/2026/HDTN-VBT',
      ten: 'Thí nghiệm kiểm định độ bền nhiệt & ăn mòn bê tông khối lớn dự án Thủy điện Hòa Bình mở rộng',
      nhomHD: 'N1a',
      capKy: 'vien',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 7, // Hạ tầng 620
      bidId: bids?.[1]?.id || null,
      leadId: null,
      giaTri: 3800,
      phanTramChuTri: 78,
      trangThai: 'da-ky',
      ngayKy: '2026-01-20',
      hanHoanThanh: '2026-07-20',
      soNgayThucHien: 180,
      noiDung: 'Thí nghiệm độ chống thấm nước, độ bền băng giá, ứng suất nhiệt bê tông khối lớn móng trạm biến áp và đập tràn.',
      hasJointVenture: false,
    },
    {
      unitId: 2,
      soHD: '202/2026/HDKS-VBT',
      ten: 'Nghiên cứu & Cung cấp phụ gia bê tông chịu nén cao cho tuyến đường sắt đô thị Metro Hà Nội',
      nhomHD: 'N2',
      capKy: 'don-vi',
      loaiDacThu: 'khoa-hoc-cong-nghe',
      phanVienXa: false,
      clientId: 2, // THT
      bidId: null,
      leadId: leads?.[1]?.id || null,
      giaTri: 2900,
      phanTramChuTri: 85,
      trangThai: 'cho-trinh-duyet',
      ngayKy: null,
      hanHoanThanh: '2026-10-30',
      soNgayThucHien: 150,
      noiDung: 'Thử nghiệm cấp phối bê tông siêu tính năng (UHPC), tối ưu hóa hàm lượng sợi thép và phụ gia siêu dẻo.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 3: Viện Chuyên ngành Địa kỹ thuật (VDKT) ---
    {
      unitId: 3,
      soHD: '301/2026/HDKS-VDKT',
      ten: 'Khảo sát địa kỹ thuật & Thí nghiệm nén hầm sâu tuyến cao tốc Bắc - Nam đoạn qua Quảng Trị',
      nhomHD: 'N1a',
      capKy: 'vien',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 3, // BQLDA 85
      bidId: bids?.[2]?.id || null,
      leadId: null,
      giaTri: 7500, // 7.5 tỷ
      phanTramChuTri: 78,
      trangThai: 'da-ky',
      ngayKy: '2026-03-01',
      hanHoanThanh: '2026-11-01',
      soNgayThucHien: 240,
      noiDung: 'Khoan khảo sát địa chất công trình 35 lỗ khoan sâu 50m, thí nghiệm xuyên tĩnh CPT, cắt cánh vạn năng hiện trường và cắt nén 3 trục UU/CU.',
      hasJointVenture: true,
      jointVentureName: 'CTCP Khảo sát Địa chất Miền Trung',
      jointVenturePct: 35,
    },
    {
      unitId: 3,
      soHD: '302/2026/HDTC-VDKT',
      ten: 'Thi công xử lý nền đất yếu bằng cọc bêtông ly tâm D500 dự án Cảng sông Thuận An',
      nhomHD: 'N3',
      capKy: 'don-vi',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 12, // Miền Trung
      bidId: null,
      leadId: null,
      giaTri: 12500, // 12.5 tỷ
      phanTramChuTri: 90,
      trangThai: 'nghiem-thu',
      ngayKy: '2025-11-10',
      hanHoanThanh: '2026-05-10',
      soNgayThucHien: 180,
      noiDung: 'Thi công ép cọc bê tông ly tâm ứng lực trước D500 mm, thử tĩnh cọc 400 tấn và nén tĩnh đất nền.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 4: Phân Viện KHCN Xây dựng miền Nam (PVMN) ---
    {
      unitId: 4,
      soHD: '401/2026/HDKS-PVMN',
      ten: 'Khảo sát hiện trạng & Giám định chất lượng công trình Nhà máy Sika Bình Dương',
      nhomHD: 'N1b',
      capKy: 'vien',
      loaiDacThu: 'khong',
      phanVienXa: true, // Phân viện xa
      clientId: 10, // Sika
      bidId: null,
      leadId: null,
      giaTri: 3100, // 3.1 tỷ
      phanTramChuTri: 78,
      trangThai: 'da-ky',
      ngayKy: '2026-02-01',
      hanHoanThanh: '2026-06-30',
      soNgayThucHien: 150,
      noiDung: 'Khảo sát đo vẽ hiện trạng nứt vỡ sàn xưởng, siêu âm khuyết tật cọc nhồi và kiểm tra độ bền kiềm - sỏi.',
      hasJointVenture: false,
    },
    {
      unitId: 4,
      soHD: '402/2026/HDTN-PVMN',
      ten: 'Thí nghiệm kiểm tra chất lượng cọc nhồi D1500 bằng phương pháp khoan lõi & PIT dự án Metro Bến Thành - Suối Tiên',
      nhomHD: 'N2',
      capKy: 'don-vi',
      loaiDacThu: 'khong',
      phanVienXa: true,
      clientId: 11, // BQLDA TP.HCM
      bidId: null,
      leadId: leads?.[2]?.id || null,
      giaTri: 4600,
      phanTramChuTri: 85,
      trangThai: 'thanh-ly',
      ngayKy: '2025-08-15',
      hanHoanThanh: '2026-02-15',
      soNgayThucHien: 180,
      noiDung: 'Thí nghiệm biến dạng nhỏ PIT, siêu âm màng ống 4 kênh và thử nén mẫu lõi bê tông cọc nhồi sâu 65m.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 5: Viện Chuyên ngành Thiết bị, Tài nguyên & Môi trường (VTB) ---
    {
      unitId: 5,
      soHD: '501/2026/HDTV-VTB',
      ten: 'Tư vấn quan trắc môi trường & Thí nghiệm đo độ ồn, rung chấn dự án Cảng hàng không Long Thành GĐ1',
      nhomHD: 'N2',
      capKy: 'vien',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 1, // ACV
      bidId: null,
      leadId: null,
      giaTri: 2800,
      phanTramChuTri: 85,
      trangThai: 'da-duyet',
      ngayKy: '2026-04-01',
      hanHoanThanh: '2026-10-01',
      soNgayThucHien: 180,
      noiDung: 'Đo đạc quan trắc chất lượng không khí, tiếng ồn liên tục 24/7 và vi khí hậu khu vực san lấp mặt bằng Cảng hàng không Long Thành.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 6: Trung tâm Tư vấn trắc địa và xây dựng (TTTD) ---
    {
      unitId: 6,
      soHD: '601/2026/HDKS-TTTD',
      ten: 'Quan trắc chuyển vị ngang & Lún công trình tháp đôi hỗn hợp 45 tầng tại Bắc Ninh',
      nhomHD: 'N2',
      capKy: 'don-vi',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 5, // Bắc Ninh
      bidId: null,
      leadId: null,
      giaTri: 1650,
      phanTramChuTri: 85,
      trangThai: 'da-ky',
      ngayKy: '2026-01-10',
      hanHoanThanh: '2026-12-31',
      soNgayThucHien: 350,
      noiDung: 'Lắp đặt 48 mốc chuẩn lún kim loại sâu 25m, dùng máy thủy bình điện tử Leica LS15 đo định kỳ 15 ngày/lần.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 12: Phân Viện KHCN Xây dựng miền Trung (PVMT) ---
    {
      unitId: 12,
      soHD: '701/2026/HDKS-PVMT',
      ten: 'Thí nghiệm & Đánh giá an toàn đê biển, đập thủy lợi ứng phó sự cố bão lũ tại Thừa Thiên Huế',
      nhomHD: 'N1a',
      capKy: 'vien',
      loaiDacThu: 'phong-chong-thien-tai',
      phanVienXa: true,
      clientId: 12, // Miền Trung
      bidId: null,
      leadId: leads?.[3]?.id || null,
      giaTri: 3400,
      phanTramChuTri: 78,
      trangThai: 'da-ky',
      ngayKy: '2026-02-20',
      hanHoanThanh: '2026-08-20',
      soNgayThucHien: 180,
      noiDung: 'Khảo sát quét Georadar xuyên đất phát hiện hốc rỗng thân đê, thí nghiệm xói mòn bề mặt kè bê tông chắn sóng.',
      hasJointVenture: false,
    },
    {
      unitId: 12,
      soHD: '702/2026/HDTN-PVMT',
      ten: 'Thí nghiệm nén vữa & Thí nghiệm kéo thép cốt dự án Cầu vượt sông Hương Đà Nẵng',
      nhomHD: 'N2',
      capKy: 'don-vi',
      loaiDacThu: 'khong',
      phanVienXa: true,
      clientId: 15, // Dawaco
      bidId: null,
      leadId: null,
      giaTri: 1950,
      phanTramChuTri: 85,
      trangThai: 'nhap',
      ngayKy: null,
      hanHoanThanh: '2026-09-30',
      soNgayThucHien: 120,
      noiDung: 'Thí nghiệm độ bền kéo, giới hạn chảy steel bars D25-D40 và thử tải nén vữa rót không co bù.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 13: Trung tâm Kết cấu thép và xây dựng (TTKCT) ---
    {
      unitId: 13,
      soHD: '801/2026/HDTV-TTKCT',
      ten: 'Thẩm tra thiết kế nhà xưởng kết cấu thép nhịp lớn 72m Nhà máy Nhôm Dinco',
      nhomHD: 'N2',
      capKy: 'don-vi',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 7, // 620
      bidId: null,
      leadId: null,
      giaTri: 1400,
      phanTramChuTri: 85,
      trangThai: 'da-ky',
      ngayKy: '2026-03-15',
      hanHoanThanh: '2026-06-15',
      soNgayThucHien: 90,
      noiDung: 'Tính toán liên kết bulong cường độ cao, kiểm tra ổn định tổng thể vì kèo dàn thép và độ võng dưới tải trọng gió.',
      hasJointVenture: false,
    },

    // --- ĐƠN VỊ 14: Trung tâm Tư vấn thiết kế và xây dựng (TTTK) ---
    {
      unitId: 14,
      soHD: '901/2026/HDTV-TTTK',
      ten: 'Tư vấn thiết kế bản vẽ thi công & Tổng dự toán dự án Bệnh viện đa khoa Quảng Ninh 500 giường',
      nhomHD: 'N1b',
      capKy: 'vien',
      loaiDacThu: 'khong',
      phanVienXa: false,
      clientId: 14, // Quảng Ninh
      bidId: bids?.[3]?.id || null,
      leadId: null,
      giaTri: 8900, // 8.9 tỷ
      phanTramChuTri: 78,
      trangThai: 'da-ky',
      ngayKy: '2026-01-05',
      hanHoanThanh: '2026-10-05',
      soNgayThucHien: 270,
      noiDung: 'Thiết kế kiến trúc, kết cấu, điện nước (MEP), phòng cháy chữa cháy (PCCC) và ứng dụng BIM LOD350 toàn bộ Bệnh viện.',
      hasJointVenture: true,
      jointVentureName: 'CTCP Tư vấn Kiến trúc Việt Nam',
      jointVenturePct: 40,
    }
  ];

  console.log(`Generating ${seedContracts.length} rich contracts across 9 units...`);

  for (const item of seedContracts) {
    const leaderId = getLeader(item.unitId);
    const members = getMembers(item.unitId);
    const kinhPhiGiao = Math.round((item.giaTri * item.phanTramChuTri) / 100);

    // 1. Insert hop_dong
    const { data: hd, error: hdErr } = await supabase
      .from('hop_dong')
      .insert({
        so_hop_dong: item.soHD,
        ten_hop_dong: item.ten,
        don_vi_id: item.unitId,
        khach_hang_id: item.clientId,
        gia_tri_hop_dong: item.giaTri,
        nhom_hop_dong: item.nhomHD,
        cap_ky: item.capKy,
        loai_dac_thu: item.loaiDacThu,
        phan_vien_xa: item.phanVienXa,
        chu_tri_ky_thuat_id: leaderId,
        kinh_phi_giao_chu_tri: kinhPhiGiao,
        trang_thai: item.trangThai,
        ngay_ky: item.ngayKy,
        ngay_hieu_luc: item.ngayKy,
        han_hoan_thanh: item.hanHoanThanh,
        so_ngay_thuc_hien: item.soNgayThucHien,
        noi_dung_giao_viec: item.noiDung,
        dau_thau_id: item.bidId,
        dang_ky_dau_moi_id: item.leadId,
      })
      .select()
      .single();

    if (hdErr) {
      console.error(`❌ Error inserting contract ${item.soHD}:`, hdErr.message);
      continue;
    }

    console.log(`✅ Created Contract [${hd.id}] ${hd.so_hop_dong} - ${hd.ten_hop_dong.substring(0, 40)}...`);

    // 2. Insert phieu_giao_viec
    const pgvStatus = item.trangThai === 'nhap' ? 'du-thao' : item.trangThai === 'cho-trinh-duyet' ? 'cho-ky' : 'da-duyet';
    const { data: pgv, error: pgvErr } = await supabase
      .from('phieu_giao_viec')
      .insert({
        hop_dong_id: hd.id,
        so_phieu: `PGV-${item.soHD}`,
        chu_tri_ky_thuat_id: leaderId,
        kinh_phi_giao: kinhPhiGiao,
        phan_tram_kinh_phi: item.phanTramChuTri,
        ngay_giao: item.ngayKy || '2026-02-01',
        noi_dung: item.noiDung,
        trang_thai: pgvStatus,
      })
      .select()
      .single();

    if (pgv) {
      // 2a. Insert phieu_giao_viec_don_vi
      await supabase.from('phieu_giao_viec_don_vi').insert({
        phieu_giao_viec_id: pgv.id,
        don_vi_id: item.unitId,
        ty_le_chia: 100,
        kinh_phi_duoc_giao: kinhPhiGiao,
        vai_tro: 'Don vi chu tri',
      });

      // 2b. Insert phieu_giao_viec_ctv (team members)
      if (members.length > 0) {
        const ctvRows = members.slice(0, 3).map((m, idx) => {
          const pct = idx === 0 ? 30 : idx === 1 ? 25 : 20;
          const kp = Math.round((kinhPhiGiao * pct) / 100);
          return {
            phieu_giao_viec_id: pgv.id,
            nhan_su_id: m.id,
            ho_ten: m.ho_va_ten,
            vai_tro: idx === 0 ? 'Phụ trách kỹ thuật hiện trường' : idx === 1 ? 'Cán bộ thí nghiệm chính' : 'Thư ký tổng hợp báo cáo',
            ty_le_chia: pct,
            kinh_phi_giao: kp,
          };
        });
        await supabase.from('phieu_giao_viec_ctv').insert(ctvRows);
      }
    }

    // 3. Insert dot_thanh_toan
    if (['da-ky', 'nghiem-thu', 'thanh-ly'].includes(item.trangThai)) {
      const tamUng = Math.round(item.giaTri * 0.3);
      const giaiDoan = Math.round(item.giaTri * 0.5);
      const quyetToan = item.giaTri - tamUng - giaiDoan;

      await supabase.from('dot_thanh_toan').insert([
        {
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 1: Tạm ứng 30% sau khi ký hợp đồng',
          so_tien: tamUng,
          ngay_du_kien: item.ngayKy || '2026-02-15',
          trang_thai: 'da-thu',
          ngay_thuc_te: item.ngayKy || '2026-02-20',
          so_tien_da_thu: tamUng,
          noi_dung: 'Hóa đơn GTGT tạm ứng hợp đồng theo Điều khoản 4',
        },
        {
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 2: Thanh toán 50% khi hoàn thành 80% khối lượng',
          so_tien: giaiDoan,
          ngay_du_kien: '2026-06-30',
          trang_thai: item.trangThai === 'thanh-ly' ? 'da-thu' : 'cho-thu',
          so_tien_da_thu: item.trangThai === 'thanh-ly' ? giaiDoan : 0,
          noi_dung: 'Biên bản nghiệm thu kỹ thuật giai đoạn',
        },
        {
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 3: Thanh toán quyết toán 20% khi bàn giao báo cáo chính thức',
          so_tien: quyetToan,
          ngay_du_kien: item.hanHoanThanh,
          trang_thai: item.trangThai === 'thanh-ly' ? 'da-thu' : 'chua-den-han',
          so_tien_da_thu: item.trangThai === 'thanh-ly' ? quyetToan : 0,
          noi_dung: 'Hồ sơ thanh quyết toán và biên bản thanh lý HĐ',
        },
      ]);
    }

    // 4. Insert quyet_toan_giai_doan
    if (['da-ky', 'nghiem-thu', 'thanh-ly'].includes(item.trangThai)) {
      await supabase.from('quyet_toan_giai_doan').insert([
        {
          hop_dong_id: hd.id,
          ten_giai_doan: 'Giai đoạn 1: Khảo sát & Thu thập số liệu hiện trường',
          ty_le_hoan_thanh: 100,
          gia_tri_giai_doan: Math.round(item.giaTri * 0.4),
          ngay_nghiem_thu: '2026-03-30',
          trang_thai: 'da-duyet',
          ghi_chu: 'Đã nghiệm thu đầy đủ nhật ký khảo sát và sơ đồ mốc',
        },
      ]);
    }

    // 5. Insert lien_danh if applicable
    if (item.hasJointVenture) {
      await supabase.from('lien_danh').insert({
        hop_dong_id: hd.id,
        ten_doi_tac: item.jointVentureName,
        ty_le_gop: item.jointVenturePct,
        vai_tro: 'Thành viên liên danh',
        ghi_chu: 'Hợp đồng liên danh ký ngày ' + (item.ngayKy || '2026-01-15'),
      });
    }

    // 6. Insert luu_tru_ho_so
    await supabase.from('luu_tru_ho_so').insert([
      {
        hop_dong_id: hd.id,
        ten_tai_lieu: `HopDong_Goc_${item.soHD.replace(/\//g, '_')}.pdf`,
        loai_tai_lieu: 'Hợp đồng gốc',
        duong_dan: `https://storage.ibst.vn/docs/${item.soHD.replace(/\//g, '_')}.pdf`,
        dung_luong: 4520100,
        trang_thai: 'da-luu',
      },
      {
        hop_dong_id: hd.id,
        ten_tai_lieu: `PhieuGiaoViec_${item.soHD.replace(/\//g, '_')}.pdf`,
        loai_tai_lieu: 'Phiếu giao việc Mẫu 02-GV',
        duong_dan: `https://storage.ibst.vn/docs/PGV_${item.soHD.replace(/\//g, '_')}.pdf`,
        dung_luong: 1250800,
        trang_thai: 'da-luu',
      },
    ]);
  }

  console.log('\n🎉 Seed generation finished successfully!');
}

seedData();
