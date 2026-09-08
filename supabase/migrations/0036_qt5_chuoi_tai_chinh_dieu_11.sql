-- ============================================================
-- 0036 — Đợt 2 kế hoạch hoàn thiện module Hợp đồng: chuỗi tài chính QT5
--        (docs/review-module-hop-dong-2026-09.md §6 Đợt 2)
--
-- Số hóa Điều 11 QC 2815 — chuỗi bắt buộc trước nay chưa có mắt xích nào:
--   BBNT → đề nghị xuất hóa đơn → TCKT xuất HĐ → tiền về
--        → tờ phân phối (Bảng 1) → LĐV/GĐ duyệt → TCKT chuyển tiền (SLA 3 ngày)
--        → thanh quyết toán với chủ trì
-- Kèm tạm ứng (Đ.7.7) và chế tài lãi 130% khi quá hạn (Đ.14 mục 2 dòng 6).
--
-- LƯU Ý: bố cục trường bám theo văn bản quy chế. Nhãn hiển thị và mẫu in sẽ
-- đối chiếu lại với mẫu giấy hiện hành của P.TCKT khi nhận được (không đổi lược đồ).
-- ============================================================

-- ─── 1. Đề nghị xuất hóa đơn (Đ.11.1) ───
create table if not exists de_nghi_xuat_hoa_don (
  id                  bigint generated always as identity primary key,
  hop_dong_id         bigint not null references hop_dong(id) on delete cascade,
  dot_thanh_toan_id   bigint references dot_thanh_toan(id) on delete set null,
  so_tien             numeric(15,2) not null,          -- triệu đồng, trước thuế GTGT
  ngay_de_nghi        date not null default current_date,
  nguoi_de_nghi_id    bigint references nhan_su(id),   -- chủ trì hợp đồng
  can_cu_nghiem_thu   varchar(255),                    -- số/ngày BBNT làm căn cứ
  trang_thai          varchar(30) not null default 'du-thao',
                      -- du-thao | cho-ke-toan-dv | cho-tckt-xuat | da-xuat | tu-choi
  nguoi_ke_toan_dv_id bigint references nhan_su(id),   -- phụ trách kế toán đơn vị xác nhận
  ngay_ke_toan_dv     date,
  nguoi_tckt_id       bigint references nhan_su(id),   -- P.TCKT xuất hóa đơn
  so_hoa_don          varchar(50),
  ngay_xuat_hoa_don   date,
  ly_do_tu_choi       varchar(500),
  ghi_chu             varchar(500),
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
comment on table de_nghi_xuat_hoa_don is
  'Đ.11.1 — chủ trì lập đề nghị xuất hóa đơn trên cơ sở nghiệm thu; phụ trách kế toán đơn vị xác nhận; P.TCKT xuất hóa đơn.';

-- ─── 2. Tờ phân phối quyết toán hợp đồng (Đ.11.1, 11.2, 12.4a) ───
create table if not exists to_phan_phoi (
  id                 bigint generated always as identity primary key,
  hop_dong_id        bigint not null references hop_dong(id) on delete cascade,
  ky                 varchar(20),                  -- kỳ/đợt phân phối, vd '2026-Q3'
  so_tien_goc        numeric(15,2) not null,       -- tiền về làm cơ sở phân phối (trước thuế)
  quy_chu_tri        numeric(15,2),
  quy_don_vi         numeric(15,2),
  cpql_ln_chi_khac   numeric(15,2),
  khtscd             numeric(15,2),
  ho_tro_di_lai      numeric(15,2) not null default 0,
  giam_giao_chu_tri  numeric(15,2) not null default 0,  -- phần giảm cho chủ trì, trong trần Đ.12.4a
  trang_thai         varchar(20) not null default 'du-thao',  -- du-thao | cho-duyet | da-duyet
  nguoi_lap_id       bigint references nhan_su(id),
  ngay_lap           date not null default current_date,
  nguoi_duyet_id     bigint references nhan_su(id),
  ngay_duyet         date,
  ghi_chu            varchar(500),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table to_phan_phoi is
  'Đ.11.1/11.2 — bản phân phối quyết toán hợp đồng: HĐ Viện ký do P.TCKT trình Lãnh đạo Viện ký duyệt; '
  'HĐ đơn vị ký do Trưởng đơn vị ký duyệt. Các quỹ tính theo Bảng 1 trên số tiền THỰC VỀ.';
comment on column to_phan_phoi.giam_giao_chu_tri is
  'Đ.12.4a — đơn vị được giao cho chủ trì thấp hơn cột 3 Bảng 1, phần giảm không vượt trần 2%/5%/2% theo nhóm.';

-- ─── 3. Tạm ứng hợp đồng (Đ.7.7) + chế tài lãi 130% (Đ.14 mục 2 dòng 6) ───
create table if not exists tam_ung (
  id              bigint generated always as identity primary key,
  hop_dong_id     bigint not null references hop_dong(id) on delete cascade,
  nhan_su_id      bigint references nhan_su(id),   -- chủ trì nhận tạm ứng
  so_tien         numeric(15,2) not null,          -- triệu đồng
  ngay_tam_ung    date not null default current_date,
  han_hoan        date,
  so_tien_da_hoan numeric(15,2) not null default 0,
  ngay_hoan       date,
  lai_suat_goc    numeric(5,2),                    -- %/năm — lãi suất Viện áp dụng tại thời điểm tạm ứng
  trang_thai      varchar(20) not null default 'dang-no',  -- dang-no | da-hoan | mien
  ghi_chu         varchar(500),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table tam_ung is
  'Đ.7.7 — chủ trì đề nghị tạm ứng trước từ Viện khi HĐ chưa có kinh phí, theo phê duyệt Viện trưởng, lãi suất theo quy định của Viện. '
  'Quá hạn: thu lãi bằng 130% lãi suất áp dụng kể từ thời điểm quá hạn (Đ.14 mục 2 dòng 6).';

-- ─── 4. Trigger dùng chung: updated_at + nhật ký + RLS ───
do $$
declare t text;
begin
  foreach t in array array['de_nghi_xuat_hoa_don','to_phan_phoi','tam_ung']
  loop
    execute format('drop trigger if exists trg_%s_updated_at on %I', t, t);
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
    execute format('drop trigger if exists trg_%s_nhat_ky on %I', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);

    execute format('drop policy if exists "doc_%s_auth" on %I', t, t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
    execute format('drop policy if exists "ghi_%s_auth" on %I', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ─── 5. Thẩm quyền từng bước của chuỗi Đ.11 ───
create or replace function fn_kiem_soat_de_nghi_xuat_hd() returns trigger
language plpgsql security definer as $$
begin
  if new.trang_thai is not distinct from old.trang_thai then return new; end if;

  -- Phụ trách kế toán đơn vị xác nhận trước khi chuyển P.TCKT (Đ.11.1)
  if new.trang_thai = 'cho-tckt-xuat'
     and not (fn_truong_don_vi_tro_len() or fn_vai_tro() in ('phu-trach-ke-toan-dv','phong-tckt')) then
    raise exception 'Điều 11.1 QC 2815: đề nghị xuất hóa đơn phải do Phụ trách kế toán đơn vị xác nhận trước khi chuyển P.TCKT (vai trò hiện tại: %).', fn_vai_tro()
      using errcode = '42501';
  end if;

  -- Chỉ P.TCKT được ghi nhận đã xuất hóa đơn
  if new.trang_thai = 'da-xuat' then
    if not fn_tckt_tro_len() then
      raise exception 'Điều 11.1 QC 2815: chỉ Phòng Tài chính – Kế toán được xuất hóa đơn (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    if coalesce(new.so_hoa_don, '') = '' or new.ngay_xuat_hoa_don is null then
      raise exception 'Điều 11.1 QC 2815: phải ghi Số hóa đơn và Ngày xuất hóa đơn — đây là mốc tính nghĩa vụ VAT 1 năm (Đ.14 mục 2 dòng 7).'
        using errcode = '23514';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_de_nghi_xuat_hd_kiem_soat on de_nghi_xuat_hoa_don;
create trigger trg_de_nghi_xuat_hd_kiem_soat
  before update on de_nghi_xuat_hoa_don
  for each row execute function fn_kiem_soat_de_nghi_xuat_hd();

-- Khi TCKT xuất hóa đơn: ghi ngược số/ngày hóa đơn về đợt thanh toán liên quan (khép vòng với 0034)
create or replace function fn_dong_bo_hoa_don_ve_dot() returns trigger
language plpgsql security definer as $$
begin
  if new.trang_thai = 'da-xuat' and new.dot_thanh_toan_id is not null
     and (old.trang_thai is distinct from 'da-xuat') then
    update dot_thanh_toan
       set so_hoa_don = new.so_hoa_don,
           ngay_xuat_hoa_don = new.ngay_xuat_hoa_don
     where id = new.dot_thanh_toan_id;
  end if;
  return new;
end $$;

drop trigger if exists trg_de_nghi_xuat_hd_dong_bo_dot on de_nghi_xuat_hoa_don;
create trigger trg_de_nghi_xuat_hd_dong_bo_dot
  after update on de_nghi_xuat_hoa_don
  for each row execute function fn_dong_bo_hoa_don_ve_dot();

-- Duyệt tờ phân phối: HĐ Viện ký → Lãnh đạo Viện; HĐ đơn vị ký → Trưởng đơn vị (Đ.11.1/11.2)
create or replace function fn_kiem_soat_to_phan_phoi() returns trigger
language plpgsql security definer as $$
declare v_cap_ky text;
begin
  if new.trang_thai is not distinct from old.trang_thai then return new; end if;
  if new.trang_thai <> 'da-duyet' then return new; end if;

  select cap_ky into v_cap_ky from hop_dong where id = new.hop_dong_id;
  if v_cap_ky = 'don-vi-ky' then
    if not fn_truong_don_vi_tro_len() then
      raise exception 'Điều 11.2 QC 2815: tờ phân phối HĐ do đơn vị ký phải do Trưởng đơn vị ký duyệt (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
  elsif not fn_lanh_dao_tro_len() then
    raise exception 'Điều 11.1 QC 2815: tờ phân phối HĐ Viện ký do P.TCKT trình Lãnh đạo Viện ký duyệt (vai trò hiện tại: %).', fn_vai_tro()
      using errcode = '42501';
  end if;

  if new.ngay_duyet is null then new.ngay_duyet := current_date; end if;
  return new;
end $$;

drop trigger if exists trg_to_phan_phoi_kiem_soat on to_phan_phoi;
create trigger trg_to_phan_phoi_kiem_soat
  before update on to_phan_phoi
  for each row execute function fn_kiem_soat_to_phan_phoi();

-- ─── 6. SLA 3 ngày làm việc của P.TCKT (Đ.11.1) — sinh tự động tại đúng điểm phát sinh ───
create or replace function fn_han_3_ngay_lam_viec(p_tu date) returns timestamptz
language sql immutable as $$
  -- Cộng 3 ngày làm việc, bỏ thứ bảy và chủ nhật (không xét ngày lễ).
  select (
    select d from generate_series(p_tu + 1, p_tu + 10, interval '1 day') d
    where extract(isodow from d) < 6
    offset 2 limit 1
  )::timestamptz;
$$;
comment on function fn_han_3_ngay_lam_viec is 'Đ.11.1 — P.TCKT giải quyết mỗi công việc thanh quyết toán trong không quá 03 ngày làm việc kể từ khi đủ hồ sơ.';

create or replace function fn_sinh_sla_tckt() returns trigger
language plpgsql security definer as $$
declare v_ten text; v_loai text;
begin
  if new.trang_thai is not distinct from old.trang_thai then return new; end if;

  if tg_table_name = 'de_nghi_xuat_hoa_don' and new.trang_thai = 'cho-tckt-xuat' then
    v_loai := 'de_nghi_xuat_hoa_don'; v_ten := 'P.TCKT xuất hóa đơn (Đ.11.1 — 3 ngày làm việc)';
  elsif tg_table_name = 'to_phan_phoi' and new.trang_thai = 'cho-duyet' then
    v_loai := 'to_phan_phoi'; v_ten := 'Duyệt & chuyển tiền theo tờ phân phối (Đ.11.1 — 3 ngày làm việc)';
  else
    return new;
  end if;

  insert into sla_theo_doi (loai_doi_tuong, doi_tuong_id, ten_sla, han_chot, trang_thai, ghi_chu)
  values (v_loai, new.id, v_ten, fn_han_3_ngay_lam_viec(current_date), 'dang-chay',
          'Sinh tự động khi hồ sơ chuyển đến P.TCKT (migration 0036)');
  return new;
end $$;

drop trigger if exists trg_de_nghi_xuat_hd_sla on de_nghi_xuat_hoa_don;
create trigger trg_de_nghi_xuat_hd_sla
  after update on de_nghi_xuat_hoa_don
  for each row execute function fn_sinh_sla_tckt();

drop trigger if exists trg_to_phan_phoi_sla on to_phan_phoi;
create trigger trg_to_phan_phoi_sla
  after update on to_phan_phoi
  for each row execute function fn_sinh_sla_tckt();

-- Đóng SLA khi việc hoàn tất
create or replace function fn_dong_sla_tckt() returns trigger
language plpgsql security definer as $$
begin
  if (tg_table_name = 'de_nghi_xuat_hoa_don' and new.trang_thai in ('da-xuat','tu-choi'))
     or (tg_table_name = 'to_phan_phoi' and new.trang_thai = 'da-duyet') then
    update sla_theo_doi
       set trang_thai = 'hoan-thanh', ngay_hoan_thanh = now()
     where loai_doi_tuong = tg_table_name and doi_tuong_id = new.id and trang_thai = 'dang-chay';
  end if;
  return new;
end $$;

drop trigger if exists trg_de_nghi_xuat_hd_dong_sla on de_nghi_xuat_hoa_don;
create trigger trg_de_nghi_xuat_hd_dong_sla
  after update on de_nghi_xuat_hoa_don
  for each row execute function fn_dong_sla_tckt();

drop trigger if exists trg_to_phan_phoi_dong_sla on to_phan_phoi;
create trigger trg_to_phan_phoi_dong_sla
  after update on to_phan_phoi
  for each row execute function fn_dong_sla_tckt();
