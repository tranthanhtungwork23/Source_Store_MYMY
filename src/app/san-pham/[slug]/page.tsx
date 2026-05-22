import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createOrder } from "@/lib/actions";
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
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-6 pb-28 sm:px-6 sm:py-8 sm:pb-8">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      <div suppressHydrationWarning className="mx-auto max-w-5xl">
        <Link href="/" className="text-sm font-bold text-orange-700">← Quay lại menu</Link>
        <section suppressHydrationWarning className="mt-5 grid gap-6 rounded-[2rem] bg-white p-5 shadow-sm sm:mt-6 sm:p-6 md:grid-cols-[1fr_1.2fr] md:gap-8">
          <div suppressHydrationWarning className="flex min-h-64 items-center justify-center overflow-hidden rounded-[2rem] bg-gradient-to-br from-orange-100 to-yellow-50 text-7xl sm:min-h-80 sm:text-8xl">
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
            ) : (
              <span suppressHydrationWarning>🥢</span>
            )}
          </div>
          <div suppressHydrationWarning>
            <span suppressHydrationWarning className="rounded-full bg-orange-100 px-3 py-1 text-sm font-bold text-orange-700">{product.category.name}</span>
            <h1 className="mt-4 text-3xl font-black leading-tight text-stone-900 sm:text-4xl">{product.name}</h1>
            <p suppressHydrationWarning className="mt-4 text-base leading-7 text-stone-600 sm:text-lg sm:leading-8">{product.shortDescription}</p>
            {product.description ? <p suppressHydrationWarning className="mt-3 leading-7 text-stone-600 sm:leading-8">{product.description}</p> : null}
            <div suppressHydrationWarning className="mt-6 flex flex-wrap items-end gap-3">
              <strong className="text-3xl text-orange-700">{money(product.price)}</strong>
              {product.compareAtPrice ? <span suppressHydrationWarning className="text-base text-stone-400 line-through sm:text-lg">{money(product.compareAtPrice)}</span> : null}
            </div>
            <div suppressHydrationWarning className="mt-4 grid gap-3 rounded-3xl bg-orange-50 p-4 text-sm text-stone-700 sm:grid-cols-3">
              <p suppressHydrationWarning><strong>Tồn kho:</strong> {product.stock}</p>
              <p suppressHydrationWarning><strong>Thanh toán:</strong> COD khi nhận</p>
              <p suppressHydrationWarning><strong>Liên hệ:</strong> Shop gọi xác nhận</p>
            </div>
            <div suppressHydrationWarning className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
              <Link href="/#menu" className="inline-flex justify-center rounded-full border border-orange-300 px-6 py-3 font-bold text-orange-700">Xem thêm món khác</Link>
              <a href="#dat-ngay" className="inline-flex justify-center rounded-full bg-orange-600 px-6 py-3 font-bold text-white">Mua ngay</a>
            </div>
          </div>
        </section>

        <section suppressHydrationWarning id="dat-ngay" className="mt-6 rounded-[2rem] bg-white p-5 shadow-sm sm:mt-8 sm:p-6">
          <div suppressHydrationWarning className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
            <div suppressHydrationWarning>
              <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.3em] text-orange-500">Đặt nhanh</p>
              <h2 className="mt-3 text-2xl font-black leading-tight text-stone-900 sm:text-3xl">Mua ngay {product.name}</h2>
              <p suppressHydrationWarning className="mt-3 text-stone-600">Không cần quay lại trang chủ. Điền thông tin là hệ thống tạo đơn ngay với 1 sản phẩm này.</p>
              <div suppressHydrationWarning className="mt-4 rounded-3xl bg-orange-50 p-4 text-sm text-stone-700">
                <p suppressHydrationWarning><strong>Sản phẩm:</strong> {product.name}</p>
                <p suppressHydrationWarning><strong>Giá:</strong> {money(product.price)}</p>
                <p suppressHydrationWarning><strong>Số lượng mặc định:</strong> 1</p>
              </div>
            </div>
            <form suppressHydrationWarning action={createOrder} className="space-y-3">
              <input suppressHydrationWarning type="hidden" name="items" value={JSON.stringify([{ id: product.id, quantity: 1 }])} />
              <input suppressHydrationWarning type="hidden" name="couponCode" value="" />
              <div suppressHydrationWarning className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Tên khách hàng</label>
                <input suppressHydrationWarning name="customerName" required placeholder="Ví dụ: Nguyễn Văn A" className="w-full rounded-xl border p-3" />
              </div>
              <div suppressHydrationWarning className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Số điện thoại</label>
                <input suppressHydrationWarning name="phone" required placeholder="Ví dụ: 09xxxxxxxx" className="w-full rounded-xl border p-3" />
              </div>
              <div suppressHydrationWarning className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Địa chỉ giao hàng</label>
                <input suppressHydrationWarning name="address" required placeholder="Số nhà, đường, phường/xã..." className="w-full rounded-xl border p-3" />
              </div>
              <div suppressHydrationWarning className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Ghi chú thêm</label>
                <textarea suppressHydrationWarning name="note" placeholder="Ví dụ: ít cay, giao sau 18h..." className="min-h-24 w-full rounded-xl border p-3" />
              </div>
              <button suppressHydrationWarning className="w-full rounded-full bg-stone-900 px-5 py-3 font-bold text-white">Đặt ngay sản phẩm này</button>
            </form>
          </div>
        </section>

        {related.length ? (
          <section suppressHydrationWarning className="mt-8">
            <h2 className="text-2xl font-black">Món liên quan</h2>
            <div suppressHydrationWarning className="mt-4 grid gap-4 md:grid-cols-3">
              {related.map((item) => (
                <Link key={item.id} href={`/san-pham/${item.slug}`} className="rounded-3xl bg-white p-4 shadow-sm sm:p-5">
                  <h3 className="font-bold">{item.name}</h3>
                  <p suppressHydrationWarning className="mt-2 text-sm text-stone-500">{money(item.price)}</p>
                </Link>
              ))}
            </div>
          </section>
        ) : null}
      </div>

      <div suppressHydrationWarning className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur md:hidden">
        <div suppressHydrationWarning className="mx-auto flex max-w-5xl items-center gap-3">
          <div suppressHydrationWarning className="min-w-0 flex-1">
            <p suppressHydrationWarning className="text-xs font-bold uppercase tracking-wide text-stone-500">Giá bán</p>
            <p suppressHydrationWarning className="text-lg font-black text-orange-700">{money(product.price)}</p>
          </div>
          <a href="#dat-ngay" className="rounded-full bg-stone-900 px-5 py-3 text-sm font-extrabold text-white">
            Mua ngay
          </a>
        </div>
      </div>
    </main>
  );
}
