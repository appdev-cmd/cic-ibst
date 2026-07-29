import type { NhomHD, LoaiDacThu } from './lib/qc2815';

export type TrangThai =
  | 'hoan-thanh'
  | 'dang-thuc-hien'
  | 'cho-duyet'
  | 'qua-han'
  | 'moi';

export interface VanBan {
  id: string;
  soHieu: string;
  trichYeu: string;
  loai: 'Đến' | 'Đi';
  donVi: string;
  donViId: string | null;
  ngay: string;
  trangThai: TrangThai;
  tepDinhKem: string | null;
  tenTep: string | null;
}

export interface DeTai {
  id: string;
  maSo: string;
  ten: string;
  cap: 'Nhà nước' | 'Bộ' | 'Cơ sở';
  capMa: string;
  chuNhiem: string;
  chuNhiemId: string | null;
  donVi: string;
  donViId: string | null;
  kinhPhi: number; // triệu đồng
  tienDo: number; // %
  hanNghiemThu: string;
  trangThai: TrangThai;
}

export interface HopDong {
  id: string;
  soHD: string;
  ten: string;
  khachHang: string;
  khachHangId: string | null;
  donViThucHien: string;
  donViId: string | null;
  giaTri: number; // triệu đồng
  daThanhToan: number; // triệu đồng
  ngayKy: string;
  hanHoanThanh: string;
  trangThai: TrangThai;
  nhomHD: NhomHD | null;
  chuTriId: string | null;
  chuTri: string; // tên chủ trì hợp đồng (hiển thị)
  giaDuThau: number | null; // triệu đồng; null = lấy giaTri
  ngayNopHoSo: string; // ngày nộp hồ sơ gốc về Viện; '' = chưa nộp
  trangThaiPheDuyet: TrangThaiPheDuyet;
  ngayTrinhDuyet: string;
  ngayDuyet: string;
  trangThaiQuyetToan: 'chua-quyet-toan' | 'da-quyet-toan';
  ngayQuyetToan: string;
  hanChungTuQuyetToan: string; // hạn TCKT yêu cầu nộp chứng từ quyết toán; '' = chưa đặt hạn
  loaiDacThu: LoaiDacThu | null;
  phanVienXa: boolean;
  giamTheoYeuCauDonVi: boolean;
}

export type TrangThaiPheDuyet = 'khong-ap-dung' | 'chua-trinh' | 'da-trinh' | 'da-duyet';

export interface MauThiNghiem {
  id: string;
  maPhieu: string;
  tenMau: string;
  phepThu: string;
  tieuChuan: string;
  khachHang: string;
  khachHangId: string | null;
  phongThiNghiem: string;
  ngayNhan: string;
  hanTra: string;
  trangThai: TrangThai;
}

export interface NhanSu {
  id: string;
  hoTen: string;
  chucDanh: string;
  hocVi: string;
  donVi: string;
  donViId: string | null;
  email: string;
  soDienThoai: string;
  trangThaiLamViec: string;
  chungChi: string;
  hanChungChi: string;
}

export type LoaiDonVi =
  | 'lanh-dao'
  | 'phong-chuc-nang'
  | 'vien-chuyen-nganh'
  | 'phan-vien'
  | 'trung-tam'
  | 'cong-ty';

export interface DonVi {
  id: string;
  maDinhDanh: string | null;
  ten: string;
  tenVietTat: string | null;
  loai: LoaiDonVi;
  chucNangNhiemVu: string | null;
  dienThoai: string | null;
  email: string | null;
  truongDonVi: string | null;
  phuTrachId: string | null;
  phuTrach: string | null;
  soNhanSu: number;
  soDeTai: number;
  soHopDong: number;
  thuTu: number;
}

export interface LopDaoTao {
  id: string;
  ten: string;
  loai: 'NCS' | 'Tập huấn' | 'Hội thảo';
  loaiMa: string;
  soHocVien: number;
  batDau: string;
  ketThuc: string;
  trangThai: TrangThai;
}
