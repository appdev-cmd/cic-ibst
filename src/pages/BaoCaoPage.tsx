import { FileBarChart2, Download, Search } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { DON_VI } from '../data/mock';

const doanhThuDonVi = DON_VI.map((dv, i) => ({
  donVi: dv.replace('Viện chuyên ngành', 'VCN').replace('Viện ', 'V.').replace('Phân viện', 'PV'),
  doanhThu: [28.4, 21.7, 18.2, 24.9, 9.6, 11.3, 13.5][i],
}));

const BAO_CAO_MAU = [
  'Báo cáo doanh thu hợp nhất theo đơn vị (tháng/quý/năm)',
  'Báo cáo tiến độ đề tài KHCN gửi Bộ Xây dựng',
  'Báo cáo năng suất phòng thí nghiệm theo LAS-XD',
  'Báo cáo công nợ phải thu theo hợp đồng',
  'Báo cáo tình hình sử dụng kinh phí NSNN',
];

export function BaoCaoPage() {
  return (
    <div>
      <PageHeader
        title="Báo cáo - BI"
        subtitle="Kho dữ liệu tập trung, báo cáo động và cổng tra cứu kết quả cho khách hàng"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:col-span-2">
          <h3 className="mb-3 text-sm font-bold">Doanh thu lũy kế theo đơn vị 2026 (tỷ đồng)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={doanhThuDonVi} layout="vertical" margin={{ left: 40 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis
                type="category"
                dataKey="donVi"
                width={120}
                tick={{ fontSize: 11, fill: 'var(--text-secondary)' }}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }} />
              <Bar dataKey="doanhThu" name="Doanh thu" fill="#00668c" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-bold">Báo cáo định kỳ</h3>
            <ul className="space-y-2">
              {BAO_CAO_MAU.map((bc) => (
                <li key={bc} className="flex items-center justify-between gap-2 rounded-lg border border-muted px-3 py-2 text-sm hover:bg-muted">
                  <span className="flex items-center gap-2 text-ink-secondary">
                    <FileBarChart2 size={15} className="shrink-0 text-primary" />
                    {bc}
                  </span>
                  <button className="text-ink-muted hover:text-primary" title="Tải xuống">
                    <Download size={15} />
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="card p-4">
            <h3 className="mb-2 text-sm font-bold">Cổng tra cứu kết quả thí nghiệm</h3>
            <p className="mb-3 text-xs text-ink-muted">
              Khách hàng nhập mã phiếu để xác thực phiếu kết quả — chống giả mạo.
            </p>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-muted bg-subtle px-3 py-2">
                <Search size={15} className="text-ink-muted" />
                <input
                  className="w-full bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-ink-muted"
                  placeholder="VD: LAS-2607-0912"
                />
              </div>
              <button className="btn-primary">
                Tra cứu
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
