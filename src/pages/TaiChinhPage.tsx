import { useMemo } from 'react';
import { Wallet, Banknote, Receipt, PiggyBank, Building2 } from 'lucide-react';
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
  const { data: hopDongList, loading: contractsLoading } = useAsyncData(fetchHopDong, []);
  const { data: doanhThuThang, loading: flowLoading } = useAsyncData(fetchDoanhThuTheoThang, []);

  // Tính toán kết quả kinh doanh và phân bổ theo từng đơn vị hạch toán
  const unitStats = useMemo(() => {
    const map = new Map<string, { tenDonVi: string; thucThu: number; chuTri: number; donVi: number; vien: number; congNo: number }>();
    
    hopDongList.forEach((h) => {
      const ten = h.donViThucHien || 'Khác';
      const cur = map.get(ten) ?? { tenDonVi: ten, thucThu: 0, chuTri: 0, donVi: 0, vien: 0, congNo: 0 };
      
      const tt = h.daThanhToan || 0;
      const cn = Math.max(0, (h.giaTri || 0) - tt);
      const dist = computeContractDistribution(h);
      
      cur.thucThu += tt;
      cur.chuTri += dist.chuTri;
      cur.donVi += dist.donVi;
      cur.vien += dist.vien;
      cur.congNo += cn;
      
      map.set(ten, cur);
    });
    
    return [...map.values()].sort((a, b) => b.thucThu - a.thucThu);
  }, [hopDongList]);

  // Tính toán tổng cộng toàn Viện
  const totals = useMemo(() => {
    let thucThu = 0;
    let chuTri = 0;
    let donVi = 0;
    let vien = 0;
    let congNo = 0;
    unitStats.forEach((u) => {
      thucThu += u.thucThu;
      chuTri += u.chuTri;
      donVi += u.donVi;
      vien += u.vien;
      congNo += u.congNo;
    });
    return { thucThu, chuTri, donVi, vien, congNo };
  }, [unitStats]);

  const loading = contractsLoading || flowLoading;

  return (
    <div>
      <PageHeader
        title="Kết quả kinh doanh"
        subtitle="Báo cáo kết quả hoạt động kinh doanh, thực thu, công nợ và phân bổ kinh phí theo Bảng 1 QĐ 2815"
      />

      {/* KPI Cards theo đúng cấu trúc phân bổ */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <KpiCard icon={Wallet} label="Doanh thu thực thu" value={formatTrieu(totals.thucThu)} tone="primary" />
        <KpiCard icon={Building2} label="Giao Chủ trì (Team)" value={formatTrieu(totals.chuTri)} tone="success" />
        <KpiCard icon={PiggyBank} label="Trích giữ lại Đơn vị" value={formatTrieu(totals.donVi)} tone="accent" />
        <KpiCard icon={Receipt} label="Trích nộp về Viện" value={formatTrieu(totals.vien)} tone="warning" />
        <KpiCard icon={Banknote} label="Công nợ phải thu" value={formatTrieu(totals.congNo)} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-6 xl:grid-cols-3">
        {/* Dòng tiền thực thu */}
        <div className="card p-4 xl:col-span-1">
          <h3 className="mb-3 text-sm font-bold text-ink">Dòng tiền thực thu lũy kế theo tháng (tỷ đồng)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={doanhThuThang}>
              <defs>
                <linearGradient id="gradTC" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00668c" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00668c" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="thang" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }} />
              <Area type="monotone" dataKey="thucHien" name="Thực thu" stroke="#00668c" strokeWidth={2} fill="url(#gradTC)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Bảng phân bổ chi tiết kết quả kinh doanh theo đơn vị */}
        <div className="card overflow-hidden xl:col-span-2">
          <h3 className="px-4 py-3.5 text-sm font-bold border-b border-border text-ink bg-subtle/50">
            Chi tiết kết quả kinh doanh & Phân bổ kinh phí theo các Đơn vị (triệu đồng)
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="th-cell">Đơn vị hạch toán</th>
                  <th className="th-cell text-right">Doanh thu</th>
                  <th className="th-cell text-right">Giao Chủ trì</th>
                  <th className="th-cell text-right">Giữ lại Đơn vị</th>
                  <th className="th-cell text-right">Nộp về Viện</th>
                  <th className="th-cell text-right">Công nợ</th>
                </tr>
              </thead>
              <tbody>
                {unitStats.map((r) => (
                  <tr key={r.tenDonVi} className="tr-hover">
                    <td className="td-cell font-bold text-ink-secondary">{r.tenDonVi}</td>
                    <td className="td-cell text-right font-mono text-xs font-semibold text-primary">
                      {Math.round(r.thucThu).toLocaleString('vi-VN')}
                    </td>
                    <td className="td-cell text-right font-mono text-xs text-emerald-600">
                      {Math.round(r.chuTri).toLocaleString('vi-VN')}
                    </td>
                    <td className="td-cell text-right font-mono text-xs text-indigo-500">
                      {Math.round(r.donVi).toLocaleString('vi-VN')}
                    </td>
                    <td className="td-cell text-right font-mono text-xs text-amber-500">
                      {Math.round(r.vien).toLocaleString('vi-VN')}
                    </td>
                    <td className="td-cell text-right font-mono text-xs text-danger">
                      {Math.round(r.congNo).toLocaleString('vi-VN')}
                    </td>
                  </tr>
                ))}
                {unitStats.length === 0 && (
                  <tr>
                    <td colSpan={6} className="td-cell text-center text-ink-muted py-6">
                      {loading ? 'Đang tải dữ liệu...' : 'Không có dữ liệu kinh doanh.'}
                    </td>
                  </tr>
                )}
              </tbody>
              {unitStats.length > 0 && (
                <tfoot>
                  <tr className="border-t border-border font-bold bg-subtle/30 text-ink">
                    <td className="td-cell">Tổng cộng toàn Viện</td>
                    <td className="td-cell text-right font-mono text-xs text-primary">{Math.round(totals.thucThu).toLocaleString('vi-VN')}</td>
                    <td className="td-cell text-right font-mono text-xs text-emerald-600">{Math.round(totals.chuTri).toLocaleString('vi-VN')}</td>
                    <td className="td-cell text-right font-mono text-xs text-indigo-500">{Math.round(totals.donVi).toLocaleString('vi-VN')}</td>
                    <td className="td-cell text-right font-mono text-xs text-amber-500">{Math.round(totals.vien).toLocaleString('vi-VN')}</td>
                    <td className="td-cell text-right font-mono text-xs text-danger">{Math.round(totals.congNo).toLocaleString('vi-VN')}</td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>
      </div>

      <div className="card mt-6 border-l-4 border-l-info p-4 text-xs text-ink-secondary">
        <strong>* Lưu ý về nghiệp vụ hạch toán:</strong> Doanh thu thực thu, dòng tiền thanh toán và công nợ được liên kết trực tiếp từ các hợp đồng dịch vụ kỹ thuật đang triển khai. Phần kinh phí phân bổ khoán chi được tính toán tự động dựa trên định mức quy định tại Bảng 1 Quy chế phục vụ quản lý nhà nước và hoạt động dịch vụ kỹ thuật ban hành theo QĐ 2815/QĐ-VKH của Viện KHCN Xây dựng.
      </div>
    </div>
  );
}
