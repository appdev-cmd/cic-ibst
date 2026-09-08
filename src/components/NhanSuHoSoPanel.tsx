import { useState, type FormEvent, type ReactNode } from 'react';
import { Plus, Pencil, Trash2, LoaderCircle, Award, Briefcase, GraduationCap, Wallet, ClipboardCheck } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { ChungChiPanel } from './DetailPanels';
import { SlideOverTabs, type SlideOverTabDef } from './SlideOver';
import {
  fetchQuaTrinhCongTac,
  createQuaTrinhCongTac,
  updateQuaTrinhCongTac,
  deleteQuaTrinhCongTac,
  fetchBangCap,
  createBangCap,
  updateBangCap,
  deleteBangCap,
  fetchHopDongLaoDong,
  createHopDongLaoDong,
  updateHopDongLaoDong,
  deleteHopDongLaoDong,
  fetchLuongNgachBac,
  createLuongNgachBac,
  deleteLuongNgachBac,
  fetchDanhGiaCbvc,
  createDanhGiaCbvc,
  updateDanhGiaCbvc,
  deleteDanhGiaCbvc,
  type QuaTrinhCongTacInput,
  type BangCapInput,
  type HopDongLaoDongInput,
  type LuongNgachBacInput,
  type DanhGiaCbvcInput,
} from '../services/nhanSu';
import {
  LOAI_QUA_TRINH_CONG_TAC,
  LOAI_BANG_CAP,
  LOAI_HOP_DONG_LAO_DONG,
  LOAI_THAY_DOI_LUONG,
  XEP_LOAI_DANH_GIA,
  type QuaTrinhCongTac,
  type BangCap,
  type HopDongLaoDong,
  type LuongNgachBac,
  type DanhGiaCbvc,
} from '../types';
import { formatNgay, cn } from '../lib/utils';

const smallInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

function EmptyRow({ span, text }: { span: number; text: string }) {
  return (
    <tr>
      <td colSpan={span} className="px-3 py-3 text-center text-2xs italic text-ink-muted">
        {text}
      </td>
    </tr>
  );
}

function RowActions({ onEdit, onDelete }: { onEdit: () => void; onDelete: () => void }) {
  return (
    <div className="flex justify-end gap-1">
      <button onClick={onEdit} title="Sửa" className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600">
        <Pencil size={12} />
      </button>
      <button onClick={onDelete} title="Xóa" className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20">
        <Trash2 size={12} />
      </button>
    </div>
  );
}

function Section({ title, onAdd, addLabel, children }: { title: string; onAdd?: () => void; addLabel?: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">{title}</h4>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary hover:bg-muted">
            <Plus size={11} /> {addLabel ?? 'Thêm dòng'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

// ═══ Quá trình công tác ═══

const EMPTY_QTCT: QuaTrinhCongTacInput = {
  loai: 'bo-nhiem', tieuDe: '', soQuyetDinh: '', ngayKy: '', ngayHieuLuc: '', ngayKetThuc: '', donViId: '', chucVu: '', moTa: '',
};

function QuaTrinhCongTacTab({ nhanSuId, onChanged }: { nhanSuId: string; onChanged?: () => void }) {
  const { data: rows, refetch } = useAsyncData(() => fetchQuaTrinhCongTac(nhanSuId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<QuaTrinhCongTacInput>(EMPTY_QTCT);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => { setEditingId(null); refetch(); onChanged?.(); };
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (editingId === 'new') await createQuaTrinhCongTac(nhanSuId, form);
      else if (editingId) await updateQuaTrinhCongTac(editingId, form);
      done();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Xóa mốc quá trình công tác này?')) return;
    try { await deleteQuaTrinhCongTac(id); done(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5">
        <select className={smallInput} value={form.loai} onChange={(e) => setForm({ ...form, loai: e.target.value })}>
          {LOAI_QUA_TRINH_CONG_TAC.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5"><input className={smallInput} placeholder="Tiêu đề / nội dung" value={form.tieuDe} onChange={(e) => setForm({ ...form, tieuDe: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input type="date" className={smallInput} value={form.ngayHieuLuc} onChange={(e) => setForm({ ...form, ngayHieuLuc: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={smallInput} placeholder="Số QĐ" value={form.soQuyetDinh} onChange={(e) => setForm({ ...form, soQuyetDinh: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <div className="flex justify-end gap-1">
          <button onClick={save} disabled={saving} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
            {saving ? <LoaderCircle size={13} className="animate-spin" /> : '✓'}
          </button>
          <button onClick={() => setEditingId(null)} className="rounded p-1 text-ink-muted hover:bg-muted">✕</button>
        </div>
      </td>
    </tr>
  );

  return (
    <Section title="Quá trình công tác" addLabel="Thêm mốc" onAdd={() => { setForm(EMPTY_QTCT); setEditingId('new'); }}>
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[560px]">
        <thead><tr><th className="th-cell">Loại</th><th className="th-cell">Nội dung</th><th className="th-cell">Hiệu lực</th><th className="th-cell">Số QĐ</th><th className="th-cell text-right">Thao tác</th></tr></thead>
        <tbody>
          {rows.map((r) => editingId === r.id ? editor(r.id) : (
            <tr key={r.id} className="tr-hover">
              <td className="td-cell text-xs">{LOAI_QUA_TRINH_CONG_TAC.find((o) => o.ma === r.loai)?.ten ?? r.loai}</td>
              <td className="td-cell text-xs font-medium">{r.tieuDe}{r.donVi && <span className="block text-2xs text-ink-muted">{r.donVi}{r.chucVu ? ` — ${r.chucVu}` : ''}</span>}</td>
              <td className="td-cell font-mono text-xs">{r.ngayHieuLuc ? formatNgay(r.ngayHieuLuc) : '—'}</td>
              <td className="td-cell text-xs text-ink-secondary">{r.soQuyetDinh || '—'}</td>
              <td className="td-cell"><RowActions onEdit={() => { setForm({ loai: r.loai, tieuDe: r.tieuDe, soQuyetDinh: r.soQuyetDinh, ngayKy: r.ngayKy, ngayHieuLuc: r.ngayHieuLuc, ngayKetThuc: r.ngayKetThuc, donViId: r.donViId ?? '', chucVu: r.chucVu, moTa: r.moTa }); setEditingId(r.id); }} onDelete={() => remove(r.id)} /></td>
            </tr>
          ))}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && <EmptyRow span={5} text="Chưa có dữ liệu quá trình công tác" />}
        </tbody>
      </table>
    </Section>
  );
}

// ═══ Bằng cấp ═══

const EMPTY_BANG_CAP: BangCapInput = { loai: 'bang-cap', ten: '', chuyenNganh: '', coSoDaoTao: '', xepLoai: '', namTotNghiep: '', ngayCap: '', ngayHetHan: '' };

function BangCapTab({ nhanSuId, onChanged }: { nhanSuId: string; onChanged?: () => void }) {
  const { data: rows, refetch } = useAsyncData(() => fetchBangCap(nhanSuId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BangCapInput>(EMPTY_BANG_CAP);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => { setEditingId(null); refetch(); onChanged?.(); };
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (editingId === 'new') await createBangCap(nhanSuId, form);
      else if (editingId) await updateBangCap(editingId, form);
      done();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Xóa bằng cấp này?')) return;
    try { await deleteBangCap(id); done(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5">
        <select className={smallInput} value={form.loai} onChange={(e) => setForm({ ...form, loai: e.target.value })}>
          {LOAI_BANG_CAP.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5"><input className={smallInput} placeholder="Tên bằng cấp" value={form.ten} onChange={(e) => setForm({ ...form, ten: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input className={smallInput} placeholder="Chuyên ngành" value={form.chuyenNganh} onChange={(e) => setForm({ ...form, chuyenNganh: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input type="date" className={smallInput} value={form.ngayCap} onChange={(e) => setForm({ ...form, ngayCap: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <div className="flex justify-end gap-1">
          <button onClick={save} disabled={saving} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">{saving ? <LoaderCircle size={13} className="animate-spin" /> : '✓'}</button>
          <button onClick={() => setEditingId(null)} className="rounded p-1 text-ink-muted hover:bg-muted">✕</button>
        </div>
      </td>
    </tr>
  );

  return (
    <Section title="Bằng cấp & Chứng chỉ đào tạo" addLabel="Thêm bằng cấp" onAdd={() => { setForm(EMPTY_BANG_CAP); setEditingId('new'); }}>
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[560px]">
        <thead><tr><th className="th-cell">Loại</th><th className="th-cell">Tên bằng cấp</th><th className="th-cell">Chuyên ngành</th><th className="th-cell">Ngày cấp</th><th className="th-cell text-right">Thao tác</th></tr></thead>
        <tbody>
          {rows.map((r) => editingId === r.id ? editor(r.id) : (
            <tr key={r.id} className="tr-hover">
              <td className="td-cell text-xs">{LOAI_BANG_CAP.find((o) => o.ma === r.loai)?.ten ?? r.loai}</td>
              <td className="td-cell text-xs font-medium">{r.ten}{r.xepLoai && <span className="block text-2xs text-ink-muted">Xếp loại: {r.xepLoai}</span>}</td>
              <td className="td-cell text-xs text-ink-secondary">{r.chuyenNganh || '—'}</td>
              <td className="td-cell font-mono text-xs">{r.ngayCap ? formatNgay(r.ngayCap) : '—'}</td>
              <td className="td-cell"><RowActions onEdit={() => { setForm({ loai: r.loai, ten: r.ten, chuyenNganh: r.chuyenNganh, coSoDaoTao: r.coSoDaoTao, xepLoai: r.xepLoai, namTotNghiep: r.namTotNghiep ? String(r.namTotNghiep) : '', ngayCap: r.ngayCap, ngayHetHan: r.ngayHetHan }); setEditingId(r.id); }} onDelete={() => remove(r.id)} /></td>
            </tr>
          ))}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && <EmptyRow span={5} text="Chưa có bằng cấp" />}
        </tbody>
      </table>
    </Section>
  );
}

// ═══ HĐLĐ & Lương ═══

const EMPTY_HDLD: HopDongLaoDongInput = { soHopDong: '', loaiHopDong: 'xac-dinh-thoi-han', ngayKy: '', tuNgay: '', denNgay: '', luongCoBan: '', luongBhxh: '', trangThai: 'hieu-luc', ghiChu: '' };
const EMPTY_LUONG: LuongNgachBacInput = { ngayHieuLuc: '', ngach: '', maNgach: '', bac: '', heSoLuong: '', phuCapChucVu: '0', phuCapTnvk: '0', loaiThayDoi: 'xep-lan-dau', soQuyetDinh: '', lyDo: '' };

function HopDongLuongTab({ nhanSuId, onChanged }: { nhanSuId: string; onChanged?: () => void }) {
  const { data: hdRows, refetch: refetchHd } = useAsyncData(() => fetchHopDongLaoDong(nhanSuId), []);
  const { data: luongRows, refetch: refetchLuong } = useAsyncData(() => fetchLuongNgachBac(nhanSuId), []);

  const [hdEditingId, setHdEditingId] = useState<string | null>(null);
  const [hdForm, setHdForm] = useState<HopDongLaoDongInput>(EMPTY_HDLD);
  const [hdSaving, setHdSaving] = useState(false);
  const [hdErr, setHdErr] = useState<string | null>(null);

  const hdSave = async () => {
    setHdSaving(true); setHdErr(null);
    try {
      if (hdEditingId === 'new') await createHopDongLaoDong(nhanSuId, hdForm);
      else if (hdEditingId) await updateHopDongLaoDong(hdEditingId, hdForm);
      setHdEditingId(null); refetchHd(); onChanged?.();
    } catch (e) { setHdErr(e instanceof Error ? e.message : String(e)); } finally { setHdSaving(false); }
  };
  const hdRemove = async (id: string) => {
    if (!window.confirm('Xóa hợp đồng lao động này?')) return;
    try { await deleteHopDongLaoDong(id); refetchHd(); } catch (e) { setHdErr(e instanceof Error ? e.message : String(e)); }
  };

  const [luongForm, setLuongForm] = useState<LuongNgachBacInput>(EMPTY_LUONG);
  const [luongAdding, setLuongAdding] = useState(false);
  const [luongSaving, setLuongSaving] = useState(false);
  const [luongErr, setLuongErr] = useState<string | null>(null);

  const luongSave = async () => {
    setLuongSaving(true); setLuongErr(null);
    try { await createLuongNgachBac(nhanSuId, luongForm); setLuongAdding(false); setLuongForm(EMPTY_LUONG); refetchLuong(); } catch (e) { setLuongErr(e instanceof Error ? e.message : String(e)); } finally { setLuongSaving(false); }
  };
  const luongRemove = async (id: string) => {
    if (!window.confirm('Xóa mốc lương này?')) return;
    try { await deleteLuongNgachBac(id); refetchLuong(); } catch (e) { setLuongErr(e instanceof Error ? e.message : String(e)); }
  };

  const hdEditor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5"><input className={smallInput} placeholder="Số HĐ" value={hdForm.soHopDong} onChange={(e) => setHdForm({ ...hdForm, soHopDong: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <select className={smallInput} value={hdForm.loaiHopDong} onChange={(e) => setHdForm({ ...hdForm, loaiHopDong: e.target.value })}>
          {LOAI_HOP_DONG_LAO_DONG.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5"><input type="date" className={smallInput} value={hdForm.tuNgay} onChange={(e) => setHdForm({ ...hdForm, tuNgay: e.target.value })} /></td>
      <td className="px-3 py-1.5"><input type="date" className={smallInput} value={hdForm.denNgay} onChange={(e) => setHdForm({ ...hdForm, denNgay: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <div className="flex justify-end gap-1">
          <button onClick={hdSave} disabled={hdSaving} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">{hdSaving ? <LoaderCircle size={13} className="animate-spin" /> : '✓'}</button>
          <button onClick={() => setHdEditingId(null)} className="rounded p-1 text-ink-muted hover:bg-muted">✕</button>
        </div>
      </td>
    </tr>
  );

  return (
    <div className="space-y-3">
      <Section title="Hợp đồng lao động / làm việc" addLabel="Thêm HĐLĐ" onAdd={() => { setHdForm(EMPTY_HDLD); setHdEditingId('new'); }}>
        {hdErr && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{hdErr}</p>}
        <table className="w-full min-w-[560px]">
          <thead><tr><th className="th-cell">Số HĐ</th><th className="th-cell">Loại</th><th className="th-cell">Từ ngày</th><th className="th-cell">Đến ngày</th><th className="th-cell text-right">Thao tác</th></tr></thead>
          <tbody>
            {hdRows.map((r) => hdEditingId === r.id ? hdEditor(r.id) : (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell text-xs font-medium">{r.soHopDong || '—'}</td>
                <td className="td-cell text-xs">{LOAI_HOP_DONG_LAO_DONG.find((o) => o.ma === r.loaiHopDong)?.ten ?? r.loaiHopDong}</td>
                <td className="td-cell font-mono text-xs">{r.tuNgay ? formatNgay(r.tuNgay) : '—'}</td>
                <td className="td-cell font-mono text-xs">{r.denNgay ? formatNgay(r.denNgay) : 'Không xác định'}</td>
                <td className="td-cell"><RowActions onEdit={() => { setHdForm({ soHopDong: r.soHopDong, loaiHopDong: r.loaiHopDong, ngayKy: r.ngayKy, tuNgay: r.tuNgay, denNgay: r.denNgay, luongCoBan: r.luongCoBan ? String(r.luongCoBan) : '', luongBhxh: r.luongBhxh ? String(r.luongBhxh) : '', trangThai: r.trangThai, ghiChu: r.ghiChu }); setHdEditingId(r.id); }} onDelete={() => hdRemove(r.id)} /></td>
              </tr>
            ))}
            {hdEditingId === 'new' && hdEditor('new')}
            {hdRows.length === 0 && hdEditingId !== 'new' && <EmptyRow span={5} text="Chưa có hợp đồng lao động" />}
          </tbody>
        </table>
      </Section>

      <Section title="Lịch sử ngạch / bậc / hệ số lương" addLabel="Ghi nhận mốc lương" onAdd={() => { setLuongForm(EMPTY_LUONG); setLuongAdding(true); }}>
        {luongErr && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{luongErr}</p>}
        <table className="w-full min-w-[560px]">
          <thead><tr><th className="th-cell">Hiệu lực</th><th className="th-cell">Ngạch/Bậc</th><th className="th-cell text-right">Hệ số</th><th className="th-cell">Loại thay đổi</th><th className="th-cell text-right">Thao tác</th></tr></thead>
          <tbody>
            {luongAdding && (
              <tr className="bg-subtle">
                <td className="px-3 py-1.5"><input type="date" className={smallInput} value={luongForm.ngayHieuLuc} onChange={(e) => setLuongForm({ ...luongForm, ngayHieuLuc: e.target.value })} /></td>
                <td className="px-3 py-1.5"><input className={smallInput} placeholder="Ngạch / bậc" value={luongForm.ngach} onChange={(e) => setLuongForm({ ...luongForm, ngach: e.target.value })} /></td>
                <td className="px-3 py-1.5"><input className={cn(smallInput, 'text-right')} placeholder="2.34" value={luongForm.heSoLuong} onChange={(e) => setLuongForm({ ...luongForm, heSoLuong: e.target.value })} /></td>
                <td className="px-3 py-1.5">
                  <select className={smallInput} value={luongForm.loaiThayDoi} onChange={(e) => setLuongForm({ ...luongForm, loaiThayDoi: e.target.value })}>
                    {LOAI_THAY_DOI_LUONG.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
                  </select>
                </td>
                <td className="px-3 py-1.5">
                  <div className="flex justify-end gap-1">
                    <button onClick={luongSave} disabled={luongSaving} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">{luongSaving ? <LoaderCircle size={13} className="animate-spin" /> : '✓'}</button>
                    <button onClick={() => setLuongAdding(false)} className="rounded p-1 text-ink-muted hover:bg-muted">✕</button>
                  </div>
                </td>
              </tr>
            )}
            {luongRows.map((r) => (
              <tr key={r.id} className="tr-hover">
                <td className="td-cell font-mono text-xs">{formatNgay(r.ngayHieuLuc)}</td>
                <td className="td-cell text-xs">{r.ngach || '—'}{r.bac && ` / bậc ${r.bac}`}</td>
                <td className="td-cell text-right font-mono text-xs">{r.heSoLuong.toFixed(2)}</td>
                <td className="td-cell text-xs text-ink-secondary">{LOAI_THAY_DOI_LUONG.find((o) => o.ma === r.loaiThayDoi)?.ten ?? r.loaiThayDoi}</td>
                <td className="td-cell text-right">
                  <button onClick={() => luongRemove(r.id)} className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"><Trash2 size={12} /></button>
                </td>
              </tr>
            ))}
            {luongRows.length === 0 && !luongAdding && <EmptyRow span={5} text="Chưa có lịch sử ngạch/bậc lương" />}
          </tbody>
        </table>
      </Section>
    </div>
  );
}

// ═══ Đánh giá xếp loại ═══

const EMPTY_DANH_GIA: DanhGiaCbvcInput = { nam: String(new Date().getFullYear()), ky: 'nam', tuXepLoai: '', xepLoai: '', diem: '', nhanXet: '', trangThai: 'nhap' };

function DanhGiaTab({ nhanSuId, onChanged }: { nhanSuId: string; onChanged?: () => void }) {
  const { data: rows, refetch } = useAsyncData(() => fetchDanhGiaCbvc(nhanSuId), []);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<DanhGiaCbvcInput>(EMPTY_DANH_GIA);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const done = () => { setEditingId(null); refetch(); onChanged?.(); };
  const save = async () => {
    setSaving(true); setErr(null);
    try {
      if (editingId === 'new') await createDanhGiaCbvc(nhanSuId, form);
      else if (editingId) await updateDanhGiaCbvc(editingId, form);
      done();
    } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setSaving(false); }
  };
  const remove = async (id: string) => {
    if (!window.confirm('Xóa đánh giá này?')) return;
    try { await deleteDanhGiaCbvc(id); done(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
  };

  const editor = (key: string) => (
    <tr key={key} className="bg-subtle">
      <td className="px-3 py-1.5"><input className={cn(smallInput, 'w-16')} placeholder="Năm" value={form.nam} onChange={(e) => setForm({ ...form, nam: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <select className={smallInput} value={form.xepLoai} onChange={(e) => setForm({ ...form, xepLoai: e.target.value })}>
          <option value="">-- Xếp loại --</option>
          {XEP_LOAI_DANH_GIA.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
        </select>
      </td>
      <td className="px-3 py-1.5"><input className={smallInput} placeholder="Nhận xét" value={form.nhanXet} onChange={(e) => setForm({ ...form, nhanXet: e.target.value })} /></td>
      <td className="px-3 py-1.5">
        <div className="flex justify-end gap-1">
          <button onClick={save} disabled={saving} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">{saving ? <LoaderCircle size={13} className="animate-spin" /> : '✓'}</button>
          <button onClick={() => setEditingId(null)} className="rounded p-1 text-ink-muted hover:bg-muted">✕</button>
        </div>
      </td>
    </tr>
  );

  return (
    <Section title="Đánh giá, xếp loại chất lượng CBVC" addLabel="Thêm đánh giá năm" onAdd={() => { setForm({ ...EMPTY_DANH_GIA, nam: String(new Date().getFullYear()) }); setEditingId('new'); }}>
      {err && <p className="px-3 py-1.5 text-2xs font-semibold text-danger">{err}</p>}
      <table className="w-full min-w-[480px]">
        <thead><tr><th className="th-cell">Năm</th><th className="th-cell">Xếp loại</th><th className="th-cell">Nhận xét</th><th className="th-cell text-right">Thao tác</th></tr></thead>
        <tbody>
          {rows.map((r) => editingId === r.id ? editor(r.id) : (
            <tr key={r.id} className="tr-hover">
              <td className="td-cell font-mono text-xs">{r.nam}</td>
              <td className="td-cell text-xs font-medium">{XEP_LOAI_DANH_GIA.find((o) => o.ma === r.xepLoai)?.ten ?? r.xepLoai ?? '—'}</td>
              <td className="td-cell text-xs text-ink-secondary max-w-[160px] truncate" title={r.nhanXet}>{r.nhanXet || '—'}</td>
              <td className="td-cell"><RowActions onEdit={() => { setForm({ nam: String(r.nam), ky: r.ky, tuXepLoai: r.tuXepLoai, xepLoai: r.xepLoai, diem: r.diem != null ? String(r.diem) : '', nhanXet: r.nhanXet, trangThai: r.trangThai }); setEditingId(r.id); }} onDelete={() => remove(r.id)} /></td>
            </tr>
          ))}
          {editingId === 'new' && editor('new')}
          {rows.length === 0 && editingId !== 'new' && <EmptyRow span={4} text="Chưa có dữ liệu đánh giá" />}
        </tbody>
      </table>
    </Section>
  );
}

// ═══ Panel tổng (tabs) ═══

type Tab = 'chung-chi' | 'qua-trinh' | 'bang-cap' | 'hd-luong' | 'danh-gia';

const TABS: SlideOverTabDef<Tab>[] = [
  { id: 'chung-chi', label: 'Chứng chỉ hành nghề', icon: Award },
  { id: 'qua-trinh', label: 'Quá trình công tác', icon: Briefcase },
  { id: 'bang-cap', label: 'Bằng cấp', icon: GraduationCap },
  { id: 'hd-luong', label: 'HĐLĐ & Lương', icon: Wallet },
  { id: 'danh-gia', label: 'Đánh giá', icon: ClipboardCheck },
];

export function NhanSuHoSoPanel({ nhanSuId, onChanged }: { nhanSuId: string; onChanged?: () => void }) {
  const [tab, setTab] = useState<Tab>('chung-chi');

  if (!nhanSuId) {
    return (
      <div className="card flex h-40 items-center justify-center p-4 text-center text-xs text-ink-muted">
        Chọn một CBVC trong danh sách để xem hồ sơ chi tiết.
      </div>
    );
  }

  return (
    <div className="card overflow-hidden">
      <SlideOverTabs tabs={TABS} active={tab} onChange={setTab} />
      <div className="p-3">
        {tab === 'chung-chi' && <ChungChiPanel nhanSuId={nhanSuId} onChanged={onChanged} />}
        {tab === 'qua-trinh' && <QuaTrinhCongTacTab nhanSuId={nhanSuId} onChanged={onChanged} />}
        {tab === 'bang-cap' && <BangCapTab nhanSuId={nhanSuId} onChanged={onChanged} />}
        {tab === 'hd-luong' && <HopDongLuongTab nhanSuId={nhanSuId} onChanged={onChanged} />}
        {tab === 'danh-gia' && <DanhGiaTab nhanSuId={nhanSuId} onChanged={onChanged} />}
      </div>
    </div>
  );
}
