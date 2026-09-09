/**
 * Tạo tài khoản thử nghiệm nhanh cho mỗi đơn vị IBST
 * Chạy: node scripts/seed_test_accounts.cjs
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

// Danh sách tài khoản cần tạo: mỗi đơn vị 1 tài khoản trưởng đơn vị + 1 admin Giám đốc Viện
// Email quy ước: <ma_don_vi.lower>@ibst.vn — mật khẩu: 123456
const ACCOUNTS = [
  // ── Lãnh đạo Viện (Admin) ──
  { email: 'giamdoc@ibst.vn',    ten: 'Giám đốc Viện (Admin)',             donViId: 11, nhanSuId: 1,   icon: '🏛️' },
  // ── 4 Phòng chức năng ──
  { email: 'tonghop@ibst.vn',    ten: 'PGĐ / Phòng Tổng hợp',             donViId: 11, nhanSuId: null, icon: '🏢' },
  { email: 'khkt@ibst.vn',       ten: 'Phòng KHKT',                        donViId: 8,  nhanSuId: 853,  icon: '📋' },
  { email: 'tckt@ibst.vn',       ten: 'Phòng TCKT',                        donViId: 9,  nhanSuId: null, icon: '💰' },
  { email: 'tchc@ibst.vn',       ten: 'Phòng TCHC',                        donViId: 10, nhanSuId: 851,  icon: '📁' },
  // ── 16 Đơn vị chuyên môn & sản xuất ──
  { email: 'kc@ibst.vn',         ten: 'Viện KC (Kết cấu)',                 donViId: 1,  nhanSuId: 863,  icon: '🏗️' },
  { email: 'bt@ibst.vn',         ten: 'Viện BT (Bê tông)',                 donViId: 2,  nhanSuId: 860,  icon: '🧱' },
  { email: 'dkt@ibst.vn',        ten: 'Viện ĐKT (Địa kỹ thuật)',          donViId: 3,  nhanSuId: 867,  icon: '⛏️' },
  { email: 'mn@ibst.vn',         ten: 'Phân viện MN (Miền Nam)',           donViId: 4,  nhanSuId: null, icon: '🌴' },
  { email: 'am@ibst.vn',         ten: 'TT Chống ăn mòn (AM)',             donViId: 5,  nhanSuId: 116,  icon: '🔬' },
  { email: 'td@ibst.vn',         ten: 'TT Thí nghiệm (TD)',               donViId: 6,  nhanSuId: null, icon: '🧪' },
  { email: 'cn@ibst.vn',         ten: 'TT Công nghệ & VL (CN)',           donViId: 7,  nhanSuId: 859,  icon: '⚗️' },
  { email: 'mt@ibst.vn',         ten: 'Phân viện MT (Miền Trung)',         donViId: 12, nhanSuId: 452,  icon: '🌊' },
  { email: 'kct@ibst.vn',        ten: 'TT Kết cấu thép (KCT)',            donViId: 13, nhanSuId: 856,  icon: '🔩' },
  { email: 'tkxd@ibst.vn',       ten: 'TT Thiết kế XD (TKXD)',            donViId: 14, nhanSuId: null, icon: '📐' },
  { email: 'cnxd@ibst.vn',       ten: 'TT Công nghệ XD (CNXD)',           donViId: 15, nhanSuId: null, icon: '🏢' },
  { email: 'cnht@ibst.vn',       ten: 'TT CN Hạ tầng (CNHT)',             donViId: 16, nhanSuId: null, icon: '🛣️' },
  { email: 'tbxd@ibst.vn',       ten: 'TT Thiết bị XD (TBXD)',            donViId: 17, nhanSuId: null, icon: '🔧' },
  { email: 'qt@ibst.vn',         ten: 'TT Dự án QT (QT)',                 donViId: 18, nhanSuId: 729,  icon: '🌐' },
  { email: 'bim@ibst.vn',        ten: 'TT BIM',                           donViId: 19, nhanSuId: 787,  icon: '💻' },
  { email: 'ctcp@ibst.vn',       ten: 'Công ty CP IBST (CTCP)',           donViId: 20, nhanSuId: 874,  icon: '🏭' },
  // ── Tài khoản hiện có (cic@ibst.vn = Trưởng ĐV VKCT) ──
  { email: 'cic@ibst.vn',        ten: 'Trưởng ĐV (IBST.KC)',              donViId: 1,  nhanSuId: 388,  icon: '👤', skip: true },
  { email: 'admin@ibst.vn',      ten: 'Admin hệ thống',                    donViId: 11, nhanSuId: null, icon: '⚙️', skip: true },
];

async function createAccount(acc) {
  if (acc.skip) {
    console.log(`  ⏭  Skip (đã có): ${acc.email}`);
    return null;
  }
  // Kiểm tra đã tồn tại chưa
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 200 });
  const exists = users.find(u => u.email === acc.email);
  if (exists) {
    console.log(`  ✅ Đã tồn tại: ${acc.email} → ${exists.id}`);
    return exists.id;
  }

  const { data, error } = await supabase.auth.admin.createUser({
    email: acc.email,
    password: '123456',
    email_confirm: true,
    user_metadata: {
      ten_hien_thi: acc.ten,
      don_vi_id: acc.donViId,
    }
  });
  if (error) {
    console.error(`  ❌ Lỗi tạo ${acc.email}:`, error.message);
    return null;
  }
  console.log(`  ✅ Tạo xong: ${acc.email} → ${data.user.id}`);
  return data.user.id;
}

async function linkNhanSu(authUid, nhanSuId) {
  // Bảng nhan_su không có cột auth_uid — liên kết qua bảng trung gian hoặc qua email
  // Kiểm tra bảng user_profiles nếu có
  const { data, error } = await supabase.from('user_profiles').select('*').eq('nhan_su_id', nhanSuId).maybeSingle();
  if (!error && data) {
    console.log(`    → user_profiles: nhan_su_id=${nhanSuId} đã liên kết.`);
    return;
  }
  // Thử upsert nếu bảng user_profiles tồn tại
  const { error: upsertErr } = await supabase.from('user_profiles').upsert({
    id: authUid,
    nhan_su_id: nhanSuId,
  });
  if (upsertErr) {
    // Bảng không tồn tại hoặc schema khác — log thôi
    console.log(`    ℹ️  Không upsert user_profiles: ${upsertErr.message}`);
  }
}

async function main() {
  console.log('=== Seed Test Accounts ===\n');
  
  // Kiểm tra bảng user_profiles có tồn tại không
  const { error: chk } = await supabase.from('user_profiles').select('id').limit(1);
  const hasProfileTable = !chk || !chk.message?.includes('does not exist');
  console.log('user_profiles table:', hasProfileTable ? 'TỒN TẠI' : 'KHÔNG tồn tại');
  
  // Lấy danh sách đơn vị để map don_vi_id → fn_don_vi_hien_tai
  // Hàm này dựa trên email trong bảng nhan_su, hoặc email trong user_metadata
  // Thực tế dự án này fn_don_vi_hien_tai() lấy from nhan_su WHERE email = auth.email()
  
  for (const acc of ACCOUNTS) {
    process.stdout.write(`[${acc.email}] `);
    const uid = await createAccount(acc);
    
    if (uid && acc.nhanSuId && hasProfileTable) {
      await linkNhanSu(uid, acc.nhanSuId);
    }
  }

  // Liệt kê kết quả cuối
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 200 });
  console.log('\n=== Tổng kết Auth Users ===');
  users.sort((a, b) => a.email.localeCompare(b.email)).forEach(u => {
    console.log(`  ${u.email} | ${u.id}`);
  });
  console.log(`\nTổng: ${users.length} tài khoản`);
}

main().catch(console.error);
