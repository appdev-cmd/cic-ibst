-- ============================================================
-- 0041 — Giai đoạn 3: Nối Tầng 3 (ma trận quyền) vào RLS bảng nghiệp vụ
--   Xem docs/phan-quyen-he-thong-ibst.md §10, docs/ke-hoach-phan-quyen-ibst.md
--
--   Kỹ thuật: policy RESTRICTIVE. Postgres OR các policy PERMISSIVE cùng lệnh
--   với nhau rồi AND với mọi policy RESTRICTIVE cùng lệnh. Vì vậy thêm policy
--   RESTRICTIVE gọi fn_co_quyen() KHÔNG sửa/xóa một policy cũ nào — toàn bộ
--   logic phạm vi đơn vị/chủ trì hiện có (Tầng 4) giữ nguyên 100%, chỉ bị AND
--   thêm điều kiện "có quyền trên tài nguyên" (Tầng 3) chồng lên trên.
--
--   ═══ HAI NHÓM, VÌ SAO KHÔNG SIẾT ĐỀU ═══
--   Rà soát code + policy hiện có phát hiện: các bảng "con" của hợp đồng
--   (dot_thanh_toan, phieu_giao_viec...) tuy đã có RLS theo phạm vi đơn vị/chủ
--   trì, nhưng KHÔNG có phân biệt vai trò khi GHI — bất kỳ ai trong phạm vi đều
--   ghi được (xem components/DetailPanels.tsx: không có kiểm tra vaiTro trước
--   khi tạo/sửa đợt thanh toán). Ma trận Tầng 3 (migration 0040) lại xây theo
--   đúng ý định nghiệp vụ "NVKD chỉ nhập dự kiến, Kế toán ghi nhận thực tế" —
--   siết thẳng quyền GHI theo ma trận đó lên các bảng này sẽ CHẶN NHẦM luồng
--   nhập liệu thật đang chạy (vì các bảng chưa tách cột dự kiến/thực tế).
--
--   Nhóm A — bảng ĐANG MỞ HOÀN TOÀN (qual = true / auth.role()='authenticated',
--     không có bất kỳ điều kiện phạm vi hay vai trò nào): siết ĐỦ CẢ 4 lệnh
--     (xem/thêm/sửa/xóa) theo ma trận. Rủi ro thấp vì hiện tại KHÔNG có phân
--     biệt gì để so sánh — siết theo ma trận chỉ có thể XIẾT CHẶT, không thể
--     phá luồng vai trò nào (chưa từng có luồng vai trò nào để phá).
--
--   Nhóm B — CHỈ siết quyền XEM theo ma trận (AND thêm fn_co_quyen(resource,
--     'xem')), KHÔNG đụng quyền thêm/sửa/xóa. Gồm hai loại:
--     • Bảng ĐÃ CÓ RLS theo phạm vi đơn vị/chủ trì (Tầng 4) — giữ nguyên logic
--       ghi hiện có, chờ Giai đoạn 0 (nghiệp vụ duyệt ma trận chính thức) rồi
--       mới siết ghi theo từng bảng.
--     • `de_nghi_xuat_hoa_don`, `tam_ung` tuy đang mở hoàn toàn (như Nhóm A)
--       nhưng cùng dạng "bên kinh doanh đề xuất, Kế toán ghi nhận" như
--       `dot_thanh_toan` — siết thẳng quyền GHI theo ma trận (chỉ TCKT có
--       thêm/sửa) sẽ chặn nhầm luồng đề xuất hiện tại, nên chỉ siết XEM.
--
--   Nhóm KHÔNG ĐỤNG TỚI (giữ nguyên 100%, không thêm policy nào):
--     • 17 bảng đã có RLS chi tiết theo vai trò TỪ migration 0033 (hồ sơ CBVC
--       mở rộng, lương/HĐLĐ, Đảng — Đoàn thể...) — các bảng này đã có ngoại lệ
--       "tự đọc hồ sơ của mình" mà ma trận Tầng 3 (theo tài nguyên, không theo
--       từng người) không tái hiện đúng được, dễ chặn nhầm quyền tự xem.
--     • Bảng danh mục/tham chiếu dùng chung (dm_danh_muc, workflow_trang_thai,
--       sd_danh_muc_du_lieu — có phần cho anon theo QĐ943) và bảng đa hình
--       (sla_theo_doi — loai_doi_tuong/doi_tuong_id trỏ nhiều loại bảng khác
--       nhau, không gán được một tài nguyên duy nhất).
--     • Các bảng của chính Tầng 3 (quyen_*), nguoi_dung, nhat_ky_du_lieu.
--     • `uy_quyen` — policy đọc hiện có cho phép TỰ XEM ủy quyền của chính mình
--       (nguoi_uy_quyen_id / nguoi_duoc_uy_quyen_id = mình) bất kể vai trò; gán
--       cứng theo tài nguyên `bao_cao_khkt` sẽ chặn nhầm người được ủy quyền
--       xem chính ủy quyền của họ nếu vai trò đó không có `bao_cao_khkt:xem`.
-- ============================================================

-- ─── Nhóm A — siết đủ 4 lệnh theo ma trận (bảng hiện đang mở hoàn toàn) ───

do $$
declare
  v_map jsonb := '{
    "nhan_su": "nhan_su",
    "chung_chi_hanh_nghe": "nhan_su",
    "khach_hang": "khach_hang",
    "van_ban": "van_ban",
    "don_vi": "don_vi",
    "de_tai": "de_tai",
    "moc_de_tai": "de_tai",
    "mau_thi_nghiem": "mau_thu",
    "ket_qua_phep_thu": "mau_thu",
    "so_tap_chi": "tap_chi",
    "bai_bao_khoa_hoc": "tap_chi",
    "phan_bien_khoa_hoc": "tap_chi",
    "lop_dao_tao": "dao_tao_ncs"
  }'::jsonb;
  v_table text;
  v_resource text;
begin
  for v_table, v_resource in select key, value from jsonb_each_text(v_map)
  loop
    execute format('drop policy if exists "t3_%s_xem" on %I', v_table, v_table);
    execute format(
      'create policy "t3_%s_xem" on %I as restrictive for select to authenticated using (fn_co_quyen(%L, ''xem''))',
      v_table, v_table, v_resource
    );

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

-- ─── Nhóm B — chỉ siết quyền XEM, giữ nguyên logic ghi theo phạm vi đơn vị/chủ trì ───

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
    execute format('drop policy if exists "t3_%s_xem" on %I', v_table, v_table);
    execute format(
      'create policy "t3_%s_xem" on %I as restrictive for select to authenticated using (fn_co_quyen(%L, ''xem''))',
      v_table, v_table, v_resource
    );
  end loop;
end $$;
