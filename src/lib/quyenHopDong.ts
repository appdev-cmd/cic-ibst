import type { VaiTro } from '../context/AuthContext';
import type { CapKy } from './qc2815';

/**
 * Ma trận thẩm quyền thao tác trên hợp đồng, bám theo Điều 6, 9, 11 Quy chế 2815/QĐ-VKH.
 *
 * LƯU Ý: đây chỉ là lớp chặn phía giao diện để người dùng không thấy nút vượt thẩm quyền.
 * Chốt chặn thật sự phải là RLS/policy phía Supabase — giao diện luôn có thể bị bỏ qua.
 */

/**
 * Điều 6.1 — Trình hồ sơ lên Viện trưởng: chủ trì HĐ soạn, Trưởng đơn vị xác nhận rồi trình.
 * P.KHKT cũng được trình vì là đầu mối xây dựng HĐ phức tạp/Bộ giao (Đ.5.2b).
 */
export function coTheTrinhDuyet(vaiTro: VaiTro): boolean {
  return (
    vaiTro === 'quan-tri' ||
    vaiTro === 'lanh-dao' ||
    vaiTro === 'truong-don-vi' ||
    vaiTro === 'chuyen-vien' ||
    vaiTro === 'phong-khkt'
  );
}

/**
 * Điều 6.1 — Phê duyệt hợp đồng vượt hạn mức: thẩm quyền của Viện trưởng, hoặc Phó Viện
 * trưởng theo ủy quyền. Trưởng đơn vị và chuyên viên KHÔNG được tự xác nhận đã duyệt.
 */
export function coThePheDuyet(vaiTro: VaiTro): boolean {
  return vaiTro === 'quan-tri' || vaiTro === 'lanh-dao';
}

/**
 * Điều 11 — Quyết toán, thanh lý hợp đồng:
 *  - Điều 11.1, HĐ Viện ký: TCKT trình Lãnh đạo Viện ký duyệt bản phân phối quyết toán —
 *    Trưởng đơn vị KHÔNG có thẩm quyền tự quyết toán loại HĐ này. P.TCKT là đầu mối
 *    thống nhất quản lý quyết toán toàn Viện (Đ.11.4) nên được ghi nhận trạng thái.
 *  - Điều 11.2, HĐ đơn vị ký: Viện trưởng phân công Trưởng đơn vị ký duyệt tờ phân phối;
 *    Phụ trách kế toán đơn vị làm thủ tục thanh quyết toán (Đ.11.1).
 * `capKy` không xác định (hợp đồng cũ/chưa gán) tạm coi như HĐ Viện ký (chặt hơn, an toàn hơn).
 * Ma trận này phải khớp với trigger fn_kiem_soat_tham_quyen_hop_dong (migration 0022).
 */
export function coTheQuyetToan(vaiTro: VaiTro, capKy: CapKy | null | undefined): boolean {
  if (vaiTro === 'quan-tri' || vaiTro === 'lanh-dao' || vaiTro === 'phong-tckt') return true;
  if (vaiTro === 'truong-don-vi' || vaiTro === 'phu-trach-ke-toan-dv') return capKy === 'don-vi-ky';
  return false;
}

export const NHAN_VAI_TRO: Record<VaiTro, string> = {
  'quan-tri': 'Quản trị hệ thống',
  'lanh-dao': 'Lãnh đạo Viện',
  'truong-don-vi': 'Trưởng đơn vị',
  'chuyen-vien': 'Chuyên viên',
  'phong-khkt': 'Phòng Kế hoạch – Kỹ thuật',
  'phong-tckt': 'Phòng Tài chính – Kế toán',
  'phong-tchc': 'Phòng Tổ chức – Hành chính',
  'phong-th-don-vi': 'Phòng Tổng hợp đơn vị',
  'phu-trach-ke-toan-dv': 'Phụ trách kế toán đơn vị',
};

/** Câu giải thích hiện khi nút bị ẩn/khóa, để người dùng hiểu vì sao không thao tác được. */
export function lyDoKhongDuThamQuyen(vaiTro: VaiTro, thaoTac: string): string {
  return `${NHAN_VAI_TRO[vaiTro]} không có thẩm quyền ${thaoTac} theo Quy chế 2815.`;
}
