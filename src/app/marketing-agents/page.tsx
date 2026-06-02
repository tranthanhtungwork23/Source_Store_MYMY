import { MarketingAgentLab } from "@/components/MarketingAgentLab";

export default function MarketingAgentsPage() {
  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#fff8ef_0%,#fff4df_100%)] px-4 py-5 sm:px-6 sm:py-6">
      <div className="mx-auto max-w-7xl">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-[2rem] bg-white p-4 shadow-sm sm:p-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">Prototype playground</p>
            <h1 className="mt-2 text-2xl font-black sm:text-3xl">Marketing AI Agents System</h1>
            <p className="mt-2 text-sm leading-6 text-stone-600">Bản demo local để Tùng kiểm tra cấu trúc phòng marketing AI, vai trò, logic suy luận và luồng phối hợp.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <a href="/" className="rounded-full border border-stone-300 bg-white px-4 py-2 text-sm font-extrabold text-stone-900 shadow-sm transition hover:border-orange-300 hover:text-orange-700">Về website</a>
            <a href="/admin/dashboard" className="rounded-full bg-orange-600 px-4 py-2 text-sm font-extrabold text-white shadow-sm transition hover:bg-orange-700">Vào admin</a>
          </div>
        </div>
        <MarketingAgentLab />
      </div>
    </main>
  );
}
