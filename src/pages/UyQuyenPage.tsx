import { useState } from 'react';
import {
  ShieldCheck,
  Plus,
  UserCheck,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Pencil,
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { MasterTable } from '../components/MasterTable';
import { Field, inputCls } from '../components/Modal';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCrudForm } from '../hooks/useCrudForm';
import { useTableControls } from '../hooks/useTableControls';
import { useSlidePanelForm, useSlidePanelChiTiet } from '../hooks/useSlidePanelCrud';
import {
  fetchUyQuyen,
  createUyQuyen,
  updateUyQuyen,
  deleteUyQuyen,
  type UyQuyenInput,
} from '../services/workflow';
import { fetchNhanSuOptions } from '../services/queries';
import type { UyQuyen, LoaiUyQuyen, TrangThaiUyQuyen } from '../types';
import { formatNgay } from '../lib/utils';

const EMPTY_FORM: UyQuyenInput = {
  nguoiUyQuyenId: '',
  nguoiDuocUyQuyenId: '',
  loaiUyQuyen: 'ky-hop-dong',
  tuNgay: new Date().toISOString().slice(0, 10),
  denNgay: '',
  lyDo: '',
  soQuyetDinh: '',
  trangThai: 'hieu-luc',
};

const LOAI_UY_QUYEN_LABEL: Record<LoaiUyQuyen, string> = {
  'ky-hop-dong': 'Ký hợp đồng kinh tế',
  'phe-duyet': 'Phê duyệt phiếu giao việc',
  'quyet-toan': 'Chủ trì quyết toán HĐ',
  'kiem-tra': 'Kiểm tra nội bộ',
  'toan-quyen': 'Ủy quyền toàn phần',
};

const TRANG_THAI_LABEL: Record<TrangThaiUyQuyen, string> = {
  'hieu-luc': 'Đang hiệu lực',
  'het-han': 'Đã hết hạn',
  'thu-hoi': 'Đã thu hồi',
};

const TRANG_THAI_TONE: Record<TrangThaiUyQuyen, string> = {
  'hieu-luc': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  'het-han': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'thu-hoi': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

export function UyQuyenPage({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { data: list, loading, refetch } = useAsyncData(fetchUyQuyen, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);
  const [selectedItem, setSelectedItem] = useState<UyQuyen | null>(null);

  const crud = useCrudForm<UyQuyen, UyQuyenInput>({
    empty: EMPTY_FORM,
    toForm: (item) => ({
      nguoiUyQuyenId: item.nguoiUyQuyenId,
      nguoiDuocUyQuyenId: item.nguoiDuocUyQuyenId,
      loaiUyQuyen: item.loaiUyQuyen,
      tuNgay: item.tuNgay,
      denNgay: item.denNgay || '',
      lyDo: item.lyDo || '',
      soQuyetDinh: item.soQuyetDinh || '',
      trangThai: item.trangThai,
    }),
    getId: (item) => item.id,
    create: createUyQuyen,
    update: updateUyQuyen,
    remove: deleteUyQuyen,
    deleteMessage: (item) => `Bạn có chắc muốn xóa văn bản ủy quyền này?`,
    onDone: () => refetch(),
  });

  const table = useTableControls(list, (item) => `${item.nguoiUyQuyen} ${item.nguoiDuocUyQuyen} ${item.soQuyetDinh}`, 10);

  const hieuLucCount = list.filter((i) => i.trangThai === 'hieu-luc').length;

  // SlidePanel Chi Tiết văn bản ủy quyền
  useSlidePanelChiTiet({
    id: selectedItem ? `uyquyen-detail-${selectedItem.id}` : 'uyquyen-detail',
    active: !!selectedItem,
    title: selectedItem
      ? `Ủy quyền: ${selectedItem.nguoiUyQuyen} → ${selectedItem.nguoiDuocUyQuyen}`
      : 'Chi tiết văn bản ủy quyền',
    subtitle: selectedItem ? `Số QĐ: ${selectedItem.soQuyetDinh || '—'} · ${TRANG_THAI_LABEL[selectedItem.trangThai]}` : undefined,
    icon: <ShieldCheck size={16} />,
    storageKey: 'slideover-width-uy-quyen-detail',
    minWidth: 480,
    deps: [selectedItem],
    onDongNgoaiLuong: () => setSelectedItem(null),
    headerExtra: selectedItem && (
      <button
        type="button"
        onClick={() => crud.openEdit(selectedItem)}
        className="btn-secondary py-1 px-2.5 text-xs font-bold gap-1"
      >
        <Pencil size={12} /> Sửa
      </button>
    ),
    content: selectedItem && (
      <div className="space-y-4 p-1">
        <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-3">
          <div className="flex items-center justify-between border-b border-border-subtle pb-2.5">
            <span
              className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-bold ${
                TRANG_THAI_TONE[selectedItem.trangThai] || 'bg-gray-100 text-gray-800'
              }`}
            >
              {TRANG_THAI_LABEL[selectedItem.trangThai] || selectedItem.trangThai}
            </span>
            <span className="inline-flex rounded-md bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-secondary">
              {LOAI_UY_QUYEN_LABEL[selectedItem.loaiUyQuyen] || selectedItem.loaiUyQuyen}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Người ủy quyền</p>
              <p className="font-bold text-ink mt-0.5">{selectedItem.nguoiUyQuyen}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Người được ủy quyền</p>
              <p className="font-bold text-primary mt-0.5">{selectedItem.nguoiDuocUyQuyen}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Số quyết định / Công văn</p>
              <p className="font-semibold text-ink mt-0.5">{selectedItem.soQuyetDinh || '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Thời hạn hiệu lực</p>
              <p className="font-semibold text-ink mt-0.5">
                Từ {formatNgay(selectedItem.tuNgay)} {selectedItem.denNgay ? `đến ${formatNgay(selectedItem.denNgay)}` : '(Không thời hạn)'}
              </p>
            </div>
          </div>
        </div>

        {selectedItem.lyDo && (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-1.5">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-ink-muted">Lý do & Căn cứ ủy quyền</h4>
            <p className="text-xs text-ink whitespace-pre-wrap">{selectedItem.lyDo}</p>
          </div>
        )}
      </div>
    ),
  });

  // SlidePanel Biểu mẫu Thêm / Sửa
  useSlidePanelForm({
    id: 'uyquyen-form',
    open: crud.modalOpen,
    title: crud.editing ? 'Chỉnh sửa văn bản ủy quyền' : 'Tạo mới văn bản ủy quyền',
    subtitle: 'Theo dõi thẩm quyền ký hợp đồng & duyệt theo Điều 5 Quy chế 2815',
    icon: <ShieldCheck size={16} />,
    storageKey: 'slideover-width-uy-quyen-form',
    minWidth: 480,
    deps: [crud.form, crud.saving, crud.editing],
    onDongNgoaiLuong: crud.closeModal,
    content: (
      <form id="uyquyen-form-element" onSubmit={crud.submit} className="space-y-4 p-1">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Người ủy quyền *">
            <select
              required
              className={inputCls}
              value={crud.form.nguoiUyQuyenId}
              onChange={(e) => crud.setForm({ ...crud.form, nguoiUyQuyenId: e.target.value })}
            >
              <option value="">-- Chọn người giao --</option>
              {nhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
          </Field>
          <Field label="Người được ủy quyền *">
            <select
              required
              className={inputCls}
              value={crud.form.nguoiDuocUyQuyenId}
              onChange={(e) => crud.setForm({ ...crud.form, nguoiDuocUyQuyenId: e.target.value })}
            >
              <option value="">-- Chọn người nhận --</option>
              {nhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Phạm vi ủy quyền *">
            <select
              className={inputCls}
              value={crud.form.loaiUyQuyen}
              onChange={(e) => crud.setForm({ ...crud.form, loaiUyQuyen: e.target.value as any })}
            >
              {Object.entries(LOAI_UY_QUYEN_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
          <Field label="Số quyết định / Công văn">
            <input
              className={inputCls}
              placeholder="VD: QĐ-123/VKH..."
              value={crud.form.soQuyetDinh}
              onChange={(e) => crud.setForm({ ...crud.form, soQuyetDinh: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Từ ngày *">
            <input
              type="date"
              required
              className={inputCls}
              value={crud.form.tuNgay}
              onChange={(e) => crud.setForm({ ...crud.form, tuNgay: e.target.value })}
            />
          </Field>
          <Field label="Đến ngày">
            <input
              type="date"
              className={inputCls}
              value={crud.form.denNgay}
              onChange={(e) => crud.setForm({ ...crud.form, denNgay: e.target.value })}
            />
          </Field>
          <Field label="Trạng thái">
            <select
              className={inputCls}
              value={crud.form.trangThai}
              onChange={(e) => crud.setForm({ ...crud.form, trangThai: e.target.value as any })}
            >
              {Object.entries(TRANG_THAI_LABEL).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Lý do / Căn cứ ủy quyền">
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Ghi rõ lý do ủy quyền..."
            value={crud.form.lyDo}
            onChange={(e) => crud.setForm({ ...crud.form, lyDo: e.target.value })}
          />
        </Field>
      </form>
    ),
    footer: (
      <div className="flex items-center justify-end gap-2 border-t border-border-subtle bg-surface/95 pt-3 backdrop-blur-md">
        <button type="button" onClick={crud.closeModal} className="btn-ghost">
          Hủy
        </button>
        <button
          type="submit"
          form="uyquyen-form-element"
          disabled={crud.saving}
          className="btn-primary py-2 px-5 text-xs font-bold gap-2"
        >
          {crud.saving ? 'Đang lưu...' : crud.editing ? 'Lưu thay đổi' : 'Tạo mới ủy quyền'}
        </button>
      </div>
    ),
  });

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader
          title="Quản lý Ủy quyền ký HĐ & Phê duyệt (Điều 5 QC 2815)"
          subtitle="Theo dõi văn bản ủy quyền từ Viện trưởng cho các Trưởng đơn vị, Phó Viện trưởng hoặc cấp phó ký hợp đồng"
          actions={
            <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={14} /> Tạo ủy quyền mới
            </button>
          }
        />
      ) : (
        <div className="flex items-center justify-between pb-1">
          <div className="text-xs text-ink-muted">
            <span className="font-bold text-ink">Danh mục văn bản ủy quyền (Điều 5 QC 2815):</span> Thẩm quyền ký kết hợp đồng & phê duyệt.
          </div>
          <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Tạo ủy quyền mới
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Tổng số văn bản ủy quyền" value={String(list.length)} icon={ShieldCheck} tone="primary" />
        <KpiCard label="Đang có hiệu lực" value={String(hieuLucCount)} icon={UserCheck} tone="success" />
        <KpiCard label="Hết hạn / Thu hồi" value={String(list.length - hieuLucCount)} icon={FileText} tone="warning" />
      </div>

      {/* Master Table */}
      <MasterTable
        title="Danh sách văn bản ủy quyền"
        searchPlaceholder="Tìm kiếm người ủy quyền, người được ủy quyền, số QĐ..."
        searchQuery={table.search}
        onSearchChange={table.setSearch}
        columns={[
          {
            header: 'Người ủy quyền → Người nhận ủy quyền',
            accessor: (item: UyQuyen) => (
              <div>
                <p className="font-bold text-ink flex items-center gap-1">
                  <span>{item.nguoiUyQuyen}</span>
                  <span className="text-ink-muted">→</span>
                  <span className="text-primary font-black">{item.nguoiDuocUyQuyen}</span>
                </p>
                <p className="text-2xs text-ink-muted mt-0.5">Số QĐ: {item.soQuyetDinh || '—'}</p>
              </div>
            ),
          },
          {
            header: 'Phạm vi ủy quyền',
            accessor: (item: UyQuyen) => (
              <span className="inline-flex rounded-md bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-secondary">
                {LOAI_UY_QUYEN_LABEL[item.loaiUyQuyen] || item.loaiUyQuyen}
              </span>
            ),
          },
          {
            header: 'Thời hạn hiệu lực',
            accessor: (item: UyQuyen) => (
              <div className="text-2xs">
                <p className="font-semibold text-ink">Từ {formatNgay(item.tuNgay)}</p>
                <p className="text-ink-muted">{item.denNgay ? `Đến ${formatNgay(item.denNgay)}` : 'Không thời hạn'}</p>
              </div>
            ),
          },
          {
            header: 'Lý do / Căn cứ',
            accessor: (item: UyQuyen) => <span className="text-xs text-ink-secondary">{item.lyDo || '—'}</span>,
          },
          {
            header: 'Trạng thái',
            accessor: (item: UyQuyen) => (
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-bold ${TRANG_THAI_TONE[item.trangThai] || 'bg-gray-100 text-gray-800'}`}>
                {TRANG_THAI_LABEL[item.trangThai] || item.trangThai}
              </span>
            ),
          },
        ]}
        data={table.pageRows}
        onRowClick={(item) => setSelectedItem(item)}
        onView={(item) => setSelectedItem(item)}
        onEdit={crud.openEdit}
        onDelete={crud.removeRow}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
      />
    </div>
  );
}
