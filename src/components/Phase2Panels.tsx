import { useState } from 'react';
import { Plus, Trash2, Check, X, LoaderCircle, Users, Archive, ShieldAlert } from 'lucide-react';
import { useAsyncData } from '../hooks/useAsyncData';
import {
  fetchLienDanh,
  createLienDanh,
  deleteLienDanh,
  fetchLuuTruHoSo,
  createLuuTruHoSo,
  deleteLuuTruHoSo,
  fetchKiemTraKhacPhuc,
  createKiemTraKhacPhuc,
  deleteKiemTraKhacPhuc,
  type LienDanhInput,
  type LuuTruHoSoInput,
  type KiemTraKhacPhucInput,
} from '../services/workflow';
import type { Option } from '../services/queries';
import { formatNgay } from '../lib/utils';

const miniInput =
  'w-full rounded border border-border bg-subtle px-2 py-1 text-xs text-ink outline-none focus:border-primary-500';

function PanelShell({
  title,
  icon: Icon,
  onAdd,
  adding,
  children,
}: {
  title: string;
  icon?: any;
  onAdd: () => void;
  adding: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-border bg-surface">
      <div className="flex items-center justify-between border-b border-border-subtle px-3 py-2">
        <h4 className="flex items-center gap-1.5 text-2xs font-black uppercase tracking-wider text-ink-muted">
          {Icon && <Icon size={13} />} {title}
        </h4>
        <button
          onClick={onAdd}
          disabled={adding}
          className="flex items-center gap-1 rounded-lg border border-border px-2 py-1 text-2xs font-bold text-ink-secondary transition-colors hover:bg-muted disabled:opacity-50"
        >
          <Plus size={11} /> Thêm mới
        </button>
      </div>
      <div className="overflow-x-auto">{children}</div>
    </div>
  );
}

/* ─── 1. LIÊN DANH PANEL (Điều 5.3, 4.7) ─── */
const LIEN_DANH_EMPTY = (hopDongId: string): LienDanhInput => ({
  hopDongId,
  tenDoiTac: '',
  maSoThue: '',
  tyLePhanTram: '',
  vaiTro: 'thanh-vien',
  giaTriPhanViec: '',
  ghiChu: '',
  soVanBanKhkt: '',
  ngayThongBaoKhkt: '',
});

export function LienDanhPanel({ hopDongId }: { hopDongId: string }) {
  const { data: list, loading, refetch } = useAsyncData(() => fetchLienDanh(hopDongId), []);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LienDanhInput>(LIEN_DANH_EMPTY(hopDongId));

  const handleSave = async () => {
    if (!form.tenDoiTac.trim()) return;
    setSaving(true);
    try {
      await createLienDanh({ ...form, hopDongId });
      setAdding(false);
      setForm(LIEN_DANH_EMPTY(hopDongId));
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa nhà thầu liên danh này?')) return;
    await deleteLienDanh(id);
    refetch();
  };

  if (loading) return <div className="p-4 text-center text-xs text-ink-muted">Đang tải danh sách liên danh...</div>;

  // Đ.4.7 — liên danh chưa ghi nhận văn bản thông báo P.KHKT: cảnh báo vi phạm.
  const chuaThongBao = list.filter((ld) => !ld.soVanBanKhkt && !ld.ngayThongBaoKhkt);

  return (
    <div className="space-y-3">
      {chuaThongBao.length > 0 && (
        <div className="flex items-start gap-2 rounded-lg border border-danger/30 bg-danger-subtle p-2.5 text-2xs font-semibold text-danger">
          <ShieldAlert size={14} className="mt-px shrink-0" />
          <span>
            Đ.4.7 QC 2815: {chuaThongBao.length} đối tác liên danh <strong>chưa ghi nhận văn bản thông báo P.KHKT</strong> trước
            khi ký thỏa thuận. Vi phạm bị xử lý theo Điều 14 — bổ sung số/ngày văn bản vào từng dòng bên dưới.
          </span>
        </div>
      )}
    <PanelShell title="Đối tác liên danh (Điều 5.3, 4.7)" icon={Users} onAdd={() => setAdding(true)} adding={adding}>
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-subtle text-2xs uppercase text-ink-muted">
          <tr>
            <th className="px-3 py-1.5 font-bold">Tên đối tác</th>
            <th className="px-3 py-1.5 font-bold">Mã số thuế</th>
            <th className="px-3 py-1.5 font-bold">Vai trò</th>
            <th className="px-3 py-1.5 font-bold text-right">% Liên danh</th>
            <th className="px-3 py-1.5 font-bold text-right">Giá trị (trđ)</th>
            <th className="px-3 py-1.5 font-bold">Thông báo KHKT (Đ.4.7)</th>
            <th className="px-3 py-1.5 font-bold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {adding && (
            <tr className="bg-primary-50/50 dark:bg-primary-950/20">
              <td className="p-2">
                <input
                  className={miniInput}
                  placeholder="Tên nhà thầu/đối tác..."
                  value={form.tenDoiTac}
                  onChange={(e) => setForm({ ...form, tenDoiTac: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  className={miniInput}
                  placeholder="MST..."
                  value={form.maSoThue}
                  onChange={(e) => setForm({ ...form, maSoThue: e.target.value })}
                />
              </td>
              <td className="p-2">
                <select
                  className={miniInput}
                  value={form.vaiTro}
                  onChange={(e) => setForm({ ...form, vaiTro: e.target.value })}
                >
                  <option value="thanh-vien">Thành viên</option>
                  <option value="dung-dau">Đứng đầu liên danh</option>
                </select>
              </td>
              <td className="p-2">
                <input
                  type="number"
                  className={`${miniInput} text-right`}
                  placeholder="%"
                  value={form.tyLePhanTram}
                  onChange={(e) => setForm({ ...form, tyLePhanTram: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  type="number"
                  className={`${miniInput} text-right`}
                  placeholder="Giá trị"
                  value={form.giaTriPhanViec}
                  onChange={(e) => setForm({ ...form, giaTriPhanViec: e.target.value })}
                />
              </td>
              <td className="p-2">
                <div className="flex flex-col gap-1">
                  <input
                    className={miniInput}
                    placeholder="Số văn bản TB KHKT..."
                    value={form.soVanBanKhkt}
                    onChange={(e) => setForm({ ...form, soVanBanKhkt: e.target.value })}
                  />
                  <input
                    type="date"
                    className={miniInput}
                    value={form.ngayThongBaoKhkt}
                    onChange={(e) => setForm({ ...form, ngayThongBaoKhkt: e.target.value })}
                  />
                </div>
              </td>
              <td className="p-2">
                <div className="flex items-center gap-1">
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-1 px-2 text-2xs">
                    {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button onClick={() => setAdding(false)} className="btn-ghost py-1 px-1.5 text-2xs">
                    <X size={12} />
                  </button>
                </div>
              </td>
            </tr>
          )}
          {list.length === 0 && !adding && (
            <tr>
              <td colSpan={7} className="px-3 py-4 text-center text-xs text-ink-muted italic">
                Chưa có thông tin liên danh
              </td>
            </tr>
          )}
          {list.map((item) => (
            <tr key={item.id} className="hover:bg-hover-row">
              <td className="px-3 py-2 font-medium">{item.tenDoiTac}</td>
              <td className="px-3 py-2 text-ink-muted">{item.maSoThue || '—'}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex rounded px-1.5 py-0.5 text-3xs font-bold ${item.vaiTro === 'dung-dau' ? 'bg-amber-100 text-amber-800' : 'bg-subtle text-ink-secondary'}`}>
                  {item.vaiTro === 'dung-dau' ? 'Đứng đầu liên danh' : 'Thành viên'}
                </span>
              </td>
              <td className="px-3 py-2 text-right font-semibold">{item.tyLePhanTram}%</td>
              <td className="px-3 py-2 text-right font-semibold">{item.giaTriPhanViec ? item.giaTriPhanViec.toLocaleString('vi-VN') : '—'}</td>
              <td className="px-3 py-2">
                {item.soVanBanKhkt || item.ngayThongBaoKhkt ? (
                  <span className="text-2xs text-emerald-700 dark:text-emerald-300 font-semibold">
                    ✓ {item.soVanBanKhkt || 'Đã thông báo'}
                    {item.ngayThongBaoKhkt && <> ({formatNgay(item.ngayThongBaoKhkt)})</>}
                  </span>
                ) : (
                  <span className="inline-flex rounded bg-danger-subtle px-1.5 py-0.5 text-3xs font-bold text-danger">
                    Chưa thông báo Đ.4.7
                  </span>
                )}
              </td>
              <td className="px-3 py-2">
                <button onClick={() => handleDelete(item.id)} className="text-danger hover:text-danger-600 p-1">
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelShell>
    </div>
  );
}

/* ─── 2. LƯU TRỮ HỒ SƠ PANEL (Điều 8) ─── */
export function LuuTruHoSoPanel({ hopDongId, nhanSuOptions }: { hopDongId: string; nhanSuOptions: Option[] }) {
  const { data: list, loading, refetch } = useAsyncData(() => fetchLuuTruHoSo(hopDongId), []);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<LuuTruHoSoInput>({
    hopDongId,
    soHoSo: '',
    viTriLuuTru: '',
    ngayNhanLuuTru: new Date().toISOString().slice(0, 10),
    nguoiBanGiaoId: '',
    nguoiNhanId: '',
    trangThai: 'da-nhan',
    thoiHanLuuTru: '',
    ghiChu: '',
  });

  const handleSave = async () => {
    setSaving(true);
    try {
      await createLuuTruHoSo({ ...form, hopDongId });
      setAdding(false);
      setForm({
        hopDongId,
        soHoSo: '',
        viTriLuuTru: '',
        ngayNhanLuuTru: new Date().toISOString().slice(0, 10),
        nguoiBanGiaoId: '',
        nguoiNhanId: '',
        trangThai: 'da-nhan',
        thoiHanLuuTru: '',
        ghiChu: '',
      });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa bản ghi lưu trữ hồ sơ này?')) return;
    await deleteLuuTruHoSo(id);
    refetch();
  };

  if (loading) return <div className="p-4 text-center text-xs text-ink-muted">Đang tải hồ sơ lưu trữ...</div>;

  return (
    <PanelShell title="Đăng ký lưu trữ hồ sơ TCHC (Điều 8)" icon={Archive} onAdd={() => setAdding(true)} adding={adding}>
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-subtle text-2xs uppercase text-ink-muted">
          <tr>
            <th className="px-3 py-1.5 font-bold">Mã/Số hồ sơ</th>
            <th className="px-3 py-1.5 font-bold">Vị trí lưu kho</th>
            <th className="px-3 py-1.5 font-bold">Ngày bàn giao</th>
            <th className="px-3 py-1.5 font-bold">Người bàn giao</th>
            <th className="px-3 py-1.5 font-bold">Trạng thái</th>
            <th className="px-3 py-1.5 font-bold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {adding && (
            <tr className="bg-primary-50/50 dark:bg-primary-950/20">
              <td className="p-2">
                <input
                  className={miniInput}
                  placeholder="Số hồ sơ..."
                  value={form.soHoSo}
                  onChange={(e) => setForm({ ...form, soHoSo: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  className={miniInput}
                  placeholder="Kệ/Tủ/Hộp..."
                  value={form.viTriLuuTru}
                  onChange={(e) => setForm({ ...form, viTriLuuTru: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  type="date"
                  className={miniInput}
                  value={form.ngayNhanLuuTru}
                  onChange={(e) => setForm({ ...form, ngayNhanLuuTru: e.target.value })}
                />
              </td>
              <td className="p-2">
                <select
                  className={miniInput}
                  value={form.nguoiBanGiaoId}
                  onChange={(e) => setForm({ ...form, nguoiBanGiaoId: e.target.value })}
                >
                  <option value="">-- Chọn --</option>
                  {nhanSuOptions.map((n) => (
                    <option key={n.id} value={n.id}>{n.ten}</option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                <select
                  className={miniInput}
                  value={form.trangThai}
                  onChange={(e) => setForm({ ...form, trangThai: e.target.value as any })}
                >
                  <option value="chua-nhan">Chưa nhận</option>
                  <option value="da-nhan">Đã nhận</option>
                  <option value="da-luu-kho">Đã lưu kho TCHC</option>
                </select>
              </td>
              <td className="p-2">
                <div className="flex items-center gap-1">
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-1 px-2 text-2xs">
                    {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button onClick={() => setAdding(false)} className="btn-ghost py-1 px-1.5 text-2xs">
                    <X size={12} />
                  </button>
                </div>
              </td>
            </tr>
          )}
          {list.length === 0 && !adding && (
            <tr>
              <td colSpan={6} className="px-3 py-4 text-center text-xs text-ink-muted italic">
                Chưa có thông tin bàn giao lưu trữ hồ sơ cho TCHC
              </td>
            </tr>
          )}
          {list.map((item) => (
            <tr key={item.id} className="hover:bg-hover-row">
              <td className="px-3 py-2 font-medium">{item.soHoSo || '—'}</td>
              <td className="px-3 py-2 text-ink-secondary">{item.viTriLuuTru || '—'}</td>
              <td className="px-3 py-2">{item.ngayNhanLuuTru ? formatNgay(item.ngayNhanLuuTru) : '—'}</td>
              <td className="px-3 py-2">{item.nguoiBanGiao || '—'}</td>
              <td className="px-3 py-2">
                <span className="inline-flex rounded px-1.5 py-0.5 text-3xs font-bold bg-emerald-100 text-emerald-800">
                  {item.trangThai === 'da-luu-kho' ? 'Đã lưu kho' : item.trangThai === 'da-nhan' ? 'Đã nhận' : 'Chưa nhận'}
                </span>
              </td>
              <td className="px-3 py-2">
                <button onClick={() => handleDelete(item.id)} className="text-danger hover:text-danger-600 p-1">
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelShell>
  );
}

/* ─── 3. KHẮC PHỤC KIẾN NGHỊ KIỂM TRA PANEL ─── */
export function KhacPhucPanel({ kiemTraId, nhanSuOptions }: { kiemTraId: string; nhanSuOptions: Option[] }) {
  const { data: list, loading, refetch } = useAsyncData(() => fetchKiemTraKhacPhuc(kiemTraId), []);
  const [adding, setAdding] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<KiemTraKhacPhucInput>({
    kiemTraId,
    noiDungKienNghi: '',
    hanKhacPhuc: '',
    nguoiPhuTrachId: '',
    trangThai: 'chua-xu-ly',
    ketQuaKhacPhuc: '',
    ngayHoanThanh: '',
  });

  const handleSave = async () => {
    if (!form.noiDungKienNghi.trim()) return;
    setSaving(true);
    try {
      await createKiemTraKhacPhuc({ ...form, kiemTraId });
      setAdding(false);
      setForm({ kiemTraId, noiDungKienNghi: '', hanKhacPhuc: '', nguoiPhuTrachId: '', trangThai: 'chua-xu-ly', ketQuaKhacPhuc: '', ngayHoanThanh: '' });
      refetch();
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Xóa kiến nghị khắc phục này?')) return;
    await deleteKiemTraKhacPhuc(id);
    refetch();
  };

  if (loading) return <div className="p-4 text-center text-xs text-ink-muted">Đang tải kiến nghị...</div>;

  return (
    <PanelShell title="Kiến nghị & Khắc phục sai phạm" icon={ShieldAlert} onAdd={() => setAdding(true)} adding={adding}>
      <table className="w-full text-left text-xs">
        <thead className="border-b border-border bg-subtle text-2xs uppercase text-ink-muted">
          <tr>
            <th className="px-3 py-1.5 font-bold">Nội dung kiến nghị</th>
            <th className="px-3 py-1.5 font-bold">Hạn khắc phục</th>
            <th className="px-3 py-1.5 font-bold">Phụ trách</th>
            <th className="px-3 py-1.5 font-bold">Trạng thái</th>
            <th className="px-3 py-1.5 font-bold">Kết quả</th>
            <th className="px-3 py-1.5 font-bold">Thao tác</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border-subtle">
          {adding && (
            <tr className="bg-primary-50/50 dark:bg-primary-950/20">
              <td className="p-2">
                <input
                  className={miniInput}
                  placeholder="Yêu cầu khắc phục..."
                  value={form.noiDungKienNghi}
                  onChange={(e) => setForm({ ...form, noiDungKienNghi: e.target.value })}
                />
              </td>
              <td className="p-2">
                <input
                  type="date"
                  className={miniInput}
                  value={form.hanKhacPhuc}
                  onChange={(e) => setForm({ ...form, hanKhacPhuc: e.target.value })}
                />
              </td>
              <td className="p-2">
                <select
                  className={miniInput}
                  value={form.nguoiPhuTrachId}
                  onChange={(e) => setForm({ ...form, nguoiPhuTrachId: e.target.value })}
                >
                  <option value="">-- Chọn --</option>
                  {nhanSuOptions.map((n) => (
                    <option key={n.id} value={n.id}>{n.ten}</option>
                  ))}
                </select>
              </td>
              <td className="p-2">
                <select
                  className={miniInput}
                  value={form.trangThai}
                  onChange={(e) => setForm({ ...form, trangThai: e.target.value as any })}
                >
                  <option value="chua-xu-ly">Chưa xử lý</option>
                  <option value="dang-xu-ly">Đang xử lý</option>
                  <option value="da-hoan-thanh">Đã hoàn thành</option>
                </select>
              </td>
              <td className="p-2">
                <input
                  className={miniInput}
                  placeholder="Ghi nhận kết quả..."
                  value={form.ketQuaKhacPhuc}
                  onChange={(e) => setForm({ ...form, ketQuaKhacPhuc: e.target.value })}
                />
              </td>
              <td className="p-2">
                <div className="flex items-center gap-1">
                  <button onClick={handleSave} disabled={saving} className="btn-primary py-1 px-2 text-2xs">
                    {saving ? <LoaderCircle size={12} className="animate-spin" /> : <Check size={12} />}
                  </button>
                  <button onClick={() => setAdding(false)} className="btn-ghost py-1 px-1.5 text-2xs">
                    <X size={12} />
                  </button>
                </div>
              </td>
            </tr>
          )}
          {list.length === 0 && !adding && (
            <tr>
              <td colSpan={6} className="px-3 py-4 text-center text-xs text-ink-muted italic">
                Chưa có yêu cầu khắc phục kiến nghị nào
              </td>
            </tr>
          )}
          {list.map((item) => (
            <tr key={item.id} className="hover:bg-hover-row">
              <td className="px-3 py-2 font-medium">{item.noiDungKienNghi}</td>
              <td className="px-3 py-2 text-ink-muted">{item.hanKhacPhuc ? formatNgay(item.hanKhacPhuc) : '—'}</td>
              <td className="px-3 py-2">{item.nguoiPhuTrach || '—'}</td>
              <td className="px-3 py-2">
                <span className={`inline-flex rounded px-1.5 py-0.5 text-3xs font-bold ${item.trangThai === 'da-hoan-thanh' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
                  {item.trangThai === 'da-hoan-thanh' ? 'Hoàn thành' : 'Đang xử lý'}
                </span>
              </td>
              <td className="px-3 py-2 text-ink-secondary">{item.ketQuaKhacPhuc || '—'}</td>
              <td className="px-3 py-2">
                <button onClick={() => handleDelete(item.id)} className="text-danger hover:text-danger-600 p-1">
                  <Trash2 size={13} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </PanelShell>
  );
}
