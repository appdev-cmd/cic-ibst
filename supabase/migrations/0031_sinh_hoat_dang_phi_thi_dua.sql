-- ============================================================
-- 0031 — Sinh hoạt định kỳ, đảng phí/đoàn phí, khen thưởng - kỷ luật, thi đua
-- Phần 4/6 của kế hoạch hoàn thiện PH5.
-- ============================================================

create table if not exists sinh_hoat_dinh_ky (
  id           bigint generated always as identity primary key,
  to_chuc_id   bigint not null references to_chuc_doan_the(id),
  ky           varchar(20) not null,   -- '2026-09'
  ngay_hop     date not null,
  dia_diem     varchar(255),
  chu_tri_id   bigint references nhan_su(id),
  thu_ky_id    bigint references nhan_su(id),
  chuyen_de    varchar(255),
  noi_dung     text,
  nghi_quyet   text,
  so_bien_ban  varchar(100),
  tep_bien_ban varchar(500),
  trang_thai   varchar(20) not null default 'du-kien',  -- du-kien/da-hop/da-duyet-bb
  created_at   timestamptz not null default now()
);
comment on table sinh_hoat_dinh_ky is 'Kỳ sinh hoạt chi bộ / họp công đoàn - đoàn TN định kỳ (PH5)';

create table if not exists diem_danh_sinh_hoat (
  id           bigint generated always as identity primary key,
  sinh_hoat_id bigint not null references sinh_hoat_dinh_ky(id) on delete cascade,
  nhan_su_id   bigint not null references nhan_su(id),
  co_mat       varchar(20) not null default 'co-mat',  -- co-mat/vang-co-phep/vang-khong-phep
  ly_do        varchar(255),
  unique (sinh_hoat_id, nhan_su_id)
);
comment on table diem_danh_sinh_hoat is 'Điểm danh kỳ sinh hoạt Đảng/Đoàn thể (PH5)';

create table if not exists thu_phi_doan_the (
  id               bigint generated always as identity primary key,
  nhan_su_id       bigint not null references nhan_su(id) on delete cascade,
  to_chuc_id       bigint not null references to_chuc_doan_the(id),
  loai_phi         varchar(20) not null,   -- dang-phi/doan-phi/cong-doan-phi
  ky               varchar(20) not null,   -- '2026-09' hoặc '2026-Q3'
  muc_dong         numeric(12,2) not null,
  so_tien_phai_nop numeric(12,2) not null,
  so_tien_da_nop   numeric(12,2) not null default 0,
  ngay_nop         date,
  hinh_thuc        varchar(20),            -- tien-mat/chuyen-khoan/tru-luong
  nguoi_thu_id     bigint references nhan_su(id),
  trang_thai       varchar(20) not null default 'chua-nop',  -- chua-nop/da-nop/mien
  created_at       timestamptz not null default now(),
  unique (nhan_su_id, loai_phi, ky)
);
comment on table thu_phi_doan_the is 'Sổ thu đảng phí / đoàn phí / công đoàn phí theo kỳ, mức theo QĐ 342-QĐ/TW (PH5)';

create table if not exists khen_thuong_ky_luat (
  id              bigint generated always as identity primary key,
  doi_tuong       varchar(20) not null default 'ca-nhan',  -- ca-nhan/tap-the
  nhan_su_id      bigint references nhan_su(id) on delete cascade,
  don_vi_id       bigint references don_vi(id),
  to_chuc_id      bigint references to_chuc_doan_the(id),
  pham_vi         varchar(20) not null,   -- chinh-quyen/dang/cong-doan/doan-tn
  loai            varchar(20) not null,   -- khen-thuong/ky-luat
  hinh_thuc       varchar(150) not null,
  cap_quyet_dinh  varchar(30),            -- co-so/bo-nganh/nha-nuoc
  so_quyet_dinh   varchar(100),
  ngay_quyet_dinh date,
  nam             smallint,
  ly_do           text,
  tep_dinh_kem    varchar(500),
  created_at      timestamptz not null default now(),
  check (nhan_su_id is not null or don_vi_id is not null)
);
comment on table khen_thuong_ky_luat is 'Khen thưởng - kỷ luật cá nhân/tập thể, dùng chung chính quyền + Đảng + đoàn thể (PH5)';

create table if not exists thi_dua (
  id                bigint generated always as identity primary key,
  doi_tuong         varchar(20) not null default 'ca-nhan',
  nhan_su_id        bigint references nhan_su(id) on delete cascade,
  don_vi_id         bigint references don_vi(id),
  nam               smallint not null,
  danh_hieu_dang_ky varchar(150),
  danh_hieu_dat     varchar(150),
  trang_thai        varchar(20) not null default 'da-dang-ky',
                    -- da-dang-ky/don-vi-binh-xet/hoi-dong-vien-duyet/da-cong-nhan
  created_at        timestamptz not null default now(),
  check (nhan_su_id is not null or don_vi_id is not null)
);
comment on table thi_dua is 'Đăng ký thi đua đầu năm & bình xét danh hiệu cuối năm (PH5)';

do $$
declare t text;
begin
  foreach t in array array['sinh_hoat_dinh_ky','diem_danh_sinh_hoat','thu_phi_doan_the','khen_thuong_ky_luat','thi_dua']
  loop
    execute format('drop trigger if exists trg_%s_nhat_ky on %I', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);

    execute format('drop policy if exists "doc_%s_auth_tam" on %I', t, t);
    execute format('create policy "doc_%s_auth_tam" on %I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists "ghi_%s_auth_tam" on %I', t, t);
    execute format('create policy "ghi_%s_auth_tam" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;
