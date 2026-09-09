import { supabase } from '../lib/supabase';
import { throwIfKhongGhiDuoc } from '../lib/rlsGuard';
import type { DonVi, LoaiDonVi, NhanSu } from '../types';

// ─── Nhãn + thứ tự nhóm loại đơn vị (theo cơ cấu ibst.vn) ───
export const LOAI_DON_VI: { ma: LoaiDonVi; ten: string }[] = [
  { ma: 'lanh-dao', ten: 'Lãnh đạo Viện' },
  { ma: 'phong-chuc-nang', ten: 'Phòng chức năng' },
  { ma: 'vien-chuyen-nganh', ten: 'Viện chuyên ngành' },
  { ma: 'phan-vien', ten: 'Phân viện' },
  { ma: 'trung-tam', ten: 'Trung tâm' },
  { ma: 'cong-ty', ten: 'Công ty thành viên' },
];

export const HANG_CHUNG_CHI: Record<string, string> = {
  'hang-1': 'Hạng I',
  'hang-2': 'Hạng II',
  'hang-3': 'Hạng III',
};

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ─── ĐƠN VỊ ───

export async function fetchDonVi(): Promise<DonVi[]> {
  const { data, error } = await supabase
    .from('don_vi')
    .select(
      `id, ma_dinh_danh, ten_don_vi, ten_viet_tat, loai_don_vi, chuc_nang_nhiem_vu,
       so_dien_thoai, email, thu_tu, phu_trach_id, truong_don_vi_id,
       ke_hoach_nam, ke_hoach_nam_truoc, ghi_chu_ke_hoach,
       truong:nhan_su!don_vi_truong_don_vi_id_fkey(id, ho_va_ten, hoc_vi, chuc_danh),
       phu_trach:nhan_su!don_vi_phu_trach_id_fkey(id, ho_va_ten),
       nhan_su!nhan_su_don_vi_id_fkey(count),
       de_tai(count), hop_dong(count)`,
    )
    .order('thu_tu');
  throwIf(error);
  return (data ?? []).map((r: any) => {
    const truong = r.truong as unknown as { id: number; ho_va_ten: string; hoc_vi: string | null; chuc_danh: string | null } | null;
    const phuTrach = r.phu_trach as unknown as { id: number; ho_va_ten: string } | null;
    const cnt = (x: unknown) => (x as { count: number }[] | null)?.[0]?.count ?? 0;
    return {
      id: String(r.id),
      maDinhDanh: r.ma_dinh_danh,
      ten: r.ten_don_vi,
      tenVietTat: r.ten_viet_tat,
      loai: r.loai_don_vi as LoaiDonVi,
      chucNangNhiemVu: r.chuc_nang_nhiem_vu,
      dienThoai: r.so_dien_thoai,
      email: r.email,
      truongDonViId: r.truong_don_vi_id != null ? String(r.truong_don_vi_id) : null,
      truongDonVi: truong ? truong.ho_va_ten : null,
      truongDonViHocVi: truong?.hoc_vi ?? null,
      truongDonViChucDanh: truong?.chuc_danh ?? null,
      phuTrachId: r.phu_trach_id != null ? String(r.phu_trach_id) : null,
      phuTrach: phuTrach ? phuTrach.ho_va_ten : null,
      soNhanSu: cnt(r.nhan_su),
      soDeTai: cnt(r.de_tai),
      soHopDong: cnt(r.hop_dong),
      thuTu: r.thu_tu,
      keHoachNam: r.ke_hoach_nam != null ? Number(r.ke_hoach_nam) : null,
      keHoachNamTruoc: r.ke_hoach_nam_truoc != null ? Number(r.ke_hoach_nam_truoc) : null,
      ghiChuKeHoach: r.ghi_chu_ke_hoach || null,
    };
  });
}

export interface DonViInput {
  ten: string;
  tenVietTat: string;
  maDinhDanh?: string;
  loai: LoaiDonVi;
  chucNangNhiemVu: string;
  dienThoai: string;
  email: string;
  phuTrachId: string;
  truongDonViId?: string;
  keHoachNam?: number | null;
  keHoachNamTruoc?: number | null;
  ghiChuKeHoach?: string;
}

function donViRow(input: DonViInput) {
  return {
    ten_don_vi: input.ten,
    ten_viet_tat: input.tenVietTat || null,
    ma_dinh_danh: input.maDinhDanh || null,
    loai_don_vi: input.loai,
    chuc_nang_nhiem_vu: input.chucNangNhiemVu || null,
    so_dien_thoai: input.dienThoai || null,
    email: input.email || null,
    phu_trach_id: input.phuTrachId ? Number(input.phuTrachId) : null,
    truong_don_vi_id: input.truongDonViId ? Number(input.truongDonViId) : null,
    ke_hoach_nam: input.keHoachNam != null ? Number(input.keHoachNam) : null,
    ke_hoach_nam_truoc: input.keHoachNamTruoc != null ? Number(input.keHoachNamTruoc) : null,
    ghi_chu_ke_hoach: input.ghiChuKeHoach || null,
  };
}

export async function createDonVi(input: DonViInput) {
  const { error } = await supabase.from('don_vi').insert(donViRow(input));
  throwIf(error);
}

export async function updateDonVi(id: string, input: DonViInput) {
  throwIfKhongGhiDuoc(
    await supabase.from('don_vi').update(donViRow(input)).eq('id', Number(id)).select('id'),
  );
}

export async function deleteDonVi(id: string) {
  throwIfKhongGhiDuoc(await supabase.from('don_vi').delete().eq('id', Number(id)).select('id'));
}

// ─── NHÂN SỰ ───

export async function fetchNhanSuFull(): Promise<NhanSu[]> {
  const { data, error } = await supabase
    .from('nhan_su')
    .select(
      `id, ma_dinh_danh, ho_va_ten, hoc_vi, chuc_danh, don_vi_id, email, so_dien_thoai, trang_thai, he_so_luong, phu_cap_chuc_vu,
       don_vi!nhan_su_don_vi_id_fkey(ten_don_vi, loai_don_vi, thu_tu),
       chung_chi_hanh_nghe(ten_linh_vuc_hanh_nghe, hang_chung_chi, ngay_het_han)`,
    )
    .order('id');
  throwIf(error);
  return (data ?? []).map((r) => {
    const ccList = (r.chung_chi_hanh_nghe ?? []) as unknown as {
      ten_linh_vuc_hanh_nghe: string;
      hang_chung_chi: string | null;
      ngay_het_han: string | null;
    }[];
    const cc = ccList[0];
    const dv = r.don_vi as unknown as { ten_don_vi: string; loai_don_vi?: string; thu_tu?: number } | null;
    return {
      id: String(r.id),
      maDinhDanh: r.ma_dinh_danh ?? undefined,
      hoTen: r.ho_va_ten,
      chucDanh: r.chuc_danh ?? '',
      hocVi: r.hoc_vi ?? '',
      donVi: dv?.ten_don_vi ?? '',
      donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
      donViThuTu: dv?.thu_tu ?? 999,
      donViLoai: dv?.loai_don_vi ?? '',
      email: r.email ?? '',
      soDienThoai: r.so_dien_thoai ?? '',
      trangThaiLamViec: r.trang_thai ?? 'dang-lam-viec',
      heSoLuong: r.he_so_luong != null ? Number(r.he_so_luong) : null,
      phuCapChucVu: r.phu_cap_chuc_vu != null ? Number(r.phu_cap_chuc_vu) : null,
      chungChi: cc
        ? `${cc.ten_linh_vuc_hanh_nghe}${cc.hang_chung_chi ? ` (${HANG_CHUNG_CHI[cc.hang_chung_chi] ?? cc.hang_chung_chi})` : ''}`
        : '—',
      hanChungChi: cc?.ngay_het_han ?? '',
    };
  });
}

export interface NhanSuInput {
  hoTen: string;
  hocVi: string;
  chucDanh: string;
  donViId: string;
  email: string;
  soDienThoai: string;
  trangThaiLamViec: string;
}

function nhanSuRow(input: NhanSuInput) {
  return {
    ho_va_ten: input.hoTen,
    hoc_vi: input.hocVi || null,
    chuc_danh: input.chucDanh || null,
    don_vi_id: input.donViId ? Number(input.donViId) : null,
    email: input.email || null,
    so_dien_thoai: input.soDienThoai || null,
    trang_thai: input.trangThaiLamViec,
  };
}

export async function createNhanSu(input: NhanSuInput) {
  const { error } = await supabase.from('nhan_su').insert(nhanSuRow(input));
  throwIf(error);
}

export async function updateNhanSu(id: string, input: NhanSuInput) {
  throwIfKhongGhiDuoc(
    await supabase.from('nhan_su').update(nhanSuRow(input)).eq('id', Number(id)).select('id'),
  );
}

export async function deleteNhanSu(id: string) {
  throwIfKhongGhiDuoc(await supabase.from('nhan_su').delete().eq('id', Number(id)).select('id'));
}
