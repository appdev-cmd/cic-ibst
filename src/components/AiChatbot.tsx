import React, { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import {
  MessageSquare,
  Send,
  X,
  Settings,
  Maximize2,
  Minimize2,
  Sparkles,
  Key,
  Database,
  Trash2,
  ArrowLeft,
  AlertCircle,
  Check,
  Bot,
  User,
  Loader2,
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { cn } from '../lib/utils';

// Định nghĩa kiểu dữ liệu Message
interface Message {
  id: string;
  sender: 'user' | 'ai';
  text: string;
  timestamp: Date;
  isHtml?: boolean;
}

// Hàm parse markdown cơ bản sang JSX để hiển thị bảng, danh sách, chữ đậm
const renderMarkdown = (text: string) => {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const parseInlineBoldAndItalic = (str: string): React.ReactNode => {
    // Thay thế các cú pháp **bold** và *italic* cơ bản
    const boldRegex = /\*\*(.*?)\*\*/g;
    const parts = [];
    let lastIndex = 0;
    let match;

    while ((match = boldRegex.exec(str)) !== null) {
      if (match.index > lastIndex) {
        parts.push(str.substring(lastIndex, match.index));
      }
      parts.push(<strong key={match.index} className="font-extrabold text-ink">{match[1]}</strong>);
      lastIndex = boldRegex.lastIndex;
    }

    if (lastIndex < str.length) {
      parts.push(str.substring(lastIndex));
    }

    return parts.length > 0 ? <>{parts}</> : str;
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // Xử lý bảng (bắt đầu bằng |)
    if (trimmed.startsWith('|')) {
      inTable = true;
      const cols = trimmed.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      
      // Bỏ qua dòng ngăn cách |---|---|
      if (trimmed.includes('---')) {
        return;
      }

      if (tableHeaders.length === 0) {
        tableHeaders = cols;
      } else {
        tableRows.push(cols);
      }
      return;
    } else if (inTable) {
      // Kết thúc bảng, render bảng tích lũy được
      inTable = false;
      if (tableHeaders.length > 0) {
        const headers = [...tableHeaders];
        const rows = [...tableRows];
        tableHeaders = [];
        tableRows = [];
        elements.push(
          <div key={`table-${index}`} className="my-3 overflow-x-auto rounded-xl border border-border shadow-sm">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-subtle">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-black uppercase text-2xs text-ink-muted border-b border-border">
                      {parseInlineBoldAndItalic(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors">
                    {row.map((cell, ci) => (
                      <td key={ci} className="px-3 py-2 text-ink-secondary">
                        {parseInlineBoldAndItalic(cell)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      }
    }

    // Xử lý danh sách gạch đầu dòng
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      const listContent = trimmed.substring(2);
      currentList.push(
        <li key={`li-${index}-${currentList.length}`} className="ml-4 list-disc text-ink-secondary py-0.5">
          {parseInlineBoldAndItalic(listContent)}
        </li>
      );
      return;
    } else if (currentList.length > 0) {
      elements.push(<ul key={`ul-${index}`} className="my-2 space-y-1">{currentList}</ul>);
      currentList = [];
    }

    // Xử lý tiêu đề (H1, H2, H3)
    if (trimmed.startsWith('### ')) {
      elements.push(<h4 key={index} className="text-sm font-bold text-ink mt-3 mb-1">{parseInlineBoldAndItalic(trimmed.substring(4))}</h4>);
    } else if (trimmed.startsWith('## ')) {
      elements.push(<h3 key={index} className="text-base font-black text-ink mt-4 mb-2 border-b border-border-subtle pb-1">{parseInlineBoldAndItalic(trimmed.substring(3))}</h3>);
    } else if (trimmed.startsWith('# ')) {
      elements.push(<h2 key={index} className="text-lg font-black text-primary mt-4 mb-2">{parseInlineBoldAndItalic(trimmed.substring(2))}</h2>);
    } else if (trimmed !== '') {
      elements.push(<p key={index} className="my-1.5 leading-relaxed text-ink-secondary">{parseInlineBoldAndItalic(line)}</p>);
    }
  });

  // Render nốt danh sách hoặc bảng nếu nằm cuối văn bản
  if (currentList.length > 0) {
    elements.push(<ul key={`ul-end`} className="my-2 space-y-1">{currentList}</ul>);
  }
  if (tableHeaders.length > 0) {
    elements.push(
      <div key={`table-end`} className="my-3 overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-subtle">
              {tableHeaders.map((h, i) => (
                <th key={i} className="px-3 py-2 font-black uppercase text-2xs text-ink-muted border-b border-border">
                  {parseInlineBoldAndItalic(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors">
                {row.map((cell, ci) => (
                  <td key={ci} className="px-3 py-2 text-ink-secondary">
                    {parseInlineBoldAndItalic(cell)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return <div className="space-y-1">{elements}</div>;
};

// Hàm lấy dữ liệu ngữ cảnh từ Supabase để chuyển cho AI
async function getContextForQuery(query: string): Promise<string> {
  const q = query.toLowerCase();
  let context = '';

  try {
    // 1. Phân tích ngữ cảnh Hợp đồng
    if (q.includes('hợp đồng') || q.includes('hop dong') || q.includes('ký kết') || q.includes('giá trị')) {
      const { data, error } = await supabase
        .from('hop_dong')
        .select('so_hop_dong, ten_hop_dong, gia_tri, da_thanh_toan, trang_thai, ngay_ky, han_hoan_thanh')
        .order('ngay_ky', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        context += `\n[Danh sách hợp đồng gần đây trong hệ thống]:\n` +
          data.map(d => `- Số HĐ: ${d.so_hop_dong}, Tên: ${d.ten_hop_dong}, Giá trị: ${d.gia_tri} triệu VNĐ, Đã thanh toán: ${d.da_thanh_toan} triệu VNĐ, Trạng thái: ${d.trang_thai}, Ngày ký: ${d.ngay_ky}`).join('\n');
      }
    }

    // 2. Phân tích ngữ cảnh Đề tài KHCN
    if (q.includes('đề tài') || q.includes('de tai') || q.includes('nghiên cứu') || q.includes('khcn') || q.includes('nhiệm vụ')) {
      const { data, error } = await supabase
        .from('de_tai')
        .select('ma_so, ten_de_tai, cap_de_tai, kinh_phi, tien_do, trang_thai, han_nghiem_thu')
        .order('created_at', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        context += `\n[Danh sách đề tài KHCN gần đây trong hệ thống]:\n` +
          data.map(d => `- Mã đề tài: ${d.ma_so}, Tên: ${d.ten_de_tai}, Cấp quản lý: ${d.cap_de_tai}, Kinh phí: ${d.kinh_phi} triệu VNĐ, Tiến độ: ${d.tien_do}%, Trạng thái: ${d.trang_thai}, Hạn nghiệm thu: ${d.han_nghiem_thu}`).join('\n');
      }
    }

    // 3. Phân tích ngữ cảnh Văn bản
    if (q.includes('văn bản') || q.includes('van ban') || q.includes('công văn') || q.includes('đến') || q.includes('đi')) {
      const { data, error } = await supabase
        .from('van_ban')
        .select('so_hieu, trich_yeu, loai, ngay_van_ban, trang_thai')
        .order('ngay_van_ban', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        context += `\n[Danh sách văn bản điều hành đến/đi gần đây]:\n` +
          data.map(d => `- Số hiệu: ${d.so_hieu}, Loại: ${d.loai === 'den' ? 'Văn bản đến' : 'Văn bản đi'}, Trích yếu: ${d.trich_yeu}, Ngày ban hành: ${d.ngay_van_ban}, Trạng thái: ${d.trang_thai}`).join('\n');
      }
    }

    // 4. Phân tích ngữ cảnh Nhân sự
    if (q.includes('nhân sự') || q.includes('nhan su') || q.includes('nhân viên') || q.includes('cán bộ') || q.includes('người') || q.includes('ai là') || q.includes('tìm kiếm')) {
      const { data, error } = await supabase
        .from('nhan_su')
        .select('ho_va_ten, hoc_vi, chuc_danh, email, so_dien_thoai, trang_thai')
        .limit(15);

      if (!error && data && data.length > 0) {
        context += `\n[Danh sách cán bộ nhân sự nổi bật]:\n` +
          data.map(d => `- Họ tên: ${d.ho_va_ten}, Học vị: ${d.hoc_vi}, Chức vụ: ${d.chuc_danh}, Email: ${d.email || '—'}, SĐT: ${d.so_dien_thoai || '—'}, Trạng thái: ${d.trang_thai}`).join('\n');
      }
    }

    // 5. Phân tích ngữ cảnh Mẫu thí nghiệm LIMS
    if (q.includes('thí nghiệm') || q.includes('thi nghiem') || q.includes('mẫu thử') || q.includes('phép thử') || q.includes('phòng thí nghiệm')) {
      const { data, error } = await supabase
        .from('mau_thi_nghiem')
        .select('ma_phieu, ten_mau, phep_thu, phong_thi_nghiem, trang_thai, ngay_nhan, han_tra')
        .order('ngay_nhan', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        context += `\n[Danh sách mẫu thí nghiệm LIMS gần đây]:\n` +
          data.map(d => `- Mã phiếu: ${d.ma_phieu}, Tên mẫu: ${d.ten_mau}, Phép thử: ${d.phep_thu}, Phòng TN: ${d.phong_thi_nghiem}, Trạng thái: ${d.trang_thai}, Ngày nhận: ${d.ngay_nhan}`).join('\n');
      }
    }

    // 6. Phân tích ngữ cảnh đơn vị
    if (q.includes('đơn vị') || q.includes('don vi') || q.includes('phòng ban') || q.includes('viện chuyên ngành') || q.includes('trung tâm')) {
      const { data, error } = await supabase
        .from('don_vi')
        .select('ten_don_vi, ten_viet_tat, loai_don_vi, trang_thai');

      if (!error && data && data.length > 0) {
        context += `\n[Cơ cấu tổ chức các đơn vị thuộc Viện IBST]:\n` +
          data.map(d => `- Tên đơn vị: ${d.ten_don_vi} (${d.ten_viet_tat || '—'}), Loại: ${d.loai_don_vi}, Trạng thái: ${d.trang_thai}`).join('\n');
      }
    }
  } catch (err) {
    console.error('Lỗi khi truy vấn ngữ cảnh DB cho chatbot:', err);
  }

  return context;
}

export function AiChatbot() {
  const location = useLocation();
  
  // Trạng thái giao diện
  const [isOpen, setIsOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  
  // Trạng thái cấu hình AI
  const [aiMode, setAiMode] = useState<'demo' | 'gemini'>(() => {
    return (localStorage.getItem('ai_chatbot_mode') as 'demo' | 'gemini') || 'demo';
  });
  const [geminiKey, setGeminiKey] = useState(() => {
    return localStorage.getItem('ai_chatbot_gemini_key') || '';
  });
  const [keyInput, setKeyInput] = useState(geminiKey);
  const [keySaved, setKeySaved] = useState(false);

  // Lịch sử tin nhắn
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Đồng bộ cấu hình vào localStorage
  useEffect(() => {
    localStorage.setItem('ai_chatbot_mode', aiMode);
  }, [aiMode]);

  // Tự động cuộn xuống dưới cùng khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Khởi tạo tin nhắn chào mừng
  useEffect(() => {
    if (messages.length === 0) {
      setMessages([
        {
          id: 'welcome',
          sender: 'ai',
          text: `Xin chào! Tôi là **Trợ lý ảo IBST AI**. Tôi có thể giúp bạn tra cứu nhanh dữ liệu văn bản, hợp đồng, đề tài khoa học, nhân sự, hay kết quả thí nghiệm trên hệ thống quản trị này.\n\nHãy chọn một gợi ý bên dưới hoặc nhập câu hỏi của bạn trực tiếp vào ô chat!`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [messages]);

  // Đổi đề xuất thông minh dựa trên trang hiện tại của người dùng
  const getContextualChips = () => {
    const path = location.pathname;
    if (path.includes('van-ban')) {
      return [
        { label: 'Tóm tắt văn bản mới đến', query: 'Tóm tắt các văn bản mới đến gần đây' },
        { label: 'Văn bản nào đang chờ duyệt?', query: 'Danh sách văn bản đang ở trạng thái chờ duyệt' },
      ];
    } else if (path.includes('hop-dong')) {
      return [
        { label: 'Hợp đồng có giá trị lớn nhất?', query: 'Hợp đồng nào có giá trị lớn nhất và thông tin chi tiết?' },
        { label: 'Tiến độ thanh toán hợp đồng', query: 'Thống kê tình hình thanh toán và thực hiện các hợp đồng' },
      ];
    } else if (path.includes('de-tai')) {
      return [
        { label: 'Thống kê đề tài KHCN', query: 'Thống kê số lượng, kinh phí đề tài KHCN theo cấp quản lý' },
        { label: 'Đề tài nào quá hạn nghiệm thu?', query: 'Danh sách đề tài đang quá hạn nghiệm thu' },
      ];
    } else if (path.includes('thi-nghiem')) {
      return [
        { label: 'Mẫu thí nghiệm mới nhận', query: 'Danh sách mẫu thí nghiệm mới nhận gần đây' },
        { label: 'Thống kê mẫu theo phòng', query: 'Thống kê số lượng mẫu theo các phòng thí nghiệm' },
      ];
    } else if (path.includes('nhan-su')) {
      return [
        { label: 'Tìm nhân sự Tiến sĩ', query: 'Danh sách cán bộ nhân sự có học vị Tiến sĩ hoặc Phó Giáo sư' },
        { label: 'Tra cứu Hoàng Văn E', query: 'Tìm thông tin nhân sự Hoàng Văn E và chức vụ' },
      ];
    }
    
    // Mặc định cho trang tổng quan hoặc các trang khác
    return [
      { label: 'Tóm tắt văn bản mới', query: 'Tóm tắt các văn bản mới đến gần đây' },
      { label: 'Đề tài khoa học nổi bật', query: 'Đề tài khoa học nổi bật nào đang thực hiện?' },
      { label: 'Hợp đồng lớn nhất', query: 'Hợp đồng nào có giá trị lớn nhất và thông tin chi tiết?' },
      { label: 'Tìm thông tin Hoàng Văn E', query: 'Tìm thông tin nhân sự Hoàng Văn E và chức vụ' },
    ];
  };

  // Lưu khóa API Gemini
  const handleSaveKey = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanKey = keyInput.trim();
    setGeminiKey(cleanKey);
    localStorage.setItem('ai_chatbot_gemini_key', cleanKey);
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
    if (cleanKey) {
      setAiMode('gemini');
    }
  };

  // Xóa lịch sử chat
  const handleClearHistory = () => {
    setMessages([
      {
        id: `welcome-${Date.now()}`,
        sender: 'ai',
        text: `Đã xóa lịch sử trò chuyện. Tôi là **Trợ lý ảo IBST AI**, tôi có thể hỗ trợ gì cho bạn?`,
        timestamp: new Date(),
      },
    ]);
  };

  // Trình mô phỏng nghiệp vụ ngoại tuyến (Demo Mode Fallback)
  const handleOfflineQuery = async (query: string): Promise<string> => {
    const q = query.toLowerCase();

    // 1. Nghiệp vụ: Tóm tắt văn bản
    if (q.includes('văn bản') || q.includes('van ban') || q.includes('công văn')) {
      const { data, error } = await supabase
        .from('van_ban')
        .select('so_hieu, trich_yeu, loai, ngay_van_ban, trang_thai')
        .order('ngay_van_ban', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return 'Không tìm thấy dữ liệu văn bản nào trên hệ thống hoặc xảy ra lỗi truy vấn.';
      }

      const total = data.length;
      const den = data.filter(d => d.loai === 'den').length;
      const di = data.filter(d => d.loai === 'di').length;
      const choDuyet = data.filter(d => d.trang_thai === 'cho-duyet').length;
      const quaHan = data.filter(d => d.trang_thai === 'qua-han').length;

      let mdTable = `| Số hiệu | Loại | Trích yếu | Ngày VB | Trạng thái |\n|---|---|---|---|---|\n`;
      data.forEach(d => {
        const trangThaiText = d.trang_thai === 'hoan-thanh' ? 'Hoàn thành' : 
                              d.trang_thai === 'dang-thuc-hien' ? 'Đang xử lý' :
                              d.trang_thai === 'cho-duyet' ? 'Chờ duyệt' :
                              d.trang_thai === 'qua-han' ? 'Quá hạn' : 'Mới';
        mdTable += `| ${d.so_hieu} | ${d.loai === 'den' ? 'Đến' : 'Đi'} | ${d.trich_yeu} | ${d.ngay_van_ban} | ${trangThaiText} |\n`;
      });

      return `### Báo cáo văn bản điều hành gần đây\n\nTổng cộng có **${total}** văn bản được tìm thấy (gồm **${den}** văn bản đến và **${di}** văn bản đi). Trong đó:\n- Số văn bản chờ duyệt: **${choDuyet}**\n- Số văn bản quá hạn xử lý: **${quaHan}**\n\n**Chi tiết các văn bản mới nhất:**\n\n${mdTable}\n\n*(Lưu ý: Dữ liệu trên được lấy trực tiếp từ DB. Để thực hiện phân tích chuyên sâu hơn bằng AI, vui lòng nhập Gemini API Key trong phần Cài đặt)*`;
    }

    // 2. Nghiệp vụ: Đề tài KHCN
    if (q.includes('đề tài') || q.includes('de tai') || q.includes('nghiên cứu') || q.includes('khcn')) {
      const { data, error } = await supabase
        .from('de_tai')
        .select('ma_so, ten_de_tai, cap_de_tai, kinh_phi, tien_do, trang_thai');

      if (error || !data || data.length === 0) {
        return 'Không tìm thấy thông tin đề tài KHCN nào trên hệ thống hoặc xảy ra lỗi.';
      }

      const total = data.length;
      const totalKinhPhi = data.reduce((sum, d) => sum + Number(d.kinh_phi || 0), 0);
      const avgTienDo = Math.round(data.reduce((sum, d) => sum + (d.tien_do || 0), 0) / total);
      
      const nhaNuoc = data.filter(d => d.cap_de_tai === 'nha-nuoc').length;
      const capBo = data.filter(d => d.cap_de_tai === 'bo').length;
      const coSo = data.filter(d => d.cap_de_tai === 'co-so').length;

      let mdTable = `| Mã số | Tên đề tài | Cấp | Kinh phí | Tiến độ | Trạng thái |\n|---|---|---|---|---|---|\n`;
      data.slice(0, 6).forEach(d => {
        const capText = d.cap_de_tai === 'nha-nuoc' ? 'Nhà nước' : d.cap_de_tai === 'bo' ? 'Cấp Bộ' : 'Cơ sở';
        const trangThaiText = d.trang_thai === 'hoan-thanh' ? 'Hoàn thành' : 
                              d.trang_thai === 'dang-thuc-hien' ? 'Đang làm' :
                              d.trang_thai === 'cho-duyet' ? 'Chờ duyệt' :
                              d.trang_thai === 'qua-han' ? 'Quá hạn' : 'Mới';
        mdTable += `| ${d.ma_so} | ${d.ten_de_tai} | ${capText} | ${d.kinh_phi} triệu | ${d.tien_do}% | ${trangThaiText} |\n`;
      });

      return `### Báo cáo thống kê Đề tài KHCN tại IBST\n\nHiện tại Viện đang triển khai **${total}** đề tài nghiên cứu KHCN, cụ thể:\n- Đề tài cấp Nhà nước: **${nhaNuoc}** đề tài\n- Đề tài cấp Bộ Xây dựng: **${capBo}** đề tài\n- Đề tài cấp Cơ sở: **${coSo}** đề tài\n\n**Chỉ số tài chính và tiến độ:**\n- Tổng kinh phí nghiên cứu được phân bổ: **${totalKinhPhi.toLocaleString()}** triệu VNĐ.\n- Tiến độ hoàn thành trung bình: **${avgTienDo}%**.\n\n**Danh sách các đề tài nổi bật:**\n\n${mdTable}\n\n*(Lưu ý: Dữ liệu thực tế lấy từ CSDL. Đặt câu hỏi chi tiết hơn sau khi cấu hình Gemini API)*`;
    }

    // 3. Nghiệp vụ: Hợp đồng
    if (q.includes('hợp đồng') || q.includes('hop dong') || q.includes('ký kết')) {
      const { data, error } = await supabase
        .from('hop_dong')
        .select('so_hop_dong, ten_hop_dong, gia_tri, da_thanh_toan, trang_thai, ngay_ky');

      if (error || !data || data.length === 0) {
        return 'Không tìm thấy dữ liệu hợp đồng dịch vụ trên hệ thống.';
      }

      const total = data.length;
      const totalGiaTri = data.reduce((sum, d) => sum + Number(d.gia_tri || 0), 0);
      const totalDaThanhToan = data.reduce((sum, d) => sum + Number(d.da_thanh_toan || 0), 0);
      const conPhaiThu = totalGiaTri - totalDaThanhToan;
      const tileThanhToan = Math.round((totalDaThanhToan / totalGiaTri) * 100);

      // Tìm hợp đồng giá trị lớn nhất
      const largest = [...data].sort((a, b) => Number(b.gia_tri) - Number(a.gia_tri))[0];

      let mdTable = `| Số HĐ | Tên hợp đồng | Giá trị (triệu) | Đã thu (triệu) | Trạng thái |\n|---|---|---|---|---|\n`;
      data.slice(0, 6).forEach(d => {
        const trangThaiText = d.trang_thai === 'hoan-thanh' ? 'Nghiệm thu' : 
                              d.trang_thai === 'dang-thuc-hien' ? 'Đang thực hiện' :
                              d.trang_thai === 'cho-duyet' ? 'Chờ duyệt' :
                              d.trang_thai === 'qua-han' ? 'Quá hạn' : 'Mới';
        mdTable += `| ${d.so_hop_dong} | ${d.ten_hop_dong} | ${Number(d.gia_tri).toLocaleString()} | ${Number(d.da_thanh_toan).toLocaleString()} | ${trangThaiText} |\n`;
      });

      return `### Báo cáo Hợp đồng dịch vụ tư vấn khoa học kỹ thuật\n\nHệ thống ghi nhận **${total}** hợp đồng dịch vụ khoa học công nghệ. Tóm tắt số liệu tài chính:\n- Tổng giá trị hợp đồng: **${totalGiaTri.toLocaleString()}** triệu VNĐ.\n- Tổng số tiền đã thu (Lũy kế): **${totalDaThanhToan.toLocaleString()}** triệu VNĐ (**${tileThanhToan}%**).\n- Số dư phải thu còn lại: **${conPhaiThu.toLocaleString()}** triệu VNĐ.\n\n👑 **Hợp đồng lớn nhất:**\n- **Số hiệu:** ${largest.so_hop_dong}\n- **Tên:** ${largest.ten_hop_dong}\n- **Giá trị:** **${Number(largest.gia_tri).toLocaleString()}** triệu VNĐ (Đã thanh toán: ${Number(largest.da_thanh_toan).toLocaleString()} triệu).\n\n**Danh sách hợp đồng chi tiết:**\n\n${mdTable}`;
    }

    // 4. Nghiệp vụ: Nhân sự
    if (q.includes('nhân sự') || q.includes('nhan su') || q.includes('nhân viên') || q.includes('cán bộ')) {
      const { data, error } = await supabase
        .from('nhan_su')
        .select('ho_va_ten, hoc_vi, chuc_danh, email, so_dien_thoai');

      if (error || !data || data.length === 0) {
        return 'Không tìm thấy dữ liệu nhân sự trên hệ thống.';
      }

      // Đếm học vị
      const ts = data.filter(d => d.hoc_vi?.toLowerCase().includes('tiến sĩ') || d.hoc_vi?.toLowerCase().includes('ts')).length;
      const ths = data.filter(d => d.hoc_vi?.toLowerCase().includes('thạc sĩ') || d.hoc_vi?.toLowerCase().includes('ths')).length;
      const ks = data.filter(d => d.hoc_vi?.toLowerCase().includes('kỹ sư') || d.hoc_vi?.toLowerCase().includes('ks')).length;

      let mdTable = `| Họ và tên | Học vị | Chức danh | Email | Số điện thoại |\n|---|---|---|---|---|\n`;
      data.forEach(d => {
        mdTable += `| **${d.ho_va_ten}** | ${d.hoc_vi || '—'} | ${d.chuc_danh || '—'} | ${d.email || '—'} | ${d.so_dien_thoai || '—'} |\n`;
      });

      return `### Thông tin nhân sự - Cán bộ nghiên cứu khoa học\n\nTổng số cán bộ nhân sự chủ chốt được khai báo: **${data.length}** người. Trong đó:\n- Giáo sư/Phó Giáo sư/Tiến sĩ: **${ts}** cán bộ.\n- Thạc sĩ: **${ths}** cán bộ.\n- Kỹ sư/Khác: **${ks}** cán bộ.\n\n**Danh sách chi tiết cán bộ nhân sự:**\n\n${mdTable}`;
    }

    // 5. Mẫu thí nghiệm
    if (q.includes('thí nghiệm') || q.includes('thi nghiem') || q.includes('mẫu') || q.includes('phép thử')) {
      const { data, error } = await supabase
        .from('mau_thi_nghiem')
        .select('ma_phieu, ten_mau, phep_thu, phong_thi_nghiem, trang_thai, ngay_nhan')
        .order('ngay_nhan', { ascending: false })
        .limit(10);

      if (error || !data || data.length === 0) {
        return 'Không tìm thấy dữ liệu mẫu thí nghiệm nào.';
      }

      const total = data.length;
      const hoanThanh = data.filter(d => d.trang_thai === 'hoan-thanh').length;
      const dangThucHien = data.filter(d => d.trang_thai === 'dang-thuc-hien').length;

      let mdTable = `| Mã phiếu | Tên mẫu | Phép thử | Phòng TN | Trạng thái | Ngày nhận |\n|---|---|---|---|---|---|\n`;
      data.forEach(d => {
        const trangThaiText = d.trang_thai === 'hoan-thanh' ? 'Đã trả kết quả' : 
                              d.trang_thai === 'dang-thuc-hien' ? 'Đang thử nghiệm' : 'Mới nhận';
        mdTable += `| ${d.ma_phieu} | ${d.ten_mau} | ${d.phep_thu} | ${d.phong_thi_nghiem} | ${trangThaiText} | ${d.ngay_nhan} |\n`;
      });

      return `### Báo cáo hoạt động thí nghiệm & kiểm định LIMS\n\nGhi nhận **${total}** mẫu thử nghiệm mới nhất đang được quản lý trên hệ thống LIMS:\n- Đã hoàn thành trả phiếu: **${hoanThanh}** mẫu.\n- Đã tiếp nhận & đang phân tích: **${dangThucHien}** mẫu.\n\n**Danh sách chi tiết các mẫu thử nghiệm:**\n\n${mdTable}`;
    }

    // Phản hồi chung
    return `Tôi là trợ lý AI ảo của Viện IBST. Tôi có thể giúp bạn truy vấn dữ liệu thời gian thực từ cơ sở dữ liệu.

Các lệnh truy vấn mẫu bạn có thể thử ngay (Dữ liệu thực tế):
- **Tóm tắt văn bản** (Xem các quyết định, công văn đi/đến mới nhất)
- **Thống kê đề tài KHCN** (Kinh phí, tiến độ, cấp đề tài tại Viện)
- **Danh sách hợp đồng** (Xem các hợp đồng lớn nhất, thống kê doanh thu)
- **Thông tin nhân sự** (Danh sách cán bộ chủ chốt, học vị, chức danh)
- **Quản lý thí nghiệm LIMS** (Xem các mẫu thử, phòng chuyên môn)

*Mẹo: Hãy bấm vào các chip gợi ý nhanh ở phía dưới ô nhập liệu để xem nhanh dữ liệu trực quan.*

---
*(Lưu ý: Để trò chuyện tự do và nhận câu trả lời thông minh dựa trên mô hình ngôn ngữ lớn LLM, vui lòng mở biểu tượng **Cài đặt** ở trên góc phải và cung cấp Google Gemini API Key)*`;
  };

  // Xử lý gửi tin nhắn
  const handleSendMessage = async (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim() || isLoading) return;

    // Reset input nếu gửi từ ô nhập liệu
    if (!textToSend) {
      setInputValue('');
    }

    const userMessage: Message = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: text,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      if (aiMode === 'gemini' && geminiKey) {
        // Thực hiện Client-side RAG: lấy dữ liệu từ Supabase làm ngữ cảnh
        const dbContext = await getContextForQuery(text);
        
        // Hệ thống instruction cho AI
        const systemInstruction = `Bạn là Trợ lý ảo AI thông minh tích hợp trong Hệ thống quản trị tổng thể IBST (Viện Khoa học Công nghệ Xây dựng).
Nhiệm vụ của bạn là giải đáp thắc mắc, giúp tra cứu và tóm tắt thông tin trên hệ thống ERP này.
Khi trả lời, bạn PHẢI dựa vào thông tin ngữ cảnh thực tế được lấy từ cơ sở dữ liệu dưới đây. Nếu ngữ cảnh không có thông tin, hãy sử dụng kiến thức chung của bạn về Viện IBST và lịch sự thông báo rằng không tìm thấy bản ghi tương ứng trong DB hiện tại.

Dữ liệu thực tế truy vấn từ cơ sở dữ liệu liên quan:
---
${dbContext || 'Không có dữ liệu ngữ cảnh cụ thể cho câu hỏi này.'}
---

Yêu cầu định dạng câu trả lời:
- Luôn trả lời bằng tiếng Việt lịch sự, chuyên nghiệp.
- Sử dụng cấu trúc rõ ràng với Markdown (gạch đầu dòng, in đậm).
- Nếu trả lời danh sách hoặc bảng dữ liệu, hãy vẽ bảng Markdown thật đẹp mắt.
- Không được nhắc đến tên "Supabase" hay cấu trúc kỹ thuật nội bộ của CSDL.`;

        // Gọi Gemini API trực tiếp từ Client
        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiKey}`,
          {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              contents: [
                {
                  role: 'user',
                  parts: [{ text: systemInstruction }]
                },
                // Gửi kèm lịch sử hội thoại (lọc tối đa 6 tin nhắn gần nhất để tránh quá tải token)
                ...messages.slice(-6).map(m => ({
                  role: m.sender === 'user' ? 'user' : 'model',
                  parts: [{ text: m.text }]
                })),
                {
                  role: 'user',
                  parts: [{ text: text }]
                }
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: 2048,
              }
            })
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData?.error?.message || 'Không thể kết nối đến Gemini API');
        }

        const resData = await response.json();
        const aiText = resData?.candidates?.[0]?.content?.parts?.[0]?.text || 'Tôi không nhận được phản hồi từ AI.';

        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: aiText,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      } else {
        // Chế độ Demo: Tạo phản hồi mô phỏng nhưng truy vấn dữ liệu DB thực tế
        // Delay 1s tạo cảm giác AI đang phân tích dữ liệu
        await new Promise(resolve => setTimeout(resolve, 1000));
        const responseText = await handleOfflineQuery(text);
        
        const aiMessage: Message = {
          id: `msg-${Date.now()}-ai`,
          sender: 'ai',
          text: responseText,
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, aiMessage]);
      }
    } catch (err: any) {
      console.error(err);
      const errorMessage: Message = {
        id: `msg-${Date.now()}-error`,
        sender: 'ai',
        text: `❌ **Đã xảy ra lỗi:** ${err.message || 'Không có kết nối mạng hoặc lỗi API.'}\n\n*Vui lòng kiểm tra lại kết nối mạng hoặc kiểm tra xem API Key của bạn có chính xác và còn hạn mức hay không.*`,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* ── Nút kích hoạt Chatbot (Bong bóng nổi) ── */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-gradient-to-tr from-primary-600 to-indigo-600 text-white shadow-lg transition-transform hover:scale-110 hover:shadow-xl active:scale-95 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          title="Trợ lý ảo IBST AI"
        >
          {/* Vòng sáng phát xung bên ngoài nút */}
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-20" />
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
        </button>
      )}

      {/* ── Widget Khung Chatbot ── */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden border border-border bg-surface/90 backdrop-blur-md shadow-dropdown transition-all duration-300 ease-out',
            isFullscreen
              ? 'inset-4 sm:inset-10 rounded-2xl'
              : 'bottom-6 right-6 w-96 h-[550px] max-h-[calc(100vh-8rem)] max-w-[calc(100vw-2rem)] rounded-2xl'
          )}
        >
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-subtle px-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary-500 to-indigo-500 text-white shadow-sm">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-ink leading-tight flex items-center gap-1.5">
                  Trợ lý ảo IBST AI
                  <span className="inline-flex h-2.5 w-2.5 rounded-full bg-success animate-pulse" />
                </h3>
                <p className="text-[10px] text-ink-muted">
                  {aiMode === 'gemini' ? 'Mô hình AI: Gemini 2.5' : 'Hệ thống: Chế độ Demo & DB'}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              {/* Nút cài đặt */}
              <button
                onClick={() => setShowSettings(!showSettings)}
                title="Cài đặt AI"
                className={cn(
                  'flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:bg-muted hover:text-ink transition-colors',
                  showSettings && 'bg-primary-50 text-primary-600 dark:bg-primary-900/30'
                )}
              >
                <Settings size={16} />
              </button>

              {/* Nút phóng to / thu nhỏ */}
              <button
                onClick={() => setIsFullscreen(!isFullscreen)}
                title={isFullscreen ? 'Thu nhỏ cửa sổ' : 'Phóng to toàn màn hình'}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:bg-muted hover:text-ink transition-colors"
              >
                {isFullscreen ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>

              {/* Nút đóng */}
              <button
                onClick={() => {
                  setIsOpen(false);
                  setIsFullscreen(false);
                  setShowSettings(false);
                }}
                title="Đóng chat"
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:bg-muted hover:text-danger transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Body */}
          <div className="flex min-h-0 flex-1 relative bg-page/30">
            {/* Màn hình Cài đặt (phủ lên trên) */}
            {showSettings ? (
              <div className="absolute inset-0 z-10 flex flex-col bg-surface p-5 animate-fade-in">
                <div className="flex items-center gap-2 mb-5 border-b border-border pb-3">
                  <button
                    onClick={() => setShowSettings(false)}
                    className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-ink-muted hover:bg-muted hover:text-ink transition-colors"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  <h4 className="font-bold text-ink text-sm">Cài đặt Trợ lý AI</h4>
                </div>

                <div className="flex-1 space-y-5 overflow-y-auto">
                  {/* Chọn chế độ */}
                  <div className="space-y-2">
                    <label className="text-2xs font-black uppercase text-ink-muted tracking-wider">Chế độ AI</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setAiMode('demo')}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all cursor-pointer',
                          aiMode === 'demo'
                            ? 'border-primary bg-primary-50/50 text-primary-700 dark:bg-primary-900/10'
                            : 'border-border bg-subtle text-ink-muted hover:bg-muted hover:text-ink'
                        )}
                      >
                        <Database size={16} />
                        <span className="text-xs font-bold">Chế độ Demo</span>
                        <span className="text-[9px] leading-tight">Truy vấn DB thực tế + Phản hồi mô phỏng</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (geminiKey) {
                            setAiMode('gemini');
                          } else {
                            // Nhắc người dùng nhập key trước
                            alert('Vui lòng cung cấp Gemini API Key bên dưới để kích hoạt chế độ AI.');
                          }
                        }}
                        className={cn(
                          'flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition-all cursor-pointer',
                          aiMode === 'gemini'
                            ? 'border-primary bg-primary-50/50 text-primary-700 dark:bg-primary-900/10'
                            : 'border-border bg-subtle text-ink-muted hover:bg-muted hover:text-ink'
                        )}
                      >
                        <Sparkles size={16} />
                        <span className="text-xs font-bold">Real-time LLM AI</span>
                        <span className="text-[9px] leading-tight">Gemini 2.5 Flash thông minh + Kết hợp RAG DB</span>
                      </button>
                    </div>
                  </div>

                  {/* Nhập API Key */}
                  <form onSubmit={handleSaveKey} className="space-y-2">
                    <label className="text-2xs font-black uppercase text-ink-muted tracking-wider flex items-center justify-between">
                      <span>Gemini API Key</span>
                      <a
                        href="https://aistudio.google.com/app/apikey"
                        target="_blank"
                        rel="noreferrer"
                        className="text-[10px] font-bold text-primary hover:underline lowercase"
                      >
                        Lấy key miễn phí
                      </a>
                    </label>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Key size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                        <input
                          type="password"
                          placeholder="AIzaSy..."
                          value={keyInput}
                          onChange={(e) => setKeyInput(e.target.value)}
                          className="w-full rounded-xl border border-border bg-subtle py-2 pl-9 pr-3 text-xs text-ink placeholder-txt-placeholder focus:border-primary-500 focus:bg-surface focus:outline-none"
                        />
                      </div>
                      <button
                        type="submit"
                        className="flex cursor-pointer items-center justify-center rounded-xl bg-primary-500 px-4 text-xs font-bold text-white hover:bg-primary-600 active:scale-95 transition-all"
                      >
                        Lưu Key
                      </button>
                    </div>
                    {keySaved && (
                      <p className="text-[10px] text-success flex items-center gap-1 font-semibold">
                        <Check size={12} /> Đã lưu cấu hình API Key thành công!
                      </p>
                    )}
                  </form>

                  {/* Xóa lịch sử và trợ giúp */}
                  <div className="space-y-3 pt-3 border-t border-border">
                    <button
                      type="button"
                      onClick={handleClearHistory}
                      className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-danger/20 px-4 py-2.5 text-xs font-bold text-danger hover:bg-danger/10 active:scale-95 transition-all"
                    >
                      <Trash2 size={14} />
                      Xóa lịch sử cuộc trò chuyện
                    </button>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-border flex items-center gap-2 text-[10px] text-ink-muted">
                  <AlertCircle size={12} className="shrink-0 text-primary-500" />
                  <span>Key được lưu an toàn tại LocalStorage và chỉ gửi trực tiếp tới Google API, không đi qua máy chủ bên thứ ba.</span>
                </div>
              </div>
            ) : null}

            {/* Màn hình Chat chính */}
            <div className="flex-1 flex flex-col h-full min-w-0">
              {/* Vùng tin nhắn */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={cn(
                        'flex gap-3 max-w-[85%] animate-fade-in-up',
                        isAi ? 'self-start' : 'self-end flex-row-reverse ml-auto'
                      )}
                    >
                      {/* Avatar */}
                      <div
                        className={cn(
                          'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
                          isAi
                            ? 'bg-gradient-to-br from-primary-500 to-indigo-500'
                            : 'bg-gradient-to-br from-indigo-400 to-primary-600'
                        )}
                      >
                        {isAi ? <Bot size={15} /> : <User size={15} />}
                      </div>

                      {/* Khung chat */}
                      <div className="space-y-1">
                        <div
                          className={cn(
                            'rounded-2xl px-4 py-2.5 text-[13px] shadow-sm leading-relaxed border',
                            isAi
                              ? 'bg-surface text-ink border-border rounded-tl-none'
                              : 'bg-primary-500 text-white border-primary-600 rounded-tr-none'
                          )}
                        >
                          {isAi ? (
                            renderMarkdown(msg.text)
                          ) : (
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                          )}
                        </div>
                        <p className={cn('text-[9px] text-ink-muted px-1', !isAi && 'text-right')}>
                          {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                    </div>
                  );
                })}

                {/* Hiệu ứng đang soạn tin nhắn (Typing Indicator) */}
                {isLoading && (
                  <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 text-white shadow-sm">
                      <Bot size={15} />
                    </div>
                    <div className="rounded-2xl rounded-tl-none border border-border bg-surface px-4 py-3 shadow-sm flex items-center gap-1.5">
                      <Loader2 size={14} className="animate-spin text-primary-500" />
                      <span className="text-xs text-ink-muted">AI đang truy vấn CSDL & phân tích...</span>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>

              {/* Chips gợi ý nhanh */}
              <div className="shrink-0 px-4 py-2 border-t border-border-subtle bg-subtle/50 flex gap-2 overflow-x-auto scrollbar-none">
                {getContextualChips().map((chip, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSendMessage(chip.query)}
                    className="shrink-0 cursor-pointer rounded-full border border-border bg-surface px-3 py-1 text-2xs font-semibold text-ink-secondary hover:border-primary-500 hover:text-primary transition-all active:scale-95"
                  >
                    {chip.label}
                  </button>
                ))}
              </div>

              {/* Input Footer */}
              <div className="shrink-0 p-4 border-t border-border bg-surface">
                {aiMode === 'demo' && (
                  <div className="mb-2 rounded-lg bg-primary-50/50 border border-primary-100 dark:bg-primary-900/10 dark:border-primary-900/30 px-2 py-1 flex items-center justify-between text-[10px] text-primary">
                    <span className="font-semibold flex items-center gap-1">
                      <AlertCircle size={10} /> Đang chạy chế độ Demo
                    </span>
                    <button
                      onClick={() => setShowSettings(true)}
                      className="hover:underline font-bold cursor-pointer"
                    >
                      Nhập Gemini Key để mở khóa AI 🔑
                    </button>
                  </div>
                )}

                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={isLoading ? 'AI đang phân tích dữ liệu...' : 'Hỏi tôi về văn bản, đề tài, hợp đồng...'}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleSendMessage();
                      }
                    }}
                    disabled={isLoading}
                    className="flex-1 rounded-xl border border-border bg-subtle py-2.5 px-4 text-xs text-ink placeholder-txt-placeholder focus:border-primary-500 focus:bg-surface focus:outline-none disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !inputValue.trim()}
                    className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary-500 text-white hover:bg-primary-600 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                  >
                    <Send size={14} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
