import type { LichCongTac } from '../pages/LichCoQuanPage';

export interface BanTinEventItem {
  kind: 'event';
  id: string;
  title: string;
  ngay: string;
  thu: string;
  gio: string;
  gioKetThuc?: string;
  diaDiem: string;
  xeCongTac?: string;
  chuTri: string;
  loai: string;
}

export interface BanTinLegalItem {
  kind: 'legal';
  id: string;
  code: string;
  title: string;
  agency: string;
  type: 'Thông tư' | 'Quy chuẩn' | 'Tiêu chuẩn' | 'Quyết định' | 'Nghị định';
  issuedDate: string;
  effectiveDate: string;
  summary: string;
  link?: string;
}

export interface BanTinNoticeItem {
  kind: 'notice';
  id: string;
  title: string;
  sender: string;
  date: string;
  priority: 'urgent' | 'important' | 'normal';
  content: string;
  deadline?: string;
}

export type BanTinItem = BanTinEventItem | BanTinLegalItem | BanTinNoticeItem;

// Danh mục Văn bản Pháp quy, Quy chuẩn & Tiêu chuẩn Bộ Xây dựng / IBST 2026
export const DANH_MUC_VAN_BAN_MOI: BanTinLegalItem[] = [
  {
    kind: 'legal',
    id: 'vb-tt-09-2026',
    code: 'TT 09/2026/TT-BXD',
    title: 'Thông tư hướng dẫn chi tiết Hệ thống thông tin, Cơ sở dữ liệu và Chuyển đổi số ngành Xây dựng',
    agency: 'Bộ Xây dựng',
    type: 'Thông tư',
    issuedDate: '2026-08-20',
    effectiveDate: '2026-10-01',
    summary: 'Quy định chuẩn cấu trúc dữ liệu trao đổi liên thông, hồ sơ quản trị số dự án và tích hợp mô hình thông tin công trình BIM vào hệ thống dữ liệu quốc gia.',
  },
  {
    kind: 'legal',
    id: 'vb-qcvn-06-2026',
    code: 'QCVN 06:2026/BXD',
    title: 'Quy chuẩn kỹ thuật quốc gia về An toàn cháy cho nhà và công trình (Phiên bản mới 2026 do IBST biên soạn)',
    agency: 'Bộ Xây dựng',
    type: 'Quy chuẩn',
    issuedDate: '2026-08-15',
    effectiveDate: '2026-09-15',
    summary: 'Cập nhật các giải pháp kỹ thuật ngăn cháy lan, thoát nạn cho nhà cao tầng, hệ thống bảo vệ chống khói và giải pháp phân khoang linh hoạt.',
  },
  {
    kind: 'legal',
    id: 'vb-qd-2815',
    code: 'QĐ 2815/QĐ-VKH',
    title: 'Quy chế Quản lý Hợp đồng, Định mức Phân bổ và Điều hành Tài chính Viện Khoa học Công nghệ Xây dựng',
    agency: 'Viện IBST',
    type: 'Quyết định',
    issuedDate: '2026-01-05',
    effectiveDate: '2026-01-05',
    summary: 'Quy định các tỷ lệ phân bổ chi phí trực tiếp, gián tiếp, quỹ phát triển hoạt động sự nghiệp và chế tài tuân thủ tiến độ hợp đồng.',
  },
  {
    kind: 'legal',
    id: 'vb-tcvn-13926',
    code: 'TCVN 13926:2026',
    title: 'Bê tông và vữa xây dựng - Phương pháp thử xác định độ co ngót và từ biến trong điều kiện khí hậu nhiệt đới',
    agency: 'Bộ Khoa học và Công nghệ',
    type: 'Tiêu chuẩn',
    issuedDate: '2026-07-10',
    effectiveDate: '2026-09-01',
    summary: 'Tiêu chuẩn quốc gia mới áp dụng cho các phòng thí nghiệm LAS-XD, đo lường biến dạng lâu dài của kết cấu bê tông cốt thép khối lớn.',
  },
  {
    kind: 'legal',
    id: 'vb-tt-04-2026',
    code: 'TT 04/2026/TT-BXD',
    title: 'Thông tư quy định định mức kinh tế - kỹ thuật công tác khảo sát, kiểm định chất lượng và đánh giá an toàn công trình',
    agency: 'Bộ Xây dựng',
    type: 'Thông tư',
    issuedDate: '2026-06-25',
    effectiveDate: '2026-08-15',
    summary: 'Khung định mức chi phí áp dụng trong lập dự toán dịch vụ tư vấn kiểm định, thí nghiệm cọc và quan trắc biến dạng công trình.',
  },
];

// Danh mục Thông báo & Chỉ đạo điều hành từ Ban Giám đốc Viện
export const DANH_MUC_THONG_BAO_DIEU_HANH: BanTinNoticeItem[] = [
  {
    kind: 'notice',
    id: 'tb-01',
    title: 'Đôn đốc hoàn thiện hồ sơ nghiệm thu Đề tài NCKH cấp Bộ Quý 3/2026',
    sender: 'Phòng Quản lý Khoa học',
    date: '2026-09-08',
    priority: 'urgent',
    content: 'Yêu cầu các Chủ nhiệm đề tài và Viện Chuyên ngành khẩn trương nộp Báo cáo tổng kết và Báo cáo tóm tắt trước 17:00 ngày 15/09/2026 để tổng hợp trình Hội đồng Bộ.',
    deadline: '15/09/2026',
  },
  {
    kind: 'notice',
    id: 'tb-02',
    title: 'Kế hoạch phát động đợt thi đua cao điểm 100 ngày đêm hoàn thành kế hoạch 2026',
    sender: 'Thường trực Ban Giám đốc Viện',
    date: '2026-09-02',
    priority: 'important',
    content: 'Toàn Viện đẩy nhanh tiến độ giải ngân dịch vụ kỹ thuật, hoàn thành dứt điểm 100% hợp đồng chuyển tiếp và phấn đấu đạt 105% chỉ tiêu doanh thu năm 2026.',
    deadline: '31/12/2026',
  },
  {
    kind: 'notice',
    id: 'tb-03',
    title: 'Kiểm tra tuân thủ an toàn lao động và bảo hộ tại các công trường khảo sát hiện trường',
    sender: 'Hội đồng An toàn - Vệ sinh lao động',
    date: '2026-09-05',
    priority: 'normal',
    content: 'Các đoàn công tác đi hiện trường (Long Thành, Tân Sơn Nhất, Đà Nẵng) bắt buộc trang bị đầy đủ thiết bị bảo hộ, kiểm định thiết bị thí nghiệm trước khi khởi hành.',
  },
];

/**
 * Lấy dải ngày Thứ Hai và Chủ Nhật của tuần hiện tại (chuẩn UTC+7)
 */
export function getKhoangThoiGianTuanHienTai(): { mondayStr: string; sundayStr: string; weekLabel: string } {
  const now = new Date();
  const day = now.getDay(); // 0: CN, 1: T2, ..., 6: T7
  const distanceToMonday = (day + 6) % 7;

  const monday = new Date(now);
  monday.setDate(now.getDate() - distanceToMonday);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const pad = (n: number) => String(n).padStart(2, '0');
  const formatYMD = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;

  const mondayStr = formatYMD(monday);
  const sundayStr = formatYMD(sunday);

  const weekLabel = `Tuần từ ${pad(monday.getDate())}/${pad(monday.getMonth() + 1)} đến ${pad(sunday.getDate())}/${pad(sunday.getMonth() + 1)}/${sunday.getFullYear()}`;

  return { mondayStr, sundayStr, weekLabel };
}

/**
 * Trích xuất danh sách Lịch cơ quan trong tuần từ localStorage (hoặc initial mock)
 */
export function getLichCoQuanTuanHienTai(): BanTinEventItem[] {
  try {
    let allEvents: LichCongTac[] = [];
    if (typeof window !== 'undefined') {
      const stored = window.localStorage.getItem('ibst_agency_events_v4');
      if (stored) {
        try {
          allEvents = JSON.parse(stored);
        } catch {
          allEvents = [];
        }
      }
    }

    const { mondayStr, sundayStr } = getKhoangThoiGianTuanHienTai();

    // Lọc sự kiện trong tuần hiện tại (hoặc nếu tuần này chưa có thì lấy các sự kiện tháng 9/2026)
    let weekly = allEvents.filter(
      (e) => e.ngay >= mondayStr && e.ngay <= sundayStr && e.trangThai !== 'Tu-choi',
    );

    // Fallback: nếu tuần hiện tại chưa có sự kiện trong database local, lấy các sự kiện tiêu biểu gần nhất
    if (weekly.length === 0 && allEvents.length > 0) {
      weekly = allEvents.filter((e) => e.trangThai !== 'Tu-choi').slice(0, 8);
    }

    return weekly.map((e) => ({
      kind: 'event',
      id: e.id,
      title: e.noiDung,
      ngay: e.ngay,
      thu: e.thu,
      gio: e.gio,
      gioKetThuc: e.gioKetThuc,
      diaDiem: e.diaDiem,
      xeCongTac: e.xeCongTac,
      chuTri: e.chuTri,
      loai: e.loai,
    }));
  } catch (err) {
    console.error('[BanTinTuan] Lỗi lấy lịch tuần:', err);
    return [];
  }
}

/**
 * Tạo danh sách Bản tin tuần tổng hợp kết hợp xen kẽ:
 * 1. Lịch công tác tuần
 * 2. Văn bản & Tiêu chuẩn mới
 * 3. Thông báo chỉ đạo điều hành
 */
export function getBanTinTuanItems(): BanTinItem[] {
  const events = getLichCoQuanTuanHienTai();
  const legals = DANH_MUC_VAN_BAN_MOI;
  const notices = DANH_MUC_THONG_BAO_DIEU_HANH;

  const combined: BanTinItem[] = [];
  const maxLen = Math.max(events.length, legals.length, notices.length);

  for (let i = 0; i < maxLen; i++) {
    if (i < events.length) combined.push(events[i]);
    if (i < legals.length) combined.push(legals[i]);
    if (i < notices.length) combined.push(notices[i]);
  }

  return combined;
}
