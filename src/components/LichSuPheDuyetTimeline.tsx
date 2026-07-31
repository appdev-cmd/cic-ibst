import { History, UserCheck, Clock, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';
import { getAuditLogs, type AuditLogItem } from '../services/auditLog';
import { cn } from '../lib/utils';

export function LichSuPheDuyetTimeline({
  loaiDoiTuong,
  doiTuongId,
  title = '📋 Nhật ký Phê duyệt & Lịch sử Chuyển trạng thái',
}: {
  loaiDoiTuong: 'dang_ky_dau_moi' | 'dau_thau' | 'hop_dong' | 'phieu_giao_viec' | 'uy_quyen';
  doiTuongId: string;
  title?: string;
}) {
  const logs = getAuditLogs(loaiDoiTuong, doiTuongId);

  return (
    <div className="rounded-xl border border-border bg-surface p-4 space-y-3.5 shadow-xs">
      <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
        <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <History size={15} className="text-primary" /> {title}
        </h4>
        <span className="text-2xs font-bold text-ink-muted bg-subtle px-2 py-0.5 rounded-full border border-border">
          {logs.length} lượt ghi nhận
        </span>
      </div>

      {logs.length === 0 ? (
        <p className="text-2xs text-ink-muted italic text-center py-4">
          Chưa có nhật ký ghi nhận chuyển trạng thái
        </p>
      ) : (
        <div className="relative pl-4 space-y-4 before:absolute before:left-1.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
          {logs.map((log, idx) => (
            <div key={log.id || idx} className="relative flex items-start gap-3 text-xs">
              {/* Dot Icon */}
              <div className="absolute -left-4 top-0.5 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-emerald-500 ring-4 ring-surface text-white">
                <CheckCircle2 size={10} />
              </div>

              <div className="flex-1 space-y-1 rounded-lg border border-border-subtle bg-subtle/50 p-2.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="font-bold text-ink flex items-center gap-1">
                    <UserCheck size={12} className="text-primary" /> {log.tenNguoiThucHien}
                  </span>
                  <span className="text-2xs text-ink-muted flex items-center gap-1">
                    <Clock size={11} /> {log.thoiGian}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-2xs font-semibold">
                  <span className="text-ink-muted">Chuyển trạng thái:</span>
                  {log.tuTrangThai && (
                    <>
                      <span className="rounded bg-muted px-1.5 py-0.5 text-ink">{log.tuTrangThai}</span>
                      <span className="text-ink-muted">→</span>
                    </>
                  )}
                  <span className="rounded bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300 px-1.5 py-0.5 font-bold">
                    {log.denTrangThai}
                  </span>
                </div>

                {log.ghiChu && (
                  <p className="text-2xs text-ink-secondary mt-1 flex items-start gap-1 bg-surface p-1.5 rounded border border-border-subtle">
                    <MessageSquare size={11} className="text-amber-500 shrink-0 mt-0.5" />
                    <span>{log.ghiChu}</span>
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
