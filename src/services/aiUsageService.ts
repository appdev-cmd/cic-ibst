import { supabase } from '../lib/supabase';

export interface AIUsageLog {
    ma_nhat_ky?: string;
    id?: string;
    ma_nguoi_dung?: string;
    ten_nguoi_dung?: string;
    userName?: string;
    phong_ban?: string;
    tinh_nang: string;
    feature?: string;
    mo_hinh_ai: string;
    modelName?: string;
    nha_cung_cap: string;
    token_input: number;
    token_output: number;
    tong_token?: number;
    totalTokens?: number;
    chi_phi_usd?: number;
    chi_phi_vnd?: number;
    costVnd?: number;
    thoi_gian_xu_ly_ms: number;
    trang_thai: 'thanh_cong' | 'loi';
    status?: 'thanh_cong' | 'loi';
    mo_ta_prompt?: string;
    ghi_chu_loi?: string;
    tao_luc?: string;
    timestamp?: string;
}

export interface AIModelPricing {
    mo_hinh_ai: string;
    id?: string;
    ten_hien_thi: string;
    name?: string;
    nha_cung_cap: string;
    gia_input_per_1m_usd: number;
    inputPricePer1M?: number;
    gia_output_per_1m_usd: number;
    outputPricePer1M?: number;
    ty_gia_vnd: number;
    exchangeRate?: number;
    dang_hoat_dong: boolean;
    active?: boolean;
}

export interface AIUsageSummaryStats {
    totalCostVnd: number;
    totalCalls: number;
    totalTokens: number;
    successRate: number;
    tong_luot_dung?: number;
    tong_token?: number;
    tong_chi_phi_vnd?: number;
}

export interface AIUsageFilterParams {
    period?: string;
    modelId?: string;
    tu_ngay?: string;
    den_ngay?: string;
    phong_ban?: string;
    ma_nguoi_dung?: string;
}

export function logAIUsage(params: AIUsageLog): void {
    Promise.resolve(supabase.rpc('ghi_nhat_ky_su_dung_ai', params as any))
        .catch(console.warn);
}

export async function fetchUsageLogs(filters: AIUsageFilterParams): Promise<AIUsageLog[]> {
    let query = supabase.from('nhat_ky_su_dung_ai').select('*').order('tao_luc', { ascending: false }).limit(100);
    
    if (filters.modelId) query = query.eq('mo_hinh_ai', filters.modelId);
    if (filters.tu_ngay) query = query.gte('tao_luc', filters.tu_ngay);
    if (filters.den_ngay) query = query.lte('tao_luc', filters.den_ngay);
    if (filters.phong_ban) query = query.eq('phong_ban', filters.phong_ban);
    if (filters.ma_nguoi_dung) query = query.eq('ma_nguoi_dung', filters.ma_nguoi_dung);
    
    const { data, error } = await query;
    if (error) {
        console.warn('fetchUsageLogs error:', error);
        return [];
    }
    return (data || []).map((row: any) => ({
        ...row,
        id: row.ma_nhat_ky,
        timestamp: row.tao_luc,
        userName: row.ten_nguoi_dung || 'Người dùng',
        feature: row.tinh_nang,
        modelName: row.mo_hinh_ai,
        totalTokens: row.tong_token || (row.token_input + row.token_output),
        costVnd: Number(row.chi_phi_vnd || 0),
        status: row.trang_thai,
    }));
}

export async function fetchUsageSummary(filters: AIUsageFilterParams): Promise<AIUsageSummaryStats> {
    const logs = await fetchUsageLogs(filters);
    const totalCalls = logs.length;
    const totalTokens = logs.reduce((sum, l) => sum + (l.totalTokens || 0), 0);
    const totalCostVnd = logs.reduce((sum, l) => sum + (l.costVnd || 0), 0);
    const successCalls = logs.filter(l => l.status === 'thanh_cong' || l.trang_thai === 'thanh_cong').length;
    const successRate = totalCalls > 0 ? (successCalls / totalCalls) * 100 : 100;
    
    return {
        totalCostVnd,
        totalCalls,
        totalTokens,
        successRate,
        tong_luot_dung: totalCalls,
        tong_token: totalTokens,
        tong_chi_phi_vnd: totalCostVnd,
    };
}

export async function fetchModelPricing(): Promise<AIModelPricing[]> {
    const { data, error } = await supabase.from('cau_hinh_gia_ai').select('*');
    if (error) {
        console.warn('fetchModelPricing error:', error);
        return [];
    }
    return (data || []).map((row: any) => ({
        ...row,
        id: row.mo_hinh_ai,
        name: row.ten_hien_thi,
        inputPricePer1M: Number(row.gia_input_per_1m_usd),
        outputPricePer1M: Number(row.gia_output_per_1m_usd),
        exchangeRate: Number(row.ty_gia_vnd),
        active: Boolean(row.dang_hoat_dong),
    }));
}

export async function updateModelPricing(
    pricingOrId: string | (Partial<AIModelPricing> & { mo_hinh_ai: string }),
    maybePricing?: Partial<AIModelPricing>
): Promise<boolean> {
    const id = typeof pricingOrId === 'string' ? pricingOrId : pricingOrId.mo_hinh_ai;
    const updates = typeof pricingOrId === 'string' ? (maybePricing || {}) : pricingOrId;
    
    const dbUpdates: any = {};
    if (updates.name !== undefined) dbUpdates.ten_hien_thi = updates.name;
    if (updates.ten_hien_thi !== undefined) dbUpdates.ten_hien_thi = updates.ten_hien_thi;
    if (updates.inputPricePer1M !== undefined) dbUpdates.gia_input_per_1m_usd = updates.inputPricePer1M;
    if (updates.gia_input_per_1m_usd !== undefined) dbUpdates.gia_input_per_1m_usd = updates.gia_input_per_1m_usd;
    if (updates.outputPricePer1M !== undefined) dbUpdates.gia_output_per_1m_usd = updates.outputPricePer1M;
    if (updates.gia_output_per_1m_usd !== undefined) dbUpdates.gia_output_per_1m_usd = updates.gia_output_per_1m_usd;
    if (updates.exchangeRate !== undefined) dbUpdates.ty_gia_vnd = updates.exchangeRate;
    if (updates.ty_gia_vnd !== undefined) dbUpdates.ty_gia_vnd = updates.ty_gia_vnd;
    if (updates.active !== undefined) dbUpdates.dang_hoat_dong = updates.active;
    if (updates.dang_hoat_dong !== undefined) dbUpdates.dang_hoat_dong = updates.dang_hoat_dong;

    const { error } = await supabase
        .from('cau_hinh_gia_ai')
        .update(dbUpdates)
        .eq('mo_hinh_ai', id);
        
    if (error) {
        console.warn('updateModelPricing error:', error);
        return false;
    }
    return true;
}

