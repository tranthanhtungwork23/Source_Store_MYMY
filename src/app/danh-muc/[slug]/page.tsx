import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";

function money(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) return {};

  return {
    title: `${category.name} | MyMy Đồ Ăn Vặt`,
    description: category.description || `Danh mục ${category.name} của MyMy Đồ Ăn Vặt.`,
  };
}

export default async function CategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      products: {
        where: { isActive: true },
        orderBy: [{ isFeatured: "desc" }, { createdAt: "desc" }],
      },
    },
  });

  if (!category || !category.isActive) notFound();

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-6 sm:px-6 sm:py-8">
      <div suppressHydrationWarning className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold text-orange-700">← Quay lại trang chủ</Link>
        <section suppressHydrationWarning className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm sm:mt-6 sm:p-6">
          <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">Danh mục</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{category.name}</h1>
          {category.description ? <p suppressHydrationWarning className="mt-3 max-w-3xl text-stone-600">{category.description}</p> : null}
          <div suppressHydrationWarning className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
            <p suppressHydrationWarning className="font-bold text-stone-900">Có {category.products.length} món đang mở bán</p>
            <p suppressHydrationWarning className="mt-1">Chạm vào chi tiết để xem kỹ sản phẩm và đặt nhanh trên điện thoại.</p>
          </div>
        </section>

        <section suppressHydrationWarning className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {category.products.map((product) => (
            <article suppressHydrationWarning key={product.id} className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
              <div suppressHydrationWarning className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 text-5xl sm:h-40">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span suppressHydrationWarning>🥢</span>
                )}
              </div>
              <h2 className="text-xl font-bold">{product.name}</h2>
              <p suppressHydrationWarning className="mt-2 min-h-12 text-sm leading-6 text-stone-600">{product.shortDescription}</p>
              <div suppressHydrationWarning className="mt-4 space-y-3">
                <strong className="block text-lg text-orange-700">{money(product.price)}</strong>
                <Link href={`/san-pham/${product.slug}`} className="block rounded-full border px-4 py-3 text-center text-sm font-bold">Xem chi tiết và đặt nhanh</Link>
              </div>
            </article>
          ))}
          {category.products.length === 0 ? <div suppressHydrationWarning className="rounded-3xl bg-white p-6 text-stone-500 shadow-sm">Danh mục này chưa có sản phẩm.</div> : null}
        </section>
      </div>
    </main>
  );
}
