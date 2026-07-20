export interface Point2D {
  x: number;
  y: number;
}

export class CoordinateTransform {
  public scale: number = 1;
  public panX: number = 0; // offset x (screen pixel)
  public panY: number = 0; // offset y (screen pixel)
  public centerCAD: Point2D = { x: 0, y: 0 };
  public centerScreen: Point2D = { x: 0, y: 0 };

  constructor(
    centerCAD: Point2D,
    centerScreen: Point2D,
    scale: number,
    panX: number,
    panY: number
  ) {
    this.centerCAD = centerCAD;
    this.centerScreen = centerScreen;
    this.scale = scale;
    this.panX = panX;
    this.panY = panY;
  }

  /**
   * Chuyển đổi tọa độ từ hệ CAD (Y hướng lên) sang hệ Màn hình (Y hướng xuống)
   */
  public cadToScreen(x: number, y: number): Point2D {
    const screenX = (x - this.centerCAD.x) * this.scale + this.centerScreen.x + this.panX;
    const screenY = this.centerScreen.y - (y - this.centerCAD.y) * this.scale + this.panY;
    return { x: screenX, y: screenY };
  }

  /**
   * Chuyển đổi ngược từ tọa độ Màn hình (pixel) sang tọa độ CAD
   */
  public screenToCad(x: number, y: number): Point2D {
    const cadX = (x - this.centerScreen.x - this.panX) / this.scale + this.centerCAD.x;
    const cadY = (this.centerScreen.y + this.panY - y) / this.scale + this.centerCAD.y;
    return { x: cadX, y: cadY };
  }

  /**
   * Chuyển đổi chiều dài/khoảng cách từ CAD sang pixel màn hình
   */
  public cadToScreenLength(len: number): number {
    return len * this.scale;
  }

  /**
   * Chuyển đổi chiều dài/khoảng cách từ pixel màn hình sang đơn vị CAD
   */
  public screenToCadLength(len: number): number {
    return len / this.scale;
  }
}
