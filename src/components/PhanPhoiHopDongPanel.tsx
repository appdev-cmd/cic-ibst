import { useState } from 'react';
import { Send, Mail, FileText, Plus, Trash2, LoaderCircle, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { DataState } from './DataState';
import {
  fetchPhanPhoiHopDong,
  taoChecklistPhanPhoi,
  toggleDaGuiPhanPhoi,
  createPhanPhoiHopDong,
  deletePhanPhoiHopDong,
} from '../services/chitiet';
import { ngayHanNopHoSo, soNgayConLai } from '../lib/qc2815';
import type { HopDong } from '../types';
import { formatNgay, cn } from '../lib/utils';

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

/**
 * Checklist phân phối & lưu trữ HĐ đã ký — Điều 6.3 QC 2815.
 * Danh sách nơi nhận sinh tự động theo loại HĐ (Viện ký giấy/điện tử, đơn vị ký);
 * tick từng nơi khi đã chuyển; đếm ngược hạn 30 ngày kể từ ngày ký.
 */
export function PhanPhoiHopDongPanel({ hd }: { hd: HopDong }) {
  const { data: list, loading, error, refetch } = useAsyncData(() => fetchPhanPhoiHopDong(hd.id), []);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [taoBusy, setTaoBusy] = useState(false);
  const [adding, setAdding] = useState(false);
  const [noiNhanMoi, setNoiNhanMoi] = useState('');
  const [actionError, setActionError] = useState<string | null>(null);

  const han = ngayHanNopHoSo(hd.ngayKy);
  const conLai = han ? soNgayConLai(han) : null;
  const soDaGui = list.filter((p) => p.daGui).length;

  const chay = async (fn: () => Promise<void>) => {
    setActionError(null);
    try {
      await fn();
      refetch();
    } catch (e) {
      setActionError(e instanceof Error ? e.message : String(e));
    }
  };

  const taoChecklist = async (dienTu: boolean) => {
    setTaoBusy(true);
    await chay(() => taoChecklistPhanPhoi(hd.id, hd.capKy, dienTu));
    setTaoBusy(false);
  };

  return (
    <div className="space-y-3">
      {/* Hạn 30 ngày Đ.6.3 */}
      {han && (
        <div
          className={cn(
            'flex flex-wrap items-center justify-between gap-2 rounded-lg border p-2.5 text-xs',
            conLai != null && conLai < 0
              ? 'border-danger/30 bg-danger-subtle text-danger'
              : conLai != null && conLai <= 7
                ? 'border-amber-500/30 bg-amber-50/60 dark:bg-amber-900/10 text-amber-800 dark:text-amber-300'
                : 'border-border bg-subtle/50 text-ink-secondary',
          )}
        >
          <span className="font-bold flex items-center gap-1.5">
            {conLai != null && conLai < 0 ? <AlertTriangle size={14} /> : <Send size={14} />}
            Hạn chuyển lưu HĐ (Đ.6.3): {formatNgay(han.toISOString().slice(0, 10))}
          </span>
          <span className="font-semibold">
            {conLai != null && (conLai >= 0 ? `còn ${conLai} ngày` : `QUÁ HẠN ${-conLai} ngày`)}
            {' · '}đã gửi {soDaGui}/{list.length || '—'} nơi
          </span>
        </div>
      )}

      <DataState loading={loading} error={error} empty={false} />
      {actionError && (
        <p className="rounded-lg bg-danger-subtle p-2 text-2xs font-semibold text-danger">{actionError}</p>
      )}

      {/* Chưa có checklist → nút sinh theo mẫu Đ.6.3 đúng loại HĐ */}
      {!loading && list.length === 0 && (
        <div className="rounded-lg border border-dashed border-border p-4 text-center space-y-2">
          <p className="text-xs text-ink-muted">
            Chưa có danh sách phân phối. Sinh checklist nơi nhận theo mẫu Điều 6.3 cho{' '}
            <strong>{hd.capKy === 'don-vi-ky' ? 'HĐ đơn vị ký' : 'HĐ Viện ký'}</strong>:
          </p>
          <div className="flex flex-wrap items-center justify-center gap-2">
            {hd.capKy === 'don-vi-ky' ? (
              <button onClick={() => taoChecklist(false)} disabled={taoBusy} className="btn-primary py-1.5 text-2xs gap-1.5">
                {taoBusy ? <LoaderCircle size={13} className="animate-spin" /> : <FileText size={13} />}
                Tạo checklist ĐV ký (P.TH lưu + thống kê KHKT)
              </button>
            ) : (
              <>
                <button onClick={() => taoChecklist(false)} disabled={taoBusy} className="btn-primary py-1.5 text-2xs gap-1.5">
                  {taoBusy ? <LoaderCircle size={13} className="animate-spin" /> : <FileText size={13} />}
                  HĐ bản giấy (5 nơi nhận)
                </button>
                <button onClick={() => taoChecklist(true)} disabled={taoBusy} className="btn-secondary py-1.5 text-2xs gap-1.5">
                  <Mail size={13} /> HĐ ký số điện tử (8 nơi nhận email)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* Checklist */}
      {list.length > 0 && (
        <div className="rounded-lg border border-border divide-y divide-border-subtle">
          {list.map((p) => (
            <label key={p.id} className="flex items-center gap-2.5 px-3 py-2 text-xs cursor-pointer hover:bg-muted/40">
              <input
                type="checkbox"
                checked={p.daGui}
                disabled={busyId === p.id}
                onChange={async (e) => {
                  setBusyId(p.id);
                  await chay(() => toggleDaGuiPhanPhoi(p.id, e.target.checked));
                  setBusyId(null);
                }}
              />
              <span className={cn('flex-1', p.daGui ? 'text-ink-muted line-through' : 'text-ink font-medium')}>
                {p.noiNhan}
                {p.ghiChu && <span className="ml-1 text-2xs text-ink-muted no-underline">({p.ghiChu})</span>}
              </span>
              <span
                className={cn(
                  'shrink-0 rounded px-1.5 py-0.5 text-2xs font-bold',
                  p.hinhThuc === 'dien-tu'
                    ? 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300'
                    : 'bg-subtle text-ink-muted',
                )}
              >
                {p.hinhThuc === 'dien-tu' ? 'Điện tử' : 'Bản giấy'}
              </span>
              {p.daGui && p.ngayGui && (
                <span className="shrink-0 text-2xs font-semibold text-emerald-600 flex items-center gap-1">
                  <CheckCircle2 size={11} /> {formatNgay(p.ngayGui)}
                </span>
              )}
              <button
                onClick={(e) => {
                  e.preventDefault();
                  void chay(() => deletePhanPhoiHopDong(p.id));
                }}
                className="shrink-0 rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger"
                title="Xóa dòng"
              >
                <Trash2 size={12} />
              </button>
            </label>
          ))}
        </div>
      )}

      {/* Thêm nơi nhận tùy chỉnh */}
      {list.length > 0 && (
        adding ? (
          <form
            className="flex items-center gap-2"
            onSubmit={async (e) => {
              e.preventDefault();
              if (!noiNhanMoi.trim()) return;
              await chay(() => createPhanPhoiHopDong(hd.id, noiNhanMoi.trim(), 'giay'));
              setNoiNhanMoi('');
              setAdding(false);
            }}
          >
            <input
              autoFocus
              className={miniInput}
              placeholder="Tên nơi nhận bổ sung..."
              value={noiNhanMoi}
              onChange={(e) => setNoiNhanMoi(e.target.value)}
            />
            <button type="submit" className="btn-primary py-1 px-2.5 text-2xs">Thêm</button>
            <button type="button" onClick={() => setAdding(false)} className="btn-secondary py-1 px-2.5 text-2xs">Hủy</button>
          </form>
        ) : (
          <button onClick={() => setAdding(true)} className="flex items-center gap-1 text-2xs font-bold text-primary hover:underline">
            <Plus size={12} /> Thêm nơi nhận khác
          </button>
        )
      )}
    </div>
  );
}
