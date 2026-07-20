export interface BoundingBox {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export interface QuadtreeItem {
  id: string;
  entity: any;
  bounds: BoundingBox;
}

export class DxfQuadtree {
  private maxItems = 100;
  private maxDepth = 8;

  private items: QuadtreeItem[] = [];
  private children: DxfQuadtree[] | null = null;

  constructor(
    public bounds: BoundingBox,
    private depth: number = 0
  ) {}

  // Kiểm tra điểm/hình chữ nhật có nằm trong bounds không
  private intersects(a: BoundingBox, b: BoundingBox): boolean {
    return !(
      a.maxX < b.minX ||
      a.minX > b.maxX ||
      a.maxY < b.minY ||
      a.minY > b.maxY
    );
  }

  // Phân chia node thành 4 con
  private subdivide() {
    const midX = (this.bounds.minX + this.bounds.maxX) / 2;
    const midY = (this.bounds.minY + this.bounds.maxY) / 2;

    this.children = [
      // North-West (Tây Bắc)
      new DxfQuadtree({ minX: this.bounds.minX, maxX: midX, minY: midY, maxY: this.bounds.maxY }, this.depth + 1),
      // North-East (Đông Bắc)
      new DxfQuadtree({ minX: midX, maxX: this.bounds.maxX, minY: midY, maxY: this.bounds.maxY }, this.depth + 1),
      // South-West (Tây Nam)
      new DxfQuadtree({ minX: this.bounds.minX, maxX: midX, minY: this.bounds.minY, maxY: midY }, this.depth + 1),
      // South-East (Đông Nam)
      new DxfQuadtree({ minX: midX, maxX: this.bounds.maxX, minY: this.bounds.minY, maxY: midY }, this.depth + 1)
    ];

    // Chuyển các items hiện tại xuống các node con nếu khớp
    const currentItems = this.items;
    this.items = [];

    currentItems.forEach(item => this.insert(item));
  }

  // Thêm thực thể vào Quadtree
  public insert(item: QuadtreeItem): boolean {
    if (!this.intersects(this.bounds, item.bounds)) {
      return false; // Nằm ngoài phạm vi của node này
    }

    // Nếu đã phân chia, chuyển thẳng xuống node con phù hợp
    if (this.children) {
      let inserted = false;
      for (const child of this.children) {
        if (child.insert(item)) {
          inserted = true;
        }
      }
      return inserted;
    }

    // Thêm vào node hiện tại
    this.items.push(item);

    // Phân chia nếu vượt quá số lượng tối đa và chưa đạt độ sâu giới hạn
    if (this.items.length > this.maxItems && this.depth < this.maxDepth) {
      this.subdivide();
    }

    return true;
  }

  // Tìm kiếm tất cả các thực thể giao cắt với Viewport
  public query(range: BoundingBox, found: Set<any> = new Set()): any[] {
    if (!this.intersects(this.bounds, range)) {
      return [];
    }

    // Thu thập từ node hiện tại
    this.items.forEach(item => {
      if (this.intersects(item.bounds, range)) {
        found.add(item.entity);
      }
    });

    // Thu thập từ các node con
    if (this.children) {
      this.children.forEach(child => {
        child.query(range, found);
      });
    }

    return Array.from(found);
  }

  // Xóa sạch Quadtree
  public clear() {
    this.items = [];
    if (this.children) {
      this.children.forEach(child => child.clear());
      this.children = null;
    }
  }
}

// Cache Bounding Box của block (tính 1 lần cho mỗi block object)
const blockBoundsCache = new WeakMap<object, BoundingBox | null>();

const MAX_BOUNDS_DEPTH = 8;

// Hàm phụ trợ tính toán Bounding Box cho từng thực thể DXF đơn lẻ.
// Truyền `blocks` (dxfData.blocks) để tính đúng bounds cho INSERT/DIMENSION.
export const getEntityBounds = (entity: any, blocks?: any, depth: number = 0): BoundingBox => {
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  const update = (x: number, y: number) => {
    if (x < minX) minX = x;
    if (x > maxX) maxX = x;
    if (y < minY) minY = y;
    if (y > maxY) maxY = y;
  };

  // 1. Line / Lwpolyline / Polyline
  if ((entity.type === 'LINE' || entity.type === 'LWPOLYLINE' || entity.type === 'POLYLINE') && entity.vertices) {
    entity.vertices.forEach((v: any) => update(v.x, v.y));
  }
  // 2. Circle / Arc
  else if ((entity.type === 'CIRCLE' || entity.type === 'ARC') && entity.center && entity.radius !== undefined) {
    const r = entity.radius;
    update(entity.center.x - r, entity.center.y - r);
    update(entity.center.x + r, entity.center.y + r);
  }
  // 3. Ellipse
  else if (entity.type === 'ELLIPSE' && entity.center && entity.majorAxisEndPoint) {
    const majLen = Math.sqrt(
      entity.majorAxisEndPoint.x ** 2 + entity.majorAxisEndPoint.y ** 2
    );
    update(entity.center.x - majLen, entity.center.y - majLen);
    update(entity.center.x + majLen, entity.center.y + majLen);
  }
  // 4. Spline
  else if (entity.type === 'SPLINE') {
    const pts = entity.controlPoints || entity.fitPoints || [];
    pts.forEach((p: any) => update(p.x, p.y));
  }
  // 5. Solid / 3DFace
  else if ((entity.type === 'SOLID' || entity.type === '3DFACE') && entity.points) {
    entity.points.forEach((p: any) => update(p.x, p.y));
  }
  // 6. Insert (block reference): khai triển bounds block qua ma trận đặt block
  else if (entity.type === 'INSERT' && blocks && depth < MAX_BOUNDS_DEPTH) {
    const block = blocks[entity.name];
    const blockBounds = block ? getBlockBounds(block, blocks, depth + 1) : null;

    if (blockBounds) {
      const base = block.position || { x: 0, y: 0 };
      const sx = entity.xScale ?? 1;
      const sy = entity.yScale ?? 1;
      const rot = ((entity.rotation ?? 0) * Math.PI) / 180;
      const cos = Math.cos(rot);
      const sin = Math.sin(rot);
      const px = entity.position?.x ?? 0;
      const py = entity.position?.y ?? 0;

      const cols = Math.max(1, entity.columnCount || 1);
      const rows = Math.max(1, entity.rowCount || 1);
      const colSp = entity.columnSpacing || 0;
      const rowSp = entity.rowSpacing || 0;

      // Biến đổi 4 góc bbox của block (+ offset mảng hàng/cột) sang WCS
      const corners = [
        { x: blockBounds.minX, y: blockBounds.minY },
        { x: blockBounds.maxX, y: blockBounds.minY },
        { x: blockBounds.minX, y: blockBounds.maxY },
        { x: blockBounds.maxX, y: blockBounds.maxY }
      ];
      const cells = [
        { ox: 0, oy: 0 },
        { ox: (cols - 1) * colSp, oy: (rows - 1) * rowSp }
      ];

      cells.forEach(cell => {
        corners.forEach(cn => {
          const lx = cn.x + cell.ox - base.x;
          const ly = cn.y + cell.oy - base.y;
          update(px + (cos * sx) * lx + (-sin * sy) * ly, py + (sin * sx) * lx + (cos * sy) * ly);
        });
      });
    } else if (entity.position) {
      update(entity.position.x - 10, entity.position.y - 10);
      update(entity.position.x + 10, entity.position.y + 10);
    }
  }
  // 7. Dimension: hình học nằm trong block ẩn danh ở WCS
  else if (entity.type === 'DIMENSION' && blocks && entity.block && depth < MAX_BOUNDS_DEPTH) {
    const block = blocks[entity.block];
    const blockBounds = block ? getBlockBounds(block, blocks, depth + 1) : null;
    if (blockBounds) {
      update(blockBounds.minX, blockBounds.minY);
      update(blockBounds.maxX, blockBounds.maxY);
    } else {
      const pt = entity.anchorPoint || entity.middleOfText;
      if (pt) { update(pt.x - 10, pt.y - 10); update(pt.x + 10, pt.y + 10); }
    }
  }
  // 8. Text / Mtext / Point / khác
  else {
    const pt = entity.position || entity.startPoint || entity.insertionPoint;
    if (pt && pt.x !== undefined && pt.y !== undefined) {
      // Ước lượng chiều rộng chữ theo chiều cao + số ký tự
      const h = entity.textHeight ?? entity.height ?? 10;
      const w = entity.text ? h * 0.7 * String(entity.text).length : h;
      update(pt.x - h, pt.y - h);
      update(pt.x + Math.max(w, h), pt.y + h);
    }
  }

  // Fallback nếu không có tọa độ hợp lệ
  if (minX === Infinity) {
    return { minX: 0, maxX: 1, minY: 0, maxY: 1 };
  }

  return { minX, maxX, minY, maxY };
};

// Bounding Box hợp nhất của toàn bộ entity trong một block (có cache)
function getBlockBounds(block: any, blocks: any, depth: number): BoundingBox | null {
  if (blockBoundsCache.has(block)) {
    return blockBoundsCache.get(block) || null;
  }

  if (!block.entities || block.entities.length === 0 || depth >= MAX_BOUNDS_DEPTH) {
    blockBoundsCache.set(block, null);
    return null;
  }

  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
  block.entities.forEach((child: any) => {
    const b = getEntityBounds(child, blocks, depth + 1);
    if (b.minX < minX) minX = b.minX;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxY > maxY) maxY = b.maxY;
  });

  const result = minX === Infinity ? null : { minX, maxX, minY, maxY };
  blockBoundsCache.set(block, result);
  return result;
}

// Bounding Box của toàn bộ bản vẽ (dùng cho fit-view)
export const getDrawingBounds = (dxfData: any): BoundingBox | null => {
  if (!dxfData?.entities || dxfData.entities.length === 0) return null;

  const blocks = dxfData.blocks || {};
  let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;

  dxfData.entities.forEach((entity: any) => {
    const b = getEntityBounds(entity, blocks);
    // Bỏ qua bounds fallback (0,0,1,1) của entity không có tọa độ
    if (b.minX === 0 && b.maxX === 1 && b.minY === 0 && b.maxY === 1) return;
    if (b.minX < minX) minX = b.minX;
    if (b.maxX > maxX) maxX = b.maxX;
    if (b.minY < minY) minY = b.minY;
    if (b.maxY > maxY) maxY = b.maxY;
  });

  if (minX === Infinity) return null;
  return { minX, maxX, minY, maxY };
};
