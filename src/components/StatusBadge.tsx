import type { TrangThai } from '../types';
import { cn } from '../lib/utils';

const CONFIG: Record<string, { label: string; cls: string }> = {
  moi: {
    label: 'Mới',
    cls: 'bg-primary-subtle text-primary border-primary-light/40 dark:bg-primary-900/30 dark:text-primary-300 dark:border-primary-700',
  },
  nhap: {
    label: 'Nháp',
    cls: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  'cho-trinh-duyet': {
    label: 'Chờ trình duyệt',
    cls: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-900/30 dark:text-amber-300',
  },
  'da-duyet': {
    label: 'Đã duyệt VT',
    cls: 'bg-purple-50 text-purple-800 border-purple-300 dark:bg-purple-900/30 dark:text-purple-300',
  },
  'da-ky': {
    label: 'Đã ký HĐ',
    cls: 'bg-emerald-50 text-emerald-800 border-emerald-300 dark:bg-emerald-900/30 dark:text-emerald-300',
  },
  'cho-duyet': {
    label: 'Chờ duyệt',
    cls: 'bg-blue-50 text-info border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  },
  'dang-thuc-hien': {
    label: 'Đang thực hiện',
    cls: 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  },
  'tam-dung': {
    label: 'Tạm dừng',
    cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400 dark:border-orange-800',
  },
  'nghiem-thu': {
    label: 'Nghiệm thu',
    cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400 dark:border-purple-800',
  },
  'quyet-toan': {
    label: 'Quyết toán',
    cls: 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-900/20 dark:text-indigo-400 dark:border-indigo-800',
  },
  'hoan-thanh': {
    label: 'Hoàn thành',
    cls: 'bg-emerald-50 text-success border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  },
  'thanh-ly': {
    label: 'Thanh lý',
    cls: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  },
  huy: {
    label: 'Hủy',
    cls: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-900/20 dark:text-rose-400 dark:border-rose-800',
  },
  'qua-han': {
    label: 'Quá hạn',
    cls: 'bg-red-50 text-danger border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  },

  // ─── Tạp chí ───
  'tiep-nhan': {
    label: 'Tiếp nhận',
    cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  },
  'phan-cong-bien-tap': {
    label: 'Phân công BTV',
    cls: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-900/20 dark:text-cyan-400',
  },
  'cho-phan-bien': {
    label: 'Chờ phản biện',
    cls: 'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400',
  },
  'dang-phan-bien': {
    label: 'Đang phản biện',
    cls: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
  },
  'chinh-sua': {
    label: 'Chỉnh sửa',
    cls: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
  },
  'chap-nhan': {
    label: 'Chấp nhận',
    cls: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400',
  },
  'tu-choi': {
    label: 'Từ chối',
    cls: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400',
  },
  'da-xuat-ban': {
    label: 'Đã xuất bản',
    cls: 'bg-teal-50 text-teal-700 border-teal-200 dark:bg-teal-900/20 dark:text-teal-400',
  },
  'chuan-bi': {
    label: 'Chuẩn bị',
    cls: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800 dark:text-slate-300',
  },
  'bien-tap': {
    label: 'Biên tập',
    cls: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  },
  'in-an': {
    label: 'In ấn',
    cls: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400',
  },
};

/** Danh sách trạng thái cho select lọc/form (thứ tự theo vòng đời). */
export const TRANG_THAI_OPTIONS: { value: TrangThai; label: string }[] = (
  ['moi', 'cho-duyet', 'dang-thuc-hien', 'tam-dung', 'nghiem-thu', 'quyet-toan', 'hoan-thanh', 'thanh-ly', 'huy', 'qua-han'] as TrangThai[]
).map((v) => ({ value: v, label: CONFIG[v]?.label || v }));

export function StatusBadge({ value }: { value: TrangThai | string }) {
  const c = CONFIG[value] || {
    label: value || 'Chưa xác định',
    cls: 'bg-subtle text-ink-secondary border-border',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border px-2 py-0.5 text-2xs font-black uppercase tracking-wider',
        c.cls,
      )}
    >
      {c.label}
    </span>
  );
}
