import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Handshake, Microscope, ShieldAlert, FlaskConical } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { formatNgay, cn } from '../lib/utils';

interface Nhac {
  icon: typeof Bell;
  tieuDe: string;
  moTa: string;
  han: string;
  treHan: boolean;
  to: string;
}

const NGAY_30 = 30 * 24 * 3600 * 1000;

/** Chuông thông báo: việc sắp đến/quá hạn (hợp đồng, mẫu TN, đề tài, chứng chỉ). */
export function Notifications() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<Nhac[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    (async () => {
      const now = Date.now();
      const soon = (iso: string | null) => {
        if (!iso) return { show: false, tre: false };
        const t = new Date(iso).getTime();
        return { show: t - now <= NGAY_30, tre: t < now };
      };
      const [hd, mau, dt, cc] = await Promise.all([
        supabase.from('hop_dong').select('so_hop_dong, ten_hop_dong, han_hoan_thanh, trang_thai'),
        supabase.from('mau_thi_nghiem').select('ma_phieu, ten_mau, han_tra, trang_thai'),
        supabase.from('de_tai').select('ma_so, ten_de_tai, han_nghiem_thu, trang_thai'),
        supabase
          .from('chung_chi_hanh_nghe')
          .select('ten_linh_vuc_hanh_nghe, ngay_het_han, nhan_su(ho_va_ten)'),
      ]);

      const list: Nhac[] = [];
      (hd.data ?? []).forEach((r) => {
        if (r.trang_thai === 'hoan-thanh') return;
        const s = soon(r.han_hoan_thanh);
        if (s.show)
          list.push({ icon: Handshake, tieuDe: `HĐ ${r.so_hop_dong}`, moTa: r.ten_hop_dong, han: r.han_hoan_thanh!, treHan: s.tre, to: '/hop-dong' });
      });
      (mau.data ?? []).forEach((r) => {
        if (r.trang_thai === 'hoan-thanh') return;
        const s = soon(r.han_tra);
        if (s.show)
          list.push({ icon: Microscope, tieuDe: `Phiếu ${r.ma_phieu}`, moTa: r.ten_mau, han: r.han_tra!, treHan: s.tre, to: '/thi-nghiem' });
      });
      (dt.data ?? []).forEach((r) => {
        if (r.trang_thai === 'hoan-thanh') return;
        const s = soon(r.han_nghiem_thu);
        if (s.show)
          list.push({ icon: FlaskConical, tieuDe: `Đề tài ${r.ma_so}`, moTa: r.ten_de_tai, han: r.han_nghiem_thu!, treHan: s.tre, to: '/de-tai' });
      });
      (cc.data ?? []).forEach((r) => {
        const s = soon(r.ngay_het_han);
        const ns = r.nhan_su as unknown as { ho_va_ten: string } | null;
        if (s.show)
          list.push({ icon: ShieldAlert, tieuDe: `CC hết hạn — ${ns?.ho_va_ten ?? ''}`, moTa: r.ten_linh_vuc_hanh_nghe, han: r.ngay_het_han!, treHan: s.tre, to: '/nhan-su' });
      });

      list.sort((a, b) => a.han.localeCompare(b.han));
      setItems(list);
    })();
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const soTre = useMemo(() => items.filter((i) => i.treHan).length, [items]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative cursor-pointer rounded-lg p-2 text-ink-muted transition-colors hover:bg-muted hover:text-ink"
      >
        <Bell size={18} />
        {items.length > 0 && (
          <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[9px] font-bold text-white">
            {items.length}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border bg-surface shadow-dropdown animate-fade-in">
          <div className="flex items-center justify-between border-b border-border px-4 py-2.5">
            <h4 className="text-sm font-bold text-ink">Nhắc việc</h4>
            <span className="text-2xs font-semibold text-ink-muted">
              {items.length} việc{soTre > 0 && ` · ${soTre} quá hạn`}
            </span>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {items.length === 0 && (
              <p className="px-4 py-6 text-center text-xs text-ink-muted">Không có việc sắp đến hạn.</p>
            )}
            {items.map((n, i) => (
              <button
                key={i}
                onClick={() => {
                  navigate(n.to);
                  setOpen(false);
                }}
                className="flex w-full items-start gap-3 border-b border-border-subtle px-4 py-2.5 text-left transition-colors last:border-0 hover:bg-muted"
              >
                <n.icon size={16} className={cn('mt-0.5 shrink-0', n.treHan ? 'text-danger' : 'text-primary-500')} />
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-bold text-ink">{n.tieuDe}</p>
                  <p className="truncate text-2xs text-ink-muted">{n.moTa}</p>
                  <p className={cn('mt-0.5 font-mono text-2xs font-semibold', n.treHan ? 'text-danger' : 'text-warning')}>
                    {n.treHan ? 'Quá hạn ' : 'Hạn '}
                    {formatNgay(n.han)}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
