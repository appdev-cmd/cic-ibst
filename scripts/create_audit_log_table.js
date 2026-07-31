import pg from 'pg';
const { Client } = pg;

const client = new Client({
  host: 'db.umvckjqseqawpqamvsbx.supabase.co',
  port: 5432,
  database: 'postgres',
  user: 'postgres',
  password: 'IymTBNztKKohCr0l',
  ssl: { rejectUnauthorized: false },
});

async function main() {
  await client.connect();
  console.log('Connected to Supabase PostgreSQL!');

  const sql = `
    CREATE TABLE IF NOT EXISTS lich_su_phe_duyet (
      id BIGSERIAL PRIMARY KEY,
      loai_doi_tuong VARCHAR(50) NOT NULL, -- 'dang_ky_dau_moi', 'dau_thau', 'hop_dong', 'uy_quyen'
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
  console.log('✅ Bảng lich_su_phe_duyet đã được khởi tạo thành công!');

  await client.end();
}

main().catch((err) => {
  console.error('Lỗi khi khởi tạo bảng audit log:', err);
  process.exit(1);
});
