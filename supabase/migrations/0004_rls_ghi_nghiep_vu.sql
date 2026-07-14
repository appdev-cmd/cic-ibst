-- ============================================================
-- 0004 — Quyền ghi cho người dùng đã xác thực trên các bảng
-- nghiệp vụ còn lại (phục vụ CRUD Giai đoạn 1 kế hoạch hoàn thiện).
-- Giai đoạn 3 sẽ siết lại theo vai trò + đơn vị.
-- ============================================================

do $$
declare t text;
begin
  foreach t in array array['van_ban','de_tai','hop_dong','mau_thi_nghiem','lop_dao_tao','khach_hang']
  loop
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;
