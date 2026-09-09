import { supabase } from '../lib/supabase';
import type { HanhDong, TaiNguyen } from '../lib/phanQuyen';
import type { VaiTro } from '../context/AuthContext';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ─── QUYỀN MẶC ĐỊNH THEO VAI TRÒ (quyen_vai_tro_mac_dinh) ───

export interface QuyenVaiTroRow {
  vaiTro: string;
  taiNguyen: string;
  hanhDong: HanhDong[];
}

export async function fetchQuyenVaiTroMacDinh(): Promise<QuyenVaiTroRow[]> {
  const { data, error } = await supabase
    .from('quyen_vai_tro_mac_dinh')
    .select('vai_tro, tai_nguyen, hanh_dong');
  throwIf(error);
  return (data ?? []).map((r) => ({
    vaiTro: r.vai_tro,
    taiNguyen: r.tai_nguyen,
    hanhDong: (r.hanh_dong ?? []) as HanhDong[],
  }));
}

/** Ghi đè toàn bộ mảng hành động cho một cặp (vai trò, tài nguyên). */
export async function upsertQuyenVaiTroMacDinh(
  vaiTro: VaiTro,
  taiNguyen: TaiNguyen,
  hanhDong: HanhDong[],
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  throwIf(
    (
      await supabase.from('quyen_vai_tro_mac_dinh').upsert(
        {
          vai_tro: vaiTro,
          tai_nguyen: taiNguyen,
          hanh_dong: hanhDong,
          updated_by: auth.user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'vai_tro,tai_nguyen' },
      )
    ).error,
  );
}

// ─── GHI ĐÈ QUYỀN THEO TỪNG NGƯỜI DÙNG (quyen_nguoi_dung) ───

export interface QuyenNguoiDungRow {
  taiNguyen: string;
  hanhDong: HanhDong[];
}

export async function fetchQuyenNguoiDung(userId: string): Promise<QuyenNguoiDungRow[]> {
  const { data, error } = await supabase
    .from('quyen_nguoi_dung')
    .select('tai_nguyen, hanh_dong')
    .eq('user_id', userId);
  throwIf(error);
  return (data ?? []).map((r) => ({ taiNguyen: r.tai_nguyen, hanhDong: (r.hanh_dong ?? []) as HanhDong[] }));
}

/** Ghi đè quyền cho một người dùng trên một tài nguyên — mảng rỗng nghĩa là THU HỒI quyền. */
export async function upsertQuyenNguoiDung(
  userId: string,
  taiNguyen: TaiNguyen,
  hanhDong: HanhDong[],
): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  throwIf(
    (
      await supabase.from('quyen_nguoi_dung').upsert(
        {
          user_id: userId,
          tai_nguyen: taiNguyen,
          hanh_dong: hanhDong,
          granted_by: auth.user?.id ?? null,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'user_id,tai_nguyen' },
      )
    ).error,
  );
}

/** Xóa ghi đè — quay lại nhận quyền theo mặc định vai trò. */
export async function xoaQuyenNguoiDung(userId: string, taiNguyen: TaiNguyen): Promise<void> {
  throwIf(
    (await supabase.from('quyen_nguoi_dung').delete().eq('user_id', userId).eq('tai_nguyen', taiNguyen))
      .error,
  );
}

// ─── QUYỀN XEM LIÊN ĐƠN VỊ (quyen_xem_lien_don_vi) ───

export interface QuyenXemLienDonViRow {
  nhanSuId: string;
  donViDuocXemId: string;
  tenDonViDuocXem: string;
}

export async function fetchQuyenXemLienDonVi(nhanSuId: string): Promise<QuyenXemLienDonViRow[]> {
  const { data, error } = await supabase
    .from('quyen_xem_lien_don_vi')
    .select('nhan_su_id, don_vi_duoc_xem_id, don_vi(ten_don_vi)')
    .eq('nhan_su_id', nhanSuId);
  throwIf(error);
  return (data ?? []).map((r) => ({
    nhanSuId: String(r.nhan_su_id),
    donViDuocXemId: String(r.don_vi_duoc_xem_id),
    tenDonViDuocXem: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
  }));
}

export async function themQuyenXemLienDonVi(nhanSuId: string, donViDuocXemId: string): Promise<void> {
  const { data: auth } = await supabase.auth.getUser();
  throwIf(
    (
      await supabase.from('quyen_xem_lien_don_vi').upsert(
        { nhan_su_id: Number(nhanSuId), don_vi_duoc_xem_id: Number(donViDuocXemId), granted_by: auth.user?.id ?? null },
        { onConflict: 'nhan_su_id,don_vi_duoc_xem_id' },
      )
    ).error,
  );
}

export async function xoaQuyenXemLienDonVi(nhanSuId: string, donViDuocXemId: string): Promise<void> {
  throwIf(
    (
      await supabase
        .from('quyen_xem_lien_don_vi')
        .delete()
        .eq('nhan_su_id', Number(nhanSuId))
        .eq('don_vi_duoc_xem_id', Number(donViDuocXemId))
    ).error,
  );
}
