import { type ReactNode } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Lock } from 'lucide-react';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { getRoutePermission, isPublicRoute } from '../routes/quyenTruyCap';
import { NHAN_TAI_NGUYEN } from '../lib/phanQuyen';

const SKIP_PERM = import.meta.env.DEV && import.meta.env.VITE_SKIP_PERM === 'true';

/**
 * Chốt chặn route theo Tài nguyên — Deny-by-default (Tầng 3).
 *
 * Bọc `<Outlet/>` trong AppLayout. Với mỗi lần điều hướng:
 * 1. Route công khai (PUBLIC_ROUTES) → cho qua.
 * 2. Đang nạp quyền → không chặn, không hiện nội dung (tránh nhấp nháy "từ chối"
 *    rồi mới cho vào — usePhanQuyen().can() cố ý trả false lúc đang tải).
 * 3. Route đã khai báo trong ROUTE_PERMISSION_MAP → cho qua nếu có quyền `xem`
 *    trên ÍT NHẤT MỘT tài nguyên của route đó.
 * 4. Route chưa khai báo (kể cả gõ URL không tồn tại trong map) → CHẶN.
 *
 * ⚠️ KHÔNG có cờ bỏ qua kiểm tra theo hostname `localhost` (khác với cách làm ở
 * dự án cic-erp-contract) — nếu cần tắt lúc dev, dùng `VITE_SKIP_PERM=true` khai
 * báo tường minh trong `.env`, mặc định TẮT. Xem docs/phan-quyen-he-thong-ibst.md §8.
 */
export function RouteGuard({ children }: { children: ReactNode }) {
  const location = useLocation();
  const { can, dangTai } = usePhanQuyen();
  const pathname = location.pathname;

  if (SKIP_PERM) return <>{children}</>;
  if (isPublicRoute(pathname)) return <>{children}</>;
  if (dangTai) return null;

  const entry = getRoutePermission(pathname);
  if (!entry) {
    return <TuChoiTruyCap lyDo="chua-dang-ky" pathname={pathname} />;
  }

  const coQuyen = entry.taiNguyen.some((tn) => can(tn, 'xem'));
  if (!coQuyen) {
    return <TuChoiTruyCap lyDo="khong-du-quyen" nhanModule={entry.label} />;
  }

  return <>{children}</>;
}

function TuChoiTruyCap({
  lyDo,
  nhanModule,
  pathname,
}: {
  lyDo: 'chua-dang-ky' | 'khong-du-quyen';
  nhanModule?: string;
  pathname?: string;
}) {
  const navigate = useNavigate();
  const laChuaDangKy = lyDo === 'chua-dang-ky';

  return (
    <div className="flex min-h-[70vh] flex-col items-center justify-center p-4">
      <div className="card w-full max-w-md p-8 text-center">
        <div
          className={
            'mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full ' +
            (laChuaDangKy
              ? 'bg-amber-100 dark:bg-amber-900/30'
              : 'bg-danger-subtle')
          }
        >
          {laChuaDangKy ? (
            <Lock size={30} className="text-amber-600 dark:text-amber-400" />
          ) : (
            <ShieldAlert size={30} className="text-danger" />
          )}
        </div>
        <h2 className="mb-2 text-lg font-black text-ink">
          {laChuaDangKy ? 'Trang không khả dụng' : 'Truy cập bị từ chối'}
        </h2>
        <p className="mb-4 text-sm text-ink-muted">
          {laChuaDangKy
            ? 'Địa chỉ này chưa được đăng ký trong hệ thống phân quyền. Vui lòng liên hệ Quản trị hệ thống.'
            : 'Tài khoản của bạn không được cấp quyền truy cập vào phân hệ này. Vui lòng liên hệ Quản trị hệ thống nếu cần cấp thêm quyền.'}
        </p>
        {nhanModule && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-muted px-3 py-1.5 text-xs font-bold text-ink-secondary">
            <Lock size={12} /> {nhanModule}
          </div>
        )}
        {pathname && laChuaDangKy && (
          <div className="mb-6 inline-flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-1.5 font-mono text-2xs text-amber-700 dark:bg-amber-900/20 dark:text-amber-400">
            <Lock size={12} /> {pathname}
          </div>
        )}
        <div className="flex flex-col gap-2">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center justify-center gap-2 rounded-xl border border-border px-4 py-2.5 text-sm font-bold text-ink-secondary transition-colors hover:bg-muted"
          >
            <ArrowLeft size={16} /> Quay lại trang trước
          </button>
          <button onClick={() => navigate('/')} className="btn-primary justify-center">
            Về Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}

// Xuất lại để các trang lọc tab dùng chung nhãn tài nguyên nếu cần hiển thị lý do ẩn.
export { NHAN_TAI_NGUYEN };
