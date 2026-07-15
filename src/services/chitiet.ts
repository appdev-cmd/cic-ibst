import { supabase } from '../lib/supabase';

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
