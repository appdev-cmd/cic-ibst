import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FlaskConical, Award, RefreshCw, Layers, DollarSign, ShieldCheck, Newspaper } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { DeTaiPage } from './DeTaiPage';
import { SoHuuTriTuePage } from './SoHuuTriTuePage';
import { TapChiPage } from './TapChiPage';
import { cn } from '../lib/utils';

type Tab = 'de-tai' | 'tap-chi' | 'so-huu-tri-tue' | 'chuyen-giao';

const MOCK_CHUYEN_GIAO = [
  {
    id: 'cg-01',
    tenCongNghe: 'Công nghệ bê tông cường độ siêu cao (UHPC) gia cường sợi thép cho cầu nhịp lớn',
    doiTac: 'Tập đoàn Deo Ca Group',
    giaTri: 1200000000,
    hoaHongTacGia: 360000000, // 30%
    ngayKy: '2026-03-15',
    trangThai: 'Đã hoàn thành',
    chuSohuu: 'Trung tâm Bê tông & Vật liệu xây dựng'
  },
  {
    id: 'cg-02',
    tenCongNghe: 'Quy trình sơn chống cháy chịu nhiệt 120 phút cho kết cấu thép nhà xưởng',
    doiTac: 'Công ty CP Vĩnh Tường - Saint-Gobain',
    giaTri: 850000000,
    hoaHongTacGia: 255000000,
    ngayKy: '2026-05-20',
    trangThai: 'Đang giải ngân Giai đoạn 2',
    chuSohuu: 'Phòng Thử nghiệm LAS-XD 18'
  },
  {
    id: 'cg-03',
    tenCongNghe: 'Phần mềm tính toán tối ưu móng cọc khoan nhồi theo tiêu chuẩn Eurocode 7',
    doiTac: 'Tổng công ty Tư vấn Thiết kế Xây dựng Việt Nam (VNCC)',
    giaTri: 450000000,
    hoaHongTacGia: 135000000,
    ngayKy: '2026-06-10',
    trangThai: 'Đã hoàn thành',
    chuSohuu: 'Trung tâm Địa kỹ thuật'
  }
];

export function KhoaHocPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam = searchParams.get('tab') as Tab;
  const [activeTab, setActiveTab] = useState<Tab>(
    tabParam && ['de-tai', 'tap-chi', 'so-huu-tri-tue', 'chuyen-giao'].includes(tabParam)
      ? tabParam
      : 'de-tai'
  );

  useEffect(() => {
    if (tabParam && ['de-tai', 'tap-chi', 'so-huu-tri-tue', 'chuyen-giao'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [tabParam]);

  const handleTabChange = (newTab: Tab) => {
    setActiveTab(newTab);
    setSearchParams({ tab: newTab });
  };

  return (
    <div>
      <PageHeader
        title="[Phân hệ 4] Quản lý Khoa học: Đề tài, Tạp chí KHCN, Sở hữu Trí tuệ & Chuyển giao"
        subtitle="Quản lý thuyết minh, tiến độ giải ngân Đề tài KHCN, Tòa soạn Tạp chí KHCN Xây dựng, Sáng chế SHTT & Hợp đồng chuyển giao công nghệ phân bổ hoa hồng tác giả (Tuân thủ Khung QĐ 942/QĐ-BXD)"
      />

      {/* Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        <button
          onClick={() => handleTabChange('de-tai')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'de-tai'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <FlaskConical size={16} /> Đề tài KHCN các cấp
        </button>
        <button
          onClick={() => handleTabChange('tap-chi')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'tap-chi'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Newspaper size={16} /> Tạp chí KHCN Xây dựng
        </button>
        <button
          onClick={() => handleTabChange('so-huu-tri-tue')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'so-huu-tri-tue'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Award size={16} /> Bằng sáng chế & SHTT
        </button>
        <button
          onClick={() => handleTabChange('chuyen-giao')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'chuyen-giao'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <RefreshCw size={16} /> Chuyển giao công nghệ & Hoa hồng
        </button>
      </div>

      {/* Tab Contents */}
      {activeTab === 'de-tai' && <DeTaiPage />}
      {activeTab === 'tap-chi' && <TapChiPage />}
      {activeTab === 'so-huu-tri-tue' && <SoHuuTriTuePage />}
      {activeTab === 'chuyen-giao' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="card p-4 border-l-4 border-l-primary">
              <p className="text-2xs font-bold uppercase text-ink-muted">Tổng doanh thu chuyển giao</p>
              <p className="mt-1 text-xl font-black text-primary">2.500.000.000 VNĐ</p>
              <p className="text-2xs text-ink-muted mt-1">Từ 03 hợp đồng thương mại hóa</p>
            </div>
            <div className="card p-4 border-l-4 border-l-emerald-500">
              <p className="text-2xs font-bold uppercase text-ink-muted">Hoa hồng phân bổ tác giả</p>
              <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">750.000.000 VNĐ</p>
              <p className="text-2xs text-ink-muted mt-1">30% trích thưởng theo Quy chế KHCN Viện</p>
            </div>
            <div className="card p-4 border-l-4 border-l-amber-500">
              <p className="text-2xs font-bold uppercase text-ink-muted">Kết nối dòng tiền Kế toán</p>
              <p className="mt-1 text-xl font-black text-amber-600 dark:text-amber-400">Đồng bộ 100%</p>
              <p className="text-2xs text-ink-muted mt-1">Hệ thống phân hệ Tài chính 03</p>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="border-b border-border bg-subtle p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Layers size={16} className="text-primary" />
                Danh mục Hợp đồng Chuyển giao Công nghệ & Bản quyền Trí tuệ
              </h3>
              <span className="rounded-full bg-primary-subtle px-3 py-1 text-2xs font-bold text-primary">
                Quy chế trích nộp 30% Hoa hồng Tác giả
              </span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[700px] text-left text-xs">
                <thead>
                  <tr className="border-b border-border bg-muted/50 font-bold text-ink-muted">
                    <th className="p-3">Tên Công nghệ / Giải pháp</th>
                    <th className="p-3">Đối tác tiếp nhận</th>
                    <th className="p-3">Đơn vị chủ sở hữu</th>
                    <th className="p-3 text-right">Giá trị chuyển giao</th>
                    <th className="p-3 text-right">Hoa hồng tác giả</th>
                    <th className="p-3">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {MOCK_CHUYEN_GIAO.map((item) => (
                    <tr key={item.id} className="hover:bg-muted/30 transition-colors">
                      <td className="p-3 font-semibold text-ink">{item.tenCongNghe}</td>
                      <td className="p-3 text-ink-secondary">{item.doiTac}</td>
                      <td className="p-3 text-ink-muted">{item.chuSohuu}</td>
                      <td className="p-3 text-right font-bold text-ink">
                        {item.giaTri.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="p-3 text-right font-bold text-emerald-600 dark:text-emerald-400">
                        {item.hoaHongTacGia.toLocaleString('vi-VN')} VNĐ
                      </td>
                      <td className="p-3">
                        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 px-2.5 py-0.5 text-2xs font-bold text-emerald-700 dark:text-emerald-300">
                          <ShieldCheck size={12} /> {item.trangThai}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
