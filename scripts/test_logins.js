import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const envText = fs.readFileSync('.env', 'utf8');
const env = {};
envText.split(/\r?\n/).forEach((l) => {
  const p = l.split('=');
  if (p.length >= 2) env[p[0].trim()] = p.slice(1).join('=').trim().replace(/^['"]|['"]$/g, '');
});

const supabase = createClient(env.VITE_SUPABASE_URL, env.VITE_SUPABASE_ANON_KEY);

async function testLogin(email, pass) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password: pass });
  return { ok: !error, error: error?.message };
}

async function run() {
  console.log('admin@ibst.vn with 123456:', await testLogin('admin@ibst.vn', '123456'));
  console.log('admin@ibst.vn with Ibst@2026:', await testLogin('admin@ibst.vn', 'Ibst@2026'));
  console.log('vientruong@ibst.vn with 123456:', await testLogin('vientruong@ibst.vn', '123456'));
  console.log('ctcp@ibst.vn with 123456:', await testLogin('ctcp@ibst.vn', '123456'));
  console.log('nguyenhonghai@ibst.vn with 123456:', await testLogin('nguyenhonghai@ibst.vn', '123456'));
  console.log('nguyenhonghai@ibst.vn with Ibst@2026:', await testLogin('nguyenhonghai@ibst.vn', 'Ibst@2026'));
  console.log('pham.van.cuong157@ibst.gov.vn with 123456:', await testLogin('pham.van.cuong157@ibst.gov.vn', '123456'));
  console.log('pham.van.cuong157@ibst.gov.vn with Ibst@2026:', await testLogin('pham.van.cuong157@ibst.gov.vn', 'Ibst@2026'));
}
run();
