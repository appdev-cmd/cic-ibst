import { useState } from 'react';
import { Gavel, Plus, Search, Filter, Building2, Calendar, FileText, CheckCircle2, XCircle, Clock, Users2, Eye } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { MasterTable } from '../components/MasterTable';
import { DangKyDauMoiPanel } from '../components/DangKyDauMoiPanel';
import { GoiThauChiTietPanel } from '../components/GoiThauChiTietPanel';
import { GoiThauFormPanel } from '../components/GoiThauFormPanel';
import { useSlidePanel } from '../context/SlidePanelContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCrudForm } from '../hooks/useCrudForm';
import { useTableControls } from '../hooks/useTableControls';
import {
  fetchDauThau,
  createDauThau,
  updateDauThau,
  updateTrangThaiDauThau,
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

export function DauThauPage({ showHeader = true }: { showHeader?: boolean } = {}) {
  const [tab, setTab] = useState<Tab>('goi-thau');
  const { openPanel } = useSlidePanel();
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

  const handleOpenCreateGoiThau = () => {
    openPanel({
      id: 'tao-goi-thau-moi',
      title: 'Thêm gói thầu mới',
      subtitle: 'Quy trình 1 — Điều 5.1d & 9.6g QC 2815',
      icon: <Plus size={16} />,
      content: (
        <GoiThauFormPanel
          initialForm={EMPTY_FORM}
          khachHangOptions={khachHangOptions}
          donViOptions={donViOptions}
          nhanSuOptions={nhanSuOptions}
          onSubmit={createDauThau}
          onDone={refetch}
        />
      ),
      storageKey: 'panel-tao-goi-thau-moi',
    });
  };

  const handleOpenEditGoiThau = (item: DauThau) => {
    openPanel({
      id: `sua-goi-thau-${item.id}`,
      title: 'Chỉnh sửa thông tin gói thầu',
      subtitle: item.tenGoiThau,
      icon: <Gavel size={16} />,
      content: (
        <GoiThauFormPanel
          editing
          initialForm={{
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
          }}
          khachHangOptions={khachHangOptions}
          donViOptions={donViOptions}
          nhanSuOptions={nhanSuOptions}
          onSubmit={(form) => updateDauThau(item.id, form)}
          onDone={refetch}
        />
      ),
      storageKey: 'panel-sua-goi-thau',
    });
  };

  const handleOpenChiTietGoiThau = (item: DauThau) => {
    openPanel({
      id: `goi-thau-${item.id}`,
      title: item.tenGoiThau,
      subtitle: `Gói thầu dự thầu (QC 2815 Đ.5.1d) · ${TRANG_THAI_LABEL[item.trangThai] || item.trangThai}`,
      icon: <Gavel size={16} />,
      content: <GoiThauChiTietPanel item={item} onEdit={handleOpenEditGoiThau} onDone={refetch} />,
      storageKey: 'panel-goi-thau',
    });
  };

  const table = useTableControls(list, (item) => `${item.tenGoiThau} ${item.chuDauTu} ${item.donViThucHien}`, 10);

  const tongGiaDuThau = list.reduce((acc, i) => acc + (i.giaDuThau || 0), 0);
  const tongTrungThau = list.filter((i) => i.trangThai === 'trung-thau').reduce((acc, i) => acc + (i.giaTrungThau || i.giaDuThau || 0), 0);
  const tyLeTrungThau = list.length > 0 ? Math.round((list.filter((i) => i.trangThai === 'trung-thau').length / list.length) * 100) : 0;

  return (
    <div className="space-y-6">
      {showHeader && (
        <PageHeader
          title="Quản lý Đấu thầu & Chào giá (Điều 4, 5.1 QC 2815)"
          subtitle="Đăng ký đầu mối thị trường, theo dõi gói thầu, hồ sơ dự thầu và kết quả lựa chọn nhà thầu của Viện"
          actions={
            tab === 'goi-thau' && (
              <button onClick={handleOpenCreateGoiThau} className="btn-primary flex items-center gap-1.5 text-xs">
                <Plus size={14} /> Thêm gói thầu mới
              </button>
            )
          }
        />
      )}

      {/* Tabs Switcher */}
      <div className="flex items-center justify-between border-b border-border pb-px">
        <div className="flex gap-1">
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
            <Users2 size={13} /> Đăng ký đầu mối tiếp cận
          </button>
        </div>
        {!showHeader && tab === 'goi-thau' && (
          <button onClick={handleOpenCreateGoiThau} className="btn-primary flex items-center gap-1.5 text-xs">
            <Plus size={14} /> Thêm gói thầu mới
          </button>
        )}
      </div>


      {tab === 'dang-ky-dau-moi' && (
        <DangKyDauMoiPanel
          donViOptions={donViOptions}
          nhanSuOptions={nhanSuOptions}
          khachHangOptions={khachHangOptions}
        />
      )}

      {tab === 'goi-thau' && (
      <>
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400">
          Lỗi tải dữ liệu: {error}
        </div>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard label="Tổng số gói thầu" value={String(list.length)} icon={Gavel} tone="accent" />
        <KpiCard label="Tổng giá trị dự thầu" value={`${formatTrieu(tongGiaDuThau)} đ`} icon={Building2} tone="primary" />
        <KpiCard label="Giá trị trúng thầu" value={`${formatTrieu(tongTrungThau)} đ`} icon={CheckCircle2} tone="success" />
        <KpiCard label="Tỷ lệ trúng thầu" value={`${tyLeTrungThau}%`} icon={Clock} tone="warning" />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="relative flex-1 min-w-[240px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
          <input
            type="text"
            placeholder="Tìm kiếm tên gói thầu, chủ đầu tư, đơn vị..."
            className="w-full rounded-xl border border-border bg-surface pl-9 pr-4 py-2 text-xs text-ink focus:border-primary focus:outline-none"
            value={table.search}
            onChange={(e) => table.setSearch(e.target.value)}
          />
        </div>
      </div>

      <MasterTable<DauThau>
        columns={[
          {
            header: 'Tên gói thầu / Chủ đầu tư',
            accessor: (item: DauThau) => (
              <div>
                <p className="font-bold text-ink hover:text-primary transition-colors flex items-center gap-1.5">
                  <Eye size={14} className="text-ink-muted group-hover:text-primary shrink-0" />
                  {item.tenGoiThau}
                </p>
                <p className="text-2xs text-ink-muted mt-0.5">{item.chuDauTu || 'Chưa chọn CĐT'}</p>
              </div>
            ),
          },
          {
            header: 'Đơn vị / Cán bộ phụ trách',
            accessor: (item: DauThau) => (
              <div>
                <p className="text-xs text-ink">{item.donViThucHien || '—'}</p>
                <p className="text-2xs text-ink-muted mt-0.5">
                  Phụ trách: {item.nguoiPhuTrach || '—'}
                  {item.chuTriHsdt && <span className="text-primary font-medium"> · Chủ trì HSDT: {item.chuTriHsdt}</span>}
                </p>
              </div>
            ),
          },
          {
            header: 'Checklist HSNL (Đ.5.1d, 9.6g)',
            accessor: (item: DauThau) => {
              const soDu = [item.hsNangLucChung, item.bcTaiChinh, item.ccnnDuThau].filter(Boolean).length;
              return (
                <div>
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-2xs font-bold ${soDu === 3 ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
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
            header: 'Trạng thái thầu',
            accessor: (item: DauThau) => (
              <select
                className={`rounded-full px-2.5 py-1 text-2xs font-bold border-0 cursor-pointer outline-none transition-all shadow-2xs hover:opacity-80 ${TRANG_THAI_TONE[item.trangThai]}`}
                value={item.trangThai}
                onClick={(e) => e.stopPropagation()}
                onChange={async (e) => {
                  e.stopPropagation();
                  const newStatus = e.target.value;
                  let giaTrung = item.giaTrungThau;
                  if (newStatus === 'trung-thau' && !giaTrung) {
                    const val = prompt('Nhập Giá trúng thầu chính thức (Triệu VNĐ):', String(item.giaDuThau || ''));
                    if (val) giaTrung = Number(val);
                  }
                  await updateTrangThaiDauThau(item.id, newStatus, giaTrung);
                  refetch();
                }}
              >
                {Object.entries(TRANG_THAI_LABEL).map(([val, label]) => (
                  <option key={val} value={val} className="bg-surface text-ink font-normal text-xs">
                    {label}
                  </option>
                ))}
              </select>
            ),
          },
        ]}
        data={table.pageRows}
        onView={handleOpenChiTietGoiThau}
        onEdit={handleOpenEditGoiThau}
        onDelete={crud.removeRow}
        page={table.page}
        totalPages={table.totalPages}
        onPageChange={table.setPage}
      />
      </>
      )}
    </div>
  );
}
