import { useRef, useState, type ReactNode } from 'react';
import { Plus, Pencil, Trash2, Check, X, LoaderCircle, Upload, Download } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchDotThanhToan,
  createDotThanhToan,
  updateDotThanhToan,
  deleteDotThanhToan,
  fetchKetQuaPhepThu,
  createKetQua,
  updateKetQua,
  deleteKetQua,
  fetchMocDeTai,
  createMoc,
  updateMoc,
  deleteMoc,
  fetchChungChiTheoNhanSu,
  createChungChi,
  updateChungChi,
  deleteChungChi,
  fetchCtvGiaoViec,
  createCtvGiaoViec,
  updateCtvGiaoViec,
  deleteCtvGiaoViec,
  fetchThuongPhat,
  createThuongPhat,
  deleteThuongPhat,
  fetchKiemTraNoiBo,
  createKiemTraNoiBo,
  deleteKiemTraNoiBo,
  fetchQuyetToanGiaiDoan,
  createQuyetToanGiaiDoan,
  updateQuyetToanGiaiDoan,
  deleteQuyetToanGiaiDoan,
  fetchTepHopDong,
  uploadTepHopDong,
  getTepHopDongUrl,
  deleteTepHopDong,
  LOAI_HO_SO_OPTIONS,
  type DotThanhToanInput,
  type KetQuaInput,
  type MocInput,
  type ChungChiInput,
  type CtvGiaoViecInput,
  type ThuongPhatInput,
  type KiemTraNoiBoInput,
  type QuyetToanGiaiDoanInput,
} from '../services/chitiet';
import { HANG_CHUNG_CHI } from '../services/org';
import type { Option } from '../services/queries';
import { DANH_MUC_VI_PHAM, timLoaiViPham, type NhomHD } from '../lib/qc2815';
import { formatNgay, cn } from '../lib/utils';

const HANG_OPTIONS = [
  { value: '', label: '—' },
  { value: 'hang-1', label: 'Hạng I' },
  { value: 'hang-2', label: 'Hạng II' },
  { value: 'hang-3', label: 'Hạng III' },
];

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

function PanelShell({
  title,
  onAdd,
  adding,
  children,
  footer,
}: {
  title: string;
  onAdd: () => void;
  adding: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">{title}</h4>
        <button
          onClick={onAdd}
          disabled={adding}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Plus size={11} /> Thêm dòng
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
      {footer}
    </div>
  );
}

function RowBtns({
  onSave,
  onCancel,
  saving,
}: {
  onSave: () => void;
  onCancel: () => void;
  saving: boolean;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        onClick={onSave}
        disabled={saving}
        title="Lưu"
        className="rounded p-1 text-success transition-colors hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
      >
        {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}
      </button>
      <button
        onClick={onCancel}
        title="Hủy"
        className="rounded p-1 text-ink-muted transition-colors hover:bg-muted"
      >
        <X size={13} />
      </button>
    </div>
  );
}

function EditDeleteBtns({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button
        onClick={onEdit}
        title="Sửa"
        className="rounded p-1 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
      >
        <Pencil size={12} />
      </button>
      <button
        onClick={onDelete}
        title="Xóa"
        className="rounded p-1 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
      >
        <Trash2 size={12} />
      </button>
    </div>
  );
}

// ═══ ĐỢT THANH TOÁN ═══

const EMPTY_DOT: DotThanhToanInput = { tenDot: '', soTien: '', ngayDuKien: '', ngayThucThu: '' };

export function DotThanhToanPanel({
  hopDongId,
  giaTri,
  onChanged,
}: {
  hopDongId: string;
  giaTri: number;
  onChanged: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchDotThanhToan(hopDongId), []);
  const [editingId, setEditingId] = useState<string | null>(null); // 'new' = thêm mới
  const [form, setForm] = useState<DotThanhToanInput>(EMPTY_DOT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => {
    setEditingId(null);
    refetch();
    onChanged();
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createDotThanhToan(hopDongId, form);
      else if (editingId) await updateDotThanhToan(hopDongId, editingId, form);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa đợt thanh toán này?')) return;
    try {
      await deleteDotThanhToan(hopDongId, id);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const daThu = rows.filter((r) => r.ngayThucThu).reduce((s, r) => s + r.soTien, 0);

  const editorRow = (
    <tr className="bg-subtle">
      <td className="px-3 py-1.5">
        <input className={miniInput} placeholder="Tên đợt" value={form.tenDot}
          onChange={(e) => setForm({ ...form, tenDot: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="number" min={0} placeholder="Triệu đồng" value={form.soTien}
          onChange={(e) => setForm({ ...form, soTien: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="date" value={form.ngayDuKien}
          onChange={(e) => setForm({ ...form, ngayDuKien: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="date" value={form.ngayThucThu}
          onChange={(e) => setForm({ ...form, ngayThucThu: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} />
      </td>
    </tr>
  );

  return (
    <PanelShell
      title="Đợt thanh toán"
      adding={editingId !== null}
      onAdd={() => {
        setForm(EMPTY_DOT);
        setEditingId('new');
      }}
      footer={
        <div className="flex flex-wrap justify-end gap-4 border-t border-border-subtle px-3 py-2 text-xs">
          <span>Đã thu: <b className="font-mono text-success">{daThu.toLocaleString('vi-VN')} tr</b></span>
          <span>Còn phải thu: <b className="font-mono text-warning">{Math.max(0, giaTri - daThu).toLocaleString('vi-VN')} tr</b></span>
        </div>
      }
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[520px]">
        <thead>
          <tr>
            <th className="th-cell">Đợt</th>
            <th className="th-cell">Số tiền (tr.đ)</th>
            <th className="th-cell">Dự kiến</th>
            <th className="th-cell">Thực thu</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              <tr key={r.id} className="bg-subtle">
                <td className="px-3 py-1.5"><input className={miniInput} value={form.tenDot} onChange={(e) => setForm({ ...form, tenDot: e.target.value })} /></td>
                <td className="px-3 py-1.5"><input className={miniInput} type="number" value={form.soTien} onChange={(e) => setForm({ ...form, soTien: e.target.value })} /></td>
                <td className="px-3 py-1.5"><input className={miniInput} type="date" value={form.ngayDuKien} onChange={(e) => setForm({ ...form, ngayDuKien: e.target.value })} /></td>
                <td className="px-3 py-1.5"><input className={miniInput} type="date" value={form.ngayThucThu} onChange={(e) => setForm({ ...form, ngayThucThu: e.target.value })} /></td>
                <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
              </tr>
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.tenDot}</td>
                <td className="td-cell font-mono text-xs">{r.soTien.toLocaleString('vi-VN')}</td>
                <td className="td-cell font-mono text-xs">{r.ngayDuKien ? formatNgay(r.ngayDuKien) : '—'}</td>
                <td className="td-cell font-mono text-xs">
                  {r.ngayThucThu ? (
                    <span className="text-success">{formatNgay(r.ngayThucThu)}</span>
                  ) : (
                    <span className="text-ink-muted">Chưa thu</span>
                  )}
                </td>
                <td className="td-cell">
                  <EditDeleteBtns
                    onEdit={() => {
                      setForm({ tenDot: r.tenDot, soTien: String(r.soTien), ngayDuKien: r.ngayDuKien, ngayThucThu: r.ngayThucThu });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            ),
          )}
          {editingId === 'new' && editorRow}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ KẾT QUẢ PHÉP THỬ ═══

const EMPTY_KQ: KetQuaInput = { tenChiTieu: '', ketQua: '', donViTinh: '', yeuCau: '', dat: '' };

export function KetQuaPhepThuPanel({ mauId }: { mauId: string }) {
  const { data: rows, refetch } = useAsyncData(() => fetchKetQuaPhepThu(mauId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<KetQuaInput>(EMPTY_KQ);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createKetQua(mauId, form);
      else if (editingId) await updateKetQua(editingId, form);
      setEditingId(null);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa chỉ tiêu này?')) return;
    try {
      await deleteKetQua(id);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Chỉ tiêu" value={form.tenChiTieu} onChange={(e) => setForm({ ...form, tenChiTieu: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Kết quả" value={form.ketQua} onChange={(e) => setForm({ ...form, ketQua: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="ĐVT" value={form.donViTinh} onChange={(e) => setForm({ ...form, donViTinh: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Yêu cầu" value={form.yeuCau} onChange={(e) => setForm({ ...form, yeuCau: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <select className={miniInput} value={form.dat} onChange={(e) => setForm({ ...form, dat: e.target.value })}>
          <option value="">Chưa ĐG</option>
          <option value="dat">Đạt</option>
          <option value="khong-dat">Không đạt</option>
        </select>
      </td>
      <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
    </tr>
  );

  return (
    <PanelShell
      title="Kết quả thí nghiệm theo chỉ tiêu"
      adding={editingId !== null}
      onAdd={() => {
        setForm(EMPTY_KQ);
        setEditingId('new');
      }}
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[560px]">
        <thead>
          <tr>
            <th className="th-cell">Chỉ tiêu</th>
            <th className="th-cell">Kết quả</th>
            <th className="th-cell">ĐVT</th>
            <th className="th-cell">Yêu cầu</th>
            <th className="th-cell">Đánh giá</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              editor(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.tenChiTieu}</td>
                <td className="td-cell font-mono text-xs">{r.ketQua || '—'}</td>
                <td className="td-cell text-xs text-ink-secondary">{r.donViTinh || '—'}</td>
                <td className="td-cell font-mono text-xs text-ink-secondary">{r.yeuCau || '—'}</td>
                <td className="td-cell">
                  {r.dat === null ? (
                    <span className="text-2xs font-bold text-ink-muted">CHƯA ĐG</span>
                  ) : r.dat ? (
                    <span className="text-2xs font-black uppercase text-success">Đạt</span>
                  ) : (
                    <span className="text-2xs font-black uppercase text-danger">Không đạt</span>
                  )}
                </td>
                <td className="td-cell">
                  <EditDeleteBtns
                    onEdit={() => {
                      setForm({ tenChiTieu: r.tenChiTieu, ketQua: r.ketQua, donViTinh: r.donViTinh, yeuCau: r.yeuCau, dat: r.dat === null ? '' : r.dat ? 'dat' : 'khong-dat' });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            ),
          )}
          {editingId === 'new' && editor('new')}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ MỐC ĐỀ TÀI ═══

const EMPTY_MOC: MocInput = { tenMoc: '', hanHoanThanh: '', ngayHoanThanh: '' };

export function MocDeTaiPanel({ deTaiId }: { deTaiId: string }) {
  const { data: rows, refetch } = useAsyncData(() => fetchMocDeTai(deTaiId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<MocInput>(EMPTY_MOC);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createMoc(deTaiId, form);
      else if (editingId) await updateMoc(editingId, form);
      setEditingId(null);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa mốc này?')) return;
    try {
      await deleteMoc(id);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const danhDauXong = async (r: (typeof rows)[number]) => {
    try {
      await updateMoc(r.id, {
        tenMoc: r.tenMoc,
        hanHoanThanh: r.hanHoanThanh,
        ngayHoanThanh: new Date().toISOString().slice(0, 10),
      });
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const soXong = rows.filter((r) => r.ngayHoanThanh).length;

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Tên mốc" value={form.tenMoc} onChange={(e) => setForm({ ...form, tenMoc: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} type="date" value={form.hanHoanThanh} onChange={(e) => setForm({ ...form, hanHoanThanh: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} type="date" value={form.ngayHoanThanh} onChange={(e) => setForm({ ...form, ngayHoanThanh: e.target.value })} /></td>
      <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
    </tr>
  );

  return (
    <PanelShell
      title={`Mốc thực hiện / nghiệm thu (${soXong}/${rows.length} hoàn thành)`}
      adding={editingId !== null}
      onAdd={() => {
        setForm(EMPTY_MOC);
        setEditingId('new');
      }}
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[480px]">
        <thead>
          <tr>
            <th className="th-cell">Mốc</th>
            <th className="th-cell">Hạn</th>
            <th className="th-cell">Hoàn thành</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const treHan =
              !r.ngayHoanThanh && r.hanHoanThanh && new Date(r.hanHoanThanh).getTime() < Date.now();
            return editingId === r.id ? (
              editor(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.tenMoc}</td>
                <td className={cn('td-cell font-mono text-xs', treHan && 'font-bold text-danger')}>
                  {r.hanHoanThanh ? formatNgay(r.hanHoanThanh) : '—'}
                </td>
                <td className="td-cell font-mono text-xs">
                  {r.ngayHoanThanh ? (
                    <span className="text-success">✓ {formatNgay(r.ngayHoanThanh)}</span>
                  ) : (
                    <button
                      onClick={() => danhDauXong(r)}
                      className="rounded border border-border px-1.5 py-0.5 text-2xs font-bold text-ink-secondary transition-colors hover:bg-muted"
                    >
                      Đánh dấu xong
                    </button>
                  )}
                </td>
                <td className="td-cell">
                  <EditDeleteBtns
                    onEdit={() => {
                      setForm({ tenMoc: r.tenMoc, hanHoanThanh: r.hanHoanThanh, ngayHoanThanh: r.ngayHoanThanh });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            );
          })}
          {editingId === 'new' && editor('new')}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ CHỨNG CHỈ HÀNH NGHỀ ═══

const EMPTY_CC: ChungChiInput = {
  soChungChi: '',
  tenLinhVuc: '',
  hang: '',
  coQuanCap: '',
  ngayCap: '',
  ngayHetHan: '',
};

function ccSapHet(iso: string) {
  return !!iso && new Date(iso).getTime() - Date.now() < 90 * 24 * 3600 * 1000;
}

export function ChungChiPanel({ nhanSuId, onChanged }: { nhanSuId: string; onChanged?: () => void }) {
  const { data: rows, refetch } = useAsyncData(() => fetchChungChiTheoNhanSu(nhanSuId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ChungChiInput>(EMPTY_CC);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => {
    setEditingId(null);
    refetch();
    onChanged?.();
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createChungChi(nhanSuId, form);
      else if (editingId) await updateChungChi(editingId, form);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa chứng chỉ này?')) return;
    try {
      await deleteChungChi(id);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Số CC" value={form.soChungChi} onChange={(e) => setForm({ ...form, soChungChi: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Lĩnh vực hành nghề" value={form.tenLinhVuc} onChange={(e) => setForm({ ...form, tenLinhVuc: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <select className={miniInput} value={form.hang} onChange={(e) => setForm({ ...form, hang: e.target.value })}>
          {HANG_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5"><input className={miniInput} type="date" value={form.ngayHetHan} onChange={(e) => setForm({ ...form, ngayHetHan: e.target.value })} /></td>
      <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
    </tr>
  );

  return (
    <PanelShell
      title="Chứng chỉ hành nghề"
      adding={editingId !== null}
      onAdd={() => { setForm(EMPTY_CC); setEditingId('new'); }}
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[540px]">
        <thead>
          <tr>
            <th className="th-cell">Số CC</th>
            <th className="th-cell">Lĩnh vực hành nghề</th>
            <th className="th-cell">Hạng</th>
            <th className="th-cell">Hết hạn</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              editor(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell font-mono text-xs">{r.soChungChi}</td>
                <td className="td-cell text-xs font-medium">{r.tenLinhVuc}</td>
                <td className="td-cell text-xs text-ink-secondary">{r.hang ? HANG_CHUNG_CHI[r.hang] ?? r.hang : '—'}</td>
                <td className={cn('td-cell font-mono text-xs', ccSapHet(r.ngayHetHan) && 'font-bold text-danger')}>
                  {r.ngayHetHan ? formatNgay(r.ngayHetHan) : '—'}
                </td>
                <td className="td-cell">
                  <EditDeleteBtns
                    onEdit={() => {
                      setForm({ soChungChi: r.soChungChi, tenLinhVuc: r.tenLinhVuc, hang: r.hang, coQuanCap: r.coQuanCap, ngayCap: r.ngayCap, ngayHetHan: r.ngayHetHan });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            ),
          )}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && (
            <tr><td colSpan={5} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa có chứng chỉ</td></tr>
          )}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ CỘNG TÁC VIÊN GIAO VIỆC ═══

const EMPTY_CTV: CtvGiaoViecInput = { nhanSuId: '', tyLePhanChia: '', ghiChu: '' };

export function CtvGiaoViecPanel({
  phieuGiaoViecId,
  nhanSuOptions,
  onChanged,
}: {
  phieuGiaoViecId: string;
  nhanSuOptions: Option[];
  onChanged?: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchCtvGiaoViec(phieuGiaoViecId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CtvGiaoViecInput>(EMPTY_CTV);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => {
    setEditingId(null);
    refetch();
    onChanged?.();
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createCtvGiaoViec(phieuGiaoViecId, form);
      else if (editingId) await updateCtvGiaoViec(editingId, form);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa cộng tác viên này khỏi phiếu giao việc?')) return;
    try {
      await deleteCtvGiaoViec(id);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5">
        <select className={miniInput} value={form.nhanSuId} onChange={(e) => setForm({ ...form, nhanSuId: e.target.value })}>
          <option value="">-- Chọn nhân sự --</option>
          {nhanSuOptions.map((n) => <option key={n.id} value={n.id}>{n.ten}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="number" min={0} max={100} placeholder="%" value={form.tyLePhanChia}
          onChange={(e) => setForm({ ...form, tyLePhanChia: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} placeholder="Ghi chú" value={form.ghiChu}
          onChange={(e) => setForm({ ...form, ghiChu: e.target.value })} />
      </td>
      <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
    </tr>
  );

  return (
    <PanelShell
      title="Cộng tác viên"
      adding={editingId !== null}
      onAdd={() => { setForm(EMPTY_CTV); setEditingId('new'); }}
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[420px]">
        <thead>
          <tr>
            <th className="th-cell">Nhân sự</th>
            <th className="th-cell">Tỷ lệ (%)</th>
            <th className="th-cell">Ghi chú</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              editor(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.hoTen || '—'}</td>
                <td className="td-cell font-mono text-xs">{r.tyLePhanChia}</td>
                <td className="td-cell text-xs text-ink-secondary">{r.ghiChu || '—'}</td>
                <td className="td-cell">
                  <EditDeleteBtns
                    onEdit={() => {
                      setForm({ nhanSuId: r.nhanSuId ?? '', tyLePhanChia: String(r.tyLePhanChia), ghiChu: r.ghiChu });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            ),
          )}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && (
            <tr><td colSpan={4} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa có cộng tác viên</td></tr>
          )}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ THƯỞNG / PHẠT HỢP ĐỒNG (Điều 13-14) ═══
// Sổ ghi quyết định thủ công — chỉ thêm/xóa, không sửa (đúng bản chất một quyết định đã ban hành).

const EMPTY_TP: ThuongPhatInput = {
  loai: 'phat',
  lyDo: '',
  soTien: '',
  tyLePhanTram: '',
  ngayQuyetDinh: '',
  nguoiQuyetDinhId: '',
};

export function ThuongPhatPanel({
  hopDongId,
  nhomHD,
  nhanSuOptions,
  onChanged,
}: {
  hopDongId: string;
  nhomHD: NhomHD | null;
  nhanSuOptions: Option[];
  onChanged?: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchThuongPhat(hopDongId), []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<ThuongPhatInput>(EMPTY_TP);
  const [loaiViPhamId, setLoaiViPhamId] = useState('');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await createThuongPhat(hopDongId, form);
      setAdding(false);
      setForm(EMPTY_TP);
      setLoaiViPhamId('');
      refetch();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa bản ghi thưởng/phạt này?')) return;
    try {
      await deleteThuongPhat(id);
      refetch();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <PanelShell title="Thưởng / Phạt hợp đồng" adding={adding} onAdd={() => { setForm(EMPTY_TP); setLoaiViPhamId(''); setAdding(true); }}>
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      {adding && (
        <div className="space-y-2 border-b border-border-subtle bg-subtle p-3">
          <div className="grid grid-cols-2 gap-2">
            <select className={miniInput} value={form.loai} onChange={(e) => setForm({ ...form, loai: e.target.value as 'thuong' | 'phat' })}>
              <option value="phat">Phạt</option>
              <option value="thuong">Thưởng</option>
            </select>
            <input className={miniInput} type="date" value={form.ngayQuyetDinh} onChange={(e) => setForm({ ...form, ngayQuyetDinh: e.target.value })} />
          </div>
          {form.loai === 'phat' && (
            <select
              className={miniInput}
              value={loaiViPhamId}
              onChange={(e) => {
                const id = e.target.value;
                setLoaiViPhamId(id);
                const lv = timLoaiViPham(id);
                const goiY = lv?.mucPhatGoiY?.(nhomHD);
                setForm({
                  ...form,
                  lyDo: lv && lv.id !== 'khac' ? lv.ten : form.lyDo,
                  tyLePhanTram: goiY != null ? String(goiY) : form.tyLePhanTram,
                });
              }}
            >
              <option value="">-- Chọn loại vi phạm (Điều 14.2) --</option>
              {DANH_MUC_VI_PHAM.map((v) => <option key={v.id} value={v.id}>{v.ten}</option>)}
            </select>
          )}
          {loaiViPhamId && timLoaiViPham(loaiViPhamId)?.moTaMucPhat(nhomHD) && (
            <p className="text-2xs text-ink-muted">Mức phạt quy định: {timLoaiViPham(loaiViPhamId)!.moTaMucPhat(nhomHD)}</p>
          )}
          <input className={miniInput} placeholder="Lý do / ghi chú chi tiết" value={form.lyDo} onChange={(e) => setForm({ ...form, lyDo: e.target.value })} />
          <div className="grid grid-cols-2 gap-2">
            <input className={miniInput} type="number" placeholder="Số tiền (tr.đ)" value={form.soTien} onChange={(e) => setForm({ ...form, soTien: e.target.value })} />
            <input className={miniInput} type="number" placeholder="Tỷ lệ (%)" value={form.tyLePhanTram} onChange={(e) => setForm({ ...form, tyLePhanTram: e.target.value })} />
          </div>
          <select className={miniInput} value={form.nguoiQuyetDinhId} onChange={(e) => setForm({ ...form, nguoiQuyetDinhId: e.target.value })}>
            <option value="">-- Người quyết định --</option>
            {nhanSuOptions.map((n) => <option key={n.id} value={n.id}>{n.ten}</option>)}
          </select>
          <RowBtns onSave={save} onCancel={() => setAdding(false)} saving={saving} />
        </div>
      )}
      <table className="w-full min-w-[480px]">
        <thead>
          <tr>
            <th className="th-cell">Loại</th>
            <th className="th-cell">Lý do</th>
            <th className="th-cell">Giá trị</th>
            <th className="th-cell">Ngày QĐ</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="tr-hover">
              <td className="td-cell">
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-2xs font-bold',
                    r.loai === 'thuong'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
                  )}
                >
                  {r.loai === 'thuong' ? 'Thưởng' : 'Phạt'}
                </span>
              </td>
              <td className="td-cell text-xs">{r.lyDo}</td>
              <td className="td-cell font-mono text-xs">
                {r.soTien != null ? `${r.soTien.toLocaleString('vi-VN')} tr` : r.tyLePhanTram != null ? `${r.tyLePhanTram}%` : '—'}
              </td>
              <td className="td-cell font-mono text-xs">{r.ngayQuyetDinh ? formatNgay(r.ngayQuyetDinh) : '—'}</td>
              <td className="td-cell text-right">
                <button
                  onClick={() => remove(r.id)}
                  title="Xóa"
                  className="rounded p-1 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
                >
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !adding && (
            <tr><td colSpan={5} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa có ghi nhận thưởng/phạt</td></tr>
          )}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ KIỂM TRA NỘI BỘ (Điều 10) ═══

const EMPTY_KT: KiemTraNoiBoInput = { ngayKiemTra: '', nguoiKiemTraId: '', noiDung: '', ketLuan: '', kienNghi: '' };

export function KiemTraNoiBoPanel({
  hopDongId,
  nhanSuOptions,
  onChanged,
}: {
  hopDongId: string;
  nhanSuOptions: Option[];
  onChanged?: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchKiemTraNoiBo(hopDongId), []);
  const [adding, setAdding] = useState(false);
  const [form, setForm] = useState<KiemTraNoiBoInput>(EMPTY_KT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await createKiemTraNoiBo(hopDongId, form);
      setAdding(false);
      setForm(EMPTY_KT);
      refetch();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa biên bản kiểm tra này?')) return;
    try {
      await deleteKiemTraNoiBo(id);
      refetch();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  return (
    <PanelShell title="Kiểm tra nội bộ" adding={adding} onAdd={() => { setForm(EMPTY_KT); setAdding(true); }}>
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      {adding && (
        <div className="space-y-2 border-b border-border-subtle bg-subtle p-3">
          <div className="grid grid-cols-2 gap-2">
            <input className={miniInput} type="date" value={form.ngayKiemTra} onChange={(e) => setForm({ ...form, ngayKiemTra: e.target.value })} />
            <select className={miniInput} value={form.nguoiKiemTraId} onChange={(e) => setForm({ ...form, nguoiKiemTraId: e.target.value })}>
              <option value="">-- Người kiểm tra --</option>
              {nhanSuOptions.map((n) => <option key={n.id} value={n.id}>{n.ten}</option>)}
            </select>
          </div>
          <textarea className={miniInput} placeholder="Nội dung kiểm tra" rows={2} value={form.noiDung} onChange={(e) => setForm({ ...form, noiDung: e.target.value })} />
          <textarea className={miniInput} placeholder="Kết luận" rows={2} value={form.ketLuan} onChange={(e) => setForm({ ...form, ketLuan: e.target.value })} />
          <textarea className={miniInput} placeholder="Kiến nghị" rows={2} value={form.kienNghi} onChange={(e) => setForm({ ...form, kienNghi: e.target.value })} />
          <RowBtns onSave={save} onCancel={() => setAdding(false)} saving={saving} />
        </div>
      )}
      <table className="w-full min-w-[480px]">
        <thead>
          <tr>
            <th className="th-cell">Ngày KT</th>
            <th className="th-cell">Kết luận</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="tr-hover">
              <td className="td-cell font-mono text-xs">{r.ngayKiemTra ? formatNgay(r.ngayKiemTra) : '—'}</td>
              <td className="td-cell text-xs" title={r.noiDung}>{r.ketLuan || '—'}</td>
              <td className="td-cell text-right">
                <button
                  onClick={() => remove(r.id)}
                  title="Xóa"
                  className="rounded p-1 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
                >
                  <Trash2 size={12} />
                </button>
              </td>
            </tr>
          ))}
          {rows.length === 0 && !adding && (
            <tr><td colSpan={3} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa có biên bản kiểm tra</td></tr>
          )}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ QUYẾT TOÁN TỪNG PHẦN (Điều 12.1) ═══

const EMPTY_QTGD: QuyetToanGiaiDoanInput = { tenGiaiDoan: '', tyLeHoanThanh: '', ngayXacNhan: '', ghiChu: '' };

export function QuyetToanGiaiDoanPanel({
  hopDongId,
  onChanged,
}: {
  hopDongId: string;
  onChanged?: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchQuyetToanGiaiDoan(hopDongId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuyetToanGiaiDoanInput>(EMPTY_QTGD);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => {
    setEditingId(null);
    refetch();
    onChanged?.();
  };

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createQuyetToanGiaiDoan(hopDongId, form);
      else if (editingId) await updateQuyetToanGiaiDoan(hopDongId, editingId, form);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa giai đoạn quyết toán này?')) return;
    try {
      await deleteQuyetToanGiaiDoan(hopDongId, id);
      done();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const tongTyLe = rows.reduce((s, r) => s + r.tyLeHoanThanh, 0);

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Tên giai đoạn" value={form.tenGiaiDoan} onChange={(e) => setForm({ ...form, tenGiaiDoan: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} type="number" min={0} max={100} placeholder="%" value={form.tyLeHoanThanh} onChange={(e) => setForm({ ...form, tyLeHoanThanh: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} type="date" value={form.ngayXacNhan} onChange={(e) => setForm({ ...form, ngayXacNhan: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={miniInput} placeholder="Ghi chú" value={form.ghiChu} onChange={(e) => setForm({ ...form, ghiChu: e.target.value })} /></td>
      <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
    </tr>
  );

  return (
    <PanelShell
      title="Quyết toán từng phần"
      adding={editingId !== null}
      onAdd={() => { setForm(EMPTY_QTGD); setEditingId('new'); }}
      footer={
        <div className="flex flex-wrap justify-end gap-4 border-t border-border-subtle px-3 py-2 text-xs">
          <span>
            Tổng chứng từ hoàn chỉnh:{' '}
            <b className={cn('font-mono', tongTyLe >= 100 ? 'text-success' : 'text-warning')}>{tongTyLe}%</b>
          </span>
        </div>
      }
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[520px]">
        <thead>
          <tr>
            <th className="th-cell">Giai đoạn</th>
            <th className="th-cell">Hoàn thành (%)</th>
            <th className="th-cell">Ngày xác nhận</th>
            <th className="th-cell">Ghi chú</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              editor(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.tenGiaiDoan}</td>
                <td className="td-cell font-mono text-xs">{r.tyLeHoanThanh}%</td>
                <td className="td-cell font-mono text-xs">{r.ngayXacNhan ? formatNgay(r.ngayXacNhan) : '—'}</td>
                <td className="td-cell text-xs text-ink-secondary">{r.ghiChu || '—'}</td>
                <td className="td-cell">
                  <EditDeleteBtns
                    onEdit={() => {
                      setForm({ tenGiaiDoan: r.tenGiaiDoan, tyLeHoanThanh: String(r.tyLeHoanThanh), ngayXacNhan: r.ngayXacNhan, ghiChu: r.ghiChu });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            ),
          )}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && (
            <tr><td colSpan={5} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa chia giai đoạn quyết toán</td></tr>
          )}
        </tbody>
      </table>
    </PanelShell>
  );
}

// ═══ HỒ SƠ ĐÍNH KÈM HỢP ĐỒNG (Điều 8.4) ═══

export function HoSoHopDongPanel({
  hopDongId,
  onChanged,
}: {
  hopDongId: string;
  onChanged?: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchTepHopDong(hopDongId), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaiHoSo, setLoaiHoSo] = useState('khac');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      await uploadTepHopDong(hopDongId, loaiHoSo, file);
      refetch();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDownload = async (path: string) => {
    setBusy(true);
    try {
      const url = await getTepHopDongUrl(path);
      window.open(url, '_blank');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async (id: string, path: string, tenTep: string) => {
    if (!window.confirm(`Xóa tệp "${tenTep}"?`)) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteTepHopDong(id, path);
      refetch();
      onChanged?.();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border-subtle px-3 py-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">Hồ sơ đính kèm (Điều 8.4)</h4>
      </div>
      <div className="flex items-center gap-2 border-b border-border-subtle p-3">
        <select className={miniInput} value={loaiHoSo} onChange={(e) => setLoaiHoSo(e.target.value)}>
          {LOAI_HO_SO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex shrink-0 items-center gap-1.5 rounded-lg border border-dashed border-border px-3 py-1.5 text-2xs font-bold text-ink-secondary transition-colors hover:bg-muted disabled:opacity-50"
        >
          {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Upload size={13} />} Tải lên
        </button>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) onPick(f);
            e.target.value = '';
          }}
        />
      </div>
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <div className="divide-y divide-border-subtle">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{r.tenTep}</p>
              <p className="text-2xs text-ink-muted">{LOAI_HO_SO_OPTIONS.find((o) => o.value === r.loaiHoSo)?.label ?? r.loaiHoSo}</p>
            </div>
            <div className="flex shrink-0 gap-1">
              <button
                onClick={() => onDownload(r.duongDan)}
                disabled={busy}
                title="Tải xuống"
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600 disabled:opacity-50"
              >
                <Download size={14} />
              </button>
              <button
                onClick={() => onDelete(r.id, r.duongDan, r.tenTep)}
                disabled={busy}
                title="Xóa"
                className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-50 dark:hover:bg-red-900/20"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {rows.length === 0 && <p className="px-3 py-3 text-center text-xs italic text-ink-muted">Chưa có hồ sơ đính kèm</p>}
      </div>
    </div>
  );
}
