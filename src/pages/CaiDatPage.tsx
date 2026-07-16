import { useMemo, useState } from 'react';
import { Users, ListTree, ScrollText, ShieldX, LoaderCircle, Sun, Moon, Leaf, Palette, Layout, User } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, Pagination, RowActions } from '../components/TableToolbar';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import {
  fetchNguoiDung,
  updateNguoiDung,
  fetchDanhMuc,
  createDanhMuc,
  updateDanhMuc,
  deleteDanhMuc,
  fetchNhatKy,
  VAI_TRO_LABEL,
  VAI_TRO_OPTIONS,
  type DanhMuc,
  type DanhMucInput,
  type NguoiDung,
} from '../services/quantri';
import { cn } from '../lib/utils';

type Tab = 'ca-nhan' | 'nguoi-dung' | 'danh-muc' | 'nhat-ky';

const HANH_DONG_LABEL: Record<string, { label: string; cls: string }> = {
  INSERT: { label: 'Thêm', cls: 'text-success' },
  UPDATE: { label: 'Sửa', cls: 'text-warning' },
  DELETE: { label: 'Xóa', cls: 'text-danger' },
};

export function CaiDatPage() {
  const { vaiTro } = useAuth();
  const [tab, setTab] = useState<Tab>('ca-nhan');

  const tabs = useMemo(() => {
    const list = [{ id: 'ca-nhan' as Tab, label: 'Cài đặt cá nhân', icon: User }];
    if (vaiTro === 'quan-tri') {
      list.push(
        { id: 'nguoi-dung' as Tab, label: 'Người dùng & vai trò', icon: Users },
        { id: 'danh-muc' as Tab, label: 'Danh mục dữ liệu', icon: ListTree },
        { id: 'nhat-ky' as Tab, label: 'Nhật ký dữ liệu', icon: ScrollText }
      );
    }
    return list;
  }, [vaiTro]);

  return (
    <div>
      <PageHeader title="Cài đặt" subtitle="Tùy chỉnh giao diện cá nhân và quản lý cấu hình hệ thống" />

      <div className="mb-4 flex gap-1 rounded-xl bg-muted p-1 w-fit">
        {tabs.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-bold transition-all',
              tab === id
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            <Icon size={15} /> {label}
          </button>
        ))}
      </div>

      {tab === 'ca-nhan' && <CaNhanTab />}
      {tab === 'nguoi-dung' && vaiTro === 'quan-tri' && <NguoiDungTab />}
      {tab === 'danh-muc' && vaiTro === 'quan-tri' && <DanhMucTab />}
      {tab === 'nhat-ky' && vaiTro === 'quan-tri' && <NhatKyTab />}
    </div>
  );
}

function CaNhanTab() {
  const { theme, setTheme, primaryColor, setPrimaryColor } = useTheme();

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Background Theme */}
      <div className="card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
          <Layout size={18} className="text-primary-500" />
          Môi trường nền (Theme Background)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setTheme('light')}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border p-5 transition-all hover:bg-muted text-center w-full',
              theme === 'light'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-subtle'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              theme === 'light' ? 'bg-primary-500 text-white' : 'bg-muted text-ink-muted'
            )}>
              <Sun size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Giao diện Sáng</p>
              <p className="mt-1 text-2xs text-ink-muted">Tối ưu độ sáng khi làm việc ban ngày</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('nature')}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border p-5 transition-all hover:bg-muted text-center w-full',
              theme === 'nature'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-subtle'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              theme === 'nature' ? 'bg-primary-500 text-white' : 'bg-muted text-ink-muted'
            )}>
              <Leaf size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Bảo vệ mắt</p>
              <p className="mt-1 text-2xs text-ink-muted">Tông màu cát ấm dịu nhẹ, hạn chế mỏi mắt</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTheme('dark')}
            className={cn(
              'flex flex-col items-center gap-3 rounded-xl border p-5 transition-all hover:bg-muted text-center w-full',
              theme === 'dark'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-subtle'
            )}
          >
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-full',
              theme === 'dark' ? 'bg-primary-500 text-white' : 'bg-muted text-ink-muted'
            )}>
              <Moon size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-ink">Giao diện Tối</p>
              <p className="mt-1 text-2xs text-ink-muted">Tiết kiệm pin, thân thiện trong bóng tối</p>
            </div>
          </button>
        </div>
      </div>

      {/* Primary Color Theme */}
      <div className="card p-6">
        <h3 className="mb-4 flex items-center gap-2 text-sm font-bold text-ink">
          <Palette size={18} className="text-primary-500" />
          Màu sắc chủ đạo (Primary Theme Color)
        </h3>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <button
            type="button"
            onClick={() => setPrimaryColor('teal')}
            className={cn(
              'flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-muted text-left w-full',
              primaryColor === 'teal'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-subtle'
            )}
          >
            <div className="h-10 w-10 rounded-full bg-[#00668c] border border-black/10 shrink-0" />
            <div>
              <p className="text-sm font-bold text-ink">Xanh mặc định (Teal)</p>
              <p className="text-2xs text-ink-muted">Màu mặc định của hệ thống</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPrimaryColor('red')}
            className={cn(
              'flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-muted text-left w-full',
              primaryColor === 'red'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-subtle'
            )}
          >
            <div className="h-10 w-10 rounded-full bg-[#ae1e23] border border-black/10 shrink-0" />
            <div>
              <p className="text-sm font-bold text-ink">Đỏ thương hiệu IBST</p>
              <p className="text-2xs text-ink-muted">Sắc đỏ đặc trưng từ Logo</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setPrimaryColor('blue')}
            className={cn(
              'flex items-center gap-4 rounded-xl border p-4 transition-all hover:bg-muted text-left w-full',
              primaryColor === 'blue'
                ? 'border-primary-500 bg-primary-50/50 dark:bg-primary-900/10'
                : 'border-border bg-subtle'
            )}
          >
            <div className="h-10 w-10 rounded-full bg-[#0f52ba] border border-black/10 shrink-0" />
            <div>
              <p className="text-sm font-bold text-ink">Xanh Bộ Xây dựng</p>
              <p className="text-2xs text-ink-muted">Xanh dương đậm hoàng gia</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
}

// ═══ NGƯỜI DÙNG ═══

function NguoiDungTab() {
  const { data: list, loading, error, refetch } = useAsyncData(fetchNguoiDung, []);
  const [editing, setEditing] = useState<NguoiDung | null>(null);
  const [vaiTro, setVaiTro] = useState('chuyen-vien');
  const [trangThai, setTrangThai] = useState('hoat-dong');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const open = (nd: NguoiDung) => {
    setEditing(nd);
    setVaiTro(nd.vaiTro);
    setTrangThai(nd.trangThai);
    setErr(null);
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    setSaving(true);
    setErr(null);
    try {
      await updateNguoiDung(editing.userId, { vaiTro, trangThai });
      setEditing(null);
      refetch();
    } catch (er) {
      setErr(er instanceof Error ? er.message : String(er));
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <DataState loading={loading} error={error} empty={list.length === 0} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="th-cell">Họ tên</th>
              <th className="th-cell">Vai trò</th>
              <th className="th-cell">Đơn vị</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((nd) => (
              <tr key={nd.userId} className="tr-hover">
                <td className="td-cell font-semibold">{nd.hoTen}</td>
                <td className="td-cell">
                  <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-2xs font-black uppercase text-primary dark:bg-primary-900/30 dark:text-primary-300">
                    {VAI_TRO_LABEL[nd.vaiTro] ?? nd.vaiTro}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{nd.donVi || '—'}</td>
                <td className="td-cell">
                  {nd.trangThai === 'khoa' ? (
                    <span className="text-2xs font-black uppercase text-danger">Đã khóa</span>
                  ) : (
                    <span className="text-2xs font-black uppercase text-success">Hoạt động</span>
                  )}
                </td>
                <td className="td-cell">
                  <div className="flex justify-end">
                    <button
                      onClick={() => open(nd)}
                      className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted"
                    >
                      Phân quyền
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <Modal title={editing ? `Phân quyền: ${editing.hoTen}` : ''} open={editing !== null} onClose={() => setEditing(null)}>
        <form onSubmit={save} className="space-y-4">
          <Field label="Vai trò" required>
            <select className={inputCls} value={vaiTro} onChange={(e) => setVaiTro(e.target.value)}>
              {VAI_TRO_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </Field>
          <Field label="Trạng thái" required>
            <select className={inputCls} value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
              <option value="hoat-dong">Hoạt động</option>
              <option value="khoa">Khóa tài khoản</option>
            </select>
          </Field>
          {err && <p className="text-xs font-semibold text-danger">{err}</p>}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button type="button" onClick={() => setEditing(null)} className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary hover:bg-muted">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving && <LoaderCircle size={15} className="animate-spin" />}
              Lưu
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ═══ DANH MỤC ═══

const EMPTY_DM: DanhMucInput = { nhom: '', maMuc: '', tenMuc: '' };

function DanhMucTab() {
  const { data: list, loading, error, refetch } = useAsyncData(fetchDanhMuc, []);
  const [filterNhom, setFilterNhom] = useState('');

  const crud = useCrudForm<DanhMuc, DanhMucInput>({
    empty: EMPTY_DM,
    toForm: (d) => ({ nhom: d.nhom, maMuc: d.maMuc, tenMuc: d.tenMuc }),
    getId: (d) => d.id,
    create: createDanhMuc,
    update: updateDanhMuc,
    remove: deleteDanhMuc,
    deleteMessage: (d) => `Xóa mục "${d.tenMuc}"?`,
    onDone: refetch,
  });

  const nhomList = useMemo(() => [...new Set(list.map((d) => d.nhom))].sort(), [list]);
  const filtered = useMemo(
    () => (filterNhom ? list.filter((d) => d.nhom === filterNhom) : list),
    [list, filterNhom],
  );
  const table = useTableControls(filtered, (d) => `${d.nhom} ${d.maMuc} ${d.tenMuc}`);

  return (
    <>
      <DataState loading={loading} error={error} empty={list.length === 0} />
      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm nhóm, mã, tên mục..."
        total={table.total}
      >
        <select
          value={filterNhom}
          onChange={(e) => setFilterNhom(e.target.value)}
          className="rounded-lg border border-border bg-subtle px-2.5 py-2 text-xs font-semibold text-ink-secondary outline-none focus:border-primary-500"
        >
          <option value="">Tất cả nhóm</option>
          {nhomList.map((n) => (
            <option key={n} value={n}>{n}</option>
          ))}
        </select>
        <button onClick={crud.openCreate} className="btn-primary !py-2 text-xs">
          + Thêm mục
        </button>
      </TableToolbar>
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[560px]">
          <thead>
            <tr>
              <th className="th-cell">Nhóm</th>
              <th className="th-cell">Mã mục</th>
              <th className="th-cell">Tên mục</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.pageRows.map((d) => (
              <tr key={d.id} className="tr-hover">
                <td className="td-cell font-mono text-xs text-ink-secondary">{d.nhom}</td>
                <td className="td-cell font-mono text-xs font-semibold text-primary">{d.maMuc}</td>
                <td className="td-cell font-medium">{d.tenMuc}</td>
                <td className="td-cell">
                  <RowActions onEdit={() => crud.openEdit(d)} onDelete={() => crud.removeRow(d)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} onChange={table.setPage} />
      </div>

      <Modal
        title={crud.editing ? `Sửa mục: ${crud.editing.tenMuc}` : 'Thêm mục danh mục'}
        open={crud.modalOpen}
        onClose={crud.closeModal}
      >
        <form onSubmit={crud.submit} className="space-y-4">
          <Field label="Nhóm" required>
            <input
              className={inputCls}
              required
              list="nhom-list"
              value={crud.form.nhom}
              onChange={(e) => crud.setForm({ ...crud.form, nhom: e.target.value })}
              placeholder="VD: loai_don_vi"
            />
            <datalist id="nhom-list">
              {nhomList.map((n) => <option key={n} value={n} />)}
            </datalist>
          </Field>
          <Field label="Mã mục" required>
            <input
              className={inputCls}
              required
              value={crud.form.maMuc}
              onChange={(e) => crud.setForm({ ...crud.form, maMuc: e.target.value })}
              placeholder="VD: trung-tam"
            />
          </Field>
          <Field label="Tên mục" required>
            <input
              className={inputCls}
              required
              value={crud.form.tenMuc}
              onChange={(e) => crud.setForm({ ...crud.form, tenMuc: e.target.value })}
            />
          </Field>
          {crud.actionError && <p className="text-xs font-semibold text-danger">{crud.actionError}</p>}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button type="button" onClick={crud.closeModal} className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary hover:bg-muted">
              Hủy
            </button>
            <button type="submit" disabled={crud.saving} className="btn-primary disabled:opacity-60">
              {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
              {crud.editing ? 'Lưu' : 'Thêm'}
            </button>
          </div>
        </form>
      </Modal>
    </>
  );
}

// ═══ NHẬT KÝ ═══

function NhatKyTab() {
  const { data: list, loading, error } = useAsyncData(() => fetchNhatKy(150), []);
  const table = useTableControls(list, (n) => `${n.tenBang} ${n.banGhiId} ${n.nguoiThucHien}`, 15);

  return (
    <>
      <DataState loading={loading} error={error} empty={list.length === 0} />
      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm bảng, người thực hiện..."
        total={table.total}
      />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="th-cell">Thời điểm</th>
              <th className="th-cell">Bảng</th>
              <th className="th-cell">Bản ghi</th>
              <th className="th-cell">Hành động</th>
              <th className="th-cell">Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {table.pageRows.map((n) => (
              <tr key={n.id} className="tr-hover">
                <td className="td-cell font-mono text-xs">
                  {new Date(n.thoiDiem).toLocaleString('vi-VN')}
                </td>
                <td className="td-cell font-mono text-xs text-ink-secondary">{n.tenBang}</td>
                <td className="td-cell font-mono text-xs text-ink-muted">#{n.banGhiId}</td>
                <td className="td-cell">
                  <span className={cn('text-2xs font-black uppercase', HANH_DONG_LABEL[n.hanhDong]?.cls)}>
                    {HANH_DONG_LABEL[n.hanhDong]?.label ?? n.hanhDong}
                  </span>
                </td>
                <td className="td-cell text-xs text-ink-secondary">{n.nguoiThucHien}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} onChange={table.setPage} />
      </div>
    </>
  );
}
