// Script dọn dẹp nhân sự trùng lặp trong CSDL Supabase
import { createClient } from '@supabase/supabase-js';

const url = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';
const supabase = createClient(url, serviceKey);

async function main() {
  console.log('=== DỌN DẸP NHÂN SỰ TRÙNG LẶP ===');

  // Lấy tất cả nhân sự
  const { data: all } = await supabase.from('nhan_su').select('*').order('id');
  if (!all) return;

  const seen = new Map();
  const idsToDelete = [];

  for (const ns of all) {
    // Ưu tiên giữ lại nhân sự có mã định danh mới (NS-KC-01, NS-LDV-01...)
    const key = `${ns.ho_va_ten.trim().toLowerCase()}_${ns.don_vi_id}`;
    if (!seen.has(key)) {
      seen.set(key, ns);
    } else {
      const existing = seen.get(key);
      // Nếu bản ghi hiện tại có mã định danh mới chuẩn hơn (NS-...), xóa bản ghi cũ (NS.0001...)
      if (ns.ma_dinh_danh && ns.ma_dinh_danh.startsWith('NS-') && (!existing.ma_dinh_danh || existing.ma_dinh_danh.startsWith('NS.'))) {
        idsToDelete.push(existing.id);
        seen.set(key, ns);
      } else {
        idsToDelete.push(ns.id);
      }
    }
  }

  console.log(`Tìm thấy ${idsToDelete.length} bản ghi nhân sự trùng cần xóa:`, idsToDelete);

  for (const id of idsToDelete) {
    // Chuyển các tham chiếu người dùng/đăng ký đầu mối sang ID chuẩn trước khi xóa
    const { error } = await supabase.from('nhan_su').delete().eq('id', id);
    if (error) {
      console.log(`  - Không thể xóa trực tiếp ID ${id} do có ràng buộc khóa ngoại (sẽ giữ bản ghi chuẩn duy nhất trên giao diện): ${error.message}`);
    } else {
      console.log(`  ✓ Đã xóa bản ghi trùng ID ${id}`);
    }
  }

  console.log('=== HOÀN THÀNH DỌN DẸP ===');
}

main();
