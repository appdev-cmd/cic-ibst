import { useState, useMemo } from 'react';
import { Plus, Gavel, Building2, Calendar, FileText, LoaderCircle, CheckCircle2, Award, UserCheck, Link2 } from 'lucide-react';
import { Field, inputCls } from './Modal';
import { useSlidePanel } from '../context/SlidePanelContext';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchDangKyDauMoi, type DangKyDauMoi } from '../services/dangKyDauMoi';
import type { DauThauInput } from '../services/workflow';
import type { Option } from '../services/queries';
import type { HinhThucDauThau, TrangThaiDauThau } from '../types';

const HINH_THUC_LABEL: Record<string, string> = {
  'dau-thau-rong-rai': 'Đấu thầu rộng rãi',
  'dau-thau-han-che': 'Đấu thầu hạn chế',
  'chi-dinh-thau': 'Chỉ định thầu',
  'chao-gia': 'Chào giá cạnh tranh',
  'mua-sam-truc-tiep': 'Mua sắm trực tiếp',
  'tu-thuc-hien': 'Tự thực hiện',
  'khac': 'Khác',
};

const TRANG_THAI_OPTIONS: { value: string; label: string }[] = [
  { value: 'chuan-bi', label: 'Chuẩn bị HS' },
  { value: 'da-nop', label: 'Đã nộp HS' },
  { value: 'trung-thau', label: 'Trúng thầu' },
  { value: 'truot', label: 'Trượt thầu' },
  { value: 'huy', label: 'Hủy' },
];

export function GoiThauFormPanel({
  editing = false,
  initialForm,
  khachHangOptions = [],
  donViOptions = [],
  nhanSuOptions = [],
  onSubmit,
  onDone,
}: {
  editing?: boolean;
  initialForm: DauThauInput;
  khachHangOptions?: Option[];
  donViOptions?: Option[];
  nhanSuOptions?: Option[];
  onSubmit: (form: DauThauInput) => Promise<void>;
  onDone?: () => void;
}) {
  const { closePanel } = useSlidePanel();
  const { data: dauMoiList } = useAsyncData(fetchDangKyDauMoi, []);
  const [form, setForm] = useState<DauThauInput>(initialForm);
  const [selectedDauMoiId, setSelectedDauMoiId] = useState<string>(initialForm.dangKyDauMoiId || '');
  const [autoFilledMsg, setAutoFilledMsg] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Lọc cơ hội đã được Lãnh đạo Viện phê duyệt giao đầu mối
  const approvedDauMoiOptions = useMemo(() => {
    return (dauMoiList || []).filter((d) => d.trangThai === 'giao-dau-moi');
  }, [dauMoiList]);

  const handleSelectDauMoi = (dauMoiId: string) => {
    setSelectedDauMoiId(dauMoiId);
    if (!dauMoiId) {
      setAutoFilledMsg(null);
      return;
    }

    const target = (dauMoiList || []).find((d) => d.id === dauMoiId);
    if (!target) return;

    // Tự động tìm Chủ đầu tư khớp tên trong khachHangOptions hoặc mô tả
    let matchedCdtId = form.chuDauTuId;
    if (target.moTa || target.tenCoHoi) {
      const foundCdt = khachHangOptions.find((k) =>
        target.moTa.toLowerCase().includes(k.ten.toLowerCase()) ||
        target.tenCoHoi.toLowerCase().includes(k.ten.toLowerCase()) ||
        (k.ten.includes('ACV') && target.tenCoHoi.includes('Nội Bài'))
      );
      if (foundCdt) matchedCdtId = foundCdt.id;
    }

    setForm((prev) => ({
      ...prev,
      dangKyDauMoiId: dauMoiId,
      tenGoiThau: target.tenCoHoi,
      donViThucHienId: target.donViDangKyId || prev.donViThucHienId,
      nguoiPhuTrachId: target.nguoiDangKyId || target.nguoiPhatHienId || prev.nguoiPhuTrachId,
      chuTriHsdtId: target.nguoiPhatHienId || target.nguoiDangKyId || prev.chuTriHsdtId,
      chuDauTuId: matchedCdtId,
    }));

    setAutoFilledMsg(
      `Đã tự động điền Tên gói thầu, Chủ đầu tư & Đơn vị thực hiện từ Cơ hội Đăng ký đầu mối: "${target.tenCoHoi}"`
    );
  };

  const filteredNhanSuOptions = useMemo(() => {
    if (!form.donViThucHienId) return nhanSuOptions;
    return nhanSuOptions.filter(
      (n) => !n.donViId || n.donViId === form.donViThucHienId || n.donViId === '11',
    );
  }, [form.donViThucHienId, nhanSuOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenGoiThau.trim()) {
      setError('Vui lòng nhập Tên gói thầu');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await onSubmit(form);
      onDone?.();
      closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5 space-y-5">
      {/* Banner Quy chế 2815 Đ.5.1d & 9.6g */}
      <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-4 text-xs text-primary-900 dark:border-primary-900/40 dark:bg-primary-900/10 dark:text-primary-300 space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-primary-700 dark:text-primary-300 text-sm">
          <Gavel size={16} /> Quy trình 1 — Lập HSDT & Quản lý Đấu thầu (Điều 5.1d & 9.6g QC 2815)
        </p>
        <p className="text-2xs text-ink-secondary leading-relaxed">
          Giám đốc Đơn vị được giao đầu mối chỉ định Cán bộ <strong>Chủ trì lập HSDT</strong> (Đ.5.1d). Phòng KHKT quản lý Chữ ký số và Hồ sơ năng lực chung Viện; Phòng TCKT cấp BCTC; Phòng TCHC xác nhận Chứng chỉ hành nghề & Hồ sơ nhân sự dự thầu (Đ.9.6g).
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-danger dark:border-red-900/40 dark:bg-red-900/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        {/* Trường chọn Cơ hội Đăng ký đầu mối liên kết */}
        <div className="rounded-xl border border-blue-200 bg-blue-50/60 p-3.5 dark:border-blue-900/40 dark:bg-blue-900/10 space-y-2">
          <Field label="🔗 Chọn từ Cơ hội Đăng ký đầu mối (QC 2815 Đ.5.1c)">
            <select
              className={inputCls}
              value={selectedDauMoiId}
              onChange={(e) => handleSelectDauMoi(e.target.value)}
            >
              <option value="">-- Chọn Cơ hội Đăng ký đầu mối đã được Lãnh đạo Viện duyệt giao --</option>
              {approvedDauMoiOptions.map((d) => (
                <option key={d.id} value={d.id}>
                  [Đã giao đầu mối] {d.tenCoHoi} ({d.donViDangKy || 'Chưa phân ĐV'})
                </option>
              ))}
            </select>
          </Field>
          {autoFilledMsg && (
            <p className="text-2xs font-semibold text-emerald-700 dark:text-emerald-300 flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 size={13} /> {autoFilledMsg}
            </p>
          )}
        </div>

        <Field label="Tên gói thầu *" required>
          <input
            className={inputCls}
            required
            value={form.tenGoiThau}
            onChange={(e) => setForm({ ...form, tenGoiThau: e.target.value })}
            placeholder="VD: [TEST-FULL] Gói thầu TV01: Khảo sát & Kiểm định công trình XYZ"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Chủ đầu tư / Khách hàng (Bên A)">
            <select
              className={inputCls}
              value={form.chuDauTuId}
              onChange={(e) => setForm({ ...form, chuDauTuId: e.target.value })}
            >
              <option value="">-- Chọn chủ đầu tư --</option>
              {khachHangOptions.map((k) => (
                <option key={k.id} value={k.id}>{k.ten}</option>
              ))}
            </select>
          </Field>

          <Field label="Đơn vị thực hiện / Chủ trì HSDT">
            <select
              className={inputCls}
              value={form.donViThucHienId}
              onChange={(e) => {
                const newDonViId = e.target.value;
                setForm({
                  ...form,
                  donViThucHienId: newDonViId,
                  nguoiPhuTrachId: '',
                  chuTriHsdtId: '',
                });
              }}
            >
              <option value="">-- Chọn đơn vị --</option>
              {donViOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.ten}</option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Field label="Hình thức lựa chọn nhà thầu">
            <select
              className={inputCls}
              value={form.hinhThuc}
              onChange={(e) => setForm({ ...form, hinhThuc: e.target.value })}
            >
              {Object.entries(HINH_THUC_LABEL).map(([val, lbl]) => (
                <option key={val} value={val}>{lbl}</option>
              ))}
            </select>
          </Field>

          <Field label="Giá dự thầu (Triệu VNĐ)">
            <input
              type="number"
              className={inputCls}
              value={form.giaDuThau}
              onChange={(e) => setForm({ ...form, giaDuThau: e.target.value })}
              placeholder="VD: 4800"
            />
          </Field>

          <Field label="Trạng thái thầu">
            <select
              className={inputCls}
              value={form.trangThai}
              onChange={(e) => setForm({ ...form, trangThai: e.target.value })}
            >
              {TRANG_THAI_OPTIONS.map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </Field>
        </div>

        {form.trangThai === 'trung-thau' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-emerald-50/50 dark:bg-emerald-900/10 p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
            <Field label="Giá trúng thầu chính thức (Triệu VNĐ)">
              <input
                type="number"
                className={inputCls}
                value={form.giaTrungThau}
                onChange={(e) => setForm({ ...form, giaTrungThau: e.target.value })}
                placeholder="VD: 4650"
              />
            </Field>
            <div className="flex items-center text-2xs text-emerald-800 dark:text-emerald-300 font-semibold pt-4">
              ✓ Giá trúng thầu là cơ sở trích nộp tài chính Viện 13% khi ký kết HĐKT (Điều 12).
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Ngày mở thầu">
            <input
              type="date"
              className={inputCls}
              value={form.ngayMoThau}
              onChange={(e) => setForm({ ...form, ngayMoThau: e.target.value })}
            />
          </Field>

          <Field label="Người phụ trách chung gói thầu">
            <select
              className={inputCls}
              value={form.nguoiPhuTrachId}
              onChange={(e) => setForm({ ...form, nguoiPhuTrachId: e.target.value })}
            >
              <option value="">-- Chọn nhân sự {form.donViThucHienId ? 'thuộc đơn vị' : ''} --</option>
              {filteredNhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Chủ trì lập HSDT (Điều 5.1d — Do GĐ Đơn vị chỉ định)">
          <select
            className={inputCls}
            value={form.chuTriHsdtId}
            onChange={(e) => setForm({ ...form, chuTriHsdtId: e.target.value })}
          >
            <option value="">-- Chọn cán bộ Chủ trì lập HSDT --</option>
            {filteredNhanSuOptions.map((n) => (
              <option key={n.id} value={n.id}>{n.ten}</option>
            ))}
          </select>
        </Field>

        {/* Checklist 3/3 loại Hồ sơ năng lực (Đ.5.1d, 9.6g) */}
        <div className="rounded-xl border border-border bg-subtle p-4 space-y-2.5">
          <p className="font-bold text-ink uppercase tracking-wider text-2xs flex items-center gap-1.5">
            <UserCheck size={14} className="text-primary" /> Checklist Hồ sơ năng lực dự thầu (Điều 5.1d & 9.6g QC 2815)
          </p>

          <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-ink">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-border"
              checked={form.hsNangLucChung}
              onChange={(e) => setForm({ ...form, hsNangLucChung: e.target.checked })}
            />
            <div>
              <span className="font-bold">1. HS năng lực chung của Viện + Chữ ký số dự thầu qua mạng</span>
              <p className="text-2xs text-ink-muted">Phòng KHKT tổng hợp & quản lý chữ ký số dự thầu Viện (Điều 9.6g)</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-ink">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-border"
              checked={form.bcTaiChinh}
              onChange={(e) => setForm({ ...form, bcTaiChinh: e.target.checked })}
            />
            <div>
              <span className="font-bold">2. Báo cáo tài chính (03 năm gần nhất)</span>
              <p className="text-2xs text-ink-muted">Phòng TCKT kiểm tra & cung cấp cho gói thầu dự thầu</p>
            </div>
          </label>

          <label className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-muted/60 transition-colors cursor-pointer text-ink">
            <input
              type="checkbox"
              className="mt-0.5 rounded border-border"
              checked={form.ccnnDuThau}
              onChange={(e) => setForm({ ...form, ccnnDuThau: e.target.checked })}
            />
            <div>
              <span className="font-bold">3. Chứng chỉ năng lực / hành nghề + Hồ sơ nhân sự</span>
              <p className="text-2xs text-ink-muted">Phòng TCHC thẩm định & xác nhận cho cán bộ tham gia HSDT</p>
            </div>
          </label>
        </div>

        <Field label="Ghi chú thêm">
          <textarea
            className={inputCls}
            rows={2}
            value={form.ghiChu}
            onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
            placeholder="Ghi chú về thời điểm nộp thầu, bảo lãnh dự thầu, kết quả..."
          />
        </Field>

        <div className="flex items-center justify-end gap-2 border-t border-border-subtle pt-4 mt-6">
          <button
            type="button"
            onClick={() => closePanel()}
            className="rounded-xl border border-border px-4 py-2.5 text-xs font-bold text-ink-secondary hover:bg-muted"
          >
            Hủy
          </button>
          <button
            type="submit"
            disabled={saving}
            className="btn-primary text-xs flex items-center gap-1.5 px-5 py-2.5 disabled:opacity-60"
          >
            {saving ? <LoaderCircle size={14} className="animate-spin" /> : <Plus size={14} />}
            {editing ? 'Cập nhật gói thầu' : 'Lưu gói thầu mới'}
          </button>
        </div>
      </form>
    </div>
  );
}
