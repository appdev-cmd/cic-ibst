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
const LOAI_DAO_TAO: Record<string, LopDaoTao['loai']> = {
  ncs: 'NCS',
  'tap-huan': 'Tập huấn',
  'hoi-thao': 'Hội thảo',
};
function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export async function fetchVanBan(): Promise<VanBan[]> {
  const { data, error } = await supabase
    .from('van_ban')
    .select('id, so_hieu, trich_yeu, loai, ngay_van_ban, trang_thai, don_vi(ten_don_vi)')
    .order('ngay_van_ban', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    soHieu: r.so_hieu,
    trichYeu: r.trich_yeu,
    loai: r.loai === 'den' ? 'Đến' : 'Đi',
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? 'Lãnh đạo Viện',
    ngay: r.ngay_van_ban,
    trangThai: r.trang_thai as TrangThai,
  }));
}

export async function fetchDeTai(): Promise<DeTai[]> {
  const { data, error } = await supabase
    .from('de_tai')
    .select(
      'id, ma_so, ten_de_tai, cap_de_tai, kinh_phi, tien_do, han_nghiem_thu, trang_thai, nhan_su(ho_va_ten, hoc_vi), don_vi(ten_don_vi)',
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
      chuNhiem: cn ? cn.ho_va_ten : '—',
      donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
      kinhPhi: Number(r.kinh_phi),
      tienDo: r.tien_do,
      hanNghiemThu: r.han_nghiem_thu ?? '',
      trangThai: r.trang_thai as TrangThai,
    };
  });
}

export async function fetchHopDong(): Promise<HopDong[]> {
  const { data, error } = await supabase
    .from('hop_dong')
    .select(
      'id, so_hop_dong, ten_hop_dong, gia_tri, da_thanh_toan, ngay_ky, han_hoan_thanh, trang_thai, khach_hang(ten_to_chuc), don_vi(ten_don_vi)',
    )
    .order('ngay_ky', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    soHD: r.so_hop_dong,
    ten: r.ten_hop_dong,
    khachHang: (r.khach_hang as unknown as { ten_to_chuc: string } | null)?.ten_to_chuc ?? '—',
    donViThucHien: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    giaTri: Number(r.gia_tri),
    daThanhToan: Number(r.da_thanh_toan),
    ngayKy: r.ngay_ky ?? '',
    hanHoanThanh: r.han_hoan_thanh ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

export async function fetchMauThiNghiem(): Promise<MauThiNghiem[]> {
  const { data, error } = await supabase
    .from('mau_thi_nghiem')
    .select(
      'id, ma_phieu, ten_mau, phep_thu, tieu_chuan_ap_dung, phong_thi_nghiem, ngay_nhan, han_tra, trang_thai, khach_hang(ten_to_chuc)',
    )
    .order('ngay_nhan', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    maPhieu: r.ma_phieu,
    tenMau: r.ten_mau,
    phepThu: [r.phep_thu, r.tieu_chuan_ap_dung].filter(Boolean).join(' '),
    khachHang: (r.khach_hang as unknown as { ten_to_chuc: string } | null)?.ten_to_chuc ?? '—',
    phongThiNghiem: r.phong_thi_nghiem,
    ngayNhan: r.ngay_nhan,
    hanTra: r.han_tra ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

// fetchNhanSu đã chuyển sang services/org.ts (fetchNhanSuFull) cùng CRUD module nhân sự

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
    soHocVien: r.so_hoc_vien,
    batDau: r.ngay_bat_dau ?? '',
    ketThuc: r.ngay_ket_thuc ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}
