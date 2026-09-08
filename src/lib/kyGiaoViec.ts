import type { VaiTro } from '../context/AuthContext';
import type { CapKy } from './qc2815';

/**
 * Luồng ký Quyết định giao việc — Điều 7.1c QC 2815, đủ 4 nhánh.
 *
 *  A · HĐ Viện ký thông thường
 *      Chủ trì soạn → Trưởng đơn vị ký xác nhận → P.KHKT thẩm tra → Lãnh đạo Viện phê duyệt
 *  B · HĐ kỹ thuật phức tạp / chính trị, pháp lý quan trọng (Đ.5.2b)
 *      P.KHKT đề xuất & soạn thảo → Viện trưởng ký duyệt
 *  C · HĐ đơn vị phân cấp ký
 *      Chủ trì soạn → Trưởng phòng/xưởng xác nhận → P.Tổng hợp thẩm tra → Trưởng đơn vị duyệt
 *  D · HĐ quản lý tập trung tại đơn vị (Đ.3.o)
 *      Trưởng đơn vị đề xuất nhân sự → Lãnh đạo Viện xem xét, ký quyết định
 *
 * Ma trận ở đây phải khớp trigger fn_kiem_soat_ky_giao_viec + hàm fn_nhanh_ky_giao_viec
 * (migration 0035). Giao diện chỉ để hướng dẫn; chốt chặn thật nằm ở CSDL.
 */
export type TrangThaiGiaoViec =
  | 'du-thao'
  | 'cho-don-vi-xac-nhan'
  | 'cho-khkt-tham-tra'
  | 'cho-lanh-dao-duyet'
  | 'da-duyet'
  | 'tra-lai';

export type NhanhKyGiaoViec = 'A' | 'B' | 'C' | 'D';

export interface BuocKy {
  id: TrangThaiGiaoViec;
  nhan: string;
  moTa: string;
}

export interface DacTaNhanh {
  ma: NhanhKyGiaoViec;
  ten: string;
  canCu: string;
}

export const DAC_TA_NHANH: Record<NhanhKyGiaoViec, DacTaNhanh> = {
  A: { ma: 'A', ten: 'HĐ Viện ký', canCu: 'Đ.7.1c — chủ trì soạn, Trưởng ĐV xác nhận, KHKT thẩm tra, Lãnh đạo Viện duyệt' },
  B: { ma: 'B', ten: 'HĐ phức tạp / chính trị', canCu: 'Đ.5.2b + Đ.7.1c — P.KHKT đề xuất & soạn thảo, Viện trưởng ký duyệt' },
  C: { ma: 'C', ten: 'HĐ đơn vị phân cấp ký', canCu: 'Đ.7.1c — chủ trì soạn, P.Tổng hợp thẩm tra, Trưởng đơn vị duyệt' },
  D: { ma: 'D', ten: 'HĐ quản lý tập trung', canCu: 'Đ.3.o + Đ.7.1c — Trưởng ĐV đề xuất nhân sự, Lãnh đạo Viện ký quyết định' },
};

/**
 * Chọn nhánh theo cờ nghiệp vụ của hợp đồng — khớp fn_nhanh_ky_giao_viec (0035).
 * Ưu tiên: B (thẩm quyền Viện trưởng) → D (mô hình tập trung) → C/A theo cấp ký.
 */
export function nhanhKyGiaoViec(opts: {
  capKy: CapKy | null | undefined;
  phucTap?: boolean;
  quanLyTapTrung?: boolean;
}): NhanhKyGiaoViec {
  if (opts.phucTap && opts.capKy !== 'don-vi-ky') return 'B';
  if (opts.quanLyTapTrung) return 'D';
  if (opts.capKy === 'don-vi-ky') return 'C';
  return 'A';
}

const LANH_DAO: VaiTro[] = ['quan-tri', 'lanh-dao'];
const TU_TRUONG_DON_VI: VaiTro[] = ['quan-tri', 'lanh-dao', 'truong-don-vi'];
/** Bước thẩm tra HĐ Viện ký — Đ.9.6c: P.KHKT (Lãnh đạo Viện/quản trị thao tác thay được). */
const THAM_TRA_VIEN_KY: VaiTro[] = ['quan-tri', 'lanh-dao', 'phong-khkt'];
/** Bước thẩm tra HĐ đơn vị ký — Đ.7.1c-4: P.Tổng hợp đơn vị; Trưởng đơn vị vẫn thao tác được. */
const THAM_TRA_DON_VI_KY: VaiTro[] = ['quan-tri', 'lanh-dao', 'truong-don-vi', 'phong-th-don-vi'];
const SOAN_THAO: VaiTro[] = ['quan-tri', 'lanh-dao', 'truong-don-vi', 'chuyen-vien'];

/** Các bước hiển thị trên thanh tiến trình của từng nhánh (không tính 'tra-lai'). */
export function cacBuocKy(nhanh: NhanhKyGiaoViec): BuocKy[] {
  switch (nhanh) {
    case 'B':
      return [
        { id: 'du-thao', nhan: '1. P.KHKT soạn', moTa: 'P.KHKT đề xuất & soạn thảo quyết định' },
        { id: 'cho-lanh-dao-duyet', nhan: '2. Chờ Viện trưởng', moTa: 'Trình Viện trưởng ký duyệt' },
        { id: 'da-duyet', nhan: '3. Đã duyệt', moTa: 'Có hiệu lực' },
      ];
    case 'D':
      return [
        { id: 'du-thao', nhan: '1. Trưởng ĐV đề xuất', moTa: 'Đề xuất nhân sự thực hiện' },
        { id: 'cho-lanh-dao-duyet', nhan: '2. Chờ Lãnh đạo Viện', moTa: 'Lãnh đạo Viện xem xét, ký quyết định' },
        { id: 'da-duyet', nhan: '3. Đã duyệt', moTa: 'Có hiệu lực' },
      ];
    case 'C':
      return [
        { id: 'du-thao', nhan: '1. Chủ trì soạn', moTa: 'Chủ trì HĐ lập phiếu' },
        { id: 'cho-don-vi-xac-nhan', nhan: '2. Phòng/xưởng xác nhận', moTa: 'Trưởng phòng/xưởng ký' },
        { id: 'cho-khkt-tham-tra', nhan: '3. P.Tổng hợp thẩm tra', moTa: 'P.Tổng hợp đơn vị thẩm tra' },
        { id: 'cho-lanh-dao-duyet', nhan: '4. Chờ Trưởng đơn vị', moTa: 'Trưởng đơn vị ký duyệt' },
        { id: 'da-duyet', nhan: '5. Đã duyệt', moTa: 'Có hiệu lực' },
      ];
    default:
      return [
        { id: 'du-thao', nhan: '1. Chủ trì soạn', moTa: 'Chủ trì HĐ lập phiếu' },
        { id: 'cho-don-vi-xac-nhan', nhan: '2. Đơn vị xác nhận', moTa: 'Trưởng đơn vị ký' },
        { id: 'cho-khkt-tham-tra', nhan: '3. KHKT thẩm tra', moTa: 'P.KHKT thẩm tra (Đ.9.6c)' },
        { id: 'cho-lanh-dao-duyet', nhan: '4. Chờ phê duyệt', moTa: 'Lãnh đạo Viện' },
        { id: 'da-duyet', nhan: '5. Đã duyệt', moTa: 'Có hiệu lực' },
      ];
  }
}

export const NHAN_TRANG_THAI_GIAO_VIEC: Record<TrangThaiGiaoViec, string> = {
  'du-thao': 'Dự thảo',
  'cho-don-vi-xac-nhan': 'Chờ Trưởng đơn vị xác nhận',
  'cho-khkt-tham-tra': 'Chờ thẩm tra',
  'cho-lanh-dao-duyet': 'Chờ phê duyệt',
  'da-duyet': 'Đã phê duyệt',
  'tra-lai': 'Bị trả lại',
};

/** Bước kế tiếp hợp lệ và ai được thực hiện, theo nhánh Đ.7.1c. */
export function buocKeTiep(
  hienTai: TrangThaiGiaoViec,
  nhanh: NhanhKyGiaoViec,
): { den: TrangThaiGiaoViec; nhanNut: string; vaiTroChoPhep: VaiTro[] } | null {
  if (hienTai === 'da-duyet') return null;

  // Nhánh rút gọn B/D: soạn xong trình thẳng cấp ký quyết định.
  if (nhanh === 'B' || nhanh === 'D') {
    if (hienTai === 'du-thao' || hienTai === 'tra-lai') {
      return nhanh === 'B'
        ? { den: 'cho-lanh-dao-duyet', nhanNut: 'P.KHKT trình Viện trưởng', vaiTroChoPhep: THAM_TRA_VIEN_KY }
        : { den: 'cho-lanh-dao-duyet', nhanNut: 'Trưởng ĐV trình Lãnh đạo Viện', vaiTroChoPhep: TU_TRUONG_DON_VI };
    }
    // Phiếu cũ đang nằm ở bước trung gian của nhánh 4 bước (đổi cờ giữa chừng) → đẩy tiếp về bước duyệt.
    if (hienTai === 'cho-don-vi-xac-nhan' || hienTai === 'cho-khkt-tham-tra') {
      return {
        den: 'cho-lanh-dao-duyet',
        nhanNut: 'Chuyển trình cấp phê duyệt',
        vaiTroChoPhep: nhanh === 'B' ? THAM_TRA_VIEN_KY : TU_TRUONG_DON_VI,
      };
    }
    return {
      den: 'da-duyet',
      nhanNut: nhanh === 'B' ? 'Viện trưởng ký duyệt' : 'Lãnh đạo Viện ký quyết định',
      vaiTroChoPhep: LANH_DAO,
    };
  }

  // Nhánh đủ 4 bước: A (Viện ký) và C (đơn vị ký).
  const donViKy = nhanh === 'C';
  switch (hienTai) {
    case 'du-thao':
    case 'tra-lai':
      return {
        den: 'cho-don-vi-xac-nhan',
        nhanNut: donViKy ? 'Trình Trưởng phòng/xưởng' : 'Trình Trưởng đơn vị',
        vaiTroChoPhep: SOAN_THAO,
      };
    case 'cho-don-vi-xac-nhan':
      return {
        den: 'cho-khkt-tham-tra',
        nhanNut: donViKy ? 'Phòng/xưởng xác nhận' : 'Trưởng đơn vị xác nhận',
        vaiTroChoPhep: TU_TRUONG_DON_VI,
      };
    case 'cho-khkt-tham-tra':
      return donViKy
        ? { den: 'cho-lanh-dao-duyet', nhanNut: 'P.Tổng hợp thẩm tra đạt', vaiTroChoPhep: THAM_TRA_DON_VI_KY }
        : { den: 'cho-lanh-dao-duyet', nhanNut: 'KHKT thẩm tra đạt', vaiTroChoPhep: THAM_TRA_VIEN_KY };
    case 'cho-lanh-dao-duyet':
      return {
        den: 'da-duyet',
        nhanNut: donViKy ? 'Trưởng đơn vị phê duyệt' : 'Lãnh đạo Viện phê duyệt',
        vaiTroChoPhep: donViKy ? TU_TRUONG_DON_VI : LANH_DAO,
      };
    default:
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
