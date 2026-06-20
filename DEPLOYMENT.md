# MyMy Store - Production Deployment Guide

## Mục tiêu

Bản này đã được chuẩn bị để chạy production tốt hơn bản SQLite local ban đầu:

- Prisma dùng PostgreSQL thay vì SQLite.
- Public pages có ISR cache để giảm tải database.
- Admin session được ký bằng `ADMIN_SESSION_SECRET`.
- Cookie admin bật `secure` khi chạy production.
- Upload ảnh local có giới hạn dung lượng/type và tên file random an toàn hơn.
- Middleware thêm security headers và rate limit cơ bản.

## Biến môi trường production

Tạo `.env` trên server hoặc trong dashboard hosting:

```env
DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@YOUR_HOST:5432/postgres?schema=public"
NEXT_PUBLIC_SITE_URL="https://your-domain.com"
UPLOAD_DRIVER="local"
ADMIN_EMAIL="admin@example.com"
ADMIN_PASSWORD="change-this-password"
ADMIN_SESSION_SECRET="generate-a-long-random-string-at-least-32-chars"
```

Tạo secret mạnh:

```bash
openssl rand -base64 48
```

## Database khuyến nghị

Dùng một trong các lựa chọn:

- Supabase Postgres
- Neon Postgres
- Railway Postgres
- VPS Postgres riêng

Không dùng SQLite cho production có nhiều đơn hàng đồng thời.

## Lệnh deploy cơ bản trên VPS

```bash
git clone https://github.com/tranthanhtungwork23/Source_Store_MYMY.git
cd Source_Store_MYMY
npm install
cp .env.example .env
# sửa .env bằng thông tin production
npm run db:push
npm run db:seed
npm run build
npm run start
```

Khuyến nghị chạy bằng PM2:

```bash
npm install -g pm2
pm2 start npm --name mymy-store -- start
pm2 save
pm2 startup
```

## Nginx reverse proxy mẫu

```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Sau đó bật HTTPS bằng Certbot.

## Upload ảnh

Hiện tại vẫn là `UPLOAD_DRIVER=local`, phù hợp VPS 1 instance.

Nếu deploy Vercel/serverless hoặc nhiều server, cần chuyển upload sang:

- Supabase Storage
- Cloudinary
- S3/R2

Nếu dùng local upload, cần backup:

```bash
public/uploads
```

## Kiểm tra sau deploy

```bash
curl -I https://your-domain.com
curl -I https://your-domain.com/blog
curl -I https://your-domain.com/sitemap.xml
```

Kiểm tra admin:

- `/admin/login`
- đăng nhập
- tạo/sửa sản phẩm
- tạo đơn test
- xem đơn trong admin

## Ước lượng chịu tải sau thay đổi

Với PostgreSQL + cache public pages + VPS 2GB RAM:

- 50-150 người online cùng lúc: ổn cho shop nhỏ.
- 150-300 người online cùng lúc: có thể ổn nếu ảnh nhẹ và DB ổn.
- Trên 300 người cùng lúc: cần test tải thật bằng k6/autocannon, CDN ảnh, tối ưu query và có thể thêm cache layer.

## Việc nên làm tiếp theo

1. Chuyển ảnh sang Supabase Storage hoặc Cloudinary.
2. Thêm rate limit bền hơn bằng Redis/Upstash nếu traffic lớn.
3. Tối ưu ảnh từ `<img>` sang `next/image`.
4. Thêm backup database tự động.
5. Chạy load test sau khi có domain/server thật.
