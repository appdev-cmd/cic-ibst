-- ============================================================
-- 0042 — Giai đoạn 3 (tiếp): siết quyền GHI cho 20 bảng "Nhóm B"
--   Nghiệp vụ đã duyệt ma trận (Giai đoạn 0) — xem docs/phan-quyen-he-thong-ibst.md §13.
--
--   Migration 0041 mới siết XEM cho các bảng này (giữ nguyên logic phạm vi đơn vị/
--   chủ trì hiện có, không đụng quyền ghi). Bây giờ nối nốt THÊM/SỬA/XÓA theo đúng
--   kỹ thuật RESTRICTIVE — AND thêm điều kiện lên các policy PERMISSIVE hiện có,
--   không sửa/xóa một policy cũ nào.
--
--   Trước khi chạy, đã vá lỗi RLS-chặn-UPDATE-không-báo-lỗi (rlsGuard.ts) cho toàn
--   bộ hàm UPDATE/DELETE của 20 bảng này ở tầng ứng dụng (xem commit cùng đợt).
--
--   Đã sửa trước ma trận: 'tai_chinh' của chuyen-vien/truong-don-vi thêm
--   'them'+'sua' (trước chỉ có 'xem') — khớp thực tế đang chạy: bên kinh doanh tạo
--   đợt thanh toán/tạm ứng/đề nghị xuất hóa đơn dự kiến, Kế toán xác nhận thực tế.
--   Không đụng 'xoa' — chỉ Kế toán trưởng xóa thu/chi thực tế (đã đúng từ trước).
-- ============================================================

do $$
declare
  v_map jsonb := '{
    "hop_dong": "hop_dong",
    "hop_dong_thuong_phat": "tai_chinh",
    "hop_dong_tep_dinh_kem": "hop_dong",
    "kiem_tra_noi_bo": "hop_dong",
    "kiem_tra_khac_phuc": "hop_dong",
    "quyet_toan_giai_doan": "tai_chinh",
    "dot_thanh_toan": "tai_chinh",
    "lien_danh": "hop_dong",
    "luu_tru_ho_so": "hop_dong",
    "phieu_giao_viec": "hop_dong",
    "phieu_giao_viec_ctv": "hop_dong",
    "phieu_giao_viec_don_vi": "hop_dong",
    "phan_phoi_hop_dong": "hop_dong",
    "to_phan_phoi": "hop_dong",
    "tien_do_hop_dong": "hop_dong",
    "dang_ky_dau_moi": "dau_thau",
    "dau_thau": "dau_thau",
    "nhiem_vu_pvqlnn": "pvqlnn",
    "de_nghi_xuat_hoa_don": "tai_chinh",
    "tam_ung": "tai_chinh"
  }'::jsonb;
  v_table text;
  v_resource text;
begin
  for v_table, v_resource in select key, value from jsonb_each_text(v_map)
  loop
    execute format('drop policy if exists "t3_%s_them" on %I', v_table, v_table);
    execute format(
      'create policy "t3_%s_them" on %I as restrictive for insert to authenticated with check (fn_co_quyen(%L, ''them''))',
      v_table, v_table, v_resource
    );

    execute format('drop policy if exists "t3_%s_sua" on %I', v_table, v_table);
    execute format(
      'create policy "t3_%s_sua" on %I as restrictive for update to authenticated using (fn_co_quyen(%L, ''sua'')) with check (fn_co_quyen(%L, ''sua''))',
      v_table, v_table, v_resource, v_resource
    );

    execute format('drop policy if exists "t3_%s_xoa" on %I', v_table, v_table);
    execute format(
      'create policy "t3_%s_xoa" on %I as restrictive for delete to authenticated using (fn_co_quyen(%L, ''xoa''))',
      v_table, v_table, v_resource
    );
  end loop;
end $$;
