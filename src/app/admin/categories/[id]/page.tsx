import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { saveCategory } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const category = await prisma.category.findUnique({ where: { id: Number(id) } });

  if (!category) notFound();

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div suppressHydrationWarning className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section suppressHydrationWarning>
          <Link href="/admin/categories" className="text-sm font-bold text-orange-700">← Quay lại danh mục</Link>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Sửa danh mục</h1>
          <form suppressHydrationWarning action={saveCategory} className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
            <input suppressHydrationWarning type="hidden" name="id" value={category.id} />
            <input suppressHydrationWarning name="name" required defaultValue={category.name} placeholder="Tên danh mục" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="slug" defaultValue={category.slug} placeholder="slug" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="sortOrder" type="number" defaultValue={category.sortOrder} placeholder="Thứ tự" className="rounded-xl border p-3" />
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input suppressHydrationWarning name="isActive" type="checkbox" defaultChecked={category.isActive} />Đang hiển thị</label>
            <textarea suppressHydrationWarning name="description" defaultValue={category.description || ""} placeholder="Mô tả danh mục" className="rounded-xl border p-3 md:col-span-2" />
            <button suppressHydrationWarning className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Cập nhật danh mục</button>
          </form>
        </section>
      </div>
    </main>
  );
}
