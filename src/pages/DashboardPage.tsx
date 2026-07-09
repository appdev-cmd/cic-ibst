import {
  Handshake,
  FlaskConical,
  Microscope,
  Wallet,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import {
  doanhThuTheoThang,
  doanhThuTheoLinhVuc,
  hopDongList,
  mauThiNghiemList,
} from '../data/mock';
import { formatTrieu, formatNgay } from '../lib/utils';

export function DashboardPage() {
  const tongGiaTriHD = hopDongList.reduce((s, h) => s + h.giaTri, 0);
  return (
    <div>
      <PageHeader
        title="Tổng quan điều hành"
        subtitle="Số liệu hợp nhất toàn Viện — cập nhật 09/07/2026"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Wallet} label="Doanh thu lũy kế 2026" value="127,6 tỷ" delta={12.4} deltaLabel="so với cùng kỳ" tone="primary" />
        <KpiCard icon={Handshake} label="Hợp đồng đang thực hiện" value={String(hopDongList.filter((h) => h.trangThai === 'dang-thuc-hien').length + 38)} delta={5.1} deltaLabel="so với tháng trước" tone="success" />
        <KpiCard icon={FlaskConical} label="Đề tài KHCN đang triển khai" value="24" delta={-3.8} deltaLabel="so với 2025" tone="accent" />
        <KpiCard icon={Microscope} label="Mẫu thí nghiệm trong tháng" value="1.284" delta={8.9} deltaLabel="so với tháng trước" tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-ink">Doanh thu theo tháng (tỷ đồng)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={doanhThuTheoThang} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="thang" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }} />
              <Legend wrapperStyle={{ fontSize: 13, color: 'var(--text-muted)' }} />
              <Bar name="Dự toán" dataKey="duToan" fill="#d4eaf7" radius={[4, 4, 0, 0]} />
              <Bar name="Thực hiện" dataKey="thucHien" fill="#00668c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">Cơ cấu doanh thu theo lĩnh vực</h3>
          <div className="space-y-3">
            {doanhThuTheoLinhVuc.map((lv) => (
              <div key={lv.ten}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="font-medium text-ink-secondary">{lv.ten}</span>
                  <span className="font-mono font-semibold">{lv.giaTri}%</span>
                </div>
                <div className="h-2 rounded-full bg-subtle">
                  <div
                    className="h-2 rounded-full bg-primary"
                    style={{ width: `${lv.giaTri}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 border-t border-muted pt-3 text-xs text-ink-muted">
            Tổng giá trị hợp đồng đang theo dõi:{' '}
            <span className="font-mono font-semibold text-ink">{formatTrieu(tongGiaTriHD)}</span>
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-2">
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold">Hợp đồng cần chú ý</h3>
            <a href="/hop-dong" className="text-xs font-semibold text-primary hover:underline">Xem tất cả →</a>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Số HĐ</th>
                <th className="th-cell">Tên</th>
                <th className="th-cell">Hạn</th>
                <th className="th-cell">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {hopDongList.slice(0, 4).map((h) => (
                <tr key={h.id} className="tr-hover">
                  <td className="td-cell font-mono text-xs">{h.soHD}</td>
                  <td className="td-cell max-w-56 truncate">{h.ten}</td>
                  <td className="td-cell font-mono text-xs">{formatNgay(h.hanHoanThanh)}</td>
                  <td className="td-cell"><StatusBadge value={h.trangThai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <h3 className="text-sm font-bold">Mẫu thí nghiệm mới nhất</h3>
            <a href="/thi-nghiem" className="text-xs font-semibold text-primary hover:underline">Xem tất cả →</a>
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Mã phiếu</th>
                <th className="th-cell">Mẫu</th>
                <th className="th-cell">Hạn trả</th>
                <th className="th-cell">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {mauThiNghiemList.slice(0, 4).map((m) => (
                <tr key={m.id} className="tr-hover">
                  <td className="td-cell font-mono text-xs">{m.maPhieu}</td>
                  <td className="td-cell max-w-56 truncate">{m.tenMau}</td>
                  <td className="td-cell font-mono text-xs">{formatNgay(m.hanTra)}</td>
                  <td className="td-cell"><StatusBadge value={m.trangThai} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
