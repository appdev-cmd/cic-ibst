import { useMemo, useState } from 'react';
import { ClipboardList, Plus, Clock, User, CheckCircle2, AlertCircle, Trash2, Pencil, BarChart } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { cn } from '../lib/utils';

interface CongViec {
  id: string;
  tenCongViec: string;
  nguoiGiao: string;
  nguoiThucHien: string;
  hanHoanThanh: string; // YYYY-MM-DD
  tienDo: number; // 0 - 100
  doUuTien: 'Cao' | 'Trung-binh' | 'Thap';
  trangThai: 'Chua-bat-dau' | 'Dang-thuc-hien' | 'Hoan-thanh' | 'Tre-han';
  moTa: string;
}

const INITIAL_CONG_VIEC: CongViec[] = [
  { id: '1', tenCongViec: 'Hoàn thiện hồ sơ nghiệm thu thực tế ga S9 - Metro Line 3', nguoiGiao: 'Phó Viện trưởng Lê Văn Nam', nguoiThucHien: 'KS. Nguyễn Văn Hùng', hanHoanThanh: '2026-07-22', tienDo: 75, doUuTien: 'Cao', trangThai: 'Dang-thuc-hien', moTa: 'Nghiệm thu thực tế các cấu kiện bê tông cốt thép hầm ngầm.' },
  { id: '2', tenCongViec: 'Biên soạn Dự thảo Quy chuẩn kỹ thuật QCVN 04:2026/BXD đợt 2', nguoiGiao: 'Viện trưởng Nguyễn Văn Hùng', nguoiThucHien: 'ThS. Nguyễn Thị Mai', hanHoanThanh: '2026-07-15', tienDo: 40, doUuTien: 'Cao', trangThai: 'Tre-han', moTa: 'Chỉnh sửa theo góp ý của các thành viên Hội đồng Bộ Xây dựng.' },
  { id: '3', tenCongViec: 'Kiểm định thiết bị ống khí động tại Phòng Thí nghiệm gió', nguoiGiao: 'Phó Viện trưởng Trần Thế Anh', nguoiThucHien: 'PGS.TS. Trần Thế Anh', hanHoanThanh: '2026-07-30', tienDo: 10, doUuTien: 'Trung-binh', trangThai: 'Dang-thuc-hien', moTa: 'Liên hệ đơn vị kiểm định chuẩn để lấy giấy chứng nhận.' },
  { id: '4', tenCongViec: 'Nộp báo cáo giải ngân kinh phí đề tài cấp cơ sở đợt 1', nguoiGiao: 'Phòng QLKH', nguoiThucHien: 'Kế toán trưởng Lê Thị Hoa', hanHoanThanh: '2026-07-18', tienDo: 100, doUuTien: 'Thap', trangThai: 'Hoan-thanh', moTa: 'Đã chuyển khoản tạm ứng cho các đơn vị phối hợp.' },
];

export function CongViecPage() {
  const [list, setList] = useState<CongViec[]>(INITIAL_CONG_VIEC);
  const [filterTrangThai, setFilterTrangThai] = useState<string>('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<CongViec | null>(null);

  // Form states
  const [form, setForm] = useState<Omit<CongViec, 'id' | 'trangThai'>>({
    tenCongViec: '',
    nguoiGiao: '',
    nguoiThucHien: '',
    hanHoanThanh: '',
    tienDo: 0,
    doUuTien: 'Trung-binh',
    moTa: '',
  });

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      if (filterTrangThai === '') return true;
      return item.trangThai === filterTrangThai;
    });
  }, [list, filterTrangThai]);

  // Statistics
  const countInProg = list.filter((x) => x.trangThai === 'Dang-thuc-hien').length;
  const countOverdue = list.filter((x) => x.trangThai === 'Tre-han').length;
  const countDone = list.filter((x) => x.trangThai === 'Hoan-thanh').length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      tenCongViec: '',
      nguoiGiao: '',
      nguoiThucHien: '',
      hanHoanThanh: new Date().toISOString().slice(0, 10),
      tienDo: 0,
      doUuTien: 'Trung-binh',
      moTa: '',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: CongViec) => {
    setEditingItem(item);
    setForm({
      tenCongViec: item.tenCongViec,
      nguoiGiao: item.nguoiGiao,
      nguoiThucHien: item.nguoiThucHien,
      hanHoanThanh: item.hanHoanThanh,
      tienDo: item.tienDo,
      doUuTien: item.doUuTien,
      moTa: item.moTa,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa công việc này?')) return;
    setList(list.filter((x) => x.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().slice(0, 10);
    let trangThai: CongViec['trangThai'] = 'Chua-bat-dau';
    
    if (form.tienDo === 100) {
      trangThai = 'Hoan-thanh';
    } else if (form.hanHoanThanh < today) {
      trangThai = 'Tre-han';
    } else if (form.tienDo > 0) {
      trangThai = 'Dang-thuc-hien';
    }

    if (editingItem) {
      setList(list.map((x) => (x.id === editingItem.id ? { ...x, ...form, trangThai } : x)));
    } else {
      const newItem: CongViec = {
        id: String(Date.now()),
        trangThai,
        ...form,
      };
      setList([...list, newItem]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Quản lý công việc"
        subtitle="Hệ thống giám sát, phân công chỉ tiêu giao việc và theo dõi tiến độ thực hiện nhiệm vụ sự nghiệp khoa học của các cán bộ Viện"
        actions={
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Giao việc mới
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={Clock} label="Công việc đang thực hiện" value={String(countInProg)} tone="primary" />
        <KpiCard icon={AlertCircle} label="Công việc trễ hạn" value={String(countOverdue)} tone="accent" />
        <KpiCard icon={CheckCircle2} label="Công việc đã hoàn thành" value={String(countDone)} tone="success" />
      </div>

      {/* Toolbar */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <select
          className={cn(inputCls, 'w-auto min-w-44')}
          value={filterTrangThai}
          onChange={(e) => setFilterTrangThai(e.target.value)}
        >
          <option value="">Tất cả trạng thái</option>
          <option value="Chua-bat-dau">Chưa bắt đầu</option>
          <option value="Dang-thuc-hien">Đang thực hiện</option>
          <option value="Hoan-thanh">Đã hoàn thành</option>
          <option value="Tre-han">Trễ hạn</option>
        </select>
      </div>

      {/* Table */}
      <div className="card overflow-x-auto">
        <table className="w-full min-w-[960px]">
          <thead>
            <tr>
              <th className="th-cell">Nhiệm vụ / Công việc giao</th>
              <th className="th-cell">Người giao</th>
              <th className="th-cell">Người thực hiện</th>
              <th className="th-cell">Hạn hoàn thành</th>
              <th className="th-cell w-40">Tiến độ</th>
              <th className="th-cell text-center">Độ ưu tiên</th>
              <th className="th-cell text-center">Trạng thái</th>
              <th className="th-cell w-20 text-right">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {filteredList.map((item) => (
              <tr key={item.id} className="tr-hover">
                <td className="td-cell font-semibold max-w-sm truncate" title={item.tenCongViec}>{item.tenCongViec}</td>
                <td className="td-cell text-ink-secondary text-xs">{item.nguoiGiao}</td>
                <td className="td-cell text-ink-secondary text-xs">{item.nguoiThucHien}</td>
                <td className="td-cell font-mono text-xs text-ink-secondary">{item.hanHoanThanh}</td>
                <td className="td-cell">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-full rounded-full bg-border overflow-hidden">
                      <div className="h-full bg-primary transition-all" style={{ width: `${item.tienDo}%` }} />
                    </div>
                    <span className="text-xs font-mono font-bold shrink-0">{item.tienDo}%</span>
                  </div>
                </td>
                <td className="td-cell text-center">
                  <span className={cn(
                    'inline-flex px-1.5 py-0.5 rounded text-[10px] font-black',
                    item.doUuTien === 'Cao' && 'bg-danger/10 text-danger',
                    item.doUuTien === 'Trung-binh' && 'bg-warning/10 text-warning',
                    item.doUuTien === 'Thap' && 'bg-subtle text-ink-muted'
                  )}>
                    {item.doUuTien}
                  </span>
                </td>
                <td className="td-cell text-center">
                  <span className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-bold',
                    item.trangThai === 'Hoan-thanh' && 'bg-success/15 text-success',
                    item.trangThai === 'Dang-thuc-hien' && 'bg-primary/15 text-primary',
                    item.trangThai === 'Chua-bat-dau' && 'bg-subtle text-ink-muted',
                    item.trangThai === 'Tre-han' && 'bg-danger/15 text-danger'
                  )}>
                    {item.trangThai === 'Hoan-thanh' && 'Đã hoàn thành'}
                    {item.trangThai === 'Dang-thuc-hien' && 'Đang làm'}
                    {item.trangThai === 'Chua-bat-dau' && 'Chưa làm'}
                    {item.trangThai === 'Tre-han' && 'Trễ hạn'}
                  </span>
                </td>
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
          </tbody>
        </table>
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={editingItem ? 'Sửa thông tin công việc giao' : 'Giao việc mới cho cán bộ'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Tên công việc / Nhiệm vụ giao" required>
            <input
              className={inputCls}
              required
              value={form.tenCongViec}
              onChange={(e) => setForm({ ...form, tenCongViec: e.target.value })}
              placeholder="VD: Kiểm định nứt lún dầm biên ga S9 - Metro 3"
            />
          </Field>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Người giao việc" required>
              <input
                className={inputCls}
                required
                value={form.nguoiGiao}
                onChange={(e) => setForm({ ...form, nguoiGiao: e.target.value })}
                placeholder="VD: Viện trưởng Nguyễn Văn Hùng"
              />
            </Field>
            <Field label="Người thực hiện" required>
              <input
                className={inputCls}
                required
                value={form.nguoiThucHien}
                onChange={(e) => setForm({ ...form, nguoiThucHien: e.target.value })}
                placeholder="VD: KS. Trần Văn B"
              />
            </Field>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Hạn hoàn thành (Deadline)" required>
              <input
                type="date"
                className={inputCls}
                required
                value={form.hanHoanThanh}
                onChange={(e) => setForm({ ...form, hanHoanThanh: e.target.value })}
              />
            </Field>
            <Field label="Tiến độ thực tế (%)" required>
              <input
                type="number"
                min="0"
                max="100"
                className={inputCls}
                required
                value={form.tienDo}
                onChange={(e) => setForm({ ...form, tienDo: Number(e.target.value) })}
              />
            </Field>
            <Field label="Độ ưu tiên" required>
              <select
                className={inputCls}
                value={form.doUuTien}
                onChange={(e) => setForm({ ...form, doUuTien: e.target.value as any })}
              >
                <option value="Cao">Cao</option>
                <option value="Trung-binh">Trung bình</option>
                <option value="Thap">Thấp</option>
              </select>
            </Field>
          </div>
          <Field label="Mô tả yêu cầu chi tiết">
            <textarea
              className={cn(inputCls, 'h-24 py-2 resize-none')}
              value={form.moTa}
              onChange={(e) => setForm({ ...form, moTa: e.target.value })}
              placeholder="Ghi nhận các yêu cầu chất lượng, biểu mẫu bàn giao cần tuân thủ..."
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
              {editingItem ? 'Lưu thay đổi' : 'Giao việc'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
