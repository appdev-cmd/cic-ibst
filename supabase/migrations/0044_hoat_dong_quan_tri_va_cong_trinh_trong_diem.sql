-- ============================================================
-- 0044 — Bảng Hoạt động Quản trị & Công trình Trọng điểm Quốc gia
--
-- BỐI CẢNH:
--   Dashboard trang chủ trước đây có 3 widget hiển thị dữ liệu tĩnh/mock:
--     1. Hoạt động Quản trị nổi bật (Hợp tác quốc tế, Dự án tòa nhà 10 tầng)
--     2. Giám sát các Công trình Trọng điểm Quốc gia (Mục IX.1 Báo cáo sơ kết)
--     3. Năng lực Đấu thầu qua mạng (Hardcoded 58 gói, 47 gói trúng)
--
-- MIGRATION NÀY:
--   • Tạo bảng hoat_dong_quan_tri lưu trữ các hoạt động quản trị, hợp tác, đầu tư.
--   • Tạo bảng cong_trinh_trong_diem quản lý các đại công trình trọng điểm cấp Quốc gia.
--   • Bật RLS và cấp quyền đọc công khai cho mọi người dùng đã đăng nhập / xem dashboard.
-- ============================================================

-- ─── 1. Bảng Hoạt động Quản trị nổi bật ───
create table if not exists hoat_dong_quan_tri (
  id bigserial primary key,
  tieu_de varchar(255) not null,
  noi_dung text not null,
  loai varchar(50) default 'hop-tac', -- 'hop-tac', 'dau-tu', 'chinh-sach', 'khac'
  icon varchar(50) default 'Globe2',  -- 'Globe2', 'Building2', 'Award', 'Shield'
  ngay_thuc_hien date,
  lien_ket varchar(500),
  thu_tu int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table hoat_dong_quan_tri is
  'Các hoạt động quản trị, sự kiện hợp tác chiến lược và chỉ đạo điều hành nổi bật của Viện.';

alter table hoat_dong_quan_tri enable row level security;
drop policy if exists "Doc hoat_dong_quan_tri moi nguoi" on hoat_dong_quan_tri;
create policy "Doc hoat_dong_quan_tri moi nguoi" on hoat_dong_quan_tri for select using (true);
drop policy if exists "Sua hoat_dong_quan_tri authenticated" on hoat_dong_quan_tri;
create policy "Sua hoat_dong_quan_tri authenticated" on hoat_dong_quan_tri for all using (true) with check (true);

-- ─── 2. Bảng Công trình Trọng điểm Quốc gia ───
create table if not exists cong_trinh_trong_diem (
  id bigserial primary key,
  ten_cong_trinh varchar(255) not null,
  noi_dung_ho_tro text not null,
  trang_thai_bao_cao varchar(100) default 'Đang triển khai',
  tien_do int default 0 check (tien_do >= 0 and tien_do <= 100),
  hop_dong_id bigint references hop_dong(id) on delete set null,
  nhiem_vu_pvqlnn_id bigint references nhiem_vu_pvqlnn(id) on delete set null,
  thu_tu int default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

comment on table cong_trinh_trong_diem is
  'Danh mục các công trình trọng điểm cấp Quốc gia do Viện tư vấn, giám sát kỹ thuật theo chỉ đạo của Bộ Xây dựng.';

alter table cong_trinh_trong_diem enable row level security;
drop policy if exists "Doc cong_trinh_trong_diem moi nguoi" on cong_trinh_trong_diem;
create policy "Doc cong_trinh_trong_diem moi nguoi" on cong_trinh_trong_diem for select using (true);
drop policy if exists "Sua cong_trinh_trong_diem authenticated" on cong_trinh_trong_diem;
create policy "Sua cong_trinh_trong_diem authenticated" on cong_trinh_trong_diem for all using (true) with check (true);
