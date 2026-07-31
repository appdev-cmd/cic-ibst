// Seed bổ sung danh sách nhân sự đầy đủ phòng ban, chức vụ phục vụ test
// Chạy: node scripts/seed_nhan_su_moi.js

import { createClient } from '@supabase/supabase-js';

const url = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';
const supabase = createClient(url, serviceKey);

const DANH_SACH_NHAN_SU = [
  // ĐV 1: Viện chuyên ngành Kết cấu
  { ma_dinh_danh: 'NS-KC-01', ho_va_ten: 'Hoàng Văn E', chuc_danh: 'Giám đốc Viện Chuyên ngành', don_vi_id: 1, email: 'hoangvane@ibst.vn' },
  { ma_dinh_danh: 'NS-KC-02', ho_va_ten: 'Ngô Văn Kiên', chuc_danh: 'Phó Giám đốc Viện Chuyên ngành', don_vi_id: 1, email: 'ngovankien@ibst.vn' },
  { ma_dinh_danh: 'NS-KC-03', ho_va_ten: 'Trần Thị B', chuc_danh: 'Trưởng phòng Thí nghiệm Kết cấu', don_vi_id: 1, email: 'tranthib@ibst.vn' },
  { ma_dinh_danh: 'NS-KC-04', ho_va_ten: 'Nguyễn Văn A', chuc_danh: 'Chuyên viên / Kỹ sư chính', don_vi_id: 1, email: 'nguyenvana@ibst.vn' },
  { ma_dinh_danh: 'NS-KC-05', ho_va_ten: 'Phan Thanh Hải', chuc_danh: 'Kỹ sư Thí nghiệm Vật liệu', don_vi_id: 1, email: 'phanthanhhai@ibst.vn' },
  { ma_dinh_danh: 'NS-KC-06', ho_va_ten: 'Nguyễn Thị Mai', chuc_danh: 'Chuyên viên Kiểm định', don_vi_id: 1, email: 'nguyenthimai@ibst.vn' },

  // ĐV 2: Viện chuyên ngành Bê tông
  { ma_dinh_danh: 'NS-BT-01', ho_va_ten: 'Phạm Văn Hùng', chuc_danh: 'Giám đốc Viện Bê tông', don_vi_id: 2, email: 'phamvanhung@ibst.vn' },
  { ma_dinh_danh: 'NS-BT-02', ho_va_ten: 'Bùi Thị Lan', chuc_danh: 'Phó Giám đốc Viện Bê tông', don_vi_id: 2, email: 'buithilan@ibst.vn' },
  { ma_dinh_danh: 'NS-BT-03', ho_va_ten: 'Nguyễn Tuấn Anh', chuc_danh: 'Trưởng phòng Công nghệ Bê tông', don_vi_id: 2, email: 'nguyentuananh@ibst.vn' },

  // ĐV 3: Viện chuyên ngành Địa kỹ thuật
  { ma_dinh_danh: 'NS-DKT-01', ho_va_ten: 'Vũ Thị F', chuc_danh: 'Giám đốc Viện Địa kỹ thuật', don_vi_id: 3, email: 'vuthif@ibst.vn' },
  { ma_dinh_danh: 'NS-DKT-02', ho_va_ten: 'Đỗ Văn G', chuc_danh: 'Phó Giám đốc Viện Địa kỹ thuật', don_vi_id: 3, email: 'dovang@ibst.vn' },
  { ma_dinh_danh: 'NS-DKT-03', ho_va_ten: 'Cao Duy Khôi', chuc_danh: 'Trưởng phòng Khảo sát Địa chất', don_vi_id: 3, email: 'caoduykhoi@ibst.vn' },

  // ĐV 4: Phân Viện miền Nam
  { ma_dinh_danh: 'NS-PVMN-01', ho_va_ten: 'Đặng Quốc Huy', chuc_danh: 'Giám đốc Phân Viện miền Nam', don_vi_id: 4, email: 'dangquochuy@ibst.vn' },
  { ma_dinh_danh: 'NS-PVMN-02', ho_va_ten: 'Nguyễn Thành Trung', chuc_danh: 'Phó Giám đốc Phân Viện miền Nam', don_vi_id: 4, email: 'nguyenthanhtrung@ibst.vn' },
  { ma_dinh_danh: 'NS-PVMN-03', ho_va_ten: 'Võ Thị Cẩm Tú', chuc_danh: 'Phụ trách Kế toán PVMN', don_vi_id: 4, email: 'vothicamtu@ibst.vn' },

  // ĐV 5: TT Tư vấn chống ăn mòn
  { ma_dinh_danh: 'NS-CAM-01', ho_va_ten: 'Lê Văn C', chuc_danh: 'Giám đốc Trung tâm', don_vi_id: 5, email: 'levanc@ibst.vn' },
  { ma_dinh_danh: 'NS-CAM-02', ho_va_ten: 'Hoàng Minh Trí', chuc_danh: 'Phó Giám đốc Trung tâm', don_vi_id: 5, email: 'hoangminhtri@ibst.vn' },

  // ĐV 8: Phòng Kế hoạch - Kỹ thuật
  { ma_dinh_danh: 'NS-KHKT-01', ho_va_ten: 'Phạm Kế Hoạch', chuc_danh: 'Trưởng phòng KHKT', don_vi_id: 8, email: 'khkt@ibst.vn' },
  { ma_dinh_danh: 'NS-KHKT-02', ho_va_ten: 'Trần Cao Cường', chuc_danh: 'Phó Trưởng phòng KHKT', don_vi_id: 8, email: 'trancaocuong@ibst.vn' },
  { ma_dinh_danh: 'NS-KHKT-03', ho_va_ten: 'Lê Thị Ngọc', chuc_danh: 'Chuyên viên KHKT', don_vi_id: 8, email: 'lethingoc@ibst.vn' },

  // ĐV 9: Phòng Tài chính - Kế toán
  { ma_dinh_danh: 'NS-TCKT-01', ho_va_ten: 'Lê Tài Chính', chuc_danh: 'Trưởng phòng TCKT', don_vi_id: 9, email: 'tckt@ibst.vn' },
  { ma_dinh_danh: 'NS-TCKT-02', ho_va_ten: 'Nguyễn Thị Kim Anh', chuc_danh: 'Phó Trưởng phòng TCKT', don_vi_id: 9, email: 'nguyenthikimanh@ibst.vn' },

  // ĐV 10: Phòng Tổ chức hành chính
  { ma_dinh_danh: 'NS-TCHC-01', ho_va_ten: 'Nguyễn Văn Minh', chuc_danh: 'Trưởng phòng TCHC', don_vi_id: 10, email: 'nguyenvanminh@ibst.vn' },
  { ma_dinh_danh: 'NS-TCHC-02', ho_va_ten: 'Đỗ Thanh Tùng', chuc_danh: 'Chuyên viên TCHC', don_vi_id: 10, email: 'dothanhtung@ibst.vn' },

  // ĐV 11: Lãnh đạo Viện
  { ma_dinh_danh: 'NS-LDV-01', ho_va_ten: 'Nguyễn Hồng Hải', chuc_danh: 'Viện trưởng', don_vi_id: 11, email: 'admin@ibst.vn' },
  { ma_dinh_danh: 'NS-LDV-02', ho_va_ten: 'Đinh Quốc Dân', chuc_danh: 'Phó Viện trưởng', don_vi_id: 11, email: 'dinhquocdan@ibst.vn' },
  { ma_dinh_danh: 'NS-LDV-03', ho_va_ten: 'Nguyễn Thanh Bình', chuc_danh: 'Phó Viện trưởng', don_vi_id: 11, email: 'nguyenthanhbinh@ibst.vn' },

  // ĐV 12: Phân Viện miền Trung
  { ma_dinh_danh: 'NS-PVMT-01', ho_va_ten: 'Trần Văn Nam', chuc_danh: 'Giám đốc Phân Viện miền Trung', don_vi_id: 12, email: 'tranvannam@ibst.vn' },
  { ma_dinh_danh: 'NS-PVMT-02', ho_va_ten: 'Ngô Thị Thanh', chuc_danh: 'Phó Giám đốc PVMT', don_vi_id: 12, email: 'ngothithanh@ibst.vn' },

  // ĐV 19: TT BIM
  { ma_dinh_danh: 'NS-BIM-01', ho_va_ten: 'Vũ Đức Thịnh', chuc_danh: 'Giám đốc Trung tâm BIM', don_vi_id: 19, email: 'vuducthinh@ibst.vn' },
  { ma_dinh_danh: 'NS-BIM-02', ho_va_ten: 'Trần Quốc Bảo', chuc_danh: 'Chuyên gia BIM/Revit', don_vi_id: 19, email: 'tranquocbao@ibst.vn' },
];

async function main() {
  console.log('=== BẮT ĐẦU SEED NHÂN SỰ ĐẦY ĐỦ PHÒNG BAN CƠ QUAN IBST ===\n');

  for (const ns of DANH_SACH_NHAN_SU) {
    const { data: daCo } = await supabase.from('nhan_su').select('id').eq('ma_dinh_danh', ns.ma_dinh_danh).maybeSingle();
    if (daCo) {
      // Cập nhật thông tin chức danh và đơn vị nếu đã tồn tại
      await supabase.from('nhan_su').update({
        ho_va_ten: ns.ho_va_ten,
        chuc_danh: ns.chuc_danh,
        don_vi_id: ns.don_vi_id,
      }).eq('id', daCo.id);
      console.log(`  ✓ Cập nhật: ${ns.ho_va_ten} (${ns.chuc_danh}) - ĐV ID ${ns.don_vi_id}`);
    } else {
      const { error } = await supabase.from('nhan_su').insert(ns);
      if (error) console.error(`  ✗ Lỗi chèn ${ns.ho_va_ten}:`, error.message);
      else console.log(`  + Thêm mới: ${ns.ho_va_ten} (${ns.chuc_danh}) - ĐV ID ${ns.don_vi_id}`);
    }
  }

  console.log('\n=== ĐÃ HOÀN THÀNH SEED DỮ LIỆU NHÂN SỰ ===');
}

main();
