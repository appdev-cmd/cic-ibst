-- ============================================================
-- 0027 — Cấp quyền truy cập dữ liệu toàn Viện cho Phòng chức năng (P.KHKT, P.TCKT, P.TCHC)
--   Theo QC 2815, các Phòng chức năng cấp Viện có trách nhiệm theo dõi, thẩm tra, quyết toán toàn Viện.
-- ============================================================

-- ─── 1. Hàm tiện ích kiểm tra Lãnh đạo Viện & các Phòng chức năng cấp Viện ───
create or replace function fn_phong_chuc_nang_cap_vien_tro_len() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in (
    'quan-tri',
    'lanh-dao',
    'phong-khkt',
    'phong-tckt',
    'phong-tchc'
  );
$$;

-- ─── 2. Cập nhật RLS Policy cho bảng hop_dong ───
drop policy if exists "hd_doc_theo_don_vi" on hop_dong;
create policy "hd_doc_theo_don_vi" on hop_dong for select to authenticated using (
  fn_phong_chuc_nang_cap_vien_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
  or chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid())
);

drop policy if exists "hd_sua_theo_don_vi" on hop_dong;
create policy "hd_sua_theo_don_vi" on hop_dong for update to authenticated using (
  fn_phong_chuc_nang_cap_vien_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
  or chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid())
);

-- ─── 3. Cập nhật RLS Policy cho bảng dau_thau ───
drop policy if exists "dau_thau_doc_theo_don_vi" on dau_thau;
create policy "dau_thau_doc_theo_don_vi" on dau_thau for select to authenticated using (
  fn_phong_chuc_nang_cap_vien_tro_len()
  or don_vi_thuc_hien_id = fn_don_vi_hien_tai()
);

drop policy if exists "dau_thau_ghi_theo_don_vi" on dau_thau;
create policy "dau_thau_ghi_theo_don_vi" on dau_thau for all to authenticated using (
  fn_phong_chuc_nang_cap_vien_tro_len()
  or don_vi_thuc_hien_id = fn_don_vi_hien_tai()
);

-- ─── 4. Cập nhật RLS Policy cho bảng dang_ky_dau_moi ───
drop policy if exists "dang_ky_dau_moi_doc_auth" on dang_ky_dau_moi;
drop policy if exists "dang_ky_dau_moi_doc_theo_don_vi" on dang_ky_dau_moi;
create policy "dang_ky_dau_moi_doc_theo_don_vi" on dang_ky_dau_moi for select to authenticated using (
  fn_phong_chuc_nang_cap_vien_tro_len()
  or don_vi_dang_ky_id = fn_don_vi_hien_tai()
);

drop policy if exists "dang_ky_dau_moi_ghi_auth" on dang_ky_dau_moi;
drop policy if exists "dang_ky_dau_moi_ghi_theo_don_vi" on dang_ky_dau_moi;
create policy "dang_ky_dau_moi_ghi_theo_don_vi" on dang_ky_dau_moi for all to authenticated using (
  fn_phong_chuc_nang_cap_vien_tro_len()
  or don_vi_dang_ky_id = fn_don_vi_hien_tai()
);

-- ─── 5. Cập nhật RLS Policy cho các bảng con liên quan đến Hợp đồng ───
do $$
declare t text;
begin
  foreach t in array array['phieu_giao_viec', 'dot_thanh_toan', 'hop_dong_thuong_phat', 'kiem_tra_noi_bo', 'quyet_toan_giai_doan', 'hop_dong_tep_dinh_kem', 'lien_danh', 'luu_tru_ho_so']
  loop
    execute format('drop policy if exists "%s_doc_theo_don_vi" on %I', t, t);
    execute format('drop policy if exists "%s_ghi_theo_don_vi" on %I', t, t);

    execute format('
      create policy "%s_doc_theo_don_vi" on %I for select to authenticated using (
        fn_phong_chuc_nang_cap_vien_tro_len()
        or exists (
          select 1 from hop_dong hd
          where hd.id = %I.hop_dong_id
          and (hd.don_vi_id = fn_don_vi_hien_tai()
               or hd.chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid()))
        )
      )
    ', t, t, t);

    execute format('
      create policy "%s_ghi_theo_don_vi" on %I for all to authenticated using (
        fn_phong_chuc_nang_cap_vien_tro_len()
        or exists (
          select 1 from hop_dong hd
          where hd.id = %I.hop_dong_id
          and (hd.don_vi_id = fn_don_vi_hien_tai()
               or hd.chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid()))
        )
      )
    ', t, t, t);
  end loop;
end $$;
