import type { NhomHD, LoaiDacThu, CapKy } from './lib/qc2815';

export type TrangThai =
  | 'moi'
  | 'cho-duyet'
  | 'dang-thuc-hien'
  | 'tam-dung'
  | 'nghiem-thu'
  | 'quyet-toan'
  | 'hoan-thanh'
  | 'thanh-ly'
  | 'huy'
  | 'qua-han';

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
  /** Điều 6.1 — cấp ký hợp đồng: Viện ký hay đơn vị ký theo phân cấp/ủy quyền. */
  capKy: CapKy | null;
  buocHienTai: string;
  fileDuThaoUrl?: string | null;
  tenFileDuThao?: string | null;
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

/* ─── Ủy quyền (Điều 5 QC 2815) ─── */
export type LoaiUyQuyen = 'ky-hop-dong' | 'phe-duyet' | 'quyet-toan' | 'kiem-tra' | 'toan-quyen';
export type TrangThaiUyQuyen = 'hieu-luc' | 'het-han' | 'thu-hoi';

export interface UyQuyen {
  id: string;
  nguoiUyQuyenId: string;
  nguoiUyQuyen: string;
  nguoiDuocUyQuyenId: string;
  nguoiDuocUyQuyen: string;
  loaiUyQuyen: LoaiUyQuyen;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  soQuyetDinh: string;
  trangThai: TrangThaiUyQuyen;
}

/* ─── Đấu thầu (Điều 4 QC 2815) ─── */
export type HinhThucDauThau = 'dau-thau-rong-rai' | 'dau-thau-han-che' | 'chi-dinh-thau' | 'chao-gia' | 'mua-sam-truc-tiep' | 'tu-thuc-hien' | 'khac';
export type TrangThaiDauThau = 'chuan-bi' | 'da-nop' | 'trung-thau' | 'truot' | 'huy';

export interface DauThau {
  id: string;
  tenGoiThau: string;
  chuDauTuId: string | null;
  chuDauTu: string;
  donViThucHienId: string | null;
  donViThucHien: string;
  hinhThuc: HinhThucDauThau;
  giaDuThau: number | null;
  giaTrungThau: number | null;
  ngayMoThau: string;
  ngayDongThau: string;
  trangThai: TrangThaiDauThau;
  hopDongId: string | null;
  nguoiPhuTrachId: string | null;
  nguoiPhuTrach: string;
  ghiChu: string;
}

/* ─── Liên danh (Điều 5.3 QC 2815) ─── */
export interface LienDanh {
  id: string;
  hopDongId: string;
  tenDoiTac: string;
  maSoThue: string;
  tyLePhanTram: number;
  vaiTro: 'dung-dau' | 'thanh-vien';
  giaTriPhanViec: number | null;
  ghiChu: string;
}

/* ─── Nhiệm vụ PVQLNN (Điều 3 QC 2815) ─── */
export interface NhiemVuPVQLNN {
  id: string;
  tenNhiemVu: string;
  coQuanGiao: string;
  soVanBanGiao: string;
  ngayGiao: string;
  hanHoanThanh: string;
  donViId: string | null;
  donVi: string;
  nguoiPhuTrachId: string | null;
  nguoiPhuTrach: string;
  kinhPhi: number | null;
  nguonKinhPhi: string;
  trangThai: TrangThai;
  ketQua: string;
  ghiChu: string;
}

/* ─── Lưu trữ hồ sơ (Điều 8 QC 2815) ─── */
export type TrangThaiLuuTru = 'chua-nhan' | 'da-nhan' | 'da-luu-kho' | 'da-huy';

export interface LuuTruHoSo {
  id: string;
  hopDongId: string | null;
  soHoSo: string;
  viTriLuuTru: string;
  ngayNhanLuuTru: string;
  nguoiBanGiaoId: string | null;
  nguoiBanGiao: string;
  nguoiNhanId: string | null;
  nguoiNhan: string;
  trangThai: TrangThaiLuuTru;
  thoiHanLuuTru: string;
  ghiChu: string;
}

/* ─── SLA Tracking ─── */
export type TrangThaiSLA = 'dang-chay' | 'dat' | 'vi-pham' | 'huy';

export interface SlaTheoDoi {
  id: string;
  loaiDoiTuong: string;
  doiTuongId: string;
  tenSla: string;
  hanChot: string;
  trangThai: TrangThaiSLA;
  ngayHoanThanh: string;
  canhBaoDaGui: boolean;
  ghiChu: string;
}

/* ─── Kiểm tra khắc phục ─── */
export type TrangThaiKhacPhuc = 'chua-xu-ly' | 'dang-xu-ly' | 'da-hoan-thanh' | 'qua-han';

export interface KiemTraKhacPhuc {
  id: string;
  kiemTraId: string;
  noiDungKienNghi: string;
  hanKhacPhuc: string;
  nguoiPhuTrachId: string | null;
  nguoiPhuTrach: string;
  trangThai: TrangThaiKhacPhuc;
  ketQuaKhacPhuc: string;
  ngayHoanThanh: string;
}

/* ─── Workflow ─── */
export interface WorkflowTrangThai {
  id: string;
  loaiDoiTuong: string;
  tuTrangThai: string;
  denTrangThai: string;
  vaiTroYeuCau: string[];
  dieuKienThem: string;
  moTa: string;
  thuTu: number;
}
