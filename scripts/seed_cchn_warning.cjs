/**
 * Seed dữ liệu mẫu Chứng chỉ Hành nghề Xây dựng sắp hết hạn (trong 90 ngày)
 * phục vụ cảnh báo đôn đốc gia hạn trên Dashboard Lãnh đạo và Module Nhân sự.
 * 
 * Chạy: node scripts/seed_cchn_warning.cjs
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
  console.log('=== SEED DỮ LIỆU CHỨNG CHỈ HÀNH NGHỀ SẮP HẾT HẠN (90 NGÀY) ===\n');

  // 1. Lấy 8 nhân sự thực tế từ bảng nhan_su
  const { data: nhanSus, error: nsErr } = await supabase
    .from('nhan_su')
    .select('id, ho_va_ten, don_vi_id')
    .order('id')
    .limit(10);

  if (nsErr || !nhanSus || nhanSus.length === 0) {
    console.error('❌ Lỗi lấy danh sách nhân sự:', nsErr?.message);
    return;
  }

  console.log(`✅ Tìm thấy ${nhanSus.length} nhân sự để gán CCHN.`);

  // 2. Danh sách 8 chứng chỉ hành nghề thực tế sát mốc 14/09/2026 (trong 90 ngày)
  const cchnSamples = [
    {
      so_chung_chi: 'BXD-00018492',
      ten_linh_vuc_hanh_nghe: 'Giám sát thi công XD công trình Dân dụng - Công nghiệp',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Cục Quản lý hoạt động xây dựng - Bộ Xây dựng',
      ngay_cap: '2021-09-28',
      ngay_het_han: '2026-09-28', // Còn 14 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'BXD-00021943',
      ten_linh_vuc_hanh_nghe: 'Kiểm định chất lượng công trình xây dựng',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Bộ Xây dựng',
      ngay_cap: '2021-10-05',
      ngay_het_han: '2026-10-05', // Còn 21 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'HAN-00034185',
      ten_linh_vuc_hanh_nghe: 'Thiết kế kết cấu công trình dân dụng & công nghiệp',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Sở Xây dựng TP. Hà Nội',
      ngay_cap: '2021-10-18',
      ngay_het_han: '2026-10-18', // Còn 34 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'BXD-00045210',
      ten_linh_vuc_hanh_nghe: 'Khảo sát địa chất công trình & địa chất thủy văn',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Cục Quản lý hoạt động xây dựng - BXD',
      ngay_cap: '2021-11-02',
      ngay_het_han: '2026-11-02', // Còn 49 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'HCM-00019234',
      ten_linh_vuc_hanh_nghe: 'Quản lý dự án đầu tư xây dựng công trình',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Sở Xây dựng TP. Hồ Chí Minh',
      ngay_cap: '2021-11-15',
      ngay_het_han: '2026-11-15', // Còn 62 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'BXD-00051877',
      ten_linh_vuc_hanh_nghe: 'Định giá xây dựng',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Bộ Xây dựng',
      ngay_cap: '2021-11-28',
      ngay_het_han: '2026-11-28', // Còn 75 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'BXD-00062419',
      ten_linh_vuc_hanh_nghe: 'Thí nghiệm chuyên ngành xây dựng (Trưởng PTN LAS-XD)',
      hang_chung_chi: 'Hạng I',
      co_quan_cap: 'Cục Giám định Nhà nước về CLCTXD',
      ngay_cap: '2021-12-05',
      ngay_het_han: '2026-12-05', // Còn 82 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
    {
      so_chung_chi: 'DNA-00028711',
      ten_linh_vuc_hanh_nghe: 'Giám sát công tác lắp đặt thiết bị công trình',
      hang_chung_chi: 'Hạng II',
      co_quan_cap: 'Sở Xây dựng TP. Đà Nẵng',
      ngay_cap: '2021-12-10',
      ngay_het_han: '2026-12-10', // Còn 87 ngày
      trang_thai_hieu_luc: 'con-hieu-luc',
    },
  ];

  for (let i = 0; i < cchnSamples.length; i++) {
    const item = cchnSamples[i];
    const ns = nhanSus[i % nhanSus.length];

    const record = {
      ...item,
      nhan_su_id: ns.id,
    };

    // Kiểm tra đã có số chứng chỉ này chưa
    const { data: existing } = await supabase
      .from('chung_chi_hanh_nghe')
      .select('id')
      .eq('so_chung_chi', item.so_chung_chi)
      .maybeSingle();

    if (existing) {
      const { error: upErr } = await supabase
        .from('chung_chi_hanh_nghe')
        .update(record)
        .eq('id', existing.id);
      if (upErr) console.error(`❌ Lỗi cập nhật ${item.so_chung_chi}:`, upErr.message);
      else console.log(`🔄 Đã cập nhật CCHN ${item.so_chung_chi} cho ${ns.ho_va_ten} (Hết hạn: ${item.ngay_het_han})`);
    } else {
      const { error: inErr } = await supabase
        .from('chung_chi_hanh_nghe')
        .insert(record);
      if (inErr) console.error(`❌ Lỗi thêm mới ${item.so_chung_chi}:`, inErr.message);
      else console.log(`✅ Đã thêm mới CCHN ${item.so_chung_chi} cho ${ns.ho_va_ten} (Hết hạn: ${item.ngay_het_han})`);
    }
  }

  console.log('\n Hoàn tất seed dữ liệu chứng chỉ hành nghề sắp hết hạn!');
}

main().catch(console.error);
