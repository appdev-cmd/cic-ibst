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
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { ChungChiPanel } from '../components/DetailPanels';
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
import { formatNgay, cn } from '../lib/utils';

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
  return new Date(iso).getTime() - Date.now() < 90 * 24 * 3600 * 1000;
}

export function NhanSuPage() {
  const { data: nhanSuList, loading, error, refetch } = useAsyncData(fetchNhanSuFull, []);
  const { data: donViList } = useAsyncData(fetchDonVi, []);

  const [search, setSearch] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [filterSapHetHan, setFilterSapHetHan] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<NhanSu | null>(null);
  const [form, setForm] = useState<NhanSuInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [ccNhanSu, setCcNhanSu] = useState<NhanSu | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return nhanSuList.filter((ns) => {
      if (q && !`${ns.hoTen} ${ns.chucDanh} ${ns.chungChi}`.toLowerCase().includes(q)) return false;
      if (filterDonVi && ns.donViId !== filterDonVi) return false;
      if (filterSapHetHan && !(ns.hanChungChi && hanSapHet(ns.hanChungChi))) return false;
      return true;
    });
  }, [nhanSuList, search, filterDonVi, filterSapHetHan]);

  // KPI tính từ dữ liệu thật
  const soTienSi = nhanSuList.filter((ns) => ns.hocVi.includes('Tiến sĩ')).length;
  const soThacSi = nhanSuList.filter((ns) => ns.hocVi.includes('Thạc sĩ')).length;
  const soGsPgs = nhanSuList.filter((ns) => ns.hocVi.includes('Giáo sư')).length;
  const soSapHetHan = nhanSuList.filter((ns) => ns.hanChungChi && hanSapHet(ns.hanChungChi)).length;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setActionError(null);
    setModalOpen(true);
  };

  const openEdit = (ns: NhanSu) => {
    setEditing(ns);
    setForm({
      hoTen: ns.hoTen,
      hocVi: ns.hocVi,
      chucDanh: ns.chucDanh,
      donViId: ns.donViId ?? '',
      email: ns.email,
      soDienThoai: ns.soDienThoai,
      trangThaiLamViec: ns.trangThaiLamViec,
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      if (editing) await updateNhanSu(editing.id, form);
      else await createNhanSu(form);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (ns: NhanSu) => {
    if (!window.confirm(`Xóa hồ sơ "${ns.hoTen}"?\nChỉ xóa được khi không còn đề tài/chứng chỉ tham chiếu.`)) return;
    setActionError(null);
    try {
      await deleteNhanSu(ns.id);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(
        msg.includes('foreign key')
          ? 'Không thể xóa: nhân sự đang có dữ liệu tham chiếu (đề tài chủ nhiệm, chứng chỉ hành nghề, phụ trách đơn vị...).'
          : msg,
      );
    }
  };

  return (
    <div>
      <PageHeader
        title="Nhân sự"
        subtitle="Hồ sơ CBVC theo đơn vị trực thuộc, chức danh khoa học và chứng chỉ hành nghề (dữ liệu cá nhân — QĐ 946/QĐ-BXD)"
        actions={
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Thêm hồ sơ
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Users} label="CBVC trên hệ thống" value={String(nhanSuList.length)} tone="primary" />
        <KpiCard icon={GraduationCap} label="GS/PGS — TS — ThS" value={`${soGsPgs} — ${soTienSi} — ${soThacSi}`} tone="success" />
        <KpiCard icon={ShieldAlert} label="Chứng chỉ sắp hết hạn (90 ngày)" value={String(soSapHetHan)} tone="accent" />
        <KpiCard icon={Users} label="Đơn vị có nhân sự" value={String(new Set(nhanSuList.map((n) => n.donViId).filter(Boolean)).size)} tone="warning" />
      </div>

      {/* Thanh công cụ lọc */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
            placeholder="Tìm theo tên, chức danh, chứng chỉ..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={cn(inputCls, 'w-auto min-w-44')}
          value={filterDonVi}
          onChange={(e) => setFilterDonVi(e.target.value)}
        >
          <option value="">Tất cả đơn vị</option>
          {donViList.map((dv) => (
            <option key={dv.id} value={dv.id}>
              {dv.ten}
            </option>
          ))}
        </select>
        <label className="flex cursor-pointer items-center gap-2 text-xs font-semibold text-ink-secondary">
          <input
            type="checkbox"
            checked={filterSapHetHan}
            onChange={(e) => setFilterSapHetHan(e.target.checked)}
            className="h-4 w-4 accent-[#00668c]"
          />
          Chứng chỉ sắp hết hạn
        </label>
        <span className="ml-auto font-mono text-xs text-ink-muted">
          {filtered.length}/{nhanSuList.length}
        </span>
      </div>

      <DataState loading={loading} error={error} empty={nhanSuList.length === 0} />
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {actionError}
        </div>
      )}

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr>
              <th className="th-cell">Họ tên</th>
              <th className="th-cell">Chức danh</th>
              <th className="th-cell">Học hàm / học vị</th>
              <th className="th-cell">Đơn vị</th>
              <th className="th-cell">Chứng chỉ hành nghề</th>
              <th className="th-cell">Hạn chứng chỉ</th>
              <th className="th-cell">Liên hệ</th>
              <th className="th-cell w-20 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((ns) => (
              <tr key={ns.id} className="tr-hover">
                <td className="td-cell font-semibold">{ns.hoTen}</td>
                <td className="td-cell text-ink-secondary">{ns.chucDanh}</td>
                <td className="td-cell text-ink-secondary">{ns.hocVi || '—'}</td>
                <td className="td-cell max-w-52 truncate text-ink-secondary" title={ns.donVi}>
                  {ns.donVi || '—'}
                </td>
                <td className="td-cell text-ink-secondary">{ns.chungChi}</td>
                <td className="td-cell">
                  {ns.hanChungChi ? (
                    <span
                      className={cn(
                        'font-mono text-xs',
                        hanSapHet(ns.hanChungChi) &&
                          'rounded bg-red-50 px-1.5 py-0.5 font-semibold text-danger dark:bg-red-900/20 dark:text-red-400',
                      )}
                    >
                      {formatNgay(ns.hanChungChi)}
                    </span>
                  ) : (
                    <span className="text-xs text-ink-muted">—</span>
                  )}
                </td>
                <td className="td-cell text-xs text-ink-muted">
                  {ns.email || ns.soDienThoai || '—'}
                </td>
                <td className="td-cell">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => setCcNhanSu(ns)}
                      title="Chứng chỉ hành nghề"
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <ShieldCheck size={14} />
                    </button>
                    <button
                      onClick={() => openEdit(ns)}
                      title="Sửa hồ sơ"
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(ns)}
                      title="Xóa hồ sơ"
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filtered.length === 0 && nhanSuList.length > 0 && (
              <tr>
                <td colSpan={8} className="td-cell py-6 text-center text-ink-muted">
                  Không có nhân sự phù hợp bộ lọc.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal thêm/sửa hồ sơ */}
      <Modal
        title={editing ? `Sửa hồ sơ: ${editing.hoTen}` : 'Thêm hồ sơ CBVC'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Họ và tên" required>
              <input
                className={inputCls}
                required
                maxLength={150}
                value={form.hoTen}
                onChange={(e) => setForm({ ...form, hoTen: e.target.value })}
                placeholder="Nguyễn Văn A"
              />
            </Field>
            <Field label="Học hàm / học vị">
              <select
                className={inputCls}
                value={form.hocVi}
                onChange={(e) => setForm({ ...form, hocVi: e.target.value })}
              >
                <option value="">— Chọn —</option>
                {HOC_VI_OPTIONS.map((hv) => (
                  <option key={hv} value={hv}>
                    {hv}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chức danh">
              <input
                className={inputCls}
                maxLength={150}
                value={form.chucDanh}
                onChange={(e) => setForm({ ...form, chucDanh: e.target.value })}
                placeholder="VD: Nghiên cứu viên chính"
              />
            </Field>
            <Field label="Đơn vị" required>
              <select
                className={inputCls}
                required
                value={form.donViId}
                onChange={(e) => setForm({ ...form, donViId: e.target.value })}
              >
                <option value="">— Chọn đơn vị —</option>
                {donViList.map((dv) => (
                  <option key={dv.id} value={dv.id}>
                    {dv.ten}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                maxLength={150}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="ten@ibst.vn"
              />
            </Field>
            <Field label="Số điện thoại">
              <input
                className={inputCls}
                maxLength={130}
                value={form.soDienThoai}
                onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Trạng thái">
            <select
              className={inputCls}
              value={form.trangThaiLamViec}
              onChange={(e) => setForm({ ...form, trangThaiLamViec: e.target.value })}
            >
              <option value="dang-lam-viec">Đang làm việc</option>
              <option value="nghi-huu">Nghỉ hưu</option>
              <option value="da-nghi-viec">Đã nghỉ việc</option>
            </select>
          </Field>
          {actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
            >
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving && <LoaderCircle size={15} className="animate-spin" />}
              {editing ? 'Lưu thay đổi' : 'Thêm hồ sơ'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal chứng chỉ hành nghề */}
      <Modal
        title={ccNhanSu ? `Chứng chỉ hành nghề: ${ccNhanSu.hoTen}` : ''}
        open={ccNhanSu !== null}
        onClose={() => setCcNhanSu(null)}
        wide
      >
        {ccNhanSu && (
          <ChungChiPanel key={ccNhanSu.id} nhanSuId={ccNhanSu.id} onChanged={refetch} />
        )}
      </Modal>
    </div>
  );
}
