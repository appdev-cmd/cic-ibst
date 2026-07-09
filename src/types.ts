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
  ngay: string;
  trangThai: TrangThai;
}

export interface DeTai {
  id: string;
  maSo: string;
  ten: string;
  cap: 'Nhà nước' | 'Bộ' | 'Cơ sở';
  chuNhiem: string;
  donVi: string;
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
  donViThucHien: string;
  giaTri: number; // triệu đồng
  daThanhToan: number; // triệu đồng
  ngayKy: string;
  hanHoanThanh: string;
  trangThai: TrangThai;
}

export interface MauThiNghiem {
  id: string;
  maPhieu: string;
  tenMau: string;
  phepThu: string;
  khachHang: string;
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
  chungChi: string;
  hanChungChi: string;
}

export interface LopDaoTao {
  id: string;
  ten: string;
  loai: 'NCS' | 'Tập huấn' | 'Hội thảo';
  soHocVien: number;
  batDau: string;
  ketThuc: string;
  trangThai: TrangThai;
}
