import { useState } from 'react';
import {
  Building2,
  Clock,
  CheckCircle2,
  XCircle,
  LoaderCircle,
  FileText,
  UserCheck,
  Award,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import {
  khktTiepNhan,
  phanHoiDangKy,
  NHAN_TRANG_THAI_DANG_KY,
  MAU_TRANG_THAI_DANG_KY,
  type DangKyDauMoi,
  type TrangThaiDangKyDauMoi,
} from '../services/dangKyDauMoi';
import { formatNgay, cn } from '../lib/utils';
import { recordAuditLog } from '../services/auditLog';
import { LichSuPheDuyetTimeline } from './LichSuPheDuyetTimeline';

export function DangKyDauMoiChiTietPanel({
  item: initialItem,
  onRefetch,
}: {
  item: DangKyDauMoi;
  onRefetch?: () => void;
}) {
  const { vaiTro } = useAuth();
  const [item, setItem] = useState<DangKyDauMoi>(initialItem);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const coTheKhkt = vaiTro === 'quan-tri' || vaiTro === 'lanh-dao' || vaiTro === 'phong-khkt';
  const coTheLdv = vaiTro === 'quan-tri' || vaiTro === 'lanh-dao';

  const handleTiepNhan = async () => {
    setBusy(true);
    setError(null);
    try {
      await khktTiepNhan(item.id);
      setItem((prev) => ({ ...prev, trangThai: 'cho-ldv-chi-dao' as TrangThaiDangKyDauMoi }));
      recordAuditLog({
        loaiDoiTuong: 'dang_ky_dau_moi',
        doiTuongId: item.id,
        tuTrangThai: 'Đăng ký mới',
        denTrangThai: 'Chờ LĐV chỉ đạo',
        tenNguoiThucHien: 'Phòng KHKT (Phạm Kế Hoạch)',
        ghiChu: 'Phòng KHKT tiếp nhận thông tin đầu mối và trình Lãnh đạo Viện cho ý kiến chỉ đạo',
      });
      onRefetch?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleGiaoDauMoi = async () => {
    setBusy(true);
    setError(null);
    try {
      await phanHoiDangKy(item.id, 'giao-dau-moi');
      setItem((prev) => ({
        ...prev,
        trangThai: 'giao-dau-moi' as TrangThaiDangKyDauMoi,
        ngayPhanHoi: new Date().toISOString().slice(0, 10),
      }));
      recordAuditLog({
        loaiDoiTuong: 'dang_ky_dau_moi',
        doiTuongId: item.id,
        tuTrangThai: 'Chờ LĐV chỉ đạo',
        denTrangThai: 'Đã giao đầu mối',
        tenNguoiThucHien: 'Nguyễn Hồng Hải (Viện trưởng)',
        ghiChu: `Lãnh đạo Viện duyệt đồng ý giao cho ${item.donViDangKy || 'Đơn vị'} làm đầu mối chủ trì dự thầu`,
      });
      onRefetch?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  const handleKhongThamGia = async () => {
    const lyDo = prompt('Nhập lý do Lãnh đạo Viện chỉ đạo Không tham gia gói thầu này:');
    if (lyDo === null) return;
    setBusy(true);
    setError(null);
    try {
      await phanHoiDangKy(item.id, 'khong-tham-gia', lyDo);
      setItem((prev) => ({
        ...prev,
        trangThai: 'khong-tham-gia' as TrangThaiDangKyDauMoi,
        lyDoKhongThamGia: lyDo,
        ngayPhanHoi: new Date().toISOString().slice(0, 10),
      }));
      recordAuditLog({
        loaiDoiTuong: 'dang_ky_dau_moi',
        doiTuongId: item.id,
        tuTrangThai: 'Chờ LĐV chỉ đạo',
        denTrangThai: 'Không tham gia',
        tenNguoiThucHien: 'Nguyễn Hồng Hải (Viện trưởng)',
        ghiChu: `Lãnh đạo Viện chỉ đạo Không tham gia. Lý do: ${lyDo}`,
      });
      onRefetch?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="p-5 space-y-5 text-xs">
      {/* Header Info */}
      <div className="rounded-xl border border-border bg-subtle p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-ink-muted">Tên cơ hội thị trường</span>
            <h3 className="text-base font-bold text-ink mt-0.5 leading-snug">{item.tenCoHoi}</h3>
          </div>
          <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold', MAU_TRANG_THAI_DANG_KY[item.trangThai])}>
            {NHAN_TRANG_THAI_DANG_KY[item.trangThai]}
          </span>
        </div>
        {item.moTa && (
          <p className="text-xs text-ink-secondary pt-2 border-t border-border-subtle whitespace-pre-wrap">{item.moTa}</p>
        )}
      </div>

      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs font-semibold text-danger dark:border-red-900/40 dark:bg-red-900/10">
          {error}
        </div>
      )}

      {/* Tiến độ Quy trình 1 — Đăng ký đầu mối (Điều 5.1c) */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3.5 shadow-xs">
        <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <FileText size={14} className="text-primary" /> Tiến độ Quy trình 1 — Đăng ký đầu mối (Điều 5.1c)
        </h4>
        <div className="grid grid-cols-1 gap-2.5 text-xs">
          {/* Step 1 */}
          <div className={cn('flex items-start gap-3 p-3 rounded-lg border', item.nguoiPhatHien ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10' : 'border-border bg-muted/20')}>
            <div className={cn('p-2 rounded-full shrink-0', item.nguoiPhatHien ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-muted text-ink-muted')}>
              <Award size={14} />
            </div>
            <div>
              <p className="font-bold text-ink">B1. VCNLĐ phát hiện thông tin (Đ.5.1a)</p>
              <p className="text-2xs text-ink-muted mt-0.5">
                {item.nguoiPhatHien ? (
                  <>VCNLĐ cung cấp thông tin: <strong className="text-ink">{item.nguoiPhatHien}</strong> (được xét khen thưởng theo Đ.5.1a)</>
                ) : (
                  'Chưa ghi nhận cá nhân phát hiện'
                )}
              </p>
            </div>
          </div>

          {/* Step 2 */}
          <div className="flex items-start gap-3 p-3 rounded-lg border border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10">
            <div className="p-2 rounded-full shrink-0 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30">
              <Building2 size={14} />
            </div>
            <div>
              <p className="font-bold text-ink">B2. Đơn vị đăng ký làm Đầu mối với KHKT (Đ.5.1c)</p>
              <p className="text-2xs text-ink-muted mt-0.5">
                Đơn vị: <strong className="text-ink">{item.donViDangKy || '—'}</strong>
                {item.nguoiDangKy && <> · Người đăng ký: <strong className="text-ink">{item.nguoiDangKy}</strong></>}
                {item.ngayDangKy && <> · Ngày: {formatNgay(item.ngayDangKy)}</>}
              </p>
            </div>
          </div>

          {/* Step 3 */}
          <div className={cn('flex items-start gap-3 p-3 rounded-lg border', item.trangThai !== 'dang-ky' ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10' : 'border-amber-300 bg-amber-50/50 dark:bg-amber-900/10')}>
            <div className={cn('p-2 rounded-full shrink-0', item.trangThai !== 'dang-ky' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30')}>
              <Clock size={14} />
            </div>
            <div>
              <p className="font-bold text-ink">B3. Phòng KHKT tiếp nhận & Báo cáo Lãnh đạo Viện (Đ.5.1c)</p>
              <p className="text-2xs text-ink-muted mt-0.5">
                {item.trangThai === 'dang-ky' ? 'Đang chờ Phòng KHKT tiếp nhận & báo cáo Lãnh đạo Viện' : 'Phòng KHKT đã tiếp nhận và trình Lãnh đạo Viện chỉ đạo'}
              </p>
            </div>
          </div>

          {/* Step 4 */}
          <div className={cn('flex items-start gap-3 p-3 rounded-lg border', item.trangThai === 'giao-dau-moi' ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10' : item.trangThai === 'khong-tham-gia' ? 'border-red-200 bg-red-50/40 dark:bg-red-900/10' : 'border-border bg-muted/20')}>
            <div className={cn('p-2 rounded-full shrink-0', item.trangThai === 'giao-dau-moi' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30' : item.trangThai === 'khong-tham-gia' ? 'bg-red-100 text-danger dark:bg-red-900/30' : 'bg-muted text-ink-muted')}>
              <UserCheck size={14} />
            </div>
            <div>
              <p className="font-bold text-ink">B4. Lãnh đạo Viện cho ý kiến & KHKT phản hồi (Đ.5.1c)</p>
              <p className="text-2xs text-ink-muted mt-0.5">
                {item.trangThai === 'giao-dau-moi' && (
                  <span className="text-emerald-700 dark:text-emerald-300 font-semibold">Đã đồng ý giao Đơn vị đầu mối tham gia dự thầu (Phản hồi {item.ngayPhanHoi ? formatNgay(item.ngayPhanHoi) : '—'})</span>
                )}
                {item.trangThai === 'khong-tham-gia' && (
                  <span className="text-danger font-semibold">Lãnh đạo Viện chỉ đạo Không tham gia</span>
                )}
                {item.trangThai !== 'giao-dau-moi' && item.trangThai !== 'khong-tham-gia' && 'Đang chờ ý kiến chỉ đạo của Lãnh đạo Viện'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {item.trangThai === 'khong-tham-gia' && item.lyDoKhongThamGia && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs dark:border-red-900/40 dark:bg-red-900/10">
          <span className="font-bold text-danger flex items-center gap-1.5 mb-1">
            <AlertCircle size={14} /> Lý do không tham gia (từ Lãnh đạo Viện / KHKT):
          </span>
          <p className="text-ink-secondary">{item.lyDoKhongThamGia}</p>
        </div>
      )}

      {/* Nhật ký Phê duyệt & Lịch sử Chuyển trạng thái */}
      <LichSuPheDuyetTimeline loaiDoiTuong="dang_ky_dau_moi" doiTuongId={item.id} />

      {/* Interactive Action Buttons */}
      <div className="pt-2 border-t border-border-subtle flex flex-wrap items-center gap-2">
        {item.trangThai === 'dang-ky' && coTheKhkt && (
          <button
            onClick={handleTiepNhan}
            disabled={busy}
            className="btn-primary text-xs flex items-center gap-1.5 w-full justify-center py-2.5"
          >
            {busy ? <LoaderCircle size={14} className="animate-spin" /> : <Clock size={14} />} KHKT Tiếp nhận & Báo cáo Lãnh đạo Viện
          </button>
        )}
        {item.trangThai === 'cho-ldv-chi-dao' && coTheLdv && (
          <div className="grid grid-cols-2 gap-2 w-full">
            <button
              onClick={handleGiaoDauMoi}
              disabled={busy}
              className="rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-emerald-700 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <CheckCircle2 size={14} />} Giao đầu mối
            </button>
            <button
              onClick={handleKhongThamGia}
              disabled={busy}
              className="rounded-xl bg-red-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-red-700 disabled:opacity-60 flex items-center justify-center gap-1.5"
            >
              {busy ? <LoaderCircle size={14} className="animate-spin" /> : <XCircle size={14} />} Không tham gia
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
