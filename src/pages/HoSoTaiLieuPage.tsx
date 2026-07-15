import { useMemo, useState } from 'react';
import { Plus, FolderOpen, Files, HardDrive, FileText, Search, Pencil, Trash2, Download, Eye, UploadCloud } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination } from '../components/TableToolbar';
import { cn } from '../lib/utils';

interface HoSoTaiLieu {
  id: string;
  tenTaiLieu: string;
  loaiHoSo: 'De-tai-KHCN' | 'Thiet-ke-Ban-ve' | 'Thu-nghiem-LAS' | 'Hanh-chinh' | 'Khac';
  nguoiTaiLen: string;
  ngayTao: string;
  dungLuong: string; // VD: 4.2 MB
  trangThai: 'Da-ky-so' | 'Ban-goc' | 'Ban-nhap';
}

const INITIAL_HO_SO: HoSoTaiLieu[] = [
  { id: '1', tenTaiLieu: 'Thuyết minh đề tài Bê tông siêu nặng chống phóng xạ hạt nhân.pdf', loaiHoSo: 'De-tai-KHCN', nguoiTaiLen: 'TS. Nguyễn Văn Hùng', ngayTao: '2025-04-10', dungLuong: '12.4 MB', trangThai: 'Da-ky-so' },
  { id: '2', tenTaiLieu: 'Bản vẽ chi tiết kết cấu hầm ngầm Nhà ga ngầm S9 - Metro 3.dwg', loaiHoSo: 'Thiet-ke-Ban-ve', nguoiTaiLen: 'KS. Lê Văn Nam', ngayTao: '2026-01-15', dungLuong: '45.8 MB', trangThai: 'Ban-goc' },
  { id: '3', tenTaiLieu: 'Phiếu kết quả thí nghiệm cường độ nén bê tông M400 - Dự án Long Thành.pdf', loaiHoSo: 'Thu-nghiem-LAS', nguoiTaiLen: 'KTV. Trần Thanh Sơn', ngayTao: '2026-06-12', dungLuong: '2.1 MB', trangThai: 'Da-ky-so' },
  { id: '4', tenTaiLieu: 'Báo cáo tổng kết khoa học năm 2025 của Viện IBST.docx', loaiHoSo: 'De-tai-KHCN', nguoiTaiLen: 'ThS. Nguyễn Thị Mai', ngayTao: '2025-12-28', dungLuong: '8.7 MB', trangThai: 'Ban-goc' },
  { id: '5', tenTaiLieu: 'Quy trình vận hành thiết bị đo gió đa hướng trong ống khí động.pdf', loaiHoSo: 'Thu-nghiem-LAS', nguoiTaiLen: 'PGS.TS. Trần Thế Anh', ngayTao: '2026-03-05', dungLuong: '5.2 MB', trangThai: 'Ban-nhap' },
  { id: '6', tenTaiLieu: 'Công văn phê duyệt Sửa đổi 1:2026 QCVN 04:2021/BXD của Bộ Xây dựng.pdf', loaiHoSo: 'Hanh-chinh', nguoiTaiLen: 'Văn thư Viện', ngayTao: '2026-02-10', dungLuong: '1.8 MB', trangThai: 'Da-ky-so' },
];

export function HoSoTaiLieuPage() {
  const [list, setList] = useState<HoSoTaiLieu[]>(INITIAL_HO_SO);
  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<HoSoTaiLieu | null>(null);

  // Form states
  const [form, setForm] = useState<Omit<HoSoTaiLieu, 'id' | 'dungLuong' | 'ngayTao'>>({
    tenTaiLieu: '',
    loaiHoSo: 'De-tai-KHCN',
    nguoiTaiLen: '',
    trangThai: 'Ban-goc',
  });

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      const q = search.toLowerCase();
      if (q && !item.tenTaiLieu.toLowerCase().includes(q) && !item.nguoiTaiLen.toLowerCase().includes(q)) return false;
      if (filterLoai && item.loaiHoSo !== filterLoai) return false;
      return true;
    });
  }, [list, search, filterLoai]);

  // Statistics
  const countKhcn = list.filter((x) => x.loaiHoSo === 'De-tai-KHCN').length;
  const countBanVe = list.filter((x) => x.loaiHoSo === 'Thiet-ke-Ban-ve').length;
  const countLims = list.filter((x) => x.loaiHoSo === 'Thu-nghiem-LAS').length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      tenTaiLieu: '',
      loaiHoSo: 'De-tai-KHCN',
      nguoiTaiLen: '',
      trangThai: 'Ban-goc',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: HoSoTaiLieu) => {
    setEditingItem(item);
    setForm({
      tenTaiLieu: item.tenTaiLieu,
      loaiHoSo: item.loaiHoSo,
      nguoiTaiLen: item.nguoiTaiLen,
      trangThai: item.trangThai,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa hồ sơ tài liệu này?')) return;
    setList(list.filter((x) => x.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem) {
      setList(list.map((x) => (x.id === editingItem.id ? { ...x, ...form } : x)));
    } else {
      const newItem: HoSoTaiLieu = {
        id: String(Date.now()),
        ngayTao: new Date().toISOString().slice(0, 10),
        dungLuong: `${(Math.random() * 10 + 1).toFixed(1)} MB`,
        ...form,
      };
      setList([...list, newItem]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Kho hồ sơ tài liệu"
        subtitle="Lưu trữ số hóa, bảo mật, quản lý phiên bản và quản trị hồ sơ khoa học kỹ thuật, thiết kế bản vẽ và báo cáo kiểm định"
        actions={
          <button className="btn-primary" onClick={handleOpenCreate}>
            <UploadCloud size={16} /> Tải tài liệu lên
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard icon={FolderOpen} label="Hồ sơ Đề tài KHCN" value={String(countKhcn)} tone="primary" />
        <KpiCard icon={Files} label="Bản vẽ kết cấu & khảo sát" value={String(countBanVe)} tone="success" />
        <KpiCard icon={FileText} label="Báo cáo thử nghiệm LIMS" value={String(countLims)} tone="warning" />
        <KpiCard icon={HardDrive} label="Tổng dung lượng đã dùng" value="76.0 MB" tone="accent" />
      </div>

      {/* Toolbar */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
            placeholder="Tìm theo tên file tài liệu, người tải lên..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          className={cn(inputCls, 'w-auto min-w-44')}
          value={filterLoai}
          onChange={(e) => setFilterLoai(e.target.value)}
        >
          <option value="">Tất cả loại hồ sơ</option>
          <option value="De-tai-KHCN">Đề tài KHCN</option>
          <option value="Thiet-ke-Ban-ve">Thiết kế & Bản vẽ</option>
          <option value="Thu-nghiem-LAS">Thí nghiệm LIMS</option>
          <option value="Hanh-chinh">Văn bản hành chính</option>
          <option value="Khac">Khác</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[800px]">
          <thead>
            <tr>
              <th className="th-cell">Tên file tài liệu</th>
              <th className="th-cell">Phân loại hồ sơ</th>
              <th className="th-cell">Người tải lên</th>
              <th className="th-cell">Dung lượng</th>
              <th className="th-cell">Ngày tạo</th>
              <th className="th-cell">Trạng thái số hóa</th>
              <th className="th-cell w-28 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="tr-hover">
                <td className="td-cell font-medium max-w-sm truncate" title={item.tenTaiLieu}>
                  <p className="flex items-center gap-2">
                    <FileText size={15} className="text-primary-500 shrink-0" />
                    <span>{item.tenTaiLieu}</span>
                  </p>
                </td>
                <td className="td-cell text-ink-secondary">
                  {item.loaiHoSo === 'De-tai-KHCN' && 'Đề tài KHCN'}
                  {item.loaiHoSo === 'Thiet-ke-Ban-ve' && 'Thiết kế - Bản vẽ'}
                  {item.loaiHoSo === 'Thu-nghiem-LAS' && 'Thí nghiệm LIMS'}
                  {item.loaiHoSo === 'Hanh-chinh' && 'Hành chính'}
                  {item.loaiHoSo === 'Khac' && 'Khác'}
                </td>
                <td className="td-cell text-ink-secondary">{item.nguoiTaiLen}</td>
                <td className="td-cell font-mono text-xs text-ink-secondary">{item.dungLuong}</td>
                <td className="td-cell font-mono text-xs">{item.ngayTao}</td>
                <td className="td-cell">
                  <span className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded text-xs font-black',
                    item.trangThai === 'Da-ky-so' && 'bg-success/10 text-success',
                    item.trangThai === 'Ban-goc' && 'bg-primary/10 text-primary',
                    item.trangThai === 'Ban-nhap' && 'bg-warning/10 text-warning'
                  )}>
                    {item.trangThai === 'Da-ky-so' && 'Đã ký số'}
                    {item.trangThai === 'Ban-goc' && 'Bản gốc'}
                    {item.trangThai === 'Ban-nhap' && 'Bản nháp'}
                  </span>
                </td>
                <td className="td-cell">
                  <div className="flex justify-end gap-1">
                    <button
                      onClick={() => alert('Đang mở file xem trực tuyến...')}
                      title="Xem trực tuyến"
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <Eye size={14} />
                    </button>
                    <button
                      onClick={() => alert('Đang tải file xuống máy...')}
                      title="Tải xuống"
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <Download size={14} />
                    </button>
                    <button
                      onClick={() => handleOpenEdit(item)}
                      title="Sửa"
                      className="rounded-md p-1.5 text-ink-muted transition-colors hover:bg-muted hover:text-primary-600"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleDelete(item.id)}
                      title="Xóa"
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
                <td colSpan={7} className="td-cell py-6 text-center text-ink-muted">
                  Không tìm thấy tài liệu phù hợp.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={editingItem ? `Sửa thông tin file: ${editingItem.tenTaiLieu}` : 'Tải tài liệu số lên hệ thống'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên tài liệu / Tên file" required>
            <input
              className={inputCls}
              required
              value={form.tenTaiLieu}
              onChange={(e) => setForm({ ...form, tenTaiLieu: e.target.value })}
              placeholder="VD: Bao-cao-tham-dinh-thiet-ke-cau-ben-cang-long-thanh.pdf"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Loại hồ sơ kỹ thuật" required>
              <select
                className={inputCls}
                value={form.loaiHoSo}
                onChange={(e) => setForm({ ...form, loaiHoSo: e.target.value as any })}
              >
                <option value="De-tai-KHCN">Đề tài KHCN</option>
                <option value="Thiet-ke-Ban-ve">Thiết kế & Bản vẽ</option>
                <option value="Thu-nghiem-LAS">Thí nghiệm LIMS</option>
                <option value="Hanh-chinh">Văn bản hành chính</option>
                <option value="Khac">Khác</option>
              </select>
            </Field>
            <Field label="Trạng thái tài liệu" required>
              <select
                className={inputCls}
                value={form.trangThai}
                onChange={(e) => setForm({ ...form, trangThai: e.target.value as any })}
              >
                <option value="Ban-goc">Bản gốc</option>
                <option value="Da-ky-so">Đã ký số (CA)</option>
                <option value="Ban-nhap">Bản nháp</option>
              </select>
            </Field>
          </div>
          <Field label="Người tải lên" required>
            <input
              className={inputCls}
              required
              value={form.nguoiTaiLen}
              onChange={(e) => setForm({ ...form, nguoiTaiLen: e.target.value })}
              placeholder="VD: TS. Nguyễn Văn A"
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
              {editingItem ? 'Lưu thay đổi' : 'Tải lên'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
