import { useMemo, useState, useEffect, useRef } from 'react';
import {
  Calendar as CalendarIcon,
  Plus,
  Clock,
  MapPin,
  User,
  CheckCircle,
  AlertCircle,
  Trash2,
  Pencil,
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  FilterX,
  Users,
  Search,
  Monitor,
  LayoutGrid,
  List,
  Check,
  CalendarRange,
  Maximize2,
  Minimize2,
  Car,
  FileText,
  SlidersHorizontal,
  ChevronDown,
  Printer,
  Sparkles,
  Save,
  Table as TableIcon,
  Sun,
  Moon,
  Building,
  Eye,
  AlertTriangle,
  RefreshCw,
  Layers,
  CheckSquare,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Field, inputCls } from '../components/Modal';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { SlideOverTabs, type SlideOverTabDef } from '../components/SlideOver';
import { useToast } from '../context/ToastContext';
import { cn } from '../lib/utils';
import { printLichTuanMatrix } from '../lib/printLichTuan';
import {
  getLichCoQuan,
  createLichCoQuan,
  updateLichCoQuan,
  deleteLichCoQuan,
  approveLichCoQuan,
  getDanhMucPhongHop,
  getDanhMucXeCongTac,
  getNhanSuGoiY,
  checkXungDotPhongXe,
  subscribeLichCoQuan,
  getGhiChuTuan,
  saveGhiChuTuan,
  type PhongHop,
  type XeCongTac,
  type NhanSuGoiY,
  type ConflictInfo,
} from '../services/lichCoQuanService';

export type AgencyEventType =
  | 'Lich-BGĐ'
  | 'Lich-tuan'
  | 'Phong-hop'
  | 'meeting'
  | 'business_trip'
  | 'internal_event'
  | 'other';

export interface LichCongTac {
  id: string;
  ngay: string; // YYYY-MM-DD
  thu: string; // Thứ Hai, Thứ Ba...
  buoi?: 'sang' | 'chieu' | 'ca_ngay';
  gio: string; // HH:mm (bắt đầu)
  gioKetThuc?: string; // HH:mm (kết thúc)
  noiDung: string;
  donViChuanBi?: string; // Đơn vị/Người chuẩn bị nội dung & báo cáo (VD: 'TTKCT a.Trung, a.Phương')
  nguoiChuanBi?: string;
  nhanSuId?: number | null;
  cotMaTran?: 'vien_truong' | 'dan' | 'binh' | 'khoi' | 'khac';
  thanhPhan: string;
  chuTri: string;
  diaDiem: string; // Tên phòng họp hoặc địa điểm
  phongHopId?: string | null;
  xeCongTac?: string; // Phương tiện xe công tác
  xeId?: string | null;
  loai: AgencyEventType;
  trangThai: 'Cho-duyet' | 'Da-duyet' | 'Tu-choi';
  ghiChu?: string;
  noiDungBaoCao?: string; // Biên bản / Kết luận sau cuộc họp
}

const DETAIL_TABS: SlideOverTabDef<'info' | 'report'>[] = [
  { id: 'info', label: 'Thông tin lịch', icon: FileText },
  { id: 'report', label: 'Biên bản & Kết luận', icon: CheckCircle },
];

const STORAGE_KEY = 'ibst_agency_events_v5';

const INITIAL_LICH: LichCongTac[] = [
  // ── TUẦN 1: 01/09 - 06/09/2026 ──
  {
    id: '1',
    ngay: '2026-09-01',
    thu: 'Thứ Ba',
    gio: '08:00',
    gioKetThuc: '11:00',
    noiDung: 'Lễ Kỷ niệm 81 năm Quốc khánh 2/9 & Phát động thi đua 100 ngày hoàn thành kế hoạch 2026',
    thanhPhan: 'Ban Giám đốc Viện, Đảng ủy, Công đoàn, Đoàn Thanh niên & toàn thể CBVC',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-tuan',
    trangThai: 'Da-duyet',
    ghiChu: 'Chuẩn bị khánh tiết, hoa tươi, âm thanh hội trường và 4 micro không dây.',
    noiDungBaoCao: 'Đã tổ chức trọng thể, phát động phong trào thi đua cao điểm hoàn thành vượt mức chỉ tiêu nghiên cứu và dịch vụ kỹ thuật.',
  },
  {
    id: '2',
    ngay: '2026-09-01',
    thu: 'Thứ Ba',
    gio: '14:00',
    gioKetThuc: '16:30',
    noiDung: 'Giao ban đầu tháng 9 của Thường trực Ban Giám đốc Viện',
    thanhPhan: 'Viện trưởng, các Phó Viện trưởng, Chánh Văn phòng Viện',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
    ghiChu: 'Rà soát các kết luận chỉ đạo trong tháng 8 và phân công lịch công tác tháng 9.',
  },
  {
    id: '3',
    ngay: '2026-09-02',
    thu: 'Thứ Tư',
    gio: '08:00',
    gioKetThuc: '17:00',
    noiDung: 'Nghỉ Lễ Quốc khánh 2/9 (Theo lịch nghỉ chung của Nhà nước)',
    thanhPhan: 'Toàn thể CBVC Viện nghỉ lễ; Lực lượng bảo vệ, kỹ thuật phòng LAB trực 24/24',
    chuTri: 'Trực chỉ huy Viện',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: '4',
    ngay: '2026-09-03',
    thu: 'Thứ Năm',
    gio: '09:00',
    gioKetThuc: '11:30',
    noiDung: 'Họp Ban chỉ đạo Chuyển đổi số & Đánh giá tiến độ triển khai ERP Quản trị Viện IBST',
    thanhPhan: 'Ban chỉ đạo CĐS, Trung tâm CNTT & Chuyển giao công nghệ, đối tác CIC',
    chuTri: 'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
    ghiChu: 'Trình diễn thử nghiệm các module Hợp đồng, LIMS, Quản lý đề tài và e-Office.',
  },
  {
    id: '5',
    ngay: '2026-09-04',
    thu: 'Thứ Sáu',
    gio: '08:00',
    gioKetThuc: '17:00',
    noiDung: 'Khảo sát và thử nghiệm tải trọng động kết cấu dầm cầu cạn Vành đai 4 Vùng Thủ đô',
    thanhPhan: 'Đoàn kỹ sư Phòng Thí nghiệm Công trình & Địa kỹ thuật',
    chuTri: 'TS. Lê Minh Long - Phó Viện trưởng',
    diaDiem: 'Công trường Vành đai 4, Mê Linh, Hà Nội',
    xeCongTac: 'Xe 7 chỗ (29A-888.99) - Ford Everest',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
    ghiChu: 'Mang theo xe đo dao động động lực học và máy cảm biến gia tốc.',
  },
  {
    id: '6',
    ngay: '2026-09-04',
    thu: 'Thứ Sáu',
    gio: '14:00',
    gioKetThuc: '16:30',
    noiDung: 'Đăng ký phòng họp: Họp Hội đồng nghiệm thu cơ sở đề tài KHCN cấp Viện 2026',
    thanhPhan: 'Hội đồng KHCN chuyên ngành Vật liệu xây dựng, Ban chủ nhiệm đề tài',
    chuTri: 'TS. Nguyễn Hồng Hải - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'Phong-hop',
    trangThai: 'Da-duyet',
    ghiChu: 'Cần máy chiếu và in 07 bộ thuyết minh tóm tắt đề tài.',
  },
  {
    id: '7',
    ngay: '2026-09-05',
    thu: 'Thứ Bảy',
    gio: '09:00',
    gioKetThuc: '11:30',
    noiDung: 'Gặp mặt thân mật Ban liên lạc cán bộ hưu trí Viện KHCNXD',
    thanhPhan: 'Đảng ủy, Ban Giám đốc, Hội Cựu chiến binh, Ban liên lạc hưu trí',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
    ghiChu: 'Chuẩn bị quà lưu niệm và tiệc trà thân mật.',
  },

  // ── TUẦN 2: 07/09 - 13/09/2026 (TUẦN HIỆN TẠI) ──
  {
    id: '8',
    ngay: '2026-09-07',
    thu: 'Thứ Hai',
    gio: '08:00',
    gioKetThuc: '09:00',
    noiDung: 'Chào cờ đầu tuần & Họp giao ban Thường trực Lãnh đạo Viện tuần 37',
    thanhPhan: 'Ban Giám đốc Viện, Trưởng phòng TCCB, Chánh Văn phòng',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: '9',
    ngay: '2026-09-07',
    thu: 'Thứ Hai',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'Đăng ký phòng họp: Sinh hoạt Chi bộ Khối Phòng chức năng định kỳ',
    thanhPhan: 'Đảng ủy Viện, Bí thư các Chi bộ trực thuộc',
    chuTri: 'Bí thư Đảng ủy Viện',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'Phong-hop',
    trangThai: 'Da-duyet',
  },
  {
    id: '10',
    ngay: '2026-09-08',
    thu: 'Thứ Ba',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Giao ban Ban Giám đốc Viện mở rộng & Đánh giá công tác tháng 9',
    thanhPhan: 'Ban Giám đốc, Trưởng các Phòng chức năng, Giám đốc các Trung tâm',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
    ghiChu: 'Chuẩn bị tài liệu báo cáo tài chính quý III, máy chiếu, âm thanh hội nghị.',
    noiDungBaoCao: 'Đã thông qua báo cáo tiến độ 18 đề tài cấp Bộ; yêu cầu Ban QLDA đẩy nhanh giải ngân trước 30/09.',
  },
  {
    id: '11',
    ngay: '2026-09-08',
    thu: 'Thứ Ba',
    gio: '14:00',
    gioKetThuc: '16:30',
    noiDung: 'Họp rà soát tiến độ biên soạn QCVN 04:2026/BXD về Nhà chung cư',
    thanhPhan: 'Phòng QLKH, Ban biên soạn TCVN/QCVN, Cục Giám định BXD',
    chuTri: 'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
    ghiChu: 'Họp kết hợp trực tuyến Zoom với các chuyên gia TP. Hồ Chí Minh.',
  },
  {
    id: '12',
    ngay: '2026-09-09',
    thu: 'Thứ Tư',
    gio: '08:00',
    gioKetThuc: '17:00',
    noiDung: 'Khảo sát hiện trường & kiểm định độc lập kết cấu bê tông Cảng Hàng không Quốc tế Long Thành',
    thanhPhan: 'Đoàn công tác Trung tâm Địa kỹ thuật, Phòng TN LAS-XD 18',
    chuTri: 'TS. Lê Minh Long - Phó Viện trưởng',
    diaDiem: 'Công trường Cảng HKQT Long Thành, Đồng Nai',
    xeCongTac: 'Xe 7 chỗ (29A-888.99) - Ford Everest',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
    ghiChu: 'Mang theo thiết bị siêu âm bê tông cốt thép chuyên dụng.',
  },
  {
    id: '13',
    ngay: '2026-09-09',
    thu: 'Thứ Tư',
    gio: '09:30',
    gioKetThuc: '11:30',
    noiDung: 'Làm việc với đoàn chuyên gia Cơ quan Hợp tác Quốc tế Nhật Bản (JICA)',
    thanhPhan: 'Phòng Hợp tác Quốc tế, Phòng Thí nghiệm Gió và Động lực học',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
    ghiChu: 'Cung cấp tài liệu song ngữ Anh - Việt, lễ tân khánh tiết chu đáo.',
  },
  {
    id: '14',
    ngay: '2026-09-10',
    thu: 'Thứ Năm',
    gio: '10:00',
    gioKetThuc: '12:00',
    noiDung: 'Đăng ký phòng họp: Bảo vệ đề cương luận án Tiến sĩ NCS Nguyễn Văn Thành',
    thanhPhan: 'Hội đồng chấm luận án, Ban Đào tạo Sau đại học, NCS',
    chuTri: 'GS.TS. Hoàng Tùng - Chủ tịch Hội đồng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'Phong-hop',
    trangThai: 'Cho-duyet',
    ghiChu: 'Cần màn hình trình chiếu 85 inch, 02 micro không dây.',
  },
  {
    id: '15',
    ngay: '2026-09-10',
    thu: 'Thứ Năm',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'Hội thảo chuyên đề: Ứng dụng AI và BIM trong kiểm tra an toàn kết cấu công trình ngầm',
    thanhPhan: 'Toàn thể cán bộ nghiên cứu Viện, đối tác công nghệ và đại biểu',
    chuTri: 'TS. Nguyễn Hồng Hải - Phó Viện trưởng',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-tuan',
    trangThai: 'Da-duyet',
    ghiChu: 'Phát trực tiếp trên Kênh đào tạo nội bộ IBST.',
  },
  {
    id: '16',
    ngay: '2026-09-11',
    thu: 'Thứ Sáu',
    gio: '09:00',
    gioKetThuc: '11:30',
    noiDung: 'Họp kiểm điểm dự án nâng cấp năng lực phòng thử nghiệm chuyên ngành LAS-XD',
    thanhPhan: 'Phòng Quản lý LIMS & Lab, Ban Kế hoạch Tài chính, Đại diện các phòng TN',
    chuTri: 'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
    ghiChu: 'Rà soát hồ sơ mua sắm trang thiết bị đo đạc quang phổ mới.',
  },
  {
    id: '17',
    ngay: '2026-09-11',
    thu: 'Thứ Sáu',
    gio: '14:00',
    gioKetThuc: '16:00',
    noiDung: 'Đăng ký phòng họp: Hội đồng tuyển dụng viên chức đợt 2 năm 2026',
    thanhPhan: 'Hội đồng tuyển dụng, Ban kiểm tra sát hạch chuyên môn',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'Phong-hop',
    trangThai: 'Cho-duyet',
    ghiChu: 'Cần bảo mật tuyệt đối, niêm phong đề thi phỏng vấn.',
  },
  {
    id: '18',
    ngay: '2026-09-12',
    thu: 'Thứ Bảy',
    gio: '08:30',
    gioKetThuc: '16:30',
    noiDung: 'Tập huấn kỹ năng kiểm toán năng lượng và công trình xanh theo tiêu chuẩn LOTUS/LEED',
    thanhPhan: 'Cán bộ kỹ thuật Trung tâm Thiết bị và Công nghệ Môi trường',
    chuTri: 'Trưởng phòng Đào tạo & HTQT',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Xe 16 chỗ (29B-123.45) - Ford Transit',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
    ghiChu: 'Chuẩn bị teabreak sáng và chiều.',
  },

  // ── TUẦN 3: 14/09 - 18/09/2026 (CHÍNH THỨC BAN GIÁM ĐỐC VIỆN KHCN XÂY DỰNG) ──
  // THỨ HAI 14/09
  {
    id: 'w3_01',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Đề án Tiêu chuẩn công trình xanh (TTKCT a.Trung, a.Phương, KHKT)',
    thanhPhan: 'TTKCT a.Trung, a.Phương, KHKT',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_02',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Họp ở BXD',
    thanhPhan: 'Viện trưởng & đoàn công tác',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Bộ Xây dựng (BXD)',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_03',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Lv nhóm QC 7-11',
    thanhPhan: 'Nhóm QC 7-11',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_04',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '14:00',
    gioKetThuc: '16:30',
    noiDung: 'Họp với TTr N.T.Văn (đk)',
    thanhPhan: 'TTr N.T.Văn, Ban Giám đốc',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng họp 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_05',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'L/v tại Viện',
    thanhPhan: 'Các đơn vị chuyên môn liên quan',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_06',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '15:00',
    gioKetThuc: '17:30',
    noiDung: 'Giao ban SCN (A.Cường báo, mời C.Vân, A.Mạnh, TVGS, đv thi công)',
    thanhPhan: 'A.Cường báo, mời C.Vân, A.Mạnh, TVGS, đv thi công',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_07',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Kế hoạch hội thảo QC 06; 10h Các hồ sơ TC trình bộ',
    thanhPhan: 'Tổ biên soạn QC 06, Phòng KHKT',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng họp 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_08',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'Rà soát các nhiệm vụ đang thực hiện (mời các nhóm)',
    thanhPhan: 'Các nhóm thực hiện nhiệm vụ',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },

  // THỨ BA 15/09
  {
    id: 'w3_09',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Dự Hội thảo tại Tổng hội xây dựng',
    thanhPhan: 'Viện trưởng & đại diện các chuyên gia',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Tổng hội Xây dựng',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_10',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Làm việc ở Viện',
    thanhPhan: 'Lãnh đạo các phòng chuyên môn',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_11',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Lv nhóm QC04-4',
    thanhPhan: 'Nhóm nghiên cứu QC04-4',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng họp 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_12',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Lv với anh Liêm; 15h30 Lv nhóm KĐ Tàu Hũ (a.Tuấn, a.Nghĩa)',
    thanhPhan: 'Anh Liêm, anh Tuấn, anh Nghĩa',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_13',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Họp BXD',
    thanhPhan: 'Lãnh đạo Viện & các ban chuyên môn',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Bộ Xây dựng (BXD)',
    xeCongTac: 'Xe 7 chỗ (29A-888.99) - Ford Everest',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_14',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'L/v tại Viện',
    thanhPhan: 'Các đơn vị nghiệp vụ',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_15',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '08:00',
    gioKetThuc: '11:30',
    noiDung: 'Dự hội thảo Tổng hội XD',
    thanhPhan: 'Đoàn đại biểu IBST',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Tổng hội Xây dựng',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_16',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'Họp tại BXD (đ/k)',
    thanhPhan: 'Đoàn công tác Viện',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Bộ Xây dựng (BXD)',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },

  // THỨ TƯ 16/09
  {
    id: 'w3_17',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Chương trình Hội thảo Kết cấu Gỗ (TTKCT a.Phương)',
    thanhPhan: 'TTKCT a.Phương, các chuyên gia',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Hội trường',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_18',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Xem xét Tiếp thu ý kiến về QCVN 02 (TTKCT)',
    thanhPhan: 'TTKCT & tổ biên soạn',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_19',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Lv với Vụ KH (chủ trì TC EN nhóm ĐKT c/b)',
    thanhPhan: 'Vụ KH, nhóm ĐKT',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Bộ Xây dựng (BXD)',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_20',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Lv về CĐS (KHKT)',
    thanhPhan: 'Phòng KHKT, Ban CĐS',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_21',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'L/v tại Viện',
    thanhPhan: 'Các đơn vị trực thuộc',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_22',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '15:00',
    gioKetThuc: '17:30',
    noiDung: 'L/v với C.Hoài, C.Tâm, C.Vân',
    thanhPhan: 'C.Hoài, C.Tâm, C.Vân',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng họp 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_23',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'QC 06 và các TC vệ tinh (mời các nhóm thực hiện)',
    thanhPhan: 'Các nhóm thực hiện tiêu chuẩn',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_24',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'TC bảo vệ chống khói và ngăn chặn cháy lan (mời nhóm thực hiện)',
    thanhPhan: 'Nhóm thực hiện chuyên đề',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },

  // THỨ NĂM 17/09
  {
    id: 'w3_25',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Họp ở BXD',
    thanhPhan: 'Viện trưởng & đoàn công tác',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Bộ Xây dựng (BXD)',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_26',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'QCVN 04-1 (a.Mạnh báo)',
    thanhPhan: 'A.Mạnh & ban soạn thảo',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_27',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Lv về cải tạo HT điện (TCHC báo)',
    thanhPhan: 'Phòng TCHC báo cáo',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_28',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Làm việc nội bộ (X)',
    thanhPhan: 'Ban Giám đốc',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_29',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'L/v tại Viện',
    thanhPhan: 'Các đơn vị trực thuộc',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_30',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '15:00',
    gioKetThuc: '17:30',
    noiDung: 'Công tác triển khai TK, thanh toán 3 gói SC BXD (A.Cường báo, A.Liêm, A.Thành KCT, A.Tuấn, A.Long VKC)',
    thanhPhan: 'A.Cường báo, A.Liêm, A.Thành KCT, A.Tuấn, A.Long VKC',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_31',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'QC 06',
    thanhPhan: 'Tổ công tác QC 06',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng họp 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_32',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'TC Yêu cầu bảo vệ chịu lửa và TC thoát nạn (mời nhóm thực hiện)',
    thanhPhan: 'Nhóm thực hiện',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },

  // THỨ SÁU 18/09
  {
    id: 'w3_33',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Họp ở BXD',
    thanhPhan: 'Viện trưởng & đoàn công tác',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Bộ Xây dựng (BXD)',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_34',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Làm việc ở Viện',
    thanhPhan: 'Các đơn vị chuyên môn',
    chuTri: 'TS. Nguyễn Hồng Hải - Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_35',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Rà soát Cv với P.KHKT',
    thanhPhan: 'Lãnh đạo Phòng KHKT',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_36',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Lv ở Viện',
    thanhPhan: 'Lãnh đạo phòng chuyên môn',
    chuTri: 'Đinh Quốc Dân - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_37',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'L/v tại Viện',
    thanhPhan: 'Các phòng thí nghiệm & đơn vị',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_38',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'L/v C.Hằng TTPTCN &VLXD',
    thanhPhan: 'C.Hằng TTPTCN &VLXD',
    chuTri: 'Nguyễn Thanh Bình - Phó Viện trưởng',
    diaDiem: 'Phòng họp 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_39',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'TC Phân loại kỹ thuật về cháy (mời nhóm thực hiện)',
    thanhPhan: 'Nhóm thực hiện',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng họp 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: 'w3_40',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '14:30',
    gioKetThuc: '17:00',
    noiDung: 'Làm việc ở Viện',
    thanhPhan: 'Ban Giám đốc & các chuyên gia',
    chuTri: 'Cao Duy Khôi - Phó Viện trưởng',
    diaDiem: 'Phòng Lãnh đạo',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: '26',
    ngay: '2026-09-19',
    thu: 'Thứ Bảy',
    gio: '08:00',
    gioKetThuc: '12:00',
    noiDung: 'Đại hội Đoàn TNCS Hồ Chí Minh Viện Khoa học Công nghệ Xây dựng nhiệm kỳ 2026-2028',
    thanhPhan: 'Đoàn viên thanh niên các Phân viện, Trung tâm và Khối cơ quan',
    chuTri: 'Bí thư Đoàn Thanh niên Viện',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },

  // ── TUẦN 4: 21/09 - 27/09/2026 ──
  {
    id: '27',
    ngay: '2026-09-21',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:00',
    noiDung: 'Giao ban Ban Giám đốc Viện tuần 39 & Thúc đẩy nhiệm vụ KHCN Quý IV',
    thanhPhan: 'Ban Giám đốc Viện, Trưởng các đơn vị trực thuộc',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: '28',
    ngay: '2026-09-22',
    thu: 'Thứ Ba',
    gio: '09:00',
    gioKetThuc: '11:30',
    noiDung: 'Họp Tổ công tác rà soát quy chế phân phối thu nhập và cơ chế khoán tài chính Điều 11 QC 2815',
    thanhPhan: 'Ban soạn thảo quy chế nội bộ, đại diện Công đoàn, Phòng KHTC',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: '29',
    ngay: '2026-09-23',
    thu: 'Thứ Tư',
    gio: '08:00',
    gioKetThuc: '17:00',
    noiDung: 'Khảo sát hiện trường quan trắc địa kỹ thuật tuyến Metro số 2 Bến Thành - Tham Lương',
    thanhPhan: 'Đoàn cán bộ kỹ thuật Phân viện Khoa học Công nghệ Xây dựng Miền Nam',
    chuTri: 'TS. Lê Minh Long - Phó Viện trưởng',
    diaDiem: 'Hiện trường tuyến Metro số 2, TP. Hồ Chí Minh',
    xeCongTac: 'Tự túc phương tiện',
    loai: 'business_trip',
    trangThai: 'Da-duyet',
  },
  {
    id: '30',
    ngay: '2026-09-24',
    thu: 'Thứ Năm',
    gio: '14:00',
    gioKetThuc: '16:30',
    noiDung: 'Đăng ký phòng họp: Hội đồng đánh giá xếp loại viên chức & lao động quý III/2026',
    thanhPhan: 'Hội đồng thi đua khen thưởng, Trưởng các phòng ban',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'Phong-hop',
    trangThai: 'Cho-duyet',
  },
  {
    id: '31',
    ngay: '2026-09-25',
    thu: 'Thứ Sáu',
    gio: '09:00',
    gioKetThuc: '11:30',
    noiDung: 'Làm việc với Lãnh đạo Vụ Khoa học Công nghệ và Môi trường - Bộ Xây dựng về kế hoạch tiêu chuẩn 2027',
    thanhPhan: 'Lãnh đạo Vụ KHCN&MT, Ban Giám đốc Viện, Phòng QLKH',
    chuTri: 'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Xe 4 chỗ (29A-678.90) - Toyota Camry',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },

  // ── TUẦN 5: 28/09 - 30/09/2026 ──
  {
    id: '32',
    ngay: '2026-09-28',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:00',
    noiDung: 'Giao ban Ban Giám đốc Viện tuần 40 & Tổng kết hoạt động Quý III/2026',
    thanhPhan: 'Ban Giám đốc, Trưởng tất cả 21 đơn vị chuyên môn và phòng chức năng',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: '33',
    ngay: '2026-09-29',
    thu: 'Thứ Ba',
    gio: '08:30',
    gioKetThuc: '17:00',
    noiDung: 'Hội thảo Khoa học Quốc tế: Công nghệ Kháng chấn và Kết cấu Công trình siêu cao tầng ứng phó Biến đổi khí hậu',
    thanhPhan: 'Các chuyên gia quốc tế (Nhật Bản, Hàn Quốc, Hoa Kỳ), Viện nghiên cứu, Trường Đại học và Doanh nghiệp xây dựng',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Xe 16 chỗ (29B-123.45) - Ford Transit',
    loai: 'Lich-tuan',
    trangThai: 'Da-duyet',
    ghiChu: 'Chuẩn bị cabin dịch song ngữ, truyền hình trực tiếp trên cổng thông tin.',
  },
  {
    id: '34',
    ngay: '2026-09-30',
    thu: 'Thứ Tư',
    gio: '14:00',
    gioKetThuc: '17:00',
    noiDung: 'Họp kiểm điểm tiến độ giải ngân kinh phí sự nghiệp khoa học và khóa sổ tài chính Quý III/2026',
    thanhPhan: 'Ban Giám đốc Viện, Phòng KHTC, Kế toán các Trung tâm',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
];

const DAYS_OF_WEEK = ['Thứ 2', 'Thứ 3', 'Thứ 4', 'Thứ 5', 'Thứ 6', 'Thứ 7', 'CN'];
const MONTHS = [
  'Tháng 01', 'Tháng 02', 'Tháng 03', 'Tháng 04', 'Tháng 05', 'Tháng 06',
  'Tháng 07', 'Tháng 08', 'Tháng 09', 'Tháng 10', 'Tháng 11', 'Tháng 12'
];

const EVENT_TYPE_OPTIONS: { value: AgencyEventType | ''; label: string; hex: string }[] = [
  { value: '', label: 'Tất cả loại sự kiện', hex: '#64748b' },
  { value: 'Lich-BGĐ', label: 'Họp Ban Giám đốc Viện', hex: '#6366f1' },
  { value: 'Lich-tuan', label: 'Lịch Tuần Viện', hex: '#f59e0b' },
  { value: 'meeting', label: 'Hội nghị, họp chuyên môn', hex: '#0284c7' },
  { value: 'business_trip', label: 'Đi công tác hiện trường', hex: '#ea580c' },
  { value: 'Phong-hop', label: 'Đặt phòng họp / Hội trường', hex: '#10b981' },
  { value: 'internal_event', label: 'Làm việc nội bộ / Tập huấn', hex: '#9333ea' },
  { value: 'other', label: 'Khác', hex: '#64748b' },
];

export const ROOM_OPTIONS = [
  'Phòng Lãnh đạo',
  'Phòng họp 1',
  'Phòng họp 2',
  'Hội trường',
  'Bộ Xây dựng (BXD)',
  'Phòng làm việc chuyên môn',
  'Hiện trường / Công tác ngoài',
];

export const VEHICLE_OPTIONS = [
  'Không yêu cầu',
  'Xe 7 chỗ (29A-888.99) - Ford Everest',
  'Xe 16 chỗ (29B-123.45) - Ford Transit',
  'Xe 4 chỗ (29A-678.90) - Toyota Camry',
  'Tự túc phương tiện',
];

export const LEADER_OPTIONS = [
  'TS. Nguyễn Hồng Hải - Viện trưởng',
  'Đinh Quốc Dân - Phó Viện trưởng',
  'Nguyễn Thanh Bình - Phó Viện trưởng',
  'Cao Duy Khôi - Phó Viện trưởng',
  'Ban Giám đốc Viện',
  'Trưởng các đơn vị chuyên môn',
];

export type LeaderMatrixKey = 'vientruong' | 'dan' | 'binh' | 'khoi';

export interface LeaderColumnDef {
  key: LeaderMatrixKey;
  headerTitle: string;
  subHeader?: string;
  personName: string;
  roleTitle: string;
  defaultLeaderVal: string;
}

export const MATRIX_LEADERS: LeaderColumnDef[] = [
  {
    key: 'vientruong',
    headerTitle: 'VIỆN TRƯỞNG',
    personName: 'TS. Nguyễn Hồng Hải',
    roleTitle: 'Viện trưởng',
    defaultLeaderVal: 'TS. Nguyễn Hồng Hải - Viện trưởng',
  },
  {
    key: 'dan',
    headerTitle: 'ĐINH QUỐC DÂN',
    subHeader: 'PHÓ VIỆN TRƯỞNG',
    personName: 'Đinh Quốc Dân',
    roleTitle: 'Phó Viện trưởng',
    defaultLeaderVal: 'Đinh Quốc Dân - Phó Viện trưởng',
  },
  {
    key: 'binh',
    headerTitle: 'NGUYỄN THANH BÌNH',
    subHeader: 'PHÓ VIỆN TRƯỞNG',
    personName: 'Nguyễn Thanh Bình',
    roleTitle: 'Phó Viện trưởng',
    defaultLeaderVal: 'Nguyễn Thanh Bình - Phó Viện trưởng',
  },
  {
    key: 'khoi',
    headerTitle: 'CAO DUY KHÔI',
    subHeader: 'PHÓ VIỆN TRƯỞNG',
    personName: 'Cao Duy Khôi',
    roleTitle: 'Phó Viện trưởng',
    defaultLeaderVal: 'Cao Duy Khôi - Phó Viện trưởng',
  },
];

export function getLeaderMatrixKey(arg: LichCongTac | string): LeaderMatrixKey | null {
  if (typeof arg === 'object' && arg !== null) {
    if (arg.cotMaTran === 'vien_truong') return 'vientruong';
    if (arg.cotMaTran === 'dan') return 'dan';
    if (arg.cotMaTran === 'binh') return 'binh';
    if (arg.cotMaTran === 'khoi') return 'khoi';
    arg = arg.chuTri || '';
  }
  const norm = (arg || '').toLowerCase();
  if (norm.includes('viện trưởng') && !norm.includes('phó')) return 'vientruong';
  if (norm.includes('hải') && (norm.includes('viện trưởng') || norm.includes('nguyễn hồng hải'))) return 'vientruong';
  if (norm.includes('dân') || norm.includes('đinh quốc dân')) return 'dan';
  if (norm.includes('bình') || norm.includes('nguyễn thanh bình')) return 'binh';
  if (norm.includes('khôi') || norm.includes('cao duy khôi')) return 'khoi';
  return null;
}

export function isMorningEvent(gio: string): boolean {
  if (!gio) return true;
  const h = parseInt(gio.split(':')[0], 10);
  return h < 12;
}

// Helper: Format date to local YYYY-MM-DD
export function formatLocalDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

// Helper: load from localStorage
function loadEvents(): LichCongTac[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch (e) {
    console.error('Lỗi khi đọc lịch từ localStorage:', e);
  }
  return INITIAL_LICH;
}

// Helper: save to localStorage
function saveEvents(events: LichCongTac[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(events));
  } catch (e) {
    console.error('Lỗi khi lưu lịch vào localStorage:', e);
  }
}

// Helper: check if two dates are same day (avoiding timezone offset issues)
function isSameDay(date1Str: string, date2: Date) {
  return date1Str === formatLocalDate(date2);
}

// Helper: Format event type label & tone
export function getEventTypeBadge(loai: AgencyEventType) {
  switch (loai) {
    case 'Lich-BGĐ':
      return {
        label: 'Họp Lãnh đạo BGĐ',
        cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800/40',
        dot: '#6366f1',
      };
    case 'Lich-tuan':
      return {
        label: 'Lịch Tuần Viện',
        cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800/40',
        dot: '#f59e0b',
      };
    case 'Phong-hop':
      return {
        label: 'Đăng ký phòng họp',
        cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800/40',
        dot: '#10b981',
      };
    case 'meeting':
      return {
        label: 'Hội nghị, cuộc họp',
        cls: 'bg-sky-50 text-sky-700 border-sky-200 dark:bg-sky-900/30 dark:text-sky-300 dark:border-sky-800/40',
        dot: '#0284c7',
      };
    case 'business_trip':
      return {
        label: 'Đi công tác',
        cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800/40',
        dot: '#ea580c',
      };
    case 'internal_event':
      return {
        label: 'Làm việc nội bộ',
        cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800/40',
        dot: '#9333ea',
      };
    default:
      return {
        label: 'Khác',
        cls: 'bg-slate-50 text-slate-700 border-slate-200 dark:bg-slate-800/40 dark:text-slate-300 dark:border-slate-700',
        dot: '#64748b',
      };
  }
}

// ── ChipSelect Component (phỏng theo qlda-ddcn-ht-selfhost) ──
interface ChipSelectProps {
  label: string;
  value: string;
  options: { value: string; label: string; hex?: string }[];
  onChange: (val: string) => void;
}

function ChipSelect({ label, value, options, onChange }: ChipSelectProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const isActive = value !== '';

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  const selectedOpt = options.find((o) => o.value === value);
  const displayLabel = selectedOpt ? selectedOpt.label : label;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={cn(
          'flex items-center gap-1.5 h-8 px-3 rounded-lg text-xs font-semibold border transition-all duration-150 cursor-pointer select-none whitespace-nowrap',
          isActive
            ? 'bg-surface border-primary-500 text-primary-700 dark:text-primary-300 shadow-sm ring-1 ring-primary-500/20'
            : 'bg-surface border-border dark:border-slate-700/80 text-ink-secondary hover:bg-muted dark:hover:bg-slate-800'
        )}
      >
        {isActive && selectedOpt?.hex && (
          <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: selectedOpt.hex }} />
        )}
        <span className="truncate max-w-[140px]">{displayLabel}</span>
        <ChevronDown className={cn('w-3 h-3 opacity-60 transition-transform duration-150', open && 'rotate-180')} />
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1.5 min-w-[200px] max-h-72 overflow-y-auto bg-surface dark:bg-slate-900 rounded-xl shadow-xl border border-border dark:border-slate-700/80 py-1.5 z-50 animate-in fade-in">
          {options.map((opt) => {
            const selected = value === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => {
                  onChange(opt.value);
                  setOpen(false);
                }}
                className={cn(
                  'w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-left transition-colors cursor-pointer',
                  selected
                    ? 'bg-primary-50 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300 font-bold'
                    : 'text-ink-secondary hover:bg-muted dark:hover:bg-slate-800'
                )}
              >
                {opt.hex && (
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: opt.hex }} />
                )}
                <span className="flex-1 truncate">{opt.label}</span>
                {selected && <Check className="w-3.5 h-3.5 text-primary" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LichCoQuanPage() {
  const { toast } = useToast();
  const [list, setList] = useState<LichCongTac[]>(loadEvents);

  // Sync to localStorage
  useEffect(() => {
    saveEvents(list);
  }, [list]);

  // View mode: 'month' | 'week' | 'day' | 'agenda' | 'manage' | 'lobby'
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda' | 'manage' | 'lobby'>('week');

  // Date states - Mặc định vào ngày 14/09/2026 (Thứ Hai, tuần chính thức theo mẫu Viện)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 14));
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

  // Chế độ tuần: 'matrix' (Bảng Ban Giám đốc chuẩn Viện) hoặc 'columns' (Dạng cột 7 ngày)
  const [weekLayout, setWeekLayout] = useState<'matrix' | 'columns'>('matrix');
  const [showWeekend, setShowWeekend] = useState<boolean>(false);

  // Ghi chú tuần
  const [weekNote, setWeekNote] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('ibst_week_notes_2026-w38') ||
        'Phòng KHKT, TTKCT và các đơn vị chuyên môn chuẩn bị đầy đủ hồ sơ, tài liệu phục vụ các buổi họp và làm việc của Lãnh đạo Viện.'
      );
    } catch {
      return 'Phòng KHKT, TTKCT và các đơn vị chuyên môn chuẩn bị đầy đủ hồ sơ, tài liệu phục vụ các buổi họp và làm việc của Lãnh đạo Viện.';
    }
  });
  const [editingWeekNote, setEditingWeekNote] = useState<boolean>(false);
  const [weekNoteInput, setWeekNoteInput] = useState<string>(weekNote);

  // Danh mục phòng họp, xe & nhân sự từ Supabase
  const [phongHops, setPhongHops] = useState<PhongHop[]>([]);
  const [xeList, setXeList] = useState<XeCongTac[]>([]);
  const [nhanSuList, setNhanSuList] = useState<NhanSuGoiY[]>([]);
  const [conflicts, setConflicts] = useState<ConflictInfo[]>([]);
  const [checkingConflict, setCheckingConflict] = useState(false);
  const [loadingData, setLoadingData] = useState(false);

  // Nạp dữ liệu ban đầu từ Supabase & Realtime
  const refreshData = async () => {
    try {
      setLoadingData(true);
      const [events, rooms, vehicles, nhanSu, note] = await Promise.all([
        getLichCoQuan(),
        getDanhMucPhongHop(),
        getDanhMucXeCongTac(),
        getNhanSuGoiY(),
        getGhiChuTuan(2026, 37),
      ]);

      if (events && events.length > 0) {
        const mapped: LichCongTac[] = events.map((ev) => ({
          id: ev.id,
          tieuDe: ev.tieuDe,
          noiDung: ev.noiDung || ev.tieuDe,
          ngay: ev.ngay,
          thu: ev.thu,
          buoi: ev.buoi,
          gio: ev.gioBatDau,
          gioKetThuc: ev.gioKetThuc,
          lanhDaoChuTri: ev.lanhDaoChuTri,
          chuTri: ev.lanhDaoChuTri,
          cotMaTran: ev.cotMaTran,
          donViChuanBi: ev.donViChuanBi,
          nguoiChuanBi: ev.nguoiChuanBi,
          nhanSuId: ev.nhanSuId,
          thanhPhan: ev.thanhPhan,
          diaDiem: ev.diaDiem,
          phongHopId: ev.phongHopId,
          xeCongTac: ev.xeCongTac,
          xeId: ev.xeId,
          loai: (ev.loaiLich as AgencyEventType) || 'Lich-tuan',
          trangThai: ev.trangThai === 'Da-duyet' ? 'Da-duyet' : ev.trangThai === 'Cho-duyet' ? 'Cho-duyet' : 'Tu-choi',
          ghiChu: ev.ghiChuChuanBi,
          noiDungBaoCao: ev.bienBanKetLuan,
        }));
        setList(mapped);
        saveEvents(mapped);
      }
      if (rooms && rooms.length > 0) setPhongHops(rooms);
      if (vehicles && vehicles.length > 0) setXeList(vehicles);
      if (nhanSu && nhanSu.length > 0) setNhanSuList(nhanSu);
      if (note) setWeekNote(note);
    } catch (err) {
      console.warn('Lỗi nạp dữ liệu lịch cơ quan từ Supabase:', err);
    } finally {
      setLoadingData(false);
    }
  };

  useEffect(() => {
    refreshData();
    const unsubscribe = subscribeLichCoQuan(() => {
      refreshData();
    });
    return () => unsubscribe();
  }, []);

  const handleSaveWeekNote = async () => {
    const trimmed = weekNoteInput.trim();
    setWeekNote(trimmed);
    try {
      localStorage.setItem('ibst_week_notes_2026-w38', trimmed);
      await saveGhiChuTuan(2026, 37, '2026-09-14', '2026-09-18', trimmed);
    } catch (e) {
      console.error(e);
    }
    setEditingWeekNote(false);
    toast.success('Đã lưu ghi chú tuần!');
  };

  // Filter states
  const [filterType, setFilterType] = useState<string>('');
  const [filterRoom, setFilterRoom] = useState<string>('');
  const [filterLeader, setFilterLeader] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals & Panels state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LichCongTac | null>(null);
  const [detailItem, setDetailItem] = useState<LichCongTac | null>(null);
  const [detailTab, setDetailTab] = useState<'info' | 'report'>('info');

  // Form states nâng cấp theo chuẩn Mẫu Viện
  const [form, setForm] = useState<{
    ngay: string;
    thu: string;
    buoi: 'sang' | 'chieu' | 'ca_ngay';
    gio: string;
    gioKetThuc: string;
    noiDung: string;
    donViChuanBi: string;
    cotMaTran: 'vien_truong' | 'dan' | 'binh' | 'khoi' | 'khac';
    thanhPhan: string;
    chuTri: string;
    diaDiem: string;
    phongHopId: string;
    xeCongTac: string;
    xeId: string;
    loai: AgencyEventType;
    ghiChu: string;
    noiDungBaoCao: string;
  }>({
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    buoi: 'sang',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: '',
    donViChuanBi: '',
    cotMaTran: 'vien_truong',
    thanhPhan: '',
    chuTri: LEADER_OPTIONS[0],
    diaDiem: ROOM_OPTIONS[0],
    phongHopId: '',
    xeCongTac: 'Không yêu cầu',
    xeId: '',
    loai: 'Lich-BGĐ',
    ghiChu: '',
    noiDungBaoCao: '',
  });

  // Kiểm tra xung đột Phòng họp & Xe công tác thời gian thực
  useEffect(() => {
    let active = true;
    if (!form.ngay || !form.gio || (!form.phongHopId && !form.xeId)) {
      setConflicts([]);
      return;
    }

    const runCheck = async () => {
      setCheckingConflict(true);
      const results = await checkXungDotPhongXe({
        ngay: form.ngay,
        gioBatDau: form.gio,
        gioKetThuc: form.gioKetThuc || undefined,
        phongHopId: form.phongHopId || undefined,
        xeId: form.xeId || undefined,
        excludeId: editingItem ? editingItem.id : undefined,
      });
      if (active) {
        setConflicts(results);
        setCheckingConflict(false);
      }
    };

    const t = setTimeout(runCheck, 300);
    return () => {
      active = false;
      clearTimeout(t);
    };
  }, [form.ngay, form.gio, form.gioKetThuc, form.phongHopId, form.xeId, editingItem]);

  // Clock & Display Mode for Lobby mode
  const [lobbyTime, setLobbyTime] = useState<Date>(new Date());
  const [lobbyScope, setLobbyScope] = useState<'today' | 'week'>('week');
  const [lobbyLayout, setLobbyLayout] = useState<'matrix' | 'list'>('matrix');
  const [lobbyPage, setLobbyPage] = useState(0);
  const LOBBY_PAGE_SIZE = 7;

  // Greeting sentence for Lobby mode (Câu chào sảnh)
  const [lobbyGreeting, setLobbyGreeting] = useState<string>(() => {
    try {
      return (
        localStorage.getItem('ibst_lobby_greeting') ||
        'Nhiệt liệt chào mừng Quý Đại biểu, Quý Đối tác và các Đoàn công tác đến thăm, làm việc tại Viện Khoa học Công nghệ Xây dựng (IBST)!'
      );
    } catch {
      return 'Nhiệt liệt chào mừng Quý Đại biểu, Quý Đối tác và các Đoàn công tác đến thăm, làm việc tại Viện Khoa học Công nghệ Xây dựng (IBST)!';
    }
  });
  const [editingGreeting, setEditingGreeting] = useState(false);
  const [greetingInput, setGreetingInput] = useState(lobbyGreeting);

  const handleSaveGreeting = () => {
    const trimmed = greetingInput.trim();
    if (trimmed) {
      setLobbyGreeting(trimmed);
      try {
        localStorage.setItem('ibst_lobby_greeting', trimmed);
      } catch (e) {
        console.error(e);
      }
    }
    setEditingGreeting(false);
  };

  useEffect(() => {
    let interval: any;
    if (view === 'lobby') {
      interval = setInterval(() => setLobbyTime(new Date()), 1000);
    }
    return () => clearInterval(interval);
  }, [view]);

  // Fullscreen state & handler
  const [isFullscreen, setIsFullscreen] = useState(false);
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      const el = document.getElementById('lobby-tv-container');
      if (el && el.requestFullscreen) {
        el.requestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  // KPI Statistics
  const countWeek = list.filter((x) => x.loai !== 'Phong-hop' && x.trangThai === 'Da-duyet').length;
  const countPendingRooms = list.filter((x) => x.trangThai === 'Cho-duyet').length;
  const countBgd = list.filter((x) => x.loai === 'Lich-BGĐ').length;
  const countVehicles = list.filter((x) => x.xeCongTac && x.xeCongTac !== 'Không yêu cầu' && x.xeCongTac !== 'Tự túc phương tiện').length;

  // Calendar cells generation for Month view
  const calendarCells = useMemo(() => {
    const startOfMonthDate = new Date(currentYear, currentMonth, 1);
    const endOfMonthDate = new Date(currentYear, currentMonth + 1, 0);

    let startDayOfWeek = startOfMonthDate.getDay();
    if (startDayOfWeek === 0) startDayOfWeek = 7; // Monday = 1, Sunday = 7

    const prevMonthEndDate = new Date(currentYear, currentMonth, 0);
    const totalDaysInPrevMonth = prevMonthEndDate.getDate();

    const prevMonthCellsCount = startDayOfWeek - 1;
    const cells = [];

    // Prev month days
    for (let i = prevMonthCellsCount - 1; i >= 0; i--) {
      const day = totalDaysInPrevMonth - i;
      cells.push({
        date: new Date(currentYear, currentMonth - 1, day),
        isCurrentMonth: false,
        dayNumber: day,
      });
    }

    // Current month days
    const totalDaysInCurrentMonth = endOfMonthDate.getDate();
    for (let i = 1; i <= totalDaysInCurrentMonth; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth, i),
        isCurrentMonth: true,
        dayNumber: i,
      });
    }

    // Next month days to fill
    const totalCells = cells.length <= 35 ? 35 : 42;
    const nextMonthCellsCount = totalCells - cells.length;
    for (let i = 1; i <= nextMonthCellsCount; i++) {
      cells.push({
        date: new Date(currentYear, currentMonth + 1, i),
        isCurrentMonth: false,
        dayNumber: i,
      });
    }

    return cells;
  }, [currentMonth, currentYear]);

  // Navigate handlers
  const handlePrev = () => {
    if (view === 'month') {
      setSelectedDate(new Date(currentYear, currentMonth - 1, 1));
    } else if (view === 'week') {
      setSelectedDate(new Date(selectedDate.getTime() - 7 * 24 * 60 * 60 * 1000));
    } else {
      setSelectedDate(new Date(selectedDate.getTime() - 1 * 24 * 60 * 60 * 1000));
    }
  };

  const handleNext = () => {
    if (view === 'month') {
      setSelectedDate(new Date(currentYear, currentMonth + 1, 1));
    } else if (view === 'week') {
      setSelectedDate(new Date(selectedDate.getTime() + 7 * 24 * 60 * 60 * 1000));
    } else {
      setSelectedDate(new Date(selectedDate.getTime() + 1 * 24 * 60 * 60 * 1000));
    }
  };

  const handleToday = () => {
    setSelectedDate(new Date(2026, 8, 14)); // Ngày 14/09/2026 (Tuần mẫu chính thức)
  };

  // Filtered lists
  const filteredEvents = useMemo(() => {
    return list.filter((item) => {
      const matchesSearch =
        item.noiDung.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.chuTri.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.diaDiem.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.thanhPhan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.xeCongTac && item.xeCongTac.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesType = !filterType || item.loai === filterType;
      const matchesRoom = !filterRoom || item.diaDiem.toLowerCase().includes(filterRoom.toLowerCase());
      const matchesLeader = !filterLeader || item.chuTri.toLowerCase().includes(filterLeader.toLowerCase());

      return matchesSearch && matchesType && matchesRoom && matchesLeader;
    });
  }, [list, searchQuery, filterType, filterRoom, filterLeader]);

  // Active filters count
  const activeFiltersCount =
    (filterType !== '' ? 1 : 0) +
    (filterRoom !== '' ? 1 : 0) +
    (filterLeader !== '' ? 1 : 0) +
    (searchQuery !== '' ? 1 : 0);

  const clearFilters = () => {
    setFilterType('');
    setFilterRoom('');
    setFilterLeader('');
    setSearchQuery('');
  };

  // Week calculations for Matrix, Lobby TV & Print
  const { mondayDate, numWeekDays, weekRangeText, matrixDays, currentDayOfWeek } = useMemo(() => {
    const currentDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
    const mDate = new Date(selectedDate.getTime() - (currentDayOfWeek - 1) * 24 * 60 * 60 * 1000);
    const numDays = showWeekend ? 7 : 5;
    const lastDayDate = new Date(mDate.getTime() + (numDays - 1) * 24 * 60 * 60 * 1000);
    const rangeText = `Từ ngày ${mDate.getDate()}/${mDate.getMonth() + 1} đến ngày ${lastDayDate.getDate()}/${lastDayDate.getMonth() + 1}/${lastDayDate.getFullYear()}`;

    const days = Array.from({ length: numDays }).map((_, idx) => {
      const d = new Date(mDate.getTime() + idx * 24 * 60 * 60 * 1000);
      const thuShort = ['Hai', 'Ba', 'Tư', 'Năm', 'Sáu', 'Bảy', 'CN'];
      const thuFull = ['Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy', 'Chủ Nhật'];
      const dateStr = formatLocalDate(d);
      return {
        date: d,
        dateStr,
        thuShort: thuShort[idx],
        thuFull: thuFull[idx],
        dayLabel: `${d.getDate()}/${d.getMonth() + 1}`,
        isToday: isSameDay(dateStr, new Date(2026, 8, 14)),
      };
    });

    return {
      mondayDate: mDate,
      numWeekDays: numDays,
      weekRangeText: rangeText,
      matrixDays: days,
      currentDayOfWeek,
    };
  }, [selectedDate, showWeekend]);

  // Lobby events (today or this week)
  const lobbyEvents = useMemo(() => {
    const today = selectedDate;
    if (lobbyScope === 'today') {
      return list
        .filter((e) => isSameDay(e.ngay, today))
        .sort((a, b) => a.gio.localeCompare(b.gio));
    } else {
      // Week: Monday to Sunday of selectedDate
      const currentDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
      const startOfWeekDate = new Date(selectedDate.getTime() - (currentDayOfWeek - 1) * 24 * 60 * 60 * 1000);
      const endOfWeekDate = new Date(startOfWeekDate.getTime() + 6 * 24 * 60 * 60 * 1000);
      const sStr = formatLocalDate(startOfWeekDate);
      const eStr = formatLocalDate(endOfWeekDate);

      return list
        .filter((e) => e.ngay >= sStr && e.ngay <= eStr)
        .sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio));
    }
  }, [list, selectedDate, lobbyScope]);

  // Auto carousel for lobby if multiple pages
  const lobbyTotalPages = Math.ceil(lobbyEvents.length / LOBBY_PAGE_SIZE) || 1;
  useEffect(() => {
    if (view !== 'lobby' || lobbyTotalPages <= 1) return;
    const timer = setInterval(() => {
      setLobbyPage((prev) => (prev + 1) % lobbyTotalPages);
    }, 10000); // 10s per page
    return () => clearInterval(timer);
  }, [view, lobbyTotalPages]);

  const currentLobbyEvents = lobbyEvents.slice(
    lobbyPage * LOBBY_PAGE_SIZE,
    (lobbyPage + 1) * LOBBY_PAGE_SIZE
  );

  // CRUD Handlers
  const handleOpenCreate = (prefilledDate?: Date) => {
    setEditingItem(null);
    const dateStr = prefilledDate
      ? formatLocalDate(prefilledDate)
      : formatLocalDate(selectedDate);

    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(dateStr);
    const thu = days[d.getDay()];

    setForm({
      ngay: dateStr,
      thu,
      buoi: 'sang',
      gio: '08:30',
      gioKetThuc: '11:30',
      noiDung: '',
      donViChuanBi: '',
      cotMaTran: 'vien_truong',
      thanhPhan: '',
      chuTri: LEADER_OPTIONS[0],
      diaDiem: ROOM_OPTIONS[0],
      phongHopId: '',
      xeCongTac: 'Không yêu cầu',
      xeId: '',
      loai: 'Lich-BGĐ',
      ghiChu: '',
      noiDungBaoCao: '',
    });
    setModalOpen(true);
  };

  const handleQuickCreate = (targetDate: Date, leaderVal: string, isMorning: boolean) => {
    setEditingItem(null);
    const dateStr = formatLocalDate(targetDate);
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(dateStr);
    const thu = days[d.getDay()];

    let cot: 'vien_truong' | 'dan' | 'binh' | 'khoi' | 'khac' = 'khac';
    const key = getLeaderMatrixKey(leaderVal);
    if (key === 'vientruong') cot = 'vien_truong';
    else if (key === 'dan') cot = 'dan';
    else if (key === 'binh') cot = 'binh';
    else if (key === 'khoi') cot = 'khoi';

    setForm({
      ngay: dateStr,
      thu,
      buoi: isMorning ? 'sang' : 'chieu',
      gio: isMorning ? '08:30' : '14:00',
      gioKetThuc: isMorning ? '11:30' : '16:30',
      noiDung: '',
      donViChuanBi: '',
      cotMaTran: cot,
      thanhPhan: '',
      chuTri: leaderVal,
      diaDiem: ROOM_OPTIONS[0],
      phongHopId: '',
      xeCongTac: 'Không yêu cầu',
      xeId: '',
      loai: leaderVal.includes('Viện trưởng') ? 'Lich-BGĐ' : 'meeting',
      ghiChu: '',
      noiDungBaoCao: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LichCongTac) => {
    setEditingItem(item);
    let buoi: 'sang' | 'chieu' | 'ca_ngay' = item.buoi || (isMorningEvent(item.gio) ? 'sang' : 'chieu');
    let cot: 'vien_truong' | 'dan' | 'binh' | 'khoi' | 'khac' = item.cotMaTran || 'khac';
    if (!item.cotMaTran) {
      const k = getLeaderMatrixKey(item);
      if (k === 'vientruong') cot = 'vien_truong';
      else if (k === 'dan') cot = 'dan';
      else if (k === 'binh') cot = 'binh';
      else if (k === 'khoi') cot = 'khoi';
    }

    setForm({
      ngay: item.ngay,
      thu: item.thu,
      buoi,
      gio: item.gio,
      gioKetThuc: item.gioKetThuc || '',
      noiDung: item.noiDung,
      donViChuanBi: item.donViChuanBi || '',
      cotMaTran: cot,
      thanhPhan: item.thanhPhan,
      chuTri: item.chuTri,
      diaDiem: item.diaDiem,
      phongHopId: item.phongHopId || '',
      xeCongTac: item.xeCongTac || 'Không yêu cầu',
      xeId: item.xeId || '',
      loai: item.loai,
      ghiChu: item.ghiChu || '',
      noiDungBaoCao: item.noiDungBaoCao || '',
    });
    setModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) return;
    setList((prev) => prev.filter((x) => x.id !== id));
    setDetailItem(null);
    try {
      await deleteLichCoQuan(id);
      toast.success('Đã xóa sự kiện thành công!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleApprove = async (id: string) => {
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, trangThai: 'Da-duyet' } : x)));
    if (detailItem && detailItem.id === id) {
      setDetailItem({ ...detailItem, trangThai: 'Da-duyet' });
    }
    try {
      await approveLichCoQuan(id);
      toast.success('Đã phê duyệt lịch công tác!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSaveReport = async (id: string, reportText: string) => {
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, noiDungBaoCao: reportText } : x)));
    if (detailItem && detailItem.id === id) {
      setDetailItem({ ...detailItem, noiDungBaoCao: reportText });
    }
    try {
      await updateLichCoQuan(id, { bienBanKetLuan: reportText });
      toast.success('Đã lưu kết luận / biên bản cuộc họp thành công!');
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(form.ngay);
    const thu = days[d.getDay()];

    if (editingItem) {
      const updatedItem: LichCongTac = {
        ...editingItem,
        ...form,
        thu,
      };
      setList((prev) => prev.map((x) => (x.id === editingItem.id ? updatedItem : x)));
      saveEvents(list.map((x) => (x.id === editingItem.id ? updatedItem : x)));
      if (detailItem && detailItem.id === editingItem.id) {
        setDetailItem(updatedItem);
      }
      toast.success('Đã cập nhật lịch công tác!');
      try {
        await updateLichCoQuan(editingItem.id, {
          tieuDe: form.noiDung,
          noiDung: form.noiDung,
          ngay: form.ngay,
          thu,
          buoi: form.buoi,
          gioBatDau: form.gio,
          gioKetThuc: form.gioKetThuc || undefined,
          lanhDaoChuTri: form.chuTri,
          cotMaTran: form.cotMaTran,
          donViChuanBi: form.donViChuanBi || undefined,
          thanhPhan: form.thanhPhan,
          diaDiem: form.diaDiem,
          phongHopId: form.phongHopId || undefined,
          xeCongTac: form.xeCongTac || undefined,
          xeId: form.xeId || undefined,
          loaiLich: form.loai,
          ghiChuChuanBi: form.ghiChu || undefined,
          bienBanKetLuan: form.noiDungBaoCao || undefined,
        });
      } catch (err) {
        console.error('Lỗi khi lưu Supabase:', err);
      }
    } else {
      const tempId = String(Date.now());
      const newItem: LichCongTac = {
        id: tempId,
        trangThai: form.loai === 'Phong-hop' ? 'Cho-duyet' : 'Da-duyet',
        ...form,
        thu,
      };
      setList((prev) => [newItem, ...prev]);
      saveEvents([newItem, ...list]);
      toast.success('Đã đăng ký lịch công tác mới!');
      try {
        const created = await createLichCoQuan({
          tieuDe: form.noiDung,
          noiDung: form.noiDung,
          ngay: form.ngay,
          thu,
          buoi: form.buoi,
          gioBatDau: form.gio,
          gioKetThuc: form.gioKetThuc || undefined,
          lanhDaoChuTri: form.chuTri,
          cotMaTran: form.cotMaTran,
          donViChuanBi: form.donViChuanBi || undefined,
          thanhPhan: form.thanhPhan,
          diaDiem: form.diaDiem,
          phongHopId: form.phongHopId || undefined,
          xeCongTac: form.xeCongTac || undefined,
          xeId: form.xeId || undefined,
          loaiLich: form.loai,
          trangThai: form.loai === 'Phong-hop' ? 'Cho-duyet' : 'Da-duyet',
          ghiChuChuanBi: form.ghiChu || undefined,
          bienBanKetLuan: form.noiDungBaoCao || undefined,
        });
        if (created) {
          setList((prev) => prev.map((x) => (x.id === tempId ? { ...newItem, id: created.id } : x)));
        }
      } catch (err) {
        console.error('Lỗi khi thêm Supabase:', err);
      }
    }
    setModalOpen(false);
  };

  // ─── Slide panel: Chi tiết lịch công tác cơ quan ───
  useSlidePanelChiTiet({
    id: 'lich-co-quan-chi-tiet',
    active: !!detailItem,
    title: detailItem ? `Chi tiết: ${detailItem.noiDung}` : 'Chi tiết lịch công tác cơ quan',
    subtitle: detailItem
      ? `Mã: EVENT-${detailItem.id} · ${detailItem.thu}, ${detailItem.ngay} · ${detailItem.gio}${detailItem.gioKetThuc ? ` - ${detailItem.gioKetThuc}` : ''}`
      : undefined,
    icon: <CalendarDays size={14} />,
    storageKey: 'slideover-width-lich-co-quan-chi-tiet',
    minWidth: 540,
    deps: [detailItem, detailTab, list],
    onDongNgoaiLuong: () => setDetailItem(null),
    headerExtra: detailItem ? (
      <div className="flex items-center gap-1.5">
        {detailItem.trangThai === 'Cho-duyet' && (
          <button
            type="button"
            onClick={() => handleApprove(detailItem.id)}
            className="flex items-center gap-1.5 px-2.5 py-1 text-2xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs transition-all cursor-pointer"
            title="Phê duyệt lịch phòng họp"
          >
            <Check size={13} /> Duyệt
          </button>
        )}
        <button
          type="button"
          onClick={() => handleOpenEdit(detailItem)}
          className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1 text-2xs font-bold text-ink-secondary hover:bg-muted transition-all cursor-pointer"
        >
          <Pencil size={13} /> Sửa
        </button>
      </div>
    ) : undefined,
    content: detailItem ? (
      <div>
        <SlideOverTabs tabs={DETAIL_TABS} active={detailTab} onChange={setDetailTab} />
        <div className="p-5 space-y-5">
          {detailTab === 'info' && (
            <div className="space-y-5">
              {/* Nội dung */}
              <div className="space-y-1.5">
                <span className="text-3xs font-black text-ink-muted uppercase tracking-wider">
                  Nội dung cuộc họp / Nhiệm vụ
                </span>
                <p className="text-xs font-bold text-ink leading-relaxed bg-subtle/40 p-3.5 rounded-xl border border-border">
                  {detailItem.noiDung}
                </p>
              </div>

              {/* Phân loại & Trạng thái */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-surface">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider block">
                    Phân loại lịch
                  </span>
                  <div>
                    <span
                      className={cn(
                        'inline-block px-2.5 py-0.5 rounded text-3xs font-bold border',
                        getEventTypeBadge(detailItem.loai).cls
                      )}
                    >
                      {getEventTypeBadge(detailItem.loai).label}
                    </span>
                  </div>
                </div>
                <div className="space-y-1.5 p-3 rounded-xl border border-border bg-surface">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider block">
                    Trạng thái duyệt
                  </span>
                  <div>
                    <span
                      className={cn(
                        'inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-3xs font-bold border',
                        detailItem.trangThai === 'Da-duyet'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-300 dark:border-emerald-800/40'
                          : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-300 dark:border-amber-800/40'
                      )}
                    >
                      {detailItem.trangThai === 'Da-duyet' ? <CheckCircle size={11} /> : <AlertCircle size={11} />}
                      {detailItem.trangThai === 'Da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Thời gian */}
              <div className="grid grid-cols-2 gap-3 text-xs font-medium">
                <div className="space-y-1 p-3 bg-subtle/40 border border-border rounded-xl">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1">
                    <CalendarIcon size={12} className="text-primary" /> Ngày thực hiện
                  </span>
                  <p className="font-bold text-ink">
                    {detailItem.thu}, {detailItem.ngay}
                  </p>
                </div>
                <div className="space-y-1 p-3 bg-subtle/40 border border-border rounded-xl">
                  <span className="text-3xs font-black text-ink-muted uppercase tracking-wider flex items-center gap-1">
                    <Clock size={12} className="text-primary" /> Thời gian
                  </span>
                  <p className="font-bold text-ink">
                    {detailItem.gio} {detailItem.gioKetThuc ? `đến ${detailItem.gioKetThuc}` : ''}
                  </p>
                </div>
              </div>

              {/* Chi tiết địa điểm, xe, chủ trì, thành phần */}
              <div className="space-y-3">
                <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-surface">
                  <div className="p-2 bg-primary-50 text-primary dark:bg-primary-950/40 rounded-lg shrink-0">
                    <MapPin size={16} />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="text-3xs font-black text-ink-muted uppercase tracking-wider block">
                      Địa điểm / Phòng họp
                    </span>
                    <p className="font-bold text-ink">{detailItem.diaDiem}</p>
                  </div>
                </div>

                {detailItem.xeCongTac && detailItem.xeCongTac !== 'Không yêu cầu' && (
                  <div className="flex gap-3 items-start p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 dark:border-emerald-800/40 dark:bg-emerald-950/20">
                    <div className="p-2 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300 rounded-lg shrink-0">
                      <Car size={16} />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <span className="text-3xs font-black text-emerald-800 dark:text-emerald-300 uppercase tracking-wider block">
                        Phương tiện điều phối
                      </span>
                      <p className="font-bold text-emerald-700 dark:text-emerald-300">{detailItem.xeCongTac}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-surface">
                  <div className="p-2 bg-muted text-ink-secondary rounded-lg shrink-0">
                    <User size={16} />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="text-3xs font-black text-ink-muted uppercase tracking-wider block">
                      Lãnh đạo chủ trì
                    </span>
                    <p className="font-bold text-ink">{detailItem.chuTri}</p>
                  </div>
                </div>

                {detailItem.donViChuanBi && (
                  <div className="flex gap-3 items-start p-3 rounded-xl border border-primary/25 bg-primary-50/20 dark:border-primary-800/40 dark:bg-primary-950/20">
                    <div className="p-2 bg-primary-100 text-primary-700 dark:bg-primary-900/50 dark:text-primary-300 rounded-lg shrink-0">
                      <Building size={16} />
                    </div>
                    <div className="space-y-0.5 text-xs">
                      <span className="text-3xs font-black text-primary-700 dark:text-primary-300 uppercase tracking-wider block">
                        Đơn vị / Người chuẩn bị báo cáo
                      </span>
                      <p className="font-bold text-ink">{detailItem.donViChuanBi}</p>
                    </div>
                  </div>
                )}

                <div className="flex gap-3 items-start p-3 rounded-xl border border-border bg-surface">
                  <div className="p-2 bg-muted text-ink-secondary rounded-lg shrink-0">
                    <Users size={16} />
                  </div>
                  <div className="space-y-0.5 text-xs">
                    <span className="text-3xs font-black text-ink-muted uppercase tracking-wider block">
                      Thành phần tham gia
                    </span>
                    <p className="font-medium text-ink leading-relaxed">{detailItem.thanhPhan}</p>
                  </div>
                </div>

                {detailItem.ghiChu && (
                  <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 dark:bg-amber-950/20 dark:border-amber-800/40 dark:text-amber-200 space-y-1">
                    <span className="text-3xs font-black uppercase tracking-wider block">
                      Yêu cầu chuẩn bị / Ghi chú:
                    </span>
                    <p className="leading-relaxed">{detailItem.ghiChu}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {detailTab === 'report' && (
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-ink flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-primary" />
                  Biên bản tóm tắt & Kết luận cuộc họp:
                </label>
                <textarea
                  rows={8}
                  defaultValue={detailItem.noiDungBaoCao || ''}
                  placeholder="Nhập nội dung kết luận, các chỉ đạo của chủ trì hoặc biên bản cuộc họp tại đây..."
                  id="report-textarea"
                  className={cn(inputCls, 'h-48 py-2.5 resize-none leading-relaxed')}
                />
              </div>

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={() => {
                    const el = document.getElementById('report-textarea') as HTMLTextAreaElement;
                    if (el) handleSaveReport(detailItem.id, el.value);
                  }}
                  className="btn-primary text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <Save size={14} /> Lưu kết luận cuộc họp
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    ) : null,
    footer: detailItem ? (
      <div className="w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleOpenEdit(detailItem)}
            className="px-3 py-1.5 text-xs font-bold bg-muted hover:bg-border border border-border text-ink-secondary rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Pencil size={13} /> Sửa
          </button>
          <button
            type="button"
            onClick={() => handleDelete(detailItem.id)}
            className="px-3 py-1.5 text-xs font-bold bg-danger/10 hover:bg-danger/20 border border-danger/30 text-danger rounded-lg transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Trash2 size={13} /> Xóa
          </button>
        </div>

        <div className="flex items-center gap-2">
          {detailItem.trangThai === 'Cho-duyet' && (
            <button
              type="button"
              onClick={() => handleApprove(detailItem.id)}
              className="px-3.5 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-all flex items-center gap-1.5 shadow-sm cursor-pointer"
            >
              <Check size={14} /> Phê duyệt
            </button>
          )}
          <button
            type="button"
            onClick={() => setDetailItem(null)}
            className="px-3 py-1.5 text-xs font-medium text-ink-muted hover:text-ink hover:bg-muted rounded-lg transition-all cursor-pointer"
          >
            Đóng
          </button>
        </div>
      </div>
    ) : null,
  });

  // ─── Slide panel: Biểu mẫu Đăng ký / Sửa lịch công tác (Chuẩn hóa theo Mẫu Viện IBST) ───
  useSlidePanelForm({
    id: 'lich-co-quan-form',
    open: modalOpen,
    title: editingItem ? 'Cập nhật lịch công tác cơ quan' : 'Đăng ký lịch công tác & Đặt phòng họp',
    subtitle: editingItem
      ? `Chỉnh sửa sự kiện #${editingItem.id} · Cập nhật vào Ma trận BGĐ & TV Sảnh`
      : 'Điền thông tin sự kiện, chọn ca S/C, đơn vị chuẩn bị, phòng họp và phương tiện',
    icon: <CalendarIcon size={14} />,
    storageKey: 'slideover-width-lich-co-quan-form',
    minWidth: 620,
    deps: [form, editingItem, conflicts, checkingConflict, phongHops, xeList, nhanSuList],
    onDongNgoaiLuong: () => setModalOpen(false),
    content: (
      <form id="lich-co-quan-form-element" onSubmit={handleSubmit} className="p-5 space-y-4">
        {/* Nhóm 1: Chọn Ca làm việc (Sáng / Chiều) & Thời gian */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/30 dark:bg-slate-900/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <Clock size={12} className="text-primary" /> CA LÀM VIỆC & THỜI GIAN THỰC HIỆN
            </span>
            <div className="flex items-center gap-1 bg-surface dark:bg-slate-800 p-0.5 rounded-lg border border-border dark:border-slate-700">
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    buoi: 'sang',
                    gio: form.gio >= '12:00' ? '08:30' : form.gio,
                    gioKetThuc: form.gioKetThuc >= '12:00' ? '11:30' : form.gioKetThuc,
                  });
                }}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                  form.buoi === 'sang'
                    ? 'bg-amber-500 text-white shadow-2xs'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                <Sun size={12} /> Ca Sáng (S:)
              </button>
              <button
                type="button"
                onClick={() => {
                  setForm({
                    ...form,
                    buoi: 'chieu',
                    gio: form.gio < '12:00' ? '14:00' : form.gio,
                    gioKetThuc: form.gioKetThuc < '12:00' ? '16:30' : form.gioKetThuc,
                  });
                }}
                className={cn(
                  'px-2.5 py-1 rounded text-xs font-bold transition-all flex items-center gap-1 cursor-pointer',
                  form.buoi === 'chieu'
                    ? 'bg-sky-500 text-white shadow-2xs'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                <Moon size={12} /> Ca Chiều (C:)
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <Field label="Ngày thực hiện" required>
              <input
                type="date"
                className={inputCls}
                required
                value={form.ngay}
                onChange={(e) => setForm({ ...form, ngay: e.target.value })}
              />
            </Field>

            <Field label="Giờ bắt đầu" required>
              <input
                type="time"
                className={inputCls}
                required
                value={form.gio}
                onChange={(e) => setForm({ ...form, gio: e.target.value })}
              />
            </Field>

            <Field label="Giờ kết thúc">
              <input
                type="time"
                className={inputCls}
                value={form.gioKetThuc || ''}
                onChange={(e) => setForm({ ...form, gioKetThuc: e.target.value })}
              />
            </Field>
          </div>

          {/* Quick hour buttons */}
          <div className="flex items-center gap-1.5 flex-wrap pt-0.5">
            <span className="text-3xs text-ink-muted font-bold">Mốc giờ chuẩn:</span>
            {form.buoi === 'sang' ? (
              <>
                {['08:00', '08:30', '09:00', '10:00'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setForm({ ...form, gio: h })}
                    className={cn(
                      'px-2 py-0.5 rounded text-3xs font-mono font-bold border transition-colors cursor-pointer',
                      form.gio === h
                        ? 'bg-amber-500/20 text-amber-700 dark:text-amber-300 border-amber-500/40'
                        : 'bg-surface dark:bg-slate-800 text-ink-muted border-border hover:bg-muted'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </>
            ) : (
              <>
                {['14:00', '14:30', '15:00', '16:00'].map((h) => (
                  <button
                    key={h}
                    type="button"
                    onClick={() => setForm({ ...form, gio: h })}
                    className={cn(
                      'px-2 py-0.5 rounded text-3xs font-mono font-bold border transition-colors cursor-pointer',
                      form.gio === h
                        ? 'bg-sky-500/20 text-sky-700 dark:text-sky-300 border-sky-500/40'
                        : 'bg-surface dark:bg-slate-800 text-ink-muted border-border hover:bg-muted'
                    )}
                  >
                    {h}
                  </button>
                ))}
              </>
            )}
          </div>
        </div>

        {/* Nhóm 2: Nội dung cuộc họp & Đơn vị / Người chuẩn bị báo cáo */}
        <div className="space-y-3 p-3.5 rounded-xl border border-border bg-subtle/30 dark:bg-slate-900/30">
          <span className="text-3xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <FileText size={12} className="text-primary" /> NỘI DUNG CUỘC HỌP & PHÂN CÔNG CHUẨN BỊ
          </span>

          <Field label="Nội dung công việc / Trích yếu cuộc họp" required>
            <textarea
              className={cn(inputCls, 'h-18 py-2 resize-none')}
              required
              value={form.noiDung}
              onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
              placeholder="VD: Đề án Tiêu chuẩn công trình xanh, Họp rà soát QCVN 04..."
            />
          </Field>

          {/* Đơn vị / Người chuẩn bị báo cáo (Dòng phụ trong ngoặc đơn trên bảng Viện) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-ink flex items-center gap-1">
                <Building size={12} className="text-primary" />
                Đơn vị / Người chuẩn bị báo cáo
                <span className="text-3xs font-normal text-ink-muted italic">(Hiển thị trong ngoặc đơn trên bảng)</span>
              </label>
            </div>

            <input
              type="text"
              list="nhan-su-goi-y"
              className={inputCls}
              value={form.donViChuanBi}
              onChange={(e) => setForm({ ...form, donViChuanBi: e.target.value })}
              placeholder="VD: TTKCT a.Trung, a.Phương hoặc Phòng KHKT..."
            />

            {/* Datalist gợi ý nhân sự Viện với họ tên đầy đủ theo danh mục */}
            <datalist id="nhan-su-goi-y">
              {nhanSuList.map((ns) => (
                <option key={ns.id} value={`${ns.hoVaTen} (${ns.chucDanh ? `${ns.chucDanh} - ` : ''}${ns.tenDonVi})`} />
              ))}
            </datalist>

            {/* Quick chips gợi ý đơn vị nhanh */}
            <div className="flex items-center gap-1 flex-wrap pt-0.5">
              <span className="text-3xs text-ink-muted font-bold">Gợi ý đơn vị:</span>
              {['TTKCT', 'Phòng KHKT', 'Phòng TCHC', 'Phòng TCKT', 'Vụ KHCN (BXD)', 'Ban QLDA'].map((unit) => (
                <button
                  key={unit}
                  type="button"
                  onClick={() => {
                    const cur = form.donViChuanBi.trim();
                    setForm({
                      ...form,
                      donViChuanBi: cur ? (cur.includes(unit) ? cur : `${cur}, ${unit}`) : unit,
                    });
                  }}
                  className="px-1.5 py-0.2 rounded text-3xs font-medium bg-surface dark:bg-slate-800 text-ink-secondary hover:text-primary hover:border-primary/40 border border-border transition-colors cursor-pointer"
                >
                  + {unit}
                </button>
              ))}
            </div>
          </div>

          <Field label="Thành phần tham gia / Triệu tập" required>
            <input
              className={inputCls}
              required
              value={form.thanhPhan}
              onChange={(e) => setForm({ ...form, thanhPhan: e.target.value })}
              placeholder="VD: Ban Giám đốc Viện, đại diện các chuyên gia, các phòng chuyên môn..."
            />
          </Field>
        </div>

        {/* Nhóm 3: Phân công Lãnh đạo & Cột Ma trận Ban Giám đốc */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/30 dark:bg-slate-900/30 space-y-3">
          <span className="text-3xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <User size={12} className="text-primary" /> PHÂN CÔNG BAN GIÁM ĐỐC & CỘT MA TRẬN
          </span>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Field label="Cột hiển thị trên Ma trận Ban Giám đốc" required>
              <select
                className={inputCls}
                value={form.cotMaTran}
                onChange={(e) => {
                  const val = e.target.value as any;
                  let chuTriMoi = form.chuTri;
                  if (val === 'vien_truong') chuTriMoi = 'TS. Nguyễn Hồng Hải - Viện trưởng';
                  else if (val === 'dan') chuTriMoi = 'Đinh Quốc Dân - Phó Viện trưởng';
                  else if (val === 'binh') chuTriMoi = 'Nguyễn Thanh Bình - Phó Viện trưởng';
                  else if (val === 'khoi') chuTriMoi = 'Cao Duy Khôi - Phó Viện trưởng';
                  setForm({ ...form, cotMaTran: val, chuTri: chuTriMoi });
                }}
              >
                <option value="vien_truong">Cột 1: TS. Nguyễn Hồng Hải - Viện trưởng</option>
                <option value="dan">Cột 2: Đinh Quốc Dân - Phó Viện trưởng</option>
                <option value="binh">Cột 3: Nguyễn Thanh Bình - Phó Viện trưởng</option>
                <option value="khoi">Cột 4: Cao Duy Khôi - Phó Viện trưởng</option>
                <option value="khac">Khác / Không đưa lên ma trận 4 cột</option>
              </select>
            </Field>

            <Field label="Lãnh đạo chủ trì" required>
              <select
                className={inputCls}
                value={form.chuTri}
                onChange={(e) => {
                  const val = e.target.value;
                  let cot = form.cotMaTran;
                  const key = getLeaderMatrixKey(val);
                  if (key === 'vientruong') cot = 'vien_truong';
                  else if (key === 'dan') cot = 'dan';
                  else if (key === 'binh') cot = 'binh';
                  else if (key === 'khoi') cot = 'khoi';
                  setForm({ ...form, chuTri: val, cotMaTran: cot });
                }}
              >
                {LEADER_OPTIONS.map((l) => (
                  <option key={l} value={l}>
                    {l}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Field label="Phân loại sự kiện" required>
              <select
                className={inputCls}
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value as any })}
              >
                <option value="Lich-BGĐ">Họp Ban Giám đốc Viện</option>
                <option value="Lich-tuan">Lịch Tuần Viện</option>
                <option value="meeting">Hội nghị, cuộc họp chuyên môn</option>
                <option value="business_trip">Đi công tác hiện trường</option>
                <option value="Phong-hop">Đăng ký Phòng họp / Hội trường</option>
                <option value="internal_event">Làm việc nội bộ / Tập huấn</option>
                <option value="other">Khác</option>
              </select>
            </Field>

            <Field label="Ghi chú kỹ thuật / Trang thiết bị">
              <input
                className={inputCls}
                value={form.ghiChu || ''}
                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                placeholder="VD: Chuẩn bị máy chiếu, hoa tươi, 02 micro..."
              />
            </Field>
          </div>
        </div>

        {/* Nhóm 4: Đặt phòng họp & Điều động xe công tác (Có kiểm tra trùng) */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/30 dark:bg-slate-900/30 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-3xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
              <MapPin size={12} className="text-primary" /> PHÒNG HỌP & PHƯƠNG TIỆN XE CÔNG TÁC
            </span>
            {checkingConflict && (
              <span className="text-3xs text-ink-muted flex items-center gap-1">
                <RefreshCw size={10} className="animate-spin text-primary" /> Đang kiểm tra trùng...
              </span>
            )}
          </div>

          {/* Cảnh báo xung đột nếu có */}
          {conflicts.length > 0 && (
            <div className="p-3 rounded-xl border border-amber-500/50 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-2 animate-in fade-in">
              <AlertTriangle size={16} className="text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <p className="font-bold text-xs">Cảnh báo trùng tài nguyên ({conflicts.length} cuộc họp bị trùng giờ):</p>
                {conflicts.map((c, idx) => (
                  <p key={idx} className="text-2xs leading-relaxed">
                    • <strong>{c.tenTaiNguyen}</strong> đã có lịch: "{c.tieuDe}" ({c.gioBatDau} - {c.gioKetThuc})
                  </p>
                ))}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            <Field label="Địa điểm / Phòng họp" required>
              <select
                className={inputCls}
                value={form.diaDiem}
                onChange={(e) => {
                  const val = e.target.value;
                  const roomObj = phongHops.find((p) => p.tenPhong === val);
                  setForm({
                    ...form,
                    diaDiem: val,
                    phongHopId: roomObj ? roomObj.id : '',
                  });
                }}
              >
                {phongHops.length > 0 ? (
                  phongHops.map((r) => (
                    <option key={r.id} value={r.tenPhong}>
                      {r.tenPhong} ({r.sucChua} chỗ)
                    </option>
                  ))
                ) : (
                  ROOM_OPTIONS.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))
                )}
              </select>
            </Field>

            <Field label="Phương tiện xe công tác">
              <select
                className={inputCls}
                value={form.xeCongTac}
                onChange={(e) => {
                  const val = e.target.value;
                  const xeObj = xeList.find((x) => val.includes(x.bienSo));
                  setForm({
                    ...form,
                    xeCongTac: val,
                    xeId: xeObj ? xeObj.id : '',
                  });
                }}
              >
                <option value="Không yêu cầu">Không yêu cầu</option>
                {xeList.length > 0 ? (
                  xeList.map((x) => (
                    <option key={x.id} value={`${x.loaiXe} (${x.bienSo})`}>
                      {x.loaiXe} ({x.bienSo})
                    </option>
                  ))
                ) : (
                  VEHICLE_OPTIONS.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))
                )}
                <option value="Tự túc phương tiện">Tự túc phương tiện</option>
              </select>
            </Field>
          </div>
        </div>

        {/* Nhóm 5: Live Preview - Xem trước Thẻ Lịch trên Ma trận & TV Sảnh */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/40 dark:bg-slate-900/40 space-y-2">
          <span className="text-3xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
            <Eye size={12} className="text-primary" /> XEM TRƯỚC THẺ LỊCH TRÊN MA TRẬN & TV SẢNH
          </span>

          <div className="p-2.5 rounded-lg border border-border-subtle dark:border-slate-700 bg-surface dark:bg-slate-800/90 shadow-2xs">
            <div className="flex items-start gap-1.5 leading-snug">
              <span
                className={cn(
                  'shrink-0 font-black text-2xs px-1.5 py-0.2 rounded font-mono',
                  form.buoi === 'sang'
                    ? 'text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800/40'
                    : 'text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/40'
                )}
              >
                {form.buoi === 'sang' ? 'S:' : 'C:'} {form.gio || '08:30'}
              </span>
              <div className="flex-1 min-w-0">
                <span className="font-bold text-xs text-ink block leading-tight">
                  {form.noiDung || '(Chưa nhập nội dung cuộc họp)'}
                </span>
                {(form.donViChuanBi || form.thanhPhan) && (
                  <span className="text-3xs text-ink-muted italic block mt-0.5 leading-tight">
                    ({form.donViChuanBi ? form.donViChuanBi : form.thanhPhan})
                  </span>
                )}
                <div className="flex flex-wrap items-center gap-1 mt-1">
                  {form.diaDiem && (
                    <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-subtle dark:bg-slate-700/50 text-ink-secondary border border-border-subtle dark:border-slate-600">
                      <MapPin size={9} className="text-primary" /> {form.diaDiem}
                    </span>
                  )}
                  {form.xeCongTac &&
                    form.xeCongTac !== 'Không yêu cầu' &&
                    form.xeCongTac !== 'Tự túc phương tiện' && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                        <Car size={9} /> {form.xeCongTac.split(' - ')[0]}
                      </span>
                    )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    ),
    footer: (
      <div className="w-full flex items-center justify-between gap-2">
        <div className="flex items-center gap-1 text-3xs text-ink-muted">
          <CheckSquare size={12} className="text-emerald-500" />
          <span>Lưu đồng bộ Database Supabase & TV Sảnh</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setModalOpen(false)}
            className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-ink-secondary hover:bg-muted cursor-pointer"
          >
            Hủy
          </button>
          <button
            type="submit"
            form="lich-co-quan-form-element"
            className="btn-primary text-xs font-bold px-4 py-2 cursor-pointer shadow-sm flex items-center gap-1.5"
          >
            <Save size={13} />
            {editingItem ? 'Lưu thay đổi' : 'Đăng ký lịch'}
          </button>
        </div>
      </div>
    ),
  });

  // In lịch / Print theo chuẩn thể thức văn bản hành chính Viện KHCN Xây dựng
  const handlePrint = () => {
    printLichTuanMatrix({
      weekRangeLabel: weekRangeText,
      days: matrixDays.map((d) => ({
        dateStr: d.dateStr,
        thuLabel: d.thuShort,
        ngayLabel: d.dayLabel,
      })),
      leaders: MATRIX_LEADERS.map((l) => ({ key: l.key, title: l.headerTitle })),
      events: list,
      ghiChu: weekNote,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      <PageHeader
        title="Lịch công tác & Sự kiện cơ quan"
        subtitle="Hệ thống điều phối lịch họp Ban Giám đốc Viện, quản lý lịch tuần cơ quan, đặt phòng họp & điều động xe công tác (Tham khảo chuẩn dự án QLDA)"
        actions={
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="btn border border-border bg-surface hover:bg-muted text-ink-secondary text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
              title="In lịch công tác"
            >
              <Printer size={14} /> In lịch
            </button>
            <button
              onClick={() => handleOpenCreate()}
              className="btn-primary flex items-center gap-1.5 cursor-pointer"
            >
              <Plus size={16} /> Đăng ký lịch mới
            </button>
          </div>
        }
      />

      {/* KPI Stats cards */}
      {view !== 'lobby' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KpiCard icon={CalendarDays} label="Lịch tuần Viện đã duyệt" value={String(countWeek)} tone="primary" />
          <KpiCard icon={Clock} label="Yêu cầu phòng chờ duyệt" value={String(countPendingRooms)} tone="warning" />
          <KpiCard icon={Users} label="Lịch họp Ban Giám đốc" value={String(countBgd)} tone="accent" />
          <KpiCard icon={Car} label="Lịch điều phối xe công tác" value={String(countVehicles)} tone="success" />
        </div>
      )}

      {/* Main Calendar View Card */}
      <div className={cn('card overflow-hidden border border-border dark:border-slate-700/80 flex flex-col shadow-sm', view === 'lobby' && 'bg-slate-950 text-white border-slate-900')}>
        {/* --- CUSTOM TOOLBAR & FILTERS --- */}
        {view !== 'lobby' && (
          <div className="p-3.5 border-b border-border dark:border-slate-700/80 bg-subtle/40 dark:bg-slate-900/40 flex flex-col xl:flex-row xl:items-center justify-between gap-3.5">
            {/* Left Controls: Navigation & Chip Filters */}
            <div className="flex flex-wrap items-center gap-2.5 flex-1">
              {/* Navigation buttons */}
              <div className="flex items-center gap-1 bg-surface dark:bg-slate-800/80 border border-border dark:border-slate-700/80 rounded-lg p-1 shadow-2xs">
                <button
                  onClick={handleToday}
                  className="px-2.5 py-1 text-2xs font-bold text-ink-secondary hover:text-ink hover:bg-muted dark:hover:bg-slate-700 rounded transition-colors cursor-pointer"
                >
                  Hôm nay
                </button>
                <div className="h-4 w-px bg-border dark:bg-slate-700 mx-0.5" />
                <button
                  onClick={handlePrev}
                  className="p-1 hover:bg-muted dark:hover:bg-slate-700 rounded text-ink-secondary hover:text-ink cursor-pointer"
                  title="Trước"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  onClick={handleNext}
                  className="p-1 hover:bg-muted dark:hover:bg-slate-700 rounded text-ink-secondary hover:text-ink cursor-pointer"
                  title="Tiếp"
                >
                  <ChevronRight size={14} />
                </button>
              </div>

              {/* Title Date Range */}
              <h2 className="text-xs font-bold text-ink min-w-[140px] px-1">
                {view === 'month' && `${MONTHS[currentMonth]} / ${currentYear}`}
                {view === 'week' && `Tuần ${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${currentYear}`}
                {view === 'day' && `${selectedDate.getDate()}/${selectedDate.getMonth() + 1}/${currentYear}`}
                {(view === 'agenda' || view === 'manage') && 'Danh sách lịch cơ quan'}
              </h2>

              <div className="h-5 w-px bg-border dark:bg-slate-700 hidden sm:block mx-0.5" />

              {/* Chip Filter: Loại sự kiện */}
              <div className="flex items-center gap-1">
                <SlidersHorizontal className={cn('w-3.5 h-3.5', activeFiltersCount > 0 ? 'text-primary' : 'text-ink-muted')} />
                {activeFiltersCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-primary text-white text-[9px] font-bold flex items-center justify-center">
                    {activeFiltersCount}
                  </span>
                )}
              </div>

              <ChipSelect
                label="Loại sự kiện"
                value={filterType}
                options={EVENT_TYPE_OPTIONS}
                onChange={setFilterType}
              />

              {/* Chip Filter: Phòng họp */}
              <ChipSelect
                label="Phòng họp"
                value={filterRoom}
                options={[
                  { value: '', label: 'Tất cả phòng họp' },
                  ...ROOM_OPTIONS.map((r) => ({ value: r, label: r })),
                ]}
                onChange={setFilterRoom}
              />

              {/* Chip Filter: Người chủ trì */}
              <ChipSelect
                label="Chủ trì"
                value={filterLeader}
                options={[
                  { value: '', label: 'Tất cả người chủ trì' },
                  ...LEADER_OPTIONS.map((l) => ({ value: l, label: l })),
                ]}
                onChange={setFilterLeader}
              />

              {/* Quick search input */}
              <div className="relative w-44">
                <input
                  type="text"
                  placeholder="Tìm nội dung, xe..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full py-1 pl-7 pr-3 text-2xs rounded-lg border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800/80 text-ink focus:outline-none focus:ring-1 focus:ring-primary font-medium"
                />
                <Search className="absolute left-2.5 top-2 text-ink-muted" size={11} />
              </div>

              {/* Clear filters button */}
              {activeFiltersCount > 0 && (
                <button
                  onClick={clearFilters}
                  title="Xóa tất cả bộ lọc"
                  className="flex items-center gap-1 h-8 px-2.5 rounded-lg text-2xs font-bold text-danger hover:bg-danger/10 border border-danger/20 transition-all cursor-pointer"
                >
                  <FilterX size={13} /> Xóa lọc
                </button>
              )}
            </div>

            {/* Right Controls: View Switcher */}
            <div className="flex items-center bg-muted dark:bg-slate-800/80 p-1 rounded-lg border border-border dark:border-slate-700/80 shrink-0 self-start xl:self-center">
              {[
                { id: 'month', label: 'Tháng', icon: LayoutGrid },
                { id: 'week', label: 'Tuần', icon: CalendarRange },
                { id: 'day', label: 'Ngày', icon: CalendarIcon },
                { id: 'agenda', label: 'Lịch trình', icon: List },
                { id: 'manage', label: 'Quản lý', icon: Pencil },
                { id: 'lobby', label: 'Tivi sảnh', icon: Monitor },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setView(t.id as any)}
                  className={cn(
                    'px-2.5 py-1.5 text-2xs font-bold rounded-md flex items-center gap-1 transition-all cursor-pointer',
                    view === t.id
                      ? 'bg-surface dark:bg-slate-700 text-primary shadow-2xs border border-border-subtle dark:border-slate-600 font-black'
                      : 'text-ink-secondary hover:text-ink hover:bg-surface/50 dark:hover:bg-slate-700/50'
                  )}
                >
                  <t.icon size={12} />
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── VIEW 1: MONTHLY CALENDAR GRID ── */}
        {view === 'month' && (
          <div className="w-full overflow-x-auto">
            <div className="min-w-[768px] grid grid-cols-7 border-b border-border dark:border-slate-700/80 bg-muted/40 dark:bg-slate-900/60">
              {DAYS_OF_WEEK.map((day, idx) => (
                <div key={idx} className="py-2.5 text-center text-3xs font-black text-ink-secondary tracking-wider border-r border-border-subtle dark:border-slate-700/70 last:border-r-0 uppercase">
                  {day}
                </div>
              ))}
            </div>

            <div className="min-w-[768px] grid grid-cols-7 border-t border-l border-border dark:border-slate-700/80 bg-surface">
              {calendarCells.map((cell, idx) => {
                const cellDateStr = formatLocalDate(cell.date);
                const isTodayCell = isSameDay(cellDateStr, new Date(2026, 8, 8)); // Demo date
                const dayEvents = filteredEvents.filter((item) => item.ngay === cellDateStr);

                return (
                  <div
                    key={idx}
                    className={cn(
                      'min-h-[115px] p-2 border-r border-b border-border dark:border-slate-700/80 flex flex-col group relative transition-all',
                      !cell.isCurrentMonth
                        ? 'bg-muted/15 text-ink-muted/50 dark:bg-slate-900/50'
                        : 'text-ink-secondary hover:bg-muted/20 dark:hover:bg-slate-800/40',
                      isTodayCell && 'bg-primary-50/25 dark:bg-primary-950/30 ring-1 ring-primary/40 dark:ring-primary/60'
                    )}
                  >
                    <div className="flex justify-between items-center mb-1.5">
                      <span
                        className={cn(
                          'text-[11px] font-bold h-5 w-5 flex items-center justify-center rounded-full font-mono',
                          isTodayCell && 'bg-primary text-white font-black shadow-2xs'
                        )}
                      >
                        {cell.dayNumber}
                      </span>
                      <button
                        onClick={() => handleOpenCreate(cell.date)}
                        className="opacity-0 group-hover:opacity-100 p-0.5 bg-primary/10 text-primary hover:bg-primary hover:text-white rounded transition-all cursor-pointer"
                        title="Đăng ký lịch ngày này"
                      >
                        <Plus size={11} />
                      </button>
                    </div>

                    <div className="flex-1 space-y-1 overflow-y-auto max-h-[85px] no-scrollbar">
                      {dayEvents.slice(0, 3).map((item) => {
                        const badge = getEventTypeBadge(item.loai);
                        return (
                          <div
                            key={item.id}
                            onClick={() => {
                              setDetailItem(item);
                              setDetailTab('info');
                            }}
                            className={cn(
                              'px-1.5 py-0.5 text-[10px] font-bold rounded border-l-[3px] text-left truncate cursor-pointer transition-all active:scale-95 shadow-2xs',
                              item.loai === 'Lich-BGĐ' && 'bg-indigo-50 text-indigo-800 border-indigo-500 dark:bg-indigo-950/40 dark:text-indigo-300',
                              item.loai === 'Lich-tuan' && 'bg-amber-50 text-amber-800 border-amber-500 dark:bg-amber-950/40 dark:text-amber-300',
                              item.loai === 'Phong-hop' && 'bg-emerald-50 text-emerald-800 border-emerald-500 dark:bg-emerald-950/40 dark:text-emerald-300',
                              item.loai === 'meeting' && 'bg-sky-50 text-sky-800 border-sky-500 dark:bg-sky-950/40 dark:text-sky-300',
                              item.loai === 'business_trip' && 'bg-orange-50 text-orange-800 border-orange-500 dark:bg-orange-950/40 dark:text-orange-300',
                              item.loai === 'internal_event' && 'bg-purple-50 text-purple-800 border-purple-500 dark:bg-purple-950/40 dark:text-purple-300'
                            )}
                          >
                            <span className="font-mono text-[9px] mr-1 opacity-90">{item.gio}</span>
                            {item.noiDung}
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <button
                          onClick={() => {
                            setSelectedDate(cell.date);
                            setView('day');
                          }}
                          className="w-full text-center text-3xs font-black text-primary hover:underline block mt-1"
                        >
                          + {dayEvents.length - 3} lịch khác
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ── VIEW 2: WEEKLY VIEW (CHUẨN MA TRẬN BAN GIÁM ĐỐC VIỆN & CỘT NGÀY) ── */}
        {view === 'week' && (
          <div className="p-4 space-y-4 text-left">
              {/* --- WEEK SUB-TOOLBAR: TIÊU ĐỀ HÀNH CHÍNH & ĐIỀU KHIỂN --- */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-border dark:border-slate-700/80">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-2xs font-black tracking-wider uppercase text-ink">
                      VIỆN KHCN XÂY DỰNG
                    </span>
                    <span className="text-ink-muted text-3xs">·</span>
                    <span className="text-3xs font-semibold text-primary">Ban Giám đốc Viện</span>
                  </div>
                  <h3 className="text-sm md:text-base font-black tracking-wide uppercase text-ink mt-0.5">
                    LỊCH CÔNG TÁC TUẦN
                  </h3>
                  <p className="text-2xs italic font-medium text-ink-secondary">
                    {weekRangeText}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* View layout switch: Matrix vs Columns */}
                  <div className="flex items-center bg-muted dark:bg-slate-800/80 p-0.5 rounded-lg border border-border dark:border-slate-700/80">
                    <button
                      type="button"
                      onClick={() => setWeekLayout('matrix')}
                      className={cn(
                        'px-2.5 py-1 text-2xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer',
                        weekLayout === 'matrix'
                          ? 'bg-surface dark:bg-slate-700 text-primary shadow-2xs font-black'
                          : 'text-ink-secondary hover:text-ink'
                      )}
                      title="Xem Bảng Ma trận Ban Giám đốc theo mẫu chuẩn Viện"
                    >
                      <TableIcon size={12} />
                      <span>Mẫu bảng Viện</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setWeekLayout('columns')}
                      className={cn(
                        'px-2.5 py-1 text-2xs font-bold rounded-md flex items-center gap-1.5 transition-all cursor-pointer',
                        weekLayout === 'columns'
                          ? 'bg-surface dark:bg-slate-700 text-primary shadow-2xs font-black'
                          : 'text-ink-secondary hover:text-ink'
                      )}
                      title="Xem dạng cột 7 ngày"
                    >
                      <LayoutGrid size={12} />
                      <span>Dạng cột</span>
                    </button>
                  </div>

                  {/* Toggle Hiện Thứ 7 & CN */}
                  <label className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800/60 text-2xs font-semibold text-ink-secondary hover:text-ink cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showWeekend}
                      onChange={(e) => setShowWeekend(e.target.checked)}
                      className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5 cursor-pointer"
                    />
                    <span>Thứ 7 & CN</span>
                  </label>

                  {/* Nút in nhanh lịch tuần */}
                  <button
                    type="button"
                    onClick={handlePrint}
                    className="btn border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800/80 hover:bg-muted dark:hover:bg-slate-700 text-ink-secondary hover:text-ink text-2xs font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                    title="In bảng lịch tuần A4 ngang chuẩn thể thức"
                  >
                    <Printer size={12} />
                    <span>In bảng tuần</span>
                  </button>
                </div>
              </div>

              {/* --- LAYOUT 1: MA TRẬN BAN GIÁM ĐỐC (CHUẨN FORM VIỆN KHCNXD) --- */}
              {weekLayout === 'matrix' ? (
                <div>
                  <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-900/40 shadow-xs">
                    <table className="w-full border-collapse text-left border-border dark:border-slate-700/80 min-w-[960px]">
                      <thead>
                        {/* Hàng 1: Thứ / Ngày | VIỆN TRƯỞNG | PHÓ VIỆN TRƯỞNG */}
                        <tr className="bg-subtle/80 dark:bg-slate-900/90 text-ink border-b border-border dark:border-slate-700/80">
                          <th
                            rowSpan={2}
                            className="w-20 sm:w-24 text-center border-r border-border dark:border-slate-700/80 p-2.5 font-black text-xs uppercase tracking-wider text-ink bg-subtle/90 dark:bg-slate-900/95"
                          >
                            <div>Thứ</div>
                            <div className="text-3xs font-semibold text-ink-muted mt-0.5">Ngày</div>
                          </th>
                          <th
                            rowSpan={2}
                            className="w-[24%] text-center border-r border-border dark:border-slate-700/80 p-2.5 font-black text-xs uppercase tracking-wider text-ink bg-subtle/90 dark:bg-slate-900/95"
                          >
                            <div className="text-primary-700 dark:text-primary-300">VIỆN TRƯỞNG</div>
                            <div className="text-4xs font-bold text-ink-muted normal-case mt-0.5">TS. Nguyễn Hồng Hải</div>
                          </th>
                          <th
                            colSpan={3}
                            className="text-center border-b border-border dark:border-slate-700/80 p-2 font-black text-xs uppercase tracking-widest text-ink bg-subtle/95 dark:bg-slate-900"
                          >
                            PHÓ VIỆN TRƯỞNG
                          </th>
                        </tr>

                        {/* Hàng 2: Các Phó Viện trưởng */}
                        <tr className="bg-subtle/60 dark:bg-slate-900/70 text-ink border-b border-border dark:border-slate-700/80">
                          <th className="w-[25%] text-center border-r border-border dark:border-slate-700/80 p-2 font-black text-2xs uppercase tracking-wide text-ink">
                            ĐINH QUỐC DÂN
                          </th>
                          <th className="w-[25%] text-center border-r border-border dark:border-slate-700/80 p-2 font-black text-2xs uppercase tracking-wide text-ink">
                            NGUYỄN THANH BÌNH
                          </th>
                          <th className="w-[25%] text-center p-2 font-black text-2xs uppercase tracking-wide text-ink">
                            CAO DUY KHÔI
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-border dark:divide-slate-700/80">
                        {matrixDays.map((day) => {
                          const dayEvents = filteredEvents.filter((e) => e.ngay === day.dateStr);

                          return (
                            <tr
                              key={day.dateStr}
                              className={cn(
                                'hover:bg-muted/15 dark:hover:bg-slate-800/25 transition-colors',
                                day.isToday && 'bg-primary-50/10 dark:bg-primary-950/20'
                              )}
                            >
                              {/* Cột 1: Thứ / Ngày */}
                              <td
                                className={cn(
                                  'text-center align-middle border-r border-border dark:border-slate-700/80 p-2.5 bg-subtle/30 dark:bg-slate-900/40 select-none',
                                  day.isToday && 'bg-primary-50/30 dark:bg-primary-950/40 ring-1 ring-inset ring-primary/40'
                                )}
                              >
                                <div className="font-black text-sm text-ink">{day.thuShort}</div>
                                <div className="text-xs font-mono font-bold text-ink-muted mt-0.5">
                                  {day.dayLabel}
                                </div>
                                {day.isToday && (
                                  <span className="inline-block mt-1 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-primary text-white shadow-2xs">
                                    Hôm nay
                                  </span>
                                )}
                              </td>

                              {/* 4 Cột của Ban Giám đốc */}
                              {MATRIX_LEADERS.map((leader, colIdx) => {
                                const leaderEvents = dayEvents.filter(
                                  (e) => getLeaderMatrixKey(e) === leader.key
                                );
                                const morningList = leaderEvents
                                  .filter((e) => isMorningEvent(e.gio))
                                  .sort((a, b) => a.gio.localeCompare(b.gio));
                                const afternoonList = leaderEvents
                                  .filter((e) => !isMorningEvent(e.gio))
                                  .sort((a, b) => a.gio.localeCompare(b.gio));
                                const isLastCol = colIdx === MATRIX_LEADERS.length - 1;

                                return (
                                  <td
                                    key={leader.key}
                                    className={cn(
                                      'align-top p-2.5 text-xs group relative transition-colors',
                                      !isLastCol && 'border-r border-border dark:border-slate-700/80',
                                      colIdx % 2 === 1 && 'bg-subtle/10 dark:bg-slate-900/20'
                                    )}
                                  >
                                    <div className="space-y-2 min-h-[95px] flex flex-col justify-between">
                                      <div className="space-y-2">
                                        {/* Ca Sáng (S:) */}
                                        {morningList.length > 0 && (
                                          <div className="space-y-1">
                                            {morningList.map((item) => (
                                              <div
                                                key={item.id}
                                                onClick={() => {
                                                  setDetailItem(item);
                                                  setDetailTab('info');
                                                }}
                                                className="p-2 rounded-lg bg-surface dark:bg-slate-800/90 border border-border-subtle dark:border-slate-700/70 hover:border-amber-400 dark:hover:border-amber-500 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-ink text-left"
                                              >
                                                <div className="flex items-start gap-1.5 leading-snug">
                                                  <span className="shrink-0 font-black text-amber-600 dark:text-amber-400 text-2xs bg-amber-50 dark:bg-amber-950/60 px-1 py-0.2 rounded border border-amber-200 dark:border-amber-800/40 font-mono">
                                                    S: {item.gio}
                                                  </span>
                                                  <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-xs text-ink">
                                                      {item.noiDung}
                                                    </span>
                                                    {(item.donViChuanBi || item.thanhPhan) && (
                                                      <span className="text-3xs text-ink-muted italic block mt-0.5">
                                                        ({item.donViChuanBi || item.thanhPhan})
                                                      </span>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                                      {item.diaDiem && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-subtle dark:bg-slate-700/50 text-ink-secondary border border-border-subtle dark:border-slate-600">
                                                          <MapPin size={9} className="text-primary" /> {item.diaDiem}
                                                        </span>
                                                      )}
                                                      {item.xeCongTac &&
                                                        item.xeCongTac !== 'Không yêu cầu' &&
                                                        item.xeCongTac !== 'Tự túc phương tiện' && (
                                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                                                            <Car size={9} /> {item.xeCongTac.split(' - ')[0]}
                                                          </span>
                                                        )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {/* Ca Chiều (C:) */}
                                        {afternoonList.length > 0 && (
                                          <div className="space-y-1">
                                            {afternoonList.map((item) => (
                                              <div
                                                key={item.id}
                                                onClick={() => {
                                                  setDetailItem(item);
                                                  setDetailTab('info');
                                                }}
                                                className="p-2 rounded-lg bg-surface dark:bg-slate-800/90 border border-border-subtle dark:border-slate-700/70 hover:border-sky-400 dark:hover:border-sky-500 shadow-2xs hover:shadow-xs transition-all cursor-pointer text-ink text-left"
                                              >
                                                <div className="flex items-start gap-1.5 leading-snug">
                                                  <span className="shrink-0 font-black text-sky-600 dark:text-sky-400 text-2xs bg-sky-50 dark:bg-sky-950/60 px-1 py-0.2 rounded border border-sky-200 dark:border-sky-800/40 font-mono">
                                                    C: {item.gio}
                                                  </span>
                                                  <div className="flex-1 min-w-0">
                                                    <span className="font-bold text-xs text-ink">
                                                      {item.noiDung}
                                                    </span>
                                                    {(item.donViChuanBi || item.thanhPhan) && (
                                                      <span className="text-3xs text-ink-muted italic block mt-0.5">
                                                        ({item.donViChuanBi || item.thanhPhan})
                                                      </span>
                                                    )}
                                                    <div className="flex flex-wrap items-center gap-1 mt-1">
                                                      {item.diaDiem && (
                                                        <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-semibold bg-subtle dark:bg-slate-700/50 text-ink-secondary border border-border-subtle dark:border-slate-600">
                                                          <MapPin size={9} className="text-primary" /> {item.diaDiem}
                                                        </span>
                                                      )}
                                                      {item.xeCongTac &&
                                                        item.xeCongTac !== 'Không yêu cầu' &&
                                                        item.xeCongTac !== 'Tự túc phương tiện' && (
                                                          <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/40">
                                                            <Car size={9} /> {item.xeCongTac.split(' - ')[0]}
                                                          </span>
                                                        )}
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            ))}
                                          </div>
                                        )}

                                        {morningList.length === 0 && afternoonList.length === 0 && (
                                          <div className="py-5 text-center text-3xs text-ink-muted/60 italic font-medium">
                                            —
                                          </div>
                                        )}
                                      </div>

                                      {/* Quick add actions on hover */}
                                      <div className="opacity-0 group-hover:opacity-100 flex items-center justify-end gap-1 pt-1.5 transition-opacity">
                                        <button
                                          type="button"
                                          onClick={() => handleQuickCreate(day.date, leader.defaultLeaderVal, true)}
                                          className="px-1.5 py-0.5 text-4xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/60 rounded border border-amber-300 dark:border-amber-800/60 transition-colors cursor-pointer"
                                          title={`Thêm lịch Sáng cho ${leader.personName}`}
                                        >
                                          + Sáng
                                        </button>
                                        <button
                                          type="button"
                                          onClick={() => handleQuickCreate(day.date, leader.defaultLeaderVal, false)}
                                          className="px-1.5 py-0.5 text-4xs font-bold text-sky-700 dark:text-sky-300 bg-sky-50 dark:bg-sky-950/50 hover:bg-sky-100 dark:hover:bg-sky-900/60 rounded border border-sky-300 dark:border-sky-800/60 transition-colors cursor-pointer"
                                          title={`Thêm lịch Chiều cho ${leader.personName}`}
                                        >
                                          + Chiều
                                        </button>
                                      </div>
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* --- KHUNG GHI CHÚ TUẦN (MẪU VIỆN KHCNXD) --- */}
                  <div className="mt-4 p-4 rounded-xl border border-border dark:border-slate-700/80 bg-subtle/30 dark:bg-slate-900/40 text-left">
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <FileText size={15} className="text-primary" />
                        <span className="text-xs font-black uppercase tracking-wider text-ink underline">
                          Ghi chú:
                        </span>
                      </div>
                      {!editingWeekNote && (
                        <button
                          type="button"
                          onClick={() => {
                            setWeekNoteInput(weekNote);
                            setEditingWeekNote(true);
                          }}
                          className="flex items-center gap-1 px-2.5 py-1 text-3xs font-bold text-ink-secondary hover:text-primary hover:bg-muted dark:hover:bg-slate-800 rounded-lg border border-border dark:border-slate-700 transition-all cursor-pointer"
                          title="Chỉnh sửa ghi chú tuần"
                        >
                          <Pencil size={11} /> Sửa ghi chú
                        </button>
                      )}
                    </div>

                    {editingWeekNote ? (
                      <div className="space-y-2">
                        <textarea
                          value={weekNoteInput}
                          onChange={(e) => setWeekNoteInput(e.target.value)}
                          className={cn(inputCls, 'h-20 py-2 text-xs resize-none')}
                          placeholder="Nhập ghi chú cho tuần này..."
                          autoFocus
                        />
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingWeekNote(false)}
                            className="px-3 py-1.5 text-2xs font-semibold text-ink-muted hover:text-ink hover:bg-muted rounded-lg cursor-pointer"
                          >
                            Hủy
                          </button>
                          <button
                            type="button"
                            onClick={handleSaveWeekNote}
                            className="btn-primary px-3 py-1.5 text-2xs font-bold rounded-lg cursor-pointer flex items-center gap-1 shadow-2xs"
                          >
                            <Save size={12} /> Lưu ghi chú
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-xs text-ink-secondary font-medium whitespace-pre-line leading-relaxed pl-1">
                        {weekNote || 'Chưa có ghi chú tuần.'}
                      </p>
                    )}
                  </div>
                </div>
              ) : (
                /* --- LAYOUT 2: DẠNG CỘT 7 NGÀY --- */
                <div className="grid grid-cols-1 md:grid-cols-7 gap-3.5">
                  {DAYS_OF_WEEK.map((dayName, idx) => {
                    const diff = idx + 1 - currentDayOfWeek;
                    const thisDate = new Date(selectedDate.getTime() + diff * 24 * 60 * 60 * 1000);
                    const thisDateStr = formatLocalDate(thisDate);
                    const dayEvents = filteredEvents.filter((item) => item.ngay === thisDateStr);
                    const isTodayCell = isSameDay(thisDateStr, new Date(2026, 8, 14));

                    return (
                      <div
                        key={idx}
                        className={cn(
                          'bg-subtle/30 dark:bg-slate-900/40 border border-border dark:border-slate-700/80 rounded-xl p-3 min-h-[340px] flex flex-col text-left transition-all',
                          isTodayCell &&
                            'bg-primary-50/20 dark:bg-primary-950/30 border-primary dark:border-primary shadow-2xs ring-1 ring-primary/30'
                        )}
                      >
                        <div className="flex justify-between items-center border-b border-border-subtle dark:border-slate-700/70 pb-2 mb-2.5">
                          <div>
                            <p className="text-3xs font-black text-ink-muted uppercase tracking-wider">{dayName}</p>
                            <p className="text-2xs font-bold text-ink-secondary mt-0.5">
                              {thisDate.getDate()}/{thisDate.getMonth() + 1}
                            </p>
                          </div>
                          <button
                            onClick={() => handleOpenCreate(thisDate)}
                            className="p-1 hover:bg-muted dark:hover:bg-slate-800 rounded text-primary transition-all cursor-pointer"
                            title="Thêm lịch cho ngày này"
                          >
                            <Plus size={13} />
                          </button>
                        </div>

                        <div className="flex-1 space-y-2 overflow-y-auto">
                          {dayEvents.length === 0 ? (
                            <p className="text-center text-3xs text-ink-muted py-10 font-medium">Không có lịch</p>
                          ) : (
                            dayEvents.map((item) => {
                              const badge = getEventTypeBadge(item.loai);
                              return (
                                <div
                                  key={item.id}
                                  onClick={() => {
                                    setDetailItem(item);
                                    setDetailTab('info');
                                  }}
                                  className={cn(
                                    'p-2.5 rounded-lg border-l-[3px] text-3xs font-medium space-y-1.5 cursor-pointer hover:shadow-2xs transition-all active:scale-95 bg-surface dark:bg-slate-800/80 border border-border-subtle dark:border-slate-700/70',
                                    item.loai === 'Lich-BGĐ' && 'border-l-indigo-500 hover:border-indigo-400',
                                    item.loai === 'Lich-tuan' && 'border-l-amber-500 hover:border-amber-400',
                                    item.loai === 'Phong-hop' && 'border-l-emerald-500 hover:border-emerald-400',
                                    item.loai === 'meeting' && 'border-l-sky-500 hover:border-sky-400',
                                    item.loai === 'business_trip' && 'border-l-orange-500 hover:border-orange-400',
                                    item.loai === 'internal_event' && 'border-l-purple-500 hover:border-purple-400'
                                  )}
                                >
                                  <div className="flex justify-between items-center text-4xs text-ink-muted">
                                    <span className="font-bold flex items-center gap-1 text-primary">
                                      <Clock size={10} /> {item.gio} {item.gioKetThuc ? ` - ${item.gioKetThuc}` : ''}
                                    </span>
                                    <span className={cn('px-1.5 py-0.2 rounded text-[8px] font-black uppercase', badge.cls)}>
                                      {badge.label.split(' ')[0]}
                                    </span>
                                  </div>
                                  <p className="text-ink font-bold line-clamp-2 leading-tight">{item.noiDung}</p>
                                  <div className="text-4xs text-ink-muted truncate flex items-center gap-1">
                                    <MapPin size={9} /> {item.diaDiem}
                                  </div>
                                  {item.xeCongTac && item.xeCongTac !== 'Không yêu cầu' && (
                                    <div className="text-4xs text-emerald-600 font-bold truncate flex items-center gap-1">
                                      <Car size={9} /> {item.xeCongTac.split(' - ')[0]}
                                    </div>
                                  )}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

        {/* ── VIEW 3: DAY TIMELINE VIEW ── */}
        {view === 'day' && (
          <div className="p-5 text-left space-y-4">
            <div className="pb-3 border-b border-border dark:border-slate-700/80 flex justify-between items-center">
              <div>
                <h3 className="font-bold text-ink text-sm">Lịch làm việc chi tiết trong ngày</h3>
                <p className="text-2xs text-ink-muted mt-0.5">
                  Ngày {selectedDate.getDate()} tháng {selectedDate.getMonth() + 1} năm {selectedDate.getFullYear()}
                </p>
              </div>
              <button
                onClick={() => handleOpenCreate(selectedDate)}
                className="btn-primary text-2xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
              >
                <Plus size={13} /> Thêm lịch cho ngày
              </button>
            </div>

            <div className="space-y-3">
              {filteredEvents.filter((x) => isSameDay(x.ngay, selectedDate)).length === 0 ? (
                <div className="py-16 text-center text-xs font-medium text-ink-muted">
                  Không có lịch làm việc nào được lên lịch cho ngày này.
                </div>
              ) : (
                filteredEvents
                  .filter((x) => isSameDay(x.ngay, selectedDate))
                  .sort((a, b) => a.gio.localeCompare(b.gio))
                  .map((item) => {
                    const badge = getEventTypeBadge(item.loai);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          setDetailItem(item);
                          setDetailTab('info');
                        }}
                        className="p-4 rounded-xl border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800/50 hover:border-primary flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-2xs transition-all"
                      >
                        <div className="space-y-1.5 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="flex items-center gap-1.5 text-xs font-black text-primary font-mono">
                              <Clock size={13} /> {item.gio} {item.gioKetThuc ? `→ ${item.gioKetThuc}` : ''}
                            </span>
                            <span className={cn('px-2 py-0.5 text-4xs font-black uppercase rounded border', badge.cls)}>
                              {badge.label}
                            </span>
                            <span
                              className={cn(
                                'text-4xs font-bold px-2 py-0.5 rounded flex items-center gap-1 border',
                                item.trangThai === 'Da-duyet'
                                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                              )}
                            >
                              {item.trangThai === 'Da-duyet' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                              {item.trangThai === 'Da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'}
                            </span>
                          </div>

                          <h4 className="font-bold text-ink text-sm">{item.noiDung}</h4>

                          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-2xs text-ink-secondary pt-1">
                            <p className="flex items-center gap-1.5">
                              <User size={13} className="text-ink-muted shrink-0" />
                              <strong>Chủ trì:</strong> {item.chuTri}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <MapPin size={13} className="text-ink-muted shrink-0" />
                              <strong>Địa điểm:</strong> {item.diaDiem}
                            </p>
                            <p className="flex items-center gap-1.5">
                              <Users size={13} className="text-ink-muted shrink-0" />
                              <strong>Thành phần:</strong> {item.thanhPhan}
                            </p>
                          </div>

                          {item.xeCongTac && item.xeCongTac !== 'Không yêu cầu' && (
                            <p className="text-2xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1 pt-0.5">
                              <Car size={13} /> Xe công tác: {item.xeCongTac}
                            </p>
                          )}
                        </div>

                        <ChevronRight className="text-ink-muted hidden sm:block shrink-0" size={18} />
                      </div>
                    );
                  })
              )}
            </div>
          </div>
        )}

        {/* ── VIEW 4: AGENDA / LỊCH TRÌNH LIST VIEW ── */}
        {view === 'agenda' && (
          <div className="p-4 text-left space-y-3.5">
            {filteredEvents.length === 0 ? (
              <p className="text-center text-ink-muted py-10 font-medium">Không có dữ liệu lịch làm việc phù hợp.</p>
            ) : (
              filteredEvents
                .sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio))
                .map((item) => {
                  const badge = getEventTypeBadge(item.loai);
                  return (
                    <div
                      key={item.id}
                      className="flex flex-col md:flex-row md:items-start gap-4 border-b border-border-subtle dark:border-slate-700/70 pb-4 last:border-0 last:pb-0"
                    >
                      {/* Date box */}
                      <div className="w-full md:w-36 shrink-0 bg-subtle/50 dark:bg-slate-900/50 p-3 rounded-xl border border-border dark:border-slate-700/80 flex flex-col items-center justify-center">
                        <span className="text-sm font-black text-ink">{item.thu}</span>
                        <span className="text-xs text-ink-muted font-mono">{item.ngay}</span>
                        <span className="mt-2 text-xs px-2.5 py-0.5 rounded-full font-bold bg-primary/10 text-primary flex items-center gap-1 font-mono">
                          <Clock size={11} /> {item.gio}
                        </span>
                      </div>

                      {/* Detail content */}
                      <div className="flex-1 space-y-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <h4
                            onClick={() => {
                              setDetailItem(item);
                              setDetailTab('info');
                            }}
                            className="text-xs font-bold text-ink hover:text-primary cursor-pointer transition-colors"
                          >
                            {item.noiDung}
                          </h4>
                          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded border', badge.cls)}>
                            {badge.label}
                          </span>
                          <span
                            className={cn(
                              'text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 border',
                              item.trangThai === 'Da-duyet'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800/40'
                                : 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800/40'
                            )}
                          >
                            {item.trangThai === 'Da-duyet' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                            {item.trangThai === 'Da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'}
                          </span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-2xs text-ink-secondary font-medium">
                          <p className="flex items-center gap-1">
                            <User size={12} className="text-ink-muted" /> <strong>Chủ trì:</strong> {item.chuTri}
                          </p>
                          <p className="flex items-center gap-1">
                            <MapPin size={12} className="text-ink-muted" /> <strong>Địa điểm:</strong> {item.diaDiem}
                          </p>
                          <p className="flex items-center gap-1">
                            <Users size={12} className="text-ink-muted" /> <strong>Thành phần:</strong> {item.thanhPhan}
                          </p>
                        </div>

                        {item.xeCongTac && item.xeCongTac !== 'Không yêu cầu' && (
                          <p className="text-2xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1">
                            <Car size={12} /> Điều phối xe: {item.xeCongTac}
                          </p>
                        )}
                      </div>

                      <button
                        onClick={() => {
                          setDetailItem(item);
                          setDetailTab('info');
                        }}
                        className="btn border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800 hover:bg-muted dark:hover:bg-slate-700 text-ink-secondary font-bold text-2xs px-3 py-1.5 rounded-lg self-start md:self-center cursor-pointer transition-colors"
                      >
                        Chi tiết
                      </button>
                    </div>
                  );
                })
            )}
          </div>
        )}

        {/* ── VIEW 5: MANAGE / QUẢN LÝ TABLE VIEW ── */}
        {view === 'manage' && (
          <div className="p-4 text-left space-y-4">
            <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
              <table className="w-full text-2xs font-medium">
                <thead>
                  <tr className="bg-subtle dark:bg-slate-900/60 text-ink border-b border-border dark:border-slate-700/80">
                    <th className="py-2.5 px-4 text-left font-bold w-28">Thời gian</th>
                    <th className="py-2.5 px-4 text-left font-bold w-40">Phân loại</th>
                    <th className="py-2.5 px-4 text-left font-bold">Nội dung họp / Nhiệm vụ</th>
                    <th className="py-2.5 px-4 text-left font-bold w-52">Thành phần tham gia</th>
                    <th className="py-2.5 px-4 text-left font-bold w-40">Chủ trì</th>
                    <th className="py-2.5 px-4 text-left font-bold w-44">Địa điểm / Xe</th>
                    <th className="py-2.5 px-4 text-center font-bold w-32">Thao tác</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-slate-700/80 bg-surface dark:bg-slate-900/40">
                  {filteredEvents.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-10 text-center text-ink-muted font-medium">
                        Không tìm thấy lịch công tác nào phù hợp.
                      </td>
                    </tr>
                  ) : (
                    filteredEvents
                      .sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio))
                      .map((item) => {
                        const badge = getEventTypeBadge(item.loai);
                        return (
                          <tr key={item.id} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                            <td className="py-3 px-4 font-mono">
                              <p className="font-bold text-ink">{item.ngay}</p>
                              <p className="text-3xs text-primary font-bold">
                                {item.gio} {item.gioKetThuc ? `- ${item.gioKetThuc}` : ''}
                              </p>
                            </td>
                            <td className="py-3 px-4">
                              <span className={cn('inline-block px-2 py-0.5 rounded text-3xs font-bold border', badge.cls)}>
                                {badge.label}
                              </span>
                              <div className="mt-1">
                                <span
                                  className={cn(
                                    'inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.2 rounded',
                                    item.trangThai === 'Da-duyet'
                                      ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-300'
                                      : 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-300'
                                  )}
                                >
                                  {item.trangThai === 'Da-duyet' ? '✓ Đã duyệt' : '⏳ Chờ duyệt'}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4 max-w-xs">
                              <p
                                onClick={() => {
                                  setDetailItem(item);
                                  setDetailTab('info');
                                }}
                                className="font-bold text-ink hover:text-primary cursor-pointer line-clamp-2"
                              >
                                {item.noiDung}
                              </p>
                              {item.ghiChu && (
                                <p className="text-3xs text-ink-muted mt-0.5 truncate italic">* {item.ghiChu}</p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-ink-secondary text-2xs leading-relaxed max-w-xs">
                              <div className="flex items-start gap-1.5">
                                <Users size={12} className="text-primary mt-0.5 shrink-0" />
                                <span className="line-clamp-2" title={item.thanhPhan}>{item.thanhPhan}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4 text-ink-secondary font-medium">{item.chuTri}</td>
                            <td className="py-3 px-4 text-ink-secondary">
                              <p className="font-bold text-ink-primary truncate">{item.diaDiem}</p>
                              {item.xeCongTac && item.xeCongTac !== 'Không yêu cầu' && (
                                <p className="text-3xs text-emerald-600 dark:text-emerald-400 font-bold truncate flex items-center gap-1 mt-0.5">
                                  <Car size={10} /> {item.xeCongTac}
                                </p>
                              )}
                            </td>
                            <td className="py-3 px-4 text-center">
                              <div className="flex items-center justify-center gap-1.5">
                                {item.trangThai === 'Cho-duyet' && (
                                  <button
                                    onClick={() => handleApprove(item.id)}
                                    className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 rounded-lg cursor-pointer"
                                    title="Phê duyệt"
                                  >
                                    <Check size={15} />
                                  </button>
                                )}
                                <button
                                  onClick={() => handleOpenEdit(item)}
                                  className="p-1 text-ink-muted hover:text-primary hover:bg-muted dark:hover:bg-slate-800 rounded-lg cursor-pointer"
                                  title="Chỉnh sửa"
                                >
                                  <Pencil size={15} />
                                </button>
                                <button
                                  onClick={() => handleDelete(item.id)}
                                  className="p-1 text-ink-muted hover:text-danger hover:bg-danger/10 rounded-lg cursor-pointer"
                                  title="Xóa"
                                >
                                  <Trash2 size={15} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ── VIEW 6: LOBBY TV / TIVI SẢNH SCREEN VIEW (Chuẩn Bộ Xây dựng - Viện KHCNXD) ── */}
        {view === 'lobby' && (
          <div
            id="lobby-tv-container"
            className={cn(
              'bg-slate-950 text-white flex flex-col justify-between font-sans transition-all duration-300 relative',
              isFullscreen
                ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none p-3 lg:p-4 overflow-hidden'
                : 'min-h-[650px] p-4 rounded-2xl'
            )}
          >
            {/* Top Bar: Switcher & Fullscreen */}
            <div className="flex flex-wrap justify-between items-center bg-white/[0.04] border border-white/10 px-3 py-1.5 rounded-xl mb-2 gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-3xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Trực tuyến
                </span>

                {/* Scope: Tuần này / Hôm nay */}
                <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-lg">
                  <button
                    onClick={() => {
                      setLobbyScope('week');
                      setLobbyPage(0);
                    }}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-3xs font-bold transition-all cursor-pointer',
                      lobbyScope === 'week' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Lịch Tuần này
                  </button>
                  <button
                    onClick={() => {
                      setLobbyScope('today');
                      setLobbyPage(0);
                    }}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-3xs font-bold transition-all cursor-pointer',
                      lobbyScope === 'today' ? 'bg-amber-500 text-slate-950 font-black shadow' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Lịch Hôm nay
                  </button>
                </div>

                {/* Layout: Mẫu bảng Viện vs Dạng danh sách */}
                <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setLobbyLayout('matrix')}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-3xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      lobbyLayout === 'matrix' ? 'bg-white/20 text-white shadow font-black' : 'text-slate-400 hover:text-white'
                    )}
                    title="Mẫu Bảng Ma trận Ban Giám đốc theo chuẩn Viện"
                  >
                    <TableIcon size={11} />
                    <span>Mẫu bảng Viện</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setLobbyLayout('list')}
                    className={cn(
                      'px-2.5 py-0.5 rounded-md text-3xs font-bold transition-all cursor-pointer flex items-center gap-1',
                      lobbyLayout === 'list' ? 'bg-white/20 text-white shadow font-black' : 'text-slate-400 hover:text-white'
                    )}
                    title="Dạng danh sách cuộn phân trang"
                  >
                    <List size={11} />
                    <span>Dạng danh sách</span>
                  </button>
                </div>

                {/* Weekend toggle */}
                {lobbyLayout === 'matrix' && (
                  <label className="flex items-center gap-1 px-2 py-0.5 rounded-lg border border-white/10 bg-white/5 text-3xs font-bold text-slate-300 hover:text-white cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={showWeekend}
                      onChange={(e) => setShowWeekend(e.target.checked)}
                      className="rounded border-white/20 text-amber-400 focus:ring-amber-400 h-3 w-3 cursor-pointer"
                    />
                    <span>Thứ 7 & CN</span>
                  </label>
                )}
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-2.5 py-1 rounded-lg text-3xs font-bold uppercase bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-1 cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isFullscreen && document.exitFullscreen) document.exitFullscreen();
                    setView('week');
                  }}
                  className="px-2.5 py-1 rounded-lg text-3xs font-bold uppercase bg-red-600/80 hover:bg-red-600 text-white border border-red-500/30 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Monitor size={12} /> Thoát Tivi
                </button>
              </div>
            </div>

            {/* Header: Institutional Branding & Live Clock */}
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-2 border-b border-white/10 pb-1.5 mb-1.5 text-center lg:text-left">
              {/* Clock widget */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl border bg-white/[0.03] border-white/10 shadow-inner">
                  <div className="text-left">
                    <p className="text-2xs font-black capitalize tracking-wide text-amber-400 leading-tight">
                      {lobbyTime.toLocaleDateString('vi-VN', { weekday: 'long' })}
                    </p>
                    <p className="text-4xs font-bold text-slate-300 leading-tight">
                      {lobbyTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-px h-5 bg-white/20 mx-0.5" />
                  <span className="text-lg font-black font-mono tracking-wider text-white">
                    {lobbyTime.toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Agency Title */}
              <div className="text-center flex flex-col items-center justify-center px-2">
                <span className="text-[10px] font-black tracking-widest uppercase text-amber-400 leading-tight">
                  BỘ XÂY DỰNG · VIỆN KHOA HỌC CÔNG NGHỆ XÂY DỰNG - IBST
                </span>
                <h1 className="text-sm md:text-base lg:text-lg font-black tracking-wider uppercase text-white drop-shadow mt-0.5 leading-tight">
                  {lobbyLayout === 'matrix'
                    ? (lobbyScope === 'today' ? 'LỊCH CÔNG TÁC BAN GIÁM ĐỐC (HÔM NAY)' : 'LỊCH CÔNG TÁC BAN GIÁM ĐỐC')
                    : `LỊCH CÔNG TÁC CƠ QUAN ${lobbyScope === 'today' ? '(HÔM NAY)' : '(TUẦN NÀY)'}`}
                </h1>
                <p className="text-3xs text-amber-300/90 font-semibold italic mt-0.5">
                  {weekRangeText}
                </p>
              </div>

              {/* Status Note */}
              <div className="hidden lg:flex flex-col items-end text-right text-3xs text-slate-400">
                <span className="font-bold text-white flex items-center gap-1 text-2xs">
                  <Sparkles size={11} className="text-amber-400" /> Hệ thống hiển thị điện tử
                </span>
                <span className="mt-0.5 text-4xs text-slate-400">
                  {lobbyLayout === 'matrix' ? 'Chuẩn mẫu biểu Viện' : `Trang ${lobbyPage + 1}/${lobbyTotalPages}`}
                </span>
              </div>
            </div>

            {/* ── CÂU CHÀO MỪNG SẢNH (GREETING BANNER) ── */}
            <div className="mb-2 px-3 py-1 rounded-xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 text-amber-200 flex items-center justify-between gap-2">
              <div className="flex items-center gap-1.5 min-w-0 flex-1 w-full">
                <span className="p-1 rounded-lg bg-amber-400/20 text-amber-400 shrink-0">
                  <Sparkles size={12} className="animate-pulse" />
                </span>
                {editingGreeting ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={greetingInput}
                      onChange={(e) => setGreetingInput(e.target.value)}
                      className="flex-1 bg-black/60 border border-amber-400/40 rounded-lg px-2.5 py-1 text-xs text-white focus:outline-none focus:border-amber-400 font-semibold"
                      placeholder="Nhập câu chào mừng sảnh tiếp đón..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveGreeting();
                        if (e.key === 'Escape') setEditingGreeting(false);
                      }}
                    />
                    <button
                      onClick={handleSaveGreeting}
                      className="px-2.5 py-1 bg-amber-500 text-amber-950 font-black text-3xs rounded-lg hover:bg-amber-400 transition-all cursor-pointer shrink-0"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingGreeting(false)}
                      className="px-2 py-1 text-slate-400 hover:text-white text-3xs cursor-pointer shrink-0"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div
                    className="group flex items-center gap-1.5 cursor-pointer truncate"
                    onClick={() => {
                      setGreetingInput(lobbyGreeting);
                      setEditingGreeting(true);
                    }}
                    title="Bấm để chỉnh sửa câu chào mừng"
                  >
                    <p className="text-2xs md:text-xs font-bold tracking-wide text-amber-200 truncate uppercase">
                      {lobbyGreeting}
                    </p>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-0.5 rounded hover:bg-white/10 text-amber-400 transition-opacity cursor-pointer shrink-0"
                      title="Chỉnh sửa câu chào"
                    >
                      <Pencil size={10} />
                    </button>
                  </div>
                )}
              </div>

              {!editingGreeting && (
                <button
                  onClick={() => {
                    setGreetingInput(lobbyGreeting);
                    setEditingGreeting(true);
                  }}
                  className="hidden sm:flex px-2 py-0.5 text-4xs font-bold text-amber-300 hover:text-white hover:bg-white/10 rounded border border-amber-400/30 transition-all items-center gap-1 cursor-pointer shrink-0"
                >
                  <Pencil size={9} /> Đổi câu chào
                </button>
              )}
            </div>

            {/* Middle Content: Matrix Table (Mẫu Viện) or List Carousel */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {lobbyLayout === 'matrix' ? (
                <div className="space-y-1.5">
                  <div className="overflow-x-auto rounded-xl border border-white/15 bg-white/[0.02] shadow-xl">
                    <table className="w-full border-collapse text-left min-w-[1000px]">
                      <thead>
                        {/* Hàng 1: Thứ / Ngày | VIỆN TRƯỞNG | PHÓ VIỆN TRƯỞNG */}
                        <tr className="bg-white/[0.08] text-white border-b border-white/15 text-[11px]">
                          <th
                            rowSpan={2}
                            className="w-20 text-center border-r border-white/15 py-1 px-2 font-black uppercase tracking-wider text-amber-400 bg-white/[0.06]"
                          >
                            <div>Thứ</div>
                            <div className="text-4xs font-semibold text-slate-400">Ngày</div>
                          </th>
                          <th
                            rowSpan={2}
                            className="w-[24%] text-center border-r border-white/15 py-1 px-2 font-black uppercase tracking-wider text-amber-300 bg-white/[0.06]"
                          >
                            <div className="text-amber-400 font-black text-2xs">VIỆN TRƯỞNG</div>
                            <div className="text-4xs font-bold text-slate-300 normal-case">TS. Nguyễn Hồng Hải</div>
                          </th>
                          <th
                            colSpan={3}
                            className="text-center border-b border-white/15 py-1 px-2 font-black text-2xs uppercase tracking-widest text-amber-400 bg-white/[0.08]"
                          >
                            PHÓ VIỆN TRƯỞNG
                          </th>
                        </tr>

                        {/* Hàng 2: Các Phó Viện trưởng */}
                        <tr className="bg-white/[0.05] text-slate-200 border-b border-white/15 text-[10px]">
                          <th className="w-[25%] text-center border-r border-white/15 py-0.5 px-2 font-black uppercase tracking-wide text-white">
                            ĐINH QUỐC DÂN
                          </th>
                          <th className="w-[25%] text-center border-r border-white/15 py-0.5 px-2 font-black uppercase tracking-wide text-white">
                            NGUYỄN THANH BÌNH
                          </th>
                          <th className="w-[25%] text-center py-0.5 px-2 font-black uppercase tracking-wide text-white">
                            CAO DUY KHÔI
                          </th>
                        </tr>
                      </thead>

                      <tbody className="divide-y divide-white/10">
                        {((lobbyScope === 'today' ? matrixDays.filter((d) => d.isToday) : matrixDays).length > 0
                          ? (lobbyScope === 'today' ? matrixDays.filter((d) => d.isToday) : matrixDays)
                          : matrixDays
                        ).map((day) => {
                          const dayEvents = list.filter((e) => e.ngay === day.dateStr);

                          return (
                            <tr
                              key={day.dateStr}
                              className={cn(
                                'hover:bg-white/[0.04] transition-colors',
                                day.isToday && 'bg-amber-500/10'
                              )}
                            >
                              {/* Cột 1: Thứ / Ngày */}
                              <td
                                className={cn(
                                  'text-center align-middle border-r border-white/15 py-1 px-1.5 bg-white/[0.03] select-none',
                                  day.isToday && 'bg-amber-500/20 ring-1 ring-inset ring-amber-400/50'
                                )}
                              >
                                <div className="font-black text-xs md:text-sm text-white leading-tight">{day.thuShort}</div>
                                <div className="text-[11px] font-mono font-bold text-amber-400 mt-0.5 leading-tight">
                                  {day.dayLabel}
                                </div>
                                {day.isToday && (
                                  <span className="inline-block mt-0.5 px-1.5 py-0.2 rounded-full text-[8px] font-black bg-amber-500 text-slate-950 shadow">
                                    Hôm nay
                                  </span>
                                )}
                              </td>

                              {/* 4 Cột của Ban Giám đốc */}
                              {MATRIX_LEADERS.map((leader, colIdx) => {
                                const leaderEvents = dayEvents.filter(
                                  (e) => getLeaderMatrixKey(e) === leader.key
                                );
                                const morningList = leaderEvents
                                  .filter((e) => isMorningEvent(e.gio))
                                  .sort((a, b) => a.gio.localeCompare(b.gio));
                                const afternoonList = leaderEvents
                                  .filter((e) => !isMorningEvent(e.gio))
                                  .sort((a, b) => a.gio.localeCompare(b.gio));
                                const isLastCol = colIdx === MATRIX_LEADERS.length - 1;

                                return (
                                  <td
                                    key={leader.key}
                                    className={cn(
                                      'align-top py-1 px-1.5 text-2xs group relative transition-colors',
                                      !isLastCol && 'border-r border-white/15',
                                      colIdx % 2 === 1 && 'bg-white/[0.01]'
                                    )}
                                  >
                                    <div className="space-y-1 min-h-[55px]">
                                      {/* Ca Sáng (S:) */}
                                      {morningList.length > 0 && (
                                        <div className="space-y-1">
                                          {morningList.map((item) => (
                                            <div
                                              key={item.id}
                                              onClick={() => {
                                                setDetailItem(item);
                                                setDetailTab('info');
                                              }}
                                              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-amber-400/60 hover:bg-white/[0.08] shadow-2xs transition-all cursor-pointer text-left"
                                            >
                                              <div className="flex items-start gap-1 leading-tight">
                                                <span className="shrink-0 font-black text-amber-300 text-[9px] bg-amber-500/20 border border-amber-500/40 px-1 py-0.2 rounded font-mono">
                                                  S: {item.gio}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                  <span className="font-bold text-[11px] text-white leading-tight block">
                                                    {item.noiDung}
                                                  </span>
                                                  {(item.donViChuanBi || item.thanhPhan) && (
                                                    <span className="text-[9px] text-slate-300 italic block mt-0.5 leading-tight">
                                                      ({item.donViChuanBi || item.thanhPhan})
                                                    </span>
                                                  )}
                                                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                    {item.diaDiem && (
                                                      <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 leading-none">
                                                        <MapPin size={8} className="text-sky-400" /> {item.diaDiem}
                                                      </span>
                                                    )}
                                                    {item.xeCongTac &&
                                                      item.xeCongTac !== 'Không yêu cầu' &&
                                                      item.xeCongTac !== 'Tự túc phương tiện' && (
                                                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 leading-none">
                                                          <Car size={8} /> {item.xeCongTac.split(' - ')[0]}
                                                        </span>
                                                      )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {/* Ca Chiều (C:) */}
                                      {afternoonList.length > 0 && (
                                        <div className="space-y-1">
                                          {afternoonList.map((item) => (
                                            <div
                                              key={item.id}
                                              onClick={() => {
                                                setDetailItem(item);
                                                setDetailTab('info');
                                              }}
                                              className="p-1.5 rounded-lg bg-white/[0.04] border border-white/10 hover:border-sky-400/60 hover:bg-white/[0.08] shadow-2xs transition-all cursor-pointer text-left"
                                            >
                                              <div className="flex items-start gap-1 leading-tight">
                                                <span className="shrink-0 font-black text-sky-300 text-[9px] bg-sky-500/20 border border-sky-500/40 px-1 py-0.2 rounded font-mono">
                                                  C: {item.gio}
                                                </span>
                                                <div className="flex-1 min-w-0">
                                                  <span className="font-bold text-[11px] text-white leading-tight block">
                                                    {item.noiDung}
                                                  </span>
                                                  {(item.donViChuanBi || item.thanhPhan) && (
                                                    <span className="text-[9px] text-slate-300 italic block mt-0.5 leading-tight">
                                                      ({item.donViChuanBi || item.thanhPhan})
                                                    </span>
                                                  )}
                                                  <div className="flex flex-wrap items-center gap-1 mt-0.5">
                                                    {item.diaDiem && (
                                                      <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold bg-sky-500/15 text-sky-300 border border-sky-500/30 leading-none">
                                                        <MapPin size={8} className="text-sky-400" /> {item.diaDiem}
                                                      </span>
                                                    )}
                                                    {item.xeCongTac &&
                                                      item.xeCongTac !== 'Không yêu cầu' &&
                                                      item.xeCongTac !== 'Tự túc phương tiện' && (
                                                        <span className="inline-flex items-center gap-0.5 px-1 py-0.2 rounded text-[8px] font-bold text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 leading-none">
                                                          <Car size={8} /> {item.xeCongTac.split(' - ')[0]}
                                                        </span>
                                                      )}
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          ))}
                                        </div>
                                      )}

                                      {morningList.length === 0 && afternoonList.length === 0 && (
                                        <div className="h-full flex items-center justify-center py-2 text-[9px] font-medium text-slate-600 italic">
                                          (Trống lịch)
                                        </div>
                                      )}
                                    </div>
                                  </td>
                                );
                              })}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Khung Ghi chú tuần trên TV sảnh */}
                  <div className="py-1.5 px-3 rounded-xl bg-white/[0.03] border border-white/10 text-left flex items-center gap-2">
                    <span className="shrink-0 font-black text-2xs text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <AlertCircle size={11} /> GHI CHÚ:
                    </span>
                    <p className="flex-1 text-2xs md:text-xs text-slate-300 font-medium truncate">
                      {weekNote}
                    </p>
                  </div>
                </div>
              ) : (
                /* Dạng danh sách (List Carousel) */
                lobbyEvents.length === 0 ? (
                  <div className="py-28 text-center text-sm font-semibold text-slate-400 flex flex-col items-center justify-center gap-3">
                    <CalendarIcon className="w-14 h-14 text-slate-600 animate-pulse" />
                    Không có cuộc họp hay nhiệm vụ nào được lên lịch trong khoảng thời gian này.
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-white/10 bg-white/[0.02]">
                    <table className="w-full text-left text-xs font-semibold">
                      <thead>
                        <tr className="bg-white/[0.05] text-slate-300 border-b border-white/10 uppercase tracking-wider text-[11px]">
                          <th className="py-3.5 px-4 font-bold w-28">Thời gian</th>
                          <th className="py-3.5 px-4 font-bold w-36">Phân loại</th>
                          <th className="py-3.5 px-4 font-bold">Nội dung công tác / họp</th>
                          <th className="py-3.5 px-4 font-bold w-64 lg:w-72">Thành phần tham gia</th>
                          <th className="py-3.5 px-4 font-bold w-48">Chủ trì</th>
                          <th className="py-3.5 px-4 font-bold w-44">Địa điểm & Xe</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {currentLobbyEvents.map((item) => {
                          const badge = getEventTypeBadge(item.loai);
                          return (
                            <tr key={item.id} className="hover:bg-white/[0.04] transition-colors">
                              <td className="py-4 px-4 font-mono font-black text-amber-400">
                                <p className="text-sm flex items-center gap-1.5">
                                  <Clock size={14} /> {item.gio}
                                </p>
                                {item.gioKetThuc && (
                                  <p className="text-3xs text-slate-400 mt-0.5">đến {item.gioKetThuc}</p>
                                )}
                                {lobbyScope === 'week' && (
                                  <p className="text-3xs text-slate-400 mt-0.5">{item.thu}, {item.ngay.slice(5)}</p>
                                )}
                              </td>
                              <td className="py-4 px-4">
                                <span className={cn('inline-block px-2.5 py-1 rounded text-[10px] font-black uppercase tracking-wider border', badge.cls)}>
                                  {badge.label}
                                </span>
                              </td>
                              <td className="py-4 px-4">
                                <p className="font-bold text-white text-sm leading-snug">{item.noiDung}</p>
                                {item.ghiChu && (
                                  <p className="text-3xs text-amber-300/80 mt-1 italic flex items-center gap-1">
                                    <AlertCircle size={10} className="shrink-0" /> {item.ghiChu}
                                  </p>
                                )}
                              </td>
                              <td className="py-4 px-4 text-slate-200 text-xs leading-relaxed">
                                <div className="flex items-start gap-1.5">
                                  <Users size={14} className="text-amber-400/90 shrink-0 mt-0.5" />
                                  <span className="font-medium text-slate-200">{item.thanhPhan}</span>
                                </div>
                              </td>
                              <td className="py-4 px-4 text-slate-200 font-bold">
                                <p className="flex items-center gap-1.5 text-xs">
                                  <User size={14} className="text-amber-400 shrink-0" /> {item.chuTri}
                                </p>
                              </td>
                              <td className="py-4 px-4 text-slate-200">
                                <p className="flex items-center gap-1.5 font-bold text-xs text-white">
                                  <MapPin size={14} className="text-sky-400 shrink-0" /> {item.diaDiem}
                                </p>
                                {item.xeCongTac && item.xeCongTac !== 'Không yêu cầu' && (
                                  <p className="flex items-center gap-1 text-3xs text-emerald-400 font-bold mt-1">
                                    <Car size={12} className="shrink-0" /> {item.xeCongTac}
                                  </p>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )
              )}
            </div>

            {/* Lobby Footer: Pagination Carousel Dots & Note */}
            <div className="border-t border-white/10 mt-1.5 pt-1.5 flex flex-col sm:flex-row justify-between items-center text-3xs text-slate-400 gap-2">
              <span className="text-[10px] tracking-wider text-slate-400">
                HỆ THỐNG QUẢN TRỊ TỔNG THỂ IBST — TRỤ LIÊN THÔNG VĂN PHÒNG SỐ
              </span>

              {lobbyLayout === 'list' && lobbyTotalPages > 1 && (
                <div className="flex items-center gap-1.5">
                  {Array.from({ length: lobbyTotalPages }).map((_, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setLobbyPage(pIdx)}
                      className={cn(
                        'w-2 h-2 rounded-full transition-all cursor-pointer',
                        lobbyPage === pIdx ? 'bg-amber-400 w-4' : 'bg-white/20 hover:bg-white/40'
                      )}
                      title={`Trang ${pIdx + 1}`}
                    />
                  ))}
                </div>
              )}

              <span className="text-[10px] text-slate-500">
                Độc lập - Chuyên nghiệp - Tin cậy
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
