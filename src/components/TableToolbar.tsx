import { Search, ChevronLeft, ChevronRight, Pencil, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/** Thanh công cụ bảng: ô tìm kiếm + chỗ gắn bộ lọc riêng của từng trang + số kết quả. */
export function TableToolbar({
  search,
  onSearch,
  placeholder,
  total,
  children,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  total: number;
  children?: ReactNode;
}) {
  return (
    <div className="mb-3 flex flex-wrap items-center gap-2">
      <div className="relative min-w-56 flex-1 sm:max-w-xs">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
        <input
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={placeholder}
          className="w-full rounded-lg border border-border bg-subtle py-2 pl-9 pr-3 text-sm text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-primary-500"
        />
      </div>
      {children}
      <span className="ml-auto shrink-0 text-xs font-semibold text-ink-muted">
        {total.toLocaleString('vi-VN')} bản ghi
      </span>
    </div>
  );
}

/** Select bộ lọc nhỏ gọn dùng kèm TableToolbar. */
export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'rounded-lg border border-border bg-subtle px-2.5 py-2 text-xs font-semibold text-ink-secondary outline-none transition-colors focus:border-primary-500',
        value && 'border-primary-400 text-primary-600 dark:text-primary-300',
      )}
    >
      <option value="">{allLabel}</option>
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}

/** Phân trang cuối bảng. */
export function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-end gap-1 border-t border-border-subtle px-4 py-2.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="rounded-lg border border-border p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-40"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="px-2 font-mono text-xs font-semibold text-ink-secondary">
        {page} / {totalPages}
      </span>
      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="rounded-lg border border-border p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-ink disabled:opacity-40"
      >
        <ChevronRight size={14} />
      </button>
    </div>
  );
}

/** Cặp nút Sửa/Xóa cuối dòng bảng. */
export function RowActions({
  onEdit,
  onDelete,
}: {
  onEdit: () => void;
  onDelete: () => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Sửa"
        className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
      >
        <Pencil size={13} />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Xóa"
        className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
