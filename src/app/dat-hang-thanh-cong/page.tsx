import Link from "next/link";
import { prisma } from "@/lib/db";

function money(value: number | null | undefined) {
  return (value || 0).toLocaleString("vi-VN") + "đ";
}

export default async function OrderSuccessPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const params = await searchParams;
  const token = String(params.token || "").trim();

  const order = token
    ? await prisma.order.findUnique({
        where: { lookupToken: token },
        include: { items: true },
      })
    : null;

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-6 sm:px-6 sm:py-10">
      <section suppressHydrationWarning className="mx-auto max-w-3xl rounded-[2rem] bg-white p-5 shadow-sm sm:p-8">
        <div suppressHydrationWarning className="rounded-3xl bg-green-600 p-5 text-white sm:p-6">
          <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.25em] text-green-100">Đặt hàng thành công</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-4xl">Shop đã nhận đơn của bạn</h1>
          <p suppressHydrationWarning className="mt-3 leading-7 text-green-50">
            MyMy sẽ gọi hoặc nhắn tin xác nhận trước khi giao. Bạn có thể lưu lại mã đơn bên dưới để tiện đối chiếu.
          </p>
        </div>

        {order ? (
          <div suppressHydrationWarning className="mt-6 space-y-5">
            <div suppressHydrationWarning className="rounded-3xl border border-orange-100 bg-orange-50 p-5">
              <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">Mã đơn hàng</p>
              <p suppressHydrationWarning className="mt-2 text-3xl font-black text-stone-900">#{order.code}</p>
              <p suppressHydrationWarning className="mt-2 text-sm text-stone-600">Trạng thái hiện tại: <strong>{order.status}</strong></p>
            </div>

            <div suppressHydrationWarning className="grid gap-4 sm:grid-cols-2">
              <div suppressHydrationWarning className="rounded-3xl bg-stone-50 p-5">
                <h2 className="text-lg font-black text-stone-900">Thông tin nhận hàng</h2>
                <div suppressHydrationWarning className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
                  <p suppressHydrationWarning><strong>Tên:</strong> {order.customerName}</p>
                  <p suppressHydrationWarning><strong>Điện thoại:</strong> {order.phone}</p>
                  <p suppressHydrationWarning><strong>Địa chỉ:</strong> {order.address}</p>
                  {order.note ? <p suppressHydrationWarning><strong>Ghi chú:</strong> {order.note}</p> : null}
                </div>
              </div>

              <div suppressHydrationWarning className="rounded-3xl bg-stone-50 p-5">
                <h2 className="text-lg font-black text-stone-900">Thanh toán</h2>
                <div suppressHydrationWarning className="mt-3 space-y-2 text-sm text-stone-700">
                  <div suppressHydrationWarning className="flex justify-between gap-4"><span>Tạm tính</span><strong>{money(order.subtotal)}</strong></div>
                  <div suppressHydrationWarning className="flex justify-between gap-4"><span>Phí ship</span><strong>{money(order.shippingFee)}</strong></div>
                  {order.discount > 0 ? <div suppressHydrationWarning className="flex justify-between gap-4"><span>Giảm giá</span><strong>-{money(order.discount)}</strong></div> : null}
                  <div suppressHydrationWarning className="flex justify-between gap-4 border-t pt-3 text-lg text-orange-700"><span className="font-black">Tổng</span><strong>{money(order.total)}</strong></div>
                </div>
              </div>
            </div>

            <div suppressHydrationWarning className="rounded-3xl border p-5">
              <h2 className="text-lg font-black text-stone-900">Món đã đặt</h2>
              <ul suppressHydrationWarning className="mt-3 space-y-2 text-sm text-stone-700">
                {order.items.map((item) => (
                  <li suppressHydrationWarning key={item.id} className="flex justify-between gap-4 rounded-2xl bg-orange-50 px-4 py-3">
                    <span suppressHydrationWarning>{item.productNameSnapshot} x{item.quantity}</span>
                    <strong>{money(item.lineTotal)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ) : (
          <div suppressHydrationWarning className="mt-6 rounded-3xl border border-yellow-200 bg-yellow-50 p-5 text-stone-700">
            Không tìm thấy chi tiết đơn trong đường dẫn này. Nếu bạn vừa đặt hàng thành công, shop vẫn sẽ liên hệ theo thông tin bạn đã gửi.
          </div>
        )}

        <div suppressHydrationWarning className="mt-6 grid gap-3 sm:flex sm:flex-wrap">
          <Link href="/" className="rounded-full bg-orange-600 px-6 py-3 text-center font-bold text-white">Tiếp tục xem menu</Link>
          <Link href="/#lien-he" className="rounded-full border border-orange-200 px-6 py-3 text-center font-bold text-orange-700">Liên hệ shop</Link>
        </div>
      </section>
    </main>
  );
}
