/**
 * Dịch vụ Lưu vết Lịch sử Chuyển trạng thái & Phê duyệt (Audit Log / Timeline)
 * Tuân thủ Quy chế 2815 — Ghi nhận thời gian chính xác, người phê duyệt và vai trò.
 */

export interface AuditLogItem {
  id: string;
  loaiDoiTuong: 'dang_ky_dau_moi' | 'dau_thau' | 'hop_dong' | 'phieu_giao_viec' | 'uy_quyen';
  doiTuongId: string;
  tuTrangThai: string;
  denTrangThai: string;
  thoiGian: string; // ISO string e.g. "31/07/2026 12:24:00"
  nguoiThucHienId?: string | null;
  tenNguoiThucHien: string; // "Nguyễn Hồng Hải (Viện trưởng)" hoặc "KHKT (Phòng KHKT)"
  ghiChu?: string;
}

const STORAGE_KEY = 'ibst_audit_logs';

export function getAuditLogs(loaiDoiTuong?: string, doiTuongId?: string): AuditLogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const logs: AuditLogItem[] = raw ? JSON.parse(raw) : getSeedAuditLogs();
    if (!loaiDoiTuong && !doiTuongId) return logs;
    return logs.filter(
      (l) =>
        (!loaiDoiTuong || l.loaiDoiTuong === loaiDoiTuong) &&
        (!doiTuongId || l.doiTuongId === String(doiTuongId)),
    );
  } catch (err) {
    console.error('Lỗi khi đọc audit log:', err);
    return getSeedAuditLogs();
  }
}

export function recordAuditLog(log: Omit<AuditLogItem, 'id' | 'thoiGian'>): AuditLogItem {
  const now = new Date();
  const thoiGianFormatted = `${now.toLocaleDateString('vi-VN')} ${now.toLocaleTimeString('vi-VN')}`;
  
  const newItem: AuditLogItem = {
    ...log,
    id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    thoiGian: thoiGianFormatted,
  };

  try {
    const logs = getAuditLogs();
    const updated = [newItem, ...logs];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (err) {
    console.error('Lỗi khi lưu audit log:', err);
  }

  return newItem;
}

/**
 * Tạo dữ liệu mẫu lịch sử phê duyệt ban đầu cho các bản ghi chính để test
 */
function getSeedAuditLogs(): AuditLogItem[] {
  return [
    {
      id: 'log-seed-1',
      loaiDoiTuong: 'dang_ky_dau_moi',
      doiTuongId: '1',
      tuTrangThai: 'dang-ky',
      denTrangThai: 'giao-dau-moi',
      thoiGian: '31/07/2026 08:30:00',
      tenNguoiThucHien: 'Nguyễn Hồng Hải (Viện trưởng)',
      ghiChu: 'Lãnh đạo Viện phê duyệt giao Viện Chuyên ngành Kết cấu làm đầu mối chủ trì dự thầu',
    },
    {
      id: 'log-seed-2',
      loaiDoiTuong: 'dang_ky_dau_moi',
      doiTuongId: '1',
      tuTrangThai: 'khoi-tao',
      denTrangThai: 'dang-ky',
      thoiGian: '31/07/2026 08:00:00',
      tenNguoiThucHien: 'Hoàng Văn E (Giám đốc Viện Chuyên ngành Kết cấu)',
      ghiChu: 'Đăng ký cơ hội thị trường dự án Nội Bài GĐ2 lên Phòng KHKT',
    },
    {
      id: 'log-seed-3',
      loaiDoiTuong: 'dau_thau',
      doiTuongId: '1',
      tuTrangThai: 'da-nop',
      denTrangThai: 'trung-thau',
      thoiGian: '31/07/2026 10:15:00',
      tenNguoiThucHien: 'Phạm Kế Hoạch (Trưởng phòng KHKT)',
      ghiChu: 'Cập nhật kết quả trúng thầu chính thức: 4.650 triệu VNĐ',
    },
    {
      id: 'log-seed-4',
      loaiDoiTuong: 'dau_thau',
      doiTuongId: '1',
      tuTrangThai: 'chuan-bi',
      denTrangThai: 'da-nop',
      thoiGian: '31/07/2026 09:00:00',
      tenNguoiThucHien: 'Nguyễn Văn A (Chủ trì lập HSDT)',
      ghiChu: 'Đã hoàn thiện bộ 3/3 Hồ sơ năng lực và nộp HSDT thành công',
    },
    {
      id: 'log-seed-5',
      loaiDoiTuong: 'hop_dong',
      doiTuongId: '1',
      tuTrangThai: 'cho-khkt-tham-tra',
      denTrangThai: 'da-duyet',
      thoiGian: '31/07/2026 11:45:00',
      tenNguoiThucHien: 'Nguyễn Hồng Hải (Viện trưởng)',
      ghiChu: 'Phê duyệt ký kết Hợp đồng kinh tế số 501/2026/HĐKT-IBST (Viện ký)',
    },
    {
      id: 'log-seed-6',
      loaiDoiTuong: 'hop_dong',
      doiTuongId: '1',
      tuTrangThai: 'chua-trinh',
      denTrangThai: 'cho-khkt-tham-tra',
      thoiGian: '31/07/2026 11:00:00',
      tenNguoiThucHien: 'Phạm Kế Hoạch (Trưởng phòng KHKT)',
      ghiChu: 'Phòng KHKT thẩm tra nội dung hợp đồng đạt chuẩn QC 2815',
    },
  ];
}
