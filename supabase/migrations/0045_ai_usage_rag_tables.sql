-- Migration 0045: Bảng cấu hình AI, nhật ký và RAG Knowledge
CREATE EXTENSION IF NOT EXISTS vector;

-- 1. Bảng cấu hình giá AI
CREATE TABLE IF NOT EXISTS cau_hinh_gia_ai (
    mo_hinh_ai TEXT PRIMARY KEY,
    ten_hien_thi TEXT NOT NULL,
    nha_cung_cap TEXT NOT NULL DEFAULT 'Google',
    gia_input_per_1m_usd NUMERIC(10,4) DEFAULT 0,
    gia_output_per_1m_usd NUMERIC(10,4) DEFAULT 0,
    ty_gia_vnd NUMERIC(12,0) DEFAULT 25500,
    dang_hoat_dong BOOLEAN DEFAULT TRUE,
    tao_luc TIMESTAMPTZ DEFAULT NOW(),
    cap_nhat_luc TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE cau_hinh_gia_ai ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admin xem cau_hinh_gia_ai" ON cau_hinh_gia_ai;
CREATE POLICY "Admin xem cau_hinh_gia_ai" ON cau_hinh_gia_ai FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admin quan ly cau_hinh_gia_ai" ON cau_hinh_gia_ai;
CREATE POLICY "Admin quan ly cau_hinh_gia_ai" ON cau_hinh_gia_ai FOR ALL USING (fn_vai_tro() in ('quan-tri', 'lanh-dao'));

-- 2. Bảng nhật ký sử dụng AI
CREATE TABLE IF NOT EXISTS nhat_ky_su_dung_ai (
    ma_nhat_ky UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_nguoi_dung UUID REFERENCES auth.users(id),
    tinh_nang TEXT NOT NULL,
    mo_hinh_ai TEXT NOT NULL,
    nha_cung_cap TEXT DEFAULT 'Google',
    token_input INT DEFAULT 0,
    token_output INT DEFAULT 0,
    tong_token INT GENERATED ALWAYS AS (token_input + token_output) STORED,
    chi_phi_usd NUMERIC(12,6) DEFAULT 0,
    chi_phi_vnd NUMERIC(14,0) DEFAULT 0,
    thoi_gian_xu_ly_ms INT DEFAULT 0,
    trang_thai TEXT DEFAULT 'thanh_cong',
    mo_ta_prompt TEXT,
    ghi_chu_loi TEXT,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE nhat_ky_su_dung_ai ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "User chi xem nhat ky minh tao" ON nhat_ky_su_dung_ai;
CREATE POLICY "User chi xem nhat ky minh tao" ON nhat_ky_su_dung_ai FOR SELECT USING (auth.uid() = ma_nguoi_dung OR fn_vai_tro() in ('quan-tri', 'lanh-dao'));

DROP POLICY IF EXISTS "User chi insert nhat ky ban than" ON nhat_ky_su_dung_ai;
CREATE POLICY "User chi insert nhat ky ban than" ON nhat_ky_su_dung_ai FOR INSERT WITH CHECK (auth.uid() = ma_nguoi_dung);

-- 3. Bảng rag_knowledge_chunks
CREATE TABLE IF NOT EXISTS rag_knowledge_chunks (
    ma_chunk UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ma_van_ban TEXT,
    ten_van_ban TEXT NOT NULL,
    loai_van_ban TEXT NOT NULL DEFAULT 'quy_dinh',
    noi_dung_chunk TEXT NOT NULL,
    vector_embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    fts TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('simple', coalesce(ten_van_ban,'') || ' ' || coalesce(noi_dung_chunk,''))
    ) STORED,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_fts ON rag_knowledge_chunks USING gin (fts);
CREATE INDEX IF NOT EXISTS idx_rag_knowledge_chunks_vector ON rag_knowledge_chunks USING ivfflat (vector_embedding vector_cosine_ops) WITH (lists = 100);

ALTER TABLE rag_knowledge_chunks ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth user xem chunk" ON rag_knowledge_chunks;
CREATE POLICY "Auth user xem chunk" ON rag_knowledge_chunks FOR SELECT USING (auth.role() = 'authenticated');

-- 4. Bảng rag_knowledge_graph
CREATE TABLE IF NOT EXISTS rag_knowledge_graph (
    ma_triple UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    subject_entity TEXT NOT NULL,
    subject_type TEXT NOT NULL DEFAULT 'Entity',
    predicate TEXT NOT NULL,
    object_entity TEXT NOT NULL,
    object_type TEXT NOT NULL DEFAULT 'Entity',
    mo_ta_lien_ket TEXT,
    ma_chunk UUID REFERENCES rag_knowledge_chunks(ma_chunk) ON DELETE CASCADE,
    tao_luc TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE rag_knowledge_graph ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Auth user xem graph" ON rag_knowledge_graph;
CREATE POLICY "Auth user xem graph" ON rag_knowledge_graph FOR SELECT USING (auth.role() = 'authenticated');

-- 5. RPC ghi_nhat_ky_su_dung_ai
CREATE OR REPLACE FUNCTION ghi_nhat_ky_su_dung_ai(
    p_tinh_nang TEXT,
    p_mo_hinh_ai TEXT,
    p_nha_cung_cap TEXT,
    p_token_input INT,
    p_token_output INT,
    p_thoi_gian_xu_ly_ms INT,
    p_trang_thai TEXT,
    p_mo_ta_prompt TEXT,
    p_ghi_chu_loi TEXT
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_ma_nguoi_dung UUID;
    v_gia_input NUMERIC;
    v_gia_output NUMERIC;
    v_ty_gia NUMERIC;
    v_chi_phi_usd NUMERIC;
    v_chi_phi_vnd NUMERIC;
BEGIN
    v_ma_nguoi_dung := auth.uid();
    IF v_ma_nguoi_dung IS NULL THEN
        RAISE EXCEPTION 'Not authenticated';
    END IF;

    SELECT gia_input_per_1m_usd, gia_output_per_1m_usd, ty_gia_vnd
    INTO v_gia_input, v_gia_output, v_ty_gia
    FROM cau_hinh_gia_ai
    WHERE mo_hinh_ai = p_mo_hinh_ai
    LIMIT 1;

    IF NOT FOUND THEN
        v_gia_input := 0;
        v_gia_output := 0;
        v_ty_gia := 25500;
    END IF;

    v_chi_phi_usd := (COALESCE(p_token_input, 0) * v_gia_input / 1000000.0) + (COALESCE(p_token_output, 0) * v_gia_output / 1000000.0);
    v_chi_phi_vnd := v_chi_phi_usd * v_ty_gia;

    INSERT INTO nhat_ky_su_dung_ai (
        ma_nguoi_dung, tinh_nang, mo_hinh_ai, nha_cung_cap, token_input, token_output,
        chi_phi_usd, chi_phi_vnd, thoi_gian_xu_ly_ms, trang_thai, mo_ta_prompt, ghi_chu_loi
    ) VALUES (
        v_ma_nguoi_dung, p_tinh_nang, p_mo_hinh_ai, p_nha_cung_cap, p_token_input, p_token_output,
        v_chi_phi_usd, v_chi_phi_vnd, p_thoi_gian_xu_ly_ms, p_trang_thai, p_mo_ta_prompt, p_ghi_chu_loi
    );
END;
$$;

-- 6. RPC match_knowledge_chunks
CREATE OR REPLACE FUNCTION match_knowledge_chunks(
    query_embedding vector(768),
    query_text text,
    match_threshold float DEFAULT 0.5,
    match_count int DEFAULT 10,
    filter_loai text DEFAULT NULL,
    filter_du_an text DEFAULT NULL
)
RETURNS TABLE (
    ma_chunk UUID,
    ma_van_ban TEXT,
    ten_van_ban TEXT,
    loai_van_ban TEXT,
    noi_dung_chunk TEXT,
    similarity FLOAT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    SELECT
        c.ma_chunk,
        c.ma_van_ban,
        c.ten_van_ban,
        c.loai_van_ban,
        c.noi_dung_chunk,
        ((1 - (c.vector_embedding <=> query_embedding)) * 0.7 + ts_rank(c.fts, plainto_tsquery('simple', query_text)) * 0.3)::FLOAT as similarity
    FROM rag_knowledge_chunks c
    WHERE 
        (filter_loai IS NULL OR c.loai_van_ban = filter_loai)
        AND (filter_du_an IS NULL OR c.metadata->>'ma_du_an' = filter_du_an)
        AND (1 - (c.vector_embedding <=> query_embedding)) > match_threshold
    ORDER BY similarity DESC
    LIMIT match_count;
END;
$$;


-- 7. Seed dữ liệu giá mặc định
INSERT INTO cau_hinh_gia_ai (mo_hinh_ai, ten_hien_thi, nha_cung_cap, gia_input_per_1m_usd, gia_output_per_1m_usd, ty_gia_vnd)
VALUES
    ('gemini-3.8-flash', 'Gemini 3.8 Flash', 'Google', 0.15, 0.60, 25500),
    ('gemini-2.5-pro', 'Gemini 2.5 Pro', 'Google', 1.25, 10.00, 25500),
    ('gemini-2.5-flash', 'Gemini 2.5 Flash', 'Google', 0.15, 0.60, 25500),
    ('text-embedding-004', 'Text Embedding 004', 'Google', 0.00625, 0, 25500)
ON CONFLICT (mo_hinh_ai) DO NOTHING;
