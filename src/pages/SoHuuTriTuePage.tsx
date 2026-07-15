import { useMemo, useState } from 'react';
import { Plus, Award, Lightbulb, Share2, Shield, Search, Pencil, Trash2, LoaderCircle } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { Modal, Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect, Pagination } from '../components/TableToolbar';
import { cn } from '../lib/utils';

interface BangSHTT {
  id: string;
  ten: string;
  tacGia: string;
  loai: 'Sang-che' | 'Giai-phap-huu-ich' | 'Ban-quyen-phan-mem';
  soBang: string;
  ngayCap: string;
  trangThai: 'Hieu-luc' | 'Dang-nop-don' | 'Het-han';
}

interface HopDongCGCN {
  id: string;
  tenCongNghe: string;
  benNhan: string;
  giaTri: number; // Triệu đồng
  ngayKy: string;
  trangThai: 'Hoan-thanh' | 'Dang-thuc-hien';
}

const INITIAL_SHTT: BangSHTT[] = [
  { id: '1', ten: 'Quy trình sản xuất bê tông siêu nhẹ cản xạ hạt nhân', tacGia: 'TS. Nguyễn Văn Hùng và cộng sự (VCNKC)', loai: 'Sang-che', soBang: '1-0023456', ngayCap: '2025-03-12', trangThai: 'Hieu-luc' },
  { id: '2', ten: 'Thiết bị đo áp lực gió trên mô hình nhà cao tầng trong ống khí động', tacGia: 'PGS.TS. Trần Thế Anh (Trung tâm Kỹ thuật Gió)', loai: 'Sang-che', soBang: '1-0024589', ngayCap: '2025-08-20', trangThai: 'Hieu-luc' },
  { id: '3', ten: 'Giải pháp cấu tạo giảm chấn chấn động cho công trình biển', tacGia: 'ThS. Lê Hoàng Nam (Phân viện Miền Trung)', loai: 'Giai-phap-huu-ich', soBang: '2-0004561', ngayCap: '2026-02-15', trangThai: 'Dang-nop-don' },
  { id: '4', ten: 'Phần mềm tự động hóa tính toán tải trọng gió theo tiêu chuẩn Eurocode', tacGia: 'Viện Chuyên ngành Kết cấu', loai: 'Ban-quyen-phan-mem', soBang: 'QT-2026/045', ngayCap: '2026-05-10', trangThai: 'Hieu-luc' },
  { id: '5', ten: 'Hệ thống tự động giám sát lún thời gian thực bằng cảm biến tiệm cận', tacGia: 'Trung tâm Các dự án Quốc tế', loai: 'Giai-phap-huu-ich', soBang: '2-0005112', ngayCap: '2026-06-01', trangThai: 'Hieu-luc' },
];

const INITIAL_CGCN: HopDongCGCN[] = [
  { id: '1', tenCongNghe: 'Chuyển giao công nghệ chế tạo phụ gia bê tông đông cứng nhanh', benNhan: 'Tổng công ty Đầu tư Phát triển Nhà và Đô thị HUD', giaTri: 2500, ngayKy: '2025-10-15', trangThai: 'Hoan-thanh' },
  { id: '2', tenCongNghe: 'Chuyển giao phần mềm tự động hóa thiết kế móng cọc nhà cao tầng', benNhan: 'Công ty Cổ phần Tư vấn Thiết kế Xây dựng CDC', giaTri: 450, ngayKy: '2026-01-20', trangThai: 'Hoan-thanh' },
  { id: '3', tenCongNghe: 'Chuyển giao giải pháp chống thấm kết cấu hầm ngầm đô thị', benNhan: 'Tập đoàn Đèo Cả', giaTri: 1800, ngayKy: '2026-04-12', trangThai: 'Dang-thuc-hien' },
];

export function SoHuuTriTuePage() {
  const [activeSubTab, setActiveSubTab] = useState<'shtt' | 'cgcn'>('shtt');
  const [shttList, setShttList] = useState<BangSHTT[]>(INITIAL_SHTT);
  const [cgcnList, setCgcnList] = useState<HopDongCGCN[]>(INITIAL_CGCN);

  const [search, setSearch] = useState('');
  const [filterLoai, setFilterLoai] = useState('');

  // Modals state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // Form states
  const [formShtt, setFormShtt] = useState<Omit<BangSHTT, 'id'>>({
    ten: '',
    tacGia: '',
    loai: 'Sang-che',
    soBang: '',
    ngayCap: '',
    trangThai: 'Hieu-luc',
  });

  const [formCgcn, setFormCgcn] = useState<Omit<HopDongCGCN, 'id'>>({
    tenCongNghe: '',
    benNhan: '',
    giaTri: 0,
    ngayKy: '',
    trangThai: 'Dang-thuc-hien',
  });

  // Filter lists
  const filteredShtt = useMemo(() => {
    return shttList.filter((item) => {
      const q = search.toLowerCase();
      if (q && !item.ten.toLowerCase().includes(q) && !item.tacGia.toLowerCase().includes(q) && !item.soBang.toLowerCase().includes(q)) return false;
      if (filterLoai && item.loai !== filterLoai) return false;
      return true;
    });
  }, [shttList, search, filterLoai]);

  const filteredCgcn = useMemo(() => {
    return cgcnList.filter((item) => {
      const q = search.toLowerCase();
      if (q && !item.tenCongNghe.toLowerCase().includes(q) && !item.benNhan.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [cgcnList, search]);

  // Statistics
  const countSangChe = shttList.filter((x) => x.loai === 'Sang-che').length;
  const countGiaiPhap = shttList.filter((x) => x.loai === 'Giai-phap-huu-ich').length;
  const countBanQuyen = shttList.filter((x) => x.loai === 'Ban-quyen-phan-mem').length;
  const totalGiaTriCGCN = cgcnList.reduce((sum, item) => sum + item.giaTri, 0);

  const handleOpenCreate = () => {
    setEditingItem(null);
    if (activeSubTab === 'shtt') {
      setFormShtt({
        ten: '',
        tacGia: '',
        loai: 'Sang-che',
        soBang: '',
        ngayCap: '',
        trangThai: 'Hieu-luc',
      });
    } else {
      setFormCgcn({
        tenCongNghe: '',
        benNhan: '',
        giaTri: 0,
        ngayKy: '',
        trangThai: 'Dang-thuc-hien',
      });
    }
    setModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    if (activeSubTab === 'shtt') {
      setFormShtt({
        ten: item.ten,
        tacGia: item.tacGia,
        loai: item.loai,
        soBang: item.soBang,
        ngayCap: item.ngayCap,
        trangThai: item.trangThai,
      });
    } else {
      setFormCgcn({
        tenCongNghe: item.tenCongNghe,
        benNhan: item.benNhan,
        giaTri: item.giaTri,
        ngayKy: item.ngayKy,
        trangThai: item.trangThai,
      });
    }
    setModalOpen(true);
  };

  const handleDelete = (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa bản ghi này?')) return;
    if (activeSubTab === 'shtt') {
      setShttList(shttList.filter((x) => x.id !== id));
    } else {
      setCgcnList(cgcnList.filter((x) => x.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (activeSubTab === 'shtt') {
      if (editingItem) {
        setShttList(shttList.map((x) => (x.id === editingItem.id ? { ...x, ...formShtt } : x)));
      } else {
        const newItem: BangSHTT = {
          id: String(Date.now()),
          ...formShtt,
        };
        setShttList([...shttList, newItem]);
      }
    } else {
      if (editingItem) {
        setCgcnList(cgcnList.map((x) => (x.id === editingItem.id ? { ...x, ...formCgcn } : x)));
      } else {
        const newItem: HopDongCGCN = {
          id: String(Date.now()),
          ...formCgcn,
        };
        setCgcnList([...cgcnList, newItem]);
      }
    }
    setModalOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Sở hữu trí tuệ & Chuyển giao công nghệ"
        subtitle="Bằng độc quyền sáng chế, giải pháp hữu ích, bản quyền phần mềm và chuyển giao ứng dụng thương mại"
        actions={
          <button className="btn-primary" onClick={handleOpenCreate}>
            <Plus size={16} /> Đăng ký mới
          </button>
        }
      />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-4">
        <KpiCard icon={Award} label="Bằng Sáng chế độc quyền" value={String(countSangChe)} tone="primary" />
        <KpiCard icon={Lightbulb} label="Giải pháp hữu ích" value={String(countGiaiPhap)} tone="success" />
        <KpiCard icon={Shield} label="Bản quyền phần mềm" value={String(countBanQuyen)} tone="warning" />
        <KpiCard icon={Share2} label="Chuyển giao công nghệ (Tỷ)" value={(totalGiaTriCGCN / 1000).toFixed(2)} tone="accent" />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          onClick={() => {
            setActiveSubTab('shtt');
            setSearch('');
            setFilterLoai('');
          }}
          className={cn(
            'pb-3 text-[14px] font-bold transition-all',
            activeSubTab === 'shtt'
              ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          Tài sản Sở hữu Trí tuệ ({shttList.length})
        </button>
        <button
          onClick={() => {
            setActiveSubTab('cgcn');
            setSearch('');
            setFilterLoai('');
          }}
          className={cn(
            'pb-3 text-[14px] font-bold transition-all',
            activeSubTab === 'cgcn'
              ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300'
              : 'text-ink-muted hover:text-ink',
          )}
        >
          Hợp đồng Chuyển giao công nghệ ({cgcnList.length})
        </button>
      </div>

      {/* Toolbar */}
      <div className="card mb-4 flex flex-wrap items-center gap-3 p-3">
        <div className="flex min-w-52 flex-1 items-center gap-2 rounded-lg border border-border bg-subtle px-3 py-2">
          <Search size={15} className="shrink-0 text-ink-muted" />
          <input
            className="w-full bg-transparent text-sm outline-none placeholder:text-ink-muted"
            placeholder={activeSubTab === 'shtt' ? 'Tìm theo tên bằng, tác giả, số hiệu...' : 'Tìm theo tên công nghệ, bên nhận...'}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {activeSubTab === 'shtt' && (
          <select
            className={cn(inputCls, 'w-auto min-w-44')}
            value={filterLoai}
            onChange={(e) => setFilterLoai(e.target.value)}
          >
            <option value="">Tất cả loại hình</option>
            <option value="Sang-che">Bằng Sáng chế</option>
            <option value="Giai-phap-huu-ich">Giải pháp hữu ích</option>
            <option value="Ban-quyen-phan-mem">Bản quyền phần mềm</option>
          </select>
        )}
      </div>

      {/* Tables */}
      <div className="card overflow-x-auto">
        {activeSubTab === 'shtt' ? (
          <table className="w-full min-w-[860px]">
            <thead>
              <tr>
                <th className="th-cell">Tên tài sản sáng chế / Giải pháp</th>
                <th className="th-cell">Phân loại</th>
                <th className="th-cell">Tác giả / Đơn vị sáng lập</th>
                <th className="th-cell">Số hiệu văn bằng</th>
                <th className="th-cell">Ngày cấp bằng</th>
                <th className="th-cell">Trạng thái</th>
                <th className="th-cell w-20 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredShtt.map((item) => (
                <tr key={item.id} className="tr-hover">
                  <td className="td-cell font-semibold max-w-sm truncate" title={item.ten}>{item.ten}</td>
                  <td className="td-cell text-ink-secondary">
                    {item.loai === 'Sang-che' && 'Bằng Sáng chế'}
                    {item.loai === 'Giai-phap-huu-ich' && 'Giải pháp hữu ích'}
                    {item.loai === 'Ban-quyen-phan-mem' && 'Bản quyền phần mềm'}
                  </td>
                  <td className="td-cell text-ink-secondary">{item.tacGia}</td>
                  <td className="td-cell font-mono text-xs text-primary font-bold">{item.soBang || '—'}</td>
                  <td className="td-cell font-mono text-xs">{item.ngayCap}</td>
                  <td className="td-cell">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-black',
                      item.trangThai === 'Hieu-luc' && 'bg-success/10 text-success',
                      item.trangThai === 'Dang-nop-don' && 'bg-warning/10 text-warning',
                      item.trangThai === 'Het-han' && 'bg-danger/10 text-danger'
                    )}>
                      {item.trangThai === 'Hieu-luc' && 'Hiệu lực'}
                      {item.trangThai === 'Dang-nop-don' && 'Đang nộp đơn'}
                      {item.trangThai === 'Het-han' && 'Hết hạn'}
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
              {filteredShtt.length === 0 && (
                <tr>
                  <td colSpan={7} className="td-cell py-6 text-center text-ink-muted">
                    Không tìm thấy tài sản sở hữu trí tuệ phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        ) : (
          <table className="w-full min-w-[800px]">
            <thead>
              <tr>
                <th className="th-cell">Tên công nghệ chuyển giao</th>
                <th className="th-cell">Bên nhận chuyển giao</th>
                <th className="th-cell text-right">Giá trị chuyển giao</th>
                <th className="th-cell">Ngày ký hợp đồng</th>
                <th className="th-cell">Trạng thái</th>
                <th className="th-cell w-20 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredCgcn.map((item) => (
                <tr key={item.id} className="tr-hover">
                  <td className="td-cell font-semibold max-w-sm truncate" title={item.tenCongNghe}>{item.tenCongNghe}</td>
                  <td className="td-cell text-ink-secondary">{item.benNhan}</td>
                  <td className="td-cell text-right font-mono text-xs font-bold text-success">
                    {item.giaTri.toLocaleString('vi-VN')} triệu
                  </td>
                  <td className="td-cell font-mono text-xs">{item.ngayKy}</td>
                  <td className="td-cell">
                    <span className={cn(
                      'inline-flex items-center px-2 py-0.5 rounded text-xs font-black',
                      item.trangThai === 'Hoan-thanh' && 'bg-success/10 text-success',
                      item.trangThai === 'Dang-thuc-hien' && 'bg-info/10 text-info'
                    )}>
                      {item.trangThai === 'Hoan-thanh' && 'Đã hoàn thành'}
                      {item.trangThai === 'Dang-thuc-hien' && 'Đang thực hiện'}
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
              {filteredCgcn.length === 0 && (
                <tr>
                  <td colSpan={6} className="td-cell py-6 text-center text-ink-muted">
                    Không tìm thấy hợp đồng chuyển giao công nghệ phù hợp.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Add/Edit */}
      <Modal
        title={
          editingItem
            ? `Sửa: ${activeSubTab === 'shtt' ? editingItem.ten : editingItem.tenCongNghe}`
            : activeSubTab === 'shtt'
            ? 'Đăng ký Tài sản Sở hữu trí tuệ'
            : 'Đăng ký Hợp đồng Chuyển giao công nghệ'
        }
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        wide
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {activeSubTab === 'shtt' ? (
            <>
              <Field label="Tên tài sản sở hữu trí tuệ" required>
                <input
                  className={inputCls}
                  required
                  value={formShtt.ten}
                  onChange={(e) => setFormShtt({ ...formShtt, ten: e.target.value })}
                  placeholder="VD: Quy trình sản xuất sơn chống thấm thông minh"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Phân loại" required>
                  <select
                    className={inputCls}
                    value={formShtt.loai}
                    onChange={(e) => setFormShtt({ ...formShtt, loai: e.target.value as any })}
                  >
                    <option value="Sang-che">Bằng Sáng chế</option>
                    <option value="Giai-phap-huu-ich">Giải pháp hữu ích</option>
                    <option value="Ban-quyen-phan-mem">Bản quyền phần mềm</option>
                  </select>
                </Field>
                <Field label="Trạng thái" required>
                  <select
                    className={inputCls}
                    value={formShtt.trangThai}
                    onChange={(e) => setFormShtt({ ...formShtt, trangThai: e.target.value as any })}
                  >
                    <option value="Hieu-luc">Hiệu lực</option>
                    <option value="Dang-nop-don">Đang nộp đơn</option>
                    <option value="Het-han">Hết hạn</option>
                  </select>
                </Field>
              </div>
              <Field label="Tác giả / Nhóm nghiên cứu / Đơn vị" required>
                <input
                  className={inputCls}
                  required
                  value={formShtt.tacGia}
                  onChange={(e) => setFormShtt({ ...formShtt, tacGia: e.target.value })}
                  placeholder="VD: PGS.TS. Nguyễn Văn A và cộng sự"
                />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Số hiệu văn bằng">
                  <input
                    className={inputCls}
                    value={formShtt.soBang}
                    onChange={(e) => setFormShtt({ ...formShtt, soBang: e.target.value })}
                    placeholder="VD: 1-0023456"
                  />
                </Field>
                <Field label="Ngày cấp bằng">
                  <input
                    type="date"
                    className={inputCls}
                    value={formShtt.ngayCap}
                    onChange={(e) => setFormShtt({ ...formShtt, ngayCap: e.target.value })}
                  />
                </Field>
              </div>
            </>
          ) : (
            <>
              <Field label="Tên công nghệ chuyển giao" required>
                <input
                  className={inputCls}
                  required
                  value={formCgcn.tenCongNghe}
                  onChange={(e) => setFormCgcn({ ...formCgcn, tenCongNghe: e.target.value })}
                  placeholder="VD: Hợp đồng chuyển giao sáng chế độc quyền về phụ gia bê tông"
                />
              </Field>
              <Field label="Bên nhận chuyển giao" required>
                <input
                  className={inputCls}
                  required
                  value={formCgcn.benNhan}
                  onChange={(e) => setFormCgcn({ ...formCgcn, benNhan: e.target.value })}
                  placeholder="VD: Công ty TNHH Đầu tư Xây dựng Hoà Bình"
                />
              </Field>
              <div className="grid grid-cols-3 gap-4">
                <Field label="Giá trị hợp đồng (triệu)" required>
                  <input
                    type="number"
                    min={0}
                    className={inputCls}
                    required
                    value={formCgcn.giaTri}
                    onChange={(e) => setFormCgcn({ ...formCgcn, giaTri: Number(e.target.value) })}
                  />
                </Field>
                <Field label="Ngày ký hợp đồng" required>
                  <input
                    type="date"
                    className={inputCls}
                    required
                    value={formCgcn.ngayKy}
                    onChange={(e) => setFormCgcn({ ...formCgcn, ngayKy: e.target.value })}
                  />
                </Field>
                <Field label="Trạng thái" required>
                  <select
                    className={inputCls}
                    value={formCgcn.trangThai}
                    onChange={(e) => setFormCgcn({ ...formCgcn, trangThai: e.target.value as any })}
                  >
                    <option value="Dang-thuc-hien">Đang thực hiện</option>
                    <option value="Hoan-thanh">Đã hoàn thành</option>
                  </select>
                </Field>
              </div>
            </>
          )}

          <div className="flex justify-end gap-2 border-t border-border-subtle pt-4">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="rounded-xl border border-border px-4 py-2.5 text-[13px] font-bold text-ink-secondary transition-colors hover:bg-muted"
            >
              Hủy
            </button>
            <button type="submit" className="btn-primary">
              {editingItem ? 'Lưu thay đổi' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
