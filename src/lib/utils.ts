import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatTrieu(v: number): string {
  if (v >= 1000) return `${(v / 1000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ`;
  return `${v.toLocaleString('vi-VN')} tr`;
}

export function formatNgay(iso: string): string {
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}
