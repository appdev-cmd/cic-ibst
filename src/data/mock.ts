// Số liệu minh họa còn lại cho Dashboard / Tài chính / Báo cáo (GĐ3 sẽ thay bằng
// tổng hợp thật từ CSDL). Các danh sách bản ghi mock đã gỡ — mọi trang nghiệp vụ
// dùng dữ liệu thật từ Supabase (services/queries.ts, services/org.ts).

export const DON_VI = [
  'Viện chuyên ngành Kết cấu',
  'Viện chuyên ngành Bê tông',
  'Viện Vật liệu xây dựng',
  'Phân viện miền Nam',
  'TT Chống ăn mòn & XD',
  'TT Trắc địa & Xây dựng',
  'TT Phát triển CN & VLXD',
];

export const doanhThuTheoThang = [
  { thang: 'T1', duToan: 18, thucHien: 15.2 },
  { thang: 'T2', duToan: 18, thucHien: 12.8 },
  { thang: 'T3', duToan: 20, thucHien: 21.5 },
  { thang: 'T4', duToan: 22, thucHien: 19.7 },
  { thang: 'T5', duToan: 22, thucHien: 23.1 },
  { thang: 'T6', duToan: 24, thucHien: 26.4 },
  { thang: 'T7', duToan: 24, thucHien: 8.9 },
];

export const doanhThuTheoLinhVuc = [
  { ten: 'Thí nghiệm - Kiểm định', giaTri: 38 },
  { ten: 'Tư vấn - Giám sát', giaTri: 31 },
  { ten: 'Đề tài - Nhiệm vụ NN', giaTri: 17 },
  { ten: 'Thi công - Tu bổ', giaTri: 9 },
  { ten: 'Đào tạo - Khác', giaTri: 5 },
];
