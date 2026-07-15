import type { MauThiNghiem } from '../types';
import type { KetQuaPhepThu } from '../services/chitiet';
import { formatNgay } from './utils';

/** Mở cửa sổ in phiếu kết quả thí nghiệm LAS-XD. */
export function printPhieuKetQua(mau: MauThiNghiem, ketQua: KetQuaPhepThu[]) {
  const rows = ketQua
    .map(
      (k, i) => `
      <tr>
        <td style="text-align:center">${i + 1}</td>
        <td>${esc(k.tenChiTieu)}</td>
        <td style="text-align:center">${esc(k.donViTinh) || '—'}</td>
        <td style="text-align:center">${esc(k.yeuCau) || '—'}</td>
        <td style="text-align:center"><b>${esc(k.ketQua) || '—'}</b></td>
        <td style="text-align:center">${k.dat === null ? '—' : k.dat ? 'Đạt' : 'Không đạt'}</td>
      </tr>`,
    )
    .join('');

  const html = `<!doctype html><html lang="vi"><head><meta charset="utf-8">
  <title>Phiếu kết quả ${esc(mau.maPhieu)}</title>
  <style>
    * { font-family: 'Times New Roman', serif; box-sizing: border-box; }
    body { margin: 32px; color: #000; font-size: 13pt; }
    .head { display:flex; justify-content:space-between; align-items:flex-start; }
    .head .l { text-align:center; font-size:11pt; line-height:1.35; }
    .head .l .b { font-weight:bold; text-transform:uppercase; }
    .head .l .u { text-decoration: underline; }
    h1 { text-align:center; font-size:16pt; margin:24px 0 4px; text-transform:uppercase; }
    .sub { text-align:center; font-style:italic; margin-bottom:20px; }
    .info { margin: 4px 0; }
    table { width:100%; border-collapse: collapse; margin-top:12px; }
    th, td { border:1px solid #000; padding:6px 8px; font-size:12pt; }
    th { background:#f0f0f0; }
    .sign { display:flex; justify-content:space-around; margin-top:48px; text-align:center; }
    .sign .role { font-weight:bold; }
    .sign .note { font-style:italic; font-size:11pt; }
    @media print { body { margin:0; } }
  </style></head><body>
    <div class="head">
      <div class="l">
        <div class="b">Viện Khoa học Công nghệ Xây dựng</div>
        <div class="b u">${esc(mau.phongThiNghiem)}</div>
      </div>
      <div class="l">
        <div class="b">Cộng hòa xã hội chủ nghĩa Việt Nam</div>
        <div class="b u">Độc lập - Tự do - Hạnh phúc</div>
      </div>
    </div>
    <h1>Phiếu kết quả thí nghiệm</h1>
    <div class="sub">Số phiếu: ${esc(mau.maPhieu)}</div>
    <div class="info"><b>Tên mẫu:</b> ${esc(mau.tenMau)}</div>
    <div class="info"><b>Phép thử:</b> ${esc([mau.phepThu, mau.tieuChuan].filter(Boolean).join(' '))}</div>
    <div class="info"><b>Khách hàng:</b> ${esc(mau.khachHang)}</div>
    <div class="info"><b>Ngày nhận mẫu:</b> ${mau.ngayNhan ? formatNgay(mau.ngayNhan) : '—'} &nbsp;&nbsp; <b>Ngày trả:</b> ${mau.hanTra ? formatNgay(mau.hanTra) : '—'}</div>
    <table>
      <thead><tr>
        <th style="width:6%">TT</th><th>Chỉ tiêu thí nghiệm</th><th style="width:12%">Đơn vị</th>
        <th style="width:16%">Yêu cầu</th><th style="width:14%">Kết quả</th><th style="width:14%">Đánh giá</th>
      </tr></thead>
      <tbody>${rows || '<tr><td colspan="6" style="text-align:center;font-style:italic">Chưa có kết quả</td></tr>'}</tbody>
    </table>
    <div class="sign">
      <div><div class="role">Người thí nghiệm</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
      <div><div class="role">Người kiểm tra</div><div class="note">(Ký, ghi rõ họ tên)</div></div>
      <div><div class="role">Trưởng phòng thí nghiệm</div><div class="note">(Ký, đóng dấu)</div></div>
    </div>
  </body></html>`;

  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

function esc(s: string): string {
  return (s ?? '').replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}
