import { supabase } from '../lib/supabase';
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
       so_dien_thoai, email, thu_tu, phu_trach_id,
       truong:nhan_su!don_vi_truong_don_vi_id_fkey(ho_va_ten, hoc_vi),
       phu_trach:nhan_su!don_vi_phu_trach_id_fkey(ho_va_ten),
       nhan_su!nhan_su_don_vi_id_fkey(count),
       de_tai(count), hop_dong(count)`,
    )
    .order('thu_tu');
  throwIf(error);
  return (data ?? []).map((r) => {
    const truong = r.truong as unknown as { ho_va_ten: string; hoc_vi: string | null } | null;
    const phuTrach = r.phu_trach as unknown as { ho_va_ten: string } | null;
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
      truongDonVi: truong ? truong.ho_va_ten : null,
      phuTrachId: r.phu_trach_id != null ? String(r.phu_trach_id) : null,
      phuTrach: phuTrach ? phuTrach.ho_va_ten : null,
      soNhanSu: cnt(r.nhan_su),
      soDeTai: cnt(r.de_tai),
      soHopDong: cnt(r.hop_dong),
      thuTu: r.thu_tu,
    };
  });
}

export interface DonViInput {
  ten: string;
  tenVietTat: string;
  loai: LoaiDonVi;
  chucNangNhiemVu: string;
  dienThoai: string;
  email: string;
  phuTrachId: string;
}

function donViRow(input: DonViInput) {
  return {
    ten_don_vi: input.ten,
    ten_viet_tat: input.tenVietTat || null,
    loai_don_vi: input.loai,
    chuc_nang_nhiem_vu: input.chucNangNhiemVu || null,
    so_dien_thoai: input.dienThoai || null,
    email: input.email || null,
    phu_trach_id: input.phuTrachId ? Number(input.phuTrachId) : null,
  };
}

export async function createDonVi(input: DonViInput) {
  const { error } = await supabase.from('don_vi').insert(donViRow(input));
  throwIf(error);
}

export async function updateDonVi(id: string, input: DonViInput) {
  const { error } = await supabase.from('don_vi').update(donViRow(input)).eq('id', Number(id));
  throwIf(error);
}

export async function deleteDonVi(id: string) {
  const { error } = await supabase.from('don_vi').delete().eq('id', Number(id));
  throwIf(error);
}

// ─── NHÂN SỰ ───

export async function fetchNhanSuFull(): Promise<NhanSu[]> {
  const { data, error } = await supabase
    .from('nhan_su')
    .select(
      `id, ho_va_ten, hoc_vi, chuc_danh, don_vi_id, email, so_dien_thoai, trang_thai,
       don_vi!nhan_su_don_vi_id_fkey(ten_don_vi),
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
    return {
      id: String(r.id),
      hoTen: r.ho_va_ten,
      chucDanh: r.chuc_danh ?? '',
      hocVi: r.hoc_vi ?? '',
      donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
      donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
      email: r.email ?? '',
      soDienThoai: r.so_dien_thoai ?? '',
      trangThaiLamViec: r.trang_thai ?? 'dang-lam-viec',
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
  const { error } = await supabase.from('nhan_su').update(nhanSuRow(input)).eq('id', Number(id));
  throwIf(error);
}

export async function deleteNhanSu(id: string) {
  const { error } = await supabase.from('nhan_su').delete().eq('id', Number(id));
  throwIf(error);
}
