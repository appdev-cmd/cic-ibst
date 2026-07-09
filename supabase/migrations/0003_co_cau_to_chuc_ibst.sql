-- ============================================================
-- IBST ERP — Cập nhật cơ cấu tổ chức thật theo website IBST
-- Nguồn: ibst.vn/tin-tuc/cac-don-vi-truc-thuoc (19 đơn vị)
--        ibst.vn/tin-tuc/lanh-dao-vien (Ban lãnh đạo)
-- ============================================================

-- ─── Mở rộng bảng don_vi: phân cấp, chức năng nhiệm vụ, liên hệ ───
alter table don_vi
  add column don_vi_cha_id      bigint references don_vi(id),
  add column truong_don_vi_id   bigint references nhan_su(id),
  add column chuc_nang_nhiem_vu text,
  add column dia_chi_chi_tiet   varchar(255),   -- BXD-CDE-003
  add column so_dien_thoai      varchar(130),   -- BXD-CDE-022
  add column email              varchar(150),
  add column thu_tu             smallint not null default 0;

comment on column don_vi.chuc_nang_nhiem_vu is 'Chức năng nhiệm vụ của đơn vị (nội dung khởi tạo mang tính tham khảo, Viện cập nhật chính thức sau)';

-- ─── Mở rộng nhan_su ───
alter table nhan_su
  add column ngay_vao_lam date,
  add column ngach        varchar(100);

-- ─── Danh mục loại đơn vị ───
insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('loai_don_vi','lanh-dao','Lãnh đạo Viện'),
  ('loai_don_vi','phong-chuc-nang','Phòng chức năng'),
  ('loai_don_vi','vien-chuyen-nganh','Viện chuyên ngành'),
  ('loai_don_vi','phan-vien','Phân viện'),
  ('loai_don_vi','trung-tam','Trung tâm'),
  ('loai_don_vi','cong-ty','Công ty thành viên');

-- ─── Chuẩn hóa 10 đơn vị đã có theo tên thật ───
update don_vi set ma_dinh_danh='IBST.DKT', ten_don_vi='Viện chuyên ngành Địa kỹ thuật', ten_viet_tat='VDKT', loai_don_vi='vien-chuyen-nganh',
  chuc_nang_nhiem_vu='Nghiên cứu khoa học và chuyển giao công nghệ lĩnh vực địa kỹ thuật; khảo sát địa chất công trình; thí nghiệm đất, đá, nền móng; tư vấn thiết kế và xử lý nền móng công trình; quan trắc địa kỹ thuật.', thu_tu=21
  where ma_dinh_danh='IBST.VL';
update don_vi set ten_don_vi='Viện chuyên ngành Bê tông',
  chuc_nang_nhiem_vu='Nghiên cứu công nghệ bê tông và vật liệu bê tông đặc biệt (bê tông cường độ cao, UHPC); thí nghiệm, kiểm định cấu kiện bê tông; biên soạn quy chuẩn, tiêu chuẩn về bê tông; chuyển giao công nghệ.', thu_tu=22
  where ma_dinh_danh='IBST.BT';
update don_vi set ten_don_vi='Viện chuyên ngành Kết cấu công trình xây dựng',
  chuc_nang_nhiem_vu='Nghiên cứu kết cấu công trình xây dựng; kiểm định, giám định chất lượng và sự cố công trình; thử nghiệm kết cấu; tư vấn gia cường, sửa chữa công trình; biên soạn tiêu chuẩn thiết kế kết cấu.', thu_tu=23
  where ma_dinh_danh='IBST.KC';
update don_vi set ten_don_vi='Phân Viện KHCN Xây dựng miền Nam',
  chuc_nang_nhiem_vu='Đại diện Viện tại khu vực phía Nam: nghiên cứu khoa học, kiểm định chất lượng công trình, tư vấn xây dựng, thí nghiệm chuyên ngành xây dựng (LAS-XD) phục vụ các tỉnh phía Nam.', thu_tu=31
  where ma_dinh_danh='IBST.MN';
update don_vi set ten_don_vi='Trung tâm Tư vấn chống ăn mòn và xây dựng',
  chuc_nang_nhiem_vu='Nghiên cứu, tư vấn giải pháp chống ăn mòn kết cấu bê tông cốt thép và kết cấu thép, đặc biệt công trình ven biển; vật liệu sơn phủ bảo vệ; sửa chữa công trình bị ăn mòn.', thu_tu=41
  where ma_dinh_danh='IBST.AM';
update don_vi set ten_don_vi='Trung tâm Tư vấn trắc địa và xây dựng',
  chuc_nang_nhiem_vu='Trắc địa công trình; quan trắc lún, chuyển vị, biến dạng công trình; định vị công trình; ứng dụng công nghệ GNSS trong xây dựng.', thu_tu=43
  where ma_dinh_danh='IBST.TD';
update don_vi set ten_don_vi='Trung tâm Phát triển công nghệ và vật liệu xây dựng',
  chuc_nang_nhiem_vu='Nghiên cứu phát triển công nghệ và vật liệu xây dựng mới; vật liệu xây không nung, vật liệu tái chế; thí nghiệm vật liệu xây dựng; tu bổ, tôn tạo di tích.', thu_tu=48
  where ma_dinh_danh='IBST.CN';
update don_vi set ma_dinh_danh='IBST.KHKT', ten_don_vi='Phòng Kế hoạch - Kỹ thuật', ten_viet_tat='KHKT',
  chuc_nang_nhiem_vu='Tham mưu công tác kế hoạch sản xuất kinh doanh; quản lý kỹ thuật, chất lượng; quản lý hợp đồng kinh tế, đấu thầu; theo dõi đề tài nhiệm vụ KHCN.', thu_tu=12
  where ma_dinh_danh='IBST.QLKH';
update don_vi set ma_dinh_danh='IBST.TCKT', ten_don_vi='Phòng Tài chính - Kế toán', ten_viet_tat='TCKT',
  chuc_nang_nhiem_vu='Quản lý tài chính, kế toán theo chế độ kế toán hành chính sự nghiệp; quản lý nguồn kinh phí NSNN và thu dịch vụ; lập báo cáo tài chính hợp nhất toàn Viện.', thu_tu=13
  where ma_dinh_danh='IBST.KHTC';
update don_vi set ten_don_vi='Phòng Tổ chức hành chính',
  chuc_nang_nhiem_vu='Tham mưu công tác tổ chức bộ máy, cán bộ; lao động tiền lương; hành chính quản trị; văn thư lưu trữ; thi đua khen thưởng; quản lý hồ sơ CBVC và chứng chỉ hành nghề.', thu_tu=11
  where ma_dinh_danh='IBST.TCHC';

-- ─── Bổ sung các đơn vị còn thiếu (đủ 19 + Lãnh đạo Viện) ───
insert into don_vi (ma_dinh_danh, ten_don_vi, ten_viet_tat, loai_don_vi, chuc_nang_nhiem_vu, thu_tu) values
  ('IBST.LD','Lãnh đạo Viện','LĐV','lanh-dao','Viện trưởng và các Phó Viện trưởng: quản lý, điều hành toàn diện hoạt động của Viện theo chức năng nhiệm vụ được Bộ Xây dựng giao.',1),
  ('IBST.MT','Phân Viện KHCN Xây dựng miền Trung','PVMT','phan-vien','Đại diện Viện tại khu vực miền Trung: nghiên cứu khoa học, kiểm định chất lượng công trình, tư vấn xây dựng, thí nghiệm chuyên ngành xây dựng phục vụ các tỉnh miền Trung.',32),
  ('IBST.KCT','Trung tâm Kết cấu thép và xây dựng','TTKCT','trung-tam','Nghiên cứu, tư vấn thiết kế và thẩm tra kết cấu thép; nhà thép tiền chế; thử nghiệm liên kết kết cấu thép; giám sát thi công lắp dựng kết cấu thép.',42),
  ('IBST.TKXD','Trung tâm Tư vấn thiết kế và xây dựng','TTTK','trung-tam','Tư vấn thiết kế công trình dân dụng và công nghiệp; thẩm tra thiết kế và dự toán; lập dự án đầu tư xây dựng.',44),
  ('IBST.CNXD','Trung tâm Công nghệ xây dựng','TTCNXD','trung-tam','Nghiên cứu, ứng dụng công nghệ thi công mới; biện pháp thi công phức tạp; công nghệ ván khuôn, giàn giáo; xử lý kỹ thuật trong thi công.',45),
  ('IBST.CNHT','Trung tâm Tư vấn xây dựng công nghiệp và hạ tầng','TTCNHT','trung-tam','Tư vấn xây dựng công trình công nghiệp và hạ tầng kỹ thuật; quản lý dự án; giám sát thi công công trình công nghiệp, hạ tầng.',46),
  ('IBST.TBXD','Trung tâm Tư vấn thiết bị và xây dựng','TTTB','trung-tam','Tư vấn về thiết bị công trình; kiểm định thiết bị xây dựng; an toàn thiết bị; tư vấn lắp đặt hệ thống cơ điện công trình.',47),
  ('IBST.QT','Trung tâm các Dự án quốc tế và xây dựng','TTQT','trung-tam','Đầu mối triển khai các dự án hợp tác quốc tế; tiếp nhận chuyển giao công nghệ từ đối tác nước ngoài (ACI, BSI, CABR...); hợp tác nghiên cứu quốc tế.',49),
  ('IBST.BIM','Trung tâm Tư vấn và Ứng dụng BIM trong xây dựng','TTBIM','trung-tam','Tư vấn, triển khai ứng dụng mô hình thông tin công trình (BIM); xây dựng quy trình BIM; đào tạo BIM; mô hình hóa và quản lý dữ liệu công trình số.',50),
  ('IBST.CTCP','Công ty cổ phần đầu tư và công nghệ xây dựng IBST','CTCP IBST','cong-ty','Công ty thành viên hoạt động theo Luật Doanh nghiệp: đầu tư, sản xuất kinh doanh vật liệu và thi công xây dựng chuyên ngành trên nền công nghệ của Viện.',60);

-- ─── Ban lãnh đạo Viện (theo ibst.vn/tin-tuc/lanh-dao-vien) ───
insert into nhan_su (ma_dinh_danh, ho_va_ten, chuc_danh, don_vi_id) values
  ('NS.1001','Nguyễn Hồng Hải','Viện trưởng',      (select id from don_vi where ma_dinh_danh='IBST.LD')),
  ('NS.1002','Đinh Quốc Dân','Phó Viện trưởng',    (select id from don_vi where ma_dinh_danh='IBST.LD')),
  ('NS.1003','Nguyễn Thanh Bình','Phó Viện trưởng',(select id from don_vi where ma_dinh_danh='IBST.LD')),
  ('NS.1004','Cao Duy Khôi','Phó Viện trưởng',     (select id from don_vi where ma_dinh_danh='IBST.LD'));

-- Trưởng đơn vị (dữ liệu mẫu từ nhân sự hiện có)
update don_vi set truong_don_vi_id=(select id from nhan_su where ma_dinh_danh='NS.0001') where ma_dinh_danh='IBST.KC';
update don_vi set truong_don_vi_id=(select id from nhan_su where ma_dinh_danh='NS.0002') where ma_dinh_danh='IBST.BT';
update don_vi set truong_don_vi_id=(select id from nhan_su where ma_dinh_danh='NS.0004') where ma_dinh_danh='IBST.AM';
update don_vi set truong_don_vi_id=(select id from nhan_su where ma_dinh_danh='NS.1001') where ma_dinh_danh='IBST.LD';

-- ─── Quyền ghi cho người dùng đã xác thực (phục vụ CRUD 2 module) ───
create policy "ghi_don_vi_auth" on don_vi for all to authenticated using (true) with check (true);
create policy "ghi_nhan_su_auth" on nhan_su for all to authenticated using (true) with check (true);
create policy "ghi_chung_chi_auth" on chung_chi_hanh_nghe for all to authenticated using (true) with check (true);

-- Cập nhật siêu dữ liệu
update sd_danh_muc_du_lieu set pham_vi='Toàn Viện (19 đơn vị trực thuộc + Lãnh đạo Viện)' where ten_bang='don_vi';
