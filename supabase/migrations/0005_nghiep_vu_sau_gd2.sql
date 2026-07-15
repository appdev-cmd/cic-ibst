-- ============================================================
-- 0005 — Nghiệp vụ chuyên sâu Giai đoạn 2:
--   • Hợp đồng: đợt thanh toán (công nợ)
--   • LIMS: kết quả phép thử theo chỉ tiêu
--   • Đề tài: mốc thực hiện / nghiệm thu
--   • Đơn vị: Phó Viện trưởng phụ trách khối (PA-B)
--   • Văn bản: tệp đính kèm (Supabase Storage, bucket van-ban)
-- ============================================================

-- ─── Phó Viện trưởng phụ trách đơn vị ───
alter table don_vi add column phu_trach_id bigint references nhan_su(id);
comment on column don_vi.phu_trach_id is 'Lãnh đạo Viện phụ trách khối (phân công khởi tạo mang tính tham khảo — Viện cập nhật chính thức qua giao diện)';

-- Phân công mẫu (tham khảo bố cục sơ đồ ibst.vn)
update don_vi set phu_trach_id=(select id from nhan_su where ma_dinh_danh='NS.1002')
  where ma_dinh_danh in ('IBST.TCHC','IBST.KHKT','IBST.TCKT','IBST.MN','IBST.MT');
update don_vi set phu_trach_id=(select id from nhan_su where ma_dinh_danh='NS.1003')
  where ma_dinh_danh in ('IBST.KC','IBST.BT','IBST.DKT','IBST.KCT','IBST.TD');
update don_vi set phu_trach_id=(select id from nhan_su where ma_dinh_danh='NS.1004')
  where ma_dinh_danh in ('IBST.AM','IBST.CN','IBST.TKXD','IBST.CNXD','IBST.CNHT','IBST.TBXD','IBST.QT','IBST.BIM','IBST.CTCP');

-- ─── Văn bản: tệp đính kèm ───
alter table van_ban
  add column tep_dinh_kem varchar(500),   -- đường dẫn trong bucket van-ban
  add column ten_tep      varchar(255);

-- ─── Đợt thanh toán hợp đồng ───
create table dot_thanh_toan (
  id            bigint generated always as identity primary key,
  hop_dong_id   bigint not null references hop_dong(id) on delete cascade,
  ten_dot       varchar(150) not null,
  so_tien       numeric(15,0) not null default 0,   -- triệu đồng
  ngay_du_kien  date,
  ngay_thuc_thu date,                                -- null = chưa thu
  ghi_chu       varchar(500),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
comment on table dot_thanh_toan is 'Đợt thanh toán hợp đồng — nguồn số liệu công nợ phải thu và doanh thu thực thu (PH3/PH5)';

-- ─── Kết quả phép thử theo chỉ tiêu ───
create table ket_qua_phep_thu (
  id           bigint generated always as identity primary key,
  mau_id       bigint not null references mau_thi_nghiem(id) on delete cascade,
  ten_chi_tieu varchar(255) not null,
  ket_qua      varchar(150),
  don_vi_tinh  varchar(50),
  yeu_cau      varchar(150),        -- ngưỡng theo tiêu chuẩn
  dat          boolean,             -- null = chưa đánh giá
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table ket_qua_phep_thu is 'Kết quả thí nghiệm theo chỉ tiêu của từng mẫu — nội dung phiếu kết quả LAS-XD (PH4)';

-- ─── Mốc thực hiện đề tài ───
create table moc_de_tai (
  id              bigint generated always as identity primary key,
  de_tai_id       bigint not null references de_tai(id) on delete cascade,
  ten_moc         varchar(255) not null,
  han_hoan_thanh  date,
  ngay_hoan_thanh date,             -- null = chưa hoàn thành
  ghi_chu         varchar(500),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table moc_de_tai is 'Mốc thực hiện / nghiệm thu đề tài KHCN (PH2)';

-- ─── Trigger updated_at + nhật ký cho bảng mới ───
do $$
declare t text;
begin
  foreach t in array array['dot_thanh_toan','ket_qua_phep_thu','moc_de_tai']
  loop
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ─── Storage: bucket đính kèm văn bản ───
insert into storage.buckets (id, name, public) values ('van-ban','van-ban', false)
  on conflict (id) do nothing;
create policy "vb_doc_auth"  on storage.objects for select to authenticated using (bucket_id = 'van-ban');
create policy "vb_them_auth" on storage.objects for insert to authenticated with check (bucket_id = 'van-ban');
create policy "vb_sua_auth"  on storage.objects for update to authenticated using (bucket_id = 'van-ban');
create policy "vb_xoa_auth"  on storage.objects for delete to authenticated using (bucket_id = 'van-ban');

-- ─── Dữ liệu mẫu: đợt thanh toán (khớp da_thanh_toan hiện có) ───
insert into dot_thanh_toan (hop_dong_id, ten_dot, so_tien, ngay_du_kien, ngay_thuc_thu) values
  ((select id from hop_dong where so_hop_dong='156/2026/HĐKT'), 'Đợt 1 — Tạm ứng 30%', 5550, '2026-02-28', '2026-03-01'),
  ((select id from hop_dong where so_hop_dong='156/2026/HĐKT'), 'Đợt 2 — Nghiệm thu giai đoạn 1', 3700, '2026-06-10', '2026-06-15'),
  ((select id from hop_dong where so_hop_dong='156/2026/HĐKT'), 'Đợt 3 — Nghiệm thu giai đoạn 2', 4625, '2026-10-30', null),
  ((select id from hop_dong where so_hop_dong='156/2026/HĐKT'), 'Đợt 4 — Quyết toán', 4625, '2026-12-31', null),
  ((select id from hop_dong where so_hop_dong='198/2026/HĐTV'), 'Đợt 1 — Tạm ứng 25%', 6000, '2026-04-10', '2026-04-15'),
  ((select id from hop_dong where so_hop_dong='198/2026/HĐTV'), 'Đợt 2 — Giữa kỳ', 6000, '2026-11-30', null),
  ((select id from hop_dong where so_hop_dong='198/2026/HĐTV'), 'Đợt 3 — Hoàn thành GĐ2', 12000, '2027-10-31', null),
  ((select id from hop_dong where so_hop_dong='112/2026/HĐTN'), 'Đợt 1 — Tạm ứng 50%', 2800, '2026-01-20', '2026-01-25'),
  ((select id from hop_dong where so_hop_dong='112/2026/HĐTN'), 'Đợt 2 — Thanh lý', 2800, '2026-07-05', '2026-07-08'),
  ((select id from hop_dong where so_hop_dong='215/2026/HĐKT'), 'Đợt 1 — Tạm ứng 25%', 800, '2026-05-15', '2026-05-20'),
  ((select id from hop_dong where so_hop_dong='215/2026/HĐKT'), 'Đợt 2 — Báo cáo quan trắc quý 4', 800, '2026-11-05', null),
  ((select id from hop_dong where so_hop_dong='215/2026/HĐKT'), 'Đợt 3 — Quyết toán', 1600, '2027-05-05', null),
  ((select id from hop_dong where so_hop_dong='87/2026/HĐTB'),  'Đợt 1 — Tạm ứng 30%', 2340, '2025-12-15', '2025-12-20'),
  ((select id from hop_dong where so_hop_dong='87/2026/HĐTB'),  'Đợt 2 — Hoàn thành hạng mục chính', 2730, '2026-06-30', null),
  ((select id from hop_dong where so_hop_dong='87/2026/HĐTB'),  'Đợt 3 — Quyết toán', 2730, '2026-07-30', null);

-- ─── Dữ liệu mẫu: kết quả phép thử ───
insert into ket_qua_phep_thu (mau_id, ten_chi_tieu, ket_qua, don_vi_tinh, yeu_cau, dat) values
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0895'), 'Độ ẩm tối ưu', '9.8', '%', '—', true),
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0895'), 'Khối lượng thể tích khô lớn nhất', '1.98', 'g/cm³', '≥ 1.95', true),
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0895'), 'Hệ số đầm chặt K', '0.985', '—', '≥ 0.98', true),
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0871'), 'Cường độ nén 3 ngày', '31.2', 'MPa', '≥ 25', true),
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0871'), 'Độ mịn (sót sàng 0,09mm)', null, '%', '≤ 10', null),
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0912'), 'Cường độ nén 7 ngày', '32.5', 'MPa', '≥ 30', true),
  ((select id from mau_thi_nghiem where ma_phieu='LAS-2607-0912'), 'Cường độ nén 28 ngày', null, 'MPa', '≥ 40', null);

-- ─── Dữ liệu mẫu: mốc đề tài ───
insert into moc_de_tai (de_tai_id, ten_moc, han_hoan_thanh, ngay_hoan_thanh) values
  ((select id from de_tai where ma_so='RD 12-25'), 'Bảo vệ thuyết minh đề cương', '2025-03-31', '2025-03-20'),
  ((select id from de_tai where ma_so='RD 12-25'), 'Hội thảo khoa học giữa kỳ', '2025-12-31', '2025-12-18'),
  ((select id from de_tai where ma_so='RD 12-25'), 'Hoàn thành dự thảo TCVN', '2026-06-30', '2026-06-25'),
  ((select id from de_tai where ma_so='RD 12-25'), 'Nghiệm thu cấp Bộ', '2026-09-30', null),
  ((select id from de_tai where ma_so='NĐT.2025.05'), 'Nghiệm thu cấp cơ sở giai đoạn 1', '2026-06-30', '2026-06-28'),
  ((select id from de_tai where ma_so='NĐT.2025.05'), 'Thử nghiệm dầm UHPC tỷ lệ thực', '2026-12-31', null),
  ((select id from de_tai where ma_so='NĐT.2025.05'), 'Nghiệm thu cấp Nhà nước', '2027-03-31', null);
