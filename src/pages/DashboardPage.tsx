import React, { useEffect, useState, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { useSlidePanel } from '../context/SlidePanelContext';
import { LichCoQuanPage } from './LichCoQuanPage';
import {
  fetchDashboardData,
  DON_VI_16_BENCHMARKS,
  DON_VI_PHONG_CHUC_NANG,
  type DashboardData,
} from '../services/dashboardService';
import { ExecutiveWarningBanner } from '../components/ExecutiveWarningBanner';
import {
  DashboardDetailSlidePanel,
  type DashboardDrilldownTab,
} from '../components/DashboardDetailSlidePanel';
import { exportExcel } from '../lib/utils';
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
  ChevronDown,
  Maximize2,
  Minimize2,
  Printer,
  Download,
  LayoutDashboard,
  RefreshCw,
  ArrowUpRight,
  Clock,
  FileSpreadsheet,
  Layers,
  Percent,
  BarChart3,
  Table,
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
  ReferenceLine,
} from 'recharts';
import { ChartDefs } from '../components/ChartDefs';

const tooltipStyle = {
  contentStyle: {
    backgroundColor: 'var(--bg-surface)',
    borderColor: 'var(--border-default)',
    borderRadius: '8px',
    color: 'var(--text-primary)',
  },
  labelStyle: {
    color: 'var(--text-primary)',
    fontWeight: 'bold',
  },
  itemStyle: {
    color: 'var(--text-secondary)',
  },
};

const CustomKHCNTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-surface border border-border dark:border-slate-700/80 p-3.5 rounded-lg shadow-lg text-[13px]">
        <p className="font-black text-ink mb-2">{data.name}</p>
        <div className="space-y-1">
          <p className="text-ink-secondary">
            Kinh phí cấp 2026: <span className="font-black text-primary-500">{data.kinhPhi.toFixed(3)} tỷ VNĐ</span>
          </p>
          <p className="text-ink-secondary">
            Số lượng nhiệm vụ: <span className="font-black text-success">{data.deTai} nhiệm vụ</span>
          </p>
          <div className="text-2xs text-ink-muted mt-2 border-t border-border dark:border-slate-700/80 pt-1.5 flex gap-3">
            <span>HĐ: {data.contractVal.toFixed(3)} tỷ</span>
            <span>Giải ngân: {data.disbursed.toFixed(3)} tỷ</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

const CustomComparisonTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="bg-surface border border-border dark:border-slate-700/80 p-3.5 rounded-xl shadow-xl text-[12.5px] min-w-[260px]">
        <div className="border-b border-border dark:border-slate-700/80 pb-2 mb-2">
          <p className="font-black text-ink">{data.name}</p>
          <p className="text-2xs text-ink-muted truncate">{data.fullName}</p>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
            <span>Kế hoạch 2026:</span>
            <span>{data.keHoach ? `${data.keHoach.toFixed(1)} tỷ` : '—'}</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-medium">
            <span>Cùng kỳ 2025:</span>
            <span>{data.cungKy2025 ? `${data.cungKy2025.toFixed(2)} tỷ` : '—'}</span>
          </div>
          <div className="flex justify-between items-center text-sky-600 dark:text-sky-400 font-semibold">
            <span>Viện ký:</span>
            <span>{data.vienKy ? `${data.vienKy.toFixed(2)} tỷ` : '0 tỷ'}</span>
          </div>
          <div className="flex justify-between items-center text-teal-600 dark:text-teal-400 font-semibold">
            <span>Đơn vị ký:</span>
            <span>{data.donViKy ? `${data.donViKy.toFixed(2)} tỷ` : '0 tỷ'}</span>
          </div>
          <div className="border-t border-border dark:border-slate-700/80 pt-1.5 flex justify-between items-center font-black text-ink">
            <span>Tổng ký 2026:</span>
            <span className="text-primary-600 dark:text-primary-400">{data.kyMoi.toFixed(2)} tỷ</span>
          </div>
          <div className="flex justify-between items-center text-2xs pt-1 border-t border-border/50">
            <span className="text-ink-muted">Đạt KH: <strong className="text-success">{data.kh}%</strong></span>
            <span className="text-ink-muted">So cùng kỳ: <strong className={data.pctCungKy >= 100 ? 'text-success' : 'text-danger'}>{data.pctCungKy}%</strong></span>
          </div>
          {data.ghiChu && (
            <p className="text-3xs text-amber-600 dark:text-amber-400 italic pt-1 border-t border-border/50">
              * {data.ghiChu}
            </p>
          )}
        </div>
      </div>
    );
  }
  return null;
};

const CustomGrowthTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="bg-surface border border-border dark:border-slate-700/80 p-3 rounded-xl shadow-lg text-[12.5px] min-w-[200px]">
        <p className="font-black text-ink mb-1">{data.name}</p>
        <p className="text-2xs text-ink-muted mb-2 truncate">{data.fullName}</p>
        <p className="text-xs text-ink-secondary">
          So cùng kỳ 2025: <span className={`font-black ${data.pctCungKy >= 100 ? 'text-success' : 'text-danger'}`}>{data.pctCungKy}%</span>
        </p>
        <div className="text-3xs text-ink-muted mt-1.5 pt-1.5 border-t border-border dark:border-slate-700/80 flex justify-between">
          <span>Ký 2026: {data.kyMoi.toFixed(1)} tỷ</span>
          <span>CK 2025: {data.cungKy2025 ? data.cungKy2025.toFixed(1) : '0'} tỷ</span>
        </div>
      </div>
    );
  }
  return null;
};

const CustomDebtTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0]?.payload;
    if (!data) return null;
    return (
      <div className="bg-surface border border-border dark:border-slate-700/80 p-3.5 rounded-xl shadow-xl text-[12.5px] min-w-[260px]">
        <div className="border-b border-border dark:border-slate-700/80 pb-2 mb-2">
          <p className="font-black text-ink">{data.name}</p>
          <p className="text-2xs text-ink-muted truncate">{data.fullName || data.name}</p>
        </div>
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between items-center text-red-600 dark:text-red-400 font-bold">
            <span>Tổng nợ (Khách nợ ĐV):</span>
            <span>{data.tongNo?.toFixed(2)} tỷ VNĐ</span>
          </div>
          <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-semibold">
            <span>Nợ Nghĩa vụ Viện:</span>
            <span>{data.noNV?.toFixed(2)} tỷ VNĐ</span>
          </div>
          <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 font-medium">
            <span>Khách nợ ngoài Viện:</span>
            <span>{data.noNgoai ? `${data.noNgoai.toFixed(2)} tỷ` : `${Math.max(0, data.tongNo - data.noNV).toFixed(2)} tỷ`}</span>
          </div>
          <div className="border-t border-border dark:border-slate-700/80 pt-1.5 flex justify-between items-center text-2xs">
            <span className="text-ink-muted">Tỷ trọng nghĩa vụ Viện:</span>
            <span className="font-bold text-amber-600 dark:text-amber-400">
              {data.tyLeNoNV ?? (data.tongNo > 0 ? Math.round((data.noNV / data.tongNo) * 100) : 0)}%
            </span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam === 'lich') return 'lich';
    if (tabParam && ['tong-quan', 'nckh', 'kinh-doanh', 'tai-chinh', 'nhan-su'].includes(tabParam)) return tabParam;
    return 'tong-quan';
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams(tabId === 'tong-quan' ? {} : { tab: tabId }, { replace: true });
  };

  useEffect(() => {
    if (tabParam === 'lich') {
      setActiveTab('lich');
    } else if (tabParam && ['tong-quan', 'nckh', 'kinh-doanh', 'tai-chinh', 'nhan-su'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const [filterYear, setFilterYear] = useState('2026');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterDonVi, setFilterDonVi] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMeetingMode, setIsMeetingMode] = useState(false);
  const [showAllDebts, setShowAllDebts] = useState(false);
  const [debtViewMode, setDebtViewMode] = useState<'cot-dung' | 'ma-tran'>('cot-dung');
  const [tableUnit, setTableUnit] = useState<'ty' | 'nghin'>('ty');
  const [trendChartMode, setTrendChartMode] = useState<'ky-ket' | 'doanh-thu' | 'dong-tien' | 'so-sanh'>('ky-ket');

  const { openPanel } = useSlidePanel();

  // Tab "Tài chính & Đầu tư" gộp chỉ số lợi nhuận/dòng tiền — gác riêng bằng tài nguyên `dashboard_tai_chinh`
  const { can: coQuyenDashboard, dangTai: dangTaiQuyenDashboard } = usePhanQuyen();
  const coTabTaiChinh = dangTaiQuyenDashboard || coQuyenDashboard('dashboard_tai_chinh', 'xem');

  useEffect(() => {
    if (dangTaiQuyenDashboard || activeTab !== 'tai-chinh' || coTabTaiChinh) return;
    handleTabChange('tong-quan');
  }, [dangTaiQuyenDashboard, activeTab, coTabTaiChinh]);

  // Nạp dữ liệu thống kê tổng hợp thực tế & theo bộ lọc
  const loadData = () => {
    setLoading(true);
    fetchDashboardData({
      year: filterYear,
      period: filterPeriod,
      donViId: filterDonVi,
      customStart,
      customEnd,
    })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi nạp dữ liệu Dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterPeriod, filterDonVi, customStart, customEnd]);

  // Mở SlidePanel chi tiết (Drill-down)
  const handleOpenDrilldown = (tab: DashboardDrilldownTab) => {
    if (!dashboardData) return;
    const titles: Record<DashboardDrilldownTab, { title: string; subtitle: string }> = {
      'hop-dong': {
        title: 'Chi tiết Hợp đồng Ký kết & Thực hiện',
        subtitle: `Danh sách hợp đồng trong kỳ ${filterPeriod === 'all' ? 'Cả năm' : filterPeriod} ${filterYear}`,
      },
      'cong-no': {
        title: 'Chi tiết Công nợ Lũy kế theo Hợp đồng',
        subtitle: 'Các hợp đồng còn nợ lũy kế cần theo dõi và đôn đốc thu hồi',
      },
      khcn: {
        title: 'Chi tiết Nhiệm vụ & Tiêu chuẩn KHCN',
        subtitle: 'Các đề tài cấp Bộ, cấp Nhà nước và Dự thảo Tiêu chuẩn/Quy chuẩn đang thực hiện',
      },
      'canh-bao': {
        title: 'Rà soát Tuân thủ Quy chế 2815 & Điểm nghẽn',
        subtitle: 'Các vi phạm quy chế hợp đồng, nợ quá hạn và tiến độ cần chỉ đạo',
      },
      'nhan-su': {
        title: 'Chi tiết Cán bộ & Chứng chỉ Hành nghề',
        subtitle: 'Hồ sơ nhân sự, chức danh và chứng chỉ LAS-XD theo đơn vị',
      },
    };

    openPanel({
      id: 'dashboard-chi-tiet-panel',
      title: titles[tab].title,
      subtitle: titles[tab].subtitle,
      icon: <LayoutDashboard size={16} className="text-primary" />,
      content: <DashboardDetailSlidePanel data={dashboardData} initialTab={tab} />,
      storageKey: 'slideover-width-dashboard-chi-tiet',
    });
  };

  // Xuất file Excel báo cáo giao ban
  const handleExportExcel = () => {
    if (!dashboardData) return;
    const headers = [
      'Mã Đơn vị',
      'Tên đầy đủ Đơn vị',
      'Kế hoạch Doanh thu (Tỷ)',
      'Ký mới trong kỳ (Tỷ)',
      'Doanh thu thực hiện (Tỷ)',
      '% Hoàn thành KH',
      'Công nợ lũy kế (Tỷ)',
      'Nợ nghĩa vụ Viện (Tỷ)',
    ];

    const rows = dashboardData.doanhThuData.map((d) => {
      const debt = dashboardData.noDongData.find((n) => n.name === d.name);
      return [
        d.name,
        d.fullName || d.name,
        d.keHoach,
        d.kyMoi,
        d.doanhThu,
        `${d.kh}%`,
        debt ? debt.tongNo : 0,
        debt ? debt.noNV : 0,
      ];
    });

    exportExcel(
      `Bao_cao_giao_ban_IBST_${filterYear}_${filterPeriod}.xls`,
      'Báo cáo Giao ban',
      headers,
      rows,
    );
  };

  // Dữ liệu bảng Tổng hợp giá trị ký HĐKT các đơn vị năm 2026 (tính tới 21.8.2026)
  const BANG_TONG_HOP_ROWS = [
    { isHeader: true, group: 'I', title: 'I. CÁC VIỆN CHUYÊN NGÀNH' },
    {
      stt: '1',
      code: 'VKC',
      name: 'Viện chuyên ngành Kết cấu công trình xây dựng',
      khNghin: 70000000,
      khTy: 70.0,
      ckNghin: 67747280,
      ckTy: 67.747,
      vienKyNghin: 2891992,
      vienKyTy: 2.892,
      dvKyNghin: 57723448,
      dvKyTy: 57.723,
      tongKyNghin: 60615440,
      tongKyTy: 60.615,
      pctKH: 87,
      pctCungKy: 89,
      ghiChu: '',
    },
    {
      stt: '2',
      code: 'VBT',
      name: 'Viện chuyên ngành Bê tông',
      khNghin: 38600000,
      khTy: 38.6,
      ckNghin: 20191235,
      ckTy: 20.191,
      vienKyNghin: 193671,
      vienKyTy: 0.194,
      dvKyNghin: 21686357,
      dvKyTy: 21.686,
      tongKyNghin: 21880028,
      tongKyTy: 21.880,
      pctKH: 57,
      pctCungKy: 108,
      ghiChu: '',
    },
    {
      stt: '3',
      code: 'VĐKT',
      name: 'Viện chuyên ngành Địa kỹ thuật',
      khNghin: 22000000,
      khTy: 22.0,
      ckNghin: 16050776,
      ckTy: 16.051,
      vienKyNghin: 72930,
      vienKyTy: 0.073,
      dvKyNghin: 38064879,
      dvKyTy: 38.065,
      tongKyNghin: 38137809,
      tongKyTy: 38.138,
      pctKH: 173,
      pctCungKy: 238,
      ghiChu: 'Tăng trưởng đột biến',
    },

    { isHeader: true, group: 'II', title: 'II. CÁC PHÂN VIỆN' },
    {
      stt: '4',
      code: 'PVMN',
      name: 'Phân Viện Khoa học công nghệ xây dựng miền Nam',
      khNghin: 60500000,
      khTy: 60.5,
      ckNghin: 23789989,
      ckTy: 23.790,
      vienKyNghin: 2471387,
      vienKyTy: 2.471,
      dvKyNghin: 58202989,
      dvKyTy: 58.203,
      tongKyNghin: 60674376,
      tongKyTy: 60.674,
      pctKH: 100,
      pctCungKy: 255,
      ghiChu: 'Đạt 100% KH sớm',
    },
    {
      stt: '5',
      code: 'PVMT',
      name: 'Phân Viện Khoa học công nghệ xây dựng miền Trung',
      khNghin: 42000000,
      khTy: 42.0,
      ckNghin: 36268364,
      ckTy: 36.268,
      vienKyNghin: 7160086,
      vienKyTy: 7.160,
      dvKyNghin: 946000,
      dvKyTy: 0.946,
      tongKyNghin: 8106086,
      tongKyTy: 8.106,
      pctKH: 19,
      pctCungKy: 22,
      ghiChu: 'PVMT cũ ko giao KH ký mới',
    },

    { isHeader: true, group: 'III', title: 'III. CÁC TRUNG TÂM' },
    {
      stt: '6',
      code: 'TTTK',
      name: 'Trung tâm tư vấn thiết kế và xây dựng',
      khNghin: 25000000,
      khTy: 25.0,
      ckNghin: 34280507,
      ckTy: 34.281,
      vienKyNghin: 39615627,
      vienKyTy: 39.616,
      dvKyNghin: 23041680,
      dvKyTy: 23.042,
      tongKyNghin: 62657307,
      tongKyTy: 62.657,
      pctKH: 251,
      pctCungKy: 183,
      ghiChu: 'Vượt 151% KH',
    },
    {
      stt: '7',
      code: 'TTKCT',
      name: 'Trung tâm Kết cấu thép và xây dựng',
      khNghin: 24000000,
      khTy: 24.0,
      ckNghin: 20162107,
      ckTy: 20.162,
      vienKyNghin: 14649186,
      vienKyTy: 14.649,
      dvKyNghin: 19227284,
      dvKyTy: 19.227,
      tongKyNghin: 33876470,
      tongKyTy: 33.876,
      pctKH: 141,
      pctCungKy: 168,
      ghiChu: '',
    },
    {
      stt: '8',
      code: 'TTAM',
      name: 'Trung tâm tư vấn chống ăn mòn và xây dựng',
      khNghin: 72200000,
      khTy: 72.2,
      ckNghin: 74227557,
      ckTy: 74.228,
      vienKyNghin: 5312718,
      vienKyTy: 5.313,
      dvKyNghin: 92804370,
      dvKyTy: 92.804,
      tongKyNghin: 98117088,
      tongKyTy: 98.117,
      pctKH: 136,
      pctCungKy: 132,
      ghiChu: 'Đơn vị ký đạt >92 tỷ',
    },
    {
      stt: '9',
      code: 'TTCNXD',
      name: 'Trung tâm Công nghệ và Môi trường xây dựng',
      khNghin: 50000000,
      khTy: 50.0,
      ckNghin: 60916109,
      ckTy: 60.916,
      vienKyNghin: 57061566,
      vienKyTy: 57.062,
      dvKyNghin: 34793862,
      dvKyTy: 34.794,
      tongKyNghin: 91855428,
      tongKyTy: 91.855,
      pctKH: 184,
      pctCungKy: 151,
      ghiChu: 'Viện ký lớn (>57 tỷ)',
    },
    {
      stt: '10',
      code: 'TTTD',
      name: 'Trung tâm tư vấn trắc địa và xây dựng',
      khNghin: 25800000,
      khTy: 25.8,
      ckNghin: 47293696,
      ckTy: 47.294,
      vienKyNghin: 2198074,
      vienKyTy: 2.198,
      dvKyNghin: 25437230,
      dvKyTy: 25.437,
      tongKyNghin: 27635304,
      tongKyTy: 27.635,
      pctKH: 107,
      pctCungKy: 58,
      ghiChu: '',
    },
    {
      stt: '11',
      code: 'TTCNHT',
      name: 'Trung tâm Công nghệ và Kỹ thuật hạ tầng',
      khNghin: 28000000,
      khTy: 28.0,
      ckNghin: 29923810,
      ckTy: 29.924,
      vienKyNghin: 3493210,
      vienKyTy: 3.493,
      dvKyNghin: 40136594,
      dvKyTy: 40.137,
      tongKyNghin: 43629804,
      tongKyTy: 43.630,
      pctKH: 156,
      pctCungKy: 146,
      ghiChu: '',
    },
    {
      stt: '12',
      code: 'TTTBXD',
      name: 'Trung tâm Thiết bị và An toàn xây dựng',
      khNghin: 40000000,
      khTy: 40.0,
      ckNghin: 38561149,
      ckTy: 38.561,
      vienKyNghin: 9900678,
      vienKyTy: 9.901,
      dvKyNghin: 50825154,
      dvKyTy: 50.825,
      tongKyNghin: 60725832,
      tongKyTy: 60.726,
      pctKH: 152,
      pctCungKy: 157,
      ghiChu: '',
    },
    {
      stt: '13',
      code: 'TTCNVL',
      name: 'Trung tâm Công nghệ Vật liệu và Xây dựng',
      khNghin: 16000000,
      khTy: 16.0,
      ckNghin: 13728161,
      ckTy: 13.728,
      vienKyNghin: 129000,
      vienKyTy: 0.129,
      dvKyNghin: 11283461,
      dvKyTy: 11.283,
      tongKyNghin: 11412461,
      tongKyTy: 11.412,
      pctKH: 71,
      pctCungKy: 83,
      ghiChu: '',
    },
    {
      stt: '14',
      code: 'TTQT',
      name: 'Trung tâm Đào tạo và Quản lý dự án quốc tế',
      khNghin: 45000000,
      khTy: 45.0,
      ckNghin: 49437953,
      ckTy: 49.438,
      vienKyNghin: 16301057,
      vienKyTy: 16.301,
      dvKyNghin: 67303138,
      dvKyTy: 67.303,
      tongKyNghin: 83604195,
      tongKyTy: 83.604,
      pctKH: 186,
      pctCungKy: 169,
      ghiChu: '',
    },
    {
      stt: '15',
      code: 'TTBIM',
      name: 'Trung tâm Tư vấn và Ứng dụng BIM trong xây dựng',
      khNghin: 71800000,
      khTy: 71.8,
      ckNghin: 91747268,
      ckTy: 91.747,
      vienKyNghin: 99774151,
      vienKyTy: 99.774,
      dvKyNghin: 2436675,
      dvKyTy: 2.437,
      tongKyNghin: 102210826,
      tongKyTy: 102.211,
      pctKH: 142,
      pctCungKy: 111,
      ghiChu: 'Gộp KH của BIM và TTMTay',
    },

    // IV. TỔNG KHỐI VIỆN (SUBTOTAL)
    {
      isSubtotal: true,
      stt: 'IV',
      code: 'TỔNG KHỐI VIỆN',
      name: 'Tổng cộng 15 đơn vị sự nghiệp thuộc Viện',
      khNghin: 692000000,
      khTy: 692.0,
      ckNghin: 624325961,
      ckTy: 624.326,
      vienKyNghin: 261225333,
      vienKyTy: 261.225,
      dvKyNghin: 543913121,
      dvKyTy: 543.913,
      tongKyNghin: 805138454,
      tongKyTy: 805.138,
      pctKH: 116,
      pctCungKy: 129,
      ghiChu: 'Khối Viện vượt 16% KH năm',
    },

    // V. CÔNG TY CỔ PHẦN
    { isHeader: true, group: 'V', title: 'V. CÔNG TY CỔ PHẦN' },
    {
      stt: '16',
      code: 'CTCP',
      name: 'Công ty Cổ phần Đầu tư và Tư vấn Xây dựng IBST',
      khNghin: 58000000,
      khTy: 58.0,
      ckNghin: 59918682,
      ckTy: 59.919,
      vienKyNghin: 0,
      vienKyTy: 0,
      dvKyNghin: 136597347,
      dvKyTy: 136.597,
      tongKyNghin: 136597347,
      tongKyTy: 136.597,
      pctKH: 236,
      pctCungKy: 228,
      ghiChu: '100% Đơn vị tự ký',
    },

    // TỔNG CỘNG TOÀN VIỆN
    {
      isGrandTotal: true,
      stt: '',
      code: 'TỔNG CỘNG TOÀN VIỆN',
      name: 'Toàn bộ 16 Đơn vị Trực thuộc Viện IBST',
      khNghin: 750000000,
      khTy: 750.0,
      ckNghin: 684244643,
      ckTy: 684.245,
      vienKyNghin: 261225333,
      vienKyTy: 261.225,
      dvKyNghin: 680510468,
      dvKyTy: 680.510,
      tongKyNghin: 941735801,
      tongKyTy: 941.736,
      pctKH: 126,
      pctCungKy: 138,
      ghiChu: 'Vượt kế hoạch năm trước 4 tháng',
    },
  ];

  // Xuất Bảng tổng hợp giá trị ký HĐKT các đơn vị năm 2026 (tính tới 21.8.2026)
  const handleExportBangTongHopHDKT = () => {
    const isNghin = tableUnit === 'nghin';
    const unitLabel = isNghin ? '(Nghìn đồng)' : '(Tỷ VNĐ)';
    const headers = [
      'TT',
      'Đơn vị',
      `Đăng ký KH cả năm 2026 ${unitLabel}`,
      `SL Cùng kỳ năm 2025 ${unitLabel}`,
      `Viện ký ${unitLabel}`,
      `Đơn vị ký ${unitLabel}`,
      `Tổng cộng ký 2026 ${unitLabel}`,
      'So với KH năm (%)',
      'So với cùng kỳ (%)',
      'Ghi chú',
    ];

    const fmtVal = (ty: number, nghin: number) => {
      if (isNghin) return nghin.toLocaleString('vi-VN');
      return ty > 0 ? ty.toFixed(ty % 1 === 0 ? 1 : 3) : '0';
    };

    const rows: (string | number)[][] = BANG_TONG_HOP_ROWS.map((r) => {
      if (r.isHeader) {
        return [r.group || '', r.title || '', '', '', '', '', '', '', '', ''];
      }
      return [
        r.stt || '',
        r.code || '',
        fmtVal(r.khTy ?? 0, r.khNghin ?? 0),
        fmtVal(r.ckTy ?? 0, r.ckNghin ?? 0),
        fmtVal(r.vienKyTy ?? 0, r.vienKyNghin ?? 0),
        fmtVal(r.dvKyTy ?? 0, r.dvKyNghin ?? 0),
        fmtVal(r.tongKyTy ?? 0, r.tongKyNghin ?? 0),
        `${r.pctKH ?? 0}%`,
        `${r.pctCungKy ?? 0}%`,
        r.ghiChu || '',
      ];
    });

    exportExcel(
      `Bang_Tong_Hop_Gia_Tri_Ky_HDKT_IBST_2026_${tableUnit}.xls`,
      'HDKT 2026',
      headers,
      rows,
    );
  };

  // In báo cáo giao ban
  const handlePrint = () => {
    window.print();
  };

  // Bảng màu chuẩn 16 đơn vị
  const COLORS = [
    '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e',
    '#84cc16', '#3b82f6', '#a855f7', '#f97316', '#06b6d4', '#e11d48', '#10b981', '#6366f1',
  ];
  const DEBT_COLORS = [
    '#ef4444', '#f97316', '#f59e0b', '#84cc16', '#10b981', '#06b6d4', '#3b82f6', '#8b5cf6',
    '#ec4899', '#14b8a6', '#f43f5e', '#a855f7', '#6366f1', '#0ea5e9', '#e11d48', '#d97706',
  ];

  // Trích xuất dữ liệu an toàn
  const overviewData = dashboardData?.overview || {
    totalNhiemVuKHCN: 70,
    kinhPhiKHCN2026: 29.568,
    giaTriKy: 941.74,
    giaTriDoanhThu: 396.68,
    tongTienVe: 449.67,
    tongNoLuyKe: 211.71,
    nopNganSach: 34.64,
    nhiemVuQLNN: 119,
    baoCaoRaSoat: 48,
    quyLuong: 25.46,
    tongNhanSu: 523,
    baoLanhNH: 74.5,
    dauTuCong: 571.43,
    tyLeDatKyMoi: 126,
    tyLeDatDoanhThu: 53,
  };

  const doanhThuData = dashboardData?.doanhThuData || [];
  const noDongData = dashboardData?.noDongData || [];
  const unitHealthData = dashboardData?.unitHealthData || [];
  const taiChinhData = dashboardData?.taiChinhData || [];
  const luyKeChartData = useMemo(() => {
    let sumKyMoi = 0;
    let sumDoanhThu = 0;
    let sumDongTien = 0;
    const keHoachNam = 750; // Kế hoạch năm toàn Viện 750 tỷ

    return taiChinhData.map((item, idx) => {
      const monthNum = idx + 1;
      const mucTieuTuyenTinh = Math.round(((keHoachNam * monthNum) / 12) * 100) / 100;
      const hasActual = item.hasData !== false && monthNum <= 9 && (item.kyMoi !== null || item.doanhThu !== null);

      if (hasActual) {
        sumKyMoi += item.kyMoi || 0;
        sumDoanhThu += item.doanhThu || 0;
        sumDongTien += item.dongTien || 0;
      }

      return {
        month: `Th.${monthNum}`,
        monthLabel: `Tháng ${monthNum}/2026`,
        kyMoiThang: hasActual ? item.kyMoi : null,
        doanhThuThang: hasActual ? item.doanhThu : null,
        dongTienThang: hasActual ? item.dongTien : null,
        kyMoiLuyKe: hasActual ? Math.round(sumKyMoi * 100) / 100 : null,
        doanhThuLuyKe: hasActual ? Math.round(sumDoanhThu * 100) / 100 : null,
        dongTienLuyKe: hasActual ? Math.round(sumDongTien * 100) / 100 : null,
        mucTieu: mucTieuTuyenTinh,
        keHoachNam,
        hasActual,
      };
    });
  }, [taiChinhData]);
  const growthComparisonData = dashboardData?.growthComparisonData || [];
  const coCauDoanhThu = dashboardData?.coCauDoanhThu || [];
  const coCauTienVe = dashboardData?.coCauTienVe || [];
  const coCauThue = dashboardData?.coCauThue || [];
  const majorProjects = dashboardData?.majorProjects || [];
  const coreStandards = dashboardData?.coreStandards || [];
  const investmentProjects = dashboardData?.investmentProjects || [];
  const scientificPapers = dashboardData?.scientificPapers || [];
  const conferences = dashboardData?.conferences || [];
  const nhanSuBienDongData = dashboardData?.nhanSuBienDongData || [];
  const lasXdData = dashboardData?.lasXdData || [];
  const khcnData = dashboardData?.khcnData || [];
  const canhBaoSummary = dashboardData?.canhBaoSummary;

  // ─── RENDER FILTER BAR ───
  const renderFilterBar = () => (
    <div className="flex flex-wrap items-center gap-2 bg-surface p-1 rounded-xl border border-border dark:border-slate-700/80 shadow-xs w-fit">
      <div className="flex items-center border-r border-border dark:border-slate-700/80 pl-1.5 pr-2.5">
        <Filter className="w-4 h-4 text-primary-500" />
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Bộ chọn Năm */}
        <div className="relative group">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="appearance-none bg-subtle text-ink font-bold text-[12px] rounded-lg pl-2.5 pr-7 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
            <option value="2024">Năm 2024</option>
            <option value="all">Tất cả năm</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Bộ chọn Kỳ */}
        <div className="relative group">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className="appearance-none bg-subtle text-ink font-bold text-[12px] rounded-lg pl-2.5 pr-7 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="all">Cả năm</option>
            <option value="q1">Quý I</option>
            <option value="q2">Quý II</option>
            <option value="q3">Quý III</option>
            <option value="q4">Quý IV</option>
            <option value="6-thang">6 Tháng đầu năm</option>
            <option value="9-thang">9 Tháng</option>
            <option value="custom">Tùy chọn ngày...</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Bộ chọn Đơn vị */}
        <div className="relative group">
          <select
            value={filterDonVi}
            onChange={(e) => setFilterDonVi(e.target.value)}
            className="appearance-none bg-subtle text-ink font-bold text-[12px] rounded-lg pl-2.5 pr-7 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer max-w-[240px] truncate"
            title="Lọc theo đơn vị"
          >
            <option value="all">Toàn Viện (19 đơn vị trực thuộc)</option>
            <optgroup label="I. Các Viện chuyên ngành">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'I').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="II. Các Phân viện">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'II').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="III. Các Trung tâm chuyên môn">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'III').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="IV. Doanh nghiệp trực thuộc">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'IV').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="V. Phòng chức năng quản lý">
              {DON_VI_PHONG_CHUC_NANG.map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Tùy chọn ngày */}
        {filterPeriod === 'custom' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-subtle text-ink font-medium text-[11.5px] rounded-lg px-2 py-1 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500"
            />
            <span className="text-ink-muted text-xs">-</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-subtle text-ink font-medium text-[11.5px] rounded-lg px-2 py-1 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500"
            />
          </div>
        )}

        {/* Nút Làm mới */}
        <button
          onClick={loadData}
          title="Tải lại dữ liệu"
          className="p-1.5 rounded-lg border border-border dark:border-slate-700/80 hover:bg-subtle text-ink-secondary transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-primary' : ''}`} />
        </button>

        {/* Nút Trình chiếu Giao ban */}
        <button
          onClick={() => setIsMeetingMode(!isMeetingMode)}
          title="Chế độ Trình chiếu Họp Giao ban"
          className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg border text-[11.5px] font-bold transition-all cursor-pointer ${
            isMeetingMode
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'border-border dark:border-slate-700/80 hover:bg-subtle text-primary-600 dark:text-primary-400'
          }`}
        >
          {isMeetingMode ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          <span>Trình chiếu</span>
        </button>
      </div>
    </div>
  );

  // ─── RENDER TABS ───
  const renderTabs = () => {
    const tabs = [
      { id: 'tong-quan', label: 'Tổng quan Viện', icon: Activity },
      { id: 'nckh', label: 'Nghiên cứu & QLNN', icon: Microscope },
      { id: 'kinh-doanh', label: 'Kinh doanh & TBKT', icon: TrendingUp },
      ...(coTabTaiChinh ? [{ id: 'tai-chinh', label: 'Tài chính & Đầu tư', icon: PiggyBank }] : []),
      { id: 'nhan-su', label: 'Tổ chức & Hành chính', icon: Users },
      { id: 'lich', label: 'Lịch công tác', icon: Calendar },
    ];

    return (
      <div className="flex flex-wrap gap-1 bg-surface p-1 rounded-xl shadow-xs border border-border dark:border-slate-700/80 w-fit">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12.5px] font-bold transition-all whitespace-nowrap cursor-pointer ${
                isActive
                  ? 'bg-primary-500 text-white shadow-xs'
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
    onClick?: () => void;
  }

  const KPICard = ({
    title,
    value,
    subtitle,
    icon: Icon,
    color = 'primary',
    trend,
    onClick,
  }: KPICardProps) => {
    const colorClasses: Record<string, string> = {
      primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/30 dark:text-primary-400',
      success: 'bg-success/10 text-success',
      warning: 'bg-warning/10 text-warning',
      danger: 'bg-danger/10 text-danger',
      info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/30 dark:text-sky-400',
      accent: 'bg-purple-50 text-purple-600 dark:bg-purple-950/30 dark:text-purple-400',
      gold: 'bg-amber-50 text-amber-600 dark:bg-amber-950/30 dark:text-amber-400',
    };

    return (
      <div
        onClick={onClick}
        className={`card p-5 border border-border dark:border-slate-700/80 hover:shadow-md transition-all ${
          onClick ? 'cursor-pointer hover:border-primary-500/50 group' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-2xs font-black uppercase tracking-wider text-ink-muted mb-1">{title}</p>
            <h3 className="text-2xl font-black text-ink tracking-tight group-hover:text-primary-600 transition-colors">
              {value}
            </h3>
          </div>
          <div className={`p-2.5 rounded-xl ${colorClasses[color]}`}>
            <Icon className="w-5 h-5" />
          </div>
        </div>
        {subtitle && (
          <p className="text-2xs text-ink-muted mt-2 flex items-center gap-1.5 font-medium">
            <span>{subtitle}</span>
            {trend && (
              <span className={`font-bold ${trend.startsWith('+') ? 'text-success' : 'text-danger'}`}>
                {trend}
              </span>
            )}
          </p>
        )}
      </div>
    );
  };

  return (
    <div
      className={`px-6 pt-2 pb-20 w-full mx-auto space-y-5 transition-all ${
        isMeetingMode
          ? 'fixed inset-0 z-50 overflow-y-auto bg-surface dark:bg-slate-950 p-8 space-y-6'
          : ''
      }`}
    >
      {/* ── Tiêu đề & Chế độ Họp Giao ban ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-2 border-b border-border dark:border-slate-700/80 pb-3">
        <div className="flex items-center gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl lg:text-3xl font-black text-ink">
                {isMeetingMode ? 'BỘ XÂY DỰNG — VIỆN KHCN XÂY DỰNG — BÁO CÁO ĐIỀU HÀNH' : 'Dashboard Quản trị IBST'}
              </h1>
              {filterDonVi !== 'all' && (
                <span className="px-2 py-0.5 rounded-full text-xs font-black bg-primary-500/15 text-primary-600 border border-primary-500/30">
                  {filterDonVi}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-success"></span>
              </span>
              <p className="text-ink-muted text-xs font-medium">
                Dữ liệu tổng hợp Real-time từ CSDL • Kỳ {filterPeriod === 'all' ? 'Cả năm' : filterPeriod} {filterYear}
              </p>
            </div>
          </div>
        </div>

        {isMeetingMode && (
          <button
            onClick={() => setIsMeetingMode(false)}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-danger text-white font-bold text-xs hover:bg-danger/90 shadow-sm transition-all cursor-pointer"
          >
            <Minimize2 className="w-4 h-4" />
            <span>Thoát Trình chiếu (ESC)</span>
          </button>
        )}
      </div>

      {/* ── Widget Cảnh báo Điều hành & Tuân thủ QC 2815 ── */}
      {canhBaoSummary && (
        <ExecutiveWarningBanner
          summary={canhBaoSummary}
          onOpenAlerts={(tabKey) => handleOpenDrilldown((tabKey as DashboardDrilldownTab) || 'canh-bao')}
        />
      )}

      {/* ── Tabs & Filter Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {renderTabs()}
        {activeTab !== 'lich' && renderFilterBar()}
      </div>

      {/* ══════════════════ TAB 1: TỔNG QUAN VIỆN ══════════════════ */}
      {activeTab === 'tong-quan' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          {/* Row 1: KPI Cards có hỗ trợ Drill-down */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <KPICard
              title="Giá trị Ký Hợp đồng"
              value={`${overviewData.giaTriKy} tỷ`}
              subtitle={`Đạt ${overviewData.tyLeDatKyMoi}% kế hoạch (750 tỷ)`}
              icon={FileSignature}
              color="primary"
              trend="+38%"
              onClick={() => handleOpenDrilldown('hop-dong')}
            />
            <KPICard
              title="Thực hiện Doanh thu"
              value={`${overviewData.giaTriDoanhThu} tỷ`}
              subtitle={`Đạt ${overviewData.tyLeDatDoanhThu}% kế hoạch (750 tỷ)`}
              icon={DollarSign}
              color="success"
              trend="+28%"
              onClick={() => handleOpenDrilldown('hop-dong')}
            />
            <KPICard
              title="Nhiệm vụ KHCN"
              value={overviewData.totalNhiemVuKHCN}
              subtitle={`Kinh phí NSNN ${overviewData.kinhPhiKHCN2026} tỷ`}
              icon={BookOpen}
              color="gold"
              onClick={() => handleOpenDrilldown('khcn')}
            />
            <KPICard
              title="Phục vụ QLNN"
              value={`${overviewData.nhiemVuQLNN} Lượt`}
              subtitle="48 báo cáo rà soát"
              icon={Landmark}
              color="info"
              onClick={() => handleOpenDrilldown('khcn')}
            />
            <KPICard
              title="Tổng nợ lũy kế"
              value={`${overviewData.tongNoLuyKe} tỷ`}
              subtitle="Cần đôn đốc thu hồi"
              icon={AlertTriangle}
              color="danger"
              trend="+12%"
              onClick={() => handleOpenDrilldown('cong-no')}
            />
          </div>

          {/* Quick Highlight Banner: Ký HĐKT 2026 đạt 941,74 tỷ (126% KH, 138% Cùng kỳ) */}
          <div className="bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/20 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-primary-500 text-white flex items-center justify-center shrink-0 shadow-sm">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="text-sm font-black text-ink">
                    Lũy kế Ký HĐKT toàn Viện đạt 941,736 tỷ VNĐ (tính tới 21.8.2026)
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-success/15 text-success">
                    Đạt 126% KH cả năm
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[11px] font-black bg-sky-500/15 text-sky-600 dark:text-sky-400">
                    138% Cùng kỳ 2025
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-0.5">
                  Viện ký: <strong className="text-ink font-bold">261,225 tỷ (27.7%)</strong> • Đơn vị ký: <strong className="text-ink font-bold">680,510 tỷ (72.3%)</strong> • KH giao: 750,0 tỷ • Cùng kỳ 2025: 684,245 tỷ
                </p>
              </div>
            </div>
            <button
              onClick={() => setActiveTab('kinh-doanh')}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-primary-500 hover:bg-primary-600 text-white text-xs font-bold shadow-xs transition-colors shrink-0 cursor-pointer self-start md:self-auto"
            >
              <span>Xem Bảng 16 Đơn vị & Biểu đồ</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Row 2: Charts - Tiến độ Kế hoạch Ký kết & Doanh thu Lũy kế vs Mục tiêu (Ảnh 2) */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              {/* Header phong cách Báo cáo Điều hành chuẩn ảnh 2 */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 border-b border-border dark:border-slate-700/80 pb-3.5">
                <div>
                  <span className="text-[11px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
                    TIẾN ĐỘ
                  </span>
                  <h3 className="text-[18px] font-black text-ink uppercase tracking-tight mt-0.5">
                    {trendChartMode === 'ky-ket' && 'GIÁ TRỊ KÝ KẾT LŨY KẾ VS MỤC TIÊU'}
                    {trendChartMode === 'doanh-thu' && 'DOANH THU THỰC HIỆN LŨY KẾ VS MỤC TIÊU'}
                    {trendChartMode === 'dong-tien' && 'DÒNG TIỀN VỀ LŨY KẾ VS MỤC TIÊU'}
                    {trendChartMode === 'so-sanh' && 'SO SÁNH TIẾN ĐỘ KÝ KẾT & DOANH THU LŨY KẾ'}
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    Tiến độ tích lũy so với kế hoạch năm (750 tỷ VNĐ)
                  </p>
                </div>

                {/* Pill Segmented Controls như ảnh 2 */}
                <div className="flex items-center gap-1 bg-subtle dark:bg-slate-800/90 p-1 rounded-xl border border-border dark:border-slate-700/80 shrink-0 self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setTrendChartMode('ky-ket')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trendChartMode === 'ky-ket'
                        ? 'bg-amber-500 text-white shadow-xs'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface'
                    }`}
                  >
                    Ký kết
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendChartMode('doanh-thu')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trendChartMode === 'doanh-thu'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface'
                    }`}
                  >
                    Doanh thu
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendChartMode('dong-tien')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trendChartMode === 'dong-tien'
                        ? 'bg-sky-600 text-white shadow-xs'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface'
                    }`}
                  >
                    Dòng tiền
                  </button>
                  <button
                    type="button"
                    onClick={() => setTrendChartMode('so-sanh')}
                    className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                      trendChartMode === 'so-sanh'
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-ink-secondary hover:text-ink hover:bg-surface'
                    }`}
                  >
                    So sánh
                  </button>
                </div>
              </div>

              {/* Chart container */}
              <div className="h-[430px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={luyKeChartData} margin={{ top: 20, right: 25, left: 10, bottom: 10 }}>
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                    <YAxis
                      stroke="var(--text-muted)"
                      fontSize={12}
                      tickFormatter={(val) => `${val} tỷ`}
                      domain={[0, 'auto']}
                    />
                    <ReferenceLine
                      y={750}
                      stroke="#94a3b8"
                      strokeDasharray="3 3"
                      label={{
                        value: 'KH năm: 750 tỷ',
                        position: 'insideTopLeft',
                        fill: 'var(--text-muted)',
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    />
                    <Tooltip
                      {...tooltipStyle}
                      content={({ active, payload }) => {
                        if (!active || !payload || !payload.length) return null;
                        const data = payload[0].payload;
                        return (
                          <div className="bg-surface/95 dark:bg-slate-900/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-border dark:border-slate-700/80 text-xs min-w-[230px]">
                            <div className="font-black text-ink pb-1.5 mb-2 border-b border-border dark:border-slate-700/80 flex items-center justify-between">
                              <span>{data.monthLabel}</span>
                              <span className="text-2xs text-ink-muted">Mục tiêu năm: 750 tỷ</span>
                            </div>
                            {!data.hasActual ? (
                              <div className="space-y-1.5 py-1">
                                <div className="text-amber-600 dark:text-amber-400 font-medium italic">
                                  Chưa phát sinh dữ liệu thực tế
                                </div>
                                <div className="flex justify-between items-center text-slate-500 dark:text-slate-400 pt-1 border-t border-border dark:border-slate-700/80">
                                  <span>Mục tiêu phân kỳ:</span>
                                  <span className="font-bold text-ink">{data.mucTieu?.toFixed(2)} tỷ VNĐ</span>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-1.5">
                                {trendChartMode === 'ky-ket' && (
                                  <>
                                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
                                      <span>Ký kết Lũy kế:</span>
                                      <span>{data.kyMoiLuyKe != null ? data.kyMoiLuyKe.toFixed(2) : '--'} tỷ VNĐ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                      <span>Mục tiêu phân kỳ:</span>
                                      <span>{data.mucTieu?.toFixed(2)} tỷ VNĐ</span>
                                    </div>
                                    <div className="pt-1 border-t border-border dark:border-slate-700/80 flex justify-between items-center text-2xs">
                                      <span className="text-ink-muted">Tỷ lệ hoàn thành:</span>
                                      <span className="font-bold text-success">
                                        {Math.round(((data.kyMoiLuyKe || 0) / 750) * 100)}% KH năm
                                      </span>
                                    </div>
                                  </>
                                )}
                                {trendChartMode === 'doanh-thu' && (
                                  <>
                                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                      <span>Doanh thu Lũy kế:</span>
                                      <span>{data.doanhThuLuyKe != null ? data.doanhThuLuyKe.toFixed(2) : '--'} tỷ VNĐ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                      <span>Mục tiêu phân kỳ:</span>
                                      <span>{data.mucTieu?.toFixed(2)} tỷ VNĐ</span>
                                    </div>
                                    <div className="pt-1 border-t border-border dark:border-slate-700/80 flex justify-between items-center text-2xs">
                                      <span className="text-ink-muted">Tỷ lệ hoàn thành:</span>
                                      <span className="font-bold text-success">
                                        {Math.round(((data.doanhThuLuyKe || 0) / 750) * 100)}% KH năm
                                      </span>
                                    </div>
                                  </>
                                )}
                                {trendChartMode === 'dong-tien' && (
                                  <>
                                    <div className="flex justify-between items-center text-sky-600 dark:text-sky-400 font-bold">
                                      <span>Dòng tiền Lũy kế:</span>
                                      <span>{data.dongTienLuyKe != null ? data.dongTienLuyKe.toFixed(2) : '--'} tỷ VNĐ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                      <span>Mục tiêu phân kỳ:</span>
                                      <span>{data.mucTieu?.toFixed(2)} tỷ VNĐ</span>
                                    </div>
                                    <div className="pt-1 border-t border-border dark:border-slate-700/80 flex justify-between items-center text-2xs">
                                      <span className="text-ink-muted">Tỷ lệ dòng tiền:</span>
                                      <span className="font-bold text-sky-600">
                                        {Math.round(((data.dongTienLuyKe || 0) / 750) * 100)}% KH năm
                                      </span>
                                    </div>
                                  </>
                                )}
                                {trendChartMode === 'so-sanh' && (
                                  <>
                                    <div className="flex justify-between items-center text-amber-600 dark:text-amber-400 font-bold">
                                      <span>Ký kết Lũy kế:</span>
                                      <span>{data.kyMoiLuyKe != null ? data.kyMoiLuyKe.toFixed(2) : '--'} tỷ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-emerald-600 dark:text-emerald-400 font-bold">
                                      <span>Doanh thu Lũy kế:</span>
                                      <span>{data.doanhThuLuyKe != null ? data.doanhThuLuyKe.toFixed(2) : '--'} tỷ</span>
                                    </div>
                                    <div className="flex justify-between items-center text-slate-500 dark:text-slate-400">
                                      <span>Mục tiêu phân kỳ:</span>
                                      <span>{data.mucTieu?.toFixed(2)} tỷ</span>
                                    </div>
                                  </>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      }}
                    />
                    <Legend
                      wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '16px' }}
                      formatter={(value) => <span className="text-xs font-bold text-ink-secondary px-1.5">{value}</span>}
                    />

                    {/* Render đường theo mode đã chọn với hiệu ứng mờ bóng gạch nối high-tech */}
                    {trendChartMode === 'ky-ket' && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="kyMoiLuyKe"
                          name="Lũy kế"
                          stroke="#f59e0b"
                          strokeWidth={3.5}
                          fillOpacity={1}
                          fill="url(#colorLuyKeKyKet)"
                          filter="url(#glowKyKet)"
                          connectNulls={false}
                          dot={{ r: 4.5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2.5 }}
                          activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3, fill: '#f59e0b' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mucTieu"
                          name="Mục tiêu"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          connectNulls={true}
                          dot={false}
                        />
                      </>
                    )}

                    {trendChartMode === 'doanh-thu' && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="doanhThuLuyKe"
                          name="Lũy kế"
                          stroke="#10b981"
                          strokeWidth={3.5}
                          fillOpacity={1}
                          fill="url(#colorLuyKeDoanhThu)"
                          filter="url(#glowDoanhThu)"
                          connectNulls={false}
                          dot={{ r: 4.5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2.5 }}
                          activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3, fill: '#10b981' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mucTieu"
                          name="Mục tiêu"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          connectNulls={true}
                          dot={false}
                        />
                      </>
                    )}

                    {trendChartMode === 'dong-tien' && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="dongTienLuyKe"
                          name="Lũy kế"
                          stroke="#0284c7"
                          strokeWidth={3.5}
                          fillOpacity={1}
                          fill="url(#colorLuyKeDongTien)"
                          filter="url(#glowDongTien)"
                          connectNulls={false}
                          dot={{ r: 4.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2.5 }}
                          activeDot={{ r: 7, stroke: '#ffffff', strokeWidth: 3, fill: '#0284c7' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mucTieu"
                          name="Mục tiêu"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          connectNulls={true}
                          dot={false}
                        />
                      </>
                    )}

                    {trendChartMode === 'so-sanh' && (
                      <>
                        <Area
                          type="monotone"
                          dataKey="kyMoiLuyKe"
                          name="Ký kết Lũy kế"
                          stroke="#f59e0b"
                          strokeWidth={3.5}
                          fillOpacity={0.6}
                          fill="url(#colorLuyKeKyKet)"
                          filter="url(#glowKyKet)"
                          connectNulls={false}
                          dot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 6.5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="doanhThuLuyKe"
                          name="Doanh thu Lũy kế"
                          stroke="#10b981"
                          strokeWidth={3.5}
                          filter="url(#glowDoanhThu)"
                          connectNulls={false}
                          dot={{ r: 4, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                          activeDot={{ r: 6.5 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="mucTieu"
                          name="Mục tiêu"
                          stroke="#94a3b8"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          connectNulls={true}
                          dot={false}
                        />
                      </>
                    )}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="grid grid-rows-2 gap-6 lg:col-span-1">
              <div className="card p-6 border border-border dark:border-slate-700/80">
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  Cơ cấu Doanh thu theo Lĩnh vực
                </h3>
                <div className="h-[210px] relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <ChartDefs />
                      <Pie
                        data={coCauDoanhThu}
                        cx="50%"
                        cy="42%"
                        innerRadius={48}
                        outerRadius={70}
                        paddingAngle={3}
                        dataKey="value"
                        stroke="var(--bg-surface)"
                        strokeWidth={2}
                        filter="url(#pieGlow)"
                      >
                        {coCauDoanhThu.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={`url(#pieGrad-${index % 5})`} />
                        ))}
                      </Pie>
                      <Tooltip {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                      <Legend
                        layout="horizontal"
                        verticalAlign="bottom"
                        align="center"
                        wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '6px' }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  {/* Center donut overlay label: cx="50%", cy="42%" -> left-1/2, top-[42%] chuẩn xác 100% tuyệt đối */}
                  <div className="absolute top-[42%] left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                    <p className="text-[15px] font-black text-ink leading-none">396.7</p>
                    <p className="text-[9px] font-bold text-ink-muted uppercase tracking-wider mt-0.5">Tỷ VNĐ</p>
                  </div>
                </div>
              </div>

              <div className="card p-6 border border-border dark:border-slate-700/80">
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  Hoạt động Quản trị nổi bật
                </h3>
                <ul className="space-y-4">
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-info/10 rounded-lg text-info">
                      <Globe2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-[14px]">Hợp tác Quốc tế & Trong nước</h4>
                      <p className="text-[12.5px] text-ink-secondary mt-1">
                        Ký MOU Tập đoàn Trần Đức, làm việc với JICA, ACI, KICT.
                      </p>
                    </div>
                  </li>
                  <li className="flex items-start gap-3">
                    <div className="p-2 bg-primary/10 rounded-lg text-primary-500">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-ink text-[14px]">Dự án Tòa nhà 10 tầng</h4>
                      <p className="text-[12.5px] text-ink-secondary mt-1">
                        Tổng mức đầu tư 562.5 tỷ. Đang lập quy hoạch tổng mặt bằng.
                      </p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Row 3: Biểu đồ Kế hoạch & Doanh thu 16 Đơn vị & Cảnh báo Nợ đọng */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <div className="flex justify-between items-center mb-6 border-b border-border dark:border-slate-700/80 pb-3">
                <h3 className="text-[16px] font-black text-ink">
                  Biểu đồ Kế hoạch & Doanh thu các Đơn vị (Tỷ VNĐ)
                </h3>
                <span className="text-2xs text-ink-muted">Bấm cột để xem chi tiết</span>
              </div>
              <div className="h-[460px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={doanhThuData} margin={{ top: 25, right: 20, bottom: 35, left: 0 }}>
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickMargin={12}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip
                      cursor={{ fill: 'var(--bg-subtle)' }}
                      {...tooltipStyle}
                      formatter={(value: any, name: any, props: any) => {
                        if (name === 'Doanh thu thực hiện') {
                          const pct = props.payload?.kh;
                          return [`${value} tỷ (${pct}%)`, name];
                        }
                        return [`${value} tỷ`, name];
                      }}
                    />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '15px' }} />
                    <Bar
                      dataKey="doanhThu"
                      name="Doanh thu thực hiện"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                      onClick={() => handleOpenDrilldown('hop-dong')}
                      className="cursor-pointer"
                      filter="url(#shadowBar)"
                      label={(props: any) => {
                        const { x, y, width, index } = props;
                        if (index === undefined || x === undefined || y === undefined || width === undefined)
                          return null;
                        const pct = doanhThuData[index]?.kh;
                        return (
                          <text
                            x={Number(x) + Number(width) / 2}
                            y={Number(y) - 10}
                            fill="var(--text-secondary)"
                            fontSize={9.5}
                            fontWeight={700}
                            textAnchor="middle"
                          >
                            {pct}%
                          </text>
                        );
                      }}
                    >
                      {doanhThuData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#grad-${index % 16})`} />
                      ))}
                    </Bar>
                    <Line
                      type="linear"
                      dataKey="keHoach"
                      name="Kế hoạch Doanh thu"
                      stroke="#38bdf8"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#ffffff', stroke: '#38bdf8', strokeWidth: 2 }}
                      activeDot={{ r: 6.5, fill: '#38bdf8', stroke: '#ffffff', strokeWidth: 2.5 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  <h3 className="text-[16px] font-black text-ink">Cảnh báo Nợ đọng: TOP Đơn vị nguy cơ cao</h3>
                  <button
                    onClick={() => handleOpenDrilldown('cong-no')}
                    className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                  >
                    Xem tất cả &gt;
                  </button>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/40">
                        <th className="th-cell rounded-tl-lg py-2">Đơn vị</th>
                        <th className="th-cell py-2">Tổng Nợ (Tỷ)</th>
                        <th className="th-cell py-2">Nợ Nghĩa vụ Viện</th>
                        <th className="th-cell text-right py-2 rounded-tr-lg">Thao tác</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                      {noDongData.slice(0, 6).map((row, idx) => (
                        <tr key={idx} className="tr-hover">
                          <td className="td-cell font-bold py-2.5" style={{ color: DEBT_COLORS[idx] }}>
                            {row.name}
                          </td>
                          <td className="td-cell text-danger font-bold py-2.5">{row.tongNo}</td>
                          <td className="td-cell font-medium text-warning py-2.5">{row.noNV}</td>
                          <td className="td-cell text-right py-2.5">
                            <button
                              onClick={() => handleOpenDrilldown('cong-no')}
                              className="px-2 py-0.5 rounded text-xs font-bold bg-danger/10 text-danger hover:bg-danger/20 transition-colors cursor-pointer"
                            >
                              Đôn đốc
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          {/* Row 4: Công trình trọng điểm & Năng lực đấu thầu */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Giám sát các Công trình Trọng điểm Quốc gia (Mục IX.1)
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/40">
                      <th className="th-cell rounded-tl-lg py-2">Tên công trình</th>
                      <th className="th-cell py-2">Nội dung hỗ trợ kỹ thuật</th>
                      <th className="th-cell py-2">Trạng thái báo cáo</th>
                      <th className="th-cell text-right rounded-tr-lg py-2">Tiến độ</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                    {majorProjects.map((proj, idx) => (
                      <tr key={idx} className="tr-hover">
                        <td className="td-cell font-bold text-ink py-2.5">{proj.name}</td>
                        <td className="td-cell text-ink-secondary py-2.5">{proj.category}</td>
                        <td className="td-cell py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                              proj.status.startsWith('Hoàn thành')
                                ? 'bg-success/10 text-success'
                                : 'bg-primary/10 text-primary-500'
                            }`}
                          >
                            {proj.status}
                          </span>
                        </td>
                        <td className="td-cell text-right font-black text-ink-secondary py-2.5">
                          {proj.progress}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  Năng lực Đấu thầu qua mạng
                </h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border dark:border-slate-700/80">
                    <span className="text-[13px] font-bold text-ink-secondary">Tổng gói tham gia</span>
                    <span className="text-[15px] font-black text-ink">58 gói</span>
                  </div>
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border dark:border-slate-700/80">
                    <span className="text-[13px] font-bold text-ink-secondary">Số gói trúng thầu</span>
                    <span className="text-[15px] font-black text-success">47 gói</span>
                  </div>
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border dark:border-slate-700/80">
                    <span className="text-[13px] font-bold text-ink-secondary">Tỷ lệ trúng thầu</span>
                    <span className="text-[15px] font-black text-primary-500">81.0%</span>
                  </div>
                  <div className="flex justify-between items-center bg-subtle p-3 rounded-lg border border-border dark:border-slate-700/80">
                    <span className="text-[13px] font-bold text-ink-secondary">Tổng giá trị trúng</span>
                    <span className="text-[15px] font-black text-danger">18.94 tỷ</span>
                  </div>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-border dark:border-slate-700/80 flex items-center justify-between text-2xs text-ink-muted">
                <span>Đại diện Viện: Phòng KHKT</span>
                <span>Dữ liệu đến 28/06/2026</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 2: NGHIÊN CỨU & QLNN ══════════════════ */}
      {activeTab === 'nckh' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="Kinh phí NSNN"
              value={`${overviewData.kinhPhiKHCN2026} tỷ`}
              subtitle="Thực hiện trong kỳ"
              icon={Banknote}
              color="gold"
              onClick={() => handleOpenDrilldown('khcn')}
            />
            <KPICard
              title="Tiêu chuẩn / Quy chuẩn"
              value="56"
              subtitle="54 TC, 02 QC đang thực hiện"
              icon={FileText}
              color="primary"
              onClick={() => handleOpenDrilldown('khcn')}
            />
            <KPICard
              title="Đề tài NCKH cấp Bộ"
              value="14"
              subtitle="02 Vốn Doanh nghiệp"
              icon={Microscope}
              color="accent"
              onClick={() => handleOpenDrilldown('khcn')}
            />
            <KPICard
              title="Bài báo Khoa học"
              value="08"
              subtitle="Tạp chí Quốc tế/Trong nước"
              icon={Newspaper}
              color="success"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Biểu đồ Phân bổ Kinh phí KHCN cấp 2026 (Tỷ VNĐ)
              </h3>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={khcnData} margin={{ top: 25, right: 20, bottom: 35, left: 10 }}>
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickMargin={12}
                      angle={-35}
                      textAnchor="end"
                      height={65}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} content={<CustomKHCNTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '15px' }} />
                    <Bar
                      dataKey="kinhPhi"
                      name="Kinh phí cấp 2026"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={25}
                      onClick={() => handleOpenDrilldown('khcn')}
                      className="cursor-pointer"
                      filter="url(#shadowBar)"
                    >
                      {khcnData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#grad-${index % 16})`} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Thực hiện nhiệm vụ QLNN
              </h3>
              <ul className="space-y-5">
                <li className="flex items-start gap-4">
                  <div className="p-2.5 bg-danger/10 rounded-xl text-danger shrink-0">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-[14px]">Sự cố & Giám định Tư pháp</h4>
                    <p className="text-[12.5px] text-ink-secondary mt-1 leading-relaxed">
                      Giải quyết sạt lở kè kênh Tàu Hủ (TP.HCM), sự cố ống nước Quảng Trạch 1, và 06 vụ trưng cầu
                      của TAND.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 bg-primary/10 rounded-xl text-primary-500 shrink-0">
                    <Landmark className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-[14px]">Giám sát Công trình Quốc gia</h4>
                    <p className="text-[12.5px] text-ink-secondary mt-1 leading-relaxed">
                      Nghiệm thu Sân bay Long Thành, quyết toán Nhà Quốc hội Lào, và báo cáo an toàn TT Hội nghị
                      Quốc gia.
                    </p>
                  </div>
                </li>
                <li className="flex items-start gap-4">
                  <div className="p-2.5 bg-success/10 rounded-xl text-success shrink-0">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-ink text-[14px]">Biên soạn & Giải đáp Kỹ thuật</h4>
                    <p className="text-[12.5px] text-ink-secondary mt-1 leading-relaxed">
                      Soạn thảo giải pháp PCCC cho cơ sở cũ, xử lý 119 lượt nhiệm vụ và 48 lượt báo cáo rà soát của
                      Bộ.
                    </p>
                  </div>
                </li>
              </ul>
            </div>
          </div>

          {/* Row 3: Bảng 5 & Quy chuẩn cốt lõi */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <div className="flex items-center justify-between mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                <h3 className="text-[16px] font-black text-ink">
                  Kinh phí & Giải ngân các Nhiệm vụ KHCN thực hiện năm 2026 (Bảng 5)
                </h3>
                <button
                  onClick={() => handleOpenDrilldown('khcn')}
                  className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
                >
                  Xem chi tiết &gt;
                </button>
              </div>
              <div className="overflow-x-auto max-h-[350px] overflow-y-auto pr-1">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/40">
                      <th className="th-cell rounded-tl-lg py-2">Đơn vị chủ trì</th>
                      <th className="th-cell text-center py-2">Số lượng NV</th>
                      <th className="th-cell py-2">Giá trị HĐ (Tỷ)</th>
                      <th className="th-cell py-2">KP cấp 2026 (Tỷ)</th>
                      <th className="th-cell py-2">Giải ngân chủ trì (Tỷ)</th>
                      <th className="th-cell text-right rounded-tr-lg py-2">Tỷ lệ giải ngân</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                    {khcnData.map((row, idx) => (
                      <tr key={idx} className="tr-hover">
                        <td className="td-cell font-bold text-ink py-2.5">{row.name}</td>
                        <td className="td-cell text-center text-ink font-semibold py-2.5">{row.deTai}</td>
                        <td className="td-cell text-ink-secondary font-medium py-2.5">
                          {row.contractVal.toFixed(3)}
                        </td>
                        <td className="td-cell text-primary-500 font-bold py-2.5">{row.kinhPhi.toFixed(3)}</td>
                        <td className="td-cell text-success font-bold py-2.5">{row.disbursed.toFixed(3)}</td>
                        <td className="td-cell text-right py-2.5">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-black ${
                              row.pct > 50
                                ? 'bg-success/10 text-success'
                                : row.pct > 0
                                ? 'bg-warning/10 text-warning'
                                : 'bg-subtle text-ink-muted'
                            }`}
                          >
                            {row.pct.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Quy chuẩn & Tiêu chuẩn Cốt lõi đang soạn thảo
              </h3>
              <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
                {coreStandards.map((std, idx) => (
                  <div key={idx} className="bg-subtle p-3 rounded-lg border border-border dark:border-slate-700/80">
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
        </div>
      )}

      {/* ══════════════════ TAB 3: KINH DOANH & TBKT ══════════════════ */}
      {activeTab === 'kinh-doanh' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="Tổng Ký Hợp đồng"
              value={`${overviewData.giaTriKy} tỷ`}
              subtitle={`Đạt ${overviewData.tyLeDatKyMoi}% kế hoạch (750 tỷ)`}
              icon={Handshake}
              color="primary"
              onClick={() => handleOpenDrilldown('hop-dong')}
            />
            <KPICard
              title="Thực hiện Doanh thu"
              value={`${overviewData.giaTriDoanhThu} tỷ`}
              subtitle={`Đạt ${overviewData.tyLeDatDoanhThu}% kế hoạch (750 tỷ)`}
              icon={TrendingUp}
              color="success"
              onClick={() => handleOpenDrilldown('hop-dong')}
            />
            <KPICard
              title="Tổng Tiền Về"
              value={`${overviewData.tongTienVe} tỷ`}
              subtitle="Thu thực tế trong kỳ"
              icon={Wallet}
              color="info"
              onClick={() => handleOpenDrilldown('hop-dong')}
            />
            <KPICard
              title="Tổng Nợ Lũy Kế"
              value={`${overviewData.tongNoLuyKe} tỷ`}
              subtitle="Công nợ cần thu hồi"
              icon={AlertCircle}
              color="danger"
              onClick={() => handleOpenDrilldown('cong-no')}
            />
          </div>

          {/* ── BẢNG TỔNG HỢP GIÁ TRỊ KÝ HĐKT CÁC ĐƠN VỊ NĂM 2026 (THEO BÁO CÁO 21/8/2026) ── */}
          <div className="card p-6 border border-border dark:border-slate-700/80 space-y-4 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border dark:border-slate-700/80 pb-4">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <FileSpreadsheet className="w-5 h-5 text-primary-500" />
                  <h3 className="text-[17px] font-black text-ink">
                    Bảng Tổng hợp Giá trị ký HĐKT các Đơn vị năm 2026 (tính tới 21.8.2026)
                  </h3>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-success/15 text-success border border-success/30">
                    Đạt 126% KH cả năm
                  </span>
                </div>
                <p className="text-xs text-ink-muted mt-1">
                  Số liệu lũy kế chính thức toàn Viện IBST • Phân cấp Viện ký (261,225 tỷ) và Đơn vị tự ký (680,510 tỷ)
                </p>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                {/* Bộ chuyển đổi đơn vị */}
                <div className="flex items-center bg-subtle p-0.5 rounded-lg border border-border dark:border-slate-700/80 text-xs font-bold">
                  <button
                    onClick={() => setTableUnit('ty')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      tableUnit === 'ty'
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    Tỷ VNĐ
                  </button>
                  <button
                    onClick={() => setTableUnit('nghin')}
                    className={`px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                      tableUnit === 'nghin'
                        ? 'bg-primary-500 text-white shadow-xs'
                        : 'text-ink-secondary hover:text-ink'
                    }`}
                  >
                    Nghìn đồng (Gốc)
                  </button>
                </div>

                {/* Nút Xuất Excel */}
                <button
                  onClick={handleExportBangTongHopHDKT}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                  title="Xuất bảng này ra file Excel (.xls)"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Xuất Excel</span>
                </button>

                {/* Nút In bảng */}
                <button
                  onClick={handlePrint}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border dark:border-slate-700/80 hover:bg-subtle text-ink text-xs font-bold transition-colors cursor-pointer"
                  title="In báo cáo này"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>In bảng</span>
                </button>
              </div>
            </div>

            {/* Bảng dữ liệu 10 cột */}
            <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 text-ink">
                    <th className="th-cell text-center py-2.5 w-10">TT</th>
                    <th className="th-cell py-2.5 min-w-[190px]">Nhóm / Đơn vị</th>
                    <th className="th-cell text-right py-2.5 min-w-[125px]">
                      Đăng ký KH năm ({tableUnit === 'nghin' ? 'Nghìn đ' : 'Tỷ'})
                    </th>
                    <th className="th-cell text-right py-2.5 min-w-[125px]">
                      Cùng kỳ 2025 ({tableUnit === 'nghin' ? 'Nghìn đ' : 'Tỷ'})
                    </th>
                    <th className="th-cell text-right py-2.5 min-w-[110px] text-sky-600 dark:text-sky-400">
                      Viện ký
                    </th>
                    <th className="th-cell text-right py-2.5 min-w-[110px] text-teal-600 dark:text-teal-400">
                      Đơn vị ký
                    </th>
                    <th className="th-cell text-right py-2.5 min-w-[125px] font-black text-primary-600 dark:text-primary-400">
                      Tổng ký 2026
                    </th>
                    <th className="th-cell text-center py-2.5 min-w-[95px]">So KH năm</th>
                    <th className="th-cell text-center py-2.5 min-w-[95px]">So Cùng kỳ</th>
                    <th className="th-cell py-2.5 min-w-[150px]">Ghi chú</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                  {BANG_TONG_HOP_ROWS.map((row, idx) => {
                    if (row.isHeader) {
                      return (
                        <tr
                          key={`header-${idx}`}
                          className="bg-subtle/80 dark:bg-slate-800/80 font-black text-primary-600 dark:text-primary-400 text-xs tracking-wider uppercase border-t border-b border-border dark:border-slate-700/80"
                        >
                          <td className="py-2.5 px-3 text-center">{row.group}</td>
                          <td colSpan={9} className="py-2.5 px-3">
                            {row.title}
                          </td>
                        </tr>
                      );
                    }

                    const isSub = row.isSubtotal;
                    const isGrand = row.isGrandTotal;

                    const fmtNum = (ty: number, nghin: number) => {
                      if (tableUnit === 'nghin') {
                        return nghin.toLocaleString('vi-VN');
                      }
                      return ty > 0
                        ? ty.toLocaleString('vi-VN', {
                            minimumFractionDigits: ty % 1 === 0 ? 0 : 3,
                            maximumFractionDigits: 3,
                          })
                        : '—';
                    };

                    let rowClass = 'hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors';
                    if (isSub) {
                      rowClass = 'bg-sky-50/70 dark:bg-sky-950/30 font-black border-y-2 border-sky-400/40 text-ink';
                    } else if (isGrand) {
                      rowClass =
                        'bg-primary-500/15 dark:bg-primary-900/40 font-black text-[13.5px] border-t-2 border-primary-500 text-ink';
                    }

                    return (
                      <tr key={`row-${idx}`} className={rowClass}>
                        <td className="py-2.5 px-3 text-center text-ink-muted font-bold">
                          {row.stt}
                        </td>
                        <td className="py-2.5 px-3">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-ink">{row.code}</span>
                            {!isSub && !isGrand && row.name && (
                              <span
                                className="text-2xs text-ink-muted hidden sm:inline truncate max-w-[140px]"
                                title={row.name}
                              >
                                • {row.name}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-amber-700 dark:text-amber-400 font-bold">
                          {fmtNum(row.khTy ?? 0, row.khNghin ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-ink-secondary">
                          {fmtNum(row.ckTy ?? 0, row.ckNghin ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-sky-600 dark:text-sky-400 font-semibold">
                          {fmtNum(row.vienKyTy ?? 0, row.vienKyNghin ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-teal-600 dark:text-teal-400 font-semibold">
                          {fmtNum(row.dvKyTy ?? 0, row.dvKyNghin ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-right tabular-nums text-primary-600 dark:text-primary-400 font-black">
                          {fmtNum(row.tongKyTy ?? 0, row.tongKyNghin ?? 0)}
                        </td>
                        <td className="py-2.5 px-3 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-black ${
                              (row.pctKH ?? 0) >= 100
                                ? 'bg-success/15 text-success dark:bg-success/20 dark:text-success'
                                : 'bg-amber-500/15 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                            }`}
                          >
                            {row.pctKH ?? 0}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-center tabular-nums">
                          <span
                            className={`font-black text-xs ${
                              (row.pctCungKy ?? 0) >= 100 ? 'text-success' : 'text-danger'
                            }`}
                          >
                            {row.pctCungKy ?? 0}%
                          </span>
                        </td>
                        <td className="py-2.5 px-3 text-xs text-amber-700 dark:text-amber-400 italic">
                          {row.ghiChu || '—'}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Footer tóm tắt */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-ink-muted pt-2 border-t border-border dark:border-slate-700/80">
              <div className="flex items-center gap-4 flex-wrap">
                <span>
                  Tổng KH năm: <strong className="text-ink font-bold">750,0 tỷ</strong>
                </span>
                <span>
                  Thực hiện cùng kỳ 2025: <strong className="text-ink font-bold">684,245 tỷ</strong>
                </span>
                <span>
                  Lũy kế ký 2026:{' '}
                  <strong className="text-primary-600 dark:text-primary-400 font-bold">
                    941,736 tỷ
                  </strong>
                </span>
              </div>
              <div className="text-success font-black">
                ★ Tăng trưởng so với cùng kỳ: +38% (Vượt KH cả năm trước 4 tháng)
              </div>
            </div>
          </div>

          {/* ── HAI BIỂU ĐỒ SO SÁNH 16 ĐƠN VỊ ── */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Biểu đồ Cột Nhóm & Xếp Chồng 16 Đơn vị */}
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                <div>
                  <h3 className="text-[16px] font-black text-ink flex items-center gap-2">
                    <Layers className="w-4 h-4 text-primary-500" />
                    So sánh Kế hoạch 2026 vs Cùng kỳ 2025 vs Thực hiện Ký 2026 (Tỷ VNĐ)
                  </h3>
                  <p className="text-xs text-ink-muted mt-0.5">
                    HĐ ký 2026 xếp chồng: Đơn vị ký (xanh ngọc) + Viện ký (xanh dương) so với KH (vàng) và Cùng kỳ (xám)
                  </p>
                </div>
              </div>
              <div className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={doanhThuData} margin={{ top: 20, right: 20, left: 10, bottom: 40 }}>
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickMargin={12}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} tickFormatter={(v) => `${v} tỷ`} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} content={<CustomComparisonTooltip />} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '15px' }} />
                    <Bar dataKey="keHoach" name="KH năm 2026" fill="url(#pieGrad-2)" radius={[4, 4, 0, 0]} maxBarSize={14} filter="url(#shadowBar)" />
                    <Bar dataKey="cungKy2025" name="Cùng kỳ năm 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={14} />
                    <Bar dataKey="donViKy" stackId="ky2026" name="Đơn vị ký (2026)" fill="url(#pieGrad-1)" maxBarSize={14} />
                    <Bar dataKey="vienKy" stackId="ky2026" name="Viện ký (2026)" fill="url(#pieGrad-0)" radius={[4, 4, 0, 0]} maxBarSize={14} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Biểu đồ % Tốc độ Tăng trưởng so với cùng kỳ 2025 */}
            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  <div>
                    <h3 className="text-[16px] font-black text-ink flex items-center gap-2">
                      <Percent className="w-4 h-4 text-emerald-500" />
                      Tăng trưởng so với Cùng kỳ
                    </h3>
                    <p className="text-xs text-ink-muted mt-0.5">Tỷ lệ % so với cùng kỳ năm 2025</p>
                  </div>
                </div>
                <div className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      layout="vertical"
                      data={[...doanhThuData].sort((a, b) => (b.pctCungKy || 0) - (a.pctCungKy || 0))}
                      margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                    >
                      <ChartDefs />
                      <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                      <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} />
                      <YAxis
                        dataKey="name"
                        type="category"
                        width={75}
                        tick={{ fontSize: 10.5, fill: 'var(--text-secondary)', fontWeight: 700 }}
                        stroke="none"
                      />
                      <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} content={<CustomGrowthTooltip />} />
                      <ReferenceLine
                        x={100}
                        stroke="#ef4444"
                        strokeDasharray="3 3"
                        label={{ value: '100%', fill: '#ef4444', fontSize: 10, position: 'top' }}
                      />
                      <Bar dataKey="pctCungKy" name="% So cùng kỳ 2025" radius={[0, 6, 6, 0]} barSize={14} filter="url(#shadowBar)">
                        {[...doanhThuData]
                          .sort((a, b) => (b.pctCungKy || 0) - (a.pctCungKy || 0))
                          .map((entry, index) => {
                            const val = entry.pctCungKy || 0;
                            const fill =
                              val >= 200
                                ? 'url(#pieGrad-1)'
                                : val >= 100
                                ? 'url(#pieGrad-1)'
                                : val >= 60
                                ? 'url(#pieGrad-2)'
                                : 'url(#pieGrad-3)';
                            return <Cell key={`cell-pct-${index}`} fill={fill} />;
                          })}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>
              <div className="mt-2 pt-3 border-t border-border dark:border-slate-700/80 text-2xs text-ink-muted flex items-center justify-between">
                <span>Ngưỡng 100%: Ngang bằng cùng kỳ</span>
                <span className="text-success font-bold">&gt;100%: Tăng trưởng</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Biểu đồ Ký mới & Doanh thu thực hiện các Đơn vị (Tỷ VNĐ)
              </h3>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={doanhThuData} margin={{ top: 20, right: 30, left: 20, bottom: 35 }}>
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickMargin={12}
                      angle={-35}
                      textAnchor="end"
                      height={70}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '15px' }} />
                    <Bar
                      dataKey="doanhThu"
                      name="Doanh thu thực hiện"
                      radius={[6, 6, 0, 0]}
                      maxBarSize={30}
                      filter="url(#shadowBar)"
                    >
                      {doanhThuData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={`url(#grad-${index % 16})`} />
                      ))}
                    </Bar>
                    <Line
                      type="monotone"
                      dataKey="kyMoi"
                      name="Ký Hợp đồng mới"
                      stroke="#f59e0b"
                      strokeWidth={3}
                      filter="url(#glowKyKet)"
                      dot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                      activeDot={{ r: 7, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 3 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Tăng trưởng cùng kỳ (2025 vs 2026)
              </h3>
              <div className="h-[420px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={growthComparisonData} margin={{ top: 20, right: 10, left: -20, bottom: 35 }}>
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} {...tooltipStyle} formatter={(value: any) => `${value} tỷ`} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }} />
                    <Bar dataKey="val2025" name="Năm 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                    <Bar dataKey="val2026" name="Năm 2026" fill="url(#pieGrad-0)" radius={[6, 6, 0, 0]} maxBarSize={20} filter="url(#shadowBar)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Phân tích nợ đọng */}
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center font-black">
                        <Wallet className="w-4 h-4" />
                      </div>
                      <div>
                        <h3 className="text-[16px] font-black text-ink">
                          Phân tích Chi tiết Công nợ đọng 16 Đơn vị
                        </h3>
                        <p className="text-2xs text-ink-muted">
                          Đối chiếu Tổng nợ khách hàng &amp; Nghĩa vụ nộp Viện theo QC 2815 • Dữ liệu chốt sổ 2026 (Tỷ VNĐ)
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center flex-wrap gap-2">
                    {/* Chuyển chế độ xem: Biểu đồ cột đứng vs Ma trận rủi ro */}
                    <div className="inline-flex p-0.5 rounded-lg bg-subtle/80 dark:bg-slate-800/80 border border-border dark:border-slate-700/80 text-xs">
                      <button
                        type="button"
                        onClick={() => setDebtViewMode('cot-dung')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          debtViewMode === 'cot-dung'
                            ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                        title="Xem dạng biểu đồ cột đứng"
                      >
                        <BarChart3 className="w-3.5 h-3.5" />
                        <span>Cột đứng</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setDebtViewMode('ma-tran')}
                        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md font-bold transition-colors cursor-pointer ${
                          debtViewMode === 'ma-tran'
                            ? 'bg-surface text-primary-600 dark:text-primary-400 shadow-sm'
                            : 'text-ink-muted hover:text-ink'
                        }`}
                        title="Xem dạng ma trận phân loại rủi ro"
                      >
                        <Table className="w-3.5 h-3.5" />
                        <span>Ma trận rủi ro</span>
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setShowAllDebts(!showAllDebts)}
                      className="px-2.5 py-1 rounded-lg border border-border dark:border-slate-700/80 text-xs font-bold text-ink hover:bg-subtle dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                    >
                      {showAllDebts ? 'Top 8 nợ cao' : 'Toàn bộ 16'}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDrilldown('cong-no')}
                      className="px-2.5 py-1 rounded-lg bg-danger/10 text-danger text-xs font-bold hover:bg-danger/20 transition-colors cursor-pointer flex items-center gap-1"
                    >
                      <span>Drill-down HĐ nợ</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Tóm tắt nhanh chỉ số công nợ - gọn gàng tinh tế */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-3 py-1.5 px-3 rounded-lg bg-subtle/40 dark:bg-slate-900/50 border border-border dark:border-slate-700/80 text-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
                    <span className="text-ink-muted text-2xs font-medium">Tổng nợ khách hàng:</span>
                    <span className="font-bold text-red-600 dark:text-red-400 text-xs">
                      {noDongData.reduce((acc, d) => acc + (d.tongNo || 0), 0).toFixed(2)} tỷ
                    </span>
                  </div>
                  <div className="h-3 w-px bg-border dark:bg-slate-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                    <span className="text-ink-muted text-2xs font-medium">Nợ Nghĩa vụ Viện:</span>
                    <span className="font-bold text-amber-600 dark:text-amber-400 text-xs">
                      {noDongData.reduce((acc, d) => acc + (d.noNV || 0), 0).toFixed(2)} tỷ
                    </span>
                  </div>
                  <div className="h-3 w-px bg-border dark:bg-slate-700 hidden sm:block" />
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                    <span className="text-ink-muted text-2xs font-medium">Đơn vị nợ cao (&ge;15 tỷ):</span>
                    <span className="font-bold text-rose-600 dark:text-rose-400 text-xs">
                      {noDongData.filter((d) => (d.tongNo || 0) >= 15).length} Đơn vị
                    </span>
                  </div>
                </div>

                {debtViewMode === 'cot-dung' ? (
                  /* ── DẠNG 1: BIỂU ĐỒ CỘT ĐỨNG HIỆN ĐẠI ── */
                  <div className="h-[620px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={showAllDebts ? noDongData : noDongData.slice(0, 8)}
                        margin={{ top: 20, right: 15, left: -5, bottom: 40 }}
                      >
                        <ChartDefs />
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                        <XAxis
                          dataKey="name"
                          stroke="var(--text-muted)"
                          fontSize={10}
                          tickMargin={10}
                          angle={-35}
                          textAnchor="end"
                          height={55}
                        />
                        <YAxis
                          stroke="var(--text-muted)"
                          fontSize={11}
                          tickFormatter={(val) => `${val} tỷ`}
                        />
                        <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} content={<CustomDebtTooltip />} />
                        <Legend
                          wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }}
                        />
                        <ReferenceLine
                          y={15}
                          stroke="#ef4444"
                          strokeDasharray="4 4"
                          label={({ viewBox }: any) => {
                            if (!viewBox) return null;
                            const { x, y } = viewBox;
                            return (
                              <g>
                                <rect
                                  x={x + 10}
                                  y={y - 20}
                                  width={140}
                                  height={18}
                                  rx={4}
                                  fill="var(--bg-surface, #ffffff)"
                                  stroke="#ef4444"
                                  strokeWidth={1}
                                  className="dark:fill-slate-900"
                                />
                                <text
                                  x={x + 16}
                                  y={y - 7}
                                  fill="#ef4444"
                                  fontSize={10.5}
                                  fontWeight={700}
                                >
                                  ⚠ Ngưỡng nợ cao (&gt;15 tỷ)
                                </text>
                              </g>
                            );
                          }}
                        />
                        <Bar
                          dataKey="tongNo"
                          name="Khách hàng nợ Đơn vị"
                          fill="url(#pieGrad-3)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={showAllDebts ? 20 : 32}
                          filter="url(#shadowBar)"
                        />
                        <Bar
                          dataKey="noNV"
                          name="Nợ Nghĩa vụ Viện"
                          fill="url(#pieGrad-2)"
                          radius={[6, 6, 0, 0]}
                          maxBarSize={showAllDebts ? 20 : 32}
                          filter="url(#shadowBar)"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  /* ── DẠNG 2: MA TRẬN RỦI RO & BẢNG ĐÔN ĐỐC ── */
                  <div className="overflow-x-auto pr-1 border border-border dark:border-slate-700/80 rounded-xl">
                    <table className="w-full text-left border-collapse text-[12.5px]">
                      <thead className="sticky top-0 z-10 bg-surface dark:bg-slate-900 shadow-sm">
                        <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/50 dark:bg-slate-900/80">
                          <th className="th-cell py-2.5 px-3 text-center w-10">#</th>
                          <th className="th-cell py-2.5 px-3">Đơn vị</th>
                          <th className="th-cell py-2.5 px-3 min-w-[150px]">Tổng nợ KH (Tỷ)</th>
                          <th className="th-cell py-2.5 px-3">Nợ Viện (Tỷ)</th>
                          <th className="th-cell py-2.5 px-3 text-center">Tỷ trọng NV</th>
                          <th className="th-cell py-2.5 px-3 text-center">Mức rủi ro</th>
                          <th className="th-cell py-2.5 px-3 text-right">Đôn đốc</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                        {(showAllDebts ? noDongData : noDongData.slice(0, 8)).map((row, idx) => {
                          const maxDebt = noDongData[0]?.tongNo || 1;
                          const pctOfMax = Math.min(100, Math.round((row.tongNo / maxDebt) * 100));
                          const isRedAlert = row.tongNo >= 20;
                          const isOrangeAlert = row.tongNo >= 15 && row.tongNo < 20;
                          const isYellowAlert = row.tongNo >= 10 && row.tongNo < 15;

                          return (
                            <tr
                              key={row.name}
                              className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors"
                            >
                              <td className="py-2.5 px-3 text-center font-bold text-ink-muted text-xs">
                                {idx === 0 ? '🥇' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : idx + 1}
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="font-bold text-ink text-xs">{row.name}</div>
                                <div className="text-3xs text-ink-muted truncate max-w-[180px]">
                                  {row.fullName || row.name}
                                </div>
                              </td>
                              <td className="py-2.5 px-3">
                                <div className="flex items-center justify-between text-xs font-black text-red-600 dark:text-red-400">
                                  <span>{row.tongNo.toFixed(2)} tỷ</span>
                                  <span className="text-3xs text-ink-muted font-normal">
                                    {pctOfMax}% max
                                  </span>
                                </div>
                                <div className="w-full bg-subtle dark:bg-slate-800 h-1.5 rounded-full overflow-hidden mt-1">
                                  <div
                                    className={`h-full rounded-full ${
                                      isRedAlert
                                        ? 'bg-rose-500'
                                        : isOrangeAlert
                                        ? 'bg-amber-500'
                                        : 'bg-primary-500'
                                    }`}
                                    style={{ width: `${pctOfMax}%` }}
                                  />
                                </div>
                              </td>
                              <td className="py-2.5 px-3 font-semibold text-amber-600 dark:text-amber-400 text-xs">
                                {row.noNV.toFixed(2)} tỷ
                              </td>
                              <td className="py-2.5 px-3 text-center text-xs font-bold text-ink">
                                {row.tyLeNoNV ?? (row.tongNo > 0 ? Math.round((row.noNV / row.tongNo) * 100) : 0)}%
                              </td>
                              <td className="py-2.5 px-3 text-center">
                                {isRedAlert ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-black bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                                    🚨 Rất cao
                                  </span>
                                ) : isOrangeAlert ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-black bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                                    ⚠️ Cảnh báo
                                  </span>
                                ) : isYellowAlert ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-semibold bg-yellow-500/15 text-yellow-700 dark:text-yellow-400 border border-yellow-500/30">
                                    🟡 Theo dõi
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-3xs font-medium bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                                    🟢 An toàn
                                  </span>
                                )}
                              </td>
                              <td className="py-2.5 px-3 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleOpenDrilldown('cong-no')}
                                  className="px-2 py-1 rounded text-2xs font-bold bg-danger/10 text-danger hover:bg-danger/20 transition-colors cursor-pointer"
                                  title={`Mở danh sách hợp đồng nợ của ${row.name}`}
                                >
                                  Đôn đốc
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>

            {/* Xếp hạng sức khỏe đơn vị */}
            <div className="card p-6 border border-border dark:border-slate-700/80 flex flex-col justify-between">
              <div>
                <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                  Xếp hạng Sức khỏe Vận hành 16 Đơn vị
                </h3>
                <div className="overflow-x-auto pr-1">
                  <table className="w-full text-left border-collapse text-[12.5px]">
                    <thead>
                      <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/40">
                        <th className="th-cell rounded-tl-lg py-2.5">Đơn vị</th>
                        <th className="th-cell py-2.5">% KH Doanh thu</th>
                        <th className="th-cell text-right rounded-tr-lg py-2.5">Đánh giá</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                      {unitHealthData.map((row, idx) => (
                        <tr key={idx} className="tr-hover">
                          <td className="td-cell font-bold text-ink py-2.5">{row.name}</td>
                          <td className="td-cell text-ink-secondary font-black py-2.5">{row.khProgress}%</td>
                          <td className="td-cell text-right py-2.5">
                            <span className={`font-black text-xs ${row.color}`}>{row.status}</span>
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

      {/* ══════════════════ TAB 4: TÀI CHÍNH & ĐẦU TƯ ══════════════════ */}
      {activeTab === 'tai-chinh' && coTabTaiChinh && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="Nộp Ngân sách NN"
              value={`${overviewData.nopNganSach} tỷ`}
              subtitle="GTGT, TNDN, TNCN"
              icon={Receipt}
              color="success"
            />
            <KPICard
              title="Quỹ Lương CB"
              value={`${overviewData.quyLuong} tỷ`}
              subtitle={`Cho ${overviewData.tongNhanSu} cán bộ`}
              icon={Wallet}
              color="primary"
              onClick={() => handleOpenDrilldown('nhan-su')}
            />
            <KPICard
              title="Bảo lãnh Ngân hàng"
              value={`${overviewData.baoLanhNH} tỷ`}
              subtitle="Đang thực hiện"
              icon={Building2}
              color="warning"
            />
            <KPICard
              title="Đầu tư Quỹ PTSN"
              value="8.89 tỷ"
              subtitle="Thiết bị quan trắc"
              icon={Target}
              color="info"
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Biến động Chi Lương & Nộp Thuế theo kỳ (Tỷ VNĐ)
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={taiChinhData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={12} tickMargin={10} />
                    <YAxis stroke="var(--text-muted)" fontSize={12} />
                    <Tooltip {...tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '13px', fontWeight: '600', paddingTop: '15px' }} />
                    <Line
                      type="monotone"
                      dataKey="luong"
                      name="Chi Lương & BH"
                      stroke="var(--color-primary, #00668c)"
                      strokeWidth={3.5}
                      connectNulls={false}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="thue"
                      name="Nộp Thuế NSNN"
                      stroke="var(--color-danger, #ef4444)"
                      strokeWidth={3}
                      connectNulls={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="nsnn"
                      name="NSNN Cấp"
                      stroke="var(--color-success, #10b981)"
                      strokeWidth={3}
                      strokeDasharray="5 5"
                      connectNulls={false}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80">
              <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
                Cơ cấu Nộp Thuế (Tỷ VNĐ)
              </h3>
              <div className="h-[350px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={coCauThue}
                      cx="50%"
                      cy="50%"
                      innerRadius={65}
                      outerRadius={100}
                      paddingAngle={3}
                      dataKey="value"
                      stroke="none"
                    >
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

          <div className="card p-6 border border-border dark:border-slate-700/80">
            <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              Giám sát các Dự án Đầu tư Phát triển Cơ sở vật chất & Mua sắm (Mục IX.5)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/40">
                    <th className="th-cell rounded-tl-lg py-2">Tên dự án đầu tư / Mua sắm</th>
                    <th className="th-cell py-2">Quy mô vốn</th>
                    <th className="th-cell py-2">Nguồn vốn / Giai đoạn</th>
                    <th className="th-cell py-2">Trạng thái thực tế</th>
                    <th className="th-cell text-right rounded-tr-lg py-2">Tiến độ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
                  {investmentProjects.map((proj, idx) => (
                    <tr key={idx} className="tr-hover">
                      <td className="td-cell font-bold text-ink py-2.5">{proj.name}</td>
                      <td className="td-cell text-ink-secondary font-medium py-2.5">{proj.scale}</td>
                      <td className="td-cell text-ink-secondary font-medium py-2.5">{proj.period}</td>
                      <td className="td-cell py-2.5">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                            proj.status === 'Hoàn thành bàn giao'
                              ? 'bg-success/10 text-success'
                              : 'bg-primary/10 text-primary-500'
                          }`}
                        >
                          {proj.status}
                        </span>
                      </td>
                      <td className="td-cell text-right font-black text-ink-secondary py-2.5">{proj.progress}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 5: TỔ CHỨC & HÀNH CHÍNH ══════════════════ */}
      {activeTab === 'nhan-su' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <KPICard
              title="Tổng Nhân sự"
              value={overviewData.tongNhanSu}
              subtitle="+63 tuyển mới, -20 nghỉ | Thu nhập 18tr/th"
              icon={Users}
              color="primary"
              onClick={() => handleOpenDrilldown('nhan-su')}
            />
            <KPICard
              title="Văn bản tiếp nhận"
              value="1,600+"
              subtitle="Qua hệ thống mạng e-Office"
              icon={FileCheck2}
              color="info"
            />
            <KPICard
              title="Mạng lưới LAS-XD"
              value="11"
              subtitle="LAS-XD toàn quốc | 04 số tạp chí/năm"
              icon={Network}
              color="success"
            />
            <KPICard
              title="An toàn PCCC"
              value="Đảm bảo"
              subtitle="Đã kiểm tra định kỳ"
              icon={ShieldAlert}
              color="accent"
            />
          </div>

          <div className="card p-6 border border-border dark:border-slate-700/80">
            <h3 className="text-[16px] font-black text-ink mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              Biểu đồ Biến động Nhân sự Cán bộ theo tháng
            </h3>
            <div className="h-[280px]">
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
            <p className="text-2xs text-ink-muted mt-3 italic">
              *Tổng kết: Tuyển mới 63 cán bộ, giảm 20 cán bộ (phù hợp với quy trình kiện toàn tinh giản bộ máy).
            </p>
          </div>
        </div>
      )}

      {/* ══════════════════ TAB 6: LỊCH CÔNG TÁC ══════════════════ */}
      {activeTab === 'lich' && (
        <div className="space-y-6 animate-in fade-in duration-300">
          <LichCoQuanPage />
        </div>
      )}
    </div>
  );
}
