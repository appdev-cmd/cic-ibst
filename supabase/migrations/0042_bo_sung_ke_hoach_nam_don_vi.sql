-- Migration 0042: Bổ sung chỉ tiêu Kế hoạch năm và số thực hiện cùng kỳ cho bảng don_vi
-- Căn cứ: Bảng tổng hợp giá trị ký HĐKT các đơn vị năm 2026 (tính tới 21.8.2026)

alter table don_vi add column if not exists ke_hoach_nam numeric(15,0) default 0;
alter table don_vi add column if not exists ke_hoach_nam_truoc numeric(15,0) default 0;
alter table don_vi add column if not exists ghi_chu_ke_hoach varchar(500);

comment on column don_vi.ke_hoach_nam is 'Đăng ký kế hoạch ký HĐKT cả năm (nghìn đồng)';
comment on column don_vi.ke_hoach_nam_truoc is 'Số lượng ký HĐKT cùng kỳ năm trước (nghìn đồng)';
comment on column don_vi.ghi_chu_ke_hoach is 'Ghi chú về phân bổ, sáp nhập, giao khoán kế hoạch HĐKT';

-- Cập nhật số liệu kế hoạch chuẩn 2026 và cùng kỳ 2025 cho 16 đơn vị trực thuộc
update don_vi set ke_hoach_nam = 70000000, ke_hoach_nam_truoc = 67747280 where ten_viet_tat = 'VCNKC';
update don_vi set ke_hoach_nam = 38600000, ke_hoach_nam_truoc = 20191235 where ten_viet_tat = 'VCNBT';
update don_vi set ke_hoach_nam = 22000000, ke_hoach_nam_truoc = 16050776 where ten_viet_tat = 'VCNĐKT' or ten_don_vi like '%Địa kỹ thuật%';
update don_vi set ke_hoach_nam = 60500000, ke_hoach_nam_truoc = 23789989 where ten_viet_tat = 'PVMN';
update don_vi set ke_hoach_nam = 42000000, ke_hoach_nam_truoc = 36268364, ghi_chu_ke_hoach = 'PVMT cũ ko giao KH ký HĐ mới' where ten_viet_tat = 'PVMT';
update don_vi set ke_hoach_nam = 25000000, ke_hoach_nam_truoc = 34280507 where ten_viet_tat = 'TVTK' or ten_viet_tat = 'TTTVTK&XD';
update don_vi set ke_hoach_nam = 24000000, ke_hoach_nam_truoc = 20162107 where ten_viet_tat = 'TTKCT' or ten_viet_tat = 'TT KC Thép & XD';
update don_vi set ke_hoach_nam = 72200000, ke_hoach_nam_truoc = 74227557 where ten_viet_tat = 'TVĂM' or ten_viet_tat = 'TTTVC ĂM&XD';
update don_vi set ke_hoach_nam = 50000000, ke_hoach_nam_truoc = 60916109 where ten_viet_tat = 'CNXD' or ten_viet_tat = 'TTCNXD';
update don_vi set ke_hoach_nam = 25800000, ke_hoach_nam_truoc = 47293696 where ten_viet_tat = 'TTTĐ' or ten_viet_tat = 'TTTNTĐịa&XD';
update don_vi set ke_hoach_nam = 28000000, ke_hoach_nam_truoc = 29923810 where ten_viet_tat = 'CNHT' or ten_viet_tat = 'TTTVXDCN&HT';
update don_vi set ke_hoach_nam = 40000000, ke_hoach_nam_truoc = 38561149 where ten_viet_tat = 'TBXD' or ten_viet_tat = 'TTTVTB&XD';
update don_vi set ke_hoach_nam = 16000000, ke_hoach_nam_truoc = 13728161 where ten_viet_tat = 'CNVL' or ten_viet_tat = 'TTPTCN&VLXD';
update don_vi set ke_hoach_nam = 45000000, ke_hoach_nam_truoc = 49437953 where ten_viet_tat = 'TTCDAQT&XD';
update don_vi set ke_hoach_nam = 71800000, ke_hoach_nam_truoc = 91747268, ghi_chu_ke_hoach = 'Gộp KH của BIM và TTMTay' where ten_viet_tat = 'TT BIM' or ten_viet_tat = 'TTTV & UD BIM';
update don_vi set ke_hoach_nam = 58000000, ke_hoach_nam_truoc = 59918682 where ten_viet_tat = 'IBST COTEC' or ten_viet_tat = 'IBST.COTEC';
