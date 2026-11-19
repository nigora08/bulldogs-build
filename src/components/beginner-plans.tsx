import { useRef, useState } from "react";
import type { BeginnerPlan } from "@/lib/briefs";
import { BEGINNER_PLANS, takeBeginner } from "@/lib/briefs";
import { pictureForBrief } from "@/lib/pictures";
import { ShopPhoto } from "@/components/shop-photo";

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
  const [extra, setExtra] = useState<BeginnerPlan[]>([]);
  const cursor = useRef(0);

  function more() {
    const batch = takeBeginner(cursor.current, 3);
    cursor.current += 3;
    setExtra((current) => [...current, ...batch]);
  }

  return (
    <section className={ink ? "beginner-stage" : "border-t border-line bg-card"}>
      <div className="relative mx-auto max-w-6xl px-4 py-12">
        {ink ? <DatumMark /> : null}
        <div className="relative max-w-xl">
          <p className={`font-mono text-xs tracking-[0.18em] ${ink ? "text-gold" : "text-cyan"}`}>FIRST EVENING</p>
          <h2 className={`mt-2 font-display text-4xl leading-tight ${ink ? "text-paper" : "text-ink"}`}>Start with a plan you can finish.</h2>
          <p className={`mt-3 text-sm ${ink ? "text-paper-2" : "text-muted"}`}>
            A few first builds. One process, a small budget, and a sentence you can rank right now. Each press adds three you have not seen.
          </p>
        </div>
        <div className="relative mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {BEGINNER_PLANS.map((plan) => (
            <button
              key={plan.id}
              type="button"
              onClick={() => onOpen(plan)}
              className={`lift flex h-full flex-col overflow-hidden text-left ${ink ? "border border-white/15 bg-white/5 text-paper" : "border border-line bg-paper"}`}
            >
              <span className="relative block">
                <ShopPhoto src={pictureForBrief(plan.brief).src} alt="" className="aspect-[4/3]" />
                <span className={`absolute left-2 top-2 px-2 py-1 font-mono text-[10px] tracking-[0.14em] ${ink ? "bg-ink/80 text-gold" : "bg-paper/90 text-muted"}`}>
                  {plan.evening.toUpperCase()}
                </span>
              </span>
              <span className="px-4 pb-4">
                <span className="mt-3 block font-display text-2xl leading-tight">{plan.label}</span>
                <span className={`mt-1 block text-sm ${ink ? "text-paper-2" : "text-muted"}`}>{plan.kicker}</span>
              </span>
            </button>
          ))}
        </div>
        {extra.length > 0 ? (
          <div className={`relative mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4 ${extra.length > 8 ? "idea-well" : ""}`}>
            {extra.map((plan) => (
              <button
                key={plan.id}
                type="button"
                onClick={() => onOpen(plan)}
                className={`lift flex h-full flex-col overflow-hidden text-left ${ink ? "border border-white/15 bg-white/5 text-paper" : "border border-line bg-paper"}`}
              >
                <ShopPhoto src={pictureForBrief(plan.brief).src} alt="" className="aspect-[4/3]" />
                <span className="px-4 pb-4">
                  <span className={`mt-3 block font-mono text-[10px] tracking-[0.14em] ${ink ? "text-paper-2" : "text-muted"}`}>{plan.evening.toUpperCase()}</span>
                  <span className="mt-1 block font-display text-2xl leading-tight">{plan.label}</span>
                  <span className={`mt-1 block text-sm ${ink ? "text-paper-2" : "text-muted"}`}>{plan.kicker}</span>
                </span>
              </button>
            ))}
          </div>
        ) : null}
        <button
          type="button"
          onClick={more}
          className={`relative mt-4 inline-flex h-11 items-center px-4 text-sm ${ink ? "border border-gold text-gold" : "bg-ink text-paper"}`}
        >
          More beginner builds
        </button>
      </div>
    </section>
  );
}
