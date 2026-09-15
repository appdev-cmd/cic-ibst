import React from 'react';
import {
  Users,
  GraduationCap,
  Network,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { DashboardKpiCard } from '../components/DashboardKpiCard';
import { tooltipStyle } from '../types';
import type { DashboardComponentProps } from '../types';

export function PersonnelTab({ data, onOpenDrilldown }: DashboardComponentProps) {
  const {
    overview,
    nhanSuAnalytics,
    nhanSuBienDongData = [],
  } = data;

  const coCauHocVi = nhanSuAnalytics?.coCauHocVi || [
    { name: 'Tiến sĩ / TSKH', value: 7, color: '#8b5cf6' },
    { name: 'Thạc sĩ', value: 27, color: '#3b82f6' },
    { name: 'Kỹ sư / KTS', value: 550, color: '#10b981' },
    { name: 'Cử nhân & Khác', value: 63, color: '#f59e0b' },
  ];
  const phanBoDonVi = nhanSuAnalytics?.phanBoDonVi || [];
  const thapDoTuoi = nhanSuAnalytics?.thapDoTuoi || [];
  const gioiTinh = nhanSuAnalytics?.gioiTinh || { nam: 574, nu: 73, pctNam: 89, pctNu: 11 };
  const chungChiWarning = nhanSuAnalytics?.chungChiWarning || [];
  const dangBoSummary = nhanSuAnalytics?.dangBoSummary || { tongDangVien: 270, caoCap: 38, trungCap: 185, soCap: 47, tyLeDangVien: 42 };
  const daoTaoNcs = nhanSuAnalytics?.daoTaoNcs || [];

  const totalHocVi = coCauHocVi.reduce((acc, curr) => acc + curr.value, 0) || 647;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 4 Thẻ KPI Đầu Trang */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4.5">
        <DashboardKpiCard
          title="Tổng CBVC - NLĐ"
          value={overview.tongNhanSu || 647}
          subtitle="+63 tuyển mới, -20 nghỉ | BQ 19.9tr/th"
          icon={Users}
          color="primary"
          onClick={() => onOpenDrilldown('nhan-su')}
        />
        <DashboardKpiCard
          title="Nhân lực Trình độ Cao"
          value={`${coCauHocVi[0].value + coCauHocVi[1].value} TS & ThS`}
          subtitle={`${coCauHocVi[0].value} Tiến sĩ, ${coCauHocVi[1].value} Thạc sĩ, ${coCauHocVi[2].value} Kỹ sư`}
          icon={GraduationCap}
          color="accent"
          onClick={() => onOpenDrilldown('nhan-su')}
        />
        <DashboardKpiCard
          title="Chứng chỉ Hành nghề XD"
          value="679"
          subtitle={`11 LAS-XD toàn quốc | ${chungChiWarning.length} CCHN cần gia hạn`}
          icon={Network}
          color="success"
          onClick={() => onOpenDrilldown('nhan-su')}
        />
        <DashboardKpiCard
          title="Công tác Đảng bộ Viện"
          value={`${dangBoSummary.tongDangVien} ĐV`}
          subtitle={`18 Chi bộ | Tỷ lệ ${dangBoSummary.tyLeDangVien}% tổng nhân sự`}
          icon={ShieldCheck}
          color="danger"
        />
      </div>

      {/* Row 1: Cơ cấu Học vị & Phân bổ Nhân lực theo Đơn vị */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Donut Chart: Cơ cấu Học vị */}
        <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">Cơ cấu Trình độ & Học vị</h3>
              <span className="text-2xs font-bold px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 border border-primary-200/60 dark:border-primary-800/40">
                {overview.tongNhanSu || 647} Cán bộ
              </span>
            </div>
            <div className="h-[210px] relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={coCauHocVi}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                    stroke="none"
                  >
                    {coCauHocVi.map((entry, index) => (
                      <Cell key={`cell-hv-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip {...tooltipStyle} formatter={(val: any) => [`${val} cán bộ`, 'Số lượng']} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-xl font-black text-ink leading-none font-mono">
                  {coCauHocVi[0].value + coCauHocVi[1].value}
                </p>
                <p className="text-[10px] font-bold text-ink-muted uppercase tracking-wider mt-1">TS & ThS</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-3 border-t border-border dark:border-slate-700/80">
            {coCauHocVi.map((item, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span className="font-semibold text-ink-secondary">{item.name}</span>
                </div>
                <div className="flex items-center gap-2 font-mono font-bold">
                  <span className="text-ink">{item.value} người</span>
                  <span className="text-2xs text-ink-muted">({Math.round((item.value / totalHocVi) * 100)}%)</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Phân bổ Nhân lực theo Đơn vị */}
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
                Phân bổ Nhân lực theo Đơn vị Trực thuộc
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Quy mô quân số và tỷ lệ nhân lực trình độ cao (TS, ThS)</p>
            </div>
            <button
              type="button"
              onClick={() => onOpenDrilldown('nhan-su')}
              className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline cursor-pointer"
            >
              Xem chi tiết nhân sự &gt;
            </button>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={phanBoDonVi.slice(0, 10)} margin={{ top: 15, right: 15, bottom: 25, left: -5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={11} tickMargin={8} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-surface border border-border dark:border-slate-700/80 p-3 rounded-xl shadow-lg text-xs">
                        <p className="font-bold text-ink">{d.fullName} ({d.name})</p>
                        <p className="text-sky-600 font-semibold mt-1">Tổng nhân sự: <strong>{d.soNhanSu} người</strong></p>
                        <p className="text-purple-600 font-semibold">Tiến sĩ & Thạc sĩ: <strong>{d.tsThs} người</strong></p>
                      </div>
                    );
                  }}
                />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '500', paddingTop: '8px' }} />
                <Bar dataKey="soNhanSu" name="Tổng nhân sự" fill="#0284c7" radius={[4, 4, 0, 0]} maxBarSize={26} />
                <Bar dataKey="tsThs" name="Tiến sĩ & Thạc sĩ" fill="#8b5cf6" radius={[4, 4, 0, 0]} maxBarSize={26} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 2: Biến động tuyển dụng & Cơ cấu Tuổi / Giới tính */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch">
        <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">
                Diễn biến Tuyển dụng & Thôi việc theo tháng (2026)
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Biến động nhân lực phục vụ dự án</p>
            </div>
            <span className="text-2xs text-emerald-700 dark:text-emerald-300 font-bold bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 px-2.5 py-1 rounded-lg">
              Tăng ròng +43 CB
            </span>
          </div>
          <div className="h-[250px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={nhanSuBienDongData} margin={{ top: 15, right: 15, bottom: 5, left: -5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="var(--border-subtle)" />
                <XAxis dataKey="month" stroke="var(--text-muted)" fontSize={11} />
                <YAxis stroke="var(--text-muted)" fontSize={11} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: '12px', fontWeight: '600', paddingTop: '8px' }} />
                <Bar dataKey="tuyen" name="Tuyển mới" fill="#10b981" radius={[4, 4, 0, 0]} maxBarSize={22} />
                <Bar dataKey="nghi" name="Nghỉ việc / Tinh giản" fill="#ef4444" radius={[4, 4, 0, 0]} maxBarSize={22} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Tháp Độ tuổi & Tỷ lệ Giới tính */}
        <div className="card p-6 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">Cơ cấu Độ tuổi & Giới tính</h3>
              <span className="text-2xs font-bold text-ink-muted">Đặc thù kỹ thuật XD</span>
            </div>

            <div className="space-y-3 mb-4">
              {thapDoTuoi.map((item, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-bold text-ink">{item.nhomTuoi} <span className="text-2xs font-normal text-ink-muted">({item.moTa})</span></span>
                    <span className="font-mono font-bold text-ink">{item.soLuong} người ({item.tyLe}%)</span>
                  </div>
                  <div className="w-full bg-subtle dark:bg-slate-900/60 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary-500 h-full rounded-full"
                      style={{ width: `${item.tyLe}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-3 border-t border-border dark:border-slate-700/80 flex items-center justify-between text-xs font-mono">
            <span>Nam: <strong className="text-ink">{gioiTinh.nam} ({gioiTinh.pctNam}%)</strong></span>
            <span>Nữ: <strong className="text-ink">{gioiTinh.nu} ({gioiTinh.pctNu}%)</strong></span>
          </div>
        </div>
      </div>

      {/* Row 3: Cảnh báo Chứng chỉ Hành nghề & Đảng bộ Viện */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
        {/* Cảnh báo CCHN */}
        <div className="card p-6 lg:col-span-2 border border-border dark:border-slate-700/80 bg-surface rounded-2xl shadow-xs">
          <div className="flex items-center justify-between mb-4 border-b border-border dark:border-slate-700/80 pb-3">
            <div>
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                Cảnh báo Chứng chỉ Hành nghề Xây dựng (Sắp hết hạn trong 90 ngày)
              </h3>
              <p className="text-xs text-ink-muted mt-0.5">Phục vụ duy trì năng lực hoạt động xây dựng theo NĐ 15/2021/NĐ-CP</p>
            </div>
          </div>

          <div className="overflow-x-auto rounded-xl border border-border dark:border-slate-700/80">
            <table className="w-full text-left border-collapse text-[12.5px]">
              <thead>
                <tr className="border-b border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-900/60 font-bold text-ink">
                  <th className="py-2.5 px-3">Cán bộ</th>
                  <th className="py-2.5 px-3">Đơn vị</th>
                  <th className="py-2.5 px-3">Số hiệu</th>
                  <th className="py-2.5 px-3">Lĩnh vực</th>
                  <th className="py-2.5 px-3">Ngày hết hạn</th>
                  <th className="py-2.5 px-3 text-right">Còn lại</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60 dark:divide-slate-700/80 font-mono tabular-nums">
                {chungChiWarning.length > 0 ? (
                  chungChiWarning.map((cert) => (
                    <tr key={cert.id} className="hover:bg-muted/40 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="py-2.5 px-3 font-bold font-sans text-ink">{cert.hoTen}</td>
                      <td className="py-2.5 px-3 text-ink-secondary">{cert.donVi}</td>
                      <td className="py-2.5 px-3 text-primary-600 dark:text-primary-400 font-bold">{cert.soHieu}</td>
                      <td className="py-2.5 px-3 text-ink-secondary font-sans">{cert.linhVuc}</td>
                      <td className="py-2.5 px-3 text-rose-600 dark:text-rose-400 font-bold">
                        {new Date(cert.ngayHetHan).toLocaleDateString('vi-VN')}
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        <span className="px-2 py-0.5 rounded text-2xs font-bold bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400">
                          {cert.soNgayCon} ngày
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center py-6 text-ink-muted font-sans">
                      Tất cả chứng chỉ hành nghề hiện đang còn hiệu lực an toàn trên 90 ngày.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Đảng bộ Viện & Đào tạo NCS */}
        <div className="card p-6 lg:col-span-1 border border-border dark:border-slate-700/80 bg-surface rounded-2xl flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex justify-between items-center mb-4 border-b border-border dark:border-slate-700/80 pb-3">
              <h3 className="text-base sm:text-[17px] font-black text-ink tracking-tight">Đảng bộ & Đào tạo NCS</h3>
              <span className="text-2xs font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-950/40 px-2 py-0.5 rounded">
                Hạt nhân chính trị
              </span>
            </div>

            <div className="space-y-2.5 mb-4">
              <div className="flex justify-between items-center bg-subtle/60 dark:bg-slate-900/50 p-2.5 rounded-xl border border-border dark:border-slate-700/80">
                <span className="text-xs font-bold text-ink-secondary">Tổng số Đảng viên</span>
                <span className="text-sm font-black font-mono text-rose-600 dark:text-rose-400">{dangBoSummary.tongDangVien} đ/c</span>
              </div>
              <div className="flex justify-between items-center bg-subtle/60 dark:bg-slate-900/50 p-2.5 rounded-xl border border-border dark:border-slate-700/80">
                <span className="text-xs font-bold text-ink-secondary">Lý luận Cao cấp / Cử nhân</span>
                <span className="text-sm font-black font-mono text-primary-600 dark:text-primary-400">{dangBoSummary.caoCap} đ/c</span>
              </div>
              <div className="flex justify-between items-center bg-subtle/60 dark:bg-slate-900/50 p-2.5 rounded-xl border border-border dark:border-slate-700/80">
                <span className="text-xs font-bold text-ink-secondary">Lý luận Trung cấp</span>
                <span className="text-sm font-black font-mono text-ink">{dangBoSummary.trungCap} đ/c</span>
              </div>
            </div>

            <h4 className="text-[11px] font-black uppercase text-ink-muted tracking-wider mb-2">
              Đào tạo Tiến sĩ & NCS cấp Viện
            </h4>
            <ul className="space-y-2">
              {daoTaoNcs.map((ncs) => (
                <li key={ncs.id} className="p-2.5 rounded-xl bg-subtle/60 dark:bg-slate-900/50 border border-border dark:border-slate-700/80 text-xs">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-ink">{ncs.hoTen}</span>
                    <span className="text-3xs font-bold px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400">
                      {ncs.trangThai}
                    </span>
                  </div>
                  <p className="text-ink-secondary text-2xs mt-1 truncate" title={ncs.deTai}>
                    {ncs.deTai}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
