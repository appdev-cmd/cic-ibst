import { Building2, FileText, Gavel, Wallet, Receipt, Phone, Mail, MapPin, User } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { DataState } from './DataState';
import { KpiCard } from './KpiCard';
import { StatusBadge } from './StatusBadge';
import {
  fetchKhachHangChiTiet,
  LOAI_KHACH_HANG_OPTIONS,
  type KhachHang,
} from '../services/khachHang';
import type { TrangThai, TrangThaiDauThau } from '../types';
import { formatTrieu, formatNgay } from '../lib/utils';

const DAU_THAU_LABEL: Record<TrangThaiDauThau, { label: string; cls: string }> = {
  'chuan-bi': { label: 'Chuẩn bị HS', cls: 'bg-subtle text-ink-muted' },
  'da-nop': { label: 'Đã nộp HS', cls: 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300' },
  'trung-thau': { label: 'Trúng thầu', cls: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' },
  truot: { label: 'Trượt thầu', cls: 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  huy: { label: 'Hủy', cls: 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300' },
};

/** Hồ sơ 360° khách hàng: thông tin pháp nhân + lịch sử hợp đồng + lịch sử dự thầu. */
export function KhachHangChiTietPanel({ khachHang }: { khachHang: KhachHang }) {
  const { data, loading, error } = useAsyncData(() => fetchKhachHangChiTiet(khachHang.id), { hopDongs: [], dauThaus: [] });

  const tongGiaTri = data.hopDongs.reduce((a, b) => a + b.giaTri, 0);
  const tongDaThu = data.hopDongs.reduce((a, b) => a + b.daThanhToan, 0);
  const congNo = Math.max(0, tongGiaTri - tongDaThu);
  const soGoiTrung = data.dauThaus.filter((d) => d.trangThai === 'trung-thau').length;

  return (
    <div className="space-y-5 p-4">
      {/* Thông tin pháp nhân */}
      <div className="rounded-lg border border-border p-3 space-y-2">
        <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">Thông tin pháp nhân</h4>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
          <p className="flex items-center gap-1.5 text-ink-secondary"><Building2 size={12} className="text-ink-muted shrink-0" /> MST: <span className="font-mono font-bold text-ink">{khachHang.maSoThue || '—'}</span></p>
          <p className="text-ink-secondary">
            Phân loại: <span className="font-bold text-ink">{LOAI_KHACH_HANG_OPTIONS.find((o) => o.value === khachHang.loai)?.label ?? khachHang.loai}</span>
          </p>
          <p className="flex items-center gap-1.5 text-ink-secondary"><User size={12} className="text-ink-muted shrink-0" /> {khachHang.nguoiDaiDien || '—'}</p>
          <p className="flex items-center gap-1.5 text-ink-secondary"><Phone size={12} className="text-ink-muted shrink-0" /> {khachHang.soDienThoai || '—'}</p>
          <p className="flex items-center gap-1.5 text-ink-secondary"><Mail size={12} className="text-ink-muted shrink-0" /> {khachHang.email || '—'}</p>
          <p className="col-span-2 flex items-start gap-1.5 text-ink-secondary"><MapPin size={12} className="text-ink-muted shrink-0 mt-0.5" /> {khachHang.diaChi || '—'}</p>
        </div>
      </div>

      <DataState loading={loading} error={error} empty={false} />

      {/* KPI tổng hợp */}
      <div className="grid grid-cols-2 gap-3">
        <KpiCard icon={Wallet} label="Tổng giá trị HĐ" value={formatTrieu(tongGiaTri)} tone="primary" />
        <KpiCard icon={Receipt} label="Công nợ phải thu" value={formatTrieu(congNo)} tone="warning" />
        <KpiCard icon={FileText} label="Số hợp đồng" value={String(data.hopDongs.length)} tone="success" />
        <KpiCard icon={Gavel} label="Gói thầu trúng" value={`${soGoiTrung}/${data.dauThaus.length}`} tone="accent" />
      </div>

      {/* Hợp đồng đã ký */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border-subtle px-3 py-2">
          <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">Hợp đồng đã ký</h4>
        </div>
        <div className="divide-y divide-border-subtle">
          {data.hopDongs.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-ink-muted">Chưa có hợp đồng nào.</p>
          )}
          {data.hopDongs.map((h) => (
            <div key={h.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{h.soHD} — {h.ten}</p>
                <p className="text-2xs text-ink-muted">
                  {h.ngayKy ? formatNgay(h.ngayKy) : 'Chưa ký'} · Giá trị {formatTrieu(h.giaTri)} · Đã thu {formatTrieu(h.daThanhToan)}
                </p>
              </div>
              <StatusBadge value={h.trangThai as TrangThai} />
            </div>
          ))}
        </div>
      </div>

      {/* Lịch sử đấu thầu */}
      <div className="rounded-lg border border-border">
        <div className="border-b border-border-subtle px-3 py-2">
          <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">Lịch sử gói thầu tham gia</h4>
        </div>
        <div className="divide-y divide-border-subtle">
          {data.dauThaus.length === 0 && (
            <p className="px-3 py-4 text-center text-xs text-ink-muted">Chưa tham gia gói thầu nào.</p>
          )}
          {data.dauThaus.map((d) => (
            <div key={d.id} className="flex items-center justify-between gap-3 px-3 py-2 text-xs">
              <div className="min-w-0">
                <p className="font-bold text-ink truncate">{d.tenGoiThau}</p>
                <p className="text-2xs text-ink-muted">
                  {d.ngayMoThau ? formatNgay(d.ngayMoThau) : 'Chưa mở thầu'} · Dự thầu {d.giaDuThau != null ? formatTrieu(d.giaDuThau) : '—'}
                  {d.giaTrungThau != null && ` · Trúng ${formatTrieu(d.giaTrungThau)}`}
                </p>
              </div>
              <span className={`inline-flex shrink-0 rounded-full px-2 py-0.5 text-2xs font-bold ${DAU_THAU_LABEL[d.trangThai as TrangThaiDauThau]?.cls ?? 'bg-subtle text-ink-muted'}`}>
                {DAU_THAU_LABEL[d.trangThai as TrangThaiDauThau]?.label ?? d.trangThai}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
