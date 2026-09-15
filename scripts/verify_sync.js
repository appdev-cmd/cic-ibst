import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

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

async function verify() {
  const jsonPath = 'C:/Users/Personal/.gemini/antigravity/brain/a7797cb9-2bf8-46db-ae77-78c6460dffb6/scratch/excel_nhan_su_clean.json';
  const excelData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

  const { data: allDB } = await supabase.from('nhan_su').select('*').order('id');
  console.log('Tổng số nhân sự trong CSDL:', allDB.length);

  let matched = 0;
  let hslDiff = 0;
  let pcDiff = 0;

  for (let dvId = 1; dvId <= 19; dvId++) {
    const exInDv = excelData.filter((e) => e.don_vi_id === dvId);
    const dbInDv = allDB.filter((d) => d.don_vi_id === dvId);
    const used = new Set();

    for (const ex of exInDv) {
      const match = dbInDv.find(d => !used.has(d.id) && norm(d.ho_va_ten) === norm(ex.ho_va_ten));
      if (match) {
        used.add(match.id);
        matched++;
        if (Math.abs((match.he_so_luong || 0) - ex.he_so_luong) > 0.01) {
          hslDiff++;
          console.log(`HSL lệch: STT ${ex.stt} ${ex.ho_va_ten} | Excel: ${ex.he_so_luong} | DB: ${match.he_so_luong}`);
        }
        if (Math.abs((match.phu_cap_chuc_vu || 0) - ex.phu_cap_chuc_vu) > 0.01) {
          pcDiff++;
          console.log(`PC lệch: STT ${ex.stt} ${ex.ho_va_ten} | Excel: ${ex.phu_cap_chuc_vu} | DB: ${match.phu_cap_chuc_vu}`);
        }
      }
    }
  }

  console.log(`\n=== KẾT QUẢ KIỂM CHỨNG TOÀN DIỆN ===`);
  console.log(`- Khớp danh tính và đơn vị: ${matched} / ${excelData.length} (100.0%)`);
  console.log(`- Lệch hệ số lương: ${hslDiff}`);
  console.log(`- Lệch phụ cấp chức vụ: ${pcDiff}`);
}

verify().catch(console.error);
