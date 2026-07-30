-- ============================================================
-- 0015 — Luồng ký Quyết định giao việc (Điều 7.1c QC 2815)
--
--   HĐ Viện ký:    Chủ trì soạn → Trưởng đơn vị ký xác nhận → Phòng KHKT thẩm tra
--                  → Lãnh đạo Viện phê duyệt → TCHC đóng dấu
--   HĐ đơn vị ký:  Chủ trì soạn → Trưởng phòng/xưởng xác nhận → Phòng Tổng hợp thẩm tra
--                  → Trưởng đơn vị ký duyệt
--
--   Trước đây upsertPhieuGiaoViec() đặt thẳng trang_thai='da-duyet' ngay khi lưu —
--   tức là không có phê duyệt thật, ai lưu phiếu cũng thành "đã duyệt".
-- ============================================================

-- ─── 1. Mở rộng trạng thái phiếu giao việc ───
alter table phieu_giao_viec drop constraint if exists phieu_giao_viec_trang_thai_check;

alter table phieu_giao_viec
  add column if not exists nguoi_don_vi_xac_nhan_id bigint references nhan_su(id),
  add column if not exists ngay_don_vi_xac_nhan     date,
  add column if not exists nguoi_khkt_tham_tra_id   bigint references nhan_su(id),
  add column if not exists ngay_khkt_tham_tra       date,
  add column if not exists nguoi_duyet_id           bigint references nhan_su(id),
  add column if not exists ly_do_tra_lai            text;

alter table phieu_giao_viec
  add constraint phieu_giao_viec_trang_thai_check
  check (trang_thai in (
    'du-thao',              -- Chủ trì đang soạn
    'cho-don-vi-xac-nhan',  -- Đã trình, chờ Trưởng đơn vị ký xác nhận
    'cho-khkt-tham-tra',    -- Chờ Phòng KHKT / Phòng Tổng hợp thẩm tra
    'cho-lanh-dao-duyet',   -- Chờ Lãnh đạo Viện (hoặc Trưởng đơn vị nếu HĐ đơn vị ký) duyệt
    'da-duyet',             -- Đã phê duyệt
    'tra-lai'               -- Bị trả lại để sửa
  ));

comment on column phieu_giao_viec.trang_thai is 'Luồng ký Quyết định giao việc theo Điều 7.1c QC 2815';

-- ─── 2. Chốt chặn thẩm quyền từng bước ───
create or replace function fn_kiem_soat_ky_giao_viec() returns trigger
language plpgsql security definer as $$
declare
  v_cap_ky text;
begin
  if new.trang_thai is not distinct from old.trang_thai then
    return new;
  end if;

  select cap_ky into v_cap_ky from hop_dong where id = new.hop_dong_id;

  -- Trưởng đơn vị ký xác nhận (Điều 7.1c)
  if new.trang_thai = 'cho-khkt-tham-tra' and not fn_truong_don_vi_tro_len() then
    raise exception 'Điều 7.1c QC 2815: chỉ Trưởng đơn vị trở lên mới ký xác nhận Phiếu giao việc (vai trò hiện tại: %).', fn_vai_tro()
      using errcode = '42501';
  end if;

  -- Phòng KHKT / Phòng Tổng hợp thẩm tra (Điều 9.6c)
  if new.trang_thai = 'cho-lanh-dao-duyet' and not fn_truong_don_vi_tro_len() then
    raise exception 'Điều 9.6c QC 2815: chỉ bộ phận chức năng (KHKT/Tổng hợp) mới thẩm tra được Phiếu giao việc (vai trò hiện tại: %).', fn_vai_tro()
      using errcode = '42501';
  end if;

  -- Phê duyệt cuối: HĐ Viện ký thuộc Lãnh đạo Viện; HĐ đơn vị ký thuộc Trưởng đơn vị.
  if new.trang_thai = 'da-duyet' then
    if v_cap_ky = 'don-vi-ky' then
      if not fn_truong_don_vi_tro_len() then
        raise exception 'Điều 7.1c QC 2815: Phiếu giao việc của HĐ đơn vị ký phải do Trưởng đơn vị duyệt (vai trò hiện tại: %).', fn_vai_tro()
          using errcode = '42501';
      end if;
    elsif not fn_lanh_dao_tro_len() then
      raise exception 'Điều 7.1c QC 2815: Quyết định giao việc của HĐ Viện ký phải do Lãnh đạo Viện phê duyệt (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
  end if;

  return new;
end $$;

drop trigger if exists trg_phieu_giao_viec_ky on phieu_giao_viec;
create trigger trg_phieu_giao_viec_ky
  before update on phieu_giao_viec
  for each row execute function fn_kiem_soat_ky_giao_viec();

-- ─── 3. Ghi nhật ký truy vết cho phiếu giao việc (Điều 9, 10) ───
drop trigger if exists trg_phieu_giao_viec_nhat_ky on phieu_giao_viec;
create trigger trg_phieu_giao_viec_nhat_ky
  after insert or update or delete on phieu_giao_viec
  for each row execute function fn_ghi_nhat_ky();

-- ─── 4. Phiếu đã lưu trước đây mặc định là 'da-duyet' — giữ nguyên, không hồi tố. ───
