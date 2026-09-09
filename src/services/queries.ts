import { supabase } from '../lib/supabase';
import { throwIfKhongGhiDuoc } from '../lib/rlsGuard';
import type {
  VanBan,
  DeTai,
  HopDong,
  MauThiNghiem,
  LopDaoTao,
  NghienCuuSinh,
  TrangThai,
} from '../types';
import type { NhomHD } from '../lib/qc2815';

// Nhãn hiển thị cho mã danh mục (dm_danh_muc)
const CAP_DE_TAI: Record<string, DeTai['cap']> = {
  'nha-nuoc': 'Nhà nước',
  bo: 'Bộ',
  'co-so': 'Cơ sở',
};
export const CAP_DE_TAI_OPTIONS = [
  { value: 'nha-nuoc', label: 'Nhà nước' },
  { value: 'bo', label: 'Bộ' },
  { value: 'co-so', label: 'Cơ sở' },
];

const LOAI_DAO_TAO: Record<string, LopDaoTao['loai']> = {
  ncs: 'NCS',
  'tap-huan': 'Tập huấn',
  'hoi-thao': 'Hội thảo',
};
export const LOAI_DAO_TAO_OPTIONS = [
  { value: 'ncs', label: 'NCS' },
  { value: 'tap-huan', label: 'Tập huấn' },
  { value: 'hoi-thao', label: 'Hội thảo' },
];

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const num = (v: string) => (v ? Number(v) : null);
const str = (v: string) => v || null;

// ─── DANH SÁCH CHỌN (cho form) ───

export interface Option {
  id: string;
  ten: string;
  donViId?: string | null;
}

export async function fetchDonViOptions(): Promise<Option[]> {
  const { data, error } = await supabase
    .from('don_vi')
    .select('id, ten_don_vi')
    .order('thu_tu');
  throwIf(error);
  return (data ?? []).map((r) => ({ id: String(r.id), ten: r.ten_don_vi }));
}

export async function fetchNhanSuOptions(): Promise<Option[]> {
  const { data, error } = await supabase
    .from('nhan_su')
    .select('id, ho_va_ten, chuc_danh, don_vi_id')
    .order('ho_va_ten');
  throwIf(error);

  const seen = new Set<string>();
  const list: Option[] = [];

  for (const r of data ?? []) {
    const key = (r.ho_va_ten || '').trim().toLowerCase();
    if (!seen.has(key)) {
      seen.add(key);
      const chucVu = r.chuc_danh ? ` (${r.chuc_danh})` : '';
      list.push({
        id: String(r.id),
        ten: `${r.ho_va_ten}${chucVu}`,
        donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
      });
    }
  }

  return list;
}

export async function fetchKhachHangOptions(): Promise<Option[]> {
  const { data, error } = await supabase
    .from('khach_hang')
    .select('id, ten_to_chuc')
    .order('ten_to_chuc');
  throwIf(error);
  return (data ?? []).map((r) => ({ id: String(r.id), ten: r.ten_to_chuc }));
}

// ─── VĂN BẢN ───

export async function fetchVanBan(): Promise<VanBan[]> {
  const { data, error } = await supabase
    .from('van_ban')
    .select(
      'id, so_hieu, trich_yeu, loai, don_vi_id, ngay_van_ban, trang_thai, tep_dinh_kem, ten_tep, don_vi(ten_don_vi)',
    )
    .order('ngay_van_ban', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    soHieu: r.so_hieu,
    trichYeu: r.trich_yeu,
    loai: r.loai === 'den' ? 'Đến' : 'Đi',
    donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? 'Lãnh đạo Viện',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    ngay: r.ngay_van_ban,
    trangThai: r.trang_thai as TrangThai,
    tepDinhKem: r.tep_dinh_kem ?? null,
    tenTep: r.ten_tep ?? null,
  }));
}

export interface VanBanInput {
  soHieu: string;
  trichYeu: string;
  loai: 'den' | 'di';
  donViId: string;
  ngay: string;
  trangThai: string;
}

function vanBanRow(i: VanBanInput) {
  return {
    so_hieu: i.soHieu,
    trich_yeu: i.trichYeu,
    loai: i.loai,
    don_vi_id: num(i.donViId),
    ngay_van_ban: i.ngay,
    trang_thai: i.trangThai,
  };
}

export async function createVanBan(i: VanBanInput) {
  throwIf((await supabase.from('van_ban').insert(vanBanRow(i))).error);
}
export async function updateVanBan(id: string, i: VanBanInput) {
  throwIfKhongGhiDuoc(await supabase.from('van_ban').update(vanBanRow(i)).eq('id', Number(id)).select('id'));
}
export async function deleteVanBan(id: string) {
  throwIfKhongGhiDuoc(await supabase.from('van_ban').delete().eq('id', Number(id)).select('id'));
}

// ─── ĐỀ TÀI ───

export async function fetchDeTai(): Promise<DeTai[]> {
  const { data, error } = await supabase
    .from('de_tai')
    .select(
      'id, ma_so, ten_de_tai, cap_de_tai, chu_nhiem_id, don_vi_id, kinh_phi, tien_do, han_nghiem_thu, trang_thai, nhan_su(ho_va_ten, hoc_vi), don_vi(ten_don_vi)',
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
      capMa: r.cap_de_tai,
      chuNhiem: cn ? cn.ho_va_ten : '—',
      chuNhiemId: r.chu_nhiem_id != null ? String(r.chu_nhiem_id) : null,
      donVi: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
      donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
      kinhPhi: Number(r.kinh_phi),
      tienDo: r.tien_do,
      hanNghiemThu: r.han_nghiem_thu ?? '',
      trangThai: r.trang_thai as TrangThai,
    };
  });
}

export interface DeTaiInput {
  maSo: string;
  ten: string;
  capMa: string;
  chuNhiemId: string;
  donViId: string;
  kinhPhi: string;
  tienDo: string;
  hanNghiemThu: string;
  trangThai: string;
}

function deTaiRow(i: DeTaiInput) {
  return {
    ma_so: i.maSo,
    ten_de_tai: i.ten,
    cap_de_tai: i.capMa,
    chu_nhiem_id: num(i.chuNhiemId),
    don_vi_id: num(i.donViId),
    kinh_phi: Number(i.kinhPhi) || 0,
    tien_do: Math.min(100, Math.max(0, Number(i.tienDo) || 0)),
    han_nghiem_thu: str(i.hanNghiemThu),
    trang_thai: i.trangThai,
  };
}

export async function createDeTai(i: DeTaiInput) {
  throwIf((await supabase.from('de_tai').insert(deTaiRow(i))).error);
}
export async function updateDeTai(id: string, i: DeTaiInput) {
  throwIfKhongGhiDuoc(await supabase.from('de_tai').update(deTaiRow(i)).eq('id', Number(id)).select('id'));
}
export async function deleteDeTai(id: string) {
  throwIfKhongGhiDuoc(await supabase.from('de_tai').delete().eq('id', Number(id)).select('id'));
}

// ─── HỢP ĐỒNG ───

const COT_HOP_DONG_CO_BAN =
  'id, so_hop_dong, ten_hop_dong, khach_hang_id, don_vi_id, gia_tri, da_thanh_toan, ngay_ky, han_hoan_thanh, trang_thai, nhom_hd, chu_tri_id, gia_du_thau, ngay_nop_ho_so, trang_thai_phe_duyet, ngay_trinh_duyet, ngay_duyet, nguoi_duyet_id, trang_thai_quyet_toan, ngay_quyet_toan, han_chung_tu_quyet_toan, loai_dac_thu, phan_vien_xa, giam_theo_yeu_cau_don_vi, phuc_tap, cap_ky, quan_ly_tap_trung, dong_dau_so_bo, ngay_dong_dau_so_bo, so_vb_chap_thuan_dau_so_bo, pho_don_vi_quan_ly_id, nguoi_tao_id, khach_hang(ten_to_chuc), don_vi(ten_don_vi), chu_tri:nhan_su!hop_dong_chu_tri_id_fkey(ho_va_ten), nguoi_duyet:nhan_su!hop_dong_nguoi_duyet_id_fkey(ho_va_ten), nguoi_tao:nhan_su!hop_dong_nguoi_tao_id_fkey(ho_va_ten), pho_don_vi_quan_ly:nhan_su!hop_dong_pho_don_vi_quan_ly_id_fkey(ho_va_ten)';

export async function fetchHopDong(): Promise<HopDong[]> {
  let fetchedData: any[] = [];

  const res = await supabase
    .from('hop_dong')
    .select(`${COT_HOP_DONG_CO_BAN}, buoc_hien_tai`)
    .order('ngay_ky', { ascending: false });

  if (res.error?.message?.includes('buoc_hien_tai')) {
    // CSDL chưa chạy migration thêm cột buoc_hien_tai — vẫn đọc được các cột còn lại.
    const fallbackRes = await supabase
      .from('hop_dong')
      .select(COT_HOP_DONG_CO_BAN)
      .order('ngay_ky', { ascending: false });
    throwIf(fallbackRes.error);
    fetchedData = fallbackRes.data ?? [];
  } else {
    throwIf(res.error);
    fetchedData = res.data ?? [];
  }

  const mapped = fetchedData.map((r: any) => ({
    id: String(r.id),
    soHD: r.so_hop_dong,
    ten: r.ten_hop_dong,
    khachHang: (r.khach_hang as unknown as { ten_to_chuc: string } | null)?.ten_to_chuc ?? '—',
    khachHangId: r.khach_hang_id != null ? String(r.khach_hang_id) : null,
    donViThucHien: (r.don_vi as unknown as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    giaTri: Number(r.gia_tri),
    daThanhToan: Number(r.da_thanh_toan),
    nguoiTaoId: r.nguoi_tao_id != null ? String(r.nguoi_tao_id) : null,
    nguoiTao: (r.nguoi_tao as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    ngayKy: r.ngay_ky ?? '',
    hanHoanThanh: r.han_hoan_thanh ?? '',
    trangThai: r.trang_thai as TrangThai,
    nhomHD: (r.nhom_hd as NhomHD | null) ?? null,
    // Không bịa chủ trì mặc định — HĐ chưa phân công phải hiện đúng là "chưa phân công" (Điều 7.4).
    chuTriId: r.chu_tri_id != null ? String(r.chu_tri_id) : null,
    chuTri: (r.chu_tri as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    giaDuThau: r.gia_du_thau != null ? Number(r.gia_du_thau) : null,
    ngayNopHoSo: r.ngay_nop_ho_so ?? '',
    trangThaiPheDuyet: r.trang_thai_phe_duyet as HopDong['trangThaiPheDuyet'],
    ngayTrinhDuyet: r.ngay_trinh_duyet ?? '',
    ngayDuyet: r.ngay_duyet ?? '',
    nguoiDuyetId: r.nguoi_duyet_id != null ? String(r.nguoi_duyet_id) : null,
    nguoiDuyet: (r.nguoi_duyet as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    trangThaiQuyetToan: r.trang_thai_quyet_toan as HopDong['trangThaiQuyetToan'],
    ngayQuyetToan: r.ngay_quyet_toan ?? '',
    hanChungTuQuyetToan: r.han_chung_tu_quyet_toan ?? '',
    loaiDacThu: (r.loai_dac_thu as HopDong['loaiDacThu']) ?? null,
    phanVienXa: !!r.phan_vien_xa,
    giamTheoYeuCauDonVi: !!r.giam_theo_yeu_cau_don_vi,
    phucTap: !!r.phuc_tap,
    capKy: (r.cap_ky as HopDong['capKy']) ?? null,
    quanLyTapTrung: !!r.quan_ly_tap_trung,
    dongDauSoBo: !!r.dong_dau_so_bo,
    ngayDongDauSoBo: r.ngay_dong_dau_so_bo ?? '',
    soVbChapThuanDauSoBo: r.so_vb_chap_thuan_dau_so_bo ?? '',
    phoDonViQuanLyId: r.pho_don_vi_quan_ly_id != null ? String(r.pho_don_vi_quan_ly_id) : null,
    phoDonViQuanLy: (r.pho_don_vi_quan_ly as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    buocHienTai: r.buoc_hien_tai ?? 'du-thao',
    fileDuThaoUrl: r.file_du_thao_url ?? r.fileDuThaoUrl ?? '',
    tenFileDuThao: r.ten_file_du_thao ?? r.tenFileDuThao ?? '',
  }));

  return mapped;
}


/**
 * Dữ liệu ghi của hợp đồng.
 *
 * KHÔNG có `daThanhToan`: số tiền đã thu là SỐ DẪN XUẤT từ bảng `dot_thanh_toan`
 * (đợt có ngày thực thu), do trigger `trg_dot_thanh_toan_dong_bo` giữ — migration 0034.
 * Trước đây form hợp đồng ghi đè cột này bằng ô nhập tay để trống nên toàn bộ 17 hợp
 * đồng bị về 0 dù chứng từ ghi nhận 32,32 tỷ đã thu.
 */
export interface HopDongInput {
  soHD: string;
  ten: string;
  khachHangId: string;
  donViId: string;
  giaTri: string;
  ngayKy: string;
  hanHoanThanh: string;
  trangThai: string;
  nhomHD: string;
  chuTriId: string;
  giaDuThau: string;
  ngayNopHoSo: string;
  trangThaiPheDuyet: string;
  ngayTrinhDuyet?: string;
  ngayDuyet?: string;
  hanChungTuQuyetToan?: string;
  loaiDacThu: string;
  phanVienXa: boolean;
  giamTheoYeuCauDonVi: boolean;
  phucTap: boolean;
  capKy: string;
  /** Đ.3.o + Đ.7.1c — mô hình quản lý tập trung tại đơn vị (quyết định nhánh D của luồng giao việc). */
  quanLyTapTrung: boolean;
  /** Đ.8.2 — đóng dấu sơ bộ; trigger fn_kiem_soat_dau_so_bo kiểm tra thẩm quyền theo cấp ký. */
  dongDauSoBo: boolean;
  ngayDongDauSoBo?: string;
  soVbChapThuanDauSoBo?: string;
  /** Đ.8.3 — phó đơn vị quản lý khi Trưởng đơn vị là chủ trì. */
  phoDonViQuanLyId?: string;
  fileDuThaoUrl?: string;
  tenFileDuThao?: string;
  dauThauId?: string;
}

function hopDongRow(i: HopDongInput) {
  return {
    so_hop_dong: i.soHD,
    ten_hop_dong: i.ten,
    khach_hang_id: num(i.khachHangId),
    don_vi_id: num(i.donViId),
    gia_tri: Number(i.giaTri) || 0,
    // da_thanh_toan: KHÔNG ghi ở đây — trigger CSDL giữ theo chứng từ đợt thanh toán (0034).
    ngay_ky: str(i.ngayKy),
    han_hoan_thanh: str(i.hanHoanThanh),
    trang_thai: i.trangThai,
    nhom_hd: str(i.nhomHD),
    chu_tri_id: num(i.chuTriId),
    gia_du_thau: num(i.giaDuThau),
    ngay_nop_ho_so: str(i.ngayNopHoSo),
    trang_thai_phe_duyet: i.trangThaiPheDuyet || 'khong-ap-dung',
    ngay_trinh_duyet: str(i.ngayTrinhDuyet ?? ''),
    han_chung_tu_quyet_toan: str(i.hanChungTuQuyetToan ?? ''),
    loai_dac_thu: str(i.loaiDacThu),
    phan_vien_xa: i.phanVienXa,
    giam_theo_yeu_cau_don_vi: i.giamTheoYeuCauDonVi,
    phuc_tap: i.phucTap,
    cap_ky: i.capKy || null,
    quan_ly_tap_trung: i.quanLyTapTrung,
    dong_dau_so_bo: i.dongDauSoBo,
    ngay_dong_dau_so_bo: str(i.ngayDongDauSoBo ?? ''),
    so_vb_chap_thuan_dau_so_bo: str(i.soVbChapThuanDauSoBo ?? ''),
    pho_don_vi_quan_ly_id: num(i.phoDonViQuanLyId ?? ''),
    ngay_duyet: str(i.ngayDuyet ?? ''),
    buoc_hien_tai: i.trangThai === 'cho-duyet' ? 'cho-duyet' : i.trangThai === 'dang-thuc-hien' ? 'dang-thuc-hien' : 'du-thao',
    file_du_thao_url: str(i.fileDuThaoUrl ?? ''),
    ten_file_du_thao: str(i.tenFileDuThao ?? ''),
  };
}

/** Cột file dự thảo có thể chưa tồn tại nếu CSDL chưa chạy migration tương ứng — chỉ bỏ
 * riêng 2 cột này rồi thử lại, mọi lỗi khác vẫn phải ném ra cho người dùng biết. */
function thieuCotFileDuThao(error: { message: string } | null): boolean {
  return !!error?.message?.includes('file_du_thao_url') || !!error?.message?.includes('ten_file_du_thao');
}

export async function createHopDong(i: HopDongInput) {
  const row = hopDongRow(i);
  const { data, error } = await supabase.from('hop_dong').insert(row).select('id').single();
  let createdId = data?.id;
  if (error) {
    if (!thieuCotFileDuThao(error)) throw new Error(error.message);
    delete (row as any).file_du_thao_url;
    delete (row as any).ten_file_du_thao;
    const res2 = await supabase.from('hop_dong').insert(row).select('id').single();
    throwIf(res2.error);
    createdId = res2.data?.id;
  }

  if (createdId && i.dauThauId) {
    await supabase.from('dau_thau').update({ hop_dong_id: createdId }).eq('id', Number(i.dauThauId));
  }
}

export async function updateHopDong(id: string, i: HopDongInput) {
  const idNum = Number(id);
  if (Number.isNaN(idNum)) throw new Error(`Mã hợp đồng không hợp lệ: ${id}`);

  const row = hopDongRow(i);
  const { error } = await supabase.from('hop_dong').update(row).eq('id', idNum);
  if (!error) return;
  if (!thieuCotFileDuThao(error)) throw new Error(error.message);

  delete (row as any).file_du_thao_url;
  delete (row as any).ten_file_du_thao;
  throwIf((await supabase.from('hop_dong').update(row).eq('id', idNum)).error);
}

export async function deleteHopDong(id: string) {
  const idNum = Number(id);
  if (Number.isNaN(idNum)) throw new Error(`Mã hợp đồng không hợp lệ: ${id}`);
  throwIf((await supabase.from('hop_dong').delete().eq('id', idNum)).error);
}

/** Cập nhật nhanh trạng thái trình/duyệt Viện trưởng (Điều 6.1) mà không cần mở form đầy đủ. */
export async function updateHopDongPheDuyet(
  id: string,
  patch: { trangThaiPheDuyet: string; ngayTrinhDuyet?: string; ngayDuyet?: string; nguoiDuyetId?: string },
) {
  const row: Record<string, unknown> = { trang_thai_phe_duyet: patch.trangThaiPheDuyet };
  if (patch.ngayTrinhDuyet !== undefined) row.ngay_trinh_duyet = str(patch.ngayTrinhDuyet);
  if (patch.ngayDuyet !== undefined) row.ngay_duyet = str(patch.ngayDuyet);
  if (patch.nguoiDuyetId !== undefined) row.nguoi_duyet_id = num(patch.nguoiDuyetId);
  throwIf((await supabase.from('hop_dong').update(row).eq('id', Number(id))).error);
}

/** Đánh dấu đã/chưa quyết toán, thanh lý hợp đồng (Điều 11) — độc lập với trạng thái thực hiện. */
export async function updateQuyetToanHopDong(id: string, daQuyetToan: boolean) {
  throwIf(
    (await supabase
      .from('hop_dong')
      .update({
        trang_thai_quyet_toan: daQuyetToan ? 'da-quyet-toan' : 'chua-quyet-toan',
        ngay_quyet_toan: daQuyetToan ? new Date().toISOString().slice(0, 10) : null,
      })
      .eq('id', Number(id))).error,
  );
}

// ─── MẪU THÍ NGHIỆM ───

export async function fetchMauThiNghiem(): Promise<MauThiNghiem[]> {
  const { data, error } = await supabase
    .from('mau_thi_nghiem')
    .select(
      'id, ma_phieu, ten_mau, phep_thu, tieu_chuan_ap_dung, khach_hang_id, phong_thi_nghiem, ngay_nhan, han_tra, trang_thai, khach_hang(ten_to_chuc)',
    )
    .order('ngay_nhan', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    maPhieu: r.ma_phieu,
    tenMau: r.ten_mau,
    phepThu: r.phep_thu,
    tieuChuan: r.tieu_chuan_ap_dung ?? '',
    khachHang: (r.khach_hang as unknown as { ten_to_chuc: string } | null)?.ten_to_chuc ?? '—',
    khachHangId: r.khach_hang_id != null ? String(r.khach_hang_id) : null,
    phongThiNghiem: r.phong_thi_nghiem,
    ngayNhan: r.ngay_nhan,
    hanTra: r.han_tra ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

export interface MauThiNghiemInput {
  maPhieu: string;
  tenMau: string;
  phepThu: string;
  tieuChuan: string;
  khachHangId: string;
  phongThiNghiem: string;
  ngayNhan: string;
  hanTra: string;
  trangThai: string;
}

function mauRow(i: MauThiNghiemInput) {
  return {
    ma_phieu: i.maPhieu,
    ten_mau: i.tenMau,
    phep_thu: i.phepThu,
    tieu_chuan_ap_dung: str(i.tieuChuan),
    khach_hang_id: num(i.khachHangId),
    phong_thi_nghiem: i.phongThiNghiem,
    ngay_nhan: i.ngayNhan,
    han_tra: str(i.hanTra),
    trang_thai: i.trangThai,
  };
}

export async function createMauThiNghiem(i: MauThiNghiemInput) {
  throwIf((await supabase.from('mau_thi_nghiem').insert(mauRow(i))).error);
}
export async function updateMauThiNghiem(id: string, i: MauThiNghiemInput) {
  throwIfKhongGhiDuoc(await supabase.from('mau_thi_nghiem').update(mauRow(i)).eq('id', Number(id)).select('id'));
}
export async function deleteMauThiNghiem(id: string) {
  throwIfKhongGhiDuoc(await supabase.from('mau_thi_nghiem').delete().eq('id', Number(id)).select('id'));
}

// ─── LỚP ĐÀO TẠO ───

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
    loaiMa: r.loai,
    soHocVien: r.so_hoc_vien,
    batDau: r.ngay_bat_dau ?? '',
    ketThuc: r.ngay_ket_thuc ?? '',
    trangThai: r.trang_thai as TrangThai,
  }));
}

export interface LopDaoTaoInput {
  ten: string;
  loaiMa: string;
  soHocVien: string;
  batDau: string;
  ketThuc: string;
  trangThai: string;
}

function lopRow(i: LopDaoTaoInput) {
  return {
    ten_lop: i.ten,
    loai: i.loaiMa,
    so_hoc_vien: Number(i.soHocVien) || 0,
    ngay_bat_dau: str(i.batDau),
    ngay_ket_thuc: str(i.ketThuc),
    trang_thai: i.trangThai,
  };
}

export async function createLopDaoTao(i: LopDaoTaoInput) {
  throwIf((await supabase.from('lop_dao_tao').insert(lopRow(i))).error);
}
export async function updateLopDaoTao(id: string, i: LopDaoTaoInput) {
  throwIfKhongGhiDuoc(await supabase.from('lop_dao_tao').update(lopRow(i)).eq('id', Number(id)).select('id'));
}
export async function deleteLopDaoTao(id: string) {
  throwIfKhongGhiDuoc(await supabase.from('lop_dao_tao').delete().eq('id', Number(id)).select('id'));
}

// ─── NGHIÊN CỨU SINH (NCS) ───

export async function fetchNghienCuuSinh(): Promise<NghienCuuSinh[]> {
  const { data, error } = await supabase
    .from('nghien_cuu_sinh')
    .select('id, nhan_su_id, ho_ten, ngay_nhap_hoc, giao_vien_huong_dan, ten_de_tai, don_vi_id, trang_thai_hoi_dong, ghi_chu')
    .order('ngay_nhap_hoc', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId: r.nhan_su_id != null ? String(r.nhan_su_id) : null,
    hoTen: r.ho_ten,
    ngayNhapHoc: r.ngay_nhap_hoc ?? '',
    gvHuongDan: r.giao_vien_huong_dan ?? '',
    tenDeTai: r.ten_de_tai ?? '',
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    trangThaiHoiDong: r.trang_thai_hoi_dong,
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface NghienCuuSinhInput {
  nhanSuId: string;
  hoTen: string;
  ngayNhapHoc: string;
  gvHuongDan: string;
  tenDeTai: string;
  donViId: string;
  trangThaiHoiDong: string;
  ghiChu: string;
}

function ncsRow(i: NghienCuuSinhInput) {
  return {
    nhan_su_id: i.nhanSuId ? Number(i.nhanSuId) : null,
    ho_ten: i.hoTen,
    ngay_nhap_hoc: str(i.ngayNhapHoc),
    giao_vien_huong_dan: str(i.gvHuongDan),
    ten_de_tai: str(i.tenDeTai),
    don_vi_id: i.donViId ? Number(i.donViId) : null,
    trang_thai_hoi_dong: i.trangThaiHoiDong,
    ghi_chu: str(i.ghiChu),
  };
}

export async function createNghienCuuSinh(i: NghienCuuSinhInput) {
  throwIf((await supabase.from('nghien_cuu_sinh').insert(ncsRow(i))).error);
}
export async function updateNghienCuuSinh(id: string, i: NghienCuuSinhInput) {
  throwIf((await supabase.from('nghien_cuu_sinh').update(ncsRow(i)).eq('id', Number(id))).error);
}
export async function deleteNghienCuuSinh(id: string) {
  throwIf((await supabase.from('nghien_cuu_sinh').delete().eq('id', Number(id))).error);
}
