import { LoaderCircle, TriangleAlert, Inbox } from 'lucide-react';

export function DataState({
  loading,
  error,
  empty,
}: {
  loading: boolean;
  error: string | null;
  empty: boolean;
}) {
  if (loading) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2 text-xs font-medium text-ink-muted">
        <LoaderCircle size={14} className="animate-spin text-primary-500" />
        Đang tải dữ liệu từ Supabase...
      </div>
    );
  }
  if (error) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
        <TriangleAlert size={14} />
        Lỗi tải dữ liệu: {error}
      </div>
    );
  }
  if (empty) {
    return (
      <div className="mb-4 flex items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2 text-xs font-medium text-ink-muted">
        <Inbox size={14} />
        Chưa có dữ liệu.
      </div>
    );
  }
  return null;
}
