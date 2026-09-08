/**
 * In Phiếu Đề Nghị Giao Việc HĐKT — format chuẩn NĐ 30/2020/NĐ-CP.
 *
 * NĐ 30 quy định format văn bản hành chính:
 *   - Font: Times New Roman 13pt (body), 12-13pt (header)
 *   - Lề: trái 30-35mm, phải 15-20mm, trên 20-25mm, dưới 20-25mm
 *   - Header: Cơ quan chủ quản (13pt in hoa) / Cơ quan ban hành (13pt in hoa, đậm, gạch dưới)
 *   - Quốc hiệu: 13pt in hoa, đậm / Tiêu ngữ: 13-14pt in hoa, đậm, gạch dưới
 *   - Số, ký hiệu: bên trái, ngay dưới cơ quan ban hành
 *   - Ngày tháng: bên phải, ngay dưới tiêu ngữ
 *   - Tên loại VB: 14pt in hoa, đậm
 *
 * Module này export:
 *   - `sinhHtmlPhieuGiaoViec()` → HTML string (dùng cho cả preview UI và print)
 *   - `printPhieuGiaoViec()` → Mở window + print
 */

import type { HopDong } from '../types';
import type { PhieuGiaoViec, CtvGiaoViec, DonViGiaoViec } from '../services/chitiet';
import { formatNgay, formatVNNumber } from './utils';
import { timDinhMuc, phanBoHopDong, type NhomHD } from './qc2815';

// ─── Kiểu dữ liệu đầu vào ───

export interface PrintGiaoViecData {
  hd: HopDong;
  phieu: PhieuGiaoViec;
  dsCTV: CtvGiaoViec[];
  dsDonVi: DonViGiaoViec[];
}

// ─── Helpers ───

function esc(s: string | null | undefined): string {
  return (s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function ngayHomNay(): { ngay: string; thang: string; nam: string } {
  const d = new Date();
  return {
    ngay: String(d.getDate()).padStart(2, '0'),
    thang: String(d.getMonth() + 1).padStart(2, '0'),
    nam: String(d.getFullYear()),
  };
}

/** Chuyển triệu đồng → chuỗi VNĐ đầy đủ: 4.000 (triệu) → "4.000.000.000" */
function trieu2Vnd(trieu: number): string {
  if (!trieu) return '0';
  return formatVNNumber(String(trieu * 1_000_000));
}

// ─── CSS chuẩn NĐ 30/2020/NĐ-CP ───

const ND30_CSS = `
  * {
    font-family: 'Times New Roman', 'Tinos', serif;
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }
  body {
    color: #000;
    font-size: 14pt;
    line-height: 1.5;
    /* NĐ 30: Lề trên/dưới 20-25mm, trái 30-35mm, phải 15-20mm */
    margin: 20mm 20mm 20mm 30mm;
  }

  /* ═══ HEADER ═══ */
  .header-table {
    width: 100%;
    border-collapse: collapse;
    margin-bottom: 4px;
  }
  .header-table td {
    vertical-align: top;
    padding: 0;
  }
  .header-left {
    width: 40%;
    text-align: center;
  }
  .header-right {
    width: 60%;
    text-align: center;
  }

  /* NĐ 30, Phụ lục I: Cơ quan chủ quản 12-13pt, in hoa */
  .co-quan-chu-quan {
    font-size: 12pt;
    text-transform: uppercase;
  }
  /* NĐ 30: Cơ quan ban hành 12-13pt, in hoa, đậm */
  .co-quan-ban-hanh {
    font-size: 13pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  /* Gạch ngang dưới tên cơ quan ban hành — NĐ 30 quy định đường kẻ ngang */
  .gach-ngang-header {
    display: block;
    width: 60px;
    border-bottom: 1px solid #000;
    margin: 2px auto 4px;
  }

  /* NĐ 30: Quốc hiệu 12-13pt, in hoa, đậm */
  .quoc-hieu {
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
  }
  /* NĐ 30: Tiêu ngữ 13-14pt, in hoa, đậm, gạch dưới */
  .tieu-ngu {
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    /* Gạch ngang dưới tiêu ngữ — không dùng text-decoration vì NĐ 30 yêu cầu đường kẻ liền */
  }
  .gach-ngang-tieu-ngu {
    display: block;
    width: 160px;
    border-bottom: 1px solid #000;
    margin: 2px auto 4px;
  }

  /* Số phiếu bên trái */
  .so-phieu {
    font-size: 13pt;
    text-align: center;
    margin: 2px 0 0 0;
  }
  /* Ngày tháng bên phải, NĐ 30: 13-14pt, nghiêng */
  .ngay-thang {
    text-align: center;
    font-size: 13pt;
    font-style: italic;
    margin: 2px 0 0 0;
  }

  /* ═══ TIÊU ĐỀ ═══ */
  /* NĐ 30: Tên loại VB 14pt, in hoa, đậm */
  h1 {
    text-align: center;
    font-size: 14pt;
    font-weight: bold;
    text-transform: uppercase;
    margin: 12px 0 10px;
  }

  /* ═══ NỘI DUNG ═══ */
  /* NĐ 30: Phần nội dung 13-14pt */
  .can-cu {
    font-size: 13pt;
    margin: 0 0 3px 0;
    text-indent: 28px;
    text-align: justify;
  }
  .noi-dung {
    font-size: 13pt;
    margin: 4px 0;
    text-indent: 28px;
    text-align: justify;
  }

  .muc {
    font-size: 13pt;
    margin: 6px 0 2px 0;
    text-indent: 28px;
    text-align: justify;
  }
  .muc-con {
    font-size: 13pt;
    margin: 1px 0 1px 56px;
  }

  .ds-ctv {
    column-count: 2;
    column-gap: 20px;
    margin: 3px 0 3px 56px;
    font-size: 13pt;
  }
  .ds-ctv .ten { margin: 1px 0; }

  /* ═══ BẢNG CHỮ KÝ ═══ */
  .sign-table {
    width: 100%;
    margin-top: 28px;
    border-collapse: collapse;
  }
  .sign-table td {
    text-align: center;
    vertical-align: top;
    padding: 2px 4px;
    font-size: 12pt;
  }
  .sign-table .role {
    font-weight: bold;
    font-size: 12pt;
  }
  .sign-table .name-space {
    height: 60px;
  }
  .sign-table .note {
    font-style: italic;
    font-size: 11pt;
  }

  .bold { font-weight: bold; }
  .italic { font-style: italic; }

  /* ═══ IN ẤN ═══ */
  @media print {
    body { margin: 0; }
    @page {
      size: A4;
      /* NĐ 30: trên 20-25mm, dưới 20-25mm, trái 30-35mm, phải 15-20mm */
      margin: 20mm 20mm 20mm 30mm;
    }
  }

  /* ═══ PREVIEW MODE (trong iframe) ═══ */
  body.preview-mode {
    margin: 16px 20px;
    font-size: 12pt;
  }
  body.preview-mode .co-quan-chu-quan { font-size: 10pt; }
  body.preview-mode .co-quan-ban-hanh { font-size: 11pt; }
  body.preview-mode .quoc-hieu { font-size: 10pt; }
  body.preview-mode .tieu-ngu { font-size: 12pt; }
  body.preview-mode .so-phieu { font-size: 11pt; }
  body.preview-mode .ngay-thang { font-size: 11pt; }
  body.preview-mode h1 { font-size: 12pt; margin: 8px 0 6px; }
  body.preview-mode .can-cu,
  body.preview-mode .noi-dung,
  body.preview-mode .muc,
  body.preview-mode .muc-con { font-size: 11pt; }
  body.preview-mode .ds-ctv { font-size: 11pt; }
  body.preview-mode .sign-table td { font-size: 10pt; }
  body.preview-mode .sign-table .name-space { height: 40px; }
`;

// ─── Sinh HTML nội dung phiếu (dùng chung cho preview + print) ───

export function sinhHtmlPhieuGiaoViec(data: PrintGiaoViecData, opts?: { preview?: boolean }): string {
  const { hd, phieu, dsCTV, dsDonVi } = data;
  const hnn = ngayHomNay();
  const isPreview = opts?.preview ?? false;

  // Đơn vị chủ trì & phối hợp
  const dvChuTri = dsDonVi.find((d) => d.vaiTro === 'chu-tri');
  const dvPhoiHop = dsDonVi.filter((d) => d.vaiTro === 'phoi-hop');
  const tenDvChuTri = dvChuTri?.tenDonVi || hd.donViThucHien || '';

  // Ngày ký
  const ngayKy = hd.ngayKy ? formatNgay(hd.ngayKy) : '.../.../....';

  // Định mức + phân bổ
  const dm = timDinhMuc(hd.nhomHD);
  const nhomLabel = dm ? `Nhóm ${dm.nhom}` : '';
  const mucKhoan = dm?.tongGiaoDonVi != null ? `${dm.tongGiaoDonVi}%` : '...%';

  // Giá trị HĐ → VNĐ
  const giaTriVnd = trieu2Vnd(hd.giaTri);

  // Phân bổ sản lượng — dùng tên đơn vị gốc
  let phanBoStr = '';
  if (dsDonVi.length > 0) {
    const parts = dsDonVi.map((d) => `${esc(d.tenDonVi)} ${d.tyLeGiaTri}%`);
    phanBoStr = parts.join(', ');
  }

  // CTV 2 cột
  const ctvHtml = dsCTV.length > 0
    ? dsCTV.map((c) => `<div class="ten">– ${esc(c.hoTen)}</div>`).join('')
    : '<div class="ten italic">Chưa bổ sung</div>';

  // Đơn vị phối hợp
  const dvPhHtml = dvPhoiHop
    .map((d, i) => `<div class="muc-con">Đơn vị phối hợp ${i + 1}: ${esc(d.tenDonVi)}</div>`)
    .join('');

  // Số phiếu
  const soPhieu = hd.soHD || '...';

  // ═══ BẢNG CHỮ KÝ ═══
  // Mẫu gốc: Trưởng ĐV chủ trì | ĐV phối hợp 1-3 | VIỆN DUYỆT (5 cột ngang hàng)
  const signCells: string[] = [];

  signCells.push(`<td>
    <div class="role">Trưởng đơn vị<br/>chủ trì</div>
    <div class="note">(tỷ lệ ${dvChuTri?.tyLeGiaTri ?? 100}%)</div>
    <div class="name-space"></div>
  </td>`);

  for (let i = 0; i < 3; i++) {
    const dv = dvPhoiHop[i];
    signCells.push(`<td>
      <div class="role">Trưởng đơn vị<br/>phối hợp ${i + 1}</div>
      <div class="note">(tỷ lệ ${dv ? `${dv.tyLeGiaTri}%` : '...%'})</div>
      <div class="name-space"></div>
    </td>`);
  }

  signCells.push(`<td>
    <div class="role">VIỆN DUYỆT</div>
    <div class="note">&nbsp;</div>
    <div class="name-space"></div>
  </td>`);

  // ═══ HTML ═══
  return `<!doctype html><html lang="vi"><head><meta charset="utf-8">
<title>Phiếu đề nghị giao việc — ${esc(hd.soHD || hd.ten)}</title>
<style>${ND30_CSS}</style></head>
<body${isPreview ? ' class="preview-mode"' : ''}>

<!-- HEADER — NĐ 30/2020/NĐ-CP, Phụ lục I, Mục 1 -->
<table class="header-table">
  <tr>
    <td class="header-left">
      <div class="co-quan-chu-quan">BỘ XÂY DỰNG</div>
      <div class="co-quan-ban-hanh">VIỆN KHCN XÂY DỰNG</div>
      <span class="gach-ngang-header"></span>
      <div class="so-phieu">Số: ${esc(soPhieu)}</div>
    </td>
    <td class="header-right">
      <div class="quoc-hieu">CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM</div>
      <div class="tieu-ngu">Độc lập - Tự do - Hạnh phúc</div>
      <span class="gach-ngang-tieu-ngu"></span>
      <div class="ngay-thang"><i>Hà Nội, ngày ${hnn.ngay} tháng ${hnn.thang} năm ${hnn.nam}</i></div>
    </td>
  </tr>
</table>

<!-- TIÊU ĐỀ — NĐ 30, Mục 4: 14pt, in hoa, đậm -->
<h1>Phiếu đề nghị giao việc</h1>

<!-- CĂN CỨ -->
<div class="can-cu">– Căn cứ vào Quy chế thực hiện nhiệm vụ khoa học công nghệ và triển khai dịch vụ kỹ thuật hiện hành của Viện.</div>
<div class="can-cu">– Đơn vị thực hiện: ${esc(tenDvChuTri)}</div>

<!-- NỘI DUNG ĐỀ NGHỊ -->
<div class="noi-dung">
  Đề nghị Viện giao việc thực hiện HĐKT số <b>${esc(hd.soHD || '...')}</b> ký ngày <b>${ngayKy}</b> giữa ${esc(hd.khachHang || '...')} về việc: ${esc(phieu.noiDung || hd.ten || '...')} như sau:
</div>

<!-- 1. ĐƠN VỊ CHỦ TRÌ & PHỐI HỢP -->
<div class="muc"><b>1.</b> Đơn vị chủ trì thực hiện: <b>${esc(tenDvChuTri)}</b></div>
${dvPhHtml ? `<div class="muc-con">Các đơn vị phối hợp:</div>${dvPhHtml}` : ''}

<!-- 2. NHÂN SỰ -->
<div class="muc"><b>2.</b> Người chủ trì hợp đồng: <b>${esc(hd.chuTri || '...')}</b></div>
<div class="muc-con">Chủ trì kỹ thuật theo công việc: <b>${esc(phieu.chuTriKyThuat || '...')}</b></div>
<div class="muc-con">Phụ trách tài chính (nếu có): ..................................................................</div>
<div class="muc-con" style="margin-top:4px">Các cán bộ cộng tác chính:</div>
<div class="ds-ctv">${ctvHtml}</div>
<div class="muc-con italic" style="margin-top:3px">Các cộng tác viên khác do Trưởng ĐV và chủ trì HĐ bổ sung trong quá trình thực hiện.</div>

<!-- 3. TRÁCH NHIỆM -->
<div class="muc"><b>3.</b> Trưởng đơn vị, chủ trì hợp đồng và chủ trì kỹ thuật chịu trách nhiệm về chất lượng, khối lượng, tiến độ thực hiện, an toàn lao động, hồ sơ lưu trữ và chứng từ thanh quyết toán thực hiện hợp đồng theo quy chế của Viện và quy định của pháp luật.</div>

<!-- 4. PHÂN NHÓM -->
<div class="muc"><b>4.</b> Nhóm, loại, cấp công trình: ${esc(dm?.ten || '...')}, ${esc(nhomLabel)}</div>

<!-- 5. GIÁ TRỊ -->
<div class="muc"><b>5.</b> Giá trị dự toán của HĐ: <b>${giaTriVnd} VNĐ</b></div>
<div class="muc-con">– Mức khoán thực hiện theo quy chế hiện hành của Viện: <b>Nd: ${mucKhoan}</b></div>
${phanBoStr ? `<div class="muc-con">– Phân bổ sản lượng cho các đơn vị tham gia: ${esc(phanBoStr)}</div>` : ''}

<!-- 6. CHỦ TRÌ HĐ KÝ -->
<div class="muc"><b>6.</b> Chủ trì hợp đồng (ký, ghi rõ họ tên): .......................... <b>${esc(hd.chuTri || '...')}</b></div>

<!-- BẢNG CHỮ KÝ -->
<table class="sign-table">
  <tr>${signCells.join('')}</tr>
</table>

</body></html>`;
}

// ─── Hàm in (mở window mới) ───

export function printPhieuGiaoViec(data: PrintGiaoViecData) {
  const html = sinhHtmlPhieuGiaoViec(data);
  const w = window.open('', '_blank', 'width=960,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
