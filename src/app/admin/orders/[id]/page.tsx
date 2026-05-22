import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/actions";
import { prisma } from "@/lib/db";

const statuses = ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

function money(value: number | null | undefined) {
  return (value || 0).toLocaleString("vi-VN") + "đ";
}

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  const { id } = await params;
  const order = await prisma.order.findUnique({
    where: { id: Number(id) },
    include: { items: { include: { product: true } } },
  });

  if (!order) notFound();

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div suppressHydrationWarning className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section suppressHydrationWarning className="space-y-6">
          <Link href="/admin/orders" className="text-sm font-bold text-orange-700">← Quay lại đơn hàng</Link>
          <div suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
            <div suppressHydrationWarning className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
              <div suppressHydrationWarning>
                <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">Chi tiết đơn hàng</p>
                <h1 className="mt-2 text-3xl font-black sm:text-4xl">#{order.code}</h1>
                <p suppressHydrationWarning className="mt-2 text-stone-500">Tạo lúc: {order.createdAt.toLocaleString("vi-VN")}</p>
              </div>
              <div suppressHydrationWarning className="flex flex-wrap gap-3">
                <form suppressHydrationWarning action={updateOrderStatus} className="grid gap-3 sm:flex">
                  <input suppressHydrationWarning type="hidden" name="id" value={order.id} />
                  <select suppressHydrationWarning name="status" defaultValue={order.status} className="rounded-xl border p-3">
                    {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                  </select>
                  <button suppressHydrationWarning className="rounded-full bg-stone-900 px-5 py-3 text-center font-bold text-white">Cập nhật</button>
                </form>
                <Link href={`/admin/orders/${order.id}/print`} className="rounded-full border px-5 py-3 text-center font-bold">In đơn</Link>
              </div>
            </div>
          </div>

          <div suppressHydrationWarning className="grid gap-6 lg:grid-cols-[1fr_360px]">
            <div suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
              <h2 className="text-xl font-bold sm:text-2xl">Sản phẩm trong đơn</h2>
              <div suppressHydrationWarning className="mt-4 overflow-x-auto rounded-2xl border">
                <table className="min-w-[640px] text-sm">
                  <thead className="bg-stone-900 text-white">
                    <tr>
                      <th className="px-4 py-3 text-left">Sản phẩm</th>
                      <th className="px-4 py-3 text-left">SL</th>
                      <th className="px-4 py-3 text-left">Đơn giá</th>
                      <th className="px-4 py-3 text-left">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.items.map((item) => (
                      <tr key={item.id} className="border-t">
                        <td className="px-4 py-3 font-semibold">{item.productNameSnapshot}</td>
                        <td className="px-4 py-3">{item.quantity}</td>
                        <td className="px-4 py-3">{money(item.priceSnapshot)}</td>
                        <td className="px-4 py-3">{money(item.lineTotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <aside suppressHydrationWarning className="space-y-6">
              <div suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold sm:text-2xl">Khách hàng</h2>
                <div suppressHydrationWarning className="mt-4 space-y-2 text-sm text-stone-700">
                  <p suppressHydrationWarning><strong>Tên:</strong> {order.customerName}</p>
                  <p suppressHydrationWarning><strong>Điện thoại:</strong> {order.phone}</p>
                  <p suppressHydrationWarning><strong>Địa chỉ:</strong> {order.address}</p>
                  {order.note ? <p suppressHydrationWarning><strong>Ghi chú:</strong> {order.note}</p> : null}
                </div>
              </div>

              <div suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-xl font-bold sm:text-2xl">Thanh toán</h2>
                <div suppressHydrationWarning className="mt-4 space-y-2 text-sm">
                  <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Tạm tính</span><span suppressHydrationWarning>{money(order.subtotal)}</span></div>
                  <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Phí ship</span><span suppressHydrationWarning>{money(order.shippingFee)}</span></div>
                  <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Giảm giá</span><span suppressHydrationWarning>-{money(order.discount)}</span></div>
                  {order.couponCode ? <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Coupon</span><span suppressHydrationWarning>{order.couponCode}</span></div> : null}
                  <div suppressHydrationWarning className="flex justify-between border-t pt-3 text-lg font-black text-orange-700"><span suppressHydrationWarning>Tổng</span><span suppressHydrationWarning>{money(order.total)}</span></div>
                </div>
              </div>
            </aside>
          </div>
        </section>
      </div>
    </main>
  );
}
