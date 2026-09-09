import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar,
  Scale,
  Bell,
  Clock,
  MapPin,
  Car,
  User,
  Search,
  ExternalLink,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
} from 'lucide-react';
import {
  type BanTinItem,
  type BanTinEventItem,
  type BanTinLegalItem,
  type BanTinNoticeItem,
  getBanTinTuanItems,
  getKhoangThoiGianTuanHienTai,
} from '../services/banTinTuan';
import { cn } from '../lib/utils';
import { useSlidePanel } from '../context/SlidePanelContext';

interface BanTinTuanChiTietPanelProps {
  initialItemId?: string;
  initialTab?: 'all' | 'event' | 'legal' | 'notice';
}

export function BanTinTuanChiTietPanel({
  initialItemId,
  initialTab = 'all',
}: BanTinTuanChiTietPanelProps) {
  const navigate = useNavigate();
  const { closePanel } = useSlidePanel();
  const [activeTab, setActiveTab] = useState<'all' | 'event' | 'legal' | 'notice'>(initialTab);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | undefined>(initialItemId);

  const { weekLabel } = getKhoangThoiGianTuanHienTai();
  const allItems = useMemo(() => getBanTinTuanItems(), []);

  const filteredItems = useMemo(() => {
    return allItems.filter((item) => {
      if (activeTab !== 'all' && item.kind !== activeTab) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      if (item.kind === 'event') {
        return (
          item.title.toLowerCase().includes(q) ||
          item.diaDiem.toLowerCase().includes(q) ||
          item.chuTri.toLowerCase().includes(q)
        );
      }
      if (item.kind === 'legal') {
        return (
          item.code.toLowerCase().includes(q) ||
          item.title.toLowerCase().includes(q) ||
          item.summary.toLowerCase().includes(q)
        );
      }
      if (item.kind === 'notice') {
        return (
          item.title.toLowerCase().includes(q) ||
          item.content.toLowerCase().includes(q) ||
          item.sender.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [allItems, activeTab, search]);

  const selectedItem = useMemo(() => {
    if (!selectedId) return filteredItems[0] || allItems[0];
    return allItems.find((i) => i.id === selectedId) || filteredItems[0] || allItems[0];
  }, [selectedId, allItems, filteredItems]);

  const countEvents = allItems.filter((i) => i.kind === 'event').length;
  const countLegals = allItems.filter((i) => i.kind === 'legal').length;
  const countNotices = allItems.filter((i) => i.kind === 'notice').length;

  return (
    <div className="flex flex-col h-full bg-surface text-ink text-xs">
      {/* Header phụ: Thông tin tuần & Tìm kiếm */}
      <div className="p-4 border-b border-border-subtle bg-subtle/50 space-y-3 shrink-0">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-bold text-ink text-sm">Bản tin Tổng hợp Tuần</span>
          </div>
          <span className="text-2xs font-semibold px-2 py-0.5 rounded-md bg-muted text-ink-muted border border-border">
            {weekLabel}
          </span>
        </div>

        {/* Ô tìm kiếm nhanh */}
        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm sự kiện, văn bản, tiêu chuẩn, chỉ đạo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-border bg-surface text-ink placeholder:text-ink-muted/60 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
          />
        </div>

        {/* Tab Lọc chuyên mục */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={cn(
              'px-2.5 py-1 rounded-md text-2xs font-bold transition-all flex items-center gap-1.5',
              activeTab === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'bg-muted text-ink-muted hover:text-ink hover:bg-muted/80',
            )}
          >
            <Filter size={11} /> Tất cả ({allItems.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('event')}
            className={cn(
              'px-2.5 py-1 rounded-md text-2xs font-bold transition-all flex items-center gap-1.5',
              activeTab === 'event'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-muted text-ink-muted hover:text-ink hover:bg-muted/80',
            )}
          >
            <Calendar size={11} /> Lịch công tác ({countEvents})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('legal')}
            className={cn(
              'px-2.5 py-1 rounded-md text-2xs font-bold transition-all flex items-center gap-1.5',
              activeTab === 'legal'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-muted text-ink-muted hover:text-ink hover:bg-muted/80',
            )}
          >
            <Scale size={11} /> VB & Quy chuẩn ({countLegals})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('notice')}
            className={cn(
              'px-2.5 py-1 rounded-md text-2xs font-bold transition-all flex items-center gap-1.5',
              activeTab === 'notice'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'bg-muted text-ink-muted hover:text-ink hover:bg-muted/80',
            )}
          >
            <Bell size={11} /> Chỉ đạo ({countNotices})
          </button>
        </div>
      </div>

      {/* Nội dung 2 cột: Danh sách bên trái, Chi tiết bên phải */}
      <div className="flex-1 grid grid-cols-1 md:grid-cols-5 min-h-0 overflow-hidden divide-y md:divide-y-0 md:divide-x divide-border">
        {/* Cột 1: Danh sách tin tức (2/5) */}
        <div className="md:col-span-2 overflow-y-auto p-3 space-y-2">
          {filteredItems.length === 0 ? (
            <div className="text-center py-8 text-ink-muted">
              <Info size={24} className="mx-auto mb-2 opacity-50" />
              <p>Không tìm thấy bản tin phù hợp</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItem?.id === item.id;

              if (item.kind === 'event') {
                return (
                  <div
                    key={`ev-${item.id}`}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'p-2.5 rounded-xl border cursor-pointer transition-all text-left group',
                      isSelected
                        ? 'border-amber-500 bg-amber-50/60 dark:bg-amber-950/30 ring-1 ring-amber-500/40'
                        : 'border-border bg-surface hover:bg-subtle dark:hover:bg-slate-800/40',
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                        <Calendar size={10} /> Lịch công tác
                      </span>
                      <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">
                        {item.thu} • {item.gio}
                      </span>
                    </div>
                    <p className="font-bold text-ink line-clamp-2 text-xs leading-snug group-hover:text-primary">
                      {item.title}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-2xs text-ink-muted truncate">
                      <span className="flex items-center gap-0.5 truncate">
                        <MapPin size={10} /> {item.diaDiem}
                      </span>
                      {item.xeCongTac && item.xeCongTac !== 'Không yêu cầu' && (
                        <span className="flex items-center gap-0.5 text-blue-600 dark:text-blue-400 font-semibold truncate">
                          <Car size={10} /> {item.xeCongTac}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }

              if (item.kind === 'legal') {
                return (
                  <div
                    key={`leg-${item.id}`}
                    onClick={() => setSelectedId(item.id)}
                    className={cn(
                      'p-2.5 rounded-xl border cursor-pointer transition-all text-left group',
                      isSelected
                        ? 'border-blue-500 bg-blue-50/60 dark:bg-blue-950/30 ring-1 ring-blue-500/40'
                        : 'border-border bg-surface hover:bg-subtle dark:hover:bg-slate-800/40',
                    )}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                        <Scale size={10} /> {item.type}
                      </span>
                      <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                        {item.code}
                      </span>
                    </div>
                    <p className="font-bold text-ink line-clamp-2 text-xs leading-snug group-hover:text-primary">
                      {item.title}
                    </p>
                    <p className="mt-1 text-2xs text-ink-muted truncate">
                      Cơ quan: {item.agency} • HL: {item.effectiveDate}
                    </p>
                  </div>
                );
              }

              // Notice
              return (
                <div
                  key={`not-${item.id}`}
                  onClick={() => setSelectedId(item.id)}
                  className={cn(
                    'p-2.5 rounded-xl border cursor-pointer transition-all text-left group',
                    isSelected
                      ? 'border-rose-500 bg-rose-50/60 dark:bg-rose-950/30 ring-1 ring-rose-500/40'
                      : 'border-border bg-surface hover:bg-subtle dark:hover:bg-slate-800/40',
                  )}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <Bell size={10} /> Chỉ đạo
                    </span>
                    {item.priority === 'urgent' && (
                      <span className="text-[10px] font-bold text-danger animate-pulse">Khẩn cấp</span>
                    )}
                  </div>
                  <p className="font-bold text-ink line-clamp-2 text-xs leading-snug group-hover:text-primary">
                    {item.title}
                  </p>
                  <p className="mt-1 text-2xs text-ink-muted truncate">
                    Nơi phát: {item.sender} • Ngày: {item.date}
                  </p>
                </div>
              );
            })
          )}
        </div>

        {/* Cột 2: Chi tiết nội dung được chọn (3/5) */}
        <div className="md:col-span-3 overflow-y-auto p-4 md:p-5">
          {selectedItem ? (
            <div className="space-y-4 text-left animate-fade-in">
              {/* Event detail */}
              {selectedItem.kind === 'event' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-amber-100 text-amber-800 dark:bg-amber-950/80 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
                      <Calendar size={12} /> Lịch công tác cơ quan
                    </span>
                    <span className="text-xs text-amber-600 dark:text-amber-400 font-bold">
                      {selectedItem.thu}, ngày {selectedItem.ngay}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-ink leading-snug">
                    {selectedItem.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-subtle border border-border space-y-2.5">
                    <div className="flex items-center gap-2">
                      <Clock size={14} className="text-amber-500 shrink-0" />
                      <div>
                        <span className="text-ink-muted">Thời gian: </span>
                        <span className="font-bold text-ink">
                          {selectedItem.gio} {selectedItem.gioKetThuc ? `đến ${selectedItem.gioKetThuc}` : ''}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <MapPin size={14} className="text-emerald-500 shrink-0" />
                      <div>
                        <span className="text-ink-muted">Địa điểm / Phòng họp: </span>
                        <span className="font-bold text-ink">{selectedItem.diaDiem}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <User size={14} className="text-blue-500 shrink-0" />
                      <div>
                        <span className="text-ink-muted">Chủ trì: </span>
                        <span className="font-bold text-ink">{selectedItem.chuTri}</span>
                      </div>
                    </div>

                    {selectedItem.xeCongTac && selectedItem.xeCongTac !== 'Không yêu cầu' && (
                      <div className="flex items-center gap-2">
                        <Car size={14} className="text-indigo-500 shrink-0" />
                        <div>
                          <span className="text-ink-muted">Xe công tác: </span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">
                            {selectedItem.xeCongTac}
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        closePanel();
                        navigate('/lich-co-quan');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-primary text-white text-xs font-bold shadow-xs hover:bg-primary/90 transition-colors"
                    >
                      <span>Mở phân hệ Lịch cơ quan</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </>
              )}

              {/* Legal detail */}
              {selectedItem.kind === 'legal' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-800 dark:bg-blue-950/80 dark:text-blue-300 border border-blue-300 dark:border-blue-800">
                      <Scale size={12} /> {selectedItem.type}
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      {selectedItem.code}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-ink leading-snug">
                    {selectedItem.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-subtle border border-border space-y-2 text-xs">
                    <div className="flex justify-between border-b border-border-subtle pb-2">
                      <span className="text-ink-muted">Cơ quan ban hành:</span>
                      <span className="font-bold text-ink">{selectedItem.agency}</span>
                    </div>
                    <div className="flex justify-between border-b border-border-subtle pb-2">
                      <span className="text-ink-muted">Ngày ban hành:</span>
                      <span className="font-medium text-ink">{selectedItem.issuedDate}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-ink-muted">Ngày có hiệu lực:</span>
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedItem.effectiveDate}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink text-xs uppercase tracking-wider">Tóm tắt nội dung quy định:</h4>
                    <p className="text-ink-secondary leading-relaxed bg-muted/40 p-3 rounded-xl border border-border">
                      {selectedItem.summary}
                    </p>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        closePanel();
                        navigate('/e-office');
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border border-border bg-surface text-ink text-xs font-bold shadow-xs hover:border-primary hover:text-primary transition-colors"
                    >
                      <span>Tra cứu tại Văn phòng số e-Office</span>
                      <ExternalLink size={13} />
                    </button>
                  </div>
                </>
              )}

              {/* Notice detail */}
              {selectedItem.kind === 'notice' && (
                <>
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-rose-100 text-rose-800 dark:bg-rose-950/80 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
                      <Bell size={12} /> Thông báo & Chỉ đạo
                    </span>
                    <span className="text-xs text-ink-muted">
                      Ngày ban hành: {selectedItem.date}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-ink leading-snug">
                    {selectedItem.title}
                  </h3>

                  <div className="p-3 rounded-xl bg-subtle border border-border space-y-2">
                    <div className="flex justify-between border-b border-border-subtle pb-2">
                      <span className="text-ink-muted">Nơi phát hành:</span>
                      <span className="font-bold text-ink">{selectedItem.sender}</span>
                    </div>
                    {selectedItem.deadline && (
                      <div className="flex justify-between text-danger font-bold">
                        <span>Hạn chót thực hiện:</span>
                        <span>{selectedItem.deadline}</span>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="font-bold text-ink text-xs uppercase tracking-wider">Nội dung chỉ đạo:</h4>
                    <p className="text-ink-secondary leading-relaxed bg-muted/40 p-3 rounded-xl border border-border">
                      {selectedItem.content}
                    </p>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="h-full flex items-center justify-center text-ink-muted">
              Chọn một bản tin bên trái để xem nội dung chi tiết
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
