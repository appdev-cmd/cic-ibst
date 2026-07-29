import { useMemo, useState, type FormEvent } from 'react';
import {
  Plus,
  Users,
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
import { Modal, Field, inputCls } from '../components/Modal';
import { ChungChiPanel } from '../components/DetailPanels';
import { DaoTaoPage } from './DaoTaoPage';
import { useAsyncData } from '../hooks/useAsyncData';
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

type MainTab = 'nhan-su' | 'dao-tao-ncs' | 'dang-doan-the';

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

const MOCK_DANG_DOAN = [
  { id: 'd-1', hoTen: 'GS. TS. Nguyễn Xuân Khang', loai: 'Đảng viên', chucVu: 'Bí thư Đảng ủy Viện', chiBo: 'Chi bộ Khối Cơ quan Viện', ngayVaoDang: '1995-02-03', dangPhi: '100% Đã nộp Q3/2026' },
  { id: 'd-2', hoTen: 'PGS. TS. Trần Việt Hùng', loai: 'Đảng viên', chucVu: 'Phó Bí thư Đảng ủy', chiBo: 'Chi bộ Quản lý Khoa học', ngayVaoDang: '2001-05-19', dangPhi: '100% Đã nộp Q3/2026' },
  { id: 'd-3', hoTen: 'ThS. Lê Hoàng Nam', loai: 'Đoàn viên', chucVu: 'Bí thư Đoàn Thanh niên Viện', chiBo: 'Đoàn Thanh niên IBST', ngayVaoDang: '—', dangPhi: '100% Đã nộp Q3/2026' },
  { id: 'd-4', hoTen: 'TS. Vũ Thành Trung', loai: 'Đảng viên', chucVu: 'Chi ủy viên', chiBo: 'Chi bộ P.QLKH', ngayVaoDang: '2008-09-02', dangPhi: '100% Đã nộp Q3/2026' },
];

export function NhanSuPage() {
  const [mainTab, setMainTab] = useState<MainTab>('nhan-su');

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

  const [detail, setDetail] = useState<NhanSu | null>(null);

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
      if (detail?.id === item.id) setDetail(null);
      refetch();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div>
      <PageHeader
        title="[Phân hệ 5] Quản lý Tổ chức Nhân sự, Đào tạo & Đảng - Đoàn thể"
        subtitle="Hồ sơ CBNV, chứng chỉ hành nghề xây dựng, đào tạo NCS Tiến sĩ & Sinh hoạt Đảng viên/Đoàn viên"
      />

      {/* Main Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
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

      {mainTab === 'dao-tao-ncs' && <DaoTaoPage />}

      {mainTab === 'dang-doan-the' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 border-l-4 border-l-red-600">
              <p className="text-2xs font-bold uppercase text-ink-muted">Tổng số Đảng viên</p>
              <p className="mt-1 text-xl font-black text-red-600 dark:text-red-400">142 Đảng viên</p>
              <p className="text-2xs text-ink-muted mt-1">Sinh hoạt tại 12 Chi bộ trực thuộc</p>
            </div>
            <div className="card p-4 border-l-4 border-l-blue-600">
              <p className="text-2xs font-bold uppercase text-ink-muted">Đoàn viên Thanh niên</p>
              <p className="mt-1 text-xl font-black text-blue-600 dark:text-blue-400">98 Đoàn viên</p>
              <p className="text-2xs text-ink-muted mt-1">Chi đoàn Khối kỹ thuật & thí nghiệm</p>
            </div>
            <div className="card p-4 border-l-4 border-l-emerald-600">
              <p className="text-2xs font-bold uppercase text-ink-muted">Đảng phí / Đoàn phí Q3/2026</p>
              <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">100% Hoàn tất</p>
              <p className="text-2xs text-ink-muted mt-1">Số hóa thu chi trực tuyến</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border bg-subtle p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Flag size={16} className="text-red-600" />
                Danh sách Hồ sơ Đảng viên - Đoàn viên Tiêu biểu
              </h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[650px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 font-bold text-ink-muted">
                    <th className="p-3">Họ tên cán bộ</th>
                    <th className="p-3">Phân loại</th>
                    <th className="p-3">Chức vụ Đảng/Đoàn</th>
                    <th className="p-3">Chi bộ / Sinh hoạt</th>
                    <th className="p-3">Ngày kết nạp</th>
                    <th className="p-3">Tình trạng Đảng phí</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_DANG_DOAN.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-ink">{item.hoTen}</td>
                      <td className="p-3">
                        <span className={cn(
                          "rounded-full px-2.5 py-0.5 text-2xs font-bold",
                          item.loai === 'Đảng viên' ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                        )}>
                          {item.loai}
                        </span>
                      </td>
                      <td className="p-3 text-ink-secondary">{item.chucVu}</td>
                      <td className="p-3 text-ink-muted">{item.chiBo}</td>
                      <td className="p-3 text-ink-muted">{item.ngayVaoDang}</td>
                      <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">{item.dangPhi}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

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

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card overflow-x-auto lg:col-span-2">
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
                        onClick={() => setDetail(ns)}
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

            <div className="lg:col-span-1">
              <ChungChiPanel nhanSuId={detail?.id ?? ''} onChanged={refetch} />
            </div>
          </div>
        </>
      )}

      {/* Modal Thêm/Sửa */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingItem ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}
      >
        <form onSubmit={handleSave} className="space-y-4">
          {formError && (
            <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{formError}</div>
          )}

          <Field label="Họ và tên" required>
            <input
              type="text"
              required
              value={form.hoTen}
              onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Học vị">
              <select
                value={form.hocVi}
                onChange={(e) => setForm({ ...form, hocVi: e.target.value })}
                className={inputCls}
              >
                <option value="">-- Chọn --</option>
                {HOC_VI_OPTIONS.map((hv) => (
                  <option key={hv} value={hv}>
                    {hv}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Chức danh">
              <input
                type="text"
                value={form.chucDanh}
                onChange={(e) => setForm({ ...form, chucDanh: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Đơn vị công tác">
            <select
              value={form.donViId}
              onChange={(e) => setForm({ ...form, donViId: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Chọn đơn vị --</option>
              {donViList.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.ten}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Email">
              <input
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Số điện thoại">
              <input
                type="text"
                value={form.soDienThoai}
                onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => setModalOpen(false)} className="btn-ghost">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary">
              {saving && <LoaderCircle size={15} className="animate-spin" />}
              {editingItem ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
