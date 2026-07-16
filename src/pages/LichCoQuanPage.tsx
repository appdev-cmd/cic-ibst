import { useMemo, useState } from 'react';
import { Calendar, Plus, Clock, MapPin, User, CheckCircle, AlertCircle, Trash2, Pencil, CalendarDays } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { cn } from '../lib/utils';

interface LichCongTac {
  id: string;
  ngay: string; // YYYY-MM-DD
  thu: string; // Thứ Hai, Thứ Ba...
  gio: string; // HH:MM
  noiDung: string;
  thanhPhan: string;
  chuTri: string;
  diaDiem: string; // Phòng họp số 1, Online...
  loai: 'Lich-tuan' | 'Lich-BGĐ' | 'Phong-hop';
  trangThai: 'Cho-duyet' | 'Da-duyet';
}

const INITIAL_LICH: LichCongTac[] = [
  { id: '1', ngay: '2026-07-20', thu: 'Thứ Hai', gio: '08:30', noiDung: 'Giao ban Ban Giám đốc Viện tuần 30', thanhPhan: 'Ban Giám đốc, Trưởng các đơn vị trực thuộc', chuTri: 'Viện trưởng Nguyễn Văn Hùng', diaDiem: 'Phòng hội thảo tầng 2', loai: 'Lich-BGĐ', trangThai: 'Da-duyet' },
  { id: '2', ngay: '2026-07-20', thu: 'Thứ Hai', gio: '14:00', noiDung: 'Họp rà soát tiến độ biên soạn QCVN 04:2026/BXD', thanhPhan: 'Phòng QLKH, Ban biên soạn TCVN', chuTri: 'Phó Viện trưởng Trần Thế Anh', diaDiem: 'Phòng họp số 102', loai: 'Lich-tuan', trangThai: 'Da-duyet' },
  { id: '3', ngay: '2026-07-21', thu: 'Thứ Ba', gio: '09:00', noiDung: 'Làm việc với đoàn chuyên gia JICA về thiết bị ống khí động', thanhPhan: 'Phòng TN Gió, Phòng Hợp tác Quốc tế', chuTri: 'Viện trưởng Nguyễn Văn Hùng', diaDiem: 'Phòng tiếp khách quốc tế tầng 3', loai: 'Lich-BGĐ', trangThai: 'Da-duyet' },
  { id: '4', ngay: '2026-07-22', thu: 'Thứ Tư', gio: '10:00', noiDung: 'Đăng ký phòng họp: Bảo vệ đề cương luận án NCS Nguyễn Văn B', thanhPhan: 'Hội đồng chấm luận án, NCS', chuTri: 'GS.TS. Hoàng Tùng', diaDiem: 'Phòng họp số 1 (Tầng 1)', loai: 'Phong-hop', trangThai: 'Cho-duyet' },
  { id: '5', ngay: '2026-07-23', thu: 'Thứ Năm', gio: '14:30', noiDung: 'Nghiệm thu thực tế kết cấu hầm ngầm Metro Line 3', thanhPhan: 'Đoàn công tác Phân viện chuyên ngành Kết cấu', chuTri: 'Phó Viện trưởng Lê Văn Nam', diaDiem: 'Công trường Ga ngầm S9, Hà Nội', loai: 'Lich-tuan', trangThai: 'Da-duyet' },
];

export function LichCoQuanPage() {
  const [list, setList] = useState<LichCongTac[]>(INITIAL_LICH);
  const [activeTab, setActiveTab] = useState<'lich-tuan' | 'phong-hop'>('lich-tuan');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<LichCongTac | null>(null);

  // Form states
  const [form, setForm] = useState<Omit<LichCongTac, 'id' | 'trangThai'>>({
    ngay: '',
    thu: 'Thứ Hai',
    gio: '',
    noiDung: '',
    thanhPhan: '',
    chuTri: '',
    diaDiem: '',
    loai: 'Lich-tuan',
  });

  const filteredList = useMemo(() => {
    return list.filter((item) => {
      if (activeTab === 'lich-tuan') return item.loai === 'Lich-tuan' || item.loai === 'Lich-BGĐ';
      return item.loai === 'Phong-hop';
    }).sort((a, b) => a.ngay.localeCompare(b.ngay) || a.gio.localeCompare(b.gio));
  }, [list, activeTab]);

  // Statistics
  const countWeek = list.filter((x) => x.loai !== 'Phong-hop' && x.trangThai === 'Da-duyet').length;
  const countPendingRooms = list.filter((x) => x.loai === 'Phong-hop' && x.trangThai === 'Cho-duyet').length;
  const countBgd = list.filter((x) => x.loai === 'Lich-BGĐ').length;

  const handleOpenCreate = () => {
    setEditingItem(null);
    setForm({
      ngay: new Date().toISOString().slice(0, 10),
      thu: 'Thứ Hai',
      gio: '08:30',
      noiDung: '',
      thanhPhan: '',
      chuTri: '',
      diaDiem: activeTab === 'phong-hop' ? 'Phòng họp số 1' : '',
      loai: activeTab === 'phong-hop' ? 'Phong-hop' : 'Lich-tuan',
    });
    setModalOpen(true);
  };

  const handleOpenEdit = (item: LichCongTac) => {
    setEditingItem(item);
    setForm({
      ngay: item.ngay,
      thu: item.thu,
      gio: item.gio,
      noiDung: item.noiDung,
      thanhPhan: item.thanhPhan,
      chuTri: item.chuTri,
      diaDiem: item.diaDiem,
      loai: item.loai,
    });
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa lịch này?')) return;
    setList(list.filter((x) => x.id !== id));
  };

  const handleApprove = (id: string) => {
    setList(list.map((x) => x.id === id ? { ...x, trangThai: 'Da-duyet' } : x));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Auto map YYYY-MM-DD to Day of Week
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const d = new Date(form.ngay);
    const thu = days[d.getDay()];

    if (editingItem) {
      setList(list.map((x) => (x.id === editingItem.id ? { ...x, ...form, thu } : x)));
    } else {
      const newItem: LichCongTac = {
        id: String(Date.now()),
        trangThai: form.loai === 'Phong-hop' ? 'Cho-duyet' : 'Da-duyet',
        ...form,
        thu,
      };
      setList([...list, newItem]);
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Lịch công tác cơ quan"
        subtitle="Hệ thống điều phối lịch làm việc của Ban Giám đốc Viện, quản lý lịch tuần cơ quan và đăng ký đặt lịch phòng họp trực tuyến"
        actions={
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> {activeTab === 'phong-hop' ? 'Đăng ký phòng họp' : 'Thêm lịch công tác'}
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <KpiCard icon={CalendarDays} label="Lịch công tác tuần cơ quan" value={String(countWeek)} tone="primary" />
        <KpiCard icon={Clock} label="Yêu cầu đặt phòng chờ duyệt" value={String(countPendingRooms)} tone="warning" />
        <KpiCard icon={User} label="Lịch họp Ban Giám đốc Viện" value={String(countBgd)} tone="success" />
      </div>

      {/* Tabs */}
      <div className="mb-4 border-b border-border">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('lich-tuan')}
            className={cn(
              'pb-2 text-sm font-bold border-b-2 transition-all px-1',
              activeTab === 'lich-tuan' ? 'border-primary text-primary' : 'border-transparent text-ink-muted'
            )}
          >
            Lịch tuần & Lịch họp Lãnh đạo
          </button>
          <button
            onClick={() => setActiveTab('phong-hop')}
            className={cn(
              'pb-2 text-sm font-bold border-b-2 transition-all px-1',
              activeTab === 'phong-hop' ? 'border-primary text-primary' : 'border-transparent text-ink-muted'
            )}
          >
            Đăng ký sử dụng Phòng họp ({countPendingRooms} chờ duyệt)
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="card p-4 space-y-4">
        {filteredList.length === 0 ? (
          <p className="text-center text-ink-muted py-6">Không có dữ liệu lịch làm việc phù hợp.</p>
        ) : (
          filteredList.map((item) => (
            <div key={item.id} className="flex flex-col md:flex-row md:items-start gap-4 border-b border-border-subtle pb-4 last:border-0 last:pb-0">
              {/* Date Column */}
              <div className="w-full md:w-36 shrink-0 bg-subtle p-3 rounded-lg border border-border flex flex-col items-center justify-center">
                <span className="text-sm font-bold text-ink-secondary">{item.thu}</span>
                <span className="text-xs text-ink-muted font-mono">{item.ngay}</span>
                <span className="mt-2 text-xs px-2 py-0.5 rounded-full font-bold bg-primary/10 text-primary flex items-center gap-1">
                  <Clock size={11} /> {item.gio}
                </span>
              </div>

              {/* Details Column */}
              <div className="flex-1 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-sm font-bold text-ink-primary">{item.noiDung}</h4>
                  <span className={cn(
                    'text-[10px] font-black px-1.5 py-0.5 rounded',
                    item.loai === 'Lich-BGĐ' && 'bg-success/15 text-success',
                    item.loai === 'Lich-tuan' && 'bg-primary/15 text-primary',
                    item.loai === 'Phong-hop' && 'bg-warning/15 text-warning'
                  )}>
                    {item.loai === 'Lich-BGĐ' && 'Lịch Ban Giám đốc'}
                    {item.loai === 'Lich-tuan' && 'Lịch Tuần Viện'}
                    {item.loai === 'Phong-hop' && 'Đặt phòng họp'}
                  </span>
                  {item.loai === 'Phong-hop' && (
                    <span className={cn(
                      'text-[10px] font-semibold px-1.5 py-0.5 rounded flex items-center gap-1',
                      item.trangThai === 'Da-duyet' ? 'bg-emerald-50 text-emerald-600' : 'bg-amber-50 text-amber-600'
                    )}>
                      {item.trangThai === 'Da-duyet' ? <CheckCircle size={10} /> : <AlertCircle size={10} />}
                      {item.trangThai === 'Da-duyet' ? 'Đã duyệt' : 'Chờ duyệt'}
                    </span>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-ink-secondary">
                  <p className="flex items-center gap-1"><User size={13} className="text-ink-muted" /> <strong className="text-ink-primary shrink-0">Chủ trì:</strong> {item.chuTri}</p>
                  <p className="flex items-center gap-1"><MapPin size={13} className="text-ink-muted" /> <strong className="text-ink-primary shrink-0">Địa điểm:</strong> {item.diaDiem}</p>
                  <p className="flex items-center gap-1"><Calendar size={13} className="text-ink-muted" /> <strong className="text-ink-primary shrink-0">Thành phần:</strong> {item.thanhPhan}</p>
                </div>
              </div>

              {/* Actions Column */}
              <div className="flex justify-end gap-1 shrink-0 self-center">
                {item.loai === 'Phong-hop' && item.trangThai === 'Cho-duyet' && (
                  <button
                    onClick={() => handleApprove(item.id)}
                    className="btn-primary px-2.5 py-1 text-xs"
                  >
                    Duyệt lịch
                  </button>
                )}
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
            </div>
          ))
        )}
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={editingItem ? 'Sửa thông tin lịch công tác' : activeTab === 'phong-hop' ? 'Đăng ký sử dụng phòng họp' : 'Thêm lịch công tác mới'}
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Field label="Nội dung công việc / Nội dung họp" required>
            <textarea
              className={cn(inputCls, 'h-20 py-2 resize-none')}
              required
              value={form.noiDung}
              onChange={(e) => setForm({ ...form, noiDung: e.target.value })}
              placeholder="VD: Họp tổng kết khoa học năm 2025 và triển khai kế hoạch nghiên cứu 2026..."
            />
          </Field>
          <div className="grid grid-cols-3 gap-4">
            <Field label="Ngày thực hiện" required>
              <input
                type="date"
                className={inputCls}
                required
                value={form.ngay}
                onChange={(e) => setForm({ ...form, ngay: e.target.value })}
              />
            </Field>
            <Field label="Giờ bắt đầu" required>
              <input
                type="time"
                className={inputCls}
                required
                value={form.gio}
                onChange={(e) => setForm({ ...form, gio: e.target.value })}
              />
            </Field>
            <Field label="Phân loại lịch" required>
              <select
                className={inputCls}
                value={form.loai}
                onChange={(e) => setForm({ ...form, loai: e.target.value as any })}
              >
                <option value="Lich-tuan">Lịch Tuần Viện</option>
                <option value="Lich-BGĐ">Lịch Họp Ban Giám đốc</option>
                <option value="Phong-hop">Đặt Phòng Họp / Hội trường</option>
              </select>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field label="Chủ trì cuộc họp/nhiệm vụ" required>
              <input
                className={inputCls}
                required
                value={form.chuTri}
                onChange={(e) => setForm({ ...form, chuTri: e.target.value })}
                placeholder="VD: Viện trưởng Nguyễn Văn Hùng"
              />
            </Field>
            <Field label="Địa điểm thực hiện / Tên Phòng họp" required>
              <input
                className={inputCls}
                required
                value={form.diaDiem}
                onChange={(e) => setForm({ ...form, diaDiem: e.target.value })}
                placeholder="VD: Phòng họp số 1 tầng 1 / Ga ngầm S9"
              />
            </Field>
          </div>
          <Field label="Thành phần tham dự" required>
            <input
              className={inputCls}
              required
              value={form.thanhPhan}
              onChange={(e) => setForm({ ...form, thanhPhan: e.target.value })}
              placeholder="VD: Trưởng các đơn vị trực thuộc, Ban biên soạn TCVN..."
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
              {editingItem ? 'Lưu thay đổi' : 'Đăng ký lịch'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
