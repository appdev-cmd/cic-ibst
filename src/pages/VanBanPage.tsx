import { useEffect, useMemo, useState } from 'react';
import { Plus, FileDown, FileUp, AlertTriangle, LoaderCircle, Paperclip } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, TRANG_THAI_OPTIONS } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, RowActions } from '../components/TableToolbar';
import { FileAttachment } from '../components/FileAttachment';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import {
  fetchVanBan,
  fetchDonViOptions,
  createVanBan,
  updateVanBan,
  deleteVanBan,
  type VanBanInput,
} from '../services/queries';
import type { VanBan } from '../types';
import { formatNgay } from '../lib/utils';

const EMPTY_FORM: VanBanInput = {
  soHieu: '',
  trichYeu: '',
  loai: 'den',
  donViId: '',
  ngay: '',
  trangThai: 'moi',
};

export function VanBanPage() {
  const { data: vanBanList, loading, error, refetch } = useAsyncData(fetchVanBan, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);

  const [filterLoai, setFilterLoai] = useState('');
  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [detail, setDetail] = useState<VanBan | null>(null);

  const crud = useCrudForm<VanBan, VanBanInput>({
    empty: EMPTY_FORM,
    toForm: (vb) => ({
      soHieu: vb.soHieu,
      trichYeu: vb.trichYeu,
      loai: vb.loai === 'Đến' ? 'den' : 'di',
      donViId: vb.donViId ?? '',
      ngay: vb.ngay,
      trangThai: vb.trangThai,
    }),
    getId: (vb) => vb.id,
    create: createVanBan,
    update: updateVanBan,
    remove: deleteVanBan,
    deleteMessage: (vb) => `Xóa văn bản "${vb.soHieu}"?`,
    onDone: refetch,
  });

  const filtered = useMemo(
    () =>
      vanBanList.filter((vb) => {
        if (filterLoai && (vb.loai === 'Đến' ? 'den' : 'di') !== filterLoai) return false;
        if (filterTrangThai && vb.trangThai !== filterTrangThai) return false;
        return true;
      }),
    [vanBanList, filterLoai, filterTrangThai],
  );

  const table = useTableControls(filtered, (vb) => `${vb.soHieu} ${vb.trichYeu} ${vb.donVi}`);

  // Đồng bộ detail đang mở với dữ liệu mới sau khi upload/xóa tệp
  useEffect(() => {
    if (detail) {
      const fresh = vanBanList.find((v) => v.id === detail.id);
      if (fresh && fresh !== detail) setDetail(fresh);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [vanBanList]);

  // ─── KPI từ dữ liệu thật ───
  const thang = new Date().toISOString().slice(0, 7);
  const denTrongThang = vanBanList.filter((vb) => vb.loai === 'Đến' && vb.ngay.startsWith(thang)).length;
  const diTrongThang = vanBanList.filter((vb) => vb.loai === 'Đi' && vb.ngay.startsWith(thang)).length;
  const choXuLy = vanBanList.filter((vb) => vb.trangThai === 'moi' || vb.trangThai === 'cho-duyet').length;
  const quaHan = vanBanList.filter((vb) => vb.trangThai === 'qua-han').length;

  // SlidePanel Chi tiết Văn bản + Tệp đính kèm
  useSlidePanelChiTiet({
    id: 'van-ban-detail',
    active: detail !== null,
    title: detail ? `Văn bản ${detail.soHieu}` : '',
    subtitle: detail ? `Văn bản ${detail.loai} • ${detail.donVi}` : '',
    icon: detail?.loai === 'Đến' ? <FileDown size={18} className="text-primary" /> : <FileUp size={18} className="text-primary" />,
    storageKey: 'slideover-width-van-ban-detail',
    minWidth: 560,
    onDongNgoaiLuong: () => setDetail(null),
    headerExtra: detail ? (
      <button
        type="button"
        onClick={() => {
          const vb = detail;
          setDetail(null);
          crud.openEdit(vb);
        }}
        className="rounded-lg border border-border px-2.5 py-1 text-xs font-semibold hover:bg-muted"
      >
        Chỉnh sửa
      </button>
    ) : undefined,
    content: detail ? (
      <div className="space-y-4">
        <div className="rounded-xl border border-border bg-subtle p-3 text-xs space-y-2">
          <p className="whitespace-pre-line text-sm font-medium text-ink">{detail.trichYeu}</p>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-1 text-xs text-ink-secondary">
            <span>Loại: <b className="text-ink">Văn bản {detail.loai}</b></span>
            <span>Đơn vị: <b className="text-ink">{detail.donVi}</b></span>
            <span>Ngày: <b className="font-mono text-ink">{formatNgay(detail.ngay)}</b></span>
            <StatusBadge value={detail.trangThai} />
          </div>
        </div>
        <FileAttachment
          key={detail.id}
          vanBanId={detail.id}
          tepDinhKem={detail.tepDinhKem}
          tenTep={detail.tenTep}
          onChanged={refetch}
        />
      </div>
    ) : null,
    footer: (
      <button
        type="button"
        onClick={() => setDetail(null)}
        className="rounded-xl border border-border px-4 py-2 text-xs font-semibold hover:bg-muted"
      >
        Đóng
      </button>
    ),
    deps: [detail],
  });

  // SlidePanel Form Thêm / Sửa Văn bản
  useSlidePanelForm({
    id: 'van-ban-form',
    open: crud.modalOpen,
    title: crud.editing ? `Sửa văn bản: ${crud.editing.soHieu}` : 'Thêm văn bản',
    subtitle: crud.editing ? crud.editing.trichYeu : 'Nhập thông tin văn bản đến/đi và phân công đơn vị',
    icon: crud.form.loai === 'den' ? <FileDown size={18} className="text-primary" /> : <FileUp size={18} className="text-primary" />,
    storageKey: 'slideover-width-van-ban-form',
    minWidth: 540,
    onDongNgoaiLuong: crud.closeModal,
    content: (
      <form id="van-ban-form-element" onSubmit={crud.submit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Field label="Số hiệu" required>
            <input
              className={inputCls}
              required
              maxLength={150}
              value={crud.form.soHieu}
              onChange={(e) => crud.setForm({ ...crud.form, soHieu: e.target.value })}
              placeholder="VD: 1250/BXD-KHCN"
            />
          </Field>
          <Field label="Loại văn bản" required>
            <select
              className={inputCls}
              value={crud.form.loai}
              onChange={(e) => crud.setForm({ ...crud.form, loai: e.target.value as 'den' | 'di' })}
            >
              <option value="den">Văn bản đến</option>
              <option value="di">Văn bản đi</option>
            </select>
          </Field>
        </div>
        <Field label="Trích yếu" required>
          <textarea
            className={`${inputCls} min-h-20 resize-y`}
            required
            maxLength={500}
            value={crud.form.trichYeu}
            onChange={(e) => crud.setForm({ ...crud.form, trichYeu: e.target.value })}
          />
        </Field>
        <div className="grid grid-cols-3 gap-4">
          <Field label="Đơn vị xử lý">
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
          <Field label="Ngày văn bản" required>
            <input
              type="date"
              className={inputCls}
              required
              value={crud.form.ngay}
              onChange={(e) => crud.setForm({ ...crud.form, ngay: e.target.value })}
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
      </form>
    ),
    footer: (
      <div className="flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={crud.closeModal}
          className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
        >
          Hủy
        </button>
        <button type="submit" form="van-ban-form-element" disabled={crud.saving} className="btn-primary disabled:opacity-60">
          {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
          {crud.editing ? 'Lưu thay đổi' : 'Thêm văn bản'}
        </button>
      </div>
    ),
    deps: [crud.form, crud.saving, crud.actionError, crud.editing, donViOptions],
  });

  return (
    <div>
      <PageHeader
        title="Văn bản - Điều hành"
        subtitle="Quản lý văn bản đến/đi, trình ký điện tử, liên thông trục VBĐT"
        actions={
          <button className="btn-primary" onClick={crud.openCreate}>
            <Plus size={16} /> Thêm văn bản
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={FileDown} label="Văn bản đến trong tháng" value={String(denTrongThang)} tone="primary" />
        <KpiCard icon={FileUp} label="Văn bản đi trong tháng" value={String(diTrongThang)} tone="success" />
        <KpiCard icon={AlertTriangle} label="Chờ xử lý / quá hạn" value={`${choXuLy} / ${quaHan}`} tone="accent" />
      </div>

      <DataState loading={loading} error={error} empty={vanBanList.length === 0} />
      {crud.actionError && !crud.modalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {crud.actionError}
        </div>
      )}

      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm số hiệu, trích yếu..."
        total={table.total}
      >
        <FilterSelect
          value={filterLoai}
          onChange={setFilterLoai}
          options={[
            { value: 'den', label: 'Văn bản đến' },
            { value: 'di', label: 'Văn bản đi' },
          ]}
          allLabel="Đến & đi"
        />
        <FilterSelect
          value={filterTrangThai}
          onChange={setFilterTrangThai}
          options={TRANG_THAI_OPTIONS}
          allLabel="Tất cả trạng thái"
        />
      </TableToolbar>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 280px)' }}>
        <table className="w-full min-w-[820px]">
          <thead className="thead-sticky">
            <tr>
              <th className="th-cell w-10 text-center">#</th>
              <th className="th-cell">Số hiệu</th>
              <th className="th-cell">Trích yếu</th>
              <th className="th-cell">Loại</th>
              <th className="th-cell">Đơn vị xử lý</th>
              <th className="th-cell">Ngày</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.filteredRows.map((vb, idx) => (
              <tr key={vb.id} className="tr-stripe cursor-pointer" onClick={() => setDetail(vb)}>
                <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
                <td className="td-cell font-mono text-xs font-semibold text-primary">
                  <span className="inline-flex items-center gap-1.5">
                    {vb.soHieu}
                    {vb.tepDinhKem && <Paperclip size={12} className="text-ink-muted" />}
                  </span>
                </td>
                <td className="td-cell max-w-md">{vb.trichYeu}</td>
                <td className="td-cell">
                  <span className={vb.loai === 'Đến' ? 'font-semibold text-info' : 'font-semibold text-success'}>
                    {vb.loai}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{vb.donVi}</td>
                <td className="td-cell font-mono text-xs">{formatNgay(vb.ngay)}</td>
                <td className="td-cell"><StatusBadge value={vb.trangThai} /></td>
                <td className="td-cell">
                  <RowActions onEdit={() => crud.openEdit(vb)} onDelete={() => crud.removeRow(vb)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        </div>
      </div>


    </div>
  );
}
