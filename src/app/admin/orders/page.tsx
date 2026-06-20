import Link from "next/link";
import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { updateOrderStatus } from "@/lib/actions";
import { prisma } from "@/lib/db";

const statuses = ["NEW", "CONFIRMED", "SHIPPING", "COMPLETED", "CANCELLED"];

function money(value: number | null | undefined) {
  return (value || 0).toLocaleString("vi-VN") + "đ";
}

export default async function OrdersPage() {
  const admin = await requireAdmin();
  const orders = await prisma.order.findMany({ include: { items: true }, orderBy: { createdAt: "desc" } });

  return (
    <main className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section>
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <h1 className="text-3xl font-black sm:text-4xl">Quản lý đơn hàng</h1>
            <Link href="/admin/orders/new" className="rounded-full bg-orange-600 px-5 py-3 text-center font-bold text-white">Tạo đơn thủ công</Link>
          </div>
          <div className="mt-6 space-y-4">
            {orders.length === 0 ? <p className="rounded-3xl bg-white p-6">Chưa có đơn hàng.</p> : null}
            {orders.map((order) => (
              <article key={order.id} className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div>
                    <h2 className="text-lg font-bold sm:text-xl">#{order.code} - {order.customerName}</h2>
                    <p className="mt-1 text-sm leading-6 text-stone-600">{order.phone} • {order.address}</p>
                    {order.note ? <p className="mt-1 text-sm text-stone-500">Ghi chú: {order.note}</p> : null}
                    <p className="mt-2 text-xs leading-5 text-stone-500">Tạm tính: {money(order.subtotal)} • Ship: {money(order.shippingFee)} • Giảm: {money(order.discount)}</p>
                  </div>
                  <strong className="text-lg text-orange-700 sm:text-xl">{order.total.toLocaleString("vi-VN")}đ</strong>
                </div>
                <ul className="mt-4 space-y-1 rounded-2xl bg-orange-50 p-4 text-sm text-stone-700">
                  {order.items.map((item) => (
                    <li key={item.id}>• {item.productNameSnapshot} x{item.quantity} = {item.lineTotal.toLocaleString("vi-VN")}đ</li>
                  ))}
                </ul>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                  <form action={updateOrderStatus} className="grid gap-3 sm:flex sm:items-center">
                    <input type="hidden" name="id" value={order.id} />
                    <select name="status" defaultValue={order.status} className="min-w-0 rounded-xl border p-3">
                      {statuses.map((status) => <option key={status} value={status}>{status}</option>)}
                    </select>
                    <button className="rounded-full bg-stone-900 px-5 py-3 font-bold text-white">Cập nhật</button>
                  </form>
                  <Link href={`/admin/orders/${order.id}`} className="rounded-full border px-5 py-3 text-center font-bold">Xem chi tiết</Link>
                </div>
              </article>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
