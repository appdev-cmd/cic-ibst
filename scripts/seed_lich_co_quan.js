import fs from 'fs';

const envText = fs.readFileSync('.env', 'utf8');
let token = '';
let projectRef = 'umvckjqseqawpqamvsbx';

envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p[0]?.trim() === 'SUPABASE_ACCESS_TOKEN') token = p.slice(1).join('=').trim();
  if (p[0]?.trim() === 'SUPABASE_PROJECT_ID') projectRef = p.slice(1).join('=').trim();
});

async function runQuery(sql) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${projectRef}/database/query`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ query: sql }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Query failed: ${err}`);
  }
  return res.json();
}

async function main() {
  console.log('--- Đang lấy danh mục phòng họp & xe... ---');
  const phongHops = await runQuery('select id, ten_phong from dm_phong_hop;');
  const xeList = await runQuery('select id, bien_so from dm_xe_cong_tac;');

  const mapPhong = {};
  phongHops.forEach((p) => {
    mapPhong[p.ten_phong] = p.id;
  });

  const mapXe = {};
  xeList.forEach((x) => {
    mapXe[x.bien_so] = x.id;
  });

  // Đọc file LichCoQuanPage.tsx để trích xuất INITIAL_LICH
  const pageCode = fs.readFileSync('src/pages/LichCoQuanPage.tsx', 'utf8');
  const startMarker = 'const INITIAL_LICH: LichCongTac[] = [';
  const endMarker = '];\n\nconst DAYS_OF_WEEK';
  const sIdx = pageCode.indexOf(startMarker);
  const eIdx = pageCode.indexOf(endMarker, sIdx);

  if (sIdx === -1 || eIdx === -1) {
    console.error('Không tìm thấy INITIAL_LICH trong LichCoQuanPage.tsx');
    process.exit(1);
  }

  const arrayStr = pageCode.slice(sIdx + 'const INITIAL_LICH: LichCongTac[] = '.length, eIdx + 1);

  // Đánh giá mảng JSON bằng Function constructor
  const rawList = new Function(`return ${arrayStr};`)();
  console.log(`Tìm thấy ${rawList.length} sự kiện mẫu.`);

  const insertStatements = [];

  function escSql(val) {
    if (val === null || val === undefined) return 'null';
    return "'" + String(val).replace(/'/g, "''") + "'";
  }

  for (const item of rawList) {
    let cot = 'khac';
    const cLower = (item.chuTri || '').toLowerCase();
    if (cLower.includes('hải') || cLower.includes('nguyễn hồng hải')) cot = 'vien_truong';
    else if (cLower.includes('dân') || cLower.includes('đinh quốc dân')) cot = 'dan';
    else if (cLower.includes('bình') || cLower.includes('nguyễn thanh bình')) cot = 'binh';
    else if (cLower.includes('khôi') || cLower.includes('cao duy khôi')) cot = 'khoi';

    const h = parseInt((item.gio || '08:00').split(':')[0], 10);
    const buoi = h < 12 ? 'sang' : 'chieu';

    // Bóc tách nội dung chính và đơn vị/người chuẩn bị từ chuỗi như "Đề án Tiêu chuẩn... (TTKCT a.Trung, a.Phương, KHKT)"
    let tieuDe = item.noiDung || '';
    let donVi = '';
    const mParen = tieuDe.match(/^(.*?)\s*\((.*?)\)$/);
    if (mParen) {
      tieuDe = mParen[1].trim();
      donVi = mParen[2].trim();
    } else if (item.thanhPhan && item.thanhPhan !== 'Toàn thể CBVC Viện') {
      donVi = item.thanhPhan;
    }

    const phongId = mapPhong[item.diaDiem] ? `'${mapPhong[item.diaDiem]}'` : 'null';

    let xeIdVal = 'null';
    if (item.xeCongTac) {
      for (const [bienSo, id] of Object.entries(mapXe)) {
        if (item.xeCongTac.includes(bienSo)) {
          xeIdVal = `'${id}'`;
          break;
        }
      }
    }

    const sql = `insert into lich_co_quan (
      tieu_de, noi_dung, ngay, thu, buoi, gio_bat_dau, gio_ket_thuc,
      lanh_dao_chu_tri, cot_ma_tran, don_vi_chuan_bi, thanh_phan,
      dia_diem, phong_hop_id, xe_cong_tac, xe_id, loai_lich, trang_thai, ghi_chu_chuan_bi, bien_ban_ket_luan
    ) values (
      ${escSql(tieuDe)},
      ${escSql(item.noiDung || tieuDe)},
      ${escSql(item.ngay)},
      ${escSql(item.thu)},
      '${buoi}',
      ${escSql(item.gio)},
      ${item.gioKetThuc ? escSql(item.gioKetThuc) : 'null'},
      ${escSql(item.chuTri)},
      '${cot}',
      ${donVi ? escSql(donVi) : 'null'},
      ${escSql(item.thanhPhan || '')},
      ${escSql(item.diaDiem)},
      ${phongId},
      ${item.xeCongTac ? escSql(item.xeCongTac) : 'null'},
      ${xeIdVal},
      ${escSql(item.loai || 'Lich-tuan')},
      ${escSql(item.trangThai || 'Da-duyet')},
      ${item.ghiChu ? escSql(item.ghiChu) : 'null'},
      ${item.noiDungBaoCao ? escSql(item.noiDungBaoCao) : 'null'}
    );`;

    insertStatements.push(sql);
  }

  // Chạy insert theo batch
  console.log(`Đang nạp ${insertStatements.length} sự kiện vào database Supabase...`);
  const batchSql = `begin;\n${insertStatements.join('\n')}\ncommit;`;
  await runQuery(batchSql);

  const countRes = await runQuery('select count(*) from lich_co_quan;');
  console.log('✅ Đã nạp thành công! Tổng số bản ghi hiện tại:', countRes[0]?.count);

  // Seed ghi chú tuần 37 (14/9 - 18/9)
  await runQuery(`insert into ghi_chu_lich_tuan (nam, tuan_thu, tu_ngay, den_ngay, noi_dung, nguoi_ghi)
    values (2026, 37, '2026-09-14', '2026-09-18',
    'Phòng KHKT, TTKCT và các đơn vị chuyên môn chuẩn bị đầy đủ hồ sơ, tài liệu phục vụ các buổi họp và làm việc của Lãnh đạo Viện.',
    'Chánh Văn phòng')
    on conflict (nam, tuan_thu) do update set noi_dung = excluded.noi_dung;`);
  console.log('✅ Đã lưu ghi chú tuần 37!');
}

main().catch((e) => {
  console.error('❌ Lỗi:', e);
  process.exit(1);
});
