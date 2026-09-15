/**
 * scripts/sync_nhan_su_bang_luong_t9.js
 * 
 * Script đồng bộ hóa toàn diện dữ liệu nhân sự giữa:
 *   - File Excel: docs/Bang luong T9-2026 gui Cuong.xlsx (đã trích xuất ra scratch/excel_nhan_su_clean.json)
 *   - Bảng nhan_su trong CSDL Supabase
 * 
 * Các bước:
 *   1. Sửa lỗi chính tả / Font TCVN3 cũ (ký tự Ü -> ĩ, v.v.)
 *   2. Thêm 9 cán bộ còn thiếu vào đúng đơn vị với đầy đủ chức danh, HSL, phụ cấp
 *   3. Cập nhật chính xác he_so_luong, phu_cap_chuc_vu, phu_cap_vuot_khung, phu_cap_trach_nhiem cho toàn bộ 644 cán bộ
 *   4. Tạo tài khoản người dùng cho 9 cán bộ mới
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
  return str.trim();
}

const norm = (s) => removeVietnameseTones(s || '').toLowerCase().replace(/[^a-z0-9]/g, '');

async function main() {
  console.log('=== BẮT ĐẦU ĐỒNG BỘ NHÂN SỰ THEO BẢNG LƯƠNG THÁNG 9/2026 ===\n');

  // Đọc danh sách 644 nhân sự từ file JSON đã parse chuẩn
  const jsonPath = 'C:\\Users\\Personal\\.gemini\\antigravity\\brain\\a7797cb9-2bf8-46db-ae77-78c6460dffb6\\scratch\\excel_nhan_su_clean.json';
  const excelData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  console.log(`Đã nạp ${excelData.length} nhân sự từ Bảng lương T9-2026.`);

  // 1. Sửa lỗi chính tả / Font TCVN3 (ký tự Ü -> ĩ)
  console.log('\n--- BƯỚC 1: SỬA LỖI CHÍNH TẢ & FONT TCVN3 ---');
  const TYPO_FIXES = [
    { id: 104, ho_va_ten: 'Tống Sĩ Biển' },
    { id: 297, ho_va_ten: 'Phạm Văn Lĩnh' },
    { id: 305, ho_va_ten: 'Lò Anh Quyền' },
    { id: 455, ho_va_ten: 'Lê Sĩ Quý' },
    { id: 476, ho_va_ten: 'Bùi Viết Vĩnh' },
    { id: 500, ho_va_ten: 'Nguyễn Tiến Nghĩa' },
    { id: 587, ho_va_ten: 'Nguyễn Văn Nghĩa' },
    { id: 729, ho_va_ten: 'Nguyễn Công Nghĩa' },
    { id: 731, ho_va_ten: 'Nguyễn Hửu Quyền' },
  ];

  for (const f of TYPO_FIXES) {
    const { error } = await supabase.from('nhan_su').update({ ho_va_ten: f.ho_va_ten }).eq('id', f.id);
    if (error) console.error(`  ✗ Lỗi sửa ID ${f.id}:`, error.message);
    else console.log(`  ✓ Đã chuẩn hóa họ tên ID ${f.id} -> ${f.ho_va_ten}`);
  }

  // Cập nhật lại bản ghi ID 65 (Trần Thị Lan - Phó TP ở TCHC)
  await supabase.from('nhan_su').update({
    chuc_danh: 'Phó trưởng phòng - CV chính',
    he_so_luong: 6.1,
    phu_cap_chuc_vu: 0.4,
    phu_cap_vuot_khung: 0,
    phu_cap_trach_nhiem: 0,
  }).eq('id', 65);
  console.log('  ✓ Đã cập nhật đúng chức vụ STT 6 Trần Thị Lan (ID 65, Phó trưởng phòng)');

  // 2. Thêm mới 9 cán bộ còn thiếu
  console.log('\n--- BƯỚC 2: BỔ SUNG 9 CÁN BỘ CÒN THIẾU ---');
  const NEW_EMPLOYEES = [
    {
      stt: 11,
      ma_dinh_danh: 'NS-TCHC-20',
      ho_va_ten: 'Trần Thị Lan',
      chuc_danh: 'NV bảo vệ',
      don_vi_id: 10,
      he_so_luong: 3.12,
      phu_cap_chuc_vu: 0,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0.1,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 198,
      ma_dinh_danh: 'NS-KC-61',
      ho_va_ten: 'Nguyễn Trung Kiên',
      chuc_danh: 'Trưởng phòng - KS',
      don_vi_id: 1,
      he_so_luong: 4.32,
      phu_cap_chuc_vu: 0.25,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 208,
      ma_dinh_danh: 'NS-KC-62',
      ho_va_ten: 'Nguyễn Tuấn Anh',
      chuc_danh: 'Phó trưởng phòng - KS chính',
      don_vi_id: 1,
      he_so_luong: 5.08,
      phu_cap_chuc_vu: 0.4,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 185,
      ma_dinh_danh: 'NS-BT-45',
      ho_va_ten: 'Nguyễn Mạnh Cường',
      chuc_danh: 'KS',
      don_vi_id: 2,
      he_so_luong: 2.34,
      phu_cap_chuc_vu: 0,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 335,
      ma_dinh_danh: 'NS-MN-55',
      ho_va_ten: 'Nguyễn Thanh Bình',
      chuc_danh: 'Phó  TP - KS chính',
      don_vi_id: 4,
      he_so_luong: 6.1,
      phu_cap_chuc_vu: 0.3,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 67,
      ma_dinh_danh: 'NS-AM-40',
      ho_va_ten: 'Phạm Anh Tuấn',
      chuc_danh: 'Trưởng phòng - KS',
      don_vi_id: 5,
      he_so_luong: 3.99,
      phu_cap_chuc_vu: 0.2,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 384,
      ma_dinh_danh: 'NS-TD-30',
      ho_va_ten: 'Phạm Văn Hùng',
      chuc_danh: 'Trưởng phòng - KS',
      don_vi_id: 6,
      he_so_luong: 3.66,
      phu_cap_chuc_vu: 0.25,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 389,
      ma_dinh_danh: 'NS-TD-31',
      ho_va_ten: 'Nguyễn Thị Kim Anh',
      chuc_danh: 'Kế toán viên',
      don_vi_id: 6,
      he_so_luong: 4.65,
      phu_cap_chuc_vu: 0,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
    {
      stt: 460,
      ma_dinh_danh: 'NS-TKXD-34',
      ho_va_ten: 'Nguyễn Thành Trung',
      chuc_danh: 'KS',
      don_vi_id: 14,
      he_so_luong: 3.99,
      phu_cap_chuc_vu: 0,
      phu_cap_vuot_khung: 0,
      phu_cap_trach_nhiem: 0,
      trang_thai: 'dang-lam-viec',
    },
  ];

  const addedIds = [];

  for (const emp of NEW_EMPLOYEES) {
    // Kiểm tra xem đã có bản ghi có ma_dinh_danh này chưa
    const { data: daCo } = await supabase.from('nhan_su').select('id').eq('ma_dinh_danh', emp.ma_dinh_danh).maybeSingle();
    if (!daCo) {
      const { stt, ...payload } = emp;
      const { data: inserted, error } = await supabase.from('nhan_su').insert(payload).select().single();
      if (error) {
        console.error(`  ✗ Lỗi thêm ${emp.ho_va_ten} (${emp.ma_dinh_danh}):`, error.message);
      } else {
        console.log(`  + Đã thêm thành công: ${emp.ho_va_ten} (ID: ${inserted.id}, Mã: ${emp.ma_dinh_danh}, ĐV: ${emp.don_vi_id})`);
        addedIds.push(inserted.id);
      }
    } else {
      console.log(`  * Đã tồn tại mã ${emp.ma_dinh_danh} (ID ${daCo.id}), cập nhật thông tin.`);
      const { stt, ...payload } = emp;
      await supabase.from('nhan_su').update(payload).eq('id', daCo.id);
      addedIds.push(daCo.id);
    }
  }

  // 3. Cập nhật hệ số lương, phụ cấp chức vụ, phụ cấp vượt khung, trách nhiệm cho 644 nhân sự
  console.log('\n--- BƯỚC 3: ĐỒNG BỘ HỆ SỐ LƯƠNG & PHỤ CẤP CHO TOÀN BỘ 644 CÁN BỘ ---');

  // Lấy toàn bộ nhân sự mới nhất từ DB
  const { data: allDB } = await supabase.from('nhan_su').select('id, ma_dinh_danh, ho_va_ten, don_vi_id, chuc_danh, he_so_luong, phu_cap_chuc_vu').order('id');
  console.log(`Tổng số nhân sự hiện có trong DB: ${allDB.length}`);

  let updateCount = 0;
  let matchCount = 0;
  const usedDbIds = new Set();

  // Nhóm theo đơn vị để đối chiếu chuẩn xác nhất
  for (let dvId = 1; dvId <= 19; dvId++) {
    const exInDv = excelData.filter((e) => e.don_vi_id === dvId);
    const dbInDv = allDB.filter((d) => d.don_vi_id === dvId);

    for (const ex of exInDv) {
      const exNorm = norm(ex.ho_va_ten);
      // Tìm trong DB cùng đơn vị chưa được dùng
      let candidate = dbInDv.find((d) => !usedDbIds.has(d.id) && norm(d.ho_va_ten) === exNorm);
      if (candidate) {
        usedDbIds.add(candidate.id);
        matchCount++;

        // Cập nhật thông số
        const updatePayload = {
          he_so_luong: ex.he_so_luong,
          phu_cap_chuc_vu: ex.phu_cap_chuc_vu,
          phu_cap_vuot_khung: ex.phu_cap_vuot_khung,
          phu_cap_trach_nhiem: ex.phu_cap_trach_nhiem,
        };

        // Nếu chức danh trong DB chưa có hoặc sơ sài, cập nhật theo bảng lương
        if (!candidate.chuc_danh || candidate.chuc_danh === 'Cán bộ' || candidate.chuc_danh.trim() === '') {
          updatePayload.chuc_danh = ex.full_chuc_danh;
        }

        const { error } = await supabase.from('nhan_su').update(updatePayload).eq('id', candidate.id);
        if (error) {
          console.error(`  ✗ Lỗi cập nhật ID ${candidate.id}:`, error.message);
        } else {
          updateCount++;
        }
      } else {
        console.warn(`  ⚠ Không tìm thấy DB match cho: ${ex.ho_va_ten} (STT ${ex.stt}, ĐV ${dvId})`);
      }
    }
  }

  console.log(`Đã ghép nối khớp: ${matchCount} / ${excelData.length} nhân sự`);
  console.log(`Đã cập nhật thành công: ${updateCount} nhân sự`);

  // 4. Khởi tạo tài khoản người dùng cho các nhân sự mới
  console.log('\n--- BƯỚC 4: TẠO TÀI KHOẢN NGƯỜI DÙNG CHO CÁN BỘ MỚI ---');
  for (const emp of NEW_EMPLOYEES) {
    const { data: ns } = await supabase.from('nhan_su').select('id, ho_va_ten, chuc_danh, don_vi_id').eq('ma_dinh_danh', emp.ma_dinh_danh).maybeSingle();
    if (!ns) continue;

    // Kiểm tra tài khoản trong bảng nguoi_dung
    const cleanName = removeVietnameseTones(ns.ho_va_ten).toLowerCase().replace(/[^a-z0-9]/g, '.');
    const email = `${cleanName}.${ns.id}@ibst.vn`;

    const { data: daCoNd } = await supabase.from('nguoi_dung').select('id').eq('email', email).maybeSingle();
    if (!daCoNd) {
      // Xác định vai trò
      let vaiTro = 'chuyen-vien';
      const cd = (ns.chuc_danh || '').toLowerCase();
      if (cd.includes('trưởng') || cd.includes('giám đốc')) vaiTro = 'truong-don-vi';
      else if (ns.don_vi_id === 10) vaiTro = 'phong-tchc';
      else if (ns.don_vi_id === 8) vaiTro = 'phong-khkt';
      else if (ns.don_vi_id === 9) vaiTro = 'phong-tckt';

      const { error: errNd } = await supabase.from('nguoi_dung').insert({
        email,
        ho_ten: ns.ho_va_ten,
        nhan_su_id: ns.id,
        don_vi_id: ns.don_vi_id,
        vai_tro: vaiTro,
        trang_thai: 'hoat-dong',
      });
      if (errNd) {
        console.error(`  ✗ Lỗi tạo người dùng cho ${ns.ho_va_ten}:`, errNd.message);
      } else {
        console.log(`  + Đã tạo tài khoản: ${email} (${vaiTro}) cho ${ns.ho_va_ten}`);
      }
    } else {
      console.log(`  * Tài khoản ${email} đã tồn tại.`);
    }
  }

  console.log('\n=== HOÀN TẤT ĐỒNG BỘ HÓA DỮ LIỆU NHÂN SỰ ===');
}

main().catch(console.error);
