/**
 * scripts/seed_contracts_by_unit.cjs
 * 
 * Script thực thi Seed 80 Hợp đồng mẫu cho 16 đơn vị của Viện IBST:
 *   - 16 đơn vị chuyên môn & sản xuất x 5 HĐ = 80 HĐ
 *   - Mỗi đơn vị đủ 5 bước quy trình: du-thao, cho-duyet, dang-thuc-hien, hoan-thanh, thanh-ly
 *   - Đầy đủ quan hệ liên kết:
 *       + dang_ky_dau_moi (Cơ hội thị trường)
 *       + dau_thau (Gói thầu)
 *       + hop_dong (Hợp đồng kinh tế)
 *       + phieu_giao_viec (Mẫu 02-GV Điều 7 QC 2815)
 *       + phieu_giao_viec_don_vi (Đơn vị chủ trì & phối hợp)
 *       + phieu_giao_viec_ctv (Nhóm thực hiện & CTV)
 *       + dot_thanh_toan (Kích hoạt DB trigger trg_dot_thanh_toan_dong_bo)
 *       + quyet_toan_giai_doan (Nghiệm thu khối lượng)
 *       + lien_danh (Đối tác liên danh nếu có)
 *       + luu_tru_ho_so (Lưu trữ hồ sơ vật lý)
 */

const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const { contractsData } = require('./seed_data_units.cjs');

// 1. Nạp cấu hình từ .env
const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function seedAllUnits() {
  console.log('🚀 BẮT ĐẦU SEED DỮ LIỆU MẪU: 80 HỢP ĐỒNG CHO 16 ĐƠN VỊ IBST...');
  console.log(`📋 Tổng số hợp đồng cần seed: ${contractsData.length}`);

  // 2. Dọn dẹp dữ liệu cũ (tuân thủ thứ tự khóa ngoại)
  console.log('\n🧹 Dọn dẹp dữ liệu cũ...');
  await supabase.from('luu_tru_ho_so').delete().neq('id', 0);
  await supabase.from('lien_danh').delete().neq('id', 0);
  await supabase.from('quyet_toan_giai_doan').delete().neq('id', 0);
  await supabase.from('dot_thanh_toan').delete().neq('id', 0);
  await supabase.from('phieu_giao_viec_ctv').delete().neq('id', 0);
  await supabase.from('phieu_giao_viec_don_vi').delete().neq('id', 0);
  await supabase.from('phieu_giao_viec').delete().neq('id', 0);

  // Gỡ liên kết khóa ngoại trước khi xóa bảng cha
  await supabase.from('dau_thau').update({ hop_dong_id: null }).neq('id', 0);
  await supabase.from('dang_ky_dau_moi').update({ dau_thau_id: null }).neq('id', 0);

  await supabase.from('hop_dong').delete().neq('id', 0);
  await supabase.from('dau_thau').delete().neq('id', 0);
  await supabase.from('dang_ky_dau_moi').delete().neq('id', 0);
  console.log('✅ Đã dọn sạch các bảng hợp đồng và hồ sơ liên quan.');

  // 3. Nạp danh mục nhân sự và khách hàng
  const { data: staff } = await supabase.from('nhan_su').select('id, ho_va_ten, don_vi_id').order('id');
  const { data: clients } = await supabase.from('khach_hang').select('id, ten_to_chuc').order('id');
  const { data: units } = await supabase.from('don_vi').select('id, ma_dinh_danh, ten_don_vi, ten_viet_tat').order('id');

  const staffByUnit = {};
  (staff || []).forEach(s => {
    if (!staffByUnit[s.don_vi_id]) staffByUnit[s.don_vi_id] = [];
    staffByUnit[s.don_vi_id].push(s);
  });

  const getLeader = (unitId) => {
    const list = staffByUnit[unitId] || [];
    return list[0] ? list[0].id : 1;
  };

  const getMembers = (unitId) => {
    const list = staffByUnit[unitId] || [];
    return list.slice(1);
  };

  // 4. Lặp qua 80 hợp đồng và khởi tạo toàn bộ chuỗi
  let count = 0;
  for (const item of contractsData) {
    count++;
    const leaderId = getLeader(item.unitId);
    const members = getMembers(item.unitId);
    const client = clients[item.clientIdx % clients.length];

    // BƯỚC A: Đăng ký đầu mối (dang_ky_dau_moi)
    const { data: lead, error: leadErr } = await supabase
      .from('dang_ky_dau_moi')
      .insert({
        ten_co_hoi: `[Cơ hội] ${item.ten}`,
        mo_ta: `Nhu cầu thực hiện: ${item.noiDung}`,
        don_vi_dang_ky_id: item.unitId,
        nguoi_phat_hien_id: leaderId,
        nguoi_dang_ky_id: leaderId,
        trang_thai: 'giao-dau-moi',
        ngay_dang_ky: '2025-12-01',
      })
      .select()
      .single();

    if (leadErr) {
      console.error(`❌ Lỗi tạo đầu mối cho ${item.soHD}:`, leadErr.message);
      continue;
    }

    // BƯỚC B: Gói thầu (dau_thau)
    const { data: bid, error: bidErr } = await supabase
      .from('dau_thau')
      .insert({
        ten_goi_thau: `Gói thầu: ${item.ten}`,
        chu_dau_tu_id: client.id,
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
      console.error(`❌ Lỗi tạo thầu cho ${item.soHD}:`, bidErr.message);
      continue;
    }

    await supabase.from('dang_ky_dau_moi').update({ dau_thau_id: bid.id }).eq('id', lead.id);

    // BƯỚC C: Hợp đồng kinh tế (hop_dong)
    const { data: hd, error: hdErr } = await supabase
      .from('hop_dong')
      .insert({
        so_hop_dong: item.soHD,
        ten_hop_dong: item.ten,
        don_vi_id: item.unitId,
        khach_hang_id: client.id,
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
      console.error(`❌ Lỗi tạo HĐ ${item.soHD}:`, hdErr.message);
      continue;
    }

    await supabase.from('dau_thau').update({ hop_dong_id: hd.id }).eq('id', bid.id);

    // BƯỚC D: Phiếu giao việc (phieu_giao_viec Mẫu 02-GV)
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
        nguoi_khkt_tham_tra_id: 1,
        nguoi_duyet_id: 1,
      })
      .select()
      .single();

    if (pgv) {
      // Đơn vị giao việc
      const hasCoordination = [1, 3, 14, 16, 19].includes(item.unitId);
      await supabase.from('phieu_giao_viec_don_vi').insert({
        phieu_giao_viec_id: pgv.id,
        don_vi_id: item.unitId,
        ty_le_gia_tri: hasCoordination ? 80 : 100,
        vai_tro: 'chu-tri',
      });

      if (hasCoordination) {
        const coordUnitId = item.unitId === 1 ? 2 : item.unitId === 3 ? 6 : item.unitId === 14 ? 13 : item.unitId === 16 ? 15 : 14;
        await supabase.from('phieu_giao_viec_don_vi').insert({
          phieu_giao_viec_id: pgv.id,
          don_vi_id: coordUnitId,
          ty_le_gia_tri: 20,
          vai_tro: 'phoi-hop',
        });
      }

      // Nhân sự thực hiện
      const fullMembers = members.length > 0 ? members : staff.slice(0, 3);
      const ctvRows = fullMembers.slice(0, 3).map((m, idx) => {
        const pcts = [40, 30, 30];
        const roles = [
          'Chỉ đạo kỹ thuật hiện trường & Chủ trì chuyên môn',
          'Khảo sát, thí nghiệm, thu thập số liệu và tính toán',
          'Biên tập báo cáo kết quả và lập hồ sơ hoàn công',
        ];
        return {
          phieu_giao_viec_id: pgv.id,
          nhan_su_id: m.id,
          ty_le_phan_chia: pcts[idx] || 25,
          ghi_chu: roles[idx] || 'Cán bộ kỹ thuật tham gia thực hiện',
        };
      });
      if (ctvRows.length > 0) {
        await supabase.from('phieu_giao_viec_ctv').insert(ctvRows);
      }
    }

    // BƯỚC E: Đợt thanh toán (dot_thanh_toan)
    // Tự động kích hoạt trigger trg_dot_thanh_toan_dong_bo để tính hop_dong.da_thanh_toan
    const tamUng = Math.round(item.giaTri * 0.3);
    const giaiDoan = Math.round(item.giaTri * 0.5);
    const quyetToan = item.giaTri - tamUng - giaiDoan;

    const paymentRows = [
      {
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 1: Tạm ứng 30% giá trị hợp đồng',
        so_tien: tamUng,
        ngay_du_kien: item.ngayKy || '2026-02-15',
        ngay_thuc_thu: ['dang-thuc-hien', 'hoan-thanh', 'thanh-ly'].includes(item.buocHienTai) ? (item.ngayKy || '2026-02-20') : null,
        ghi_chu: 'Tạm ứng hợp đồng theo điều khoản thanh toán',
      },
      {
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 2: Thanh toán 50% khối lượng hoàn thành',
        so_tien: giaiDoan,
        ngay_du_kien: '2026-06-30',
        ngay_thuc_thu: ['hoan-thanh', 'thanh-ly'].includes(item.buocHienTai) ? '2026-04-20' : null,
        ghi_chu: 'Nghiệm thu khối lượng giai đoạn',
      },
      {
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 3: Quyết toán 20% khi bàn giao và thanh lý',
        so_tien: quyetToan,
        ngay_du_kien: item.hanHoanThanh,
        ngay_thuc_thu: item.buocHienTai === 'thanh-ly' ? '2026-05-15' : null,
        ghi_chu: 'Hồ sơ nghiệm thu quyết toán và thanh lý hợp đồng',
      }
    ];
    await supabase.from('dot_thanh_toan').insert(paymentRows);

    // BƯỚC F: Quyết toán giai đoạn (quyet_toan_giai_doan)
    if (['dang-thuc-hien', 'hoan-thanh', 'thanh-ly'].includes(item.buocHienTai)) {
      await supabase.from('quyet_toan_giai_doan').insert([
        {
          hop_dong_id: hd.id,
          ten_giai_doan: 'Giai đoạn 1: Khảo sát hiện trường và thu thập số liệu',
          ty_le_hoan_thanh: 100,
          ngay_xac_nhan: '2026-03-15',
          nguoi_xac_nhan_id: leaderId,
          ghi_chu: 'Đã hoàn thành toàn bộ khối lượng hiện trường',
        },
      ]);
    }

    // BƯỚC G: Liên danh (lien_danh)
    if (item.hasJointVenture) {
      await supabase.from('lien_danh').insert({
        hop_dong_id: hd.id,
        ten_doi_tac: item.jointVentureName,
        ty_le_phan_tram: item.jointVenturePct,
        vai_tro: 'thanh-vien',
        gia_tri_phan_viec: Math.round((item.giaTri * item.jointVenturePct) / 100),
        ghi_chu: 'Thành viên liên danh theo thỏa thuận liên danh ký kết',
      });
    }

    // BƯỚC H: Lưu trữ hồ sơ (luu_tru_ho_so)
    await supabase.from('luu_tru_ho_so').insert([
      {
        hop_dong_id: hd.id,
        so_ho_so: `HS-${item.soHD.replace(/\//g, '-')}`,
        vi_tri_luu_tru: `Kho Lưu trữ IBST - Tủ T${(item.unitId % 10) + 1}`,
        ngay_nhan_luu_tru: item.ngayKy || '2026-03-01',
        nguoi_ban_giao_id: leaderId,
        trang_thai: item.buocHienTai === 'thanh-ly' ? 'da-luu-kho' : 'da-nhan',
        ghi_chu: 'Bộ hồ sơ hợp đồng, phiếu giao việc, biên bản nghiệm thu',
      },
    ]);

    if (count % 10 === 0 || count === contractsData.length) {
      console.log(`  ➔ Đã hoàn thành ${count}/${contractsData.length} hợp đồng...`);
    }
  }

  // 5. Thống kê kết quả
  const { count: totalHd } = await supabase.from('hop_dong').select('*', { count: 'exact', head: true });
  console.log(`\n🎉 HOÀN TẤT SEED! Tổng số hợp đồng hiện có trong CSDL: ${totalHd}`);
}

seedAllUnits().catch(err => {
  console.error('❌ Lỗi thực thi seed:', err);
  process.exit(1);
});
