// Re-link remaining foreign keys and delete remaining duplicate nhan_su rows
import { createClient } from '@supabase/supabase-js';

const url = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';
const supabase = createClient(url, serviceKey);

const REMAINING_MAP = {
  1: 19,  // Hoàng Văn E
  3: 21,  // Trần Thị B
  8: 41,  // Nguyễn Hồng Hải
  12: 36, // Trần Cao Cường
  16: 31, // Đặng Quốc Huy
};

async function updateFK(table, column, oldId, newId) {
  await supabase.from(table).update({ [column]: newId }).eq(column, oldId);
}

async function main() {
  console.log('=== DỌN DẸP NỐT CÁC BẢN GHI TRÙNG CÒN LẠI ===');

  for (const [oldIdStr, newId] of Object.entries(REMAINING_MAP)) {
    const oldId = Number(oldIdStr);
    await updateFK('phieu_giao_viec', 'nguoi_duyet_id', oldId, newId);
    await updateFK('phieu_giao_viec', 'chu_tri_ky_thuat_id', oldId, newId);
    await updateFK('luu_tru_ho_so', 'nguoi_ban_giao_id', oldId, newId);
    await updateFK('hop_dong', 'nguoi_tao_id', oldId, newId);

    const { error } = await supabase.from('nhan_su').delete().eq('id', oldId);
    if (error) console.error(`✗ Vẫn chưa xóa được ID ${oldId}:`, error.message);
    else console.log(`✓ Đã xóa dứt điểm nhân sự trùng ID ${oldId}`);
  }

  console.log('=== ĐÃ XÓA SẠCH DỨT ĐIỂM CÁC BẢN GHI TRÙNG ===');
}

main();
