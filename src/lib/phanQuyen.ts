import type { VaiTro } from '../context/AuthContext';

/**
 * Từ điển Tài nguyên × Hành động — Tầng 3 (RBAC cấu hình được).
 *
 * Bám đúng menu (`AppLayout.NAV_MENU`) và các tab hiện có trong từng trang, để
 * "menu/tab hiện ⇔ vào được" — không có tài nguyên nào đại diện cho hai khái niệm.
 * Nguồn sự thật là bảng CSDL `quyen_vai_tro_mac_dinh` / `quyen_nguoi_dung`
 * (đọc qua `fn_co_quyen()`); danh sách dưới đây chỉ để tra nhãn hiển thị và validate
 * ở tầng ứng dụng — KHÔNG hard-code quyền ở đây.
 *
 * Xem docs/phan-quyen-he-thong-ibst.md §4.
 */
export type TaiNguyen =
  | 'dashboard'
  | 'dashboard_tai_chinh'
  | 'hop_dong'
  | 'tai_chinh'
  | 'khach_hang'
  | 'dau_thau'
  | 'pvqlnn'
  | 'bao_cao_khkt'
  | 'de_tai'
  | 'tap_chi'
  | 'so_huu_tri_tue'
  | 'chuyen_giao'
  | 'co_cau_to_chuc'
  | 'don_vi'
  | 'nhan_su'
  | 'dao_tao_ncs'
  | 'dang_doan_the'
  | 'danh_gia'
  | 'mau_thu'
  | 'thiet_bi_las'
  | 'dau_tu_cong'
  | 'van_ban'
  | 'cong_viec'
  | 'ho_so_tai_lieu'
  | 'ai_rag'
  | 'lich_co_quan'
  | 'cai_dat'
  | 'phan_quyen'
  | 'nhat_ky';

export type HanhDong = 'xem' | 'them' | 'sua' | 'xoa' | 'duyet' | 'xuat';

export const HANH_DONG: HanhDong[] = ['xem', 'them', 'sua', 'xoa', 'duyet', 'xuat'];

export const NHAN_HANH_DONG: Record<HanhDong, string> = {
  xem: 'Xem',
  them: 'Thêm',
  sua: 'Sửa',
  xoa: 'Xóa',
  duyet: 'Trình / Duyệt',
  xuat: 'Xuất',
};

export const TAI_NGUYEN: TaiNguyen[] = [
  'dashboard',
  'dashboard_tai_chinh',
  'hop_dong',
  'tai_chinh',
  'khach_hang',
  'dau_thau',
  'pvqlnn',
  'bao_cao_khkt',
  'de_tai',
  'tap_chi',
  'so_huu_tri_tue',
  'chuyen_giao',
  'co_cau_to_chuc',
  'don_vi',
  'nhan_su',
  'dao_tao_ncs',
  'dang_doan_the',
  'danh_gia',
  'mau_thu',
  'thiet_bi_las',
  'dau_tu_cong',
  'van_ban',
  'cong_viec',
  'ho_so_tai_lieu',
  'ai_rag',
  'lich_co_quan',
  'cai_dat',
  'phan_quyen',
  'nhat_ky',
];

export const NHAN_TAI_NGUYEN: Record<TaiNguyen, string> = {
  dashboard: 'Dashboard Lãnh đạo',
  dashboard_tai_chinh: 'Dashboard — Chỉ số tài chính',
  hop_dong: 'Hợp đồng (QC 2815)',
  tai_chinh: 'Tài chính hợp đồng',
  khach_hang: 'Khách hàng / CRM',
  dau_thau: 'Đấu thầu',
  pvqlnn: 'Nhiệm vụ PVQLNN',
  bao_cao_khkt: 'Báo cáo & Ủy quyền (P.KHKT)',
  de_tai: 'Đề tài KHCN',
  tap_chi: 'Tạp chí KHCN',
  so_huu_tri_tue: 'Sở hữu trí tuệ',
  chuyen_giao: 'Chuyển giao công nghệ',
  co_cau_to_chuc: 'Cơ cấu tổ chức',
  don_vi: 'Đơn vị',
  nhan_su: 'Hồ sơ nhân sự',
  dao_tao_ncs: 'Đào tạo & NCS',
  dang_doan_the: 'Đảng - Đoàn thể',
  danh_gia: 'Đánh giá xếp loại',
  mau_thu: 'Mẫu thử nghiệm',
  thiet_bi_las: 'Thiết bị & LAS-XD',
  dau_tu_cong: 'Đầu tư công (thiết bị)',
  van_ban: 'Văn bản đến/đi',
  cong_viec: 'Giao việc / Công việc',
  ho_so_tai_lieu: 'Hồ sơ tài liệu',
  ai_rag: 'Trợ lý AI-RAG',
  lich_co_quan: 'Lịch cơ quan',
  cai_dat: 'Cài đặt hệ thống',
  phan_quyen: 'Quản trị phân quyền',
  nhat_ky: 'Nhật ký dữ liệu',
};

/**
 * Vai trò có phạm vi TOÀN VIỆN — bản sao DUY NHẤT ở tầng ứng dụng của
 * `fn_pham_vi_toan_vien()` (hiện alias `fn_phong_chuc_nang_cap_vien_tro_len()`,
 * migration 0027/0040). PHẢI sửa cùng lúc với hàm CSDL đó.
 *
 * ⚠️ Đây là bài học có thật từ dự án `cic-erp-contract`: từng có HAI định nghĩa
 * "phạm vi toàn công ty" chạy song song (một ở nav/header, một ở data-scope),
 * khiến cùng một người thấy hai phạm vi khác nhau tùy màn hình. Không lặp lại.
 */
const PHAM_VI_TOAN_VIEN_ROLES: VaiTro[] = [
  'quan-tri',
  'lanh-dao',
  'phong-khkt',
  'phong-tckt',
  'phong-tchc',
];

export function coPhamViToanVien(vaiTro: VaiTro | null | undefined): boolean {
  if (!vaiTro) return false;
  return PHAM_VI_TOAN_VIEN_ROLES.includes(vaiTro);
}

/**
 * Khuôn dùng chung để lọc TAB con trong một trang theo quyền — mỗi trang tự khai
 * `Record<TabId, TaiNguyen>` rồi gọi hàm này thay vì chép lại logic ẩn/hiện.
 *
 * Trong lúc đang nạp quyền (`dangTai === true`) luôn trả `true` để tránh nhấp nháy
 * ẩn tab rồi hiện lại — cùng nguyên tắc với `usePhanQuyen().can()` và menu sidebar
 * (`AppLayout.hienThiMucMenu`). Trang gọi hàm này PHẢI tự chuyển sang tab còn quyền
 * đầu tiên khi `dangTai` chuyển từ true sang false mà tab đang chọn bị ẩn.
 */
export function tabDuocPhep<TabId extends string>(
  tab: TabId,
  banDoTaiNguyen: Record<TabId, TaiNguyen>,
  can: (taiNguyen: TaiNguyen, hanhDong: HanhDong) => boolean,
  dangTai: boolean,
): boolean {
  if (dangTai) return true;
  return can(banDoTaiNguyen[tab], 'xem');
}
