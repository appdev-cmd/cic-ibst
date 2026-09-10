import { useState, useEffect, useMemo } from 'react';
import { LoaderCircle } from 'lucide-react';
import { Field, inputCls } from './Modal';
import { cn } from '../lib/utils';
import { type DonViInput, LOAI_DON_VI, createDonVi, updateDonVi } from '../services/org';
import type { DonVi, NhanSu, LoaiDonVi } from '../types';

export interface DonViFormPanelProps {
  editing: DonVi | null;
  nhanSuList: NhanSu[];
  onSaved: () => void;
  onClose: () => void;
}

const EMPTY_FORM: DonViInput = {
  ten: '',
  tenVietTat: '',
  maDinhDanh: '',
  loai: 'trung-tam',
  chucNangNhiemVu: '',
  diaChiChiTiet: '',
  dienThoai: '',
  email: '',
  website: '',
  ghiChu: '',
  phuTrachId: '',
  truongDonViId: '',
  keHoachNam: null,
  keHoachNamTruoc: null,
  ghiChuKeHoach: '',
};

export function DonViFormPanel({
  editing,
  nhanSuList,
  onSaved,
  onClose,
}: DonViFormPanelProps) {
  const [form, setForm] = useState<DonViInput>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (editing) {
      setForm({
        ten: editing.ten,
        tenVietTat: editing.tenVietTat ?? '',
        maDinhDanh: editing.maDinhDanh ?? '',
        loai: editing.loai,
        chucNangNhiemVu: editing.chucNangNhiemVu ?? '',
        diaChiChiTiet: editing.diaChiChiTiet ?? '',
        dienThoai: editing.dienThoai ?? '',
        email: editing.email ?? '',
        website: editing.website ?? '',
        ghiChu: editing.ghiChu ?? '',
        phuTrachId: editing.phuTrachId ?? '',
        truongDonViId: editing.truongDonViId ?? '',
        keHoachNam: editing.keHoachNam ?? null,
        keHoachNamTruoc: editing.keHoachNamTruoc ?? null,
        ghiChuKeHoach: editing.ghiChuKeHoach ?? '',
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setError(null);
  }, [editing]);

  // Lọc Lãnh đạo Viện
  const lanhDaoList = useMemo(() => {
    return nhanSuList.filter(
      (ns) => ns.chucDanh === 'Viện trưởng' || ns.chucDanh === 'Phó Viện trưởng'
    );
  }, [nhanSuList]);

  // Lọc danh sách ứng viên Trưởng ĐV
  const candidatesForTruongDonVi = useMemo(() => {
    if (editing && editing.id) {
      return nhanSuList.filter((ns) => ns.donViId === editing.id);
    }
    return nhanSuList;
  }, [editing, nhanSuList]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError(null);
    try {
      if (editing) {
        await updateDonVi(editing.id, form);
      } else {
        await createDonVi(form);
      }
      onSaved();
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-5">
      <form onSubmit={handleSubmit} className="space-y-4">
        <Field label="Tên đơn vị" required>
          <input
            className={inputCls}
            required
            maxLength={150}
            value={form.ten}
            onChange={(e) => setForm({ ...form, ten: e.target.value })}
            placeholder="VD: Trung tâm Tư vấn và Ứng dụng BIM trong xây dựng"
          />
        </Field>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Tên viết tắt">
            <input
              className={inputCls}
              maxLength={50}
              value={form.tenVietTat}
              onChange={(e) => setForm({ ...form, tenVietTat: e.target.value })}
              placeholder="VD: TTCSS"
            />
          </Field>
          <Field label="Mã định danh (QĐ 942 BXD)">
            <input
              className={inputCls}
              maxLength={20}
              value={form.maDinhDanh ?? ''}
              onChange={(e) => setForm({ ...form, maDinhDanh: e.target.value })}
              placeholder="VD: IBST-CSS"
            />
          </Field>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Loại đơn vị" required>
            <select
              className={inputCls}
              value={form.loai}
              onChange={(e) => setForm({ ...form, loai: e.target.value as LoaiDonVi })}
            >
              {LOAI_DON_VI.map((l) => (
                <option key={l.ma} value={l.ma}>
                  {l.ten}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Field label="Lãnh đạo Viện phụ trách">
            <select
              className={inputCls}
              value={form.phuTrachId}
              onChange={(e) => setForm({ ...form, phuTrachId: e.target.value })}
            >
              <option value="">— Chưa phân công —</option>
              {lanhDaoList.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.chucDanh} — {ns.hoTen}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Trưởng đơn vị (Giám đốc / Trưởng phòng)">
            <select
              className={inputCls}
              value={form.truongDonViId ?? ''}
              onChange={(e) => setForm({ ...form, truongDonViId: e.target.value })}
            >
              <option value="">— Chưa chỉ định / Chờ kiện toàn —</option>
              {candidatesForTruongDonVi.map((ns) => (
                <option key={ns.id} value={ns.id}>
                  {ns.hocVi ? `${ns.hocVi}. ` : ''}{ns.hoTen} ({ns.chucDanh || 'Cán bộ'})
                </option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Chức năng nhiệm vụ">
          <textarea
            className={cn(inputCls, 'min-h-24 resize-y')}
            value={form.chucNangNhiemVu}
            onChange={(e) => setForm({ ...form, chucNangNhiemVu: e.target.value })}
            placeholder="Mô tả chức năng, nhiệm vụ chính của đơn vị..."
          />
        </Field>

        {/* Khối Thông tin Liên hệ & Trụ sở */}
        <div className="rounded-xl border border-border dark:border-slate-700/80 p-4 bg-subtle/20 space-y-4">
          <div className="flex items-center justify-between border-b border-border dark:border-slate-700/80 pb-2">
            <h4 className="text-[13px] font-black text-ink">Thông tin liên hệ & Trụ sở</h4>
          </div>

          <Field label="Địa chỉ trụ sở / Văn phòng">
            <input
              className={inputCls}
              maxLength={255}
              value={form.diaChiChiTiet ?? ''}
              onChange={(e) => setForm({ ...form, diaChiChiTiet: e.target.value })}
              placeholder="VD: 81 Trần Cung, P. Nghĩa Tân, Q. Cầu Giấy, Hà Nội"
            />
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Điện thoại">
              <input
                className={inputCls}
                maxLength={130}
                value={form.dienThoai}
                onChange={(e) => setForm({ ...form, dienThoai: e.target.value })}
                placeholder="VD: 024.3754.4374"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                className={inputCls}
                maxLength={150}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="VD: vienchuyenganh@ibst.vn"
              />
            </Field>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Website">
              <input
                className={inputCls}
                maxLength={200}
                value={form.website ?? ''}
                onChange={(e) => setForm({ ...form, website: e.target.value })}
                placeholder="VD: https://ibst.vn hoặc https://ibst-am.com.vn"
              />
            </Field>
            <Field label="Ghi chú / Fax / Khác">
              <input
                className={inputCls}
                maxLength={255}
                value={form.ghiChu ?? ''}
                onChange={(e) => setForm({ ...form, ghiChu: e.target.value })}
                placeholder="VD: Fax: 024.3836.1104 hoặc P.305 Nhà A1"
              />
            </Field>
          </div>
        </div>

        {/* Khối Chỉ tiêu Kế hoạch Năm & Giao khoán */}
        <div className="rounded-xl border border-border dark:border-slate-700/80 p-4 bg-subtle/30 space-y-4">
          <div className="flex items-center justify-between border-b border-border dark:border-slate-700/80 pb-2">
            <h4 className="text-[13px] font-black text-ink">Chỉ tiêu Kế hoạch Ký HĐKT & Giao khoán</h4>
            <span className="text-3xs font-bold text-ink-muted uppercase">Đơn vị: Nghìn đồng</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Field label="Đăng ký KH cả năm 2026 (Nghìn đồng)">
              <div className="space-y-1">
                <input
                  type="number"
                  className={inputCls}
                  value={form.keHoachNam ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      keHoachNam: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Ví dụ: 70000000"
                />
                {form.keHoachNam != null && form.keHoachNam > 0 && (
                  <p className="text-2xs font-bold text-primary-600 dark:text-primary-400">
                    ≈ {(form.keHoachNam / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} tỷ VNĐ
                  </p>
                )}
              </div>
            </Field>

            <Field label="Thực hiện cùng kỳ năm 2025 (Nghìn đồng)">
              <div className="space-y-1">
                <input
                  type="number"
                  className={inputCls}
                  value={form.keHoachNamTruoc ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      keHoachNamTruoc: e.target.value ? Number(e.target.value) : null,
                    })
                  }
                  placeholder="Ví dụ: 67747280"
                />
                {form.keHoachNamTruoc != null && form.keHoachNamTruoc > 0 && (
                  <p className="text-2xs font-bold text-ink-secondary">
                    ≈ {(form.keHoachNamTruoc / 1000000).toLocaleString('vi-VN', { maximumFractionDigits: 3 })} tỷ VNĐ
                  </p>
                )}
              </div>
            </Field>
          </div>

          <Field label="Ghi chú Kế hoạch giao khoán">
            <input
              type="text"
              className={inputCls}
              value={form.ghiChuKeHoach ?? ''}
              onChange={(e) => setForm({ ...form, ghiChuKeHoach: e.target.value })}
              placeholder="Ví dụ: Gộp KH của BIM và TTMTay, hoặc PVMT cũ không giao KH..."
            />
          </Field>
        </div>

        {error && (
          <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-danger dark:border-red-800 dark:bg-red-900/20 dark:text-red-400 mt-4">
            {error}
          </p>
        )}

        <div className="mt-6 flex justify-end gap-2 border-t border-border-subtle pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted dark:border-slate-700/80 dark:hover:bg-slate-800/40"
          >
            Hủy
          </button>
          <button type="submit" disabled={saving} className="btn-primary flex items-center gap-2 disabled:opacity-60">
            {saving && <LoaderCircle size={15} className="animate-spin" />}
            {editing ? 'Lưu thay đổi' : 'Thêm đơn vị'}
          </button>
        </div>
      </form>
    </div>
  );
}
