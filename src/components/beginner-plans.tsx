import type { BeginnerPlan } from "@/lib/briefs";
import { BEGINNER_PLANS } from "@/lib/briefs";

function DatumMark() {
  return (
    <svg className="datum-mark" viewBox="0 0 160 160" aria-hidden="true">
      <circle cx="80" cy="80" r="62" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="36" fill="none" stroke="currentColor" strokeWidth="1" />
      <path d="M80 8v28M80 124v28M8 80h28M124 80h28" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="3" fill="currentColor" />
    </svg>
  );
}

export function BeginnerPlans({
  onOpen,
  tone = "ink",
}: {
  onOpen: (plan: BeginnerPlan) => void;
  tone?: "ink" | "paper";
}) {
  const ink = tone === "ink";
  return (
    <section className={ink ? "beginner-stage" : "border-t border-line bg-card"}>
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        {ink ? <DatumMark /> : null}
        <div className="relative max-w-xl">
          <p className={`font-mono text-xs tracking-[0.18em] ${ink ? "text-gold" : "text-cyan"}`}>FIRST EVENING</p>
          <h2 className={`mt-2 font-display text-4xl leading-tight ${ink ? "text-paper" : "text-ink"}`}>Start with a plan you can finish.</h2>
          <p className={`mt-3 text-sm ${ink ? "text-paper-2" : "text-muted"}`}>
            Four beginner builds. One process, a small budget, and a sentence you can rank right now.
          </p>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BEGINNER_PLANS.map((plan, index) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onOpen(plan)}
              className={`lift flex h-full flex-col p-4 text-left ${ink ? "border border-white/15 bg-white/5 text-paper" : "border border-line bg-paper"}`}
            >
              <span className="flex items-baseline justify-between gap-3">
                <span className={`font-display text-3xl ${ink ? "text-gold" : "text-[#8a6a2f]"}`}>{String(index + 1).padStart(2, "0")}</span>
                <span className={`font-mono text-[10px] tracking-[0.14em] ${ink ? "text-paper-2" : "text-muted"}`}>{plan.evening.toUpperCase()}</span>
              </span>
              <span className="mt-4 font-display text-2xl leading-tight">{plan.label}</span>
              <span className={`mt-2 text-sm ${ink ? "text-paper-2" : "text-muted"}`}>{plan.kicker}</span>
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
