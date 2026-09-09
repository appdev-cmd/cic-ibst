import { useState } from 'react';
import {
  Gavel,
  Building2,
  Calendar,
  DollarSign,
  UserCheck,
  FileCheck,
  CheckCircle2,
  XCircle,
  Clock,
  Pencil,
  FileText,
  ShieldCheck,
  Award,
} from 'lucide-react';
import type { DauThau, TrangThaiDauThau, HinhThucDauThau } from '../types';
import { formatNgay, formatTrieu, cn } from '../lib/utils';
import { updateTrangThaiDauThau } from '../services/workflow';
import { LichSuPheDuyetTimeline } from './LichSuPheDuyetTimeline';

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
  'chuan-bi': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  'da-nop': 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300',
  'trung-thau': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'truot': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
  'huy': 'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-300',
};

export function GoiThauChiTietPanel({
  item,
  onEdit,
  onDone,
}: {
  item: DauThau;
  onEdit?: (item: DauThau) => void;
  onDone?: () => void;
}) {
  const [trangThai, setTrangThai] = useState<string>(item.trangThai);
  const [updating, setUpdating] = useState(false);
  const soHsDu = [item.hsNangLucChung, item.bcTaiChinh, item.ccnnDuThau].filter(Boolean).length;

  const handleUpdateStatus = async (newStatus: string) => {
    let giaTrung = item.giaTrungThau;
    if (newStatus === 'trung-thau' && !giaTrung) {
      const val = prompt('Nhập Giá trúng thầu chính thức (Triệu VNĐ):', String(item.giaDuThau || ''));
      if (val) giaTrung = Number(val);
    }
    setUpdating(true);
    try {
      await updateTrangThaiDauThau(item.id, newStatus, giaTrung);
      setTrangThai(newStatus);
      onDone?.();
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-6 p-4">
      {/* Header Info */}
      <div className="rounded-xl border border-border bg-subtle p-4 space-y-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="text-2xs font-bold uppercase tracking-wider text-ink-muted">Tên gói thầu / Dự án</span>
            <h3 className="text-base font-bold text-ink mt-0.5 leading-snug">{item.tenGoiThau}</h3>
          </div>
          <span className={cn('inline-flex shrink-0 rounded-full px-2.5 py-1 text-xs font-bold', TRANG_THAI_TONE[trangThai as TrangThaiDauThau])}>
            {TRANG_THAI_LABEL[trangThai as TrangThaiDauThau] || trangThai}
          </span>
        </div>
        <div className="flex items-center gap-3 text-xs text-ink-secondary pt-2 border-t border-border-subtle flex-wrap">
          <span className="flex items-center gap-1 font-medium"><Building2 size={13} className="text-primary" /> Chủ đầu tư: <strong className="text-ink">{item.chuDauTu || '—'}</strong></span>
          <span className="inline-flex rounded-md bg-surface px-2 py-0.5 text-2xs font-bold border border-border">{HINH_THUC_LABEL[item.hinhThuc] || item.hinhThuc}</span>
        </div>
      </div>

      {/* Thanh chuyển trạng thái 1-click */}
      <div className="rounded-xl border border-border bg-surface p-3.5 space-y-3 text-xs shadow-xs">
        <div className="flex items-center justify-between gap-2">
          <span className="font-bold text-ink flex items-center gap-1.5">
            <Clock size={14} className="text-primary" /> Chuyển trạng thái gói thầu:
          </span>
          {updating && <span className="text-2xs text-ink-muted animate-pulse font-semibold">Đang cập nhật...</span>}
        </div>

        {/* Nút bấm dạng Segmented Badges gọn gàng không bị che đè */}
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(TRANG_THAI_LABEL).map(([val, label]) => {
            const isSelected = trangThai === val;
            return (
              <button
                key={val}
                type="button"
                disabled={updating}
                onClick={() => handleUpdateStatus(val)}
                className={cn(
                  'px-3 py-1.5 rounded-lg text-2xs font-bold transition-all border cursor-pointer',
                  isSelected
                    ? 'bg-primary text-white border-primary shadow-xs scale-[1.02]'
                    : 'bg-surface text-ink-secondary border-border hover:border-primary/50 hover:bg-muted/50'
                )}
              >
                {label}
              </button>
            );
          })}
        </div>

        {trangThai === 'chuan-bi' && (
          <button
            onClick={() => handleUpdateStatus('da-nop')}
            disabled={updating}
            className="w-full py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-2xs flex items-center justify-center gap-1.5 transition-colors"
          >
            <CheckCircle2 size={13} /> XÁC NHẬN: Đã hoàn thiện & Nộp Hồ sơ dự thầu
          </button>
        )}

        {trangThai === 'da-nop' && (
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => handleUpdateStatus('trung-thau')}
              disabled={updating}
              className="py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-2xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <CheckCircle2 size={13} /> Cập nhật: TRÚNG THẦU
            </button>
            <button
              onClick={() => handleUpdateStatus('truot')}
              disabled={updating}
              className="py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold text-2xs flex items-center justify-center gap-1.5 transition-colors"
            >
              <XCircle size={13} /> Trượt thầu
            </button>
          </div>
        )}

        {trangThai === 'trung-thau' && (
          <div className="rounded-lg border border-emerald-300 bg-emerald-50 p-2.5 text-2xs text-emerald-900 dark:border-emerald-800 dark:bg-emerald-900/20 dark:text-emerald-200">
            <p className="font-bold flex items-center gap-1 text-emerald-800 dark:text-emerald-300">
              <Award size={13} /> 🎉 Gói thầu đã TRÚNG THẦU thành công!
            </p>
            <p className="mt-0.5">Chuyển sang <strong>Hợp đồng & CRM</strong> ➔ Bấm <strong>"+ Tạo Hợp đồng"</strong> để lập HĐKT theo Điều 6.1 QC 2815.</p>
          </div>
        )}
      </div>

      {/* Thông số Tài chính & Thời gian */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1 shadow-xs">
          <span className="text-2xs text-ink-muted block font-bold uppercase tracking-wider">Giá dự thầu</span>
          <p className="text-base font-extrabold text-primary">{item.giaDuThau ? `${item.giaDuThau.toLocaleString('vi-VN')} triệu VNĐ` : '—'}</p>
        </div>
        <div className="p-3.5 rounded-xl border border-border bg-surface space-y-1 shadow-xs">
          <span className="text-2xs text-ink-muted block font-bold uppercase tracking-wider">Giá trúng thầu</span>
          <p className="text-base font-extrabold text-emerald-600 dark:text-emerald-400">
            {item.giaTrungThau ? `${item.giaTrungThau.toLocaleString('vi-VN')} triệu VNĐ` : item.trangThai === 'trung-thau' && item.giaDuThau ? `${item.giaDuThau.toLocaleString('vi-VN')} triệu VNĐ` : '—'}
          </p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-subtle space-y-1">
          <span className="text-2xs text-ink-muted block font-bold uppercase tracking-wider">Thời điểm mở thầu</span>
          <p className="font-bold text-ink flex items-center gap-1.5"><Calendar size={13} className="text-ink-muted" /> {item.ngayMoThau ? formatNgay(item.ngayMoThau) : '—'}</p>
        </div>
        <div className="p-3 rounded-xl border border-border bg-subtle space-y-1">
          <span className="text-2xs text-ink-muted block font-bold uppercase tracking-wider">Thời điểm đóng thầu</span>
          <p className="font-bold text-ink flex items-center gap-1.5"><Clock size={13} className="text-ink-muted" /> {item.ngayDongThau ? formatNgay(item.ngayDongThau) : '—'}</p>
        </div>
      </div>

      {/* Đơn vị thực hiện & Nhân sự phụ trách */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-3 shadow-xs">
        <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
          <UserCheck size={14} className="text-primary" /> Đơn vị & Nhân sự Thực hiện
        </h4>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div>
            <span className="text-2xs text-ink-muted block">Đơn vị thực hiện:</span>
            <p className="font-bold text-ink">{item.donViThucHien || '—'}</p>
          </div>
          <div>
            <span className="text-2xs text-ink-muted block">Cán bộ phụ trách:</span>
            <p className="font-bold text-ink">{item.nguoiPhuTrach || '—'}</p>
          </div>
        </div>
      </div>

      {/* QC 2815 — Chủ trì HSDT & Hồ sơ năng lực (Điều 5.1d, Điều 9.6g) */}
      <div className="rounded-xl border border-border bg-surface p-4 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-ink uppercase tracking-wider flex items-center gap-1.5">
            <ShieldCheck size={14} className="text-emerald-600 dark:text-emerald-400" /> Hồ sơ Dự thầu & Năng lực (QC 2815 Đ.5.1d, 9.6g)
          </h4>
          <span className={cn('px-2 py-0.5 rounded text-2xs font-bold', soHsDu === 3 ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300' : 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300')}>
            Đã sẵn sàng {soHsDu}/3
          </span>
        </div>

        <div className="p-3 rounded-lg border border-border bg-subtle space-y-1">
          <span className="text-2xs text-ink-muted block font-semibold">Chủ trì lập Hồ sơ dự thầu (Giám đốc ĐV chỉ định — Đ.5.1d):</span>
          <p className="font-bold text-ink flex items-center gap-1.5 text-sm">
            <Award size={14} className="text-amber-500" /> {item.chuTriHsdt || 'Chưa chỉ định người chủ trì'}
          </p>
        </div>

        {/* Checklist 3 loại HS */}
        <div className="space-y-2 text-xs">
          <div className={cn('flex items-center justify-between p-3 rounded-lg border transition-colors', item.hsNangLucChung ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10' : 'border-border bg-muted/20')}>
            <div className="flex items-center gap-2">
              <FileCheck size={15} className={item.hsNangLucChung ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted'} />
              <div>
                <p className="font-bold text-ink">Hồ sơ năng lực chung của Viện</p>
                <p className="text-2xs text-ink-muted">P.KHKT tổng hợp & quản lý chữ ký số đấu thầu (Đ.9.6g)</p>
              </div>
            </div>
            {item.hsNangLucChung ? (
              <span className="flex items-center gap-1 text-2xs font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={13} /> Sẵn sàng</span>
            ) : (
              <span className="flex items-center gap-1 text-2xs font-semibold text-ink-muted"><XCircle size={13} /> Chưa có</span>
            )}
          </div>

          <div className={cn('flex items-center justify-between p-3 rounded-lg border transition-colors', item.bcTaiChinh ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10' : 'border-border bg-muted/20')}>
            <div className="flex items-center gap-2">
              <FileText size={15} className={item.bcTaiChinh ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted'} />
              <div>
                <p className="font-bold text-ink">Báo cáo tài chính</p>
                <p className="text-2xs text-ink-muted">Báo cáo tài chính phục vụ dự thầu (P.TCKT cung cấp)</p>
              </div>
            </div>
            {item.bcTaiChinh ? (
              <span className="flex items-center gap-1 text-2xs font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={13} /> Sẵn sàng</span>
            ) : (
              <span className="flex items-center gap-1 text-2xs font-semibold text-ink-muted"><XCircle size={13} /> Chưa có</span>
            )}
          </div>

          <div className={cn('flex items-center justify-between p-3 rounded-lg border transition-colors', item.ccnnDuThau ? 'border-emerald-200 bg-emerald-50/40 dark:bg-emerald-900/10' : 'border-border bg-muted/20')}>
            <div className="flex items-center gap-2">
              <Award size={15} className={item.ccnnDuThau ? 'text-emerald-600 dark:text-emerald-400' : 'text-ink-muted'} />
              <div>
                <p className="font-bold text-ink">Chứng chỉ hành nghề & Nhân sự dự thầu</p>
                <p className="text-2xs text-ink-muted">CCNN, bằng cấp nhân sự tham gia HSDT (P.TCHC xác nhận)</p>
              </div>
            </div>
            {item.ccnnDuThau ? (
              <span className="flex items-center gap-1 text-2xs font-bold text-emerald-700 dark:text-emerald-300"><CheckCircle2 size={13} /> Sẵn sàng</span>
            ) : (
              <span className="flex items-center gap-1 text-2xs font-semibold text-ink-muted"><XCircle size={13} /> Chưa có</span>
            )}
          </div>
        </div>
      </div>

      {item.ghiChu && (
        <div className="rounded-xl border border-border bg-subtle p-3.5 text-xs">
          <span className="font-bold text-ink block mb-0.5">Ghi chú / Mô tả:</span>
          <p className="text-ink-secondary whitespace-pre-wrap">{item.ghiChu}</p>
        </div>
      )}

      {/* Nhật ký Phê duyệt & Lịch sử chuyển trạng thái */}
      <LichSuPheDuyetTimeline loaiDoiTuong="dau_thau" doiTuongId={item.id} />

      {/* Button Sửa */}
      {onEdit && (
        <div className="pt-2">
          <button
            onClick={() => onEdit(item)}
            className="w-full btn-primary flex items-center justify-center gap-1.5 py-2.5 text-xs font-bold"
          >
            <Pencil size={14} /> Chỉnh sửa thông tin gói thầu
          </button>
        </div>
      )}
    </div>
  );
}
