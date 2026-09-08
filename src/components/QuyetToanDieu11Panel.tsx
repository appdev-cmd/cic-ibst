import { useState, type ReactNode } from 'react';
import { Plus, Trash2, LoaderCircle, Check, X, AlertTriangle, Receipt, Split, Landmark } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import { useAuth } from '../context/AuthContext';
import {
  fetchDeNghiXuatHoaDon,
  createDeNghiXuatHoaDon,
  chuyenBuocDeNghiXuatHd,
  deleteDeNghiXuatHoaDon,
  BUOC_DE_NGHI_XUAT_HD,
  fetchToPhanPhoi,
  createToPhanPhoi,
  chuyenBuocToPhanPhoi,
  deleteToPhanPhoi,
  fetchTamUng,
  createTamUng,
  ghiNhanHoanTamUng,
  deleteTamUng,
  tinhLaiQuaHanTamUng,
  type DeNghiXuatHoaDonInput,
  type TamUngInput,
  type TrangThaiDeNghiXuatHd,
} from '../services/quyetToan';
import { fetchDotThanhToan } from '../services/chitiet';
import { phanBoHopDong, tranGiamGiaoChuTri } from '../lib/qc2815';
import type { HopDong } from '../types';
import type { Option } from '../services/queries';
import { formatNgay, cn } from '../lib/utils';

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

function Khung({ title, icon, onAdd, addLabel, children }: {
  title: string; icon: ReactNode; onAdd?: () => void; addLabel?: string; children: ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h4 className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
          {icon} {title}
        </h4>
        {onAdd && (
          <button onClick={onAdd} className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary hover:bg-muted">
            <Plus size={11} /> {addLabel ?? 'Thêm'}
          </button>
        )}
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

const EMPTY_DN: DeNghiXuatHoaDonInput = { dotThanhToanId: '', soTien: '', ngayDeNghi: '', canCuNghiemThu: '', ghiChu: '' };
const EMPTY_TU: TamUngInput = { nhanSuId: '', soTien: '', ngayTamUng: '', hanHoan: '', laiSuatGoc: '', ghiChu: '' };

const MAU_TT_DN: Record<TrangThaiDeNghiXuatHd, string> = {
  'du-thao': 'bg-muted text-ink-secondary',
  'cho-ke-toan-dv': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'cho-tckt-xuat': 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300',
  'da-xuat': 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300',
  'tu-choi': 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300',
};

/** Bước kế tiếp của đề nghị xuất hóa đơn — nhãn nút theo Đ.11.1. */
function buocKeTiepDeNghi(tt: TrangThaiDeNghiXuatHd): { den: TrangThaiDeNghiXuatHd; nhan: string } | null {
  switch (tt) {
    case 'du-thao': return { den: 'cho-ke-toan-dv', nhan: 'Trình kế toán đơn vị' };
    case 'cho-ke-toan-dv': return { den: 'cho-tckt-xuat', nhan: 'Kế toán ĐV xác nhận → P.TCKT' };
    case 'cho-tckt-xuat': return { den: 'da-xuat', nhan: 'P.TCKT ghi nhận đã xuất HĐ' };
    default: return null;
  }
}

export function QuyetToanDieu11Panel({ hd, nhanSuOptions }: { hd: HopDong; nhanSuOptions: Option[] }) {
  const { nhanSuId } = useAuth();
  const { data: deNghis, refetch: refetchDn } = useAsyncData(() => fetchDeNghiXuatHoaDon(hd.id), []);
  const { data: toPhanPhois, refetch: refetchPp } = useAsyncData(() => fetchToPhanPhoi(hd.id), []);
  const { data: tamUngs, refetch: refetchTu } = useAsyncData(() => fetchTamUng(hd.id), []);
  const { data: dots } = useAsyncData(() => fetchDotThanhToan(hd.id), []);
  const [err, setErr] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const chay = async (fn: () => Promise<void>, sau: () => void) => {
    setBusy(true); setErr(null);
    try { await fn(); sau(); } catch (e) { setErr(e instanceof Error ? e.message : String(e)); } finally { setBusy(false); }
  };

  // ── Đề nghị xuất hóa đơn ──
  const [addDn, setAddDn] = useState(false);
  const [formDn, setFormDn] = useState<DeNghiXuatHoaDonInput>(EMPTY_DN);

  // ── Tờ phân phối: tính sẵn theo Bảng 1 trên số tiền đã thực về ──
  const pb = phanBoHopDong(hd.nhomHD, hd.daThanhToan || 0, {
    loaiDacThu: hd.loaiDacThu,
    phanVienXa: hd.phanVienXa,
    giamTheoYeuCauDonVi: hd.giamTheoYeuCauDonVi,
    capKy: hd.capKy,
  });
  const tranGiam = tranGiamGiaoChuTri(hd.nhomHD);
  const [giamChuTri, setGiamChuTri] = useState('0');
  const giamSo = Number(giamChuTri) || 0;
  const tranSoTien = tranGiam != null ? ((hd.daThanhToan || 0) * tranGiam) / 100 : null;
  const vuotTran = tranSoTien != null && giamSo > tranSoTien;

  const lapToPhanPhoi = () =>
    chay(
      () =>
        createToPhanPhoi(
          hd.id,
          {
            ky: new Date().toISOString().slice(0, 7),
            soTienGoc: hd.daThanhToan || 0,
            quyChuTri: pb?.chuTri != null ? pb.chuTri - giamSo : null,
            quyDonVi: pb?.donVi ?? null,
            cpqlLnChiKhac: pb?.cpqlLnChiKhac ?? null,
            khtscd: pb?.khtscd ?? null,
            hoTroDiLai: pb?.hoTroDiLai ?? 0,
            giamGiaoChuTri: giamSo,
            ghiChu: pb?.ghiChuDacThu.join('; ') ?? '',
          },
          nhanSuId,
        ),
      refetchPp,
    );

  // ── Tạm ứng ──
  const [addTu, setAddTu] = useState(false);
  const [formTu, setFormTu] = useState<TamUngInput>(EMPTY_TU);

  return (
    <div className="space-y-3">
      {err && (
        <p className="flex items-start gap-1.5 rounded bg-danger-subtle p-2 text-2xs font-semibold text-danger">
          <AlertTriangle size={12} className="mt-px shrink-0" /> {err}
        </p>
      )}

      {/* ─── 1. Đề nghị xuất hóa đơn ─── */}
      <Khung
        title="Đề nghị xuất hóa đơn (Đ.11.1)"
        icon={<Receipt size={12} />}
        addLabel="Lập đề nghị"
        onAdd={() => { setFormDn({ ...EMPTY_DN, ngayDeNghi: new Date().toISOString().slice(0, 10) }); setAddDn(true); }}
      >
        {addDn && (
          <div className="space-y-2 border-b border-border-subtle bg-subtle p-3">
            <div className="grid grid-cols-2 gap-2">
              <select className={miniInput} value={formDn.dotThanhToanId} onChange={(e) => {
                const dot = dots.find((d) => d.id === e.target.value);
                setFormDn({ ...formDn, dotThanhToanId: e.target.value, soTien: dot ? String(dot.soTien) : formDn.soTien });
              }}>
                <option value="">-- Đợt thanh toán --</option>
                {dots.map((d) => <option key={d.id} value={d.id}>{d.tenDot} ({d.soTien.toLocaleString('vi-VN')} tr)</option>)}
              </select>
              <input className={miniInput} placeholder="Số tiền (triệu đ)" value={formDn.soTien}
                onChange={(e) => setFormDn({ ...formDn, soTien: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className={miniInput} type="date" value={formDn.ngayDeNghi}
                onChange={(e) => setFormDn({ ...formDn, ngayDeNghi: e.target.value })} />
              <input className={miniInput} placeholder="Căn cứ BBNT (số/ngày)" value={formDn.canCuNghiemThu}
                onChange={(e) => setFormDn({ ...formDn, canCuNghiemThu: e.target.value })} />
            </div>
            <div className="flex justify-end gap-1">
              <button onClick={() => chay(() => createDeNghiXuatHoaDon(hd.id, formDn, nhanSuId), () => { setAddDn(false); refetchDn(); })}
                disabled={busy} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
              <button onClick={() => setAddDn(false)} className="rounded p-1 text-ink-muted hover:bg-muted"><X size={13} /></button>
            </div>
          </div>
        )}

        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="th-cell">Ngày ĐN</th>
              <th className="th-cell text-right">Số tiền</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell">Hóa đơn</th>
              <th className="th-cell text-right">Bước kế tiếp</th>
            </tr>
          </thead>
          <tbody>
            {deNghis.map((d) => {
              const ke = buocKeTiepDeNghi(d.trangThai);
              return (
                <tr key={d.id} className="tr-hover">
                  <td className="td-cell font-mono text-xs">{d.ngayDeNghi ? formatNgay(d.ngayDeNghi) : '—'}</td>
                  <td className="td-cell text-right font-mono text-xs">{d.soTien.toLocaleString('vi-VN')}</td>
                  <td className="td-cell">
                    <span className={cn('rounded-full px-2 py-0.5 text-2xs font-bold', MAU_TT_DN[d.trangThai])}>
                      {BUOC_DE_NGHI_XUAT_HD.find((b) => b.ma === d.trangThai)?.nhan ?? d.trangThai}
                    </span>
                  </td>
                  <td className="td-cell font-mono text-xs">
                    {d.soHoaDon ? `${d.soHoaDon}${d.ngayXuatHoaDon ? ` · ${formatNgay(d.ngayXuatHoaDon)}` : ''}` : '—'}
                  </td>
                  <td className="td-cell">
                    <div className="flex items-center justify-end gap-1">
                      {ke && (
                        <button
                          disabled={busy}
                          onClick={() => {
                            if (ke.den === 'da-xuat') {
                              const so = window.prompt('Số hóa đơn GTGT:');
                              if (!so) return;
                              const ngay = window.prompt('Ngày xuất hóa đơn (YYYY-MM-DD):', new Date().toISOString().slice(0, 10));
                              if (!ngay) return;
                              void chay(() => chuyenBuocDeNghiXuatHd(d.id, 'da-xuat', { soHoaDon: so, ngayXuatHoaDon: ngay, actorNhanSuId: nhanSuId }), refetchDn);
                            } else {
                              void chay(() => chuyenBuocDeNghiXuatHd(d.id, ke.den, { actorNhanSuId: nhanSuId }), refetchDn);
                            }
                          }}
                          className="rounded-lg bg-primary px-2 py-1 text-2xs font-bold text-white disabled:opacity-50"
                        >
                          {ke.nhan}
                        </button>
                      )}
                      <button onClick={() => chay(() => deleteDeNghiXuatHoaDon(d.id), refetchDn)}
                        className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {deNghis.length === 0 && !addDn && (
              <tr><td colSpan={5} className="td-cell py-3 text-center text-2xs italic text-ink-muted">Chưa có đề nghị xuất hóa đơn</td></tr>
            )}
          </tbody>
        </table>
      </Khung>

      {/* ─── 2. Tờ phân phối quyết toán ─── */}
      <Khung title="Tờ phân phối quyết toán (Đ.11.1, Bảng 1)" icon={<Split size={12} />}>
        <div className="space-y-2 border-b border-border-subtle bg-subtle p-3 text-2xs">
          {!pb ? (
            <p className="italic text-ink-muted">
              {hd.nhomHD === 'N1B'
                ? 'Nhóm N1b — thanh toán theo thực thanh, thực chi, không áp tỷ lệ Bảng 1.'
                : 'Hợp đồng chưa gán nhóm HĐ — không tính được phân bổ theo Bảng 1.'}
            </p>
          ) : (
            <>
              <p className="text-ink-secondary">
                Tính trên số tiền <strong>đã thực về {(hd.daThanhToan || 0).toLocaleString('vi-VN')} tr</strong> (nguồn: đợt thanh toán có ngày thực thu).
              </p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 sm:grid-cols-4">
                <span>Quỹ chủ trì: <b className="font-mono">{pb.chuTri != null ? (pb.chuTri - giamSo).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) : '—'}</b></span>
                <span>Quỹ đơn vị: <b className="font-mono">{pb.donVi?.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) ?? '—'}</b></span>
                <span>CPQL/LN: <b className="font-mono">{pb.cpqlLnChiKhac.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</b></span>
                <span>KHTSCĐ: <b className="font-mono">{pb.khtscd.toLocaleString('vi-VN', { maximumFractionDigits: 1 })}</b></span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <label className="text-ink-secondary">Giảm giao chủ trì (Đ.12.4a):</label>
                <input className={cn(miniInput, 'w-24')} value={giamChuTri} onChange={(e) => setGiamChuTri(e.target.value)} />
                {tranSoTien != null && (
                  <span className={cn('font-mono', vuotTran ? 'font-bold text-danger' : 'text-ink-muted')}>
                    trần {tranGiam}% = {tranSoTien.toLocaleString('vi-VN', { maximumFractionDigits: 1 })} tr
                    {vuotTran && ' — VƯỢT TRẦN'}
                  </span>
                )}
                {tranGiam == null && <span className="text-ink-muted">Nhóm 3 / quản lý tập trung — Giám đốc đơn vị tự bố trí, không áp trần</span>}
                <button
                  onClick={lapToPhanPhoi}
                  disabled={busy || vuotTran || (hd.daThanhToan || 0) <= 0}
                  className="ml-auto rounded-lg bg-primary px-2.5 py-1 font-bold text-white disabled:opacity-50"
                  title={(hd.daThanhToan || 0) <= 0 ? 'Chưa có tiền về nên chưa lập được tờ phân phối' : undefined}
                >
                  Lập tờ phân phối
                </button>
              </div>
            </>
          )}
        </div>

        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="th-cell">Kỳ</th>
              <th className="th-cell text-right">Tiền gốc</th>
              <th className="th-cell text-right">Chủ trì</th>
              <th className="th-cell text-right">Đơn vị</th>
              <th className="th-cell">Trạng thái</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {toPhanPhois.map((p) => (
              <tr key={p.id} className="tr-hover">
                <td className="td-cell font-mono text-xs">{p.ky || '—'}</td>
                <td className="td-cell text-right font-mono text-xs">{p.soTienGoc.toLocaleString('vi-VN')}</td>
                <td className="td-cell text-right font-mono text-xs">{p.quyChuTri?.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) ?? '—'}</td>
                <td className="td-cell text-right font-mono text-xs">{p.quyDonVi?.toLocaleString('vi-VN', { maximumFractionDigits: 1 }) ?? '—'}</td>
                <td className="td-cell">
                  <span className={cn('rounded-full px-2 py-0.5 text-2xs font-bold',
                    p.trangThai === 'da-duyet' ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-300'
                      : p.trangThai === 'cho-duyet' ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300'
                        : 'bg-muted text-ink-secondary')}>
                    {p.trangThai === 'da-duyet' ? `Đã duyệt${p.ngayDuyet ? ` ${formatNgay(p.ngayDuyet)}` : ''}` : p.trangThai === 'cho-duyet' ? 'Chờ duyệt' : 'Dự thảo'}
                  </span>
                </td>
                <td className="td-cell">
                  <div className="flex items-center justify-end gap-1">
                    {p.trangThai === 'du-thao' && (
                      <button disabled={busy} onClick={() => chay(() => chuyenBuocToPhanPhoi(p.id, 'cho-duyet'), refetchPp)}
                        className="rounded-lg bg-primary px-2 py-1 text-2xs font-bold text-white disabled:opacity-50">Trình duyệt</button>
                    )}
                    {p.trangThai === 'cho-duyet' && (
                      <button disabled={busy} onClick={() => chay(() => chuyenBuocToPhanPhoi(p.id, 'da-duyet', nhanSuId), refetchPp)}
                        className="rounded-lg bg-primary px-2 py-1 text-2xs font-bold text-white disabled:opacity-50">
                        {hd.capKy === 'don-vi-ky' ? 'Trưởng ĐV duyệt' : 'Lãnh đạo Viện duyệt'}
                      </button>
                    )}
                    <button onClick={() => chay(() => deleteToPhanPhoi(p.id), refetchPp)}
                      className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {toPhanPhois.length === 0 && (
              <tr><td colSpan={6} className="td-cell py-3 text-center text-2xs italic text-ink-muted">Chưa lập tờ phân phối</td></tr>
            )}
          </tbody>
        </table>
      </Khung>

      {/* ─── 3. Tạm ứng ─── */}
      <Khung
        title="Tạm ứng & lãi quá hạn (Đ.7.7, Đ.14 mục 2 dòng 6)"
        icon={<Landmark size={12} />}
        addLabel="Ghi tạm ứng"
        onAdd={() => { setFormTu({ ...EMPTY_TU, ngayTamUng: new Date().toISOString().slice(0, 10) }); setAddTu(true); }}
      >
        {addTu && (
          <div className="space-y-2 border-b border-border-subtle bg-subtle p-3">
            <div className="grid grid-cols-2 gap-2">
              <select className={miniInput} value={formTu.nhanSuId} onChange={(e) => setFormTu({ ...formTu, nhanSuId: e.target.value })}>
                <option value="">-- Người nhận tạm ứng --</option>
                {nhanSuOptions.map((n) => <option key={n.id} value={n.id}>{n.ten}</option>)}
              </select>
              <input className={miniInput} placeholder="Số tiền (triệu đ)" value={formTu.soTien}
                onChange={(e) => setFormTu({ ...formTu, soTien: e.target.value })} />
            </div>
            <div className="grid grid-cols-3 gap-2">
              <input className={miniInput} type="date" value={formTu.ngayTamUng}
                onChange={(e) => setFormTu({ ...formTu, ngayTamUng: e.target.value })} />
              <input className={miniInput} type="date" title="Hạn hoàn" value={formTu.hanHoan}
                onChange={(e) => setFormTu({ ...formTu, hanHoan: e.target.value })} />
              <input className={miniInput} placeholder="Lãi suất gốc %/năm" value={formTu.laiSuatGoc}
                onChange={(e) => setFormTu({ ...formTu, laiSuatGoc: e.target.value })} />
            </div>
            <div className="flex justify-end gap-1">
              <button onClick={() => chay(() => createTamUng(hd.id, formTu), () => { setAddTu(false); refetchTu(); })}
                disabled={busy} className="rounded p-1 text-success hover:bg-emerald-50 dark:hover:bg-emerald-900/20">
                {busy ? <LoaderCircle size={13} className="animate-spin" /> : <Check size={13} />}
              </button>
              <button onClick={() => setAddTu(false)} className="rounded p-1 text-ink-muted hover:bg-muted"><X size={13} /></button>
            </div>
          </div>
        )}

        <table className="w-full min-w-[640px]">
          <thead>
            <tr>
              <th className="th-cell">Người nhận</th>
              <th className="th-cell text-right">Số tiền</th>
              <th className="th-cell">Hạn hoàn</th>
              <th className="th-cell">Lãi quá hạn (130%)</th>
              <th className="th-cell text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tamUngs.map((t) => {
              const lai = tinhLaiQuaHanTamUng(t);
              return (
                <tr key={t.id} className="tr-hover">
                  <td className="td-cell text-xs font-medium">{t.nhanSu || '—'}</td>
                  <td className="td-cell text-right font-mono text-xs">{t.soTien.toLocaleString('vi-VN')}</td>
                  <td className="td-cell font-mono text-xs">{t.hanHoan ? formatNgay(t.hanHoan) : '—'}</td>
                  <td className="td-cell text-xs">
                    {lai ? (
                      <span className="font-bold text-danger" title={`Dư nợ ${lai.duNo.toLocaleString('vi-VN')} tr × ${lai.laiSuatPhat}%/năm × ${lai.soNgayQuaHan} ngày`}>
                        {lai.tienLai.toLocaleString('vi-VN', { maximumFractionDigits: 2 })} tr
                        <span className="ml-1 font-normal text-ink-muted">({lai.soNgayQuaHan} ngày quá hạn)</span>
                      </span>
                    ) : t.trangThai === 'da-hoan' ? (
                      <span className="text-success">Đã hoàn</span>
                    ) : (
                      <span className="text-ink-muted">Trong hạn</span>
                    )}
                  </td>
                  <td className="td-cell">
                    <div className="flex items-center justify-end gap-1">
                      {t.trangThai === 'dang-no' && (
                        <button disabled={busy}
                          onClick={() => chay(() => ghiNhanHoanTamUng(t.id, t.soTien, new Date().toISOString().slice(0, 10)), refetchTu)}
                          className="rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary hover:bg-muted disabled:opacity-50">
                          Ghi nhận hoàn
                        </button>
                      )}
                      <button onClick={() => chay(() => deleteTamUng(t.id), refetchTu)}
                        className="rounded p-1 text-ink-muted hover:bg-red-50 hover:text-danger dark:hover:bg-red-900/20">
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
            {tamUngs.length === 0 && !addTu && (
              <tr><td colSpan={5} className="td-cell py-3 text-center text-2xs italic text-ink-muted">Chưa có khoản tạm ứng</td></tr>
            )}
          </tbody>
        </table>
      </Khung>
    </div>
  );
}
