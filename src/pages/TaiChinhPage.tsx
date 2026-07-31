import { useMemo } from 'react';
import { Wallet, Banknote, Receipt, PiggyBank, Building2, Clock, AlertTriangle, ShieldCheck, Calculator } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHopDong } from '../services/queries';
import { fetchSlaTheoDoi } from '../services/workflow';
import { fetchDoanhThuTheoThang } from '../services/thongke';
import { phanBoHopDong, timDinhMuc, type PhanBoHopDong } from '../lib/qc2815';
import type { HopDong } from '../types';
import { formatTrieu } from '../lib/utils';
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

export function TaiChinhPage() {
  const { data: hopDongList } = useAsyncData(fetchHopDong, []);
  const { data: doanhThuChart } = useAsyncData(fetchDoanhThuTheoThang, []);
  const { data: slaList } = useAsyncData(() => fetchSlaTheoDoi('hop-dong'), []);

  const tongKeHoach = useMemo(() => hopDongList.reduce((a, b) => a + (b.giaTri || 0), 0), [hopDongList]);
  const tongDaThu = useMemo(() => hopDongList.reduce((a, b) => a + (b.daThanhToan || 0), 0), [hopDongList]);
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
      <PageHeader
        title="[Phân hệ 3] Quản lý Tài chính & Thu chi Hợp đồng"
        subtitle="Quản lý dòng tiền Hợp đồng: Tạm ứng, Tiền về, HĐ VAT, Công nợ & Chế tài Phạt/SLA TCKT (Chương III QC 2815)"
      />

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
          <div className="bg-surface p-2.5 rounded border border-border">
            <p className="font-bold text-ink flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" /> SLA Phòng TCKT:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Giải quyết mỗi công việc thanh quyết toán tối đa <strong>03 ngày làm việc</strong> kể từ khi đủ hồ sơ (Đ.11.1).</p>
          </div>
          <div className="bg-surface p-2.5 rounded border border-border">
            <p className="font-bold text-ink flex items-center gap-1"><AlertTriangle size={14} className="text-amber-600" /> Phạt chậm nộp hồ sơ:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Nộp chậm hồ sơ HĐKT quá 30 ngày: phạt <strong>0,5%</strong> (Nhóm 2) / <strong>0,1%</strong> (Nhóm 3, 4) giá trị HĐ trước thuế (Đ.14.2).</p>
          </div>
          <div className="bg-surface p-2.5 rounded border border-border">
            <p className="font-bold text-ink flex items-center gap-1"><Calculator size={14} className="text-rose-600" /> Nợ tạm ứng quá hạn:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Tính lãi bằng <strong>130% lãi suất áp dụng</strong> kể từ thời điểm quá hạn (Đ.14.2).</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3 mb-6">
        <div className="card p-4 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold text-ink">Biểu đồ Doanh thu & Tiền về theo Tháng (VNĐ)</h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={doanhThuChart}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-subtle)" />
                <XAxis dataKey="thang" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip />
                <Area type="monotone" dataKey="doanhThu" name="Doanh thu" stroke="#2563eb" fill="#2563eb" fillOpacity={0.15} />
                <Area type="monotone" dataKey="tienVe" name="Tiền về thực tế" stroke="#059669" fill="#059669" fillOpacity={0.15} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card p-4 space-y-4">
          <h3 className="text-sm font-bold text-ink flex items-center gap-2 border-b border-border pb-2">
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
                ⚠ {soHdChuaPhanNhom} hợp đồng chưa phân nhóm — vào phân hệ Hợp đồng gán "Nhóm HĐ" để tính phân bổ.
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="border-b border-border bg-subtle p-4">
          <h3 className="font-bold text-sm text-ink">Bảng Tổng hợp Phân bổ Dòng tiền Hợp đồng theo Bảng 1 Quy chế 2815</h3>
          <p className="mt-1 text-2xs text-ink-muted">
            Tạm tính trên số tiền <strong>đã thực thu</strong> theo tỷ lệ Bảng 1 (kèm điều chỉnh đặc thù của từng HĐ).
            Bản phân phối quyết toán chính thức sẽ lập tại nghiệp vụ Tờ phân phối (Giai đoạn 3 kế hoạch số hóa).
          </p>
        </div>
        <table className="w-full min-w-[760px] text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-bold text-ink-muted">
              <th className="p-3">Số Hợp đồng</th>
              <th className="p-3">Tên hợp đồng</th>
              <th className="p-3 text-center">Nhóm HĐ</th>
              <th className="p-3 text-right">Đã thực thu</th>
              <th className="p-3 text-right text-emerald-600">Quỹ Chủ trì</th>
              <th className="p-3 text-right text-blue-600">Quỹ Đơn vị</th>
              <th className="p-3 text-right text-rose-600">Nộp về Viện (CPQL + KHTS)</th>
              <th className="p-3 text-center">SLA TCKT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hopDongList.map((h) => {
              const pb = phanBoTheoHD.get(h.id) ?? null;
              const sla = slaTcktTheoHD.get(h.id);
              const conLai = sla ? Math.ceil((new Date(sla.hanChot).getTime() - Date.now()) / MS_NGAY) : null;
              return (
                <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-ink">{h.soHD}</td>
                  <td className="p-3 text-ink-secondary">{h.ten}</td>
                  <td className="p-3 text-center">
                    {h.nhomHD ? (
                      <span className="inline-flex rounded bg-primary/10 px-2 py-0.5 font-bold text-primary">{h.nhomHD}</span>
                    ) : (
                      <span className="inline-flex rounded bg-amber-100 dark:bg-amber-900/30 px-2 py-0.5 font-bold text-amber-700 dark:text-amber-300">Chưa phân nhóm</span>
                    )}
                  </td>
                  <td className="p-3 text-right font-bold text-ink">{formatTrieu(h.daThanhToan)}</td>
                  {pb ? (
                    <>
                      <td className="p-3 text-right font-bold text-emerald-600">{pb.chuTri != null ? formatTrieu(pb.chuTri) : '—'}</td>
                      <td className="p-3 text-right font-bold text-blue-600">{pb.donVi != null ? formatTrieu(pb.donVi) : '—'}</td>
                      <td className="p-3 text-right font-bold text-rose-600">{formatTrieu(nopVeVien(pb))}</td>
                    </>
                  ) : (
                    <td colSpan={3} className="p-3 text-center text-2xs font-semibold text-ink-muted">
                      {h.nhomHD === 'N1B' ? 'Thực thanh, thực chi (N1b — không áp tỷ lệ Bảng 1)' : 'Gán nhóm HĐ để tính phân bổ'}
                    </td>
                  )}
                  <td className="p-3 text-center">
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
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
