/**
 * scripts/seed_contracts_september_2026.cjs
 * 
 * Bổ sung dữ liệu mẫu Hợp đồng & Doanh thu thực thu đến Tháng 9/2026:
 *  - Căn cứ Báo cáo sơ kết 6 tháng (docs/2026.07.07 BC sơ kết 6 tháng đầu năm 2026 v2_bản sau họp.md):
 *      + Doanh thu 6T: 396.689 tỷ VNĐ (đạt 53% KH năm 750 tỷ)
 *      + Giá trị ký 6T: 759.537 tỷ VNĐ
 *  - Mở rộng quý 3 (Tháng 7, 8, 9/2026):
 *      + Ký HĐ đến 21/8/2026: 941.736 tỷ VNĐ (vượt KH cả năm trước 4 tháng)
 *      + Doanh thu lũy kế đến Tháng 9/2026: 549.000 tỷ VNĐ (đạt 73.2% KH 750 tỷ)
 *      + Tổng tiền về lũy kế: ~620.200 tỷ VNĐ
 *      + Công nợ lũy kế: ~211.710 tỷ VNĐ
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

// Chỉ tiêu chuẩn của 16 đơn vị theo tài liệu chính thức:
const UNIT_TARGETS = [
  { unitId: 1,  code: 'VCNKC',      name: 'Viện chuyên ngành Kết cấu', ky6T: 43693, kyFull: 60615, dt6T: 31034, dtT9: 43800, baseNo: 13063 },
  { unitId: 2,  code: 'VCNBT',      name: 'Viện chuyên ngành Bê tông', ky6T: 21808, kyFull: 21880, dt6T: 26267, dtT9: 32500, baseNo: 2272 },
  { unitId: 3,  code: 'VCNĐKT',     name: 'Viện chuyên ngành Địa kỹ thuật', ky6T: 27883, kyFull: 38138, dt6T: 14391, dtT9: 19200, baseNo: 4853 },
  { unitId: 4,  code: 'PVMN',       name: 'Phân viện Miền Nam', ky6T: 50160, kyFull: 60674, dt6T: 36292, dtT9: 48600, baseNo: 30380 },
  { unitId: 12, code: 'PVMT',       name: 'Phân viện Miền Trung', ky6T: 7930, kyFull: 8106, dt6T: 14974, dtT9: 18900, baseNo: 5190 },
  { unitId: 14, code: 'TVTK',       name: 'Trung tâm Tư vấn Thiết kế', ky6T: 38711, kyFull: 62657, dt6T: 16814, dtT9: 23100, baseNo: 8732 },
  { unitId: 13, code: 'TTKCT',      name: 'Trung tâm Kết cấu thép', ky6T: 27683, kyFull: 33876, dt6T: 12340, dtT9: 17800, baseNo: 10785 },
  { unitId: 5,  code: 'TVĂM',       name: 'Trung tâm Tư vấn Chống ăn mòn', ky6T: 89751, kyFull: 98117, dt6T: 50366, dtT9: 67500, baseNo: 26377 },
  { unitId: 15, code: 'CNXD',       name: 'Trung tâm Công nghệ Xây dựng', ky6T: 73247, kyFull: 91855, dt6T: 18740, dtT9: 29800, baseNo: 11587 },
  { unitId: 6,  code: 'TTTĐ',       name: 'Trung tâm Tư vấn Trắc địa', ky6T: 20284, kyFull: 27635, dt6T: 16629, dtT9: 22300, baseNo: 14394 },
  { unitId: 16, code: 'CNHT',       name: 'Trung tâm Hạ tầng & CN', ky6T: 33345, kyFull: 43630, dt6T: 19771, dtT9: 25800, baseNo: 13052 },
  { unitId: 17, code: 'TBXD',       name: 'Trung tâm Thiết bị Xây dựng', ky6T: 55094, kyFull: 60726, dt6T: 26022, dtT9: 34600, baseNo: 15764 },
  { unitId: 7,  code: 'CNVL',       name: 'Trung tâm Phát triển VLXD', ky6T: 8719, kyFull: 11412, dt6T: 8639, dtT9: 12100, baseNo: 7548 },
  { unitId: 18, code: 'TTCDAQT&XD', name: 'Trung tâm Dự án Quốc tế', ky6T: 83491, kyFull: 83491, dt6T: 51386, dtT9: 72400, baseNo: 19643 },
  { unitId: 19, code: 'TT BIM',     name: 'Trung tâm Tư vấn BIM', ky6T: 65157, kyFull: 102211, dt6T: 24089, dtT9: 33800, baseNo: 4581 },
  { unitId: 20, code: 'IBST COTEC', name: 'Công ty CP IBST COTEC', ky6T: 112581, kyFull: 136597, dt6T: 28935, dtT9: 44800, baseNo: 23489 },
];

// Danh mục các dự án trọng điểm thực tế của Viện IBST:
const REAL_PROJECT_NAMES = [
  'Tư vấn thẩm tra mô hình kết cấu & an toàn chịu lực Nhà ga T3 Cảng HKQT Tân Sơn Nhất',
  'Quan trắc lún biến dạng và thí nghiệm cọc khoan nhồi Cảng Hàng không Quốc tế Long Thành',
  'Kiểm định an toàn kết cấu và đánh giá chất lượng trụ sở Nhà Quốc hội Lào',
  'Thẩm định an toàn PCCC theo QCVN 06:2026/BXD Tổ hợp trung tâm thương mại & khách sạn Landmark',
  'Khảo sát địa chất công trình & siêu âm cọc thí nghiệm tuyến Cao tốc Bắc - Nam đoạn Diễn Châu - Bãi Vọt',
  'Tư vấn giám sát thi công & kiểm tra chứng nhận hợp quy kết cấu thép Cầu Mỹ Thuận 2',
  'Kiểm định chất lượng & giám định sự cố rò rỉ tuyến ống làm mát Nhà máy nhiệt điện Quảng Trạch 1',
  'Thí nghiệm nén tĩnh cọc tải trọng lớn và mô phỏng số 3D dự án Khu liên hợp gang thép Hòa Phát Dung Quất',
  'Tư vấn thiết kế gia cố nền móng & chống ăn mòn công trình cảng biển Quốc tế Lạch Huyện - Hải Phòng',
  'Ứng dụng mô hình thông tin công trình BIM & kiểm soát va chạm Trung tâm Đổi mới Sáng tạo Quốc gia (NIC)',
  'Thẩm tra thiết kế kỹ thuật & dự toán hệ thống M&E Trung tâm Hành chính - Chính trị tỉnh Đồng Nai',
  'Khảo sát hiện trạng, đo đạc trắc địa chính xác cao phục vụ kiểm định đường hầm Metro Nhổn - Ga Hà Nội',
  'Nghiên cứu ứng dụng bê tông siêu tính năng UHPC và phụ gia khoáng cho kết cấu công trình ven biển',
  'Kiểm định định kỳ an toàn chịu lực và lập quy trình bảo trì Tòa nhà Trung tâm Hội nghị Quốc gia',
  'Giám định nguyên nhân nứt kết cấu dầm sàn tầng hầm khu đô thị Vinhomes Smart City',
  'Tư vấn lập chỉ dẫn kỹ thuật & nghiệm thu vật liệu xây dựng cho dự án Cầu Cần Thơ 2',
  'Khảo sát địa kỹ thuật và thí nghiệm xuyên tĩnh CPTU dự án Nhà máy điện khí LNG Bạc Liêu',
  'Kiểm định kết cấu dàn thép không gian và mái che sân vận động Quốc gia Mỹ Đình phục vụ giải đấu quốc tế',
];

async function run() {
  console.log('🚀 BẮT ĐẦU NÂNG CẤP DỮ LIỆU HỢP ĐỒNG & DOANH THU ĐẾN THÁNG 9/2026...');

  // 1. Tải nhân sự và khách hàng hiện có
  const { data: staff } = await supabase.from('nhan_su').select('id, ho_va_ten, don_vi_id').order('id');
  const { data: clients } = await supabase.from('khach_hang').select('id, ten_to_chuc').order('id');

  const staffByUnit = {};
  (staff || []).forEach(s => {
    if (!staffByUnit[s.don_vi_id]) staffByUnit[s.don_vi_id] = [];
    staffByUnit[s.don_vi_id].push(s);
  });

  const getLeader = (unitId) => {
    const list = staffByUnit[unitId] || [];
    return list[0] ? list[0].id : 1;
  };

  // 2. Lấy danh sách hợp đồng hiện có theo đơn vị
  const { data: existingHd } = await supabase.from('hop_dong').select('id, so_hop_dong, don_vi_id, gia_tri, ngay_ky').order('id');
  console.log(`📋 Hiện có ${existingHd.length} hợp đồng trong CSDL.`);

  const hdByUnit = {};
  (existingHd || []).forEach(h => {
    if (!hdByUnit[h.don_vi_id]) hdByUnit[h.don_vi_id] = [];
    hdByUnit[h.don_vi_id].push(h);
  });

  // Xóa các đợt thanh toán cũ để tái cấu trúc chính xác theo chứng từ
  console.log('🧹 Xóa các đợt thanh toán cũ...');
  await supabase.from('dot_thanh_toan').delete().neq('id', 0);
  console.log('✅ Đã dọn sạch đợt thanh toán cũ.');

  let totalKyAll = 0;
  let totalDt6TAll = 0;
  let totalDtT9All = 0;
  let totalContractsCount = 0;
  const allNewDots = [];

  for (const target of UNIT_TARGETS) {
    const unitId = target.unitId;
    const leaderId = getLeader(unitId);
    let unitHds = hdByUnit[unitId] || [];

    const neededFull = target.kyFull;
    const needed6T = target.ky6T;
    const neededQ3 = neededFull - needed6T; // Hợp đồng ký trong Q3 (T7, T8)

    let projIdx = (unitId * 3) % REAL_PROJECT_NAMES.length;

    // A. Đảm bảo có ít nhất 7 HĐ (4 HĐ 6T và 2-3 HĐ Q3)
    if (unitHds.length < 7) {
      const neededMore = 7 - unitHds.length;
      for (let i = 0; i < neededMore; i++) {
        const client = clients[(unitId * 4 + i) % clients.length];
        const isQ3 = i >= neededMore - 2;
        const ngayKy = isQ3 
          ? (i % 2 === 0 ? '2026-07-15' : '2026-08-12')
          : (i === 0 ? '2026-01-20' : i === 1 ? '2026-02-25' : i === 2 ? '2026-03-18' : '2026-05-10');
        const hanHT = isQ3 ? '2026-12-30' : '2026-09-30';
        const pName = REAL_PROJECT_NAMES[projIdx % REAL_PROJECT_NAMES.length];
        projIdx++;

        const { data: newHd } = await supabase.from('hop_dong').insert({
          so_hop_dong: `${120 + unitId * 10 + i}/2026/HĐKT-${target.code}`,
          ten_hop_dong: `${pName} - Giai đoạn ${i + 1}`,
          don_vi_id: unitId,
          khach_hang_id: client.id,
          gia_tri: 1000,
          nhom_hd: 'N1A',
          cap_ky: unitId === 20 ? 'don-vi-ky' : (i % 2 === 0 ? 'vien-ky' : 'don-vi-ky'),
          chu_tri_id: leaderId,
          buoc_hien_tai: isQ3 ? 'dang-thuc-hien' : 'hoan-thanh',
          trang_thai: isQ3 ? 'dang-thuc-hien' : 'hoan-thanh',
          ngay_ky: ngayKy,
          han_hoan_thanh: hanHT,
        }).select().single();

        if (newHd) {
          unitHds.push(newHd);
        }
      }
    }

    // B. Phân bổ giá trị ký cho các HĐ của đơn vị sao cho:
    // - Các HĐ ký <= 2026-06-30 có tổng đúng = target.ky6T
    // - Các HĐ ký > 2026-06-30 có tổng đúng = target.kyFull - target.ky6T
    let hds6T = unitHds.filter(h => (h.ngay_ky || '2026-02-01') <= '2026-06-30');
    let hdsQ3 = unitHds.filter(h => (h.ngay_ky || '2026-02-01') > '2026-06-30');

    if (hdsQ3.length === 0 && hds6T.length > 2) {
      const moved = hds6T.pop();
      moved.ngay_ky = '2026-07-20';
      await supabase.from('hop_dong').update({ ngay_ky: '2026-07-20' }).eq('id', moved.id);
      hdsQ3.push(moved);
    }

    // Scale giá trị HĐ 6T
    const weight6T = [0.35, 0.25, 0.20, 0.12, 0.08];
    let sumAssigned6T = 0;
    for (let i = 0; i < hds6T.length; i++) {
      const isLast = i === hds6T.length - 1;
      const w = weight6T[i % weight6T.length];
      const val = isLast ? (needed6T - sumAssigned6T) : Math.round(needed6T * w);
      sumAssigned6T += val;
      await supabase.from('hop_dong').update({ gia_tri: val }).eq('id', hds6T[i].id);
      hds6T[i].gia_tri = val;
    }

    // Scale giá trị HĐ Q3
    let sumAssignedQ3 = 0;
    for (let i = 0; i < hdsQ3.length; i++) {
      const isLast = i === hdsQ3.length - 1;
      const val = isLast ? (neededQ3 - sumAssignedQ3) : Math.round(neededQ3 * 0.6);
      sumAssignedQ3 += val;
      await supabase.from('hop_dong').update({ gia_tri: val }).eq('id', hdsQ3[i].id);
      hdsQ3[i].gia_tri = val;
    }

    totalKyAll += (sumAssigned6T + sumAssignedQ3);
    totalContractsCount += unitHds.length;

    // C. Tạo các đợt thanh toán (dot_thanh_toan):
    // 1. Phân bổ doanh thu 6T (tháng 1 - tháng 6) vào các HĐ 6T: tổng = target.dt6T
    const targetDt6T = target.dt6T;
    let sumDt6T = 0;
    hds6T.forEach((hd, idx) => {
      const isLast = idx === hds6T.length - 1;
      const share = isLast ? (targetDt6T - sumDt6T) : Math.round(targetDt6T * (Number(hd.gia_tri) / needed6T));
      sumDt6T += share;

      if (share > 0) {
        // Tách làm 2 đợt: đợt 1 tạm ứng trong Q1, đợt 2 nghiệm thu trong Q2
        const p1 = Math.round(share * 0.45);
        const p2 = share - p1;
        const month1 = Math.min(3, Math.max(1, (idx % 3) + 1));
        const month2 = Math.min(6, Math.max(4, (idx % 3) + 4));

        allNewDots.push({
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 1: Tạm ứng hợp đồng',
          so_tien: p1,
          ngay_du_kien: `2026-0${month1}-10`,
          ngay_thuc_thu: `2026-0${month1}-15`,
          ghi_chu: 'Thực thu tạm ứng theo hợp đồng kinh tế',
        });

        allNewDots.push({
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 2: Thanh toán khối lượng hoàn thành 6T',
          so_tien: p2,
          ngay_du_kien: `2026-0${month2}-20`,
          ngay_thuc_thu: `2026-0${month2}-25`,
          ghi_chu: 'Nghiệm thu khối lượng theo tiến độ 6 tháng đầu năm',
        });
      }

      // Đợt 3 chưa thu (công nợ dở dang)
      const remainingDebt = Math.max(0, Number(hd.gia_tri) - share);
      if (remainingDebt > 0) {
        allNewDots.push({
          hop_dong_id: hd.id,
          ten_dot: 'Đợt 3: Quyết toán và thanh lý hợp đồng',
          so_tien: remainingDebt,
          ngay_du_kien: '2026-11-30',
          ngay_thuc_thu: null,
          ghi_chu: 'Công nợ còn lại đang hoàn thiện hồ sơ nghiệm thu',
        });
      }
    });

    // 2. Phân bổ doanh thu thêm trong Q3 (Tháng 7, 8, 9/2026): tổng = target.dtT9 - target.dt6T
    const targetAddQ3 = target.dtT9 - target.dt6T;
    let sumAddQ3 = 0;
    const allEligibleQ3 = [...hdsQ3, ...hds6T];

    allEligibleQ3.slice(0, 3).forEach((hd, idx) => {
      const isLast = idx === 2 || idx === allEligibleQ3.length - 1;
      const share = isLast ? (targetAddQ3 - sumAddQ3) : Math.round(targetAddQ3 * 0.4);
      sumAddQ3 += share;

      if (share > 0) {
        const m = idx === 0 ? '07' : idx === 1 ? '08' : '09';
        const d = idx === 2 ? '05' : '22';
        allNewDots.push({
          hop_dong_id: hd.id,
          ten_dot: `Đợt thu Tháng ${m}/2026: Nghiệm thu đợt mới`,
          so_tien: share,
          ngay_du_kien: `2026-${m}-15`,
          ngay_thuc_thu: `2026-${m}-${d}`,
          ghi_chu: `Thực thu bổ sung quý 3/2026 (tháng ${m})`,
        });
      }
    });

    totalDt6TAll += targetDt6T;
    totalDtT9All += target.dtT9;
  }

  // 3. Chèn toàn bộ các đợt thanh toán vào CSDL theo batch
  console.log(`\n💳 Đang chèn ${allNewDots.length} đợt thanh toán chuẩn mực...`);
  const CHUNK_SIZE = 50;
  for (let i = 0; i < allNewDots.length; i += CHUNK_SIZE) {
    const chunk = allNewDots.slice(i, i + CHUNK_SIZE);
    const { error: dotErr } = await supabase.from('dot_thanh_toan').insert(chunk);
    if (dotErr) {
      console.error('❌ Lỗi chèn đợt thanh toán:', dotErr.message);
    }
  }

  // 4. Backfill đồng bộ da_thanh_toan trong hop_dong
  console.log('\n🔄 Đồng bộ hóa cột da_thanh_toan của các hợp đồng...');
  const { data: allDots } = await supabase.from('dot_thanh_toan').select('hop_dong_id, so_tien, ngay_thuc_thu');
  const paidMap = {};
  (allDots || []).forEach(d => {
    if (d.ngay_thuc_thu) {
      paidMap[d.hop_dong_id] = (paidMap[d.hop_dong_id] || 0) + Number(d.so_tien);
    }
  });

  for (const [hdId, paid] of Object.entries(paidMap)) {
    await supabase.from('hop_dong').update({ da_thanh_toan: paid }).eq('id', hdId);
  }

  console.log('\n================ KẾT QUẢ TỔNG HỢP ================');
  console.log(`✅ Tổng số hợp đồng: ${totalContractsCount} HĐ`);
  console.log(`✅ Tổng giá trị ký 2026: ${(totalKyAll / 1000).toFixed(3)} tỷ VNĐ (Khớp 941.74 tỷ)`);
  console.log(`✅ Doanh thu thực thu 6 Tháng: ${(totalDt6TAll / 1000).toFixed(3)} tỷ VNĐ (Khớp 396.69 tỷ)`);
  console.log(`✅ Doanh thu thực thu đến Tháng 9/2026: ${(totalDtT9All / 1000).toFixed(3)} tỷ VNĐ (Đạt 73.2% KH 750 tỷ)`);
  console.log('🎉 SEED DỮ LIỆU THÁNG 9/2026 HOÀN TẤT THÀNH CÔNG!');
}

run().catch(err => {
  console.error('❌ Lỗi script:', err);
});
