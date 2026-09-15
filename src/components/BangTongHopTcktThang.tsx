import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  Calendar,
  Layers,
  Wallet,
  TrendingUp,
  Banknote,
  Receipt,
  PiggyBank,
  CheckCircle2,
  Zap,
  Loader2,
} from 'lucide-react';
import {
  DANH_SACH_KY_BAO_CAO,
  getBaoCaoTcktTheoKy,
  fetchBangTongHopTcktLive,
  formatValueByUnit,
  exportBangTongHopTcktExcel,
  type UnitType,
  type BaoCaoTcktRow,
} from '../services/tcktReportService';
import { useAsyncData } from '../hooks/useAsyncData';
import { cn } from '../lib/utils';

export function BangTongHopTcktThang() {
  const [selectedKyId, setSelectedKyId] = useState<string>('live');
  const [unit, setUnit] = useState<UnitType>('nghin');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Nạp dữ liệu tính toán trực tiếp từ CSDL Supabase khi chọn Live
  const { data: liveTcktRows, loading: loadingLive } = useAsyncData(fetchBangTongHopTcktLive, []);

  const selectedKy = useMemo(() => {
    return DANH_SACH_KY_BAO_CAO.find((k) => k.id === selectedKyId) || DANH_SACH_KY_BAO_CAO[0];
  }, [selectedKyId]);

  const rawRows = useMemo(() => {
    if (selectedKy.isLive && liveTcktRows && liveTcktRows.length > 0) {
      return liveTcktRows;
    }
    return getBaoCaoTcktTheoKy(selectedKy.id);
  }, [selectedKy.id, selectedKy.isLive, liveTcktRows]);

  // Lọc theo từ khóa tìm kiếm (nếu có)
  const displayRows = useMemo(() => {
    if (!searchTerm.trim()) return rawRows;
    const q = searchTerm.trim().toLowerCase();
    return rawRows.filter((r) => {
      if (r.isTongVien || r.isTongCong) return true;
      if (r.isHeader) return true;
      return (
        r.maDonVi.toLowerCase().includes(q) ||
        r.tenDonVi.toLowerCase().includes(q) ||
        (r.stt && r.stt.includes(q))
      );
    });
  }, [rawRows, searchTerm]);

  // Lấy dòng Tổng cộng để hiển thị thẻ KPI nhanh
  const tongCongRow = useMemo(() => {
    return rawRows.find((r) => r.isTongCong) || null;
  }, [rawRows]);

  const handleExportExcel = () => {
    exportBangTongHopTcktExcel(
      selectedKy.thoiDiem,
      selectedKy.thangTiepTheo,
      displayRows,
      unit,
    );
  };

  const handlePrint = () => {
    window.print();
  };

  const unitLabel = unit === 'nghin' ? 'nghìn đồng' : unit === 'ty' ? 'tỷ VNĐ' : 'triệu VNĐ';

  return (
    <div className="space-y-4">
      {/* ── THANH ĐIỀU KHIỂN & CÔNG CỤ ── */}
      <div className="card p-4 border border-border dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border dark:border-slate-700/80 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary dark:text-primary-300">
                <FileSpreadsheet size={20} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                Bảng 1. Tổng hợp giá trị ký, doanh thu và tiền về {selectedKy.thoiDiem}
              </h2>
              {selectedKy.isLive ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border border-sky-300/40">
                  <Zap size={11} className="text-sky-600 dark:text-sky-400 fill-current" />
                  Tính toán tự động từ CSDL
                  {loadingLive && <Loader2 size={11} className="animate-spin ml-1 text-sky-600" />}
                </span>
              ) : selectedKy.isOfficial ? (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border border-emerald-300/40">
                  <CheckCircle2 size={11} /> Số liệu chính thức LĐ Viện
                </span>
              ) : null}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              Đơn vị tính: <strong className="text-ink">{unitLabel}</strong> •{' '}
              {selectedKy.isLive
                ? 'Tổng hợp dòng tiền tự động theo thời gian thực từ 112 hợp đồng và 170 đợt thanh toán trong CSDL (View v_bang_tong_hop_tckt_2026)'
                : 'Nguồn số liệu tổng hợp định kỳ từ Phòng TCKT & Kế toán 16 đơn vị trực thuộc'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Bộ chọn mốc thời gian / tháng */}
            <div className="flex items-center gap-1.5 bg-subtle dark:bg-slate-900/60 px-3 py-1.5 rounded-lg border border-border dark:border-slate-700/80">
              <Calendar size={14} className="text-primary shrink-0" />
              <span className="text-xs font-semibold text-ink-secondary shrink-0">Kỳ báo cáo:</span>
              <select
                value={selectedKyId}
                onChange={(e) => setSelectedKyId(e.target.value)}
                className="bg-transparent text-xs font-bold text-ink focus:outline-none cursor-pointer pr-2"
              >
                {DANH_SACH_KY_BAO_CAO.map((ky) => (
                  <option key={ky.id} value={ky.id} className="bg-surface dark:bg-slate-900 text-ink">
                    {ky.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Bộ chuyển đổi đơn vị */}
            <div className="inline-flex items-center rounded-lg border border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setUnit('nghin')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                  unit === 'nghin'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-ink-secondary hover:text-ink'
                )}
                title="Đơn vị tính gốc của văn bản Bảng 1"
              >
                Nghìn đồng (Gốc)
              </button>
              <button
                type="button"
                onClick={() => setUnit('ty')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                  unit === 'ty'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-ink-secondary hover:text-ink'
                )}
                title="Chia 1.000.000 để lãnh đạo xem nhanh theo Tỷ"
              >
                Tỷ VNĐ
              </button>
              <button
                type="button"
                onClick={() => setUnit('trieu')}
                className={cn(
                  'px-2.5 py-1 rounded-md transition-all cursor-pointer',
                  unit === 'trieu'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-ink-secondary hover:text-ink'
                )}
                title="Chia 1.000 để đồng bộ hệ thống ERP"
              >
                Triệu VNĐ
              </button>
            </div>

            {/* Xuất Excel */}
            <button
              type="button"
              onClick={handleExportExcel}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="Xuất bảng này ra file Excel (.xls) có 2 tầng header chuẩn văn bản"
            >
              <Download size={14} /> Xuất Excel
            </button>

            {/* In bảng */}
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border dark:border-slate-700/80 bg-surface hover:bg-subtle text-ink px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title="In báo cáo này ra máy in hoặc lưu PDF"
            >
              <Printer size={14} /> In bảng
            </button>
          </div>
        </div>

        {/* Ô tìm kiếm nhanh đơn vị */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Tìm nhanh đơn vị (VD: VKC, PVMN, TVTK...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-slate-700/80 bg-surface pl-8 pr-3 py-1 text-xs text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
          </div>
          <div className="text-2xs text-ink-muted">
            Hiển thị <strong>{displayRows.filter((r) => !r.isHeader).length}</strong> hàng số liệu
          </div>
        </div>
      </div>

      {/* ── KPI TỔNG HỢP NHANH (TỔNG CỘNG TOÀN VIỆN) ── */}
      {tongCongRow && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <div className="card p-3 border border-border dark:border-slate-700/80">
            <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <Wallet size={13} className="text-primary" /> KH Doanh thu
            </div>
            <div className="text-base sm:text-lg font-black text-ink mt-1 tabular-nums">
              {formatValueByUnit(tongCongRow.keHoachDauNam, unit)}
            </div>
            <div className="text-[10px] text-ink-muted">Đầu năm giao</div>
          </div>

          <div className="card p-3 border border-border dark:border-slate-700/80">
            <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <TrendingUp size={13} className="text-sky-600" /> Ký HĐKT 2026
            </div>
            <div className="text-base sm:text-lg font-black text-sky-600 dark:text-sky-400 mt-1 tabular-nums">
              {formatValueByUnit(tongCongRow.kyNam2026, unit)}
            </div>
            <div className="text-[10px] font-bold text-sky-600 dark:text-sky-400">
              Đạt {tongCongRow.pctKyKH}% KH
            </div>
          </div>

          <div className="card p-3 border border-border dark:border-slate-700/80">
            <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <Banknote size={13} className="text-emerald-600" /> Doanh thu 2026
            </div>
            <div className="text-base sm:text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1 tabular-nums">
              {formatValueByUnit(tongCongRow.doanhThu2026, unit, true)}
            </div>
            <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
              Đạt {tongCongRow.pctDtKH}% KH
            </div>
          </div>

          <div className="card p-3 border border-border dark:border-slate-700/80">
            <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <PiggyBank size={13} className="text-indigo-600" /> Tổng tiền về 2026
            </div>
            <div className="text-base sm:text-lg font-black text-indigo-600 dark:text-indigo-400 mt-1 tabular-nums">
              {formatValueByUnit(tongCongRow.tongTienVe2026, unit, true)}
            </div>
            <div className="text-[10px] text-ink-muted">
              DT 2026: {formatValueByUnit(tongCongRow.tienVeDt2026, unit, true)}
            </div>
          </div>

          <div className="card p-3 border border-border dark:border-slate-700/80">
            <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <Receipt size={13} className="text-rose-600" /> A nợ DThu 2026
            </div>
            <div className="text-base sm:text-lg font-black text-rose-600 dark:text-rose-400 mt-1 tabular-nums">
              {formatValueByUnit(tongCongRow.aNoDt2026, unit, true)}
            </div>
            <div className="text-[10px] text-rose-600 dark:text-rose-400">Công nợ phải thu</div>
          </div>

          <div className="card p-3 border border-border dark:border-slate-700/80">
            <div className="text-[11px] font-medium text-ink-muted flex items-center gap-1">
              <Layers size={13} className="text-amber-600" /> {selectedKy.thangTiepTheo}
            </div>
            <div className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 mt-1 tabular-nums">
              {formatValueByUnit(tongCongRow.khThangToi, unit, true)}
            </div>
            <div className="text-[10px] text-ink-muted">Đăng ký tháng tới</div>
          </div>
        </div>
      )}

      {/* ── BẢNG DỮ LIỆU CHÍNH THỨC 2 TẦNG TIÊU ĐỀ ── */}
      <div className="card overflow-hidden border border-border dark:border-slate-700/80 shadow-xs">
        <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
          <table className="w-full min-w-[1100px] border-collapse text-left text-xs">
            {/* Header 2 tầng */}
            <thead className="sticky top-0 z-20 bg-subtle dark:bg-[#1a1e2e] text-ink border-b-2 border-border dark:border-slate-700/80">
              {/* Tầng 1 */}
              <tr className="border-b border-border dark:border-slate-700/80">
                <th
                  rowSpan={2}
                  className="p-2.5 text-center font-bold w-10 border-r border-border dark:border-slate-700/80"
                >
                  TT
                </th>
                <th
                  rowSpan={2}
                  className="p-2.5 font-bold min-w-[130px] border-r border-border dark:border-slate-700/80"
                >
                  Đơn vị
                </th>
                <th
                  rowSpan={2}
                  className="p-2.5 text-right font-bold min-w-[110px] border-r border-border dark:border-slate-700/80"
                >
                  Kế hoạch doanh thu đầu năm
                </th>
                <th
                  colSpan={2}
                  className="p-2 text-center font-bold text-sky-700 dark:text-sky-300 border-r border-border dark:border-slate-700/80 bg-sky-50/40 dark:bg-sky-950/30"
                >
                  Giá trị ký HĐKT
                </th>
                <th
                  colSpan={2}
                  className="p-2 text-center font-bold text-emerald-700 dark:text-emerald-300 border-r border-border dark:border-slate-700/80 bg-emerald-50/40 dark:bg-emerald-950/30"
                >
                  Giá trị doanh thu
                </th>
                <th
                  colSpan={4}
                  className="p-2 text-center font-bold text-indigo-700 dark:text-indigo-300 border-r border-border dark:border-slate-700/80 bg-indigo-50/40 dark:bg-indigo-950/30"
                >
                  Giá trị tiền về 2026
                </th>
                <th
                  rowSpan={2}
                  className="p-2.5 text-right font-bold min-w-[95px] text-rose-700 dark:text-rose-300 border-r border-border dark:border-slate-700/80 bg-rose-50/30 dark:bg-rose-950/20"
                >
                  A nợ DThu 2026
                </th>
                <th
                  rowSpan={2}
                  className="p-2.5 text-right font-bold min-w-[95px] text-amber-700 dark:text-amber-300 bg-amber-50/30 dark:bg-amber-950/20"
                >
                  {selectedKy.thangTiepTheo}
                </th>
              </tr>

              {/* Tầng 2 */}
              <tr className="text-2xs font-semibold text-ink-muted">
                {/* Dưới Ký HĐKT */}
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[95px]">
                  Năm 2026
                </th>
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[70px]">
                  % Kế hoạch đầu năm
                </th>

                {/* Dưới Doanh thu */}
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[95px]">
                  Năm 2026
                </th>
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[70px]">
                  % Kế hoạch đầu năm
                </th>

                {/* Dưới Tiền về 2026 */}
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[95px] font-bold text-indigo-700 dark:text-indigo-300">
                  Tổng tiền về 2026
                </th>
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[90px]">
                  Trả Dthu năm trước
                </th>
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[90px]">
                  Tiền về Dthu 2026
                </th>
                <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[85px]">
                  A trả trước
                </th>
              </tr>
            </thead>

            {/* Dữ liệu các hàng */}
            <tbody className="divide-y divide-border dark:divide-slate-700/80 text-ink">
              {displayRows.map((row, idx) => {
                // Header phân nhóm
                if (row.isHeader) {
                  return (
                    <tr
                      key={`header-${idx}`}
                      className="bg-subtle/80 dark:bg-slate-800/80 font-bold text-primary dark:text-primary-300 text-xs tracking-wide"
                    >
                      <td className="p-2.5 text-center border-r border-border dark:border-slate-700/80"></td>
                      <td
                        colSpan={12}
                        className="p-2.5 font-bold uppercase tracking-wider text-[11.5px]"
                      >
                        {row.groupTitle}
                      </td>
                    </tr>
                  );
                }

                // Hàng Tổng Viện (highlight tím hồng mận)
                if (row.isTongVien) {
                  return (
                    <tr
                      key="tong-vien"
                      className="bg-pink-100/80 dark:bg-pink-950/40 font-bold text-pink-950 dark:text-pink-200 border-t-2 border-b-2 border-pink-300 dark:border-pink-800/60"
                    >
                      <td className="p-2.5 text-center border-r border-pink-200 dark:border-pink-800/40"></td>
                      <td className="p-2.5 font-black uppercase text-pink-900 dark:text-pink-300 border-r border-pink-200 dark:border-pink-800/40">
                        {row.tenDonVi}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.keHoachDauNam, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.kyNam2026, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {row.pctKyKH != null ? `${row.pctKyKH}%` : ''}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.doanhThu2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {row.pctDtKH != null ? `${row.pctDtKH}%` : ''}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-black border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.tongTienVe2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.traDtNamTruoc, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.tienVeDt2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.aTraTruoc, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-black border-r border-pink-200 dark:border-pink-800/40">
                        {formatValueByUnit(row.aNoDt2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-black">
                        {formatValueByUnit(row.khThangToi, unit, true)}
                      </td>
                    </tr>
                  );
                }

                // Hàng Tổng cộng (highlight mận sẫm đậm hơn)
                if (row.isTongCong) {
                  return (
                    <tr
                      key="tong-cong"
                      className="bg-pink-200/90 dark:bg-pink-900/60 font-black text-pink-950 dark:text-white border-t-2 border-b-2 border-pink-400 dark:border-pink-700 text-[12.5px]"
                    >
                      <td className="p-2.5 text-center border-r border-pink-300 dark:border-pink-700/60"></td>
                      <td className="p-2.5 font-black uppercase text-pink-950 dark:text-pink-100 border-r border-pink-300 dark:border-pink-700/60">
                        {row.tenDonVi}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.keHoachDauNam, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.kyNam2026, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {row.pctKyKH != null ? `${row.pctKyKH}%` : ''}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.doanhThu2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {row.pctDtKH != null ? `${row.pctDtKH}%` : ''}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-black border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.tongTienVe2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.traDtNamTruoc, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.tienVeDt2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.aTraTruoc, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-black border-r border-pink-300 dark:border-pink-700/60">
                        {formatValueByUnit(row.aNoDt2026, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-black">
                        {formatValueByUnit(row.khThangToi, unit, true)}
                      </td>
                    </tr>
                  );
                }

                // Các hàng đơn vị bình thường
                return (
                  <tr
                    key={row.maDonVi || idx}
                    className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="p-2.5 text-center text-ink-muted border-r border-border dark:border-slate-700/80">
                      {row.stt}
                    </td>
                    <td className="p-2.5 font-bold text-ink border-r border-border dark:border-slate-700/80">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-primary dark:text-primary-300">
                          {row.maDonVi}
                        </span>
                        {row.tenDonVi && row.tenDonVi !== row.maDonVi && (
                          <span
                            className="hidden xl:inline text-ink-muted text-2xs font-normal truncate max-w-[140px]"
                            title={row.tenDonVi}
                          >
                            • {row.tenDonVi}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-medium text-ink-secondary border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.keHoachDauNam, unit)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-semibold text-sky-700 dark:text-sky-300 border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.kyNam2026, unit)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-bold border-r border-border dark:border-slate-700/80">
                      {row.pctKyKH != null ? (
                        <span
                          className={cn(
                            row.pctKyKH >= 100
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-ink-secondary'
                          )}
                        >
                          {row.pctKyKH}%
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-semibold text-emerald-700 dark:text-emerald-300 border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.doanhThu2026, unit, true)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-bold border-r border-border dark:border-slate-700/80">
                      {row.pctDtKH != null ? (
                        <span
                          className={cn(
                            row.pctDtKH >= 100
                              ? 'text-emerald-600 dark:text-emerald-400'
                              : 'text-ink-secondary'
                          )}
                        >
                          {row.pctDtKH}%
                        </span>
                      ) : (
                        ''
                      )}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-bold text-indigo-700 dark:text-indigo-300 border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.tongTienVe2026, unit, true)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums text-ink-secondary border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.traDtNamTruoc, unit)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-medium text-indigo-600 dark:text-indigo-400 border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.tienVeDt2026, unit, true)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums text-ink-muted border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.aTraTruoc, unit)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-bold text-rose-600 dark:text-rose-400 border-r border-border dark:border-slate-700/80">
                      {formatValueByUnit(row.aNoDt2026, unit, true)}
                    </td>
                    <td className="p-2.5 text-right tabular-nums font-semibold text-amber-700 dark:text-amber-300">
                      {formatValueByUnit(row.khThangToi, unit, true)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
