import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

/**
 * Vai trò hệ thống theo ma trận RACI Điều 4 QC 2815.
 * 4 vai trò đầu là vai trò cấp bậc; 5 vai trò sau là phòng chức năng (migration 0022):
 * P.KHKT thẩm tra hồ sơ cấp Viện (Đ.9.6c), P.TCKT đầu mối quyết toán (Đ.11.4),
 * P.TCHC lưu trữ/con dấu (Đ.9.8), P.Tổng hợp đơn vị thẩm tra nội bộ (Đ.7.1c-4),
 * Phụ trách kế toán đơn vị làm thủ tục thanh quyết toán (Đ.11.1).
 */
export type VaiTro =
  | 'quan-tri'
  | 'lanh-dao'
  | 'truong-don-vi'
  | 'chuyen-vien'
  | 'phong-khkt'
  | 'phong-tckt'
  | 'phong-tchc'
  | 'phong-th-don-vi'
  | 'phu-trach-ke-toan-dv'
  // 2 vai trò dưới đã dùng thật ở RLS từ migration 0033 (lương, HĐLĐ, hồ sơ đảng viên)
  // nhưng trước migration 0040/phân quyền không có mặt ở tầng TypeScript — không gán
  // được qua giao diện. Xem docs/phan-quyen-he-thong-ibst.md §3.1.
  | 'can-bo-to-chuc'
  | 'van-phong-dang-uy';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  vaiTro: VaiTro;
  /** Mã nhân sự (bảng nhan_su) gắn với tài khoản đang đăng nhập — dùng để ghi nhận đúng
   * người thật đã phê duyệt/ký từng bước (Điều 6.1, 7.1c), không chỉ ghi ngày tháng. */
  nhanSuId: string | null;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  vaiTro: 'chuyen-vien',
  nhanSuId: null,
  signIn: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaiTro, setVaiTro] = useState<VaiTro>('chuyen-vien');
  const [nhanSuId, setNhanSuId] = useState<string | null>(null);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data }) => {
      let s = data.session;
      // Tự đăng nhập khi chạy local (npm run dev) để tiện test — không áp dụng cho bản build
      if (
        !s &&
        import.meta.env.DEV &&
        import.meta.env.VITE_AUTO_LOGIN === 'true' &&
        import.meta.env.VITE_AUTO_LOGIN_EMAIL &&
        import.meta.env.VITE_AUTO_LOGIN_PASSWORD
      ) {
        const { data: signed } = await supabase.auth.signInWithPassword({
          email: import.meta.env.VITE_AUTO_LOGIN_EMAIL,
          password: import.meta.env.VITE_AUTO_LOGIN_PASSWORD,
        });
        s = signed.session;
      }
      setSession(s);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  // Nạp vai trò + mã nhân sự khi có phiên đăng nhập
  useEffect(() => {
    if (!session) {
      setVaiTro('chuyen-vien');
      setNhanSuId(null);
      return;
    }
    supabase
      .rpc('fn_vai_tro')
      .then(({ data }) => setVaiTro((data as VaiTro) ?? 'chuyen-vien'));
    supabase
      .from('nguoi_dung')
      .select('nhan_su_id')
      .eq('user_id', session.user.id)
      .maybeSingle()
      .then(({ data }) => setNhanSuId(data?.nhan_su_id != null ? String(data.nhan_su_id) : null));
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, vaiTro, nhanSuId, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
