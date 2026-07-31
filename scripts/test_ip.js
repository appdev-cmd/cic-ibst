import pg from 'pg';
const { Client } = pg;

async function main() {
  const client = new Client({
    host: '52.77.146.31',
    port: 6543,
    database: 'postgres',
    user: 'postgres.umvckjqseqawpqamvsbx',
    password: 'IymTBNztKKohCr0l',
    ssl: { rejectUnauthorized: false },
    servername: 'aws-0-ap-southeast-1.pooler.supabase.com',
  });

  await client.connect();
  console.log('✅ CONNECTED TO SUPABASE POSTGRESQL SUCCESSFUL!');

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
  console.log('✅ BẢNG lich_su_phe_duyet ĐÃ ĐƯỢC TẠO VÀ CẤP QUYỀN THÀNH CÔNG!');

  await client.end();
}

main().catch((err) => {
  console.error('Lỗi kết nối IP:', err);
});
