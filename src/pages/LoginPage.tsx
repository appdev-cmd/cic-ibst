import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, LoaderCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function LoginPage() {
  const { session, signIn } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    const err = await signIn(email, password);
    setSubmitting(false);
    if (err) {
      setError(
        err === 'Invalid login credentials' ? 'Email hoặc mật khẩu không đúng' : err,
      );
      return;
    }
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-page p-4">
      <div className="card w-full max-w-md p-8">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-xl border border-border bg-surface shadow-card">
            <Building2 size={30} className="text-primary-500" />
          </div>
          <h1 className="bg-gradient-to-r from-gold-400 via-gold-200 to-gold-400 bg-clip-text text-lg font-black uppercase tracking-wide text-transparent">
            Bộ Xây dựng
          </h1>
          <p className="mt-1 text-xs font-bold uppercase leading-tight text-ink">
            Viện Khoa học Công nghệ Xây dựng
            <br />
            Hệ thống quản trị tổng thể IBST
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1 block text-2xs font-black uppercase tracking-wider text-ink-muted">
              Email
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-subtle px-3 py-2.5 focus-within:border-primary-500">
              <Mail size={16} className="shrink-0 text-ink-muted" />
              <input
                type="email"
                required
                autoFocus
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="ten@ibst.vn"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
          </div>
          <div>
            <label className="mb-1 block text-2xs font-black uppercase tracking-wider text-ink-muted">
              Mật khẩu
            </label>
            <div className="flex items-center gap-2 rounded-xl border border-border bg-subtle px-3 py-2.5 focus-within:border-primary-500">
              <Lock size={16} className="shrink-0 text-ink-muted" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
              />
            </div>
          </div>

          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full justify-center disabled:opacity-60"
          >
            {submitting && <LoaderCircle size={16} className="animate-spin" />}
            Đăng nhập
          </button>
        </form>

        <p className="mt-6 text-center text-2xs text-ink-muted">
          Phát triển bởi CIC — dữ liệu phân quyền theo QĐ 942/QĐ-BXD
        </p>
      </div>
    </div>
  );
}
