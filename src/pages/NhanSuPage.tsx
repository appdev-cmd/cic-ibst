import { Plus, Users, GraduationCap, ShieldAlert } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchNhanSu } from '../services/queries';
import { formatNgay, cn } from '../lib/utils';

function hanSapHet(iso: string) {
  return new Date(iso).getTime() - Date.now() < 90 * 24 * 3600 * 1000;
}

export function NhanSuPage() {
  const { data: nhanSuList, loading, error } = useAsyncData(fetchNhanSu, []);
  return (
    <div>
      <PageHeader
        title="Nhân sự"
        subtitle="Hồ sơ CBVC, chức danh khoa học, chứng chỉ hành nghề, giờ nghiên cứu"
        actions={
          <button className="btn-primary">
            <Plus size={16} /> Thêm hồ sơ
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Users} label="Tổng CBVC toàn Viện" value="612" tone="primary" />
        <KpiCard icon={GraduationCap} label="GS/PGS — TS — ThS" value="6 — 37 — 163" tone="success" />
        <KpiCard icon={ShieldAlert} label="Chứng chỉ sắp hết hạn (90 ngày)" value="14" tone="accent" />
      </div>

      <DataState loading={loading} error={error} empty={nhanSuList.length === 0} />
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[860px]">
          <thead>
            <tr>
              <th className="th-cell">Họ tên</th>
              <th className="th-cell">Chức danh</th>
              <th className="th-cell">Học hàm / học vị</th>
              <th className="th-cell">Đơn vị</th>
              <th className="th-cell">Chứng chỉ hành nghề</th>
              <th className="th-cell">Hạn chứng chỉ</th>
            </tr>
          </thead>
          <tbody>
            {nhanSuList.map((ns) => (
              <tr key={ns.id} className="tr-hover cursor-pointer">
                <td className="td-cell font-semibold">{ns.hoTen}</td>
                <td className="td-cell text-ink-secondary">{ns.chucDanh}</td>
                <td className="td-cell text-ink-secondary">{ns.hocVi}</td>
                <td className="td-cell text-ink-secondary">{ns.donVi}</td>
                <td className="td-cell">{ns.chungChi}</td>
                <td className="td-cell">
                  <span
                    className={cn(
                      'font-mono text-xs',
                      hanSapHet(ns.hanChungChi) &&
                        'rounded bg-red-50 px-1.5 py-0.5 font-semibold text-danger dark:bg-red-900/20 dark:text-red-400',
                    )}
                  >
                    {formatNgay(ns.hanChungChi)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
