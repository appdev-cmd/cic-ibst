-- ============================================================
-- 0020 — Đóng nốt lỗ hổng danh tính còn lại (tiếp theo 0019):
--   "Ai tạo hợp đồng" và "Ai soạn Phiếu giao việc" hiện chỉ suy luận gián tiếp qua
--   nhat_ky_du_lieu (Nhật ký), không có cột riêng, không hiện trực tiếp trên form.
--
--   Khác với nguoi_duyet_id / nguoi_*_xac_nhan_id (0019 — do CLIENT truyền lên khi bấm
--   nút một hành động CÓ CHỦ ĐÍCH tại một thời điểm cụ thể), "người tạo" phải LUÔN đúng
--   với người thật đang INSERT bản ghi — nên gán bằng TRIGGER phía CSDL (an toàn hơn,
--   không thể quên truyền hoặc giả mạo từ client), lấy trực tiếp từ auth.uid().
-- ============================================================

alter table hop_dong add column if not exists nguoi_tao_id bigint references nhan_su(id);
comment on column hop_dong.nguoi_tao_id is 'Người thực sự tạo bản ghi hợp đồng — tự động gán từ tài khoản đăng nhập (Điều 9/10 QC 2815)';

alter table phieu_giao_viec add column if not exists nguoi_soan_id bigint references nhan_su(id);
comment on column phieu_giao_viec.nguoi_soan_id is 'Người thực sự soạn Phiếu giao việc — tự động gán từ tài khoản đăng nhập (Điều 7.1c bước 1)';

create or replace function fn_gan_nguoi_tao() returns trigger
language plpgsql security definer as $$
declare
  v_nhan_su_id bigint;
begin
  select nhan_su_id into v_nhan_su_id from nguoi_dung where user_id = auth.uid();
  if tg_table_name = 'hop_dong' then
    if new.nguoi_tao_id is null then
      new.nguoi_tao_id := v_nhan_su_id;
    end if;
  elsif tg_table_name = 'phieu_giao_viec' then
    if new.nguoi_soan_id is null then
      new.nguoi_soan_id := v_nhan_su_id;
    end if;
  end if;
  return new;
end $$;

comment on function fn_gan_nguoi_tao is 'Tự động gán người tạo/soạn bản ghi từ tài khoản đăng nhập thật (auth.uid()) — không phụ thuộc client truyền lên';

drop trigger if exists trg_hop_dong_nguoi_tao on hop_dong;
create trigger trg_hop_dong_nguoi_tao
  before insert on hop_dong
  for each row execute function fn_gan_nguoi_tao();

drop trigger if exists trg_phieu_giao_viec_nguoi_soan on phieu_giao_viec;
create trigger trg_phieu_giao_viec_nguoi_soan
  before insert on phieu_giao_viec
  for each row execute function fn_gan_nguoi_tao();

-- Dữ liệu mẫu demo (401-406/2026) được tạo trước migration này bằng SQL thô nên chưa có
-- người tạo/soạn — hồi tố bằng chủ trì tương ứng để không hiện trống trên UI demo.
update hop_dong set nguoi_tao_id = chu_tri_id
where nguoi_tao_id is null and chu_tri_id is not null
  and so_hop_dong in ('401/2026/HDTV','402/2026/HDTN','403/2026/HDTC','404/2026/HDGD','405/2026/HDKS','406/2026/HDTV');

update phieu_giao_viec pgv set nguoi_soan_id = hd.chu_tri_id
from hop_dong hd
where pgv.hop_dong_id = hd.id and pgv.nguoi_soan_id is null and hd.chu_tri_id is not null
  and hd.so_hop_dong in ('401/2026/HDTV','402/2026/HDTN','403/2026/HDTC','404/2026/HDGD','406/2026/HDTV');
