import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';

const supabase = createClient(supabaseUrl, serviceKey);

const candidateTables = [
  'dang_ky_dau_moi',
  'dau_thau',
  'hop_dong',
  'phieu_giao_viec',
  'uy_quyen',
  'luu_tru_ho_so',
  'workflow_trang_thai',
  'lich_su_phe_duyet',
  'lich_su',
  'nhat_ky',
  'nhat_ky_he_thong',
  'audit_log',
  'nguoi_dung',
  'nhan_su',
  'don_vi',
  'khach_hang',
];

async function main() {
  console.log('=== CHECKING EXISTING TABLES ===');
  for (const t of candidateTables) {
    const { data, error } = await supabase.from(t).select('id').limit(1);
    if (!error) {
      console.log(`✅ Table '${t}' EXISTS!`);
    } else {
      console.log(`❌ Table '${t}' does NOT exist (${error.message})`);
    }
  }
}

main();
