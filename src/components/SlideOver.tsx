import { cn } from '../lib/utils';
import type { LucideIcon } from 'lucide-react';

export interface SlideOverTabDef<T extends string> {
  id: T;
  label: string;
  icon: LucideIcon;
}

/** Thanh tab dùng bên trong nội dung 1 slide-panel (xem SlidePanelStack) — độc lập với khung panel. */
export function SlideOverTabs<T extends string>({
  tabs,
  active,
  onChange,
}: {
  tabs: SlideOverTabDef<T>[];
  active: T;
  onChange: (id: T) => void;
}) {
  return (
    <div className="flex gap-1 overflow-x-auto border-b border-border-subtle bg-subtle px-3 pt-2">
      {tabs.map((t) => {
        const Icon = t.icon;
        const isActive = active === t.id;
        return (
          <button
            key={t.id}
            onClick={() => onChange(t.id)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 whitespace-nowrap rounded-t-lg border border-b-0 px-3 py-2 text-2xs font-bold transition-colors',
              isActive
                ? 'border-border-subtle bg-surface text-primary-600 dark:text-primary-300'
                : 'border-transparent text-ink-muted hover:text-ink',
            )}
          >
            <Icon size={13} /> {t.label}
          </button>
        );
      })}
    </div>
  );
}
