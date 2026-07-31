import { supabase } from '../lib/supabase';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

/**
 * Đăng ký đầu mối thị trường/dự thầu — Quy trình 1, Điều 5.1c QC 2815.
 * Luồng: dang-ky (GĐ ĐV đăng ký) → cho-ldv-chi-dao (P.KHKT tiếp nhận, báo cáo LĐV)
 * → giao-dau-moi / khong-tham-gia (LĐV cho ý kiến, KHKT phản hồi).
 */
export type TrangThaiDangKyDauMoi = 'dang-ky' | 'cho-ldv-chi-dao' | 'giao-dau-moi' | 'khong-tham-gia';

export const NHAN_TRANG_THAI_DANG_KY: Record<TrangThaiDangKyDauMoi, string> = {
  'dang-ky': 'Đã đăng ký, chờ KHKT tiếp nhận',
  'cho-ldv-chi-dao': 'Chờ Lãnh đạo Viện chỉ đạo',
  'giao-dau-moi': 'Đã giao đầu mối',
  'khong-tham-gia': 'Không tham gia',
};

export const MAU_TRANG_THAI_DANG_KY: Record<TrangThaiDangKyDauMoi, string> = {
  'dang-ky': 'bg-muted text-ink-secondary',
  'cho-ldv-chi-dao': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'giao-dau-moi': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'khong-tham-gia': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

export interface DangKyDauMoi {
  id: string;
  tenCoHoi: string;
  moTa: string;
  nguoiPhatHienId: string | null;
  nguoiPhatHien: string;
  donViDangKyId: string;
  donViDangKy: string;
  nguoiDangKyId: string | null;
  nguoiDangKy: string;
  trangThai: TrangThaiDangKyDauMoi;
  ngayDangKy: string;
  ngayPhanHoi: string;
  lyDoKhongThamGia: string;
  dauThauId: string | null;
}

const COT_CO_BAN =
  'id, ten_co_hoi, mo_ta, nguoi_phat_hien_id, don_vi_dang_ky_id, nguoi_dang_ky_id, trang_thai, ngay_dang_ky, ngay_phan_hoi, ly_do_khong_tham_gia, dau_thau_id, ' +
  'nguoi_phat_hien:nhan_su!dang_ky_dau_moi_nguoi_phat_hien_id_fkey(ho_va_ten), don_vi:don_vi!dang_ky_dau_moi_don_vi_dang_ky_id_fkey(ten_don_vi), nguoi_dang_ky:nhan_su!dang_ky_dau_moi_nguoi_dang_ky_id_fkey(ho_va_ten)';

export async function fetchDangKyDauMoi(): Promise<DangKyDauMoi[]> {
  const { data, error } = await supabase
    .from('dang_ky_dau_moi')
    .select(COT_CO_BAN)
    .order('ngay_dang_ky', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    tenCoHoi: r.ten_co_hoi,
    moTa: r.mo_ta ?? '',
    nguoiPhatHienId: r.nguoi_phat_hien_id != null ? String(r.nguoi_phat_hien_id) : null,
    nguoiPhatHien: (r.nguoi_phat_hien as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    donViDangKyId: String(r.don_vi_dang_ky_id),
    donViDangKy: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    nguoiDangKyId: r.nguoi_dang_ky_id != null ? String(r.nguoi_dang_ky_id) : null,
    nguoiDangKy: (r.nguoi_dang_ky as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    trangThai: r.trang_thai as TrangThaiDangKyDauMoi,
    ngayDangKy: r.ngay_dang_ky ?? '',
    ngayPhanHoi: r.ngay_phan_hoi ?? '',
    lyDoKhongThamGia: r.ly_do_khong_tham_gia ?? '',
    dauThauId: r.dau_thau_id != null ? String(r.dau_thau_id) : null,
  }));
}

export interface DangKyDauMoiInput {
  tenCoHoi: string;
  moTa: string;
  nguoiPhatHienId: string;
  donViDangKyId: string;
  nguoiDangKyId: string;
  ngayDangKy: string;
}

export async function createDangKyDauMoi(i: DangKyDauMoiInput) {
  throwIf(
    (
      await supabase.from('dang_ky_dau_moi').insert({
        ten_co_hoi: i.tenCoHoi,
        mo_ta: i.moTa || null,
        nguoi_phat_hien_id: i.nguoiPhatHienId ? Number(i.nguoiPhatHienId) : null,
        don_vi_dang_ky_id: Number(i.donViDangKyId),
        nguoi_dang_ky_id: i.nguoiDangKyId ? Number(i.nguoiDangKyId) : null,
        ngay_dang_ky: i.ngayDangKy || new Date().toISOString().slice(0, 10),
      })
    ).error,
  );
}

/** P.KHKT tiếp nhận đăng ký, báo cáo Lãnh đạo Viện xin ý kiến (Đ.5.1c). */
export async function khktTiepNhan(id: string) {
  throwIf((await supabase.from('dang_ky_dau_moi').update({ trang_thai: 'cho-ldv-chi-dao' }).eq('id', Number(id))).error);
}

/** Lãnh đạo Viện cho ý kiến — giao đầu mối hoặc không tham gia (Đ.5.1c). */
export async function phanHoiDangKy(id: string, ketQua: 'giao-dau-moi' | 'khong-tham-gia', lyDo?: string) {
  throwIf(
    (
      await supabase
        .from('dang_ky_dau_moi')
        .update({ trang_thai: ketQua, ly_do_khong_tham_gia: ketQua === 'khong-tham-gia' ? lyDo || null : null })
        .eq('id', Number(id))
    ).error,
  );
}

export async function deleteDangKyDauMoi(id: string) {
  throwIf((await supabase.from('dang_ky_dau_moi').delete().eq('id', Number(id))).error);
}
