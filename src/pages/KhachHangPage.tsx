import { useMemo, useState } from 'react';
import { Plus, Building2, Search, Pencil, Trash2, Phone, Mail, MapPin, User, FileText } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination } from '../components/TableToolbar';
import { cn } from '../lib/utils';

interface KhachHang {
  id: string;
  tenToChuc: string;
  maSoThue: string;
  loai: 'Chu-dau-tu' | 'Nha-thau' | 'Doi-tac-KHCN' | 'Khac';
  nguoiDaiDien: string;
  soDienThoai: string;
  email: string;
  diaChi: string;
  soHopDongDaKy: number;
}

const INITIAL_KHACH_HANG: KhachHang[] = [
  { id: '1', tenToChuc: 'Tập đoàn Vingroup - Công ty CP', maSoThue: '0102187654', loai: 'Chu-dau-tu', nguoiDaiDien: 'Ông Phạm Nhật Vượng', soDienThoai: '024-39749999', email: 'info@vingroup.net', diaChi: 'Số 7 Đường Bằng Lăng 1, Vinhomes Riverside, Long Biên, Hà Nội', soHopDongDaKy: 15 },
  { id: '2', tenToChuc: 'Công ty Cổ phần Xây dựng Coteccons', maSoThue: '0303443745', loai: 'Nha-thau', nguoiDaiDien: 'Ông Bolat Duisenov', soDienThoai: '028-35142255', email: 'contact@coteccons.vn', diaChi: '236/6 Điện Biên Phủ, Phường 17, Bình Thạnh, TP. Hồ Chí Minh', soHopDongDaKy: 8 },
  { id: '3', tenToChuc: 'Viện Kiến trúc Quốc gia (VIAR)', maSoThue: '0106654321', loai: 'Doi-tac-KHCN', nguoiDaiDien: 'GS.TS. Nguyễn Đình Toàn', soDienThoai: '024-38253456', email: 'viar@moc.gov.vn', diaChi: '389 Đội Cấn, Ba Đình, Hà Nội', soHopDongDaKy: 5 },
  { id: '4', tenToChuc: 'Tập đoàn Đèo Cả', maSoThue: '0310245678', loai: 'Nha-thau', nguoiDaiDien: 'Ông Hồ Minh Hoàng', soDienThoai: '024-62823456', email: 'info@deoca.vn', diaChi: 'Tầng 26, Tòa nhà Lotte, 54 Liễu Giai, Ba Đình, Hà Nội', soHopDongDaKy: 12 },
  { id: '5', tenToChuc: 'Trường Đại học Xây dựng Hà Nội (HUCE)', maSoThue: '0101185432', loai: 'Doi-tac-KHCN', nguoiDaiDien: 'PGS.TS. Hoàng Tùng', soDienThoai: '024-38691381', email: 'dhxd@huce.edu.vn', diaChi: 'Số 55 Giải Phóng, Đồng Tâm, Hai Bà Trưng, Hà Nội', soHopDongDaKy: 3 },
];

export function KhachHangPage() {
  const [list, setList] = useState<KhachHang[]>(INITIAL_KHACH_HANG);
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<KhachHang | null>(null);

  // Form states
  const [form, setForm] = useState<Omit<KhachHang, 'id' | 'soHopDongDaKy'>>({
    tenToChuc: '',
    maSoThue: '',
    loai: 'Chu-dau-tu',
    nguoiDaiDien: '',
    soDienThoai: '',
    email: '',
    diaChi: '',
  });

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const q = search.toLowerCase();
      if (q && !item.tenToChuc.toLowerCase().includes(q) && !item.maSoThue.toLowerCase().includes(q) && !item.nguoiDaiDien.toLowerCase().includes(q)) return false;
      if (filterLoai && item.loai !== filterLoai) return false;
      return true;
    });
  }, [list, search, filterLoai]);

  // Statistics
  const countCdt = list.filter((x) => x.loai === 'Chu-dau-tu').length;
  const countNhaThau = list.filter((x) => x.loai === 'Nha-thau').length;
  const countDoiTac = list.filter((x) => x.loai === 'Doi-tac-KHCN').length;
  const totalHĐ = list.reduce((sum, item) => sum + item.soHopDongDaKy, 0);

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      tenToChuc: '',
      maSoThue: '',
      loai: 'Chu-dau-tu',
      nguoiDaiDien: '',
      soDienThoai: '',
      email: '',
      diaChi: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: KhachHang) => {
    setEditingItem(item);
    setForm({
      tenToChuc: item.tenToChuc,
      maSoThue: item.maSoThue,
      loai: item.loai,
      nguoiDaiDien: item.nguoiDaiDien,
      soDienThoai: item.soDienThoai,
      email: item.email,
      diaChi: item.diaChi,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ khách hàng/đối tác này?')) return;
    setList(list.filter((x) => x.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setList(list.map((x) => (x.id === editingItem.id ? { ...x, ...form } : x)));
    } else {
      const newItem: KhachHang = {
        id: String(Date.now()),
        soHopDongDaKy: 0,
        ...form,
      };
      setList([...list, newItem]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Khách hàng & Đối tác"
        subtitle="Quản lý thông tin hồ sơ Chủ đầu tư, Nhà thầu, Đơn vị liên danh và Đối tác hợp tác Khoa học công nghệ toàn cầu"
        actions={
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Thêm khách hàng / đối tác
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard icon={Building2} label="Chủ đầu tư" value={String(countCdt)} tone="primary" />
        <KpiCard icon={User} label="Nhà thầu / Tổng thầu" value={String(countNhaThau)} tone="success" />
        <KpiCard icon={Building2} label="Đối tác KHCN & Đào tạo" value={String(countDoiTac)} tone="warning" />
        <KpiCard icon={FileText} label="Tổng số Hợp đồng liên kết" value={String(totalHĐ)} tone="accent" />
      </div>

      {/* Toolbar */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
            placeholder="Tìm theo tên tổ chức, mã số thuế, đại diện..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={cn(inputCls, 'w-auto min-w-44')}
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
        >
          <option value="">Tất cả phân loại</option>
          <option value="Chu-dau-tu">Chủ đầu tư</option>
          <option value="Nha-thau">Nhà thầu / Tổng thầu</option>
          <option value="Doi-tac-KHCN">Đối tác KHCN</option>
          <option value="Khac">Khác</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="th-cell">Tên đơn vị / Tổ chức</th>
              <th className="th-cell">Mã số thuế</th>
              <th className="th-cell">Phân loại</th>
              <th className="th-cell">Người đại diện</th>
              <th className="th-cell">Thông tin liên hệ</th>
              <th className="th-cell">Địa chỉ trụ sở</th>
              <th className="th-cell text-center">Số HĐ ký</th>
              <th className="th-cell w-20 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="tr-hover">
                <td className="td-cell font-semibold max-w-xs truncate" title={item.tenToChuc}>{item.tenToChuc}</td>
                <td className="td-cell font-mono text-xs text-primary font-bold">{item.maSoThue}</td>
                <td className="td-cell">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-black',
                    item.loai === 'Chu-dau-tu' && 'bg-primary/10 text-primary',
                    item.loai === 'Nha-thau' && 'bg-accent-bg text-accent',
                    item.loai === 'Doi-tac-KHCN' && 'bg-success/10 text-success',
                    item.loai === 'Khac' && 'bg-subtle text-ink-muted'
                  )}>
                    {item.loai === 'Chu-dau-tu' && 'Chủ đầu tư'}
                    {item.loai === 'Nha-thau' && 'Nhà thầu'}
                    {item.loai === 'Doi-tac-KHCN' && 'Đối tác KHCN'}
                    {item.loai === 'Khac' && 'Khác'}
                  </span>
                </td>
                <td className="td-cell text-ink-secondary">{item.nguoiDaiDien}</td>
                <td className="td-cell">
                  <div className="text-xs text-ink-secondary space-y-0.5">
                    <p className="flex items-center gap-1"><Phone size={12} className="text-ink-muted" /> {item.soDienThoai}</p>
                    <p className="flex items-center gap-1"><Mail size={12} className="text-ink-muted" /> {item.email}</p>
                  </div>
                </td>
                <td className="td-cell text-ink-secondary text-xs max-w-xs truncate" title={item.diaChi}>
                  <p className="flex items-start gap-1"><MapPin size={12} className="text-ink-muted mt-0.5 shrink-0" /> {item.diaChi}</p>
                </td>
                <td className="td-cell text-center font-mono text-xs font-bold text-ink-secondary">{item.soHopDongDaKy}</td>
                <td className="td-cell">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => handleOpenEdit(item)}
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-red-50 hover:text-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredList.length === 0 && (
              <tr>
                <td colSpan={8} className="td-cell py-6 text-center text-ink-muted">
                  Không tìm thấy thông tin phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={editingItem ? `Sửa hồ sơ: ${editingItem.tenToChuc}` : 'Thêm hồ sơ Khách hàng / Đối tác'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên tổ chức / Doanh nghiệp / Đơn vị" required>
            <input
              className={inputCls}
              required
              value={form.tenToChuc}
              onChange={(e) => setForm({ ...form, tenToChuc: e.target.value })}
              placeholder="VD: Tổng công ty Xây dựng và Phát triển Hạ tầng LICOGI"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Mã số thuế" required>
              <input
                className={inputCls}
                required
                value={form.maSoThue}
                onChange={(e) => setForm({ ...form, maSoThue: e.target.value })}
                placeholder="VD: 0100123456"
              />
            </Field>
            <Field label="Phân loại đối tác" required>
              <select
                className={inputCls}
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value as any })}
              >
                <option value="Chu-dau-tu">Chủ đầu tư</option>
                <option value="Nha-thau">Nhà thầu / Tổng thầu</option>
                <option value="Doi-tac-KHCN">Đối tác khoa học công nghệ / Đào tạo</option>
                <option value="Khac">Khác</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Người đại diện pháp luật">
              <input
                className={inputCls}
                value={form.nguoiDaiDien}
                onChange={(e) => setForm({ ...form, nguoiDaiDien: e.target.value })}
                placeholder="VD: Ông Nguyễn Văn A"
              />
            </Field>
            <Field label="Số điện thoại liên hệ" required>
              <input
                className={inputCls}
                required
                value={form.soDienThoai}
                onChange={(e) => setForm({ ...form, soDienThoai: e.target.value })}
                placeholder="VD: 024-3869XXXX"
              />
            </Field>
            <Field label="Email liên hệ">
              <input
                type="email"
                className={inputCls}
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                placeholder="VD: vanphong@doitac.vn"
              />
            </Field>
          </div>
          <Field label="Địa chỉ trụ sở chính" required>
            <input
              className={inputCls}
              required
              value={form.diaChi}
              onChange={(e) => setForm({ ...form, diaChi: e.target.value })}
              placeholder="VD: Số 12A, phố ABC, quận XYZ, Hà Nội"
            />
          </Field>

          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Lưu thay đổi' : 'Thêm hồ sơ'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
