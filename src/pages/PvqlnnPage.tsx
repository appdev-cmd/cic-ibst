import { useState } from 'react';
import { Landmark, Plus, Search, Building2, Calendar, FileText, CheckCircle2, Clock, Shield } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { MasterTable } from '../components/MasterTable';
import { Field, inputCls } from '../components/Modal';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCrudForm } from '../hooks/useCrudForm';
import { useTableControls } from '../hooks/useTableControls';
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
  'moi': 'bg-gray-100 text-gray-800',
  'dang-thuc-hien': 'bg-blue-100 text-blue-800',
  'hoan-thanh': 'bg-emerald-100 text-emerald-800',
  'qua-han': 'bg-red-100 text-red-800',
};

export function PvqlnnPage() {
  const { data: list, loading, refetch } = useAsyncData(fetchNhiemVuPVQLNN, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);

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

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nhiệm vụ Phục vụ QLNN (Nhóm N1B - Điều 3 QC 2815)"
        subtitle="Quản lý các nhiệm vụ khoa học công nghệ & phục vụ quản lý nhà nước có kinh phí cấp trực tiếp từ Bộ, Ngành"
        actions={
          <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Giao nhiệm vụ mới
          </button>
        }
      />

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
        onEdit={crud.openEdit}
        onDelete={crud.removeRow}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
      />

      {/* Modal */}
      {crud.modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">
              {crud.editing ? 'Chỉnh sửa nhiệm vụ PVQLNN' : 'Tạo mới nhiệm vụ PVQLNN'}
            </h3>
            <form onSubmit={crud.submit} className="space-y-4">
              <Field label="Tên nhiệm vụ *">
                <input
                  required
                  className={inputCls}
                  value={crud.form.tenNhiemVu}
                  onChange={(e) => crud.setForm({ ...crud.form, tenNhiemVu: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-2 gap-4">
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

              <div className="grid grid-cols-3 gap-4">
                <Field label="Kinh phí cấp (triệu đ)">
                  <input
                    type="number"
                    className={inputCls}
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
