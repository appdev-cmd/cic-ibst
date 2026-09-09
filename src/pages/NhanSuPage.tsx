import { useMemo, useState, useEffect, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Plus,
  Users,
  Network,
  GraduationCap,
  ShieldAlert,
  ShieldCheck,
  Search,
  Pencil,
  Trash2,
  LoaderCircle,
  Flag,
  Award,
  ChevronLeft,
  ChevronRight,
  Phone,
  X,
  RotateCcw,
  Filter,
  Download,
  Building2,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Field, inputCls } from '../components/Modal';
import { NhanSuHoSoPanel } from '../components/NhanSuHoSoPanel';
import { NhanSuAvatar } from '../components/NhanSuAvatar';
import { DangDoanTheTab } from '../components/DangDoanTheTab';
import { DaoTaoPage } from './DaoTaoPage';
import { DonViPage } from './DonViPage';
import { DonViListTab } from '../components/DonViListTab';
import { DanhGiaVienChucTab } from '../components/DanhGiaVienChucTab';
import { useAsyncData } from '../hooks/useAsyncData';
import { useSlidePanelForm, useSlidePanelChiTiet } from '../hooks/useSlidePanelCrud';
import {
  fetchNhanSuFull,
  fetchDonVi,
  createNhanSu,
  updateNhanSu,
  deleteNhanSu,
  type NhanSuInput,
} from '../services/org';
import type { NhanSu, DonVi } from '../types';
import { cn, exportCsv, exportExcel, formatNgay } from '../lib/utils';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { tabDuocPhep, type TaiNguyen } from '../lib/phanQuyen';

type MainTab = 'co-cau-to-chuc' | 'don-vi' | 'nhan-su' | 'dao-tao-ncs' | 'dang-doan-the' | 'danh-gia-xep-loai';
const MAIN_TAB_IDS: MainTab[] = ['co-cau-to-chuc', 'don-vi', 'nhan-su', 'dao-tao-ncs', 'dang-doan-the', 'danh-gia-xep-loai'];
const MAIN_TAB_TAI_NGUYEN: Record<MainTab, TaiNguyen> = {
  'co-cau-to-chuc': 'co_cau_to_chuc',
  'don-vi': 'don_vi',
  'nhan-su': 'nhan_su',
  'dao-tao-ncs': 'dao_tao_ncs',
  'dang-doan-the': 'dang_doan_the',
  'danh-gia-xep-loai': 'danh_gia',
};

const HOC_VI_OPTIONS = [
  'Giáo sư, Tiến sĩ',
  'Phó Giáo sư, Tiến sĩ',
  'Tiến sĩ',
  'Thạc sĩ',
  'Kỹ sư',
  'Cử nhân',
];

const DON_VI_STYLE: Record<string, { text: string; dot: string }> = {
  'lanh-dao': {
    text: 'text-rose-700 dark:text-rose-400 font-semibold',
    dot: 'bg-rose-500',
  },
  'phong-chuc-nang': {
    text: 'text-indigo-700 dark:text-indigo-400 font-medium',
    dot: 'bg-indigo-500',
  },
  'vien-chuyen-nganh': {
    text: 'text-sky-700 dark:text-sky-400 font-medium',
    dot: 'bg-sky-500',
  },
  'phan-vien': {
    text: 'text-blue-700 dark:text-blue-400 font-medium',
    dot: 'bg-blue-600',
  },
  'trung-tam': {
    text: 'text-emerald-700 dark:text-emerald-400 font-medium',
    dot: 'bg-emerald-600',
  },
  'cong-ty': {
    text: 'text-amber-700 dark:text-amber-400 font-medium',
    dot: 'bg-amber-500',
  },
};

const EMPTY_FORM: NhanSuInput = {
  hoTen: '',
  hocVi: '',
  chucDanh: '',
  donViId: '',
  email: '',
  soDienThoai: '',
  trangThaiLamViec: 'dang-lam-viec',
};

function hanSapHet(iso: string) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  const now = Date.now();
  const d = (t - now) / (1000 * 3600 * 24);
  return d >= 0 && d <= 90;
}

function getChucVuRank(chucDanh?: string | null, pccv?: number | null): number {
  const s = (chucDanh ?? '').toLowerCase();
  const pc = Number(pccv ?? 0);

  // 1. Viện trưởng Viện KHCN Xây dựng
  if (s.includes('viện trưởng') && !s.includes('phó') && !s.includes('chuyên ngành') && !s.includes('cn')) {
    return 1;
  }
  // 2. Phó Viện trưởng Viện KHCN Xây dựng
  if (s.includes('phó viện trưởng') && !s.includes('chuyên ngành') && !s.includes('cn')) {
    return 2;
  }

  // 3. Người đứng đầu đơn vị (Giám đốc Viện/TT/Công ty, Viện trưởng CN)
  if (
    (s.includes('giám đốc') || s.includes('viện trưởng cn') || s.includes('viện trưởng chuyên ngành')) &&
    !s.includes('phó') &&
    !s.includes('pgđ') &&
    !s.includes('phó gđ')
  ) {
    return 3;
  }

  // 4. Cấp phó đứng đầu đơn vị (Phó Giám đốc, Phó Viện trưởng CN)
  if (
    s.includes('phó giám đốc') ||
    s.includes('phó gđ') ||
    s.includes('pgđ') ||
    s.includes('phó viện trưởng cn') ||
    s.includes('phó viện trưởng chuyên ngành')
  ) {
    return 4;
  }

  // 5. Trưởng phòng, Chánh văn phòng, Trưởng ban, Trưởng xưởng
  if (
    s.includes('trưởng phòng') ||
    s.includes('tp -') ||
    s.includes('tp.') ||
    s.includes('chánh văn phòng') ||
    s.includes('chánh vp') ||
    s.includes('trưởng ban') ||
    s.includes('trưởng xưởng')
  ) {
    if (!s.includes('phó') && !s.includes('ptp')) {
      return 5;
    }
  }

  // 6. Phó trưởng phòng, Phó TP, Phó ban, Phó xưởng, PTP
  if (
    s.includes('phó trưởng phòng') ||
    s.includes('phó tp') ||
    s.includes('ptp') ||
    s.includes('phó ban') ||
    s.includes('phó xưởng')
  ) {
    return 6;
  }

  // 7. Trưởng bộ môn, Chủ nhiệm, Phụ trách, Tổ trưởng
  if (
    s.includes('trưởng bộ môn') ||
    s.includes('chủ nhiệm') ||
    s.includes('phụ trách') ||
    s.includes('tổ trưởng')
  ) {
    return 7;
  }

  // 8. Phó bộ môn, Tổ phó
  if (s.includes('phó bộ môn') || s.includes('tổ phó')) {
    return 8;
  }

  // 9. Nhân viên phục vụ / bảo vệ / lái xe
  if (
    s.includes('bảo vệ') ||
    s.includes('lái xe') ||
    s.includes('phục vụ') ||
    s.includes('tạp vụ') ||
    s.includes('nvpv') ||
    s.includes('nvbv')
  ) {
    return 13;
  }

  // Phụ cấp chức vụ (nếu chức danh viết tắt hoặc không nêu rõ)
  if (pc >= 0.6) return 5;
  if (pc >= 0.4) return 6;
  if (pc >= 0.2) return 7.5;

  // 10. Ngạch cao cấp
  if (s.includes('cao cấp')) return 9;

  // 11. Ngạch chính
  if (s.includes('chính') || s.includes('ncvc')) return 10;

  // 12. Ngạch chuyên môn
  if (
    s.includes('kỹ sư') ||
    s.includes('ks') ||
    s.includes('chuyên viên') ||
    s.includes('cv') ||
    s.includes('nghiên cứu viên') ||
    s.includes('ncv') ||
    s.includes('kế toán') ||
    s.includes('kiến trúc sư') ||
    s.includes('kts') ||
    s.includes('cử nhân')
  ) {
    if (s.includes('tập sự')) return 12;
    return 11;
  }

  if (s.includes('tập sự')) return 12;

  return 11.5;
}

export function NhanSuPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    if (tabParam === 'so-do-to-chuc' || tabParam === 'co-cau-to-chuc') return 'co-cau-to-chuc';
    if (tabParam === 'don-vi') return 'don-vi';
    if (tabParam === 'dao-tao-ncs' || tabParam === 'dao-tao') return 'dao-tao-ncs';
    if (tabParam === 'dang-doan-the') return 'dang-doan-the';
    if (tabParam === 'danh-gia-xep-loai' || tabParam === 'danh-gia') return 'danh-gia-xep-loai';
    return 'nhan-su';
  });

  // Đồng bộ mainTab khi tabParam trên URL thay đổi (browser back/forward, redirect)
  useEffect(() => {
    if (tabParam === 'so-do-to-chuc' || tabParam === 'co-cau-to-chuc') {
      setMainTab('co-cau-to-chuc');
    } else if (tabParam === 'don-vi') {
      setMainTab('don-vi');
    } else if (tabParam === 'dao-tao-ncs' || tabParam === 'dao-tao') {
      setMainTab('dao-tao-ncs');
    } else if (tabParam === 'dang-doan-the') {
      setMainTab('dang-doan-the');
    } else if (tabParam === 'danh-gia-xep-loai' || tabParam === 'danh-gia') {
      setMainTab('danh-gia-xep-loai');
    } else if (tabParam === 'nhan-su' || tabParam === 'ho-so-nhan-su') {
      setMainTab('nhan-su');
    }
  }, [tabParam]);

  const handleTabChange = (tab: MainTab) => {
    setMainTab(tab);
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('tab', tab);
      return next;
    }, { replace: true });
  };

  const { can: coQuyenTab, dangTai: dangTaiQuyen } = usePhanQuyen();
  const tabHienDuoc = (t: MainTab) => tabDuocPhep(t, MAIN_TAB_TAI_NGUYEN, coQuyenTab, dangTaiQuyen);
  useEffect(() => {
    if (dangTaiQuyen || tabHienDuoc(mainTab)) return;
    const taiChoPhep = MAIN_TAB_IDS.find((t) => coQuyenTab(MAIN_TAB_TAI_NGUYEN[t], 'xem'));
    if (taiChoPhep) handleTabChange(taiChoPhep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dangTaiQuyen]);

  const { data: list, loading, error, refetch } = useAsyncData(fetchNhanSuFull, []);
  const { data: donViList } = useAsyncData(fetchDonVi, []);

  const donViMap = useMemo(() => {
    const m = new Map<string, string>();
    donViList.forEach((d) => m.set(d.id, d.ten));
    return m;
  }, [donViList]);

  const donViObjMap = useMemo(() => {
    const m = new Map<string, DonVi>();
    donViList.forEach((d) => m.set(d.id, d));
    return m;
  }, [donViList]);

  const [search, setSearch] = useState('');
  const [filterHocVi, setFilterHocVi] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');

  const hasActiveFilters = Boolean(search || filterHocVi || filterDonVi || filterTrangThai);

  const resetFilters = () => {
    setSearch('');
    setFilterHocVi('');
    setFilterDonVi('');
    setFilterTrangThai('');
  };

  const filtered = useMemo(() => {
    const matched = list.filter((ns) => {
      const q = search.trim().toLowerCase();
      if (q) {
        const matchName = ns.hoTen.toLowerCase().includes(q);
        const matchEmail = (ns.email ?? '').toLowerCase().includes(q);
        const matchCode = (ns.maDinhDanh ?? '').toLowerCase().includes(q);
        const matchPhone = (ns.soDienThoai ?? '').includes(q);
        if (!matchName && !matchEmail && !matchCode && !matchPhone) return false;
      }
      if (filterHocVi && ns.hocVi !== filterHocVi) return false;
      if (filterDonVi && ns.donViId !== filterDonVi) return false;
      if (filterTrangThai && ns.trangThaiLamViec !== filterTrangThai) return false;
      return true;
    });

    return [...matched].sort((a, b) => {
      // 1. Thứ tự nhóm đơn vị theo cơ cấu tổ chức Viện (Lãnh đạo Viện -> Phòng CN -> Viện CN -> Phân viện -> Trung tâm -> Công ty)
      const tuA = a.donViThuTu ?? 999;
      const tuB = b.donViThuTu ?? 999;
      if (tuA !== tuB) return tuA - tuB;

      // 2. Chức vụ trong đơn vị từ cao xuống thấp (Viện trưởng -> Phó VT -> Giám đốc -> Phó GĐ -> Trưởng phòng -> ...)
      const rankA = getChucVuRank(a.chucDanh, a.phuCapChucVu);
      const rankB = getChucVuRank(b.chucDanh, b.phuCapChucVu);
      if (rankA !== rankB) return rankA - rankB;

      // 3. Phụ cấp chức vụ (cao hơn xếp trước)
      const pcA = a.phuCapChucVu ?? 0;
      const pcB = b.phuCapChucVu ?? 0;
      if (pcA !== pcB) return pcB - pcA;

      // 4. Hệ số lương CB (cao hơn xếp trước)
      const hsA = a.heSoLuong ?? 0;
      const hsB = b.heSoLuong ?? 0;
      if (hsA !== hsB) return hsB - hsA;

      // 5. Tên theo thứ tự chữ cái tiếng Việt
      return a.hoTen.localeCompare(b.hoTen, 'vi');
    });
  }, [list, search, filterHocVi, filterDonVi, filterTrangThai]);

  const tongCs = list.filter((ns) => Boolean(ns.chungChi)).length;
  const activeCount = useMemo(() => list.filter((n) => n.trangThaiLamViec === 'dang-lam-viec').length, [list]);

  const thongKeHocVi = useMemo(() => {
    const gsPgs = list.filter((n) => (n.hocVi || '').includes('Giáo sư')).length;
    const ts = list.filter((n) => (n.hocVi || '').includes('Tiến sĩ') && !n.hocVi?.includes('Giáo sư')).length;
    const ths = list.filter((n) => (n.hocVi || '').includes('Thạc sĩ')).length;
    const ksCn = list.filter((n) => (n.hocVi || '').includes('Kỹ sư') || (n.hocVi || '').includes('Cử nhân')).length;
    return { gsPgs, ts, ths, ksCn, tongSauDh: gsPgs + ts + ths };
  }, [list]);

  const handleExportExcel = () => {
    const headers = [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Chức vụ / Chức danh',
      'Học vị',
      'Đơn vị công tác',
      'Email',
      'Số điện thoại',
      'Hệ số lương',
      'Phụ cấp chức vụ',
      'Chứng chỉ hành nghề',
      'Trạng thái làm việc',
    ];
    const rows = filtered.map((ns, idx) => [
      idx + 1,
      ns.maDinhDanh || `NS-${String(ns.id).padStart(4, '0')}`,
      ns.hoTen,
      ns.chucDanh || '',
      ns.hocVi || '',
      ns.donVi || '',
      ns.email || '',
      ns.soDienThoai || '',
      ns.heSoLuong != null ? String(ns.heSoLuong) : '',
      ns.phuCapChucVu != null ? String(ns.phuCapChucVu) : '',
      ns.chungChi || '',
      ns.trangThaiLamViec === 'dang-lam-viec' ? 'Đang làm việc' : ns.trangThaiLamViec === 'nghi-viec' ? 'Nghỉ việc' : 'Tạm hoãn',
    ]);
    const dateStr = new Date().toISOString().split('T')[0];
    exportExcel(`Danh_sach_can_bo_vien_chuc_IBST_${dateStr}`, 'Danh sách CBVC', headers, rows);
  };

  // Pagination
  const PAGE_SIZE = 20;
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);
  // Reset to page 1 when filter changes
  useMemo(() => { setCurrentPage(1); }, [search, filterHocVi, filterDonVi, filterTrangThai]);
  const [detailId, setDetailId] = useState<string | null>(() => searchParams.get('detailId'));
  useEffect(() => {
    const dId = searchParams.get('detailId');
    if (dId) setDetailId(dId);
  }, [searchParams]);
  const detail = useMemo(() => list.find((n) => n.id === detailId) ?? null, [list, detailId]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NhanSu | null>(null);
  const [form, setForm] = useState<NhanSuInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setModalOpen(true);
  };

  const openEdit = (item: NhanSu) => {
    setEditingItem(item);
    setForm({
      hoTen: item.hoTen,
      hocVi: item.hocVi ?? '',
      chucDanh: item.chucDanh ?? '',
      donViId: item.donViId ?? '',
      email: item.email ?? '',
      soDienThoai: item.soDienThoai ?? '',
      trangThaiLamViec: item.trangThaiLamViec,
    });
    setFormError(null);
    setModalOpen(true);
  };

  const handleSave = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setFormError(null);
    try {
      if (editingItem) {
        await updateNhanSu(editingItem.id, form);
      } else {
        await createNhanSu(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setFormError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item: NhanSu) => {
    if (!confirm(`Bạn có chắc muốn xóa nhân sự "${item.hoTen}"?`)) return;
    try {
      await deleteNhanSu(item.id);
      if (detailId === item.id) setDetailId(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // ─── Slide panel: biểu mẫu Thêm/Sửa CBVC ───
  useSlidePanelForm({
    id: 'nhan-su-form',
    open: modalOpen,
    title: editingItem ? 'Chỉnh sửa hồ sơ CBVC' : 'Thêm CBVC mới',
    subtitle: editingItem?.hoTen,
    storageKey: 'slideover-width-nhan-su-form',
    deps: [form, editingItem, saving, formError, donViList],
    onDongNgoaiLuong: () => setModalOpen(false),
    footer: (
      <>
        <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">Hủy</button>
        <button type="submit" form="form-nhan-su" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving && <LoaderCircle size={15} className="animate-spin" />}
          {editingItem ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </>
    ),
    content: (
      <form id="form-nhan-su" onSubmit={handleSave} className="space-y-4 p-5">
        {formError && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{formError}</div>}

        <Field label="Họ và tên" required>
          <input type="text" required value={form.hoTen} className={inputCls}
            onChange={(e) => setForm({ ...form, hoTen: e.target.value })} />
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Học vị">
            <select value={form.hocVi} className={inputCls}
              onChange={(e) => setForm({ ...form, hocVi: e.target.value })}>
              <option value="">-- Chọn --</option>
              {HOC_VI_OPTIONS.map((hv) => <option key={hv} value={hv}>{hv}</option>)}
            </select>
          </Field>
          <Field label="Chức danh">
            <input type="text" value={form.chucDanh} className={inputCls}
              onChange={(e) => setForm({ ...form, chucDanh: e.target.value })} />
          </Field>
        </div>

        <Field label="Đơn vị công tác">
          <select value={form.donViId} className={inputCls}
            onChange={(e) => setForm({ ...form, donViId: e.target.value })}>
            <option value="">-- Chọn đơn vị --</option>
            {donViList.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
          </select>
        </Field>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Email">
            <input type="email" value={form.email} className={inputCls}
              onChange={(e) => setForm({ ...form, email: e.target.value })} />
          </Field>
          <Field label="Số điện thoại">
            <input type="text" value={form.soDienThoai} className={inputCls}
              onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })} />
          </Field>
        </div>

        {editingItem && (
          <p className="rounded-lg border border-border bg-subtle px-3 py-2 text-2xs text-ink-muted">
            Hồ sơ mở rộng (quá trình công tác, bằng cấp, HĐLĐ &amp; lương, đánh giá) nhập ở panel chi tiết —
            bấm vào dòng CBVC trong danh sách.
          </p>
        )}
      </form>
    ),
  });

  // ─── Slide panel: hồ sơ chi tiết CBVC (các tab nghiệp vụ) ───
  useSlidePanelChiTiet({
    id: 'nhan-su-chi-tiet',
    active: !!detail,
    title: detail?.hoTen ?? '',
    subtitle: detail ? [detail.hocVi, detail.chucDanh, detail.donVi].filter(Boolean).join(' · ') : undefined,
    storageKey: 'slideover-width-nhan-su-chi-tiet',
    deps: [detail],
    onDongNgoaiLuong: () => setDetailId(null),
    headerExtra: detail ? (
      <button onClick={() => openEdit(detail)}
        className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:bg-muted">
        <Pencil size={13} /> Sửa
      </button>
    ) : undefined,
    content: detail ? <NhanSuHoSoPanel key={detail.id} nhanSuId={detail.id} onChanged={refetch} /> : null,
  });

  return (
    <div>
      <PageHeader
        title="Quản lý Tổ chức & Nhân sự"
        subtitle="Cơ cấu tổ chức viện, hồ sơ cán bộ viên chức, chứng chỉ hành nghề, đào tạo NCS, Đảng - Đoàn thể & Đánh giá xếp loại theo NĐ 233/2026/NĐ-CP"
      />

      {/* Main Tabs Switcher — mỗi tab chỉ hiện khi có quyền xem tài nguyên tương ứng (Tầng 3) */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        {tabHienDuoc('co-cau-to-chuc') && (
        <button
          onClick={() => handleTabChange('co-cau-to-chuc')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
            mainTab === 'co-cau-to-chuc'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Network size={15} /> Sơ đồ Tổ chức
          <span
            className={cn(
              'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
              mainTab === 'co-cau-to-chuc'
                ? 'bg-primary-subtle text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'bg-subtle text-ink-muted'
            )}
          >
            {donViList.length || 20}
          </span>
        </button>
        )}
        {tabHienDuoc('don-vi') && (
        <button
          onClick={() => handleTabChange('don-vi')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
            mainTab === 'don-vi'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Building2 size={15} /> Đơn vị
          <span
            className={cn(
              'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
              mainTab === 'don-vi'
                ? 'bg-primary-subtle text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'bg-subtle text-ink-muted'
            )}
          >
            {donViList.filter(d => d.loai !== 'lanh-dao').length || 19}
          </span>
        </button>
        )}
        {tabHienDuoc('nhan-su') && (
        <button
          onClick={() => handleTabChange('nhan-su')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
            mainTab === 'nhan-su'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Users size={15} /> Hồ sơ Nhân sự
          <span
            className={cn(
              'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
              mainTab === 'nhan-su'
                ? 'bg-primary-subtle text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'bg-subtle text-ink-muted'
            )}
          >
            {list.length || 635}
          </span>
        </button>
        )}
        {tabHienDuoc('dao-tao-ncs') && (
        <button
          onClick={() => handleTabChange('dao-tao-ncs')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
            mainTab === 'dao-tao-ncs'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <GraduationCap size={15} /> Đào tạo & NCS
        </button>
        )}
        {tabHienDuoc('dang-doan-the') && (
        <button
          onClick={() => handleTabChange('dang-doan-the')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
            mainTab === 'dang-doan-the'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Flag size={15} /> Đảng & Đoàn thể
        </button>
        )}
        {tabHienDuoc('danh-gia-xep-loai') && (
        <button
          onClick={() => handleTabChange('danh-gia-xep-loai')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
            mainTab === 'danh-gia-xep-loai'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Award size={15} /> Đánh giá & Xếp loại
          <span
            className={cn(
              'ml-0.5 rounded-full px-1.5 py-0.2 text-[10px] font-semibold',
              mainTab === 'danh-gia-xep-loai'
                ? 'bg-primary-subtle text-primary-700 dark:bg-primary-900/40 dark:text-primary-300'
                : 'bg-subtle text-ink-muted'
            )}
          >
            NĐ 233
          </span>
        </button>
        )}
      </div>

      {mainTab === 'co-cau-to-chuc' && tabHienDuoc('co-cau-to-chuc') && <DonViPage hideHeader mode="orgchart-only" />}
      {mainTab === 'don-vi' && tabHienDuoc('don-vi') && (
        <DonViListTab
          donViList={donViList}
          nhanSuList={list}
          loading={loading}
          error={error}
          onRefresh={refetch}
        />
      )}
      {mainTab === 'dao-tao-ncs' && tabHienDuoc('dao-tao-ncs') && <DaoTaoPage />}

      {mainTab === 'dang-doan-the' && tabHienDuoc('dang-doan-the') && <DangDoanTheTab />}

      {mainTab === 'danh-gia-xep-loai' && tabHienDuoc('danh-gia-xep-loai') && (
        <DanhGiaVienChucTab donViList={donViList} nhanSuList={list} />
      )}

      {mainTab === 'nhan-su' && tabHienDuoc('nhan-su') && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="TỔNG SỐ NHÂN SỰ"
              value={String(list.length)}
              subtext={`Đang làm việc: ${activeCount} (${Math.round((activeCount / (list.length || 1)) * 100)}%)`}
              icon={Users}
              tone="primary"
            />
            <KpiCard
              label="TRÌNH ĐỘ SAU ĐẠI HỌC"
              value={String(thongKeHocVi.tongSauDh)}
              subtext={`${thongKeHocVi.gsPgs} GS/PGS • ${thongKeHocVi.ts} TS • ${thongKeHocVi.ths} ThS`}
              icon={GraduationCap}
              tone="accent"
            />
            <KpiCard
              label="CHỨNG CHỈ HÀNH NGHỀ"
              value={String(tongCs)}
              subtext={`${Math.round((tongCs / (list.length || 1)) * 100)}% CBVC có CCHN`}
              icon={Award}
              tone="success"
            />
            <KpiCard
              label="HỒ SƠ & BẬC LƯƠNG"
              value={String(activeCount)}
              subtext="100% đầy đủ hồ sơ ngạch bậc"
              icon={ShieldCheck}
              tone="warning"
            />
          </div>

          <DataState loading={loading} error={error} empty={list.length === 0} />

          {/* ───── TOOLBAR: filter & search theo format cic-erp-contract ───── */}
          <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex flex-1 flex-wrap items-center gap-2.5">
              {/* Search input with clear button */}
              <div className="relative min-w-[240px] flex-1 max-w-sm">
                <Search size={14} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, mã, email, SĐT..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-search w-full h-9 pl-9 pr-8 text-xs"
                />
                {search && (
                  <button
                    onClick={() => setSearch('')}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink p-1 rounded-full"
                    title="Xóa tìm kiếm"
                  >
                    <X size={13} />
                  </button>
                )}
              </div>

              {/* Filter Đơn vị */}
              <select
                value={filterDonVi}
                onChange={(e) => setFilterDonVi(e.target.value)}
                className="select-field text-xs py-1.5 w-44"
              >
                <option value="">-- Tất cả đơn vị --</option>
                {donViList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ten}
                  </option>
                ))}
              </select>

              {/* Filter Học vị */}
              <select
                value={filterHocVi}
                onChange={(e) => setFilterHocVi(e.target.value)}
                className="select-field text-xs py-1.5 w-36"
              >
                <option value="">-- Tất cả học vị --</option>
                {HOC_VI_OPTIONS.map((hv) => (
                  <option key={hv} value={hv}>
                    {hv}
                  </option>
                ))}
              </select>

              {/* Filter Trạng thái */}
              <select
                value={filterTrangThai}
                onChange={(e) => setFilterTrangThai(e.target.value)}
                className="select-field text-xs py-1.5 w-36"
              >
                <option value="">-- Trạng thái --</option>
                <option value="dang-lam-viec">Đang làm việc</option>
                <option value="nghi-viec">Nghỉ việc</option>
                <option value="tam-hoan">Tạm hoãn / Nghỉ phép</option>
              </select>

              {/* Reset filter button */}
              {hasActiveFilters && (
                <button
                  onClick={resetFilters}
                  className="flex items-center gap-1 rounded-md border border-border px-2 py-1.5 text-2xs font-medium text-ink-muted hover:bg-muted hover:text-ink transition-colors"
                  title="Đặt lại bộ lọc"
                >
                  <RotateCcw size={11} /> Xóa lọc
                </button>
              )}

              {/* Counter summary badge */}
              <span className="text-2xs text-ink-muted bg-subtle px-2 py-1 rounded-md whitespace-nowrap font-medium">
                {filtered.length} / {list.length} NS
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExportExcel}
                className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink hover:bg-muted hover:text-primary transition-colors shadow-xs"
                title="Xuất danh sách nhân sự hiện tại ra file CSV/Excel"
              >
                <Download size={14} className="text-primary-600" />
                <span>Xuất Excel</span>
              </button>

              <button onClick={openCreate} className="btn-primary py-1.5 text-xs">
                <Plus size={15} /> Thêm nhân sự
              </button>
            </div>
          </div>

          {/* ───── TABLE: theo format cic-erp-contract ───── */}
          <div className="overflow-hidden rounded-lg border border-border dark:border-slate-700/70 bg-surface shadow-xs">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
              <table className="w-full text-left">
                <thead className="sticky top-0 z-20 bg-slate-100 dark:bg-[#191d28] border-b border-border dark:border-slate-700/80 shadow-xs">
                  <tr>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-10 text-center text-[11px] font-bold text-ink-secondary uppercase tracking-wider">#</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-28 text-left text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Mã NV</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 min-w-[210px] text-left text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Họ và tên</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-28 text-center text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Ngày sinh</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 min-w-[150px] text-left text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Chức vụ / Chức danh</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-28 text-center text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Học vị</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 min-w-[190px] text-left text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Đơn vị công tác</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 min-w-[210px] text-left text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Chứng chỉ hành nghề</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-28 text-left text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Số ĐT</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-24 text-right text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Hệ số &amp; PCCV</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-28 text-center text-[11px] font-bold text-ink-secondary uppercase tracking-wider">Trạng thái</th>
                    <th className="sticky top-0 bg-slate-100 dark:bg-[#191d28] px-3 py-3 w-16 text-right text-[11px] font-bold text-ink-secondary uppercase tracking-wider"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border-subtle dark:divide-slate-700/60">
                  {filtered.map((ns, idx) => {
                    const active = detail?.id === ns.id;

                    return (
                      <tr
                        key={ns.id}
                        onClick={() => setDetailId(ns.id)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          active
                            ? 'bg-primary-subtle/50 dark:bg-primary-900/30 ring-1 ring-inset ring-primary/30'
                            : idx % 2 !== 0
                              ? 'bg-muted/40 dark:bg-white/[0.03]'
                              : 'bg-surface',
                          !active && 'hover:bg-primary-subtle/30 dark:hover:bg-slate-800/60',
                        )}
                      >
                        {/* STT */}
                        <td className="px-3 py-2.5 text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>

                        {/* Mã NV */}
                        <td className="px-3 py-2.5 text-left whitespace-nowrap">
                          <span className="font-mono text-2xs font-semibold px-1.5 py-0.5 rounded bg-subtle text-ink-secondary whitespace-nowrap border border-border/50">
                            {ns.maDinhDanh || `NS-${String(ns.id).padStart(4, '0')}`}
                          </span>
                        </td>

                        {/* Họ tên + Email + Avatar */}
                        <td className="px-3 py-2.5">
                          <div className="flex items-center gap-3">
                            <NhanSuAvatar
                              hoTen={ns.hoTen}
                              chucDanh={ns.chucDanh}
                              trangThaiLamViec={ns.trangThaiLamViec}
                              showStatus
                              size="md"
                            />
                            <div className="min-w-0">
                              <div className="font-semibold text-sm text-ink leading-tight truncate">{ns.hoTen}</div>
                              <div className="text-[11px] text-ink-muted mt-0.5 truncate max-w-[190px]">{ns.email || '—'}</div>
                            </div>
                          </div>
                        </td>

                        {/* Ngày sinh / Giới tính */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {ns.ngaySinh ? (
                            <div className="flex flex-col items-center">
                              <span className="text-xs font-mono font-medium text-ink">
                                {formatNgay(ns.ngaySinh)}
                              </span>
                              {ns.gioiTinh && (
                                <span className="text-[10px] text-ink-muted">
                                  {ns.gioiTinh === 'N?' ? 'Nữ' : ns.gioiTinh}
                                </span>
                              )}
                            </div>
                          ) : (
                            <span className="text-ink-muted text-xs">—</span>
                          )}
                        </td>

                        {/* Chức vụ / Chức danh */}
                        <td className="px-3 py-2.5">
                          <div className="flex flex-col gap-0.5">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="text-xs text-ink font-medium leading-tight">
                                {ns.chucDanh || '—'}
                              </span>
                              {ns.chucDanh?.includes('Viện trưởng') && !ns.chucDanh?.includes('Phó') && !ns.chucDanh?.includes('chuyên ngành') && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 dark:bg-rose-950/50 dark:text-rose-300 border border-rose-200 dark:border-rose-800">
                                  Viện trưởng
                                </span>
                              )}
                              {ns.chucDanh?.includes('Phó Viện trưởng') && !ns.chucDanh?.includes('chuyên ngành') && (
                                <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                                  Phó Viện trưởng
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Học vị */}
                        <td className="px-3 py-2.5 text-center whitespace-nowrap">
                          {ns.hocVi ? (
                            <span className={cn(
                              'inline-flex items-center px-2 py-0.5 rounded-full text-2xs font-semibold',
                              ns.hocVi.includes('Tiến sĩ')
                                ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
                                : ns.hocVi.includes('Thạc sĩ')
                                ? 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
                                : ns.hocVi.includes('Kỹ sư')
                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                            )}>
                              {ns.hocVi}
                            </span>
                          ) : (
                            <span className="text-ink-muted text-xs">—</span>
                          )}
                        </td>

                        {/* Đơn vị công tác */}
                        <td className="px-3 py-2.5">
                          {(() => {
                            const dvObj = ns.donViId ? donViObjMap.get(ns.donViId) : undefined;
                            const tenDonVi = dvObj?.ten || (ns.donViId ? donViMap.get(ns.donViId) : undefined) || (ns.donViLoai === 'lanh-dao' ? 'Lãnh đạo Viện' : '—');
                            if (tenDonVi === '—') {
                              return <span className="text-xs text-ink-muted">—</span>;
                            }
                            const loai = dvObj?.loai || ns.donViLoai || (tenDonVi === 'Lãnh đạo Viện' ? 'lanh-dao' : 'phong-chuc-nang');
                            const style = DON_VI_STYLE[loai] || {
                              text: 'text-slate-700 dark:text-slate-300 font-medium',
                              dot: 'bg-slate-400 dark:bg-slate-500',
                            };
                            return (
                              <div className="flex items-center gap-1.5" title={tenDonVi}>
                                <span className={cn('inline-flex items-center gap-1.5 text-xs truncate max-w-[210px]', style.text)}>
                                  <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', style.dot)} />
                                  <span className="truncate">{tenDonVi}</span>
                                </span>
                              </div>
                            );
                          })()}
                        </td>

                        {/* Chứng chỉ hành nghề */}
                        <td className="px-3 py-2.5">
                          {ns.chungChi && ns.chungChi !== '—' ? (
                            <div className="flex items-center gap-1.5 max-w-[240px]">
                              <Award size={13} className="text-amber-600 dark:text-amber-400 shrink-0" />
                              <span className="text-xs font-medium text-ink-secondary truncate" title={ns.chungChi}>
                                {ns.chungChi}
                              </span>
                            </div>
                          ) : (
                            <span className="text-2xs text-ink-muted italic">Chưa có CCHN</span>
                          )}
                        </td>

                        {/* Số ĐT */}
                        <td className="px-3 py-2.5 text-xs text-ink-secondary whitespace-nowrap font-mono">
                          {ns.soDienThoai || '—'}
                        </td>

                        {/* Hệ số & PCCV */}
                        <td className="px-3 py-2.5 text-right font-mono text-xs tabular-nums whitespace-nowrap">
                          <span className="font-bold text-ink">
                            {ns.heSoLuong != null ? Number(ns.heSoLuong).toFixed(2) : '—'}
                          </span>
                          {ns.phuCapChucVu != null && Number(ns.phuCapChucVu) > 0 && (
                            <div className="text-[10px] text-amber-600 dark:text-amber-400 font-medium">
                              +{Number(ns.phuCapChucVu).toFixed(2)} PCCV
                            </div>
                          )}
                        </td>

                        {/* Trạng thái */}
                        <td className="px-3 py-2.5 text-center">
                          <span className={cn(
                            'inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold leading-4',
                            ns.trangThaiLamViec === 'dang-lam-viec'
                              ? 'bg-success-subtle text-success-700 dark:bg-success-900/30 dark:text-success-300'
                              : ns.trangThaiLamViec === 'nghi-viec'
                              ? 'bg-subtle text-ink-muted'
                              : 'bg-warning-subtle text-warning-700 dark:bg-warning-900/30 dark:text-warning-300'
                          )}>
                            <span className={cn(
                              'w-1.5 h-1.5 rounded-full',
                              ns.trangThaiLamViec === 'dang-lam-viec' ? 'bg-success-500' : 'bg-ink-muted'
                            )} />
                            {ns.trangThaiLamViec === 'dang-lam-viec' ? 'Đang làm' : ns.trangThaiLamViec === 'nghi-viec' ? 'Nghỉ việc' : ns.trangThaiLamViec || '—'}
                          </span>
                        </td>

                        {/* Thao tác */}
                        <td className="px-3 py-2.5 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEdit(ns)}
                              className="rounded p-1 text-ink-muted hover:bg-muted hover:text-ink transition-colors"
                              title="Sửa thông tin"
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(ns)}
                              className="rounded p-1 text-ink-muted hover:bg-danger-subtle hover:text-danger transition-colors"
                              title="Xóa nhân sự"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}

                  {/* Empty state */}
                  {filtered.length === 0 && !loading && (
                    <tr>
                      <td colSpan={12} className="px-4 py-12 text-center text-sm text-ink-muted">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Users size={28} className="text-ink-muted/50" />
                          <p className="font-medium text-ink-secondary">Không tìm thấy nhân sự phù hợp</p>
                          {hasActiveFilters && (
                            <button
                              onClick={resetFilters}
                              className="text-xs text-primary underline hover:text-primary-focus cursor-pointer"
                            >
                              Xóa bộ lọc tìm kiếm
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

    </div>
  );
}
