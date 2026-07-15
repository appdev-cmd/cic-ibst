import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Handshake, FlaskConical, FileText, Microscope, Users, X } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Hit {
  loai: string;
  icon: typeof Handshake;
  ma: string;
  ten: string;
  to: string;
}

/** Modal tìm kiếm toàn cục (Ctrl+K). Nạp dữ liệu 1 lần khi mở, lọc phía client. */
export function GlobalSearch({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [data, setData] = useState<Hit[] | null>(null);

  useEffect(() => {
    if (!open) {
      setQ('');
      return;
    }
    if (data) return;
    (async () => {
      const [hd, dt, vb, mau, ns] = await Promise.all([
        supabase.from('hop_dong').select('id, so_hop_dong, ten_hop_dong'),
        supabase.from('de_tai').select('id, ma_so, ten_de_tai'),
        supabase.from('van_ban').select('id, so_hieu, trich_yeu'),
        supabase.from('mau_thi_nghiem').select('id, ma_phieu, ten_mau'),
        supabase.from('nhan_su').select('id, ho_va_ten, chuc_danh'),
      ]);
      const hits: Hit[] = [
        ...(hd.data ?? []).map((r) => ({ loai: 'Hợp đồng', icon: Handshake, ma: r.so_hop_dong, ten: r.ten_hop_dong, to: '/hop-dong' })),
        ...(dt.data ?? []).map((r) => ({ loai: 'Đề tài', icon: FlaskConical, ma: r.ma_so, ten: r.ten_de_tai, to: '/de-tai' })),
        ...(vb.data ?? []).map((r) => ({ loai: 'Văn bản', icon: FileText, ma: r.so_hieu, ten: r.trich_yeu, to: '/van-ban' })),
        ...(mau.data ?? []).map((r) => ({ loai: 'Mẫu TN', icon: Microscope, ma: r.ma_phieu, ten: r.ten_mau, to: '/thi-nghiem' })),
        ...(ns.data ?? []).map((r) => ({ loai: 'Nhân sự', icon: Users, ma: r.ho_va_ten, ten: r.chuc_danh ?? '', to: '/nhan-su' })),
      ];
      setData(hits);
    })();
  }, [open, data]);

  const results = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s || !data) return [];
    return data.filter((h) => `${h.ma} ${h.ten}`.toLowerCase().includes(s)).slice(0, 20);
  }, [q, data]);

  if (!open) return null;

  const go = (to: string) => {
    navigate(to);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center bg-black/45 p-4 pt-24 backdrop-blur-sm animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="card w-full max-w-xl overflow-hidden shadow-dropdown animate-fade-in-up">
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search size={16} className="text-ink-muted" />
          <input
            autoFocus
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm hợp đồng, đề tài, văn bản, phiếu thử, nhân sự..."
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
          />
          <button onClick={onClose} className="rounded p-1 text-ink-muted hover:bg-muted">
            <X size={15} />
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto p-2">
          {!data && <p className="px-3 py-6 text-center text-xs text-ink-muted">Đang tải dữ liệu...</p>}
          {data && q && results.length === 0 && (
            <p className="px-3 py-6 text-center text-xs text-ink-muted">Không có kết quả cho "{q}".</p>
          )}
          {!q && data && (
            <p className="px-3 py-6 text-center text-xs text-ink-muted">Nhập từ khóa để tìm trên toàn hệ thống.</p>
          )}
          {results.map((h, i) => (
            <button
              key={i}
              onClick={() => go(h.to)}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition-colors hover:bg-muted"
            >
              <h.icon size={16} className="shrink-0 text-primary-500" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-ink">{h.ma}</p>
                <p className="truncate text-xs text-ink-muted">{h.ten}</p>
              </div>
              <span className="shrink-0 rounded-full bg-subtle px-2 py-0.5 text-2xs font-bold text-ink-muted">
                {h.loai}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
