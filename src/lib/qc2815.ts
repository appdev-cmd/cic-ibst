// Bảng 1 — Định mức giao kinh phí thực hiện HĐKT
// (Kèm theo Quy chế 2815/QĐ-VKH ngày 01/12/2025, hiệu lực 01/01/2026)

export type NhomHD =
  | 'N1A' | 'N1B'
  | 'N2A' | 'N2B' | 'N2C' | 'N2D' | 'N2E' | 'N2F' | 'N2G'
  | 'N3'
  | 'N4';

export interface DinhMucHD {
  id: NhomHD;
  nhom: 1 | 2 | 3 | 4;
  nhomLabel: string;
  ten: string;
  /** % — null nghĩa là "thanh toán theo nguyên tắc thực thanh, thực chi" (N1b) */
  chuTri: number | null;
  donVi: number | null;
  tongGiaoDonVi: number | null;
  cpqlLnChiKhac: number | null;
  khtscd: number | null;
  /** % thuế GTGT */
  thueGtgt: number | null;
  /** Ngưỡng trình Viện trưởng phê duyệt (Điều 6.1) — triệu đồng; null = không quy định ngưỡng riêng */
  nguongTrinhVienTruong: number | null;
}

export const BANG_1: DinhMucHD[] = [
  {
    id: 'N1A', nhom: 1, nhomLabel: 'Nhóm 1', ten: 'N1a. Giám định xây dựng, kiểm định đánh giá sự cố theo yêu cầu của cơ quan chức năng',
    chuTri: 89, donVi: 7, tongGiaoDonVi: 96, cpqlLnChiKhac: 2, khtscd: 2, thueGtgt: 10,
    nguongTrinhVienTruong: 2000,
  },
  {
    id: 'N1B', nhom: 1, nhomLabel: 'Nhóm 1', ten: 'N1b. Nhiệm vụ phục vụ công tác QLNN theo yêu cầu của Bộ, Ngành có kinh phí cấp trực tiếp',
    chuTri: null, donVi: null, tongGiaoDonVi: null, cpqlLnChiKhac: null, khtscd: 0, thueGtgt: 0,
    nguongTrinhVienTruong: null,
  },
  {
    id: 'N2A', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2a. Tư vấn quản lý dự án, tư vấn đầu tư xây dựng, chuyển giao công nghệ',
    chuTri: 78, donVi: 13, tongGiaoDonVi: 91, cpqlLnChiKhac: 7, khtscd: 2, thueGtgt: 10,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N2B', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2b. Chứng nhận hợp chuẩn hợp quy, hiệu chuẩn thiết bị',
    chuTri: 72, donVi: 13, tongGiaoDonVi: 85, cpqlLnChiKhac: 13, khtscd: 2, thueGtgt: 5,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N2C', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2c. Tập huấn, đào tạo',
    chuTri: 70, donVi: 15, tongGiaoDonVi: 85, cpqlLnChiKhac: 13, khtscd: 2, thueGtgt: null,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N2D', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2d. Khảo sát xây dựng, kiểm định chất lượng công trình, quan trắc, trắc đạc công trình, thí nghiệm hiện trường',
    chuTri: 77, donVi: 10, tongGiaoDonVi: 87, cpqlLnChiKhac: 8, khtscd: 5, thueGtgt: 10,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N2E', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2e. Thí nghiệm vật liệu tại phòng TN hiện trường, thí nghiệm cấu kiện trong phòng',
    chuTri: 72, donVi: 10, tongGiaoDonVi: 82, cpqlLnChiKhac: 8, khtscd: 10, thueGtgt: 10,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N2F', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2f. Thí nghiệm vật liệu trong phòng',
    chuTri: 59, donVi: 15, tongGiaoDonVi: 74, cpqlLnChiKhac: 16, khtscd: 10, thueGtgt: 10,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N2G', nhom: 2, nhomLabel: 'Nhóm 2', ten: 'N2g. Thí nghiệm đặc thù (chịu lửa, hệ bao che, ống thoát khí động, động đất...)',
    chuTri: 81, donVi: 10, tongGiaoDonVi: 91, cpqlLnChiKhac: 6, khtscd: 3, thueGtgt: 10,
    nguongTrinhVienTruong: 5000,
  },
  {
    id: 'N3', nhom: 3, nhomLabel: 'Nhóm 3', ten: 'N3. Thi công xây dựng',
    chuTri: 89, donVi: 6, tongGiaoDonVi: 95, cpqlLnChiKhac: 4.5, khtscd: 0.5, thueGtgt: 10,
    nguongTrinhVienTruong: 10000,
  },
  {
    id: 'N4', nhom: 4, nhomLabel: 'Nhóm 4', ten: 'N4. Cung ứng vật tư, máy móc, thiết bị',
    chuTri: 92, donVi: 4, tongGiaoDonVi: 96, cpqlLnChiKhac: 3.5, khtscd: 0.5, thueGtgt: 10,
    nguongTrinhVienTruong: null,
  },
];

export function timDinhMuc(nhom: NhomHD | null | undefined): DinhMucHD | undefined {
  if (!nhom) return undefined;
  return BANG_1.find((d) => d.id === nhom);
}

// ─── Ghi chú Bảng 1 (trang 23) — trường hợp đặc thù áp tỷ lệ khác bảng chính ───

export type LoaiDacThu =
  | 'khao-sat-dia-chat'
  | 'tn-dat-vl-thep-han'
  | 'tn-hoa-hoc-kim-loai'
  | 'thau-phu-vien-ky'
  | 'thau-phu-don-vi-ky'
  | 'cong-ty-co-phan';

export interface DacThuOption {
  id: LoaiDacThu;
  ten: string;
  apDungNhom: NhomHD[];
  ghiChu: string;
}

const NHOM_2_TAT_CA: NhomHD[] = ['N2A', 'N2B', 'N2C', 'N2D', 'N2E', 'N2F', 'N2G'];

export const DAC_THU_OPTIONS: DacThuOption[] = [
  {
    id: 'khao-sat-dia-chat', ten: 'Khảo sát địa chất công trình', apDungNhom: ['N2D'],
    ghiChu: 'Chủ trì 85%, đơn vị 5% (thay vì 77%/10% của N2d)',
  },
  {
    id: 'tn-dat-vl-thep-han', ten: 'Thí nghiệm đất, VL thép, VL hàn', apDungNhom: ['N2F'],
    ghiChu: 'Chủ trì 65%, đơn vị 9% (tổng giao đơn vị giữ nguyên 74%)',
  },
  {
    id: 'tn-hoa-hoc-kim-loai', ten: 'TN thành phần hóa học & cấu trúc kim loại (thực hiện tại cơ quan khác)', apDungNhom: ['N2F'],
    ghiChu: 'Tổng giao đơn vị 95%, trong đó chủ trì 90%',
  },
  {
    id: 'thau-phu-vien-ky', ten: 'Hợp đồng thầu phụ — HĐ chính ký tại Viện', apDungNhom: [...NHOM_2_TAT_CA, 'N3', 'N4'],
    ghiChu: 'Viện giao đơn vị 97%, giữ lại 3% giá trị HĐ',
  },
  {
    id: 'thau-phu-don-vi-ky', ten: 'Hợp đồng thầu phụ — HĐ chính ký tại đơn vị', apDungNhom: [...NHOM_2_TAT_CA, 'N3', 'N4'],
    ghiChu: 'Viện giao đơn vị 99%, giữ lại 1% giá trị HĐ',
  },
  {
    id: 'cong-ty-co-phan', ten: 'Đối tác/Bên A là Công ty Cổ phần', apDungNhom: [...NHOM_2_TAT_CA, 'N3'],
    ghiChu: 'Nhóm 2: giao đơn vị 97%; Nhóm 3: giao đơn vị 98%',
  },
];

export function dacThuHopLe(nhom: NhomHD | null | undefined, loaiDacThu: LoaiDacThu | null | undefined): boolean {
  if (!nhom || !loaiDacThu) return false;
  return !!DAC_THU_OPTIONS.find((d) => d.id === loaiDacThu)?.apDungNhom.includes(nhom);
}

export interface PhanBoHopDongOpts {
  loaiDacThu?: LoaiDacThu | null;
  phanVienXa?: boolean;
  giamTheoYeuCauDonVi?: boolean;
}

export interface PhanBoHopDong {
  /** null khi trường hợp đặc thù không tách chủ trì/đơn vị riêng (thầu phụ, công ty cổ phần) */
  chuTri: number | null;
  donVi: number | null;
  tongGiaoDonVi: number;
  cpqlLnChiKhac: number;
  khtscd: number;
  thueGtgt: number;
  /** Kinh phí hỗ trợ đi lại cho Phân viện/TT ở xa (Ghi chú 3, Bảng 1) — 0 nếu không áp dụng */
  hoTroDiLai: number;
  /** Mô tả các điều chỉnh đặc thù đã áp dụng, hiển thị cho người dùng tham khảo */
  ghiChuDacThu: string[];
}

/**
 * Phân bổ giá trị hợp đồng (trước thuế, triệu đồng) theo tỷ lệ Bảng 1, có thể override bằng
 * các trường hợp đặc thù ở Ghi chú Bảng 1 (Điều 12, trang 23) qua tham số `opts`.
 * Trả về null cho N1b — nhiệm vụ thanh toán theo thực thanh, thực chi, không có tỷ lệ phân bổ cố định.
 */
export function phanBoHopDong(
  nhom: NhomHD | null | undefined,
  giaTriTruocThue: number,
  opts?: PhanBoHopDongOpts,
): PhanBoHopDong | null {
  const dm = timDinhMuc(nhom);
  if (!dm || dm.chuTri == null || dm.donVi == null || dm.tongGiaoDonVi == null || dm.cpqlLnChiKhac == null) {
    return null;
  }
  const gt = giaTriTruocThue || 0;
  let chuTriPct: number | null = dm.chuTri;
  let donViPct: number | null = dm.donVi;
  let tongPct = dm.tongGiaoDonVi;
  let cpqlPct = dm.cpqlLnChiKhac;
  let khtscdPct = dm.khtscd ?? 0;
  const ghiChuDacThu: string[] = [];

  if (opts?.loaiDacThu && dacThuHopLe(nhom, opts.loaiDacThu)) {
    const dacThu = DAC_THU_OPTIONS.find((d) => d.id === opts.loaiDacThu)!;
    switch (opts.loaiDacThu) {
      case 'khao-sat-dia-chat':
        chuTriPct = 85; donViPct = 5; tongPct = 90;
        break;
      case 'tn-dat-vl-thep-han':
        chuTriPct = 65; donViPct = 9; tongPct = 74;
        break;
      case 'tn-hoa-hoc-kim-loai':
        chuTriPct = 90; donViPct = 5; tongPct = 95; cpqlPct = 5; khtscdPct = 0;
        break;
      case 'thau-phu-vien-ky':
        chuTriPct = null; donViPct = null; tongPct = 97; cpqlPct = 3; khtscdPct = 0;
        break;
      case 'thau-phu-don-vi-ky':
        chuTriPct = null; donViPct = null; tongPct = 99; cpqlPct = 1; khtscdPct = 0;
        break;
      case 'cong-ty-co-phan': {
        const congTyPct = dm.nhom === 3 ? 98 : 97;
        chuTriPct = null; donViPct = null; tongPct = congTyPct; cpqlPct = 100 - congTyPct; khtscdPct = 0;
        break;
      }
    }
    ghiChuDacThu.push(dacThu.ten + ': ' + dacThu.ghiChu);
  }

  if (opts?.giamTheoYeuCauDonVi && chuTriPct != null && donViPct != null) {
    const [dChuTri, dDonVi] = dm.nhom === 2 ? [0.3, 0.2] : [0.1, 0.1];
    chuTriPct -= dChuTri;
    donViPct -= dDonVi;
    tongPct -= dChuTri + dDonVi;
    ghiChuDacThu.push(`Đơn vị yêu cầu Viện ký (ngoài Nhóm 1): giảm ${(dChuTri + dDonVi).toFixed(1)}% giao khoán`);
  }

  let hoTroDiLai = 0;
  if (opts?.phanVienXa) {
    const pct = dm.nhom === 2 ? 0.5 : dm.nhom === 3 ? 0.2 : 0;
    if (pct > 0) {
      hoTroDiLai = (gt * pct) / 100;
      ghiChuDacThu.push(`Phân viện/TT ở xa: hỗ trợ đi lại ${pct}% giá trị HĐ trước thuế`);
    }
  }

  return {
    chuTri: chuTriPct != null ? (gt * chuTriPct) / 100 : null,
    donVi: donViPct != null ? (gt * donViPct) / 100 : null,
    tongGiaoDonVi: (gt * tongPct) / 100,
    cpqlLnChiKhac: (gt * cpqlPct) / 100,
    khtscd: (gt * khtscdPct) / 100,
    thueGtgt: (gt * (dm.thueGtgt ?? 0)) / 100,
    hoTroDiLai,
    ghiChuDacThu,
  };
}

/** true nếu hợp đồng thuộc diện phải trình Viện trưởng phê duyệt (Điều 6.1) */
export function canTrinhVienTruong(nhom: NhomHD | null | undefined, giaTriTruocThue: number): boolean {
  const dm = timDinhMuc(nhom);
  if (!dm || dm.nguongTrinhVienTruong == null) return false;
  return (giaTriTruocThue || 0) >= dm.nguongTrinhVienTruong;
}

const MS_MOI_NGAY = 24 * 3600 * 1000;
export const HAN_NOP_HO_SO_NGAY = 30; // Điều 6.3, Điều 8.2

/** Hạn nộp hồ sơ gốc về Viện = ngày ký + 30 ngày. */
export function ngayHanNopHoSo(ngayKy: string): Date | null {
  if (!ngayKy) return null;
  const t = new Date(ngayKy).getTime();
  if (Number.isNaN(t)) return null;
  return new Date(t + HAN_NOP_HO_SO_NGAY * MS_MOI_NGAY);
}

/** Số ngày còn lại tới hạn (âm = đã quá hạn), tính từ thời điểm gọi hàm. */
export function soNgayConLai(han: Date): number {
  return Math.ceil((han.getTime() - Date.now()) / MS_MOI_NGAY);
}

/**
 * Cảnh báo phạt nộp chậm hồ sơ HĐKT (Điều 14.2, dòng 1): áp dụng khi đã quá hạn 30 ngày
 * mà chưa nộp hồ sơ về Viện. Nhóm 1 không áp dụng mức phạt này.
 * Trả về % giá trị HĐ trước thuế bị phạt (gợi ý), hoặc null nếu chưa vi phạm / không áp dụng.
 */
export function canhBaoPhatNopChamHoSo(
  nhom: NhomHD | null | undefined,
  ngayKy: string,
  ngayNopHoSo: string,
): { quaHanNgay: number; mucPhatPhanTram: number } | null {
  if (ngayNopHoSo || !nhom || !ngayKy) return null;
  if (nhom === 'N1A' || nhom === 'N1B') return null;
  const han = ngayHanNopHoSo(ngayKy);
  if (!han) return null;
  const conLai = soNgayConLai(han);
  if (conLai >= 0) return null;
  const dm = timDinhMuc(nhom);
  const mucPhatPhanTram = dm?.nhom === 2 ? 0.5 : 0.1; // Nhóm 2: 0.5%, Nhóm 3/4: 0.1%
  return { quaHanNgay: -conLai, mucPhatPhanTram };
}

/**
 * Cảnh báo phạt chứng từ thanh quyết toán trễ hạn TCKT yêu cầu (Điều 14.2, dòng 2).
 * Áp dụng khi đã quá hạn `hanChungTu` mà hợp đồng vẫn chưa quyết toán. Nhóm 1 không áp dụng.
 */
export function canhBaoPhatChungTuTre(
  nhom: NhomHD | null | undefined,
  hanChungTu: string,
  daQuyetToan: boolean,
): { quaHanNgay: number; mucPhatPhanTram: number } | null {
  if (!hanChungTu || daQuyetToan || !nhom) return null;
  if (nhom === 'N1A' || nhom === 'N1B') return null;
  const t = new Date(hanChungTu).getTime();
  if (Number.isNaN(t)) return null;
  const conLai = soNgayConLai(new Date(t));
  if (conLai >= 0) return null;
  const dm = timDinhMuc(nhom);
  const mucPhatPhanTram = dm?.nhom === 2 ? 1 : 0.5; // Nhóm 2: 1%, Nhóm 3/4: 0.5% (trên phần giá trị vi phạm)
  return { quaHanNgay: -conLai, mucPhatPhanTram };
}

// ─── Danh mục vi phạm — Điều 14.2 (bảng mức phạt trang 20, đủ 8 dòng) ───

export interface LoaiViPham {
  id: string;
  ten: string;
  /** Mô tả mức phạt tương ứng với nhóm HĐ hiện tại (nếu có công thức rõ theo %) */
  moTaMucPhat: (nhom: NhomHD | null | undefined) => string;
  /** % gợi ý auto-fill khi chọn (chỉ có ở các dòng có công thức % rõ ràng theo nhóm 2 vs nhóm 3/4) */
  mucPhatGoiY?: (nhom: NhomHD | null | undefined) => number | null;
}

export const DANH_MUC_VI_PHAM: LoaiViPham[] = [
  {
    id: 'nop-cham-ho-so',
    ten: '1. Nộp chậm hồ sơ HĐKT (HĐ, phiếu giao việc)',
    moTaMucPhat: (nhom) => (timDinhMuc(nhom)?.nhom === 2 ? '0,5%' : '0,1%') + ' giá trị HĐ trước thuế',
    mucPhatGoiY: (nhom) => (timDinhMuc(nhom)?.nhom === 2 ? 0.5 : 0.1),
  },
  {
    id: 'cham-chung-tu-quyet-toan',
    ten: '2. Không thực hiện chứng từ thanh quyết toán đúng hạn TCKT yêu cầu',
    moTaMucPhat: (nhom) => (timDinhMuc(nhom)?.nhom === 2 ? '1%' : '0,5%') + ' trên phần giá trị vi phạm',
    mucPhatGoiY: (nhom) => (timDinhMuc(nhom)?.nhom === 2 ? 1 : 0.5),
  },
  {
    id: 'qua-nien-do-ke-toan',
    ten: '3. Thanh lý HĐKT/nghiệm thu hoàn thành công việc ký quá niên độ kế toán',
    moTaMucPhat: () => 'Theo mức phạt của Nhà nước',
  },
  {
    id: 'phan-phoi-sai-quy-che',
    ten: '4. Đơn vị phân phối HĐKT sai quy chế của Viện',
    moTaMucPhat: () => 'Thu hồi phần sai phạm và phạt thêm tối đa 12% giá trị sai phạm',
  },
  {
    id: 'can-bo-gian-tiep-vi-pham',
    ten: '5. Cán bộ gián tiếp vi phạm quy chế Viện',
    moTaMucPhat: () => 'Thu hồi 1/4 hệ số thu nhập dịch vụ của tháng vi phạm',
  },
  {
    id: 'no-tam-ung-qua-han',
    ten: '6. Nợ tạm ứng quá hạn (khoản tạm ứng trước của HĐKT)',
    moTaMucPhat: () => 'Thu lãi bằng 130% lãi suất áp dụng, tính từ thời điểm quá hạn',
  },
  {
    id: 'cong-no-xuat-hoa-don',
    ten: '7. Công nợ đã xuất hóa đơn tài chính chưa hoàn thành nghĩa vụ thuế',
    moTaMucPhat: () => 'Chủ trì phải nộp đủ nghĩa vụ VAT trong vòng 1 năm kể từ ngày xuất hóa đơn',
  },
  {
    id: 'rui-ro-bao-lanh',
    ten: '8. Rủi ro đối với hợp đồng được Viện bảo lãnh',
    moTaMucPhat: () => 'Khoản bảo lãnh chuyển thành khoản vay Viện; chủ trì và Trưởng đơn vị chịu trách nhiệm hoàn trả',
  },
  {
    id: 'khac',
    ten: 'Khác (tự nhập lý do)',
    moTaMucPhat: () => '',
  },
];

export function timLoaiViPham(id: string | null | undefined): LoaiViPham | undefined {
  if (!id) return undefined;
  return DANH_MUC_VI_PHAM.find((v) => v.id === id);
}
