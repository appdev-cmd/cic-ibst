# Kế hoạch hoàn thiện Phân hệ 5 — Quản lý Nhân sự, Đào tạo & Đảng - Đoàn thể

> Dự án: **IBST ERP** (`cic-ibst`) — Viện Khoa học công nghệ xây dựng, Bộ Xây dựng
> Tham chiếu kỹ thuật: module Nhân sự & Đơn vị của dự án **CIC ERP Contract** (`D:\01_Projects\cic-erp-contract`)
> Ngày lập: 07/09/2026

---

## 1. Hiện trạng (audit code)

### 1.1. Những gì đã chạy thật trên CSDL

| Hạng mục | File | Bảng CSDL | Đánh giá |
|---|---|---|---|
| Cơ cấu tổ chức, sơ đồ cây, CRUD đơn vị | `src/pages/DonViPage.tsx`, `src/components/OrgChartTree.tsx` | `don_vi` | **Đạt** — có cây phân cấp, 2 chế độ xem (cây/danh sách), KPI, panel chi tiết |
| Danh sách + CRUD nhân sự | `src/pages/NhanSuPage.tsx` | `nhan_su` | **Sơ khai** — form chỉ 7 trường, không có hồ sơ chi tiết |
| Chứng chỉ hành nghề | `src/components/DetailPanels.tsx` (`ChungChiPanel`) | `chung_chi_hanh_nghe` | **Đạt cơ bản** — CRUD inline, cảnh báo hạn 90 ngày |
| Lớp đào tạo / tập huấn | `src/pages/DaoTaoPage.tsx` | `lop_dao_tao` | **Đạt cơ bản** |
| Phân quyền vai trò | `supabase/migrations/0006_phan_quyen_vai_tro.sql` | `nguoi_dung`, `fn_vai_tro()` | **Đạt** — nền tảng RLS đã có |

### 1.2. Những gì đang là dữ liệu giả (mock) — phải thay thế

| Vị trí | Nội dung mock | Ghi chú |
|---|---|---|
| `src/pages/NhanSuPage.tsx:63` | `MOCK_DANG_DOAN` — 4 dòng đảng viên/đoàn viên hardcode | Toàn bộ tab **Đảng - Đoàn thể** là giao diện tĩnh |
| `src/pages/NhanSuPage.tsx:229-241` | 3 thẻ KPI "142 Đảng viên / 98 Đoàn viên / 100% Đảng phí" | Số cứng trong JSX |
| `src/pages/DaoTaoPage.tsx:37` | `INITIAL_NCS` — 4 nghiên cứu sinh trong `useState` | Mất dữ liệu khi tải lại trang |

### 1.3. Khoảng trống so với PH6/PH7 trong kế hoạch tổng thể

`ke-hoach-phat-trien-phan-mem-quan-tri-IBST.md` (mục PH6) yêu cầu **ngạch/bậc, học hàm học vị, quá trình công tác, chấm công, nghỉ phép, lương vị trí việc làm, kê khai giờ NCKH, đánh giá xếp loại hằng năm**. Hiện chưa có bảng nào trong số đó. Bảng `nhan_su` mới có:

```
ma_dinh_danh, so_dinh_danh_ca_nhan, ho_va_ten, ngay_sinh, gioi_tinh,
hoc_vi, chuc_danh, don_vi_id, email, so_dien_thoai, trang_thai,
ngay_vao_lam, ngach
```

Không có bảng nào liên quan Đảng - Đoàn thể (tìm `dang_vien|chi_bo|dang_phi|cong_doan` trong `supabase/migrations/` → 0 kết quả).

---

## 2. Những gì kế thừa được từ `cic-erp-contract`

Dự án tham chiếu đã có module HRM tương đối đầy đủ. Bảng đối chiếu để **port pattern, không copy code** (khác stack: `cic-erp-contract` dùng bảng `employees/units` tiếng Anh + service class; `cic-ibst` dùng bảng tiếng Việt + hàm service thuần trên Supabase):

| Ở `cic-erp-contract` | Mang sang `cic-ibst` thành | Mức độ |
|---|---|---|
| `components/PersonnelDetail.tsx` — 10 tab (Tổng quan / Hoạt động / HĐ Lao động / Lương / Tài sản / Hồ sơ / Lịch sử) | `src/components/NhanSuChiTietPanel.tsx` — panel tab hồ sơ CBVC | **Port cấu trúc tab** |
| `services/coreHrService.ts` → `employee_contracts`, `employee_salary_history`, `employee_qualifications`, `employee_assets` | `hop_dong_lao_dong`, `luong_ngach_bac`, `bang_cap` (tài sản để sang phân hệ tài chính) | **Port mô hình dữ liệu** |
| `services/employeeTimelineService.ts` → `employee_timeline` (promotion/reward/discipline/salary_change) | `qua_trinh_cong_tac` — mở rộng loại theo Luật Viên chức | **Port + mở rộng** |
| `components/ImportEmployeeModal.tsx` | `src/components/ImportCbvcModal.tsx` — nhập Excel danh sách CBVC | **Port** |
| `components/OrganizationChart.tsx`, `UnitDetail.tsx` (tab Tổng quan/Nhân sự/Hợp đồng/Lịch sử) | Nâng cấp `OrgChartTree.tsx` + bổ sung tab cho panel chi tiết đơn vị hiện có | **Đối chiếu, bổ sung** |
| `services/leaveService.ts`, `payrollService.ts`, `performanceService.ts` | Tham khảo khi làm chấm công/nghỉ phép/đánh giá ở GĐ2 | **Tham khảo** |
| *Không có* | **Toàn bộ nghiệp vụ Đảng - Đoàn thể** | **Làm mới 100%** |

> Lưu ý quan trọng: `cic-erp-contract` là mô hình doanh nghiệp (KPI doanh thu, tuyển dụng, payroll). IBST là **đơn vị sự nghiệp công lập** — hồ sơ theo mẫu **2C-BNV/2008**, ngạch/bậc theo NĐ 204/2004 và văn bản sửa đổi, đánh giá xếp loại theo **NĐ 90/2020**. Không bê nguyên schema doanh nghiệp sang.

---

## 3. Thiết kế CSDL bổ sung

Đánh số migration tiếp theo `0027` (migration cuối hiện có).

### 3.1. `0028_ho_so_cbvc_mo_rong.sql` — Hồ sơ CBVC đầy đủ

**Mở rộng `nhan_su`:**

```sql
alter table nhan_su
  add column anh_dai_dien        varchar(500),
  add column que_quan            varchar(255),
  add column dia_chi_thuong_tru  varchar(255),
  add column dia_chi_hien_nay    varchar(255),
  add column dan_toc             varchar(50),
  add column ton_giao            varchar(50),
  add column ngay_cap_cccd       date,
  add column noi_cap_cccd        varchar(150),
  add column tinh_trang_hon_nhan varchar(20),
  add column so_bhxh             varchar(20),
  add column ma_so_thue          varchar(20),
  add column so_tai_khoan        varchar(30),
  add column ngan_hang           varchar(150),
  add column lien_he_khan_cap    varchar(150),
  add column sdt_khan_cap        varchar(30),
  add column hoc_ham             varchar(50),    -- GS / PGS
  add column chuyen_nganh        varchar(150),
  add column ly_luan_chinh_tri   varchar(30),    -- so-cap/trung-cap/cao-cap/cu-nhan
  add column quan_ly_nha_nuoc    varchar(50),    -- chuyên viên / CVC / CVCC
  add column bac_luong           varchar(10),
  add column he_so_luong         numeric(5,2),
  add column phu_cap_chuc_vu     numeric(5,2),
  add column ngay_huong_luong    date,
  add column ngay_nghi_viec      date,
  add column nguoi_quan_ly_id    bigint references nhan_su(id);
```

**Bảng mới:**

```sql
-- Quá trình công tác / diễn biến nhân sự (mô hình từ employee_timeline)
create table qua_trinh_cong_tac (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  loai           varchar(30) not null,  -- tuyen-dung/dieu-dong/bo-nhiem/mien-nhiem/
                                        -- nang-luong/nang-ngach/biet-phai/nghi-huu/thoi-viec
  tieu_de        varchar(255) not null,
  so_quyet_dinh  varchar(100),
  ngay_ky        date,
  ngay_hieu_luc  date not null,
  ngay_ket_thuc  date,
  don_vi_id      bigint references don_vi(id),
  chuc_vu        varchar(150),
  mo_ta          text,
  tep_dinh_kem   varchar(500),
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now()
);

-- Bằng cấp / chứng chỉ ngoài chứng chỉ hành nghề xây dựng
create table bang_cap (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  loai           varchar(30) not null,  -- bang-cap/ly-luan-chinh-tri/quan-ly-nha-nuoc/
                                        -- ngoai-ngu/tin-hoc/an-toan-lao-dong/khac
  ten            varchar(255) not null,
  chuyen_nganh   varchar(150),
  co_so_dao_tao  varchar(255),
  xep_loai       varchar(50),
  nam_tot_nghiep smallint,
  ngay_cap       date,
  ngay_het_han   date,
  tep_dinh_kem   varchar(500),
  created_at     timestamptz not null default now()
);
```

### 3.2. `0029_hop_dong_lao_dong_luong_danh_gia.sql`

```sql
create table hop_dong_lao_dong (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  so_hop_dong    varchar(100),
  loai_hop_dong  varchar(30) not null,  -- thu-viec/xac-dinh-thoi-han/khong-xac-dinh/
                                        -- vien-chuc-tap-su/vien-chuc/khoan-viec
  ngay_ky        date,
  tu_ngay        date not null,
  den_ngay       date,
  luong_co_ban   numeric(15,2),
  luong_bhxh     numeric(15,2),
  trang_thai     varchar(20) not null default 'hieu-luc',  -- hieu-luc/het-han/cham-dut
  tep_dinh_kem   varchar(500),
  ghi_chu        varchar(500),
  created_at     timestamptz not null default now()
);

create table luong_ngach_bac (
  id              bigint generated always as identity primary key,
  nhan_su_id      bigint not null references nhan_su(id) on delete cascade,
  ngay_hieu_luc   date not null,
  ngach           varchar(100),
  ma_ngach        varchar(20),
  bac             varchar(10),
  he_so_luong     numeric(5,2) not null,
  phu_cap_chuc_vu numeric(5,2) default 0,
  phu_cap_tnvk    numeric(5,2) default 0,   -- thâm niên vượt khung (%)
  loai_thay_doi   varchar(30) not null,     -- xep-lan-dau/nang-bac-thuong-xuyen/
                                            -- nang-bac-truoc-han/nang-ngach/dieu-chinh
  so_quyet_dinh   varchar(100),
  ly_do           varchar(500),
  created_at      timestamptz not null default now()
);

-- Đánh giá, xếp loại CBVC (NĐ 90/2020)
create table danh_gia_cbvc (
  id                bigint generated always as identity primary key,
  nhan_su_id        bigint not null references nhan_su(id) on delete cascade,
  nam               smallint not null,
  ky                varchar(10) not null default 'nam',  -- quy-1..quy-4 / nam
  tu_xep_loai       varchar(20),
  xep_loai          varchar(20),  -- htxsnv/httnv/htnv/khtnv
  diem              numeric(5,2),
  nguoi_danh_gia_id bigint references nhan_su(id),
  nhan_xet          text,
  trang_thai        varchar(20) not null default 'nhap',  -- nhap/cho-duyet/da-duyet
  created_at        timestamptz not null default now(),
  unique (nhan_su_id, nam, ky)
);

-- Kê khai giờ nghiên cứu khoa học (liên kết PH2 đề tài)
create table gio_nghien_cuu (
  id             bigint generated always as identity primary key,
  nhan_su_id     bigint not null references nhan_su(id) on delete cascade,
  nam            smallint not null,
  de_tai_id      bigint references de_tai(id),
  loai_hoat_dong varchar(50) not null,  -- de-tai/bai-bao/tieu-chuan/huong-dan-ncs/hoi-thao
  noi_dung       varchar(500),
  so_gio         numeric(7,2) not null,
  trang_thai     varchar(20) not null default 'nhap',
  created_at     timestamptz not null default now()
);
```

### 3.3. `0030_dang_doan_the_co_cau.sql` — **Trọng tâm mới**

```sql
-- Cây tổ chức Đảng / Đoàn thể (song song với cây don_vi chính quyền)
create table to_chuc_doan_the (
  id                bigint generated always as identity primary key,
  loai              varchar(20) not null,  -- dang/doan-tn/cong-doan/ccb/nu-cong
  cap               varchar(30) not null,  -- dang-bo/chi-bo/to-dang |
                                           -- doan-co-so/chi-doan |
                                           -- cd-co-so/to-cong-doan
  ten               varchar(255) not null,
  ma                varchar(50) unique,
  to_chuc_cha_id    bigint references to_chuc_doan_the(id),
  don_vi_id         bigint references don_vi(id),   -- gắn với đơn vị chính quyền
  nguoi_dung_dau_id bigint references nhan_su(id),  -- bí thư / chủ tịch
  pho_id            bigint references nhan_su(id),
  ngay_thanh_lap    date,
  nhiem_ky          varchar(20),                    -- '2025-2030'
  trang_thai        varchar(20) not null default 'hoat-dong',
  thu_tu            smallint not null default 0,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

-- Hồ sơ đảng viên
create table dang_vien (
  id                       bigint generated always as identity primary key,
  nhan_su_id               bigint not null unique references nhan_su(id) on delete cascade,
  to_chuc_id               bigint not null references to_chuc_doan_the(id),
  so_the_dang              varchar(30),
  ngay_vao_dang_du_bi      date not null,
  ngay_vao_dang_chinh_thuc date,
  noi_ket_nap              varchar(255),
  nguoi_gioi_thieu_1       varchar(150),
  nguoi_gioi_thieu_2       varchar(150),
  chuc_vu_dang             varchar(150),  -- bí thư/phó bí thư/chi ủy viên/đảng viên
  trinh_do_ly_luan         varchar(30),
  ngay_chuyen_den          date,
  ngay_chuyen_di           date,
  noi_chuyen_den_di        varchar(255),
  trang_thai               varchar(30) not null default 'dang-sinh-hoat',
                           -- dang-sinh-hoat/mien-sinh-hoat/chuyen-di/
                           -- khai-tru/xoa-ten/tu-tran
  ghi_chu                  varchar(500),
  created_at               timestamptz not null default now(),
  updated_at               timestamptz not null default now()
);

-- Đoàn viên TN / công đoàn viên / hội viên CCB
create table doan_vien_hoi_vien (
  id           bigint generated always as identity primary key,
  nhan_su_id   bigint not null references nhan_su(id) on delete cascade,
  to_chuc_id   bigint not null references to_chuc_doan_the(id),
  loai         varchar(20) not null,   -- doan-tn/cong-doan/ccb/nu-cong
  so_the       varchar(30),
  ngay_ket_nap date,
  chuc_vu      varchar(150),
  trang_thai   varchar(20) not null default 'dang-sinh-hoat',
  created_at   timestamptz not null default now(),
  unique (nhan_su_id, loai)
);

-- Quy trình phát triển đảng viên (workflow 8 bước)
create table phat_trien_dang (
  id                   bigint generated always as identity primary key,
  nhan_su_id           bigint not null references nhan_su(id) on delete cascade,
  to_chuc_id           bigint not null references to_chuc_doan_the(id),
  buoc_hien_tai        varchar(30) not null default 'quan-chung-uu-tu',
                       -- quan-chung-uu-tu/hoc-lop-nhan-thuc/tham-tra-ly-lich/
                       -- chi-bo-de-nghi/dang-uy-xet/ket-nap-du-bi/
                       -- hoc-lop-dang-vien-moi/chuyen-chinh-thuc
  ngay_bat_dau         date,
  ngay_du_kien_ket_nap date,
  nguoi_theo_doi_id    bigint references nhan_su(id),
  ghi_chu              text,
  trang_thai           varchar(20) not null default 'dang-thuc-hien',
  created_at           timestamptz not null default now()
);

create table phat_trien_dang_buoc (
  id              bigint generated always as identity primary key,
  phat_trien_id   bigint not null references phat_trien_dang(id) on delete cascade,
  buoc            varchar(30) not null,
  ngay_hoan_thanh date,
  so_van_ban      varchar(100),
  tep_dinh_kem    varchar(500),
  ghi_chu         varchar(500),
  created_at      timestamptz not null default now()
);
```

### 3.4. `0031_sinh_hoat_dang_phi_thi_dua.sql`

```sql
-- Kỳ sinh hoạt chi bộ / họp công đoàn - đoàn TN
create table sinh_hoat_dinh_ky (
  id           bigint generated always as identity primary key,
  to_chuc_id   bigint not null references to_chuc_doan_the(id),
  ky           varchar(20) not null,     -- '2026-09'
  ngay_hop     date not null,
  dia_diem     varchar(255),
  chu_tri_id   bigint references nhan_su(id),
  thu_ky_id    bigint references nhan_su(id),
  chuyen_de    varchar(255),
  noi_dung     text,
  nghi_quyet   text,
  so_bien_ban  varchar(100),
  tep_bien_ban varchar(500),
  trang_thai   varchar(20) not null default 'du-kien',  -- du-kien/da-hop/da-duyet-bb
  created_at   timestamptz not null default now()
);

create table diem_danh_sinh_hoat (
  id           bigint generated always as identity primary key,
  sinh_hoat_id bigint not null references sinh_hoat_dinh_ky(id) on delete cascade,
  nhan_su_id   bigint not null references nhan_su(id),
  co_mat       varchar(20) not null default 'co-mat',  -- co-mat/vang-co-phep/vang-khong-phep
  ly_do        varchar(255),
  unique (sinh_hoat_id, nhan_su_id)
);

-- Thu đảng phí / đoàn phí / công đoàn phí
create table thu_phi_doan_the (
  id               bigint generated always as identity primary key,
  nhan_su_id       bigint not null references nhan_su(id) on delete cascade,
  to_chuc_id       bigint not null references to_chuc_doan_the(id),
  loai_phi         varchar(20) not null,   -- dang-phi/doan-phi/cong-doan-phi
  ky               varchar(20) not null,   -- '2026-09' hoặc '2026-Q3'
  muc_dong         numeric(12,2) not null, -- theo % thu nhập, QĐ 342-QĐ/TW
  so_tien_phai_nop numeric(12,2) not null,
  so_tien_da_nop   numeric(12,2) not null default 0,
  ngay_nop         date,
  hinh_thuc        varchar(20),            -- tien-mat/chuyen-khoan/tru-luong
  nguoi_thu_id     bigint references nhan_su(id),
  trang_thai       varchar(20) not null default 'chua-nop',  -- chua-nop/da-nop/mien
  created_at       timestamptz not null default now(),
  unique (nhan_su_id, loai_phi, ky)
);

-- Khen thưởng - kỷ luật (dùng chung chính quyền + Đảng + đoàn thể)
create table khen_thuong_ky_luat (
  id              bigint generated always as identity primary key,
  doi_tuong       varchar(20) not null default 'ca-nhan',  -- ca-nhan/tap-the
  nhan_su_id      bigint references nhan_su(id) on delete cascade,
  don_vi_id       bigint references don_vi(id),
  to_chuc_id      bigint references to_chuc_doan_the(id),
  pham_vi         varchar(20) not null,   -- chinh-quyen/dang/cong-doan/doan-tn
  loai            varchar(20) not null,   -- khen-thuong/ky-luat
  hinh_thuc       varchar(150) not null,  -- CSTĐ cơ sở / Bằng khen BXD / khiển trách...
  cap_quyet_dinh  varchar(30),            -- co-so/bo-nganh/nha-nuoc
  so_quyet_dinh   varchar(100),
  ngay_quyet_dinh date,
  nam             smallint,
  ly_do           text,
  tep_dinh_kem    varchar(500),
  created_at      timestamptz not null default now(),
  check (nhan_su_id is not null or don_vi_id is not null)
);

-- Đăng ký thi đua đầu năm & bình xét cuối năm
create table thi_dua (
  id                bigint generated always as identity primary key,
  doi_tuong         varchar(20) not null default 'ca-nhan',
  nhan_su_id        bigint references nhan_su(id) on delete cascade,
  don_vi_id         bigint references don_vi(id),
  nam               smallint not null,
  danh_hieu_dang_ky varchar(150),
  danh_hieu_dat     varchar(150),
  trang_thai        varchar(20) not null default 'da-dang-ky',
                    -- da-dang-ky/don-vi-binh-xet/hoi-dong-vien-duyet/da-cong-nhan
  created_at        timestamptz not null default now()
);
```

### 3.5. `0032_rls_nhan_su_dang.sql` — Phân quyền

Dữ liệu Đảng và dữ liệu cá nhân là **dữ liệu nhạy cảm**, không được để mọi tài khoản `authenticated` đọc như các bảng nghiệp vụ khác.

Bổ sung 2 vai trò vào `dm_danh_muc` nhóm `vai_tro`:

- `can-bo-to-chuc` — chuyên viên Phòng Tổ chức hành chính (toàn quyền hồ sơ CBVC)
- `van-phong-dang-uy` — toàn quyền dữ liệu Đảng - Đoàn thể

Hàm tiện ích mới, cùng khuôn với `fn_vai_tro()` / `fn_la_quan_tri()` sẵn có ở `0006`:

```sql
fn_la_can_bo_to_chuc() returns boolean
fn_la_vp_dang_uy()     returns boolean
fn_nhan_su_id_hien_tai() returns bigint
fn_la_bi_thu_chi_bo(p_to_chuc_id bigint) returns boolean
```

Ma trận quyền:

| Nhóm bảng | Đọc | Ghi |
|---|---|---|
| `nhan_su` (trường cơ bản) | mọi `authenticated` | `quan-tri`, `can-bo-to-chuc` |
| Trường nhạy cảm (`so_dinh_danh_ca_nhan`, `so_bhxh`, `so_tai_khoan`, hệ số lương) | chính chủ + `quan-tri` + `can-bo-to-chuc` + `lanh-dao` | `quan-tri`, `can-bo-to-chuc` |
| `hop_dong_lao_dong`, `luong_ngach_bac` | chính chủ + TCHC + lãnh đạo | `quan-tri`, `can-bo-to-chuc` |
| `danh_gia_cbvc` | chính chủ + trưởng đơn vị + TCHC | trưởng đơn vị (tạo), TCHC (duyệt) |
| `dang_vien`, `phat_trien_dang`, `sinh_hoat_dinh_ky`, `thu_phi_doan_the` | chính chủ + `van-phong-dang-uy` + bí thư chi bộ của tổ chức đó + `quan-tri` | `van-phong-dang-uy`, bí thư chi bộ (giới hạn chi bộ mình) |
| `to_chuc_doan_the` (cây tổ chức) | mọi `authenticated` | `van-phong-dang-uy`, `quan-tri` |
| `khen_thuong_ky_luat` phạm vi `dang` | như `dang_vien` | như `dang_vien` |

Ngoài ra:

- Tách trường nhạy cảm bằng view `v_nhan_su_cong_khai` để các màn hình khác (chọn người ký, phân công đề tài, giao việc...) không truy vấn bảng gốc.
- Ghi `nhat_ky_du_lieu` (bảng audit đã có từ `0001`) cho mọi thao tác ghi trên nhóm bảng Đảng.

---

## 4. Kiến trúc frontend

### 4.1. Tách route — thôi gộp 4 tab vào một trang

Hiện `NhanSuPage.tsx` (523 dòng) bọc cả `DonViPage`, `DaoTaoPage` và tab Đảng mock trong một component. Tách lại:

| Route | Trang | Nội dung |
|---|---|---|
| `/don-vi` | `DonViPage` (giữ) | Sơ đồ tổ chức chính quyền + chi tiết đơn vị (bổ sung tab) |
| `/nhan-su` | `NhanSuPage` (viết lại) | Danh sách CBVC + panel hồ sơ chi tiết |
| `/dang-doan-the` | `DangDoanThePage` (**mới**) | Cây tổ chức Đảng/Đoàn thể, đảng viên, sinh hoạt, đảng phí, thi đua |
| `/dao-tao` | `DaoTaoPage` (giữ, bỏ redirect) | Lớp đào tạo + NCS |

Cập nhật `src/layouts/AppLayout.tsx:86-92` thành 4 mục con và `src/App.tsx:76` (bỏ `Navigate` của `/dao-tao`).

### 4.2. Component & service mới

```
src/components/
  NhanSuChiTietPanel.tsx      # SlideOver 8 tab (mô hình PersonnelDetail.tsx)
  NhanSuFormPanel.tsx         # Form hồ sơ CBVC đầy đủ, chia section
  QuaTrinhCongTacTab.tsx      # Timeline diễn biến nhân sự
  HopDongLaoDongTab.tsx       # HĐLĐ + lịch sử ngạch bậc lương
  BangCapChungChiTab.tsx      # Gộp bang_cap + chung_chi_hanh_nghe
  DanhGiaCbvcTab.tsx          # Xếp loại theo năm + giờ NCKH
  DangDoanTheTab.tsx          # Tóm tắt hồ sơ Đảng của CBVC (hiện theo quyền)
  ImportCbvcModal.tsx         # Nhập Excel (port ImportEmployeeModal)
  OrgChartDoanThe.tsx         # Cây tổ chức Đảng (tái dụng layout OrgChartTree)
  DangVienChiTietPanel.tsx    # Lý lịch đảng viên
  SinhHoatChiBoPanel.tsx      # Kỳ sinh hoạt + điểm danh + biên bản
  PhatTrienDangWorkflow.tsx   # Dùng WorkflowStepper.tsx sẵn có, 8 bước

src/services/
  nhanSu.ts                   # tách khỏi org.ts, gánh phần hồ sơ mở rộng
  dangDoanThe.ts              # toàn bộ nghiệp vụ Đảng - Đoàn thể
```

**Tái sử dụng nguyên trạng, không viết lại:** `SlideOver`, `SlidePanelStack`, `MasterTable`, `TableToolbar`, `KpiCard`, `StatusBadge`, `WorkflowStepper`, `FileAttachment`, `LichSuPheDuyetTimeline`, `DataState`, `Modal`, `useAsyncData`, `useCrudForm`, `useTableControls`.

### 4.3. Tab của panel hồ sơ CBVC

Theo mô hình `PersonnelDetail.tsx:517-526`, điều chỉnh cho đơn vị sự nghiệp:

1. **Tổng quan** — thông tin cá nhân, đơn vị, chức danh, ảnh
2. **Quá trình công tác** — timeline `qua_trinh_cong_tac`
3. **HĐLĐ & Lương** — `hop_dong_lao_dong` + `luong_ngach_bac`
4. **Bằng cấp & Chứng chỉ** — `bang_cap` + `chung_chi_hanh_nghe` (cảnh báo hạn)
5. **Đánh giá & NCKH** — `danh_gia_cbvc` + `gio_nghien_cuu`
6. **Đảng - Đoàn thể** — hiển thị có điều kiện theo quyền
7. **Khen thưởng - Kỷ luật** — `khen_thuong_ky_luat` + `thi_dua`
8. **Lịch sử** — `nhat_ky_du_lieu`

---

## 5. Lộ trình triển khai

Ước lượng cho **1 dev fullstack + 0,5 BA**.

| Sprint | Thời lượng | Nội dung | Đầu ra kiểm chứng được |
|---|---|---|---|
| **S0 — Chốt nghiệp vụ** | 0,5 tuần | Làm việc với Phòng TCHC (mẫu 2C-BNV/2008, ngạch bậc đang áp dụng) và Văn phòng Đảng ủy (mẫu lý lịch đảng viên, mức đảng phí theo QĐ 342-QĐ/TW, danh sách chi bộ thật) | Biên bản chốt trường dữ liệu + danh mục chi bộ/tổ công đoàn thực tế |
| **S1 — Hồ sơ CBVC** | 1 tuần | Migration `0028`; `nhanSu.ts`; `NhanSuFormPanel` + `NhanSuChiTietPanel` (tab 1, 2, 4); `ImportCbvcModal` | Nhập/sửa hồ sơ đầy đủ; import Excel 678 CBVC; timeline công tác chạy thật |
| **S2 — HĐLĐ, lương, đánh giá** | 1 tuần | Migration `0029`; tab 3, 5; nhắc hạn HĐLĐ + chứng chỉ | Tab Lương hiển thị lịch sử ngạch bậc; đánh giá năm 2026 nhập được |
| **S3 — Đảng - Đoàn thể lõi** | 1,5 tuần | Migration `0030`; `dangDoanThe.ts`; trang `/dang-doan-the` với `OrgChartDoanThe`, danh sách + lý lịch đảng viên, `PhatTrienDangWorkflow` | **Xóa `MOCK_DANG_DOAN`**; cây chi bộ và danh sách đảng viên lấy từ CSDL |
| **S4 — Sinh hoạt, đảng phí, thi đua** | 1 tuần | Migration `0031`; `SinhHoatChiBoPanel` + điểm danh; sổ thu đảng phí theo kỳ; khen thưởng - kỷ luật; thi đua | **Xóa 3 KPI hardcode**; tỷ lệ dự sinh hoạt & tỷ lệ nộp đảng phí tính từ CSDL |
| **S5 — Phân quyền & báo cáo** | 1 tuần | Migration `0032` RLS + view; biểu mẫu xuất: danh sách đảng viên, tổng hợp chất lượng đảng viên, danh sách CBVC theo đơn vị, báo cáo thi đua; nhắc hạn (chuyển đảng chính thức, đảng phí quá hạn) | Test 5 vai trò: `chuyen-vien` **không** đọc được `dang_vien`; xuất được 4 biểu mẫu Word/Excel |
| **S6 — NCS & hoàn thiện** | 0,5 tuần | Bảng `nghien_cuu_sinh` thay `INITIAL_NCS`; UAT với Phòng TCHC + Văn phòng Đảng ủy; sửa lỗi | Không còn mock trong PH5; biên bản UAT |

**Tổng ~6,5 tuần.** Rút được về ~5 tuần nếu S1/S2 và S3/S4 chạy song song bởi 2 dev — hai nhánh không đụng chạm bảng của nhau.

---

## 6. Định nghĩa hoàn thành (DoD)

- [ ] Tìm `MOCK_` và `INITIAL_NCS` trong `src/pages/NhanSuPage.tsx`, `src/pages/DaoTaoPage.tsx` → không còn kết quả
- [ ] Không còn số liệu KPI hardcode trong JSX của PH5; mọi thẻ KPI truy vấn CSDL
- [ ] 678 CBVC thật đã import, gắn đúng 19 đơn vị + Lãnh đạo Viện
- [ ] Danh sách chi bộ thật đã dựng thành cây; 100% đảng viên có `ngay_vao_dang_du_bi`
- [ ] RLS đã bật cho toàn bộ nhóm bảng Đảng; đã kiểm thử ngược bằng tài khoản `chuyen-vien`
- [ ] Mọi thao tác ghi trên bảng Đảng đều sinh bản ghi `nhat_ky_du_lieu`
- [ ] Xuất được biểu mẫu báo cáo gửi Đảng ủy và biểu mẫu hồ sơ CBVC gửi Bộ Xây dựng
- [ ] Cảnh báo hạn hoạt động: chứng chỉ hành nghề, HĐLĐ, chuyển đảng chính thức (đủ 12 tháng dự bị), đảng phí quá hạn

---

## 7. Rủi ro & cách xử lý

| Rủi ro | Mức | Xử lý |
|---|---|---|
| **Dữ liệu Đảng bị lộ** — RLS `0006` hiện chỉ chặn `anon`, mọi `authenticated` vẫn đọc được bảng nghiệp vụ | **Cao** | Bật RLS **cùng lúc** với lệnh tạo bảng trong `0030`/`0031`, không để tồn tại trạng thái mở giữa S3 và S5 |
| Dữ liệu cá nhân (CCCD, BHXH, tài khoản ngân hàng) — nghĩa vụ theo NĐ 13/2023 về bảo vệ dữ liệu cá nhân | **Cao** | View `v_nhan_su_cong_khai`; audit mọi truy cập trường nhạy cảm; văn bản đồng ý của CBVC do Phòng TCHC thu thập |
| Chưa chốt được mẫu lý lịch đảng viên & danh mục chi bộ thật | Trung bình | S0 là điều kiện tiên quyết vào S3; nếu trễ, đảo S4 lên trước S3 |
| Ngạch/bậc lương thay đổi theo văn bản cải cách tiền lương | Trung bình | Không hardcode hệ số; đưa mức lương cơ sở vào `dm_danh_muc` kèm mốc hiệu lực |
| Import Excel 678 CBVC sai đơn vị hoặc trùng lặp | Trung bình | Import 2 pha: pha preview đối chiếu `ma_dinh_danh` + họ tên, báo lỗi trước khi ghi (đúng cơ chế `ImportEmployeeModal` bên `cic-erp-contract`) |
| Phình phạm vi sang chấm công / tính lương | Trung bình | Xem mục 8 — chốt rõ ranh giới ngay từ đầu |

---

## 8. Phạm vi **không** nằm trong kế hoạch này

Ghi rõ để tránh hiểu nhầm khi nghiệm thu:

- Chấm công, nghỉ phép, tăng ca — tham chiếu `leaveService.ts`, `attendanceService.ts` của `cic-erp-contract` khi làm GĐ2
- Tính và phát hành bảng lương chi tiết (`payrollService.ts`) — PH6 đầy đủ, GĐ2
- Tuyển dụng, onboarding, cổng tự phục vụ CBVC (`recruitmentService.ts`, `SelfServicePortal.tsx`)
- Quản lý NCS chuyên sâu (hội đồng, bảo vệ các cấp) — thuộc **PH7**; kế hoạch này chỉ chuyển `INITIAL_NCS` từ mock sang bảng thật
