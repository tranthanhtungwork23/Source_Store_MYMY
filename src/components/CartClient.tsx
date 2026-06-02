"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { createOrder } from "@/lib/actions";
import { ProductFallbackVisual } from "@/components/ProductFallbackVisual";

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
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
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
      if (found) {
        if (found.quantity >= product.stock) return current;
        return current.map((item) => (item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item));
      }
      return [...current, { ...product, quantity: 1 }];
    });
    setLastAdded(product.name);
    setMobileCheckoutStep("items");
    window.setTimeout(() => setLastAdded(null), 1800);
  }

  function changeQty(id: number, delta: number) {
    setCart((current) => {
      const next = current
        .map((item) => {
          if (item.id !== id) return item;
          const maxQty = item.stock > 0 ? item.stock : item.quantity;
          return { ...item, quantity: Math.min(maxQty, Math.max(0, item.quantity + delta)) };
        })
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
    setIsCartSheetOpen(true);
    setMobileCheckoutStep("info");
  }

  function openCartSheet() {
    setMobileStep("cart");
    setIsCartSheetOpen(true);
    setMobileCheckoutStep("items");
  }

  function closeCartSheet() {
    setIsCartSheetOpen(false);
    setMobileStep("menu");
    setMobileCheckoutStep("items");
  }

  return (
    <div className="pb-28 lg:pb-0">
      <div className="sticky top-0 z-30 -mx-4 mb-4 bg-[#fff8ef]/95 px-4 py-3 backdrop-blur lg:hidden">
        <div className="grid grid-cols-2 gap-2 rounded-full bg-white p-1 shadow-sm">
          <button suppressHydrationWarning
            type="button"
            onClick={() => setMobileStep("menu")}
            className={`rounded-full px-4 py-3 text-sm font-extrabold ${mobileStep === "menu" ? "bg-orange-600 text-white" : "text-stone-600"}`}
          >
            Chọn món
          </button>
          <button suppressHydrationWarning
            type="button"
            onClick={openCartSheet}
            className={`rounded-full px-4 py-3 text-sm font-extrabold ${mobileStep === "cart" ? "bg-orange-600 text-white" : "text-stone-600"}`}
          >
            Giỏ ({cartCount})
          </button>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <section id="menu" className={mobileStep === "menu" ? "scroll-mt-24 block" : "hidden scroll-mt-24 lg:block"}>
          <div className="mb-4 rounded-3xl bg-white p-4 shadow-sm sm:p-5">
            <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
              <div className="space-y-2">
                <label className="text-sm font-bold text-stone-700">Tìm món yêu thích</label>
                <input suppressHydrationWarning
                  value={keyword}
                  onChange={(event) => setKeyword(event.target.value)}
                  placeholder="Tìm bánh tráng, đậu phộng, trà tắc..."
                  className="w-full rounded-2xl border border-orange-200 bg-orange-50/40 p-3 outline-none transition focus:border-orange-500 focus:bg-white"
                />
              </div>
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 md:mx-0 md:flex-wrap md:px-0 md:pb-0">
                <button suppressHydrationWarning type="button" onClick={() => setActiveCategory("all")} className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeCategory === "all" ? "bg-orange-600 text-white" : "border bg-white"}`}>
                  Tất cả
                </button>
                {categories.map((category) => (
                  <button suppressHydrationWarning
                    type="button"
                    key={category.id}
                    onClick={() => setActiveCategory(category.slug)}
                    className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold ${activeCategory === category.slug ? "bg-orange-600 text-white" : "border bg-white"}`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-3 sm:gap-4 md:grid-cols-2 md:gap-5">
            {visibleProducts.map((product) => {
              const cartItem = cart.find((item) => item.id === product.id);
              return (
                <article key={product.id} className="overflow-hidden rounded-3xl border border-orange-100 bg-white shadow-sm">
                  <div className="grid grid-cols-[96px_1fr] gap-3 p-3 sm:block sm:p-5">
                    <div className="mx-auto flex aspect-square w-24 flex-none items-center justify-center overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-orange-50 to-yellow-50 text-3xl sm:mb-4 sm:w-[82%] sm:text-4xl md:w-[76%]">
                      {product.imageUrl ? (
                        <img src={product.imageUrl} alt={product.name} className="h-full w-full object-contain p-2" />
                      ) : product.stock > 0 ? (
                        <ProductFallbackVisual name={product.name} categoryName={product.category.name} compact />
                      ) : (
                        <span>{"⛔"}</span>
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <span className="rounded-full bg-orange-100 px-2.5 py-1 text-[11px] font-bold text-orange-700 sm:px-3 sm:text-xs">{product.category.name}</span>
                          <h3 className="mt-2 text-base font-black leading-snug text-stone-900 sm:text-xl">{product.name}</h3>
                        </div>
                        {product.stock <= 0 ? <span className="shrink-0 rounded-full bg-stone-900 px-2 py-1 text-[10px] font-bold text-white">Hết</span> : null}
                      </div>
                      <p className="mt-2 line-clamp-2 text-xs leading-5 text-stone-600 sm:min-h-12 sm:text-sm sm:leading-6">{product.shortDescription}</p>
                      <p className="mt-1 hidden text-xs text-stone-500 sm:block">Giao nhanh trong ngày • Có thể ghi chú mức cay</p>
                      <div className="mt-3 flex items-center justify-between gap-3 sm:mt-4 sm:block sm:space-y-3">
                        <strong className="text-lg font-black text-orange-700 sm:block">{money(product.price)}</strong>
                        {lastAdded === product.name ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-black text-green-700 sm:inline-flex">Đã thêm ✓</span>
                        ) : null}
                        {cartItem ? (
                          <div className="flex items-center rounded-full border border-orange-200 bg-orange-50 p-1">
                            <button suppressHydrationWarning type="button" onClick={() => changeQty(product.id, -1)} className="h-9 w-9 rounded-full bg-white font-black text-orange-700 shadow-sm">-</button>
                            <span className="min-w-8 text-center text-sm font-black">{cartItem.quantity}</span>
                            <button suppressHydrationWarning type="button" onClick={() => changeQty(product.id, 1)} className="h-9 w-9 rounded-full bg-orange-600 font-black text-white shadow-sm">+</button>
                          </div>
                        ) : null}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-[0.8fr_1.2fr] gap-2 border-t border-orange-50 p-3 sm:p-4">
                    <Link href={`/san-pham/${product.slug}`} className="rounded-full border border-stone-300 bg-white px-3 py-3 text-center text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">
                      Xem món
                    </Link>
                    <button suppressHydrationWarning
                      type="button"
                      onClick={() => add(product)}
                      disabled={product.stock <= 0 || Boolean(cartItem && cartItem.quantity >= product.stock)}
                      className="rounded-full bg-orange-600 px-3 py-3 text-sm font-black text-white hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      {product.stock <= 0 ? "Hết hàng" : cartItem && cartItem.quantity >= product.stock ? "Đã hết tồn" : cartItem ? "Thêm 1 món" : "Thêm vào giỏ"}
                    </button>
                  </div>
                </article>
              );
            })}
            {visibleProducts.length === 0 ? (
              <div className="rounded-3xl bg-white p-6 text-stone-500 shadow-sm md:col-span-2">Không tìm thấy sản phẩm phù hợp.</div>
            ) : null}
          </div>
        </section>

        <aside className={`${isCartSheetOpen ? "fixed inset-x-0 bottom-0 z-50 max-h-[88vh] overflow-y-auto rounded-t-[2rem]" : mobileStep === "cart" ? "block" : "hidden"} h-fit border border-orange-100 bg-white p-4 shadow-2xl sm:p-6 lg:sticky lg:top-6 lg:block lg:max-h-none lg:overflow-visible lg:rounded-[2rem] lg:shadow-lg`}>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-orange-700">Đơn của bạn</p>
              <h2 className="text-2xl font-extrabold text-stone-900">Giỏ hàng</h2>
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-orange-600 px-3 py-1 text-sm font-bold text-white">{cartCount} món</span>
              <button suppressHydrationWarning type="button" onClick={closeCartSheet} className="rounded-full border border-orange-100 px-3 py-1 text-sm font-black text-stone-600 lg:hidden">
                Đóng
              </button>
            </div>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 rounded-2xl bg-orange-50 p-1 lg:hidden">
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
            <div className="mt-4 rounded-2xl bg-orange-50 p-4 text-stone-700">
              <p className="font-bold text-stone-900">Bạn chưa chọn món nào</p>
              <p className="mt-1 text-sm">Bấm “Thêm vào giỏ” ở món bạn thích. Giỏ hàng và tổng tiền sẽ cập nhật ngay.</p>
              <button suppressHydrationWarning type="button" onClick={closeCartSheet} className="mt-3 rounded-full bg-orange-600 px-4 py-2 text-sm font-bold text-white lg:hidden">
                Chọn món ngay
              </button>
            </div>
          ) : null}
          <div className={`${mobileCheckoutStep === "items" ? "block" : "hidden lg:block"} mt-4 space-y-3`}>
            {cart.map((item) => (
              <div key={item.id} className="rounded-2xl bg-orange-50 p-3">
                <div className="flex justify-between gap-3">
                  <strong className="leading-snug">{item.name}</strong>
                  <span className="shrink-0 font-bold text-orange-700">{money(item.price * item.quantity)}</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <button suppressHydrationWarning type="button" onClick={() => changeQty(item.id, -1)} className="h-9 w-9 rounded-full bg-white font-black text-orange-700 shadow-sm">-</button>
                  <span className="min-w-8 text-center font-black">{item.quantity}</span>
                  <button suppressHydrationWarning type="button" onClick={() => changeQty(item.id, 1)} className="h-9 w-9 rounded-full bg-orange-600 font-black text-white shadow-sm">+</button>
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
              Nhập thông tin nhận hàng
            </button>
          ) : null}

          {couponCode ? (
            <div className={mobileCheckoutStep === "info" ? "mt-5 rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-4 text-sm block" : "mt-5 hidden rounded-2xl border border-dashed border-orange-300 bg-orange-50 p-4 text-sm lg:block"}>
              <p className="font-bold text-orange-700">Mã khuyến mãi đang mở</p>
              <input suppressHydrationWarning
                value={couponInput}
                onChange={(event) => setCouponInput(event.target.value.toUpperCase())}
                placeholder="Nhập mã coupon"
                className="mt-3 w-full rounded-xl border p-3"
              />
              <p className="mt-2 text-xs text-stone-500">
                {isCouponApplied ? "Coupon hợp lệ và sẽ được áp dụng khi tạo đơn." : "Nhập đúng mã để được giảm giá."}
              </p>
            </div>
          ) : null}

          <div className={mobileCheckoutStep === "info" ? "mt-5 space-y-2 border-t pt-4 text-sm block" : "mt-5 hidden space-y-2 border-t pt-4 text-sm lg:block"}>
            <div className="flex justify-between">
              <span>Tạm tính</span>
              <span>{money(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Phí ship</span>
              <span>{money(shippingFee)}</span>
            </div>
            {freeShippingFrom > 0 ? (
              <div className="text-xs text-green-700">
                {subtotal >= freeShippingFrom ? `Đơn này đủ điều kiện freeship từ ${money(freeShippingFrom)}.` : `Freeship cho đơn từ ${money(freeShippingFrom)}.`}
              </div>
            ) : null}
            {finalDiscount > 0 ? (
              <div className="flex justify-between text-green-700">
                <span>Giảm giá</span>
                <span>-{money(finalDiscount)}</span>
              </div>
            ) : null}
            <div className="flex justify-between text-lg font-bold">
              <span>Tổng</span>
              <span>{money(finalTotal)}</span>
            </div>
          </div>

          {lastAdded ? (
            <div className="mt-4 rounded-2xl bg-green-600 p-3 text-sm font-bold text-white">Đã thêm {lastAdded} vào giỏ.</div>
          ) : null}

          <form action={createOrder} className={`${mobileCheckoutStep === "info" ? "block" : "hidden lg:block"} mt-5 space-y-3`}>
            <input suppressHydrationWarning type="hidden" name="items" value={JSON.stringify(cart.map(({ id, quantity }) => ({ id, quantity })))} />
            <input suppressHydrationWarning type="hidden" name="couponCode" value={couponInput} />
            <div className="rounded-2xl bg-orange-50 p-3 text-sm text-stone-700 lg:hidden">
              <p className="font-bold text-stone-900">Bước cuối: thông tin nhận hàng</p>
              <p className="mt-1">Chỉ cần tên, số điện thoại và địa chỉ. Shop sẽ gọi xác nhận trước khi giao.</p>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Tên khách hàng</label>
              <input suppressHydrationWarning name="customerName" required placeholder="Ví dụ: Nguyễn Văn A" className="w-full rounded-xl border p-3 outline-none focus:border-orange-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Số điện thoại</label>
              <input suppressHydrationWarning name="phone" required placeholder="Ví dụ: 09xxxxxxxx" className="w-full rounded-xl border p-3 outline-none focus:border-orange-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Địa chỉ giao hàng</label>
              <input suppressHydrationWarning name="address" required placeholder="Số nhà, đường, phường/xã, quận/huyện..." className="w-full rounded-xl border p-3 outline-none focus:border-orange-500" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-stone-700">Ghi chú thêm</label>
              <textarea suppressHydrationWarning name="note" placeholder="Ít cay, thêm sốt, giao sau 18h..." className="min-h-24 w-full rounded-xl border p-3 outline-none focus:border-orange-500" />
            </div>
            <div className="rounded-2xl bg-stone-50 p-4 text-sm text-stone-600">
              <p className="font-bold text-stone-900">Lưu ý đặt hàng</p>
              <ul className="mt-2 space-y-1">
                <li>• Shop sẽ gọi xác nhận đơn sau khi bạn gửi.</li>
                <li>• Thanh toán khi nhận hàng (COD).</li>
                <li>• Bạn có thể ghi mức cay hoặc yêu cầu riêng ở ô ghi chú.</li>
                <li>• Nếu cần đổi món do hết hàng, shop sẽ báo lại trước khi chốt đơn.</li>
              </ul>
            </div>
            {cart.length ? (
              <div className="rounded-2xl border border-green-200 bg-green-50 p-4 text-sm text-green-800">
                <p className="font-bold text-green-900">Trước khi gửi đơn</p>
                <ul className="mt-2 space-y-1">
                  <li>• Kiểm tra lại số lượng từng món trong giỏ.</li>
                  <li>• Điền số điện thoại để shop dễ xác nhận nhanh.</li>
                  <li>• Nếu bạn cần giao theo giờ, hãy ghi rõ ở ô ghi chú.</li>
                </ul>
              </div>
            ) : null}
            {!cart.length ? (
              <div className="rounded-2xl border border-orange-200 bg-orange-50 px-4 py-3 text-sm font-medium text-orange-800">
                Bạn cần thêm ít nhất 1 món vào giỏ trước khi gửi đơn.
              </div>
            ) : null}
            <div className="grid gap-2 lg:block">
              <button suppressHydrationWarning type="button" onClick={() => setMobileCheckoutStep("items")} className="rounded-full border border-orange-200 px-5 py-3 font-bold text-orange-700 lg:hidden">
                Quay lại kiểm tra món
              </button>
              <button suppressHydrationWarning disabled={!cart.length} className="w-full rounded-full bg-stone-900 px-5 py-3 font-bold text-white disabled:opacity-40">
                Đặt món ngay
              </button>
            </div>
          </form>
        </aside>
      </div>

      {isCartSheetOpen ? <button suppressHydrationWarning type="button" aria-label="Đóng giỏ hàng" onClick={closeCartSheet} className="fixed inset-0 z-40 bg-black/35 lg:hidden" /> : null}

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-orange-100 bg-white/95 p-3 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-7xl items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-wide text-stone-500">{cartCount ? `${cartCount} món trong giỏ` : "Chưa có món"}</p>
            <p className="text-lg font-black text-orange-700">{money(finalTotal)}</p>
          </div>
          {mobileStep === "menu" ? (
            <button suppressHydrationWarning
              type="button"
              onClick={openCartSheet}
              className="rounded-full bg-stone-900 px-5 py-3 text-sm font-extrabold text-white"
            >
              {cartCount ? "Đặt món" : "Xem giỏ"}
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
