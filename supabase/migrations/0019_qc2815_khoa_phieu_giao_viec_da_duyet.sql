-- ============================================================
-- 0019 — Khoá Phiếu giao việc đã phê duyệt (Điều 7.1c QC 2815)
--
--   Phát hiện khi soát lại: fn_kiem_soat_ky_giao_viec (0015) chỉ kiểm tra thẩm quyền khi
--   trang_thai THAY ĐỔI — nếu trang_thai giữ nguyên 'da-duyet' thì hàm return sớm, không
--   có chốt chặn nào cả. Nghĩa là một phiếu đã "Đã duyệt — Có hiệu lực" vẫn có thể bị sửa
--   thẳng nội dung (chủ trì kỹ thuật, kinh phí giao, ngày giao, nội dung) mà không qua lại
--   quy trình ký duyệt — trái Điều 7.1c (quyết định đã duyệt là chốt cuối) và Điều 7.1 Ghi
--   chú (muốn đổi chủ trì/chủ trì kỹ thuật phải "trình tự lập lại như trên").
--   buocKeTiep() phía client (kyGiaoViec.ts) cũng coi 'da-duyet' là trạng thái cuối, không
--   có bước kế tiếp nào — nên khoá tuyệt đối, không mở lối "trả lại" từ da-duyet.
-- ============================================================

create or replace function fn_kiem_soat_ky_giao_viec() returns trigger
language plpgsql security definer as $$
declare
  v_cap_ky text;
begin
  -- Phiếu đã phê duyệt là chốt cuối — không cho sửa bất kỳ trường nào nữa (kể cả khi
  -- trang_thai giữ nguyên 'da-duyet'). Cần thay đổi thì lập phiếu điều chỉnh mới.
  if old.trang_thai = 'da-duyet' then
    raise exception
      'Điều 7.1c QC 2815: Phiếu giao việc đã phê duyệt (có hiệu lực) — không được sửa. Cần lập phiếu điều chỉnh mới nếu có thay đổi (Điều 7.1 Ghi chú).'
      using errcode = '42501';
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
  -- bước chờ xử lý trung gian (không cho trả lại từ 'du-thao' hay 'da-duyet' — 'da-duyet'
  -- đã bị khoá tuyệt đối ở nhánh trên).
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
  'Chốt chặn luồng ký Phiếu giao việc Điều 7.1c — khoá nội dung khi đã phê duyệt, kiểm tra thẩm quyền từng bước kể cả trả lại';
