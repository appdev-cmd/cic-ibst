import { Search, ChevronLeft, ChevronRight, ChevronDown, Pencil, Trash2, Filter, X } from 'lucide-react';
import type { ReactNode } from 'react';
import { cn } from '../lib/utils';

/** Thanh công cụ bảng chuẩn — đồng bộ visual style với Dashboard filter bar. */
export function TableToolbar({
  search,
  onSearch,
  placeholder,
  total,
  totalLabel = 'bản ghi',
  children,
  actions,
}: {
  search: string;
  onSearch: (v: string) => void;
  placeholder: string;
  total: number;
  totalLabel?: string;
  children?: ReactNode;
  /** Nút hành động (Xuất Excel, Thêm mới...) nằm bên phải */
  actions?: ReactNode;
}) {
  return (
    <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
      {/* Left: icon Filter + search + selects */}
      <div className="flex flex-wrap items-center gap-1.5 bg-surface p-1 rounded-xl border border-border dark:border-slate-700/80 shadow-xs">
        {/* Icon phân biệt vùng lọc */}
        <div className="flex items-center border-r border-border dark:border-slate-700/80 pl-1 pr-2">
          <Filter className="w-3.5 h-3.5 text-primary-500" />
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-ink-muted" />
          <input
            type="search"
            aria-label={placeholder}
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={placeholder}
            className="h-[30px] w-52 sm:w-64 rounded-lg border border-border dark:border-slate-700/80 bg-subtle pl-8 pr-7 text-[12px] font-medium text-ink outline-none transition-colors placeholder:text-ink-muted focus:border-primary-500 focus:ring-1 focus:ring-primary-500/20"
          />
          {search && (
            <button
              onClick={() => onSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
              title="Xóa tìm kiếm"
            >
              <X size={11} />
            </button>
          )}
        </div>

        {/* Filters slot (FilterSelect components) */}
        {children}

        {/* Đếm kết quả */}
        <span className="ml-1 shrink-0 rounded-md bg-subtle px-2 py-1 text-[11px] font-semibold text-ink-muted tabular-nums border border-border dark:border-slate-700/80">
          {total.toLocaleString('vi-VN')} {totalLabel}
        </span>
      </div>

      {/* Right: action buttons */}
      {actions && (
        <div className="flex shrink-0 items-center gap-2">
          {actions}
        </div>
      )}
    </div>
  );
}

/** Select bộ lọc nhỏ gọn dùng kèm TableToolbar — style chuẩn Dashboard. */
export function FilterSelect({
  value,
  onChange,
  options,
  allLabel,
  width,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  allLabel: string;
  width?: string | number;
}) {
  return (
    <div className="relative group">
      <select
        aria-label={allLabel}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        style={width !== undefined ? { width } : undefined}
        className={cn(
          'appearance-none bg-subtle text-ink font-bold text-[12px] rounded-lg pl-2.5 pr-6 py-1.5 outline-none border border-border dark:border-slate-700/80 focus:border-primary-500 transition-colors cursor-pointer',
          value && 'border-primary-400 text-primary-600 dark:border-primary-600 dark:text-primary-300',
        )}
      >
        <option value="">{allLabel}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <ChevronDown className="w-3 h-3 text-ink-muted absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none group-hover:text-primary-500 transition-colors" />
    </div>
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
    <div className="flex items-center justify-end gap-1 border-t border-border dark:border-slate-700/80 px-4 py-2.5">
      <button
        type="button"
        aria-label="Trang trước"
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="icon-button border border-border dark:border-slate-700/80"
      >
        <ChevronLeft size={14} />
      </button>
      <span className="px-2 font-mono text-xs font-semibold text-ink-secondary">
        {page} / {totalPages}
      </span>
      <button
        type="button"
        aria-label="Trang sau"
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="icon-button border border-border dark:border-slate-700/80"
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
        type="button"
        aria-label="Sửa bản ghi"
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        title="Sửa"
        className="icon-button hover:text-primary-600"
      >
        <Pencil size={13} />
      </button>
      <button
        type="button"
        aria-label="Xóa bản ghi"
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        title="Xóa"
        className="icon-button hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20"
      >
        <Trash2 size={13} />
      </button>
    </div>
  );
}
