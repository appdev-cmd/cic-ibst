import { useMemo, useState, type FormEvent } from 'react';
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
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { OrgChartTree } from '../components/OrgChartTree';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  LOAI_DON_VI,
  fetchDonVi,
  fetchNhanSuFull,
  createDonVi,
  updateDonVi,
  deleteDonVi,
  type DonViInput,
} from '../services/org';
import type { DonVi, LoaiDonVi } from '../types';
import { cn } from '../lib/utils';

const LOAI_BADGE: Record<LoaiDonVi, string> = {
  'lanh-dao': 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  'phong-chuc-nang': 'bg-subtle text-ink-secondary',
  'vien-chuyen-nganh': 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'phan-vien': 'bg-blue-50 text-info dark:bg-blue-900/20 dark:text-blue-400',
  'trung-tam': 'bg-emerald-50 text-success dark:bg-emerald-900/20 dark:text-emerald-400',
  'cong-ty': 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
};

const EMPTY_FORM: DonViInput = {
  ten: '',
  tenVietTat: '',
  loai: 'trung-tam',
  chucNangNhiemVu: '',
  dienThoai: '',
  email: '',
  phuTrachId: '',
  truongDonViId: '',
};

export function DonViPage({ hideHeader = false }: { hideHeader?: boolean } = {}) {
  const { data: donViList, loading, error, refetch } = useAsyncData(fetchDonVi, []);
  const { data: nhanSuList } = useAsyncData(fetchNhanSuFull, []);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [view, setView] = useState<'tree' | 'list'>('tree');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<DonVi | null>(null);
  const [form, setForm] = useState<DonViInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
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
  const candidatesForTruongDonVi = useMemo(() => {
    if (!editing) return nhanSuList;
    const inUnit = nhanSuList.filter((ns) => ns.donViId === editing.id);
    return inUnit.length > 0 ? inUnit : nhanSuList;
  }, [editing, nhanSuList]);

  // Lãnh đạo Viện (Viện trưởng + Phó Viện trưởng) để chọn người phụ trách khối
  const lanhDaoList = useMemo(
    () => nhanSuList.filter((ns) => ns.chucDanh === 'Viện trưởng' || ns.chucDanh === 'Phó Viện trưởng'),
    [nhanSuList],
  );

  const tongNhanSu = donViList.reduce((s, d) => s + d.soNhanSu, 0);
  const soVienPhanVien = donViList.filter(
    (d) => d.loai === 'vien-chuyen-nganh' || d.loai === 'phan-vien',
  ).length;
  const soTrungTam = donViList.filter((d) => d.loai === 'trung-tam').length;
  const soDonVi = donViList.filter((d) => d.loai !== 'lanh-dao').length;

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY_FORM);
    setActionError(null);
    setModalOpen(true);
  };

  const openEdit = (dv: DonVi) => {
    setEditing(dv);
    setForm({
      ten: dv.ten,
      tenVietTat: dv.tenVietTat ?? '',
      loai: dv.loai,
      chucNangNhiemVu: dv.chucNangNhiemVu ?? '',
      dienThoai: dv.dienThoai ?? '',
      email: dv.email ?? '',
      phuTrachId: dv.phuTrachId ?? '',
      truongDonViId: dv.truongDonViId ?? '',
    });
    setActionError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setActionError(null);
    try {
      if (editing) await updateDonVi(editing.id, form);
      else await createDonVi(form);
      setModalOpen(false);
      refetch();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
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

        {view === 'tree' ? (
          <OrgChartTree
            donViList={donViList}
            nhanSuList={nhanSuList}
            selectedId={selected?.id ?? null}
            onSelect={setSelectedId}
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

      {/* Chi tiết đơn vị */}
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

            {/* Liên hệ */}
            {(selected.dienThoai || selected.email) && (
              <div className="mb-5 flex flex-wrap gap-4 text-xs text-ink-secondary">
                {selected.dienThoai && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1">
                    <Phone size={13} className="text-primary-500" />
                    <span className="font-mono font-medium">{selected.dienThoai}</span>
                  </span>
                )}
                {selected.email && (
                  <span className="flex items-center gap-1.5 rounded-lg bg-subtle px-2.5 py-1">
                    <Mail size={13} className="text-primary-500" />
                    <span>{selected.email}</span>
                  </span>
                )}
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

      {/* Modal thêm/sửa */}
      <Modal
        title={editing ? `Sửa đơn vị: ${editing.tenVietTat ?? editing.ten}` : 'Thêm đơn vị trực thuộc'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên đơn vị" required>
            <input
              className={inputCls}
              required
              maxLength={150}
              value={form.ten}
              onChange={(e) => setForm({ ...form, ten: e.target.value })}
              placeholder="VD: Trung tâm Tư vấn và Ứng dụng BIM trong xây dựng"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Tên viết tắt">
              <input
                className={inputCls}
                maxLength={50}
                value={form.tenVietTat}
                onChange={(e) => setForm({ ...form, tenVietTat: e.target.value })}
              />
            </Field>
            <Field label="Loại đơn vị" required>
              <select
                className={inputCls}
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value as LoaiDonVi })}
              >
                {LOAI_DON_VI.map((l) => (
                  <option key={l.ma} value={l.ma}>
                    {l.ten}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Field label="Lãnh đạo Viện phụ trách">
              <select
                className={inputCls}
                value={form.phuTrachId}
                onChange={(e) => setForm({ ...form, phuTrachId: e.target.value })}
              >
                <option value="">— Chưa phân công —</option>
                {lanhDaoList.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.chucDanh} — {ns.hoTen}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="Trưởng đơn vị (Giám đốc / Trưởng phòng)">
              <select
                className={inputCls}
                value={form.truongDonViId ?? ''}
                onChange={(e) => setForm({ ...form, truongDonViId: e.target.value })}
              >
                <option value="">— Chưa chỉ định / Chờ kiện toàn —</option>
                {candidatesForTruongDonVi.map((ns) => (
                  <option key={ns.id} value={ns.id}>
                    {ns.hocVi ? `${ns.hocVi}. ` : ''}{ns.hoTen} ({ns.chucDanh || 'Cán bộ'})
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Chức năng nhiệm vụ">
            <textarea
              className={cn(inputCls, 'min-h-24 resize-y')}
              value={form.chucNangNhiemVu}
              onChange={(e) => setForm({ ...form, chucNangNhiemVu: e.target.value })}
              placeholder="Mô tả chức năng, nhiệm vụ chính của đơn vị..."
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Điện thoại">
              <input
                className={inputCls}
                maxLength={130}
                value={form.dienThoai}
                onChange={(e) => setForm({ ...form, dienThoai: e.target.value })}
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                maxLength={150}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Field>
          </div>
          {actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {actionError}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
            >
              Hủy
            </button>
            <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
              {saving && <LoaderCircle size={15} className="animate-spin" />}
              {editing ? 'Lưu thay đổi' : 'Thêm đơn vị'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
