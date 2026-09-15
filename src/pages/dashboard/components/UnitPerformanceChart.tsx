import React from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartDefs } from '../../../components/ChartDefs';
import { DASHBOARD_COLORS, tooltipStyle } from '../types';
import type { DoanhThuDonViItem } from '../../../services/dashboardService';

export interface UnitPerformanceChartProps {
  data: DoanhThuDonViItem[];
  onOpenDrilldown: () => void;
}

export function UnitPerformanceChart({ data, onOpenDrilldown }: UnitPerformanceChartProps) {
  return (
    <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
      <div className="flex justify-between items-center mb-6 border-b border-border dark:border-slate-700/80 pb-3">
        <div>
          <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
            Biểu đồ Kế hoạch & Doanh thu các Đơn vị (Tỷ VNĐ)
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">So sánh thực hiện thực tế so với mục tiêu cả năm</p>
        </div>
        <span className="text-2xs font-semibold px-2 py-1 rounded-lg bg-subtle dark:bg-slate-800/80 text-ink-secondary border border-border/60">
          Nhấp cột xem chi tiết
        </span>
      </div>

      <div className="h-[430px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 25, right: 15, bottom: 35, left: -5 }}>
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
              cursor={{ fill: 'var(--bg-subtle)' }}
              {...tooltipStyle}
              formatter={(value: any, name: any, props: any) => {
                if (name === 'Doanh thu thực hiện') {
                  const pct = props.payload?.kh;
                  return [`${value} tỷ (${pct}% KH)`, name];
                }
                return [`${value} tỷ VNĐ`, name];
              }}
            />
            <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '15px' }} />
            <Bar
              dataKey="doanhThu"
              name="Doanh thu thực hiện"
              radius={[6, 6, 0, 0]}
              maxBarSize={32}
              onClick={onOpenDrilldown}
              className="cursor-pointer"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
              ))}
            </Bar>
            <Line
              type="linear"
              dataKey="keHoach"
              name="Kế hoạch Doanh thu"
              stroke="#0284c7"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#ffffff', stroke: '#0284c7', strokeWidth: 2 }}
              activeDot={{ r: 6.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 2.5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
