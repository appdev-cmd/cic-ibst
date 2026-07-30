-- ============================================================
-- 0016 — SLA nghiệp vụ (Điều 9.6c, 11.1, 6.3) & Theo dõi thực hiện HĐ (Điều 8.1)
--
--   SLA trong quy chế:
--     • Điều 6.3 / 8.2 — nộp hồ sơ HĐ gốc về Viện: 30 ngày kể từ ngày ký
--     • Điều 9.6c      — KHKT kiểm tra, ký tắt: 01 ngày làm việc
--     • Điều 11.1      — TCKT giải quyết mỗi việc quyết toán: 03 ngày làm việc
--   SLA được tạo TỰ ĐỘNG khi bước tương ứng phát sinh, không nhập tay.
-- ============================================================

-- ─── 1. Cộng ngày làm việc (bỏ T7, CN) ───
create or replace function fn_them_ngay_lam_viec(tu timestamptz, so_ngay int)
returns timestamptz language plpgsql immutable as $$
declare
  kq timestamptz := tu;
  con int := so_ngay;
begin
  while con > 0 loop
    kq := kq + interval '1 day';
    -- 0 = Chủ nhật, 6 = Thứ bảy
    if extract(dow from kq) not in (0, 6) then
      con := con - 1;
    end if;
  end loop;
  return kq;
end $$;
comment on function fn_them_ngay_lam_viec is 'Cộng số NGÀY LÀM VIỆC (bỏ T7/CN) — dùng cho SLA Điều 9.6c, 11.1';

-- ─── 2. Tự sinh SLA khi phiếu giao việc vào bước KHKT thẩm tra (Điều 9.6c) ───
create or replace function fn_sinh_sla_giao_viec() returns trigger
language plpgsql security definer as $$
begin
  if new.trang_thai = 'cho-khkt-tham-tra'
     and new.trang_thai is distinct from old.trang_thai then
    insert into sla_theo_doi (loai_doi_tuong, doi_tuong_id, ten_sla, han_chot, trang_thai)
    values ('phieu-giao-viec', new.id,
            'KHKT kiểm tra, ký tắt Phiếu giao việc (Điều 9.6c — 01 ngày làm việc)',
            fn_them_ngay_lam_viec(now(), 1), 'dang-chay');
  end if;

  -- Thẩm tra xong thì đóng SLA tương ứng.
  if new.trang_thai = 'cho-lanh-dao-duyet'
     and new.trang_thai is distinct from old.trang_thai then
    update sla_theo_doi
       set trang_thai = case when now() <= han_chot then 'dat' else 'vi-pham' end,
           ngay_hoan_thanh = now(),
           updated_at = now()
     where loai_doi_tuong = 'phieu-giao-viec'
       and doi_tuong_id = new.id
       and trang_thai = 'dang-chay';
  end if;

  return new;
end $$;

drop trigger if exists trg_phieu_giao_viec_sla on phieu_giao_viec;
create trigger trg_phieu_giao_viec_sla
  after update on phieu_giao_viec
  for each row execute function fn_sinh_sla_giao_viec();

-- ─── 3. Tự sinh SLA nộp hồ sơ gốc 30 ngày (Điều 6.3) & quyết toán TCKT (Điều 11.1) ───
create or replace function fn_sinh_sla_hop_dong() returns trigger
language plpgsql security definer as $$
begin
  -- Ký hợp đồng → bắt đầu đếm 30 ngày nộp hồ sơ gốc về Viện.
  if tg_op = 'INSERT' and new.ngay_ky is not null then
    insert into sla_theo_doi (loai_doi_tuong, doi_tuong_id, ten_sla, han_chot, trang_thai)
    values ('hop-dong', new.id,
            'Nộp hồ sơ hợp đồng gốc về Viện (Điều 6.3 — 30 ngày)',
            (new.ngay_ky::timestamptz + interval '30 days'), 'dang-chay');
    return new;
  end if;

  if tg_op = 'UPDATE' then
    -- Đã nộp hồ sơ → chốt SLA 30 ngày.
    if new.ngay_nop_ho_so is not null and old.ngay_nop_ho_so is null then
      update sla_theo_doi
         set trang_thai = case when new.ngay_nop_ho_so::timestamptz <= han_chot then 'dat' else 'vi-pham' end,
             ngay_hoan_thanh = new.ngay_nop_ho_so::timestamptz,
             updated_at = now()
       where loai_doi_tuong = 'hop-dong' and doi_tuong_id = new.id
         and ten_sla like 'Nộp hồ sơ hợp đồng gốc%' and trang_thai = 'dang-chay';
    end if;

    -- Bắt đầu quyết toán → TCKT có 03 ngày làm việc (Điều 11.1).
    if new.trang_thai_quyet_toan = 'da-quyet-toan'
       and old.trang_thai_quyet_toan is distinct from 'da-quyet-toan' then
      update sla_theo_doi
         set trang_thai = case when now() <= han_chot then 'dat' else 'vi-pham' end,
             ngay_hoan_thanh = now(), updated_at = now()
       where loai_doi_tuong = 'hop-dong' and doi_tuong_id = new.id
         and ten_sla like 'TCKT giải quyết%' and trang_thai = 'dang-chay';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_hop_dong_sla on hop_dong;
create trigger trg_hop_dong_sla
  after insert or update on hop_dong
  for each row execute function fn_sinh_sla_hop_dong();

-- ─── 4. Theo dõi thực hiện hợp đồng (Điều 8.1) ───
create table if not exists tien_do_hop_dong (
  id              bigint generated always as identity primary key,
  hop_dong_id     bigint not null references hop_dong(id) on delete cascade,
  ky_bao_cao      date not null,
  phan_tram_khoi_luong numeric(5,2) not null default 0
                    check (phan_tram_khoi_luong >= 0 and phan_tram_khoi_luong <= 100),
  danh_gia_chat_luong varchar(20) not null default 'dat'
                    check (danh_gia_chat_luong in ('dat','can-khac-phuc','khong-dat')),
  su_co_atld      boolean not null default false,
  mo_ta_su_co     text,
  ghi_chu         text,
  nguoi_bao_cao_id bigint references nhan_su(id),
  created_at      timestamptz not null default now(),
  unique (hop_dong_id, ky_bao_cao)
);
comment on table tien_do_hop_dong is 'Theo dõi tiến độ, khối lượng, chất lượng, ATLĐ khi thực hiện HĐ (Điều 8.1 QC 2815)';

alter table tien_do_hop_dong enable row level security;

drop policy if exists "tdhd_doc" on tien_do_hop_dong;
create policy "tdhd_doc" on tien_do_hop_dong for select to authenticated using (true);

drop policy if exists "tdhd_ghi" on tien_do_hop_dong;
create policy "tdhd_ghi" on tien_do_hop_dong for all to authenticated
  using (true) with check (true);

drop trigger if exists trg_tien_do_nhat_ky on tien_do_hop_dong;
create trigger trg_tien_do_nhat_ky
  after insert or update or delete on tien_do_hop_dong
  for each row execute function fn_ghi_nhat_ky();
