import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { createManualOrder } from "@/lib/actions";
import { prisma } from "@/lib/db";

const statuses = ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

export default async function NewOrderPage() {
  const admin = await requireAdmin();
  const [products, setting] = await Promise.all([
    prisma.product.findMany({ where: { isActive: true }, orderBy: { name: "asc" } }),
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
  ]);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div suppressHydrationWarning className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section suppressHydrationWarning>
          <Link href="/admin/orders" className="text-sm font-bold text-orange-700">← Quay lại đơn hàng</Link>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">Tạo đơn thủ công</h1>
          <p suppressHydrationWarning className="mt-2 text-stone-600">Dùng khi khách đặt qua inbox, điện thoại hoặc cửa hàng.</p>

          <form suppressHydrationWarning action={createManualOrder} className="mt-6 grid gap-6 rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <div suppressHydrationWarning className="grid gap-4 md:grid-cols-2">
              <input suppressHydrationWarning name="customerName" required placeholder="Tên khách hàng" className="rounded-xl border p-3" />
              <input suppressHydrationWarning name="phone" placeholder="Số điện thoại" className="rounded-xl border p-3" />
              <input suppressHydrationWarning name="address" placeholder="Địa chỉ giao hàng" className="rounded-xl border p-3 md:col-span-2" />
              <textarea suppressHydrationWarning name="note" placeholder="Ghi chú" className="rounded-xl border p-3 md:col-span-2" />
            </div>

            <div suppressHydrationWarning className="rounded-2xl border p-4">
              <h2 className="text-xl font-bold">Sản phẩm</h2>
              <p suppressHydrationWarning className="mt-1 text-sm text-stone-500">MVP hỗ trợ tối đa 5 dòng sản phẩm trong một đơn thủ công.</p>
              <div suppressHydrationWarning className="mt-4 space-y-3">
                {[0, 1, 2, 3, 4].map((row) => (
                  <div suppressHydrationWarning key={row} className="grid gap-3 md:grid-cols-[1fr_120px]">
                    <select suppressHydrationWarning name="productId" className="rounded-xl border p-3">
                      <option value="">-- Chọn sản phẩm --</option>
                      {products.map((product) => (
                        <option key={product.id} value={product.id}>{product.name} - {product.price.toLocaleString("vi-VN")}đ</option>
                      ))}
                    </select>
                    <input suppressHydrationWarning name="quantity" type="number" min="1" defaultValue={row === 0 ? 1 : ""} placeholder="SL" className="rounded-xl border p-3" />
                  </div>
                ))}
              </div>
            </div>

            <div suppressHydrationWarning className="grid gap-4 md:grid-cols-3">
              <label className="space-y-2">
                <span suppressHydrationWarning className="font-bold">Phí ship</span>
                <input suppressHydrationWarning name="shippingFee" type="number" defaultValue={setting?.defaultShippingFee || 0} className="w-full rounded-xl border p-3" />
              </label>
              <label className="space-y-2">
                <span suppressHydrationWarning className="font-bold">Mã coupon</span>
                <input suppressHydrationWarning name="couponCode" placeholder={setting?.couponCode || "Không có mã"} className="w-full rounded-xl border p-3" />
              </label>
              <label className="space-y-2">
                <span suppressHydrationWarning className="font-bold">Trạng thái</span>
                <select suppressHydrationWarning name="status" defaultValue="NEW" className="w-full rounded-xl border p-3">
                  {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                </select>
              </label>
            </div>

            <button suppressHydrationWarning className="rounded-full bg-orange-600 px-5 py-3 text-center font-bold text-white">Tạo đơn</button>
          </form>
        </section>
      </div>
    </main>
  );
}
