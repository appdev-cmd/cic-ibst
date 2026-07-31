-- ============================================================
-- 0021 — Thu hẹp phạm vi khóa Phiếu giao việc đã duyệt (sửa lại 0019)
--
--   0019 chặn TOÀN BỘ update khi old.trang_thai = 'da-duyet', kể cả sửa các cột metadata
--   không thuộc nội dung quyết định (vd. nguoi_soan_id mới thêm ở 0020) — quá tay, tự làm
--   kẹt luôn việc backfill của chính migration 0020. Đúng ra chỉ cần khóa 4 trường NỘI DUNG
--   quyết định thật sự: chủ trì kỹ thuật, kinh phí giao, ngày giao, nội dung công việc.
-- ============================================================

create or replace function fn_kiem_soat_ky_giao_viec() returns trigger
language plpgsql security definer as $$
declare
  v_cap_ky text;
begin
  -- Phiếu đã phê duyệt là chốt cuối — chỉ khóa 4 trường NỘI DUNG quyết định, không khóa
  -- các cột metadata khác (vd. nguoi_soan_id, updated_at...).
  if old.trang_thai = 'da-duyet' then
    if new.chu_tri_ky_thuat_id is distinct from old.chu_tri_ky_thuat_id
       or new.kinh_phi_giao is distinct from old.kinh_phi_giao
       or new.noi_dung is distinct from old.noi_dung
       or new.ngay_giao is distinct from old.ngay_giao then
      raise exception
        'Điều 7.1c QC 2815: Phiếu giao việc đã phê duyệt (có hiệu lực) — không được sửa nội dung. Cần lập phiếu điều chỉnh mới nếu có thay đổi (Điều 7.1 Ghi chú).'
        using errcode = '42501';
    end if;
  end if;

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

  -- Trả lại để sửa (Điều 7.1c) — chỉ Trưởng đơn vị trở lên, và chỉ khi đang ở 1 trong 3
  -- bước chờ xử lý trung gian (không cho trả lại từ 'du-thao' hay 'da-duyet').
  if new.trang_thai = 'tra-lai' then
    if old.trang_thai not in ('cho-don-vi-xac-nhan', 'cho-khkt-tham-tra', 'cho-lanh-dao-duyet') then
      raise exception 'Điều 7.1c QC 2815: chỉ được trả lại phiếu đang ở bước chờ xử lý (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    if not fn_truong_don_vi_tro_len() then
      raise exception 'Điều 7.1c QC 2815: chỉ Trưởng đơn vị trở lên mới được trả lại Phiếu giao việc (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
  end if;

  return new;
end $$;

comment on function fn_kiem_soat_ky_giao_viec is
  'Chốt chặn luồng ký Phiếu giao việc Điều 7.1c — khóa 4 trường nội dung khi đã phê duyệt, kiểm tra thẩm quyền từng bước kể cả trả lại';
