import React from 'react';

export interface DashboardKpiCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: React.ElementType;
  color?: 'primary' | 'success' | 'warning' | 'danger' | 'info' | 'accent' | 'gold';
  trend?: string;
  onClick?: () => void;
  className?: string;
}

const colorClasses: Record<string, string> = {
  primary: 'bg-primary-50 text-primary-600 dark:bg-primary-950/40 dark:text-primary-400 border-primary-200/60 dark:border-primary-800/40',
  success: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200/60 dark:border-emerald-800/40',
  warning: 'bg-amber-50 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200/60 dark:border-amber-800/40',
  danger: 'bg-rose-50 text-rose-600 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200/60 dark:border-rose-800/40',
  info: 'bg-sky-50 text-sky-600 dark:bg-sky-950/40 dark:text-sky-400 border-sky-200/60 dark:border-sky-800/40',
  accent: 'bg-purple-50 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400 border-purple-200/60 dark:border-purple-800/40',
  gold: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400 border-yellow-200/60 dark:border-yellow-800/40',
};

export function DashboardKpiCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'primary',
  trend,
  onClick,
  className = '',
}: DashboardKpiCardProps) {
  return (
    <div
      onClick={onClick}
      className={`card p-5 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between ${
        onClick ? 'cursor-pointer hover:border-primary-500/60 dark:hover:border-primary-400/60 group' : ''
      } ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[11px] font-black uppercase tracking-wider text-ink-muted mb-1 truncate">{title}</p>
          <h3 className="text-2xl lg:text-[26px] font-black text-ink tracking-tight font-mono tabular-nums group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {value}
          </h3>
        </div>
        <div className={`p-2.5 rounded-xl border shrink-0 transition-transform duration-200 group-hover:scale-105 ${colorClasses[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>

      {subtitle && (
        <div className="mt-3 pt-2.5 border-t border-border/60 dark:border-slate-700/60 flex items-center justify-between text-2xs text-ink-muted font-medium">
          <span className="truncate pr-1">{subtitle}</span>
          {trend && (
            <span className={`font-bold px-1.5 py-0.5 rounded text-[10px] shrink-0 ${
              trend.startsWith('+') 
                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400' 
                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400'
            }`}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
