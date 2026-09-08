-- ============================================================
-- 0035 — Đợt 3 kế hoạch hoàn thiện module Hợp đồng
--        (docs/review-module-hop-dong-2026-09.md §6 Đợt 3)
--
--   QT3 — Điều 7.1c: đủ 4 NHÁNH ký Quyết định giao việc (trước chỉ có 2).
--   QT4 — Điều 8.2: đóng dấu sơ bộ khi hợp đồng chưa ký đủ các bên.
--       — Điều 8.3: Trưởng đơn vị là chủ trì thì phải giao Phó đơn vị quản lý.
--       — Điều 10:  kiểm tra nội bộ 2 cấp (đơn vị tự kiểm / Viện kiểm tra).
-- ============================================================

-- ─── 1. Cờ nghiệp vụ trên hợp đồng ───
alter table hop_dong
  -- Đ.3.o + Đ.7.1c: mô hình quản lý tập trung tại đơn vị (bắt buộc với TVGS, TVQLDA, thi công)
  add column if not exists quan_ly_tap_trung boolean not null default false,
  -- Đ.8.2: đóng dấu sơ bộ khi hợp đồng đang chờ thủ tục ký kết
  add column if not exists dong_dau_so_bo               boolean not null default false,
  add column if not exists ngay_dong_dau_so_bo          date,
  add column if not exists nguoi_chap_thuan_dau_so_bo_id bigint references nhan_su(id),
  add column if not exists so_vb_chap_thuan_dau_so_bo   varchar(100),
  -- Đ.8.3: khi trưởng đơn vị là chủ trì HĐ, phải giao 1 phó đơn vị quản lý HĐ đó
  add column if not exists pho_don_vi_quan_ly_id        bigint references nhan_su(id);

comment on column hop_dong.quan_ly_tap_trung is
  'Đ.3.o/Đ.7.1c: HĐ thực hiện theo mô hình quản lý tập trung tại đơn vị — luồng giao việc đi nhánh D (Trưởng ĐV đề xuất nhân sự → Lãnh đạo Viện ký quyết định).';
comment on column hop_dong.dong_dau_so_bo is
  'Đ.8.2: hồ sơ kết quả được đóng dấu khi HĐ chưa ký đủ các bên — phải có chấp thuận của Lãnh đạo Viện (HĐ Viện ký) hoặc Giám đốc đơn vị (HĐ đơn vị ký), và hoàn tất ký kết trong 30 ngày.';
comment on column hop_dong.pho_don_vi_quan_ly_id is
  'Đ.8.3: phó trưởng đơn vị được giao quản lý HĐ khi chính Trưởng đơn vị là người chủ trì (tránh tự mình quản lý mình).';

-- ─── 2. Kiểm tra nội bộ 2 cấp (Điều 10) ───
alter table kiem_tra_noi_bo
  add column if not exists cap_kiem_tra  varchar(20) not null default 'don-vi',  -- don-vi | vien
  add column if not exists theo_ke_hoach boolean not null default true,          -- định kỳ theo kế hoạch / đột xuất
  add column if not exists nam_ke_hoach  smallint;

comment on column kiem_tra_noi_bo.cap_kiem_tra is
  'Đ.10.1 đơn vị tự kiểm tra HĐ do đơn vị được phân cấp ký; Đ.10.2 Viện kiểm tra định kỳ theo kế hoạch năm hoặc đột xuất (thành phần: LĐV phụ trách + TCKT + KHKT + TCHC).';

-- ─── 3. Nhánh ký Quyết định giao việc — Điều 7.1c ───
-- Hàm xác định nhánh, dùng chung cho trigger CSDL và (đồng bộ nhãn) lib/kyGiaoViec.ts.
--   A = HĐ Viện ký thông thường : chủ trì soạn → Trưởng ĐV xác nhận → KHKT thẩm tra → LĐV duyệt
--   B = HĐ phức tạp/chính trị   : P.KHKT đề xuất & soạn → Viện trưởng ký duyệt          (Đ.5.2b)
--   C = HĐ đơn vị phân cấp ký   : chủ trì soạn → Trưởng phòng/xưởng xác nhận → P.TH thẩm tra → Trưởng ĐV duyệt
--   D = HĐ quản lý tập trung    : Trưởng ĐV đề xuất nhân sự → Lãnh đạo Viện ký quyết định
-- Thứ tự ưu tiên: B (thẩm quyền Viện trưởng) → D (mô hình tập trung) → C/A theo cấp ký.
create or replace function fn_nhanh_ky_giao_viec(p_hop_dong_id bigint) returns text
language sql stable security definer as $$
  select case
           when h.phuc_tap and coalesce(h.cap_ky, 'vien-ky') <> 'don-vi-ky' then 'B'
           when h.quan_ly_tap_trung then 'D'
           when h.cap_ky = 'don-vi-ky' then 'C'
           else 'A'
         end
  from hop_dong h where h.id = p_hop_dong_id;
$$;
comment on function fn_nhanh_ky_giao_viec is
  'Điều 7.1c QC 2815 — xác định nhánh ký Quyết định giao việc (A/B/C/D) theo cờ phuc_tap, quan_ly_tap_trung và cap_ky của hợp đồng.';

-- ─── 4. Trigger kiểm soát ký giao việc theo 4 nhánh (thay bản 0022) ───
create or replace function fn_kiem_soat_ky_giao_viec() returns trigger
language plpgsql security definer as $$
declare
  v_cap_ky text;
  v_nhanh  text;
begin
  -- Phiếu đã phê duyệt là chốt cuối — khóa 4 trường nội dung quyết định (giữ nguyên từ 0022).
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
  v_nhanh := fn_nhanh_ky_giao_viec(new.hop_dong_id);

  -- ── Nhánh B: P.KHKT soạn, trình thẳng Viện trưởng (Đ.5.2b + Đ.7.1c-3) ──
  if v_nhanh = 'B' then
    if new.trang_thai = 'cho-lanh-dao-duyet' and not fn_khkt_tro_len() then
      raise exception 'Điều 7.1c QC 2815 (nhánh B — HĐ kỹ thuật phức tạp/chính trị): Phòng KHKT là bộ phận đề xuất và soạn thảo quyết định giao việc (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    if new.trang_thai = 'da-duyet' and not fn_lanh_dao_tro_len() then
      raise exception 'Điều 7.1c QC 2815 (nhánh B): quyết định giao việc HĐ kỹ thuật phức tạp/chính trị phải do Viện trưởng ký duyệt (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;

  -- ── Nhánh D: quản lý tập trung — Trưởng ĐV đề xuất, Lãnh đạo Viện ký (Đ.7.1c-2) ──
  elsif v_nhanh = 'D' then
    if new.trang_thai = 'cho-lanh-dao-duyet' and not fn_truong_don_vi_tro_len() then
      raise exception 'Điều 7.1c QC 2815 (nhánh D — quản lý tập trung): Trưởng đơn vị là người đề xuất nhân sự thực hiện (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    if new.trang_thai = 'da-duyet' and not fn_lanh_dao_tro_len() then
      raise exception 'Điều 7.1c QC 2815 (nhánh D): Lãnh đạo Viện xem xét, ký quyết định giao việc của HĐ quản lý tập trung (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;

  -- ── Nhánh A / C: đủ 4 bước (giữ nguyên quy tắc từ 0022) ──
  else
    if new.trang_thai = 'cho-khkt-tham-tra' and not fn_truong_don_vi_tro_len() then
      raise exception 'Điều 7.1c QC 2815: chỉ Trưởng đơn vị trở lên mới ký xác nhận Phiếu giao việc (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;

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
  end if;

  -- ── Đ.8.3: Trưởng đơn vị là chủ trì thì phải giao Phó đơn vị quản lý ──
  -- Chốt tại thời điểm phê duyệt phiếu (không chặn lúc tạo/sửa hợp đồng để khỏi cản nhập liệu).
  if new.trang_thai = 'da-duyet' then
    if exists (
      select 1 from hop_dong h join don_vi dv on dv.id = h.don_vi_id
      where h.id = new.hop_dong_id
        and h.chu_tri_id is not null
        and h.chu_tri_id = dv.truong_don_vi_id
        and h.pho_don_vi_quan_ly_id is null
    ) then
      raise exception
        'Điều 8.3 QC 2815: Trưởng đơn vị đang là chủ trì hợp đồng — phải giao một Phó trưởng đơn vị thực hiện việc quản lý của đơn vị đối với hợp đồng này trước khi phê duyệt phiếu giao việc.'
        using errcode = '42501';
    end if;
  end if;

  -- ── Trả lại để sửa (giữ nguyên từ 0022) ──
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
  'Chốt chặn luồng ký Phiếu giao việc Điều 7.1c — đủ 4 nhánh A/B/C/D (migration 0035) + chốt Điều 8.3 tại bước phê duyệt.';

-- ─── 5. Đ.8.2 — chấp thuận đóng dấu sơ bộ là thẩm quyền lãnh đạo ───
create or replace function fn_kiem_soat_dau_so_bo() returns trigger
language plpgsql security definer as $$
begin
  if new.dong_dau_so_bo and not coalesce(old.dong_dau_so_bo, false) then
    if new.cap_ky = 'don-vi-ky' then
      if not fn_truong_don_vi_tro_len() then
        raise exception 'Điều 8.2 QC 2815: đóng dấu sơ bộ hồ sơ của HĐ đơn vị ký phải được Giám đốc đơn vị chấp thuận (vai trò hiện tại: %).', fn_vai_tro()
          using errcode = '42501';
      end if;
    elsif not fn_lanh_dao_tro_len() then
      raise exception 'Điều 8.2 QC 2815: đóng dấu sơ bộ hồ sơ của HĐ Viện ký phải được Lãnh đạo Viện chấp thuận (vai trò hiện tại: %).', fn_vai_tro()
        using errcode = '42501';
    end if;
    if new.ngay_dong_dau_so_bo is null then
      new.ngay_dong_dau_so_bo := current_date;
    end if;
  end if;
  return new;
end $$;

comment on function fn_kiem_soat_dau_so_bo is
  'Điều 8.2 QC 2815 — đóng dấu sơ bộ khi HĐ chưa ký đủ các bên phải có chấp thuận của cấp có thẩm quyền theo cấp ký; tự ghi ngày để đếm ngược hạn 30 ngày hoàn tất ký kết.';

drop trigger if exists trg_hop_dong_dau_so_bo on hop_dong;
create trigger trg_hop_dong_dau_so_bo
  before update on hop_dong
  for each row execute function fn_kiem_soat_dau_so_bo();
