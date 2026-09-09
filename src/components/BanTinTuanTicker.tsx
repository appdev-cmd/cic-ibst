import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Scale, Bell, Clock, MapPin, Newspaper, ChevronRight } from 'lucide-react';
import {
  type BanTinItem,
  getBanTinTuanItems,
} from '../services/banTinTuan';
import { useSlidePanel } from '../context/SlidePanelContext';
import { BanTinTuanChiTietPanel } from './BanTinTuanChiTietPanel';
import { cn } from '../lib/utils';

export function BanTinTuanTicker() {
  const navigate = useNavigate();
  const { openPanel } = useSlidePanel();
  const [items, setItems] = useState<BanTinItem[]>([]);

  useEffect(() => {
    // Nạp danh sách bản tin tuần
    const list = getBanTinTuanItems();
    setItems(list);
  }, []);

  const openFullDigestPanel = (selectedItemId?: string) => {
    openPanel({
      id: 'ban-tin-tuan-panel',
      title: 'Bản tin Tổng hợp Tuần',
      subtitle: 'Lịch công tác, Văn bản pháp luật BXD & Chỉ đạo điều hành Viện IBST',
      icon: <Newspaper size={16} className="text-primary" />,
      content: <BanTinTuanChiTietPanel initialItemId={selectedItemId} />,
      storageKey: 'slideover-width-ban-tin-tuan',
    });
  };

  const handleItemClick = (item: BanTinItem) => {
    openFullDigestPanel(item.id);
  };

  if (items.length === 0) return null;

  // Nhân đôi danh sách để tạo chuỗi cuộn vòng lặp vô tận (continuous marquee)
  const displayList = [...items, ...items];

  return (
    <div className="hidden lg:flex items-center gap-2 px-3 py-1 bg-muted/40 dark:bg-slate-900/60 border border-border dark:border-slate-700/80 rounded-xl flex-1 min-w-0 mx-3 max-w-xl xl:max-w-3xl 2xl:max-w-5xl overflow-hidden h-9 shadow-2xs relative group select-none">
      {/* ── Badge chính Bản tin tuần ── */}
      <button
        type="button"
        onClick={() => openFullDigestPanel()}
        title="Bấm để xem danh sách tổng hợp Bản tin tuần"
        className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider shrink-0 z-10 border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800 text-ink shadow-xs hover:border-primary hover:text-primary transition-all cursor-pointer"
      >
        <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
        <span>Bản tin tuần</span>
      </button>

      {/* ── Dải cuộn Marquee ── */}
      <div className="flex-1 min-w-0 overflow-hidden relative flex items-center h-full">
        {/* Gradient mờ 2 biên để chữ trôi vào/ra mềm mại */}
        <div className="absolute left-0 top-0 bottom-0 w-6 z-10 pointer-events-none bg-gradient-to-r from-surface dark:from-slate-900 to-transparent" />
        <div className="absolute right-0 top-0 bottom-0 w-10 z-10 pointer-events-none bg-gradient-to-l from-surface dark:from-slate-900 to-transparent" />

        <div className="ticker-track flex items-center whitespace-nowrap">
          {displayList.map((item, index) => {
            if (item.kind === 'event') {
              const isMeeting = item.loai === 'meeting' || item.loai === 'Lich-BGĐ' || item.loai === 'Lich-tuan';
              return (
                <div
                  key={`event-${item.id}-${index}`}
                  onClick={() => handleItemClick(item)}
                  className="inline-flex items-center gap-2 mx-4 text-xs text-ink-secondary hover:text-amber-600 dark:hover:text-amber-400 font-medium transition-colors cursor-pointer group/item"
                  title={`[Lịch cơ quan] ${item.title} — ${item.thu} ${item.gio} (${item.diaDiem})`}
                >
                  {/* Badge sự kiện */}
                  <span
                    className={cn(
                      'inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md border shrink-0',
                      isMeeting
                        ? 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                        : 'bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800',
                    )}
                  >
                    <Calendar className="w-2.5 h-2.5" />
                    <span>{isMeeting ? 'Lịch Họp' : 'Hiện trường'}</span>
                  </span>

                  {/* Thời gian */}
                  <span className="text-[11px] font-bold text-amber-600 dark:text-amber-400 shrink-0 flex items-center gap-1">
                    <Clock className="w-2.5 h-2.5" />
                    {item.thu} {item.gio}
                  </span>

                  {/* Nội dung */}
                  <span className="max-w-[340px] xl:max-w-[480px] truncate text-ink group-hover/item:text-amber-600 dark:group-hover/item:text-amber-400 font-medium">
                    {item.title}
                  </span>

                  {/* Địa điểm / Xe */}
                  <span className="text-[10px] text-ink-muted flex items-center gap-0.5 shrink-0 italic">
                    <MapPin className="w-2.5 h-2.5 text-slate-400" />
                    {item.diaDiem}
                  </span>

                  <span className="text-ink-muted/40 mx-1">•</span>
                </div>
              );
            }

            if (item.kind === 'legal') {
              return (
                <div
                  key={`legal-${item.id}-${index}`}
                  onClick={() => handleItemClick(item)}
                  className="inline-flex items-center gap-2 mx-4 text-xs text-ink-secondary hover:text-blue-600 dark:hover:text-blue-400 font-medium transition-colors cursor-pointer group/doc"
                  title={`[Văn bản & Tiêu chuẩn] ${item.code} — ${item.title}`}
                >
                  {/* Badge văn bản */}
                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md border shrink-0 bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-800">
                    <Scale className="w-2.5 h-2.5" />
                    <span>{item.code}</span>
                  </span>

                  {/* Tiêu đề */}
                  <span className="max-w-[340px] xl:max-w-[480px] truncate text-ink group-hover/doc:text-blue-600 dark:group-hover/doc:text-blue-400 font-medium">
                    {item.title}
                  </span>

                  {/* Ngày hiệu lực */}
                  <span className="text-[10px] text-ink-muted italic shrink-0">
                    (HL: {item.effectiveDate})
                  </span>

                  <span className="text-ink-muted/40 mx-1">•</span>
                </div>
              );
            }

            // Notice
            return (
              <div
                key={`notice-${item.id}-${index}`}
                onClick={() => handleItemClick(item)}
                className="inline-flex items-center gap-2 mx-4 text-xs text-ink-secondary hover:text-rose-600 dark:hover:text-rose-400 font-medium transition-colors cursor-pointer group/notice"
                title={`[Chỉ đạo điều hành] ${item.title}`}
              >
                {/* Badge thông báo */}
                <span className="inline-flex items-center gap-1 px-1.5 py-0.5 text-[9px] font-black uppercase rounded-md border shrink-0 bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800">
                  <Bell className="w-2.5 h-2.5" />
                  <span>{item.priority === 'urgent' ? 'Chỉ đạo khẩn' : 'Thông báo'}</span>
                </span>

                {/* Tiêu đề */}
                <span className="max-w-[340px] xl:max-w-[480px] truncate text-ink group-hover/notice:text-rose-600 dark:group-hover/notice:text-rose-400 font-medium">
                  {item.title}
                </span>

                <span className="text-ink-muted/40 mx-1">•</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Nút xem tất cả ở cuối dải ── */}
      <button
        type="button"
        onClick={() => openFullDigestPanel()}
        title="Xem toàn bộ Bản tin tổng hợp tuần qua SlidePanel"
        className="z-10 p-1 text-ink-muted hover:text-primary rounded-md hover:bg-muted transition-colors shrink-0"
      >
        <ChevronRight size={15} />
      </button>
    </div>
  );
}
