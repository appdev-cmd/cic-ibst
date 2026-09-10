import { useState, useMemo, useEffect } from 'react';
import { Newspaper, FileEdit, BookOpen, Plus, Search, LoaderCircle, CheckCircle, XCircle, Pencil, Trash2 } from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { KpiCard } from '../components/KpiCard';
import { DataState } from '../components/DataState';
import { StatusBadge } from '../components/StatusBadge';
import { Field, inputCls } from '../components/Modal';
import { TableToolbar, FilterSelect } from '../components/TableToolbar';
import { useAsyncData } from '../hooks/useAsyncData';
import { useTableControls } from '../hooks/useTableControls';
import { useCrudForm } from '../hooks/useCrudForm';
import { useSlidePanelChiTiet, useSlidePanelForm } from '../hooks/useSlidePanelCrud';
import { cn, formatNgay } from '../lib/utils';
import * as tapChiSvc from '../services/tapChi';
import type { BaiBao, BaiBaoChiTiet, PhanBien, SoTapChi } from '../services/tapChi';
import { fetchNhanSuFull } from '../services/org';

const TRANG_THAI_BAI_BAO = [
  { value: 'tiep-nhan', label: 'Tiếp nhận' },
  { value: 'phan-cong-bien-tap', label: 'Phân công BTV' },
  { value: 'cho-phan-bien', label: 'Chờ phản biện' },
  { value: 'dang-phan-bien', label: 'Đang phản biện' },
  { value: 'chinh-sua', label: 'Chỉnh sửa' },
  { value: 'chap-nhan', label: 'Chấp nhận' },
  { value: 'tu-choi', label: 'Từ chối' },
  { value: 'da-xuat-ban', label: 'Đã xuất bản' }
];

const TRANG_THAI_SO_TAP_CHI = [
  { value: 'chuan-bi', label: 'Chuẩn bị' },
  { value: 'bien-tap', label: 'Biên tập' },
  { value: 'in-an', label: 'In ấn' },
  { value: 'da-xuat-ban', label: 'Đã xuất bản' }
];

const EMPTY_BAI_BAO = {
  tieuDe: '', tacGia: '', dongTacGia: [], coQuan: '', emailTacGia: '', 
  ngayNhan: '', trangThai: 'tiep-nhan', bienTapVienId: '', soTapChiId: '', 
  ghiChu: ''
};

const EMPTY_SO_TAP_CHI = {
  ten: '', nam: new Date().getFullYear(), quy: 1, ngayXuatBan: '', trangThai: 'chuan-bi', ghiChu: ''
};

export function TapChiPage() {
  const [activeTab, setActiveTab] = useState<'ban-thao' | 'so-tap-chi' | 'thong-ke'>('ban-thao');

  const { data: thongKe } = useAsyncData(tapChiSvc.thongKeTapChi, { tongSoBai: 0, baiDangXuLy: 0, baiDaXuatBan: 0, baiTuChoi: 0 } as any);
  const { data: listBaiBao, loading: loadingBB, error: errorBB, refetch: refetchBB } = useAsyncData(tapChiSvc.fetchBaiBao, []);
  const { data: listSoTapChi, loading: loadingSTC, error: errorSTC, refetch: refetchSTC } = useAsyncData(tapChiSvc.fetchSoTapChi, []);
  const { data: nhanSuList } = useAsyncData(fetchNhanSuFull, []);

  // TABS: Bản thảo & Quy trình
  const [filterTrangThaiBB, setFilterTrangThaiBB] = useState('');
  
  const filteredBaiBao = useMemo(() => {
    return listBaiBao.filter(bb => {
      if (filterTrangThaiBB && bb.trangThai !== filterTrangThaiBB) return false;
      return true;
    });
  }, [listBaiBao, filterTrangThaiBB]);
  
  const tableBaiBao = useTableControls(filteredBaiBao, bb => bb.tieuDe + ' ' + bb.tacGia);

  const crudBB = useCrudForm<BaiBao, any>({
    empty: EMPTY_BAI_BAO,
    toForm: () => EMPTY_BAI_BAO, // Simplified for now since we use custom logic to fetch full detail
    getId: bb => bb.id,
    create: async (input: any) => { await tapChiSvc.createBaiBao(input); },
    update: tapChiSvc.updateBaiBao,
    remove: tapChiSvc.deleteBaiBao,
    deleteMessage: bb => `Xóa bản thảo: ${bb.tieuDe}?`,
    onDone: refetchBB
  });

  const [chiTietId, setChiTietId] = useState<string | null>(null);
  const { data: chiTietBB, refetch: refetchChiTiet } = useAsyncData(
    () => chiTietId ? tapChiSvc.fetchBaiBaoById(chiTietId) : Promise.resolve(null),
    null as any
  );
  
  const { data: phanBienList, refetch: refetchPhanBien } = useAsyncData(
    () => chiTietId ? tapChiSvc.fetchPhanBien(chiTietId) : Promise.resolve([]),
    []
  );

  // Hook Slide Panel Chi Tiết Bài báo
  useSlidePanelChiTiet({
    id: 'bb-chitiet',
    active: !!chiTietId,
    title: 'Chi tiết Bài báo',
    subtitle: chiTietBB?.tieuDe,
    deps: [chiTietBB, phanBienList],
    onDongNgoaiLuong: () => setChiTietId(null),
    headerExtra: chiTietBB ? (
      <button 
        className="btn-ghost" 
        onClick={() => { 
          // Open edit form with full details
          crudBB.openEdit(chiTietBB as any);
          crudBB.setForm({
            tieuDe: chiTietBB.tieuDe, tacGia: chiTietBB.tacGia, dongTacGia: chiTietBB.dongTacGia,
            coQuan: chiTietBB.coQuan, emailTacGia: chiTietBB.emailTacGia, ngayNhan: chiTietBB.ngayNhan,
            trangThai: chiTietBB.trangThai, bienTapVienId: chiTietBB.bienTapVienId, soTapChiId: chiTietBB.soTapChiId,
            ghiChu: chiTietBB.ghiChu, tomTat: chiTietBB.tomTat
          });
        }}
      >
        <Pencil size={15}/> Sửa
      </button>
    ) : null,
    content: chiTietBB ? (
      <div className="p-5 space-y-6">
        <div>
          <h3 className="font-bold text-lg mb-2">{chiTietBB.tieuDe}</h3>
          <div className="grid grid-cols-2 gap-y-2 text-sm">
            <div><span className="text-ink-muted">Tác giả:</span> <b>{chiTietBB.tacGia}</b></div>
            <div><span className="text-ink-muted">Cơ quan:</span> {chiTietBB.coQuan || '—'}</div>
            <div><span className="text-ink-muted">Email:</span> {chiTietBB.emailTacGia || '—'}</div>
            <div><span className="text-ink-muted">Ngày nhận:</span> {chiTietBB.ngayNhan ? formatNgay(chiTietBB.ngayNhan) : '—'}</div>
            <div><span className="text-ink-muted">Trạng thái:</span> <StatusBadge value={chiTietBB.trangThai} /></div>
            <div><span className="text-ink-muted">Biên tập viên:</span> {chiTietBB.bienTapVienTen || '—'}</div>
          </div>
        </div>

        {chiTietBB.tomTat && (
          <div>
            <h4 className="font-bold mb-1">Tóm tắt</h4>
            <p className="text-sm bg-subtle p-3 rounded-lg text-ink-secondary">{chiTietBB.tomTat}</p>
          </div>
        )}

        <div>
          <h4 className="font-bold mb-3 border-b border-border pb-1">Đánh giá phản biện</h4>
          {phanBienList?.length ? (
            <div className="space-y-3">
              {phanBienList.map(pb => (
                <div key={pb.id} className="border border-border p-3 rounded-lg bg-surface">
                  <div className="flex justify-between mb-2">
                    <span className="font-semibold text-sm">{pb.hoTenPhanBien}</span>
                    <StatusBadge value={pb.trangThai} />
                  </div>
                  <div className="grid grid-cols-2 text-xs gap-1 text-ink-muted mb-2">
                    <div>Ngày gửi: {pb.ngayPhanCong ? formatNgay(pb.ngayPhanCong) : '—'}</div>
                    <div>Hạn trả: {pb.hanTraKetQua ? formatNgay(pb.hanTraKetQua) : '—'}</div>
                  </div>
                  {pb.ketQua && (
                    <div className="bg-subtle p-2 rounded text-xs mt-2">
                      <span className="font-semibold text-ink">Kết quả: </span>
                      {pb.ketQua === 'chap-nhan' ? 'Chấp nhận' : pb.ketQua === 'tu-choi' ? 'Từ chối' : 'Yêu cầu chỉnh sửa'}
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-ink-muted italic">Chưa có dữ liệu phản biện.</div>
          )}
        </div>
      </div>
    ) : null
  });

  // Hook Slide Panel Form Thêm/Sửa Bài Báo
  useSlidePanelForm({
    id: 'bb-form',
    open: crudBB.modalOpen,
    title: crudBB.editing ? 'Sửa thông tin Bài báo' : 'Thêm bài báo mới',
    deps: [crudBB.form, crudBB.saving, crudBB.actionError],
    onDongNgoaiLuong: crudBB.closeModal,
    footer: (
      <>
        <button type="button" onClick={crudBB.closeModal} className="btn-ghost">Hủy</button>
        <button type="submit" form="form-bb" disabled={crudBB.saving} className="btn-primary">
          {crudBB.saving && <LoaderCircle size={15} className="animate-spin" />} Lưu lại
        </button>
      </>
    ),
    content: (
      <form id="form-bb" onSubmit={crudBB.submit} className="p-5 space-y-4">
        <Field label="Tiêu đề bài báo" required>
          <textarea 
            className={cn(inputCls, 'min-h-16')} required
            value={crudBB.form.tieuDe} onChange={e => crudBB.setForm({...crudBB.form, tieuDe: e.target.value})} 
          />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tác giả chính" required>
            <input className={inputCls} required value={crudBB.form.tacGia} onChange={e => crudBB.setForm({...crudBB.form, tacGia: e.target.value})} />
          </Field>
          <Field label="Cơ quan">
            <input className={inputCls} value={crudBB.form.coQuan} onChange={e => crudBB.setForm({...crudBB.form, coQuan: e.target.value})} />
          </Field>
          <Field label="Email">
            <input type="email" className={inputCls} value={crudBB.form.emailTacGia} onChange={e => crudBB.setForm({...crudBB.form, emailTacGia: e.target.value})} />
          </Field>
          <Field label="Ngày nhận">
            <input type="date" className={inputCls} value={crudBB.form.ngayNhan} onChange={e => crudBB.setForm({...crudBB.form, ngayNhan: e.target.value})} />
          </Field>
          <Field label="Trạng thái">
            <select className={inputCls} value={crudBB.form.trangThai} onChange={e => crudBB.setForm({...crudBB.form, trangThai: e.target.value})}>
              {TRANG_THAI_BAI_BAO.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Biên tập viên">
            <select className={inputCls} value={crudBB.form.bienTapVienId} onChange={e => crudBB.setForm({...crudBB.form, bienTapVienId: e.target.value})}>
              <option value="">-- Chọn BTV --</option>
              {nhanSuList?.map(ns => <option key={ns.id} value={ns.id}>{ns.hoTen}</option>)}
            </select>
          </Field>
        </div>
        <Field label="Số tạp chí">
          <select className={inputCls} value={crudBB.form.soTapChiId} onChange={e => crudBB.setForm({...crudBB.form, soTapChiId: e.target.value})}>
            <option value="">-- Chưa chọn số --</option>
            {listSoTapChi?.map(s => <option key={s.id} value={s.id}>{s.ten}</option>)}
          </select>
        </Field>
        <Field label="Ghi chú">
          <textarea className={cn(inputCls, 'min-h-16')} value={crudBB.form.ghiChu} onChange={e => crudBB.setForm({...crudBB.form, ghiChu: e.target.value})} />
        </Field>
      </form>
    )
  });

  // TABS: Số Tạp Chí
  const crudSTC = useCrudForm<SoTapChi, any>({
    empty: EMPTY_SO_TAP_CHI,
    toForm: s => ({ ten: s.ten, nam: s.nam, quy: s.quy || 1, ngayXuatBan: s.ngayXuatBan || '', trangThai: s.trangThai, ghiChu: s.ghiChu || '' }),
    getId: s => s.id,
    create: tapChiSvc.createSoTapChi,
    update: tapChiSvc.updateSoTapChi,
    remove: async () => {}, // mock no deletion
    deleteMessage: (s: SoTapChi) => `Xóa số tạp chí: ${s.ten}?`,
    onDone: refetchSTC
  });

  // Hook Slide Panel Form Thêm/Sửa Số Tạp chí
  useSlidePanelForm({
    id: 'so-tap-chi-form',
    open: crudSTC.modalOpen,
    title: crudSTC.editing ? 'Sửa Số Tạp chí' : 'Thêm Số Tạp chí mới',
    subtitle: crudSTC.editing ? crudSTC.editing.ten : 'Điền thông tin xuất bản số tạp chí',
    icon: <BookOpen size={18} className="text-primary" />,
    storageKey: 'slideover-width-so-tap-chi-form',
    minWidth: 500,
    deps: [crudSTC.form, crudSTC.saving, crudSTC.actionError, crudSTC.editing],
    onDongNgoaiLuong: crudSTC.closeModal,
    footer: (
      <div className="flex items-center justify-end gap-2">
        <button type="button" onClick={crudSTC.closeModal} className="btn-ghost">Hủy</button>
        <button type="submit" form="form-so-tap-chi" disabled={crudSTC.saving} className="btn-primary">
          {crudSTC.saving && <LoaderCircle size={15} className="animate-spin" />} Lưu lại
        </button>
      </div>
    ),
    content: (
      <form id="form-so-tap-chi" onSubmit={crudSTC.submit} className="space-y-4">
        <Field label="Tên số" required>
          <input className={inputCls} required value={crudSTC.form.ten} onChange={e => crudSTC.setForm({...crudSTC.form, ten: e.target.value})} placeholder="VD: Số 75 - Tháng 9/2026" />
        </Field>
        <div className="grid grid-cols-2 gap-4">
          <Field label="Năm" required>
            <input type="number" className={inputCls} required value={crudSTC.form.nam} onChange={e => crudSTC.setForm({...crudSTC.form, nam: Number(e.target.value)})} />
          </Field>
          <Field label="Quý">
            <input type="number" min={1} max={4} className={inputCls} value={crudSTC.form.quy} onChange={e => crudSTC.setForm({...crudSTC.form, quy: Number(e.target.value)})} />
          </Field>
          <Field label="Trạng thái">
            <select className={inputCls} value={crudSTC.form.trangThai} onChange={e => crudSTC.setForm({...crudSTC.form, trangThai: e.target.value})}>
              {TRANG_THAI_SO_TAP_CHI.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </Field>
          <Field label="Ngày xuất bản">
            <input type="date" className={inputCls} value={crudSTC.form.ngayXuatBan} onChange={e => crudSTC.setForm({...crudSTC.form, ngayXuatBan: e.target.value})} />
          </Field>
        </div>
        <Field label="Ghi chú">
          <textarea className={cn(inputCls, 'min-h-16')} value={crudSTC.form.ghiChu} onChange={e => crudSTC.setForm({...crudSTC.form, ghiChu: e.target.value})} />
        </Field>
      </form>
    )
  });

  return (
    <div>
      <PageHeader
        title="Tạp chí KHCN Xây dựng"
        subtitle="Quản lý quy trình biên tập, phản biện và xuất bản Tạp chí"
        actions={
          activeTab === 'ban-thao' ? (
            <button className="btn-primary" onClick={crudBB.openCreate}><Plus size={16}/> Thêm bài mới</button>
          ) : activeTab === 'so-tap-chi' ? (
            <button className="btn-primary" onClick={crudSTC.openCreate}><Plus size={16}/> Thêm số mới</button>
          ) : null
        }
      />

      {/* KPI chung */}
      {activeTab !== 'thong-ke' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 mb-6">
          <KpiCard icon={Newspaper} label="Tổng bài nhận" value={String(thongKe?.tongSoBai || 0)} tone="primary" />
          <KpiCard icon={FileEdit} label="Đang xử lý" value={String(thongKe?.baiDangXuLy || 0)} tone="warning" />
          <KpiCard icon={BookOpen} label="Đã xuất bản" value={String(thongKe?.baiDaXuatBan || 0)} tone="success" />
        </div>
      )}

      {/* Tabs Menu */}
      <div className="mb-6 flex gap-4 border-b border-border">
        <button
          onClick={() => setActiveTab('ban-thao')}
          className={cn('pb-3 text-[14px] font-bold transition-all', activeTab === 'ban-thao' ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300' : 'text-ink-muted hover:text-ink')}
        >
          Bản thảo & Quy trình ({listBaiBao?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('so-tap-chi')}
          className={cn('pb-3 text-[14px] font-bold transition-all', activeTab === 'so-tap-chi' ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300' : 'text-ink-muted hover:text-ink')}
        >
          Số Tạp chí ({listSoTapChi?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('thong-ke')}
          className={cn('pb-3 text-[14px] font-bold transition-all', activeTab === 'thong-ke' ? 'border-b-2 border-primary-600 text-primary-700 dark:border-primary-400 dark:text-primary-300' : 'text-ink-muted hover:text-ink')}
        >
          Thống kê
        </button>
      </div>

      {activeTab === 'ban-thao' && (
        <>
          <DataState loading={loadingBB} error={errorBB} empty={listBaiBao.length === 0} />
          
          <TableToolbar search={tableBaiBao.search} onSearch={tableBaiBao.setSearch} placeholder="Tìm tiêu đề, tác giả..." total={tableBaiBao.total}>
            <FilterSelect value={filterTrangThaiBB} onChange={setFilterTrangThaiBB} options={TRANG_THAI_BAI_BAO} allLabel="Tất cả trạng thái" />
          </TableToolbar>

          <div className="card overflow-hidden">
            <div className="overflow-x-auto overflow-y-auto" style={{ maxHeight: 'calc(100vh - 300px)' }}>
            <table className="w-full min-w-[900px]">
              <thead className="sticky top-0 z-10 border-b border-border bg-subtle dark:bg-[#1f2332]">
                <tr>
                  <th className="th-cell w-10 text-center">#</th>
                  <th className="th-cell w-[35%]">Tiêu đề</th>
                  <th className="th-cell">Tác giả</th>
                  <th className="th-cell">Cơ quan</th>
                  <th className="th-cell">Ngày nhận</th>
                  <th className="th-cell">Trạng thái</th>
                  <th className="th-cell">Biên tập viên</th>
                </tr>
              </thead>
              <tbody>
                {tableBaiBao.filteredRows.map((bb, idx) => (
                  <tr key={bb.id} className="tr-hover cursor-pointer" onClick={() => setChiTietId(bb.id)}>
                    <td className="td-cell text-center text-xs text-ink-muted tabular-nums">{idx + 1}</td>
                    <td className="td-cell font-medium max-w-sm truncate" title={bb.tieuDe}>{bb.tieuDe}</td>
                    <td className="td-cell text-sm">{bb.tacGia}</td>
                    <td className="td-cell text-sm text-ink-muted truncate max-w-[150px]">{bb.coQuan || '—'}</td>
                    <td className="td-cell text-xs font-mono">{bb.ngayNhan ? formatNgay(bb.ngayNhan) : '—'}</td>
                    <td className="td-cell"><StatusBadge value={bb.trangThai} /></td>
                    <td className="td-cell text-sm text-ink-secondary">{bb.bienTapVienTen || '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'so-tap-chi' && (
        <>
          <DataState loading={loadingSTC} error={errorSTC} empty={listSoTapChi.length === 0} />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {listSoTapChi.map(s => (
              <div key={s.id} className="card p-4 hover:shadow-md transition cursor-pointer flex flex-col gap-2" onClick={() => crudSTC.openEdit(s)}>
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-base text-ink">{s.ten}</h3>
                  <StatusBadge value={s.trangThai} />
                </div>
                <div className="text-sm text-ink-muted">
                  Năm: {s.nam} • Quý: {s.quy || '—'}
                </div>
                <div className="mt-2 pt-2 border-t border-border flex justify-between items-center text-sm">
                  <span className="text-ink-secondary font-medium">Số bài: {s.soBai}</span>
                  {s.ngayXuatBan && <span className="text-xs text-ink-muted font-mono">XB: {formatNgay(s.ngayXuatBan)}</span>}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {activeTab === 'thong-ke' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <KpiCard icon={Newspaper} label="Tổng số bài" value={String(thongKe?.tongSoBai || 0)} tone="primary" />
            <KpiCard icon={FileEdit} label="Đang xử lý" value={String(thongKe?.baiDangXuLy || 0)} tone="warning" />
            <KpiCard icon={BookOpen} label="Đã xuất bản" value={String(thongKe?.baiDaXuatBan || 0)} tone="success" />
            <KpiCard icon={XCircle} label="Bị từ chối" value={String(thongKe?.baiTuChoi || 0)} tone="accent" />
          </div>
          
          <div className="card p-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="text-5xl font-black text-primary">
              {thongKe?.tongSoBai ? Math.round(((thongKe.baiDaXuatBan + (listBaiBao.filter(b => b.trangThai === 'chap-nhan').length || 0)) / thongKe.tongSoBai) * 100) : 0}%
            </div>
            <h3 className="font-bold text-lg text-ink-secondary">Tỷ lệ bài viết được chấp nhận & xuất bản</h3>
            <p className="text-ink-muted text-sm max-w-md mx-auto italic mt-4">
              Biểu đồ chi tiết thống kê lượng bài viết theo số, theo lĩnh vực và tác giả sẽ được bổ sung trong phiên bản tiếp theo.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
