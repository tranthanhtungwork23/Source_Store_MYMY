import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { saveProduct } from "@/lib/actions";
import { prisma } from "@/lib/db";

export default async function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const [product, categories] = await Promise.all([
    prisma.product.findUnique({ where: { id: Number(id) } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
  ]);

  if (!product) notFound();

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section>
          <Link href="/admin/products" className="text-sm font-bold text-orange-700">← Quay lại sản phẩm</Link>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Sửa sản phẩm</h1>
          <form action={saveProduct} className="mt-6 grid gap-4 rounded-3xl bg-white p-5 shadow-sm sm:p-6 md:grid-cols-2">
            <input type="hidden" name="id" value={product.id} />
            <input name="name" required defaultValue={product.name} placeholder="Tên sản phẩm" className="rounded-xl border p-3" />
            <input name="slug" defaultValue={product.slug} placeholder="slug" className="rounded-xl border p-3" />
            <input name="sku" defaultValue={product.sku || ""} placeholder="SKU" className="rounded-xl border p-3" />
            <input name="price" type="number" required defaultValue={product.price} placeholder="Giá bán" className="rounded-xl border p-3" />
            <input name="compareAtPrice" type="number" defaultValue={product.compareAtPrice || ""} placeholder="Giá gốc" className="rounded-xl border p-3" />
            <input name="stock" type="number" required defaultValue={product.stock} placeholder="Tồn kho" className="rounded-xl border p-3" />
            <div className="md:col-span-2 grid gap-4 md:grid-cols-[1fr_180px] md:items-start">
              <label className="space-y-2">
                <span className="font-bold">Ảnh sản phẩm</span>
                <input name="imageUrl" defaultValue={product.imageUrl || ""} placeholder="Dán URL ảnh: https://..." className="w-full rounded-xl border p-3" />
                <input name="imageFile" type="file" accept="image/*" className="w-full rounded-xl border p-3" />
                <span className="block text-xs text-stone-500">Có thể giữ URL hiện tại hoặc upload ảnh mới để thay thế.</span>
              </label>
              <div className="overflow-hidden rounded-2xl border bg-orange-50">
                <div className="flex h-40 items-center justify-center text-5xl">
                  {product.imageUrl ? <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-2" /> : "🥢"}
                </div>
              </div>
            </div>
            <textarea name="shortDescription" required defaultValue={product.shortDescription} placeholder="Mô tả ngắn" className="rounded-xl border p-3 md:col-span-2" />
            <textarea name="description" defaultValue={product.description || ""} placeholder="Mô tả chi tiết" className="rounded-xl border p-3 md:col-span-2" />
            <select name="categoryId" required defaultValue={product.categoryId} className="rounded-xl border p-3">
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isFeatured" type="checkbox" defaultChecked={product.isFeatured} />Nổi bật</label>
            <label className="flex items-center gap-2 rounded-2xl bg-orange-50 px-4 py-3"><input name="isActive" type="checkbox" defaultChecked={product.isActive} />Đang bán</label>
            <button className="rounded-full bg-orange-600 px-5 py-3 font-bold text-white md:col-span-2">Cập nhật sản phẩm</button>
          </form>
        </section>
      </div>
    </main>
  );
}
