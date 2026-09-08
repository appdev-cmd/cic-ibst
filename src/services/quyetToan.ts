// Chuỗi tài chính Điều 11 QC 2815: đề nghị xuất hóa đơn → TCKT xuất → tiền về
// → tờ phân phối (Bảng 1) → duyệt → thanh quyết toán; kèm tạm ứng Đ.7.7 và lãi 130% Đ.14.
// Xem docs/review-module-hop-dong-2026-09.md §6 Đợt 2.
import { supabase } from '../lib/supabase';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
const str = (v: string | undefined | null) => v || null;
const num = (v: string | number | null | undefined) => (v === '' || v == null ? null : Number(v));

// ═══ ĐỀ NGHỊ XUẤT HÓA ĐƠN (Đ.11.1) ═══

export type TrangThaiDeNghiXuatHd =
  | 'du-thao'
  | 'cho-ke-toan-dv'
  | 'cho-tckt-xuat'
  | 'da-xuat'
  | 'tu-choi';

export const BUOC_DE_NGHI_XUAT_HD: { ma: TrangThaiDeNghiXuatHd; nhan: string; moTa: string }[] = [
  { ma: 'du-thao', nhan: '1. Chủ trì lập', moTa: 'Căn cứ biên bản nghiệm thu' },
  { ma: 'cho-ke-toan-dv', nhan: '2. Kế toán đơn vị', moTa: 'Phụ trách kế toán ĐV xác nhận' },
  { ma: 'cho-tckt-xuat', nhan: '3. P.TCKT xuất HĐ', moTa: 'SLA 3 ngày làm việc (Đ.11.1)' },
  { ma: 'da-xuat', nhan: '4. Đã xuất hóa đơn', moTa: 'Bắt đầu đồng hồ VAT 1 năm' },
];

export interface DeNghiXuatHoaDon {
  id: string;
  hopDongId: string;
  dotThanhToanId: string | null;
  soTien: number;
  ngayDeNghi: string;
  nguoiDeNghi: string;
  canCuNghiemThu: string;
  trangThai: TrangThaiDeNghiXuatHd;
  soHoaDon: string;
  ngayXuatHoaDon: string;
  lyDoTuChoi: string;
  ghiChu: string;
}

export async function fetchDeNghiXuatHoaDon(hopDongId: string): Promise<DeNghiXuatHoaDon[]> {
  const { data, error } = await supabase
    .from('de_nghi_xuat_hoa_don')
    .select(
      `id, hop_dong_id, dot_thanh_toan_id, so_tien, ngay_de_nghi, can_cu_nghiem_thu, trang_thai,
       so_hoa_don, ngay_xuat_hoa_don, ly_do_tu_choi, ghi_chu,
       nguoi_de_nghi:nhan_su!de_nghi_xuat_hoa_don_nguoi_de_nghi_id_fkey(ho_va_ten)`,
    )
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_de_nghi', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    hopDongId,
    dotThanhToanId: r.dot_thanh_toan_id != null ? String(r.dot_thanh_toan_id) : null,
    soTien: Number(r.so_tien),
    ngayDeNghi: r.ngay_de_nghi ?? '',
    nguoiDeNghi: (r.nguoi_de_nghi as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    canCuNghiemThu: r.can_cu_nghiem_thu ?? '',
    trangThai: r.trang_thai as TrangThaiDeNghiXuatHd,
    soHoaDon: r.so_hoa_don ?? '',
    ngayXuatHoaDon: r.ngay_xuat_hoa_don ?? '',
    lyDoTuChoi: r.ly_do_tu_choi ?? '',
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface DeNghiXuatHoaDonInput {
  dotThanhToanId: string;
  soTien: string;
  ngayDeNghi: string;
  canCuNghiemThu: string;
  ghiChu: string;
}

export async function createDeNghiXuatHoaDon(
  hopDongId: string,
  i: DeNghiXuatHoaDonInput,
  nguoiDeNghiId: string | null,
) {
  throwIf(
    (
      await supabase.from('de_nghi_xuat_hoa_don').insert({
        hop_dong_id: Number(hopDongId),
        dot_thanh_toan_id: num(i.dotThanhToanId),
        so_tien: num(i.soTien) ?? 0,
        ngay_de_nghi: str(i.ngayDeNghi) ?? new Date().toISOString().slice(0, 10),
        nguoi_de_nghi_id: nguoiDeNghiId ? Number(nguoiDeNghiId) : null,
        can_cu_nghiem_thu: str(i.canCuNghiemThu),
        ghi_chu: str(i.ghiChu),
      })
    ).error,
  );
}

/** Chuyển bước; khi sang 'da-xuat' bắt buộc kèm số + ngày hóa đơn (trigger CSDL cũng chặn). */
export async function chuyenBuocDeNghiXuatHd(
  id: string,
  den: TrangThaiDeNghiXuatHd,
  opts?: { soHoaDon?: string; ngayXuatHoaDon?: string; lyDoTuChoi?: string; actorNhanSuId?: string | null },
) {
  const patch: Record<string, unknown> = { trang_thai: den };
  if (den === 'cho-tckt-xuat') {
    patch.nguoi_ke_toan_dv_id = opts?.actorNhanSuId ? Number(opts.actorNhanSuId) : null;
    patch.ngay_ke_toan_dv = new Date().toISOString().slice(0, 10);
  }
  if (den === 'da-xuat') {
    patch.so_hoa_don = str(opts?.soHoaDon);
    patch.ngay_xuat_hoa_don = str(opts?.ngayXuatHoaDon) ?? new Date().toISOString().slice(0, 10);
    patch.nguoi_tckt_id = opts?.actorNhanSuId ? Number(opts.actorNhanSuId) : null;
  }
  if (den === 'tu-choi') patch.ly_do_tu_choi = str(opts?.lyDoTuChoi);
  throwIf((await supabase.from('de_nghi_xuat_hoa_don').update(patch).eq('id', Number(id))).error);
}

export async function deleteDeNghiXuatHoaDon(id: string) {
  throwIf((await supabase.from('de_nghi_xuat_hoa_don').delete().eq('id', Number(id))).error);
}

// ═══ TỜ PHÂN PHỐI QUYẾT TOÁN (Đ.11.1, 11.2, 12.4a) ═══

export interface ToPhanPhoi {
  id: string;
  hopDongId: string;
  ky: string;
  soTienGoc: number;
  quyChuTri: number | null;
  quyDonVi: number | null;
  cpqlLnChiKhac: number | null;
  khtscd: number | null;
  hoTroDiLai: number;
  giamGiaoChuTri: number;
  trangThai: 'du-thao' | 'cho-duyet' | 'da-duyet';
  nguoiLap: string;
  ngayLap: string;
  nguoiDuyet: string;
  ngayDuyet: string;
  ghiChu: string;
}

export async function fetchToPhanPhoi(hopDongId: string): Promise<ToPhanPhoi[]> {
  const { data, error } = await supabase
    .from('to_phan_phoi')
    .select(
      `id, hop_dong_id, ky, so_tien_goc, quy_chu_tri, quy_don_vi, cpql_ln_chi_khac, khtscd,
       ho_tro_di_lai, giam_giao_chu_tri, trang_thai, ngay_lap, ngay_duyet, ghi_chu,
       nguoi_lap:nhan_su!to_phan_phoi_nguoi_lap_id_fkey(ho_va_ten),
       nguoi_duyet:nhan_su!to_phan_phoi_nguoi_duyet_id_fkey(ho_va_ten)`,
    )
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_lap', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    hopDongId,
    ky: r.ky ?? '',
    soTienGoc: Number(r.so_tien_goc),
    quyChuTri: r.quy_chu_tri != null ? Number(r.quy_chu_tri) : null,
    quyDonVi: r.quy_don_vi != null ? Number(r.quy_don_vi) : null,
    cpqlLnChiKhac: r.cpql_ln_chi_khac != null ? Number(r.cpql_ln_chi_khac) : null,
    khtscd: r.khtscd != null ? Number(r.khtscd) : null,
    hoTroDiLai: Number(r.ho_tro_di_lai ?? 0),
    giamGiaoChuTri: Number(r.giam_giao_chu_tri ?? 0),
    trangThai: r.trang_thai as ToPhanPhoi['trangThai'],
    nguoiLap: (r.nguoi_lap as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    ngayLap: r.ngay_lap ?? '',
    nguoiDuyet: (r.nguoi_duyet as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    ngayDuyet: r.ngay_duyet ?? '',
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface ToPhanPhoiInput {
  ky: string;
  soTienGoc: number;
  quyChuTri: number | null;
  quyDonVi: number | null;
  cpqlLnChiKhac: number | null;
  khtscd: number | null;
  hoTroDiLai: number;
  giamGiaoChuTri: number;
  ghiChu: string;
}

export async function createToPhanPhoi(hopDongId: string, i: ToPhanPhoiInput, nguoiLapId: string | null) {
  throwIf(
    (
      await supabase.from('to_phan_phoi').insert({
        hop_dong_id: Number(hopDongId),
        ky: str(i.ky),
        so_tien_goc: i.soTienGoc,
        quy_chu_tri: i.quyChuTri,
        quy_don_vi: i.quyDonVi,
        cpql_ln_chi_khac: i.cpqlLnChiKhac,
        khtscd: i.khtscd,
        ho_tro_di_lai: i.hoTroDiLai,
        giam_giao_chu_tri: i.giamGiaoChuTri,
        ghi_chu: str(i.ghiChu),
        nguoi_lap_id: nguoiLapId ? Number(nguoiLapId) : null,
      })
    ).error,
  );
}

export async function chuyenBuocToPhanPhoi(
  id: string,
  den: ToPhanPhoi['trangThai'],
  actorNhanSuId?: string | null,
) {
  const patch: Record<string, unknown> = { trang_thai: den };
  if (den === 'da-duyet') patch.nguoi_duyet_id = actorNhanSuId ? Number(actorNhanSuId) : null;
  throwIf((await supabase.from('to_phan_phoi').update(patch).eq('id', Number(id))).error);
}

export async function deleteToPhanPhoi(id: string) {
  throwIf((await supabase.from('to_phan_phoi').delete().eq('id', Number(id))).error);
}

// ═══ TẠM ỨNG (Đ.7.7) + LÃI 130% KHI QUÁ HẠN (Đ.14 mục 2 dòng 6) ═══

export interface TamUng {
  id: string;
  hopDongId: string;
  nhanSu: string;
  soTien: number;
  ngayTamUng: string;
  hanHoan: string;
  soTienDaHoan: number;
  ngayHoan: string;
  laiSuatGoc: number | null;
  trangThai: 'dang-no' | 'da-hoan' | 'mien';
  ghiChu: string;
}

export async function fetchTamUng(hopDongId: string): Promise<TamUng[]> {
  const { data, error } = await supabase
    .from('tam_ung')
    .select('id, so_tien, ngay_tam_ung, han_hoan, so_tien_da_hoan, ngay_hoan, lai_suat_goc, trang_thai, ghi_chu, nhan_su(ho_va_ten)')
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_tam_ung', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    hopDongId,
    nhanSu: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    soTien: Number(r.so_tien),
    ngayTamUng: r.ngay_tam_ung ?? '',
    hanHoan: r.han_hoan ?? '',
    soTienDaHoan: Number(r.so_tien_da_hoan ?? 0),
    ngayHoan: r.ngay_hoan ?? '',
    laiSuatGoc: r.lai_suat_goc != null ? Number(r.lai_suat_goc) : null,
    trangThai: r.trang_thai as TamUng['trangThai'],
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface TamUngInput {
  nhanSuId: string;
  soTien: string;
  ngayTamUng: string;
  hanHoan: string;
  laiSuatGoc: string;
  ghiChu: string;
}

export async function createTamUng(hopDongId: string, i: TamUngInput) {
  throwIf(
    (
      await supabase.from('tam_ung').insert({
        hop_dong_id: Number(hopDongId),
        nhan_su_id: num(i.nhanSuId),
        so_tien: num(i.soTien) ?? 0,
        ngay_tam_ung: str(i.ngayTamUng) ?? new Date().toISOString().slice(0, 10),
        han_hoan: str(i.hanHoan),
        lai_suat_goc: num(i.laiSuatGoc),
        ghi_chu: str(i.ghiChu),
      })
    ).error,
  );
}

export async function ghiNhanHoanTamUng(id: string, soTienDaHoan: number, ngayHoan: string) {
  throwIf(
    (
      await supabase
        .from('tam_ung')
        .update({ so_tien_da_hoan: soTienDaHoan, ngay_hoan: str(ngayHoan), trang_thai: 'da-hoan' })
        .eq('id', Number(id))
    ).error,
  );
}

export async function deleteTamUng(id: string) {
  throwIf((await supabase.from('tam_ung').delete().eq('id', Number(id))).error);
}

export interface LaiQuaHanTamUng {
  soNgayQuaHan: number;
  duNo: number;
  laiSuatPhat: number; // %/năm = 130% lãi suất gốc
  tienLai: number; // triệu đồng
}

/**
 * Đ.14 mục 2 dòng 6: khoản tạm ứng của HĐKT quá hạn thì thu lãi bằng **130% lãi suất áp dụng**
 * kể từ thời điểm quá hạn. Trả về null khi chưa quá hạn, đã hoàn đủ, hoặc chưa nhập lãi suất gốc.
 */
export function tinhLaiQuaHanTamUng(t: TamUng, mocThoiGian = new Date()): LaiQuaHanTamUng | null {
  if (t.trangThai !== 'dang-no' || !t.hanHoan || t.laiSuatGoc == null) return null;
  const duNo = t.soTien - t.soTienDaHoan;
  if (duNo <= 0) return null;
  const han = new Date(t.hanHoan).getTime();
  const soNgayQuaHan = Math.floor((mocThoiGian.getTime() - han) / (1000 * 3600 * 24));
  if (soNgayQuaHan <= 0) return null;
  const laiSuatPhat = t.laiSuatGoc * 1.3;
  return {
    soNgayQuaHan,
    duNo,
    laiSuatPhat,
    tienLai: (duNo * laiSuatPhat * soNgayQuaHan) / (100 * 365),
  };
}
