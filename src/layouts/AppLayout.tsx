import { useEffect, useState } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  FileText,
  FlaskConical,
  Handshake,
  Microscope,
  Wallet,
  Users,
  Network,
  GraduationCap,
  BarChart3,
  Search,
  Building2,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronRight as Crumb,
  Sun,
  Moon,
  Leaf,
  Award,
  FolderOpen,
  Users2,
  Calendar,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme, type Theme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { GlobalSearch } from '../components/GlobalSearch';
import { Notifications } from '../components/Notifications';
import logo from '../assets/logo.png';

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; title: string; activeCls: string }[] = [
  { value: 'light', icon: Sun, title: 'Sáng', activeCls: 'text-primary-600 dark:text-primary-300' },
  { value: 'nature', icon: Leaf, title: 'Bảo vệ mắt', activeCls: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'dark', icon: Moon, title: 'Tối', activeCls: 'text-indigo-500 dark:text-indigo-300' },
];

const NAV = [
  { to: '/', label: 'Tổng quan', icon: LayoutDashboard },
  { to: '/van-ban', label: 'Văn bản - Điều hành', icon: FileText },
  { to: '/lich-co-quan', label: 'Lịch cơ quan', icon: Calendar },
  { to: '/de-tai', label: 'Đề tài KHCN', icon: FlaskConical },
  { to: '/hop-dong', label: 'Hợp đồng dịch vụ', icon: Handshake },
  { to: '/khach-hang', label: 'Khách hàng - Đối tác', icon: Users2 },
  { to: '/so-huu-tri-tue', label: 'Sở hữu trí tuệ', icon: Award },
  { to: '/thi-nghiem', label: 'Thí nghiệm (LIMS)', icon: Microscope },
  { to: '/ho-so-tai-lieu', label: 'Kho hồ sơ tài liệu', icon: FolderOpen },
  { to: '/don-vi', label: 'Đơn vị - Tổ chức', icon: Network },
  { to: '/nhan-su', label: 'Nhân sự', icon: Users },
  { to: '/dao-tao', label: 'Đào tạo - Hội nghị', icon: GraduationCap },
];

export function AppLayout() {
  const { pathname } = useLocation();
  const { theme, setTheme } = useTheme();
  const { session, signOut } = useAuth();
  const current = NAV.find((n) => n.to === pathname) ?? NAV[0];
  const fullName =
    (session?.user.user_metadata?.full_name as string | undefined) ??
    session?.user.email ??
    'Người dùng';
  const initials = fullName
    .split(/\s+/)
    .filter(Boolean)
    .slice(-2)
    .map((w) => w[0]?.toUpperCase())
    .join('');
  const [collapsed, setCollapsed] = useState(
    () => localStorage.getItem('sidebar-collapsed') === 'true',
  );
  const [searchOpen, setSearchOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(collapsed));
  }, [collapsed]);

  // Ctrl/Cmd + K mở tìm kiếm toàn cục
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  return (
    <div className="flex h-screen overflow-hidden bg-page">
      {/* ── Sidebar ── */}
      <aside className="sticky top-0 z-40 h-screen shrink-0 shadow-xl transition-all duration-300 ease-out">
        <div
          className={cn(
            'flex h-full flex-col justify-between border-r border-border bg-surface transition-all duration-300 ease-out',
            collapsed ? 'w-20' : 'w-64',
          )}
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Logo & Brand */}
            <div
              className={cn(
                'relative flex h-16 shrink-0 items-center border-b border-border-subtle px-4',
                collapsed && 'justify-center px-3',
              )}
            >
              <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1 shadow-card">
                  <img src={logo} alt="IBST Logo" className="h-full w-full object-contain" />
                </div>
                {!collapsed && (
                  <div className="flex min-w-0 animate-fade-in flex-col justify-center">
                    <h1 className="w-full bg-gradient-to-r from-blue-700 via-blue-400 to-blue-800 dark:from-blue-400 dark:via-blue-200 dark:to-blue-400 bg-clip-text text-[14px] font-black uppercase leading-tight tracking-wide text-transparent drop-shadow-sm">
                      Bộ Xây dựng
                    </h1>
                    <p className="mt-0.5 text-[8px] font-bold uppercase leading-tight tracking-tight text-ink">
                      Viện Khoa học Công nghệ Xây dựng
                      <br />
                      Hệ thống quản trị tổng thể IBST
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* Navigation */}
            <nav className={cn('min-h-0 flex-1 space-y-1 overflow-y-auto p-4', collapsed && 'px-2')}>
              {NAV.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  end={to === '/'}
                  title={collapsed ? label : undefined}
                  className={({ isActive }) =>
                    cn(
                      'relative mb-1 flex w-full items-center gap-3 rounded-lg px-4 py-3 text-[13px] font-bold transition-all',
                      isActive
                        ? 'border-l-[3px] border-l-primary-600 bg-primary-50 text-primary-700 shadow-card dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                        : 'border-l-[3px] border-l-transparent text-ink-muted hover:bg-muted hover:text-ink',
                      collapsed && 'justify-center px-0',
                    )
                  }
                >
                  <Icon className="h-[18px] w-[18px] shrink-0" />
                  {!collapsed && (
                    <span className="flex-1 overflow-hidden whitespace-nowrap">{label}</span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Footer */}
          <div className={cn('space-y-1 border-t border-border-subtle p-4', collapsed && 'px-2')}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-l-transparent px-4 py-3 text-[13px] font-bold text-ink-muted transition-all hover:bg-muted hover:text-ink',
                collapsed && 'justify-center px-0',
              )}
              title={collapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {collapsed ? (
                <ChevronRight className="h-[18px] w-[18px]" />
              ) : (
                <>
                  <ChevronLeft className="h-[18px] w-[18px]" />
                  <span className="flex-1 text-left">Thu gọn</span>
                </>
              )}
            </button>
            <NavLink
              to="/cai-dat"
              title={collapsed ? 'Cài đặt hệ thống' : undefined}
              className={({ isActive }) =>
                cn(
                  'mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-l-transparent px-4 py-3 text-[13px] font-bold transition-all',
                  isActive
                    ? 'border-l-primary-600 bg-primary-50 text-primary-700 shadow-card dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-ink-muted hover:bg-muted hover:text-ink',
                  collapsed && 'justify-center px-0',
                )
              }
            >
              <Settings className="h-[18px] w-[18px]" />
              {!collapsed && <span className="flex-1 text-left">Cài đặt hệ thống</span>}
            </NavLink>
            <button
              onClick={() => signOut()}
              className={cn(
                'mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-l-transparent px-4 py-3 text-[13px] font-bold text-ink-muted transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400',
                collapsed && 'justify-center px-0',
              )}
              title="Đăng xuất"
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!collapsed && <span className="flex-1 text-left">Đăng xuất</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 backdrop-blur-md transition-colors duration-200 lg:px-6">
          {/* Search */}
          <div className="relative flex max-w-md flex-1">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-4 w-4 text-ink-muted" />
            </div>
            <button
              onClick={() => setSearchOpen(true)}
              className="block w-full cursor-pointer truncate whitespace-nowrap rounded-xl border border-border bg-subtle py-2 pl-10 pr-16 text-left text-sm text-ink-muted shadow-card transition-all hover:bg-muted focus:outline-none"
            >
              Tìm hợp đồng, phiếu thử, đề tài...
              <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] font-bold text-ink-muted sm:inline-flex">
                Ctrl+K
              </kbd>
            </button>
          </div>

          {/* Right */}
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            {/* Theme switcher — Sáng / Bảo vệ mắt / Tối */}
            <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
              {THEME_OPTIONS.map(({ value, icon: Icon, title, activeCls }) => (
                <button
                  key={value}
                  onClick={() => setTheme(value)}
                  title={title}
                  className={cn(
                    'flex cursor-pointer items-center justify-center rounded-md p-2 transition-all',
                    theme === value
                      ? cn('border border-border bg-surface shadow-card', activeCls)
                      : 'text-ink-muted hover:text-ink',
                  )}
                >
                  <Icon size={16} />
                </button>
              ))}
            </div>
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <Notifications />
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <button className="flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 pr-2 transition-colors hover:bg-muted">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white ring-2 ring-primary-100 dark:ring-primary-900">
                {initials || 'ND'}
              </div>
              <div className="hidden max-w-[140px] text-left sm:block">
                <p className="truncate text-xs font-bold leading-tight text-ink">{fullName}</p>
                <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-ink-muted">
                  {session?.user.email}
                </p>
              </div>
              <ChevronDown size={14} className="hidden text-ink-muted sm:block" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Breadcrumb */}
          <div className="px-4 pb-2 pt-6 lg:px-6">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <span>IBST ERP</span>
              <Crumb size={12} />
              <span className="font-bold text-ink-secondary">{current.label}</span>
            </div>
          </div>
          <div className="px-4 pb-8 lg:px-6">
            <div key={pathname} className="animate-fade-in-up">
              <Outlet />
            </div>
          </div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
    </div>
  );
}
