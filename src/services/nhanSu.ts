// Hồ sơ CBVC mở rộng: quá trình công tác, bằng cấp, HĐLĐ, ngạch/bậc lương,
// đánh giá xếp loại. Tách khỏi org.ts (org.ts giữ CRUD cơ bản nhan_su/don_vi
// dùng chung toàn hệ thống — xem docs/ke-hoach-hoan-thien-ph5-nhan-su-dang-doan-the.md).
import { supabase } from '../lib/supabase';
import type {
  QuaTrinhCongTac,
  BangCap,
  HopDongLaoDong,
  LuongNgachBac,
  DanhGiaCbvc,
} from '../types';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
const str = (v: string) => v || null;
const num = (v: string | number | null | undefined) => (v === '' || v == null ? null : Number(v));

// ─── Hồ sơ mở rộng của 1 CBVC (các trường bổ sung ở 0028) ───

export interface NhanSuHoSoMoRong {
  id?: string;
  hoVaTen?: string;
  maDinhDanh?: string;
  email?: string;
  soDienThoai?: string;
  hocVi?: string;
  chucDanh?: string;
  tenDonVi?: string;
  heSoLuong?: number | null;
  phuCapChucVu?: number | null;
  trangThai?: string;
  ngaySinh: string;
  gioiTinh: string;
  queQuan: string;
  diaChiThuongTru: string;
  diaChiHienNay: string;
  danToc: string;
  tonGiao: string;
  soDinhDanhCaNhan: string;
  ngayCapCccd: string;
  noiCapCccd: string;
  tinhTrangHonNhan: string;
  soBhxh: string;
  maSoThue: string;
  soTaiKhoan: string;
  nganHang: string;
  lienHeKhanCap: string;
  sdtKhanCap: string;
  hocHam: string;
  chuyenNganh: string;
  lyLuanChinhTri: string;
  quanLyNhaNuoc: string;
  ngach: string;
  ngayVaoLam: string;
  ngayNghiViec: string;
}

export async function fetchNhanSuHoSoMoRong(nhanSuId: string): Promise<NhanSuHoSoMoRong> {
  const { data, error } = await supabase
    .from('nhan_su')
    .select(
      `id, ho_va_ten, ma_dinh_danh, email, so_dien_thoai, hoc_vi, chuc_danh, he_so_luong, phu_cap_chuc_vu, trang_thai,
       don_vi!nhan_su_don_vi_id_fkey(ten_don_vi),
       ngay_sinh, gioi_tinh, que_quan, dia_chi_thuong_tru, dia_chi_hien_nay, dan_toc, ton_giao,
       so_dinh_danh_ca_nhan, ngay_cap_cccd, noi_cap_cccd, tinh_trang_hon_nhan,
       so_bhxh, ma_so_thue, so_tai_khoan, ngan_hang, lien_he_khan_cap, sdt_khan_cap,
       hoc_ham, chuyen_nganh, ly_luan_chinh_tri, quan_ly_nha_nuoc, ngach, ngay_vao_lam, ngay_nghi_viec`,
    )
    .eq('id', Number(nhanSuId))
    .single();
  throwIf(error);
  const r = data as any;
  return {
    id: String(r?.id ?? ''),
    hoVaTen: r?.ho_va_ten ?? '',
    maDinhDanh: r?.ma_dinh_danh ?? '',
    email: r?.email ?? '',
    soDienThoai: r?.so_dien_thoai ?? '',
    hocVi: r?.hoc_vi ?? '',
    chucDanh: r?.chuc_danh ?? '',
    tenDonVi: r?.don_vi?.ten_don_vi ?? '',
    heSoLuong: r?.he_so_luong != null ? Number(r.he_so_luong) : null,
    phuCapChucVu: r?.phu_cap_chuc_vu != null ? Number(r.phu_cap_chuc_vu) : null,
    trangThai: r?.trang_thai ?? 'dang-lam-viec',
    ngaySinh: r?.ngay_sinh ?? '',
    gioiTinh: r?.gioi_tinh ?? '',
    queQuan: r?.que_quan ?? '',
    diaChiThuongTru: r?.dia_chi_thuong_tru ?? '',
    diaChiHienNay: r?.dia_chi_hien_nay ?? '',
    danToc: r?.dan_toc ?? '',
    tonGiao: r?.ton_giao ?? '',
    soDinhDanhCaNhan: r?.so_dinh_danh_ca_nhan ?? '',
    ngayCapCccd: r?.ngay_cap_cccd ?? '',
    noiCapCccd: r?.noi_cap_cccd ?? '',
    tinhTrangHonNhan: r?.tinh_trang_hon_nhan ?? '',
    soBhxh: r?.so_bhxh ?? '',
    maSoThue: r?.ma_so_thue ?? '',
    soTaiKhoan: r?.so_tai_khoan ?? '',
    nganHang: r?.ngan_hang ?? '',
    lienHeKhanCap: r?.lien_he_khan_cap ?? '',
    sdtKhanCap: r?.sdt_khan_cap ?? '',
    hocHam: r?.hoc_ham ?? '',
    chuyenNganh: r?.chuyen_nganh ?? '',
    lyLuanChinhTri: r?.ly_luan_chinh_tri ?? '',
    quanLyNhaNuoc: r?.quan_ly_nha_nuoc ?? '',
    ngach: r?.ngach ?? '',
    ngayVaoLam: r?.ngay_vao_lam ?? '',
    ngayNghiViec: r?.ngay_nghi_viec ?? '',
  };
}

export async function updateNhanSuHoSoMoRong(nhanSuId: string, input: NhanSuHoSoMoRong) {
  const { error } = await supabase
    .from('nhan_su')
    .update({
      ngay_sinh: str(input.ngaySinh),
      gioi_tinh: str(input.gioiTinh),
      que_quan: str(input.queQuan),
      dia_chi_thuong_tru: str(input.diaChiThuongTru),
      dia_chi_hien_nay: str(input.diaChiHienNay),
      dan_toc: str(input.danToc),
      ton_giao: str(input.tonGiao),
      so_dinh_danh_ca_nhan: str(input.soDinhDanhCaNhan),
      ngay_cap_cccd: str(input.ngayCapCccd),
      noi_cap_cccd: str(input.noiCapCccd),
      tinh_trang_hon_nhan: str(input.tinhTrangHonNhan),
      so_bhxh: str(input.soBhxh),
      ma_so_thue: str(input.maSoThue),
      so_tai_khoan: str(input.soTaiKhoan),
      ngan_hang: str(input.nganHang),
      lien_he_khan_cap: str(input.lienHeKhanCap),
      sdt_khan_cap: str(input.sdtKhanCap),
      hoc_ham: str(input.hocHam),
      chuyen_nganh: str(input.chuyenNganh),
      ly_luan_chinh_tri: str(input.lyLuanChinhTri),
      quan_ly_nha_nuoc: str(input.quanLyNhaNuoc),
      ngach: str(input.ngach),
      ngay_vao_lam: str(input.ngayVaoLam),
      ngay_nghi_viec: str(input.ngayNghiViec),
    })
    .eq('id', Number(nhanSuId));
  throwIf(error);
}

// ─── Quá trình công tác ───

export async function fetchQuaTrinhCongTac(nhanSuId: string): Promise<QuaTrinhCongTac[]> {
  const { data, error } = await supabase
    .from('qua_trinh_cong_tac')
    .select('id, loai, tieu_de, so_quyet_dinh, ngay_ky, ngay_hieu_luc, ngay_ket_thuc, chuc_vu, mo_ta, don_vi_id, don_vi:don_vi_id(ten_don_vi)')
    .eq('nhan_su_id', Number(nhanSuId))
    .order('ngay_hieu_luc', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId,
    loai: r.loai,
    tieuDe: r.tieu_de,
    soQuyetDinh: r.so_quyet_dinh ?? '',
    ngayKy: r.ngay_ky ?? '',
    ngayHieuLuc: r.ngay_hieu_luc ?? '',
    ngayKetThuc: r.ngay_ket_thuc ?? '',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    chucVu: r.chuc_vu ?? '',
    moTa: r.mo_ta ?? '',
    tepDinhKem: '',
  }));
}

export interface QuaTrinhCongTacInput {
  loai: string;
  tieuDe: string;
  soQuyetDinh: string;
  ngayKy: string;
  ngayHieuLuc: string;
  ngayKetThuc: string;
  donViId: string;
  chucVu: string;
  moTa: string;
}

function quaTrinhRow(i: QuaTrinhCongTacInput) {
  return {
    loai: i.loai,
    tieu_de: i.tieuDe,
    so_quyet_dinh: str(i.soQuyetDinh),
    ngay_ky: str(i.ngayKy),
    ngay_hieu_luc: str(i.ngayHieuLuc),
    ngay_ket_thuc: str(i.ngayKetThuc),
    don_vi_id: i.donViId ? Number(i.donViId) : null,
    chuc_vu: str(i.chucVu),
    mo_ta: str(i.moTa),
  };
}

export async function createQuaTrinhCongTac(nhanSuId: string, i: QuaTrinhCongTacInput) {
  throwIf((await supabase.from('qua_trinh_cong_tac').insert({ nhan_su_id: Number(nhanSuId), ...quaTrinhRow(i) })).error);
}
export async function updateQuaTrinhCongTac(id: string, i: QuaTrinhCongTacInput) {
  throwIf((await supabase.from('qua_trinh_cong_tac').update(quaTrinhRow(i)).eq('id', Number(id))).error);
}
export async function deleteQuaTrinhCongTac(id: string) {
  throwIf((await supabase.from('qua_trinh_cong_tac').delete().eq('id', Number(id))).error);
}

// ─── Bằng cấp ───

export async function fetchBangCap(nhanSuId: string): Promise<BangCap[]> {
  const { data, error } = await supabase
    .from('bang_cap')
    .select('id, loai, ten, chuyen_nganh, co_so_dao_tao, xep_loai, nam_tot_nghiep, ngay_cap, ngay_het_han')
    .eq('nhan_su_id', Number(nhanSuId))
    .order('ngay_cap', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId,
    loai: r.loai,
    ten: r.ten,
    chuyenNganh: r.chuyen_nganh ?? '',
    coSoDaoTao: r.co_so_dao_tao ?? '',
    xepLoai: r.xep_loai ?? '',
    namTotNghiep: r.nam_tot_nghiep,
    ngayCap: r.ngay_cap ?? '',
    ngayHetHan: r.ngay_het_han ?? '',
  }));
}

export interface BangCapInput {
  loai: string;
  ten: string;
  chuyenNganh: string;
  coSoDaoTao: string;
  xepLoai: string;
  namTotNghiep: string;
  ngayCap: string;
  ngayHetHan: string;
}

function bangCapRow(i: BangCapInput) {
  return {
    loai: i.loai,
    ten: i.ten,
    chuyen_nganh: str(i.chuyenNganh),
    co_so_dao_tao: str(i.coSoDaoTao),
    xep_loai: str(i.xepLoai),
    nam_tot_nghiep: num(i.namTotNghiep),
    ngay_cap: str(i.ngayCap),
    ngay_het_han: str(i.ngayHetHan),
  };
}

export async function createBangCap(nhanSuId: string, i: BangCapInput) {
  throwIf((await supabase.from('bang_cap').insert({ nhan_su_id: Number(nhanSuId), ...bangCapRow(i) })).error);
}
export async function updateBangCap(id: string, i: BangCapInput) {
  throwIf((await supabase.from('bang_cap').update(bangCapRow(i)).eq('id', Number(id))).error);
}
export async function deleteBangCap(id: string) {
  throwIf((await supabase.from('bang_cap').delete().eq('id', Number(id))).error);
}

// ─── Hợp đồng lao động ───

export async function fetchHopDongLaoDong(nhanSuId: string): Promise<HopDongLaoDong[]> {
  const { data, error } = await supabase
    .from('hop_dong_lao_dong')
    .select('id, so_hop_dong, loai_hop_dong, ngay_ky, tu_ngay, den_ngay, luong_co_ban, luong_bhxh, trang_thai, ghi_chu')
    .eq('nhan_su_id', Number(nhanSuId))
    .order('tu_ngay', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId,
    soHopDong: r.so_hop_dong ?? '',
    loaiHopDong: r.loai_hop_dong,
    ngayKy: r.ngay_ky ?? '',
    tuNgay: r.tu_ngay ?? '',
    denNgay: r.den_ngay ?? '',
    luongCoBan: r.luong_co_ban,
    luongBhxh: r.luong_bhxh,
    trangThai: r.trang_thai,
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface HopDongLaoDongInput {
  soHopDong: string;
  loaiHopDong: string;
  ngayKy: string;
  tuNgay: string;
  denNgay: string;
  luongCoBan: string;
  luongBhxh: string;
  trangThai: string;
  ghiChu: string;
}

function hopDongLaoDongRow(i: HopDongLaoDongInput) {
  return {
    so_hop_dong: str(i.soHopDong),
    loai_hop_dong: i.loaiHopDong,
    ngay_ky: str(i.ngayKy),
    tu_ngay: str(i.tuNgay),
    den_ngay: str(i.denNgay),
    luong_co_ban: num(i.luongCoBan),
    luong_bhxh: num(i.luongBhxh),
    trang_thai: i.trangThai,
    ghi_chu: str(i.ghiChu),
  };
}

export async function createHopDongLaoDong(nhanSuId: string, i: HopDongLaoDongInput) {
  throwIf((await supabase.from('hop_dong_lao_dong').insert({ nhan_su_id: Number(nhanSuId), ...hopDongLaoDongRow(i) })).error);
}
export async function updateHopDongLaoDong(id: string, i: HopDongLaoDongInput) {
  throwIf((await supabase.from('hop_dong_lao_dong').update(hopDongLaoDongRow(i)).eq('id', Number(id))).error);
}
export async function deleteHopDongLaoDong(id: string) {
  throwIf((await supabase.from('hop_dong_lao_dong').delete().eq('id', Number(id))).error);
}

// ─── Ngạch / bậc / hệ số lương ───

export async function fetchLuongNgachBac(nhanSuId: string): Promise<LuongNgachBac[]> {
  const { data, error } = await supabase
    .from('luong_ngach_bac')
    .select('id, ngay_hieu_luc, ngach, ma_ngach, bac, he_so_luong, phu_cap_chuc_vu, phu_cap_tnvk, loai_thay_doi, so_quyet_dinh, ly_do')
    .eq('nhan_su_id', Number(nhanSuId))
    .order('ngay_hieu_luc', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId,
    ngayHieuLuc: r.ngay_hieu_luc,
    ngach: r.ngach ?? '',
    maNgach: r.ma_ngach ?? '',
    bac: r.bac ?? '',
    heSoLuong: Number(r.he_so_luong),
    phuCapChucVu: Number(r.phu_cap_chuc_vu ?? 0),
    phuCapTnvk: Number(r.phu_cap_tnvk ?? 0),
    loaiThayDoi: r.loai_thay_doi,
    soQuyetDinh: r.so_quyet_dinh ?? '',
    lyDo: r.ly_do ?? '',
  }));
}

export interface LuongNgachBacInput {
  ngayHieuLuc: string;
  ngach: string;
  maNgach: string;
  bac: string;
  heSoLuong: string;
  phuCapChucVu: string;
  phuCapTnvk: string;
  loaiThayDoi: string;
  soQuyetDinh: string;
  lyDo: string;
}

function luongRow(i: LuongNgachBacInput) {
  return {
    ngay_hieu_luc: str(i.ngayHieuLuc),
    ngach: str(i.ngach),
    ma_ngach: str(i.maNgach),
    bac: str(i.bac),
    he_so_luong: num(i.heSoLuong) ?? 0,
    phu_cap_chuc_vu: num(i.phuCapChucVu) ?? 0,
    phu_cap_tnvk: num(i.phuCapTnvk) ?? 0,
    loai_thay_doi: i.loaiThayDoi,
    so_quyet_dinh: str(i.soQuyetDinh),
    ly_do: str(i.lyDo),
  };
}

export async function createLuongNgachBac(nhanSuId: string, i: LuongNgachBacInput) {
  throwIf((await supabase.from('luong_ngach_bac').insert({ nhan_su_id: Number(nhanSuId), ...luongRow(i) })).error);
}
export async function deleteLuongNgachBac(id: string) {
  throwIf((await supabase.from('luong_ngach_bac').delete().eq('id', Number(id))).error);
}

// ─── Đánh giá xếp loại CBVC ───

export async function fetchDanhGiaCbvc(nhanSuId: string): Promise<DanhGiaCbvc[]> {
  const { data, error } = await supabase
    .from('danh_gia_cbvc')
    .select('id, nam, ky, tu_xep_loai, xep_loai, diem, nguoi_danh_gia_id, nhan_xet, trang_thai')
    .eq('nhan_su_id', Number(nhanSuId))
    .order('nam', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId,
    nam: r.nam,
    ky: r.ky,
    tuXepLoai: r.tu_xep_loai ?? '',
    xepLoai: r.xep_loai ?? '',
    diem: r.diem,
    nguoiDanhGiaId: r.nguoi_danh_gia_id != null ? String(r.nguoi_danh_gia_id) : null,
    nhanXet: r.nhan_xet ?? '',
    trangThai: r.trang_thai,
  }));
}

export interface DanhGiaCbvcInput {
  nam: string;
  ky: string;
  tuXepLoai: string;
  xepLoai: string;
  diem: string;
  nhanXet: string;
  trangThai: string;
}

function danhGiaRow(i: DanhGiaCbvcInput) {
  return {
    nam: num(i.nam),
    ky: i.ky,
    tu_xep_loai: str(i.tuXepLoai),
    xep_loai: str(i.xepLoai),
    diem: num(i.diem),
    nhan_xet: str(i.nhanXet),
    trang_thai: i.trangThai,
  };
}

export async function createDanhGiaCbvc(nhanSuId: string, i: DanhGiaCbvcInput) {
  throwIf((await supabase.from('danh_gia_cbvc').insert({ nhan_su_id: Number(nhanSuId), ...danhGiaRow(i) })).error);
}
export async function updateDanhGiaCbvc(id: string, i: DanhGiaCbvcInput) {
  throwIf((await supabase.from('danh_gia_cbvc').update(danhGiaRow(i)).eq('id', Number(id))).error);
}
export async function deleteDanhGiaCbvc(id: string) {
  throwIf((await supabase.from('danh_gia_cbvc').delete().eq('id', Number(id))).error);
}
