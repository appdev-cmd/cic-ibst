import { memo } from 'react';
import { Building2, Landmark } from 'lucide-react';
import { cn } from '../lib/utils';

export interface ParsedCustomer {
  mainName: string;
  tag: string | null;
  subName: string | null;
  isState: boolean;
}

/**
 * Phân tích và chuẩn hóa tên khách hàng / chủ đầu tư:
 * - Tách mã viết tắt ngắn trong ngoặc đơn (<= 8 ký tự): (ACV), (MRB), (EVN), (THT)...
 * - Tách đơn vị phân cấp / cơ quan chủ quản qua dấu gạch ngang (—): Vingroup — Vinhomes, BQL 85 — Bộ GTVT...
 * - Tách ghi chú dự án dài trong ngoặc: (KĐT Starlake Tây Hồ Tây)...
 * - Tự động nhận diện cơ quan nhà nước / Ban QLDA (Landmark) vs Doanh nghiệp (Building2)
 */
export function parseCustomerName(rawName: string | null | undefined): ParsedCustomer | null {
  if (!rawName || rawName === '—' || !rawName.trim()) return null;

  let mainName = rawName.trim();
  let tag: string | null = null;
  let subName: string | null = null;

  // 1. Phân tách dấu gạch ngang phân cấp (em-dash " — " hoặc hyphen " - ")
  if (mainName.includes(' — ')) {
    const parts = mainName.split(' — ');
    mainName = parts[0].trim();
    subName = parts.slice(1).join(' — ').trim();
  } else if (mainName.includes(' - ') && !mainName.startsWith('KH-')) {
    const parts = mainName.split(' - ');
    if (parts[0].length >= 5) {
      mainName = parts[0].trim();
      subName = parts.slice(1).join(' - ').trim();
    }
  }

  // 2. Tách thẻ ngoặc đơn ở cuối chuỗi: ví dụ "(ACV)", "(MRB)", "(KĐT Starlake...)"
  const parenMatch = mainName.match(/\s*\(([^)]+)\)\s*$/);
  if (parenMatch) {
    const inside = parenMatch[1].trim();
    mainName = mainName.replace(parenMatch[0], '').trim();
    // Nếu ngắn (<= 8 ký tự, không dấu cách hoặc tối đa 1 từ) => Mã viết tắt
    if (inside.length <= 8 && !inside.includes(' ')) {
      tag = inside;
    } else {
      subName = subName ? `${subName} • ${inside}` : inside;
    }
  }

  // 3. Phân loại đối tượng: Cơ quan Nhà nước / Sở / Ban QLDA / Bộ / UBND vs Doanh nghiệp
  const isState = /^(Sở\s|Ban\s+Quản\s+lý|Bộ\s|UBND|Chi\s+cục|Cục\s|Viện\s|Trung\s+tâm\s+hành\s+chính)/i.test(mainName);

  return {
    mainName,
    tag,
    subName,
    isState,
  };
}

interface KhachHangCellProps {
  name: string | null | undefined;
  className?: string;
  showIcon?: boolean;
}

export const KhachHangCell = memo(function KhachHangCell({
  name,
  className,
  showIcon = true,
}: KhachHangCellProps) {
  const parsed = parseCustomerName(name);

  if (!parsed) {
    return <span className="text-xs text-ink-muted italic">—</span>;
  }

  const { mainName, tag, subName, isState } = parsed;
  const Icon = isState ? Landmark : Building2;

  return (
    <div className={cn('flex items-start gap-2 min-w-0 max-w-sm', className)} title={name || ''}>
      {showIcon && (
        <div
          className={cn(
            'mt-0.5 shrink-0 rounded-md p-1 border transition-colors',
            isState
              ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/25 dark:border-amber-500/30'
              : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/25 dark:border-sky-500/30'
          )}
        >
          <Icon size={13} className="shrink-0" />
        </div>
      )}

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-xs text-ink dark:text-slate-100 truncate leading-snug">
            {mainName}
          </span>
          {tag && (
            <span className="shrink-0 rounded bg-slate-100 dark:bg-slate-800 border border-border dark:border-slate-700/80 px-1.5 py-0.2 text-[10px] font-extrabold tracking-wide text-slate-700 dark:text-slate-300">
              {tag}
            </span>
          )}
        </div>
        {subName && (
          <p className="text-[11px] text-ink-muted dark:text-slate-400 truncate mt-0.5 font-medium leading-tight">
            {subName}
          </p>
        )}
      </div>
    </div>
  );
});
