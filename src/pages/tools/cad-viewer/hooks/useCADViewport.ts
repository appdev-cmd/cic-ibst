import { useState, useRef, useCallback, MouseEvent, WheelEvent, useEffect } from 'react';
import { Point2D } from '../utils/coordinateTransform';

interface UseCADViewportProps {
  initialZoom?: number;
  minZoom?: number;
  maxZoom?: number;
  centerScreen: Point2D;
  centerCAD: Point2D;
  onViewportChange?: () => void;
}

export function useCADViewport({
  initialZoom = 1,
  minZoom = 0.05,
  maxZoom = 50,
  centerScreen,
  centerCAD,
  onViewportChange
}: UseCADViewportProps) {
  const [zoom, setZoom] = useState<number>(initialZoom);
  const [pan, setPan] = useState<Point2D>({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState<boolean>(false);

  const dragStartRef = useRef<Point2D>({ x: 0, y: 0 });
  const panStartRef = useRef<Point2D>({ x: 0, y: 0 });

  // Refs phục vụ cho nội suy Smooth Zoom bằng Lerp
  const targetZoomRef = useRef<number>(initialZoom);
  const targetPanRef = useRef<Point2D>({ x: 0, y: 0 });
  const animationFrameRef = useRef<number | null>(null);

  // Đồng bộ lại refs khi initialZoom hoặc CAD center thay đổi
  useEffect(() => {
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
    targetZoomRef.current = initialZoom;
    targetPanRef.current = { x: 0, y: 0 };
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  }, [initialZoom, centerCAD.x, centerCAD.y]);

  // Hủy animation frame khi component unmount
  useEffect(() => {
    return () => {
      if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  // Hàm nội suy Lerp
  const lerp = (start: number, end: number, speed: number) => {
    return start + (end - start) * speed;
  };

  // Loop cập nhật viewport mượt mà (Lerp speed 0.18 giúp lướt cực êm)
  const updateViewport = useCallback(() => {
    let isStillLerping = false;

    setZoom(prevZoom => {
      const nextZoom = lerp(prevZoom, targetZoomRef.current, 0.18);
      if (Math.abs(nextZoom - targetZoomRef.current) < 0.00005 * targetZoomRef.current) {
        return targetZoomRef.current;
      }
      isStillLerping = true;
      return nextZoom;
    });

    setPan(prevPan => {
      const nextPanX = lerp(prevPan.x, targetPanRef.current.x, 0.18);
      const nextPanY = lerp(prevPan.y, targetPanRef.current.y, 0.18);
      if (Math.abs(nextPanX - targetPanRef.current.x) < 0.01 && Math.abs(nextPanY - targetPanRef.current.y) < 0.01) {
        return targetPanRef.current;
      }
      isStillLerping = true;
      return { x: nextPanX, y: nextPanY };
    });

    if (onViewportChange) onViewportChange();

    if (isStillLerping) {
      animationFrameRef.current = requestAnimationFrame(updateViewport);
    } else {
      animationFrameRef.current = null;
    }
  }, [onViewportChange]);

  // Handle Zoom at Mouse Pointer với Smooth Lerp & Zoom Factor 1.18 nhạy như AutoCAD
  const handleWheel = useCallback((e: WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = e.currentTarget;
    const rect = canvas.getBoundingClientRect();
    
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    const zoomFactor = 1.18;
    
    const currentTargetZoom = targetZoomRef.current;
    const nextZoom = e.deltaY < 0 ? currentTargetZoom * zoomFactor : currentTargetZoom / zoomFactor;
    
    const boundedZoom = Math.min(Math.max(nextZoom, minZoom), maxZoom);
    if (boundedZoom === currentTargetZoom) return;

    const ratio = boundedZoom / currentTargetZoom;

    const currentTargetPan = targetPanRef.current;
    const nextPanX = mouseX - centerScreen.x - ratio * (mouseX - centerScreen.x - currentTargetPan.x);
    const nextPanY = mouseY - centerScreen.y - ratio * (mouseY - centerScreen.y - currentTargetPan.y);

    targetZoomRef.current = boundedZoom;
    targetPanRef.current = { x: nextPanX, y: nextPanY };

    if (!animationFrameRef.current) {
      animationFrameRef.current = requestAnimationFrame(updateViewport);
    }
  }, [minZoom, maxZoom, centerScreen, updateViewport]);

  // Handle Dragging (Pan) - Phản hồi tức thì không trễ
  const handleMouseDown = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (e.button !== 0 && e.button !== 1) return;
    
    e.preventDefault();
    
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }

    setIsDragging(true);
    dragStartRef.current = { x: e.clientX, y: e.clientY };
    panStartRef.current = { ...pan };
    
    targetZoomRef.current = zoom;
    targetPanRef.current = { ...pan };
  }, [pan, zoom]);

  const handleMouseMove = useCallback((e: MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging) return;

    const dx = e.clientX - dragStartRef.current.x;
    const dy = e.clientY - dragStartRef.current.y;

    const nextPan = {
      x: panStartRef.current.x + dx,
      y: panStartRef.current.y + dy
    };

    setPan(nextPan);
    targetPanRef.current = nextPan;

    if (onViewportChange) onViewportChange();
  }, [isDragging, onViewportChange]);

  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  const resetViewport = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    setZoom(initialZoom);
    setPan({ x: 0, y: 0 });
    targetZoomRef.current = initialZoom;
    targetPanRef.current = { x: 0, y: 0 };
    if (onViewportChange) onViewportChange();
  }, [initialZoom, onViewportChange]);

  // Đặt trực tiếp zoom + pan (dùng cho pinch-zoom cảm ứng), đồng bộ luôn target lerp
  const applyViewport = useCallback((nextZoom: number, nextPan: Point2D) => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    const bounded = Math.min(Math.max(nextZoom, minZoom), maxZoom);
    setZoom(bounded);
    setPan(nextPan);
    targetZoomRef.current = bounded;
    targetPanRef.current = nextPan;
    if (onViewportChange) onViewportChange();
  }, [minZoom, maxZoom, onViewportChange]);

  return {
    zoom,
    setZoom,
    pan,
    setPan,
    isDragging,
    handleWheel,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
    resetViewport,
    applyViewport
  };
}
