import { Point2D } from './coordinateTransform';

export interface SnapResult {
  x: number;
  y: number;
  type: 'endpoint' | 'midpoint' | 'center' | 'intersection' | 'insertion';
}

// Tính khoảng cách Euclid giữa 2 điểm
const distance = (p1: Point2D, p2: Point2D): number => {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
};

// Tìm giao điểm giữa 2 đoạn thẳng AB và CD
const getLineIntersection = (
  a: Point2D, b: Point2D,
  c: Point2D, d: Point2D
): Point2D | null => {
  const denominator = (d.y - c.y) * (b.x - a.x) - (d.x - c.x) * (b.y - a.y);
  if (Math.abs(denominator) < 0.000001) return null; // Song song hoặc trùng nhau

  const ua = ((d.x - c.x) * (a.y - c.y) - (d.y - c.y) * (a.x - c.x)) / denominator;
  const ub = ((b.x - a.x) * (a.y - c.y) - (b.y - a.y) * (a.x - c.x)) / denominator;

  // Giao điểm phải nằm trên cả 2 đoạn thẳng (ua và ub trong khoảng [0, 1])
  if (ua >= 0 && ua <= 1 && ub >= 0 && ub <= 1) {
    return {
      x: a.x + ua * (b.x - a.x),
      y: a.y + ua * (b.y - a.y)
    };
  }

  return null;
};

// Trích xuất các phân đoạn thẳng (Line segments) từ entities để tính Intersection
interface LineSegment {
  p1: Point2D;
  p2: Point2D;
}

const getSegmentsFromEntity = (entity: any): LineSegment[] => {
  const segments: LineSegment[] = [];

  if (entity.type === 'LINE' && entity.vertices && entity.vertices.length >= 2) {
    segments.push({ p1: entity.vertices[0], p2: entity.vertices[1] });
  } 
  else if ((entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') && entity.vertices && entity.vertices.length >= 2) {
    for (let i = 0; i < entity.vertices.length - 1; i++) {
      segments.push({ p1: entity.vertices[i], p2: entity.vertices[i + 1] });
    }
    if (entity.shape) { // Polyline khép kín
      segments.push({
        p1: entity.vertices[entity.vertices.length - 1],
        p2: entity.vertices[0]
      });
    }
  }

  return segments;
};

export const findSnapPoint = (
  mouseCadPt: Point2D,
  entities: any[],
  snapToleranceCad: number // Ngưỡng snap quy đổi ra tọa độ CAD
): SnapResult | null => {
  let bestSnap: SnapResult | null = null;
  let minDistance = snapToleranceCad;

  const checkSnap = (x: number, y: number, type: SnapResult['type']) => {
    const pt = { x, y };
    const dist = distance(mouseCadPt, pt);
    if (dist < minDistance) {
      minDistance = dist;
      bestSnap = { x, y, type };
    }
  };

  // Thu thập các phân đoạn thẳng gần chuột để tìm điểm giao nhau (Intersection)
  const nearbySegments: LineSegment[] = [];

  entities.forEach((entity: any) => {
    // 1. Line
    if (entity.type === 'LINE' && entity.vertices && entity.vertices.length >= 2) {
      const v0 = entity.vertices[0];
      const v1 = entity.vertices[1];
      checkSnap(v0.x, v0.y, 'endpoint');
      checkSnap(v1.x, v1.y, 'endpoint');
      checkSnap((v0.x + v1.x) / 2, (v0.y + v1.y) / 2, 'midpoint');

      nearbySegments.push({ p1: v0, p2: v1 });
    } 
    // 2. Lwpolyline / Polyline
    else if ((entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') && entity.vertices) {
      const len = entity.vertices.length;
      if (len > 0) {
        // Endpoint: các đỉnh
        entity.vertices.forEach((v: any) => {
          checkSnap(v.x, v.y, 'endpoint');
        });

        // Midpoint: điểm giữa các phân đoạn
        for (let i = 0; i < len - 1; i++) {
          const v0 = entity.vertices[i];
          const v1 = entity.vertices[i + 1];
          checkSnap((v0.x + v1.x) / 2, (v0.y + v1.y) / 2, 'midpoint');
          nearbySegments.push({ p1: v0, p2: v1 });
        }

        // Nếu khép kín
        if (entity.shape && len >= 3) {
          const v0 = entity.vertices[len - 1];
          const v1 = entity.vertices[0];
          checkSnap((v0.x + v1.x) / 2, (v0.y + v1.y) / 2, 'midpoint');
          nearbySegments.push({ p1: v0, p2: v1 });
        }
      }
    } 
    // 3. Circle
    else if (entity.type === 'CIRCLE' && entity.center && entity.radius !== undefined) {
      checkSnap(entity.center.x, entity.center.y, 'center');
    } 
    // 4. Arc
    else if (entity.type === 'ARC' && entity.center && entity.radius !== undefined) {
      // Bắt điểm tâm của ARC
      checkSnap(entity.center.x, entity.center.y, 'center');

      // Bắt điểm đầu và điểm cuối của cung ARC (dựa trên góc bắt đầu và góc kết thúc)
      const r = entity.radius;
      const startAngleRad = (entity.startAngle * Math.PI) / 180;
      const endAngleRad = (entity.endAngle * Math.PI) / 180;

      const pStart = {
        x: entity.center.x + r * Math.cos(startAngleRad),
        y: entity.center.y + r * Math.sin(startAngleRad)
      };
      const pEnd = {
        x: entity.center.x + r * Math.cos(endAngleRad),
        y: entity.center.y + r * Math.sin(endAngleRad)
      };

      checkSnap(pStart.x, pStart.y, 'endpoint');
      checkSnap(pEnd.x, pEnd.y, 'endpoint');
    }
    // 5. Insert (block reference) — bắt điểm chèn block
    else if (entity.type === 'INSERT' && entity.position) {
      checkSnap(entity.position.x, entity.position.y, 'insertion');
    }
    // 6. Ellipse — bắt điểm tâm
    else if (entity.type === 'ELLIPSE' && entity.center) {
      checkSnap(entity.center.x, entity.center.y, 'center');
    }
    // 7. Spline — bắt điểm đầu/cuối (fit points hoặc control points)
    else if (entity.type === 'SPLINE') {
      const pts = entity.fitPoints?.length ? entity.fitPoints : entity.controlPoints;
      if (pts && pts.length > 0) {
        checkSnap(pts[0].x, pts[0].y, 'endpoint');
        checkSnap(pts[pts.length - 1].x, pts[pts.length - 1].y, 'endpoint');
      }
    }
  });

  // Tìm giao điểm (Intersection) giữa các phân đoạn thẳng gần nhất
  // Để tránh quá tải tính toán O(N^2), ta lọc các segments thực sự gần con trỏ chuột
  const segmentsInTolerance = nearbySegments.filter(seg => {
    // Tính khoảng cách sơ bộ từ điểm mút segment đến chuột
    const d1 = distance(seg.p1, mouseCadPt);
    const d2 = distance(seg.p2, mouseCadPt);
    // Nếu cả hai điểm mút nằm quá xa chuột (> 2 lần snapToleranceCad) thì bỏ qua
    return d1 < snapToleranceCad * 2.5 || d2 < snapToleranceCad * 2.5;
  });

  for (let i = 0; i < segmentsInTolerance.length; i++) {
    for (let j = i + 1; j < segmentsInTolerance.length; j++) {
      const intersect = getLineIntersection(
        segmentsInTolerance[i].p1, segmentsInTolerance[i].p2,
        segmentsInTolerance[j].p1, segmentsInTolerance[j].p2
      );
      if (intersect) {
        checkSnap(intersect.x, intersect.y, 'intersection');
      }
    }
  }

  return bestSnap;
};
