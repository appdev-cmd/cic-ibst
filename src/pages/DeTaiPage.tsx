import { Plus, FlaskConical, Landmark, AlertTriangle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { deTaiList } from '../data/mock';
import { formatTrieu, formatNgay, cn } from '../lib/utils';

const CAP_CLS: Record<string, string> = {
  'Nhà nước': 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  Bộ: 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'Cơ sở': 'bg-subtle text-ink-secondary',
};

export function DeTaiPage() {
  return (
    <div>
      <PageHeader
        title="Đề tài & Nhiệm vụ KHCN"
        subtitle="Vòng đời đề tài: đề xuất → xét duyệt → thực hiện → nghiệm thu → thanh quyết toán"
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Đăng ký đề tài
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={FlaskConical} label="Đang triển khai" value="24" tone="primary" />
        <KpiCard icon={Landmark} label="Tổng kinh phí được giao" value="86,4 tỷ" tone="success" />
        <KpiCard icon={AlertTriangle} label="Trễ tiến độ" value="2" tone="accent" />
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[900px]">
          <thead>
            <tr>
              <th className="th-cell">Mã số</th>
              <th className="th-cell">Tên đề tài</th>
              <th className="th-cell">Cấp</th>
              <th className="th-cell">Chủ nhiệm</th>
              <th className="th-cell">Kinh phí</th>
              <th className="th-cell">Tiến độ</th>
              <th className="th-cell">Hạn nghiệm thu</th>
              <th className="th-cell">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {deTaiList.map((dt) => (
              <tr key={dt.id} className="tr-hover cursor-pointer">
                <td className="td-cell font-mono text-xs font-semibold text-primary">{dt.maSo}</td>
                <td className="td-cell max-w-sm">
                  <p className="truncate font-medium">{dt.ten}</p>
                  <p className="text-xs text-ink-muted">{dt.donVi}</p>
                </td>
                <td className="td-cell">
                  <span className={cn('rounded-full px-2 py-0.5 text-2xs font-black uppercase', CAP_CLS[dt.cap])}>
                    {dt.cap}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{dt.chuNhiem}</td>
                <td className="td-cell font-mono text-xs">{formatTrieu(dt.kinhPhi)}</td>
                <td className="td-cell w-32">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-subtle">
                      <div
                        className={cn('h-1.5 rounded-full', dt.trangThai === 'qua-han' ? 'bg-danger' : 'bg-primary')}
                        style={{ width: `${dt.tienDo}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs">{dt.tienDo}%</span>
                  </div>
                </td>
                <td className="td-cell font-mono text-xs">{formatNgay(dt.hanNghiemThu)}</td>
                <td className="td-cell"><StatusBadge value={dt.trangThai} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
