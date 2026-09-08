import { useMemo, useState } from 'react';
import {
  Plus, Flag, Users, UserCheck, Wallet, Pencil, Trash2, LoaderCircle, Search,
  CalendarClock, ListChecks, ExternalLink,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { Field, inputCls } from './Modal';
import { DataState } from './DataState';
import { DangVienChiTiet, ToChucChiTiet, PhatTrienDangChiTiet, SinhHoatChiTiet, canhBaoChuyenChinhThuc } from './DangDoanTheChiTiet';
import { useAsyncData } from '../hooks/useAsyncData';
import { useCrudForm } from '../hooks/useCrudForm';
import { useSlidePanelForm, useSlidePanelChiTiet } from '../hooks/useSlidePanelCrud';
import {
  fetchToChucDoanThe, createToChucDoanThe, updateToChucDoanThe, deleteToChucDoanThe,
  fetchDangVien, createDangVien, updateDangVien, deleteDangVien,
  fetchPhatTrienDang, createPhatTrienDang, updatePhatTrienDang, deletePhatTrienDang,
  fetchSinhHoatDinhKy, createSinhHoatDinhKy, updateSinhHoatDinhKy, deleteSinhHoatDinhKy,
  fetchThuPhiDoanThe, createThuPhiDoanThe, updateThuPhiDoanThe, deleteThuPhiDoanThe,
  type ToChucDoanTheInput, type DangVienInput, type PhatTrienDangInput,
  type SinhHoatDinhKyInput, type ThuPhiDoanTheInput,
} from '../services/dangDoanThe';
import { fetchNhanSuFull, fetchDonVi } from '../services/org';
import {
  LOAI_TO_CHUC_DOAN_THE, TRANG_THAI_DANG_VIEN, BUOC_PHAT_TRIEN_DANG, LOAI_PHI_DOAN_THE,
  type LoaiToChucDoanThe, type ToChucDoanThe, type DangVien, type PhatTrienDang,
  type SinhHoatDinhKy, type ThuPhiDoanThe,
} from '../types';
import { formatNgay, cn } from '../lib/utils';

const LOAI_ICON_CLS: Record<LoaiToChucDoanThe, string> = {
  dang: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  'doan-tn': 'bg-blue-50 text-info border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800',
  'cong-doan': 'bg-emerald-50 text-success border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
  ccb: 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  'nu-cong': 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-900/20 dark:text-purple-300 dark:border-purple-800',
};

const kyHienTai = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

const EMPTY_TO_CHUC: ToChucDoanTheInput = {
  loai: 'dang', cap: 'chi-bo', ten: '', ma: '', toChucChaId: '', donViId: '',
  nguoiDungDauId: '', phoId: '', ngayThanhLap: '', nhiemKy: '',
};
const EMPTY_DANG_VIEN: DangVienInput = {
  nhanSuId: '', toChucId: '', soTheDang: '', ngayVaoDangDuBi: '', ngayVaoDangChinhThuc: '',
  noiKetNap: '', nguoiGioiThieu1: '', nguoiGioiThieu2: '', chucVuDang: '', trinhDoLyLuan: '',
  trangThai: 'dang-sinh-hoat', ghiChu: '',
};
const EMPTY_PHAT_TRIEN: PhatTrienDangInput = {
  nhanSuId: '', toChucId: '', buocHienTai: 'quan-chung-uu-tu', ngayBatDau: '',
  ngayDuKienKetNap: '', nguoiTheoDoiId: '', ghiChu: '', trangThai: 'dang-thuc-hien',
};
const EMPTY_SINH_HOAT: SinhHoatDinhKyInput = {
  toChucId: '', ky: kyHienTai(), ngayHop: '', diaDiem: '', chuTriId: '', chuyenDe: '',
  noiDung: '', nghiQuyet: '', soBienBan: '', trangThai: 'du-kien',
};
const EMPTY_THU_PHI: ThuPhiDoanTheInput = {
  nhanSuId: '', toChucId: '', loaiPhi: 'dang-phi', ky: kyHienTai(), mucDong: '',
  soTienPhaiNop: '', soTienDaNop: '0', ngayNop: '', hinhThuc: 'tru-luong', trangThai: 'chua-nop',
};

type SubTab = 'to-chuc' | 'dang-vien' | 'phat-trien' | 'sinh-hoat-phi';
type ChiTiet =
  | { loai: 'to-chuc'; id: string }
  | { loai: 'dang-vien'; id: string }
  | { loai: 'phat-trien'; id: string }
  | { loai: 'sinh-hoat'; id: string };

/** Nút Lưu/Hủy dùng chung cho chân các panel biểu mẫu. */
function ChanForm({ dangLuu, nhan, onHuy, formId }: { dangLuu: boolean; nhan: string; onHuy: () => void; formId: string }) {
  return (
    <>
      <button type="button" onClick={onHuy} className="btn-ghost">Hủy</button>
      <button type="submit" form={formId} disabled={dangLuu} className="btn-primary disabled:opacity-60">
        {dangLuu && <LoaderCircle size={15} className="animate-spin" />} {nhan}
      </button>
    </>
  );
}

export function DangDoanTheTab() {
  const [subTab, setSubTab] = useState<SubTab>('to-chuc');
  const [chiTiet, setChiTiet] = useState<ChiTiet | null>(null);

  const { data: toChucList, loading: loadingToChuc, error: errorToChuc, refetch: refetchToChuc } =
    useAsyncData(fetchToChucDoanThe, []);
  const { data: dangVienList, loading: loadingDangVien, error: errorDangVien, refetch: refetchDangVien } =
    useAsyncData(fetchDangVien, []);
  const { data: phatTrienList, refetch: refetchPhatTrien } = useAsyncData(fetchPhatTrienDang, []);
  const { data: sinhHoatList, refetch: refetchSinhHoat } = useAsyncData(() => fetchSinhHoatDinhKy(), []);
  const { data: nhanSuList } = useAsyncData(fetchNhanSuFull, []);
  const { data: donViList } = useAsyncData(fetchDonVi, []);
  const ky = kyHienTai();
  const { data: thuPhiKyNay, refetch: refetchThuPhi } = useAsyncData(() => fetchThuPhiDoanThe(ky), []);

  const chiBoList = useMemo(() => toChucList.filter((t) => t.loai === 'dang'), [toChucList]);
  const soDangVienDangSinhHoat = dangVienList.filter(
    (d) => d.trangThai === 'dang-sinh-hoat' || d.trangThai === 'chinh-thuc'
  ).length;
  const soDangVienDuBi = dangVienList.filter(
    (d) => (!d.ngayVaoDangChinhThuc && Boolean(d.ngayVaoDangDuBi)) || d.trangThai === 'du-bi'
  ).length;
  const soQuaHanChuyen = dangVienList.filter((d) => canhBaoChuyenChinhThuc(d)).length;
  const soDangPhiDaNop = thuPhiKyNay.filter((t) => t.loaiPhi === 'dang-phi' && t.trangThai === 'da-nop').length;
  const soDangPhiTong = thuPhiKyNay.filter((t) => t.loaiPhi === 'dang-phi').length;
  const tyLeDangPhi = soDangPhiTong > 0 ? Math.round((soDangPhiDaNop / soDangPhiTong) * 100) : null;

  // ═══ CRUD: Tổ chức Đảng - Đoàn thể ═══
  const crudToChuc = useCrudForm<ToChucDoanThe, ToChucDoanTheInput>({
    empty: EMPTY_TO_CHUC,
    toForm: (t) => ({
      loai: t.loai, cap: t.cap, ten: t.ten, ma: t.ma,
      toChucChaId: t.toChucChaId ?? '', donViId: t.donViId ?? '',
      nguoiDungDauId: t.nguoiDungDauId ?? '', phoId: t.phoId ?? '',
      ngayThanhLap: t.ngayThanhLap, nhiemKy: t.nhiemKy,
    }),
    getId: (t) => t.id,
    create: createToChucDoanThe,
    update: updateToChucDoanThe,
    remove: deleteToChucDoanThe,
    deleteMessage: (t) => `Xóa tổ chức "${t.ten}"? Chỉ xóa được khi không còn đảng viên/dữ liệu tham chiếu.`,
    onDone: () => { refetchToChuc(); refetchDangVien(); },
  });

  useSlidePanelForm({
    id: 'ddt-form-to-chuc',
    open: crudToChuc.modalOpen,
    title: crudToChuc.editing ? 'Chỉnh sửa tổ chức Đảng - Đoàn thể' : 'Thêm tổ chức Đảng - Đoàn thể',
    subtitle: crudToChuc.editing?.ten,
    storageKey: 'slideover-width-ddt-to-chuc',
    deps: [crudToChuc.form, crudToChuc.editing, crudToChuc.saving, crudToChuc.actionError, nhanSuList, donViList],
    onDongNgoaiLuong: crudToChuc.closeModal,
    footer: <ChanForm formId="form-to-chuc" dangLuu={crudToChuc.saving} onHuy={crudToChuc.closeModal} nhan={crudToChuc.editing ? 'Cập nhật' : 'Thêm mới'} />,
    content: (
      <form id="form-to-chuc" onSubmit={crudToChuc.submit} className="space-y-4 p-5">
        {crudToChuc.actionError && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{crudToChuc.actionError}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Loại tổ chức" required>
            <select className={inputCls} value={crudToChuc.form.loai}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, loai: e.target.value as LoaiToChucDoanThe })}>
              {LOAI_TO_CHUC_DOAN_THE.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
            </select>
          </Field>
          <Field label="Cấp tổ chức" required>
            <input className={inputCls} required value={crudToChuc.form.cap}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, cap: e.target.value })}
              placeholder="VD: chi-bo, dang-bo, doan-co-so..." />
          </Field>
        </div>
        <Field label="Tên tổ chức" required>
          <input className={inputCls} required value={crudToChuc.form.ten}
            onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, ten: e.target.value })}
            placeholder="VD: Chi bộ Khối Cơ quan Viện" />
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Mã tổ chức">
            <input className={inputCls} value={crudToChuc.form.ma}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, ma: e.target.value })} />
          </Field>
          <Field label="Trực thuộc tổ chức">
            <select className={inputCls} value={crudToChuc.form.toChucChaId}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, toChucChaId: e.target.value })}>
              <option value="">-- Cấp cao nhất --</option>
              {toChucList.filter((t) => t.id !== crudToChuc.editing?.id).map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Đơn vị gắn với">
          <select className={inputCls} value={crudToChuc.form.donViId}
            onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, donViId: e.target.value })}>
            <option value="">-- Không gắn đơn vị cụ thể --</option>
            {donViList.map((d) => <option key={d.id} value={d.id}>{d.ten}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Bí thư / Chủ tịch">
            <select className={inputCls} value={crudToChuc.form.nguoiDungDauId}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, nguoiDungDauId: e.target.value })}>
              <option value="">-- Chưa phân công --</option>
              {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
            </select>
          </Field>
          <Field label="Phó bí thư / Phó chủ tịch">
            <select className={inputCls} value={crudToChuc.form.phoId}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, phoId: e.target.value })}>
              <option value="">-- Chưa phân công --</option>
              {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày thành lập">
            <input type="date" className={inputCls} value={crudToChuc.form.ngayThanhLap}
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, ngayThanhLap: e.target.value })} />
          </Field>
          <Field label="Nhiệm kỳ">
            <input className={inputCls} value={crudToChuc.form.nhiemKy} placeholder="VD: 2025-2030"
              onChange={(e) => crudToChuc.setForm({ ...crudToChuc.form, nhiemKy: e.target.value })} />
          </Field>
        </div>
      </form>
    ),
  });

  // ═══ CRUD: Đảng viên ═══
  const crudDangVien = useCrudForm<DangVien, DangVienInput>({
    empty: EMPTY_DANG_VIEN,
    toForm: (d) => ({
      nhanSuId: d.nhanSuId, toChucId: d.toChucId, soTheDang: d.soTheDang,
      ngayVaoDangDuBi: d.ngayVaoDangDuBi, ngayVaoDangChinhThuc: d.ngayVaoDangChinhThuc,
      noiKetNap: d.noiKetNap, nguoiGioiThieu1: d.nguoiGioiThieu1, nguoiGioiThieu2: d.nguoiGioiThieu2,
      chucVuDang: d.chucVuDang, trinhDoLyLuan: d.trinhDoLyLuan, trangThai: d.trangThai, ghiChu: d.ghiChu,
    }),
    getId: (d) => d.id,
    create: createDangVien,
    update: updateDangVien,
    remove: deleteDangVien,
    deleteMessage: (d) => `Xóa hồ sơ đảng viên "${d.hoTen}"?`,
    onDone: () => { refetchDangVien(); refetchToChuc(); },
  });

  useSlidePanelForm({
    id: 'ddt-form-dang-vien',
    open: crudDangVien.modalOpen,
    title: crudDangVien.editing ? 'Chỉnh sửa hồ sơ đảng viên' : 'Thêm hồ sơ đảng viên',
    subtitle: crudDangVien.editing?.hoTen,
    storageKey: 'slideover-width-ddt-dang-vien',
    deps: [crudDangVien.form, crudDangVien.editing, crudDangVien.saving, crudDangVien.actionError, nhanSuList, chiBoList],
    onDongNgoaiLuong: crudDangVien.closeModal,
    footer: <ChanForm formId="form-dang-vien" dangLuu={crudDangVien.saving} onHuy={crudDangVien.closeModal} nhan={crudDangVien.editing ? 'Cập nhật' : 'Thêm mới'} />,
    content: (
      <form id="form-dang-vien" onSubmit={crudDangVien.submit} className="space-y-4 p-5">
        {crudDangVien.actionError && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{crudDangVien.actionError}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="CBVC" required>
            <select className={inputCls} required value={crudDangVien.form.nhanSuId}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, nhanSuId: e.target.value })}>
              <option value="">-- Chọn CBVC --</option>
              {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
            </select>
          </Field>
          <Field label="Chi bộ / Đảng bộ" required>
            <select className={inputCls} required value={crudDangVien.form.toChucId}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, toChucId: e.target.value })}>
              <option value="">-- Chọn chi bộ --</option>
              {chiBoList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày vào Đảng dự bị" required>
            <input type="date" required className={inputCls} value={crudDangVien.form.ngayVaoDangDuBi}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, ngayVaoDangDuBi: e.target.value })} />
          </Field>
          <Field label="Ngày chuyển chính thức">
            <input type="date" className={inputCls} value={crudDangVien.form.ngayVaoDangChinhThuc}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, ngayVaoDangChinhThuc: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Số thẻ đảng viên">
            <input className={inputCls} value={crudDangVien.form.soTheDang}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, soTheDang: e.target.value })} />
          </Field>
          <Field label="Nơi kết nạp">
            <input className={inputCls} value={crudDangVien.form.noiKetNap}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, noiKetNap: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Người giới thiệu 1">
            <input className={inputCls} value={crudDangVien.form.nguoiGioiThieu1}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, nguoiGioiThieu1: e.target.value })} />
          </Field>
          <Field label="Người giới thiệu 2">
            <input className={inputCls} value={crudDangVien.form.nguoiGioiThieu2}
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, nguoiGioiThieu2: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chức vụ Đảng">
            <input className={inputCls} value={crudDangVien.form.chucVuDang} placeholder="VD: Bí thư chi bộ"
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, chucVuDang: e.target.value })} />
          </Field>
          <Field label="Trình độ lý luận chính trị">
            <input className={inputCls} value={crudDangVien.form.trinhDoLyLuan} placeholder="VD: Trung cấp"
              onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, trinhDoLyLuan: e.target.value })} />
          </Field>
        </div>
        <Field label="Trạng thái sinh hoạt" required>
          <select className={inputCls} value={crudDangVien.form.trangThai}
            onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, trangThai: e.target.value })}>
            {TRANG_THAI_DANG_VIEN.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
          </select>
        </Field>
        <Field label="Ghi chú">
          <textarea className={cn(inputCls, 'min-h-16 resize-y')} value={crudDangVien.form.ghiChu}
            onChange={(e) => crudDangVien.setForm({ ...crudDangVien.form, ghiChu: e.target.value })} />
        </Field>
      </form>
    ),
  });

  // ═══ CRUD: Phát triển đảng viên ═══
  const crudPhatTrien = useCrudForm<PhatTrienDang, PhatTrienDangInput>({
    empty: EMPTY_PHAT_TRIEN,
    toForm: (p) => ({
      nhanSuId: p.nhanSuId, toChucId: p.toChucId, buocHienTai: p.buocHienTai,
      ngayBatDau: p.ngayBatDau, ngayDuKienKetNap: p.ngayDuKienKetNap,
      nguoiTheoDoiId: p.nguoiTheoDoiId ?? '', ghiChu: p.ghiChu, trangThai: p.trangThai,
    }),
    getId: (p) => p.id,
    create: createPhatTrienDang,
    update: updatePhatTrienDang,
    remove: deletePhatTrienDang,
    deleteMessage: (p) => `Xóa hồ sơ phát triển Đảng của "${p.hoTen}"?`,
    onDone: refetchPhatTrien,
  });

  useSlidePanelForm({
    id: 'ddt-form-phat-trien',
    open: crudPhatTrien.modalOpen,
    title: crudPhatTrien.editing ? 'Cập nhật diện phát triển Đảng' : 'Đưa quần chúng vào diện phát triển Đảng',
    subtitle: crudPhatTrien.editing?.hoTen,
    storageKey: 'slideover-width-ddt-phat-trien',
    deps: [crudPhatTrien.form, crudPhatTrien.editing, crudPhatTrien.saving, crudPhatTrien.actionError, nhanSuList, chiBoList],
    onDongNgoaiLuong: crudPhatTrien.closeModal,
    footer: <ChanForm formId="form-phat-trien" dangLuu={crudPhatTrien.saving} onHuy={crudPhatTrien.closeModal} nhan="Lưu" />,
    content: (
      <form id="form-phat-trien" onSubmit={crudPhatTrien.submit} className="space-y-4 p-5">
        {crudPhatTrien.actionError && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{crudPhatTrien.actionError}</div>}
        <Field label="Quần chúng" required>
          <select className={inputCls} required value={crudPhatTrien.form.nhanSuId}
            onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, nhanSuId: e.target.value })}>
            <option value="">-- Chọn CBVC --</option>
            {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
          </select>
        </Field>
        <Field label="Chi bộ theo dõi" required>
          <select className={inputCls} required value={crudPhatTrien.form.toChucId}
            onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, toChucId: e.target.value })}>
            <option value="">-- Chọn chi bộ --</option>
            {chiBoList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
          </select>
        </Field>
        <Field label="Bước hiện tại" required>
          <select className={inputCls} value={crudPhatTrien.form.buocHienTai}
            onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, buocHienTai: e.target.value })}>
            {BUOC_PHAT_TRIEN_DANG.map((b) => <option key={b.ma} value={b.ma}>{b.ten}</option>)}
          </select>
        </Field>
        <Field label="Người theo dõi">
          <select className={inputCls} value={crudPhatTrien.form.nguoiTheoDoiId}
            onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, nguoiTheoDoiId: e.target.value })}>
            <option value="">-- Chưa phân công --</option>
            {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
          </select>
        </Field>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày bắt đầu theo dõi">
            <input type="date" className={inputCls} value={crudPhatTrien.form.ngayBatDau}
              onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, ngayBatDau: e.target.value })} />
          </Field>
          <Field label="Dự kiến ngày kết nạp">
            <input type="date" className={inputCls} value={crudPhatTrien.form.ngayDuKienKetNap}
              onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, ngayDuKienKetNap: e.target.value })} />
          </Field>
        </div>
        <Field label="Ghi chú">
          <textarea className={cn(inputCls, 'min-h-16 resize-y')} value={crudPhatTrien.form.ghiChu}
            onChange={(e) => crudPhatTrien.setForm({ ...crudPhatTrien.form, ghiChu: e.target.value })} />
        </Field>
      </form>
    ),
  });

  // ═══ CRUD: Sinh hoạt định kỳ ═══
  const crudSinhHoat = useCrudForm<SinhHoatDinhKy, SinhHoatDinhKyInput>({
    empty: EMPTY_SINH_HOAT,
    toForm: (s) => ({
      toChucId: s.toChucId, ky: s.ky, ngayHop: s.ngayHop, diaDiem: s.diaDiem,
      chuTriId: s.chuTriId ?? '', chuyenDe: s.chuyenDe, noiDung: s.noiDung,
      nghiQuyet: s.nghiQuyet, soBienBan: s.soBienBan, trangThai: s.trangThai,
    }),
    getId: (s) => s.id,
    create: createSinhHoatDinhKy,
    update: updateSinhHoatDinhKy,
    remove: deleteSinhHoatDinhKy,
    deleteMessage: (s) => `Xóa kỳ sinh hoạt ${s.ky} của ${s.toChuc}?`,
    onDone: refetchSinhHoat,
  });

  useSlidePanelForm({
    id: 'ddt-form-sinh-hoat',
    open: crudSinhHoat.modalOpen,
    title: crudSinhHoat.editing ? 'Chỉnh sửa kỳ sinh hoạt' : 'Ghi nhận kỳ sinh hoạt',
    subtitle: crudSinhHoat.editing?.toChuc,
    storageKey: 'slideover-width-ddt-sinh-hoat',
    deps: [crudSinhHoat.form, crudSinhHoat.editing, crudSinhHoat.saving, crudSinhHoat.actionError, toChucList, nhanSuList],
    onDongNgoaiLuong: crudSinhHoat.closeModal,
    footer: <ChanForm formId="form-sinh-hoat" dangLuu={crudSinhHoat.saving} onHuy={crudSinhHoat.closeModal} nhan="Lưu" />,
    content: (
      <form id="form-sinh-hoat" onSubmit={crudSinhHoat.submit} className="space-y-4 p-5">
        {crudSinhHoat.actionError && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{crudSinhHoat.actionError}</div>}
        <div className="grid grid-cols-3 gap-3">
          <Field label="Tổ chức" required>
            <select className={inputCls} required value={crudSinhHoat.form.toChucId}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, toChucId: e.target.value })}>
              <option value="">-- Chọn --</option>
              {toChucList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
            </select>
          </Field>
          <Field label="Kỳ (YYYY-MM)" required>
            <input className={inputCls} required value={crudSinhHoat.form.ky}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, ky: e.target.value })} />
          </Field>
          <Field label="Ngày họp" required>
            <input type="date" required className={inputCls} value={crudSinhHoat.form.ngayHop}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, ngayHop: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chủ trì">
            <select className={inputCls} value={crudSinhHoat.form.chuTriId}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, chuTriId: e.target.value })}>
              <option value="">-- Chọn --</option>
              {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
            </select>
          </Field>
          <Field label="Địa điểm">
            <input className={inputCls} value={crudSinhHoat.form.diaDiem}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, diaDiem: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Chuyên đề sinh hoạt">
            <input className={inputCls} value={crudSinhHoat.form.chuyenDe}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, chuyenDe: e.target.value })} />
          </Field>
          <Field label="Số biên bản">
            <input className={inputCls} value={crudSinhHoat.form.soBienBan}
              onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, soBienBan: e.target.value })} />
          </Field>
        </div>
        <Field label="Nội dung">
          <textarea className={cn(inputCls, 'min-h-20 resize-y')} value={crudSinhHoat.form.noiDung}
            onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, noiDung: e.target.value })} />
        </Field>
        <Field label="Nghị quyết">
          <textarea className={cn(inputCls, 'min-h-20 resize-y')} value={crudSinhHoat.form.nghiQuyet}
            onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, nghiQuyet: e.target.value })} />
        </Field>
        <Field label="Trạng thái" required>
          <select className={inputCls} value={crudSinhHoat.form.trangThai}
            onChange={(e) => crudSinhHoat.setForm({ ...crudSinhHoat.form, trangThai: e.target.value })}>
            <option value="du-kien">Dự kiến</option>
            <option value="da-hop">Đã họp</option>
            <option value="da-duyet-bb">Đã duyệt biên bản</option>
          </select>
        </Field>
      </form>
    ),
  });

  // ═══ CRUD: Thu đảng phí / đoàn phí ═══
  const crudThuPhi = useCrudForm<ThuPhiDoanThe, ThuPhiDoanTheInput>({
    empty: EMPTY_THU_PHI,
    toForm: (t) => ({
      nhanSuId: t.nhanSuId, toChucId: t.toChucId, loaiPhi: t.loaiPhi, ky: t.ky,
      mucDong: String(t.mucDong), soTienPhaiNop: String(t.soTienPhaiNop),
      soTienDaNop: String(t.soTienDaNop), ngayNop: t.ngayNop, hinhThuc: t.hinhThuc, trangThai: t.trangThai,
    }),
    getId: (t) => t.id,
    create: createThuPhiDoanThe,
    update: updateThuPhiDoanThe,
    remove: deleteThuPhiDoanThe,
    deleteMessage: (t) => `Xóa khoản thu ${t.loaiPhi} kỳ ${t.ky} của ${t.hoTen}?`,
    onDone: refetchThuPhi,
  });

  useSlidePanelForm({
    id: 'ddt-form-thu-phi',
    open: crudThuPhi.modalOpen,
    title: crudThuPhi.editing ? 'Cập nhật khoản thu' : 'Ghi khoản thu đảng phí / đoàn phí',
    subtitle: crudThuPhi.editing?.hoTen,
    storageKey: 'slideover-width-ddt-thu-phi',
    deps: [crudThuPhi.form, crudThuPhi.editing, crudThuPhi.saving, crudThuPhi.actionError, nhanSuList, toChucList],
    onDongNgoaiLuong: crudThuPhi.closeModal,
    footer: <ChanForm formId="form-thu-phi" dangLuu={crudThuPhi.saving} onHuy={crudThuPhi.closeModal} nhan="Lưu" />,
    content: (
      <form id="form-thu-phi" onSubmit={crudThuPhi.submit} className="space-y-4 p-5">
        {crudThuPhi.actionError && <div className="rounded-lg bg-danger-subtle p-3 text-xs text-danger">{crudThuPhi.actionError}</div>}
        <div className="grid grid-cols-2 gap-3">
          <Field label="CBVC" required>
            <select className={inputCls} required value={crudThuPhi.form.nhanSuId}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, nhanSuId: e.target.value })}>
              <option value="">-- Chọn CBVC --</option>
              {nhanSuList.map((n) => <option key={n.id} value={n.id}>{n.hoTen}</option>)}
            </select>
          </Field>
          <Field label="Tổ chức" required>
            <select className={inputCls} required value={crudThuPhi.form.toChucId}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, toChucId: e.target.value })}>
              <option value="">-- Chọn --</option>
              {toChucList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Loại phí" required>
            <select className={inputCls} value={crudThuPhi.form.loaiPhi}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, loaiPhi: e.target.value })}>
              {LOAI_PHI_DOAN_THE.map((o) => <option key={o.ma} value={o.ma}>{o.ten}</option>)}
            </select>
          </Field>
          <Field label="Kỳ" required>
            <input className={inputCls} required value={crudThuPhi.form.ky}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, ky: e.target.value })} />
          </Field>
          <Field label="Trạng thái" required>
            <select className={inputCls} value={crudThuPhi.form.trangThai}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, trangThai: e.target.value })}>
              <option value="chua-nop">Chưa nộp</option>
              <option value="da-nop">Đã nộp</option>
              <option value="mien">Miễn</option>
            </select>
          </Field>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <Field label="Mức đóng (%)">
            <input className={inputCls} value={crudThuPhi.form.mucDong}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, mucDong: e.target.value })} />
          </Field>
          <Field label="Số tiền phải nộp" required>
            <input className={inputCls} required value={crudThuPhi.form.soTienPhaiNop}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, soTienPhaiNop: e.target.value })} />
          </Field>
          <Field label="Số tiền đã nộp">
            <input className={inputCls} value={crudThuPhi.form.soTienDaNop}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, soTienDaNop: e.target.value })} />
          </Field>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Ngày nộp">
            <input type="date" className={inputCls} value={crudThuPhi.form.ngayNop}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, ngayNop: e.target.value })} />
          </Field>
          <Field label="Hình thức">
            <select className={inputCls} value={crudThuPhi.form.hinhThuc}
              onChange={(e) => crudThuPhi.setForm({ ...crudThuPhi.form, hinhThuc: e.target.value })}>
              <option value="tru-luong">Trừ lương</option>
              <option value="tien-mat">Tiền mặt</option>
              <option value="chuyen-khoan">Chuyển khoản</option>
            </select>
          </Field>
        </div>
      </form>
    ),
  });

  // ═══ Panel chi tiết dùng chung cho 4 loại bản ghi ═══
  const banGhiChiTiet = useMemo(() => {
    if (!chiTiet) return null;
    switch (chiTiet.loai) {
      case 'to-chuc': return toChucList.find((t) => t.id === chiTiet.id) ?? null;
      case 'dang-vien': return dangVienList.find((d) => d.id === chiTiet.id) ?? null;
      case 'phat-trien': return phatTrienList.find((p) => p.id === chiTiet.id) ?? null;
      case 'sinh-hoat': return sinhHoatList.find((s) => s.id === chiTiet.id) ?? null;
    }
  }, [chiTiet, toChucList, dangVienList, phatTrienList, sinhHoatList]);

  const tieuDeChiTiet = (() => {
    if (!chiTiet || !banGhiChiTiet) return { title: '', subtitle: '' };
    switch (chiTiet.loai) {
      case 'to-chuc': { const t = banGhiChiTiet as ToChucDoanThe; return { title: t.ten, subtitle: LOAI_TO_CHUC_DOAN_THE.find((o) => o.ma === t.loai)?.ten ?? t.loai }; }
      case 'dang-vien': { const d = banGhiChiTiet as DangVien; return { title: d.hoTen, subtitle: `Hồ sơ đảng viên · ${d.toChuc}` }; }
      case 'phat-trien': { const p = banGhiChiTiet as PhatTrienDang; return { title: p.hoTen, subtitle: `Phát triển Đảng · ${p.toChuc}` }; }
      case 'sinh-hoat': { const s = banGhiChiTiet as SinhHoatDinhKy; return { title: `Kỳ sinh hoạt ${s.ky}`, subtitle: s.toChuc }; }
    }
  })();

  const noiDungChiTiet = (() => {
    if (!chiTiet || !banGhiChiTiet) return null;
    switch (chiTiet.loai) {
      case 'to-chuc': return <ToChucChiTiet tc={banGhiChiTiet as ToChucDoanThe} />;
      case 'dang-vien': return <DangVienChiTiet dv={banGhiChiTiet as DangVien} />;
      case 'phat-trien': return <PhatTrienDangChiTiet pt={banGhiChiTiet as PhatTrienDang} onChanged={refetchPhatTrien} />;
      case 'sinh-hoat': return <SinhHoatChiTiet sh={banGhiChiTiet as SinhHoatDinhKy} />;
    }
  })();

  const suaTuChiTiet = () => {
    if (!chiTiet || !banGhiChiTiet) return;
    switch (chiTiet.loai) {
      case 'to-chuc': crudToChuc.openEdit(banGhiChiTiet as ToChucDoanThe); break;
      case 'dang-vien': crudDangVien.openEdit(banGhiChiTiet as DangVien); break;
      case 'phat-trien': crudPhatTrien.openEdit(banGhiChiTiet as PhatTrienDang); break;
      case 'sinh-hoat': crudSinhHoat.openEdit(banGhiChiTiet as SinhHoatDinhKy); break;
    }
  };

  useSlidePanelChiTiet({
    id: 'ddt-chi-tiet',
    active: !!chiTiet && !!banGhiChiTiet,
    title: tieuDeChiTiet.title,
    subtitle: tieuDeChiTiet.subtitle,
    storageKey: 'slideover-width-ddt-chi-tiet',
    deps: [chiTiet, banGhiChiTiet],
    onDongNgoaiLuong: () => setChiTiet(null),
    headerExtra: (
      <button onClick={suaTuChiTiet} className="flex items-center gap-1.5 rounded-lg border border-border px-3 py-1.5 text-xs font-bold text-ink-secondary hover:bg-muted">
        <Pencil size={13} /> Sửa
      </button>
    ),
    content: noiDungChiTiet,
  });

  // ═══ Bộ lọc danh sách đảng viên ═══
  const [dvSearch, setDvSearch] = useState('');
  const [dvFilterToChuc, setDvFilterToChuc] = useState('');
  const filteredDv = dangVienList.filter((d) => {
    const q = dvSearch.trim().toLowerCase();
    if (q && !d.hoTen.toLowerCase().includes(q) && !d.soTheDang.toLowerCase().includes(q)) return false;
    if (dvFilterToChuc && d.toChucId !== dvFilterToChuc) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard icon={Flag} label="Đảng viên đang sinh hoạt" value={String(soDangVienDangSinhHoat)} tone="accent" />
        <KpiCard icon={UserCheck} label="Đảng viên dự bị" value={String(soDangVienDuBi)} tone="warning" />
        <KpiCard icon={Users} label="Chi bộ / Đảng bộ" value={String(chiBoList.length)} tone="primary" />
        <KpiCard
          icon={Wallet}
          label={`Đảng phí đã nộp kỳ ${ky}`}
          value={tyLeDangPhi === null ? '— (chưa mở sổ thu)' : `${tyLeDangPhi}% (${soDangPhiDaNop}/${soDangPhiTong})`}
          tone="success"
        />
      </div>

      {soQuaHanChuyen > 0 && (
        <div className="rounded-lg border border-warning/30 bg-amber-50 px-4 py-2.5 text-xs font-semibold text-warning dark:bg-amber-900/20">
          {soQuaHanChuyen} đảng viên dự bị đã quá 12 tháng mà chưa có ngày chuyển đảng chính thức — mở hồ sơ để rà soát.
        </div>
      )}

      <div className="flex flex-wrap gap-2 rounded-xl bg-muted p-1.5 w-fit border border-border">
        {([
          { id: 'to-chuc', label: 'Cơ cấu tổ chức', icon: Users },
          { id: 'dang-vien', label: 'Hồ sơ đảng viên', icon: Flag },
          { id: 'phat-trien', label: 'Phát triển đảng viên', icon: ListChecks },
          { id: 'sinh-hoat-phi', label: 'Sinh hoạt & Đảng phí', icon: CalendarClock },
        ] as { id: SubTab; label: string; icon: typeof Flag }[]).map((t) => (
          <button key={t.id} onClick={() => setSubTab(t.id)}
            className={cn('flex items-center gap-2 rounded-lg px-3.5 py-2 text-xs font-bold transition-all',
              subTab === t.id ? 'bg-surface text-primary-600 shadow-card dark:text-primary-300' : 'text-ink-muted hover:text-ink')}>
            <t.icon size={14} /> {t.label}
          </button>
        ))}
      </div>

      {subTab === 'to-chuc' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Cây tổ chức Đảng - Đoàn thể</h3>
            <button onClick={crudToChuc.openCreate} className="btn-primary"><Plus size={15} /> Thêm tổ chức</button>
          </div>
          {crudToChuc.actionError && !crudToChuc.modalOpen && (
            <p className="px-4 py-2 text-2xs font-semibold text-danger">{crudToChuc.actionError}</p>
          )}
          <DataState loading={loadingToChuc} error={errorToChuc} empty={toChucList.length === 0} />
          <div className="space-y-4 p-4">
            {LOAI_TO_CHUC_DOAN_THE.map(({ ma, ten }) => {
              const items = toChucList.filter((t) => t.loai === ma);
              if (items.length === 0) return null;
              return (
                <div key={ma}>
                  <p className="mb-2 text-2xs font-black uppercase tracking-wider text-ink-muted">{ten} ({items.length})</p>
                  <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    {items.map((t) => (
                      <div key={t.id} className={cn('rounded-lg border p-3', LOAI_ICON_CLS[t.loai])}>
                        <div className="flex items-start justify-between gap-2">
                          <button onClick={() => setChiTiet({ loai: 'to-chuc', id: t.id })} className="min-w-0 flex-1 text-left">
                            <p className="flex items-center gap-1 truncate text-[13px] font-bold hover:underline">
                              {t.ten} <ExternalLink size={11} className="shrink-0 opacity-60" />
                            </p>
                            <p className="text-2xs opacity-80">{t.donVi || 'Chưa gắn đơn vị'}</p>
                          </button>
                          <div className="flex shrink-0 gap-0.5">
                            <button onClick={() => crudToChuc.openEdit(t)} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"><Pencil size={12} /></button>
                            <button onClick={() => crudToChuc.removeRow(t)} className="rounded p-1 hover:bg-black/5 dark:hover:bg-white/10"><Trash2 size={12} /></button>
                          </div>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-2xs">
                          {t.nguoiDungDau && <span>Bí thư/CT: <b>{t.nguoiDungDau}</b></span>}
                          {t.loai === 'dang' && <span className="font-mono">{t.soDangVien} đảng viên</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
            {toChucList.length === 0 && !loadingToChuc && (
              <p className="py-6 text-center text-xs italic text-ink-muted">
                Chưa có tổ chức Đảng - Đoàn thể nào. Bấm "Thêm tổ chức" để khởi tạo chi bộ/đảng bộ đầu tiên.
              </p>
            )}
          </div>
        </div>
      )}

      {subTab === 'dang-vien' && (
        <div className="card overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Hồ sơ đảng viên</h3>
            <div className="flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input value={dvSearch} onChange={(e) => setDvSearch(e.target.value)}
                  placeholder="Tìm tên, số thẻ..." className="input-search pl-8 py-1.5 text-xs" />
              </div>
              <select value={dvFilterToChuc} onChange={(e) => setDvFilterToChuc(e.target.value)} className="select-field w-44 text-xs">
                <option value="">-- Tất cả chi bộ --</option>
                {chiBoList.map((t) => <option key={t.id} value={t.id}>{t.ten}</option>)}
              </select>
              <button onClick={crudDangVien.openCreate} className="btn-primary" disabled={chiBoList.length === 0}>
                <Plus size={15} /> Thêm đảng viên
              </button>
            </div>
          </div>
          {chiBoList.length === 0 && (
            <p className="px-4 py-2 text-2xs italic text-ink-muted">Cần tạo ít nhất 1 chi bộ ở tab "Cơ cấu tổ chức" trước khi thêm đảng viên.</p>
          )}
          {crudDangVien.actionError && !crudDangVien.modalOpen && (
            <p className="px-4 py-2 text-2xs font-semibold text-danger">{crudDangVien.actionError}</p>
          )}
          <DataState loading={loadingDangVien} error={errorDangVien} empty={dangVienList.length === 0} />
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="th-cell">Họ tên</th>
                  <th className="th-cell">Đơn vị</th>
                  <th className="th-cell">Chi bộ</th>
                  <th className="th-cell">Ngày vào Đảng (dự bị)</th>
                  <th className="th-cell">Chức vụ Đảng</th>
                  <th className="th-cell">Trạng thái</th>
                  <th className="th-cell text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {filteredDv.map((d) => {
                  const canhBao = canhBaoChuyenChinhThuc(d);
                  return (
                    <tr key={d.id} className="tr-stripe cursor-pointer" onClick={() => setChiTiet({ loai: 'dang-vien', id: d.id })}>
                      <td className="td-cell font-semibold">{d.hoTen}</td>
                      <td className="td-cell text-ink-secondary">{d.donVi || '—'}</td>
                      <td className="td-cell text-ink-secondary">{d.toChuc}</td>
                      <td className="td-cell font-mono text-xs">
                        {formatNgay(d.ngayVaoDangDuBi)}
                        {!d.ngayVaoDangChinhThuc && (
                          <span className={cn('ml-1 text-2xs', canhBao ? 'font-bold text-danger' : 'text-warning')}>
                            {canhBao ? `(dự bị — quá hạn ${canhBao.quaHanNgay}n)` : '(dự bị)'}
                          </span>
                        )}
                      </td>
                      <td className="td-cell">{d.chucVuDang || '—'}</td>
                      <td className="td-cell">
                        <span className="rounded-full bg-subtle px-2 py-0.5 text-2xs font-bold text-ink-secondary">
                          {TRANG_THAI_DANG_VIEN.find((o) => o.ma === d.trangThai)?.ten ?? d.trangThai}
                        </span>
                      </td>
                      <td className="td-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button onClick={() => crudDangVien.openEdit(d)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600"><Pencil size={14} /></button>
                          <button onClick={() => crudDangVien.removeRow(d)} className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredDv.length === 0 && !loadingDangVien && (
                  <tr><td colSpan={7} className="td-cell py-6 text-center italic text-ink-muted">Chưa có hồ sơ đảng viên phù hợp.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'phat-trien' && (
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-sm font-bold text-ink">Quy trình phát triển đảng viên (8 bước)</h3>
            <button onClick={crudPhatTrien.openCreate} className="btn-primary" disabled={chiBoList.length === 0}>
              <Plus size={15} /> Đưa vào diện phát triển
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px]">
              <thead>
                <tr>
                  <th className="th-cell">Quần chúng</th>
                  <th className="th-cell">Đơn vị</th>
                  <th className="th-cell">Chi bộ</th>
                  <th className="th-cell">Bước hiện tại</th>
                  <th className="th-cell">Dự kiến kết nạp</th>
                  <th className="th-cell text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody>
                {phatTrienList.map((p) => (
                  <tr key={p.id} className="tr-stripe cursor-pointer" onClick={() => setChiTiet({ loai: 'phat-trien', id: p.id })}>
                    <td className="td-cell font-semibold">{p.hoTen}</td>
                    <td className="td-cell text-ink-secondary">{p.donVi || '—'}</td>
                    <td className="td-cell text-ink-secondary">{p.toChuc}</td>
                    <td className="td-cell">
                      <span className="rounded-full bg-primary-subtle px-2 py-0.5 text-2xs font-bold text-primary dark:bg-primary-900/30 dark:text-primary-300">
                        {BUOC_PHAT_TRIEN_DANG.find((b) => b.ma === p.buocHienTai)?.ten ?? p.buocHienTai}
                      </span>
                    </td>
                    <td className="td-cell font-mono text-xs">{p.ngayDuKienKetNap ? formatNgay(p.ngayDuKienKetNap) : '—'}</td>
                    <td className="td-cell" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => crudPhatTrien.openEdit(p)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600"><Pencil size={14} /></button>
                        <button onClick={() => crudPhatTrien.removeRow(p)} className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
                {phatTrienList.length === 0 && (
                  <tr><td colSpan={6} className="td-cell py-6 text-center italic text-ink-muted">Chưa có quần chúng nào trong diện phát triển Đảng.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {subTab === 'sinh-hoat-phi' && (
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-ink">Sinh hoạt định kỳ</h3>
              <button onClick={crudSinhHoat.openCreate} className="btn-primary" disabled={toChucList.length === 0}>
                <Plus size={15} /> Ghi nhận kỳ sinh hoạt
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[760px]">
                <thead>
                  <tr>
                    <th className="th-cell">Tổ chức</th>
                    <th className="th-cell">Kỳ</th>
                    <th className="th-cell">Ngày họp</th>
                    <th className="th-cell">Chủ trì</th>
                    <th className="th-cell">Chuyên đề</th>
                    <th className="th-cell text-center">Điểm danh</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {sinhHoatList.map((s) => (
                    <tr key={s.id} className="tr-stripe cursor-pointer" onClick={() => setChiTiet({ loai: 'sinh-hoat', id: s.id })}>
                      <td className="td-cell font-semibold">{s.toChuc}</td>
                      <td className="td-cell font-mono text-xs">{s.ky}</td>
                      <td className="td-cell font-mono text-xs">{formatNgay(s.ngayHop)}</td>
                      <td className="td-cell text-ink-secondary">{s.chuTri || '—'}</td>
                      <td className="td-cell text-ink-secondary">{s.chuyenDe || '—'}</td>
                      <td className="td-cell text-center font-mono text-xs">{s.soThamGia}</td>
                      <td className="td-cell" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-end gap-1">
                          <button onClick={() => crudSinhHoat.openEdit(s)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600"><Pencil size={14} /></button>
                          <button onClick={() => crudSinhHoat.removeRow(s)} className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sinhHoatList.length === 0 && (
                    <tr><td colSpan={7} className="td-cell py-6 text-center italic text-ink-muted">Chưa có kỳ sinh hoạt nào được ghi nhận.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card overflow-hidden">
            <div className="flex items-center justify-between border-b border-border px-4 py-3">
              <h3 className="text-sm font-bold text-ink">Sổ thu đảng phí / đoàn phí — kỳ {ky}</h3>
              <button onClick={crudThuPhi.openCreate} className="btn-primary" disabled={toChucList.length === 0}>
                <Plus size={15} /> Ghi khoản thu
              </button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px]">
                <thead>
                  <tr>
                    <th className="th-cell">CBVC</th>
                    <th className="th-cell">Loại phí</th>
                    <th className="th-cell text-right">Phải nộp</th>
                    <th className="th-cell text-right">Đã nộp</th>
                    <th className="th-cell">Trạng thái</th>
                    <th className="th-cell text-right">Thao tác</th>
                  </tr>
                </thead>
                <tbody>
                  {thuPhiKyNay.map((t) => (
                    <tr key={t.id} className="tr-stripe">
                      <td className="td-cell font-semibold">{t.hoTen}</td>
                      <td className="td-cell text-ink-secondary">{LOAI_PHI_DOAN_THE.find((l) => l.ma === t.loaiPhi)?.ten ?? t.loaiPhi}</td>
                      <td className="td-cell text-right font-mono text-xs">{t.soTienPhaiNop.toLocaleString('vi-VN')}</td>
                      <td className="td-cell text-right font-mono text-xs">{t.soTienDaNop.toLocaleString('vi-VN')}</td>
                      <td className="td-cell">
                        <span className={cn('rounded-full px-2 py-0.5 text-2xs font-bold',
                          t.trangThai === 'da-nop' ? 'bg-emerald-50 text-success dark:bg-emerald-900/20' : 'bg-amber-50 text-warning dark:bg-amber-900/20')}>
                          {t.trangThai === 'da-nop' ? 'Đã nộp' : t.trangThai === 'mien' ? 'Miễn' : 'Chưa nộp'}
                        </span>
                      </td>
                      <td className="td-cell">
                        <div className="flex justify-end gap-1">
                          <button onClick={() => crudThuPhi.openEdit(t)} className="rounded p-1 text-ink-muted hover:bg-muted hover:text-primary-600"><Pencil size={14} /></button>
                          <button onClick={() => crudThuPhi.removeRow(t)} className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {thuPhiKyNay.length === 0 && (
                    <tr><td colSpan={6} className="td-cell py-6 text-center italic text-ink-muted">Kỳ {ky} chưa mở sổ thu.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
