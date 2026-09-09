import { useMemo, useState } from 'react';

/**
 * Tìm kiếm phía client cho bảng dữ liệu.
 * Hỗ trợ cả scroll vô hạn (không phân trang) và phân trang chuẩn.
 * Lọc theo nghiệp vụ (trạng thái, đơn vị...) do trang tự áp trước khi truyền rows vào.
 */
export function useTableControls<T>(
  rows: T[],
  searchText: (row: T) => string,
  pageSize: number = 50, // mặc định 50 — trang nào không phân trang thì bỏ qua
) {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    // Reset về trang 1 khi search thay đổi (qua useEffect riêng là clean hơn,
    // nhưng giữ cách này đơn giản để tương thích caller hiện tại)
    if (!q) return rows;
    return rows.filter((r) => searchText(r).toLowerCase().includes(q));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rows, search]);

  const totalPages = Math.max(1, Math.ceil(filteredRows.length / pageSize));

  const pageRows = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredRows.slice(start, start + pageSize);
  }, [filteredRows, page, pageSize]);

  return {
    search,
    setSearch,
    filteredRows,
    /** Hàng của trang hiện tại (khi dùng phân trang) */
    pageRows,
    total: filteredRows.length,
    /** Trang hiện tại (1-indexed) */
    page,
    /** Tổng số trang */
    totalPages,
    /** Setter trang */
    setPage,
  };
}

