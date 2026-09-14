import { createClient } from 'jsr:@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...CORS, 'Content-Type': 'application/json' },
  });
}

const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';
const DEFAULT_MODEL = 'gemini-3.8-flash';
const ALLOWED_MODELS = new Set([
  'gemini-3.8-flash',
  'gemini-3.7-flash',
  'gemini-3.5-flash',
  'gemini-3.1-pro-preview',
  'gemini-2.5-pro',
  'gemini-2.5-flash',
]);
const ALLOWED_EMBEDDING_MODELS = new Set([
  'text-embedding-004',
  'gemini-embedding-001',
  'gemini-embedding-2',
]);

interface RequestBody {
  model?: string;
  contents: unknown;
  tools?: unknown;
  systemInstruction?: unknown;
  generationConfig?: unknown;
  safetySettings?: unknown;
  text?: string; // For embedding requests
}

// Simple in-memory rate limiting: 60 req/min per user
const rateLimitMap = new Map<string, { count: number; windowStart: number }>();
const RATE_LIMIT = 60;
const RATE_LIMIT_WINDOW_MS = 60000;

function checkRateLimit(userId: string): boolean {
  const now = Date.now();
  const userRecord = rateLimitMap.get(userId);

  if (!userRecord) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (now - userRecord.windowStart > RATE_LIMIT_WINDOW_MS) {
    rateLimitMap.set(userId, { count: 1, windowStart: now });
    return true;
  }

  if (userRecord.count >= RATE_LIMIT) {
    return false;
  }

  userRecord.count += 1;
  return true;
}

// Cleanup rate limit map periodically to prevent memory leaks
setInterval(() => {
  const now = Date.now();
  for (const [userId, record] of rateLimitMap.entries()) {
    if (now - record.windowStart > RATE_LIMIT_WINDOW_MS) {
      rateLimitMap.delete(userId);
    }
  }
}, RATE_LIMIT_WINDOW_MS);

async function callGemini(model: string, payload: unknown, apiKey: string, isEmbedding = false): Promise<Response> {
  const endpoint = isEmbedding
    ? `${GEMINI_BASE}/${encodeURIComponent(model)}:embedContent?key=${apiKey}`
    : `${GEMINI_BASE}/${encodeURIComponent(model)}:generateContent?key=${apiKey}`;

  return fetch(endpoint, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  if (req.method !== 'POST') return json({ error: 'Method not allowed' }, 405);

  const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
  const ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY');
  const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
  if (!SUPABASE_URL || !ANON_KEY || !GEMINI_API_KEY) {
    return json({ error: 'Server misconfigured' }, 500);
  }

  const authHeader = req.headers.get('Authorization') ?? '';
  if (!authHeader.startsWith('Bearer ')) {
    return json({ error: 'Missing Authorization bearer token' }, 401);
  }
  
  const userClient = createClient(SUPABASE_URL, ANON_KEY, {
    global: { headers: { Authorization: authHeader } },
    auth: { autoRefreshToken: false, persistSession: false },
  });
  
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) {
    return json({ error: 'Invalid or expired session' }, 401);
  }

  const userId = userData.user.id;
  if (!checkRateLimit(userId)) {
    return json({ error: 'Rate limit exceeded' }, 429);
  }

  let body: RequestBody;
  try {
    body = await req.json();
  } catch {
    return json({ error: 'Invalid JSON body' }, 400);
  }

  const model = body.model || DEFAULT_MODEL;
  const isEmbedding = ALLOWED_EMBEDDING_MODELS.has(model);
  const isGeneration = ALLOWED_MODELS.has(model);

  if (!isEmbedding && !isGeneration) {
    return json({ error: `Model not allowed: ${model}` }, 400);
  }

  let upstreamPayload: Record<string, unknown>;

  if (isEmbedding) {
    let textToEmbed = body.text;
    if (!textToEmbed && Array.isArray(body.contents)) {
      textToEmbed = (body.contents[0] as any)?.parts?.[0]?.text;
    }
    if (!textToEmbed && typeof body.contents === 'string') {
      textToEmbed = body.contents;
    }
    if (!textToEmbed) {
      return json({ error: 'Missing required field for embedding: text' }, 400);
    }
    const resolvedEmbedModel = (model === 'text-embedding-004') ? 'gemini-embedding-001' : model;
    upstreamPayload = {
      model: `models/${resolvedEmbedModel}`,
      content: { parts: [{ text: textToEmbed }] },
      outputDimensionality: 768,
    };
  } else {
    if (!body || typeof body !== 'object' || !body.contents) {
      return json({ error: 'Missing required field: contents' }, 400);
    }
    upstreamPayload = { contents: body.contents };
    if (body.tools) {
      if (Array.isArray(body.tools) && body.tools.length > 0 && !('functionDeclarations' in (body.tools as any)[0])) {
        upstreamPayload.tools = [{ functionDeclarations: body.tools }];
      } else {
        upstreamPayload.tools = body.tools;
      }
    }
    if (body.systemInstruction) upstreamPayload.systemInstruction = body.systemInstruction;
    if (body.generationConfig) upstreamPayload.generationConfig = body.generationConfig;
    if (body.safetySettings) upstreamPayload.safetySettings = body.safetySettings;
  }

  try {
    const targetModel = isEmbedding && model === 'text-embedding-004' ? 'gemini-embedding-001' : model;
    let upstream = await callGemini(targetModel, upstreamPayload, GEMINI_API_KEY, isEmbedding);
    let fallbackUsed = false;
    let resolvedModel = targetModel;

    // Fallback logic for generation models
    if (isGeneration && !upstream.ok && (upstream.status === 429 || upstream.status === 503) && model !== 'gemini-2.5-flash') {
      const fallbackModel = 'gemini-2.5-flash';
      upstream = await callGemini(fallbackModel, upstreamPayload, GEMINI_API_KEY, false);
      if (upstream.ok) {
        fallbackUsed = true;
        resolvedModel = fallbackModel;
      }
    }

    const text = await upstream.text();
    if (!upstream.ok) {
      let detail: unknown = text;
      try { detail = JSON.parse(text); } catch { /* keep raw text */ }
      return json({ error: 'Gemini upstream error', status: upstream.status, detail }, upstream.status);
    }

    const responseBody = JSON.parse(text) as Record<string, unknown>;
    
    // Embedding usually returns { embedding: { values } }
    // Add ibstMetadata in the response wrapper
    responseBody.ibstMetadata = {
      requestedModel: model,
      resolvedModel,
      fallbackUsed,
    };
    return json(responseBody);
  } catch (e) {
    return json({ error: (e as Error).message ?? 'Internal error' }, 500);
  }
});
