import { Wallet, Landmark, Receipt, PiggyBank } from 'lucide-react';
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
import { doanhThuTheoThang, DON_VI } from '../data/mock';

const congNoTheoDonVi = DON_VI.slice(0, 6).map((dv, i) => ({
  donVi: dv,
  phaiThu: [5200, 3800, 2900, 6400, 1800, 2400][i],
  phaiTra: [1200, 900, 1500, 2100, 600, 800][i],
}));

export function TaiChinhPage() {
  return (
    <div>
      <PageHeader
        title="Tài chính - Kế toán"
        subtitle="Tổng hợp đa nguồn: NSNN — thu sự nghiệp — dịch vụ (tích hợp phần mềm kế toán HCSN)"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Wallet} label="Doanh thu lũy kế" value="127,6 tỷ" tone="primary" />
        <KpiCard icon={Landmark} label="Kinh phí NSNN cấp" value="42,1 tỷ" tone="success" />
        <KpiCard icon={Receipt} label="Hóa đơn phát hành tháng 7" value="118" tone="warning" />
        <KpiCard icon={PiggyBank} label="Quỹ phát triển HĐSN" value="18,3 tỷ" tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold">Dòng doanh thu thực hiện (tỷ đồng)</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={doanhThuTheoThang}>
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
              <Area type="monotone" dataKey="thucHien" name="Thực hiện" stroke="#00668c" strokeWidth={2} fill="url(#gradTC)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="card overflow-hidden">
          <h3 className="px-4 py-3 text-sm font-bold">Công nợ theo đơn vị (triệu đồng)</h3>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Đơn vị</th>
                <th className="th-cell text-right">Phải thu</th>
                <th className="th-cell text-right">Phải trả</th>
              </tr>
            </thead>
            <tbody>
              {congNoTheoDonVi.map((r) => (
                <tr key={r.donVi} className="tr-hover">
                  <td className="td-cell font-medium">{r.donVi}</td>
                  <td className="td-cell text-right font-mono text-xs font-semibold text-warning">
                    {r.phaiThu.toLocaleString('vi-VN')}
                  </td>
                  <td className="td-cell text-right font-mono text-xs text-ink-secondary">
                    {r.phaiTra.toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="card mt-4 border-l-4 border-l-info p-4 text-sm text-ink-secondary">
        Phân hệ kế toán chi tiết (chứng từ, sổ sách theo Thông tư 24/2024/TT-BTC) sẽ tích hợp qua API
        với phần mềm kế toán HCSN hiện có — màn hình này là lớp tổng hợp/điều hành.
      </div>
    </div>
  );
}
