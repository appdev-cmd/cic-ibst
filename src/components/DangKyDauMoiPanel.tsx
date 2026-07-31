import { useState } from 'react';
import { Plus, Users2, Building2, Clock, CheckCircle2, XCircle, Trash2, LoaderCircle } from 'lucide-react';
import { Modal, Field, inputCls } from './Modal';
import { KpiCard } from './KpiCard';
import { DataState } from './DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import {
  fetchDangKyDauMoi,
  createDangKyDauMoi,
  khktTiepNhan,
  phanHoiDangKy,
  deleteDangKyDauMoi,
  NHAN_TRANG_THAI_DANG_KY,
  MAU_TRANG_THAI_DANG_KY,
  type DangKyDauMoi,
  type DangKyDauMoiInput,
} from '../services/dangKyDauMoi';
import type { Option } from '../services/queries';
import { formatNgay, cn } from '../lib/utils';

const EMPTY_FORM: DangKyDauMoiInput = {
  tenCoHoi: '',
  moTa: '',
  nguoiPhatHienId: '',
  donViDangKyId: '',
  nguoiDangKyId: '',
  ngayDangKy: new Date().toISOString().slice(0, 10),
};

/**
 * Đăng ký đầu mối thị trường — Quy trình 1, Điều 5.1c QC 2815 (B1–B4):
 * VCNLĐ có thông tin → GĐ Đơn vị đăng ký đầu mối với KHKT → KHKT tiếp nhận,
 * báo cáo LĐV → LĐV cho ý kiến → KHKT phản hồi giao/không giao đầu mối.
 * Tránh nhiều đơn vị trong Viện cùng cạnh tranh 1 gói thầu (Đ.5.1c).
 */
export function DangKyDauMoiPanel({ donViOptions, nhanSuOptions }: { donViOptions: Option[]; nhanSuOptions: Option[] }) {
  const { vaiTro } = useAuth();
  const { data: list, loading, error, refetch } = useAsyncData(fetchDangKyDauMoi, []);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<DangKyDauMoiInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const coTheKhkt = vaiTro === 'quan-tri' || vaiTro === 'lanh-dao' || vaiTro === 'phong-khkt';
  const coTheLdv = vaiTro === 'quan-tri' || vaiTro === 'lanh-dao';

  const soChoKhkt = list.filter((d) => d.trangThai === 'dang-ky').length;
  const soChoLdv = list.filter((d) => d.trangThai === 'cho-ldv-chi-dao').length;
  const soDaGiao = list.filter((d) => d.trangThai === 'giao-dau-moi').length;

  const handleOpenCreate = () => {
    setForm({ ...EMPTY_FORM, ngayDangKy: new Date().toISOString().slice(0, 10) });
    setActionError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      await createDangKyDauMoi(form);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  const handleTiepNhan = async (item: DangKyDauMoi) => {
    setBusyId(item.id);
    setActionError(null);
    try {
      await khktTiepNhan(item.id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleGiaoDauMoi = async (item: DangKyDauMoi) => {
    setBusyId(item.id);
    setActionError(null);
    try {
      await phanHoiDangKy(item.id, 'giao-dau-moi');
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleKhongThamGia = async (item: DangKyDauMoi) => {
    const lyDo = window.prompt('Lý do không tham gia (hiển thị cho đơn vị đăng ký):') ?? '';
    setBusyId(item.id);
    setActionError(null);
    try {
      await phanHoiDangKy(item.id, 'khong-tham-gia', lyDo);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (item: DangKyDauMoi) => {
    if (!window.confirm(`Xóa đăng ký đầu mối "${item.tenCoHoi}"?`)) return;
    setActionError(null);
    try {
      await deleteDangKyDauMoi(item.id);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-ink-muted max-w-xl">
          Đăng ký đầu mối trước khi phát hành HSDT (Đ.5.1c) — tránh nhiều đơn vị trong Viện cùng cạnh tranh 1 gói thầu.
        </p>
        <button onClick={handleOpenCreate} className="btn-primary flex items-center gap-1.5 text-xs">
          <Plus size={14} /> Đăng ký đầu mối mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard label="Chờ KHKT tiếp nhận" value={String(soChoKhkt)} icon={Clock} tone="warning" />
        <KpiCard label="Chờ Lãnh đạo Viện" value={String(soChoLdv)} icon={Users2} tone="primary" />
        <KpiCard label="Đã giao đầu mối" value={String(soDaGiao)} icon={CheckCircle2} tone="success" />
      </div>

      <DataState loading={loading} error={error} empty={!loading && !error && list.length === 0} />
      {actionError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {actionError}
        </div>
      )}

      <div className="rounded-xl border border-border bg-surface shadow-sm divide-y divide-border-subtle">
        {list.map((item) => (
          <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 p-3">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-ink text-sm truncate">{item.tenCoHoi}</p>
                <span className={cn('inline-flex shrink-0 rounded-full px-2 py-0.5 text-2xs font-bold', MAU_TRANG_THAI_DANG_KY[item.trangThai])}>
                  {NHAN_TRANG_THAI_DANG_KY[item.trangThai]}
                </span>
              </div>
              <p className="text-2xs text-ink-muted mt-0.5 flex items-center gap-1 flex-wrap">
                <Building2 size={11} /> {item.donViDangKy || '—'}
                {item.nguoiPhatHien && <span>· VCNLĐ phát hiện: {item.nguoiPhatHien}</span>}
                <span>· Đăng ký {item.ngayDangKy ? formatNgay(item.ngayDangKy) : '—'}</span>
                {item.ngayPhanHoi && <span>· Phản hồi {formatNgay(item.ngayPhanHoi)}</span>}
              </p>
              {item.trangThai === 'khong-tham-gia' && item.lyDoKhongThamGia && (
                <p className="text-2xs text-danger mt-1">Lý do: {item.lyDoKhongThamGia}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              {item.trangThai === 'dang-ky' && coTheKhkt && (
                <button
                  onClick={() => handleTiepNhan(item)}
                  disabled={busyId === item.id}
                  className="rounded-lg border border-primary/30 bg-primary/10 px-2.5 py-1.5 text-2xs font-bold text-primary hover:bg-primary/20 disabled:opacity-60"
                >
                  {busyId === item.id ? <LoaderCircle size={12} className="animate-spin" /> : 'KHKT tiếp nhận'}
                </button>
              )}
              {item.trangThai === 'cho-ldv-chi-dao' && coTheLdv && (
                <>
                  <button
                    onClick={() => handleGiaoDauMoi(item)}
                    disabled={busyId === item.id}
                    className="rounded-lg border border-emerald-300 bg-emerald-50 px-2.5 py-1.5 text-2xs font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-60 dark:bg-emerald-900/20 dark:text-emerald-300"
                  >
                    <CheckCircle2 size={12} className="inline mr-1" /> Giao đầu mối
                  </button>
                  <button
                    onClick={() => handleKhongThamGia(item)}
                    disabled={busyId === item.id}
                    className="rounded-lg border border-red-300 bg-red-50 px-2.5 py-1.5 text-2xs font-bold text-danger hover:bg-red-100 disabled:opacity-60 dark:bg-red-900/20"
                  >
                    <XCircle size={12} className="inline mr-1" /> Không tham gia
                  </button>
                </>
              )}
              <button
                onClick={() => handleDelete(item)}
                className="rounded-md p-1.5 text-ink-muted hover:bg-red-50 hover:text-danger"
                title="Xóa"
              >
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
        {!loading && list.length === 0 && (
          <p className="p-6 text-center text-xs text-ink-muted">Chưa có đăng ký đầu mối nào.</p>
        )}
      </div>

      <Modal title="Đăng ký đầu mối thị trường / dự thầu" open={modalOpen} onClose={() => setModalOpen(false)}>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên cơ hội / dự án / gói thầu" required>
            <input
              className={inputCls}
              required
              value={form.tenCoHoi}
              onChange={(e) => setForm({ ...form, tenCoHoi: e.target.value })}
              placeholder="VD: Gói thầu tư vấn giám sát dự án XYZ"
            />
          </Field>
          <Field label="Mô tả / ghi chú">
            <textarea
              className={inputCls}
              rows={2}
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Đơn vị đăng ký đầu mối" required>
              <select
                className={inputCls}
                required
                value={form.donViDangKyId}
                onChange={(e) => setForm({ ...form, donViDangKyId: e.target.value })}
              >
                <option value="">-- Chọn đơn vị --</option>
                {donViOptions.map((d) => (
                  <option key={d.id} value={d.id}>{d.ten}</option>
                ))}
              </select>
            </Field>
            <Field label="Ngày đăng ký">
              <input
                type="date"
                className={inputCls}
                value={form.ngayDangKy}
                onChange={(e) => setForm({ ...form, ngayDangKy: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="VCNLĐ phát hiện cơ hội (Đ.5.1a)">
              <select
                className={inputCls}
                value={form.nguoiPhatHienId}
                onChange={(e) => setForm({ ...form, nguoiPhatHienId: e.target.value })}
              >
                <option value="">-- Chọn nhân sự --</option>
                {nhanSuOptions.map((n) => (
                  <option key={n.id} value={n.id}>{n.ten}</option>
                ))}
              </select>
            </Field>
            <Field label="Người đăng ký (GĐ ĐV/PGĐ/Trưởng phòng)">
              <select
                className={inputCls}
                value={form.nguoiDangKyId}
                onChange={(e) => setForm({ ...form, nguoiDangKyId: e.target.value })}
              >
                <option value="">-- Chọn nhân sự --</option>
                {nhanSuOptions.map((n) => (
                  <option key={n.id} value={n.id}>{n.ten}</option>
                ))}
              </select>
            </Field>
          </div>

          {actionError && modalOpen && <p className="text-xs font-semibold text-danger">{actionError}</p>}

          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button type="button" onClick={() => setModalOpen(false)} className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary hover:bg-muted">
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving && <LoaderCircle size={15} className="animate-spin" />}
              Đăng ký
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
