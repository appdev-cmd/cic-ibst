import { Search, Pencil, Trash2, Eye } from 'lucide-react';

export interface Column<T> {
  header: string;
  accessor: (item: T, index: number) => React.ReactNode;
  className?: string;
}

export function MasterTable<T extends { id: string }>({
  title,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  columns,
  data,
  onView,
  onEdit,
  onDelete,
  onRowClick,
  actions,
  maxHeight,
}: {
  title?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  columns: Column<T>[];
  data: T[];
  onView?: (item: T) => void;
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  onRowClick?: (item: T) => void;
  /** @deprecated không dùng — scroll thay phân trang */
  page?: number;
  /** @deprecated không dùng */
  totalPages?: number;
  /** @deprecated không dùng */
  onPageChange?: (p: number) => void;
  actions?: React.ReactNode;
  /** Ghi đè chiều cao scroll tối đa, mặc định calc(100vh - 280px) */
  maxHeight?: string;
}) {
  const hasActions = Boolean(onView || onEdit || onDelete);
  const clickable = Boolean(onRowClick || onView);
  const scrollH = maxHeight ?? 'calc(100vh - 280px)';

  return (
    <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
      {(title || onSearchChange || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-4">
          <div className="flex items-center gap-3">
            {title && <h3 className="text-sm font-bold text-ink">{title}</h3>}
            {onSearchChange && (
              <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  type="text"
                  aria-label={searchPlaceholder || 'Tìm kiếm bản ghi'}
                  placeholder={searchPlaceholder || 'Tìm kiếm...'}
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="min-h-10 w-full rounded-lg border border-border bg-subtle py-2 pl-9 pr-3 text-sm text-ink outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 sm:w-64"
                />
              </div>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: scrollH }}>
        <table className="w-full text-left text-sm">
          <thead className="sticky top-0 z-10 border-b border-border bg-subtle text-xs uppercase tracking-wide text-ink-muted font-bold dark:bg-[#1f2332]">
            <tr>
              <th className="px-3 py-3 font-bold text-center w-10">#</th>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 font-bold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {hasActions && <th className="px-4 py-3 font-bold text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (hasActions ? 2 : 1)} className="px-4 py-8 text-center text-xs text-ink-muted italic">
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
            )}
            {data.map((item, rowIdx) => (
              <tr
                key={item.id}
                className={`hover:bg-hover-row transition-colors ${clickable ? 'cursor-pointer' : ''}`}
                onClick={() => {
                  if (onRowClick) onRowClick(item);
                  else if (onView) onView(item);
                }}
              >
                <td className="px-3 py-3 text-center text-xs text-ink-muted tabular-nums">{rowIdx + 1}</td>
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                    {col.accessor(item, rowIdx)}
                  </td>
                ))}
                {hasActions && (
                  <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-end gap-1">
                      {onView && (
                        <button
                          type="button"
                          aria-label="Xem chi tiết bản ghi"
                          onClick={() => onView(item)}
                          className="icon-button hover:text-primary"
                          title="Xem chi tiết"
                        >
                          <Eye size={14} />
                        </button>
                      )}
                      {onEdit && (
                        <button
                          type="button"
                          aria-label="Sửa bản ghi"
                          onClick={() => onEdit(item)}
                          className="icon-button hover:text-primary"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          type="button"
                          aria-label="Xóa bản ghi"
                          onClick={() => onDelete(item)}
                          className="icon-button hover:text-danger"
                          title="Xóa"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
