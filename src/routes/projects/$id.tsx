import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import {
  addDecision,
  deleteProject,
  getProject,
  recalculateProject,
  renameProject,
  setBomStatus,
  setCheck,
  setDeadline,
  setRoute,
  shareProject,
} from "@/lib/studio.functions";
import {
  chosenRoute,
  deadlineLabel,
  errorText,
  routeBom,
  routeRisks,
  routeSteps,
  type BomStatus,
  type DecisionItem,
} from "@/lib/studio";
import type { Blueprint } from "@/lib/engine";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Loaded = Awaited<ReturnType<typeof getProject>>;

export const Route = createFileRoute("/projects/$id")({ component: ProjectPage });

function ProjectPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [tonight, setTonight] = useState(false);
  const [decision, setDecision] = useState("");
  const [busy, setBusy] = useState(false);

  function reload() {
    return getProject({ data: { id } }).then(setData);
  }

  useEffect(() => {
    if (isPending || !user) return;
    let cancel = false;
    getProject({ data: { id } })
      .then((next) => {
        if (!cancel) setData(next);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [id, isPending, user]);

  const plan: Blueprint | null = data?.blueprint ?? null;
  const route = chosenRoute(plan, data?.project.chosenRouteId ?? null);
  const steps = routeSteps(route);
  const done = useMemo(() => new Set(data?.checks ?? []), [data?.checks]);
  const nextStep = steps.find((step) => !done.has(step.id));
  const bom = routeBom(route);

  if (!isPending && !user) {
    return (
      <Shell>
        <main className="mx-auto max-w-lg px-4 py-16">
          <p>Sign in to open this project.</p>
          <Link to="/login" search={{ next: `/projects/${id}` }} className="mt-4 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
            Sign in
          </Link>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-8">
        {!data && !error ? <p className="text-muted">Opening the work order…</p> : null}
        {error ? <p className="text-danger">{error}</p> : null}
        {data && route ? (
          <>
            <p className="font-mono text-xs tracking-[0.16em] text-cyan">
              {data.project.campus === "yale" ? "BULLDOGS BUILD" : "OPEN SHOP"}
              {data.project.teamName ? ` · ${data.project.teamName}` : " · PRIVATE"}
            </p>
            <div className="mt-2 flex flex-wrap items-start justify-between gap-4">
              <input
                aria-label="Project name"
                defaultValue={data.project.title}
                key={data.project.title}
                className="w-full max-w-3xl bg-transparent font-display text-4xl outline-none sm:text-5xl"
                onBlur={(event) => {
                  const title = event.target.value.trim();
                  if (title === data.project.title) return;
                  renameProject({ data: { id, title } })
                    .then(() => reload())
                    .catch((err: unknown) => setError(errorText(err)));
                }}
              />
              <button
                type="button"
                aria-pressed={tonight}
                onClick={() => setTonight((on) => !on)}
                className={`h-11 px-4 text-sm ${tonight ? "bg-gold text-ink" : "border border-ink"}`}
              >
                {tonight ? "Show the whole order" : "Tonight"}
              </button>
            </div>
            <p className="mt-3 max-w-2xl text-muted">{data.project.brief}</p>
            <div className="mt-4 flex flex-wrap items-center gap-3 text-sm">
              <label>
                Deadline
                <input
                  type="date"
                  value={data.project.deadline ?? ""}
                  onChange={(event) => {
                    setDeadline({ data: { id, deadline: event.target.value || null } })
                      .then(() => reload())
                      .catch((err: unknown) => setError(errorText(err)));
                  }}
                  className="ml-2 h-11 border border-line bg-card px-2"
                />
              </label>
              <span className="font-mono text-xs">{deadlineLabel(data.project.deadline)}</span>
              <span className="text-muted">
                {data.checks.length}/{steps.length} on {route.name}
              </span>
            </div>
            <div className="tick mt-4">
              <span style={{ width: `${steps.length ? Math.round((data.checks.filter((stepId) => steps.some((step) => step.id === stepId)).length / steps.length) * 100) : 0}%` }} />
            </div>

            {tonight ? (
              <section className="mt-8 border border-ink bg-ink p-6 text-paper">
                <p className="font-mono text-xs tracking-[0.16em] text-gold">DO THIS BEFORE YOU LEAVE</p>
                {nextStep ? (
                  <>
                    <h2 className="mt-3 font-display text-4xl">{nextStep.title}</h2>
                    <p className="mt-3 max-w-2xl text-paper-2">{nextStep.detail}</p>
                    <p className="mt-3 max-w-2xl text-sm">{nextStep.advice}</p>
                    <button
                      type="button"
                      className="mt-6 h-12 bg-gold px-5 text-ink"
                      onClick={() => {
                        setCheck({ data: { id, stepId: nextStep.id, done: true } })
                          .then(() => reload())
                          .catch((err: unknown) => setError(errorText(err)));
                      }}
                    >
                      Mark done
                    </button>
                  </>
                ) : (
                  <>
                    <h2 className="mt-3 font-display text-4xl">The chosen route is checked off.</h2>
                    <p className="mt-3 text-paper-2">Write what you learned, or park a different route if the part still is not real.</p>
                  </>
                )}
              </section>
            ) : (
              <div className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
                <section>
                  <h2 className="font-display text-3xl">Work order</h2>
                  <ol className="mt-4 space-y-2">
                    {steps.map((step, index) => {
                      const checked = done.has(step.id);
                      return (
                        <li key={step.id} className="border border-line bg-card">
                          <label className="flex cursor-pointer gap-3 p-4">
                            <input
                              type="checkbox"
                              className="mt-1 h-5 w-5"
                              checked={checked}
                              onChange={() => {
                                setCheck({ data: { id, stepId: step.id, done: !checked } })
                                  .then(() => reload())
                                  .catch((err: unknown) => setError(errorText(err)));
                              }}
                            />
                            <span>
                              <span className="font-mono text-xs text-cyan">{String(index + 1).padStart(2, "0")}</span>
                              <span className={`mt-1 block font-medium ${checked ? "text-muted line-through" : ""}`}>{step.title}</span>
                              <span className="mt-1 block text-sm text-muted">{step.detail}</span>
                            </span>
                          </label>
                        </li>
                      );
                    })}
                  </ol>
                  <h3 className="mt-8 font-display text-2xl">Parked routes</h3>
                  <ul className="mt-3 space-y-2">
                    {plan?.routes.map((item) => (
                      <li key={item.id}>
                        <button
                          type="button"
                          onClick={() => {
                            if (item.id === route.id) return;
                            setRoute({ data: { id, routeId: item.id } })
                              .then(() => reload())
                              .catch((err: unknown) => setError(errorText(err)));
                          }}
                          className={`w-full border px-3 py-3 text-left text-sm ${item.id === route.id ? "border-ink bg-ink text-paper" : "border-line bg-card"}`}
                        >
                          <span className="font-medium">{item.name}</span>
                          <span className="mt-1 block opacity-80">{item.tagline}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                </section>
                <aside className="space-y-6">
                  <section className="border border-line bg-card p-4">
                    <h2 className="font-display text-2xl">Stock</h2>
                    <ul className="mt-3 space-y-3">
                      {bom.map((line) => {
                        const status: BomStatus = data.bom[line.id] ?? "need";
                        return (
                          <li key={line.id} className="border-t border-line pt-3">
                            <p className="font-medium">{line.item}</p>
                            <p className="text-sm text-muted">
                              {line.qty} {line.unit}
                              {line.unitCost != null ? ` · $${line.unitCost}` : ""} · {line.costNote}
                            </p>
                            <select
                              aria-label={`Status for ${line.item}`}
                              value={status}
                              onChange={(event) => {
                                const next = event.target.value as BomStatus;
                                setBomStatus({ data: { id, lineId: line.id, status: next } })
                                  .then(() => reload())
                                  .catch((err: unknown) => setError(errorText(err)));
                              }}
                              className="mt-2 h-11 w-full border border-line bg-paper px-2"
                            >
                              <option value="need">Still need</option>
                              <option value="ordered">Ordered</option>
                              <option value="in_hand">In hand</option>
                            </select>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                  <section className="border border-line bg-card p-4">
                    <h2 className="font-display text-2xl">Risks</h2>
                    <ul className="mt-3 space-y-3">
                      {routeRisks(route).map((risk) => (
                        <li key={risk.title}>
                          <p className={`text-sm font-medium ${risk.severity === "stop" ? "text-danger" : "text-warn"}`}>{risk.title}</p>
                          <p className="text-sm text-muted">{risk.detail}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                  <section className="border border-line bg-card p-4">
                    <h2 className="font-display text-2xl">Decisions</h2>
                    <form
                      className="mt-3"
                      onSubmit={(event) => {
                        event.preventDefault();
                        setBusy(true);
                        addDecision({ data: { id, body: decision } })
                          .then(() => {
                            setDecision("");
                            return reload();
                          })
                          .catch((err: unknown) => setError(errorText(err)))
                          .finally(() => setBusy(false));
                      }}
                    >
                      <textarea
                        value={decision}
                        onChange={(event) => setDecision(event.target.value)}
                        rows={3}
                        placeholder="We dropped the printed shell. Acrylic lid, gasket, dunk test with the board out."
                        className="w-full border border-line bg-paper px-3 py-2"
                      />
                      <button type="submit" disabled={busy} className="mt-2 h-11 bg-ink px-4 text-sm text-paper disabled:opacity-60">
                        Log it
                      </button>
                    </form>
                    <ul className="mt-4 space-y-3">
                      {data.decisions.map((item: DecisionItem) => (
                        <li key={item.id} className="border-t border-line pt-3 text-sm">
                          <p>{item.body}</p>
                          <p className="mt-1 font-mono text-xs text-muted">{item.author}</p>
                        </li>
                      ))}
                    </ul>
                  </section>
                </aside>
              </div>
            )}

            <section className="mt-10 flex flex-wrap items-end gap-3 border-t border-line pt-6">
              <label className="text-sm">
                Share with
                <select
                  aria-label="Share with a team"
                  value={data.project.teamId ?? ""}
                  disabled={!data.project.owner}
                  onChange={(event) => {
                    shareProject({ data: { id, teamId: event.target.value || null } })
                      .then(() => reload())
                      .catch((err: unknown) => setError(errorText(err)));
                  }}
                  className="ml-2 h-11 border border-line bg-card px-2 disabled:opacity-60"
                >
                  <option value="">Only me</option>
                  {data.teams.map((team) => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </label>
              {!data.project.owner ? <p className="text-sm text-muted">Shared by a teammate. You can check steps and log decisions.</p> : null}
              <button
                type="button"
                className="h-11 border border-line px-4 text-sm"
                onClick={() => {
                  recalculateProject({ data: { id } })
                    .then(() => reload())
                    .catch((err: unknown) => setError(errorText(err)));
                }}
              >
                Recalculate
              </button>
              {data.project.owner ? (
                <button
                  type="button"
                  className="h-11 border border-danger px-4 text-sm text-danger"
                  onClick={() => {
                    if (!window.confirm("Delete this project from your bench?")) return;
                    deleteProject({ data: { id } })
                      .then(() => {
                        void navigate({ to: "/projects" });
                      })
                      .catch((err: unknown) => setError(errorText(err)));
                  }}
                >
                  Delete
                </button>
              ) : null}
            </section>
          </>
        ) : null}
      </main>
    </Shell>
  );
}
