/**
 * In Lịch Công Tác Tuần — Chuẩn Thể thức Văn bản Hành chính Viện KHCN Xây dựng (IBST).
 *
 * Định dạng:
 * - Khổ giấy: A4 Ngang (Landscape)
 * - Font: Times New Roman
 * - Cấu trúc: Tiêu đề cơ quan (Góc trái: VIỆN KHCN XÂY DỰNG), Tiêu đề chính (LỊCH CÔNG TÁC TUẦN, Từ ngày... đến ngày...)
 * - Bảng Ma trận Ban Giám đốc: Cột 1 (Thứ/Ngày), Cột 2 (VIỆN TRƯỞNG), Cột 3-5 (PHÓ VIỆN TRƯỞNG: ĐINH QUỐC DÂN, NGUYỄN THANH BÌNH, CAO DUY KHÔI)
 * - Từng ô: Sáng (S:), Chiều (C:)
 * - Chân trang: Ghi chú tuần
 */

import type { LichCongTac } from '../pages/LichCoQuanPage';

export interface PrintLichTuanDay {
  dateStr: string;
  thuLabel: string;
  ngayLabel: string;
}

export interface PrintLichTuanLeader {
  key: string;
  title: string;
}

export interface PrintLichTuanData {
  weekRangeLabel: string;
  days: PrintLichTuanDay[];
  leaders: PrintLichTuanLeader[];
  events: LichCongTac[];
  ghiChu?: string;
}

function esc(s: string | null | undefined): string {
  return (s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function printLichTuanMatrix(data: PrintLichTuanData) {
  const { weekRangeLabel, days, leaders, events, ghiChu } = data;

  const w = window.open('', '_blank', 'width=1100,height=800');
  if (!w) {
    alert('Trình duyệt đã chặn cửa sổ pop-up in. Vui lòng cho phép pop-up để in lịch.');
    return;
  }

  const rowsHtml = days
    .map((d) => {
      const dayEvents = events.filter((e) => e.ngay === d.dateStr);

      const leaderColsHtml = leaders
        .map((l) => {
          // Lọc sự kiện theo leader (hỗ trợ cả cotMaTran và chuTri)
          const colEvents = dayEvents.filter((e) => {
            if (e.cotMaTran) {
              if (l.key === 'vientruong' && e.cotMaTran === 'vien_truong') return true;
              if (l.key === 'dan' && e.cotMaTran === 'dan') return true;
              if (l.key === 'binh' && e.cotMaTran === 'binh') return true;
              if (l.key === 'khoi' && e.cotMaTran === 'khoi') return true;
              if (e.cotMaTran !== 'khac') return false;
            }
            const chuTri = (e.chuTri || '').toLowerCase();
            if (l.key === 'vientruong') {
              return (chuTri.includes('viện trưởng') && !chuTri.includes('phó')) || chuTri.includes('nguyễn hồng hải');
            }
            if (l.key === 'dan') {
              return chuTri.includes('dân') || chuTri.includes('đinh quốc dân');
            }
            if (l.key === 'binh') {
              return chuTri.includes('bình') || chuTri.includes('nguyễn thanh bình');
            }
            if (l.key === 'khoi') {
              return chuTri.includes('khôi') || chuTri.includes('cao duy khôi');
            }
            return false;
          });

          const morningEvents = colEvents.filter((e) => {
            const h = parseInt((e.gio || '08:00').split(':')[0], 10);
            return h < 12;
          });

          const afternoonEvents = colEvents.filter((e) => {
            const h = parseInt((e.gio || '14:00').split(':')[0], 10);
            return h >= 12;
          });

          const morningHtml = morningEvents
            .map((e) => {
              const tpContent = e.donViChuanBi || e.thanhPhan;
              const tp = tpContent ? ` (${esc(tpContent)})` : '';
              const dd = e.diaDiem ? ` - [${esc(e.diaDiem)}]` : '';
              return `<div class="event-line"><b>S:</b> ${esc(e.gio)} ${esc(e.noiDung)}${tp}${dd}</div>`;
            })
            .join('');

          const afternoonHtml = afternoonEvents
            .map((e) => {
              const tpContent = e.donViChuanBi || e.thanhPhan;
              const tp = tpContent ? ` (${esc(tpContent)})` : '';
              const dd = e.diaDiem ? ` - [${esc(e.diaDiem)}]` : '';
              return `<div class="event-line"><b>C:</b> ${esc(e.gio)} ${esc(e.noiDung)}${tp}${dd}</div>`;
            })
            .join('');

          return `
            <td class="cell-content">
              ${morningHtml}
              ${afternoonHtml}
            </td>
          `;
        })
        .join('');

      return `
        <tr>
          <td class="cell-date">
            <div class="day-thu">${esc(d.thuLabel)}</div>
            <div class="day-ngay">${esc(d.ngayLabel)}</div>
          </td>
          ${leaderColsHtml}
        </tr>
      `;
    })
    .join('');

  const html = `<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="utf-8" />
  <title>Lịch công tác tuần IBST - ${esc(weekRangeLabel)}</title>
  <style>
    @page {
      size: A4 landscape;
      margin: 10mm 12mm 10mm 12mm;
    }
    * {
      box-sizing: border-box;
      margin: 0;
      padding: 0;
      font-family: 'Times New Roman', Times, serif;
    }
    body {
      color: #000;
      background: #fff;
      padding: 8px 12px;
      font-size: 11pt;
      line-height: 1.3;
    }
    .header-box {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      margin-bottom: 8px;
    }
    .agency-name {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    .title-box {
      text-align: center;
      flex: 1;
      margin-right: 140px;
    }
    .title-main {
      font-size: 14pt;
      font-weight: bold;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    .title-sub {
      font-size: 11pt;
      font-style: italic;
      margin-top: 2px;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-top: 6px;
      table-layout: fixed;
    }
    th, td {
      border: 1px solid #000;
      vertical-align: top;
      padding: 6px 8px;
      word-wrap: break-word;
    }
    th {
      font-size: 11pt;
      font-weight: bold;
      text-align: center;
      background-color: #f7f7f7;
    }
    .col-date {
      width: 75px;
      text-align: center;
    }
    .col-vt {
      width: 25%;
    }
    .col-pvt {
      width: 23%;
    }
    .cell-date {
      text-align: center;
      vertical-align: middle;
      font-weight: bold;
      padding: 8px 2px;
    }
    .day-thu {
      font-size: 11pt;
      font-weight: bold;
    }
    .day-ngay {
      font-size: 10.5pt;
      margin-top: 2px;
    }
    .cell-content {
      font-size: 10pt;
      line-height: 1.35;
    }
    .event-line {
      margin-bottom: 5px;
    }
    .event-line:last-child {
      margin-bottom: 0;
    }
    .event-line b {
      font-weight: bold;
    }
    .notes-section {
      margin-top: 10px;
      font-size: 10.5pt;
      line-height: 1.4;
    }
    .notes-title {
      font-weight: bold;
      text-decoration: underline;
    }
    @media print {
      body {
        padding: 0;
      }
      .no-print {
        display: none !important;
      }
    }
  </style>
</head>
<body>
  <div class="header-box">
    <div class="agency-name">VIỆN KHCN XÂY DỰNG</div>
    <div class="title-box">
      <div class="title-main">LỊCH CÔNG TÁC TUẦN</div>
      <div class="title-sub">${esc(weekRangeLabel)}</div>
    </div>
  </div>

  <table>
    <thead>
      <tr>
        <th rowspan="2" class="col-date">Thứ<br/>Ngày</th>
        <th rowspan="2" class="col-vt">VIỆN TRƯỞNG</th>
        <th colspan="3">PHÓ VIỆN TRƯỞNG</th>
      </tr>
      <tr>
        <th class="col-pvt">ĐINH QUỐC DÂN</th>
        <th class="col-pvt">NGUYỄN THANH BÌNH</th>
        <th class="col-pvt">CAO DUY KHÔI</th>
      </tr>
    </thead>
    <tbody>
      ${rowsHtml}
    </tbody>
  </table>

  <div class="notes-section">
    <span class="notes-title">Ghi chú:</span>
    <span>${esc(ghiChu || 'Không có ghi chú thêm.')}</span>
  </div>

  <script>
    window.onload = function() {
      window.print();
    };
  </script>
</body>
</html>`;

  w.document.open();
  w.document.write(html);
  w.document.close();
}
