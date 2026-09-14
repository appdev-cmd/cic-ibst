const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach(l => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim();
});
const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

(async () => {
  console.log('--- 1. BẢNG DAU_THAU ---');
  const { data: dtList } = await supabase.from('dau_thau').select('*').limit(5);
  console.log('Mẫu 1 gói thầu:', dtList[0]);
  
  const { data: allDt } = await supabase.from('dau_thau').select('id, trang_thai, gia_du_thau, gia_trung_thau, hinh_thuc');
  const tongGoi = allDt.length;
  const trungThau = allDt.filter(d => ['trung-thau', 'da-trung-thau', 'da-ky-hop-dong'].includes(d.trang_thai) || d.gia_trung_thau != null);
  const tongGiaTrung = trungThau.reduce((acc, d) => acc + Number(d.gia_trung_thau || d.gia_du_thau || 0), 0);
  console.log(`Đấu thầu CSDL thật: Tổng = ${tongGoi}, Trúng = ${trungThau.length}, Tỷ lệ = ${((trungThau.length/tongGoi)*100).toFixed(1)}%, Tổng trúng = ${(tongGiaTrung/1000).toFixed(2)} tỷ`);

  console.log('\n--- 2. BẢNG NHIEM_VU_PVQLNN ---');
  const { data: pvqlnnList } = await supabase.from('nhiem_vu_pvqlnn').select('*').limit(10);
  console.log('Mẫu 3 nhiệm vụ PVQLNN:');
  pvqlnnList.slice(0, 3).forEach(p => console.log(p));
})();
