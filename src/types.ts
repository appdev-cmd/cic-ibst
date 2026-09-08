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
  nguoiTaoId: string | null;
  nguoiTao: string; // tên người tạo bản ghi (hiển thị) — tự động gán ở CSDL, không sửa qua form
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
  nguoiDuyetId: string | null;
  nguoiDuyet: string; // tên người phê duyệt Điều 6.1 (hiển thị)
  trangThaiQuyetToan: 'chua-quyet-toan' | 'da-quyet-toan';
  ngayQuyetToan: string;
  hanChungTuQuyetToan: string; // hạn TCKT yêu cầu nộp chứng từ quyết toán; '' = chưa đặt hạn
  loaiDacThu: LoaiDacThu | null;
  phanVienXa: boolean;
  giamTheoYeuCauDonVi: boolean;
  /** Đ.6.1 điều kiện 2 — kỹ thuật phức tạp/chính trị/pháp lý quan trọng/Bộ giao: buộc trình VT bất kể giá trị. */
  phucTap: boolean;
  /** Điều 6.1 — cấp ký hợp đồng: Viện ký hay đơn vị ký theo phân cấp/ủy quyền. */
  capKy: CapKy | null;
  /** Đ.3.o + Đ.7.1c — mô hình quản lý tập trung tại đơn vị (bắt buộc với TVGS, TVQLDA, thi công). */
  quanLyTapTrung: boolean;
  /** Đ.8.2 — đóng dấu sơ bộ khi HĐ chưa ký đủ các bên. */
  dongDauSoBo: boolean;
  ngayDongDauSoBo: string;
  soVbChapThuanDauSoBo: string;
  /** Đ.8.3 — phó đơn vị được giao quản lý khi Trưởng đơn vị chính là chủ trì HĐ. */
  phoDonViQuanLyId: string | null;
  phoDonViQuanLy: string;
  buocHienTai: string;
  fileDuThaoUrl?: string | null;
  tenFileDuThao?: string | null;
}

/** Luồng trình/duyệt Viện trưởng Đ.6.1 — từ migration 0026 bắt buộc qua bước KHKT thẩm tra (Đ.9.6c). */
export type TrangThaiPheDuyet = 'khong-ap-dung' | 'chua-trinh' | 'cho-khkt-tham-tra' | 'da-trinh' | 'da-duyet';

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
  /** Chủ trì lập HSDT do GĐ Đơn vị chỉ định (Đ.5.1d) */
  chuTriHsdtId: string | null;
  chuTriHsdt: string;
  /** Checklist thu thập hồ sơ năng lực (Đ.5.1d, 9.6g) */
  hsNangLucChung: boolean;
  bcTaiChinh: boolean;
  ccnnDuThau: boolean;
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
  /** Đ.4.7 — PHẢI thông báo bằng văn bản cho P.KHKT trước khi ký thỏa thuận liên danh. */
  soVanBanKhkt: string;
  ngayThongBaoKhkt: string;
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

/* ============================================================
 * PH5 — Hồ sơ CBVC mở rộng + Đảng - Đoàn thể
 * (xem docs/ke-hoach-hoan-thien-ph5-nhan-su-dang-doan-the.md)
 * ============================================================ */

export interface QuaTrinhCongTac {
  id: string;
  nhanSuId: string;
  loai: string;
  tieuDe: string;
  soQuyetDinh: string;
  ngayKy: string;
  ngayHieuLuc: string;
  ngayKetThuc: string;
  donViId: string | null;
  donVi: string;
  chucVu: string;
  moTa: string;
  tepDinhKem: string;
}

export const LOAI_QUA_TRINH_CONG_TAC: { ma: string; ten: string }[] = [
  { ma: 'tuyen-dung', ten: 'Tuyển dụng' },
  { ma: 'dieu-dong', ten: 'Điều động' },
  { ma: 'bo-nhiem', ten: 'Bổ nhiệm' },
  { ma: 'mien-nhiem', ten: 'Miễn nhiệm' },
  { ma: 'nang-luong', ten: 'Nâng lương' },
  { ma: 'nang-ngach', ten: 'Nâng ngạch' },
  { ma: 'biet-phai', ten: 'Biệt phái' },
  { ma: 'nghi-huu', ten: 'Nghỉ hưu' },
  { ma: 'thoi-viec', ten: 'Thôi việc' },
  { ma: 'khac', ten: 'Khác' },
];

export interface BangCap {
  id: string;
  nhanSuId: string;
  loai: string;
  ten: string;
  chuyenNganh: string;
  coSoDaoTao: string;
  xepLoai: string;
  namTotNghiep: number | null;
  ngayCap: string;
  ngayHetHan: string;
}

export const LOAI_BANG_CAP: { ma: string; ten: string }[] = [
  { ma: 'bang-cap', ten: 'Bằng cấp chuyên môn' },
  { ma: 'ly-luan-chinh-tri', ten: 'Lý luận chính trị' },
  { ma: 'quan-ly-nha-nuoc', ten: 'Quản lý nhà nước' },
  { ma: 'ngoai-ngu', ten: 'Ngoại ngữ' },
  { ma: 'tin-hoc', ten: 'Tin học' },
  { ma: 'an-toan-lao-dong', ten: 'An toàn lao động' },
  { ma: 'khac', ten: 'Khác' },
];

export interface HopDongLaoDong {
  id: string;
  nhanSuId: string;
  soHopDong: string;
  loaiHopDong: string;
  ngayKy: string;
  tuNgay: string;
  denNgay: string;
  luongCoBan: number | null;
  luongBhxh: number | null;
  trangThai: string;
  ghiChu: string;
}

export const LOAI_HOP_DONG_LAO_DONG: { ma: string; ten: string }[] = [
  { ma: 'thu-viec', ten: 'Thử việc' },
  { ma: 'xac-dinh-thoi-han', ten: 'Xác định thời hạn' },
  { ma: 'khong-xac-dinh', ten: 'Không xác định thời hạn' },
  { ma: 'vien-chuc-tap-su', ten: 'Viên chức tập sự' },
  { ma: 'vien-chuc', ten: 'Viên chức' },
  { ma: 'khoan-viec', ten: 'Khoán việc' },
];

export interface LuongNgachBac {
  id: string;
  nhanSuId: string;
  ngayHieuLuc: string;
  ngach: string;
  maNgach: string;
  bac: string;
  heSoLuong: number;
  phuCapChucVu: number;
  phuCapTnvk: number;
  loaiThayDoi: string;
  soQuyetDinh: string;
  lyDo: string;
}

export const LOAI_THAY_DOI_LUONG: { ma: string; ten: string }[] = [
  { ma: 'xep-lan-dau', ten: 'Xếp lần đầu' },
  { ma: 'nang-bac-thuong-xuyen', ten: 'Nâng bậc thường xuyên' },
  { ma: 'nang-bac-truoc-han', ten: 'Nâng bậc trước hạn' },
  { ma: 'nang-ngach', ten: 'Nâng ngạch' },
  { ma: 'dieu-chinh', ten: 'Điều chỉnh khác' },
];

export interface DanhGiaCbvc {
  id: string;
  nhanSuId: string;
  nam: number;
  ky: string;
  tuXepLoai: string;
  xepLoai: string;
  diem: number | null;
  nguoiDanhGiaId: string | null;
  nhanXet: string;
  trangThai: string;
}

export const XEP_LOAI_DANH_GIA: { ma: string; ten: string }[] = [
  { ma: 'htxsnv', ten: 'Hoàn thành xuất sắc nhiệm vụ' },
  { ma: 'httnv', ten: 'Hoàn thành tốt nhiệm vụ' },
  { ma: 'htnv', ten: 'Hoàn thành nhiệm vụ' },
  { ma: 'khtnv', ten: 'Không hoàn thành nhiệm vụ' },
];

export interface NghienCuuSinh {
  id: string;
  nhanSuId: string | null;
  hoTen: string;
  ngayNhapHoc: string;
  gvHuongDan: string;
  tenDeTai: string;
  donViId: string | null;
  trangThaiHoiDong: string;
  ghiChu: string;
}

export const TRANG_THAI_HOI_DONG_NCS: { ma: string; ten: string }[] = [
  { ma: 'chua-thanh-lap', ten: 'Chưa thành lập' },
  { ma: 'bao-ve-co-so', ten: 'Bảo vệ cơ sở' },
  { ma: 'bao-ve-cap-vien', ten: 'Bảo vệ cấp Viện' },
  { ma: 'da-cap-bang', ten: 'Đã cấp bằng' },
];

/* ─── Đảng - Đoàn thể ─── */

export type LoaiToChucDoanThe = 'dang' | 'doan-tn' | 'cong-doan' | 'ccb' | 'nu-cong';

export const LOAI_TO_CHUC_DOAN_THE: { ma: LoaiToChucDoanThe; ten: string }[] = [
  { ma: 'dang', ten: 'Tổ chức Đảng' },
  { ma: 'doan-tn', ten: 'Đoàn Thanh niên' },
  { ma: 'cong-doan', ten: 'Công đoàn' },
  { ma: 'ccb', ten: 'Hội Cựu chiến binh' },
  { ma: 'nu-cong', ten: 'Ban Nữ công' },
];

export interface ToChucDoanThe {
  id: string;
  loai: LoaiToChucDoanThe;
  cap: string;
  ten: string;
  ma: string;
  toChucChaId: string | null;
  donViId: string | null;
  donVi: string;
  nguoiDungDauId: string | null;
  nguoiDungDau: string;
  phoId: string | null;
  pho: string;
  ngayThanhLap: string;
  nhiemKy: string;
  trangThai: string;
  thuTu: number;
  soDangVien: number;
}

export interface DangVien {
  id: string;
  nhanSuId: string;
  hoTen: string;
  donVi: string;
  toChucId: string;
  toChuc: string;
  soTheDang: string;
  ngayVaoDangDuBi: string;
  ngayVaoDangChinhThuc: string;
  noiKetNap: string;
  nguoiGioiThieu1: string;
  nguoiGioiThieu2: string;
  chucVuDang: string;
  trinhDoLyLuan: string;
  trangThai: string;
  ghiChu: string;
}

export const TRANG_THAI_DANG_VIEN: { ma: string; ten: string }[] = [
  { ma: 'dang-sinh-hoat', ten: 'Đang sinh hoạt' },
  { ma: 'mien-sinh-hoat', ten: 'Miễn sinh hoạt' },
  { ma: 'chuyen-di', ten: 'Chuyển sinh hoạt đi' },
  { ma: 'khai-tru', ten: 'Khai trừ' },
  { ma: 'xoa-ten', ten: 'Xóa tên' },
  { ma: 'tu-tran', ten: 'Từ trần' },
];

export interface DoanVienHoiVien {
  id: string;
  nhanSuId: string;
  hoTen: string;
  toChucId: string;
  loai: LoaiToChucDoanThe;
  soThe: string;
  ngayKetNap: string;
  chucVu: string;
  trangThai: string;
}

export const BUOC_PHAT_TRIEN_DANG: { ma: string; ten: string }[] = [
  { ma: 'quan-chung-uu-tu', ten: '1. Quần chúng ưu tú' },
  { ma: 'hoc-lop-nhan-thuc', ten: '2. Học lớp nhận thức về Đảng' },
  { ma: 'tham-tra-ly-lich', ten: '3. Thẩm tra lý lịch' },
  { ma: 'chi-bo-de-nghi', ten: '4. Chi bộ đề nghị kết nạp' },
  { ma: 'dang-uy-xet', ten: '5. Đảng ủy xét, ra quyết định' },
  { ma: 'ket-nap-du-bi', ten: '6. Kết nạp đảng viên dự bị' },
  { ma: 'hoc-lop-dang-vien-moi', ten: '7. Học lớp đảng viên mới' },
  { ma: 'chuyen-chinh-thuc', ten: '8. Chuyển đảng chính thức' },
];

export interface PhatTrienDang {
  id: string;
  nhanSuId: string;
  hoTen: string;
  donVi: string;
  toChucId: string;
  toChuc: string;
  buocHienTai: string;
  ngayBatDau: string;
  ngayDuKienKetNap: string;
  nguoiTheoDoiId: string | null;
  nguoiTheoDoi: string;
  ghiChu: string;
  trangThai: string;
}

export interface PhatTrienDangBuoc {
  id: string;
  phatTrienId: string;
  buoc: string;
  ngayHoanThanh: string;
  soVanBan: string;
  ghiChu: string;
}

export interface SinhHoatDinhKy {
  id: string;
  toChucId: string;
  toChuc: string;
  ky: string;
  ngayHop: string;
  diaDiem: string;
  chuTriId: string | null;
  chuTri: string;
  thuKyId: string | null;
  chuyenDe: string;
  noiDung: string;
  nghiQuyet: string;
  soBienBan: string;
  trangThai: string;
  soThamGia: number;
}

export interface DiemDanhSinhHoat {
  id: string;
  sinhHoatId: string;
  nhanSuId: string;
  hoTen: string;
  coMat: string;
  lyDo: string;
}

export interface ThuPhiDoanThe {
  id: string;
  nhanSuId: string;
  hoTen: string;
  toChucId: string;
  loaiPhi: string;
  ky: string;
  mucDong: number;
  soTienPhaiNop: number;
  soTienDaNop: number;
  ngayNop: string;
  hinhThuc: string;
  trangThai: string;
}

export const LOAI_PHI_DOAN_THE: { ma: string; ten: string }[] = [
  { ma: 'dang-phi', ten: 'Đảng phí' },
  { ma: 'doan-phi', ten: 'Đoàn phí' },
  { ma: 'cong-doan-phi', ten: 'Công đoàn phí' },
];

export interface KhenThuongKyLuat {
  id: string;
  doiTuong: string;
  nhanSuId: string | null;
  hoTen: string;
  donViId: string | null;
  donVi: string;
  phamVi: string;
  loai: 'khen-thuong' | 'ky-luat';
  hinhThuc: string;
  capQuyetDinh: string;
  soQuyetDinh: string;
  ngayQuyetDinh: string;
  nam: number | null;
  lyDo: string;
}

export const PHAM_VI_KHEN_THUONG: { ma: string; ten: string }[] = [
  { ma: 'chinh-quyen', ten: 'Chính quyền' },
  { ma: 'dang', ten: 'Đảng' },
  { ma: 'cong-doan', ten: 'Công đoàn' },
  { ma: 'doan-tn', ten: 'Đoàn Thanh niên' },
];

export interface ThiDua {
  id: string;
  doiTuong: string;
  nhanSuId: string | null;
  hoTen: string;
  donViId: string | null;
  donVi: string;
  nam: number;
  danhHieuDangKy: string;
  danhHieuDat: string;
  trangThai: string;
}
