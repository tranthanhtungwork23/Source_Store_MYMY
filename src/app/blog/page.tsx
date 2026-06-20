import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Mẹo chọn món | MyMy Đồ Ăn Vặt",
  description: "Bài viết giúp khách chọn đồ ăn vặt, bảo quản món và đặt hàng tiện hơn.",
};

export default async function BlogPage() {
  const [setting, posts] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
    }),
  ]);

  const siteName = setting?.siteName || "MyMy Đồ Ăn Vặt";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4df_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Mẹo chọn món</p>
          <h1 className="mt-3 text-3xl font-black sm:text-5xl">Bài viết từ {siteName}</h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-stone-600 sm:text-base">
            Gợi ý chọn món, bảo quản đồ ăn vặt, cách ghi chú khẩu vị và những điều nên biết trước khi đặt hàng.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link href="/" className="rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white">Về menu đặt món</Link>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {posts.map((post) => (
            <article key={post.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap gap-2">
                {post.isFeatured ? <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">Shop gợi ý</span> : null}
                <span className="rounded-full bg-stone-100 px-3 py-1 text-xs font-bold text-stone-600">{post.publishedAt ? post.publishedAt.toLocaleDateString("vi-VN") : "Bài viết"}</span>
              </div>
              <h2 className="mt-4 text-xl font-black leading-snug text-stone-900">{post.title}</h2>
              <p className="mt-3 line-clamp-4 text-sm leading-6 text-stone-600">{post.excerpt}</p>
              <p className="mt-4 text-xs font-medium uppercase tracking-[0.16em] text-stone-500">{post.authorName}</p>
              <Link href={`/blog/${post.slug}`} className="mt-5 inline-flex rounded-full bg-stone-900 px-4 py-2 text-sm font-bold text-white">Đọc bài</Link>
            </article>
          ))}
        </div>
      </div>
    </main>
  );
}
