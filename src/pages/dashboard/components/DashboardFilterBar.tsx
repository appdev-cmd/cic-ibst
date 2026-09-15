import React from 'react';
import { Filter, ChevronDown, RefreshCw, Maximize2, Minimize2 } from 'lucide-react';
import { DON_VI_16_BENCHMARKS, DON_VI_PHONG_CHUC_NANG } from '../../../services/dashboardService';

export interface DashboardFilterBarProps {
  filterYear: string;
  setFilterYear: (y: string) => void;
  filterPeriod: string;
  setFilterPeriod: (p: string) => void;
  filterDonVi: string;
  setFilterDonVi: (dv: string) => void;
  customStart: string;
  setCustomStart: (s: string) => void;
  customEnd: string;
  setCustomEnd: (e: string) => void;
  loading: boolean;
  onRefresh: () => void;
  isMeetingMode: boolean;
  onToggleMeetingMode: () => void;
  lastUpdated?: Date | null;
}

export function DashboardFilterBar({
  filterYear,
  setFilterYear,
  filterPeriod,
  setFilterPeriod,
  filterDonVi,
  setFilterDonVi,
  customStart,
  setCustomStart,
  customEnd,
  setCustomEnd,
  loading,
  onRefresh,
  isMeetingMode,
  onToggleMeetingMode,
  lastUpdated,
}: DashboardFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 bg-surface p-1.5 rounded-2xl border border-border dark:border-slate-700/80 shadow-xs">
      <div className="flex items-center gap-1.5 border-r border-border dark:border-slate-700/80 pl-2 pr-2.5 py-0.5">
        <Filter className="w-3.5 h-3.5 text-primary-500 shrink-0" />
        <span className="text-[11px] font-black uppercase text-ink-muted tracking-wider hidden sm:inline">Bộ lọc</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        {/* Bộ chọn Năm */}
        <div className="relative group">
          <select
            value={filterYear}
            onChange={(e) => setFilterYear(e.target.value)}
            className="w-[96px] appearance-none bg-subtle dark:bg-slate-900/60 text-ink font-bold text-xs rounded-xl pl-2.5 pr-6 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer"
          >
            <option value="2026">Năm 2026</option>
            <option value="2025">Năm 2025</option>
            <option value="2024">Năm 2024</option>
            <option value="all">Tất cả năm</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Bộ chọn Kỳ */}
        <div className="relative group">
          <select
            value={filterPeriod}
            onChange={(e) => setFilterPeriod(e.target.value)}
            className={`appearance-none bg-subtle dark:bg-slate-900/60 text-ink font-bold text-xs rounded-xl pl-2.5 pr-6 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer truncate ${
              filterPeriod === 'all' ? 'w-[85px]' : 'max-w-[135px]'
            }`}
          >
            <option value="all">Cả năm</option>
            <option value="q1">Quý I</option>
            <option value="q2">Quý II</option>
            <option value="q3">Quý III</option>
            <option value="q4">Quý IV</option>
            <option value="6-thang">6 Tháng đầu năm</option>
            <option value="9-thang">9 Tháng</option>
            <option value="custom">Tùy chọn ngày...</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Bộ chọn Đơn vị */}
        <div className="relative group">
          <select
            value={filterDonVi}
            onChange={(e) => setFilterDonVi(e.target.value)}
            className={`appearance-none bg-subtle dark:bg-slate-900/60 text-ink font-bold text-xs rounded-xl pl-2.5 pr-6 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer truncate ${
              filterDonVi === 'all' ? 'w-[105px]' : 'max-w-[180px]'
            }`}
            title="Lọc theo đơn vị"
          >
            <option value="all">Toàn Viện (20 ĐV)</option>
            <optgroup label="I. Các Viện chuyên ngành">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'I').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="II. Các Phân viện">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'II').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="III. Các Trung tâm chuyên môn">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'III').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="IV. Doanh nghiệp trực thuộc">
              {DON_VI_16_BENCHMARKS.filter((d) => d.group === 'IV').map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
            <optgroup label="V. Phòng chức năng quản lý">
              {DON_VI_PHONG_CHUC_NANG.map((dv) => (
                <option key={dv.code} value={dv.code}>
                  {dv.code} - {dv.name}
                </option>
              ))}
            </optgroup>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-ink-muted absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
        </div>

        {/* Tùy chọn ngày nếu custom */}
        {filterPeriod === 'custom' && (
          <div className="flex items-center gap-1.5">
            <input
              type="date"
              value={customStart}
              onChange={(e) => setCustomStart(e.target.value)}
              className="bg-subtle dark:bg-slate-900/60 text-ink font-medium text-xs rounded-xl px-2.5 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500"
            />
            <span className="text-ink-muted text-xs">-</span>
            <input
              type="date"
              value={customEnd}
              onChange={(e) => setCustomEnd(e.target.value)}
              className="bg-subtle dark:bg-slate-900/60 text-ink font-medium text-xs rounded-xl px-2.5 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500"
            />
          </div>
        )}

        {/* Nút Làm mới */}
        <button
          type="button"
          onClick={onRefresh}
          title="Tải lại dữ liệu từ CSDL"
          className="p-1.5 rounded-xl border border-border dark:border-slate-700/80 hover:bg-subtle dark:hover:bg-slate-800/50 text-ink-secondary hover:text-ink transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin text-primary-500' : ''}`} />
        </button>

        {/* Nút Trình chiếu Họp Giao ban */}
        <button
          type="button"
          onClick={onToggleMeetingMode}
          title="Chế độ Trình chiếu Họp Giao ban (ESC để thoát)"
          className={`p-1.5 rounded-xl border transition-all cursor-pointer ${
            isMeetingMode
              ? 'bg-primary-600 text-white border-primary-600 shadow-xs'
              : 'border-border dark:border-slate-700/80 hover:bg-subtle dark:hover:bg-slate-800/50 text-primary-600 dark:text-primary-400'
          }`}
        >
          {isMeetingMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>
      </div>

      {lastUpdated && (
        <span className="text-[10px] text-ink-muted font-mono pl-1 hidden xl:inline">
          {lastUpdated.toLocaleTimeString('vi-VN')}
        </span>
      )}
    </div>
  );
}
