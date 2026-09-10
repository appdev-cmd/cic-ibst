import { useMemo, useState } from 'react';
import {
  Plus,
  Network,
  Users,
  Pencil,
  Trash2,
  Phone,
  Mail,
  BadgeCheck,
  FlaskConical,
  Handshake,
  Building2,
  LoaderCircle,
  GitBranch,
  List,
  Crown,
  Award,
  MapPin,
  Globe,
  ExternalLink,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { OrgChartTree } from '../components/OrgChartTree';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  LOAI_DON_VI,
  fetchDonVi,
  fetchNhanSuFull,
  deleteDonVi,
} from '../services/org';
import type { DonVi, LoaiDonVi } from '../types';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { DonViChiTietPanel } from '../components/DonViChiTietPanel';
import { DonViFormPanel } from '../components/DonViFormPanel';
import { cn } from '../lib/utils';

const LOAI_BADGE: Record<LoaiDonVi, string> = {
  'lanh-dao': 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  'phong-chuc-nang': 'bg-subtle text-ink-secondary',
  'vien-chuyen-nganh': 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'phan-vien': 'bg-blue-50 text-info dark:bg-blue-900/20 dark:text-blue-400',
  'trung-tam': 'bg-emerald-50 text-success dark:bg-emerald-900/20 dark:text-emerald-400',
  'cong-ty': 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
};

export function DonViPage({ hideHeader = false, mode = 'full' }: { hideHeader?: boolean; mode?: 'full' | 'orgchart-only' } = {}) {
  const { data: donViList, loading, error, refetch } = useAsyncData(fetchDonVi, []);
  const { data: nhanSuList } = useAsyncData(fetchNhanSuFull, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DonVi | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const selected =
    donViList.find((d) => d.id === selectedId) ?? donViList[0] ?? null;

  const nhanSuCuaDonVi = useMemo(
    () => nhanSuList.filter((ns) => selected && ns.donViId === selected.id),
    [nhanSuList, selected],
  );

  // Phân nhóm nhân sự đơn vị: Ban Lãnh đạo vs Cán bộ nghiên cứu/kỹ sư
  const lanhDaoDonVi = useMemo(
    () =>
      nhanSuCuaDonVi.filter((ns) =>
        /trưởng phòng|phó phòng|giám đốc|phó giám đốc|viện trưởng|phó viện trưởng/i.test(
          ns.chucDanh || '',
        ),
      ),
    [nhanSuCuaDonVi],
  );

  const canBoDonVi = useMemo(
    () =>
      nhanSuCuaDonVi.filter(
        (ns) =>
          !/trưởng phòng|phó phòng|giám đốc|phó giám đốc|viện trưởng|phó viện trưởng/i.test(
            ns.chucDanh || '',
          ),
      ),
    [nhanSuCuaDonVi],
  );

  // Danh sách ứng viên cho chức danh Trưởng đơn vị trong modal
  const tongNhanSu = donViList.reduce((s, d) => s + d.soNhanSu, 0);
  const soVienPhanVien = donViList.filter(
    (d) => d.loai === 'vien-chuyen-nganh' || d.loai === 'phan-vien',
  ).length;
  const soTrungTam = donViList.filter((d) => d.loai === 'trung-tam').length;
  const soDonVi = donViList.filter((d) => d.loai !== 'lanh-dao').length;

  // SlidePanel cho mode orgchart-only: click đơn vị trên sơ đồ → mở SlidePanel
  useSlidePanelChiTiet({
    id: 'orgchart-don-vi-chi-tiet',
    active: mode === 'orgchart-only' && !!selectedId,
    title: selected?.ten || 'Chi tiết đơn vị',
    subtitle: selected?.tenVietTat ? `(${selected.tenVietTat})` : undefined,
    icon: <Building2 className="text-primary" />,
    storageKey: 'orgchart-dv-chitiet-w',
    deps: [selected, nhanSuList],
    onDongNgoaiLuong: () => setSelectedId(null),
    content: selected ? (
      <DonViChiTietPanel
        donVi={selected}
        nhanSuList={nhanSuList}
        onEdit={() => openEdit(selected)}
        onDelete={() => handleDelete(selected)}
      />
    ) : null,
  });

  useSlidePanelForm({
    id: 'orgchart-don-vi-form',
    open: modalOpen,
    title: editing ? `Sửa đơn vị: ${editing.tenVietTat ?? editing.ten}` : 'Thêm đơn vị trực thuộc',
    storageKey: 'orgchart-dv-form-w',
    deps: [editing, nhanSuList],
    onDongNgoaiLuong: () => setModalOpen(false),
    content: modalOpen ? (
      <DonViFormPanel
        editing={editing}
        nhanSuList={nhanSuList}
        onSaved={() => { setModalOpen(false); refetch(); }}
        onClose={() => setModalOpen(false)}
      />
    ) : null,
  });

  const openCreate = () => {
    setEditing(null);
    setActionError(null);
    setModalOpen(true);
  };

  const openEdit = (dv: DonVi) => {
    setEditing(dv);
    setActionError(null);
    setModalOpen(true);
  };

  const handleDelete = async (dv: DonVi) => {
    if (
      !window.confirm(
        `Xóa đơn vị "${dv.ten}"?\nChỉ xóa được khi không còn dữ liệu (nhân sự, hợp đồng, đề tài...) tham chiếu.`,
      )
    )
      return;
    setActionError(null);
    try {
      await deleteDonVi(dv.id);
      if (selectedId === dv.id) setSelectedId(null);
      refetch();
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      setActionError(
        msg.includes('foreign key')
          ? 'Không thể xóa: đơn vị đang có dữ liệu tham chiếu (nhân sự, hợp đồng, đề tài, văn bản...).'
          : msg,
      );
    }
  };

  return (
    <div>
      {!hideHeader ? (
        <PageHeader
          title="Đơn vị - Tổ chức"
          subtitle="Cơ cấu tổ chức và chức năng nhiệm vụ 19 đơn vị trực thuộc — theo ibst.vn"
          actions={
            <button className="btn-primary" onClick={openCreate}>
              <Plus size={16} /> Thêm đơn vị
            </button>
          }
        />
      ) : (
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-ink">Sơ đồ cơ cấu tổ chức & Đơn vị trực thuộc</h3>
            <p className="text-xs text-ink-muted">Cơ cấu 19 đơn vị trực thuộc và sơ đồ cây phân cấp Viện IBST</p>
          </div>
          <button className="btn-primary" onClick={openCreate}>
            <Plus size={16} /> Thêm đơn vị
          </button>
        </div>
      )}

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Network} label="Đơn vị trực thuộc" value={String(soDonVi)} tone="primary" />
        <KpiCard icon={Building2} label="Viện chuyên ngành / Phân viện" value={String(soVienPhanVien)} tone="accent" />
        <KpiCard icon={BadgeCheck} label="Trung tâm" value={String(soTrungTam)} tone="success" />
        <KpiCard icon={Users} label="CBVC trên hệ thống" value={String(tongNhanSu)} tone="warning" />
      </div>

      <DataState loading={loading} error={error} empty={donViList.length === 0} />
      {actionError && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {actionError}
        </div>
      )}

      <div className="mb-4 card overflow-hidden">
        {mode !== 'orgchart-only' && (
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <h3 className="text-sm font-bold">Sơ đồ cơ cấu tổ chức</h3>
          <div className="flex items-center gap-1 rounded-lg bg-muted p-0.5">
            <button
              onClick={() => setView('tree')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all',
                view === 'tree'
                  ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              <GitBranch size={13} /> Sơ đồ cây
            </button>
            <button
              onClick={() => setView('list')}
              className={cn(
                'flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-bold transition-all',
                view === 'list'
                  ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
                  : 'text-ink-muted hover:text-ink',
              )}
            >
              <List size={13} /> Danh sách
            </button>
          </div>
        </div>
        )}

        {(mode === 'orgchart-only' || view === 'tree') ? (
          <OrgChartTree
            donViList={donViList}
            nhanSuList={nhanSuList}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
            isPanelOpen={mode === 'orgchart-only' && !!selectedId}
          />
        ) : (
          <div className="max-h-[560px] overflow-y-auto p-3">
            {LOAI_DON_VI.map(({ ma, ten }) => {
              const items = donViList.filter((d) => d.loai === ma);
              if (items.length === 0) return null;
              return (
                <div key={ma} className="mb-3">
                  <p className="mb-1 flex items-center justify-between px-1 text-2xs font-black uppercase tracking-wider text-ink-muted">
                    {ten}
                    <span className="rounded-full bg-subtle px-1.5 font-mono">{items.length}</span>
                  </p>
                  {items.map((dv) => (
                    <button
                      key={dv.id}
                      onClick={() => setSelectedId(dv.id)}
                      className={cn(
                        'mb-0.5 flex w-full items-center gap-2 rounded-lg border-l-[3px] border-l-transparent px-2.5 py-2 text-left text-[13px] transition-all hover:bg-muted',
                        selected?.id === dv.id &&
                          'border-l-primary-600 bg-primary-50 font-semibold text-primary-700 shadow-card dark:border-l-primary-400 dark:bg-primary-900/30 dark:text-primary-300',
                      )}
                    >
                      <span className="min-w-0 flex-1 truncate">{dv.ten}</span>
                      {dv.soNhanSu > 0 && (
                        <span className="shrink-0 rounded-full bg-subtle px-1.5 font-mono text-2xs text-ink-muted">
                          {dv.soNhanSu}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Chi tiết đơn vị (chỉ hiện ở mode full — mode orgchart-only dùng SlidePanel) */}
      {mode !== 'orgchart-only' && (
      <div id="don-vi-detail-section" className="scroll-mt-4">
        {selected ? (
          <div className="card p-5">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-3 border-b border-border-subtle pb-4">
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span
                    className={cn(
                      'rounded-full px-2.5 py-0.5 text-2xs font-black uppercase tracking-wider',
                      LOAI_BADGE[selected.loai],
                    )}
                  >
                    {LOAI_DON_VI.find((l) => l.ma === selected.loai)?.ten}
                  </span>
                  {selected.tenVietTat && (
                    <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-2xs font-bold text-ink">
                      {selected.tenVietTat}
                    </span>
                  )}
                  {selected.maDinhDanh && (
                    <span className="font-mono text-2xs text-ink-muted">{selected.maDinhDanh}</span>
                  )}
                </div>
                <h2 className="text-xl font-black tracking-tight text-ink">{selected.ten}</h2>

                <div className="flex flex-wrap items-center gap-x-6 gap-y-1.5 pt-1 text-xs text-ink-muted">
                  <div className="flex items-center gap-1.5">
                    <Crown size={14} className="text-amber-500" />
                    <span>Trưởng đơn vị:</span>
                    <span className="font-bold text-ink">
                      {selected.truongDonVi
                        ? `${selected.truongDonViHocVi ? `${selected.truongDonViHocVi}. ` : ''}${selected.truongDonVi}`
                        : 'Chờ kiện toàn'}
                    </span>
                  </div>

                  {selected.phuTrach && (
                    <div className="flex items-center gap-1.5">
                      <Award size={14} className="text-primary-500" />
                      <span>Lãnh đạo Viện phụ trách:</span>
                      <span className="font-bold text-ink">{selected.phuTrach}</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex gap-1.5">
                <button
                  onClick={() => openEdit(selected)}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted"
                >
                  <Pencil size={13} /> Sửa
                </button>
                <button
                  onClick={() => handleDelete(selected)}
                  className="flex items-center gap-1.5 rounded-lg border border-red-200 px-3 py-1.5 text-xs font-bold text-danger transition-colors hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20"
                >
                  <Trash2 size={13} /> Xóa
                </button>
              </div>
            </div>

            {/* Chỉ số */}
            <div className="mb-5 grid grid-cols-3 gap-3">
              {[
                { icon: Users, label: 'Nhân sự', value: selected.soNhanSu },
                { icon: FlaskConical, label: 'Đề tài', value: selected.soDeTai },
                { icon: Handshake, label: 'Hợp đồng', value: selected.soHopDong },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label} className="rounded-xl border border-border bg-subtle px-3.5 py-2.5">
                  <p className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
                    <Icon size={12} /> {label}
                  </p>
                  <p className="mt-1 font-mono text-xl font-bold text-ink">{value}</p>
                </div>
              ))}
            </div>

            {/* Chức năng nhiệm vụ */}
            <div className="mb-5">
              <h3 className="mb-1.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
                Chức năng nhiệm vụ
              </h3>
              <p className="whitespace-pre-line text-[13px] leading-relaxed text-ink-secondary">
                {selected.chucNangNhiemVu ?? 'Chưa cập nhật.'}
              </p>
            </div>

            {/* Thông tin Liên hệ & Trụ sở */}
            {(selected.diaChiChiTiet || selected.dienThoai || selected.email || selected.website || selected.ghiChu) && (
              <div className="mb-5 rounded-xl border border-border dark:border-slate-700/80 bg-subtle/30 dark:bg-slate-900/40 p-4">
                <h4 className="mb-2.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
                  Thông tin Liên hệ & Trụ sở
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs text-ink-secondary">
                  {selected.diaChiChiTiet && (
                    <div className="md:col-span-2 flex items-start gap-2">
                      <MapPin size={14} className="text-primary shrink-0 mt-0.5" />
                      <span className="text-ink font-medium leading-relaxed">{selected.diaChiChiTiet}</span>
                    </div>
                  )}
                  {selected.dienThoai && (
                    <div className="flex items-center gap-2">
                      <Phone size={14} className="text-primary shrink-0" />
                      <span className="text-ink-muted text-3xs uppercase font-bold">ĐT:</span>
                      <a href={`tel:${selected.dienThoai.split('/')[0].trim()}`} className="font-mono text-ink hover:text-primary font-medium">
                        {selected.dienThoai}
                      </a>
                    </div>
                  )}
                  {selected.email && (
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-primary shrink-0" />
                      <span className="text-ink-muted text-3xs uppercase font-bold">Email:</span>
                      <a href={`mailto:${selected.email.split('/')[0].trim()}`} className="text-primary hover:underline font-medium">
                        {selected.email}
                      </a>
                    </div>
                  )}
                  {selected.website && (
                    <div className="flex items-center gap-2">
                      <Globe size={14} className="text-primary shrink-0" />
                      <span className="text-ink-muted text-3xs uppercase font-bold">Web:</span>
                      <a
                        href={selected.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                      >
                        {selected.website}
                        <ExternalLink size={11} />
                      </a>
                    </div>
                  )}
                  {selected.ghiChu && (
                    <div className="text-ink-muted text-[11px] italic md:col-span-2">
                      * {selected.ghiChu}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Ban Lãnh đạo Đơn vị (nếu có) */}
            {lanhDaoDonVi.length > 0 && (
              <div className="mb-6">
                <h3 className="mb-3 text-2xs font-black uppercase tracking-wider text-ink-muted flex items-center gap-1.5">
                  <Crown size={13} className="text-amber-500" />
                  Ban Lãnh đạo Đơn vị ({lanhDaoDonVi.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {lanhDaoDonVi.map((ns) => {
                    const isHead = ns.hoTen === selected.truongDonVi;
                    const initial = ns.hoTen.split(' ').pop()?.[0] || 'L';
                    return (
                      <div
                        key={ns.id}
                        className={cn(
                          'rounded-xl border p-3 bg-surface flex items-start gap-3 transition-all',
                          isHead
                            ? 'border-amber-300 dark:border-amber-700/60 shadow-xs ring-1 ring-amber-400/30'
                            : 'border-border'
                        )}
                      >
                        <div className="w-9 h-9 rounded-full bg-primary-100 dark:bg-primary-900/40 text-primary-700 dark:text-primary-300 font-bold flex items-center justify-center text-sm shrink-0">
                          {initial}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-xs text-ink truncate">{ns.hoTen}</span>
                            {isHead && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-300 shrink-0">
                                Cấp trưởng
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] font-medium text-ink-secondary mt-0.5 truncate">
                            {ns.chucDanh} {ns.hocVi ? `• ${ns.hocVi}` : ''}
                          </p>
                          {ns.soDienThoai && (
                            <p className="text-[10px] text-ink-muted mt-1 flex items-center gap-1 font-mono">
                              <Phone size={10} /> {ns.soDienThoai}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Cán bộ nghiên cứu, Kỹ sư & Chuyên viên */}
            <div>
              <h3 className="mb-2 text-2xs font-black uppercase tracking-wider text-ink-muted flex items-center justify-between">
                <span>
                  {lanhDaoDonVi.length > 0 ? 'Cán bộ nghiên cứu & Kỹ sư chuyên môn' : 'Nhân sự thuộc đơn vị'} (
                  {canBoDonVi.length > 0 ? canBoDonVi.length : nhanSuCuaDonVi.length})
                </span>
                <span className="font-normal normal-case text-ink-muted">
                  Tổng số: {nhanSuCuaDonVi.length} người
                </span>
              </h3>

              {nhanSuCuaDonVi.length === 0 ? (
                <p className="text-xs text-ink-muted py-4 text-center">
                  Chưa có nhân sự trên hệ thống (dữ liệu cá nhân — cần đăng nhập để xem).
                </p>
              ) : (
                <div className="overflow-hidden rounded-xl border border-border">
                  <table className="w-full text-left">
                    <thead>
                      <tr>
                        <th className="th-cell w-12 text-center">STT</th>
                        <th className="th-cell">Họ và tên</th>
                        <th className="th-cell">Chức danh / Vị trí</th>
                        <th className="th-cell">Học vị</th>
                        <th className="th-cell">Chứng chỉ hành nghề</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(canBoDonVi.length > 0 ? canBoDonVi : nhanSuCuaDonVi).map((ns, idx) => (
                        <tr key={ns.id} className="tr-hover">
                          <td className="td-cell text-center font-mono text-2xs text-ink-muted">
                            {idx + 1}
                          </td>
                          <td className="td-cell font-semibold text-ink">{ns.hoTen}</td>
                          <td className="td-cell text-ink-secondary">{ns.chucDanh}</td>
                          <td className="td-cell text-ink-secondary">{ns.hocVi || '—'}</td>
                          <td className="td-cell text-ink-secondary">{ns.chungChi || '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        ) : (
          !loading && (
            <div className="card flex h-64 items-center justify-center text-sm text-ink-muted">
              Chọn một đơn vị để xem chi tiết
            </div>
          )
        )}
      </div>
      )}

    </div>
  );
}
