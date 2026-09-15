import React from 'react';
import { DASHBOARD_DEBT_COLORS } from '../types';
import type { NoDongDonViItem } from '../../../services/dashboardService';

export interface TopDebtsTableProps {
  data: NoDongDonViItem[];
  onOpenDrilldown: () => void;
}

export function TopDebtsTable({ data, onOpenDrilldown }: TopDebtsTableProps) {
  return (
    <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
      <div>
        <div className="flex items-center justify-between mb-4 border-b border-border dark:border-slate-700/80 pb-3">
          <div>
            <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
              Cảnh báo Nợ đọng: TOP Đơn vị nguy cơ cao
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">Xếp hạng theo tổng giá trị công nợ lũy kế</p>
          </div>
          <button
            type="button"
            onClick={onOpenDrilldown}
            className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
          >
            Xem tất cả &gt;
          </button>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-border dark:border-slate-700/80 bg-subtle/50 dark:bg-slate-900/60 font-bold text-ink">
                <th className="py-2.5 px-3">Đơn vị</th>
                <th className="py-2.5 px-3 text-right">Tổng Nợ (Tỷ)</th>
                <th className="py-2.5 px-3 text-right">Nợ Nghĩa vụ</th>
                <th className="py-2.5 px-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-slate-700/80 font-mono tabular-nums">
              {data.slice(0, 6).map((row, idx) => (
                <tr key={idx} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold font-sans" style={{ color: DASHBOARD_DEBT_COLORS[idx % DASHBOARD_DEBT_COLORS.length] }}>
                    {row.name}
                  </td>
                  <td className="py-2.5 px-3 text-right text-rose-600 dark:text-rose-400 font-bold">
                    {row.tongNo.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-medium text-amber-600 dark:text-amber-400">
                    {row.noNV.toFixed(2)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-sans">
                    <button
                      type="button"
                      onClick={onOpenDrilldown}
                      className="px-2.5 py-1 rounded-lg text-xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 transition-colors cursor-pointer"
                    >
                      Đôn đốc
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
