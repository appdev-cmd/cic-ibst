import { supabase } from '../lib/supabase';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

export const VAI_TRO_LABEL: Record<string, string> = {
  'quan-tri': 'Quản trị hệ thống',
  'lanh-dao': 'Lãnh đạo Viện',
  'truong-don-vi': 'Trưởng đơn vị',
  'chuyen-vien': 'Chuyên viên',
};

export const VAI_TRO_OPTIONS = Object.entries(VAI_TRO_LABEL).map(([value, label]) => ({
  value,
  label,
}));

// ─── NGƯỜI DÙNG ───

export interface NguoiDung {
  userId: string;
  hoTen: string;
  vaiTro: string;
  donVi: string;
  trangThai: string;
}

export async function fetchNguoiDung(): Promise<NguoiDung[]> {
  const { data, error } = await supabase
    .from('nguoi_dung')
    .select('user_id, vai_tro, trang_thai, nhan_su(ho_va_ten), don_vi(ten_don_vi)')
    .order('vai_tro');
  throwIf(error);
  return (data ?? []).map((r) => ({
    userId: String(r.user_id),
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '(chưa gắn nhân sự)',
    vaiTro: r.vai_tro,
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    trangThai: r.trang_thai,
  }));
}

export async function updateNguoiDung(
  userId: string,
  input: { vaiTro: string; trangThai: string },
) {
  throwIf(
    (
      await supabase
        .from('nguoi_dung')
        .update({ vai_tro: input.vaiTro, trang_thai: input.trangThai })
        .eq('user_id', userId)
    ).error,
  );
}

// ─── DANH MỤC (dm_danh_muc) ───

export interface DanhMuc {
  id: string;
  nhom: string;
  maMuc: string;
  tenMuc: string;
}

export async function fetchDanhMuc(): Promise<DanhMuc[]> {
  const { data, error } = await supabase
    .from('dm_danh_muc')
    .select('id, nhom, ma_muc, ten_muc')
    .order('nhom')
    .order('ma_muc');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhom: r.nhom,
    maMuc: r.ma_muc,
    tenMuc: r.ten_muc,
  }));
}

export interface DanhMucInput {
  nhom: string;
  maMuc: string;
  tenMuc: string;
}

function dmRow(i: DanhMucInput) {
  return { nhom: i.nhom, ma_muc: i.maMuc, ten_muc: i.tenMuc };
}

export async function createDanhMuc(i: DanhMucInput) {
  throwIf((await supabase.from('dm_danh_muc').insert(dmRow(i))).error);
}
export async function updateDanhMuc(id: string, i: DanhMucInput) {
  throwIf((await supabase.from('dm_danh_muc').update(dmRow(i)).eq('id', Number(id))).error);
}
export async function deleteDanhMuc(id: string) {
  throwIf((await supabase.from('dm_danh_muc').delete().eq('id', Number(id))).error);
}

// ─── NHẬT KÝ DỮ LIỆU ───

export interface NhatKy {
  id: string;
  tenBang: string;
  banGhiId: string;
  hanhDong: string;
  nguoiThucHien: string;
  thoiDiem: string;
}

export async function fetchNhatKy(limit = 100): Promise<NhatKy[]> {
  const { data, error } = await supabase
    .from('nhat_ky_du_lieu')
    .select('id, ten_bang, ban_ghi_id, hanh_dong, nguoi_thuc_hien, thoi_diem')
    .order('thoi_diem', { ascending: false })
    .limit(limit);
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    tenBang: r.ten_bang,
    banGhiId: r.ban_ghi_id != null ? String(r.ban_ghi_id) : '',
    hanhDong: r.hanh_dong,
    nguoiThucHien: r.nguoi_thuc_hien ?? '',
    thoiDiem: r.thoi_diem,
  }));
}
