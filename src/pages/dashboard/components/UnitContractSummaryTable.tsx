import React, { useState } from 'react';
import { FileSpreadsheet, Download, Printer } from 'lucide-react';
import { exportExcel } from '../../../lib/utils';

export interface SummaryTableRow {
  isHeader?: boolean;
  isSubtotal?: boolean;
  isGrandTotal?: boolean;
  stt?: string;
  group?: string;
  title?: string;
  code?: string;
  name?: string;
  khNghin?: number;
  khTy?: number;
  ckNghin?: number;
  ckTy?: number;
  vienKyNghin?: number;
  vienKyTy?: number;
  dvKyNghin?: number;
  dvKyTy?: number;
  tongKyNghin?: number;
  tongKyTy?: number;
  pctKH?: number;
  pctCungKy?: number;
  ghiChu?: string;
}

export const BANG_TONG_HOP_ROWS: SummaryTableRow[] = [
  { isHeader: true, group: 'I', title: 'I. CÁC VIỆN CHUYÊN NGÀNH' },
  {
    stt: '1',
    code: 'VKC',
    name: 'Viện chuyên ngành Kết cấu công trình xây dựng',
    khNghin: 70000000,
    khTy: 70.0,
    ckNghin: 67747280,
    ckTy: 67.747,
    vienKyNghin: 2891992,
    vienKyTy: 2.892,
    dvKyNghin: 57723448,
    dvKyTy: 57.723,
    tongKyNghin: 60615440,
    tongKyTy: 60.615,
    pctKH: 87,
    pctCungKy: 89,
    ghiChu: '',
  },
  {
    stt: '2',
    code: 'VBT',
    name: 'Viện chuyên ngành Bê tông',
    khNghin: 38600000,
    khTy: 38.6,
    ckNghin: 20191235,
    ckTy: 20.191,
    vienKyNghin: 193671,
    vienKyTy: 0.194,
    dvKyNghin: 21686357,
    dvKyTy: 21.686,
    tongKyNghin: 21880028,
    tongKyTy: 21.880,
    pctKH: 57,
    pctCungKy: 108,
    ghiChu: '',
  },
  {
    stt: '3',
    code: 'VĐKT',
    name: 'Viện chuyên ngành Địa kỹ thuật',
    khNghin: 22000000,
    khTy: 22.0,
    ckNghin: 16050776,
    ckTy: 16.051,
    vienKyNghin: 72930,
    vienKyTy: 0.073,
    dvKyNghin: 38064879,
    dvKyTy: 38.065,
    tongKyNghin: 38137809,
    tongKyTy: 38.138,
    pctKH: 173,
    pctCungKy: 238,
    ghiChu: 'Tăng trưởng đột biến',
  },
  { isHeader: true, group: 'II', title: 'II. CÁC PHÂN VIỆN' },
  {
    stt: '4',
    code: 'PVMN',
    name: 'Phân Viện Khoa học công nghệ xây dựng miền Nam',
    khNghin: 60500000,
    khTy: 60.5,
    ckNghin: 23789989,
    ckTy: 23.790,
    vienKyNghin: 2471387,
    vienKyTy: 2.471,
    dvKyNghin: 58202989,
    dvKyTy: 58.203,
    tongKyNghin: 60674376,
    tongKyTy: 60.674,
    pctKH: 100,
    pctCungKy: 255,
    ghiChu: 'Đạt 100% KH sớm',
  },
  {
    stt: '5',
    code: 'PVMT',
    name: 'Phân Viện Khoa học công nghệ xây dựng miền Trung',
    khNghin: 42000000,
    khTy: 42.0,
    ckNghin: 36268393,
    ckTy: 36.268,
    vienKyNghin: 7160000,
    vienKyTy: 7.160,
    dvKyNghin: 946000,
    dvKyTy: 0.946,
    tongKyNghin: 8106000,
    tongKyTy: 8.106,
    pctKH: 19,
    pctCungKy: 22,
    ghiChu: 'PVMT cũ ko giao KH ký mới',
  },
  { isHeader: true, group: 'III', title: 'III. CÁC TRUNG TÂM' },
  {
    stt: '6',
    code: 'TTTK',
    name: 'Trung tâm tư vấn thiết kế và xây dựng',
    khNghin: 25000000,
    khTy: 25.0,
    ckNghin: 34281313,
    ckTy: 34.281,
    vienKyNghin: 3371988,
    vienKyTy: 3.372,
    dvKyNghin: 18742814,
    dvKyTy: 18.743,
    tongKyNghin: 22114802,
    tongKyTy: 22.115,
    pctKH: 88,
    pctCungKy: 65,
    ghiChu: '',
  },
  {
    stt: '7',
    code: 'TTKCT',
    name: 'Trung tâm Kết cấu thép và Cơ khí xây dựng',
    khNghin: 20000000,
    khTy: 20.0,
    ckNghin: 23485542,
    ckTy: 23.486,
    vienKyNghin: 0,
    vienKyTy: 0,
    dvKyNghin: 22896500,
    dvKyTy: 22.897,
    tongKyNghin: 22896500,
    tongKyTy: 22.897,
    pctKH: 114,
    pctCungKy: 97,
    ghiChu: '',
  },
  {
    stt: '8',
    code: 'TTĐKT',
    name: 'Trung tâm Địa kỹ thuật và Trắc địa công trình',
    khNghin: 18000000,
    khTy: 18.0,
    ckNghin: 13346510,
    ckTy: 13.347,
    vienKyNghin: 1250000,
    vienKyTy: 1.250,
    dvKyNghin: 17945000,
    dvKyTy: 17.945,
    tongKyNghin: 19195000,
    tongKyTy: 19.195,
    pctKH: 107,
    pctCungKy: 144,
    ghiChu: '',
  },
  {
    stt: '9',
    code: 'TTKĐ',
    name: 'Trung tâm Kiểm định và Chứng nhận chất lượng xây dựng',
    khNghin: 16000000,
    khTy: 16.0,
    ckNghin: 14285000,
    ckTy: 14.285,
    vienKyNghin: 0,
    vienKyTy: 0,
    dvKyNghin: 15400000,
    dvKyTy: 15.400,
    tongKyNghin: 15400000,
    tongKyTy: 15.400,
    pctKH: 96,
    pctCungKy: 108,
    ghiChu: '',
  },
  {
    stt: '10',
    code: 'TTAT',
    name: 'Trung tâm An toàn và Phòng chống cháy nổ xây dựng',
    khNghin: 25000000,
    khTy: 25.0,
    ckNghin: 47460000,
    ckTy: 47.460,
    vienKyNghin: 2198074,
    vienKyTy: 2.198,
    dvKyNghin: 25437230,
    dvKyTy: 25.437,
    tongKyNghin: 27635304,
    tongKyTy: 27.635,
    pctKH: 107,
    pctCungKy: 58,
    ghiChu: '',
  },
  {
    stt: '11',
    code: 'TTCNHT',
    name: 'Trung tâm Công nghệ và Kỹ thuật hạ tầng',
    khNghin: 28000000,
    khTy: 28.0,
    ckNghin: 29923810,
    ckTy: 29.924,
    vienKyNghin: 3493210,
    vienKyTy: 3.493,
    dvKyNghin: 40136594,
    dvKyTy: 40.137,
    tongKyNghin: 43629804,
    tongKyTy: 43.630,
    pctKH: 156,
    pctCungKy: 146,
    ghiChu: '',
  },
  {
    stt: '12',
    code: 'TTTBXD',
    name: 'Trung tâm Thiết bị và An toàn xây dựng',
    khNghin: 40000000,
    khTy: 40.0,
    ckNghin: 38561149,
    ckTy: 38.561,
    vienKyNghin: 9900678,
    vienKyTy: 9.901,
    dvKyNghin: 50825154,
    dvKyTy: 50.825,
    tongKyNghin: 60725832,
    tongKyTy: 60.726,
    pctKH: 152,
    pctCungKy: 157,
    ghiChu: '',
  },
  {
    stt: '13',
    code: 'TTCNVL',
    name: 'Trung tâm Công nghệ Vật liệu và Xây dựng',
    khNghin: 16000000,
    khTy: 16.0,
    ckNghin: 13728161,
    ckTy: 13.728,
    vienKyNghin: 129000,
    vienKyTy: 0.129,
    dvKyNghin: 11283461,
    dvKyTy: 11.283,
    tongKyNghin: 11412461,
    tongKyTy: 11.412,
    pctKH: 71,
    pctCungKy: 83,
    ghiChu: '',
  },
  {
    stt: '14',
    code: 'TTQT',
    name: 'Trung tâm Đào tạo và Quản lý dự án quốc tế',
    khNghin: 45000000,
    khTy: 45.0,
    ckNghin: 49437953,
    ckTy: 49.438,
    vienKyNghin: 16301057,
    vienKyTy: 16.301,
    dvKyNghin: 67303138,
    dvKyTy: 67.303,
    tongKyNghin: 83604195,
    tongKyTy: 83.604,
    pctKH: 186,
    pctCungKy: 169,
    ghiChu: '',
  },
  {
    stt: '15',
    code: 'TTBIM',
    name: 'Trung tâm Tư vấn và Ứng dụng BIM trong xây dựng',
    khNghin: 71800000,
    khTy: 71.8,
    ckNghin: 91747268,
    ckTy: 91.747,
    vienKyNghin: 99774151,
    vienKyTy: 99.774,
    dvKyNghin: 2436675,
    dvKyTy: 2.437,
    tongKyNghin: 102210826,
    tongKyTy: 102.211,
    pctKH: 142,
    pctCungKy: 111,
    ghiChu: 'Gộp KH của BIM và TTMTay',
  },
  // IV. TỔNG KHỐI VIỆN (SUBTOTAL)
  {
    isSubtotal: true,
    stt: 'IV',
    code: 'TỔNG KHỐI VIỆN',
    name: 'Tổng cộng 15 đơn vị sự nghiệp thuộc Viện',
    khNghin: 692000000,
    khTy: 692.0,
    ckNghin: 624325961,
    ckTy: 624.326,
    vienKyNghin: 261225333,
    vienKyTy: 261.225,
    dvKyNghin: 543913121,
    dvKyTy: 543.913,
    tongKyNghin: 805138454,
    tongKyTy: 805.138,
    pctKH: 116,
    pctCungKy: 129,
    ghiChu: 'Khối Viện vượt 16% KH năm',
  },
  // V. CÔNG TY CỔ PHẦN
  { isHeader: true, group: 'V', title: 'V. CÔNG TY CỔ PHẦN' },
  {
    stt: '16',
    code: 'CTCP',
    name: 'Công ty Cổ phần Đầu tư và Tư vấn Xây dựng IBST',
    khNghin: 58000000,
    khTy: 58.0,
    ckNghin: 59918682,
    ckTy: 59.919,
    vienKyNghin: 0,
    vienKyTy: 0,
    dvKyNghin: 136597347,
    dvKyTy: 136.597,
    tongKyNghin: 136597347,
    tongKyTy: 136.597,
    pctKH: 236,
    pctCungKy: 228,
    ghiChu: '100% Đơn vị tự ký',
  },
  // TỔNG CỘNG TOÀN VIỆN
  {
    isGrandTotal: true,
    stt: '',
    code: 'TỔNG CỘNG TOÀN VIỆN',
    name: 'Toàn bộ 16 Đơn vị Trực thuộc Viện IBST',
    khNghin: 750000000,
    khTy: 750.0,
    ckNghin: 684244643,
    ckTy: 684.245,
    vienKyNghin: 261225333,
    vienKyTy: 261.225,
    dvKyNghin: 680510468,
    dvKyTy: 680.510,
    tongKyNghin: 941735801,
    tongKyTy: 941.736,
    pctKH: 126,
    pctCungKy: 138,
    ghiChu: 'Vượt kế hoạch năm trước 4 tháng',
  },
];

export function UnitContractSummaryTable() {
  const [tableUnit, setTableUnit] = useState<'ty' | 'nghin'>('ty');
  const isNghin = tableUnit === 'nghin';

  const handleExportExcel = () => {
    const unitLabel = isNghin ? '(Nghìn đồng)' : '(Tỷ VNĐ)';
    const headers = [
      'TT',
      'Đơn vị',
      `Đăng ký KH cả năm 2026 ${unitLabel}`,
      `SL Cùng kỳ năm 2025 ${unitLabel}`,
      `Viện ký ${unitLabel}`,
      `Đơn vị ký ${unitLabel}`,
      `Tổng cộng ký 2026 ${unitLabel}`,
      'So với KH năm (%)',
      'So với cùng kỳ (%)',
      'Ghi chú',
    ];

    const fmtVal = (ty: number, nghin: number) => {
      if (isNghin) return nghin.toLocaleString('vi-VN');
      return ty > 0 ? ty.toFixed(ty % 1 === 0 ? 1 : 3) : '0';
    };

    const rows = BANG_TONG_HOP_ROWS.map((r) => {
      if (r.isHeader) {
        return [r.group || '', r.title || '', '', '', '', '', '', '', '', ''];
      }
      return [
        r.stt || '',
        r.code || '',
        fmtVal(r.khTy ?? 0, r.khNghin ?? 0),
        fmtVal(r.ckTy ?? 0, r.ckNghin ?? 0),
        fmtVal(r.vienKyTy ?? 0, r.vienKyNghin ?? 0),
        fmtVal(r.dvKyTy ?? 0, r.dvKyNghin ?? 0),
        fmtVal(r.tongKyTy ?? 0, r.tongKyNghin ?? 0),
        `${r.pctKH ?? 0}%`,
        `${r.pctCungKy ?? 0}%`,
        r.ghiChu || '',
      ];
    });

    exportExcel(
      `Bang_Tong_Hop_Ky_HDKT_IBST_2026_${isNghin ? 'NghinDong' : 'TyVND'}.xls`,
      'Tổng hợp Ký HĐKT 2026',
      headers,
      rows,
    );
  };

  const fmt = (tyVal?: number, nghinVal?: number) => {
    if (isNghin) {
      return (nghinVal ?? 0).toLocaleString('vi-VN');
    }
    const val = tyVal ?? 0;
    return val > 0 ? val.toFixed(val % 1 === 0 ? 1 : 3) : '—';
  };

  return (
    <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl space-y-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border dark:border-slate-700/80 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <FileSpreadsheet className="w-5 h-5 text-primary-500 shrink-0" />
            <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
              Bảng Tổng hợp Giá trị ký HĐKT các Đơn vị năm 2026 (tính tới 21.8.2026)
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
              Đạt 126% KH cả năm
            </span>
          </div>
          <p className="text-xs text-ink-muted mt-1 leading-relaxed">
            Số liệu lũy kế chính thức toàn Viện IBST • Phân cấp Viện ký (261,225 tỷ) và Đơn vị tự ký (680,510 tỷ)
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          {/* Bộ chuyển đổi đơn vị */}
          <div className="flex items-center bg-subtle dark:bg-slate-900/60 p-1 rounded-xl border border-border dark:border-slate-700/80 text-xs font-bold">
            <button
              type="button"
              onClick={() => setTableUnit('ty')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tableUnit === 'ty'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Tỷ VNĐ
            </button>
            <button
              type="button"
              onClick={() => setTableUnit('nghin')}
              className={`px-3 py-1 rounded-lg transition-all cursor-pointer ${
                tableUnit === 'nghin'
                  ? 'bg-primary-600 text-white shadow-xs'
                  : 'text-ink-secondary hover:text-ink'
              }`}
            >
              Nghìn đồng (Gốc)
            </button>
          </div>

          {/* Nút Xuất Excel */}
          <button
            type="button"
            onClick={handleExportExcel}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
            title="Xuất bảng này ra file Excel (.xls)"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Xuất Excel</span>
          </button>

          {/* Nút In bảng */}
          <button
            type="button"
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border dark:border-slate-700/80 hover:bg-subtle dark:hover:bg-slate-800/60 text-ink text-xs font-bold transition-colors cursor-pointer"
            title="In bảng báo cáo này"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>In bảng</span>
          </button>
        </div>
      </div>

      {/* Bảng dữ liệu 10 cột */}
      <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
        <table className="w-full text-left border-collapse text-[12.5px]">
          <thead>
            <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 text-ink font-bold">
              <th className="py-2.5 px-3 text-center w-10">TT</th>
              <th className="py-2.5 px-3 min-w-[190px]">Nhóm / Đơn vị</th>
              <th className="py-2.5 px-3 text-right min-w-[125px]">
                Đăng ký KH ({tableUnit === 'nghin' ? 'Nghìn đ' : 'Tỷ'})
              </th>
              <th className="py-2.5 px-3 text-right min-w-[125px]">
                Cùng kỳ 2025 ({tableUnit === 'nghin' ? 'Nghìn đ' : 'Tỷ'})
              </th>
              <th className="py-2.5 px-3 text-right min-w-[110px] text-sky-600 dark:text-sky-400">
                Viện ký
              </th>
              <th className="py-2.5 px-3 text-right min-w-[110px] text-teal-600 dark:text-teal-400">
                Đơn vị ký
              </th>
              <th className="py-2.5 px-3 text-right min-w-[125px] font-black text-primary-600 dark:text-primary-400">
                Tổng ký 2026
              </th>
              <th className="py-2.5 px-3 text-center min-w-[95px]">So KH năm</th>
              <th className="py-2.5 px-3 text-center min-w-[95px]">So Cùng kỳ</th>
              <th className="py-2.5 px-3 min-w-[150px]">Ghi chú</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/60 dark:divide-slate-700/80 font-mono tabular-nums">
            {BANG_TONG_HOP_ROWS.map((row, idx) => {
              if (row.isHeader) {
                return (
                  <tr
                    key={`header-${idx}`}
                    className="bg-subtle/80 dark:bg-slate-800/80 font-black text-primary-600 dark:text-primary-400 text-xs tracking-wider uppercase border-t border-b border-border dark:border-slate-700/80"
                  >
                    <td className="py-2.5 px-3 text-center">{row.group}</td>
                    <td colSpan={9} className="py-2.5 px-3 font-sans">
                      {row.title}
                    </td>
                  </tr>
                );
              }

              let rowClass = 'hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors';
              if (row.isSubtotal) {
                rowClass = 'bg-primary-500/10 dark:bg-primary-950/30 font-black text-ink border-t-2 border-primary-500/30';
              } else if (row.isGrandTotal) {
                rowClass = 'bg-amber-500/15 dark:bg-amber-950/40 font-black text-ink border-t-2 border-b-2 border-amber-500/40';
              }

              return (
                <tr key={`row-${idx}`} className={rowClass}>
                  <td className="py-2.5 px-3 text-center font-bold text-ink-muted">{row.stt}</td>
                  <td className="py-2.5 px-3 font-sans font-semibold">
                    <span className="font-bold text-ink">{row.code}</span>
                    <span className="text-2xs text-ink-muted block font-normal">{row.name}</span>
                  </td>
                  <td className="py-2.5 px-3 text-right text-ink-secondary">{fmt(row.khTy, row.khNghin)}</td>
                  <td className="py-2.5 px-3 text-right text-ink-muted">{fmt(row.ckTy, row.ckNghin)}</td>
                  <td className="py-2.5 px-3 text-right text-sky-600 dark:text-sky-400 font-medium">
                    {fmt(row.vienKyTy, row.vienKyNghin)}
                  </td>
                  <td className="py-2.5 px-3 text-right text-teal-600 dark:text-teal-400 font-medium">
                    {fmt(row.dvKyTy, row.dvKyNghin)}
                  </td>
                  <td className="py-2.5 px-3 text-right font-black text-primary-600 dark:text-primary-400">
                    {fmt(row.tongKyTy, row.tongKyNghin)}
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-2xs font-bold ${
                        (row.pctKH ?? 0) >= 100
                          ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300'
                          : (row.pctKH ?? 0) >= 70
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300'
                          : 'bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300'
                      }`}
                    >
                      {row.pctKH}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-center">
                    <span
                      className={`inline-flex px-1.5 py-0.5 rounded text-2xs font-bold ${
                        (row.pctCungKy ?? 0) >= 100
                          ? 'text-emerald-700 dark:text-emerald-400 font-black'
                          : 'text-rose-700 dark:text-rose-400 font-bold'
                      }`}
                    >
                      {row.pctCungKy}%
                    </span>
                  </td>
                  <td className="py-2.5 px-3 text-2xs text-ink-muted font-sans italic">{row.ghiChu || '—'}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
