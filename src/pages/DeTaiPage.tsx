import { useMemo, useState } from 'react';
import { Plus, FlaskConical, Landmark, AlertTriangle, LoaderCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, TRANG_THAI_OPTIONS } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination, RowActions } from '../components/TableToolbar';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import {
  fetchDeTai,
  fetchDonViOptions,
  fetchNhanSuOptions,
  createDeTai,
  updateDeTai,
  deleteDeTai,
  CAP_DE_TAI_OPTIONS,
  type DeTaiInput,
} from '../services/queries';
import type { DeTai } from '../types';
import { formatTrieu, formatNgay, cn } from '../lib/utils';

const CAP_CLS: Record<string, string> = {
  'Nhà nước': 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  Bộ: 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'Cơ sở': 'bg-subtle text-ink-secondary',
};

const EMPTY_FORM: DeTaiInput = {
  maSo: '',
  ten: '',
  capMa: 'co-so',
  chuNhiemId: '',
  donViId: '',
  kinhPhi: '',
  tienDo: '0',
  hanNghiemThu: '',
  trangThai: 'moi',
};

export function DeTaiPage() {
  const { data: deTaiList, loading, error, refetch } = useAsyncData(fetchDeTai, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);

  const [filterCap, setFilterCap] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');

  const crud = useCrudForm<DeTai, DeTaiInput>({
    empty: EMPTY_FORM,
    toForm: (dt) => ({
      maSo: dt.maSo,
      ten: dt.ten,
      capMa: dt.capMa,
      chuNhiemId: dt.chuNhiemId ?? '',
      donViId: dt.donViId ?? '',
      kinhPhi: String(dt.kinhPhi || ''),
      tienDo: String(dt.tienDo),
      hanNghiemThu: dt.hanNghiemThu,
      trangThai: dt.trangThai,
    }),
    getId: (dt) => dt.id,
    create: createDeTai,
    update: updateDeTai,
    remove: deleteDeTai,
    deleteMessage: (dt) => `Xóa đề tài "${dt.maSo} — ${dt.ten}"?`,
    onDone: refetch,
  });

  const filtered = useMemo(
    () =>
      deTaiList.filter((dt) => {
        if (filterCap && dt.capMa !== filterCap) return false;
        if (filterTrangThai && dt.trangThai !== filterTrangThai) return false;
        return true;
      }),
    [deTaiList, filterCap, filterTrangThai],
  );

  const table = useTableControls(filtered, (dt) => `${dt.maSo} ${dt.ten} ${dt.chuNhiem} ${dt.donVi}`);

  // ─── KPI từ dữ liệu thật ───
  const dangTrienKhai = deTaiList.filter((dt) => dt.trangThai === 'dang-thuc-hien').length;
  const tongKinhPhi = deTaiList.reduce((s, dt) => s + dt.kinhPhi, 0);
  const treTienDo = deTaiList.filter((dt) => dt.trangThai === 'qua-han').length;

  return (
    <div>
      <PageHeader
        title="Đề tài & Nhiệm vụ KHCN"
        subtitle="Vòng đời đề tài: đề xuất → xét duyệt → thực hiện → nghiệm thu → thanh quyết toán"
        actions={
          <button className="btn-primary" onClick={crud.openCreate}>
            <Plus size={16} /> Đăng ký đề tài
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={FlaskConical} label="Đang triển khai" value={String(dangTrienKhai)} tone="primary" />
        <KpiCard icon={Landmark} label="Tổng kinh phí được giao" value={formatTrieu(tongKinhPhi)} tone="success" />
        <KpiCard icon={AlertTriangle} label="Trễ tiến độ" value={String(treTienDo)} tone="accent" />
      </div>

      <DataState loading={loading} error={error} empty={deTaiList.length === 0} />
      {crud.actionError && !crud.modalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {crud.actionError}
        </div>
      )}

      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm mã số, tên đề tài, chủ nhiệm..."
        total={table.total}
      >
        <FilterSelect
          value={filterCap}
          onChange={setFilterCap}
          options={CAP_DE_TAI_OPTIONS}
          allLabel="Tất cả cấp"
        />
        <FilterSelect
          value={filterTrangThai}
          onChange={setFilterTrangThai}
          options={TRANG_THAI_OPTIONS}
          allLabel="Tất cả trạng thái"
        />
      </TableToolbar>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="th-cell">Mã số</th>
              <th className="th-cell">Tên đề tài</th>
              <th className="th-cell">Cấp</th>
              <th className="th-cell">Chủ nhiệm</th>
              <th className="th-cell">Kinh phí</th>
              <th className="th-cell">Tiến độ</th>
              <th className="th-cell">Hạn nghiệm thu</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.pageRows.map((dt) => (
              <tr key={dt.id} className="tr-hover">
                <td className="td-cell font-mono text-xs font-semibold text-primary">{dt.maSo}</td>
                <td className="td-cell max-w-sm">
                  <p className="truncate font-medium">{dt.ten}</p>
                  <p className="text-xs text-ink-muted">{dt.donVi}</p>
                </td>
                <td className="td-cell">
                  <span className={cn('rounded-full px-2 py-0.5 text-2xs font-black uppercase', CAP_CLS[dt.cap])}>
                    {dt.cap}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{dt.chuNhiem}</td>
                <td className="td-cell font-mono text-xs">{formatTrieu(dt.kinhPhi)}</td>
                <td className="td-cell w-32">
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 flex-1 rounded-full bg-subtle">
                      <div
                        className={cn('h-1.5 rounded-full', dt.trangThai === 'qua-han' ? 'bg-danger' : 'bg-primary')}
                        style={{ width: `${dt.tienDo}%` }}
                      />
                    </div>
                    <span className="font-mono text-xs">{dt.tienDo}%</span>
                  </div>
                </td>
                <td className="td-cell font-mono text-xs">
                  {dt.hanNghiemThu ? formatNgay(dt.hanNghiemThu) : '—'}
                </td>
                <td className="td-cell"><StatusBadge value={dt.trangThai} /></td>
                <td className="td-cell">
                  <RowActions onEdit={() => crud.openEdit(dt)} onDelete={() => crud.removeRow(dt)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} onChange={table.setPage} />
      </div>

      {/* Modal thêm/sửa */}
      <Modal
        title={crud.editing ? `Sửa đề tài: ${crud.editing.maSo}` : 'Đăng ký đề tài mới'}
        open={crud.modalOpen}
        onClose={crud.closeModal}
        wide
      >
        <form onSubmit={crud.submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã số" required>
              <input
                className={inputCls}
                required
                maxLength={50}
                value={crud.form.maSo}
                onChange={(e) => crud.setForm({ ...crud.form, maSo: e.target.value })}
                placeholder="VD: RD 25-26"
              />
            </Field>
            <Field label="Cấp đề tài" required>
              <select
                className={inputCls}
                value={crud.form.capMa}
                onChange={(e) => crud.setForm({ ...crud.form, capMa: e.target.value })}
              >
                {CAP_DE_TAI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
          <Field label="Tên đề tài" required>
            <textarea
              className={`${inputCls} min-h-20 resize-y`}
              required
              maxLength={500}
              value={crud.form.ten}
              onChange={(e) => crud.setForm({ ...crud.form, ten: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chủ nhiệm">
              <select
                className={inputCls}
                value={crud.form.chuNhiemId}
                onChange={(e) => crud.setForm({ ...crud.form, chuNhiemId: e.target.value })}
              >
                <option value="">— Chưa chọn —</option>
                {nhanSuOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.ten}</option>
                ))}
              </select>
            </Field>
            <Field label="Đơn vị chủ trì">
              <select
                className={inputCls}
                value={crud.form.donViId}
                onChange={(e) => crud.setForm({ ...crud.form, donViId: e.target.value })}
              >
                <option value="">— Chưa chọn —</option>
                {donViOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.ten}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <Field label="Kinh phí (triệu)" required>
              <input
                type="number"
                min={0}
                className={inputCls}
                required
                value={crud.form.kinhPhi}
                onChange={(e) => crud.setForm({ ...crud.form, kinhPhi: e.target.value })}
              />
            </Field>
            <Field label="Tiến độ (%)">
              <input
                type="number"
                min={0}
                max={100}
                className={inputCls}
                value={crud.form.tienDo}
                onChange={(e) => crud.setForm({ ...crud.form, tienDo: e.target.value })}
              />
            </Field>
            <Field label="Hạn nghiệm thu">
              <input
                type="date"
                className={inputCls}
                value={crud.form.hanNghiemThu}
                onChange={(e) => crud.setForm({ ...crud.form, hanNghiemThu: e.target.value })}
              />
            </Field>
            <Field label="Trạng thái" required>
              <select
                className={inputCls}
                value={crud.form.trangThai}
                onChange={(e) => crud.setForm({ ...crud.form, trangThai: e.target.value })}
              >
                {TRANG_THAI_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
          </div>
          {crud.actionError && (
            <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {crud.actionError}
            </p>
          )}
          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={crud.closeModal}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
            >
              Hủy
            </button>
            <button type="submit" disabled={crud.saving} className="btn-primary disabled:opacity-60">
              {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
              {crud.editing ? 'Lưu thay đổi' : 'Đăng ký đề tài'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
