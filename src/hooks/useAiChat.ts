import { useState, useRef, useCallback } from 'react';
import { sendMessageToGemini, confirmAIAction } from '../services/aiService';
import type { ChatMessage, AIAttachment, AIChatResponse, PendingAIAction } from '../services/aiService';

export function useAiChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<PendingAIAction | null>(null);
  const abortRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (text: string, attachments?: AIAttachment[]) => {
    if (!text.trim() && (!attachments || attachments.length === 0)) return;
    setError(null);
    
    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      text: text.trim(),
      sender: 'user',
      timestamp: new Date(),
      attachments,
    };
    setMessages(prev => [...prev, userMsg]);
    setIsLoading(true);
    
    const controller = new AbortController();
    abortRef.current = controller;
    
    try {
      const response = await sendMessageToGemini(
        [...messages, userMsg],  // full history
        text.trim(),
        controller.signal,
        attachments
      );
      
      const aiMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: response.text,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiMsg]);
      
      if (response.pendingAction) {
        setPendingAction(response.pendingAction);
      }
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: err?.message || 'Lỗi kết nối AI',
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
      setError(err?.message || 'Lỗi');
    } finally {
      setIsLoading(false);
      abortRef.current = null;
    }
  }, [messages]);

  const handleConfirmAction = useCallback(async () => {
    if (!pendingAction) return;
    try {
      setIsLoading(true);
      await confirmAIAction(pendingAction);
      const successMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: `✅ Đã thực hiện thành công: ${pendingAction.title}`,
        sender: 'ai',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, successMsg]);
      setPendingAction(null);
    } catch (err: any) {
      const errMsg: ChatMessage = {
        id: crypto.randomUUID(),
        text: `❌ Lỗi: ${err?.message}`,
        sender: 'ai',
        timestamp: new Date(),
        isError: true,
      };
      setMessages(prev => [...prev, errMsg]);
    } finally {
      setIsLoading(false);
    }
  }, [pendingAction]);

  const dismissAction = useCallback(() => setPendingAction(null), []);
  const abortRequest = useCallback(() => abortRef.current?.abort(), []);
  const clearHistory = useCallback(() => {
    setMessages([]);
    setPendingAction(null);
    setError(null);
  }, []);

  return {
    messages,
    isLoading,
    error,
    pendingAction,
    sendMessage,
    handleConfirmAction,
    dismissAction,
    abortRequest,
    clearHistory,
  };
}
