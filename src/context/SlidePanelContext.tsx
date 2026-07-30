import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

export interface SlidePanelEntry {
  id: string;
  title: ReactNode;
  subtitle?: ReactNode;
  /** Icon nhỏ hiển thị trên tai thỏ — mặc định dùng icon tài liệu chung nếu bỏ trống. */
  icon?: ReactNode;
  headerExtra?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  /** Key localStorage để nhớ chiều rộng đã kéo — bỏ trống thì không nhớ. */
  storageKey?: string;
}

export type SlidePanelOpenInput = Omit<SlidePanelEntry, 'id'> & { id?: string };

interface SlidePanelContextValue {
  /** stack[stack.length - 1] luôn là panel đang hiển thị đầy đủ (trên cùng); các panel
   * còn lại vẫn tồn tại trong DOM, chỉ thu gọn thành "tai thỏ" — không bị đóng. */
  stack: SlidePanelEntry[];
  /** Mở panel mới lên trên cùng; nếu id đã tồn tại thì cập nhật nội dung và đưa lên trên
   * cùng (không đóng các panel khác). Trả về id thực tế dùng. */
  openPanel: (entry: SlidePanelOpenInput) => string;
  /** Cập nhật tại chỗ nội dung panel `id` (không đổi vị trí) — an toàn dùng trong effect
   * đồng bộ dữ liệu; không làm gì nếu panel không còn trong ngăn xếp. */
  updatePanel: (id: string, patch: Partial<Omit<SlidePanelEntry, 'id'>>) => void;
  /** Đưa panel đã có trong ngăn xếp lên trên cùng (bấm vào tai thỏ) — không đóng gì cả. */
  bringToFront: (id: string) => void;
  /** Đóng đúng 1 panel (mặc định panel trên cùng) — không ảnh hưởng các panel khác. */
  closePanel: (id?: string) => void;
  closeAll: () => void;
}

const SlidePanelContext = createContext<SlidePanelContextValue | null>(null);

let autoId = 0;

export function SlidePanelProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<SlidePanelEntry[]>([]);

  const openPanel = useCallback((entry: SlidePanelOpenInput) => {
    const id = entry.id ?? `panel-${++autoId}`;
    setStack((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx !== -1) {
        const merged = { ...prev[idx], ...entry, id };
        return [...prev.slice(0, idx), ...prev.slice(idx + 1), merged];
      }
      return [...prev, { ...entry, id }];
    });
    return id;
  }, []);

  const updatePanel = useCallback((id: string, patch: Partial<Omit<SlidePanelEntry, 'id'>>) => {
    setStack((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1) return prev;
      const next = [...prev];
      next[idx] = { ...next[idx], ...patch };
      return next;
    });
  }, []);

  const bringToFront = useCallback((id: string) => {
    setStack((prev) => {
      const idx = prev.findIndex((p) => p.id === id);
      if (idx === -1 || idx === prev.length - 1) return prev;
      const item = prev[idx];
      return [...prev.slice(0, idx), ...prev.slice(idx + 1), item];
    });
  }, []);

  const closePanel = useCallback((id?: string) => {
    setStack((prev) => {
      if (!id) return prev.slice(0, -1);
      return prev.filter((p) => p.id !== id);
    });
  }, []);

  const closeAll = useCallback(() => setStack([]), []);

  const value = useMemo(
    () => ({ stack, openPanel, updatePanel, bringToFront, closePanel, closeAll }),
    [stack, openPanel, updatePanel, bringToFront, closePanel, closeAll],
  );

  return <SlidePanelContext.Provider value={value}>{children}</SlidePanelContext.Provider>;
}

export function useSlidePanel() {
  const ctx = useContext(SlidePanelContext);
  if (!ctx) throw new Error('useSlidePanel phải được gọi bên trong SlidePanelProvider');
  return ctx;
}
