-- ============================================================
-- Migration 0044: Bổ sung View và Function tính toán Bảng tổng hợp KHKT và TCKT theo Đơn vị
-- Nguồn sự thật: don_vi, hop_dong, dot_thanh_toan
-- ============================================================

-- 1. Cập nhật chuẩn hóa dữ liệu Kế hoạch năm và Cùng kỳ cho 16 đơn vị trực thuộc & Khối Viện theo ma_dinh_danh
update don_vi set ke_hoach_nam = 61100000, ghi_chu_ke_hoach = 'Kế hoạch khối Cơ quan Viện' where ma_dinh_danh = 'IBST.LD';
update don_vi set ke_hoach_nam = 70000000, ke_hoach_nam_truoc = 67747280 where ma_dinh_danh = 'IBST.KC';
update don_vi set ke_hoach_nam = 38600000, ke_hoach_nam_truoc = 20191235 where ma_dinh_danh = 'IBST.BT';
update don_vi set ke_hoach_nam = 22000000, ke_hoach_nam_truoc = 16050776 where ma_dinh_danh = 'IBST.DKT';
update don_vi set ke_hoach_nam = 60500000, ke_hoach_nam_truoc = 23789989 where ma_dinh_danh = 'IBST.MN';
update don_vi set ke_hoach_nam = 42000000, ke_hoach_nam_truoc = 36268364, ghi_chu_ke_hoach = 'PVMT cũ ko giao KH ký HĐ mới' where ma_dinh_danh = 'IBST.MT';
update don_vi set ke_hoach_nam = 25000000, ke_hoach_nam_truoc = 34280507 where ma_dinh_danh = 'IBST.TKXD';
update don_vi set ke_hoach_nam = 24000000, ke_hoach_nam_truoc = 20162107 where ma_dinh_danh = 'IBST.KCT';
update don_vi set ke_hoach_nam = 72200000, ke_hoach_nam_truoc = 74227557 where ma_dinh_danh = 'IBST.AM';
update don_vi set ke_hoach_nam = 50000000, ke_hoach_nam_truoc = 60916109 where ma_dinh_danh = 'IBST.CNXD';
update don_vi set ke_hoach_nam = 25800000, ke_hoach_nam_truoc = 47293696 where ma_dinh_danh = 'IBST.TD';
update don_vi set ke_hoach_nam = 28000000, ke_hoach_nam_truoc = 29923810 where ma_dinh_danh = 'IBST.CNHT';
update don_vi set ke_hoach_nam = 40000000, ke_hoach_nam_truoc = 38561149 where ma_dinh_danh = 'IBST.TBXD';
update don_vi set ke_hoach_nam = 16000000, ke_hoach_nam_truoc = 13728161 where ma_dinh_danh = 'IBST.CN';
update don_vi set ke_hoach_nam = 45000000, ke_hoach_nam_truoc = 49437953 where ma_dinh_danh = 'IBST.QT';
update don_vi set ke_hoach_nam = 71800000, ke_hoach_nam_truoc = 91747268, ghi_chu_ke_hoach = 'Gộp KH của BIM và TTMTay' where ma_dinh_danh = 'IBST.BIM';
update don_vi set ke_hoach_nam = 58000000, ke_hoach_nam_truoc = 59918682 where ma_dinh_danh = 'IBST.CTCP';

-- 2. View v_bang_tong_hop_khkt_2026: Tổng hợp phân cấp ký HĐKT (Viện ký & Đơn vị ký) trực tiếp từ hop_dong
create or replace view v_bang_tong_hop_khkt_2026 as
select
  d.id as don_vi_id,
  d.thu_tu,
  d.ma_dinh_danh,
  d.ten_don_vi,
  d.ten_viet_tat,
  d.loai_don_vi,
  coalesce(d.ke_hoach_nam, 0) as kh_nghin,
  coalesce(d.ke_hoach_nam_truoc, 0) as ck_nghin,
  coalesce(sum(case when h.cap_ky in ('vien', 'vien-ky') then h.gia_tri * 1000 else 0 end), 0)::numeric(15,0) as vien_ky_nghin,
  coalesce(sum(case when h.cap_ky in ('don-vi', 'don-vi-ky', 'uy-quyen') or h.cap_ky is null then h.gia_tri * 1000 else 0 end), 0)::numeric(15,0) as dv_ky_nghin,
  coalesce(sum(h.gia_tri * 1000), 0)::numeric(15,0) as tong_ky_nghin,
  count(h.id) as so_hop_dong,
  case
    when coalesce(d.ke_hoach_nam, 0) > 0
    then round((coalesce(sum(h.gia_tri * 1000), 0) / d.ke_hoach_nam) * 100)::int
    else 0
  end as pct_kh,
  case
    when coalesce(d.ke_hoach_nam_truoc, 0) > 0
    then round((coalesce(sum(h.gia_tri * 1000), 0) / d.ke_hoach_nam_truoc) * 100)::int
    else 0
  end as pct_cung_ky,
  d.ghi_chu_ke_hoach
from don_vi d
left join hop_dong h on h.don_vi_id = d.id and extract(year from coalesce(h.ngay_ky, '2026-01-01'::date)) = 2026
where d.loai_don_vi in ('vien-chuyen-nganh', 'phan-vien', 'trung-tam', 'cong-ty')
group by d.id, d.thu_tu, d.ma_dinh_danh, d.ten_don_vi, d.ten_viet_tat, d.loai_don_vi, d.ke_hoach_nam, d.ke_hoach_nam_truoc, d.ghi_chu_ke_hoach
order by d.thu_tu;

comment on view v_bang_tong_hop_khkt_2026 is 'Bảng tổng hợp giá trị ký HĐKT các đơn vị năm 2026 tự động tính toán từ bảng hop_dong';

-- 3. View v_bang_tong_hop_tckt_2026: Tổng hợp doanh thu, tiền về, công nợ theo Đơn vị từ dot_thanh_toan và hop_dong
drop view if exists v_bang_tong_hop_tckt_2026 cascade;
create view v_bang_tong_hop_tckt_2026 as
with hd_don_vi as (
  select
    d.id as don_vi_id,
    d.thu_tu,
    d.ma_dinh_danh,
    d.ten_don_vi,
    d.ten_viet_tat,
    d.loai_don_vi,
    coalesce(d.ke_hoach_nam, 0) as kh_nghin,
    coalesce(sum(h.gia_tri * 1000), 0)::numeric(15,0) as ky_nam_2026_nghin,
    coalesce(sum(h.da_thanh_toan * 1000), 0)::numeric(15,0) as doanh_thu_2026_nghin,
    coalesce(sum(case when h.gia_tri > coalesce(h.da_thanh_toan, 0) then (h.gia_tri - coalesce(h.da_thanh_toan, 0)) * 1000 else 0 end), 0)::numeric(15,0) as a_no_dt_2026_nghin
  from don_vi d
  left join hop_dong h on h.don_vi_id = d.id and extract(year from coalesce(h.ngay_ky, '2026-01-01'::date)) = 2026
  where d.loai_don_vi in ('vien-chuyen-nganh', 'phan-vien', 'trung-tam', 'cong-ty')
  group by d.id, d.thu_tu, d.ma_dinh_danh, d.ten_don_vi, d.ten_viet_tat, d.loai_don_vi, d.ke_hoach_nam
),
dtt_agg as (
  select
    h.don_vi_id,
    sum(case when dtt.ngay_thuc_thu is not null then dtt.so_tien * 1000 else 0 end)::numeric(15,0) as tong_tien_ve_2026_nghin,
    sum(case when dtt.ngay_thuc_thu is not null and extract(year from coalesce(h.ngay_ky, '2026-01-01'::date)) < 2026 then dtt.so_tien * 1000 else 0 end)::numeric(15,0) as tra_dt_nam_truoc_nghin,
    sum(case when dtt.ngay_thuc_thu is not null and extract(year from coalesce(h.ngay_ky, '2026-01-01'::date)) = 2026 and not (dtt.ten_dot ilike '%tạm ứng%') then dtt.so_tien * 1000 else 0 end)::numeric(15,0) as tien_ve_dt_2026_nghin,
    sum(case when dtt.ngay_thuc_thu is not null and dtt.ten_dot ilike '%tạm ứng%' then dtt.so_tien * 1000 else 0 end)::numeric(15,0) as a_tra_truoc_nghin
  from dot_thanh_toan dtt
  join hop_dong h on h.id = dtt.hop_dong_id
  group by h.don_vi_id
)
select
  hd.don_vi_id,
  hd.thu_tu,
  hd.ma_dinh_danh,
  hd.ten_don_vi,
  hd.ten_viet_tat,
  hd.loai_don_vi,
  hd.kh_nghin,
  hd.ky_nam_2026_nghin,
  case
    when hd.kh_nghin > 0 then round((hd.ky_nam_2026_nghin / hd.kh_nghin) * 100)::int
    else 0
  end as pct_ky_kh,
  hd.doanh_thu_2026_nghin,
  case
    when hd.kh_nghin > 0 then round((hd.doanh_thu_2026_nghin / hd.kh_nghin) * 100)::int
    else 0
  end as pct_dt_kh,
  coalesce(d.tong_tien_ve_2026_nghin, 0) as tong_tien_ve_2026_nghin,
  coalesce(d.tra_dt_nam_truoc_nghin, 0) as tra_dt_nam_truoc_nghin,
  coalesce(d.tien_ve_dt_2026_nghin, 0) as tien_ve_dt_2026_nghin,
  coalesce(d.a_tra_truoc_nghin, 0) as a_tra_truoc_nghin,
  hd.a_no_dt_2026_nghin
from hd_don_vi hd
left join dtt_agg d on d.don_vi_id = hd.don_vi_id
order by hd.thu_tu;

comment on view v_bang_tong_hop_tckt_2026 is 'Bảng tổng hợp dòng tiền TCKT các đơn vị năm 2026 tính toán tự động từ hop_dong và dot_thanh_toan';

-- 4. Phân quyền đọc cho authenticated và anon
grant select on v_bang_tong_hop_khkt_2026 to authenticated, anon;
grant select on v_bang_tong_hop_tckt_2026 to authenticated, anon;

