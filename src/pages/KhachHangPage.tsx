import { useMemo, useState } from 'react';
import { Plus, Building2, Search, Pencil, Trash2, Phone, Mail, MapPin, User, FileText, LoaderCircle, Eye } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { DataState } from '../components/DataState';
import { KhachHangChiTietPanel } from '../components/KhachHangChiTietPanel';
import { useSlidePanel } from '../context/SlidePanelContext';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchKhachHang,
  createKhachHang,
  updateKhachHang,
  deleteKhachHang,
  LOAI_KHACH_HANG_OPTIONS,
  type KhachHang,
  type KhachHangInput,
  type LoaiKhachHang,
} from '../services/khachHang';
import { cn } from '../lib/utils';

const EMPTY_FORM: KhachHangInput = {
  tenToChuc: '',
  maSoThue: '',
  loai: 'chu-dau-tu',
  nguoiDaiDien: '',
  soDienThoai: '',
  email: '',
  diaChi: '',
};

const LOAI_BADGE: Record<LoaiKhachHang, { label: string; cls: string }> = {
  'chu-dau-tu': { label: 'Chủ đầu tư', cls: 'bg-primary/10 text-primary' },
  'nha-thau': { label: 'Nhà thầu', cls: 'bg-accent-bg text-accent' },
  'doi-tac-khcn': { label: 'Đối tác KHCN', cls: 'bg-success/10 text-success' },
  khac: { label: 'Khác', cls: 'bg-subtle text-ink-muted' },
};

export function KhachHangPage() {
  const { data: list, loading, error, refetch } = useAsyncData(fetchKhachHang, []);
  const { openPanel } = useSlidePanel();
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KhachHang | null>(null);
  const [form, setForm] = useState<KhachHangInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [thaoTacError, setThaoTacError] = useState<string | null>(null);

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const q = search.toLowerCase();
      if (q && !item.tenToChuc.toLowerCase().includes(q) && !item.maSoThue.toLowerCase().includes(q) && !item.nguoiDaiDien.toLowerCase().includes(q)) return false;
      if (filterLoai && item.loai !== filterLoai) return false;
      return true;
    });
  }, [list, search, filterLoai]);

  // Statistics
  const countCdt = list.filter((x) => x.loai === 'chu-dau-tu').length;
  const countNhaThau = list.filter((x) => x.loai === 'nha-thau').length;
  const countDoiTac = list.filter((x) => x.loai === 'doi-tac-khcn').length;
  const totalHĐ = list.reduce((sum, item) => sum + item.soHopDongDaKy, 0);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm(EMPTY_FORM);
    setThaoTacError(null);
    setModalOpen(true);
  };

  const handleOpenEdit = (item: KhachHang) => {
    setEditingItem(item);
    setForm({
      tenToChuc: item.tenToChuc,
      maSoThue: item.maSoThue,
      loai: item.loai,
      nguoiDaiDien: item.nguoiDaiDien,
      soDienThoai: item.soDienThoai,
      email: item.email,
      diaChi: item.diaChi,
    });
    setThaoTacError(null);
    setModalOpen(true);
  };

  const handleDelete = async (item: KhachHang) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa hồ sơ "${item.tenToChuc}"?`)) return;
    setThaoTacError(null);
    try {
      await deleteKhachHang(item.id);
      refetch();
    } catch (e) {
      setThaoTacError(e instanceof Error ? e.message : String(e));
    }
  };

  const handleOpenChiTiet = (item: KhachHang) => {
    openPanel({
      id: `khach-hang-${item.id}`,
      title: item.tenToChuc,
      subtitle: LOAI_KHACH_HANG_OPTIONS.find((o) => o.value === item.loai)?.label,
      icon: <Building2 size={16} />,
      content: <KhachHangChiTietPanel khachHang={item} />,
      defaultWidth: 480,
      storageKey: 'panel-khach-hang',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setThaoTacError(null);
    try {
      if (editingItem) {
        await updateKhachHang(editingItem.id, form);
      } else {
        await createKhachHang(form);
      }
      setModalOpen(false);
      refetch();
    } catch (err) {
      setThaoTacError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Khách hàng & Đối tác"
        subtitle="Quản lý thông tin hồ sơ Chủ đầu tư, Nhà thầu, Đơn vị liên danh và Đối tác hợp tác Khoa học công nghệ toàn cầu"
        actions={
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Thêm khách hàng / đối tác
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard icon={Building2} label="Chủ đầu tư" value={String(countCdt)} tone="primary" />
        <KpiCard icon={User} label="Nhà thầu / Tổng thầu" value={String(countNhaThau)} tone="success" />
        <KpiCard icon={Building2} label="Đối tác KHCN & Đào tạo" value={String(countDoiTac)} tone="warning" />
        <KpiCard icon={FileText} label="Tổng số Hợp đồng liên kết" value={String(totalHĐ)} tone="accent" />
      </div>

      {/* Toolbar */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
            placeholder="Tìm theo tên tổ chức, mã số thuế, đại diện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={cn(inputCls, 'w-auto min-w-44')}
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
        >
          <option value="">Tất cả phân loại</option>
          {LOAI_KHACH_HANG_OPTIONS.map((o) => (
            <option key={o.value} value={o.value}>{o.label}</option>
          ))}
        </select>
      </div>

      <DataState loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {thaoTacError && !modalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {thaoTacError}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="th-cell">Tên đơn vị / Tổ chức</th>
              <th className="th-cell">Mã số thuế</th>
              <th className="th-cell">Phân loại</th>
              <th className="th-cell">Người đại diện</th>
              <th className="th-cell">Thông tin liên hệ</th>
              <th className="th-cell">Địa chỉ trụ sở</th>
              <th className="th-cell text-center">Số HĐ ký</th>
              <th className="th-cell w-20 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="tr-hover">
                <td className="td-cell font-semibold max-w-xs truncate">
                  <button
                    onClick={() => handleOpenChiTiet(item)}
                    className="truncate text-left hover:text-primary hover:underline"
                    title={item.tenToChuc}
                  >
                    {item.tenToChuc}
                  </button>
                </td>
                <td className="td-cell font-mono text-xs text-primary font-bold">{item.maSoThue || '—'}</td>
                <td className="td-cell">
                  <span className={cn('inline-flex items-center px-2 py-0.5 rounded text-xs font-black', LOAI_BADGE[item.loai].cls)}>
                    {LOAI_BADGE[item.loai].label}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{item.nguoiDaiDien || '—'}</td>
                <td className="td-cell">
                  <div className="text-xs text-ink-secondary space-y-0.5">
                    {item.soDienThoai && <p className="flex items-center gap-1"><Phone size={12} className="text-ink-muted" /> {item.soDienThoai}</p>}
                    {item.email && <p className="flex items-center gap-1"><Mail size={12} className="text-ink-muted" /> {item.email}</p>}
                    {!item.soDienThoai && !item.email && '—'}
                  </div>
                </td>
                <td className="td-cell text-ink-secondary text-xs max-w-xs truncate" title={item.diaChi}>
                  {item.diaChi ? (
                    <p className="flex items-start gap-1"><MapPin size={12} className="text-ink-muted mt-0.5 shrink-0" /> {item.diaChi}</p>
                  ) : '—'}
                </td>
                <td className="td-cell text-center font-mono text-xs font-bold text-ink-secondary">{item.soHopDongDaKy}</td>
                <td className="td-cell">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleOpenChiTiet(item)}
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                      title="Xem hồ sơ 360°"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredList.length === 0 && list.length > 0 && (
              <tr>
                <td colSpan={8} className="td-cell py-6 text-center text-ink-muted">
                  Không tìm thấy thông tin phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={editingItem ? `Sửa hồ sơ: ${editingItem.tenToChuc}` : 'Thêm hồ sơ Khách hàng / Đối tác'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên tổ chức / Doanh nghiệp / Đơn vị" required>
            <input
              className={inputCls}
              required
              value={form.tenToChuc}
              onChange={(e) => setForm({ ...form, tenToChuc: e.target.value })}
              placeholder="VD: Tổng công ty Xây dựng và Phát triển Hạ tầng LICOGI"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã số thuế" required>
              <input
                className={inputCls}
                required
                value={form.maSoThue}
                onChange={(e) => setForm({ ...form, maSoThue: e.target.value })}
                placeholder="VD: 0100123456"
              />
            </Field>
            <Field label="Phân loại đối tác" required>
              <select
                className={inputCls}
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value as LoaiKhachHang })}
              >
                {LOAI_KHACH_HANG_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Người đại diện pháp luật">
              <input
                className={inputCls}
                value={form.nguoiDaiDien}
                onChange={(e) => setForm({ ...form, nguoiDaiDien: e.target.value })}
                placeholder="VD: Ông Nguyễn Văn A"
              />
            </Field>
            <Field label="Số điện thoại liên hệ" required>
              <input
                className={inputCls}
                required
                value={form.soDienThoai}
                onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                placeholder="VD: 024-3869XXXX"
              />
            </Field>
            <Field label="Email liên hệ">
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="VD: vanphong@doitac.vn"
              />
            </Field>
          </div>
          <Field label="Địa chỉ trụ sở chính" required>
            <input
              className={inputCls}
              required
              value={form.diaChi}
              onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
              placeholder="VD: Số 12A, phố ABC, quận XYZ, Hà Nội"
            />
          </Field>

          {thaoTacError && modalOpen && (
            <p className="text-xs font-semibold text-danger">{thaoTacError}</p>
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
              {editingItem ? 'Lưu thay đổi' : 'Thêm hồ sơ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
