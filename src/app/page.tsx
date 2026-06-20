import type { Metadata } from "next";
import Link from "next/link";
import { CartClient } from "@/components/CartClient";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const setting = await prisma.siteSetting.findUnique({ where: { id: 1 } });
  return {
    title: setting?.homeMetaTitle || "MyMy Đồ Ăn Vặt",
    description: setting?.homeMetaDescription || "Website bán đồ ăn vặt",
  };
}

export default async function HomePage({ searchParams }: { searchParams: Promise<{ order?: string }> }) {
  const params = await searchParams;
  const [setting, categories, products, featuredPosts] = await Promise.all([
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
        isFeatured: true,
        category: { select: { id: true, name: true, slug: true } },
      },
    }),
    prisma.blogPost.findMany({
      where: { isPublished: true },
      orderBy: [{ isFeatured: "desc" }, { publishedAt: "desc" }, { createdAt: "desc" }],
      take: 3,
      select: {
        id: true,
        title: true,
        slug: true,
        excerpt: true,
        authorName: true,
        publishedAt: true,
      },
    }),
  ]);

  const featuredProducts = products.filter((product) => product.isFeatured).slice(0, 3);

  const siteName = setting?.siteName || "MyMy Đồ Ăn Vặt";
  const hotline = setting?.hotline || "Đang cập nhật";
  const zaloLink = setting?.zaloLink || "#";

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4df_100%)] text-stone-900">
      <header className="sticky top-0 z-40 border-b border-orange-100 bg-white/90 shadow-sm backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <a href="#top" className="flex items-center gap-3" aria-label="Về đầu trang">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-xl font-black text-white shadow-sm">M</span>
            <span>
              <strong className="block text-base font-black leading-tight sm:text-lg">{siteName}</strong>
              <span className="hidden text-xs font-bold uppercase tracking-[0.18em] text-orange-700 sm:block">Đồ ăn vặt giao nhanh</span>
            </span>
          </a>

          <nav className="hidden items-center gap-5 text-sm font-bold text-stone-700 md:flex" aria-label="Menu chính">
            <a className="transition hover:text-orange-700" href="#san-pham">Sản phẩm</a>
            <Link className="transition hover:text-orange-700" href="/blog">Blog</Link>
            <a className="transition hover:text-orange-700" href="#cach-dat-hang">Cách đặt hàng</a>
            <a className="transition hover:text-orange-700" href="#lien-he">Liên hệ</a>
          </nav>

          <div className="flex items-center gap-2">
            <a href={`tel:${hotline}`} className="hidden rounded-full border border-orange-200 px-4 py-2 text-sm font-bold text-orange-700 transition hover:bg-orange-50 sm:inline-flex">
              {hotline}
            </a>
            <a href="#san-pham" className="rounded-full bg-orange-600 px-4 py-2 text-sm font-black text-white shadow-sm transition hover:bg-orange-700">
              Đặt món
            </a>
          </div>
        </div>
      </header>

      <section id="top" className="mx-auto max-w-7xl px-4 py-3 sm:px-6 sm:py-6">
        <div className="rounded-[2rem] bg-white/90 p-4 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700 sm:text-sm">{siteName}</p>
              <h1 className="mt-2 text-3xl font-black leading-tight sm:text-4xl md:text-5xl">{setting?.heroTitle}</h1>
              <p className="mt-3 text-sm leading-6 text-stone-600 sm:text-base">{setting?.heroDescription}</p>
              <div className="mt-5 flex flex-wrap gap-3">
                <Link href="#san-pham" className="rounded-full bg-orange-600 px-5 py-3 text-sm font-black text-white shadow-sm transition hover:bg-orange-700">Xem menu</Link>
                <a href={zaloLink} className="rounded-full border border-orange-200 bg-white px-5 py-3 text-sm font-black text-orange-700 transition hover:bg-orange-50">Nhắn Zalo</a>
              </div>
            </div>
            <div className="grid gap-2 rounded-3xl bg-orange-50 p-4 text-sm text-stone-600 sm:max-w-sm">
              <p>Hotline: <strong>{hotline}</strong></p>
              <p>Phí ship dự kiến: <strong>{(setting?.defaultShippingFee || 0).toLocaleString("vi-VN")}đ</strong></p>
              {(setting?.freeShippingFrom || 0) > 0 ? <p>Freeship từ: <strong>{(setting?.freeShippingFrom || 0).toLocaleString("vi-VN")}đ</strong></p> : null}
              <p>Thanh toán khi nhận hàng • Shop gọi xác nhận trước khi giao</p>
              <p className="text-xs leading-5 text-stone-500">Nếu phí ship thay đổi theo khu vực, shop sẽ báo rõ khi xác nhận đơn.</p>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <span className="rounded-full bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700">Chọn món nhanh, không cần gọi trước</span>
            <span className="rounded-full bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700">Thanh toán khi nhận hàng</span>
            <span className="rounded-full bg-orange-100 px-3 py-2 text-xs font-bold text-orange-700">Có thể ghi chú ít cay / thêm sốt / giờ nhận</span>
          </div>
        </div>
      </section>

      <main id="san-pham" className="mx-auto max-w-7xl px-4 pb-16 sm:px-6">
        {params.order === "empty" ? (
          <div className="mb-5 rounded-3xl bg-red-600 p-4 font-bold text-white shadow-sm sm:p-5">
            Giỏ hàng đang trống. Vui lòng chọn món trước khi tạo đơn.
          </div>
        ) : null}
        {params.order === "invalid" ? (
          <div className="mb-5 rounded-3xl bg-red-600 p-4 font-bold text-white shadow-sm sm:p-5">
            Thông tin đơn hàng không hợp lệ. Vui lòng kiểm tra lại số lượng và thông tin nhận hàng.
          </div>
        ) : null}
        {params.order === "stock" ? (
          <div className="mb-5 rounded-3xl bg-amber-500 p-4 font-bold text-white shadow-sm sm:p-5">
            Một số món trong đơn hiện không đủ số lượng tồn kho. Vui lòng kiểm tra lại giỏ hàng.
          </div>
        ) : null}

        <section className="mb-5 grid gap-3 md:grid-cols-[1.2fr_0.8fr] md:items-stretch">
          <div className="rounded-3xl bg-orange-600 p-5 text-white shadow-lg sm:p-6">
            <div className="flex h-full flex-col justify-between gap-5">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-orange-100">Mở web là chọn món được ngay</p>
                <h2 className="mt-2 text-2xl font-black leading-tight sm:text-3xl">Menu rõ giá, chọn món nhanh, gửi đơn trong vài chạm</h2>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-orange-50 sm:text-base">
                  Thiết kế để khách dễ xem món, thêm vào giỏ, kiểm tra tổng tiền rồi gửi thông tin nhận hàng thật gọn.
                </p>
              </div>

              <div className="grid gap-2 sm:grid-cols-3">
                <div className="rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Rõ ràng</p>
                  <p className="mt-1 text-sm font-bold text-white">Xem giá trước khi gửi đơn</p>
                </div>
                <div className="rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Nhanh gọn</p>
                  <p className="mt-1 text-sm font-bold text-white">Thêm món và kiểm tra giỏ ngay</p>
                </div>
                <div className="rounded-2xl bg-white/14 px-4 py-3 backdrop-blur-sm">
                  <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-100">Yên tâm</p>
                  <p className="mt-1 text-sm font-bold text-white">Shop gọi xác nhận trước khi giao</p>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <a href="#menu" className="inline-flex min-h-11 items-center justify-center rounded-full bg-stone-900 px-5 py-3 text-sm font-extrabold text-white shadow-sm transition hover:bg-stone-800">
                  Chọn món ngay
                </a>
                <a href="#lien-he" className="inline-flex min-h-11 items-center justify-center rounded-full border border-white/45 bg-white/10 px-5 py-3 text-sm font-extrabold text-white transition hover:bg-white/18">
                  Xem thông tin liên hệ
                </a>
              </div>
            </div>
          </div>
          <div id="cach-dat-hang" className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <h3 className="text-lg font-black text-stone-900">Cách đặt hàng</h3>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-600">
              <li>1. Chọn món bạn thích</li>
              <li>2. Kiểm tra giỏ và tổng tiền</li>
              <li>3. Điền thông tin nhận hàng rồi gửi đơn</li>
            </ul>
            <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
              <p className="font-bold text-stone-900">Khách thường quan tâm gì?</p>
              <ul className="mt-2 space-y-1">
                <li>• Shop gọi xác nhận trước khi giao.</li>
                <li>• Thanh toán khi nhận hàng.</li>
                <li>• Có thể ghi chú ít cay, thêm sốt hoặc giờ muốn nhận.</li>
              </ul>
            </div>
          </div>
        </section>


        <section className="mb-6 grid gap-3 md:grid-cols-3">
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-2xl">🥢</p>
            <h3 className="mt-3 font-black text-stone-900">Món rõ giá</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Mỗi món có giá niêm yết, tổng tiền cập nhật ngay trong giỏ trước khi bạn gửi đơn.</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-2xl">🧾</p>
            <h3 className="mt-3 font-black text-stone-900">Gửi đơn không cần thanh toán trước</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Bạn đặt trên web, shop xác nhận lại qua điện thoại/Zalo rồi thanh toán khi nhận hàng.</p>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm">
            <p className="text-2xl">🌶️</p>
            <h3 className="mt-3 font-black text-stone-900">Dễ ghi chú khẩu vị</h3>
            <p className="mt-2 text-sm leading-6 text-stone-600">Có thể dặn ít cay, thêm sốt, giao sau giờ cụ thể hoặc ghi chú món cần đổi nếu hết hàng.</p>
          </div>
        </section>

        {featuredProducts.length ? (
          <section className="mb-6 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Shop gợi ý</p>
                <h2 className="mt-1 text-xl font-black text-stone-900">Món nổi bật đang mở bán</h2>
                <p className="mt-2 text-sm text-stone-600">Một vài món shop chọn sẵn để bạn xem nhanh nếu chưa biết bắt đầu từ đâu.</p>
              </div>
              <Link href="#menu" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Xem menu đầy đủ</Link>
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-3">
              {featuredProducts.map((product) => (
                <div key={product.id} className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-orange-600 px-2.5 py-1 text-[11px] font-bold text-white">Shop chọn</span>
                    <span className="text-xs font-bold text-stone-500">{product.category.name}</span>
                  </div>
                  <p className="mt-3 font-bold text-stone-900">{product.name}</p>
                  <p className="mt-1 text-sm text-stone-600">{product.shortDescription}</p>
                  <p className="mt-3 text-lg font-black text-orange-700">{product.price.toLocaleString("vi-VN")}đ</p>
                  <Link href={`/san-pham/${product.slug}`} className="mt-3 inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Xem chi tiết món</Link>
                </div>
              ))}
            </div>
          </section>
        ) : null}


        <CartClient
          products={products.map((product) => ({
            id: product.id,
            name: product.name,
            slug: product.slug,
            price: product.price,
            shortDescription: product.shortDescription,
            stock: product.stock,
            imageUrl: product.imageUrl,
            category: product.category,
          }))}
          categories={categories.map(({ id, name, slug }) => ({ id, name, slug }))}
          defaultShippingFee={setting?.defaultShippingFee || 0}
          freeShippingFrom={setting?.freeShippingFrom || 0}
          couponCode={setting?.couponCode || null}
          couponDiscountType={setting?.couponDiscountType || "NONE"}
          couponDiscountValue={setting?.couponDiscountValue || 0}
        />


        <section className="mt-6 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Cam kết khi đặt món</p>
            <h2 className="mt-2 text-2xl font-black text-stone-900">Shop ưu tiên rõ ràng trước khi chốt đơn</h2>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
                <p className="font-bold text-stone-900">Không mập mờ tổng tiền</p>
                <p className="mt-1">Bạn xem giá từng món trong giỏ trước khi gửi. Nếu phí ship thay đổi theo khu vực, shop báo lại khi xác nhận.</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
                <p className="font-bold text-stone-900">Nếu món hết sẽ báo trước</p>
                <p className="mt-1">Shop chỉ đổi món khi bạn đồng ý. Không tự ý thay món khác rồi giao.</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
                <p className="font-bold text-stone-900">Dễ ghi chú khẩu vị</p>
                <p className="mt-1">Bạn có thể ghi ít cay, thêm sốt hoặc giờ muốn nhận ngay trong lúc đặt món.</p>
              </div>
              <div className="rounded-2xl bg-orange-50 p-4 text-sm leading-6 text-stone-700">
                <p className="font-bold text-stone-900">Không cần thanh toán trước</p>
                <p className="mt-1">Đơn online được shop xác nhận lại rồi mới giao. Bạn thanh toán khi nhận hàng.</p>
              </div>
            </div>
          </div>
          <div className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Phản hồi khách hay hỏi</p>
            <h2 className="mt-2 text-2xl font-black text-stone-900">Một vài điều khách thường quan tâm</h2>
            <div className="mt-4 space-y-3">
              <div className="rounded-2xl border border-orange-100 p-4">
                <p className="font-bold text-stone-900">“Mình sợ đặt xong mới phát sinh phí.”</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">Website đã hiển thị giá món và phí ship dự kiến. Nếu địa chỉ của bạn làm phí thay đổi, shop sẽ báo rõ trước khi chốt.</p>
              </div>
              <div className="rounded-2xl border border-orange-100 p-4">
                <p className="font-bold text-stone-900">“Mình muốn dặn ít cay hoặc giao sau giờ làm.”</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">Bạn chỉ cần ghi trong ô ghi chú, shop sẽ đọc trước khi xác nhận đơn.</p>
              </div>
              <div className="rounded-2xl border border-orange-100 p-4">
                <p className="font-bold text-stone-900">“Nếu món hết thì sao?”</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">Shop liên hệ lại để bạn đổi món hoặc chốt lại đơn, không tự thay món mà không báo.</p>
              </div>
            </div>
          </div>
        </section>

        {featuredPosts.length ? (
          <section className="mt-6 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
            <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-orange-700">Mẹo chọn món</p>
                <h2 className="mt-1 text-xl font-black text-stone-900">Bài viết mới từ shop</h2>
                <p className="mt-2 text-sm text-stone-600">Xem thêm cách chọn món, bảo quản và mẹo đặt đồ ăn vặt tiện hơn.</p>
              </div>
              <Link href="/blog" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-center text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Xem tất cả bài viết</Link>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-3">
              {featuredPosts.map((post) => (
                <article key={post.id} className="rounded-2xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-orange-700">
                    {post.publishedAt ? post.publishedAt.toLocaleDateString("vi-VN") : "Bài viết mới"} • {post.authorName}
                  </p>
                  <h3 className="mt-3 text-lg font-black leading-snug text-stone-900">{post.title}</h3>
                  <p className="mt-2 line-clamp-3 text-sm leading-6 text-stone-600">{post.excerpt}</p>
                  <Link href={`/blog/${post.slug}`} className="mt-4 inline-flex rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Đọc bài</Link>
                </article>
              ))}
            </div>
          </section>
        ) : null}
      </main>

      <footer id="lien-he" className="border-t border-orange-100 bg-stone-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-[1.3fr_0.8fr_0.9fr]">
          <div>
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-orange-600 text-xl font-black text-white">M</span>
              <div>
                <strong className="block text-lg font-black">{siteName}</strong>
                <span className="text-sm text-orange-200">Đồ ăn vặt ngon - đặt nhanh - giao tận nơi</span>
              </div>
            </div>
            <p className="mt-4 max-w-xl text-sm leading-6 text-stone-300">
              Website bán đồ ăn vặt trực tuyến với menu rõ ràng, giá minh bạch, giỏ hàng dễ dùng và quy trình đặt món nhanh cho khách hàng.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">Liên kết nhanh</h3>
            <div className="mt-4 grid gap-3 text-sm text-stone-300">
              <a className="transition hover:text-white" href="#top">Trang chủ</a>
              <a className="transition hover:text-white" href="#san-pham">Sản phẩm</a>
              <Link className="transition hover:text-white" href="/blog">Blog</Link>
              <a className="transition hover:text-white" href="#cach-dat-hang">Cách đặt hàng</a>
              <a className="transition hover:text-white" href="#lien-he">Liên hệ shop</a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-black uppercase tracking-[0.18em] text-orange-300">Thông tin liên hệ</h3>
            <div className="mt-4 grid gap-3 text-sm leading-6 text-stone-300">
              <p>Hotline: <a className="font-bold text-white" href={`tel:${hotline}`}>{hotline}</a></p>
              <p>Zalo: <a className="font-bold text-white" href={zaloLink}>Nhắn shop</a></p>
              <p>Hỗ trợ: đặt hàng, xác nhận đơn, đổi món khi hết hàng.</p>
              <p>Khi cần gấp, bạn có thể gọi hotline hoặc nhắn Zalo để shop phản hồi nhanh hơn.</p>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-stone-400 sm:px-6">
          © {new Date().getFullYear()} {siteName}. All rights reserved.
        </div>
      </footer>
    </div>
  );
}




