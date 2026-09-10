import { useEffect, useMemo, useState } from 'react';
import {
  Users,
  Users2,
  ListTree,
  ScrollText,
  ShieldCheck,
  UserCog,
  ShieldX,
  LoaderCircle,
  RotateCcw,
  Building2,
  X,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DataState } from '../components/DataState';
import { Field, inputCls } from '../components/Modal';
import { TableToolbar, RowActions } from '../components/TableToolbar';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { useAuth, type VaiTro } from '../context/AuthContext';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
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
import {
  fetchQuyenVaiTroMacDinh,
  upsertQuyenVaiTroMacDinh,
  fetchQuyenNguoiDung,
  upsertQuyenNguoiDung,
  xoaQuyenNguoiDung,
  fetchQuyenXemLienDonVi,
  themQuyenXemLienDonVi,
  xoaQuyenXemLienDonVi,
  type QuyenVaiTroRow,
  type QuyenXemLienDonViRow,
} from '../services/phanQuyen';
import { fetchDonViOptions, type Option } from '../services/queries';
import { TAI_NGUYEN, NHAN_TAI_NGUYEN, HANH_DONG, NHAN_HANH_DONG, type HanhDong, type TaiNguyen } from '../lib/phanQuyen';
import { cn } from '../lib/utils';

type Tab = 'nguoi-dung' | 'danh-muc' | 'nhat-ky' | 'quyen-vai-tro' | 'quyen-nguoi-dung';

/** Vai trò cần cấu hình quyền — bỏ 'quan-tri' vì fn_co_quyen() luôn bypass cho vai trò này. */
const VAI_TRO_CAU_HINH_DUOC = VAI_TRO_OPTIONS.filter((o) => o.value !== 'quan-tri');

const HANH_DONG_LABEL: Record<string, { label: string; cls: string }> = {
  INSERT: { label: 'Thêm', cls: 'text-success' },
  UPDATE: { label: 'Sửa', cls: 'text-warning' },
  DELETE: { label: 'Xóa', cls: 'text-danger' },
};

export function CaiDatPage() {
  const { can, dangTai } = usePhanQuyen();
  const [tab, setTab] = useState<Tab | null>(null);

  const coQuyenCaiDat = can('cai_dat', 'xem');
  const coQuyenPhanQuyen = can('phan_quyen', 'xem');
  const coTheSuaPhanQuyen = can('phan_quyen', 'sua');

  const TABS: { id: Tab; label: string; icon: typeof Users }[] = [
    ...(coQuyenPhanQuyen
      ? ([
          { id: 'nguoi-dung', label: 'Người dùng & vai trò', icon: Users },
          { id: 'quyen-vai-tro', label: 'Quyền theo vai trò', icon: ShieldCheck },
          { id: 'quyen-nguoi-dung', label: 'Quyền theo người dùng', icon: UserCog },
        ] as const)
      : []),
    ...(coQuyenCaiDat
      ? ([
          { id: 'danh-muc', label: 'Danh mục dữ liệu', icon: ListTree },
          { id: 'nhat-ky', label: 'Nhật ký dữ liệu', icon: ScrollText },
        ] as const)
      : []),
  ];

  // Tab mặc định = tab đầu tiên còn quyền, chọn lại mỗi khi danh sách quyền đổi
  // (đăng nhập lần đầu, hoặc quyền vừa được cấp thêm).
  useEffect(() => {
    if (dangTai) return;
    if (tab && TABS.some((t) => t.id === tab)) return;
    setTab(TABS[0]?.id ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dangTai, coQuyenCaiDat, coQuyenPhanQuyen]);

  if (dangTai) return null;

  if (!coQuyenCaiDat && !coQuyenPhanQuyen) {
    return (
      <div>
        <PageHeader title="Cài đặt hệ thống" subtitle="Quản trị người dùng, danh mục và nhật ký dữ liệu" />
        <div className="card flex flex-col items-center gap-2 p-10 text-center">
          <ShieldX size={32} className="text-ink-muted" />
          <p className="text-sm font-semibold text-ink">Bạn không có quyền truy cập</p>
          <p className="text-xs text-ink-muted">Liên hệ Quản trị hệ thống nếu cần cấp quyền vào trang này.</p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Cài đặt hệ thống" subtitle="Quản trị người dùng, danh mục và nhật ký dữ liệu" />

      <div className="mb-4 flex flex-wrap gap-1 rounded-xl bg-muted p-1 w-fit">
        {TABS.map(({ id, label, icon: Icon }) => (
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

      {tab === 'nguoi-dung' && <NguoiDungTab coTheSua={coTheSuaPhanQuyen} />}
      {tab === 'quyen-vai-tro' && <QuyenVaiTroTab coTheSua={coTheSuaPhanQuyen} />}
      {tab === 'quyen-nguoi-dung' && <QuyenNguoiDungTab coTheSua={coTheSuaPhanQuyen} />}
      {tab === 'danh-muc' && <DanhMucTab />}
      {tab === 'nhat-ky' && <NhatKyTab />}
    </div>
  );
}

// ═══ NGƯỜI DÙNG ═══

function NguoiDungTab({ coTheSua }: { coTheSua: boolean }) {
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

  useSlidePanelForm({
    id: 'phan-quyen-user-form',
    open: editing !== null,
    title: editing ? `Phân quyền: ${editing.hoTen}` : 'Phân quyền người dùng',
    subtitle: editing ? `Tài khoản: ${editing.hoTen} (${editing.donVi || 'Chưa phân đơn vị'})` : undefined,
    icon: <UserCog size={18} className="text-primary" />,
    storageKey: 'slideover-width-phan-quyen-user',
    minWidth: 460,
    onDongNgoaiLuong: () => setEditing(null),
    content: (
      <form id="form-phan-quyen-user" onSubmit={save} className="space-y-4">
        {editing && (
          <div className="rounded-xl border border-border bg-subtle/50 p-3.5 space-y-1">
            <div className="text-2xs font-bold uppercase tracking-wider text-ink-muted">Tài khoản được phân quyền</div>
            <div className="font-semibold text-ink text-sm">{editing.hoTen}</div>
            <div className="text-xs text-ink-secondary flex items-center gap-2">
              <span>Đơn vị: <strong>{editing.donVi || 'Chưa phân bổ'}</strong></span>
              <span>•</span>
              <span>ID: <strong>{editing.userId}</strong></span>
            </div>
          </div>
        )}
        <Field label="Vai trò hệ thống" required>
          <select className={inputCls} value={vaiTro} onChange={(e) => setVaiTro(e.target.value)}>
            {VAI_TRO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Field>
        <Field label="Trạng thái tài khoản" required>
          <select className={inputCls} value={trangThai} onChange={(e) => setTrangThai(e.target.value)}>
            <option value="hoat-dong">Hoạt động bình thường</option>
            <option value="khoa">Khóa tài khoản</option>
          </select>
        </Field>
        {err && <p className="text-xs font-semibold text-danger">{err}</p>}
      </form>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setEditing(null)}
          className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary hover:bg-muted"
        >
          Hủy
        </button>
        <button type="submit" form="form-phan-quyen-user" disabled={saving} className="btn-primary disabled:opacity-60">
          {saving && <LoaderCircle size={15} className="animate-spin" />}
          Lưu phân quyền
        </button>
      </div>
    ),
    deps: [editing, vaiTro, trangThai, saving, err],
  });

  return (
    <>
      <DataState loading={loading} error={error} empty={list.length === 0} />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-[#1f2332]">
            <tr>
              <th className="th-cell w-10 text-center">#</th>
              <th className="th-cell">Họ tên</th>
              <th className="th-cell">Vai trò</th>
              <th className="th-cell">Đơn vị</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {list.map((nd, idx) => (
              <tr key={nd.userId} className="tr-hover">
                <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
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
                    {coTheSua ? (
                      <button
                        onClick={() => open(nd)}
                        className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted"
                      >
                        Phân quyền
                      </button>
                    ) : (
                      <span className="text-2xs text-ink-muted">Chỉ xem</span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>
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

  useSlidePanelForm({
    id: 'danh-muc-form',
    open: crud.modalOpen,
    title: crud.editing ? `Sửa mục: ${crud.editing.tenMuc}` : 'Thêm mục danh mục',
    subtitle: 'Quản lý nhóm và các mục danh mục hệ thống IBST',
    icon: <ListTree size={18} className="text-primary" />,
    storageKey: 'slideover-width-danh-muc-form',
    minWidth: 480,
    onDongNgoaiLuong: crud.closeModal,
    content: (
      <form id="form-danh-muc" onSubmit={crud.submit} className="space-y-4">
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
      </form>
    ),
    footer: (
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={crud.closeModal}
          className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary hover:bg-muted"
        >
          Hủy
        </button>
        <button type="submit" form="form-danh-muc" disabled={crud.saving} className="btn-primary disabled:opacity-60">
          {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
          {crud.editing ? 'Lưu thay đổi' : 'Thêm'}
        </button>
      </div>
    ),
    deps: [crud.modalOpen, crud.editing, crud.form, crud.actionError, crud.saving],
  });

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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <table className="w-full min-w-[560px]">
          <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-[#1f2332]">
            <tr>
              <th className="th-cell w-10 text-center">#</th>
              <th className="th-cell">Nhóm</th>
              <th className="th-cell">Mã mục</th>
              <th className="th-cell">Tên mục</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.filteredRows.map((d, idx) => (
              <tr key={d.id} className="tr-hover">
                <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
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
        </div>
      </div>
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
      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
        <table className="w-full min-w-[640px]">
          <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-[#1f2332]">
            <tr>
              <th className="th-cell w-10 text-center">#</th>
              <th className="th-cell">Thời điểm</th>
              <th className="th-cell">Bảng</th>
              <th className="th-cell">Bản ghi</th>
              <th className="th-cell">Hành động</th>
              <th className="th-cell">Người thực hiện</th>
            </tr>
          </thead>
          <tbody>
            {table.filteredRows.map((n, idx) => (
              <tr key={n.id} className="tr-hover">
                <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
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
        </div>
      </div>
    </>
  );
}

// ═══ QUYỀN THEO VAI TRÒ (quyen_vai_tro_mac_dinh) ═══

function QuyenVaiTroTab({ coTheSua }: { coTheSua: boolean }) {
  const { data: rows, loading, error, refetch } = useAsyncData(fetchQuyenVaiTroMacDinh, [] as QuyenVaiTroRow[]);
  const [vaiTroDangChon, setVaiTroDangChon] = useState<VaiTro>((VAI_TRO_CAU_HINH_DUOC[0]?.value ?? 'lanh-dao') as VaiTro);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [saveErr, setSaveErr] = useState<string | null>(null);

  const map = useMemo(() => {
    const m = new Map<string, HanhDong[]>();
    for (const r of rows) m.set(`${r.vaiTro}:${r.taiNguyen}`, r.hanhDong);
    return m;
  }, [rows]);

  const toggle = async (taiNguyen: TaiNguyen, hanhDong: HanhDong) => {
    if (!coTheSua) return;
    const key = `${vaiTroDangChon}:${taiNguyen}`;
    const hienTai = map.get(key) ?? [];
    const ke = hienTai.includes(hanhDong) ? hienTai.filter((h) => h !== hanhDong) : [...hienTai, hanhDong];
    setSavingKey(key);
    setSaveErr(null);
    try {
      await upsertQuyenVaiTroMacDinh(vaiTroDangChon, taiNguyen, ke);
      await refetch();
    } catch (e) {
      setSaveErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <>
      <DataState loading={loading} error={error ?? saveErr} empty={false} />

      <div className="mb-1 flex flex-wrap gap-1.5">
        {VAI_TRO_CAU_HINH_DUOC.map((o) => (
          <button
            key={o.value}
            onClick={() => setVaiTroDangChon(o.value as VaiTro)}
            className={cn(
              'rounded-lg border px-3 py-1.5 text-xs font-bold transition-colors',
              vaiTroDangChon === o.value
                ? 'border-primary-500 bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300'
                : 'border-border text-ink-secondary hover:bg-muted',
            )}
          >
            {o.label}
          </button>
        ))}
      </div>
      <p className="mb-3 text-2xs text-ink-muted">
        Quyền mặc định cho vai trò <b>{VAI_TRO_LABEL[vaiTroDangChon] ?? vaiTroDangChon}</b>. Đây là DỰ THẢO dựa trên
        Quy chế 2815 — kiểm tra kỹ trước khi bấm, đặc biệt các tài nguyên nhân sự/lương/Đảng.
        {!coTheSua && ' Bạn chỉ có quyền xem, liên hệ Quản trị hệ thống để chỉnh sửa.'}
      </p>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 360px)' }}>
          <table className="w-full min-w-[820px]">
            <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-slate-900/60">
              <tr>
                <th className="th-cell">Tài nguyên</th>
                {HANH_DONG.map((h) => (
                  <th key={h} className="th-cell w-20 text-center">
                    {NHAN_HANH_DONG[h]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700/80">
              {TAI_NGUYEN.map((tn) => {
                const key = `${vaiTroDangChon}:${tn}`;
                const hienTai = map.get(key) ?? [];
                const dangLuu = savingKey === key;
                return (
                  <tr key={tn} className="tr-hover">
                    <td className="td-cell font-semibold">{NHAN_TAI_NGUYEN[tn]}</td>
                    {HANH_DONG.map((h) => (
                      <td key={h} className="td-cell text-center">
                        <input
                          type="checkbox"
                          checked={hienTai.includes(h)}
                          disabled={!coTheSua || dangLuu}
                          onChange={() => toggle(tn, h)}
                          className="h-4 w-4 rounded border-border accent-primary-500 disabled:opacity-40"
                        />
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

// ═══ QUYỀN THEO NGƯỜI DÙNG (quyen_nguoi_dung + quyen_xem_lien_don_vi) ═══

function QuyenNguoiDungTab({ coTheSua }: { coTheSua: boolean }) {
  const { data: users, loading, error } = useAsyncData(fetchNguoiDung, [] as NguoiDung[]);
  const { data: macDinhRows } = useAsyncData(fetchQuyenVaiTroMacDinh, [] as QuyenVaiTroRow[]);
  const [selected, setSelected] = useState<NguoiDung | null>(null);
  const table = useTableControls(users, (u) => `${u.hoTen} ${u.donVi} ${u.vaiTro}`);

  const macDinhMap = useMemo(() => {
    const m = new Map<string, HanhDong[]>();
    for (const r of macDinhRows) m.set(`${r.vaiTro}:${r.taiNguyen}`, r.hanhDong);
    return m;
  }, [macDinhRows]);

  return (
    <>
      <DataState loading={loading} error={error} empty={users.length === 0} />
      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm người dùng..."
        total={table.total}
      />
      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 340px)' }}>
          <table className="w-full min-w-[640px]">
            <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-slate-900/60">
              <tr>
                <th className="th-cell w-10 text-center">#</th>
                <th className="th-cell">Họ tên</th>
                <th className="th-cell">Vai trò</th>
                <th className="th-cell">Đơn vị</th>
                <th className="th-cell text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700/80">
              {table.filteredRows.map((u, idx) => (
                <tr key={u.userId} className="tr-hover">
                  <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
                  <td className="td-cell font-semibold">{u.hoTen}</td>
                  <td className="td-cell">
                    <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-2xs font-black uppercase text-primary dark:bg-primary-900/30 dark:text-primary-300">
                      {VAI_TRO_LABEL[u.vaiTro] ?? u.vaiTro}
                    </span>
                  </td>
                  <td className="td-cell text-ink-secondary">{u.donVi || '—'}</td>
                  <td className="td-cell">
                    <div className="flex justify-end">
                      <button
                        onClick={() => setSelected(u)}
                        className="rounded-lg border border-border px-3 py-1 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted"
                      >
                        {coTheSua ? 'Chỉnh quyền riêng' : 'Xem quyền'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <QuyenNguoiDungPanel
        nguoiDung={selected}
        macDinhMap={macDinhMap}
        coTheSua={coTheSua}
        onClose={() => setSelected(null)}
      />
    </>
  );
}

function QuyenNguoiDungPanel({
  nguoiDung,
  macDinhMap,
  coTheSua,
  onClose,
}: {
  nguoiDung: NguoiDung | null;
  macDinhMap: Map<string, HanhDong[]>;
  coTheSua: boolean;
  onClose: () => void;
}) {
  const [ghiDe, setGhiDe] = useState<Map<string, HanhDong[]>>(new Map());
  const [donViDuocXem, setDonViDuocXem] = useState<QuyenXemLienDonViRow[]>([]);
  const [donViOptions, setDonViOptions] = useState<Option[]>([]);
  const [dangTaiRieng, setDangTaiRieng] = useState(false);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [themDonViId, setThemDonViId] = useState('');
  const [loi, setLoi] = useState<string | null>(null);

  const taiLaiGhiDe = async (userId: string, nhanSuId: string | null) => {
    const [ghiDeRows, lienDonVi] = await Promise.all([
      fetchQuyenNguoiDung(userId),
      nhanSuId ? fetchQuyenXemLienDonVi(nhanSuId) : Promise.resolve([]),
    ]);
    const m = new Map<string, HanhDong[]>();
    for (const r of ghiDeRows) m.set(r.taiNguyen, r.hanhDong);
    setGhiDe(m);
    setDonViDuocXem(lienDonVi);
  };

  useEffect(() => {
    if (!nguoiDung) return;
    let active = true;
    setDangTaiRieng(true);
    setLoi(null);
    Promise.all([taiLaiGhiDe(nguoiDung.userId, nguoiDung.nhanSuId), fetchDonViOptions()])
      .then(([, dv]) => {
        if (active) setDonViOptions(dv);
      })
      .catch((e: unknown) => {
        if (active) setLoi(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (active) setDangTaiRieng(false);
      });
    return () => {
      active = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nguoiDung?.userId]);

  const toggle = async (taiNguyen: TaiNguyen, hanhDong: HanhDong) => {
    if (!nguoiDung || !coTheSua) return;
    const hieuLuc = ghiDe.get(taiNguyen) ?? macDinhMap.get(`${nguoiDung.vaiTro}:${taiNguyen}`) ?? [];
    const ke = hieuLuc.includes(hanhDong) ? hieuLuc.filter((h) => h !== hanhDong) : [...hieuLuc, hanhDong];
    setSavingKey(taiNguyen);
    setLoi(null);
    try {
      await upsertQuyenNguoiDung(nguoiDung.userId, taiNguyen, ke);
      await taiLaiGhiDe(nguoiDung.userId, nguoiDung.nhanSuId);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingKey(null);
    }
  };

  const khoiPhucMacDinh = async (taiNguyen: TaiNguyen) => {
    if (!nguoiDung || !coTheSua) return;
    setSavingKey(taiNguyen);
    setLoi(null);
    try {
      await xoaQuyenNguoiDung(nguoiDung.userId, taiNguyen);
      await taiLaiGhiDe(nguoiDung.userId, nguoiDung.nhanSuId);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : String(e));
    } finally {
      setSavingKey(null);
    }
  };

  const themDonVi = async () => {
    if (!nguoiDung?.nhanSuId || !themDonViId) return;
    setLoi(null);
    try {
      await themQuyenXemLienDonVi(nguoiDung.nhanSuId, themDonViId);
      setThemDonViId('');
      await taiLaiGhiDe(nguoiDung.userId, nguoiDung.nhanSuId);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : String(e));
    }
  };

  const xoaDonVi = async (donViId: string) => {
    if (!nguoiDung?.nhanSuId) return;
    setLoi(null);
    try {
      await xoaQuyenXemLienDonVi(nguoiDung.nhanSuId, donViId);
      await taiLaiGhiDe(nguoiDung.userId, nguoiDung.nhanSuId);
    } catch (e) {
      setLoi(e instanceof Error ? e.message : String(e));
    }
  };

  useSlidePanelChiTiet({
    id: 'quyen-nguoi-dung-panel',
    active: nguoiDung !== null,
    title: nguoiDung ? `Quyền: ${nguoiDung.hoTen}` : '',
    subtitle: nguoiDung
      ? `${VAI_TRO_LABEL[nguoiDung.vaiTro] ?? nguoiDung.vaiTro} — ${nguoiDung.donVi || 'chưa gắn đơn vị'}`
      : undefined,
    storageKey: 'panel-quyen-nguoi-dung',
    minWidth: 560,
    defaultWidth: 640,
    deps: [nguoiDung?.userId, ghiDe, donViDuocXem, donViOptions, savingKey, loi, themDonViId, dangTaiRieng, coTheSua],
    onDongNgoaiLuong: onClose,
    content: !nguoiDung ? null : (
      <div className="space-y-5 p-4">
        {loi && <p className="rounded-lg bg-danger-subtle p-2.5 text-xs font-semibold text-danger">{loi}</p>}
        {!coTheSua && (
          <p className="text-xs text-ink-muted">Bạn chỉ có quyền xem — liên hệ Quản trị hệ thống để chỉnh sửa.</p>
        )}

        <section>
          <h4 className="mb-1 text-xs font-black uppercase tracking-wide text-ink-muted">Quyền theo tài nguyên</h4>
          <p className="mb-3 text-2xs text-ink-muted">
            Hàng tô vàng là <b>đã ghi đè riêng</b> cho người này — khác quyền mặc định của vai trò{' '}
            <b>{VAI_TRO_LABEL[nguoiDung.vaiTro] ?? nguoiDung.vaiTro}</b>.
          </p>
          <div className="overflow-x-auto rounded-lg border border-border dark:border-slate-700/80">
            <table className="w-full min-w-[480px] text-xs">
              <thead className="bg-subtle dark:bg-slate-900/60">
                <tr>
                  <th className="th-cell !py-2">Tài nguyên</th>
                  {HANH_DONG.map((h) => (
                    <th key={h} className="th-cell !py-2 w-14 text-center">
                      {NHAN_HANH_DONG[h]}
                    </th>
                  ))}
                  <th className="th-cell !py-2 w-8" />
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-700/80">
                {TAI_NGUYEN.map((tn) => {
                  const daGhiDe = ghiDe.has(tn);
                  const hieuLuc = ghiDe.get(tn) ?? macDinhMap.get(`${nguoiDung.vaiTro}:${tn}`) ?? [];
                  const dangLuu = savingKey === tn;
                  return (
                    <tr key={tn} className={cn('tr-hover', daGhiDe && 'bg-amber-50 dark:bg-amber-900/10')}>
                      <td className="td-cell !py-1.5 font-semibold">{NHAN_TAI_NGUYEN[tn]}</td>
                      {HANH_DONG.map((h) => (
                        <td key={h} className="td-cell !py-1.5 text-center">
                          <input
                            type="checkbox"
                            checked={hieuLuc.includes(h)}
                            disabled={!coTheSua || dangLuu || dangTaiRieng}
                            onChange={() => toggle(tn, h)}
                            className="h-3.5 w-3.5 rounded border-border accent-primary-500 disabled:opacity-40"
                          />
                        </td>
                      ))}
                      <td className="td-cell !py-1.5 text-center">
                        {daGhiDe && coTheSua && (
                          <button
                            type="button"
                            title="Khôi phục theo vai trò"
                            onClick={() => khoiPhucMacDinh(tn)}
                            className="icon-button !min-h-0 !min-w-0 p-1"
                          >
                            <RotateCcw size={13} />
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        <section>
          <h4 className="mb-1 text-xs font-black uppercase tracking-wide text-ink-muted">Quyền xem liên đơn vị</h4>
          <p className="mb-3 text-2xs text-ink-muted">
            CHỈ mở rộng quyền xem sang đơn vị khác (phối hợp thực hiện hợp đồng) — không kèm thêm/sửa/xóa/duyệt.
          </p>
          {!nguoiDung.nhanSuId ? (
            <p className="text-xs italic text-ink-muted">
              Tài khoản chưa gắn hồ sơ nhân sự nên chưa cấp được quyền này.
            </p>
          ) : (
            <>
              <div className="mb-2 flex flex-wrap gap-1.5">
                {donViDuocXem.length === 0 && (
                  <span className="text-xs italic text-ink-muted">Chưa có đơn vị nào được cấp thêm.</span>
                )}
                {donViDuocXem.map((d) => (
                  <span
                    key={d.donViDuocXemId}
                    className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-1 text-2xs font-bold text-ink-secondary"
                  >
                    <Building2 size={11} /> {d.tenDonViDuocXem}
                    {coTheSua && (
                      <button
                        type="button"
                        onClick={() => xoaDonVi(d.donViDuocXemId)}
                        className="ml-0.5 text-ink-muted hover:text-danger"
                      >
                        <X size={11} />
                      </button>
                    )}
                  </span>
                ))}
              </div>
              {coTheSua && (
                <div className="flex gap-2">
                  <select className={inputCls} value={themDonViId} onChange={(e) => setThemDonViId(e.target.value)}>
                    <option value="">— Chọn đơn vị để cấp thêm quyền xem —</option>
                    {donViOptions
                      .filter((dv) => !donViDuocXem.some((d) => d.donViDuocXemId === dv.id))
                      .map((dv) => (
                        <option key={dv.id} value={dv.id}>
                          {dv.ten}
                        </option>
                      ))}
                  </select>
                  <button
                    type="button"
                    onClick={themDonVi}
                    disabled={!themDonViId}
                    className="btn-primary !w-auto px-4 disabled:opacity-50"
                  >
                    Cấp
                  </button>
                </div>
              )}
            </>
          )}
        </section>
      </div>
    ),
  });

  return null;
}
