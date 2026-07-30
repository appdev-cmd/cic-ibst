import { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X, LoaderCircle } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchSlaHopDong,
  fetchTienDoHopDong,
  createTienDo,
  updateTienDo,
  deleteTienDo,
  type TienDoInput,
} from '../services/chitiet';
import { formatNgay, cn } from '../lib/utils';

// Theo dõi thực hiện hợp đồng: mốc hạn theo Quy chế (Điều 6.3, 9.6c, 11.1 — do trigger
// CSDL sinh tự động, chỉ đọc) và báo cáo tiến độ/khối lượng/chất lượng/ATLĐ (Điều 8.1).

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

const NHAN_CHAT_LUONG: Record<TienDoInput['danhGiaChatLuong'], string> = {
  dat: 'Đạt',
  'can-khac-phuc': 'Cần khắc phục',
  'khong-dat': 'Không đạt',
};

const EMPTY_TD: TienDoInput = {
  kyBaoCao: '',
  phanTramKhoiLuong: '',
  danhGiaChatLuong: 'dat',
  suCoAtld: false,
  moTaSuCo: '',
  ghiChu: '',
};

export function ThucHienHopDongPanel({ hopDongId }: { hopDongId: string }) {
  const { data: slas, error: slaErr } = useAsyncData(() => fetchSlaHopDong(hopDongId), []);
  const { data: rows, refetch } = useAsyncData(() => fetchTienDoHopDong(hopDongId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<TienDoInput>(EMPTY_TD);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const save = async () => {
    if (!form.kyBaoCao) {
      setErr('Chưa chọn kỳ báo cáo.');
      return;
    }
    setSaving(true);
    setErr(null);
    try {
      if (editingId === 'new') await createTienDo(hopDongId, form);
      else if (editingId) await updateTienDo(editingId, form);
      setEditingId(null);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!window.confirm('Xóa kỳ báo cáo tiến độ này?')) return;
    try {
      await deleteTienDo(id);
      refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    }
  };

  const moiNhat = rows[0];

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5">
        <input
          className={miniInput}
          type="date"
          value={form.kyBaoCao}
          onChange={(e) => setForm({ ...form, kyBaoCao: e.target.value })}
        />
      </td>
      <td className="px-3 py-1.5">
        <input
          className={miniInput}
          type="number"
          min={0}
          max={100}
          placeholder="%"
          value={form.phanTramKhoiLuong}
          onChange={(e) => setForm({ ...form, phanTramKhoiLuong: e.target.value })}
        />
      </td>
      <td className="px-3 py-1.5">
        <select
          className={miniInput}
          value={form.danhGiaChatLuong}
          onChange={(e) =>
            setForm({ ...form, danhGiaChatLuong: e.target.value as TienDoInput['danhGiaChatLuong'] })
          }
        >
          {Object.entries(NHAN_CHAT_LUONG).map(([v, l]) => (
            <option key={v} value={v}>
              {l}
            </option>
          ))}
        </select>
      </td>
      <td className="px-3 py-1.5">
        <label className="flex items-center gap-1 text-2xs text-ink-secondary">
          <input
            type="checkbox"
            checked={form.suCoAtld}
            onChange={(e) => setForm({ ...form, suCoAtld: e.target.checked })}
          />
          Có sự cố
        </label>
      </td>
      <td className="px-3 py-1.5">
        <div className="flex justify-end gap-1">
          <button onClick={save} disabled={saving} title="Lưu" className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            {saving ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}
          </button>
          <button onClick={() => setEditingId(null)} title="Hủy" className="rounded p-1 text-ink-muted hover:bg-muted">
            <X size={13} />
          </button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      {/* Mốc hạn theo Quy chế — chỉ đọc */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border-subtle px-3 py-2">
          <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">
            Hạn xử lý theo Quy chế (Điều 6.3, 9.6c, 11.1)
          </h4>
        </div>
        {slaErr && <p className="px-3 py-2 text-2xs font-semibold text-danger">{slaErr}</p>}
        <div className="divide-y divide-border-subtle">
          {slas.map((s) => {
            const treHan = s.trangThai === 'vi-pham';
            return (
              <div key={s.id} className="flex flex-wrap items-center justify-between gap-2 px-3 py-2 text-xs">
                <span className="min-w-0 flex-1 text-ink">{s.tenSla}</span>
                <span className="font-mono text-2xs text-ink-muted">
                  Hạn {s.hanChot ? formatNgay(s.hanChot.slice(0, 10)) : '—'}
                </span>
                <span
                  className={cn(
                    'rounded px-1.5 py-0.5 text-2xs font-bold',
                    s.trangThai === 'dat'
                      ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : treHan
                        ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                        : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                  )}
                >
                  {s.trangThai === 'dat' ? 'Đạt hạn' : treHan ? 'Vi phạm hạn' : 'Đang chạy'}
                </span>
              </div>
            );
          })}
          {slas.length === 0 && !slaErr && (
            <p className="px-3 py-3 text-center text-xs italic text-ink-muted">
              Chưa có mốc hạn. Hạn được tạo tự động khi hợp đồng mới được lập hoặc phiếu giao việc chuyển bước.
            </p>
          )}
        </div>
      </div>

      {/* Tiến độ Điều 8.1 */}
      <div className="rounded-lg border border-border">
        <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
          <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">
            Tiến độ, khối lượng, chất lượng, ATLĐ (Điều 8.1)
          </h4>
          <button
            onClick={() => {
              setForm(EMPTY_TD);
              setEditingId('new');
            }}
            disabled={editingId !== null}
            className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary hover:bg-muted disabled:opacity-50"
          >
            <Plus size={11} /> Thêm kỳ
          </button>
        </div>

        {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}

        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px]">
            <thead>
              <tr>
                <th className="th-cell">Kỳ báo cáo</th>
                <th className="th-cell">Khối lượng</th>
                <th className="th-cell">Chất lượng</th>
                <th className="th-cell">ATLĐ</th>
                <th className="th-cell text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) =>
                editingId === r.id ? (
                  editor(r.id)
                ) : (
                  <tr key={r.id} className="tr-hover">
                    <td className="td-cell font-mono text-xs">{r.kyBaoCao ? formatNgay(r.kyBaoCao) : '—'}</td>
                    <td className="td-cell font-mono text-xs">{r.phanTramKhoiLuong}%</td>
                    <td className="td-cell">
                      <span
                        className={cn(
                          'rounded px-1.5 py-0.5 text-2xs font-bold',
                          r.danhGiaChatLuong === 'dat'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                            : r.danhGiaChatLuong === 'khong-dat'
                              ? 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300'
                              : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
                        )}
                      >
                        {NHAN_CHAT_LUONG[r.danhGiaChatLuong]}
                      </span>
                    </td>
                    <td className="td-cell text-xs">
                      {r.suCoAtld ? (
                        <span className="font-bold text-danger" title={r.moTaSuCo}>
                          Có sự cố
                        </span>
                      ) : (
                        <span className="text-ink-muted">An toàn</span>
                      )}
                    </td>
                    <td className="td-cell">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => {
                            setForm({
                              kyBaoCao: r.kyBaoCao,
                              phanTramKhoiLuong: String(r.phanTramKhoiLuong),
                              danhGiaChatLuong: r.danhGiaChatLuong,
                              suCoAtld: r.suCoAtld,
                              moTaSuCo: r.moTaSuCo,
                              ghiChu: r.ghiChu,
                            });
                            setEditingId(r.id);
                          }}
                          title="Sửa"
                          className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600"
                        >
                          <Pencil size={12} />
                        </button>
                        <button
                          onClick={() => remove(r.id)}
                          title="Xóa"
                          className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ),
              )}
              {editingId === 'new' && editor('new')}
              {rows.length === 0 && editingId !== 'new' && (
                <tr>
                  <td colSpan={5} className="td-cell py-3 text-center text-xs italic text-ink-muted">
                    Chưa có báo cáo tiến độ nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {moiNhat && (
          <div className="flex justify-end border-t border-border-subtle px-3 py-2 text-xs">
            <span>
              Khối lượng mới nhất: <b className="font-mono text-primary">{moiNhat.phanTramKhoiLuong}%</b>
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
