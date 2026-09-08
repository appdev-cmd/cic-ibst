import { useMemo, useState, type FormEvent } from 'react';
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
  Flag
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Field, inputCls } from '../components/Modal';
import { NhanSuHoSoPanel } from '../components/NhanSuHoSoPanel';
import { DangDoanTheTab } from '../components/DangDoanTheTab';
import { DaoTaoPage } from './DaoTaoPage';
import { DonViPage } from './DonViPage';
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
import type { NhanSu } from '../types';
import { cn } from '../lib/utils';

type MainTab = 'co-cau-to-chuc' | 'nhan-su' | 'dao-tao-ncs' | 'dang-doan-the';

const HOC_VI_OPTIONS = [
  'Giáo sư, Tiến sĩ',
  'Phó Giáo sư, Tiến sĩ',
  'Tiến sĩ',
  'Thạc sĩ',
  'Kỹ sư',
  'Cử nhân',
];

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

export function NhanSuPage() {
  const [searchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [mainTab, setMainTab] = useState<MainTab>(() => {
    if (tabParam === 'don-vi' || tabParam === 'co-cau-to-chuc') return 'co-cau-to-chuc';
    if (tabParam === 'dao-tao-ncs') return 'dao-tao-ncs';
    if (tabParam === 'dang-doan-the') return 'dang-doan-the';
    return 'nhan-su';
  });

  const { data: list, loading, error, refetch } = useAsyncData(fetchNhanSuFull, []);
  const { data: donViList } = useAsyncData(fetchDonVi, []);

  const donViMap = useMemo(() => {
    const m = new Map<string, string>();
    donViList.forEach((d) => m.set(d.id, d.ten));
    return m;
  }, [donViList]);

  const [search, setSearch] = useState('');
  const [filterHocVi, setFilterHocVi] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');

  const filtered = useMemo(() => {
    return list.filter((ns) => {
      const q = search.trim().toLowerCase();
      if (q && !ns.hoTen.toLowerCase().includes(q) && !(ns.email ?? '').toLowerCase().includes(q))
        return false;
      if (filterHocVi && ns.hocVi !== filterHocVi) return false;
      if (filterDonVi && ns.donViId !== filterDonVi) return false;
      return true;
    });
  }, [list, search, filterHocVi, filterDonVi]);

  const tongCs = list.filter((ns) => Boolean(ns.chungChi)).length;

  // Chi tiết CBVC mở bằng slide panel (đúng nếp chung của dự án) thay vì cột cố định bên phải,
  // để hồ sơ có đủ bề ngang cho các bảng con và người dùng tự kéo giãn được.
  const [detailId, setDetailId] = useState<string | null>(null);
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
    content: detail ? <NhanSuHoSoPanel nhanSuId={detail.id} onChanged={refetch} /> : null,
  });

  return (
    <div>
      <PageHeader
        title="[Phân hệ 5] Quản lý Tổ chức Nhân sự, Đào tạo & Đảng - Đoàn thể"
        subtitle="Hồ sơ CBNV, chứng chỉ hành nghề xây dựng, đào tạo NCS Tiến sĩ & Sinh hoạt Đảng viên/Đoàn viên"
      />

      {/* Main Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        <button
          onClick={() => setMainTab('co-cau-to-chuc')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            mainTab === 'co-cau-to-chuc'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Network size={16} /> Sơ đồ Cơ cấu Tổ chức & Đơn vị
        </button>
        <button
          onClick={() => setMainTab('nhan-su')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            mainTab === 'nhan-su'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Users size={16} /> Hồ sơ CBNV & Chứng chỉ Xây dựng
        </button>
        <button
          onClick={() => setMainTab('dao-tao-ncs')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            mainTab === 'dao-tao-ncs'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <GraduationCap size={16} /> Đào tạo & Nghiên cứu sinh (NCS)
        </button>
        <button
          onClick={() => setMainTab('dang-doan-the')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            mainTab === 'dang-doan-the'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Flag size={16} /> Đảng - Đoàn thể & Thi đua
        </button>
      </div>

      {mainTab === 'co-cau-to-chuc' && <DonViPage hideHeader />}
      {mainTab === 'dao-tao-ncs' && <DaoTaoPage />}

      {mainTab === 'dang-doan-the' && <DangDoanTheTab />}

      {mainTab === 'nhan-su' && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="TỔNG SỐ NHÂN SỰ" value={String(list.length)} icon={Users} tone="primary" />
            <KpiCard label="TỔNG SỐ CHỨNG CHỈ" value={String(tongCs)} icon={GraduationCap} tone="success" />
            <KpiCard
              label="ĐANG LÀM VIỆC"
              value={String(list.filter((n) => n.trangThaiLamViec === 'dang-lam-viec').length)}
              icon={ShieldCheck}
              tone="warning"
            />
          </div>

          <DataState loading={loading} error={error} empty={list.length === 0} />

          <div className="card mb-4 flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="flex flex-1 flex-wrap items-center gap-3">
              <div className="relative min-w-[200px] flex-1 max-w-sm">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  placeholder="Tìm theo tên, email..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-search pl-9"
                />
              </div>

              <select
                value={filterHocVi}
                onChange={(e) => setFilterHocVi(e.target.value)}
                className="select-field w-40"
              >
                <option value="">-- Học vị --</option>
                {HOC_VI_OPTIONS.map((hv) => (
                  <option key={hv} value={hv}>
                    {hv}
                  </option>
                ))}
              </select>

              <select
                value={filterDonVi}
                onChange={(e) => setFilterDonVi(e.target.value)}
                className="select-field w-48"
              >
                <option value="">-- Đơn vị --</option>
                {donViList.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ten}
                  </option>
                ))}
              </select>
            </div>

            <button onClick={openCreate} className="btn-primary">
              <Plus size={16} /> Thêm nhân sự
            </button>
          </div>

          <div>
            <div className="card overflow-x-auto">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="th-cell">Họ tên</th>
                    <th className="th-cell">Học vị / Chức danh</th>
                    <th className="th-cell">Đơn vị</th>
                    <th className="th-cell text-center">Chứng chỉ</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((ns) => {
                    const active = detail?.id === ns.id;
                    const hasWarning = hanSapHet(ns.hanChungChi);

                    return (
                      <tr
                        key={ns.id}
                        onClick={() => setDetailId(ns.id)}
                        className={cn(
                          'tr-hover cursor-pointer',
                          active && 'bg-primary-subtle/50 dark:bg-primary-900/20',
                        )}
                      >
                        <td className="td-cell">
                          <div className="font-semibold text-ink">{ns.hoTen}</div>
                          <div className="text-2xs text-ink-muted">{ns.email || '—'}</div>
                        </td>
                        <td className="td-cell">
                          <div className="text-ink">{ns.hocVi || '—'}</div>
                          <div className="text-2xs text-ink-muted">{ns.chucDanh || '—'}</div>
                        </td>
                        <td className="td-cell text-ink-secondary">
                          {ns.donViId ? donViMap.get(ns.donViId) ?? ns.donViId : '—'}
                        </td>
                        <td className="td-cell text-center">
                          <span className="inline-flex items-center gap-1 rounded-full bg-subtle px-2 py-0.5 text-xs font-bold text-ink-secondary">
                            {ns.chungChi || 'Không'}
                            {hasWarning && (
                              <span title="Có chứng chỉ sắp hết hạn">
                                <ShieldAlert size={13} className="text-warning" />
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="td-cell text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => openEdit(ns)}
                              className="rounded p-1 text-ink-muted hover:bg-muted hover:text-ink"
                              title="Sửa"
                            >
                              <Pencil size={15} />
                            </button>
                            <button
                              onClick={() => handleDelete(ns)}
                              className="rounded p-1 text-ink-muted hover:bg-danger-subtle hover:text-danger"
                              title="Xóa"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
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
