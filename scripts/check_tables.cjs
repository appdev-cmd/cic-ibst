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
  const testTables = [
    'dau_thau', 'goi_thau', 'nhiem_vu_pvqlnn', 'pvqlnn', 
    'cong_trinh_trong_diem', 'du_an_dau_tu', 'ban_tin', 'tin_tuc', 
    'de_tai', 'hop_dong', 'dot_thanh_toan', 'nhan_su', 'don_vi', 'khach_hang'
  ];
  for (const t of testTables) {
    const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
    if (!error) {
      console.log(`Table '${t}': EXISTS, count = ${count}`);
    } else {
      console.log(`Table '${t}': NOT FOUND (${error.message})`);
    }
  }
})();
