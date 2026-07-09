import { Plus, Microscope, Timer, BadgeCheck } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchMauThiNghiem } from '../services/queries';
import { formatNgay } from '../lib/utils';

export function ThiNghiemPage() {
  const { data: mauThiNghiemList, loading, error } = useAsyncData(fetchMauThiNghiem, []);
  return (
    <div>
      <PageHeader
        title="Quản lý Thí nghiệm (LIMS)"
        subtitle="Tiếp nhận mẫu → phân công phép thử → nhập kết quả → duyệt → phát hành phiếu ký số"
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Tiếp nhận mẫu
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Microscope} label="Mẫu đang xử lý" value="47" tone="primary" />
        <KpiCard icon={Timer} label="Sắp đến hạn trả (3 ngày)" value="9" tone="warning" />
        <KpiCard icon={BadgeCheck} label="Phiếu phát hành trong tháng" value="312" tone="success" />
      </div>

      <DataState loading={loading} error={error} empty={mauThiNghiemList.length === 0} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[920px]">
          <thead>
            <tr>
              <th className="th-cell">Mã phiếu</th>
              <th className="th-cell">Tên mẫu</th>
              <th className="th-cell">Phép thử / Tiêu chuẩn</th>
              <th className="th-cell">Khách hàng</th>
              <th className="th-cell">Phòng TN</th>
              <th className="th-cell">Ngày nhận</th>
              <th className="th-cell">Hạn trả</th>
              <th className="th-cell">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {mauThiNghiemList.map((m) => (
              <tr key={m.id} className="tr-hover cursor-pointer">
                <td className="td-cell font-mono text-xs font-semibold text-primary">{m.maPhieu}</td>
                <td className="td-cell max-w-xs truncate font-medium">{m.tenMau}</td>
                <td className="td-cell text-ink-secondary">{m.phepThu}</td>
                <td className="td-cell text-ink-secondary">{m.khachHang}</td>
                <td className="td-cell">
                  <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-2xs font-semibold">
                    {m.phongThiNghiem}
                  </span>
                </td>
                <td className="td-cell font-mono text-xs">{formatNgay(m.ngayNhan)}</td>
                <td className="td-cell font-mono text-xs">{formatNgay(m.hanTra)}</td>
                <td className="td-cell"><StatusBadge value={m.trangThai} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
