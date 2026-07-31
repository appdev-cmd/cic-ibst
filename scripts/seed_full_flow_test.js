// Script seed bộ dữ liệu mẫu đầy đủ 100% các trường thông tin từ Đăng ký đầu mối -> Đấu thầu -> Hợp đồng -> Phân bổ kinh phí
// Chạy: node scripts/seed_full_flow_test.js

import { createClient } from '@supabase/supabase-js';

const url = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';
const supabase = createClient(url, serviceKey);

const homNay = new Date().toISOString().slice(0, 10);
const namNay = homNay.slice(0, 4);

async function main() {
  console.log('=== SEED BỘ DỮ LIỆU MẪU ĐẦY ĐỦ CÁC TRƯỜNG TEST FULL LUỒNG QC 2815 ===\n');

  // 1. Đăng ký đầu mối
  const tenCoHoi = '[TEST-FULL] Khảo sát & Đánh giá chất lượng đường cất hạ cánh Cảng HKQT Nội Bài GĐ2';
  let { data: dauMoi } = await supabase.from('dang_ky_dau_moi').select('id').eq('ten_co_hoi', tenCoHoi).maybeSingle();
  if (!dauMoi) {
    const res = await supabase.from('dang_ky_dau_moi').insert({
      ten_co_hoi: tenCoHoi,
      mo_ta: 'Dự án trọng điểm do ACV làm CĐT, dự kiến phát hành HSMT tháng 8/2026. Đăng ký đầu mối tránh chồng chéo theo Đ.5.1c QC 2815.',
      don_vi_dang_ky_id: 1, // ĐV Kết cấu
      nguoi_phat_hien_id: 12, // Nguyễn Văn A
      nguoi_dang_ky_id: 1, // Hoàng Văn E
      trang_thai: 'giao-dau-moi',
      ngay_dang_ky: homNay,
      ngay_phan_hoi: homNay,
    }).select('id').single();
    if (res.error) console.error('✗ Lỗi chèn Đăng ký đầu mối:', res.error.message);
    else {
      dauMoi = res.data;
      console.log('✓ 1. Đăng ký đầu mối thành công:', tenCoHoi);
    }
  } else {
    console.log('✓ 1. Đăng ký đầu mối đã có sẵn:', tenCoHoi);
  }

  // 2. Gói thầu
  const tenGoiThau = '[TEST-FULL] Gói thầu TV01: Khảo sát & Kiểm định đường cất hạ cánh Nội Bài GĐ2';
  let { data: goiThau } = await supabase.from('dau_thau').select('id').eq('ten_goi_thau', tenGoiThau).maybeSingle();
  if (!goiThau) {
    const res = await supabase.from('dau_thau').insert({
      ten_goi_thau: tenGoiThau,
      chu_dau_tu_id: 15, // ACV
      don_vi_thuc_hien_id: 1, // ĐV Kết cấu
      hinh_thuc: 'dau-thau-rong-rai',
      gia_du_thau: 4800,
      gia_trung_thau: 4650,
      ngay_mo_thau: homNay,
      ngay_dong_thau: '2026-08-15',
      trang_thai: 'trung-thau',
      nguoi_phu_trach_id: 1, // Hoàng Văn E
      chu_tri_hsdt_id: 12, // Nguyễn Văn A
      hs_nang_luc_chung: true,
      bc_tai_chinh: true,
      ccnn_du_thau: true,
      ghi_chu: 'Đã hoàn thành 3/3 loại hồ sơ năng lực dự thầu, kết quả trúng thầu 4.650 triệu VNĐ',
    }).select('id').single();
    if (res.error) console.error('✗ Lỗi chèn Gói thầu:', res.error.message);
    else {
      goiThau = res.data;
      console.log('✓ 2. Gói thầu trúng thầu thành công:', tenGoiThau);
    }
  } else {
    console.log('✓ 2. Gói thầu đã có sẵn:', tenGoiThau);
  }

  // 3. Hợp đồng kinh tế (Nhóm 2A - 4.650 triệu)
  const soHD = `501/${namNay}/HĐKT-IBST`;
  let { data: hopDong } = await supabase.from('hop_dong').select('id').eq('so_hop_dong', soHD).maybeSingle();
  if (!hopDong) {
    const res = await supabase.from('hop_dong').insert({
      so_hop_dong: soHD,
      ten_hop_dong: '[TEST-FULL] HĐKT Khảo sát & Đánh giá chất lượng đường cất hạ cánh Cảng HKQT Nội Bài GĐ2',
      khach_hang_id: 15, // ACV
      don_vi_id: 1, // ĐV Kết cấu
      gia_tri: 4650, // 4,65 tỷ (trước thuế GTGT)
      da_thanh_toan: 1395, // Tạm ứng 30% = 1.395 tr
      ngay_ky: homNay,
      han_hoan_thanh: `${namNay}-12-31`,
      trang_thai: 'moi',
      nhom_hd: 'N2A',
      chu_tri_id: 12, // Nguyễn Văn A
      cap_ky: 'vien-ky',
      phuc_tap: false,
      trang_thai_phe_duyet: 'da-duyet',
    }).select('id').single();
    if (res.error) console.error('✗ Lỗi chèn Hợp đồng:', res.error.message);
    else {
      hopDong = res.data;
      console.log('✓ 3. Hợp đồng kinh tế ký kết thành công:', soHD);
    }
  } else {
    console.log('✓ 3. Hợp đồng đã có sẵn:', soHD);
  }

  console.log('\n=== HOÀN TẤT SEED DỮ LIỆU TEST FULL ===');
}

main();
