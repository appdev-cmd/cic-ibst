import React from 'react';
import { ShieldAlert, AlertTriangle, Clock, Award, ArrowRight, CheckCircle2 } from 'lucide-react';
import type { CanhBaoDashboardSummary } from '../services/dashboardService';

interface ExecutiveWarningBannerProps {
  summary: CanhBaoDashboardSummary;
  onOpenAlerts: (tabKey?: string) => void;
}

export function ExecutiveWarningBanner({ summary, onOpenAlerts }: ExecutiveWarningBannerProps) {
  const hasCritical = summary.cao > 0 || summary.hopDongTreHan > 0;
  const hasWarnings = summary.tong > 0 || summary.deTaiTreHan > 0 || summary.chungChiSapHetHan > 0;

  if (!hasWarnings && !hasCritical) {
    return (
      <div className="flex items-center justify-between p-3.5 bg-emerald-500/10 border border-emerald-500/20 dark:border-emerald-500/30 rounded-xl">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-success text-white">
            <CheckCircle2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-[13.5px] font-bold text-ink">Hệ thống Điều hành Tuân thủ Tốt</h4>
            <p className="text-[12px] text-ink-muted">Không ghi nhận vi phạm nghiêm trọng Quy chế 2815 hoặc hợp đồng trễ hạn trong kỳ.</p>
          </div>
        </div>
        <button
          onClick={() => onOpenAlerts('canh-bao')}
          className="px-3 py-1.5 rounded-lg border border-border bg-surface text-ink text-[12px] font-bold hover:bg-subtle transition-colors cursor-pointer"
        >
          Xem chi tiết rà soát
        </button>
      </div>
    );
  }

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        hasCritical
          ? 'bg-gradient-to-r from-red-500/10 via-amber-500/5 to-surface border-red-500/30 dark:border-red-500/40'
          : 'bg-gradient-to-r from-amber-500/10 via-surface to-surface border-amber-500/30 dark:border-amber-500/40'
      }`}
    >
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Left: Title & Quick Stats */}
        <div className="flex items-start sm:items-center gap-3.5">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              hasCritical ? 'bg-danger text-white shadow-sm' : 'bg-warning text-white shadow-sm'
            }`}
          >
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-[14.5px] font-black text-ink tracking-tight">
                Cảnh báo Điều hành & Tuân thủ Quy chế 2815
              </h4>
              {hasCritical && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-black bg-danger/15 text-danger border border-danger/30 animate-pulse">
                  Ưu tiên xử lý
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-ink-secondary mt-0.5">
              Phát hiện các điểm nghẽn tiến độ, công nợ chậm trả và rủi ro quy chế cần Lãnh đạo chỉ đạo đôn đốc:
            </p>
          </div>
        </div>

        {/* Right: Badges & Action */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5">
          {summary.cao > 0 && (
            <button
              onClick={() => onOpenAlerts('canh-bao')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-red-500/15 border border-red-500/30 text-danger text-[12px] font-bold hover:bg-red-500/25 transition-colors cursor-pointer"
              title="Vi phạm nghiêm trọng QC 2815"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>{summary.cao} QC 2815 cao</span>
            </button>
          )}

          {summary.hopDongTreHan > 0 && (
            <button
              onClick={() => onOpenAlerts('hop-dong')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-[12px] font-bold hover:bg-amber-500/25 transition-colors cursor-pointer"
              title="Hợp đồng quá hạn hoàn thành"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{summary.hopDongTreHan} HĐ quá hạn</span>
            </button>
          )}

          {summary.deTaiTreHan > 0 && (
            <button
              onClick={() => onOpenAlerts('khcn')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-700 dark:text-blue-400 text-[12px] font-bold hover:bg-blue-500/25 transition-colors cursor-pointer"
              title="Đề tài KHCN quá hạn nghiệm thu"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>{summary.deTaiTreHan} Đề tài trễ</span>
            </button>
          )}

          {summary.chungChiSapHetHan > 0 && (
            <button
              onClick={() => onOpenAlerts('nhan-su')}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-400 text-[12px] font-bold hover:bg-purple-500/25 transition-colors cursor-pointer"
              title="Chứng chỉ hành nghề LAS-XD sắp hết hạn trong 90 ngày"
            >
              <Award className="w-3.5 h-3.5" />
              <span>{summary.chungChiSapHetHan} CCHN sắp hết hạn</span>
            </button>
          )}

          <button
            onClick={() => onOpenAlerts('canh-bao')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-primary-600 text-white text-[12.5px] font-bold hover:bg-primary-700 shadow-sm transition-all cursor-pointer whitespace-nowrap ml-auto sm:ml-0"
          >
            <span>Rà soát & Xử lý</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
