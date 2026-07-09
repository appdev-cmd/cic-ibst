import { Plus, FileDown, FileUp } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchVanBan } from '../services/queries';
import { formatNgay } from '../lib/utils';

export function VanBanPage() {
  const { data: vanBanList, loading, error } = useAsyncData(fetchVanBan, []);
  return (
    <div>
      <PageHeader
        title="Văn bản - Điều hành"
        subtitle="Quản lý văn bản đến/đi, trình ký điện tử, liên thông trục VBĐT"
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Thêm văn bản
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={FileDown} label="Văn bản đến trong tháng" value="86" tone="primary" />
        <KpiCard icon={FileUp} label="Văn bản đi trong tháng" value="54" tone="success" />
        <KpiCard icon={FileDown} label="Chờ xử lý / quá hạn" value="12 / 3" tone="accent" />
      </div>

      <DataState loading={loading} error={error} empty={vanBanList.length === 0} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr>
              <th className="th-cell">Số hiệu</th>
              <th className="th-cell">Trích yếu</th>
              <th className="th-cell">Loại</th>
              <th className="th-cell">Đơn vị xử lý</th>
              <th className="th-cell">Ngày</th>
              <th className="th-cell">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {vanBanList.map((vb) => (
              <tr key={vb.id} className="tr-hover cursor-pointer">
                <td className="td-cell font-mono text-xs font-semibold text-primary">{vb.soHieu}</td>
                <td className="td-cell max-w-md">{vb.trichYeu}</td>
                <td className="td-cell">
                  <span className={vb.loai === 'Đến' ? 'font-semibold text-info' : 'font-semibold text-success'}>
                    {vb.loai}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{vb.donVi}</td>
                <td className="td-cell font-mono text-xs">{formatNgay(vb.ngay)}</td>
                <td className="td-cell"><StatusBadge value={vb.trangThai} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
