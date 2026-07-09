import type {
  VanBan,
  DeTai,
  HopDong,
  MauThiNghiem,
  LopDaoTao,
} from '../types';

export const DON_VI = [
  'Viện chuyên ngành Kết cấu',
  'Viện chuyên ngành Bê tông',
  'Viện Vật liệu xây dựng',
  'Phân viện miền Nam',
  'TT Chống ăn mòn & XD',
  'TT Trắc địa & Xây dựng',
  'TT Phát triển CN & VLXD',
];

export const vanBanList: VanBan[] = [
  { id: 'vb1', soHieu: '1245/BXD-KHCN', trichYeu: 'V/v giao nhiệm vụ KHCN năm 2026 đợt 2', loai: 'Đến', donVi: 'Phòng Quản lý khoa học', ngay: '2026-07-06', trangThai: 'cho-duyet' },
  { id: 'vb2', soHieu: '342/IBST-KHTC', trichYeu: 'Báo cáo tài chính hợp nhất Quý II/2026', loai: 'Đi', donVi: 'Phòng Kế hoạch - Tài chính', ngay: '2026-07-05', trangThai: 'hoan-thanh' },
  { id: 'vb3', soHieu: '89/SXD-HN', trichYeu: 'Đề nghị kiểm định chất lượng công trình chung cư CT5', loai: 'Đến', donVi: 'Viện chuyên ngành Kết cấu', ngay: '2026-07-04', trangThai: 'dang-thuc-hien' },
  { id: 'vb4', soHieu: '341/IBST-TCHC', trichYeu: 'Quyết định cử cán bộ tham dự hội thảo CABR 2026', loai: 'Đi', donVi: 'Phòng Tổ chức - Hành chính', ngay: '2026-07-03', trangThai: 'hoan-thanh' },
  { id: 'vb5', soHieu: '1198/BXD-GĐ', trichYeu: 'V/v giám định nguyên nhân sự cố công trình cầu X', loai: 'Đến', donVi: 'Lãnh đạo Viện', ngay: '2026-07-02', trangThai: 'qua-han' },
  { id: 'vb6', soHieu: '338/IBST-QLKH', trichYeu: 'Đăng ký đề tài cấp Bộ năm 2027', loai: 'Đi', donVi: 'Phòng Quản lý khoa học', ngay: '2026-07-01', trangThai: 'cho-duyet' },
];

export const deTaiList: DeTai[] = [
  { id: 'dt1', maSo: 'NĐT.2025.05', ten: 'Nghiên cứu bê tông cường độ siêu cao UHPC cho kết cấu cầu', cap: 'Nhà nước', chuNhiem: 'PGS.TS Nguyễn Văn A', donVi: 'Viện chuyên ngành Bê tông', kinhPhi: 8500, tienDo: 65, hanNghiemThu: '2027-03-31', trangThai: 'dang-thuc-hien' },
  { id: 'dt2', maSo: 'RD 12-25', ten: 'Biên soạn TCVN về thiết kế kết cấu thép nhà cao tầng', cap: 'Bộ', chuNhiem: 'TS Trần Thị B', donVi: 'Viện chuyên ngành Kết cấu', kinhPhi: 1200, tienDo: 90, hanNghiemThu: '2026-09-30', trangThai: 'dang-thuc-hien' },
  { id: 'dt3', maSo: 'RD 08-24', ten: 'Giải pháp chống ăn mòn kết cấu BTCT vùng ven biển', cap: 'Bộ', chuNhiem: 'TS Lê Văn C', donVi: 'TT Chống ăn mòn & XD', kinhPhi: 950, tienDo: 100, hanNghiemThu: '2026-06-30', trangThai: 'hoan-thanh' },
  { id: 'dt4', maSo: 'CS 03-26', ten: 'Ứng dụng BIM trong quản lý thí nghiệm hiện trường', cap: 'Cơ sở', chuNhiem: 'ThS Phạm Thị D', donVi: 'TT Phát triển CN & VLXD', kinhPhi: 250, tienDo: 30, hanNghiemThu: '2026-12-31', trangThai: 'dang-thuc-hien' },
  { id: 'dt5', maSo: 'NĐT.2024.11', ten: 'Công nghệ quan trắc sức khỏe kết cấu công trình cao tầng', cap: 'Nhà nước', chuNhiem: 'GS.TS Hoàng Văn E', donVi: 'Viện chuyên ngành Kết cấu', kinhPhi: 12000, tienDo: 45, hanNghiemThu: '2026-08-15', trangThai: 'qua-han' },
  { id: 'dt6', maSo: 'RD 21-26', ten: 'Nghiên cứu vật liệu xây không nung từ tro xỉ nhiệt điện', cap: 'Bộ', chuNhiem: 'TS Vũ Thị F', donVi: 'Viện Vật liệu xây dựng', kinhPhi: 1500, tienDo: 10, hanNghiemThu: '2027-06-30', trangThai: 'moi' },
];

export const hopDongList: HopDong[] = [
  { id: 'hd1', soHD: '156/2026/HĐKT', ten: 'Kiểm định chất lượng nhà ga T3 sân bay Tân Sơn Nhất', khachHang: 'ACV', donViThucHien: 'Phân viện miền Nam', giaTri: 18500, daThanhToan: 9250, ngayKy: '2026-02-15', hanHoanThanh: '2026-12-31', trangThai: 'dang-thuc-hien' },
  { id: 'hd2', soHD: '198/2026/HĐTV', ten: 'Tư vấn giám sát thi công dự án Khu đô thị Tây Hồ Tây - GĐ2', khachHang: 'THT Development', donViThucHien: 'Viện chuyên ngành Kết cấu', giaTri: 24000, daThanhToan: 6000, ngayKy: '2026-03-20', hanHoanThanh: '2027-10-31', trangThai: 'dang-thuc-hien' },
  { id: 'hd3', soHD: '112/2026/HĐTN', ten: 'Thí nghiệm vật liệu dự án cao tốc Bắc - Nam đoạn QT-ĐH', khachHang: 'Ban QLDA 85', donViThucHien: 'Viện Vật liệu xây dựng', giaTri: 5600, daThanhToan: 5600, ngayKy: '2026-01-10', hanHoanThanh: '2026-06-30', trangThai: 'hoan-thanh' },
  { id: 'hd4', soHD: '215/2026/HĐKT', ten: 'Quan trắc lún và biến dạng tòa nhà Landmark Riverside', khachHang: 'CĐT Landmark', donViThucHien: 'TT Trắc địa & Xây dựng', giaTri: 3200, daThanhToan: 800, ngayKy: '2026-05-05', hanHoanThanh: '2027-05-05', trangThai: 'dang-thuc-hien' },
  { id: 'hd5', soHD: '87/2026/HĐTB', ten: 'Tu bổ, tôn tạo di tích đình làng Đình Bảng', khachHang: 'Sở VHTT Bắc Ninh', donViThucHien: 'TT Phát triển CN & VLXD', giaTri: 7800, daThanhToan: 2340, ngayKy: '2025-11-20', hanHoanThanh: '2026-07-30', trangThai: 'qua-han' },
  { id: 'hd6', soHD: '231/2026/HĐTV', ten: 'Thẩm tra thiết kế bệnh viện đa khoa 500 giường Hưng Yên', khachHang: 'Sở Y tế Hưng Yên', donViThucHien: 'Viện chuyên ngành Kết cấu', giaTri: 2100, daThanhToan: 0, ngayKy: '2026-06-28', hanHoanThanh: '2026-10-15', trangThai: 'moi' },
];

export const mauThiNghiemList: MauThiNghiem[] = [
  { id: 'm1', maPhieu: 'LAS-2607-0912', tenMau: 'Bê tông M400 — mẫu trụ 15x30', phepThu: 'Cường độ nén TCVN 3118', khachHang: 'Ban QLDA 85', phongThiNghiem: 'LAS-XD 01', ngayNhan: '2026-07-07', hanTra: '2026-07-10', trangThai: 'dang-thuc-hien' },
  { id: 'm2', maPhieu: 'LAS-2607-0908', tenMau: 'Thép CB400-V D20', phepThu: 'Kéo, uốn TCVN 7937', khachHang: 'THT Development', phongThiNghiem: 'LAS-XD 01', ngayNhan: '2026-07-06', hanTra: '2026-07-09', trangThai: 'cho-duyet' },
  { id: 'm3', maPhieu: 'LAS-2607-0895', tenMau: 'Đất nền K98 — 12 mẫu', phepThu: 'Đầm nén tiêu chuẩn 22TCN 333', khachHang: 'CTCP Hạ tầng 620', phongThiNghiem: 'LAS-XD 03', ngayNhan: '2026-07-05', hanTra: '2026-07-08', trangThai: 'hoan-thanh' },
  { id: 'm4', maPhieu: 'LAS-2607-0871', tenMau: 'Xi măng PC50 — lô 26/06', phepThu: 'Cường độ, độ mịn TCVN 6016', khachHang: 'Vicem Hoàng Thạch', phongThiNghiem: 'LAS-XD 02', ngayNhan: '2026-07-03', hanTra: '2026-07-31', trangThai: 'dang-thuc-hien' },
  { id: 'm5', maPhieu: 'LAS-2606-0844', tenMau: 'Gạch không nung 4 lỗ — 30 viên', phepThu: 'Cường độ nén TCVN 6477', khachHang: 'Nhà máy gạch Đại Thành', phongThiNghiem: 'LAS-XD 02', ngayNhan: '2026-06-28', hanTra: '2026-07-05', trangThai: 'qua-han' },
  { id: 'm6', maPhieu: 'LAS-2607-0921', tenMau: 'Vữa chống thấm gốc xi măng', phepThu: 'Độ thấm nước TCVN 9065', khachHang: 'Sika Việt Nam', phongThiNghiem: 'LAS-XD 02', ngayNhan: '2026-07-08', hanTra: '2026-07-15', trangThai: 'moi' },
];

// nhanSuList mock đã gỡ — module Nhân sự dùng dữ liệu thật từ Supabase (services/org.ts)

export const lopDaoTaoList: LopDaoTao[] = [
  { id: 'ld1', ten: 'NCS khóa 2024 — Kỹ thuật xây dựng', loai: 'NCS', soHocVien: 8, batDau: '2024-11-01', ketThuc: '2028-11-01', trangThai: 'dang-thuc-hien' },
  { id: 'ld2', ten: 'Tập huấn TCVN mới về kết cấu thép', loai: 'Tập huấn', soHocVien: 120, batDau: '2026-08-10', ketThuc: '2026-08-12', trangThai: 'moi' },
  { id: 'ld3', ten: 'Hội thảo Việt - Hàn về công nghệ chống động đất', loai: 'Hội thảo', soHocVien: 250, batDau: '2026-09-22', ketThuc: '2026-09-23', trangThai: 'moi' },
  { id: 'ld4', ten: 'Tập huấn thí nghiệm viên LAS-XD đợt 3', loai: 'Tập huấn', soHocVien: 45, batDau: '2026-06-15', ketThuc: '2026-06-20', trangThai: 'hoan-thanh' },
];

// Dashboard series
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
