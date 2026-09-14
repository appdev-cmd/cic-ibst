import { useState, useEffect, useCallback } from 'react';
import { Upload, Search, Trash2, Database, Network, FileText, Loader2, AlertCircle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { supabase } from '../../lib/supabase';
import { ingestDocument, searchHybridKnowledge } from '../../services/ai/ragService';
import type { RAGChunk, RAGGraphTriple } from '../../services/ai/ragService';

export function RAGKnowledgeManager() {
  const [chunks, setChunks] = useState<RAGChunk[]>([]);
  const [triples, setTriples] = useState<RAGGraphTriple[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<RAGChunk[]>([]);
  const [searching, setSearching] = useState(false);

  // Form upload
  const [docName, setDocName] = useState('');
  const [docType, setDocType] = useState('quy-che');
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const loadData = async () => {
    setLoading(true);
    try {
      const { data: chunksData } = await supabase
        .from('rag_knowledge_chunks')
        .select('*')
        .order('tao_luc', { ascending: false })
        .limit(20);
      const { data: triplesData } = await supabase
        .from('rag_knowledge_graph')
        .select('*')
        .order('tao_luc', { ascending: false })
        .limit(20);
      
      setChunks((chunksData || []).map((c: any) => ({
        id: c.ma_chunk,
        ma_chunk: c.ma_chunk,
        content: c.noi_dung_chunk,
        title: c.ten_van_ban,
        metadata: c.metadata || { source: c.ten_van_ban, type: c.loai_van_ban },
        createdAt: c.tao_luc || new Date().toISOString(),
        similarity: 1,
      })));
      setTriples((triplesData || []).map((t: any) => ({
        id: t.ma_triple,
        ma_triple: t.ma_triple,
        subject: t.subject_entity,
        predicate: t.predicate,
        object: t.object_entity,
        entity_type: t.subject_type,
        context: t.mo_ta_lien_ket,
      })));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleFileDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!file || !docName) return;
    setUploading(true);
    setUploadProgress(10);
    try {
      setUploadProgress(50);
      await ingestDocument({ name: docName, type: docType, file });
      setUploadProgress(100);
      setFile(null);
      setDocName('');
      await loadData();
    } catch (error) {
      console.error("Upload error", error);
    } finally {
      setUploading(false);
      setUploadProgress(0);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery) return;
    setSearching(true);
    try {
      const results = await searchHybridKnowledge(searchQuery);
      setSearchResults(results.chunks);
    } catch (error) {
      console.error(error);
    } finally {
      setSearching(false);
    }
  };

  const handleDeleteChunk = async (id?: string) => {
    if (!id) return;
    if (!confirm('Xóa chunk này?')) return;
    try {
      await supabase.from('rag_knowledge_chunks').delete().eq('ma_chunk', id);
      setChunks(prev => prev.filter(c => (c.id !== id && c.ma_chunk !== id)));
    } catch (error) {
      console.error(error);
    }
  };

  const handleDeleteTriple = async (id?: string) => {
    if (!id) return;
    if (!confirm('Xóa triple này?')) return;
    try {
      await supabase.from('rag_knowledge_graph').delete().eq('ma_triple', id);
      setTriples(prev => prev.filter(t => (t.id !== id && t.ma_triple !== id)));
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold text-ink">Kho tri thức RAG</h2>
        <button onClick={loadData} className="btn-secondary flex items-center gap-2">
          {loading && <Loader2 size={16} className="animate-spin" />}
          Làm mới
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cột trái: Upload */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-4">
              <Upload size={18} className="text-primary-500" />
              Nạp tài liệu mới
            </h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Tên tài liệu</label>
                <input 
                  type="text" 
                  className="w-full rounded-lg border border-border bg-subtle px-3 py-2 text-sm focus:border-primary-500 outline-none"
                  placeholder="VD: Quy chế nội bộ 2026..."
                  value={docName}
                  onChange={e => setDocName(e.target.value)}
                />
              </div>
              
              <div>
                <label className="block text-xs font-semibold text-ink-secondary mb-1">Loại tài liệu</label>
                <select 
                  className="w-full rounded-lg border border-border bg-subtle px-3 py-2 text-sm focus:border-primary-500 outline-none"
                  value={docType}
                  onChange={e => setDocType(e.target.value)}
                >
                  <option value="quy-che">Quy chế / Quy định</option>
                  <option value="huong-dan">Hướng dẫn</option>
                  <option value="hop-dong">Mẫu hợp đồng</option>
                  <option value="khac">Khác</option>
                </select>
              </div>

              <div 
                className={cn(
                  "border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-colors",
                  file ? "border-primary-500 bg-primary-subtle/30" : "border-border hover:border-ink-muted bg-subtle"
                )}
                onDragOver={e => e.preventDefault()}
                onDrop={handleFileDrop}
                onClick={() => document.getElementById('file-upload')?.click()}
              >
                <input id="file-upload" type="file" className="hidden" accept=".txt,.md,.pdf" onChange={handleFileChange} />
                {file ? (
                  <div className="flex flex-col items-center gap-2">
                    <FileText size={24} className="text-primary-500" />
                    <span className="text-sm font-semibold text-ink">{file.name}</span>
                    <span className="text-xs text-ink-muted">{(file.size / 1024).toFixed(1)} KB</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-2 text-ink-muted">
                    <Upload size={24} />
                    <span className="text-sm font-semibold text-ink">Kéo thả file vào đây</span>
                    <span className="text-xs">hoặc click để chọn (.txt, .md, .pdf)</span>
                  </div>
                )}
              </div>

              <button 
                onClick={handleUpload}
                disabled={!file || !docName || uploading}
                className="btn-primary w-full justify-center disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 size={16} className="animate-spin mr-2" />
                    Đang nạp ({uploadProgress}%)
                  </>
                ) : 'Nạp vào kho tri thức'}
              </button>
            </div>
          </div>

          <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-ink flex items-center gap-2 mb-4">
              <Search size={18} className="text-amber-500" />
              Thử nghiệm tìm kiếm Vector
            </h3>
            <div className="flex gap-2 mb-4">
              <input 
                type="text" 
                className="flex-1 rounded-lg border border-border bg-subtle px-3 py-2 text-sm focus:border-primary-500 outline-none"
                placeholder="Nhập câu hỏi..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
              />
              <button onClick={handleSearch} disabled={searching || !searchQuery} className="btn-secondary">
                {searching ? <Loader2 size={16} className="animate-spin" /> : <Search size={16} />}
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto">
              {searchResults.length === 0 && !searching && searchQuery && (
                <p className="text-xs text-ink-muted text-center py-4">Không tìm thấy kết quả</p>
              )}
              {searchResults.map((res, i) => (
                <div key={i} className="p-3 rounded-lg border border-border bg-subtle text-sm">
                  <div className="flex justify-between items-start mb-1">
                    <span className="font-semibold text-ink">{res.metadata?.source || 'Không rõ'}</span>
                    <span className="text-2xs font-bold text-primary">Score: {res.similarity?.toFixed(3)}</span>
                  </div>
                  <p className="text-xs text-ink-secondary line-clamp-3">{res.content}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Cột phải: Dữ liệu */}
        <div className="lg:col-span-2 space-y-6">
          {/* Vector Chunks */}
          <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 dark:bg-slate-900/60 shrink-0">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Database size={18} className="text-blue-500" />
                Danh sách Text Chunks
              </h3>
              <span className="text-xs font-semibold text-ink-muted bg-subtle px-2 py-1 rounded-md">{chunks.length} chunks</span>
            </div>
            <div className="overflow-auto flex-1 p-0">
              <table className="w-full text-left text-sm divide-y divide-border dark:divide-slate-700/80">
                <thead className="bg-muted/30 dark:bg-slate-900/60 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-ink-muted w-1/4">Tài liệu</th>
                    <th className="px-4 py-2 font-semibold text-ink-muted">Nội dung</th>
                    <th className="px-4 py-2 font-semibold text-ink-muted w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-slate-700/80">
                  {chunks.map((chunk) => (
                    <tr key={chunk.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 align-top">
                        <p className="font-medium text-ink text-xs line-clamp-2">{chunk.metadata?.source}</p>
                        <p className="text-2xs text-ink-muted mt-1">{new Date(chunk.createdAt).toLocaleDateString('vi-VN')}</p>
                      </td>
                      <td className="px-4 py-3 align-top">
                        <p className="text-xs text-ink-secondary line-clamp-3">{chunk.content}</p>
                      </td>
                      <td className="px-4 py-3 align-top text-right">
                        <button onClick={() => handleDeleteChunk(chunk.id)} className="text-danger hover:text-danger-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {chunks.length === 0 && (
                    <tr>
                      <td colSpan={3} className="px-4 py-8 text-center text-ink-muted">Chưa có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Graph Triples */}
          <div className="bg-surface border border-border dark:border-slate-700/80 rounded-xl shadow-sm overflow-hidden flex flex-col h-[400px]">
            <div className="p-4 border-b border-border flex justify-between items-center bg-muted/30 dark:bg-slate-900/60 shrink-0">
              <h3 className="text-sm font-bold text-ink flex items-center gap-2">
                <Network size={18} className="text-purple-500" />
                Knowledge Graph (Triples)
              </h3>
              <span className="text-xs font-semibold text-ink-muted bg-subtle px-2 py-1 rounded-md">{triples.length} triples</span>
            </div>
            <div className="overflow-auto flex-1 p-0">
              <table className="w-full text-left text-sm divide-y divide-border dark:divide-slate-700/80">
                <thead className="bg-muted/30 dark:bg-slate-900/60 sticky top-0">
                  <tr>
                    <th className="px-4 py-2 font-semibold text-ink-muted w-1/4">Subject</th>
                    <th className="px-4 py-2 font-semibold text-ink-muted w-1/5">Predicate</th>
                    <th className="px-4 py-2 font-semibold text-ink-muted w-1/4">Object</th>
                    <th className="px-4 py-2 font-semibold text-ink-muted">Context</th>
                    <th className="px-4 py-2 font-semibold text-ink-muted w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border dark:divide-slate-700/80">
                  {triples.map((t) => (
                    <tr key={t.id} className="hover:bg-muted/20 dark:hover:bg-slate-800/40">
                      <td className="px-4 py-3 font-semibold text-ink text-xs">{t.subject}</td>
                      <td className="px-4 py-3 text-primary font-mono text-2xs bg-primary-subtle/30 rounded px-1 my-1 inline-block">{t.predicate}</td>
                      <td className="px-4 py-3 font-semibold text-ink text-xs">{t.object}</td>
                      <td className="px-4 py-3 text-xs text-ink-secondary truncate max-w-[150px]">{t.context}</td>
                      <td className="px-4 py-3 text-right">
                        <button onClick={() => handleDeleteTriple(t.id)} className="text-danger hover:text-danger-600 transition-colors">
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                  {triples.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-ink-muted">Chưa có dữ liệu</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
