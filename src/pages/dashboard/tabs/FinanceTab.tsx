import React from 'react';
import {
  Receipt,
  Wallet,
  Building2,
  Target,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardKpiCard } from '../components/DashboardKpiCard';
import { DASHBOARD_COLORS, tooltipStyle } from '../types';
import type { DashboardComponentProps } from '../types';

export function FinanceTab({ data, onOpenDrilldown }: DashboardComponentProps) {
  const {
    overview,
    taiChinhData = [],
    coCauThue = [],
    investmentProjects = [],
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 Thẻ KPI Đầu Trang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <DashboardKpiCard
          title="Nộp Ngân sách NN"
          value={`${overview.nopNganSach} tỷ`}
          subtitle="Thuế GTGT, TNDN & TNCN"
          icon={Receipt}
          color="success"
        />
        <DashboardKpiCard
          title="Quỹ Lương CBVC-NLĐ"
          value={`${overview.quyLuong} tỷ`}
          subtitle={`Chi trả cho ${overview.tongNhanSu} cán bộ`}
          icon={Wallet}
          color="primary"
          onClick={() => onOpenDrilldown('nhan-su')}
        />
        <DashboardKpiCard
          title="Bảo lãnh Ngân hàng"
          value={`${overview.baoLanhNH} tỷ`}
          subtitle="Các gói thầu đang thực hiện"
          icon={Building2}
          color="warning"
        />
        <DashboardKpiCard
          title="Đầu tư Quỹ PTSN"
          value="8.89 tỷ"
          subtitle="Mua sắm thiết bị quan trắc & TN"
          icon={Target}
          color="info"
        />
      </div>

      {/* Row 1: Biến động Chi Lương, Thuế & Cơ cấu Thuế */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
              Biến động Chi Lương & Nộp Thuế theo kỳ (Tỷ VNĐ)
            </h3>
            <p className="text-xs text-ink-muted mt-0.5">Theo dõi dòng tiền chi lương bảo hiểm và nghĩa vụ thuế</p>
          </div>
          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={taiChinhData} margin={{ top: 20, right: 25, left: -5, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                <Tooltip {...tooltipStyle} formatter={(val: any) => [`${val != null ? val : '--'} tỷ`, '']} />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '15px' }} />
                <Line
                  type="monotone"
                  dataKey="luong"
                  name="Chi Lương & BH"
                  stroke="#0284c7"
                  strokeWidth={3}
                  connectNulls={false}
                  activeDot={{ r: 6 }}
                />
                <Line
                  type="monotone"
                  dataKey="thue"
                  name="Nộp Thuế NSNN"
                  stroke="#f43f5e"
                  strokeWidth={2.5}
                  connectNulls={false}
                />
                <Line
                  type="monotone"
                  dataKey="nsnn"
                  name="NSNN Cấp kinh phí"
                  stroke="#10b981"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  connectNulls={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Cơ cấu Nộp Thuế */}
        <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">Cơ cấu Nộp Thuế (Tỷ VNĐ)</h3>
              <p className="text-xs text-ink-muted mt-0.5">Tỷ trọng các sắc thuế nộp ngân sách</p>
            </div>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coCauThue}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={95}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {coCauThue.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(value: any) => [`${value} tỷ`, 'Giá trị']} />
                  <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '500' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      {/* Row 2: Giám sát Dự án Đầu tư CSVC */}
      <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
        <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
          <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
            Giám sát các Dự án Đầu tư Phát triển Cơ sở vật chất & Mua sắm (Mục IX.5)
          </h3>
          <p className="text-xs text-ink-muted mt-0.5">Các dự án nâng cấp phòng thí nghiệm và trang thiết bị nghiên cứu</p>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
          <table className="w-full text-left border-collapse text-[12.5px]">
            <thead>
              <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 font-bold text-ink">
                <th className="py-2.5 px-3">Tên dự án đầu tư / Mua sắm</th>
                <th className="py-2.5 px-3">Quy mô vốn</th>
                <th className="py-2.5 px-3">Nguồn vốn / Giai đoạn</th>
                <th className="py-2.5 px-3">Trạng thái thực tế</th>
                <th className="py-2.5 px-3 text-right">Tiến độ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 dark:divide-slate-700/80">
              {investmentProjects.map((proj, idx) => (
                <tr key={idx} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-2.5 px-3 font-bold text-ink">{proj.name}</td>
                  <td className="py-2.5 px-3 text-ink-secondary font-mono">{proj.scale}</td>
                  <td className="py-2.5 px-3 text-ink-secondary">{proj.period}</td>
                  <td className="py-2.5 px-3">
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-bold ${
                        proj.status === 'Hoàn thành bàn giao'
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : 'bg-primary-100 text-primary-800 dark:bg-primary-950/60 dark:text-primary-300'
                      }`}
                    >
                      {proj.status}
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-right font-black font-mono text-ink-secondary">{proj.progress}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
