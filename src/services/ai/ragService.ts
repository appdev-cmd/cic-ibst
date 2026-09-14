import { embedText, generateContent } from './geminiProxy';
import { supabase } from '../../lib/supabase';

export interface RAGChunk {
  id: string;
  ma_chunk?: string;
  document_id?: string;
  title?: string;
  ten_van_ban?: string;
  loai_van_ban?: string;
  content: string;
  noi_dung_chunk?: string;
  similarity?: number;
  createdAt: string;
  tao_luc?: string;
  metadata?: any;
}

export interface RAGGraphTriple {
  id: string;
  ma_triple?: string;
  subject: string;
  predicate: string;
  object: string;
  entity_type?: string;
  context?: string;
  mo_ta_lien_ket?: string;
}

export interface IngestDocumentParams {
  name?: string;
  title?: string;
  documentId?: string;
  type?: string;
  loai_van_ban?: string;
  content?: string;
  file?: File | null;
  metadata?: any;
}

export interface RAGSearchResult {
  contextSnippet: string;
  chunks: RAGChunk[];
  triples: RAGGraphTriple[];
}

export async function generateEmbedding(text: string): Promise<number[]> {
  const embedding = await embedText(text);
  if (!embedding) {
    throw new Error('Không thể tạo embedding từ văn bản');
  }
  return embedding;
}

export function chunkText(text: string, chunkSize = 1200, overlap = 200): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < text.length) {
    chunks.push(text.slice(i, i + chunkSize));
    i += chunkSize - overlap;
  }
  return chunks;
}

export async function extractTriples(chunk: string, docTitle: string): Promise<RAGGraphTriple[]> {
  const prompt = `Trích xuất các thực thể và mối quan hệ từ đoạn văn bản sau thuộc tài liệu "${docTitle}".
Trả về danh sách định dạng JSON gồm các object { "subject": "...", "predicate": "...", "object": "...", "entity_type": "..." }.
Entity types được cho phép: HopDong, QuyChuan, TieuChuan, DonVi, CanBo, DeTai, ThiNghiem, VanBan.
Văn bản:
${chunk}`;

  try {
    const response = await generateContent(prompt);
    if (!response) return [];
    
    const jsonMatch = response.match(/\[.*\]/s);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      return parsed.map((item: any) => ({
        id: crypto.randomUUID ? crypto.randomUUID() : String(Math.random()),
        subject: item.subject,
        predicate: item.predicate,
        object: item.object,
        entity_type: item.entity_type,
        context: docTitle,
      }));
    }
    return [];
  } catch (error) {
    console.error('Lỗi khi trích xuất thực thể:', error);
    return [];
  }
}

export function extractKeywordsAndBigrams(text: string): string[] {
  const terms = ['hợp đồng', 'tiêu chuẩn', 'quy chuẩn', 'nghiệm thu', 'thí nghiệm', 'bê tông', 'cốt thép', 'PCCC', 'kiểm định', 'giám sát'];
  const lowerText = text.toLowerCase();
  return terms.filter(t => lowerText.includes(t));
}

export async function searchHybridKnowledge(query: string, options?: { limit?: number; docType?: string }): Promise<RAGSearchResult> {
  const limit = options?.limit || 5;
  let queryEmbedding: number[] | null = null;
  try {
    queryEmbedding = await generateEmbedding(query);
  } catch {
    // Nếu embedding fail, fallback
  }
  
  // Vector Search
  let chunksData: any[] = [];
  if (queryEmbedding) {
    const { data, error } = await supabase.rpc('match_knowledge_chunks', {
      query_embedding: queryEmbedding,
      query_text: query,
      match_threshold: 0.1,
      match_count: limit,
      filter_loai: options?.docType || null,
      filter_du_an: null,
    });
    if (!error && data) chunksData = data;
  }

  // Graph Search (Keywords/Bigrams)
  const keywords = extractKeywordsAndBigrams(query);
  let triplesData: RAGGraphTriple[] = [];
  
  if (keywords.length > 0) {
    let graphQuery = supabase.from('rag_knowledge_graph').select('*');
    const orCondition = keywords.map(k => `subject_entity.ilike.%${k}%,object_entity.ilike.%${k}%`).join(',');
    graphQuery = graphQuery.or(orCondition).limit(20);
    
    const { data: graphRes } = await graphQuery;
    if (graphRes) {
      triplesData = graphRes.map((t: any) => ({
        id: t.ma_triple || String(Math.random()),
        ma_triple: t.ma_triple,
        subject: t.subject_entity,
        predicate: t.predicate,
        object: t.object_entity,
        entity_type: t.subject_type || 'Entity',
        context: t.mo_ta_lien_ket || '',
        mo_ta_lien_ket: t.mo_ta_lien_ket,
      }));
    }
  }

  const chunks: RAGChunk[] = (chunksData || []).map((c: any) => ({
    id: c.ma_chunk || String(Math.random()),
    ma_chunk: c.ma_chunk,
    title: c.ten_van_ban || 'Tài liệu',
    ten_van_ban: c.ten_van_ban,
    loai_van_ban: c.loai_van_ban,
    content: c.noi_dung_chunk || c.content || '',
    noi_dung_chunk: c.noi_dung_chunk,
    similarity: c.similarity ?? 0.85,
    createdAt: c.tao_luc || new Date().toISOString(),
    tao_luc: c.tao_luc,
    metadata: c.metadata || { source: c.ten_van_ban, type: c.loai_van_ban },
  }));
  
  let contextSnippet = '--- Trích xuất từ tài liệu ---\n';
  chunks.forEach((c, i) => {
    contextSnippet += `[Đoạn ${i + 1} - ${c.title}]: ${c.content}\n\n`;
  });

  if (triplesData.length > 0) {
    contextSnippet += '--- Thông tin liên kết ---\n';
    triplesData.forEach((t) => {
      contextSnippet += `- ${t.subject} ${t.predicate} ${t.object} (${t.entity_type})\n`;
    });
  }

  return { contextSnippet, chunks, triples: triplesData };
}

export async function ingestDocument(params: IngestDocumentParams): Promise<void> {
  const docTitle = params.title || params.name || 'Tài liệu';
  const docType = params.loai_van_ban || params.type || 'quy_dinh';
  
  let rawContent = params.content || '';
  if (!rawContent && params.file) {
    try {
      rawContent = await params.file.text();
    } catch {
      rawContent = `Tài liệu: ${params.file.name}`;
    }
  }

  if (!rawContent.trim()) return;
  const chunks = chunkText(rawContent);
  
  for (let i = 0; i < chunks.length; i++) {
    const chunkContent = chunks[i];
    let embedding: number[] | null = null;
    try {
      embedding = await generateEmbedding(chunkContent);
    } catch (err) {
      console.warn('Cannot generate embedding:', err);
    }
    
    const { data: chunkRow, error: insertError } = await supabase.from('rag_knowledge_chunks').insert({
      ten_van_ban: docTitle,
      loai_van_ban: docType,
      noi_dung_chunk: chunkContent,
      vector_embedding: embedding,
      metadata: { ...(params.metadata || {}), source: docTitle, type: docType, chunk_index: i },
    }).select('ma_chunk').single();
    
    if (insertError) {
      console.error('Lỗi lưu chunk:', insertError);
      continue;
    }
    
    const triples = await extractTriples(chunkContent, docTitle);
    if (triples.length > 0) {
      const triplesToInsert = triples.map(t => ({
        subject_entity: t.subject,
        subject_type: t.entity_type || 'Entity',
        predicate: t.predicate,
        object_entity: t.object,
        object_type: 'Entity',
        mo_ta_lien_ket: t.context || docTitle,
        ma_chunk: chunkRow?.ma_chunk || null,
      }));
      await supabase.from('rag_knowledge_graph').insert(triplesToInsert);
    }
  }
}

