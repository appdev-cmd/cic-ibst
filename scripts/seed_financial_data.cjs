/**
 * Seed dữ liệu mẫu cho Phân hệ Tài chính & Thu chi — khớp 100% với 80 Hợp đồng mẫu
 * Chạy: node scripts/seed_financial_data.cjs
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

async function main() {
  console.log('=== SEED DỮ LIỆU MẪU TÀI CHÍNH & THU CHI (KHỚP 80 HỢP ĐỒNG) ===\n');

  // 1. Lấy danh sách 80 hợp đồng hiện có
  const { data: hopDongs, error: hdErr } = await supabase
    .from('hop_dong')
    .select('id, so_hop_dong, ten_hop_dong, don_vi_id, gia_tri, buoc_hien_tai, trang_thai, chu_tri_id, ngay_ky, han_hoan_thanh, nhom_hd')
    .order('id');

  if (hdErr || !hopDongs || hopDongs.length === 0) {
    console.error('❌ Lỗi lấy danh sách hợp đồng:', hdErr?.message);
    return;
  }
  console.log(`✅ Tìm thấy ${hopDongs.length} hợp đồng mẫu.`);

  // 2. Cập nhật 240 đợt thanh toán (dot_thanh_toan) trải đều 12 tháng năm 2026
  console.log('\n--- 1. Cập nhật Đợt thanh toán (Kế hoạch & Thực thu T1-T12/2026) ---');
  
  // Xóa các đợt thanh toán cũ và tạo lại chuẩn xác theo từng hợp đồng
  await supabase.from('dot_thanh_toan').delete().neq('id', 0);

  const dotsToInsert = [];
  let dotCounter = 100;

  hopDongs.forEach((hd, index) => {
    const giaTri = Number(hd.gia_tri);
    const buoc = hd.buoc_hien_tai;
    const unitIdx = (Number(hd.donViId || hd.don_vi_id) % 12); // tháng offset 0..11
    
    // Đợt 1: Tạm ứng 30%
    const d1Tien = Math.round(giaTri * 0.3);
    // Đợt 2: Nghiệm thu giai đoạn 50%
    const d2Tien = Math.round(giaTri * 0.5);
    // Đợt 3: Quyết toán / Thanh lý 20%
    const d3Tien = giaTri - d1Tien - d2Tien;

    // Phân bổ thời gian theo bước workflow
    if (buoc === 'thanh-ly') {
      // Đã thu đủ cả 3 đợt trong quá khứ (T1 -> T7)
      const m1 = Math.max(1, (unitIdx % 4) + 1); // T1-T4
      const m2 = m1 + 2;                          // T3-T6
      const m3 = Math.min(8, m2 + 2);             // T5-T8
      
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 1 — Tạm ứng 30%',
        so_tien: d1Tien,
        ngay_du_kien: `2026-0${m1}-10`,
        ngay_thuc_thu: `2026-0${m1}-12`,
        so_hoa_don: `HD26-${String(++dotCounter).padStart(5, '0')}`,
        ngay_xuat_hoa_don: `2026-0${m1}-10`,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 2 — Nghiệm thu GĐ1 (50%)',
        so_tien: d2Tien,
        ngay_du_kien: `2026-0${m2}-15`,
        ngay_thuc_thu: `2026-0${m2}-18`,
        so_hoa_don: `HD26-${String(++dotCounter).padStart(5, '0')}`,
        ngay_xuat_hoa_don: `2026-0${m2}-15`,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 3 — Quyết toán & Thanh lý (20%)',
        so_tien: d3Tien,
        ngay_du_kien: `2026-0${m3}-20`,
        ngay_thuc_thu: `2026-0${m3}-22`,
        so_hoa_don: `HD26-${String(++dotCounter).padStart(5, '0')}`,
        ngay_xuat_hoa_don: `2026-0${m3}-20`,
      });
    } else if (buoc === 'hoan-thanh') {
      // Đã thu Đợt 1 & Đợt 2 (80%), đợt 3 đang chờ quyết toán (T9-T11)
      const m1 = Math.max(1, (unitIdx % 3) + 1); // T1-T3
      const m2 = m1 + 3;                          // T4-T6
      const m3 = 10;                              // T10
      
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 1 — Tạm ứng 30%',
        so_tien: d1Tien,
        ngay_du_kien: `2026-0${m1}-10`,
        ngay_thuc_thu: `2026-0${m1}-12`,
        so_hoa_don: `HD26-${String(++dotCounter).padStart(5, '0')}`,
        ngay_xuat_hoa_don: `2026-0${m1}-10`,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 2 — Nghiệm thu GĐ1 (50%)',
        so_tien: d2Tien,
        ngay_du_kien: `2026-0${m2}-15`,
        ngay_thuc_thu: `2026-0${m2}-18`,
        so_hoa_don: `HD26-${String(++dotCounter).padStart(5, '0')}`,
        ngay_xuat_hoa_don: `2026-0${m2}-15`,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 3 — Quyết toán thanh lý (20%)',
        so_tien: d3Tien,
        ngay_du_kien: `2026-${m3}-25`,
        ngay_thuc_thu: null, // Chưa thu — công nợ
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
    } else if (buoc === 'dang-thuc-hien') {
      // Đã thu Đợt 1 (30%), Đợt 2 & 3 chưa thu
      const m1 = Math.max(2, (unitIdx % 5) + 2); // T2-T6
      const m2 = Math.min(10, m1 + 3);            // T5-T9
      const m3 = 12;                              // T12
      
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 1 — Tạm ứng thực hiện 30%',
        so_tien: d1Tien,
        ngay_du_kien: `2026-0${m1}-10`,
        ngay_thuc_thu: `2026-0${m1}-15`,
        so_hoa_don: `HD26-${String(++dotCounter).padStart(5, '0')}`,
        ngay_xuat_hoa_don: `2026-0${m1}-10`,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 2 — Nghiệm thu GĐ1 (50%)',
        so_tien: d2Tien,
        ngay_du_kien: m2 < 10 ? `2026-0${m2}-20` : `2026-${m2}-20`,
        ngay_thuc_thu: null,
        so_hoa_don: m2 <= 8 ? `HD26-${String(++dotCounter).padStart(5, '0')}` : null,
        ngay_xuat_hoa_don: m2 <= 8 ? `2026-0${m2}-15` : null, // Xuất hóa đơn mà chưa thu = công nợ VAT
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 3 — Nghiệm thu bàn giao (20%)',
        so_tien: d3Tien,
        ngay_du_kien: `2026-${m3}-30`,
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
    } else if (buoc === 'cho-duyet') {
      // Chưa thu đợt nào, kế hoạch dự kiến quý 3 & quý 4
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 1 — Tạm ứng sau ký HĐ (30%)',
        so_tien: d1Tien,
        ngay_du_kien: '2026-09-15',
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 2 — Báo cáo tiến độ (40%)',
        so_tien: Math.round(giaTri * 0.4),
        ngay_du_kien: '2026-11-20',
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 3 — Nghiệm thu hoàn thành (30%)',
        so_tien: giaTri - d1Tien - Math.round(giaTri * 0.4),
        ngay_du_kien: '2026-12-31',
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
    } else {
      // du-thao: Kế hoạch phân bổ cuối năm 2026 - đầu năm 2027
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 1 — Tạm ứng 30%',
        so_tien: d1Tien,
        ngay_du_kien: '2026-10-15',
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 2 — Nghiệm thu giai đoạn (40%)',
        so_tien: Math.round(giaTri * 0.4),
        ngay_du_kien: '2026-12-15',
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
      dotsToInsert.push({
        hop_dong_id: hd.id,
        ten_dot: 'Đợt 3 — Quyết toán (30%)',
        so_tien: giaTri - d1Tien - Math.round(giaTri * 0.4),
        ngay_du_kien: '2027-02-28',
        ngay_thuc_thu: null,
        so_hoa_don: null,
        ngay_xuat_hoa_don: null,
      });
    }
  });

  // Chèn từng lô 50 bản ghi
  for (let i = 0; i < dotsToInsert.length; i += 50) {
    const chunk = dotsToInsert.slice(i, i + 50);
    const { error: insErr } = await supabase.from('dot_thanh_toan').insert(chunk);
    if (insErr) {
      console.error('❌ Lỗi chèn dot_thanh_toan:', insErr.message);
      return;
    }
  }
  console.log(`✅ Đã chèn ${dotsToInsert.length} đợt thanh toán (đầy đủ T1-T12/2026).`);

  // 3. Seed Đề nghị xuất hóa đơn (de_nghi_xuat_hoa_don)
  console.log('\n--- 2. Tạo Đề nghị xuất hóa đơn (Điều 11.1) ---');
  await supabase.from('de_nghi_xuat_hoa_don').delete().neq('id', 0);

  const { data: allDots } = await supabase.from('dot_thanh_toan').select('id, hop_dong_id, so_tien, so_hoa_don, ngay_xuat_hoa_don, ngay_thuc_thu');
  const deNghiRows = [];

  allDots?.filter(d => d.so_hoa_don).slice(0, 40).forEach(d => {
    deNghiRows.push({
      hop_dong_id: d.hop_dong_id,
      dot_thanh_toan_id: d.id,
      so_tien: d.so_tien,
      ngay_de_nghi: d.ngay_xuat_hoa_don,
      can_cu_nghiem_thu: `BBNT số ${Math.floor(Math.random() * 80 + 10)}/BBNT-GĐ1`,
      trang_thai: d.ngay_thuc_thu ? 'da-xuat' : 'cho-tckt-xuat',
      so_hoa_don: d.so_hoa_don,
      ngay_xuat_hoa_don: d.ngay_xuat_hoa_don,
      ghi_chu: 'Xuất hóa đơn GTGT theo Điều 11.1 QC 2815'
    });
  });

  if (deNghiRows.length > 0) {
    const { error: dnErr } = await supabase.from('de_nghi_xuat_hoa_don').insert(deNghiRows);
    if (dnErr) console.log('⚠️  Lỗi chèn de_nghi_xuat_hoa_don:', dnErr.message);
    else console.log(`✅ Đã tạo ${deNghiRows.length} đề nghị xuất hóa đơn.`);
  }

  // 4. Seed Tờ phân phối quyết toán (to_phan_phoi)
  console.log('\n--- 3. Tạo Tờ phân phối quyết toán hợp đồng (Bảng 1 QC 2815) ---');
  await supabase.from('to_phan_phoi').delete().neq('id', 0);

  const phanPhoiRows = [];
  const completedHds = hopDongs.filter(h => h.buoc_hien_tai === 'thanh-ly' || h.buoc_hien_tai === 'hoan-thanh');

  completedHds.forEach(hd => {
    const giaTri = Number(hd.gia_tri);
    const daThu = hd.buoc_hien_tai === 'thanh-ly' ? giaTri : Math.round(giaTri * 0.8);
    // Tính phân bổ sơ bộ theo nhóm
    const quyChuTri = Math.round(daThu * 0.58);
    const quyDonVi = Math.round(daThu * 0.25);
    const cpql = Math.round(daThu * 0.12);
    const khtscd = daThu - quyChuTri - quyDonVi - cpql;

    phanPhoiRows.push({
      hop_dong_id: hd.id,
      ky: '2026-Q2',
      so_tien_goc: daThu,
      quy_chu_tri: quyChuTri,
      quy_don_vi: quyDonVi,
      cpql_ln_chi_khac: cpql,
      khtscd: khtscd,
      ho_tro_di_lai: 0,
      giam_giao_chu_tri: 0,
      trang_thai: hd.buoc_hien_tai === 'thanh-ly' ? 'da-duyet' : 'cho-duyet',
      ngay_lap: '2026-06-15',
      ngay_duyet: hd.buoc_hien_tai === 'thanh-ly' ? '2026-06-20' : null,
      ghi_chu: `Phân phối thanh quyết toán theo Bảng 1 nhóm ${hd.nhom_hd || '2A'}`
    });
  });

  if (phanPhoiRows.length > 0) {
    const { error: ppErr } = await supabase.from('to_phan_phoi').insert(phanPhoiRows);
    if (ppErr) console.log('⚠️  Lỗi chèn to_phan_phoi:', ppErr.message);
    else console.log(`✅ Đã tạo ${phanPhoiRows.length} tờ phân phối quyết toán.`);
  }

  // 5. Seed Tạm ứng hợp đồng (tam_ung) — Điều 7.7 kèm lãi 130%
  console.log('\n--- 4. Tạo Tạm ứng hợp đồng (tam_ung) ---');
  await supabase.from('tam_ung').delete().neq('id', 0);

  const activeHds = hopDongs.filter(h => h.buoc_hien_tai === 'dang-thuc-hien' || h.buoc_hien_tai === 'hoan-thanh');
  const tamUngRows = [];

  activeHds.slice(0, 12).forEach((hd, i) => {
    const giaTri = Number(hd.gia_tri);
    const soTien = Math.round(giaTri * 0.15); // tạm ứng 15%
    const isQuaHan = (i % 4 === 0);          // 1/4 số khoản bị quá hạn để test cảnh báo
    const isDaHoan = (i % 3 === 0);

    tamUngRows.push({
      hop_dong_id: hd.id,
      nhan_su_id: hd.chu_tri_id || null,
      so_tien: soTien,
      ngay_tam_ung: '2026-03-01',
      han_hoan: isQuaHan ? '2026-06-01' : '2026-11-30', // quá hạn nếu han_hoan < today
      so_tien_da_hoan: isDaHoan ? soTien : 0,
      ngay_hoan: isDaHoan ? '2026-05-20' : null,
      lai_suat_goc: 6.5,
      trang_thai: isDaHoan ? 'da-hoan' : 'dang-no',
      ghi_chu: isQuaHan ? 'Tạm ứng mua sắm vật tư thử nghiệm — quá hạn hoàn (áp lãi 130% Đ.14.2)' : 'Tạm ứng chi phí công tác hiện trường'
    });
  });

  if (tamUngRows.length > 0) {
    const { error: tuErr } = await supabase.from('tam_ung').insert(tamUngRows);
    if (tuErr) console.log('⚠️  Lỗi chèn tam_ung:', tuErr.message);
    else console.log(`✅ Đã tạo ${tamUngRows.length} khoản tạm ứng (gồm khoản trong hạn và quá hạn áp lãi 130%).`);
  }

  // 6. Seed Thưởng / Phạt hợp đồng (hop_dong_thuong_phat)
  console.log('\n--- 5. Tạo Quyết định Thưởng / Phạt Hợp đồng (Điều 13-14 QC 2815) ---');
  await supabase.from('hop_dong_thuong_phat').delete().neq('id', 0);

  const thuongPhatRows = [
    {
      hop_dong_id: hopDongs[0].id,
      loai: 'thuong',
      ly_do: 'Khen thưởng hoàn thành vượt tiến độ 15 ngày công trình trọng điểm Quốc gia (Điều 13)',
      so_tien: 25,
      ty_le_phan_tram: null,
      ngay_quyet_dinh: '2026-05-15',
    },
    {
      hop_dong_id: hopDongs[1].id,
      loai: 'thuong',
      ly_do: 'Khen thưởng thu hồi 100% công nợ khó đòi trước hạn 30 ngày (Điều 13.2)',
      so_tien: 15,
      ty_le_phan_tram: null,
      ngay_quyet_dinh: '2026-06-10',
    },
    {
      hop_dong_id: hopDongs[2].id,
      loai: 'phat',
      ly_do: 'Chế tài phạt nộp chậm hồ sơ HĐKT quá 30 ngày kể từ ngày ký (Điều 14.2 dòng 1)',
      so_tien: Math.round(Number(hopDongs[2].gia_tri) * 0.005),
      ty_le_phan_tram: 0.5,
      ngay_quyet_dinh: '2026-07-01',
    },
    {
      hop_dong_id: hopDongs[3].id,
      loai: 'phat',
      ly_do: 'Chế tài chậm nộp chứng từ quyết toán quá hạn do P.TCKT yêu cầu (Điều 14.2 dòng 2)',
      so_tien: Math.round(Number(hopDongs[3].gia_tri) * 0.005),
      ty_le_phan_tram: 0.5,
      ngay_quyet_dinh: '2026-08-05',
    },
  ];

  const { error: tpErr } = await supabase.from('hop_dong_thuong_phat').insert(thuongPhatRows);
  if (tpErr) console.log('⚠️  Lỗi chèn hop_dong_thuong_phat:', tpErr.message);
  else console.log(`✅ Đã tạo ${thuongPhatRows.length} quyết định thưởng/phạt hợp đồng.`);

  // 7. Seed SLA P.TCKT (sla_theo_doi) — Điều 11.1 (03 ngày làm việc)
  console.log('\n--- 6. Tạo SLA P.TCKT theo dõi giải quyết hồ sơ (Điều 11.1) ---');
  // Xóa các SLA TCKT cũ nếu có
  await supabase.from('sla_theo_doi').delete().ilike('ten_sla', 'TCKT%');

  const slaRows = [];
  const now = new Date();

  hopDongs.forEach((hd, i) => {
    const buoc = hd.buoc_hien_tai;
    if (buoc === 'thanh-ly') {
      // Đã hoàn thành đạt SLA
      slaRows.push({
        loai_doi_tuong: 'hop-dong',
        doi_tuong_id: hd.id,
        ten_sla: 'TCKT giải quyết hồ sơ thanh quyết toán (Đ.11.1 — 03 ngày làm việc)',
        han_chot: '2026-06-25T17:00:00+07:00',
        trang_thai: 'dat',
        ngay_hoan_thanh: '2026-06-24T15:30:00+07:00',
        ghi_chu: 'Giải quyết đúng hạn trong 2 ngày làm việc'
      });
    } else if (buoc === 'hoan-thanh') {
      // Một số đạt, một số đang xử lý
      const isDangChay = (i % 2 === 0);
      const han = new Date();
      han.setDate(han.getDate() + 2); // còn 2 ngày

      slaRows.push({
        loai_doi_tuong: 'hop-dong',
        doi_tuong_id: hd.id,
        ten_sla: 'TCKT giải quyết hồ sơ thanh quyết toán (Đ.11.1 — 03 ngày làm việc)',
        han_chot: isDangChay ? han.toISOString() : '2026-07-20T17:00:00+07:00',
        trang_thai: isDangChay ? 'dang-chay' : 'dat',
        ngay_hoan_thanh: isDangChay ? null : '2026-07-19T10:00:00+07:00',
        ghi_chu: isDangChay ? 'Đang kiểm tra hóa đơn chứng từ gốc' : 'Đã duyệt thanh quyết toán'
      });
    } else if (buoc === 'dang-thuc-hien' && i % 3 === 0) {
      // Một số HĐ đang thực hiện có phát sinh thanh toán: 1 case quá hạn để test cảnh báo
      const isQuaHan = (i % 6 === 0);
      const han = new Date();
      if (isQuaHan) {
        han.setDate(han.getDate() - 1); // quá hạn 1 ngày
      } else {
        han.setDate(han.getDate() + 1); // còn 1 ngày
      }

      slaRows.push({
        loai_doi_tuong: 'hop-dong',
        doi_tuong_id: hd.id,
        ten_sla: 'TCKT giải quyết hồ sơ thanh quyết toán (Đ.11.1 — 03 ngày làm việc)',
        han_chot: han.toISOString(),
        trang_thai: isQuaHan ? 'vi-pham' : 'dang-chay',
        ngay_hoan_thanh: null,
        ghi_chu: isQuaHan ? 'Hồ sơ thiếu biên bản nghiệm thu giai đoạn — đã quá hạn 1 ngày' : 'Đang xử lý đề nghị tạm ứng đợt 2'
      });
    }
  });

  if (slaRows.length > 0) {
    const { error: slaErr } = await supabase.from('sla_theo_doi').insert(slaRows);
    if (slaErr) console.log('⚠️  Lỗi chèn sla_theo_doi:', slaErr.message);
    else console.log(`✅ Đã tạo ${slaRows.length} bản ghi SLA P.TCKT (đạt, đang xử lý, quá hạn).`);
  }

  // 8. Đồng bộ lại da_thanh_toan trên toàn bộ 80 hợp đồng
  console.log('\n--- 7. Đồng bộ da_thanh_toan từ trigger dot_thanh_toan ---');
  const { data: updatedHds } = await supabase
    .from('hop_dong')
    .select('gia_tri, da_thanh_toan');

  const tongKeHoach = updatedHds?.reduce((s, h) => s + Number(h.gia_tri), 0) || 0;
  const tongDaThu = updatedHds?.reduce((s, h) => s + Number(h.da_thanh_toan), 0) || 0;
  console.log(`📊 Tổng Kế hoạch doanh thu: ${(tongKeHoach / 1000).toFixed(2)} tỷ đồng`);
  console.log(`📊 Tổng Thực thu tiền về:   ${(tongDaThu / 1000).toFixed(2)} tỷ đồng`);
  console.log(`📊 Công nợ phải thu:        ${((tongKeHoach - tongDaThu) / 1000).toFixed(2)} tỷ đồng`);

  console.log('\n🎉 HOÀN THÀNH SEED DỮ LIỆU TÀI CHÍNH THU CHI KHỚP 100% VỚI HỢP ĐỒNG!');
}

main().catch(console.error);
