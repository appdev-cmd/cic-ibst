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
import { TableToolbar, FilterSelect, Pagination, RowActions } from '../components/TableToolbar';
import { ThucHienHopDongPanel } from '../components/ThucHienHopDongPanel';
import { BaoCaoKhktPanel } from '../components/BaoCaoKhktPanel';
import { CanhBaoQuyChePanel } from '../components/CanhBaoQuyChePanel';
import { useSlidePanel } from '../context/SlidePanelContext';
import { useAuth } from '../context/AuthContext';
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
import { KhachHangPage } from './KhachHangPage';
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

type Tab = 'hop-dong-2815' | 'crm-khach-hang' | 'bao-cao-khkt';

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

type DetailTab = 'thong-tin' | 'giao-viec' | 'thanh-toan' | 'thuong-phat' | 'kiem-tra' | 'ho-so' | 'phan-phoi' | 'lien-danh' | 'luu-tru' | 'nhat-ky' | 'thuc-hien';

const DETAIL_TABS: SlideOverTabDef<DetailTab>[] = [
  { id: 'thong-tin', label: 'Thông tin chung', icon: Info },
  { id: 'giao-viec', label: 'Giao việc (Đ.7)', icon: ListChecks },
  { id: 'thanh-toan', label: 'Thanh toán & QT (Đ.11)', icon: Wallet },
  { id: 'phan-phoi', label: 'Phân phối HĐ (Đ.6.3)', icon: Send },
  { id: 'thuong-phat', label: 'Thưởng / Phạt (Đ.13-14)', icon: Gavel },
  { id: 'kiem-tra', label: 'Kiểm tra nội bộ (Đ.10)', icon: ShieldCheck },
  { id: 'ho-so', label: 'Hồ sơ (Đ.8.4)', icon: Paperclip },
  { id: 'lien-danh', label: 'Liên danh (Đ.5.3)', icon: Users },
  { id: 'luu-tru', label: 'Lưu trữ TCHC (Đ.8)', icon: Archive },
  { id: 'thuc-hien', label: 'Thực hiện (Đ.8.1)', icon: Activity },
  { id: 'nhat-ky', label: 'Nhật ký (Đ.9-10)', icon: History },
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

export function HopDongPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hop-dong-2815');

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
  const [detailTab, setDetailTab] = useState<DetailTab>('thong-tin');
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
      <SlideOverTabs tabs={DETAIL_TABS} active={tab} onChange={setDetailTab} />
      <div className="space-y-4 p-4">
        {/* Thanh quy trình 5 bước Workflow Engine (QC 2815) */}
        <WorkflowStepper
          hopDongId={hd.id}
          buocHienTai={hd.buocHienTai || hd.trangThai}
          onStateChanged={refetch}
        />
        {thaoTacError && (
          <div className="flex items-start gap-2 rounded-lg bg-danger-subtle p-3 text-xs font-semibold text-danger">
            <AlertCircle size={15} className="mt-px shrink-0" />
            <span>{thaoTacError}</span>
          </div>
        )}
        {tab === 'thong-tin' && (
          <HopDongThongTinTab
            hd={hd}
            pheDuyetBusyId={pheDuyetBusyId}
            onPheDuyet={capNhatPheDuyet}
            onRefetch={refetch}
            onGoToGiaoViec={() => setDetailTab('giao-viec')}
          />
        )}
        {tab === 'giao-viec' && (
          <HopDongGiaoViecTab hd={hd} nhanSuOptions={nhanSuOptions} donViOptions={donViOptions} />
        )}
        {tab === 'thanh-toan' && (
          <div className="space-y-4">
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
            {(() => {
              const canhBao = canhBaoPhatNopChamHoSo(hd.nhomHD, hd.ngayKy, hd.ngayNopHoSo);
              if (!canhBao) return null;
              return (
                <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-xs space-y-1 text-danger">
                  <p className="flex items-center gap-1.5 font-bold"><AlertCircle size={14} /> Cảnh báo phạt (Điều 14.2)</p>
                  <p>
                    Đã quá hạn <strong>{canhBao.quaHanNgay} ngày</strong> chưa nộp hồ sơ gốc về Viện — mức phạt gợi ý{' '}
                    <strong>{canhBao.mucPhatPhanTram}%</strong> giá trị HĐ trước thuế. Ghi nhận quyết định thực tế ở tab "Thưởng / Phạt" sau khi có văn bản nhắc nhở.
                  </p>
                </div>
              );
            })()}
            {(() => {
              const canhBao = canhBaoPhatChungTuTre(
                hd.nhomHD,
                hd.hanChungTuQuyetToan,
                hd.trangThaiQuyetToan === 'da-quyet-toan',
              );
              if (!canhBao) return null;
              return (
                <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-xs space-y-1 text-danger">
                  <p className="flex items-center gap-1.5 font-bold"><AlertCircle size={14} /> Cảnh báo phạt (Điều 14.2, dòng 2)</p>
                  <p>
                    Đã quá hạn <strong>{canhBao.quaHanNgay} ngày</strong> nộp chứng từ thanh quyết toán theo yêu cầu TCKT — mức phạt gợi ý{' '}
                    <strong>{canhBao.mucPhatPhanTram}%</strong> trên phần giá trị vi phạm.
                  </p>
                </div>
              );
            })()}
            <DotThanhToanPanel key={`dtt-${hd.id}`} hopDongId={hd.id} giaTri={hd.giaTri} onChanged={refetch} />
            <QuyetToanDieu11Panel key={`qt11-${hd.id}`} hd={hd} nhanSuOptions={nhanSuOptions} />
            <QuyetToanGiaiDoanPanel key={`qtgd-${hd.id}`} hopDongId={hd.id} onChanged={refetch} />
          </div>
        )}
        {tab === 'thuong-phat' && (
          <ThuongPhatPanel key={`tp-${hd.id}`} hopDongId={hd.id} nhomHD={hd.nhomHD} nhanSuOptions={nhanSuOptions} onChanged={refetch} />
        )}
        {tab === 'kiem-tra' && (
          <KiemTraNoiBoPanel key={`kt-${hd.id}`} hopDongId={hd.id} nhanSuOptions={nhanSuOptions} onChanged={refetch} />
        )}
        {tab === 'ho-so' && (
          <HoSoHopDongPanel hopDongId={hd.id} trangThaiHopDong={hd.trangThai} onChanged={refetch} />
        )}
        {tab === 'phan-phoi' && <PhanPhoiHopDongPanel key={`pp-${hd.id}`} hd={hd} />}
        {tab === 'lien-danh' && <LienDanhPanel hopDongId={hd.id} />}
        {tab === 'luu-tru' && <LuuTruHoSoPanel hopDongId={hd.id} nhanSuOptions={nhanSuOptions} />}
        {tab === 'thuc-hien' && <ThucHienHopDongPanel key={`th-${hd.id}`} hopDongId={hd.id} />}
        {tab === 'nhat-ky' && <NhatKyHopDongPanel key={`nk-${hd.id}`} hopDongId={hd.id} />}
      </div>
    </>
  );

  const openDetail = (hd: HopDong, tab: DetailTab = 'thong-tin') => {
    closeAll();
    setDetail(hd);
    setDetailTab(tab);
    openPanel({
      id: panelIdForHopDong(hd.id),
      title: hd.soHD,
      subtitle: hd.ten,
      // Số lớn cố ý — computeWidths() tự kẹp về đúng mép sidebar, xem ghi chú ở panel form.
      defaultWidth: 2000,
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
        // Số lớn cố ý — luôn bị computeWidths() kẹp về đúng mép sidebar (ceiling thực tế),
        // nên form tự động rộng tối đa theo mọi kích thước màn hình thay vì cố định 720px.
        defaultWidth: 2000,
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
        title="[Phân hệ 2] Quản lý Hợp đồng (Quy chế 2815) & Khách hàng (CRM)"
        subtitle="Số hóa Phiếu giao việc điện tử, luồng duyệt hạn mức Viện trưởng & Thuật toán tự động phân bổ tài chính 4 Nhóm hợp đồng (Bảng 1 QC 2815)"
      />

      {/* Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        <button
          onClick={() => setActiveTab('hop-dong-2815')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'hop-dong-2815'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Handshake size={16} /> Quản lý Hợp đồng & QC 2815
        </button>
        <button
          onClick={() => setActiveTab('crm-khach-hang')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'crm-khach-hang'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Users2 size={16} /> Khách hàng & CRM Tiềm năng
        </button>
        <button
          onClick={() => setActiveTab('bao-cao-khkt')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'bao-cao-khkt'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <BarChart3 size={16} /> Báo cáo KHKT (Đ.6.3)
        </button>
      </div>

      {activeTab === 'crm-khach-hang' && <KhachHangPage />}
      {activeTab === 'bao-cao-khkt' && (
        <div className="space-y-4">
          <BaoCaoKhktPanel hopDongList={hopDongList} />
          <CanhBaoQuyChePanel hopDongList={hopDongList} />
        </div>
      )}

      {activeTab === 'hop-dong-2815' && (
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
          <div className="mb-4 rounded-xl border border-primary/20 bg-primary-subtle/30 p-4 text-xs space-y-2 text-ink">
            <div className="flex items-center justify-between font-bold text-primary">
              <span className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} /> Khung Quy chế 2815/QĐ-VKH: Hạn mức Trình Viện trưởng Phê duyệt (Điều 6.1)
              </span>
              <span className="rounded-full bg-primary px-3 py-0.5 text-white text-2xs font-bold">
                Tự động kích hoạt luồng
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2 pt-1 font-semibold text-ink-secondary">
              <div className="bg-surface p-2 rounded border border-border">🏛️ Mọi hợp đồng Nhóm 1 (N1a, N1b) — <strong>bất kể giá trị</strong></div>
              <div className="bg-surface p-2 rounded border border-border">🔍 Kiểm định, đánh giá hiện trạng (N1a) &ge; <strong>2,0 Tỷ VNĐ</strong></div>
              <div className="bg-surface p-2 rounded border border-border">📐 Tất cả hợp đồng Tư vấn (Nhóm 2) &ge; <strong>5,0 Tỷ VNĐ</strong></div>
              <div className="bg-surface p-2 rounded border border-border">🏗️ Hợp đồng Thi công (Nhóm 3) &ge; <strong>10,0 Tỷ VNĐ</strong></div>
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

          <div className="card overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="th-cell">Số HĐ / Tên</th>
                    <th className="th-cell">Khách hàng</th>
                    <th className="th-cell">Đơn vị thực hiện</th>
                    <th className="th-cell">Chủ trì HĐ</th>
                    <th className="th-cell">Giá trị (triệu đ)</th>
                    <th className="th-cell">Bước quy trình</th>
                    <th className="th-cell">Nhóm HĐ / Phê duyệt</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {table.pageRows.map((hdItem) => {
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
                        onClick={() => openDetail(hd, 'thong-tin')}
                        className={cn(
                          'tr-hover cursor-pointer',
                          active && 'bg-primary-subtle/50 dark:bg-primary-900/20',
                        )}
                      >
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
                            className="btn-secondary mt-1 py-1 text-2xs font-bold gap-1"
                          >
                            <FileText size={12} /> Phiếu giao việc
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

              <Pagination
                page={table.page}
                totalPages={table.totalPages}
                onChange={table.setPage}
              />
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
        </div>
      ) : (
        <>
          {/* Banner quy định Thẩm quyền Lập & Duyệt (Điều 7 QC 2815) */}
          <div className="rounded-xl border border-sky-200 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20 p-3 text-xs space-y-1 text-sky-900 dark:text-sky-200">
            <p className="flex items-center gap-1.5 font-bold">
              <Info size={15} className="text-sky-600" /> Thẩm quyền Lập & Phê duyệt Phiếu giao việc (Điều 7 QC 2815):
            </p>
            <ul className="list-disc pl-5 space-y-0.5 text-[11px]">
              <li><strong>Người lập:</strong> Trưởng đơn vị thực hiện (hoặc Chủ trì HĐ được giao quyền).</li>
              <li><strong>Người duyệt:</strong> Trưởng đơn vị ký duyệt (HĐ giao khoán đơn vị) hoặc Lãnh đạo Viện phê duyệt (HĐ cấp Viện).</li>
              <li><strong>Cán bộ thuộc Đơn vị:</strong> Danh sách Chủ trì & Thành viên mặc định được lọc theo cán bộ thuộc {hd.donViThucHien || 'Đơn vị thực hiện'}.</li>
            </ul>
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
      Cần ủy quyền chung hàng năm hoặc lập ủy quyền riêng để P.KHKT trình Viện trưởng ký — quản lý tại phân hệ{' '}
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
                className="rounded bg-primary-subtle px-2 py-1 text-[11px] font-bold text-primary hover:bg-primary-100"
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

  return (
    <div className="space-y-4">
      {/* Khung File Dự Thảo Hợp đồng & Google Docs */}
      <div className="rounded-xl border border-sky-300 bg-sky-50/80 dark:border-sky-800/80 dark:bg-sky-950/60 p-3.5 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-xs font-bold text-sky-900 dark:text-sky-200">
            <FileText size={16} className="text-sky-600 dark:text-sky-400" /> Hồ sơ & Dự thảo hợp đồng
          </span>
          {hd.fileDuThaoUrl ? (
            <span className="rounded bg-emerald-100 text-emerald-900 dark:bg-emerald-900/70 dark:text-emerald-200 border border-emerald-300 dark:border-emerald-700 px-2 py-0.5 text-[10px] font-bold">
              Đã đính kèm dự thảo
            </span>
          ) : (
            <span className="rounded bg-amber-100 text-amber-900 dark:bg-amber-900/70 dark:text-amber-200 border border-amber-300 dark:border-amber-700 px-2 py-0.5 text-[10px] font-bold">
              Chưa đính kèm file
            </span>
          )}
        </div>

        {hd.fileDuThaoUrl ? (
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="min-w-0">
              <p className="text-xs font-bold text-sky-950 dark:text-sky-100 truncate">
                {hd.tenFileDuThao || (hd.fileDuThaoUrl.includes('google.com') ? 'Tài liệu Google Docs dự thảo' : 'File dự thảo hợp đồng')}
              </p>
              <p className="text-[11px] text-sky-800 dark:text-sky-300 truncate max-w-[360px]">
                {hd.fileDuThaoUrl}
              </p>
            </div>
            <a
              href={hd.fileDuThaoUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-primary shadow-2xs py-1.5 px-3 text-xs font-bold gap-1.5"
            >
              <ExternalLink size={13} /> Mở Link / Tải về
            </a>
          </div>
        ) : (
          <p className="text-xs text-slate-700 dark:text-slate-200 font-medium italic">
            Chưa có tệp đính kèm. Bấm nút <strong className="text-slate-900 dark:text-white">Sửa</strong> ở góc trên bên phải để tải tệp Word/PDF hoặc dán link Google Docs dự thảo.
          </p>
        )}
      </div>

      {/* Thành viên tham gia thực hiện Hợp đồng (Điều 7) */}
      <ThanhVienHopDongSection hd={hd} onGoToGiaoViec={onGoToGiaoViec} />

      {/* Bảng phân bổ kinh phí tự động theo Bảng 1 QC 2815 (Điều 12) */}
      <BangPhanBoKinhPhiSection hd={hd} />

      {/* Khung Thông tin chi tiết Hợp đồng & Giá trị Tài chính */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-2xs">
        <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-border-subtle">
          <div className="flex items-center gap-2">
            <StatusBadge value={hd.trangThai} />
            {dm && (
              <span className="rounded bg-muted px-2 py-0.5 text-2xs font-bold text-ink-secondary" title={dm.ten}>
                {dm.id} — {dm.ten}
              </span>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <InfoField label="Khách hàng" value={hd.khachHang || '—'} />
          <InfoField label="Đơn vị thực hiện" value={hd.donViThucHien || '—'} />
          <InfoField label="Chủ trì hợp đồng" value={hd.chuTri || '— Chưa phân công —'} />
          <InfoField label="Giá dự thầu" value={hd.giaDuThau != null ? formatTrieu(hd.giaDuThau) : '— (= Giá trị HĐ)'} />
          <InfoField label="Ngày ký" value={hd.ngayKy ? formatNgay(hd.ngayKy) : '—'} />
          <InfoField label="Hạn hoàn thành" value={hd.hanHoanThanh ? formatNgay(hd.hanHoanThanh) : '—'} />
          <InfoField
            label="Thời gian thực hiện"
            value={
              hd.ngayKy && hd.hanHoanThanh
                ? `${tinhSoNgayThucHien(hd.ngayKy, hd.hanHoanThanh)} ngày`
                : '—'
            }
          />
          <InfoField label="Người tạo hồ sơ" value={hd.nguoiTao || '—'} />
        </div>

        <div className="grid grid-cols-3 gap-3 pt-3 border-t border-border-subtle">
          <MiniStat label="Giá trị HĐ" value={formatTrieu(hd.giaTri)} />
          <MiniStat label="Đã thanh toán" value={formatTrieu(hd.daThanhToan)} tone="success" />
          <MiniStat label="Còn phải thu" value={formatTrieu(Math.max(0, hd.giaTri - hd.daThanhToan))} tone="warning" />
        </div>
      </div>

      {isOverThreshold && (
        <div className="rounded-xl border border-indigo-200 bg-indigo-50/80 dark:border-indigo-800/80 dark:bg-indigo-950/60 p-3.5 text-xs space-y-3 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-1.5 font-bold text-indigo-900 dark:text-indigo-200">
              <CheckCircle2 size={15} className="text-indigo-600 dark:text-indigo-400" /> Điều 6.1 QC 2815: {hd.phucTap ? 'HĐ phức tạp/chính trị — buộc trình Viện trưởng' : 'Vượt ngưỡng trình Viện trưởng'}
            </p>
            <span className={cn('rounded px-2 py-0.5 text-2xs font-bold border', PHE_DUYET_TONE[trangThaiHienThi])}>
              {PHE_DUYET_LABEL[trangThaiHienThi]}
            </span>
          </div>

          {/* Thanh tiến trình 4 bước: Trình → KHKT thẩm tra → Trình VT → Duyệt */}
          <div className="flex items-center gap-1.5 pt-1">
            {(['chua-trinh', 'cho-khkt-tham-tra', 'da-trinh', 'da-duyet'] as TrangThaiPheDuyet[]).map((buoc, idx) => {
              const thuTuHienTai = ['chua-trinh', 'cho-khkt-tham-tra', 'da-trinh', 'da-duyet'].indexOf(trangThaiHienThi);
              const daQua = idx < thuTuHienTai || trangThaiHienThi === 'da-duyet';
              const dangO = idx === thuTuHienTai && trangThaiHienThi !== 'da-duyet';
              return (
                <div key={buoc} className="flex flex-1 flex-col items-center gap-1" title={PHE_DUYET_LABEL[buoc]}>
                  <div
                    className={cn(
                      'h-2 w-full rounded-full transition-all',
                      daQua ? 'bg-emerald-500 dark:bg-emerald-400' : dangO ? 'bg-indigo-600 dark:bg-indigo-400' : 'bg-slate-300 dark:bg-slate-700',
                    )}
                  />
                  <span className={cn('text-[10px] font-bold leading-tight text-center', dangO ? 'text-indigo-900 dark:text-indigo-300' : daQua ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-500 dark:text-slate-400')}>
                    {['1. Soạn & trình', '2. KHKT thẩm tra', '3. Trình VT', '4. Đã duyệt'][idx]}
                  </span>
                </div>
              );
            })}
          </div>

          {trangThaiHienThi === 'cho-khkt-tham-tra' && (
            <p className="rounded-lg bg-violet-100 dark:bg-violet-900/60 border border-violet-300 dark:border-violet-700 px-3 py-1.5 text-2xs font-bold text-violet-950 dark:text-violet-200">
              ⏱ SLA Đ.9.6c: KHKT thẩm tra ≤ 01 ngày làm việc; hồ sơ thiếu phải báo lại đơn vị trong 06 giờ.
            </p>
          )}

          {(() => {
            const ke = buocPheDuyetKeTiep(trangThaiHienThi);
            if (!ke) return null;
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
                    ? 'border-emerald-500 bg-emerald-600 text-white hover:bg-emerald-700 dark:bg-emerald-600 dark:hover:bg-emerald-500'
                    : 'border-indigo-500 bg-indigo-600 text-white hover:bg-indigo-700 dark:bg-indigo-600 dark:hover:bg-indigo-500',
                )}
              >
                {ke.nhanNut}
              </button>
            ) : (
              <span className="text-xs font-semibold italic text-slate-700 dark:text-slate-200 block bg-indigo-100/70 dark:bg-indigo-900/40 p-2.5 rounded-lg border border-indigo-200 dark:border-indigo-800">
                {ke.kiemTraQuyen === 'khkt'
                  ? `Chờ Phòng KHKT ký tắt thẩm tra (Đ.9.6c) — ${NHAN_VAI_TRO[vaiTro]} không có thẩm quyền này.`
                  : `Chờ Viện trưởng/Phó Viện trưởng phê duyệt — ${NHAN_VAI_TRO[vaiTro]} không có thẩm quyền này (Điều 6.1).`}
              </span>
            );
          })()}

          {(hd.ngayTrinhDuyet || hd.ngayDuyet) && (
            <p className="text-slate-600 dark:text-slate-300 font-medium text-2xs pt-1 border-t border-indigo-200/60 dark:border-indigo-800/60">
              {hd.ngayTrinhDuyet && <>Ngày trình: <strong>{formatNgay(hd.ngayTrinhDuyet)}</strong>. </>}
              {hd.ngayDuyet && (
                <>
                  Ngày duyệt: <strong>{formatNgay(hd.ngayDuyet)}</strong>
                  {hd.nguoiDuyet && <> bởi <strong>{hd.nguoiDuyet}</strong></>}.
                </>
              )}
            </p>
          )}
        </div>
      )}

      {/* Đ.6.2 — HĐ đơn vị ký: kiểm tra ủy quyền chung còn hiệu lực */}
      {hd.capKy === 'don-vi-ky' && hd.donViId && (
        <UyQuyenKyCanhBao key={`uq-${hd.donViId}`} donViId={hd.donViId} />
      )}

      {(() => {
        const canhBao = canhBaoPhatNopChamHoSo(hd.nhomHD, hd.ngayKy, hd.ngayNopHoSo);
        if (!canhBao) return null;
        return (
          <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-xs space-y-1 text-danger">
            <p className="flex items-center gap-1.5 font-bold">
              <AlertCircle size={14} /> Cảnh báo phạt (Điều 14.2)
            </p>
            <p>
              Đã quá hạn <strong>{canhBao.quaHanNgay} ngày</strong> chưa nộp hồ sơ gốc về Viện — mức phạt gợi ý{' '}
              <strong>{canhBao.mucPhatPhanTram}%</strong> giá trị HĐ trước thuế. Ghi nhận quyết định thực tế ở tab
              "Thưởng / Phạt" sau khi có văn bản nhắc nhở.
            </p>
          </div>
        );
      })()}
    </div>
  );
}

// ═══ TAB "GIAO VIỆC (ĐIỀU 7)" — SlideOver chi tiết hợp đồng ═══

function HopDongGiaoViecTab({ hd, nhanSuOptions, donViOptions }: { hd: HopDong; nhanSuOptions: Option[]; donViOptions: Option[] }) {
  const han = ngayHanNopHoSo(hd.ngayKy);
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
    <div className="space-y-4">
      {hd.ngayNopHoSo ? (
        <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/20 p-3 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5 shrink-0" />
          <span>
            Đã nộp hồ sơ gốc về Viện ngày <strong>{formatNgay(hd.ngayNopHoSo)}</strong>.
          </span>
        </div>
      ) : (
        han && (
          (() => {
            const conLai = soNgayConLai(han);
            return (
              <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 p-3 flex items-center gap-2 text-xs text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <span>
                  <strong>Điều 6.3 / Điều 8.2 QC 2815:</strong>{' '}
                  {conLai >= 0 ? (
                    <>Còn <strong>{conLai} ngày</strong> để nộp bản Hợp đồng gốc về Viện</>
                  ) : (
                    <>Đã <strong>quá hạn {Math.abs(conLai)} ngày</strong> nộp bản Hợp đồng gốc về Viện</>
                  )}
                  {' '}(hạn {formatNgay(han.toISOString().slice(0, 10))}, kể từ ngày ký {formatNgay(hd.ngayKy || '')}).
                </span>
              </div>
            );
          })()
        )
      )}

      <div className="space-y-3 text-xs">
        <h4 className="font-bold text-ink">
          Phân bổ theo Bảng 1 Quy chế 2815 ({hd.nhomHD ?? '— chưa chọn nhóm —'}):
        </h4>
        {!hd.nhomHD ? (
          <p className="rounded bg-muted/40 p-2 text-ink-muted">
            Chưa chọn nhóm hợp đồng QC 2815 — vào "Sửa" để chọn nhóm theo Bảng 1.
          </p>
        ) : !pb ? (
          <p className="rounded bg-muted/40 p-2 text-ink-muted">
            {dm?.ten}: thanh toán theo nguyên tắc <strong>thực thanh, thực chi</strong> phù hợp dự toán được duyệt
            (Điều 12.2) — không áp dụng bảng phân bổ tỷ lệ cố định.
          </p>
        ) : (
          <div className="space-y-2">
            {pb.ghiChuDacThu.length > 0 && (
              <div className="rounded bg-sky-50 dark:bg-sky-900/20 p-2 text-2xs text-sky-800 dark:text-sky-300 space-y-0.5">
                {pb.ghiChuDacThu.map((g, i) => (
                  <p key={i}>⚑ {g}</p>
                ))}
              </div>
            )}
            <div className="flex justify-between p-2 rounded bg-muted/40">
              <span>Thuế GTGT ({dm?.thueGtgt ?? '—'}%):</span>
              <span className="font-bold text-ink">{formatTrieu(pb.thueGtgt)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/40">
              <span>CPQL Viện, Lợi nhuận, chi khác:</span>
              <span className="font-bold text-primary">{formatTrieu(pb.cpqlLnChiKhac)}</span>
            </div>
            <div className="flex justify-between p-2 rounded bg-muted/40">
              <span>Khấu hao TSCĐ Viện:</span>
              <span className="font-bold text-ink">{formatTrieu(pb.khtscd)}</span>
            </div>
            {pb.hoTroDiLai > 0 && (
              <div className="flex justify-between p-2 rounded bg-muted/40">
                <span>Hỗ trợ đi lại (Phân viện/TT ở xa):</span>
                <span className="font-bold text-ink">{formatTrieu(pb.hoTroDiLai)}</span>
              </div>
            )}
            <div className="flex justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">
              <span>Kinh phí giao Đơn vị chủ trì & phối hợp:</span>
              <span>{formatTrieu(pb.tongGiaoDonVi)}</span>
            </div>
            {pb.chuTri != null && pb.donVi != null ? (
              <>
                <div className="flex justify-between pl-4 text-2xs text-ink-muted">
                  <span>— Trong đó Chủ trì:</span>
                  <span>{formatTrieu(pb.chuTri)}</span>
                </div>
                <div className="flex justify-between pl-4 text-2xs text-ink-muted">
                  <span>— Trong đó Đơn vị phối hợp:</span>
                  <span>{formatTrieu(pb.donVi)}</span>
                </div>
              </>
            ) : (
              <p className="pl-4 text-2xs italic text-ink-muted">
                Không tách chủ trì/đơn vị — tự thoả thuận nội bộ trong phần kinh phí giao trên.
              </p>
            )}
          </div>
        )}
      </div>

      <div className="border-t border-border-subtle pt-4">
        <h4 className="mb-3 text-xs font-bold text-ink">Lưu Phiếu giao việc chính thức (Điều 7):</h4>
        <PhieuGiaoViecForm key={hd.id} hd={hd} nhanSuOptions={nhanSuOptions} donViOptions={donViOptions} />
      </div>
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
