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
import { fetchDoanhThuTheoThang } from '../services/thongke';
import { formatTrieu } from '../lib/utils';

// Phân bổ kinh phí Bảng 1 QĐ 2815
function computeContractDistribution(h: any) {
  const soHD = (h.soHD || '').toUpperCase();
  const val = Number(h.daThanhToan) || 0;
  
  let rate3 = 0.77; // giao Chủ trì (mặc định HĐ dịch vụ)
  let rate4 = 0.10; // giao Đơn vị
  let rate6_7 = 0.13; // tại Viện (CPQL + khấu hao)

  if (soHD.includes('HĐKT') || soHD.includes('HĐGĐ')) {
    rate3 = 0.89;
    rate4 = 0.07;
    rate6_7 = 0.04;
  } else if (soHD.includes('HĐTV') || soHD.includes('HĐGS')) {
    rate3 = 0.78;
    rate4 = 0.13;
    rate6_7 = 0.09;
  } else if (soHD.includes('HĐTN')) {
    rate3 = 0.72;
    rate4 = 0.10;
    rate6_7 = 0.18;
  } else if (soHD.includes('HĐTC') || soHD.includes('HĐXD')) {
    rate3 = 0.89;
    rate4 = 0.06;
    rate6_7 = 0.05;
  } else if (soHD.includes('HĐTB')) {
    rate3 = 0.92;
    rate4 = 0.04;
    rate6_7 = 0.04;
  }

  return {
    chuTri: val * rate3,
    donVi: val * rate4,
    vien: val * rate6_7,
  };
}

export function TaiChinhPage() {
  const { data: hopDongList } = useAsyncData(fetchHopDong, []);
  const { data: doanhThuChart } = useAsyncData(fetchDoanhThuTheoThang, []);

  const tongKeHoach = useMemo(() => hopDongList.reduce((a, b) => a + (b.giaTri || 0), 0), [hopDongList]);
  const tongDaThu = useMemo(() => hopDongList.reduce((a, b) => a + (b.daThanhToan || 0), 0), [hopDongList]);
  const tongCongNo = useMemo(() => Math.max(0, tongKeHoach - tongDaThu), [tongKeHoach, tongDaThu]);

  const phanBoVien = useMemo(() => {
    return hopDongList.reduce((acc, h) => {
      const d = computeContractDistribution(h);
      return acc + d.vien;
    }, 0);
  }, [hopDongList]);

  return (
    <div>
      <PageHeader
        title="[Phân hệ 3] Quản lý Tài chính & Thu chi Hợp đồng"
        subtitle="Quản lý dòng tiền Hợp đồng: Tạm ứng, Tiền về, HĐ VAT, Công nợ, Lợi nhuận Margin & Chế tài Phạt/SLA TCKT (Chương III QC 2815)"
      />

      <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Kế hoạch doanh thu" value={formatTrieu(tongKeHoach)} icon={Wallet} tone="primary" />
        <KpiCard label="Thực thu (Tiền về)" value={formatTrieu(tongDaThu)} icon={Banknote} tone="success" />
        <KpiCard label="Công nợ phải thu" value={formatTrieu(tongCongNo)} icon={Receipt} tone="warning" />
        <KpiCard label="Trích nộp về Viện (QC 2815)" value={formatTrieu(phanBoVien)} icon={PiggyBank} tone="accent" />
      </div>

      {/* SLA & Penalties Banner */}
      <div className="mb-4 rounded-xl border border-rose-500/20 bg-rose-50/40 dark:bg-rose-900/10 p-4 text-xs space-y-2 text-ink">
        <div className="flex items-center justify-between font-bold text-rose-700 dark:text-rose-300">
          <span className="flex items-center gap-2 text-sm">
            <Clock size={18} /> Cam kết SLA Chứng từ TCKT & Chế tài Phạt Chậm nộp / Nợ Quá hạn (QC 2815)
          </span>
          <span className="rounded-full bg-rose-600 px-3 py-0.5 text-white text-2xs font-bold">
            Kiểm soát tự động
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-ink-secondary">
          <div className="bg-surface p-2.5 rounded border border-border">
            <p className="font-bold text-ink flex items-center gap-1"><ShieldCheck size={14} className="text-emerald-600" /> SLA Phòng TCKT:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Xử lý chứng từ thanh toán tối đa <strong>03 ngày làm việc</strong>.</p>
          </div>
          <div className="bg-surface p-2.5 rounded border border-border">
            <p className="font-bold text-ink flex items-center gap-1"><AlertTriangle size={14} className="text-amber-600" /> Phạt Chậm nộp Hồ sơ:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Trừ kinh phí <strong>0.5% - 1%</strong> nếu chậm nộp hợp đồng gốc quá 30 ngày.</p>
          </div>
          <div className="bg-surface p-2.5 rounded border border-border">
            <p className="font-bold text-ink flex items-center gap-1"><Calculator size={14} className="text-rose-600" /> Phạt Nợ Tạm ứng Quá hạn:</p>
            <p className="text-2xs text-ink-muted mt-0.5">Tính lãi phạt <strong>130% lãi suất Ngân hàng</strong> cho khoản quá hạn.</p>
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
            Tỷ suất Lợi nhuận Margin theo Phân hệ Hợp đồng
          </h3>
          <div className="space-y-3 text-xs">
            <div>
              <div className="flex justify-between font-bold text-ink mb-1">
                <span>1. Phân hệ Phục vụ QLNN</span>
                <span className="text-emerald-600">Margin 22%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full w-[22%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-ink mb-1">
                <span>2. Phân hệ Tư vấn & Kiểm định</span>
                <span className="text-primary">Margin 35%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[35%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-ink mb-1">
                <span>3. Phân hệ Thi công Xây dựng</span>
                <span className="text-amber-600">Margin 18%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full w-[18%]" />
              </div>
            </div>
            <div>
              <div className="flex justify-between font-bold text-ink mb-1">
                <span>4. Phân hệ Cung ứng Thiết bị</span>
                <span className="text-indigo-600">Margin 14%</span>
              </div>
              <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
                <div className="bg-indigo-500 h-full w-[14%]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card overflow-x-auto">
        <div className="border-b border-border bg-subtle p-4">
          <h3 className="font-bold text-sm text-ink">Bảng Tổng hợp Phân bổ Dòng tiền Hợp đồng theo Bảng 1 Quy chế 2815</h3>
        </div>
        <table className="w-full min-w-[700px] text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-muted/50 font-bold text-ink-muted">
              <th className="p-3">Số Hợp đồng</th>
              <th className="p-3">Tên hợp đồng</th>
              <th className="p-3 text-right">Đã thực thu</th>
              <th className="p-3 text-right text-emerald-600">Quỹ Chủ trì</th>
              <th className="p-3 text-right text-blue-600">Quỹ Đơn vị</th>
              <th className="p-3 text-right text-rose-600">Nộp về Viện (CPQL + KHTS)</th>
              <th className="p-3 text-center">SLA TCKT</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {hopDongList.map((h) => {
              const dist = computeContractDistribution(h);
              return (
                <tr key={h.id} className="hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-bold text-ink">{h.soHD}</td>
                  <td className="p-3 text-ink-secondary">{h.ten}</td>
                  <td className="p-3 text-right font-bold text-ink">{formatTrieu(h.daThanhToan)}</td>
                  <td className="p-3 text-right font-bold text-emerald-600">{formatTrieu(dist.chuTri)}</td>
                  <td className="p-3 text-right font-bold text-blue-600">{formatTrieu(dist.donVi)}</td>
                  <td className="p-3 text-right font-bold text-rose-600">{formatTrieu(dist.vien)}</td>
                  <td className="p-3 text-center">
                    <span className="inline-flex items-center gap-1 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 text-2xs font-bold">
                      <Clock size={11} /> 1.5 ngày / SLA 3d
                    </span>
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
