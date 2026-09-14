import React, { useState, useEffect, useRef } from 'react';
import {
  Sparkles,
  X,
  Maximize2,
  Minimize2,
  Send,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Bot,
  User,
  Clock
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useAiChat } from '../../hooks/useAiChat';
import { usePhanQuyen } from '../../hooks/usePhanQuyen';
import { isGeminiProxyAvailable } from '../../services/aiService';

// Cú pháp render Markdown từ component cũ
const renderMarkdown = (text: string) => {
  if (!text) return null;
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let currentList: React.ReactNode[] = [];
  let inTable = false;
  let tableHeaders: string[] = [];
  let tableRows: string[][] = [];

  const parseInlineBoldAndItalic = (str: string): React.ReactNode => {
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

    if (trimmed.startsWith('|')) {
      inTable = true;
      const cols = trimmed.split('|').map(c => c.trim()).filter((_, i, arr) => i > 0 && i < arr.length - 1);
      
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
                <tr className="bg-subtle dark:bg-slate-800/50">
                  {headers.map((h, i) => (
                    <th key={i} className="px-3 py-2 font-black uppercase text-2xs text-ink-muted border-b border-border">
                      {parseInlineBoldAndItalic(h)}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {rows.map((row, ri) => (
                  <tr key={ri} className="hover:bg-muted/50 dark:hover:bg-slate-700/50 border-b border-border last:border-b-0 transition-colors">
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

  if (currentList.length > 0) {
    elements.push(<ul key={`ul-end`} className="my-2 space-y-1">{currentList}</ul>);
  }
  if (tableHeaders.length > 0) {
    elements.push(
      <div key={`table-end`} className="my-3 overflow-x-auto rounded-xl border border-border shadow-sm">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-subtle dark:bg-slate-800/50">
              {tableHeaders.map((h, i) => (
                <th key={i} className="px-3 py-2 font-black uppercase text-2xs text-ink-muted border-b border-border">
                  {parseInlineBoldAndItalic(h)}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {tableRows.map((row, ri) => (
              <tr key={ri} className="hover:bg-muted/50 dark:hover:bg-slate-700/50 border-b border-border last:border-b-0 transition-colors">
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

export function AiChatWidget() {
  const { can } = usePhanQuyen();
  const hasAccess = can('ai_rag', 'xem') && isGeminiProxyAvailable();

  const [isOpen, setIsOpen] = useState(false);
  const [isMaximized, setIsMaximized] = useState(false);
  const [inputValue, setInputValue] = useState('');

  const {
    messages,
    isLoading,
    error,
    pendingAction,
    sendMessage,
    handleConfirmAction,
    dismissAction,
    abortRequest
  } = useAiChat();

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading, pendingAction]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage(inputValue);
    setInputValue('');
  };

  if (!hasAccess) return null;

  return (
    <>
      {/* Floating Action Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 cursor-pointer items-center justify-center rounded-full bg-primary-600 hover:bg-primary-700 text-white shadow-lg transition-transform hover:scale-110 group focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
          title="Trợ lý AI IBST"
        >
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-400 opacity-20" />
          <Sparkles className="h-6 w-6 transition-transform group-hover:rotate-12" />
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div
          className={cn(
            'fixed z-50 flex flex-col overflow-hidden bg-surface border border-border dark:border-slate-700/80 shadow-2xl transition-all duration-300 ease-out',
            isMaximized
              ? 'inset-4 sm:inset-10 rounded-2xl'
              : 'bottom-6 right-6 w-96 h-[600px] max-h-[calc(100vh-8rem)] max-w-[calc(100vw-2rem)] rounded-2xl'
          )}
        >
          {/* Header */}
          <div className="flex h-16 shrink-0 items-center justify-between px-4 bg-primary-600 dark:bg-primary-900/80 text-white rounded-t-2xl">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 text-white shadow-sm">
                <Sparkles size={20} className="animate-pulse" />
              </div>
              <div>
                <h3 className="text-sm font-bold leading-tight flex items-center gap-1.5">
                  Trợ lý AI IBST
                  <span className="inline-flex h-2 w-2 rounded-full bg-green-400 animate-pulse" />
                </h3>
                <p className="text-[10px] text-white/80">
                  Hệ thống AI thông minh
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-1">
              <button
                onClick={() => setIsMaximized(!isMaximized)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/80 hover:bg-white/20 hover:text-white transition-colors"
              >
                {isMaximized ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-lg text-white/80 hover:bg-red-500/80 hover:text-white transition-colors"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-surface dark:bg-[#1f2332]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 opacity-70">
                <div className="h-16 w-16 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-full flex items-center justify-center mb-4">
                  <Bot size={32} />
                </div>
                <h4 className="text-ink font-bold mb-2">Xin chào!</h4>
                <p className="text-sm text-ink-muted">
                  Tôi là Trợ lý AI của Viện Khoa học Công nghệ Xây dựng. Hãy đặt câu hỏi hoặc yêu cầu tra cứu dữ liệu.
                </p>
              </div>
            )}

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
                  <div
                    className={cn(
                      'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white shadow-sm',
                      isAi
                        ? 'bg-gradient-to-br from-primary-500 to-indigo-500'
                        : 'bg-primary-600 dark:bg-primary-700'
                    )}
                  >
                    {isAi ? <Bot size={15} /> : <User size={15} />}
                  </div>

                  <div className="space-y-1">
                    <div
                      className={cn(
                        'rounded-2xl px-4 py-2.5 text-[13px] shadow-sm leading-relaxed border',
                        isAi
                          ? msg.isError 
                            ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800/50 rounded-tl-none'
                            : 'bg-muted/30 dark:bg-slate-800/50 text-ink border-border dark:border-slate-700/80 rounded-tl-none'
                          : 'bg-primary-100 dark:bg-primary-900/40 text-ink border-primary-200 dark:border-primary-800/50 rounded-tr-none'
                      )}
                    >
                      {isAi ? renderMarkdown(msg.text) : <p className="whitespace-pre-wrap">{msg.text}</p>}
                    </div>
                    <p className={cn('text-[9px] text-ink-muted px-1', !isAi && 'text-right')}>
                      {msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-3 max-w-[85%] self-start animate-pulse">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-indigo-500 text-white shadow-sm">
                  <Bot size={15} />
                </div>
                <div className="rounded-2xl rounded-tl-none border border-border dark:border-slate-700/80 bg-surface dark:bg-slate-800/50 px-4 py-3 shadow-sm flex items-center gap-1.5">
                  <Loader2 size={14} className="animate-spin text-primary-500" />
                  <span className="text-xs text-ink-muted">AI đang xử lý...</span>
                </div>
              </div>
            )}

            {/* Pending Action Card */}
            {pendingAction && !isLoading && (
              <div className="mt-4 p-4 bg-warning-50 dark:bg-yellow-900/20 border border-warning-200 dark:border-yellow-700/50 rounded-xl max-w-[85%] self-start animate-fade-in-up">
                <div className="flex items-start gap-3">
                  <div className="mt-1 text-warning-600 dark:text-warning-500">
                    <AlertCircle size={20} />
                  </div>
                  <div>
                    <h5 className="font-bold text-sm text-ink mb-1">{pendingAction.title}</h5>
                    <p className="text-xs text-ink-secondary mb-3">{pendingAction.description}</p>
                    
                    <div className="flex items-center gap-2 mb-3 text-2xs font-semibold text-warning-700 dark:text-warning-500">
                      <Clock size={12} /> Hành động cần xác nhận
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={handleConfirmAction}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-primary-600 hover:bg-primary-700 text-white text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                      >
                        <CheckCircle2 size={14} /> Xác nhận
                      </button>
                      <button
                        onClick={dismissAction}
                        className="flex-1 flex items-center justify-center gap-1.5 bg-surface border border-border dark:border-slate-700 hover:bg-muted text-ink text-xs font-bold py-2 px-3 rounded-lg transition-colors"
                      >
                        <X size={14} /> Hủy bỏ
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="shrink-0 p-4 border-t border-border dark:border-slate-700/80 bg-surface">
            {error && (
              <div className="mb-2 px-3 py-1.5 bg-danger/10 border border-danger/20 rounded-lg text-xs text-danger flex items-center gap-2">
                <AlertCircle size={14} /> {error}
              </div>
            )}
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="text"
                placeholder={isLoading ? 'Đang xử lý...' : 'Nhập tin nhắn...'}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1 rounded-xl border border-border dark:border-slate-700/80 bg-subtle dark:bg-slate-800/50 py-2.5 px-4 text-xs text-ink placeholder-txt-placeholder focus:border-primary-500 focus:outline-none disabled:opacity-50"
              />
              {isLoading ? (
                <button
                  type="button"
                  onClick={abortRequest}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-danger text-white hover:bg-danger/90 transition-colors"
                  title="Hủy yêu cầu"
                >
                  <X size={14} />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!inputValue.trim()}
                  className="flex h-9 w-9 shrink-0 cursor-pointer items-center justify-center rounded-xl bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  <Send size={14} />
                </button>
              )}
            </form>
          </div>
        </div>
      )}
    </>
  );
}
