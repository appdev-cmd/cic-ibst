-- ============================================================
-- 0025 — Chủ trì lập HSDT + checklist hồ sơ năng lực trên gói thầu
--   (Giai đoạn 1 kế hoạch số hóa, mục 1B.2 — Quy trình 1, Điều 5.1d, 9.6g)
--
--   B5: GĐ Đơn vị chỉ định người Chủ trì lập HSDT.
--   B6: Thu thập hồ sơ năng lực — P.KHKT (hồ sơ năng lực chung Viện + chữ ký số
--       đấu thầu), P.TCKT (báo cáo tài chính), P.TCHC (CCNN, nhân sự).
-- ============================================================

alter table dau_thau
  add column if not exists chu_tri_hsdt_id bigint references nhan_su(id),
  add column if not exists hs_nang_luc_chung boolean not null default false,
  add column if not exists bc_tai_chinh boolean not null default false,
  add column if not exists ccnn_du_thau boolean not null default false;

comment on column dau_thau.chu_tri_hsdt_id is 'Chủ trì lập hồ sơ dự thầu do GĐ Đơn vị chỉ định (Đ.5.1d)';
comment on column dau_thau.hs_nang_luc_chung is 'Đã thu thập hồ sơ năng lực chung của Viện (P.KHKT cung cấp — Đ.9.6g)';
comment on column dau_thau.bc_tai_chinh is 'Đã thu thập báo cáo tài chính (P.TCKT cung cấp — Đ.5.1d)';
comment on column dau_thau.ccnn_du_thau is 'Đã thu thập chứng chỉ năng lực/hành nghề + hồ sơ nhân sự (P.TCHC cung cấp — Đ.5.1d)';
