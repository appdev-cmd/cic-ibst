import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';

const supabase = createClient(supabaseUrl, serviceKey);

const accounts = [
  { email: 'admin@ibst.vn', pass: '123456', role: 'quan-tri', name: 'Quản trị hệ thống IBST', donViId: null },
  { email: 'cic@ibst.vn', pass: '123456', role: 'truong-don-vi', name: 'Hoàng Văn E (Trưởng ĐV)', donViId: 1 },
  { email: 'khkt@ibst.vn', pass: '123456', role: 'phong-khkt', name: 'Phạm Kế Hoạch (P.KHKT)', donViId: 8 },
  { email: 'tckt@ibst.vn', pass: '123456', role: 'phong-tckt', name: 'Lê Tài Chính (P.TCKT)', donViId: 9 },
  { email: 'tonghop@ibst.vn', pass: '123456', role: 'phong-th-don-vi', name: 'Nguyễn Thị Tổng hợp (P.Tổng hợp ĐV)', donViId: 1 },
];

async function main() {
  console.log('=== SETTING UP DEMO ACCOUNTS ===');
  
  const { data: { users }, error: listErr } = await supabase.auth.admin.listUsers();
  if (listErr) {
    console.error('List users failed:', listErr);
    return;
  }

  for (const acc of accounts) {
    let user = users.find((u) => u.email === acc.email);
    if (!user) {
      console.log(`Creating Auth user ${acc.email}...`);
      const { data: created, error: createErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: acc.pass,
        email_confirm: true,
        user_metadata: { full_name: acc.name },
      });
      if (createErr) {
        console.error(`Failed to create ${acc.email}:`, createErr.message);
        continue;
      }
      user = created.user;
    } else {
      console.log(`Updating password for ${acc.email}...`);
      await supabase.auth.admin.updateUserById(user.id, {
        password: acc.pass,
        user_metadata: { full_name: acc.name },
      });
    }

    // Upsert into nguoi_dung table
    console.log(`Upserting nguoi_dung record for ${acc.email} (role: ${acc.role})...`);
    const { error: ndErr } = await supabase.from('nguoi_dung').upsert(
      {
        user_id: user.id,
        vai_tro: acc.role,
        don_vi_id: acc.donViId,
        trang_thai: 'hoat-dong',
      },
      { onConflict: 'user_id' }
    );
    if (ndErr) console.error(`Error updating nguoi_dung for ${acc.email}:`, ndErr.message);
    else console.log(`✅ Success for ${acc.email}`);
  }

  console.log('\n=== COMPLETED ACCOUNT SETUP ===');
}

main();
