import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { saveCategory, toggleCategory } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function CategoriesPage() {
  const admin = await requireAdmin();
  const categories = await prisma.category.findMany({
    include: { _count: { select: { products: true } } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
  });

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section className="space-y-6">
          <h1 className="text-3xl font-black sm:text-4xl">Quản lý danh mục</h1>

          <form action={saveCategory} className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
            <input name="name" required placeholder="Tên danh mục" className="rounded-xl border p-3" />
            <input name="slug" placeholder="slug-tu-dong-neu-bo-trong" className="rounded-xl border p-3" />
            <input name="sortOrder" type="number" defaultValue={0} placeholder="Thứ tự" className="rounded-xl border p-3" />
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isActive" type="checkbox" defaultChecked />Đang hiển thị</label>
            <textarea name="description" placeholder="Mô tả danh mục" className="rounded-xl border p-3 md:col-span-2" />
            <button className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Lưu danh mục</button>
          </form>

          <div className="grid gap-4 lg:hidden">
            {categories.map((category) => (
              <article key={category.id} className="rounded-3xl bg-white p-4 shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-bold">{category.name}</h2>
                    <p className="mt-1 text-sm text-stone-500">/{category.slug}</p>
                  </div>
                  <span className="rounded-full bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">{category._count.products} món</span>
                </div>
                <p className="mt-3 text-sm text-stone-700">{category.isActive ? "Đang bật" : "Đang tắt"}</p>
                <div className="mt-4 grid gap-2 sm:grid-cols-2">
                  <Link href={`/admin/categories/${category.id}`} className="rounded-full border px-4 py-3 text-center">Sửa</Link>
                  <form action={async () => { "use server"; await toggleCategory(category.id); }}>
                    <button className="w-full rounded-full border px-4 py-3">{category.isActive ? "Ẩn" : "Hiện"}</button>
                  </form>
                </div>
              </article>
            ))}
          </div>

          <div className="hidden overflow-hidden rounded-3xl bg-white shadow-sm lg:block">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Slug</th>
                  <th className="px-4 py-3 text-left">Sản phẩm</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {categories.map((category) => (
                  <tr key={category.id} className="border-t">
                    <td className="px-4 py-3 font-semibold">{category.name}</td>
                    <td className="px-4 py-3">{category.slug}</td>
                    <td className="px-4 py-3">{category._count.products}</td>
                    <td className="px-4 py-3">{category.isActive ? "Đang bật" : "Đang tắt"}</td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        <Link href={`/admin/categories/${category.id}`} className="rounded-full border px-4 py-2">Sửa</Link>
                        <form action={async () => { "use server"; await toggleCategory(category.id); }}>
                          <button className="rounded-full border px-4 py-2">{category.isActive ? "Ẩn" : "Hiện"}</button>
                        </form>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </main>
  );
}
