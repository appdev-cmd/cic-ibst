import React, { useState } from 'react';
import {
  Handshake,
  TrendingUp,
  Wallet,
  AlertCircle,
  Layers,
  Percent,
  BarChart3,
  Table,
  ArrowUpRight,
} from 'lucide-react';
import {
  ComposedChart,
  BarChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
  ReferenceLine,
} from 'recharts';
import { ChartDefs } from '../../../components/ChartDefs';
import { DashboardKpiCard } from '../components/DashboardKpiCard';
import { UnitContractSummaryTable } from '../components/UnitContractSummaryTable';
import { DASHBOARD_COLORS, tooltipStyle } from '../types';
import type { DashboardComponentProps } from '../types';

export function BusinessTab({ data, onOpenDrilldown }: DashboardComponentProps) {
  const [debtViewMode, setDebtViewMode] = useState<'cot-dung' | 'ma-tran'>('cot-dung');
  const [showAllDebts, setShowAllDebts] = useState(false);

  const {
    overview,
    doanhThuData = [],
    noDongData = [],
    unitHealthData = [],
    growthComparisonData = [],
  } = data;

  const totalDebtKH = noDongData.reduce((acc, d) => acc + (d.tongNo || 0), 0);
  const totalDebtNV = noDongData.reduce((acc, d) => acc + (d.noNV || 0), 0);
  const highDebtCount = noDongData.filter((d) => (d.tongNo || 0) >= 15).length;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 Thẻ KPI Đầu Trang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <DashboardKpiCard
          title="Tổng Ký Hợp đồng"
          value={`${overview.giaTriKy} tỷ`}
          subtitle={`Đạt ${overview.tyLeDatKyMoi}% kế hoạch năm`}
          icon={Handshake}
          color="primary"
          onClick={() => onOpenDrilldown('hop-dong')}
        />
        <DashboardKpiCard
          title="Thực hiện Doanh thu"
          value={`${overview.giaTriDoanhThu} tỷ`}
          subtitle={`Đạt ${overview.tyLeDatDoanhThu}% kế hoạch năm`}
          icon={TrendingUp}
          color="success"
          onClick={() => onOpenDrilldown('hop-dong')}
        />
        <DashboardKpiCard
          title="Tổng Tiền Về"
          value={`${overview.tongTienVe} tỷ`}
          subtitle="Thực thu trong kỳ"
          icon={Wallet}
          color="info"
          onClick={() => onOpenDrilldown('hop-dong')}
        />
        <DashboardKpiCard
          title="Tổng Nợ Lũy Kế"
          value={`${overview.tongNoLuyKe} tỷ`}
          subtitle="Công nợ cần đôn đốc"
          icon={AlertCircle}
          color="danger"
          onClick={() => onOpenDrilldown('cong-no')}
        />
      </div>

      {/* Bảng Tổng Hợp Ký HĐKT 16 Đơn Vị (10 Cột, Xuất Excel, In bảng) */}
      <UnitContractSummaryTable />

      {/* Hai Biểu đồ So sánh 16 Đơn vị */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Biểu đồ Cột Nhóm & Xếp Chồng 16 Đơn vị */}
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base sm:text-[17px] font-black text-ink flex items-center gap-2 tracking-tight">
                <Layers className="w-4 h-4 text-primary-500" />
                So sánh Kế hoạch 2026 vs Cùng kỳ 2025 vs Thực hiện Ký 2026 (Tỷ VNĐ)
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">
                HĐ ký 2026 xếp chồng: Đơn vị ký (xanh ngọc) + Viện ký (xanh dương) so với KH (vàng) và Cùng kỳ (xám)
              </p>
            </div>
          </div>
          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={doanhThuData} margin={{ top: 20, right: 15, left: -5, bottom: 40 }}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickMargin={12}
                  angle={-35}
                  textAnchor="end"
                  height={70}
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-surface border border-border dark:border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs min-w-[240px]">
                        <p className="font-black text-ink mb-1">{d.name}</p>
                        <p className="text-2xs text-ink-muted mb-2">{d.fullName}</p>
                        <div className="space-y-1 font-mono">
                          <div className="flex justify-between text-amber-600 dark:text-amber-400 font-bold">
                            <span>KH 2026:</span>
                            <span>{d.keHoach ? `${d.keHoach.toFixed(1)} tỷ` : '—'}</span>
                          </div>
                          <div className="flex justify-between text-ink-muted">
                            <span>Cùng kỳ 2025:</span>
                            <span>{d.cungKy2025 ? `${d.cungKy2025.toFixed(2)} tỷ` : '—'}</span>
                          </div>
                          <div className="flex justify-between text-sky-600 dark:text-sky-400 font-semibold">
                            <span>Viện ký:</span>
                            <span>{d.vienKy ? `${d.vienKy.toFixed(2)} tỷ` : '0 tỷ'}</span>
                          </div>
                          <div className="flex justify-between text-teal-600 dark:text-teal-400 font-semibold">
                            <span>Đơn vị ký:</span>
                            <span>{d.donViKy ? `${d.donViKy.toFixed(2)} tỷ` : '0 tỷ'}</span>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }} />
                <Bar dataKey="keHoach" name="KH năm 2026" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={14} />
                <Bar dataKey="cungKy2025" name="Cùng kỳ năm 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={14} />
                <Bar dataKey="donViKy" stackId="ky2026" name="Đơn vị ký (2026)" fill="#14b8a6" maxBarSize={14} />
                <Bar dataKey="vienKy" stackId="ky2026" name="Viện ký (2026)" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={14} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Biểu đồ % Tốc độ Tăng trưởng so với cùng kỳ 2025 */}
        <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base font-black text-ink flex items-center gap-2 tracking-tight">
                <Percent className="w-4 h-4 text-emerald-500" />
                Tăng trưởng so với Cùng kỳ
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Tỷ lệ % ký kết so với cùng kỳ năm 2025</p>
            </div>
            <div className="h-[380px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  layout="vertical"
                  data={[...doanhThuData].sort((a, b) => (b.pctCungKy || 0) - (a.pctCungKy || 0))}
                  margin={{ top: 10, right: 25, left: 10, bottom: 5 }}
                >
                  <ChartDefs />
                  <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="var(--border-subtle)" />
                  <XAxis type="number" stroke="var(--text-muted)" fontSize={11} tickFormatter={(v) => `${v}%`} />
                  <YAxis
                    dataKey="name"
                    type="category"
                    width={75}
                    tick={{ fontSize: 10.5, fill: 'var(--text-secondary)', fontWeight: 700 }}
                    stroke="none"
                  />
                  <Tooltip
                    formatter={(val: any) => [`${val}%`, 'Tăng trưởng so cùng kỳ']}
                    contentStyle={tooltipStyle.contentStyle}
                  />
                  <ReferenceLine
                    x={100}
                    stroke="#ef4444"
                    strokeDasharray="3 3"
                    label={{ value: '100%', fill: '#ef4444', fontSize: 10, position: 'top' }}
                  />
                  <Bar dataKey="pctCungKy" name="% So cùng kỳ 2025" radius={[0, 6, 6, 0]} barSize={14}>
                    {[...doanhThuData]
                      .sort((a, b) => (b.pctCungKy || 0) - (a.pctCungKy || 0))
                      .map((entry, index) => {
                        const val = entry.pctCungKy || 0;
                        const fill =
                          val >= 200
                            ? '#10b981'
                            : val >= 100
                            ? '#0284c7'
                            : val >= 60
                            ? '#f59e0b'
                            : '#ef4444';
                        return <Cell key={`cell-pct-${index}`} fill={fill} />;
                      })}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-2 pt-3 border-t border-border dark:border-slate-700/80 text-2xs text-ink-muted flex items-center justify-between">
            <span>Ngưỡng 100%: Ngang bằng</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">&gt;100%: Tăng trưởng</span>
          </div>
        </div>
      </div>

      {/* Phân tích Công Nợ Đọng 16 Đơn Vị (Biểu đồ / Ma trận rủi ro) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <div>
                <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight flex items-center gap-2">
                  <Wallet className="w-4 h-4 text-rose-500" />
                  Phân tích Chi tiết Công nợ đọng 16 Đơn vị
                </h3>
                <p className="text-xs text-ink-muted mt-0.5">
                  Đối chiếu Tổng nợ khách hàng & Nghĩa vụ nộp Viện theo QC 2815 (Tỷ VNĐ)
                </p>
              </div>

              <div className="flex items-center flex-wrap gap-2">
                <div className="inline-flex p-0.5 rounded-xl bg-subtle dark:bg-slate-900/60 border border-border dark:border-slate-700/80 text-xs">
                  <button
                    type="button"
                    onClick={() => setDebtViewMode('cot-dung')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      debtViewMode === 'cot-dung'
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <BarChart3 className="w-3.5 h-3.5" />
                    <span>Cột đứng</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDebtViewMode('ma-tran')}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                      debtViewMode === 'ma-tran'
                        ? 'bg-primary-600 text-white shadow-xs'
                        : 'text-ink-muted hover:text-ink'
                    }`}
                  >
                    <Table className="w-3.5 h-3.5" />
                    <span>Ma trận rủi ro</span>
                  </button>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAllDebts(!showAllDebts)}
                  className="px-2.5 py-1 rounded-xl border border-border dark:border-slate-700/80 text-xs font-bold text-ink hover:bg-subtle dark:hover:bg-slate-800/40 transition-colors cursor-pointer"
                >
                  {showAllDebts ? 'Top 8 nợ cao' : 'Toàn bộ 16'}
                </button>
                <button
                  type="button"
                  onClick={() => onOpenDrilldown('cong-no')}
                  className="px-3 py-1 rounded-xl bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 text-xs font-bold hover:bg-rose-100 transition-colors cursor-pointer flex items-center gap-1"
                >
                  <span>Drill-down HĐ nợ</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Chip Tóm tắt */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mb-4 py-2 px-3.5 rounded-xl bg-subtle/50 dark:bg-slate-900/50 border border-border dark:border-slate-700/80 text-xs">
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span className="text-ink-muted text-2xs font-sans">Tổng nợ KH:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{totalDebtKH.toFixed(2)} tỷ</span>
              </div>
              <div className="h-3 w-px bg-border dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5 font-mono">
                <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
                <span className="text-ink-muted text-2xs font-sans">Nợ Nghĩa vụ Viện:</span>
                <span className="font-bold text-amber-600 dark:text-amber-400">{totalDebtNV.toFixed(2)} tỷ</span>
              </div>
              <div className="h-3 w-px bg-border dark:bg-slate-700 hidden sm:block" />
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 inline-block" />
                <span className="text-ink-muted text-2xs">Đơn vị nợ &ge;15 tỷ:</span>
                <span className="font-bold text-rose-600 dark:text-rose-400">{highDebtCount} Đơn vị</span>
              </div>
            </div>

            {debtViewMode === 'cot-dung' ? (
              <div className="h-[380px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={showAllDebts ? noDongData : noDongData.slice(0, 8)}
                    margin={{ top: 20, right: 15, left: -5, bottom: 40 }}
                  >
                    <ChartDefs />
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                    <XAxis
                      dataKey="name"
                      stroke="var(--text-muted)"
                      fontSize={10}
                      tickMargin={10}
                      angle={-35}
                      textAnchor="end"
                      height={55}
                    />
                    <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                    <Tooltip contentStyle={tooltipStyle.contentStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }} />
                    <Bar dataKey="tongNo" name="Khách hàng nợ Đơn vị" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={28} />
                    <Bar dataKey="noNV" name="Nợ Nghĩa vụ Viện" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={28} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
                <table className="w-full text-left border-collapse text-[12.5px]">
                  <thead>
                    <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 font-bold text-ink">
                      <th className="py-2.5 px-3 text-center w-10">#</th>
                      <th className="py-2.5 px-3">Đơn vị</th>
                      <th className="py-2.5 px-3 text-right">Tổng nợ KH (Tỷ)</th>
                      <th className="py-2.5 px-3 text-right">Nợ Viện (Tỷ)</th>
                      <th className="py-2.5 px-3 text-center">Tỷ trọng</th>
                      <th className="py-2.5 px-3 text-right">Đôn đốc</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60 dark:divide-slate-700/80 font-mono tabular-nums">
                    {(showAllDebts ? noDongData : noDongData.slice(0, 8)).map((row, idx) => (
                      <tr key={row.name} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                        <td className="py-2.5 px-3 text-center font-bold text-ink-muted">{idx + 1}</td>
                        <td className="py-2.5 px-3 font-sans font-bold text-ink">{row.name}</td>
                        <td className="py-2.5 px-3 text-right font-black text-rose-600 dark:text-rose-400">
                          {row.tongNo.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-right font-semibold text-amber-600 dark:text-amber-400">
                          {row.noNV.toFixed(2)}
                        </td>
                        <td className="py-2.5 px-3 text-center font-bold text-ink font-sans">
                          {row.tyLeNoNV ?? (row.tongNo > 0 ? Math.round((row.noNV / row.tongNo) * 100) : 0)}%
                        </td>
                        <td className="py-2.5 px-3 text-right font-sans">
                          <button
                            type="button"
                            onClick={() => onOpenDrilldown('cong-no')}
                            className="px-2.5 py-1 rounded-lg text-2xs font-bold bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 hover:bg-rose-100 transition-colors cursor-pointer"
                          >
                            Đôn đốc
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Xếp hạng sức khỏe vận hành 16 đơn vị */}
        <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
                Xếp hạng Sức khỏe Vận hành 16 Đơn vị
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Tiến độ hoàn thành kế hoạch doanh thu năm</p>
            </div>
            <div className="overflow-x-auto max-h-[440px] overflow-y-auto pr-1">
              <table className="w-full text-left border-collapse text-[12.5px]">
                <thead>
                  <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 font-bold text-ink">
                    <th className="py-2 px-3">Đơn vị</th>
                    <th className="py-2 px-3 text-center">% KH</th>
                    <th className="py-2 px-3 text-right">Đánh giá</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60 dark:divide-slate-700/80 font-mono tabular-nums">
                  {unitHealthData.map((row, idx) => (
                    <tr key={idx} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold font-sans text-ink">{row.name}</td>
                      <td className="py-2.5 px-3 text-center font-black text-ink">{row.khProgress}%</td>
                      <td className="py-2.5 px-3 text-right font-sans">
                        <span className={`font-black text-xs ${row.color}`}>{row.status}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
