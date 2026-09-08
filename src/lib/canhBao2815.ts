/**
 * Bộ luật rà soát hợp đồng theo QC 2815 — mô hình mượn từ `lib/contractAnomalies.ts`
 * của dự án CIC ERP Contract, nhưng luật viết lại theo điều khoản quy chế IBST.
 *
 * Nguyên tắc: engine chỉ **phát hiện và đề xuất**, không tự ghi phiếu thưởng/phạt.
 * Người có thẩm quyền xem đề xuất rồi mới quyết định (Đ.14 yêu cầu "sau khi có văn bản
 * nhắc nhở" mới phạt), nên mọi kết quả ở đây là cảnh báo để rà soát.
 */
import type { HopDong } from '../types';
import {
  canhBaoPhatNopChamHoSo,
  canhBaoPhatChungTuTre,
  canTrinhVienTruong,
  timDinhMuc,
  type NhomHD,
} from './qc2815';

export type MucDoCanhBao = 'cao' | 'trung-binh' | 'thap';

export interface LuatCanhBao {
  ma: string;
  ten: string;
  canCu: string;
  mucDo: MucDoCanhBao;
  /** Gợi ý dòng vi phạm Đ.14.2 tương ứng (id trong DANH_MUC_VI_PHAM) — null nếu không phải để phạt. */
  goiYViPhamId: string | null;
}

export const DANH_MUC_LUAT: LuatCanhBao[] = [
  { ma: 'nop-cham-ho-so', ten: 'Quá 30 ngày chưa nộp hồ sơ gốc về Viện', canCu: 'Đ.6.3 / Đ.8.2 — hạn 30 ngày', mucDo: 'cao', goiYViPhamId: 'nop-cham-ho-so' },
  { ma: 'chung-tu-quyet-toan-tre', ten: 'Quá hạn nộp chứng từ thanh quyết toán', canCu: 'Đ.14.2 dòng 2', mucDo: 'cao', goiYViPhamId: 'cham-chung-tu-quyet-toan' },
  { ma: 'chua-phan-nhom', ten: 'Hợp đồng chưa gán nhóm HĐ', canCu: 'Bảng 1 — không phân bổ được kinh phí', mucDo: 'cao', goiYViPhamId: null },
  { ma: 'chua-phan-cong-chu-tri', ten: 'Chưa phân công chủ trì hợp đồng', canCu: 'Đ.7.4 — mỗi HĐ phải có một chủ trì chịu trách nhiệm', mucDo: 'trung-binh', goiYViPhamId: null },
  { ma: 'chua-trinh-vien-truong', ten: 'Thuộc diện phải trình Viện trưởng nhưng chưa được phê duyệt', canCu: 'Đ.6.1', mucDo: 'cao', goiYViPhamId: null },
  { ma: 'nghiem-thu-chua-xuat-hd', ten: 'Đã nghiệm thu/hoàn thành nhưng chưa xuất hóa đơn', canCu: 'Đ.11.1 — chuỗi nghiệm thu → xuất hóa đơn', mucDo: 'trung-binh', goiYViPhamId: null },
  { ma: 'vat-qua-1-nam', ten: 'Hóa đơn đã xuất quá 1 năm mà chưa thu đủ tiền', canCu: 'Đ.14.2 dòng 7 — nghĩa vụ VAT trong 1 năm', mucDo: 'cao', goiYViPhamId: 'cong-no-xuat-hoa-don' },
  { ma: 'tam-ung-qua-han', ten: 'Tạm ứng quá hạn hoàn', canCu: 'Đ.14.2 dòng 6 — lãi 130%', mucDo: 'cao', goiYViPhamId: 'no-tam-ung-qua-han' },
  { ma: 'thanh-ly-qua-nien-do', ten: 'Thanh lý/nghiệm thu vắt qua niên độ kế toán', canCu: 'Đ.14.2 dòng 3', mucDo: 'trung-binh', goiYViPhamId: 'qua-nien-do-ke-toan' },
  { ma: 'truong-dv-la-chu-tri', ten: 'Trưởng đơn vị là chủ trì nhưng chưa giao Phó đơn vị quản lý', canCu: 'Đ.8.3', mucDo: 'trung-binh', goiYViPhamId: null },
  { ma: 'dau-so-bo-qua-han', ten: 'Đã đóng dấu sơ bộ quá 30 ngày mà hợp đồng chưa ký đủ', canCu: 'Đ.8.2', mucDo: 'cao', goiYViPhamId: null },
  { ma: 'lien-danh-chua-bao-khkt', ten: 'Có liên danh nhưng chưa thông báo Phòng KHKT', canCu: 'Đ.4.7', mucDo: 'trung-binh', goiYViPhamId: null },
];

export function timLuat(ma: string): LuatCanhBao | undefined {
  return DANH_MUC_LUAT.find((l) => l.ma === ma);
}

export interface KetQuaCanhBao {
  hopDongId: string;
  soHopDong: string;
  luat: LuatCanhBao;
  chiTiet: string;
}

/** Dữ liệu phụ trợ lấy từ các bảng con — truyền vào để engine không phải tự truy vấn. */
export interface DuLieuPhuTro {
  /** hopDongId → có liên danh mà chưa có số văn bản thông báo KHKT */
  lienDanhChuaBaoKhkt?: Set<string>;
  /** hopDongId → số ngày quá hạn tạm ứng lớn nhất */
  tamUngQuaHan?: Map<string, number>;
  /** hopDongId → số ngày kể từ ngày xuất hóa đơn sớm nhất còn chưa thu đủ */
  hoaDonChuaThu?: Map<string, number>;
  /** hopDongId → true nếu trưởng đơn vị là chủ trì mà chưa giao phó đơn vị */
  viPhamDieu83?: Set<string>;
}

const NGAY = 24 * 3600 * 1000;

/** Quét một hợp đồng, trả về các cảnh báo phát hiện được. */
export function quetHopDong(hd: HopDong, phu: DuLieuPhuTro = {}): KetQuaCanhBao[] {
  const kq: KetQuaCanhBao[] = [];
  const them = (ma: string, chiTiet: string) => {
    const luat = timLuat(ma);
    if (luat) kq.push({ hopDongId: hd.id, soHopDong: hd.soHD, luat, chiTiet });
  };

  const nopCham = canhBaoPhatNopChamHoSo(hd.nhomHD, hd.ngayKy, hd.ngayNopHoSo);
  if (nopCham) them('nop-cham-ho-so', `Quá hạn ${nopCham.quaHanNgay} ngày — mức phạt gợi ý ${nopCham.mucPhatPhanTram}% giá trị HĐ trước thuế`);

  const chungTuTre = canhBaoPhatChungTuTre(hd.nhomHD, hd.hanChungTuQuyetToan, hd.trangThaiQuyetToan === 'da-quyet-toan');
  if (chungTuTre) them('chung-tu-quyet-toan-tre', `Quá hạn ${chungTuTre.quaHanNgay} ngày — mức phạt gợi ý ${chungTuTre.mucPhatPhanTram}% phần giá trị vi phạm`);

  if (!hd.nhomHD) them('chua-phan-nhom', 'Không tính được phân bổ Bảng 1 và không xác định được ngưỡng trình Viện trưởng');
  if (!hd.chuTriId) them('chua-phan-cong-chu-tri', 'Hợp đồng chưa có người chịu trách nhiệm chính');

  if (canTrinhVienTruong(hd.nhomHD, hd.giaDuThau ?? hd.giaTri, hd.phucTap) && hd.trangThaiPheDuyet !== 'da-duyet') {
    them('chua-trinh-vien-truong', `Nhóm ${hd.nhomHD ?? '—'}, giá trị ${(hd.giaDuThau ?? hd.giaTri).toLocaleString('vi-VN')} tr — trạng thái phê duyệt hiện tại: ${hd.trangThaiPheDuyet}`);
  }

  if ((hd.trangThai === 'nghiem-thu' || hd.trangThai === 'hoan-thanh') && (hd.daThanhToan || 0) <= 0) {
    them('nghiem-thu-chua-xuat-hd', 'Hợp đồng đã nghiệm thu/hoàn thành nhưng chưa ghi nhận tiền về nào');
  }

  if (hd.trangThai === 'thanh-ly' && hd.ngayKy && hd.ngayQuyetToan) {
    if (new Date(hd.ngayKy).getFullYear() !== new Date(hd.ngayQuyetToan).getFullYear()) {
      them('thanh-ly-qua-nien-do', `Ký năm ${new Date(hd.ngayKy).getFullYear()}, quyết toán năm ${new Date(hd.ngayQuyetToan).getFullYear()}`);
    }
  }

  if (hd.dongDauSoBo && hd.ngayDongDauSoBo) {
    const soNgay = Math.floor((Date.now() - new Date(hd.ngayDongDauSoBo).getTime()) / NGAY);
    if (soNgay > 30 && !hd.ngayKy) {
      them('dau-so-bo-qua-han', `Đã đóng dấu sơ bộ ${soNgay} ngày mà hợp đồng chưa có ngày ký`);
    }
  }

  if (phu.viPhamDieu83?.has(hd.id)) {
    them('truong-dv-la-chu-tri', 'Chủ trì hợp đồng đồng thời là Trưởng đơn vị — cần giao một Phó đơn vị quản lý');
  }
  if (phu.lienDanhChuaBaoKhkt?.has(hd.id)) {
    them('lien-danh-chua-bao-khkt', 'Có bản ghi liên danh nhưng thiếu số/ngày văn bản thông báo Phòng KHKT');
  }
  const ngayQuaHanTu = phu.tamUngQuaHan?.get(hd.id);
  if (ngayQuaHanTu != null && ngayQuaHanTu > 0) {
    them('tam-ung-qua-han', `Khoản tạm ứng quá hạn ${ngayQuaHanTu} ngày — thu lãi 130% lãi suất áp dụng`);
  }
  const ngayHoaDon = phu.hoaDonChuaThu?.get(hd.id);
  if (ngayHoaDon != null && ngayHoaDon > 365) {
    them('vat-qua-1-nam', `Hóa đơn đã xuất ${ngayHoaDon} ngày mà chưa thu đủ — quá hạn nghĩa vụ VAT 1 năm`);
  }

  return kq;
}

export function quetDanhSach(list: HopDong[], phu: DuLieuPhuTro = {}): KetQuaCanhBao[] {
  return list.flatMap((hd) => quetHopDong(hd, phu));
}

const THU_TU_MUC_DO: Record<MucDoCanhBao, number> = { cao: 0, 'trung-binh': 1, thap: 2 };

/** Sắp xếp theo mức độ nghiêm trọng để hiển thị việc cần xử lý trước. */
export function sapXepCanhBao(kq: KetQuaCanhBao[]): KetQuaCanhBao[] {
  return [...kq].sort((a, b) => THU_TU_MUC_DO[a.luat.mucDo] - THU_TU_MUC_DO[b.luat.mucDo]);
}

/** Đếm theo mức độ để hiện KPI nhanh. */
export function demTheoMucDo(kq: KetQuaCanhBao[]): Record<MucDoCanhBao, number> {
  return kq.reduce(
    (acc, k) => {
      acc[k.luat.mucDo] += 1;
      return acc;
    },
    { cao: 0, 'trung-binh': 0, thap: 0 } as Record<MucDoCanhBao, number>,
  );
}

/** Nhóm HĐ có tồn tại trong Bảng 1 hay không — dùng cho kiểm thử nhanh danh mục. */
export function nhomHopLe(nhom: NhomHD | null | undefined): boolean {
  return !!timDinhMuc(nhom);
}
