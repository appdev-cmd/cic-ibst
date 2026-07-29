-- ============================================================
-- 0011 — Quy chế 2815/QĐ-VKH: Quyết toán từng phần (Điều 12.1
--   "chứng từ hoàn chỉnh tới đâu thanh toán tới đó") và Hồ sơ
--   đính kèm hợp đồng (Điều 8.4 — nhiều loại hồ sơ/1 HĐ)
-- ============================================================

create table quyet_toan_giai_doan (
  id                bigint generated always as identity primary key,
  hop_dong_id       bigint not null references hop_dong(id) on delete cascade,
  ten_giai_doan     varchar(200) not null,
  ty_le_hoan_thanh  numeric(5,2) not null default 0,   -- % chứng từ hoàn chỉnh của giai đoạn này
  ngay_xac_nhan     date,
  nguoi_xac_nhan_id bigint references nhan_su(id),
  ghi_chu           varchar(500),
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
comment on table quyet_toan_giai_doan is 'Quyết toán từng phần theo chứng từ hoàn chỉnh (Điều 12.1) — khi tổng ty_le_hoan_thanh >= 100 thì hop_dong.trang_thai_quyet_toan tự chuyển da-quyet-toan';

create table hop_dong_tep_dinh_kem (
  id               bigint generated always as identity primary key,
  hop_dong_id      bigint not null references hop_dong(id) on delete cascade,
  loai_ho_so       varchar(30) not null default 'khac'
    check (loai_ho_so in ('ho-so-du-thau','hop-dong','phieu-giao-viec','bien-ban-nghiem-thu','bien-ban-thanh-ly','quyet-toan','khac')),
  duong_dan        varchar(500) not null,   -- đường dẫn trong bucket hop-dong
  ten_tep          varchar(255) not null,
  nguoi_tai_len_id bigint references nhan_su(id),
  created_at       timestamptz not null default now()
);
comment on table hop_dong_tep_dinh_kem is 'Hồ sơ đính kèm hợp đồng theo Điều 8.4 (HS dự thầu, HĐ, PGV, BBNT, BBTL, quyết toán...)';

do $$
declare t text;
begin
  foreach t in array array['quyet_toan_giai_doan']
  loop
    execute format('create trigger trg_%s_updated_at before update on %I for each row execute function fn_cap_nhat_updated_at()', t, t);
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;

  foreach t in array array['hop_dong_tep_dinh_kem']
  loop
    execute format('create trigger trg_%s_nhat_ky after insert or update or delete on %I for each row execute function fn_ghi_nhat_ky()', t, t);
    execute format('alter table %I enable row level security', t);
    execute format('create policy "doc_%s_auth" on %I for select to authenticated using (true)', t, t);
    execute format('create policy "ghi_%s_auth" on %I for all to authenticated using (true) with check (true)', t, t);
  end loop;
end $$;

-- ─── Storage: bucket đính kèm hồ sơ hợp đồng ───
insert into storage.buckets (id, name, public) values ('hop-dong','hop-dong', false)
  on conflict (id) do nothing;
create policy "hd_doc_auth"  on storage.objects for select to authenticated using (bucket_id = 'hop-dong');
create policy "hd_them_auth" on storage.objects for insert to authenticated with check (bucket_id = 'hop-dong');
create policy "hd_sua_auth"  on storage.objects for update to authenticated using (bucket_id = 'hop-dong');
create policy "hd_xoa_auth"  on storage.objects for delete to authenticated using (bucket_id = 'hop-dong');
