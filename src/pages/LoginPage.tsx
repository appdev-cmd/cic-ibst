import { useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { Lock, User, Eye, EyeOff, LoaderCircle, LayoutDashboard, FlaskConical, Users, FileText, Sun, Moon, Leaf } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

export function LoginPage() {
  const { session, signIn } = useAuth();
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  if (session) return <Navigate to="/" replace />;

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    
    // Tự động thêm @ibst.vn nếu người dùng chỉ nhập username (không có ký tự @)
    let loginEmail = email.trim();
    if (loginEmail && !loginEmail.includes('@')) {
      loginEmail = `${loginEmail}@ibst.vn`;
    }

    const err = await signIn(loginEmail, password);
    setSubmitting(false);
    if (err) {
      setError(
        err === 'Invalid login credentials' ? 'Tài khoản hoặc mật khẩu không đúng' : err,
      );
      return;
    }
    const from = (location.state as { from?: string } | null)?.from ?? '/';
    navigate(from, { replace: true });
  };

  return (
    <div className="flex min-h-full w-full bg-page font-sans text-ink selection:bg-primary-500/30 transition-colors duration-300 relative">
      
      {/* ─── THEME & COLOR SELECTOR (Top Right) ─── */}
      <div className="absolute top-6 right-6 z-50 flex items-center gap-4 bg-surface/85 backdrop-blur-md px-4 py-2.5 rounded-full border border-border shadow-dropdown transition-all">
        
        {/* Primary Color Picker */}
        <div className="flex items-center gap-2 border-r border-border pr-3">
          <button
            type="button"
            onClick={() => setPrimaryColor('teal')}
            className={`w-5 h-5 rounded-full bg-[#00668c] border-2 transition-all ${
              primaryColor === 'teal' ? 'border-ink scale-110 shadow-sm' : 'border-transparent hover:scale-105'
            }`}
            title="Xanh mặc định"
          />
          <button
            type="button"
            onClick={() => setPrimaryColor('red')}
            className={`w-5 h-5 rounded-full bg-[#ae1e23] border-2 transition-all ${
              primaryColor === 'red' ? 'border-ink scale-110 shadow-sm' : 'border-transparent hover:scale-105'
            }`}
            title="Đỏ IBST"
          />
          <button
            type="button"
            onClick={() => setPrimaryColor('blue')}
            className={`w-5 h-5 rounded-full bg-[#0f52ba] border-2 transition-all ${
              primaryColor === 'blue' ? 'border-ink scale-110 shadow-sm' : 'border-transparent hover:scale-105'
            }`}
            title="Xanh Bộ Xây dựng"
          />
        </div>

        {/* Background Theme Selector */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'light'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-subtle'
            }`}
            title="Giao diện Sáng"
          >
            <Sun size={15} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('nature')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'nature'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-subtle'
            }`}
            title="Giao diện Bảo vệ mắt"
          >
            <Leaf size={15} />
          </button>
          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={`p-1.5 rounded-lg transition-all ${
              theme === 'dark'
                ? 'bg-primary-500 text-white shadow-sm'
                : 'text-ink-muted hover:text-ink hover:bg-subtle'
            }`}
            title="Giao diện Tối"
          >
            <Moon size={15} />
          </button>
        </div>

      </div>

      {/* ─── LEFT COLUMN: BRANDING & FEATURES (Hidden on Mobile) ─── */}
      <div className="hidden lg:flex w-1/2 flex-col justify-between relative overflow-hidden bg-[#ede8df] dark:bg-[#0c1424] border-r border-[#e5dfd4] dark:border-white/5 p-12 xl:p-20 transition-colors duration-300">
        {/* Background ambient accents - CIC style */}
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-white/[0.2] dark:bg-white/[0.02] blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary-500/5 dark:bg-primary-500/[0.03] blur-[100px] pointer-events-none" />
        
        {/* Diagonal lines pattern / Grid pattern */}
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle at 100% 100%, #ffffff 1px, transparent 1px)', backgroundSize: '48px 48px' }}></div>

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-border bg-surface p-1.5 shadow-card">
            <img src={logo} alt="IBST Logo" className="h-full w-full object-contain" />
          </div>
          <div>
            <div className="font-black tracking-widest text-[18px] uppercase text-ink leading-tight">
              IBST<span className="text-primary-600 dark:text-primary-500"> ERP</span>
            </div>
            <div className="text-[10px] text-ink-muted font-bold tracking-wider uppercase mt-1">
              Hệ thống Quản trị Viện KHCN Xây dựng
            </div>
          </div>
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mt-12 mb-8 xl:mt-0 xl:mb-0">
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight">
            Quản trị <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-600 to-primary-400 dark:from-primary-500 dark:to-primary-300">
              khoa học công nghệ.
            </span>
          </h1>
          <p className="mt-4 text-base xl:text-lg text-ink-secondary font-semibold max-w-xl">
            Tối ưu tiến độ nghiên cứu, kiểm soát hợp đồng dịch vụ khoa học kỹ thuật và thử nghiệm chuyên sâu.
          </p>

          {/* Feature List - CIC Style Cards */}
          <div className="mt-12 space-y-3 w-full xl:pr-12">
            {/* Feature 1 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface/50 border border-border backdrop-blur-md hover:bg-surface/80 transition-all duration-300">
              <div className="text-primary-600 dark:text-primary-500 flex-shrink-0 opacity-90">
                <LayoutDashboard className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">Dashboard điều hành</h3>
                <p className="text-[13px] text-ink-muted mt-0.5 font-medium">Biểu đồ tiến độ, doanh thu và phân công Phó Viện trưởng trực quan</p>
              </div>
            </div>

            {/* Feature 2 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface/50 border border-border backdrop-blur-md hover:bg-surface/80 transition-all duration-300">
              <div className="text-primary-600 dark:text-primary-500 flex-shrink-0 opacity-90">
                <FlaskConical className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">Quy trình LIMS & Thí nghiệm</h3>
                <p className="text-[13px] text-ink-muted mt-0.5 font-medium">Quản lý nhận mẫu, thử nghiệm, duyệt và phát hành kết quả chỉ tiêu</p>
              </div>
            </div>

            {/* Feature 3 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface/50 border border-border backdrop-blur-md hover:bg-surface/80 transition-all duration-300">
              <div className="text-primary-600 dark:text-primary-500 flex-shrink-0 opacity-90">
                <Users className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">Nhân sự & Sơ đồ tổ chức</h3>
                <p className="text-[13px] text-ink-muted mt-0.5 font-medium">Theo dõi chứng chỉ hành nghề, quá trình công tác và sơ đồ cây tổ chức</p>
              </div>
            </div>

            {/* Feature 4 */}
            <div className="flex items-center gap-4 p-5 rounded-2xl bg-surface/50 border border-border backdrop-blur-md hover:bg-surface/80 transition-all duration-300">
              <div className="text-primary-600 dark:text-primary-500 flex-shrink-0 opacity-90">
                <FileText className="w-[22px] h-[22px]" />
              </div>
              <div>
                <h3 className="text-[15px] font-bold text-ink">Hợp đồng & Văn bản đi/đến</h3>
                <p className="text-[13px] text-ink-muted mt-0.5 font-medium">Số hóa đợt thanh toán, công nợ và lưu trữ đính kèm tài liệu qua Storage</p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Info */}
        <div className="relative z-10 flex items-center gap-5 text-[11px] font-semibold text-ink-muted tracking-wider uppercase">
          <span>Phiên bản GĐ3 v3.3</span>
          <span className="w-1 h-1 rounded-full bg-border-subtle"></span>
          <span>Bảo mật SSL 256-bit</span>
          <span className="w-1 h-1 rounded-full bg-border-subtle"></span>
          <span className="flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 99.9% Uptime</span>
        </div>
      </div>

      {/* ─── RIGHT COLUMN: LOGIN FORM ─── */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center items-center p-6 sm:p-12 relative bg-page transition-colors duration-300">
        <div className="w-full max-w-[460px] lg:-mt-10">
          
          {/* Logo & Headers */}
          <div className="flex flex-col items-center text-center mb-6 w-full">
            <div className="mb-4 flex h-28 w-28 items-center justify-center rounded-2xl border border-border bg-surface p-2 shadow-card transition-transform hover:scale-105 duration-500">
              <img src={logo} alt="IBST Logo" className="h-full w-full object-contain" />
            </div>
            
            <h2 className="text-[14px] font-bold tracking-[0.15em] uppercase text-ink-muted mb-1 flex justify-center w-full">
              Bộ Xây dựng
            </h2>
            <h3 className="text-[17px] sm:text-[19px] font-black tracking-wider uppercase leading-snug flex justify-center w-full">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-700 via-blue-500 to-blue-800 dark:from-blue-400 dark:via-blue-200 dark:to-blue-400">
                Viện Khoa học Công nghệ Xây dựng
              </span>
            </h3>
            <p className="mt-1 text-[11px] font-bold text-ink-muted tracking-[0.2em] uppercase flex justify-center w-full">
              Hệ thống quản trị tổng thể IBST
            </p>
          </div>

          {/* Divider */}
          <div className="flex items-center gap-4 mb-6">
            <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent to-border"></div>
            <span className="text-xs font-bold text-ink-muted tracking-widest uppercase">Đăng nhập hệ thống</span>
            <div className="h-[1px] flex-1 bg-gradient-to-l from-transparent to-border"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-950/20 text-danger dark:text-red-400 text-xs font-semibold rounded-xl border border-red-200 dark:border-red-900/50 flex items-center justify-center text-center">
                {error}
              </div>
            )}

            {/* Username Input */}
            <div>
              <label className="mb-1 block text-2xs font-black uppercase tracking-wider text-ink-muted">
                Tài khoản hoặc Email
              </label>
              <div className="relative group flex items-center gap-2 rounded-xl border border-border bg-subtle px-3 py-2.5 focus-within:border-primary-500 transition-all">
                <User size={16} className="shrink-0 text-ink-muted group-focus-within:text-primary-500" />
                <input
                  type="text"
                  required
                  autoFocus
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="cic hoặc ten@ibst.vn"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted"
                  disabled={submitting}
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="mb-1 block text-2xs font-black uppercase tracking-wider text-ink-muted">
                Mật khẩu
              </label>
              <div className="relative group flex items-center gap-2 rounded-xl border border-border bg-subtle px-3 py-2.5 focus-within:border-primary-500 transition-all">
                <Lock size={16} className="shrink-0 text-ink-muted group-focus-within:text-primary-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-transparent text-sm text-ink outline-none placeholder:text-ink-muted pr-8"
                  disabled={submitting}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-ink-muted hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <div className="flex justify-between items-center pt-1 pb-2">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-border text-primary-600 focus:ring-primary-500 bg-subtle"
                />
                <span className="text-xs text-ink-muted group-hover:text-ink transition-colors">
                  Ghi nhớ đăng nhập
                </span>
              </label>
              
              <button
                type="button"
                className="text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary w-full justify-center disabled:opacity-60 py-3"
            >
              {submitting ? (
                <LoaderCircle size={16} className="animate-spin" />
              ) : (
                <span>Đăng nhập</span>
              )}
            </button>
          </form>

          <div className="mt-12 text-center text-2xs text-ink-muted">
            Phát triển bởi CIC — dữ liệu phân quyền theo QĐ 942/QĐ-BXD
          </div>
        </div>
      </div>
    </div>
  );
}

