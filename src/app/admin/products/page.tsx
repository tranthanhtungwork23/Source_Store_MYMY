import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { deleteProduct, saveProduct, toggleProduct } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function ProductsPage() {
  const admin = await requireAdmin();
  const [products, categories] = await Promise.all([
    prisma.product.findMany({ include: { category: true }, orderBy: { createdAt: "desc" } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div suppressHydrationWarning className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section suppressHydrationWarning className="space-y-6">
          <h1 className="text-3xl font-black sm:text-4xl">Quản lý sản phẩm</h1>

          <form suppressHydrationWarning action={saveProduct} className="grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
            <input suppressHydrationWarning name="name" required placeholder="Tên sản phẩm" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="slug" placeholder="slug-tu-dong-neu-bo-trong" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="sku" placeholder="SKU" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="price" type="number" required placeholder="Giá bán" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="compareAtPrice" type="number" placeholder="Giá gốc" className="rounded-xl border p-3" />
            <input suppressHydrationWarning name="stock" type="number" required placeholder="Tồn kho" className="rounded-xl border p-3" />
            <label className="space-y-2 md:col-span-2">
              <span suppressHydrationWarning className="font-bold">Ảnh sản phẩm</span>
              <input suppressHydrationWarning name="imageUrl" placeholder="Dán URL ảnh: https://..." className="w-full rounded-xl border p-3" />
              <input suppressHydrationWarning name="imageFile" type="file" accept="image/*" className="w-full rounded-xl border p-3" />
              <span suppressHydrationWarning className="block text-xs text-stone-500">Có thể dán URL hoặc upload ảnh từ máy. Nếu upload, hệ thống lưu vào public/uploads.</span>
            </label>
            <textarea suppressHydrationWarning name="shortDescription" required placeholder="Mô tả ngắn" className="rounded-xl border p-3 md:col-span-2" />
            <textarea suppressHydrationWarning name="description" placeholder="Mô tả chi tiết" className="rounded-xl border p-3 md:col-span-2" />
            <select suppressHydrationWarning name="categoryId" required className="rounded-xl border p-3">
              {categories.map((category) => (
                <option key={category.id} value={category.id}>{category.name}</option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input suppressHydrationWarning name="isFeatured" type="checkbox" />Nổi bật</label>
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input suppressHydrationWarning name="isActive" type="checkbox" defaultChecked />Đang bán</label>
            <button suppressHydrationWarning className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Lưu sản phẩm</button>
          </form>

          <div suppressHydrationWarning className="grid gap-4 lg:hidden">
            {products.map((product) => (
              <article suppressHydrationWarning key={product.id} className="rounded-3xl bg-white p-4 shadow-sm">
                <div suppressHydrationWarning className="flex items-start gap-4">
                  <div suppressHydrationWarning className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-orange-50 text-xl">
                    {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-1" /> : "🥢"}
                  </div>
                  <div suppressHydrationWarning className="min-w-0 flex-1">
                    <h2 className="truncate text-lg font-bold">{product.name}</h2>
                    <p suppressHydrationWarning className="mt-1 text-sm text-stone-500">{product.category.name}</p>
                    <div suppressHydrationWarning className="mt-3 grid grid-cols-2 gap-3 text-sm">
                      <div suppressHydrationWarning className="rounded-2xl bg-orange-50 px-3 py-2"><span suppressHydrationWarning className="block text-xs text-stone-500">Giá</span><strong>{product.price.toLocaleString("vi-VN")}đ</strong></div>
                      <div suppressHydrationWarning className="rounded-2xl bg-orange-50 px-3 py-2"><span suppressHydrationWarning className="block text-xs text-stone-500">Tồn kho</span><strong>{product.stock}</strong></div>
                    </div>
                    <p suppressHydrationWarning className="mt-3 text-sm font-medium text-stone-700">{product.isActive ? "Đang bán" : "Đang ẩn"}</p>
                  </div>
                </div>
                <div suppressHydrationWarning className="mt-4 grid gap-2 sm:grid-cols-3">
                  <Link href={`/admin/products/${product.id}`} className="rounded-full border px-4 py-3 text-center">Sửa</Link>
                  <form suppressHydrationWarning action={async () => { "use server"; await toggleProduct(product.id); }}>
                    <button suppressHydrationWarning className="w-full rounded-full border px-4 py-3">{product.isActive ? "Ẩn" : "Hiện"}</button>
                  </form>
                  <form suppressHydrationWarning action={async () => { "use server"; await deleteProduct(product.id); }}>
                    <button suppressHydrationWarning className="w-full rounded-full border border-red-200 px-4 py-3 text-red-700">Xóa mềm</button>
                  </form>
                </div>
              </article>
            ))}
          </div>

          <div suppressHydrationWarning className="hidden overflow-hidden rounded-3xl bg-white shadow-sm lg:block">
            <table className="min-w-full text-sm">
              <thead className="bg-stone-900 text-white">
                <tr>
                  <th className="px-4 py-3 text-left">Ảnh</th>
                  <th className="px-4 py-3 text-left">Tên</th>
                  <th className="px-4 py-3 text-left">Danh mục</th>
                  <th className="px-4 py-3 text-left">Giá</th>
                  <th className="px-4 py-3 text-left">Tồn kho</th>
                  <th className="px-4 py-3 text-left">Trạng thái</th>
                  <th className="px-4 py-3 text-left">Hành động</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id} className="border-t">
                    <td className="px-4 py-3">
                      <div suppressHydrationWarning className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-orange-50 text-xl">
                        {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-1" /> : "🥢"}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-semibold">{product.name}</td>
                    <td className="px-4 py-3">{product.category.name}</td>
                    <td className="px-4 py-3">{product.price.toLocaleString("vi-VN")}đ</td>
                    <td className="px-4 py-3">{product.stock}</td>
                    <td className="px-4 py-3">{product.isActive ? "Đang bán" : "Đang ẩn"}</td>
                    <td className="px-4 py-3">
                      <div suppressHydrationWarning className="flex flex-wrap gap-2">
                        <Link href={`/admin/products/${product.id}`} className="rounded-full border px-4 py-2">Sửa</Link>
                        <form suppressHydrationWarning action={async () => { "use server"; await toggleProduct(product.id); }}>
                          <button suppressHydrationWarning className="rounded-full border px-4 py-2">{product.isActive ? "Ẩn" : "Hiện"}</button>
                        </form>
                        <form suppressHydrationWarning action={async () => { "use server"; await deleteProduct(product.id); }}>
                          <button suppressHydrationWarning className="rounded-full border border-red-200 px-4 py-2 text-red-700">Xóa mềm</button>
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
