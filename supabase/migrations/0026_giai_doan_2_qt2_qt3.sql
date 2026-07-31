-- ============================================================
-- 0026 — Giai đoạn 2 kế hoạch số hóa: hoàn thiện Quy trình 2 & 3
--   (docs/ke-hoach-so-hoa-quy-trinh-2815.md, mục 2A/2B)
--
--   1. Bước "KHKT thẩm tra" thành trạng thái riêng trong luồng phê duyệt
--      Điều 6.1 (Đ.9.6c: thẩm tra ≤ 01 ngày làm việc, ký tắt rồi mới trình LĐV).
--   2. Cờ hop_dong.phuc_tap — điều kiện 2 Bảng 2.A (kỹ thuật phức tạp, chính
--      trị, pháp lý quan trọng, Bộ giao): buộc trình Viện trưởng bất kể giá trị.
--   3. lien_danh: số/ngày văn bản thông báo P.KHKT trước khi ký (Đ.4.7).
--   4. Bảng phan_phoi_hop_dong — checklist nơi nhận HĐ đã ký (Đ.6.3).
--   5. phieu_giao_viec_ctv: cờ CTV ngoài Viện + số HĐ giao khoán (Đ.7.6).
-- ============================================================

-- ─── 1. Trạng thái phê duyệt: thêm bước KHKT thẩm tra ───
alter table hop_dong drop constraint if exists hop_dong_trang_thai_phe_duyet_check;
alter table hop_dong add constraint hop_dong_trang_thai_phe_duyet_check
  check (trang_thai_phe_duyet in ('khong-ap-dung','chua-trinh','cho-khkt-tham-tra','da-trinh','da-duyet'));
comment on column hop_dong.trang_thai_phe_duyet is
  'Luồng trình/duyệt Viện trưởng Điều 6.1: khong-ap-dung | chua-trinh | cho-khkt-tham-tra (Đ.9.6c) | da-trinh | da-duyet';

-- ─── 2. Cờ phức tạp/chính trị/Bộ giao (Đ.6.1 điều kiện 2, Đ.5.2b) ───
alter table hop_dong add column if not exists phuc_tap boolean not null default false;
comment on column hop_dong.phuc_tap is
  'HĐ kỹ thuật phức tạp / tính chính trị / pháp lý quan trọng / Bộ giao — buộc trình Viện trưởng bất kể giá trị (Đ.6.1); P.KHKT là đầu mối soạn (Đ.5.2b)';

-- ─── 3. Siết trigger thẩm quyền phê duyệt (thay bản 0022) ───
create or replace function fn_kiem_soat_tham_quyen_hop_dong() returns trigger
language plpgsql security definer as $$
begin
  if new.trang_thai_phe_duyet is distinct from old.trang_thai_phe_duyet then
    -- Đ.9.6c: KHKT ký tắt xác nhận đủ hồ sơ pháp lý rồi mới trình Lãnh đạo Viện.
    if new.trang_thai_phe_duyet = 'da-trinh' then
      if old.trang_thai_phe_duyet <> 'cho-khkt-tham-tra' then
        raise exception
          'Điều 9.6c QC 2815: hồ sơ phải qua bước Phòng KHKT thẩm tra, ký tắt trước khi trình Lãnh đạo Viện.'
          using errcode = '42501';
      end if;
      if not fn_khkt_tro_len() then
        raise exception
          'Điều 9.6c QC 2815: vai trò "%" không có thẩm quyền ký tắt thẩm tra. Thẩm quyền thuộc Phòng KHKT.',
          fn_vai_tro()
          using errcode = '42501';
      end if;
    end if;

    -- Điều 6.1: xác nhận "đã duyệt" là thẩm quyền Viện trưởng / Phó Viện trưởng ủy quyền.
    if new.trang_thai_phe_duyet = 'da-duyet' and not fn_lanh_dao_tro_len() then
      raise exception
        'Điều 6.1 QC 2815: vai trò "%" không có thẩm quyền phê duyệt hợp đồng. Thẩm quyền thuộc Viện trưởng hoặc Phó Viện trưởng được ủy quyền.',
        fn_vai_tro()
        using errcode = '42501';
    end if;
  end if;

  -- Điều 11: quyết toán, thanh lý hợp đồng — thẩm quyền theo cấp ký (giữ nguyên 0022).
  if new.trang_thai_quyet_toan is distinct from old.trang_thai_quyet_toan then
    if new.cap_ky = 'don-vi-ky' then
      if not (fn_truong_don_vi_tro_len() or fn_vai_tro() in ('phong-tckt','phu-trach-ke-toan-dv')) then
        raise exception
          'Điều 11.2 QC 2815: vai trò "%" không có thẩm quyền quyết toán/thanh lý hợp đồng đơn vị ký. Thẩm quyền thuộc Trưởng đơn vị (P.TCKT/Phụ trách kế toán ĐV ghi nhận hộ).',
          fn_vai_tro()
          using errcode = '42501';
      end if;
    else
      if not fn_tckt_tro_len() then
        raise exception
          'Điều 11.1 QC 2815: vai trò "%" không có thẩm quyền quyết toán/thanh lý hợp đồng Viện ký. Thẩm quyền thuộc Lãnh đạo Viện (P.TCKT ghi nhận hộ).',
          fn_vai_tro()
          using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end $$;

comment on function fn_kiem_soat_tham_quyen_hop_dong is
  'Chặn vượt thẩm quyền Điều 6.1 (phê duyệt — bắt buộc qua KHKT thẩm tra Đ.9.6c từ 0026) và Điều 11 (quyết toán)';

-- ─── 4. SLA KHKT thẩm tra hợp đồng 01 ngày làm việc (Đ.9.6c) ───
create or replace function fn_sinh_sla_tham_tra_hop_dong() returns trigger
language plpgsql security definer as $$
begin
  if new.trang_thai_phe_duyet is distinct from old.trang_thai_phe_duyet then
    if new.trang_thai_phe_duyet = 'cho-khkt-tham-tra' then
      insert into sla_theo_doi (loai_doi_tuong, doi_tuong_id, ten_sla, han_chot, trang_thai)
      values ('hop-dong', new.id,
              'KHKT thẩm tra hồ sơ hợp đồng (Điều 9.6c — 01 ngày làm việc)',
              fn_them_ngay_lam_viec(now(), 1), 'dang-chay');
    elsif old.trang_thai_phe_duyet = 'cho-khkt-tham-tra' then
      update sla_theo_doi
         set trang_thai = case when now() <= han_chot then 'dat' else 'vi-pham' end,
             ngay_hoan_thanh = now(), updated_at = now()
       where loai_doi_tuong = 'hop-dong' and doi_tuong_id = new.id
         and ten_sla like 'KHKT thẩm tra hồ sơ hợp đồng%' and trang_thai = 'dang-chay';
    end if;
  end if;
  return new;
end $$;

drop trigger if exists trg_hop_dong_sla_tham_tra on hop_dong;
create trigger trg_hop_dong_sla_tham_tra
  after update on hop_dong
  for each row execute function fn_sinh_sla_tham_tra_hop_dong();

-- ─── 5. Liên danh: thông báo P.KHKT trước khi ký (Đ.4.7) ───
alter table lien_danh
  add column if not exists so_van_ban_khkt varchar(150),
  add column if not exists ngay_thong_bao_khkt date;
comment on column lien_danh.so_van_ban_khkt is 'Số văn bản thông báo P.KHKT trước khi ký thỏa thuận liên danh (Đ.4.7 — vi phạm xử lý theo Đ.14)';

-- ─── 6. Checklist phân phối & lưu trữ HĐ đã ký (Đ.6.3) ───
create table if not exists phan_phoi_hop_dong (
  id           bigint generated always as identity primary key,
  hop_dong_id  bigint not null references hop_dong(id) on delete cascade,
  noi_nhan     text not null,
  hinh_thuc    varchar(20) not null default 'giay' check (hinh_thuc in ('giay','dien-tu')),
  da_gui       boolean not null default false,
  ngay_gui     date,
  ghi_chu      text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
comment on table phan_phoi_hop_dong is 'Checklist nơi nhận HĐ đã ký theo Điều 6.3 QC 2815 — hạn chuyển lưu 30 ngày kể từ ngày ký đủ các bên';

create trigger trg_phan_phoi_hop_dong_updated_at before update on phan_phoi_hop_dong
  for each row execute function fn_cap_nhat_updated_at();
create index if not exists idx_phan_phoi_hop_dong on phan_phoi_hop_dong (hop_dong_id);

alter table phan_phoi_hop_dong enable row level security;
create policy "phan_phoi_doc" on phan_phoi_hop_dong for select to authenticated using (
  fn_lanh_dao_tro_len()
  or fn_vai_tro() in ('phong-khkt','phong-tchc','phong-tckt')
  or exists (
    select 1 from hop_dong hd where hd.id = phan_phoi_hop_dong.hop_dong_id
      and (hd.don_vi_id = fn_don_vi_hien_tai()
           or hd.chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid()))
  )
);
create policy "phan_phoi_ghi" on phan_phoi_hop_dong for all to authenticated using (
  fn_lanh_dao_tro_len()
  or fn_vai_tro() in ('phong-khkt','phong-tchc','phong-tckt')
  or exists (
    select 1 from hop_dong hd where hd.id = phan_phoi_hop_dong.hop_dong_id
      and (hd.don_vi_id = fn_don_vi_hien_tai()
           or hd.chu_tri_id in (select ns.id from nhan_su ns join nguoi_dung nd on nd.nhan_su_id = ns.id where nd.user_id = auth.uid()))
  )
);

-- ─── 7. CTV ngoài Viện + HĐ giao khoán (Đ.7.6) ───
alter table phieu_giao_viec_ctv
  add column if not exists la_ngoai_vien boolean not null default false,
  add column if not exists so_hd_giao_khoan varchar(150);
comment on column phieu_giao_viec_ctv.la_ngoai_vien is 'CTV ngoài Viện — bắt buộc có HĐ giao khoán công việc do Trưởng đơn vị ký (Đ.7.6)';
comment on column phieu_giao_viec_ctv.so_hd_giao_khoan is 'Số HĐ giao khoán công việc với CTV ngoài Viện (Đ.7.6)';
