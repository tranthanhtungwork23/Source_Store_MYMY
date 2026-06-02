import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { markdownToHtml } from "@/lib/markdown";
import { prisma } from "@/lib/db";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const post = await prisma.blogPost.findUnique({ where: { slug } });

  if (!post || !post.isPublished) {
    return { title: "Không tìm thấy bài viết" };
  }

  return {
    title: post.metaTitle || post.title,
    description: post.metaDescription || post.excerpt,
    openGraph: {
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      type: "article",
      images: post.coverImageUrl ? [post.coverImageUrl] : undefined,
    },
  };
}

export default async function BlogDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [setting, post] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.blogPost.findUnique({ where: { slug } }),
  ]);

  if (!post || !post.isPublished) notFound();

  const siteName = setting?.siteName || "MyMy Đồ Ăn Vặt";
  const contentHtml = markdownToHtml(post.content);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4df_100%)] px-4 py-6 sm:px-6">
      <article suppressHydrationWarning className="mx-auto max-w-4xl rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
        <Link href="/blog" className="inline-flex rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700">← Quay lại blog</Link>
        <p suppressHydrationWarning className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-orange-700">
          {post.publishedAt ? post.publishedAt.toLocaleDateString("vi-VN") : "Blog"} • {post.authorName}
        </p>
        <h1 className="mt-3 text-3xl font-black leading-tight text-stone-950 sm:text-5xl">{post.title}</h1>
        <p suppressHydrationWarning className="mt-4 text-lg leading-8 text-stone-600">{post.excerpt}</p>

        {post.coverImageUrl ? (
          <img src={post.coverImageUrl} alt={post.title} className="mt-6 max-h-[420px] w-full rounded-3xl object-cover" />
        ) : null}

        <div
          suppressHydrationWarning
          className="prose-blog mt-8 text-stone-800"
          dangerouslySetInnerHTML={{ __html: contentHtml }}
        />

        <div suppressHydrationWarning className="mt-10 rounded-3xl bg-orange-50 p-5">
          <h2 className="text-xl font-black">Muốn đặt món tại {siteName}?</h2>
          <p suppressHydrationWarning className="mt-2 text-sm leading-6 text-stone-600">Xem menu đồ ăn vặt, chọn món và gửi đơn trực tiếp trên website.</p>
          <Link href="/#san-pham" className="mt-4 inline-flex rounded-full bg-orange-600 px-5 py-3 text-sm font-bold text-white">Xem menu đặt món</Link>
        </div>
      </article>
    </main>
  );
}
