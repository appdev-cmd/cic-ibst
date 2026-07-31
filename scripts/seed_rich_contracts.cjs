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
  console.log('🚀 Starting complete end-to-end CRM -> Bidding -> Contract seed generation...');

  // 1. Clean existing tables (order matters due to foreign keys)
  console.log('🧹 Cleaning existing test records...');
  await supabase.from('luu_tru_ho_so').delete().neq('id', 0);
  await supabase.from('lien_danh').delete().neq('id', 0);
  await supabase.from('quyet_toan_giai_doan').delete().neq('id', 0);
  await supabase.from('dot_thanh_toan').delete().neq('id', 0);
  await supabase.from('phieu_giao_viec_ctv').delete().neq('id', 0);
  await supabase.from('phieu_giao_viec_don_vi').delete().neq('id', 0);
  await supabase.from('phieu_giao_viec').delete().neq('id', 0);
  
  // Unlink foreign keys before deleting hop_dong, dau_thau, dang_ky_dau_moi
  await supabase.from('dau_thau').update({ hop_dong_id: null }).neq('id', 0);
  await supabase.from('dang_ky_dau_moi').update({ dau_thau_id: null }).neq('id', 0);
  
  await supabase.from('hop_dong').delete().neq('id', 0);
  await supabase.from('dau_thau').delete().neq('id', 0);
  await supabase.from('dang_ky_dau_moi').delete().neq('id', 0);

  // 2. Fetch reference data
  const { data: staff } = await supabase.from('nhan_su').select('id, ho_va_ten, don_vi_id').order('id');
  const { data: clients } = await supabase.from('khach_hang').select('id, ten_to_chuc').order('id');

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

  // Define 15 full multi-stage items spread evenly across ALL 5 WORKFLOW STEPS:
  // Step 1: du-thao
  // Step 2: cho-duyet
  // Step 3: dang-thuc-hien
  // Step 4: hoan-thanh
  // Step 5: thanh-ly
  const items = [
    // ────────────── BƯỚC 1: DỰ THẢO (du-thao) ──────────────
    {
      unitId: 1,
      soHD: '102/2026/HDTV-VKCT',
      ten: 'Tư vấn thẩm tra thiết kế kỹ thuật & dự toán công trình Trung tâm Thương mại Landmark',
      nhomHD: 'N2A',
      capKy: 'don-vi-ky',
      loaiDacThu: null,
      clientId: clients?.[3]?.id || 4,
      giaTri: 1800,
      phanTramChuTri: 85,
      buocHienTai: 'du-thao',
      trangThai: 'du-thao',
      ngayKy: null,
      hanHoanThanh: '2026-08-30',
      soNgayThucHien: 90,
      noiDung: 'Thẩm tra mô hình kết cấu 3D SAP2000/ETABS, kiểm tra khả năng chịu lực khung vách bê tông cốt thép toàn khối và khối lượng dự toán.',
      hasJointVenture: false,
    },
    {
      unitId: 2,
      soHD: '202/2026/HDKS-VBT',
      ten: 'Nghiên cứu & Cung cấp phụ gia bê tông chịu nén cao cho tuyến đường sắt đô thị Metro Hà Nội',
      nhomHD: 'N2C',
      capKy: 'don-vi-ky',
      loaiDacThu: null,
      clientId: clients?.[1]?.id || 2,
      giaTri: 2900,
      phanTramChuTri: 85,
      buocHienTai: 'du-thao',
      trangThai: 'du-thao',
      ngayKy: null,
      hanHoanThanh: '2026-10-30',
      soNgayThucHien: 150,
      noiDung: 'Thử nghiệm cấp phối bê tông siêu tính năng (UHPC), tối ưu hóa hàm lượng sợi thép và phụ gia siêu dẻo.',
      hasJointVenture: false,
    },
    {
      unitId: 12,
      soHD: '702/2026/HDTN-PVMT',
      ten: 'Thí nghiệm nén vữa & Thí nghiệm kéo thép cốt dự án Cầu vượt sông Hương Đà Nẵng',
      nhomHD: 'N2F',
      capKy: 'don-vi-ky',
      loaiDacThu: 'tn-dat-vl-thep-han',
      phanVienXa: true,
      clientId: clients?.[14]?.id || 15,
      giaTri: 1950,
      phanTramChuTri: 85,
      buocHienTai: 'du-thao',
      trangThai: 'du-thao',
      ngayKy: null,
      hanHoanThanh: '2026-09-30',
      soNgayThucHien: 120,
      noiDung: 'Thí nghiệm độ bền kéo, giới hạn chảy steel bars D25-D40 và thử tải nén vữa rót không co bù.',
      hasJointVenture: false,
    },

    // ────────────── BƯỚC 2: CHỜ DUYỆT (cho-duyet) ──────────────
    {
      unitId: 1,
      soHD: '103/2026/HDGD-VKCT',
      ten: 'Giám định nguyên nhân nứt nẻ và lún lệch cụm chung cư cao tầng tại Bắc Ninh',
      nhomHD: 'N1B',
      capKy: 'vien-ky',
      loaiDacThu: null,
      clientId: clients?.[4]?.id || 5,
      giaTri: 2400,
      phanTramChuTri: 78,
      buocHienTai: 'cho-duyet',
      trangThai: 'cho-duyet',
      ngayKy: '2026-05-01',
      hanHoanThanh: '2026-09-01',
      soNgayThucHien: 120,
      noiDung: 'Giám định nguyên nhân nứt kết cấu, quan trắc lún nghiêng bằng thiết bị Leica TotalStation và đề xuất giải pháp xử lý gia cố móng.',
      hasJointVenture: false,
    },
    {
      unitId: 5,
      soHD: '501/2026/HDTV-VTB',
      ten: 'Tư vấn quan trắc môi trường & Thí nghiệm đo độ ồn, rung chấn dự án Cảng hàng không Long Thành GĐ1',
      nhomHD: 'N2D',
      capKy: 'vien-ky',
      loaiDacThu: null,
      clientId: clients?.[0]?.id || 1,
      giaTri: 2800,
      phanTramChuTri: 85,
      buocHienTai: 'cho-duyet',
      trangThai: 'cho-duyet',
      ngayKy: '2026-04-01',
      hanHoanThanh: '2026-10-01',
      soNgayThucHien: 180,
      noiDung: 'Đo đạc quan trắc chất lượng không khí, tiếng ồn liên tục 24/7 và vi khí hậu khu vực san lấp mặt bằng Cảng hàng không Long Thành.',
      hasJointVenture: false,
    },
    {
      unitId: 13,
      soHD: '801/2026/HDTV-TTKCT',
      ten: 'Thẩm tra thiết kế nhà xưởng kết cấu thép nhịp lớn 72m Nhà máy Nhôm Dinco',
      nhomHD: 'N2G',
      capKy: 'don-vi-ky',
      loaiDacThu: null,
      clientId: clients?.[6]?.id || 7,
      giaTri: 1400,
      phanTramChuTri: 85,
      buocHienTai: 'cho-duyet',
      trangThai: 'cho-duyet',
      ngayKy: '2026-03-15',
      hanHoanThanh: '2026-06-15',
      soNgayThucHien: 90,
      noiDung: 'Tính toán liên kết bulong cường độ cao, kiểm tra ổn định tổng thể vì kèo dàn thép và độ võng dưới tải trọng gió.',
      hasJointVenture: false,
    },

    // ────────────── BƯỚC 3: ĐANG THỰC HIỆN (dang-thuc-hien) ──────────────
    {
      unitId: 1,
      soHD: '101/2026/HDKS-VKCT',
      ten: 'Khảo sát & Đánh giá an toàn chịu lực kết cấu nhà ga T2 Cảng HKQT Nội Bài',
      nhomHD: 'N1A',
      capKy: 'vien-ky',
      loaiDacThu: 'khao-sat-dia-chat',
      clientId: clients?.[0]?.id || 1,
      giaTri: 5200,
      phanTramChuTri: 78,
      buocHienTai: 'dang-thuc-hien',
      trangThai: 'dang-thuc-hien',
      ngayKy: '2026-02-15',
      hanHoanThanh: '2026-08-15',
      soNgayThucHien: 180,
      noiDung: 'Thực hiện khảo sát chi tiết hiện trạng, siêu âm cốt thép, thí nghiệm nén mẫu bê tông và lập báo cáo đánh giá an toàn chịu lực tổng thể Nhà ga T2 Nội Bài.',
      hasJointVenture: true,
      jointVentureName: 'Tổng công ty Xây dựng LICOGI',
      jointVenturePct: 30,
    },
    {
      unitId: 2,
      soHD: '201/2026/HDTN-VBT',
      ten: 'Thí nghiệm kiểm định độ bền nhiệt & ăn mòn bê tông khối lớn dự án Thủy điện Hòa Bình mở rộng',
      nhomHD: 'N1A',
      capKy: 'vien-ky',
      loaiDacThu: 'tn-dat-vl-thep-han',
      clientId: clients?.[6]?.id || 7,
      giaTri: 3800,
      phanTramChuTri: 78,
      buocHienTai: 'dang-thuc-hien',
      trangThai: 'dang-thuc-hien',
      ngayKy: '2026-01-20',
      hanHoanThanh: '2026-07-20',
      soNgayThucHien: 180,
      noiDung: 'Thí nghiệm độ chống thấm nước, độ bền băng giá, ứng suất nhiệt bê tông khối lớn móng trạm biến áp và đập tràn.',
      hasJointVenture: false,
    },
    {
      unitId: 3,
      soHD: '301/2026/HDKS-VDKT',
      ten: 'Khảo sát địa kỹ thuật & Thí nghiệm nén hầm sâu tuyến cao tốc Bắc - Nam đoạn qua Quảng Trị',
      nhomHD: 'N1A',
      capKy: 'vien-ky',
      loaiDacThu: 'khao-sat-dia-chat',
      clientId: clients?.[2]?.id || 3,
      giaTri: 7500,
      phanTramChuTri: 78,
      buocHienTai: 'dang-thuc-hien',
      trangThai: 'dang-thuc-hien',
      ngayKy: '2026-03-01',
      hanHoanThanh: '2026-11-01',
      soNgayThucHien: 240,
      noiDung: 'Khoan khảo sát địa chất công trình 35 lỗ khoan sâu 50m, thí nghiệm xuyên tĩnh CPT, cắt cánh vạn năng hiện trường và cắt nén 3 trục UU/CU.',
      hasJointVenture: true,
      jointVentureName: 'CTCP Khảo sát Địa chất Miền Trung',
      jointVenturePct: 35,
    },
    {
      unitId: 4,
      soHD: '401/2026/HDKS-PVMN',
      ten: 'Khảo sát hiện trạng & Giám định chất lượng công trình Nhà máy Sika Bình Dương',
      nhomHD: 'N1B',
      capKy: 'vien-ky',
      loaiDacThu: 'khao-sat-dia-chat',
      phanVienXa: true,
      clientId: clients?.[9]?.id || 10,
      giaTri: 3100,
      phanTramChuTri: 78,
      buocHienTai: 'dang-thuc-hien',
      trangThai: 'dang-thuc-hien',
      ngayKy: '2026-02-01',
      hanHoanThanh: '2026-06-30',
      soNgayThucHien: 150,
      noiDung: 'Khảo sát đo vẽ hiện trạng nứt vỡ sàn xưởng, siêu âm khuyết tật cọc nhồi và kiểm tra độ bền kiềm - sỏi.',
      hasJointVenture: false,
    },

    // ────────────── BƯỚC 4: HOÀN THÀNH (hoan-thanh) ──────────────
    {
      unitId: 3,
      soHD: '302/2026/HDTC-VDKT',
      ten: 'Thi công xử lý nền đất yếu bằng cọc bêtông ly tâm D500 dự án Cảng sông Thuận An',
      nhomHD: 'N3',
      capKy: 'don-vi-ky',
      loaiDacThu: null,
      clientId: clients?.[11]?.id || 12,
      giaTri: 12500,
      phanTramChuTri: 90,
      buocHienTai: 'hoan-thanh',
      trangThai: 'hoan-thanh',
      ngayKy: '2025-11-10',
      hanHoanThanh: '2026-05-10',
      soNgayThucHien: 180,
      noiDung: 'Thi công ép cọc bê tông ly tâm ứng lực trước D500 mm, thử tĩnh cọc 400 tấn và nén tĩnh đất nền.',
      hasJointVenture: false,
    },
    {
      unitId: 6,
      soHD: '601/2026/HDKS-TTTD',
      ten: 'Quan trắc chuyển vị ngang & Lún công trình tháp đôi hỗn hợp 45 tầng tại Bắc Ninh',
      nhomHD: 'N2E',
      capKy: 'don-vi-ky',
      loaiDacThu: 'khao-sat-dia-chat',
      clientId: clients?.[4]?.id || 5,
      giaTri: 1650,
      phanTramChuTri: 85,
      buocHienTai: 'hoan-thanh',
      trangThai: 'hoan-thanh',
      ngayKy: '2026-01-10',
      hanHoanThanh: '2026-05-30',
      soNgayThucHien: 140,
      noiDung: 'Lắp đặt 48 mốc chuẩn lún kim loại sâu 25m, dùng máy thủy bình điện tử Leica LS15 đo định kỳ 15 ngày/lần.',
      hasJointVenture: false,
    },
    {
      unitId: 14,
      soHD: '901/2026/HDTV-TTTK',
      ten: 'Tư vấn thiết kế bản vẽ thi công & Tổng dự toán dự án Bệnh viện đa khoa Quảng Ninh 500 giường',
      nhomHD: 'N1B',
      capKy: 'vien-ky',
      loaiDacThu: null,
      clientId: clients?.[13]?.id || 14,
      giaTri: 8900,
      phanTramChuTri: 78,
      buocHienTai: 'hoan-thanh',
      trangThai: 'hoan-thanh',
      ngayKy: '2025-09-05',
      hanHoanThanh: '2026-04-05',
      soNgayThucHien: 210,
      noiDung: 'Thiết kế kiến trúc, kết cấu, điện nước (MEP), phòng cháy chữa cháy (PCCC) và ứng dụng BIM LOD350 toàn bộ Bệnh viện.',
      hasJointVenture: true,
      jointVentureName: 'CTCP Tư vấn Kiến trúc Việt Nam',
      jointVenturePct: 40,
    },

    // ────────────── BƯỚC 5: THANH LÝ & LƯU TRỮ (thanh-ly) ──────────────
    {
      unitId: 4,
      soHD: '402/2026/HDTN-PVMN',
      ten: 'Thí nghiệm kiểm tra chất lượng cọc nhồi D1500 bằng phương pháp khoan lõi & PIT dự án Metro Bến Thành - Suối Tiên',
      nhomHD: 'N2B',
      capKy: 'don-vi-ky',
      loaiDacThu: 'tn-dat-vl-thep-han',
      phanVienXa: true,
      clientId: clients?.[10]?.id || 11,
      giaTri: 4600,
      phanTramChuTri: 85,
      buocHienTai: 'thanh-ly',
      trangThai: 'thanh-ly',
      ngayKy: '2025-08-15',
      hanHoanThanh: '2026-02-15',
      soNgayThucHien: 180,
      noiDung: 'Thí nghiệm biến dạng nhỏ PIT, siêu âm màng ống 4 kênh và thử nén mẫu lõi bê tông cọc nhồi sâu 65m.',
      hasJointVenture: false,
    },
    {
      unitId: 12,
      soHD: '701/2026/HDKS-PVMT',
      ten: 'Thí nghiệm & Đánh giá an toàn đê biển, đập thủy lợi ứng phó sự cố bão lũ tại Thừa Thiên Huế',
      nhomHD: 'N1A',
      capKy: 'vien-ky',
      loaiDacThu: 'khao-sat-dia-chat',
      phanVienXa: true,
      clientId: clients?.[11]?.id || 12,
      giaTri: 3400,
      phanTramChuTri: 78,
      buocHienTai: 'thanh-ly',
      trangThai: 'thanh-ly',
      ngayKy: '2025-07-20',
      hanHoanThanh: '2026-01-20',
      soNgayThucHien: 180,
      noiDung: 'Khảo sát quét Georadar xuyên đất phát hiện hốc rỗng thân đê, thí nghiệm xói mòn bề mặt kè bê tông chắn sóng.',
      hasJointVenture: false,
    }
  ];

  console.log(`Generating ${items.length} complete Opportunity -> Bidding -> Contract pipelines across 5 workflow steps...`);

  for (const item of items) {
    const leaderId = getLeader(item.unitId);
    const members = getMembers(item.unitId);

    // STEP A: Insert Lead Opportunity (dang_ky_dau_moi)
    const { data: lead, error: leadErr } = await supabase
      .from('dang_ky_dau_moi')
      .insert({
        ten_co_hoi: `[Cơ hội] ${item.ten}`,
        mo_ta: `Cơ hội phát hiện thị trường tại đơn vị: ${item.noiDung}`,
        don_vi_dang_ky_id: item.unitId,
        nguoi_phat_hien_id: leaderId,
        nguoi_dang_ky_id: leaderId,
        trang_thai: 'giao-dau-moi',
        ngay_dang_ky: '2025-12-01',
      })
      .select()
      .single();

    if (leadErr) {
      console.error(`❌ Error inserting lead for ${item.soHD}:`, leadErr.message);
      continue;
    }

    // STEP B: Insert Bidding Package (dau_thau) linked to Lead Opportunity
    const { data: bid, error: bidErr } = await supabase
      .from('dau_thau')
      .insert({
        ten_goi_thau: `Gói thầu: ${item.ten}`,
        chu_dau_tu_id: item.clientId,
        don_vi_thuc_hien_id: item.unitId,
        hinh_thuc: 'dau-thau-rong-rai',
        gia_du_thau: item.giaTri,
        gia_trung_thau: item.giaTri,
        trang_thai: 'trung-thau',
        nguoi_phu_trach_id: leaderId,
        chu_tri_hsdt_id: leaderId,
        ngay_mo_thau: '2026-01-10',
        ngay_dong_thau: '2026-01-25',
      })
      .select()
      .single();

    if (bidErr) {
      console.error(`❌ Error inserting bid for ${item.soHD}:`, bidErr.message);
      continue;
    }

    // Update Lead Opportunity with created dau_thau_id
    await supabase.from('dang_ky_dau_moi').update({ dau_thau_id: bid.id }).eq('id', lead.id);

    // STEP C: Insert Contract (hop_dong) with BOTH buoc_hien_tai AND trang_thai set
    const { data: hd, error: hdErr } = await supabase
      .from('hop_dong')
      .insert({
        so_hop_dong: item.soHD,
        ten_hop_dong: item.ten,
        don_vi_id: item.unitId,
        khach_hang_id: item.clientId,
        gia_tri: item.giaTri,
        nhom_hd: item.nhomHD,
        cap_ky: item.capKy,
        loai_dac_thu: item.loaiDacThu,
        phan_vien_xa: item.phanVienXa || false,
        chu_tri_id: leaderId,
        buoc_hien_tai: item.buocHienTai,
        trang_thai: item.trangThai,
        ngay_ky: item.ngayKy,
        han_hoan_thanh: item.hanHoanThanh,
      })
      .select()
      .single();

    if (hdErr) {
      console.error(`❌ Error inserting contract ${item.soHD}:`, hdErr.message);
      continue;
    }

    // Update Bidding Package with created hop_dong_id
    await supabase.from('dau_thau').update({ hop_dong_id: hd.id }).eq('id', bid.id);

    console.log(`✅ Pipeline Created: Lead [${lead.id}] -> Bid [${bid.id}] -> Contract [${hd.id}] (${hd.so_hop_dong}) - Step: ${hd.buoc_hien_tai}`);

    // STEP D: Insert FULL Rich Phiếu giao việc (Mẫu 02-GV theo Điều 7 QC 2815)
    const kinhPhiGiao = Math.round((item.giaTri * item.phanTramChuTri) / 100);
    const pgvTrangThai =
      ['dang-thuc-hien', 'hoan-thanh', 'thanh-ly'].includes(item.buocHienTai) ? 'da-duyet' :
      item.buocHienTai === 'cho-duyet' ? 'cho-lanh-dao-duyet' : 'du-thao';

    const { data: pgv, error: pgvErr } = await supabase
      .from('phieu_giao_viec')
      .insert({
        hop_dong_id: hd.id,
        chu_tri_ky_thuat_id: leaderId,
        kinh_phi_giao: kinhPhiGiao,
        noi_dung: item.noiDung,
        ngay_giao: item.ngayKy || '2026-02-01',
        ngay_duyet: pgvTrangThai === 'da-duyet' ? (item.ngayKy || '2026-02-05') : null,
        trang_thai: pgvTrangThai,
        nguoi_soan_id: leaderId,
        nguoi_don_vi_xac_nhan_id: leaderId,
        nguoi_khkt_tham_tra_id: 1, // Viện trưởng / P.KHKT
        nguoi_duyet_id: 1, // Lãnh đạo Viện
      })
      .select()
      .single();

    if (pgv) {
      // 1. phieu_giao_viec_don_vi (Đơn vị chủ trì & Phối hợp)
      await supabase.from('phieu_giao_viec_don_vi').insert({
        phieu_giao_viec_id: pgv.id,
        don_vi_id: item.unitId,
        ty_le_gia_tri: 80,
        vai_tro: 'chu-tri',
      });

      // Nếu có đơn vị phối hợp (ví dụ đơn vị 5 hoặc 14)
      if (item.unitId === 1 || item.unitId === 3 || item.unitId === 14) {
        await supabase.from('phieu_giao_viec_don_vi').insert({
          phieu_giao_viec_id: pgv.id,
          don_vi_id: item.unitId === 1 ? 2 : item.unitId === 3 ? 6 : 13,
          ty_le_gia_tri: 20,
          vai_tro: 'phoi-hop',
        });
      }

      // 2. phieu_giao_viec_ctv (Thành viên thực hiện & CTV với % phân bổ kinh phí)
      const fullMembers = members.length > 0 ? members : staff.slice(0, 3);
      const ctvRows = fullMembers.slice(0, 4).map((m, idx) => {
        const pcts = [35, 25, 20, 20];
        const roles = [
          'Chịu trách nhiệm chính kỹ thuật hiện trường & chỉ đạo nhóm',
          'Cán bộ thí nghiệm chính, siêu âm cốt thép & lấy mẫu bê tông',
          'Thực hiện tính toán mô hình SAP2000/ETABS & thẩm tra kết cấu',
          'Tổng hợp số liệu, biên soạn dự thảo báo cáo KHKT & hồ sơ nghiệm thu',
        ];
        return {
          phieu_giao_viec_id: pgv.id,
          nhan_su_id: m.id,
          ty_le_phan_chia: pcts[idx] || 15,
          ghi_chu: roles[idx] || 'Cán bộ kỹ thuật phối hợp',
        };
      });
      await supabase.from('phieu_giao_viec_ctv').insert(ctvRows);
    }

    // STEP E: Insert dot_thanh_toan
    if (['dang-thuc-hien', 'hoan-thanh', 'thanh-ly'].includes(item.buocHienTai)) {
      const tamUng = Math.round(item.giaTri * 0.3);
      const giaiDoan = Math.round(item.giaTri * 0.5);
      const quyetToan = item.giaTri - tamUng - giaiDoan;

      await supabase.from('dot_thanh_toan').insert([
        {
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 1: Tạm ứng 30% sau khi ký hợp đồng',
          so_tien: tamUng,
          ngay_du_kien: item.ngayKy || '2026-02-15',
          ngay_thuc_thu: item.ngayKy || '2026-02-20',
          ghi_chu: 'Đã thu tiền tạm ứng hợp đồng theo Điều 4',
        },
        {
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 2: Thanh toán 50% khi hoàn thành 80% khối lượng',
          so_tien: giaiDoan,
          ngay_du_kien: '2026-06-30',
          ngay_thuc_thu: ['hoan-thanh', 'thanh-ly'].includes(item.buocHienTai) ? '2026-04-25' : null,
          ghi_chu: 'Nghiệm thu kỹ thuật giai đoạn',
        },
        {
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 3: Thanh toán quyết toán 20% khi bàn giao báo cáo',
          so_tien: quyetToan,
          ngay_du_kien: item.hanHoanThanh,
          ngay_thuc_thu: item.buocHienTai === 'thanh-ly' ? '2026-05-15' : null,
          ghi_chu: 'Hồ sơ quyết toán & Biên bản thanh lý HĐ',
        },
      ]);
    }

    // STEP F: Insert quyet_toan_giai_doan
    if (['dang-thuc-hien', 'hoan-thanh', 'thanh-ly'].includes(item.buocHienTai)) {
      await supabase.from('quyet_toan_giai_doan').insert([
        {
          hop_dong_id: hd.id,
          ten_giai_doan: 'Giai đoạn 1: Khảo sát & Thu thập số liệu hiện trường',
          ty_le_hoan_thanh: 100,
          ngay_xac_nhan: '2026-03-30',
          nguoi_xac_nhan_id: leaderId,
          ghi_chu: 'Đã nghiệm thu đầy đủ nhật ký khảo sát và sơ đồ mốc',
        },
      ]);
    }

    // STEP G: Insert lien_danh
    if (item.hasJointVenture) {
      await supabase.from('lien_danh').insert({
        hop_dong_id: hd.id,
        ten_doi_tac: item.jointVentureName,
        ty_le_phan_tram: item.jointVenturePct,
        vai_tro: 'thanh-vien',
        gia_tri_phan_viec: Math.round((item.giaTri * item.jointVenturePct) / 100),
        ghi_chu: 'Hợp đồng liên danh ký ngày ' + (item.ngayKy || '2026-01-15'),
      });
    }

    // STEP H: Insert luu_tru_ho_so
    await supabase.from('luu_tru_ho_so').insert([
      {
        hop_dong_id: hd.id,
        so_ho_so: `HS-${item.soHD.replace(/\//g, '-')}`,
        vi_tri_luu_tru: `Kệ A3-Phòng Lưu trữ TCHC`,
        ngay_nhan_luu_tru: item.ngayKy || '2026-02-28',
        nguoi_ban_giao_id: leaderId,
        trang_thai: item.buocHienTai === 'thanh-ly' ? 'da-luu-kho' : 'da-nhan',
        ghi_chu: 'Lưu kho bộ hồ sơ gốc gồm HĐ, PGV, và BBNT',
      },
    ]);
  }

  console.log('\n🎉 Seed generation finished with full 5-step distribution & rich Phiếu giao việc!');
}

seedData();
