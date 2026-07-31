const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testFetch() {
  console.log('Testing fetchPhieuGiaoViec...');

  const res = await supabase
    .from('phieu_giao_viec')
    .select(
      'id, hop_dong_id, chu_tri_ky_thuat_id, kinh_phi_giao, noi_dung, ngay_giao, ngay_duyet, trang_thai, ly_do_tra_lai, chu_tri_ky_thuat:nhan_su!phieu_giao_viec_chu_tri_ky_thuat_id_fkey(ho_va_ten), nguoi_soan:nhan_su!phieu_giao_viec_nguoi_soan_id_fkey(ho_va_ten), nguoi_don_vi_xac_nhan:nhan_su!phieu_giao_viec_nguoi_don_vi_xac_nhan_id_fkey(ho_va_ten), nguoi_khkt_tham_tra:nhan_su!phieu_giao_viec_nguoi_khkt_tham_tra_id_fkey(ho_va_ten), nguoi_duyet:nhan_su!phieu_giao_viec_nguoi_duyet_id_fkey(ho_va_ten)'
    )
    .eq('hop_dong_id', 59)
    .maybeSingle();

  console.log('Result error:', res.error);
  console.log('Result data:', res.data);
}

testFetch();
