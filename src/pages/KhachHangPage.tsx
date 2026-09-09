import { useMemo, useState } from 'react';
import { Plus, Building2, Search, Pencil, Trash2, Phone, Mail, MapPin, User, FileText, LoaderCircle, Eye, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Field, inputCls } from '../components/Modal';
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

function KhachHangFormPanel({
  item,
  onSuccess,
  onCancel,
}: {
  item?: KhachHang | null;
  onSuccess: () => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<KhachHangInput>(
    item
      ? {
          tenToChuc: item.tenToChuc,
          maSoThue: item.maSoThue,
          loai: item.loai,
          nguoiDaiDien: item.nguoiDaiDien,
          soDienThoai: item.soDienThoai,
          email: item.email,
          diaChi: item.diaChi,
        }
      : EMPTY_FORM,
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (item) {
        await updateKhachHang(item.id, form);
      } else {
        await createKhachHang(form);
      }
      onSuccess();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex h-full flex-col justify-between p-4 space-y-4">
      <div className="space-y-4 overflow-y-auto pr-1">
        <div className="rounded-xl border border-sky-200 bg-sky-50/60 dark:border-sky-900/40 dark:bg-sky-950/20 p-3 text-xs space-y-1 text-sky-900 dark:text-sky-200">
          <p className="font-bold flex items-center gap-1.5">
            <Building2 size={15} className="text-sky-600" /> Hồ sơ Khách hàng & Đối tác 360°
          </p>
          <p className="text-[11px]">
            Quản lý thông tin pháp nhân Chủ đầu tư, Nhà thầu & Đối tác liên danh phục vụ công tác Hợp đồng (Điều 6 QC 2815) và Đấu thầu (Điều 5.1 QC 2815).
          </p>
        </div>

        <Field label="Tên tổ chức / Doanh nghiệp / Đơn vị" required>
          <input
            className={inputCls}
            required
            value={form.tenToChuc}
            onChange={(e) => setForm({ ...form, tenToChuc: e.target.value })}
            placeholder="VD: Tổng công ty Xây dựng và Phát triển Hạ tầng LICOGI"
          />
        </Field>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
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
        </div>

        <Field label="Email liên hệ">
          <input
            type="email"
            className={inputCls}
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            placeholder="VD: vanphong@doitac.vn"
          />
        </Field>

        <Field label="Địa chỉ trụ sở chính" required>
          <textarea
            className={inputCls}
            rows={2}
            required
            value={form.diaChi}
            onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
            placeholder="VD: Số 12A, phố ABC, quận XYZ, Hà Nội"
          />
        </Field>

        {error && (
          <p className="text-2xs font-semibold text-danger">{error}</p>
        )}
      </div>

      <div className="sticky bottom-0 z-10 flex items-center justify-end gap-2 border-t border-border-subtle bg-surface/95 pt-3 backdrop-blur-md">
        <button
          type="button"
          onClick={onCancel}
          className="btn-ghost"
        >
          Hủy
        </button>
        <button type="submit" disabled={saving} className="btn-primary py-2 px-5 text-xs font-bold gap-2">
          {saving ? <LoaderCircle size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
          {item ? 'Lưu thay đổi' : 'Tạo mới Hồ sơ'}
        </button>
      </div>
    </form>
  );
}

export function KhachHangPage() {
  const { data: list, loading, error, refetch } = useAsyncData(fetchKhachHang, []);
  const { openPanel, closePanel } = useSlidePanel();
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');
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
    openPanel({
      id: 'khach-hang-create',
      title: 'Thêm mới Hồ sơ Khách hàng / Đối tác',
      subtitle: 'Tạo mới Chủ đầu tư, Nhà thầu hoặc Đối tác liên danh',
      icon: <Building2 size={16} />,
      content: (
        <KhachHangFormPanel
          onSuccess={() => {
            closePanel('khach-hang-create');
            refetch();
          }}
          onCancel={() => closePanel('khach-hang-create')}
        />
      ),
      storageKey: 'panel-khach-hang-form',
    });
  };

  const handleOpenEdit = (item: KhachHang) => {
    const panelId = `khach-hang-edit-${item.id}`;
    openPanel({
      id: panelId,
      title: `Chỉnh sửa: ${item.tenToChuc}`,
      subtitle: 'Cập nhật thông tin pháp nhân & liên hệ đối tác',
      icon: <Building2 size={16} />,
      content: (
        <KhachHangFormPanel
          item={item}
          onSuccess={() => {
            closePanel(panelId);
            refetch();
          }}
          onCancel={() => closePanel(panelId)}
        />
      ),
      storageKey: 'panel-khach-hang-form',
    });
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
      storageKey: 'panel-khach-hang',
    });
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
      {thaoTacError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {thaoTacError}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <table className="w-full min-w-[960px]">
          <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-[#1f2332]">
            <tr>
              <th className="th-cell w-10 text-center">#</th>
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
            {filteredList.map((item, idx) => (
              <tr key={item.id} className="tr-hover">
                <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
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
                      title="Chỉnh sửa hồ sơ"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item)}
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger"
                      title="Xóa hồ sơ"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {!loading && filteredList.length === 0 && list.length > 0 && (
              <tr>
                <td colSpan={9} className="td-cell py-6 text-center text-ink-muted">
                  Không tìm thấy thông tin phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>
      </div>
    </div>
  );
}
