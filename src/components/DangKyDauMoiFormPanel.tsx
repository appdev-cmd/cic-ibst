import { useState, useMemo } from 'react';
import { Plus, Building2, Calendar, Users2, Award, FileText, LoaderCircle, AlertCircle, CheckCircle2 } from 'lucide-react';
import { Field, inputCls } from './Modal';
import { useSlidePanel } from '../context/SlidePanelContext';
import { createDangKyDauMoi, type DangKyDauMoiInput } from '../services/dangKyDauMoi';
import type { Option } from '../services/queries';

interface FormState extends DangKyDauMoiInput {
  chuDauTuId: string;
  chuDauTuKhac: string;
}

const EMPTY_FORM_STATE: FormState = {
  tenCoHoi: '',
  moTa: '',
  nguoiPhatHienId: '',
  donViDangKyId: '',
  nguoiDangKyId: '',
  ngayDangKy: new Date().toISOString().slice(0, 10),
  chuDauTuId: '',
  chuDauTuKhac: '',
};

export function DangKyDauMoiFormPanel({
  donViOptions,
  nhanSuOptions,
  khachHangOptions = [],
  onDone,
}: {
  donViOptions: Option[];
  nhanSuOptions: Option[];
  khachHangOptions?: Option[];
  onDone?: () => void;
}) {
  const { closePanel } = useSlidePanel();
  const [form, setForm] = useState<FormState>(EMPTY_FORM_STATE);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const filteredNhanSuOptions = useMemo(() => {
    if (!form.donViDangKyId) return nhanSuOptions;
    return nhanSuOptions.filter(
      (n) => !n.donViId || n.donViId === form.donViDangKyId || n.donViId === '11',
    );
  }, [form.donViDangKyId, nhanSuOptions]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.tenCoHoi.trim()) {
      setError('Vui lòng nhập Tên cơ hội / dự án / gói thầu');
      return;
    }
    if (!form.donViDangKyId) {
      setError('Vui lòng chọn Đơn vị đăng ký đầu mối');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      // Tổng hợp thông tin Chủ đầu tư vào mô tả nếu có
      let moTaFinal = form.moTa.trim();
      const selectedCdt = khachHangOptions.find((k) => k.id === form.chuDauTuId);
      const cdtTen = selectedCdt ? selectedCdt.ten : form.chuDauTuKhac.trim();
      if (cdtTen && !moTaFinal.includes('Chủ đầu tư:')) {
        moTaFinal = `Chủ đầu tư: ${cdtTen}${moTaFinal ? `\n${moTaFinal}` : ''}`;
      }

      await createDangKyDauMoi({
        tenCoHoi: form.tenCoHoi,
        moTa: moTaFinal,
        nguoiPhatHienId: form.nguoiPhatHienId,
        donViDangKyId: form.donViDangKyId,
        nguoiDangKyId: form.nguoiDangKyId,
        ngayDangKy: form.ngayDangKy,
      });
      onDone?.();
      closePanel();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-4 space-y-5">
      {/* Banner hướng dẫn QC 2815 */}
      <div className="rounded-xl border border-primary-200 bg-primary-50/50 p-3.5 text-xs text-primary-900 dark:border-primary-900/40 dark:bg-primary-900/10 dark:text-primary-300 space-y-1">
        <p className="font-bold flex items-center gap-1.5 text-primary-700 dark:text-primary-300">
          <FileText size={14} /> Quy trình 1 — Đăng ký đầu mối dự thầu (Điều 5.1c QC 2815)
        </p>
        <p className="text-2xs text-ink-secondary leading-relaxed">
          Mỗi cơ hội/dự án dự thầu cần đăng ký đầu mối trước khi phát hành HSDT nhằm tránh việc nhiều đơn vị thuộc Viện cùng cạnh tranh 1 gói thầu. Sau khi gửi, thông tin sẽ được chuyển đến Phòng KHKT tiếp nhận & báo cáo Lãnh đạo Viện chỉ đạo.
        </p>
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-semibold text-danger dark:border-red-900/40 dark:bg-red-900/10">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 text-xs">
        <Field label="Tên cơ hội / dự án / gói thầu" required>
          <input
            className={inputCls}
            required
            value={form.tenCoHoi}
            onChange={(e) => setForm({ ...form, tenCoHoi: e.target.value })}
            placeholder="VD: [TEST] Khảo sát & Đánh giá chất lượng công trình XYZ"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Chủ đầu tư / Đối tác (từ CRM)">
            <select
              className={inputCls}
              value={form.chuDauTuId}
              onChange={(e) => setForm({ ...form, chuDauTuId: e.target.value, chuDauTuKhac: '' })}
            >
              <option value="">-- Chọn Chủ đầu tư có sẵn --</option>
              {khachHangOptions.map((k) => (
                <option key={k.id} value={k.id}>{k.ten}</option>
              ))}
            </select>
          </Field>
          <Field label="Hoặc nhập tên Chủ đầu tư mới">
            <input
              className={inputCls}
              value={form.chuDauTuKhac}
              onChange={(e) => setForm({ ...form, chuDauTuKhac: e.target.value, chuDauTuId: '' })}
              placeholder="VD: Sở Xây dựng TP.HCM, ACV..."
            />
          </Field>
        </div>

        <Field label="Mô tả / Thông tin thị trường phát hiện">
          <textarea
            className={inputCls}
            rows={3}
            value={form.moTa}
            onChange={(e) => setForm({ ...form, moTa: e.target.value })}
            placeholder="Nhập thông tin chi tiết về quy mô gói thầu, thời điểm HSMT dự kiến..."
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field label="Đơn vị đăng ký đầu mối (Đ.5.1b)" required>
            <select
              className={inputCls}
              required
              value={form.donViDangKyId}
              onChange={(e) => {
                const newDonViId = e.target.value;
                setForm({
                  ...form,
                  donViDangKyId: newDonViId,
                  // Reset nếu nhân sự được chọn trước đó không thuộc đơn vị mới
                  nguoiPhatHienId: '',
                  nguoiDangKyId: '',
                });
              }}
            >
              <option value="">-- Chọn đơn vị --</option>
              {donViOptions.map((d) => (
                <option key={d.id} value={d.id}>{d.ten}</option>
              ))}
            </select>
          </Field>

          <Field label="Ngày đăng ký">
            <input
              type="date"
              className={inputCls}
              value={form.ngayDangKy}
              onChange={(e) => setForm({ ...form, ngayDangKy: e.target.value })}
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Field label="VCNLĐ phát hiện cơ hội (Đ.5.1a - Khen thưởng)">
            <select
              className={inputCls}
              value={form.nguoiPhatHienId}
              onChange={(e) => setForm({ ...form, nguoiPhatHienId: e.target.value })}
            >
              <option value="">-- Chọn nhân sự {form.donViDangKyId ? 'thuộc đơn vị' : ''} --</option>
              {filteredNhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
          </Field>

          <Field label="Người đại diện đăng ký (GĐ/PGĐ/Trưởng phòng)">
            <select
              className={inputCls}
              value={form.nguoiDangKyId}
              onChange={(e) => setForm({ ...form, nguoiDangKyId: e.target.value })}
            >
              <option value="">-- Chọn nhân sự {form.donViDangKyId ? 'thuộc đơn vị' : ''} --</option>
              {filteredNhanSuOptions.map((n) => (
                <option key={n.id} value={n.id}>{n.ten}</option>
              ))}
            </select>
          </Field>
        </div>

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
            Đăng ký đầu mối
          </button>
        </div>
      </form>
    </div>
  );
}
