# Production checklist cho banh-trang-site-v2

## 1. Database
- Local hiện dùng SQLite: `DATABASE_URL="file:./dev.db"`.
- Khi deploy thật nên chuyển sang PostgreSQL.
- Cần cập nhật `prisma/schema.prisma` datasource từ sqlite sang postgresql và chạy migrate.

## 2. Biến môi trường cần có
- `DATABASE_URL`: chuỗi kết nối database production.
- `ADMIN_EMAIL`: email admin ban đầu.
- `ADMIN_PASSWORD`: mật khẩu admin ban đầu, phải đổi sau khi deploy.
- `SESSION_SECRET`: chuỗi dài, ngẫu nhiên, không commit lên git.

## 3. Bảo mật
- Đổi mật khẩu admin demo trước khi public.
- Bật HTTPS qua hosting/domain.
- Không public file `.env`.
- Nên thay cookie session MVP bằng auth production nếu có nhiều nhân sự.

## 4. Ảnh sản phẩm
- MVP hiện hỗ trợ upload vào `public/uploads`.
- Nếu deploy trên server không lưu file bền vững, nên chuyển sang Cloudinary/S3/R2.

## 5. Build/deploy
- Cài dependency: `npm install`.
- Generate Prisma: `npx prisma generate`.
- Sync/migrate database: `npx prisma db push` cho MVP hoặc `npx prisma migrate deploy` nếu dùng migration.
- Build: `npm run build`.
- Start production: `npm run start`.

## 6. Những phần đã có
- Storefront public.
- Admin login.
- Quản lý sản phẩm/danh mục/đơn hàng/cài đặt.
- Upload ảnh nội bộ.
- Phí ship mặc định.
- Freeship theo ngưỡng.
- Coupon cơ bản.
- Tạo đơn thủ công.
- Trang chi tiết đơn.
- Trang in đơn.
- SEO sitemap/robots/product metadata.

## 7. Nâng cấp sau MVP
- Thanh toán online.
- Email/SMS xác nhận đơn.
- Phân quyền nhiều user.
- Cloud media storage.
- Dashboard biểu đồ doanh thu.
- Audit log thao tác admin.
