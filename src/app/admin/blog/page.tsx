import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { deleteBlogPost, saveBlogPost, toggleBlogPost } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function AdminBlogPage() {
  const admin = await requireAdmin();
  const posts = await prisma.blogPost.findMany({ orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section className="space-y-6">
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h1 className="text-3xl font-black sm:text-4xl">Quản lý blog</h1>
              <p className="mt-2 text-stone-600">Viết bài SEO, đăng kiến thức, kéo traffic và dẫn khách về sản phẩm.</p>
            </div>
            <Link href="/blog" className="rounded-full bg-stone-900 px-5 py-3 text-center font-bold text-white">Xem blog</Link>
          </div>

          <form action={saveBlogPost} className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
            <h2 className="text-xl font-black md:col-span-2">Tạo bài viết mới</h2>
            <input name="title" required placeholder="Tiêu đề bài viết" className="rounded-xl border p-3" />
            <input name="slug" placeholder="slug-tu-dong-neu-bo-trong" className="rounded-xl border p-3" />
            <input name="authorName" placeholder="Tác giả" defaultValue="Content SEO&SEO" className="rounded-xl border p-3" />
            <input name="coverImageUrl" placeholder="URL ảnh đại diện" className="rounded-xl border p-3" />
            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">Upload ảnh đại diện</span>
              <input name="coverImageFile" type="file" accept="image/*" className="w-full rounded-xl border p-3" />
            </label>
            <textarea name="excerpt" required placeholder="Mô tả ngắn / sapo" className="rounded-xl border p-3 md:col-span-2" />
            <textarea name="content" required rows={12} placeholder={"Nội dung bài viết. Có thể dùng Markdown cơ bản:\n## Tiêu đề phụ\n\nĐoạn văn..."} className="rounded-xl border p-3 md:col-span-2" />
            <input name="metaTitle" placeholder="SEO title" className="rounded-xl border p-3" />
            <input name="metaDescription" placeholder="Meta description" className="rounded-xl border p-3" />
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isFeatured" type="checkbox" />Bài nổi bật</label>
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isPublished" type="checkbox" defaultChecked />Xuất bản</label>
            <button className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Lưu bài viết</button>
          </form>

          <div className="grid gap-4">
            {posts.map((post) => (
              <article key={post.id} className="rounded-3xl bg-white p-5 shadow-sm">
                <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className={`rounded-full px-3 py-1 text-xs font-bold ${post.isPublished ? "bg-green-100 text-green-700" : "bg-stone-100 text-stone-600"}`}>{post.isPublished ? "Đã xuất bản" : "Bản nháp"}</span>
                      {post.isFeatured ? <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">Nổi bật</span> : null}
                    </div>
                    <h2 className="mt-3 text-xl font-black">{post.title}</h2>
                    <p className="mt-2 text-sm leading-6 text-stone-600">{post.excerpt}</p>
                    <p className="mt-3 text-xs text-stone-500">/{post.slug} • {post.publishedAt ? post.publishedAt.toLocaleDateString("vi-VN") : "Chưa xuất bản"}</p>
                  </div>
                  <div className="grid gap-2 sm:grid-cols-4 lg:min-w-[420px]">
                    <Link href={`/blog/${post.slug}`} className="rounded-full border px-4 py-3 text-center text-sm font-bold">Xem</Link>
                    <Link href={`/admin/blog/${post.id}`} className="rounded-full border px-4 py-3 text-center text-sm font-bold">Sửa</Link>
                    <form action={async () => { "use server"; await toggleBlogPost(post.id); }}>
                      <button className="w-full rounded-full border px-4 py-3 text-sm font-bold">{post.isPublished ? "Ẩn" : "Đăng"}</button>
                    </form>
                    <form action={async () => { "use server"; await deleteBlogPost(post.id); }}>
                      <button className="w-full rounded-full border border-red-200 px-4 py-3 text-sm font-bold text-red-700">Xóa</button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
