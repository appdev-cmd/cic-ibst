import React, { useState } from 'react';
import {
  FileSignature,
  DollarSign,
  BookOpen,
  Landmark,
  AlertTriangle,
  Globe2,
  Building2,
  Award,
  Shield,
  Activity,
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
} from 'recharts';
import { ChartDefs } from '../../../components/ChartDefs';
import { DashboardKpiCard } from '../components/DashboardKpiCard';
import { ExecutiveSummaryBanner } from '../components/ExecutiveSummaryBanner';
import { MacroProgressChart } from '../components/MacroProgressChart';
import { UnitPerformanceChart } from '../components/UnitPerformanceChart';
import { TopDebtsTable } from '../components/TopDebtsTable';
import { tooltipStyle } from '../types';
import type { DashboardComponentProps } from '../types';

export interface OverviewTabProps extends DashboardComponentProps {
  onNavigateToBusiness: () => void;
}

export function OverviewTab({
  data,
  onOpenDrilldown,
  onNavigateToBusiness,
}: OverviewTabProps) {
  const [trendChartMode, setTrendChartMode] = useState<'ky-ket' | 'doanh-thu' | 'dong-tien' | 'so-sanh'>('ky-ket');
  const [executiveChartMode, setExecutiveChartMode] = useState<'bien-dong' | 'cung-ky' | 'khoi-don-vi'>('bien-dong');

  const {
    overview,
    taiChinhData = [],
    monthlyYoYComparison = [],
    khoiDonViData = [],
    hoatDongQuanTri = [],
    doanhThuData = [],
    noDongData = [],
  } = data;

  const renderHoatDongIcon = (iconName?: string) => {
    switch (iconName) {
      case 'Globe2':
        return <Globe2 className="w-4 h-4" />;
      case 'Building2':
        return <Building2 className="w-4 h-4" />;
      case 'Award':
        return <Award className="w-4 h-4" />;
      case 'Shield':
        return <Shield className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const getHoatDongColorClass = (loai?: string) => {
    switch (loai) {
      case 'hop-tac':
        return { bg: 'bg-sky-50 dark:bg-sky-950/40 border-sky-200 dark:border-sky-800', text: 'text-sky-600 dark:text-sky-400' };
      case 'du-an':
        return { bg: 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800', text: 'text-primary-600 dark:text-primary-400' };
      case 'ptn':
        return { bg: 'bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800', text: 'text-amber-600 dark:text-amber-400' };
      case 'hoi-nghi':
        return { bg: 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800', text: 'text-emerald-600 dark:text-emerald-400' };
      default:
        return { bg: 'bg-primary-50 dark:bg-primary-950/40 border-primary-200 dark:border-primary-800', text: 'text-primary-600 dark:text-primary-400' };
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 5 Thẻ KPI Đầu Trang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4.5">
        <DashboardKpiCard
          title="Giá trị Ký Hợp đồng"
          value={`${overview.giaTriKy} tỷ`}
          subtitle={`Đạt ${overview.tyLeDatKyMoi}% KH năm (750 tỷ)`}
          icon={FileSignature}
          color="primary"
          trend="+38%"
          onClick={() => onOpenDrilldown('hop-dong')}
        />
        <DashboardKpiCard
          title="Thực hiện Doanh thu"
          value={`${overview.giaTriDoanhThu} tỷ`}
          subtitle={`Đạt ${overview.tyLeDatDoanhThu}% KH năm (750 tỷ)`}
          icon={DollarSign}
          color="success"
          trend="+28%"
          onClick={() => onOpenDrilldown('hop-dong')}
        />
        <DashboardKpiCard
          title="Nhiệm vụ KHCN"
          value={overview.totalNhiemVuKHCN}
          subtitle={`Kinh phí NSNN ${overview.kinhPhiKHCN2026} tỷ`}
          icon={BookOpen}
          color="gold"
          onClick={() => onOpenDrilldown('khcn')}
        />
        <DashboardKpiCard
          title="Phục vụ QLNN"
          value={`${overview.nhiemVuQLNN} Lượt`}
          subtitle={`${overview.baoCaoRaSoat} báo cáo rà soát Bộ`}
          icon={Landmark}
          color="info"
          onClick={() => onOpenDrilldown('khcn')}
        />
        <DashboardKpiCard
          title="Tổng nợ lũy kế"
          value={`${overview.tongNoLuyKe} tỷ`}
          subtitle="Cần đôn đốc thu hồi"
          icon={AlertTriangle}
          color="danger"
          trend="+12%"
          onClick={() => onOpenDrilldown('cong-no')}
        />
      </div>

      {/* Banner Tóm tắt Lũy kế Ký HĐKT */}
      <ExecutiveSummaryBanner onNavigateToBusiness={onNavigateToBusiness} />

      {/* Row 1: Tiến độ vĩ mô & Điều hành Đa chiều */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <MacroProgressChart
            taiChinhData={taiChinhData}
            trendChartMode={trendChartMode}
            setTrendChartMode={setTrendChartMode}
          />
        </div>

        {/* Khối Hoạt động Quản trị nổi bật */}
        <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between mb-3.5 border-b border-border dark:border-slate-700/80 pb-3">
              <div>
                <h3 className="text-base font-black text-ink tracking-tight">Hoạt động Quản trị nổi bật</h3>
                <p className="text-xs text-ink-muted">Sự kiện điều hành và hợp tác trọng tâm</p>
              </div>
              <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                {hoatDongQuanTri.length} sự kiện
              </span>
            </div>

            <ul className="space-y-2.5 max-h-[310px] overflow-y-auto pr-1">
              {hoatDongQuanTri.map((item) => {
                const color = getHoatDongColorClass(item.loai);
                return (
                  <li
                    key={item.id}
                    className="flex items-start gap-3 p-2.5 rounded-xl border border-transparent hover:border-border dark:hover:border-slate-700/80 hover:bg-subtle/50 dark:hover:bg-slate-800/40 transition-all"
                  >
                    <div className={`p-2 rounded-xl border shrink-0 mt-0.5 ${color.bg} ${color.text}`}>
                      {renderHoatDongIcon(item.icon)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-bold text-ink text-xs leading-snug">{item.tieuDe}</h4>
                        {item.ngayThucHien && (
                          <span className="shrink-0 text-[10px] font-mono text-ink-muted bg-subtle dark:bg-slate-800 px-1.5 py-0.5 rounded border border-border/50">
                            {new Date(item.ngayThucHien).toLocaleDateString('vi-VN')}
                          </span>
                        )}
                      </div>
                      <p className="text-2xs text-ink-secondary mt-1 leading-relaxed line-clamp-2">
                        {item.noiDung}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>

      {/* Row 2: Biểu đồ Điều hành Lãnh đạo Đa chiều (Biến động, Cùng kỳ, 5 Khối) */}
      <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 border-b border-border dark:border-slate-700/80 pb-3">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider text-primary-600 dark:text-primary-400">
              PHÂN TÍCH CHUYÊN SÂU
            </span>
            <h3 className="text-base sm:text-[17px] font-black text-ink uppercase tracking-tight mt-0.5">
              {executiveChartMode === 'bien-dong' && 'BIẾN ĐỘNG KÝ MỚI, DOANH THU & DÒNG TIỀN THEO THÁNG'}
              {executiveChartMode === 'cung-ky' && 'SO SÁNH CÙNG KỲ TĂNG TRƯỞNG NĂM 2025 - 2026'}
              {executiveChartMode === 'khoi-don-vi' && 'TIẾN ĐỘ THỰC HIỆN THEO 5 KHỐI ĐƠN VỊ'}
            </h3>
          </div>

          <div className="flex items-center gap-1 bg-subtle dark:bg-slate-900/60 p-1 rounded-xl border border-border dark:border-slate-700/80 shrink-0 self-start sm:self-center">
            <button
              type="button"
              onClick={() => setExecutiveChartMode('bien-dong')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                executiveChartMode === 'bien-dong'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
              }`}
            >
              Biến động tháng
            </button>
            <button
              type="button"
              onClick={() => setExecutiveChartMode('cung-ky')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                executiveChartMode === 'cung-ky'
                  ? 'bg-sky-600 text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
              }`}
            >
              Cùng kỳ 2025-2026
            </button>
            <button
              type="button"
              onClick={() => setExecutiveChartMode('khoi-don-vi')}
              className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                executiveChartMode === 'khoi-don-vi'
                  ? 'bg-purple-600 text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink hover:bg-surface/60'
              }`}
            >
              5 Khối đơn vị
            </button>
          </div>
        </div>

        {/* 4 Mini KPI Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
          <div className="bg-subtle/70 dark:bg-slate-900/50 px-3 py-2 rounded-xl border border-border/70 dark:border-slate-700/70 flex items-center justify-between">
            <span className="text-2xs font-medium text-ink-muted">Thu TB/tháng</span>
            <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400">~68.3 Tỷ</span>
          </div>
          <div className="bg-subtle/70 dark:bg-slate-900/50 px-3 py-2 rounded-xl border border-border/70 dark:border-slate-700/70 flex items-center justify-between">
            <span className="text-2xs font-medium text-ink-muted">Tháng cao điểm</span>
            <span className="text-xs font-mono font-bold text-amber-500 dark:text-amber-400">T6 (96.7 Tỷ)</span>
          </div>
          <div className="bg-subtle/70 dark:bg-slate-900/50 px-3 py-2 rounded-xl border border-border/70 dark:border-slate-700/70 flex items-center justify-between">
            <span className="text-2xs font-medium text-ink-muted">Hiệu suất thu</span>
            <span className="text-xs font-mono font-bold text-sky-500 dark:text-sky-400">113% / DT</span>
          </div>
          <div className="bg-subtle/70 dark:bg-slate-900/50 px-3 py-2 rounded-xl border border-border/70 dark:border-slate-700/70 flex items-center justify-between">
            <span className="text-2xs font-medium text-ink-muted">Tỷ lệ KH 2026</span>
            <span className="text-xs font-mono font-bold text-primary-600 dark:text-primary-400">126% Cả năm</span>
          </div>
        </div>

        <div className="h-[270px] w-full">
          {executiveChartMode === 'bien-dong' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={taiChinhData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickMargin={6} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                <Tooltip {...tooltipStyle} formatter={(val: any, name: any) => [`${val != null ? val : '--'} tỷ VNĐ`, name]} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '6px' }} />
                <Bar dataKey="kyMoi" name="Ký mới" fill="#f59e0b" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Bar dataKey="doanhThu" name="Doanh thu thực hiện" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={16} />
                <Line
                  type="monotone"
                  dataKey="dongTien"
                  name="Dòng tiền về"
                  stroke="#0284c7"
                  strokeWidth={2.5}
                  dot={{ r: 3.5, fill: '#0284c7', stroke: '#ffffff', strokeWidth: 1.5 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {executiveChartMode === 'cung-ky' && (
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={monthlyYoYComparison} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} tickMargin={6} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '6px' }} />
                <Bar dataKey="val2025" name="Cùng kỳ 2025" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={18} />
                <Bar dataKey="val2026" name="Thực hiện 2026" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={18} />
              </ComposedChart>
            </ResponsiveContainer>
          )}

          {executiveChartMode === 'khoi-don-vi' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={khoiDonViData} margin={{ top: 10, right: 15, left: -5, bottom: 5 }}>
                <ChartDefs />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={10} tickMargin={6} />
                <YAxis stroke="var(--text-muted)" fontSize={11} unit=" tỷ" />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '11px', fontWeight: '600', paddingTop: '6px' }} />
                <Bar dataKey="keHoach" name="Kế hoạch năm" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="doanhThu" name="Doanh thu thực hiện" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={20} />
                <Bar dataKey="tongNo" name="Tổng nợ đọng" fill="#f43f5e" radius={[4, 4, 0, 0]} maxBarSize={20} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Row 3: Biểu đồ Kế hoạch & Doanh thu 16 Đơn vị & Top nợ đọng */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        <div className="lg:col-span-2">
          <UnitPerformanceChart data={doanhThuData} onOpenDrilldown={() => onOpenDrilldown('hop-dong')} />
        </div>
        <div className="lg:col-span-1">
          <TopDebtsTable data={noDongData} onOpenDrilldown={() => onOpenDrilldown('cong-no')} />
        </div>
      </div>
    </div>
  );
}
