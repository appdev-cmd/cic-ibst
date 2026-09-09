import { useEffect, useMemo, useState } from 'react';
import {
  Pencil, Trash2, Phone, Mail, Users, Crown,
  FlaskConical, Handshake, Target, BarChart3, Clock, FileText,
} from 'lucide-react';
import { LOAI_DON_VI } from '../services/org';
import { fetchHopDong, fetchDeTai } from '../services/queries';
import type { DonVi, NhanSu, HopDong, DeTai, LoaiDonVi, TrangThai } from '../types';
import { cn } from '../lib/utils';

/* ── Badge màu theo loại đơn vị (đồng bộ CIC-ERP) ── */
const LOAI_BADGE: Record<LoaiDonVi, string> = {
  'lanh-dao': 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400',
  'phong-chuc-nang': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'vien-chuyen-nganh': 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400',
  'phan-vien': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'trung-tam': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'cong-ty': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
};

/* ── Gradient góc trang trí cho KPI cards (tham khảo UnitDetail CIC-ERP) ── */
const KPI_CONFIG = [
  { key: 'nhanSu', label: 'Nhân sự', icon: Users, gradient: 'from-sky-500/10', iconCls: 'text-sky-600', iconBg: 'bg-sky-100 dark:bg-sky-900/30', valueCls: 'text-sky-600 dark:text-sky-400' },
  { key: 'deTai', label: 'Đề tài', icon: FlaskConical, gradient: 'from-emerald-500/10', iconCls: 'text-emerald-600', iconBg: 'bg-emerald-100 dark:bg-emerald-900/30', valueCls: 'text-emerald-600 dark:text-emerald-400' },
  { key: 'hopDong', label: 'Hợp đồng', icon: Handshake, gradient: 'from-blue-500/10', iconCls: 'text-blue-600', iconBg: 'bg-blue-100 dark:bg-blue-900/30', valueCls: 'text-blue-600 dark:text-blue-400' },
] as const;

/* ── Helpers ── */
function fmtCurrency(trieu: number) {
  if (trieu >= 1000) return `${(trieu / 1000).toFixed(1)} tỷ`;
  return `${trieu.toFixed(0)} triệu`;
}

const STATUS_CLS: Record<string, string> = {
  'dang-thuc-hien': 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  'hoan-thanh': 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  'du-thao': 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
  'cho-ky': 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'tam-dung': 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  'huy': 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
};
function getStatusCls(trangThai: string) {
  return STATUS_CLS[trangThai] ?? 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
}

type DetailTab = 'overview' | 'employees' | 'de-tai' | 'hop-dong' | 'lich-su';

export interface DonViChiTietPanelProps {
  donVi: DonVi;
  nhanSuList: NhanSu[];
  onEdit: () => void;
  onDelete: () => void;
}

export function DonViChiTietPanel({
  donVi,
  nhanSuList,
  onEdit,
  onDelete,
}: DonViChiTietPanelProps) {
  const [tab, setTab] = useState<DetailTab>('overview');

  const nhanSuCuaDonVi = useMemo(
    () => nhanSuList.filter(ns => ns.donViId === donVi.id),
    [nhanSuList, donVi.id],
  );

  const lanhDaoDonVi = useMemo(
    () => nhanSuCuaDonVi.filter(ns =>
      ns.chucDanh?.includes('Viện trưởng') || ns.chucDanh?.includes('Phó Viện trưởng') ||
      ns.chucDanh?.includes('Giám đốc') || ns.chucDanh?.includes('Phó Giám đốc') ||
      ns.chucDanh?.includes('Trưởng phòng') || ns.chucDanh?.includes('Phó phòng') ||
      ns.id === donVi.truongDonViId || ns.id === donVi.phuTrachId,
    ),
    [nhanSuCuaDonVi, donVi.truongDonViId, donVi.phuTrachId],
  );

  // Phân bổ nhân sự theo chức danh
  const phanBoNhanSu = useMemo(() => {
    const map: Record<string, number> = {};
    nhanSuCuaDonVi.forEach(ns => {
      const cd = ns.chucDanh || 'Khác';
      map[cd] = (map[cd] || 0) + 1;
    });
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [nhanSuCuaDonVi]);

  // Hợp đồng + Đề tài của đơn vị
  const [hopDongList, setHopDongList] = useState<HopDong[]>([]);
  const [deTaiList, setDeTaiList] = useState<DeTai[]>([]);
  const [loadingHD, setLoadingHD] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingHD(true);
      try {
        const [allHD, allDT] = await Promise.all([fetchHopDong(), fetchDeTai()]);
        if (!cancelled) {
          setHopDongList(allHD.filter(hd => hd.donViId === donVi.id));
          setDeTaiList(allDT.filter(dt => dt.donViId === donVi.id));
        }
      } catch { /* ignore */ }
      if (!cancelled) setLoadingHD(false);
    })();
    return () => { cancelled = true; };
  }, [donVi.id]);

  // Thống kê HĐ
  const tongGiaTri = hopDongList.reduce((s, hd) => s + hd.giaTri, 0);
  const tongDaThanhToan = hopDongList.reduce((s, hd) => s + hd.daThanhToan, 0);

  const kpiValues: Record<string, number> = {
    nhanSu: donVi.soNhanSu || 0,
    deTai: donVi.soDeTai || 0,
    hopDong: donVi.soHopDong || 0,
  };

  const TABS: { key: DetailTab; label: string; icon: typeof BarChart3; count?: number }[] = [
    { key: 'overview', label: 'Tổng quan', icon: BarChart3 },
    { key: 'employees', label: 'Nhân sự', icon: Users, count: nhanSuCuaDonVi.length },
    { key: 'de-tai', label: 'Đề tài KHCN', icon: FlaskConical, count: donVi.soDeTai || 0 },
    { key: 'hop-dong', label: 'Hợp đồng', icon: Handshake, count: donVi.soHopDong || 0 },
    { key: 'lich-su', label: 'Lịch sử', icon: Clock },
  ];

  return (
    <div className="space-y-5 px-5 py-4">
      {/* ── Header: Badges + Nút thao tác (tham khảo UnitDetail CIC-ERP) ── */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          {donVi.tenVietTat && (
            <span className="text-[10px] font-bold text-ink-muted bg-subtle dark:bg-slate-800 px-2 py-0.5 rounded uppercase">
              {donVi.tenVietTat}
            </span>
          )}
          <span className={cn('text-[10px] font-bold px-2 py-0.5 rounded uppercase', LOAI_BADGE[donVi.loai])}>
            {LOAI_DON_VI.find(l => l.ma === donVi.loai)?.ten || donVi.loai}
          </span>
          <span className="text-[10px] text-ink-muted">
            {donVi.soNhanSu} nhân sự · {donVi.soHopDong} hợp đồng
          </span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <button
            onClick={onEdit}
            className="p-2 bg-primary-subtle dark:bg-primary-900/30 text-primary rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/50 transition-colors"
            title="Sửa đơn vị"
          >
            <Pencil size={16} />
          </button>
          <button
            onClick={onDelete}
            className="p-2 text-ink-muted hover:text-danger hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
            title="Xóa đơn vị"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      {/* ── Tab switcher (tham khảo UnitDetail CIC-ERP) ── */}
      <div className="flex gap-1 p-1 bg-muted dark:bg-slate-900/60 rounded-lg overflow-x-auto">
        {TABS.map(t => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              'flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-bold transition-all whitespace-nowrap',
              tab === t.key
                ? 'bg-surface text-primary shadow-sm dark:text-primary-300'
                : 'text-ink-muted hover:text-ink',
            )}
          >
            <t.icon size={16} />
            {t.label}
            {t.count != null && (
              <span className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-black',
                tab === t.key ? 'bg-primary-subtle text-primary dark:bg-primary-900/40' : 'bg-subtle text-ink-muted',
              )}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab: Tổng quan ── */}
      {tab === 'overview' && (
        <div className="space-y-5">
          {/* KPI cards (tham khảo UnitDetail CIC-ERP) */}
          <div className="grid grid-cols-3 gap-3">
            {KPI_CONFIG.map(kpi => (
              <div
                key={kpi.key}
                className="bg-surface p-4 rounded-lg border border-border dark:border-slate-700/80 relative overflow-hidden"
              >
                {/* Họa tiết góc gradient */}
                <div className={cn('absolute top-0 right-0 w-20 h-20 bg-gradient-to-br to-transparent rounded-bl-full', kpi.gradient)} />
                <div className="flex items-center gap-2 relative">
                  <div className={cn('p-2 rounded-lg', kpi.iconBg)}>
                    <kpi.icon size={16} className={kpi.iconCls} />
                  </div>
                </div>
                <p className="text-xs font-bold text-ink-muted uppercase tracking-wider mt-3">{kpi.label}</p>
                <p className={cn('text-2xl font-black mt-1', kpi.valueCls)}>
                  {kpiValues[kpi.key]}
                </p>
              </div>
            ))}
          </div>

          {/* Ban Lãnh đạo & Phân bổ Nhân sự (song song — tham khảo Top Performers + Phân bổ NS CIC-ERP) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Ban Lãnh đạo */}
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-5">
              <h3 className="text-sm font-black text-ink mb-4 flex items-center gap-2">
                <Crown size={16} className="text-amber-500" />
                Ban Lãnh đạo Đơn vị
              </h3>
              {lanhDaoDonVi.length > 0 ? (
                <div className="space-y-1">
                  {lanhDaoDonVi.map((ns, idx) => (
                    <div key={ns.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                      <div className={cn(
                        'w-7 h-7 rounded-full flex items-center justify-center text-xs font-black',
                        idx === 0 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
                        : idx === 1 ? 'bg-slate-200 text-slate-600 dark:bg-slate-700 dark:text-slate-300'
                        : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
                      )}>
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-ink truncate">{ns.hoTen}</p>
                        <p className="text-xs text-ink-muted truncate">
                          {[ns.hocVi, ns.chucDanh].filter(Boolean).join(' · ')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted italic py-2">Chưa có thông tin lãnh đạo</p>
              )}
            </div>

            {/* Phân bổ Nhân sự */}
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-5">
              <h3 className="text-sm font-black text-ink mb-4 flex items-center gap-2">
                <Users size={16} className="text-primary" />
                Phân bổ Nhân sự
              </h3>
              {phanBoNhanSu.length > 0 ? (
                <div>
                  {phanBoNhanSu.map(([cd, count]) => (
                    <div key={cd} className="flex items-center justify-between py-2 border-b border-border/50 dark:border-slate-700/40 last:border-0">
                      <span className="text-sm text-ink-secondary">{cd}</span>
                      <span className="text-sm font-bold text-ink">{count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-ink-muted italic py-2">Chưa có nhân sự</p>
              )}
            </div>
          </div>

          {/* Chức năng - Nhiệm vụ (tham khảo UnitDetail CIC-ERP) */}
          {donVi.chucNangNhiemVu && (
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-5">
              <h3 className="text-sm font-black text-ink mb-3 flex items-center gap-2">
                <Target size={16} className="text-primary" />
                Chức năng - Nhiệm vụ
              </h3>
              <p className="text-sm text-ink-secondary whitespace-pre-line leading-relaxed">
                {donVi.chucNangNhiemVu}
              </p>
            </div>
          )}

          {/* Liên hệ */}
          {(donVi.dienThoai || donVi.email) && (
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-5">
              <h3 className="text-sm font-black text-ink mb-3">Liên hệ</h3>
              <div className="space-y-2">
                {donVi.dienThoai && (
                  <div className="flex items-center gap-2 text-sm">
                    <Phone size={14} className="text-ink-muted" />
                    <span className="text-ink">{donVi.dienThoai}</span>
                  </div>
                )}
                {donVi.email && (
                  <div className="flex items-center gap-2 text-sm">
                    <Mail size={14} className="text-ink-muted" />
                    <span className="text-ink">{donVi.email}</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Nhân sự ── */}
      {tab === 'employees' && (
        <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-subtle dark:bg-slate-900/60 border-b border-border dark:border-slate-700/80">
                <th className="text-left py-3 px-4 text-[11px] font-black text-ink-muted uppercase tracking-wider">Họ tên</th>
                <th className="text-left py-3 px-3 text-[11px] font-black text-ink-muted uppercase tracking-wider">Chức danh</th>
                <th className="text-left py-3 px-3 text-[11px] font-black text-ink-muted uppercase tracking-wider hidden sm:table-cell">Học vị</th>
                <th className="text-left py-3 px-3 text-[11px] font-black text-ink-muted uppercase tracking-wider hidden lg:table-cell">SĐT</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50 dark:divide-slate-700/40">
              {nhanSuCuaDonVi
                .sort((a, b) => {
                  // Sắp xếp: Trưởng ĐV > Phó > còn lại
                  const priority = (ns: NhanSu) => {
                    if (ns.id === donVi.truongDonViId) return 0;
                    if (ns.chucDanh?.includes('Phó')) return 1;
                    return 2;
                  };
                  return priority(a) - priority(b);
                })
                .map(ns => (
                  <tr key={ns.id} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <div className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-[11px] font-black text-white shrink-0',
                          ns.id === donVi.truongDonViId ? 'bg-gradient-to-br from-amber-500 to-amber-600' : 'bg-gradient-to-br from-slate-400 to-slate-500',
                        )}>
                          {ns.hoTen.charAt(ns.hoTen.lastIndexOf(' ') + 1)}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-ink">{ns.hoTen}</p>
                          {ns.id === donVi.truongDonViId && (
                            <span className="text-[9px] font-black text-amber-600 dark:text-amber-400 uppercase">Trưởng ĐV</span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-sm text-ink-secondary">{ns.chucDanh || '—'}</td>
                    <td className="py-3 px-3 text-sm text-ink-secondary hidden sm:table-cell">{ns.hocVi || '—'}</td>
                    <td className="py-3 px-3 text-sm text-ink-muted hidden lg:table-cell">{ns.soDienThoai || '—'}</td>
                  </tr>
                ))}
              {nhanSuCuaDonVi.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 text-center text-sm text-ink-muted">
                    Đơn vị chưa có nhân sự nào trên hệ thống
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Tab: Đề tài KHCN ── */}
      {tab === 'de-tai' && (
        <div className="space-y-4">
          {/* KPI Đề tài */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-4">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Số đề tài</p>
              <p className="text-xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{deTaiList.length}</p>
            </div>
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-4">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Tổng kinh phí</p>
              <p className="text-lg font-black text-ink mt-1">{fmtCurrency(deTaiList.reduce((s, dt) => s + dt.kinhPhi, 0))}</p>
            </div>
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-4">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Đang thực hiện</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{deTaiList.filter(dt => dt.trangThai === 'dang-thuc-hien').length}</p>
            </div>
          </div>

          {/* Danh sách Đề tài */}
          <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80">
            {loadingHD ? (
              <p className="p-6 text-center text-sm text-ink-muted">Đang tải đề tài...</p>
            ) : deTaiList.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink-muted">Đơn vị chưa có đề tài KHCN nào</p>
            ) : (
              <div className="divide-y divide-border/50 dark:divide-slate-700/40">
                {deTaiList.map(dt => (
                  <div key={dt.id} className="p-3 hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <p className="font-bold text-sm text-ink">{dt.ten}</p>
                        <p className="text-xs text-ink-muted mt-0.5">
                          {dt.maSo && <span className="font-mono text-primary">{dt.maSo}</span>}
                          {dt.maSo && ' · '}
                          CN: {dt.chuNhiem}
                          {dt.kinhPhi > 0 && ` · ${fmtCurrency(dt.kinhPhi)}`}
                        </p>
                      </div>
                      <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full uppercase whitespace-nowrap', getStatusCls(dt.trangThai))}>
                        {dt.trangThai}
                      </span>
                    </div>
                    {/* Progress bar tiến độ */}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden dark:bg-slate-800">
                        <div
                          className="h-full bg-emerald-500 rounded-full transition-all"
                          style={{ width: `${Math.min(dt.tienDo, 100)}%` }}
                        />
                      </div>
                      <span className="text-[10px] font-bold text-ink-muted tabular-nums">{dt.tienDo}%</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Hợp đồng ── */}
      {tab === 'hop-dong' && (
        <div className="space-y-4">
          {/* KPI Hợp đồng */}
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-4">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Số HĐ</p>
              <p className="text-xl font-black text-blue-600 dark:text-blue-400 mt-1">{hopDongList.length}</p>
            </div>
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-4">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Giá trị ký kết</p>
              <p className="text-lg font-black text-ink mt-1">{fmtCurrency(tongGiaTri)}</p>
            </div>
            <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-4">
              <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider">Đã thu</p>
              <p className="text-lg font-black text-emerald-600 dark:text-emerald-400 mt-1">{fmtCurrency(tongDaThanhToan)}</p>
            </div>
          </div>

          {/* Danh sách HĐ (tham khảo "Hợp đồng gần đây" CIC-ERP) */}
          <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80">
            {loadingHD ? (
              <p className="p-6 text-center text-sm text-ink-muted">Đang tải hợp đồng...</p>
            ) : hopDongList.length === 0 ? (
              <p className="p-6 text-center text-sm text-ink-muted">Đơn vị chưa có hợp đồng nào trên hệ thống</p>
            ) : (
              <div className="divide-y divide-border/50 dark:divide-slate-700/40">
                {hopDongList.slice(0, 20).map(hd => (
                  <div key={hd.id} className="flex items-center justify-between p-3 hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                    <div className="min-w-0 flex-1 mr-3">
                      <p className="font-bold text-sm text-ink truncate">{hd.khachHang}</p>
                      <p className="text-xs text-ink-muted mt-0.5">
                        {hd.soHD && <span className="font-mono text-primary">{hd.soHD}</span>}
                        {hd.soHD && ' · '}
                        {fmtCurrency(hd.giaTri)}
                      </p>
                    </div>
                    <span className={cn('text-[10px] font-bold px-2 py-1 rounded-full uppercase whitespace-nowrap', getStatusCls(hd.trangThai))}>
                      {hd.trangThai}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Tab: Lịch sử ── */}
      {tab === 'lich-su' && (
        <div className="bg-surface rounded-lg border border-border dark:border-slate-700/80 p-8 text-center">
          <Clock size={40} className="mx-auto text-ink-muted/40 mb-3" />
          <h4 className="font-bold text-ink mb-1">Lịch sử thay đổi</h4>
          <p className="text-sm text-ink-muted">
            Nhật ký thay đổi nhân sự, cơ cấu và KPI của {donVi.tenVietTat || donVi.ten}.
          </p>
          <p className="text-xs text-ink-muted mt-3 bg-muted rounded-lg px-3 py-2 inline-block">
            Tính năng đang phát triển
          </p>
        </div>
      )}
    </div>
  );
}
