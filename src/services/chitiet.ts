import { supabase } from '../lib/supabase';
import type { TrangThaiGiaoViec } from '../lib/kyGiaoViec';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ─── ĐỢT THANH TOÁN HỢP ĐỒNG ───

export interface DotThanhToan {
  id: string;
  tenDot: string;
  soTien: number; // triệu đồng
  ngayDuKien: string;
  ngayThucThu: string; // '' = chưa thu
}

export async function fetchDotThanhToan(hopDongId: string): Promise<DotThanhToan[]> {
  const { data, error } = await supabase
    .from('dot_thanh_toan')
    .select('id, ten_dot, so_tien, ngay_du_kien, ngay_thuc_thu')
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_du_kien');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    tenDot: r.ten_dot,
    soTien: Number(r.so_tien),
    ngayDuKien: r.ngay_du_kien ?? '',
    ngayThucThu: r.ngay_thuc_thu ?? '',
  }));
}

export interface DotThanhToanInput {
  tenDot: string;
  soTien: string;
  ngayDuKien: string;
  ngayThucThu: string;
}

function dotRow(i: DotThanhToanInput) {
  return {
    ten_dot: i.tenDot,
    so_tien: Number(i.soTien) || 0,
    ngay_du_kien: i.ngayDuKien || null,
    ngay_thuc_thu: i.ngayThucThu || null,
  };
}

/** Đồng bộ hop_dong.da_thanh_toan = tổng các đợt đã thu. */
async function syncDaThanhToan(hopDongId: string) {
  const list = await fetchDotThanhToan(hopDongId);
  const daThu = list.filter((d) => d.ngayThucThu).reduce((s, d) => s + d.soTien, 0);
  throwIf(
    (await supabase.from('hop_dong').update({ da_thanh_toan: daThu }).eq('id', Number(hopDongId)))
      .error,
  );
}

export async function createDotThanhToan(hopDongId: string, i: DotThanhToanInput) {
  throwIf(
    (await supabase.from('dot_thanh_toan').insert({ ...dotRow(i), hop_dong_id: Number(hopDongId) }))
      .error,
  );
  await syncDaThanhToan(hopDongId);
}

export async function updateDotThanhToan(hopDongId: string, id: string, i: DotThanhToanInput) {
  throwIf((await supabase.from('dot_thanh_toan').update(dotRow(i)).eq('id', Number(id))).error);
  await syncDaThanhToan(hopDongId);
}

export async function deleteDotThanhToan(hopDongId: string, id: string) {
  throwIf((await supabase.from('dot_thanh_toan').delete().eq('id', Number(id))).error);
  await syncDaThanhToan(hopDongId);
}

// ─── PHIẾU GIAO VIỆC (Điều 7 Quy chế 2815) ───
// Chủ trì hợp đồng lấy từ hop_dong.chu_tri_id — phiếu chỉ lưu thêm chủ trì kỹ thuật + kinh phí/nội dung giao.

export interface PhieuGiaoViec {
  id: string;
  hopDongId: string;
  chuTriKyThuatId: string | null;
  chuTriKyThuat: string;
  kinhPhiGiao: number; // triệu đồng
  noiDung: string;
  ngayGiao: string;
  ngayDuyet: string;
  trangThai: TrangThaiGiaoViec;
  lyDoTraLai: string;
  /** Tên người thật đã soạn/xác nhận/thẩm tra/duyệt từng bước Điều 7.1c (không chỉ ngày tháng). */
  nguoiSoan: string;
  nguoiDonViXacNhan: string;
  nguoiKhktThamTra: string;
  nguoiDuyet: string;
}

export async function fetchPhieuGiaoViec(hopDongId: string): Promise<PhieuGiaoViec | null> {
  const { data, error } = await supabase
    .from('phieu_giao_viec')
    .select(
      'id, hop_dong_id, chu_tri_ky_thuat_id, kinh_phi_giao, noi_dung, ngay_giao, ngay_duyet, trang_thai, ly_do_tra_lai, chu_tri_ky_thuat:nhan_su!phieu_giao_viec_chu_tri_ky_thuat_id_fkey(ho_va_ten), nguoi_soan:nhan_su!phieu_giao_viec_nguoi_soan_id_fkey(ho_va_ten), nguoi_don_vi_xac_nhan:nhan_su!phieu_giao_viec_nguoi_don_vi_xac_nhan_id_fkey(ho_va_ten), nguoi_khkt_tham_tra:nhan_su!phieu_giao_viec_nguoi_khkt_tham_tra_id_fkey(ho_va_ten), nguoi_duyet:nhan_su!phieu_giao_viec_nguoi_duyet_id_fkey(ho_va_ten)',
    )
    .eq('hop_dong_id', Number(hopDongId))
    .maybeSingle();
  throwIf(error);
  if (!data) return null;
  return {
    id: String(data.id),
    hopDongId: String(data.hop_dong_id),
    chuTriKyThuatId: data.chu_tri_ky_thuat_id != null ? String(data.chu_tri_ky_thuat_id) : null,
    chuTriKyThuat: (data.chu_tri_ky_thuat as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    kinhPhiGiao: Number(data.kinh_phi_giao) || 0,
    noiDung: data.noi_dung ?? '',
    ngayGiao: data.ngay_giao ?? '',
    ngayDuyet: data.ngay_duyet ?? '',
    trangThai: data.trang_thai as TrangThaiGiaoViec,
    lyDoTraLai: data.ly_do_tra_lai ?? '',
    nguoiSoan: (data.nguoi_soan as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    nguoiDonViXacNhan: (data.nguoi_don_vi_xac_nhan as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    nguoiKhktThamTra: (data.nguoi_khkt_tham_tra as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    nguoiDuyet: (data.nguoi_duyet as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
  };
}

export interface PhieuGiaoViecInput {
  chuTriKyThuatId: string;
  kinhPhiGiao: string;
  noiDung: string;
  ngayGiao: string;
}

/**
 * Lưu nội dung phiếu giao việc. KHÔNG tự đặt trạng thái duyệt — việc phê duyệt phải đi qua
 * luồng ký Điều 7.1c (xem chuyenBuocGiaoViec). Phiếu tạo mới bắt đầu ở 'du-thao'.
 */
export async function upsertPhieuGiaoViec(hopDongId: string, i: PhieuGiaoViecInput) {
  const dangCo = await fetchPhieuGiaoViec(hopDongId);
  const noiDungRow = {
    hop_dong_id: Number(hopDongId),
    chu_tri_ky_thuat_id: i.chuTriKyThuatId ? Number(i.chuTriKyThuatId) : null,
    kinh_phi_giao: Number(i.kinhPhiGiao) || 0,
    noi_dung: i.noiDung || null,
    ngay_giao: i.ngayGiao || null,
  };
  if (dangCo) {
    throwIf((await supabase.from('phieu_giao_viec').update(noiDungRow).eq('id', Number(dangCo.id))).error);
    return;
  }
  throwIf(
    (await supabase.from('phieu_giao_viec').insert({ ...noiDungRow, trang_thai: 'du-thao' })).error,
  );
}

/**
 * Chuyển phiếu sang bước ký kế tiếp (hoặc trả lại). Thẩm quyền do trigger CSDL chốt chặn.
 * `actorNhanSuId` là mã nhân sự của người thật đang bấm nút — ghi vào đúng cột "nguoi_*_id"
 * tương ứng với bước vừa hoàn tất, không chỉ ghi ngày tháng. Có thể là null (tài khoản chưa
 * gắn hồ sơ nhân sự) — khi đó bước vẫn chuyển được nhưng không lưu được danh tính.
 */
export async function chuyenBuocGiaoViec(
  phieuId: string,
  den: TrangThaiGiaoViec,
  opts?: { lyDoTraLai?: string; actorNhanSuId?: string | null },
) {
  const homNay = new Date().toISOString().slice(0, 10);
  const actor = opts?.actorNhanSuId ? Number(opts.actorNhanSuId) : null;
  const row: Record<string, unknown> = { trang_thai: den };
  if (den === 'cho-khkt-tham-tra') {
    row.ngay_don_vi_xac_nhan = homNay;
    if (actor) row.nguoi_don_vi_xac_nhan_id = actor;
  }
  if (den === 'cho-lanh-dao-duyet') {
    row.ngay_khkt_tham_tra = homNay;
    if (actor) row.nguoi_khkt_tham_tra_id = actor;
  }
  if (den === 'da-duyet') {
    row.ngay_duyet = homNay;
    if (actor) row.nguoi_duyet_id = actor;
  }
  if (den === 'tra-lai') row.ly_do_tra_lai = opts?.lyDoTraLai || null;
  throwIf((await supabase.from('phieu_giao_viec').update(row).eq('id', Number(phieuId))).error);
}

// ─── CỘNG TÁC VIÊN TRONG PHIẾU GIAO VIỆC ───

export interface CtvGiaoViec {
  id: string;
  nhanSuId: string | null;
  hoTen: string;
  tyLePhanChia: number; // %
  ghiChu: string;
}

export async function fetchCtvGiaoViec(phieuGiaoViecId: string): Promise<CtvGiaoViec[]> {
  const { data, error } = await supabase
    .from('phieu_giao_viec_ctv')
    .select('id, nhan_su_id, ty_le_phan_chia, ghi_chu, nhan_su(ho_va_ten)')
    .eq('phieu_giao_viec_id', Number(phieuGiaoViecId))
    .order('id');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    nhanSuId: r.nhan_su_id != null ? String(r.nhan_su_id) : null,
    hoTen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    tyLePhanChia: Number(r.ty_le_phan_chia) || 0,
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface CtvGiaoViecInput {
  nhanSuId: string;
  tyLePhanChia: string;
  ghiChu: string;
}

function ctvRow(i: CtvGiaoViecInput) {
  return {
    nhan_su_id: i.nhanSuId ? Number(i.nhanSuId) : null,
    ty_le_phan_chia: Number(i.tyLePhanChia) || 0,
    ghi_chu: i.ghiChu || null,
  };
}

export async function createCtvGiaoViec(phieuGiaoViecId: string, i: CtvGiaoViecInput) {
  throwIf(
    (
      await supabase
        .from('phieu_giao_viec_ctv')
        .insert({ ...ctvRow(i), phieu_giao_viec_id: Number(phieuGiaoViecId) })
    ).error,
  );
}
export async function updateCtvGiaoViec(id: string, i: CtvGiaoViecInput) {
  throwIf((await supabase.from('phieu_giao_viec_ctv').update(ctvRow(i)).eq('id', Number(id))).error);
}
export async function deleteCtvGiaoViec(id: string) {
  throwIf((await supabase.from('phieu_giao_viec_ctv').delete().eq('id', Number(id))).error);
}

// ─── KẾT QUẢ PHÉP THỬ ───

export interface KetQuaPhepThu {
  id: string;
  tenChiTieu: string;
  ketQua: string;
  donViTinh: string;
  yeuCau: string;
  dat: boolean | null;
}

export async function fetchKetQuaPhepThu(mauId: string): Promise<KetQuaPhepThu[]> {
  const { data, error } = await supabase
    .from('ket_qua_phep_thu')
    .select('id, ten_chi_tieu, ket_qua, don_vi_tinh, yeu_cau, dat')
    .eq('mau_id', Number(mauId))
    .order('id');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    tenChiTieu: r.ten_chi_tieu,
    ketQua: r.ket_qua ?? '',
    donViTinh: r.don_vi_tinh ?? '',
    yeuCau: r.yeu_cau ?? '',
    dat: r.dat,
  }));
}

export interface KetQuaInput {
  tenChiTieu: string;
  ketQua: string;
  donViTinh: string;
  yeuCau: string;
  dat: string; // '' | 'dat' | 'khong-dat'
}

function kqRow(i: KetQuaInput) {
  return {
    ten_chi_tieu: i.tenChiTieu,
    ket_qua: i.ketQua || null,
    don_vi_tinh: i.donViTinh || null,
    yeu_cau: i.yeuCau || null,
    dat: i.dat === '' ? null : i.dat === 'dat',
  };
}

export async function createKetQua(mauId: string, i: KetQuaInput) {
  throwIf(
    (await supabase.from('ket_qua_phep_thu').insert({ ...kqRow(i), mau_id: Number(mauId) })).error,
  );
}
export async function updateKetQua(id: string, i: KetQuaInput) {
  throwIf((await supabase.from('ket_qua_phep_thu').update(kqRow(i)).eq('id', Number(id))).error);
}
export async function deleteKetQua(id: string) {
  throwIf((await supabase.from('ket_qua_phep_thu').delete().eq('id', Number(id))).error);
}

export async function updateTrangThaiMau(mauId: string, trangThai: string) {
  throwIf(
    (await supabase.from('mau_thi_nghiem').update({ trang_thai: trangThai }).eq('id', Number(mauId)))
      .error,
  );
}

// ─── MỐC ĐỀ TÀI ───

export interface MocDeTai {
  id: string;
  tenMoc: string;
  hanHoanThanh: string;
  ngayHoanThanh: string; // '' = chưa
}

export async function fetchMocDeTai(deTaiId: string): Promise<MocDeTai[]> {
  const { data, error } = await supabase
    .from('moc_de_tai')
    .select('id, ten_moc, han_hoan_thanh, ngay_hoan_thanh')
    .eq('de_tai_id', Number(deTaiId))
    .order('han_hoan_thanh');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    tenMoc: r.ten_moc,
    hanHoanThanh: r.han_hoan_thanh ?? '',
    ngayHoanThanh: r.ngay_hoan_thanh ?? '',
  }));
}

export interface MocInput {
  tenMoc: string;
  hanHoanThanh: string;
  ngayHoanThanh: string;
}

function mocRow(i: MocInput) {
  return {
    ten_moc: i.tenMoc,
    han_hoan_thanh: i.hanHoanThanh || null,
    ngay_hoan_thanh: i.ngayHoanThanh || null,
  };
}

export async function createMoc(deTaiId: string, i: MocInput) {
  throwIf(
    (await supabase.from('moc_de_tai').insert({ ...mocRow(i), de_tai_id: Number(deTaiId) })).error,
  );
}
export async function updateMoc(id: string, i: MocInput) {
  throwIf((await supabase.from('moc_de_tai').update(mocRow(i)).eq('id', Number(id))).error);
}
export async function deleteMoc(id: string) {
  throwIf((await supabase.from('moc_de_tai').delete().eq('id', Number(id))).error);
}

// ─── CHỨNG CHỈ HÀNH NGHỀ (theo nhân sự) ───

export interface ChungChi {
  id: string;
  soChungChi: string;
  tenLinhVuc: string;
  hang: string; // mã: hang-1/2/3 hoặc ''
  coQuanCap: string;
  ngayCap: string;
  ngayHetHan: string;
}

export async function fetchChungChiTheoNhanSu(nhanSuId: string): Promise<ChungChi[]> {
  const { data, error } = await supabase
    .from('chung_chi_hanh_nghe')
    .select('id, so_chung_chi, ten_linh_vuc_hanh_nghe, hang_chung_chi, co_quan_cap, ngay_cap, ngay_het_han')
    .eq('nhan_su_id', Number(nhanSuId))
    .order('ngay_het_han');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    soChungChi: r.so_chung_chi,
    tenLinhVuc: r.ten_linh_vuc_hanh_nghe,
    hang: r.hang_chung_chi ?? '',
    coQuanCap: r.co_quan_cap ?? '',
    ngayCap: r.ngay_cap ?? '',
    ngayHetHan: r.ngay_het_han ?? '',
  }));
}

export interface ChungChiInput {
  soChungChi: string;
  tenLinhVuc: string;
  hang: string;
  coQuanCap: string;
  ngayCap: string;
  ngayHetHan: string;
}

function ccRow(i: ChungChiInput) {
  return {
    so_chung_chi: i.soChungChi,
    ten_linh_vuc_hanh_nghe: i.tenLinhVuc,
    hang_chung_chi: i.hang || null,
    co_quan_cap: i.coQuanCap || null,
    ngay_cap: i.ngayCap || null,
    ngay_het_han: i.ngayHetHan || null,
  };
}

export async function createChungChi(nhanSuId: string, i: ChungChiInput) {
  throwIf(
    (await supabase.from('chung_chi_hanh_nghe').insert({ ...ccRow(i), nhan_su_id: Number(nhanSuId) }))
      .error,
  );
}
export async function updateChungChi(id: string, i: ChungChiInput) {
  throwIf((await supabase.from('chung_chi_hanh_nghe').update(ccRow(i)).eq('id', Number(id))).error);
}
export async function deleteChungChi(id: string) {
  throwIf((await supabase.from('chung_chi_hanh_nghe').delete().eq('id', Number(id))).error);
}

// ─── TỆP ĐÍNH KÈM VĂN BẢN (Supabase Storage) ───

export async function uploadTepVanBan(vanBanId: string, file: File) {
  const path = `${vanBanId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('van-ban').upload(path, file);
  throwIf(error);
  throwIf(
    (
      await supabase
        .from('van_ban')
        .update({ tep_dinh_kem: path, ten_tep: file.name })
        .eq('id', Number(vanBanId))
    ).error,
  );
  return path;
}

export async function getTepVanBanUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('van-ban').createSignedUrl(path, 3600);
  throwIf(error);
  return data!.signedUrl;
}

export async function deleteTepVanBan(vanBanId: string, path: string) {
  throwIf((await supabase.storage.from('van-ban').remove([path])).error);
  throwIf(
    (
      await supabase
        .from('van_ban')
        .update({ tep_dinh_kem: null, ten_tep: null })
        .eq('id', Number(vanBanId))
    ).error,
  );
}

// ─── THƯỞNG/PHẠT HỢP ĐỒNG (Điều 13-14 Quy chế 2815) ───
// Sổ ghi quyết định thủ công — không tự động sinh bản ghi, chỉ cảnh báo (xem qc2815.ts).

export interface ThuongPhat {
  id: string;
  loai: 'thuong' | 'phat';
  lyDo: string;
  soTien: number | null; // triệu đồng
  tyLePhanTram: number | null;
  ngayQuyetDinh: string;
  nguoiQuyetDinh: string;
}

export async function fetchThuongPhat(hopDongId: string): Promise<ThuongPhat[]> {
  const { data, error } = await supabase
    .from('hop_dong_thuong_phat')
    .select('id, loai, ly_do, so_tien, ty_le_phan_tram, ngay_quyet_dinh, nhan_su(ho_va_ten)')
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_quyet_dinh', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    loai: r.loai as ThuongPhat['loai'],
    lyDo: r.ly_do,
    soTien: r.so_tien != null ? Number(r.so_tien) : null,
    tyLePhanTram: r.ty_le_phan_tram != null ? Number(r.ty_le_phan_tram) : null,
    ngayQuyetDinh: r.ngay_quyet_dinh ?? '',
    nguoiQuyetDinh: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
  }));
}

export interface ThuongPhatInput {
  loai: 'thuong' | 'phat';
  lyDo: string;
  soTien: string;
  tyLePhanTram: string;
  ngayQuyetDinh: string;
  nguoiQuyetDinhId: string;
}

export async function createThuongPhat(hopDongId: string, i: ThuongPhatInput) {
  throwIf(
    (
      await supabase.from('hop_dong_thuong_phat').insert({
        hop_dong_id: Number(hopDongId),
        loai: i.loai,
        ly_do: i.lyDo,
        so_tien: i.soTien ? Number(i.soTien) : null,
        ty_le_phan_tram: i.tyLePhanTram ? Number(i.tyLePhanTram) : null,
        ngay_quyet_dinh: i.ngayQuyetDinh || null,
        nguoi_quyet_dinh_id: i.nguoiQuyetDinhId ? Number(i.nguoiQuyetDinhId) : null,
      })
    ).error,
  );
}

export async function deleteThuongPhat(id: string) {
  throwIf((await supabase.from('hop_dong_thuong_phat').delete().eq('id', Number(id))).error);
}

// ─── KIỂM TRA NỘI BỘ (Điều 10 Quy chế 2815) ───

export interface KiemTraNoiBo {
  id: string;
  ngayKiemTra: string;
  nguoiKiemTra: string;
  noiDung: string;
  ketLuan: string;
  kienNghi: string;
}

export async function fetchKiemTraNoiBo(hopDongId: string): Promise<KiemTraNoiBo[]> {
  const { data, error } = await supabase
    .from('kiem_tra_noi_bo')
    .select('id, ngay_kiem_tra, noi_dung, ket_luan, kien_nghi, nhan_su(ho_va_ten)')
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_kiem_tra', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    ngayKiemTra: r.ngay_kiem_tra ?? '',
    nguoiKiemTra: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    noiDung: r.noi_dung ?? '',
    ketLuan: r.ket_luan ?? '',
    kienNghi: r.kien_nghi ?? '',
  }));
}

export interface KiemTraNoiBoInput {
  ngayKiemTra: string;
  nguoiKiemTraId: string;
  noiDung: string;
  ketLuan: string;
  kienNghi: string;
}

export async function createKiemTraNoiBo(hopDongId: string, i: KiemTraNoiBoInput) {
  throwIf(
    (
      await supabase.from('kiem_tra_noi_bo').insert({
        hop_dong_id: Number(hopDongId),
        ngay_kiem_tra: i.ngayKiemTra || null,
        nguoi_kiem_tra_id: i.nguoiKiemTraId ? Number(i.nguoiKiemTraId) : null,
        noi_dung: i.noiDung || null,
        ket_luan: i.ketLuan || null,
        kien_nghi: i.kienNghi || null,
      })
    ).error,
  );
}

export async function deleteKiemTraNoiBo(id: string) {
  throwIf((await supabase.from('kiem_tra_noi_bo').delete().eq('id', Number(id))).error);
}

// ─── QUYẾT TOÁN TỪNG PHẦN (Điều 12.1) ───
// "Chứng từ hoàn chỉnh tới đâu thì được thanh toán giai đoạn tới đó."

export interface QuyetToanGiaiDoan {
  id: string;
  tenGiaiDoan: string;
  tyLeHoanThanh: number; // %
  ngayXacNhan: string;
  ghiChu: string;
}

export async function fetchQuyetToanGiaiDoan(hopDongId: string): Promise<QuyetToanGiaiDoan[]> {
  const { data, error } = await supabase
    .from('quyet_toan_giai_doan')
    .select('id, ten_giai_doan, ty_le_hoan_thanh, ngay_xac_nhan, ghi_chu')
    .eq('hop_dong_id', Number(hopDongId))
    .order('ngay_xac_nhan');
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    tenGiaiDoan: r.ten_giai_doan,
    tyLeHoanThanh: Number(r.ty_le_hoan_thanh) || 0,
    ngayXacNhan: r.ngay_xac_nhan ?? '',
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface QuyetToanGiaiDoanInput {
  tenGiaiDoan: string;
  tyLeHoanThanh: string;
  ngayXacNhan: string;
  ghiChu: string;
}

function quyetToanGiaiDoanRow(i: QuyetToanGiaiDoanInput) {
  return {
    ten_giai_doan: i.tenGiaiDoan,
    ty_le_hoan_thanh: Number(i.tyLeHoanThanh) || 0,
    ngay_xac_nhan: i.ngayXacNhan || null,
    ghi_chu: i.ghiChu || null,
  };
}

/** Đồng bộ hop_dong.trang_thai_quyet_toan theo tổng % các giai đoạn đã xác nhận. */
async function syncTrangThaiQuyetToan(hopDongId: string) {
  const list = await fetchQuyetToanGiaiDoan(hopDongId);
  const tongTyLe = list.reduce((s, g) => s + g.tyLeHoanThanh, 0);
  const daXongHet = tongTyLe >= 100;
  const ngayGanNhat = list
    .filter((g) => g.ngayXacNhan)
    .map((g) => g.ngayXacNhan)
    .sort()
    .at(-1);
  const homNay = new Date().toISOString().slice(0, 10);
  throwIf(
    (
      await supabase
        .from('hop_dong')
        .update({
          trang_thai_quyet_toan: daXongHet ? 'da-quyet-toan' : 'chua-quyet-toan',
          ngay_quyet_toan: daXongHet ? (ngayGanNhat ?? homNay) : null,
        })
        .eq('id', Number(hopDongId))
    ).error,
  );
}

export async function createQuyetToanGiaiDoan(hopDongId: string, i: QuyetToanGiaiDoanInput) {
  throwIf(
    (
      await supabase
        .from('quyet_toan_giai_doan')
        .insert({ ...quyetToanGiaiDoanRow(i), hop_dong_id: Number(hopDongId) })
    ).error,
  );
  await syncTrangThaiQuyetToan(hopDongId);
}
export async function updateQuyetToanGiaiDoan(hopDongId: string, id: string, i: QuyetToanGiaiDoanInput) {
  throwIf(
    (await supabase.from('quyet_toan_giai_doan').update(quyetToanGiaiDoanRow(i)).eq('id', Number(id))).error,
  );
  await syncTrangThaiQuyetToan(hopDongId);
}
export async function deleteQuyetToanGiaiDoan(hopDongId: string, id: string) {
  throwIf((await supabase.from('quyet_toan_giai_doan').delete().eq('id', Number(id))).error);
  await syncTrangThaiQuyetToan(hopDongId);
}

// ─── ĐƠN VỊ PHỐI HỢP TRONG PHIẾU GIAO VIỆC (Điều 7.1) ───
// "Các hợp đồng do nhiều đơn vị cùng thực hiện thì Trưởng đơn vị chủ trì thống nhất với
//  Trưởng các đơn vị phối hợp ... phân chia tỷ lệ giá trị HĐ giữa các đơn vị trên Phiếu giao việc."

export interface DonViGiaoViec {
  id: string;
  donViId: string | null;
  tenDonVi: string;
  tyLeGiaTri: number; // %
  vaiTro: 'chu-tri' | 'phoi-hop';
  ghiChu: string;
}

export async function fetchDonViGiaoViec(phieuGiaoViecId: string): Promise<DonViGiaoViec[]> {
  const { data, error } = await supabase
    .from('phieu_giao_viec_don_vi')
    .select('id, don_vi_id, ty_le_gia_tri, vai_tro, ghi_chu, don_vi(ten_don_vi)')
    .eq('phieu_giao_viec_id', Number(phieuGiaoViecId))
    .order('vai_tro')
    .order('id');
  throwIf(error);
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    donViId: r.don_vi_id != null ? String(r.don_vi_id) : null,
    tenDonVi: (r.don_vi as { ten_don_vi: string } | null)?.ten_don_vi ?? '',
    tyLeGiaTri: Number(r.ty_le_gia_tri) || 0,
    vaiTro: r.vai_tro,
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface DonViGiaoViecInput {
  donViId: string;
  tyLeGiaTri: string;
  vaiTro: 'chu-tri' | 'phoi-hop';
  ghiChu: string;
}

function donViGiaoViecRow(i: DonViGiaoViecInput) {
  return {
    don_vi_id: Number(i.donViId),
    ty_le_gia_tri: Number(i.tyLeGiaTri) || 0,
    vai_tro: i.vaiTro,
    ghi_chu: i.ghiChu || null,
  };
}

export async function createDonViGiaoViec(phieuGiaoViecId: string, i: DonViGiaoViecInput) {
  throwIf(
    (
      await supabase
        .from('phieu_giao_viec_don_vi')
        .insert({ ...donViGiaoViecRow(i), phieu_giao_viec_id: Number(phieuGiaoViecId) })
    ).error,
  );
}
export async function updateDonViGiaoViec(id: string, i: DonViGiaoViecInput) {
  throwIf(
    (await supabase.from('phieu_giao_viec_don_vi').update(donViGiaoViecRow(i)).eq('id', Number(id))).error,
  );
}
export async function deleteDonViGiaoViec(id: string) {
  throwIf((await supabase.from('phieu_giao_viec_don_vi').delete().eq('id', Number(id))).error);
}

// ─── NHẬT KÝ TRUY VẾT HỢP ĐỒNG (Điều 9, Điều 10) ───
// Đọc từ nhat_ky_du_lieu — trigger fn_ghi_nhat_ky ghi tự động ở phía CSDL.

export interface NhatKyHopDong {
  id: string;
  hanhDong: string;
  thoiDiem: string;
  vaiTro: string;
  /** Các trường nghiệp vụ thực sự thay đổi, đã diễn giải sang tiếng Việt. */
  thayDoi: { truong: string; tuGiaTri: string; denGiaTri: string }[];
}

/** Chỉ soi các cột có ý nghĩa nghiệp vụ — bỏ qua updated_at và nhiễu kỹ thuật. */
const NHAN_COT_HOP_DONG: Record<string, string> = {
  so_hop_dong: 'Số hợp đồng',
  ten_hop_dong: 'Tên hợp đồng',
  gia_tri: 'Giá trị HĐ',
  da_thanh_toan: 'Đã thanh toán',
  trang_thai: 'Trạng thái',
  buoc_hien_tai: 'Bước xử lý',
  trang_thai_phe_duyet: 'Trạng thái phê duyệt (Đ.6.1)',
  ngay_trinh_duyet: 'Ngày trình duyệt',
  ngay_duyet: 'Ngày duyệt',
  trang_thai_quyet_toan: 'Trạng thái quyết toán (Đ.11)',
  ngay_quyet_toan: 'Ngày quyết toán',
  chu_tri_id: 'Chủ trì hợp đồng',
  nhom_hd: 'Nhóm HĐ (Bảng 1)',
  ngay_ky: 'Ngày ký',
  han_hoan_thanh: 'Hạn hoàn thành',
  ngay_nop_ho_so: 'Ngày nộp hồ sơ về Viện',
};

export async function fetchNhatKyHopDong(hopDongId: string): Promise<NhatKyHopDong[]> {
  const truyVan = (cot: string) =>
    supabase
      .from('nhat_ky_du_lieu')
      .select(cot)
      .eq('ten_bang', 'hop_dong')
      .eq('ban_ghi_id', Number(hopDongId))
      .order('thoi_diem', { ascending: false })
      .limit(50);

  let res = await truyVan('id, hanh_dong, du_lieu_cu, du_lieu_moi, thoi_diem, vai_tro');
  // Cột vai_tro chỉ có sau migration 0013 — trước đó vẫn đọc được phần nhật ký cũ.
  if (res.error?.message?.includes('vai_tro')) {
    res = await truyVan('id, hanh_dong, du_lieu_cu, du_lieu_moi, thoi_diem');
  }
  throwIf(res.error);
  const data = res.data as any[] | null;

  return (data ?? []).map((r: any) => {
    const cu = (r.du_lieu_cu ?? {}) as Record<string, unknown>;
    const moi = (r.du_lieu_moi ?? {}) as Record<string, unknown>;
    const thayDoi = Object.keys(NHAN_COT_HOP_DONG)
      .filter((cot) => r.hanh_dong === 'UPDATE' && String(cu[cot] ?? '') !== String(moi[cot] ?? ''))
      .map((cot) => ({
        truong: NHAN_COT_HOP_DONG[cot],
        tuGiaTri: String(cu[cot] ?? '—'),
        denGiaTri: String(moi[cot] ?? '—'),
      }));
    return {
      id: String(r.id),
      hanhDong: r.hanh_dong,
      thoiDiem: r.thoi_diem ?? '',
      vaiTro: r.vai_tro ?? '',
      thayDoi,
    };
  });
}

// ─── HỒ SƠ ĐÍNH KÈM HỢP ĐỒNG (Điều 8.4, Supabase Storage bucket hop-dong) ───

export interface TepHopDong {
  id: string;
  loaiHoSo: string;
  duongDan: string;
  tenTep: string;
  nguoiTaiLen: string;
  createdAt: string;
}

export const LOAI_HO_SO_OPTIONS = [
  { value: 'ho-so-du-thau', label: 'Hồ sơ dự thầu' },
  { value: 'hop-dong', label: 'Hợp đồng' },
  { value: 'phieu-giao-viec', label: 'Phiếu giao việc' },
  { value: 'bien-ban-nghiem-thu', label: 'Biên bản nghiệm thu' },
  { value: 'bien-ban-thanh-ly', label: 'Biên bản thanh lý' },
  { value: 'quyet-toan', label: 'Hồ sơ quyết toán' },
  { value: 'khac', label: 'Khác' },
];

export async function fetchTepHopDong(hopDongId: string): Promise<TepHopDong[]> {
  const { data, error } = await supabase
    .from('hop_dong_tep_dinh_kem')
    .select('id, loai_ho_so, duong_dan, ten_tep, created_at, nhan_su(ho_va_ten)')
    .eq('hop_dong_id', Number(hopDongId))
    .order('created_at', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r) => ({
    id: String(r.id),
    loaiHoSo: r.loai_ho_so,
    duongDan: r.duong_dan,
    tenTep: r.ten_tep,
    nguoiTaiLen: (r.nhan_su as unknown as { ho_va_ten: string } | null)?.ho_va_ten ?? '',
    createdAt: r.created_at,
  }));
}

export async function uploadTepHopDong(hopDongId: string, loaiHoSo: string, file: File) {
  const path = `${hopDongId}/${Date.now()}_${file.name}`;
  const { error } = await supabase.storage.from('hop-dong').upload(path, file);
  throwIf(error);
  throwIf(
    (
      await supabase.from('hop_dong_tep_dinh_kem').insert({
        hop_dong_id: Number(hopDongId),
        loai_ho_so: loaiHoSo,
        duong_dan: path,
        ten_tep: file.name,
      })
    ).error,
  );
  return path;
}

export async function getTepHopDongUrl(path: string): Promise<string> {
  const { data, error } = await supabase.storage.from('hop-dong').createSignedUrl(path, 3600);
  throwIf(error);
  return data!.signedUrl;
}

export async function deleteTepHopDong(id: string, path: string) {
  throwIf((await supabase.storage.from('hop-dong').remove([path])).error);
  throwIf((await supabase.from('hop_dong_tep_dinh_kem').delete().eq('id', Number(id))).error);
}

// ─── SLA NGHIỆP VỤ (Điều 6.3, 9.6c, 11.1) ───
// Bản ghi do trigger CSDL sinh tự động — ứng dụng chỉ đọc.

export interface SlaHopDong {
  id: string;
  tenSla: string;
  hanChot: string;
  trangThai: 'dang-chay' | 'dat' | 'vi-pham' | 'huy';
  ngayHoanThanh: string;
}

export async function fetchSlaHopDong(hopDongId: string): Promise<SlaHopDong[]> {
  const { data, error } = await supabase
    .from('sla_theo_doi')
    .select('id, ten_sla, han_chot, trang_thai, ngay_hoan_thanh')
    .eq('loai_doi_tuong', 'hop-dong')
    .eq('doi_tuong_id', Number(hopDongId))
    .order('han_chot');
  throwIf(error);
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    tenSla: r.ten_sla,
    hanChot: r.han_chot ?? '',
    trangThai: r.trang_thai,
    ngayHoanThanh: r.ngay_hoan_thanh ?? '',
  }));
}

// ─── TIẾN ĐỘ / KHỐI LƯỢNG / CHẤT LƯỢNG / ATLĐ (Điều 8.1) ───

export interface TienDoHopDong {
  id: string;
  kyBaoCao: string;
  phanTramKhoiLuong: number;
  danhGiaChatLuong: 'dat' | 'can-khac-phuc' | 'khong-dat';
  suCoAtld: boolean;
  moTaSuCo: string;
  ghiChu: string;
}

export async function fetchTienDoHopDong(hopDongId: string): Promise<TienDoHopDong[]> {
  const { data, error } = await supabase
    .from('tien_do_hop_dong')
    .select('id, ky_bao_cao, phan_tram_khoi_luong, danh_gia_chat_luong, su_co_atld, mo_ta_su_co, ghi_chu')
    .eq('hop_dong_id', Number(hopDongId))
    .order('ky_bao_cao', { ascending: false });
  throwIf(error);
  return (data ?? []).map((r: any) => ({
    id: String(r.id),
    kyBaoCao: r.ky_bao_cao ?? '',
    phanTramKhoiLuong: Number(r.phan_tram_khoi_luong) || 0,
    danhGiaChatLuong: r.danh_gia_chat_luong,
    suCoAtld: !!r.su_co_atld,
    moTaSuCo: r.mo_ta_su_co ?? '',
    ghiChu: r.ghi_chu ?? '',
  }));
}

export interface TienDoInput {
  kyBaoCao: string;
  phanTramKhoiLuong: string;
  danhGiaChatLuong: 'dat' | 'can-khac-phuc' | 'khong-dat';
  suCoAtld: boolean;
  moTaSuCo: string;
  ghiChu: string;
}

function tienDoRow(i: TienDoInput) {
  return {
    ky_bao_cao: i.kyBaoCao,
    phan_tram_khoi_luong: Number(i.phanTramKhoiLuong) || 0,
    danh_gia_chat_luong: i.danhGiaChatLuong,
    su_co_atld: i.suCoAtld,
    mo_ta_su_co: i.moTaSuCo || null,
    ghi_chu: i.ghiChu || null,
  };
}

export async function createTienDo(hopDongId: string, i: TienDoInput) {
  throwIf(
    (await supabase.from('tien_do_hop_dong').insert({ ...tienDoRow(i), hop_dong_id: Number(hopDongId) })).error,
  );
}
export async function updateTienDo(id: string, i: TienDoInput) {
  throwIf((await supabase.from('tien_do_hop_dong').update(tienDoRow(i)).eq('id', Number(id))).error);
}
export async function deleteTienDo(id: string) {
  throwIf((await supabase.from('tien_do_hop_dong').delete().eq('id', Number(id))).error);
}
