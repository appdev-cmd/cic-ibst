/**
 * scripts/sync_all_salary_data.js
 * 
 * Đồng bộ chính xác:
 *   - he_so_luong
 *   - phu_cap_chuc_vu
 *   - phu_cap_vuot_khung
 *   - phu_cap_trach_nhiem
 *   - chuc_danh (nếu thiếu)
 * cho toàn bộ 644 cán bộ cơ quan Viện IBST từ Bảng lương Tháng 9/2026.
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
  str = str.replace(/À|Á|Ạ|Ả|Ã|Â|Ầ|Ấ|Ậ|Ẩ|Ẫ|Ă|Ằ|Ắ|Ặ|ẲẴ/g, 'A');
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
  console.log('=== BẮT ĐẦU CẬP NHẬT DỮ LIỆU LƯƠNG & PHỤ CẤP T9-2026 ===\n');

  const jsonPath = 'C:/Users/Personal/.gemini/antigravity/brain/a7797cb9-2bf8-46db-ae77-78c6460dffb6/scratch/excel_nhan_su_clean.json';
  const excelData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  // Lấy toàn bộ nhân sự hiện có trong DB
  const { data: allDB, error } = await supabase.from('nhan_su').select('id, ma_dinh_danh, ho_va_ten, don_vi_id, chuc_danh, he_so_luong, phu_cap_chuc_vu, phu_cap_vuot_khung, phu_cap_trach_nhiem').order('id');
  if (error || !allDB) {
    console.error('Lỗi nạp DB:', error);
    return;
  }

  console.log(`Đã nạp ${allDB.length} nhân sự từ CSDL.`);

  const updateTasks = [];

  for (let dvId = 1; dvId <= 19; dvId++) {
    const exInDv = excelData.filter((e) => e.don_vi_id === dvId);
    const dbInDv = allDB.filter((d) => d.don_vi_id === dvId);

    const usedDbIds = new Set();
    for (const ex of exInDv) {
      const exNorm = norm(ex.ho_va_ten);
      const match = dbInDv.find((d) => !usedDbIds.has(d.id) && norm(d.ho_va_ten) === exNorm);
      if (match) {
        usedDbIds.add(match.id);
        const payload = {
          he_so_luong: ex.he_so_luong,
          phu_cap_chuc_vu: ex.phu_cap_chuc_vu,
          phu_cap_vuot_khung: ex.phu_cap_vuot_khung,
          phu_cap_trach_nhiem: ex.phu_cap_trach_nhiem,
        };
        if (!match.chuc_danh || match.chuc_danh === 'Cán bộ' || match.chuc_danh.trim() === '') {
          payload.chuc_danh = ex.full_chuc_danh;
        }
        updateTasks.push({ id: match.id, payload, name: match.ho_va_ten, stt: ex.stt });
      }
    }
  }

  console.log(`Tìm thấy ${updateTasks.length} / ${excelData.length} cán bộ cần cập nhật.`);

  // Chạy cập nhật theo batch 25 để tối ưu tốc độ
  const BATCH_SIZE = 25;
  let successCount = 0;
  for (let i = 0; i < updateTasks.length; i += BATCH_SIZE) {
    const chunk = updateTasks.slice(i, i + BATCH_SIZE);
    await Promise.all(
      chunk.map(async (t) => {
        const { error: err } = await supabase.from('nhan_su').update(t.payload).eq('id', t.id);
        if (err) {
          console.error(`  ✗ Lỗi update ID ${t.id} (${t.name}):`, err.message);
        } else {
          successCount++;
        }
      })
    );
    process.stdout.write(`Đã cập nhật: ${successCount} / ${updateTasks.length}\r`);
  }

  console.log(`\n\n🎉 HOÀN THÀNH CẬP NHẬT: ${successCount} cán bộ đã được đồng bộ chuẩn Bảng lương T9-2026!`);
}

main().catch(console.error);
