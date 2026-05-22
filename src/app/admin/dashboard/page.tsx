import { AdminNav } from "@/components/AdminNav";
import { requireAdmin } from "@/lib/auth";
import { prisma } from "@/lib/db";

export default async function DashboardPage() {
  const admin = await requireAdmin();
  const [productCount, orderCount, newOrders, revenue] = await Promise.all([
    prisma.product.count(),
    prisma.order.count(),
    prisma.order.count({ where: { status: "NEW" } }),
    prisma.order.aggregate({ _sum: { total: true } }),
  ]);

  return (
    <main suppressHydrationWarning className="min-h-screen bg-orange-50 px-4 py-4 sm:px-6 sm:py-6">
      <div suppressHydrationWarning className="mx-auto grid max-w-7xl gap-4 lg:grid-cols-[280px_1fr] lg:gap-6">
        <AdminNav name={admin.name} />
        <section suppressHydrationWarning className="rounded-3xl bg-white p-5 shadow-sm sm:p-6">
          <h1 className="text-3xl font-black sm:text-4xl">Dashboard quản trị</h1>
          <p suppressHydrationWarning className="mt-2 text-stone-600">Khu admin đã tách riêng, có đăng nhập và đọc dữ liệu từ database.</p>
          <div suppressHydrationWarning className="mt-4 grid gap-3 sm:flex sm:flex-wrap">
            <a href="/" className="rounded-full bg-orange-600 px-5 py-3 text-center font-bold text-white">Xem website</a>
            <a href="/admin/products" className="rounded-full border px-5 py-3 text-center font-bold">Đi tới sản phẩm</a>
            <a href="/admin/settings" className="rounded-full border px-5 py-3 text-center font-bold">Đi tới cài đặt</a>
          </div>
          <div suppressHydrationWarning className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <Card title="Sản phẩm" value={productCount} />
            <Card title="Tổng đơn" value={orderCount} />
            <Card title="Đơn mới" value={newOrders} />
            <Card title="Doanh thu" value={(revenue._sum.total || 0).toLocaleString("vi-VN") + "đ"} />
          </div>
        </section>
      </div>
    </main>
  );
}

function Card({ title, value }: { title: string; value: number | string }) {
  return <div suppressHydrationWarning className="rounded-3xl border border-orange-100 bg-orange-50 p-5"><p suppressHydrationWarning className="text-sm text-stone-500">{title}</p><strong className="mt-2 block text-2xl sm:text-3xl">{value}</strong></div>;
}
