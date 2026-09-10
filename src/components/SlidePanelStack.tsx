import { useEffect, useMemo, useRef, useState } from 'react';
import { X, FileText } from 'lucide-react';
import { cn } from '../lib/utils';
import { useSlidePanel, type SlidePanelEntry } from '../context/SlidePanelContext';

// Cách bố trí phỏng theo cic-erp-contract / qlda-ddcn-ht: mỗi panel là 1 lớp full-screen
// neo phải. CHỈ panel đầu tiên (index 0) dùng chiều rộng "tự nhiên" (defaultWidth riêng của
// nó) — mọi panel mở SAU đó mặc định BÁM SÁT panel liền trước, hẹp hơn đúng
// STACKING_OFFSET, để dải hé lộ luôn mỏng (đủ chỗ cho tai thỏ, không lộ ra một mảng nội
// dung dở dang trông như lỗi). Một panel chỉ "phá lệ" dùng kích thước riêng nếu người
// dùng đã từng tự tay kéo chỉnh nó trước đó (lưu trong localStorage theo storageKey).
const BASE_GAP = 24;
const STACKING_OFFSET = 28;
const TAB_WIDTH = 34;
const TAB_LENGTH = 140;
const TAB_GAP = 6;
const TAB_TOP_START = 0;
const MIN_PANEL_WIDTH = 360;

function readSavedWidth(storageKey: string | undefined): number | null {
  if (!storageKey || typeof window === 'undefined') return null;
  const saved = Number(window.localStorage.getItem(storageKey));
  if (!Number.isFinite(saved) || saved <= 0) return null;
  // Bỏ qua giá trị cũ >= 1800 hoặc gần như chiếm trọn toàn màn hình (legacy full-screen)
  if (saved >= 1800 || (window.innerWidth > 800 && saved >= window.innerWidth - 60)) {
    return null;
  }
  return saved;
}

/** Tính chiều rộng thực tế (px) từng panel trong ngăn xếp theo chuỗi ràng buộc trên.
 * `sidebarWidth` trừ đi phần bị sidebar chiếm bên trái, để panel không bao giờ đè lên
 * sidebar — chỉ mở rộng tối đa "đến mép sidebar". */
function computeWidths(
  stack: SlidePanelEntry[],
  topDragWidth: number | null,
  sidebarWidth: number,
): number[] {
  const viewportWidth = typeof window === 'undefined' ? 1280 : window.innerWidth;
  const innerWidth = viewportWidth - sidebarWidth;
  const widths: number[] = [];
  const maxCeiling = innerWidth - (viewportWidth < 640 ? 0 : BASE_GAP);
  // Mặc định 1/2 màn hình (50% viewport width) cho tất cả các view
  const defaultHalfWidth = Math.min(maxCeiling, Math.max(MIN_PANEL_WIDTH, Math.round(viewportWidth * 0.5)));

  stack.forEach((panel, i) => {
    const isTop = i === stack.length - 1;
    const saved = readSavedWidth(panel.storageKey);
    const minW = panel.minWidth ?? MIN_PANEL_WIDTH;

    let natural: number;
    if (isTop && topDragWidth != null) {
      natural = topDragWidth; // Đang kéo tay panel trên cùng
    } else if (saved != null) {
      natural = saved; // Đã từng lưu chiều rộng kéo thủ công trước đó
    } else if (panel.defaultWidth && panel.defaultWidth < 1800) {
      natural = Math.max(panel.defaultWidth, defaultHalfWidth);
    } else {
      // Mặc định 1/2 màn hình; nếu là panel xếp chồng phía sau (i > 0)
      // thì lùi nhẹ STACKING_OFFSET để dải hé lộ tai thỏ lộ ra tinh tế
      const offset = i * STACKING_OFFSET;
      natural = Math.max(minW, defaultHalfWidth - offset);
    }

    // Cho phép panel mở rộng tự do tới maxCeiling mà không bị giới hạn bởi panel phía dưới
    const w = Math.max(minW, Math.min(natural, maxCeiling));
    widths.push(w);
  });
  return widths;
}

function PanelLayer({
  panel,
  index,
  width,
  isTop,
  resizing,
  onClose,
  onBringToFront,
  onStartResize,
}: {
  panel: SlidePanelEntry;
  index: number;
  width: number;
  isTop: boolean;
  resizing?: boolean;
  onClose: () => void;
  onBringToFront: () => void;
  onStartResize: (e: React.PointerEvent) => void;
}) {
  const title = typeof panel.title === 'string' ? panel.title : '';
  const tabTop = TAB_TOP_START + index * (TAB_LENGTH + TAB_GAP);

  return (
    <div className="absolute inset-0 flex justify-end" style={{ zIndex: 50 + index }}>
      {isTop && (
        // `pointer-events-auto` là BẮT BUỘC: container ngoài cùng của ngăn xếp đặt
        // `pointer-events-none` (để không chặn thao tác khi panel đang đóng), nên tay kéo
        // không tự nhận được chuột nếu thiếu dòng này — trước đây kéo giãn không hoạt động.
        <div
          onPointerDown={onStartResize}
          title="Kéo sang trái/phải để thay đổi chiều rộng"
          className="group pointer-events-auto absolute top-0 bottom-0 z-20 flex w-6 cursor-col-resize items-center justify-center touch-none select-none"
          style={{ right: width - 12 }}
        >
          {/* Đường viền dọc có hiệu ứng nổi bật khi hover hoặc khi đang kéo */}
          <div
            className={cn(
              'h-full w-0.5 transition-colors',
              resizing
                ? 'w-1 bg-primary shadow-sm shadow-primary/40'
                : 'bg-transparent group-hover:w-1 group-hover:bg-primary/70',
            )}
          />

          {/* Viên tay cầm trực quan (Grab Handle Pill) ở giữa cạnh trái */}
          <div
            className={cn(
              'pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex h-12 w-3.5 flex-col items-center justify-center gap-1 rounded-full border shadow-md transition-all',
              resizing
                ? 'border-primary bg-primary text-white scale-110 shadow-primary/30 ring-2 ring-primary/30'
                : 'border-border bg-surface text-ink-muted group-hover:scale-105 group-hover:border-primary group-hover:bg-primary-subtle group-hover:text-primary dark:border-slate-700/80 dark:bg-slate-800',
            )}
          >
            <span className={cn('h-1 w-1 rounded-full transition-colors', resizing ? 'bg-white' : 'bg-ink-muted/70 group-hover:bg-primary')} />
            <span className={cn('h-1 w-1 rounded-full transition-colors', resizing ? 'bg-white' : 'bg-ink-muted/70 group-hover:bg-primary')} />
            <span className={cn('h-1 w-1 rounded-full transition-colors', resizing ? 'bg-white' : 'bg-ink-muted/70 group-hover:bg-primary')} />
          </div>
        </div>
      )}
      <div
        style={{ width }}
        className={cn(
          'relative flex h-full flex-col bg-surface shadow-2xl pointer-events-auto border-l border-border dark:border-slate-700/80',
          isTop && 'animate-slide-in-right',
          !isTop && 'brightness-[0.97] dark:brightness-90',
        )}
      >
        {/* Tai thỏ (Tab button) — Bám dính 100% mép trái panel */}
        <div
          className="absolute right-full z-30 pointer-events-auto"
          style={{ top: tabTop }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isTop) onBringToFront();
            }}
            title={title}
            className={cn(
              'group flex flex-col items-center gap-1.5 rounded-l-xl border border-r-0 pb-2 pt-2.5 shadow-md transition-all',
              isTop
                ? 'border-primary-700 bg-primary text-white shadow-primary/20'
                : 'cursor-pointer border-border bg-surface text-ink-secondary hover:border-primary-light hover:bg-primary-subtle hover:text-primary-600 dark:hover:bg-primary-900/30',
            )}
            style={{ width: TAB_WIDTH, height: TAB_LENGTH }}
          >
            <span className={cn('shrink-0', isTop ? 'text-white/90' : 'text-ink-muted')}>
              {panel.icon ?? <FileText size={14} />}
            </span>
            <span
              className="min-h-0 flex-1 overflow-hidden whitespace-nowrap text-[10px] font-bold tracking-tight"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textOverflow: 'ellipsis' }}
            >
              {title}
            </span>
            {isTop && (
              <span
                onClick={(e) => {
                  e.stopPropagation();
                  onClose();
                }}
                title="Đóng"
                className="flex h-4.5 w-4.5 shrink-0 items-center justify-center rounded-full text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <X size={11} strokeWidth={2.5} />
              </span>
            )}
          </button>
        </div>

        <div className="flex items-start justify-between gap-3 border-b border-border-subtle px-5 py-3.5">
          <div className="min-w-0">
            <h2 className="truncate text-sm font-bold text-ink">{panel.title}</h2>
            {panel.subtitle && <p className="mt-0.5 truncate text-xs text-ink-muted">{panel.subtitle}</p>}
          </div>
          {isTop && (
            <div className="flex shrink-0 items-center gap-2">
              {panel.headerExtra}
              <button
                onClick={onClose}
                className="rounded-full p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-ink"
              >
                <X size={18} />
              </button>
            </div>
          )}
        </div>
        <div className="flex-1 overflow-y-auto">{panel.content}</div>
        {panel.footer && isTop && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
            {panel.footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Container toàn cục cho ngăn xếp slide-panel — mount 1 lần ở AppLayout. Panel mở sau
 * cùng hiển thị đầy đủ; các panel mở trước thu gọn thành tai thỏ dọc bên trái, không bị
 * đóng khi bị che — bấm vào tai thỏ để đưa trở lại lên trên (giữ nguyên nội dung/trạng thái). */
export function SlidePanelStack({ sidebarWidth = 0 }: { sidebarWidth?: number }) {
  const { stack, bringToFront, closePanel } = useSlidePanel();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const open = stack.length > 0;
  const topId = stack[stack.length - 1]?.id ?? null;

  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const [resizing, setResizing] = useState(false);
  const dragWidthRef = useRef<number | null>(null);
  dragWidthRef.current = dragWidth;

  // Panel trên cùng đổi -> hủy chiều rộng đang kéo tay của panel cũ.
  useEffect(() => {
    setDragWidth(null);
  }, [topId]);

  const widths = useMemo(
    () => computeWidths(stack, dragWidth, sidebarWidth),
    [stack, dragWidth, sidebarWidth],
  );

  useEffect(() => {
    if (open) {
      setMounted(true);
      const raf = requestAnimationFrame(() => setVisible(true));
      return () => cancelAnimationFrame(raf);
    }
    setVisible(false);
    const t = setTimeout(() => setMounted(false), 200);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closePanel();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, closePanel]);

  useEffect(() => {
    if (!resizing) return;
    const topIndex = stack.length - 1;
    // Cho phép panel mở rộng tối đa tới mép sidebar (không bị panel bên dưới chặn)
    const maxCeiling =
      window.innerWidth - sidebarWidth - (window.innerWidth < 640 ? 0 : BASE_GAP);
    const minW = stack[topIndex]?.minWidth ?? MIN_PANEL_WIDTH;
    // Dùng Pointer Events (không phải Mouse Events) để kéo được cả bằng chuột, cảm ứng và bút.
    const onMove = (e: PointerEvent) => {
      const targetWidth = window.innerWidth - e.clientX;
      const w = Math.min(maxCeiling, Math.max(minW, targetWidth));
      setDragWidth(w);
    };
    const onUp = () => {
      setResizing(false);
      const key = stack[topIndex]?.storageKey;
      if (key && dragWidthRef.current != null) {
        window.localStorage.setItem(key, String(dragWidthRef.current));
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizing]);

  if (!mounted) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 pointer-events-none" style={{ left: sidebarWidth }}>
      <div
        className={cn(
          'absolute inset-0 bg-black/45 backdrop-blur-sm transition-opacity duration-200 pointer-events-auto',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onMouseDown={() => closePanel()}
      />
      {stack.map((panel, index) => (
        <PanelLayer
          key={panel.id}
          panel={panel}
          index={index}
          width={widths[index]}
          isTop={index === stack.length - 1}
          resizing={resizing && index === stack.length - 1}
          onClose={() => closePanel(panel.id)}
          onBringToFront={() => bringToFront(panel.id)}
          onStartResize={(e) => {
            e.preventDefault();
            setResizing(true);
          }}
        />
      ))}
    </div>
  );
}
