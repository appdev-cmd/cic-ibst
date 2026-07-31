import { supabase } from '../lib/supabase';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export type LoaiKhachHang = 'chu-dau-tu' | 'nha-thau' | 'doi-tac-khcn' | 'khac';

export const LOAI_KHACH_HANG_OPTIONS: { value: LoaiKhachHang; label: string }[] = [
  { value: 'chu-dau-tu', label: 'Chủ đầu tư' },
  { value: 'nha-thau', label: 'Nhà thầu / Tổng thầu' },
  { value: 'doi-tac-khcn', label: 'Đối tác khoa học công nghệ / Đào tạo' },
  { value: 'khac', label: 'Khác' },
];

export interface KhachHang {
  id: string;
  tenToChuc: string;
  maSoThue: string;
  loai: LoaiKhachHang;
  nguoiDaiDien: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  website: string;
  ghiChu: string;
  /** Số hợp đồng đang tham chiếu khách hàng này (đếm thật từ bảng hop_dong). */
  soHopDongDaKy: number;
}

export async function fetchKhachHang(): Promise<KhachHang[]> {
  const { data, error } = await supabase
    .from('khach_hang')
    .select(
      'id, ten_to_chuc, ma_so_thue, loai, nguoi_dai_dien, so_dien_thoai, email, dia_chi_chi_tiet, website, ghi_chu, hop_dong(count)',
    )
    .order('ten_to_chuc');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    tenToChuc: r.ten_to_chuc,
    maSoThue: r.ma_so_thue ?? '',
    loai: (r.loai as LoaiKhachHang) ?? 'khac',
    nguoiDaiDien: r.nguoi_dai_dien ?? '',
    soDienThoai: r.so_dien_thoai ?? '',
    email: r.email ?? '',
    diaChi: r.dia_chi_chi_tiet ?? '',
    website: r.website ?? '',
    ghiChu: r.ghi_chu ?? '',
    soHopDongDaKy: (r.hop_dong as unknown as { count: number }[] | null)?.[0]?.count ?? 0,
  }));
}

export interface KhachHangInput {
  tenToChuc: string;
  maSoThue: string;
  loai: LoaiKhachHang;
  nguoiDaiDien: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
}

function row(i: KhachHangInput) {
  return {
    ten_to_chuc: i.tenToChuc,
    ma_so_thue: i.maSoThue || null,
    loai: i.loai,
    nguoi_dai_dien: i.nguoiDaiDien || null,
    so_dien_thoai: i.soDienThoai || null,
    email: i.email || null,
    dia_chi_chi_tiet: i.diaChi || null,
  };
}

/** Trả về tên tổ chức đã dùng mã số thuế này (khác bản ghi đang sửa), hoặc null nếu chưa trùng. */
export async function kiemTraTrungMaSoThue(maSoThue: string, excludeId?: string): Promise<string | null> {
  if (!maSoThue.trim()) return null;
  let q = supabase.from('khach_hang').select('id, ten_to_chuc').eq('ma_so_thue', maSoThue.trim()).limit(1);
  if (excludeId) q = q.neq('id', Number(excludeId));
  const { data, error } = await q;
  throwIf(error);
  return data?.[0]?.ten_to_chuc ?? null;
}

export async function createKhachHang(i: KhachHangInput) {
  const trung = await kiemTraTrungMaSoThue(i.maSoThue);
  if (trung) throw new Error(`Mã số thuế ${i.maSoThue} đã được dùng cho "${trung}". Vui lòng kiểm tra lại để tránh trùng hồ sơ.`);
  throwIf((await supabase.from('khach_hang').insert(row(i))).error);
}

export async function updateKhachHang(id: string, i: KhachHangInput) {
  const trung = await kiemTraTrungMaSoThue(i.maSoThue, id);
  if (trung) throw new Error(`Mã số thuế ${i.maSoThue} đã được dùng cho "${trung}". Vui lòng kiểm tra lại để tránh trùng hồ sơ.`);
  throwIf((await supabase.from('khach_hang').update(row(i)).eq('id', Number(id))).error);
}

export async function deleteKhachHang(id: string) {
  // Chặn sớm với thông báo dễ hiểu — FK từ hop_dong/mau_thi_nghiem sẽ chặn ở CSDL
  // nhưng thông báo lỗi Postgres khó đọc với người dùng nghiệp vụ.
  const { count, error } = await supabase
    .from('hop_dong')
    .select('id', { count: 'exact', head: true })
    .eq('khach_hang_id', Number(id));
  throwIf(error);
  if ((count ?? 0) > 0) {
    throw new Error(`Không thể xóa: khách hàng đang gắn với ${count} hợp đồng. Hãy chuyển các hợp đồng sang khách hàng khác trước.`);
  }
  throwIf((await supabase.from('khach_hang').delete().eq('id', Number(id))).error);
}
