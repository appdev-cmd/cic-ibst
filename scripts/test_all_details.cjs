const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split('\n').forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testAll() {
  const { data: hdList } = await supabase.from('hop_dong').select('id, so_hop_dong').limit(5);
  console.log('Contract IDs:', hdList);

  for (const hd of hdList) {
    const id = hd.id;
    console.log(`\n--- Testing Contract [${id}] ${hd.so_hop_dong} ---`);
    
    // 1. Phieu giao viec
    const pgv = await supabase.from('phieu_giao_viec').select('*').eq('hop_dong_id', id).maybeSingle();
    console.log('phieu_giao_viec error:', pgv.error ? pgv.error.message : 'OK', 'id:', pgv.data?.id);

    // 2. CTV
    if (pgv.data) {
      const ctv = await supabase.from('phieu_giao_viec_ctv').select('id, nhan_su_id, ty_le_phan_chia, ghi_chu, la_ngoai_vien, so_hd_giao_khoan, nhan_su(ho_va_ten)').eq('phieu_giao_viec_id', pgv.data.id);
      console.log('phieu_giao_viec_ctv error:', ctv.error ? ctv.error.message : 'OK', 'count:', ctv.data?.length);
    }

    // 3. Dot thanh toan
    const dtt = await supabase.from('dot_thanh_toan').select('id, ten_dot, so_tien, ngay_du_kien, ngay_thuc_thu').eq('hop_dong_id', id);
    console.log('dot_thanh_toan error:', dtt.error ? dtt.error.message : 'OK', 'count:', dtt.data?.length);

    // 4. Quyet toan giai doan
    const qtgd = await supabase.from('quyet_toan_giai_doan').select('*').eq('hop_dong_id', id);
    console.log('quyet_toan_giai_doan error:', qtgd.error ? qtgd.error.message : 'OK', 'count:', qtgd.data?.length);

    // 5. Lien danh
    const ld = await supabase.from('lien_danh').select('*').eq('hop_dong_id', id);
    console.log('lien_danh error:', ld.error ? ld.error.message : 'OK', 'count:', ld.data?.length);

    // 6. Luu tru ho so
    const lths = await supabase.from('luu_tru_ho_so').select('*').eq('hop_dong_id', id);
    console.log('luu_tru_ho_so error:', lths.error ? lths.error.message : 'OK', 'count:', lths.data?.length);
  }
}

testAll();
