import { useState } from 'react';
import {
  Landmark,
  Plus,
  Building2,
  Calendar,
  FileText,
  CheckCircle2,
  Clock,
  Shield,
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
  fetchNhiemVuPVQLNN,
  createNhiemVuPVQLNN,
  updateNhiemVuPVQLNN,
  deleteNhiemVuPVQLNN,
  type NhiemVuPVQLNNInput,
} from '../services/workflow';
import { fetchDonViOptions, fetchNhanSuOptions } from '../services/queries';
import type { NhiemVuPVQLNN, TrangThai } from '../types';
import { formatTrieu, formatNgay } from '../lib/utils';

const EMPTY_FORM: NhiemVuPVQLNNInput = {
  tenNhiemVu: '',
  coQuanGiao: '',
  soVanBanGiao: '',
  ngayGiao: '',
  hanHoanThanh: '',
  donViId: '',
  nguoiPhuTrachId: '',
  kinhPhi: '',
  nguonKinhPhi: '',
  trangThai: 'moi',
  ketQua: '',
  ghiChu: '',
};

const TRANG_THAI_LABEL: Record<string, string> = {
  'moi': 'Mới giao',
  'dang-thuc-hien': 'Đang thực hiện',
  'hoan-thanh': 'Hoàn thành',
  'qua-han': 'Quá hạn',
};

const TRANG_THAI_TONE: Record<string, string> = {
  'moi': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'dang-thuc-hien': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  'hoan-thanh': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-200',
  'qua-han': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
};

export function PvqlnnPage({ showHeader = true }: { showHeader?: boolean } = {}) {
  const { data: list, loading, refetch } = useAsyncData(fetchNhiemVuPVQLNN, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);
  const [selectedItem, setSelectedItem] = useState<NhiemVuPVQLNN | null>(null);

  const crud = useCrudForm<NhiemVuPVQLNN, NhiemVuPVQLNNInput>({
    empty: EMPTY_FORM,
    toForm: (item) => ({
      tenNhiemVu: item.tenNhiemVu,
      coQuanGiao: item.coQuanGiao,
      soVanBanGiao: item.soVanBanGiao || '',
      ngayGiao: item.ngayGiao || '',
      hanHoanThanh: item.hanHoanThanh || '',
      donViId: item.donViId || '',
      nguoiPhuTrachId: item.nguoiPhuTrachId || '',
      kinhPhi: item.kinhPhi != null ? String(item.kinhPhi) : '',
      nguonKinhPhi: item.nguonKinhPhi || '',
      trangThai: item.trangThai,
      ketQua: item.ketQua || '',
      ghiChu: item.ghiChu || '',
    }),
    getId: (item) => item.id,
    create: createNhiemVuPVQLNN,
    update: updateNhiemVuPVQLNN,
    remove: deleteNhiemVuPVQLNN,
    deleteMessage: (item) => `Bạn có chắc muốn xóa nhiệm vụ ${item.tenNhiemVu}?`,
    onDone: () => refetch(),
  });

  const table = useTableControls(list, (item) => `${item.tenNhiemVu} ${item.coQuanGiao} ${item.donVi}`, 10);

  const tongKinhPhi = list.reduce((acc, i) => acc + (i.kinhPhi || 0), 0);
  const hoanThanhCount = list.filter((i) => i.trangThai === 'hoan-thanh').length;

  // SlidePanel Chi Tiết nhiệm vụ PVQLNN
  useSlidePanelChiTiet({
    id: selectedItem ? `pvqlnn-detail-${selectedItem.id}` : 'pvqlnn-detail',
    active: !!selectedItem,
    title: selectedItem?.tenNhiemVu || 'Chi tiết nhiệm vụ PVQLNN',
    subtitle: selectedItem
      ? `Cơ quan giao: ${selectedItem.coQuanGiao} · ${TRANG_THAI_LABEL[selectedItem.trangThai] || selectedItem.trangThai}`
      : undefined,
    icon: <Landmark size={16} />,
    storageKey: 'slideover-width-pvqlnn-detail',
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
            <span className="text-2xs text-ink-muted">
              Hạn: <strong>{selectedItem.hanHoanThanh ? formatNgay(selectedItem.hanHoanThanh) : 'Không thời hạn'}</strong>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Cơ quan giao nhiệm vụ</p>
              <p className="font-semibold text-ink mt-0.5">{selectedItem.coQuanGiao}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Số văn bản giao</p>
              <p className="font-semibold text-ink mt-0.5">{selectedItem.soVanBanGiao || '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Đơn vị thực hiện</p>
              <p className="font-semibold text-ink mt-0.5">{selectedItem.donVi || '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Người phụ trách</p>
              <p className="font-semibold text-ink mt-0.5">{selectedItem.nguoiPhuTrach || '—'}</p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Kinh phí cấp trực tiếp</p>
              <p className="font-bold text-success mt-0.5">
                {selectedItem.kinhPhi ? `${formatTrieu(selectedItem.kinhPhi)}` : '—'}
              </p>
            </div>
            <div>
              <p className="text-2xs font-bold uppercase text-ink-muted">Nguồn kinh phí</p>
              <p className="font-semibold text-ink mt-0.5">
                {selectedItem.nguonKinhPhi || 'Ngân sách Nhà nước'}
              </p>
            </div>
          </div>
        </div>

        {selectedItem.ketQua && (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-1.5">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-ink-muted">
              Kết quả / Sản phẩm nhiệm vụ
            </h4>
            <p className="text-xs text-ink whitespace-pre-wrap">{selectedItem.ketQua}</p>
          </div>
        )}

        {selectedItem.ghiChu && (
          <div className="rounded-xl border border-border bg-surface p-4 shadow-2xs space-y-1.5">
            <h4 className="text-2xs font-bold uppercase tracking-wider text-ink-muted">Ghi chú</h4>
            <p className="text-xs text-ink-secondary whitespace-pre-wrap">{selectedItem.ghiChu}</p>
          </div>
        )}
      </div>
    ),
  });

  // SlidePanel Biểu mẫu Thêm / Sửa
  useSlidePanelForm({
    id: 'pvqlnn-form',
    open: crud.modalOpen,
    title: crud.editing ? 'Chỉnh sửa nhiệm vụ PVQLNN' : 'Giao nhiệm vụ PVQLNN mới',
    subtitle: 'Nhiệm vụ Nhóm N1B (Điều 3 QC 2815) — Kinh phí cấp trực tiếp từ Bộ, Ngành',
    icon: <Landmark size={16} />,
    storageKey: 'slideover-width-pvqlnn-form',
    minWidth: 500,
    deps: [crud.form, crud.saving, crud.editing],
    onDongNgoaiLuong: crud.closeModal,
    content: (
      <form id="pvqlnn-form-element" onSubmit={crud.submit} className="space-y-4 p-1">
        <Field label="Tên nhiệm vụ *">
          <input
            required
            className={inputCls}
            placeholder="VD: Nghiên cứu soát xét TCVN... phục vụ công tác QLNN"
            value={crud.form.tenNhiemVu}
            onChange={(e) => crud.setForm({ ...crud.form, tenNhiemVu: e.target.value })}
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Cơ quan giao nhiệm vụ *">
            <input
              required
              className={inputCls}
              placeholder="VD: Bộ Xây dựng, Cục Giám định..."
              value={crud.form.coQuanGiao}
              onChange={(e) => crud.setForm({ ...crud.form, coQuanGiao: e.target.value })}
            />
          </Field>
          <Field label="Số văn bản giao">
            <input
              className={inputCls}
              placeholder="Số QĐ / Công văn..."
              value={crud.form.soVanBanGiao}
              onChange={(e) => crud.setForm({ ...crud.form, soVanBanGiao: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Đơn vị thực hiện">
            <select
              className={inputCls}
              value={crud.form.donViId}
              onChange={(e) => crud.setForm({ ...crud.form, donViId: e.target.value })}
            >
              <option value="">-- Chọn đơn vị --</option>
              {donViOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.ten}</option>
              ))}
            </select>
          </Field>
          <Field label="Người phụ trách">
            <select
              className={inputCls}
              value={crud.form.nguoiPhuTrachId}
              onChange={(e) => crud.setForm({ ...crud.form, nguoiPhuTrachId: e.target.value })}
            >
              <option value="">-- Chọn nhân sự --</option>
              {nhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Field label="Kinh phí cấp (triệu đ)">
            <input
              type="number"
              className={inputCls}
              placeholder="0"
              value={crud.form.kinhPhi}
              onChange={(e) => crud.setForm({ ...crud.form, kinhPhi: e.target.value })}
            />
          </Field>
          <Field label="Hạn hoàn thành">
            <input
              type="date"
              className={inputCls}
              value={crud.form.hanHoanThanh}
              onChange={(e) => crud.setForm({ ...crud.form, hanHoanThanh: e.target.value })}
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

        <Field label="Nguồn kinh phí">
          <input
            className={inputCls}
            placeholder="VD: Ngân sách sự nghiệp khoa học / Ngân sách QLNN..."
            value={crud.form.nguonKinhPhi}
            onChange={(e) => crud.setForm({ ...crud.form, nguonKinhPhi: e.target.value })}
          />
        </Field>

        <Field label="Ghi chú / Yêu cầu đặc thù">
          <textarea
            className={inputCls}
            rows={2}
            placeholder="Ghi chú thêm về nhiệm vụ..."
            value={crud.form.ghiChu}
            onChange={(e) => crud.setForm({ ...crud.form, ghiChu: e.target.value })}
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
          form="pvqlnn-form-element"
          disabled={crud.saving}
          className="btn-primary py-2 px-5 text-xs font-bold gap-2"
        >
          {crud.saving ? 'Đang lưu...' : crud.editing ? 'Lưu thay đổi' : 'Giao nhiệm vụ'}
        </button>
      </div>
    ),
  });

  return (
    <div className="space-y-6">
      {showHeader ? (
        <PageHeader
          title="Nhiệm vụ Phục vụ QLNN (Nhóm N1B - Điều 3 QC 2815)"
          subtitle="Quản lý các nhiệm vụ khoa học công nghệ & phục vụ quản lý nhà nước có kinh phí cấp trực tiếp từ Bộ, Ngành"
          actions={
            <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={14} /> Giao nhiệm vụ mới
            </button>
          }
        />
      ) : (
        <div className="flex items-center justify-between pb-1">
          <div className="text-xs text-ink-muted">
            <span className="font-bold text-ink">Nhiệm vụ phục vụ QLNN (Nhóm N1B):</span> Kinh phí cấp trực tiếp từ Bộ, thanh toán thực thanh thực chi.
          </div>
          <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Giao nhiệm vụ mới
          </button>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <KpiCard label="Tổng số nhiệm vụ QLNN" value={String(list.length)} icon={Landmark} tone="primary" />
        <KpiCard label="Tổng kinh phí cấp trực tiếp" value={formatTrieu(tongKinhPhi)} icon={Shield} tone="success" />
        <KpiCard label="Đã hoàn thành" value={`${hoanThanhCount} / ${list.length}`} icon={CheckCircle2} tone="warning" />
      </div>

      {/* Note Callout */}
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 text-xs text-blue-900 dark:border-blue-900/50 dark:bg-blue-950/30 dark:text-blue-200 flex items-start gap-3">
        <Landmark className="shrink-0 text-blue-600 dark:text-blue-400 mt-0.5" size={18} />
        <div>
          <h4 className="font-bold">Quy định nhóm N1B (Điều 3 Quy chế 2815):</h4>
          <p className="mt-1 leading-relaxed">
            Nhóm N1B bao gồm các nhiệm vụ được Bộ Xây dựng hoặc các Bộ, Ngành giao trực tiếp cho Viện thực hiện. Đơn vị chủ trì quyết toán theo nguyên tắc <strong>thực thanh, thực chi</strong> dựa trên dự toán được cấp thẩm quyền phê duyệt.
          </p>
        </div>
      </div>

      {/* Master Table */}
      <MasterTable
        title="Danh sách nhiệm vụ PVQLNN"
        searchPlaceholder="Tìm kiếm tên nhiệm vụ, cơ quan giao, đơn vị thực hiện..."
        searchQuery={table.search}
        onSearchChange={table.setSearch}
        columns={[
          {
            header: 'Tên nhiệm vụ / Cơ quan giao',
            accessor: (item: NhiemVuPVQLNN) => (
              <div>
                <p className="font-bold text-ink">{item.tenNhiemVu}</p>
                <p className="text-2xs text-ink-muted flex items-center gap-1 mt-0.5">
                  <Landmark size={11} /> {item.coQuanGiao} {item.soVanBanGiao ? `(VB: ${item.soVanBanGiao})` : ''}
                </p>
              </div>
            ),
          },
          {
            header: 'Đơn vị / Phụ trách',
            accessor: (item: NhiemVuPVQLNN) => (
              <div className="text-2xs">
                <p className="font-semibold text-ink">{item.donVi || '—'}</p>
                <p className="text-ink-muted">{item.nguoiPhuTrach || '—'}</p>
              </div>
            ),
          },
          {
            header: 'Kinh phí cấp (trđ)',
            accessor: (item: NhiemVuPVQLNN) => (
              <span className="font-bold text-ink">{item.kinhPhi ? item.kinhPhi.toLocaleString('vi-VN') : '—'}</span>
            ),
          },
          {
            header: 'Hạn hoàn thành',
            accessor: (item: NhiemVuPVQLNN) => (item.hanHoanThanh ? formatNgay(item.hanHoanThanh) : '—'),
          },
          {
            header: 'Trạng thái',
            accessor: (item: NhiemVuPVQLNN) => (
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
