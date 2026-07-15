import { Handshake, FlaskConical, Microscope, Wallet } from 'lucide-react';
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
import { KpiCard } from '../components/KpiCard';
import { StatusBadge } from '../components/StatusBadge';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchHopDong, fetchMauThiNghiem } from '../services/queries';
import { fetchTongQuan, fetchDoanhThuTheoThang, fetchDoanhThuTheoDonVi } from '../services/thongke';
import { formatTrieu, formatNgay } from '../lib/utils';

export function DashboardPage() {
  const { data: hopDongList } = useAsyncData(fetchHopDong, []);
  const { data: mauThiNghiemList } = useAsyncData(fetchMauThiNghiem, []);
  const { data: tongQuan } = useAsyncData(fetchTongQuan, {
    doanhThuLuyKe: 0,
    hopDongDangThucHien: 0,
    deTaiDangTrienKhai: 0,
    mauTrongThang: 0,
    tongGiaTriTheoDoi: 0,
    congNoPhaiThu: 0,
  });
  const { data: doanhThuThang } = useAsyncData(fetchDoanhThuTheoThang, []);
  const { data: coCauDonVi } = useAsyncData(fetchDoanhThuTheoDonVi, []);

  const hopDongChuY = [...hopDongList]
    .filter((h) => h.trangThai !== 'hoan-thanh')
    .sort((a, b) => (a.hanHoanThanh || '').localeCompare(b.hanHoanThanh || ''))
    .slice(0, 4);

  return (
    <div>
      <PageHeader
        title="Tổng quan điều hành"
        subtitle="Số liệu hợp nhất toàn Viện — tổng hợp trực tiếp từ cơ sở dữ liệu"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Wallet} label={`Doanh thu thực thu ${new Date().getFullYear()}`} value={formatTrieu(tongQuan.doanhThuLuyKe)} tone="primary" />
        <KpiCard icon={Handshake} label="Hợp đồng đang thực hiện" value={String(tongQuan.hopDongDangThucHien)} tone="success" />
        <KpiCard icon={FlaskConical} label="Đề tài KHCN đang triển khai" value={String(tongQuan.deTaiDangTrienKhai)} tone="accent" />
        <KpiCard icon={Microscope} label="Mẫu thí nghiệm trong tháng" value={String(tongQuan.mauTrongThang)} tone="warning" />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:col-span-2">
          <h3 className="mb-3 text-sm font-bold text-ink">Doanh thu thực thu theo tháng (tỷ đồng)</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={doanhThuThang} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-default)" vertical={false} />
              <XAxis dataKey="thang" tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} width={32} />
              <Tooltip cursor={{ fill: 'var(--bg-subtle)' }} contentStyle={{ borderRadius: 8, border: '1px solid var(--border-default)', background: 'var(--bg-elevated)', color: 'var(--text-primary)', fontSize: 13 }} />
              <Bar name="Thực thu" dataKey="thucHien" fill="#00668c" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card p-4">
          <h3 className="mb-3 text-sm font-bold text-ink">Cơ cấu HĐ đang theo dõi theo đơn vị</h3>
          <div className="space-y-3">
            {coCauDonVi.map((lv) => (
              <div key={lv.ten}>
                <div className="mb-1 flex justify-between text-xs">
                  <span className="max-w-[70%] truncate font-medium text-ink-secondary" title={lv.ten}>{lv.ten}</span>
                  <span className="font-mono font-semibold">{lv.pct}%</span>
                </div>
                <div className="h-2 rounded-full bg-subtle">
                  <div className="h-2 rounded-full bg-primary" style={{ width: `${lv.pct}%` }} />
                </div>
              </div>
            ))}
            {coCauDonVi.length === 0 && <p className="text-xs text-ink-muted">Chưa có dữ liệu.</p>}
          </div>
          <p className="mt-4 border-t border-muted pt-3 text-xs text-ink-muted">
            Tổng giá trị HĐ đang theo dõi:{' '}
            <span className="font-mono font-semibold text-ink">{formatTrieu(tongQuan.tongGiaTriTheoDoi)}</span>
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
              {hopDongChuY.map((h) => (
                <tr key={h.id} className="tr-hover">
                  <td className="td-cell font-mono text-xs">{h.soHD}</td>
                  <td className="td-cell max-w-56 truncate">{h.ten}</td>
                  <td className="td-cell font-mono text-xs">{h.hanHoanThanh ? formatNgay(h.hanHoanThanh) : '—'}</td>
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
                  <td className="td-cell font-mono text-xs">{m.hanTra ? formatNgay(m.hanTra) : '—'}</td>
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
