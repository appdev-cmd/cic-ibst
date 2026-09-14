/**
 * Script tự động khởi tạo tài khoản đăng nhập cho toàn bộ nhân sự Viện IBST (638 cán bộ)
 * Chạy: node scripts/seed_all_user_accounts.cjs
 */
const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim();
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// Chuyển tiếng Việt sang không dấu để tạo email dự phòng nếu không có email
function removeVietnameseTones(str) {
  if (!str) return '';
  str = str.replace(/à|á|ạ|ả|ã|â|ầ|ấ|ậ|ẩ|ẫ|ă|ằ|ắ|ặ|ẳ|ẵ/g, 'a');
  str = str.replace(/è|é|ẹ|ẻ|ẽ|ê|ề|ế|ệ|ể|ễ/g, 'e');
  str = str.replace(/ì|í|ị|ỉ|ĩ/g, 'i');
  str = str.replace(/ò|ó|ọ|ỏ|õ|ô|ồ|ố|ộ|ổ|ỗ|ơ|ờ|ớ|ợ|ở|ỡ/g, 'o');
  str = str.replace(/ù|ú|ụ|ủ|ũ|ư|ừ|ứ|ự|ử|ữ/g, 'u');
  str = str.replace(/ỳ|ý|ỵ|ỷ|ỹ/g, 'y');
  str = str.replace(/đ/g, 'd');
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|Ẳ|Ẵ/g, 'A');
  str = str.replace(/È|É|Ẹ|Ẻ|Ẽ|Ê|Ề|Ế|Ệ|Ể|Ễ/g, 'E');
  str = str.replace(/Ì|Í|Ị|Ỉ|Ĩ/g, 'I');
  str = str.replace(/Ò|Ó|Ọ|Ỏ|Õ|Ô|Ồ|Ố|Ộ|Ổ|Ỗ|Ơ|Ờ|Ớ|Ợ|Ở|Ỡ/g, 'O');
  str = str.replace(/Ù|Ú|Ụ|Ủ|Ũ|Ư|Ừ|Ứ|Ự|Ử|Ữ/g, 'U');
  str = str.replace(/Ỳ|Ý|Ỵ|Ỷ|Ỹ/g, 'Y');
  str = str.replace(/Đ/g, 'D');
  return str;
}

function generateEmail(ns) {
  if (ns.email && ns.email.includes('@')) {
    return ns.email.trim().toLowerCase();
  }
  const cleanName = removeVietnameseTones(ns.ho_va_ten || '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '.');
  return `${cleanName}.${ns.id}@ibst.vn`;
}

function determineRole(ns) {
  const cd = (ns.chuc_danh || '').toLowerCase();
  const donViId = Number(ns.don_vi_id);

  if (donViId === 11) {
    if (cd.includes('viện trưởng') || cd.includes('phó viện trưởng') || cd.includes('lãnh đạo')) {
      return 'lanh-dao';
    }
    return 'lanh-dao';
  }

  if (donViId === 8) return 'phong-khkt';
  if (donViId === 9) return 'phong-tckt';
  if (donViId === 10) {
    if (cd.includes('tổ chức') || cd.includes('tuyển dụng')) return 'can-bo-to-chuc';
    return 'phong-tchc';
  }

  if (cd.includes('trưởng') || cd.includes('giám đốc') || cd.includes('chủ nhiệm') || cd.includes('phó viện trưởng') || cd.includes('phó giám đốc')) {
    return 'truong-don-vi';
  }
  if (cd.includes('kế toán')) {
    return 'phu-trach-ke-toan-dv';
  }

  return 'chuyen-vien';
}

async function main() {
  console.log('🚀 Đang nạp danh sách nhân sự từ CSDL...');
  
  // 1. Lấy toàn bộ 638 nhân sự
  const { data: allNhanSu, error: nsErr } = await supabase
    .from('nhan_su')
    .select('id, ho_va_ten, email, chuc_danh, don_vi_id')
    .order('id');

  if (nsErr || !allNhanSu) {
    console.error('❌ Lỗi lấy nhân sự:', nsErr?.message);
    return;
  }
  console.log(`📋 Tổng số nhân sự trong CSDL: ${allNhanSu.length}`);

  // 2. Lấy toàn bộ người dùng hiện có trong nguoi_dung
  const { data: allNguoiDung } = await supabase.from('nguoi_dung').select('*');
  const nguoiDungMapByNhanSuId = new Map();
  const nguoiDungMapByUserId = new Map();
  (allNguoiDung || []).forEach((nd) => {
    if (nd.nhan_su_id) nguoiDungMapByNhanSuId.set(Number(nd.nhan_su_id), nd);
    if (nd.user_id) nguoiDungMapByUserId.set(nd.user_id, nd);
  });

  // 3. Lấy danh sách auth.users từ Supabase Auth Admin (phân trang)
  let authUsersMap = new Map();
  let page = 1;
  let hasMore = true;
  while (hasMore) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 });
    if (error || !data || !data.users || data.users.length === 0) {
      hasMore = false;
    } else {
      data.users.forEach((u) => authUsersMap.set(u.email.toLowerCase(), u));
      if (data.users.length < 1000) hasMore = false;
      else page++;
    }
  }
  console.log(`🔑 Số tài khoản auth.users hiện tại: ${authUsersMap.size}`);

  let createdCount = 0;
  let linkedCount = 0;
  let skippedCount = 0;
  let errorCount = 0;

  const DEFAULT_PASSWORD = 'Ibst@2026';

  for (let i = 0; i < allNhanSu.length; i++) {
    const ns = allNhanSu[i];
    const email = generateEmail(ns);
    const role = determineRole(ns);
    const existingNd = nguoiDungMapByNhanSuId.get(Number(ns.id));

    if (existingNd) {
      skippedCount++;
      continue;
    }

    let authUser = authUsersMap.get(email);
    let userId = authUser?.id;

    if (!userId) {
      // Tạo mới tài khoản trong Auth
      const { data: newUser, error: createErr } = await supabase.auth.admin.createUser({
        email: email,
        password: DEFAULT_PASSWORD,
        email_confirm: true,
        user_metadata: {
          ten_hien_thi: ns.ho_va_ten,
          nhan_su_id: ns.id,
          don_vi_id: ns.don_vi_id,
        },
      });

      if (createErr) {
        // Thử fallback email nếu email cũ trùng/lỗi format
        const fallbackEmail = `cb.${ns.id}@ibst.vn`;
        const { data: fbUser, error: fbErr } = await supabase.auth.admin.createUser({
          email: fallbackEmail,
          password: DEFAULT_PASSWORD,
          email_confirm: true,
          user_metadata: {
            ten_hien_thi: ns.ho_va_ten,
            nhan_su_id: ns.id,
            don_vi_id: ns.don_vi_id,
          },
        });

        if (fbErr) {
          console.error(`  ❌ [${i + 1}/${allNhanSu.length}] Không thể tạo tài khoản cho ${ns.ho_va_ten} (ID ${ns.id}):`, fbErr.message);
          errorCount++;
          continue;
        } else {
          userId = fbUser.user.id;
          createdCount++;
        }
      } else {
        userId = newUser.user.id;
        createdCount++;
      }
    } else {
      linkedCount++;
    }

    // Upsert vào bảng nguoi_dung
    const { error: ndUpsertErr } = await supabase.from('nguoi_dung').upsert({
      user_id: userId,
      nhan_su_id: ns.id,
      vai_tro: role,
      don_vi_id: ns.don_vi_id,
      trang_thai: 'hoat-dong',
      updated_at: new Date().toISOString(),
    });

    if (ndUpsertErr) {
      console.error(`  ⚠️ Lỗi upsert nguoi_dung cho ${ns.ho_va_ten}:`, ndUpsertErr.message);
    }

    if ((i + 1) % 50 === 0 || i === allNhanSu.length - 1) {
      console.log(`  ⏳ Đã xử lý ${i + 1}/${allNhanSu.length} nhân sự (Đã tạo mới: ${createdCount}, Đã liên kết: ${linkedCount}, Đã có từ trước: ${skippedCount})...`);
    }
  }

  console.log('\n==================================================');
  console.log('🎉 TỔNG KẾT KHỞI TẠO TÀI KHOẢN DÙNG TOÀN VIỆN IBST:');
  console.log(`- Tổng nhân sự trong hệ thống: ${allNhanSu.length}`);
  console.log(`- Số tài khoản tạo mới thành công: ${createdCount}`);
  console.log(`- Số tài khoản đã có & được liên kết: ${linkedCount}`);
  console.log(`- Số tài khoản đã hoạt động từ trước: ${skippedCount}`);
  console.log(`- Số tài khoản lỗi: ${errorCount}`);
  console.log(`- Mật khẩu mặc định toàn hệ thống: ${DEFAULT_PASSWORD}`);
  console.log('==================================================');
}

main().catch(console.error);
