import React, { useRef, useEffect, useState, useMemo, useCallback } from 'react';
import { useCADViewport } from '../hooks/useCADViewport';
import { CoordinateTransform, Point2D } from '../utils/coordinateTransform';
import { renderDXF } from '../utils/dxfRenderer';
import { DxfQuadtree, getEntityBounds, getDrawingBounds } from '../utils/dxfQuadtree';
import { getDxfUnits, formatDistanceMm, formatAreaMm2 } from '../utils/dxfUnits';
import { findSnapPoint, SnapResult } from '../utils/snapEngine';
import { Ruler, Maximize2, Move, Focus, Camera, Magnet, Eraser } from 'lucide-react';

// Phép đo đã hoàn tất, được ghim lại trên bản vẽ
interface CompletedMeasure {
  id: number;
  type: 'distance' | 'area';
  points: Point2D[];
  value: number;      // khoảng cách hoặc diện tích (đơn vị bản vẽ)
  perimeter?: number; // chu vi (chỉ với area)
}

interface CADCanvasProps {
  dxfData: any;
  hiddenLayers: Set<string>;
  measureMode: 'none' | 'distance' | 'area';
  onMeasured?: (value: number | null) => void;
  isDarkTheme?: boolean;
}

/**
 * Canvas hiển thị bản vẽ CAD — kiến trúc 2 lớp:
 *  - Lớp nền (base): bản vẽ + lưới, chỉ vẽ lại khi pan/zoom/layer/data đổi.
 *  - Lớp phủ (overlay): đo đạc, snap, đường gióng — vẽ lại theo mousemove (rAF)
 *    mà KHÔNG re-render React và không vẽ lại bản vẽ.
 */
export const CADCanvas: React.FC<CADCanvasProps> = ({
  dxfData,
  hiddenLayers,
  measureMode,
  onMeasured,
  isDarkTheme = true
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const baseCanvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Điểm đo khoảng cách
  const [measurePoint1, setMeasurePoint1] = useState<Point2D | null>(null);

  // Điểm đo diện tích đa giác
  const [areaPoints, setAreaPoints] = useState<Point2D[]>([]);

  // Các phép đo đã hoàn tất (ghim trên bản vẽ đến khi xóa)
  const [completedMeasures, setCompletedMeasures] = useState<CompletedMeasure[]>([]);
  const measureIdRef = useRef(0);

  // Bật/tắt bắt điểm (Object Snap)
  const [snapEnabled, setSnapEnabled] = useState<boolean>(true);

  // Trạng thái cảm ứng (1 ngón pan, 2 ngón pinch-zoom)
  const touchStateRef = useRef<{
    mode: 'none' | 'pan' | 'pinch';
    startDist: number;
    startZoom: number;
    startPan: Point2D;
    lastMid: Point2D;
    startTouch: Point2D;
  }>({ mode: 'none', startDist: 0, startZoom: 1, startPan: { x: 0, y: 0 }, lastMid: { x: 0, y: 0 }, startTouch: { x: 0, y: 0 } });

  // Hover + snap giữ trong ref (không setState mỗi mousemove — tránh re-render)
  const hoverRef = useRef<Point2D | null>(null);
  const snapRef = useRef<SnapResult | null>(null);
  const overlayRafRef = useRef<number | null>(null);

  // Readout tọa độ cập nhật DOM trực tiếp
  const coordSpanRef = useRef<HTMLSpanElement>(null);
  const snapSpanRef = useRef<HTMLSpanElement>(null);

  // Tính toán Bounding Box của bản vẽ CAD để căn giữa
  // (bao gồm cả CIRCLE/ARC bán kính, INSERT/block khai triển, ELLIPSE, SPLINE...)
  const boundingBox = useMemo(() => {
    const b = getDrawingBounds(dxfData);
    if (!b) {
      return { minX: 0, maxX: 100, minY: 0, maxY: 100, width: 100, height: 100, centerX: 50, centerY: 50 };
    }

    const w = b.maxX - b.minX;
    const h = b.maxY - b.minY;

    return {
      ...b,
      width: w || 1,
      height: h || 1,
      centerX: b.minX + w / 2,
      centerY: b.minY + h / 2
    };
  }, [dxfData]);

  // Đơn vị bản vẽ (từ header $INSUNITS, mặc định mm)
  const unitInfo = useMemo(() => getDxfUnits(dxfData), [dxfData]);

  // Thiết lập các điểm tâm
  const centerScreen = useMemo(() => ({
    x: dimensions.width / 2,
    y: dimensions.height / 2
  }), [dimensions]);

  const centerCAD = useMemo(() => ({
    x: boundingBox.centerX,
    y: boundingBox.centerY
  }), [boundingBox]);

  // Tỷ lệ phóng mặc định để fit màn hình
  const initialZoom = useMemo(() => {
    const scaleX = (dimensions.width * 0.85) / boundingBox.width;
    const scaleY = (dimensions.height * 0.85) / boundingBox.height;
    return Math.min(scaleX, scaleY, 100);
  }, [boundingBox, dimensions]);

  // Theo dõi sự kiện resize container
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      if (!entries || entries.length === 0) return;
      const { width, height } = entries[0].contentRect;
      setDimensions({
        width: Math.max(width, 100),
        height: Math.max(height, 100)
      });
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Hook quản lý viewport (pan/zoom)
  const {
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    handleWheel,
    handleMouseDown: viewportMouseDown,
    handleMouseMove: viewportMouseMove,
    handleMouseUp: viewportMouseUp,
    resetViewport,
    applyViewport
  } = useCADViewport({
    initialZoom,
    minZoom: initialZoom * 0.01,
    maxZoom: initialZoom * 300,
    centerScreen,
    centerCAD
  });

  // Tự động fit view khi tải bản vẽ mới lên
  useEffect(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
    setMeasurePoint1(null);
    setAreaPoints([]);
    setCompletedMeasures([]);
    hoverRef.current = null;
    snapRef.current = null;
  }, [dxfData, initialZoom, setZoom, setPan]);

  // Reset điểm đo khi chuyển đổi chế độ đo
  useEffect(() => {
    setMeasurePoint1(null);
    setAreaPoints([]);
    snapRef.current = null;
    if (onMeasured) onMeasured(null);
  }, [measureMode, onMeasured]);

  // Phím ESC để hủy nhanh thao tác đo đạc đang thực hiện dở dang
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMeasurePoint1(null);
        setAreaPoints([]);
        snapRef.current = null;
        if (onMeasured) onMeasured(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onMeasured]);

  // Tạo đối tượng chuyển đổi tọa độ hiện tại
  const transform = useMemo(() => {
    return new CoordinateTransform(centerCAD, centerScreen, zoom, pan.x, pan.y);
  }, [centerCAD, centerScreen, zoom, pan]);

  // Khởi dựng Quadtree khi dxfData thay đổi
  const quadtree = useMemo(() => {
    if (!dxfData || !dxfData.entities || dxfData.entities.length === 0) return null;

    const tree = new DxfQuadtree({
      minX: boundingBox.minX,
      maxX: boundingBox.maxX,
      minY: boundingBox.minY,
      maxY: boundingBox.maxY
    });

    const blocks = dxfData.blocks || {};
    dxfData.entities.forEach((entity: any, index: number) => {
      tree.insert({
        id: String(index),
        entity,
        bounds: getEntityBounds(entity, blocks)
      });
    });

    return tree;
  }, [dxfData, boundingBox]);

  // Tính toán Viewport Bounds dạng tọa độ CAD để truy vấn Quadtree
  const viewportCadBounds = useMemo(() => {
    const p1 = transform.screenToCad(0, 0);
    const p2 = transform.screenToCad(dimensions.width, dimensions.height);
    return {
      minX: Math.min(p1.x, p2.x),
      maxX: Math.max(p1.x, p2.x),
      minY: Math.min(p1.y, p2.y),
      maxY: Math.max(p1.y, p2.y)
    };
  }, [transform, dimensions]);

  // Các thực thể CAD nằm trong Viewport hiện tại (Frustum Culling)
  const visibleEntities = useMemo(() => {
    if (!quadtree) return dxfData?.entities || [];
    return quadtree.query(viewportCadBounds);
  }, [quadtree, viewportCadBounds, dxfData]);

  // Lọc bớt chữ và hatch khi kéo thả (LOD) để giữ 60 FPS
  const dataToRender = useMemo(() => {
    const entities = isDragging
      ? visibleEntities.filter((e: any) => e.type !== 'TEXT' && e.type !== 'MTEXT' && e.type !== 'HATCH')
      : visibleEntities;
    return { ...dxfData, entities };
  }, [dxfData, visibleEntities, isDragging]);

  // Tính diện tích đa giác khép kín bằng công thức Shoelace
  const calculatePolygonArea = (points: Point2D[]): number => {
    let area = 0;
    const n = points.length;
    if (n < 3) return 0;

    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      area += points[i].x * points[j].y;
      area -= points[j].x * points[i].y;
    }
    return Math.abs(area) / 2;
  };

  // Tính chu vi đa giác
  const calculatePolygonPerimeter = (points: Point2D[]): number => {
    let perimeter = 0;
    const n = points.length;
    if (n < 2) return 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n;
      const dx = points[j].x - points[i].x;
      const dy = points[j].y - points[i].y;
      perimeter += Math.sqrt(dx * dx + dy * dy);
    }
    return perimeter;
  };

  // Hoàn tất đo diện tích đa giác → ghim phép đo lên bản vẽ
  const finishAreaCalculation = useCallback(() => {
    if (areaPoints.length < 3) return;
    const areaVal = calculatePolygonArea(areaPoints);
    const perimVal = calculatePolygonPerimeter(areaPoints);
    setCompletedMeasures(prev => [
      ...prev,
      { id: ++measureIdRef.current, type: 'area', points: [...areaPoints], value: areaVal, perimeter: perimVal }
    ]);
    setAreaPoints([]);
    if (onMeasured) onMeasured(areaVal);
  }, [areaPoints, onMeasured]);

  // Chuẩn bị canvas theo devicePixelRatio → nét sắc trên màn hình HiDPI
  const setupCanvas = (canvas: HTMLCanvasElement): CanvasRenderingContext2D | null => {
    const dpr = window.devicePixelRatio || 1;
    const w = Math.round(dimensions.width * dpr);
    const h = Math.round(dimensions.height * dpr);
    if (canvas.width !== w) canvas.width = w;
    if (canvas.height !== h) canvas.height = h;

    const ctx = canvas.getContext('2d');
    if (!ctx) return null;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, dimensions.width, dimensions.height);
    return ctx;
  };

  // Làm tròn về bước "đẹp" 1/2/5×10^n cho lưới
  const niceStep = (raw: number): number => {
    const pow = Math.pow(10, Math.floor(Math.log10(raw)));
    const frac = raw / pow;
    if (frac <= 1) return pow;
    if (frac <= 2) return 2 * pow;
    if (frac <= 5) return 5 * pow;
    return 10 * pow;
  };

  // Vẽ lưới ô vuông theo tọa độ CAD (bước lưới tự chọn theo mức zoom)
  const drawGrid = (ctx: CanvasRenderingContext2D) => {
    ctx.strokeStyle = isDarkTheme ? '#27272A' : '#E4E4E7';
    ctx.lineWidth = 0.5;

    const targetPx = 80; // Khoảng cách lưới mong muốn trên màn hình
    const cadStep = niceStep(targetPx / zoom);

    const b = viewportCadBounds;
    ctx.beginPath();

    const startX = Math.ceil(b.minX / cadStep) * cadStep;
    for (let x = startX; x <= b.maxX; x += cadStep) {
      const sp = transform.cadToScreen(x, 0);
      ctx.moveTo(sp.x, 0);
      ctx.lineTo(sp.x, dimensions.height);
    }

    const startY = Math.ceil(b.minY / cadStep) * cadStep;
    for (let y = startY; y <= b.maxY; y += cadStep) {
      const sp = transform.cadToScreen(0, y);
      ctx.moveTo(0, sp.y);
      ctx.lineTo(dimensions.width, sp.y);
    }
    ctx.stroke();
  };

  // ── LỚP NỀN: bản vẽ + lưới ──
  const drawBase = useCallback(() => {
    const canvas = baseCanvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    ctx.fillStyle = isDarkTheme ? '#18181B' : '#F4F4F5'; // zinc-900 hoặc zinc-100
    ctx.fillRect(0, 0, dimensions.width, dimensions.height);

    drawGrid(ctx);
    renderDXF(ctx, dataToRender, transform, hiddenLayers, isDarkTheme);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, transform, dataToRender, hiddenLayers, isDarkTheme, zoom, viewportCadBounds]);

  // Vẽ biểu tượng Object Snapping
  const drawSnapIndicator = (ctx: CanvasRenderingContext2D, snap: SnapResult) => {
    const screenPt = transform.cadToScreen(snap.x, snap.y);
    ctx.strokeStyle = '#22c55e'; // Xanh lá cây tươi sáng chuẩn AutoCAD
    ctx.lineWidth = 2;
    const size = 6;

    ctx.beginPath();
    if (snap.type === 'endpoint') {
      ctx.rect(screenPt.x - size, screenPt.y - size, size * 2, size * 2);
    }
    else if (snap.type === 'midpoint') {
      ctx.moveTo(screenPt.x, screenPt.y - size);
      ctx.lineTo(screenPt.x - size, screenPt.y + size);
      ctx.lineTo(screenPt.x + size, screenPt.y + size);
      ctx.closePath();
    }
    else if (snap.type === 'center') {
      ctx.arc(screenPt.x, screenPt.y, size, 0, 2 * Math.PI);
      ctx.moveTo(screenPt.x - 2, screenPt.y);
      ctx.lineTo(screenPt.x + 2, screenPt.y);
      ctx.moveTo(screenPt.x, screenPt.y - 2);
      ctx.lineTo(screenPt.x, screenPt.y + 2);
    }
    else if (snap.type === 'intersection') {
      ctx.moveTo(screenPt.x - size, screenPt.y - size);
      ctx.lineTo(screenPt.x + size, screenPt.y + size);
      ctx.moveTo(screenPt.x + size, screenPt.y - size);
      ctx.lineTo(screenPt.x - size, screenPt.y + size);
    }
    else if (snap.type === 'insertion') {
      // Điểm chèn block: hình vuông + dấu chéo bên trong
      ctx.rect(screenPt.x - size, screenPt.y - size, size * 2, size * 2);
      ctx.moveTo(screenPt.x - size, screenPt.y - size);
      ctx.lineTo(screenPt.x + size, screenPt.y + size);
    }
    ctx.stroke();
  };

  // Màu phép đo: đang thao tác = hổ phách; đã ghim = xanh dương nhạt
  const measureColor = (pinned: boolean) => (pinned ? '#38BDF8' : '#F59E0B');

  // Vẽ một phép đo khoảng cách (đang kéo hoặc đã ghim)
  const drawDistanceMeasure = (ctx: CanvasRenderingContext2D, pA: Point2D, pB: Point2D, pinned: boolean) => {
    const p1 = transform.cadToScreen(pA.x, pA.y);
    const p2 = transform.cadToScreen(pB.x, pB.y);
    const color = measureColor(pinned);

    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(pinned ? [] : [6, 4]);
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p2.x, p2.y);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(p1.x, p1.y, 4, 0, 2 * Math.PI);
    ctx.arc(p2.x, p2.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    const dx = pB.x - pA.x;
    const dy = pB.y - pA.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const text = formatDistanceMm(distance * unitInfo.toMm);
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = pinned ? color : (isDarkTheme ? '#F59E0B' : '#B45309');
    const textX = (p1.x + p2.x) / 2 + 10;
    const textY = (p1.y + p2.y) / 2 - 10;
    ctx.fillText(text, textX, textY);
  };

  // Vẽ một phép đo diện tích (đang vẽ dở với hover, hoặc đã ghim khép kín)
  const drawAreaMeasure = (
    ctx: CanvasRenderingContext2D,
    points: Point2D[],
    pinned: boolean,
    withHover: boolean
  ) => {
    if (points.length === 0) return;
    const color = measureColor(pinned);
    const hoverCadPoint = hoverRef.current;

    ctx.beginPath();
    const pStart = transform.cadToScreen(points[0].x, points[0].y);
    ctx.moveTo(pStart.x, pStart.y);

    for (let i = 1; i < points.length; i++) {
      const p = transform.cadToScreen(points[i].x, points[i].y);
      ctx.lineTo(p.x, p.y);
    }

    // Nối với vị trí chuột hover khi đang vẽ dở
    if (withHover && hoverCadPoint) {
      const pHover = transform.cadToScreen(hoverCadPoint.x, hoverCadPoint.y);
      ctx.lineTo(pHover.x, pHover.y);
    }

    ctx.closePath();

    // 1. Tô màu nền mờ đa giác
    ctx.fillStyle = pinned
      ? 'rgba(56, 189, 248, 0.10)'
      : (isDarkTheme ? 'rgba(245, 158, 11, 0.12)' : 'rgba(217, 119, 6, 0.12)');
    ctx.fill();

    // 2. Vẽ nét viền
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash(pinned ? [] : [5, 4]);
    ctx.stroke();
    ctx.setLineDash([]);

    // 3. Vẽ dấu chấm các mốc đỉnh
    points.forEach((pt) => {
      const pScr = transform.cadToScreen(pt.x, pt.y);
      ctx.beginPath();
      ctx.arc(pScr.x, pScr.y, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = '#FFFFFF';
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // 4. Tính toán và hiển thị Text đo đạc tại centroid đa giác
    if (points.length >= 3) {
      let cx = 0, cy = 0;
      points.forEach(p => { cx += p.x; cy += p.y; });
      cx /= points.length;
      cy /= points.length;

      const screenCenter = transform.cadToScreen(cx, cy);
      const areaVal = calculatePolygonArea(points);
      const perimVal = calculatePolygonPerimeter(points);

      const text = `S: ${formatAreaMm2(areaVal * unitInfo.toMm * unitInfo.toMm)} | P: ${formatDistanceMm(perimVal * unitInfo.toMm)}`;
      ctx.font = 'bold 11px monospace';
      const textWidth = ctx.measureText(text).width;

      // Hộp bao text
      ctx.fillStyle = 'rgba(24, 24, 27, 0.85)';
      ctx.fillRect(screenCenter.x - textWidth / 2 - 6, screenCenter.y - 10, textWidth + 12, 20);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.strokeRect(screenCenter.x - textWidth / 2 - 6, screenCenter.y - 10, textWidth + 12, 20);

      // Điền chữ
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(text, screenCenter.x, screenCenter.y);
      ctx.textAlign = 'left';
      ctx.textBaseline = 'alphabetic';
    }
  };

  // ── LỚP PHỦ: các phép đo đã ghim + phép đo đang thao tác + chỉ báo snap ──
  const drawOverlay = useCallback(() => {
    const canvas = overlayCanvasRef.current;
    if (!canvas) return;
    const ctx = setupCanvas(canvas);
    if (!ctx) return;

    // Các phép đo đã ghim (luôn hiển thị)
    completedMeasures.forEach(mea => {
      if (mea.type === 'distance' && mea.points.length === 2) {
        drawDistanceMeasure(ctx, mea.points[0], mea.points[1], true);
      } else if (mea.type === 'area') {
        drawAreaMeasure(ctx, mea.points, true, false);
      }
    });

    // Phép đo đang thao tác dở
    if (measureMode === 'distance' && measurePoint1 && hoverRef.current) {
      drawDistanceMeasure(ctx, measurePoint1, hoverRef.current, false);
    } else if (measureMode === 'area' && areaPoints.length > 0) {
      drawAreaMeasure(ctx, areaPoints, false, true);
    }

    if (measureMode !== 'none' && snapRef.current) {
      drawSnapIndicator(ctx, snapRef.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dimensions, transform, measureMode, measurePoint1, areaPoints, completedMeasures, isDarkTheme, unitInfo]);

  // Giữ ref đến hàm vẽ overlay mới nhất để rAF từ mousemove luôn gọi bản đúng
  const drawOverlayRef = useRef(drawOverlay);
  drawOverlayRef.current = drawOverlay;

  // Lên lịch vẽ overlay theo requestAnimationFrame (gộp nhiều mousemove/frame)
  const scheduleOverlayDraw = useCallback(() => {
    if (overlayRafRef.current !== null) return;
    overlayRafRef.current = requestAnimationFrame(() => {
      overlayRafRef.current = null;
      drawOverlayRef.current();
    });
  }, []);

  useEffect(() => {
    return () => {
      if (overlayRafRef.current !== null) cancelAnimationFrame(overlayRafRef.current);
    };
  }, []);

  // Vẽ lại lớp nền khi dữ liệu/viewport thay đổi
  useEffect(() => {
    drawBase();
  }, [drawBase]);

  // Vẽ lại lớp phủ khi trạng thái đo/viewport thay đổi
  useEffect(() => {
    drawOverlay();
  }, [drawOverlay]);

  // Click chọn điểm đo đạc
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (measureMode === 'none') return;

    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Ưu tiên lấy điểm snap đang bắt dính
    const activeSnap = snapRef.current;
    const cadPt = activeSnap ? { x: activeSnap.x, y: activeSnap.y } : transform.screenToCad(mouseX, mouseY);

    if (measureMode === 'distance') {
      if (!measurePoint1) {
        setMeasurePoint1(cadPt);
        if (onMeasured) onMeasured(null);
      } else {
        const dx = cadPt.x - measurePoint1.x;
        const dy = cadPt.y - measurePoint1.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        // Ghim phép đo khoảng cách lên bản vẽ
        setCompletedMeasures(prev => [
          ...prev,
          { id: ++measureIdRef.current, type: 'distance', points: [measurePoint1, cadPt], value: dist }
        ]);
        if (onMeasured) onMeasured(dist);
        setMeasurePoint1(null);
      }
    }
    else if (measureMode === 'area') {
      // Nhấp chuột vào gần điểm đầu tiên (khoảng cách trên màn hình < 15px) thì tự động đóng đa giác
      if (areaPoints.length >= 3) {
        const firstScr = transform.cadToScreen(areaPoints[0].x, areaPoints[0].y);
        const mouseScrDist = Math.sqrt((mouseX - firstScr.x) ** 2 + (mouseY - firstScr.y) ** 2);
        if (mouseScrDist < 15) {
          finishAreaCalculation();
          return;
        }
      }
      setAreaPoints(prev => [...prev, cadPt]);
    }
  };

  // Chuột phải để hoàn tất đo diện tích đa giác
  const handleCanvasContextMenu = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (measureMode === 'area') {
      e.preventDefault();
      if (areaPoints.length >= 3) {
        finishAreaCalculation();
      }
    }
  };

  // ── CẢM ỨNG: 1 ngón = pan, 2 ngón = pinch-zoom ──
  const touchMidpoint = (touches: React.TouchList, rect: DOMRect): Point2D => ({
    x: (touches[0].clientX + touches[1].clientX) / 2 - rect.left,
    y: (touches[0].clientY + touches[1].clientY) / 2 - rect.top
  });
  const touchDistance = (touches: React.TouchList): number => {
    const dx = touches[0].clientX - touches[1].clientX;
    const dy = touches[0].clientY - touches[1].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ts = touchStateRef.current;
    if (e.touches.length === 2) {
      ts.mode = 'pinch';
      ts.startDist = touchDistance(e.touches);
      ts.startZoom = zoom;
      ts.startPan = { ...pan };
      ts.lastMid = touchMidpoint(e.touches, rect);
    } else if (e.touches.length === 1) {
      ts.mode = 'pan';
      ts.startPan = { ...pan };
      ts.startTouch = { x: e.touches[0].clientX, y: e.touches[0].clientY };
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const ts = touchStateRef.current;

    if (ts.mode === 'pinch' && e.touches.length === 2) {
      e.preventDefault();
      const dist = touchDistance(e.touches);
      const mid = touchMidpoint(e.touches, rect);
      const ratio = dist / (ts.startDist || 1);
      const nextZoom = ts.startZoom * ratio;

      // Giữ tâm pinch cố định khi zoom + cho phép kéo 2 ngón để pan
      const nextPanX = mid.x - centerScreen.x - (nextZoom / ts.startZoom) * (ts.lastMid.x - centerScreen.x - ts.startPan.x);
      const nextPanY = mid.y - centerScreen.y - (nextZoom / ts.startZoom) * (ts.lastMid.y - centerScreen.y - ts.startPan.y);
      applyViewport(nextZoom, { x: nextPanX, y: nextPanY });
    } else if (ts.mode === 'pan' && e.touches.length === 1) {
      e.preventDefault();
      const dx = e.touches[0].clientX - ts.startTouch.x;
      const dy = e.touches[0].clientY - ts.startTouch.y;
      applyViewport(zoom, { x: ts.startPan.x + dx, y: ts.startPan.y + dy });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (e.touches.length === 0) touchStateRef.current.mode = 'none';
  };

  // Xuất ảnh PNG vùng đang xem (ghép lớp nền + lớp phủ)
  const exportPng = useCallback(() => {
    const base = baseCanvasRef.current;
    const overlay = overlayCanvasRef.current;
    if (!base) return;

    const out = document.createElement('canvas');
    out.width = base.width;
    out.height = base.height;
    const ctx = out.getContext('2d');
    if (!ctx) return;
    ctx.drawImage(base, 0, 0);
    if (overlay) ctx.drawImage(overlay, 0, 0);

    out.toBlob((blob) => {
      if (!blob) return;
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ban-ve-cad-${Date.now()}.png`;
      a.click();
      URL.revokeObjectURL(url);
    }, 'image/png');
  }, []);

  const zoomPercent = Math.round((zoom / initialZoom) * 100);

  // Di chuyển chuột: cập nhật hover/snap qua ref + vẽ overlay (không re-render React)
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    let cadPt = transform.screenToCad(mouseX, mouseY);

    if (measureMode !== 'none' && !isDragging && snapEnabled) {
      // 12 pixel bán kính snapping trên màn hình quy đổi sang CAD
      const toleranceCad = 12 / zoom;

      // Chỉ xét các entity trong ô nhỏ quanh con trỏ (quadtree) thay vì cả viewport
      const searchBox = {
        minX: cadPt.x - toleranceCad * 4,
        maxX: cadPt.x + toleranceCad * 4,
        minY: cadPt.y - toleranceCad * 4,
        maxY: cadPt.y + toleranceCad * 4
      };
      const nearbyEntities = quadtree ? quadtree.query(searchBox) : visibleEntities;
      const snapPt = findSnapPoint(cadPt, nearbyEntities, toleranceCad);

      if (snapPt) {
        cadPt = { x: snapPt.x, y: snapPt.y };
        snapRef.current = snapPt;
      } else {
        snapRef.current = null;
      }
    } else {
      snapRef.current = null;
    }

    hoverRef.current = cadPt;

    // Cập nhật readout tọa độ trực tiếp vào DOM
    if (coordSpanRef.current) {
      coordSpanRef.current.textContent = `X: ${cadPt.x.toFixed(2)} | Y: ${cadPt.y.toFixed(2)}`;
    }
    if (snapSpanRef.current) {
      const snap = snapRef.current;
      snapSpanRef.current.textContent = snap ? `[Snap: ${snap.type}]` : '';
    }

    scheduleOverlayDraw();
    viewportMouseMove(e);
  };

  return (
    <div className="relative w-full h-full flex flex-col" ref={containerRef}>
      <div className="absolute top-3 left-3 z-10 flex flex-col gap-2 pointer-events-none select-none">
        <div className="bg-zinc-900/90 text-zinc-100 backdrop-blur-md px-3 py-1.5 rounded-lg border border-zinc-700 text-xs flex items-center gap-2 shadow-lg">
          <Move className="w-3.5 h-3.5 text-zinc-400" />
          <span>Giữ chuột trái/giữa & rê để Di chuyển | Lăn chuột để Phóng to/Thu nhỏ</span>
        </div>

        {measureMode === 'distance' && (
          <div className="bg-amber-600/95 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-lg border border-amber-500">
            <Ruler className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {!measurePoint1
                ? 'Chọn điểm thứ nhất để đo khoảng cách...'
                : 'Di chuyển chuột và chọn điểm thứ hai để kết thúc...'}
            </span>
          </div>
        )}

        {measureMode === 'area' && (
          <div className="bg-amber-600/95 text-white backdrop-blur-md px-3 py-1.5 rounded-lg text-xs flex items-center gap-2 shadow-lg border border-amber-500">
            <Maximize2 className="w-3.5 h-3.5 animate-pulse" />
            <span>
              {areaPoints.length === 0
                ? 'Chọn điểm đầu tiên để đo diện tích đa giác...'
                : `Đã chọn ${areaPoints.length} điểm. Click chuột phải hoặc nhấp điểm đầu để đóng kín đa giác (ESC để hủy).`}
            </span>
          </div>
        )}
      </div>

      {/* Toolbar viewport góc phải trên: Zoom Fit, %, snap, nền, xuất PNG */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1.5">
        <div className="bg-zinc-900/90 text-zinc-300 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-zinc-700 text-[11px] font-mono shadow-lg min-w-[52px] text-center">
          {zoomPercent}%
        </div>
        <button
          onClick={resetViewport}
          title="Fit toàn bộ bản vẽ vào màn hình"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md p-2 rounded-lg border border-zinc-700 transition-all shadow-lg"
        >
          <Focus className="w-4 h-4" />
        </button>
        <button
          onClick={() => setSnapEnabled(v => !v)}
          title={snapEnabled ? 'Tắt bắt điểm (Object Snap)' : 'Bật bắt điểm (Object Snap)'}
          className={`backdrop-blur-md p-2 rounded-lg border transition-all shadow-lg ${
            snapEnabled
              ? 'bg-green-600/90 hover:bg-green-500 text-white border-green-500'
              : 'bg-zinc-900/90 hover:bg-zinc-800 text-zinc-400 border-zinc-700'
          }`}
        >
          <Magnet className="w-4 h-4" />
        </button>
        <button
          onClick={exportPng}
          title="Xuất ảnh PNG vùng đang xem"
          className="bg-zinc-900/90 hover:bg-zinc-800 text-zinc-300 hover:text-white backdrop-blur-md p-2 rounded-lg border border-zinc-700 transition-all shadow-lg"
        >
          <Camera className="w-4 h-4" />
        </button>
      </div>

      {/* Bảng danh sách các phép đo đã ghim */}
      {completedMeasures.length > 0 && (
        <div className="absolute bottom-3 right-3 z-10 w-64 max-h-56 flex flex-col bg-zinc-900/95 backdrop-blur-md rounded-lg border border-zinc-700 shadow-xl overflow-hidden">
          <div className="flex items-center justify-between px-3 py-2 border-b border-zinc-800 shrink-0">
            <span className="text-[11px] font-black text-sky-400 uppercase tracking-wider">
              Kết quả đo ({completedMeasures.length})
            </span>
            <button
              onClick={() => setCompletedMeasures([])}
              title="Xóa tất cả phép đo"
              className="flex items-center gap-1 text-[10px] text-zinc-400 hover:text-red-400 font-semibold transition-colors"
            >
              <Eraser className="w-3 h-3" /> Xóa hết
            </button>
          </div>
          <div className="flex-1 overflow-y-auto no-scrollbar p-1.5 space-y-1">
            {completedMeasures.map((mea, idx) => (
              <div
                key={mea.id}
                className="group flex items-center justify-between gap-2 px-2 py-1.5 rounded-md hover:bg-zinc-800/60 text-[11px]"
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {mea.type === 'distance'
                    ? <Ruler className="w-3 h-3 text-sky-400 shrink-0" />
                    : <Maximize2 className="w-3 h-3 text-sky-400 shrink-0" />}
                  <span className="text-zinc-500 shrink-0">#{idx + 1}</span>
                  <span className="text-zinc-200 font-mono font-bold truncate">
                    {mea.type === 'distance'
                      ? formatDistanceMm(mea.value * unitInfo.toMm)
                      : formatAreaMm2(mea.value * unitInfo.toMm * unitInfo.toMm)}
                  </span>
                </div>
                <button
                  onClick={() => setCompletedMeasures(prev => prev.filter(m => m.id !== mea.id))}
                  title="Xóa phép đo này"
                  className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-all shrink-0"
                >
                  <Eraser className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Readout tọa độ + snap: cập nhật DOM trực tiếp, không re-render React */}
      <div className="absolute bottom-3 left-3 z-10 bg-zinc-900/95 text-zinc-300 backdrop-blur-md px-2.5 py-1 rounded-md border border-zinc-800 text-[10px] font-mono pointer-events-none shadow-md flex gap-2">
        <span ref={coordSpanRef}>X: — | Y: —</span>
        <span ref={snapSpanRef} className="text-green-400 font-bold uppercase" />
        <span className="text-zinc-500">[{unitInfo.label}]</span>
      </div>

      {/* Lớp nền: bản vẽ + lưới */}
      <canvas
        ref={baseCanvasRef}
        className="absolute inset-0 w-full h-full block"
      />

      {/* Lớp phủ: đo đạc + snap, nhận toàn bộ sự kiện chuột + cảm ứng */}
      <canvas
        ref={overlayCanvasRef}
        onMouseDown={viewportMouseDown}
        onMouseMove={handleCanvasMouseMove}
        onMouseUp={viewportMouseUp}
        onWheel={handleWheel}
        onClick={handleCanvasClick}
        onContextMenu={handleCanvasContextMenu}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        className="absolute inset-0 w-full h-full block cursor-crosshair outline-none touch-none"
      />
    </div>
  );
};
