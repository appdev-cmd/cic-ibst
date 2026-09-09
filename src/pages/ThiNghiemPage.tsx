import { useMemo, useState } from 'react';
import { Microscope, Timer, LoaderCircle, Printer, ShieldCheck, Wrench, AlertTriangle, Building } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatusBadge, TRANG_THAI_OPTIONS } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, RowActions } from '../components/TableToolbar';
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
import { formatNgay, cn } from '../lib/utils';
import { printPhieuKetQua } from '../lib/print';

type Tab = 'mau-thu' | 'thiet-bi-las' | 'dau-tu-cong';

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

const PHONG_TN_OPTIONS = [
  'LAS-XD 01',
  'LAS-XD 18',
  'LAS-XD 25',
  'LAS-XD 38',
  'LAS-XD 102'
];

const MOCK_EQUIPMENT = [
  { id: 'eq-01', ten: 'Lò thử nghiệm chịu lửa đứng 3x3m', maHieu: 'EQUIP-FIRE-01', las: 'LAS-XD 18', hanKiemDinh: '2026-08-15', ngayConLai: 22, trangThai: 'Sắp đến hạn kiểm định' },
  { id: 'eq-02', ten: 'Máy nén bê tông 3000 kN tự động', maHieu: 'EQUIP-COMP-02', las: 'LAS-XD 38', hanKiemDinh: '2026-11-20', ngayConLai: 118, trangThai: 'Đạt chuẩn hiệu chuẩn' },
  { id: 'eq-03', ten: 'Hệ thống đo tải trọng động & gia tốc rung 64 kênh', maHieu: 'EQUIP-DYN-05', las: 'LAS-XD 25', hanKiemDinh: '2026-08-05', ngayConLai: 12, trangThai: 'Cảnh báo hiệu chuẩn' },
];

export function ThiNghiemPage() {
  const [activeTab, setActiveTab] = useState<Tab>('mau-thu');

  const { data: mauList, loading, error, refetch } = useAsyncData(fetchMauThiNghiem, []);
  const { data: khachHangOptions } = useAsyncData(fetchKhachHangOptions, []);

  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterPhongTN, setFilterPhongTN] = useState('');
  const [detail, setDetail] = useState<MauThiNghiem | null>(null);

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
    deleteMessage: (m) => `Bạn có chắc muốn xóa phiếu mẫu ${m.maPhieu}?`,
    onDone: () => refetch(),
  });

  const filteredList = useMemo(() => {
    return mauList.filter((m) => {
      if (filterTrangThai && m.trangThai !== filterTrangThai) return false;
      if (filterPhongTN && m.phongThiNghiem !== filterPhongTN) return false;
      return true;
    });
  }, [mauList, filterTrangThai, filterPhongTN]);

  const table = useTableControls(
    filteredList,
    (m) => `${m.maPhieu} ${m.tenMau} ${m.phepThu} ${m.tieuChuan} ${m.phongThiNghiem}`,
    10
  );

  const [advancingId, setAdvancingId] = useState<string | null>(null);

  const handleNextTrangThai = async (mau: MauThiNghiem) => {
    const nxt = NEXT_TRANG_THAI[mau.trangThai];
    if (!nxt) return;

    if (nxt.to === 'hoan-thanh') {
      try {
        const pt = await fetchKetQuaPhepThu(mau.id);
        const chuaNhap = pt.filter((p) => p.ketQua === null || p.ketQua === undefined || p.ketQua === '');
        if (chuaNhap.length > 0) {
          alert(`Chưa thể phát hành! Còn ${chuaNhap.length} phép thử chưa nhập kết quả.`);
          return;
        }
      } catch (er) {
        console.error(er);
      }
    }

    setAdvancingId(mau.id);
    try {
      await updateTrangThaiMau(mau.id, nxt.to);
      refetch();
      if (detail?.id === mau.id) {
        setDetail((prev) => (prev ? { ...prev, trangThai: nxt.to } : null));
      }
    } catch (er) {
      alert(er instanceof Error ? er.message : String(er));
    } finally {
      setAdvancingId(null);
    }
  };

  const handlePrint = async (m: MauThiNghiem) => {
    try {
      const ptList = await fetchKetQuaPhepThu(m.id);
      printPhieuKetQua(m, ptList);
    } catch (er) {
      alert('Không thể tải phép thử để in: ' + (er instanceof Error ? er.message : String(er)));
    }
  };

  return (
    <div>
      <PageHeader
        title="Hệ thống Thử nghiệm (LIMS), Thiết bị Lab & Đầu tư"
        subtitle="Tiếp nhận mẫu, tính kết quả cơ lý ISO/IEC 17025, ký số CA pháp lý tệp PDF & Nhắc lịch kiểm định thiết bị 11 phòng LAS-XD trước 30 ngày"
      />

      {/* Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        <button
          onClick={() => setActiveTab('mau-thu')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'mau-thu'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Microscope size={16} /> Phiếu Thử nghiệm & Chữ ký số CA
        </button>
        <button
          onClick={() => setActiveTab('thiet-bi-las')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'thiet-bi-las'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Wrench size={16} /> Danh mục Thiết bị 11 phòng LAS-XD
        </button>
        <button
          onClick={() => setActiveTab('dau-tu-cong')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'dau-tu-cong'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Building size={16} /> Giám sát Vốn Đầu tư Công
        </button>
      </div>

      {activeTab === 'mau-thu' && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <KpiCard label="TỔNG MẪU TIẾP NHẬN" value={String(mauList.length)} icon={Microscope} tone="primary" />
            <KpiCard
              label="ĐANG THỰC HIỆN"
              value={String(mauList.filter((m) => m.trangThai === 'dang-thuc-hien').length)}
              icon={Timer}
              tone="warning"
            />
            <KpiCard
              label="HOÀN THÀNH & KÝ SỐ CA"
              value={String(mauList.filter((m) => m.trangThai === 'hoan-thanh').length)}
              icon={ShieldCheck}
              tone="success"
            />
          </div>

          <DataState loading={loading} error={error} empty={mauList.length === 0} />

          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <TableToolbar
              search={table.search}
              onSearch={table.setSearch}
              placeholder="Tìm theo mã phiếu, tên mẫu..."
              total={table.total}
            >
              <FilterSelect
                value={filterTrangThai}
                onChange={setFilterTrangThai}
                allLabel="-- Trạng thái --"
                options={TRANG_THAI_OPTIONS}
              />
              <FilterSelect
                value={filterPhongTN}
                onChange={setFilterPhongTN}
                allLabel="-- Phòng LAS-XD --"
                options={PHONG_TN_OPTIONS.map((p) => ({ value: p, label: p }))}
              />
            </TableToolbar>
            <button onClick={crud.openCreate} className="btn-primary mb-3">
              + Tạo phiếu mẫu mới
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card overflow-hidden lg:col-span-2">
              <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
              <table className="w-full min-w-[640px]">
                <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-[#1f2332]">
                  <tr>
                    <th className="th-cell w-10 text-center">#</th>
                    <th className="th-cell">Mã phiếu / Tên mẫu</th>
                    <th className="th-cell">Phép thử & Quy chuẩn</th>
                    <th className="th-cell">Phòng LAS-XD</th>
                    <th className="th-cell text-center">Trạng thái & Chữ ký số</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {table.filteredRows.map((mauItem, idx) => {
                    const mau = mauItem as MauThiNghiem;
                    const active = detail?.id === mau.id;
                    const nxt = NEXT_TRANG_THAI[mau.trangThai];
                    const isAdv = advancingId === mau.id;

                    return (
                      <tr
                        key={mau.id}
                        onClick={() => setDetail(mau)}
                        className={cn(
                          'tr-hover cursor-pointer',
                          active && 'bg-primary-subtle/50 dark:bg-primary-900/20',
                        )}
                      >
                        <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
                        <td className="td-cell">
                          <div className="font-semibold text-ink">{mau.maPhieu}</div>
                          <div className="text-2xs text-ink-muted">{mau.tenMau}</div>
                        </td>
                        <td className="td-cell">
                          <div className="text-ink">{mau.phepThu}</div>
                          <div className="text-2xs font-mono text-ink-muted">{mau.tieuChuan}</div>
                        </td>
                        <td className="td-cell text-ink-secondary">{mau.phongThiNghiem}</td>
                        <td className="td-cell text-center">
                          <StatusBadge value={mau.trangThai} />
                          {mau.trangThai === 'hoan-thanh' && (
                            <div className="mt-1 flex items-center justify-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                              <ShieldCheck size={12} /> Ký số CA ISO 17025
                            </div>
                          )}
                        </td>
                        <td className="td-cell text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            {nxt && (
                              <button
                                onClick={() => handleNextTrangThai(mau)}
                                disabled={isAdv}
                                className="btn-secondary py-1 text-2xs font-bold"
                              >
                                {isAdv ? <LoaderCircle size={12} className="animate-spin" /> : nxt.label}
                              </button>
                            )}
                            {mau.trangThai === 'hoan-thanh' && (
                              <button
                                onClick={() => handlePrint(mau)}
                                className="rounded p-1 text-ink-muted hover:bg-muted hover:text-ink"
                                title="In / Xuất PDF có Chữ ký số"
                              >
                                <Printer size={15} />
                              </button>
                            )}
                            <RowActions
                              onEdit={() => crud.openEdit(mau)}
                              onDelete={() => crud.removeRow(mau)}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              </div>
            </div>

            <div className="lg:col-span-1">
              <KetQuaPhepThuPanel mauId={detail?.id ?? ''} />
            </div>
          </div>
        </>
      )}

      {activeTab === 'thiet-bi-las' && (
        <div className="space-y-4">
          <div className="card p-4 border-l-4 border-l-amber-500 bg-subtle/50 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="text-amber-600 h-6 w-6 shrink-0" />
              <div>
                <h4 className="font-bold text-ink text-sm">Cảnh báo Tự động Hiệu chuẩn Thiết bị (Trước 30 Ngày)</h4>
                <p className="text-xs text-ink-muted">Tự động quét danh mục thiết bị của 11 phòng thí nghiệm LAS-XD toàn quốc để đảm bảo tính pháp lý Phiếu kết quả thử nghiệm.</p>
              </div>
            </div>
          </div>

          <div className="card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-border bg-muted/50 font-bold text-ink-muted">
                  <th className="p-3">Mã hiệu Thiết bị</th>
                  <th className="p-3">Tên Thiết bị Thử nghiệm</th>
                  <th className="p-3">Phòng LAS-XD phụ trách</th>
                  <th className="p-3">Hạn Kiểm định / Hiệu chuẩn</th>
                  <th className="p-3">Số ngày còn lại</th>
                  <th className="p-3">Trạng thái Pháp lý</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {MOCK_EQUIPMENT.map((eq) => (
                  <tr key={eq.id} className="hover:bg-muted/30">
                    <td className="p-3 font-mono font-bold text-ink">{eq.maHieu}</td>
                    <td className="p-3 font-semibold text-ink">{eq.ten}</td>
                    <td className="p-3 text-ink-secondary">{eq.las}</td>
                    <td className="p-3 text-ink-muted">{formatNgay(eq.hanKiemDinh)}</td>
                    <td className="p-3 font-bold text-amber-600">{eq.ngayConLai} ngày</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 dark:bg-amber-900/30 px-2.5 py-0.5 text-2xs font-bold text-amber-700 dark:text-amber-300">
                        {eq.trangThai}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'dau-tu-cong' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="card p-4 border-l-4 border-l-primary">
              <p className="text-2xs font-bold uppercase text-ink-muted">Tổng vốn Đầu tư công được duyệt</p>
              <p className="mt-1 text-xl font-black text-primary">15.000.000.000 VNĐ</p>
              <p className="text-2xs text-ink-muted mt-1">Dự án Nâng cấp Trạm Thử nghiệm Hòa Lạc</p>
            </div>
            <div className="card p-4 border-l-4 border-l-emerald-600">
              <p className="text-2xs font-bold uppercase text-ink-muted">Đã giải ngân thực tế</p>
              <p className="mt-1 text-xl font-black text-emerald-600 dark:text-emerald-400">11.250.000.000 VNĐ</p>
              <p className="text-2xs text-ink-muted mt-1">Đạt 75% kế hoạch vốn 2026</p>
            </div>
            <div className="card p-4 border-l-4 border-l-indigo-600">
              <p className="text-2xs font-bold uppercase text-ink-muted">Thiết bị đã nghiệm thu</p>
              <p className="mt-1 text-xl font-black text-indigo-600 dark:text-indigo-400">08 Hạng mục lớn</p>
              <p className="text-2xs text-ink-muted mt-1">Đưa vào vận hành 100%</p>
            </div>
          </div>
        </div>
      )}

      {/* Modal Thêm/Sửa Mẫu */}
      <Modal
        open={crud.modalOpen}
        onClose={crud.closeModal}
        title={crud.editing ? 'Chỉnh sửa phiếu mẫu' : 'Tạo phiếu mẫu mới'}
      >
        <form onSubmit={crud.submit} className="space-y-4">
          {crud.actionError && (
            <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">
              {crud.actionError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Mã phiếu mẫu" required>
              <input
                type="text"
                required
                value={crud.form.maPhieu}
                onChange={(e) => crud.setForm({ ...crud.form, maPhieu: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Phòng thí nghiệm LAS-XD">
              <select
                value={crud.form.phongThiNghiem}
                onChange={(e) => crud.setForm({ ...crud.form, phongThiNghiem: e.target.value })}
                className={inputCls}
              >
                {PHONG_TN_OPTIONS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tên mẫu thử" required>
            <input
              type="text"
              required
              value={crud.form.tenMau}
              onChange={(e) => crud.setForm({ ...crud.form, tenMau: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Phép thử">
              <input
                type="text"
                value={crud.form.phepThu}
                onChange={(e) => crud.setForm({ ...crud.form, phepThu: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Tiêu chuẩn áp dụng">
              <input
                type="text"
                value={crud.form.tieuChuan}
                onChange={(e) => crud.setForm({ ...crud.form, tieuChuan: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <Field label="Khách hàng gửi mẫu">
            <select
              value={crud.form.khachHangId}
              onChange={(e) => crud.setForm({ ...crud.form, khachHangId: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Chọn khách hàng --</option>
              {khachHangOptions.map((k) => (
                <option key={k.id} value={k.id}>
                  {k.ten}
                </option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày nhận">
              <input
                type="date"
                value={crud.form.ngayNhan}
                onChange={(e) => crud.setForm({ ...crud.form, ngayNhan: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Hạn trả kết quả">
              <input
                type="date"
                value={crud.form.hanTra}
                onChange={(e) => crud.setForm({ ...crud.form, hanTra: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={crud.closeModal} className="btn-ghost">
              Hủy
            </button>
            <button type="submit" disabled={crud.saving} className="btn-primary">
              {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
              {crud.editing ? 'Cập nhật' : 'Tạo mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
