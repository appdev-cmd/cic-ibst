import { useEffect, useState } from 'react';
import { FolderOpen, Bot, Shield, FileSpreadsheet, Lock, Search, Sparkles } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { HoSoTaiLieuPage } from './HoSoTaiLieuPage';
import { AiChatbot } from '../components/AiChatbot';
import { cn } from '../lib/utils';
import { usePhanQuyen } from '../hooks/usePhanQuyen';
import { tabDuocPhep, type TaiNguyen } from '../lib/phanQuyen';

type Tab = 'ho-so-tai-lieu' | 'ai-rag-qcvn';
const TAB_IDS: Tab[] = ['ho-so-tai-lieu', 'ai-rag-qcvn'];
const TAB_TAI_NGUYEN: Record<Tab, TaiNguyen> = {
  'ho-so-tai-lieu': 'ho_so_tai_lieu',
  'ai-rag-qcvn': 'ai_rag',
};

export function KhoLuuTruPage() {
  const [activeTab, setActiveTab] = useState<Tab>('ho-so-tai-lieu');

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
        title="Kho Lưu trữ Số hóa Hồ sơ Kỹ thuật & Trợ lý AI-RAG"
        subtitle="Quản lý tập trung bản vẽ CAD/BIM, báo cáo địa kỹ thuật với phân quyền chi tiết (Granular Access Control) & Trợ lý AI-RAG tra cứu Quy chuẩn kỹ thuật QCVN 06:2022/BXD"
      />

      {/* Tabs Switcher — mỗi tab chỉ hiện khi có quyền xem tài nguyên tương ứng (Tầng 3) */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        {tabHienDuoc('ho-so-tai-lieu') && (
          <button
            onClick={() => setActiveTab('ho-so-tai-lieu')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'ho-so-tai-lieu'
                ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            <FolderOpen size={16} /> Kho Bản vẽ CAD/BIM & Hồ sơ Kỹ thuật
          </button>
        )}
        {tabHienDuoc('ai-rag-qcvn') && (
          <button
            onClick={() => setActiveTab('ai-rag-qcvn')}
            className={cn(
              'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
              activeTab === 'ai-rag-qcvn'
                ? 'bg-surface font-black text-emerald-600 dark:text-emerald-400 shadow-card'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            <Sparkles size={16} className="text-emerald-500" /> Trợ lý AI-RAG Tra cứu QCVN / TCVN
          </button>
        )}
      </div>

      {/* Security Level Indicator */}
      <div className="mb-4 rounded-xl border border-emerald-500/20 bg-emerald-50/50 dark:bg-emerald-900/10 p-3 text-xs flex items-center justify-between text-ink">
        <div className="flex items-center gap-2">
          <Lock className="text-emerald-600 dark:text-emerald-400 h-4 w-4" />
          <span><strong>Bảo mật Tài sản Trí tuệ IBST:</strong> Phân quyền Granular Access Control & Đồng bộ lưu trữ NAS 8-bay 50TB phòng chống mã độc (Ransomware RAID 6).</span>
        </div>
        <span className="text-2xs bg-emerald-600 text-white px-2 py-0.5 rounded font-bold">Nghị định 53/2022/NĐ-CP</span>
      </div>

      {/* Tab Contents */}
      {activeTab === 'ho-so-tai-lieu' && tabHienDuoc('ho-so-tai-lieu') && <HoSoTaiLieuPage />}
      {activeTab === 'ai-rag-qcvn' && tabHienDuoc('ai-rag-qcvn') && (
        <div className="space-y-4">
          <div className="card p-4 border-l-4 border-l-emerald-500 bg-subtle/50 flex items-center justify-between">
            <div className="space-y-1">
              <h3 className="font-bold text-sm text-ink flex items-center gap-2">
                <Bot className="text-emerald-600 dark:text-emerald-400 h-5 w-5" />
                Trợ lý Trí tuệ Nhân tạo AI-RAG Tra cứu Quy chuẩn Xây dựng (QCVN 06:2022, TCVN...)
              </h3>
              <p className="text-xs text-ink-muted">
                Truy xuất ngữ nghĩa chính xác từ kho quy chuẩn Bộ Xây dựng. Bạn có thể đặt câu hỏi tự nhiên như: <em>"Giới hạn chịu lửa của tường bao che đối với nhà cao cấp theo QCVN 06 là bao nhiêu?"</em>
              </p>
            </div>
          </div>
          <div className="h-[600px] card overflow-hidden p-2">
            <AiChatbot />
          </div>
        </div>
      )}
    </div>
  );
}
