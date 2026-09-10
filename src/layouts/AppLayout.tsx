import { useEffect, useState, useRef } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import { RouteGuard } from '../components/RouteGuard';
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
  CheckSquare,
  Check,
  ZoomIn,
  ZoomOut,
  Globe,
  Gavel,
  Landmark,
  Flag,
  Briefcase,
  HeartHandshake,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { cn } from '../lib/utils';
import { useTheme, PRIMARY_COLORS, type Theme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { getRoutePermission, isPublicRoute } from '../routes/quyenTruyCap';
import type { TaiNguyen } from '../lib/phanQuyen';
import { GlobalSearch } from '../components/GlobalSearch';
import { Notifications } from '../components/Notifications';
import { AiChatbot } from '../components/AiChatbot';
import { OnlineUsersWidget } from '../components/OnlineUsersWidget';
import { SlidePanelProvider } from '../context/SlidePanelContext';
import { SlidePanelStack } from '../components/SlidePanelStack';
import { BanTinTuanTicker } from '../components/BanTinTuanTicker';
import logo from '../assets/logo.png';

const THEME_OPTIONS: { value: Theme; icon: typeof Sun; title: string; activeCls: string }[] = [
  { value: 'light', icon: Sun, title: 'Sáng', activeCls: 'text-primary-600 dark:text-primary-300' },
  { value: 'nature', icon: Leaf, title: 'Bảo vệ mắt', activeCls: 'text-emerald-600 dark:text-emerald-400' },
  { value: 'dark', icon: Moon, title: 'Tối', activeCls: 'text-indigo-500 dark:text-indigo-300' },
];

const DEFAULT_SIDEBAR_WIDTH = 256;
const MIN_SIDEBAR_WIDTH = 200;
const MAX_SIDEBAR_WIDTH = 440;
const COLLAPSED_SIDEBAR_WIDTH = 80;
const COLLAPSE_THRESHOLD = 140;

interface NavSubItem {
  to: string;
  label: string;
  icon: typeof Gavel;
}

interface NavItem {
  id: string;
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  children?: NavSubItem[];
}

const NAV_MENU: NavItem[] = [
  { id: 'dashboard', to: '/', label: '1. Dashboard & Lịch công tác', icon: LayoutDashboard },
  { id: 'nhan-su', to: '/nhan-su', label: '2. Tổ chức & Nhân sự', icon: Users },
  { id: 'dang-vu', to: '/dang-vu', label: '3. Công tác Đảng vụ', icon: Flag },
  { id: 'e-office', to: '/e-office', label: '4. Văn phòng số e-Office', icon: FileText },
  { id: 'pvqlnn', to: '/pvqlnn', label: '5. Nhiệm vụ Phục vụ QLNN', icon: Landmark },
  { id: 'khoa-hoc', to: '/khoa-hoc', label: '6. Nhiệm vụ KHCN, đề tài', icon: FlaskConical },
  { id: 'tu-van-dvkt', to: '/tu-van-dvkt', label: '7. Công tác tư vấn DVKT', icon: Briefcase },
  { id: 'thi-nghiem', to: '/thi-nghiem', label: '8. Công tác thí nghiệm, thử nghiệm', icon: Microscope },
  { id: 'tckt', to: '/tckt', label: '9. Công tác TCKT', icon: Wallet },
  { id: 'cong-doan', to: '/cong-doan', label: '10. Công tác Công đoàn, Đoàn TN', icon: HeartHandshake },
  { id: 'kho-luu-tru', to: '/kho-luu-tru', label: '11. Kho lưu trữ & AI-RAG', icon: FolderOpen },
  { id: 'ibst-portal', to: '/ibst-portal', label: '12. Website', icon: Globe },
];

/**
 * Menu hiện ⇔ vào được bằng link: đọc CHUNG `ROUTE_PERMISSION_MAP` với RouteGuard.
 * Route công khai (Dashboard...) luôn hiện. Route chưa khai báo trong map bị ẩn
 * theo mặc định — khớp nguyên tắc deny-by-default của RouteGuard.
 */
function hienThiMucMenu(to: string, can: (t: TaiNguyen, h: 'xem') => boolean): boolean {
  if (isPublicRoute(to)) return true;
  const entry = getRoutePermission(to);
  if (!entry) return false;
  return entry.taiNguyen.some((tn) => can(tn, 'xem'));
}

export function AppLayout() {
  const { pathname } = useLocation();
  const { theme, setTheme, primaryColor, setPrimaryColor, zoom, setZoom } = useTheme();
  const { session, signOut } = useAuth();
  const { can, dangTai } = usePhanQuyen();

  // Trong lúc đang nạp quyền, hiện đủ menu để tránh nhấp nháy ẩn/hiện — RouteGuard
  // vẫn chặn đúng khi bấm vào một mục chưa có quyền.
  const visibleNavMenu = dangTai ? NAV_MENU : NAV_MENU.filter((item) => hienThiMucMenu(item.to, can));

  // Tự động tìm nhãn menu hiện tại
  let currentLabel = '1. Dashboard & Lịch công tác';
  if (pathname === '/ibst-portal') currentLabel = '12. Website';
  if (pathname === '/lich-co-quan') currentLabel = '1. Dashboard & Lịch công tác';
  if (pathname === '/hop-dong') currentLabel = '7. Công tác tư vấn DVKT';
  if (pathname === '/tai-chinh') currentLabel = '9. Công tác TCKT';
  for (const n of NAV_MENU) {
    if (n.to === pathname) {
      currentLabel = n.label;
      break;
    }
    if (n.children) {
      const sub = n.children.find((c) => c.to === pathname);
      if (sub) {
        currentLabel = `${n.label} → ${sub.label}`;
        break;
      }
    }
  }

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
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia('(min-width: 1024px)').matches);
  const sidebarCollapsed = collapsed && isDesktop;

  // Chiều rộng sidebar tùy biến kéo thả (mặc định 256px, lưu vào localStorage)
  const [sidebarWidth, setSidebarWidth] = useState<number>(() => {
    const saved = Number(localStorage.getItem('sidebar-width'));
    return Number.isFinite(saved) && saved >= MIN_SIDEBAR_WIDTH && saved <= MAX_SIDEBAR_WIDTH
      ? saved
      : DEFAULT_SIDEBAR_WIDTH;
  });
  const [isResizingSidebar, setIsResizingSidebar] = useState(false);
  const sidebarWidthRef = useRef(sidebarWidth);
  sidebarWidthRef.current = sidebarWidth;

  // Lắng nghe sự kiện kéo rê chuột/chạm để thay đổi chiều rộng sidebar mượt mà
  useEffect(() => {
    if (!isResizingSidebar) return;

    const onMove = (e: PointerEvent) => {
      const clientX = e.clientX;
      if (clientX < COLLAPSE_THRESHOLD) {
        setCollapsed(true);
      } else {
        if (collapsed) setCollapsed(false);
        const clamped = Math.min(MAX_SIDEBAR_WIDTH, Math.max(MIN_SIDEBAR_WIDTH, clientX));
        setSidebarWidth(clamped);
      }
    };

    const onUp = () => {
      setIsResizingSidebar(false);
      if (sidebarWidthRef.current) {
        localStorage.setItem('sidebar-width', String(sidebarWidthRef.current));
      }
    };

    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);

    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';

    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
      document.body.style.cursor = prevCursor;
      document.body.style.userSelect = prevSelect;
    };
  }, [isResizingSidebar, collapsed]);

  // Mặc định mở rộng nhóm nếu trang hiện tại nằm trong nhóm đó
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
    const isHopDong = ['/hop-dong', '/tai-chinh', '/dau-thau', '/pvqlnn', '/uy-quyen'].includes(pathname);
    return { 'hop-dong-crm': isHopDong };
  });

  useEffect(() => {
    if (['/hop-dong', '/tai-chinh', '/dau-thau', '/pvqlnn', '/uy-quyen'].includes(pathname)) {
      setExpandedGroups((prev) => ({ ...prev, 'hop-dong-crm': true }));
    }
    setMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const updateViewport = (event: MediaQueryListEvent) => setIsDesktop(event.matches);
    mediaQuery.addEventListener('change', updateViewport);
    return () => mediaQuery.removeEventListener('change', updateViewport);
  }, []);

  const toggleGroup = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedGroups((prev) => ({ ...prev, [id]: !prev[id] }));
  };

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
    <SlidePanelProvider>
    <div className="flex h-full min-w-0 overflow-hidden bg-page">
      {mobileMenuOpen && (
        <button
          type="button"
          aria-label="Đóng trình đơn điều hướng"
          className="fixed inset-0 z-40 bg-black/45 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
      {/* ── Sidebar ── */}
      <aside
        aria-label="Điều hướng chính"
        style={isDesktop ? { width: sidebarCollapsed ? COLLAPSED_SIDEBAR_WIDTH : sidebarWidth } : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 h-full shrink-0 -translate-x-full shadow-xl lg:sticky lg:top-0 lg:z-40 lg:translate-x-0',
          mobileMenuOpen && 'translate-x-0',
          !isResizingSidebar && 'transition-[width,transform] duration-300 ease-out',
        )}
      >
        <div
          className={cn(
            'relative flex h-full w-full flex-col justify-between border-r border-border dark:border-slate-700/80 bg-surface',
            !isDesktop && 'w-[min(86vw,19rem)]',
          )}
        >
          <div className="flex h-full flex-col overflow-hidden">
            {/* Logo & Brand */}
            <div
              className={cn(
                'relative flex h-16 shrink-0 items-center border-b border-border-subtle px-4',
                sidebarCollapsed && 'justify-center px-3',
              )}
            >
              <div className="absolute bottom-0 left-4 right-4 h-px bg-gradient-to-r from-transparent via-border to-transparent" />
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg border border-border bg-surface p-1.5 shadow-card">
                  <img src={logo} alt="IBST Logo" className="h-full w-full object-contain" />
                </div>
                {!sidebarCollapsed && (
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
            <nav className={cn('min-h-0 flex-1 space-y-1 overflow-y-auto p-4', sidebarCollapsed && 'px-2')}>
              {visibleNavMenu.map((item) => {
                const Icon = item.icon;
                const hasChildren = !!item.children && item.children.length > 0;
                const isExpanded = expandedGroups[item.id] ?? false;

                if (hasChildren) {
                  const isParentActive =
                    pathname === item.to || item.children?.some((c) => c.to === pathname);

                  return (
                    <div key={item.id} className="mb-1">
                      <div
                        className={cn(
                          'relative flex w-full items-center justify-between transition-all rounded-lg cursor-pointer px-4 py-2.5 text-[13px] font-bold',
                          isParentActive
                            ? 'border-l-[3px] border-l-primary-600 bg-primary-50 text-primary-700 shadow-card dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                            : 'border-l-[3px] border-l-transparent text-ink-muted hover:bg-muted hover:text-ink',
                          sidebarCollapsed && 'justify-center px-0 w-full',
                        )}
                        onClick={(e) => toggleGroup(item.id, e)}
                      >
                        <NavLink
                          to={item.to}
                          onClick={(e) => {
                            // Mở nhóm nếu đang đóng khi click vào phân hệ cha
                            if (!isExpanded) {
                              setExpandedGroups((prev) => ({ ...prev, [item.id]: true }));
                            }
                          }}
                          className="flex items-center gap-3 min-w-0 flex-1"
                        >
                          <Icon className="h-[18px] w-[18px] shrink-0" />
                          {!sidebarCollapsed && (
                            <span className="truncate">{item.label}</span>
                          )}
                        </NavLink>

                        {!sidebarCollapsed && (
                          <button
                            type="button"
                            onClick={(e) => toggleGroup(item.id, e)}
                            className="p-1 hover:bg-black/5 dark:hover:bg-white/10 rounded transition-colors text-ink-muted shrink-0"
                            title={isExpanded ? 'Ẩn menu con' : 'Hiện menu con'}
                          >
                            {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                          </button>
                        )}
                      </div>

                      {/* Render các menu con khi MỞ RỘNG (Expanded) */}
                      {isExpanded && !sidebarCollapsed && (
                        <div className="ml-4 pl-2 border-l border-border/60 space-y-1 mt-1 transition-all">
                          {item.children?.map((child) => {
                            const SubIcon = child.icon;
                            return (
                              <NavLink
                                key={child.to}
                                to={child.to}
                                className={({ isActive }) =>
                                  cn(
                                    'flex items-center gap-2.5 rounded-lg px-3 py-2 text-[11px] font-semibold transition-all',
                                    isActive
                                      ? 'border-l-2 border-l-primary-500 bg-primary-50/70 text-primary-700 shadow-xs dark:border-l-primary-400 dark:bg-primary-900/20 dark:text-primary-300 font-bold'
                                      : 'border-l-2 border-l-transparent text-ink-muted hover:bg-muted/70 hover:text-ink',
                                  )
                                }
                              >
                                <SubIcon className="h-3.5 w-3.5 shrink-0" />
                                <span className="truncate">{child.label}</span>
                              </NavLink>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                }

                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    title={sidebarCollapsed ? item.label : undefined}
                    className={({ isActive }) =>
                      cn(
                        'relative mb-1 flex w-full items-center transition-all rounded-lg gap-3 text-[13px] font-bold py-2.5 px-4',
                        isActive
                          ? 'border-l-[3px] border-l-primary-600 bg-primary-50 text-primary-700 shadow-card dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                          : 'border-l-[3px] border-l-transparent text-ink-muted hover:bg-muted hover:text-ink',
                        sidebarCollapsed && 'justify-center px-0 ml-0 w-full',
                      )
                    }
                  >
                    <Icon className="h-[18px] w-[18px] shrink-0" />
                    {!sidebarCollapsed && (
                      <span className="flex-1 overflow-hidden whitespace-nowrap">{item.label}</span>
                    )}
                  </NavLink>
                );
              })}
            </nav>
          </div>

          {/* Footer */}
          <div className={cn('space-y-1 border-t border-border-subtle p-4', sidebarCollapsed && 'px-2')}>
            <button
              onClick={() => setCollapsed(!collapsed)}
              className={cn(
                'mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-l-transparent px-4 py-3 text-[13px] font-bold text-ink-muted transition-all hover:bg-muted hover:text-ink',
                sidebarCollapsed && 'justify-center px-0',
              )}
              title={sidebarCollapsed ? 'Mở rộng sidebar' : 'Thu gọn sidebar'}
            >
              {sidebarCollapsed ? (
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
              title={sidebarCollapsed ? 'Cài đặt hệ thống' : undefined}
              className={({ isActive }) =>
                cn(
                  'mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-l-transparent px-4 py-3 text-[13px] font-bold transition-all',
                  isActive
                    ? 'border-l-primary-600 bg-primary-50 text-primary-700 shadow-card dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300'
                    : 'text-ink-muted hover:bg-muted hover:text-ink',
                  sidebarCollapsed && 'justify-center px-0',
                )
              }
            >
              <Settings className="h-[18px] w-[18px]" />
              {!sidebarCollapsed && <span className="flex-1 text-left">Cài đặt hệ thống</span>}
            </NavLink>
            <button
              onClick={() => signOut()}
              className={cn(
                'mb-1 flex w-full items-center gap-3 rounded-lg border-l-[3px] border-l-transparent px-4 py-3 text-[13px] font-bold text-ink-muted transition-all hover:bg-red-50 hover:text-red-600 dark:hover:bg-red-900/20 dark:hover:text-red-400',
                sidebarCollapsed && 'justify-center px-0',
              )}
              title="Đăng xuất"
            >
              <LogOut className="h-[18px] w-[18px]" />
              {!sidebarCollapsed && <span className="flex-1 text-left">Đăng xuất</span>}
            </button>
          </div>
        </div>

        {/* Thanh kéo chỉnh độ rộng Sidebar (Desktop) */}
        {isDesktop && (
          <div
            onPointerDown={(e) => {
              e.preventDefault();
              setIsResizingSidebar(true);
            }}
            onDoubleClick={() => {
              setSidebarWidth(DEFAULT_SIDEBAR_WIDTH);
              localStorage.setItem('sidebar-width', String(DEFAULT_SIDEBAR_WIDTH));
            }}
            title="Kéo sang trái/phải để thay đổi độ rộng thanh điều hướng (Nhấp đúp để đặt lại mặc định)"
            className="group pointer-events-auto absolute -right-2 top-0 bottom-0 z-50 flex w-4 cursor-col-resize items-center justify-center touch-none select-none"
          >
            {/* Đường viền dọc có hiệu ứng sáng khi hover hoặc đang kéo */}
            <div
              className={cn(
                'h-full w-0.5 transition-colors',
                isResizingSidebar
                  ? 'w-1 bg-primary shadow-sm shadow-primary/40'
                  : 'bg-transparent group-hover:w-1 group-hover:bg-primary/70',
              )}
            />

            {/* Viên tay cầm định vị ở giữa mép phải */}
            <div
              className={cn(
                'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-10 w-3 flex-col items-center justify-center gap-0.5 rounded-full border shadow-xs transition-all',
                isResizingSidebar
                  ? 'scale-110 border-primary bg-primary text-white shadow-primary/30 ring-2 ring-primary/30 opacity-100'
                  : 'opacity-0 group-hover:opacity-100 border-border bg-surface text-ink-muted group-hover:scale-105 group-hover:border-primary group-hover:bg-primary-subtle group-hover:text-primary dark:border-slate-700/80 dark:bg-slate-800',
              )}
            >
              <span className={cn('h-0.5 w-0.5 rounded-full transition-colors', isResizingSidebar ? 'bg-white' : 'bg-ink-muted/80 group-hover:bg-primary')} />
              <span className={cn('h-0.5 w-0.5 rounded-full transition-colors', isResizingSidebar ? 'bg-white' : 'bg-ink-muted/80 group-hover:bg-primary')} />
              <span className={cn('h-0.5 w-0.5 rounded-full transition-colors', isResizingSidebar ? 'bg-white' : 'bg-ink-muted/80 group-hover:bg-primary')} />
            </div>
          </div>
        )}
      </aside>

      {/* ── Main ── */}
      <div className="flex min-h-0 min-w-0 flex-1 flex-col">
        {/* Header */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-surface px-4 backdrop-blur-md transition-colors duration-200 lg:px-6">
          {/* Left: Mobile menu + Search */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Đóng trình đơn' : 'Mở trình đơn'}
              aria-expanded={mobileMenuOpen}
              onClick={() => setMobileMenuOpen((open) => !open)}
              className="icon-button mr-1 shrink-0 lg:hidden"
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            {/* Search (Desktop) */}
            <div className="relative hidden w-56 xl:w-64 sm:flex shrink-0">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search className="h-4 w-4 text-ink-muted" />
              </div>
              <button
                onClick={() => setSearchOpen(true)}
                className="block w-full cursor-pointer truncate whitespace-nowrap rounded-xl border border-border bg-subtle py-1.5 pl-9 pr-14 text-left text-xs text-ink-muted shadow-card transition-all hover:bg-muted focus:outline-none"
              >
                Tìm hợp đồng, đề tài...
                <kbd className="absolute right-2 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-surface px-1.5 py-0.5 text-[9px] font-bold text-ink-muted sm:inline-flex">
                  Ctrl+K
                </kbd>
              </button>
            </div>
            {/* Mobile Search Button */}
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Tìm kiếm"
              className="sm:hidden p-2 text-ink-muted hover:bg-muted rounded-lg transition-colors cursor-pointer"
            >
              <Search size={18} />
            </button>
          </div>

          {/* Middle: Bản tin tuần (Weekly News Ticker) */}
          <BanTinTuanTicker />

          {/* Right */}
          <div className="flex shrink-0 items-center justify-end gap-2 sm:gap-3">
            {/* Online users widget */}
            <OnlineUsersWidget />
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            <Notifications />
            <div className="mx-1 hidden h-6 w-px bg-border sm:block" />
            
            {/* User Profile Menu (Dropdown) */}
            <div className="relative">
              <button 
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex cursor-pointer items-center gap-2.5 rounded-xl p-1.5 pr-2 transition-colors hover:bg-muted"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full overflow-hidden ring-2 ring-primary-100 dark:ring-primary-900 shrink-0">
                  {session?.user.email === 'vientruong@ibst.vn' ? (
                    <img
                      src="/avatars/nguyen-hong-hai.jpg"
                      alt="Viện trưởng Nguyễn Hồng Hải"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary-400 to-primary-600 text-xs font-bold text-white">
                      {initials || 'ND'}
                    </div>
                  )}
                </div>
                <div className="hidden max-w-[140px] text-left sm:block">
                  <p className="truncate text-xs font-bold leading-tight text-ink">{fullName}</p>
                  <p className="mt-0.5 truncate text-[10px] font-medium leading-tight text-ink-muted">
                    {session?.user.email}
                  </p>
                </div>
                <ChevronDown size={14} className="hidden text-ink-muted sm:block" />
              </button>

              {userMenuOpen && (
                <>
                  {/* Backdrop to close dropdown */}
                  <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-64 origin-top-right rounded-xl border border-border bg-surface p-4 shadow-dropdown z-50 animate-fade-in text-left">
                    <div className="pb-3 border-b border-border-subtle">
                      <p className="text-xs font-bold text-ink">{fullName}</p>
                      <p className="text-2xs text-ink-muted mt-0.5">{session?.user.email}</p>
                    </div>
                    
                    {/* Cài đặt cá nhân */}
                    <div className="py-3.5 space-y-4 border-b border-border-subtle">
                      <div className="text-[11px] font-bold text-ink-muted uppercase tracking-wider">Cài đặt cá nhân</div>
                      
                      {/* Theme selection */}
                      <div className="space-y-1.5">
                        <div className="text-2xs font-semibold text-ink-secondary">Giao diện nền</div>
                        <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
                          {THEME_OPTIONS.map(({ value, icon: Icon, title, activeCls }) => (
                            <button
                              key={value}
                              onClick={() => setTheme(value)}
                              title={title}
                              className={cn(
                                'flex-1 flex cursor-pointer items-center justify-center rounded-md py-1.5 transition-all text-xs font-semibold',
                                theme === value
                                  ? cn('border border-border bg-surface shadow-card', activeCls)
                                  : 'text-ink-muted hover:text-ink',
                              )}
                            >
                              <Icon size={13} className="mr-1" />
                              {value === 'light' ? 'Sáng' : value === 'nature' ? 'Bảo vệ' : 'Tối'}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Primary Color selection */}
                      <div className="space-y-1.5">
                        <div className="text-2xs font-semibold text-ink-secondary">Màu sắc chủ đạo</div>
                        <div className="grid grid-cols-9 gap-1.5 justify-items-center rounded-lg bg-muted p-2">
                          {PRIMARY_COLORS.map(({ id, name, hex }) => {
                            const active = primaryColor === id;
                            return (
                              <button
                                key={id}
                                type="button"
                                onClick={() => setPrimaryColor(id)}
                                title={name}
                                className={cn(
                                  'grid h-5 w-5 place-items-center rounded-full transition-transform hover:scale-110',
                                  active && 'scale-110 ring-2 ring-offset-2 ring-offset-surface',
                                )}
                                style={{
                                  background: hex,
                                  ...(active
                                    ? { boxShadow: `0 0 0 2px var(--bg-surface), 0 0 0 3.5px ${hex}` }
                                    : {}),
                                }}
                              >
                                {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                              </button>
                            );
                          })}
                        </div>
                        <p className="text-2xs text-ink-muted">
                          Đang chọn:{' '}
                          <span className="font-bold text-ink-secondary">
                            {PRIMARY_COLORS.find((c) => c.id === primaryColor)?.name}
                          </span>
                        </p>
                      </div>

                      {/* Tỷ lệ thu phóng */}
                      <div className="space-y-1.5 pt-1.5 border-t border-border-subtle">
                        <div className="flex justify-between items-center text-2xs font-semibold text-ink-secondary">
                          <span>Cỡ chữ giao diện</span>
                          <span className="font-bold text-primary-500">{zoom}%</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setZoom(Math.max(90, zoom - 10))}
                            disabled={zoom <= 90}
                            title="Giảm cỡ chữ 10%"
                            aria-label="Giảm cỡ chữ"
                            className="icon-button border border-border bg-subtle"
                          >
                            <ZoomOut size={12} />
                          </button>
                          <input
                            type="range"
                            min="90"
                            max="120"
                            step="10"
                            value={zoom}
                            onChange={(e) => setZoom(Number(e.target.value))}
                            className="flex-1 h-1.5 rounded-lg bg-muted appearance-none cursor-pointer accent-[var(--color-primary)] focus:outline-none"
                            style={{
                              background: `linear-gradient(to right, var(--color-primary) 0%, var(--color-primary) ${((zoom - 90) / 30) * 100}%, var(--bg-muted) ${((zoom - 90) / 30) * 100}%, var(--bg-muted) 100%)`
                            }}
                          />
                          <button
                            type="button"
                            onClick={() => setZoom(Math.min(120, zoom + 10))}
                            disabled={zoom >= 120}
                            title="Tăng cỡ chữ 10%"
                            aria-label="Tăng cỡ chữ"
                            className="icon-button border border-border bg-subtle"
                          >
                            <ZoomIn size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Logout */}
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        signOut();
                      }}
                      className="mt-3 flex w-full items-center gap-2 rounded-lg px-2 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 transition-colors"
                    >
                      <LogOut size={14} />
                      Đăng xuất
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
          {/* Breadcrumb */}
          <div className="px-4 pb-1 pt-3 lg:px-6">
            <div className="flex items-center gap-1.5 text-xs font-medium text-ink-muted">
              <span>IBST ERP</span>
              <Crumb size={12} />
              <span className="font-bold text-ink-secondary">{currentLabel}</span>
            </div>
          </div>
          <div className="px-4 pb-8 lg:px-6">
            <div key={pathname} className="animate-fade-in-up">
              <RouteGuard>
                <Outlet />
              </RouteGuard>
            </div>
          </div>
        </main>
      </div>

      <GlobalSearch open={searchOpen} onClose={() => setSearchOpen(false)} />
      <AiChatbot />
      <SlidePanelStack sidebarWidth={isDesktop ? (collapsed ? COLLAPSED_SIDEBAR_WIDTH : sidebarWidth) : 0} />
    </div>
    </SlidePanelProvider>
  );
}
