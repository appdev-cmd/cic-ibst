// Đọc đơn vị bản vẽ từ header DXF ($INSUNITS) và định dạng kết quả đo

export interface DxfUnitInfo {
  code: number;
  label: string;   // Nhãn hiển thị: mm, m, cm...
  toMm: number;    // Hệ số quy đổi 1 đơn vị bản vẽ → mm
  assumed: boolean; // true nếu bản vẽ không khai báo, phải giả định mm
}

// Bảng mã $INSUNITS theo chuẩn DXF
const INSUNITS_MAP: Record<number, { label: string; toMm: number }> = {
  1: { label: 'inch', toMm: 25.4 },
  2: { label: 'ft', toMm: 304.8 },
  4: { label: 'mm', toMm: 1 },
  5: { label: 'cm', toMm: 10 },
  6: { label: 'm', toMm: 1000 },
  7: { label: 'km', toMm: 1e6 },
  10: { label: 'yd', toMm: 914.4 },
  13: { label: 'µm', toMm: 0.001 },
  14: { label: 'dm', toMm: 100 },
};

/**
 * Lấy thông tin đơn vị của bản vẽ. Bản vẽ VN không khai báo ($INSUNITS = 0
 * hoặc thiếu) sẽ giả định là mm — quy ước phổ biến trong bản vẽ xây dựng.
 */
export function getDxfUnits(dxfData: any): DxfUnitInfo {
  const raw = dxfData?.header?.['$INSUNITS'];
  const code = typeof raw === 'number' ? raw : 0;
  const known = INSUNITS_MAP[code];

  if (known) {
    return { code, label: known.label, toMm: known.toMm, assumed: false };
  }
  return { code, label: 'mm', toMm: 1, assumed: true };
}

/** Định dạng khoảng cách (đầu vào mm) → chuỗi dễ đọc */
export function formatDistanceMm(mm: number): string {
  if (!isFinite(mm)) return '—';
  if (Math.abs(mm) >= 1000) {
    return `${(mm / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} m`;
  }
  return `${mm.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} mm`;
}

/** Định dạng diện tích (đầu vào mm²) → chuỗi dễ đọc */
export function formatAreaMm2(mm2: number): string {
  if (!isFinite(mm2)) return '—';
  if (Math.abs(mm2) >= 1e6) {
    return `${(mm2 / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} m²`;
  }
  return `${mm2.toLocaleString('vi-VN', { maximumFractionDigits: 0 })} mm²`;
}
