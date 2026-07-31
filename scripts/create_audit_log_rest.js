import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://umvckjqseqawpqamvsbx.supabase.co';
const serviceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVtdmNranFzZXFhd3BxYW12c2J4Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4MzU4ODg4MSwiZXhwIjoyMDk5MTY0ODgxfQ.zvY3pjZK1Krq9FSmPXMflWBKp2oAm1moZtlp8ypnFzc';

const supabase = createClient(supabaseUrl, serviceKey);

async function check() {
  const { data, error } = await supabase.from('lich_su_phe_duyet').select('*').limit(1);
  console.log('lich_su_phe_duyet query result:', { data, error });
}

check();
