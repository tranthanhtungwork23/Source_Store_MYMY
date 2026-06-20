import { notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { saveBlogPost } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function EditBlogPostPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const post = await prisma.blogPost.findUnique({ where: { id: Number(id) } });

  if (!post) notFound();

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section className="space-y-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <div>
            <h1 className="text-3xl font-black sm:text-4xl">Sửa bài viết</h1>
            <p className="mt-2 text-stone-600">Chỉnh nội dung blog, slug, SEO và trạng thái xuất bản.</p>
          </div>

          <form action={saveBlogPost} className="grid gap-4 md:grid-cols-2">
            <input type="hidden" name="id" value={post.id} />
            <input name="title" required defaultValue={post.title} placeholder="Tiêu đề bài viết" className="rounded-xl border p-3" />
            <input name="slug" defaultValue={post.slug} placeholder="slug" className="rounded-xl border p-3" />
            <input name="authorName" defaultValue={post.authorName} placeholder="Tác giả" className="rounded-xl border p-3" />
            <input name="coverImageUrl" defaultValue={post.coverImageUrl || ""} placeholder="URL ảnh đại diện" className="rounded-xl border p-3" />
            <label className="space-y-2 md:col-span-2">
              <span className="font-bold">Upload ảnh đại diện mới</span>
              <input name="coverImageFile" type="file" accept="image/*" className="w-full rounded-xl border p-3" />
            </label>
            <textarea name="excerpt" required defaultValue={post.excerpt} placeholder="Mô tả ngắn / sapo" className="rounded-xl border p-3 md:col-span-2" />
            <textarea name="content" required rows={14} defaultValue={post.content} className="rounded-xl border p-3 md:col-span-2" />
            <input name="metaTitle" defaultValue={post.metaTitle || ""} placeholder="SEO title" className="rounded-xl border p-3" />
            <input name="metaDescription" defaultValue={post.metaDescription || ""} placeholder="Meta description" className="rounded-xl border p-3" />
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isFeatured" type="checkbox" defaultChecked={post.isFeatured} />Bài nổi bật</label>
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isPublished" type="checkbox" defaultChecked={post.isPublished} />Xuất bản</label>
            <button className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Cập nhật bài viết</button>
          </form>
        </section>
      </div>
    </main>
  );
}
