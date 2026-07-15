import { Wallet, Banknote, Receipt, PiggyBank } from 'lucide-react';
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
import { DataState } from '../components/DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchTongQuan, fetchDoanhThuTheoThang, fetchCongNoTheoDonVi } from '../services/thongke';
import { formatTrieu } from '../lib/utils';

export function TaiChinhPage() {
  const { data: tongQuan } = useAsyncData(fetchTongQuan, {
    doanhThuLuyKe: 0,
    hopDongDangThucHien: 0,
    deTaiDangTrienKhai: 0,
    mauTrongThang: 0,
    tongGiaTriTheoDoi: 0,
    congNoPhaiThu: 0,
  });
  const { data: doanhThuThang } = useAsyncData(fetchDoanhThuTheoThang, []);
  const { data: congNo, loading, error } = useAsyncData(fetchCongNoTheoDonVi, []);

  const tongPhaiThu = congNo.reduce((s, r) => s + r.phaiThu, 0);
  const tongDaThu = congNo.reduce((s, r) => s + r.daThu, 0);

  return (
    <div>
      <PageHeader
        title="Tài chính - Kế toán"
        subtitle="Tổng hợp từ hợp đồng & đợt thanh toán (tích hợp phần mềm kế toán HCSN ở giai đoạn sau)"
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Wallet} label={`Doanh thu thực thu ${new Date().getFullYear()}`} value={formatTrieu(tongQuan.doanhThuLuyKe)} tone="primary" />
        <KpiCard icon={Banknote} label="Công nợ phải thu" value={formatTrieu(tongQuan.congNoPhaiThu)} tone="warning" />
        <KpiCard icon={Receipt} label="Giá trị HĐ đang theo dõi" value={formatTrieu(tongQuan.tongGiaTriTheoDoi)} tone="success" />
        <KpiCard icon={PiggyBank} label="Đã thu lũy kế (toàn bộ HĐ)" value={formatTrieu(tongDaThu)} tone="accent" />
      </div>

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold">Dòng tiền thực thu theo tháng (tỷ đồng)</h3>
          <ResponsiveContainer width="100%" height={260}>
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

        <div className="card overflow-hidden">
          <h3 className="px-4 py-3 text-sm font-bold">Công nợ theo đơn vị (triệu đồng)</h3>
          <DataState loading={loading} error={error} empty={congNo.length === 0} />
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Đơn vị</th>
                <th className="th-cell text-right">Phải thu</th>
                <th className="th-cell text-right">Đã thu</th>
              </tr>
            </thead>
            <tbody>
              {congNo.map((r) => (
                <tr key={r.donVi} className="tr-hover">
                  <td className="td-cell font-medium">{r.donVi}</td>
                  <td className="td-cell text-right font-mono text-xs font-semibold text-warning">
                    {r.phaiThu.toLocaleString('vi-VN')}
                  </td>
                  <td className="td-cell text-right font-mono text-xs text-ink-secondary">
                    {r.daThu.toLocaleString('vi-VN')}
                  </td>
                </tr>
              ))}
            </tbody>
            {congNo.length > 0 && (
              <tfoot>
                <tr className="border-t border-border font-bold">
                  <td className="td-cell">Tổng cộng</td>
                  <td className="td-cell text-right font-mono text-xs text-warning">{tongPhaiThu.toLocaleString('vi-VN')}</td>
                  <td className="td-cell text-right font-mono text-xs">{tongDaThu.toLocaleString('vi-VN')}</td>
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>

      <div className="card mt-4 border-l-4 border-l-info p-4 text-sm text-ink-secondary">
        Phân hệ kế toán chi tiết (chứng từ, sổ sách theo Thông tư 24/2024/TT-BTC) sẽ tích hợp qua API
        với phần mềm kế toán HCSN hiện có — màn hình này là lớp tổng hợp/điều hành từ dữ liệu hợp đồng.
      </div>
    </div>
  );
}
