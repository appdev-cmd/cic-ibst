-- ============================================================
-- 0010 — Quy chế 2815/QĐ-VKH: mở rộng Điều 14 (Phạt, đủ 8 dòng)
--   và các trường hợp đặc thù/ngoại lệ của Bảng 1 (Ghi chú, trang 23)
-- ============================================================

alter table hop_dong
  add column han_chung_tu_quyet_toan date,   -- hạn TCKT yêu cầu nộp chứng từ quyết toán (Điều 14.2 dòng 2)
  add column loai_dac_thu varchar(30)
    check (loai_dac_thu is null or loai_dac_thu in
      ('khao-sat-dia-chat','tn-dat-vl-thep-han','tn-hoa-hoc-kim-loai',
       'thau-phu-vien-ky','thau-phu-don-vi-ky','cong-ty-co-phan')),
  add column phan_vien_xa boolean not null default false,
  add column giam_theo_yeu_cau_don_vi boolean not null default false;

comment on column hop_dong.han_chung_tu_quyet_toan is 'Hạn nộp chứng từ quyết toán do TCKT yêu cầu — Điều 14.2 dòng 2 (phạt 1%/0,5% nếu trễ)';
comment on column hop_dong.loai_dac_thu is 'Trường hợp đặc thù áp tỷ lệ khác Bảng 1 chính, theo Ghi chú Bảng 1 (trang 23 QC 2815)';
comment on column hop_dong.phan_vien_xa is 'Phân viện/Trung tâm ở xa — cộng thêm kinh phí hỗ trợ đi lại (Ghi chú 3, Bảng 1)';
comment on column hop_dong.giam_theo_yeu_cau_don_vi is 'HĐ ngoài nhóm 1 do đơn vị tự yêu cầu Viện ký — giảm tỷ lệ giao khoán (Ghi chú 6, Bảng 1)';
