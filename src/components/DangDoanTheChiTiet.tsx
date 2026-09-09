import { useState, type ReactNode } from 'react';
import { Check, LoaderCircle, AlertTriangle, CalendarClock, Users, Flag } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchPhatTrienDangBuoc,
  ghiNhanBuocPhatTrien,
  fetchDiemDanh,
  ghiDiemDanh,
  fetchDangVien,
} from '../services/dangDoanThe';
import {
  BUOC_PHAT_TRIEN_DANG,
  TRANG_THAI_DANG_VIEN,
  LOAI_TO_CHUC_DOAN_THE,
  type DangVien,
  type ToChucDoanThe,
  type PhatTrienDang,
  type SinhHoatDinhKy,
} from '../types';
import { formatNgay, cn } from '../lib/utils';

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

function Dong({ nhan, children }: { nhan: string; children: ReactNode }) {
  return (
    <div className="flex gap-2 border-b border-border-subtle py-1.5 last:border-b-0">
      <span className="w-44 shrink-0 text-2xs font-bold uppercase tracking-wide text-ink-muted">{nhan}</span>
      <span className="min-w-0 flex-1 text-xs text-ink">{children}</span>
    </div>
  );
}

function Khoi({ tieuDe, icon, children }: { tieuDe: string; icon?: ReactNode; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border">
      <div className="border-b border-border-subtle px-3 py-2">
        <h4 className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
          {icon} {tieuDe}
        </h4>
      </div>
      <div className="p-3">{children}</div>
    </div>
  );
}

const MOT_NGAY = 24 * 3600 * 1000;

/**
 * Điều lệ Đảng: đảng viên dự bị sinh hoạt 12 tháng rồi chi bộ xét chuyển chính thức.
 * Quá hạn mà chưa có ngày chuyển chính thức là việc phải xử lý, nên cảnh báo ngay trên hồ sơ.
 */
export function canhBaoChuyenChinhThuc(dv: DangVien): { quaHanNgay: number } | null {
  if (dv.ngayVaoDangChinhThuc || dv.trangThai !== 'dang-sinh-hoat' || !dv.ngayVaoDangDuBi) return null;
  const hanChuyen = new Date(dv.ngayVaoDangDuBi);
  hanChuyen.setFullYear(hanChuyen.getFullYear() + 1);
  const quaHanNgay = Math.floor((Date.now() - hanChuyen.getTime()) / MOT_NGAY);
  return quaHanNgay > 0 ? { quaHanNgay } : null;
}

// ═══ CHI TIẾT ĐẢNG VIÊN ═══

export function DangVienChiTiet({ dv }: { dv: DangVien }) {
  const canhBao = canhBaoChuyenChinhThuc(dv);
  const thoiGianDangVien = dv.ngayVaoDangDuBi
    ? Math.floor((Date.now() - new Date(dv.ngayVaoDangDuBi).getTime()) / (MOT_NGAY * 365))
    : null;

  return (
    <div className="space-y-3 p-4">
      {canhBao && (
        <div className="flex items-start gap-1.5 rounded-lg border border-warning/30 bg-amber-50 p-3 text-xs text-warning dark:bg-amber-900/20">
          <AlertTriangle size={14} className="mt-px shrink-0" />
          <span>
            <strong>Quá hạn chuyển đảng chính thức {canhBao.quaHanNgay} ngày.</strong> Đảng viên dự bị sinh hoạt
            đủ 12 tháng thì chi bộ xét, đề nghị công nhận chính thức — hồ sơ này chưa có ngày chuyển chính thức.
          </span>
        </div>
      )}

      <Khoi tieuDe="Thông tin đảng viên" icon={<Flag size={12} />}>
        <Dong nhan="Họ và tên">{dv.hoTen || '—'}</Dong>
        <Dong nhan="Đơn vị công tác">{dv.donVi || '—'}</Dong>
        <Dong nhan="Chi bộ sinh hoạt">{dv.toChuc || '—'}</Dong>
        <Dong nhan="Số thẻ đảng viên">
          <span className="font-mono">{dv.soTheDang || '—'}</span>
        </Dong>
        <Dong nhan="Chức vụ Đảng">{dv.chucVuDang || 'Đảng viên'}</Dong>
        <Dong nhan="Trình độ lý luận chính trị">{dv.trinhDoLyLuan || '—'}</Dong>
        <Dong nhan="Trạng thái">
          <span className="rounded-full bg-subtle px-2 py-0.5 text-2xs font-bold text-ink-secondary">
            {TRANG_THAI_DANG_VIEN.find((o) => o.ma === dv.trangThai)?.ten ?? dv.trangThai}
          </span>
        </Dong>
      </Khoi>

      <Khoi tieuDe="Quá trình vào Đảng" icon={<CalendarClock size={12} />}>
        <Dong nhan="Ngày vào Đảng (dự bị)">
          <span className="font-mono">{dv.ngayVaoDangDuBi ? formatNgay(dv.ngayVaoDangDuBi) : '—'}</span>
        </Dong>
        <Dong nhan="Ngày chuyển chính thức">
          {dv.ngayVaoDangChinhThuc ? (
            <span className="font-mono text-success">{formatNgay(dv.ngayVaoDangChinhThuc)}</span>
          ) : (
            <span className="italic text-warning">Chưa chuyển chính thức</span>
          )}
        </Dong>
        {thoiGianDangVien != null && (
          <Dong nhan="Tuổi Đảng">{thoiGianDangVien} năm</Dong>
        )}
        <Dong nhan="Nơi kết nạp">{dv.noiKetNap || '—'}</Dong>
        <Dong nhan="Người giới thiệu 1">{dv.nguoiGioiThieu1 || '—'}</Dong>
        <Dong nhan="Người giới thiệu 2">{dv.nguoiGioiThieu2 || '—'}</Dong>
      </Khoi>

      {dv.ghiChu && (
        <Khoi tieuDe="Ghi chú">
          <p className="whitespace-pre-wrap text-xs text-ink-secondary">{dv.ghiChu}</p>
        </Khoi>
      )}
    </div>
  );
}

// ═══ CHI TIẾT TỔ CHỨC ĐẢNG - ĐOÀN THỂ ═══

export function ToChucChiTiet({ tc }: { tc: ToChucDoanThe }) {
  const { data: tatCaDangVien } = useAsyncData(fetchDangVien, []);
  const thanhVien = tatCaDangVien.filter((d) => d.toChucId === tc.id);
  const dangSinhHoat = thanhVien.filter((d) => d.trangThai === 'dang-sinh-hoat');
  const duBi = dangSinhHoat.filter((d) => !d.ngayVaoDangChinhThuc);
  const quaHanChuyen = dangSinhHoat.filter((d) => canhBaoChuyenChinhThuc(d));

  return (
    <div className="space-y-3 p-4">
      <Khoi tieuDe="Thông tin tổ chức" icon={<Users size={12} />}>
        <Dong nhan="Tên tổ chức">{tc.ten}</Dong>
        <Dong nhan="Loại">{LOAI_TO_CHUC_DOAN_THE.find((o) => o.ma === tc.loai)?.ten ?? tc.loai}</Dong>
        <Dong nhan="Cấp tổ chức">{tc.cap}</Dong>
        <Dong nhan="Mã">{tc.ma || '—'}</Dong>
        <Dong nhan="Đơn vị gắn với">{tc.donVi || 'Không gắn đơn vị cụ thể'}</Dong>
        <Dong nhan="Bí thư / Chủ tịch">{tc.nguoiDungDau || 'Chưa phân công'}</Dong>
        <Dong nhan="Phó bí thư / Phó CT">{tc.pho || 'Chưa phân công'}</Dong>
        <Dong nhan="Ngày thành lập">
          <span className="font-mono">{tc.ngayThanhLap ? formatNgay(tc.ngayThanhLap) : '—'}</span>
        </Dong>
        <Dong nhan="Nhiệm kỳ">{tc.nhiemKy || '—'}</Dong>
      </Khoi>

      {tc.loai === 'dang' && (
        <Khoi tieuDe={`Đảng viên sinh hoạt (${thanhVien.length})`} icon={<Flag size={12} />}>
          <div className="mb-2 flex flex-wrap gap-3 text-2xs">
            <span>Đang sinh hoạt: <b className="text-ink">{dangSinhHoat.length}</b></span>
            <span>Dự bị: <b className="text-warning">{duBi.length}</b></span>
            {quaHanChuyen.length > 0 && (
              <span className="text-danger">Quá hạn chuyển chính thức: <b>{quaHanChuyen.length}</b></span>
            )}
          </div>
          <table className="w-full">
            <thead>
              <tr>
                <th className="th-cell">Họ tên</th>
                <th className="th-cell">Chức vụ Đảng</th>
                <th className="th-cell">Ngày vào Đảng</th>
              </tr>
            </thead>
            <tbody>
              {thanhVien.map((d) => (
                <tr key={d.id} className="tr-hover">
                  <td className="td-cell text-xs font-medium">{d.hoTen}</td>
                  <td className="td-cell text-xs text-ink-secondary">{d.chucVuDang || 'Đảng viên'}</td>
                  <td className="td-cell font-mono text-xs">
                    {formatNgay(d.ngayVaoDangDuBi)}
                    {!d.ngayVaoDangChinhThuc && <span className="ml-1 text-2xs text-warning">(dự bị)</span>}
                  </td>
                </tr>
              ))}
              {thanhVien.length === 0 && (
                <tr><td colSpan={3} className="td-cell py-3 text-center text-2xs italic text-ink-muted">Chưa có đảng viên sinh hoạt tại tổ chức này</td></tr>
              )}
            </tbody>
          </table>
        </Khoi>
      )}
    </div>
  );
}

// ═══ CHI TIẾT PHÁT TRIỂN ĐẢNG VIÊN (8 BƯỚC) ═══

export function PhatTrienDangChiTiet({ pt, onChanged }: { pt: PhatTrienDang; onChanged: () => void }) {
  const { data: cacBuoc, refetch } = useAsyncData(() => fetchPhatTrienDangBuoc(pt.id), []);
  const [dangGhi, setDangGhi] = useState<string | null>(null);
  const [form, setForm] = useState({ ngayHoanThanh: '', soVanBan: '', ghiChu: '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const idxHienTai = BUOC_PHAT_TRIEN_DANG.findIndex((b) => b.ma === pt.buocHienTai);

  const ghiBuoc = async (buoc: string) => {
    setBusy(true); setErr(null);
    try {
      await ghiNhanBuocPhatTrien(pt.id, buoc, form);
      setDangGhi(null);
      setForm({ ngayHoanThanh: '', soVanBan: '', ghiChu: '' });
      refetch();
      onChanged();
    } catch (e) {
      setErr(e instanceof Error ? e.message : String(e));
    } finally { setBusy(false); }
  };

  return (
    <div className="space-y-3 p-4">
      <Khoi tieuDe="Đối tượng phát triển Đảng">
        <Dong nhan="Họ và tên">{pt.hoTen}</Dong>
        <Dong nhan="Đơn vị">{pt.donVi || '—'}</Dong>
        <Dong nhan="Chi bộ theo dõi">{pt.toChuc}</Dong>
        <Dong nhan="Người theo dõi">{pt.nguoiTheoDoi || 'Chưa phân công'}</Dong>
        <Dong nhan="Ngày bắt đầu">
          <span className="font-mono">{pt.ngayBatDau ? formatNgay(pt.ngayBatDau) : '—'}</span>
        </Dong>
        <Dong nhan="Dự kiến kết nạp">
          <span className="font-mono">{pt.ngayDuKienKetNap ? formatNgay(pt.ngayDuKienKetNap) : '—'}</span>
        </Dong>
      </Khoi>

      {err && <p className="rounded bg-danger-subtle p-2 text-2xs font-semibold text-danger">{err}</p>}

      <Khoi tieuDe="Quy trình 8 bước (Đ.7 QC 2815 · Điều lệ Đảng)">
        <ol className="space-y-1.5">
          {BUOC_PHAT_TRIEN_DANG.map((b, i) => {
            const daGhi = cacBuoc.find((x) => x.buoc === b.ma);
            const dangO = b.ma === pt.buocHienTai;
            const xong = !!daGhi || i < idxHienTai;
            return (
              <li key={b.ma} className={cn('rounded-lg border p-2', dangO ? 'border-primary/40 bg-primary-subtle/40' : 'border-border-subtle')}>
                <div className="flex items-start gap-2">
                  <span className={cn(
                    'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[9px] font-bold',
                    xong ? 'bg-emerald-600 text-white' : dangO ? 'bg-primary text-white' : 'border border-border bg-surface text-ink-muted',
                  )}>
                    {xong ? <Check size={10} /> : i + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className={cn('text-xs', dangO ? 'font-bold text-primary' : 'text-ink')}>{b.ten}</p>
                    {daGhi ? (
                      <p className="text-2xs text-ink-muted">
                        {daGhi.ngayHoanThanh ? formatNgay(daGhi.ngayHoanThanh) : 'đã ghi nhận'}
                        {daGhi.soVanBan && ` · VB ${daGhi.soVanBan}`}
                        {daGhi.ghiChu && ` · ${daGhi.ghiChu}`}
                      </p>
                    ) : dangGhi === b.ma ? (
                      <div className="mt-1.5 space-y-1.5">
                        <div className="grid grid-cols-2 gap-1.5">
                          <input className={miniInput} type="date" value={form.ngayHoanThanh}
                            onChange={(e) => setForm({ ...form, ngayHoanThanh: e.target.value })} />
                          <input className={miniInput} placeholder="Số văn bản" value={form.soVanBan}
                            onChange={(e) => setForm({ ...form, soVanBan: e.target.value })} />
                        </div>
                        <input className={miniInput} placeholder="Ghi chú" value={form.ghiChu}
                          onChange={(e) => setForm({ ...form, ghiChu: e.target.value })} />
                        <div className="flex gap-1">
                          <button onClick={() => ghiBuoc(b.ma)} disabled={busy}
                            className="rounded-lg bg-primary px-2 py-1 text-2xs font-bold text-white disabled:opacity-50">
                            {busy && <LoaderCircle size={10} className="mr-1 inline animate-spin" />}Lưu bước
                          </button>
                          <button onClick={() => setDangGhi(null)}
                            className="rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary">Hủy</button>
                        </div>
                      </div>
                    ) : (
                      <button onClick={() => { setForm({ ngayHoanThanh: new Date().toISOString().slice(0, 10), soVanBan: '', ghiChu: '' }); setDangGhi(b.ma); }}
                        className="mt-0.5 text-2xs font-bold text-primary hover:underline">
                        Ghi nhận hoàn thành bước này
                      </button>
                    )}
                  </div>
                </div>
              </li>
            );
          })}
        </ol>
      </Khoi>
    </div>
  );
}

// ═══ CHI TIẾT KỲ SINH HOẠT + ĐIỂM DANH ═══

const TRANG_THAI_CO_MAT: { ma: string; ten: string; cls: string }[] = [
  { ma: 'co-mat', ten: 'Có mặt', cls: 'bg-emerald-50 text-success dark:bg-emerald-900/20' },
  { ma: 'vang-co-phep', ten: 'Vắng có phép', cls: 'bg-amber-50 text-warning dark:bg-amber-900/20' },
  { ma: 'vang-khong-phep', ten: 'Vắng không phép', cls: 'bg-red-50 text-danger dark:bg-red-900/20' },
];

export function SinhHoatChiTiet({ sh }: { sh: SinhHoatDinhKy }) {
  const { data: diemDanh, refetch } = useAsyncData(() => fetchDiemDanh(sh.id), []);
  const { data: tatCaDangVien } = useAsyncData(fetchDangVien, []);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Đảng viên thuộc chi bộ này là danh sách cần điểm danh
  const thanhVien = tatCaDangVien.filter((d) => d.toChucId === sh.toChucId && d.trangThai === 'dang-sinh-hoat');
  const coMat = diemDanh.filter((d) => d.coMat === 'co-mat').length;
  const tyLe = thanhVien.length > 0 ? Math.round((coMat / thanhVien.length) * 100) : null;

  const danh = async (nhanSuId: string, coMatMoi: string) => {
    setBusy(true); setErr(null);
    try { await ghiDiemDanh(sh.id, nhanSuId, coMatMoi, ''); refetch(); }
    catch (e) { setErr(e instanceof Error ? e.message : String(e)); }
    finally { setBusy(false); }
  };

  return (
    <div className="space-y-3 p-4">
      <Khoi tieuDe="Thông tin kỳ sinh hoạt" icon={<CalendarClock size={12} />}>
        <Dong nhan="Tổ chức">{sh.toChuc}</Dong>
        <Dong nhan="Kỳ">{sh.ky}</Dong>
        <Dong nhan="Ngày họp"><span className="font-mono">{formatNgay(sh.ngayHop)}</span></Dong>
        <Dong nhan="Địa điểm">{sh.diaDiem || '—'}</Dong>
        <Dong nhan="Chủ trì">{sh.chuTri || '—'}</Dong>
        <Dong nhan="Chuyên đề">{sh.chuyenDe || '—'}</Dong>
        <Dong nhan="Số biên bản">{sh.soBienBan || '—'}</Dong>
      </Khoi>

      {sh.noiDung && (
        <Khoi tieuDe="Nội dung"><p className="whitespace-pre-wrap text-xs text-ink-secondary">{sh.noiDung}</p></Khoi>
      )}
      {sh.nghiQuyet && (
        <Khoi tieuDe="Nghị quyết"><p className="whitespace-pre-wrap text-xs text-ink-secondary">{sh.nghiQuyet}</p></Khoi>
      )}

      {err && <p className="rounded bg-danger-subtle p-2 text-2xs font-semibold text-danger">{err}</p>}

      <Khoi tieuDe={`Điểm danh${tyLe != null ? ` — ${coMat}/${thanhVien.length} có mặt (${tyLe}%)` : ''}`} icon={<Users size={12} />}>
        {thanhVien.length === 0 ? (
          <p className="text-2xs italic text-ink-muted">Chi bộ chưa có đảng viên đang sinh hoạt để điểm danh.</p>
        ) : (
          <div className="space-y-2">
            <div className="flex items-center justify-between gap-2 border-b border-border pb-2">
              <span className="text-2xs text-ink-muted font-medium">Tổng số: {thanhVien.length} đảng viên</span>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  setBusy(true); setErr(null);
                  try {
                    for (const tv of thanhVien) {
                      await ghiDiemDanh(sh.id, tv.nhanSuId, 'co-mat', '');
                    }
                    refetch();
                  } catch (e) {
                    setErr(e instanceof Error ? e.message : String(e));
                  } finally {
                    setBusy(false);
                  }
                }}
                className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-1 text-2xs font-bold text-success hover:bg-emerald-100 dark:bg-emerald-950/40 dark:text-emerald-300 disabled:opacity-50"
              >
                <Check size={12} /> Tất cả có mặt
              </button>
            </div>

            <table className="w-full">
              <thead>
                <tr>
                  <th className="th-cell">Đảng viên</th>
                  <th className="th-cell">Trạng thái</th>
                  <th className="th-cell">Lý do (nếu vắng)</th>
                </tr>
              </thead>
              <tbody>
                {thanhVien.map((tv) => {
                  const dd = diemDanh.find((d) => d.nhanSuId === tv.nhanSuId);
                  return (
                    <tr key={tv.id} className="tr-hover">
                      <td className="td-cell text-xs font-medium">{tv.hoTen}</td>
                      <td className="td-cell">
                        <div className="flex flex-wrap gap-1">
                          {TRANG_THAI_CO_MAT.map((o) => (
                            <button
                              key={o.ma}
                              disabled={busy}
                              onClick={() => danh(tv.nhanSuId, o.ma)}
                              className={cn(
                                'rounded-full px-2 py-0.5 text-2xs font-bold transition-colors disabled:opacity-50',
                                dd?.coMat === o.ma ? o.cls : 'bg-subtle text-ink-muted hover:bg-muted',
                              )}
                            >
                              {o.ten}
                            </button>
                          ))}
                        </div>
                      </td>
                      <td className="td-cell">
                        {dd?.coMat && dd.coMat !== 'co-mat' ? (
                          <input
                            type="text"
                            placeholder="Nhập lý do..."
                            defaultValue={dd.lyDo}
                            onBlur={(e) => {
                              if (e.target.value !== dd.lyDo) {
                                ghiDiemDanh(sh.id, tv.nhanSuId, dd.coMat, e.target.value);
                              }
                            }}
                            className={cn(miniInput, 'h-6 text-2xs')}
                          />
                        ) : (
                          <span className="text-2xs text-ink-muted">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Khoi>
    </div>
  );
}
