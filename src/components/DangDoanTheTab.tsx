import { useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Flag,
  Users,
  UserCheck,
  Wallet,
  Pencil,
  Trash2,
  LoaderCircle,
  Search,
  CalendarClock,
  ListChecks,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { Modal, Field, inputCls } from './Modal';
import { DataState } from './DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchToChucDoanThe,
  createToChucDoanThe,
  updateToChucDoanThe,
  deleteToChucDoanThe,
  fetchDangVien,
  createDangVien,
  updateDangVien,
  deleteDangVien,
  fetchPhatTrienDang,
  createPhatTrienDang,
  updatePhatTrienDang,
  fetchSinhHoatDinhKy,
  createSinhHoatDinhKy,
  fetchThuPhiDoanThe,
  createThuPhiDoanThe,
  updateThuPhiDoanThe,
  type ToChucDoanTheInput,
  type DangVienInput,
  type PhatTrienDangInput,
  type SinhHoatDinhKyInput,
  type ThuPhiDoanTheInput,
} from '../services/dangDoanThe';
import { fetchNhanSuFull, fetchDonVi } from '../services/org';
import {
  LOAI_TO_CHUC_DOAN_THE,
  TRANG_THAI_DANG_VIEN,
  BUOC_PHAT_TRIEN_DANG,
  LOAI_PHI_DOAN_THE,
  type LoaiToChucDoanThe,
  type ToChucDoanThe,
  type DangVien,
  type PhatTrienDang,
  type ThuPhiDoanThe,
} from '../types';
import { formatNgay, cn } from '../lib/utils';

const LOAI_ICON_CLS: Record<LoaiToChucDoanThe, string> = {
  dang: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  'doan-tn': 'bg-blue-50 text-info border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  'cong-doan': 'bg-emerald-50 text-success border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  ccb: 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  'nu-cong': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
};

const kyHienTai = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const EMPTY_TO_CHUC: ToChucDoanTheInput = {
  loai: 'dang',
  cap: 'chi-bo',
  ten: '',
  ma: '',
  toChucChaId: '',
  donViId: '',
  nguoiDungDauId: '',
  phoId: '',
  ngayThanhLap: '',
  nhiemKy: '',
};

const EMPTY_DANG_VIEN: DangVienInput = {
  nhanSuId: '',
  toChucId: '',
  soTheDang: '',
  ngayVaoDangDuBi: '',
  ngayVaoDangChinhThuc: '',
  noiKetNap: '',
  nguoiGioiThieu1: '',
  nguoiGioiThieu2: '',
  chucVuDang: '',
  trinhDoLyLuan: '',
  trangThai: 'dang-sinh-hoat',
  ghiChu: '',
};

const EMPTY_PHAT_TRIEN: PhatTrienDangInput = {
  nhanSuId: '',
  toChucId: '',
  buocHienTai: 'quan-chung-uu-tu',
  ngayBatDau: '',
  ngayDuKienKetNap: '',
  nguoiTheoDoiId: '',
  ghiChu: '',
  trangThai: 'dang-thuc-hien',
};

const EMPTY_SINH_HOAT: SinhHoatDinhKyInput = {
  toChucId: '',
  ky: kyHienTai(),
  ngayHop: '',
  diaDiem: '',
  chuTriId: '',
  chuyenDe: '',
  noiDung: '',
  nghiQuyet: '',
  soBienBan: '',
  trangThai: 'du-kien',
};

const EMPTY_THU_PHI: ThuPhiDoanTheInput = {
  nhanSuId: '',
  toChucId: '',
  loaiPhi: 'dang-phi',
  ky: kyHienTai(),
  mucDong: '',
  soTienPhaiNop: '',
  soTienDaNop: '0',
  ngayNop: '',
  hinhThuc: 'tru-luong',
  trangThai: 'chua-nop',
};

type SubTab = 'to-chuc' | 'dang-vien' | 'phat-trien' | 'sinh-hoat-phi';

export function DangDoanTheTab() {
  const [subTab, setSubTab] = useState<SubTab>('to-chuc');

  const { data: toChucList, loading: loadingToChuc, error: errorToChuc, refetch: refetchToChuc } =
    useAsyncData(fetchToChucDoanThe, []);
  const { data: dangVienList, loading: loadingDangVien, error: errorDangVien, refetch: refetchDangVien } =
    useAsyncData(fetchDangVien, []);
  const { data: phatTrienList, refetch: refetchPhatTrien } = useAsyncData(fetchPhatTrienDang, []);
  const { data: nhanSuList } = useAsyncData(fetchNhanSuFull, []);
  const { data: donViList } = useAsyncData(fetchDonVi, []);
  const ky = kyHienTai();
  const { data: thuPhiKyNay, refetch: refetchThuPhi } = useAsyncData(() => fetchThuPhiDoanThe(ky), []);
  const { data: sinhHoatList, refetch: refetchSinhHoat } = useAsyncData(() => fetchSinhHoatDinhKy(), []);

  const chiBoList = useMemo(() => toChucList.filter((t) => t.loai === 'dang'), [toChucList]);
  const soDangVienDangSinhHoat = dangVienList.filter((d) => d.trangThai === 'dang-sinh-hoat').length;
  const soDangVienDuBi = dangVienList.filter((d) => !d.ngayVaoDangChinhThuc && d.trangThai === 'dang-sinh-hoat').length;
  const soDangPhiDaNop = thuPhiKyNay.filter((t) => t.loaiPhi === 'dang-phi' && t.trangThai === 'da-nop').length;
  const soDangPhiTong = thuPhiKyNay.filter((t) => t.loaiPhi === 'dang-phi').length;
  const tyLeDangPhi = soDangPhiTong > 0 ? Math.round((soDangPhiDaNop / soDangPhiTong) * 100) : null;

  // ─── Form: Tổ chức Đảng - Đoàn thể ───
  const [toChucModal, setToChucModal] = useState(false);
  const [editingToChuc, setEditingToChuc] = useState<ToChucDoanThe | null>(null);
  const [toChucForm, setToChucForm] = useState<ToChucDoanTheInput>(EMPTY_TO_CHUC);
  const [savingToChuc, setSavingToChuc] = useState(false);
  const [errToChuc, setErrToChuc] = useState<string | null>(null);

  const openCreateToChuc = () => {
    setEditingToChuc(null);
    setToChucForm(EMPTY_TO_CHUC);
    setErrToChuc(null);
    setToChucModal(true);
  };
  const openEditToChuc = (t: ToChucDoanThe) => {
    setEditingToChuc(t);
    setToChucForm({
      loai: t.loai,
      cap: t.cap,
      ten: t.ten,
      ma: t.ma,
      toChucChaId: t.toChucChaId ?? '',
      donViId: t.donViId ?? '',
      nguoiDungDauId: t.nguoiDungDauId ?? '',
      phoId: t.phoId ?? '',
      ngayThanhLap: t.ngayThanhLap,
      nhiemKy: t.nhiemKy,
    });
    setErrToChuc(null);
    setToChucModal(true);
  };
  const submitToChuc = async (e: FormEvent) => {
    e.preventDefault();
    setSavingToChuc(true);
    setErrToChuc(null);
    try {
      if (editingToChuc) await updateToChucDoanThe(editingToChuc.id, toChucForm);
      else await createToChucDoanThe(toChucForm);
      setToChucModal(false);
      refetchToChuc();
    } catch (err) {
      setErrToChuc(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingToChuc(false);
    }
  };
  const removeToChuc = async (t: ToChucDoanThe) => {
    if (!window.confirm(`Xóa tổ chức "${t.ten}"? Chỉ xóa được khi không còn đảng viên/dữ liệu tham chiếu.`)) return;
    try {
      await deleteToChucDoanThe(t.id);
      refetchToChuc();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  // ─── Form: Đảng viên ───
  const [dvModal, setDvModal] = useState(false);
  const [editingDv, setEditingDv] = useState<DangVien | null>(null);
  const [dvForm, setDvForm] = useState<DangVienInput>(EMPTY_DANG_VIEN);
  const [savingDv, setSavingDv] = useState(false);
  const [errDv, setErrDv] = useState<string | null>(null);
  const [dvSearch, setDvSearch] = useState('');
  const [dvFilterToChuc, setDvFilterToChuc] = useState('');

  const openCreateDv = () => {
    setEditingDv(null);
    setDvForm(EMPTY_DANG_VIEN);
    setErrDv(null);
    setDvModal(true);
  };
  const openEditDv = (d: DangVien) => {
    setEditingDv(d);
    setDvForm({
      nhanSuId: d.nhanSuId,
      toChucId: d.toChucId,
      soTheDang: d.soTheDang,
      ngayVaoDangDuBi: d.ngayVaoDangDuBi,
      ngayVaoDangChinhThuc: d.ngayVaoDangChinhThuc,
      noiKetNap: d.noiKetNap,
      nguoiGioiThieu1: d.nguoiGioiThieu1,
      nguoiGioiThieu2: d.nguoiGioiThieu2,
      chucVuDang: d.chucVuDang,
      trinhDoLyLuan: d.trinhDoLyLuan,
      trangThai: d.trangThai,
      ghiChu: d.ghiChu,
    });
    setErrDv(null);
    setDvModal(true);
  };
  const submitDv = async (e: FormEvent) => {
    e.preventDefault();
    setSavingDv(true);
    setErrDv(null);
    try {
      if (editingDv) await updateDangVien(editingDv.id, dvForm);
      else await createDangVien(dvForm);
      setDvModal(false);
      refetchDangVien();
      refetchToChuc();
    } catch (err) {
      setErrDv(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingDv(false);
    }
  };
  const removeDv = async (d: DangVien) => {
    if (!window.confirm(`Xóa hồ sơ đảng viên "${d.hoTen}"?`)) return;
    try {
      await deleteDangVien(d.id);
      refetchDangVien();
      refetchToChuc();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const filteredDv = dangVienList.filter((d) => {
    const q = dvSearch.trim().toLowerCase();
    if (q && !d.hoTen.toLowerCase().includes(q) && !d.soTheDang.toLowerCase().includes(q)) return false;
    if (dvFilterToChuc && d.toChucId !== dvFilterToChuc) return false;
    return true;
  });

  // ─── Form: Phát triển đảng viên ───
  const [ptModal, setPtModal] = useState(false);
  const [editingPt, setEditingPt] = useState<PhatTrienDang | null>(null);
  const [ptForm, setPtForm] = useState<PhatTrienDangInput>(EMPTY_PHAT_TRIEN);
  const [savingPt, setSavingPt] = useState(false);
  const [errPt, setErrPt] = useState<string | null>(null);

  const openCreatePt = () => {
    setEditingPt(null);
    setPtForm(EMPTY_PHAT_TRIEN);
    setErrPt(null);
    setPtModal(true);
  };
  const openEditPt = (p: PhatTrienDang) => {
    setEditingPt(p);
    setPtForm({
      nhanSuId: p.nhanSuId,
      toChucId: p.toChucId,
      buocHienTai: p.buocHienTai,
      ngayBatDau: p.ngayBatDau,
      ngayDuKienKetNap: p.ngayDuKienKetNap,
      nguoiTheoDoiId: p.nguoiTheoDoiId ?? '',
      ghiChu: p.ghiChu,
      trangThai: p.trangThai,
    });
    setErrPt(null);
    setPtModal(true);
  };
  const submitPt = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPt(true);
    setErrPt(null);
    try {
      if (editingPt) await updatePhatTrienDang(editingPt.id, ptForm);
      else await createPhatTrienDang(ptForm);
      setPtModal(false);
      refetchPhatTrien();
    } catch (err) {
      setErrPt(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingPt(false);
    }
  };

  // ─── Form: Sinh hoạt định kỳ ───
  const [shModal, setShModal] = useState(false);
  const [shForm, setShForm] = useState<SinhHoatDinhKyInput>(EMPTY_SINH_HOAT);
  const [savingSh, setSavingSh] = useState(false);
  const [errSh, setErrSh] = useState<string | null>(null);

  const openCreateSh = () => {
    setShForm(EMPTY_SINH_HOAT);
    setErrSh(null);
    setShModal(true);
  };
  const submitSh = async (e: FormEvent) => {
    e.preventDefault();
    setSavingSh(true);
    setErrSh(null);
    try {
      await createSinhHoatDinhKy(shForm);
      setShModal(false);
      refetchSinhHoat();
    } catch (err) {
      setErrSh(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingSh(false);
    }
  };

  // ─── Form: Thu đảng phí / đoàn phí ───
  const [phiModal, setPhiModal] = useState(false);
  const [editingPhi, setEditingPhi] = useState<ThuPhiDoanThe | null>(null);
  const [phiForm, setPhiForm] = useState<ThuPhiDoanTheInput>(EMPTY_THU_PHI);
  const [savingPhi, setSavingPhi] = useState(false);
  const [errPhi, setErrPhi] = useState<string | null>(null);

  const openCreatePhi = () => {
    setEditingPhi(null);
    setPhiForm(EMPTY_THU_PHI);
    setErrPhi(null);
    setPhiModal(true);
  };
  const openEditPhi = (t: ThuPhiDoanThe) => {
    setEditingPhi(t);
    setPhiForm({
      nhanSuId: t.nhanSuId,
      toChucId: t.toChucId,
      loaiPhi: t.loaiPhi,
      ky: t.ky,
      mucDong: String(t.mucDong),
      soTienPhaiNop: String(t.soTienPhaiNop),
      soTienDaNop: String(t.soTienDaNop),
      ngayNop: t.ngayNop,
      hinhThuc: t.hinhThuc,
      trangThai: t.trangThai,
    });
    setErrPhi(null);
    setPhiModal(true);
  };
  const submitPhi = async (e: FormEvent) => {
    e.preventDefault();
    setSavingPhi(true);
    setErrPhi(null);
    try {
      if (editingPhi) await updateThuPhiDoanThe(editingPhi.id, phiForm);
      else await createThuPhiDoanThe(phiForm);
      setPhiModal(false);
      refetchThuPhi();
    } catch (err) {
      setErrPhi(err instanceof Error ? err.message : String(err));
    } finally {
      setSavingPhi(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Flag} label="Đảng viên đang sinh hoạt" value={String(soDangVienDangSinhHoat)} tone="accent" />
        <KpiCard icon={UserCheck} label="Đảng viên dự bị" value={String(soDangVienDuBi)} tone="warning" />
        <KpiCard icon={Users} label="Chi bộ / Đảng bộ" value={String(chiBoList.length)} tone="primary" />
        <KpiCard
          icon={Wallet}
          label={`Đảng phí đã nộp kỳ ${ky}`}
          value={tyLeDangPhi === null ? '— (chưa mở sổ thu)' : `${tyLeDangPhi}% (${soDangPhiDaNop}/${soDangPhiTong})`}
          tone="success"
        />
      </div>

      <div className="flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        {(
          [
            { id: 'to-chuc', label: 'Cơ cấu tổ chức', icon: Users },
            { id: 'dang-vien', label: 'Hồ sơ đảng viên', icon: Flag },
            { id: 'phat-trien', label: 'Phát triển đảng viên', icon: ListChecks },
            { id: 'sinh-hoat-phi', label: 'Sinh hoạt & Đảng phí', icon: CalendarClock },
          ] as { id: SubTab; label: string; icon: typeof Flag }[]
        ).map((t) => (
          <button
            key={t.id}
            onClick={() => setSubTab(t.id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              subTab === t.id
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {subTab === 'to-chuc' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Cây tổ chức Đảng - Đoàn thể</h3>
            <button onClick={openCreateToChuc} className="btn-primary">
              <Plus size={15} /> Thêm tổ chức
            </button>
          </div>
          <DataState loading={loadingToChuc} error={errorToChuc} empty={toChucList.length === 0} />
          <div className="p-4 space-y-4">
            {LOAI_TO_CHUC_DOAN_THE.map(({ ma, ten }) => {
              const items = toChucList.filter((t) => t.loai === ma);
              if (items.length === 0) return null;
              return (
                <div key={ma}>
                  <p className="mb-2 text-2xs font-black uppercase tracking-wider text-ink-muted">{ten} ({items.length})</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((t) => (
                      <div key={t.id} className={cn('rounded-lg border p-3', LOAI_ICON_CLS[t.loai])}>
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="truncate text-[13px] font-bold">{t.ten}</p>
                            <p className="text-2xs opacity-80">{t.donVi || 'Chưa gắn đơn vị'}</p>
                          </div>
                          <div className="flex shrink-0 gap-0.5">
                            <button onClick={() => openEditToChuc(t)} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10">
                              <Pencil size={12} />
                            </button>
                            <button onClick={() => removeToChuc(t)} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10">
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs">
                          {t.nguoiDungDau && <span>Bí thư/CT: <b>{t.nguoiDungDau}</b></span>}
                          {t.loai === 'dang' && <span className="font-mono">{t.soDangVien} đảng viên</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {toChucList.length === 0 && !loadingToChuc && (
              <p className="py-6 text-center text-xs italic text-ink-muted">
                Chưa có tổ chức Đảng - Đoàn thể nào. Bấm "Thêm tổ chức" để khởi tạo chi bộ/đảng bộ đầu tiên.
              </p>
            )}
          </div>
        </div>
      )}

      {subTab === 'dang-vien' && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Hồ sơ đảng viên</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  value={dvSearch}
                  onChange={(e) => setDvSearch(e.target.value)}
                  placeholder="Tìm tên, số thẻ..."
                  className="input-search pl-8 py-1.5 text-xs"
                />
              </div>
              <select value={dvFilterToChuc} onChange={(e) => setDvFilterToChuc(e.target.value)} className="select-field w-44 text-xs">
                <option value="">-- Tất cả chi bộ --</option>
                {chiBoList.map((t) => (
                  <option key={t.id} value={t.id}>{t.ten}</option>
                ))}
              </select>
              <button onClick={openCreateDv} className="btn-primary" disabled={chiBoList.length === 0}>
                <Plus size={15} /> Thêm đảng viên
              </button>
            </div>
          </div>
          {chiBoList.length === 0 && (
            <p className="px-4 py-2 text-2xs italic text-ink-muted">Cần tạo ít nhất 1 chi bộ/đảng bộ ở tab "Cơ cấu tổ chức" trước khi thêm đảng viên.</p>
          )}
          <DataState loading={loadingDangVien} error={errorDangVien} empty={dangVienList.length === 0} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="th-cell">Họ tên</th>
                  <th className="th-cell">Đơn vị</th>
                  <th className="th-cell">Chi bộ</th>
                  <th className="th-cell">Ngày vào Đảng (dự bị)</th>
                  <th className="th-cell">Chức vụ Đảng</th>
                  <th className="th-cell">Trạng thái</th>
                  <th className="th-cell text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDv.map((d) => (
                  <tr key={d.id} className="tr-hover">
                    <td className="td-cell font-semibold">{d.hoTen}</td>
                    <td className="td-cell text-ink-secondary">{d.donVi || '—'}</td>
                    <td className="td-cell text-ink-secondary">{d.toChuc}</td>
                    <td className="td-cell font-mono text-xs">
                      {formatNgay(d.ngayVaoDangDuBi)}
                      {!d.ngayVaoDangChinhThuc && <span className="ml-1 text-2xs text-warning">(dự bị)</span>}
                    </td>
                    <td className="td-cell">{d.chucVuDang || '—'}</td>
                    <td className="td-cell">
                      <span className="rounded-full bg-subtle px-2 py-0.5 text-2xs font-bold text-ink-secondary">
                        {TRANG_THAI_DANG_VIEN.find((o) => o.ma === d.trangThai)?.ten ?? d.trangThai}
                      </span>
                    </td>
                    <td className="td-cell">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEditDv(d)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600">
                          <Pencil size={14} />
                        </button>
                        <button onClick={() => removeDv(d)} className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredDv.length === 0 && !loadingDangVien && (
                  <tr><td colSpan={7} className="td-cell py-6 text-center italic text-ink-muted">Chưa có hồ sơ đảng viên phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'phat-trien' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Quy trình phát triển đảng viên (8 bước)</h3>
            <button onClick={openCreatePt} className="btn-primary" disabled={chiBoList.length === 0}>
              <Plus size={15} /> Đưa vào diện phát triển
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="th-cell">Quần chúng</th>
                  <th className="th-cell">Đơn vị</th>
                  <th className="th-cell">Chi bộ</th>
                  <th className="th-cell">Bước hiện tại</th>
                  <th className="th-cell">Dự kiến kết nạp</th>
                  <th className="th-cell text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {phatTrienList.map((p) => (
                  <tr key={p.id} className="tr-hover">
                    <td className="td-cell font-semibold">{p.hoTen}</td>
                    <td className="td-cell text-ink-secondary">{p.donVi || '—'}</td>
                    <td className="td-cell text-ink-secondary">{p.toChuc}</td>
                    <td className="td-cell">
                      <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-2xs font-bold text-primary dark:bg-primary-900/30 dark:text-primary-300">
                        {BUOC_PHAT_TRIEN_DANG.find((b) => b.ma === p.buocHienTai)?.ten ?? p.buocHienTai}
                      </span>
                    </td>
                    <td className="td-cell font-mono text-xs">{p.ngayDuKienKetNap ? formatNgay(p.ngayDuKienKetNap) : '—'}</td>
                    <td className="td-cell text-right">
                      <button onClick={() => openEditPt(p)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600">
                        <Pencil size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {phatTrienList.length === 0 && (
                  <tr><td colSpan={6} className="td-cell py-6 text-center italic text-ink-muted">Chưa có quần chúng nào trong diện phát triển Đảng.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'sinh-hoat-phi' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-ink">Sinh hoạt định kỳ</h3>
              <button onClick={openCreateSh} className="btn-primary" disabled={toChucList.length === 0}>
                <Plus size={15} /> Ghi nhận kỳ sinh hoạt
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th className="th-cell">Tổ chức</th>
                    <th className="th-cell">Kỳ</th>
                    <th className="th-cell">Ngày họp</th>
                    <th className="th-cell">Chủ trì</th>
                    <th className="th-cell">Chuyên đề</th>
                    <th className="th-cell text-center">Trạng thái</th>
                  </tr>
                </thead>
                <tbody>
                  {sinhHoatList.map((s) => (
                    <tr key={s.id} className="tr-hover">
                      <td className="td-cell font-semibold">{s.toChuc}</td>
                      <td className="td-cell font-mono text-xs">{s.ky}</td>
                      <td className="td-cell font-mono text-xs">{formatNgay(s.ngayHop)}</td>
                      <td className="td-cell text-ink-secondary">{s.chuTri || '—'}</td>
                      <td className="td-cell text-ink-secondary">{s.chuyenDe || '—'}</td>
                      <td className="td-cell text-center">
                        <span className="rounded-full bg-subtle px-2 py-0.5 text-2xs font-bold text-ink-secondary">{s.trangThai}</span>
                      </td>
                    </tr>
                  ))}
                  {sinhHoatList.length === 0 && (
                    <tr><td colSpan={6} className="td-cell py-6 text-center italic text-ink-muted">Chưa có kỳ sinh hoạt nào được ghi nhận.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-ink">Sổ thu đảng phí / đoàn phí — kỳ {ky}</h3>
              <button onClick={openCreatePhi} className="btn-primary" disabled={toChucList.length === 0}>
                <Plus size={15} /> Ghi khoản thu
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th className="th-cell">CBVC</th>
                    <th className="th-cell">Loại phí</th>
                    <th className="th-cell text-right">Phải nộp</th>
                    <th className="th-cell text-right">Đã nộp</th>
                    <th className="th-cell">Trạng thái</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {thuPhiKyNay.map((t) => (
                    <tr key={t.id} className="tr-hover">
                      <td className="td-cell font-semibold">{t.hoTen}</td>
                      <td className="td-cell text-ink-secondary">{LOAI_PHI_DOAN_THE.find((l) => l.ma === t.loaiPhi)?.ten ?? t.loaiPhi}</td>
                      <td className="td-cell text-right font-mono text-xs">{t.soTienPhaiNop.toLocaleString('vi-VN')}</td>
                      <td className="td-cell text-right font-mono text-xs">{t.soTienDaNop.toLocaleString('vi-VN')}</td>
                      <td className="td-cell">
                        <span className={cn(
                          'rounded-full px-2 py-0.5 text-2xs font-bold',
                          t.trangThai === 'da-nop' ? 'bg-emerald-50 text-success dark:bg-emerald-900/20' : 'bg-amber-50 text-warning dark:bg-amber-900/20',
                        )}>
                          {t.trangThai === 'da-nop' ? 'Đã nộp' : t.trangThai === 'mien' ? 'Miễn' : 'Chưa nộp'}
                        </span>
                      </td>
                      <td className="td-cell text-right">
                        <button onClick={() => openEditPhi(t)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600">
                          <Pencil size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {thuPhiKyNay.length === 0 && (
                    <tr><td colSpan={6} className="td-cell py-6 text-center italic text-ink-muted">Kỳ {ky} chưa mở sổ thu.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tổ chức Đảng - Đoàn thể */}
      <Modal title={editingToChuc ? 'Sửa tổ chức' : 'Thêm tổ chức Đảng - Đoàn thể'} open={toChucModal} onClose={() => setToChucModal(false)}>
        <form onSubmit={submitToChuc} className="space-y-4">
          {errToChuc && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{errToChuc}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="Loại tổ chức" required>
              <select className={inputCls} value={toChucForm.loai} onChange={(e) => setToChucForm({ ...toChucForm, loai: e.target.value as LoaiToChucDoanThe })}>
                {LOAI_TO_CHUC_DOAN_THE.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
              </select>
            </Field>
            <Field label="Cấp tổ chức" required>
              <input className={inputCls} required value={toChucForm.cap} onChange={(e) => setToChucForm({ ...toChucForm, cap: e.target.value })} placeholder="VD: chi-bo, dang-bo, doan-co-so..." />
            </Field>
          </div>
          <Field label="Tên tổ chức" required>
            <input className={inputCls} required value={toChucForm.ten} onChange={(e) => setToChucForm({ ...toChucForm, ten: e.target.value })} placeholder="VD: Chi bộ Khối Cơ quan Viện" />
          </Field>
          <Field label="Đơn vị gắn với">
            <select className={inputCls} value={toChucForm.donViId} onChange={(e) => setToChucForm({ ...toChucForm, donViId: e.target.value })}>
              <option value="">-- Không gắn đơn vị cụ thể --</option>
              {donViList.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Bí thư / Chủ tịch">
              <select className={inputCls} value={toChucForm.nguoiDungDauId} onChange={(e) => setToChucForm({ ...toChucForm, nguoiDungDauId: e.target.value })}>
                <option value="">-- Chưa phân công --</option>
                {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
              </select>
            </Field>
            <Field label="Phó bí thư / Phó chủ tịch">
              <select className={inputCls} value={toChucForm.phoId} onChange={(e) => setToChucForm({ ...toChucForm, phoId: e.target.value })}>
                <option value="">-- Chưa phân công --</option>
                {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày thành lập">
              <input type="date" className={inputCls} value={toChucForm.ngayThanhLap} onChange={(e) => setToChucForm({ ...toChucForm, ngayThanhLap: e.target.value })} />
            </Field>
            <Field label="Nhiệm kỳ">
              <input className={inputCls} value={toChucForm.nhiemKy} onChange={(e) => setToChucForm({ ...toChucForm, nhiemKy: e.target.value })} placeholder="VD: 2025-2030" />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setToChucModal(false)} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={savingToChuc} className="btn-primary">
              {savingToChuc && <LoaderCircle size={15} className="animate-spin" />}
              {editingToChuc ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Đảng viên */}
      <Modal title={editingDv ? 'Sửa hồ sơ đảng viên' : 'Thêm hồ sơ đảng viên'} open={dvModal} onClose={() => setDvModal(false)} wide>
        <form onSubmit={submitDv} className="space-y-4">
          {errDv && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{errDv}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="CBVC" required>
              <select className={inputCls} required value={dvForm.nhanSuId} onChange={(e) => setDvForm({ ...dvForm, nhanSuId: e.target.value })}>
                <option value="">-- Chọn CBVC --</option>
                {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
              </select>
            </Field>
            <Field label="Chi bộ / Đảng bộ" required>
              <select className={inputCls} required value={dvForm.toChucId} onChange={(e) => setDvForm({ ...dvForm, toChucId: e.target.value })}>
                <option value="">-- Chọn chi bộ --</option>
                {chiBoList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày vào Đảng dự bị" required>
              <input type="date" required className={inputCls} value={dvForm.ngayVaoDangDuBi} onChange={(e) => setDvForm({ ...dvForm, ngayVaoDangDuBi: e.target.value })} />
            </Field>
            <Field label="Ngày chuyển chính thức">
              <input type="date" className={inputCls} value={dvForm.ngayVaoDangChinhThuc} onChange={(e) => setDvForm({ ...dvForm, ngayVaoDangChinhThuc: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Số thẻ đảng viên">
              <input className={inputCls} value={dvForm.soTheDang} onChange={(e) => setDvForm({ ...dvForm, soTheDang: e.target.value })} />
            </Field>
            <Field label="Nơi kết nạp">
              <input className={inputCls} value={dvForm.noiKetNap} onChange={(e) => setDvForm({ ...dvForm, noiKetNap: e.target.value })} />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Chức vụ Đảng">
              <input className={inputCls} value={dvForm.chucVuDang} onChange={(e) => setDvForm({ ...dvForm, chucVuDang: e.target.value })} placeholder="VD: Bí thư chi bộ" />
            </Field>
            <Field label="Trình độ lý luận chính trị">
              <input className={inputCls} value={dvForm.trinhDoLyLuan} onChange={(e) => setDvForm({ ...dvForm, trinhDoLyLuan: e.target.value })} placeholder="VD: Trung cấp" />
            </Field>
          </div>
          <Field label="Trạng thái sinh hoạt" required>
            <select className={inputCls} value={dvForm.trangThai} onChange={(e) => setDvForm({ ...dvForm, trangThai: e.target.value })}>
              {TRANG_THAI_DANG_VIEN.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
            </select>
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setDvModal(false)} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={savingDv} className="btn-primary">
              {savingDv && <LoaderCircle size={15} className="animate-spin" />}
              {editingDv ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Phát triển đảng viên */}
      <Modal title={editingPt ? 'Cập nhật diện phát triển Đảng' : 'Đưa quần chúng vào diện phát triển Đảng'} open={ptModal} onClose={() => setPtModal(false)}>
        <form onSubmit={submitPt} className="space-y-4">
          {errPt && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{errPt}</div>}
          <Field label="Quần chúng" required>
            <select className={inputCls} required value={ptForm.nhanSuId} onChange={(e) => setPtForm({ ...ptForm, nhanSuId: e.target.value })}>
              <option value="">-- Chọn CBVC --</option>
              {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
            </select>
          </Field>
          <Field label="Chi bộ theo dõi" required>
            <select className={inputCls} required value={ptForm.toChucId} onChange={(e) => setPtForm({ ...ptForm, toChucId: e.target.value })}>
              <option value="">-- Chọn chi bộ --</option>
              {chiBoList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
            </select>
          </Field>
          <Field label="Bước hiện tại" required>
            <select className={inputCls} value={ptForm.buocHienTai} onChange={(e) => setPtForm({ ...ptForm, buocHienTai: e.target.value })}>
              {BUOC_PHAT_TRIEN_DANG.map((b) => <option key={b.ma} value={b.ma}>{b.ten}</option>)}
            </select>
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày bắt đầu theo dõi">
              <input type="date" className={inputCls} value={ptForm.ngayBatDau} onChange={(e) => setPtForm({ ...ptForm, ngayBatDau: e.target.value })} />
            </Field>
            <Field label="Dự kiến ngày kết nạp">
              <input type="date" className={inputCls} value={ptForm.ngayDuKienKetNap} onChange={(e) => setPtForm({ ...ptForm, ngayDuKienKetNap: e.target.value })} />
            </Field>
          </div>
          <Field label="Ghi chú">
            <textarea className={cn(inputCls, 'min-h-16 resize-y')} value={ptForm.ghiChu} onChange={(e) => setPtForm({ ...ptForm, ghiChu: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPtModal(false)} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={savingPt} className="btn-primary">
              {savingPt && <LoaderCircle size={15} className="animate-spin" />}
              Lưu
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Sinh hoạt định kỳ */}
      <Modal title="Ghi nhận kỳ sinh hoạt" open={shModal} onClose={() => setShModal(false)} wide>
        <form onSubmit={submitSh} className="space-y-4">
          {errSh && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{errSh}</div>}
          <div className="grid grid-cols-3 gap-3">
            <Field label="Tổ chức" required>
              <select className={inputCls} required value={shForm.toChucId} onChange={(e) => setShForm({ ...shForm, toChucId: e.target.value })}>
                <option value="">-- Chọn --</option>
                {toChucList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
              </select>
            </Field>
            <Field label="Kỳ (YYYY-MM)" required>
              <input className={inputCls} required value={shForm.ky} onChange={(e) => setShForm({ ...shForm, ky: e.target.value })} />
            </Field>
            <Field label="Ngày họp" required>
              <input type="date" required className={inputCls} value={shForm.ngayHop} onChange={(e) => setShForm({ ...shForm, ngayHop: e.target.value })} />
            </Field>
          </div>
          <Field label="Chuyên đề sinh hoạt">
            <input className={inputCls} value={shForm.chuyenDe} onChange={(e) => setShForm({ ...shForm, chuyenDe: e.target.value })} />
          </Field>
          <Field label="Nội dung">
            <textarea className={cn(inputCls, 'min-h-16 resize-y')} value={shForm.noiDung} onChange={(e) => setShForm({ ...shForm, noiDung: e.target.value })} />
          </Field>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setShModal(false)} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={savingSh} className="btn-primary">
              {savingSh && <LoaderCircle size={15} className="animate-spin" />}
              Lưu
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Thu phí */}
      <Modal title={editingPhi ? 'Cập nhật khoản thu' : 'Ghi khoản thu đảng phí / đoàn phí'} open={phiModal} onClose={() => setPhiModal(false)} wide>
        <form onSubmit={submitPhi} className="space-y-4">
          {errPhi && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{errPhi}</div>}
          <div className="grid grid-cols-2 gap-3">
            <Field label="CBVC" required>
              <select className={inputCls} required value={phiForm.nhanSuId} onChange={(e) => setPhiForm({ ...phiForm, nhanSuId: e.target.value })}>
                <option value="">-- Chọn CBVC --</option>
                {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
              </select>
            </Field>
            <Field label="Tổ chức" required>
              <select className={inputCls} required value={phiForm.toChucId} onChange={(e) => setPhiForm({ ...phiForm, toChucId: e.target.value })}>
                <option value="">-- Chọn --</option>
                {toChucList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Loại phí" required>
              <select className={inputCls} value={phiForm.loaiPhi} onChange={(e) => setPhiForm({ ...phiForm, loaiPhi: e.target.value })}>
                {LOAI_PHI_DOAN_THE.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
              </select>
            </Field>
            <Field label="Kỳ" required>
              <input className={inputCls} required value={phiForm.ky} onChange={(e) => setPhiForm({ ...phiForm, ky: e.target.value })} />
            </Field>
            <Field label="Trạng thái" required>
              <select className={inputCls} value={phiForm.trangThai} onChange={(e) => setPhiForm({ ...phiForm, trangThai: e.target.value })}>
                <option value="chua-nop">Chưa nộp</option>
                <option value="da-nop">Đã nộp</option>
                <option value="mien">Miễn</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <Field label="Mức đóng (%)">
              <input className={inputCls} value={phiForm.mucDong} onChange={(e) => setPhiForm({ ...phiForm, mucDong: e.target.value })} />
            </Field>
            <Field label="Số tiền phải nộp" required>
              <input className={inputCls} required value={phiForm.soTienPhaiNop} onChange={(e) => setPhiForm({ ...phiForm, soTienPhaiNop: e.target.value })} />
            </Field>
            <Field label="Số tiền đã nộp">
              <input className={inputCls} value={phiForm.soTienDaNop} onChange={(e) => setPhiForm({ ...phiForm, soTienDaNop: e.target.value })} />
            </Field>
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setPhiModal(false)} className="btn-ghost">Hủy</button>
            <button type="submit" disabled={savingPhi} className="btn-primary">
              {savingPhi && <LoaderCircle size={15} className="animate-spin" />}
              Lưu
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
