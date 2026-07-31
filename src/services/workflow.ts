import { supabase } from '../lib/supabase';
import type {
  UyQuyen,
  DauThau,
  LienDanh,
  NhiemVuPVQLNN,
  LuuTruHoSo,
  SlaTheoDoi,
  KiemTraKhacPhuc,
  WorkflowTrangThai,
} from '../types';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const num = (v: string) => (v ? Number(v) : null);
const str = (v: string | number | null | undefined) => (v !== null && v !== undefined ? String(v) : null);

// 1. Workflow Transitions
export async function fetchWorkflowRules(loaiDoiTuong: string): Promise<WorkflowTrangThai[]> {
  const { data, error } = await supabase
    .from('workflow_trang_thai')
    .select('*')
    .eq('loai_doi_tuong', loaiDoiTuong)
    .order('thu_tu');
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    loaiDoiTuong: r.loai_doi_tuong ?? '',
    tuTrangThai: r.tu_trang_thai ?? '',
    denTrangThai: r.den_trang_thai ?? '',
    vaiTroYeuCau: r.vai_tro_yeu_cau ?? [],
    dieuKienThem: r.dieu_kien_them ?? '',
    moTa: r.mo_ta ?? '',
    thuTu: r.thu_tu ?? 0,
  }));
}

export async function updateBuocHopDong(hopDongId: string, buocMoi: string): Promise<void> {
  const idNum = Number(hopDongId);
  if (Number.isNaN(idNum)) throw new Error(`Mã hợp đồng không hợp lệ: ${hopDongId}`);

  const { error } = await supabase
    .from('hop_dong')
    .update({ buoc_hien_tai: buocMoi, trang_thai: buocMoi })
    .eq('id', idNum);
  if (!error) return;

  // CSDL chưa chạy migration thêm cột buoc_hien_tai — vẫn ghi được trang_thai.
  if (!error.message?.includes('buoc_hien_tai')) throw new Error(error.message);
  throwIf((await supabase.from('hop_dong').update({ trang_thai: buocMoi }).eq('id', idNum)).error);
}

// 2. Ủy quyền (Delegation)
export async function fetchUyQuyen(): Promise<UyQuyen[]> {
  const { data, error } = await supabase
    .from('uy_quyen')
    .select(`
      *,
      nguoi_uy_quyen:nhan_su!uy_quyen_nguoi_uy_quyen_id_fkey(ho_va_ten),
      nguoi_duoc_uy_quyen:nhan_su!uy_quyen_nguoi_duoc_uy_quyen_id_fkey(ho_va_ten)
    `)
    .order('created_at', { ascending: false });
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    nguoiUyQuyenId: String(r.nguoi_uy_quyen_id),
    nguoiUyQuyen: r.nguoi_uy_quyen?.ho_va_ten || '',
    nguoiDuocUyQuyenId: String(r.nguoi_duoc_uy_quyen_id),
    nguoiDuocUyQuyen: r.nguoi_duoc_uy_quyen?.ho_va_ten || '',
    loaiUyQuyen: r.loai_uy_quyen || '',
    tuNgay: r.tu_ngay || '',
    denNgay: r.den_ngay || '',
    lyDo: r.ly_do || '',
    soQuyetDinh: r.so_quyet_dinh || '',
    trangThai: r.trang_thai || '',
  }));
}

export interface UyQuyenInput {
  nguoiUyQuyenId: string;
  nguoiDuocUyQuyenId: string;
  loaiUyQuyen: string;
  tuNgay: string;
  denNgay: string;
  lyDo: string;
  soQuyetDinh: string;
  trangThai: string;
}

export async function createUyQuyen(i: UyQuyenInput): Promise<void> {
  const { error } = await supabase.from('uy_quyen').insert({
    nguoi_uy_quyen_id: num(i.nguoiUyQuyenId),
    nguoi_duoc_uy_quyen_id: num(i.nguoiDuocUyQuyenId),
    loai_uy_quyen: i.loaiUyQuyen || null,
    tu_ngay: i.tuNgay || null,
    den_ngay: i.denNgay || null,
    ly_do: i.lyDo || null,
    so_quyet_dinh: i.soQuyetDinh || null,
    trang_thai: i.trangThai || 'Hiệu lực',
  });
  throwIf(error);
}

export async function updateUyQuyen(id: string, i: UyQuyenInput): Promise<void> {
  const { error } = await supabase
    .from('uy_quyen')
    .update({
      nguoi_uy_quyen_id: num(i.nguoiUyQuyenId),
      nguoi_duoc_uy_quyen_id: num(i.nguoiDuocUyQuyenId),
      loai_uy_quyen: i.loaiUyQuyen || null,
      tu_ngay: i.tuNgay || null,
      den_ngay: i.denNgay || null,
      ly_do: i.lyDo || null,
      so_quyet_dinh: i.soQuyetDinh || null,
      trang_thai: i.trangThai || null,
    })
    .eq('id', num(id));
  throwIf(error);
}

export interface UyQuyenKyHieuLuc {
  id: string;
  nguoiDuocUyQuyen: string;
  soQuyetDinh: string;
  denNgay: string;
}

/**
 * Đ.6.2 — Kiểm tra ủy quyền ký HĐ còn hiệu lực cho một đơn vị (trước khi đơn vị ký
 * bằng pháp nhân đơn vị). Trả về danh sách ủy quyền loại 'ky-hop-dong'/'toan-quyen'
 * đang hiệu lực mà người được ủy quyền thuộc đơn vị đó; rỗng = chưa có ủy quyền,
 * cần lập ủy quyền riêng trình Viện trưởng ký (nhánh DK2 lưu đồ QT2).
 */
export async function fetchUyQuyenKyHopDong(donViId: string): Promise<UyQuyenKyHieuLuc[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data, error } = await supabase
    .from('uy_quyen')
    .select('id, so_quyet_dinh, tu_ngay, den_ngay, nguoi_duoc:nhan_su!uy_quyen_nguoi_duoc_uy_quyen_id_fkey!inner(ho_va_ten, don_vi_id)')
    .in('loai_uy_quyen', ['ky-hop-dong', 'toan-quyen'])
    .eq('trang_thai', 'hieu-luc')
    .lte('tu_ngay', today)
    .eq('nguoi_duoc.don_vi_id', Number(donViId));
  throwIf(error);
  return (data || [])
    .filter((r: any) => !r.den_ngay || r.den_ngay >= today)
    .map((r: any) => ({
      id: String(r.id),
      nguoiDuocUyQuyen: r.nguoi_duoc?.ho_va_ten ?? '',
      soQuyetDinh: r.so_quyet_dinh || '',
      denNgay: r.den_ngay || '',
    }));
}

export async function deleteUyQuyen(id: string): Promise<void> {
  const { error } = await supabase.from('uy_quyen').delete().eq('id', num(id));
  throwIf(error);
}

// 3. Đấu thầu (Bidding)
export async function fetchDauThau(): Promise<DauThau[]> {
  const { data, error } = await supabase
    .from('dau_thau')
    .select(`
      *,
      khach_hang:chu_dau_tu_id(ten_to_chuc),
      don_vi:don_vi_thuc_hien_id(ten_don_vi),
      nhan_su:nhan_su!dau_thau_nguoi_phu_trach_id_fkey(ho_va_ten),
      chu_tri_hsdt:nhan_su!dau_thau_chu_tri_hsdt_id_fkey(ho_va_ten),
      hop_dong:hop_dong_id(so_hop_dong)
    `)
    .order('created_at', { ascending: false });
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    tenGoiThau: r.ten_goi_thau || '',
    chuDauTuId: r.chu_dau_tu_id ? String(r.chu_dau_tu_id) : null,
    chuDauTu: r.khach_hang?.ten_to_chuc || '',
    donViThucHienId: r.don_vi_thuc_hien_id ? String(r.don_vi_thuc_hien_id) : null,
    donViThucHien: r.don_vi?.ten_don_vi || '',
    hinhThuc: r.hinh_thuc || '',
    giaDuThau: r.gia_du_thau != null ? Number(r.gia_du_thau) : null,
    giaTrungThau: r.gia_trung_thau != null ? Number(r.gia_trung_thau) : null,
    ngayMoThau: r.ngay_mo_thau || '',
    ngayDongThau: r.ngay_dong_thau || '',
    trangThai: r.trang_thai || '',
    hopDongId: r.hop_dong_id ? String(r.hop_dong_id) : null,
    nguoiPhuTrachId: r.nguoi_phu_trach_id ? String(r.nguoi_phu_trach_id) : null,
    nguoiPhuTrach: r.nhan_su?.ho_va_ten || '',
    ghiChu: r.ghi_chu || '',
    chuTriHsdtId: r.chu_tri_hsdt_id ? String(r.chu_tri_hsdt_id) : null,
    chuTriHsdt: r.chu_tri_hsdt?.ho_va_ten || '',
    hsNangLucChung: !!r.hs_nang_luc_chung,
    bcTaiChinh: !!r.bc_tai_chinh,
    ccnnDuThau: !!r.ccnn_du_thau,
  }));
}

export interface DauThauInput {
  tenGoiThau: string;
  chuDauTuId: string;
  donViThucHienId: string;
  hinhThuc: string;
  giaDuThau: string;
  giaTrungThau: string;
  ngayMoThau: string;
  ngayDongThau: string;
  trangThai: string;
  hopDongId: string;
  nguoiPhuTrachId: string;
  ghiChu: string;
  chuTriHsdtId: string;
  hsNangLucChung: boolean;
  bcTaiChinh: boolean;
  ccnnDuThau: boolean;
  dangKyDauMoiId?: string;
}

function dauThauRow(i: DauThauInput) {
  return {
    ten_goi_thau: i.tenGoiThau || null,
    chu_dau_tu_id: num(i.chuDauTuId),
    don_vi_thuc_hien_id: num(i.donViThucHienId),
    hinh_thuc: i.hinhThuc || null,
    gia_du_thau: num(i.giaDuThau),
    gia_trung_thau: num(i.giaTrungThau),
    ngay_mo_thau: i.ngayMoThau || null,
    ngay_dong_thau: i.ngayDongThau || null,
    trang_thai: i.trangThai || null,
    hop_dong_id: num(i.hopDongId),
    nguoi_phu_trach_id: num(i.nguoiPhuTrachId),
    ghi_chu: i.ghiChu || null,
    chu_tri_hsdt_id: num(i.chuTriHsdtId),
    hs_nang_luc_chung: i.hsNangLucChung,
    bc_tai_chinh: i.bcTaiChinh,
    ccnn_du_thau: i.ccnnDuThau,
  };
}

export async function createDauThau(i: DauThauInput): Promise<void> {
  const { data, error } = await supabase.from('dau_thau').insert(dauThauRow(i)).select('id').single();
  throwIf(error);
  if (data && i.dangKyDauMoiId) {
    await supabase.from('dang_ky_dau_moi').update({ dau_thau_id: data.id }).eq('id', num(i.dangKyDauMoiId));
  }
}

export async function updateDauThau(id: string, i: DauThauInput): Promise<void> {
  const { error } = await supabase
    .from('dau_thau')
    .update(dauThauRow(i))
    .eq('id', num(id));
  throwIf(error);
  if (i.dangKyDauMoiId) {
    await supabase.from('dang_ky_dau_moi').update({ dau_thau_id: num(id) }).eq('id', num(i.dangKyDauMoiId));
  }
}

export async function deleteDauThau(id: string): Promise<void> {
  const { error } = await supabase.from('dau_thau').delete().eq('id', num(id));
  throwIf(error);
}

import { recordAuditLog } from './auditLog';

export async function updateTrangThaiDauThau(
  id: string,
  newTrangThai: string,
  giaTrungThau?: number | null,
  userTitle = 'KHKT / Cán bộ phụ trách',
): Promise<void> {
  const payload: any = { trang_thai: newTrangThai };
  if (giaTrungThau !== undefined && giaTrungThau !== null) {
    payload.gia_trung_thau = giaTrungThau;
  }
  const { error } = await supabase.from('dau_thau').update(payload).eq('id', num(id));
  throwIf(error);

  recordAuditLog({
    loaiDoiTuong: 'dau_thau',
    doiTuongId: String(id),
    tuTrangThai: '',
    denTrangThai: newTrangThai,
    tenNguoiThucHien: userTitle,
    ghiChu: giaTrungThau ? `Cập nhật trạng thái thầu sang "${newTrangThai}" với giá trúng thầu: ${giaTrungThau.toLocaleString('vi-VN')} triệu VNĐ` : `Cập nhật trạng thái gói thầu sang "${newTrangThai}"`,
  });
}

// 4. Liên danh
export async function fetchLienDanh(hopDongId: string): Promise<LienDanh[]> {
  const { data, error } = await supabase
    .from('lien_danh')
    .select('*')
    .eq('hop_dong_id', num(hopDongId))
    .order('created_at', { ascending: false });
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    hopDongId: String(r.hop_dong_id),
    tenDoiTac: r.ten_doi_tac || '',
    maSoThue: r.ma_so_thue || '',
    tyLePhanTram: Number(r.ty_le_phan_tram) || 0,
    vaiTro: r.vai_tro || '',
    giaTriPhanViec: r.gia_tri_phan_viec != null ? Number(r.gia_tri_phan_viec) : null,
    ghiChu: r.ghi_chu || '',
    soVanBanKhkt: r.so_van_ban_khkt || '',
    ngayThongBaoKhkt: r.ngay_thong_bao_khkt || '',
  }));
}

export interface LienDanhInput {
  hopDongId: string;
  tenDoiTac: string;
  maSoThue: string;
  tyLePhanTram: string;
  vaiTro: string;
  giaTriPhanViec: string;
  ghiChu: string;
  soVanBanKhkt: string;
  ngayThongBaoKhkt: string;
}

function lienDanhRow(i: LienDanhInput) {
  return {
    hop_dong_id: num(i.hopDongId),
    ten_doi_tac: i.tenDoiTac || null,
    ma_so_thue: i.maSoThue || null,
    ty_le_phan_tram: num(i.tyLePhanTram),
    vai_tro: i.vaiTro || null,
    gia_tri_phan_viec: num(i.giaTriPhanViec),
    ghi_chu: i.ghiChu || null,
    so_van_ban_khkt: i.soVanBanKhkt || null,
    ngay_thong_bao_khkt: i.ngayThongBaoKhkt || null,
  };
}

export async function createLienDanh(i: LienDanhInput): Promise<void> {
  const { error } = await supabase.from('lien_danh').insert(lienDanhRow(i));
  throwIf(error);
}

export async function updateLienDanh(id: string, i: LienDanhInput): Promise<void> {
  const { error } = await supabase.from('lien_danh').update(lienDanhRow(i)).eq('id', num(id));
  throwIf(error);
}

export async function deleteLienDanh(id: string): Promise<void> {
  const { error } = await supabase.from('lien_danh').delete().eq('id', num(id));
  throwIf(error);
}

// 5. Nhiệm vụ PVQLNN
export async function fetchNhiemVuPVQLNN(): Promise<NhiemVuPVQLNN[]> {
  const { data, error } = await supabase
    .from('nhiem_vu_pvqlnn')
    .select(`
      *,
      don_vi:don_vi_id(ten_don_vi),
      nhan_su:nguoi_phu_trach_id(ho_va_ten)
    `)
    .order('created_at', { ascending: false });
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    tenNhiemVu: r.ten_nhiem_vu || '',
    coQuanGiao: r.co_quan_giao || '',
    soVanBanGiao: r.so_van_ban_giao || '',
    ngayGiao: r.ngay_giao || '',
    hanHoanThanh: r.han_hoan_thanh || '',
    donViId: r.don_vi_id ? String(r.don_vi_id) : null,
    donVi: r.don_vi?.ten_don_vi || '',
    nguoiPhuTrachId: r.nguoi_phu_trach_id ? String(r.nguoi_phu_trach_id) : null,
    nguoiPhuTrach: r.nhan_su?.ho_va_ten || '',
    kinhPhi: r.kinh_phi != null ? Number(r.kinh_phi) : null,
    nguonKinhPhi: r.nguon_kinh_phi || '',
    trangThai: r.trang_thai || '',
    ketQua: r.ket_qua || '',
    ghiChu: r.ghi_chu || '',
  }));
}

export interface NhiemVuPVQLNNInput {
  tenNhiemVu: string;
  coQuanGiao: string;
  soVanBanGiao: string;
  ngayGiao: string;
  hanHoanThanh: string;
  donViId: string;
  nguoiPhuTrachId: string;
  kinhPhi: string;
  nguonKinhPhi: string;
  trangThai: string;
  ketQua: string;
  ghiChu: string;
}

export async function createNhiemVuPVQLNN(i: NhiemVuPVQLNNInput): Promise<void> {
  const { error } = await supabase.from('nhiem_vu_pvqlnn').insert({
    ten_nhiem_vu: i.tenNhiemVu || null,
    co_quan_giao: i.coQuanGiao || null,
    so_van_ban_giao: i.soVanBanGiao || null,
    ngay_giao: i.ngayGiao || null,
    han_hoan_thanh: i.hanHoanThanh || null,
    don_vi_id: num(i.donViId),
    nguoi_phu_trach_id: num(i.nguoiPhuTrachId),
    kinh_phi: num(i.kinhPhi),
    nguon_kinh_phi: i.nguonKinhPhi || null,
    trang_thai: i.trangThai || null,
    ket_qua: i.ketQua || null,
    ghi_chu: i.ghiChu || null,
  });
  throwIf(error);
}

export async function updateNhiemVuPVQLNN(id: string, i: NhiemVuPVQLNNInput): Promise<void> {
  const { error } = await supabase
    .from('nhiem_vu_pvqlnn')
    .update({
      ten_nhiem_vu: i.tenNhiemVu || null,
      co_quan_giao: i.coQuanGiao || null,
      so_van_ban_giao: i.soVanBanGiao || null,
      ngay_giao: i.ngayGiao || null,
      han_hoan_thanh: i.hanHoanThanh || null,
      don_vi_id: num(i.donViId),
      nguoi_phu_trach_id: num(i.nguoiPhuTrachId),
      kinh_phi: num(i.kinhPhi),
      nguon_kinh_phi: i.nguonKinhPhi || null,
      trang_thai: i.trangThai || null,
      ket_qua: i.ketQua || null,
      ghi_chu: i.ghiChu || null,
    })
    .eq('id', num(id));
  throwIf(error);
}

export async function deleteNhiemVuPVQLNN(id: string): Promise<void> {
  const { error } = await supabase.from('nhiem_vu_pvqlnn').delete().eq('id', num(id));
  throwIf(error);
}

// 6. Lưu trữ hồ sơ
export async function fetchLuuTruHoSo(hopDongId?: string): Promise<LuuTruHoSo[]> {
  let query = supabase
    .from('luu_tru_ho_so')
    .select(`
      *,
      nguoi_ban_giao:nhan_su!luu_tru_ho_so_nguoi_ban_giao_id_fkey(ho_va_ten),
      nguoi_nhan:nhan_su!luu_tru_ho_so_nguoi_nhan_id_fkey(ho_va_ten)
    `)
    .order('created_at', { ascending: false });

  if (hopDongId) {
    query = query.eq('hop_dong_id', num(hopDongId));
  }

  const { data, error } = await query;
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    hopDongId: r.hop_dong_id ? String(r.hop_dong_id) : null,
    soHoSo: r.so_ho_so || '',
    viTriLuuTru: r.vi_tri_luu_tru || '',
    ngayNhanLuuTru: r.ngay_nhan_luu_tru || '',
    nguoiBanGiaoId: r.nguoi_ban_giao_id ? String(r.nguoi_ban_giao_id) : null,
    nguoiBanGiao: r.nguoi_ban_giao?.ho_va_ten || '',
    nguoiNhanId: r.nguoi_nhan_id ? String(r.nguoi_nhan_id) : null,
    nguoiNhan: r.nguoi_nhan?.ho_va_ten || '',
    trangThai: r.trang_thai || '',
    thoiHanLuuTru: r.thoi_han_luu_tru || '',
    ghiChu: r.ghi_chu || '',
  }));
}

export interface LuuTruHoSoInput {
  hopDongId: string;
  soHoSo: string;
  viTriLuuTru: string;
  ngayNhanLuuTru: string;
  nguoiBanGiaoId: string;
  nguoiNhanId: string;
  trangThai: string;
  thoiHanLuuTru: string;
  ghiChu: string;
}

export async function createLuuTruHoSo(i: LuuTruHoSoInput): Promise<void> {
  const { error } = await supabase.from('luu_tru_ho_so').insert({
    hop_dong_id: num(i.hopDongId),
    so_ho_so: i.soHoSo || null,
    vi_tri_luu_tru: i.viTriLuuTru || null,
    ngay_nhan_luu_tru: i.ngayNhanLuuTru || null,
    nguoi_ban_giao_id: num(i.nguoiBanGiaoId),
    nguoi_nhan_id: num(i.nguoiNhanId),
    trang_thai: i.trangThai || null,
    thoi_han_luu_tru: i.thoiHanLuuTru || null,
    ghi_chu: i.ghiChu || null,
  });
  throwIf(error);
}

export async function updateLuuTruHoSo(id: string, i: LuuTruHoSoInput): Promise<void> {
  const { error } = await supabase
    .from('luu_tru_ho_so')
    .update({
      hop_dong_id: num(i.hopDongId),
      so_ho_so: i.soHoSo || null,
      vi_tri_luu_tru: i.viTriLuuTru || null,
      ngay_nhan_luu_tru: i.ngayNhanLuuTru || null,
      nguoi_ban_giao_id: num(i.nguoiBanGiaoId),
      nguoi_nhan_id: num(i.nguoiNhanId),
      trang_thai: i.trangThai || null,
      thoi_han_luu_tru: i.thoiHanLuuTru || null,
      ghi_chu: i.ghiChu || null,
    })
    .eq('id', num(id));
  throwIf(error);
}

export async function deleteLuuTruHoSo(id: string): Promise<void> {
  const { error } = await supabase.from('luu_tru_ho_so').delete().eq('id', num(id));
  throwIf(error);
}

// 7. SLA Tracking
export async function fetchSlaTheoDoi(loaiDoiTuong?: string, doiTuongId?: string): Promise<SlaTheoDoi[]> {
  let query = supabase
    .from('sla_theo_doi')
    .select('*')
    .order('created_at', { ascending: false });

  if (loaiDoiTuong) query = query.eq('loai_doi_tuong', loaiDoiTuong);
  if (doiTuongId) query = query.eq('doi_tuong_id', num(doiTuongId));

  const { data, error } = await query;
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    loaiDoiTuong: r.loai_doi_tuong || '',
    doiTuongId: String(r.doi_tuong_id),
    tenSla: r.ten_sla || '',
    hanChot: r.han_chot || '',
    trangThai: r.trang_thai || '',
    ngayHoanThanh: r.ngay_hoan_thanh || '',
    canhBaoDaGui: !!r.canh_bao_da_gui,
    ghiChu: r.ghi_chu || '',
  }));
}

export async function createSlaTheoDoi(input: { loaiDoiTuong: string; doiTuongId: string; tenSla: string; hanChot: string; ghiChu?: string }): Promise<void> {
  const { error } = await supabase.from('sla_theo_doi').insert({
    loai_doi_tuong: input.loaiDoiTuong,
    doi_tuong_id: num(input.doiTuongId),
    ten_sla: input.tenSla,
    han_chot: input.hanChot || null,
    ghi_chu: input.ghiChu || null,
    trang_thai: 'Đang theo dõi'
  });
  throwIf(error);
}

export async function updateSlaTrangThai(id: string, trangThai: string, ngayHoanThanh?: string): Promise<void> {
  const { error } = await supabase
    .from('sla_theo_doi')
    .update({ 
      trang_thai: trangThai,
      ngay_hoan_thanh: ngayHoanThanh || null 
    })
    .eq('id', num(id));
  throwIf(error);
}

// 8. Kiểm tra khắc phục
export async function fetchKiemTraKhacPhuc(kiemTraId: string): Promise<KiemTraKhacPhuc[]> {
  const { data, error } = await supabase
    .from('kiem_tra_khac_phuc')
    .select(`
      *,
      nguoi_phu_trach:nhan_su!kiem_tra_khac_phuc_nguoi_phu_trach_id_fkey(ho_va_ten)
    `)
    .eq('kiem_tra_id', num(kiemTraId))
    .order('created_at', { ascending: false });
  throwIf(error);
  return (data || []).map((r: any) => ({
    id: String(r.id),
    kiemTraId: String(r.kiem_tra_id),
    noiDungKienNghi: r.noi_dung_kien_nghi || '',
    hanKhacPhuc: r.han_khac_phuc || '',
    nguoiPhuTrachId: r.nguoi_phu_trach_id ? String(r.nguoi_phu_trach_id) : null,
    nguoiPhuTrach: r.nguoi_phu_trach?.ho_va_ten || '',
    trangThai: r.trang_thai || '',
    ketQuaKhacPhuc: r.ket_qua_khac_phuc || '',
    ngayHoanThanh: r.ngay_hoan_thanh || '',
  }));
}

export interface KiemTraKhacPhucInput {
  kiemTraId: string;
  noiDungKienNghi: string;
  hanKhacPhuc: string;
  nguoiPhuTrachId: string;
  trangThai: string;
  ketQuaKhacPhuc: string;
  ngayHoanThanh: string;
}

export async function createKiemTraKhacPhuc(i: KiemTraKhacPhucInput): Promise<void> {
  const { error } = await supabase.from('kiem_tra_khac_phuc').insert({
    kiem_tra_id: num(i.kiemTraId),
    noi_dung_kien_nghi: i.noiDungKienNghi || null,
    han_khac_phuc: i.hanKhacPhuc || null,
    nguoi_phu_trach_id: num(i.nguoiPhuTrachId),
    trang_thai: i.trangThai || null,
    ket_qua_khac_phuc: i.ketQuaKhacPhuc || null,
    ngay_hoan_thanh: i.ngayHoanThanh || null,
  });
  throwIf(error);
}

export async function updateKiemTraKhacPhuc(id: string, i: KiemTraKhacPhucInput): Promise<void> {
  const { error } = await supabase
    .from('kiem_tra_khac_phuc')
    .update({
      kiem_tra_id: num(i.kiemTraId),
      noi_dung_kien_nghi: i.noiDungKienNghi || null,
      han_khac_phuc: i.hanKhacPhuc || null,
      nguoi_phu_trach_id: num(i.nguoiPhuTrachId),
      trang_thai: i.trangThai || null,
      ket_qua_khac_phuc: i.ketQuaKhacPhuc || null,
      ngay_hoan_thanh: i.ngayHoanThanh || null,
    })
    .eq('id', num(id));
  throwIf(error);
}

export async function deleteKiemTraKhacPhuc(id: string): Promise<void> {
  const { error } = await supabase.from('kiem_tra_khac_phuc').delete().eq('id', num(id));
  throwIf(error);
}
