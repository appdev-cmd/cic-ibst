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
  '/hop-dong',
  '/tai-chinh',
  '/dau-thau',
  '/uy-quyen',
  '/don-vi',
  '/van-ban',
  '/cong-viec',
  '/de-tai',
  '/so-huu-tri-tue',
  '/ho-so-tai-lieu',
  '/dao-tao',
  '/khach-hang',
  '/lich-co-quan',
];

export const ROUTE_PERMISSION_MAP: RoutePermissionEntry[] = [
  { pattern: '/dang-vu', taiNguyen: ['dang_doan_the'], label: 'Công tác Đảng vụ' },
  { pattern: '/pvqlnn', taiNguyen: ['pvqlnn'], label: 'Nhiệm vụ Phục vụ QLNN' },
  { pattern: '/tu-van-dvkt', taiNguyen: ['hop_dong', 'khach_hang', 'dau_thau', 'bao_cao_khkt'], label: 'Công tác tư vấn DVKT' },
  { pattern: '/tckt', taiNguyen: ['tai_chinh'], label: 'Công tác TCKT' },
  { pattern: '/cong-doan', taiNguyen: ['dang_doan_the'], label: 'Công tác Công đoàn, Đoàn TN' },
  { pattern: '/hop-dong', taiNguyen: ['hop_dong', 'tai_chinh', 'khach_hang', 'dau_thau', 'pvqlnn', 'bao_cao_khkt'], label: 'Hợp đồng, CRM & Tài chính' },
  { pattern: '/khoa-hoc', taiNguyen: ['de_tai', 'tap_chi', 'so_huu_tri_tue', 'chuyen_giao'], label: 'Nhiệm vụ KHCN, đề tài' },
  { pattern: '/nhan-su', taiNguyen: ['co_cau_to_chuc', 'don_vi', 'nhan_su', 'dao_tao_ncs', 'danh_gia'], label: 'Tổ chức & Nhân sự' },
  { pattern: '/thi-nghiem', taiNguyen: ['mau_thu', 'thiet_bi_las', 'dau_tu_cong'], label: 'Công tác thí nghiệm, thử nghiệm' },
  { pattern: '/e-office', taiNguyen: ['van_ban', 'cong_viec'], label: 'Văn phòng số e-Office' },
  { pattern: '/kho-luu-tru', taiNguyen: ['ho_so_tai_lieu', 'ai_rag'], label: 'Kho lưu trữ & AI-RAG' },
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
