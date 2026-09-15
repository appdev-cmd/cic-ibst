import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Activity,
  Microscope,
  TrendingUp,
  PiggyBank,
  Users,
  Calendar,
  LayoutDashboard,
  Minimize2,
  Printer,
  FileSpreadsheet,
} from 'lucide-react';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { useSlidePanel } from '../context/SlidePanelContext';
import { LichCoQuanPage } from './LichCoQuanPage';
import {
  fetchDashboardData,
  type DashboardData,
  type DashboardFilter,
} from '../services/dashboardService';
import { ExecutiveWarningBanner } from '../components/ExecutiveWarningBanner';
import {
  DashboardDetailSlidePanel,
  type DashboardDrilldownTab,
} from '../components/DashboardDetailSlidePanel';
import { exportExcel } from '../lib/utils';

// Các Tab chuyên trách
import { OverviewTab } from './dashboard/tabs/OverviewTab';
import { ScienceTab } from './dashboard/tabs/ScienceTab';
import { BusinessTab } from './dashboard/tabs/BusinessTab';
import { FinanceTab } from './dashboard/tabs/FinanceTab';
import { PersonnelTab } from './dashboard/tabs/PersonnelTab';
import { DashboardFilterBar } from './dashboard/components/DashboardFilterBar';

export function DashboardPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(() => {
    if (tabParam === 'lich') return 'lich';
    if (tabParam && ['tong-quan', 'nckh', 'kinh-doanh', 'tai-chinh', 'nhan-su'].includes(tabParam)) return tabParam;
    return 'tong-quan';
  });

  const handleTabChange = (tabId: string) => {
    setActiveTab(tabId);
    setSearchParams(tabId === 'tong-quan' ? {} : { tab: tabId }, { replace: true });
  };

  useEffect(() => {
    if (tabParam === 'lich') {
      setActiveTab('lich');
    } else if (tabParam && ['tong-quan', 'nckh', 'kinh-doanh', 'tai-chinh', 'nhan-su'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  // Bộ lọc thời gian & đơn vị
  const [filterYear, setFilterYear] = useState('2026');
  const [filterPeriod, setFilterPeriod] = useState('all');
  const [filterDonVi, setFilterDonVi] = useState('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [isMeetingMode, setIsMeetingMode] = useState(false);

  const { openPanel } = useSlidePanel();

  // Tab "Tài chính & Đầu tư" gác bằng quyền dashboard_tai_chinh
  const { can: coQuyenDashboard, dangTai: dangTaiQuyenDashboard } = usePhanQuyen();
  const coTabTaiChinh = dangTaiQuyenDashboard || coQuyenDashboard('dashboard_tai_chinh', 'xem');

  useEffect(() => {
    if (dangTaiQuyenDashboard || activeTab !== 'tai-chinh' || coTabTaiChinh) return;
    handleTabChange('tong-quan');
  }, [dangTaiQuyenDashboard, activeTab, coTabTaiChinh]);

  // Nạp dữ liệu thống kê tổng hợp thực tế & theo bộ lọc
  const loadData = () => {
    setLoading(true);
    fetchDashboardData({
      year: filterYear,
      period: filterPeriod,
      donViId: filterDonVi,
      customStart,
      customEnd,
    })
      .then((data) => {
        setDashboardData(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Lỗi nạp dữ liệu Dashboard:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filterYear, filterPeriod, filterDonVi, customStart, customEnd]);

  // Thoát chế độ trình chiếu bằng phím ESC
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMeetingMode) {
        setIsMeetingMode(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMeetingMode]);

  // Mở SlidePanel chi tiết (Drill-down)
  const handleOpenDrilldown = (tab: DashboardDrilldownTab) => {
    if (!dashboardData) return;
    const titles: Record<DashboardDrilldownTab, { title: string; subtitle: string }> = {
      'hop-dong': {
        title: 'Chi tiết Hợp đồng Ký kết & Thực hiện',
        subtitle: `Danh sách hợp đồng trong kỳ ${filterPeriod === 'all' ? 'Cả năm' : filterPeriod} ${filterYear}`,
      },
      'cong-no': {
        title: 'Chi tiết Công nợ Lũy kế theo Hợp đồng',
        subtitle: 'Các hợp đồng còn nợ lũy kế cần theo dõi và đôn đốc thu hồi',
      },
      khcn: {
        title: 'Chi tiết Nhiệm vụ & Tiêu chuẩn KHCN',
        subtitle: 'Các đề tài cấp Bộ, cấp Nhà nước và Dự thảo Tiêu chuẩn/Quy chuẩn đang thực hiện',
      },
      'canh-bao': {
        title: 'Rà soát Tuân thủ Quy chế 2815 & Điểm nghẽn',
        subtitle: 'Các vi phạm quy chế hợp đồng, nợ quá hạn và tiến độ cần chỉ đạo',
      },
      'nhan-su': {
        title: 'Chi tiết Cán bộ & Chứng chỉ Hành nghề',
        subtitle: 'Hồ sơ nhân sự, chức danh và chứng chỉ LAS-XD theo đơn vị',
      },
    };

    openPanel({
      id: 'dashboard-chi-tiet-panel',
      title: titles[tab].title,
      subtitle: titles[tab].subtitle,
      icon: <LayoutDashboard size={16} className="text-primary-600 dark:text-primary-400" />,
      content: <DashboardDetailSlidePanel data={dashboardData} initialTab={tab} />,
      storageKey: 'slideover-width-dashboard-chi-tiet',
    });
  };

  // Xuất file Excel báo cáo giao ban
  const handleExportExcel = () => {
    if (!dashboardData) return;
    const headers = [
      'Mã Đơn vị',
      'Tên đầy đủ Đơn vị',
      'Kế hoạch Doanh thu (Tỷ)',
      'Ký mới trong kỳ (Tỷ)',
      'Doanh thu thực hiện (Tỷ)',
      '% Hoàn thành KH',
      'Công nợ lũy kế (Tỷ)',
      'Nợ nghĩa vụ Viện (Tỷ)',
    ];

    const rows = dashboardData.doanhThuData.map((d) => {
      const debt = dashboardData.noDongData.find((n) => n.name === d.name);
      return [
        d.name,
        d.fullName || d.name,
        d.keHoach,
        d.kyMoi,
        d.doanhThu,
        `${d.kh}%`,
        debt ? debt.tongNo : 0,
        debt ? debt.noNV : 0,
      ];
    });

    exportExcel(
      `Bao_cao_giao_ban_IBST_${filterYear}_${filterPeriod}.xls`,
      'Báo cáo Giao ban',
      headers,
      rows,
    );
  };

  const tabs = [
    { id: 'tong-quan', label: 'Tổng quan', icon: Activity },
    { id: 'nckh', label: 'NCKH & QLNN', icon: Microscope },
    { id: 'kinh-doanh', label: 'Kinh doanh & TBKT', icon: TrendingUp },
    ...(coTabTaiChinh ? [{ id: 'tai-chinh', label: 'Tài chính', icon: PiggyBank }] : []),
    { id: 'nhan-su', label: 'Tổ chức & Nhân sự', icon: Users },
    { id: 'lich', label: 'Lịch công tác', icon: Calendar },
  ];

  const currentFilter: DashboardFilter = {
    year: filterYear,
    period: filterPeriod,
    donViId: filterDonVi,
    customStart,
    customEnd,
  };

  return (
    <div
      className={`px-4 sm:px-6 pt-3 pb-20 w-full mx-auto space-y-5 transition-all ${
        isMeetingMode
          ? 'fixed inset-0 z-50 overflow-y-auto bg-surface dark:bg-slate-950 p-6 sm:p-8 space-y-6'
          : ''
      }`}
    >
      {/* ── Tiêu đề & Chế độ Họp Giao ban ── */}
      <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 border-b border-border dark:border-slate-700/80 pb-3">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl sm:text-2xl lg:text-[28px] font-black text-ink tracking-tight">
              {isMeetingMode ? 'BỘ XÂY DỰNG — VIỆN KHCN XÂY DỰNG — BÁO CÁO ĐIỀU HÀNH GIAO BAN' : 'Dashboard Quản trị IBST'}
            </h1>
            {filterDonVi !== 'all' && (
              <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200 dark:border-primary-800">
                {filterDonVi}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            <p className="text-ink-muted text-xs font-medium">
              Dữ liệu Real-time từ CSDL • Kỳ {filterPeriod === 'all' ? 'Cả năm' : filterPeriod} {filterYear}
              {dashboardData?.lastUpdated && (
                <span className="font-mono text-ink-muted/80 ml-2">
                  (Cập nhật: {dashboardData.lastUpdated.toLocaleTimeString('vi-VN')})
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tiện ích Header: Xuất Excel Báo Cáo Giao Ban, In tóm lược & Thoát họp */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-slate-700/80 hover:bg-subtle dark:hover:bg-slate-800/60 text-ink text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="Xuất bảng số liệu giao ban ra Excel"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">Xuất Báo cáo</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-slate-700/80 hover:bg-subtle dark:hover:bg-slate-800/60 text-ink text-xs font-bold transition-all cursor-pointer shadow-2xs"
            title="In trang báo cáo này"
          >
            <Printer className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">In trang</span>
          </button>

          {isMeetingMode && (
            <button
              type="button"
              onClick={() => setIsMeetingMode(false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-rose-600 text-white font-bold text-xs hover:bg-rose-700 shadow-sm transition-all cursor-pointer"
            >
              <Minimize2 className="w-3.5 h-3.5" />
              <span>Thoát Trình chiếu (ESC)</span>
            </button>
          )}
        </div>
      </div>

      {/* ── Widget Cảnh báo Điều hành & Tuân thủ QC 2815 ── */}
      {dashboardData?.canhBaoSummary && (
        <ExecutiveWarningBanner
          summary={dashboardData.canhBaoSummary}
          onOpenAlerts={(tabKey) => handleOpenDrilldown((tabKey as DashboardDrilldownTab) || 'canh-bao')}
        />
      )}

      {/* ── Tabs & Filter Bar ── */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Thanh chọn Tab phong cách Swiss Style */}
        <div className="flex flex-wrap gap-1 bg-surface p-1.5 rounded-2xl shadow-xs border border-border dark:border-slate-700/80 w-fit">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleTabChange(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'bg-primary-600 text-white shadow-xs'
                    : 'text-ink-secondary hover:bg-subtle dark:hover:bg-slate-800/50 hover:text-ink'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-ink-muted'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Thanh Bộ Lọc Thời Gian & Đơn Vị */}
        {activeTab !== 'lich' && (
          <DashboardFilterBar
            filterYear={filterYear}
            setFilterYear={setFilterYear}
            filterPeriod={filterPeriod}
            setFilterPeriod={setFilterPeriod}
            filterDonVi={filterDonVi}
            setFilterDonVi={setFilterDonVi}
            customStart={customStart}
            setCustomStart={setCustomStart}
            customEnd={customEnd}
            setCustomEnd={setCustomEnd}
            loading={loading}
            onRefresh={loadData}
            isMeetingMode={isMeetingMode}
            onToggleMeetingMode={() => setIsMeetingMode(!isMeetingMode)}
            lastUpdated={dashboardData?.lastUpdated}
          />
        )}
      </div>

      {/* ── Nội dung từng Tab ── */}
      {dashboardData ? (
        <>
          {activeTab === 'tong-quan' && (
            <OverviewTab
              data={dashboardData}
              onOpenDrilldown={handleOpenDrilldown}
              onNavigateToBusiness={() => handleTabChange('kinh-doanh')}
              filter={currentFilter}
              isMeetingMode={isMeetingMode}
            />
          )}

          {activeTab === 'nckh' && (
            <ScienceTab
              data={dashboardData}
              onOpenDrilldown={handleOpenDrilldown}
              filter={currentFilter}
              isMeetingMode={isMeetingMode}
            />
          )}

          {activeTab === 'kinh-doanh' && (
            <BusinessTab
              data={dashboardData}
              onOpenDrilldown={handleOpenDrilldown}
              filter={currentFilter}
              isMeetingMode={isMeetingMode}
            />
          )}

          {activeTab === 'tai-chinh' && coTabTaiChinh && (
            <FinanceTab
              data={dashboardData}
              onOpenDrilldown={handleOpenDrilldown}
              filter={currentFilter}
              isMeetingMode={isMeetingMode}
            />
          )}

          {activeTab === 'nhan-su' && (
            <PersonnelTab
              data={dashboardData}
              onOpenDrilldown={handleOpenDrilldown}
              filter={currentFilter}
              isMeetingMode={isMeetingMode}
            />
          )}

          {activeTab === 'lich' && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <LichCoQuanPage />
            </div>
          )}
        </>
      ) : (
        <div className="py-24 text-center">
          <div className="w-10 h-10 border-4 border-primary-500/30 border-t-primary-500 rounded-full animate-spin mx-auto mb-3" />
          <p className="text-xs font-semibold text-ink-muted">Đang tải và tổng hợp dữ liệu thời gian thực...</p>
        </div>
      )}
    </div>
  );
}
