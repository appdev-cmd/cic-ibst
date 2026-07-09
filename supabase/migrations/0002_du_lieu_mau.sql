-- ============================================================
-- IBST ERP — Dữ liệu mẫu + siêu dữ liệu danh mục CSDL
-- ============================================================

-- Thống nhất đơn vị tiền tệ: triệu đồng
comment on column de_tai.kinh_phi is 'Kinh phí được giao — đơn vị: triệu đồng';
comment on column hop_dong.gia_tri is 'Giá trị hợp đồng — đơn vị: triệu đồng';
comment on column hop_dong.da_thanh_toan is 'Lũy kế đã thanh toán — đơn vị: triệu đồng';

-- ─── Danh mục dùng chung ───
insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('trang_thai','moi','Mới'),
  ('trang_thai','cho-duyet','Chờ duyệt'),
  ('trang_thai','dang-thuc-hien','Đang thực hiện'),
  ('trang_thai','hoan-thanh','Hoàn thành'),
  ('trang_thai','qua-han','Quá hạn'),
  ('cap_de_tai','nha-nuoc','Nhà nước'),
  ('cap_de_tai','bo','Bộ'),
  ('cap_de_tai','co-so','Cơ sở'),
  ('loai_van_ban','den','Văn bản đến'),
  ('loai_van_ban','di','Văn bản đi'),
  ('hang_chung_chi','hang-1','Hạng I'),
  ('hang_chung_chi','hang-2','Hạng II'),
  ('hang_chung_chi','hang-3','Hạng III'),
  ('loai_dao_tao','ncs','Nghiên cứu sinh'),
  ('loai_dao_tao','tap-huan','Tập huấn'),
  ('loai_dao_tao','hoi-thao','Hội thảo');

-- ─── Dữ liệu chủ: đơn vị trực thuộc IBST ───
insert into don_vi (ma_dinh_danh, ten_don_vi, ten_viet_tat, loai_don_vi) values
  ('IBST.KC',  'Viện chuyên ngành Kết cấu công trình xây dựng', 'VKC',  'vien-chuyen-nganh'),
  ('IBST.BT',  'Viện chuyên ngành Bê tông',                     'VBT',  'vien-chuyen-nganh'),
  ('IBST.VL',  'Viện Vật liệu xây dựng',                        'VVL',  'vien-chuyen-nganh'),
  ('IBST.MN',  'Phân viện KHCN Xây dựng miền Nam',              'PVMN', 'phan-vien'),
  ('IBST.AM',  'Trung tâm Tư vấn chống ăn mòn và Xây dựng',     'TTAM', 'trung-tam'),
  ('IBST.TD',  'Trung tâm Tư vấn trắc địa và Xây dựng',         'TTTD', 'trung-tam'),
  ('IBST.CN',  'Trung tâm Phát triển công nghệ và VLXD',        'TTCN', 'trung-tam'),
  ('IBST.QLKH','Phòng Quản lý khoa học',                        'QLKH', 'phong-chuc-nang'),
  ('IBST.KHTC','Phòng Kế hoạch - Tài chính',                    'KHTC', 'phong-chuc-nang'),
  ('IBST.TCHC','Phòng Tổ chức - Hành chính',                    'TCHC', 'phong-chuc-nang');

-- ─── Dữ liệu chủ: khách hàng ───
insert into khach_hang (ma_dinh_danh, ten_to_chuc, ma_so_thue) values
  ('KH.ACV',   'Tổng công ty Cảng hàng không Việt Nam (ACV)', '0311687329'),
  ('KH.THT',   'Công ty TNHH Phát triển THT',                 '0102683305'),
  ('KH.B85',   'Ban Quản lý dự án 85',                        '4000363524'),
  ('KH.LM',    'Chủ đầu tư Landmark Riverside',               null),
  ('KH.BN',    'Sở Văn hóa Thể thao Bắc Ninh',                null),
  ('KH.HY',    'Sở Y tế Hưng Yên',                            null),
  ('KH.620',   'CTCP Hạ tầng 620',                            null),
  ('KH.VICEM', 'Vicem Hoàng Thạch',                           '0800004087'),
  ('KH.DT',    'Nhà máy gạch Đại Thành',                      null),
  ('KH.SIKA',  'Sika Việt Nam',                               '3600245459');

-- ─── Dữ liệu chủ: nhân sự (dữ liệu cá nhân) ───
insert into nhan_su (ma_dinh_danh, ho_va_ten, hoc_vi, chuc_danh, don_vi_id) values
  ('NS.0001','Hoàng Văn E','Giáo sư, Tiến sĩ','Viện trưởng viện chuyên ngành', (select id from don_vi where ma_dinh_danh='IBST.KC')),
  ('NS.0002','Nguyễn Văn A','Phó Giáo sư, Tiến sĩ','Phó Viện trưởng',          (select id from don_vi where ma_dinh_danh='IBST.BT')),
  ('NS.0003','Trần Thị B','Tiến sĩ','Trưởng phòng nghiên cứu',                 (select id from don_vi where ma_dinh_danh='IBST.KC')),
  ('NS.0004','Lê Văn C','Tiến sĩ','Giám đốc trung tâm',                        (select id from don_vi where ma_dinh_danh='IBST.AM')),
  ('NS.0005','Phạm Thị D','Thạc sĩ','Nghiên cứu viên chính',                   (select id from don_vi where ma_dinh_danh='IBST.CN')),
  ('NS.0006','Vũ Thị F','Tiến sĩ','Trưởng phòng thí nghiệm',                   (select id from don_vi where ma_dinh_danh='IBST.VL')),
  ('NS.0007','Đỗ Văn G','Kỹ sư','Thí nghiệm viên',                             (select id from don_vi where ma_dinh_danh='IBST.VL'));

-- ─── Dữ liệu gốc: chứng chỉ hành nghề (bộ trường theo QĐ 946) ───
insert into chung_chi_hanh_nghe (nhan_su_id, so_chung_chi, ten_linh_vuc_hanh_nghe, hang_chung_chi, co_quan_cap, ngay_cap, ngay_het_han) values
  ((select id from nhan_su where ma_dinh_danh='NS.0001'),'BXD-00012345','Kiểm định xây dựng','hang-1','Cục Quản lý hoạt động xây dựng','2023-04-12','2028-04-12'),
  ((select id from nhan_su where ma_dinh_danh='NS.0002'),'BXD-00023456','Thiết kế kết cấu công trình','hang-1','Cục Quản lý hoạt động xây dựng','2021-09-20','2026-09-20'),
  ((select id from nhan_su where ma_dinh_danh='NS.0003'),'BXD-00034567','Thẩm tra thiết kế xây dựng','hang-1','Cục Quản lý hoạt động xây dựng','2022-01-15','2027-01-15'),
  ((select id from nhan_su where ma_dinh_danh='NS.0005'),'HAN-00045678','Giám sát thi công xây dựng','hang-2','Sở Xây dựng Hà Nội','2021-08-01','2026-08-01'),
  ((select id from nhan_su where ma_dinh_danh='NS.0007'),'LAS-00056789','Thí nghiệm chuyên ngành xây dựng','hang-2','Sở Xây dựng Hà Nội','2021-07-25','2026-07-25');

-- ─── Giao dịch: văn bản ───
insert into van_ban (so_hieu, trich_yeu, loai, don_vi_id, ngay_van_ban, trang_thai) values
  ('1245/BXD-KHCN','V/v giao nhiệm vụ KHCN năm 2026 đợt 2','den',(select id from don_vi where ma_dinh_danh='IBST.QLKH'),'2026-07-06','cho-duyet'),
  ('342/IBST-KHTC','Báo cáo tài chính hợp nhất Quý II/2026','di',(select id from don_vi where ma_dinh_danh='IBST.KHTC'),'2026-07-05','hoan-thanh'),
  ('89/SXD-HN','Đề nghị kiểm định chất lượng công trình chung cư CT5','den',(select id from don_vi where ma_dinh_danh='IBST.KC'),'2026-07-04','dang-thuc-hien'),
  ('341/IBST-TCHC','Quyết định cử cán bộ tham dự hội thảo CABR 2026','di',(select id from don_vi where ma_dinh_danh='IBST.TCHC'),'2026-07-03','hoan-thanh'),
  ('1198/BXD-GĐ','V/v giám định nguyên nhân sự cố công trình cầu X','den',null,'2026-07-02','qua-han'),
  ('338/IBST-QLKH','Đăng ký đề tài cấp Bộ năm 2027','di',(select id from don_vi where ma_dinh_danh='IBST.QLKH'),'2026-07-01','cho-duyet');

-- ─── Giao dịch: đề tài KHCN ───
insert into de_tai (ma_so, ten_de_tai, cap_de_tai, chu_nhiem_id, don_vi_id, kinh_phi, tien_do, han_nghiem_thu, trang_thai) values
  ('NĐT.2025.05','Nghiên cứu bê tông cường độ siêu cao UHPC cho kết cấu cầu','nha-nuoc',(select id from nhan_su where ma_dinh_danh='NS.0002'),(select id from don_vi where ma_dinh_danh='IBST.BT'),8500,65,'2027-03-31','dang-thuc-hien'),
  ('RD 12-25','Biên soạn TCVN về thiết kế kết cấu thép nhà cao tầng','bo',(select id from nhan_su where ma_dinh_danh='NS.0003'),(select id from don_vi where ma_dinh_danh='IBST.KC'),1200,90,'2026-09-30','dang-thuc-hien'),
  ('RD 08-24','Giải pháp chống ăn mòn kết cấu BTCT vùng ven biển','bo',(select id from nhan_su where ma_dinh_danh='NS.0004'),(select id from don_vi where ma_dinh_danh='IBST.AM'),950,100,'2026-06-30','hoan-thanh'),
  ('CS 03-26','Ứng dụng BIM trong quản lý thí nghiệm hiện trường','co-so',(select id from nhan_su where ma_dinh_danh='NS.0005'),(select id from don_vi where ma_dinh_danh='IBST.CN'),250,30,'2026-12-31','dang-thuc-hien'),
  ('NĐT.2024.11','Công nghệ quan trắc sức khỏe kết cấu công trình cao tầng','nha-nuoc',(select id from nhan_su where ma_dinh_danh='NS.0001'),(select id from don_vi where ma_dinh_danh='IBST.KC'),12000,45,'2026-08-15','qua-han'),
  ('RD 21-26','Nghiên cứu vật liệu xây không nung từ tro xỉ nhiệt điện','bo',(select id from nhan_su where ma_dinh_danh='NS.0006'),(select id from don_vi where ma_dinh_danh='IBST.VL'),1500,10,'2027-06-30','moi');

-- ─── Giao dịch: hợp đồng ───
insert into hop_dong (so_hop_dong, ten_hop_dong, khach_hang_id, don_vi_id, gia_tri, da_thanh_toan, ngay_ky, han_hoan_thanh, trang_thai) values
  ('156/2026/HĐKT','Kiểm định chất lượng nhà ga T3 sân bay Tân Sơn Nhất',(select id from khach_hang where ma_dinh_danh='KH.ACV'),(select id from don_vi where ma_dinh_danh='IBST.MN'),18500,9250,'2026-02-15','2026-12-31','dang-thuc-hien'),
  ('198/2026/HĐTV','Tư vấn giám sát thi công dự án Khu đô thị Tây Hồ Tây - GĐ2',(select id from khach_hang where ma_dinh_danh='KH.THT'),(select id from don_vi where ma_dinh_danh='IBST.KC'),24000,6000,'2026-03-20','2027-10-31','dang-thuc-hien'),
  ('112/2026/HĐTN','Thí nghiệm vật liệu dự án cao tốc Bắc - Nam đoạn QT-ĐH',(select id from khach_hang where ma_dinh_danh='KH.B85'),(select id from don_vi where ma_dinh_danh='IBST.VL'),5600,5600,'2026-01-10','2026-06-30','hoan-thanh'),
  ('215/2026/HĐKT','Quan trắc lún và biến dạng tòa nhà Landmark Riverside',(select id from khach_hang where ma_dinh_danh='KH.LM'),(select id from don_vi where ma_dinh_danh='IBST.TD'),3200,800,'2026-05-05','2027-05-05','dang-thuc-hien'),
  ('87/2026/HĐTB','Tu bổ, tôn tạo di tích đình làng Đình Bảng',(select id from khach_hang where ma_dinh_danh='KH.BN'),(select id from don_vi where ma_dinh_danh='IBST.CN'),7800,2340,'2025-11-20','2026-07-30','qua-han'),
  ('231/2026/HĐTV','Thẩm tra thiết kế bệnh viện đa khoa 500 giường Hưng Yên',(select id from khach_hang where ma_dinh_danh='KH.HY'),(select id from don_vi where ma_dinh_danh='IBST.KC'),2100,0,'2026-06-28','2026-10-15','moi');

-- ─── Giao dịch: mẫu thí nghiệm ───
insert into mau_thi_nghiem (ma_phieu, ten_mau, phep_thu, tieu_chuan_ap_dung, khach_hang_id, phong_thi_nghiem, ngay_nhan, han_tra, trang_thai) values
  ('LAS-2607-0912','Bê tông M400 — mẫu trụ 15x30','Cường độ nén','TCVN 3118',(select id from khach_hang where ma_dinh_danh='KH.B85'),'LAS-XD 01','2026-07-07','2026-07-10','dang-thuc-hien'),
  ('LAS-2607-0908','Thép CB400-V D20','Kéo, uốn','TCVN 7937',(select id from khach_hang where ma_dinh_danh='KH.THT'),'LAS-XD 01','2026-07-06','2026-07-09','cho-duyet'),
  ('LAS-2607-0895','Đất nền K98 — 12 mẫu','Đầm nén tiêu chuẩn','22TCN 333',(select id from khach_hang where ma_dinh_danh='KH.620'),'LAS-XD 03','2026-07-05','2026-07-08','hoan-thanh'),
  ('LAS-2607-0871','Xi măng PC50 — lô 26/06','Cường độ, độ mịn','TCVN 6016',(select id from khach_hang where ma_dinh_danh='KH.VICEM'),'LAS-XD 02','2026-07-03','2026-07-31','dang-thuc-hien'),
  ('LAS-2606-0844','Gạch không nung 4 lỗ — 30 viên','Cường độ nén','TCVN 6477',(select id from khach_hang where ma_dinh_danh='KH.DT'),'LAS-XD 02','2026-06-28','2026-07-05','qua-han'),
  ('LAS-2607-0921','Vữa chống thấm gốc xi măng','Độ thấm nước','TCVN 9065',(select id from khach_hang where ma_dinh_danh='KH.SIKA'),'LAS-XD 02','2026-07-08','2026-07-15','moi');

-- ─── Giao dịch: đào tạo ───
insert into lop_dao_tao (ten_lop, loai, so_hoc_vien, ngay_bat_dau, ngay_ket_thuc, trang_thai) values
  ('NCS khóa 2024 — Kỹ thuật xây dựng','ncs',8,'2024-11-01','2028-11-01','dang-thuc-hien'),
  ('Tập huấn TCVN mới về kết cấu thép','tap-huan',120,'2026-08-10','2026-08-12','moi'),
  ('Hội thảo Việt - Hàn về công nghệ chống động đất','hoi-thao',250,'2026-09-22','2026-09-23','moi'),
  ('Tập huấn thí nghiệm viên LAS-XD đợt 3','tap-huan',45,'2026-06-15','2026-06-20','hoan-thanh');

-- ─── Siêu dữ liệu: danh mục dữ liệu nội bộ (nội dung tối thiểu QĐ 942) ───
insert into sd_danh_muc_du_lieu (ten_bang, ten_du_lieu, lop_du_lieu, mien_du_lieu, don_vi_chu_quan, pham_vi, tan_suat_cap_nhat, muc_do_bao_mat, mo_ta_nghiep_vu) values
  ('dm_danh_muc','Danh mục dùng chung IBST','danh-muc','Dữ liệu dùng chung','Trung tâm CNTT (IBST)','Toàn Viện','Khi có thay đổi','Công khai nội bộ','Bảng mã danh mục thống nhất theo cấu trúc MaMuc/TenMuc của Từ điển 945/QĐ-BXD'),
  ('don_vi','Đơn vị trực thuộc IBST','du-lieu-chu','Tổ chức','Phòng Tổ chức - Hành chính','Toàn Viện (21 đơn vị)','Khi có thay đổi tổ chức','Công khai nội bộ','Dữ liệu chủ tổ chức, tham chiếu cho mọi nghiệp vụ'),
  ('khach_hang','Khách hàng/đối tác','du-lieu-chu','Tổ chức','Phòng Kế hoạch - Tài chính','Toàn quốc','Hằng ngày','Nội bộ','Tổ chức ký hợp đồng dịch vụ với Viện'),
  ('nhan_su','Cán bộ viên chức','du-lieu-chu','Con người','Phòng Tổ chức - Hành chính','Toàn Viện (~600 CBVC)','Hằng ngày','DỮ LIỆU CÁ NHÂN','Hồ sơ CBVC — hạn chế truy cập theo QĐ 946'),
  ('chung_chi_hanh_nghe','Chứng chỉ hành nghề HĐXD','du-lieu-goc','Hoạt động xây dựng','Phòng Tổ chức - Hành chính','Toàn Viện','Hằng ngày','DỮ LIỆU CÁ NHÂN','Dữ liệu gốc theo Phụ lục 01 QĐ 946; nguồn công bố dữ liệu mở theo QĐ 943'),
  ('van_ban','Văn bản đến/đi','giao-dich','Quản trị hành chính nội bộ','Phòng Tổ chức - Hành chính','Toàn Viện','Hằng ngày','Nội bộ','Văn bản điều hành, liên thông trục VBĐT'),
  ('de_tai','Đề tài/nhiệm vụ KHCN','giao-dich','Nghiên cứu khoa học','Phòng Quản lý khoa học','Toàn Viện','Hằng tuần','Nội bộ','Vòng đời đề tài các cấp'),
  ('hop_dong','Hợp đồng dịch vụ','giao-dich','Hoạt động xây dựng','Phòng Kế hoạch - Tài chính','Toàn Viện','Hằng ngày','Nội bộ','Hợp đồng kiểm định, tư vấn, thí nghiệm, thi công'),
  ('mau_thi_nghiem','Mẫu thí nghiệm LIMS','giao-dich','Hoạt động xây dựng','Các phòng LAS-XD','Toàn Viện','Hằng ngày','Nội bộ','Vòng đời mẫu: nhận → thử → duyệt → phát hành phiếu'),
  ('lop_dao_tao','Đào tạo - hội nghị','giao-dich','Con người','Phòng Tổ chức - Hành chính','Toàn Viện','Hằng tháng','Công khai nội bộ','NCS, tập huấn, hội thảo khoa học');
