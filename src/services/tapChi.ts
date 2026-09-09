import { supabase } from '../lib/supabase';
import { throwIfKhongGhiDuoc } from '../lib/rlsGuard';

// ─── TYPES ───

export interface SoTapChi {
  id: string;
  ten: string;
  nam: number;
  quy: number | null;
  ngayXuatBan: string | null;
  trangThai: 'chuan-bi' | 'bien-tap' | 'in-an' | 'da-xuat-ban';
  soBai: number;
  ghiChu: string | null;
  createdAt: string;
}

export interface SoTapChiInput {
  ten: string;
  nam: number;
  quy?: number;
  ngayXuatBan?: string;
  trangThai?: 'chuan-bi' | 'bien-tap' | 'in-an' | 'da-xuat-ban';
  ghiChu?: string;
}

export interface BaiBao {
  id: string;
  tieuDe: string;
  tacGia: string;
  coQuan: string | null;
  ngayNhan: string | null;
  trangThai: 'tiep-nhan' | 'phan-cong-bien-tap' | 'cho-phan-bien' | 'dang-phan-bien' | 'chinh-sua' | 'chap-nhan' | 'tu-choi' | 'da-xuat-ban';
  soTapChiId: string | null;
  bienTapVienId: string | null;
  bienTapVienTen?: string;
  soTapChiTen?: string;
}

export interface BaiBaoChiTiet extends BaiBao {
  tomTat: string | null;
  tuKhoa: string[];
  dongTacGia: string[];
  emailTacGia: string | null;
  fileBanThao: string | null;
  fileChinhSua: string | null;
  ngayXuatBan: string | null;
  ghiChu: string | null;
  createdAt: string;
}

export interface BaiBaoInput {
  tieuDe: string;
  tomTat?: string;
  tuKhoa?: string[];
  tacGia: string;
  dongTacGia?: string[];
  coQuan?: string;
  emailTacGia?: string;
  ngayNhan?: string;
  trangThai?: string;
  bienTapVienId?: string;
  soTapChiId?: string;
  fileBanThao?: string;
  fileChinhSua?: string;
  ngayXuatBan?: string;
  ghiChu?: string;
}

export interface PhanBien {
  id: string;
  baiBaoId: string;
  phanBienVienId: string | null;
  hoTenPhanBien: string;
  coQuanPhanBien: string | null;
  emailPhanBien: string | null;
  ngayPhanCong: string | null;
  hanTraKetQua: string | null;
  ngayTraKetQua: string | null;
  ketQua: 'chap-nhan' | 'chinh-sua-nho' | 'chinh-sua-lon' | 'tu-choi' | null;
  nhanXet: string | null;
  diemDanhGia: number | null;
  fileNhanXet: string | null;
  trangThai: 'cho-phan-bien' | 'da-nhan' | 'da-tra-ket-qua';
}

export interface PhanBienInput {
  baiBaoId: string;
  phanBienVienId?: string;
  hoTenPhanBien: string;
  coQuanPhanBien?: string;
  emailPhanBien?: string;
  ngayPhanCong?: string;
  hanTraKetQua?: string;
  ngayTraKetQua?: string;
  ketQua?: 'chap-nhan' | 'chinh-sua-nho' | 'chinh-sua-lon' | 'tu-choi';
  nhanXet?: string;
  diemDanhGia?: number;
  fileNhanXet?: string;
  trangThai?: 'cho-phan-bien' | 'da-nhan' | 'da-tra-ket-qua';
}

export interface ThongKeTapChi {
  tongSoBai: number;
  baiDangXuLy: number;
  baiDaXuatBan: number;
  baiTuChoi: number;
}

// Helper functions
function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const str = (v: string | undefined | null) => v || null;
const num = (v: string | undefined | null) => (v ? Number(v) : null);

// ─── SỐ TẠP CHÍ ───

export async function fetchSoTapChi(): Promise<SoTapChi[]> {
  const { data, error } = await supabase
    .from('so_tap_chi')
    .select('*')
    .order('nam', { ascending: false })
    .order('quy', { ascending: false });
  
  throwIf(error);
  
  return (data ?? []).map((r) => ({
    id: String(r.id),
    ten: r.ten,
    nam: r.nam,
    quy: r.quy,
    ngayXuatBan: r.ngay_xuat_ban,
    trangThai: r.trang_thai,
    soBai: r.so_bai,
    ghiChu: r.ghi_chu,
    createdAt: r.created_at,
  }));
}

export async function createSoTapChi(input: SoTapChiInput): Promise<void> {
  const payload = {
    ten: input.ten,
    nam: input.nam,
    quy: input.quy || null,
    ngay_xuat_ban: str(input.ngayXuatBan),
    trang_thai: input.trangThai || 'chuan-bi',
    ghi_chu: str(input.ghiChu),
  };
  throwIf((await supabase.from('so_tap_chi').insert(payload)).error);
}

export async function updateSoTapChi(id: string, input: Partial<SoTapChiInput>): Promise<void> {
  const payload: any = {};
  if (input.ten !== undefined) payload.ten = input.ten;
  if (input.nam !== undefined) payload.nam = input.nam;
  if (input.quy !== undefined) payload.quy = input.quy || null;
  if (input.ngayXuatBan !== undefined) payload.ngay_xuat_ban = str(input.ngayXuatBan);
  if (input.trangThai !== undefined) payload.trang_thai = input.trangThai;
  if (input.ghiChu !== undefined) payload.ghi_chu = str(input.ghiChu);

  throwIfKhongGhiDuoc(await supabase.from('so_tap_chi').update(payload).eq('id', id).select('id'));
}

// ─── BÀI BÁO ───

export async function fetchBaiBao(filters?: { trangThai?: string; tuKhoa?: string }): Promise<BaiBao[]> {
  let query = supabase
    .from('bai_bao_khoa_hoc')
    .select('id, tieu_de, tac_gia, co_quan, ngay_nhan, trang_thai, so_tap_chi_id, bien_tap_vien_id, nhan_su!bai_bao_khoa_hoc_bien_tap_vien_id_fkey(ho_va_ten), so_tap_chi(ten)')
    .order('ngay_nhan', { ascending: false });

  if (filters?.trangThai) {
    query = query.eq('trang_thai', filters.trangThai);
  }

  const { data, error } = await query;
  throwIf(error);

  let result = (data ?? []).map((r: any) => ({
    id: String(r.id),
    tieuDe: r.tieu_de,
    tacGia: r.tac_gia,
    coQuan: r.co_quan,
    ngayNhan: r.ngay_nhan,
    trangThai: r.trang_thai,
    soTapChiId: r.so_tap_chi_id ? String(r.so_tap_chi_id) : null,
    bienTapVienId: r.bien_tap_vien_id ? String(r.bien_tap_vien_id) : null,
    bienTapVienTen: r.nhan_su?.ho_va_ten,
    soTapChiTen: r.so_tap_chi?.ten,
  }));

  // Client-side filtering for tuKhoa array overlaps if needed
  // Note: For large datasets, this should be done in Supabase
  
  return result;
}

export async function fetchBaiBaoById(id: string): Promise<BaiBaoChiTiet | null> {
  const { data, error } = await supabase
    .from('bai_bao_khoa_hoc')
    .select('*, nhan_su!bai_bao_khoa_hoc_bien_tap_vien_id_fkey(ho_va_ten), so_tap_chi(ten)')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') return null; // Not found
    throw new Error(error.message);
  }

  return {
    id: String(data.id),
    tieuDe: data.tieu_de,
    tomTat: data.tom_tat,
    tuKhoa: data.tu_khoa || [],
    tacGia: data.tac_gia,
    dongTacGia: data.dong_tac_gia || [],
    coQuan: data.co_quan,
    emailTacGia: data.email_tac_gia,
    ngayNhan: data.ngay_nhan,
    trangThai: data.trang_thai,
    soTapChiId: data.so_tap_chi_id ? String(data.so_tap_chi_id) : null,
    bienTapVienId: data.bien_tap_vien_id ? String(data.bien_tap_vien_id) : null,
    fileBanThao: data.file_ban_thao,
    fileChinhSua: data.file_chinh_sua,
    ngayXuatBan: data.ngay_xuat_ban,
    ghiChu: data.ghi_chu,
    createdAt: data.created_at,
    bienTapVienTen: data.nhan_su?.ho_va_ten,
    soTapChiTen: data.so_tap_chi?.ten,
  };
}

export async function createBaiBao(input: BaiBaoInput): Promise<string> {
  const payload = {
    tieu_de: input.tieuDe,
    tom_tat: str(input.tomTat),
    tu_khoa: input.tuKhoa || [],
    tac_gia: input.tacGia,
    dong_tac_gia: input.dongTacGia || [],
    co_quan: str(input.coQuan),
    email_tac_gia: str(input.emailTacGia),
    ngay_nhan: str(input.ngayNhan),
    trang_thai: input.trangThai || 'tiep-nhan',
    bien_tap_vien_id: str(input.bienTapVienId),
    so_tap_chi_id: str(input.soTapChiId),
    file_ban_thao: str(input.fileBanThao),
    file_chinh_sua: str(input.fileChinhSua),
    ngay_xuat_ban: str(input.ngayXuatBan),
    ghi_chu: str(input.ghiChu),
  };

  const { data, error } = await supabase.from('bai_bao_khoa_hoc').insert(payload).select('id').single();
  throwIf(error);
  return String(data!.id);
}

export async function updateBaiBao(id: string, input: Partial<BaiBaoInput>): Promise<void> {
  const payload: any = {};
  if (input.tieuDe !== undefined) payload.tieu_de = input.tieuDe;
  if (input.tomTat !== undefined) payload.tom_tat = str(input.tomTat);
  if (input.tuKhoa !== undefined) payload.tu_khoa = input.tuKhoa;
  if (input.tacGia !== undefined) payload.tac_gia = input.tacGia;
  if (input.dongTacGia !== undefined) payload.dong_tac_gia = input.dongTacGia;
  if (input.coQuan !== undefined) payload.co_quan = str(input.coQuan);
  if (input.emailTacGia !== undefined) payload.email_tac_gia = str(input.emailTacGia);
  if (input.ngayNhan !== undefined) payload.ngay_nhan = str(input.ngayNhan);
  if (input.trangThai !== undefined) payload.trang_thai = input.trangThai;
  if (input.bienTapVienId !== undefined) payload.bien_tap_vien_id = str(input.bienTapVienId);
  if (input.soTapChiId !== undefined) payload.so_tap_chi_id = str(input.soTapChiId);
  if (input.fileBanThao !== undefined) payload.file_ban_thao = str(input.fileBanThao);
  if (input.fileChinhSua !== undefined) payload.file_chinh_sua = str(input.fileChinhSua);
  if (input.ngayXuatBan !== undefined) payload.ngay_xuat_ban = str(input.ngayXuatBan);
  if (input.ghiChu !== undefined) payload.ghi_chu = str(input.ghiChu);

  throwIfKhongGhiDuoc(await supabase.from('bai_bao_khoa_hoc').update(payload).eq('id', id).select('id'));
}

export async function deleteBaiBao(id: string): Promise<void> {
  throwIfKhongGhiDuoc(await supabase.from('bai_bao_khoa_hoc').delete().eq('id', id).select('id'));
}

// ─── PHẢN BIỆN ───

export async function fetchPhanBien(baiBaoId: string): Promise<PhanBien[]> {
  const { data, error } = await supabase
    .from('phan_bien_khoa_hoc')
    .select('*')
    .eq('bai_bao_id', baiBaoId)
    .order('ngay_phan_cong', { ascending: true });

  throwIf(error);

  return (data ?? []).map((r) => ({
    id: String(r.id),
    baiBaoId: String(r.bai_bao_id),
    phanBienVienId: r.phan_bien_vien_id ? String(r.phan_bien_vien_id) : null,
    hoTenPhanBien: r.ho_ten_phan_bien,
    coQuanPhanBien: r.co_quan_phan_bien,
    emailPhanBien: r.email_phan_bien,
    ngayPhanCong: r.ngay_phan_cong,
    hanTraKetQua: r.han_tra_ket_qua,
    ngayTraKetQua: r.ngay_tra_ket_qua,
    ketQua: r.ket_qua,
    nhanXet: r.nhan_xet,
    diemDanhGia: r.diem_danh_gia,
    fileNhanXet: r.file_nhan_xet,
    trangThai: r.trang_thai,
  }));
}

export async function createPhanBien(input: PhanBienInput): Promise<void> {
  const payload = {
    bai_bao_id: input.baiBaoId,
    phan_bien_vien_id: str(input.phanBienVienId),
    ho_ten_phan_bien: input.hoTenPhanBien,
    co_quan_phan_bien: str(input.coQuanPhanBien),
    email_phan_bien: str(input.emailPhanBien),
    ngay_phan_cong: str(input.ngayPhanCong),
    han_tra_ket_qua: str(input.hanTraKetQua),
    ngay_tra_ket_qua: str(input.ngayTraKetQua),
    ket_qua: input.ketQua || null,
    nhan_xet: str(input.nhanXet),
    diem_danh_gia: input.diemDanhGia || null,
    file_nhan_xet: str(input.fileNhanXet),
    trang_thai: input.trangThai || 'cho-phan-bien',
  };

  throwIf((await supabase.from('phan_bien_khoa_hoc').insert(payload)).error);
}

export async function updatePhanBien(id: string, input: Partial<PhanBienInput>): Promise<void> {
  const payload: any = {};
  if (input.phanBienVienId !== undefined) payload.phan_bien_vien_id = str(input.phanBienVienId);
  if (input.hoTenPhanBien !== undefined) payload.ho_ten_phan_bien = input.hoTenPhanBien;
  if (input.coQuanPhanBien !== undefined) payload.co_quan_phan_bien = str(input.coQuanPhanBien);
  if (input.emailPhanBien !== undefined) payload.email_phan_bien = str(input.emailPhanBien);
  if (input.ngayPhanCong !== undefined) payload.ngay_phan_cong = str(input.ngayPhanCong);
  if (input.hanTraKetQua !== undefined) payload.han_tra_ket_qua = str(input.hanTraKetQua);
  if (input.ngayTraKetQua !== undefined) payload.ngay_tra_ket_qua = str(input.ngayTraKetQua);
  if (input.ketQua !== undefined) payload.ket_qua = input.ketQua || null;
  if (input.nhanXet !== undefined) payload.nhan_xet = str(input.nhanXet);
  if (input.diemDanhGia !== undefined) payload.diem_danh_gia = input.diemDanhGia || null;
  if (input.fileNhanXet !== undefined) payload.file_nhan_xet = str(input.fileNhanXet);
  if (input.trangThai !== undefined) payload.trang_thai = input.trangThai;

  throwIfKhongGhiDuoc(await supabase.from('phan_bien_khoa_hoc').update(payload).eq('id', id).select('id'));
}

// ─── THỐNG KÊ ───

export async function thongKeTapChi(): Promise<ThongKeTapChi> {
  // Thực hiện nhiều query đồng thời
  const [tongSo, dangXuLy, daXuatBan, tuChoi] = await Promise.all([
    supabase.from('bai_bao_khoa_hoc').select('id', { count: 'exact', head: true }),
    supabase.from('bai_bao_khoa_hoc').select('id', { count: 'exact', head: true }).in('trang_thai', ['tiep-nhan', 'phan-cong-bien-tap', 'cho-phan-bien', 'dang-phan-bien', 'chinh-sua', 'chap-nhan']),
    supabase.from('bai_bao_khoa_hoc').select('id', { count: 'exact', head: true }).eq('trang_thai', 'da-xuat-ban'),
    supabase.from('bai_bao_khoa_hoc').select('id', { count: 'exact', head: true }).eq('trang_thai', 'tu-choi'),
  ]);

  return {
    tongSoBai: tongSo.count || 0,
    baiDangXuLy: dangXuLy.count || 0,
    baiDaXuatBan: daXuatBan.count || 0,
    baiTuChoi: tuChoi.count || 0,
  };
}
