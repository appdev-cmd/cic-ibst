-- ============================================================
-- 0022 — Mở rộng vai trò phòng chức năng theo ma trận RACI Điều 4 QC 2815
--   (Giai đoạn 0 kế hoạch số hóa — docs/ke-hoach-so-hoa-quy-trinh-2815.md)
--
--   Trước đây hệ thống chỉ có 4 vai trò (quan-tri, lanh-dao, truong-don-vi,
--   chuyen-vien) nên bước "KHKT thẩm tra" (Đ.9.6c) và "P.Tổng hợp thẩm tra"
--   (Đ.7.1c-4) phải tạm quy về "Trưởng đơn vị trở lên". Migration này:
--     1. Thêm 5 vai trò phòng chức năng vào danh mục.
--     2. Siết trigger ký Phiếu giao việc: bước thẩm tra phân biệt theo cap_ky —
--        HĐ Viện ký do P.KHKT thẩm tra, HĐ đơn vị ký do P.Tổng hợp đơn vị
--        (Trưởng đơn vị vẫn được thao tác ở đơn vị chưa có P.TH riêng).
--     3. Mở thẩm quyền cập nhật trạng thái quyết toán cho P.TCKT (đầu mối
--        quản lý quyết toán toàn Viện — Đ.11.4) và Phụ trách kế toán đơn vị
--        (thực hiện thủ tục thanh quyết toán — Đ.11.1/11.2).
-- ============================================================

-- ─── 1. Danh mục vai trò mới ───
insert into dm_danh_muc (nhom, ma_muc, ten_muc) values
  ('vai_tro','phong-khkt','Phòng Kế hoạch – Kỹ thuật'),
  ('vai_tro','phong-tckt','Phòng Tài chính – Kế toán'),
  ('vai_tro','phong-tchc','Phòng Tổ chức – Hành chính'),
  ('vai_tro','phong-th-don-vi','Phòng Tổng hợp đơn vị'),
  ('vai_tro','phu-trach-ke-toan-dv','Phụ trách kế toán đơn vị')
on conflict (nhom, ma_muc) do nothing;

-- ─── 2. Hàm tiện ích kiểm tra nhóm vai trò ───
create or replace function fn_khkt_tro_len() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in ('quan-tri','lanh-dao','phong-khkt');
$$;
comment on function fn_khkt_tro_len is 'Vai trò được thẩm tra hồ sơ cấp Viện (Đ.9.6c): P.KHKT + Lãnh đạo Viện + quản trị';

create or replace function fn_tckt_tro_len() returns boolean
language sql stable security definer as $$
  select fn_vai_tro() in ('quan-tri','lanh-dao','phong-tckt');
$$;
comment on function fn_tckt_tro_len is 'Vai trò nghiệp vụ tài chính cấp Viện (Đ.11): P.TCKT + Lãnh đạo Viện + quản trị';

-- ─── 3. Siết trigger ký Phiếu giao việc (thay bản 0021) ───
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

  -- Thẩm tra (Điều 9.6c / 7.1c-4) — phân biệt theo cấp ký hợp đồng:
  --   HĐ Viện ký:   P.KHKT thẩm tra (Lãnh đạo Viện/quản trị được thao tác thay).
  --   HĐ đơn vị ký: P.Tổng hợp đơn vị thẩm tra; Trưởng đơn vị vẫn được thao tác
  --                 (đơn vị nhỏ chưa bố trí P.TH riêng).
  if new.trang_thai = 'cho-lanh-dao-duyet' then
    if v_cap_ky = 'don-vi-ky' then
      if not (fn_truong_don_vi_tro_len() or fn_vai_tro() = 'phong-th-don-vi') then
        raise exception 'Điều 7.1c QC 2815: Phiếu giao việc của HĐ đơn vị ký do Phòng Tổng hợp đơn vị thẩm tra (vai trò hiện tại: %).', fn_vai_tro()
          using errcode = '42501';
      end if;
    elsif not fn_khkt_tro_len() then
      raise exception 'Điều 9.6c QC 2815: Quyết định giao việc của HĐ Viện ký do Phòng KHKT thẩm tra (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
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

  -- Trả lại để sửa (Điều 7.1c) — Trưởng đơn vị trở lên hoặc bộ phận thẩm tra,
  -- và chỉ khi đang ở 1 trong 3 bước chờ xử lý trung gian.
  if new.trang_thai = 'tra-lai' then
    if old.trang_thai not in ('cho-don-vi-xac-nhan', 'cho-khkt-tham-tra', 'cho-lanh-dao-duyet') then
      raise exception 'Điều 7.1c QC 2815: chỉ được trả lại phiếu đang ở bước chờ xử lý (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    if not (fn_truong_don_vi_tro_len() or fn_vai_tro() in ('phong-khkt','phong-th-don-vi')) then
      raise exception 'Điều 7.1c QC 2815: chỉ Trưởng đơn vị trở lên hoặc bộ phận thẩm tra mới được trả lại Phiếu giao việc (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
  end if;

  return new;
end $$;

comment on function fn_kiem_soat_ky_giao_viec is
  'Chốt chặn luồng ký Phiếu giao việc Điều 7.1c — bước thẩm tra tách riêng P.KHKT (Viện ký) / P.TH đơn vị (đơn vị ký) từ migration 0022';

-- ─── 4. Mở thẩm quyền quyết toán cho vai trò tài chính (thay bản 0018) ───
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
  --   11.1 — HĐ Viện ký: Lãnh đạo Viện ký duyệt bản phân phối; P.TCKT là đầu mối thống
  --          nhất quản lý quyết toán toàn Viện (Đ.11.4) nên được ghi nhận trạng thái.
  --   11.2 — HĐ đơn vị ký: Trưởng đơn vị ký duyệt; Phụ trách kế toán đơn vị thực hiện
  --          thủ tục thanh quyết toán (Đ.11.1) nên được ghi nhận trạng thái.
  -- HĐ chưa gán cấp ký (cap_ky is null, dữ liệu cũ) tạm coi như HĐ Viện ký — chặt hơn.
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
  'Chặn cập nhật vượt thẩm quyền theo Điều 6.1 (phê duyệt) và Điều 11 (quyết toán — mở cho P.TCKT/Phụ trách kế toán ĐV từ migration 0022)';
