import { createClient } from '@supabase/supabase-js';

const url = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';

const supabase = createClient(url, serviceKey);

async function main() {
  console.log('Testing Supabase query on umvckjqseqawpqamvsbx...');
  const { data, error } = await supabase.from('hop_dong').select('id, so_hop_dong, buoc_hien_tai').limit(5);
  if (error) {
    console.error('Supabase Query Error:', error);
  } else {
    console.log('Success! Data:', data);
  }
}

main();
