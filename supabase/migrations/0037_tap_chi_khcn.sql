-- 1. Số/Kỳ Tạp chí
CREATE TABLE IF NOT EXISTS so_tap_chi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ten TEXT NOT NULL,              -- VD: "Số 75 - Tháng 9/2026"
  nam INT NOT NULL,
  quy INT CHECK (quy BETWEEN 1 AND 4),
  ngay_xuat_ban DATE,
  trang_thai TEXT DEFAULT 'chuan-bi'
    CHECK (trang_thai IN ('chuan-bi','bien-tap','in-an','da-xuat-ban')),
  so_bai INT DEFAULT 0,
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bài báo khoa học (bản thảo)
CREATE TABLE IF NOT EXISTS bai_bao_khoa_hoc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tieu_de TEXT NOT NULL,
  tom_tat TEXT,
  tu_khoa TEXT[],
  tac_gia TEXT NOT NULL,
  dong_tac_gia TEXT[],
  co_quan TEXT,
  email_tac_gia TEXT,
  ngay_nhan DATE DEFAULT CURRENT_DATE,
  trang_thai TEXT DEFAULT 'tiep-nhan'
    CHECK (trang_thai IN (
      'tiep-nhan','phan-cong-bien-tap','cho-phan-bien',
      'dang-phan-bien','chinh-sua','chap-nhan','tu-choi','da-xuat-ban'
    )),
  bien_tap_vien_id BIGINT REFERENCES nhan_su(id) ON DELETE SET NULL,
  so_tap_chi_id UUID REFERENCES so_tap_chi(id) ON DELETE SET NULL,
  file_ban_thao TEXT,          -- Storage path for PDF
  file_chinh_sua TEXT,         -- Revised version path
  ngay_xuat_ban DATE,
  ghi_chu TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Phản biện khoa học (blind review)
CREATE TABLE IF NOT EXISTS phan_bien_khoa_hoc (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  bai_bao_id UUID NOT NULL REFERENCES bai_bao_khoa_hoc(id) ON DELETE CASCADE,
  phan_bien_vien_id BIGINT REFERENCES nhan_su(id) ON DELETE SET NULL,
  ho_ten_phan_bien TEXT NOT NULL,
  co_quan_phan_bien TEXT,
  email_phan_bien TEXT,
  ngay_phan_cong DATE DEFAULT CURRENT_DATE,
  han_tra_ket_qua DATE,
  ngay_tra_ket_qua DATE,
  ket_qua TEXT CHECK (ket_qua IN ('chap-nhan','chinh-sua-nho','chinh-sua-lon','tu-choi')),
  nhan_xet TEXT,
  diem_danh_gia SMALLINT CHECK (diem_danh_gia BETWEEN 1 AND 10),
  file_nhan_xet TEXT,          -- Storage path for review file
  trang_thai TEXT DEFAULT 'cho-phan-bien'
    CHECK (trang_thai IN ('cho-phan-bien','da-nhan','da-tra-ket-qua')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_bai_bao_khoa_hoc_trang_thai ON bai_bao_khoa_hoc(trang_thai);
CREATE INDEX IF NOT EXISTS idx_phan_bien_khoa_hoc_bai_bao_id ON phan_bien_khoa_hoc(bai_bao_id);

-- Enable RLS
ALTER TABLE so_tap_chi ENABLE ROW LEVEL SECURITY;
ALTER TABLE bai_bao_khoa_hoc ENABLE ROW LEVEL SECURITY;
ALTER TABLE phan_bien_khoa_hoc ENABLE ROW LEVEL SECURITY;

-- Basic RLS Policies (Allow authenticated users full access for now)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cho phép user đăng nhập xem so_tap_chi' AND tablename = 'so_tap_chi') THEN
        CREATE POLICY "Cho phép user đăng nhập xem so_tap_chi" ON so_tap_chi FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cho phép user đăng nhập thêm sửa so_tap_chi' AND tablename = 'so_tap_chi') THEN
        CREATE POLICY "Cho phép user đăng nhập thêm sửa so_tap_chi" ON so_tap_chi FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cho phép user đăng nhập xem bai_bao_khoa_hoc' AND tablename = 'bai_bao_khoa_hoc') THEN
        CREATE POLICY "Cho phép user đăng nhập xem bai_bao_khoa_hoc" ON bai_bao_khoa_hoc FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cho phép user đăng nhập thêm sửa bai_bao_khoa_hoc' AND tablename = 'bai_bao_khoa_hoc') THEN
        CREATE POLICY "Cho phép user đăng nhập thêm sửa bai_bao_khoa_hoc" ON bai_bao_khoa_hoc FOR ALL USING (auth.role() = 'authenticated');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cho phép user đăng nhập xem phan_bien_khoa_hoc' AND tablename = 'phan_bien_khoa_hoc') THEN
        CREATE POLICY "Cho phép user đăng nhập xem phan_bien_khoa_hoc" ON phan_bien_khoa_hoc FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Cho phép user đăng nhập thêm sửa phan_bien_khoa_hoc' AND tablename = 'phan_bien_khoa_hoc') THEN
        CREATE POLICY "Cho phép user đăng nhập thêm sửa phan_bien_khoa_hoc" ON phan_bien_khoa_hoc FOR ALL USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Trigger to auto-update updated_at for bai_bao_khoa_hoc
CREATE OR REPLACE FUNCTION update_bai_bao_khoa_hoc_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_bai_bao_khoa_hoc_updated_at ON bai_bao_khoa_hoc;
CREATE TRIGGER trg_bai_bao_khoa_hoc_updated_at
    BEFORE UPDATE ON bai_bao_khoa_hoc
    FOR EACH ROW
    EXECUTE FUNCTION update_bai_bao_khoa_hoc_updated_at();
