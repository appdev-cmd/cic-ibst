import { supabase } from '../lib/supabase';
import type {
  VanBan,
  DeTai,
  HopDong,
  MauThiNghiem,
  LopDaoTao,
  TrangThai,
} from '../types';

// Nhãn hiển thị cho mã danh mục (dm_danh_muc)
const CAP_DE_TAI: Record<string, DeTai['cap']> = {
  'nha-nuoc': 'Nhà nước',
  bo: 'Bộ',
  'co-so': 'Cơ sở',
};
export const CAP_DE_TAI_OPTIONS = [
  { value: 'nha-nuoc', label: 'Nhà nước' },
  { value: 'bo', label: 'Bộ' },
  { value: 'co-so', label: 'Cơ sở' },
];

const LOAI_DAO_TAO: Record<string, LopDaoTao['loai']> = {
  ncs: 'NCS',
  'tap-huan': 'Tập huấn',
  'hoi-thao': 'Hội thảo',
};
export const LOAI_DAO_TAO_OPTIONS = [
  { value: 'ncs', label: 'NCS' },
  { value: 'tap-huan', label: 'Tập huấn' },
  { value: 'hoi-thao', label: 'Hội thảo' },
];

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const num = (v: string) => (v ? Number(v) : null);
const str = (v: string) => v || null;

// ─── DANH SÁCH CHỌN (cho form) ───

export interface Option {
  id: string;
  ten: string;
}

export async function fetchDonViOptions(): Promise<Option[]> {
  const { data, error } = await supabase
    .from('don_vi')
    .select('id, ten_don_vi')
    .order('thu_tu');
  throwIf(error);
  return (data ?? []).map((r) => ({ id: String(r.id), ten: r.ten_don_vi }));
}

export async function fetchNhanSuOptions(): Promise<Option[]> {
  const { data, error } = await supabase
    .from('nhan_su')
    .select('id, ho_va_ten')
    .order('ho_va_ten');
  throwIf(error);
  return (data ?? []).map((r) => ({ id: String(r.id), ten: r.ho_va_ten }));
}

export async function fetchKhachHangOptions(): Promise<Option[]> {
  const { data, error } = await supabase
    .from('khach_hang')
    .select('id, ten_to_chuc')
    .order('ten_to_chuc');
  throwIf(error);
  return (data ?? []).map((r) => ({ id: String(r.id), ten: r.ten_to_chuc }));
}

// ─── VĂN BẢN ───

export async function fetchVanBan(): Promise<VanBan[]> {
  const { data, error } = await supabase
    .from('van_ban')
    .select('id, so_hieu, trich_yeu, loai, don_vi_id, ngay_van_ban, trang_thai, don_vi(ten_don_vi)')
    .order('ngay_van_ban', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    soHieu: r.so_hieu,
    trichYeu: r.trich_yeu,
    loai: r.loai === 'den' ? 'Đến' : 'Đi',
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? 'Lãnh đạo Viện',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    ngay: r.ngay_van_ban,
    trangThai: r.trang_thai as TrangThai,
  }));
}

export interface VanBanInput {
  soHieu: string;
  trichYeu: string;
  loai: 'den' | 'di';
  donViId: string;
  ngay: string;
  trangThai: string;
}

function vanBanRow(i: VanBanInput) {
  return {
    so_hieu: i.soHieu,
    trich_yeu: i.trichYeu,
    loai: i.loai,
    don_vi_id: num(i.donViId),
    ngay_van_ban: i.ngay,
    trang_thai: i.trangThai,
  };
}

export async function createVanBan(i: VanBanInput) {
  throwIf((await supabase.from('van_ban').insert(vanBanRow(i))).error);
}
export async function updateVanBan(id: string, i: VanBanInput) {
  throwIf((await supabase.from('van_ban').update(vanBanRow(i)).eq('id', Number(id))).error);
}
export async function deleteVanBan(id: string) {
  throwIf((await supabase.from('van_ban').delete().eq('id', Number(id))).error);
}

// ─── ĐỀ TÀI ───

export async function fetchDeTai(): Promise<DeTai[]> {
  const { data, error } = await supabase
    .from('de_tai')
    .select(
      'id, ma_so, ten_de_tai, cap_de_tai, chu_nhiem_id, don_vi_id, kinh_phi, tien_do, han_nghiem_thu, trang_thai, nhan_su(ho_va_ten, hoc_vi), don_vi(ten_don_vi)',
    )
    .order('ma_so');
  throwIf(error);
  return (data ?? []).map((r) => {
    const cn = r.nhan_su as unknown as { ho_va_ten: string; hoc_vi: string | null } | null;
    return {
      id: String(r.id),
      maSo: r.ma_so,
      ten: r.ten_de_tai,
      cap: CAP_DE_TAI[r.cap_de_tai] ?? 'Cơ sở',
      capMa: r.cap_de_tai,
      chuNhiem: cn ? cn.ho_va_ten : '—',
      chuNhiemId: r.chu_nhiem_id != null ? String(r.chu_nhiem_id) : null,
      donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
      donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
      kinhPhi: Number(r.kinh_phi),
      tienDo: r.tien_do,
      hanNghiemThu: r.han_nghiem_thu ?? '',
      trangThai: r.trang_thai as TrangThai,
    };
  });
}

export interface DeTaiInput {
  maSo: string;
  ten: string;
  capMa: string;
  chuNhiemId: string;
  donViId: string;
  kinhPhi: string;
  tienDo: string;
  hanNghiemThu: string;
  trangThai: string;
}

function deTaiRow(i: DeTaiInput) {
  return {
    ma_so: i.maSo,
    ten_de_tai: i.ten,
    cap_de_tai: i.capMa,
    chu_nhiem_id: num(i.chuNhiemId),
    don_vi_id: num(i.donViId),
    kinh_phi: Number(i.kinhPhi) || 0,
    tien_do: Math.min(100, Math.max(0, Number(i.tienDo) || 0)),
    han_nghiem_thu: str(i.hanNghiemThu),
    trang_thai: i.trangThai,
  };
}

export async function createDeTai(i: DeTaiInput) {
  throwIf((await supabase.from('de_tai').insert(deTaiRow(i))).error);
}
export async function updateDeTai(id: string, i: DeTaiInput) {
  throwIf((await supabase.from('de_tai').update(deTaiRow(i)).eq('id', Number(id))).error);
}
export async function deleteDeTai(id: string) {
  throwIf((await supabase.from('de_tai').delete().eq('id', Number(id))).error);
}

// ─── HỢP ĐỒNG ───

export async function fetchHopDong(): Promise<HopDong[]> {
  const { data, error } = await supabase
    .from('hop_dong')
    .select(
      'id, so_hop_dong, ten_hop_dong, khach_hang_id, don_vi_id, gia_tri, da_thanh_toan, ngay_ky, han_hoan_thanh, trang_thai, khach_hang(ten_to_chuc), don_vi(ten_don_vi)',
    )
    .order('ngay_ky', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    soHD: r.so_hop_dong,
    ten: r.ten_hop_dong,
    khachHang: (r.khach_hang as unknown as { ten_to_chuc: string } | null)?.ten_to_chuc ?? '—',
    khachHangId: r.khach_hang_id != null ? String(r.khach_hang_id) : null,
    donViThucHien: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    giaTri: Number(r.gia_tri),
    daThanhToan: Number(r.da_thanh_toan),
    ngayKy: r.ngay_ky ?? '',
    hanHoanThanh: r.han_hoan_thanh ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

export interface HopDongInput {
  soHD: string;
  ten: string;
  khachHangId: string;
  donViId: string;
  giaTri: string;
  daThanhToan: string;
  ngayKy: string;
  hanHoanThanh: string;
  trangThai: string;
}

function hopDongRow(i: HopDongInput) {
  return {
    so_hop_dong: i.soHD,
    ten_hop_dong: i.ten,
    khach_hang_id: num(i.khachHangId),
    don_vi_id: num(i.donViId),
    gia_tri: Number(i.giaTri) || 0,
    da_thanh_toan: Number(i.daThanhToan) || 0,
    ngay_ky: str(i.ngayKy),
    han_hoan_thanh: str(i.hanHoanThanh),
    trang_thai: i.trangThai,
  };
}

export async function createHopDong(i: HopDongInput) {
  throwIf((await supabase.from('hop_dong').insert(hopDongRow(i))).error);
}
export async function updateHopDong(id: string, i: HopDongInput) {
  throwIf((await supabase.from('hop_dong').update(hopDongRow(i)).eq('id', Number(id))).error);
}
export async function deleteHopDong(id: string) {
  throwIf((await supabase.from('hop_dong').delete().eq('id', Number(id))).error);
}

// ─── MẪU THÍ NGHIỆM ───

export async function fetchMauThiNghiem(): Promise<MauThiNghiem[]> {
  const { data, error } = await supabase
    .from('mau_thi_nghiem')
    .select(
      'id, ma_phieu, ten_mau, phep_thu, tieu_chuan_ap_dung, khach_hang_id, phong_thi_nghiem, ngay_nhan, han_tra, trang_thai, khach_hang(ten_to_chuc)',
    )
    .order('ngay_nhan', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    maPhieu: r.ma_phieu,
    tenMau: r.ten_mau,
    phepThu: r.phep_thu,
    tieuChuan: r.tieu_chuan_ap_dung ?? '',
    khachHang: (r.khach_hang as unknown as { ten_to_chuc: string } | null)?.ten_to_chuc ?? '—',
    khachHangId: r.khach_hang_id != null ? String(r.khach_hang_id) : null,
    phongThiNghiem: r.phong_thi_nghiem,
    ngayNhan: r.ngay_nhan,
    hanTra: r.han_tra ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

export interface MauThiNghiemInput {
  maPhieu: string;
  tenMau: string;
  phepThu: string;
  tieuChuan: string;
  khachHangId: string;
  phongThiNghiem: string;
  ngayNhan: string;
  hanTra: string;
  trangThai: string;
}

function mauRow(i: MauThiNghiemInput) {
  return {
    ma_phieu: i.maPhieu,
    ten_mau: i.tenMau,
    phep_thu: i.phepThu,
    tieu_chuan_ap_dung: str(i.tieuChuan),
    khach_hang_id: num(i.khachHangId),
    phong_thi_nghiem: i.phongThiNghiem,
    ngay_nhan: i.ngayNhan,
    han_tra: str(i.hanTra),
    trang_thai: i.trangThai,
  };
}

export async function createMauThiNghiem(i: MauThiNghiemInput) {
  throwIf((await supabase.from('mau_thi_nghiem').insert(mauRow(i))).error);
}
export async function updateMauThiNghiem(id: string, i: MauThiNghiemInput) {
  throwIf((await supabase.from('mau_thi_nghiem').update(mauRow(i)).eq('id', Number(id))).error);
}
export async function deleteMauThiNghiem(id: string) {
  throwIf((await supabase.from('mau_thi_nghiem').delete().eq('id', Number(id))).error);
}

// ─── LỚP ĐÀO TẠO ───

export async function fetchLopDaoTao(): Promise<LopDaoTao[]> {
  const { data, error } = await supabase
    .from('lop_dao_tao')
    .select('id, ten_lop, loai, so_hoc_vien, ngay_bat_dau, ngay_ket_thuc, trang_thai')
    .order('ngay_bat_dau', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    ten: r.ten_lop,
    loai: LOAI_DAO_TAO[r.loai] ?? 'Tập huấn',
    loaiMa: r.loai,
    soHocVien: r.so_hoc_vien,
    batDau: r.ngay_bat_dau ?? '',
    ketThuc: r.ngay_ket_thuc ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

export interface LopDaoTaoInput {
  ten: string;
  loaiMa: string;
  soHocVien: string;
  batDau: string;
  ketThuc: string;
  trangThai: string;
}

function lopRow(i: LopDaoTaoInput) {
  return {
    ten_lop: i.ten,
    loai: i.loaiMa,
    so_hoc_vien: Number(i.soHocVien) || 0,
    ngay_bat_dau: str(i.batDau),
    ngay_ket_thuc: str(i.ketThuc),
    trang_thai: i.trangThai,
  };
}

export async function createLopDaoTao(i: LopDaoTaoInput) {
  throwIf((await supabase.from('lop_dao_tao').insert(lopRow(i))).error);
}
export async function updateLopDaoTao(id: string, i: LopDaoTaoInput) {
  throwIf((await supabase.from('lop_dao_tao').update(lopRow(i)).eq('id', Number(id))).error);
}
export async function deleteLopDaoTao(id: string) {
  throwIf((await supabase.from('lop_dao_tao').delete().eq('id', Number(id))).error);
}
