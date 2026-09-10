import { useEffect, useMemo, useState, type ReactNode } from 'react';
import {
  Handshake,
  Banknote,
  AlertTriangle,
  LoaderCircle,
  Users2,
  FileText,
  CheckCircle2,
  AlertCircle,
  Gavel,
  ClipboardCheck,
  Info,
  ListChecks,
  Wallet,
  ShieldCheck,
  Paperclip,
  Pencil,
  Users,
  User,
  Archive,
  History,
  Check,
  Activity,
  BarChart3,
  ExternalLink,
  Link2,
  Send,
  Printer,
  ChevronDown,
  Landmark,
} from 'lucide-react';
import {
  DotThanhToanPanel,
  CtvGiaoViecPanel,
  ThuongPhatPanel,
  KiemTraNoiBoPanel,
  QuyetToanGiaiDoanPanel,
  HoSoHopDongPanel,
  DonViGiaoViecPanel,
  NhatKyHopDongPanel,
} from '../components/DetailPanels';
import { NumberInput } from '../components/NumberInput';
import { LienDanhPanel, LuuTruHoSoPanel } from '../components/Phase2Panels';
import { WorkflowStepper } from '../components/WorkflowStepper';
import { PageHeader } from '../components/PageHeader';
import { TRANG_THAI_OPTIONS, StatusBadge } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Field, inputCls } from '../components/Modal';
import { SlideOverTabs, type SlideOverTabDef } from '../components/SlideOver';
import { TableToolbar, FilterSelect, RowActions } from '../components/TableToolbar';
import { ThucHienHopDongPanel } from '../components/ThucHienHopDongPanel';
import { BaoCaoKhktPanel } from '../components/BaoCaoKhktPanel';
import { CanhBaoQuyChePanel } from '../components/CanhBaoQuyChePanel';
import { useSlidePanel } from '../context/SlidePanelContext';
import { useAuth } from '../context/AuthContext';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { tabDuocPhep, type TaiNguyen } from '../lib/phanQuyen';
import {
  DAC_TA_NHANH,
  NHAN_TRANG_THAI_GIAO_VIEC,
  buocKeTiep,
  cacBuocKy,
  coTheTraLai,
  mauTrangThaiGiaoViec,
  nhanhKyGiaoViec,
  type TrangThaiGiaoViec,
} from '../lib/kyGiaoViec';
import {
  coTheTrinhDuyet,
  coThePheDuyet,
  coTheQuyetToan,
  coTheThamTraKhkt,
  lyDoKhongDuThamQuyen,
  NHAN_VAI_TRO,
} from '../lib/quyenHopDong';
import { fetchUyQuyenKyHopDong, fetchDauThau } from '../services/workflow';
import { useSearchParams } from 'react-router-dom';
import { KhachHangPage } from './KhachHangPage';
import { DauThauPage } from './DauThauPage';
import { PvqlnnPage } from './PvqlnnPage';
import { UyQuyenPage } from './UyQuyenPage';
import { TaiChinhPage } from './TaiChinhPage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import {
  fetchHopDong,
  fetchKhachHangOptions,
  fetchDonViOptions,
  fetchNhanSuOptions,
  createHopDong,
  updateHopDong,
  updateHopDongPheDuyet,
  updateQuyetToanHopDong,
  deleteHopDong,
  type HopDongInput,
  type Option,
} from '../services/queries';
import {
  fetchPhieuGiaoViec,
  upsertPhieuGiaoViec,
  chuyenBuocGiaoViec,
  fetchCtvGiaoViec,
  fetchChungChiTheoNhanSu,
  type PhieuGiaoViec,
  type PhieuGiaoViecInput,
  type CtvGiaoViec,
} from '../services/chitiet';
import { PhanPhoiHopDongPanel } from '../components/PhanPhoiHopDongPanel';
import { QuyetToanDieu11Panel } from '../components/QuyetToanDieu11Panel';
import type { HopDong, TrangThaiPheDuyet } from '../types';
import {
  BANG_1,
  DAC_THU_OPTIONS,
  timDinhMuc,
  phanBoHopDong,
  canTrinhVienTruong,
  ngayHanNopHoSo,
  soNgayConLai,
  canhBaoPhatNopChamHoSo,
  canhBaoPhatChungTuTre,
  canhBaoCapKy,
  capKyMacDinh,
  kiemTraKinhPhiChuTri,
  CAP_KY_OPTIONS,
  type CapKy,
} from '../lib/qc2815';
import { formatTrieu, formatNgay, cn } from '../lib/utils';
import { printPhieuGiaoViec, sinhHtmlPhieuGiaoViec } from '../lib/printGiaoViec';
import { fetchDonViGiaoViec, type DonViGiaoViec } from '../services/chitiet';

type Tab = 'hop-dong-2815' | 'tai-chinh' | 'crm-khach-hang' | 'dau-thau' | 'pvqlnn' | 'bao-cao-khkt';

const TAB_IDS: Tab[] = ['hop-dong-2815', 'tai-chinh', 'crm-khach-hang', 'dau-thau', 'pvqlnn', 'bao-cao-khkt'];

/** Ánh xạ tab → tài nguyên (Tầng 3) — khớp `ROUTE_PERMISSION_MAP['/hop-dong']`. */
const TAB_TAI_NGUYEN: Record<Tab, TaiNguyen> = {
  'hop-dong-2815': 'hop_dong',
  'tai-chinh': 'tai_chinh',
  'crm-khach-hang': 'khach_hang',
  'dau-thau': 'dau_thau',
  pvqlnn: 'pvqlnn',
  'bao-cao-khkt': 'bao_cao_khkt',
};

const EMPTY_FORM: HopDongInput = {
  soHD: '',
  ten: '',
  khachHangId: '',
  donViId: '',
  giaTri: '',
  ngayKy: '',
  hanHoanThanh: '',
  trangThai: 'moi',
  nhomHD: '',
  chuTriId: '',
  giaDuThau: '',
  ngayNopHoSo: '',
  trangThaiPheDuyet: 'khong-ap-dung',
  ngayTrinhDuyet: '',
  ngayDuyet: '',
  hanChungTuQuyetToan: '',
  loaiDacThu: '',
  phanVienXa: false,
  giamTheoYeuCauDonVi: false,
  phucTap: false,
  capKy: '',
  quanLyTapTrung: false,
  dongDauSoBo: false,
  ngayDongDauSoBo: '',
  soVbChapThuanDauSoBo: '',
  phoDonViQuanLyId: '',
  fileDuThaoUrl: '',
  tenFileDuThao: '',
};

const NGAY_30 = 30 * 24 * 3600 * 1000;

const PHE_DUYET_LABEL: Record<TrangThaiPheDuyet, string> = {
  'khong-ap-dung': 'Không áp dụng',
  'chua-trinh': 'Chờ trình KHKT',
  'cho-khkt-tham-tra': 'KHKT đang thẩm tra (Đ.9.6c)',
  'da-trinh': 'Đã trình, chờ VT duyệt',
  'da-duyet': 'Đã duyệt',
};

const PHE_DUYET_TONE: Record<TrangThaiPheDuyet, string> = {
  'khong-ap-dung': 'bg-muted text-ink-muted',
  'chua-trinh': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'cho-khkt-tham-tra': 'bg-violet-100 text-violet-800 dark:bg-violet-900/40 dark:text-violet-300',
  'da-trinh': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'da-duyet': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

/**
 * Bước kế tiếp của luồng phê duyệt Đ.6.1 (từ 0026 có thêm bước KHKT thẩm tra Đ.9.6c).
 * Trả về null khi không còn hành động (đã duyệt xong).
 */
function buocPheDuyetKeTiep(
  hienTai: TrangThaiPheDuyet,
): { den: TrangThaiPheDuyet; nhanNut: string; kiemTraQuyen: 'trinh' | 'khkt' | 'duyet' } | null {
  switch (hienTai) {
    case 'khong-ap-dung':
    case 'chua-trinh':
      return { den: 'cho-khkt-tham-tra', nhanNut: 'Trình KHKT thẩm tra', kiemTraQuyen: 'trinh' };
    case 'cho-khkt-tham-tra':
      return { den: 'da-trinh', nhanNut: 'KHKT ký tắt — trình Lãnh đạo Viện', kiemTraQuyen: 'khkt' };
    case 'da-trinh':
      return { den: 'da-duyet', nhanNut: 'Xác nhận Viện trưởng đã duyệt', kiemTraQuyen: 'duyet' };
    case 'da-duyet':
      return null;
  }
}

/** Tính Số ngày thực hiện từ Ngày ký & Hạn hoàn thành */
export function tinhSoNgayThucHien(ngayKyStr?: string, hanHoanThanhStr?: string): string {
  if (!ngayKyStr || !hanHoanThanhStr) return '';
  const dKy = new Date(ngayKyStr);
  const dHan = new Date(hanHoanThanhStr);
  if (isNaN(dKy.getTime()) || isNaN(dHan.getTime())) return '';
  const diffTime = dHan.getTime() - dKy.getTime();
  const diffDays = Math.round(diffTime / (1000 * 3600 * 24));
  return diffDays > 0 ? String(diffDays) : '';
}

/** Tính Hạn hoàn thành từ Ngày ký & Số ngày thực hiện */
export function tinhHanHoanThanh(ngayKyStr?: string, soNgayStr?: string): string {
  if (!ngayKyStr || !soNgayStr) return '';
  const soNgay = parseInt(soNgayStr, 10);
  if (isNaN(soNgay) || soNgay <= 0) return '';
  const dKy = new Date(ngayKyStr);
  if (isNaN(dKy.getTime())) return '';
  dKy.setDate(dKy.getDate() + soNgay);
  return dKy.toISOString().slice(0, 10);
}

type DetailTab = 'tong-quan' | 'giao-viec' | 'tai-chinh' | 'ho-so-kt' | 'nhat-ky';

const DETAIL_TABS: SlideOverTabDef<DetailTab>[] = [
  { id: 'tong-quan', label: 'Tổng quan', icon: Info },
  { id: 'giao-viec', label: 'Giao việc', icon: ListChecks },
  { id: 'tai-chinh', label: 'Tài chính', icon: Wallet },
  { id: 'ho-so-kt', label: 'Hồ sơ & KT', icon: Paperclip },
  { id: 'nhat-ky', label: 'Nhật ký', icon: History },
];

function getBuocWorkflowBadge(buoc: string | undefined, trangThai: string) {
  const st = buoc || trangThai || 'du-thao';
  if (st === 'moi' || st === 'du-thao' || st === 'nhap') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-1 text-2xs font-bold text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-slate-500" /> B1. Dự thảo
      </span>
    );
  }
  if (st === 'cho-duyet' || st === 'cho-trinh-duyet') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/50 px-2 py-1 text-2xs font-bold text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" /> B2. Chờ duyệt
      </span>
    );
  }
  if (st === 'dang-thuc-hien' || st === 'da-ky' || st === 'da-duyet') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-blue-50 dark:bg-blue-950/50 px-2 py-1 text-2xs font-bold text-blue-800 dark:text-blue-300 border border-blue-300 dark:border-blue-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" /> B3. Đang thực hiện
      </span>
    );
  }
  if (st === 'nghiem-thu') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-purple-50 dark:bg-purple-950/50 px-2 py-1 text-2xs font-bold text-purple-800 dark:text-purple-300 border border-purple-300 dark:border-purple-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-purple-500" /> B3. Nghiệm thu
      </span>
    );
  }
  if (st === 'hoan-thanh' || st === 'quyet-toan') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-indigo-50 dark:bg-indigo-950/50 px-2 py-1 text-2xs font-bold text-indigo-800 dark:text-indigo-300 border border-indigo-300 dark:border-indigo-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" /> B4. Hoàn thành
      </span>
    );
  }
  if (st === 'thanh-ly') {
    return (
      <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 dark:bg-emerald-950/50 px-2 py-1 text-2xs font-bold text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 shadow-2xs">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> B5. Thanh lý & Lưu trữ
      </span>
    );
  }
  return <StatusBadge value={st as any} />;
}

export interface HopDongPageProps {
  excludeTabs?: Tab[];
  pageTitle?: string;
  pageSubtitle?: string;
}

export function HopDongPage({
  excludeTabs = [],
  pageTitle = "Quản lý Hợp đồng kinh tế & Khách hàng (CRM)",
  pageSubtitle = "Quản lý vòng đời hợp đồng theo Quy chế 2815/QĐ-VKH: Đấu thầu, giao việc, phân bổ tài chính & giám sát thực hiện",
}: HopDongPageProps = {}) {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab | null;
  const availableTabs = useMemo(() => {
    const allTabs: Tab[] = ['hop-dong-2815', 'tai-chinh', 'crm-khach-hang', 'dau-thau', 'pvqlnn', 'bao-cao-khkt'];
    return allTabs.filter((t) => !excludeTabs.includes(t));
  }, [excludeTabs]);

  const defaultTab = availableTabs[0] || 'hop-dong-2815';

  const [activeTab, setActiveTabState] = useState<Tab>(() => {
    if (tabParam && availableTabs.includes(tabParam)) {
      return tabParam;
    }
    return defaultTab;
  });

  const setActiveTab = (newTab: Tab) => {
    setActiveTabState(newTab);
    setSearchParams(newTab === defaultTab ? {} : { tab: newTab }, { replace: true });
  };

  useEffect(() => {
    if (tabParam && availableTabs.includes(tabParam)) {
      setActiveTabState(tabParam);
    }
  }, [tabParam, availableTabs]);

  // Lọc tab theo quyền (Tầng 3) — nếu tab đang chọn (mặc định hoặc lấy từ URL) không
  // còn quyền xem sau khi nạp xong, tự chuyển sang tab được phép đầu tiên.
  const { can: coQuyenTab, dangTai: dangTaiQuyen } = usePhanQuyen();
  const tabHienDuoc = (t: Tab) => !excludeTabs.includes(t) && tabDuocPhep(t, TAB_TAI_NGUYEN, coQuyenTab, dangTaiQuyen);
  useEffect(() => {
    if (dangTaiQuyen) return;
    if (tabHienDuoc(activeTab)) return;
    const taiChoPhep = TAB_IDS.find((t) => coQuyenTab(TAB_TAI_NGUYEN[t], 'xem'));
    if (taiChoPhep) setActiveTab(taiChoPhep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dangTaiQuyen]);

  const { data: hopDongList, loading, error, refetch } = useAsyncData(fetchHopDong, []);
  const { data: khachHangOptions } = useAsyncData(fetchKhachHangOptions, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);
  const { data: dauThauList } = useAsyncData(fetchDauThau, []);

  const [selectedGoiThauId, setSelectedGoiThauId] = useState<string>('');
  const [autoFilledGoiThauMsg, setAutoFilledGoiThauMsg] = useState<string | null>(null);
  const [soNgayThucHien, setSoNgayThucHien] = useState<string>('');

  const handleSelectGoiThau = (goiThauId: string) => {
    setSelectedGoiThauId(goiThauId);
    if (!goiThauId) {
      setAutoFilledGoiThauMsg(null);
      return;
    }

    const target = (dauThauList || []).find((g) => g.id === goiThauId);
    if (!target) return;

    // Gợi ý Nhóm HĐ QC 2815 dựa theo tên gói thầu
    let nhomGoiY = '2A';
    if (target.tenGoiThau.includes('Khảo sát') || target.tenGoiThau.includes('Kiểm định')) {
      nhomGoiY = '2A';
    } else if (target.tenGoiThau.includes('Thiết kế')) {
      nhomGoiY = '2B';
    } else if (target.tenGoiThau.includes('Giám sát')) {
      nhomGoiY = '2C';
    } else if (target.tenGoiThau.includes('Thi công')) {
      nhomGoiY = '3A';
    }

    const giaTriForm = target.giaTrungThau || target.giaDuThau ? String(target.giaTrungThau || target.giaDuThau) : crud.form.giaTri;
    const giaDuThauForm = target.giaDuThau ? String(target.giaDuThau) : crud.form.giaDuThau;

    crud.setForm((prev) => ({
      ...prev,
      dauThauId: goiThauId,
      ten: prev.ten || `Hợp đồng kinh tế: ${target.tenGoiThau}`,
      soHD: prev.soHD || `${Math.floor(Math.random() * 900 + 100)}/2026/HĐKT-IBST`,
      khachHangId: target.chuDauTuId || prev.khachHangId,
      donViId: target.donViThucHienId || prev.donViId,
      chuTriId: target.chuTriHsdtId || target.nguoiPhuTrachId || prev.chuTriId,
      giaTri: giaTriForm,
      giaDuThau: giaDuThauForm,
      nhomHD: nhomGoiY || prev.nhomHD,
      capKy: nhomGoiY === '1' ? 'vien-ky' : prev.capKy || 'don-vi-ky',
    }));

    setAutoFilledGoiThauMsg(
      `Đã kế thừa Tên HĐ, Số HĐ, Khách hàng, Đơn vị, Chủ trì & Giá trị (${(target.giaTrungThau || target.giaDuThau || 0).toLocaleString('vi-VN')} trđ) từ Gói thầu!`
    );
  };

  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [detail, setDetail] = useState<HopDong | null>(null);
  // hopDongList được refetch sau mỗi thao tác (phê duyệt, quyết toán...) — lấy bản mới nhất theo id thay vì dùng `detail` (có thể cũ).
  const liveDetail = useMemo(() => hopDongList.find((h) => h.id === detail?.id) ?? null, [hopDongList, detail]);

  const crud = useCrudForm<HopDong, HopDongInput>({
    empty: EMPTY_FORM,
    toForm: (hd) => ({
      soHD: hd.soHD,
      ten: hd.ten,
      khachHangId: hd.khachHangId ?? '',
      donViId: hd.donViId ?? '',
      giaTri: String(hd.giaTri || ''),
      ngayKy: hd.ngayKy,
      hanHoanThanh: hd.hanHoanThanh,
      trangThai: hd.trangThai,
      nhomHD: hd.nhomHD ?? '',
      chuTriId: hd.chuTriId ?? '',
      giaDuThau: hd.giaDuThau != null ? String(hd.giaDuThau) : '',
      ngayNopHoSo: hd.ngayNopHoSo,
      trangThaiPheDuyet: hd.trangThaiPheDuyet,
      ngayTrinhDuyet: hd.ngayTrinhDuyet,
      ngayDuyet: hd.ngayDuyet,
      hanChungTuQuyetToan: hd.hanChungTuQuyetToan,
      loaiDacThu: hd.loaiDacThu ?? '',
      phanVienXa: hd.phanVienXa,
      giamTheoYeuCauDonVi: hd.giamTheoYeuCauDonVi,
      phucTap: hd.phucTap,
      capKy: hd.capKy ?? '',
      quanLyTapTrung: hd.quanLyTapTrung,
      dongDauSoBo: hd.dongDauSoBo,
      ngayDongDauSoBo: hd.ngayDongDauSoBo,
      soVbChapThuanDauSoBo: hd.soVbChapThuanDauSoBo,
      phoDonViQuanLyId: hd.phoDonViQuanLyId ?? '',
      fileDuThaoUrl: hd.fileDuThaoUrl ?? '',
      tenFileDuThao: hd.tenFileDuThao ?? '',
    }),
    getId: (hd) => hd.id,
    create: createHopDong,
    update: updateHopDong,
    remove: deleteHopDong,
    deleteMessage: (hd) => `Bạn có chắc muốn xóa hợp đồng ${hd.soHD}?`,
    onDone: () => refetch(),
  });

  const filteredList = useMemo(() => {
    return hopDongList.filter((hd) => {
      if (filterTrangThai && hd.trangThai !== filterTrangThai) return false;
      if (filterDonVi && hd.donViId !== filterDonVi) return false;
      return true;
    });
  }, [hopDongList, filterTrangThai, filterDonVi]);

  const table = useTableControls(
    filteredList,
    (hd) => `${hd.soHD} ${hd.ten} ${hd.khachHang} ${hd.donViThucHien}`,
    10
  );

  const tongGiaTri = useMemo(
    () => hopDongList.reduce((acc, h) => acc + (h.giaTri || 0), 0),
    [hopDongList],
  );
  const tongDaThanhToan = useMemo(
    () => hopDongList.reduce((acc, h) => acc + (h.daThanhToan || 0), 0),
    [hopDongList],
  );
  const sapHetHanCount = useMemo(() => {
    const now = Date.now();
    return hopDongList.filter((h) => {
      if (!h.hanHoanThanh) return false;
      const t = new Date(h.hanHoanThanh).getTime();
      return t > now && t - now <= NGAY_30;
    }).length;
  }, [hopDongList]);
  const choTrinhVienTruongCount = useMemo(
    () =>
      hopDongList.filter(
        (h) => canTrinhVienTruong(h.nhomHD, h.giaDuThau ?? h.giaTri, h.phucTap) && h.trangThaiPheDuyet !== 'da-duyet',
      ).length,
    [hopDongList],
  );

  // Ngăn xếp slide-panel dùng chung toàn app (kiểu "tai thỏ" xếp chồng — xem SlidePanelStack).
  const { stack, openPanel, updatePanel, closePanel, closeAll } = useSlidePanel();
  const [detailTab, setDetailTab] = useState<DetailTab>('tong-quan');
  const panelIdForHopDong = (id: string) => `hopdong-${id}`;

  // Thẩm quyền thao tác theo Điều 6.1 / Điều 11 — xem lib/quyenHopDong.ts.
  const { vaiTro, nhanSuId } = useAuth();
  const duocTrinhDuyet = coTheTrinhDuyet(vaiTro);
  const duocPheDuyet = coThePheDuyet(vaiTro);
  const [thaoTacError, setThaoTacError] = useState<string | null>(null);

  const [pheDuyetBusyId, setPheDuyetBusyId] = useState<string | null>(null);
  const capNhatPheDuyet = async (hd: HopDong, trangThai: TrangThaiPheDuyet) => {
    // Quyền theo từng bước: trình (mọi vai trò soạn) → KHKT ký tắt (Đ.9.6c) → VT duyệt (Đ.6.1).
    const duocPhep =
      trangThai === 'da-duyet'
        ? duocPheDuyet
        : trangThai === 'da-trinh'
          ? coTheThamTraKhkt(vaiTro)
          : duocTrinhDuyet;
    if (!duocPhep) {
      setThaoTacError(
        lyDoKhongDuThamQuyen(
          vaiTro,
          trangThai === 'da-duyet'
            ? 'phê duyệt hợp đồng (Điều 6.1)'
            : trangThai === 'da-trinh'
              ? 'ký tắt thẩm tra hồ sơ — thẩm quyền Phòng KHKT (Điều 9.6c)'
              : 'trình duyệt hợp đồng',
        ),
      );
      return;
    }
    setPheDuyetBusyId(hd.id);
    setThaoTacError(null);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await updateHopDongPheDuyet(hd.id, {
        trangThaiPheDuyet: trangThai,
        ...(trangThai === 'da-trinh' ? { ngayTrinhDuyet: today } : {}),
        // Ghi đúng người thật đã bấm duyệt (Điều 6.1), không chỉ ngày tháng — nhanSuId
        // có thể null nếu tài khoản chưa gắn hồ sơ nhân sự, khi đó vẫn duyệt được nhưng
        // không lưu được danh tính (đã có ngày làm bằng chứng tối thiểu).
        ...(trangThai === 'da-duyet' ? { ngayDuyet: today, ...(nhanSuId ? { nguoiDuyetId: nhanSuId } : {}) } : {}),
      });
      await refetch();
    } catch (e) {
      setThaoTacError(e instanceof Error ? e.message : String(e));
    } finally {
      setPheDuyetBusyId(null);
    }
  };

  const [quyetToanBusy, setQuyetToanBusy] = useState(false);
  const toggleQuyetToan = async (hd: HopDong) => {
    if (!coTheQuyetToan(vaiTro, hd.capKy)) {
      setThaoTacError(lyDoKhongDuThamQuyen(vaiTro, 'quyết toán/thanh lý hợp đồng (Điều 11)'));
      return;
    }
    setQuyetToanBusy(true);
    setThaoTacError(null);
    try {
      await updateQuyetToanHopDong(hd.id, hd.trangThaiQuyetToan !== 'da-quyet-toan');
      await refetch();
    } catch (e) {
      setThaoTacError(e instanceof Error ? e.message : String(e));
    } finally {
      setQuyetToanBusy(false);
    }
  };

  const buildDetailHeaderExtra = (hd: HopDong) => (
    <button
      onClick={() => crud.openEdit(hd)}
      className="flex items-center gap-1.5 rounded-lg border border-border px-2.5 py-1.5 text-2xs font-bold text-ink-secondary transition-colors hover:bg-muted"
    >
      <Pencil size={13} /> Sửa
    </button>
  );

  const buildDetailContent = (hd: HopDong, tab: DetailTab) => (
    <>
      {/* ═══ STICKY: Workflow compact + Tabs ═══ */}
      <div className="sticky top-0 z-30 bg-surface/95 backdrop-blur-md border-b border-border-subtle">
        <WorkflowStepper
          hopDongId={hd.id}
          buocHienTai={hd.buocHienTai || hd.trangThai}
          onStateChanged={refetch}
          compact
        />
        <SlideOverTabs tabs={DETAIL_TABS} active={tab} onChange={setDetailTab} />
      </div>

      <div className="space-y-4 p-4">
        {thaoTacError && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-subtle p-3 text-xs font-semibold text-danger">
            <AlertCircle size={15} className="mt-px shrink-0" />
            <span>{thaoTacError}</span>
          </div>
        )}

        {/* ═══ TAB: TỔNG QUAN (gom: Thông tin chung + Phân phối HĐ) ═══ */}
        {tab === 'tong-quan' && (
          <div className="space-y-4">
            <HopDongThongTinTab
              hd={hd}
              pheDuyetBusyId={pheDuyetBusyId}
              onPheDuyet={capNhatPheDuyet}
              onRefetch={refetch}
              onGoToGiaoViec={() => setDetailTab('giao-viec')}
            />
            {/* Phân phối HĐ (Đ.6.3) — gom vào Tổng quan */}
            <DetailSection title="Phân phối hợp đồng (Đ.6.3)" icon={Send} defaultOpen={false}>
              <PhanPhoiHopDongPanel key={`pp-${hd.id}`} hd={hd} />
            </DetailSection>
          </div>
        )}

        {/* ═══ TAB: GIAO VIỆC (gom: Giao việc Đ.7 + Liên danh) ═══ */}
        {tab === 'giao-viec' && (
          <div className="space-y-4">
            <HopDongGiaoViecTab hd={hd} nhanSuOptions={nhanSuOptions} donViOptions={donViOptions} />
            {/* Liên danh (Đ.5.3) — gom vào Giao việc */}
            <DetailSection title="Liên danh (Đ.5.3)" icon={Users} defaultOpen={false}>
              <LienDanhPanel hopDongId={hd.id} />
            </DetailSection>
          </div>
        )}

        {/* ═══ TAB: TÀI CHÍNH (gom: Thanh toán + Thưởng/Phạt) ═══ */}
        {tab === 'tai-chinh' && (
          <div className="space-y-4">
            {/* Quyết toán / Thanh lý (Điều 11) */}
            <div className="rounded-lg border border-border p-3 text-xs space-y-2">
              <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">Quyết toán / Thanh lý (Điều 11)</h4>
              {hd.trangThaiQuyetToan === 'da-quyet-toan' ? (
                <p className="flex items-center gap-1.5 text-success font-semibold">
                  <CheckCircle2 size={14} />
                  {hd.ngayQuyetToan ? <>Đã quyết toán ngày {formatNgay(hd.ngayQuyetToan)}</> : 'Đã quyết toán'}
                </p>
              ) : hd.daThanhToan >= hd.giaTri && hd.giaTri > 0 ? (
                <p className="text-ink-secondary">Đã thu đủ tiền — có thể quyết toán, thanh lý hợp đồng.</p>
              ) : (
                <p className="text-ink-muted">Chưa thu đủ tiền ({formatTrieu(hd.daThanhToan)}/{formatTrieu(hd.giaTri)}).</p>
              )}
              {!coTheQuyetToan(vaiTro, hd.capKy) && (
                <p className="text-2xs italic text-ink-muted">
                  {NHAN_VAI_TRO[vaiTro]} không có thẩm quyền quyết toán/thanh lý hợp đồng này —{' '}
                  {hd.capKy === 'don-vi-ky' ? 'thuộc Trưởng đơn vị' : 'thuộc Lãnh đạo Viện (HĐ Viện ký, Điều 11.1)'}.
                </p>
              )}
              <button
                onClick={() => void toggleQuyetToan(hd)}
                disabled={quyetToanBusy || !coTheQuyetToan(vaiTro, hd.capKy)}
                className="btn-secondary w-full justify-center py-1.5 text-2xs font-bold gap-1 disabled:opacity-50"
              >
                <ClipboardCheck size={12} />
                {hd.trangThaiQuyetToan === 'da-quyet-toan' ? 'Bỏ đánh dấu đã quyết toán' : 'Đánh dấu đã quyết toán'}
              </button>
            </div>
            {/* Đợt thanh toán */}
            <DotThanhToanPanel key={`dtt-${hd.id}`} hopDongId={hd.id} giaTri={hd.giaTri} onChanged={refetch} />
            <QuyetToanDieu11Panel key={`qt11-${hd.id}`} hd={hd} nhanSuOptions={nhanSuOptions} />
            <QuyetToanGiaiDoanPanel key={`qtgd-${hd.id}`} hopDongId={hd.id} onChanged={refetch} />
            {/* Thưởng / Phạt (Đ.13-14) — gom vào Tài chính */}
            <DetailSection title="Thưởng / Phạt (Đ.13-14)" icon={Gavel} defaultOpen={false}>
              <ThuongPhatPanel key={`tp-${hd.id}`} hopDongId={hd.id} nhomHD={hd.nhomHD} nhanSuOptions={nhanSuOptions} onChanged={refetch} />
            </DetailSection>
          </div>
        )}

        {/* ═══ TAB: HỒ SƠ & KT (gom: Hồ sơ + Lưu trữ + Kiểm tra + Thực hiện) ═══ */}
        {tab === 'ho-so-kt' && (
          <div className="space-y-4">
            <DetailSection title="Hồ sơ hợp đồng (Đ.8.4)" icon={Paperclip} defaultOpen>
              <HoSoHopDongPanel hopDongId={hd.id} trangThaiHopDong={hd.trangThai} onChanged={refetch} />
            </DetailSection>
            <DetailSection title="Tiến độ thực hiện (Đ.8.1)" icon={Activity} defaultOpen>
              <ThucHienHopDongPanel key={`th-${hd.id}`} hopDongId={hd.id} />
            </DetailSection>
            <DetailSection title="Kiểm tra nội bộ (Đ.10)" icon={ShieldCheck} defaultOpen={false}>
              <KiemTraNoiBoPanel key={`kt-${hd.id}`} hopDongId={hd.id} nhanSuOptions={nhanSuOptions} onChanged={refetch} />
            </DetailSection>
            <DetailSection title="Lưu trữ TCHC (Đ.8)" icon={Archive} defaultOpen={false}>
              <LuuTruHoSoPanel hopDongId={hd.id} nhanSuOptions={nhanSuOptions} />
            </DetailSection>
          </div>
        )}

        {/* ═══ TAB: NHẬT KÝ ═══ */}
        {tab === 'nhat-ky' && <NhatKyHopDongPanel key={`nk-${hd.id}`} hopDongId={hd.id} />}
      </div>
    </>
  );

  const openDetail = (hd: HopDong, tab: DetailTab = 'tong-quan') => {
    closeAll();
    setDetail(hd);
    setDetailTab(tab);
    openPanel({
      id: panelIdForHopDong(hd.id),
      title: hd.soHD,
      subtitle: hd.ten,
      minWidth: 520,
      storageKey: 'slideover-width-hop-dong-v2',
      headerExtra: buildDetailHeaderExtra(hd),
      content: buildDetailContent(hd, tab),
    });
  };

  // Đồng bộ lại nội dung panel chi tiết đang mở (nếu có) mỗi khi dữ liệu/tab thay đổi —
  // dùng updatePanel (không đụng vị trí ngăn xếp) để không vô tình đóng panel khác xếp trên nó.
  useEffect(() => {
    if (!liveDetail) return;
    updatePanel(panelIdForHopDong(liveDetail.id), {
      title: liveDetail.soHD,
      subtitle: liveDetail.ten,
      headerExtra: buildDetailHeaderExtra(liveDetail),
      content: buildDetailContent(liveDetail, detailTab),
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveDetail, detailTab, pheDuyetBusyId, quyetToanBusy, thaoTacError, vaiTro]);

  const buildFormFields = () => (
    <form id="hopdong-form" onSubmit={crud.submit} className="space-y-4 p-5">
      {/* Workflow Stepper hiển thị quy trình khởi tạo / hiện tại */}
      <WorkflowStepper
        buocHienTai={crud.editing ? (crud.form.trangThai || 'du-thao') : 'du-thao'}
        readOnly={true}
      />

      {crud.actionError && (
        <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">
          {crud.actionError}
        </div>
      )}

      {/* Trường chọn Liên kết Gói thầu / Kết quả thầu */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-900/40 dark:bg-blue-900/10 space-y-2 text-xs">
        <Field label="🔗 Chọn từ Gói thầu / Kết quả dự thầu (QC 2815 Điều 5.1 & 6.1)">
          <select
            className={cn(inputCls, 'text-xs py-1.5 font-medium')}
            value={selectedGoiThauId}
            onChange={(e) => handleSelectGoiThau(e.target.value)}
          >
            <option value="">-- Chọn Gói thầu đã trúng thầu hoặc đang dự thầu để tự động điền dữ liệu --</option>
            {(dauThauList || []).map((g) => (
              <option key={g.id} value={g.id} className="text-xs">
                [{g.trangThai === 'trung-thau' ? 'Trúng thầu' : g.trangThai}] {g.tenGoiThau.length > 70 ? g.tenGoiThau.slice(0, 70) + '...' : g.tenGoiThau} {g.giaTrungThau || g.giaDuThau ? `— ${(g.giaTrungThau || g.giaDuThau || 0).toLocaleString('vi-VN')} trđ` : ''} ({g.donViThucHien || 'Chưa phân ĐV'})
              </option>
            ))}
          </select>
        </Field>
        {autoFilledGoiThauMsg && (
          <p className="text-2xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-fade-in">
            <CheckCircle2 size={13} /> {autoFilledGoiThauMsg}
          </p>
        )}
      </div>

      <FormSection title="Thông tin hợp đồng">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Số hợp đồng" required>
            <input
              type="text"
              required
              value={crud.form.soHD}
              onChange={(e) => crud.setForm({ ...crud.form, soHD: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Nhóm hợp đồng (Bảng 1 QC 2815)">
            <select
              value={crud.form.nhomHD}
              onChange={(e) => {
                const nhomMoi = e.target.value;
                // Điều 6.1: Nhóm 1 mặc định Viện ký, Nhóm 2/3/4 mặc định Đơn vị ký.
                // Chỉ tự đổi Cấp ký nếu đang trống hoặc vẫn đúng bằng gợi ý của nhóm CŨ —
                // nghĩa là người dùng chưa tự tay chọn khác đi; nếu đã chọn khác (vd. cố
                // tình để Viện ký cho HĐ Nhóm 2 theo yêu cầu đơn vị) thì giữ nguyên lựa chọn.
                const goiYCu = capKyMacDinh(crud.form.nhomHD as any);
                const guyDuocTuDoi = !crud.form.capKy || crud.form.capKy === goiYCu;
                const goiYMoi = capKyMacDinh(nhomMoi as any);
                crud.setForm({
                  ...crud.form,
                  nhomHD: nhomMoi,
                  capKy: guyDuocTuDoi && goiYMoi ? goiYMoi : crud.form.capKy,
                });
              }}
              className={inputCls}
            >
              <option value="">-- Chọn nhóm --</option>
              {([1, 2, 3, 4] as const).map((nhom) => (
                <optgroup key={nhom} label={`Nhóm ${nhom}`}>
                  {BANG_1.filter((d) => d.nhom === nhom).map((d) => (
                    <option key={d.id} value={d.id}>{d.ten}</option>
                  ))}
                </optgroup>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Tên hợp đồng" required>
          <input
            type="text"
            required
            value={crud.form.ten}
            onChange={(e) => crud.setForm({ ...crud.form, ten: e.target.value })}
            className={inputCls}
          />
        </Field>
      </FormSection>

      <FormSection title="Khách hàng & đơn vị thực hiện">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Khách hàng">
            <select
              value={crud.form.khachHangId}
              onChange={(e) => crud.setForm({ ...crud.form, khachHangId: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Chọn khách hàng --</option>
              {khachHangOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ten}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Đơn vị thực hiện">
            <select
              value={crud.form.donViId}
              onChange={(e) => crud.setForm({ ...crud.form, donViId: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Chọn đơn vị --</option>
              {donViOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ten}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Chủ trì hợp đồng">
            <select
              value={crud.form.chuTriId}
              onChange={(e) => crud.setForm({ ...crud.form, chuTriId: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Chưa phân công --</option>
              {nhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
            {/* Đ.7.4 — đối chiếu CCNN ngay khi chọn chủ trì; key để nạp lại khi đổi người */}
            {crud.form.chuTriId && <ChungChiTomTat key={crud.form.chuTriId} nhanSuId={crud.form.chuTriId} />}
          </Field>

          {crud.editing && (
            <Field label="Giá dự thầu (triệu đồng, nếu khác giá trị HĐ)">
              <NumberInput
                value={crud.form.giaDuThau}
                onChange={(val) => crud.setForm({ ...crud.form, giaDuThau: val })}
                className={inputCls}
                placeholder="Mặc định lấy Giá trị HĐ"
              />
            </Field>
          )}
        </div>
      </FormSection>

      <FormSection title="Tài chính">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Giá trị HĐ (triệu đồng)">
            <NumberInput
              value={crud.form.giaTri}
              onChange={(val) => crud.setForm({ ...crud.form, giaTri: val })}
              className={inputCls}
            />
          </Field>

          {crud.editing && (
            <Field label="Đã thanh toán (triệu đồng)">
              <div className="rounded-lg border border-border bg-subtle px-3 py-2">
                <p className="font-mono text-sm font-bold text-ink">
                  {formatTrieu(crud.editing.daThanhToan)}
                </p>
                <p className="mt-0.5 text-2xs text-ink-muted">
                  Tự cộng từ các đợt đã có ngày thực thu — nhập ở tab “Thanh toán &amp; QT (Đ.11)”.
                </p>
              </div>
            </Field>
          )}
        </div>
      </FormSection>

      <FormSection title="Thời hạn & Tiến độ (Quy chế 2815)">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Ngày ký">
            <input
              type="date"
              value={crud.form.ngayKy}
              onChange={(e) => {
                const newNgayKy = e.target.value;
                let newHan = crud.form.hanHoanThanh;
                if (soNgayThucHien && newNgayKy) {
                  newHan = tinhHanHoanThanh(newNgayKy, soNgayThucHien);
                } else if (crud.form.hanHoanThanh && newNgayKy) {
                  const calculatedDays = tinhSoNgayThucHien(newNgayKy, crud.form.hanHoanThanh);
                  setSoNgayThucHien(calculatedDays);
                }
                crud.setForm({ ...crud.form, ngayKy: newNgayKy, hanHoanThanh: newHan });
              }}
              className={inputCls}
            />
          </Field>

          <Field label="Thời gian thực hiện (Số ngày ↔)">
            <div className="relative">
              <input
                type="number"
                min="1"
                placeholder="Vd: 90"
                value={soNgayThucHien}
                onChange={(e) => {
                  const val = e.target.value;
                  setSoNgayThucHien(val);
                  if (crud.form.ngayKy && val) {
                    const newHan = tinhHanHoanThanh(crud.form.ngayKy, val);
                    crud.setForm({ ...crud.form, hanHoanThanh: newHan });
                  }
                }}
                className={cn(inputCls, 'pr-12')}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-2xs font-bold text-ink-muted">
                ngày
              </span>
            </div>
          </Field>

          <Field label="Hạn hoàn thành (tự động ↔)">
            <input
              type="date"
              value={crud.form.hanHoanThanh}
              onChange={(e) => {
                const newHan = e.target.value;
                if (crud.form.ngayKy && newHan) {
                  const calculatedDays = tinhSoNgayThucHien(crud.form.ngayKy, newHan);
                  setSoNgayThucHien(calculatedDays);
                }
                crud.setForm({ ...crud.form, hanHoanThanh: newHan });
              }}
              className={inputCls}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3 pt-1">
          <Field label="Ngày nộp hồ sơ gốc về Viện">
            <input
              type="date"
              value={crud.form.ngayNopHoSo}
              onChange={(e) => crud.setForm({ ...crud.form, ngayNopHoSo: e.target.value })}
              className={inputCls}
            />
            {crud.form.ngayKy && (() => {
              const han = ngayHanNopHoSo(crud.form.ngayKy);
              return han ? (
                <p className="mt-1 text-2xs text-ink-muted">
                  Hạn nộp (Điều 6.3): <strong className="text-ink">{formatNgay(han.toISOString().slice(0, 10))}</strong>
                </p>
              ) : null;
            })()}
          </Field>

          <Field label="Hạn nộp chứng từ quyết toán (TCKT yêu cầu, nếu có)">
            <input
              type="date"
              value={crud.form.hanChungTuQuyetToan}
              onChange={(e) => crud.setForm({ ...crud.form, hanChungTuQuyetToan: e.target.value })}
              className={inputCls}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection title="Trường hợp đặc thù & Cấp ký hợp đồng (QC 2815)">
        <div className="grid grid-cols-2 gap-3">
          <Field label="Trường hợp đặc thù">
            <select
              value={crud.form.loaiDacThu}
              onChange={(e) => crud.setForm({ ...crud.form, loaiDacThu: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Không có --</option>
              {DAC_THU_OPTIONS.filter((d) => !crud.form.nhomHD || d.apDungNhom.includes(crud.form.nhomHD as any)).map((d) => (
                <option key={d.id} value={d.id} title={d.ghiChu}>{d.ten}</option>
              ))}
            </select>
          </Field>

          <Field label="Cấp ký hợp đồng (Điều 6.1)">
            <select
              value={crud.form.capKy}
              onChange={(e) => crud.setForm({ ...crud.form, capKy: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Chưa xác định --</option>
              {CAP_KY_OPTIONS.map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </select>
            {crud.form.nhomHD && (
              <p className="mt-1 text-2xs text-ink-muted">
                Tự chọn theo Nhóm HĐ (Điều 6.1) — đổi tay được nếu thực tế khác.
              </p>
            )}
          </Field>
        </div>

        {(() => {
          const canhBao = canhBaoCapKy(crud.form.nhomHD as any, crud.form.capKy as any);
          if (!canhBao) return null;
          return (
            <p className="flex items-start gap-1.5 rounded-lg bg-danger-subtle p-2.5 text-2xs font-semibold text-danger">
              <AlertCircle size={13} className="mt-px shrink-0" /> {canhBao}
            </p>
          );
        })()}

        <div className="grid grid-cols-2 gap-3 pt-1">
          <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
            <input
              type="checkbox"
              checked={crud.form.phanVienXa}
              onChange={(e) => crud.setForm({ ...crud.form, phanVienXa: e.target.checked })}
            />
            Phân viện/TT ở xa (+ hỗ trợ đi lại)
          </label>
          <label
            className={cn(
              'flex items-center gap-2 text-xs font-medium text-ink-secondary',
              crud.form.capKy === 'don-vi-ky' && 'opacity-50',
            )}
            title={
              crud.form.capKy === 'don-vi-ky'
                ? 'Chỉ áp dụng khi hợp đồng do Viện ký (Ghi chú 6 Bảng 1)'
                : undefined
            }
          >
            <input
              type="checkbox"
              disabled={crud.form.capKy === 'don-vi-ky'}
              checked={crud.form.giamTheoYeuCauDonVi}
              onChange={(e) => crud.setForm({ ...crud.form, giamTheoYeuCauDonVi: e.target.checked })}
            />
            Đơn vị tự yêu cầu Viện ký (giảm tỷ lệ giao khoán)
          </label>
          <label
            className="col-span-2 flex items-center gap-2 text-xs font-medium text-ink-secondary"
            title="Điều 6.1: buộc trình Viện trưởng bất kể giá trị; Điều 5.2b: P.KHKT là đầu mối phối hợp soạn HĐ"
          >
            <input
              type="checkbox"
              checked={crud.form.phucTap}
              onChange={(e) => crud.setForm({ ...crud.form, phucTap: e.target.checked })}
            />
            HĐ kỹ thuật phức tạp / tính chính trị / pháp lý quan trọng / Bộ giao (Đ.6.1 — buộc trình Viện trưởng)
          </label>
          <label
            className="col-span-2 flex items-center gap-2 text-xs font-medium text-ink-secondary"
            title="Điều 3.o: bắt buộc với HĐ tư vấn giám sát, tư vấn QLDA và thi công — Giám đốc đơn vị điều hành tập trung"
          >
            <input
              type="checkbox"
              checked={crud.form.quanLyTapTrung}
              onChange={(e) => crud.setForm({ ...crud.form, quanLyTapTrung: e.target.checked })}
            />
            HĐ theo mô hình quản lý tập trung tại đơn vị (Đ.3.o — TVGS / TVQLDA / thi công)
          </label>
        </div>

        {/* Nhánh ký giao việc suy ra từ các cờ trên — cho người nhập thấy ngay hệ quả (Đ.7.1c) */}
        <p className="mt-2 rounded-lg border border-border bg-subtle px-3 py-2 text-2xs text-ink-secondary">
          Luồng ký Quyết định giao việc sẽ đi{' '}
          <strong className="text-primary">
            nhánh {nhanhKyGiaoViec({
              capKy: (crud.form.capKy || null) as CapKy | null,
              phucTap: crud.form.phucTap,
              quanLyTapTrung: crud.form.quanLyTapTrung,
            })}
          </strong>{' '}
          —{' '}
          {DAC_TA_NHANH[nhanhKyGiaoViec({
            capKy: (crud.form.capKy || null) as CapKy | null,
            phucTap: crud.form.phucTap,
            quanLyTapTrung: crud.form.quanLyTapTrung,
          })].canCu}
        </p>

        {/* Đ.6.2 — nhắc ngay trong form khi chọn đơn vị ký mà đơn vị chưa có ủy quyền hiệu lực */}
        {crud.form.capKy === 'don-vi-ky' && crud.form.donViId && (
          <UyQuyenKyCanhBao key={`uq-${crud.form.donViId}`} donViId={crud.form.donViId} />
        )}
      </FormSection>

      {crud.editing && (
        <FormSection title="Đóng dấu sơ bộ & Phân công quản lý (Đ.8.2, Đ.8.3)">
          <label
            className="flex items-center gap-2 text-xs font-medium text-ink-secondary"
            title="Điều 8.2: hồ sơ kết quả chỉ được đóng dấu khi HĐ đã ký kết; nếu đang chờ thủ tục ký mà cần đóng dấu sơ bộ thì phải được Lãnh đạo Viện (HĐ Viện ký) hoặc Giám đốc đơn vị (HĐ đơn vị ký) chấp thuận"
          >
            <input
              type="checkbox"
              checked={crud.form.dongDauSoBo}
              onChange={(e) => crud.setForm({ ...crud.form, dongDauSoBo: e.target.checked })}
            />
            Đã được chấp thuận đóng dấu sơ bộ khi HĐ chưa ký đủ các bên (Đ.8.2)
          </label>

          {crud.form.dongDauSoBo && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              <Field label="Ngày chấp thuận đóng dấu sơ bộ">
                <input
                  type="date"
                  value={crud.form.ngayDongDauSoBo || ''}
                  onChange={(e) => crud.setForm({ ...crud.form, ngayDongDauSoBo: e.target.value })}
                  className={inputCls}
                />
              </Field>
              <Field label="Số văn bản chấp thuận">
                <input
                  value={crud.form.soVbChapThuanDauSoBo || ''}
                  onChange={(e) => crud.setForm({ ...crud.form, soVbChapThuanDauSoBo: e.target.value })}
                  className={inputCls}
                  placeholder="VD: 145/VKH-KHKT"
                />
              </Field>
            </div>
          )}

          <div className="mt-3">
            <Field label="Phó đơn vị được giao quản lý HĐ (Đ.8.3 — bắt buộc khi Trưởng đơn vị là chủ trì)">
              <select
                value={crud.form.phoDonViQuanLyId || ''}
                onChange={(e) => crud.setForm({ ...crud.form, phoDonViQuanLyId: e.target.value })}
                className={inputCls}
              >
                <option value="">-- Không áp dụng --</option>
                {nhanSuOptions.map((n) => (
                  <option key={n.id} value={n.id}>{n.ten}</option>
                ))}
              </select>
            </Field>
          </div>
        </FormSection>
      )}

      <FormSection title="📁 Tệp dự thảo Hợp đồng & Link Google Docs">
        <Field label="Link Google Docs / Drive / Cloud (Xem trực tuyến)">
          <input
            type="url"
            placeholder="https://docs.google.com/document/d/... hoặc link OneDrive / Drive"
            value={crud.form.fileDuThaoUrl || ''}
            onChange={(e) => crud.setForm({ ...crud.form, fileDuThaoUrl: e.target.value })}
            className={inputCls}
          />
          <p className="mt-1 text-[11px] text-ink-muted">
            Nhập liên kết Google Docs để ban quản lý & lãnh đạo chỉnh sửa và duyệt dự thảo trực tiếp.
          </p>
        </Field>

        <Field label="Hoặc Tải tệp dự thảo từ máy (PDF, DOCX, ZIP)">
          <div className="flex items-center gap-2">
            <input
              type="file"
              accept=".pdf,.doc,.docx,.zip"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  const blobUrl = URL.createObjectURL(file);
                  crud.setForm({
                    ...crud.form,
                    tenFileDuThao: file.name,
                    fileDuThaoUrl: crud.form.fileDuThaoUrl || blobUrl,
                  });
                }
              }}
              className="text-xs file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary-subtle file:text-primary hover:file:bg-primary-100 cursor-pointer"
            />
            {crud.form.tenFileDuThao && (
              <span className="text-xs text-emerald-600 font-semibold truncate max-w-[200px]">
                📎 {crud.form.tenFileDuThao}
              </span>
            )}
          </div>
        </Field>
      </FormSection>

      <Field label="Trạng thái">
        <select
          value={crud.form.trangThai}
          onChange={(e) => crud.setForm({ ...crud.form, trangThai: e.target.value as any })}
          className={inputCls}
        >
          {TRANG_THAI_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </Field>
    </form>
  );

  const buildFormFooter = () => (
    <>
      <button type="button" onClick={crud.closeModal} className="btn-ghost">
        Hủy
      </button>
      <button type="submit" form="hopdong-form" disabled={crud.saving} className="btn-primary">
        {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
        {crud.editing ? 'Cập nhật' : 'Thêm mới'}
      </button>
    </>
  );

  const EDIT_PANEL_ID = 'hopdong-form';

  // Mở/cập nhật panel form Thêm/Sửa theo trạng thái của useCrudForm — mở lên trên bất kỳ
  // panel nào đang có sẵn (vd. panel chi tiết) để tạo hiệu ứng xếp chồng "tai thỏ".
  // Luôn dùng openPanel (không phải updatePanel): panel form không bao giờ có gì mở
  // *trên* nó nên openPanel không rủi ro làm mất panel khác, và mỗi lần gõ phím —
  // `crud.form` luôn là object mới từ toForm()/setForm() — sẽ mở lại đúng vị trí nếu
  // panel từng bị đóng qua tai thỏ/backdrop/Esc thay vì qua nút Hủy.
  useEffect(() => {
    if (crud.modalOpen) {
      openPanel({
        id: EDIT_PANEL_ID,
        title: crud.editing ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới',
        subtitle: crud.editing ? crud.form.soHD : undefined,
        // Mặc định độ rộng 50% màn hình, người dùng có thể kéo co giãn tùy ý
        minWidth: 480,
        storageKey: 'slideover-width-hop-dong-form-v2',
        content: buildFormFields(),
        footer: buildFormFooter(),
      });
    } else {
      closePanel(EDIT_PANEL_ID);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [crud.modalOpen, crud.form, crud.editing, crud.saving, crud.actionError]);

  // Đồng bộ ngược: nếu panel form bị đóng bằng tai thỏ/backdrop/Esc (không qua nút Hủy),
  // `crud.modalOpen` vẫn còn true — cập nhật lại để lần bấm "Sửa" tiếp theo hoạt động đúng.
  useEffect(() => {
    if (crud.modalOpen && !stack.some((p) => p.id === EDIT_PANEL_ID)) {
      crud.closeModal();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stack]);

  return (
    <div>
      <PageHeader
        title={pageTitle}
        subtitle={pageSubtitle}
      />

      {/* Tabs Switcher theo chuẩn vòng đời hợp đồng — mỗi tab chỉ hiện khi có quyền xem tài nguyên tương ứng (Tầng 3) */}
      <div className="mb-6 flex flex-wrap gap-1.5 rounded-xl bg-muted p-1.5 w-full sm:w-fit border border-border">
        {tabHienDuoc('hop-dong-2815') && (
          <button
            onClick={() => setActiveTab('hop-dong-2815')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'hop-dong-2815'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )}
          >
            <Handshake size={15} /> 1. Hợp đồng kinh tế (QC 2815)
          </button>
        )}
        {tabHienDuoc('tai-chinh') && (
          <button
            onClick={() => setActiveTab('tai-chinh')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'tai-chinh'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )}
          >
            <Wallet size={15} /> 2. Tài chính & Thu chi
          </button>
        )}
        {tabHienDuoc('crm-khach-hang') && (
          <button
            onClick={() => setActiveTab('crm-khach-hang')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'crm-khach-hang'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )}
          >
            <Users2 size={15} /> {excludeTabs.includes('tai-chinh') ? '2. Khách hàng & CRM' : '3. Khách hàng & CRM'}
          </button>
        )}
        {tabHienDuoc('dau-thau') && (
          <button
            onClick={() => setActiveTab('dau-thau')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'dau-thau'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )}
          >
            <Gavel size={15} /> {excludeTabs.includes('tai-chinh') ? '3. Đấu thầu & Chào giá' : '4. Đấu thầu & Chào giá'}
          </button>
        )}
        {tabHienDuoc('pvqlnn') && (
          <button
            onClick={() => setActiveTab('pvqlnn')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'pvqlnn'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )}
          >
            <Landmark size={15} /> 5. Nhiệm vụ PVQLNN (N1b)
          </button>
        )}
        {tabHienDuoc('bao-cao-khkt') && (
          <button
            onClick={() => setActiveTab('bao-cao-khkt')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              activeTab === 'bao-cao-khkt'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink hover:bg-surface/50'
            )}
          >
            <BarChart3 size={15} /> {excludeTabs.includes('tai-chinh') ? '4. Báo cáo & Giám sát KHKT' : '6. Báo cáo & Giám sát KHKT'}
          </button>
        )}
      </div>

      {activeTab === 'tai-chinh' && tabHienDuoc('tai-chinh') && (
        <TaiChinhPage
          showHeader={false}
          onSelectHopDong={(hd) => openDetail(hd, 'tai-chinh')}
        />
      )}
      {activeTab === 'crm-khach-hang' && tabHienDuoc('crm-khach-hang') && <KhachHangPage />}
      {activeTab === 'dau-thau' && tabHienDuoc('dau-thau') && <DauThauPage showHeader={false} />}
      {activeTab === 'pvqlnn' && tabHienDuoc('pvqlnn') && <PvqlnnPage showHeader={false} />}
      {activeTab === 'bao-cao-khkt' && tabHienDuoc('bao-cao-khkt') && (
        <div className="space-y-6">
          <BaoCaoKhktPanel hopDongList={hopDongList} />
          <CanhBaoQuyChePanel hopDongList={hopDongList} />
          {/* Tích hợp Quản lý Ủy quyền Điều 5 QC 2815 */}
          <div className="pt-4 border-t border-border">
            <UyQuyenPage showHeader={false} />
          </div>
        </div>
      )}

      {activeTab === 'hop-dong-2815' && tabHienDuoc('hop-dong-2815') && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="TỔNG GIÁ TRỊ HĐ"
              value={formatTrieu(tongGiaTri)}
              icon={Handshake}
              tone="primary"
            />
            <KpiCard
              label="ĐÃ THANH TOÁN"
              value={formatTrieu(tongDaThanhToan)}
              icon={Banknote}
              tone="success"
            />
            <KpiCard
              label="SẮP HẾT HẠN (30 NGÀY)"
              value={String(sapHetHanCount)}
              icon={AlertTriangle}
              tone="warning"
            />
            <KpiCard
              label="CHỜ TRÌNH/DUYỆT VIỆN TRƯỞNG"
              value={String(choTrinhVienTruongCount)}
              icon={Gavel}
              tone="accent"
            />
          </div>

          {/* Quy chế 2815 Banner Alert */}
          <div className="mb-4 rounded-xl border border-primary-200/80 bg-primary-50/70 p-4 text-xs space-y-2.5 shadow-2xs transition-colors dark:border-slate-700/80 dark:bg-slate-900/80">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-sm font-bold text-primary-800 dark:text-sky-300">
                <CheckCircle2 size={18} className="text-primary-600 dark:text-sky-400 shrink-0" />
                <span>Khung Quy chế 2815/QĐ-VKH: Hạn mức Trình Viện trưởng Phê duyệt (Điều 6.1)</span>
              </span>
              <span className="inline-flex items-center gap-1 rounded-full bg-primary-600 dark:bg-primary-500/90 px-3 py-0.5 text-white text-2xs font-bold shadow-2xs">
                ⚡ Tự động kích hoạt luồng
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-0.5">
              <div className="flex items-center justify-between gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 hover:dark:border-slate-600 transition-colors">
                <span className="flex items-center gap-1.5 font-medium text-ink dark:text-slate-200">🏛️ Mọi HĐ Nhóm 1 (N1a, N1b)</span>
                <span className="rounded bg-primary-100 dark:bg-primary-900/50 px-2 py-0.5 text-2xs font-bold text-primary-800 dark:text-primary-200 whitespace-nowrap">bất kể giá trị</span>
              </div>
              <div className="flex items-center justify-between gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 hover:dark:border-slate-600 transition-colors">
                <span className="flex items-center gap-1.5 font-medium text-ink dark:text-slate-200">🔍 Kiểm định, hiện trạng (N1a)</span>
                <span className="rounded bg-amber-100 dark:bg-amber-950/60 px-2 py-0.5 text-2xs font-bold text-amber-800 dark:text-amber-300 whitespace-nowrap">&ge; 2,0 Tỷ VNĐ</span>
              </div>
              <div className="flex items-center justify-between gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 hover:dark:border-slate-600 transition-colors">
                <span className="flex items-center gap-1.5 font-medium text-ink dark:text-slate-200">📐 HĐ Tư vấn (Nhóm 2)</span>
                <span className="rounded bg-indigo-100 dark:bg-indigo-950/60 px-2 py-0.5 text-2xs font-bold text-indigo-800 dark:text-indigo-300 whitespace-nowrap">&ge; 5,0 Tỷ VNĐ</span>
              </div>
              <div className="flex items-center justify-between gap-1.5 rounded-lg border border-border bg-surface px-3 py-2 text-xs text-ink shadow-2xs dark:border-slate-700/80 dark:bg-slate-800/90 hover:dark:border-slate-600 transition-colors">
                <span className="flex items-center gap-1.5 font-medium text-ink dark:text-slate-200">🏗️ HĐ Thi công (Nhóm 3)</span>
                <span className="rounded bg-rose-100 dark:bg-rose-950/60 px-2 py-0.5 text-2xs font-bold text-rose-800 dark:text-rose-300 whitespace-nowrap">&ge; 10,0 Tỷ VNĐ</span>
              </div>
            </div>
          </div>

          <DataState loading={loading} error={error} empty={hopDongList.length === 0} />

          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <TableToolbar
              search={table.search}
              onSearch={table.setSearch}
              placeholder="Tìm theo số HĐ, tên, khách hàng..."
              total={table.total}
            >
              <FilterSelect
                value={filterTrangThai}
                onChange={setFilterTrangThai}
                allLabel="-- Trạng thái --"
                options={TRANG_THAI_OPTIONS}
              />
              <FilterSelect
                value={filterDonVi}
                onChange={setFilterDonVi}
                allLabel="-- Đơn vị --"
                options={donViOptions.map((d) => ({ value: d.id, label: d.ten }))}
              />
            </TableToolbar>
            <button onClick={crud.openCreate} className="btn-primary mb-3">
              + Thêm hợp đồng
            </button>
          </div>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              <table className="w-full min-w-[640px]">
                <thead className="thead-sticky">
                  <tr>
                    <th className="th-cell w-10 text-center">#</th>
                    <th className="th-cell">Số HĐ / Tên</th>
                    <th className="th-cell">Khách hàng</th>
                    <th className="th-cell">Đơn vị thực hiện</th>
                    <th className="th-cell">Chủ trì HĐ</th>
                    <th className="th-cell">Giá trị (triệu đ)</th>
                    <th className="th-cell">Bước quy trình</th>
                    <th className="th-cell min-w-[130px] whitespace-nowrap">Nhóm HĐ / Phê duyệt</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {table.filteredRows.map((hdItem, idx) => {
                    const hd = hdItem as HopDong;
                    const active = stack.some((p) => p.id === panelIdForHopDong(hd.id));
                    const dm = timDinhMuc(hd.nhomHD);
                    const isOverThreshold = canTrinhVienTruong(hd.nhomHD, hd.giaDuThau ?? hd.giaTri, hd.phucTap);
                    // Hợp đồng vừa vượt ngưỡng nhưng chưa từng được triage phê duyệt (cột DB vẫn ở giá trị mặc định) — hiển thị "Chờ trình" thay vì "Không áp dụng".
                    const trangThaiHienThi: TrangThaiPheDuyet =
                      isOverThreshold && hd.trangThaiPheDuyet === 'khong-ap-dung' ? 'chua-trinh' : hd.trangThaiPheDuyet;
                    return (
                      <tr
                        key={hd.id}
                        onClick={() => openDetail(hd, 'tong-quan')}
                        className={cn(
                          'tr-stripe cursor-pointer',
                          active && 'bg-primary-subtle/50 dark:bg-primary-900/20',
                        )}
                      >
                        <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
                        <td className="td-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink">{hd.soHD}</span>
                            {isOverThreshold && (
                              <span className="rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold" title="Hợp đồng lớn cần Trình Viện trưởng">
                                QC 2815 Trình VT
                              </span>
                            )}
                          </div>
                          <div className="line-clamp-1 text-2xs text-ink-muted">{hd.ten}</div>
                        </td>
                        <td className="td-cell text-ink-secondary">
                          {hd.khachHang || '—'}
                        </td>
                        <td className="td-cell text-ink font-medium text-xs">
                          {hd.donViThucHien ? (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-2xs font-semibold text-slate-700 dark:text-slate-300">
                              {hd.donViThucHien}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="td-cell text-ink-secondary text-xs">
                          {hd.chuTri ? (
                            <span className="inline-flex items-center gap-1 text-ink font-medium">
                              <User size={13} className="text-primary-500 shrink-0" />
                              {hd.chuTri}
                            </span>
                          ) : (
                            <span className="italic text-ink-muted text-2xs">Chưa phân công</span>
                          )}
                        </td>
                        <td className="td-cell font-bold text-ink">
                          {formatTrieu(hd.giaTri)}
                        </td>
                        <td className="td-cell">
                          {getBuocWorkflowBadge(hd.buocHienTai, hd.trangThai)}
                        </td>
                        <td className="td-cell">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {dm && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-2xs font-bold text-ink-secondary" title={dm.ten}>
                                {dm.id}
                              </span>
                            )}
                            {isOverThreshold && (
                              <span
                                className={cn('rounded px-1.5 py-0.5 text-2xs font-bold', PHE_DUYET_TONE[trangThaiHienThi])}
                                title="Vượt ngưỡng Điều 6.1 — cần trình Viện trưởng phê duyệt"
                              >
                                {PHE_DUYET_LABEL[trangThaiHienThi]}
                              </span>
                            )}
                          </div>
                          {isOverThreshold && (() => {
                            // 1 nút = bước kế tiếp của luồng Đ.6.1, chỉ hiện với vai trò đủ thẩm quyền.
                            const ke = buocPheDuyetKeTiep(trangThaiHienThi);
                            if (!ke) return null;
                            const duocPhep =
                              ke.kiemTraQuyen === 'duyet'
                                ? duocPheDuyet
                                : ke.kiemTraQuyen === 'khkt'
                                  ? coTheThamTraKhkt(vaiTro)
                                  : duocTrinhDuyet;
                            if (!duocPhep) return null;
                            return (
                              <div className="mt-1">
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void capNhatPheDuyet(hd, ke.den);
                                  }}
                                  disabled={pheDuyetBusyId === hd.id}
                                  className={cn(
                                    'rounded border px-1.5 py-0.5 text-2xs font-semibold disabled:opacity-50',
                                    ke.den === 'da-duyet'
                                      ? 'border-emerald-500/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20'
                                      : 'border-border text-ink-secondary hover:bg-muted',
                                  )}
                                >
                                  {ke.nhanNut}
                                </button>
                              </div>
                            );
                          })()}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openDetail(hd, 'giao-viec');
                            }}
                            className="btn-secondary inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 text-2xs font-semibold rounded whitespace-nowrap shadow-2xs"
                            title="Xem chi tiết & lập Phiếu giao việc (Điều 7 QC 2815)"
                          >
                            <FileText size={12} className="shrink-0 text-primary-600 dark:text-primary-400" />
                            <span>Phiếu giao việc</span>
                          </button>
                        </td>
                        <td className="td-cell text-right">
                          <RowActions
                            onEdit={() => crud.openEdit(hd)}
                            onDelete={() => crud.removeRow(hd)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </>
      )}

    </div>
  );
}

const EMPTY_GV_FORM: PhieuGiaoViecInput = { chuTriKyThuatId: '', kinhPhiGiao: '', noiDung: '', ngayGiao: '' };

function PhieuGiaoViecForm({
  hd,
  nhanSuOptions,
  donViOptions,
  onClose,
}: {
  hd: HopDong;
  nhanSuOptions: Option[];
  donViOptions: Option[];
  onClose?: () => void;
}) {
  // `loading` là bắt buộc: useAsyncData trả data = null trong lúc đang nạp, không phân biệt
  // được với "hợp đồng chưa có phiếu". Nếu bỏ qua nó, effect khởi tạo bên dưới sẽ chạy ngay
  // khi mở tab và upsert đè nội dung phiếu THẬT bằng chuỗi mặc định (mất dữ liệu).
  const { data: phieu, loading: dangTaiPhieu, refetch } = useAsyncData<PhieuGiaoViec | null>(
    () => fetchPhieuGiaoViec(hd.id),
    null,
  );
  // Phải nhớ (useMemo) — phanBoHopDong() trả về object mới mỗi lần gọi; nếu tính lại vô
  // điều kiện ở mỗi render thì effect bên dưới (đang có pb trong dependency) sẽ nhận diện
  // "pb đổi" ở MỌI render, kể cả render do chính effect đó gây ra qua setForm() — tạo vòng
  // lặp vô hạn (Maximum update depth exceeded) với các HĐ chưa có phiếu giao việc.
  const pb = useMemo(() => phanBoHopDong(hd.nhomHD, hd.giaTri || 0), [hd.nhomHD, hd.giaTri]);
  const [form, setForm] = useState<PhieuGiaoViecInput>(EMPTY_GV_FORM);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const { openPanel, closePanel } = useSlidePanel();

  useEffect(() => {
    if (loaded) return;
    // Chưa nạp xong thì chưa biết hợp đồng đã có phiếu hay chưa — không được khởi tạo vội.
    if (dangTaiPhieu) return;
    if (phieu) {
      setForm({
        chuTriKyThuatId: phieu.chuTriKyThuatId ?? '',
        kinhPhiGiao: String(phieu.kinhPhiGiao),
        noiDung: phieu.noiDung,
        ngayGiao: phieu.ngayGiao,
      });
      setLoaded(true);
    } else if (pb) {
      const initKinhPhi = String(Math.round(pb.tongGiaoDonVi));
      setForm((f) => ({ ...f, kinhPhiGiao: initKinhPhi }));
      // Tự động khởi tạo phiếu giao việc dự thảo ban đầu để hiển thị ngay bảng phân công cán bộ
      upsertPhieuGiaoViec(hd.id, {
        chuTriKyThuatId: '',
        kinhPhiGiao: initKinhPhi,
        noiDung: `Giao việc thực hiện hợp đồng ${hd.soHD || hd.ten || ''}`,
        ngayGiao: hd.ngayKy || new Date().toISOString().slice(0, 10),
      }).then(() => {
        void refetch();
        setLoaded(true);
      }).catch(() => {
        setLoaded(true);
      });
    }
  }, [phieu, dangTaiPhieu, loaded, pb, hd.id, hd.soHD, hd.ten, hd.ngayKy, refetch]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await upsertPhieuGiaoViec(hd.id, form);
      await refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const giaTriHD = hd.giaTri || 0;
  const dm = timDinhMuc(hd.nhomHD);
  const [phanTramKinhPhi, setPhanTramKinhPhi] = useState<string>('');

  useEffect(() => {
    if (form.kinhPhiGiao && giaTriHD > 0) {
      const pct = Math.round((Number(form.kinhPhiGiao) / giaTriHD) * 10000) / 100;
      setPhanTramKinhPhi(String(pct));
    } else if (dm?.chuTri != null) {
      setPhanTramKinhPhi(String(dm.chuTri));
    }
  }, [form.kinhPhiGiao, giaTriHD, dm?.chuTri]);

  const handlePhanTramChange = (valStr: string) => {
    setPhanTramKinhPhi(valStr);
    const pct = Number(valStr);
    if (!isNaN(pct) && giaTriHD > 0) {
      const calculatedKinhPhi = Math.round((giaTriHD * pct) / 100);
      setForm((prev) => ({ ...prev, kinhPhiGiao: String(calculatedKinhPhi) }));
    }
  };

  const handleKinhPhiGiaoChange = (valStr: string) => {
    setForm((prev) => ({ ...prev, kinhPhiGiao: valStr }));
    const val = Number(valStr);
    if (!isNaN(val) && giaTriHD > 0) {
      const pct = Math.round((val / giaTriHD) * 10000) / 100;
      setPhanTramKinhPhi(String(pct));
    }
  };

  const [showAllNhanSu, setShowAllNhanSu] = useState(false);

  const filteredNhanSuOptions = useMemo(() => {
    if (showAllNhanSu || !hd.donViId) return nhanSuOptions;
    const inUnit = nhanSuOptions.filter((n) => String(n.donViId) === String(hd.donViId));
    if (form.chuTriKyThuatId && !inUnit.some((n) => n.id === form.chuTriKyThuatId)) {
      const extra = nhanSuOptions.find((n) => n.id === form.chuTriKyThuatId);
      if (extra) inUnit.push(extra);
    }
    return inUnit.length > 0 ? inUnit : nhanSuOptions;
  }, [nhanSuOptions, hd.donViId, form.chuTriKyThuatId, showAllNhanSu]);

  const daKhoa = phieu?.trangThai === 'da-duyet';

  return (
    <div className="space-y-4">
      {daKhoa ? (
        // Điều 7.1c: phiếu đã phê duyệt là chốt cuối, có hiệu lực — không cho sửa trực tiếp
        // nữa (CSDL cũng chặn ở fn_kiem_soat_ky_giao_viec). Muốn thay đổi chủ trì/kinh phí
        // phải lập phiếu điều chỉnh mới theo đúng trình tự (Điều 7.1 Ghi chú).
        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 dark:border-emerald-900/40 dark:bg-emerald-950/20 p-3.5 text-xs space-y-2 text-emerald-900 dark:text-emerald-200">
          <p className="flex items-center gap-1.5 font-bold text-sm">
            <CheckCircle2 size={16} className="text-emerald-600" /> Phiếu giao việc đã phê duyệt — có hiệu lực chính thức (QC 2815)
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 text-[11px] bg-emerald-100/40 dark:bg-emerald-900/30 p-2.5 rounded-lg border border-emerald-200/50">
            <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Chủ trì kỹ thuật:</span> <br/><strong className="text-xs">{phieu?.chuTriKyThuat || 'Chưa phân công'}</strong></p>
            <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Đơn vị thực hiện:</span> <br/><strong className="text-xs">{hd.donViThucHien || 'Đơn vị thực hiện'}</strong></p>
            <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Kinh phí giao:</span> <br/><strong className="text-xs text-emerald-700 dark:text-emerald-300">{formatTrieu(Number(form.kinhPhiGiao) || 0)}</strong></p>
            <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Ngày giao:</span> <br/><strong>{formatNgay(form.ngayGiao)}</strong></p>
            {phieu?.nguoiSoan && (
              <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Người soạn phiếu:</span> <br/><strong>{phieu.nguoiSoan}</strong></p>
            )}
            {phieu?.nguoiDonViXacNhan && (
              <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Trưởng ĐV xác nhận:</span> <br/><strong>{phieu.nguoiDonViXacNhan}</strong></p>
            )}
            {phieu?.nguoiKhktThamTra && (
              <p><span className="text-emerald-700/70 dark:text-emerald-300/70">KHKT thẩm tra:</span> <br/><strong>{phieu.nguoiKhktThamTra}</strong></p>
            )}
            {phieu?.nguoiDuyet && (
              <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Người duyệt (Lãnh đạo Viện):</span> <br/><strong>{phieu.nguoiDuyet}</strong></p>
            )}
          </div>
          {form.noiDung && (
            <p><span className="text-emerald-700/70 dark:text-emerald-300/70">Nội dung công việc:</span> {form.noiDung}</p>
          )}
          {/* NÚT XEM TRƯỚC & IN PHIẾU GIAO VIỆC */}
          <button
            type="button"
            className="mt-2 flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-emerald-700 transition-colors"
            onClick={async () => {
              if (!phieu) return;
              try {
                const [dsCTV, dsDonVi] = await Promise.all([
                  fetchCtvGiaoViec(phieu.id),
                  fetchDonViGiaoViec(phieu.id),
                ]);
                const printData = { hd, phieu, dsCTV, dsDonVi };
                const previewHtml = sinhHtmlPhieuGiaoViec(printData, { preview: true });
                openPanel({
                  id: `pgv-preview-${hd.id}`,
                  title: 'Phiếu đề nghị giao việc',
                  subtitle: `${hd.soHD || hd.ten} — Xem trước bản in (NĐ 30)`,
                  defaultWidth: 720,
                  minWidth: 560,
                  maxWidth: 900,
                  content: (
                    <div className="flex flex-col h-full">
                      <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-subtle">
                        <span className="text-xs text-ink-muted font-medium">Xem trước — Format NĐ 30/2020/NĐ-CP</span>
                        <div className="flex gap-2">
                          <button
                            type="button"
                            className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
                            onClick={() => printPhieuGiaoViec(printData)}
                          >
                            <Printer size={13} /> In
                          </button>
                          <button
                            type="button"
                            className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-muted hover:bg-muted transition-colors"
                            onClick={() => closePanel(`pgv-preview-${hd.id}`)}
                          >
                            Đóng
                          </button>
                        </div>
                      </div>
                      <div className="flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-900 p-4">
                        <div className="mx-auto bg-white shadow-lg border border-neutral-200" style={{ maxWidth: 680, minHeight: 800 }}>
                          <iframe
                            title="Xem trước phiếu giao việc"
                            srcDoc={previewHtml}
                            className="w-full border-0"
                            style={{ minHeight: 900 }}
                          />
                        </div>
                      </div>
                    </div>
                  ),
                });
              } catch (e) {
                console.error('Lỗi tạo bản xem trước:', e);
              }
            }}
          >
            <Printer size={14} /> Xem trước & In Phiếu Giao Việc
          </button>
        </div>
      ) : (
        <>
          {/* Thẩm quyền Lập & Duyệt (Điều 7 QC 2815) - Thiết kế 1 dòng gọn gàng */}
          <div className="flex flex-wrap items-center justify-between gap-1.5 rounded-lg border border-sky-200 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20 px-3 py-1.5 text-2xs text-sky-900 dark:text-sky-200">
            <span className="flex items-center gap-1.5 font-bold">
              <Info size={13} className="text-sky-600 shrink-0" />
              Thẩm quyền lập & duyệt (Đ.7):
            </span>
            <span className="text-ink-secondary">
              Người lập: <strong>Trưởng ĐV / Chủ trì</strong> · Người duyệt: <strong>{hd.capKy === 'don-vi-ky' ? 'Trưởng đơn vị' : 'Lãnh đạo Viện'}</strong>
            </span>
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-surface p-4 shadow-2xs">
            <h4 className="text-xs font-bold uppercase tracking-wider text-ink border-b border-border-subtle pb-2">
              1. Thông tin giao việc & Chủ trì kỹ thuật
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Field label={`Chủ trì kỹ thuật (${hd.donViThucHien ? `thuộc ${hd.donViThucHien}` : 'Đơn vị thực hiện'})`}>
                <select
                  value={form.chuTriKyThuatId}
                  onChange={(e) => setForm({ ...form, chuTriKyThuatId: e.target.value })}
                  className={inputCls}
                >
                  <option value="">-- Chọn Chủ trì kỹ thuật --</option>
                  {filteredNhanSuOptions.map((n) => (
                    <option key={n.id} value={n.id}>{n.ten}</option>
                  ))}
                </select>
                {hd.donViId && (
                  <div className="mt-1 flex items-center justify-between text-[10px] text-ink-muted">
                    <span>🔒 Đã lọc {filteredNhanSuOptions.length} cán bộ thuộc Đơn vị</span>
                    <button
                      type="button"
                      onClick={() => setShowAllNhanSu(!showAllNhanSu)}
                      className="font-bold text-primary hover:underline"
                    >
                      {showAllNhanSu ? 'Chỉ hiện Đơn vị' : 'Hiện tất cả Viện'}
                    </button>
                  </div>
                )}
              </Field>

              <Field label="% Kinh phí giao HĐ">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5">
                    <input
                      type="number"
                      min={0}
                      max={100}
                      step={0.1}
                      placeholder="Ví dụ: 78"
                      value={phanTramKinhPhi}
                      onChange={(e) => handlePhanTramChange(e.target.value)}
                      className={inputCls}
                    />
                    <span className="text-xs font-bold text-ink-muted shrink-0">%</span>
                  </div>
                  {dm?.chuTri != null && (
                    <div className="flex flex-wrap gap-1">
                      <button
                        type="button"
                        onClick={() => handlePhanTramChange(String(dm.chuTri))}
                        className="rounded bg-emerald-100 dark:bg-emerald-900/60 px-1.5 py-0.5 text-[10px] font-bold text-emerald-900 dark:text-emerald-200 hover:bg-emerald-200"
                      >
                        Bảng 1 ({dm.chuTri}%)
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePhanTramChange('85')}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary hover:bg-subtle"
                      >
                        85%
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePhanTramChange('90')}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary hover:bg-subtle"
                      >
                        90%
                      </button>
                      <button
                        type="button"
                        onClick={() => handlePhanTramChange('100')}
                        className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-ink-secondary hover:bg-subtle"
                      >
                        100%
                      </button>
                    </div>
                  )}
                </div>
              </Field>

              <Field label="Kinh phí giao (triệu VNĐ)">
                <NumberInput
                  value={form.kinhPhiGiao}
                  onChange={(val) => handleKinhPhiGiaoChange(val)}
                  className={inputCls}
                />
              </Field>
            </div>

            {/* Điều 12.4a — đối chiếu kinh phí giao chủ trì với trần được phép giảm. */}
            {(() => {
              const kt = kiemTraKinhPhiChuTri(hd.nhomHD, hd.giaTri || 0, Number(form.kinhPhiGiao) || 0, {
                loaiDacThu: hd.loaiDacThu,
                phanVienXa: hd.phanVienXa,
                giamTheoYeuCauDonVi: hd.giamTheoYeuCauDonVi,
                capKy: hd.capKy,
              });
              if (!kt) return null;
              return (
                <div
                  className={cn(
                    'rounded-lg p-2.5 text-2xs space-y-0.5',
                    kt.hopLe ? 'bg-muted/50 text-ink-secondary' : 'bg-danger-subtle text-danger font-semibold',
                  )}
                >
                  <p>
                    Chuẩn Bảng 1 (cột 3): <strong>{formatTrieu(kt.mucChuan)}</strong> · Được giảm tối đa{' '}
                    <strong>{kt.tranGiamPhanTram}%</strong> giá trị HĐ → thấp nhất{' '}
                    <strong>{formatTrieu(kt.mucToiThieu)}</strong>
                  </p>
                  {kt.thongBao && (
                    <p className="flex items-start gap-1.5">
                      <AlertCircle size={12} className="mt-px shrink-0" /> {kt.thongBao}
                    </p>
                  )}
                </div>
              );
            })()}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2">
              <Field label="Ngày giao">
                <input
                  type="date"
                  value={form.ngayGiao}
                  onChange={(e) => setForm({ ...form, ngayGiao: e.target.value })}
                  className={inputCls}
                />
              </Field>

              <Field label="Nội dung công việc giao">
                <textarea
                  value={form.noiDung}
                  onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
                  className={inputCls}
                  rows={2}
                />
              </Field>
            </div>
          </div>
        </>
      )}

      {/* Bảng Đơn vị thực hiện & Bảng Cán bộ thực hiện LUÔN HIỂN THỊ DÙ LÀ DỰ THẢO HAY ĐÃ PHÊ DUYỆT */}
      {phieu && (
        <div className="space-y-4 pt-2">
          <DonViGiaoViecPanel
            phieuGiaoViecId={phieu.id}
            donViOptions={donViOptions}
            giaTriHopDong={hd.giaTri || 0}
            readOnly={daKhoa}
          />
          <CtvGiaoViecPanel
            phieuGiaoViecId={phieu.id}
            nhanSuOptions={filteredNhanSuOptions}
            kinhPhiGiao={Number(form.kinhPhiGiao) || 0}
            readOnly={daKhoa}
          />
        </div>
      )}

      {/* Luồng ký quyết định giao việc (Điều 7.1c) nếu chưa khóa */}
      {!daKhoa && phieu && (
        <ThanhKyGiaoViec
          phieu={phieu}
          capKy={hd.capKy}
          phucTap={hd.phucTap}
          quanLyTapTrung={hd.quanLyTapTrung}
          onChanged={refetch}
        />
      )}

      {err && <p className="text-2xs font-semibold text-danger">{err}</p>}

      {/* NÚT LƯU PHIẾU GIAO VIỆC DƯỚI CÙNG (khi đang chỉnh sửa) */}
      {!daKhoa && (
        <div className="sticky bottom-0 z-20 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-primary/30 bg-surface/95 p-3.5 shadow-md backdrop-blur-md">
          <div className="text-xs text-ink-muted">
            <p className="font-bold text-ink">✓ Đã hoàn tất chọn thông tin giao việc, đơn vị & cán bộ thực hiện</p>
            <p className="text-[11px]">Bấm nút bên phải để lưu thông tin Phiếu giao việc vào CSDL (Điều 7 QC 2815)</p>
          </div>
          <div className="flex items-center gap-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="rounded-xl border border-border px-4 py-2 text-xs font-bold text-ink-muted hover:bg-muted"
              >
                Đóng
              </button>
            )}
            <button
              type="button"
              onClick={save}
              disabled={saving}
              className="btn-primary"
            >
              {saving ? 'Đang lưu...' : 'Lưu Phiếu Giao Việc (Mẫu 02-GV)'}
            </button>
            {phieu && (
              <button
                type="button"
                className="flex items-center gap-1 rounded-xl border border-border px-3 py-2 text-xs font-bold text-ink-muted hover:bg-muted transition-colors"
                onClick={async () => {
                  try {
                    const [dsCTV, dsDonVi] = await Promise.all([
                      fetchCtvGiaoViec(phieu.id),
                      fetchDonViGiaoViec(phieu.id),
                    ]);
                    const printData = { hd, phieu, dsCTV, dsDonVi };
                    const previewHtml = sinhHtmlPhieuGiaoViec(printData, { preview: true });
                    openPanel({
                      id: `pgv-preview-${hd.id}`,
                      title: 'Phiếu đề nghị giao việc (Dự thảo)',
                      subtitle: `${hd.soHD || hd.ten} — Xem trước bản in (NĐ 30)`,
                      defaultWidth: 720,
                      minWidth: 560,
                      maxWidth: 900,
                      content: (
                        <div className="flex flex-col h-full">
                          <div className="flex items-center justify-between px-4 py-2 border-b border-border bg-subtle">
                            <span className="text-xs text-ink-muted font-medium">Xem trước — Format NĐ 30/2020/NĐ-CP</span>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                className="flex items-center gap-1 rounded-lg bg-primary px-3 py-1.5 text-xs font-bold text-white shadow-sm hover:bg-primary/90 transition-colors"
                                onClick={() => printPhieuGiaoViec(printData)}
                              >
                                <Printer size={13} /> In
                              </button>
                              <button
                                type="button"
                                className="rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-muted hover:bg-muted transition-colors"
                                onClick={() => closePanel(`pgv-preview-${hd.id}`)}
                              >
                                Đóng
                              </button>
                            </div>
                          </div>
                          <div className="flex-1 overflow-auto bg-neutral-100 dark:bg-neutral-900 p-4">
                            <div className="mx-auto bg-white shadow-lg border border-neutral-200" style={{ maxWidth: 680, minHeight: 800 }}>
                              <iframe
                                title="Xem trước phiếu giao việc"
                                srcDoc={previewHtml}
                                className="w-full border-0"
                                style={{ minHeight: 900 }}
                              />
                            </div>
                          </div>
                        </div>
                      ),
                    });
                  } catch (e) {
                    console.error('Lỗi tạo bản xem trước:', e);
                  }
                }}
              >
                <Printer size={13} /> Xem trước & In
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ FORM THÊM/SỬA HỢP ĐỒNG — nhóm trường theo section ═══

function FormSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-3 rounded-xl border border-border bg-subtle/30 p-4">
      <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">{title}</h4>
      {children}
    </div>
  );
}

// ═══ ACCORDION SECTION — dùng để gom sub-section trong tab gộp ═══

function DetailSection({
  title,
  icon: Icon,
  defaultOpen = false,
  badge,
  tone = 'default',
  children,
}: {
  title: string;
  icon: any;
  defaultOpen?: boolean;
  badge?: ReactNode;
  tone?: 'default' | 'danger' | 'warning' | 'info';
  children: ReactNode;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const borderTone =
    tone === 'danger'
      ? 'border-danger/40 bg-danger-subtle/10'
      : tone === 'warning'
      ? 'border-amber-300 dark:border-amber-700 bg-amber-50/20 dark:bg-amber-950/20'
      : tone === 'info'
      ? 'border-sky-300 dark:border-sky-800 bg-sky-50/20 dark:bg-sky-950/20'
      : 'border-border bg-surface';

  return (
    <div className={cn('rounded-xl border shadow-2xs overflow-hidden transition-all', borderTone)}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-2 px-3.5 py-2.5 text-left hover:bg-muted/50 transition-colors"
      >
        <span className="flex items-center gap-2 text-xs font-bold text-ink">
          <Icon
            size={15}
            className={cn(
              tone === 'danger'
                ? 'text-danger'
                : tone === 'warning'
                ? 'text-amber-600'
                : 'text-ink-muted',
            )}
          />
          <span>{title}</span>
          {badge}
        </span>
        <ChevronDown
          size={14}
          className={cn('text-ink-muted transition-transform duration-200', open && 'rotate-180')}
        />
      </button>
      {open && <div className="border-t border-border-subtle p-3.5 space-y-3">{children}</div>}
    </div>
  );
}

// ═══ TAB "THÔNG TIN CHUNG" — SlideOver chi tiết hợp đồng ═══

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-2xs font-black uppercase tracking-wider text-ink-muted">{label}</p>
      <p className="mt-0.5 text-xs font-medium text-ink">{value}</p>
    </div>
  );
}

function MiniStat({ label, value, tone }: { label: string; value: string; tone?: 'success' | 'warning' }) {
  return (
    <div className="rounded-lg border border-border p-2.5 text-center">
      <p className="text-2xs font-black uppercase tracking-wider text-ink-muted">{label}</p>
      <p
        className={cn(
          'mt-1 text-sm font-bold',
          tone === 'success' && 'text-success',
          tone === 'warning' && 'text-warning',
          !tone && 'text-ink',
        )}
      >
        {value}
      </p>
    </div>
  );
}

/** Đ.6.2 — Cảnh báo/khẳng định ủy quyền ký HĐ còn hiệu lực khi hợp đồng do đơn vị ký. */
function UyQuyenKyCanhBao({ donViId }: { donViId: string }) {
  const { data: uyQuyens, loading } = useAsyncData(() => fetchUyQuyenKyHopDong(donViId), []);
  if (loading) return null;
  if (uyQuyens.length > 0) {
    const uq = uyQuyens[0];
    return (
      <div className="rounded-lg border border-emerald-500/25 bg-emerald-50/50 dark:bg-emerald-900/10 p-2.5 text-2xs text-emerald-800 dark:text-emerald-300">
        <span className="font-bold">✓ Đ.6.2 — Ủy quyền ký hợp lệ:</span> {uq.nguoiDuocUyQuyen}
        {uq.soQuyetDinh && <> (QĐ {uq.soQuyetDinh})</>}
        {uq.denNgay ? <>, hiệu lực đến {formatNgay(uq.denNgay)}.</> : ', không giới hạn thời hạn.'}
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-50/60 dark:bg-amber-900/10 p-2.5 text-2xs text-amber-800 dark:text-amber-300">
      <span className="font-bold">⚠ Đ.6.2 — Chưa có ủy quyền ký HĐ còn hiệu lực</span> cho đơn vị thực hiện.
      Cần ủy quyền chung hàng năm hoặc lập ủy quyền riêng để P.KHKT trình Viện trưởng ký — quản lý tại mục{' '}
      <a href="/uy-quyen" className="font-bold underline">Ủy quyền</a>.
    </div>
  );
}

/** Đ.7.4/7.5 — Tóm tắt chứng chỉ năng lực của nhân sự được chọn làm chủ trì (đối chiếu tự động). */
function ChungChiTomTat({ nhanSuId }: { nhanSuId: string }) {
  const { data: chungChis, loading } = useAsyncData(() => fetchChungChiTheoNhanSu(nhanSuId), []);
  if (loading || !nhanSuId) return null;
  if (chungChis.length === 0) {
    return (
      <p className="mt-1 flex items-start gap-1.5 rounded-lg bg-amber-50/60 dark:bg-amber-900/10 p-2 text-2xs font-semibold text-amber-800 dark:text-amber-300">
        <AlertCircle size={12} className="mt-px shrink-0" />
        Đ.7.4: nhân sự này chưa có chứng chỉ năng lực/hành nghề trong hồ sơ — kiểm tra trước khi giao chủ trì.
      </p>
    );
  }
  const today = new Date().toISOString().slice(0, 10);
  return (
    <div className="mt-1 space-y-0.5">
      {chungChis.slice(0, 3).map((cc) => {
        const hetHan = !!cc.ngayHetHan && cc.ngayHetHan < today;
        return (
          <p
            key={cc.id}
            className={cn(
              'text-2xs',
              hetHan ? 'font-semibold text-danger' : 'text-ink-muted',
            )}
          >
            {hetHan ? '⚠' : '✓'} {cc.tenLinhVuc}
            {cc.hang && <> ({cc.hang})</>}
            {cc.ngayHetHan && <> — {hetHan ? 'HẾT HẠN' : 'hạn'} {formatNgay(cc.ngayHetHan)}</>}
          </p>
        );
      })}
      {chungChis.length > 3 && <p className="text-2xs text-ink-muted">… và {chungChis.length - 3} chứng chỉ khác</p>}
    </div>
  );
}

// ═══ KHUNG THÀNH VIÊN THAM GIA THỰC HIỆN HỢP ĐỒNG (ĐIỀU 7) ═══

function ThanhVienHopDongSection({
  hd,
  onGoToGiaoViec,
}: {
  hd: HopDong;
  onGoToGiaoViec?: () => void;
}) {
  const { data: phieu } = useAsyncData<PhieuGiaoViec | null>(() => fetchPhieuGiaoViec(hd.id), null);
  const { data: ctvList } = useAsyncData<CtvGiaoViec[]>(
    () => (phieu ? fetchCtvGiaoViec(phieu.id) : Promise.resolve([])),
    [],
  );

  const chuTriHD = hd.chuTri || 'Chưa phân công';
  const chuTriKyThuat = phieu?.chuTriKyThuat || 'Chưa phân công (Phiếu giao việc)';

  return (
    <div className="rounded-xl border border-border bg-surface p-3.5 space-y-3 shadow-2xs">
      <div className="flex items-center justify-between">
        <h4 className="flex items-center gap-2 text-xs font-bold text-ink">
          <Users size={16} className="text-primary" /> Thành viên tham gia thực hiện (Điều 7 - Phiếu giao việc)
        </h4>
        {onGoToGiaoViec && (
          <button
            type="button"
            onClick={onGoToGiaoViec}
            className="flex items-center gap-1 text-[11px] font-bold text-primary hover:underline"
          >
            <ListChecks size={12} /> Chi tiết Giao việc & CTV
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
        {/* Chủ trì Hợp đồng */}
        <div className="flex items-center gap-2.5 rounded-lg border border-purple-200 bg-purple-50/50 dark:border-purple-900/30 dark:bg-purple-950/20 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-purple-600 text-white font-bold text-xs shadow-2xs">
            {chuTriHD.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <span className="inline-flex rounded bg-purple-200/80 dark:bg-purple-900/60 px-1.5 py-0.5 text-[9px] font-bold text-purple-900 dark:text-purple-200 uppercase">
              Chủ trì Hợp đồng
            </span>
            <p className="mt-0.5 text-xs font-bold text-ink truncate">{chuTriHD}</p>
          </div>
        </div>

        {/* Chủ trì Kỹ thuật (Phiếu giao việc) */}
        <div className="flex items-center gap-2.5 rounded-lg border border-sky-200 bg-sky-50/50 dark:border-sky-900/30 dark:bg-sky-950/20 p-2.5">
          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-sky-600 text-white font-bold text-xs shadow-2xs">
            {chuTriKyThuat.slice(0, 1)}
          </div>
          <div className="min-w-0">
            <span className="inline-flex rounded bg-sky-200/80 dark:bg-sky-900/60 px-1.5 py-0.5 text-[9px] font-bold text-sky-900 dark:text-sky-200 uppercase">
              Chủ trì Kỹ thuật (Giao việc)
            </span>
            <p className="mt-0.5 text-xs font-bold text-ink truncate">{chuTriKyThuat}</p>
          </div>
        </div>
      </div>

      {/* Danh sách cán bộ / cộng tác viên phối hợp */}
      <div className="pt-1">
        <p className="text-[10px] font-bold uppercase tracking-wider text-ink-muted mb-1.5">
          Cán bộ / Cộng tác viên chuyên môn phối hợp ({ctvList?.length || 0}):
        </p>

        {ctvList && ctvList.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {ctvList.map((ctv) => (
              <div
                key={ctv.id}
                className="flex items-center gap-2 rounded-lg border border-border bg-subtle/50 px-2.5 py-1.5 text-xs"
              >
                <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary-100 text-primary-700 text-[10px] font-bold">
                  {ctv.hoTen.slice(0, 1)}
                </div>
                <span className="font-semibold text-ink-primary">{ctv.hoTen}</span>
                {ctv.tyLePhanChia > 0 && (
                  <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.2 text-[10px] font-bold">
                    {ctv.tyLePhanChia}%
                  </span>
                )}
                {ctv.ghiChu && <span className="text-[10px] text-ink-muted italic">({ctv.ghiChu})</span>}
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-between rounded-lg border border-dashed border-border p-2.5 text-xs text-ink-muted">
            <span>Chưa bổ sung danh sách cộng tác viên phối hợp theo Phiếu giao việc.</span>
            {onGoToGiaoViec && (
              <button
                type="button"
                onClick={onGoToGiaoViec}
                className="rounded bg-primary-subtle px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary-100 dark:bg-primary-900/40 dark:text-primary-300 dark:hover:bg-primary-900/60"
              >
                + Phân công ngay
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══ BẢNG PHÂN BỔ KINH PHÍ TỰ ĐỘNG THEO BẢNG 1 (ĐIỀU 12 QC 2815) ═══

function BangPhanBoKinhPhiSection({ hd }: { hd: HopDong }) {
  const dm = timDinhMuc(hd.nhomHD);
  const pb = hd.nhomHD
    ? phanBoHopDong(hd.nhomHD, hd.giaTri || 0, {
        loaiDacThu: hd.loaiDacThu,
        phanVienXa: hd.phanVienXa,
        giamTheoYeuCauDonVi: hd.giamTheoYeuCauDonVi,
        capKy: hd.capKy,
      })
    : null;

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-2xs text-xs">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
        <h4 className="flex items-center gap-2 text-xs font-bold text-ink uppercase tracking-wider">
          <BarChart3 size={16} className="text-emerald-600 dark:text-emerald-400" /> Bảng phân bổ kinh phí tự động (Bảng 1 QC 2815 — Điều 12)
        </h4>
        {dm && (
          <span className="rounded-full bg-emerald-100 dark:bg-emerald-900/60 text-emerald-900 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 px-3 py-0.5 text-2xs font-bold">
            {dm.id} — {dm.ten}
          </span>
        )}
      </div>

      {!hd.nhomHD ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50/70 dark:border-amber-900/40 dark:bg-amber-950/30 p-3 text-amber-900 dark:text-amber-200 text-2xs space-y-1">
          <p className="font-bold flex items-center gap-1.5"><AlertTriangle size={14} className="text-amber-600" /> Chưa chọn Nhóm hợp đồng QC 2815</p>
          <p>Bấm nút <strong>"Sửa"</strong> ở góc trên bên phải để chọn phân nhóm Bảng 1 (Nhóm 2A, 2B, 2D, 3...). Hệ thống sẽ tự động tính toán chi tiết tỷ lệ và số tiền phân bổ kinh phí giao Đơn vị & nộp Viện.</p>
        </div>
      ) : !pb ? (
        <div className="rounded-lg border border-sky-200 bg-sky-50/70 dark:border-sky-900/40 dark:bg-sky-950/30 p-3 text-sky-900 dark:text-sky-200 text-2xs space-y-1">
          <p className="font-bold flex items-center gap-1.5"><Info size={14} className="text-sky-600" /> Nhóm {dm?.id}: Thực thanh thực chi (Điều 12.2)</p>
          <p>{dm?.ten}: thanh toán theo nguyên tắc <strong>thực thanh, thực chi</strong> phù hợp dự toán được duyệt — không áp dụng bảng phân bổ tỷ lệ cố định.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pb.ghiChuDacThu.length > 0 && (
            <div className="rounded-lg bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800 p-2.5 text-2xs text-sky-900 dark:text-sky-200 space-y-1">
              {pb.ghiChuDacThu.map((g, i) => (
                <p key={i} className="font-semibold flex items-center gap-1.5">⚑ Trường hợp đặc thù: {g}</p>
              ))}
            </div>
          )}

          <div className="overflow-x-auto rounded-lg border border-border">
            <table className="w-full text-xs text-left">
              <thead className="bg-subtle text-ink-muted text-2xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="p-2.5">Nội dung khoản mục</th>
                  <th className="p-2.5 text-center">Tỷ lệ %</th>
                  <th className="p-2.5 text-right">Giá trị (triệu VNĐ)</th>
                  <th className="p-2.5">Quy chế 2815 đối chiếu</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle font-medium text-ink">
                {/* 1. Kinh phí giao chủ trì HĐ */}
                {pb.chuTri != null && dm?.chuTri != null && (
                  <tr>
                    <td className="p-2.5 pl-4 font-semibold text-ink">Kinh phí giao Chủ trì HĐ</td>
                    <td className="p-2.5 text-center font-bold text-ink-secondary">{dm.chuTri}%</td>
                    <td className="p-2.5 text-right font-bold text-ink">{formatTrieu(pb.chuTri)}</td>
                    <td className="p-2.5 text-2xs text-ink-muted">Chi trực tiếp nhân công, máy móc, vật liệu (Đ.12.4a)</td>
                  </tr>
                )}

                {/* 2. Chi phí quản lý tại Đơn vị */}
                {pb.donVi != null && dm?.donVi != null && (
                  <tr>
                    <td className="p-2.5 pl-4 font-semibold text-ink">Chi phí quản lý tại Đơn vị</td>
                    <td className="p-2.5 text-center font-bold text-ink-secondary">{dm.donVi}%</td>
                    <td className="p-2.5 text-right font-bold text-ink">{formatTrieu(pb.donVi)}</td>
                    <td className="p-2.5 text-2xs text-ink-muted">Chi lương VCNLĐ, điện nước, quản lý ĐV (Đ.12.4a)</td>
                  </tr>
                )}

                {/* 3. TỔNG KINH PHÍ GIAO ĐƠN VỊ */}
                <tr className="bg-emerald-50/60 dark:bg-emerald-950/40 font-bold text-emerald-900 dark:text-emerald-200">
                  <td className="p-2.5">TỔNG KINH PHÍ GIAO ĐƠN VỊ (Cột 5)</td>
                  <td className="p-2.5 text-center">{dm?.tongGiaoDonVi}%</td>
                  <td className="p-2.5 text-right text-emerald-700 dark:text-emerald-300 font-black">{formatTrieu(pb.tongGiaoDonVi)}</td>
                  <td className="p-2.5 text-2xs font-semibold text-emerald-800 dark:text-emerald-300">Đơn vị thực hiện quản lý & tự chủ quyết toán</td>
                </tr>

                {/* 4. Chi phí quản lý & Lợi nhuận Viện */}
                <tr>
                  <td className="p-2.5 pl-4 text-ink-secondary">Chi phí quản lý & Lợi nhuận Viện</td>
                  <td className="p-2.5 text-center text-ink-muted">{dm?.cpqlLnChiKhac}%</td>
                  <td className="p-2.5 text-right font-semibold text-primary">{formatTrieu(pb.cpqlLnChiKhac)}</td>
                  <td className="p-2.5 text-2xs text-ink-muted">Trích nộp Quỹ quản lý tập trung Viện (Cột 6)</td>
                </tr>

                {/* 5. Khấu hao Tài sản cố định Viện */}
                <tr>
                  <td className="p-2.5 pl-4 text-ink-secondary">Khấu hao Tài sản cố định Viện</td>
                  <td className="p-2.5 text-center text-ink-muted">{dm?.khtscd}%</td>
                  <td className="p-2.5 text-right font-semibold text-ink-secondary">{formatTrieu(pb.khtscd)}</td>
                  <td className="p-2.5 text-2xs text-ink-muted">Trích Quỹ khấu hao tài sản Viện (Cột 7)</td>
                </tr>

                {/* 6. TỔNG KINH PHÍ NỘP VIỆN */}
                <tr className="bg-purple-50/60 dark:bg-purple-950/40 font-bold text-purple-900 dark:text-purple-200">
                  <td className="p-2.5">TỔNG KINH PHÍ NỘP VIỆN</td>
                  <td className="p-2.5 text-center">{100 - (dm?.tongGiaoDonVi || 0)}%</td>
                  <td className="p-2.5 text-right text-purple-700 dark:text-purple-300 font-black">{formatTrieu(Math.max(0, (hd.giaTri || 0) - pb.tongGiaoDonVi))}</td>
                  <td className="p-2.5 text-2xs font-semibold text-purple-800 dark:text-purple-300">Phòng TCKT Viện hạch toán & thu hồi</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function HopDongThongTinTab({
  hd,
  pheDuyetBusyId,
  onPheDuyet,
  onRefetch,
  onGoToGiaoViec,
}: {
  hd: HopDong;
  pheDuyetBusyId: string | null;
  onPheDuyet: (hd: HopDong, trangThai: TrangThaiPheDuyet) => void;
  onRefetch?: () => void;
  onGoToGiaoViec?: () => void;
}) {
  const { vaiTro } = useAuth();
  const duocTrinhDuyet = coTheTrinhDuyet(vaiTro);
  const duocPheDuyet = coThePheDuyet(vaiTro);
  const isOverThreshold = canTrinhVienTruong(hd.nhomHD, hd.giaDuThau ?? hd.giaTri, hd.phucTap);
  const trangThaiHienThi: TrangThaiPheDuyet =
    isOverThreshold && hd.trangThaiPheDuyet === 'khong-ap-dung' ? 'chua-trinh' : hd.trangThaiPheDuyet;
  const dm = timDinhMuc(hd.nhomHD);

  // Tính toán các cảnh báo Quy chế 2815 tập trung cho hợp đồng
  const canhBaoNopHoSo = canhBaoPhatNopChamHoSo(hd.nhomHD, hd.ngayKy, hd.ngayNopHoSo);
  const canhBaoChungTu = canhBaoPhatChungTuTre(
    hd.nhomHD,
    hd.hanChungTuQuyetToan,
    hd.trangThaiQuyetToan === 'da-quyet-toan',
  );
  const canhBaoKy = canhBaoCapKy(hd.nhomHD, hd.capKy);
  const tongSoCanhBao = (canhBaoNopHoSo ? 1 : 0) + (canhBaoChungTu ? 1 : 0) + (canhBaoKy ? 1 : 0);

  const phanTramThu = Math.min(100, Math.round(((hd.daThanhToan || 0) / (hd.giaTri || 1)) * 100));

  return (
    <div className="space-y-4">
      {/* ═══ 1. TOP DASHBOARD: 3 KPI CARDS TÀI CHÍNH & TIẾN ĐỘ THU TIỀN ═══ */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Card 1: Giá trị HĐ */}
        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Giá trị hợp đồng</span>
            <Banknote size={16} className="text-primary" />
          </div>
          <p className="text-xl font-black text-ink">{formatTrieu(hd.giaTri)}</p>
          <div className="flex items-center gap-1.5 text-2xs text-ink-muted">
            {dm ? (
              <span className="inline-flex items-center rounded bg-primary-subtle px-1.5 py-0.5 font-bold text-primary dark:bg-primary-900/40 dark:text-primary-300">
                {dm.id} — {dm.ten}
              </span>
            ) : (
              <span className="italic text-amber-600">Chưa phân nhóm QC</span>
            )}
          </div>
        </div>

        {/* Card 2: Đã thanh toán */}
        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Đã thanh toán</span>
            <span className="text-2xs font-bold text-success">{phanTramThu}%</span>
          </div>
          <p className="text-xl font-black text-success">{formatTrieu(hd.daThanhToan)}</p>
          {/* Progress bar */}
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-success transition-all duration-300"
              style={{ width: `${phanTramThu}%` }}
            />
          </div>
        </div>

        {/* Card 3: Còn phải thu */}
        <div className="rounded-xl border border-border bg-surface p-3.5 shadow-2xs space-y-1.5">
          <div className="flex items-center justify-between text-ink-muted">
            <span className="text-[11px] font-bold uppercase tracking-wider">Còn phải thu</span>
            <Wallet size={16} className={hd.giaTri > hd.daThanhToan ? 'text-amber-500' : 'text-success'} />
          </div>
          <p
            className={cn(
              'text-xl font-black',
              hd.giaTri > hd.daThanhToan ? 'text-amber-600 dark:text-amber-400' : 'text-success',
            )}
          >
            {formatTrieu(Math.max(0, hd.giaTri - hd.daThanhToan))}
          </p>
          <p className="text-2xs text-ink-muted">
            {hd.trangThaiQuyetToan === 'da-quyet-toan' ? (
              <span className="font-semibold text-success">✓ Đã quyết toán xong</span>
            ) : hd.daThanhToan >= hd.giaTri && hd.giaTri > 0 ? (
              <span className="font-semibold text-success">Đã thu đủ 100%</span>
            ) : (
              <span>Chưa thu đủ ({100 - phanTramThu}% còn lại)</span>
            )}
          </p>
        </div>
      </div>

      {/* ═══ 2. THÔNG TIN HỢP ĐỒNG & ĐIỀU HÀNH (2 CỘT GỌN GÀNG) ═══ */}
      <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border-subtle pb-2.5">
          <div className="flex items-center gap-2">
            <StatusBadge value={hd.trangThai} />
            <span className="text-xs font-bold text-ink">Thông tin hợp đồng & Điều hành</span>
          </div>
          {hd.capKy && (
            <span className="rounded-md border border-border px-2 py-0.5 text-2xs font-semibold text-ink-secondary">
              {CAP_KY_OPTIONS.find((c) => c.value === hd.capKy)?.label || hd.capKy}
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
          {/* Cột trái: Pháp lý & Thời gian */}
          <div className="space-y-2.5">
            <InfoField label="Khách hàng" value={hd.khachHang || '—'} />
            <InfoField label="Đơn vị thực hiện" value={hd.donViThucHien || '—'} />
            <div className="grid grid-cols-2 gap-2">
              <InfoField label="Ngày ký" value={hd.ngayKy ? formatNgay(hd.ngayKy) : '—'} />
              <InfoField label="Hạn hoàn thành" value={hd.hanHoanThanh ? formatNgay(hd.hanHoanThanh) : '—'} />
            </div>
            <InfoField
              label="Thời gian thực hiện"
              value={
                hd.ngayKy && hd.hanHoanThanh
                  ? `${tinhSoNgayThucHien(hd.ngayKy, hd.hanHoanThanh)} ngày`
                  : '—'
              }
            />
          </div>

          {/* Cột phải: Quản lý & Dự toán */}
          <div className="space-y-2.5">
            <InfoField label="Chủ trì hợp đồng" value={hd.chuTri || '— Chưa phân công —'} />
            <div className="grid grid-cols-2 gap-2">
              <InfoField
                label="Giá dự thầu"
                value={hd.giaDuThau != null ? formatTrieu(hd.giaDuThau) : '— (= Giá trị HĐ)'}
              />
              <InfoField label="Người tạo hồ sơ" value={hd.nguoiTao || '—'} />
            </div>
            <InfoField
              label="Trạng thái quyết toán (Đ.11)"
              value={
                hd.trangThaiQuyetToan === 'da-quyet-toan'
                  ? `Đã quyết toán (${hd.ngayQuyetToan ? formatNgay(hd.ngayQuyetToan) : 'Đã xác nhận'})`
                  : 'Chưa quyết toán'
              }
            />
          </div>
        </div>
      </div>

      {/* ═══ 3. QUY TRÌNH DUYỆT VIỆN TRƯỞNG (ĐIỀU 6.1) NẾU VƯỢT NGƯỠNG ═══ */}
      {isOverThreshold && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/70 dark:border-indigo-800/80 dark:bg-indigo-950/40 p-3.5 text-xs space-y-2.5 shadow-2xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
              <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400" />
              Điều 6.1 QC 2815:{' '}
              {hd.phucTap ? 'HĐ phức tạp/chính trị — buộc trình Viện trưởng' : 'Vượt ngưỡng trình Viện trưởng'}
            </p>
            <span className={cn('rounded px-2 py-0.5 text-2xs font-bold border', PHE_DUYET_TONE[trangThaiHienThi])}>
              {PHE_DUYET_LABEL[trangThaiHienThi]}
            </span>
          </div>

          {/* Thanh tiến trình 4 bước */}
          <div className="flex items-center gap-1.5 pt-0.5">
            {(['chua-trinh', 'cho-khkt-tham-tra', 'da-trinh', 'da-duyet'] as TrangThaiPheDuyet[]).map((buoc, idx) => {
              const thuTuHienTai = ['chua-trinh', 'cho-khkt-tham-tra', 'da-trinh', 'da-duyet'].indexOf(trangThaiHienThi);
              const daQua = idx < thuTuHienTai || trangThaiHienThi === 'da-duyet';
              const dangO = idx === thuTuHienTai && trangThaiHienThi !== 'da-duyet';
              return (
                <div key={buoc} className="flex flex-1 flex-col items-center gap-1" title={PHE_DUYET_LABEL[buoc]}>
                  <div
                    className={cn(
                      'h-1.5 w-full rounded-full transition-all',
                      daQua
                        ? 'bg-emerald-500'
                        : dangO
                        ? 'bg-indigo-600 animate-pulse'
                        : 'bg-slate-300 dark:bg-slate-700',
                    )}
                  />
                  <span
                    className={cn(
                      'text-[9px] font-bold leading-tight text-center',
                      dangO
                        ? 'text-indigo-900 dark:text-indigo-300'
                        : daQua
                        ? 'text-emerald-700 dark:text-emerald-300'
                        : 'text-slate-400',
                    )}
                  >
                    {['1. Soạn & trình', '2. KHKT thẩm tra', '3. Trình VT', '4. Đã duyệt'][idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {trangThaiHienThi === 'cho-khkt-tham-tra' && (
            <p className="rounded bg-violet-100 dark:bg-violet-900/40 px-2 py-1 text-2xs font-bold text-violet-950 dark:text-violet-200">
              ⏱ SLA Đ.9.6c: KHKT thẩm tra ≤ 01 ngày làm việc; thiếu hồ sơ báo lại trong 06h.
            </p>
          )}

          <div className="flex items-center justify-between pt-1">
            {(() => {
              const ke = buocPheDuyetKeTiep(trangThaiHienThi);
              if (!ke) return <span />;
              const duocPhep =
                ke.kiemTraQuyen === 'duyet'
                  ? duocPheDuyet
                  : ke.kiemTraQuyen === 'khkt'
                  ? coTheThamTraKhkt(vaiTro)
                  : duocTrinhDuyet;
              return duocPhep ? (
                <button
                  onClick={() => onPheDuyet(hd, ke.den)}
                  disabled={pheDuyetBusyId === hd.id}
                  className={cn(
                    'rounded-lg border px-3 py-1.5 text-xs font-bold disabled:opacity-50 transition-colors shadow-2xs',
                    ke.den === 'da-duyet'
                      ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700'
                      : 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700',
                  )}
                >
                  {ke.nhanNut}
                </button>
              ) : (
                <span className="text-2xs italic text-ink-muted">
                  {ke.kiemTraQuyen === 'khkt'
                    ? `Chờ Phòng KHKT thẩm tra (${NHAN_VAI_TRO[vaiTro]} không có quyền).`
                    : `Chờ Lãnh đạo Viện duyệt (${NHAN_VAI_TRO[vaiTro]} không có quyền).`}
                </span>
              );
            })()}

            {(hd.ngayTrinhDuyet || hd.ngayDuyet) && (
              <span className="text-[10px] text-ink-muted">
                {hd.ngayDuyet
                  ? `Đã duyệt ${formatNgay(hd.ngayDuyet)} ${hd.nguoiDuyet ? `(${hd.nguoiDuyet})` : ''}`
                  : hd.ngayTrinhDuyet
                  ? `Đã trình ${formatNgay(hd.ngayTrinhDuyet)}`
                  : ''}
              </span>
            )}
          </div>
        </div>
      )}

      {/* ═══ 4. CẢNH BÁO QUY CHẾ 2815 TẬP TRUNG (TỰ ĐỘNG MỞ NẾU CÓ VI PHẠM) ═══ */}
      {tongSoCanhBao > 0 && (
        <DetailSection
          title="Cảnh báo & Rủi ro Quy chế 2815"
          icon={AlertTriangle}
          defaultOpen={true}
          tone="danger"
          badge={
            <span className="rounded-full bg-danger px-1.5 py-0.2 text-[10px] font-bold text-white">
              {tongSoCanhBao}
            </span>
          }
        >
          <div className="space-y-2 text-xs text-danger">
            {canhBaoNopHoSo && (
              <div className="rounded-lg bg-danger-subtle/40 p-2.5 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> Cảnh báo nộp hồ sơ gốc (Điều 6.3 & 14.2):
                </p>
                <p>
                  Đã quá hạn <strong>{canhBaoNopHoSo.quaHanNgay} ngày</strong> chưa nộp hồ sơ gốc về Viện — mức phạt gợi ý{' '}
                  <strong>{canhBaoNopHoSo.mucPhatPhanTram}%</strong> giá trị HĐ.
                </p>
              </div>
            )}

            {canhBaoChungTu && (
              <div className="rounded-lg bg-danger-subtle/40 p-2.5 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> Cảnh báo chứng từ quyết toán (Điều 14.2):
                </p>
                <p>
                  Đã quá hạn <strong>{canhBaoChungTu.quaHanNgay} ngày</strong> nộp chứng từ thanh quyết toán theo yêu cầu TCKT — gợi ý phạt{' '}
                  <strong>{canhBaoChungTu.mucPhatPhanTram}%</strong>.
                </p>
              </div>
            )}

            {canhBaoKy && (
              <div className="rounded-lg bg-danger-subtle/40 p-2.5 space-y-1">
                <p className="font-bold flex items-center gap-1.5">
                  <AlertCircle size={14} /> Cảnh báo thẩm quyền ký kết (Điều 5.1):
                </p>
                <p>{canhBaoKy}</p>
              </div>
            )}

            {hd.capKy === 'don-vi-ky' && hd.donViId && (
              <UyQuyenKyCanhBao key={`uq-${hd.donViId}`} donViId={hd.donViId} />
            )}
          </div>
        </DetailSection>
      )}

      {/* ═══ 5. CÁC MỤC CHI TIẾT DƯỚI DẠNG ACCORDION ═══ */}

      {/* Accordion: Phân bổ kinh phí Bảng 1 */}
      <DetailSection
        title="Phân bổ kinh phí theo Bảng 1 QC 2815 (Điều 12)"
        icon={BarChart3}
        defaultOpen={false}
      >
        <BangPhanBoKinhPhiSection hd={hd} />
      </DetailSection>

      {/* Accordion: Nhân sự & Cán bộ thực hiện */}
      <DetailSection
        title="Cán bộ & Nhân sự tham gia thực hiện (Điều 7)"
        icon={Users}
        defaultOpen={false}
      >
        <ThanhVienHopDongSection hd={hd} onGoToGiaoViec={onGoToGiaoViec} />
      </DetailSection>

      {/* Accordion: Hồ sơ & Dự thảo hợp đồng */}
      <DetailSection
        title="Hồ sơ & File dự thảo hợp đồng"
        icon={FileText}
        defaultOpen={!hd.fileDuThaoUrl}
      >
        <div className="space-y-2">
          {hd.fileDuThaoUrl ? (
            <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-lg border border-sky-200 bg-sky-50/50 dark:border-sky-800 dark:bg-sky-950/30">
              <div className="min-w-0">
                <p className="text-xs font-bold text-sky-950 dark:text-sky-100 truncate">
                  {hd.tenFileDuThao || (hd.fileDuThaoUrl.includes('google.com') ? 'Tài liệu Google Docs dự thảo' : 'File dự thảo hợp đồng')}
                </p>
                <p className="text-[11px] text-sky-800 dark:text-sky-300 truncate max-w-[400px]">
                  {hd.fileDuThaoUrl}
                </p>
              </div>
              <a
                href={hd.fileDuThaoUrl}
                target="_blank"
                rel="noreferrer"
                className="btn-primary py-1.5 px-3 text-xs font-bold gap-1.5 shadow-2xs"
              >
                <ExternalLink size={13} /> Mở Link / Tải về
              </a>
            </div>
          ) : (
            <p className="text-xs text-slate-600 dark:text-slate-300 italic">
              Chưa có tệp đính kèm. Bấm nút <strong>Sửa</strong> ở góc trên để tải tệp Word/PDF hoặc dán link Google Docs dự thảo.
            </p>
          )}
        </div>
      </DetailSection>
    </div>
  );
}

// ═══ TAB "GIAO VIỆC (ĐIỀU 7)" — SlideOver chi tiết hợp đồng ═══

function HopDongGiaoViecTab({
  hd,
  nhanSuOptions,
  donViOptions,
}: {
  hd: HopDong;
  nhanSuOptions: Option[];
  donViOptions: Option[];
}) {
  const dm = timDinhMuc(hd.nhomHD);
  const pb = hd.nhomHD
    ? phanBoHopDong(hd.nhomHD, hd.giaTri || 0, {
        loaiDacThu: hd.loaiDacThu,
        phanVienXa: hd.phanVienXa,
        giamTheoYeuCauDonVi: hd.giamTheoYeuCauDonVi,
        capKy: hd.capKy,
      })
    : null;

  return (
    <div className="space-y-3">
      {/* Định mức tham chiếu Bảng 1 nhanh 1 dòng */}
      {pb && dm && (
        <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 px-3.5 py-2 text-xs">
          <span className="font-semibold text-emerald-900 dark:text-emerald-200 flex items-center gap-1.5">
            <CheckCircle2 size={14} className="text-emerald-600 shrink-0" />
            Định mức giao Đơn vị ({dm.id}): <strong>{dm.tongGiaoDonVi}%</strong> ({formatTrieu(pb.tongGiaoDonVi)})
          </span>
          <span className="text-[11px] text-emerald-700 dark:text-emerald-300">
            Chủ trì: <strong>{dm.chuTri != null ? `${dm.chuTri}%` : '—'}</strong> · ĐV: <strong>{dm.donVi != null ? `${dm.donVi}%` : '—'}</strong> · Viện: <strong>{dm.cpqlLnChiKhac != null ? `${dm.cpqlLnChiKhac}%` : '—'}</strong>
          </span>
        </div>
      )}

      {/* Phiếu giao việc chính thức */}
      <PhieuGiaoViecForm key={hd.id} hd={hd} nhanSuOptions={nhanSuOptions} donViOptions={donViOptions} />
    </div>
  );
}

// ═══ THANH KÝ QUYẾT ĐỊNH GIAO VIỆC (Điều 7.1c) ═══
// Nút chỉ hiện với vai trò đủ thẩm quyền; trigger fn_kiem_soat_ky_giao_viec ở CSDL
// mới là chốt chặn thật (giao diện có thể bị bỏ qua).

function ThanhKyGiaoViec({
  phieu,
  capKy,
  phucTap,
  quanLyTapTrung,
  onChanged,
}: {
  phieu: PhieuGiaoViec;
  capKy: CapKy | null;
  phucTap?: boolean;
  quanLyTapTrung?: boolean;
  onChanged: () => void;
}) {
  const { vaiTro, nhanSuId } = useAuth();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const tt = phieu.trangThai;
  // Nhánh Đ.7.1c quyết định số bước và ai ký từng bước (khớp fn_nhanh_ky_giao_viec — 0035).
  const nhanh = nhanhKyGiaoViec({ capKy, phucTap, quanLyTapTrung });
  const buoc = cacBuocKy(nhanh);
  const ke = buocKeTiep(tt, nhanh);
  const duocKy = !!ke && ke.vaiTroChoPhep.includes(vaiTro);
  const idxHienTai = buoc.findIndex((b) => b.id === tt);

  const chuyen = async (den: TrangThaiGiaoViec, lyDo?: string) => {
    setBusy(true);
    setErr(null);
    try {
      await chuyenBuocGiaoViec(phieu.id, den, { lyDoTraLai: lyDo, actorNhanSuId: nhanSuId });
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const traLai = () => {
    const lyDo = window.prompt('Lý do trả lại phiếu giao việc:');
    if (lyDo === null) return;
    void chuyen('tra-lai', lyDo);
  };

  return (
    <div className="space-y-2 rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">
          Luồng ký Quyết định giao việc (Điều 7.1c)
        </h4>
        <div className="flex items-center gap-1.5">
          <span
            className="rounded bg-primary-subtle px-2 py-0.5 text-2xs font-bold text-primary dark:bg-primary-900/30 dark:text-primary-300"
            title={DAC_TA_NHANH[nhanh].canCu}
          >
            Nhánh {nhanh} — {DAC_TA_NHANH[nhanh].ten}
          </span>
          <span className={cn('rounded px-2 py-0.5 text-2xs font-bold', mauTrangThaiGiaoViec(tt))}>
            {NHAN_TRANG_THAI_GIAO_VIEC[tt]}
          </span>
        </div>
      </div>

      {/* Thanh tiến trình theo nhánh (4 bước với A/C, 2 bước với B/D) */}
      <div className="flex items-start justify-between gap-1 overflow-x-auto pt-1">
        {buoc.map((b, i) => {
          const xong = idxHienTai > i && tt !== 'tra-lai';
          const dangO = b.id === tt;
          return (
            <div key={b.id} className="flex min-w-0 flex-1 flex-col items-center text-center">
              <div
                className={cn(
                  'flex h-5 w-5 items-center justify-center rounded-full text-[9px] font-bold',
                  dangO
                    ? 'bg-primary text-white ring-2 ring-primary-100'
                    : xong
                      ? 'bg-emerald-600 text-white'
                      : 'border border-border bg-surface text-ink-muted',
                )}
              >
                {xong ? <Check size={11} /> : i + 1}
              </div>
              <span className={cn('mt-1 text-[10px] leading-tight', dangO ? 'font-bold text-primary' : 'text-ink-muted')}>
                {b.nhan}
              </span>
              <span className="text-[9px] leading-tight text-ink-muted">{b.moTa}</span>
            </div>
          );
        })}
      </div>

      {tt === 'tra-lai' && phieu.lyDoTraLai && (
        <p className="rounded bg-danger-subtle p-2 text-2xs font-semibold text-danger">
          Bị trả lại: {phieu.lyDoTraLai}
        </p>
      )}
      {tt === 'da-duyet' && phieu.ngayDuyet && (
        <p className="flex items-center gap-1.5 text-2xs font-semibold text-success">
          <CheckCircle2 size={13} /> Đã phê duyệt ngày {formatNgay(phieu.ngayDuyet)}
          {phieu.nguoiDuyet && <> bởi <strong>{phieu.nguoiDuyet}</strong></>}
        </p>
      )}
      {err && (
        <p className="flex items-start gap-1.5 rounded bg-danger-subtle p-2 text-2xs font-semibold text-danger">
          <AlertCircle size={12} className="mt-px shrink-0" /> {err}
        </p>
      )}

      <div className="flex flex-wrap items-center gap-2">
        {ke && duocKy && (
          <button
            onClick={() => void chuyen(ke.den)}
            disabled={busy}
            className="btn-primary py-1 text-2xs font-bold disabled:opacity-50"
          >
            {busy && <LoaderCircle size={12} className="animate-spin" />} {ke.nhanNut}
          </button>
        )}
        {ke && !duocKy && (
          <span className="text-2xs italic text-ink-muted">
            Bước kế tiếp: <strong>{ke.nhanNut}</strong> — {NHAN_VAI_TRO[vaiTro]} không có thẩm quyền này.
          </span>
        )}
        {coTheTraLai(tt, vaiTro) && (
          <button
            onClick={traLai}
            disabled={busy}
            className="rounded-lg border border-danger/40 px-2.5 py-1 text-2xs font-bold text-danger hover:bg-danger-subtle disabled:opacity-50"
          >
            Trả lại để sửa
          </button>
        )}
      </div>
    </div>
  );
}
