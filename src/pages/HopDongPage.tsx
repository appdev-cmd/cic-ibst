import { Plus, Handshake, Banknote, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { hopDongList } from '../data/mock';
import { formatTrieu, formatNgay, cn } from '../lib/utils';

export function HopDongPage() {
  return (
    <div>
      <PageHeader
        title="Hợp đồng dịch vụ & Dự án tư vấn"
        subtitle="Pipeline: báo giá → hợp đồng → nghiệm thu → hóa đơn → công nợ → thanh lý"
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Tạo hợp đồng
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Handshake} label="Tổng giá trị đang thực hiện" value="61,2 tỷ" tone="primary" />
        <KpiCard icon={Banknote} label="Công nợ phải thu" value="23,9 tỷ" tone="warning" />
        <KpiCard icon={AlertTriangle} label="Quá hạn / sắp đến hạn" value="1 / 3" tone="accent" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="th-cell">Số HĐ</th>
              <th className="th-cell">Tên hợp đồng</th>
              <th className="th-cell">Khách hàng</th>
              <th className="th-cell">Đơn vị thực hiện</th>
              <th className="th-cell">Giá trị</th>
              <th className="th-cell">Thanh toán</th>
              <th className="th-cell">Hạn hoàn thành</th>
              <th className="th-cell">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {hopDongList.map((hd) => {
              const pct = Math.round((hd.daThanhToan / hd.giaTri) * 100);
              return (
                <tr key={hd.id} className="tr-hover cursor-pointer">
                  <td className="td-cell font-mono text-xs font-semibold text-primary">{hd.soHD}</td>
                  <td className="td-cell max-w-sm truncate font-medium">{hd.ten}</td>
                  <td className="td-cell text-ink-secondary">{hd.khachHang}</td>
                  <td className="td-cell text-ink-secondary">{hd.donViThucHien}</td>
                  <td className="td-cell font-mono text-xs font-semibold">{formatTrieu(hd.giaTri)}</td>
                  <td className="td-cell w-36">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-subtle">
                        <div
                          className={cn('h-1.5 rounded-full', pct === 100 ? 'bg-success' : 'bg-info')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{pct}%</span>
                    </div>
                  </td>
                  <td className="td-cell font-mono text-xs">{formatNgay(hd.hanHoanThanh)}</td>
                  <td className="td-cell"><StatusBadge value={hd.trangThai} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
