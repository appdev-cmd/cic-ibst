import { useState } from 'react';
import { FileText, Calendar, CheckSquare, ShieldCheck, Building, Car, Cpu } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { VanBanPage } from './VanBanPage';
import { LichCoQuanPage } from './LichCoQuanPage';
import { CongViecPage } from './CongViecPage';
import { cn } from '../lib/utils';

type Tab = 'van-ban' | 'lich-co-quan' | 'cong-viec' | 'xe-phong-hop';

export function EOfficePage() {
  const [activeTab, setActiveTab] = useState<Tab>('van-ban');

  return (
    <div>
      <PageHeader
        title="Văn phòng số (e-Office): Văn bản, Lịch biểu & Giao việc"
        subtitle="Văn phòng không giấy tờ: Luồng văn bản tích hợp Chữ ký số CA liên thông Trục Bộ Xây dựng, Lịch biểu xe/phòng họp & Thuật toán đếm tiến độ công việc lũy kế"
      />

      {/* Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
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
        <button
          onClick={() => setActiveTab('lich-co-quan')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'lich-co-quan'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Calendar size={16} /> Lịch công tác & Sự kiện
        </button>
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
        <button
          onClick={() => setActiveTab('xe-phong-hop')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'xe-phong-hop'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Building size={16} /> Đăng ký Phòng họp & Xe công tác
        </button>
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
      {activeTab === 'van-ban' && <VanBanPage />}
      {activeTab === 'lich-co-quan' && <LichCoQuanPage />}
      {activeTab === 'cong-viec' && <CongViecPage />}
      {activeTab === 'xe-phong-hop' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-border pb-2">
                <Building size={18} className="text-primary" />
                Đăng ký Phòng họp Trực tuyến (Thuật toán Chống trùng lịch)
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-subtle border border-border">
                  <div>
                    <p className="font-bold text-ink">Phòng Hội thảo Quốc tế (Nhà A1)</p>
                    <p className="text-2xs text-ink-muted">Chủ trì: PGS. TS. Trần Việt Hùng | 09:00 - 11:30</p>
                  </div>
                  <span className="text-2xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Đã duyệt</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-subtle border border-border">
                  <div>
                    <p className="font-bold text-ink">Phòng họp Lãnh đạo Viện (Phòng 402)</p>
                    <p className="text-2xs text-ink-muted">Họp Giao ban Khẩn | 14:00 - 16:00</p>
                  </div>
                  <span className="text-2xs font-bold text-amber-600 bg-amber-50 dark:bg-amber-900/30 px-2 py-1 rounded">Đang chờ duyệt</span>
                </div>
              </div>
            </div>

            <div className="card p-5 space-y-4">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2 border-b border-border pb-2">
                <Car size={18} className="text-emerald-600 dark:text-emerald-400" />
                Điều phối Đội Xe Công tác & Đi Khảo sát Hiện trường
              </h3>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between p-2.5 rounded-lg bg-subtle border border-border">
                  <div>
                    <p className="font-bold text-ink">Xe 7 chỗ (29A-888.99) - Lộ trình Cảng Long Thành</p>
                    <p className="text-2xs text-ink-muted">Đơn vị: Trung tâm Địa kỹ thuật | Lái xe: Nguyễn Văn B</p>
                  </div>
                  <span className="text-2xs font-bold text-blue-600 bg-blue-50 dark:bg-blue-900/30 px-2 py-1 rounded">Đang đi công tác</span>
                </div>
                <div className="flex justify-between p-2.5 rounded-lg bg-subtle border border-border">
                  <div>
                    <p className="font-bold text-ink">Xe 16 chỗ (29B-123.45) - Lộ trình Trạm Hòa Lạc</p>
                    <p className="text-2xs text-ink-muted">Đơn vị: Phòng Thử nghiệm LAS-XD 18 | 08:00 Ngày mai</p>
                  </div>
                  <span className="text-2xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/30 px-2 py-1 rounded">Sẵn sàng xuất phát</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
