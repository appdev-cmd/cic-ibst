import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { DxfParser } from 'dxf-parser';
import { CADCanvas } from './CADCanvas';
import { getHexColorFromDxfColor } from '../utils/dxfRenderer';
import { getDxfUnits, formatDistanceMm, formatAreaMm2 } from '../utils/dxfUnits';
import { fetchHopDong } from '@/services/queries';
interface ErpProject {
  ProjectID: string;
  ProjectName: string;
  GroupCode?: string;
}
import { 
  Upload, 
  Ruler, 
  Layers, 
  Eye, 
  EyeOff, 
  Check, 
  AlertTriangle,
  FileCode,
  Info,
  FolderOpen,
  Plus,
  Trash2,
  Link,
  ChevronLeft,
  Calendar,
  FileText,
  Maximize2,
  Sun,
  Moon
} from 'lucide-react';

export const CADViewerContainer: React.FC = () => {
  const [dxfData, setDxfData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Trạng thái các Layer
  const [hiddenLayers, setHiddenLayers] = useState<Set<string>>(new Set());
  const [showLayerPanel, setShowLayerPanel] = useState<boolean>(true);
  const [layerSearchQuery, setLayerSearchQuery] = useState<string>('');

  // Chế độ đo đạc ('none', 'distance', 'area')
  const [measureMode, setMeasureMode] = useState<'none' | 'distance' | 'area'>('none');
  const [measuredValue, setMeasuredValue] = useState<number | null>(null);

  // Nền viewport tối (mặc định) hay sáng
  const [isDarkTheme, setIsDarkTheme] = useState<boolean>(true);

  // Dự án đang chờ xác nhận xóa (thay window.confirm)
  const [projectToDelete, setProjectToDelete] = useState<any | null>(null);

  // Danh sách dự án bản vẽ CAD
  const [projects, setProjects] = useState<any[]>([]);
  const [activeProject, setActiveProject] = useState<any | null>(null);
  const [erpProjects, setErpProjects] = useState<ErpProject[]>([]);
  
  // Tên file bản vẽ đang view hiện tại trong dự án
  const [selectedViewFile, setSelectedViewFile] = useState<string>('');

  // Quản lý Modals và Forms
  const [showCreateProjectModal, setShowCreateProjectModal] = useState<boolean>(false);
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [newProjectLinkErpId, setNewProjectLinkErpId] = useState<string>('');
  
  // Upload file cho dự án đang chọn
  const [filesToUpload, setFilesToUpload] = useState<File[]>([]);
  const [showSelectMainModal, setShowSelectMainModal] = useState<boolean>(false);
  const [selectedMainFileName, setSelectedMainFileName] = useState<string>('');

  // Tải danh sách dự án CAD từ Server và danh sách dự án ERP từ Supabase
  const loadProjects = async () => {
    try {
      const res = await fetch('/api/cad/projects');
      if (res.ok) {
        const data = await res.json();
        setProjects(data);
      }
    } catch (e) {
      console.error('Lỗi khi tải danh sách dự án CAD:', e);
    }
  };

  const loadErpProjects = async () => {
    try {
      const data = await fetchHopDong();
      const mapped: ErpProject[] = (data || []).map(hd => ({
        ProjectID: hd.id,
        ProjectName: hd.ten,
        GroupCode: hd.soHD
      }));
      setErpProjects(mapped);
    } catch (e) {
      console.error('Lỗi khi tải danh sách dự án ERP:', e);
    }
  };

  useEffect(() => {
    loadProjects();
    loadErpProjects();
  }, []);

  // Worker phân tích DXF đang chạy (hủy khi parse file mới hoặc unmount)
  const parseWorkerRef = useRef<Worker | null>(null);
  useEffect(() => {
    return () => {
      parseWorkerRef.current?.terminate();
      parseWorkerRef.current = null;
    };
  }, []);

  // Parse file DXF trong Web Worker — không treo UI với bản vẽ lớn
  const parseAndSetDxf = useCallback((textData: string) => {
    setIsLoading(true);
    setError(null);
    setMeasuredValue(null);
    setHiddenLayers(new Set());

    // Hủy worker cũ nếu người dùng chuyển bản vẽ khi đang parse dở
    parseWorkerRef.current?.terminate();

    try {
      const worker = new Worker(
        new URL('../workers/dxfParser.worker.ts', import.meta.url),
        { type: 'module' }
      );
      parseWorkerRef.current = worker;

      worker.onmessage = (ev: MessageEvent<{ ok: boolean; data?: any; error?: string }>) => {
        const { ok, data, error: parseError } = ev.data || ({} as any);
        if (ok && data?.entities) {
          setDxfData(data);
        } else {
          console.error('Lỗi khi parse file DXF:', parseError);
          setError(parseError || 'Không thể đọc file DXF này. Vui lòng kiểm tra lại định dạng.');
        }
        setIsLoading(false);
        worker.terminate();
        if (parseWorkerRef.current === worker) parseWorkerRef.current = null;
      };

      worker.onerror = () => {
        setError('Lỗi khi phân tích bản vẽ trong nền. Vui lòng thử lại.');
        setIsLoading(false);
        worker.terminate();
        if (parseWorkerRef.current === worker) parseWorkerRef.current = null;
      };

      worker.postMessage(textData);
    } catch (workerErr) {
      // Fallback: môi trường không hỗ trợ Worker → parse đồng bộ như cũ
      console.warn('Web Worker không khả dụng, parse đồng bộ:', workerErr);
      try {
        const parser = new DxfParser();
        const parsed = parser.parseSync(textData);
        if (!parsed || !parsed.entities) {
          throw new Error('Dữ liệu bản vẽ không hợp lệ hoặc bị trống.');
        }
        setDxfData(parsed);
      } catch (err: any) {
        console.error('Lỗi khi parse file DXF:', err);
        setError(err.message || 'Không thể đọc file DXF này. Vui lòng kiểm tra lại định dạng.');
      } finally {
        setIsLoading(false);
      }
    }
  }, []);

  // Đọc file nhị phân thành chuỗi Base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const base64 = (reader.result as string).split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Nạp động một bản vẽ bất kỳ trong dự án
  const loadProjectDrawing = async (projectId: string, fileName: string) => {
    setIsLoading(true);
    setError(null);
    setMeasuredValue(null);
    try {
      const res = await fetch(`/api/cad/projects/${projectId}/view?file=${encodeURIComponent(fileName)}`);
      if (res.ok) {
        const dxfText = await res.text();
        parseAndSetDxf(dxfText);
        setSelectedViewFile(fileName);
      } else {
        const errResult = await res.json().catch(() => ({}));
        throw new Error(errResult.error || 'Lỗi nạp bản vẽ kỹ thuật này.');
      }
    } catch (e: any) {
      setError(e.message);
      setIsLoading(false);
    }
  };

  // Tạo dự án bản vẽ CAD mới
  const handleCreateProject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProjectName.trim()) return;

    const linkedErp = erpProjects.find(p => p.ProjectID === newProjectLinkErpId);

    try {
      const res = await fetch('/api/cad/projects', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newProjectName,
          linkedProjectId: newProjectLinkErpId || null,
          linkedProjectName: linkedErp ? linkedErp.ProjectName : null
        })
      });

      if (res.ok) {
        const newProj = await res.json();
        setProjects(prev => [newProj, ...prev]);
        setActiveProject(newProj);
        setDxfData(null); // Dự án mới chưa có bản vẽ
        setSelectedViewFile('');
        setNewProjectName('');
        setNewProjectLinkErpId('');
        setShowCreateProjectModal(false);
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Không thể tạo dự án bản vẽ.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Mở dự án bản vẽ CAD đã lưu
  const handleOpenProject = async (projId: string) => {
    setIsLoading(true);
    setError(null);
    setMeasuredValue(null);
    setHiddenLayers(new Set());

    try {
      const res = await fetch(`/api/cad/projects/${projId}`);
      if (res.ok) {
        const proj = await res.json();
        setActiveProject(proj);
        
        // Tự động nạp file Layout chính mặc định
        const mainFile = proj.files?.find((f: any) => f.isMain);
        if (mainFile) {
          await loadProjectDrawing(proj.id, mainFile.name);
        } else if (proj.files && proj.files.length > 0) {
          const firstFile = proj.files[0];
          await loadProjectDrawing(proj.id, firstFile.name);
        } else {
          setDxfData(null);
          setSelectedViewFile('');
          setIsLoading(false);
        }
      } else {
        throw new Error('Lỗi tải thông tin chi tiết dự án bản vẽ.');
      }
    } catch (err: any) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  // Yêu cầu xóa dự án → mở modal xác nhận
  const requestDeleteProject = (proj: any, e: React.MouseEvent) => {
    e.stopPropagation();
    setProjectToDelete(proj);
  };

  // Xóa dự án bản vẽ CAD sau khi đã xác nhận trong modal
  const confirmDeleteProject = async () => {
    const proj = projectToDelete;
    if (!proj) return;
    setProjectToDelete(null);

    try {
      const res = await fetch(`/api/cad/projects/${proj.id}`, {
        method: 'DELETE'
      });

      if (res.ok) {
        setProjects(prev => prev.filter(p => p.id !== proj.id));
        if (activeProject && activeProject.id === proj.id) {
          setActiveProject(null);
          setDxfData(null);
          setSelectedViewFile('');
        }
      } else {
        const err = await res.json();
        throw new Error(err.error || 'Xóa dự án thất bại.');
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Gửi nhiều file lên server để convert ghép XREF trực tiếp vào dự án
  const handleUploadProjectFiles = async () => {
    if (!activeProject || filesToUpload.length === 0 || !selectedMainFileName) return;
    
    setShowSelectMainModal(false);
    setIsLoading(true);
    setError(null);
    setMeasuredValue(null);
    setHiddenLayers(new Set());

    try {
      const payload = await Promise.all(
        filesToUpload.map(async (file) => {
          const content = await fileToBase64(file);
          return {
            name: file.name,
            content,
            isMain: file.name === selectedMainFileName
          };
        })
      );

      const response = await fetch(`/api/cad/projects/${activeProject.id}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        const detailRes = await fetch(`/api/cad/projects/${activeProject.id}`);
        if (detailRes.ok) {
          const fullProj = await detailRes.json();
          setActiveProject(fullProj);
          await loadProjectDrawing(fullProj.id, selectedMainFileName);
        }
        loadProjects();
      } else {
        const errResult = await response.json().catch(() => ({}));
        throw new Error(errResult.message || errResult.error || 'Lỗi ghép nối và chuyển đổi các liên kết XREF.');
      }
    } catch (err: any) {
      console.error('Lỗi khi xử lý nhiều file XREF cho dự án:', err);
      setError(err.message || 'Không thể kết nối đến máy chủ.');
      setIsLoading(false);
    }
  };

  // Xử lý khi user chọn file cho dự án đang mở
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files ? Array.from(e.target.files) : [];
    if (selectedFiles.length === 0) return;

    const validFiles = selectedFiles.filter(file => {
      const name = file.name.toLowerCase();
      return name.endsWith('.dwg') || name.endsWith('.dxf');
    });

    if (validFiles.length === 0) {
      setError('Chỉ hỗ trợ tải lên bản vẽ định dạng .dwg hoặc .dxf.');
      return;
    }

    setFilesToUpload(validFiles);
    const suggestedMain = validFiles.find(f => !f.name.toLowerCase().includes('xref')) || validFiles[0];
    setSelectedMainFileName(suggestedMain.name);
    setShowSelectMainModal(true);
  };

  // Trích xuất danh sách Layer từ bản vẽ
  const layerList = useMemo(() => {
    if (!dxfData) return [];
    
    const activeLayers = new Set<string>();
    dxfData.entities.forEach((entity: any) => {
      if (entity.layer) activeLayers.add(entity.layer);
    });

    const layersTable = dxfData.tables?.layer?.layers || {};
    
    return Object.keys(layersTable).map(name => {
      const layer = layersTable[name];
      const rawColor = layer.color !== undefined ? layer.color : layer.colorIndex;
      const hexColor = getHexColorFromDxfColor(rawColor, true);
      
      return {
        name,
        color: hexColor,
        isActive: activeLayers.has(name)
      };
    }).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  }, [dxfData]);

  // Đơn vị bản vẽ hiện tại (đọc từ header DXF)
  const drawingUnits = useMemo(() => getDxfUnits(dxfData), [dxfData]);

  // Bộ lọc tìm kiếm Layer nhanh
  const filteredLayers = useMemo(() => {
    if (!layerSearchQuery.trim()) return layerList;
    const query = layerSearchQuery.toLowerCase();
    return layerList.filter(l => l.name.toLowerCase().includes(query));
  }, [layerList, layerSearchQuery]);

  // Toggle Layer
  const toggleLayer = (layerName: string) => {
    const newHidden = new Set(hiddenLayers);
    if (newHidden.has(layerName)) {
      newHidden.delete(layerName);
    } else {
      newHidden.add(layerName);
    }
    setHiddenLayers(newHidden);
  };

  const toggleAllLayers = (show: boolean) => {
    if (show) {
      setHiddenLayers(new Set());
    } else {
      setHiddenLayers(new Set(layerList.map(l => l.name)));
    }
  };

  return (
    <div className="w-full flex flex-col h-[calc(100vh-140px)] border border-border bg-bg-surface rounded-xl overflow-hidden shadow-2xl relative text-txt-primary">
      
      {/* ── Toolbar phía trên ── */}
      <div className="px-4 py-3 bg-bg-subtle border-b border-border flex flex-wrap items-center justify-between gap-3 text-txt-primary shrink-0">
        <div className="flex items-center gap-3">
          {activeProject ? (
            <button
              onClick={() => {
                setActiveProject(null);
                setDxfData(null);
                setSelectedViewFile('');
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 bg-bg-surface hover:bg-bg-muted rounded-lg text-xs font-semibold border border-border transition-all text-txt-primary"
            >
              <ChevronLeft className="w-4 h-4 text-txt-muted" />
              <span>Dự án bản vẽ</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-primary-400" />
              <span className="text-xs font-black uppercase tracking-wider text-zinc-100">Quản lý bản vẽ dự án CAD</span>
            </div>
          )}

          {activeProject && (
            <div className="flex items-center gap-2 border-l border-border pl-3">
              <span className="text-xs font-bold text-zinc-100">{activeProject.name}</span>
              {activeProject.linkedProjectName && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] text-indigo-300 font-medium">
                  <Link className="w-3 h-3 text-indigo-400" />
                  ERP: {activeProject.linkedProjectName}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          {activeProject && (
            <label className="flex items-center gap-2 px-3 py-1.5 bg-primary-600 hover:bg-primary-500 rounded-lg cursor-pointer text-xs font-bold transition-all shadow-md">
              <Upload className="w-3.5 h-3.5" />
              <span>Tải bản vẽ mới / XREF</span>
              <input 
                type="file" 
                accept=".dxf,.dwg" 
                multiple={true}
                className="hidden" 
                onChange={handleFileChange} 
              />
            </label>
          )}

          {dxfData && (
            <>
              {/* Toggle Panel Layer */}
              <button
                onClick={() => setShowLayerPanel(!showLayerPanel)}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  showLayerPanel
                    ? 'bg-bg-muted border-border text-primary-500 dark:text-primary-400'
                    : 'bg-transparent border-border text-txt-muted hover:border-border-hover hover:text-txt-primary'
                }`}
                title="Danh sách Layer"
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Lớp bản vẽ</span>
              </button>

              {/* Đổi nền viewport sáng/tối */}
              <button
                onClick={() => setIsDarkTheme(v => !v)}
                className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border bg-transparent border-border text-txt-muted hover:border-border-hover hover:text-txt-primary transition-all"
                title={isDarkTheme ? 'Chuyển nền sáng' : 'Chuyển nền tối'}
              >
                {isDarkTheme ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
                <span>{isDarkTheme ? 'Nền sáng' : 'Nền tối'}</span>
              </button>

              {/* Công cụ đo khoảng cách */}
              <button
                onClick={() => {
                  setMeasureMode(measureMode === 'distance' ? 'none' : 'distance');
                  setMeasuredValue(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  measureMode === 'distance'
                    ? 'bg-amber-600 border-amber-500 text-white animate-pulse' 
                    : 'bg-transparent border-border text-txt-muted hover:border-border-hover hover:text-txt-primary'
                }`}
                title="Đo kích thước"
              >
                <Ruler className="w-3.5 h-3.5" />
                <span>Đo khoảng cách</span>
              </button>

              {/* Công cụ đo diện tích */}
              <button
                onClick={() => {
                  setMeasureMode(measureMode === 'area' ? 'none' : 'area');
                  setMeasuredValue(null);
                }}
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-xs font-semibold border transition-all ${
                  measureMode === 'area'
                    ? 'bg-amber-600 border-amber-500 text-white animate-pulse' 
                    : 'bg-transparent border-border text-txt-muted hover:border-border-hover hover:text-txt-primary'
                }`}
                title="Đo diện tích đa giác"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Đo diện tích</span>
              </button>

              {/* Hiển thị kết quả đo (quy đổi theo đơn vị bản vẽ $INSUNITS) */}
              {measuredValue !== null && (
                <div className="bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-lg border border-amber-500/30 text-xs font-mono font-bold animate-fade-in">
                  {measureMode === 'distance'
                    ? `Khoảng cách đo: ${formatDistanceMm(measuredValue * drawingUnits.toMm)}`
                    : `Diện tích đo: ${formatAreaMm2(measuredValue * drawingUnits.toMm * drawingUnits.toMm)}`}
                  {drawingUnits.assumed && <span className="ml-1.5 text-amber-500/70 font-sans font-normal">(giả định đơn vị mm)</span>}
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ── Thân chính: Phân chia cột theo trạng thái ── */}
      <div className="flex-1 flex overflow-hidden relative">
        
        {/* TH1: MÀN HÌNH DANH SÁCH DỰ ÁN CAD */}
        {!activeProject && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-bg-base">
            {/* Sidebar quản lý dự án CAD */}
            <div className="w-full md:w-80 border-r border-border bg-bg-surface flex flex-col shrink-0">
              <div className="p-4 border-b border-border flex items-center justify-between shrink-0">
                <span className="text-xs font-black text-txt-secondary uppercase tracking-wider">Dự án bản vẽ đã lưu</span>
                <button
                  onClick={() => setShowCreateProjectModal(true)}
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-primary-600 hover:bg-primary-500 rounded-lg text-[10px] font-bold text-white transition-all shadow-md"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Tạo dự án</span>
                </button>
              </div>

              {/* List Projects */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2 no-scrollbar">
                {projects.length === 0 ? (
                  <div className="text-center py-8 text-txt-muted text-xs flex flex-col items-center justify-center gap-2">
                    <FolderOpen className="w-8 h-8 text-zinc-700" />
                    <span>Chưa có dự án bản vẽ nào được lưu.</span>
                  </div>
                ) : (
                  projects.map((proj) => (
                    <div
                      key={proj.id}
                      onClick={() => handleOpenProject(proj.id)}
                      className="group p-3 rounded-lg border border-border bg-bg-surface hover:bg-bg-muted hover:border-border-hover cursor-pointer transition-all flex items-start justify-between gap-3 text-txt-primary"
                    >
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-bold text-txt-primary truncate group-hover:text-primary-500 transition-colors">
                          {proj.name}
                        </h4>
                        
                        {proj.linkedProjectName && (
                          <div className="mt-1 flex items-center gap-1 text-[10px] text-indigo-400 font-semibold">
                            <Link className="w-3 h-3 shrink-0" />
                            <span className="truncate">{proj.linkedProjectName}</span>
                          </div>
                        )}

                        <div className="mt-2.5 flex items-center gap-3 text-[9px] text-txt-muted font-mono">
                          <span className="flex items-center gap-1">
                            <FileText className="w-3 h-3 text-txt-placeholder" />
                            {proj.fileCount} tệp
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-txt-placeholder" />
                            {new Date(proj.createdAt).toLocaleDateString('vi-VN')}
                          </span>
                        </div>
                      </div>

                      <button
                        onClick={(e) => requestDeleteProject(proj, e)}
                        className="p-1 text-txt-muted hover:text-red-500 rounded hover:bg-bg-muted transition-colors self-center opacity-0 group-hover:opacity-100"
                        title="Xóa dự án"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Màn hình giới thiệu/hướng dẫn cột phải */}
            <div className="flex-1 flex flex-col items-center justify-center p-6 text-center text-txt-primary bg-bg-base">
              <div className="w-16 h-16 rounded-2xl bg-bg-surface border border-border flex items-center justify-center text-txt-muted shadow-sm mb-4">
                <FileCode className="w-8 h-8 text-primary-500 animate-pulse" />
              </div>
              <h3 className="text-txt-primary font-black text-lg mb-2">Trình xem bản vẽ CAD & Quản lý XREF</h3>
              <p className="text-txt-muted text-xs max-w-sm mb-6 leading-relaxed">
                Tạo dự án bản vẽ mới ở cột bên trái, liên kết với các dự án xây lắp trong phân hệ Quản lý dự án của hệ thống, tải lên file DWG gốc cùng các file XREF tham chiếu phụ để lưu trữ lâu dài.
              </p>

              <button
                onClick={() => setShowCreateProjectModal(true)}
                className="flex items-center gap-2 px-5 py-2.5 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-all shadow-lg"
              >
                <Plus className="w-4 h-4" />
                <span>Tạo dự án bản vẽ ngay</span>
              </button>

              <div className="mt-8 flex items-center gap-2 bg-bg-surface border border-border px-4 py-2 rounded-xl text-[10px] text-txt-muted max-w-xs leading-normal">
                <Info className="w-4 h-4 shrink-0 text-primary-500" />
                <span>Các tệp bản vẽ được convert động sang DXF khi click xem, tự động liên kết các XREF cùng thư mục dự án và lưu cache nhanh.</span>
              </div>
            </div>
          </div>
        )}

        {/* TH2: MÀN HÌNH ĐANG LÀM VIỆC TRONG DỰ ÁN CAD */}
        {activeProject && (
          <>
            {/* Sidebar quản lý file bản vẽ bên trái dự án */}
            <div className="w-64 h-full border-r border-border bg-bg-surface text-txt-primary flex flex-col shrink-0">
              <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
                <span className="text-xs font-black text-white uppercase tracking-wider">Cấu trúc Bản vẽ ({activeProject.files?.length || 0})</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                {(!activeProject.files || activeProject.files.length === 0) ? (
                  <div className="text-center py-8 text-txt-placeholder text-xs flex flex-col items-center justify-center gap-2">
                    <FileCode className="w-8 h-8 text-zinc-800" />
                    <span>Dự án chưa có file nào.</span>
                  </div>
                ) : (
                  activeProject.files.map((file: any) => {
                    const nameLower = file.name.toLowerCase();
                    const isViewable = nameLower.endsWith('.dwg') || nameLower.endsWith('.dxf');
                    const isActive = file.name === selectedViewFile;
                    
                    return (
                      <button
                        key={file.name}
                        disabled={!isViewable}
                        onClick={() => loadProjectDrawing(activeProject.id, file.name)}
                        className={`w-full flex items-start gap-2.5 p-2.5 rounded-lg text-left text-xs font-semibold border transition-all ${
                          isActive
                            ? 'bg-primary-500/10 border-primary-500 text-primary-400 font-bold'
                            : isViewable
                              ? 'bg-transparent border-transparent text-txt-secondary hover:bg-bg-muted hover:text-txt-primary'
                              : 'bg-transparent border-transparent text-txt-placeholder cursor-not-allowed opacity-60'
                        }`}
                      >
                        <FileCode className={`w-4 h-4 shrink-0 mt-0.5 ${isActive ? 'text-primary-400' : isViewable ? 'text-txt-muted' : 'text-zinc-700'}`} />
                        <div className="min-w-0 flex-1">
                          <div className="truncate font-bold" title={file.name}>
                            {file.name}
                          </div>
                          <div className="text-[9px] text-txt-muted font-mono mt-1 flex items-center gap-1.5">
                            <span>{(file.size / 1024).toFixed(1)} KB</span>
                            {file.isMain && <span className="text-amber-500 font-bold font-sans uppercase text-[8px]">[Chính]</span>}
                            {!isViewable && <span className="text-txt-placeholder font-sans uppercase text-[8px]">[XREF]</span>}
                          </div>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Viewport chính vẽ CAD */}
            <div className="flex-1 h-full overflow-hidden bg-zinc-950 relative">
              {dxfData ? (
                <CADCanvas
                  dxfData={dxfData}
                  hiddenLayers={hiddenLayers}
                  measureMode={measureMode}
                  onMeasured={setMeasuredValue}
                  isDarkTheme={isDarkTheme}
                />
              ) : (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center text-txt-primary bg-bg-base">
                  <div className="w-12 h-12 rounded-xl bg-bg-surface border border-border flex items-center justify-center text-txt-muted shadow-sm mb-4">
                    <Upload className="w-6 h-6 animate-bounce" />
                  </div>
                  <h4 className="text-txt-primary font-bold text-sm mb-1">Dự án chưa có bản vẽ</h4>
                  <p className="text-txt-muted text-xs max-w-xs mb-5">
                    Tải lên file bản vẽ CAD Layout chính (.dwg/.dxf) cùng các file XREF đi kèm của dự án này.
                  </p>
                  
                  <label className="flex items-center gap-2 px-4 py-2 bg-primary-600 hover:bg-primary-500 rounded-lg cursor-pointer text-xs font-bold transition-all shadow-md">
                    <Upload className="w-4 h-4" />
                    <span>Tải bản vẽ lên</span>
                    <input 
                      type="file" 
                      accept=".dxf,.dwg" 
                      multiple={true}
                      className="hidden" 
                      onChange={handleFileChange} 
                    />
                  </label>
                </div>
              )}
            </div>

            {/* Sidebar quản lý Layer bên phải */}
            {dxfData && showLayerPanel && (
              <div className="w-60 h-full border-l border-border bg-bg-surface text-txt-primary flex flex-col shrink-0 z-10 animate-slide-in">
                <div className="p-3 border-b border-border flex items-center justify-between shrink-0">
                  <span className="text-xs font-black text-white uppercase tracking-wider">Các lớp ({filteredLayers.length})</span>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => toggleAllLayers(true)} 
                      className="text-[10px] text-primary-400 hover:text-primary-300 font-semibold"
                    >
                      Hiện
                    </button>
                    <span className="text-zinc-700 text-xs">|</span>
                    <button 
                      onClick={() => toggleAllLayers(false)} 
                      className="text-[10px] text-txt-muted hover:text-txt-muted font-semibold"
                    >
                      Ẩn
                    </button>
                  </div>
                </div>

                {/* Thanh tìm kiếm Layer */}
                <div className="p-2 border-b border-border shrink-0">
                  <input
                    type="text"
                    placeholder="Tìm nhanh lớp bản vẽ..."
                    value={layerSearchQuery}
                    onChange={(e) => setLayerSearchQuery(e.target.value)}
                    className="w-full bg-bg-subtle border border-border rounded px-2.5 py-1.5 text-[11px] text-txt-primary placeholder-txt-placeholder focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                <div className="flex-1 overflow-y-auto p-2 space-y-1 no-scrollbar">
                  {filteredLayers.map((layer) => {
                    const isHidden = hiddenLayers.has(layer.name);
                    return (
                      <div
                        key={layer.name}
                        className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                          isHidden 
                            ? 'bg-zinc-950/40 text-txt-placeholder' 
                            : 'hover:bg-zinc-800/60 text-zinc-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span
                            className="w-2.5 h-2.5 rounded-full border border-black/20 shrink-0"
                            style={{
                              backgroundColor: layer.color
                            }}
                          />
                          <span
                            className={`truncate font-semibold ${!layer.isActive ? 'opacity-40 italic' : ''}`}
                            title={layer.isActive ? layer.name : `${layer.name} (không có đối tượng)`}
                          >
                            {layer.name}
                          </span>
                        </div>

                        <button
                          onClick={() => toggleLayer(layer.name)}
                          className={`p-1.5 rounded hover:bg-bg-muted transition-colors ${
                            isHidden ? 'text-txt-placeholder' : 'text-txt-muted hover:text-white'
                          }`}
                          title={isHidden ? 'Hiện layer' : 'Ẩn layer'}
                        >
                          {isHidden ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    );
                  })}
                  {filteredLayers.length === 0 && (
                    <div className="text-center py-6 text-txt-placeholder text-[10px]">
                      Không tìm thấy lớp nào phù hợp.
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}

        {/* Màn hình Loading khi đang parse bản vẽ */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-bg-overlay/80 backdrop-blur-sm z-40 text-txt-primary">
            <div className="w-10 h-10 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-xs text-txt-muted font-semibold">Đang nạp và dựng mô hình bản vẽ CAD...</p>
          </div>
        )}

        {/* Thông báo lỗi */}
        {error && (
          <div className="absolute top-4 left-4 right-4 z-50 bg-red-950/90 border border-red-800 text-red-200 px-4 py-3 rounded-lg flex items-center gap-3 text-xs shadow-xl">
            <AlertTriangle className="w-5 h-5 shrink-0 text-red-500" />
            <div className="flex-1">
              <span className="font-bold">Lỗi:</span> {error}
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-red-400 hover:text-red-200 font-bold px-2 py-1"
            >
              Đóng
            </button>
          </div>
        )}

        {/* MODAL TẠO DỰ ÁN BẢN VẼ MỚI (Lên kết với dự án ERP) */}
        {showCreateProjectModal && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <form onSubmit={handleCreateProject} className="bg-bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-5 text-txt-primary animate-fade-in animate-scale-in">
              <div className="flex items-center gap-2 text-primary-400 mb-4">
                <FolderOpen className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Tạo dự án bản vẽ CAD mới</h3>
              </div>

              <div className="space-y-4 mb-5">
                {/* Tên dự án CAD */}
                <div>
                  <label className="block text-txt-muted text-xs font-semibold mb-1.5">Tên dự án bản vẽ</label>
                  <input 
                    type="text"
                    required
                    placeholder="Ví dụ: Bản vẽ M&E cơ điện..."
                    value={newProjectName}
                    onChange={(e) => setNewProjectName(e.target.value)}
                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-primary-500 transition-colors"
                  />
                </div>

                {/* Liên kết dự án ERP */}
                <div>
                  <label className="block text-txt-muted text-xs font-semibold mb-1.5">
                    Liên kết dự án ERP (Không bắt buộc)
                  </label>
                  <select
                    value={newProjectLinkErpId}
                    onChange={(e) => setNewProjectLinkErpId(e.target.value)}
                    className="w-full bg-bg-subtle border border-border rounded-lg px-3 py-2 text-xs text-txt-primary focus:outline-none focus:border-primary-500 transition-colors"
                  >
                    <option value="">-- Không liên kết --</option>
                    {erpProjects.map(p => (
                      <option key={p.ProjectID} value={p.ProjectID}>
                        [{p.GroupCode}] {p.ProjectName}
                      </option>
                    ))}
                  </select>
                  <span className="block text-[10px] text-txt-muted mt-1">
                    Liên kết giúp hiển thị nhanh thông tin tiến độ dự án từ phân hệ quản lý dự án.
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowCreateProjectModal(false)}
                  className="px-4 py-2 bg-bg-muted hover:bg-bg-subtle text-txt-primary rounded-lg text-xs font-bold transition-all"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  Tạo dự án
                </button>
              </div>
            </form>
          </div>
        )}

        {/* MODAL XÁC NHẬN FILE CHÍNH ĐỂ RENDER BẢN VẼ + XREF */}
        {showSelectMainModal && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-bg-surface border border-border rounded-xl max-w-md w-full shadow-2xl p-5 text-txt-primary animate-fade-in animate-scale-in">
              <div className="flex items-center gap-2.5 text-amber-500 mb-3">
                <Layers className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Xác nhận File bản vẽ chính</h3>
              </div>
              <p className="text-txt-muted text-xs leading-relaxed mb-4">
                Bạn đã chọn tải lên <strong className="text-white">{filesToUpload.length} file</strong> bản vẽ của dự án này. Vui lòng xác định file chính có chứa layout tổng thể cần dựng:
              </p>
              
              <div className="max-h-56 overflow-y-auto border border-border rounded-lg p-2 bg-bg-subtle space-y-1 mb-5 no-scrollbar">
                {activeProject?.mainFileName && (
                  <button
                    onClick={() => setSelectedMainFileName(activeProject.mainFileName)}
                    className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all border mb-2 ${
                      selectedMainFileName === activeProject.mainFileName
                        ? 'bg-indigo-500/10 border-indigo-500 text-indigo-400 font-bold' 
                        : 'bg-bg-muted/30 border-border text-txt-muted hover:bg-bg-muted hover:text-txt-primary'
                    }`}
                  >
                    <span className="truncate pr-4 flex items-center gap-1.5">
                      <Link className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                      <span>Giữ nguyên file chính: {activeProject.mainFileName}</span>
                    </span>
                    {selectedMainFileName === activeProject.mainFileName && <Check className="w-4 h-4 shrink-0 text-indigo-500" />}
                  </button>
                )}

                {filesToUpload.map(f => {
                  const isSelected = f.name === selectedMainFileName;
                  return (
                    <button
                      key={f.name}
                      onClick={() => setSelectedMainFileName(f.name)}
                      className={`w-full flex items-center justify-between p-2.5 rounded-lg text-xs font-semibold transition-all border ${
                        isSelected 
                          ? 'bg-primary-500/10 border-primary-500 text-primary-400 font-bold' 
                          : 'bg-transparent border-transparent text-txt-muted hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span className="truncate pr-4">{f.name}</span>
                      {isSelected && <Check className="w-4 h-4 shrink-0 text-primary-500" />}
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setShowSelectMainModal(false)}
                  className="px-4 py-2 bg-bg-muted hover:bg-bg-subtle text-txt-primary rounded-lg text-xs font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={handleUploadProjectFiles}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                >
                  Đồng ý và hiển thị
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL XÁC NHẬN XÓA DỰ ÁN BẢN VẼ */}
        {projectToDelete && (
          <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-bg-surface border border-border rounded-xl max-w-sm w-full shadow-2xl p-5 text-txt-primary animate-fade-in animate-scale-in">
              <div className="flex items-center gap-2.5 text-red-500 mb-3">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-sm uppercase tracking-wider">Xóa dự án bản vẽ</h3>
              </div>
              <p className="text-txt-muted text-xs leading-relaxed mb-5">
                Bạn có chắc chắn muốn xóa dự án <strong className="text-white">"{projectToDelete.name}"</strong>?
                Toàn bộ {projectToDelete.fileCount ?? projectToDelete.files?.length ?? 0} tệp bản vẽ và cache lưu trữ sẽ bị xóa <strong className="text-red-400">vĩnh viễn</strong> khỏi máy chủ.
              </p>
              <div className="flex items-center justify-end gap-3">
                <button
                  onClick={() => setProjectToDelete(null)}
                  className="px-4 py-2 bg-bg-muted hover:bg-bg-subtle text-txt-primary rounded-lg text-xs font-bold transition-all"
                >
                  Hủy bỏ
                </button>
                <button
                  onClick={confirmDeleteProject}
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Xóa vĩnh viễn
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
