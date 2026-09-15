import React from 'react';
import {
  Banknote,
  FileText,
  Microscope,
  Newspaper,
  AlertTriangle,
  Landmark,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartDefs } from '../../../components/ChartDefs';
import { DashboardKpiCard } from '../components/DashboardKpiCard';
import { DASHBOARD_COLORS } from '../types';
import type { DashboardComponentProps } from '../types';

export function ScienceTab({ data, onOpenDrilldown }: DashboardComponentProps) {
  const {
    overview,
    khcnData = [],
    coreStandards = [],
  } = data;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 Thẻ KPI Đầu Trang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <DashboardKpiCard
          title="Kinh phí NSNN Cấp"
          value={`${overview.kinhPhiKHCN2026} tỷ`}
          subtitle="Thực hiện trong kỳ 2026"
          icon={Banknote}
          color="gold"
          onClick={() => onOpenDrilldown('khcn')}
        />
        <DashboardKpiCard
          title="Tiêu chuẩn / Quy chuẩn"
          value="56"
          subtitle="54 TC, 02 Quy chuẩn đang soạn thảo"
          icon={FileText}
          color="primary"
          onClick={() => onOpenDrilldown('khcn')}
        />
        <DashboardKpiCard
          title="Đề tài NCKH Cấp Bộ"
          value="14"
          subtitle="02 Đề tài vốn Doanh nghiệp"
          icon={Microscope}
          color="accent"
          onClick={() => onOpenDrilldown('khcn')}
        />
        <DashboardKpiCard
          title="Bài báo Khoa học"
          value="08"
          subtitle="Tạp chí Quốc tế & Trong nước"
          icon={Newspaper}
          color="success"
        />
      </div>

      {/* Row 1: Biểu đồ Kinh phí KHCN & Nhiệm vụ QLNN */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
                Biểu đồ Phân bổ Kinh phí KHCN cấp 2026 (Tỷ VNĐ)
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Phân bổ theo đơn vị chủ trì nhiệm vụ</p>
            </div>
            <span className="text-2xs font-semibold px-2 py-1 rounded-lg bg-subtle dark:bg-slate-800/80 text-ink-secondary border border-border/60">
              Nhấp cột xem chi tiết
            </span>
          </div>

          <div className="h-[380px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={khcnData} margin={{ top: 20, right: 15, bottom: 35, left: -5 }}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis
                  dataKey="name"
                  stroke="var(--text-muted)"
                  fontSize={10}
                  tickMargin={12}
                  angle={-35}
                  textAnchor="end"
                  height={65}
                />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0]?.payload;
                    return (
                      <div className="bg-surface border border-border dark:border-slate-700/80 p-3.5 rounded-xl shadow-xl text-xs min-w-[210px]">
                        <p className="font-black text-ink mb-1.5 border-b border-border dark:border-slate-700/80 pb-1">{d.name}</p>
                        <div className="space-y-1 font-mono">
                          <p className="flex justify-between text-ink-secondary">
                            <span>Kinh phí cấp:</span>
                            <span className="font-bold text-primary-600 dark:text-primary-400">{d.kinhPhi.toFixed(3)} tỷ</span>
                          </p>
                          <p className="flex justify-between text-ink-secondary">
                            <span>Số nhiệm vụ:</span>
                            <span className="font-bold text-emerald-600 dark:text-emerald-400">{d.deTai} nhiệm vụ</span>
                          </p>
                          <p className="flex justify-between text-ink-secondary">
                            <span>Giải ngân:</span>
                            <span className="font-bold text-amber-600 dark:text-amber-400">{d.disbursed.toFixed(3)} tỷ</span>
                          </p>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '10px' }} />
                <Bar
                  dataKey="kinhPhi"
                  name="Kinh phí cấp 2026"
                  radius={[6, 6, 0, 0]}
                  maxBarSize={30}
                  onClick={() => onOpenDrilldown('khcn')}
                  className="cursor-pointer"
                >
                  {khcnData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={DASHBOARD_COLORS[index % DASHBOARD_COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Khối Thực hiện nhiệm vụ QLNN */}
        <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">Thực hiện nhiệm vụ QLNN</h3>
              <p className="text-xs text-ink-muted mt-0.5">Trách nhiệm phục vụ cơ quan quản lý Bộ Xây dựng</p>
            </div>
            <ul className="space-y-4">
              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-subtle/50 dark:bg-slate-900/50 border border-border/60 dark:border-slate-700/60">
                <div className="p-2 bg-rose-50 dark:bg-rose-950/40 rounded-xl text-rose-600 dark:text-rose-400 border border-rose-200/50 dark:border-rose-800/40 shrink-0 mt-0.5">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-xs">Sự cố & Giám định Tư pháp</h4>
                  <p className="text-2xs text-ink-secondary mt-1 leading-relaxed">
                    Xử lý sạt lở kè kênh Tàu Hủ (TP.HCM), sự cố ống nước Quảng Trạch 1, và 06 vụ trưng cầu của TAND.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-subtle/50 dark:bg-slate-900/50 border border-border/60 dark:border-slate-700/60">
                <div className="p-2 bg-primary-50 dark:bg-primary-950/40 rounded-xl text-primary-600 dark:text-primary-400 border border-primary-200/50 dark:border-primary-800/40 shrink-0 mt-0.5">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-xs">Giám sát Công trình Quốc gia</h4>
                  <p className="text-2xs text-ink-secondary mt-1 leading-relaxed">
                    Nghiệm thu Sân bay Long Thành, quyết toán Nhà Quốc hội Lào, và báo cáo an toàn TT Hội nghị Quốc gia.
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3.5 p-3 rounded-xl bg-subtle/50 dark:bg-slate-900/50 border border-border/60 dark:border-slate-700/60">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/40 rounded-xl text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800/40 shrink-0 mt-0.5">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-ink text-xs">Biên soạn & Rà soát Kỹ thuật</h4>
                  <p className="text-2xs text-ink-secondary mt-1 leading-relaxed">
                    Soạn thảo giải pháp PCCC cơ sở cũ, xử lý 119 lượt nhiệm vụ và 48 lượt báo cáo rà soát theo yêu cầu Bộ.
                  </p>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Row 2: Bảng 5 & Quy chuẩn cốt lõi */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
                Kinh phí & Giải ngân các Nhiệm vụ KHCN thực hiện năm 2026 (Bảng 5)
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Chi tiết số lượng nhiệm vụ, giá trị hợp đồng và giải ngân chủ trì</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenDrilldown('khcn')}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              Xem chi tiết &gt;
            </button>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80 max-h-[350px] overflow-y-auto">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 font-bold text-ink">
                  <th className="py-2.5 px-3">Đơn vị chủ trì</th>
                  <th className="py-2.5 px-3 text-center">Số NV</th>
                  <th className="py-2.5 px-3 text-right">Giá trị HĐ (Tỷ)</th>
                  <th className="py-2.5 px-3 text-right">KP cấp 2026</th>
                  <th className="py-2.5 px-3 text-right">Giải ngân (Tỷ)</th>
                  <th className="py-2.5 px-3 text-center">Tỷ lệ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-700/80 font-mono tabular-nums">
                {khcnData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-2.5 px-3 font-bold font-sans text-ink">{row.name}</td>
                    <td className="py-2.5 px-3 text-center font-bold text-ink">{row.deTai}</td>
                    <td className="py-2.5 px-3 text-right text-ink-secondary">{row.contractVal.toFixed(3)}</td>
                    <td className="py-2.5 px-3 text-right text-primary-600 dark:text-primary-400 font-bold">
                      {row.kinhPhi.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-right text-emerald-600 dark:text-emerald-400 font-bold">
                      {row.disbursed.toFixed(3)}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-2xs font-bold ${
                          row.pct > 50
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                            : row.pct > 0
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                            : 'bg-subtle text-ink-muted'
                        }`}
                      >
                        {row.pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Quy chuẩn & Tiêu chuẩn Cốt lõi */}
        <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
                Quy chuẩn & Tiêu chuẩn Cốt lõi
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Tiến độ biên soạn các văn bản kỹ thuật quan trọng</p>
            </div>
            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-1">
              {coreStandards.map((std, idx) => (
                <div key={idx} className="bg-subtle/60 dark:bg-slate-900/50 p-3 rounded-xl border border-border dark:border-slate-700/80">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-mono font-black text-primary-600 dark:text-primary-400">{std.code}</span>
                    <span className="text-2xs font-bold px-1.5 py-0.5 rounded bg-surface border border-border/60 text-ink-muted font-mono">
                      {std.progress}%
                    </span>
                  </div>
                  <h4 className="text-xs font-bold text-ink mt-1.5 line-clamp-1">{std.name}</h4>
                  <div className="flex justify-between items-center mt-2 text-2xs text-ink-secondary">
                    <span>Chủ trì: <strong>{std.leader}</strong></span>
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold">{std.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
