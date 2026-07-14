import { useEffect, useMemo, useState } from 'react';

/**
 * Tìm kiếm + phân trang phía client cho bảng dữ liệu.
 * Lọc theo nghiệp vụ (trạng thái, đơn vị...) do trang tự áp trước khi truyền rows vào.
 */
export function useTableControls<T>(
  rows: T[],
  searchText: (row: T) => string,
  pageSize = 10,
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => searchText(r).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));

  useEffect(() => {
    if (page > totalPages) setPage(1);
  }, [page, totalPages]);

  const pageRows = useMemo(
    () => filtered.slice((page - 1) * pageSize, page * pageSize),
    [filtered, page, pageSize],
  );

  return {
    search,
    setSearch,
    page,
    setPage,
    totalPages,
    pageRows,
    total: filtered.length,
    pageSize,
  };
}
