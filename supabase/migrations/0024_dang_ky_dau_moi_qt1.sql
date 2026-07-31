-- ============================================================
-- 0024 — Đăng ký đầu mối thị trường & dự thầu (Quy trình 1, Điều 5.1)
--   (Giai đoạn 1 kế hoạch số hóa — docs/ke-hoach-so-hoa-quy-trinh-2815.md, mục 1B)
--
--   Lưu đồ QT1 (B1–B4): VCNLĐ có thông tin cơ hội → GĐ Đơn vị/PGĐ/Trưởng phòng
--   đăng ký làm đơn vị đầu mối với P.KHKT (Đ.5.1a-c) → P.KHKT tiếp nhận, báo cáo
--   Lãnh đạo Viện (Đ.5.1c) → LĐV cho ý kiến chỉ đạo → P.KHKT phản hồi giao/không
--   giao đầu mối. Tránh nhiều đơn vị trong Viện cùng cạnh tranh 1 gói thầu.
-- ============================================================

create table if not exists dang_ky_dau_moi (
  id                    bigint generated always as identity primary key,
  ten_co_hoi            text not null,
  mo_ta                 text,
  -- VCNLĐ cung cấp thông tin cơ hội — được xét khen thưởng nếu dẫn đến ký HĐ (Đ.5.1a).
  nguoi_phat_hien_id    bigint references nhan_su(id),
  don_vi_dang_ky_id     bigint not null references don_vi(id),
  -- GĐ Đơn vị / Phó GĐ / Trưởng phòng đăng ký làm đầu mối (Đ.5.1b,c).
  nguoi_dang_ky_id      bigint references nhan_su(id),
  trang_thai            varchar(20) not null default 'dang-ky'
                         check (trang_thai in ('dang-ky','cho-ldv-chi-dao','giao-dau-moi','khong-tham-gia')),
  ngay_dang_ky          date not null default current_date,
  ngay_phan_hoi         date,
  ly_do_khong_tham_gia  text,
  -- Gói thầu tạo ra sau khi được giao đầu mối (B5 trở đi, Quy trình 1 tiếp theo).
  dau_thau_id           bigint references dau_thau(id),
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
comment on table dang_ky_dau_moi is 'Đăng ký đầu mối thị trường/dự thầu — Quy trình 1, Điều 5.1 QC 2815';

create trigger trg_dang_ky_dau_moi_updated_at before update on dang_ky_dau_moi
  for each row execute function fn_cap_nhat_updated_at();

create index idx_dang_ky_dau_moi_don_vi on dang_ky_dau_moi (don_vi_dang_ky_id);
create index idx_dang_ky_dau_moi_trang_thai on dang_ky_dau_moi (trang_thai);

-- ─── Kiểm soát luồng chuyển trạng thái (Đ.5.1c) ───
create or replace function fn_kiem_soat_dang_ky_dau_moi() returns trigger
language plpgsql security definer as $$
begin
  if new.trang_thai is not distinct from old.trang_thai then
    return new;
  end if;

  -- P.KHKT tiếp nhận đăng ký, báo cáo Lãnh đạo Viện xin ý kiến (Đ.5.1c).
  if new.trang_thai = 'cho-ldv-chi-dao' then
    if old.trang_thai <> 'dang-ky' then
      raise exception 'Điều 5.1c QC 2815: chỉ được chuyển "Chờ Lãnh đạo Viện chỉ đạo" từ trạng thái "Đăng ký".'
        using errcode = '42501';
    end if;
    if not fn_khkt_tro_len() then
      raise exception 'Điều 5.1c QC 2815: Phòng KHKT tiếp nhận và báo cáo Lãnh đạo Viện (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
  end if;

  -- Lãnh đạo Viện cho ý kiến → P.KHKT phản hồi giao/không giao đầu mối (Đ.5.1c).
  if new.trang_thai in ('giao-dau-moi', 'khong-tham-gia') then
    if old.trang_thai <> 'cho-ldv-chi-dao' then
      raise exception 'Điều 5.1c QC 2815: chỉ được phản hồi kết quả khi đang ở trạng thái "Chờ Lãnh đạo Viện chỉ đạo".'
        using errcode = '42501';
    end if;
    if not (fn_lanh_dao_tro_len() or fn_vai_tro() = 'phong-khkt') then
      raise exception 'Điều 5.1c QC 2815: chỉ Lãnh đạo Viện hoặc Phòng KHKT (phản hồi thay) mới được kết luận đăng ký đầu mối (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    new.ngay_phan_hoi := coalesce(new.ngay_phan_hoi, current_date);
  end if;

  return new;
end $$;

comment on function fn_kiem_soat_dang_ky_dau_moi is
  'Chốt chặn luồng đăng ký đầu mối Điều 5.1c QC 2815: dang-ky → cho-ldv-chi-dao (P.KHKT) → giao-dau-moi/khong-tham-gia (LĐV)';

create trigger trg_kiem_soat_dang_ky_dau_moi before update on dang_ky_dau_moi
  for each row execute function fn_kiem_soat_dang_ky_dau_moi();

-- ─── RLS: đọc theo đơn vị đăng ký hoặc Lãnh đạo/KHKT; ghi theo đơn vị hoặc Lãnh đạo/KHKT ───
alter table dang_ky_dau_moi enable row level security;

create policy "dang_ky_dau_moi_doc" on dang_ky_dau_moi for select to authenticated using (
  fn_lanh_dao_tro_len()
  or fn_vai_tro() = 'phong-khkt'
  or don_vi_dang_ky_id = fn_don_vi_hien_tai()
);

create policy "dang_ky_dau_moi_them" on dang_ky_dau_moi for insert to authenticated with check (
  fn_lanh_dao_tro_len()
  or fn_vai_tro() = 'phong-khkt'
  or don_vi_dang_ky_id = fn_don_vi_hien_tai()
);

create policy "dang_ky_dau_moi_sua" on dang_ky_dau_moi for update to authenticated using (
  fn_lanh_dao_tro_len()
  or fn_vai_tro() = 'phong-khkt'
  or don_vi_dang_ky_id = fn_don_vi_hien_tai()
);

create policy "dang_ky_dau_moi_xoa" on dang_ky_dau_moi for delete to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_dang_ky_id = fn_don_vi_hien_tai()
);
