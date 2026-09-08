import { useMemo, useState } from 'react';
import { Plus, GraduationCap, Users2, CalendarDays, LoaderCircle, Search, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, TRANG_THAI_OPTIONS } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination } from '../components/TableToolbar';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import { useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import {
  fetchLopDaoTao,
  createLopDaoTao,
  updateLopDaoTao,
  deleteLopDaoTao,
  LOAI_DAO_TAO_OPTIONS,
  fetchNghienCuuSinh,
  createNghienCuuSinh,
  updateNghienCuuSinh,
  deleteNghienCuuSinh,
  type LopDaoTaoInput,
  type NghienCuuSinhInput,
} from '../services/queries';
import type { LopDaoTao, NghienCuuSinh } from '../types';
import { TRANG_THAI_HOI_DONG_NCS } from '../types';
import { formatNgay, cn } from '../lib/utils';

const LOAI_CLS: Record<string, string> = {
  NCS: 'bg-accent-bg text-accent dark:bg-red-900/20 dark:text-red-400',
  'Tập huấn': 'bg-primary-subtle text-primary dark:bg-primary-900/30 dark:text-primary-300',
  'Hội thảo': 'bg-amber-50 text-warning dark:bg-amber-900/20 dark:text-amber-400',
};

const NCS_TRANG_THAI_CLS: Record<string, string> = {
  'chua-thanh-lap': 'bg-subtle text-ink-muted',
  'bao-ve-co-so': 'bg-info/10 text-info',
  'bao-ve-cap-vien': 'bg-warning/10 text-warning',
  'da-cap-bang': 'bg-success/10 text-success',
};

const EMPTY_NCS_FORM: NghienCuuSinhInput = {
  nhanSuId: '',
  hoTen: '',
  ngayNhapHoc: '',
  gvHuongDan: '',
  tenDeTai: '',
  donViId: '',
  trangThaiHoiDong: 'chua-thanh-lap',
  ghiChu: '',
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
  const [activeSubTab, setActiveSubTab] = useState<'lop' | 'ncs'>('lop');
  
  // Tab 1: Lop Dao Tao
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

  const filteredLop = useMemo(
    () =>
      lopList.filter((ld) => {
        if (filterLoai && ld.loaiMa !== filterLoai) return false;
        if (filterTrangThai && ld.trangThai !== filterTrangThai) return false;
        return true;
      }),
    [lopList, filterLoai, filterTrangThai],
  );

  const tableLop = useTableControls(filteredLop, (ld) => `${ld.ten} ${ld.loai}`);

  // Tab 2: Nghiên cứu sinh (bảng nghien_cuu_sinh — thật, không còn mock)
  const { data: ncsList, refetch: refetchNcs } = useAsyncData(fetchNghienCuuSinh, []);
  const [ncsSearch, setNcsSearch] = useState('');
  const [filterNcsTrangThai, setFilterNcsTrangThai] = useState('');

  const ncsCrud = useCrudForm<NghienCuuSinh, NghienCuuSinhInput>({
    empty: EMPTY_NCS_FORM,
    toForm: (ncs) => ({
      nhanSuId: ncs.nhanSuId ?? '',
      hoTen: ncs.hoTen,
      ngayNhapHoc: ncs.ngayNhapHoc,
      gvHuongDan: ncs.gvHuongDan,
      tenDeTai: ncs.tenDeTai,
      donViId: ncs.donViId ?? '',
      trangThaiHoiDong: ncs.trangThaiHoiDong,
      ghiChu: ncs.ghiChu,
    }),
    getId: (ncs) => ncs.id,
    create: createNghienCuuSinh,
    update: updateNghienCuuSinh,
    remove: deleteNghienCuuSinh,
    deleteMessage: (ncs) => `Xóa hồ sơ nghiên cứu sinh "${ncs.hoTen}"?`,
    onDone: refetchNcs,
  });

  const filteredNcs = useMemo(() => {
    return ncsList.filter((item) => {
      const q = ncsSearch.toLowerCase();
      if (q && !item.hoTen.toLowerCase().includes(q) && !item.gvHuongDan.toLowerCase().includes(q) && !item.tenDeTai.toLowerCase().includes(q)) return false;
      if (filterNcsTrangThai && item.trangThaiHoiDong !== filterNcsTrangThai) return false;
      return true;
    });
  }, [ncsList, ncsSearch, filterNcsTrangThai]);

  // ─── KPI từ dữ liệu thật ───
  const nam = String(new Date().getFullYear());
  const ncsDangDaoTao = ncsList.filter((ld) => ld.trangThaiHoiDong !== 'da-cap-bang').length;
  const luotHocVienNam = lopList
    .filter((ld) => ld.batDau.startsWith(nam) || ld.ketThuc.startsWith(nam))
    .reduce((s, ld) => s + ld.soHocVien, 0);
  const sapDienRa = lopList.filter(
    (ld) => ld.trangThai === 'moi' && ld.batDau && new Date(ld.batDau).getTime() > Date.now(),
  ).length;

  // ─── Slide panel: biểu mẫu Thêm/Sửa hồ sơ Nghiên cứu sinh ───
  useSlidePanelForm({
    id: 'ncs-form',
    open: ncsCrud.modalOpen,
    title: ncsCrud.editing ? 'Sửa hồ sơ Nghiên cứu sinh' : 'Thêm hồ sơ Nghiên cứu sinh',
    subtitle: ncsCrud.editing?.hoTen,
    storageKey: 'slideover-width-ncs-form',
    deps: [ncsCrud.form, ncsCrud.editing, ncsCrud.saving, ncsCrud.actionError],
    onDongNgoaiLuong: ncsCrud.closeModal,
    footer: (
      <>
        <button type="button" onClick={ncsCrud.closeModal} className="btn-ghost">Hủy</button>
        <button type="submit" form="form-ncs" disabled={ncsCrud.saving} className="btn-primary disabled:opacity-60">
          {ncsCrud.saving && <LoaderCircle size={15} className="animate-spin" />}
          {ncsCrud.editing ? 'Lưu thay đổi' : 'Thêm NCS'}
        </button>
      </>
    ),
    content: (
      <form id="form-ncs" onSubmit={ncsCrud.submit} className="space-y-4 p-5">
            <div className="grid grid-cols-2 gap-4">
              <Field label="Họ và tên NCS" required>
                <input
                  className={inputCls}
                  required
                  value={ncsCrud.form.hoTen}
                  onChange={(e) => ncsCrud.setForm({ ...ncsCrud.form, hoTen: e.target.value })}
                  placeholder="VD: Nguyễn Văn A"
                />
              </Field>
              <Field label="Ngày nhập học" required>
                <input
                  type="date"
                  className={inputCls}
                  required
                  value={ncsCrud.form.ngayNhapHoc}
                  onChange={(e) => ncsCrud.setForm({ ...ncsCrud.form, ngayNhapHoc: e.target.value })}
                />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Field label="Người hướng dẫn khoa học" required>
                <input
                  className={inputCls}
                  required
                  value={ncsCrud.form.gvHuongDan}
                  onChange={(e) => ncsCrud.setForm({ ...ncsCrud.form, gvHuongDan: e.target.value })}
                  placeholder="VD: GS.TS. Nguyễn Văn B"
                />
              </Field>
              <Field label="Trạng thái hội đồng luận án" required>
                <select
                  className={inputCls}
                  value={ncsCrud.form.trangThaiHoiDong}
                  onChange={(e) => ncsCrud.setForm({ ...ncsCrud.form, trangThaiHoiDong: e.target.value })}
                >
                  {TRANG_THAI_HOI_DONG_NCS.map((o) => (
                    <option key={o.ma} value={o.ma}>{o.ten}</option>
                  ))}
                </select>
              </Field>
            </div>
            <Field label="Tên đề tài luận án Tiến sĩ" required>
              <textarea
                className={cn(inputCls, 'min-h-20 resize-y')}
                required
                value={ncsCrud.form.tenDeTai}
                onChange={(e) => ncsCrud.setForm({ ...ncsCrud.form, tenDeTai: e.target.value })}
                placeholder="VD: Nghiên cứu thiết kế kháng chấn cho nhà cao tầng kết cấu composite..."
              />
            </Field>
            {ncsCrud.actionError && (
              <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
                {ncsCrud.actionError}
              </p>
            )}
      </form>
    ),
  });

  return (
    <div>
      <PageHeader
        title="Đào tạo - Hội nghị"
        subtitle="Đào tạo tiến sĩ (NCS), tập huấn chuyên đề, hội nghị/hội thảo khoa học"
        actions={
          activeSubTab === 'lop' ? (
            <button className="btn-primary" onClick={crud.openCreate}>
              <Plus size={16} /> Mở lớp / sự kiện
            </button>
          ) : (
            <button className="btn-primary" onClick={ncsCrud.openCreate}>
              <Plus size={16} /> Thêm Nghiên cứu sinh
            </button>
          )
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={GraduationCap} label="NCS đang đào tạo" value={String(ncsDangDaoTao)} tone="primary" />
        <KpiCard icon={Users2} label={`Lượt học viên năm ${nam}`} value={luotHocVienNam.toLocaleString('vi-VN')} tone="success" />
        <KpiCard icon={CalendarDays} label="Sự kiện sắp diễn ra" value={String(sapDienRa)} tone="warning" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveSubTab('lop')}
          className={cn(
            'pb-3 text-[14px] font-bold transition-all',
            activeSubTab === 'lop'
              ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          Lớp Đào tạo & Hội thảo ({lopList.length})
        </button>
        <button
          onClick={() => setActiveSubTab('ncs')}
          className={cn(
            'pb-3 text-[14px] font-bold transition-all',
            activeSubTab === 'ncs'
              ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          Hồ sơ Nghiên cứu sinh NCS ({ncsList.length})
        </button>
      </div>

      {activeSubTab === 'lop' ? (
        <>
          <DataState loading={loading} error={error} empty={lopList.length === 0} />
          {crud.actionError && !crud.modalOpen && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
              {crud.actionError}
            </div>
          )}

          <TableToolbar
            search={tableLop.search}
            onSearch={tableLop.setSearch}
            placeholder="Tìm tên lớp, sự kiện..."
            total={tableLop.total}
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
                {tableLop.pageRows.map((ld) => (
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
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => crud.openEdit(ld)}
                          className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => crud.removeRow(ld)}
                          className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <Pagination page={tableLop.page} totalPages={tableLop.totalPages} onChange={tableLop.setPage} />
          </div>
        </>
      ) : (
        <>
          <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
            <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2">
              <Search size={15} className="shrink-0 text-ink-muted" />
              <input
                className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
                placeholder="Tìm NCS, người hướng dẫn, tên đề tài..."
                value={ncsSearch}
                onChange={(e) => setNcsSearch(e.target.value)}
              />
            </div>
            <select
              className={cn(inputCls, 'w-auto min-w-44')}
              value={filterNcsTrangThai}
              onChange={(e) => setFilterNcsTrangThai(e.target.value)}
            >
              <option value="">Tất cả trạng thái hội đồng</option>
              {TRANG_THAI_HOI_DONG_NCS.map((o) => (
                <option key={o.ma} value={o.ma}>{o.ten}</option>
              ))}
            </select>
          </div>

          <div className="card overflow-x-auto">
            <table className="w-full min-w-[860px]">
              <thead>
                <tr>
                  <th className="th-cell">Họ và tên NCS</th>
                  <th className="th-cell">Ngày nhập học</th>
                  <th className="th-cell">Người hướng dẫn khoa học</th>
                  <th className="th-cell">Tên đề tài luận án Tiến sĩ</th>
                  <th className="th-cell">Trạng thái hội đồng</th>
                  <th className="th-cell w-20 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredNcs.map((item) => (
                  <tr key={item.id} className="tr-hover">
                    <td className="td-cell font-semibold">{item.hoTen}</td>
                    <td className="td-cell font-mono text-xs">{item.ngayNhapHoc}</td>
                    <td className="td-cell text-ink-secondary">{item.gvHuongDan}</td>
                    <td className="td-cell text-ink-secondary max-w-sm truncate" title={item.tenDeTai}>{item.tenDeTai}</td>
                    <td className="td-cell">
                      <span className={cn(
                        'inline-flex items-center px-2 py-0.5 rounded text-xs font-black',
                        NCS_TRANG_THAI_CLS[item.trangThaiHoiDong],
                      )}>
                        {TRANG_THAI_HOI_DONG_NCS.find((o) => o.ma === item.trangThaiHoiDong)?.ten ?? item.trangThaiHoiDong}
                      </span>
                    </td>
                    <td className="td-cell">
                      <div className="flex justify-end gap-1">
                        <button
                          onClick={() => ncsCrud.openEdit(item)}
                          className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          onClick={() => ncsCrud.removeRow(item)}
                          className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {filteredNcs.length === 0 && (
                  <tr>
                    <td colSpan={6} className="td-cell py-6 text-center text-ink-muted">
                      Không tìm thấy nghiên cứu sinh phù hợp.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </>
      )}

      {/* Modal Lớp Đào Tạo */}
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
