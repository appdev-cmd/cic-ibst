# Scripts vận hành CSDL

## ⚠️ Hai script cũ đã bị vô hiệu hoá

`run_migrations.js` và `find_pg_host.js` **không dùng được nữa** và đã được đổi tên thành
`*.js.DEPRECATED`. Lý do:

1. **Hardcode mật khẩu CSDL** (`IymTBNztKKohCr0l`) ngay trong mã nguồn — mật khẩu này đã
   được xoay, nhưng vẫn cần coi là đã rò rỉ.
2. **Thông tin kết nối sai** — trỏ tới pooler `aws-0-ap-northeast-2` với user
   `postgres.umvckjqseqawpqamvsbx`, endpoint này trả `Tenant or user not found`.
   Đây là lý do migration 0012 **tưởng đã chạy nhưng thực tế chưa bao giờ được áp dụng**,
   khiến 3 trang Đấu thầu / Ủy quyền / PVQLNN không hoạt động trong thời gian dài.
3. **`run_migrations.js` chèn 20 hợp đồng giả** `HD-2026/*` vào CSDL production sau khi
   chạy migration — chạy lại sẽ làm bẩn dữ liệu thật.
4. `find_pg_host.js` vừa dò host **vừa chạy DDL** (thêm cột, tạo bảng) — không nên gộp
   việc thăm dò với việc thay đổi lược đồ.

## Cách chạy migration hiện nay

Dùng **Supabase Management API** — không cần mật khẩu CSDL, chỉ cần Personal Access Token:

```bash
# Lấy token tại https://supabase.com/dashboard/account/tokens
export SUPABASE_ACCESS_TOKEN="sbp_..."
node scripts/apply_migration.js supabase/migrations/00XX_ten_migration.sql
```

Thêm `--dry-run` để chỉ in nội dung SQL, không gửi lên CSDL.

## Nguyên tắc

- Mọi migration phải **idempotent**: `create table if not exists`,
  `add column if not exists`, `drop policy if exists` trước khi `create policy`.
- **Không seed dữ liệu mẫu trong migration.** Dữ liệu demo để riêng và chạy có ý thức.
- Sau khi chạy, **kiểm chứng bằng truy vấn thật** (bảng/cột/policy có đúng như mong đợi),
  đừng chỉ tin việc "chạy không báo lỗi" — bài học từ migration 0012.
