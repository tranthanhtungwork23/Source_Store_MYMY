import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductFallbackVisual } from "@/components/ProductFallbackVisual";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

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
    <main className="min-h-screen bg-orange-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="mx-auto max-w-6xl">
        <Link href="/" className="text-sm font-bold text-orange-700">← Quay lại trang chủ</Link>
        <section className="mt-5 rounded-[2rem] bg-white p-5 shadow-sm sm:mt-6 sm:p-6">
          <p className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">Danh mục</p>
          <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl">{category.name}</h1>
          {category.description ? <p className="mt-3 max-w-3xl text-stone-600">{category.description}</p> : null}
          <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
            <p className="font-bold text-stone-900">Có {category.products.length} món đang mở bán</p>
            <p className="mt-1">Chạm vào chi tiết để xem kỹ sản phẩm và đặt nhanh trên điện thoại.</p>
          </div>
        </section>

        <section className="mt-6 grid gap-4 sm:mt-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-5">
          {category.products.map((product) => {
            return (
              <article key={product.id} className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
                <div className="mx-auto mb-4 flex aspect-square w-[82%] flex-col items-center justify-center overflow-hidden rounded-[1.4rem] bg-gradient-to-br from-orange-50 to-yellow-50 md:w-[76%]">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-2" />
                  ) : (
                    <ProductFallbackVisual name={product.name} categoryName={category.name} />
                  )}
                </div>
                <h2 className="text-xl font-bold">{product.name}</h2>
                <p className="mt-2 min-h-12 text-sm leading-6 text-stone-600">{product.shortDescription}</p>
                <div className="mt-4 space-y-3">
                  <strong className="block text-lg text-orange-700">{money(product.price)}</strong>
                  <Link href={`/san-pham/${product.slug}`} className="block rounded-full border border-stone-300 bg-white px-4 py-3 text-center text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Xem chi tiết và đặt nhanh</Link>
                </div>
              </article>
            );
          })}
          {category.products.length === 0 ? <div className="rounded-3xl bg-white p-6 text-stone-500 shadow-sm">Danh mục này chưa có sản phẩm.</div> : null}
        </section>
      </div>
    </main>
  );
}
