// Web Worker phân tích file DXF — tránh treo main thread với bản vẽ lớn
import { DxfParser } from 'dxf-parser';

self.onmessage = (e: MessageEvent<string>) => {
  try {
    const parser = new DxfParser();
    const parsed = parser.parseSync(e.data);
    if (!parsed || !parsed.entities) {
      self.postMessage({ ok: false, error: 'Dữ liệu bản vẽ không hợp lệ hoặc bị trống.' });
      return;
    }
    self.postMessage({ ok: true, data: parsed });
  } catch (err: any) {
    self.postMessage({
      ok: false,
      error: err?.message || 'Không thể đọc file DXF này. Vui lòng kiểm tra lại định dạng.'
    });
  }
};
