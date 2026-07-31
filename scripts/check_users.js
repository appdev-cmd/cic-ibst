import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';

const supabase = createClient(supabaseUrl, serviceKey);

async function main() {
  console.log('=== CHECKING SUPABASE AUTH USERS ===');
  const { data: { users }, error } = await supabase.auth.admin.listUsers();
  if (error) {
    console.error('Error listing users:', error);
    return;
  }
  console.log(`Found ${users.length} users in Auth:`);
  for (const u of users) {
    console.log(`- Email: ${u.email} | ID: ${u.id} | Meta:`, u.user_metadata);
  }

  console.log('\n=== CHECKING NGUOI_DUNG TABLE ===');
  const { data: ndList, error: ndErr } = await supabase
    .from('nguoi_dung')
    .select('user_id, vai_tro, trang_thai, nhan_su(id, ho_va_ten), don_vi(id, ten_don_vi)');
  if (ndErr) {
    console.error('Error listing nguoi_dung:', ndErr);
    return;
  }
  console.log(JSON.stringify(ndList, null, 2));
}

main();
