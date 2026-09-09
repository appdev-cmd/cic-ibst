import type { TaiNguyen } from '../lib/phanQuyen';

/**
 * Bảng ánh xạ route → tài nguyên — Deny-by-default (Tầng 3, xem RouteGuard.tsx).
 *
 * Mỗi route được BẢO VỆ khai `taiNguyen`: một mảng vì nhiều trang gộp nhiều tab
 * ứng với nhiều tài nguyên khác nhau (VD `/hop-dong` gộp 6 tab). Vào được trang
 * nếu có quyền `xem` trên ÍT NHẤT MỘT tài nguyên trong mảng — bản thân trang tự
 * lọc tiếp tab nào hiển thị bằng `usePhanQuyen().can()`.
 *
 * Route KHÔNG có trong `ROUTE_PERMISSION_MAP` và KHÔNG có trong `PUBLIC_ROUTES`
 * ⇒ CHẶN theo mặc định (kể cả `quan-tri` không được miễn ở đây — RouteGuard xử lý
 * miễn trừ quan-tri riêng vì `fn_co_quyen`/`can()` đã tự bypass cho quan-tri).
 */
export interface RoutePermissionEntry {
  pattern: string;
  taiNguyen: TaiNguyen[];
  label: string;
}

/**
 * Route công khai với người đã đăng nhập: trang tĩnh, hoặc route chỉ để
 * `<Navigate>` chuyển hướng ngay (không render nội dung nghiệp vụ nào) — quyền
 * thật được kiểm ở route đích sau khi chuyển hướng.
 */
export const PUBLIC_ROUTES: string[] = [
  '/',
  '/ibst-portal',
  '/tai-chinh',
  '/dau-thau',
  '/pvqlnn',
  '/uy-quyen',
  '/don-vi',
  '/van-ban',
  '/cong-viec',
  '/de-tai',
  '/so-huu-tri-tue',
  '/ho-so-tai-lieu',
  '/dao-tao',
  '/khach-hang',
];

export const ROUTE_PERMISSION_MAP: RoutePermissionEntry[] = [
  { pattern: '/hop-dong', taiNguyen: ['hop_dong', 'tai_chinh', 'khach_hang', 'dau_thau', 'pvqlnn', 'bao_cao_khkt'], label: 'Hợp đồng, CRM & Tài chính' },
  { pattern: '/khoa-hoc', taiNguyen: ['de_tai', 'tap_chi', 'so_huu_tri_tue', 'chuyen_giao'], label: 'Quản lý Khoa học & SHTT' },
  { pattern: '/nhan-su', taiNguyen: ['co_cau_to_chuc', 'don_vi', 'nhan_su', 'dao_tao_ncs', 'dang_doan_the', 'danh_gia'], label: 'Tổ chức & Nhân sự' },
  { pattern: '/thi-nghiem', taiNguyen: ['mau_thu', 'thiet_bi_las', 'dau_tu_cong'], label: 'Thử nghiệm LIMS & Lab' },
  { pattern: '/e-office', taiNguyen: ['van_ban', 'cong_viec'], label: 'Văn phòng số e-Office' },
  { pattern: '/kho-luu-tru', taiNguyen: ['ho_so_tai_lieu', 'ai_rag'], label: 'Kho Lưu trữ & AI-RAG' },
  { pattern: '/lich-co-quan', taiNguyen: ['lich_co_quan'], label: 'Lịch cơ quan' },
  { pattern: '/cai-dat', taiNguyen: ['cai_dat', 'phan_quyen'], label: 'Cài đặt hệ thống' },
];

function patternToRegex(pattern: string): RegExp {
  const base = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return new RegExp(`^${base}(/.*)?$`);
}

export function getRoutePermission(pathname: string): RoutePermissionEntry | null {
  const sorted = [...ROUTE_PERMISSION_MAP].sort((a, b) => b.pattern.length - a.pattern.length);
  for (const entry of sorted) {
    if (patternToRegex(entry.pattern).test(pathname)) return entry;
  }
  return null;
}

export function isPublicRoute(pathname: string): boolean {
  return PUBLIC_ROUTES.some((p) => patternToRegex(p).test(pathname));
}
