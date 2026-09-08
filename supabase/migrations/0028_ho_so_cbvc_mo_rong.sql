-- ============================================================
-- 0028 — Hồ sơ CBVC đầy đủ (mẫu 2C-BNV/2008) + quá trình công tác + bằng cấp
-- Phần 1/6 của kế hoạch hoàn thiện PH5 Nhân sự & Đảng - Đoàn thể.
-- ============================================================

alter table nhan_su
  add column if not exists anh_dai_dien        varchar(500),
  add column if not exists que_quan            varchar(255),
  add column if not exists dia_chi_thuong_tru  varchar(255),
  add column if not exists dia_chi_hien_nay    varchar(255),
  add column if not exists dan_toc             varchar(50),
  add column if not exists ton_giao            varchar(50),
  add column if not exists ngay_cap_cccd       date,
  add column if not exists noi_cap_cccd        varchar(150),
  add column if not exists tinh_trang_hon_nhan varchar(20),
  add column if not exists so_bhxh             varchar(20),
  add column if not exists ma_so_thue          varchar(20),
  add column if not exists so_tai_khoan        varchar(30),
  add column if not exists ngan_hang           varchar(150),
  add column if not exists lien_he_khan_cap    varchar(150),
  add column if not exists sdt_khan_cap        varchar(30),
  add column if not exists hoc_ham             varchar(50),
  add column if not exists chuyen_nganh        varchar(150),
  add column if not exists ly_luan_chinh_tri   varchar(30),
  add column if not exists quan_ly_nha_nuoc    varchar(50),
  add column if not exists bac_luong           varchar(10),
  add column if not exists he_so_luong         numeric(5,2),
  add column if not exists phu_cap_chuc_vu     numeric(5,2),
  add column if not exists ngay_huong_luong    date,
  add column if not exists ngay_nghi_viec      date,
  add column if not exists nguoi_quan_ly_id    bigint references nhan_su(id);

comment on column nhan_su.so_dinh_danh_ca_nhan is 'CCCD/CMND — YÊU CẦU BẢO MẬT: dữ liệu cá nhân (NĐ 13/2023)';
comment on column nhan_su.so_bhxh is 'YÊU CẦU BẢO MẬT: dữ liệu cá nhân (NĐ 13/2023)';
comment on column nhan_su.so_tai_khoan is 'YÊU CẦU BẢO MẬT: dữ liệu cá nhân (NĐ 13/2023)';

-- ─── Quá trình công tác / diễn biến nhân sự ───
create table if not exists qua_trinh_cong_tac (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  loai           varchar(30) not null,
                 -- tuyen-dung/dieu-dong/bo-nhiem/mien-nhiem/nang-luong/
                 -- nang-ngach/biet-phai/nghi-huu/thoi-viec/khac
  tieu_de        varchar(255) not null,
  so_quyet_dinh  varchar(100),
  ngay_ky        date,
  ngay_hieu_luc  date not null,
  ngay_ket_thuc  date,
  don_vi_id      bigint references don_vi(id),
  chuc_vu        varchar(150),
  mo_ta          text,
  tep_dinh_kem   varchar(500),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table qua_trinh_cong_tac is 'Quá trình công tác / diễn biến nhân sự CBVC (PH5)';

-- ─── Bằng cấp / chứng chỉ ngoài chứng chỉ hành nghề xây dựng ───
create table if not exists bang_cap (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  loai           varchar(30) not null,
                 -- bang-cap/ly-luan-chinh-tri/quan-ly-nha-nuoc/ngoai-ngu/tin-hoc/
                 -- an-toan-lao-dong/khac
  ten            varchar(255) not null,
  chuyen_nganh   varchar(150),
  co_so_dao_tao  varchar(255),
  xep_loai       varchar(50),
  nam_tot_nghiep smallint,
  ngay_cap       date,
  ngay_het_han   date,
  tep_dinh_kem   varchar(500),
  created_at     timestamptz not null default now()
);
comment on table bang_cap is 'Bằng cấp, chứng chỉ đào tạo (ngoài chứng chỉ hành nghề xây dựng) của CBVC (PH5)';

do $$
declare t text;
begin
  foreach t in array array['qua_trinh_cong_tac']
  loop
    execute format('drop trigger if exists trg_%s_updated_at on %I', t, t);
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
  end loop;

  foreach t in array array['qua_trinh_cong_tac','bang_cap']
  loop
    execute format('drop trigger if exists trg_%s_nhat_ky on %I', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Đọc: mọi authenticated (hồ sơ nội bộ, không public — bảng nhan_su gốc đã theo quy tắc này từ 0001)
drop policy if exists "doc_qua_trinh_cong_tac_auth" on qua_trinh_cong_tac;
create policy "doc_qua_trinh_cong_tac_auth" on qua_trinh_cong_tac for select to authenticated using (true);
drop policy if exists "doc_bang_cap_auth" on bang_cap;
create policy "doc_bang_cap_auth" on bang_cap for select to authenticated using (true);

-- Ghi: quản trị hệ thống hoặc cán bộ tổ chức (vai trò 'can-bo-to-chuc' được thêm ở 0033)
-- Tạm thời cho phép mọi authenticated ghi để không chặn CRUD trước khi 0033 siết lại theo vai trò,
-- đúng nguyên tắc "0004 — nới lỏng trước, siết theo vai trò sau" đã áp dụng cho các bảng khác.
drop policy if exists "ghi_qua_trinh_cong_tac_auth" on qua_trinh_cong_tac;
create policy "ghi_qua_trinh_cong_tac_auth" on qua_trinh_cong_tac for all to authenticated using (true) with check (true);
drop policy if exists "ghi_bang_cap_auth" on bang_cap;
create policy "ghi_bang_cap_auth" on bang_cap for all to authenticated using (true) with check (true);
