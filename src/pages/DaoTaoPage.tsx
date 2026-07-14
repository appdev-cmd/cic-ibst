import { useMemo, useState } from 'react';
import { Plus, GraduationCap, Users2, CalendarDays, LoaderCircle } from 'lucide-react';
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
  fetchLopDaoTao,
  createLopDaoTao,
  updateLopDaoTao,
  deleteLopDaoTao,
  LOAI_DAO_TAO_OPTIONS,
  type LopDaoTaoInput,
} from '../services/queries';
import type { LopDaoTao } from '../types';
import { formatNgay, cn } from '../lib/utils';

const LOAI_CLS: Record<string, string> = {
  NCS: 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  'Tập huấn': 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'Hội thảo': 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
};

const EMPTY_FORM: LopDaoTaoInput = {
  ten: '',
  loaiMa: 'tap-huan',
  soHocVien: '0',
  batDau: '',
  ketThuc: '',
  trangThai: 'moi',
};

export function DaoTaoPage() {
  const { data: lopList, loading, error, refetch } = useAsyncData(fetchLopDaoTao, []);

  const [filterLoai, setFilterLoai] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');

  const crud = useCrudForm<LopDaoTao, LopDaoTaoInput>({
    empty: EMPTY_FORM,
    toForm: (ld) => ({
      ten: ld.ten,
      loaiMa: ld.loaiMa,
      soHocVien: String(ld.soHocVien),
      batDau: ld.batDau,
      ketThuc: ld.ketThuc,
      trangThai: ld.trangThai,
    }),
    getId: (ld) => ld.id,
    create: createLopDaoTao,
    update: updateLopDaoTao,
    remove: deleteLopDaoTao,
    deleteMessage: (ld) => `Xóa lớp/sự kiện "${ld.ten}"?`,
    onDone: refetch,
  });

  const filtered = useMemo(
    () =>
      lopList.filter((ld) => {
        if (filterLoai && ld.loaiMa !== filterLoai) return false;
        if (filterTrangThai && ld.trangThai !== filterTrangThai) return false;
        return true;
      }),
    [lopList, filterLoai, filterTrangThai],
  );

  const table = useTableControls(filtered, (ld) => `${ld.ten} ${ld.loai}`);

  // ─── KPI từ dữ liệu thật ───
  const nam = String(new Date().getFullYear());
  const ncsDangDaoTao = lopList
    .filter((ld) => ld.loaiMa === 'ncs' && ld.trangThai === 'dang-thuc-hien')
    .reduce((s, ld) => s + ld.soHocVien, 0);
  const luotHocVienNam = lopList
    .filter((ld) => ld.batDau.startsWith(nam) || ld.ketThuc.startsWith(nam))
    .reduce((s, ld) => s + ld.soHocVien, 0);
  const sapDienRa = lopList.filter(
    (ld) => ld.trangThai === 'moi' && ld.batDau && new Date(ld.batDau).getTime() > Date.now(),
  ).length;

  return (
    <div>
      <PageHeader
        title="Đào tạo - Hội nghị"
        subtitle="Đào tạo tiến sĩ (NCS), tập huấn chuyên đề, hội nghị/hội thảo khoa học"
        actions={
          <button className="btn-primary" onClick={crud.openCreate}>
            <Plus size={16} /> Mở lớp / sự kiện
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={GraduationCap} label="NCS đang đào tạo" value={String(ncsDangDaoTao)} tone="primary" />
        <KpiCard icon={Users2} label={`Lượt học viên năm ${nam}`} value={luotHocVienNam.toLocaleString('vi-VN')} tone="success" />
        <KpiCard icon={CalendarDays} label="Sự kiện sắp diễn ra" value={String(sapDienRa)} tone="warning" />
      </div>

      <DataState loading={loading} error={error} empty={lopList.length === 0} />
      {crud.actionError && !crud.modalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {crud.actionError}
        </div>
      )}

      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm tên lớp, sự kiện..."
        total={table.total}
      >
        <FilterSelect
          value={filterLoai}
          onChange={setFilterLoai}
          options={LOAI_DAO_TAO_OPTIONS}
          allLabel="Tất cả loại"
        />
        <FilterSelect
          value={filterTrangThai}
          onChange={setFilterTrangThai}
          options={TRANG_THAI_OPTIONS}
          allLabel="Tất cả trạng thái"
        />
      </TableToolbar>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[780px]">
          <thead>
            <tr>
              <th className="th-cell">Tên lớp / sự kiện</th>
              <th className="th-cell">Loại</th>
              <th className="th-cell text-right">Học viên</th>
              <th className="th-cell">Bắt đầu</th>
              <th className="th-cell">Kết thúc</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.pageRows.map((ld) => (
              <tr key={ld.id} className="tr-hover">
                <td className="td-cell font-medium">{ld.ten}</td>
                <td className="td-cell">
                  <span className={cn('rounded-full px-2 py-0.5 text-2xs font-black uppercase', LOAI_CLS[ld.loai])}>
                    {ld.loai}
                  </span>
                </td>
                <td className="td-cell text-right font-mono text-xs">{ld.soHocVien}</td>
                <td className="td-cell font-mono text-xs">{ld.batDau ? formatNgay(ld.batDau) : '—'}</td>
                <td className="td-cell font-mono text-xs">{ld.ketThuc ? formatNgay(ld.ketThuc) : '—'}</td>
                <td className="td-cell"><StatusBadge value={ld.trangThai} /></td>
                <td className="td-cell">
                  <RowActions onEdit={() => crud.openEdit(ld)} onDelete={() => crud.removeRow(ld)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} onChange={table.setPage} />
      </div>

      {/* Modal thêm/sửa */}
      <Modal
        title={crud.editing ? `Sửa: ${crud.editing.ten}` : 'Mở lớp / sự kiện mới'}
        open={crud.modalOpen}
        onClose={crud.closeModal}
        wide
      >
        <form onSubmit={crud.submit} className="space-y-4">
          <Field label="Tên lớp / sự kiện" required>
            <input
              className={inputCls}
              required
              maxLength={255}
              value={crud.form.ten}
              onChange={(e) => crud.setForm({ ...crud.form, ten: e.target.value })}
              placeholder="VD: Tập huấn TCVN mới về kết cấu thép"
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Loại" required>
              <select
                className={inputCls}
                value={crud.form.loaiMa}
                onChange={(e) => crud.setForm({ ...crud.form, loaiMa: e.target.value })}
              >
                {LOAI_DAO_TAO_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </Field>
            <Field label="Số học viên">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={crud.form.soHocVien}
                onChange={(e) => crud.setForm({ ...crud.form, soHocVien: e.target.value })}
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày bắt đầu">
              <input
                type="date"
                className={inputCls}
                value={crud.form.batDau}
                onChange={(e) => crud.setForm({ ...crud.form, batDau: e.target.value })}
              />
            </Field>
            <Field label="Ngày kết thúc">
              <input
                type="date"
                className={inputCls}
                value={crud.form.ketThuc}
                onChange={(e) => crud.setForm({ ...crud.form, ketThuc: e.target.value })}
              />
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
              {crud.editing ? 'Lưu thay đổi' : 'Mở lớp / sự kiện'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
