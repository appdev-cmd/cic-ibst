import { Search, Pencil, Trash2 } from 'lucide-react';
import { TableToolbar, Pagination } from './TableToolbar';

export interface Column<T> {
  header: string;
  accessor: (item: T) => React.ReactNode;
  className?: string;
}

export function MasterTable<T extends { id: string }>({
  title,
  searchPlaceholder,
  searchQuery,
  onSearchChange,
  columns,
  data,
  onEdit,
  onDelete,
  page,
  totalPages,
  onPageChange,
  actions,
}: {
  title?: string;
  searchPlaceholder?: string;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
  columns: Column<T>[];
  data: T[];
  onEdit?: (item: T) => void;
  onDelete?: (item: T) => void;
  page?: number;
  totalPages?: number;
  onPageChange?: (p: number) => void;
  actions?: React.ReactNode;
}) {
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
                  placeholder={searchPlaceholder || 'Tìm kiếm...'}
                  value={searchQuery || ''}
                  onChange={(e) => onSearchChange(e.target.value)}
                  className="w-64 rounded-lg border border-border bg-subtle pl-8 pr-3 py-1.5 text-xs text-ink outline-none focus:border-primary-500"
                />
              </div>
            )}
          </div>
          {actions && <div>{actions}</div>}
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-border bg-subtle text-2xs uppercase tracking-wider text-ink-muted font-bold">
            <tr>
              {columns.map((col, idx) => (
                <th key={idx} className={`px-4 py-3 font-bold ${col.className || ''}`}>
                  {col.header}
                </th>
              ))}
              {(onEdit || onDelete) && <th className="px-4 py-3 font-bold text-right">Thao tác</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-border-subtle">
            {data.length === 0 && (
              <tr>
                <td colSpan={columns.length + (onEdit || onDelete ? 1 : 0)} className="px-4 py-8 text-center text-xs text-ink-muted italic">
                  Không tìm thấy dữ liệu phù hợp
                </td>
              </tr>
            )}
            {data.map((item) => (
              <tr key={item.id} className="hover:bg-hover-row transition-colors">
                {columns.map((col, idx) => (
                  <td key={idx} className={`px-4 py-3 ${col.className || ''}`}>
                    {col.accessor(item)}
                  </td>
                ))}
                {(onEdit || onDelete) && (
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      {onEdit && (
                        <button
                          onClick={() => onEdit(item)}
                          className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary transition-colors"
                          title="Sửa"
                        >
                          <Pencil size={14} />
                        </button>
                      )}
                      {onDelete && (
                        <button
                          onClick={() => onDelete(item)}
                          className="rounded p-1 text-ink-muted hover:bg-muted hover:text-danger transition-colors"
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

      {page && totalPages && totalPages > 1 && onPageChange && (
        <div className="border-t border-border p-3 flex justify-end">
          <Pagination page={page} totalPages={totalPages} onChange={onPageChange} />
        </div>
      )}
    </div>
  );
}
