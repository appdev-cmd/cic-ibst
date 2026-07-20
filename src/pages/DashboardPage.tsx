import React, { useState } from 'react';
import {
  Handshake,
  Microscope,
  Wallet,
  AlertTriangle,
  TrendingUp,
  Building2,
  DollarSign,
  AlertCircle,
  FileCheck2,
  ShieldAlert,
  Activity,
  FileText,
  PiggyBank,
  Receipt,
  Banknote,
  BookOpen,
  Users,
  Target,
  FileSignature,
  Landmark,
  Newspaper,
  Globe2,
  Network,
  Filter,
  Calendar,
  ChevronDown
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  ComposedChart,
  Area,
  AreaChart
} from 'recharts';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-default)',
    borderRadius: '8px',
    color: 'var(--text-primary)'
  },
  labelStyle: {
    color: 'var(--text-primary)',
    fontWeight: 'bold'
  },
  itemStyle: {
    color: 'var(--text-secondary)'
  }
};

const CustomKHCNTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border p-3.5 rounded-lg shadow-lg text-[13px]">
        <p className="font-black text-ink mb-2">{data.name}</p>
        <div className="space-y-1">
          <p className="text-ink-secondary">
            Kinh phí cấp 2026: <span className="font-black text-primary-500">{data.kinhPhi.toFixed(3)} tỷ VNĐ</span>
          </p>
          <p className="text-ink-secondary">
            Số lượng nhiệm vụ: <span className="font-black text-success">{data.deTai} nhiệm vụ</span>
          </p>
          <div className="text-2xs text-ink-muted mt-2 border-t border-border pt-1.5 flex gap-3">
            <span>HĐ: {data.contractVal.toFixed(3)} tỷ</span>
            <span>Giải ngân: {data.disbursed.toFixed(3)} tỷ</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const [activeTab, setActiveTab] = useState('tong-quan');
  const [filterYear, setFilterYear] = useState('2026');
  const [filterPeriod, setFilterPeriod] = useState('6-thang');

  // --- MOCK DATA TỪ BÁO CÁO ---

  const overviewData = {
    totalNhiemVuKHCN: 70, // 02 QC, 54 TC, 14 Đề tài
    kinhPhiKHCN2026: 29.568, // tỷ VNĐ
    giaTriKy: 759.5, // tỷ VNĐ (101% KH)
    giaTriDoanhThu: 396.68, // tỷ VNĐ (53% KH)
    tongTienVe: 449.67, // tỷ VNĐ
    tongNoLuyKe: 211.71, // tỷ VNĐ
    nopNganSach: 34.64, // tỷ VNĐ
    nhiemVuQLNN: 119, // lượt
    baoCaoRaSoat: 48, // lượt
    quyLuong: 25.46, // tỷ VNĐ
    tongNhanSu: 523, // người
    baoLanhNH: 74.5, // tỷ VNĐ
    dauTuCong: 571.43, // 562.5 + 8.89
  };

  const khcnData = [
    { name: 'Viện', deTai: 1, contractVal: 2.000, kinhPhi: 1.000, disbursed: 0.8816, pct: 88.16 },
    { name: 'VCNKC', deTai: 13, contractVal: 11.090, kinhPhi: 9.345, disbursed: 1.1335, pct: 12.13 },
    { name: 'VCNBT', deTai: 16, contractVal: 11.198, kinhPhi: 3.0409, disbursed: 0.000, pct: 0.0 },
    { name: 'VCNĐKT', deTai: 16, contractVal: 12.400, kinhPhi: 3.645, disbursed: 0.000, pct: 0.0 },
    { name: 'TTKCT', deTai: 11, contractVal: 16.400, kinhPhi: 9.982, disbursed: 2.1348, pct: 21.39 },
    { name: 'TTCDAQT&XD', deTai: 3, contractVal: 3.180, kinhPhi: 0.376, disbursed: 0.000, pct: 0.0 },
    { name: 'TBXD', deTai: 3, contractVal: 2.500, kinhPhi: 0.345, disbursed: 0.2154, pct: 62.43 },
    { name: 'TVTK', deTai: 2, contractVal: 1.350, kinhPhi: 1.350, disbursed: 0.000, pct: 0.0 },
    { name: 'TVĂM', deTai: 1, contractVal: 1.200, kinhPhi: 0.3348, disbursed: 0.000, pct: 0.0 },
    { name: 'CNVL', deTai: 3, contractVal: 0.800, kinhPhi: 0.000, disbursed: 0.000, pct: 0.0 },
    { name: 'TTTĐ', deTai: 1, contractVal: 0.650, kinhPhi: 0.150, disbursed: 0.000, pct: 0.0 },
  ];

  // Đầy đủ 16 đơn vị theo Bảng 3
  const doanhThuData = [
    { name: 'VCNKC', doanhThu: 31.03, kyMoi: 43.69, keHoach: 70.0, kh: 44 },
    { name: 'VCNBT', doanhThu: 26.27, kyMoi: 21.81, keHoach: 38.6, kh: 68 },
    { name: 'VCNĐKT', doanhThu: 14.39, kyMoi: 27.88, keHoach: 22.0, kh: 65 },
    { name: 'PVMN', doanhThu: 36.29, kyMoi: 50.16, keHoach: 60.5, kh: 60 },
    { name: 'PVMT', doanhThu: 14.97, kyMoi: 7.93, keHoach: 42.0, kh: 36 },
    { name: 'TVTK', doanhThu: 16.81, kyMoi: 38.71, keHoach: 25.0, kh: 67 },
    { name: 'TTKCT', doanhThu: 12.34, kyMoi: 27.68, keHoach: 24.0, kh: 51 },
    { name: 'TVĂM', doanhThu: 50.37, kyMoi: 89.75, keHoach: 72.2, kh: 70 },
    { name: 'CNXD', doanhThu: 18.74, kyMoi: 73.25, keHoach: 50.0, kh: 37 },
    { name: 'TTTĐ', doanhThu: 16.63, kyMoi: 20.28, keHoach: 25.8, kh: 64 },
    { name: 'CNHT', doanhThu: 19.77, kyMoi: 33.34, keHoach: 28.0, kh: 71 },
    { name: 'TBXD', doanhThu: 26.02, kyMoi: 55.09, keHoach: 40.0, kh: 65 },
    { name: 'CNVL', doanhThu: 8.64, kyMoi: 8.72, keHoach: 16.0, kh: 54 },
    { name: 'TTCDAQT&XD', doanhThu: 51.39, kyMoi: 83.49, keHoach: 45.0, kh: 114 },
    { name: 'TT BIM', doanhThu: 24.09, kyMoi: 65.16, keHoach: 71.8, kh: 34 },
    { name: 'IBST COTEC', doanhThu: 28.94, kyMoi: 112.58, keHoach: 58.0, kh: 50 },
  ];

  // Đầy đủ 16 đơn vị theo Bảng 7
  const noDongData = [
    { name: 'PVMN', tongNo: 30.38, noNV: 10.02 },
    { name: 'TVĂM', tongNo: 26.37, noNV: 4.88 },
    { name: 'IBST COTEC', tongNo: 23.48, noNV: 0.37 },
    { name: 'TTCDAQT&XD', tongNo: 19.64, noNV: 1.23 },
    { name: 'TBXD', tongNo: 15.76, noNV: 2.24 },
    { name: 'TTTĐ', tongNo: 14.39, noNV: 2.36 },
    { name: 'VCNKC', tongNo: 13.06, noNV: 4.86 },
    { name: 'CNHT', tongNo: 13.05, noNV: 3.71 },
    { name: 'CNXD', tongNo: 11.58, noNV: 1.43 },
    { name: 'TTKCT', tongNo: 10.78, noNV: 0.75 },
    { name: 'TVTK', tongNo: 8.73, noNV: 1.52 },
    { name: 'CNVL', tongNo: 7.54, noNV: 1.30 },
    { name: 'PVMT', tongNo: 5.19, noNV: 0.47 },
    { name: 'VCNĐKT', tongNo: 4.85, noNV: 1.26 },
    { name: 'TT BIM', tongNo: 4.58, noNV: 0.12 },
    { name: 'VCNBT', tongNo: 2.27, noNV: 6.21 },
  ];

  // Trạng thái công trình trọng điểm (Mục IX.1)
  const majorProjects = [
    { name: 'Nhà Quốc hội Lào', category: 'Giám sát kỹ thuật xây dựng', status: 'Hoàn thành bàn giao', progress: 100 },
    { name: 'Sân bay Long Thành', category: 'Tư vấn HĐ nghiệm thu Nhà nước', status: 'Đang triển khai', progress: 75 },
    { name: 'TT Hội nghị Quốc gia', category: 'Kiểm định chất lượng định kỳ', status: 'Đã hoàn thành báo cáo', progress: 100 },
    { name: 'Dự án Phân giới cắm mốc', category: 'Đo đạc & Khảo sát địa hình biên giới', status: 'Đang thực hiện', progress: 60 },
  ];

  // Danh mục Quy chuẩn & Tiêu chuẩn cốt lõi đang soạn thảo (Phần phụ lục 1.1)

  // Danh mục Quy chuẩn & Tiêu chuẩn cốt lõi đang soạn thảo (Phần phụ lục 1.1)
  const coreStandards = [
    { code: 'QCVN 06:2026/BXD', name: 'Sửa đổi Quy chuẩn An toàn cháy', leader: 'Cao Duy Khôi', status: 'Chờ ban hành', progress: 95 },
    { code: 'QCVN 02:2026/BXD', name: 'Sửa đổi Quy chuẩn Số liệu tự nhiên', leader: 'Nguyễn Hồng Hải', status: 'Đã nghiệm thu Bộ', progress: 100 },
    { code: 'RD 03-25', name: 'Quy chuẩn Công trình công nghiệp', leader: 'Nguyễn Hồng Hải', status: 'Đã nghiệm thu Bộ', progress: 100 },
    { code: 'RD 05-25', name: 'Giải pháp kỹ thuật nâng cao an toàn PCCC', leader: 'Cao Duy Khôi', status: 'Tiếp thu ý kiến Bộ', progress: 85 },
    { code: 'QCVN 04:2021/BXD', name: 'Sửa đổi Quy chuẩn Nhà chung cư (Bổ sung trạm sạc)', leader: 'Lãnh đạo Viện', status: 'Lấy ý kiến rộng rãi', progress: 90 },
    { code: 'QCVN 04-4:202x/BXD', name: 'Hệ thống điện trong nhà ở và nhà công cộng', leader: 'TT Thiết bị', status: 'Hoàn thiện dự thảo', progress: 80 },
  ];

  // Các dự án đầu tư phát triển cơ sở vật chất (Mục IX.5)
  const investmentProjects = [
    { name: 'Nhà làm việc 10 tầng (Trụ sở chính)', scale: '562.5 tỷ VNĐ', period: 'Vốn trung hạn 2026-2030', status: 'Lập quy hoạch tổng mặt bằng', progress: 20 },
    { name: 'Đầu tư trang thiết bị PTN dùng chung', scale: '8.89 tỷ VNĐ', period: 'Nguồn Quỹ phát triển hoạt động sự nghiệp', status: 'Trình Bộ Xây dựng phê duyệt', progress: 50 },
    { name: 'Cải tạo mặt đứng nhà N1 & chống thấm', scale: 'Chi thường xuyên', period: 'Nguồn sửa chữa nhỏ', status: 'Hoàn thành bàn giao', progress: 100 },
    { name: 'Cải tạo Phân viện Miền Trung', scale: 'Chi thường xuyên', period: 'Nguồn sửa chữa nhỏ', status: 'Đang triển khai', progress: 70 },
  ];

  // Đánh giá Sức khỏe Vận hành Đơn vị (Tỷ lệ hoàn thành kế hoạch)
  const unitHealthData = [
    { name: 'TTCDAQT&XD', khProgress: 114, status: 'Xuất sắc', color: 'text-success' },
    { name: 'CNHT', khProgress: 71, status: 'Tốt', color: 'text-info' },
    { name: 'TVĂM', khProgress: 70, status: 'Tốt', color: 'text-info' },
    { name: 'VCNBT', khProgress: 68, status: 'Tốt', color: 'text-info' },
    { name: 'TVTK', khProgress: 67, status: 'Khá', color: 'text-primary' },
    { name: 'VCNĐKT', khProgress: 65, status: 'Khá', color: 'text-primary' },
    { name: 'TBXD', khProgress: 65, status: 'Khá', color: 'text-primary' },
    { name: 'TTTĐ', khProgress: 64, status: 'Khá', color: 'text-primary' },
    { name: 'PVMN', khProgress: 60, status: 'Trung bình', color: 'text-warning' },
    { name: 'CNVL', khProgress: 54, status: 'Trung bình', color: 'text-warning' },
    { name: 'TTKCT', khProgress: 51, status: 'Trung bình', color: 'text-warning' },
    { name: 'IBST COTEC', khProgress: 50, status: 'Trung bình', color: 'text-warning' },
    { name: 'VCNKC', khProgress: 44, status: 'Cảnh báo', color: 'text-danger' },
    { name: 'CNXD', khProgress: 37, status: 'Cảnh báo', color: 'text-danger' },
    { name: 'PVMT', khProgress: 36, status: 'Cảnh báo', color: 'text-danger' },
    { name: 'TT BIM', khProgress: 34, status: 'Cảnh báo', color: 'text-danger' },
  ];

  const nhanSuBienDongData = [
    { month: 'T1', tuyen: 8, nghi: 2 },
    { month: 'T2', tuyen: 12, nghi: 4 },
    { month: 'T3', tuyen: 15, nghi: 3 },
    { month: 'T4', tuyen: 10, nghi: 5 },
    { month: 'T5', tuyen: 8, nghi: 2 },
    { month: 'T6', tuyen: 10, nghi: 4 },
  ];

  const lasXdData = [
    { name: 'LAS-XD 09 (Hà Nội)', desc: 'Phòng thí nghiệm chính tại trụ sở Viện: Kết cấu, Bê tông, Địa kỹ thuật, Ăn mòn...', status: 'Hoạt động tốt' },
    { name: 'LAS-XD Phân viện Miền Nam (TP.HCM)', desc: 'Kiểm định, thí nghiệm kết cấu và vật liệu tại khu vực phía Nam.', status: 'Hoạt động tốt' },
    { name: 'LAS-XD Phân viện Miền Trung (Đà Nẵng)', desc: 'Thí nghiệm tổng hợp, phục vụ các tỉnh miền Trung & Tây Nguyên.', status: 'Hoạt động tốt' },
  ];

  const scientificPapers = [
    { 
      title: 'Đánh giá kỹ thuật và đề xuất mô hình mô phỏng nhà máy điện rác PPP đạt chuẩn BAT-IED', 
      author: 'Phạm Văn Vương', 
      journal: 'Tạp chí Kinh tế Tài chính Việt Nam, 2026-01',
      url: 'https://nghiencuu.tapchikinhtetaichinh.vn/danh-gia-ky-thuat-va-de-xuat-mo-hinh-mo-phong-ho-tro-ra-quyet-dinh-dau-tu-xay-dung-nha-may-dien-rac-theo-hinh-thuc-ppp-dat-chuan-bat-ied-tai-viet-nam-143770.html'
    },
    { 
      title: 'Đánh giá mức độ tương thích và tác động kinh tế - tài chính của tiêu chuẩn điện rác PPP', 
      author: 'Phạm Văn Vương', 
      journal: 'Tạp chí Kinh tế Tài chính Việt Nam, 2026-02',
      url: 'https://nghiencuu.tapchikinhtetaichinh.vn/danh-gia-muc-do-tuong-thich-va-tac-dong-kinh-te-tai-chinh-cua-he-thong-tieu-chuan-quy-chuan-ky-thuat-doi-voi-cay-du-an-dot-rac-phat-dien-theo-mo-hinh-ppp-tai-viet-nam-theo-tiep-can-bat-ied-149074.html'
    },
    { 
      title: 'Đánh giá tác động pháp lý liên ngành và tính khả thi tài chính dự án điện rác', 
      author: 'Phạm Văn Vương', 
      journal: 'Tạp chí Kinh tế Tài chính Việt Nam, 2026-03',
      url: 'https://nghiencuu.tapchikinhtetaichinh.vn/danh-gia-tac-dong-cua-khung-phap-ly-lien-nganh-va-de-xuat-mo-hinh-tich-hop-nham-nang-cao-tinh-kha-thi-tai-chinh-cua-du-an-dien-rac-theo-hinh-thuc-ppp-tai-viet-nam-152038.html'
    },
    { 
      title: 'Ảnh hưởng biến động nguồn rác đến hiệu quả tài chính và cơ chế MGQ trong dự án PPP', 
      author: 'Phạm Văn Vương', 
      journal: 'Tạp chí Kinh tế Tài chính Việt Nam, 2026-04',
      url: 'https://nghiencuu.tapchikinhtetaichinh.vn/anh-huong-cua-bien-dong-nguon-chat-thai-ran-sinh-hoat-den-hieu-qua-tai-chinh-va-co-che-mgq-trong-du-an-dien-rac-theo-hinh-thuc-ppp-tai-viet-nam-154688.html'
    },
    { 
      title: 'Nghiên cứu phản ứng kiềm Silic của một số loại cốt liệu theo các phương pháp nhanh', 
      author: 'Hoàng Minh Đức, Nguyễn Văn Thạnh', 
      journal: 'Tạp chí KHCN Xây dựng số 4, 2025',
      url: 'https://tapchi.ibst.vn/'
    },
    { 
      title: 'Ảnh hưởng cốt liệu đến cường độ còn lại của bê tông sau nung nhiệt độ cao', 
      author: 'Đoàn Thị Thu Lương, Nguyễn Kim Thịnh', 
      journal: 'Tạp chí KHCN Xây dựng số 4, 2025',
      url: 'https://tapchi.ibst.vn/'
    },
    { 
      title: 'Thiết lập cơ sở dữ liệu cấu trúc nền địa chất 3D phát triển bền vững ngầm Hà Nội', 
      author: 'Nguyễn Công Kiên, Đinh Quốc Dân...', 
      journal: 'Tạp chí KHCN Xây dựng số 4, 2025',
      url: 'https://tapchi.ibst.vn/'
    },
    { 
      title: 'Phân tích thực trạng nhà hiện hữu không đảm bảo PCCC và giải pháp nâng cao an toàn cháy', 
      author: 'Cao Duy Khôi, Phạm Anh Tuấn...', 
      journal: 'Tạp chí KHCN Xây dựng',
      url: 'https://tapchi.ibst.vn/'
    },
  ];

  const conferences = [
    { name: 'Hội thảo lấy ý kiến rộng rãi Sửa đổi 1:2026 QCVN 04:2021/BXD (bổ sung trạm sạc)', date: '06/02/2026', org: 'Viện KHCNXD' },
    { name: 'Hội thảo lấy ý kiến Sửa đổi QCVN 02:2022/BXD (QC về số liệu điều kiện tự nhiên)', date: '02/04/2026', org: 'Viện KHCNXD' },
    { name: 'Hội thảo QCVN 04-4:202x/BXD (Hệ thống điện trong nhà ở và nhà công cộng)', date: '09/04/2026', org: 'Viện KHCNXD' },
    { name: 'Hội thảo quốc tế về nhiên liệu hàng không bền vững (SAF) tại ASEAN', date: '25/06/2026', org: 'Bộ Xây dựng' },
    { name: 'Hội thảo Quốc tế về công nghệ giao thông & Hạ tầng tiên tiến thông minh (ICATTI)', date: '25-26/06/2026', org: 'Uỷ ban chuyên môn' },
  ];

  const growthComparisonData = [
    { name: 'Ký hợp đồng', val2025: 564.0, val2026: 759.5 },
    { name: 'Doanh thu', val2025: 309.43, val2026: 396.68 },
    { name: 'Tiền về', val2025: 411.71, val2026: 449.67 },
  ];

  const coCauDoanhThu = [
    { name: 'TVGS, Thiết kế', value: 182.33 },
    { name: 'Khảo sát, TN', value: 118.75 },
    { name: 'Thi công XD', value: 65.70 },
    { name: 'Cung ứng VT', value: 22.45 },
  ];

  const coCauTienVe = [
    { name: 'Thanh toán mới', value: 265.05 },
    { name: 'Khách trả nợ cũ', value: 86.21 },
    { name: 'Khách tạm ứng', value: 98.41 },
  ];

  const coCauThue = [
    { name: 'Thuế GTGT', value: 23.15 },
    { name: 'Thuế TNDN', value: 5.8 },
    { name: 'Thuế TNCN', value: 5.69 },
  ];

  const taiChinhData = [
    { month: 'T1', luong: 6.5, thue: 2.1, nsnn: 4.5, dongTien: 55, doanhThu: 45, kyMoi: 90 },
    { month: 'T2', luong: 6.8, thue: 1.5, nsnn: 3.2, dongTien: 42, doanhThu: 40, kyMoi: 70 },
    { month: 'T3', luong: 7.2, thue: 3.2, nsnn: 5.1, dongTien: 89, doanhThu: 75, kyMoi: 145 },
    { month: 'T4', luong: 7.0, thue: 2.8, nsnn: 6.0, dongTien: 76, doanhThu: 68, kyMoi: 120 },
    { month: 'T5', luong: 7.5, thue: 3.5, nsnn: 5.8, dongTien: 91, doanhThu: 82, kyMoi: 155 },
    { month: 'T6', luong: 8.1, thue: 4.2, nsnn: 5.4, dongTien: 96.67, doanhThu: 86.68, kyMoi: 179.5 },
  ];

  // Bảng màu 16 mã màu để phân biệt rõ rệt 16 đơn vị
  const COLORS = [
    '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
    '#84cc16', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#e11d48', '#10b981', '#6366f1'
  ];
  const DEBT_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#6366f1', '#0ea5e9', '#e11d48', '#d97706'
  ];

  // --- CÁC COMPONENT GIAO DIỆN ---

  const renderFilterBar = () => (
    <div className="flex flex-col sm:flex-row gap-2 items-center bg-surface p-1 rounded-xl border border-border shadow-sm w-fit">
      <div className="flex items-center border-r border-border pl-1.5 pr-2.5">
        <Filter className="w-4 h-4 text-primary-500" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <div className="relative group">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="appearance-none bg-subtle text-ink font-medium text-[12.5px] rounded-lg pl-3 pr-8 py-1.5 outline-none border border-border focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
            <option value="2024">Năm 2024</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        <div className="relative group">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="appearance-none bg-subtle text-ink font-medium text-[12.5px] rounded-lg pl-3 pr-8 py-1.5 outline-none border border-border focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="all">Cả năm</option>
            <option value="q1">Quý I</option>
            <option value="q2">Quý II</option>
            <option value="q3">Quý III</option>
            <option value="q4">Quý IV</option>
            <option value="6-thang">6 Tháng đầu năm</option>
            <option value="9-thang">9 Tháng</option>
            <option value="custom">Tùy chọn khoảng thời gian...</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {filterPeriod === 'custom' && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="date" className="bg-subtle text-ink font-medium text-[12.5px] rounded-lg pl-9 pr-4 py-1.5 outline-none border border-border focus:border-primary-500" />
            </div>
            <span className="text-ink-muted">-</span>
            <div className="relative">
              <Calendar className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
              <input type="date" className="bg-subtle text-ink font-medium text-[12.5px] rounded-lg pl-9 pr-4 py-1.5 outline-none border border-border focus:border-primary-500" />
            </div>
          </div>
        )}
      </div>
    </div>
  );

  const renderTabs = () => {
    const tabs = [
      { id: 'tong-quan', label: 'Tổng quan Viện', icon: Activity },
      { id: 'nckh', label: 'Nghiên cứu & QLNN', icon: Microscope },
      { id: 'kinh-doanh', label: 'Kinh doanh & TBKT', icon: TrendingUp },
      { id: 'tai-chinh', label: 'Tài chính & Đầu tư', icon: PiggyBank },
      { id: 'nhan-su', label: 'Tổ chức & Hành chính', icon: Users },
    ];

    return (
      <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-xl shadow-sm border border-border w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary-500 text-white shadow-sm'
                  : 'text-ink-secondary hover:bg-subtle hover:text-ink'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-ink-muted'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    );
  };

  interface KPICardProps {
    title: string;
    value: string | number;
    subtitle?: string;
    icon: React.ElementType;
    color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'gold';
    trend?: string;
  }

  const KPICard = ({ title, value, subtitle, icon: Icon, color = 'primary', trend }: KPICardProps) => {
    const colorClasses: Record<string, string> = {
      primary: 'bg-primary-500/10 text-primary-500',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
      info: 'bg-info/10 text-info',
      accent: 'bg-accent/10 text-accent',
      gold: 'bg-gold/10 text-gold-dark',
    };

    return (
      <div className="card p-5 flex flex-col justify-between hover:-translate-y-1 transition-transform duration-200">
        <div className="flex items-start justify-between mb-4">
          <div className={`p-3 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-6 h-6" />
          </div>
          {trend && (
            <span className={`text-[13px] font-bold px-2.5 py-1 rounded-full ${trend.startsWith('+') ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
              {trend}
            </span>
          )}
        </div>
        <div>
          <h3 className="text-3xl font-black text-ink mb-1">{value}</h3>
          <p className="text-[14px] font-bold text-ink-muted uppercase tracking-wider">{title}</p>
          {subtitle && <p className="text-[13px] font-medium text-ink-secondary mt-1.5">{subtitle}</p>}
        </div>
      </div>
    );
  };

  return (
    <div className="px-6 pt-2 pb-20 w-full mx-auto space-y-4">
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
        <h1 className="text-3xl font-black text-ink">Dashboard Quản trị IBST</h1>
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-success"></span>
          </span>
          <p className="text-ink-muted text-[15px] font-medium">Dữ liệu tổng hợp Real-time</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {renderTabs()}
        {renderFilterBar()}
      </div>

      {/* TAB 1: TỔNG QUAN */}
      {activeTab === 'tong-quan' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Row 1: KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard title="Giá trị Ký Hợp đồng" value={`${overviewData.giaTriKy} tỷ`} subtitle="Đạt 101% kế hoạch (750 tỷ)" icon={FileSignature} color="primary" trend="+34%" />
            <KPICard title="Thực hiện Doanh thu" value={`${overviewData.giaTriDoanhThu} tỷ`} subtitle="Đạt 53% kế hoạch (750 tỷ)" icon={DollarSign} color="success" trend="+28%" />
            <KPICard title="Nhiệm vụ KHCN" value={overviewData.totalNhiemVuKHCN} subtitle="Kinh phí NSNN 29.56 tỷ" icon={BookOpen} color="gold" />
            <KPICard title="Phục vụ QLNN" value={`${overviewData.nhiemVuQLNN} Lượt`} subtitle="48 báo cáo rà soát" icon={Landmark} color="info" />
            <KPICard title="Tổng nợ lũy kế" value={`${overviewData.tongNoLuyKe} tỷ`} subtitle="Cần đôn đốc thu hồi" icon={AlertTriangle} color="danger" trend="+12%" />
          </div>

          {/* Row 2: Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <div className="flex justify-between items-center mb-6 border-b border-border pb-3">
                <h3 className="text-[16px] font-black text-ink">Biểu đồ Kế hoạch & Doanh thu các Đơn vị (Tỷ VNĐ)</h3>
              </div>
              <div className="h-[500px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={doanhThuData} margin={{ top: 25, right: 20, bottom: 35, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickMargin={12} angle={-35} textAnchor="end" height={70} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip 
                      cursor={{ fill: 'var(--bg-subtle)' }}
                      {...tooltipStyle}
                      formatter={(value: any, name: any, props: any) => {
                        if (name === "Doanh thu thực hiện") {
                          const pct = props.payload?.kh;
                          return [`${value} tỷ (${pct}%)`, name];
                        }
                        return [`${value} tỷ`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600', paddingTop: '20px' }} />
                    <Bar 
                      dataKey="doanhThu" 
                      name="Doanh thu thực hiện" 
                      radius={[4, 4, 0, 0]} 
                      maxBarSize={30} 
                      fill="var(--color-success, #10b981)"
                      label={(props: any) => {
                        const { x, y, width, index } = props;
                        if (index === undefined || x === undefined || y === undefined || width === undefined) return null;
                        const pct = doanhThuData[index]?.kh;
                        return (
                          <text x={Number(x) + Number(width) / 2} y={Number(y) - 8} fill="var(--text-secondary)" fontSize={9} fontWeight={700} textAnchor="middle">
                            {pct}%
                          </text>
                        );
                      }}
                    >
                      {doanhThuData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="keHoach" name="Kế hoạch Doanh thu" stroke="var(--text-primary)" strokeWidth={2.5} dot={{ r: 5, fill: 'var(--bg-surface)' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6 lg:col-span-1">
              <div className="card p-6">
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Cơ cấu Doanh thu theo Lĩnh vực</h3>
                <div className="h-[180px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={coCauDoanhThu} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                        {coCauDoanhThu.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                      <Legend layout="vertical" verticalAlign="middle" align="right" wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6">
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Hoạt động Quản trị nổi bật</h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-info/10 rounded-lg text-info"><Globe2 className="w-5 h-5" /></div>
                    <div>
                      <h4 className="font-bold text-ink text-[14px]">Hợp tác Quốc tế & Trong nước</h4>
                      <p className="text-[13px] text-ink-secondary mt-1">Ký MOU Tập đoàn Trần Đức, làm việc với JICA, ACI, KICT.</p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary-500"><Building2 className="w-5 h-5" /></div>
                    <div>
                      <h4 className="font-bold text-ink text-[14px]">Dự án Tòa nhà 10 tầng</h4>
                      <p className="text-[13px] text-ink-secondary mt-1">Tổng mức đầu tư 562.5 tỷ. Đang lập quy hoạch tổng mặt bằng.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
          
          {/* Row 3: More detail tables/charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Ký hợp đồng, Doanh thu & Dòng tiền về trong kỳ (Tỷ VNĐ)</h3>
              <div className="h-[370px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={taiChinhData} margin={{ top: 10, right: 10, left: 5, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDongTien" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="var(--color-primary, #00668c)" stopOpacity={0.25}/>
                        <stop offset="95%" stopColor="var(--color-primary, #00668c)" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '10px' }} />
                    <Area type="monotone" dataKey="dongTien" name="Dòng tiền về" stroke="var(--color-primary, #00668c)" strokeWidth={3} fillOpacity={1} fill="url(#colorDongTien)" />
                    <Line type="monotone" dataKey="doanhThu" name="Doanh thu thực hiện" stroke="var(--color-success, #10b981)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--bg-surface)' }} />
                    <Line type="monotone" dataKey="kyMoi" name="Ký Hợp đồng mới" stroke="var(--color-warning, #f59e0b)" strokeWidth={2.5} dot={{ r: 4, fill: 'var(--bg-surface)' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="card p-6">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Cảnh báo Nợ đọng: TOP Đơn vị nguy cơ cao</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="th-cell rounded-tl-lg">Đơn vị</th>
                      <th className="th-cell">Tổng Nợ (Tỷ)</th>
                      <th className="th-cell">Nợ Nghĩa vụ Viện</th>
                      <th className="th-cell text-right">Trạng thái</th>
                    </tr>
                  </thead>
                  <tbody>
                    {noDongData.slice(0, 8).map((row, idx) => (
                      <tr key={idx} className="tr-hover">
                        <td className="td-cell font-bold" style={{ color: DEBT_COLORS[idx] }}>{row.name}</td>
                        <td className="td-cell text-danger font-bold">{row.tongNo}</td>
                        <td className="td-cell font-medium text-warning">{row.noNV}</td>
                        <td className="td-cell text-right">
                          <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-bold bg-danger/10 text-danger">
                            Cảnh báo
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Row 4: Công trình trọng điểm & Đấu thầu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Giám sát các Công trình Trọng điểm Quốc gia (Mục IX.1)</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="th-cell rounded-tl-lg">Tên công trình</th>
                      <th className="th-cell">Nội dung hỗ trợ kỹ thuật</th>
                      <th className="th-cell">Trạng thái báo cáo</th>
                      <th className="th-cell text-right rounded-tr-lg">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {majorProjects.map((proj, idx) => (
                      <tr key={idx} className="tr-hover">
                        <td className="td-cell font-bold text-ink">{proj.name}</td>
                        <td className="td-cell text-ink-secondary">{proj.category}</td>
                        <td className="td-cell">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            proj.status.startsWith('Hoàn thành')
                              ? 'bg-success/10 text-success'
                              : 'bg-primary/10 text-primary-500'
                          }`}>
                            {proj.status}
                          </span>
                        </td>
                        <td className="td-cell text-right font-black text-ink-secondary">{proj.progress}%</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            
            <div className="card p-6 lg:col-span-1 flex flex-col justify-between">
              <div>
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Năng lực Đấu thầu qua mạng</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border">
                    <span className="text-[13px] font-bold text-ink-secondary">Tổng gói tham gia</span>
                    <span className="text-[15px] font-black text-ink">58 gói</span>
                  </div>
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border">
                    <span className="text-[13px] font-bold text-ink-secondary">Số gói trúng thầu</span>
                    <span className="text-[15px] font-black text-success">47 gói</span>
                  </div>
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border">
                    <span className="text-[13px] font-bold text-ink-secondary">Tỷ lệ trúng thầu</span>
                    <span className="text-[15px] font-black text-primary-500">81.0%</span>
                  </div>
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border">
                    <span className="text-[13px] font-bold text-ink-secondary">Tổng giá trị trúng</span>
                    <span className="text-[15px] font-black text-danger">18.94 tỷ</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border flex items-center justify-between text-2xs text-ink-muted">
                <span>Đại diện Viện: Phòng KHKT</span>
                <span>Dữ liệu đến 28/06/2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: NGHIÊN CỨU & QLNN */}
      {activeTab === 'nckh' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="Kinh phí NSNN" value={`${overviewData.kinhPhiKHCN2026} tỷ`} subtitle="Thực hiện trong kỳ" icon={Banknote} color="gold" />
            <KPICard title="Tiêu chuẩn / Quy chuẩn" value="56" subtitle="54 TC, 02 QC đang thực hiện" icon={FileText} color="primary" />
            <KPICard title="Đề tài NCKH cấp Bộ" value="14" subtitle="02 Vốn Doanh nghiệp" icon={Microscope} color="accent" />
            <KPICard title="Bài báo Khoa học" value="08" subtitle="Tạp chí Quốc tế/Trong nước" icon={Newspaper} color="success" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Biểu đồ Phân bổ Kinh phí KHCN cấp 2026 (Tỷ VNĐ)</h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={khcnData} margin={{ top: 25, right: 20, bottom: 35, left: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickMargin={12} angle={-35} textAnchor="end" height={65} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} label={{ value: 'Kinh phí cấp (Tỷ VNĐ)', angle: -90, position: 'insideLeft', fill: 'var(--text-muted)', fontSize: 13, offset: -5 }} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} content={<CustomKHCNTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600', paddingTop: '20px' }} />
                    <Bar dataKey="kinhPhi" name="Kinh phí cấp 2026" radius={[4, 4, 0, 0]} maxBarSize={25} fill="var(--color-primary, #00668c)">
                      {khcnData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Thực hiện nhiệm vụ QLNN</h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="p-2.5 bg-danger/10 rounded-xl text-danger"><AlertTriangle className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-ink text-[15px]">Sự cố & Giám định Tư pháp</h4>
                    <p className="text-[13px] text-ink-secondary mt-1.5 leading-relaxed">Giải quyết sạt lở kè kênh Tàu Hủ (TP.HCM), sự cố ống nước Quảng Trạch 1, và 06 vụ trưng cầu của TAND.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary-500"><Landmark className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-ink text-[15px]">Giám sát Công trình Quốc gia</h4>
                    <p className="text-[13px] text-ink-secondary mt-1.5 leading-relaxed">Nghiệm thu Sân bay Long Thành, quyết toán Nhà Quốc hội Lào, và báo cáo an toàn TT Hội nghị Quốc gia.</p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 bg-success/10 rounded-xl text-success"><FileText className="w-6 h-6" /></div>
                  <div>
                    <h4 className="font-bold text-ink text-[15px]">Biên soạn & Giải đáp Kỹ thuật</h4>
                    <p className="text-[13px] text-ink-secondary mt-1.5 leading-relaxed">Soạn thảo giải pháp PCCC cho cơ sở cũ, xử lý 119 lượt nhiệm vụ và 48 lượt báo cáo rà soát của Bộ.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Row 3: Phân bổ kinh phí & Quy chuẩn cốt lõi (Phụ lục 1.1) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Kinh phí & Giải ngân các Nhiệm vụ KHCN thực hiện năm 2026 (Bảng 5)</h3>
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr>
                      <th className="th-cell rounded-tl-lg">Đơn vị chủ trì</th>
                      <th className="th-cell text-center">Số lượng NV</th>
                      <th className="th-cell">Giá trị HĐ (Tỷ)</th>
                      <th className="th-cell">KP cấp 2026 (Tỷ)</th>
                      <th className="th-cell">Giải ngân chủ trì (Tỷ)</th>
                      <th className="th-cell text-right rounded-tr-lg">Tỷ lệ giải ngân</th>
                    </tr>
                  </thead>
                  <tbody>
                    {khcnData.map((row, idx) => (
                      <tr key={idx} className="tr-hover">
                        <td className="td-cell font-bold text-ink">{row.name}</td>
                        <td className="td-cell text-center text-ink font-semibold">{row.deTai}</td>
                        <td className="td-cell text-ink-secondary font-medium">{row.contractVal.toFixed(3)}</td>
                        <td className="td-cell text-primary-500 font-bold">{row.kinhPhi.toFixed(3)}</td>
                        <td className="td-cell text-success font-bold">{row.disbursed.toFixed(3)}</td>
                        <td className="td-cell text-right">
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black ${
                            row.pct > 50 ? 'bg-success/10 text-success' : row.pct > 0 ? 'bg-warning/10 text-warning' : 'bg-subtle text-ink-muted'
                          }`}>
                            {row.pct.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                    {/* Hàng tổng cộng */}
                    <tr className="bg-subtle/50 font-black border-t-2 border-border">
                      <td className="td-cell text-ink font-black">Cộng</td>
                      <td className="td-cell text-center text-ink font-black">70</td>
                      <td className="td-cell text-ink font-black">62.768</td>
                      <td className="td-cell text-primary-500 font-black">29.568</td>
                      <td className="td-cell text-success font-black">4.365</td>
                      <td className="td-cell text-right text-success font-black">14.8%</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="text-2xs text-ink-muted mt-3 italic">*Đơn vị tính quy đổi: Tỷ VNĐ (Báo cáo gốc sử dụng đơn vị nghìn đồng).</p>
            </div>
            
            <div className="card p-6 lg:col-span-1">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Quy chuẩn & Tiêu chuẩn Cốt lõi đang soạn thảo</h3>
              <div className="space-y-4 max-h-[450px] overflow-y-auto pr-1">
                {coreStandards.map((std, idx) => (
                  <div key={idx} className="bg-subtle p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <span className="text-[11.5px] font-black text-primary-500">{std.code}</span>
                      <span className="text-[11px] font-bold text-ink-muted">{std.progress}%</span>
                    </div>
                    <h4 className="text-[12.5px] font-bold text-ink mt-1 line-clamp-1">{std.name}</h4>
                    <div className="flex justify-between items-center mt-2 text-2xs text-ink-secondary">
                      <span>Chủ trì: {std.leader}</span>
                      <span className="text-success font-semibold">{std.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Row 4: Sản phẩm Khoa học & Hợp tác Quốc tế tiêu biểu (Phụ lục 5 & 6) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            {/* Cột 1 & 2: Ấn phẩm & Bài báo Khoa học (Phụ lục 5) */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Ấn phẩm & Bài báo Khoa học tiêu biểu (Phụ lục 5)</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {scientificPapers.map((paper, idx) => (
                  <a 
                    key={idx} 
                    href={paper.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="bg-subtle p-3 rounded-lg border border-border flex justify-between items-start gap-4 hover:border-primary-500 hover:bg-hover-row transition-all block group cursor-pointer"
                  >
                    <div className="flex-1">
                      <h4 className="text-[13.5px] font-bold text-ink leading-snug group-hover:text-primary-500 transition-colors">{paper.title}</h4>
                      <p className="text-[12px] text-ink-secondary mt-1.5 font-medium">Tác giả: {paper.author}</p>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold bg-primary/10 text-primary-500 group-hover:bg-primary-500 group-hover:text-white transition-all whitespace-nowrap">
                        {paper.journal}
                      </span>
                    </div>
                  </a>
                ))}
              </div>
            </div>

            {/* Cột 3: Hội nghị & Hội thảo Khoa học tiêu biểu (Phụ lục 6) */}
            <div className="card p-6 lg:col-span-1">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Hội thảo Khoa học tiêu biểu</h3>
              <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1">
                {conferences.map((conf, idx) => (
                  <div key={idx} className="bg-subtle p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <span className="text-[11.5px] font-black text-success">{conf.date}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold bg-success/10 text-success whitespace-nowrap">
                        {conf.org}
                      </span>
                    </div>
                    <h4 className="text-[13px] font-bold text-ink mt-1.5 leading-snug">{conf.name}</h4>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: KINH DOANH & TBKT */}
      {activeTab === 'kinh-doanh' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="Tổng Ký Hợp đồng" value={`${overviewData.giaTriKy} tỷ`} subtitle="Đạt 101% kế hoạch (750 tỷ)" icon={Handshake} color="primary" />
            <KPICard title="Thực hiện Doanh thu" value={`${overviewData.giaTriDoanhThu} tỷ`} subtitle="Đạt 53% kế hoạch (750 tỷ)" icon={TrendingUp} color="success" />
            <KPICard title="Tổng Tiền Về" value={`${overviewData.tongTienVe} tỷ`} subtitle="Thu thực tế trong kỳ" icon={Wallet} color="info" />
            <KPICard title="Tổng Nợ Lũy Kế" value={`${overviewData.tongNoLuyKe} tỷ`} subtitle="Công nợ cần thu hồi" icon={AlertCircle} color="danger" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Biểu đồ Ký mới & Doanh thu thực hiện các Đơn vị (Tỷ VNĐ)</h3>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={doanhThuData} margin={{ top: 20, right: 30, left: 20, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickMargin={12} angle={-35} textAnchor="end" height={70} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600', paddingTop: '20px' }} />
                    <Bar dataKey="doanhThu" name="Doanh thu thực hiện" radius={[4, 4, 0, 0]} maxBarSize={30} fill="var(--color-success, #10b981)">
                      {doanhThuData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Bar>
                    <Line type="monotone" dataKey="kyMoi" name="Ký Hợp đồng mới" stroke="var(--text-primary)" strokeWidth={2.5} dot={{ r: 5, fill: 'var(--bg-surface)' }} />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Tăng trưởng cùng kỳ (2025 vs 2026)</h3>
              <div className="h-[380px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 35 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }} />
                    <Bar dataKey="val2025" name="Năm 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="val2026" name="Năm 2026" fill="var(--color-primary, #00668c)" radius={[4, 4, 0, 0]} maxBarSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Phân tích Chi tiết Công nợ đọng của 16 Đơn vị (Tỷ VNĐ)</h3>
              <div className="h-[750px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart layout="vertical" data={noDongData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                    <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis dataKey="name" type="category" width={95} tick={{ fontSize: 11, fill: 'var(--text-secondary)', fontWeight: 600 }} stroke="none" />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500', paddingTop: '10px' }} />
                    <Bar dataKey="tongNo" name="Tổng nợ (Khách hàng nợ Đơn vị)" fill="var(--color-danger, #ef4444)" radius={[0, 4, 4, 0]} barSize={10} />
                    <Bar dataKey="noNV" name="Nợ Nghĩa vụ Viện (Đơn vị nợ Viện)" fill="var(--color-warning, #f59e0b)" radius={[0, 4, 4, 0]} barSize={10} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="space-y-6 flex flex-col">
              <div className="card p-6">
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Phân bổ Dòng tiền về (Tổng: 449.67 Tỷ VNĐ)</h3>
                <div className="h-[320px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={coCauTienVe} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={4} dataKey="value" stroke="none">
                        {coCauTienVe.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                      <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </div>

              <div className="card p-6 flex-1">
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Xếp hạng Sức khỏe Vận hành 16 Đơn vị (Unit Health Score)</h3>
                <div className="overflow-x-auto max-h-[300px] overflow-y-auto pr-1">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr>
                        <th className="th-cell rounded-tl-lg">Đơn vị</th>
                        <th className="th-cell">% KH Doanh thu</th>
                        <th className="th-cell text-right rounded-tr-lg">Đánh giá sức khỏe</th>
                      </tr>
                    </thead>
                    <tbody>
                      {unitHealthData.map((row, idx) => (
                        <tr key={idx} className="tr-hover">
                          <td className="td-cell font-bold text-ink">{row.name}</td>
                          <td className="td-cell text-ink-secondary font-black">{row.khProgress}%</td>
                          <td className="td-cell text-right">
                            <span className={`font-black text-[13px] ${row.color}`}>
                              {row.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: TÀI CHÍNH & ĐẦU TƯ */}
      {activeTab === 'tai-chinh' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="Nộp Ngân sách NN" value={`${overviewData.nopNganSach} tỷ`} subtitle="GTGT, TNDN, TNCN" icon={Receipt} color="success" />
            <KPICard title="Quỹ Lương CB" value={`${overviewData.quyLuong} tỷ`} subtitle={`Cho ${overviewData.tongNhanSu} cán bộ`} icon={Wallet} color="primary" />
            <KPICard title="Bảo lãnh Ngân hàng" value={`${overviewData.baoLanhNH} tỷ`} subtitle="Đang thực hiện" icon={Building2} color="warning" />
            <KPICard title="Đầu tư Quỹ PTSN" value="8.89 tỷ" subtitle="Thiết bị quan trắc" icon={Target} color="info" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Biến động Chi Lương & Nộp Thuế theo kỳ (Tỷ VNĐ)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taiChinhData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '14px', fontWeight: '600', paddingTop: '20px' }} />
                    <Line type="monotone" dataKey="luong" name="Chi Lương & BH" stroke="var(--color-primary, #00668c)" strokeWidth={4} activeDot={{ r: 8, strokeWidth: 0 }} />
                    <Line type="monotone" dataKey="thue" name="Nộp Thuế NSNN" stroke="var(--color-danger, #ef4444)" strokeWidth={4} />
                    <Line type="monotone" dataKey="nsnn" name="NSNN Cấp" stroke="var(--color-success, #10b981)" strokeWidth={4} strokeDasharray="5 5" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Cơ cấu Nộp Thuế (Tỷ VNĐ)</h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={coCauThue} cx="50%" cy="50%" innerRadius={70} outerRadius={110} paddingAngle={3} dataKey="value" stroke="none">
                      {coCauThue.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '500' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Row 3: Giám sát đầu tư xây dựng nhỏ & mua sắm trang thiết bị */}
          <div className="card p-6">
            <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Giám sát các Dự án Đầu tư Phát triển Cơ sở vật chất & Mua sắm (Mục IX.5)</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr>
                    <th className="th-cell rounded-tl-lg">Tên dự án đầu tư / Mua sắm</th>
                    <th className="th-cell">Quy mô vốn</th>
                    <th className="th-cell">Nguồn vốn / Giai đoạn</th>
                    <th className="th-cell">Trạng thái thực tế</th>
                    <th className="th-cell text-right rounded-tr-lg">Tiến độ chuẩn bị / Giải ngân</th>
                  </tr>
                </thead>
                <tbody>
                  {investmentProjects.map((proj, idx) => (
                    <tr key={idx} className="tr-hover">
                      <td className="td-cell font-bold text-ink">{proj.name}</td>
                      <td className="td-cell text-ink-secondary font-medium">{proj.scale}</td>
                      <td className="td-cell text-ink-secondary font-medium">{proj.period}</td>
                      <td className="td-cell">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                          proj.status === 'Hoàn thành bàn giao'
                            ? 'bg-success/10 text-success'
                            : 'bg-primary/10 text-primary-500'
                        }`}>
                          {proj.status}
                        </span>
                      </td>
                      <td className="td-cell text-right font-black text-ink-secondary">{proj.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: TỔ CHỨC & HÀNH CHÍNH */}
      {activeTab === 'nhan-su' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard title="Tổng Nhân sự" value={overviewData.tongNhanSu} subtitle="+63 tuyển mới, -20 nghỉ | Thu nhập 18tr/th" icon={Users} color="primary" />
            <KPICard title="Văn bản tiếp nhận" value="1,600+" subtitle="Qua hệ thống mạng" icon={FileCheck2} color="info" />
            <KPICard title="Mạng lưới LAS-XD" value="11" subtitle="LAS-XD toàn quốc | 04 số tạp chí/năm" icon={Network} color="success" />
            <KPICard title="An toàn PCCC" value="Đảm bảo" subtitle="Đã kiểm tra định kỳ" icon={ShieldAlert} color="accent" />
          </div>

          <div className="card p-8">
            <h3 className="text-[18px] font-black text-ink mb-6 border-b border-border pb-4">Hoạt động Hành chính, Đào tạo & Quản trị</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <ul className="space-y-6">
                <li className="flex items-start space-x-4 group cursor-pointer hover:bg-subtle p-3 rounded-xl transition-colors">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-primary-500 shadow-[0_0_10px_rgba(0,102,140,0.5)]"></div>
                  <div>
                    <p className="text-[15px] font-bold text-ink group-hover:text-primary-600 transition-colors">Đào tạo & Tạp chí KHCN</p>
                    <p className="text-[14px] text-ink-secondary leading-relaxed mt-1.5">Xuất bản thành công 02 số Tạp chí KHCN Xây dựng (Mục tiêu 04 số/năm). Cập nhật dữ liệu lên hệ thống VJOL. Quản lý hệ đào tạo Nghiên cứu sinh (NCS) trình độ tiến sĩ đang tích cực tuyển sinh và đào tạo.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4 group cursor-pointer hover:bg-subtle p-3 rounded-xl transition-colors">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-warning shadow-[0_0_10px_rgba(245,158,11,0.5)]"></div>
                  <div>
                    <p className="text-[15px] font-bold text-ink group-hover:text-warning transition-colors">Hội thảo & Sự kiện chuyên môn</p>
                    <p className="text-[14px] text-ink-secondary leading-relaxed mt-1.5">Tổ chức thành công hội nghị công trình xanh EDGE, hội thảo Bê tông đúc sẵn, Nhà ở xã hội phát thải carbon thấp (tại TPHCM).</p>
                  </div>
                </li>
              </ul>
              <ul className="space-y-6">
                <li className="flex items-start space-x-4 group cursor-pointer hover:bg-subtle p-3 rounded-xl transition-colors">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-success shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                  <div>
                    <p className="text-[15px] font-bold text-ink group-hover:text-success transition-colors">Quản trị & Số hóa VB</p>
                    <p className="text-[14px] text-ink-secondary leading-relaxed mt-1.5">Xử lý 1,600+ văn bản đến và 1,300+ văn bản đi qua trục liên thông. Cấp 05 USB Token ký số. Nâng cấp trực tuyến hội trường.</p>
                  </div>
                </li>
                <li className="flex items-start space-x-4 group cursor-pointer hover:bg-subtle p-3 rounded-xl transition-colors">
                  <div className="w-3 h-3 mt-1.5 rounded-full bg-danger shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>
                  <div>
                    <p className="text-[15px] font-bold text-ink group-hover:text-danger transition-colors">Sửa chữa & Nâng cấp cơ sở</p>
                    <p className="text-[14px] text-ink-secondary leading-relaxed mt-1.5">Cải tạo mặt đứng N1, chống thấm. Sửa chữa Phòng thí nghiệm Viện CNKC, nhà thí nghiệm gió. Cải tạo phân viện Miền Trung.</p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Row 3: Nâng cấp dữ liệu trực quan về Nhân sự & Mạng lưới LAS-XD */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Cột 1 & 2: Biến động nhân sự */}
            <div className="card p-6 lg:col-span-2">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Biểu đồ Biến động Nhân sự Cán bộ theo tháng</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={nhanSuBienDongData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '10px' }} />
                    <Bar dataKey="tuyen" name="Tuyển mới" fill="var(--color-primary, #00668c)" radius={[4, 4, 0, 0]} maxBarSize={25} />
                    <Bar dataKey="nghi" name="Nghỉ việc/Chấm dứt HĐ" fill="var(--color-danger, #ef4444)" radius={[4, 4, 0, 0]} maxBarSize={25} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
              <p className="text-2xs text-ink-muted mt-3 italic">*Tổng kết 6 tháng: Tuyển mới 63 cán bộ, giảm 20 cán bộ (phù hợp với quy trình kiện toàn tinh giản bộ máy).</p>
            </div>

            {/* Cột 3: Chi tiết Mạng lưới phòng LAS-XD */}
            <div className="card p-6 lg:col-span-1">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border pb-3">Phân bổ Mạng lưới LAS-XD (11 Phòng)</h3>
              <div className="space-y-4">
                {lasXdData.map((las, idx) => (
                  <div key={idx} className="bg-subtle p-3 rounded-lg border border-border">
                    <div className="flex justify-between items-start">
                      <span className="text-[13px] font-black text-ink">{las.name}</span>
                      <span className="inline-flex items-center px-1.5 py-0.5 rounded text-3xs font-bold bg-success/10 text-success whitespace-nowrap">
                        {las.status}
                      </span>
                    </div>
                    <p className="text-[12px] text-ink-secondary mt-1.5 leading-relaxed">{las.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
