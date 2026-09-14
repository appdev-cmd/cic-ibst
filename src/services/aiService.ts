import { sendContextAwareMessage, executeConfirmedAIAction } from './ai/aiOrchestrator';
import type { PendingAIAction, AIChatResponse } from './ai/aiOrchestrator';
import { isGeminiProxyAvailable } from './ai/geminiProxy';

export interface AIAttachment {
    id: string;
    name: string;
    size: number;
    type: string;
    mimeType?: string;
    base64?: string;
    content?: string;
    previewUrl?: string;
}

export interface ChatMessage {
    id: string;
    text: string;
    sender: 'user' | 'ai';
    timestamp: Date;
    isError?: boolean;
    attachments?: AIAttachment[];
}

export type { PendingAIAction, AIChatResponse };

export const sendMessageToGemini = async (
    history: ChatMessage[],
    newMessage: string,
    signal?: AbortSignal,
    attachments?: AIAttachment[]
): Promise<AIChatResponse> => {
    return sendContextAwareMessage(history, newMessage, signal, attachments);
};

export const confirmAIAction = async (action: PendingAIAction): Promise<unknown> => {
    return executeConfirmedAIAction(action);
};

export { isGeminiProxyAvailable };

