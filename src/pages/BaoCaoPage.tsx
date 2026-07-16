import { useState } from 'react';
import { FileBarChart2, Download, Search, LoaderCircle } from 'lucide-react';
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
import { DataState } from '../components/DataState';
import { StatusBadge } from '../components/StatusBadge';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchCongNoTheoDonVi } from '../services/thongke';
import { fetchMauThiNghiem } from '../services/queries';
import type { MauThiNghiem } from '../types';
import { exportCsv, formatNgay } from '../lib/utils';

export function BaoCaoPage() {
  const { data: congNo, loading, error } = useAsyncData(fetchCongNoTheoDonVi, []);
  const { data: mauList } = useAsyncData(fetchMauThiNghiem, []);

  const chartData = congNo.map((r) => ({
    donVi: r.donVi,
    doanhThu: Math.round((r.daThu / 1000) * 10) / 10,
  }));

  // Cổng tra cứu kết quả
  const [maPhieu, setMaPhieu] = useState('');
  const [ketQua, setKetQua] = useState<MauThiNghiem | null | 'none'>(null);
  const tracuu = () => {
    const q = maPhieu.trim().toLowerCase();
    if (!q) return;
    const found = mauList.find((m) => m.maPhieu.toLowerCase() === q);
    setKetQua(found ?? 'none');
  };

  const xuatBaoCaoDonVi = () => {
    exportCsv(
      `bao-cao-cong-no-don-vi-${new Date().toISOString().slice(0, 10)}.csv`,
      ['Đơn vị', 'Đã thu (triệu đồng)', 'Còn phải thu (triệu đồng)'],
      congNo.map((r) => [r.donVi, r.daThu, r.phaiThu]),
    );
  };

  return (
    <div>
      <PageHeader
        title="Báo cáo - BI"
        subtitle="Tổng hợp trực tiếp từ CSDL; xuất báo cáo và cổng tra cứu kết quả cho khách hàng"
      />

      <div className="grid grid-cols-1 gap-4 xl:grid-cols-3">
        <div className="card p-4 xl:col-span-2">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="text-sm font-bold">Đã thu theo đơn vị {new Date().getFullYear()} (tỷ đồng)</h3>
            <button
              onClick={xuatBaoCaoDonVi}
              disabled={congNo.length === 0}
              className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted disabled:opacity-50"
            >
              <Download size={13} /> Xuất CSV
            </button>
          </div>
          <DataState loading={loading} error={error} empty={congNo.length === 0} />
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData} layout="vertical" margin={{ left: 40 }}>
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
              <Bar dataKey="doanhThu" name="Đã thu" fill="var(--color-primary, #00668c)" radius={[0, 4, 4, 0]} barSize={18} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-4">
          <div className="card p-4">
            <h3 className="mb-3 text-sm font-bold">Xuất báo cáo</h3>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={xuatBaoCaoDonVi}
                  className="flex w-full items-center justify-between gap-2 rounded-lg border border-muted px-3 py-2 text-left text-sm hover:bg-muted"
                >
                  <span className="flex items-center gap-2 text-ink-secondary">
                    <FileBarChart2 size={15} className="shrink-0 text-primary" />
                    Công nợ phải thu theo đơn vị
                  </span>
                  <Download size={15} className="text-ink-muted" />
                </button>
              </li>
            </ul>
            <p className="mt-3 text-xs italic text-ink-muted">
              Thêm mẫu báo cáo (tiến độ đề tài, năng suất LAS-XD...) sẽ bổ sung khi có yêu cầu cụ thể từ Viện.
            </p>
          </div>

          <div className="card p-4">
            <h3 className="mb-2 text-sm font-bold">Cổng tra cứu kết quả thí nghiệm</h3>
            <p className="mb-3 text-xs text-ink-muted">
              Nhập mã phiếu để xác thực phiếu kết quả — chống giả mạo.
            </p>
            <div className="flex gap-2">
              <div className="flex flex-1 items-center gap-2 rounded-lg border border-muted bg-subtle px-3 py-2">
                <Search size={15} className="text-ink-muted" />
                <input
                  className="w-full bg-transparent font-mono text-sm outline-none placeholder:font-sans placeholder:text-ink-muted"
                  placeholder="VD: LAS-2607-0912"
                  value={maPhieu}
                  onChange={(e) => setMaPhieu(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && tracuu()}
                />
              </div>
              <button className="btn-primary" onClick={tracuu}>Tra cứu</button>
            </div>
            {ketQua === 'none' && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                Không tìm thấy phiếu có mã "{maPhieu}".
              </p>
            )}
            {ketQua && ketQua !== 'none' && (
              <div className="mt-3 rounded-lg border border-border bg-subtle p-3 text-xs">
                <div className="mb-1 flex items-center justify-between">
                  <span className="font-mono font-bold text-primary">{ketQua.maPhieu}</span>
                  <StatusBadge value={ketQua.trangThai} />
                </div>
                <p className="font-semibold text-ink">{ketQua.tenMau}</p>
                <p className="mt-1 text-ink-secondary">
                  {[ketQua.phepThu, ketQua.tieuChuan].filter(Boolean).join(' ')}
                </p>
                <p className="mt-1 text-ink-muted">
                  Phòng {ketQua.phongThiNghiem} · Nhận {formatNgay(ketQua.ngayNhan)}
                  {ketQua.hanTra && ` · Trả ${formatNgay(ketQua.hanTra)}`}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
