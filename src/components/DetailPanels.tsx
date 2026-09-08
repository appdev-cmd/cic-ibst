import { useRef, useState, type ReactNode } from 'react';
import { Plus, Pencil, Trash2, Check, X, LoaderCircle, Upload, Download } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { NumberInput } from './NumberInput';
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
  CAP_KIEM_TRA_OPTIONS,
  type CapKiemTra,
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
  fetchNhatKyHopDong,
  fetchDonViGiaoViec,
  createDonViGiaoViec,
  updateDonViGiaoViec,
  deleteDonViGiaoViec,
  type DonViGiaoViecInput,
  LOAI_HO_SO_OPTIONS,
  NHOM_HO_SO,
  nhomCuaLoaiHoSo,
  type NhomHoSo,
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
import { formatNgay, formatTrieu, cn } from '../lib/utils';

const HANG_OPTIONS = [
  { value: '', label: '—' },
  { value: 'hang-1', label: 'Hạng I' },
  { value: 'hang-2', label: 'Hạng II' },
  { value: 'hang-3', label: 'Hạng III' },
];

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

/** Màu nhóm hồ sơ Đ.8.4 — tài chính lưu tại đơn vị, pháp lý/kỹ thuật nộp lưu trữ Viện. */
const NHOM_HO_SO_CLS: Record<NhomHoSo, string> = {
  'phap-ly': 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'ky-thuat': 'bg-blue-50 text-info dark:bg-blue-900/20 dark:text-blue-400',
  'tai-chinh': 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
};

function PanelShell({
  title,
  onAdd,
  adding,
  children,
  footer,
}: {
  title: string;
  onAdd?: () => void;
  adding: boolean;
  children: ReactNode;
  footer?: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">{title}</h4>
        {onAdd && (
          <button
            onClick={onAdd}
            disabled={adding}
            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary transition-colors hover:bg-muted disabled:opacity-50"
          >
            <Plus size={11} /> Thêm dòng
          </button>
        )}
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

const EMPTY_DOT: DotThanhToanInput = {
  tenDot: '', soTien: '', ngayDuKien: '', ngayThucThu: '', soHoaDon: '', ngayXuatHoaDon: '',
};

/** Nhãn + màu trạng thái đợt — Đ.11.1; "đã xuất HĐ, chưa thu" là công nợ chạy đồng hồ VAT (Đ.14 TT7). */
const TRANG_THAI_DOT: Record<string, { nhan: string; cls: string }> = {
  'ke-hoach': { nhan: 'Kế hoạch', cls: 'bg-subtle text-ink-muted' },
  'qua-han': { nhan: 'Quá hạn thu', cls: 'bg-red-50 text-danger dark:bg-red-900/20 dark:text-red-400' },
  'da-xuat-hoa-don': { nhan: 'Đã xuất HĐ — chờ thu', cls: 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400' },
  'da-thu': { nhan: 'Đã thu', cls: 'bg-emerald-50 text-success dark:bg-emerald-900/20 dark:text-emerald-400' },
};

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
  /** Đã xuất hóa đơn nhưng bên A chưa trả — công nợ chạy nghĩa vụ VAT 1 năm (Đ.14 mục 2 dòng 7). */
  const daXuatChuaThu = rows
    .filter((r) => r.trangThai === 'da-xuat-hoa-don')
    .reduce((s, r) => s + r.soTien, 0);
  /** Có số hóa đơn nhưng thiếu ngày xuất → không tính được mốc VAT 1 năm, phải nhắc bổ sung. */
  const thieuNgayXuat = rows.filter((r) => r.soHoaDon && !r.ngayXuatHoaDon).length;

  const editorRow = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5">
        <input className={miniInput} placeholder="Tên đợt" value={form.tenDot}
          onChange={(e) => setForm({ ...form, tenDot: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <NumberInput className={miniInput} placeholder="Số tiền (triệu đ)" value={form.soTien}
          onChange={(val) => setForm({ ...form, soTien: val })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="date" value={form.ngayDuKien}
          onChange={(e) => setForm({ ...form, ngayDuKien: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} placeholder="Số HĐ GTGT" value={form.soHoaDon}
          onChange={(e) => setForm({ ...form, soHoaDon: e.target.value })} />
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="date" value={form.ngayXuatHoaDon}
          onChange={(e) => setForm({ ...form, ngayXuatHoaDon: e.target.value })} />
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
          {daXuatChuaThu > 0 && (
            <span title="Đã xuất hóa đơn nhưng chưa thu — nghĩa vụ VAT 1 năm theo Đ.14 mục 2 dòng 7">
              Đã xuất HĐ chưa thu: <b className="font-mono text-warning">{daXuatChuaThu.toLocaleString('vi-VN')} tr</b>
            </span>
          )}
          <span>Còn phải thu: <b className="font-mono text-warning">{Math.max(0, giaTri - daThu).toLocaleString('vi-VN')} tr</b></span>
        </div>
      }
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      {thieuNgayXuat > 0 && (
        <p className="px-3 py-1.5 text-2xs font-semibold text-warning">
          {thieuNgayXuat} đợt có số hóa đơn nhưng thiếu ngày xuất — chưa tính được mốc nghĩa vụ VAT 1 năm (Đ.14 mục 2 dòng 7).
        </p>
      )}
      <table className="w-full min-w-[720px]">
        <thead>
          <tr>
            <th className="th-cell">Đợt</th>
            <th className="th-cell">Số tiền (tr.đ)</th>
            <th className="th-cell">Dự kiến</th>
            <th className="th-cell">Số hóa đơn</th>
            <th className="th-cell">Ngày xuất HĐ</th>
            <th className="th-cell">Thực thu</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? (
              editorRow(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">
                  {r.tenDot}
                  <span className={cn('ml-1.5 rounded-full px-1.5 py-0.5 text-2xs font-bold', TRANG_THAI_DOT[r.trangThai]?.cls)}>
                    {TRANG_THAI_DOT[r.trangThai]?.nhan ?? r.trangThai}
                  </span>
                </td>
                <td className="td-cell font-mono text-xs">{r.soTien.toLocaleString('vi-VN')}</td>
                <td className="td-cell font-mono text-xs">{r.ngayDuKien ? formatNgay(r.ngayDuKien) : '—'}</td>
                <td className="td-cell font-mono text-xs">{r.soHoaDon || '—'}</td>
                <td className="td-cell font-mono text-xs">{r.ngayXuatHoaDon ? formatNgay(r.ngayXuatHoaDon) : '—'}</td>
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
                      setForm({
                        tenDot: r.tenDot,
                        soTien: String(r.soTien),
                        ngayDuKien: r.ngayDuKien,
                        ngayThucThu: r.ngayThucThu,
                        soHoaDon: r.soHoaDon,
                        ngayXuatHoaDon: r.ngayXuatHoaDon,
                      });
                      setEditingId(r.id);
                    }}
                    onDelete={() => remove(r.id)}
                  />
                </td>
              </tr>
            ),
          )}
          {editingId === 'new' && editorRow('new')}
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

const EMPTY_CTV: CtvGiaoViecInput = { nhanSuId: '', tyLePhanChia: '', ghiChu: '', laNgoaiVien: false, soHdGiaoKhoan: '' };

export function CtvGiaoViecPanel({
  phieuGiaoViecId,
  nhanSuOptions,
  kinhPhiGiao,
  onChanged,
  readOnly = false,
}: {
  phieuGiaoViecId: string;
  nhanSuOptions: Option[];
  kinhPhiGiao?: number;
  onChanged?: () => void;
  readOnly?: boolean;
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

  const tongTyLe = rows.reduce((acc, r) => acc + (Number(r.tyLePhanChia) || 0), 0);
  const kpBase = kinhPhiGiao || 0;
  const tongSoTien = kpBase > 0 ? (tongTyLe / 100) * kpBase : 0;

  const editor = (key: string) => {
    const formPct = Number(form.tyLePhanChia) || 0;
    const calcMoney = kpBase > 0 ? Math.round(((formPct / 100) * kpBase) * 100) / 100 : 0;

    return (
      <tr key={key} className="bg-subtle">
        <td className="px-3 py-1.5">
          <select className={miniInput} value={form.nhanSuId} onChange={(e) => setForm({ ...form, nhanSuId: e.target.value })}>
            <option value="">-- Chọn cán bộ / nhân sự --</option>
            {nhanSuOptions.map((n) => <option key={n.id} value={n.id}>{n.ten}</option>)}
          </select>
        </td>
        <td className="px-3 py-1.5">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-1">
              <input className={miniInput} type="number" min={0} max={100} placeholder="%" value={form.tyLePhanChia}
                onChange={(e) => setForm({ ...form, tyLePhanChia: e.target.value })} />
              <span className="text-2xs font-bold text-ink-muted">%</span>
            </div>
            {kpBase > 0 && formPct > 0 && (
              <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                = {formatTrieu(calcMoney)}
              </span>
            )}
          </div>
        </td>
        {kpBase > 0 && (
          <td className="px-3 py-1.5 font-mono text-xs font-bold text-emerald-700 dark:text-emerald-300">
            {formatTrieu(calcMoney)}
          </td>
        )}
        <td className="px-3 py-1.5">
          <input
            className={miniInput}
            list="vai-tro-2815-list"
            placeholder="Vai trò / Ghi chú (QC 2815)"
            value={form.ghiChu}
            onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
          />
          <datalist id="vai-tro-2815-list">
            <option value="Chủ trì Kỹ thuật / Chủ trì bộ môn" />
            <option value="Chủ nhiệm dự án / Chủ nhiệm thiết kế / Khảo sát" />
            <option value="Giám sát trưởng / Chỉ huy trưởng" />
            <option value="Kiểm định viên chính" />
            <option value="Thí nghiệm viên vật liệu" />
            <option value="Cán bộ khảo sát địa kỹ thuật / Trắc đạc" />
            <option value="Xử lý số liệu & Lập báo cáo" />
          </datalist>
        </td>
        <td className="px-3 py-1.5">
          <div className="flex flex-col gap-1">
            <label className="flex items-center gap-1.5 text-2xs font-medium text-ink-secondary whitespace-nowrap">
              <input
                type="checkbox"
                checked={form.laNgoaiVien}
                onChange={(e) => setForm({ ...form, laNgoaiVien: e.target.checked })}
              />
              CTV ngoài Viện
            </label>
            {form.laNgoaiVien && (
              <input
                className={miniInput}
                placeholder="Số HĐ giao khoán (bắt buộc — Đ.7.6)"
                value={form.soHdGiaoKhoan}
                onChange={(e) => setForm({ ...form, soHdGiaoKhoan: e.target.value })}
              />
            )}
          </div>
        </td>
        <td className="px-3 py-1.5"><RowBtns onSave={save} onCancel={() => setEditingId(null)} saving={saving} /></td>
      </tr>
    );
  };

  return (
    <PanelShell
      title="Thành viên / Cán bộ phối hợp thực hiện (Điều 7)"
      adding={editingId !== null}
      onAdd={readOnly ? undefined : () => { setForm(EMPTY_CTV); setEditingId('new'); }}
      footer={
        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border-subtle bg-muted/30 px-3 py-2 text-2xs">
          <span className="font-semibold text-ink-muted">Tổng tỷ lệ phân chia kinh phí giao việc:</span>
          <div className="flex items-center gap-3">
            {kpBase > 0 && (
              <span className="font-mono text-emerald-700 dark:text-emerald-300 font-bold">
                Tổng kinh phí phân bổ: {formatTrieu(tongSoTien)}
              </span>
            )}
            <span className={cn('font-mono font-bold', tongTyLe === 100 ? 'text-success' : 'text-primary')}>
              {tongTyLe}% / 100%
            </span>
          </div>
        </div>
      }
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[480px]">
        <thead>
          <tr>
            <th className="th-cell">Cán bộ / Thành viên</th>
            <th className="th-cell text-center">Tỷ lệ (%)</th>
            {kpBase > 0 && <th className="th-cell text-right">Kinh phí giao (triệu VNĐ)</th>}
            <th className="th-cell">Ghi chú / Vai trò (QC 2815)</th>
            <th className="th-cell">Ngoài Viện (Đ.7.6)</th>
            {!readOnly && <th className="th-cell text-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const rowPct = Number(r.tyLePhanChia) || 0;
            const rowMoney = kpBase > 0 ? (rowPct / 100) * kpBase : 0;

            return editingId === r.id ? (
              editor(r.id)
            ) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-bold text-ink">{r.hoTen || '—'}</td>
                <td className="td-cell text-center font-mono text-xs font-bold text-primary">{r.tyLePhanChia}%</td>
                {kpBase > 0 && (
                  <td className="td-cell text-right font-mono text-xs font-black text-emerald-700 dark:text-emerald-300">
                    {formatTrieu(rowMoney)}
                  </td>
                )}
                <td className="td-cell text-xs text-ink-secondary">{r.ghiChu || '—'}</td>
                <td className="td-cell text-xs">
                  {r.laNgoaiVien ? (
                    r.soHdGiaoKhoan ? (
                      <span className="inline-flex rounded bg-sky-100 dark:bg-sky-900/40 px-1.5 py-0.5 text-2xs font-bold text-sky-800 dark:text-sky-300" title="CTV ngoài Viện — có HĐ giao khoán">
                        Giao khoán: {r.soHdGiaoKhoan}
                      </span>
                    ) : (
                      <span className="inline-flex rounded bg-danger-subtle px-1.5 py-0.5 text-2xs font-bold text-danger">
                        Thiếu HĐ giao khoán!
                      </span>
                    )
                  ) : (
                    <span className="text-ink-muted">—</span>
                  )}
                </td>
                {!readOnly && (
                  <td className="td-cell">
                    <EditDeleteBtns
                      onEdit={() => {
                        setForm({
                          nhanSuId: r.nhanSuId ?? '',
                          tyLePhanChia: String(r.tyLePhanChia),
                          ghiChu: r.ghiChu,
                          laNgoaiVien: r.laNgoaiVien,
                          soHdGiaoKhoan: r.soHdGiaoKhoan,
                        });
                        setEditingId(r.id);
                      }}
                      onDelete={() => remove(r.id)}
                    />
                  </td>
                )}
              </tr>
            );
          })}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && (
            <tr><td colSpan={kpBase > 0 ? 6 : 5} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa có thành viên / cán bộ phối hợp thực hiện</td></tr>
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

const EMPTY_KT: KiemTraNoiBoInput = {
  ngayKiemTra: '', nguoiKiemTraId: '', noiDung: '', ketLuan: '', kienNghi: '',
  capKiemTra: 'don-vi', theoKeHoach: true,
};

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
          {/* Đ.10 — phân biệt đơn vị tự kiểm (10.1) với Viện kiểm tra định kỳ/đột xuất (10.2) */}
          <div className="grid grid-cols-2 gap-2">
            <select
              className={miniInput}
              value={form.capKiemTra}
              onChange={(e) => setForm({ ...form, capKiemTra: e.target.value as CapKiemTra })}
              title={CAP_KIEM_TRA_OPTIONS.find((o) => o.value === form.capKiemTra)?.canCu}
            >
              {CAP_KIEM_TRA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
            <select
              className={miniInput}
              value={form.theoKeHoach ? 'ke-hoach' : 'dot-xuat'}
              onChange={(e) => setForm({ ...form, theoKeHoach: e.target.value === 'ke-hoach' })}
            >
              <option value="ke-hoach">Định kỳ theo kế hoạch năm</option>
              <option value="dot-xuat">Đột xuất</option>
            </select>
          </div>
          <textarea className={miniInput} placeholder="Nội dung kiểm tra" rows={2} value={form.noiDung} onChange={(e) => setForm({ ...form, noiDung: e.target.value })} />
          <textarea className={miniInput} placeholder="Kết luận" rows={2} value={form.ketLuan} onChange={(e) => setForm({ ...form, ketLuan: e.target.value })} />
          <textarea className={miniInput} placeholder="Kiến nghị" rows={2} value={form.kienNghi} onChange={(e) => setForm({ ...form, kienNghi: e.target.value })} />
          <RowBtns onSave={save} onCancel={() => setAdding(false)} saving={saving} />
        </div>
      )}
      <table className="w-full min-w-[560px]">
        <thead>
          <tr>
            <th className="th-cell">Ngày KT</th>
            <th className="th-cell">Cấp kiểm tra</th>
            <th className="th-cell">Kết luận</th>
            <th className="th-cell text-right">Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="tr-hover">
              <td className="td-cell font-mono text-xs">{r.ngayKiemTra ? formatNgay(r.ngayKiemTra) : '—'}</td>
              <td className="td-cell text-xs">
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-2xs font-bold',
                    r.capKiemTra === 'vien'
                      ? 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400'
                      : 'bg-subtle text-ink-secondary',
                  )}
                  title={CAP_KIEM_TRA_OPTIONS.find((o) => o.value === r.capKiemTra)?.canCu}
                >
                  {r.capKiemTra === 'vien' ? 'Viện' : 'Đơn vị'}
                </span>
                <span className="ml-1 text-2xs text-ink-muted">
                  {r.theoKeHoach ? `định kỳ${r.namKeHoach ? ` ${r.namKeHoach}` : ''}` : 'đột xuất'}
                </span>
              </td>
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
            <tr><td colSpan={4} className="td-cell py-3 text-center text-xs italic text-ink-muted">Chưa có biên bản kiểm tra</td></tr>
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
  trangThaiHopDong,
  onChanged,
}: {
  hopDongId: string;
  /** Để nhắc nghĩa vụ nộp lưu trữ Đ.8.4 khi hợp đồng đã thanh lý. */
  trangThaiHopDong?: string;
  onChanged?: () => void;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchTepHopDong(hopDongId), []);
  const inputRef = useRef<HTMLInputElement>(null);
  const [loaiHoSo, setLoaiHoSo] = useState('khac');
  /** Đ.8.4: chỉ hồ sơ pháp lý + kỹ thuật phải nộp lưu trữ Viện; hồ sơ tài chính lưu tại đơn vị. */
  const soTepNopVien = rows.filter((r) => nhomCuaLoaiHoSo(r.loaiHoSo) !== 'tai-chinh').length;
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

      {/* Đ.8.4 — thống kê theo 3 nhóm + nhắc nghĩa vụ nộp lưu trữ sau khi thanh lý */}
      {rows.length > 0 && (
        <div className="border-b border-border-subtle bg-subtle px-3 py-2">
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-2xs">
            {(Object.keys(NHOM_HO_SO) as NhomHoSo[]).map((nhom) => {
              const n = rows.filter((r) => nhomCuaLoaiHoSo(r.loaiHoSo) === nhom).length;
              return (
                <span key={nhom} className="text-ink-secondary">
                  <span className={cn('mr-1 rounded-full px-1.5 py-0.5 font-bold', NHOM_HO_SO_CLS[nhom])}>
                    {NHOM_HO_SO[nhom].ten}
                  </span>
                  {n} tệp — <span className="italic text-ink-muted">{NHOM_HO_SO[nhom].noiLuu}</span>
                </span>
              );
            })}
          </div>
          {trangThaiHopDong === 'thanh-ly' && soTepNopVien > 0 && (
            <p className="mt-1.5 text-2xs font-semibold text-warning">
              Điều 8.4: hợp đồng đã thanh lý — {soTepNopVien} tệp pháp lý/kỹ thuật thuộc diện nộp lưu trữ
              Viện (P.TCHC) trong đợt nộp định kỳ hàng năm. Ghi nhận việc bàn giao ở tab “Lưu trữ TCHC”.
            </p>
          )}
        </div>
      )}

      <div className="divide-y divide-border-subtle">
        {rows.map((r) => (
          <div key={r.id} className="flex items-center justify-between gap-2 px-3 py-2">
            <div className="min-w-0 flex-1">
              <p className="truncate text-xs font-medium text-ink">{r.tenTep}</p>
              <p className="flex flex-wrap items-center gap-1.5 text-2xs text-ink-muted">
                {LOAI_HO_SO_OPTIONS.find((o) => o.value === r.loaiHoSo)?.label ?? r.loaiHoSo}
                {(() => {
                  const nhom = nhomCuaLoaiHoSo(r.loaiHoSo);
                  return (
                    <span
                      className={cn('rounded-full px-1.5 py-0.5 font-bold', NHOM_HO_SO_CLS[nhom])}
                      title={`Đ.8.4 — ${NHOM_HO_SO[nhom].noiLuu}`}
                    >
                      {NHOM_HO_SO[nhom].ten}
                    </span>
                  );
                })()}
              </p>
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

// ═══ NHẬT KÝ TRUY VẾT HỢP ĐỒNG (Điều 9, Điều 10) ═══
// Chỉ đọc — dữ liệu do trigger fn_ghi_nhat_ky ghi tự động ở CSDL, không sửa/xóa được
// từ ứng dụng, đúng bản chất một vết kiểm toán.

const NHAN_HANH_DONG: Record<string, string> = {
  INSERT: 'Tạo mới',
  UPDATE: 'Cập nhật',
  DELETE: 'Xóa',
};

export function NhatKyHopDongPanel({ hopDongId }: { hopDongId: string }) {
  const { data: rows, loading, error } = useAsyncData(() => fetchNhatKyHopDong(hopDongId), []);

  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border-subtle px-3 py-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">
          Nhật ký truy vết (Điều 9, Điều 10)
        </h4>
      </div>

      {loading && <p className="px-3 py-3 text-center text-xs italic text-ink-muted">Đang tải…</p>}
      {error && <p className="px-3 py-2 text-2xs font-semibold text-danger">{error}</p>}

      <div className="divide-y divide-border-subtle">
        {rows.map((r) => (
          <div key={r.id} className="px-3 py-2 text-xs">
            <div className="flex flex-wrap items-center gap-2">
              <span
                className={cn(
                  'rounded px-1.5 py-0.5 text-2xs font-bold',
                  r.hanhDong === 'INSERT'
                    ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                    : r.hanhDong === 'DELETE'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                      : 'bg-muted text-ink-secondary',
                )}
              >
                {NHAN_HANH_DONG[r.hanhDong] ?? r.hanhDong}
              </span>
              <span className="font-mono text-2xs text-ink-muted">
                {r.thoiDiem ? new Date(r.thoiDiem).toLocaleString('vi-VN') : '—'}
              </span>
              {r.vaiTro && (
                <span className="rounded bg-subtle px-1.5 py-0.5 text-2xs font-semibold text-ink-secondary">
                  {r.vaiTro}
                </span>
              )}
            </div>
            {r.thayDoi.length > 0 && (
              <ul className="mt-1 space-y-0.5 pl-1">
                {r.thayDoi.map((t, i) => (
                  <li key={i} className="text-2xs text-ink-secondary">
                    <span className="font-semibold text-ink">{t.truong}:</span>{' '}
                    <span className="text-ink-muted line-through">{t.tuGiaTri}</span> → <strong>{t.denGiaTri}</strong>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
        {!loading && !error && rows.length === 0 && (
          <p className="px-3 py-3 text-center text-xs italic text-ink-muted">
            Chưa có vết thay đổi. Nhật ký bắt đầu ghi sau khi chạy migration 0013.
          </p>
        )}
      </div>
    </div>
  );
}

// ═══ ĐƠN VỊ PHỐI HỢP (Điều 7.1) ═══
// HĐ nhiều đơn vị cùng thực hiện: chia tỷ lệ giá trị HĐ giữa các đơn vị ngay trên
// Phiếu giao việc. Tổng tỷ lệ phải đủ 100% mới phân bổ đúng kinh phí (Điều 12.1).

const EMPTY_DVGV: DonViGiaoViecInput = { donViId: '', tyLeGiaTri: '', vaiTro: 'phoi-hop', ghiChu: '' };

export function DonViGiaoViecPanel({
  phieuGiaoViecId,
  donViOptions,
  giaTriHopDong,
  readOnly = false,
}: {
  phieuGiaoViecId: string;
  donViOptions: Option[];
  giaTriHopDong: number;
  readOnly?: boolean;
}) {
  const { data: rows, refetch } = useAsyncData(() => fetchDonViGiaoViec(phieuGiaoViecId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DonViGiaoViecInput>(EMPTY_DVGV);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!form.donViId) {
      setErr('Chưa chọn đơn vị.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createDonViGiaoViec(phieuGiaoViecId, form);
      else if (editingId) await updateDonViGiaoViec(editingId, form);
      setEditingId(null);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa đơn vị này khỏi phiếu giao việc?')) return;
    try {
      await deleteDonViGiaoViec(id);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const tongTyLe = rows.reduce((s, r) => s + r.tyLeGiaTri, 0);
  const duTramPhanTram = Math.abs(tongTyLe - 100) < 0.01;
  const soChuTri = rows.filter((r) => r.vaiTro === 'chu-tri').length;

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5">
        <select className={miniInput} value={form.donViId} onChange={(e) => setForm({ ...form, donViId: e.target.value })}>
          <option value="">-- Chọn đơn vị --</option>
          {donViOptions.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5">
        <select className={miniInput} value={form.vaiTro}
          onChange={(e) => setForm({ ...form, vaiTro: e.target.value as DonViGiaoViecInput['vaiTro'] })}>
          <option value="chu-tri">Chủ trì</option>
          <option value="phoi-hop">Phối hợp</option>
        </select>
      </td>
      <td className="px-3 py-1.5">
        <input className={miniInput} type="number" min={0} max={100} step="0.01" placeholder="%"
          value={form.tyLeGiaTri} onChange={(e) => setForm({ ...form, tyLeGiaTri: e.target.value })} />
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
      title="Đơn vị thực hiện & tỷ lệ chia giá trị (Điều 7.1)"
      adding={editingId !== null}
      onAdd={readOnly ? undefined : () => { setForm(EMPTY_DVGV); setEditingId('new'); }}
      footer={
        <div className="space-y-1 border-t border-border-subtle px-3 py-2 text-xs">
          <div className="flex flex-wrap justify-end gap-4">
            <span>
              Tổng tỷ lệ:{' '}
              <b className={cn('font-mono', duTramPhanTram ? 'text-success' : 'text-warning')}>
                {tongTyLe.toLocaleString('vi-VN', { maximumFractionDigits: 2 })}%
              </b>
            </span>
          </div>
          {rows.length > 0 && !duTramPhanTram && (
            <p className="text-2xs font-semibold text-warning">
              Tổng tỷ lệ chưa đủ 100% — kinh phí giao các đơn vị sẽ không khớp giá trị hợp đồng.
            </p>
          )}
          {soChuTri > 1 && (
            <p className="text-2xs font-semibold text-danger">
              Điều 4.3: mỗi hợp đồng chỉ có MỘT đơn vị chủ trì — hiện đang có {soChuTri}.
            </p>
          )}
        </div>
      }
    >
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[560px]">
        <thead>
          <tr>
            <th className="th-cell">Đơn vị</th>
            <th className="th-cell">Vai trò</th>
            <th className="th-cell">Tỷ lệ (%)</th>
            <th className="th-cell">Giá trị tương ứng</th>
            {!readOnly && <th className="th-cell text-right">Thao tác</th>}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) =>
            editingId === r.id ? editor(r.id) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.tenDonVi || '—'}</td>
                <td className="td-cell">
                  <span className={cn(
                    'rounded px-1.5 py-0.5 text-2xs font-bold',
                    r.vaiTro === 'chu-tri'
                      ? 'bg-primary-subtle text-primary'
                      : 'bg-muted text-ink-secondary',
                  )}>
                    {r.vaiTro === 'chu-tri' ? 'Chủ trì' : 'Phối hợp'}
                  </span>
                </td>
                <td className="td-cell font-mono text-xs">{r.tyLeGiaTri}%</td>
                <td className="td-cell font-mono text-xs text-ink-secondary">
                  {formatTrieu((giaTriHopDong * r.tyLeGiaTri) / 100)}
                </td>
                {!readOnly && (
                  <td className="td-cell">
                    <EditDeleteBtns
                      onEdit={() => {
                        setForm({ donViId: r.donViId ?? '', tyLeGiaTri: String(r.tyLeGiaTri), vaiTro: r.vaiTro, ghiChu: r.ghiChu });
                        setEditingId(r.id);
                      }}
                      onDelete={() => remove(r.id)}
                    />
                  </td>
                )}
              </tr>
            ),
          )}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && (
            <tr><td colSpan={5} className="td-cell py-3 text-center text-xs italic text-ink-muted">
              Chưa khai báo đơn vị — chỉ cần khai khi hợp đồng do nhiều đơn vị cùng thực hiện.
            </td></tr>
          )}
        </tbody>
      </table>
    </PanelShell>
  );
}
