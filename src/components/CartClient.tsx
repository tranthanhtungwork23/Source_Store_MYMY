"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createOrder } from "@/lib/actions";

type Product = {
  id: number;
  name: string;
  slug: string;
  price: number;
  shortDescription: string;
  stock: number;
  imageUrl: string | null;
  category: { id: number; name: string; slug: string };
};

type Category = { id: number; name: string; slug: string };
type CartItem = Product & { quantity: number };

function money(value: number) {
  return value.toLocaleString("vi-VN") + "đ";
}

export function CartClient({
  products,
  categories,
  defaultShippingFee = 0,
  freeShippingFrom = 0,
  couponCode,
  couponDiscountType = "NONE",
  couponDiscountValue = 0,
}: {
  products: Product[];
  categories: Category[];
  defaultShippingFee?: number;
  freeShippingFrom?: number;
  couponCode?: string | null;
  couponDiscountType?: string;
  couponDiscountValue?: number;
}) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [keyword, setKeyword] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [couponInput, setCouponInput] = useState("");
  const [lastAdded, setLastAdded] = useState<string | null>(null);
  const [mobileStep, setMobileStep] = useState<"menu" | "cart">("menu");
  const [mobileCheckoutStep, setMobileCheckoutStep] = useState<"items" | "info">("items");

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const matchKeyword = `${product.name} ${product.shortDescription}`
        .toLowerCase()
        .includes(keyword.trim().toLowerCase());
      const matchCategory = activeCategory === "all" || product.category.slug === activeCategory;
      return matchKeyword && matchCategory;
    });
  }, [products, keyword, activeCategory]);

  const subtotal = useMemo(() => cart.reduce((sum, item) => sum + item.price * item.quantity, 0), [cart]);
  const shippingFee = cart.length ? ((freeShippingFrom > 0 && subtotal >= freeShippingFrom) ? 0 : defaultShippingFee) : 0;
  const isCouponApplied = Boolean(couponCode) && couponInput.trim().toUpperCase() === String(couponCode).trim().toUpperCase();
  const discount = useMemo(() => {
    if (!isCouponApplied) return 0;
    if (couponDiscountType === "PERCENT") return Math.floor((subtotal * couponDiscountValue) / 100);
    if (couponDiscountType === "FIXED") return couponDiscountValue;
    return 0;
  }, [isCouponApplied, couponDiscountType, couponDiscountValue, subtotal]);
  const finalDiscount = Math.max(0, Math.min(discount, subtotal));
  const finalTotal = Math.max(0, subtotal + shippingFee - finalDiscount);
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  function add(product: Product) {
    if (product.stock <= 0) return;
    setCart((current) => {
      const found = current.find((item) => item.id === product.id);
      if (found) return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      return [...current, { ...product, quantity: 1 }];
    });
    setLastAdded(product.name);
    setMobileStep("cart");
    setMobileCheckoutStep("items");
    window.setTimeout(() => setLastAdded(null), 1800);
  }

  function changeQty(id: number, delta: number) {
    setCart((current) => {
      const next = current
        .map((item) => (item.id === id ? { ...item, quantity: Math.max(0, item.quantity + delta) } : item))
        .filter((item) => item.quantity > 0);
      if (next.length === 0) {
        setMobileCheckoutStep("items");
      }
      return next;
    });
  }

  function showCartInfoStep() {
    if (!cart.length) return;
    setMobileStep("cart");
    setMobileCheckoutStep("info");
  }

  return (
    <div suppressHydrationWarning className="pb-28 lg:pb-0">
      <div suppressHydrationWarning className="sticky top-0 z-30 -mx-4 mb-5 bg-[#fff8ef]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div suppressHydrationWarning className="grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-sm">
          <button suppressHydrationWarning
            type="button"
            onClick={() => setMobileStep("menu")}
            className={`rounded-full px-4 py-3 text-sm font-extrabold ${mobileStep === "menu" ? "bg-orange-600 text-white" : "text-stone-600"}`}
          >
            Chọn món
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={() => setMobileStep("cart")}
            className={`rounded-full px-4 py-3 text-sm font-extrabold ${mobileStep === "cart" ? "bg-orange-600 text-white" : "text-stone-600"}`}
          >
            Giỏ hàng ({cartCount})
          </button>
        </div>
      </div>

      <div suppressHydrationWarning className="grid gap-8 lg:grid-cols-[1fr_380px]">
      <section suppressHydrationWarning id="menu" className={mobileStep === "menu" ? "scroll-mt-24 block" : "hidden scroll-mt-24 lg:block"}>
        <div suppressHydrationWarning className="mb-5 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
          <div suppressHydrationWarning className="grid gap-3 md:grid-cols-[1fr_auto]">
            <div suppressHydrationWarning className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Tìm món yêu thích</label>
              <input
                suppressHydrationWarning
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Tìm món ăn vặt..."
                className="w-full rounded-2xl border border-orange-200 p-3"
              />
            </div>
            <div suppressHydrationWarning className="flex flex-wrap gap-2">
              <button type="button" suppressHydrationWarning onClick={() => setActiveCategory("all")} className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === "all" ? "bg-orange-600 text-white" : "border"}`}>
                Tất cả
              </button>
              {categories.map((category) => (
                <button
                  type="button"
                  suppressHydrationWarning
                  key={category.id}
                  onClick={() => setActiveCategory(category.slug)}
                  className={`rounded-full px-4 py-2 text-sm font-bold ${activeCategory === category.slug ? "bg-orange-600 text-white" : "border"}`}
                >
                  {category.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div suppressHydrationWarning className="grid gap-4 md:grid-cols-2 md:gap-5">
          {visibleProducts.map((product) => (
            <article suppressHydrationWarning key={product.id} className="rounded-3xl border border-orange-100 bg-white p-4 shadow-sm sm:p-5">
              <div suppressHydrationWarning className="mb-4 flex h-32 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-orange-100 to-yellow-50 text-5xl sm:h-36">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="h-full w-full object-cover" />
                ) : (
                  <span suppressHydrationWarning>{product.stock > 0 ? "🥢" : "⛔"}</span>
                )}
              </div>
              <div suppressHydrationWarning className="flex items-start justify-between gap-4">
                <div suppressHydrationWarning>
                  <span suppressHydrationWarning className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-700">{product.category.name}</span>
                  <h3 className="mt-3 text-xl font-bold text-stone-900">{product.name}</h3>
                </div>
                {product.stock <= 0 ? <span suppressHydrationWarning className="rounded-full bg-stone-900 px-3 py-1 text-xs font-bold text-white">Hết hàng</span> : null}
              </div>
              <p suppressHydrationWarning className="mt-2 min-h-12 text-sm leading-6 text-stone-600">{product.shortDescription}</p>
              <p suppressHydrationWarning className="mt-2 text-xs text-stone-500">Phù hợp ăn vặt tại nhà • Giao nhanh trong ngày</p>
              <div suppressHydrationWarning className="mt-4 space-y-3">
                <strong className="block text-lg text-orange-700">{money(product.price)}</strong>
                <div suppressHydrationWarning className="grid gap-2 sm:grid-cols-2">
                  <Link href={`/san-pham/${product.slug}`} className="rounded-full border px-4 py-3 text-center text-sm font-bold">
                    Xem chi tiết
                  </Link>
                  <button suppressHydrationWarning
                    type="button"
                    onClick={() => add(product)}
                    disabled={product.stock <= 0}
                    className="rounded-full bg-orange-600 px-4 py-3 text-sm font-bold text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {cart.some((item) => item.id === product.id) ? "Thêm nữa" : "Thêm giỏ"}
                  </button>
                </div>
              </div>
              <p suppressHydrationWarning className="mt-2 text-xs text-stone-500">Tồn kho: {product.stock}</p>
            </article>
          ))}
          {visibleProducts.length === 0 ? (
            <div suppressHydrationWarning className="rounded-3xl bg-white p-6 text-stone-500 shadow-sm md:col-span-2">Không tìm thấy sản phẩm phù hợp.</div>
          ) : null}
        </div>
      </section>

      <aside suppressHydrationWarning className={`${mobileStep === "cart" ? "block" : "hidden lg:block"} h-fit rounded-3xl border border-orange-100 bg-white p-4 shadow-lg sm:p-6 lg:sticky lg:top-6`}>
        <div suppressHydrationWarning className="flex items-center justify-between">
          <h2 className="text-2xl font-extrabold text-stone-900">Giỏ hàng</h2>
          <span suppressHydrationWarning className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">{cartCount} món</span>
        </div>
        <div suppressHydrationWarning className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-orange-50 p-1 lg:hidden">
          <button suppressHydrationWarning
            type="button"
            onClick={() => setMobileCheckoutStep("items")}
            className={`rounded-xl px-3 py-2 text-sm font-extrabold ${mobileCheckoutStep === "items" ? "bg-white text-orange-700 shadow-sm" : "text-stone-600"}`}
          >
            1. Kiểm tra món
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={showCartInfoStep}
            disabled={!cart.length}
            className={`rounded-xl px-3 py-2 text-sm font-extrabold disabled:opacity-40 ${mobileCheckoutStep === "info" ? "bg-white text-orange-700 shadow-sm" : "text-stone-600"}`}
          >
            2. Nhận hàng
          </button>
        </div>

        {!cart.length ? (
          <div suppressHydrationWarning className="mt-4 rounded-2xl bg-orange-50 p-4 text-stone-700">
            <p suppressHydrationWarning className="font-bold text-stone-900">Giỏ hàng đang trống</p>
            <p suppressHydrationWarning className="mt-1 text-sm">Hãy quay lại chọn món, sau đó thông tin nhận hàng mới hiện ra để tránh form dài gây rối trên điện thoại.</p>
            <button suppressHydrationWarning type="button" onClick={() => setMobileStep("menu")} className="mt-3 rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white lg:hidden">
              Chọn món ngay
            </button>
          </div>
        ) : null}
        <div suppressHydrationWarning className={`${mobileCheckoutStep === "items" ? "block" : "hidden lg:block"} mt-4 space-y-3`}>
          {cart.map((item) => (
            <div suppressHydrationWarning key={item.id} className="rounded-2xl bg-orange-50 p-3">
              <div suppressHydrationWarning className="flex justify-between gap-3">
                <strong>{item.name}</strong>
                <span suppressHydrationWarning>{money(item.price * item.quantity)}</span>
              </div>
              <div suppressHydrationWarning className="mt-2 flex items-center gap-2">
                <button suppressHydrationWarning type="button" onClick={() => changeQty(item.id, -1)} className="rounded-full border px-3 py-1">-</button>
                <span suppressHydrationWarning className="min-w-6 text-center font-bold">{item.quantity}</span>
                <button suppressHydrationWarning type="button" onClick={() => changeQty(item.id, 1)} className="rounded-full border px-3 py-1">+</button>
                <button suppressHydrationWarning type="button" onClick={() => changeQty(item.id, -item.quantity)} className="ml-auto text-sm font-bold text-red-600">
                  Xóa
                </button>
              </div>
            </div>
          ))}
        </div>

        {cart.length && mobileCheckoutStep === "items" ? (
          <button suppressHydrationWarning
            type="button"
            onClick={showCartInfoStep}
            className="mt-4 w-full rounded-full bg-stone-900 px-5 py-3 font-extrabold text-white lg:hidden"
          >
            Tiếp tục nhập thông tin nhận hàng
          </button>
        ) : null}

        <div suppressHydrationWarning className={mobileCheckoutStep === "info" ? "mt-5 rounded-2xl bg-stone-50 p-4 text-sm text-stone-600 block" : "mt-5 hidden rounded-2xl bg-stone-50 p-4 text-sm text-stone-600 lg:block"}>
          <p suppressHydrationWarning className="font-bold text-stone-900">Lưu ý đặt hàng</p>
          <ul suppressHydrationWarning className="mt-2 space-y-1">
            <li suppressHydrationWarning>• Shop sẽ gọi xác nhận đơn sau khi bạn gửi.</li>
            <li suppressHydrationWarning>• Thanh toán khi nhận hàng (COD).</li>
            <li suppressHydrationWarning>• Bạn có thể ghi mức cay hoặc yêu cầu riêng ở ô ghi chú.</li>
          </ul>
        </div>

        {couponCode ? (
          <div suppressHydrationWarning className={mobileCheckoutStep === "info" ? "mt-5 rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-4 text-sm block" : "mt-5 hidden rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-4 text-sm lg:block"}>
            <p suppressHydrationWarning className="font-bold text-orange-700">Mã khuyến mãi đang mở</p>
            <input
              suppressHydrationWarning
              value={couponInput}
              onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
              placeholder="Nhập mã coupon"
              className="mt-3 w-full rounded-xl border p-3"
            />
            <p suppressHydrationWarning className="mt-2 text-xs text-stone-500">
              {isCouponApplied ? "Coupon hợp lệ và sẽ được áp dụng khi tạo đơn." : "Nhập đúng mã để được giảm giá."}
            </p>
          </div>
        ) : null}

        <div suppressHydrationWarning className={mobileCheckoutStep === "info" ? "mt-5 space-y-2 border-t pt-4 text-sm block" : "mt-5 hidden space-y-2 border-t pt-4 text-sm lg:block"}>
          <div suppressHydrationWarning className="flex justify-between">
            <span suppressHydrationWarning>Tạm tính</span>
            <span suppressHydrationWarning>{money(subtotal)}</span>
          </div>
          <div suppressHydrationWarning className="flex justify-between">
            <span suppressHydrationWarning>Phí ship</span>
            <span suppressHydrationWarning>{money(shippingFee)}</span>
          </div>
          {freeShippingFrom > 0 ? (
            <div suppressHydrationWarning className="text-xs text-green-700">
              {subtotal >= freeShippingFrom ? `Đơn này đủ điều kiện freeship từ ${money(freeShippingFrom)}.` : `Freeship cho đơn từ ${money(freeShippingFrom)}.`}
            </div>
          ) : null}
          {finalDiscount > 0 ? (
            <div suppressHydrationWarning className="flex justify-between text-green-700">
              <span suppressHydrationWarning>Giảm giá</span>
              <span suppressHydrationWarning>-{money(finalDiscount)}</span>
            </div>
          ) : null}
          <div suppressHydrationWarning className="flex justify-between text-lg font-bold">
            <span suppressHydrationWarning>Tổng</span>
            <span suppressHydrationWarning>{money(finalTotal)}</span>
          </div>
        </div>

        {lastAdded ? (
          <div suppressHydrationWarning className="mt-4 rounded-2xl bg-green-600 p-3 text-sm font-bold text-white">Đã thêm {lastAdded} vào giỏ.</div>
        ) : null}

        <form suppressHydrationWarning action={createOrder} className={`${mobileCheckoutStep === "info" ? "block" : "hidden lg:block"} mt-5 space-y-3`}>
          <input suppressHydrationWarning type="hidden" name="items" value={JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity })))} />
          <input suppressHydrationWarning type="hidden" name="couponCode" value={couponInput} />
          <div suppressHydrationWarning className="rounded-2xl bg-orange-50 p-3 text-sm text-stone-700 lg:hidden">
            <p suppressHydrationWarning className="font-bold text-stone-900">Bước 2: Nhập thông tin nhận hàng</p>
            <p suppressHydrationWarning className="mt-1">Shop sẽ dùng số điện thoại để xác nhận đơn trước khi giao.</p>
          </div>
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
          {!cart.length ? <p suppressHydrationWarning className="text-sm font-medium text-orange-700">Vui lòng thêm ít nhất 1 món vào giỏ để đặt hàng.</p> : null}
          <div suppressHydrationWarning className="grid gap-2 lg:block">
            <button suppressHydrationWarning type="button" onClick={() => setMobileCheckoutStep("items")} className="rounded-full border border-orange-200 px-5 py-3 font-bold text-orange-700 lg:hidden">
              Quay lại kiểm tra món
            </button>
            <button suppressHydrationWarning disabled={!cart.length} className="w-full rounded-full bg-stone-900 px-5 py-3 font-bold text-white disabled:opacity-40">
              Gửi đơn cho shop
            </button>
          </div>
        </form>
      </aside>
      </div>

      <div suppressHydrationWarning className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div suppressHydrationWarning className="mx-auto flex max-w-7xl items-center gap-3">
          <div suppressHydrationWarning className="min-w-0 flex-1">
            <p suppressHydrationWarning className="text-xs font-bold uppercase tracking-wide text-stone-500">Tổng đơn</p>
            <p suppressHydrationWarning className="text-lg font-black text-orange-700">{money(finalTotal)}</p>
          </div>
          {mobileStep === "menu" ? (
            <button suppressHydrationWarning
              type="button"
              onClick={() => setMobileStep("cart")}
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-extrabold text-white"
            >
              Xem giỏ ({cartCount})
            </button>
          ) : mobileCheckoutStep === "items" && cart.length ? (
            <button suppressHydrationWarning
              type="button"
              onClick={showCartInfoStep}
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-extrabold text-white"
            >
              Nhập thông tin
            </button>
          ) : (
            <button suppressHydrationWarning
              type="button"
              onClick={() => {
                setMobileStep("menu");
                setMobileCheckoutStep("items");
              }}
              className="rounded-full bg-orange-600 px-5 py-3 text-sm font-extrabold text-white"
            >
              Chọn thêm món
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
