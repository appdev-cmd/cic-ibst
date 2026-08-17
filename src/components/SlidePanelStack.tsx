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
  return Number.isFinite(saved) && saved > 0 ? saved : null;
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
  let ceiling = innerWidth - (viewportWidth < 640 ? 0 : BASE_GAP);
  stack.forEach((panel, i) => {
    const isTop = i === stack.length - 1;
    const saved = readSavedWidth(panel.storageKey);
    let natural: number;
    if (isTop && topDragWidth != null) {
      natural = topDragWidth; // đang kéo tay panel trên cùng
    } else if (saved != null) {
      natural = saved; // đã từng tự kéo chỉnh riêng panel này trước đó
    } else if (i === 0) {
      natural = panel.defaultWidth ?? 880; // panel đầu tiên: dùng kích thước tự nhiên
    } else {
      natural = ceiling; // panel sau: mặc định bám sát mép panel liền trước
    }
    const minimum = Math.min(panel.minWidth ?? MIN_PANEL_WIDTH, ceiling);
    const w = Math.max(minimum, Math.min(natural, ceiling));
    widths.push(w);
    ceiling = w - STACKING_OFFSET;
  });
  return widths;
}

function PanelLayer({
  panel,
  index,
  width,
  isTop,
  onClose,
  onBringToFront,
  onStartResize,
}: {
  panel: SlidePanelEntry;
  index: number;
  width: number;
  isTop: boolean;
  onClose: () => void;
  onBringToFront: () => void;
  onStartResize: (e: React.MouseEvent) => void;
}) {
  const title = typeof panel.title === 'string' ? panel.title : '';
  const tabTop = TAB_TOP_START + index * (TAB_LENGTH + TAB_GAP);

  return (
    <div className="absolute inset-0 flex justify-end" style={{ zIndex: 50 + index }}>
      {isTop && (
        <div
          onMouseDown={onStartResize}
          title="Kéo để thay đổi chiều rộng"
          className="absolute top-0 bottom-0 z-20 w-3 cursor-col-resize touch-none select-none"
          style={{ right: width - 6 }}
        >
          <div className="mx-auto h-full w-px bg-border-subtle transition-colors hover:w-1 hover:bg-primary/60" />
        </div>
      )}
      <div
        style={{ width }}
        className={cn(
          'relative flex h-full flex-col bg-surface shadow-2xl pointer-events-auto',
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
    const ceiling =
      topIndex <= 0
        ? window.innerWidth - sidebarWidth - (window.innerWidth < 640 ? 0 : BASE_GAP)
        : widths[topIndex - 1] - STACKING_OFFSET;
    const minW = stack[topIndex]?.minWidth ?? MIN_PANEL_WIDTH;
    const onMove = (e: MouseEvent) => {
      const w = Math.min(ceiling, Math.max(minW, window.innerWidth - e.clientX));
      setDragWidth(w);
    };
    const onUp = () => {
      setResizing(false);
      const key = stack[topIndex]?.storageKey;
      if (key && dragWidthRef.current != null) {
        window.localStorage.setItem(key, String(dragWidthRef.current));
      }
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    const prevCursor = document.body.style.cursor;
    const prevSelect = document.body.style.userSelect;
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
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
