// Nghiệp vụ Đảng - Đoàn thể: cây tổ chức, hồ sơ đảng viên/đoàn viên, quy trình
// phát triển đảng, sinh hoạt định kỳ, đảng phí/đoàn phí, khen thưởng - kỷ luật, thi đua.
// Xem docs/ke-hoach-hoan-thien-ph5-nhan-su-dang-doan-the.md §3.3-3.5.
import { supabase } from '../lib/supabase';
import type {
  ToChucDoanThe,
  LoaiToChucDoanThe,
  DangVien,
  DoanVienHoiVien,
  PhatTrienDang,
  PhatTrienDangBuoc,
  SinhHoatDinhKy,
  DiemDanhSinhHoat,
  ThuPhiDoanThe,
  KhenThuongKyLuat,
  ThiDua,
} from '../types';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}
const str = (v: string) => v || null;
const num = (v: string | number | null | undefined) => (v === '' || v == null ? null : Number(v));

// ─── Cây tổ chức Đảng - Đoàn thể ───

export async function fetchToChucDoanThe(): Promise<ToChucDoanThe[]> {
  const { data, error } = await supabase
    .from('to_chuc_doan_the')
    .select(
      `id, loai, cap, ten, ma, to_chuc_cha_id, don_vi_id, nguoi_dung_dau_id, pho_id,
       ngay_thanh_lap, nhiem_ky, trang_thai, thu_tu,
       don_vi:don_vi_id(ten_don_vi),
       nguoi_dung_dau:nguoi_dung_dau_id(ho_va_ten),
       pho:pho_id(ho_va_ten),
       dang_vien(count)`,
    )
    .order('thu_tu');
  throwIf(error);
  return (data ?? []).map((r) => {
    const donVi = r.don_vi as unknown as { ten_don_vi: string } | null;
    const nguoiDungDau = r.nguoi_dung_dau as unknown as { ho_va_ten: string } | null;
    const pho = r.pho as unknown as { ho_va_ten: string } | null;
    const cnt = (x: unknown) => (x as { count: number }[] | null)?.[0]?.count ?? 0;
    return {
      id: String(r.id),
      loai: r.loai as LoaiToChucDoanThe,
      cap: r.cap,
      ten: r.ten,
      ma: r.ma ?? '',
      toChucChaId: r.to_chuc_cha_id != null ? String(r.to_chuc_cha_id) : null,
      donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
      donVi: donVi?.ten_don_vi ?? '',
      nguoiDungDauId: r.nguoi_dung_dau_id != null ? String(r.nguoi_dung_dau_id) : null,
      nguoiDungDau: nguoiDungDau?.ho_va_ten ?? '',
      phoId: r.pho_id != null ? String(r.pho_id) : null,
      pho: pho?.ho_va_ten ?? '',
      ngayThanhLap: r.ngay_thanh_lap ?? '',
      nhiemKy: r.nhiem_ky ?? '',
      trangThai: r.trang_thai,
      thuTu: r.thu_tu,
      soDangVien: cnt(r.dang_vien),
    };
  });
}

export interface ToChucDoanTheInput {
  loai: LoaiToChucDoanThe;
  cap: string;
  ten: string;
  ma: string;
  toChucChaId: string;
  donViId: string;
  nguoiDungDauId: string;
  phoId: string;
  ngayThanhLap: string;
  nhiemKy: string;
}

function toChucRow(i: ToChucDoanTheInput) {
  return {
    loai: i.loai,
    cap: i.cap,
    ten: i.ten,
    ma: str(i.ma),
    to_chuc_cha_id: i.toChucChaId ? Number(i.toChucChaId) : null,
    don_vi_id: i.donViId ? Number(i.donViId) : null,
    nguoi_dung_dau_id: i.nguoiDungDauId ? Number(i.nguoiDungDauId) : null,
    pho_id: i.phoId ? Number(i.phoId) : null,
    ngay_thanh_lap: str(i.ngayThanhLap),
    nhiem_ky: str(i.nhiemKy),
  };
}

export async function createToChucDoanThe(i: ToChucDoanTheInput) {
  throwIf((await supabase.from('to_chuc_doan_the').insert(toChucRow(i))).error);
}
export async function updateToChucDoanThe(id: string, i: ToChucDoanTheInput) {
  throwIf((await supabase.from('to_chuc_doan_the').update(toChucRow(i)).eq('id', Number(id))).error);
}
export async function deleteToChucDoanThe(id: string) {
  throwIf((await supabase.from('to_chuc_doan_the').delete().eq('id', Number(id))).error);
}

// ─── Hồ sơ đảng viên ───

export async function fetchDangVien(): Promise<DangVien[]> {
  const { data, error } = await supabase
    .from('dang_vien')
    .select(
      `id, nhan_su_id, to_chuc_id, so_the_dang, ngay_vao_dang_du_bi, ngay_vao_dang_chinh_thuc,
       noi_ket_nap, nguoi_gioi_thieu_1, nguoi_gioi_thieu_2, chuc_vu_dang, trinh_do_ly_luan,
       trang_thai, ghi_chu,
       nhan_su:nhan_su_id(ho_va_ten, don_vi:don_vi_id(ten_don_vi)),
       to_chuc:to_chuc_id(ten)`,
    )
    .order('ngay_vao_dang_du_bi', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => {
    const ns = r.nhan_su as unknown as { ho_va_ten: string; don_vi: { ten_don_vi: string } | null } | null;
    const toChuc = r.to_chuc as unknown as { ten: string } | null;
    return {
      id: String(r.id),
      nhanSuId: String(r.nhan_su_id),
      hoTen: ns?.ho_va_ten ?? '',
      donVi: ns?.don_vi?.ten_don_vi ?? '',
      toChucId: String(r.to_chuc_id),
      toChuc: toChuc?.ten ?? '',
      soTheDang: r.so_the_dang ?? '',
      ngayVaoDangDuBi: r.ngay_vao_dang_du_bi,
      ngayVaoDangChinhThuc: r.ngay_vao_dang_chinh_thuc ?? '',
      noiKetNap: r.noi_ket_nap ?? '',
      nguoiGioiThieu1: r.nguoi_gioi_thieu_1 ?? '',
      nguoiGioiThieu2: r.nguoi_gioi_thieu_2 ?? '',
      chucVuDang: r.chuc_vu_dang ?? '',
      trinhDoLyLuan: r.trinh_do_ly_luan ?? '',
      trangThai: r.trang_thai,
      ghiChu: r.ghi_chu ?? '',
    };
  });
}

export interface DangVienInput {
  nhanSuId: string;
  toChucId: string;
  soTheDang: string;
  ngayVaoDangDuBi: string;
  ngayVaoDangChinhThuc: string;
  noiKetNap: string;
  nguoiGioiThieu1: string;
  nguoiGioiThieu2: string;
  chucVuDang: string;
  trinhDoLyLuan: string;
  trangThai: string;
  ghiChu: string;
}

function dangVienRow(i: DangVienInput) {
  return {
    nhan_su_id: Number(i.nhanSuId),
    to_chuc_id: Number(i.toChucId),
    so_the_dang: str(i.soTheDang),
    ngay_vao_dang_du_bi: i.ngayVaoDangDuBi,
    ngay_vao_dang_chinh_thuc: str(i.ngayVaoDangChinhThuc),
    noi_ket_nap: str(i.noiKetNap),
    nguoi_gioi_thieu_1: str(i.nguoiGioiThieu1),
    nguoi_gioi_thieu_2: str(i.nguoiGioiThieu2),
    chuc_vu_dang: str(i.chucVuDang),
    trinh_do_ly_luan: str(i.trinhDoLyLuan),
    trang_thai: i.trangThai,
    ghi_chu: str(i.ghiChu),
  };
}

export async function createDangVien(i: DangVienInput) {
  throwIf((await supabase.from('dang_vien').insert(dangVienRow(i))).error);
}
export async function updateDangVien(id: string, i: DangVienInput) {
  throwIf((await supabase.from('dang_vien').update(dangVienRow(i)).eq('id', Number(id))).error);
}
export async function deleteDangVien(id: string) {
  throwIf((await supabase.from('dang_vien').delete().eq('id', Number(id))).error);
}

// ─── Đoàn viên / hội viên (Đoàn TN, Công đoàn, CCB, Nữ công) ───

export async function fetchDoanVienHoiVien(loai?: LoaiToChucDoanThe): Promise<DoanVienHoiVien[]> {
  let q = supabase
    .from('doan_vien_hoi_vien')
    .select('id, nhan_su_id, to_chuc_id, loai, so_the, ngay_ket_nap, chuc_vu, trang_thai, nhan_su:nhan_su_id(ho_va_ten)');
  if (loai) q = q.eq('loai', loai);
  const { data, error } = await q.order('ngay_ket_nap', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId: String(r.nhan_su_id),
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    toChucId: String(r.to_chuc_id),
    loai: r.loai as LoaiToChucDoanThe,
    soThe: r.so_the ?? '',
    ngayKetNap: r.ngay_ket_nap ?? '',
    chucVu: r.chuc_vu ?? '',
    trangThai: r.trang_thai,
  }));
}

export interface DoanVienHoiVienInput {
  nhanSuId: string;
  toChucId: string;
  loai: LoaiToChucDoanThe;
  soThe: string;
  ngayKetNap: string;
  chucVu: string;
  trangThai: string;
}

export async function createDoanVienHoiVien(i: DoanVienHoiVienInput) {
  throwIf(
    (
      await supabase.from('doan_vien_hoi_vien').insert({
        nhan_su_id: Number(i.nhanSuId),
        to_chuc_id: Number(i.toChucId),
        loai: i.loai,
        so_the: str(i.soThe),
        ngay_ket_nap: str(i.ngayKetNap),
        chuc_vu: str(i.chucVu),
        trang_thai: i.trangThai,
      })
    ).error,
  );
}
export async function deleteDoanVienHoiVien(id: string) {
  throwIf((await supabase.from('doan_vien_hoi_vien').delete().eq('id', Number(id))).error);
}

// ─── Quy trình phát triển đảng viên ───

export async function fetchPhatTrienDang(): Promise<PhatTrienDang[]> {
  const { data, error } = await supabase
    .from('phat_trien_dang')
    .select(
      `id, nhan_su_id, to_chuc_id, buoc_hien_tai, ngay_bat_dau, ngay_du_kien_ket_nap,
       nguoi_theo_doi_id, ghi_chu, trang_thai,
       nhan_su:nhan_su_id(ho_va_ten, don_vi:don_vi_id(ten_don_vi)),
       to_chuc:to_chuc_id(ten),
       nguoi_theo_doi:nguoi_theo_doi_id(ho_va_ten)`,
    )
    .order('ngay_bat_dau', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => {
    const ns = r.nhan_su as unknown as { ho_va_ten: string; don_vi: { ten_don_vi: string } | null } | null;
    const toChuc = r.to_chuc as unknown as { ten: string } | null;
    const nguoiTheoDoi = r.nguoi_theo_doi as unknown as { ho_va_ten: string } | null;
    return {
      id: String(r.id),
      nhanSuId: String(r.nhan_su_id),
      hoTen: ns?.ho_va_ten ?? '',
      donVi: ns?.don_vi?.ten_don_vi ?? '',
      toChucId: String(r.to_chuc_id),
      toChuc: toChuc?.ten ?? '',
      buocHienTai: r.buoc_hien_tai,
      ngayBatDau: r.ngay_bat_dau ?? '',
      ngayDuKienKetNap: r.ngay_du_kien_ket_nap ?? '',
      nguoiTheoDoiId: r.nguoi_theo_doi_id != null ? String(r.nguoi_theo_doi_id) : null,
      nguoiTheoDoi: nguoiTheoDoi?.ho_va_ten ?? '',
      ghiChu: r.ghi_chu ?? '',
      trangThai: r.trang_thai,
    };
  });
}

export interface PhatTrienDangInput {
  nhanSuId: string;
  toChucId: string;
  buocHienTai: string;
  ngayBatDau: string;
  ngayDuKienKetNap: string;
  nguoiTheoDoiId: string;
  ghiChu: string;
  trangThai: string;
}

function phatTrienRow(i: PhatTrienDangInput) {
  return {
    nhan_su_id: Number(i.nhanSuId),
    to_chuc_id: Number(i.toChucId),
    buoc_hien_tai: i.buocHienTai,
    ngay_bat_dau: str(i.ngayBatDau),
    ngay_du_kien_ket_nap: str(i.ngayDuKienKetNap),
    nguoi_theo_doi_id: i.nguoiTheoDoiId ? Number(i.nguoiTheoDoiId) : null,
    ghi_chu: str(i.ghiChu),
    trang_thai: i.trangThai,
  };
}

export async function createPhatTrienDang(i: PhatTrienDangInput) {
  throwIf((await supabase.from('phat_trien_dang').insert(phatTrienRow(i))).error);
}
export async function updatePhatTrienDang(id: string, i: PhatTrienDangInput) {
  throwIf((await supabase.from('phat_trien_dang').update(phatTrienRow(i)).eq('id', Number(id))).error);
}
export async function deletePhatTrienDang(id: string) {
  throwIf((await supabase.from('phat_trien_dang').delete().eq('id', Number(id))).error);
}

export async function fetchPhatTrienDangBuoc(phatTrienId: string): Promise<PhatTrienDangBuoc[]> {
  const { data, error } = await supabase
    .from('phat_trien_dang_buoc')
    .select('id, buoc, ngay_hoan_thanh, so_van_ban, ghi_chu')
    .eq('phat_trien_id', Number(phatTrienId))
    .order('created_at');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    phatTrienId,
    buoc: r.buoc,
    ngayHoanThanh: r.ngay_hoan_thanh ?? '',
    soVanBan: r.so_van_ban ?? '',
    ghiChu: r.ghi_chu ?? '',
  }));
}

export async function ghiNhanBuocPhatTrien(
  phatTrienId: string,
  buoc: string,
  input: { ngayHoanThanh: string; soVanBan: string; ghiChu: string },
) {
  throwIf(
    (
      await supabase.from('phat_trien_dang_buoc').insert({
        phat_trien_id: Number(phatTrienId),
        buoc,
        ngay_hoan_thanh: str(input.ngayHoanThanh),
        so_van_ban: str(input.soVanBan),
        ghi_chu: str(input.ghiChu),
      })
    ).error,
  );
}

// ─── Sinh hoạt định kỳ + điểm danh ───

export async function fetchSinhHoatDinhKy(toChucId?: string): Promise<SinhHoatDinhKy[]> {
  let q = supabase
    .from('sinh_hoat_dinh_ky')
    .select(
      `id, to_chuc_id, ky, ngay_hop, dia_diem, chu_tri_id, thu_ky_id, chuyen_de, noi_dung,
       nghi_quyet, so_bien_ban, trang_thai,
       to_chuc:to_chuc_id(ten), chu_tri:chu_tri_id(ho_va_ten), diem_danh_sinh_hoat(count)`,
    );
  if (toChucId) q = q.eq('to_chuc_id', Number(toChucId));
  const { data, error } = await q.order('ngay_hop', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => {
    const toChuc = r.to_chuc as unknown as { ten: string } | null;
    const chuTri = r.chu_tri as unknown as { ho_va_ten: string } | null;
    const cnt = (x: unknown) => (x as { count: number }[] | null)?.[0]?.count ?? 0;
    return {
      id: String(r.id),
      toChucId: String(r.to_chuc_id),
      toChuc: toChuc?.ten ?? '',
      ky: r.ky,
      ngayHop: r.ngay_hop,
      diaDiem: r.dia_diem ?? '',
      chuTriId: r.chu_tri_id != null ? String(r.chu_tri_id) : null,
      chuTri: chuTri?.ho_va_ten ?? '',
      thuKyId: r.thu_ky_id != null ? String(r.thu_ky_id) : null,
      chuyenDe: r.chuyen_de ?? '',
      noiDung: r.noi_dung ?? '',
      nghiQuyet: r.nghi_quyet ?? '',
      soBienBan: r.so_bien_ban ?? '',
      trangThai: r.trang_thai,
      soThamGia: cnt(r.diem_danh_sinh_hoat),
    };
  });
}

export interface SinhHoatDinhKyInput {
  toChucId: string;
  ky: string;
  ngayHop: string;
  diaDiem: string;
  chuTriId: string;
  chuyenDe: string;
  noiDung: string;
  nghiQuyet: string;
  soBienBan: string;
  trangThai: string;
}

function sinhHoatRow(i: SinhHoatDinhKyInput) {
  return {
    to_chuc_id: Number(i.toChucId),
    ky: i.ky,
    ngay_hop: i.ngayHop,
    dia_diem: str(i.diaDiem),
    chu_tri_id: i.chuTriId ? Number(i.chuTriId) : null,
    chuyen_de: str(i.chuyenDe),
    noi_dung: str(i.noiDung),
    nghi_quyet: str(i.nghiQuyet),
    so_bien_ban: str(i.soBienBan),
    trang_thai: i.trangThai,
  };
}

export async function createSinhHoatDinhKy(i: SinhHoatDinhKyInput) {
  throwIf((await supabase.from('sinh_hoat_dinh_ky').insert(sinhHoatRow(i))).error);
}
export async function updateSinhHoatDinhKy(id: string, i: SinhHoatDinhKyInput) {
  throwIf((await supabase.from('sinh_hoat_dinh_ky').update(sinhHoatRow(i)).eq('id', Number(id))).error);
}
export async function deleteSinhHoatDinhKy(id: string) {
  throwIf((await supabase.from('sinh_hoat_dinh_ky').delete().eq('id', Number(id))).error);
}

export async function fetchDiemDanh(sinhHoatId: string): Promise<DiemDanhSinhHoat[]> {
  const { data, error } = await supabase
    .from('diem_danh_sinh_hoat')
    .select('id, nhan_su_id, co_mat, ly_do, nhan_su:nhan_su_id(ho_va_ten)')
    .eq('sinh_hoat_id', Number(sinhHoatId));
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    sinhHoatId,
    nhanSuId: String(r.nhan_su_id),
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    coMat: r.co_mat,
    lyDo: r.ly_do ?? '',
  }));
}

export async function ghiDiemDanh(sinhHoatId: string, nhanSuId: string, coMat: string, lyDo: string) {
  throwIf(
    (
      await supabase
        .from('diem_danh_sinh_hoat')
        .upsert(
          { sinh_hoat_id: Number(sinhHoatId), nhan_su_id: Number(nhanSuId), co_mat: coMat, ly_do: str(lyDo) },
          { onConflict: 'sinh_hoat_id,nhan_su_id' },
        )
    ).error,
  );
}

// ─── Đảng phí / đoàn phí / công đoàn phí ───

export async function fetchThuPhiDoanThe(ky?: string): Promise<ThuPhiDoanThe[]> {
  let q = supabase
    .from('thu_phi_doan_the')
    .select('id, nhan_su_id, to_chuc_id, loai_phi, ky, muc_dong, so_tien_phai_nop, so_tien_da_nop, ngay_nop, hinh_thuc, trang_thai, nhan_su:nhan_su_id(ho_va_ten)');
  if (ky) q = q.eq('ky', ky);
  const { data, error } = await q.order('ky', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId: String(r.nhan_su_id),
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    toChucId: String(r.to_chuc_id),
    loaiPhi: r.loai_phi,
    ky: r.ky,
    mucDong: Number(r.muc_dong),
    soTienPhaiNop: Number(r.so_tien_phai_nop),
    soTienDaNop: Number(r.so_tien_da_nop),
    ngayNop: r.ngay_nop ?? '',
    hinhThuc: r.hinh_thuc ?? '',
    trangThai: r.trang_thai,
  }));
}

export interface ThuPhiDoanTheInput {
  nhanSuId: string;
  toChucId: string;
  loaiPhi: string;
  ky: string;
  mucDong: string;
  soTienPhaiNop: string;
  soTienDaNop: string;
  ngayNop: string;
  hinhThuc: string;
  trangThai: string;
}

function thuPhiRow(i: ThuPhiDoanTheInput) {
  return {
    nhan_su_id: Number(i.nhanSuId),
    to_chuc_id: Number(i.toChucId),
    loai_phi: i.loaiPhi,
    ky: i.ky,
    muc_dong: num(i.mucDong) ?? 0,
    so_tien_phai_nop: num(i.soTienPhaiNop) ?? 0,
    so_tien_da_nop: num(i.soTienDaNop) ?? 0,
    ngay_nop: str(i.ngayNop),
    hinh_thuc: str(i.hinhThuc),
    trang_thai: i.trangThai,
  };
}

export async function createThuPhiDoanThe(i: ThuPhiDoanTheInput) {
  throwIf((await supabase.from('thu_phi_doan_the').insert(thuPhiRow(i))).error);
}
export async function updateThuPhiDoanThe(id: string, i: ThuPhiDoanTheInput) {
  throwIf((await supabase.from('thu_phi_doan_the').update(thuPhiRow(i)).eq('id', Number(id))).error);
}
export async function deleteThuPhiDoanThe(id: string) {
  throwIf((await supabase.from('thu_phi_doan_the').delete().eq('id', Number(id))).error);
}

// ─── Khen thưởng - kỷ luật ───

export async function fetchKhenThuongKyLuat(phamVi?: string): Promise<KhenThuongKyLuat[]> {
  let q = supabase
    .from('khen_thuong_ky_luat')
    .select(
      `id, doi_tuong, nhan_su_id, don_vi_id, pham_vi, loai, hinh_thuc, cap_quyet_dinh,
       so_quyet_dinh, ngay_quyet_dinh, nam, ly_do,
       nhan_su:nhan_su_id(ho_va_ten), don_vi:don_vi_id(ten_don_vi)`,
    );
  if (phamVi) q = q.eq('pham_vi', phamVi);
  const { data, error } = await q.order('ngay_quyet_dinh', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    doiTuong: r.doi_tuong,
    nhanSuId: r.nhan_su_id != null ? String(r.nhan_su_id) : null,
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    phamVi: r.pham_vi,
    loai: r.loai,
    hinhThuc: r.hinh_thuc,
    capQuyetDinh: r.cap_quyet_dinh ?? '',
    soQuyetDinh: r.so_quyet_dinh ?? '',
    ngayQuyetDinh: r.ngay_quyet_dinh ?? '',
    nam: r.nam,
    lyDo: r.ly_do ?? '',
  }));
}

export interface KhenThuongKyLuatInput {
  doiTuong: string;
  nhanSuId: string;
  donViId: string;
  toChucId: string;
  phamVi: string;
  loai: string;
  hinhThuc: string;
  capQuyetDinh: string;
  soQuyetDinh: string;
  ngayQuyetDinh: string;
  nam: string;
  lyDo: string;
}

function khenThuongRow(i: KhenThuongKyLuatInput) {
  return {
    doi_tuong: i.doiTuong,
    nhan_su_id: i.nhanSuId ? Number(i.nhanSuId) : null,
    don_vi_id: i.donViId ? Number(i.donViId) : null,
    to_chuc_id: i.toChucId ? Number(i.toChucId) : null,
    pham_vi: i.phamVi,
    loai: i.loai,
    hinh_thuc: i.hinhThuc,
    cap_quyet_dinh: str(i.capQuyetDinh),
    so_quyet_dinh: str(i.soQuyetDinh),
    ngay_quyet_dinh: str(i.ngayQuyetDinh),
    nam: num(i.nam),
    ly_do: str(i.lyDo),
  };
}

export async function createKhenThuongKyLuat(i: KhenThuongKyLuatInput) {
  throwIf((await supabase.from('khen_thuong_ky_luat').insert(khenThuongRow(i))).error);
}
export async function deleteKhenThuongKyLuat(id: string) {
  throwIf((await supabase.from('khen_thuong_ky_luat').delete().eq('id', Number(id))).error);
}

// ─── Thi đua ───

export async function fetchThiDua(nam?: number): Promise<ThiDua[]> {
  let q = supabase
    .from('thi_dua')
    .select('id, doi_tuong, nhan_su_id, don_vi_id, nam, danh_hieu_dang_ky, danh_hieu_dat, trang_thai, nhan_su:nhan_su_id(ho_va_ten), don_vi:don_vi_id(ten_don_vi)');
  if (nam) q = q.eq('nam', nam);
  const { data, error } = await q.order('nam', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    doiTuong: r.doi_tuong,
    nhanSuId: r.nhan_su_id != null ? String(r.nhan_su_id) : null,
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    nam: r.nam,
    danhHieuDangKy: r.danh_hieu_dang_ky ?? '',
    danhHieuDat: r.danh_hieu_dat ?? '',
    trangThai: r.trang_thai,
  }));
}

export interface ThiDuaInput {
  doiTuong: string;
  nhanSuId: string;
  donViId: string;
  nam: string;
  danhHieuDangKy: string;
  danhHieuDat: string;
  trangThai: string;
}

function thiDuaRow(i: ThiDuaInput) {
  return {
    doi_tuong: i.doiTuong,
    nhan_su_id: i.nhanSuId ? Number(i.nhanSuId) : null,
    don_vi_id: i.donViId ? Number(i.donViId) : null,
    nam: num(i.nam) ?? new Date().getFullYear(),
    danh_hieu_dang_ky: str(i.danhHieuDangKy),
    danh_hieu_dat: str(i.danhHieuDat),
    trang_thai: i.trangThai,
  };
}

export async function createThiDua(i: ThiDuaInput) {
  throwIf((await supabase.from('thi_dua').insert(thiDuaRow(i))).error);
}
export async function updateThiDua(id: string, i: ThiDuaInput) {
  throwIf((await supabase.from('thi_dua').update(thiDuaRow(i)).eq('id', Number(id))).error);
}
export async function deleteThiDua(id: string) {
  throwIf((await supabase.from('thi_dua').delete().eq('id', Number(id))).error);
}
