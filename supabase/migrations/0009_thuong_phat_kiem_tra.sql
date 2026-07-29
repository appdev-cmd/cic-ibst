-- ============================================================
-- 0009 — Quy chế 2815/QĐ-VKH: Thưởng/Phạt hợp đồng (Điều 13-14)
--   và Kiểm tra nội bộ (Điều 10)
-- ============================================================

create table hop_dong_thuong_phat (
  id                   bigint generated always as identity primary key,
  hop_dong_id          bigint not null references hop_dong(id) on delete cascade,
  loai                 varchar(10) not null check (loai in ('thuong','phat')),
  ly_do                varchar(500) not null,
  so_tien              numeric(15,0),        -- triệu đồng, nullable nếu chỉ ghi theo tỷ lệ %
  ty_le_phan_tram      numeric(5,2),          -- % giá trị HĐ trước thuế, nullable nếu ghi số tiền cố định
  ngay_quyet_dinh      date not null,
  nguoi_quyet_dinh_id  bigint references nhan_su(id),
  created_at           timestamptz not null default now()
);
comment on table hop_dong_thuong_phat is 'Sổ ghi nhận thưởng/phạt hợp đồng theo Điều 13-14 Quy chế 2815 — quyết định thủ công, không tự động sinh bản ghi';

create table kiem_tra_noi_bo (
  id                bigint generated always as identity primary key,
  hop_dong_id       bigint not null references hop_dong(id) on delete cascade,
  ngay_kiem_tra     date not null,
  nguoi_kiem_tra_id bigint references nhan_su(id),
  noi_dung          varchar(1000),
  ket_luan          varchar(1000),
  kien_nghi         varchar(1000),
  created_at        timestamptz not null default now()
);
comment on table kiem_tra_noi_bo is 'Biên bản kiểm tra nội bộ định kỳ/đột xuất theo Điều 10 Quy chế 2815';

do $$
declare t text;
begin
  foreach t in array array['hop_dong_thuong_phat','kiem_tra_noi_bo']
  loop
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;
