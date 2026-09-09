import { useState } from 'react';
import { Plus, Users2, Building2, Clock, CheckCircle2, XCircle, Trash2, LoaderCircle, Eye, FileText, Award } from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DataState } from './DataState';
import { DangKyDauMoiChiTietPanel } from './DangKyDauMoiChiTietPanel';
import { DangKyDauMoiFormPanel } from './DangKyDauMoiFormPanel';
import { useSlidePanel } from '../context/SlidePanelContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import {
  fetchDangKyDauMoi,
  khktTiepNhan,
  phanHoiDangKy,
  deleteDangKyDauMoi,
  NHAN_TRANG_THAI_DANG_KY,
  MAU_TRANG_THAI_DANG_KY,
  type DangKyDauMoi,
} from '../services/dangKyDauMoi';
import type { Option } from '../services/queries';
import { formatNgay, cn } from '../lib/utils';

/**
 * Đăng ký đầu mối thị trường — Quy trình 1, Điều 5.1c QC 2815 (B1–B4):
 * VCNLĐ có thông tin → GĐ Đơn vị đăng ký đầu mối với KHKT → KHKT tiếp nhận,
 * báo cáo LĐV → LĐV cho ý kiến → KHKT phản hồi giao/không giao đầu mối.
 * Tránh nhiều đơn vị trong Viện cùng cạnh tranh 1 gói thầu (Đ.5.1c).
 */
export function DangKyDauMoiPanel({
  donViOptions,
  nhanSuOptions,
  khachHangOptions = [],
}: {
  donViOptions: Option[];
  nhanSuOptions: Option[];
  khachHangOptions?: Option[];
}) {
  const { vaiTro } = useAuth();
  const { openPanel } = useSlidePanel();
  const { data: list, loading, error, refetch } = useAsyncData(fetchDangKyDauMoi, []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const coTheKhkt = vaiTro === 'quan-tri' || vaiTro === 'lanh-dao' || vaiTro === 'phong-khkt';
  const coTheLdv = vaiTro === 'quan-tri' || vaiTro === 'lanh-dao';

  const soChoKhkt = list.filter((d) => d.trangThai === 'dang-ky').length;
  const soChoLdv = list.filter((d) => d.trangThai === 'cho-ldv-chi-dao').length;
  const soDaGiao = list.filter((d) => d.trangThai === 'giao-dau-moi').length;

  const handleOpenCreate = () => {
    openPanel({
      id: 'tao-dang-ky-dau-moi',
      title: 'Đăng ký đầu mối thị trường / dự thầu',
      subtitle: 'Quy trình 1 — Điều 5.1c QC 2815',
      icon: <Plus size={16} />,
      content: (
        <DangKyDauMoiFormPanel
          donViOptions={donViOptions}
          nhanSuOptions={nhanSuOptions}
          khachHangOptions={khachHangOptions}
          onDone={refetch}
        />
      ),
      storageKey: 'panel-tao-dang-ky-dau-moi',
    });
  };

  const handleOpenChiTiet = (item: DangKyDauMoi) => {
    openPanel({
      id: `dang-ky-dau-moi-${item.id}`,
      title: item.tenCoHoi,
      subtitle: `Đăng ký đầu mối (QC 2815 Đ.5.1c) · ${NHAN_TRANG_THAI_DANG_KY[item.trangThai]}`,
      icon: <FileText size={16} />,
      content: <DangKyDauMoiChiTietPanel item={item} onRefetch={refetch} />,
      storageKey: 'panel-dang-ky-dau-moi',
    });
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

      <div className="rounded-xl border border-border bg-surface shadow-sm divide-y divide-border-subtle overflow-hidden">
        {list.map((item, idx) => (
          <div
            key={item.id}
            className="flex flex-wrap items-center justify-between gap-3 p-3.5 hover:bg-muted/40 transition-colors group cursor-pointer"
            onClick={() => handleOpenChiTiet(item)}
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="shrink-0 w-6 h-6 rounded-full bg-subtle text-ink-muted text-[10px] font-bold flex items-center justify-center tabular-nums">{idx + 1}</span>
                <p className="font-bold text-ink text-sm truncate group-hover:text-primary transition-colors flex items-center gap-1.5">
                  <Eye size={14} className="text-ink-muted group-hover:text-primary shrink-0" />
                  {item.tenCoHoi}
                </p>
                <span className={cn('inline-flex shrink-0 rounded-full px-2 py-0.5 text-2xs font-bold', MAU_TRANG_THAI_DANG_KY[item.trangThai])}>
                  {NHAN_TRANG_THAI_DANG_KY[item.trangThai]}
                </span>
              </div>
              <p className="text-2xs text-ink-muted mt-1 flex items-center gap-2 flex-wrap">
                <span className="flex items-center gap-1"><Building2 size={11} /> {item.donViDangKy || '—'}</span>
                {item.nguoiPhatHien && <span className="flex items-center gap-1 text-primary-600 dark:text-primary-400 font-medium"><Award size={11} /> VCNLĐ: {item.nguoiPhatHien}</span>}
                <span>· Đăng ký {item.ngayDangKy ? formatNgay(item.ngayDangKy) : '—'}</span>
                {item.ngayPhanHoi && <span>· Phản hồi {formatNgay(item.ngayPhanHoi)}</span>}
              </p>
              {item.trangThai === 'khong-tham-gia' && item.lyDoKhongThamGia && (
                <p className="text-2xs text-danger mt-1">Lý do: {item.lyDoKhongThamGia}</p>
              )}
            </div>
            <div className="flex shrink-0 items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => handleOpenChiTiet(item)}
                className="rounded-md p-1.5 text-ink-muted hover:bg-muted hover:text-primary"
                title="Xem chi tiết"
              >
                <Eye size={14} />
              </button>
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
    </div>
  );
}
