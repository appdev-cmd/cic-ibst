import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileText, CheckSquare, ShieldCheck, Calendar, ArrowUpRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { VanBanPage } from './VanBanPage';
import { CongViecPage } from './CongViecPage';
import { cn } from '../lib/utils';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { tabDuocPhep, type TaiNguyen } from '../lib/phanQuyen';

type Tab = 'van-ban' | 'cong-viec';
const TAB_IDS: Tab[] = ['van-ban', 'cong-viec'];
const TAB_TAI_NGUYEN: Record<Tab, TaiNguyen> = {
  'van-ban': 'van_ban',
  'cong-viec': 'cong_viec',
};

export function EOfficePage() {
  const [activeTab, setActiveTab] = useState<Tab>('van-ban');

  const { can: coQuyenTab, dangTai: dangTaiQuyen } = usePhanQuyen();
  const tabHienDuoc = (t: Tab) => tabDuocPhep(t, TAB_TAI_NGUYEN, coQuyenTab, dangTaiQuyen);
  useEffect(() => {
    if (dangTaiQuyen || tabHienDuoc(activeTab)) return;
    const taiChoPhep = TAB_IDS.find((t) => coQuyenTab(TAB_TAI_NGUYEN[t], 'xem'));
    if (taiChoPhep) setActiveTab(taiChoPhep);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dangTaiQuyen]);

  return (
    <div>
      <PageHeader
        title="Văn phòng số (e-Office): Văn bản & Giao việc"
        subtitle="Văn phòng không giấy tờ: Luồng văn bản tích hợp Chữ ký số CA liên thông Trục Bộ Xây dựng & Thuật toán đếm tiến độ công việc lũy kế"
      />

      {/* Tabs Switcher & Shortcut sang Lịch cơ quan — mỗi tab chỉ hiện khi có quyền xem tài nguyên tương ứng (Tầng 3) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 border border-border">
          {tabHienDuoc('van-ban') && (
            <button
              onClick={() => setActiveTab('van-ban')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
                activeTab === 'van-ban'
                  ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <FileText size={16} /> Văn bản & Chữ ký số CA
            </button>
          )}
          {tabHienDuoc('cong-viec') && (
            <button
              onClick={() => setActiveTab('cong-viec')}
              className={cn(
                'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
                activeTab === 'cong-viec'
                  ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                  : 'text-ink-muted hover:text-ink'
              )}
            >
              <CheckSquare size={16} /> Phân công & Tiến độ Lũy kế
            </button>
          )}
        </div>

        {/* Nút liên kết trực tiếp sang phân hệ Lịch cơ quan độc lập */}
        <Link
          to="/lich-co-quan"
          className="inline-flex items-center gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-xs font-bold text-ink shadow-2xs transition-all hover:border-primary hover:text-primary hover:bg-primary-subtle dark:hover:bg-primary-950/40"
          title="Mở phân hệ Lịch cơ quan, Đăng ký phòng họp và Điều phối xe công tác"
        >
          <Calendar size={15} className="text-primary" />
          <span>Lịch cơ quan & Đặt phòng / Xe công tác</span>
          <ArrowUpRight size={14} className="text-ink-muted" />
        </Link>
      </div>

      {/* Direct Integration Banner */}
      <div className="mb-4 rounded-xl border border-primary-200/80 bg-primary-50/70 dark:border-slate-700/80 dark:bg-slate-900/80 p-3 text-xs flex flex-wrap items-center justify-between gap-2 text-ink shadow-2xs">
        <div className="flex items-center gap-2">
          <ShieldCheck className="text-primary-600 dark:text-sky-400 h-4 w-4 shrink-0" />
          <span><strong>Trục Liên thông Văn bản Bộ Xây dựng:</strong> Trạng thái kết nối SOAP/REST XML mã hóa (Thông tư 02/2017/TT-VPCP) — <strong className="text-success font-bold">HOẠT ĐỘNG 24/7</strong></span>
        </div>
        <span className="text-2xs bg-primary-600 dark:bg-primary-500 text-white px-2.5 py-0.5 rounded-full font-bold shadow-2xs">Chữ ký số CA Ban Cơ yếu</span>
      </div>

      {/* Tab Contents */}
      {activeTab === 'van-ban' && tabHienDuoc('van-ban') && <VanBanPage />}
      {activeTab === 'cong-viec' && tabHienDuoc('cong-viec') && <CongViecPage />}
    </div>
  );
}
