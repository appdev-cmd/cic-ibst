import { useEffect, useMemo, useState } from 'react';
import { Handshake, Banknote, AlertTriangle, LoaderCircle, Users2, FileText, CheckCircle2, AlertCircle, Gavel, ClipboardCheck } from 'lucide-react';
import {
  DotThanhToanPanel,
  CtvGiaoViecPanel,
  ThuongPhatPanel,
  KiemTraNoiBoPanel,
  QuyetToanGiaiDoanPanel,
  HoSoHopDongPanel,
} from '../components/DetailPanels';
import { PageHeader } from '../components/PageHeader';
import { TRANG_THAI_OPTIONS } from '../components/StatusBadge';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination, RowActions } from '../components/TableToolbar';
import { KhachHangPage } from './KhachHangPage';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import {
  fetchHopDong,
  fetchKhachHangOptions,
  fetchDonViOptions,
  fetchNhanSuOptions,
  createHopDong,
  updateHopDong,
  updateHopDongPheDuyet,
  updateQuyetToanHopDong,
  deleteHopDong,
  type HopDongInput,
  type Option,
} from '../services/queries';
import {
  fetchPhieuGiaoViec,
  upsertPhieuGiaoViec,
  type PhieuGiaoViec,
  type PhieuGiaoViecInput,
} from '../services/chitiet';
import type { HopDong, TrangThaiPheDuyet } from '../types';
import {
  BANG_1,
  DAC_THU_OPTIONS,
  timDinhMuc,
  phanBoHopDong,
  canTrinhVienTruong,
  ngayHanNopHoSo,
  soNgayConLai,
  canhBaoPhatNopChamHoSo,
  canhBaoPhatChungTuTre,
} from '../lib/qc2815';
import { formatTrieu, formatNgay, cn } from '../lib/utils';

type Tab = 'hop-dong-2815' | 'crm-khach-hang';

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
  nhomHD: '',
  chuTriId: '',
  giaDuThau: '',
  ngayNopHoSo: '',
  trangThaiPheDuyet: 'khong-ap-dung',
  ngayTrinhDuyet: '',
  ngayDuyet: '',
  hanChungTuQuyetToan: '',
  loaiDacThu: '',
  phanVienXa: false,
  giamTheoYeuCauDonVi: false,
};

const NGAY_30 = 30 * 24 * 3600 * 1000;

const PHE_DUYET_LABEL: Record<TrangThaiPheDuyet, string> = {
  'khong-ap-dung': 'Không áp dụng',
  'chua-trinh': 'Chờ trình Viện trưởng',
  'da-trinh': 'Đã trình, chờ duyệt',
  'da-duyet': 'Đã duyệt',
};

const PHE_DUYET_TONE: Record<TrangThaiPheDuyet, string> = {
  'khong-ap-dung': 'bg-muted text-ink-muted',
  'chua-trinh': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'da-trinh': 'bg-sky-100 text-sky-800 dark:bg-sky-900/40 dark:text-sky-300',
  'da-duyet': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
};

export function HopDongPage() {
  const [activeTab, setActiveTab] = useState<Tab>('hop-dong-2815');

  const { data: hopDongList, loading, error, refetch } = useAsyncData(fetchHopDong, []);
  const { data: khachHangOptions } = useAsyncData(fetchKhachHangOptions, []);
  const { data: donViOptions } = useAsyncData(fetchDonViOptions, []);
  const { data: nhanSuOptions } = useAsyncData(fetchNhanSuOptions, []);

  const [filterTrangThai, setFilterTrangThai] = useState('');
  const [filterDonVi, setFilterDonVi] = useState('');
  const [detail, setDetail] = useState<HopDong | null>(null);
  // hopDongList được refetch sau mỗi thao tác (phê duyệt, quyết toán...) — lấy bản mới nhất theo id thay vì dùng `detail` (có thể cũ).
  const liveDetail = useMemo(() => hopDongList.find((h) => h.id === detail?.id) ?? null, [hopDongList, detail]);

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
      nhomHD: hd.nhomHD ?? '',
      chuTriId: hd.chuTriId ?? '',
      giaDuThau: hd.giaDuThau != null ? String(hd.giaDuThau) : '',
      ngayNopHoSo: hd.ngayNopHoSo,
      trangThaiPheDuyet: hd.trangThaiPheDuyet,
      ngayTrinhDuyet: hd.ngayTrinhDuyet,
      ngayDuyet: hd.ngayDuyet,
      hanChungTuQuyetToan: hd.hanChungTuQuyetToan,
      loaiDacThu: hd.loaiDacThu ?? '',
      phanVienXa: hd.phanVienXa,
      giamTheoYeuCauDonVi: hd.giamTheoYeuCauDonVi,
    }),
    getId: (hd) => hd.id,
    create: createHopDong,
    update: updateHopDong,
    remove: deleteHopDong,
    deleteMessage: (hd) => `Bạn có chắc muốn xóa hợp đồng ${hd.soHD}?`,
    onDone: () => refetch(),
  });

  const filteredList = useMemo(() => {
    return hopDongList.filter((hd) => {
      if (filterTrangThai && hd.trangThai !== filterTrangThai) return false;
      if (filterDonVi && hd.donViId !== filterDonVi) return false;
      return true;
    });
  }, [hopDongList, filterTrangThai, filterDonVi]);

  const table = useTableControls(
    filteredList,
    (hd) => `${hd.soHD} ${hd.ten} ${hd.khachHang} ${hd.donViThucHien}`,
    10
  );

  const tongGiaTri = useMemo(
    () => hopDongList.reduce((acc, h) => acc + (h.giaTri || 0), 0),
    [hopDongList],
  );
  const tongDaThanhToan = useMemo(
    () => hopDongList.reduce((acc, h) => acc + (h.daThanhToan || 0), 0),
    [hopDongList],
  );
  const sapHetHanCount = useMemo(() => {
    const now = Date.now();
    return hopDongList.filter((h) => {
      if (!h.hanHoanThanh) return false;
      const t = new Date(h.hanHoanThanh).getTime();
      return t > now && t - now <= NGAY_30;
    }).length;
  }, [hopDongList]);
  const choTrinhVienTruongCount = useMemo(
    () =>
      hopDongList.filter(
        (h) => canTrinhVienTruong(h.nhomHD, h.giaDuThau ?? h.giaTri) && h.trangThaiPheDuyet !== 'da-duyet',
      ).length,
    [hopDongList],
  );

  // Modal Phiếu giao việc điện tử
  const [phieuGiaoViecOpen, setPhieuGiaoViecOpen] = useState(false);
  const [selectedHdGiaoViec, setSelectedHdGiaoViec] = useState<HopDong | null>(null);

  const openGiaoViec = (hd: HopDong) => {
    setSelectedHdGiaoViec(hd);
    setPhieuGiaoViecOpen(true);
  };

  const [pheDuyetBusyId, setPheDuyetBusyId] = useState<string | null>(null);
  const capNhatPheDuyet = async (hd: HopDong, trangThai: TrangThaiPheDuyet) => {
    setPheDuyetBusyId(hd.id);
    try {
      const today = new Date().toISOString().slice(0, 10);
      await updateHopDongPheDuyet(hd.id, {
        trangThaiPheDuyet: trangThai,
        ...(trangThai === 'da-trinh' ? { ngayTrinhDuyet: today } : {}),
        ...(trangThai === 'da-duyet' ? { ngayDuyet: today } : {}),
      });
      await refetch();
    } finally {
      setPheDuyetBusyId(null);
    }
  };

  const [quyetToanBusy, setQuyetToanBusy] = useState(false);
  const toggleQuyetToan = async (hd: HopDong) => {
    setQuyetToanBusy(true);
    try {
      await updateQuyetToanHopDong(hd.id, hd.trangThaiQuyetToan !== 'da-quyet-toan');
      await refetch();
    } finally {
      setQuyetToanBusy(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="[Phân hệ 2] Quản lý Hợp đồng (Quy chế 2815) & Khách hàng (CRM)"
        subtitle="Số hóa Phiếu giao việc điện tử, luồng duyệt hạn mức Viện trưởng & Thuật toán tự động phân bổ tài chính 4 Nhóm hợp đồng (Bảng 1 QC 2815)"
      />

      {/* Tabs Switcher */}
      <div className="mb-6 flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        <button
          onClick={() => setActiveTab('hop-dong-2815')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'hop-dong-2815'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Handshake size={16} /> Quản lý Hợp đồng & QC 2815
        </button>
        <button
          onClick={() => setActiveTab('crm-khach-hang')}
          className={cn(
            'flex items-center gap-2 rounded-lg px-4 py-2.5 text-xs font-bold transition-all',
            activeTab === 'crm-khach-hang'
              ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300'
              : 'text-ink-muted hover:text-ink'
          )}
        >
          <Users2 size={16} /> Khách hàng & CRM Tiềm năng
        </button>
      </div>

      {activeTab === 'crm-khach-hang' && <KhachHangPage />}

      {activeTab === 'hop-dong-2815' && (
        <>
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard
              label="TỔNG GIÁ TRỊ HĐ"
              value={formatTrieu(tongGiaTri)}
              icon={Handshake}
              tone="primary"
            />
            <KpiCard
              label="ĐÃ THANH TOÁN"
              value={formatTrieu(tongDaThanhToan)}
              icon={Banknote}
              tone="success"
            />
            <KpiCard
              label="SẮP HẾT HẠN (30 NGÀY)"
              value={String(sapHetHanCount)}
              icon={AlertTriangle}
              tone="warning"
            />
            <KpiCard
              label="CHỜ TRÌNH/DUYỆT VIỆN TRƯỞNG"
              value={String(choTrinhVienTruongCount)}
              icon={Gavel}
              tone="accent"
            />
          </div>

          {/* Quy chế 2815 Banner Alert */}
          <div className="mb-4 rounded-xl border border-primary/20 bg-primary-subtle/30 p-4 text-xs space-y-2 text-ink">
            <div className="flex items-center justify-between font-bold text-primary">
              <span className="flex items-center gap-2 text-sm">
                <CheckCircle2 size={18} /> Khung Quy chế 2815/QĐ-VKH: Hạn mức Trình Viện trưởng Phê duyệt (Điều 6.1)
              </span>
              <span className="rounded-full bg-primary px-3 py-0.5 text-white text-2xs font-bold">
                Tự động kích hoạt luồng
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 font-semibold text-ink-secondary">
              <div className="bg-surface p-2 rounded border border-border">🔍 Kiểm định, đánh giá hiện trạng (N1a) &ge; <strong>2,0 Tỷ VNĐ</strong></div>
              <div className="bg-surface p-2 rounded border border-border">📐 Tất cả hợp đồng Tư vấn (Nhóm 2) &ge; <strong>5,0 Tỷ VNĐ</strong></div>
              <div className="bg-surface p-2 rounded border border-border">🏗️ Hợp đồng Thi công (Nhóm 3) &ge; <strong>10,0 Tỷ VNĐ</strong></div>
            </div>
          </div>

          <DataState loading={loading} error={error} empty={hopDongList.length === 0} />

          <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
            <TableToolbar
              search={table.search}
              onSearch={table.setSearch}
              placeholder="Tìm theo số HĐ, tên, khách hàng..."
              total={table.total}
            >
              <FilterSelect
                value={filterTrangThai}
                onChange={setFilterTrangThai}
                allLabel="-- Trạng thái --"
                options={TRANG_THAI_OPTIONS}
              />
              <FilterSelect
                value={filterDonVi}
                onChange={setFilterDonVi}
                allLabel="-- Đơn vị --"
                options={donViOptions.map((d) => ({ value: d.id, label: d.ten }))}
              />
            </TableToolbar>
            <button onClick={crud.openCreate} className="btn-primary mb-3">
              + Thêm hợp đồng
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
            <div className="card overflow-x-auto lg:col-span-2">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr>
                    <th className="th-cell">Số HĐ / Tên</th>
                    <th className="th-cell">Khách hàng</th>
                    <th className="th-cell">Giá trị (VNĐ)</th>
                    <th className="th-cell">Nhóm HĐ / Phê duyệt</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {table.pageRows.map((hdItem) => {
                    const hd = hdItem as HopDong;
                    const active = detail?.id === hd.id;
                    const dm = timDinhMuc(hd.nhomHD);
                    const isOverThreshold = canTrinhVienTruong(hd.nhomHD, hd.giaDuThau ?? hd.giaTri);
                    // Hợp đồng vừa vượt ngưỡng nhưng chưa từng được triage phê duyệt (cột DB vẫn ở giá trị mặc định) — hiển thị "Chờ trình" thay vì "Không áp dụng".
                    const trangThaiHienThi: TrangThaiPheDuyet =
                      isOverThreshold && hd.trangThaiPheDuyet === 'khong-ap-dung' ? 'chua-trinh' : hd.trangThaiPheDuyet;
                    return (
                      <tr
                        key={hd.id}
                        onClick={() => setDetail(hd)}
                        className={cn(
                          'tr-hover cursor-pointer',
                          active && 'bg-primary-subtle/50 dark:bg-primary-900/20',
                        )}
                      >
                        <td className="td-cell">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-ink">{hd.soHD}</span>
                            {isOverThreshold && (
                              <span className="rounded bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300 px-1.5 py-0.5 text-[9px] font-bold" title="Hợp đồng lớn cần Trình Viện trưởng">
                                QC 2815 Trình VT
                              </span>
                            )}
                          </div>
                          <div className="line-clamp-1 text-2xs text-ink-muted">{hd.ten}</div>
                        </td>
                        <td className="td-cell text-ink-secondary">
                          {hd.khachHang || '—'}
                        </td>
                        <td className="td-cell font-bold text-ink">
                          {formatTrieu(hd.giaTri)}
                        </td>
                        <td className="td-cell">
                          <div className="flex flex-wrap items-center gap-1.5">
                            {dm && (
                              <span className="rounded bg-muted px-1.5 py-0.5 text-2xs font-bold text-ink-secondary" title={dm.ten}>
                                {dm.id}
                              </span>
                            )}
                            {isOverThreshold && (
                              <span
                                className={cn('rounded px-1.5 py-0.5 text-2xs font-bold', PHE_DUYET_TONE[trangThaiHienThi])}
                                title="Vượt ngưỡng Điều 6.1 — cần trình Viện trưởng phê duyệt"
                              >
                                {PHE_DUYET_LABEL[trangThaiHienThi]}
                              </span>
                            )}
                          </div>
                          {isOverThreshold && trangThaiHienThi !== 'da-duyet' && (
                            <div className="mt-1 flex gap-1">
                              {trangThaiHienThi !== 'da-trinh' && (
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    void capNhatPheDuyet(hd, 'da-trinh');
                                  }}
                                  disabled={pheDuyetBusyId === hd.id}
                                  className="rounded border border-border px-1.5 py-0.5 text-2xs font-semibold text-ink-secondary hover:bg-muted disabled:opacity-50"
                                >
                                  Đánh dấu đã trình
                                </button>
                              )}
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  void capNhatPheDuyet(hd, 'da-duyet');
                                }}
                                disabled={pheDuyetBusyId === hd.id}
                                className="rounded border border-emerald-500/40 px-1.5 py-0.5 text-2xs font-semibold text-emerald-700 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 disabled:opacity-50"
                              >
                                Xác nhận đã duyệt
                              </button>
                            </div>
                          )}
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              openGiaoViec(hd);
                            }}
                            className="btn-secondary mt-1 py-1 text-2xs font-bold gap-1"
                          >
                            <FileText size={12} /> Phiếu giao việc
                          </button>
                        </td>
                        <td className="td-cell text-right">
                          <RowActions
                            onEdit={() => crud.openEdit(hd)}
                            onDelete={() => crud.removeRow(hd)}
                          />
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <Pagination
                page={table.page}
                totalPages={table.totalPages}
                onChange={table.setPage}
              />
            </div>

            <div className="lg:col-span-1 space-y-4">
              {liveDetail && (
                <div className="rounded-lg border border-border p-3 text-xs space-y-2">
                  <h4 className="text-2xs font-black uppercase tracking-wider text-ink-muted">Quyết toán / Thanh lý (Điều 11)</h4>
                  {liveDetail.trangThaiQuyetToan === 'da-quyet-toan' ? (
                    <p className="flex items-center gap-1.5 text-success font-semibold">
                      <CheckCircle2 size={14} />
                      {liveDetail.ngayQuyetToan ? <>Đã quyết toán ngày {formatNgay(liveDetail.ngayQuyetToan)}</> : 'Đã quyết toán'}
                    </p>
                  ) : liveDetail.daThanhToan >= liveDetail.giaTri && liveDetail.giaTri > 0 ? (
                    <p className="text-ink-secondary">Đã thu đủ tiền — có thể quyết toán, thanh lý hợp đồng.</p>
                  ) : (
                    <p className="text-ink-muted">Chưa thu đủ tiền ({formatTrieu(liveDetail.daThanhToan)}/{formatTrieu(liveDetail.giaTri)}).</p>
                  )}
                  <button
                    onClick={() => void toggleQuyetToan(liveDetail)}
                    disabled={quyetToanBusy}
                    className="btn-secondary w-full justify-center py-1.5 text-2xs font-bold gap-1 disabled:opacity-50"
                  >
                    <ClipboardCheck size={12} />
                    {liveDetail.trangThaiQuyetToan === 'da-quyet-toan' ? 'Bỏ đánh dấu đã quyết toán' : 'Đánh dấu đã quyết toán'}
                  </button>
                </div>
              )}
              {liveDetail &&
                (() => {
                  const canhBao = canhBaoPhatNopChamHoSo(liveDetail.nhomHD, liveDetail.ngayKy, liveDetail.ngayNopHoSo);
                  if (!canhBao) return null;
                  return (
                    <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-xs space-y-1 text-danger">
                      <p className="flex items-center gap-1.5 font-bold"><AlertCircle size={14} /> Cảnh báo phạt (Điều 14.2)</p>
                      <p>
                        Đã quá hạn <strong>{canhBao.quaHanNgay} ngày</strong> chưa nộp hồ sơ gốc về Viện — mức phạt gợi ý{' '}
                        <strong>{canhBao.mucPhatPhanTram}%</strong> giá trị HĐ trước thuế. Ghi nhận quyết định thực tế ở bảng "Thưởng / Phạt" bên dưới sau khi có văn bản nhắc nhở.
                      </p>
                    </div>
                  );
                })()}
              {liveDetail &&
                (() => {
                  const canhBao = canhBaoPhatChungTuTre(
                    liveDetail.nhomHD,
                    liveDetail.hanChungTuQuyetToan,
                    liveDetail.trangThaiQuyetToan === 'da-quyet-toan',
                  );
                  if (!canhBao) return null;
                  return (
                    <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3 text-xs space-y-1 text-danger">
                      <p className="flex items-center gap-1.5 font-bold"><AlertCircle size={14} /> Cảnh báo phạt (Điều 14.2, dòng 2)</p>
                      <p>
                        Đã quá hạn <strong>{canhBao.quaHanNgay} ngày</strong> nộp chứng từ thanh quyết toán theo yêu cầu TCKT — mức phạt gợi ý{' '}
                        <strong>{canhBao.mucPhatPhanTram}%</strong> trên phần giá trị vi phạm.
                      </p>
                    </div>
                  );
                })()}
              <DotThanhToanPanel key={`dtt-${liveDetail?.id ?? 'none'}`} hopDongId={liveDetail?.id ?? ''} giaTri={liveDetail?.giaTri ?? 0} onChanged={refetch} />
              <QuyetToanGiaiDoanPanel key={`qtgd-${liveDetail?.id ?? 'none'}`} hopDongId={liveDetail?.id ?? ''} onChanged={refetch} />
              <ThuongPhatPanel key={`tp-${liveDetail?.id ?? 'none'}`} hopDongId={liveDetail?.id ?? ''} nhomHD={liveDetail?.nhomHD ?? null} nhanSuOptions={nhanSuOptions} onChanged={refetch} />
              <KiemTraNoiBoPanel key={`kt-${liveDetail?.id ?? 'none'}`} hopDongId={liveDetail?.id ?? ''} nhanSuOptions={nhanSuOptions} onChanged={refetch} />
              <HoSoHopDongPanel key={`hs-${liveDetail?.id ?? 'none'}`} hopDongId={liveDetail?.id ?? ''} onChanged={refetch} />
            </div>
          </div>
        </>
      )}

      {/* Modal Phiếu Giao Việc Điện Tử theo Quy chế 2815 */}
      <Modal
        open={phieuGiaoViecOpen}
        onClose={() => setPhieuGiaoViecOpen(false)}
        title={`Phiếu giao việc điện tử (Quy chế 2815) - ${selectedHdGiaoViec?.soHD || ''}`}
      >
        <div className="space-y-4 text-xs">
          <div className="rounded-lg bg-subtle p-3 space-y-2 border border-border">
            <p className="font-bold text-ink text-sm">{selectedHdGiaoViec?.ten}</p>
            <p className="text-ink-muted">Khách hàng: <strong>{selectedHdGiaoViec?.khachHang}</strong></p>
            <p className="text-ink-muted">Giá trị hợp đồng: <strong className="text-primary">{formatTrieu(selectedHdGiaoViec?.giaTri ?? 0)}</strong></p>
            <p className="text-ink-muted">Chủ trì hợp đồng: <strong>{selectedHdGiaoViec?.chuTri || '— Chưa phân công —'}</strong></p>
          </div>

          {(() => {
            const han = selectedHdGiaoViec ? ngayHanNopHoSo(selectedHdGiaoViec.ngayKy) : null;
            if (selectedHdGiaoViec?.ngayNopHoSo) {
              return (
                <div className="rounded-lg border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-900/20 p-3 flex items-center gap-2 text-emerald-800 dark:text-emerald-200">
                  <CheckCircle2 className="h-5 w-5 shrink-0" />
                  <span>Đã nộp hồ sơ gốc về Viện ngày <strong>{formatNgay(selectedHdGiaoViec.ngayNopHoSo)}</strong>.</span>
                </div>
              );
            }
            if (!han) return null;
            const conLai = soNgayConLai(han);
            return (
              <div className="rounded-lg border border-amber-500/30 bg-amber-50/50 dark:bg-amber-900/20 p-3 flex items-center gap-2 text-amber-800 dark:text-amber-200">
                <AlertCircle className="h-5 w-5 shrink-0 text-amber-600" />
                <span>
                  <strong>Điều 6.3 / Điều 8.2 QC 2815:</strong>{' '}
                  {conLai >= 0 ? (
                    <>Còn <strong>{conLai} ngày</strong> để nộp bản Hợp đồng gốc về Viện</>
                  ) : (
                    <>Đã <strong>quá hạn {Math.abs(conLai)} ngày</strong> nộp bản Hợp đồng gốc về Viện</>
                  )}
                  {' '}(hạn {formatNgay(han.toISOString().slice(0, 10))}, kể từ ngày ký {formatNgay(selectedHdGiaoViec?.ngayKy || '')}).
                </span>
              </div>
            );
          })()}

          {(() => {
            if (!selectedHdGiaoViec) return null;
            const canhBao = canhBaoPhatChungTuTre(
              selectedHdGiaoViec.nhomHD,
              selectedHdGiaoViec.hanChungTuQuyetToan,
              selectedHdGiaoViec.trangThaiQuyetToan === 'da-quyet-toan',
            );
            if (!canhBao) return null;
            return (
              <div className="rounded-lg border border-danger/30 bg-danger-subtle p-3 flex items-center gap-2 text-danger">
                <AlertCircle className="h-5 w-5 shrink-0" />
                <span>
                  <strong>Điều 14.2 (dòng 2) QC 2815:</strong> Đã quá hạn <strong>{canhBao.quaHanNgay} ngày</strong> nộp chứng từ thanh quyết toán theo yêu cầu TCKT — mức phạt gợi ý <strong>{canhBao.mucPhatPhanTram}%</strong> trên phần giá trị vi phạm.
                </span>
              </div>
            );
          })()}

          <div className="space-y-3">
            <h4 className="font-bold text-ink">Phân bổ theo Bảng 1 Quy chế 2815 ({selectedHdGiaoViec?.nhomHD ?? '— chưa chọn nhóm —'}):</h4>
            {(() => {
              if (!selectedHdGiaoViec?.nhomHD) {
                return (
                  <p className="rounded bg-muted/40 p-2 text-ink-muted">
                    Chưa chọn nhóm hợp đồng QC 2815 — vào "Sửa hợp đồng" để chọn nhóm theo Bảng 1.
                  </p>
                );
              }
              const dmGiaoViec = timDinhMuc(selectedHdGiaoViec.nhomHD);
              const pb = phanBoHopDong(selectedHdGiaoViec.nhomHD, selectedHdGiaoViec.giaTri || 0, {
                loaiDacThu: selectedHdGiaoViec.loaiDacThu,
                phanVienXa: selectedHdGiaoViec.phanVienXa,
                giamTheoYeuCauDonVi: selectedHdGiaoViec.giamTheoYeuCauDonVi,
              });
              if (!pb) {
                return (
                  <p className="rounded bg-muted/40 p-2 text-ink-muted">
                    {dmGiaoViec?.ten}: thanh toán theo nguyên tắc <strong>thực thanh, thực chi</strong> phù hợp dự toán được duyệt (Điều 12.2) — không áp dụng bảng phân bổ tỷ lệ cố định.
                  </p>
                );
              }
              return (
                <div className="space-y-2">
                  {pb.ghiChuDacThu.length > 0 && (
                    <div className="rounded bg-sky-50 dark:bg-sky-900/20 p-2 text-2xs text-sky-800 dark:text-sky-300 space-y-0.5">
                      {pb.ghiChuDacThu.map((g, i) => <p key={i}>⚑ {g}</p>)}
                    </div>
                  )}
                  <div className="flex justify-between p-2 rounded bg-muted/40">
                    <span>Thuế GTGT ({dmGiaoViec?.thueGtgt ?? '—'}%):</span>
                    <span className="font-bold text-ink">{formatTrieu(pb.thueGtgt)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/40">
                    <span>CPQL Viện, Lợi nhuận, chi khác:</span>
                    <span className="font-bold text-primary">{formatTrieu(pb.cpqlLnChiKhac)}</span>
                  </div>
                  <div className="flex justify-between p-2 rounded bg-muted/40">
                    <span>Khấu hao TSCĐ Viện:</span>
                    <span className="font-bold text-ink">{formatTrieu(pb.khtscd)}</span>
                  </div>
                  {pb.hoTroDiLai > 0 && (
                    <div className="flex justify-between p-2 rounded bg-muted/40">
                      <span>Hỗ trợ đi lại (Phân viện/TT ở xa):</span>
                      <span className="font-bold text-ink">{formatTrieu(pb.hoTroDiLai)}</span>
                    </div>
                  )}
                  <div className="flex justify-between p-2 rounded bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 font-bold">
                    <span>Kinh phí giao Đơn vị chủ trì & phối hợp:</span>
                    <span>{formatTrieu(pb.tongGiaoDonVi)}</span>
                  </div>
                  {pb.chuTri != null && pb.donVi != null ? (
                    <>
                      <div className="flex justify-between pl-4 text-2xs text-ink-muted">
                        <span>— Trong đó Chủ trì:</span>
                        <span>{formatTrieu(pb.chuTri)}</span>
                      </div>
                      <div className="flex justify-between pl-4 text-2xs text-ink-muted">
                        <span>— Trong đó Đơn vị phối hợp:</span>
                        <span>{formatTrieu(pb.donVi)}</span>
                      </div>
                    </>
                  ) : (
                    <p className="pl-4 text-2xs italic text-ink-muted">
                      Không tách chủ trì/đơn vị — tự thoả thuận nội bộ trong phần kinh phí giao trên.
                    </p>
                  )}
                </div>
              );
            })()}
          </div>

          <div className="border-t border-border-subtle pt-4">
            <h4 className="mb-3 font-bold text-ink">Lưu Phiếu giao việc chính thức (Điều 7):</h4>
            {selectedHdGiaoViec && (
              <PhieuGiaoViecForm
                key={selectedHdGiaoViec.id}
                hd={selectedHdGiaoViec}
                nhanSuOptions={nhanSuOptions}
                onClose={() => setPhieuGiaoViecOpen(false)}
              />
            )}
          </div>
        </div>
      </Modal>

      {/* Modal Thêm/Sửa Hợp đồng */}
      <Modal
        open={crud.modalOpen}
        onClose={crud.closeModal}
        title={crud.editing ? 'Chỉnh sửa hợp đồng' : 'Thêm hợp đồng mới'}
      >
        <form onSubmit={crud.submit} className="space-y-4">
          {crud.actionError && (
            <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">
              {crud.actionError}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Số hợp đồng" required>
              <input
                type="text"
                required
                value={crud.form.soHD}
                onChange={(e) => crud.setForm({ ...crud.form, soHD: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Nhóm hợp đồng (Bảng 1 QC 2815)">
              <select
                value={crud.form.nhomHD}
                onChange={(e) => crud.setForm({ ...crud.form, nhomHD: e.target.value })}
                className={inputCls}
              >
                <option value="">-- Chọn nhóm --</option>
                {([1, 2, 3, 4] as const).map((nhom) => (
                  <optgroup key={nhom} label={`Nhóm ${nhom}`}>
                    {BANG_1.filter((d) => d.nhom === nhom).map((d) => (
                      <option key={d.id} value={d.id}>{d.ten}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </Field>
          </div>

          <Field label="Tên hợp đồng" required>
            <input
              type="text"
              required
              value={crud.form.ten}
              onChange={(e) => crud.setForm({ ...crud.form, ten: e.target.value })}
              className={inputCls}
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Khách hàng">
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

            <Field label="Đơn vị thực hiện">
              <select
                value={crud.form.donViId}
                onChange={(e) => crud.setForm({ ...crud.form, donViId: e.target.value })}
                className={inputCls}
              >
                <option value="">-- Chọn đơn vị --</option>
                {donViOptions.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.ten}
                  </option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Giá trị HĐ (triệu đồng)">
              <input
                type="number"
                value={crud.form.giaTri}
                onChange={(e) => crud.setForm({ ...crud.form, giaTri: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Đã thanh toán (triệu đồng)">
              <input
                type="number"
                value={crud.form.daThanhToan}
                onChange={(e) => crud.setForm({ ...crud.form, daThanhToan: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Chủ trì hợp đồng">
              <select
                value={crud.form.chuTriId}
                onChange={(e) => crud.setForm({ ...crud.form, chuTriId: e.target.value })}
                className={inputCls}
              >
                <option value="">-- Chưa phân công --</option>
                {nhanSuOptions.map((n) => (
                  <option key={n.id} value={n.id}>{n.ten}</option>
                ))}
              </select>
            </Field>

            <Field label="Giá dự thầu (triệu đồng, nếu khác giá trị HĐ)">
              <input
                type="number"
                value={crud.form.giaDuThau}
                onChange={(e) => crud.setForm({ ...crud.form, giaDuThau: e.target.value })}
                className={inputCls}
                placeholder="Mặc định lấy Giá trị HĐ"
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày ký">
              <input
                type="date"
                value={crud.form.ngayKy}
                onChange={(e) => crud.setForm({ ...crud.form, ngayKy: e.target.value })}
                className={inputCls}
              />
            </Field>

            <Field label="Hạn hoàn thành">
              <input
                type="date"
                value={crud.form.hanHoanThanh}
                onChange={(e) => crud.setForm({ ...crud.form, hanHoanThanh: e.target.value })}
                className={inputCls}
              />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Ngày nộp hồ sơ gốc về Viện">
              <input
                type="date"
                value={crud.form.ngayNopHoSo}
                onChange={(e) => crud.setForm({ ...crud.form, ngayNopHoSo: e.target.value })}
                className={inputCls}
              />
            </Field>
            <div className="flex items-end pb-2 text-2xs text-ink-muted">
              {crud.form.ngayKy && (() => {
                const han = ngayHanNopHoSo(crud.form.ngayKy);
                return han ? <>Hạn nộp (Điều 6.3): <strong className="ml-1 text-ink">{formatNgay(han.toISOString().slice(0, 10))}</strong></> : null;
              })()}
            </div>
          </div>

          <Field label="Hạn nộp chứng từ quyết toán (TCKT yêu cầu, nếu có)">
            <input
              type="date"
              value={crud.form.hanChungTuQuyetToan}
              onChange={(e) => crud.setForm({ ...crud.form, hanChungTuQuyetToan: e.target.value })}
              className={inputCls}
            />
          </Field>

          <Field label="Trường hợp đặc thù (Ghi chú Bảng 1 QC 2815)">
            <select
              value={crud.form.loaiDacThu}
              onChange={(e) => crud.setForm({ ...crud.form, loaiDacThu: e.target.value })}
              className={inputCls}
            >
              <option value="">-- Không có --</option>
              {DAC_THU_OPTIONS.filter((d) => !crud.form.nhomHD || d.apDungNhom.includes(crud.form.nhomHD as any)).map((d) => (
                <option key={d.id} value={d.id} title={d.ghiChu}>{d.ten}</option>
              ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
              <input
                type="checkbox"
                checked={crud.form.phanVienXa}
                onChange={(e) => crud.setForm({ ...crud.form, phanVienXa: e.target.checked })}
              />
              Phân viện/TT ở xa (+ hỗ trợ đi lại)
            </label>
            <label className="flex items-center gap-2 text-xs font-medium text-ink-secondary">
              <input
                type="checkbox"
                checked={crud.form.giamTheoYeuCauDonVi}
                onChange={(e) => crud.setForm({ ...crud.form, giamTheoYeuCauDonVi: e.target.checked })}
              />
              Đơn vị tự yêu cầu Viện ký (giảm tỷ lệ giao khoán)
            </label>
          </div>

          <Field label="Trạng thái">
            <select
              value={crud.form.trangThai}
              onChange={(e) => crud.setForm({ ...crud.form, trangThai: e.target.value as any })}
              className={inputCls}
            >
              {TRANG_THAI_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={crud.closeModal} className="btn-ghost">
              Hủy
            </button>
            <button type="submit" disabled={crud.saving} className="btn-primary">
              {crud.saving && <LoaderCircle size={15} className="animate-spin" />}
              {crud.editing ? 'Cập nhật' : 'Thêm mới'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

const EMPTY_GV_FORM: PhieuGiaoViecInput = { chuTriKyThuatId: '', kinhPhiGiao: '', noiDung: '', ngayGiao: '' };

function PhieuGiaoViecForm({
  hd,
  nhanSuOptions,
  onClose,
}: {
  hd: HopDong;
  nhanSuOptions: Option[];
  onClose: () => void;
}) {
  const { data: phieu, refetch } = useAsyncData<PhieuGiaoViec | null>(() => fetchPhieuGiaoViec(hd.id), null);
  const pb = phanBoHopDong(hd.nhomHD, hd.giaTri || 0);
  const [form, setForm] = useState<PhieuGiaoViecInput>(EMPTY_GV_FORM);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (loaded) return;
    if (phieu) {
      setForm({
        chuTriKyThuatId: phieu.chuTriKyThuatId ?? '',
        kinhPhiGiao: String(phieu.kinhPhiGiao),
        noiDung: phieu.noiDung,
        ngayGiao: phieu.ngayGiao,
      });
      setLoaded(true);
    } else if (pb) {
      setForm((f) => ({ ...f, kinhPhiGiao: String(Math.round(pb.tongGiaoDonVi)) }));
    }
  }, [phieu, loaded, pb]);

  const save = async () => {
    setSaving(true);
    setErr(null);
    try {
      await upsertPhieuGiaoViec(hd.id, form);
      await refetch();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Chủ trì kỹ thuật">
          <select
            value={form.chuTriKyThuatId}
            onChange={(e) => setForm({ ...form, chuTriKyThuatId: e.target.value })}
            className={inputCls}
          >
            <option value="">-- Chưa phân công --</option>
            {nhanSuOptions.map((n) => (
              <option key={n.id} value={n.id}>{n.ten}</option>
            ))}
          </select>
        </Field>
        <Field label="Kinh phí giao (triệu đồng)">
          <input
            type="number"
            value={form.kinhPhiGiao}
            onChange={(e) => setForm({ ...form, kinhPhiGiao: e.target.value })}
            className={inputCls}
          />
        </Field>
      </div>

      <Field label="Ngày giao">
        <input
          type="date"
          value={form.ngayGiao}
          onChange={(e) => setForm({ ...form, ngayGiao: e.target.value })}
          className={inputCls}
        />
      </Field>

      <Field label="Nội dung công việc giao">
        <textarea
          value={form.noiDung}
          onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
          className={inputCls}
          rows={3}
        />
      </Field>

      {err && <p className="text-2xs font-semibold text-danger">{err}</p>}
      {phieu?.trangThai === 'da-duyet' && (
        <p className="flex items-center gap-1.5 text-2xs font-semibold text-success">
          <CheckCircle2 size={13} /> Đã lưu — duyệt ngày {formatNgay(phieu.ngayDuyet)}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-ghost">
          Đóng
        </button>
        <button type="button" onClick={() => void save()} disabled={saving} className="btn-primary">
          {saving && <LoaderCircle size={15} className="animate-spin" />}
          Lưu Phiếu giao việc
        </button>
      </div>

      {phieu ? (
        <CtvGiaoViecPanel phieuGiaoViecId={phieu.id} nhanSuOptions={nhanSuOptions} />
      ) : (
        <p className="text-2xs italic text-ink-muted">Lưu phiếu giao việc trước để thêm cộng tác viên.</p>
      )}
    </div>
  );
}
