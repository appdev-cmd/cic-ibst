import pg from 'pg';
const { Client } = pg;

async function tryConnect(connectionString) {
  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  try {
    await client.connect();
    console.log('✅ Connected successfully with:', connectionString);
    const sql = `
      CREATE TABLE IF NOT EXISTS lich_su_phe_duyet (
        id BIGSERIAL PRIMARY KEY,
        loai_doi_tuong VARCHAR(50) NOT NULL,
        doi_tuong_id BIGINT NOT NULL,
        tu_trang_thai VARCHAR(100),
        den_trang_thai VARCHAR(100) NOT NULL,
        nguoi_thuc_hien_id BIGINT REFERENCES nhan_su(id) ON DELETE SET NULL,
        ten_nguoi_thuc_hien VARCHAR(255),
        ghi_chu TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_lich_su_doi_tuong ON lich_su_phe_duyet(loai_doi_tuong, doi_tuong_id);
    `;
    await client.query(sql);
    console.log('✅ Created table lich_su_phe_duyet!');
    await client.end();
    return true;
  } catch (err) {
    console.log('❌ Failed with:', connectionString, err.message);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const hosts = [
    'postgresql://postgres:IymTBNztKKohCr0l@db.umvckjqseqawpqamvsbx.supabase.co:5432/postgres',
    'postgresql://postgres.umvckjqseqawpqamvsbx:IymTBNztKKohCr0l@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
    'postgresql://postgres:IymTBNztKKohCr0l@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
    'postgresql://postgres:IymTBNztKKohCr0l@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres',
  ];

  for (const h of hosts) {
    const ok = await tryConnect(h);
    if (ok) break;
  }
}

main();
