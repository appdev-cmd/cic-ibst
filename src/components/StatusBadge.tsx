import type { TrangThai } from '../types';
import { cn } from '../lib/utils';

const CONFIG: Record<TrangThai, { label: string; cls: string }> = {
  'hoan-thanh': {
    label: 'Hoàn thành',
    cls: 'bg-emerald-50 text-success border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  },
  'dang-thuc-hien': {
    label: 'Đang thực hiện',
    cls: 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  },
  'cho-duyet': {
    label: 'Chờ duyệt',
    cls: 'bg-blue-50 text-info border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  },
  'qua-han': {
    label: 'Quá hạn',
    cls: 'bg-red-50 text-danger border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  },
  moi: {
    label: 'Mới',
    cls: 'bg-primary-subtle text-primary border-primary-light/40 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700',
  },
};

/** Danh sách trạng thái cho select lọc/form (thứ tự theo vòng đời). */
export const TRANG_THAI_OPTIONS: { value: TrangThai; label: string }[] = (
  ['moi', 'dang-thuc-hien', 'cho-duyet', 'hoan-thanh', 'qua-han'] as TrangThai[]
).map((v) => ({ value: v, label: CONFIG[v].label }));

export function StatusBadge({ value }: { value: TrangThai }) {
  const c = CONFIG[value];
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-black uppercase tracking-wider',
        c.cls,
      )}
    >
      {c.label}
    </span>
  );
}
