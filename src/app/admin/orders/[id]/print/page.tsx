import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

function money(value: number | null | undefined) {
  return (value || 0).toLocaleString("vi-VN") + "đ";
}

export default async function PrintOrderPage({ params }: { params: Promise<{ id: string }> }) {
  await requireAdmin();
  const { id } = await params;
  const [order, setting] = await Promise.all([
    prisma.order.findUnique({ where: { id: Number(id) }, include: { items: true } }),
    prisma.siteSetting.findUnique({ where: { id: 1 } }),
  ]);

  if (!order) notFound();

  return (
    <main suppressHydrationWarning className="min-h-screen bg-white px-4 py-6 text-stone-900 sm:p-8">
      <div suppressHydrationWarning className="mx-auto max-w-3xl">
        <div suppressHydrationWarning className="mb-6 grid gap-3 sm:flex sm:justify-between print:hidden">
          <Link href={`/admin/orders/${order.id}`} className="rounded-full border px-5 py-3 text-center font-bold">← Quay lại</Link>
          <span suppressHydrationWarning className="rounded-full bg-stone-900 px-5 py-3 text-center font-bold text-white">Dùng Ctrl+P để in</span>
        </div>

        <section suppressHydrationWarning className="border border-stone-300 p-4 sm:p-8">
          <div suppressHydrationWarning className="grid gap-4 border-b pb-5 sm:flex sm:justify-between sm:gap-6">
            <div suppressHydrationWarning>
              <h1 className="text-xl font-black sm:text-2xl sm:text-3xl">{setting?.siteName || "MyMy Đồ Ăn Vặt"}</h1>
              <p suppressHydrationWarning className="mt-1 text-sm">Hotline: {setting?.hotline}</p>
            </div>
            <div suppressHydrationWarning className="sm:text-right">
              <p suppressHydrationWarning className="text-sm uppercase tracking-widest">Phiếu đơn hàng</p>
              <h2 className="text-xl font-black sm:text-2xl">#{order.code}</h2>
              <p suppressHydrationWarning className="text-sm">{order.createdAt.toLocaleString("vi-VN")}</p>
            </div>
          </div>

          <div suppressHydrationWarning className="mt-5 grid gap-4 md:grid-cols-2">
            <div suppressHydrationWarning>
              <h3 className="font-bold">Thông tin khách</h3>
              <p suppressHydrationWarning>Tên: {order.customerName}</p>
              <p suppressHydrationWarning>SĐT: {order.phone}</p>
              <p suppressHydrationWarning>Địa chỉ: {order.address}</p>
            </div>
            <div suppressHydrationWarning>
              <h3 className="font-bold">Trạng thái</h3>
              <p suppressHydrationWarning>{order.status}</p>
              {order.note ? <p suppressHydrationWarning>Ghi chú: {order.note}</p> : null}
            </div>
          </div>

          <div suppressHydrationWarning className="mt-6 overflow-x-auto"><table className="min-w-[640px] w-full border-collapse text-sm">
            <thead>
              <tr className="border-b bg-stone-100">
                <th className="p-3 text-left">Sản phẩm</th>
                <th className="p-3 text-left">SL</th>
                <th className="p-3 text-left">Đơn giá</th>
                <th className="p-3 text-left">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              {order.items.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="p-3">{item.productNameSnapshot}</td>
                  <td className="p-3">{item.quantity}</td>
                  <td className="p-3">{money(item.priceSnapshot)}</td>
                  <td className="p-3">{money(item.lineTotal)}</td>
                </tr>
              ))}
            </tbody>
          </table></div>

          <div suppressHydrationWarning className="ml-auto mt-6 max-w-xs space-y-2 text-sm">
            <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Tạm tính</span><span suppressHydrationWarning>{money(order.subtotal)}</span></div>
            <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Phí ship</span><span suppressHydrationWarning>{money(order.shippingFee)}</span></div>
            <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Giảm giá</span><span suppressHydrationWarning>-{money(order.discount)}</span></div>
            {order.couponCode ? <div suppressHydrationWarning className="flex justify-between"><span suppressHydrationWarning>Coupon</span><span suppressHydrationWarning>{order.couponCode}</span></div> : null}
            <div suppressHydrationWarning className="flex justify-between border-t pt-3 text-xl font-black"><span suppressHydrationWarning>Tổng</span><span suppressHydrationWarning>{money(order.total)}</span></div>
          </div>

          <p suppressHydrationWarning className="mt-8 text-center text-sm text-stone-500">Cảm ơn quý khách đã ủng hộ!</p>
        </section>
      </div>
    </main>
  );
}
