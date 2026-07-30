-- ============================================================
-- 0018 — Sửa 2 sai lệch phát hiện khi rà soát lại QC 2815/QĐ-VKH:
--
--   A. Điều 6.1: "Các việc nhóm 1" phải trình Viện trưởng VÔ ĐIỀU KIỆN, không phụ
--      thuộc giá trị HĐ (điều kiện này tách biệt với ngưỡng giá trị 2/5/10 tỷ chỉ áp
--      cho các trường hợp khác). Sửa ở phía client (qc2815.ts canTrinhVienTruong),
--      không có logic tương ứng ở DB nên không cần đổi trigger cho phần này.
--
--   B. Điều 11: quyết toán/thanh lý hợp đồng KHÔNG đồng nhất thẩm quyền theo cấp ký —
--        11.1 — HĐ Viện ký:   TCKT trình Lãnh đạo Viện ký duyệt bản phân phối quyết toán.
--        11.2 — HĐ đơn vị ký: Viện trưởng phân công Trưởng đơn vị ký duyệt.
--      Trigger cũ (0013) cho "Trưởng đơn vị trở lên" quyết toán MỌI hợp đồng bất kể
--      cap_ky — Trưởng đơn vị có thể tự quyết toán cả HĐ Viện ký, sai thẩm quyền.
-- ============================================================

create or replace function fn_kiem_soat_tham_quyen_hop_dong() returns trigger
language plpgsql security definer as $$
begin
  -- Điều 6.1: xác nhận "đã duyệt" là thẩm quyền Viện trưởng / Phó Viện trưởng ủy quyền.
  if new.trang_thai_phe_duyet is distinct from old.trang_thai_phe_duyet
     and new.trang_thai_phe_duyet = 'da-duyet'
     and not fn_lanh_dao_tro_len() then
    raise exception
      'Điều 6.1 QC 2815: vai trò "%" không có thẩm quyền phê duyệt hợp đồng. Thẩm quyền thuộc Viện trưởng hoặc Phó Viện trưởng được ủy quyền.',
      fn_vai_tro()
      using errcode = '42501';
  end if;

  -- Điều 11: quyết toán, thanh lý hợp đồng — thẩm quyền khác nhau theo cấp ký (cap_ky).
  -- HĐ chưa gán cấp ký (cap_ky is null, dữ liệu cũ) tạm coi như HĐ Viện ký (11.1) — chặt
  -- hơn, an toàn hơn là mặc định lỏng.
  if new.trang_thai_quyet_toan is distinct from old.trang_thai_quyet_toan then
    if new.cap_ky = 'don-vi-ky' then
      if not fn_truong_don_vi_tro_len() then
        raise exception
          'Điều 11.2 QC 2815: vai trò "%" không có thẩm quyền quyết toán/thanh lý hợp đồng đơn vị ký. Thẩm quyền thuộc Trưởng đơn vị.',
          fn_vai_tro()
          using errcode = '42501';
      end if;
    else
      if not fn_lanh_dao_tro_len() then
        raise exception
          'Điều 11.1 QC 2815: vai trò "%" không có thẩm quyền quyết toán/thanh lý hợp đồng Viện ký. Thẩm quyền thuộc Lãnh đạo Viện.',
          fn_vai_tro()
          using errcode = '42501';
      end if;
    end if;
  end if;

  return new;
end $$;

comment on function fn_kiem_soat_tham_quyen_hop_dong is
  'Chặn cập nhật vượt thẩm quyền theo Điều 6.1 (phê duyệt) và Điều 11.1/11.2 (quyết toán — phân biệt theo cap_ky) QC 2815';
