# Kế hoạch xây dựng Phân quyền IBST ERP
> Áp dụng kỹ thuật đã chạy thực tế ở dự án `cic-erp-contract` (CIC-ERP) sang `cic-ibst`.
> Ngày lập: 09/09/2026 · Cập nhật: 09/09/2026 (đợt triển khai đầu)
>
> **Trạng thái:** Giai đoạn 1 ✅ · Giai đoạn 2 ✅ (route/menu + tab con 7 trang) · Giai đoạn 4 ✅ · Giai đoạn 3 🟡 (33/53 bảng, phạm vi có chủ ý — xem §13 tài liệu kỹ thuật).
> Chi tiết kỹ thuật đã cài và kiểm chứng: xem [phan-quyen-he-thong-ibst.md](phan-quyen-he-thong-ibst.md) §10, §13.

---

## 1. Hiện trạng hai dự án

### 1.1. `cic-erp-contract` đang có gì (nguồn tham khảo)

Mô hình **5 tầng** (theo `PHANQUYENHETHONG.md` §9):

| Tầng | Cơ chế | File / bảng |
|---|---|---|
| 1. Xác thực | Supabase Auth | `auth.users` |
| 2. Vai trò | 12 vai trò enum `user_role` | `profiles.role` |
| 3. Quyền chi tiết | Ma trận **tài nguyên × hành động** | bảng `user_permissions`, mặc định ở `role_permission_defaults` |
| 4. Phạm vi dữ liệu | Theo đơn vị + mở rộng liên đơn vị | `profiles.unit_id`, `cross_unit_visibility` |
| 5. Kiểm toán | Ghi mọi thay đổi | `audit_logs` |

Kỹ thuật đáng học, đã kiểm chứng trên production:

1. **Quyền nằm ở CSDL, không nằm ở code.** `role_permission_defaults` (khoá chính `role, resource`) là nguồn sự thật cho quyền mặc định; `DEFAULT_ROLE_PERMISSIONS` trong code chỉ là fallback lúc DB đang tải. Đổi quyền = sửa dữ liệu, không cần deploy.
2. **RLS đọc chính ma trận đó.** Hàm `can_manage_contracts(p_action)` (SECURITY DEFINER) tra `user_permissions` trước, rồi fallback `role_permission_defaults`; mọi policy `contracts_select/insert/update/delete` gọi hàm này. Giao diện và CSDL không thể lệch nhau vì cùng đọc một bảng.
3. **Deny-by-default ở tầng route.** `routes/routePermissions.ts` khai báo `pattern → resource + action`; `RouteGuard` chặn cả **route không khai báo** (`unregistered`), không chỉ route thiếu quyền. Sidebar dùng chung bảng ánh xạ (`NAV_RESOURCE_MAP`) nên **menu hiện ⇔ vào được bằng link**.
4. **Một hàm duy nhất trả lời "có phạm vi toàn công ty không".** `hasGlobalDataScope()` — sinh ra sau sự cố có **hai** định nghĩa song song (`isGlobalTopAdmin` vs `GLOBAL_VIEW_ROLES`) khiến Chủ tịch HĐQT thấy dropdown đơn vị một kiểu, danh sách hợp đồng một kiểu.
5. **Che số liệu là thật, không phải CSS.** Số lợi nhuận/dòng tiền **không có trong payload** RPC với nhóm không đủ quyền; lớp `blur` chỉ để hiển thị. Tổng toàn công ty lấy qua RPC `SECURITY DEFINER`, tuyệt đối không cộng ở trình duyệt.
6. **Bộ UI quản trị quyền đầy đủ**: `RoleDefaultsManager` (quyền mặc định theo vai trò), `PermissionManager` / `PermissionUserTab` (ghi đè theo từng người), `UnitPermissionManager`, `PermissionImpactPopover` (xem trước ảnh hưởng khi tick/bỏ tick), `PermissionAuditLog`.

### 1.2. `cic-ibst` đang có gì

Đã có (nền tốt, không phải làm lại):

- 9 vai trò trong `AuthContext.VaiTro` + cột `nguoi_dung.vai_tro`, bảng `nguoi_dung` gắn `auth.users ↔ nhan_su ↔ don_vi`.
- Hàm CSDL `fn_vai_tro()`, `fn_la_quan_tri()`, `fn_lanh_dao_tro_len()`, `fn_don_vi_hien_tai()`, `fn_phong_chuc_nang_cap_vien_tro_len()` (migration 0006, 0027).
- RLS **đã bật** trên các bảng nghiệp vụ chính, có phạm vi đơn vị (`don_vi_id = fn_don_vi_hien_tai()` hoặc là người chủ trì).
- Chốt chặn thẩm quyền theo Quy chế 2815 bằng **trigger** (`fn_kiem_soat_tham_quyen_hop_dong`, `fn_kiem_soat_ky_giao_viec`) — mạnh hơn RBAC thuần.
- Nhật ký `nhat_ky_du_lieu` + `src/services/auditLog.ts`.
- Ma trận thẩm quyền phía giao diện `src/lib/quyenHopDong.ts` (đã tự ghi chú "đây chỉ là lớp chặn giao diện").

Còn thiếu:

| Thiếu | Hậu quả hiện tại |
|---|---|
| Ma trận **tài nguyên × hành động** | Quyền chỉ có 9 mức cứng; muốn cho một người xem Tài chính mà không xem Nhân sự → không có cách nào ngoài sửa code |
| Bảng quyền theo người dùng | Không cấp/thu quyền lẻ được |
| RouteGuard | `src/App.tsx` chỉ có `RequireAuth`; **mọi tài khoản vào được mọi trang** bằng cách gõ URL |
| Lọc menu | `NAV_MENU` (8 mục, `AppLayout.tsx:70`) hiện đủ cho tất cả; chỉ `CaiDatPage.tsx:39` tự chặn `vaiTro !== 'quan-tri'` |
| Lọc tab trong trang | HopDongPage có 6 tab (`hop-dong-2815 / tai-chinh / crm-khach-hang / dau-thau / pvqlnn / bao-cao-khkt`), KhoaHocPage 4 tab, ThiNghiemPage 3 tab… — tất cả đều mở |
| Quyền xem liên đơn vị | Không có; Trưởng đơn vị A không thể được cấp quyền xem đơn vị B khi phối hợp |
| UI quản trị quyền | `CaiDatPage` chỉ đổi được vai trò + trạng thái tài khoản |
| Danh sách vai trò trong RLS bị **hard-code** | Mỗi lần đổi chính sách phải viết migration mới (đã có 0022, 0027, 0033… chỉ để nới vai trò) |

---

## 2. Nguyên tắc thiết kế cho IBST

1. **RBAC + phạm vi đơn vị**, giống CIC-ERP, nhưng giữ nguyên **trigger Quy chế 2815 làm lớp trên cùng**. RBAC trả lời "được vào màn hình nào, bấm nút nào"; trigger 2815 trả lời "bước ký/duyệt này ai được ký" — hai câu hỏi khác nhau, **không gộp**.
2. **Một quyền chỉ định nghĩa ở một nơi.** Quyền mặc định theo vai trò ⇒ bảng CSDL. Phạm vi toàn Viện ⇒ đúng một hàm ở code và một hàm ở CSDL, sửa cùng lúc.
3. **Deny-by-default.** Route/tab không khai báo ⇒ chặn.
4. **Giao diện chỉ là lớp mỡ.** Chốt chặn thật ở RLS. Mọi thứ ẩn ở UI phải có policy tương ứng, nếu không chỉ là trang trí.
5. **Số nhạy cảm bị cắt khỏi payload**, không dùng `blur` CSS.
6. **Migration idempotent, bật RLS cùng lúc tạo bảng**, kiểm chứng bằng truy vấn thật (`pg_policies`, `pg_proc`) — bài học migration 0012.

---

## 3. Từ điển tài nguyên & hành động (đề xuất)

Đặt mã theo nếp repo (tiếng Việt không dấu).

### 3.1. Hành động (`hanh_dong`)

`xem` · `them` · `sua` · `xoa` · `duyet` · `xuat`

> `duyet` tách riêng vì nghiệp vụ 2815 phân biệt rõ "nhập liệu" với "trình/phê duyệt".
> `xuat` (xuất Excel/PDF) tách riêng vì báo cáo tài chính in cột lợi nhuận.

### 3.2. Tài nguyên (`tai_nguyen`) — bám đúng menu và tab hiện có

| Nhóm menu | Mã tài nguyên | Màn hình |
|---|---|---|
| 1. Dashboard | `dashboard` · `dashboard_tai_chinh` | `DashboardPage` (5 tab); tách riêng chỉ số tài chính |
| 2. Hợp đồng, CRM & TC | `hop_dong` · `tai_chinh` · `khach_hang` · `dau_thau` · `pvqlnn` · `bao_cao_khkt` | 6 tab `HopDongPage` |
| 3. Khoa học & SHTT | `de_tai` · `tap_chi` · `so_huu_tri_tue` · `chuyen_giao` | 4 tab `KhoaHocPage` |
| 4. Tổ chức & Nhân sự | `nhan_su` · `don_vi` · `dang_doan_the` · `dao_tao` · `danh_gia` | `NhanSuPage` |
| 5. Thử nghiệm LIMS | `mau_thu` · `thiet_bi_las` · `dau_tu_cong` | 3 tab `ThiNghiemPage` |
| 6. e-Office | `van_ban` · `cong_viec` | `EOfficePage` |
| 7. Kho lưu trữ | `ho_so_tai_lieu` · `ai_rag` | `KhoLuuTruPage` |
| Khác | `lich_co_quan` · `cai_dat` · `phan_quyen` · `nhat_ky` | `LichCoQuanPage`, `CaiDatPage` |

≈ **25 tài nguyên × 6 hành động**. Đủ mịn để phân quyền theo tab, chưa đến mức không quản nổi.

> ⚠️ Bài học CIC-ERP: **không làm fallback tài nguyên con → tài nguyên cha** (kiểu `tai_chinh` thiếu thì tra `hop_dong`). Ở đó đã phải gỡ bỏ cơ chế này vì gây rò quyền im lặng. Mỗi tài nguyên khai báo độc lập.

---

## 4. Kế hoạch triển khai

### Giai đoạn 0 — Chốt ma trận nghiệp vụ *(tài liệu, chưa code)*

- Lập bảng **9 vai trò × 25 tài nguyên × 6 hành động** trong `docs/ma-tran-phan-quyen-ibst.md`.
- Căn cứ: Quy chế 2815 Điều 4 (RACI), Điều 6, 7, 9, 11 + `docs/quy-che-ibst-2815.md`.
- Điểm phải quyết trước khi code:
  - `phong-tckt` xem tài chính **toàn Viện** hay chỉ đơn vị? (CIC-ERP: kế toán xem toàn công ty)
  - `truong-don-vi` có được xem chỉ số lợi nhuận toàn Viện trên Dashboard không? (CIC-ERP: có, nhưng **cấp phó thì không** — phải soi chữ "Phó" trong chức danh)
  - `chuyen-vien` chỉ sửa hợp đồng mình chủ trì, hay cả hợp đồng cùng đơn vị?
- **Đầu ra:** một bảng đã được người dùng nghiệp vụ duyệt. Không bắt đầu Giai đoạn 1 khi bảng này còn treo.

### Giai đoạn 1 — Nền CSDL *(migration `0040_phan_quyen_ma_tran.sql`)*

Bảng mới (idempotent, bật RLS ngay trong cùng migration):

```
quyen_vai_tro_mac_dinh (vai_tro, tai_nguyen, hanh_dong text[], updated_at, updated_by)
    PK (vai_tro, tai_nguyen)          -- nguồn sự thật quyền mặc định
quyen_nguoi_dung       (user_id, tai_nguyen, hanh_dong text[], granted_by, updated_at)
    PK (user_id, tai_nguyen)          -- ghi đè cho từng người
quyen_xem_lien_don_vi  (nhan_su_id, don_vi_duoc_xem_id, granted_by, created_at)
    PK (nhan_su_id, don_vi_duoc_xem_id)  -- chỉ mở rộng quyền XEM
```

Hàm mới:

```sql
fn_co_quyen(p_tai_nguyen text, p_hanh_dong text) returns boolean   -- SECURITY DEFINER
  1. vai trò 'quan-tri' → true
  2. tra quyen_nguoi_dung theo auth.uid()  → nếu có bản ghi thì QUYẾT ĐỊNH luôn (kể cả mảng rỗng = thu quyền)
  3. fallback quyen_vai_tro_mac_dinh theo fn_vai_tro()
  4. còn lại → false

fn_don_vi_xem_duoc() returns bigint[]      -- đơn vị mình + quyen_xem_lien_don_vi
fn_pham_vi_toan_vien() returns boolean     -- BẢN SAO DUY NHẤT của hasGlobalDataScope() phía CSDL
```

- Seed `quyen_vai_tro_mac_dinh` từ ma trận Giai đoạn 0 bằng `insert … on conflict do nothing` (không ghi đè cấu hình admin đã sửa).
- RLS: mọi người đọc được `quyen_vai_tro_mac_dinh`; chỉ `quan-tri` ghi. `quyen_nguoi_dung` chỉ đọc được dòng của chính mình (hoặc `quan-tri`).
- **Chưa động vào policy bảng nghiệp vụ ở giai đoạn này** — tách rủi ro sang Giai đoạn 3.
- Kiểm chứng sau khi chạy: `select * from pg_proc where proname like 'fn_co_quyen%'`, `select * from pg_policies where tablename like 'quyen_%'`.

### Giai đoạn 2 — Tầng ứng dụng

| File | Nội dung |
|---|---|
| `src/lib/phanQuyen.ts` | `TAI_NGUYEN[]`, `HANH_DONG[]`, `NHAN_TAI_NGUYEN`, `QUYEN_MAC_DINH_FALLBACK`, `coPhamViToanVien(profile)` — **bản sao duy nhất** của `fn_pham_vi_toan_vien()`, ghi chú chéo hai chiều |
| `src/hooks/usePhanQuyen.ts` | Nạp `quyen_nguoi_dung` + `quyen_vai_tro_mac_dinh` qua `useAsyncData`; trả `can(taiNguyen, hanhDong)`, `donViXemDuoc`, `dangTai` |
| `src/routes/quyenTruyCap.ts` | `ROUTE_PERMISSION_MAP` + `PUBLIC_ROUTES` + `getRoutePermission()` (bê nguyên kỹ thuật `patternToRegex` của CIC-ERP) |
| `src/components/RouteGuard.tsx` | Bọc `<AppLayout/>` trong `App.tsx`; deny-by-default; màn hình "Truy cập bị từ chối" 3 theme |
| `src/layouts/AppLayout.tsx` | Lọc `NAV_MENU` bằng **chính** `ROUTE_PERMISSION_MAP` |
| Các trang có tab | Lọc mảng tab theo `can(...)`; tab đầu tiên còn quyền làm mặc định |

⚠️ **Không bê `isLocalhost` bypass của `RouteGuard.tsx:42`.** Ở CIC-ERP dòng đó cho phép bỏ qua toàn bộ kiểm tra quyền khi chạy localhost — tiện lúc dev nhưng khiến không ai test được phân quyền thật trên máy. IBST đã có `VITE_SKIP_AUTH` cho việc đó; nếu cần, làm cờ **riêng** `VITE_SKIP_PERM=true`, mặc định tắt.

⚠️ `useAsyncData` trả `data = fallback` khi đang nạp. `can()` phải trả **`false` + `dangTai = true`** trong lúc chưa nạp xong, và RouteGuard hiện spinner thay vì chặn — nếu không sẽ đá người dùng ra khỏi trang hợp lệ ngay lúc load.

### Giai đoạn 3 — Siết RLS theo ma trận *(migration `0041`…, làm từng bảng)*

Thay danh sách vai trò hard-code trong policy bằng `fn_co_quyen(...)`. Ví dụ `hop_dong`:

```sql
drop policy if exists "hd_doc_theo_don_vi" on hop_dong;
create policy "hd_doc_theo_don_vi" on hop_dong for select to authenticated using (
  fn_co_quyen('hop_dong','xem') and (
    fn_pham_vi_toan_vien()
    or don_vi_id = any(fn_don_vi_xem_duoc())
    or chu_tri_id in (select ns.id from nhan_su ns
                      join nguoi_dung nd on nd.nhan_su_id = ns.id
                      where nd.user_id = auth.uid())
  )
);
```

Thứ tự làm, mỗi bước một migration + kiểm chứng riêng:

1. `hop_dong` và các bảng con (`phieu_giao_viec`, `dot_thanh_toan`, `hop_dong_thuong_phat`, `kiem_tra_noi_bo`, `quyet_toan_giai_doan`, `hop_dong_tep_dinh_kem`, `lien_danh`, `luu_tru_ho_so`)
2. `nhan_su`, `dang_doan_the` (dữ liệu nhạy cảm nhất)
3. `dau_thau`, `dang_ky_dau_moi`, `khach_hang`
4. `de_tai`, `tap_chi`, `mau_thi_nghiem`, `van_ban`, phần còn lại

**Giữ nguyên toàn bộ trigger 2815** — RBAC không thay thế `fn_kiem_soat_tham_quyen_hop_dong` / `fn_kiem_soat_ky_giao_viec`.

⚠️ Chạy SQL qua Supabase Management API thì `fn_vai_tro()` trả `chuyen-vien` (không có `auth.uid()`) nên **không cô lập được từng quy tắc RLS bằng SQL**. Mọi bước ở giai đoạn này phải kiểm chứng end-to-end trên trình duyệt bằng dropdown quick-login 23 tài khoản (đã có từ commit `8e84146`).

### Giai đoạn 4 — UI quản trị phân quyền

Thêm vào `CaiDatPage` (giữ 3 tab hiện có, thêm 2):

- **Tab "Quyền theo vai trò"** — lưới 9 vai trò × 25 tài nguyên, ô tick 6 hành động; ghi vào `quyen_vai_tro_mac_dinh`. Có nút "Khôi phục mặc định 2815".
- **Tab "Quyền theo người dùng"** — chọn người → thấy quyền hiệu lực (kèm nhãn *kế thừa vai trò* / *đã ghi đè*), sửa → ghi `quyen_nguoi_dung`. Kèm khối "Quyền xem liên đơn vị".
- Mọi thao tác dùng **slide panel** (`useSlidePanelForm` / `useSlidePanelChiTiet`, mỗi panel một `storageKey`), không dùng Modal, không `window.prompt`.
- Ghi nhật ký thay đổi quyền vào `nhat_ky_du_lieu` qua `auditLog.ts`.

Chưa làm ở vòng này (CIC-ERP có, IBST chưa cần): `PermissionImpactPopover` (xem trước ảnh hưởng, file 63KB), đóng vai (impersonation), 4 mức truy cập CRM `full/view/shadow/hidden`.

### Giai đoạn 5 — Kiểm thử & bàn giao

1. `npx tsc -b --noEmit` sạch, `npm run build` sạch.
2. Kiểm thử **9 vai trò × 8 menu × 3 theme** (`nature` / `light` / `dark`) trên trình duyệt với dữ liệu thật.
3. Kiểm tra chéo bắt buộc: menu ẩn ⇒ gõ thẳng URL cũng phải bị chặn; tab ẩn ⇒ `?tab=` cũng phải bị chặn.
4. Kiểm tra rò dữ liệu: mở F12 → Network, xác nhận payload **không chứa** trường tài chính với vai trò không đủ quyền.
5. Dọn sạch tài khoản/dữ liệu test đã tạo.
6. Cập nhật `docs/ma-tran-phan-quyen-ibst.md` theo đúng thực tế đã cài, không theo dự định.

---

## 5. Ước lượng & thứ tự ưu tiên

| GĐ | Nội dung | Khối lượng | Trạng thái |
|---|---|---|---|
| 0 | Chốt ma trận nghiệp vụ | ~0,5 ngày + chờ duyệt | ❌ **Bỏ qua** — ma trận đã seed thẳng theo rà soát của người viết, chưa có xác nhận nghiệp vụ chính thức. Rủi ro chấp nhận được vì chỉ ảnh hưởng route/menu (Giai đoạn 3 chưa chạy nên chưa đụng dữ liệu thật) |
| 1 | Migration nền (3 bảng + 3 hàm) | ~0,5 ngày | ✅ Xong — migration 0040, kiểm chứng bằng SQL |
| 2 | Tầng ứng dụng (lib, hook, RouteGuard, lọc menu/tab) | ~1,5 ngày | ✅ Xong — route + menu kiểm chứng trên trình duyệt; lọc tab con 7 trang kiểm chứng bằng `tsc`/`build` (chưa quét đủ 9 vai trò trên trình duyệt) |
| 3 | Siết RLS theo ma trận | ~2 ngày | 🟡 33/53 bảng — 13 bảng siết đủ 4 lệnh, 20 bảng chỉ siết xem (lý do cụ thể, không phải bỏ sót — xem §13). Phát hiện + vá thêm 1 bug nghiêm trọng (RLS chặn UPDATE không báo lỗi) |
| 4 | UI quản trị quyền | ~1,5 ngày | ✅ Xong — 2 tab mới ở Cài đặt, kiểm chứng đầy đủ (tạo/khôi phục ghi đè, cấp/xóa liên đơn vị, nhật ký) |
| 5 | Kiểm thử end-to-end | ~1 ngày | 🟡 Đã kiểm thử `tsc`/`build` + 2 tài khoản thật trên trình duyệt (`phong-khkt`, `quan-tri`); **chưa quét đủ 9 vai trò × 3 theme** |

**Đề xuất thứ tự thực thi:** 0 → 1 → 2 → 4 → 3 → 5.
Đưa Giai đoạn 4 (UI quản trị) lên **trước** Giai đoạn 3 (siết RLS) để khi bắt đầu siết chốt chặn CSDL đã có sẵn công cụ cấp/thu quyền — tránh cảnh siết nhầm rồi phải viết migration để gỡ.

---

## 6. Rủi ro đã biết & cách phòng

| Rủi ro | Nguồn | Phòng ngừa |
|---|---|---|
| Hai định nghĩa "phạm vi toàn Viện" chạy song song, lệch nhau tuỳ màn hình | Sự cố có thật ở CIC-ERP (Chủ tịch HĐQT thấy hai phạm vi khác nhau) | Đúng **một** hàm mỗi tầng: `coPhamViToanVien()` và `fn_pham_vi_toan_vien()`, ghi chú chéo "sửa cùng nhau" |
| Siết RLS làm người dùng thật mất quyền đang có | Migration 0022, 0027 đã phải nới lại nhiều lần | Làm từng bảng; trước mỗi bước đếm số bản ghi mỗi vai trò đọc được, so sánh trước/sau |
| Che số liệu bằng CSS ⇒ F12 moi ra được | Chuẩn "Che mờ Ngụy trang Chống F12" của CIC-ERP | Cắt trường khỏi payload/RPC; `blur` chỉ để hiển thị |
| RouteGuard chặn nhầm lúc đang nạp quyền | `useAsyncData` trả fallback khi loading | Chờ `dangTai === false` mới quyết định chặn |
| Không kiểm chứng được RLS bằng SQL | `fn_vai_tro()` trả `chuyen-vien` qua Management API | Bắt buộc kiểm thử trình duyệt với 23 tài khoản quick-login |
| RBAC lấn sân trigger 2815 | — | RBAC gác **màn hình/nút**; trigger gác **bước ký duyệt**. Không xoá trigger nào |
| Viền/nền tối tiệp màu trong bảng ma trận quyền (lưới dày đặc) | Quy định Dark Mode của dự án | `dark:border-slate-700/80`, `thead tr` `dark:bg-slate-900/60`, `tbody` `dark:divide-slate-700/80` |

---

## 7. Việc cần người dùng quyết trước khi bắt đầu

1. **Duyệt ma trận Giai đoạn 0** — ai xem được gì, đặc biệt: tài chính toàn Viện, hồ sơ nhân sự, dữ liệu Đảng – Đoàn thể.
2. **Độ mịn tài nguyên**: chốt ở mức tab (~25 tài nguyên như đề xuất) hay gom về mức menu (~8 tài nguyên, đơn giản hơn nhưng không tách được Tài chính khỏi Hợp đồng).
3. **Thứ tự thực thi**: theo đề xuất `0 → 1 → 2 → 4 → 3 → 5`, hay siết RLS sớm hơn.
