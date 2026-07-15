import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';

export type VaiTro = 'quan-tri' | 'lanh-dao' | 'truong-don-vi' | 'chuyen-vien';

interface AuthContextValue {
  session: Session | null;
  loading: boolean;
  vaiTro: VaiTro;
  signIn: (email: string, password: string) => Promise<string | null>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue>({
  session: null,
  loading: true,
  vaiTro: 'chuyen-vien',
  signIn: async () => null,
  signOut: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [vaiTro, setVaiTro] = useState<VaiTro>('chuyen-vien');

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

  // Nạp vai trò khi có phiên đăng nhập
  useEffect(() => {
    if (!session) {
      setVaiTro('chuyen-vien');
      return;
    }
    supabase
      .rpc('fn_vai_tro')
      .then(({ data }) => setVaiTro((data as VaiTro) ?? 'chuyen-vien'));
  }, [session]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return error ? error.message : null;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, loading, vaiTro, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  return useContext(AuthContext);
}
