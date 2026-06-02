import Link from "next/link";
import { logoutAdmin } from "@/lib/auth";

export function AdminNav({ name }: { name: string }) {
  return (
    <aside suppressHydrationWarning className="overflow-hidden rounded-3xl bg-stone-900 p-4 text-white sm:p-6 lg:sticky lg:top-6">
      <div suppressHydrationWarning className="flex items-start justify-between gap-3">
        <div suppressHydrationWarning>
          <p suppressHydrationWarning className="text-xs uppercase tracking-[0.2em] text-orange-300 sm:text-sm">Xin chào</p>
          <h2 className="mt-2 text-xl font-black sm:text-2xl">{name}</h2>
        </div>
        <a href="/" className="rounded-full border border-white/15 px-3 py-2 text-xs font-bold text-orange-200 sm:hidden">Site</a>
      </div>
      <nav suppressHydrationWarning className="mt-5 flex gap-3 overflow-x-auto pb-1 text-sm lg:block lg:space-y-3 lg:overflow-visible lg:pb-0">
        <Link href="/admin/dashboard" className="block min-w-max whitespace-nowrap rounded-xl bg-white/10 px-4 py-3">Dashboard</Link>
        <Link href="/admin/products" className="block min-w-max whitespace-nowrap rounded-xl bg-white/10 px-4 py-3">Sản phẩm</Link>
        <Link href="/admin/orders" className="block min-w-max whitespace-nowrap rounded-xl bg-white/10 px-4 py-3">Đơn hàng</Link>
        <Link href="/admin/categories" className="block min-w-max whitespace-nowrap rounded-xl bg-white/10 px-4 py-3">Danh mục</Link>
        <Link href="/admin/blog" className="block min-w-max whitespace-nowrap rounded-xl bg-white/10 px-4 py-3">Blog</Link>
        <Link href="/admin/settings" className="block min-w-max whitespace-nowrap rounded-xl bg-white/10 px-4 py-3">Cài đặt</Link>
      </nav>
      <form suppressHydrationWarning action={logoutAdmin} className="mt-5 sm:mt-6">
        <button suppressHydrationWarning className="w-full rounded-full bg-orange-600 px-4 py-3 font-bold">Đăng xuất</button>
      </form>
    </aside>
  );
}
