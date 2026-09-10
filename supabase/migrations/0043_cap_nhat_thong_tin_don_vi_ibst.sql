-- ============================================================
-- Migration 0043: Cập nhật thông tin chuẩn xác 19 đơn vị trực thuộc IBST
-- Nguồn dữ liệu: https://ibst.vn/tin-tuc/cac-don-vi-truc-thuoc/cac-don-vi-truc-thuoc-vien888555.html
-- ============================================================

alter table don_vi
  add column if not exists website varchar(200);

comment on column don_vi.website is 'Địa chỉ website chính thức của đơn vị (nếu có)';

-- 0. Lãnh đạo Viện
update don_vi set
  ten_don_vi = 'Lãnh đạo Viện',
  ten_viet_tat = 'LĐV',
  loai_don_vi = 'lanh-dao',
  so_dien_thoai = '024 3754 4196',
  email = 'vkhcnxd@ibst.vn',
  website = 'https://ibst.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  chuc_nang_nhiem_vu = 'Viện trưởng và các Phó Viện trưởng: quản lý, điều hành toàn diện hoạt động của Viện theo chức năng nhiệm vụ được Bộ Xây dựng giao.',
  thu_tu = 1
where ma_dinh_danh = 'IBST.LD';

-- 1. Phòng Tổ chức hành chính
update don_vi set
  ten_don_vi = 'Phòng Tổ chức hành chính',
  ten_viet_tat = 'TCHC',
  loai_don_vi = 'phong-chuc-nang',
  so_dien_thoai = '(+84).24.37561358',
  email = 'tochucibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197',
  chuc_nang_nhiem_vu = 'Tham mưu công tác tổ chức bộ máy, cán bộ; lao động tiền lương; hành chính quản trị; văn thư lưu trữ; thi đua khen thưởng; quản lý hồ sơ CBVC và chứng chỉ hành nghề.',
  thu_tu = 11
where ma_dinh_danh = 'IBST.TCHC';

-- 2. Phòng Kế hoạch - kỹ thuật
update don_vi set
  ten_don_vi = 'Phòng Kế hoạch - kỹ thuật',
  ten_viet_tat = 'KHKT',
  loai_don_vi = 'phong-chuc-nang',
  so_dien_thoai = '(+84).24.38360825 / 38360016',
  email = 'khktibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197',
  chuc_nang_nhiem_vu = 'Tham mưu công tác kế hoạch sản xuất kinh doanh; quản lý kỹ thuật, chất lượng; quản lý hợp đồng kinh tế, đấu thầu; theo dõi đề tài nhiệm vụ KHCN.',
  thu_tu = 12
where ma_dinh_danh = 'IBST.KHKT';

-- 3. Phòng Tài chính - kế toán
update don_vi set
  ten_don_vi = 'Phòng Tài chính - kế toán',
  ten_viet_tat = 'TCKT',
  loai_don_vi = 'phong-chuc-nang',
  so_dien_thoai = '(+84).24.38360827',
  email = 'tcktibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197',
  chuc_nang_nhiem_vu = 'Quản lý tài chính, kế toán theo chế độ kế toán hành chính sự nghiệp; quản lý nguồn kinh phí NSNN và thu dịch vụ; lập báo cáo tài chính hợp nhất toàn Viện.',
  thu_tu = 13
where ma_dinh_danh = 'IBST.TCKT';

-- 4. Viện chuyên ngành Địa kỹ thuật
update don_vi set
  ten_don_vi = 'Viện chuyên ngành Địa kỹ thuật',
  ten_viet_tat = 'VDKT',
  loai_don_vi = 'vien-chuyen-nganh',
  so_dien_thoai = '(+84).24.37558472',
  email = 'vcndkt.ibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.3755.8473',
  chuc_nang_nhiem_vu = 'Nghiên cứu khoa học và chuyển giao công nghệ lĩnh vực địa kỹ thuật; khảo sát địa chất công trình; thí nghiệm đất, đá, nền móng; tư vấn thiết kế và xử lý nền móng công trình; quan trắc địa kỹ thuật.',
  thu_tu = 21
where ma_dinh_danh = 'IBST.DKT';

-- 5. Viện chuyên ngành Bê tông
update don_vi set
  ten_don_vi = 'Viện chuyên ngành Bê tông',
  ten_viet_tat = 'VBT',
  loai_don_vi = 'vien-chuyen-nganh',
  so_dien_thoai = '024.37544013',
  email = 'vienbetong@gmail.com',
  website = 'https://vienbetong.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: 024.37544013',
  chuc_nang_nhiem_vu = 'Nghiên cứu công nghệ bê tông và vật liệu bê tông đặc biệt (bê tông cường độ cao, UHPC); thí nghiệm, kiểm định cấu kiện bê tông; biên soạn quy chuẩn, tiêu chuẩn về bê tông; chuyển giao công nghệ.',
  thu_tu = 22
where ma_dinh_danh = 'IBST.BT';

-- 6. Viện chuyên ngành Kết cấu công trình xây dựng
update don_vi set
  ten_don_vi = 'Viện chuyên ngành Kết cấu công trình xây dựng',
  ten_viet_tat = 'VKC',
  loai_don_vi = 'vien-chuyen-nganh',
  so_dien_thoai = '(+84).24.62670817',
  email = 'ibs@vienketcau.vn',
  website = 'https://vienketcau.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197',
  chuc_nang_nhiem_vu = 'Nghiên cứu kết cấu công trình xây dựng; kiểm định, giám định chất lượng và sự cố công trình; thử nghiệm kết cấu; tư vấn gia cường, sửa chữa công trình; biên soạn tiêu chuẩn thiết kế kết cấu.',
  thu_tu = 23
where ma_dinh_danh = 'IBST.KC';

-- 7. Phân Viện Khoa học công nghệ xây dựng miền Nam
update don_vi set
  ten_don_vi = 'Phân Viện Khoa học công nghệ xây dựng miền Nam',
  ten_viet_tat = 'PVMN',
  loai_don_vi = 'phan-vien',
  so_dien_thoai = '(+84).28.37270166',
  email = 'phanvienmiennam@ibst.vn',
  website = 'https://ibsts.vn/',
  dia_chi_chi_tiet = '20/5B quốc lộ 13, khu phố 3, phường Hiệp Bình Phước, TP. Thủ Đức, TP. Hồ Chí Minh',
  ghi_chu = 'Fax: (+84).28.37270167',
  chuc_nang_nhiem_vu = 'Đại diện Viện tại khu vực phía Nam: nghiên cứu khoa học, kiểm định chất lượng công trình, tư vấn xây dựng, thí nghiệm chuyên ngành xây dựng (LAS-XD) phục vụ các tỉnh phía Nam.',
  thu_tu = 31
where ma_dinh_danh = 'IBST.MN';

-- 8. Phân Viện Khoa học công nghệ xây dựng miền Trung
update don_vi set
  ten_don_vi = 'Phân Viện Khoa học công nghệ xây dựng miền Trung',
  ten_viet_tat = 'PVMT',
  loai_don_vi = 'phan-vien',
  so_dien_thoai = '0234.3830126',
  email = 'ibst.c@ibst.vn',
  dia_chi_chi_tiet = 'Trụ sở 1: 183 Đường Phạm Văn Đồng, P. Vỹ Dạ, TP. Huế / Trụ sở 2: 61 Lê Văn Duyệt, P. Sơn Trà, TP. Đà Nẵng',
  ghi_chu = 'Fax: 0234.3830126',
  chuc_nang_nhiem_vu = 'Đại diện Viện tại khu vực miền Trung: nghiên cứu khoa học, kiểm định chất lượng công trình, tư vấn xây dựng, thí nghiệm chuyên ngành xây dựng phục vụ các tỉnh miền Trung.',
  thu_tu = 32
where ma_dinh_danh = 'IBST.MT';

-- 9. Trung tâm tư vấn chống ăn mòn và xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm tư vấn chống ăn mòn và xây dựng',
  ten_viet_tat = 'TTAM',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '024.37540189',
  email = 'dangkhoaibst@gmail.com',
  website = 'http://www.ccp.com.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: 024.37540189',
  chuc_nang_nhiem_vu = 'Nghiên cứu, tư vấn giải pháp chống ăn mòn kết cấu bê tông cốt thép và kết cấu thép, đặc biệt công trình ven biển; vật liệu sơn phủ bảo vệ; sửa chữa công trình bị ăn mòn.',
  thu_tu = 41
where ma_dinh_danh = 'IBST.AM';

-- 10. Trung tâm Kết cấu thép và xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm Kết cấu thép và xây dựng',
  ten_viet_tat = 'TTKCT',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '024.62670734',
  email = 'vienketcauthep@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  chuc_nang_nhiem_vu = 'Nghiên cứu, tư vấn thiết kế và thẩm tra kết cấu thép; nhà thép tiền chế; thử nghiệm liên kết kết cấu thép; giám sát thi công lắp dựng kết cấu thép.',
  thu_tu = 42
where ma_dinh_danh = 'IBST.KCT';

-- 11. Trung tâm tư vấn trắc địa và xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm tư vấn trắc địa và xây dựng',
  ten_viet_tat = 'TTTD',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '024.37558322',
  email = 'tdctibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Hotline: 0912.017173',
  chuc_nang_nhiem_vu = 'Trắc địa công trình; quan trắc lún, chuyển vị, biến dạng công trình; định vị công trình; ứng dụng công nghệ GNSS trong xây dựng.',
  thu_tu = 43
where ma_dinh_danh = 'IBST.TD';

-- 12. Trung tâm tư vấn thiết kế và xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm tư vấn thiết kế và xây dựng',
  ten_viet_tat = 'TTTK',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '(+84).24.38360015',
  email = 'trungtamtvtk@ccdc-ibst.vn',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  chuc_nang_nhiem_vu = 'Tư vấn thiết kế công trình dân dụng và công nghiệp; thẩm tra thiết kế và dự toán; lập dự án đầu tư xây dựng.',
  thu_tu = 44
where ma_dinh_danh = 'IBST.TKXD';

-- 13. Trung tâm công nghệ xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm công nghệ xây dựng',
  ten_viet_tat = 'TTCNXD',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '(+84).24.37561356',
  email = 'ttcnxd@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Email phụ: ttcn@ibst.vn',
  chuc_nang_nhiem_vu = 'Nghiên cứu, ứng dụng công nghệ thi công mới; biện pháp thi công phức tạp; công nghệ ván khuôn, giàn giáo; xử lý kỹ thuật trong thi công.',
  thu_tu = 45
where ma_dinh_danh = 'IBST.CNXD';

-- 14. Trung tâm tư vấn xây dựng công nghiệp và hạ tầng
update don_vi set
  ten_don_vi = 'Trung tâm tư vấn xây dựng công nghiệp và hạ tầng',
  ten_viet_tat = 'TTCNHT',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '(+84).24.37560838',
  email = 'tvcnht.ibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197; Email phụ: cnht@ibst.vn',
  chuc_nang_nhiem_vu = 'Tư vấn xây dựng công trình công nghiệp và hạ tầng kỹ thuật; quản lý dự án; giám sát thi công công trình công nghiệp, hạ tầng.',
  thu_tu = 46
where ma_dinh_danh = 'IBST.CNHT';

-- 15. Trung tâm tư vấn thiết bị và xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm tư vấn thiết bị và xây dựng',
  ten_viet_tat = 'TTTB',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '(+84).24.6267.0206',
  email = 'cecc.ibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197; Email phụ: cecc@ibst.vn',
  chuc_nang_nhiem_vu = 'Tư vấn về thiết bị công trình; kiểm định thiết bị xây dựng; an toàn thiết bị; tư vấn lắp đặt hệ thống cơ điện công trình.',
  thu_tu = 47
where ma_dinh_danh = 'IBST.TBXD';

-- 16. Trung tâm phát triển công nghệ và vật liệu xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm phát triển công nghệ và vật liệu xây dựng',
  ten_viet_tat = 'TTCN',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '(+84).24.37557849',
  email = 'info@tdbm.vn',
  website = 'http://www.tdbm.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: (+84).24.38361197',
  chuc_nang_nhiem_vu = 'Nghiên cứu phát triển công nghệ và vật liệu xây dựng mới; vật liệu xây không nung, vật liệu tái chế; thí nghiệm vật liệu xây dựng; tu bổ, tôn tạo di tích.',
  thu_tu = 48
where ma_dinh_danh = 'IBST.CN';

-- 17. Trung tâm các Dự án quốc tế và xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm các Dự án quốc tế và xây dựng',
  ten_viet_tat = 'TTQT',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '0989733388',
  email = 'daqt.ibst@gmail.com',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  ghi_chu = 'Fax: 024.38361197; Email LAS: lasxd04@ibst.vn',
  chuc_nang_nhiem_vu = 'Đầu mối triển khai các dự án hợp tác quốc tế; tiếp nhận chuyển giao công nghệ từ đối tác nước ngoài (ACI, BSI, CABR...); hợp tác nghiên cứu quốc tế.',
  thu_tu = 49
where ma_dinh_danh = 'IBST.QT';

-- 18. Trung tâm Tư vấn và Ứng dụng Bim trong xây dựng
update don_vi set
  ten_don_vi = 'Trung tâm Tư vấn và Ứng dụng Bim trong xây dựng',
  ten_viet_tat = 'TTBIM',
  loai_don_vi = 'trung-tam',
  so_dien_thoai = '024.22167980',
  email = 'infor@ibst-bim.vn',
  website = 'https://ibst-bim.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  chuc_nang_nhiem_vu = 'Tư vấn, triển khai ứng dụng mô hình thông tin công trình (BIM); xây dựng quy trình BIM; đào tạo BIM; mô hình hóa và quản lý dữ liệu công trình số.',
  thu_tu = 50
where ma_dinh_danh = 'IBST.BIM';

-- 19. Công ty cổ phần đầu tư và công nghệ xây dựng IBST
update don_vi set
  ten_don_vi = 'Công ty cổ phần đầu tư và công nghệ xây dựng IBST',
  ten_viet_tat = 'CTCP IBST',
  loai_don_vi = 'cong-ty',
  so_dien_thoai = '(+84).24.37561354',
  email = 'ibstcotec@ibst.vn',
  website = 'http://ibstcotec.com.vn/',
  dia_chi_chi_tiet = '81 phố Trần Cung, phường Nghĩa Tân, quận Cầu Giấy, TP. Hà Nội',
  chuc_nang_nhiem_vu = 'Công ty thành viên hoạt động theo Luật Doanh nghiệp: đầu tư, sản xuất kinh doanh vật liệu và thi công xây dựng chuyên ngành trên nền công nghệ của Viện.',
  thu_tu = 60
where ma_dinh_danh = 'IBST.CTCP';
