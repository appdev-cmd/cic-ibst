-- ============================================================
-- 0032 — Nghiên cứu sinh (NCS) — thay thế dữ liệu mock INITIAL_NCS
-- trong src/pages/DaoTaoPage.tsx bằng bảng thật.
-- Phần 5/6 của kế hoạch hoàn thiện PH5.
-- ============================================================

create table if not exists nghien_cuu_sinh (
  id                  bigint generated always as identity primary key,
  nhan_su_id          bigint references nhan_su(id) on delete set null,  -- null nếu NCS chưa phải CBVC Viện
  ho_ten              varchar(150) not null,
  ngay_nhap_hoc       date,
  giao_vien_huong_dan varchar(255),
  ten_de_tai          varchar(500),
  don_vi_id           bigint references don_vi(id),
  trang_thai_hoi_dong varchar(30) not null default 'chua-thanh-lap',
                      -- chua-thanh-lap/bao-ve-co-so/bao-ve-cap-vien/da-cap-bang
  ghi_chu             varchar(500),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table nghien_cuu_sinh is 'Nghiên cứu sinh Tiến sĩ đào tạo/hướng dẫn tại Viện (PH7, quản lý trong PH5)';

do $$
begin
  execute 'drop trigger if exists trg_nghien_cuu_sinh_updated_at on nghien_cuu_sinh';
  execute 'create trigger trg_nghien_cuu_sinh_updated_at before update on nghien_cuu_sinh for each row execute function fn_cap_nhat_updated_at()';
  execute 'drop trigger if exists trg_nghien_cuu_sinh_nhat_ky on nghien_cuu_sinh';
  execute 'create trigger trg_nghien_cuu_sinh_nhat_ky after insert or update or delete on nghien_cuu_sinh for each row execute function fn_ghi_nhat_ky()';
  execute 'alter table nghien_cuu_sinh enable row level security';
end $$;

drop policy if exists "doc_nghien_cuu_sinh_auth" on nghien_cuu_sinh;
create policy "doc_nghien_cuu_sinh_auth" on nghien_cuu_sinh for select to authenticated using (true);
drop policy if exists "ghi_nghien_cuu_sinh_auth" on nghien_cuu_sinh;
create policy "ghi_nghien_cuu_sinh_auth" on nghien_cuu_sinh for all to authenticated using (true) with check (true);
