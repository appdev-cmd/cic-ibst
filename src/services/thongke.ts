import { supabase } from '../lib/supabase';

function throwIf(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

const NAM = new Date().getFullYear();

export interface TongQuan {
  doanhThuLuyKe: number; // triệu đồng — thực thu trong năm
  hopDongDangThucHien: number;
  deTaiDangTrienKhai: number;
  mauTrongThang: number;
  tongGiaTriTheoDoi: number;
  congNoPhaiThu: number;
}

export async function fetchTongQuan(): Promise<TongQuan> {
  const [dot, hd, dt, mau] = await Promise.all([
    supabase.from('dot_thanh_toan').select('so_tien, ngay_thuc_thu'),
    supabase.from('hop_dong').select('gia_tri, da_thanh_toan, trang_thai'),
    supabase.from('de_tai').select('trang_thai'),
    supabase.from('mau_thi_nghiem').select('ngay_nhan'),
  ]);
  throwIf(dot.error || hd.error || dt.error || mau.error);

  const thang = new Date().toISOString().slice(0, 7);
  const doanhThuLuyKe = (dot.data ?? [])
    .filter((r) => r.ngay_thuc_thu && String(r.ngay_thuc_thu).startsWith(String(NAM)))
    .reduce((s, r) => s + Number(r.so_tien), 0);

  const hopDongDangThucHien = (hd.data ?? []).filter((r) => r.trang_thai === 'dang-thuc-hien').length;
  const tongGiaTriTheoDoi = (hd.data ?? [])
    .filter((r) => r.trang_thai === 'dang-thuc-hien')
    .reduce((s, r) => s + Number(r.gia_tri), 0);
  const congNoPhaiThu = (hd.data ?? [])
    .filter((r) => r.trang_thai !== 'moi')
    .reduce((s, r) => s + Math.max(0, Number(r.gia_tri) - Number(r.da_thanh_toan)), 0);

  const deTaiDangTrienKhai = (dt.data ?? []).filter((r) => r.trang_thai === 'dang-thuc-hien').length;
  const mauTrongThang = (mau.data ?? []).filter((r) => String(r.ngay_nhan).startsWith(thang)).length;

  return {
    doanhThuLuyKe,
    hopDongDangThucHien,
    deTaiDangTrienKhai,
    mauTrongThang,
    tongGiaTriTheoDoi,
    congNoPhaiThu,
  };
}

/** Doanh thu thực thu theo từng tháng trong năm hiện tại (triệu đồng). */
export async function fetchDoanhThuTheoThang(): Promise<{ thang: string; thucHien: number }[]> {
  const { data, error } = await supabase
    .from('dot_thanh_toan')
    .select('so_tien, ngay_thuc_thu');
  throwIf(error);
  const theoThang = Array.from({ length: 12 }, () => 0);
  (data ?? []).forEach((r) => {
    if (!r.ngay_thuc_thu) return;
    const d = new Date(r.ngay_thuc_thu);
    if (d.getFullYear() === NAM) theoThang[d.getMonth()] += Number(r.so_tien);
  });
  return theoThang.map((v, i) => ({ thang: `T${i + 1}`, thucHien: Math.round((v / 1000) * 10) / 10 }));
}

/** Cơ cấu giá trị hợp đồng đang theo dõi theo đơn vị thực hiện (top). */
export async function fetchDoanhThuTheoDonVi(): Promise<{ ten: string; giaTri: number; pct: number }[]> {
  const { data, error } = await supabase
    .from('hop_dong')
    .select('gia_tri, trang_thai, don_vi(ten_don_vi, ten_viet_tat)');
  throwIf(error);
  const map = new Map<string, number>();
  (data ?? [])
    .filter((r) => r.trang_thai !== 'hoan-thanh')
    .forEach((r) => {
      const dv = r.don_vi as unknown as { ten_don_vi: string; ten_viet_tat: string | null } | null;
      const ten = dv?.ten_viet_tat || dv?.ten_don_vi || 'Khác';
      map.set(ten, (map.get(ten) ?? 0) + Number(r.gia_tri));
    });
  const tong = [...map.values()].reduce((s, v) => s + v, 0) || 1;
  return [...map.entries()]
    .map(([ten, giaTri]) => ({ ten, giaTri, pct: Math.round((giaTri / tong) * 100) }))
    .sort((a, b) => b.giaTri - a.giaTri)
    .slice(0, 6);
}

/** Công nợ phải thu theo đơn vị (từ hợp đồng chưa thu đủ). */
export async function fetchCongNoTheoDonVi(): Promise<
  { donVi: string; phaiThu: number; daThu: number }[]
> {
  const { data, error } = await supabase
    .from('hop_dong')
    .select('gia_tri, da_thanh_toan, trang_thai, don_vi(ten_don_vi, ten_viet_tat)');
  throwIf(error);
  const map = new Map<string, { phaiThu: number; daThu: number }>();
  (data ?? [])
    .filter((r) => r.trang_thai !== 'moi')
    .forEach((r) => {
      const dv = r.don_vi as unknown as { ten_don_vi: string; ten_viet_tat: string | null } | null;
      const ten = dv?.ten_viet_tat || dv?.ten_don_vi || 'Khác';
      const cur = map.get(ten) ?? { phaiThu: 0, daThu: 0 };
      cur.phaiThu += Math.max(0, Number(r.gia_tri) - Number(r.da_thanh_toan));
      cur.daThu += Number(r.da_thanh_toan);
      map.set(ten, cur);
    });
  return [...map.entries()]
    .map(([donVi, v]) => ({ donVi, ...v }))
    .filter((r) => r.phaiThu > 0 || r.daThu > 0)
    .sort((a, b) => b.phaiThu - a.phaiThu);
}
