const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

let envText = '';
try {
  envText = fs.readFileSync('.env', 'utf8');
} catch {}

const env = {};
envText.split(/\r?\n/).forEach(line => {
  const parts = line.split('=');
  if (parts.length >= 2) env[parts[0].trim()] = parts.slice(1).join('=').trim();
});

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Thiếu cấu hình Supabase trong .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function seedAiPricing() {
  console.log('🤖 Bắt đầu seed bảng giá AI models (cau_hinh_gia_ai)...');

  const defaultModels = [
    {
      mo_hinh_ai: 'gemini-3.8-flash',
      ten_hien_thi: 'Gemini 3.8 Flash (Mặc định)',
      nha_cung_cap: 'Google',
      gia_input_per_1m_usd: 0.15,
      gia_output_per_1m_usd: 0.60,
      ty_gia_vnd: 25500,
      dang_hoat_dong: true,
    },
    {
      mo_hinh_ai: 'gemini-3.7-flash',
      ten_hien_thi: 'Gemini 3.7 Flash',
      nha_cung_cap: 'Google',
      gia_input_per_1m_usd: 0.10,
      gia_output_per_1m_usd: 0.40,
      ty_gia_vnd: 25500,
      dang_hoat_dong: true,
    },
    {
      mo_hinh_ai: 'gemini-2.5-pro',
      ten_hien_thi: 'Gemini 2.5 Pro (Suy luận sâu)',
      nha_cung_cap: 'Google',
      gia_input_per_1m_usd: 1.25,
      gia_output_per_1m_usd: 10.00,
      ty_gia_vnd: 25500,
      dang_hoat_dong: true,
    },
    {
      mo_hinh_ai: 'gemini-2.5-flash',
      ten_hien_thi: 'Gemini 2.5 Flash (Fallback)',
      nha_cung_cap: 'Google',
      gia_input_per_1m_usd: 0.15,
      gia_output_per_1m_usd: 0.60,
      ty_gia_vnd: 25500,
      dang_hoat_dong: true,
    },
    {
      mo_hinh_ai: 'text-embedding-004',
      ten_hien_thi: 'Text Embedding 004 (RAG Vector)',
      nha_cung_cap: 'Google',
      gia_input_per_1m_usd: 0.00625,
      gia_output_per_1m_usd: 0,
      ty_gia_vnd: 25500,
      dang_hoat_dong: true,
    },
  ];

  for (const m of defaultModels) {
    const { error } = await supabase.from('cau_hinh_gia_ai').upsert(m, { onConflict: 'mo_hinh_ai' });
    if (error) {
      console.warn(`⚠️ Lỗi seed model ${m.mo_hinh_ai}:`, error.message);
    } else {
      console.log(`✅ Đã seed: ${m.mo_hinh_ai} (${m.ten_hien_thi})`);
    }
  }

  console.log('🎉 Hoàn thành seed bảng giá AI!');
}

seedAiPricing();
