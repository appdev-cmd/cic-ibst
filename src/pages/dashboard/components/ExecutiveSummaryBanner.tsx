import React from 'react';
import { FileSpreadsheet, ArrowUpRight } from 'lucide-react';

interface ExecutiveSummaryBannerProps {
  onNavigateToBusiness: () => void;
}

export function ExecutiveSummaryBanner({ onNavigateToBusiness }: ExecutiveSummaryBannerProps) {
  return (
    <div className="bg-gradient-to-r from-primary-500/10 via-primary-500/5 to-transparent border border-primary-500/25 dark:border-primary-500/35 rounded-2xl p-4.5 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs">
      <div className="flex items-center gap-3.5">
        <div className="w-11 h-11 rounded-xl bg-primary-600 text-white flex items-center justify-center shrink-0 shadow-sm">
          <FileSpreadsheet className="w-5 h-5" />
        </div>
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="text-sm sm:text-[15px] font-black text-ink tracking-tight">
              Lũy kế Ký HĐKT toàn Viện đạt 941,736 tỷ VNĐ (tính tới 21.8.2026)
            </h4>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Đạt 126% KH cả năm
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-sky-100 text-sky-800 dark:bg-sky-950/50 dark:text-sky-300 border border-sky-300 dark:border-sky-800">
              138% Cùng kỳ 2025
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Viện ký: <strong className="text-ink font-bold font-mono">261,225 tỷ (27.7%)</strong> • Đơn vị ký: <strong className="text-ink font-bold font-mono">680,510 tỷ (72.3%)</strong> • KH giao: 750,0 tỷ • Cùng kỳ 2025: 684,245 tỷ
          </p>
        </div>
      </div>
      <button
        type="button"
        onClick={onNavigateToBusiness}
        className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold shadow-xs hover:shadow transition-all shrink-0 cursor-pointer self-start md:self-auto"
      >
        <span>Xem Bảng 16 Đơn vị & Biểu đồ</span>
        <ArrowUpRight className="w-4 h-4" />
      </button>
    </div>
  );
}
