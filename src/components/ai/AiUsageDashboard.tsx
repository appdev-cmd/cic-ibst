import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Activity, DollarSign, Zap, CheckCircle, RefreshCw } from 'lucide-react';
import { cn } from '../../lib/utils';
import { fetchUsageLogs, fetchUsageSummary, fetchModelPricing, updateModelPricing } from '../../services/aiUsageService';
import type { AIUsageLog, AIModelPricing, AIUsageSummaryStats, AIUsageFilterParams } from '../../services/aiUsageService';

export function AiUsageDashboard() {
  const [stats, setStats] = useState<AIUsageSummaryStats | null>(null);
  const [logs, setLogs] = useState<AIUsageLog[]>([]);
  const [pricing, setPricing] = useState<AIModelPricing[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<AIUsageFilterParams>({ period: '7-days' });
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [_stats, _logs, _pricing] = await Promise.all([
        fetchUsageSummary(filter),
        fetchUsageLogs(filter),
        fetchModelPricing()
      ]);
      setStats(_stats);
      setLogs(_logs);
      setPricing(_pricing);
      
      // Dữ liệu biểu đồ mẫu, group by tháng
      setChartData([
        { month: 'T1', gpt4: 120000, claude: 80000 },
        { month: 'T2', gpt4: 150000, claude: 90000 },
        { month: 'T3', gpt4: 180000, claude: 120000 },
      ]);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleModel = async (id: string, active: boolean) => {
    setPricing(prev => prev.map(p => p.id === id ? { ...p, active } : p));
    await updateModelPricing(id, { active });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Quản trị sử dụng AI</h2>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2">
          <RefreshCw size={16} className={cn(loading && "animate-spin")} />
          Làm mới
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-muted">Tổng chi phí VNĐ</p>
            <DollarSign size={20} className="text-primary-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">
            {stats?.totalCostVnd.toLocaleString('vi-VN')} đ
          </p>
        </div>
        <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-muted">Số lượng lượt gọi</p>
            <Activity size={20} className="text-blue-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">
            {stats?.totalCalls.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-muted">Tổng token đã dùng</p>
            <Zap size={20} className="text-amber-500" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">
            {stats?.totalTokens.toLocaleString('vi-VN')}
          </p>
        </div>
        <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <p className="text-sm font-semibold text-ink-muted">Tỷ lệ thành công</p>
            <CheckCircle size={20} className="text-success" />
          </div>
          <p className="mt-2 text-2xl font-bold text-ink">
            {stats?.successRate.toFixed(1)}%
          </p>
        </div>
      </div>

      {/* Biểu đồ chi phí */}
      <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-4 shadow-sm h-80">
        <h3 className="text-sm font-bold text-ink mb-4">Chi phí theo tháng (VNĐ)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
            <XAxis dataKey="month" className="text-xs" />
            <YAxis className="text-xs" />
            <Tooltip 
              contentStyle={{ backgroundColor: 'var(--color-surface)', borderColor: 'var(--color-border)', color: 'var(--color-ink)' }}
            />
            <Legend />
            <Bar dataKey="gpt4" name="GPT-4" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar dataKey="claude" name="Claude 3" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Bảng nhật ký */}
      <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 dark:bg-slate-900/60">
          <h3 className="text-sm font-bold text-ink">Nhật ký sử dụng</h3>
          <div className="flex items-center gap-2">
            <select 
              className="rounded-lg border border-border bg-subtle px-3 py-1.5 text-xs text-ink-secondary"
              value={filter.modelId || ''}
              onChange={e => setFilter({ ...filter, modelId: e.target.value || undefined })}
            >
              <option value="">Tất cả Model</option>
              {pricing.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
            <select 
              className="rounded-lg border border-border bg-subtle px-3 py-1.5 text-xs text-ink-secondary"
              value={filter.period}
              onChange={e => setFilter({ ...filter, period: e.target.value as any })}
            >
              <option value="today">Hôm nay</option>
              <option value="7-days">7 ngày qua</option>
              <option value="30-days">30 ngày qua</option>
              <option value="all">Tất cả</option>
            </select>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-border dark:divide-slate-700/80">
            <thead className="bg-muted/30 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-muted">Thời gian</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Người dùng</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Tính năng</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Model</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Tokens</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Chi phí</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Trạng thái</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700/80">
              {logs.map((log) => {
                const isSuccess = log.status === 'thanh_cong' || log.trang_thai === 'thanh_cong';
                return (
                  <tr key={log.id || Math.random()} className="hover:bg-muted/20 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 text-ink-secondary">{log.timestamp ? new Date(log.timestamp).toLocaleString('vi-VN') : '-'}</td>
                    <td className="px-4 py-3 text-ink">{log.userName}</td>
                    <td className="px-4 py-3 text-ink">{log.feature}</td>
                    <td className="px-4 py-3 text-ink-secondary">{log.modelName}</td>
                    <td className="px-4 py-3 text-ink">{(log.totalTokens || 0).toLocaleString('vi-VN')}</td>
                    <td className="px-4 py-3 text-ink-secondary">{(log.costVnd || 0).toLocaleString('vi-VN')} đ</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 text-2xs font-bold rounded-full", isSuccess ? "bg-success/20 text-success" : "bg-danger/20 text-danger")}>
                        {isSuccess ? 'Thành công' : 'Thất bại'}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {logs.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-ink-muted">Không có dữ liệu</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bảng giá */}
      <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden">
        <div className="p-4 border-b border-border bg-muted/30 dark:bg-slate-900/60">
          <h3 className="text-sm font-bold text-ink">Bảng giá Model (USD/1M Tokens)</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm divide-y divide-border dark:divide-slate-700/80">
            <thead className="bg-muted/30 dark:bg-slate-900/60">
              <tr>
                <th className="px-4 py-3 font-semibold text-ink-muted">Model</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Giá Input</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Giá Output</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Tỷ giá VNĐ</th>
                <th className="px-4 py-3 font-semibold text-ink-muted">Trạng thái</th>
                <th className="px-4 py-3 font-semibold text-ink-muted text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border dark:divide-slate-700/80">
              {pricing.map((p) => {
                const modelId = p.id || p.mo_hinh_ai;
                return (
                  <tr key={modelId} className="hover:bg-muted/20 dark:hover:bg-slate-800/40">
                    <td className="px-4 py-3 font-medium text-ink">{p.name || p.ten_hien_thi}</td>
                    <td className="px-4 py-3 text-ink-secondary">${(p.inputPricePer1M ?? p.gia_input_per_1m_usd ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink-secondary">${(p.outputPricePer1M ?? p.gia_output_per_1m_usd ?? 0).toFixed(2)}</td>
                    <td className="px-4 py-3 text-ink-secondary">{(p.exchangeRate ?? p.ty_gia_vnd ?? 25500).toLocaleString('vi-VN')} đ</td>
                    <td className="px-4 py-3">
                      <span className={cn("px-2 py-1 text-2xs font-bold rounded-full", p.active ? "bg-success/20 text-success" : "bg-muted text-ink-muted")}>
                        {p.active ? 'Đang bật' : 'Đã tắt'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button 
                        onClick={() => handleToggleModel(modelId, !p.active)}
                        className="text-xs font-semibold text-primary hover:underline"
                      >
                        {p.active ? 'Tắt' : 'Bật'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
