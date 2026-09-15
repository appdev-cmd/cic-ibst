import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
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
  const maxCeiling = innerWidth - (viewportWidth < 640 ? 0 : BASE_GAP);
  // Mặc định 1/2 màn hình (50% viewport width) cho tất cả các view thông thường nếu không chỉ định kích thước riêng
  const defaultHalfWidth = Math.min(maxCeiling, Math.max(MIN_PANEL_WIDTH, Math.round(viewportWidth * 0.5)));

  // Bước 1: Tính chiều rộng tự nhiên sơ bộ của từng panel
  const initialWidths = stack.map((panel, i) => {
    const isTop = i === stack.length - 1;
    const saved = readSavedWidth(panel.storageKey);
    const minW = panel.minWidth ?? MIN_PANEL_WIDTH;

    let natural: number;
    if (isTop && topDragWidth != null) {
      natural = topDragWidth; // Đang kéo tay panel trên cùng (ưu tiên cao nhất)
    } else if (panel.isSplitView) {
      // Bung rộng sang trái khi mở đối chiếu: lấy kích thước đã kéo hoặc mặc định 1500px
      const savedSplit = readSavedWidth('slideover-split-view-width');
      natural = savedSplit ?? Math.min(maxCeiling, 1500);
    } else if (saved != null) {
      natural = saved; // Đã từng lưu chiều rộng kéo thủ công trước đó
    } else if (panel.defaultWidth && panel.defaultWidth < 1800) {
      natural = panel.defaultWidth; // Tôn trọng defaultWidth được khai báo riêng
    } else {
      // Đếm các panel cùng phía (trái/phải) xếp trước nó
      const side = panel.side ?? 'right';
      const sameSideIndex = stack.slice(0, i).filter((p) => (p.side ?? 'right') === side).length;
      const offset = sameSideIndex * STACKING_OFFSET;
      natural = Math.max(minW, defaultHalfWidth - offset);
    }

    const maxW = panel.maxWidth ? Math.min(panel.maxWidth, maxCeiling) : maxCeiling;
    return Math.max(minW, Math.min(natural, maxW));
  });

  // Bước 2: Điều phối khi mở song song cả panel bên trái và panel bên phải (Dual-panel Split View)
  // Đảm bảo panel bên trái không đè tràn sang nội dung panel bên phải
  const leftIdx = stack.map((p, i) => ({ side: p.side, i })).reverse().find((x) => x.side === 'left')?.i;
  const rightIdx = stack.map((p, i) => ({ side: p.side ?? 'right', i })).reverse().find((x) => x.side === 'right')?.i;

  if (leftIdx != null && rightIdx != null) {
    const wLeft = initialWidths[leftIdx];
    const wRight = initialWidths[rightIdx];
    const available = innerWidth - 36; // trừ khoảng trống cho tai thỏ và phân cách

    if (wLeft + wRight > available) {
      if (available >= 960) {
        // Màn hình đủ lớn: co panel phải lại vừa khít không gian còn lại để 2 bên nằm cạnh nhau
        const minRight = stack[rightIdx]?.minWidth ?? MIN_PANEL_WIDTH;
        initialWidths[rightIdx] = Math.max(minRight, available - wLeft);
      }
    }
  }

  return initialWidths;
}

function PanelLayer({
  panel,
  index,
  width,
  isTop,
  isSideTop,
  shouldDim,
  resizing,
  onClose,
  onBringToFront,
  onStartResize,
}: {
  panel: SlidePanelEntry;
  index: number;
  width: number;
  isTop: boolean;
  isSideTop: boolean;
  shouldDim: boolean;
  resizing?: boolean;
  onClose: () => void;
  onBringToFront: () => void;
  onStartResize: (e: React.PointerEvent) => void;
}) {
  const isLeft = panel.side === 'left';
  const title = typeof panel.title === 'string' ? panel.title : '';
  const tabTop = TAB_TOP_START + index * (TAB_LENGTH + TAB_GAP);

  return (
    <div
      className={cn('absolute inset-0 flex pointer-events-none', isLeft ? 'justify-start' : 'justify-end')}
      style={{ zIndex: 50 + index }}
    >
      <div
        role="dialog"
        aria-modal={isTop ? "true" : "false"}
        aria-label={title || "Bảng tác vụ"}
        tabIndex={-1}
        style={{
          width,
          transition: resizing ? 'none' : undefined,
        }}
        className={cn(
          'relative flex h-full flex-col bg-surface shadow-2xl pointer-events-auto outline-hidden',
          isLeft
            ? 'border-r border-border dark:border-slate-700/80'
            : 'border-l border-border dark:border-slate-700/80',
          isTop && (isLeft ? 'animate-slide-in-left' : 'animate-slide-in-right'),
          shouldDim && 'brightness-[0.97] dark:brightness-90',
        )}
      >
        {/* Tay kéo dãn chiều rộng — nằm chính xác ở mép của Panel */}
        {isSideTop && (
          <div
            onPointerDown={onStartResize}
            title="Kéo sang trái/phải để thay đổi chiều rộng"
            className="group pointer-events-auto absolute top-0 bottom-0 z-40 flex w-6 cursor-col-resize items-center justify-center touch-none select-none"
            style={isLeft ? { right: -12 } : { left: -12 }}
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

            {/* Viên tay cầm trực quan (Grab Handle Pill) ở giữa */}
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

        {/* Tai thỏ (Tab button) */}
        <div
          className={cn(
            'absolute z-30 pointer-events-auto',
            isLeft ? 'left-full' : 'right-full',
          )}
          style={{ top: tabTop }}
        >
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!isSideTop) onBringToFront();
            }}
            title={title}
            className={cn(
              'group flex flex-col items-center gap-1.5 pb-2 pt-2.5 shadow-md transition-all',
              isLeft ? 'rounded-r-xl border border-l-0' : 'rounded-l-xl border border-r-0',
              isSideTop
                ? 'border-primary-700 bg-primary text-white shadow-primary/20'
                : 'cursor-pointer border-border bg-surface text-ink-secondary hover:border-primary-light hover:bg-primary-subtle hover:text-primary-600 dark:hover:bg-primary-900/30',
            )}
            style={{ width: TAB_WIDTH, height: TAB_LENGTH }}
          >
            <span className={cn('shrink-0', isSideTop ? 'text-white/90' : 'text-ink-muted')}>
              {panel.icon ?? <FileText size={14} />}
            </span>
            <span
              className="min-h-0 flex-1 overflow-hidden whitespace-nowrap text-[10px] font-bold tracking-tight"
              style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', textOverflow: 'ellipsis' }}
            >
              {title}
            </span>
            {isSideTop && (
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
          {isSideTop && (
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
        <div className={cn('flex-1 min-h-0', panel.isSplitView ? 'overflow-hidden flex flex-col' : 'overflow-y-auto')}>
          {panel.content}
        </div>
        {panel.footer && isSideTop && (
          <div className="flex shrink-0 items-center justify-end gap-2 border-t border-border-subtle px-5 py-3">
            {panel.footer}
          </div>
        )}
      </div>
    </div>
  );
}

/** Container toàn cục cho ngăn xếp slide-panel — mount 1 lần ở AppLayout. Hỗ trợ cả panel
 * neo bên phải và panel neo bên trái để đối chiếu song song. */
export function SlidePanelStack({ sidebarWidth = 0 }: { sidebarWidth?: number }) {
  const { stack, bringToFront, closePanel } = useSlidePanel();
  const [mounted, setMounted] = useState(false);
  const [visible, setVisible] = useState(false);
  const open = stack.length > 0;
  const topPanel = stack[stack.length - 1] ?? null;
  const topId = topPanel?.id ?? null;

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

  const handleSafeClose = useCallback((id?: string) => {
    const targetId = id ?? (stack[stack.length - 1]?.id);
    const targetPanel = stack.find((p) => p.id === targetId) ?? stack[stack.length - 1];
    if (targetPanel) {
      if (targetPanel.onBeforeClose && targetPanel.onBeforeClose() === false) {
        return;
      }
      if (targetPanel.isDirty) {
        const confirmed = window.confirm('Dữ liệu biểu mẫu chưa được lưu. Bạn có chắc chắn muốn đóng và hủy bỏ các thay đổi?');
        if (!confirmed) return;
      }
    }
    closePanel(id);
  }, [stack, closePanel]);

  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSafeClose();
        return;
      }
      if (e.key === 'Tab') {
        const topPanelEl = document.querySelector('[role="dialog"][aria-modal="true"]');
        if (!topPanelEl) return;
        const focusables = topPanelEl.querySelectorAll<HTMLElement>(
          'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );
        if (focusables.length === 0) return;
        const firstEl = focusables[0];
        const lastEl = focusables[focusables.length - 1];

        if (e.shiftKey) {
          if (document.activeElement === firstEl) {
            e.preventDefault();
            lastEl.focus();
          }
        } else {
          if (document.activeElement === lastEl) {
            e.preventDefault();
            firstEl.focus();
          }
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, handleSafeClose]);

  useEffect(() => {
    if (!resizing) return;
    const topIndex = stack.length - 1;
    const maxCeiling =
      window.innerWidth - sidebarWidth - (window.innerWidth < 640 ? 0 : BASE_GAP);
    const minW = stack[topIndex]?.minWidth ?? MIN_PANEL_WIDTH;

    const onMove = (e: PointerEvent) => {
      if (topPanel?.side === 'left') {
        const targetWidth = e.clientX - sidebarWidth;
        const w = Math.min(maxCeiling, Math.max(minW, targetWidth));
        setDragWidth(w);
      } else {
        const targetWidth = window.innerWidth - e.clientX;
        const w = Math.min(maxCeiling, Math.max(minW, targetWidth));
        setDragWidth(w);
      }
    };
    const onUp = () => {
      setResizing(false);
      const isSplit = stack[topIndex]?.isSplitView;
      const key = isSplit ? 'slideover-split-view-width' : stack[topIndex]?.storageKey;
      if (key && dragWidthRef.current != null) {
        window.localStorage.setItem(key, String(dragWidthRef.current));
      }
      setDragWidth(null);
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
  }, [resizing, topPanel, sidebarWidth, stack]);

  if (!mounted) return null;

  const topIdRight = [...stack].reverse().find((p) => (p.side ?? 'right') === 'right')?.id ?? null;
  const topIdLeft = [...stack].reverse().find((p) => p.side === 'left')?.id ?? null;
  const hasLeftAndRight = !!topIdRight && !!topIdLeft;

  return (
    <div className="fixed inset-y-0 right-0 z-50 pointer-events-none" style={{ left: sidebarWidth }}>
      {/* Overlay vô hình khi đang kéo co giãn: ngăn chặn mọi thẻ iframe nuốt chuột và giữ col-resize mượt mà */}
      {resizing && (
        <div
          className="fixed inset-0 z-[99999] cursor-col-resize select-none pointer-events-auto bg-transparent"
          style={{ cursor: 'col-resize' }}
        />
      )}
      <div
        className={cn(
          'absolute inset-0 transition-opacity duration-200 pointer-events-auto',
          hasLeftAndRight ? 'bg-black/15' : 'bg-black/45 backdrop-blur-sm',
          visible ? 'opacity-100' : 'opacity-0',
        )}
        onMouseDown={() => handleSafeClose()}
      />
      {stack.map((panel, index) => {
        const isLeft = panel.side === 'left';
        const isSideTop = isLeft ? panel.id === topIdLeft : panel.id === topIdRight;
        const isTop = index === stack.length - 1;
        const shouldDim = !isSideTop;

        return (
          <PanelLayer
            key={panel.id}
            panel={panel}
            index={index}
            width={widths[index]}
            isTop={isTop}
            isSideTop={isSideTop}
            shouldDim={shouldDim}
            resizing={resizing && isTop}
            onClose={() => handleSafeClose(panel.id)}
            onBringToFront={() => bringToFront(panel.id)}
            onStartResize={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setDragWidth(widths[index]);
              setResizing(true);
            }}
          />
        );
      })}
    </div>
  );
}
