import type { LucideIcon } from 'lucide-react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { cn } from '../lib/utils';

export function KpiCard({
  icon: Icon,
  label,
  value,
  delta,
  deltaLabel,
  tone = 'primary',
}: {
  icon: LucideIcon;
  label: string;
  value: string;
  delta?: number;
  deltaLabel?: string;
  tone?: 'primary' | 'accent' | 'success' | 'warning';
}) {
  const toneCls = {
    primary: 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
    accent: 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
    success: 'bg-emerald-50 text-success dark:bg-emerald-900/20 dark:text-emerald-400',
    warning: 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
  }[tone];
  return (
    <div className="card p-4 transition-shadow hover:shadow-card-hover">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-2xs font-black uppercase tracking-wider text-ink-muted">{label}</p>
          <p className="mt-1.5 font-mono text-2xl font-semibold text-ink">{value}</p>
        </div>
        <div className={cn('rounded-lg p-2.5', toneCls)}>
          <Icon size={20} strokeWidth={2.2} />
        </div>
      </div>
      {delta !== undefined && (
        <p className="mt-2 flex items-center gap-1 text-xs text-ink-muted">
          {delta >= 0 ? (
            <TrendingUp size={14} className="text-success" />
          ) : (
            <TrendingDown size={14} className="text-danger" />
          )}
          <span className={delta >= 0 ? 'font-semibold text-success' : 'font-semibold text-danger'}>
            {delta >= 0 ? '+' : ''}
            {delta}%
          </span>
          {deltaLabel}
        </p>
      )}
    </div>
  );
}
