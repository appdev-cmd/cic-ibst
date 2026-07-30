import { useMemo } from 'react';
import { Download } from 'lucide-react';
import type { HopDong } from '../types';
import { canTrinhVienTruong, ngayHanNopHoSo, soNgayConLai } from '../lib/qc2815';
import { formatTrieu, exportCsv, cn } from '../lib/utils';

/**
 * Điều 6.3 QC 2815 — "Định kỳ hàng tuần, tháng, các đơn vị gửi số liệu thống kê HĐKT
 * theo quy định về phòng KHKT để tổng hợp trong báo cáo giao ban của Viện."
 *
 * Số liệu tính trực tiếp từ danh sách hợp đồng đang tải, không truy vấn thêm.
 */

interface DongBaoCao {
  donVi: string;
  soHopDong: number;
  tongGiaTri: number;
  daThu: number;
  conPhaiThu: number;
  quaHanNopHoSo: number;
  choDuyetVienTruong: number;
  daQuyetToan: number;
}

function tongHop(list: HopDong[]): DongBaoCao[] {
  const theoDonVi = new Map<string, DongBaoCao>();

  for (const hd of list) {
    const ten = hd.donViThucHien || '— Chưa gán đơn vị —';
    let d = theoDonVi.get(ten);
    if (!d) {
      d = {
        donVi: ten,
        soHopDong: 0,
        tongGiaTri: 0,
        daThu: 0,
        conPhaiThu: 0,
        quaHanNopHoSo: 0,
        choDuyetVienTruong: 0,
        daQuyetToan: 0,
      };
      theoDonVi.set(ten, d);
    }

    d.soHopDong += 1;
    d.tongGiaTri += hd.giaTri || 0;
    d.daThu += hd.daThanhToan || 0;
    d.conPhaiThu += Math.max(0, (hd.giaTri || 0) - (hd.daThanhToan || 0));

    // Quá hạn 30 ngày nộp hồ sơ gốc về Viện (Điều 6.3) — chỉ tính HĐ chưa nộp.
    if (!hd.ngayNopHoSo && hd.ngayKy) {
      const han = ngayHanNopHoSo(hd.ngayKy);
      if (han && soNgayConLai(han) < 0) d.quaHanNopHoSo += 1;
    }

    if (
      canTrinhVienTruong(hd.nhomHD, hd.giaDuThau ?? hd.giaTri) &&
      hd.trangThaiPheDuyet !== 'da-duyet'
    ) {
      d.choDuyetVienTruong += 1;
    }

    if (hd.trangThaiQuyetToan === 'da-quyet-toan') d.daQuyetToan += 1;
  }

  return [...theoDonVi.values()].sort((a, b) => b.tongGiaTri - a.tongGiaTri);
}

export function BaoCaoKhktPanel({ hopDongList }: { hopDongList: HopDong[] }) {
  const rows = useMemo(() => tongHop(hopDongList), [hopDongList]);

  const tong = useMemo(
    () =>
      rows.reduce(
        (t, r) => ({
          soHopDong: t.soHopDong + r.soHopDong,
          tongGiaTri: t.tongGiaTri + r.tongGiaTri,
          daThu: t.daThu + r.daThu,
          conPhaiThu: t.conPhaiThu + r.conPhaiThu,
          quaHanNopHoSo: t.quaHanNopHoSo + r.quaHanNopHoSo,
          choDuyetVienTruong: t.choDuyetVienTruong + r.choDuyetVienTruong,
          daQuyetToan: t.daQuyetToan + r.daQuyetToan,
        }),
        { soHopDong: 0, tongGiaTri: 0, daThu: 0, conPhaiThu: 0, quaHanNopHoSo: 0, choDuyetVienTruong: 0, daQuyetToan: 0 },
      ),
    [rows],
  );

  const xuatCsv = () => {
    const ngay = new Date().toISOString().slice(0, 10);
    exportCsv(
      `bao-cao-hdkt-khkt-${ngay}.csv`,
      ['Đơn vị', 'Số HĐ', 'Tổng giá trị (tr.đ)', 'Đã thu (tr.đ)', 'Còn phải thu (tr.đ)', 'Quá hạn nộp hồ sơ', 'Chờ duyệt Viện trưởng', 'Đã quyết toán'],
      rows.map((r) => [
        r.donVi, r.soHopDong, r.tongGiaTri, r.daThu, r.conPhaiThu,
        r.quaHanNopHoSo, r.choDuyetVienTruong, r.daQuyetToan,
      ]),
    );
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="text-sm font-bold text-ink">Báo cáo thống kê HĐKT gửi Phòng KHKT</h3>
          <p className="text-2xs text-ink-muted">
            Điều 6.3 QC 2815 — số liệu định kỳ tuần/tháng phục vụ báo cáo giao ban của Viện.
            Chốt số tại thời điểm {new Date().toLocaleDateString('vi-VN')}.
          </p>
        </div>
        <button onClick={xuatCsv} className="btn-secondary gap-1.5 py-1.5 text-2xs font-bold">
          <Download size={13} /> Xuất CSV
        </button>
      </div>

      <div className="card overflow-x-auto">
        <table className="w-full min-w-[760px]">
          <thead>
            <tr>
              <th className="th-cell">Đơn vị thực hiện</th>
              <th className="th-cell text-right">Số HĐ</th>
              <th className="th-cell text-right">Tổng giá trị</th>
              <th className="th-cell text-right">Đã thu</th>
              <th className="th-cell text-right">Còn phải thu</th>
              <th className="th-cell text-right">Quá hạn nộp HS</th>
              <th className="th-cell text-right">Chờ duyệt VT</th>
              <th className="th-cell text-right">Đã quyết toán</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.donVi} className="tr-hover">
                <td className="td-cell text-xs font-medium text-ink">{r.donVi}</td>
                <td className="td-cell text-right font-mono text-xs">{r.soHopDong}</td>
                <td className="td-cell text-right font-mono text-xs font-bold">{formatTrieu(r.tongGiaTri)}</td>
                <td className="td-cell text-right font-mono text-xs text-success">{formatTrieu(r.daThu)}</td>
                <td className="td-cell text-right font-mono text-xs text-warning">{formatTrieu(r.conPhaiThu)}</td>
                <td className={cn('td-cell text-right font-mono text-xs', r.quaHanNopHoSo > 0 && 'font-bold text-danger')}>
                  {r.quaHanNopHoSo || '—'}
                </td>
                <td className={cn('td-cell text-right font-mono text-xs', r.choDuyetVienTruong > 0 && 'font-bold text-warning')}>
                  {r.choDuyetVienTruong || '—'}
                </td>
                <td className="td-cell text-right font-mono text-xs">{r.daQuyetToan || '—'}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr>
                <td colSpan={8} className="td-cell py-4 text-center text-xs italic text-ink-muted">
                  Chưa có hợp đồng nào để thống kê.
                </td>
              </tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="border-t-2 border-border bg-subtle font-bold">
                <td className="td-cell text-xs">TỔNG CỘNG</td>
                <td className="td-cell text-right font-mono text-xs">{tong.soHopDong}</td>
                <td className="td-cell text-right font-mono text-xs">{formatTrieu(tong.tongGiaTri)}</td>
                <td className="td-cell text-right font-mono text-xs text-success">{formatTrieu(tong.daThu)}</td>
                <td className="td-cell text-right font-mono text-xs text-warning">{formatTrieu(tong.conPhaiThu)}</td>
                <td className={cn('td-cell text-right font-mono text-xs', tong.quaHanNopHoSo > 0 && 'text-danger')}>
                  {tong.quaHanNopHoSo || '—'}
                </td>
                <td className={cn('td-cell text-right font-mono text-xs', tong.choDuyetVienTruong > 0 && 'text-warning')}>
                  {tong.choDuyetVienTruong || '—'}
                </td>
                <td className="td-cell text-right font-mono text-xs">{tong.daQuyetToan || '—'}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}
