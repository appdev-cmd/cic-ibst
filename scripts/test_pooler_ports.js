import pg from 'pg';
const { Client } = pg;

async function tryConfig(config, name) {
  const client = new Client(config);
  try {
    await client.connect();
    console.log('🎉 SUCCESS CONNECTED:', name);
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
      GRANT ALL ON TABLE lich_su_phe_duyet TO anon, authenticated, service_role;
      GRANT USAGE, SELECT ON SEQUENCE lich_su_phe_duyet_id_seq TO anon, authenticated, service_role;
    `;
    await client.query(sql);
    console.log('✅ TABLE lich_su_phe_duyet CREATED SUCCESSFULLY!');
    await client.end();
    return true;
  } catch (err) {
    console.log('❌ Failed', name, err.message);
    await client.end().catch(() => {});
    return false;
  }
}

async function main() {
  const password = 'IymTBNztKKohCr0l';
  const project = 'umvckjqseqawpqamvsbx';

  const configs = [
    { name: 'pooler-5432-user-tenant', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, database: 'postgres', user: `postgres.${project}`, password, ssl: { rejectUnauthorized: false } },
    { name: 'pooler-6543-user-tenant', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, database: 'postgres', user: `postgres.${project}`, password, ssl: { rejectUnauthorized: false } },
    { name: 'pooler-5432-user-plain', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 5432, database: 'postgres', user: 'postgres', password, ssl: { rejectUnauthorized: false } },
    { name: 'pooler-6543-user-plain', host: 'aws-0-ap-southeast-1.pooler.supabase.com', port: 6543, database: 'postgres', user: 'postgres', password, ssl: { rejectUnauthorized: false } },
    { name: 'direct-5432', host: `db.${project}.supabase.co`, port: 5432, database: 'postgres', user: 'postgres', password, ssl: { rejectUnauthorized: false } },
  ];

  for (const c of configs) {
    const ok = await tryConfig(c, c.name);
    if (ok) break;
  }
}

main();
