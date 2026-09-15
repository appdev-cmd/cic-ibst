import { useState, useRef, useEffect, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import {
  Lock,
  User,
  Eye,
  EyeOff,
  LoaderCircle,
  LayoutDashboard,
  FlaskConical,
  Users,
  FileText,
  Sun,
  Moon,
  Leaf,
  ChevronDown,
  Building2,
  Settings,
  ClipboardList,
  DollarSign,
  FolderKanban,
  HardHat,
  Layers,
  Compass,
  Wrench,
  Factory,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import logo from '../assets/logo.png';

// ── Danh sách tài khoản thử nghiệm thực tế (Mật khẩu chung: Ibst@2026) ──
const QUICK_ACCOUNTS = [
  // Lãnh đạo & Quản trị Viện
  { group: 'Lãnh đạo Viện', email: 'nguyenhonghai@ibst.vn', label: 'Nguyễn Hồng Hải — Viện trưởng', icon: Building2 },
  { group: 'Lãnh đạo Viện', email: 'dinhquocdan@ibst.vn', label: 'Đinh Quốc Dân — Phó Viện trưởng', icon: Building2 },
  { group: 'Lãnh đạo Viện', email: 'caoduykhoi@ibst.vn',  label: 'Cao Duy Khôi — Phó Viện trưởng', icon: Building2 },
  { group: 'Lãnh đạo Viện', email: 'admin@ibst.vn',       label: 'Quản trị hệ thống (Admin)',   icon: Settings },

  // Phòng Kế hoạch – Kỹ thuật (KHKT) - Theo Bảng lương T9-2026
  { group: 'Phòng KHKT', email: 'nguyen.thi.thuy.van852@ibst.gov.vn', label: 'Nguyễn Thị Thùy Vân — Trưởng phòng KHKT', icon: ClipboardList },
  { group: 'Phòng KHKT', email: 'nguyen.manh.cuong307@ibst.gov.vn',    label: 'Nguyễn Mạnh Cường — Phó phòng KHKT', icon: ClipboardList },
  { group: 'Phòng KHKT', email: 'khkt@ibst.vn',                        label: 'Đỗ Văn Mạnh — Phó phòng KHKT', icon: ClipboardList },
  { group: 'Phòng KHKT', email: 'vo.thanh.hung83@ibst.gov.vn',         label: 'Võ Thanh Hùng — KS chính KHKT', icon: User },

  // Phòng Tài chính – Kế toán (TCKT) - Theo Bảng lương T9-2026
  { group: 'Phòng TCKT', email: 'nguyen.thi.thanh.hoai854@ibst.gov.vn', label: 'Nguyễn Thị Thanh Hoài — Trưởng phòng TCKT', icon: DollarSign },
  { group: 'Phòng TCKT', email: 'hoang.thi.minh.tam89@ibst.gov.vn',     label: 'Hoàng Thị Minh Tâm — PTP Kế toán Viện', icon: DollarSign },
  { group: 'Phòng TCKT', email: 'nguyen.thi.yen91@ibst.gov.vn',         label: 'Nguyễn Thị Yến — Kế toán viên', icon: DollarSign },
  { group: 'Phòng TCKT', email: 'le.thi.van.anh92@ibst.gov.vn',         label: 'Lê Thị Vân Anh — Chuyên viên TCKT', icon: User },

  // Phòng Tổ chức – Hành chính (TCHC) - Theo Bảng lương T9-2026
  { group: 'Phòng TCHC', email: 'tchc@ibst.vn',                        label: 'Nguyễn Nam Thắng — Trưởng phòng TCHC', icon: FolderKanban },
  { group: 'Phòng TCHC', email: 'tran.thi.lan65@ibst.gov.vn',          label: 'Trần Thị Lan — Phó phòng TCHC', icon: FolderKanban },
  { group: 'Phòng TCHC', email: 'le.thanh.nam61@ibst.gov.vn',           label: 'Lê Thanh Nam — Phó phòng TCHC', icon: FolderKanban },
  { group: 'Phòng TCHC', email: 'bui.thi.huyen62@ibst.gov.vn',          label: 'Bùi Thị Huyển — Chuyên viên TCHC', icon: User },

  // Viện Kết cấu công trình (VKC)
  { group: 'Viện Kết cấu (VKC)', email: 'kc@ibst.vn',                  label: 'Đỗ Tiến Thịnh — Viện trưởng VKC', icon: HardHat },
  { group: 'Viện Kết cấu (VKC)', email: 'pham.van.cuong157@ibst.gov.vn', label: 'Phạm Văn Cường — Phó Viện trưởng VKC', icon: HardHat },
  { group: 'Viện Kết cấu (VKC)', email: 'pham.trung.thanh101@ibst.gov.vn', label: 'Phạm Trung Thành — Chuyên viên VKC', icon: User },

  // Viện Bê tông (VBT)
  { group: 'Viện Bê tông (VBT)', email: 'bt@ibst.vn',                  label: 'Hoàng Minh Đức — Viện trưởng VBT', icon: Layers },
  { group: 'Viện Bê tông (VBT)', email: 'o.thi.lan.hoa861@ibst.gov.vn',  label: 'Đỗ Thị Lan Hoa — Phó Viện trưởng VBT', icon: Layers },
  { group: 'Viện Bê tông (VBT)', email: 'chu.manh.ha234@ibst.gov.vn',     label: 'Chu Mạnh Hà — Kỹ sư / Chuyên viên VBT', icon: User },

  // Phân viện Miền Trung (PVMT)
  { group: 'Phân viện Miền Trung', email: 'nguyen.tien.binh446@ibst.gov.vn', label: 'Nguyễn Tiến Bình — Giám đốc PVMT', icon: Compass },
  { group: 'Phân viện Miền Trung', email: 'mai.xuan.hien447@ibst.gov.vn',    label: 'Mai Xuân Hiễn — Phó Giám đốc PVMT', icon: Compass },
  { group: 'Phân viện Miền Trung', email: 'vu.viet.phuong448@ibst.gov.vn',   label: 'Vũ Việt Phương — Kỹ sư / Chuyên viên PVMT', icon: User },

  // TT Kết cấu thép & XD (TTKCT)
  { group: 'TT Kết cấu thép (TTKCT)', email: 'tran.phuong97@ibst.gov.vn',     label: 'Trần Phương — Trưởng phòng / Giám đốc TTKCT', icon: Wrench },
  { group: 'TT Kết cấu thép (TTKCT)', email: 'o.duy.liem857@ibst.gov.vn',      label: 'Đỗ Duy Liêm — Phó Giám đốc TTKCT', icon: Wrench },
  { group: 'TT Kết cấu thép (TTKCT)', email: 'nguyen.ngoc.huy103@ibst.gov.vn', label: 'Nguyễn Ngọc Huy — Kỹ sư / Chuyên viên TTKCT', icon: User },

  // TT Thiết bị & Thí nghiệm XD (TTTB)
  { group: 'TT Thiết bị (TTTB)', email: 'nguyen.thi.minh.nguyet158@ibst.gov.vn', label: 'Nguyễn Thị Minh Nguyệt — Trưởng phòng TTTB', icon: Wrench },
  { group: 'TT Thiết bị (TTTB)', email: 'pham.van.cuong157@ibst.gov.vn',         label: 'Phạm Văn Cường — Phó Giám đốc TTTB', icon: Wrench },
  { group: 'TT Thiết bị (TTTB)', email: 'pham.uc.hanh735@ibst.gov.vn',           label: 'Phạm Đức Hạnh — Chuyên viên TTTB', icon: User },

  // Công ty CP Đầu tư & TVXD IBST
  { group: 'Công ty CP IBST', email: 'ctcp@ibst.vn',   label: 'Nguyễn Tiến Thành — Giám đốc CTCP', icon: Factory },
  { group: 'Công ty CP IBST', email: 'huy.tq@ibst.vn',  label: 'Trần Quang Huy — Phó Giám đốc CTCP', icon: Factory },
  { group: 'Công ty CP IBST', email: 'nam.lh@ibst.vn',   label: 'Lê Hoàng Nam — Chỉ huy trưởng / Chuyên viên', icon: User },
];
const QUICK_GROUPS = [...new Set(QUICK_ACCOUNTS.map(a => a.group))];

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
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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
          <h1 className="text-4xl xl:text-5xl font-black leading-[1.15] tracking-tight text-ink">
            Quản trị <br />
            <span className="text-primary-600 dark:text-primary-400">
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
            
            <h2 className="text-[13px] font-bold tracking-[0.15em] uppercase text-ink-muted mb-1 flex justify-center w-full">
              Bộ Xây dựng
            </h2>
            <h3 className="text-[17px] sm:text-[19px] font-black tracking-wider uppercase leading-snug flex justify-center w-full text-ink">
              Viện Khoa học Công nghệ Xây dựng
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

            {/* ── Quick Login Dropdown ── */}
            <div className="pt-3" ref={dropdownRef}>
              <span className="text-[10px] font-bold text-ink-muted uppercase tracking-wider block text-center mb-1.5">
                Hoặc chọn tài khoản thử nghiệm nhanh (Mật khẩu: 123456)
              </span>

              {/* Trigger button */}
              <button
                type="button"
                onClick={() => setDropdownOpen(v => !v)}
                className="w-full flex items-center justify-between gap-2 rounded-xl border border-border bg-subtle px-3 py-2.5 text-sm text-ink hover:bg-surface hover:border-primary-400 transition-all"
              >
                <span className="truncate text-ink flex items-center gap-2">
                  {(() => {
                    const acc = QUICK_ACCOUNTS.find(a => a.email === email);
                    if (!acc) return <span className="text-ink-muted">— Chọn tài khoản —</span>;
                    const Icon = acc.icon;
                    return (
                      <>
                        <Icon size={15} className="shrink-0 text-primary-600 dark:text-primary-400" />
                        <span className="truncate">{acc.label}</span>
                      </>
                    );
                  })()}
                </span>
                <ChevronDown size={15} className={`shrink-0 text-ink-muted transition-transform duration-200 ${dropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown panel */}
              {dropdownOpen && (
                <div className="relative z-50 mt-1 w-full rounded-xl border border-border bg-surface shadow-dropdown overflow-hidden">
                  <div className="max-h-64 overflow-y-auto py-1">
                    {QUICK_GROUPS.map(group => (
                      <div key={group}>
                        {/* Group label */}
                        <div className="px-3 pt-2 pb-0.5 text-[10px] font-black uppercase tracking-wider text-ink-muted bg-subtle/60 dark:bg-slate-900/40">
                          {group}
                        </div>
                        {QUICK_ACCOUNTS.filter(a => a.group === group).map(acc => {
                          const Icon = acc.icon;
                          return (
                            <button
                              key={acc.email}
                              type="button"
                              onClick={() => {
                                setEmail(acc.email);
                                setPassword('123456');
                                setDropdownOpen(false);
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-left hover:bg-primary-50 dark:hover:bg-slate-800/50 transition-colors"
                            >
                              <Icon size={15} className="shrink-0 text-primary-600 dark:text-primary-400" />
                              <div className="min-w-0">
                                <div className="text-xs font-semibold text-ink truncate">{acc.label}</div>
                                <div className="text-[10px] text-ink-muted font-mono truncate">{acc.email}</div>
                              </div>
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                  <div className="border-t border-border px-3 py-1.5 text-[10px] text-ink-muted text-center bg-subtle/40 dark:bg-slate-900/20">
                    Nhấn chọn → điền tự động vào form → bấm Đăng nhập
                  </div>
                </div>
              )}
            </div>
          </form>


          <div className="mt-12 text-center text-2xs text-ink-muted">
            Phát triển bởi CIC — dữ liệu phân quyền theo QĐ 942/QĐ-BXD
          </div>
        </div>
      </div>
    </div>
  );
}

