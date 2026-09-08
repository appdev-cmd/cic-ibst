-- ============================================================
-- 0038 — Cho phép người dùng authenticated xem dữ liệu Đảng & Đoàn thể
-- để hiển thị đầy đủ trên giao diện Phân hệ 5 (Tổ chức & Nhân sự).
-- Giữ nguyên quyền GHI (chỉ VP Đảng ủy / Bí thư / Phụ trách tổ chức).
-- ============================================================

-- 1. dang_vien
drop policy if exists "dang_vien_doc_han_che" on dang_vien;
drop policy if exists "dang_vien_doc_auth" on dang_vien;
create policy "dang_vien_doc_auth" on dang_vien for select to authenticated using (true);

-- 2. doan_vien_hoi_vien
drop policy if exists "doan_vien_hoi_vien_doc_han_che" on doan_vien_hoi_vien;
drop policy if exists "doan_vien_hoi_vien_doc_auth" on doan_vien_hoi_vien;
create policy "doan_vien_hoi_vien_doc_auth" on doan_vien_hoi_vien for select to authenticated using (true);

-- 3. phat_trien_dang
drop policy if exists "phat_trien_dang_doc_han_che" on phat_trien_dang;
drop policy if exists "phat_trien_dang_doc_auth" on phat_trien_dang;
create policy "phat_trien_dang_doc_auth" on phat_trien_dang for select to authenticated using (true);

-- 4. phat_trien_dang_buoc
drop policy if exists "phat_trien_dang_buoc_doc_han_che" on phat_trien_dang_buoc;
drop policy if exists "phat_trien_dang_buoc_doc_auth" on phat_trien_dang_buoc;
create policy "phat_trien_dang_buoc_doc_auth" on phat_trien_dang_buoc for select to authenticated using (true);

-- 5. sinh_hoat_dinh_ky
drop policy if exists "sinh_hoat_dinh_ky_doc_han_che" on sinh_hoat_dinh_ky;
drop policy if exists "sinh_hoat_dinh_ky_doc_auth" on sinh_hoat_dinh_ky;
create policy "sinh_hoat_dinh_ky_doc_auth" on sinh_hoat_dinh_ky for select to authenticated using (true);

-- 6. diem_danh_sinh_hoat
drop policy if exists "diem_danh_sinh_hoat_doc_han_che" on diem_danh_sinh_hoat;
drop policy if exists "diem_danh_sinh_hoat_doc_auth" on diem_danh_sinh_hoat;
create policy "diem_danh_sinh_hoat_doc_auth" on diem_danh_sinh_hoat for select to authenticated using (true);

-- 7. thu_phi_doan_the
drop policy if exists "thu_phi_doan_the_doc_han_che" on thu_phi_doan_the;
drop policy if exists "thu_phi_doan_the_doc_auth" on thu_phi_doan_the;
create policy "thu_phi_doan_the_doc_auth" on thu_phi_doan_the for select to authenticated using (true);
