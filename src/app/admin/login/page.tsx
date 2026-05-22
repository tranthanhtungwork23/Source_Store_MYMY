import { loginAdmin } from "@/lib/auth";

export default function LoginPage() {
  return (
    <main suppressHydrationWarning className="flex min-h-screen items-center justify-center bg-stone-950 px-4 py-6 text-white sm:px-6">
      <form suppressHydrationWarning action={loginAdmin} className="w-full max-w-md rounded-3xl bg-white p-6 text-stone-900 shadow-2xl sm:p-8">
        <p suppressHydrationWarning className="text-sm font-bold uppercase tracking-[0.2em] text-orange-700">Admin MyMy</p>
        <h1 className="mt-2 text-2xl font-black sm:text-3xl">Đăng nhập quản trị</h1>
        <p suppressHydrationWarning className="mt-3 text-sm leading-6 text-stone-600">
          Tài khoản demo: admin@mymy.local / 12345678
        </p>
        <div suppressHydrationWarning className="mt-6 space-y-4">
          <input suppressHydrationWarning name="email" type="email" defaultValue="admin@mymy.local" required className="w-full rounded-xl border p-3" />
          <input suppressHydrationWarning name="password" type="password" defaultValue="12345678" required className="w-full rounded-xl border p-3" />
          <button suppressHydrationWarning className="w-full rounded-full bg-orange-600 px-5 py-3 font-bold text-white hover:bg-orange-700">
            Đăng nhập
          </button>
        </div>
      </form>
    </main>
  );
}
