import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  AlertTriangle,
  Microscope,
  DollarSign,
  Users,
  Search,
  ExternalLink,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Calendar,
  Building2,
  Filter,
} from 'lucide-react';
import type {
  DashboardData,
  DrilldownContractItem,
  DrilldownDeTaiItem,
  DrilldownNhanSuItem,
} from '../services/dashboardService';
import type { KetQuaCanhBao } from '../lib/canhBao2815';
import { formatNgay } from '../lib/utils';
import { useSlidePanel } from '../context/SlidePanelContext';

export type DashboardDrilldownTab = 'hop-dong' | 'cong-no' | 'khcn' | 'canh-bao' | 'nhan-su';

interface DashboardDetailSlidePanelProps {
  data: DashboardData;
  initialTab?: DashboardDrilldownTab;
}

export function DashboardDetailSlidePanel({
  data,
  initialTab = 'hop-dong',
}: DashboardDetailSlidePanelProps) {
  const navigate = useNavigate();
  const { closePanel } = useSlidePanel();
  const [activeTab, setActiveTab] = useState<DashboardDrilldownTab>(initialTab);
  const [search, setSearch] = useState('');

  // 1. Dữ liệu Hợp đồng lọc theo tìm kiếm
  const filteredContracts = useMemo(() => {
    const list = data.drilldown.contracts;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (h) =>
        h.soHD.toLowerCase().includes(q) ||
        h.ten.toLowerCase().includes(q) ||
        h.khachHang.toLowerCase().includes(q) ||
        h.donViThucHien.toLowerCase().includes(q) ||
        h.chuTri.toLowerCase().includes(q),
    );
  }, [data.drilldown.contracts, search]);

  // 2. Dữ liệu Công nợ lọc theo tìm kiếm
  const filteredDebts = useMemo(() => {
    const list = data.drilldown.debts;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (h) =>
        h.soHD.toLowerCase().includes(q) ||
        h.ten.toLowerCase().includes(q) ||
        h.khachHang.toLowerCase().includes(q) ||
        h.donViThucHien.toLowerCase().includes(q),
    );
  }, [data.drilldown.debts, search]);

  // 3. Dữ liệu Đề tài KHCN lọc theo tìm kiếm
  const filteredTopics = useMemo(() => {
    const list = data.drilldown.topics;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (d) =>
        d.maSo.toLowerCase().includes(q) ||
        d.ten.toLowerCase().includes(q) ||
        d.chuNhiem.toLowerCase().includes(q) ||
        d.donVi.toLowerCase().includes(q),
    );
  }, [data.drilldown.topics, search]);

  // 4. Dữ liệu Cảnh báo & Tuân thủ QC 2815
  const filteredAlerts = useMemo(() => {
    const list = data.canhBaoSummary.danhSach;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (a) =>
        a.soHopDong.toLowerCase().includes(q) ||
        a.luat.ten.toLowerCase().includes(q) ||
        a.luat.canCu.toLowerCase().includes(q) ||
        a.chiTiet.toLowerCase().includes(q),
    );
  }, [data.canhBaoSummary.danhSach, search]);

  // 5. Dữ liệu Nhân sự & Chứng chỉ
  const filteredPersonnel = useMemo(() => {
    const list = data.drilldown.personnel;
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(
      (ns) =>
        ns.hoTen.toLowerCase().includes(q) ||
        ns.donVi.toLowerCase().includes(q) ||
        ns.chucDanh.toLowerCase().includes(q) ||
        ns.chungChi.toLowerCase().includes(q),
    );
  }, [data.drilldown.personnel, search]);

  const handleNavigate = (path: string) => {
    closePanel();
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full bg-surface text-ink text-[13px]">
      {/* ── Tab Navigation ── */}
      <div className="flex items-center gap-1 p-3 border-b border-border dark:border-slate-700/80 overflow-x-auto bg-subtle/40">
        <button
          onClick={() => setActiveTab('hop-dong')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'hop-dong'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-secondary hover:bg-subtle hover:text-ink'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Hợp đồng ({data.drilldown.contracts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('cong-no')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'cong-no'
              ? 'bg-danger text-white shadow-xs'
              : 'text-ink-secondary hover:bg-subtle hover:text-ink'
          }`}
        >
          <DollarSign className="w-3.5 h-3.5" />
          <span>Công nợ ({data.drilldown.debts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('khcn')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'khcn'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-secondary hover:bg-subtle hover:text-ink'
          }`}
        >
          <Microscope className="w-3.5 h-3.5" />
          <span>Đề tài & Tiêu chuẩn ({data.drilldown.topics.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('canh-bao')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'canh-bao'
              ? 'bg-amber-600 text-white shadow-xs'
              : 'text-ink-secondary hover:bg-subtle hover:text-ink'
          }`}
        >
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Cảnh báo QC 2815 ({data.canhBaoSummary.tong})</span>
        </button>

        <button
          onClick={() => setActiveTab('nhan-su')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-bold text-[12px] whitespace-nowrap transition-all cursor-pointer ${
            activeTab === 'nhan-su'
              ? 'bg-primary-600 text-white shadow-xs'
              : 'text-ink-secondary hover:bg-subtle hover:text-ink'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Nhân sự ({data.drilldown.personnel.length})</span>
        </button>
      </div>

      {/* ── Search & Filter Bar ── */}
      <div className="p-3 border-b border-border dark:border-slate-700/80 flex items-center justify-between gap-3 bg-surface">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={`Tìm nhanh trong danh sách ${
              activeTab === 'hop-dong'
                ? 'hợp đồng, đối tác...'
                : activeTab === 'cong-no'
                ? 'công nợ khách hàng...'
                : activeTab === 'khcn'
                ? 'đề tài, mã số...'
                : activeTab === 'canh-bao'
                ? 'cảnh báo, điều khoản...'
                : 'nhân sự, chứng chỉ...'
            }`}
            className="w-full pl-9 pr-4 py-1.5 bg-subtle/50 text-ink text-[12.5px] rounded-lg border border-border dark:border-slate-700/80 focus:border-primary-500 focus:outline-none transition-colors"
          />
        </div>

        {activeTab === 'hop-dong' && (
          <button
            onClick={() => handleNavigate('/hop-dong')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors shrink-0"
          >
            <span>Vào phân hệ Hợp đồng</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {activeTab === 'cong-no' && (
          <button
            onClick={() => handleNavigate('/tai-chinh')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-danger hover:bg-danger/10 rounded-lg transition-colors shrink-0"
          >
            <span>Vào phân hệ Tài chính</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {activeTab === 'khcn' && (
          <button
            onClick={() => handleNavigate('/de-tai')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors shrink-0"
          >
            <span>Vào phân hệ Đề tài</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}

        {activeTab === 'nhan-su' && (
          <button
            onClick={() => handleNavigate('/nhan-su')}
            className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-primary-600 dark:text-primary-400 hover:bg-primary/10 rounded-lg transition-colors shrink-0"
          >
            <span>Vào phân hệ Nhân sự</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* ── Content Body ── */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {/* TAB 1: HỢP ĐỒNG */}
        {activeTab === 'hop-dong' && (
          <>
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
              <span>Hiển thị {filteredContracts.length} hợp đồng</span>
              <span>Đơn vị tính: Tỷ VNĐ</span>
            </div>
            {filteredContracts.length === 0 ? (
              <div className="p-8 text-center text-ink-muted">Không tìm thấy hợp đồng phù hợp.</div>
            ) : (
              filteredContracts.map((hd) => (
                <div
                  key={hd.id}
                  className="p-3.5 rounded-xl border border-border dark:border-slate-700/80 bg-subtle/30 dark:bg-slate-900/40 hover:border-primary-500/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-[12px]">
                          {hd.soHD || 'Chưa có số'}
                        </span>
                        {hd.nhomHD && (
                          <span className="px-1.5 py-0.5 rounded text-3xs font-black bg-primary/10 text-primary-500">
                            Nhóm {hd.nhomHD}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-subtle text-ink-muted">
                          {hd.donViThucHien}
                        </span>
                      </div>
                      <h4 className="font-bold text-ink text-[13.5px] mt-1 leading-snug">{hd.ten}</h4>
                      <p className="text-xs text-ink-secondary mt-0.5">Khách hàng: {hd.khachHang}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-ink">{hd.giaTri.toFixed(3)} tỷ</p>
                      <p className="text-2xs text-success font-semibold">Đã thu: {hd.daThanhToan.toFixed(3)} tỷ</p>
                      {hd.conLai > 0 && (
                        <p className="text-2xs text-danger font-semibold">Còn nợ: {hd.conLai.toFixed(3)} tỷ</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-2xs text-ink-muted border-t border-border/50 dark:border-slate-800 pt-2">
                    <span>Chủ trì: {hd.chuTri || 'Chưa giao'}</span>
                    <span>Hạn HT: {hd.hanHoanThanh ? formatNgay(hd.hanHoanThanh) : '—'}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 2: CÔNG NỢ */}
        {activeTab === 'cong-no' && (
          <>
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
              <span>Danh sách {filteredDebts.length} hợp đồng còn nợ lũy kế</span>
              <span>Sắp xếp theo nợ giảm dần</span>
            </div>
            {filteredDebts.length === 0 ? (
              <div className="p-8 text-center text-ink-muted">Không có hợp đồng nợ đọng.</div>
            ) : (
              filteredDebts.map((hd) => (
                <div
                  key={hd.id}
                  className="p-3.5 rounded-xl border border-red-500/20 dark:border-red-500/30 bg-red-50/20 dark:bg-red-950/10 hover:border-red-500/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-danger text-[12px]">{hd.soHD}</span>
                        <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-danger/10 text-danger">
                          {hd.donViThucHien}
                        </span>
                      </div>
                      <h4 className="font-bold text-ink text-[13.5px] mt-1 leading-snug">{hd.ten}</h4>
                      <p className="text-xs text-ink-secondary mt-0.5">Khách hàng: {hd.khachHang}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-danger">Nợ: {hd.conLai.toFixed(3)} tỷ</p>
                      <p className="text-2xs text-ink-muted">Giá trị HĐ: {hd.giaTri.toFixed(3)} tỷ</p>
                      <p className="text-2xs text-success">Đã thu: {hd.daThanhToan.toFixed(3)} tỷ</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-2xs text-ink-muted border-t border-red-200/40 dark:border-red-900/30 pt-2">
                    <span>Chủ trì: {hd.chuTri || '—'}</span>
                    <span>Hạn: {hd.hanHoanThanh ? formatNgay(hd.hanHoanThanh) : '—'}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 3: ĐỀ TÀI KHCN & TIÊU CHUẨN */}
        {activeTab === 'khcn' && (
          <>
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
              <span>Hiển thị {filteredTopics.length} nhiệm vụ KHCN</span>
              <span>Đơn vị: Tỷ VNĐ</span>
            </div>
            {filteredTopics.length === 0 ? (
              <div className="p-8 text-center text-ink-muted">Không tìm thấy nhiệm vụ KHCN phù hợp.</div>
            ) : (
              filteredTopics.map((dt) => (
                <div
                  key={dt.id}
                  className="p-3.5 rounded-xl border border-border dark:border-slate-700/80 bg-subtle/30 dark:bg-slate-900/40 hover:border-primary-500/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-primary-600 dark:text-primary-400 text-[12px]">
                          {dt.maSo}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-3xs font-black bg-primary/10 text-primary-500">
                          Cấp {dt.cap}
                        </span>
                        <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-subtle text-ink-muted">
                          {dt.donVi}
                        </span>
                      </div>
                      <h4 className="font-bold text-ink text-[13.5px] mt-1 leading-snug">{dt.ten}</h4>
                      <p className="text-xs text-ink-secondary mt-0.5">Chủ nhiệm: {dt.chuNhiem}</p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-black text-primary-600 dark:text-primary-400">
                        {dt.kinhPhi.toFixed(3)} tỷ
                      </p>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-3xs font-black mt-1 ${
                          dt.tienDo >= 80
                            ? 'bg-success/10 text-success'
                            : dt.tienDo >= 50
                            ? 'bg-primary/10 text-primary-500'
                            : 'bg-warning/10 text-warning'
                        }`}
                      >
                        Tiến độ: {dt.tienDo}%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-2xs text-ink-muted border-t border-border/50 dark:border-slate-800 pt-2">
                    <span>Trạng thái: {dt.trangThai}</span>
                    <span>Hạn nghiệm thu: {dt.hanNghiemThu ? formatNgay(dt.hanNghiemThu) : '—'}</span>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 4: CẢNH BÁO QC 2815 */}
        {activeTab === 'canh-bao' && (
          <>
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
              <span>{filteredAlerts.length} cảnh báo vi phạm quy chế</span>
              <div className="flex gap-2">
                <span className="text-danger font-bold">{data.canhBaoSummary.cao} cao</span>
                <span className="text-warning font-bold">{data.canhBaoSummary.trungBinh} cần xử lý</span>
              </div>
            </div>
            {filteredAlerts.length === 0 ? (
              <div className="p-8 text-center text-success flex flex-col items-center gap-2">
                <CheckCircle2 className="w-8 h-8" />
                <p className="font-bold">Không có vi phạm quy chế nào cần xử lý.</p>
              </div>
            ) : (
              filteredAlerts.map((cb, idx) => (
                <div
                  key={idx}
                  className={`p-3.5 rounded-xl border space-y-2 ${
                    cb.luat.mucDo === 'cao'
                      ? 'bg-red-50/30 dark:bg-red-950/20 border-red-500/30 dark:border-red-500/40'
                      : 'bg-amber-50/30 dark:bg-amber-950/20 border-amber-500/30 dark:border-amber-500/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-2.5">
                      <div
                        className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                          cb.luat.mucDo === 'cao' ? 'bg-danger text-white' : 'bg-warning text-white'
                        }`}
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-ink text-xs">{cb.soHopDong}</span>
                          <span
                            className={`px-1.5 py-0.5 rounded text-3xs font-black uppercase ${
                              cb.luat.mucDo === 'cao'
                                ? 'bg-danger/15 text-danger'
                                : 'bg-warning/15 text-warning-dark dark:text-warning'
                            }`}
                          >
                            {cb.luat.mucDo === 'cao' ? 'Nghiêm trọng' : 'Cần xử lý'}
                          </span>
                        </div>
                        <h4 className="font-bold text-ink text-[13px] mt-1">{cb.luat.ten}</h4>
                        <p className="text-xs text-ink-secondary mt-0.5 leading-relaxed">{cb.chiTiet}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-2xs text-ink-muted border-t border-border/40 dark:border-slate-800 pt-2">
                    <span className="italic">Căn cứ: {cb.luat.canCu}</span>
                    <button
                      onClick={() => handleNavigate('/hop-dong')}
                      className="text-primary-600 dark:text-primary-400 font-bold hover:underline cursor-pointer"
                    >
                      Mở hợp đồng &gt;
                    </button>
                  </div>
                </div>
              ))
            )}
          </>
        )}

        {/* TAB 5: NHÂN SỰ & CHỨNG CHỈ */}
        {activeTab === 'nhan-su' && (
          <>
            <div className="flex items-center justify-between text-xs text-ink-muted mb-1">
              <span>Danh sách {filteredPersonnel.length} cán bộ, kiểm định viên</span>
            </div>
            {filteredPersonnel.length === 0 ? (
              <div className="p-8 text-center text-ink-muted">Không tìm thấy nhân sự phù hợp.</div>
            ) : (
              filteredPersonnel.map((ns) => (
                <div
                  key={ns.id}
                  className="p-3.5 rounded-xl border border-border dark:border-slate-700/80 bg-subtle/30 dark:bg-slate-900/40 hover:border-primary-500/50 transition-all space-y-2"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-bold text-ink text-[13.5px]">{ns.hoTen}</h4>
                        {ns.hocVi && (
                          <span className="px-1.5 py-0.5 rounded text-3xs font-black bg-primary/10 text-primary-500">
                            {ns.hocVi}
                          </span>
                        )}
                        <span className="px-1.5 py-0.5 rounded text-3xs font-bold bg-subtle text-ink-muted">
                          {ns.donVi}
                        </span>
                      </div>
                      <p className="text-xs text-ink-secondary mt-0.5">Chức danh: {ns.chucDanh}</p>
                    </div>
                  </div>

                  {ns.chungChi !== '—' && (
                    <div className="flex items-center justify-between text-2xs text-ink-muted border-t border-border/50 dark:border-slate-800 pt-2">
                      <span className="truncate max-w-[280px]">Chứng chỉ: {ns.chungChi}</span>
                      <span
                        className={`font-semibold ${
                          ns.hanChungChi ? 'text-primary-600 dark:text-primary-400' : 'text-ink-muted'
                        }`}
                      >
                        Hạn CCHN: {ns.hanChungChi ? formatNgay(ns.hanChungChi) : '—'}
                      </span>
                    </div>
                  )}
                </div>
              ))
            )}
          </>
        )}
      </div>

      {/* ── SlidePanel Footer ── */}
      <div className="p-3 border-t border-border dark:border-slate-700/80 bg-subtle/50 flex items-center justify-between">
        <span className="text-2xs text-ink-muted">Hệ thống Điều hành Tổng thể IBST ERP</span>
        <button
          onClick={() => closePanel()}
          className="px-4 py-1.5 bg-subtle hover:bg-muted text-ink font-bold text-xs rounded-lg transition-colors cursor-pointer border border-border"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}
