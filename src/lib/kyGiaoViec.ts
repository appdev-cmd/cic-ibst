import type { VaiTro } from '../context/AuthContext';
import type { CapKy } from './qc2815';

/**
 * Luồng ký Quyết định giao việc — Điều 7.1c QC 2815.
 *
 *  HĐ Viện ký:    Chủ trì soạn → Trưởng đơn vị ký xác nhận → KHKT thẩm tra
 *                 → Lãnh đạo Viện phê duyệt
 *  HĐ đơn vị ký:  Chủ trì soạn → Trưởng phòng/xưởng xác nhận → Phòng Tổng hợp thẩm tra
 *                 → Trưởng đơn vị ký duyệt
 *
 * Từ migration 0022, bước thẩm tra đã tách riêng theo cấp ký hợp đồng:
 *   HĐ Viện ký   → vai trò `phong-khkt` thẩm tra (Đ.9.6c);
 *   HĐ đơn vị ký → vai trò `phong-th-don-vi` thẩm tra (Đ.7.1c-4), Trưởng đơn vị vẫn
 *                  được thao tác ở đơn vị chưa bố trí P.Tổng hợp riêng.
 * Ma trận ở đây phải khớp trigger fn_kiem_soat_ky_giao_viec (migration 0022).
 */
export type TrangThaiGiaoViec =
  | 'du-thao'
  | 'cho-don-vi-xac-nhan'
  | 'cho-khkt-tham-tra'
  | 'cho-lanh-dao-duyet'
  | 'da-duyet'
  | 'tra-lai';

export interface BuocKy {
  id: TrangThaiGiaoViec;
  nhan: string;
  moTa: string;
}

/** 4 bước hiển thị trên thanh tiến trình (không tính 'tra-lai'). */
export const CAC_BUOC_KY: BuocKy[] = [
  { id: 'du-thao', nhan: '1. Chủ trì soạn', moTa: 'Chủ trì HĐ lập phiếu' },
  { id: 'cho-don-vi-xac-nhan', nhan: '2. Đơn vị xác nhận', moTa: 'Trưởng đơn vị ký' },
  { id: 'cho-khkt-tham-tra', nhan: '3. Thẩm tra', moTa: 'P.KHKT (Viện ký) / P.TH đơn vị (ĐV ký)' },
  { id: 'cho-lanh-dao-duyet', nhan: '4. Chờ phê duyệt', moTa: 'Lãnh đạo Viện' },
  { id: 'da-duyet', nhan: '5. Đã duyệt', moTa: 'Có hiệu lực' },
];

export const NHAN_TRANG_THAI_GIAO_VIEC: Record<TrangThaiGiaoViec, string> = {
  'du-thao': 'Dự thảo',
  'cho-don-vi-xac-nhan': 'Chờ Trưởng đơn vị xác nhận',
  'cho-khkt-tham-tra': 'Chờ KHKT thẩm tra',
  'cho-lanh-dao-duyet': 'Chờ Lãnh đạo Viện duyệt',
  'da-duyet': 'Đã phê duyệt',
  'tra-lai': 'Bị trả lại',
};

const LANH_DAO: VaiTro[] = ['quan-tri', 'lanh-dao'];
const TU_TRUONG_DON_VI: VaiTro[] = ['quan-tri', 'lanh-dao', 'truong-don-vi'];
/** Bước thẩm tra HĐ Viện ký — Đ.9.6c: P.KHKT (Lãnh đạo Viện/quản trị thao tác thay được). */
const THAM_TRA_VIEN_KY: VaiTro[] = ['quan-tri', 'lanh-dao', 'phong-khkt'];
/** Bước thẩm tra HĐ đơn vị ký — Đ.7.1c-4: P.Tổng hợp đơn vị; Trưởng đơn vị vẫn thao tác được. */
const THAM_TRA_DON_VI_KY: VaiTro[] = ['quan-tri', 'lanh-dao', 'truong-don-vi', 'phong-th-don-vi'];

/** Bước kế tiếp hợp lệ và ai được thực hiện. `capKy` quyết định ai duyệt bước cuối. */
export function buocKeTiep(
  hienTai: TrangThaiGiaoViec,
  capKy: CapKy | null | undefined,
): { den: TrangThaiGiaoViec; nhanNut: string; vaiTroChoPhep: VaiTro[] } | null {
  switch (hienTai) {
    case 'du-thao':
    case 'tra-lai':
      return {
        den: 'cho-don-vi-xac-nhan',
        nhanNut: 'Trình Trưởng đơn vị',
        vaiTroChoPhep: ['quan-tri', 'lanh-dao', 'truong-don-vi', 'chuyen-vien'],
      };
    case 'cho-don-vi-xac-nhan':
      return { den: 'cho-khkt-tham-tra', nhanNut: 'Trưởng đơn vị xác nhận', vaiTroChoPhep: TU_TRUONG_DON_VI };
    case 'cho-khkt-tham-tra':
      return capKy === 'don-vi-ky'
        ? { den: 'cho-lanh-dao-duyet', nhanNut: 'P.Tổng hợp thẩm tra đạt', vaiTroChoPhep: THAM_TRA_DON_VI_KY }
        : { den: 'cho-lanh-dao-duyet', nhanNut: 'KHKT thẩm tra đạt', vaiTroChoPhep: THAM_TRA_VIEN_KY };
    case 'cho-lanh-dao-duyet':
      return {
        den: 'da-duyet',
        nhanNut: capKy === 'don-vi-ky' ? 'Trưởng đơn vị phê duyệt' : 'Lãnh đạo Viện phê duyệt',
        vaiTroChoPhep: capKy === 'don-vi-ky' ? TU_TRUONG_DON_VI : LANH_DAO,
      };
    case 'da-duyet':
      return null;
  }
}

/** Được phép trả lại phiếu để sửa ở mọi bước trung gian (chưa duyệt xong). */
export function coTheTraLai(hienTai: TrangThaiGiaoViec, vaiTro: VaiTro): boolean {
  const dangXuLy =
    hienTai === 'cho-don-vi-xac-nhan' ||
    hienTai === 'cho-khkt-tham-tra' ||
    hienTai === 'cho-lanh-dao-duyet';
  return (
    dangXuLy &&
    (TU_TRUONG_DON_VI.includes(vaiTro) || vaiTro === 'phong-khkt' || vaiTro === 'phong-th-don-vi')
  );
}

export function mauTrangThaiGiaoViec(tt: TrangThaiGiaoViec): string {
  switch (tt) {
    case 'da-duyet':
      return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300';
    case 'tra-lai':
      return 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300';
    case 'du-thao':
      return 'bg-muted text-ink-secondary';
    default:
      return 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300';
  }
}
