-- 1. NEW TABLES

-- a) uy_quyen (Điều 5 QC 2815)
create table if not exists uy_quyen (
  id            bigint generated always as identity primary key,
  nguoi_uy_quyen_id  bigint not null references nhan_su(id),
  nguoi_duoc_uy_quyen_id  bigint not null references nhan_su(id),
  loai_uy_quyen text not null check (loai_uy_quyen in ('ky-hop-dong','phe-duyet','quyet-toan','kiem-tra','toan-quyen')),
  tu_ngay       date not null,
  den_ngay      date,
  ly_do         text,
  so_quyet_dinh text,
  trang_thai    varchar(20) not null default 'hieu-luc' check (trang_thai in ('hieu-luc','het-han','thu-hoi')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table uy_quyen is 'Ủy quyền ký HĐ, phê duyệt theo Điều 5 QC 2815/QĐ-VKH';

-- b) workflow_trang_thai
create table if not exists workflow_trang_thai (
  id            bigint generated always as identity primary key,
  loai_doi_tuong text not null check (loai_doi_tuong in ('hop-dong','phieu-giao-viec','quyet-toan')),
  tu_trang_thai  text not null,
  den_trang_thai text not null,
  vai_tro_yeu_cau text[] not null default '{}'::text[],
  dieu_kien_them text,
  mo_ta         text not null,
  thu_tu        smallint not null default 0,
  created_at    timestamptz not null default now(),
  unique (loai_doi_tuong, tu_trang_thai, den_trang_thai)
);
comment on table workflow_trang_thai is 'Luật chuyển trạng thái tự động/bán tự động cho HĐ, PGV, QT';

-- c) sla_theo_doi
create table if not exists sla_theo_doi (
  id            bigint generated always as identity primary key,
  loai_doi_tuong text not null,
  doi_tuong_id   bigint not null,
  ten_sla        text not null,
  han_chot       timestamptz not null,
  trang_thai     varchar(20) not null default 'dang-chay' check (trang_thai in ('dang-chay','dat','vi-pham','huy')),
  ngay_hoan_thanh timestamptz,
  canh_bao_da_gui boolean not null default false,
  ghi_chu        text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);
comment on table sla_theo_doi is 'Theo dõi hạn chót nghiệp vụ: nộp hồ sơ 30 ngày, quyết toán, nghiệm thu...';

-- d) dau_thau
create table if not exists dau_thau (
  id                bigint generated always as identity primary key,
  ten_goi_thau      text not null,
  chu_dau_tu_id     bigint references khach_hang(id),
  don_vi_thuc_hien_id bigint references don_vi(id),
  hinh_thuc         text not null check (hinh_thuc in ('dau-thau-rong-rai','dau-thau-han-che','chi-dinh-thau','chao-gia','mua-sam-truc-tiep','tu-thuc-hien','khac')),
  gia_du_thau       numeric(15,0),
  gia_trung_thau    numeric(15,0),
  ngay_mo_thau      date,
  ngay_dong_thau    date,
  trang_thai        varchar(20) not null default 'chuan-bi' check (trang_thai in ('chuan-bi','da-nop','trung-thau','truot','huy')),
  hop_dong_id       bigint references hop_dong(id),
  nguoi_phu_trach_id bigint references nhan_su(id),
  ghi_chu           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table dau_thau is 'Quản lý đấu thầu/chào giá theo Điều 4 QC 2815';

-- e) lien_danh
create table if not exists lien_danh (
  id                bigint generated always as identity primary key,
  hop_dong_id       bigint not null references hop_dong(id) on delete cascade,
  ten_doi_tac       text not null,
  ma_so_thue        varchar(15),
  ty_le_phan_tram   numeric(5,2) not null default 0,
  vai_tro           text check (vai_tro in ('dung-dau','thanh-vien')),
  gia_tri_phan_viec numeric(15,0),
  ghi_chu           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table lien_danh is 'Đối tác liên danh trong HĐ theo Điều 5.3 QC 2815';

-- f) nhiem_vu_pvqlnn
create table if not exists nhiem_vu_pvqlnn (
  id                bigint generated always as identity primary key,
  ten_nhiem_vu      text not null,
  co_quan_giao      text not null,
  so_van_ban_giao   text,
  ngay_giao         date,
  han_hoan_thanh    date,
  don_vi_id         bigint references don_vi(id),
  nguoi_phu_trach_id bigint references nhan_su(id),
  kinh_phi          numeric(15,0),
  nguon_kinh_phi    text,
  trang_thai        varchar(20) not null default 'moi' check (trang_thai in ('moi','dang-thuc-hien','hoan-thanh','qua-han')),
  ket_qua           text,
  ghi_chu           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table nhiem_vu_pvqlnn is 'Nhiệm vụ phục vụ quản lý nhà nước (N1B) theo Điều 3 QC 2815';

-- g) luu_tru_ho_so
create table if not exists luu_tru_ho_so (
  id                bigint generated always as identity primary key,
  hop_dong_id       bigint references hop_dong(id) on delete cascade,
  so_ho_so          text,
  vi_tri_luu_tru    text,
  ngay_nhan_luu_tru date,
  nguoi_ban_giao_id bigint references nhan_su(id),
  nguoi_nhan_id     bigint references nhan_su(id),
  trang_thai        varchar(20) not null default 'chua-nhan' check (trang_thai in ('chua-nhan','da-nhan','da-luu-kho','da-huy')),
  thoi_han_luu_tru  date,
  ghi_chu           text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table luu_tru_ho_so is 'Đăng ký lưu trữ hồ sơ HĐ tại TCHC theo Điều 8 QC 2815';

-- h) kiem_tra_khac_phuc
create table if not exists kiem_tra_khac_phuc (
  id                bigint generated always as identity primary key,
  kiem_tra_id       bigint not null references kiem_tra_noi_bo(id) on delete cascade,
  noi_dung_kien_nghi text not null,
  han_khac_phuc     date,
  nguoi_phu_trach_id bigint references nhan_su(id),
  trang_thai        varchar(20) not null default 'chua-xu-ly' check (trang_thai in ('chua-xu-ly','dang-xu-ly','da-hoan-thanh','qua-han')),
  ket_qua_khac_phuc text,
  ngay_hoan_thanh   date,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table kiem_tra_khac_phuc is 'Theo dõi khắc phục kiến nghị sau kiểm tra nội bộ';

-- 2. ALTER EXISTING TABLE kiem_tra_noi_bo
alter table kiem_tra_noi_bo
  add column if not exists loai_kiem_tra varchar(30) default 'dinh-ky' check (loai_kiem_tra in ('dinh-ky','dot-xuat','theo-don')),
  add column if not exists co_quan_yeu_cau text,
  add column if not exists muc_do_nghiem_trong varchar(20) check (muc_do_nghiem_trong is null or muc_do_nghiem_trong in ('nhe','vua','nghiem-trong'));

-- 3. ALTER EXISTING TABLE hop_dong
alter table hop_dong
  add column if not exists buoc_hien_tai varchar(30) default 'du-thao' check (buoc_hien_tai in ('du-thao','cho-duyet','dang-thuc-hien','tam-dung','nghiem-thu','quyet-toan','hoan-thanh','thanh-ly','huy'));
comment on column hop_dong.buoc_hien_tai is 'Bước workflow hiện tại của HĐ — dùng cho Workflow Engine';

-- 4. SIẾT RLS POLICIES cho hop_dong theo đơn vị
drop policy if exists "doc_hop_dong_auth" on hop_dong;
drop policy if exists "ghi_hop_dong_auth" on hop_dong;

create or replace function fn_don_vi_hien_tai() returns bigint
language sql stable security definer as $$
  select don_vi_id from nguoi_dung where user_id = auth.uid()
$$;

create policy "hd_doc_theo_don_vi" on hop_dong for select to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
  or chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid())
);

create policy "hd_them_theo_don_vi" on hop_dong for insert to authenticated with check (
  fn_lanh_dao_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
);

create policy "hd_sua_theo_don_vi" on hop_dong for update to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
  or chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid())
);

create policy "hd_xoa_admin" on hop_dong for delete to authenticated using (
  fn_la_quan_tri()
);

-- 5. SIMILAR RLS for related tables
do $$
declare
  t text;
begin
  foreach t in array array['phieu_giao_viec', 'dot_thanh_toan', 'hop_dong_thuong_phat', 'kiem_tra_noi_bo', 'quyet_toan_giai_doan', 'hop_dong_tep_dinh_kem']
  loop
    execute format('drop policy if exists "doc_%s_auth" on %I', t, t);
    execute format('drop policy if exists "ghi_%s_auth" on %I', t, t);
    
    execute format('
      create policy "%s_doc_theo_don_vi" on %I for select to authenticated using (
        fn_lanh_dao_tro_len()
        or exists (
          select 1 from hop_dong hd
          where hd.id = %I.hop_dong_id
          and (hd.don_vi_id = fn_don_vi_hien_tai()
               or hd.chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid()))
        )
      )
    ', t, t, t);

    execute format('
      create policy "%s_ghi_theo_don_vi" on %I for all to authenticated using (
        fn_lanh_dao_tro_len()
        or exists (
          select 1 from hop_dong hd
          where hd.id = %I.hop_dong_id
          and (hd.don_vi_id = fn_don_vi_hien_tai()
               or hd.chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid()))
        )
      )
    ', t, t, t);
  end loop;
end $$;

-- 6. RLS for NEW tables
alter table uy_quyen enable row level security;
alter table workflow_trang_thai enable row level security;
alter table sla_theo_doi enable row level security;
alter table dau_thau enable row level security;
alter table lien_danh enable row level security;
alter table nhiem_vu_pvqlnn enable row level security;
alter table luu_tru_ho_so enable row level security;
alter table kiem_tra_khac_phuc enable row level security;

-- uy_quyen
create policy "uy_quyen_doc" on uy_quyen for select to authenticated using (
  fn_lanh_dao_tro_len()
  or nguoi_uy_quyen_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid())
  or nguoi_duoc_uy_quyen_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid())
);
create policy "uy_quyen_ghi" on uy_quyen for all to authenticated using (fn_lanh_dao_tro_len());

-- workflow_trang_thai
create policy "workflow_trang_thai_doc" on workflow_trang_thai for select to authenticated using (true);
create policy "workflow_trang_thai_ghi" on workflow_trang_thai for all to authenticated using (fn_la_quan_tri());

-- sla_theo_doi
create policy "sla_theo_doi_doc" on sla_theo_doi for select to authenticated using (true);
create policy "sla_theo_doi_ghi" on sla_theo_doi for all to authenticated using (fn_lanh_dao_tro_len());

-- dau_thau
create policy "dau_thau_doc_theo_don_vi" on dau_thau for select to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_thuc_hien_id = fn_don_vi_hien_tai()
);
create policy "dau_thau_ghi_theo_don_vi" on dau_thau for all to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_thuc_hien_id = fn_don_vi_hien_tai()
);

-- lien_danh
create policy "lien_danh_doc_theo_don_vi" on lien_danh for select to authenticated using (
  fn_lanh_dao_tro_len()
  or exists (
    select 1 from hop_dong hd
    where hd.id = lien_danh.hop_dong_id
    and hd.don_vi_id = fn_don_vi_hien_tai()
  )
);
create policy "lien_danh_ghi_theo_don_vi" on lien_danh for all to authenticated using (
  fn_lanh_dao_tro_len()
  or exists (
    select 1 from hop_dong hd
    where hd.id = lien_danh.hop_dong_id
    and hd.don_vi_id = fn_don_vi_hien_tai()
  )
);

-- nhiem_vu_pvqlnn
create policy "nhiem_vu_pvqlnn_doc_theo_don_vi" on nhiem_vu_pvqlnn for select to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
);
create policy "nhiem_vu_pvqlnn_ghi_theo_don_vi" on nhiem_vu_pvqlnn for all to authenticated using (
  fn_lanh_dao_tro_len()
  or don_vi_id = fn_don_vi_hien_tai()
);

-- luu_tru_ho_so
create policy "luu_tru_ho_so_doc_theo_don_vi" on luu_tru_ho_so for select to authenticated using (
  fn_lanh_dao_tro_len()
  or exists (
    select 1 from hop_dong hd
    where hd.id = luu_tru_ho_so.hop_dong_id
    and hd.don_vi_id = fn_don_vi_hien_tai()
  )
);
create policy "luu_tru_ho_so_ghi_theo_don_vi" on luu_tru_ho_so for all to authenticated using (
  fn_lanh_dao_tro_len()
  or exists (
    select 1 from hop_dong hd
    where hd.id = luu_tru_ho_so.hop_dong_id
    and hd.don_vi_id = fn_don_vi_hien_tai()
  )
);

-- kiem_tra_khac_phuc
create policy "kiem_tra_khac_phuc_doc_theo_don_vi" on kiem_tra_khac_phuc for select to authenticated using (
  fn_lanh_dao_tro_len()
  or exists (
    select 1 from kiem_tra_noi_bo ktnb
    join hop_dong hd on hd.id = ktnb.hop_dong_id
    where ktnb.id = kiem_tra_khac_phuc.kiem_tra_id
    and hd.don_vi_id = fn_don_vi_hien_tai()
  )
);
create policy "kiem_tra_khac_phuc_ghi_theo_don_vi" on kiem_tra_khac_phuc for all to authenticated using (
  fn_lanh_dao_tro_len()
  or exists (
    select 1 from kiem_tra_noi_bo ktnb
    join hop_dong hd on hd.id = ktnb.hop_dong_id
    where ktnb.id = kiem_tra_khac_phuc.kiem_tra_id
    and hd.don_vi_id = fn_don_vi_hien_tai()
  )
);

-- 7. TRIGGERS
do $$
declare t text;
begin
  foreach t in array array['uy_quyen','sla_theo_doi','dau_thau','lien_danh','nhiem_vu_pvqlnn','luu_tru_ho_so','kiem_tra_khac_phuc']
  loop
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
  end loop;
end $$;

-- 8. SEED WORKFLOW RULES
insert into workflow_trang_thai (loai_doi_tuong, tu_trang_thai, den_trang_thai, vai_tro_yeu_cau, mo_ta, thu_tu) values
  -- Hợp đồng lifecycle
  ('hop-dong', 'du-thao', 'cho-duyet', '{chuyen-vien,truong-don-vi}', 'Trình duyệt hợp đồng', 1),
  ('hop-dong', 'cho-duyet', 'dang-thuc-hien', '{lanh-dao,quan-tri}', 'Phê duyệt hợp đồng', 2),
  ('hop-dong', 'cho-duyet', 'du-thao', '{lanh-dao,quan-tri}', 'Trả lại để chỉnh sửa', 3),
  ('hop-dong', 'dang-thuc-hien', 'tam-dung', '{truong-don-vi,lanh-dao,quan-tri}', 'Tạm dừng thực hiện', 4),
  ('hop-dong', 'tam-dung', 'dang-thuc-hien', '{truong-don-vi,lanh-dao,quan-tri}', 'Tiếp tục thực hiện', 5),
  ('hop-dong', 'dang-thuc-hien', 'nghiem-thu', '{chuyen-vien,truong-don-vi}', 'Nghiệm thu hoàn thành', 6),
  ('hop-dong', 'nghiem-thu', 'quyet-toan', '{truong-don-vi,lanh-dao}', 'Chuyển quyết toán', 7),
  ('hop-dong', 'quyet-toan', 'hoan-thanh', '{lanh-dao,quan-tri}', 'Quyết toán xong, hoàn thành', 8),
  ('hop-dong', 'hoan-thanh', 'thanh-ly', '{lanh-dao,quan-tri}', 'Thanh lý hợp đồng', 9),
  ('hop-dong', 'dang-thuc-hien', 'huy', '{lanh-dao,quan-tri}', 'Hủy hợp đồng', 10),
  -- Phiếu giao việc lifecycle
  ('phieu-giao-viec', 'du-thao', 'cho-duyet', '{chuyen-vien,truong-don-vi}', 'Trình duyệt phiếu giao việc', 1),
  ('phieu-giao-viec', 'cho-duyet', 'da-duyet', '{truong-don-vi,lanh-dao}', 'Duyệt phiếu giao việc', 2),
  ('phieu-giao-viec', 'cho-duyet', 'du-thao', '{truong-don-vi,lanh-dao}', 'Trả lại phiếu giao việc', 3);
