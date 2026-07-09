-- ============================================================
-- IBST ERP — Khởi tạo CSDL theo Khung dữ liệu Bộ Xây dựng
-- Căn cứ: QĐ 942/QĐ-BXD (khung kiến trúc + quản trị dữ liệu),
--         QĐ 945/QĐ-BXD (từ điển dữ liệu dùng chung),
--         QĐ 946/QĐ-BXD (danh mục dữ liệu gốc/chủ/chuyên ngành),
--         QĐ 943/QĐ-BXD (danh mục dữ liệu mở)
-- ============================================================

-- ─── LỚP DANH MỤC DÙNG CHUNG (cấu trúc MaMuc/TenMuc theo TĐ 945) ───
create table dm_danh_muc (
  id          bigint generated always as identity primary key,
  nhom        varchar(50)  not null,
  ma_muc      varchar(50)  not null,
  ten_muc     varchar(150) not null,
  ghi_chu     varchar(500),
  created_at  timestamptz not null default now(),
  unique (nhom, ma_muc)
);
comment on table dm_danh_muc is 'Danh mục dùng chung — cấu trúc Tham chiếu danh mục (Mã mục/Tên mục) theo Từ điển dữ liệu 945/QĐ-BXD';

-- ─── LỚP DỮ LIỆU CHỦ ───
create table don_vi (
  id            bigint generated always as identity primary key,
  ma_dinh_danh  varchar(150) unique,          -- BXD-CDE-010 MaDinhDanh
  ten_don_vi    varchar(150) not null,        -- BXD-CDE-025 TenToChuc
  ten_viet_tat  varchar(50),
  loai_don_vi   varchar(50),                  -- viện chuyên ngành / phân viện / trung tâm / phòng chức năng
  trang_thai    varchar(20) not null default 'hoat-dong',  -- BXD-CDE-030 TinhTrangToChuc
  ghi_chu       varchar(500),                 -- BXD-CDE-004 GhiChu
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table don_vi is 'Dữ liệu chủ: Tổ chức (BXD-CDE-033) — 21 đơn vị trực thuộc IBST';

create table khach_hang (
  id                 bigint generated always as identity primary key,
  ma_dinh_danh       varchar(150) unique,
  ten_to_chuc        varchar(150) not null,   -- BXD-CDE-025
  ma_so_thue         varchar(15),             -- BXD-CDE-012 MaSoThue
  dia_chi_chi_tiet   varchar(255),            -- BXD-CDE-003 DiaChiChiTiet
  so_dien_thoai      varchar(130),            -- BXD-CDE-022 SoDienThoai
  website            varchar(150),            -- BXD-CDE-036
  ghi_chu            varchar(500),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table khach_hang is 'Dữ liệu chủ: Tổ chức khách hàng (BXD-CDE-033)';

create table nhan_su (
  id                    bigint generated always as identity primary key,
  ma_dinh_danh          varchar(150) unique,
  so_dinh_danh_ca_nhan  varchar(12),           -- BXD-CDE-011 MaSoCaNhan (dữ liệu cá nhân)
  ho_va_ten             varchar(150) not null, -- BXD-CDE-007 HoVaTen
  ngay_sinh             date,
  gioi_tinh             varchar(10),           -- BXD-CDE-006 (tham chiếu danh mục)
  hoc_vi                varchar(100),          -- trình độ chuyên môn BXD-HDXD-003
  chuc_danh             varchar(150),
  don_vi_id             bigint references don_vi(id),
  email                 varchar(150),
  so_dien_thoai         varchar(130),
  trang_thai            varchar(20) not null default 'dang-lam-viec',
  created_at            timestamptz not null default now(),
  updated_at            timestamptz not null default now()
);
comment on table nhan_su is 'Dữ liệu chủ: Cá nhân (BXD-CDE-001) — YÊU CẦU BẢO MẬT: Dữ liệu cá nhân (QĐ 946)';

-- ─── LỚP DỮ LIỆU GỐC (theo Phụ lục 01 QĐ 946, STT 22) ───
create table chung_chi_hanh_nghe (
  id                      bigint generated always as identity primary key,
  nhan_su_id              bigint not null references nhan_su(id),
  so_chung_chi            varchar(150) not null unique,  -- BXD-CDE-023 SoGiay
  ten_linh_vuc_hanh_nghe  varchar(150) not null,         -- BXD-HDXD-002
  hang_chung_chi          varchar(50),                   -- BXD-HDXD-001 (tham chiếu danh mục)
  co_quan_cap             varchar(150),
  ngay_cap                date,                          -- BXD-CDE-014 NgayCap
  ngay_het_han            date,
  trang_thai_hieu_luc     varchar(20) not null default 'con-hieu-luc', -- BXD-CDE-034
  created_at              timestamptz not null default now(),
  updated_at              timestamptz not null default now()
);
comment on table chung_chi_hanh_nghe is 'Dữ liệu gốc: Chứng chỉ hành nghề hoạt động xây dựng — bộ trường theo Phụ lục 01 QĐ 946/QĐ-BXD; YÊU CẦU BẢO MẬT: Dữ liệu cá nhân';

-- ─── LỚP DỮ LIỆU GIAO DỊCH ───
create table van_ban (
  id           bigint generated always as identity primary key,
  so_hieu      varchar(150) not null unique,  -- BXD-CDE-023 SoGiay
  trich_yeu    varchar(500) not null,
  loai         varchar(10) not null check (loai in ('den','di')),
  don_vi_id    bigint references don_vi(id),
  ngay_van_ban date not null,                  -- BXD-CDE-017 NgayThangNam
  trang_thai   varchar(20) not null default 'moi',
  ghi_chu      varchar(500),
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table van_ban is 'Dữ liệu giao dịch: văn bản đến/đi (PH1 e-Office)';

create table de_tai (
  id              bigint generated always as identity primary key,
  ma_so           varchar(50) not null unique,
  ten_de_tai      varchar(500) not null,
  cap_de_tai      varchar(20) not null,        -- tham chiếu dm_danh_muc nhom=cap_de_tai
  chu_nhiem_id    bigint references nhan_su(id),
  don_vi_id       bigint references don_vi(id),
  kinh_phi        numeric(15,0) not null default 0,  -- nghìn đồng
  tien_do         smallint not null default 0 check (tien_do between 0 and 100),
  han_nghiem_thu  date,
  trang_thai      varchar(20) not null default 'moi',
  ghi_chu         varchar(500),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table de_tai is 'Dữ liệu giao dịch: đề tài/nhiệm vụ KHCN (PH2)';

create table hop_dong (
  id               bigint generated always as identity primary key,
  so_hop_dong      varchar(150) not null unique,
  ten_hop_dong     varchar(500) not null,
  khach_hang_id    bigint references khach_hang(id),
  don_vi_id        bigint references don_vi(id),
  gia_tri          numeric(15,0) not null default 0,   -- nghìn đồng
  da_thanh_toan    numeric(15,0) not null default 0,
  ngay_ky          date,
  han_hoan_thanh   date,
  trang_thai       varchar(20) not null default 'moi',
  ghi_chu          varchar(500),
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);
comment on table hop_dong is 'Dữ liệu giao dịch: hợp đồng dịch vụ & dự án tư vấn (PH3)';

create table mau_thi_nghiem (
  id                 bigint generated always as identity primary key,
  ma_phieu           varchar(50) not null unique,
  ten_mau            varchar(255) not null,
  phep_thu           varchar(255) not null,
  tieu_chuan_ap_dung varchar(150),
  khach_hang_id      bigint references khach_hang(id),
  phong_thi_nghiem   varchar(50) not null,
  ngay_nhan          date not null,
  han_tra            date,
  trang_thai         varchar(20) not null default 'moi',
  ghi_chu            varchar(500),
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);
comment on table mau_thi_nghiem is 'Dữ liệu giao dịch: mẫu thí nghiệm LIMS (PH4) — nguồn phiếu kết quả LAS-XD';

create table lop_dao_tao (
  id            bigint generated always as identity primary key,
  ten_lop       varchar(255) not null,
  loai          varchar(20) not null,          -- NCS / tap-huan / hoi-thao
  so_hoc_vien   int not null default 0,
  ngay_bat_dau  date,
  ngay_ket_thuc date,
  trang_thai    varchar(20) not null default 'moi',
  ghi_chu       varchar(500),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table lop_dao_tao is 'Dữ liệu giao dịch: đào tạo NCS/tập huấn/hội thảo (PH7)';

-- ─── LỚP SIÊU DỮ LIỆU (nội dung tối thiểu danh mục CSDL — mục 3.3-3.5 QĐ 942) ───
create table sd_danh_muc_du_lieu (
  id                 bigint generated always as identity primary key,
  ten_bang           varchar(100) not null unique,
  ten_du_lieu        varchar(255) not null,
  lop_du_lieu        varchar(30) not null,   -- danh-muc / du-lieu-chu / du-lieu-goc / giao-dich
  mien_du_lieu       varchar(100),           -- miền dữ liệu dùng chung liên quan
  don_vi_chu_quan    varchar(150) not null,
  pham_vi            varchar(255),
  tan_suat_cap_nhat  varchar(100),
  muc_do_bao_mat     varchar(100),
  mo_ta_nghiep_vu    varchar(500),
  created_at         timestamptz not null default now()
);
comment on table sd_danh_muc_du_lieu is 'Siêu dữ liệu: danh mục dữ liệu nội bộ IBST theo nội dung tối thiểu QĐ 942/QĐ-BXD';

-- ─── NHẬT KÝ TRUY VẾT (Chương III QĐ 942: ghi nhận, truy vết, kiểm toán) ───
create table nhat_ky_du_lieu (
  id             bigint generated always as identity primary key,
  ten_bang       varchar(100) not null,
  ban_ghi_id     bigint,
  hanh_dong      varchar(10) not null,
  du_lieu_cu     jsonb,
  du_lieu_moi    jsonb,
  nguoi_thuc_hien varchar(150) default current_user,
  thoi_diem      timestamptz not null default now()
);
comment on table nhat_ky_du_lieu is 'Nhật ký thay đổi dữ liệu — yêu cầu truy vết theo Khung quản trị dữ liệu QĐ 942/QĐ-BXD';

-- Trigger updated_at
create or replace function fn_cap_nhat_updated_at() returns trigger
language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

-- Trigger ghi nhật ký
create or replace function fn_ghi_nhat_ky() returns trigger
language plpgsql security definer as $$
begin
  insert into nhat_ky_du_lieu (ten_bang, ban_ghi_id, hanh_dong, du_lieu_cu, du_lieu_moi)
  values (
    tg_table_name,
    coalesce(new.id, old.id),
    tg_op,
    case when tg_op in ('UPDATE','DELETE') then to_jsonb(old) end,
    case when tg_op in ('INSERT','UPDATE') then to_jsonb(new) end
  );
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['don_vi','khach_hang','nhan_su','chung_chi_hanh_nghe','van_ban','de_tai','hop_dong','mau_thi_nghiem','lop_dao_tao']
  loop
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
  end loop;
end $$;

-- ─── PHÂN QUYỀN RLS ───
-- Nguyên tắc: dữ liệu cá nhân (nhan_su, chung_chi_hanh_nghe) chỉ authenticated;
-- bảng nghiệp vụ cho anon đọc ở giai đoạn demo; nhật ký chỉ service_role.
do $$
declare t text;
begin
  foreach t in array array['dm_danh_muc','don_vi','khach_hang','nhan_su','chung_chi_hanh_nghe','van_ban','de_tai','hop_dong','mau_thi_nghiem','lop_dao_tao','sd_danh_muc_du_lieu','nhat_ky_du_lieu']
  loop
    execute format('alter table %I enable row level security', t);
  end loop;
end $$;

-- Đọc công khai (demo) cho bảng không chứa dữ liệu cá nhân
do $$
declare t text;
begin
  foreach t in array array['dm_danh_muc','don_vi','khach_hang','van_ban','de_tai','hop_dong','mau_thi_nghiem','lop_dao_tao','sd_danh_muc_du_lieu']
  loop
    execute format('create policy "doc_cong_khai_demo" on %I for select to anon, authenticated using (true)', t);
  end loop;
end $$;

-- Dữ liệu cá nhân: chỉ authenticated đọc
create policy "doc_nhan_su_auth" on nhan_su for select to authenticated using (true);
create policy "doc_chung_chi_auth" on chung_chi_hanh_nghe for select to authenticated using (true);

-- ─── DỮ LIỆU MỞ (QĐ 943: chứng chỉ hành nghề cá nhân — không lộ định danh) ───
create or replace view mo_chung_chi_hanh_nghe
with (security_invoker = false) as
select
  ns.ho_va_ten,
  ns.hoc_vi          as trinh_do_chuyen_mon,
  cc.ten_linh_vuc_hanh_nghe as linh_vuc_hanh_nghe,
  cc.hang_chung_chi  as hang,
  cc.ngay_het_han    as thoi_han
from chung_chi_hanh_nghe cc
join nhan_su ns on ns.id = cc.nhan_su_id
where cc.trang_thai_hieu_luc = 'con-hieu-luc';
comment on view mo_chung_chi_hanh_nghe is 'Dữ liệu mở theo QĐ 943/QĐ-BXD: năng lực hoạt động xây dựng của cá nhân — chỉ gồm Họ tên, Trình độ, Lĩnh vực, Hạng, Thời hạn';
grant select on mo_chung_chi_hanh_nghe to anon, authenticated;
