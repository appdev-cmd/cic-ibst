import React, { useState, useMemo } from 'react';
import {
  FileSpreadsheet,
  Download,
  Printer,
  Search,
  CheckCircle2,
  FileCheck2,
  AlertTriangle,
  Clock,
  Layers,
  ShieldCheck,
  Zap,
  Loader2,
} from 'lucide-react';
import type { HopDong } from '../types';
import { canTrinhVienTruong, xacDinhTrangThaiPheDuyet, ngayHanNopHoSo, soNgayConLai } from '../lib/qc2815';
import { formatTrieu, exportCsv, exportExcel, cn } from '../lib/utils';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchBangTongHopKhktLive,
  BANG_TONG_HOP_KHKT_BENCHMARK,
  type BangTongHopKhktRow,
  type UnitType,
} from '../services/tcktReportService';

function formatVal(valNghin: number, unit: UnitType, allowZero = false): string {
  if (valNghin === 0 && !allowZero) return '0';
  if (unit === 'ty') {
    const ty = valNghin / 1000000;
    return ty >= 10 ? ty.toFixed(1).replace('.', ',') : ty.toFixed(3).replace('.', ',');
  }
  if (unit === 'trieu') {
    return Math.round(valNghin / 1000).toLocaleString('vi-VN');
  }
  return Math.round(valNghin).toLocaleString('vi-VN');
}

/** Xuất Bảng tổng hợp KHKT ra Excel (.xls) có 2 tầng tiêu đề */
function exportBangTongHopKhktExcel(rows: BangTongHopKhktRow[], unit: UnitType) {
  const unitLabel = unit === 'nghin' ? 'Nghìn đồng' : unit === 'ty' ? 'Tỷ VNĐ' : 'Triệu VNĐ';
  const filename = `Bang_tong_hop_gia_tri_ky_HDKT_IBST_2026_${unit}.xls`;

  const rowsHtml = rows
    .map((r) => {
      if (r.isHeader) {
        return `
          <tr style="background-color: #f1f5f9; font-weight: bold;">
            <td style="text-align: center;">${r.group}</td>
            <td colspan="9" style="padding: 6px 10px; color: #1e3a8a;">${r.name}</td>
          </tr>
        `;
      }
      const isSub = r.isSubtotal;
      const isGrand = r.isGrandTotal;
      const isYel = r.isHighlighted;

      let rowBg = '';
      if (isGrand) rowBg = 'background-color: #e2e8f0; font-weight: bold;';
      else if (isSub) rowBg = 'background-color: #f8fafc; font-weight: bold;';
      else if (isYel) rowBg = 'background-color: #fef08a;'; // Nền vàng theo ảnh

      return `
        <tr style="${rowBg}">
          <td style="text-align: center;">${r.stt || ''}</td>
          <td style="padding: 5px 8px; font-weight: ${isSub || isGrand ? 'bold' : '500'};">${r.code}</td>
          <td style="text-align: right; color: ${r.khIsRed ? '#dc2626' : '#000'}; font-weight: ${r.khIsRed ? 'bold' : 'normal'};">
            ${formatVal(r.khNghin, unit)}
          </td>
          <td style="text-align: right; color: ${r.ckIsRed ? '#dc2626' : '#000'}; font-weight: ${r.ckIsRed ? 'bold' : 'normal'};">
            ${formatVal(r.ckNghin, unit)}
          </td>
          <td style="text-align: right;">${formatVal(r.vienKyNghin, unit, true)}</td>
          <td style="text-align: right;">${formatVal(r.dvKyNghin, unit, true)}</td>
          <td style="text-align: right; font-weight: bold;">${formatVal(r.tongKyNghin, unit, true)}</td>
          <td style="text-align: right;">${r.pctKH}%</td>
          <td style="text-align: right;">${r.pctCungKy}%</td>
          <td style="padding: 5px 8px; font-size: 9pt;">${r.ghiChu || ''}</td>
        </tr>
      `;
    })
    .join('');

  const tableHtml = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="utf-8" />
      <style>
        body { font-family: 'Segoe UI', Arial, sans-serif; font-size: 10pt; }
        .title { font-size: 13pt; font-weight: bold; text-align: left; padding: 6px 0; color: #000; }
        .unit-note { font-size: 9.5pt; font-style: italic; text-align: right; padding-bottom: 6px; }
        th { background-color: #ffffff; color: #000000; font-weight: bold; border: 1px solid #94a3b8; padding: 6px 8px; text-align: center; vertical-align: middle; }
        td { border: 1px solid #cbd5e1; padding: 5px 8px; font-size: 9.5pt; }
      </style>
    </head>
    <body>
      <div class="title">Bảng tổng hợp giá trị ký HĐKT các đơn vị năm 2026</div>
      <div class="unit-note">Đơn vị tính: ${unitLabel}</div>
      <table>
        <thead>
          <tr>
            <th rowspan="2">TT</th>
            <th rowspan="2" style="min-width: 140px;">Đơn vị</th>
            <th rowspan="2" style="min-width: 110px;">Đăng ký KH cả năm</th>
            <th rowspan="2" style="min-width: 110px;">SL cùng kỳ năm 2025</th>
            <th colspan="3">Giá trị ký HĐKT tính tới 21.8.2026</th>
            <th rowspan="2" style="min-width: 80px;">So với KH năm</th>
            <th rowspan="2" style="min-width: 80px;">So với SL cùng kỳ năm ngoái</th>
            <th rowspan="2" style="min-width: 160px;">Ghi chú</th>
          </tr>
          <tr>
            <th style="min-width: 90px;">Viện ký</th>
            <th style="min-width: 95px;">Đơn vị ký</th>
            <th style="min-width: 95px;">Tổng cộng</th>
          </tr>
        </thead>
        <tbody>
          ${rowsHtml}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff' + tableHtml], { type: 'application/vnd.ms-excel;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ── Bảng Giám sát Thủ tục HĐKT (Bản gốc Điều 6.3) ──
interface DongBaoCaoThuTuc {
  donVi: string;
  soHopDong: number;
  tongGiaTri: number;
  daThu: number;
  conPhaiThu: number;
  quaHanNopHoSo: number;
  choDuyetVienTruong: number;
  daQuyetToan: number;
}

function tongHopThuTuc(list: HopDong[]): DongBaoCaoThuTuc[] {
  const theoDonVi = new Map<string, DongBaoCaoThuTuc>();

  for (const hd of list) {
    const ten = hd.donViThucHien || '— Chưa gán đơn vị —';
    let d = theoDonVi.get(ten);
    if (!d) {
      d = {
        donVi: ten,
        soHopDong: 0,
        tongGiaTri: 0,
        daThu: 0,
        conPhaiThu: 0,
        quaHanNopHoSo: 0,
        choDuyetVienTruong: 0,
        daQuyetToan: 0,
      };
      theoDonVi.set(ten, d);
    }

    d.soHopDong += 1;
    d.tongGiaTri += hd.giaTri || 0;
    d.daThu += hd.daThanhToan || 0;
    d.conPhaiThu += Math.max(0, (hd.giaTri || 0) - (hd.daThanhToan || 0));

    if (!hd.ngayNopHoSo && hd.ngayKy) {
      const han = ngayHanNopHoSo(hd.ngayKy);
      if (han && soNgayConLai(han) < 0) d.quaHanNopHoSo += 1;
    }

    const trangThaiPd = xacDinhTrangThaiPheDuyet(hd);
    if (trangThaiPd !== 'khong-ap-dung' && trangThaiPd !== 'da-duyet') {
      d.choDuyetVienTruong += 1;
    }

    if (hd.trangThaiQuyetToan === 'da-quyet-toan') d.daQuyetToan += 1;
  }

  return [...theoDonVi.values()].sort((a, b) => b.tongGiaTri - a.tongGiaTri);
}

export function BaoCaoKhktPanel({ hopDongList }: { hopDongList: HopDong[] }) {
  const [viewMode, setViewMode] = useState<'tong-hop-khkt' | 'giam-sat-thu-tuc'>('tong-hop-khkt');
  const [khktSource, setKhktSource] = useState<'live' | 'benchmark'>('live');
  const [unit, setUnit] = useState<UnitType>('nghin');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Nạp dữ liệu tính toán trực tiếp từ View CSDL Supabase
  const { data: liveKhktRows, loading: loadingLive, refetch: reloadLiveKhkt } = useAsyncData(fetchBangTongHopKhktLive, []);

  const activeRawKhktRows = useMemo(() => {
    if (khktSource === 'live' && liveKhktRows && liveKhktRows.length > 0) {
      return liveKhktRows;
    }
    return BANG_TONG_HOP_KHKT_BENCHMARK;
  }, [khktSource, liveKhktRows]);

  // Lọc bảng tổng hợp KHKT
  const filteredKhktRows = useMemo(() => {
    if (!searchTerm.trim()) return activeRawKhktRows;
    const q = searchTerm.trim().toLowerCase();
    return activeRawKhktRows.filter((r) => {
      if (r.isSubtotal || r.isGrandTotal || r.isHeader) return true;
      return (
        r.code.toLowerCase().includes(q) ||
        r.name.toLowerCase().includes(q) ||
        (r.stt && r.stt.includes(q))
      );
    });
  }, [activeRawKhktRows, searchTerm]);

  // Bảng giám sát thủ tục
  const rowsThuTuc = useMemo(() => tongHopThuTuc(hopDongList), [hopDongList]);
  const tongThuTuc = useMemo(
    () =>
      rowsThuTuc.reduce(
        (t, r) => ({
          soHopDong: t.soHopDong + r.soHopDong,
          tongGiaTri: t.tongGiaTri + r.tongGiaTri,
          daThu: t.daThu + r.daThu,
          conPhaiThu: t.conPhaiThu + r.conPhaiThu,
          quaHanNopHoSo: t.quaHanNopHoSo + r.quaHanNopHoSo,
          choDuyetVienTruong: t.choDuyetVienTruong + r.choDuyetVienTruong,
          daQuyetToan: t.daQuyetToan + r.daQuyetToan,
        }),
        { soHopDong: 0, tongGiaTri: 0, daThu: 0, conPhaiThu: 0, quaHanNopHoSo: 0, choDuyetVienTruong: 0, daQuyetToan: 0 },
      ),
    [rowsThuTuc],
  );

  const handleExport = () => {
    if (viewMode === 'tong-hop-khkt') {
      exportBangTongHopKhktExcel(filteredKhktRows, unit);
    } else {
      const ngay = new Date().toISOString().slice(0, 10);
      exportCsv(
        `bao-cao-hdkt-khkt-${ngay}.csv`,
        ['Đơn vị', 'Số HĐ', 'Tổng giá trị (tr.đ)', 'Đã thu (tr.đ)', 'Còn phải thu (tr.đ)', 'Quá hạn nộp hồ sơ', 'Chờ duyệt Viện trưởng', 'Đã quyết toán'],
        rowsThuTuc.map((r) => [
          r.donVi, r.soHopDong, r.tongGiaTri, r.daThu, r.conPhaiThu,
          r.quaHanNopHoSo, r.choDuyetVienTruong, r.daQuyetToan,
        ]),
      );
    }
  };

  const unitLabel = unit === 'nghin' ? 'Nghìn đồng' : unit === 'ty' ? 'Tỷ VNĐ' : 'Triệu VNĐ';
  const grandTotalRow = useMemo(() => activeRawKhktRows.find((r) => r.isGrandTotal), [activeRawKhktRows]);

  return (
    <div className="space-y-4">
      {/* ── THANH CHUYỂN ĐỔI CHẾ ĐỘ & CÔNG CỤ ── */}
      <div className="card p-4 border border-border dark:border-slate-700/80 shadow-xs space-y-3">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 border-b border-border dark:border-slate-700/80 pb-3">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="p-1.5 rounded-lg bg-primary/10 text-primary dark:text-primary-300">
                <FileSpreadsheet size={20} />
              </span>
              <h2 className="text-base sm:text-lg font-bold text-ink">
                {viewMode === 'tong-hop-khkt'
                  ? 'Bảng tổng hợp giá trị ký HĐKT các đơn vị năm 2026'
                  : 'Báo cáo thống kê HĐKT gửi Phòng KHKT'}
              </h2>
              {viewMode === 'tong-hop-khkt' && (
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-2xs font-bold border transition-colors',
                    khktSource === 'live'
                      ? 'bg-sky-100 text-sky-800 dark:bg-sky-950/60 dark:text-sky-300 border-sky-300/40'
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 border-emerald-300/40'
                  )}
                >
                  {khktSource === 'live' ? (
                    <>
                      <Zap size={11} className="text-sky-600 dark:text-sky-400 fill-current" />
                      Tính toán tự động từ CSDL
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={11} />
                      Mốc chốt Giao ban 21/8
                    </>
                  )}
                </span>
              )}
            </div>
            <p className="text-xs text-ink-muted mt-1">
              {viewMode === 'tong-hop-khkt'
                ? khktSource === 'live'
                  ? `Đơn vị tính: ${unitLabel} • Tính toán tự động theo thời gian thực từ CSDL Supabase (View v_bang_tong_hop_khkt_2026)`
                  : `Đơn vị tính: ${unitLabel} • Căn cứ số liệu giao ban Viện tính tới 21.8.2026 (Phân cấp Viện ký & Đơn vị ký)`
                : `Điều 6.3 QC 2815 — Số liệu định kỳ tuần/tháng phục vụ báo cáo giao ban của Viện. Chốt số tại thời điểm ${new Date().toLocaleDateString('vi-VN')}.`}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {/* Nguồn số liệu: Live CSDL vs Mốc chốt giao ban */}
            {viewMode === 'tong-hop-khkt' && (
              <div className="inline-flex items-center rounded-lg border border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setKhktSource('live')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1',
                    khktSource === 'live'
                      ? 'bg-sky-600 text-white shadow-2xs font-bold'
                      : 'text-ink-secondary hover:text-ink'
                  )}
                  title="Tính toán số liệu trực tiếp từ 112 hợp đồng và kế hoạch các đơn vị trong CSDL"
                >
                  <Zap size={12} className={khktSource === 'live' ? 'text-amber-300 fill-amber-300' : ''} />
                  CSDL Live
                </button>
                <button
                  type="button"
                  onClick={() => setKhktSource('benchmark')}
                  className={cn(
                    'px-2.5 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1',
                    khktSource === 'benchmark'
                      ? 'bg-primary text-white shadow-2xs font-bold'
                      : 'text-ink-secondary hover:text-ink'
                  )}
                  title="Xem số liệu chuẩn mốc giao ban Viện ngày 21/8/2026"
                >
                  <FileCheck2 size={12} />
                  Mốc chốt 21/8
                </button>
              </div>
            )}

            {/* Chuyển đổi giữa Bảng mẫu ảnh 2 vs Bảng chi tiết thủ tục */}
            <div className="inline-flex items-center rounded-lg border border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
              <button
                type="button"
                onClick={() => setViewMode('tong-hop-khkt')}
                className={cn(
                  'px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                  viewMode === 'tong-hop-khkt'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                <FileSpreadsheet size={13} /> Mẫu Tổng hợp Ký HĐKT
              </button>
              <button
                type="button"
                onClick={() => setViewMode('giam-sat-thu-tuc')}
                className={cn(
                  'px-3 py-1 rounded-md transition-all cursor-pointer flex items-center gap-1.5',
                  viewMode === 'giam-sat-thu-tuc'
                    ? 'bg-primary text-white shadow-2xs font-bold'
                    : 'text-ink-secondary hover:text-ink'
                )}
              >
                <ShieldCheck size={13} /> Giám sát Thủ tục (Đ.6.3)
              </button>
            </div>

            {/* Bộ đổi đơn vị (khi xem Bảng tổng hợp KHKT) */}
            {viewMode === 'tong-hop-khkt' && (
              <div className="inline-flex items-center rounded-lg border border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-0.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setUnit('nghin')}
                  className={cn(
                    'px-2 py-1 rounded-md transition-all cursor-pointer',
                    unit === 'nghin'
                      ? 'bg-primary text-white shadow-2xs font-bold'
                      : 'text-ink-secondary hover:text-ink'
                  )}
                  title="Nghìn đồng (Gốc theo ảnh)"
                >
                  Nghìn đ (Gốc)
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('ty')}
                  className={cn(
                    'px-2 py-1 rounded-md transition-all cursor-pointer',
                    unit === 'ty'
                      ? 'bg-primary text-white shadow-2xs font-bold'
                      : 'text-ink-secondary hover:text-ink'
                  )}
                  title="Tỷ VNĐ (rút gọn)"
                >
                  Tỷ VNĐ
                </button>
                <button
                  type="button"
                  onClick={() => setUnit('trieu')}
                  className={cn(
                    'px-2 py-1 rounded-md transition-all cursor-pointer',
                    unit === 'trieu'
                      ? 'bg-primary text-white shadow-2xs font-bold'
                      : 'text-ink-secondary hover:text-ink'
                  )}
                  title="Triệu VNĐ (ERP)"
                >
                  Triệu VNĐ
                </button>
              </div>
            )}

            {/* Nút Xuất File */}
            <button
              type="button"
              onClick={handleExport}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
              title={viewMode === 'tong-hop-khkt' ? 'Xuất Excel (.xls) 2 tầng tiêu đề' : 'Xuất file CSV'}
            >
              <Download size={14} /> {viewMode === 'tong-hop-khkt' ? 'Xuất Excel' : 'Xuất CSV'}
            </button>

            {/* In bảng */}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 rounded-lg border border-border dark:border-slate-700/80 bg-surface hover:bg-subtle text-ink px-3 py-1.5 text-xs font-bold shadow-2xs transition-colors cursor-pointer"
            >
              <Printer size={14} /> In bảng
            </button>
          </div>
        </div>

        {/* Thanh tìm kiếm */}
        <div className="flex items-center justify-between gap-4">
          <div className="relative w-full max-w-xs">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              type="text"
              placeholder="Tìm theo mã đơn vị (VCNKC, PVMN, TVTK...)"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full rounded-lg border border-border dark:border-slate-700/80 bg-surface pl-8 pr-3 py-1 text-xs text-ink placeholder:text-ink-muted focus:border-primary focus:outline-none"
            />
          </div>
          <div className="text-2xs text-ink-muted font-medium">
            {viewMode === 'tong-hop-khkt' ? (
              <span>
                Tổng cộng ký 2026:{' '}
                <strong className="text-primary font-black">
                  {grandTotalRow?.tongKyNghin != null
                    ? formatVal(grandTotalRow.tongKyNghin, unit)
                    : '...'}
                </strong>{' '}
                {unitLabel} ({grandTotalRow?.pctKH ?? 0}% KH)
                {loadingLive && khktSource === 'live' && (
                  <Loader2 size={12} className="inline ml-1 animate-spin text-primary" />
                )}
              </span>
            ) : (
              <span>
                Tổng số hợp đồng: <strong className="text-ink">{tongThuTuc.soHopDong}</strong>
              </span>
            )}
          </div>
        </div>
      </div>

      {/* ── CHẾ ĐỘ 1: BẢNG TỔNG HỢP GIÁ TRỊ KÝ HĐKT CÁC ĐƠN VỊ NĂM 2026 (THEO ẢNH 2) ── */}
      {viewMode === 'tong-hop-khkt' && (
        <div className="card overflow-hidden border border-border dark:border-slate-700/80 shadow-xs">
          <div className="overflow-x-auto overflow-y-auto max-h-[calc(100vh-280px)]">
            <table className="w-full min-w-[1050px] border-collapse text-left text-xs">
              {/* Header 2 tầng */}
              <thead className="sticky top-0 z-20 bg-subtle dark:bg-[#1a1e2e] text-ink border-b-2 border-border dark:border-slate-700/80">
                {/* Tầng 1 */}
                <tr className="border-b border-border dark:border-slate-700/80">
                  <th rowSpan={2} className="p-2.5 text-center font-bold w-10 border-r border-border dark:border-slate-700/80">
                    TT
                  </th>
                  <th rowSpan={2} className="p-2.5 font-bold min-w-[130px] border-r border-border dark:border-slate-700/80">
                    Đơn vị
                  </th>
                  <th rowSpan={2} className="p-2.5 text-right font-bold min-w-[110px] border-r border-border dark:border-slate-700/80">
                    Đăng ký KH cả năm
                  </th>
                  <th rowSpan={2} className="p-2.5 text-right font-bold min-w-[110px] border-r border-border dark:border-slate-700/80">
                    SL cùng kỳ năm 2025
                  </th>
                  <th
                    colSpan={3}
                    className="p-2 text-center font-bold text-primary dark:text-primary-300 border-r border-border dark:border-slate-700/80 bg-primary/5 dark:bg-primary-950/30"
                  >
                    {khktSource === 'live'
                      ? 'Giá trị ký HĐKT tính theo CSDL thực tế'
                      : 'Giá trị ký HĐKT tính tới 21.8.2026'}
                  </th>
                  <th rowSpan={2} className="p-2.5 text-right font-bold min-w-[80px] border-r border-border dark:border-slate-700/80">
                    So với KH năm
                  </th>
                  <th rowSpan={2} className="p-2.5 text-right font-bold min-w-[85px] border-r border-border dark:border-slate-700/80">
                    So với SL cùng kỳ năm ngoái
                  </th>
                  <th rowSpan={2} className="p-2.5 font-bold min-w-[160px]">
                    Ghi chú
                  </th>
                </tr>

                {/* Tầng 2 */}
                <tr className="text-2xs font-semibold text-ink-muted">
                  <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[90px] text-sky-700 dark:text-sky-300">
                    Viện ký
                  </th>
                  <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[95px] text-teal-700 dark:text-teal-300">
                    Đơn vị ký
                  </th>
                  <th className="p-2 text-right border-r border-border dark:border-slate-700/80 min-w-[95px] font-bold text-primary dark:text-primary-300">
                    Tổng cộng
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-border dark:divide-slate-700/80 text-ink">
                {filteredKhktRows.map((row, idx) => {
                  // Hàng nhóm I, II, III, V
                  if (row.isHeader) {
                    return (
                      <tr
                        key={`header-${idx}`}
                        className="bg-subtle/80 dark:bg-slate-800/80 font-bold text-primary dark:text-primary-300 text-xs tracking-wide"
                      >
                        <td className="p-2.5 text-center border-r border-border dark:border-slate-700/80 font-bold">
                          {row.group}
                        </td>
                        <td colSpan={9} className="p-2.5 font-bold uppercase tracking-wider text-[11.5px]">
                          {row.name}
                        </td>
                      </tr>
                    );
                  }

                  // Hàng IV. Tổng Viện
                  if (row.isSubtotal) {
                    return (
                      <tr
                        key="tong-vien"
                        className="bg-primary/10 dark:bg-primary-950/40 font-bold text-primary-950 dark:text-primary-200 border-t-2 border-b-2 border-primary/30"
                      >
                        <td className="p-2.5 text-center font-bold border-r border-border dark:border-slate-700/80">
                          {row.stt}
                        </td>
                        <td className="p-2.5 font-black uppercase text-primary dark:text-primary-300 border-r border-border dark:border-slate-700/80">
                          {row.code}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80">
                          {formatVal(row.khNghin, unit)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80 text-rose-600 dark:text-rose-400 font-bold">
                          {formatVal(row.ckNghin, unit)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80">
                          {formatVal(row.vienKyNghin, unit, true)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80">
                          {formatVal(row.dvKyNghin, unit, true)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-black border-r border-border dark:border-slate-700/80">
                          {formatVal(row.tongKyNghin, unit, true)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-black border-r border-border dark:border-slate-700/80">
                          {row.pctKH}%
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-black border-r border-border dark:border-slate-700/80">
                          {row.pctCungKy}%
                        </td>
                        <td className="p-2.5 text-2xs text-ink-muted">
                          {row.ghiChu}
                        </td>
                      </tr>
                    );
                  }

                  // Hàng Tổng cộng
                  if (row.isGrandTotal) {
                    return (
                      <tr
                        key="tong-cong"
                        className="bg-primary/20 dark:bg-primary-900/60 font-black text-ink dark:text-white border-t-2 border-b-2 border-primary/50 text-[12.5px]"
                      >
                        <td className="p-2.5 text-center border-r border-border dark:border-slate-700/80"></td>
                        <td className="p-2.5 font-black uppercase text-ink dark:text-white border-r border-border dark:border-slate-700/80">
                          {row.code}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80">
                          {formatVal(row.khNghin, unit)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80 text-rose-600 dark:text-rose-400 font-black">
                          {formatVal(row.ckNghin, unit)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80">
                          {formatVal(row.vienKyNghin, unit, true)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums border-r border-border dark:border-slate-700/80">
                          {formatVal(row.dvKyNghin, unit, true)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-black border-r border-border dark:border-slate-700/80">
                          {formatVal(row.tongKyNghin, unit, true)}
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-black border-r border-border dark:border-slate-700/80">
                          {row.pctKH}%
                        </td>
                        <td className="p-2.5 text-right tabular-nums font-black border-r border-border dark:border-slate-700/80">
                          {row.pctCungKy}%
                        </td>
                        <td className="p-2.5 text-2xs text-ink-muted font-medium">
                          {row.ghiChu}
                        </td>
                      </tr>
                    );
                  }

                  // Hàng được highlight vàng (PVMT, TTTV & UD BIM theo ảnh gốc)
                  const isYel = row.isHighlighted;

                  return (
                    <tr
                      key={row.code || idx}
                      className={cn(
                        'transition-colors',
                        isYel
                          ? 'bg-amber-100/70 dark:bg-amber-950/40 hover:bg-amber-200/70 dark:hover:bg-amber-900/50'
                          : 'hover:bg-muted/40 dark:hover:bg-slate-800/40'
                      )}
                    >
                      <td className="p-2.5 text-center text-ink-muted border-r border-border dark:border-slate-700/80 font-medium">
                        {row.stt}
                      </td>
                      <td className="p-2.5 font-bold text-ink border-r border-border dark:border-slate-700/80">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={cn(
                              'font-bold',
                              isYel ? 'text-amber-950 dark:text-amber-200' : 'text-primary dark:text-primary-300'
                            )}
                          >
                            {row.code}
                          </span>
                        </div>
                      </td>
                      <td
                        className={cn(
                          'p-2.5 text-right tabular-nums font-medium border-r border-border dark:border-slate-700/80',
                          row.khIsRed
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-ink-secondary'
                        )}
                      >
                        {formatVal(row.khNghin, unit)}
                      </td>
                      <td
                        className={cn(
                          'p-2.5 text-right tabular-nums font-medium border-r border-border dark:border-slate-700/80',
                          row.ckIsRed
                            ? 'text-rose-600 dark:text-rose-400 font-bold'
                            : 'text-ink-secondary'
                        )}
                      >
                        {formatVal(row.ckNghin, unit)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums text-sky-700 dark:text-sky-300 border-r border-border dark:border-slate-700/80">
                        {formatVal(row.vienKyNghin, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums text-teal-700 dark:text-teal-300 border-r border-border dark:border-slate-700/80">
                        {formatVal(row.dvKyNghin, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-bold text-primary dark:text-primary-300 border-r border-border dark:border-slate-700/80">
                        {formatVal(row.tongKyNghin, unit, true)}
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-bold border-r border-border dark:border-slate-700/80">
                        <span className={cn(row.pctKH >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-secondary')}>
                          {row.pctKH}%
                        </span>
                      </td>
                      <td className="p-2.5 text-right tabular-nums font-bold border-r border-border dark:border-slate-700/80">
                        <span className={cn(row.pctCungKy >= 100 ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-secondary')}>
                          {row.pctCungKy}%
                        </span>
                      </td>
                      <td className="p-2.5 text-2xs text-ink-muted">
                        {row.ghiChu}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── CHẾ ĐỘ 2: BẢNG GIÁM SÁT THỦ TỤC HĐKT THEO ĐIỀU 6.3 ── */}
      {viewMode === 'giam-sat-thu-tuc' && (
        <div className="card overflow-x-auto border border-border dark:border-slate-700/80 shadow-xs">
          <table className="w-full min-w-[760px] text-left text-xs">
            <thead className="bg-subtle dark:bg-[#1a1e2e] text-ink border-b border-border dark:border-slate-700/80">
              <tr>
                <th className="th-cell">Đơn vị thực hiện</th>
                <th className="th-cell text-right">Số HĐ</th>
                <th className="th-cell text-right">Tổng giá trị</th>
                <th className="th-cell text-right text-emerald-600 dark:text-emerald-400">Đã thu</th>
                <th className="th-cell text-right text-amber-600 dark:text-amber-400">Còn phải thu</th>
                <th className="th-cell text-right text-rose-600 dark:text-rose-400">Quá hạn nộp HS</th>
                <th className="th-cell text-right text-amber-600 dark:text-amber-400">Chờ duyệt VT</th>
                <th className="th-cell text-right">Đã quyết toán</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700/80">
              {rowsThuTuc.map((r) => (
                <tr key={r.donVi} className="hover:bg-muted/40 dark:hover:bg-slate-800/40">
                  <td className="td-cell text-xs font-medium text-ink">{r.donVi}</td>
                  <td className="td-cell text-right font-mono text-xs">{r.soHopDong}</td>
                  <td className="td-cell text-right font-mono text-xs font-bold">{formatTrieu(r.tongGiaTri)}</td>
                  <td className="td-cell text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">{formatTrieu(r.daThu)}</td>
                  <td className="td-cell text-right font-mono text-xs text-amber-600 dark:text-amber-400">{formatTrieu(r.conPhaiThu)}</td>
                  <td className={cn('td-cell text-right font-mono text-xs', r.quaHanNopHoSo > 0 && 'font-bold text-rose-600 dark:text-rose-400')}>
                    {r.quaHanNopHoSo || '—'}
                  </td>
                  <td className={cn('td-cell text-right font-mono text-xs', r.choDuyetVienTruong > 0 && 'font-bold text-amber-600 dark:text-amber-400')}>
                    {r.choDuyetVienTruong || '—'}
                  </td>
                  <td className="td-cell text-right font-mono text-xs">{r.daQuyetToan || '—'}</td>
                </tr>
              ))}
              {rowsThuTuc.length === 0 && (
                <tr>
                  <td colSpan={8} className="td-cell py-4 text-center text-xs italic text-ink-muted">
                    Chưa có hợp đồng nào để thống kê.
                  </td>
                </tr>
              )}
            </tbody>
            {rowsThuTuc.length > 0 && (
              <tfoot>
                <tr className="border-t-2 border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-800/60 font-bold">
                  <td className="td-cell text-xs">TỔNG CỘNG</td>
                  <td className="td-cell text-right font-mono text-xs">{tongThuTuc.soHopDong}</td>
                  <td className="td-cell text-right font-mono text-xs">{formatTrieu(tongThuTuc.tongGiaTri)}</td>
                  <td className="td-cell text-right font-mono text-xs text-emerald-600 dark:text-emerald-400">{formatTrieu(tongThuTuc.daThu)}</td>
                  <td className="td-cell text-right font-mono text-xs text-amber-600 dark:text-amber-400">{formatTrieu(tongThuTuc.conPhaiThu)}</td>
                  <td className={cn('td-cell text-right font-mono text-xs', tongThuTuc.quaHanNopHoSo > 0 && 'text-rose-600 dark:text-rose-400')}>
                    {tongThuTuc.quaHanNopHoSo || '—'}
                  </td>
                  <td className={cn('td-cell text-right font-mono text-xs', tongThuTuc.choDuyetVienTruong > 0 && 'text-amber-600 dark:text-amber-400')}>
                    {tongThuTuc.choDuyetVienTruong || '—'}
                  </td>
                  <td className="td-cell text-right font-mono text-xs">{tongThuTuc.daQuyetToan || '—'}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      )}
    </div>
  );
}
