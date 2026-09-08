import { supabase } from '../lib/supabase';

export type KyDanhGia = 'ca-nam' | 'quy-1' | 'quy-2' | 'quy-3' | 'quy-4';
export type MucXepLoai = 'hoan-thanh-xuat-sac' | 'hoan-thanh-tot' | 'hoan-thanh' | 'khong-hoan-thanh';

export interface DanhGiaVienChuc {
  id: string;
  nhanSuId: string;
  hoVaTen: string;
  hocVi?: string;
  chucDanh?: string;
  donViId?: string;
  donViTen?: string;
  donViTenVietTat?: string;
  nam: number;
  ky: KyDanhGia;
  diemChung: number;       // Tiêu chí chung (tối đa 30đ)
  diemNhiemVu: number;     // Kết quả thực hiện nhiệm vụ (tối đa 70đ)
  tongDiem: number;        // Tổng điểm (thang 100)
  tuXepLoai: MucXepLoai;
  xepLoai: MucXepLoai;
  tiLeHoanThanh: number;   // Tỷ lệ % hoàn thành khối lượng công việc
  biKyLuat: boolean;       // Bị xử lý kỷ luật theo NĐ 233/2026
  hinhThucKyLuat?: string; // Hình thức kỷ luật (khiển trách, cảnh cáo...)
  nhanXet: string;
  trangThai: 'nhap' | 'cho-duyet' | 'da-duyet';
  createdAt: string;
}

export interface ThongKeDanhGia {
  nam: number;
  ky: string;
  tongSo: number;
  xuatSac: number;
  xuatSacTiLe: number;       // %
  vuotTranXuatSac: boolean;  // Cảnh báo nếu > 20%
  tot: number;
  totTiLe: number;
  hoanThanh: number;
  hoanThanhTiLe: number;
  khongHoanThanh: number;
  khongHoanThanhTiLe: number;
  soBiKyLuat: number;
  diemTrungBinh: number;
}

export interface DanhGiaInput {
  nhanSuId: string | number;
  nam: number;
  ky: KyDanhGia;
  diemChung: number;
  diemNhiemVu: number;
  tuXepLoai?: MucXepLoai;
  xepLoai?: MucXepLoai;
  biKyLuat?: boolean;
  hinhThucKyLuat?: string;
  nhanXet?: string;
  trangThai?: 'nhap' | 'cho-duyet' | 'da-duyet';
}

export const MUC_XEP_LOAI_META: Record<MucXepLoai, { label: string; shortLabel: string; color: string; badgeCls: string }> = {
  'hoan-thanh-xuat-sac': {
    label: 'Hoàn thành xuất sắc nhiệm vụ',
    shortLabel: 'Xuất sắc (HTXSNV)',
    color: '#059669',
    badgeCls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800',
  },
  'hoan-thanh-tot': {
    label: 'Hoàn thành tốt nhiệm vụ',
    shortLabel: 'Tốt (HTTNV)',
    color: '#2563eb',
    badgeCls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-400 dark:border-blue-800',
  },
  'hoan-thanh': {
    label: 'Hoàn thành nhiệm vụ',
    shortLabel: 'Hoàn thành (HTNV)',
    color: '#d97706',
    badgeCls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800',
  },
  'khong-hoan-thanh': {
    label: 'Không hoàn thành nhiệm vụ',
    shortLabel: 'Không HT (KHTNV)',
    color: '#dc2626',
    badgeCls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800',
  },
};

export const KY_DANH_GIA_LABELS: Record<KyDanhGia, string> = {
  'ca-nam': 'Cả năm',
  'quy-1': 'Quý 1',
  'quy-2': 'Quý 2',
  'quy-3': 'Quý 3',
  'quy-4': 'Quý 4',
};

/** Lấy danh sách đánh giá theo bộ lọc */
export async function fetchDanhGiaVienChuc(filters: {
  nam?: number;
  ky?: string;
  donViId?: string;
  xepLoai?: string;
  search?: string;
}): Promise<DanhGiaVienChuc[]> {
  const nam = filters.nam || 2026;
  let query = supabase
    .from('danh_gia_cbvc')
    .select(`
      id,
      nhan_su_id,
      nam,
      ky,
      tu_xep_loai,
      xep_loai,
      diem,
      nhan_xet,
      trang_thai,
      created_at,
      nhan_su:nhan_su!danh_gia_cbvc_nhan_su_id_fkey (
        id,
        ho_va_ten,
        hoc_vi,
        chuc_danh,
        don_vi_id,
        don_vi:don_vi!nhan_su_don_vi_id_fkey (
          id,
          ten_don_vi,
          ten_viet_tat
        )
      )
    `)
    .eq('nam', nam);

  if (filters.ky && filters.ky !== 'all') {
    query = query.eq('ky', filters.ky);
  }

  if (filters.xepLoai && filters.xepLoai !== 'all') {
    query = query.eq('xep_loai', filters.xepLoai);
  }

  const { data, error } = await query;
  if (error) throw new Error(error.message);

  const list: DanhGiaVienChuc[] = (data || []).map((row: any) => {
    const ns = row.nhan_su || {};
    const dv = ns.don_vi || {};
    const diem = Number(row.diem) || 0;

    // Phân tích metadata trong nhan_xet nếu có JSON
    let diemChung = Math.round(diem * 0.3 * 10) / 10;
    let diemNhiemVu = Math.round((diem - diemChung) * 10) / 10;
    let biKyLuat = false;
    let hinhThucKyLuat: string | undefined = undefined;
    let nhanXetText = row.nhan_xet || '';
    let tiLeHoanThanh = Math.min(100, Math.round(diem));

    if (row.nhan_xet && row.nhan_xet.startsWith('{')) {
      try {
        const meta = JSON.parse(row.nhan_xet);
        if (meta.diemChung !== undefined) diemChung = Number(meta.diemChung);
        if (meta.diemNhiemVu !== undefined) diemNhiemVu = Number(meta.diemNhiemVu);
        if (meta.biKyLuat !== undefined) biKyLuat = Boolean(meta.biKyLuat);
        if (meta.hinhThucKyLuat) hinhThucKyLuat = meta.hinhThucKyLuat;
        if (meta.nhanXet) nhanXetText = meta.nhanXet;
        if (meta.tiLeHoanThanh !== undefined) tiLeHoanThanh = Number(meta.tiLeHoanThanh);
      } catch {
        // Fallback to plain text
      }
    }

    // Quy tắc NĐ 233/2026: nếu bị kỷ luật thì xepLoai = 'khong-hoan-thanh'
    let xepLoaiValue: MucXepLoai = (row.xep_loai as MucXepLoai) || 'hoan-thanh-tot';
    if (biKyLuat) {
      xepLoaiValue = 'khong-hoan-thanh';
    }

    return {
      id: String(row.id),
      nhanSuId: String(row.nhan_su_id),
      hoVaTen: ns.ho_va_ten || 'Chưa rõ',
      hocVi: ns.hoc_vi,
      chucDanh: ns.chuc_danh,
      donViId: ns.don_vi_id ? String(ns.don_vi_id) : undefined,
      donViTen: dv.ten_don_vi || dv.ten,
      donViTenVietTat: dv.ten_viet_tat,
      nam: row.nam,
      ky: (row.ky as KyDanhGia) || 'ca-nam',
      diemChung,
      diemNhiemVu,
      tongDiem: diem,
      tuXepLoai: (row.tu_xep_loai as MucXepLoai) || xepLoaiValue,
      xepLoai: xepLoaiValue,
      tiLeHoanThanh,
      biKyLuat,
      hinhThucKyLuat,
      nhanXet: nhanXetText,
      trangThai: row.trang_thai || 'da-duyet',
      createdAt: row.created_at,
    };
  });

  // Client-side filtering cho donViId và search text
  let filtered = list;
  if (filters.donViId && filters.donViId !== 'all') {
    filtered = filtered.filter((item) => String(item.donViId) === String(filters.donViId));
  }

  if (filters.search && filters.search.trim() !== '') {
    const q = filters.search.toLowerCase().trim();
    filtered = filtered.filter(
      (item) =>
        item.hoVaTen.toLowerCase().includes(q) ||
        (item.chucDanh && item.chucDanh.toLowerCase().includes(q)) ||
        (item.donViTen && item.donViTen.toLowerCase().includes(q)) ||
        (item.donViTenVietTat && item.donViTenVietTat.toLowerCase().includes(q))
    );
  }

  return filtered;
}

/** Thống kê KPI đánh giá theo năm và kỳ */
export async function fetchThongKeDanhGia(nam: number, ky?: string): Promise<ThongKeDanhGia> {
  const list = await fetchDanhGiaVienChuc({ nam, ky: ky || 'all' });
  const tongSo = list.length;
  if (tongSo === 0) {
    return {
      nam,
      ky: ky || 'all',
      tongSo: 0,
      xuatSac: 0,
      xuatSacTiLe: 0,
      vuotTranXuatSac: false,
      tot: 0,
      totTiLe: 0,
      hoanThanh: 0,
      hoanThanhTiLe: 0,
      khongHoanThanh: 0,
      khongHoanThanhTiLe: 0,
      soBiKyLuat: 0,
      diemTrungBinh: 0,
    };
  }

  const xuatSac = list.filter((i) => i.xepLoai === 'hoan-thanh-xuat-sac').length;
  const tot = list.filter((i) => i.xepLoai === 'hoan-thanh-tot').length;
  const hoanThanh = list.filter((i) => i.xepLoai === 'hoan-thanh').length;
  const khongHoanThanh = list.filter((i) => i.xepLoai === 'khong-hoan-thanh').length;
  const soBiKyLuat = list.filter((i) => i.biKyLuat).length;
  const tongDiem = list.reduce((acc, cur) => acc + cur.tongDiem, 0);

  const xuatSacTiLe = Math.round((xuatSac / tongSo) * 1000) / 10;
  // Quy định NĐ 233/2026: Tỷ lệ HTXSNV khống chế không quá 20%
  const vuotTranXuatSac = xuatSacTiLe > 20.0;

  return {
    nam,
    ky: ky || 'all',
    tongSo,
    xuatSac,
    xuatSacTiLe,
    vuotTranXuatSac,
    tot,
    totTiLe: Math.round((tot / tongSo) * 1000) / 10,
    hoanThanh,
    hoanThanhTiLe: Math.round((hoanThanh / tongSo) * 1000) / 10,
    khongHoanThanh,
    khongHoanThanhTiLe: Math.round((khongHoanThanh / tongSo) * 1000) / 10,
    soBiKyLuat,
    diemTrungBinh: Math.round((tongDiem / tongSo) * 10) / 10,
  };
}

/** Lưu hoặc cập nhật phiếu đánh giá viên chức */
export async function saveDanhGiaVienChuc(input: DanhGiaInput): Promise<void> {
  const tongDiem = Number((Number(input.diemChung) + Number(input.diemNhiemVu)).toFixed(1));
  
  // Tự động phân loại theo khung điểm NĐ 233/2026 nếu không chỉ định
  let autoXepLoai: MucXepLoai = 'hoan-thanh-tot';
  if (input.biKyLuat) {
    autoXepLoai = 'khong-hoan-thanh';
  } else if (tongDiem >= 90) {
    autoXepLoai = 'hoan-thanh-xuat-sac';
  } else if (tongDiem >= 70) {
    autoXepLoai = 'hoan-thanh-tot';
  } else if (tongDiem >= 50) {
    autoXepLoai = 'hoan-thanh';
  } else {
    autoXepLoai = 'khong-hoan-thanh';
  }

  const finalXepLoai = input.xepLoai || autoXepLoai;

  const metaObj = {
    nd: '233/2026/ND-CP',
    diemChung: Number(input.diemChung),
    diemNhiemVu: Number(input.diemNhiemVu),
    tongDiem,
    biKyLuat: Boolean(input.biKyLuat),
    hinhThucKyLuat: input.hinhThucKyLuat || null,
    nhanXet: input.nhanXet || '',
    tiLeHoanThanh: Math.min(100, Math.round(tongDiem)),
  };

  const payload = {
    nhan_su_id: Number(input.nhanSuId),
    nam: input.nam,
    ky: input.ky,
    tu_xep_loai: input.tuXepLoai || finalXepLoai,
    xep_loai: finalXepLoai,
    diem: tongDiem,
    nhan_xet: JSON.stringify(metaObj),
    trang_thai: input.trangThai || 'da-duyet',
    updated_at: new Date().toISOString(),
  };

  const { error } = await supabase.from('danh_gia_cbvc').upsert(payload, {
    onConflict: 'nhan_su_id,nam,ky',
  });

  if (error) throw new Error(error.message);
}

/** Phê duyệt hoặc cập nhật trạng thái phiếu đánh giá */
export async function updateTrangThaiDanhGia(
  id: string,
  trangThai: 'nhap' | 'cho-duyet' | 'da-duyet'
): Promise<void> {
  const { error } = await supabase
    .from('danh_gia_cbvc')
    .update({ trang_thai: trangThai, updated_at: new Date().toISOString() })
    .eq('id', id);

  if (error) throw new Error(error.message);
}
