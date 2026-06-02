"use client";

import { useMemo, useState } from "react";

type Agent = {
  id: string;
  name: string;
  role: string;
  layer: string;
  emoji: string;
  mission: string;
  reasoning: string[];
  input: string[];
  output: string[];
  kpi: string[];
  handoff: string;
};

type AgentResult = {
  agentId: string;
  title: string;
  summary: string;
  bullets: string[];
  handoff: string;
};

const agents: Agent[] = [
  {
    id: "cmo",
    name: "Marketing Director AI",
    role: "Orchestrator / CMO",
    layer: "Strategic Layer",
    emoji: "🧭",
    mission: "Nhận mục tiêu kinh doanh, chia việc cho các agent, xử lý xung đột và quyết định ưu tiên cuối cùng.",
    reasoning: ["Mục tiêu kinh doanh quan trọng nhất là gì?", "Nguồn lực nên dồn vào đâu?", "Kênh nào tạo doanh thu thật?", "Xung đột nào cần test, xung đột nào cần phán quyết?"],
    input: ["Mục tiêu 90 ngày", "Ngân sách", "Sản phẩm/dịch vụ", "Dữ liệu từ Analyst"],
    output: ["Chiến lược chiến dịch", "Ưu tiên tuần", "Phân bổ ngân sách", "Quyết định scale/dừng"],
    kpi: ["Doanh thu", "Lead", "CAC", "ROAS", "LTV"],
    handoff: "Giao mục tiêu cho Research, Brand, Content, Creative, Ads, CRM và Analyst.",
  },
  {
    id: "research",
    name: "Customer Research AI",
    role: "Market & Customer Intelligence",
    layer: "Intelligence Layer",
    emoji: "🔎",
    mission: "Tìm insight, pain point, desire, objection và ngôn ngữ thật của khách hàng.",
    reasoning: ["Khách đang đau ở đâu?", "Điều gì khiến họ chần chừ?", "Họ dùng từ nào khi tìm kiếm?", "Đối thủ đang chiếm tâm trí bằng thông điệp gì?"],
    input: ["Sản phẩm", "Tệp khách", "Đối thủ", "Comment/inbox/review"],
    output: ["Customer persona", "Pain/desire map", "Objection list", "Competitor gap"],
    kpi: ["Insight được xác nhận", "Search terms", "Objection coverage", "Content gap"],
    handoff: "Chuyển insight cho Brand và Content.",
  },
  {
    id: "brand",
    name: "Brand Strategist AI",
    role: "Positioning & Messaging",
    layer: "Intelligence Layer",
    emoji: "🏷️",
    mission: "Biến insight thành định vị, thông điệp, tone of voice và nguyên tắc thương hiệu.",
    reasoning: ["Vì sao khách phải nhớ thương hiệu này?", "Khác biệt cốt lõi là gì?", "Thông điệp có đúng phân khúc không?", "Có đang làm thương hiệu rẻ đi không?"],
    input: ["Insight từ Research", "USP", "Giá bán", "Đối thủ"],
    output: ["Positioning", "Key message", "Tone of voice", "Brand guardrails"],
    kpi: ["Message recall", "Trust signal", "Consistency score", "Brand sentiment"],
    handoff: "Chuyển message và guardrails cho Content + Creative.",
  },
  {
    id: "content",
    name: "Content SEO/GEO AI",
    role: "Content Strategist",
    layer: "Production Layer",
    emoji: "✍️",
    mission: "Tạo content pillar, bài SEO/GEO/AEO, social post, script video và landing copy.",
    reasoning: ["Nội dung này kéo traffic, trust hay sale?", "Nó thuộc TOFU/MOFU/BOFU?", "Câu trả lời có đủ rõ để AI trích dẫn không?", "CTA nào phù hợp nhất?"],
    input: ["Insight", "Brand message", "Keyword", "Offer"],
    output: ["Content calendar", "SEO brief", "Social hooks", "Video scripts", "Landing copy"],
    kpi: ["Organic traffic", "Lead assist", "Save/share", "Ranking", "CTA click"],
    handoff: "Chuyển brief nội dung cho Creative và Performance.",
  },
  {
    id: "creative",
    name: "Design/Creative AI",
    role: "Creative Director",
    layer: "Production Layer",
    emoji: "🎨",
    mission: "Biến thông điệp thành visual, ad creative, thumbnail, landing asset và video concept có khả năng dừng mắt.",
    reasoning: ["Khách có dừng lại trong 1-3 giây đầu không?", "Visual có làm thông điệp dễ hiểu hơn không?", "Đẹp có đang thắng rõ ràng không?", "Có đủ biến thể để A/B test không?"],
    input: ["Brand guideline", "Content brief", "Ad angle", "Benchmark creative"],
    output: ["Creative matrix", "Post design", "Ad visual", "Video concept", "Landing visual"],
    kpi: ["Thumb-stop rate", "CTR", "Video retention", "Creative reuse", "CPL theo creative"],
    handoff: "Chuyển creative assets cho Performance và Social Distribution.",
  },
  {
    id: "performance",
    name: "Performance Ads AI",
    role: "Paid Growth Specialist",
    layer: "Distribution Layer",
    emoji: "🚀",
    mission: "Setup chiến dịch, test angle/tệp/creative, đọc chỉ số và scale chiến dịch thắng.",
    reasoning: ["Điểm nghẽn là CTR, CPC, CPL hay CVR?", "Creative nào đang thắng?", "Tệp nào đáng tăng ngân sách?", "Khi nào cần dừng vì fatigue?"],
    input: ["Creative", "Ad copy", "Audience", "Budget", "Landing page"],
    output: ["Campaign plan", "Testing matrix", "Budget recommendation", "Optimization notes"],
    kpi: ["CTR", "CPC", "CPL", "CPA", "ROAS", "CVR"],
    handoff: "Chuyển lead và campaign data cho CRM + Analyst.",
  },
  {
    id: "crm",
    name: "CRM/Retention AI",
    role: "Conversion & Retention",
    layer: "Conversion Layer",
    emoji: "💬",
    mission: "Chăm lead, xử lý phản đối, remarketing, upsell và kéo khách quay lại.",
    reasoning: ["Lead chưa mua vì giá, niềm tin hay thời điểm?", "Follow-up nào không gây phiền?", "Khách cũ nên nhận offer gì?", "Tin nhắn nào tăng phản hồi?"],
    input: ["Lead data", "Objection list", "Offer", "Campaign source"],
    output: ["Follow-up flow", "Inbox scripts", "Remarketing segment", "Retention campaign"],
    kpi: ["Lead-to-customer", "Response rate", "Repeat purchase", "Unsubscribe/block", "Recovery rate"],
    handoff: "Chuyển objection và conversion data cho Analyst + Content.",
  },
  {
    id: "analyst",
    name: "Growth Analyst AI",
    role: "Data & Learning System",
    layer: "Measurement Layer",
    emoji: "📊",
    mission: "Nối dữ liệu content, creative, ads, CRM và doanh thu để tìm điểm nghẽn tăng trưởng.",
    reasoning: ["Kênh nào hiệu quả thật?", "Phễu rò ở bước nào?", "Giả thuyết nào đã được xác nhận?", "Cái gì cần scale, dừng, test tiếp?"],
    input: ["Traffic", "Ad data", "Lead", "Sales", "CRM", "Content performance"],
    output: ["Dashboard", "Weekly insight", "Funnel diagnosis", "Learning library"],
    kpi: ["Insight/action rate", "Dashboard accuracy", "Test conclusion", "CAC trend", "ROAS trend"],
    handoff: "Trả dữ liệu và khuyến nghị về cho CMO để ra vòng chiến lược tiếp theo.",
  },
];

const conflictRules = [
  { conflict: "Brand muốn cao cấp, Ads muốn hook mạnh", decision: "Nếu mục tiêu là awareness: Brand ưu tiên. Nếu mục tiêu là lead/sale: Performance ưu tiên nhưng không phá brand guardrails. CMO phán quyết khi ảnh hưởng dài hạn." },
  { conflict: "Content muốn bài dài, Ads muốn copy ngắn", decision: "SEO article do Content/SEO quyết. Ad copy do Performance quyết. Landing page do Content + Performance cùng quyết, Analyst đưa dữ liệu." },
  { conflict: "Designer muốn đẹp, Ads muốn rõ và mạnh", decision: "Creative chạy ads ưu tiên chỉ số. Creative Director giữ chuẩn thương hiệu. Nếu cả hai hợp lý thì A/B test." },
  { conflict: "CRM muốn nhắn nhiều, Brand sợ làm phiền", decision: "CRM đề xuất tần suất, Brand kiểm tone, Analyst theo dõi unsubscribe/block. Vượt ngưỡng thì giảm tần suất." },
];

const knowledgeBase = [
  "Business Foundation: mục tiêu, sản phẩm, giá, biên lợi nhuận, offer",
  "Customer Intelligence: persona, pain point, desire, objection, FAQ thật",
  "Brand System: USP, positioning, tone of voice, guardrails, ví dụ đúng/sai",
  "Content System: pillar, keyword map, hooks, CTA, content winners/losers",
  "Creative System: template, thumbnail, ad library, visual winners/losers",
  "Campaign System: brief, timeline, budget, audience, angle, kết quả",
  "Performance Data: ads, SEO, social, CRM, funnel dashboard",
  "SOP Library: research, content, creative, ads, CRM, report, conflict protocol",
];

function buildResults(brief: string, budget: string, goal: string): AgentResult[] {
  const cleanBrief = brief.trim() || "Bánh tráng/đồ ăn vặt giao nhanh cho khách trẻ tại khu vực địa phương";
  const cleanBudget = budget.trim() || "10.000.000đ/tháng";
  const cleanGoal = goal.trim() || "tăng lead và đơn hàng trong 90 ngày";

  return [
    {
      agentId: "cmo",
      title: "Chiến lược tổng",
      summary: `Ưu tiên ${cleanGoal}. Ngân sách tham chiếu: ${cleanBudget}. Không dàn trải kênh; tập trung 1 phễu chính: content/social → creative ads → inbox/landing → CRM chốt lại.`,
      bullets: ["Chọn 1 offer chủ lực để test trước", "Mỗi tuần chỉ giữ lại 2-3 giả thuyết quan trọng", "Mọi agent báo cáo về cùng dashboard"],
      handoff: "Giao Research tìm insight và objection thật.",
    },
    {
      agentId: "research",
      title: "Insight khách hàng",
      summary: `Với mô tả: “${cleanBrief}”, khách hàng cần 3 thứ: thấy thèm nhanh, tin shop giao đúng, và biết rõ giá/phí trước khi đặt.`,
      bullets: ["Pain: sợ món không giống ảnh, phí ship mập mờ, phản hồi chậm", "Desire: ăn ngon nhanh, rõ giá, dễ nhắn đặt", "Objection: không biết có cay không, giao mất bao lâu, có COD không"],
      handoff: "Chuyển pain/desire/objection cho Brand và Content.",
    },
    {
      agentId: "brand",
      title: "Định vị & thông điệp",
      summary: "Định vị đề xuất: đồ ăn vặt rõ giá, đặt nhanh, shop xác nhận trước khi giao. Tone: gần gũi, rõ ràng, không thổi phồng.",
      bullets: ["Key message: Mở web là chọn món được ngay", "Trust signal: rõ giá, COD, gọi xác nhận", "Guardrail: không dùng câu giật gân làm thương hiệu rẻ đi"],
      handoff: "Chuyển message và guardrails cho Content + Creative.",
    },
    {
      agentId: "content",
      title: "Kế hoạch nội dung",
      summary: "Tạo 3 trụ cột: món ngon dễ thèm, đặt hàng rõ ràng, bằng chứng tin cậy. Mỗi nội dung phải có CTA đo được.",
      bullets: ["SEO/GEO: bài trả lời FAQ về phí ship, COD, món cay/không cay", "Social: hook 1 dòng + hình món + CTA nhắn Zalo", "Landing: nhấn mạnh menu rõ giá, chọn nhanh, shop gọi xác nhận"],
      handoff: "Chuyển hook, CTA và script cho Creative.",
    },
    {
      agentId: "creative",
      title: "Creative matrix",
      summary: "Tạo 4 nhóm creative để test: cận cảnh món, combo tiết kiệm, bằng chứng khách thật, quy trình đặt hàng 3 bước.",
      bullets: ["Mỗi angle có 3 biến thể visual", "Thumbnail cần rõ món + giá/offer trong 1-3 giây", "Asset phải có phiên bản post, story/reel, ad square"],
      handoff: "Chuyển creative assets cho Performance test.",
    },
    {
      agentId: "performance",
      title: "Kế hoạch chạy ads/test",
      summary: `Với ngân sách ${cleanBudget}, chia 70% test creative/audience, 20% retarget, 10% dự phòng scale. Tắt nhanh creative CTR thấp và CPL vượt ngưỡng.`,
      bullets: ["Test 4 angle creative trong 7 ngày", "Đo CTR, CPC, CPL, inbox quality", "Scale creative có CTR và CPL tốt hơn benchmark"],
      handoff: "Chuyển lead source và objection cho CRM.",
    },
    {
      agentId: "crm",
      title: "Luồng chăm lead",
      summary: "Lead phải được phản hồi nhanh, đúng objection và có follow-up nhẹ. Mục tiêu là tăng chốt đơn mà không làm phiền khách.",
      bullets: ["Script 1: xác nhận món + phí ship + thời gian giao", "Script 2: xử lý objection cay/phí/giao", "Script 3: nhắc lại khách chưa chốt sau 2-4 giờ"],
      handoff: "Gửi lý do chưa mua và tỉ lệ chốt cho Analyst.",
    },
    {
      agentId: "analyst",
      title: "Dashboard & vòng học",
      summary: "Mỗi tuần kết luận rõ: angle nào thắng, kênh nào tạo đơn, điểm nghẽn nằm ở creative, landing/inbox hay offer.",
      bullets: ["Dashboard: traffic → lead → đơn → doanh thu", "Learning: winner/loser library", "Khuyến nghị: scale, dừng, test tiếp"],
      handoff: "Trả insight về CMO để bắt đầu vòng tối ưu mới.",
    },
  ];
}

export function MarketingAgentLab() {
  const [brief, setBrief] = useState("Bánh tráng MyMy: đồ ăn vặt giao nhanh, rõ giá, khách đặt qua website/Zalo");
  const [budget, setBudget] = useState("10.000.000đ/tháng");
  const [goal, setGoal] = useState("tăng lead, tăng đơn hàng và giảm phụ thuộc đăng bài thủ công trong 90 ngày");
  const [activeAgent, setActiveAgent] = useState("cmo");
  const [hasRun, setHasRun] = useState(false);

  const results = useMemo(() => buildResults(brief, budget, goal), [brief, budget, goal]);
  const selectedAgent = agents.find((agent) => agent.id === activeAgent) || agents[0];
  const selectedResult = results.find((result) => result.agentId === activeAgent);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[2rem] bg-stone-950 p-6 text-white shadow-xl sm:p-8">
          <p className="text-xs font-black uppercase tracking-[0.25em] text-orange-300">AI Marketing Department</p>
          <h1 className="mt-3 text-3xl font-black leading-tight sm:text-5xl">Hệ thống AI Agent mô phỏng nguyên bộ phận marketing</h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-stone-300 sm:text-base">
            Mỗi agent có vai trò, cách suy luận, input/output, KPI và cơ chế bàn giao riêng. Orchestrator điều phối toàn bộ luồng Research → Brand → Content → Creative → Ads → CRM → Analyst.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Metric label="Agents" value="8" />
            <Metric label="Workflow" value="7 bước" />
            <Metric label="Goal" value="Lead/Sale" />
          </div>
        </div>
        <div className="rounded-[2rem] border border-orange-100 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-xl font-black">Chạy thử một campaign brief</h2>
          <label className="mt-4 block text-sm font-bold text-stone-700">Mô tả sản phẩm/thị trường</label>
          <textarea value={brief} onChange={(event) => setBrief(event.target.value)} className="mt-2 min-h-24 w-full rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm outline-none focus:border-orange-400" />
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="block text-sm font-bold text-stone-700">Ngân sách</label>
              <input value={budget} onChange={(event) => setBudget(event.target.value)} className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm outline-none focus:border-orange-400" />
            </div>
            <div>
              <label className="block text-sm font-bold text-stone-700">Mục tiêu</label>
              <input value={goal} onChange={(event) => setGoal(event.target.value)} className="mt-2 w-full rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm outline-none focus:border-orange-400" />
            </div>
          </div>
          <button onClick={() => setHasRun(true)} className="mt-4 w-full rounded-full bg-orange-600 px-5 py-3 font-black text-white shadow-sm transition hover:bg-orange-700">
            Chạy mô phỏng phối hợp agents
          </button>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[340px_1fr]">
        <div className="rounded-[2rem] bg-white p-4 shadow-sm">
          <h2 className="px-2 py-2 text-lg font-black">Danh sách agent</h2>
          <div className="mt-2 space-y-2">
            {agents.map((agent) => (
              <button key={agent.id} onClick={() => setActiveAgent(agent.id)} className={`w-full rounded-2xl p-4 text-left transition ${activeAgent === agent.id ? "bg-orange-600 text-white" : "bg-orange-50 text-stone-900 hover:bg-orange-100"}`}>
                <div className="flex items-start gap-3">
                  <span className="text-2xl">{agent.emoji}</span>
                  <span>
                    <strong className="block text-sm font-black">{agent.name}</strong>
                    <span className={`mt-1 block text-xs ${activeAgent === agent.id ? "text-orange-100" : "text-stone-500"}`}>{agent.role}</span>
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">{selectedAgent.layer}</p>
              <h2 className="mt-2 text-2xl font-black sm:text-3xl">{selectedAgent.emoji} {selectedAgent.name}</h2>
              <p className="mt-2 text-sm leading-6 text-stone-600">{selectedAgent.mission}</p>
            </div>
            <span className="rounded-full bg-stone-900 px-4 py-2 text-xs font-black text-white">{selectedAgent.role}</span>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <InfoBox title="Cách suy luận riêng" items={selectedAgent.reasoning} />
            <InfoBox title="Input nhận vào" items={selectedAgent.input} />
            <InfoBox title="Output bàn giao" items={selectedAgent.output} />
            <InfoBox title="KPI nên đo" items={selectedAgent.kpi} />
          </div>

          <div className="mt-5 rounded-3xl border border-orange-100 bg-orange-50 p-5">
            <p className="text-sm font-black text-orange-800">Handoff</p>
            <p className="mt-2 text-sm leading-6 text-stone-700">{selectedAgent.handoff}</p>
          </div>

          {hasRun && selectedResult ? (
            <div className="mt-5 rounded-3xl bg-stone-950 p-5 text-white">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-300">Kết quả mô phỏng của agent này</p>
              <h3 className="mt-2 text-xl font-black">{selectedResult.title}</h3>
              <p className="mt-2 text-sm leading-6 text-stone-300">{selectedResult.summary}</p>
              <ul className="mt-4 space-y-2 text-sm text-stone-200">
                {selectedResult.bullets.map((bullet) => <li key={bullet}>• {bullet}</li>)}
              </ul>
              <p className="mt-4 rounded-2xl bg-white/10 p-3 text-sm text-orange-100">→ {selectedResult.handoff}</p>
            </div>
          ) : null}
        </div>
      </section>

      {hasRun ? (
        <section className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-orange-700">Agent workflow output</p>
              <h2 className="mt-2 text-2xl font-black">Luồng phối hợp sau khi chạy brief</h2>
            </div>
            <span className="rounded-full bg-green-100 px-4 py-2 text-xs font-black text-green-800">Đã chạy mô phỏng</span>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {results.map((result, index) => {
              const agent = agents.find((item) => item.id === result.agentId)!;
              return (
                <div key={result.agentId} className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
                  <p className="text-xs font-black text-orange-700">Bước {index + 1}</p>
                  <h3 className="mt-1 font-black">{agent.emoji} {agent.name}: {result.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-stone-700">{result.summary}</p>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Conflict Resolution Protocol</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Khi các agent bất đồng, hệ thống không tranh luận cảm tính. Nó nhìn mục tiêu campaign, dữ liệu và quyền quyết định.</p>
          <div className="mt-4 space-y-3">
            {conflictRules.map((rule) => (
              <div key={rule.conflict} className="rounded-2xl bg-orange-50 p-4">
                <p className="font-black text-stone-900">{rule.conflict}</p>
                <p className="mt-2 text-sm leading-6 text-stone-600">{rule.decision}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-[2rem] bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-2xl font-black">Shared Memory / Knowledge Base</h2>
          <p className="mt-2 text-sm leading-6 text-stone-600">Đây là bộ nhớ chung để các agent không suy luận lệch nhau. Bản production nên lưu bằng Notion/DB/CRM; bản demo này mô phỏng cấu trúc trước.</p>
          <div className="mt-4 grid gap-2">
            {knowledgeBase.map((item) => <div key={item} className="rounded-2xl border border-orange-100 bg-orange-50 p-3 text-sm font-bold text-stone-700">{item}</div>)}
          </div>
        </div>
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-3xl bg-white/10 p-4"><p className="text-xs uppercase tracking-[0.18em] text-orange-200">{label}</p><strong className="mt-1 block text-2xl font-black">{value}</strong></div>;
}

function InfoBox({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-3xl border border-orange-100 bg-orange-50 p-4">
      <h3 className="font-black text-stone-900">{title}</h3>
      <ul className="mt-3 space-y-2 text-sm leading-6 text-stone-700">
        {items.map((item) => <li key={item}>• {item}</li>)}
      </ul>
    </div>
  );
}
