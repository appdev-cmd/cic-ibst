-- ============================================================
-- 0030 — Cơ cấu tổ chức Đảng - Đoàn thể + hồ sơ đảng viên/đoàn viên
-- + quy trình phát triển đảng viên
-- Phần 3/6 của kế hoạch hoàn thiện PH5. RLS siết ngay tại 0033
-- (không để trạng thái mở cho dữ liệu Đảng — xem docs/ke-hoach-...).
-- ============================================================

insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('loai_to_chuc_doan_the','dang','Tổ chức Đảng'),
  ('loai_to_chuc_doan_the','doan-tn','Đoàn Thanh niên'),
  ('loai_to_chuc_doan_the','cong-doan','Công đoàn'),
  ('loai_to_chuc_doan_the','ccb','Hội Cựu chiến binh'),
  ('loai_to_chuc_doan_the','nu-cong','Ban Nữ công')
on conflict (nhom, ma_muc) do nothing;

-- ─── Cây tổ chức Đảng / Đoàn thể (song song cây don_vi chính quyền) ───
create table if not exists to_chuc_doan_the (
  id                bigint generated always as identity primary key,
  loai              varchar(20) not null,  -- dang/doan-tn/cong-doan/ccb/nu-cong
  cap               varchar(30) not null,
                    -- dang-bo/chi-bo/to-dang | doan-co-so/chi-doan | cd-co-so/to-cong-doan
  ten               varchar(255) not null,
  ma                varchar(50) unique,
  to_chuc_cha_id    bigint references to_chuc_doan_the(id),
  don_vi_id         bigint references don_vi(id),
  nguoi_dung_dau_id bigint references nhan_su(id),
  pho_id            bigint references nhan_su(id),
  ngay_thanh_lap    date,
  nhiem_ky          varchar(20),
  trang_thai        varchar(20) not null default 'hoat-dong',
  thu_tu            smallint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table to_chuc_doan_the is 'Cây tổ chức Đảng bộ/Chi bộ, Đoàn TN, Công đoàn, CCB, Nữ công (PH5)';

-- ─── Hồ sơ đảng viên ───
create table if not exists dang_vien (
  id                       bigint generated always as identity primary key,
  nhan_su_id               bigint not null unique references nhan_su(id) on delete cascade,
  to_chuc_id               bigint not null references to_chuc_doan_the(id),
  so_the_dang              varchar(30),
  ngay_vao_dang_du_bi      date not null,
  ngay_vao_dang_chinh_thuc date,
  noi_ket_nap              varchar(255),
  nguoi_gioi_thieu_1       varchar(150),
  nguoi_gioi_thieu_2       varchar(150),
  chuc_vu_dang             varchar(150),
  trinh_do_ly_luan         varchar(30),
  ngay_chuyen_den          date,
  ngay_chuyen_di           date,
  noi_chuyen_den_di        varchar(255),
  trang_thai               varchar(30) not null default 'dang-sinh-hoat',
                           -- dang-sinh-hoat/mien-sinh-hoat/chuyen-di/khai-tru/xoa-ten/tu-tran
  ghi_chu                  varchar(500),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);
comment on table dang_vien is 'Hồ sơ đảng viên — YÊU CẦU BẢO MẬT CAO: dữ liệu chính trị cá nhân (PH5)';

-- ─── Đoàn viên TN / công đoàn viên / hội viên CCB / hội viên nữ công ───
create table if not exists doan_vien_hoi_vien (
  id           bigint generated always as identity primary key,
  nhan_su_id   bigint not null references nhan_su(id) on delete cascade,
  to_chuc_id   bigint not null references to_chuc_doan_the(id),
  loai         varchar(20) not null,  -- doan-tn/cong-doan/ccb/nu-cong
  so_the       varchar(30),
  ngay_ket_nap date,
  chuc_vu      varchar(150),
  trang_thai   varchar(20) not null default 'dang-sinh-hoat',
  created_at   timestamptz not null default now(),
  unique (nhan_su_id, loai)
);
comment on table doan_vien_hoi_vien is 'Đoàn viên TN / công đoàn viên / hội viên CCB / hội viên nữ công (PH5)';

-- ─── Quy trình phát triển đảng viên (8 bước) ───
create table if not exists phat_trien_dang (
  id                   bigint generated always as identity primary key,
  nhan_su_id           bigint not null references nhan_su(id) on delete cascade,
  to_chuc_id           bigint not null references to_chuc_doan_the(id),
  buoc_hien_tai        varchar(30) not null default 'quan-chung-uu-tu',
                       -- quan-chung-uu-tu/hoc-lop-nhan-thuc/tham-tra-ly-lich/
                       -- chi-bo-de-nghi/dang-uy-xet/ket-nap-du-bi/
                       -- hoc-lop-dang-vien-moi/chuyen-chinh-thuc
  ngay_bat_dau         date,
  ngay_du_kien_ket_nap date,
  nguoi_theo_doi_id    bigint references nhan_su(id),
  ghi_chu              text,
  trang_thai           varchar(20) not null default 'dang-thuc-hien',  -- dang-thuc-hien/hoan-thanh/dung-lai
  created_at           timestamptz not null default now(),
  updated_at           timestamptz not null default now()
);
comment on table phat_trien_dang is 'Theo dõi quy trình phát triển đảng viên mới, 8 bước (PH5)';

create table if not exists phat_trien_dang_buoc (
  id              bigint generated always as identity primary key,
  phat_trien_id   bigint not null references phat_trien_dang(id) on delete cascade,
  buoc            varchar(30) not null,
  ngay_hoan_thanh date,
  so_van_ban      varchar(100),
  tep_dinh_kem    varchar(500),
  ghi_chu         varchar(500),
  created_at      timestamptz not null default now()
);
comment on table phat_trien_dang_buoc is 'Lịch sử hoàn thành từng bước trong quy trình phát triển đảng viên (PH5)';

do $$
declare t text;
begin
  foreach t in array array['to_chuc_doan_the','dang_vien','phat_trien_dang']
  loop
    execute format('drop trigger if exists trg_%s_updated_at on %I', t, t);
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
  end loop;

  foreach t in array array['to_chuc_doan_the','dang_vien','doan_vien_hoi_vien','phat_trien_dang','phat_trien_dang_buoc']
  loop
    execute format('drop trigger if exists trg_%s_nhat_ky on %I', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Chính sách RLS tạm thời (chỉ authenticated, chưa phân biệt vai trò) để không chặn
-- phát triển frontend — 0033 SẼ THAY THẾ TOÀN BỘ bằng chính sách theo vai trò trước
-- khi đưa vào vận hành thật. Không seed dữ liệu ở đây.
drop policy if exists "doc_to_chuc_doan_the_auth" on to_chuc_doan_the;
create policy "doc_to_chuc_doan_the_auth" on to_chuc_doan_the for select to authenticated using (true);
drop policy if exists "ghi_to_chuc_doan_the_auth" on to_chuc_doan_the;
create policy "ghi_to_chuc_doan_the_auth" on to_chuc_doan_the for all to authenticated using (true) with check (true);

do $$
declare t text;
begin
  foreach t in array array['dang_vien','doan_vien_hoi_vien','phat_trien_dang','phat_trien_dang_buoc']
  loop
    execute format('drop policy if exists "doc_%s_auth_tam" on %I', t, t);
    execute format('create policy "doc_%s_auth_tam" on %I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists "ghi_%s_auth_tam" on %I', t, t);
    execute format('create policy "ghi_%s_auth_tam" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;
