import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ProductFallbackVisual } from "@/components/ProductFallbackVisual";
import { createProductOrder } from "@/lib/actions";
import { prisma } from "@/lib/db";

function money(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const product = await prisma.product.findUnique({ where: { slug }, include: { category: true } });
  if (!product) return {};

  return {
    title: product.metaTitle || `${product.name} | MyMy Đồ Ăn Vặt`,
    description: product.metaDescription || product.shortDescription,
    openGraph: {
      title: product.name,
      description: product.shortDescription,
      type: "website",
    },
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await prisma.product.findUnique({
    where: { slug },
    include: { category: true },
  });

  if (!product || !product.isActive) notFound();

  const related = await prisma.product.findMany({
    where: { categoryId: product.categoryId, id: { not: product.id }, isActive: true },
    take: 3,
    orderBy: { createdAt: "desc" },
  });

  const schema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.shortDescription,
    sku: product.sku || undefined,
    category: product.category.name,
    offers: {
      "@type": "Offer",
      priceCurrency: "VND",
      price: product.price,
      availability: product.stock > 0 ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
    },
  };

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold text-orange-700">← Quay lại menu</Link>
        <section className="mt-5 grid gap-6 rounded-[2rem] bg-white p-5 shadow-sm sm:mt-6 sm:p-6 md:grid-cols-[1fr_1.2fr] md:gap-8">
          <div className="mx-auto flex aspect-square w-[86%] max-w-sm items-center justify-center overflow-hidden rounded-[1.75rem] bg-gradient-to-br from-orange-50 to-yellow-50 text-6xl sm:text-7xl md:mx-0 md:w-full md:max-w-md">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-3" />
            ) : (
              <ProductFallbackVisual name={product.name} categoryName={product.category.name} />
            )}
          </div>
          <div>
            <span className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">{product.category.name}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-stone-900 sm:text-4xl">{product.name}</h1>
            <p className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{product.shortDescription}</p>
            {product.description ? <p className="mt-3 leading-7 text-stone-600 sm:leading-8">{product.description}</p> : null}
            <div className="mt-6 rounded-3xl bg-orange-50 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Giá bán hiện tại</p>
              <div className="mt-2 flex flex-wrap items-end gap-3">
                <strong className="text-3xl text-orange-700">{money(product.price)}</strong>
                {product.compareAtPrice ? <span className="text-base text-stone-400 line-through sm:text-lg">Giá gốc {money(product.compareAtPrice)}</span> : null}
              </div>
              {product.compareAtPrice && product.compareAtPrice > product.price ? (
                <p className="mt-2 text-sm font-semibold text-stone-600">
                  Tiết kiệm {money(product.compareAtPrice - product.price)} so với giá gốc.
                </p>
              ) : null}
            </div>
            <div className="mt-4 grid gap-3 rounded-3xl bg-orange-50 p-4 text-sm text-stone-700 sm:grid-cols-3">
              <p><strong>Tình trạng:</strong> {product.stock > 0 ? "Còn món" : "Tạm hết"}</p>
              <p><strong>Thanh toán:</strong> COD khi nhận</p>
              <p><strong>Xác nhận:</strong> Shop gọi/Zalo trước khi giao</p>
            </div>
            <div className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/#menu" className="inline-flex justify-center rounded-full border border-orange-300 px-6 py-3 font-bold text-orange-700">Xem thêm món khác</Link>
              <a href="#dat-ngay" className="inline-flex justify-center rounded-full bg-orange-600 px-6 py-3 font-bold text-white">Mua ngay</a>
            </div>
          </div>
        </section>

        <section id="dat-ngay" className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
          <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">Đặt nhanh</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-stone-900 sm:text-3xl">Đặt nhanh {product.name}</h2>
              <p className="mt-3 text-stone-600">Bạn có thể chọn số lượng ngay tại đây rồi gửi thông tin nhận hàng, không cần quay lại menu chính.</p>
              <div className="mt-4 rounded-3xl bg-orange-50 p-4 text-sm text-stone-700">
                <p><strong>Sản phẩm:</strong> {product.name}</p>
                <p><strong>Giá:</strong> {money(product.price)} / phần</p>
                <p><strong>Đặt hàng:</strong> Gửi thông tin một lần, shop sẽ xác nhận lại trước khi giao.</p>
                <p><strong>Gợi ý:</strong> Nếu muốn mua thêm món khác, bạn có thể quay lại menu và gom đơn trong giỏ hàng.</p>
              </div>
            </div>
            <form action={createProductOrder} className="space-y-3">
              <input type="hidden" name="productId" value={product.id} />
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Số lượng</label>
                <input type="number" name="quantity" min="1" max="20" defaultValue="1" className="w-full rounded-xl border p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Tên khách hàng</label>
                <input name="customerName" required placeholder="Ví dụ: Nguyễn Văn A" className="w-full rounded-xl border p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Số điện thoại</label>
                <input name="phone" required placeholder="Ví dụ: 09xxxxxxxx" className="w-full rounded-xl border p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Địa chỉ giao hàng</label>
                <input name="address" required placeholder="Số nhà, đường, phường/xã, quận/huyện..." className="w-full rounded-xl border p-3" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Ghi chú thêm</label>
                <textarea name="note" placeholder="Ví dụ: ít cay, giao sau 18h..." className="min-h-24 w-full rounded-xl border p-3" />
              </div>
              <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
                <p className="font-bold text-stone-900">Lưu ý đặt hàng</p>
                <ul className="mt-2 space-y-1">
                  <li>• Shop sẽ gọi xác nhận đơn sau khi bạn gửi.</li>
                  <li>• Thanh toán khi nhận hàng (COD).</li>
                  <li>• Bạn có thể ghi chú mức cay, thêm sốt hoặc thời gian nhận.</li>
                </ul>
              </div>
              <button className="w-full rounded-full bg-stone-900 px-5 py-3 font-bold text-white">Gửi đơn cho món này</button>
            </form>
          </div>
        </section>

        {related.length ? (
          <section className="mt-8">
            <h2 className="text-2xl font-black">Món liên quan</h2>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/san-pham/${item.slug}`} className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="font-bold">{item.name}</h3>
                  <p className="mt-2 text-sm text-stone-500">{money(item.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div className="mx-auto flex max-w-5xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">Giá bán</p>
            <p className="text-lg font-black text-orange-700">{money(product.price)}</p>
          </div>
          <a href="#dat-ngay" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-extrabold text-white">
            Mua ngay
          </a>
        </div>
      </div>
    </main>
  );
}
