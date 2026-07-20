import { useMemo, useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Trash2,
  Pencil,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Users,
  Search,
  Monitor,
  LayoutGrid,
  List,
  Check,
  CalendarRange,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { cn } from '../lib/utils';

interface LichCongTac {
  id: string;
  ngay: string; // YYYY-MM-DD
  thu: string; // Thứ Hai, Thứ Ba...
  gio: string; // HH:MM
  noiDung: string;
  thanhPhan: string;
  chuTri: string;
  diaDiem: string; // Phòng họp số 1, Online...
  loai: 'Lich-tuan' | 'Lich-BGĐ' | 'Phong-hop';
  trangThai: 'Cho-duyet' | 'Da-duyet';
}

const INITIAL_LICH: LichCongTac[] = [
  { id: '1', ngay: '2026-07-20', thu: 'Thứ Hai', gio: '08:30', noiDung: 'Giao ban Ban Giám đốc Viện tuần 30', thanhPhan: 'Ban Giám đốc, Trưởng các đơn vị trực thuộc', chuTri: 'Viện trưởng Nguyễn Xuân Khang', diaDiem: 'Phòng hội thảo tầng 2', loai: 'Lich-BGĐ', trangThai: 'Da-duyet' },
  { id: '2', ngay: '2026-07-20', thu: 'Thứ Hai', gio: '14:00', noiDung: 'Họp rà soát tiến độ biên soạn QCVN 04:2026/BXD', thanhPhan: 'Phòng QLKH, Ban biên soạn TCVN', chuTri: 'Phó Viện trưởng Trần Việt Hùng', diaDiem: 'Phòng họp số 102', loai: 'Lich-tuan', trangThai: 'Da-duyet' },
  { id: '3', ngay: '2026-07-21', thu: 'Thứ Ba', gio: '09:00', noiDung: 'Làm việc với đoàn chuyên gia JICA về thiết bị ống khí động', thanhPhan: 'Phòng TN Gió, Phòng Hợp tác Quốc tế', chuTri: 'Viện trưởng Nguyễn Xuân Khang', diaDiem: 'Phòng tiếp khách quốc tế tầng 3', loai: 'Lich-BGĐ', trangThai: 'Da-duyet' },
  { id: '4', ngay: '2026-07-22', thu: 'Thứ Tư', gio: '10:00', noiDung: 'Đăng ký phòng họp: Bảo vệ đề cương luận án NCS Nguyễn Văn B', thanhPhan: 'Hội đồng chấm luận án, NCS', chuTri: 'GS.TS. Hoàng Tùng', diaDiem: 'Phòng họp số 1 (Tầng 1)', loai: 'Phong-hop', trangThai: 'Cho-duyet' },
  { id: '5', ngay: '2026-07-23', thu: 'Thứ Năm', gio: '14:30', noiDung: 'Nghiệm thu thực tế kết cấu hầm ngầm Metro Line 3', thanhPhan: 'Đoàn công tác Phân viện chuyên ngành Kết cấu', chuTri: 'Phó Viện trưởng Lê Minh Long', diaDiem: 'Công trường Ga ngầm S9, Hà Nội', loai: 'Lich-tuan', trangThai: 'Da-duyet' },
  { id: '6', ngay: '2026-07-06', thu: 'Thứ Hai', gio: '08:30', noiDung: 'Giao ban Ban Giám đốc Viện tuần 28', thanhPhan: 'Ban Giám đốc, Trưởng các đơn vị', chuTri: 'Viện trưởng Nguyễn Xuân Khang', diaDiem: 'Phòng hội thảo tầng 2', loai: 'Lich-BGĐ', trangThai: 'Da-duyet' },
  { id: '7', ngay: '2026-07-15', thu: 'Thứ Tư', gio: '09:00', noiDung: 'Họp kiểm điểm dự án nâng cấp năng lực phòng LAS-XD 18', thanhPhan: 'Ban QLDA, Phòng LIMS', chuTri: 'Phó Viện trưởng Trần Việt Hùng', diaDiem: 'Phòng họp số 102', loai: 'Lich-tuan', trangThai: 'Da-duyet' },
  { id: '8', ngay: '2026-07-15', thu: 'Thứ Tư', gio: '14:00', noiDung: 'Làm việc với kiểm toán nhà nước về chuyên đề đầu tư công nghệ', thanhPhan: 'Phòng KHTC, Ban Giám đốc', chuTri: 'Viện trưởng Nguyễn Xuân Khang', diaDiem: 'Phòng họp số 402 - Nhà điều hành', loai: 'Lich-BGĐ', trangThai: 'Da-duyet' }
];

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const MONTHS = [
  'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
  'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

export function LichCoQuanPage() {
  const [list, setList] = useState<LichCongTac[]>(INITIAL_LICH);
  
  // View mode: 'month' | 'week' | 'day' | 'agenda' | 'manage' | 'lobby'
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda' | 'manage' | 'lobby'>('month');
  
  // Date states
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 6, 20)); // Mặc định vào tháng 07/2026 cho khớp dữ liệu demo
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Filter states
  const [filterType, setFilterType] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LichCongTac | null>(null);
  const [detailItem, setDetailItem] = useState<LichCongTac | null>(null);

  // Form states
  const [form, setForm] = useState<Omit<LichCongTac, 'id' | 'trangThai'>>({
    ngay: '',
    thu: 'Thứ Hai',
    gio: '',
    noiDung: '',
    thanhPhan: '',
    chuTri: '',
    diaDiem: '',
    loai: 'Lich-tuan',
  });

  // Clock for Lobby mode
  const [lobbyTime, setLobbyTime] = useState<Date>(new Date());
  useEffect(() => {
    let interval: any;
    if (view === 'lobby') {
      interval = setInterval(() => setLobbyTime(new Date()), 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const el = document.getElementById('lobby-tv-container');
      if (el) {
        if (el.requestFullscreen) {
          el.requestFullscreen();
        }
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // Statistics
  const countWeek = list.filter((x) => x.loai !== 'Phong-hop' && x.trangThai === 'Da-duyet').length;
  const countPendingRooms = list.filter((x) => x.loai === 'Phong-hop' && x.trangThai === 'Cho-duyet').length;
  const countBgd = list.filter((x) => x.loai === 'Lich-BGĐ').length;

  // --- CALENDAR GENERATION LOGIC ---
  
  const calendarCells = useMemo(() => {
    const startOfMonthDate = new Date(currentYear, currentMonth, 1);
    const endOfMonthDate = new Date(currentYear, currentMonth + 1, 0);

    let startDayOfWeek = startOfMonthDate.getDay(); 
    // Convert Sunday = 0 to 7, so Monday is 1, Sunday is 7
    if (startDayOfWeek === 0) startDayOfWeek = 7;

    const prevMonthEndDate = new Date(currentYear, currentMonth, 0);
    const totalDaysInPrevMonth = prevMonthEndDate.getDate();

    // Number of cells from previous month in first week
    const prevMonthCellsCount = startDayOfWeek - 1;
    const cells = [];

    // Prev month days
    for (let i = prevMonthCellsCount - 1; i >= 0; i--) {
      const day = totalDaysInPrevMonth - i;
      cells.push({
        date: new Date(currentYear, currentMonth - 1, day),
        isCurrentMonth: false,
        dayNumber: day,
      });
    }

    // Current month days
    const totalDaysInCurrentMonth = endOfMonthDate.getDate();
    for (let i = 1; i <= totalDaysInCurrentMonth; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // Next month days to fill to 42 cells (6 rows) or 35 (5 rows)
    const totalCells = cells.length <= 35 ? 35 : 42;
    const nextMonthCellsCount = totalCells - cells.length;
    for (let i = 1; i <= nextMonthCellsCount; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  // Navigate handlers
  const handlePrev = () => {
    if (view === 'month') {
      setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (view === 'week') {
      setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setSelectedDate(new Date(selectedDate.getTime() - 1 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (view === 'week') {
      setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setSelectedDate(new Date(selectedDate.getTime() + 1 * 24 * 60 * 60 * 1000));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date());
  };

  // Filtered lists
  const filteredEvents = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        item.noiDung.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chuTri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.diaDiem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.thanhPhan.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesType = !filterType || item.loai === filterType;
      
      const matchesRoom = !filterRoom || 
        (filterRoom === 'khac' 
          ? !item.diaDiem.toLowerCase().includes('phòng họp') && !item.diaDiem.toLowerCase().includes('hội trường')
          : item.diaDiem.toLowerCase().includes(filterRoom.toLowerCase()));

      return matchesSearch && matchesType && matchesRoom;
    });
  }, [list, searchQuery, filterType, filterRoom]);

  // Helper: check if two dates are same day
  const isSameDayCheck = (date1Str: string, date2: Date) => {
    const d1 = new Date(date1Str);
    return (
      d1.getDate() === date2.getDate() &&
      d1.getMonth() === date2.getMonth() &&
      d1.getFullYear() === date2.getFullYear()
    );
  };

  // Lobby display events (today's events only)
  const lobbyEvents = useMemo(() => {
    const today = new Date();
    return list
      .filter((e) => isSameDayCheck(e.ngay, today))
      .sort((a, b) => a.gio.localeCompare(b.gio));
  }, [list]);

  // CRUD Handlers
  const handleOpenCreate = (prefilledDate?: Date) => {
    setEditingItem(null);
    const dateStr = prefilledDate 
      ? prefilledDate.toISOString().slice(0, 10) 
      : new Date().toISOString().slice(0, 10);

    setForm({
      ngay: dateStr,
      thu: 'Thứ Hai',
      gio: '08:30',
      noiDung: '',
      thanhPhan: '',
      chuTri: '',
      diaDiem: '',
      loai: 'Lich-tuan',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LichCongTac) => {
    setDetailItem(null); // Close detail panel
    setEditingItem(item);
    setForm({
      ngay: item.ngay,
      thu: item.thu,
      gio: item.gio,
      noiDung: item.noiDung,
      thanhPhan: item.thanhPhan,
      chuTri: item.chuTri,
      diaDiem: item.diaDiem,
      loai: item.loai,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) return;
    setList(list.filter((x) => x.id !== id));
    setDetailItem(null);
  };

  const handleApprove = (id: string) => {
    setList(list.map((x) => x.id === id ? { ...x, trangThai: 'Da-duyet' } : x));
    if (detailItem && detailItem.id === id) {
      setDetailItem({ ...detailItem, trangThai: 'Da-duyet' });
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(form.ngay);
    const thu = days[d.getDay()];

    if (editingItem) {
      setList(list.map((x) => (x.id === editingItem.id ? { ...x, ...form, thu } : x)));
    } else {
      const newItem: LichCongTac = {
        id: String(Date.now()),
        trangThai: form.loai === 'Phong-hop' ? 'Cho-duyet' : 'Da-duyet',
        ...form,
        thu,
      };
      setList([...list, newItem]);
    }
    setModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Lịch công tác cơ quan"
        subtitle="Hệ thống điều phối lịch làm việc của Ban Giám đốc Viện, quản lý lịch tuần cơ quan và đăng ký đặt lịch phòng họp trực tuyến"
        actions={
          <button className="btn-primary flex items-center gap-1.5" onClick={() => handleOpenCreate()}>
            <Plus size={16} /> Đăng ký lịch mới
          </button>
        }
      />

      {/* KPI Stats cards */}
      {view !== 'lobby' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <KpiCard icon={CalendarDays} label="Lịch công tác tuần cơ quan" value={String(countWeek)} tone="primary" />
          <KpiCard icon={Clock} label="Yêu cầu đặt phòng chờ duyệt" value={String(countPendingRooms)} tone="warning" />
          <KpiCard icon={Users} label="Lịch họp Ban Giám đốc Viện" value={String(countBgd)} tone="success" />
        </div>
      )}

      {/* Main Calendar View Wrapper */}
      <div className={cn("card overflow-hidden border border-border flex flex-col", view === 'lobby' && 'bg-slate-950 text-white border-slate-900')}>
        
        {/* --- CALENDAR TOOLBAR --- */}
        {view !== 'lobby' && (
          <div className="p-4 border-b border-border bg-subtle/50 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            {/* Left Controls: Nav, Month title, Filters */}
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1 bg-surface border border-border rounded-lg p-1.5 shadow-sm">
                <button onClick={handleToday} className="px-3 py-1 text-2xs font-bold text-ink-secondary hover:text-ink hover:bg-muted rounded transition-colors cursor-pointer">
                  Hôm nay
                </button>
                <div className="h-4 w-px bg-border mx-1" />
                <button onClick={handlePrev} className="p-1 hover:bg-muted rounded text-ink-secondary hover:text-ink cursor-pointer">
                  <ChevronLeft size={14} />
                </button>
                <button onClick={handleNext} className="p-1 hover:bg-muted rounded text-ink-secondary hover:text-ink cursor-pointer">
                  <ChevronRight size={14} />
                </button>
              </div>

              <h2 className="text-sm font-black text-ink min-w-[120px] text-left">
                {view === 'month' && `${MONTHS[currentMonth]} ${currentYear}`}
                {view === 'week' && `Tuần ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}`}
                {view === 'day' && `Ngày ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${selectedDate.getFullYear()}`}
                {(view === 'agenda' || view === 'manage') && 'Danh sách lịch cơ quan'}
              </h2>

              {/* Event Type Filter */}
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="p-1.5 text-2xs rounded-lg border border-border bg-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                <option value="">Tất cả loại sự kiện</option>
                <option value="Lich-tuan">Lịch Tuần Viện</option>
                <option value="Lich-BGĐ">Lịch Ban Giám đốc</option>
                <option value="Phong-hop">Phòng họp</option>
              </select>

              {/* Room Filter */}
              <select
                value={filterRoom}
                onChange={(e) => setFilterRoom(e.target.value)}
                className="p-1.5 text-2xs rounded-lg border border-border bg-surface font-semibold focus:outline-none focus:ring-1 focus:ring-primary shadow-sm"
              >
                <option value="">Tất cả phòng họp</option>
                <option value="Phòng họp số 1">Phòng họp số 1</option>
                <option value="Phòng họp số 102">Phòng họp số 102</option>
                <option value="Phòng hội thảo tầng 2">Phòng hội thảo tầng 2</option>
                <option value="Phòng tiếp khách">Phòng tiếp khách</option>
                <option value="khac">Địa điểm khác / Công trường</option>
              </select>

              {/* Search quick */}
              <div className="relative w-48">
                <input
                  type="text"
                  placeholder="Tìm nội dung, chủ trì..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-1.5 pl-7 pr-3 text-2xs rounded-lg border border-border bg-surface focus:outline-none focus:ring-1 focus:ring-primary font-semibold shadow-sm"
                />
                <Search className="absolute left-2.5 top-2.5 text-ink-muted" size={11} />
              </div>

              {(filterType || filterRoom || searchQuery) && (
                <button
                  onClick={() => { setFilterType(''); setFilterRoom(''); setSearchQuery(''); }}
                  title="Xóa bộ lọc"
                  className="p-1.5 bg-red-50 text-danger hover:bg-red-100 rounded-lg transition-colors cursor-pointer"
                >
                  <FilterX size={14} />
                </button>
              )}
            </div>

            {/* Right Controls: View Switcher */}
            <div className="flex items-center gap-1 bg-muted p-1 rounded-lg border border-border">
              {[
                { id: 'month', label: 'Tháng', icon: LayoutGrid },
                { id: 'week', label: 'Tuần', icon: CalendarRange },
                { id: 'day', label: 'Ngày', icon: CalendarIcon },
                { id: 'agenda', label: 'Lịch trình', icon: List },
                { id: 'manage', label: 'Quản lý', icon: Pencil },
                { id: 'lobby', label: 'Tivi sảnh', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setView(t.id as any)}
                  className={cn(
                    "px-3 py-1.5 text-2xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer",
                    view === t.id
                      ? "bg-surface text-primary shadow-sm border border-border-subtle"
                      : "text-ink-secondary hover:text-ink hover:bg-surface/50"
                  )}
                >
                  <t.icon size={11} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* --- VIEW 1: MONTHLY CALENDAR GRID --- */}
        {view === 'month' && (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[768px] grid grid-cols-7 border-b border-border bg-muted/30">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={idx} className="py-2.5 text-center text-3xs font-black text-ink-secondary tracking-wider border-r border-border-subtle last:border-r-0">
                  {day.toUpperCase()}
                </div>
              ))}
            </div>
            
            <div className="min-w-[768px] grid grid-cols-7 grid-rows-5 border-t border-l border-border bg-surface">
              {calendarCells.map((cell, idx) => {
                const isToday = isSameDayCheck(cell.date.toISOString().slice(0, 10), new Date());
                const cellDateStr = cell.date.toISOString().slice(0, 10);
                
                // Get events for this specific cell date
                const dayEvents = filteredEvents.filter((item) => item.ngay === cellDateStr);

                return (
                  <div
                    key={idx}
                    className={cn(
                      "min-h-[110px] p-2 border-r border-b border-border flex flex-col group relative transition-all",
                      !cell.isCurrentMonth ? "bg-muted/10 text-ink-muted/50" : "text-ink-secondary",
                      isToday && "bg-primary-50/20 ring-1 ring-primary/20"
                    )}
                  >
                    {/* Header cell: Day number & Add action */}
                    <div className="flex justify-between items-center mb-1">
                      <span className={cn(
                        "text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full font-mono",
                        isToday && "bg-primary text-white font-black"
                      )}>
                        {cell.dayNumber}
                      </span>
                      <button
                        onClick={() => handleOpenCreate(cell.date)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded-md transition-all cursor-pointer"
                        title="Đăng ký lịch ngày này"
                      >
                        <Plus size={10} />
                      </button>
                    </div>

                    {/* Events list inside cell */}
                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] scrollbar-none">
                      {dayEvents.slice(0, 3).map((item) => (
                        <div
                          key={item.id}
                          onClick={() => setDetailItem(item)}
                          className={cn(
                            "px-1.5 py-0.5 text-[10px] font-bold rounded border-l-2 text-left truncate cursor-pointer transition-all active:scale-95 shadow-2xs",
                            item.loai === 'Lich-BGĐ' && 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500 hover:bg-indigo-500/20',
                            item.loai === 'Lich-tuan' && 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500 hover:bg-amber-500/20',
                            item.loai === 'Phong-hop' && 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500 hover:bg-emerald-500/20'
                          )}
                        >
                          <span className="font-mono text-[9px] mr-0.5">{item.gio}</span>
                          {item.noiDung}
                        </div>
                      ))}
                      {dayEvents.length > 3 && (
                        <button
                          onClick={() => { setSelectedDate(cell.date); setView('day'); }}
                          className="w-full text-center text-3xs font-black text-primary-500 hover:text-primary-600 block mt-1 hover:underline"
                        >
                          + {dayEvents.length - 3} lịch khác
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW 2: WEEKLY VIEW --- */}
        {view === 'week' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                // Calculate date for this day of the selected week (Mon to Sun)
                const currentDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
                const diff = (idx + 1) - currentDayOfWeek;
                const thisDate = new Date(selectedDate.getTime() + diff * 24 * 60 * 60 * 1000);
                const thisDateStr = thisDate.toISOString().slice(0, 10);
                const dayEvents = filteredEvents.filter((item) => item.ngay === thisDateStr);
                const isToday = isSameDayCheck(thisDateStr, new Date());

                return (
                  <div
                    key={idx}
                    className={cn(
                      "bg-subtle/40 border border-border rounded-xl p-3 min-h-[300px] flex flex-col text-left",
                      isToday && "bg-primary-50/10 border-primary"
                    )}
                  >
                    <div className="flex justify-between items-center border-b border-border-subtle pb-2 mb-3">
                      <div>
                        <p className="text-3xs font-black text-ink-muted uppercase tracking-wider">{dayName}</p>
                        <p className="text-2xs font-bold text-ink-secondary mt-0.5">{thisDate.getDate()}/{thisDate.getMonth() + 1}</p>
                      </div>
                      <button
                        onClick={() => handleOpenCreate(thisDate)}
                        className="p-1 hover:bg-muted rounded text-primary transition-all cursor-pointer"
                      >
                        <Plus size={12} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-2 overflow-y-auto">
                      {dayEvents.length === 0 ? (
                        <p className="text-center text-3xs text-ink-muted py-8 font-medium">Không có lịch</p>
                      ) : (
                        dayEvents.map((item) => (
                          <div
                            key={item.id}
                            onClick={() => setDetailItem(item)}
                            className={cn(
                              "p-2 rounded-lg border-l-2 text-3xs font-semibold text-left space-y-1 cursor-pointer hover:shadow-2xs transition-all active:scale-95",
                              item.loai === 'Lich-BGĐ' && 'bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-700 dark:text-indigo-300 border-indigo-500',
                              item.loai === 'Lich-tuan' && 'bg-amber-500/10 dark:bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500',
                              item.loai === 'Phong-hop' && 'bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-500'
                            )}
                          >
                            <div className="flex justify-between items-center text-4xs text-ink-muted">
                              <span className="flex items-center gap-0.5"><Clock size={9} /> {item.gio}</span>
                              <span className="font-mono">{item.diaDiem}</span>
                            </div>
                            <p className="text-ink font-bold line-clamp-2">{item.noiDung}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- VIEW 3: DAY VIEW --- */}
        {view === 'day' && (
          <div className="p-5 text-left space-y-4">
            <div className="pb-3 border-b border-border flex justify-between items-center">
              <div>
                <h3 className="font-black text-ink text-sm">Lịch công tác trong ngày</h3>
                <p className="text-2xs text-ink-muted mt-0.5">Ngày {selectedDate.getDate()} tháng {selectedDate.getMonth() + 1} năm {selectedDate.getFullYear()}</p>
              </div>
              <button onClick={() => handleOpenCreate(selectedDate)} className="btn bg-primary text-white text-2xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer">
                <Plus size={13} /> Thêm lịch cho ngày
              </button>
            </div>

            {/* List for the selected day */}
            <div className="space-y-3.5">
              {filteredEvents.filter(x => isSameDayCheck(x.ngay, selectedDate)).length === 0 ? (
                <div className="py-12 text-center text-2xs font-medium text-ink-muted">
                  Không có lịch làm việc nào được lên lịch cho ngày này.
                </div>
              ) : (
                filteredEvents
                  .filter(x => isSameDayCheck(x.ngay, selectedDate))
                  .sort((a, b) => a.gio.localeCompare(b.gio))
                  .map((item) => (
                    <div
                      key={item.id}
                      onClick={() => setDetailItem(item)}
                      className={cn(
                        "p-4 rounded-xl border border-border-subtle hover:border-primary border-l-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-2xs transition-all",
                        item.loai === 'Lich-BGĐ' && 'border-l-indigo-500 bg-indigo-500/5',
                        item.loai === 'Lich-tuan' && 'border-l-amber-500 bg-amber-500/5',
                        item.loai === 'Phong-hop' && 'border-l-emerald-500 bg-emerald-500/5'
                      )}
                    >
                      <div className="space-y-1.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="flex items-center gap-1.5 text-2xs font-black text-primary-500">
                            <Clock size={13} /> {item.gio}
                          </span>
                          <span className={cn(
                            "px-2 py-0.5 text-4xs font-black uppercase rounded",
                            item.loai === 'Lich-BGĐ' && "bg-indigo-500/10 text-indigo-700",
                            item.loai === 'Lich-tuan' && "bg-amber-500/10 text-amber-700",
                            item.loai === 'Phong-hop' && "bg-emerald-500/10 text-emerald-700"
                          )}>
                            {item.loai === 'Lich-BGĐ' ? 'Họp BGĐ' : item.loai === 'Lich-tuan' ? 'Lịch Tuần Viện' : 'Đặt phòng'}
                          </span>
                        </div>
                        <h4 className="font-bold text-ink text-2xs">{item.noiDung}</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-3xs text-ink-muted font-semibold pt-1">
                          <p className="flex items-center gap-1"><User size={12} /> Chủ trì: {item.chuTri}</p>
                          <p className="flex items-center gap-1"><MapPin size={12} /> Địa điểm: {item.diaDiem}</p>
                          <p className="flex items-center gap-1"><Users size={12} /> Thành phần: {item.thanhPhan}</p>
                        </div>
                      </div>
                      <ChevronRight className="text-ink-muted hidden sm:block" size={16} />
                    </div>
                  ))
              )}
            </div>
          </div>
        )}

        {/* --- VIEW 4: AGENDA / LỊCH TRÌNH LIST VIEW --- */}
        {view === 'agenda' && (
          <div className="p-4 text-left space-y-4">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-ink-muted py-6">Không có dữ liệu lịch làm việc phù hợp.</p>
            ) : (
              filteredEvents
                .sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio))
                .map((item) => (
                  <div key={item.id} className="flex flex-col md:flex-row md:items-start gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0 animate-fade-in">
                    {/* Date Column */}
                    <div className="w-full md:w-36 shrink-0 bg-subtle p-3 rounded-lg border border-border flex flex-col items-center justify-center">
                      <span className="text-sm font-bold text-ink-secondary">{item.thu}</span>
                      <span className="text-xs text-ink-muted font-mono">{item.ngay}</span>
                      <span className="mt-2 text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary flex items-center gap-1">
                        <Clock size={11} /> {item.gio}
                      </span>
                    </div>

                    {/* Details Column */}
                    <div className="flex-1 space-y-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="text-2xs font-bold text-ink hover:text-primary cursor-pointer" onClick={() => setDetailItem(item)}>{item.noiDung}</h4>
                        <span className={cn(
                          'text-[10px] font-black px-1.5 py-0.5 rounded',
                          item.loai === 'Lich-BGĐ' && 'bg-success/15 text-success',
                          item.loai === 'Lich-tuan' && 'bg-primary/15 text-primary',
                          item.loai === 'Phong-hop' && 'bg-warning/15 text-warning'
                        )}>
                          {item.loai === 'Lich-BGĐ' && 'Lịch Ban Giám đốc'}
                          {item.loai === 'Lich-tuan' && 'Lịch Tuần Viện'}
                          {item.loai === 'Phong-hop' && 'Đặt phòng họp'}
                        </span>
                        {item.loai === 'Phong-hop' && (
                          <span className={cn(
                            'text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1',
                            item.trangThai === 'Da-duyet' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                          )}>
                            {item.trangThai === 'Da-duyet' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                            {item.trangThai === 'Da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        )}
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-3xs text-ink-muted font-semibold">
                        <p className="flex items-center gap-1"><User size={12} /> <strong className="text-ink-secondary font-bold">Chủ trì:</strong> {item.chuTri}</p>
                        <p className="flex items-center gap-1"><MapPin size={12} /> <strong className="text-ink-secondary font-bold">Địa điểm:</strong> {item.diaDiem}</p>
                        <p className="flex items-center gap-1"><Users size={12} /> <strong className="text-ink-secondary font-bold">Thành phần:</strong> {item.thanhPhan}</p>
                      </div>
                    </div>

                    {/* Quick view button */}
                    <button onClick={() => setDetailItem(item)} className="btn border border-border hover:bg-muted text-ink-secondary font-bold text-3xs px-2.5 py-1 rounded-lg self-center cursor-pointer">
                      Chi tiết
                    </button>
                  </div>
                ))
            )}
          </div>
        )}

        {/* --- VIEW 5: MANAGE / QUẢN LÝ BOARD VIEW --- */}
        {view === 'manage' && (
          <div className="p-4 text-left">
            <div className="overflow-x-auto rounded-xl border border-border">
              <table className="w-full text-2xs font-semibold">
                <thead>
                  <tr className="bg-subtle text-ink border-b border-border">
                    <th className="py-2.5 px-4 text-left font-bold w-24">Thời gian</th>
                    <th className="py-2.5 px-4 text-left font-bold w-48">Phân loại</th>
                    <th className="py-2.5 px-4 text-left font-bold">Nội dung công tác / họp</th>
                    <th className="py-2.5 px-4 text-left font-bold w-36">Chủ trì</th>
                    <th className="py-2.5 px-4 text-left font-bold w-36">Địa điểm</th>
                    <th className="py-2.5 px-4 text-center font-bold w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border bg-surface">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-ink-muted font-medium">Không tìm thấy lịch nào phù hợp.</td>
                    </tr>
                  ) : (
                    filteredEvents
                      .sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio))
                      .map((item) => (
                        <tr key={item.id} className="hover:bg-muted/40 transition-colors">
                          <td className="py-3 px-4 font-mono">
                            <p className="font-bold text-ink-primary">{item.ngay}</p>
                            <p className="text-3xs text-primary-500 font-bold">{item.gio}</p>
                          </td>
                          <td className="py-3 px-4">
                            <span className={cn(
                              "inline-block px-2 py-0.5 rounded text-3xs font-black uppercase",
                              item.loai === 'Lich-BGĐ' && "bg-indigo-500/10 text-indigo-700",
                              item.loai === 'Lich-tuan' && "bg-amber-500/10 text-amber-700",
                              item.loai === 'Phong-hop' && "bg-emerald-500/10 text-emerald-700"
                            )}>
                              {item.loai === 'Lich-BGĐ' ? 'Lịch Họp BGĐ' : item.loai === 'Lich-tuan' ? 'Lịch Tuần Viện' : 'Đặt phòng'}
                            </span>
                          </td>
                          <td className="py-3 px-4 max-w-sm">
                            <p className="font-bold text-ink line-clamp-2">{item.noiDung}</p>
                            <p className="text-3xs text-ink-muted mt-0.5 truncate">Thành phần: {item.thanhPhan}</p>
                          </td>
                          <td className="py-3 px-4 text-ink-secondary">{item.chuTri}</td>
                          <td className="py-3 px-4 text-ink-secondary">{item.diaDiem}</td>
                          <td className="py-3 px-4 text-center">
                            <div className="flex items-center justify-center gap-1.5">
                              {item.loai === 'Phong-hop' && item.trangThai === 'Cho-duyet' && (
                                <button
                                  onClick={() => handleApprove(item.id)}
                                  className="p-1 text-emerald-600 hover:bg-emerald-50 rounded-lg cursor-pointer"
                                  title="Duyệt phòng họp"
                                >
                                  <Check size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleOpenEdit(item)}
                                className="p-1 text-ink-muted hover:text-primary hover:bg-muted rounded-lg cursor-pointer"
                                title="Chỉnh sửa"
                              >
                                <Pencil size={14} />
                              </button>
                              <button
                                onClick={() => handleDelete(item.id)}
                                className="p-1 text-ink-muted hover:text-danger hover:bg-red-50 rounded-lg cursor-pointer"
                                title="Xóa lịch"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* --- VIEW 6: LOBBY TV / TIVI SẢNH SCREEN VIEW --- */}
        {view === 'lobby' && (
          <div 
            id="lobby-tv-container"
            className={cn(
              "bg-slate-950 text-white p-6 flex flex-col justify-between font-sans transition-all duration-300",
              isFullscreen 
                ? "fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none p-8" 
                : "relative min-h-[500px]"
            )}
          >
            
            {/* Lobby Display Top Control Bar */}
            <div className="flex justify-between items-center bg-white/[0.03] border border-white/5 p-3 rounded-xl mb-6">
              <span className="text-2xs font-bold text-slate-300 flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                BẢNG HIỂN THỊ LỊCH CÔNG TÁC ĐIỆN TỬ (TIVI SẢNH)
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 rounded-lg text-3xs font-black tracking-wider uppercase bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isFullscreen ? (
                    <>
                      <Minimize2 size={12} /> Thu nhỏ
                    </>
                  ) : (
                    <>
                      <Maximize2 size={12} /> Toàn màn hình
                    </>
                  )}
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    if (isFullscreen) {
                      if (document.exitFullscreen) {
                        document.exitFullscreen();
                      }
                    }
                    setView('month');
                  }} 
                  className="px-3 py-1.5 rounded-lg text-3xs font-black tracking-wider uppercase bg-red-600 hover:bg-red-700 text-white border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Monitor size={12} /> Thoát Tivi
                </button>
              </div>
            </div>

            {/* Top Display: Clock, Title */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-white/10 pb-4 mb-6 text-left">
              <div>
                <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5">
                  Lịch họp & Sự kiện Cơ quan (Hôm nay)
                </h3>
                <p className="text-3xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">
                  Viện Khoa học Công nghệ Xây dựng - IBST
                </p>
              </div>
              <div className="text-right mt-2 sm:mt-0">
                <p className="text-lg font-black tracking-tight text-white font-mono">{lobbyTime.toLocaleTimeString('vi-VN')}</p>
                <p className="text-3xs font-semibold text-slate-400 mt-0.5">{lobbyTime.toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
            </div>

            {/* Middle Content: Large list of meetings */}
            <div className="flex-1 space-y-4">
              {lobbyEvents.length === 0 ? (
                <div className="py-24 text-center text-xs font-semibold text-slate-500 flex flex-col items-center justify-center gap-3">
                  <CalendarIcon className="w-12 h-12 text-slate-600 animate-bounce" />
                  Không có cuộc họp hay sự kiện nào được lên lịch trong ngày hôm nay.
                </div>
              ) : (
                <div className="overflow-x-auto rounded-xl border border-white/5 bg-white/[0.01]">
                  <table className="w-full text-left text-2xs font-semibold">
                    <thead>
                      <tr className="bg-white/[0.03] text-slate-300 border-b border-white/5">
                        <th className="py-3 px-4 font-bold w-24">Giờ</th>
                        <th className="py-3 px-4 font-bold w-44">Phân loại</th>
                        <th className="py-3 px-4 font-bold">Nội dung công tác</th>
                        <th className="py-3 px-4 font-bold w-44">Chủ trì</th>
                        <th className="py-3 px-4 font-bold w-44">Địa điểm</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {lobbyEvents.map((item) => (
                        <tr key={item.id} className="hover:bg-white/[0.03] transition-colors border-white/5">
                          <td className="py-4 px-4 font-bold text-amber-500 font-mono text-xs flex items-center gap-1.5">
                            <Clock size={12} /> {item.gio}
                          </td>
                          <td className="py-4 px-4">
                            <span className={cn(
                              "inline-block px-2.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider border",
                              item.loai === 'Lich-BGĐ' && "bg-indigo-500/10 text-indigo-400 border-indigo-500/30",
                              item.loai === 'Lich-tuan' && "bg-amber-500/10 text-amber-400 border-amber-500/30",
                              item.loai === 'Phong-hop' && "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                            )}>
                              {item.loai === 'Lich-BGĐ' ? 'Họp BGĐ' : item.loai === 'Lich-tuan' ? 'Lịch Tuần' : 'Lịch Phòng'}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <p className="font-bold text-white text-xs">{item.noiDung}</p>
                            <p className="text-3xs text-slate-400 mt-1 font-semibold">Thành phần: {item.thanhPhan}</p>
                          </td>
                          <td className="py-4 px-4 text-slate-300 font-bold flex items-center gap-1.5">
                            <User size={12} className="text-slate-500" /> {item.chuTri}
                          </td>
                          <td className="py-4 px-4 text-slate-300 font-bold">
                            <p className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-500" /> {item.diaDiem}</p>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Bottom bar */}
            <div className="border-t border-white/10 mt-6 pt-4 text-center text-3xs font-semibold text-slate-500 flex justify-between items-center">
              <span>Hệ thống bảng hiển thị Lịch cơ quan điện tử thông minh</span>
              <span>Độc lập - Chuyên nghiệp - Tin cậy — IBST Portal</span>
            </div>
          </div>
        )}

      </div>

      {/* --- DETAIL SIDE SLIDE-OUT DRAWER --- */}
      {detailItem && (
        <div className="fixed inset-0 z-50 flex justify-end">
          {/* Backdrop blur */}
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
            onClick={() => setDetailItem(null)}
          />
          {/* Drawer body container */}
          <div className="relative w-full max-w-lg bg-surface border-l border-border h-full shadow-2xl flex flex-col p-6 text-left animate-slide-in-right overflow-y-auto">
            {/* Header drawer */}
            <div className="flex justify-between items-center pb-4 border-b border-border mb-6">
              <div className="flex items-center gap-2">
                <span className={cn(
                  "p-2 rounded-xl",
                  detailItem.loai === 'Lich-BGĐ' && "bg-indigo-500/10 text-indigo-500",
                  detailItem.loai === 'Lich-tuan' && "bg-amber-500/10 text-amber-500",
                  detailItem.loai === 'Phong-hop' && "bg-emerald-500/10 text-emerald-500"
                )}>
                  <CalendarDays size={20} />
                </span>
                <div>
                  <h3 className="font-black text-ink text-sm">Chi tiết lịch làm việc</h3>
                  <p className="text-3xs text-ink-muted mt-0.5">Mã số: EVENT-{detailItem.id}</p>
                </div>
              </div>
              <button
                onClick={() => setDetailItem(null)}
                className="w-8 h-8 rounded-full bg-muted hover:bg-border transition-colors flex items-center justify-center text-ink-secondary cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* Main info */}
            <div className="flex-1 space-y-6">
              {/* Nội dung công tác */}
              <div className="space-y-1.5">
                <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">Nội dung họp / Công tác</span>
                <p className="text-xs font-black text-ink leading-snug">{detailItem.noiDung}</p>
              </div>

              {/* Phân loại & Trạng thái */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">Phân loại lịch</span>
                  <div className="pt-0.5">
                    <span className={cn(
                      "inline-block px-2.5 py-0.5 rounded text-3xs font-black uppercase tracking-wider",
                      detailItem.loai === 'Lich-BGĐ' && "bg-indigo-500/10 text-indigo-700",
                      detailItem.loai === 'Lich-tuan' && "bg-amber-500/10 text-amber-700",
                      detailItem.loai === 'Phong-hop' && "bg-emerald-500/10 text-emerald-700"
                    )}>
                      {detailItem.loai === 'Lich-BGĐ' ? 'Lịch Họp BGĐ' : detailItem.loai === 'Lich-tuan' ? 'Lịch Tuần Viện' : 'Đăng ký phòng'}
                    </span>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">Trạng thái duyệt</span>
                  <div className="pt-0.5">
                    <span className={cn(
                      "inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-3xs font-black uppercase tracking-wider",
                      detailItem.trangThai === 'Da-duyet' ? "bg-emerald-50 text-emerald-600 border border-emerald-200" : "bg-amber-50 text-amber-600 border border-amber-200"
                    )}>
                      {detailItem.trangThai === 'Da-duyet' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                      {detailItem.trangThai === 'Da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="h-px bg-border-subtle" />

              {/* Thông tin thời gian chi tiết */}
              <div className="grid grid-cols-2 gap-4 text-xs font-semibold">
                <div className="space-y-1.5 p-3 bg-muted border border-border rounded-xl">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1"><CalendarIcon size={11} /> Ngày thực hiện</span>
                  <p className="font-bold text-ink-secondary">{detailItem.thu}, {detailItem.ngay}</p>
                </div>
                <div className="space-y-1.5 p-3 bg-muted border border-border rounded-xl">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1"><Clock size={11} /> Thời gian bắt đầu</span>
                  <p className="font-bold text-ink-secondary">{detailItem.gio}</p>
                </div>
              </div>

              {/* Địa điểm, Chủ trì, Thành phần */}
              <div className="space-y-4">
                <div className="flex gap-3">
                  <div className="p-2 bg-muted border border-border rounded-lg text-ink-muted shrink-0 h-8 w-8 flex items-center justify-center"><MapPin size={15} /></div>
                  <div className="space-y-0.5 text-xs font-semibold">
                    <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">Địa điểm họp</span>
                    <p className="font-bold text-ink-secondary">{detailItem.diaDiem}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-muted border border-border rounded-lg text-ink-muted shrink-0 h-8 w-8 flex items-center justify-center"><User size={15} /></div>
                  <div className="space-y-0.5 text-xs font-semibold">
                    <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">Người chủ trì</span>
                    <p className="font-bold text-ink-secondary">{detailItem.chuTri}</p>
                  </div>
                </div>

                <div className="flex gap-3">
                  <div className="p-2 bg-muted border border-border rounded-lg text-ink-muted shrink-0 h-8 w-8 flex items-center justify-center"><Users size={15} /></div>
                  <div className="space-y-0.5 text-xs font-semibold">
                    <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">Thành phần tham gia</span>
                    <p className="font-bold text-ink-secondary leading-relaxed">{detailItem.thanhPhan}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons footer */}
            <div className="border-t border-border pt-4 mt-6 flex justify-between gap-3">
              <div className="flex gap-2">
                <button
                  onClick={() => handleOpenEdit(detailItem)}
                  className="px-3 py-2 text-2xs font-bold bg-muted hover:bg-border border border-border text-ink-secondary rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Pencil size={13} /> Chỉnh sửa
                </button>
                <button
                  onClick={() => handleDelete(detailItem.id)}
                  className="px-3 py-2 text-2xs font-bold bg-red-50 hover:bg-red-100 border border-red-200 text-danger rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Trash2 size={13} /> Xóa lịch
                </button>
              </div>

              {detailItem.loai === 'Phong-hop' && detailItem.trangThai === 'Cho-duyet' && (
                <button
                  onClick={() => handleApprove(detailItem.id)}
                  className="px-4 py-2 text-2xs font-black bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-500/10 cursor-pointer animate-pulse"
                >
                  <Check size={13} strokeWidth={3} /> Duyệt yêu cầu
                </button>
              )}
            </div>

          </div>
        </div>
      )}

      {/* --- ADD/EDIT MODAL --- */}
      <Modal
        title={editingItem ? 'Sửa thông tin lịch công tác' : 'Đăng ký lịch công tác mới'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nội dung công việc / Nội dung họp" required>
            <textarea
              className={cn(inputCls, 'h-20 py-2 resize-none')}
              required
              value={form.noiDung}
              onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
              placeholder="VD: Họp giao ban Ban Giám đốc tuần 30..."
            />
          </Field>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Field label="Ngày thực hiện" required>
              <input
                type="date"
                className={inputCls}
                required
                value={form.ngay}
                onChange={(e) => setForm({ ...form, ngay: e.target.value })}
              />
            </Field>
            
            <Field label="Giờ bắt đầu" required>
              <input
                type="time"
                className={inputCls}
                required
                value={form.gio}
                onChange={(e) => setForm({ ...form, gio: e.target.value })}
              />
            </Field>
            
            <Field label="Phân loại lịch" required>
              <select
                className={inputCls}
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value as any })}
              >
                <option value="Lich-tuan">Lịch Tuần Viện</option>
                <option value="Lich-BGĐ">Lịch Họp Ban Giám đốc</option>
                <option value="Phong-hop">Đặt Phòng Họp / Hội trường</option>
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Field label="Chủ trì cuộc họp/nhiệm vụ" required>
              <input
                className={inputCls}
                required
                value={form.chuTri}
                onChange={(e) => setForm({ ...form, chuTri: e.target.value })}
                placeholder="VD: Viện trưởng Nguyễn Xuân Khang"
              />
            </Field>
            
            <Field label="Địa điểm thực hiện / Tên Phòng họp" required>
              <input
                className={inputCls}
                required
                value={form.diaDiem}
                onChange={(e) => setForm({ ...form, diaDiem: e.target.value })}
                placeholder="VD: Phòng họp số 1 tầng 1 / Ga ngầm S9"
              />
            </Field>
          </div>

          <Field label="Thành phần tham dự" required>
            <input
              className={inputCls}
              required
              value={form.thanhPhan}
              onChange={(e) => setForm({ ...form, thanhPhan: e.target.value })}
              placeholder="VD: Trưởng các đơn vị trực thuộc, Ban biên soạn TCVN..."
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Lưu thay đổi' : 'Đăng ký lịch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
