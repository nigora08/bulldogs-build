import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle,
  ArrowRight,
  Box,
  Check,
  CircuitBoard,
  Droplets,
  ExternalLink,
  Factory,
  Layers,
  Printer,
  Search,
  Shield,
  Wind,
} from "lucide-react";
import { ADVISORIES, EQUIPMENT, FACILITIES, getEquipment, type AccessTier, type Equipment, type Verification } from "@/data/equipment";
import { OPEN_PROCESSES } from "@/data/open-processes";
import { explainPassage } from "@/lib/ask.functions";
import { plainify, simplifyBrief } from "@/lib/plain";
import { BeginnerPlans } from "@/components/beginner-plans";
import { BulldogMark } from "@/components/bulldog-mark";
import { takeBriefs } from "@/lib/briefs";
import { pickSuggestion, type Suggestion } from "@/lib/suggestions";
import { analyzeForCampus, type Campus } from "@/lib/open-shop";
import {
  EXAMPLES,
  lineCost,
  prepList,
  type Blueprint,
  type Constraints,
  type ExampleProject,
  type RoutePlan,
} from "@/lib/engine";

const TABS = [
  ["brief", "Brief"],
  ["blueprint", "Blueprint"],
  ["machines", "Machines"],
  ["examples", "Examples"],
  ["sources", "Sources"],
] as const;

type Tab = (typeof TABS)[number][0];

function show(active: boolean, keepPrint = false) {
  if (active) return keepPrint ? "print-keep" : "";
  return keepPrint ? "hidden print-keep" : "hidden";
}

const TIER_OPTIONS: { id: AccessTier | "any"; label: string }[] = [
  { id: "any", label: "Any access" },
  { id: "member", label: "Membership" },
  { id: "trained", label: "Training gate" },
  { id: "inquire", label: "Ask the shop" },
  { id: "appointment", label: "Appointment" },
  { id: "professional", label: "Staff machine it" },
  { id: "restricted", label: "Restricted" },
];

const GROUP_OPTIONS = [
  { id: "any", label: "Any material" },
  { id: "polymer", label: "Polymers" },
  { id: "wood_paper", label: "Wood and paper" },
  { id: "metal", label: "Metals" },
  { id: "electronics", label: "Electronics" },
  { id: "textile", label: "Textiles" },
];

function ease(n: number): string {
  if (n < 40) return "Approachable";
  if (n < 65) return "Moderate";
  return "Demanding";
}

function tierLabel(tier: RoutePlan["accessTier"]): string {
  if (tier === "member") return "CEID member";
  if (tier === "trained") return "Training required";
  if (tier === "inquire") return "Ask the shop";
  if (tier === "appointment") return "Appointment";
  if (tier === "professional") return "Staff-run";
  if (tier === "restricted") return "Restricted";
  return "Off-campus step";
}

function verifyLabel(status: Verification): string {
  if (status === "verified") return "Verified";
  if (status === "restricted") return "Restricted access";
  return "Needs confirmation";
}

function verifyClass(status: Verification): string {
  if (status === "verified") return "bg-ok-bg text-ok";
  if (status === "restricted") return "bg-danger-bg text-danger";
  return "bg-warn-bg text-warn";
}

export function MakerMap({
  campus = "yale",
  framed = false,
  consumeDraft = false,
  onCampusChange,
  onSave,
  saving = false,
  saveNote = "",
}: {
  campus?: Campus;
  framed?: boolean;
  consumeDraft?: boolean;
  onCampusChange?: (campus: Campus) => void;
  onSave?: (input: { brief: string; constraints: Constraints; routeId: string | null; doneStepIds: string[] }) => void;
  saving?: boolean;
  saveNote?: string;
}) {
  const [brief, setBrief] = useState(EXAMPLES[0].brief);
  const [constraints, setConstraints] = useState<Constraints>({ ...EXAMPLES[0].constraints, budget: 100 });
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [blueprint, setBlueprint] = useState<Blueprint | null>(null);
  const [methodId, setMethodId] = useState<string | null>(null);
  const [qty, setQty] = useState<Record<string, number>>({});
  const [done, setDone] = useState<Record<string, boolean>>({});
  const [openStep, setOpenStep] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [query, setQuery] = useState("");
  const [facility, setFacility] = useState("any");
  const [process, setProcess] = useState("any");
  const [group, setGroup] = useState("any");
  const [tier, setTier] = useState<AccessTier | "any">("any");
  const [openGear, setOpenGear] = useState<string | null>(null);
  const [stamp, setStamp] = useState("");
  const [tab, setTab] = useState<Tab>("brief");
  const [plain, setPlain] = useState(false);
  const [suggestionCursor, setSuggestionCursor] = useState(0);
  const [suggestion, setSuggestion] = useState<Suggestion | null>(null);
  const [fresh, setFresh] = useState<ExampleProject[]>([]);
  const [nextBatch, setNextBatch] = useState<2 | 3>(3);
  const freshIndex = useRef(0);
  const briefBackup = useRef<string | null>(null);

  useEffect(() => {
    setStamp(new Date().toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }));
    try {
      const saved = localStorage.getItem("makermap-done");
      if (saved) setDone(JSON.parse(saved) as Record<string, boolean>);
    } catch {
      /* ignore broken local progress */
    }
  }, []);

  useEffect(() => {
    if (!submitted) return;
    const next = analyzeForCampus(submitted, constraints, campus);
    setBlueprint(next);
    setMethodId((current) => (current && next.routes.some((route) => route.id === current) ? current : next.routes[0]?.id ?? null));
  }, [campus, constraints, submitted]);

  function remember(next: Record<string, boolean>) {
    setDone(next);
    try {
      localStorage.setItem("makermap-done", JSON.stringify(next));
    } catch {
      /* private mode */
    }
  }

  function loadMore() {
    const count = nextBatch;
    const batch = takeBriefs(freshIndex.current, count);
    freshIndex.current += count;
    setFresh((current) => [...current, ...batch]);
    setNextBatch(count === 3 ? 2 : 3);
  }

  function suggest() {
    const idea = pickSuggestion(suggestionCursor, brief);
    setSuggestionCursor((cursor) => cursor + 1);
    setSuggestion(idea);
    setBrief(idea.brief);
    setConstraints(idea.constraints);
    setError("");
  }

  function run(text: string, nextConstraints: Constraints) {
    const clean = text.trim();
    if (clean.length < 12) {
      setError("Give the project a full sentence — what it is, and what it has to survive.");
      return;
    }
    setError("");
    setConstraints(nextConstraints);
    setBrief(clean);
    setBusy(true);
    const go = () => {
      const next = analyzeForCampus(clean, nextConstraints, campus);
      setSubmitted(clean);
      setBlueprint(next);
      setMethodId(next.routes[0]?.id ?? null);
      setOpenStep(next.routes[0]?.steps[0]?.id ?? null);
      setBusy(false);
      setTab("blueprint");
    };
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) go();
    else window.setTimeout(go, 280);
  }

  const selected = blueprint?.routes.find((route) => route.id === methodId) ?? blueprint?.routes[0] ?? null;

  function togglePlain() {
    setPlain((on) => {
      if (!on) {
        briefBackup.current = brief;
        setBrief(simplifyBrief(brief));
        return true;
      }
      if (briefBackup.current != null) setBrief(briefBackup.current);
      briefBackup.current = null;
      return false;
    });
  }

  const draftOnce = useRef(false);
  useEffect(() => {
    if (!consumeDraft || draftOnce.current) return;
    draftOnce.current = true;
    try {
      const raw = sessionStorage.getItem("datum-draft");
      if (!raw) return;
      sessionStorage.removeItem("datum-draft");
      const parsed = JSON.parse(raw) as { brief?: string; constraints?: Constraints };
      if (!parsed.brief || parsed.brief.trim().length < 12) return;
      run(parsed.brief, parsed.constraints ?? constraints);
    } catch {
      /* ignore a bad draft */
    }
  }, [consumeDraft, constraints]);

  const askContext = useMemo(() => {
    if (!blueprint || !selected) {
      return campus === "yale"
        ? "No fabrication plan yet. Bulldogs Build compares CEID, Wright Lab, architecture labs, and research cores."
        : "No fabrication plan yet. Open shop ranks processes for a typical makerspace and does not know this campus's machines.";
    }
    const bits = [
      `Project: ${blueprint.title}`,
      `Route: ${selected.name}. ${selected.why}`,
      `Tradeoff: ${selected.tradeoff}`,
      `Risks: ${selected.risks.map((risk) => risk.title).join("; ")}`,
    ];
    return (plain ? bits.map(plainify) : bits).join("\n");
  }, [blueprint, campus, plain, selected]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return EQUIPMENT.filter((item) => {
      if (facility !== "any" && item.facilityId !== facility) return false;
      if (process !== "any" && item.process !== process) return false;
      if (group !== "any" && !item.materialGroups.includes(group as Equipment["materialGroups"][number])) return false;
      if (tier !== "any" && item.accessTier !== tier) return false;
      if (!needle) return true;
      const hay = `${item.name} ${item.facility} ${item.capabilities} ${item.materials.join(" ")} ${item.process}`.toLowerCase();
      return hay.includes(needle);
    });
  }, [facility, group, process, query, tier]);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <a href="#brief" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-card focus:px-3 focus:py-2">
        Skip to the project brief
      </a>
      <header className={`no-print border-b-4 border-gold text-paper shadow-[0_12px_40px_-24px_rgba(4,24,46,0.8)] ${framed ? "relative" : "sticky top-0 z-30"} ${campus === "yale" ? "bg-yale" : "bg-ink"}`}>
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <button type="button" onClick={() => setTab("brief")} className="flex items-center gap-3 text-left">
            {campus === "yale" ? <BulldogMark /> : null}
            <span className="leading-none">
              <span className="block font-mono text-[10px] tracking-[0.28em] text-paper">{campus === "yale" ? "YALE PACK" : "OPEN SHOP"}</span>
              <span className="mt-1 block font-display text-xl leading-none text-paper">{campus === "yale" ? "Bulldogs Build" : "Any makerspace"}</span>
            </span>
          </button>
          {onCampusChange ? (
            <div className="flex gap-1 text-sm" role="group" aria-label="Campus pack">
              <button type="button" aria-pressed={campus === "open"} onClick={() => onCampusChange("open")} className={`h-11 px-3 ${campus === "open" ? "bg-paper text-ink" : "text-paper"}`}>
                Any shop
              </button>
              <button type="button" aria-pressed={campus === "yale"} onClick={() => onCampusChange("yale")} className={`h-11 px-3 ${campus === "yale" ? "bg-paper text-ink" : "text-paper"}`}>
                Yale
              </button>
            </div>
          ) : null}
          <nav className="flex flex-wrap gap-1 text-sm" aria-label="Sections">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                type="button"
                aria-current={tab === id ? "page" : undefined}
                onClick={() => setTab(id)}
                className={`h-11 rounded-md px-3 ${tab === id ? "bg-paper text-ink" : "text-paper hover:bg-black/20"}`}
              >
                {label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main id="top" data-explain="true">
        <section className={`relative overflow-hidden border-b border-line ${show(tab === "brief")}`}>
          <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="hero-wash pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.15fr_0.85fr] lg:py-20">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-cyan">
                {campus === "yale" ? "CEID · WRIGHT LAB · YSOA · SEAS CORES" : "FDM · LASER · MILL · BOARD HOUSE"}
              </p>
              <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1.02] text-ink sm:text-6xl">
                {campus === "yale" ? "Your idea." : "Your idea."}
                <span className="mt-1 block text-[#8a6a2f]">{campus === "yale" ? "Yale's tools." : "A process you can run."}</span>
                A plan to build it.
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted">
                {campus === "yale"
                  ? "Discover where, how, and with what to make the project at Yale. Save it when the route is the one you will actually build."
                  : "Rank a process for a shop that is not Yale. The plan names what to ask for. It does not pretend to know your lab's machines."}
              </p>
              <dl className="mt-8 grid grid-cols-3 gap-3 max-w-lg">
                {[
                  ["01", "Read the brief"],
                  ["02", "Rank processes"],
                  ["03", "Name the shop"],
                ].map(([n, label]) => (
                  <div key={n} className="border-t border-yale pt-2">
                    <dt className="font-mono text-xs text-cyan">{n}</dt>
                    <dd className="text-sm">{label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <form
              id="brief"
              className="form-card border border-line bg-card p-4 shadow-[0_24px_60px_-28px_rgba(4,24,46,0.55)] sm:p-5"
              onSubmit={(event) => {
                event.preventDefault();
                run(brief, constraints);
              }}
            >
              <div className="flex items-center justify-between gap-3">
                <label htmlFor="project-brief" className="font-mono text-xs tracking-[0.16em] text-muted">
                  PROJECT BRIEF
                </label>
                <button
                  type="button"
                  aria-pressed={plain}
                  onClick={togglePlain}
                  className={`h-9 px-2 font-mono text-xs tracking-[0.14em] ${plain ? "bg-cyan text-paper" : "text-cyan"}`}
                >
                  {plain ? "PLAIN LANGUAGE ON" : "PLAIN LANGUAGE"}
                </button>
              </div>
              <textarea
                id="project-brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                rows={6}
                className="mt-3 w-full resize-y border border-line bg-paper px-3 py-3 text-base text-ink outline-none"
                placeholder="I want to build a waterproof enclosure for an Arduino-based water-quality sensor."
              />
              {plain ? (
                <p className="mt-2 text-sm text-muted">On. The brief and the plan use everyday words. Click again to restore your wording.</p>
              ) : null}
              {error ? (
                <p role="alert" className="mt-2 text-sm text-danger">
                  {error}
                </p>
              ) : null}
              <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_auto]">
                <button
                  type="submit"
                  className="flex h-12 items-center justify-center gap-2 bg-yale px-4 text-base font-medium text-paper hover:bg-yale-ink"
                >
                  Find my build path
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </button>
                <button
                  type="button"
                  onClick={suggest}
                  className="h-12 border border-yale px-4 text-sm font-medium text-yale hover:bg-paper"
                >
                  Suggest a project
                </button>
              </div>
              {suggestion ? <p className="mt-2 text-sm text-muted">{suggestion.hook}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                {EXAMPLES.map((example) => (
                  <button
                    key={example.id}
                    type="button"
                    onClick={() => run(example.brief, example.constraints)}
                    className="chip border border-line bg-paper px-3 py-2 text-left text-sm"
                  >
                    {example.label}
                  </button>
                ))}
              </div>
              <button type="button" onClick={loadMore} className="mt-3 text-sm text-yale underline">
                {nextBatch === 3 ? "Three more ideas" : "Two more ideas"}
              </button>
            </form>
          </div>
        </section>

        <div className={show(tab === "brief")}>
          {fresh.length > 0 ? (
            <section className="border-t border-line bg-card">
              <div className="mx-auto max-w-6xl px-4 py-8">
                <p className="font-mono text-xs tracking-[0.16em] text-cyan">ANOTHER BRIEF</p>
                <h2 className="mt-2 font-display text-3xl">Different from the last one.</h2>
                <div className="mt-5">
                  <FreshIdeas ideas={fresh} nextBatch={nextBatch} onOpen={(example) => run(example.brief, example.constraints)} onMore={loadMore} />
                </div>
              </div>
            </section>
          ) : null}
          <BeginnerPlans onOpen={(plan) => run(plan.brief, plan.constraints)} />
        </div>

        <section className={`no-print mx-auto max-w-6xl px-4 py-8 ${show(tab === "brief" || tab === "blueprint")}`}>
          <ConstraintsPanel constraints={constraints} onChange={setConstraints} />
        </section>

        <section id="blueprint" className={`border-t border-line bg-card ${show(tab === "blueprint", true)}`}>
          <div className="print-root mx-auto max-w-6xl px-4 py-12">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="font-mono text-xs tracking-[0.16em] text-cyan">BUILD BLUEPRINT</p>
                <h2 className="mt-2 font-display text-4xl text-yale">{blueprint ? (plain ? plainify(blueprint.title) : blueprint.title) : "Waiting on a brief"}</h2>
                <p className="no-print mt-2 max-w-xl text-sm text-muted">Highlight a sentence in the plan or in your brief, then choose Explain or Ask.</p>
              </div>
              {blueprint ? (
                <div className="no-print flex flex-wrap gap-2">
                  {onSave ? (
                    <button
                      type="button"
                      disabled={saving || !selected}
                      onClick={() => {
                        if (!selected) return;
                        const routeStepsDone = selected.steps.filter((step) => done[step.id]).map((step) => step.id);
                        onSave({ brief: submitted ?? brief, constraints, routeId: selected.id, doneStepIds: routeStepsDone });
                      }}
                      className="inline-flex h-11 items-center bg-ink px-4 text-sm text-paper disabled:opacity-60"
                    >
                      {saving ? "Saving…" : "Save to bench"}
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex h-11 items-center gap-2 border border-ink px-4 text-sm"
                  >
                    <Printer className="h-4 w-4" aria-hidden="true" />
                    Export / print
                  </button>
                </div>
              ) : null}
            </div>
            {saveNote ? <p className="no-print mt-3 text-sm text-danger">{saveNote}</p> : null}
            <p className="mt-2 hidden print:block font-mono text-xs">
              {campus === "yale" ? "Bulldogs Build" : "Datum open shop"} · {stamp} · Not an official shop system
            </p>

            {busy ? (
              <p className="mt-8 border border-line bg-paper px-4 py-6 text-muted" role="status">
                Matching the brief to published shop rules…
              </p>
            ) : null}

            {!blueprint && !busy ? (
              <div className="mt-8 border border-dashed border-line bg-paper px-5 py-8">
                <p className="max-w-xl text-muted">
                  Describe a part, or start from an example. The plan will name a process, the Yale machine that can do it, what training stands in the way, and what it will not promise.
                </p>
                <div className="mt-5 grid gap-3 sm:grid-cols-2">
                  {EXAMPLES.map((example) => (
                    <ExampleCard key={example.id} example={example} onOpen={() => run(example.brief, example.constraints)} />
                  ))}
                </div>
              </div>
            ) : null}

            {blueprint && selected ? (
              <BlueprintView
                plain={plain}
                blueprint={blueprint}
                selected={selected}
                stamp={stamp}
                qty={qty}
                done={done}
                openStep={openStep}
                onSelect={(id) => {
                  setMethodId(id);
                  const route = blueprint.routes.find((item) => item.id === id);
                  setOpenStep(route?.steps[0]?.id ?? null);
                }}
                onQty={(key, value) => setQty((current) => ({ ...current, [key]: value }))}
                onToggle={(key) => {
                  const next = { ...done, [key]: !done[key] };
                  remember(next);
                }}
                onOpenStep={setOpenStep}
                constraints={constraints}
                campus={campus}
              />
            ) : null}
          </div>
        </section>

        <section id="explorer" className={`no-print mx-auto max-w-6xl px-4 py-14 ${show(tab === "machines")}`}>
          {campus === "open" ? (
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-cyan">PROCESS PRIMER</p>
              <h2 className="mt-2 font-display text-4xl text-ink">What to ask a shop that is not Yale</h2>
              <p className="mt-3 max-w-2xl text-muted">
                These are the processes the ranker is choosing between. Your lab may not have all of them. Bulldogs Build is the page that names real Yale machines.
              </p>
              <ul className="mt-6 grid gap-3 md:grid-cols-2">
                {OPEN_PROCESSES.map((item) => (
                  <li key={item.id} className="border border-line bg-card p-4">
                    <h3 className="font-display text-2xl">{item.name}</h3>
                    <p className="mt-2 text-sm">{item.fit}</p>
                    <p className="mt-2 text-sm text-warn">{item.watch}</p>
                    <p className="mt-2 text-sm text-muted">{item.ask}</p>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
          <>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-cyan">YALE MACHINE EXPLORER</p>
              <h2 className="mt-2 font-display text-4xl text-yale">What is actually published</h2>
            </div>
            <p className="max-w-sm text-sm text-muted">
              {filtered.length} of {EQUIPMENT.length} entries. Every card has a source. None of them know tonight’s queue.
            </p>
          </div>

          <div className="mt-6 grid gap-3 lg:grid-cols-[1.2fr_repeat(4,minmax(0,1fr))]">
            <label className="block">
              <span className="font-mono text-xs text-muted">Search</span>
              <span className="mt-1 flex h-11 items-center gap-2 border border-line bg-card px-3">
                <Search className="h-4 w-4 text-muted" aria-hidden="true" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Laser, acrylic, Gibbs…"
                  aria-label="Search equipment"
                />
              </span>
            </label>
            <Select label="Facility" value={facility} onChange={setFacility} options={[{ id: "any", label: "All facilities" }, ...FACILITIES.map((item) => ({ id: item.id, label: item.short }))]} />
            <Select
              label="Process"
              value={process}
              onChange={setProcess}
              options={[{ id: "any", label: "All processes" }, ...Array.from(new Set(EQUIPMENT.map((item) => item.process))).sort().map((item) => ({ id: item, label: item }))]}
            />
            <Select label="Material" value={group} onChange={setGroup} options={GROUP_OPTIONS} />
            <Select label="Access" value={tier} onChange={(value) => setTier(value as AccessTier | "any")} options={TIER_OPTIONS} />
          </div>

          <div className="mt-4 flex flex-wrap gap-2 text-xs">
            <span className={`px-2 py-1 ${verifyClass("verified")}`}>Verified</span>
            <span className={`px-2 py-1 ${verifyClass("needs_confirmation")}`}>Needs confirmation</span>
            <span className={`px-2 py-1 ${verifyClass("restricted")}`}>Restricted access</span>
            <span className="bg-paper-2 px-2 py-1 text-muted">Availability not verified</span>
          </div>

          {filtered.length === 0 ? (
            <p className="mt-8 border border-dashed border-line px-4 py-8 text-muted">
              Nothing matches. Clear a filter — restricted architecture machines are hidden when you ask only for membership access.
              <button
                type="button"
                className="ml-2 text-cyan"
                onClick={() => {
                  setQuery("");
                  setFacility("any");
                  setProcess("any");
                  setGroup("any");
                  setTier("any");
                }}
              >
                Reset filters
              </button>
            </p>
          ) : (
            <ul className="mt-6 grid gap-3">
              {filtered.map((item) => (
                <li key={item.id} className="border border-line bg-card">
                  <button
                    type="button"
                    className="flex w-full items-start justify-between gap-3 px-4 py-4 text-left"
                    aria-expanded={openGear === item.id}
                    onClick={() => setOpenGear((current) => (current === item.id ? null : item.id))}
                  >
                    <span>
                      <span className="block font-medium">{item.name}</span>
                      <span className="mt-1 block text-sm text-muted">
                        {item.facility} · {item.process}
                      </span>
                    </span>
                    <span className={`shrink-0 px-2 py-1 text-xs ${verifyClass(item.verification)}`}>{verifyLabel(item.verification)}</span>
                  </button>
                  {openGear === item.id ? <GearBody item={item} plain={plain} /> : null}
                </li>
              ))}
            </ul>
          )}
          </>
          )}
        </section>

        <section id="gallery" className={`no-print border-t border-line bg-paper-2 ${show(tab === "examples")}`}>
          <BeginnerPlans tone="paper" onOpen={(plan) => run(plan.brief, plan.constraints)} />
          <div className="mx-auto max-w-6xl px-4 pb-14">
            <p className="font-mono text-xs tracking-[0.16em] text-cyan">KEEP GOING</p>
            <h2 className="mt-2 font-display text-4xl text-yale">A different brief every time</h2>
            <p className="mt-3 max-w-2xl text-muted">Each click adds two or three projects you have not seen. The list does not run out and it does not repeat.</p>
            <div className="mt-6">
              <FreshIdeas ideas={fresh} nextBatch={nextBatch} onOpen={(example) => run(example.brief, example.constraints)} onMore={loadMore} featured />
            </div>
          </div>
        </section>
      </main>

      <section id="sources" className={`border-t border-yale bg-yale-ink text-paper ${show(tab === "sources")}`}>
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-[1.2fr_1fr]">
          <div>
            <p className="font-display text-3xl">Not a campus login. A reading of public pages.</p>
            <p className="mt-3 max-w-xl text-sm text-paper-2">
              Bulldogs Build is an independent planning aid. It is not an official Yale University system. Equipment facts come from public Yale pages and can change. Confirm access, training, and safety with the facility before you cut, print, or power anything. Nothing here certifies a design as waterproof, strong, or safe.
            </p>
          </div>
          <ul className="space-y-2 text-sm">
            {FACILITIES.map((item) => (
              <li key={item.id}>
                <a className="inline-flex items-center gap-1 underline" href={item.url} target="_blank" rel="noreferrer">
                  {item.name}
                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                </a>
                <p className="text-paper-2">{item.note}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>
      <SelectionAsk context={askContext} campus={campus} />
    </div>
  );
}

function ConstraintsPanel({ constraints, onChange }: { constraints: Constraints; onChange: (next: Constraints) => void }) {
  return (
    <div className="border border-line bg-card p-4 sm:p-5">
      <div className="flex items-center gap-2">
        <Shield className="h-4 w-4 text-cyan" aria-hidden="true" />
        <h2 className="font-mono text-xs tracking-[0.16em] text-muted">ENGINEERING CONSTRAINTS</h2>
      </div>
      <p className="mt-2 text-sm text-muted">These rewrite the ranking as soon as a blueprint exists. Assumptions stay labeled.</p>
      <div className="mt-4 grid gap-5 lg:grid-cols-4">
        <label className="block">
          <span className="flex items-baseline justify-between gap-2 text-sm">
            Materials budget
            <span className="font-mono text-cyan">${constraints.budget}</span>
          </span>
          <input
            className="mt-3"
            type="range"
            min={20}
            max={500}
            step={10}
            value={Math.min(500, Math.max(20, constraints.budget))}
            aria-valuetext={`${constraints.budget} dollars`}
            onChange={(event) => onChange({ ...constraints, budget: Number(event.target.value) })}
          />
          <span className="mt-2 flex items-center gap-2 text-sm">
            <span className="text-muted">Or type</span>
            <input
              className="h-10 w-28 border border-line bg-paper px-2 font-mono"
              type="number"
              min={1}
              inputMode="numeric"
              aria-label="Materials budget in dollars"
              value={constraints.budget}
              onChange={(event) => {
                const next = Number(event.target.value);
                if (!Number.isFinite(next)) return;
                onChange({ ...constraints, budget: Math.max(1, Math.min(20000, Math.round(next))) });
              }}
            />
          </span>
          {constraints.budget < 20 || constraints.budget > 500 ? (
            <p className="mt-2 text-sm text-warn">Outside the slider. Rankings use ${constraints.budget}.</p>
          ) : null}
        </label>
        <Segment
          label="Scale"
          value={constraints.size}
          options={[
            ["handheld", "Handheld"],
            ["bench", "Bench"],
            ["large", "Large"],
          ]}
          onChange={(size) => onChange({ ...constraints, size: size as Constraints["size"] })}
        />
        <Segment
          label="Material lock"
          value={constraints.material}
          options={[
            ["any", "Any"],
            ["plastic", "Plastic"],
            ["acrylic", "Acrylic"],
            ["wood", "Wood"],
            ["metal", "Metal"],
          ]}
          onChange={(material) => onChange({ ...constraints, material: material as Constraints["material"] })}
        />
        <Segment
          label="Experience"
          value={constraints.experience}
          options={[
            ["new", "New"],
            ["some", "Some"],
            ["trained", "Shop-trained"],
          ]}
          onChange={(experience) => onChange({ ...constraints, experience: experience as Constraints["experience"] })}
        />
      </div>
      <div className="mt-5 grid gap-5 lg:grid-cols-4">
        <Segment
          label="Precision"
          value={constraints.precision ?? "normal"}
          options={[
            ["loose", "Loose"],
            ["normal", "Normal"],
            ["tight", "Tight"],
          ]}
          onChange={(precision) => onChange({ ...constraints, precision: precision as Constraints["precision"] })}
        />
        <Segment
          label="Mechanical stress"
          value={constraints.stress ?? "moderate"}
          options={[
            ["light", "Light"],
            ["moderate", "Moderate"],
            ["structural", "Structural"],
          ]}
          onChange={(stress) => onChange({ ...constraints, stress: stress as Constraints["stress"] })}
        />
        <Segment
          label="Water / heat"
          value={constraints.exposure ?? "indoor"}
          options={[
            ["indoor", "Indoor"],
            ["splash", "Splash"],
            ["immersion", "Immersion"],
            ["heat", "Heat"],
          ]}
          onChange={(exposure) => onChange({ ...constraints, exposure: exposure as Constraints["exposure"] })}
        />
        <Segment
          label="Time you have"
          value={constraints.time ?? "week"}
          options={[
            ["evening", "An evening"],
            ["week", "A week"],
            ["month", "A month"],
          ]}
          onChange={(time) => onChange({ ...constraints, time: time as Constraints["time"] })}
        />
      </div>
    </div>
  );
}

function Segment({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
}) {
  return (
    <fieldset>
      <legend className="text-sm">{label}</legend>
      <div className="mt-2 flex flex-wrap gap-1">
        {options.map(([id, text]) => (
          <button
            key={id}
            type="button"
            aria-pressed={value === id}
            onClick={() => onChange(id)}
            className={`h-10 px-3 text-sm ${value === id ? "bg-yale text-paper" : "border border-line bg-paper text-ink"}`}
          >
            {text}
          </button>
        ))}
      </div>
    </fieldset>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { id: string; label: string }[];
}) {
  return (
    <label className="block text-sm">
      <span className="font-mono text-xs text-muted">{label}</span>
      <select
        className="mt-1 h-11 w-full border border-line bg-card px-2"
        value={value}
        aria-label={label}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function FreshIdeas({
  ideas,
  nextBatch,
  onOpen,
  onMore,
  featured = false,
}: {
  ideas: ExampleProject[];
  nextBatch: 2 | 3;
  onOpen: (example: ExampleProject) => void;
  onMore: () => void;
  featured?: boolean;
}) {
  const label = nextBatch === 3 ? "Three more ideas" : "Two more ideas";
  return (
    <div>
      {ideas.length > 0 ? (
        <div className="idea-well pr-1">
          <div className={featured ? "grid gap-3 md:grid-cols-2" : "grid gap-3 sm:grid-cols-2 lg:grid-cols-3"}>
            {ideas.map((example) =>
              featured ? (
                <ExampleCard key={example.id} example={example} onOpen={() => onOpen(example)} featured />
              ) : (
                <button
                  key={example.id}
                  type="button"
                  onClick={() => onOpen(example)}
                  className="lift border border-line bg-paper px-4 py-4 text-left"
                >
                  <span className="font-mono text-[10px] tracking-[0.14em] text-cyan">{example.kicker.toUpperCase()}</span>
                  <span className="mt-2 block font-display text-2xl leading-tight">{example.label}</span>
                </button>
              ),
            )}
          </div>
        </div>
      ) : null}
      <button type="button" onClick={onMore} className="mt-3 inline-flex h-11 items-center bg-yale px-4 text-sm text-paper">
        {label}
      </button>
    </div>
  );
}

function ExampleCard({ example, onOpen, featured = false }: { example: ExampleProject; onOpen: () => void; featured?: boolean }) {
  const icon = example.id === "waterproof" ? Droplets : example.id === "arm" ? Layers : example.id === "pcb" ? CircuitBoard : example.id === "turbine" ? Wind : Box;
  const Icon = icon;
  return (
    <button type="button" onClick={onOpen} className="lift flex h-full flex-col border border-line bg-card p-4 text-left">
      <span className="flex items-center justify-between gap-3">
        <Icon className="h-5 w-5 text-cyan" aria-hidden="true" />
        <span className="font-mono text-xs tracking-[0.14em] text-muted">{example.kicker.toUpperCase()}</span>
      </span>
      <span className="mt-3 font-medium">{example.label}</span>
      {featured ? <span className="mt-2 text-sm text-muted">{example.brief}</span> : null}
    </button>
  );
}

function softenRoute(route: RoutePlan): RoutePlan {
  return {
    ...route,
    name: plainify(route.name),
    tagline: plainify(route.tagline),
    why: plainify(route.why),
    tradeoff: plainify(route.tradeoff),
    hours: plainify(route.hours),
    deadEnd: route.deadEnd ? plainify(route.deadEnd) : undefined,
    assumptions: route.assumptions.map(plainify),
    steps: route.steps.map((step) => ({
      ...step,
      title: plainify(step.title),
      detail: plainify(step.detail),
      advice: plainify(step.advice),
    })),
    bom: route.bom.map((line) => ({
      ...line,
      item: plainify(line.item),
      note: plainify(line.note),
      costNote: plainify(line.costNote),
    })),
    risks: route.risks.map((risk) => ({ ...risk, title: plainify(risk.title), detail: plainify(risk.detail) })),
  };
}

function BlueprintView({
  plain,
  blueprint: sourceBlueprint,
  selected: sourceRoute,
  stamp,
  qty,
  done,
  openStep,
  onSelect,
  onQty,
  onToggle,
  onOpenStep,
  constraints,
  campus,
}: {
  plain: boolean;
  blueprint: Blueprint;
  selected: RoutePlan;
  stamp: string;
  qty: Record<string, number>;
  done: Record<string, boolean>;
  openStep: string | null;
  onSelect: (id: string) => void;
  onQty: (key: string, value: number) => void;
  onToggle: (key: string) => void;
  onOpenStep: (id: string) => void;
  constraints: Constraints;
  campus: Campus;
}) {
  const blueprint = plain
    ? {
        ...sourceBlueprint,
        title: plainify(sourceBlueprint.title),
        summary: plainify(sourceBlueprint.summary),
        aside: sourceBlueprint.aside ? plainify(sourceBlueprint.aside) : null,
        readout: sourceBlueprint.readout.map(plainify),
        assumptions: sourceBlueprint.assumptions.map(plainify),
        routes: sourceBlueprint.routes.map(softenRoute),
      }
    : sourceBlueprint;
  const selected = blueprint.routes.find((route) => route.id === sourceRoute.id) ?? blueprint.routes[0];
  if (!selected) return null;
  const total = selected.bom.reduce((sum, line) => {
    const key = `${selected.id}:${line.id}`;
    const count = qty[key] ?? line.qty;
    return sum + (lineCost(line, count) ?? 0);
  }, 0);
  const unknown = selected.bom.some((line) => line.unitCost == null);
  const finished = selected.steps.filter((step) => done[`${selected.id}:${step.id}`]).length;

  return (
    <div className="mt-8">
      <p className="max-w-3xl text-lg">{blueprint.summary}</p>
      <ul className="mt-4 flex flex-wrap gap-2">
        {blueprint.readout.map((item) => (
          <li key={item} className="bg-cyan-2 px-2 py-1 text-sm text-cyan">
            {item}
          </li>
        ))}
      </ul>
      {blueprint.aside ? (
        <p className="mt-4 border-l-2 border-cyan bg-paper px-4 py-3 text-sm">{blueprint.aside}</p>
      ) : null}

      <h3 className="mt-10 font-display text-2xl text-yale">Compare fabrication routes</h3>
      <div className="mt-4 grid gap-3 lg:grid-cols-3">
        {blueprint.routes.map((route, index) => (
          <button
            key={route.id}
            type="button"
            onClick={() => onSelect(route.id)}
            aria-pressed={route.id === selected.id}
            className={`lift border p-4 text-left ${route.id === selected.id ? "border-cyan bg-cyan-2 shadow-[inset_4px_0_0_#c4a35a]" : "border-line bg-paper"}`}
          >
            <span className="font-mono text-xs text-muted">{index === 0 ? "LEAD PATH" : `ALTERNATE 0${index}`}</span>
            <span className="mt-1 block font-medium">{route.name}</span>
            <span className="mt-1 block text-sm text-muted">{route.tagline}</span>
            <span className="mt-3 grid grid-cols-2 gap-2 text-xs">
              <Stat label="Suitability" value={route.suitability} />
              <Stat label="Access" value={route.accessibility} />
              <Stat label="Cost fit" value={route.costScore} />
              <Stat label="Difficulty" value={route.difficulty} invert />
            </span>
          </button>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto border border-line">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-paper-2 font-mono text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium"> </th>
              {blueprint.routes.map((route) => (
                <th key={route.id} className="px-3 py-2 font-medium">
                  {route.name}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Fit", (route: RoutePlan) => scoreWord(route.suitability)],
                ["Access", (route: RoutePlan) => scoreWord(route.accessibility)],
                ["Cost fit", (route: RoutePlan) => scoreWord(route.costScore)],
                ["Difficulty", (route: RoutePlan) => ease(route.difficulty)],
                ["Time", (route: RoutePlan) => route.hours],
                ["Gate", (route: RoutePlan) => tierLabel(route.accessTier)],
              ] as [string, (route: RoutePlan) => string][]
            ).map(([label, read]) => (
              <tr key={label} className="border-t border-line align-top">
                <th className="px-3 py-2 font-medium">{label}</th>
                {blueprint.routes.map((route) => (
                  <td key={route.id} className="px-3 py-2 text-muted">
                    {read(route)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted">
        <span className="font-medium text-ink">Why this route: </span>
        {selected.why} <span className="font-medium text-ink">Why not blindly: </span>
        {selected.tradeoff}
      </p>
      {blueprint.questions.length ? (
        <div className="mt-6 border border-line bg-paper p-4">
          <h3 className="font-display text-xl text-yale">Still worth answering</h3>
          <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-muted">
            {blueprint.questions.map((question) => (
              <li key={question}>{question}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-10 grid gap-8 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <div className="flex items-baseline justify-between gap-3">
            <h3 className="font-display text-2xl text-yale">Build path</h3>
            <p className="font-mono text-xs text-muted">
              {finished}/{selected.steps.length} marked
            </p>
          </div>
          <p className="mt-1 text-sm text-muted">{selected.hours}</p>
          <ol className="mt-4 space-y-2">
            {selected.steps.map((step, index) => {
              const key = `${selected.id}:${step.id}`;
              const open = openStep === step.id;
              return (
                <li key={step.id} className="border border-line bg-paper">
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="flex min-h-12 flex-1 items-start gap-3 px-3 py-3 text-left"
                      aria-expanded={open}
                      onClick={() => onOpenStep(open ? "" : step.id)}
                    >
                      <span className="mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center border border-yale font-mono text-xs text-yale">
                        {index + 1}
                      </span>
                      <span>
                        <span className="block font-medium">{step.title}</span>
                        <span className="mt-1 block text-xs text-muted">
                          {step.kind === "yale" ? "Yale-sourced step" : step.kind === "assumption" ? "Assumption" : "General engineering"}
                          {step.minutes ? ` · about ${step.minutes} min` : ""}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      className="m-2 flex h-11 w-11 items-center justify-center border border-line"
                      aria-pressed={Boolean(done[key])}
                      aria-label={done[key] ? `Mark ${step.title} incomplete` : `Mark ${step.title} complete`}
                      onClick={() => onToggle(key)}
                    >
                      <Check className={`h-4 w-4 ${done[key] ? "text-ok" : "text-muted"}`} aria-hidden="true" />
                    </button>
                  </div>
                  {open ? (
                    <div className="border-t border-line px-4 py-3 text-sm">
                      <p>{step.detail}</p>
                      <p className="mt-2 text-muted">{step.advice}</p>
                      <p className="mt-2 font-mono text-xs text-cyan">
                        Tools: {step.tools.map((id) => getEquipment(id)?.name ?? ADVISORIES.find((item) => item.id === id)?.name ?? id).join(" · ")}
                      </p>
                    </div>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <div>
          <h3 className="font-display text-2xl text-yale">Yale equipment</h3>
          <ul className="mt-4 space-y-3">
            {selected.equipmentIds.map((id) => {
              const gear = getEquipment(id);
              if (!gear) {
                const note = ADVISORIES.find((item) => item.id === id);
                return (
                  <li key={id} className="border border-line bg-warn-bg p-3 text-sm text-warn">
                    <p className="font-medium">{note?.name ?? id}</p>
                    <p className="mt-1">{note?.detail}</p>
                    <p className="mt-2 font-mono text-xs">General engineering recommendation · not a Yale machine</p>
                  </li>
                );
              }
              return (
                <li key={id} className="border border-line bg-paper p-3">
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium">{gear.name}</p>
                    <span className={`px-2 py-1 text-xs ${verifyClass(gear.verification)}`}>{verifyLabel(gear.verification)}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted">
                    {gear.facility} · {gear.process}
                  </p>
                  <p className="mt-2 text-sm">{plain ? plainify(gear.capabilities) : gear.capabilities}</p>
                  <p className="mt-2 text-sm">
                    <span className="font-medium">Training. </span>
                    {plain ? plainify(gear.training) : gear.training}
                  </p>
                  <p className="mt-1 text-sm">
                    <span className="font-medium">Access. </span>
                    {plain ? plainify(`${gear.access} ${gear.eligibility}`) : `${gear.access} ${gear.eligibility}`}
                  </p>
                  <p className="mt-2 font-mono text-xs text-muted">Availability not verified</p>
                  {gear.alternativeId ? (
                    <p className="mt-2 text-sm">
                      <span className="font-medium">If you cannot get in: </span>
                      {plain && gear.alternativeNote ? plainify(gear.alternativeNote) : gear.alternativeNote}{" "}
                      <span className="text-muted">Try {getEquipment(gear.alternativeId)?.name}.</span>
                    </p>
                  ) : null}
                  <a className="mt-2 inline-flex items-center gap-1 text-sm text-cyan" href={gear.sourceUrl} target="_blank" rel="noreferrer">
                    {gear.sourceName}
                    <ExternalLink className="h-3 w-3" aria-hidden="true" />
                  </a>
                </li>
              );
            })}
          </ul>
          {selected.deadEnd ? <p className="mt-3 border border-danger bg-danger-bg p-3 text-sm text-danger">{selected.deadEnd}</p> : null}
        </div>
      </div>

      <h3 className="mt-10 font-display text-2xl text-yale">Materials</h3>
      <p className="mt-1 text-sm text-muted">Quantities are editable. The total ignores lines whose Yale price was never published.</p>
      <div className="mt-3 overflow-x-auto border border-line">
        <table className="w-full min-w-[680px] text-left text-sm">
          <thead className="bg-paper-2 font-mono text-xs text-muted">
            <tr>
              <th className="px-3 py-2 font-medium">Item</th>
              <th className="px-3 py-2 font-medium">Qty</th>
              <th className="px-3 py-2 font-medium">Unit cost</th>
              <th className="px-3 py-2 font-medium">Line</th>
            </tr>
          </thead>
          <tbody>
            {selected.bom.map((line) => {
              const key = `${selected.id}:${line.id}`;
              const count = qty[key] ?? line.qty;
              const cost = lineCost(line, count);
              return (
                <tr key={line.id} className="border-t border-line align-top">
                  <td className="px-3 py-3">
                    <p className="font-medium">{line.item}</p>
                    <p className="text-muted">{line.note}</p>
                    <p className="font-mono text-xs text-cyan">{line.costNote}</p>
                  </td>
                  <td className="px-3 py-3">
                    <label className="font-mono text-xs text-muted">
                      {line.unit}
                      <input
                        className="mt-1 block h-10 w-20 border border-line bg-paper px-2"
                        type="number"
                        min={0}
                        max={99}
                        value={count}
                        aria-label={`Quantity for ${line.item}`}
                        onChange={(event) => onQty(key, Number(event.target.value))}
                      />
                    </label>
                  </td>
                  <td className="px-3 py-3">{line.unitCost == null ? "Unpublished" : `$${line.unitCost}`}</td>
                  <td className="px-3 py-3">{cost == null ? "—" : `$${cost}`}</td>
                </tr>
              );
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-line bg-paper">
              <td className="px-3 py-3 font-medium" colSpan={3}>
                Estimated known total {unknown ? "(incomplete)" : ""}
              </td>
              <td className="px-3 py-3 font-medium">${total}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <h3 className="mt-10 flex items-center gap-2 font-display text-2xl text-yale">
        <AlertTriangle className="h-5 w-5 text-warn" aria-hidden="true" />
        Risk checks
      </h3>
      <ul className="mt-3 grid gap-3 md:grid-cols-2">
        {selected.risks.map((risk) => (
          <li key={risk.title} className={`border p-4 text-sm ${risk.severity === "stop" ? "border-danger bg-danger-bg" : "border-line bg-warn-bg"}`}>
            <p className="font-medium">{risk.severity === "stop" ? "Stop and test" : "Watch"} · {risk.title}</p>
            <p className="mt-1">{risk.detail}</p>
          </li>
        ))}
      </ul>

      <h3 className="mt-10 font-display text-2xl text-yale">Before you visit the shop</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm">
        {prepList(selected, constraints, campus).map((item) => (
          <li key={item}>{plain ? plainify(item) : item}</li>
        ))}
      </ul>
      <TermList routeId={selected.id} />

      <h3 className="mt-10 font-display text-2xl text-yale">Labeled assumptions</h3>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-sm text-muted">
        {blueprint.assumptions.map((item) => (
          <li key={item}>{item}</li>
        ))}
        {selected.assumptions.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
      <p className="mt-6 font-mono text-xs text-muted">Prepared {stamp || "today"} · Switch routes above to rewrite machines, steps, and this bill.</p>
      <p className="mt-2 hidden items-center gap-2 text-xs text-muted print:flex">
        <Factory className="h-3 w-3" aria-hidden="true" />
        Sources are the links printed on each equipment block. Availability not verified.
      </p>
    </div>
  );
}

function GearBody({ item, plain }: { item: Equipment; plain: boolean }) {
  const say = (text: string) => (plain ? plainify(text) : text);
  return (
    <div className="border-t border-line px-4 py-4 text-sm">
      <p>{say(item.capabilities)}</p>
      <p className="mt-2">
        <span className="font-medium">Materials. </span>
        {item.materials.join(", ")}
      </p>
      <p className="mt-2">
        <span className="font-medium">Training. </span>
        {say(item.training)}
      </p>
      <p className="mt-2">
        <span className="font-medium">Eligibility. </span>
        {say(item.eligibility)}
      </p>
      <p className="mt-2">
        <span className="font-medium">Access. </span>
        {say(item.access)}
      </p>
      <p className="mt-2 text-muted">{say(item.verificationDetail)}</p>
      <p className="mt-2 font-mono text-xs">Availability not verified</p>
      {item.alternativeNote ? (
        <p className="mt-3 bg-cyan-2 p-3 text-ink">
          {item.alternativeNote}
          {item.alternativeId ? ` Next door on campus: ${getEquipment(item.alternativeId)?.name}.` : ""}
        </p>
      ) : null}
      <a className="mt-3 inline-flex items-center gap-1 text-cyan" href={item.sourceUrl} target="_blank" rel="noreferrer">
        {item.sourceName}
        <ExternalLink className="h-3 w-3" aria-hidden="true" />
      </a>
    </div>
  );
}

function Stat({ label, value, invert = false }: { label: string; value: number; invert?: boolean }) {
  return (
    <span>
      <span className="block text-muted">{label}</span>
      <span className="tick mt-1 block" aria-hidden="true">
        <span style={{ width: `${invert ? 100 - value : value}%` }} />
      </span>
      <span className="font-mono">{scoreWord(value, invert)}</span>
    </span>
  );
}

function scoreWord(value: number, invert = false): string {
  const score = invert ? 100 - value : value;
  if (score >= 70) return "Strong";
  if (score >= 45) return "Fair";
  return "Weak";
}

function TermList({ routeId }: { routeId: string }) {
  const terms = [
    { term: "Tolerance", text: "How far a real part may drift from the drawing and still work. A press fit is tight. A laser-cut slot usually is not." },
    { term: "Kerf", text: "Material the laser burns away. Holes come out larger than the drawing until you measure a coupon from the same sheet." },
    { term: "FDM", text: "Printing plastic in layers. At CEID the published member machines use PLA. Fine for a shape. Weak as a seal or a loaded part." },
    routeId === "cnc" || routeId === "professional" || routeId === "waterjet"
      ? { term: "CNC milling", text: "A spinning cutter removes metal or plastic from a solid blank. Use it when a dimension or a load matters. Access at CEID is by asking, not by membership alone." }
      : { term: "Laser cutting", text: "A CO2 laser cuts flat wood, acrylic, and a short list of other sheets. It does not cut metal at CEID, and it does not make a 3D shape unless you design flats." },
    { term: "Before the CEID", text: "Bring a file, a material choice, and the training they name. Ask what they will not cut. Do not treat this plan as a booking or a safety sign-off." },
  ];
  return (
    <details className="mt-8 border border-line bg-paper p-4">
      <summary className="cursor-pointer font-medium text-yale">What these words mean</summary>
      <dl className="mt-3 space-y-3">
        {terms.map((item) => (
          <div key={item.term}>
            <dt className="font-medium">{item.term}</dt>
            <dd className="text-sm text-muted">{item.text}</dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

function SelectionAsk({ context, campus }: { context: string; campus: "open" | "yale" }) {
  const panelRef = useRef<HTMLDivElement>(null);
  const [quote, setQuote] = useState("");
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState<"explain" | "ask" | null>(null);
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [source, setSource] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    function place(text: string, x: number, y: number) {
      const maxX = Math.max(180, window.innerWidth - 180);
      setQuote(text);
      setPos({ x: Math.min(Math.max(x, 180), maxX), y: Math.max(y, 80) });
      setOpen(true);
      setMode(null);
      setAnswer("");
      setError("");
      setQuestion("");
      setSource("");
    }

    function onPointerUp(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      if (target instanceof HTMLTextAreaElement && target.id === "project-brief") {
        const text = target.value.slice(target.selectionStart, target.selectionEnd).trim();
        if (text.length < 2) return;
        const rect = target.getBoundingClientRect();
        place(text, rect.left + Math.min(rect.width / 2, 240), rect.top);
        return;
      }
      const selection = window.getSelection();
      const text = selection?.toString().replace(/\s+/g, " ").trim() ?? "";
      if (text.length < 2 || text.length > 700) return;
      const node = selection?.anchorNode;
      const el = node instanceof Element ? node : node?.parentElement;
      if (!el?.closest("[data-explain]")) return;
      if (el.closest("input, textarea, select")) return;
      const rect = selection?.rangeCount ? selection.getRangeAt(0).getBoundingClientRect() : null;
      if (!rect || (!rect.width && !rect.height)) return;
      place(text, rect.left + rect.width / 2, rect.top);
    }

    document.addEventListener("mouseup", onPointerUp);
    return () => document.removeEventListener("mouseup", onPointerUp);
  }, []);

  async function ask(nextQuestion: string) {
    setLoading(true);
    setError("");
    setAnswer("");
    try {
      const result = await explainPassage({ data: { quote, question: nextQuestion, context, campus } });
      setAnswer(result.text);
      setSource(result.source === "grok" ? "Grok" : "Shop notes");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Could not answer that.";
      setError(message === "Unauthorized" ? "Sign in to ask about a highlighted passage." : message);
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div
      ref={panelRef}
      data-ask-panel="true"
      role="dialog"
      aria-label="Ask about the highlighted text"
      className="no-print fixed z-40 w-[min(22rem,calc(100vw-1.5rem))] border border-yale bg-card p-3"
      style={{ left: pos.x, top: pos.y, transform: "translate(-50%, calc(-100% - 0.5rem))" }}
    >
      <p className="max-h-16 overflow-hidden text-sm text-muted">“{quote}”</p>
      <div className="mt-2 flex flex-wrap gap-2">
        <button
          type="button"
          className="h-10 bg-yale px-3 text-sm text-paper"
          onClick={() => {
            setMode("explain");
            void ask("");
          }}
        >
          Explain
        </button>
        <button type="button" className="h-10 border border-line px-3 text-sm" onClick={() => setMode("ask")}>
          Ask
        </button>
        <button type="button" className="h-10 px-3 text-sm text-muted" onClick={() => setOpen(false)}>
          Close
        </button>
      </div>
      {mode === "ask" ? (
        <form
          className="mt-3"
          onSubmit={(event) => {
            event.preventDefault();
            if (!question.trim()) return;
            void ask(question.trim());
          }}
        >
          <label className="block text-sm">
            Question about this passage
            <input
              value={question}
              onChange={(event) => setQuestion(event.target.value)}
              className="mt-1 h-11 w-full border border-line bg-paper px-2"
              placeholder="What does this mean for my project?"
            />
          </label>
          <button type="submit" className="mt-2 h-10 bg-cyan px-3 text-sm text-paper">
            Send question
          </button>
        </form>
      ) : null}
      {loading ? <p className="mt-2 text-sm text-muted">Reading that passage…</p> : null}
      {error ? <p className="mt-2 text-sm text-danger">{error}</p> : null}
      {answer ? (
        <div className="mt-3 text-sm">
          <p>{answer}</p>
          <p className="mt-2 font-mono text-xs text-cyan">{source}</p>
        </div>
      ) : null}
    </div>
  );
}
