import { useMemo, useState } from 'react';
import { Plus, Handshake, Banknote, AlertTriangle, LoaderCircle } from 'lucide-react';
import { DotThanhToanPanel } from '../components/DetailPanels';
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
  fetchHopDong,
  fetchKhachHangOptions,
  fetchDonViOptions,
  createHopDong,
  updateHopDong,
  deleteHopDong,
  type HopDongInput,
} from '../services/queries';
import type { HopDong } from '../types';
import { formatTrieu, formatNgay, cn } from '../lib/utils';

const EMPTY_FORM: HopDongInput = {
  soHD: '',
  ten: '',
  khachHangId: '',
  donViId: '',
  giaTri: '',
  daThanhToan: '',
  ngayKy: '',
  hanHoanThanh: '',
  trangThai: 'moi',
};

const NGAY_30 = 30 * 24 * 3600 * 1000;

export function HopDongPage() {
  const { data: hopDongList, loading, error, refetch } = useAsyncData(fetchHopDong, []);
  const { data: khachHangOptions } = useAsyncData(fetchKhachHangOptions, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);

  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [detail, setDetail] = useState<HopDong | null>(null);

  const crud = useCrudForm<HopDong, HopDongInput>({
    empty: EMPTY_FORM,
    toForm: (hd) => ({
      soHD: hd.soHD,
      ten: hd.ten,
      khachHangId: hd.khachHangId ?? '',
      donViId: hd.donViId ?? '',
      giaTri: String(hd.giaTri || ''),
      daThanhToan: String(hd.daThanhToan || ''),
      ngayKy: hd.ngayKy,
      hanHoanThanh: hd.hanHoanThanh,
      trangThai: hd.trangThai,
    }),
    getId: (hd) => hd.id,
    create: createHopDong,
    update: updateHopDong,
    remove: deleteHopDong,
    deleteMessage: (hd) => `Xóa hợp đồng "${hd.soHD} — ${hd.ten}"?`,
    onDone: refetch,
  });

  const filtered = useMemo(
    () =>
      hopDongList.filter((hd) => {
        if (filterTrangThai && hd.trangThai !== filterTrangThai) return false;
        if (filterDonVi && hd.donViId !== filterDonVi) return false;
        return true;
      }),
    [hopDongList, filterTrangThai, filterDonVi],
  );

  const table = useTableControls(filtered, (hd) => `${hd.soHD} ${hd.ten} ${hd.khachHang}`);

  // ─── KPI từ dữ liệu thật ───
  const dangThucHien = hopDongList.filter((hd) => hd.trangThai === 'dang-thuc-hien');
  const tongDangThucHien = dangThucHien.reduce((s, hd) => s + hd.giaTri, 0);
  const conPhaiThu = hopDongList
    .filter((hd) => hd.trangThai !== 'moi')
    .reduce((s, hd) => s + Math.max(0, hd.giaTri - hd.daThanhToan), 0);
  const now = Date.now();
  const soQuaHan = hopDongList.filter(
    (hd) =>
      hd.trangThai === 'qua-han' ||
      (hd.trangThai !== 'hoan-thanh' && hd.hanHoanThanh && new Date(hd.hanHoanThanh).getTime() < now),
  ).length;
  const soSapDenHan = hopDongList.filter((hd) => {
    if (hd.trangThai === 'hoan-thanh' || !hd.hanHoanThanh) return false;
    const t = new Date(hd.hanHoanThanh).getTime();
    return t >= now && t - now <= NGAY_30;
  }).length;

  return (
    <div>
      <PageHeader
        title="Hợp đồng dịch vụ & Dự án tư vấn"
        subtitle="Pipeline: báo giá → hợp đồng → nghiệm thu → hóa đơn → công nợ → thanh lý"
        actions={
          <button className="btn-primary" onClick={crud.openCreate}>
            <Plus size={16} /> Tạo hợp đồng
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard
          icon={Handshake}
          label={`Đang thực hiện (${dangThucHien.length} HĐ)`}
          value={formatTrieu(tongDangThucHien)}
          tone="primary"
        />
        <KpiCard icon={Banknote} label="Còn phải thu" value={formatTrieu(conPhaiThu)} tone="warning" />
        <KpiCard
          icon={AlertTriangle}
          label="Quá hạn / đến hạn 30 ngày"
          value={`${soQuaHan} / ${soSapDenHan}`}
          tone="accent"
        />
      </div>

      <DataState loading={loading} error={error} empty={hopDongList.length === 0} />
      {crud.actionError && !crud.modalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {crud.actionError}
        </div>
      )}

      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm số HĐ, tên, khách hàng..."
        total={table.total}
      >
        <FilterSelect
          value={filterTrangThai}
          onChange={setFilterTrangThai}
          options={TRANG_THAI_OPTIONS}
          allLabel="Tất cả trạng thái"
        />
        <FilterSelect
          value={filterDonVi}
          onChange={setFilterDonVi}
          options={donViOptions.map((d) => ({ value: d.id, label: d.ten }))}
          allLabel="Tất cả đơn vị"
        />
      </TableToolbar>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[1020px]">
          <thead>
            <tr>
              <th className="th-cell">Số HĐ</th>
              <th className="th-cell">Tên hợp đồng</th>
              <th className="th-cell">Khách hàng</th>
              <th className="th-cell">Đơn vị thực hiện</th>
              <th className="th-cell">Giá trị</th>
              <th className="th-cell">Thanh toán</th>
              <th className="th-cell">Hạn hoàn thành</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.pageRows.map((hd) => {
              const pct = hd.giaTri > 0 ? Math.round((hd.daThanhToan / hd.giaTri) * 100) : 0;
              return (
                <tr key={hd.id} className="tr-hover cursor-pointer" onClick={() => setDetail(hd)}>
                  <td className="td-cell font-mono text-xs font-semibold text-primary">{hd.soHD}</td>
                  <td className="td-cell max-w-sm truncate font-medium">{hd.ten}</td>
                  <td className="td-cell text-ink-secondary">{hd.khachHang}</td>
                  <td className="td-cell text-ink-secondary">{hd.donViThucHien}</td>
                  <td className="td-cell font-mono text-xs font-semibold">{formatTrieu(hd.giaTri)}</td>
                  <td className="td-cell w-36">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 flex-1 rounded-full bg-subtle">
                        <div
                          className={cn('h-1.5 rounded-full', pct === 100 ? 'bg-success' : 'bg-info')}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-mono text-xs">{pct}%</span>
                    </div>
                  </td>
                  <td className="td-cell font-mono text-xs">
                    {hd.hanHoanThanh ? formatNgay(hd.hanHoanThanh) : '—'}
                  </td>
                  <td className="td-cell"><StatusBadge value={hd.trangThai} /></td>
                  <td className="td-cell">
                    <RowActions onEdit={() => crud.openEdit(hd)} onDelete={() => crud.removeRow(hd)} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} onChange={table.setPage} />
      </div>

      {/* Modal thêm/sửa */}
      <Modal
        title={crud.editing ? `Sửa hợp đồng: ${crud.editing.soHD}` : 'Tạo hợp đồng mới'}
        open={crud.modalOpen}
        onClose={crud.closeModal}
        wide
      >
        <form onSubmit={crud.submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Số hợp đồng" required>
              <input
                className={inputCls}
                required
                maxLength={150}
                value={crud.form.soHD}
                onChange={(e) => crud.setForm({ ...crud.form, soHD: e.target.value })}
                placeholder="VD: 245/2026/HĐKT"
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
          <Field label="Tên hợp đồng" required>
            <input
              className={inputCls}
              required
              maxLength={500}
              value={crud.form.ten}
              onChange={(e) => crud.setForm({ ...crud.form, ten: e.target.value })}
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Khách hàng">
              <select
                className={inputCls}
                value={crud.form.khachHangId}
                onChange={(e) => crud.setForm({ ...crud.form, khachHangId: e.target.value })}
              >
                <option value="">— Chưa chọn —</option>
                {khachHangOptions.map((o) => (
                  <option key={o.id} value={o.id}>{o.ten}</option>
                ))}
              </select>
            </Field>
            <Field label="Đơn vị thực hiện">
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
          <div className="grid grid-cols-2 gap-4">
            <Field label="Giá trị (triệu đồng)" required>
              <input
                type="number"
                min={0}
                className={inputCls}
                required
                value={crud.form.giaTri}
                onChange={(e) => crud.setForm({ ...crud.form, giaTri: e.target.value })}
              />
            </Field>
            <Field label="Đã thanh toán (triệu đồng)">
              <input
                type="number"
                min={0}
                className={inputCls}
                value={crud.form.daThanhToan}
                onChange={(e) => crud.setForm({ ...crud.form, daThanhToan: e.target.value })}
              />
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày ký">
              <input
                type="date"
                className={inputCls}
                value={crud.form.ngayKy}
                onChange={(e) => crud.setForm({ ...crud.form, ngayKy: e.target.value })}
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
              {crud.editing ? 'Lưu thay đổi' : 'Tạo hợp đồng'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal chi tiết + đợt thanh toán */}
      <Modal
        title={detail ? `Hợp đồng ${detail.soHD}` : ''}
        open={detail !== null}
        onClose={() => setDetail(null)}
        wide
      >
        {detail && (
          <div className="space-y-4">
            <div>
              <h3 className="text-base font-bold text-ink">{detail.ten}</h3>
              <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-secondary">
                <span>Khách hàng: <b className="text-ink">{detail.khachHang}</b></span>
                <span>Đơn vị: <b className="text-ink">{detail.donViThucHien}</b></span>
                <span>Giá trị: <b className="font-mono text-ink">{formatTrieu(detail.giaTri)}</b></span>
                <span>Trạng thái: <StatusBadge value={detail.trangThai} /></span>
              </div>
            </div>
            <DotThanhToanPanel
              key={detail.id}
              hopDongId={detail.id}
              giaTri={detail.giaTri}
              onChanged={refetch}
            />
          </div>
        )}
      </Modal>
    </div>
  );
}
