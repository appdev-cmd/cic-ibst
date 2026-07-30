-- ============================================================
-- 0013 — Chốt chặn thẩm quyền & truy vết hợp đồng (Quy chế 2815/QĐ-VKH)
--
--   Vấn đề đang xử lý: RLS ở migration 0004 mở "using (true) with check (true)"
--   cho mọi tài khoản đã đăng nhập, nên BẤT KỲ ai cũng có thể tự đặt
--   trang_thai_phe_duyet = 'da-duyet' — trái Điều 6.1 (thẩm quyền Viện trưởng)
--   và Điều 11 (quyết toán). Chặn ở giao diện là không đủ vì có thể gọi thẳng API.
--
--   • Điều 6.1 — chỉ Viện trưởng/Phó Viện trưởng (lanh-dao) mới được phê duyệt
--   • Điều 11  — quyết toán/thanh lý thuộc Lãnh đạo Viện hoặc Trưởng đơn vị
--   • Điều 9/10 — mọi thay đổi phải truy vết được tới người thật, không phải
--     vai trò Postgres 'authenticated'
-- ============================================================

-- ─── 1. Helper vai trò còn thiếu ───
create or replace function fn_truong_don_vi_tro_len() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in ('quan-tri','lanh-dao','truong-don-vi');
$$;
comment on function fn_truong_don_vi_tro_len is 'True nếu vai trò từ Trưởng đơn vị trở lên (Điều 11 QC 2815)';

-- ─── 2. Nhật ký truy vết đúng người thực hiện ───
-- Trước đây chỉ ghi current_user = 'authenticated' nên không quy được trách nhiệm.
alter table nhat_ky_du_lieu add column if not exists nguoi_dung_id uuid;
alter table nhat_ky_du_lieu add column if not exists vai_tro varchar(30);

create or replace function fn_ghi_nhat_ky() returns trigger
language plpgsql security definer as $$
begin
  insert into nhat_ky_du_lieu (
    ten_bang, ban_ghi_id, hanh_dong, du_lieu_cu, du_lieu_moi, nguoi_dung_id, vai_tro
  )
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end,
    auth.uid(),
    fn_vai_tro()
  );
  return coalesce(new, old);
end $$;

-- ─── 3. Chốt chặn thẩm quyền trên hợp đồng ───
create or replace function fn_kiem_soat_tham_quyen_hop_dong() returns trigger
language plpgsql security definer as $$
begin
  -- Điều 6.1: xác nhận "đã duyệt" là thẩm quyền Viện trưởng / Phó Viện trưởng ủy quyền.
  if new.trang_thai_phe_duyet is distinct from old.trang_thai_phe_duyet
     and new.trang_thai_phe_duyet = 'da-duyet'
     and not fn_lanh_dao_tro_len() then
    raise exception
      'Điều 6.1 QC 2815: vai trò "%" không có thẩm quyền phê duyệt hợp đồng. Thẩm quyền thuộc Viện trưởng hoặc Phó Viện trưởng được ủy quyền.',
      fn_vai_tro()
      using errcode = '42501';
  end if;

  -- Điều 11: quyết toán, thanh lý hợp đồng.
  if new.trang_thai_quyet_toan is distinct from old.trang_thai_quyet_toan
     and not fn_truong_don_vi_tro_len() then
    raise exception
      'Điều 11 QC 2815: vai trò "%" không có thẩm quyền quyết toán/thanh lý hợp đồng.',
      fn_vai_tro()
      using errcode = '42501';
  end if;

  return new;
end $$;
comment on function fn_kiem_soat_tham_quyen_hop_dong is 'Chặn cập nhật vượt thẩm quyền theo Điều 6.1 và Điều 11 QC 2815';

drop trigger if exists trg_hop_dong_tham_quyen on hop_dong;
create trigger trg_hop_dong_tham_quyen
  before update on hop_dong
  for each row execute function fn_kiem_soat_tham_quyen_hop_dong();

-- ─── 4. Cho phép người dùng đọc nhật ký của chính hợp đồng họ đang xem ───
-- (0006 chỉ cho lãnh đạo trở lên đọc; chủ trì cũng cần xem lịch sử HĐ mình phụ trách.)
drop policy if exists "nk_doc_hop_dong" on nhat_ky_du_lieu;
create policy "nk_doc_hop_dong" on nhat_ky_du_lieu
  for select to authenticated
  using (ten_bang = 'hop_dong' or fn_lanh_dao_tro_len());
