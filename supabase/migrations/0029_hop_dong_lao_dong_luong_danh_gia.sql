-- ============================================================
-- 0029 — Hợp đồng lao động, ngạch/bậc lương, đánh giá CBVC, giờ NCKH
-- Phần 2/6 của kế hoạch hoàn thiện PH5 Nhân sự & Đảng - Đoàn thể.
-- ============================================================

create table if not exists hop_dong_lao_dong (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  so_hop_dong    varchar(100),
  loai_hop_dong  varchar(30) not null,
                 -- thu-viec/xac-dinh-thoi-han/khong-xac-dinh/vien-chuc-tap-su/
                 -- vien-chuc/khoan-viec
  ngay_ky        date,
  tu_ngay        date not null,
  den_ngay       date,
  luong_co_ban   numeric(15,2),
  luong_bhxh     numeric(15,2),
  trang_thai     varchar(20) not null default 'hieu-luc',  -- hieu-luc/het-han/cham-dut
  tep_dinh_kem   varchar(500),
  ghi_chu        varchar(500),
  created_at     timestamptz not null default now()
);
comment on table hop_dong_lao_dong is 'Hợp đồng lao động / hợp đồng làm việc viên chức (PH5)';

create table if not exists luong_ngach_bac (
  id              bigint generated always as identity primary key,
  nhan_su_id      bigint not null references nhan_su(id) on delete cascade,
  ngay_hieu_luc   date not null,
  ngach           varchar(100),
  ma_ngach        varchar(20),
  bac             varchar(10),
  he_so_luong     numeric(5,2) not null,
  phu_cap_chuc_vu numeric(5,2) default 0,
  phu_cap_tnvk    numeric(5,2) default 0,
  loai_thay_doi   varchar(30) not null,
                  -- xep-lan-dau/nang-bac-thuong-xuyen/nang-bac-truoc-han/
                  -- nang-ngach/dieu-chinh
  so_quyet_dinh   varchar(100),
  ly_do           varchar(500),
  created_at      timestamptz not null default now()
);
comment on table luong_ngach_bac is 'Lịch sử ngạch/bậc/hệ số lương CBVC theo NĐ 204/2004 và văn bản sửa đổi (PH5)';

create table if not exists danh_gia_cbvc (
  id                bigint generated always as identity primary key,
  nhan_su_id        bigint not null references nhan_su(id) on delete cascade,
  nam               smallint not null,
  ky                varchar(10) not null default 'nam',  -- quy-1/quy-2/quy-3/quy-4/nam
  tu_xep_loai       varchar(20),
  xep_loai          varchar(20),  -- htxsnv/httnv/htnv/khtnv
  diem              numeric(5,2),
  nguoi_danh_gia_id bigint references nhan_su(id),
  nhan_xet          text,
  trang_thai        varchar(20) not null default 'nhap',  -- nhap/cho-duyet/da-duyet
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now(),
  unique (nhan_su_id, nam, ky)
);
comment on table danh_gia_cbvc is 'Đánh giá, xếp loại chất lượng CBVC hằng năm theo NĐ 90/2020 (PH5)';

create table if not exists gio_nghien_cuu (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  nam            smallint not null,
  de_tai_id      bigint references de_tai(id),
  loai_hoat_dong varchar(50) not null,  -- de-tai/bai-bao/tieu-chuan/huong-dan-ncs/hoi-thao
  noi_dung       varchar(500),
  so_gio         numeric(7,2) not null,
  trang_thai     varchar(20) not null default 'nhap',
  created_at     timestamptz not null default now()
);
comment on table gio_nghien_cuu is 'Kê khai giờ nghiên cứu khoa học của CBVC, liên kết đề tài PH2 (PH5)';

do $$
declare t text;
begin
  foreach t in array array['danh_gia_cbvc']
  loop
    execute format('drop trigger if exists trg_%s_updated_at on %I', t, t);
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
  end loop;

  foreach t in array array['hop_dong_lao_dong','luong_ngach_bac','danh_gia_cbvc','gio_nghien_cuu']
  loop
    execute format('drop trigger if exists trg_%s_nhat_ky on %I', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);

    execute format('drop policy if exists "doc_%s_auth" on %I', t, t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);

    execute format('drop policy if exists "ghi_%s_auth" on %I', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;
