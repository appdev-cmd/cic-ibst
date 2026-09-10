import { useState, useMemo } from 'react';
import {
  Search, Plus, Pencil, Trash2, Building2, Building,
  ChevronRight,
} from 'lucide-react';
import type { DonVi, NhanSu, LoaiDonVi } from '../types';
import { deleteDonVi, LOAI_DON_VI } from '../services/org';
import { cn } from '../lib/utils';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { DonViChiTietPanel } from './DonViChiTietPanel';
import { DonViFormPanel } from './DonViFormPanel';

interface DonViListTabProps {
  donViList: DonVi[];
  nhanSuList: NhanSu[];
  loading: boolean;
  error: string | null;
  onRefresh: () => void;
}

/* ── Gradient icon cho từng loại đơn vị (tham khảo UnitList CIC-ERP) ── */
const LOAI_GRADIENT: Record<LoaiDonVi, string> = {
  'lanh-dao': 'from-rose-500 to-rose-600',
  'phong-chuc-nang': 'from-slate-500 to-slate-600',
  'vien-chuyen-nganh': 'from-sky-500 to-sky-600',
  'phan-vien': 'from-blue-500 to-blue-600',
  'trung-tam': 'from-emerald-500 to-emerald-600',
  'cong-ty': 'from-amber-500 to-amber-600',
};

/* ── Badge màu cho từng loại đơn vị ── */
const LOAI_BADGE: Record<LoaiDonVi, string> = {
  'lanh-dao': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'phong-chuc-nang': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'vien-chuyen-nganh': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'phan-vien': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'trung-tam': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'cong-ty': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

export function DonViListTab({
  donViList,
  nhanSuList,
  loading,
  error,
  onRefresh,
}: DonViListTabProps) {
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<DonVi | null>(null);

  // Lọc bỏ lãnh đạo viện
  const thucThe = useMemo(() => donViList.filter(d => d.loai !== 'lanh-dao'), [donViList]);
  const tongNhanSu = thucThe.reduce((s, d) => s + (d.soNhanSu || 0), 0);

  // Tìm kiếm
  const filteredList = useMemo(() => {
    let list = thucThe;
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(d =>
        d.ten.toLowerCase().includes(q) ||
        (d.tenVietTat || '').toLowerCase().includes(q) ||
        (d.maDinhDanh || '').toLowerCase().includes(q)
      );
    }
    return list.sort((a, b) => (a.thuTu || 99) - (b.thuTu || 99));
  }, [thucThe, search]);

  const selectedDonVi = donViList.find(d => d.id === selectedId) || null;

  // ── Handlers ──
  const handleOpenCreate = () => { setEditing(null); setFormOpen(true); };
  const handleOpenEdit = (dv: DonVi, e?: React.MouseEvent) => {
    e?.stopPropagation(); setEditing(dv); setFormOpen(true);
  };
  const handleDelete = async (dv: DonVi, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!window.confirm(`Xóa đơn vị "${dv.ten}"?\nChỉ xóa được khi không còn dữ liệu tham chiếu.`)) return;
    try {
      await deleteDonVi(dv.id);
      if (selectedId === dv.id) setSelectedId(null);
      onRefresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      alert(msg.includes('foreign key')
        ? 'Không thể xóa: đơn vị đang có dữ liệu tham chiếu (nhân sự, hợp đồng, đề tài...).'
        : `Lỗi xóa đơn vị: ${msg}`);
    }
  };
  const handleSaved = () => { setFormOpen(false); onRefresh(); };

  // ── SlidePanel chi tiết ──
  useSlidePanelChiTiet({
    id: 'don-vi-chi-tiet',
    active: !!selectedDonVi,
    title: selectedDonVi?.ten || 'Chi tiết đơn vị',
    subtitle: selectedDonVi?.tenVietTat ? `(${selectedDonVi.tenVietTat})` : undefined,
    icon: <Building2 className="text-primary" />,
    storageKey: 'dv-chitiet-w',
    deps: [selectedDonVi, nhanSuList],
    onDongNgoaiLuong: () => setSelectedId(null),
    content: selectedDonVi ? (
      <DonViChiTietPanel
        donVi={selectedDonVi}
        nhanSuList={nhanSuList}
        onEdit={() => handleOpenEdit(selectedDonVi)}
        onDelete={() => handleDelete(selectedDonVi)}
      />
    ) : null,
  });

  // ── SlidePanel form ──
  useSlidePanelForm({
    id: 'don-vi-form',
    open: formOpen,
    title: editing ? `Cập nhật: ${editing.tenVietTat ?? editing.ten}` : 'Thêm đơn vị mới',
    storageKey: 'dv-form-w',
    deps: [editing, nhanSuList],
    onDongNgoaiLuong: () => setFormOpen(false),
    content: formOpen ? (
      <DonViFormPanel
        editing={editing}
        nhanSuList={nhanSuList}
        onSaved={handleSaved}
        onClose={() => setFormOpen(false)}
      />
    ) : null,
  });

  return (
    <div className="space-y-5 pt-2">
      {/* ── Header: Tiêu đề + Nút Thêm ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-ink">
            Quản lý Đơn vị ({thucThe.length})
          </h2>
          <p className="text-xs text-ink-muted mt-0.5">
            Danh sách {thucThe.length} đơn vị trực thuộc Viện IBST — {tongNhanSu} CBVC
          </p>
        </div>
        <button className="btn-primary whitespace-nowrap" onClick={handleOpenCreate}>
          <Plus size={16} /> Thêm Đơn vị
        </button>
      </div>

      {/* ── Search bar (tham khảo CIC-ERP) ── */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          type="text"
          placeholder="Tìm kiếm tên đơn vị hoặc mã đơn vị..."
          className="w-full pl-12 pr-4 py-3 bg-surface border border-border dark:border-slate-700/80 rounded-xl focus:ring-2 focus:ring-primary/50 focus:border-primary outline-none text-ink font-medium transition-all"
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      {/* ── Bảng danh sách đơn vị ── */}
      <div className="bg-surface rounded-xl border border-border dark:border-slate-700/80 overflow-hidden">
        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
          <table className="w-full">
            <thead className="sticky top-0 z-10 border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-[#1f2332]">
              <tr>
                <th className="text-left py-3 px-3 text-[11px] font-black text-ink-muted uppercase tracking-wider w-10 text-center">#</th>
                <th className="text-left py-3 px-5 text-[11px] font-black text-ink-muted uppercase tracking-wider">Đơn vị</th>
                <th className="text-left py-3 px-3 text-[11px] font-black text-ink-muted uppercase tracking-wider">Trưởng ĐV</th>
                <th className="text-right py-3 px-3 text-[11px] font-black text-primary uppercase tracking-wider w-28">KH 2026</th>
                <th className="text-right py-3 px-3 text-[11px] font-black text-slate-500 uppercase tracking-wider w-28">CK 2025</th>
                <th className="text-center py-3 px-2 text-[11px] font-black text-sky-500 uppercase tracking-wider w-14">NS</th>
                <th className="text-center py-3 px-2 text-[11px] font-black text-emerald-500 uppercase tracking-wider w-14">ĐT</th>
                <th className="text-center py-3 px-2 text-[11px] font-black text-blue-500 uppercase tracking-wider w-14">HĐ</th>
                <th className="py-3 px-4 w-24"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 dark:divide-slate-700/40">
              {filteredList.map((dv, idx) => (
                <tr
                  key={dv.id}
                  className={cn(
                    'hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors cursor-pointer group',
                    selectedId === dv.id && 'bg-primary-50/50 dark:bg-primary-900/10',
                  )}
                  onClick={() => setSelectedId(dv.id)}
                >
                  {/* Cell: STT */}
                  <td className="py-3 px-3 text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
                  {/* Cell: Đơn vị */}
                  <td className="py-3 px-5">
                    <div className="flex items-center gap-3">
                      <div className={cn(
                        'w-10 h-10 rounded-lg bg-gradient-to-br text-white flex items-center justify-center shrink-0 shadow-sm',
                        LOAI_GRADIENT[dv.loai] || 'from-slate-500 to-slate-600',
                      )}>
                        <Building size={18} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-black text-ink truncate">{dv.ten}</p>
                        <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                          {dv.tenVietTat && (
                            <span className="px-1.5 py-0.5 bg-subtle dark:bg-slate-800 rounded text-[9px] font-black text-ink-muted uppercase">
                              {dv.tenVietTat}
                            </span>
                          )}
                          <span className={cn('px-1.5 py-0.5 rounded text-[9px] font-black uppercase', LOAI_BADGE[dv.loai])}>
                            {LOAI_DON_VI.find(l => l.ma === dv.loai)?.ten || dv.loai}
                          </span>
                        </div>
                      </div>
                    </div>
                  </td>
                  {/* Cell: Trưởng ĐV */}
                  <td className="py-3 px-3">
                    {dv.truongDonVi ? (
                      <div>
                        <p className="text-sm font-bold text-ink truncate">{dv.truongDonVi}</p>
                        {(dv.truongDonViHocVi || dv.truongDonViChucDanh) && (
                          <p className="text-[10px] text-ink-muted mt-0.5 truncate">
                            {[dv.truongDonViHocVi, dv.truongDonViChucDanh].filter(Boolean).join(' · ')}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs text-ink-muted italic">Chờ kiện toàn</span>
                    )}
                  </td>
                  {/* Cell: KH 2026 */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    {dv.keHoachNam ? (
                      <span className="text-sm font-bold text-primary">
                        {(dv.keHoachNam / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                  {/* Cell: Cùng kỳ 2025 */}
                  <td className="py-3 px-3 text-right tabular-nums">
                    {dv.keHoachNamTruoc ? (
                      <span className="text-xs font-semibold text-ink-muted">
                        {(dv.keHoachNamTruoc / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ
                      </span>
                    ) : (
                      <span className="text-xs text-ink-muted">—</span>
                    )}
                  </td>
                  {/* Cell: NS */}
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm font-black text-sky-600 dark:text-sky-400">{dv.soNhanSu || '—'}</span>
                  </td>
                  {/* Cell: ĐT */}
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm font-black text-emerald-600 dark:text-emerald-400">{dv.soDeTai || '—'}</span>
                  </td>
                  {/* Cell: HĐ */}
                  <td className="py-3 px-2 text-center">
                    <span className="text-sm font-black text-blue-600 dark:text-blue-400">{dv.soHopDong || '—'}</span>
                  </td>
                  {/* Cell: Thao tác */}
                  <td className="py-3 px-4" onClick={e => e.stopPropagation()}>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={e => handleOpenEdit(dv, e)}
                        className="p-1.5 text-ink-muted hover:text-primary hover:bg-primary-subtle dark:hover:bg-primary-900/30 rounded-lg transition-colors"
                        title="Sửa"
                      >
                        <Pencil size={15} />
                      </button>
                      <button
                        onClick={e => handleDelete(dv, e)}
                        className="p-1.5 text-ink-muted hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                        title="Xóa"
                      >
                        <Trash2 size={15} />
                      </button>
                      <ChevronRight size={16} className="text-ink-muted/40 ml-1" />
                    </div>
                  </td>
                </tr>
              ))}
              {filteredList.length === 0 && (
                <tr>
                  <td colSpan={9} className="px-5 py-12 text-center text-ink-muted text-sm">
                    {search ? 'Không tìm thấy đơn vị nào phù hợp.' : 'Chưa có đơn vị nào.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile cards */}
        <div className="md:hidden divide-y divide-border dark:divide-slate-700/80">
          {filteredList.map(dv => (
            <div
              key={dv.id}
              className="p-4 cursor-pointer active:bg-muted transition-colors"
              onClick={() => setSelectedId(dv.id)}
            >
              <div className="flex items-center gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-lg bg-gradient-to-br text-white flex items-center justify-center shrink-0',
                  LOAI_GRADIENT[dv.loai] || 'from-slate-500 to-slate-600',
                )}>
                  <Building size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-ink truncate">{dv.ten}</p>
                  <div className="flex items-center gap-1.5 mt-1 flex-wrap text-[10px] text-ink-muted">
                    {dv.tenVietTat && <span className="font-bold uppercase">{dv.tenVietTat}</span>}
                    <span className={cn('px-1.5 py-0.5 rounded font-black uppercase', LOAI_BADGE[dv.loai])}>
                      {LOAI_DON_VI.find(l => l.ma === dv.loai)?.ten}
                    </span>
                    <span>· {dv.soNhanSu} NS · {dv.soHopDong} HĐ</span>
                    {dv.keHoachNam ? (
                      <span className="text-primary font-bold">· KH: {(dv.keHoachNam / 1_000_000).toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tỷ</span>
                    ) : null}
                  </div>
                </div>
                <ChevronRight size={16} className="text-ink-muted/40 shrink-0" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
