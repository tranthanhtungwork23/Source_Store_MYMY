import type { Metadata } from "next";
import { CartClient } from "@/components/CartClient";
import { prisma } from "@/lib/db";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return {
    title: setting?.homeMetaTitle || "MyMy Đồ Ăn Vặt",
    description: setting?.homeMetaDescription || "Website bán đồ ăn vặt",
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  const [setting, categories, products] = await Promise.all([
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
    prisma.category.findMany({ where: { isActive: true }, orderBy: { sortOrder: "asc" } }),
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }, { createdAt: "desc" }],
      select: {
        id: true,
        name: true,
        slug: true,
        price: true,
        shortDescription: true,
        stock: true,
        imageUrl: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
  ]);

  return (
    <div suppressHydrationWarning className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4df_100%)] text-stone-900">
      <header suppressHydrationWarning className="mx-auto max-w-7xl px-4 py-4 sm:px-6 sm:py-6">
        <div suppressHydrationWarning className="flex flex-col gap-4 rounded-[2rem] bg-white/90 p-5 shadow-sm sm:p-6 md:flex-row md:items-center md:justify-between">
          <div suppressHydrationWarning>
            <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">{setting?.siteName || "MyMy Đồ Ăn Vặt"}</p>
            <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{setting?.heroTitle}</h1>
            <p suppressHydrationWarning className="mt-3 max-w-2xl text-stone-600">{setting?.heroDescription}</p>
          </div>
          <div suppressHydrationWarning className="space-y-2 text-sm text-stone-600">
            <p suppressHydrationWarning>Hotline: <strong>{setting?.hotline}</strong></p>
            <p suppressHydrationWarning>Phí ship: <strong>{(setting?.defaultShippingFee || 0).toLocaleString("vi-VN")}đ</strong></p>
            {(setting?.freeShippingFrom || 0) > 0 ? <p suppressHydrationWarning>Freeship từ: <strong>{(setting?.freeShippingFrom || 0).toLocaleString("vi-VN")}đ</strong></p> : null}
            <p suppressHydrationWarning>Giao nhanh nội thành • Đặt món trực tiếp trên website</p>
          </div>
        </div>
      </header>

      <main suppressHydrationWarning className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {params.order === "success" ? (
          <div suppressHydrationWarning className="mb-6 rounded-3xl bg-green-600 p-5 font-bold text-white shadow-sm">
            Đặt hàng thành công. Shop đã nhận đơn và sẽ liên hệ xác nhận trong thời gian sớm nhất.
          </div>
        ) : null}
        {params.order === "empty" ? (
          <div suppressHydrationWarning className="mb-6 rounded-3xl bg-red-600 p-5 font-bold text-white shadow-sm">
            Giỏ hàng đang trống. Vui lòng chọn món trước khi tạo đơn.
          </div>
        ) : null}
        <section suppressHydrationWarning className="mb-8 grid gap-4 md:grid-cols-3">
          <div suppressHydrationWarning className="rounded-3xl bg-orange-600 p-5 text-white shadow-lg">
            <p suppressHydrationWarning className="text-sm uppercase tracking-widest text-orange-100">Ưu đãi hôm nay</p>
            <h2 className="mt-2 text-2xl font-bold">Món ngon sẵn sàng, đặt là shop xác nhận</h2>
            <p suppressHydrationWarning className="mt-2 text-sm leading-6 text-orange-50">Bánh tráng, đậu phộng và đồ uống ăn vặt cho buổi chiều, tụ họp hoặc xem phim tại nhà.</p>
          </div>
          <div suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold">Cam kết của shop</h3>
            <ul suppressHydrationWarning className="mt-3 space-y-2 text-stone-600">
              <li suppressHydrationWarning>• Món làm mới trong ngày</li>
              <li suppressHydrationWarning>• Có thể ghi chú ít cay / thêm sốt</li>
              <li suppressHydrationWarning>• Shop gọi xác nhận trước khi giao</li>
            </ul>
          </div>
          <div suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm">
            <h3 className="text-lg font-bold">Cách đặt hàng</h3>
            <ul suppressHydrationWarning className="mt-3 space-y-2 text-stone-600">
              <li suppressHydrationWarning>• Chọn món và thêm vào giỏ</li>
              <li suppressHydrationWarning>• Điền thông tin nhận hàng</li>
              <li suppressHydrationWarning>• Thanh toán khi nhận hàng</li>
            </ul>
          </div>
        </section>

        <CartClient
          products={products}
          categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))}
          defaultShippingFee={setting?.defaultShippingFee || 0}
          freeShippingFrom={setting?.freeShippingFrom || 0}
          couponCode={setting?.couponCode || null}
          couponDiscountType={setting?.couponDiscountType || "NONE"}
          couponDiscountValue={setting?.couponDiscountValue || 0}
        />
      </main>
    </div>
  );
}
