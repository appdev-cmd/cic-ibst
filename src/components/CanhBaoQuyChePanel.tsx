import { useMemo } from 'react';
import { ShieldAlert, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { fetchDuLieuCanhBao } from '../services/thongke';
import { quetDanhSach, sapXepCanhBao, demTheoMucDo, type MucDoCanhBao } from '../lib/canhBao2815';
import type { HopDong } from '../types';
import { cn } from '../lib/utils';

const MAU_MUC_DO: Record<MucDoCanhBao, string> = {
  cao: 'bg-red-50 text-danger border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800',
  'trung-binh': 'bg-amber-50 text-warning border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
  thap: 'bg-subtle text-ink-secondary border-border',
};

const NHAN_MUC_DO: Record<MucDoCanhBao, string> = {
  cao: 'Nghiêm trọng',
  'trung-binh': 'Cần xử lý',
  thap: 'Lưu ý',
};

/**
 * Rà soát tuân thủ QC 2815 trên toàn bộ hợp đồng — phục vụ Đ.9.6h (P.KHKT định kỳ hoặc đột xuất
 * kiểm tra việc tuân thủ quy chế và kiến nghị Viện xử lý sai phạm).
 *
 * Engine chỉ ĐỀ XUẤT. Đ.14 yêu cầu phải có văn bản nhắc nhở trước khi phạt, nên việc ghi phiếu
 * thưởng/phạt vẫn do người có thẩm quyền thực hiện ở tab "Thưởng / Phạt" của từng hợp đồng.
 */
export function CanhBaoQuyChePanel({ hopDongList }: { hopDongList: HopDong[] }) {
  const { data: phu, loading } = useAsyncData(fetchDuLieuCanhBao, {
    lienDanhChuaBaoKhkt: new Set<string>(),
    tamUngQuaHan: new Map<string, number>(),
    hoaDonChuaThu: new Map<string, number>(),
    viPhamDieu83: new Set<string>(),
  });

  const canhBao = useMemo(() => sapXepCanhBao(quetDanhSach(hopDongList, phu)), [hopDongList, phu]);
  const dem = useMemo(() => demTheoMucDo(canhBao), [canhBao]);

  // Gộp theo luật để thấy vấn đề hệ thống, không chỉ từng hợp đồng lẻ.
  const theoLuat = useMemo(() => {
    const m = new Map<string, { ten: string; canCu: string; mucDo: MucDoCanhBao; so: number }>();
    for (const c of canhBao) {
      const cur = m.get(c.luat.ma);
      if (cur) cur.so += 1;
      else m.set(c.luat.ma, { ten: c.luat.ten, canCu: c.luat.canCu, mucDo: c.luat.mucDo, so: 1 });
    }
    return [...m.values()].sort((a, b) => b.so - a.so);
  }, [canhBao]);

  return (
    <div className="card overflow-hidden">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border px-4 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-ink">
          <ShieldAlert size={16} className="text-danger" />
          Rà soát tuân thủ Quy chế 2815 (Đ.9.6h)
        </h3>
        <div className="flex items-center gap-2 text-2xs font-bold">
          <span className={cn('rounded-full border px-2 py-0.5', MAU_MUC_DO.cao)}>{dem.cao} nghiêm trọng</span>
          <span className={cn('rounded-full border px-2 py-0.5', MAU_MUC_DO['trung-binh'])}>{dem['trung-binh']} cần xử lý</span>
        </div>
      </div>

      {loading ? (
        <p className="px-4 py-6 text-center text-xs italic text-ink-muted">Đang rà soát…</p>
      ) : canhBao.length === 0 ? (
        <p className="flex items-center justify-center gap-2 px-4 py-6 text-center text-xs font-semibold text-success">
          <CheckCircle2 size={15} /> Không phát hiện sai phạm quy chế trên {hopDongList.length} hợp đồng.
        </p>
      ) : (
        <>
          <div className="border-b border-border-subtle bg-subtle px-4 py-3">
            <p className="mb-2 text-2xs font-black uppercase tracking-wider text-ink-muted">Tổng hợp theo loại vi phạm</p>
            <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
              {theoLuat.map((l) => (
                <div key={l.ten} className="flex items-start justify-between gap-2 text-2xs">
                  <span className="min-w-0">
                    <span className="font-semibold text-ink">{l.ten}</span>
                    <span className="block text-ink-muted">{l.canCu}</span>
                  </span>
                  <span className={cn('shrink-0 rounded-full border px-2 py-0.5 font-bold', MAU_MUC_DO[l.mucDo])}>
                    {l.so}
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px]">
              <thead>
                <tr>
                  <th className="th-cell">Mức độ</th>
                  <th className="th-cell">Số hợp đồng</th>
                  <th className="th-cell">Vi phạm</th>
                  <th className="th-cell">Chi tiết</th>
                  <th className="th-cell">Đề xuất phạt (Đ.14.2)</th>
                </tr>
              </thead>
              <tbody>
                {canhBao.map((c, i) => (
                  <tr key={`${c.hopDongId}-${c.luat.ma}-${i}`} className="tr-hover">
                    <td className="td-cell">
                      <span className={cn('rounded-full border px-2 py-0.5 text-2xs font-bold', MAU_MUC_DO[c.luat.mucDo])}>
                        {NHAN_MUC_DO[c.luat.mucDo]}
                      </span>
                    </td>
                    <td className="td-cell font-mono text-xs font-semibold">{c.soHopDong}</td>
                    <td className="td-cell text-xs">
                      {c.luat.ten}
                      <span className="block text-2xs text-ink-muted">{c.luat.canCu}</span>
                    </td>
                    <td className="td-cell text-xs text-ink-secondary">{c.chiTiet}</td>
                    <td className="td-cell text-2xs">
                      {c.luat.goiYViPhamId ? (
                        <span className="font-semibold text-danger">Có dòng phạt tương ứng</span>
                      ) : (
                        <span className="italic text-ink-muted">Không phải diện phạt — cần khắc phục</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <p className="flex items-start gap-1.5 border-t border-border-subtle px-4 py-2 text-2xs italic text-ink-muted">
            <AlertTriangle size={12} className="mt-px shrink-0" />
            Đây là kết quả rà soát tự động để tham khảo. Điều 14 yêu cầu phải có văn bản nhắc nhở trước khi
            phạt — quyết định ghi phiếu thưởng/phạt vẫn do người có thẩm quyền thực hiện tại tab “Thưởng / Phạt”.
          </p>
        </>
      )}
    </div>
  );
}
