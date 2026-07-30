import { useState } from 'react';
import { ShieldCheck, Plus, Search, UserCheck, Calendar, FileText, CheckCircle2, XCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { MasterTable } from '../components/MasterTable';
import { Field, inputCls } from '../components/Modal';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCrudForm } from '../hooks/useCrudForm';
import { useTableControls } from '../hooks/useTableControls';
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
  'hieu-luc': 'bg-emerald-100 text-emerald-800',
  'het-han': 'bg-gray-100 text-gray-800',
  'thu-hoi': 'bg-red-100 text-red-800',
};

export function UyQuyenPage() {
  const { data: list, loading, refetch } = useAsyncData(fetchUyQuyen, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Ủy quyền ký HĐ & Phê duyệt (Điều 5 QC 2815)"
        subtitle="Theo dõi văn bản ủy quyền từ Viện trưởng cho các Trưởng đơn vị, Phó Viện trưởng hoặc cấp phó ký hợp đồng"
        actions={
          <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Tạo ủy quyền mới
          </button>
        }
      />

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
        onEdit={crud.openEdit}
        onDelete={crud.removeRow}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
      />

      {/* Modal */}
      {crud.modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-xl rounded-xl bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">
              {crud.editing ? 'Chỉnh sửa văn bản ủy quyền' : 'Tạo mới văn bản ủy quyền'}
            </h3>
            <form onSubmit={crud.submit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
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

              <Field label="Lý do / Nội dung ủy quyền">
                <input
                  className={inputCls}
                  placeholder="Ghi rõ lý do ủy quyền..."
                  value={crud.form.lyDo}
                  onChange={(e) => crud.setForm({ ...crud.form, lyDo: e.target.value })}
                />
              </Field>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={crud.closeModal} className="btn-secondary">Hủy</button>
                <button type="submit" disabled={crud.saving} className="btn-primary">
                  {crud.saving ? 'Đang lưu...' : 'Lưu lại'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
