/**
 * scripts/setup_all_quick_accounts.js
 * 
 * Thiết lập đầy đủ tài khoản thử nghiệm cho toàn bộ 20 đơn vị của Viện IBST.
 * Mỗi đơn vị có đủ:
 *   - Cấp Trưởng (Viện trưởng / Giám đốc / Trưởng phòng)
 *   - Cấp Phó (Phó Viện trưởng / Phó Giám đốc / Phó phòng)
 *   - Cấp Chuyên môn / Kỹ sư / Chuyên viên / Kế toán viên
 * 
 * Mật khẩu đăng nhập đồng bộ: 123456
 */

import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const ALL_QUICK_ACCOUNTS = [
  // ── 1. Lãnh đạo Viện (ĐV 11) ──
  { group: 'Lãnh đạo Viện', email: 'nguyenhonghai@ibst.vn', label: 'Nguyễn Hồng Hải — Viện trưởng', role: 'lanh-dao', donViId: 11, nhanSuId: 1 },
  { group: 'Lãnh đạo Viện', email: 'dinhquocdan@ibst.vn', label: 'Đinh Quốc Dân — Phó Viện trưởng', role: 'lanh-dao', donViId: 11, nhanSuId: 2 },
  { group: 'Lãnh đạo Viện', email: 'nguyenthanhbinh@ibst.vn', label: 'Nguyễn Thanh Bình — Phó Viện trưởng', role: 'lanh-dao', donViId: 11, nhanSuId: 3 },
  { group: 'Lãnh đạo Viện', email: 'caoduykhoi@ibst.vn', label: 'Cao Duy Khôi — Phó Viện trưởng', role: 'lanh-dao', donViId: 11, nhanSuId: 4 },
  { group: 'Lãnh đạo Viện', email: 'admin@ibst.vn', label: 'Quản trị hệ thống (Admin)', role: 'quan-tri', donViId: 11, nhanSuId: null },

  // ── 2. Phòng Kế hoạch – Kỹ thuật (KHKT - ĐV 8) ──
  { group: 'Phòng KHKT', email: 'nguyen.thi.thuy.van852@ibst.gov.vn', label: 'Nguyễn Thị Thùy Vân — Trưởng phòng KHKT', role: 'phong-khkt', donViId: 8, nhanSuId: 852 },
  { group: 'Phòng KHKT', email: 'khkt@ibst.vn', label: 'Đỗ Văn Mạnh — Phó trưởng phòng KHKT', role: 'phong-khkt', donViId: 8, nhanSuId: 853 },
  { group: 'Phòng KHKT', email: 'vo.thanh.hung83@ibst.gov.vn', label: 'Võ Thanh Hùng — KS chính KHKT', role: 'phong-khkt', donViId: 8, nhanSuId: 83 },

  // ── 3. Phòng Tài chính – Kế toán (TCKT - ĐV 9) ──
  { group: 'Phòng TCKT', email: 'nguyen.thi.thanh.hoai854@ibst.gov.vn', label: 'Nguyễn Thị Thanh Hoài — Trưởng phòng TCKT', role: 'phong-tckt', donViId: 9, nhanSuId: 854 },
  { group: 'Phòng TCKT', email: 'hoang.thi.minh.tam89@ibst.gov.vn', label: 'Hoàng Thị Minh Tâm — Kế toán trưởng', role: 'phong-tckt', donViId: 9, nhanSuId: 89 },
  { group: 'Phòng TCKT', email: 'nguyen.thi.yen91@ibst.gov.vn', label: 'Nguyễn Thị Yến — Kế toán viên', role: 'phong-tckt', donViId: 9, nhanSuId: 91 },
  { group: 'Phòng TCKT', email: 'le.thi.van.anh92@ibst.gov.vn', label: 'Lê Thị Vân Anh — Chuyên viên TCKT', role: 'phong-tckt', donViId: 9, nhanSuId: 92 },

  // ── 4. Phòng Tổ chức – Hành chính (TCHC - ĐV 10) ──
  { group: 'Phòng TCHC', email: 'tchc@ibst.vn', label: 'Nguyễn Nam Thắng — Trưởng phòng TCHC', role: 'phong-tchc', donViId: 10, nhanSuId: 851 },
  { group: 'Phòng TCHC', email: 'tran.thi.lan65@ibst.gov.vn', label: 'Trần Thị Lan — Phó trưởng phòng TCHC', role: 'phong-tchc', donViId: 10, nhanSuId: 65 },
  { group: 'Phòng TCHC', email: 'bui.thi.huyen62@ibst.gov.vn', label: 'Bùi Thị Huyền — Chuyên viên TCHC', role: 'phong-tchc', donViId: 10, nhanSuId: 62 },

  // ── 5. Viện Chuyên ngành Kết cấu (VKC - ĐV 1) ──
  { group: 'Viện Kết cấu (VKC)', email: 'kc@ibst.vn', label: 'Đỗ Tiến Thịnh — Viện trưởng VKC', role: 'truong-don-vi', donViId: 1, nhanSuId: 863 },
  { group: 'Viện Kết cấu (VKC)', email: 'pham.van.cuong157@ibst.gov.vn', label: 'Phạm Văn Cường — Phó Viện trưởng VKC', role: 'truong-don-vi', donViId: 1, nhanSuId: 157 },
  { group: 'Viện Kết cấu (VKC)', email: 'nguyen.hoang.duong321@ibst.gov.vn', label: 'Nguyễn Hoàng Dương — Trưởng phòng / KS chính', role: 'truong-don-vi', donViId: 1, nhanSuId: 321 },
  { group: 'Viện Kết cấu (VKC)', email: 'pham.trung.thanh101@ibst.gov.vn', label: 'Phạm Trung Thành — Kỹ sư VKC', role: 'chuyen-vien', donViId: 1, nhanSuId: 101 },

  // ── 6. Viện Chuyên ngành Bê tông (VBT - ĐV 2) ──
  { group: 'Viện Bê tông (VBT)', email: 'bt@ibst.vn', label: 'Hoàng Minh Đức — Viện trưởng VBT', role: 'truong-don-vi', donViId: 2, nhanSuId: 860 },
  { group: 'Viện Bê tông (VBT)', email: 'o.thi.lan.hoa861@ibst.gov.vn', label: 'Đỗ Thị Lan Hoa — Phó Viện trưởng VBT', role: 'truong-don-vi', donViId: 2, nhanSuId: 861 },
  { group: 'Viện Bê tông (VBT)', email: 'chu.manh.ha234@ibst.gov.vn', label: 'Chu Mạnh Hà — Kỹ sư / Chuyên viên VBT', role: 'chuyen-vien', donViId: 2, nhanSuId: 234 },

  // ── 7. Viện Chuyên ngành Địa kỹ thuật (VĐKT - ĐV 3) ──
  { group: 'Viện Địa kỹ thuật (VĐKT)', email: 'dkt@ibst.vn', label: 'Đỗ Văn G — Viện trưởng VĐKT', role: 'truong-don-vi', donViId: 3, nhanSuId: 867 },
  { group: 'Viện Địa kỹ thuật (VĐKT)', email: 'tran.toan.thang868@ibst.gov.vn', label: 'Trần Toàn Thắng — Phó Viện trưởng VĐKT', role: 'truong-don-vi', donViId: 3, nhanSuId: 868 },
  { group: 'Viện Địa kỹ thuật (VĐKT)', email: 'bui.ang.luong432@ibst.gov.vn', label: 'Bùi Đăng Lương — Kỹ sư VĐKT', role: 'chuyen-vien', donViId: 3, nhanSuId: 432 },

  // ── 8. Phân Viện KHCN Xây dựng miền Nam (PVMN - ĐV 4) ──
  { group: 'Phân viện Miền Nam (PVMN)', email: 'mn@ibst.vn', label: 'Uông Hồng Sơn — Giám đốc Phân viện MN', role: 'truong-don-vi', donViId: 4, nhanSuId: 494 },
  { group: 'Phân viện Miền Nam (PVMN)', email: 'nguyen.viet.tuan495@ibst.gov.vn', label: 'Nguyễn Việt Tuấn — Phó Giám đốc PVMN', role: 'truong-don-vi', donViId: 4, nhanSuId: 495 },
  { group: 'Phân viện Miền Nam (PVMN)', email: 'o.thanh.ba510@ibst.gov.vn', label: 'Đỗ Thanh Ba — Kỹ sư / Chuyên viên PVMN', role: 'chuyen-vien', donViId: 4, nhanSuId: 510 },

  // ── 9. TT Tư vấn chống ăn mòn và XD (TTAM - ĐV 5) ──
  { group: 'TT Chống ăn mòn (TTAM)', email: 'am@ibst.vn', label: 'Nguyễn Đăng Khoa — Giám đốc TTAM', role: 'truong-don-vi', donViId: 5, nhanSuId: 116 },
  { group: 'TT Chống ăn mòn (TTAM)', email: 'tran.van.tiem117@ibst.gov.vn', label: 'Trần Văn Tiểm — Phó Giám đốc TTAM', role: 'truong-don-vi', donViId: 5, nhanSuId: 117 },
  { group: 'TT Chống ăn mòn (TTAM)', email: 'nguyen.xuan.toan126@ibst.gov.vn', label: 'Nguyễn Xuân Toàn — Kỹ sư TTAM', role: 'chuyen-vien', donViId: 5, nhanSuId: 126 },

  // ── 10. TT Tư vấn trắc địa và XD (TTTD - ĐV 6) ──
  { group: 'TT Trắc địa (TTTD)', email: 'td@ibst.vn', label: 'Ngô Xuân Thế — Giám đốc TTTD', role: 'truong-don-vi', donViId: 6, nhanSuId: 572 },
  { group: 'TT Trắc địa (TTTD)', email: 'nguyen.xuan.long571@ibst.gov.vn', label: 'Nguyễn Xuân Long — Phó Giám đốc TTTD', role: 'truong-don-vi', donViId: 6, nhanSuId: 571 },
  { group: 'TT Trắc địa (TTTD)', email: 'nguyen.cong.kien579@ibst.gov.vn', label: 'Nguyễn Công Kiên — Kỹ sư TTTD', role: 'chuyen-vien', donViId: 6, nhanSuId: 579 },

  // ── 11. TT Phát triển công nghệ và VLXD (TTCN - ĐV 7) ──
  { group: 'TT Công nghệ & VLXD (TTCN)', email: 'cn@ibst.vn', label: 'Nguyễn Thanh Hằng — Giám đốc TTCN', role: 'truong-don-vi', donViId: 7, nhanSuId: 859 },
  { group: 'TT Công nghệ & VLXD (TTCN)', email: 'truong.thi.hong.thuy217@ibst.gov.vn', label: 'Trương Thị Hồng Thúy — Phó Giám đốc TTCN', role: 'truong-don-vi', donViId: 7, nhanSuId: 217 },
  { group: 'TT Công nghệ & VLXD (TTCN)', email: 'ngo.tien.thanh221@ibst.gov.vn', label: 'Ngô Tiến Thành — Kỹ sư TTCN', role: 'chuyen-vien', donViId: 7, nhanSuId: 221 },

  // ── 12. Phân Viện KHCN Xây dựng miền Trung (PVMT - ĐV 12) ──
  { group: 'Phân viện Miền Trung (PVMT)', email: 'mt@ibst.vn', label: 'Nguyễn Tiến Bình — Giám đốc Phân viện MT', role: 'truong-don-vi', donViId: 12, nhanSuId: 446 },
  { group: 'Phân viện Miền Trung (PVMT)', email: 'mai.xuan.hien447@ibst.gov.vn', label: 'Mai Xuân Hiển — Phó Giám đốc PVMT', role: 'truong-don-vi', donViId: 12, nhanSuId: 447 },
  { group: 'Phân viện Miền Trung (PVMT)', email: 'vu.viet.phuong448@ibst.gov.vn', label: 'Vũ Việt Phương — Kỹ sư PVMT', role: 'chuyen-vien', donViId: 12, nhanSuId: 448 },

  // ── 13. TT Kết cấu thép và XD (TTKCT - ĐV 13) ──
  { group: 'TT Kết cấu thép (TTKCT)', email: 'kct@ibst.vn', label: 'Vũ Thành Trung — Giám đốc TTKCT', role: 'truong-don-vi', donViId: 13, nhanSuId: 856 },
  { group: 'TT Kết cấu thép (TTKCT)', email: 'o.duy.liem857@ibst.gov.vn', label: 'Đỗ Duy Liêm — Phó Giám đốc TTKCT', role: 'truong-don-vi', donViId: 13, nhanSuId: 857 },
  { group: 'TT Kết cấu thép (TTKCT)', email: 'nguyen.ngoc.huy103@ibst.gov.vn', label: 'Nguyễn Ngọc Huy — Kỹ sư TTKCT', role: 'chuyen-vien', donViId: 13, nhanSuId: 103 },

  // ── 14. TT Tư vấn thiết kế và XD (TTTK - ĐV 14) ──
  { group: 'TT Tư vấn Thiết kế (TTTK)', email: 'tkxd@ibst.vn', label: 'Nguyễn Huyên — Giám đốc TTTK', role: 'truong-don-vi', donViId: 14, nhanSuId: 630 },
  { group: 'TT Tư vấn Thiết kế (TTTK)', email: 'cao.duy.bach631@ibst.gov.vn', label: 'Cao Duy Bách — Phó Giám đốc TTTK', role: 'truong-don-vi', donViId: 14, nhanSuId: 631 },
  { group: 'TT Tư vấn Thiết kế (TTTK)', email: 'nguyen.thanh.van641@ibst.gov.vn', label: 'Nguyễn Thanh Vân — Chuyên viên TTTK', role: 'chuyen-vien', donViId: 14, nhanSuId: 641 },

  // ── 15. TT Công nghệ xây dựng (TTCNXD - ĐV 15) ──
  { group: 'TT Công nghệ XD (TTCNXD)', email: 'cnxd@ibst.vn', label: 'Ninh Ngọc Doanh — Giám đốc TTCNXD', role: 'truong-don-vi', donViId: 15, nhanSuId: 663 },
  { group: 'TT Công nghệ XD (TTCNXD)', email: 'la.manh.cuong665@ibst.gov.vn', label: 'Lã Mạnh Cường — Phó Giám đốc TTCNXD', role: 'truong-don-vi', donViId: 15, nhanSuId: 665 },
  { group: 'TT Công nghệ XD (TTCNXD)', email: 'nguyen.ngoc.thanh664@ibst.gov.vn', label: 'Nguyễn Ngọc Thanh — Kỹ sư TTCNXD', role: 'chuyen-vien', donViId: 15, nhanSuId: 664 },

  // ── 16. TT Tư vấn XD công nghiệp và hạ tầng (TTCNHT - ĐV 16) ──
  { group: 'TT XD Công nghiệp & HT (TTCNHT)', email: 'cnht@ibst.vn', label: 'Ngô Hoàng Quân — Giám đốc TTCNHT', role: 'truong-don-vi', donViId: 16, nhanSuId: 598 },
  { group: 'TT XD Công nghiệp & HT (TTCNHT)', email: 'nguyen.inh.dinh599@ibst.gov.vn', label: 'Nguyễn Đình Dinh — Phó Giám đốc TTCNHT', role: 'truong-don-vi', donViId: 16, nhanSuId: 599 },
  { group: 'TT XD Công nghiệp & HT (TTCNHT)', email: 'cao.inh.hai607@ibst.gov.vn', label: 'Cao Đình Hải — Kỹ sư TTCNHT', role: 'chuyen-vien', donViId: 16, nhanSuId: 607 },

  // ── 17. TT Tư vấn thiết bị và XD (TTTB - ĐV 17) ──
  { group: 'TT Thiết bị (TTTB)', email: 'tbxd@ibst.vn', label: 'Hoàng Mạnh — Giám đốc TTTB', role: 'truong-don-vi', donViId: 17, nhanSuId: 156 },
  { group: 'TT Thiết bị (TTTB)', email: 'pham.van.cuong157@ibst.gov.vn', label: 'Phạm Văn Cường — Phó Giám đốc TTTB', role: 'truong-don-vi', donViId: 17, nhanSuId: 157 },
  { group: 'TT Thiết bị (TTTB)', email: 'duong.thi.nga194@ibst.gov.vn', label: 'Dương Thị Nga — Kế toán viên TTTB', role: 'chuyen-vien', donViId: 17, nhanSuId: 194 },

  // ── 18. TT Các Dự án quốc tế và XD (TTDAQT - ĐV 18) ──
  { group: 'TT Các Dự án Quốc tế (TTDAQT)', email: 'qt@ibst.vn', label: 'Nguyễn Công Nghĩa — Giám đốc TTDAQT', role: 'truong-don-vi', donViId: 18, nhanSuId: 729 },
  { group: 'TT Các Dự án Quốc tế (TTDAQT)', email: 'tran.hung730@ibst.gov.vn', label: 'Trần Hùng — Phó Giám đốc TTDAQT', role: 'truong-don-vi', donViId: 18, nhanSuId: 730 },
  { group: 'TT Các Dự án Quốc tế (TTDAQT)', email: 'nguyen.huu.quyen731@ibst.gov.vn', label: 'Nguyễn Hửu Quyền — Kỹ sư TTDAQT', role: 'chuyen-vien', donViId: 18, nhanSuId: 731 },

  // ── 19. TT Tư vấn và Ứng dụng BIM trong XD (TTBIM - ĐV 19) ──
  { group: 'TT Tư vấn & Ứng dụng BIM (TTBIM)', email: 'bim@ibst.vn', label: 'Vũ Đức Thịnh — Giám đốc TTBIM', role: 'truong-don-vi', donViId: 19, nhanSuId: 787 },
  { group: 'TT Tư vấn & Ứng dụng BIM (TTBIM)', email: 'nguyen.anh.tuan784@ibst.gov.vn', label: 'Nguyễn Anh Tuấn — Phó Giám đốc TTBIM', role: 'truong-don-vi', donViId: 19, nhanSuId: 784 },
  { group: 'TT Tư vấn & Ứng dụng BIM (TTBIM)', email: 'nguyen.ba.kien788@ibst.gov.vn', label: 'Nguyễn Bá Kiên — Kỹ sư TTBIM', role: 'chuyen-vien', donViId: 19, nhanSuId: 788 },

  // ── 20. Công ty CP Đầu tư & CNXD IBST (CTCP - ĐV 20) ──
  { group: 'Công ty CP IBST (CTCP)', email: 'ctcp@ibst.vn', label: 'Nguyễn Tiến Thành — Giám đốc CTCP', role: 'truong-don-vi', donViId: 20, nhanSuId: 874 },
  { group: 'Công ty CP IBST (CTCP)', email: 'huy.tq@ibst.vn', label: 'Trần Quang Huy — Phó Giám đốc CTCP', role: 'truong-don-vi', donViId: 20, nhanSuId: 875 },
  { group: 'Công ty CP IBST (CTCP)', email: 'nam.lh@ibst.vn', label: 'Lê Hoàng Nam — Chỉ huy trưởng / Chuyên viên', role: 'chuyen-vien', donViId: 20, nhanSuId: 876 },
];

async function main() {
  console.log('=== KHỞI TẠO & ĐỒNG BỘ MẬT KHẨU CHO CÁC TÀI KHOẢN NHANH ===\n');
  console.log(`Tổng số tài khoản cấu hình: ${ALL_QUICK_ACCOUNTS.length}`);

  const { data: { users }, error: uErr } = await supabase.auth.admin.listUsers({ perPage: 1000 });
  if (uErr) {
    console.error('Lỗi lấy users:', uErr);
    return;
  }

  const userByEmail = new Map();
  users.forEach((u) => userByEmail.set(u.email.toLowerCase(), u));

  let created = 0;
  let updated = 0;

  for (const acc of ALL_QUICK_ACCOUNTS) {
    const emailKey = acc.email.toLowerCase();
    let user = userByEmail.get(emailKey);

    if (!user) {
      // Tạo mới trong auth.users
      const { data: neu, error: cErr } = await supabase.auth.admin.createUser({
        email: acc.email,
        password: '123456',
        email_confirm: true,
        user_metadata: { full_name: acc.label.split('—')[0].trim() },
      });
      if (cErr) {
        console.error(`  ✗ Lỗi tạo auth user ${acc.email}:`, cErr.message);
        continue;
      }
      user = neu.user;
      userByEmail.set(emailKey, user);
      created++;
      console.log(`  + Đã tạo mới auth user: ${acc.email}`);
    } else {
      // Đặt lại password về 123456
      const { error: upErr } = await supabase.auth.admin.updateUserById(user.id, {
        password: '123456',
      });
      if (upErr) {
        console.error(`  ✗ Lỗi reset password ${acc.email}:`, upErr.message);
      } else {
        updated++;
      }
    }

    // Upsert bảng nguoi_dung
    const { error: ndErr } = await supabase.from('nguoi_dung').upsert(
      {
        user_id: user.id,
        nhan_su_id: acc.nhanSuId,
        vai_tro: acc.role,
        don_vi_id: acc.donViId,
        trang_thai: 'hoat-dong',
      },
      { onConflict: 'user_id' }
    );
    if (ndErr) {
      console.error(`  ✗ Lỗi cập nhật nguoi_dung cho ${acc.email}:`, ndErr.message);
    }
  }

  console.log(`\n🎉 Hoàn thành: Tạo mới ${created}, Reset password ${updated}`);

  // Test đăng nhập ngẫu nhiên một số tài khoản đại diện
  console.log('\n--- KIỂM TRA ĐĂNG NHẬP TEST VỚI MẬT KHẨU 123456 ---');
  const anonClient = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);
  const testSamples = [
    'nguyenhonghai@ibst.vn',
    'khkt@ibst.vn',
    'tchc@ibst.vn',
    'kc@ibst.vn',
    'dkt@ibst.vn',
    'mn@ibst.vn',
    'am@ibst.vn',
    'td@ibst.vn',
    'cn@ibst.vn',
    'mt@ibst.vn',
    'kct@ibst.vn',
    'tkxd@ibst.vn',
    'cnxd@ibst.vn',
    'cnht@ibst.vn',
    'tbxd@ibst.vn',
    'qt@ibst.vn',
    'bim@ibst.vn',
    'ctcp@ibst.vn',
  ];

  for (const email of testSamples) {
    const { data, error } = await anonClient.auth.signInWithPassword({ email, password: '123456' });
    if (error) {
      console.log(`  ✗ ${email}: THẤT BẠI - ${error.message}`);
    } else {
      console.log(`  ✓ ${email}: ĐĂNG NHẬP THÀNH CÔNG!`);
    }
  }
}

main().catch(console.error);
