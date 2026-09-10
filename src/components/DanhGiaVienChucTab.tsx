import { useState, useMemo, useEffect, type FormEvent } from 'react';
import {
  Award,
  CheckCircle2,
  FileText,
  AlertTriangle,
  Users,
  Search,
  Plus,
  Filter,
  Pencil,
  X,
  FileSpreadsheet,
  Building2,
  Calendar,
  AlertCircle,
  TrendingUp,
  ShieldAlert,
  SlidersHorizontal,
  ChevronRight,
  Download,
  CheckCheck,
} from 'lucide-react';
import { KpiCard } from './KpiCard';
import { DataState } from './DataState';
import { Field, inputCls } from './Modal';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { cn, exportCsv, exportExcel } from '../lib/utils';
import type { DonVi, NhanSu } from '../types';
import * as danhGiaSvc from '../services/danhGia';
import type { DanhGiaVienChuc, ThongKeDanhGia, KyDanhGia, MucXepLoai, DanhGiaInput } from '../services/danhGia';

interface Props {
  donViList: DonVi[];
  nhanSuList: NhanSu[];
}

export function DanhGiaVienChucTab({ donViList, nhanSuList }: Props) {
  // Bộ lọc
  const [selectedNam, setSelectedNam] = useState<number>(2026);
  const [selectedKy, setSelectedKy] = useState<string>('ca-nam');
  const [selectedDonVi, setSelectedDonVi] = useState<string>('all');
  const [selectedXepLoai, setSelectedXepLoai] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Tải dữ liệu danh sách đánh giá & thống kê
  const [danhGiaList, setDanhGiaList] = useState<DanhGiaVienChuc[]>([]);
  const [thongKe, setThongKe] = useState<ThongKeDanhGia | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState<number>(0);
  const reload = () => setTick((t) => t + 1);

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError(null);
    Promise.all([
      danhGiaSvc.fetchDanhGiaVienChuc({
        nam: selectedNam,
        ky: selectedKy,
        donViId: selectedDonVi,
        xepLoai: selectedXepLoai,
        search: searchQuery,
      }),
      danhGiaSvc.fetchThongKeDanhGia(selectedNam, selectedKy),
    ])
      .then(([list, stats]) => {
        if (active) {
          setDanhGiaList(list);
          setThongKe(stats);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (active) {
          setError(err instanceof Error ? err.message : String(err));
          setLoading(false);
        }
      });
    return () => {
      active = false;
    };
  }, [selectedNam, selectedKy, selectedDonVi, selectedXepLoai, searchQuery, tick]);

  // Slide Panels State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editData, setEditData] = useState<DanhGiaVienChuc | null>(null);

  const [isChiTietOpen, setIsChiTietOpen] = useState(false);
  const [chiTietData, setChiTietData] = useState<DanhGiaVienChuc | null>(null);

  const openCreate = () => {
    setIsEdit(false);
    setEditData(null);
    setIsFormOpen(true);
  };

  const openEdit = (item: DanhGiaVienChuc) => {
    setIsEdit(true);
    setEditData(item);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditData(null);
  };

  const openChiTiet = (item: DanhGiaVienChuc) => {
    setChiTietData(item);
    setIsChiTietOpen(true);
  };

  const closeChiTiet = () => {
    setIsChiTietOpen(false);
    setChiTietData(null);
  };

  // Form State
  const [formNhanSuId, setFormNhanSuId] = useState<string>('');
  const [formNam, setFormNam] = useState<number>(selectedNam);
  const [formKy, setFormKy] = useState<KyDanhGia>('ca-nam');
  const [formDiemChung, setFormDiemChung] = useState<number>(27);
  const [formDiemNhiemVu, setFormDiemNhiemVu] = useState<number>(60);
  const [formBiKyLuat, setFormBiKyLuat] = useState<boolean>(false);
  const [formHinhThucKyLuat, setFormHinhThucKyLuat] = useState<string>('');
  const [formNhanXet, setFormNhanXet] = useState<string>('');
  const [formXepLoai, setFormXepLoai] = useState<MucXepLoai>('hoan-thanh-tot');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Khi mở form sửa
  useEffect(() => {
    if (editData) {
      setFormNhanSuId(editData.nhanSuId);
      setFormNam(editData.nam);
      setFormKy(editData.ky);
      setFormDiemChung(editData.diemChung);
      setFormDiemNhiemVu(editData.diemNhiemVu);
      setFormBiKyLuat(editData.biKyLuat);
      setFormHinhThucKyLuat(editData.hinhThucKyLuat || '');
      setFormNhanXet(editData.nhanXet || '');
      setFormXepLoai(editData.xepLoai);
    } else {
      setFormNhanSuId(nhanSuList[0]?.id ? String(nhanSuList[0].id) : '');
      setFormNam(selectedNam);
      setFormKy(selectedKy !== 'all' ? (selectedKy as KyDanhGia) : 'ca-nam');
      setFormDiemChung(26.5);
      setFormDiemNhiemVu(58.5);
      setFormBiKyLuat(false);
      setFormHinhThucKyLuat('');
      setFormNhanXet('Hoàn thành tốt các nhiệm vụ được giao theo vị trí việc làm.');
      setFormXepLoai('hoan-thanh-tot');
    }
  }, [editData, isFormOpen, nhanSuList, selectedNam, selectedKy]);

  // Tự động tính tổng điểm và mức xếp loại theo NĐ 233/2026
  const formTongDiem = useMemo(() => {
    return Number((Number(formDiemChung) + Number(formDiemNhiemVu)).toFixed(1));
  }, [formDiemChung, formDiemNhiemVu]);

  useEffect(() => {
    if (formBiKyLuat) {
      setFormXepLoai('khong-hoan-thanh');
    } else if (formTongDiem >= 90) {
      setFormXepLoai('hoan-thanh-xuat-sac');
    } else if (formTongDiem >= 70) {
      setFormXepLoai('hoan-thanh-tot');
    } else if (formTongDiem >= 50) {
      setFormXepLoai('hoan-thanh');
    } else {
      setFormXepLoai('khong-hoan-thanh');
    }
  }, [formTongDiem, formBiKyLuat]);

  const handleSubmitForm = async (e: FormEvent) => {
    e.preventDefault();
    if (!formNhanSuId) return;

    try {
      setSubmitting(true);
      const input: DanhGiaInput = {
        nhanSuId: formNhanSuId,
        nam: formNam,
        ky: formKy,
        diemChung: Number(formDiemChung),
        diemNhiemVu: Number(formDiemNhiemVu),
        tuXepLoai: formXepLoai,
        xepLoai: formXepLoai,
        biKyLuat: formBiKyLuat,
        hinhThucKyLuat: formBiKyLuat ? formHinhThucKyLuat : undefined,
        nhanXet: formNhanXet,
        trangThai: 'da-duyet',
      };

      await danhGiaSvc.saveDanhGiaVienChuc(input);
      closeForm();
      reload();
    } catch (err: any) {
      alert(`Lỗi khi lưu phiếu đánh giá: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  // ── SlidePanel: Chi tiết Phiếu Đánh Giá Viên Chức (Mẫu NĐ 233/2026) ──
  useSlidePanelChiTiet({
    id: 'danh-gia-vien-chuc-chi-tiet',
    active: isChiTietOpen && !!chiTietData,
    title: chiTietData
      ? `Phiếu Đánh Giá: ${chiTietData.hocVi ? `${chiTietData.hocVi}. ` : ''}${chiTietData.hoVaTen}`
      : 'Phiếu Đánh Giá Viên Chức',
    subtitle: chiTietData
      ? `Mẫu NĐ 233/2026/NĐ-CP · ${danhGiaSvc.KY_DANH_GIA_LABELS[chiTietData.ky]} ${chiTietData.nam}`
      : undefined,
    icon: <FileSpreadsheet className="text-primary" size={16} />,
    storageKey: 'slideover-width-dgvc-detail',
    minWidth: 540,
    deps: [chiTietData, isChiTietOpen],
    onDongNgoaiLuong: closeChiTiet,
    headerExtra: chiTietData && (
      <button
        type="button"
        onClick={() => {
          openEdit(chiTietData);
        }}
        className="btn-secondary py-1 px-2.5 text-xs font-bold gap-1"
      >
        <Pencil size={12} /> Chỉnh sửa
      </button>
    ),
    content: chiTietData ? (
      <div className="space-y-5 p-1 text-xs">
        {/* Thông tin cán bộ */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/50 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-base font-black text-ink">
              {chiTietData.hocVi ? `${chiTietData.hocVi}. ` : ''}{chiTietData.hoVaTen}
            </span>
            <span
              className={cn(
                'px-2.5 py-0.5 rounded-full text-xs font-bold border',
                danhGiaSvc.MUC_XEP_LOAI_META[chiTietData.xepLoai].badgeCls
              )}
            >
              {danhGiaSvc.MUC_XEP_LOAI_META[chiTietData.xepLoai].label}
            </span>
          </div>
          <div className="grid grid-cols-2 gap-2 text-ink-secondary text-[11px] pt-1 border-t border-border-subtle">
            <div>Chức vụ: <strong>{chiTietData.chucDanh || 'Viên chức'}</strong></div>
            <div>Đơn vị: <strong>{chiTietData.donViTen || chiTietData.donViTenVietTat}</strong></div>
            <div>Năm đánh giá: <strong>{chiTietData.nam}</strong></div>
            <div>Kỳ đánh giá: <strong>{danhGiaSvc.KY_DANH_GIA_LABELS[chiTietData.ky]}</strong></div>
          </div>
        </div>

        {/* Bảng phân tích điểm định lượng (100 điểm) */}
        <div className="space-y-3">
          <h4 className="font-bold text-ink text-xs uppercase tracking-wider flex items-center gap-1.5">
            <TrendingUp size={14} className="text-primary" />
            Kết quả Chấm điểm Định lượng (Thang điểm 100)
          </h4>

          {/* Tiêu chí chung (30đ) */}
          <div className="p-3 rounded-lg border border-border bg-surface space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-ink">1. Tiêu chí chung (Tối đa 30 điểm)</span>
              <span className="font-mono font-bold text-primary text-sm">
                {chiTietData.diemChung} / 30 đ
              </span>
            </div>
            <p className="text-[10px] text-ink-muted">
              Phẩm chất chính trị, đạo đức nghề nghiệp, tác phong lề lối, ý thức tổ chức kỷ luật, chuyển đổi số.
            </p>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-primary h-full rounded-full"
                style={{ width: `${(chiTietData.diemChung / 30) * 100}%` }}
              />
            </div>
          </div>

          {/* Kết quả thực hiện nhiệm vụ (70đ) */}
          <div className="p-3 rounded-lg border border-border bg-surface space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="font-bold text-ink">2. Kết quả thực hiện nhiệm vụ (Tối đa 70 điểm)</span>
              <span className="font-mono font-bold text-primary text-sm">
                {chiTietData.diemNhiemVu} / 70 đ
              </span>
            </div>
            <p className="text-[10px] text-ink-muted">
              Tiến độ, khối lượng, chất lượng công việc theo hợp đồng làm việc, đề tài NCKH, dịch vụ kỹ thuật, tiêu chuẩn.
            </p>
            <div className="w-full bg-muted h-2 rounded-full overflow-hidden">
              <div
                className="bg-emerald-500 h-full rounded-full"
                style={{ width: `${(chiTietData.diemNhiemVu / 70) * 100}%` }}
              />
            </div>
          </div>

          {/* Tổng điểm */}
          <div className="p-3.5 rounded-xl border-2 border-primary/30 bg-primary/5 flex items-center justify-between">
            <div>
              <p className="font-black text-ink text-sm">TỔNG ĐIỂM ĐÁNH GIÁ</p>
              <p className="text-[10px] text-ink-muted">Tỷ lệ hoàn thành nhiệm vụ: {chiTietData.tiLeHoanThanh}%</p>
            </div>
            <div className="text-2xl font-black font-mono text-primary">
              {chiTietData.tongDiem} <span className="text-xs font-normal text-ink-muted">/ 100</span>
            </div>
          </div>
        </div>

        {/* Tình trạng kỷ luật (Nếu có) */}
        {chiTietData.biKyLuat && (
          <div className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 dark:bg-rose-950/40 space-y-1">
            <div className="flex items-center gap-1.5 font-bold text-rose-700 dark:text-rose-400">
              <ShieldAlert size={16} />
              Xử lý kỷ luật trong năm (Áp dụng NĐ 233/2026/NĐ-CP)
            </div>
            <p className="text-[11px] text-rose-800 dark:text-rose-300">
              Hình thức: <strong>{chiTietData.hinhThucKyLuat || 'Khiển trách'}</strong>
            </p>
            <p className="text-[10px] text-rose-700/80">
              Theo quy định, viên chức bị xử lý kỷ luật Đảng hoặc kỷ luật hành chính trong năm đánh giá sẽ bị xếp loại ở mức <strong>Không hoàn thành nhiệm vụ</strong>.
            </p>
          </div>
        )}

        {/* Nhận xét & Đánh giá */}
        <div className="space-y-1.5">
          <h4 className="font-bold text-ink text-xs uppercase tracking-wider">
            Nhận xét của Hội đồng / Cấp quản lý
          </h4>
          <div className="p-3 rounded-xl border border-border bg-surface text-ink leading-relaxed">
            {chiTietData.nhanXet || 'Không có nhận xét bổ sung.'}
          </div>
        </div>
      </div>
    ) : null,
    footer: chiTietData ? (
      <div className="flex w-full items-center justify-between">
        <button
          type="button"
          onClick={async () => {
            const next = chiTietData.trangThai === 'da-duyet' ? 'cho-duyet' : 'da-duyet';
            await danhGiaSvc.updateTrangThaiDanhGia(chiTietData.id, next);
            setChiTietData({ ...chiTietData, trangThai: next });
            reload();
          }}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors',
            chiTietData.trangThai === 'da-duyet'
              ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-rose-50 hover:text-rose-700 hover:border-rose-300'
              : 'bg-primary text-white border-primary hover:bg-primary-600'
          )}
          title="Cập nhật trạng thái phê duyệt"
        >
          <CheckCheck size={14} />
          {chiTietData.trangThai === 'da-duyet' ? 'Đã duyệt (Bấm để hủy)' : 'Phê duyệt phiếu này'}
        </button>
        <div className="flex gap-2">
          <button type="button" onClick={closeChiTiet} className="btn-ghost">
            Đóng
          </button>
          <button
            type="button"
            onClick={() => {
              openEdit(chiTietData);
            }}
            className="btn-primary flex items-center gap-1.5"
          >
            <Pencil size={14} /> Chỉnh sửa phiếu
          </button>
        </div>
      </div>
    ) : null,
  });

  // ── SlidePanel: Thêm / Chỉnh Sửa Phiếu Đánh Giá ──
  useSlidePanelForm({
    id: 'danh-gia-vien-chuc-form',
    open: isFormOpen,
    title: isEdit ? 'Chỉnh Sửa Phiếu Đánh Giá' : 'Chấm Điểm / Tạo Phiếu Đánh Giá Mới',
    subtitle: 'Khung chấm điểm định lượng 100đ - Nghị định 233/2026/NĐ-CP',
    icon: <Pencil className="text-primary" size={16} />,
    storageKey: 'slideover-width-dgvc-form',
    minWidth: 540,
    deps: [
      isFormOpen,
      isEdit,
      editData,
      formNhanSuId,
      formNam,
      formKy,
      formDiemChung,
      formDiemNhiemVu,
      formBiKyLuat,
      formHinhThucKyLuat,
      formNhanXet,
      formXepLoai,
      submitting,
    ],
    onDongNgoaiLuong: closeForm,
    content: (
      <form id="dgvc-form-element" onSubmit={handleSubmitForm} className="space-y-4 p-1 text-xs">
        {/* Chọn Nhân sự */}
        <Field label="Viên chức được đánh giá *">
          <select
            value={formNhanSuId}
            disabled={isEdit}
            className={inputCls}
            required
            onChange={async (e) => {
              const newId = e.target.value;
              setFormNhanSuId(newId);
              try {
                const kl = await danhGiaSvc.kiemTraKyLuatTrongNam(newId, formNam);
                if (kl.biKyLuat) {
                  setFormBiKyLuat(true);
                  if (kl.hinhThuc) setFormHinhThucKyLuat(kl.hinhThuc);
                  setFormXepLoai('khong-hoan-thanh');
                }
              } catch {
                // ignore
              }
            }}
          >
            {nhanSuList.map((ns) => (
              <option key={ns.id} value={ns.id}>
                {ns.hocVi ? `${ns.hocVi}. ` : ''}{ns.hoTen} ({ns.chucDanh || 'Viên chức'} - {ns.donVi})
              </option>
            ))}
          </select>
        </Field>

        {/* Năm và Kỳ */}
        <div className="grid grid-cols-2 gap-3">
          <Field label="Năm đánh giá *">
            <select
              value={formNam}
              onChange={(e) => setFormNam(Number(e.target.value))}
              className={inputCls}
            >
              <option value={2026}>Năm 2026</option>
              <option value={2025}>Năm 2025</option>
              <option value={2024}>Năm 2024</option>
            </select>
          </Field>

          <Field label="Kỳ đánh giá (Quá trình) *">
            <select
              value={formKy}
              onChange={(e) => setFormKy(e.target.value as KyDanhGia)}
              className={inputCls}
            >
              <option value="ca-nam">Cả năm</option>
              <option value="quy-1">Quý 1</option>
              <option value="quy-2">Quý 2</option>
              <option value="quy-3">Quý 3</option>
              <option value="quy-4">Quý 4</option>
              <option value="6-thang-dau-nam">6 tháng đầu năm</option>
              <option value="6-thang-cuoi-nam">6 tháng cuối năm</option>
            </select>
          </Field>
        </div>

        {/* Chấm điểm tiêu chí chung */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/40 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-bold text-ink flex items-center gap-1.5">
              <span>1. Tiêu chí chung</span>
              <span className="text-[10px] text-ink-muted font-normal">(Tối đa 30 điểm)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={30}
                step={0.5}
                value={formDiemChung}
                onChange={(e) => setFormDiemChung(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded font-mono font-bold text-right text-primary"
                required
              />
              <span className="text-ink-muted">/ 30đ</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={30}
            step={0.5}
            value={formDiemChung}
            onChange={(e) => setFormDiemChung(Number(e.target.value))}
            className="w-full accent-primary cursor-pointer"
          />
        </div>

        {/* Chấm điểm kết quả thực hiện nhiệm vụ */}
        <div className="p-3.5 rounded-xl border border-border bg-subtle/40 space-y-2">
          <div className="flex justify-between items-center">
            <label className="font-bold text-ink flex items-center gap-1.5">
              <span>2. Kết quả thực hiện nhiệm vụ</span>
              <span className="text-[10px] text-ink-muted font-normal">(Tối đa 70 điểm)</span>
            </label>
            <div className="flex items-center gap-1">
              <input
                type="number"
                min={0}
                max={70}
                step={0.5}
                value={formDiemNhiemVu}
                onChange={(e) => setFormDiemNhiemVu(Number(e.target.value))}
                className="w-16 px-2 py-1 border rounded font-mono font-bold text-right text-emerald-600"
                required
              />
              <span className="text-ink-muted">/ 70đ</span>
            </div>
          </div>
          <input
            type="range"
            min={0}
            max={70}
            step={0.5}
            value={formDiemNhiemVu}
            onChange={(e) => setFormDiemNhiemVu(Number(e.target.value))}
            className="w-full accent-emerald-600 cursor-pointer"
          />
        </div>

        {/* Khung tổng hợp điểm */}
        <div className="p-3 rounded-xl border-2 border-dashed border-primary/40 bg-primary/5 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-ink-secondary">TỔNG ĐIỂM TỰ ĐỘNG CỘNG</span>
            <p className="text-[10px] text-ink-muted">Thang điểm 100 theo Nghị định 233/2026/NĐ-CP</p>
          </div>
          <div className="text-xl font-black font-mono text-primary">
            {formTongDiem} / 100
          </div>
        </div>

        {/* Tình trạng kỷ luật */}
        <div className="p-3 rounded-xl border border-border bg-subtle/30 space-y-2">
          <label className="flex items-center gap-2 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={formBiKyLuat}
              onChange={(e) => setFormBiKyLuat(e.target.checked)}
              className="rounded text-rose-600 focus:ring-rose-500 w-4 h-4"
            />
            <span className="font-bold text-ink">
              Viên chức có quyết định kỷ luật trong năm đánh giá
            </span>
          </label>

          {formBiKyLuat && (
            <div className="pt-2 animate-in fade-in space-y-1.5">
              <Field label="Hình thức kỷ luật *">
                <select
                  value={formHinhThucKyLuat}
                  onChange={(e) => setFormHinhThucKyLuat(e.target.value)}
                  className={inputCls}
                >
                  <option value="Khiển trách">Khiển trách</option>
                  <option value="Cảnh cáo">Cảnh cáo</option>
                  <option value="Cách chức">Cách chức (đối với viên chức quản lý)</option>
                  <option value="Buộc thôi việc">Buộc thôi việc</option>
                </select>
              </Field>
              <p className="text-[10px] text-rose-600 font-semibold">
                * Chú ý: Theo Điều 1 NĐ 233/2026, viên chức bị kỷ luật sẽ tự động xếp loại "Không hoàn thành nhiệm vụ".
              </p>
            </div>
          )}
        </div>

        {/* Mức xếp loại */}
        <Field label="Mức xếp loại chất lượng (Tự động đề xuất theo điểm)">
          <select
            value={formXepLoai}
            onChange={(e) => setFormXepLoai(e.target.value as MucXepLoai)}
            className={cn(inputCls, 'font-bold')}
            disabled={formBiKyLuat}
          >
            <option value="hoan-thanh-xuat-sac">Hoàn thành xuất sắc nhiệm vụ (≥ 90đ, trần ≤ 20%)</option>
            <option value="hoan-thanh-tot">Hoàn thành tốt nhiệm vụ (70đ đến &lt; 90đ)</option>
            <option value="hoan-thanh">Hoàn thành nhiệm vụ (50đ đến &lt; 70đ)</option>
            <option value="khong-hoan-thanh">Không hoàn thành nhiệm vụ (&lt; 50đ hoặc bị kỷ luật)</option>
          </select>
          {formXepLoai === 'hoan-thanh-xuat-sac' && (() => {
            const selectedNs = nhanSuList.find((n) => String(n.id) === String(formNhanSuId));
            const isLeader = /viện trưởng|giám đốc|trưởng phòng|trưởng ban/i.test(selectedNs?.chucDanh || '');
            if (isLeader) {
              return (
                <div className="rounded-lg bg-amber-50 p-2 text-2xs text-warning border border-amber-200 dark:bg-amber-950/40 dark:border-amber-800 dark:text-amber-300 flex items-start gap-1.5 mt-2">
                  <AlertTriangle size={13} className="shrink-0 mt-0.5" />
                  <span><strong>Lưu ý Điều 12 NĐ 233/2026:</strong> Mức xếp loại của người đứng đầu không được cao hơn mức xếp loại của tập thể đơn vị do mình phụ trách.</span>
                </div>
              );
            }
            return null;
          })()}
        </Field>

        {/* Nhận xét */}
        <Field label="Nhận xét của Hội đồng / Cấp quản lý">
          <textarea
            rows={3}
            value={formNhanXet}
            onChange={(e) => setFormNhanXet(e.target.value)}
            className={inputCls}
            placeholder="Nhập nhận xét cụ thể về kết quả thực hiện nhiệm vụ và ý thức tổ chức kỷ luật..."
          />
        </Field>
      </form>
    ),
    footer: (
      <div className="flex w-full justify-end gap-2">
        <button type="button" onClick={closeForm} className="btn-ghost">
          Hủy bỏ
        </button>
        <button
          type="submit"
          form="dgvc-form-element"
          disabled={submitting}
          className="btn-primary flex items-center gap-1.5"
        >
          {submitting ? 'Đang lưu...' : isEdit ? 'Cập nhật phiếu' : 'Lưu phiếu đánh giá'}
        </button>
      </div>
    ),
  });

  const handleExportNd233 = () => {
    const headers = [
      'STT',
      'Mã NV',
      'Họ và tên',
      'Học vị',
      'Chức vụ',
      'Đơn vị công tác',
      'Năm',
      'Kỳ đánh giá',
      'Điểm tiêu chí chung (max 30)',
      'Điểm thực hiện nhiệm vụ (max 70)',
      'Tổng điểm (100)',
      'Mức xếp loại chất lượng (NĐ 233)',
      'Bị kỷ luật',
      'Hình thức kỷ luật',
      'Trạng thái phê duyệt',
      'Nhận xét / Đánh giá',
    ];
    const rows = danhGiaList.map((item, idx) => {
      const meta = danhGiaSvc.MUC_XEP_LOAI_META[item.xepLoai];
      return [
        idx + 1,
        `NV-${item.nhanSuId.padStart(4, '0')}`,
        item.hoVaTen,
        item.hocVi || '',
        item.chucDanh || '',
        item.donViTen || item.donViTenVietTat || '',
        item.nam,
        danhGiaSvc.KY_DANH_GIA_LABELS[item.ky] || item.ky,
        item.diemChung,
        item.diemNhiemVu,
        item.tongDiem,
        meta?.label || item.xepLoai,
        item.biKyLuat ? 'Có' : 'Không',
        item.hinhThucKyLuat || '',
        item.trangThai === 'da-duyet' ? 'Đã duyệt' : item.trangThai === 'cho-duyet' ? 'Chờ duyệt' : 'Bản nháp',
        item.nhanXet || '',
      ];
    });
    const dateStr = new Date().toISOString().split('T')[0];
    exportExcel(
      `Bao_cao_danh_gia_xep_loai_vien_chuc_IBST_${selectedNam}_${selectedKy}_${dateStr}`,
      `Xếp loại ${selectedNam}`,
      headers,
      rows,
    );
  };

  const handleQuickToggleDuyet = async (e: React.MouseEvent, item: DanhGiaVienChuc) => {
    e.stopPropagation();
    const nextStatus = item.trangThai === 'da-duyet' ? 'cho-duyet' : 'da-duyet';
    try {
      await danhGiaSvc.updateTrangThaiDanhGia(item.id, nextStatus);
      reload();
    } catch (err) {
      alert(err instanceof Error ? err.message : String(err));
    }
  };

  const selectedStaffObj = useMemo(() => {
    return nhanSuList.find((n) => String(n.id) === String(formNhanSuId));
  }, [nhanSuList, formNhanSuId]);

  return (
    <div className="space-y-6">
      {/* ── Header Giới thiệu Nghị định 233/2026/NĐ-CP ── */}
      <div className="rounded-2xl border border-primary/20 bg-gradient-to-r from-primary-50/70 via-surface to-primary-50/30 p-5 dark:from-primary-950/20 dark:to-surface">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-md bg-primary/10 px-2.5 py-0.5 text-xs font-black uppercase text-primary tracking-wide">
                <FileSpreadsheet size={13} /> Nghị định số 233/2026/NĐ-CP
              </span>
              <span className="rounded-full bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300 text-[10px] font-bold px-2 py-0.5">
                Hiệu lực từ 01/07/2026
              </span>
            </div>
            <h2 className="text-base font-black text-ink tracking-tight">
              Đánh giá, Xếp loại Chất lượng Đơn vị Sự nghiệp Công lập & Viên chức
            </h2>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Áp dụng cơ chế <strong>đánh giá theo quá trình thường xuyên (theo Quý/Tháng)</strong>, khung điểm định lượng 100 điểm
              gắn với sản phẩm đầu ra, và nguyên tắc: <em>Mức xếp loại của người đứng đầu không cao hơn mức xếp loại của đơn vị</em>.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-start md:self-auto">
            <button
              onClick={handleExportNd233}
              className="flex items-center gap-1.5 rounded-lg border border-border bg-surface px-3.5 py-2 text-xs font-bold text-ink hover:bg-muted hover:text-primary transition-colors shadow-xs"
              title="Xuất bảng tổng hợp kết quả đánh giá xếp loại viên chức theo NĐ 233 ra file CSV/Excel"
            >
              <Download size={15} className="text-primary-600" />
              <span>Xuất Báo cáo NĐ 233</span>
            </button>
            <button
              onClick={() => openCreate()}
              className="btn-primary flex items-center gap-2"
            >
              <Plus size={16} /> Chấm điểm / Tạo phiếu
            </button>
          </div>
        </div>
      </div>

      {/* ── Bộ chọn Năm & Kỳ Đánh Giá ── */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        {/* Năm */}
        <div className="flex items-center gap-2">
          <Calendar size={15} className="text-ink-muted" />
          <span className="text-xs font-bold text-ink">Năm đánh giá:</span>
          <div className="flex rounded-lg bg-muted p-0.5 border border-border">
            {[2026, 2025, 2024].map((y) => (
              <button
                key={y}
                onClick={() => setSelectedNam(y)}
                className={cn(
                  'px-3 py-1 text-xs font-bold rounded-md transition-all',
                  selectedNam === y
                    ? 'bg-surface text-primary shadow-xs'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                {y} {y === 2026 && '⚡'}
              </button>
            ))}
          </div>
        </div>

        {/* Kỳ đánh giá (Theo quá trình - NĐ 233) */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-ink">Kỳ đánh giá:</span>
          <div className="flex rounded-lg bg-muted p-0.5 border border-border">
            {(['ca-nam', 'quy-1', 'quy-2', 'quy-3', 'quy-4'] as const).map((k) => (
              <button
                key={k}
                onClick={() => setSelectedKy(k)}
                className={cn(
                  'px-2.5 py-1 text-xs font-semibold rounded-md transition-all',
                  selectedKy === k
                    ? 'bg-surface text-primary shadow-xs font-bold'
                    : 'text-ink-muted hover:text-ink'
                )}
              >
                {danhGiaSvc.KY_DANH_GIA_LABELS[k]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── KPI Dashboard Cards ── */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {/* Tổng số */}
        <div className="card p-3.5 border-l-4 border-l-primary flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider">Tổng CBVC</span>
            <Users size={14} className="text-primary" />
          </div>
          <div className="text-xl font-black text-ink font-mono">{thongKe?.tongSo || 0}</div>
          <p className="text-[10px] text-ink-muted mt-0.5">
            Điểm TB: <span className="font-bold text-primary font-mono">{thongKe?.diemTrungBinh || 0}đ</span>
          </p>
        </div>

        {/* Hoàn thành xuất sắc */}
        <div
          className={cn(
            'card p-3.5 border-l-4 flex flex-col justify-between transition-all',
            thongKe?.vuotTranXuatSac
              ? 'border-l-rose-500 bg-rose-50/20 dark:bg-rose-950/20'
              : 'border-l-emerald-500'
          )}
        >
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
              Xuất sắc (HTXSNV)
            </span>
            <Award size={14} className="text-emerald-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-emerald-700 dark:text-emerald-300 font-mono">
              {thongKe?.xuatSac || 0}
            </span>
            <span className="text-xs font-bold text-emerald-600 font-mono">
              ({thongKe?.xuatSacTiLe || 0}%)
            </span>
          </div>
          {thongKe?.vuotTranXuatSac ? (
            <p className="text-[10px] font-bold text-rose-600 flex items-center gap-1 mt-0.5">
              <AlertCircle size={10} /> Vượt trần 20%
            </p>
          ) : (
            <p className="text-[10px] text-emerald-700/80 dark:text-emerald-400/80 mt-0.5">
              ✓ Chuẩn trần ≤ 20%
            </p>
          )}
        </div>

        {/* Hoàn thành tốt */}
        <div className="card p-3.5 border-l-4 border-l-blue-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-400">
              Tốt (HTTNV)
            </span>
            <CheckCircle2 size={14} className="text-blue-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-blue-700 dark:text-blue-300 font-mono">
              {thongKe?.tot || 0}
            </span>
            <span className="text-xs font-bold text-blue-600 font-mono">
              ({thongKe?.totTiLe || 0}%)
            </span>
          </div>
          <p className="text-[10px] text-ink-muted mt-0.5">Từ 70đ đến {'<'} 90đ</p>
        </div>

        {/* Hoàn thành nhiệm vụ */}
        <div className="card p-3.5 border-l-4 border-l-amber-500 flex flex-col justify-between">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-400">
              Hoàn thành (HTNV)
            </span>
            <FileText size={14} className="text-amber-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-amber-700 dark:text-amber-300 font-mono">
              {thongKe?.hoanThanh || 0}
            </span>
            <span className="text-xs font-bold text-amber-600 font-mono">
              ({thongKe?.hoanThanhTiLe || 0}%)
            </span>
          </div>
          <p className="text-[10px] text-ink-muted mt-0.5">Từ 50đ đến {'<'} 70đ</p>
        </div>

        {/* Không hoàn thành */}
        <div className="card p-3.5 border-l-4 border-l-rose-500 flex flex-col justify-between col-span-2 md:col-span-1">
          <div className="flex items-center justify-between text-ink-muted mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
              Không HT (KHTNV)
            </span>
            <AlertTriangle size={14} className="text-rose-600" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-xl font-black text-rose-700 dark:text-rose-300 font-mono">
              {thongKe?.khongHoanThanh || 0}
            </span>
            <span className="text-xs font-bold text-rose-600 font-mono">
              ({thongKe?.khongHoanThanhTiLe || 0}%)
            </span>
          </div>
          <p className="text-[10px] text-rose-600 font-semibold mt-0.5">
            {thongKe?.soBiKyLuat ? `⚠️ ${thongKe.soBiKyLuat} trường hợp kỷ luật` : '< 50đ hoặc kỷ luật'}
          </p>
        </div>
      </div>

      {/* ── Thanh Công cụ & Lọc ── */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 bg-surface p-3.5 rounded-xl border border-border">
        {/* Tìm kiếm */}
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={15} />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Tìm theo họ tên, chức danh, đơn vị..."
            className={cn(inputCls, 'pl-9 h-9 text-xs')}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink"
            >
              <X size={13} />
            </button>
          )}
        </div>

        {/* Lọc theo Đơn vị */}
        <div className="flex items-center gap-2">
          <Building2 size={15} className="text-ink-muted shrink-0" />
          <select
            value={selectedDonVi}
            onChange={(e) => setSelectedDonVi(e.target.value)}
            className={cn(inputCls, 'h-9 text-xs py-1 min-w-[180px]')}
          >
            <option value="all">Tất cả đơn vị ({donViList.length})</option>
            {donViList.map((dv) => (
              <option key={dv.id} value={dv.id}>
                {dv.tenVietTat || dv.ten}
              </option>
            ))}
          </select>
        </div>

        {/* Lọc theo Xếp loại */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal size={15} className="text-ink-muted shrink-0" />
          <select
            value={selectedXepLoai}
            onChange={(e) => setSelectedXepLoai(e.target.value)}
            className={cn(inputCls, 'h-9 text-xs py-1 min-w-[160px]')}
          >
            <option value="all">Tất cả mức xếp loại</option>
            <option value="hoan-thanh-xuat-sac">Xuất sắc (HTXSNV)</option>
            <option value="hoan-thanh-tot">Tốt (HTTNV)</option>
            <option value="hoan-thanh">Hoàn thành (HTNV)</option>
            <option value="khong-hoan-thanh">Không hoàn thành (KHTNV)</option>
          </select>
        </div>
      </div>

      {/* ── Bảng Dữ liệu Đánh giá Xếp loại CBVC ── */}
      <div className="card overflow-hidden">
        <DataState loading={loading} error={error} empty={danhGiaList.length === 0} />
        <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-subtle dark:bg-slate-900/60 border-b border-border-subtle dark:border-slate-700/70 text-[11px] font-bold text-ink-muted uppercase">
                <tr>
                  <th className="th-cell w-12 text-center">STT</th>
                  <th className="th-cell min-w-[200px]">Viên chức</th>
                  <th className="th-cell min-w-[160px]">Đơn vị & Chức vụ</th>
                  <th className="th-cell w-24 text-center">Kỳ đánh giá</th>
                  <th className="th-cell w-28 text-center" title="Tiêu chí chung tối đa 30 điểm">
                    Tiêu chí chung (30đ)
                  </th>
                  <th className="th-cell w-28 text-center" title="Kết quả thực hiện nhiệm vụ tối đa 70 điểm">
                    Nhiệm vụ (70đ)
                  </th>
                  <th className="th-cell w-24 text-center">Tổng điểm</th>
                  <th className="th-cell min-w-[170px] text-center">Mức xếp loại (NĐ 233)</th>
                  <th className="th-cell w-28 text-center">Trạng thái</th>
                  <th className="th-cell min-w-[140px]">Kỷ luật / Ghi chú</th>
                  <th className="th-cell w-20 text-center">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border-subtle dark:divide-slate-700/60">
                {danhGiaList && danhGiaList.length > 0 ? (
                  danhGiaList.map((item, idx) => {
                    const meta = danhGiaSvc.MUC_XEP_LOAI_META[item.xepLoai] || danhGiaSvc.MUC_XEP_LOAI_META['hoan-thanh-tot'];
                    const initial = item.hoVaTen.split(' ').pop()?.[0] || 'V';

                    return (
                      <tr
                        key={item.id}
                        onClick={() => openChiTiet(item)}
                        className={cn(
                          'cursor-pointer transition-colors',
                          isChiTietOpen && chiTietData?.id === item.id
                            ? 'bg-primary-subtle/50 dark:bg-primary-900/30 ring-1 ring-inset ring-primary/30'
                            : idx % 2 !== 0
                              ? 'bg-muted/40 dark:bg-white/[0.03]'
                              : 'bg-surface',
                          (!isChiTietOpen || chiTietData?.id !== item.id) && 'hover:bg-primary-subtle/30 dark:hover:bg-slate-800/60',
                        )}
                      >
                        {/* STT */}
                        <td className="td-cell text-center font-mono text-ink-muted">
                          {idx + 1}
                        </td>

                        {/* Viên chức */}
                        <td className="td-cell">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                              {initial}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-ink truncate">
                                {item.hocVi ? `${item.hocVi}. ` : ''}{item.hoVaTen}
                              </p>
                              <p className="text-[10px] text-ink-muted truncate">
                                Mã: NV-{item.nhanSuId.padStart(4, '0')}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Đơn vị & Chức vụ */}
                        <td className="td-cell">
                          <p className="font-semibold text-ink text-xs truncate">
                            {item.chucDanh || 'Viên chức'}
                          </p>
                          <p className="text-[10px] text-ink-secondary truncate">
                            {item.donViTenVietTat || item.donViTen || 'Cơ quan Viện'}
                          </p>
                        </td>

                        {/* Kỳ */}
                        <td className="td-cell text-center">
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-subtle text-ink-secondary">
                            {danhGiaSvc.KY_DANH_GIA_LABELS[item.ky] || item.ky}
                          </span>
                        </td>

                        {/* Điểm chung */}
                        <td className="td-cell text-center font-mono font-bold text-ink">
                          <span className="text-primary">{item.diemChung}</span>
                          <span className="text-[10px] text-ink-muted">/30</span>
                        </td>

                        {/* Điểm nhiệm vụ */}
                        <td className="td-cell text-center font-mono font-bold text-ink">
                          <span className="text-primary">{item.diemNhiemVu}</span>
                          <span className="text-[10px] text-ink-muted">/70</span>
                        </td>

                        {/* Tổng điểm */}
                        <td className="td-cell text-center">
                          <span
                            className={cn(
                              'font-mono font-black text-sm px-2 py-0.5 rounded',
                              item.tongDiem >= 90
                                ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : item.tongDiem >= 70
                                ? 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
                                : item.tongDiem >= 50
                                ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300'
                            )}
                          >
                            {item.tongDiem}
                          </span>
                        </td>

                        {/* Mức xếp loại */}
                        <td className="td-cell text-center">
                          <span
                            className={cn(
                              'inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border',
                              meta.badgeCls
                            )}
                          >
                            {meta.shortLabel}
                          </span>
                        </td>

                        {/* Trạng thái duyệt */}
                        <td className="td-cell text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={(e) => handleQuickToggleDuyet(e, item)}
                            className={cn(
                              'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold border transition-all cursor-pointer shadow-2xs',
                              item.trangThai === 'da-duyet'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-300 hover:bg-emerald-100 dark:bg-emerald-950/50 dark:text-emerald-300'
                                : item.trangThai === 'cho-duyet'
                                ? 'bg-amber-50 text-amber-700 border-amber-300 hover:bg-amber-100 dark:bg-amber-950/50 dark:text-amber-300'
                                : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100 dark:bg-slate-800 dark:text-slate-300'
                            )}
                            title="Bấm để chuyển đổi nhanh trạng thái Duyệt / Chờ duyệt"
                          >
                            <CheckCircle2 size={11} className={item.trangThai === 'da-duyet' ? 'text-emerald-600' : 'text-amber-500'} />
                            {item.trangThai === 'da-duyet' ? 'Đã duyệt' : item.trangThai === 'cho-duyet' ? 'Chờ duyệt' : 'Bản nháp'}
                          </button>
                        </td>

                        {/* Kỷ luật / Ghi chú */}
                        <td className="td-cell">
                          {item.biKyLuat ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-600 bg-rose-50 dark:bg-rose-950/50 px-2 py-0.5 rounded border border-rose-200">
                              <ShieldAlert size={12} /> {item.hinhThucKyLuat || 'Bị kỷ luật'}
                            </span>
                          ) : (
                            <p className="text-[11px] text-ink-muted line-clamp-1" title={item.nhanXet}>
                              {item.nhanXet || 'Không có vi phạm'}
                            </p>
                          )}
                        </td>

                        {/* Thao tác */}
                        <td className="td-cell text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => openEdit(item)}
                            className="p-1 rounded text-ink-muted hover:text-primary hover:bg-subtle transition-colors"
                            title="Sửa đánh giá"
                          >
                            <Pencil size={14} />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-ink-muted">
                      <FileSpreadsheet className="mx-auto h-8 w-8 mb-2 opacity-40" />
                      Không tìm thấy kết quả đánh giá nào cho bộ lọc hiện tại.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
      </div>
    </div>
  );
}
