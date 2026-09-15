-- ============================================================
-- Migration 0047: Phân hệ Lịch cơ quan, Đặt phòng họp & Điều động xe
-- Chuẩn hóa theo Mẫu bảng Viện Khoa học Công nghệ Xây dựng (IBST)
-- ============================================================

-- 1. DANH MỤC PHÒNG HỌP & HỘI TRƯỜNG
create table if not exists dm_phong_hop (
  id          uuid default gen_random_uuid() primary key,
  ma_phong    varchar(50) unique not null,
  ten_phong   varchar(150) not null,
  suc_chua    int default 20,
  dia_diem    varchar(255) default 'Tòa nhà IBST, 81 Trần Cung, Cầu Giấy, Hà Nội',
  mau_sac     varchar(20) default '#0284c7',
  thiet_bi    text,
  trang_thai  varchar(30) not null default 'san_sang',
  thu_tu      int default 1,
  created_at  timestamptz not null default now()
);

comment on table dm_phong_hop is 'Danh mục phòng họp, hội trường trực thuộc Viện IBST';

-- Seed danh mục phòng họp chuẩn
insert into dm_phong_hop (ma_phong, ten_phong, suc_chua, mau_sac, thiet_bi, thu_tu) values
  ('PH-LANH-DAO', 'Phòng Lãnh đạo', 12, '#0284c7', 'Bàn tròn VIP, micro chủ tọa, điều hòa trung tâm', 1),
  ('PHONG-HOP-1', 'Phòng họp 1', 30, '#10b981', 'Máy chiếu Sony Laser, 4 micro không dây, kết nối Zoom/Teams', 2),
  ('PHONG-HOP-2', 'Phòng họp 2', 20, '#6366f1', 'Màn hình tương tác 85 inch, camera hội nghị họp trực tuyến', 3),
  ('HOI-TRUONG',  'Hội trường', 150, '#f59e0b', 'Âm thanh vòm sân khấu, 2 máy chiếu công suất lớn, bục phát biểu', 4),
  ('BXD',         'Bộ Xây dựng (BXD)', 50, '#ef4444', 'Trụ sở Bộ Xây dựng - 37 Lê Đại Hành, Hai Bà Trưng, Hà Nội', 5),
  ('ONLINE',      'Trực tuyến (Zoom/Teams)', 300, '#8b5cf6', 'Phòng họp ảo liên thông e-Office IBST', 6)
on conflict (ma_phong) do update set
  ten_phong = excluded.ten_phong,
  mau_sac = excluded.mau_sac,
  thu_tu = excluded.thu_tu;

-- 2. DANH MỤC PHƯƠNG TIỆN XE CÔNG TÁC
create table if not exists dm_xe_cong_tac (
  id               uuid default gen_random_uuid() primary key,
  bien_so          varchar(30) unique not null,
  loai_xe          varchar(100) not null,
  so_cho           int default 5,
  lai_xe_mac_dinh  varchar(150),
  sdt_lai_xe       varchar(50),
  trang_thai       varchar(30) not null default 'san_sang',
  thu_tu           int default 1,
  created_at       timestamptz not null default now()
);

comment on table dm_xe_cong_tac is 'Danh mục phương tiện ô tô phục vụ công tác của Viện IBST';

-- Seed danh mục xe công tác
insert into dm_xe_cong_tac (bien_so, loai_xe, so_cho, lai_xe_mac_dinh, sdt_lai_xe, thu_tu) values
  ('29A-678.90', 'Xe 4 chỗ (Toyota Camry)', 5, 'Nguyễn Văn Hùng (Đội xe VP)', '0912.345.678', 1),
  ('29A-888.99', 'Xe 7 chỗ (Toyota Fortuner)', 7, 'Trần Đình Trọng (Đội xe VP)', '0988.765.432', 2),
  ('29B-123.45', 'Xe 16 chỗ (Ford Transit)', 16, 'Lê Anh Dũng (Đội xe VP)', '0903.112.233', 3)
on conflict (bien_so) do update set
  loai_xe = excluded.loai_xe,
  so_cho = excluded.so_cho,
  lai_xe_mac_dinh = excluded.lai_xe_mac_dinh,
  sdt_lai_xe = excluded.sdt_lai_xe,
  thu_tu = excluded.thu_tu;

-- 3. BẢNG LỊCH CƠ QUAN
create table if not exists lich_co_quan (
  id                uuid default gen_random_uuid() primary key,
  tieu_de           varchar(500) not null,
  noi_dung          text,
  ngay              date not null,
  thu               varchar(20) not null,
  buoi              varchar(20) not null default 'sang' check (buoi in ('sang', 'chieu', 'ca_ngay')),
  gio_bat_dau       varchar(10) not null,
  gio_ket_thuc      varchar(10),
  lanh_dao_chu_tri  varchar(150) not null,
  cot_ma_tran       varchar(50) not null default 'khac' check (cot_ma_tran in ('vien_truong', 'dan', 'binh', 'khoi', 'khac')),
  don_vi_chuan_bi   varchar(255),
  nguoi_chuan_bi    varchar(255),
  nhan_su_id        bigint references nhan_su(id) on delete set null,
  thanh_phan        text not null,
  dia_diem          varchar(255) not null,
  phong_hop_id      uuid references dm_phong_hop(id) on delete set null,
  xe_cong_tac       varchar(255),
  xe_id             uuid references dm_xe_cong_tac(id) on delete set null,
  loai_lich         varchar(50) not null default 'Lich-tuan',
  trang_thai        varchar(30) not null default 'Da-duyet' check (trang_thai in ('Cho-duyet', 'Da-duyet', 'Tu-choi', 'Huy')),
  ghi_chu_chuan_bi  text,
  bien_ban_ket_luan text,
  nguoi_tao_id      uuid references auth.users(id) on delete set null,
  nguoi_duyet_id    uuid references auth.users(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

comment on table lich_co_quan is 'Lịch công tác cơ quan, lịch Ban Giám đốc và đăng ký phòng họp Viện IBST';

-- Index phục vụ truy vấn theo tuần & ma trận
create index if not exists idx_lich_co_quan_ngay on lich_co_quan(ngay);
create index if not exists idx_lich_co_quan_cot on lich_co_quan(cot_ma_tran);
create index if not exists idx_lich_co_quan_phong on lich_co_quan(phong_hop_id, ngay);
create index if not exists idx_lich_co_quan_xe on lich_co_quan(xe_id, ngay);

-- 4. BẢNG GHI CHÚ LỊCH TUẦN
create table if not exists ghi_chu_lich_tuan (
  id           uuid default gen_random_uuid() primary key,
  nam          int not null,
  tuan_thu     int not null,
  tu_ngay      date not null,
  den_ngay     date not null,
  noi_dung     text not null,
  nguoi_ghi    varchar(150),
  updated_at   timestamptz not null default now(),
  unique (nam, tuan_thu)
);

comment on table ghi_chu_lich_tuan is 'Ghi chú chỉ đạo chung cho từng tuần công tác của Lãnh đạo Viện';

-- 5. FUNCTION KIỂM TRA XUNG ĐỘT PHÒNG HỌP & XE
create or replace function fn_check_xung_dot_phong_xe(
  p_ngay date,
  p_gio_bat_dau text,
  p_gio_ket_thuc text,
  p_phong_hop_id uuid default null,
  p_xe_id uuid default null,
  p_exclude_id uuid default null
)
returns table (
  xung_dot_loai text,
  event_id uuid,
  tieu_de text,
  gio_bat_dau text,
  gio_ket_thuc text,
  ten_tai_nguyen text
)
language plpgsql
security definer
as $$
declare
  v_gio_kt text := coalesce(nullif(p_gio_ket_thuc, ''), '23:59');
begin
  -- 1. Kiểm tra trùng phòng họp
  if p_phong_hop_id is not null then
    return query
    select
      'phong_hop'::text as xung_dot_loai,
      l.id as event_id,
      l.tieu_de::text as tieu_de,
      l.gio_bat_dau::text as gio_bat_dau,
      coalesce(l.gio_ket_thuc, '')::text as gio_ket_thuc,
      p.ten_phong::text as ten_tai_nguyen
    from lich_co_quan l
    join dm_phong_hop p on p.id = l.phong_hop_id
    where l.ngay = p_ngay
      and l.phong_hop_id = p_phong_hop_id
      and l.trang_thai in ('Cho-duyet', 'Da-duyet')
      and (p_exclude_id is null or l.id <> p_exclude_id)
      -- Điều kiện giao thoa khoảng thời gian: max(start) < min(end)
      and (l.gio_bat_dau < v_gio_kt and coalesce(nullif(l.gio_ket_thuc, ''), '23:59') > p_gio_bat_dau);
  end if;

  -- 2. Kiểm tra trùng xe công tác
  if p_xe_id is not null then
    return query
    select
      'xe_cong_tac'::text as xung_dot_loai,
      l.id as event_id,
      l.tieu_de::text as tieu_de,
      l.gio_bat_dau::text as gio_bat_dau,
      coalesce(l.gio_ket_thuc, '')::text as gio_ket_thuc,
      x.bien_so::text as ten_tai_nguyen
    from lich_co_quan l
    join dm_xe_cong_tac x on x.id = l.xe_id
    where l.ngay = p_ngay
      and l.xe_id = p_xe_id
      and l.trang_thai in ('Cho-duyet', 'Da-duyet')
      and (p_exclude_id is null or l.id <> p_exclude_id)
      and (l.gio_bat_dau < v_gio_kt and coalesce(nullif(l.gio_ket_thuc, ''), '23:59') > p_gio_bat_dau);
  end if;
end;
$$;

-- 6. BẬT RLS & CHÍNH SÁCH BẢO MẬT THEO MA TRẬN PHÂN QUYỀN
alter table dm_phong_hop enable row level security;
alter table dm_xe_cong_tac enable row level security;
alter table lich_co_quan enable row level security;
alter table ghi_chu_lich_tuan enable row level security;

-- Policies dm_phong_hop
drop policy if exists dm_phong_hop_select on dm_phong_hop;
create policy dm_phong_hop_select on dm_phong_hop for select to public using (true);

drop policy if exists dm_phong_hop_write on dm_phong_hop;
create policy dm_phong_hop_write on dm_phong_hop for all to authenticated using (true) with check (true);

-- Policies dm_xe_cong_tac
drop policy if exists dm_xe_cong_tac_select on dm_xe_cong_tac;
create policy dm_xe_cong_tac_select on dm_xe_cong_tac for select to public using (true);

drop policy if exists dm_xe_cong_tac_write on dm_xe_cong_tac;
create policy dm_xe_cong_tac_write on dm_xe_cong_tac for all to authenticated using (true) with check (true);

-- Policies lich_co_quan
drop policy if exists lich_co_quan_select on lich_co_quan;
create policy lich_co_quan_select on lich_co_quan for select to public using (true);

drop policy if exists lich_co_quan_insert on lich_co_quan;
create policy lich_co_quan_insert on lich_co_quan for insert to authenticated with check (true);

drop policy if exists lich_co_quan_update on lich_co_quan;
create policy lich_co_quan_update on lich_co_quan for update to authenticated using (true) with check (true);

drop policy if exists lich_co_quan_delete on lich_co_quan;
create policy lich_co_quan_delete on lich_co_quan for delete to authenticated using (true);

-- Policies ghi_chu_lich_tuan
drop policy if exists ghi_chu_lich_tuan_select on ghi_chu_lich_tuan;
create policy ghi_chu_lich_tuan_select on ghi_chu_lich_tuan for select to public using (true);

drop policy if exists ghi_chu_lich_tuan_write on ghi_chu_lich_tuan;
create policy ghi_chu_lich_tuan_write on ghi_chu_lich_tuan for all to authenticated using (true) with check (true);
