import { useEffect, type ReactNode } from 'react';
import { useSlidePanel } from '../context/SlidePanelContext';

/**
 * Khuôn dùng chung cho slide panel — trích từ mẫu đã chạy ổn ở HopDongPage để các
 * module khác không phải chép lại 3 effect giống nhau.
 *
 * Vì sao mỗi panel cần tới 2-3 effect:
 *  1. Mở/đóng theo cờ trạng thái của trang.
 *  2. Dựng lại nội dung mỗi khi dữ liệu/biểu mẫu đổi (ReactNode là ảnh chụp tĩnh,
 *     không tự cập nhật theo state của trang cha).
 *  3. Đồng bộ ngược: panel có thể bị đóng bằng tai thỏ/backdrop/Esc mà trang cha
 *     không biết — phải trả cờ về false, nếu không lần mở sau sẽ không có tác dụng.
 */

export interface SlidePanelFormOpts {
  id: string;
  /** Cờ trạng thái của trang: true = đang mở form. */
  open: boolean;
  title: string;
  subtitle?: string;
  /** Icon nhỏ hiển thị trên tai thỏ — mặc định dùng icon tài liệu chung nếu bỏ trống. */
  icon?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  storageKey?: string;
  /** Giá trị khiến nội dung panel phải dựng lại (form, saving, error...). */
  deps: unknown[];
  /** Gọi khi panel bị đóng ngoài luồng (tai thỏ/backdrop/Esc) để trang cha hạ cờ `open`. */
  onDongNgoaiLuong: () => void;
}

/** Panel biểu mẫu Thêm/Sửa — luôn nằm trên cùng, xếp chồng lên panel chi tiết nếu có. */
export function useSlidePanelForm(opts: SlidePanelFormOpts) {
  const { openPanel, closePanel, stack } = useSlidePanel();

  useEffect(() => {
    if (opts.open) {
      openPanel({
        id: opts.id,
        title: opts.title,
        subtitle: opts.subtitle,
        icon: opts.icon,
        defaultWidth: opts.defaultWidth,
        minWidth: opts.minWidth ?? 480,
        storageKey: opts.storageKey,
        content: opts.content,
        footer: opts.footer,
      });
    } else {
      closePanel(opts.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.open, ...opts.deps]);

  useEffect(() => {
    if (opts.open && !stack.some((p) => p.id === opts.id)) opts.onDongNgoaiLuong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack]);
}

export interface SlidePanelChiTietOpts {
  id: string;
  /** true khi đang có bản ghi được chọn để xem chi tiết. */
  active: boolean;
  title: string;
  subtitle?: string;
  /** Icon nhỏ hiển thị trên tai thỏ — mặc định dùng icon tài liệu chung nếu bỏ trống. */
  icon?: ReactNode;
  headerExtra?: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  storageKey?: string;
  deps: unknown[];
  onDongNgoaiLuong: () => void;
}

/**
 * Panel chi tiết — mở bằng openPanel lần đầu, các lần sau dùng updatePanel để **không**
 * kéo panel lên trên cùng (tránh nhảy lên trước panel biểu mẫu đang xếp chồng bên trên).
 */
export function useSlidePanelChiTiet(opts: SlidePanelChiTietOpts) {
  const { openPanel, updatePanel, closePanel, stack } = useSlidePanel();
  const dangMo = stack.some((p) => p.id === opts.id);

  useEffect(() => {
    if (!opts.active) {
      closePanel(opts.id);
      return;
    }
    const noiDung = {
      title: opts.title,
      subtitle: opts.subtitle,
      icon: opts.icon,
      headerExtra: opts.headerExtra,
      content: opts.content,
      footer: opts.footer,
    };
    if (dangMo) {
      updatePanel(opts.id, noiDung);
    } else {
      openPanel({
        id: opts.id,
        ...noiDung,
        defaultWidth: opts.defaultWidth,
        minWidth: opts.minWidth ?? 520,
        storageKey: opts.storageKey,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [opts.active, ...opts.deps]);

  useEffect(() => {
    if (opts.active && !dangMo) opts.onDongNgoaiLuong();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack]);
}
