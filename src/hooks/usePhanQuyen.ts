import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import type { HanhDong, TaiNguyen } from '../lib/phanQuyen';

interface QuyenState {
  /** "vaiTro:taiNguyen" → hành động được phép theo mặc định vai trò. */
  macDinh: Record<string, HanhDong[]>;
  /** "taiNguyen" → hành động được phép — CHỈ có khi user này bị ghi đè riêng. */
  ghiDe: Record<string, HanhDong[]>;
  /** Đơn vị được cấp quyền xem thêm (không tính đơn vị của chính mình). */
  donViXemDuocThem: string[];
}

const RONG: QuyenState = { macDinh: {}, ghiDe: {}, donViXemDuocThem: [] };

/**
 * Nạp quyền hiệu lực (Tầng 3 — RBAC) từ CSDL: `quyen_vai_tro_mac_dinh` (mặc định
 * theo vai trò) + `quyen_nguoi_dung` (ghi đè riêng, nếu có thì quyết định luôn,
 * kể cả mảng rỗng = đã bị thu hồi quyền) + `quyen_xem_lien_don_vi`.
 *
 * ⚠️ KHÔNG dùng `useAsyncData` ở đây: fetcher phụ thuộc `userId`/`nhanSuId` — hai
 * giá trị này nạp bất đồng bộ SAU khi có session (xem AuthContext), còn
 * `useAsyncData` chỉ refetch theo `tick` nội bộ nên sẽ bỏ lỡ lần đổi giá trị đó.
 * Viết effect riêng với đúng dependency để không rơi vào lỗi tương tự.
 */
export function usePhanQuyen() {
  const { vaiTro, nhanSuId, session } = useAuth();
  const userId = session?.user.id;

  const [state, setState] = useState<QuyenState>(RONG);
  const [dangTai, setDangTai] = useState(true);

  useEffect(() => {
    let active = true;
    if (!userId) {
      setState(RONG);
      setDangTai(false);
      return;
    }
    setDangTai(true);

    Promise.all([
      supabase.from('quyen_vai_tro_mac_dinh').select('vai_tro, tai_nguyen, hanh_dong'),
      supabase.from('quyen_nguoi_dung').select('tai_nguyen, hanh_dong').eq('user_id', userId),
      nhanSuId
        ? supabase.from('quyen_xem_lien_don_vi').select('don_vi_duoc_xem_id').eq('nhan_su_id', nhanSuId)
        : Promise.resolve({ data: [] as { don_vi_duoc_xem_id: number }[], error: null }),
    ])
      .then(([macDinhRes, ghiDeRes, lienDonViRes]) => {
        if (!active) return;
        if (macDinhRes.error) throw new Error(macDinhRes.error.message);
        if (ghiDeRes.error) throw new Error(ghiDeRes.error.message);

        const macDinh: Record<string, HanhDong[]> = {};
        for (const r of macDinhRes.data ?? []) {
          macDinh[`${r.vai_tro}:${r.tai_nguyen}`] = (r.hanh_dong ?? []) as HanhDong[];
        }
        const ghiDe: Record<string, HanhDong[]> = {};
        for (const r of ghiDeRes.data ?? []) {
          ghiDe[r.tai_nguyen] = (r.hanh_dong ?? []) as HanhDong[];
        }
        const donViXemDuocThem = (lienDonViRes.data ?? []).map((r) => String(r.don_vi_duoc_xem_id));

        setState({ macDinh, ghiDe, donViXemDuocThem });
      })
      .catch((e: unknown) => {
        console.error('Lỗi khi nạp quyền:', e);
        if (active) setState(RONG);
      })
      .finally(() => {
        if (active) setDangTai(false);
      });

    return () => {
      active = false;
    };
  }, [userId, nhanSuId]);

  /**
   * Kiểm tra quyền — deny-by-default.
   * Trong lúc `dangTai === true`, luôn trả `false`: gọi nơi dùng phải tự kiểm
   * `dangTai` để tránh chặn nhầm người dùng hợp lệ ngay lúc trang vừa mở
   * (`useAsyncData` có cùng cảnh báo này — xem CLAUDE.md).
   */
  const can = useCallback(
    (taiNguyen: TaiNguyen, hanhDong: HanhDong): boolean => {
      if (dangTai) return false;
      if (vaiTro === 'quan-tri') return true;

      const ghiDe = state.ghiDe[taiNguyen];
      if (ghiDe) return ghiDe.includes(hanhDong);

      const macDinh = state.macDinh[`${vaiTro}:${taiNguyen}`];
      return macDinh ? macDinh.includes(hanhDong) : false;
    },
    [dangTai, vaiTro, state],
  );

  return { can, dangTai, donViXemDuocThem: state.donViXemDuocThem, vaiTro };
}
