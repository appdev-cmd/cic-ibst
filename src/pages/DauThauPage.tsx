import { useState } from 'react';
import { Gavel, Plus, Search, Filter, Building2, Calendar, FileText, CheckCircle2, XCircle, Clock, Users2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { MasterTable } from '../components/MasterTable';
import { Field, inputCls } from '../components/Modal';
import { DangKyDauMoiPanel } from '../components/DangKyDauMoiPanel';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCrudForm } from '../hooks/useCrudForm';
import { useTableControls } from '../hooks/useTableControls';
import {
  fetchDauThau,
  createDauThau,
  updateDauThau,
  deleteDauThau,
  type DauThauInput,
} from '../services/workflow';
import { fetchKhachHangOptions, fetchDonViOptions, fetchNhanSuOptions } from '../services/queries';
import type { DauThau, TrangThaiDauThau, HinhThucDauThau } from '../types';
import { formatTrieu, formatNgay } from '../lib/utils';

type Tab = 'goi-thau' | 'dang-ky-dau-moi';

const EMPTY_FORM: DauThauInput = {
  tenGoiThau: '',
  chuDauTuId: '',
  donViThucHienId: '',
  hinhThuc: 'dau-thau-rong-rai',
  giaDuThau: '',
  giaTrungThau: '',
  ngayMoThau: '',
  ngayDongThau: '',
  trangThai: 'chuan-bi',
  hopDongId: '',
  nguoiPhuTrachId: '',
  ghiChu: '',
  chuTriHsdtId: '',
  hsNangLucChung: false,
  bcTaiChinh: false,
  ccnnDuThau: false,
};

const HINH_THUC_LABEL: Record<HinhThucDauThau, string> = {
  'dau-thau-rong-rai': 'Đấu thầu rộng rãi',
  'dau-thau-han-che': 'Đấu thầu hạn chế',
  'chi-dinh-thau': 'Chỉ định thầu',
  'chao-gia': 'Chào giá cạnh tranh',
  'mua-sam-truc-tiep': 'Mua sắm trực tiếp',
  'tu-thuc-hien': 'Tự thực hiện',
  'khac': 'Khác',
};

const TRANG_THAI_LABEL: Record<TrangThaiDauThau, string> = {
  'chuan-bi': 'Chuẩn bị HS',
  'da-nop': 'Đã nộp HS',
  'trung-thau': 'Trúng thầu',
  'truot': 'Trượt thầu',
  'huy': 'Hủy',
};

const TRANG_THAI_TONE: Record<TrangThaiDauThau, string> = {
  'chuan-bi': 'bg-gray-100 text-gray-800',
  'da-nop': 'bg-blue-100 text-blue-800',
  'trung-thau': 'bg-emerald-100 text-emerald-800',
  'truot': 'bg-red-100 text-red-800',
  'huy': 'bg-orange-100 text-orange-800',
};

export function DauThauPage() {
  const [tab, setTab] = useState<Tab>('goi-thau');
  const { data: list, loading, error, refetch } = useAsyncData(fetchDauThau, []);
  const { data: khachHangOptions } = useAsyncData(fetchKhachHangOptions, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);

  const crud = useCrudForm<DauThau, DauThauInput>({
    empty: EMPTY_FORM,
    toForm: (item) => ({
      tenGoiThau: item.tenGoiThau,
      chuDauTuId: item.chuDauTuId || '',
      donViThucHienId: item.donViThucHienId || '',
      hinhThuc: item.hinhThuc,
      giaDuThau: item.giaDuThau != null ? String(item.giaDuThau) : '',
      giaTrungThau: item.giaTrungThau != null ? String(item.giaTrungThau) : '',
      ngayMoThau: item.ngayMoThau || '',
      ngayDongThau: item.ngayDongThau || '',
      trangThai: item.trangThai,
      hopDongId: item.hopDongId || '',
      nguoiPhuTrachId: item.nguoiPhuTrachId || '',
      ghiChu: item.ghiChu || '',
      chuTriHsdtId: item.chuTriHsdtId || '',
      hsNangLucChung: item.hsNangLucChung,
      bcTaiChinh: item.bcTaiChinh,
      ccnnDuThau: item.ccnnDuThau,
    }),
    getId: (item) => item.id,
    create: createDauThau,
    update: updateDauThau,
    remove: deleteDauThau,
    deleteMessage: (item) => `Bạn có chắc muốn xóa gói thầu ${item.tenGoiThau}?`,
    onDone: () => refetch(),
  });

  const table = useTableControls(list, (item) => `${item.tenGoiThau} ${item.chuDauTu} ${item.donViThucHien}`, 10);

  const tongGiaDuThau = list.reduce((acc, i) => acc + (i.giaDuThau || 0), 0);
  const tongTrungThau = list.filter((i) => i.trangThai === 'trung-thau').reduce((acc, i) => acc + (i.giaTrungThau || i.giaDuThau || 0), 0);
  const tyLeTrungThau = list.length > 0 ? Math.round((list.filter((i) => i.trangThai === 'trung-thau').length / list.length) * 100) : 0;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Quản lý Đấu thầu & Chào giá (Điều 4, 5.1 QC 2815)"
        subtitle="Đăng ký đầu mối thị trường, theo dõi gói thầu, hồ sơ dự thầu và kết quả lựa chọn nhà thầu của Viện"
        actions={
          tab === 'goi-thau' && (
            <button onClick={crud.openCreate} className="btn-primary flex items-center gap-1.5 text-xs">
              <Plus size={14} /> Thêm gói thầu mới
            </button>
          )
        }
      />

      {/* Tabs Switcher */}
      <div className="flex gap-1 border-b border-border">
        <button
          onClick={() => setTab('goi-thau')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
            tab === 'goi-thau' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <Gavel size={13} /> Gói thầu & Kết quả
        </button>
        <button
          onClick={() => setTab('dang-ky-dau-moi')}
          className={`flex items-center gap-1.5 border-b-2 px-3 py-2 text-xs font-bold transition-colors ${
            tab === 'dang-ky-dau-moi' ? 'border-primary text-primary' : 'border-transparent text-ink-muted hover:text-ink'
          }`}
        >
          <Users2 size={13} /> Đăng ký đầu mối (Đ.5.1c)
        </button>
      </div>

      {tab === 'dang-ky-dau-moi' && <DangKyDauMoiPanel donViOptions={donViOptions} nhanSuOptions={nhanSuOptions} />}

      {tab === 'goi-thau' && (
      <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Lỗi tải dữ liệu: {error}
        </div>
      )}
      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <KpiCard label="Tổng số gói thầu" value={String(list.length)} icon={Gavel} tone="primary" />
        <KpiCard label="Tổng giá trị dự thầu" value={formatTrieu(tongGiaDuThau)} icon={Building2} tone="success" />
        <KpiCard label="Giá trị trúng thầu" value={formatTrieu(tongTrungThau)} icon={CheckCircle2} tone="warning" />
        <KpiCard label="Tỷ lệ trúng thầu" value={`${tyLeTrungThau}%`} icon={Clock} tone="accent" />
      </div>

      {/* Table */}
      <MasterTable
        title="Danh sách gói thầu"
        searchPlaceholder="Tìm kiếm tên gói thầu, chủ đầu tư, đơn vị thực hiện..."
        searchQuery={table.search}
        onSearchChange={table.setSearch}
        columns={[
          {
            header: 'Tên gói thầu / Chủ đầu tư',
            accessor: (item: DauThau) => (
              <div>
                <p className="font-bold text-ink">{item.tenGoiThau}</p>
                <p className="text-2xs text-ink-muted flex items-center gap-1 mt-0.5">
                  <Building2 size={11} /> {item.chuDauTu || 'Chưa chọn CĐT'}
                </p>
              </div>
            ),
          },
          {
            header: 'Hình thức',
            accessor: (item: DauThau) => (
              <span className="inline-flex rounded-md bg-subtle px-2 py-0.5 text-2xs font-semibold text-ink-secondary">
                {HINH_THUC_LABEL[item.hinhThuc] || item.hinhThuc}
              </span>
            ),
          },
          {
            header: 'Đơn vị / Phụ trách',
            accessor: (item: DauThau) => (
              <div className="text-2xs">
                <p className="font-semibold text-ink">{item.donViThucHien || '—'}</p>
                <p className="text-ink-muted">{item.nguoiPhuTrach || '—'}</p>
              </div>
            ),
          },
          {
            header: 'Chủ trì HSDT / Hồ sơ NL (Đ.5.1d)',
            accessor: (item: DauThau) => {
              const soDu = [item.hsNangLucChung, item.bcTaiChinh, item.ccnnDuThau].filter(Boolean).length;
              return (
                <div className="text-2xs">
                  <p className="font-semibold text-ink">{item.chuTriHsdt || '—'}</p>
                  <span
                    className={`inline-flex mt-0.5 rounded px-1.5 py-0.5 font-bold ${
                      soDu === 3
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                        : soDu === 0
                          ? 'bg-subtle text-ink-muted'
                          : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                    }`}
                  >
                    Hồ sơ năng lực {soDu}/3
                  </span>
                </div>
              );
            },
          },
          {
            header: 'Giá dự thầu (trđ)',
            accessor: (item: DauThau) => (
              <span className="font-bold text-ink">{item.giaDuThau ? item.giaDuThau.toLocaleString('vi-VN') : '—'}</span>
            ),
          },
          {
            header: 'Thời điểm mở thầu',
            accessor: (item: DauThau) => (item.ngayMoThau ? formatNgay(item.ngayMoThau) : '—'),
          },
          {
            header: 'Trạng thái',
            accessor: (item: DauThau) => (
              <span className={`inline-flex rounded-full px-2.5 py-0.5 text-2xs font-bold ${TRANG_THAI_TONE[item.trangThai]}`}>
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
      </>
      )}

      {/* Modal */}
      {crud.modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-surface p-6 shadow-xl space-y-4">
            <h3 className="text-base font-bold text-ink">
              {crud.editing ? 'Chỉnh sửa thông tin gói thầu' : 'Thêm gói thầu mới'}
            </h3>
            <form onSubmit={crud.submit} className="space-y-4">
              <Field label="Tên gói thầu *">
                <input
                  required
                  className={inputCls}
                  value={crud.form.tenGoiThau}
                  onChange={(e) => crud.setForm({ ...crud.form, tenGoiThau: e.target.value })}
                />
              </Field>

              <div className="grid grid-cols-2 gap-4">
                <Field label="Chủ đầu tư / Khách hàng">
                  <select
                    className={inputCls}
                    value={crud.form.chuDauTuId}
                    onChange={(e) => crud.setForm({ ...crud.form, chuDauTuId: e.target.value })}
                  >
                    <option value="">-- Chọn chủ đầu tư --</option>
                    {khachHangOptions.map((k) => (
                      <option key={k.id} value={k.id}>{k.ten}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Đơn vị thực hiện">
                  <select
                    className={inputCls}
                    value={crud.form.donViThucHienId}
                    onChange={(e) => crud.setForm({ ...crud.form, donViThucHienId: e.target.value })}
                  >
                    <option value="">-- Chọn đơn vị --</option>
                    {donViOptions.map((d) => (
                      <option key={d.id} value={d.id}>{d.ten}</option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Field label="Hình thức lựa chọn NT">
                  <select
                    className={inputCls}
                    value={crud.form.hinhThuc}
                    onChange={(e) => crud.setForm({ ...crud.form, hinhThuc: e.target.value as any })}
                  >
                    {Object.entries(HINH_THUC_LABEL).map(([k, v]) => (
                      <option key={k} value={k}>{v}</option>
                    ))}
                  </select>
                </Field>
                <Field label="Giá dự thầu (triệu đ)">
                  <input
                    type="number"
                    className={inputCls}
                    value={crud.form.giaDuThau}
                    onChange={(e) => crud.setForm({ ...crud.form, giaDuThau: e.target.value })}
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

              <div className="grid grid-cols-2 gap-4">
                <Field label="Ngày mở thầu">
                  <input
                    type="date"
                    className={inputCls}
                    value={crud.form.ngayMoThau}
                    onChange={(e) => crud.setForm({ ...crud.form, ngayMoThau: e.target.value })}
                  />
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

              <Field label="Chủ trì lập HSDT (Đ.5.1d — do GĐ Đơn vị chỉ định)">
                <select
                  className={inputCls}
                  value={crud.form.chuTriHsdtId}
                  onChange={(e) => crud.setForm({ ...crud.form, chuTriHsdtId: e.target.value })}
                >
                  <option value="">-- Chọn nhân sự --</option>
                  {nhanSuOptions.map((n) => (
                    <option key={n.id} value={n.id}>{n.ten}</option>
                  ))}
                </select>
              </Field>

              <div className="rounded-lg border border-border p-3">
                <p className="mb-2 text-2xs font-black uppercase tracking-wider text-ink-muted">
                  Checklist hồ sơ năng lực (Đ.5.1d, 9.6g)
                </p>
                <div className="space-y-2 text-xs">
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={crud.form.hsNangLucChung}
                      onChange={(e) => crud.setForm({ ...crud.form, hsNangLucChung: e.target.checked })}
                    />
                    Hồ sơ năng lực chung của Viện + chữ ký số đấu thầu (P.KHKT cung cấp)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={crud.form.bcTaiChinh}
                      onChange={(e) => crud.setForm({ ...crud.form, bcTaiChinh: e.target.checked })}
                    />
                    Báo cáo tài chính (P.TCKT cung cấp)
                  </label>
                  <label className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={crud.form.ccnnDuThau}
                      onChange={(e) => crud.setForm({ ...crud.form, ccnnDuThau: e.target.checked })}
                    />
                    Chứng chỉ năng lực/hành nghề + hồ sơ nhân sự (P.TCHC cung cấp)
                  </label>
                </div>
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
