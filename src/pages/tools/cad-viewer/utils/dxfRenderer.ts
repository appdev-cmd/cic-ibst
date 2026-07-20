import { CoordinateTransform } from './coordinateTransform';
import { Point2D } from './coordinateTransform';

// AutoCAD Color Index (ACI) map cơ bản 1-9
const ACI_COLORS: { [key: number]: string } = {
  1: '#FF0000', // Red
  2: '#FFFF00', // Yellow
  3: '#00FF00', // Green
  4: '#00FFFF', // Cyan
  5: '#0055FF', // Blue (Làm sáng hơn xanh dương đậm mặc định)
  6: '#FF00FF', // Magenta
  7: '#FFFFFF', // White/Black (Sẽ tự động điều chỉnh tùy background)
  8: '#808080', // Dark Gray
  9: '#C0C0C0', // Light Gray
};

// Hàm convert HSV sang RGB Hex
export function hsvToRgb(h: number, s: number, v: number): string {
  s /= 100;
  v /= 100;
  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;
  let r = 0, g = 0, b = 0;

  if (h >= 0 && h < 60) { r = c; g = x; b = 0; }
  else if (h >= 60 && h < 120) { r = x; g = c; b = 0; }
  else if (h >= 120 && h < 180) { r = 0; g = c; b = x; }
  else if (h >= 180 && h < 240) { r = 0; g = x; b = c; }
  else if (h >= 240 && h < 300) { r = x; g = 0; b = c; }
  else if (h >= 300 && h < 360) { r = c; g = 0; b = x; }

  const ri = Math.round((r + m) * 255);
  const gi = Math.round((g + m) * 255);
  const bi = Math.round((b + m) * 255);

  return "#" + ((1 << 24) + (ri << 16) + (gi << 8) + bi).toString(16).slice(1);
}

export function getHexColor(colorIndex: number, isDarkBackground: boolean): string {
  if (colorIndex < 0) {
    colorIndex = Math.abs(colorIndex);
  }

  // 1. Nhóm màu cơ bản ACI 1-9
  if (colorIndex >= 1 && colorIndex <= 9) {
    if (colorIndex === 7) {
      return isDarkBackground ? '#FFFFFF' : '#000000';
    }
    // Làm sáng màu xanh dương cơ bản (5) trên nền tối
    if (colorIndex === 5 && isDarkBackground) {
      return '#3b82f6'; // Muted blue tươi sáng
    }
    return ACI_COLORS[colorIndex] || '#FFFFFF';
  }

  // 2. Nhóm màu xám ACI 250-255
  if (colorIndex >= 250 && colorIndex <= 255) {
    const grayVals = isDarkBackground
      ? ['#555555', '#777777', '#999999', '#bbbbbb', '#dddddd', '#ffffff'] // Nền tối -> làm sáng màu xám lên
      : ['#222222', '#444444', '#666666', '#888888', '#aaaaaa', '#cccccc'];
    return grayVals[colorIndex - 250] || '#FFFFFF';
  }

  // 3. Nhóm màu mở rộng 10-249 (chuyển đổi HSV -> RGB)
  if (colorIndex >= 10 && colorIndex <= 249) {
    const H_idx = Math.floor((colorIndex - 10) / 10);
    const L_idx = (colorIndex - 10) % 10;

    const hue = H_idx * 15;
    let saturation = 100;
    let value = 100;

    if (L_idx % 2 === 0) {
      saturation = 100;
      value = 100 - (L_idx / 2) * 15;
    } else {
      const steps = (L_idx - 1) / 2;
      saturation = 100 - (steps + 1) * 15;
      value = 100;
    }

    // Tự động làm sáng màu tối trên nền đen để rõ nét
    if (isDarkBackground && value < 60) {
      value = 60; // Tăng giá trị sáng tối thiểu lên 60%
    }

    return hsvToRgb(hue, saturation, value);
  }

  return isDarkBackground ? '#FFFFFF' : '#000000';
}

export function getHexColorFromDxfColor(dxfColor: any, isDarkBackground: boolean): string {
  if (dxfColor === undefined || dxfColor === null) {
    return isDarkBackground ? '#FFFFFF' : '#000000';
  }

  const absColor = Math.abs(dxfColor);

  // Nếu là màu ACI thông thường (1-255)
  if (absColor <= 255) {
    return getHexColor(absColor, isDarkBackground);
  }

  // Nếu là màu RGB 24-bit (số nguyên lớn)
  let hex = absColor.toString(16).padStart(6, '0');

  // AutoCAD đôi khi trả về màu trắng tinh cho các đối tượng mặc định
  if (!isDarkBackground && hex.toLowerCase() === 'ffffff') {
    return '#000000';
  }
  if (isDarkBackground && hex.toLowerCase() === '000000') {
    return '#ffffff';
  }

  // Làm sáng các màu quá tối trên nền đen để hiển thị rõ
  if (isDarkBackground) {
    let r = parseInt(hex.substring(0, 2), 16);
    let g = parseInt(hex.substring(2, 4), 16);
    let b = parseInt(hex.substring(4, 6), 16);

    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    if (brightness < 80) { // Quá tối
      const scale = 120 / (brightness || 1);
      r = Math.min(255, Math.round(r * scale));
      g = Math.min(255, Math.round(g * scale));
      b = Math.min(255, Math.round(b * scale));
      hex = ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
    }
  }

  return '#' + hex;
}

export function getEntityColor(entity: any, layers: any, isDarkBackground: boolean): string {
  // 1. Kiểm tra màu trực tiếp của entity
  if (entity.color !== undefined) {
    if (entity.color === 256) { // ByLayer
      const layer = layers[entity.layer];
      if (layer) {
        const layerColor = layer.color !== undefined ? layer.color : layer.colorIndex;
        return getHexColorFromDxfColor(layerColor, isDarkBackground);
      }
    } else {
      return getHexColorFromDxfColor(entity.color, isDarkBackground);
    }
  }

  // 2. Lấy màu theo Layer
  const layer = layers[entity.layer];
  if (layer) {
    const layerColor = layer.color !== undefined ? layer.color : layer.colorIndex;
    return getHexColorFromDxfColor(layerColor, isDarkBackground);
  }

  return isDarkBackground ? '#FFFFFF' : '#000000';
}

// ════════════════════════════════════════════════════════════════
// MA TRẬN AFFINE 2D — phục vụ render INSERT/block lồng nhau
// world = [a c e; b d f] * local
// ════════════════════════════════════════════════════════════════

export interface Matrix2D {
  a: number; b: number; c: number; d: number; e: number; f: number;
}

export function multiplyMatrix(m1: Matrix2D, m2: Matrix2D): Matrix2D {
  return {
    a: m1.a * m2.a + m1.c * m2.b,
    b: m1.b * m2.a + m1.d * m2.b,
    c: m1.a * m2.c + m1.c * m2.d,
    d: m1.b * m2.c + m1.d * m2.d,
    e: m1.a * m2.e + m1.c * m2.f + m1.e,
    f: m1.b * m2.e + m1.d * m2.f + m1.f
  };
}

export function applyMatrix(m: Matrix2D, x: number, y: number): Point2D {
  return {
    x: m.a * x + m.c * y + m.e,
    y: m.b * x + m.d * y + m.f
  };
}

// Hệ số phóng trung bình của ma trận (dùng ước lượng kích thước chữ, đường tròn)
export function matrixScale(m: Matrix2D): number {
  const det = Math.abs(m.a * m.d - m.b * m.c);
  return Math.sqrt(det) || 1;
}

// Góc xoay của ma trận (radian)
function matrixRotation(m: Matrix2D): number {
  return Math.atan2(m.b, m.a);
}

/**
 * Ma trận đặt block: Translate(vị trí chèn) · Rotate · Scale · Translate(-điểm gốc block)
 * offsetX/offsetY phục vụ MINSERT (mảng hàng/cột)
 */
export function buildInsertMatrix(
  insert: any,
  blockBase: Point2D,
  offsetX = 0,
  offsetY = 0
): Matrix2D {
  const sx = insert.xScale ?? 1;
  const sy = insert.yScale ?? 1;
  const rot = ((insert.rotation ?? 0) * Math.PI) / 180;
  const cos = Math.cos(rot);
  const sin = Math.sin(rot);
  const px = insert.position?.x ?? 0;
  const py = insert.position?.y ?? 0;

  // R·S
  const a = cos * sx;
  const b = sin * sx;
  const c = -sin * sy;
  const d = cos * sy;

  // Điểm local sau cùng bị dời: local' = local + offset - base
  const tx = offsetX - blockBase.x;
  const ty = offsetY - blockBase.y;

  return {
    a, b, c, d,
    e: a * tx + c * ty + px,
    f: b * tx + d * ty + py
  };
}

// ════════════════════════════════════════════════════════════════
// TESSELLATION — chuyển các đường cong thành chuỗi điểm
// ════════════════════════════════════════════════════════════════

/**
 * Khai triển các đỉnh polyline có bulge (đoạn cung tròn) thành chuỗi điểm.
 * bulge = tan(θ/4), dương = cung ngược chiều kim đồng hồ từ p1 → p2.
 */
export function expandPolylineVertices(vertices: any[], closed: boolean): Point2D[] {
  const pts: Point2D[] = [];
  const n = vertices.length;
  if (n === 0) return pts;

  const segCount = closed ? n : n - 1;

  for (let i = 0; i < n; i++) {
    const v = vertices[i];
    pts.push({ x: v.x, y: v.y });

    if (i >= segCount) break;

    const next = vertices[(i + 1) % n];
    const bulge = v.bulge;
    if (bulge && Math.abs(bulge) > 1e-9) {
      appendBulgeArcPoints(pts, v, next, bulge);
    }
  }

  return pts;
}

// Thêm các điểm trung gian của cung bulge (không gồm 2 điểm mút)
function appendBulgeArcPoints(pts: Point2D[], p1: Point2D, p2: Point2D, bulge: number) {
  const theta = 4 * Math.atan(bulge); // Góc chắn cung (có dấu)
  const dx = p2.x - p1.x;
  const dy = p2.y - p1.y;
  const chord = Math.sqrt(dx * dx + dy * dy);
  if (chord < 1e-12) return;

  const r = chord / (2 * Math.sin(theta / 2)); // Cùng dấu với theta → r luôn dương
  const angChord = Math.atan2(dy, dx);
  const angToCenter = angChord + (Math.PI / 2 - theta / 2);
  const cx = p1.x + r * Math.cos(angToCenter);
  const cy = p1.y + r * Math.sin(angToCenter);
  const startAng = Math.atan2(p1.y - cy, p1.x - cx);

  const steps = Math.max(4, Math.ceil(Math.abs(theta) / (Math.PI / 32)));
  const absR = Math.abs(r);
  for (let s = 1; s < steps; s++) {
    const t = startAng + theta * (s / steps);
    pts.push({ x: cx + absR * Math.cos(t), y: cy + absR * Math.sin(t) });
  }
}

// Lấy mẫu điểm trên cung tròn/đường tròn (theo hệ CAD, CCW)
function sampleArcPoints(
  cx: number, cy: number, r: number,
  startDeg: number, endDeg: number,
  screenRadius: number
): Point2D[] {
  let a0 = (startDeg * Math.PI) / 180;
  let a1 = (endDeg * Math.PI) / 180;
  if (a1 <= a0) a1 += Math.PI * 2;

  const sweep = a1 - a0;
  const steps = Math.min(180, Math.max(8, Math.ceil(screenRadius / 3), Math.ceil(sweep / (Math.PI / 24))));
  const pts: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = a0 + sweep * (i / steps);
    pts.push({ x: cx + r * Math.cos(t), y: cy + r * Math.sin(t) });
  }
  return pts;
}

// Lấy mẫu điểm trên ELLIPSE (tham số hóa theo DXF: góc bắt đầu/kết thúc tính bằng radian)
export function sampleEllipsePoints(entity: any): Point2D[] {
  const c = entity.center;
  const maj = entity.majorAxisEndPoint;
  if (!c || !maj) return [];

  const ratio = entity.axisRatio ?? 1;
  let t0 = entity.startAngle ?? 0;
  let t1 = entity.endAngle ?? Math.PI * 2;
  if (t1 <= t0) t1 += Math.PI * 2;

  const majLen = Math.sqrt(maj.x * maj.x + maj.y * maj.y);
  const minLen = majLen * ratio;
  const rot = Math.atan2(maj.y, maj.x);
  const cosR = Math.cos(rot);
  const sinR = Math.sin(rot);

  const steps = Math.max(24, Math.ceil((t1 - t0) / (Math.PI / 32)));
  const pts: Point2D[] = [];
  for (let i = 0; i <= steps; i++) {
    const t = t0 + (t1 - t0) * (i / steps);
    const ex = majLen * Math.cos(t);
    const ey = minLen * Math.sin(t);
    pts.push({
      x: c.x + ex * cosR - ey * sinR,
      y: c.y + ex * sinR + ey * cosR
    });
  }
  return pts;
}

// Thuật toán de Boor lấy điểm trên B-spline tại tham số t
function deBoor(t: number, degree: number, ctrl: any[], knots: number[]): Point2D {
  // Tìm khoảng knot k sao cho knots[k] <= t < knots[k+1]
  let k = knots.length - degree - 2;
  for (let i = degree; i < knots.length - degree - 1; i++) {
    if (t < knots[i + 1]) { k = i; break; }
  }

  const d: Point2D[] = [];
  for (let j = 0; j <= degree; j++) {
    const idx = Math.min(Math.max(k - degree + j, 0), ctrl.length - 1);
    d.push({ x: ctrl[idx].x, y: ctrl[idx].y });
  }

  for (let r = 1; r <= degree; r++) {
    for (let j = degree; j >= r; j--) {
      const i = k - degree + j;
      const denom = knots[i + degree - r + 1] - knots[i];
      const alpha = denom === 0 ? 0 : (t - knots[i]) / denom;
      d[j] = {
        x: (1 - alpha) * d[j - 1].x + alpha * d[j].x,
        y: (1 - alpha) * d[j - 1].y + alpha * d[j].y
      };
    }
  }
  return d[degree];
}

// Lấy mẫu điểm SPLINE: ưu tiên de Boor trên control points, fallback fit points
export function sampleSplinePoints(entity: any): Point2D[] {
  const ctrl = entity.controlPoints;
  const degree = entity.degreeOfSplineCurve ?? 3;
  const knots = entity.knotValues;

  if (ctrl && ctrl.length >= degree + 1 && knots && knots.length === ctrl.length + degree + 1) {
    const tMin = knots[degree];
    const tMax = knots[knots.length - 1 - degree];
    const samples = Math.min(256, Math.max(16, ctrl.length * 8));
    const pts: Point2D[] = [];
    for (let i = 0; i <= samples; i++) {
      const t = tMin + ((tMax - tMin) * i) / samples;
      pts.push(deBoor(t, degree, ctrl, knots));
    }
    return pts;
  }

  if (entity.fitPoints && entity.fitPoints.length >= 2) {
    return entity.fitPoints.map((p: any) => ({ x: p.x, y: p.y }));
  }
  if (ctrl && ctrl.length >= 2) {
    return ctrl.map((p: any) => ({ x: p.x, y: p.y }));
  }
  return [];
}

// ════════════════════════════════════════════════════════════════
// RENDER CHÍNH
// ════════════════════════════════════════════════════════════════

interface RenderContext {
  transform: CoordinateTransform;
  layers: any;
  blocks: any;
  hiddenLayers: Set<string>;
  isDark: boolean;
}

const MAX_BLOCK_DEPTH = 8;

export function renderDXF(
  ctx: CanvasRenderingContext2D,
  dxfData: any,
  transform: CoordinateTransform,
  hiddenLayers: Set<string>,
  isDarkBackground: boolean = true
) {
  if (!dxfData || !dxfData.entities) return;

  const rc: RenderContext = {
    transform,
    layers: dxfData.tables?.layer?.layers || {},
    blocks: dxfData.blocks || {},
    hiddenLayers,
    isDark: isDarkBackground
  };

  ctx.lineWidth = 1.2;

  for (const entity of dxfData.entities) {
    renderEntity(ctx, entity, rc, null, 0, undefined, undefined);
  }
}

/**
 * Phân giải màu entity, hỗ trợ ByBlock (colorIndex 0 → thừa kế từ INSERT)
 * và ByLayer (thừa kế từ layer hiệu dụng — layer "0" trong block lấy layer của INSERT).
 */
function resolveEntityColor(
  entity: any,
  rc: RenderContext,
  effLayer: string,
  inheritedColor?: string
): string {
  // ByBlock — thừa kế màu của INSERT cha
  if (entity.colorIndex === 0 && inheritedColor) return inheritedColor;

  if (entity.color !== undefined && entity.color !== 256 && entity.colorIndex !== 0) {
    return getHexColorFromDxfColor(entity.color, rc.isDark);
  }

  // ByLayer
  const layer = rc.layers[effLayer];
  if (layer) {
    const layerColor = layer.color !== undefined ? layer.color : layer.colorIndex;
    return getHexColorFromDxfColor(layerColor, rc.isDark);
  }

  return inheritedColor || (rc.isDark ? '#FFFFFF' : '#000000');
}

function renderEntity(
  ctx: CanvasRenderingContext2D,
  entity: any,
  rc: RenderContext,
  m: Matrix2D | null,
  depth: number,
  inheritedColor?: string,
  inheritedLayer?: string
) {
  if (entity.visible === false) return;

  // Layer "0" trong block thừa kế layer của INSERT (quy ước AutoCAD)
  const effLayer = entity.layer === '0' && inheritedLayer ? inheritedLayer : entity.layer;
  if (rc.hiddenLayers.has(effLayer)) return;

  const color = resolveEntityColor(entity, rc, effLayer, inheritedColor);
  ctx.strokeStyle = color;
  ctx.fillStyle = color;

  switch (entity.type) {
    case 'LINE':
      renderLine(ctx, entity, rc, m);
      break;
    case 'CIRCLE':
      renderCircle(ctx, entity, rc, m);
      break;
    case 'ARC':
      renderArc(ctx, entity, rc, m);
      break;
    case 'LWPOLYLINE':
    case 'POLYLINE':
      renderPolyline(ctx, entity, rc, m);
      break;
    case 'ELLIPSE':
      renderPointChain(ctx, sampleEllipsePoints(entity), rc, m, false);
      break;
    case 'SPLINE':
      renderPointChain(ctx, sampleSplinePoints(entity), rc, m, !!entity.closed);
      break;
    case 'SOLID':
    case '3DFACE':
      renderSolid(ctx, entity, rc, m);
      break;
    case 'POINT':
      renderPoint(ctx, entity, rc, m);
      break;
    case 'TEXT':
    case 'ATTDEF':
      renderText(ctx, entity, rc, m);
      break;
    case 'MTEXT':
      renderText(ctx, entity, rc, m);
      break;
    case 'INSERT':
      renderInsert(ctx, entity, rc, m, depth, effLayer, color);
      break;
    case 'DIMENSION':
      renderDimension(ctx, entity, rc, m, depth, effLayer, color);
      break;
    default:
      // HATCH và các thực thể khác chưa hỗ trợ
      break;
  }
}

// Chuyển tọa độ local (trong block) → màn hình
function toScreen(rc: RenderContext, m: Matrix2D | null, x: number, y: number): Point2D {
  if (m) {
    const p = applyMatrix(m, x, y);
    return rc.transform.cadToScreen(p.x, p.y);
  }
  return rc.transform.cadToScreen(x, y);
}

function renderLine(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  if (!entity.vertices || entity.vertices.length < 2) return;
  const p1 = toScreen(rc, m, entity.vertices[0].x, entity.vertices[0].y);
  const p2 = toScreen(rc, m, entity.vertices[1].x, entity.vertices[1].y);

  ctx.beginPath();
  ctx.moveTo(p1.x, p1.y);
  ctx.lineTo(p2.x, p2.y);
  ctx.stroke();
}

// Vẽ chuỗi điểm đã tessellate (local coords)
function renderPointChain(
  ctx: CanvasRenderingContext2D,
  pts: Point2D[],
  rc: RenderContext,
  m: Matrix2D | null,
  closed: boolean
) {
  if (pts.length < 2) return;

  ctx.beginPath();
  const start = toScreen(rc, m, pts[0].x, pts[0].y);
  ctx.moveTo(start.x, start.y);
  for (let i = 1; i < pts.length; i++) {
    const p = toScreen(rc, m, pts[i].x, pts[i].y);
    ctx.lineTo(p.x, p.y);
  }
  if (closed) ctx.closePath();
  ctx.stroke();
}

function renderCircle(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  if (!entity.center || entity.radius === undefined) return;

  if (!m) {
    // Fast path: không nằm trong block
    const center = rc.transform.cadToScreen(entity.center.x, entity.center.y);
    const radius = rc.transform.cadToScreenLength(entity.radius);
    if (radius <= 0.1) return;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, 0, 2 * Math.PI);
    ctx.stroke();
    return;
  }

  // Trong block: tessellate để xử lý đúng scale không đều / mirror
  const scrR = rc.transform.cadToScreenLength(entity.radius * matrixScale(m));
  if (scrR <= 0.1) return;
  const pts = sampleArcPoints(entity.center.x, entity.center.y, entity.radius, 0, 360, scrR);
  renderPointChain(ctx, pts, rc, m, true);
}

function renderArc(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  if (!entity.center || entity.radius === undefined) return;

  if (!m) {
    // Fast path
    const center = rc.transform.cadToScreen(entity.center.x, entity.center.y);
    const radius = rc.transform.cadToScreenLength(entity.radius);
    if (radius <= 0.1) return;

    // Góc DXF (độ, CCW, Y hướng lên) → Canvas (Y hướng xuống): đảo dấu, vẽ anticlockwise
    const startAngle = -(entity.startAngle * Math.PI) / 180;
    const endAngle = -(entity.endAngle * Math.PI) / 180;

    ctx.beginPath();
    ctx.arc(center.x, center.y, radius, startAngle, endAngle, true);
    ctx.stroke();
    return;
  }

  const scrR = rc.transform.cadToScreenLength(entity.radius * matrixScale(m));
  if (scrR <= 0.1) return;
  const pts = sampleArcPoints(
    entity.center.x, entity.center.y, entity.radius,
    entity.startAngle ?? 0, entity.endAngle ?? 360, scrR
  );
  renderPointChain(ctx, pts, rc, m, false);
}

function renderPolyline(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  if (!entity.vertices || entity.vertices.length < 2) return;

  const closed = !!entity.shape;
  const pts = expandPolylineVertices(entity.vertices, closed);
  renderPointChain(ctx, pts, rc, m, closed);
}

function renderSolid(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  const pts = entity.points;
  if (!pts || pts.length < 3) return;

  // SOLID/3DFACE: thứ tự đỉnh 1-2-4-3 (đỉnh 3 và 4 tráo chỗ theo chuẩn DXF)
  const order = pts.length >= 4 ? [0, 1, 3, 2] : [0, 1, 2];

  ctx.beginPath();
  const first = toScreen(rc, m, pts[order[0]].x, pts[order[0]].y);
  ctx.moveTo(first.x, first.y);
  for (let i = 1; i < order.length; i++) {
    const p = toScreen(rc, m, pts[order[i]].x, pts[order[i]].y);
    ctx.lineTo(p.x, p.y);
  }
  ctx.closePath();
  ctx.fill();
}

function renderPoint(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  if (!entity.position) return;
  const p = toScreen(rc, m, entity.position.x, entity.position.y);
  const size = 3;

  ctx.beginPath();
  ctx.moveTo(p.x - size, p.y);
  ctx.lineTo(p.x + size, p.y);
  ctx.moveTo(p.x, p.y - size);
  ctx.lineTo(p.x, p.y + size);
  ctx.stroke();
}

// Giải mã ký hiệu định dạng MTEXT/TEXT của AutoCAD
function decodeDxfText(text: string): string {
  return text
    .replace(/\\P/g, ' ')
    .replace(/\\[A-Za-z0-9]+;/g, '')
    .replace(/[{}]/g, '')
    .replace(/\\U\+([0-9A-Fa-f]{4})/g, (_match: string, hex: string) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/%%c/gi, 'Ø')
    .replace(/%%d/gi, '°')
    .replace(/%%p/gi, '±')
    .replace(/%%u/gi, '')
    .replace(/%%o/gi, '');
}

function renderText(ctx: CanvasRenderingContext2D, entity: any, rc: RenderContext, m: Matrix2D | null) {
  const text = entity.text || '';
  if (!text.trim()) return;

  const startX = entity.startPoint?.x ?? entity.position?.x ?? 0;
  const startY = entity.startPoint?.y ?? entity.position?.y ?? 0;

  const pos = toScreen(rc, m, startX, startY);
  const rawHeight = entity.textHeight ?? entity.height ?? 10;
  const scale = m ? matrixScale(m) : 1;
  const height = rc.transform.cadToScreenLength(rawHeight * scale);

  if (height < 2.5) return; // Chữ quá nhỏ khi zoom xa thì bỏ qua để tối ưu

  const cleanText = decodeDxfText(text);
  if (!cleanText.trim()) return;

  // Góc xoay: rotation của entity (độ) + góc xoay của block chứa nó
  const rotRad = ((entity.rotation ?? 0) * Math.PI) / 180 + (m ? matrixRotation(m) : 0);

  ctx.font = `${Math.round(height)}px sans-serif`;
  ctx.textBaseline = 'alphabetic';
  ctx.textAlign = 'left';

  if (Math.abs(rotRad) > 1e-6) {
    ctx.save();
    ctx.translate(pos.x, pos.y);
    ctx.rotate(-rotRad); // Hệ màn hình Y ngược → đảo chiều xoay
    ctx.fillText(cleanText, 0, 0);
    ctx.restore();
  } else {
    ctx.fillText(cleanText, pos.x, pos.y);
  }
}

function renderInsert(
  ctx: CanvasRenderingContext2D,
  entity: any,
  rc: RenderContext,
  m: Matrix2D | null,
  depth: number,
  effLayer: string,
  insertColor: string
) {
  if (depth >= MAX_BLOCK_DEPTH) return;

  const block = rc.blocks[entity.name];
  if (!block || !block.entities || block.entities.length === 0) return;

  const base: Point2D = block.position
    ? { x: block.position.x, y: block.position.y }
    : { x: 0, y: 0 };

  const cols = Math.max(1, entity.columnCount || 1);
  const rows = Math.max(1, entity.rowCount || 1);
  const colSp = entity.columnSpacing || 0;
  const rowSp = entity.rowSpacing || 0;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const local = buildInsertMatrix(entity, base, c * colSp, r * rowSp);
      const world = m ? multiplyMatrix(m, local) : local;

      for (const child of block.entities) {
        renderEntity(ctx, child, rc, world, depth + 1, insertColor, effLayer);
      }
    }
  }
}

function renderDimension(
  ctx: CanvasRenderingContext2D,
  entity: any,
  rc: RenderContext,
  m: Matrix2D | null,
  depth: number,
  effLayer: string,
  dimColor: string
) {
  if (depth >= MAX_BLOCK_DEPTH) return;

  // DIMENSION lưu hình học trong block ẩn danh (*D...), tọa độ đã ở WCS
  const block = entity.block ? rc.blocks[entity.block] : null;
  if (!block || !block.entities) return;

  for (const child of block.entities) {
    renderEntity(ctx, child, rc, m, depth + 1, dimColor, effLayer);
  }
}
