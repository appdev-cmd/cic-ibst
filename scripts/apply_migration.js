// Áp dụng một file migration qua Supabase Management API.
// Không cần mật khẩu CSDL — chỉ cần Personal Access Token.
//
//   export SUPABASE_ACCESS_TOKEN="sbp_..."
//   node scripts/apply_migration.js supabase/migrations/0018_vi_du.sql
//   node scripts/apply_migration.js supabase/migrations/0018_vi_du.sql --dry-run
//
// Xem thêm scripts/README.md về lý do không dùng run_migrations.js nữa.

import fs from 'fs';

const PROJECT_REF = process.env.SUPABASE_PROJECT_REF || 'umvckjqseqawpqamvsbx';
const args = process.argv.slice(2);
const duongDan = args.find((a) => !a.startsWith('--'));
const dryRun = args.includes('--dry-run');

if (!duongDan) {
  console.error('Thiếu đường dẫn file migration.');
  console.error('Ví dụ: node scripts/apply_migration.js supabase/migrations/0018_vi_du.sql');
  process.exit(1);
}
if (!fs.existsSync(duongDan)) {
  console.error(`Không tìm thấy file: ${duongDan}`);
  process.exit(1);
}

const sql = fs.readFileSync(duongDan, 'utf8');

if (dryRun) {
  console.log(`--- DRY RUN: ${duongDan} (không gửi lên CSDL) ---\n`);
  console.log(sql);
  process.exit(0);
}

const token = process.env.SUPABASE_ACCESS_TOKEN;
if (!token) {
  console.error('Thiếu biến môi trường SUPABASE_ACCESS_TOKEN.');
  console.error('Lấy token tại https://supabase.com/dashboard/account/tokens');
  process.exit(1);
}

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: 'POST',
  headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  body: JSON.stringify({ query: sql }),
});

const body = await res.text();
if (!res.ok) {
  console.error(`❌ Lỗi HTTP ${res.status}:`);
  console.error(body);
  process.exit(1);
}

console.log(`✅ Đã áp dụng ${duongDan}`);
if (body && body !== '[]') console.log('Kết quả:', body.slice(0, 1000));
console.log('\nNhắc: hãy kiểm chứng bằng truy vấn thật (bảng/cột/policy) thay vì chỉ tin không báo lỗi.');
