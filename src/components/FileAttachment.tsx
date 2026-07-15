import { useRef, useState } from 'react';
import { Paperclip, Download, Trash2, Upload, LoaderCircle } from 'lucide-react';
import { uploadTepVanBan, getTepVanBanUrl, deleteTepVanBan } from '../services/chitiet';

/** Quản lý tệp đính kèm của một văn bản (Supabase Storage bucket van-ban). */
export function FileAttachment({
  vanBanId,
  tepDinhKem,
  tenTep,
  onChanged,
}: {
  vanBanId: string;
  tepDinhKem: string | null;
  tenTep: string | null;
  onChanged: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const onPick = async (file: File) => {
    setBusy(true);
    setErr(null);
    try {
      await uploadTepVanBan(vanBanId, file);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDownload = async () => {
    if (!tepDinhKem) return;
    setBusy(true);
    try {
      const url = await getTepVanBanUrl(tepDinhKem);
      window.open(url, '_blank');
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const onDelete = async () => {
    if (!tepDinhKem || !window.confirm(`Xóa tệp "${tenTep}"?`)) return;
    setBusy(true);
    setErr(null);
    try {
      await deleteTepVanBan(vanBanId, tepDinhKem);
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="rounded-lg border border-border bg-subtle p-3">
      <p className="mb-2 flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
        <Paperclip size={12} /> Tệp đính kèm
      </p>
      {tepDinhKem ? (
        <div className="flex items-center justify-between gap-2 rounded-lg border border-border bg-surface px-3 py-2">
          <span className="min-w-0 flex-1 truncate text-xs font-medium text-ink">{tenTep}</span>
          <div className="flex shrink-0 gap-1">
            <button
              onClick={onDownload}
              disabled={busy}
              title="Tải xuống"
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600 disabled:opacity-50"
            >
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Download size={14} />}
            </button>
            <button
              onClick={onDelete}
              disabled={busy}
              title="Xóa tệp"
              className="rounded-lg p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger disabled:opacity-50 dark:hover:bg-red-900/20"
            >
              <Trash2 size={14} />
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed border-border py-3 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted disabled:opacity-50"
        >
          {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Upload size={14} />}
          {busy ? 'Đang tải lên...' : 'Chọn tệp để tải lên'}
        </button>
      )}
      {err && <p className="mt-2 text-2xs font-semibold text-danger">{err}</p>}
      <input
        ref={inputRef}
        type="file"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onPick(f);
          e.target.value = '';
        }}
      />
    </div>
  );
}
