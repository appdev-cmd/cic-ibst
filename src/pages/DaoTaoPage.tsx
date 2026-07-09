import { Plus, GraduationCap, Users2, CalendarDays } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchLopDaoTao } from '../services/queries';
import { formatNgay, cn } from '../lib/utils';

const LOAI_CLS: Record<string, string> = {
  NCS: 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  'Tập huấn': 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'Hội thảo': 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
};

export function DaoTaoPage() {
  const { data: lopDaoTaoList, loading, error } = useAsyncData(fetchLopDaoTao, []);
  return (
    <div>
      <PageHeader
        title="Đào tạo - Hội nghị"
        subtitle="Đào tạo tiến sĩ (NCS), tập huấn chuyên đề, hội nghị/hội thảo khoa học"
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Mở lớp / sự kiện
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={GraduationCap} label="NCS đang đào tạo" value="23" tone="primary" />
        <KpiCard icon={Users2} label="Lượt học viên năm 2026" value="1.640" tone="success" />
        <KpiCard icon={CalendarDays} label="Sự kiện sắp diễn ra" value="2" tone="warning" />
      </div>

      <DataState loading={loading} error={error} empty={lopDaoTaoList.length === 0} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[720px]">
          <thead>
            <tr>
              <th className="th-cell">Tên lớp / sự kiện</th>
              <th className="th-cell">Loại</th>
              <th className="th-cell text-right">Học viên</th>
              <th className="th-cell">Bắt đầu</th>
              <th className="th-cell">Kết thúc</th>
              <th className="th-cell">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {lopDaoTaoList.map((ld) => (
              <tr key={ld.id} className="tr-hover cursor-pointer">
                <td className="td-cell font-medium">{ld.ten}</td>
                <td className="td-cell">
                  <span className={cn('rounded-full px-2 py-0.5 text-2xs font-black uppercase', LOAI_CLS[ld.loai])}>
                    {ld.loai}
                  </span>
                </td>
                <td className="td-cell text-right font-mono text-xs">{ld.soHocVien}</td>
                <td className="td-cell font-mono text-xs">{formatNgay(ld.batDau)}</td>
                <td className="td-cell font-mono text-xs">{formatNgay(ld.ketThuc)}</td>
                <td className="td-cell"><StatusBadge value={ld.trangThai} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
