import { supabase } from '../../lib/supabase';
import { logAIUsage } from '../aiUsageService';

export enum SchemaType {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    INTEGER = 'INTEGER',
    BOOLEAN = 'BOOLEAN',
    ARRAY = 'ARRAY',
    OBJECT = 'OBJECT',
}

export interface Schema {
    type: SchemaType;
    description?: string;
    properties?: Record<string, Schema>;
    items?: Schema;
    required?: string[];
}

export interface FunctionDeclaration {
    name: string;
    description: string;
    parameters?: Schema;
}

export interface FunctionCall {
    name: string;
    args: Record<string, any>;
}

export interface FunctionResponse {
    name: string;
    response: Record<string, any>;
}

export interface Part {
    text?: string;
    inlineData?: {
        mimeType: string;
        data: string;
    };
    functionCall?: FunctionCall;
    functionResponse?: FunctionResponse;
}

export interface Content {
    role: 'user' | 'model' | 'function';
    parts: Part[];
}

export interface GenerationConfig {
    temperature?: number;
    topP?: number;
    topK?: number;
    candidateCount?: number;
    maxOutputTokens?: number;
    stopSequences?: string[];
}

export interface GenerateContentRequest {
    contents: Content[];
    tools?: { functionDeclarations: FunctionDeclaration[] }[];
    generationConfig?: GenerationConfig;
    systemInstruction?: { role: string; parts: Part[] };
}

export interface GeminiResponse {
    candidates?: {
        content: Content;
        finishReason?: string;
    }[];
    usageMetadata?: {
        promptTokenCount: number;
        candidatesTokenCount: number;
        totalTokenCount: number;
    };
}

export interface GenerateContentResult {
    response: {
        text: () => string;
        functionCalls: () => FunctionCall[];
        candidates?: any[];
    };
}

const DEFAULT_MODEL = 'gemini-3.8-flash';

function calculateTokensFromPayload(payload: any, response: GeminiResponse | null): { input: number; output: number } {
    if (response?.usageMetadata) {
        return {
            input: response.usageMetadata.promptTokenCount || 0,
            output: response.usageMetadata.candidatesTokenCount || 0,
        };
    }
    const strPayload = JSON.stringify(payload);
    const input = Math.ceil(strPayload.length / 4);
    const output = response ? Math.ceil(JSON.stringify(response).length / 4) : 0;
    return { input, output };
}

function wrapResponse(raw: GeminiResponse): GenerateContentResult {
    const candidate = raw.candidates?.[0];
    const parts = candidate?.content?.parts || [];

    return {
        response: {
            text: () => parts.map(p => p.text || '').join(''),
            functionCalls: () => parts.filter(p => p.functionCall).map(p => p.functionCall as FunctionCall),
            candidates: raw.candidates,
        }
    };
}

export async function invokeProxy(model: string, payload: any, featureName: string, signal?: AbortSignal): Promise<GenerateContentResult> {
    const startTime = Date.now();
    try {
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
            body: { model, ...payload }
        });

        if (error) throw error;
        
        const rawResponse = data as GeminiResponse;
        const tokens = calculateTokensFromPayload(payload, rawResponse);
        
        logAIUsage({
            mo_hinh_ai: model,
            tinh_nang: featureName,
            token_input: tokens.input,
            token_output: tokens.output,
            thoi_gian_xu_ly_ms: Date.now() - startTime,
            trang_thai: 'thanh_cong',
            nha_cung_cap: 'google'
        });

        return wrapResponse(rawResponse);
    } catch (err: any) {
        logAIUsage({
            mo_hinh_ai: model,
            tinh_nang: featureName,
            token_input: 0,
            token_output: 0,
            thoi_gian_xu_ly_ms: Date.now() - startTime,
            trang_thai: 'loi',
            ghi_chu_loi: err.message,
            nha_cung_cap: 'google'
        });
        throw err;
    }
}

export function getGenerativeModel(options?: { model?: string; systemInstruction?: string; tools?: any[] }) {
    const model = options?.model || DEFAULT_MODEL;

    return {
        generateContent: async (prompt: string | Content[], opts?: any): Promise<GenerateContentResult> => {
            const contents: Content[] = typeof prompt === 'string' 
                ? [{ role: 'user', parts: [{ text: prompt }] }] 
                : prompt;
                
            const payload: any = { contents };
            if (options?.systemInstruction) {
                payload.systemInstruction = { role: 'system', parts: [{ text: options.systemInstruction }] };
            }
            if (options?.tools) {
                payload.tools = Array.isArray(options.tools) && options.tools.length > 0 && !('functionDeclarations' in options.tools[0])
                    ? [{ functionDeclarations: options.tools }]
                    : options.tools;
            }
            
            return invokeProxy(model, payload, 'generateContent');
        },
        startChat: (chatOpts?: { history?: Content[]; generationConfig?: GenerationConfig; signal?: AbortSignal }) => {
            const history: Content[] = chatOpts?.history ? [...chatOpts.history] : [];
            const generationConfig = chatOpts?.generationConfig;
            
            return {
                sendMessage: async (msg: string | Part[] | any, opts?: any): Promise<GenerateContentResult> => {
                    let parts: Part[] = [];
                    if (typeof msg === 'string') {
                        parts = [{ text: msg }];
                    } else if (Array.isArray(msg)) {
                        parts = msg;
                    } else if (msg && Array.isArray(msg.parts)) {
                        parts = msg.parts;
                    } else {
                        parts = [msg];
                    }

                    const newContent: Content = { role: (msg && msg.role) || 'user', parts };
                    const contents = [...history, newContent];
                    
                    const payload: any = { contents };
                    if (generationConfig) {
                        payload.generationConfig = generationConfig;
                    }
                    if (options?.systemInstruction) {
                        payload.systemInstruction = { role: 'system', parts: [{ text: options.systemInstruction }] };
                    }
                    if (options?.tools) {
                        payload.tools = Array.isArray(options.tools) && options.tools.length > 0 && !('functionDeclarations' in options.tools[0])
                            ? [{ functionDeclarations: options.tools }]
                            : options.tools;
                    }
                    
                    const result = await invokeProxy(model, payload, 'chat', chatOpts?.signal || opts?.signal);
                    history.push(newContent);
                    if (result.response.candidates?.[0]?.content) {
                        history.push(result.response.candidates[0].content);
                    }
                    
                    return result;
                },
                getHistory: () => history
            };
        }
    };
}

export async function generateContent(prompt: string | { prompt: string } | Content[], options?: any): Promise<string> {
    const textPrompt = typeof prompt === 'string' ? prompt : (Array.isArray(prompt) ? prompt : prompt.prompt);
    const model = getGenerativeModel({ model: options?.model });
    const result = await model.generateContent(textPrompt as any, options);
    return result.response.text();
}

export async function generateFromImage(imageBase64: string, mimeType: string, prompt: string, options?: any): Promise<string> {
    const payload = {
        contents: [
            {
                role: 'user',
                parts: [
                    { inlineData: { mimeType, data: imageBase64 } },
                    { text: prompt }
                ]
            }
        ]
    };
    
    const result = await invokeProxy(DEFAULT_MODEL, payload, 'generateFromImage');
    return result.response.text();
}

export async function embedText(text: string): Promise<number[] | null> {
    try {
        const { data, error } = await supabase.functions.invoke('gemini-proxy', {
            body: { model: 'text-embedding-004', text, contents: [{ parts: [{ text }] }] }
        });
        if (error) return null;
        return data.embedding?.values || null;
    } catch {
        return null;
    }
}

export function isGeminiProxyAvailable(): boolean {
    return true;
}
