import { useMemo, useState } from 'react';
import { Plus, Microscope, Timer, BadgeCheck, LoaderCircle, Printer, ArrowRight } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, TRANG_THAI_OPTIONS } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination, RowActions } from '../components/TableToolbar';
import { KetQuaPhepThuPanel } from '../components/DetailPanels';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import {
  fetchMauThiNghiem,
  fetchKhachHangOptions,
  createMauThiNghiem,
  updateMauThiNghiem,
  deleteMauThiNghiem,
  type MauThiNghiemInput,
} from '../services/queries';
import { fetchKetQuaPhepThu, updateTrangThaiMau } from '../services/chitiet';
import type { MauThiNghiem, TrangThai } from '../types';
import { formatNgay } from '../lib/utils';
import { printPhieuKetQua } from '../lib/print';

// Luồng trạng thái phiếu: mới → đang thử → chờ duyệt → hoàn thành
const NEXT_TRANG_THAI: Partial<Record<TrangThai, { to: TrangThai; label: string }>> = {
  moi: { to: 'dang-thuc-hien', label: 'Bắt đầu thí nghiệm' },
  'dang-thuc-hien': { to: 'cho-duyet', label: 'Trình duyệt kết quả' },
  'cho-duyet': { to: 'hoan-thanh', label: 'Duyệt & phát hành' },
};

const EMPTY_FORM: MauThiNghiemInput = {
  maPhieu: '',
  tenMau: '',
  phepThu: '',
  tieuChuan: '',
  khachHangId: '',
  phongThiNghiem: 'LAS-XD 01',
  ngayNhan: '',
  hanTra: '',
  trangThai: 'moi',
};

const PHONG_TN_OPTIONS = ['LAS-XD 01', 'LAS-XD 02', 'LAS-XD 03'];
const NGAY_3 = 3 * 24 * 3600 * 1000;

export function ThiNghiemPage() {
  const { data: mauList, loading, error, refetch } = useAsyncData(fetchMauThiNghiem, []);
  const { data: khachHangOptions } = useAsyncData(fetchKhachHangOptions, []);

  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterPhong, setFilterPhong] = useState('');
  const [detail, setDetail] = useState<MauThiNghiem | null>(null);
  const [chuyenTrangThai, setChuyenTrangThai] = useState(false);

  const crud = useCrudForm<MauThiNghiem, MauThiNghiemInput>({
    empty: EMPTY_FORM,
    toForm: (m) => ({
      maPhieu: m.maPhieu,
      tenMau: m.tenMau,
      phepThu: m.phepThu,
      tieuChuan: m.tieuChuan,
      khachHangId: m.khachHangId ?? '',
      phongThiNghiem: m.phongThiNghiem,
      ngayNhan: m.ngayNhan,
      hanTra: m.hanTra,
      trangThai: m.trangThai,
    }),
    getId: (m) => m.id,
    create: createMauThiNghiem,
    update: updateMauThiNghiem,
    remove: deleteMauThiNghiem,
    deleteMessage: (m) => `Xóa phiếu mẫu "${m.maPhieu} — ${m.tenMau}"?`,
    onDone: refetch,
  });

  const filtered = useMemo(
    () =>
      mauList.filter((m) => {
        if (filterTrangThai && m.trangThai !== filterTrangThai) return false;
        if (filterPhong && m.phongThiNghiem !== filterPhong) return false;
        return true;
      }),
    [mauList, filterTrangThai, filterPhong],
  );

  const table = useTableControls(filtered, (m) => `${m.maPhieu} ${m.tenMau} ${m.phepThu} ${m.khachHang}`);

  // ─── KPI từ dữ liệu thật ───
  const now = Date.now();
  const dangXuLy = mauList.filter(
    (m) => m.trangThai === 'dang-thuc-hien' || m.trangThai === 'moi' || m.trangThai === 'cho-duyet',
  ).length;
  const sapDenHan = mauList.filter((m) => {
    if (m.trangThai === 'hoan-thanh' || !m.hanTra) return false;
    const t = new Date(m.hanTra).getTime();
    return t >= now && t - now <= NGAY_3;
  }).length;
  const thang = new Date().toISOString().slice(0, 7);
  const phatHanhThang = mauList.filter(
    (m) => m.trangThai === 'hoan-thanh' && (m.hanTra || m.ngayNhan).startsWith(thang),
  ).length;

  return (
    <div>
      <PageHeader
        title="Quản lý Thí nghiệm (LIMS)"
        subtitle="Tiếp nhận mẫu → phân công phép thử → nhập kết quả → duyệt → phát hành phiếu ký số"
        actions={
          <button className="btn-primary" onClick={crud.openCreate}>
            <Plus size={16} /> Tiếp nhận mẫu
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Microscope} label="Mẫu đang xử lý" value={String(dangXuLy)} tone="primary" />
        <KpiCard icon={Timer} label="Sắp đến hạn trả (3 ngày)" value={String(sapDenHan)} tone="warning" />
        <KpiCard icon={BadgeCheck} label="Hoàn thành trong tháng" value={String(phatHanhThang)} tone="success" />
      </div>

      <DataState loading={loading} error={error} empty={mauList.length === 0} />
      {crud.actionError && !crud.modalOpen && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          {crud.actionError}
        </div>
      )}

      <TableToolbar
        search={table.search}
        onSearch={table.setSearch}
        placeholder="Tìm mã phiếu, tên mẫu, phép thử..."
        total={table.total}
      >
        <FilterSelect
          value={filterTrangThai}
          onChange={setFilterTrangThai}
          options={TRANG_THAI_OPTIONS}
          allLabel="Tất cả trạng thái"
        />
        <FilterSelect
          value={filterPhong}
          onChange={setFilterPhong}
          options={PHONG_TN_OPTIONS.map((p) => ({ value: p, label: p }))}
          allLabel="Tất cả phòng TN"
        />
      </TableToolbar>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[980px]">
          <thead>
            <tr>
              <th className="th-cell">Mã phiếu</th>
              <th className="th-cell">Tên mẫu</th>
              <th className="th-cell">Phép thử / Tiêu chuẩn</th>
              <th className="th-cell">Khách hàng</th>
              <th className="th-cell">Phòng TN</th>
              <th className="th-cell">Ngày nhận</th>
              <th className="th-cell">Hạn trả</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {table.pageRows.map((m) => (
              <tr key={m.id} className="tr-hover cursor-pointer" onClick={() => setDetail(m)}>
                <td className="td-cell font-mono text-xs font-semibold text-primary">{m.maPhieu}</td>
                <td className="td-cell max-w-xs truncate font-medium">{m.tenMau}</td>
                <td className="td-cell text-ink-secondary">
                  {[m.phepThu, m.tieuChuan].filter(Boolean).join(' ')}
                </td>
                <td className="td-cell text-ink-secondary">{m.khachHang}</td>
                <td className="td-cell">
                  <span className="rounded bg-subtle px-1.5 py-0.5 font-mono text-2xs font-semibold">
                    {m.phongThiNghiem}
                  </span>
                </td>
                <td className="td-cell font-mono text-xs">{formatNgay(m.ngayNhan)}</td>
                <td className="td-cell font-mono text-xs">{m.hanTra ? formatNgay(m.hanTra) : '—'}</td>
                <td className="td-cell"><StatusBadge value={m.trangThai} /></td>
                <td className="td-cell">
                  <RowActions onEdit={() => crud.openEdit(m)} onDelete={() => crud.removeRow(m)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <Pagination page={table.page} totalPages={table.totalPages} onChange={table.setPage} />
      </div>

      {/* Modal thêm/sửa */}
      <Modal
        title={crud.editing ? `Sửa phiếu mẫu: ${crud.editing.maPhieu}` : 'Tiếp nhận mẫu thí nghiệm'}
        open={crud.modalOpen}
        onClose={crud.closeModal}
        wide
      >
        <form onSubmit={crud.submit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã phiếu" required>
              <input
                className={inputCls}
                required
                maxLength={50}
                value={crud.form.maPhieu}
                onChange={(e) => crud.setForm({ ...crud.form, maPhieu: e.target.value })}
                placeholder="VD: LAS-2607-0925"
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
          <Field label="Tên mẫu" required>
            <input
              className={inputCls}
              required
              maxLength={255}
              value={crud.form.tenMau}
              onChange={(e) => crud.setForm({ ...crud.form, tenMau: e.target.value })}
              placeholder="VD: Bê tông M400 — mẫu trụ 15x30"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Phép thử" required>
              <input
                className={inputCls}
                required
                maxLength={255}
                value={crud.form.phepThu}
                onChange={(e) => crud.setForm({ ...crud.form, phepThu: e.target.value })}
                placeholder="VD: Cường độ nén"
              />
            </Field>
            <Field label="Tiêu chuẩn áp dụng">
              <input
                className={inputCls}
                maxLength={150}
                value={crud.form.tieuChuan}
                onChange={(e) => crud.setForm({ ...crud.form, tieuChuan: e.target.value })}
                placeholder="VD: TCVN 3118"
              />
            </Field>
          </div>
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
            <Field label="Phòng thí nghiệm" required>
              <select
                className={inputCls}
                value={crud.form.phongThiNghiem}
                onChange={(e) => crud.setForm({ ...crud.form, phongThiNghiem: e.target.value })}
              >
                {PHONG_TN_OPTIONS.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Ngày nhận mẫu" required>
              <input
                type="date"
                className={inputCls}
                required
                value={crud.form.ngayNhan}
                onChange={(e) => crud.setForm({ ...crud.form, ngayNhan: e.target.value })}
              />
            </Field>
            <Field label="Hạn trả kết quả">
              <input
                type="date"
                className={inputCls}
                value={crud.form.hanTra}
                onChange={(e) => crud.setForm({ ...crud.form, hanTra: e.target.value })}
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
              {crud.editing ? 'Lưu thay đổi' : 'Tiếp nhận mẫu'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal chi tiết phiếu mẫu: kết quả + quy trình + in */}
      <Modal
        title={detail ? `Phiếu mẫu ${detail.maPhieu}` : ''}
        open={detail !== null}
        onClose={() => setDetail(null)}
        wide
      >
        {detail && (
          <div className="space-y-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h3 className="text-base font-bold text-ink">{detail.tenMau}</h3>
                <div className="mt-1.5 flex flex-wrap gap-x-5 gap-y-1 text-xs text-ink-secondary">
                  <span>Phép thử: <b className="text-ink">{[detail.phepThu, detail.tieuChuan].filter(Boolean).join(' ')}</b></span>
                  <span>KH: <b className="text-ink">{detail.khachHang}</b></span>
                  <span>Phòng: <b className="text-ink">{detail.phongThiNghiem}</b></span>
                  <StatusBadge value={detail.trangThai} />
                </div>
              </div>
              <div className="flex gap-2">
                {NEXT_TRANG_THAI[detail.trangThai] && (
                  <button
                    disabled={chuyenTrangThai}
                    onClick={async () => {
                      const next = NEXT_TRANG_THAI[detail.trangThai]!;
                      setChuyenTrangThai(true);
                      try {
                        await updateTrangThaiMau(detail.id, next.to);
                        setDetail({ ...detail, trangThai: next.to });
                        refetch();
                      } finally {
                        setChuyenTrangThai(false);
                      }
                    }}
                    className="flex items-center gap-1.5 rounded-lg bg-primary-500 px-3 py-1.5 text-xs font-bold text-white transition-colors hover:bg-primary-600 disabled:opacity-60"
                  >
                    {chuyenTrangThai ? <LoaderCircle size={13} className="animate-spin" /> : <ArrowRight size={13} />}
                    {NEXT_TRANG_THAI[detail.trangThai]!.label}
                  </button>
                )}
                <button
                  onClick={async () => {
                    const kq = await fetchKetQuaPhepThu(detail.id);
                    printPhieuKetQua(detail, kq);
                  }}
                  className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary transition-colors hover:bg-muted"
                >
                  <Printer size={13} /> In phiếu
                </button>
              </div>
            </div>
            <KetQuaPhepThuPanel key={detail.id} mauId={detail.id} />
          </div>
        )}
      </Modal>
    </div>
  );
}
