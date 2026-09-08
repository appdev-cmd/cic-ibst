-- ============================================================
-- 0033 — Phân quyền theo vai trò cho hồ sơ CBVC mở rộng + dữ liệu
-- Đảng - Đoàn thể. THAY THẾ các chính sách "_tam" (mở cho mọi
-- authenticated) tạo ở 0028-0031 bằng chính sách theo vai trò.
--
-- Nguyên tắc (xem docs/ke-hoach-hoan-thien-ph5-nhan-su-dang-doan-the.md §3.5):
--   • Dữ liệu lương/HĐLĐ/đánh giá: đọc = chính chủ + cán bộ tổ chức + lãnh đạo trở lên.
--   • Dữ liệu Đảng - Đoàn thể: đọc = chính chủ + văn phòng đảng ủy + lãnh đạo trở lên
--     + bí thư/phó bí thư của tổ chức liên quan. Ghi = văn phòng đảng ủy + bí thư/phó
--     bí thư của tổ chức đó.
-- ============================================================

insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('vai_tro','can-bo-to-chuc','Cán bộ Tổ chức - Hành chính'),
  ('vai_tro','van-phong-dang-uy','Văn phòng Đảng ủy')
on conflict (nhom, ma_muc) do nothing;

-- ─── Hàm tiện ích (cùng khuôn với fn_vai_tro()/fn_la_quan_tri() ở 0006) ───
create or replace function fn_la_can_bo_to_chuc() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in ('can-bo-to-chuc','quan-tri');
$$;

create or replace function fn_la_vp_dang_uy() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in ('van-phong-dang-uy','quan-tri');
$$;

create or replace function fn_nhan_su_id_hien_tai() returns bigint
language sql stable security definer as $$
  select nhan_su_id from nguoi_dung where user_id = auth.uid();
$$;

-- Bí thư/phó bí thư (hoặc chủ tịch/phó chủ tịch) của MỘT tổ chức Đảng-Đoàn thể cụ thể
create or replace function fn_la_phu_trach_to_chuc(p_to_chuc_id bigint) returns boolean
language sql stable security definer as $$
  select exists (
    select 1 from to_chuc_doan_the
    where id = p_to_chuc_id
      and (nguoi_dung_dau_id = fn_nhan_su_id_hien_tai() or pho_id = fn_nhan_su_id_hien_tai())
  );
$$;

-- ============================================================
-- Nhóm 1 — Hồ sơ CBVC mở rộng (0028): ít nhạy cảm hơn lương/Đảng,
-- giữ đọc = mọi authenticated (đồng nhất với nhan_su gốc từ 0001/0003),
-- chỉ siết lại quyền GHI.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['qua_trinh_cong_tac','bang_cap','gio_nghien_cuu','nghien_cuu_sinh']
  loop
    execute format('drop policy if exists "ghi_%s_auth" on %I', t, t);
    execute format('drop policy if exists "%s_ghi_vai_tro" on %I', t, t);
    execute format(
      'create policy "%s_ghi_vai_tro" on %I for all to authenticated using (fn_la_can_bo_to_chuc()) with check (fn_la_can_bo_to_chuc())',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- Nhóm 2 — HĐLĐ, ngạch/bậc lương, đánh giá: đọc = chính chủ + cán bộ
-- tổ chức + lãnh đạo trở lên; ghi = cán bộ tổ chức/quản trị.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['hop_dong_lao_dong','luong_ngach_bac','danh_gia_cbvc']
  loop
    execute format('drop policy if exists "doc_%s_auth" on %I', t, t);
    execute format('drop policy if exists "%s_doc_han_che" on %I', t, t);
    execute format(
      'create policy "%s_doc_han_che" on %I for select to authenticated using (
         nhan_su_id = fn_nhan_su_id_hien_tai() or fn_la_can_bo_to_chuc() or fn_lanh_dao_tro_len()
       )', t, t
    );

    execute format('drop policy if exists "ghi_%s_auth" on %I', t, t);
    execute format('drop policy if exists "%s_ghi_vai_tro" on %I', t, t);
    execute format(
      'create policy "%s_ghi_vai_tro" on %I for all to authenticated using (fn_la_can_bo_to_chuc()) with check (fn_la_can_bo_to_chuc())',
      t, t
    );
  end loop;
end $$;

-- ============================================================
-- Nhóm 3 — Cây tổ chức Đảng - Đoàn thể: cây tổ chức không nhạy cảm
-- (giống cây don_vi), đọc mở; ghi = văn phòng đảng ủy/quản trị.
-- ============================================================
drop policy if exists "ghi_to_chuc_doan_the_auth" on to_chuc_doan_the;
drop policy if exists "to_chuc_doan_the_ghi_vai_tro" on to_chuc_doan_the;
create policy "to_chuc_doan_the_ghi_vai_tro" on to_chuc_doan_the
  for all to authenticated using (fn_la_vp_dang_uy()) with check (fn_la_vp_dang_uy());

-- ============================================================
-- Nhóm 4 — Hồ sơ đảng viên/đoàn viên + phát triển đảng: dữ liệu chính
-- trị cá nhân, đọc/ghi giới hạn nghiêm ngặt.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['dang_vien','doan_vien_hoi_vien','phat_trien_dang']
  loop
    execute format('drop policy if exists "doc_%s_auth_tam" on %I', t, t);
    execute format('drop policy if exists "%s_doc_han_che" on %I', t, t);
    execute format(
      'create policy "%s_doc_han_che" on %I for select to authenticated using (
         nhan_su_id = fn_nhan_su_id_hien_tai() or fn_la_vp_dang_uy() or fn_lanh_dao_tro_len()
         or fn_la_phu_trach_to_chuc(to_chuc_id)
       )', t, t
    );

    execute format('drop policy if exists "ghi_%s_auth_tam" on %I', t, t);
    execute format('drop policy if exists "%s_ghi_han_che" on %I', t, t);
    execute format(
      'create policy "%s_ghi_han_che" on %I for all to authenticated using (
         fn_la_vp_dang_uy() or fn_la_phu_trach_to_chuc(to_chuc_id)
       ) with check (
         fn_la_vp_dang_uy() or fn_la_phu_trach_to_chuc(to_chuc_id)
       )', t, t
    );
  end loop;
end $$;

-- Bảng con phat_trien_dang_buoc: suy ra to_chuc_id qua bảng cha phat_trien_dang
drop policy if exists "doc_phat_trien_dang_buoc_auth_tam" on phat_trien_dang_buoc;
drop policy if exists "phat_trien_dang_buoc_doc_han_che" on phat_trien_dang_buoc;
create policy "phat_trien_dang_buoc_doc_han_che" on phat_trien_dang_buoc for select to authenticated using (
  exists (
    select 1 from phat_trien_dang pt
    where pt.id = phat_trien_dang_buoc.phat_trien_id
      and (pt.nhan_su_id = fn_nhan_su_id_hien_tai() or fn_la_vp_dang_uy() or fn_lanh_dao_tro_len()
           or fn_la_phu_trach_to_chuc(pt.to_chuc_id))
  )
);
drop policy if exists "ghi_phat_trien_dang_buoc_auth_tam" on phat_trien_dang_buoc;
drop policy if exists "phat_trien_dang_buoc_ghi_han_che" on phat_trien_dang_buoc;
create policy "phat_trien_dang_buoc_ghi_han_che" on phat_trien_dang_buoc for all to authenticated using (
  exists (
    select 1 from phat_trien_dang pt
    where pt.id = phat_trien_dang_buoc.phat_trien_id
      and (fn_la_vp_dang_uy() or fn_la_phu_trach_to_chuc(pt.to_chuc_id))
  )
) with check (
  exists (
    select 1 from phat_trien_dang pt
    where pt.id = phat_trien_dang_buoc.phat_trien_id
      and (fn_la_vp_dang_uy() or fn_la_phu_trach_to_chuc(pt.to_chuc_id))
  )
);

-- ============================================================
-- Nhóm 5 — Sinh hoạt định kỳ, điểm danh, đảng phí/đoàn phí: cùng mức
-- bảo mật với hồ sơ đảng viên (gắn theo to_chuc_id).
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['sinh_hoat_dinh_ky','thu_phi_doan_the']
  loop
    execute format('drop policy if exists "doc_%s_auth_tam" on %I', t, t);
    execute format('drop policy if exists "%s_doc_han_che" on %I', t, t);
    execute format(
      'create policy "%s_doc_han_che" on %I for select to authenticated using (
         fn_la_vp_dang_uy() or fn_lanh_dao_tro_len() or fn_la_phu_trach_to_chuc(to_chuc_id)
         %s
       )', t, t,
      case when t = 'thu_phi_doan_the' then 'or nhan_su_id = fn_nhan_su_id_hien_tai()' else '' end
    );

    execute format('drop policy if exists "ghi_%s_auth_tam" on %I', t, t);
    execute format('drop policy if exists "%s_ghi_han_che" on %I', t, t);
    execute format(
      'create policy "%s_ghi_han_che" on %I for all to authenticated using (
         fn_la_vp_dang_uy() or fn_la_phu_trach_to_chuc(to_chuc_id)
       ) with check (
         fn_la_vp_dang_uy() or fn_la_phu_trach_to_chuc(to_chuc_id)
       )', t, t
    );
  end loop;
end $$;

-- diem_danh_sinh_hoat: suy ra to_chuc_id qua sinh_hoat_dinh_ky
drop policy if exists "doc_diem_danh_sinh_hoat_auth_tam" on diem_danh_sinh_hoat;
drop policy if exists "diem_danh_sinh_hoat_doc_han_che" on diem_danh_sinh_hoat;
create policy "diem_danh_sinh_hoat_doc_han_che" on diem_danh_sinh_hoat for select to authenticated using (
  nhan_su_id = fn_nhan_su_id_hien_tai() or fn_la_vp_dang_uy() or fn_lanh_dao_tro_len()
  or exists (
    select 1 from sinh_hoat_dinh_ky sh
    where sh.id = diem_danh_sinh_hoat.sinh_hoat_id and fn_la_phu_trach_to_chuc(sh.to_chuc_id)
  )
);
drop policy if exists "ghi_diem_danh_sinh_hoat_auth_tam" on diem_danh_sinh_hoat;
drop policy if exists "diem_danh_sinh_hoat_ghi_han_che" on diem_danh_sinh_hoat;
create policy "diem_danh_sinh_hoat_ghi_han_che" on diem_danh_sinh_hoat for all to authenticated using (
  fn_la_vp_dang_uy() or exists (
    select 1 from sinh_hoat_dinh_ky sh
    where sh.id = diem_danh_sinh_hoat.sinh_hoat_id and fn_la_phu_trach_to_chuc(sh.to_chuc_id)
  )
) with check (
  fn_la_vp_dang_uy() or exists (
    select 1 from sinh_hoat_dinh_ky sh
    where sh.id = diem_danh_sinh_hoat.sinh_hoat_id and fn_la_phu_trach_to_chuc(sh.to_chuc_id)
  )
);

-- ============================================================
-- Nhóm 6 — Khen thưởng - kỷ luật, thi đua: mức công khai nội bộ
-- (giống văn bản/đề tài) — đọc mở, ghi theo vai trò quản lý.
-- ============================================================
do $$
declare t text;
begin
  foreach t in array array['khen_thuong_ky_luat','thi_dua']
  loop
    execute format('drop policy if exists "ghi_%s_auth_tam" on %I', t, t);
    execute format('drop policy if exists "%s_ghi_vai_tro" on %I', t, t);
    execute format(
      'create policy "%s_ghi_vai_tro" on %I for all to authenticated using (
         fn_la_can_bo_to_chuc() or fn_la_vp_dang_uy()
       ) with check (
         fn_la_can_bo_to_chuc() or fn_la_vp_dang_uy()
       )', t, t
    );
  end loop;
end $$;

-- ─── Xem có mấy tài khoản hiện tại chưa gắn nhan_su_id — cảnh báo, không tự sửa ───
comment on function fn_nhan_su_id_hien_tai() is
  'Trả về nhan_su_id của người dùng hiện tại (qua nguoi_dung.nhan_su_id). '
  'Tài khoản chưa gắn nhan_su_id sẽ không "tự đọc được hồ sơ của mình" ở các bảng nhạy cảm '
  '— cần Phòng TCHC gắn nguoi_dung.nhan_su_id khi cấp tài khoản.';
