// ============================================================
// Service Quản lý Lịch cơ quan, Đặt phòng họp & Điều động xe
// Viện Khoa học Công nghệ Xây dựng (IBST)
// ============================================================

import { supabase } from '../lib/supabase';

export interface PhongHop {
  id: string;
  maPhong: string;
  tenPhong: string;
  sucChua: number;
  diaDiem: string;
  mauSac: string;
  thietBi?: string;
  trangThai: 'san_sang' | 'bao_tri' | 'tam_dung';
  thuTu: number;
}

export interface XeCongTac {
  id: string;
  bienSo: string;
  loaiXe: string;
  soCho: number;
  laiXeMacDinh?: string;
  sdtLaiXe?: string;
  trangThai: 'san_sang' | 'bao_tri' | 'tam_dung';
  thuTu: number;
}

export interface NhanSuGoiY {
  id: number;
  hoVaTen: string;
  chucDanh?: string;
  tenDonVi?: string;
}

export interface LichCoQuanItem {
  id: string;
  tieuDe: string;
  noiDung?: string;
  ngay: string; // YYYY-MM-DD
  thu: string; // Thứ Hai, Thứ Ba...
  buoi: 'sang' | 'chieu' | 'ca_ngay';
  gioBatDau: string; // HH:mm
  gioKetThuc?: string; // HH:mm
  lanhDaoChuTri: string;
  cotMaTran: 'vien_truong' | 'dan' | 'binh' | 'khoi' | 'khac';
  donViChuanBi?: string; // VD: 'TTKCT a.Trung, a.Phương, KHKT'
  nguoiChuanBi?: string; // Tên cán bộ chuẩn bị chính
  nhanSuId?: number | null;
  thanhPhan: string;
  diaDiem: string;
  phongHopId?: string | null;
  xeCongTac?: string;
  xeId?: string | null;
  loaiLich: string;
  trangThai: 'Cho-duyet' | 'Da-duyet' | 'Tu-choi' | 'Huy';
  ghiChuChuanBi?: string;
  bienBanKetLuan?: string;
  nguoiTaoId?: string | null;
  nguoiDuyetId?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ConflictInfo {
  xungDotLoai: 'phong_hop' | 'xe_cong_tac';
  eventId: string;
  tieuDe: string;
  gioBatDau: string;
  gioKetThuc: string;
  tenTaiNguyen: string;
}

// ── 1. Lấy danh mục Phòng họp ──
export async function getDanhMucPhongHop(): Promise<PhongHop[]> {
  try {
    const { data, error } = await supabase
      .from('dm_phong_hop')
      .select('*')
      .order('thu_tu', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        maPhong: d.ma_phong,
        tenPhong: d.ten_phong,
        sucChua: d.suc_chua,
        diaDiem: d.dia_diem,
        mauSac: d.mau_sac,
        thietBi: d.thiet_bi,
        trangThai: d.trang_thai,
        thuTu: d.thu_tu,
      }));
    }
  } catch (err) {
    console.warn('Không đọc được dm_phong_hop từ database, dùng fallback:', err);
  }

  return [
    { id: '1', maPhong: 'PH-LANH-DAO', tenPhong: 'Phòng Lãnh đạo', sucChua: 12, diaDiem: 'Tòa nhà IBST', mauSac: '#0284c7', trangThai: 'san_sang', thuTu: 1 },
    { id: '2', maPhong: 'PHONG-HOP-1', tenPhong: 'Phòng họp 1', sucChua: 30, diaDiem: 'Tòa nhà IBST', mauSac: '#10b981', trangThai: 'san_sang', thuTu: 2 },
    { id: '3', maPhong: 'PHONG-HOP-2', tenPhong: 'Phòng họp 2', sucChua: 20, diaDiem: 'Tòa nhà IBST', mauSac: '#6366f1', trangThai: 'san_sang', thuTu: 3 },
    { id: '4', maPhong: 'HOI-TRUONG', tenPhong: 'Hội trường', sucChua: 150, diaDiem: 'Tòa nhà IBST', mauSac: '#f59e0b', trangThai: 'san_sang', thuTu: 4 },
    { id: '5', maPhong: 'BXD', tenPhong: 'Bộ Xây dựng (BXD)', sucChua: 50, diaDiem: '37 Lê Đại Hành', mauSac: '#ef4444', trangThai: 'san_sang', thuTu: 5 },
    { id: '6', maPhong: 'ONLINE', tenPhong: 'Trực tuyến (Zoom/Teams)', sucChua: 300, diaDiem: 'Họp trực tuyến', mauSac: '#8b5cf6', trangThai: 'san_sang', thuTu: 6 },
  ];
}

// ── 2. Lấy danh mục Xe công tác ──
export async function getDanhMucXeCongTac(): Promise<XeCongTac[]> {
  try {
    const { data, error } = await supabase
      .from('dm_xe_cong_tac')
      .select('*')
      .order('thu_tu', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        bienSo: d.bien_so,
        loaiXe: d.loai_xe,
        soCho: d.so_cho,
        laiXeMacDinh: d.lai_xe_mac_dinh,
        sdtLaiXe: d.sdt_lai_xe,
        trangThai: d.trang_thai,
        thuTu: d.thu_tu,
      }));
    }
  } catch (err) {
    console.warn('Không đọc được dm_xe_cong_tac từ database, dùng fallback:', err);
  }

  return [
    { id: '1', bienSo: '29A-678.90', loaiXe: 'Xe 4 chỗ (Toyota Camry)', soCho: 5, laiXeMacDinh: 'Nguyễn Văn Hùng (Đội xe VP)', sdtLaiXe: '0912.345.678', trangThai: 'san_sang', thuTu: 1 },
    { id: '2', bienSo: '29A-888.99', loaiXe: 'Xe 7 chỗ (Toyota Fortuner)', soCho: 7, laiXeMacDinh: 'Trần Đình Trọng (Đội xe VP)', sdtLaiXe: '0988.765.432', trangThai: 'san_sang', thuTu: 2 },
    { id: '3', bienSo: '29B-123.45', loaiXe: 'Xe 16 chỗ (Ford Transit)', soCho: 16, laiXeMacDinh: 'Lê Anh Dũng (Đội xe VP)', sdtLaiXe: '0903.112.233', trangThai: 'san_sang', thuTu: 3 },
  ];
}

// ── 3. Lấy danh sách Nhân sự để gợi ý Họ tên đầy đủ (Autocomplete) ──
export async function getNhanSuGoiY(): Promise<NhanSuGoiY[]> {
  try {
    const { data, error } = await supabase
      .from('nhan_su')
      .select('id, ho_va_ten, chuc_danh, don_vi(ten_don_vi, ten_viet_tat)')
      .order('ho_va_ten', { ascending: true })
      .limit(100);

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        hoVaTen: d.ho_va_ten,
        chucDanh: d.chuc_danh,
        tenDonVi: d.don_vi?.ten_viet_tat || d.don_vi?.ten_don_vi || '',
      }));
    }
  } catch (err) {
    console.warn('Không đọc được nhan_su từ database:', err);
  }

  return [
    { id: 1, hoVaTen: 'Nguyễn Hồng Hải', chucDanh: 'Viện trưởng', tenDonVi: 'Lãnh đạo Viện' },
    { id: 2, hoVaTen: 'Đinh Quốc Dân', chucDanh: 'Phó Viện trưởng', tenDonVi: 'Lãnh đạo Viện' },
    { id: 3, hoVaTen: 'Nguyễn Thanh Bình', chucDanh: 'Phó Viện trưởng', tenDonVi: 'Lãnh đạo Viện' },
    { id: 4, hoVaTen: 'Cao Duy Khôi', chucDanh: 'Phó Viện trưởng', tenDonVi: 'Lãnh đạo Viện' },
    { id: 5, hoVaTen: 'Nguyễn Kiên Trung', chucDanh: 'Giám đốc', tenDonVi: 'TTKCT' },
    { id: 6, hoVaTen: 'Trần Nam Phương', chucDanh: 'Phó Giám đốc', tenDonVi: 'TTKCT' },
    { id: 7, hoVaTen: 'Trần Mạnh Dũng', chucDanh: 'Trưởng phòng', tenDonVi: 'Phòng KHKT' },
    { id: 8, hoVaTen: 'Vũ Mạnh Cường', chucDanh: 'Trưởng phòng', tenDonVi: 'Phòng TCHC' },
  ];
}

// ── 4. Kiểm tra xung đột Phòng họp & Xe công tác thời gian thực ──
export async function checkXungDotPhongXe(params: {
  ngay: string;
  gioBatDau: string;
  gioKetThuc?: string;
  phongHopId?: string | null;
  xeId?: string | null;
  excludeId?: string | null;
}): Promise<ConflictInfo[]> {
  const { ngay, gioBatDau, gioKetThuc, phongHopId, xeId, excludeId } = params;
  if (!phongHopId && !xeId) return [];

  try {
    const { data, error } = await supabase.rpc('fn_check_xung_dot_phong_xe', {
      p_ngay: ngay,
      p_gio_bat_dau: gioBatDau,
      p_gio_ket_thuc: gioKetThuc || '23:59',
      p_phong_hop_id: phongHopId || null,
      p_xe_id: xeId || null,
      p_exclude_id: excludeId || null,
    });

    if (error) throw error;
    if (data) {
      return data.map((d: any) => ({
        xungDotLoai: d.xung_dot_loai,
        eventId: d.event_id,
        tieuDe: d.tieu_de,
        gioBatDau: d.gio_bat_dau,
        gioKetThuc: d.gio_ket_thuc,
        tenTaiNguyen: d.ten_tai_nguyen,
      }));
    }
  } catch (err) {
    console.warn('Lỗi gọi fn_check_xung_dot_phong_xe:', err);
  }

  return [];
}

// ── 5. Lấy danh sách Lịch cơ quan (theo khoảng ngày hoặc toàn bộ) ──
export async function getLichCoQuan(startDate?: string, endDate?: string): Promise<LichCoQuanItem[]> {
  try {
    let q = supabase.from('lich_co_quan').select('*');
    if (startDate) q = q.gte('ngay', startDate);
    if (endDate) q = q.lte('ngay', endDate);
    const { data, error } = await q.order('ngay', { ascending: true }).order('gio_bat_dau', { ascending: true });

    if (error) throw error;
    if (data && data.length > 0) {
      return data.map((d: any) => ({
        id: d.id,
        tieuDe: d.tieu_de,
        noiDung: d.noi_dung,
        ngay: d.ngay,
        thu: d.thu,
        buoi: d.buoi,
        gioBatDau: d.gio_bat_dau,
        gioKetThuc: d.gio_ket_thuc,
        lanhDaoChuTri: d.lanh_dao_chu_tri,
        cotMaTran: d.cot_ma_tran,
        donViChuanBi: d.don_vi_chuan_bi,
        nguoiChuanBi: d.nguoi_chuan_bi,
        nhanSuId: d.nhan_su_id,
        thanhPhan: d.thanh_phan,
        diaDiem: d.dia_diem,
        phongHopId: d.phong_hop_id,
        xeCongTac: d.xe_cong_tac,
        xeId: d.xe_id,
        loaiLich: d.loai_lich,
        trangThai: d.trang_thai,
        ghiChuChuanBi: d.ghi_chu_chuan_bi,
        bienBanKetLuan: d.bien_ban_ket_luan,
        nguoiTaoId: d.nguoi_tao_id,
        nguoiDuyetId: d.nguoi_duyet_id,
        createdAt: d.created_at,
        updatedAt: d.updated_at,
      }));
    }
  } catch (err) {
    console.warn('Không đọc được lịch từ Supabase:', err);
  }

  return [];
}

// ── 6. Thêm mới Lịch cơ quan ──
export async function createLichCoQuan(item: Omit<LichCoQuanItem, 'id'>): Promise<LichCoQuanItem | null> {
  const payload = {
    tieu_de: item.tieuDe,
    noi_dung: item.noiDung || item.tieuDe,
    ngay: item.ngay,
    thu: item.thu,
    buoi: item.buoi,
    gio_bat_dau: item.gioBatDau,
    gio_ket_thuc: item.gioKetThuc || null,
    lanh_dao_chu_tri: item.lanhDaoChuTri,
    cot_ma_tran: item.cotMaTran,
    don_vi_chuan_bi: item.donViChuanBi || null,
    nguoi_chuan_bi: item.nguoiChuanBi || null,
    nhan_su_id: item.nhanSuId || null,
    thanh_phan: item.thanhPhan,
    dia_diem: item.diaDiem,
    phong_hop_id: item.phongHopId || null,
    xe_cong_tac: item.xeCongTac || null,
    xe_id: item.xeId || null,
    loai_lich: item.loaiLich,
    trang_thai: item.trangThai,
    ghi_chu_chuan_bi: item.ghiChuChuanBi || null,
    bien_ban_ket_luan: item.bienBanKetLuan || null,
  };

  try {
    const { data, error } = await supabase.from('lich_co_quan').insert(payload).select().single();
    if (error) throw error;
    if (data) {
      return {
        id: data.id,
        tieuDe: data.tieu_de,
        noiDung: data.noi_dung,
        ngay: data.ngay,
        thu: data.thu,
        buoi: data.buoi,
        gioBatDau: data.gio_bat_dau,
        gioKetThuc: data.gio_ket_thuc,
        lanhDaoChuTri: data.lanh_dao_chu_tri,
        cotMaTran: data.cot_ma_tran,
        donViChuanBi: data.don_vi_chuan_bi,
        nguoiChuanBi: data.nguoi_chuan_bi,
        nhanSuId: data.nhan_su_id,
        thanhPhan: data.thanh_phan,
        diaDiem: data.dia_diem,
        phongHopId: data.phong_hop_id,
        xeCongTac: data.xe_cong_tac,
        xeId: data.xe_id,
        loaiLich: data.loai_lich,
        trangThai: data.trang_thai,
        ghiChuChuanBi: data.ghi_chu_chuan_bi,
        bienBanKetLuan: data.bien_ban_ket_luan,
      };
    }
  } catch (err) {
    console.error('Lỗi khi thêm lịch vào Supabase:', err);
  }

  return null;
}

// ── 7. Cập nhật Lịch cơ quan ──
export async function updateLichCoQuan(id: string, item: Partial<LichCoQuanItem>): Promise<boolean> {
  const payload: any = { updated_at: new Date().toISOString() };
  if (item.tieuDe !== undefined) payload.tieu_de = item.tieuDe;
  if (item.noiDung !== undefined) payload.noi_dung = item.noiDung;
  if (item.ngay !== undefined) payload.ngay = item.ngay;
  if (item.thu !== undefined) payload.thu = item.thu;
  if (item.buoi !== undefined) payload.buoi = item.buoi;
  if (item.gioBatDau !== undefined) payload.gio_bat_dau = item.gioBatDau;
  if (item.gioKetThuc !== undefined) payload.gio_ket_thuc = item.gioKetThuc;
  if (item.lanhDaoChuTri !== undefined) payload.lanh_dao_chu_tri = item.lanhDaoChuTri;
  if (item.cotMaTran !== undefined) payload.cot_ma_tran = item.cotMaTran;
  if (item.donViChuanBi !== undefined) payload.don_vi_chuan_bi = item.donViChuanBi;
  if (item.nguoiChuanBi !== undefined) payload.nguoi_chuan_bi = item.nguoiChuanBi;
  if (item.nhanSuId !== undefined) payload.nhan_su_id = item.nhanSuId;
  if (item.thanhPhan !== undefined) payload.thanh_phan = item.thanhPhan;
  if (item.diaDiem !== undefined) payload.dia_diem = item.diaDiem;
  if (item.phongHopId !== undefined) payload.phong_hop_id = item.phongHopId;
  if (item.xeCongTac !== undefined) payload.xe_cong_tac = item.xeCongTac;
  if (item.xeId !== undefined) payload.xe_id = item.xeId;
  if (item.loaiLich !== undefined) payload.loai_lich = item.loaiLich;
  if (item.trangThai !== undefined) payload.trang_thai = item.trangThai;
  if (item.ghiChuChuanBi !== undefined) payload.ghi_chu_chuan_bi = item.ghiChuChuanBi;
  if (item.bienBanKetLuan !== undefined) payload.bien_ban_ket_luan = item.bienBanKetLuan;

  try {
    const { error } = await supabase.from('lich_co_quan').update(payload).eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi cập nhật lịch Supabase:', err);
    return false;
  }
}

// ── 8. Xóa Lịch cơ quan ──
export async function deleteLichCoQuan(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('lich_co_quan').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi khi xóa lịch Supabase:', err);
    return false;
  }
}

// ── 9. Phê duyệt Lịch cơ quan ──
export async function approveLichCoQuan(id: string): Promise<boolean> {
  return updateLichCoQuan(id, { trangThai: 'Da-duyet' });
}

// ── 10. Ghi chú tuần ──
export async function getGhiChuTuan(nam: number, tuanThu: number): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('ghi_chu_lich_tuan')
      .select('noi_dung')
      .eq('nam', nam)
      .eq('tuan_thu', tuanThu)
      .maybeSingle();

    if (error) throw error;
    if (data?.noi_dung) return data.noi_dung;
  } catch (err) {
    console.warn('Lỗi đọc ghi_chu_lich_tuan:', err);
  }
  return 'Phòng KHKT, TTKCT và các đơn vị chuyên môn chuẩn bị đầy đủ hồ sơ, tài liệu phục vụ các buổi họp và làm việc của Lãnh đạo Viện.';
}

export async function saveGhiChuTuan(nam: number, tuanThu: number, tuNgay: string, denNgay: string, noiDung: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('ghi_chu_lich_tuan')
      .upsert(
        {
          nam,
          tuan_thu: tuanThu,
          tu_ngay: tuNgay,
          den_ngay: denNgay,
          noi_dung: noiDung,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'nam,tuan_thu' }
      );

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Lỗi lưu ghi_chu_lich_tuan:', err);
    return false;
  }
}

// ── 11. Đăng ký Realtime Subscriptions cho Lịch cơ quan (dành cho Tivi Sảnh) ──
export function subscribeLichCoQuan(callback: () => void) {
  const channel = supabase
    .channel('lich_co_quan_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'lich_co_quan' }, () => {
      callback();
    })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'ghi_chu_lich_tuan' }, () => {
      callback();
    })
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
