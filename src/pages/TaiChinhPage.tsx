import { useMemo, useState } from 'react';
import {
  Wallet,
  Banknote,
  Receipt,
  PiggyBank,
  Building2,
  Clock,
  AlertTriangle,
  ShieldCheck,
  Calculator,
  Search,
  Award,
  CircleDollarSign,
  TrendingUp,
  FileCheck,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { FilterSelect } from '../components/TableToolbar';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHopDong, fetchDonViOptions } from '../services/queries';
import { fetchSlaTheoDoi } from '../services/workflow';
import { fetchDoanhThuTheoThang } from '../services/thongke';
import { fetchAllThuongPhat, fetchAllTamUng } from '../services/chitiet';
import { phanBoHopDong, timDinhMuc, type PhanBoHopDong } from '../lib/qc2815';
import type { HopDong } from '../types';
import { formatTrieu, formatNgay } from '../lib/utils';
import { cn } from '../lib/utils';

/**
 * Phân bổ dòng tiền của một hợp đồng theo Bảng 1 QC 2815, tạm tính trên số ĐÃ THỰC THU.
 * Trả về null khi chưa gán nhóm HĐ hoặc nhóm thanh toán thực thanh thực chi (N1b) —
 * các trường hợp này KHÔNG được đoán tỷ lệ, hiển thị rõ cho người dùng xử lý.
 */
function phanBoTheoThucThu(h: HopDong): PhanBoHopDong | null {
  return phanBoHopDong(h.nhomHD, h.daThanhToan || 0, {
    loaiDacThu: h.loaiDacThu,
    phanVienXa: h.phanVienXa,
    giamTheoYeuCauDonVi: h.giamTheoYeuCauDonVi,
    capKy: h.capKy,
  });
}

/** Phần nộp về Viện = CPQL, lợi nhuận, chi khác (cột 6) + khấu hao TSCĐ (cột 7). */
function nopVeVien(pb: PhanBoHopDong): number {
  return pb.cpqlLnChiKhac + pb.khtscd;
}

const MS_NGAY = 24 * 3600 * 1000;

export function TaiChinhPage({
  showHeader = true,
  onSelectHopDong,
}: {
  showHeader?: boolean;
  onSelectHopDong?: (hd: HopDong) => void;
} = {}) {
  const { data: hopDongList } = useAsyncData(fetchHopDong, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: doanhThuChart } = useAsyncData(fetchDoanhThuTheoThang, []);
  const { data: slaList } = useAsyncData(() => fetchSlaTheoDoi('hop-dong'), []);
  const { data: thuongPhatList } = useAsyncData(fetchAllThuongPhat, []);
  const { data: tamUngList } = useAsyncData(fetchAllTamUng, []);

  const [filterDonVi, setFilterDonVi] = useState('');
  const [filterDongTien, setFilterDongTien] = useState('da-thu'); // Mặc định ưu tiên hiện HĐ có tiền về
  const [searchText, setSearchText] = useState('');
  const [activeSubTab, setActiveSubTab] = useState<'phan-bo' | 'thuong-phat' | 'tam-ung'>('phan-bo');

  // Lọc danh sách hợp đồng theo đơn vị, dòng tiền & tìm kiếm
  const filteredHopDongList = useMemo(() => {
    const hasSearch = searchText.trim().length > 0;
    return hopDongList
      .filter((h) => {
        if (filterDonVi && String(h.donViId) !== filterDonVi) return false;
        // Khi người dùng gõ tìm kiếm đích danh, ưu tiên hiển thị kết quả không bị chặn bởi bộ lọc dòng tiền
        if (!hasSearch) {
          if (filterDongTien === 'da-thu' && (h.daThanhToan || 0) <= 0) return false;
          if (filterDongTien === 'chua-thu' && (h.daThanhToan || 0) > 0) return false;
          if (filterDongTien === 'cong-no' && Math.max(0, (h.giaTri || 0) - (h.daThanhToan || 0)) <= 0) return false;
        }
        if (hasSearch) {
          const q = searchText.trim().toLowerCase();
          const matchSo = h.soHD?.toLowerCase().includes(q);
          const matchTen = h.ten?.toLowerCase().includes(q);
          const matchKhach = h.khachHang?.toLowerCase().includes(q);
          const matchDonVi = h.donViThucHien?.toLowerCase().includes(q);
          if (!matchSo && !matchTen && !matchKhach && !matchDonVi) return false;
        }
        return true;
      })
      .sort((a, b) => {
        // Ưu tiên hợp đồng đã có tiền về lên đầu, sau đó sắp theo ngày ký mới nhất
        if ((b.daThanhToan || 0) !== (a.daThanhToan || 0)) {
          return (b.daThanhToan || 0) - (a.daThanhToan || 0);
        }
        return (b.ngayKy || '').localeCompare(a.ngayKy || '');
      });
  }, [hopDongList, filterDonVi, filterDongTien, searchText]);

  const tongKeHoach = useMemo(() => filteredHopDongList.reduce((a, b) => a + (b.giaTri || 0), 0), [filteredHopDongList]);
  const tongDaThu = useMemo(() => filteredHopDongList.reduce((a, b) => a + (b.daThanhToan || 0), 0), [filteredHopDongList]);
  const tongCongNo = useMemo(() => Math.max(0, tongKeHoach - tongDaThu), [tongKeHoach, tongDaThu]);

  const phanBoTheoHD = useMemo(() => {
    const m = new Map<string, PhanBoHopDong | null>();
    for (const h of hopDongList) m.set(h.id, phanBoTheoThucThu(h));
    return m;
  }, [hopDongList]);

  const tongNopVien = useMemo(() => {
    let s = 0;
    for (const pb of phanBoTheoHD.values()) if (pb) s += nopVeVien(pb);
    return s;
  }, [phanBoTheoHD]);

  const soHdChuaPhanNhom = useMemo(
    () => hopDongList.filter((h) => !h.nhomHD).length,
    [hopDongList],
  );

  // SLA TCKT (Đ.11.1 — 3 ngày làm việc) theo từng hợp đồng, lấy bản ghi đang chạy/mới nhất.
  const slaTcktTheoHD = useMemo(() => {
    const m = new Map<string, { trangThai: string; hanChot: string }>();
    for (const s of slaList) {
      if (!s.tenSla.startsWith('TCKT')) continue;
      const cu = m.get(s.doiTuongId);
      if (!cu || s.trangThai === 'dang-chay') m.set(s.doiTuongId, { trangThai: s.trangThai, hanChot: s.hanChot });
    }
    return m;
  }, [slaList]);

  // Cơ cấu doanh thu theo nhóm HĐ (thay khối "margin" ước lượng trước đây bằng số thật).
  const coCauNhom = useMemo(() => {
    const nhoms = [
      { nhom: 1, ten: 'Nhóm 1 — Phục vụ QLNN', mau: 'bg-emerald-500', mauChu: 'text-emerald-600' },
      { nhom: 2, ten: 'Nhóm 2 — Tư vấn, kiểm định, thí nghiệm', mau: 'bg-primary', mauChu: 'text-primary' },
      { nhom: 3, ten: 'Nhóm 3 — Thi công xây dựng', mau: 'bg-amber-500', mauChu: 'text-amber-600' },
      { nhom: 4, ten: 'Nhóm 4 — Cung ứng vật tư, thiết bị', mau: 'bg-indigo-500', mauChu: 'text-indigo-600' },
    ].map((n) => {
      const giaTri = hopDongList
        .filter((h) => timDinhMuc(h.nhomHD)?.nhom === n.nhom)
        .reduce((a, b) => a + (b.giaTri || 0), 0);
      return { ...n, giaTri };
    });
    const tong = nhoms.reduce((a, b) => a + b.giaTri, 0);
    return { nhoms, tong };
  }, [hopDongList]);

  return (
    <div>
      {showHeader && (
        <PageHeader
          title="Quản lý Tài chính & Thu chi Hợp đồng"
          subtitle="Quản lý dòng tiền Hợp đồng: Tạm ứng, Tiền về, HĐ VAT, Công nợ & Chế tài Phạt/SLA TCKT (Chương III QC 2815)"
        />
      )}

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Kế hoạch doanh thu" value={formatTrieu(tongKeHoach)} icon={Wallet} tone="primary" />
        <KpiCard label="Thực thu (Tiền về)" value={formatTrieu(tongDaThu)} icon={Banknote} tone="success" />
        <KpiCard label="Công nợ phải thu" value={formatTrieu(tongCongNo)} icon={Receipt} tone="warning" />
        <KpiCard label="Trích nộp về Viện (Bảng 1)" value={formatTrieu(tongNopVien)} icon={PiggyBank} tone="accent" />
      </div>

      {/* SLA & Penalties — mốc quy định QC 2815 (nội dung tĩnh trích quy chế, số liệu theo dõi ở bảng dưới) */}
      <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-50/40 dark:bg-rose-900/10 p-4 text-xs space-y-2 text-ink">
        <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
          <span className="flex items-center gap-2 text-sm">
            <Clock size={18} /> Mốc SLA & Chế tài theo QC 2815 (Đ.11.1, Đ.14.2)
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-ink-secondary">
          <div className="bg-surface p-2.5 rounded border border-border dark:border-slate-700/80">
            <p className="font-bold text-ink flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" /> SLA Phòng TCKT:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Giải quyết mỗi công việc thanh quyết toán tối đa <strong>03 ngày làm việc</strong> kể từ khi đủ hồ sơ (Đ.11.1).</p>
          </div>
          <div className="bg-surface p-2.5 rounded border border-border dark:border-slate-700/80">
            <p className="font-bold text-ink flex items-center gap-1"><AlertTriangle size={14} className="text-amber-600" /> Phạt chậm nộp hồ sơ:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Nộp chậm hồ sơ HĐKT quá 30 ngày: phạt <strong>0,5%</strong> (Nhóm 2) / <strong>0,1%</strong> (Nhóm 3, 4) giá trị HĐ trước thuế (Đ.14.2).</p>
          </div>
          <div className="bg-surface p-2.5 rounded border border-border dark:border-slate-700/80">
            <p className="font-bold text-ink flex items-center gap-1"><Calculator size={14} className="text-rose-600" /> Nợ tạm ứng quá hạn:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Tính lãi bằng <strong>130% lãi suất áp dụng</strong> kể từ thời điểm quá hạn (Đ.14.2).</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        <div className="card p-4 lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2">
              <TrendingUp size={16} className="text-primary" />
              Biểu đồ Doanh thu & Tiền về theo Tháng năm 2026
            </h3>
            <span className="text-2xs text-ink-muted">Đơn vị: Triệu VNĐ</span>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={doanhThuChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="thang" stroke="var(--text-muted)" fontSize={11} />
                <YAxis
                  stroke="var(--text-muted)"
                  fontSize={11}
                  tickFormatter={(v) => `${Math.round(v / 1000)} tỷ`}
                />
                <Tooltip
                  formatter={(val: any, name: any) => [
                    formatTrieu(Number(val) || 0),
                    name === 'doanhThu' ? 'Kế hoạch doanh thu' : 'Tiền về thực tế',
                  ]}
                  contentStyle={{
                    backgroundColor: 'var(--bg-surface)',
                    borderColor: 'var(--border-default)',
                    borderRadius: '0.75rem',
                    fontSize: '12px',
                  }}
                />
                <Legend
                  formatter={(value) => (value === 'doanhThu' ? 'Kế hoạch doanh thu' : 'Tiền về thực tế')}
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                />
                <Area
                  type="monotone"
                  dataKey="doanhThu"
                  name="doanhThu"
                  stroke="#2563eb"
                  fill="#2563eb"
                  fillOpacity={0.15}
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="tienVe"
                  name="tienVe"
                  stroke="#059669"
                  fill="#059669"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-border dark:border-slate-700/80 pb-2">
            <Building2 size={16} className="text-primary" />
            Cơ cấu giá trị HĐ theo Nhóm (Bảng 1 QC 2815)
          </h3>
          <div className="space-y-3 text-xs">
            {coCauNhom.nhoms.map((n) => {
              const pct = coCauNhom.tong > 0 ? Math.round((n.giaTri / coCauNhom.tong) * 100) : 0;
              return (
                <div key={n.nhom}>
                  <div className="flex justify-between font-bold text-ink mb-1">
                    <span>{n.ten}</span>
                    <span className={n.mauChu}>{formatTrieu(n.giaTri)} · {pct}%</span>
                  </div>
                  <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                    <div className={cn(n.mau, 'h-full')} style={{ width: `${pct}%` }} />
                  </div>
                </div>
              );
            })}
            {coCauNhom.tong === 0 && (
              <p className="text-ink-muted">Chưa có hợp đồng nào được gán nhóm HĐ (Bảng 1).</p>
            )}
            {soHdChuaPhanNhom > 0 && (
              <p className="text-2xs text-amber-600 dark:text-amber-400 font-semibold">
                ⚠ {soHdChuaPhanNhom} hợp đồng chưa phân nhóm — vào mục Hợp đồng gán "Nhóm HĐ" để tính phân bổ.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Sub-tabs chuyên đề Tài chính */}
      <div className="mb-4 flex flex-wrap gap-1.5 border-b border-border dark:border-slate-700/80 pb-2">
        <button
          type="button"
          onClick={() => setActiveSubTab('phan-bo')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
            activeSubTab === 'phan-bo'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-muted text-ink-muted hover:text-ink'
          )}
        >
          <CircleDollarSign size={14} /> Phân bổ Dòng tiền & SLA TCKT ({filteredHopDongList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('thuong-phat')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
            activeSubTab === 'thuong-phat'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-muted text-ink-muted hover:text-ink'
          )}
        >
          <Award size={14} /> Sổ Thưởng / Phạt HĐ — Điều 13-14 ({thuongPhatList.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveSubTab('tam-ung')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-3 py-1.5 text-xs font-bold transition-all',
            activeSubTab === 'tam-ung'
              ? 'bg-primary text-white shadow-2xs'
              : 'bg-muted text-ink-muted hover:text-ink'
          )}
        >
          <Calculator size={14} /> Quản lý Tạm ứng & Chế tài 130% ({tamUngList.length})
        </button>
      </div>

      {/* Sub-tab 1: Bảng Tổng hợp Phân bổ Dòng tiền */}
      {activeSubTab === 'phan-bo' && (
        <>
          {/* Toolbar lọc đơn vị, dòng tiền & tìm kiếm */}
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-2 flex-1 max-w-2xl">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  value={searchText}
                  onChange={(e) => setSearchText(e.target.value)}
                  placeholder="Tìm theo số HĐ, tên công trình, khách hàng..."
                  className="w-full rounded-lg border border-border dark:border-slate-700/80 bg-surface pl-8 pr-3 py-1.5 text-xs text-ink placeholder:text-ink-muted outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500 transition-all"
                />
              </div>
              <FilterSelect
                value={filterDongTien}
                onChange={setFilterDongTien}
                allLabel="-- Tất cả hợp đồng --"
                options={[
                  { value: 'da-thu', label: '✅ Có tiền về thực thu (> 0đ)' },
                  { value: 'cong-no', label: '⏳ Còn công nợ phải thu' },
                  { value: 'chua-thu', label: '⚪ Chưa thanh toán (0đ)' },
                ]}
              />
              {donViOptions.length > 0 && (
                <FilterSelect
                  value={filterDonVi}
                  onChange={setFilterDonVi}
                  allLabel="-- Tất cả đơn vị --"
                  options={donViOptions.map((d) => ({ value: d.id, label: d.ten }))}
                />
              )}
            </div>
            <span className="text-2xs font-semibold text-ink-muted">
              Hiển thị: <strong>{filteredHopDongList.length}</strong> / {hopDongList.length} hợp đồng
            </span>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-4">
              <h3 className="font-bold text-sm text-ink">Bảng Tổng hợp Phân bổ Dòng tiền Hợp đồng theo Bảng 1 Quy chế 2815</h3>
              <p className="mt-1 text-2xs text-ink-muted">
                Tạm tính trên số tiền <strong>đã thực thu</strong> theo tỷ lệ Bảng 1 (kèm điều chỉnh đặc thù của từng HĐ).
                Bản phân phối quyết toán chính thức sẽ lập tại nghiệp vụ Tờ phân phối (Giai đoạn 3 kế hoạch số hóa).
              </p>
            </div>
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <table className="w-full min-w-[920px] text-left text-xs">
              <thead className="sticky top-0 z-10 border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-[#1f2332]">
                <tr className="font-bold text-ink-muted">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Số Hợp đồng</th>
                  <th className="p-3">Tên hợp đồng & Đơn vị</th>
                  <th className="p-3 text-center">Nhóm HĐ</th>
                  <th className="p-3 text-right">Giá trị HĐ</th>
                  <th className="p-3 text-right text-emerald-600 dark:text-emerald-400">Đã thực thu</th>
                  <th className="p-3 text-right text-amber-600 dark:text-amber-400">Còn lại (Công nợ)</th>
                  <th className="p-3 text-right text-blue-600 dark:text-blue-400">Quỹ Chủ trì</th>
                  <th className="p-3 text-right text-indigo-600 dark:text-indigo-400">Quỹ Đơn vị</th>
                  <th className="p-3 text-right text-rose-600 dark:text-rose-400">Nộp Viện</th>
                  <th className="p-3 text-center">SLA TCKT</th>
                  <th className="p-3 text-center w-20">Chi tiết</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-700/80">
                {filteredHopDongList.length === 0 ? (
                  <tr>
                    <td colSpan={12} className="p-8 text-center text-ink-muted text-xs">
                      Không tìm thấy hợp đồng nào phù hợp với bộ lọc hiện tại.
                    </td>
                  </tr>
                ) : (
                  filteredHopDongList.map((h, idx) => {
                    const pb = phanBoTheoHD.get(h.id) ?? null;
                    const sla = slaTcktTheoHD.get(h.id);
                    const conLai = sla ? Math.ceil((new Date(sla.hanChot).getTime() - Date.now()) / MS_NGAY) : null;
                    const congNo = Math.max(0, (h.giaTri || 0) - (h.daThanhToan || 0));
                    return (
                      <tr
                        key={h.id}
                        onClick={() => onSelectHopDong?.(h)}
                        className={cn(
                          'hover:bg-muted/30 dark:hover:bg-slate-800/40 transition-colors',
                          onSelectHopDong && 'cursor-pointer'
                        )}
                      >
                        <td className="p-3 text-center text-ink-muted tabular-nums">{idx + 1}</td>
                        <td className="p-3 font-bold text-ink font-mono whitespace-nowrap">{h.soHD}</td>
                        <td className="p-3 text-ink-secondary">
                          <div className="font-medium text-ink">{h.ten}</div>
                          <div className="flex items-center gap-2 text-[10px] text-ink-muted mt-0.5">
                            {h.donViThucHien && <span>🏢 {h.donViThucHien}</span>}
                            {h.khachHang && <span>• 👤 {h.khachHang}</span>}
                          </div>
                        </td>
                        <td className="p-3 text-center">
                          {h.nhomHD ? (
                            <span className="inline-flex rounded bg-primary/10 px-2 py-0.5 font-bold text-primary dark:text-primary-300">{h.nhomHD}</span>
                          ) : (
                            <span className="inline-flex rounded bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-300">Chưa phân nhóm</span>
                          )}
                        </td>
                        <td className="p-3 text-right font-semibold text-ink tabular-nums">{formatTrieu(h.giaTri)}</td>
                        <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400 tabular-nums">
                          {formatTrieu(h.daThanhToan)}
                        </td>
                        <td className="p-3 text-right font-bold text-amber-600 dark:text-amber-400 tabular-nums">
                          {formatTrieu(congNo)}
                        </td>
                        {pb ? (
                          <>
                            <td className="p-3 text-right font-bold text-blue-600 dark:text-blue-400 tabular-nums">{pb.chuTri != null ? formatTrieu(pb.chuTri) : '—'}</td>
                            <td className="p-3 text-right font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">{pb.donVi != null ? formatTrieu(pb.donVi) : '—'}</td>
                            <td className="p-3 text-right font-bold text-rose-600 dark:text-rose-400 tabular-nums">{formatTrieu(nopVeVien(pb))}</td>
                          </>
                        ) : (
                          <td colSpan={3} className="p-3 text-center text-2xs font-semibold text-ink-muted">
                            {h.nhomHD === 'N1B' ? 'Thực thanh, thực chi (N1b — không áp tỷ lệ Bảng 1)' : 'Gán nhóm HĐ để tính phân bổ'}
                          </td>
                        )}
                        <td className="p-3 text-center whitespace-nowrap">
                          {sla ? (
                            sla.trangThai === 'dat' ? (
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-2xs font-bold">
                                <ShieldCheck size={11} /> Đạt
                              </span>
                            ) : sla.trangThai === 'vi-pham' || (conLai != null && conLai < 0) ? (
                              <span className="inline-flex items-center gap-1 rounded bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 px-2 py-0.5 text-2xs font-bold">
                                <AlertTriangle size={11} /> Quá hạn {conLai != null && conLai < 0 ? `${-conLai} ngày` : ''}
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 rounded bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-2 py-0.5 text-2xs font-bold">
                                <Clock size={11} /> Còn {conLai} ngày
                              </span>
                            )
                          ) : (
                            <span className="text-2xs text-ink-muted">—</span>
                          )}
                        </td>
                        <td className="p-3 text-center whitespace-nowrap">
                          {onSelectHopDong && (
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onSelectHopDong(h);
                              }}
                              className="inline-flex items-center gap-1 rounded border border-border dark:border-slate-700/80 bg-surface px-2 py-1 text-2xs font-bold text-primary hover:bg-primary/10 transition-colors"
                              title="Xem chi tiết Hợp đồng & Đợt thanh toán trong SlidePanel"
                            >
                              <ExternalLink size={11} /> Xem
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {/* Sub-tab 2: Sổ Thưởng / Phạt Hợp đồng (Điều 13-14) */}
      {activeSubTab === 'thuong-phat' && (
        <div className="card overflow-hidden">
          <div className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Award size={16} className="text-amber-600" />
              Sổ Quyết định Thưởng / Phạt Hợp đồng theo Điều 13-14 Quy chế 2815/QĐ-VKH
            </h3>
            <p className="mt-1 text-2xs text-ink-muted">
              Ghi nhận các quyết định khen thưởng vượt tiến độ, thu hồi công nợ xuất sắc hoặc chế tài phạt chậm nộp hồ sơ, chậm nộp chứng từ quyết toán.
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-[#1f2332]">
                <tr className="font-bold text-ink-muted">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Loại</th>
                  <th className="p-3">Hợp đồng</th>
                  <th className="p-3">Lý do quyết định (QC 2815)</th>
                  <th className="p-3 text-right">Mức thưởng / phạt</th>
                  <th className="p-3">Ngày quyết định</th>
                  <th className="p-3">Người quyết định</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-700/80">
                {thuongPhatList.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-6 text-center text-ink-muted">Chưa có quyết định thưởng phạt nào.</td>
                  </tr>
                ) : (
                  thuongPhatList.map((tp, idx) => (
                    <tr key={tp.id} className="hover:bg-muted/30 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-center text-ink-muted">{idx + 1}</td>
                      <td className="p-3">
                        {tp.loai === 'thuong' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 font-bold text-2xs">
                            <Award size={12} /> Khen thưởng
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 font-bold text-2xs">
                            <AlertTriangle size={12} /> Chế tài phạt
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-semibold text-ink">
                        <div>{tp.soHD}</div>
                        <div className="text-[10px] text-ink-muted truncate max-w-xs">{tp.tenHopDong}</div>
                      </td>
                      <td className="p-3 text-ink-secondary">{tp.lyDo}</td>
                      <td className="p-3 text-right font-bold tabular-nums">
                        {tp.soTien != null ? (
                          <span className={tp.loai === 'thuong' ? 'text-emerald-600 dark:text-emerald-400' : 'text-rose-600 dark:text-rose-400'}>
                            {tp.loai === 'thuong' ? '+' : '-'}{formatTrieu(tp.soTien)}
                          </span>
                        ) : tp.tyLePhanTram != null ? (
                          <span className="text-amber-600 dark:text-amber-400">{tp.tyLePhanTram}% giá trị HĐ</span>
                        ) : '—'}
                      </td>
                      <td className="p-3 text-ink-muted">{formatNgay(tp.ngayQuyetDinh)}</td>
                      <td className="p-3 text-ink font-medium">{tp.nguoiQuyetDinh}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Sub-tab 3: Quản lý Tạm ứng & Lãi suất 130% */}
      {activeSubTab === 'tam-ung' && (
        <div className="card overflow-hidden">
          <div className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 p-4">
            <h3 className="font-bold text-sm text-ink flex items-center gap-2">
              <Calculator size={16} className="text-rose-600" />
              Sổ Quản lý Tạm ứng Hợp đồng & Chế tài Lãi suất 130% (Điều 7.7, Điều 14.2)
            </h3>
            <p className="mt-1 text-2xs text-ink-muted">
              Theo dõi việc tạm ứng kinh phí trước từ Viện. Quá hạn hoàn ứng sẽ tự động bị áp chế tài tính lãi bằng <strong>130% lãi suất áp dụng</strong> kể từ thời điểm quá hạn (Đ.14.2).
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-[#1f2332]">
                <tr className="font-bold text-ink-muted">
                  <th className="p-3 w-10 text-center">#</th>
                  <th className="p-3">Hợp đồng</th>
                  <th className="p-3">Chủ trì nhận tạm ứng</th>
                  <th className="p-3 text-right">Số tiền tạm ứng</th>
                  <th className="p-3">Ngày tạm ứng</th>
                  <th className="p-3">Hạn hoàn ứng</th>
                  <th className="p-3 text-center">Trạng thái & Chế tài</th>
                  <th className="p-3">Ghi chú</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border dark:divide-slate-700/80">
                {tamUngList.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-6 text-center text-ink-muted">Chưa có khoản tạm ứng nào.</td>
                  </tr>
                ) : (
                  tamUngList.map((tu, idx) => (
                    <tr key={tu.id} className="hover:bg-muted/30 dark:hover:bg-slate-800/40">
                      <td className="p-3 text-center text-ink-muted">{idx + 1}</td>
                      <td className="p-3 font-semibold text-ink">
                        <div>{tu.soHD}</div>
                        <div className="text-[10px] text-ink-muted truncate max-w-xs">{tu.tenHopDong}</div>
                      </td>
                      <td className="p-3 text-ink font-medium">{tu.nhanSu}</td>
                      <td className="p-3 text-right font-bold text-ink tabular-nums">{formatTrieu(tu.soTien)}</td>
                      <td className="p-3 text-ink-muted">{formatNgay(tu.ngayTamUng)}</td>
                      <td className="p-3 text-ink font-medium">{formatNgay(tu.hanHoan)}</td>
                      <td className="p-3 text-center">
                        {tu.trangThai === 'da-hoan' ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 font-bold text-2xs">
                            <ShieldCheck size={12} /> Đã hoàn ứng
                          </span>
                        ) : tu.quaHanNgay > 0 ? (
                          <span className="inline-flex items-center gap-1 rounded bg-rose-100 dark:bg-rose-900/40 text-rose-800 dark:text-rose-300 px-2 py-0.5 font-bold text-2xs">
                            <AlertTriangle size={12} /> Quá hạn {tu.quaHanNgay} ngày (Áp lãi 130%)
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 px-2 py-0.5 font-bold text-2xs">
                            <Clock size={12} /> Trong hạn hoàn
                          </span>
                        )}
                      </td>
                      <td className="p-3 text-ink-muted text-2xs">{tu.ghiChu}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
