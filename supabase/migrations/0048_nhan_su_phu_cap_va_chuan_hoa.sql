-- Migration 0048: Bổ sung cột phụ cấp vượt khung và phụ cấp trách nhiệm cho bảng nhan_su
-- Phục vụ đồng bộ hóa 100% dữ liệu từ Bảng lương Tháng 9/2026

alter table nhan_su add column if not exists phu_cap_vuot_khung numeric(6,3) default 0;
alter table nhan_su add column if not exists phu_cap_trach_nhiem numeric(6,3) default 0;

comment on column nhan_su.phu_cap_vuot_khung is 'Phụ cấp thâm niên vượt khung (%) theo Bảng lương';
comment on column nhan_su.phu_cap_trach_nhiem is 'Phụ cấp trách nhiệm theo Bảng lương';
