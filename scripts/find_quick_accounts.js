import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function findCandidates() {
  const { data: donVis } = await supabase.from('don_vi').select('id, ten_don_vi, loai_don_vi').order('id');
  const { data: nhanSus } = await supabase.from('nhan_su').select('id, ma_dinh_danh, ho_va_ten, chuc_danh, don_vi_id, email').order('id');
  const { data: nguoiDungs } = await supabase.from('nguoi_dung').select('user_id, nhan_su_id, vai_tro, don_vi_id');
  const { data: { users } } = await supabase.auth.admin.listUsers({ perPage: 1000 });

  const userById = new Map();
  users.forEach((u) => userById.set(u.id, u));

  const ndByNsId = new Map();
  nguoiDungs.forEach((nd) => {
    if (nd.nhan_su_id) ndByNsId.set(Number(nd.nhan_su_id), nd);
  });

  const accountsByUnit = [];

  for (const dv of donVis) {
    const nsInDv = nhanSus.filter((ns) => ns.don_vi_id === dv.id);

    // Find Cấp Trưởng
    let truongList = nsInDv.filter((ns) => {
      const cd = (ns.chuc_danh || '').toLowerCase();
      return (cd.includes('trưởng') || cd.includes('giám đốc') || cd.includes('viện trưởng')) && !cd.includes('phó');
    });

    // Find Cấp Phó
    let phoList = nsInDv.filter((ns) => {
      const cd = (ns.chuc_danh || '').toLowerCase();
      return cd.includes('phó');
    });

    // Find Cấp Chuyên môn / Chuyên viên / Kỹ sư
    let chuyenVienList = nsInDv.filter((ns) => {
      const cd = (ns.chuc_danh || '').toLowerCase();
      return !cd.includes('trưởng') && !cd.includes('giám đốc') && !cd.includes('phó');
    });

    accountsByUnit.push({
      donVi: dv,
      totalNs: nsInDv.length,
      truong: truongList,
      pho: phoList,
      chuyenVien: chuyenVienList,
    });
  }

  for (const u of accountsByUnit) {
    console.log(`\n======================================================`);
    console.log(`ĐV ${u.donVi.id}: ${u.donVi.ten_don_vi} (Tổng: ${u.totalNs} người)`);
    console.log(`  - Cấp Trưởng (${u.truong.length}):`);
    u.truong.slice(0, 2).forEach((ns) => {
      const nd = ndByNsId.get(ns.id);
      const email = nd && userById.has(nd.user_id) ? userById.get(nd.user_id).email : ns.email;
      console.log(`      * [ID ${ns.id}] ${ns.ho_va_ten} | ${ns.chuc_danh} | Email: ${email}`);
    });
    console.log(`  - Cấp Phó (${u.pho.length}):`);
    u.pho.slice(0, 2).forEach((ns) => {
      const nd = ndByNsId.get(ns.id);
      const email = nd && userById.has(nd.user_id) ? userById.get(nd.user_id).email : ns.email;
      console.log(`      * [ID ${ns.id}] ${ns.ho_va_ten} | ${ns.chuc_danh} | Email: ${email}`);
    });
    console.log(`  - Chuyên viên / Kỹ sư (${u.chuyenVien.length}):`);
    u.chuyenVien.slice(0, 2).forEach((ns) => {
      const nd = ndByNsId.get(ns.id);
      const email = nd && userById.has(nd.user_id) ? userById.get(nd.user_id).email : ns.email;
      console.log(`      * [ID ${ns.id}] ${ns.ho_va_ten} | ${ns.chuc_danh} | Email: ${email}`);
    });
  }
}

findCandidates().catch(console.error);
