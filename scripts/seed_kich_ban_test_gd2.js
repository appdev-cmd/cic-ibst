// Seed dữ liệu mẫu phục vụ kịch bản test Giai đoạn 0–2 kế hoạch số hóa QC 2815
// (docs/kich-ban-test-giai-doan-0-2.md). Chạy lại nhiều lần an toàn (idempotent).
//
//   node scripts/seed_kich_ban_test_gd2.js
//
// Việc script làm:
//   1. Tạo 2 tài khoản vai trò phòng chức năng: khkt@ibst.vn (P.KHKT), tckt@ibst.vn (P.TCKT)
//      + nhân sự gắn kèm ở đúng đơn vị. Mật khẩu: Ibst@2026 (giống admin).
//   2. Phân loại sẵn một số khách hàng (chủ đầu tư / nhà thầu / đối tác KHCN).
//   3. Ủy quyền ký HĐ hiệu lực cho Trưởng đơn vị Kết cấu (test cảnh báo Đ.6.2 hai chiều).
//   4. Đăng ký đầu mối dự thầu ở 3 trạng thái (test Quy trình 1).
//   5. Gói thầu có chủ trì HSDT + checklist năng lực dở dang (test Đ.5.1d).
//   6. 3 hợp đồng test: N1A chưa trình (đi luồng từ đầu), N2A phức tạp đang chờ KHKT
//      thẩm tra (SLA đang chạy), N2D đơn vị ký chưa có ủy quyền (cảnh báo vàng).
//   7. Liên danh 2 dòng (1 có / 1 chưa thông báo KHKT — test cảnh báo Đ.4.7).
//   8. 1 chứng chỉ HẾT HẠN cho Vũ Thị F (test cảnh báo CCNN Đ.7.4).

import { createClient } from '@supabase/supabase-js';

const url = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';
const supabase = createClient(url, serviceKey);

const MAT_KHAU = 'Ibst@2026';
const homNay = new Date().toISOString().slice(0, 10);
const namNay = homNay.slice(0, 4);

function ok(buoc) { console.log(`  ✓ ${buoc}`); }
function boQua(buoc, lyDo) { console.log(`  ↷ ${buoc} — đã có, bỏ qua${lyDo ? ` (${lyDo})` : ''}`); }
function loi(buoc, e) { console.error(`  ✗ ${buoc}:`, e?.message ?? e); process.exitCode = 1; }

async function taoTaiKhoan(email, hoTen, donViId, vaiTro, maNhanSu) {
  // Nhân sự gắn kèm (upsert theo ma_dinh_danh)
  let { data: ns } = await supabase.from('nhan_su').select('id').eq('ma_dinh_danh', maNhanSu).maybeSingle();
  if (!ns) {
    const ins = await supabase
      .from('nhan_su')
      .insert({ ma_dinh_danh: maNhanSu, ho_va_ten: hoTen, don_vi_id: donViId, chuc_danh: 'Chuyên viên', email })
      .select('id')
      .single();
    if (ins.error) return loi(`nhân sự ${hoTen}`, ins.error);
    ns = ins.data;
    ok(`nhân sự ${hoTen} (đơn vị ${donViId})`);
  } else boQua(`nhân sự ${hoTen}`);

  // Tài khoản auth
  let userId;
  const created = await supabase.auth.admin.createUser({ email, password: MAT_KHAU, email_confirm: true });
  if (created.error) {
    if (!/already/i.test(created.error.message)) return loi(`tài khoản ${email}`, created.error);
    const list = await supabase.auth.admin.listUsers({ perPage: 1000 });
    userId = list.data?.users?.find((u) => u.email === email)?.id;
    boQua(`tài khoản ${email}`);
  } else {
    userId = created.data.user.id;
    ok(`tài khoản ${email} (mật khẩu ${MAT_KHAU})`);
  }
  if (!userId) return loi(`tài khoản ${email}`, 'không lấy được user id');

  // Gắn vai trò
  const up = await supabase
    .from('nguoi_dung')
    .upsert({ user_id: userId, nhan_su_id: ns.id, vai_tro: vaiTro, don_vi_id: donViId }, { onConflict: 'user_id' });
  if (up.error) return loi(`vai trò ${vaiTro} cho ${email}`, up.error);
  ok(`gán vai trò ${vaiTro} cho ${email}`);
  return ns.id;
}

async function main() {
  console.log('— 1. Tài khoản phòng chức năng —');
  await taoTaiKhoan('khkt@ibst.vn', 'Phạm Kế Hoạch', 8, 'phong-khkt', 'NS-KHKT-01');
  await taoTaiKhoan('tckt@ibst.vn', 'Lê Tài Chính', 9, 'phong-tckt', 'NS-TCKT-01');

  console.log('— 2. Phân loại khách hàng mẫu —');
  const phanLoai = [
    ['chu-dau-tu', ['Sở Xây dựng tỉnh Quảng Ninh', 'Sở Y tế Hưng Yên', 'Sở Văn hóa Thể thao Bắc Ninh', 'Ban Quản lý dự án 85', 'Chủ đầu tư Landmark Riverside', 'Tổng công ty Cảng hàng không Việt Nam (ACV)', 'Tổng công ty Điện lực miền Bắc (EVNNPC)']],
    ['nha-thau', ['CTCP Hạ tầng 620', 'Công ty CP Xây dựng và Phát triển hạ tầng Miền Trung', 'Công ty TNHH MTV Cấp nước Đà Nẵng (Dawaco)']],
    ['doi-tac-khcn', ['Sika Việt Nam']],
  ];
  for (const [loai, tenList] of phanLoai) {
    const { error, count } = await supabase
      .from('khach_hang')
      .update({ loai }, { count: 'exact' })
      .in('ten_to_chuc', tenList)
      .eq('loai', 'khac'); // chỉ phân loại bản ghi chưa đụng tới — không ghi đè chỉnh tay của người dùng
    if (error) loi(`phân loại ${loai}`, error);
    else ok(`phân loại ${loai}: ${count ?? 0} khách hàng`);
  }

  console.log('— 3. Ủy quyền ký HĐ (Đ.6.2) —');
  {
    const soQD = `UQ-01/${namNay}/QĐ-VKH`;
    const { data: daCo } = await supabase.from('uy_quyen').select('id').eq('so_quyet_dinh', soQD).maybeSingle();
    if (daCo) boQua(`ủy quyền ${soQD}`);
    else {
      // Viện trưởng (Nguyễn Hồng Hải, nhân sự 8) ủy quyền chung cho Trưởng ĐV Kết cấu (Hoàng Văn E, nhân sự 1)
      const { error } = await supabase.from('uy_quyen').insert({
        nguoi_uy_quyen_id: 8,
        nguoi_duoc_uy_quyen_id: 1,
        loai_uy_quyen: 'ky-hop-dong',
        tu_ngay: `${namNay}-01-01`,
        den_ngay: `${namNay}-12-31`,
        ly_do: 'Ủy quyền chung hàng năm ký HĐKT phân cấp (Điều 6.2 QC 2815)',
        so_quyet_dinh: soQD,
        trang_thai: 'hieu-luc',
      });
      if (error) loi('ủy quyền', error);
      else ok(`ủy quyền ${soQD}: Hoàng Văn E (ĐV Kết cấu) được ký HĐ hết ${namNay}-12-31`);
    }
  }

  console.log('— 4. Đăng ký đầu mối dự thầu (Quy trình 1) —');
  const dkList = [
    { ten_co_hoi: '[TEST] Gói thầu kiểm định chung cư CT5 Xuân Phương', don_vi_dang_ky_id: 1, nguoi_phat_hien_id: 12, nguoi_dang_ky_id: 1, trang_thai: 'dang-ky' },
    { ten_co_hoi: '[TEST] Khảo sát địa chất khu công nghệ cao Hòa Lạc GĐ2', don_vi_dang_ky_id: 3, nguoi_phat_hien_id: 6, nguoi_dang_ky_id: 7, trang_thai: 'cho-ldv-chi-dao' },
    { ten_co_hoi: '[TEST] Tư vấn giám sát bệnh viện đa khoa tỉnh Hưng Yên', don_vi_dang_ky_id: 2, nguoi_phat_hien_id: 2, nguoi_dang_ky_id: 2, trang_thai: 'khong-tham-gia', ly_do_khong_tham_gia: 'Trùng thời điểm 2 dự án trọng điểm, không bố trí được nhân sự chủ trì', ngay_phan_hoi: homNay },
  ];
  for (const dk of dkList) {
    const { data: daCo } = await supabase.from('dang_ky_dau_moi').select('id').eq('ten_co_hoi', dk.ten_co_hoi).maybeSingle();
    if (daCo) { boQua(dk.ten_co_hoi); continue; }
    // Chèn ở trạng thái gốc rồi cập nhật để đi qua trigger đúng luồng
    const trangThaiDich = dk.trang_thai;
    const { data: row, error } = await supabase
      .from('dang_ky_dau_moi')
      .insert({ ...dk, trang_thai: 'dang-ky', ngay_dang_ky: homNay, ngay_phan_hoi: null, ly_do_khong_tham_gia: null })
      .select('id')
      .single();
    if (error) { loi(dk.ten_co_hoi, error); continue; }
    if (trangThaiDich !== 'dang-ky') {
      let e2 = (await supabase.from('dang_ky_dau_moi').update({ trang_thai: 'cho-ldv-chi-dao' }).eq('id', row.id)).error;
      if (!e2 && trangThaiDich === 'khong-tham-gia') {
        e2 = (await supabase.from('dang_ky_dau_moi').update({ trang_thai: 'khong-tham-gia', ly_do_khong_tham_gia: dk.ly_do_khong_tham_gia }).eq('id', row.id)).error;
      }
      if (e2) { loi(`chuyển trạng thái ${dk.ten_co_hoi}`, e2); continue; }
    }
    ok(`${dk.ten_co_hoi} → ${trangThaiDich}`);
  }

  console.log('— 5. Gói thầu (Đ.5.1d) —');
  const gtList = [
    {
      ten_goi_thau: '[TEST] Gói thầu TV giám sát nhà máy nước mặt sông Đuống GĐ3',
      chu_dau_tu_id: 15, don_vi_thuc_hien_id: 1, hinh_thuc: 'dau-thau-rong-rai',
      gia_du_thau: 4200, ngay_mo_thau: homNay, trang_thai: 'chuan-bi',
      nguoi_phu_trach_id: 1, chu_tri_hsdt_id: 12, hs_nang_luc_chung: true, bc_tai_chinh: true, ccnn_du_thau: false,
    },
    {
      ten_goi_thau: '[TEST] Gói thầu kiểm định cầu Vĩnh Tuy giai đoạn 2',
      chu_dau_tu_id: 14, don_vi_thuc_hien_id: 3, hinh_thuc: 'chi-dinh-thau',
      gia_du_thau: 1500, gia_trung_thau: 1450, ngay_mo_thau: homNay, trang_thai: 'trung-thau',
      nguoi_phu_trach_id: 7, chu_tri_hsdt_id: 7, hs_nang_luc_chung: true, bc_tai_chinh: true, ccnn_du_thau: true,
    },
  ];
  for (const gt of gtList) {
    const { data: daCo } = await supabase.from('dau_thau').select('id').eq('ten_goi_thau', gt.ten_goi_thau).maybeSingle();
    if (daCo) { boQua(gt.ten_goi_thau); continue; }
    const { error } = await supabase.from('dau_thau').insert(gt);
    if (error) loi(gt.ten_goi_thau, error); else ok(gt.ten_goi_thau);
  }

  console.log('— 6. Hợp đồng test —');
  async function taoHopDong(row, capNhatSau) {
    const { data: daCo } = await supabase.from('hop_dong').select('id').eq('so_hop_dong', row.so_hop_dong).maybeSingle();
    if (daCo) { boQua(row.so_hop_dong); return daCo.id; }
    const { data, error } = await supabase.from('hop_dong').insert(row).select('id').single();
    if (error) { loi(row.so_hop_dong, error); return null; }
    if (capNhatSau) {
      const e2 = (await supabase.from('hop_dong').update(capNhatSau).eq('id', data.id)).error;
      if (e2) { loi(`cập nhật ${row.so_hop_dong}`, e2); return data.id; }
    }
    ok(`${row.so_hop_dong}${capNhatSau ? ` → ${capNhatSau.trang_thai_phe_duyet}` : ''}`);
    return data.id;
  }

  // 6a. N1A Viện ký, chưa trình — đi luồng phê duyệt 3 bước từ đầu (KB4)
  await taoHopDong({
    so_hop_dong: `408/${namNay}/HDGD`,
    ten_hop_dong: '[TEST] Giám định nguyên nhân nứt sàn hầm chung cư The Metro Q.9',
    khach_hang_id: 11, don_vi_id: 2, gia_tri: 900, da_thanh_toan: 0,
    ngay_ky: homNay, han_hoan_thanh: `${namNay}-12-31`, trang_thai: 'moi',
    nhom_hd: 'N1A', chu_tri_id: 2, cap_ky: 'vien-ky', trang_thai_phe_duyet: 'chua-trinh',
  });

  // 6b. N2A DƯỚI ngưỡng nhưng phuc_tap=true → vẫn buộc trình VT; đang chờ KHKT thẩm tra (SLA chạy) (KB5)
  const hd409 = await taoHopDong(
    {
      so_hop_dong: `409/${namNay}/HDTV`,
      ten_hop_dong: '[TEST] Tư vấn chuyển giao công nghệ chống động đất — hợp tác Bộ Xây dựng giao',
      khach_hang_id: 13, don_vi_id: 1, gia_tri: 3800, da_thanh_toan: 0,
      ngay_ky: homNay, han_hoan_thanh: `${namNay}-12-31`, trang_thai: 'moi',
      nhom_hd: 'N2A', chu_tri_id: 12, cap_ky: 'vien-ky', phuc_tap: true, trang_thai_phe_duyet: 'chua-trinh',
    },
    { trang_thai_phe_duyet: 'cho-khkt-tham-tra' },
  );

  // 6c. N2D đơn vị ký, đơn vị CHƯA có ủy quyền → cảnh báo vàng Đ.6.2 (KB6); chủ trì có CC hết hạn (KB9)
  await taoHopDong({
    so_hop_dong: `410/${namNay}/HDKS`,
    ten_hop_dong: '[TEST] Khảo sát địa chất mở rộng nhà máy Sika Bắc Ninh',
    khach_hang_id: 10, don_vi_id: 3, gia_tri: 1200, da_thanh_toan: 0,
    ngay_ky: homNay, han_hoan_thanh: `${namNay}-11-30`, trang_thai: 'moi',
    nhom_hd: 'N2D', chu_tri_id: 6, cap_ky: 'don-vi-ky',
  });

  console.log('— 7. Liên danh (Đ.4.7) trên HĐ 409 —');
  if (hd409) {
    const ldList = [
      { hop_dong_id: hd409, ten_doi_tac: '[TEST] Công ty CP Kỹ thuật địa chấn Nhật-Việt', ma_so_thue: '0109998888', ty_le_phan_tram: 30, vai_tro: 'thanh-vien', so_van_ban_khkt: `86/TB-KHKT`, ngay_thong_bao_khkt: homNay },
      { hop_dong_id: hd409, ten_doi_tac: '[TEST] Liên danh QH-Structural (chưa thông báo)', ma_so_thue: '0107776666', ty_le_phan_tram: 15, vai_tro: 'thanh-vien' },
    ];
    for (const ld of ldList) {
      const { data: daCo } = await supabase.from('lien_danh').select('id').eq('ten_doi_tac', ld.ten_doi_tac).eq('hop_dong_id', hd409).maybeSingle();
      if (daCo) { boQua(ld.ten_doi_tac); continue; }
      const { error } = await supabase.from('lien_danh').insert(ld);
      if (error) loi(ld.ten_doi_tac, error); else ok(ld.ten_doi_tac);
    }
  }

  console.log('— 8. Chứng chỉ HẾT HẠN cho Vũ Thị F (Đ.7.4) —');
  {
    const so = 'KSXD-00999-TEST';
    const { data: daCo } = await supabase.from('chung_chi_hanh_nghe').select('id').eq('so_chung_chi', so).maybeSingle();
    if (daCo) boQua(`chứng chỉ ${so}`);
    else {
      const { error } = await supabase.from('chung_chi_hanh_nghe').insert({
        nhan_su_id: 6, so_chung_chi: so, ten_linh_vuc_hanh_nghe: 'Khảo sát địa chất công trình',
        hang_chung_chi: 'hang-2', co_quan_cap: 'Bộ Xây dựng', ngay_cap: '2020-06-01',
        ngay_het_han: '2025-06-01', trang_thai_hieu_luc: 'het-hieu-luc',
      });
      if (error) loi('chứng chỉ hết hạn', error);
      else ok(`chứng chỉ ${so} (HẾT HẠN 01/06/2025) cho Vũ Thị F`);
    }
  }

  console.log('\nXong. Đăng nhập test: admin@ibst.vn / cic@ibst.vn / khkt@ibst.vn / tckt@ibst.vn — mật khẩu đều là Ibst@2026');
}

main();
