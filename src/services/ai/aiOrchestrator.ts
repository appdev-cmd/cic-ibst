import { getGenerativeModel, FunctionCall, Part, Content } from './geminiProxy';
import { AI_TOOLS_IBST, WRITE_TOOL_NAMES } from './aiTools';
import { buildSystemPrompt } from './prompts';
import { ensureResponseCoverage } from './responseCoverage';
import { searchHybridKnowledge } from './ragService';
import { supabase } from '../../lib/supabase';
import type { ChatMessage, AIAttachment } from '../aiService';

export interface PendingAIAction {
  id: string;
  toolName: string;
  args: Record<string, unknown>;
  title: string;
  summary: string;
  description?: string;
  createdAt: string;
  expiresAt: string;
}

export interface AIChatResponse {
  text: string;
  pendingAction?: PendingAIAction;
}

export async function executeFunctionCall(name: string, args: Record<string, any>): Promise<unknown> {
  switch (name) {
    case 'get_hop_dong_list': {
      let query = supabase.from('hop_dong')
        .select(`
          id, so_hop_dong, ten_hop_dong, trang_thai, gia_tri, da_thanh_toan, ngay_ky,
          don_vi:don_vi(id, ten_don_vi, ten_viet_tat),
          chu_tri:nhan_su!hop_dong_chu_tri_id_fkey(id, ho_va_ten, chuc_danh),
          khach_hang:khach_hang(id, ten_to_chuc)
        `)
        .order('gia_tri', { ascending: false })
        .limit(20);
      if (args.trang_thai) query = query.eq('trang_thai', args.trang_thai);
      if (args.search) {
        const s = String(args.search).trim();
        const norm = s.replace(/Đ/g, 'D').replace(/đ/g, 'd');
        const num = s.match(/\d+/)?.[0];
        let orParts = [`ten_hop_dong.ilike.%${s}%`, `so_hop_dong.ilike.%${s}%`, `so_hop_dong.ilike.%${norm}%`];
        if (num) orParts.push(`so_hop_dong.ilike.%${num}%`);
        query = query.or(orParts.join(','));
      }
      const { data } = await query;
      return data;
    }
    case 'get_hop_dong_detail': {
      const rawParam = String(args.hopDongId || args.so_hop_dong || args.search || '').trim();
      const HD_SELECT = `
        *,
        don_vi(id, ten_don_vi, ten_viet_tat),
        khach_hang(id, ten_to_chuc, ma_so_thue, nguoi_dai_dien, so_dien_thoai),
        chu_tri:nhan_su!hop_dong_chu_tri_id_fkey(id, ho_va_ten, chuc_danh, email, so_dien_thoai, hoc_vi),
        nguoi_duyet:nhan_su!hop_dong_nguoi_duyet_id_fkey(id, ho_va_ten, chuc_danh),
        nguoi_tao:nhan_su!hop_dong_nguoi_tao_id_fkey(id, ho_va_ten, chuc_danh),
        pho_don_vi_quan_ly:nhan_su!hop_dong_pho_don_vi_quan_ly_id_fkey(id, ho_va_ten, chuc_danh),
        dot_thanh_toan(*),
        tien_do_hop_dong(*)
      `;

      let hdData: any = null;

      // 1. If small number, try ID
      if (/^\d+$/.test(rawParam) && Number(rawParam) < 10000) {
        const { data: byId } = await supabase.from('hop_dong')
          .select(HD_SELECT)
          .eq('id', Number(rawParam))
          .maybeSingle();
        if (byId) hdData = byId;
      }
      
      if (!hdData) {
        const numMatch = rawParam.match(/\d+/);
        const mainNum = numMatch ? numMatch[0] : '';
        const norm = rawParam.replace(/Đ/g, 'D').replace(/đ/g, 'd');

        let filters = [`so_hop_dong.ilike.%${norm}%`, `so_hop_dong.ilike.%${rawParam}%`];
        if (mainNum) filters.push(`so_hop_dong.ilike.%${mainNum}%`);
        
        const { data: byCode } = await supabase.from('hop_dong')
          .select(HD_SELECT)
          .or(filters.join(','))
          .limit(1)
          .maybeSingle();
        if (byCode) hdData = byCode;
      }

      if (!hdData) {
        const { data: byName } = await supabase.from('hop_dong')
          .select(HD_SELECT)
          .ilike('ten_hop_dong', `%${rawParam}%`)
          .limit(1)
          .maybeSingle();
        if (byName) hdData = byName;
      }

      if (!hdData) {
        return { error: `Không tìm thấy hợp đồng với thông tin: ${rawParam}` };
      }

      // Fallback: If chu_tri_id exists but chu_tri is null, fetch nhan_su directly
      if (hdData.chu_tri_id && !hdData.chu_tri) {
        const { data: ns } = await supabase.from('nhan_su')
          .select('id, ho_va_ten, chuc_danh, email, so_dien_thoai, hoc_vi')
          .eq('id', hdData.chu_tri_id)
          .maybeSingle();
        if (ns) hdData.chu_tri = ns;
      }

      return hdData;
    }
    case 'get_tai_chinh_overview': {
      const { data } = await supabase.from('hop_dong').select(`
        so_hop_dong, ten_hop_dong, gia_tri, da_thanh_toan, trang_thai,
        don_vi:don_vi(ten_viet_tat),
        chu_tri:nhan_su!hop_dong_chu_tri_id_fkey(ho_va_ten)
      `);
      const all = data || [];
      const tong_gia_tri = all.reduce((sum, h) => sum + (Number(h.gia_tri) || 0), 0);
      const tong_da_thu = all.reduce((sum, h) => sum + (Number(h.da_thanh_toan) || 0), 0);
      const tong_cong_no = tong_gia_tri - tong_da_thu;
      return {
        so_luong_hop_dong: all.length,
        tong_gia_tri_trieu_dong: tong_gia_tri,
        tong_da_thu_trieu_dong: tong_da_thu,
        tong_cong_no_trieu_dong: tong_cong_no,
        ty_le_thu_tien_phan_tram: tong_gia_tri > 0 ? Math.round((tong_da_thu / tong_gia_tri) * 100) : 0,
        top_hop_dong_gia_tri_cao: all.sort((a, b) => (Number(b.gia_tri) || 0) - (Number(a.gia_tri) || 0)).slice(0, 5),
      };
    }
    case 'get_nhan_su_info': {
      let query = supabase.from('nhan_su')
        .select('id, ho_va_ten, chuc_danh, chuc_vu, email, so_dien_thoai, don_vi(id, ten_don_vi, ten_viet_tat), hoc_vi, chuyen_nganh')
        .limit(20);
      if (args.search) {
        const s = String(args.search).trim();
        if (/^\d+$/.test(s)) {
          query = query.or(`id.eq.${s},so_dien_thoai.ilike.%${s}%`);
        } else {
          query = query.or(`ho_va_ten.ilike.%${s}%,chuc_danh.ilike.%${s}%`);
        }
      }
      const { data } = await query;
      return data;
    }
    case 'get_don_vi_stats': {
      const { data } = await supabase.from('don_vi').select('*, hop_dong(count), nhan_su(count)');
      return data;
    }
    case 'get_de_tai_khcn': {
      let query = supabase.from('de_tai').select('*').limit(20);
      if (args.search) query = query.ilike('ten_de_tai', `%${args.search}%`);
      const { data } = await query;
      return data;
    }
    case 'get_mau_thu_las': {
      let query = supabase.from('mau_thi_nghiem').select('*').limit(20);
      if (args.search) query = query.ilike('ten_mau', `%${args.search}%`);
      const { data } = await query;
      return data;
    }
    case 'get_van_ban_list': {
      let query = supabase.from('van_ban').select('*').limit(20);
      if (args.search) query = query.ilike('trich_yeu', `%${args.search}%`);
      const { data } = await query;
      return data;
    }
    case 'get_cong_viec_list': {
      let query = supabase.from('cong_viec').select('*').limit(20);
      if (args.trang_thai) query = query.eq('trang_thai', args.trang_thai);
      const { data } = await query;
      return data;
    }
    case 'get_dashboard_kpi': {
      const { data } = await supabase.from('hop_dong').select('gia_tri, da_thanh_toan, trang_thai');
      const all = data || [];
      const tong_gia_tri = all.reduce((sum, h) => sum + (Number(h.gia_tri) || 0), 0);
      const tong_da_thu = all.reduce((sum, h) => sum + (Number(h.da_thanh_toan) || 0), 0);
      return {
        tong_hop_dong: all.length,
        tong_gia_tri_trieu_dong: tong_gia_tri,
        tong_da_thu_trieu_dong: tong_da_thu,
        tong_cong_no_trieu_dong: tong_gia_tri - tong_da_thu,
        dang_thuc_hien: all.filter(h => h.trang_thai === 'dang-thuc-hien').length,
        da_hoan_thanh: all.filter(h => h.trang_thai === 'hoan-thanh').length,
      };
    }
    case 'search_qcvn_tcvn': {
      const result = await searchHybridKnowledge(args.query || '');
      return result.contextSnippet;
    }
    case 'get_lich_co_quan': {
      const { data } = await supabase.from('lich_co_quan').select('*').order('ngay', { ascending: false }).limit(20);
      return data;
    }
    case 'get_canh_bao_2815': {
      const { data: hopDongList } = await supabase.from('hop_dong')
        .select('id, so_hop_dong, ten_hop_dong, gia_tri, da_thanh_toan, trang_thai, dot_thanh_toan(*)')
        .limit(50);
      const canhBao = [];
      for (const hd of hopDongList || []) {
        const no = (Number(hd.gia_tri) || 0) - (Number(hd.da_thanh_toan) || 0);
        if (no > 0) {
          canhBao.push({
            so_hop_dong: hd.so_hop_dong,
            ten_hop_dong: hd.ten_hop_dong,
            loai_canh_bao: 'Công nợ chưa thu hết',
            so_tien_no_trieu_dong: no,
            da_thu: hd.da_thanh_toan,
            tong_gia_tri: hd.gia_tri,
          });
        }
      }
      return {
        tong_so_canh_bao: canhBao.length,
        danh_sach: canhBao.slice(0, 10),
      };
    }
    case 'create_lich_cong_tac': {
      const { data, error } = await supabase.from('lich_co_quan').insert({
        tieu_de: args.title,
        ngay: args.event_date,
        gio_bat_dau: args.start_time,
        gio_ket_thuc: args.end_time,
        dia_diem: args.location,
        noi_dung: args.description,
      }).select();
      if (error) throw new Error(error.message);
      return data;
    }
    case 'create_cong_viec': {
      const { data, error } = await supabase.from('cong_viec').insert({
        ten_cong_viec: args.title,
        mo_ta: args.description,
        han_hoan_thanh: args.due_date,
        muc_do_uu_tien: args.priority,
      }).select();
      if (error) throw new Error(error.message);
      return data;
    }
    default:
      return { error: `Function ${name} not implemented.` };
  }
}

export function describePendingAction(toolName: string, args: Record<string, unknown>) {
  if (toolName === 'create_lich_cong_tac') {
    return { title: 'Tạo lịch công tác', summary: `Lịch: ${args.title} vào ngày ${args.event_date}` };
  }
  if (toolName === 'create_cong_viec') {
    return { title: 'Tạo công việc', summary: `Việc: ${args.title}, hạn: ${args.due_date}` };
  }
  return { title: 'Hành động', summary: toolName };
}

export function createPendingAction(toolName: string, args: Record<string, unknown>): PendingAIAction {
  const { title, summary } = describePendingAction(toolName, args);
  return {
    id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `action-${Date.now()}`,
    toolName,
    args,
    title,
    summary,
    description: summary,
    createdAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 5 * 60000).toISOString(), // 5 mins
  };
}

export async function executeConfirmedAIAction(action: PendingAIAction): Promise<unknown> {
  if (new Date() > new Date(action.expiresAt)) {
    throw new Error('Hành động đã hết hạn (quá 5 phút). Vui lòng yêu cầu lại.');
  }
  return await executeFunctionCall(action.toolName, action.args);
}

export async function sendContextAwareMessage(
  history: ChatMessage[],
  newMessage: string,
  signal?: AbortSignal,
  attachments?: AIAttachment[]
): Promise<AIChatResponse> {
  const model = getGenerativeModel({
    tools: AI_TOOLS_IBST,
    systemInstruction: buildSystemPrompt(),
  });

  const geminiHistory: Content[] = history.map(m => ({
    role: m.sender === 'user' ? 'user' : 'model',
    parts: [{ text: m.text }],
  }));

  const chat = model.startChat({
    history: geminiHistory,
    generationConfig: { temperature: 0.3, maxOutputTokens: 4096 },
    signal,
  });

  const parts: Part[] = [{ text: newMessage }];
  if (attachments) {
    for (const att of attachments) {
      const mimeType = (att as any).mimeType || att.type;
      if (mimeType && att.base64) {
        parts.push({
          inlineData: {
            data: att.base64,
            mimeType,
          }
        });
      }
    }
  }

  let response = await chat.sendMessage(parts);
  
  let loopCount = 0;
  let finalResponseText = '';
  const toolResults = new Map<string, unknown>();

  while (loopCount < 5) {
    const calls = response.response.functionCalls();
    
    if (!calls || calls.length === 0) {
      finalResponseText = response.response.text();
      break;
    }

    // Check for WRITE tools
    const writeCall = calls.find((c: FunctionCall) => WRITE_TOOL_NAMES.has(c.name));
    if (writeCall) {
      const pendingAction = createPendingAction(writeCall.name, writeCall.args as Record<string, unknown>);
      finalResponseText = `Tôi đã chuẩn bị thực hiện hành động: **${pendingAction.title}**. Vui lòng xác nhận để tiếp tục.`;
      return { text: finalResponseText, pendingAction };
    }

    // Execute READ tools
    const functionResponses: Part[] = await Promise.all(
      calls.map(async (call: FunctionCall) => {
        try {
          const result = await executeFunctionCall(call.name, call.args as Record<string, unknown>);
          toolResults.set(call.name, result);
          return {
            functionResponse: {
              name: call.name,
              response: { result },
            }
          };
        } catch (error: any) {
          return {
            functionResponse: {
              name: call.name,
              response: { error: error.message },
            }
          };
        }
      })
    );

    response = await chat.sendMessage(functionResponses);
    loopCount++;
  }
  
  if (!finalResponseText) finalResponseText = response.response.text();
  finalResponseText = ensureResponseCoverage(newMessage, finalResponseText, toolResults);

  return { text: finalResponseText };
}

export async function generateAIAnalysis(prompt: string, data: any, responseMimeType?: string): Promise<string> {
  const model = getGenerativeModel({});
  const parts: Part[] = [
    { text: prompt },
    { text: JSON.stringify(data) }
  ];
  
  const chat = model.startChat({
    generationConfig: { 
      temperature: 0.4, 
    }
  });
  
  const response = await chat.sendMessage(parts);
  return response.response.text();
}
