import React, { useState } from 'react';
import { Search, Loader2, Filter, FileText, Bot, FileStack } from 'lucide-react';
import { cn } from '../../lib/utils';
// Giả định import, vì prompt nói: Dùng searchHybridKnowledge từ services/ai/ragService
// Nếu file không tồn tại sẽ cần tự tạo, nhưng prompt yêu cầu dùng function đó
import { searchHybridKnowledge } from '../../services/ai/ragService';

interface AiRagPanelProps {
  onAskAI?: (context: string) => void;
}

export function AiRagPanel({ onAskAI }: AiRagPanelProps) {
  const [query, setQuery] = useState('');
  const [docType, setDocType] = useState('tat_ca');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    setIsLoading(true);
    setHasSearched(true);
    try {
      const res = await searchHybridKnowledge(query, {
        docType: docType === 'tat_ca' ? undefined : docType,
        limit: 5,
      });
      if (res && res.chunks) {
        setResults(res.chunks);
      } else {
        setResults([]);
      }
    } catch (err) {
      console.error('Lỗi khi tìm kiếm RAG:', err);
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full bg-surface text-ink">
      {/* Header & Search */}
      <div className="p-4 border-b border-border dark:border-slate-700/80 space-y-4">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <FileStack className="text-primary-600" size={24} />
            Tra cứu Tri thức (QCVN/TCVN)
          </h2>
          <p className="text-sm text-ink-muted">Tìm kiếm trong cơ sở dữ liệu tri thức xây dựng</p>
        </div>

        <form onSubmit={handleSearch} className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" size={16} />
            <input
              type="text"
              placeholder="Nhập từ khóa hoặc câu hỏi cần tra cứu..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-subtle dark:bg-slate-800/50 border border-border dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors"
            />
          </div>
          <div className="relative">
            <select
              value={docType}
              onChange={(e) => setDocType(e.target.value)}
              className="appearance-none pl-9 pr-8 py-2 bg-subtle dark:bg-slate-800/50 border border-border dark:border-slate-700/80 rounded-xl text-sm focus:outline-none focus:border-primary-500 transition-colors cursor-pointer"
            >
              <option value="tat_ca">Tất cả tài liệu</option>
              <option value="quy_dinh">Quy định</option>
              <option value="quy_che">Quy chế</option>
              <option value="tieu_chuan">Tiêu chuẩn</option>
            </select>
            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted pointer-events-none" size={16} />
          </div>
          <button
            type="submit"
            disabled={isLoading || !query.trim()}
            className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 size={16} className="animate-spin" /> : 'Tìm kiếm'}
          </button>
        </form>
      </div>

      {/* Results Area */}
      <div className="flex-1 overflow-y-auto p-4 bg-page/30 dark:bg-[#1f2332]/50">
        {!hasSearched ? (
          <div className="flex flex-col items-center justify-center h-full text-ink-muted opacity-80">
            <Search size={48} className="mb-4 text-primary-200 dark:text-primary-800" />
            <p className="text-sm font-medium">Nhập từ khóa để tìm kiếm tri thức</p>
          </div>
        ) : isLoading ? (
          <div className="flex flex-col items-center justify-center h-full text-primary-500">
            <Loader2 size={32} className="animate-spin mb-4" />
            <p className="text-sm font-medium">Đang tìm kiếm thông tin liên quan...</p>
          </div>
        ) : results.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-ink-muted">
            <FileText size={48} className="mb-4 text-slate-300 dark:text-slate-700" />
            <p className="text-sm font-medium text-ink">Không tìm thấy kết quả phù hợp</p>
            <p className="text-xs mt-1">Hãy thử tìm với các từ khóa khác.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {results.map((item, index) => (
              <div key={index} className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-4 shadow-sm hover:border-primary-300 dark:hover:border-primary-700 transition-colors">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-bold text-ink text-sm flex items-center gap-2">
                    <FileText size={16} className="text-primary-500" />
                    {item.title || item.metadata?.title || 'Tài liệu không xác định'}
                  </h3>
                  <span className="text-xs px-2 py-1 bg-primary-50 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 font-semibold rounded-md whitespace-nowrap">
                    Độ tin cậy: {Math.round((item.similarity || 0) * 100)}%
                  </span>
                </div>
                
                <p className="text-sm text-ink-secondary line-clamp-3 mb-3 leading-relaxed">
                  {item.content}
                </p>

                {item.metadata?.type && (
                  <div className="flex gap-2 mb-3">
                    <span className="text-2xs px-2 py-1 bg-subtle dark:bg-slate-800 rounded text-ink-muted font-medium uppercase tracking-wider">
                      {item.metadata.type}
                    </span>
                  </div>
                )}

                {onAskAI && (
                  <button
                    onClick={() => {
                      const contextText = `Ngữ cảnh: ${item.title}\nNội dung: ${item.content}`;
                      onAskAI(contextText);
                    }}
                    className="flex items-center gap-1.5 text-xs font-semibold text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 transition-colors"
                  >
                    <Bot size={14} /> Hỏi AI về kết quả này
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
