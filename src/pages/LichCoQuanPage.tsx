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
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Field, inputCls } from '../components/Modal';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { SlideOverTabs, type SlideOverTabDef } from '../components/SlideOver';
import { cn } from '../lib/utils';

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
  gio: string; // HH:mm (bắt đầu)
  gioKetThuc?: string; // HH:mm (kết thúc)
  noiDung: string;
  thanhPhan: string;
  chuTri: string;
  diaDiem: string; // Tên phòng họp hoặc địa điểm
  xeCongTac?: string; // Phương tiện xe công tác
  loai: AgencyEventType;
  trangThai: 'Cho-duyet' | 'Da-duyet' | 'Tu-choi';
  ghiChu?: string;
  noiDungBaoCao?: string; // Biên bản / Kết luận sau cuộc họp
}

const DETAIL_TABS: SlideOverTabDef<'info' | 'report'>[] = [
  { id: 'info', label: 'Thông tin lịch', icon: FileText },
  { id: 'report', label: 'Biên bản & Kết luận', icon: CheckCircle },
];

const STORAGE_KEY = 'ibst_agency_events_v4';

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

  // ── TUẦN 3: 14/09 - 20/09/2026 ──
  {
    id: '19',
    ngay: '2026-09-14',
    thu: 'Thứ Hai',
    gio: '08:30',
    gioKetThuc: '11:00',
    noiDung: 'Giao ban Ban Giám đốc Viện tuần 38 & Rà soát chỉ đạo Bộ Xây dựng',
    thanhPhan: 'Ban Giám đốc, Chánh Văn phòng, Trưởng phòng KHTC, QLKH',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
  },
  {
    id: '20',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '09:00',
    gioKetThuc: '11:30',
    noiDung: 'Họp Hội đồng Khoa học nghiệm thu đề tài cấp Bộ "Nghiên cứu phụ gia khoáng cho bê tông biển"',
    thanhPhan: 'Hội đồng nghiệm thu cấp Bộ, Ban Chủ nhiệm đề tài, Vụ KHCN&MT BXD',
    chuTri: 'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'meeting',
    trangThai: 'Da-duyet',
  },
  {
    id: '21',
    ngay: '2026-09-15',
    thu: 'Thứ Ba',
    gio: '14:00',
    gioKetThuc: '16:30',
    noiDung: 'Làm việc với Đoàn kiểm toán Nhà nước chuyên đề các dự án đầu tư phòng thí nghiệm',
    thanhPhan: 'Ban Giám đốc Viện, Kế toán trưởng, Giám đốc các Trung tâm liên quan',
    chuTri: 'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    trangThai: 'Da-duyet',
    ghiChu: 'Cung cấp toàn bộ hồ sơ chứng từ thanh quyết toán giai đoạn 2024-2026.',
  },
  {
    id: '22',
    ngay: '2026-09-16',
    thu: 'Thứ Tư',
    gio: '08:30',
    gioKetThuc: '17:00',
    noiDung: 'Thí nghiệm khí động học trong hầm gió mô hình cụm nhà cao tầng ven biển Đà Nẵng',
    thanhPhan: 'Nhóm nghiên cứu Phòng TN Gió & Kết cấu công trình',
    chuTri: 'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
    diaDiem: 'Phòng họp số 2',
    xeCongTac: 'Không yêu cầu',
    loai: 'internal_event',
    trangThai: 'Da-duyet',
  },
  {
    id: '23',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '08:30',
    gioKetThuc: '11:30',
    noiDung: 'Hội thảo tham vấn ý kiến chuyên gia về Dự thảo Quy chuẩn Kỹ thuật Quốc gia QCVN 06:2026/BXD An toàn cháy',
    thanhPhan: 'Cục Cảnh sát PCCC & CNCH, các Viện nghiên cứu, Hội Kiến trúc sư, Sở Xây dựng các tỉnh',
    chuTri: 'TS. Lê Minh Long - Phó Viện trưởng',
    diaDiem: 'Hội trường lớn',
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-tuan',
    trangThai: 'Da-duyet',
    ghiChu: 'Chuẩn bị 150 bộ tài liệu thảo luận, hệ thống âm thanh dịch cabin.',
  },
  {
    id: '24',
    ngay: '2026-09-17',
    thu: 'Thứ Năm',
    gio: '14:00',
    gioKetThuc: '16:00',
    noiDung: 'Đăng ký phòng họp: Đánh giá nội bộ Hệ thống quản lý chất lượng ISO 9001 và ISO 17025',
    thanhPhan: 'Tổ Thư ký ISO Viện, Trưởng các bộ phận chuyên môn',
    chuTri: 'Trưởng ban Đảm bảo chất lượng',
    diaDiem: 'Phòng họp số 1',
    xeCongTac: 'Không yêu cầu',
    loai: 'Phong-hop',
    trangThai: 'Da-duyet',
  },
  {
    id: '25',
    ngay: '2026-09-18',
    thu: 'Thứ Sáu',
    gio: '07:30',
    gioKetThuc: '18:00',
    noiDung: 'Kiểm định an toàn đập và hệ thống hầm dẫn nước Dự án Thủy điện Tích năng Bác Ái',
    thanhPhan: 'Đoàn chuyên gia kiểm định độc lập Viện KHCNXD & EVN',
    chuTri: 'TS. Nguyễn Hồng Hải - Phó Viện trưởng',
    diaDiem: 'Công trường Thủy điện Bác Ái, Ninh Thuận',
    xeCongTac: 'Xe 7 chỗ (29A-888.99) - Ford Everest',
    loai: 'business_trip',
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

const ROOM_OPTIONS = [
  'Phòng họp số 1',
  'Phòng họp số 2',
  'Hội trường lớn',
];

const VEHICLE_OPTIONS = [
  'Không yêu cầu',
  'Xe 7 chỗ (29A-888.99) - Ford Everest',
  'Xe 16 chỗ (29B-123.45) - Ford Transit',
  'Xe 4 chỗ (29A-678.90) - Toyota Camry',
  'Tự túc phương tiện',
];

const LEADER_OPTIONS = [
  'GS.TS. Nguyễn Xuân Khang - Viện trưởng',
  'PGS.TS. Trần Việt Hùng - Phó Viện trưởng',
  'TS. Lê Minh Long - Phó Viện trưởng',
  'TS. Nguyễn Hồng Hải - Phó Viện trưởng',
  'Trưởng các đơn vị chuyên môn',
];

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
  const [list, setList] = useState<LichCongTac[]>(loadEvents);

  // Sync to localStorage
  useEffect(() => {
    saveEvents(list);
  }, [list]);

  // View mode: 'month' | 'week' | 'day' | 'agenda' | 'manage' | 'lobby'
  const [view, setView] = useState<'month' | 'week' | 'day' | 'agenda' | 'manage' | 'lobby'>('month');

  // Date states - Mặc định vào ngày 08/09/2026 (ngày demo trùng với mock)
  const [selectedDate, setSelectedDate] = useState<Date>(new Date(2026, 8, 8));
  const currentMonth = selectedDate.getMonth();
  const currentYear = selectedDate.getFullYear();

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

  // Form states
  const [form, setForm] = useState<Omit<LichCongTac, 'id' | 'trangThai'>>({
    ngay: '2026-09-08',
    thu: 'Thứ Ba',
    gio: '08:30',
    gioKetThuc: '11:00',
    noiDung: '',
    thanhPhan: '',
    chuTri: LEADER_OPTIONS[0],
    diaDiem: ROOM_OPTIONS[0],
    xeCongTac: 'Không yêu cầu',
    loai: 'Lich-BGĐ',
    ghiChu: '',
    noiDungBaoCao: '',
  });

  // Clock for Lobby mode
  const [lobbyTime, setLobbyTime] = useState<Date>(new Date());
  const [lobbyScope, setLobbyScope] = useState<'today' | 'week'>('today');
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
    setSelectedDate(new Date(2026, 8, 8)); // Demo date 08/09/2026
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
      gio: '08:30',
      gioKetThuc: '11:00',
      noiDung: '',
      thanhPhan: '',
      chuTri: LEADER_OPTIONS[0],
      diaDiem: ROOM_OPTIONS[0],
      xeCongTac: 'Không yêu cầu',
      loai: 'Lich-tuan',
      ghiChu: '',
      noiDungBaoCao: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LichCongTac) => {
    setEditingItem(item);
    setForm({
      ngay: item.ngay,
      thu: item.thu,
      gio: item.gio,
      gioKetThuc: item.gioKetThuc || '',
      noiDung: item.noiDung,
      thanhPhan: item.thanhPhan,
      chuTri: item.chuTri,
      diaDiem: item.diaDiem,
      xeCongTac: item.xeCongTac || 'Không yêu cầu',
      loai: item.loai,
      ghiChu: item.ghiChu || '',
      noiDungBaoCao: item.noiDungBaoCao || '',
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch làm việc này?')) return;
    setList((prev) => prev.filter((x) => x.id !== id));
    setDetailItem(null);
  };

  const handleApprove = (id: string) => {
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, trangThai: 'Da-duyet' } : x)));
    if (detailItem && detailItem.id === id) {
      setDetailItem({ ...detailItem, trangThai: 'Da-duyet' });
    }
  };

  const handleSaveReport = (id: string, reportText: string) => {
    setList((prev) => prev.map((x) => (x.id === id ? { ...x, noiDungBaoCao: reportText } : x)));
    if (detailItem && detailItem.id === id) {
      setDetailItem({ ...detailItem, noiDungBaoCao: reportText });
    }
    alert('Đã lưu kết luận / biên bản cuộc họp thành công!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(form.ngay);
    const thu = days[d.getDay()];

    if (editingItem) {
      const updatedItem: LichCongTac = { ...editingItem, ...form, thu };
      setList((prev) =>
        prev.map((x) => (x.id === editingItem.id ? updatedItem : x))
      );
      if (detailItem && detailItem.id === editingItem.id) {
        setDetailItem(updatedItem);
      }
    } else {
      const newItem: LichCongTac = {
        id: String(Date.now()),
        trangThai: form.loai === 'Phong-hop' ? 'Cho-duyet' : 'Da-duyet',
        ...form,
        thu,
      };
      setList((prev) => [newItem, ...prev]);
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

  // ─── Slide panel: Biểu mẫu Đăng ký / Sửa lịch công tác ───
  useSlidePanelForm({
    id: 'lich-co-quan-form',
    open: modalOpen,
    title: editingItem ? 'Sửa thông tin lịch công tác' : 'Đăng ký lịch công tác & Đặt phòng họp',
    subtitle: editingItem
      ? `Cập nhật thông tin sự kiện #${editingItem.id}`
      : 'Điền thông tin sự kiện, chọn phòng họp và phương tiện',
    icon: <CalendarIcon size={14} />,
    storageKey: 'slideover-width-lich-co-quan-form',
    minWidth: 540,
    deps: [form, editingItem],
    onDongNgoaiLuong: () => setModalOpen(false),
    content: (
      <form id="lich-co-quan-form-element" onSubmit={handleSubmit} className="p-5 space-y-4">
        <Field label="Nội dung công việc / Cuộc họp" required>
          <textarea
            className={cn(inputCls, 'h-20 py-2 resize-none')}
            required
            value={form.noiDung}
            onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
            placeholder="VD: Giao ban Ban Giám đốc Viện tháng 9..."
          />
        </Field>

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

          <Field label="Ngày thực hiện" required>
            <input
              type="date"
              className={inputCls}
              required
              value={form.ngay}
              onChange={(e) => setForm({ ...form, ngay: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Field label="Địa điểm / Phòng họp" required>
            <select
              className={inputCls}
              value={form.diaDiem}
              onChange={(e) => setForm({ ...form, diaDiem: e.target.value })}
            >
              {ROOM_OPTIONS.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Đăng ký phương tiện xe công tác">
            <select
              className={inputCls}
              value={form.xeCongTac || 'Không yêu cầu'}
              onChange={(e) => setForm({ ...form, xeCongTac: e.target.value })}
            >
              {VEHICLE_OPTIONS.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
          <Field label="Lãnh đạo chủ trì" required>
            <select
              className={inputCls}
              value={form.chuTri}
              onChange={(e) => setForm({ ...form, chuTri: e.target.value })}
            >
              {LEADER_OPTIONS.map((l) => (
                <option key={l} value={l}>
                  {l}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Thành phần tham gia" required>
            <input
              className={inputCls}
              required
              value={form.thanhPhan}
              onChange={(e) => setForm({ ...form, thanhPhan: e.target.value })}
              placeholder="VD: Ban Giám đốc, Trưởng các đơn vị..."
            />
          </Field>
        </div>

        <Field label="Ghi chú chuẩn bị kỹ thuật / Trang thiết bị">
          <input
            className={inputCls}
            value={form.ghiChu || ''}
            onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
            placeholder="VD: Chuẩn bị máy chiếu, hoa tươi, 02 micro, kết nối Zoom..."
          />
        </Field>
      </form>
    ),
    footer: (
      <div className="w-full flex items-center justify-end gap-2">
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
          className="btn-primary text-xs font-bold px-4 py-2 cursor-pointer shadow-sm"
        >
          {editingItem ? 'Lưu thay đổi' : 'Đăng ký lịch'}
        </button>
      </div>
    ),
  });

  // In lịch / Print
  const handlePrint = () => {
    window.print();
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

        {/* ── VIEW 2: WEEKLY VIEW ── */}
        {view === 'week' && (
          <div className="p-4 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-7 gap-3.5">
              {DAYS_OF_WEEK.map((dayName, idx) => {
                const currentDayOfWeek = selectedDate.getDay() === 0 ? 7 : selectedDate.getDay();
                const diff = idx + 1 - currentDayOfWeek;
                const thisDate = new Date(selectedDate.getTime() + diff * 24 * 60 * 60 * 1000);
                const thisDateStr = formatLocalDate(thisDate);
                const dayEvents = filteredEvents.filter((item) => item.ngay === thisDateStr);
                const isTodayCell = isSameDay(thisDateStr, new Date(2026, 8, 8));

                return (
                  <div
                    key={idx}
                    className={cn(
                      'bg-subtle/30 dark:bg-slate-900/40 border border-border dark:border-slate-700/80 rounded-xl p-3 min-h-[340px] flex flex-col text-left transition-all',
                      isTodayCell && 'bg-primary-50/20 dark:bg-primary-950/30 border-primary dark:border-primary shadow-2xs ring-1 ring-primary/30'
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
                        className={cn(
                          'p-4 rounded-xl border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800/50 hover:border-primary border-l-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer hover:shadow-2xs transition-all',
                          item.loai === 'Lich-BGĐ' && 'border-l-indigo-500',
                          item.loai === 'Lich-tuan' && 'border-l-amber-500',
                          item.loai === 'Phong-hop' && 'border-l-emerald-500',
                          item.loai === 'meeting' && 'border-l-sky-500',
                          item.loai === 'business_trip' && 'border-l-orange-500',
                          item.loai === 'internal_event' && 'border-l-purple-500'
                        )}
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
              'bg-slate-950 text-white p-6 flex flex-col justify-between font-sans transition-all duration-300 relative',
              isFullscreen
                ? 'fixed inset-0 z-[9999] h-screen w-screen rounded-none border-none p-8 overflow-hidden'
                : 'min-h-[650px]'
            )}
          >
            {/* Top Bar: Switcher & Fullscreen */}
            <div className="flex justify-between items-center bg-white/[0.04] border border-white/10 p-3 rounded-2xl mb-5">
              <div className="flex items-center gap-2.5">
                <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Trực tuyến
                </span>
                <div className="flex items-center bg-white/5 border border-white/10 p-0.5 rounded-lg">
                  <button
                    onClick={() => {
                      setLobbyScope('today');
                      setLobbyPage(0);
                    }}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer',
                      lobbyScope === 'today' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Lịch Hôm nay
                  </button>
                  <button
                    onClick={() => {
                      setLobbyScope('week');
                      setLobbyPage(0);
                    }}
                    className={cn(
                      'px-3 py-1 rounded-md text-xs font-bold transition-all cursor-pointer',
                      lobbyScope === 'week' ? 'bg-white/20 text-white shadow' : 'text-slate-400 hover:text-white'
                    )}
                  >
                    Lịch Tuần này
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleFullscreen}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-white/10 hover:bg-white/20 text-white border border-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  {isFullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                  {isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    if (isFullscreen && document.exitFullscreen) document.exitFullscreen();
                    setView('month');
                  }}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold uppercase bg-red-600/80 hover:bg-red-600 text-white border border-red-500/30 transition-all flex items-center gap-1.5 cursor-pointer"
                >
                  <Monitor size={14} /> Thoát Tivi
                </button>
              </div>
            </div>

            {/* Header: Institutional Branding & Live Clock */}
            <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_auto] items-center gap-4 border-b border-white/10 pb-5 mb-5 text-center lg:text-left">
              {/* Clock widget */}
              <div className="flex items-center justify-center lg:justify-start">
                <div className="flex items-center gap-3 px-4 py-2.5 rounded-2xl border bg-white/[0.03] border-white/10 shadow-inner">
                  <div className="text-left">
                    <p className="text-sm font-black capitalize tracking-wide text-amber-400">
                      {lobbyTime.toLocaleDateString('vi-VN', { weekday: 'long' })}
                    </p>
                    <p className="text-xs font-bold text-slate-300">
                      {lobbyTime.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric' })}
                    </p>
                  </div>
                  <div className="w-px h-8 bg-white/20 mx-1" />
                  <span className="text-2xl font-black font-mono tracking-wider text-white">
                    {lobbyTime.toLocaleTimeString('vi-VN')}
                  </span>
                </div>
              </div>

              {/* Agency Title */}
              <div className="text-center flex flex-col items-center justify-center px-4">
                <span className="text-xs md:text-sm font-bold tracking-widest uppercase text-amber-400">
                  BỘ XÂY DỰNG
                </span>
                <span className="text-sm md:text-base lg:text-lg font-black mt-1 tracking-wider uppercase text-white/90">
                  VIỆN KHOA HỌC CÔNG NGHỆ XÂY DỰNG - IBST
                </span>
                <h1 className="text-xl md:text-2xl lg:text-3xl font-black tracking-widest uppercase text-white mt-1 drop-shadow">
                  LỊCH CÔNG TÁC CƠ QUAN {lobbyScope === 'today' ? '(HÔM NAY)' : '(TUẦN NÀY)'}
                </h1>
              </div>

              {/* Status Note */}
              <div className="hidden lg:flex flex-col items-end text-right text-xs text-slate-400">
                <span className="font-bold text-white flex items-center gap-1">
                  <Sparkles size={14} className="text-amber-400" /> Hệ thống hiển thị điện tử
                </span>
                <span className="mt-0.5 text-3xs">Trang {lobbyPage + 1}/{lobbyTotalPages}</span>
              </div>
            </div>

            {/* ── CÂU CHÀO MỪNG SẢNH (GREETING BANNER) ── */}
            <div className="mb-5 px-5 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500/10 via-amber-500/20 to-amber-500/10 border border-amber-500/30 shadow-lg text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2.5 min-w-0 flex-1 w-full">
                <span className="p-1.5 rounded-xl bg-amber-400/20 text-amber-400 shrink-0">
                  <Sparkles size={16} className="animate-pulse" />
                </span>
                {editingGreeting ? (
                  <div className="flex items-center gap-2 w-full">
                    <input
                      type="text"
                      value={greetingInput}
                      onChange={(e) => setGreetingInput(e.target.value)}
                      className="flex-1 bg-black/60 border border-amber-400/40 rounded-xl px-3 py-1.5 text-xs md:text-sm text-white focus:outline-none focus:border-amber-400 font-semibold"
                      placeholder="Nhập câu chào mừng sảnh tiếp đón..."
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSaveGreeting();
                        if (e.key === 'Escape') setEditingGreeting(false);
                      }}
                    />
                    <button
                      onClick={handleSaveGreeting}
                      className="px-3.5 py-1.5 bg-amber-500 text-slate-950 font-black text-xs rounded-xl hover:bg-amber-400 transition-all cursor-pointer shrink-0"
                    >
                      Lưu
                    </button>
                    <button
                      onClick={() => setEditingGreeting(false)}
                      className="px-2.5 py-1.5 text-slate-400 hover:text-white text-xs cursor-pointer shrink-0"
                    >
                      Hủy
                    </button>
                  </div>
                ) : (
                  <div
                    className="group flex items-center gap-2 cursor-pointer truncate"
                    onClick={() => {
                      setGreetingInput(lobbyGreeting);
                      setEditingGreeting(true);
                    }}
                    title="Bấm để chỉnh sửa câu chào mừng"
                  >
                    <p className="text-xs md:text-sm lg:text-base font-bold tracking-wide text-amber-200 truncate uppercase">
                      {lobbyGreeting}
                    </p>
                    <button
                      type="button"
                      className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 text-amber-400 transition-opacity cursor-pointer shrink-0"
                      title="Chỉnh sửa câu chào"
                    >
                      <Pencil size={12} />
                    </button>
                  </div>
                )}
              </div>

              {!editingGreeting && (
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => {
                      setGreetingInput(lobbyGreeting);
                      setEditingGreeting(true);
                    }}
                    className="px-2.5 py-1 text-3xs font-bold text-amber-300 hover:text-white hover:bg-white/10 rounded-lg border border-amber-400/30 transition-all flex items-center gap-1 cursor-pointer"
                  >
                    <Pencil size={10} /> Đổi câu chào
                  </button>
                </div>
              )}
            </div>

            {/* Middle Content: High-contrast Grid/Table */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
              {lobbyEvents.length === 0 ? (
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
              )}
            </div>

            {/* Lobby Footer: Pagination Carousel Dots & Note */}
            <div className="border-t border-white/10 mt-5 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-3">
              <span className="text-3xs tracking-wider">
                HỆ THỐNG QUẢN TRỊ TỔNG THỂ IBST — TRỤ LIÊN THÔNG VĂN PHÒNG SỐ
              </span>

              {lobbyTotalPages > 1 && (
                <div className="flex items-center gap-2">
                  {Array.from({ length: lobbyTotalPages }).map((_, pIdx) => (
                    <button
                      key={pIdx}
                      onClick={() => setLobbyPage(pIdx)}
                      className={cn(
                        'w-3 h-3 rounded-full transition-all cursor-pointer',
                        lobbyPage === pIdx ? 'bg-amber-400 w-6' : 'bg-white/20 hover:bg-white/40'
                      )}
                      title={`Trang ${pIdx + 1}`}
                    />
                  ))}
                </div>
              )}

              <span className="text-3xs text-slate-500">
                Độc lập - Chuyên nghiệp - Tin cậy
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
