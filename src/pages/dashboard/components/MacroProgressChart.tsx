import React, { useState } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartDefs } from '../../../components/ChartDefs';
import type { TaiChinhThangItem } from '../../../services/dashboardService';

export interface MacroProgressChartProps {
  taiChinhData: TaiChinhThangItem[];
  trendChartMode: 'ky-ket' | 'doanh-thu' | 'dong-tien' | 'so-sanh';
  setTrendChartMode: (m: 'ky-ket' | 'doanh-thu' | 'dong-tien' | 'so-sanh') => void;
}

export function MacroProgressChart({
  taiChinhData,
  trendChartMode,
  setTrendChartMode,
}: MacroProgressChartProps) {
  const keHoachNam = 750; // Kế hoạch năm toàn Viện 750 tỷ

  let sumKyMoi = 0;
  let sumDoanhThu = 0;
  let sumDongTien = 0;

  const chartData = taiChinhData.map((item, idx) => {
    const monthNum = idx + 1;
    const mucTieuTuyenTinh = Math.round(((keHoachNam * monthNum) / 12) * 100) / 100;
    const hasActual = item.hasData !== false && monthNum <= 9 && (item.kyMoi !== null || item.doanhThu !== null);

    if (hasActual) {
      sumKyMoi += item.kyMoi || 0;
      sumDoanhThu += item.doanhThu || 0;
      sumDongTien += item.dongTien || 0;
    }

    return {
      month: `Th.${monthNum}`,
      monthLabel: `Tháng ${monthNum}/2026`,
      kyMoiThang: hasActual ? item.kyMoi : null,
      doanhThuThang: hasActual ? item.doanhThu : null,
      dongTienThang: hasActual ? item.dongTien : null,
      kyMoiLuyKe: hasActual ? Math.round(sumKyMoi * 100) / 100 : null,
      doanhThuLuyKe: hasActual ? Math.round(sumDoanhThu * 100) / 100 : null,
      dongTienLuyKe: hasActual ? Math.round(sumDongTien * 100) / 100 : null,
      mucTieu: mucTieuTuyenTinh,
      keHoachNam,
      hasActual,
    };
  });

  return (
    <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border dark:border-slate-700/80 pb-3">
        <div>
          <span className="text-[11px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
            TIẾN ĐỘ TÍCH LŨY VĨ MÔ
          </span>
          <h3 className="text-base sm:text-[17px] font-black text-ink uppercase tracking-tight mt-0.5">
            {trendChartMode === 'ky-ket' && 'GIÁ TRỊ KÝ KẾT LŨY KẾ VS MỤC TIÊU'}
            {trendChartMode === 'doanh-thu' && 'DOANH THU THỰC HIỆN LŨY KẾ VS MỤC TIÊU'}
            {trendChartMode === 'dong-tien' && 'DÒNG TIỀN VỀ LŨY KẾ VS MỤC TIÊU'}
            {trendChartMode === 'so-sanh' && 'SO SÁNH TIẾN ĐỘ KÝ KẾT & DOANH THU LŨY KẾ'}
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">
            Tiến độ tích lũy so với kế hoạch năm (750 tỷ VNĐ)
          </p>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center gap-1 bg-subtle dark:bg-slate-900/60 p-1 rounded-xl border border-border dark:border-slate-700/80 shrink-0 self-start sm:self-center">
          <button
            type="button"
            onClick={() => setTrendChartMode('ky-ket')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              trendChartMode === 'ky-ket'
                ? 'bg-amber-500 text-white shadow-xs'
                : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
            }`}
          >
            Ký kết
          </button>
          <button
            type="button"
            onClick={() => setTrendChartMode('doanh-thu')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              trendChartMode === 'doanh-thu'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
            }`}
          >
            Doanh thu
          </button>
          <button
            type="button"
            onClick={() => setTrendChartMode('dong-tien')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              trendChartMode === 'dong-tien'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
            }`}
          >
            Dòng tiền
          </button>
          <button
            type="button"
            onClick={() => setTrendChartMode('so-sanh')}
            className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
              trendChartMode === 'so-sanh'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
            }`}
          >
            So sánh
          </button>
        </div>
      </div>

      {/* Chart */}
      <div className="h-[360px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={chartData} margin={{ top: 15, right: 15, bottom: 20, left: -5 }}>
            <ChartDefs />
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
            <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
            <YAxis
              stroke="var(--text-muted)"
              fontSize={11}
              unit=" tỷ"
              domain={[0, (dataMax: number) => Math.ceil(Math.max(dataMax * 1.1, 800))]}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0]?.payload;
                if (!d) return null;
                return (
                  <div className="bg-surface border border-border dark:border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs min-w-[220px]">
                    <p className="font-black text-ink mb-1.5 border-b border-border dark:border-slate-700/80 pb-1">
                      {d.monthLabel}
                    </p>
                    {d.hasActual ? (
                      <div className="space-y-1 font-mono">
                        {trendChartMode === 'ky-ket' && (
                          <>
                            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                              <span>Lũy kế ký kết:</span>
                              <span>{d.kyMoiLuyKe?.toFixed(2)} tỷ</span>
                            </div>
                            <div className="flex justify-between text-ink-muted">
                              <span>Ký trong tháng:</span>
                              <span>{d.kyMoiThang?.toFixed(2)} tỷ</span>
                            </div>
                          </>
                        )}
                        {trendChartMode === 'doanh-thu' && (
                          <>
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                              <span>Lũy kế doanh thu:</span>
                              <span>{d.doanhThuLuyKe?.toFixed(2)} tỷ</span>
                            </div>
                            <div className="flex justify-between text-ink-muted">
                              <span>Doanh thu tháng:</span>
                              <span>{d.doanhThuThang?.toFixed(2)} tỷ</span>
                            </div>
                          </>
                        )}
                        {trendChartMode === 'dong-tien' && (
                          <>
                            <div className="flex justify-between text-sky-600 dark:text-sky-400 font-bold">
                              <span>Lũy kế dòng tiền:</span>
                              <span>{d.dongTienLuyKe?.toFixed(2)} tỷ</span>
                            </div>
                            <div className="flex justify-between text-ink-muted">
                              <span>Thu trong tháng:</span>
                              <span>{d.dongTienThang?.toFixed(2)} tỷ</span>
                            </div>
                          </>
                        )}
                        {trendChartMode === 'so-sanh' && (
                          <>
                            <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                              <span>Lũy kế ký kết:</span>
                              <span>{d.kyMoiLuyKe?.toFixed(2)} tỷ</span>
                            </div>
                            <div className="flex justify-between text-emerald-600 dark:text-emerald-400 font-bold">
                              <span>Lũy kế doanh thu:</span>
                              <span>{d.doanhThuLuyKe?.toFixed(2)} tỷ</span>
                            </div>
                          </>
                        )}
                        <div className="pt-1.5 border-t border-border dark:border-slate-700/80 flex justify-between text-ink-secondary">
                          <span>Mục tiêu phân kỳ:</span>
                          <span>{d.mucTieu?.toFixed(2)} tỷ</span>
                        </div>
                      </div>
                    ) : (
                      <p className="text-ink-muted italic">Chưa phát sinh dữ liệu thực tế</p>
                    )}
                  </div>
                );
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: '11.5px', fontWeight: '600', paddingTop: '10px' }}
              formatter={(value) => <span className="text-xs font-bold text-ink-secondary px-1.5">{value}</span>}
            />

            {trendChartMode === 'ky-ket' && (
              <>
                <Area
                  type="monotone"
                  dataKey="kyMoiLuyKe"
                  name="Lũy kế Ký kết"
                  stroke="#f59e0b"
                  strokeWidth={3}
                  fillOpacity={0.25}
                  fill="#f59e0b"
                  connectNulls={false}
                  dot={{ r: 3.5, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="mucTieu"
                  name="Mục tiêu phân kỳ"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  connectNulls={true}
                  dot={false}
                />
              </>
            )}

            {trendChartMode === 'doanh-thu' && (
              <>
                <Area
                  type="monotone"
                  dataKey="doanhThuLuyKe"
                  name="Lũy kế Doanh thu"
                  stroke="#10b981"
                  strokeWidth={3}
                  fillOpacity={0.25}
                  fill="#10b981"
                  connectNulls={false}
                  dot={{ r: 3.5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="mucTieu"
                  name="Mục tiêu phân kỳ"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  connectNulls={true}
                  dot={false}
                />
              </>
            )}

            {trendChartMode === 'dong-tien' && (
              <>
                <Area
                  type="monotone"
                  dataKey="dongTienLuyKe"
                  name="Lũy kế Dòng tiền"
                  stroke="#0284c7"
                  strokeWidth={3}
                  fillOpacity={0.25}
                  fill="#0284c7"
                  connectNulls={false}
                  dot={{ r: 3.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2 }}
                />
                <Line
                  type="monotone"
                  dataKey="mucTieu"
                  name="Mục tiêu phân kỳ"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  connectNulls={true}
                  dot={false}
                />
              </>
            )}

            {trendChartMode === 'so-sanh' && (
              <>
                <Area
                  type="monotone"
                  dataKey="kyMoiLuyKe"
                  name="Lũy kế Ký kết"
                  stroke="#f59e0b"
                  strokeWidth={2.5}
                  fillOpacity={0.15}
                  fill="#f59e0b"
                  connectNulls={false}
                  dot={{ r: 3, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="doanhThuLuyKe"
                  name="Lũy kế Doanh thu"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  connectNulls={false}
                  dot={{ r: 3, fill: '#10b981', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
                <Line
                  type="monotone"
                  dataKey="mucTieu"
                  name="Mục tiêu phân kỳ"
                  stroke="#94a3b8"
                  strokeWidth={1.8}
                  strokeDasharray="4 4"
                  connectNulls={true}
                  dot={false}
                />
              </>
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
