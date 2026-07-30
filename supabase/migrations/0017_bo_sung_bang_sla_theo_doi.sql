-- ============================================================
-- 0017 — Bổ sung bảng sla_theo_doi còn thiếu
--
--   Migration 0012 khai báo bảng này nhưng THỰC TẾ CHƯA BAO GIỜ ĐƯỢC ÁP DỤNG lên CSDL
--   (kiểm tra information_schema chỉ thấy các bảng do 0014/0016 tạo). Trigger SLA ở 0016
--   tham chiếu bảng này nên mọi lệnh insert/update hop_dong đều lỗi
--   'relation "sla_theo_doi" does not exist'. Migration này tạo bảng để khôi phục.
--
--   Định nghĩa lấy nguyên từ 0012 để khi chạy lại 0012 vẫn tương thích (create if not exists).
-- ============================================================

create table if not exists sla_theo_doi (
  id              bigint generated always as identity primary key,
  loai_doi_tuong  text not null,
  doi_tuong_id    bigint not null,
  ten_sla         text not null,
  han_chot        timestamptz not null,
  trang_thai      varchar(20) not null default 'dang-chay'
                    check (trang_thai in ('dang-chay','dat','vi-pham','huy')),
  ngay_hoan_thanh timestamptz,
  canh_bao_da_gui boolean not null default false,
  ghi_chu         text,
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);
comment on table sla_theo_doi is 'Theo dõi hạn chót nghiệp vụ: nộp hồ sơ 30 ngày, KHKT ký tắt, TCKT quyết toán (QC 2815)';

create index if not exists idx_sla_doi_tuong on sla_theo_doi (loai_doi_tuong, doi_tuong_id);
create index if not exists idx_sla_trang_thai on sla_theo_doi (trang_thai, han_chot);

alter table sla_theo_doi enable row level security;

drop policy if exists "sla_doc" on sla_theo_doi;
create policy "sla_doc" on sla_theo_doi for select to authenticated using (true);

-- SLA do trigger sinh tự động (security definer); người dùng chỉ được ghi chú/hủy thủ công.
drop policy if exists "sla_ghi" on sla_theo_doi;
create policy "sla_ghi" on sla_theo_doi for all to authenticated
  using (fn_truong_don_vi_tro_len()) with check (fn_truong_don_vi_tro_len());
