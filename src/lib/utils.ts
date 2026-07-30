import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Định dạng số tiền. THAM SỐ TÍNH BẰNG TRIỆU ĐỒNG — đúng với đơn vị đang lưu trong CSDL
 * (hop_dong.gia_tri = 24000 nghĩa là 24 tỷ) và với ngưỡng Điều 6.1 trong qc2815.ts
 * (2000/5000/10000 = 2/5/10 tỷ). Không đổi sang VNĐ nếu chưa migrate đồng bộ cả 3 nơi.
 */
export function formatTrieu(v: number): string {
  if (!v) return '0 đ';
  if (v >= 1000) {
    return `${(v / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tỷ`;
  }
  return `${v.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} triệu`;
}

export function formatNgay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Xuất mảng object ra file CSV (UTF-8 BOM để Excel đọc đúng tiếng Việt). */
export function exportCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const esc = (v: string | number) => {
    const s = String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const csv = [headers, ...rows].map((r) => r.map(esc).join(',')).join('\n');
  const blob = new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

/** Format raw or formatted string into Vietnamese number format: 11.111.111,5 (thousand dot, decimal comma). */
export function formatVNNumber(val: string | number | null | undefined): string {
  if (val === null || val === undefined || val === '') return '';
  const strVal = String(val).trim();
  if (!strVal) return '';

  if (typeof val === 'number') {
    const [intP, decP] = String(val).split('.');
    const formattedInt = intP.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return decP ? `${formattedInt},${decP}` : formattedInt;
  }

  let decimalPart = '';
  let integerPart = strVal;

  if (strVal.includes(',')) {
    const parts = strVal.split(',');
    integerPart = parts[0];
    decimalPart = parts.slice(1).join('');
  } else if (strVal.includes('.')) {
    const dotParts = strVal.split('.');
    if (dotParts.length === 2 && dotParts[1].length <= 4 && /^\d+$/.test(dotParts[1])) {
      integerPart = dotParts[0];
      decimalPart = dotParts[1];
    } else {
      integerPart = strVal.replace(/\./g, '');
    }
  }

  const cleanInt = integerPart.replace(/\D/g, '');
  if (!cleanInt && !decimalPart) return '';

  const formattedInt = cleanInt.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  if (strVal.endsWith(',') || (strVal.includes(',') && decimalPart === '')) {
    return `${formattedInt},`;
  }
  if (decimalPart) {
    const cleanDec = decimalPart.replace(/\D/g, '');
    return `${formattedInt},${cleanDec}`;
  }
  return formattedInt;
}

/** Parse Vietnamese formatted string ("11.111.111,5") back to raw numeric string ("11111111.5"). */
export function parseVNNumber(val: string): string {
  if (!val) return '';
  const noDots = val.replace(/\./g, '');
  const withDot = noDots.replace(',', '.');
  return withDot.replace(/[^\d.]/g, '');
}
