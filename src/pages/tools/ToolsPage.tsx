import React, { useState } from 'react';
import { CADViewerContainer } from './cad-viewer/components/CADViewerContainer';
import { FireSafetyLookup } from './fire-safety/FireSafetyLookup';
import { ConstructionClassLookup } from './construction-class/ConstructionClassLookup';
import { ProjectGroupLookup } from './project-group/ProjectGroupLookup';
import { InvestmentCostLookup } from './investment-cost/InvestmentCostLookup';
import { Wrench, FileCode, Calculator, BookOpen, Flame, Hammer, DollarSign } from 'lucide-react';

interface ToolTab {
  id: string;
  name: string;
  icon: React.ElementType;
  component: React.ComponentType;
  description: string;
}

export const ToolsPage: React.FC = () => {
  const [activeTabId, setActiveTabId] = useState<string>('cad-viewer');

  const tabs: ToolTab[] = [
    {
      id: 'cad-viewer',
      name: 'Xem bản vẽ CAD',
      icon: FileCode,
      component: CADViewerContainer,
      description: 'Trình xem bản vẽ kỹ thuật 2D định dạng DXF và đo kích thước trực tiếp.'
    },
    {
      id: 'suat-dau-tu',
      name: 'Tra cứu Suất đầu tư',
      icon: Calculator,
      component: InvestmentCostLookup,
      description: 'Ước tính sơ bộ tổng mức đầu tư xây dựng công trình theo Quyết định số 409/QĐ-BXD mới nhất.'
    },
    {
      id: 'project-group',
      name: 'Tra cứu Nhóm dự án',
      icon: DollarSign,
      component: ProjectGroupLookup,
      description: 'Phân nhóm dự án đầu tư công tự động theo quy mô vốn và lĩnh vực đầu tư (Luật Đầu tư công 58/2024/QH15).'
    },
    {
      id: 'construction-class',
      name: 'Tra cứu Cấp công trình',
      icon: Hammer,
      component: ConstructionClassLookup,
      description: 'Phân cấp công trình xây dựng tự động theo quy mô công suất và quy mô kết cấu (TT 34/2026/TT-BXD).'
    },
    {
      id: 'fire-safety',
      name: 'Tra cứu An toàn cháy',
      icon: Flame,
      component: FireSafetyLookup,
      description: 'Tra cứu nhanh các yêu cầu an toàn cháy PCCC theo QCVN 06:2022/BXD và các tiêu chuẩn liên quan.'
    },
    {
      id: 'tieu-chuan',
      name: 'Tra cứu Tiêu chuẩn (Sắp ra mắt)',
      icon: BookOpen,
      component: () => (
        <div className="flex flex-col items-center justify-center p-12 text-center bg-bg-surface border border-border border-dashed rounded-xl h-96">
          <BookOpen className="w-12 h-12 text-txt-muted mb-4 animate-pulse" />
          <h4 className="text-txt-primary font-black text-base mb-1">Tra cứu Tiêu chuẩn Quốc gia</h4>
          <p className="text-txt-muted text-xs max-w-sm">
            Thư viện tích hợp tra cứu các tiêu chuẩn kỹ thuật xây dựng và văn bản liên quan.
          </p>
        </div>
      ),
      description: 'Tổng hợp danh mục tiêu chuẩn kỹ thuật xây dựng hiện hành.'
    }
  ];

  const ActiveComponent = tabs.find(t => t.id === activeTabId)?.component || (() => null);

  return (
    <div className="space-y-4">
      {/* ── Tiêu đề Module ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border-subtle pb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/20 flex items-center justify-center border border-primary-100 dark:border-primary-900/30">
            <Wrench className="w-5 h-5 text-primary-600 dark:text-primary-500" />
          </div>
          <div>
            <h2 className="text-lg font-black text-txt-primary leading-tight">Công cụ Tiện ích</h2>
            <p className="text-xs text-txt-muted mt-0.5">
              Hỗ trợ cán bộ quản lý kỹ thuật tra cứu, phân tích dữ liệu và xem bản vẽ trực tuyến.
            </p>
          </div>
        </div>
      </div>

      {/* ── Navigation Tabs nhỏ gọn dạng Line/Pill ── */}
      <div className="flex border-b border-border-subtle gap-2 overflow-x-auto no-scrollbar">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = tab.id === activeTabId;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTabId(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition-all border-b-2 -mb-[2px] whitespace-nowrap ${
                isActive
                  ? 'border-primary-500 text-primary-600 dark:text-primary-400 font-extrabold'
                  : 'border-transparent text-txt-muted hover:text-txt-primary hover:border-border-hover'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.name}</span>
            </button>
          );
        })}
      </div>

      {/* ── Nội dung Tab đang chọn ── */}
      <div className="transition-all duration-300">
        <ActiveComponent />
      </div>
    </div>
  );
};

export default ToolsPage;
