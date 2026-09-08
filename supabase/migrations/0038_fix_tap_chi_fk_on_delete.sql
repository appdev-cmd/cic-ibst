-- Fix: Tất cả FK → nhan_su cần ON DELETE CASCADE hoặc SET NULL
-- Lý do: Không thể xóa nhân sự vì FK constraint block

-- ═══ Bảng con trực thuộc nhân sự → CASCADE ═══
ALTER TABLE bang_cap DROP CONSTRAINT IF EXISTS bang_cap_nhan_su_id_fkey;
ALTER TABLE bang_cap ADD CONSTRAINT bang_cap_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE hop_dong_lao_dong DROP CONSTRAINT IF EXISTS hop_dong_lao_dong_nhan_su_id_fkey;
ALTER TABLE hop_dong_lao_dong ADD CONSTRAINT hop_dong_lao_dong_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE luong_ngach_bac DROP CONSTRAINT IF EXISTS luong_ngach_bac_nhan_su_id_fkey;
ALTER TABLE luong_ngach_bac ADD CONSTRAINT luong_ngach_bac_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE danh_gia_cbvc DROP CONSTRAINT IF EXISTS danh_gia_cbvc_nhan_su_id_fkey;
ALTER TABLE danh_gia_cbvc ADD CONSTRAINT danh_gia_cbvc_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;
ALTER TABLE danh_gia_cbvc DROP CONSTRAINT IF EXISTS danh_gia_cbvc_nguoi_danh_gia_id_fkey;
ALTER TABLE danh_gia_cbvc ADD CONSTRAINT danh_gia_cbvc_nguoi_danh_gia_id_fkey FOREIGN KEY (nguoi_danh_gia_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE gio_nghien_cuu DROP CONSTRAINT IF EXISTS gio_nghien_cuu_nhan_su_id_fkey;
ALTER TABLE gio_nghien_cuu ADD CONSTRAINT gio_nghien_cuu_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE nghien_cuu_sinh DROP CONSTRAINT IF EXISTS nghien_cuu_sinh_nhan_su_id_fkey;
ALTER TABLE nghien_cuu_sinh ADD CONSTRAINT nghien_cuu_sinh_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE dang_vien DROP CONSTRAINT IF EXISTS dang_vien_nhan_su_id_fkey;
ALTER TABLE dang_vien ADD CONSTRAINT dang_vien_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE phat_trien_dang DROP CONSTRAINT IF EXISTS phat_trien_dang_nhan_su_id_fkey;
ALTER TABLE phat_trien_dang ADD CONSTRAINT phat_trien_dang_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;
ALTER TABLE phat_trien_dang DROP CONSTRAINT IF EXISTS phat_trien_dang_nguoi_theo_doi_id_fkey;
ALTER TABLE phat_trien_dang ADD CONSTRAINT phat_trien_dang_nguoi_theo_doi_id_fkey FOREIGN KEY (nguoi_theo_doi_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE diem_danh_sinh_hoat DROP CONSTRAINT IF EXISTS diem_danh_sinh_hoat_nhan_su_id_fkey;
ALTER TABLE diem_danh_sinh_hoat ADD CONSTRAINT diem_danh_sinh_hoat_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE thu_phi_doan_the DROP CONSTRAINT IF EXISTS thu_phi_doan_the_nhan_su_id_fkey;
ALTER TABLE thu_phi_doan_the ADD CONSTRAINT thu_phi_doan_the_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;
ALTER TABLE thu_phi_doan_the DROP CONSTRAINT IF EXISTS thu_phi_doan_the_nguoi_thu_id_fkey;
ALTER TABLE thu_phi_doan_the ADD CONSTRAINT thu_phi_doan_the_nguoi_thu_id_fkey FOREIGN KEY (nguoi_thu_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE khen_thuong_ky_luat DROP CONSTRAINT IF EXISTS khen_thuong_ky_luat_nhan_su_id_fkey;
ALTER TABLE khen_thuong_ky_luat ADD CONSTRAINT khen_thuong_ky_luat_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

ALTER TABLE thi_dua DROP CONSTRAINT IF EXISTS thi_dua_nhan_su_id_fkey;
ALTER TABLE thi_dua ADD CONSTRAINT thi_dua_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;

-- ═══ Bảng tham chiếu gián tiếp → SET NULL ═══
ALTER TABLE to_chuc_doan_the DROP CONSTRAINT IF EXISTS to_chuc_doan_the_nguoi_dung_dau_id_fkey;
ALTER TABLE to_chuc_doan_the ADD CONSTRAINT to_chuc_doan_the_nguoi_dung_dau_id_fkey FOREIGN KEY (nguoi_dung_dau_id) REFERENCES nhan_su(id) ON DELETE SET NULL;
ALTER TABLE to_chuc_doan_the DROP CONSTRAINT IF EXISTS to_chuc_doan_the_pho_id_fkey;
ALTER TABLE to_chuc_doan_the ADD CONSTRAINT to_chuc_doan_the_pho_id_fkey FOREIGN KEY (pho_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE sinh_hoat_dinh_ky DROP CONSTRAINT IF EXISTS sinh_hoat_dinh_ky_chu_tri_id_fkey;
ALTER TABLE sinh_hoat_dinh_ky ADD CONSTRAINT sinh_hoat_dinh_ky_chu_tri_id_fkey FOREIGN KEY (chu_tri_id) REFERENCES nhan_su(id) ON DELETE SET NULL;
ALTER TABLE sinh_hoat_dinh_ky DROP CONSTRAINT IF EXISTS sinh_hoat_dinh_ky_thu_ky_id_fkey;
ALTER TABLE sinh_hoat_dinh_ky ADD CONSTRAINT sinh_hoat_dinh_ky_thu_ky_id_fkey FOREIGN KEY (thu_ky_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE hop_dong DROP CONSTRAINT IF EXISTS hop_dong_nguoi_chap_thuan_dau_so_bo_id_fkey;
ALTER TABLE hop_dong ADD CONSTRAINT hop_dong_nguoi_chap_thuan_dau_so_bo_id_fkey FOREIGN KEY (nguoi_chap_thuan_dau_so_bo_id) REFERENCES nhan_su(id) ON DELETE SET NULL;
ALTER TABLE hop_dong DROP CONSTRAINT IF EXISTS hop_dong_pho_don_vi_quan_ly_id_fkey;
ALTER TABLE hop_dong ADD CONSTRAINT hop_dong_pho_don_vi_quan_ly_id_fkey FOREIGN KEY (pho_don_vi_quan_ly_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE dot_thanh_toan DROP CONSTRAINT IF EXISTS dot_thanh_toan_nguoi_xac_nhan_id_fkey;
ALTER TABLE dot_thanh_toan ADD CONSTRAINT dot_thanh_toan_nguoi_xac_nhan_id_fkey FOREIGN KEY (nguoi_xac_nhan_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE de_nghi_xuat_hoa_don DROP CONSTRAINT IF EXISTS de_nghi_xuat_hoa_don_nguoi_de_nghi_id_fkey;
ALTER TABLE de_nghi_xuat_hoa_don ADD CONSTRAINT de_nghi_xuat_hoa_don_nguoi_de_nghi_id_fkey FOREIGN KEY (nguoi_de_nghi_id) REFERENCES nhan_su(id) ON DELETE SET NULL;
ALTER TABLE de_nghi_xuat_hoa_don DROP CONSTRAINT IF EXISTS de_nghi_xuat_hoa_don_nguoi_ke_toan_dv_id_fkey;
ALTER TABLE de_nghi_xuat_hoa_don ADD CONSTRAINT de_nghi_xuat_hoa_don_nguoi_ke_toan_dv_id_fkey FOREIGN KEY (nguoi_ke_toan_dv_id) REFERENCES nhan_su(id) ON DELETE SET NULL;
ALTER TABLE de_nghi_xuat_hoa_don DROP CONSTRAINT IF EXISTS de_nghi_xuat_hoa_don_nguoi_tckt_id_fkey;
ALTER TABLE de_nghi_xuat_hoa_don ADD CONSTRAINT de_nghi_xuat_hoa_don_nguoi_tckt_id_fkey FOREIGN KEY (nguoi_tckt_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE to_phan_phoi DROP CONSTRAINT IF EXISTS to_phan_phoi_nguoi_lap_id_fkey;
ALTER TABLE to_phan_phoi ADD CONSTRAINT to_phan_phoi_nguoi_lap_id_fkey FOREIGN KEY (nguoi_lap_id) REFERENCES nhan_su(id) ON DELETE SET NULL;
ALTER TABLE to_phan_phoi DROP CONSTRAINT IF EXISTS to_phan_phoi_nguoi_duyet_id_fkey;
ALTER TABLE to_phan_phoi ADD CONSTRAINT to_phan_phoi_nguoi_duyet_id_fkey FOREIGN KEY (nguoi_duyet_id) REFERENCES nhan_su(id) ON DELETE SET NULL;

ALTER TABLE tam_ung DROP CONSTRAINT IF EXISTS tam_ung_nhan_su_id_fkey;
ALTER TABLE tam_ung ADD CONSTRAINT tam_ung_nhan_su_id_fkey FOREIGN KEY (nhan_su_id) REFERENCES nhan_su(id) ON DELETE CASCADE;
