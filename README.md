# MyMy Bánh Tráng Store - Dual Database Setup

Dự án này hỗ trợ 2 môi trường database:

## Local dev (SQLite)

Chạy local với SQLite nhanh, không cần PostgreSQL:

```bash
npm run dev
```

Script này sẽ tự động:
- Generate Prisma Client từ `prisma/schema.dev.prisma` (SQLite)
- Kết nối `prisma/dev.db`
- Chạy Next.js dev server

DATABASE_URL trong .env local:
```
DATABASE_URL="file:./dev.db"
```

## Production (PostgreSQL)

Deploy production dùng PostgreSQL:

```bash
npm run build
npm run start
```

Script `build` sẽ:
- Generate Prisma Client từ `prisma/schema.prisma` (PostgreSQL)
- Build Next.js production

DATABASE_URL production cần format PostgreSQL:
```
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public"
```

## Commands hữu ích

```bash
# Dev local SQLite
npm run dev                    # Generate dev schema + dev server
npm run db:push:dev           # Sync dev.db với schema.dev.prisma
npm run db:generate:dev       # Generate dev client manually

# Production PostgreSQL
npm run build                 # Generate prod schema + build
npm run db:generate           # Generate prod client manually
npm run db:push               # Sync Postgres với schema.prisma
npm run db:migrate            # Apply migrations
npm run db:seed               # Seed data

# Dev với PostgreSQL (test local)
npm run dev:prod-db           # Generate prod schema + dev server
```

## Cấu trúc schema

- `prisma/schema.prisma` — production PostgreSQL schema
- `prisma/schema.dev.prisma` — local SQLite schema
- `prisma/dev.db` — SQLite database file (gitignored)
- `prisma/migrations/` — PostgreSQL migrations

## Lưu ý

1. Script `dev` mặc định dùng SQLite để local nhanh
2. Script `build` luôn dùng PostgreSQL cho production
3. Hai schema giống nhau về model, chỉ khác provider
4. Nếu muốn test local với PostgreSQL, dùng `dev:prod-db`

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
