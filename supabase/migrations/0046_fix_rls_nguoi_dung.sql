-- ============================================================
-- 0046 — Cập nhật RLS bảng nguoi_dung
--   Cho phép người dùng có quyền phan_quyen:xem hoặc lãnh đạo đọc danh sách người dùng
-- ============================================================

drop policy if exists "nd_doc_minh" on nguoi_dung;
drop policy if exists "nd_doc_auth" on nguoi_dung;
create policy "nd_doc_auth" on nguoi_dung for select to authenticated
  using (
    user_id = auth.uid() 
    or fn_lanh_dao_tro_len() 
    or fn_co_quyen('phan_quyen', 'xem')
  );

drop policy if exists "nd_quan_tri_ghi" on nguoi_dung;
drop policy if exists "nd_phan_quyen_ghi" on nguoi_dung;
create policy "nd_phan_quyen_ghi" on nguoi_dung for all to authenticated
  using (
    fn_la_quan_tri() 
    or fn_co_quyen('phan_quyen', 'sua')
  )
  with check (
    fn_la_quan_tri() 
    or fn_co_quyen('phan_quyen', 'sua')
  );
