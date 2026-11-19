import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { BeginnerPlans } from "@/components/beginner-plans";
import { Shell } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { addDecision, listProjects, setBomStatus, setCheck, setDeadline } from "@/lib/studio.functions";
import { deadlineLabel, errorText, paceWarning, pickReturnProject, routeTimeLeft, sessionFit, type ProjectSummary } from "@/lib/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { pickSuggestion } from "@/lib/suggestions";
import type { Constraints } from "@/lib/engine";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [brief, setBrief] = useState("");
  const [campus, setCampus] = useState<"open" | "yale">("open");
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const [stocking, setStocking] = useState(false);
  const [noting, setNoting] = useState(false);
  const [dating, setDating] = useState(false);
  const [note, setNote] = useState("");
  const [stepError, setStepError] = useState("");
  const [suggestionCursor, setSuggestionCursor] = useState(0);

  useEffect(() => {
    if (isPending || !user) return;
    let cancel = false;
    listProjects()
      .then((rows) => {
        if (!cancel) setProjects(rows);
      })
      .catch((err: unknown) => {
        if (!cancel) setError(errorText(err));
      });
    return () => {
      cancel = true;
    };
  }, [isPending, user]);

  function start(text: string, nextCampus: "open" | "yale", constraints?: Constraints) {
    const clean = text.trim();
    if (clean.length < 12) {
      setError("Give it a full sentence: what it is, and what it has to survive.");
      return;
    }
    try {
      sessionStorage.setItem("datum-draft", JSON.stringify({ brief: clean, constraints }));
    } catch {
      /* private mode still navigates */
    }
    void navigate({ to: "/plan", search: { campus: nextCampus } });
  }

  const resume = projects ? pickReturnProject(projects) : null;
  const pace = resume ? paceWarning(resume.minutesLeft, resume.deadline) : null;

  async function saveDeadline(project: ProjectSummary, value: string) {
    if (dating || checking || stocking || noting) return;
    setDating(true);
    setStepError("");
    try {
      await setDeadline({ data: { id: project.id, deadline: value || null } });
      setProjects(await listProjects());
    } catch (err: unknown) {
      setStepError(errorText(err));
    } finally {
      setDating(false);
    }
  }

  async function leaveNote(project: ProjectSummary) {
    const body = note.trim();
    if (body.length < 2) {
      setStepError("Write the note in a sentence or two.");
      return;
    }
    if (noting || checking || stocking || dating) return;
    setNoting(true);
    setStepError("");
    try {
      await addDecision({ data: { id: project.id, body } });
      setNote("");
      setProjects(await listProjects());
    } catch (err: unknown) {
      setStepError(errorText(err));
    } finally {
      setNoting(false);
    }
  }

  async function receivePart(project: ProjectSummary) {
    if (!project.nextPartId || stocking || checking || noting || dating) return;
    setStocking(true);
    setStepError("");
    try {
      await setBomStatus({ data: { id: project.id, lineId: project.nextPartId, status: "in_hand" } });
      setProjects(await listProjects());
    } catch (err: unknown) {
      setStepError(errorText(err));
    } finally {
      setStocking(false);
    }
  }

  async function finishStep(project: ProjectSummary) {
    if (!project.nextStepId || checking || stocking || noting || dating) return;
    setChecking(true);
    setStepError("");
    try {
      await setCheck({ data: { id: project.id, stepId: project.nextStepId, done: true } });
      setProjects(await listProjects());
    } catch (err: unknown) {
      setStepError(errorText(err));
    } finally {
      setChecking(false);
    }
  }

  return (
    <Shell>
      <main>
        <section className="relative overflow-hidden border-b border-line">
          <div className="hero-grid pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="hero-wash pointer-events-none absolute inset-0" aria-hidden="true" />
          <div className="relative mx-auto grid max-w-6xl gap-10 px-4 py-14 lg:grid-cols-[1.05fr_0.95fr] lg:py-20">
            <div>
              <p className="font-mono text-xs tracking-[0.18em] text-cyan">FOR THE PROJECT THAT IS ACTUALLY DUE</p>
              <h1 className="mt-4 max-w-xl font-display text-5xl leading-[1.02] sm:text-6xl">
                Stop researching.
                <span className="mt-1 block text-[#8a6a2f]">Start the build.</span>
              </h1>
              <p className="mt-5 max-w-lg text-lg text-muted">
                Datum turns a project sentence into a ranked process, a bill of materials, and the next thing to do tonight. Save it, share it with your team, and check steps off until the part exists.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link to="/plan" search={{ campus: "open" }} className="inline-flex h-12 items-center bg-ink px-5 text-paper">
                  Open a plan
                </Link>
                <Link to="/bulldogs" className="inline-flex h-12 items-center border border-yale px-5 text-yale">
                  Bulldogs Build
                </Link>
              </div>
              <p className="mt-4 max-w-md text-sm text-muted">
                Bulldogs Build is the Yale pack: CEID, Wright Lab, architecture labs, and the cores on public pages. Everywhere else, use Open shop.
              </p>
            </div>
            <form
              className="form-card border border-line p-5 shadow-[0_24px_60px_-36px_rgba(20,32,51,0.7)]"
              onSubmit={(event) => {
                event.preventDefault();
                start(brief, campus);
              }}
            >
              <label htmlFor="desk-brief" className="font-mono text-xs tracking-[0.16em] text-cyan">
                WHAT ARE YOU MAKING?
              </label>
              <textarea
                id="desk-brief"
                value={brief}
                onChange={(event) => setBrief(event.target.value)}
                rows={5}
                placeholder="A sealed box for a stream sensor, with a clear lid and a cable that stays dry."
                className="mt-3 w-full resize-y border border-line bg-paper px-3 py-3 outline-none"
              />
              <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Campus pack">
                {(
                  [
                    ["open", "Any shop"],
                    ["yale", "Yale · Bulldogs"],
                  ] as const
                ).map(([id, label]) => (
                  <button
                    key={id}
                    type="button"
                    aria-pressed={campus === id}
                    onClick={() => setCampus(id)}
                    className={`h-11 rounded-full border px-4 text-sm ${campus === id ? "border-ink bg-ink text-paper" : "border-line bg-paper"}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
              {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
              <div className="mt-4 flex flex-wrap gap-2">
                <button type="submit" className="h-12 bg-cyan px-5 text-paper">
                  Rank a plan
                </button>
                <button
                  type="button"
                  className="h-12 border border-line px-4 text-sm"
                  onClick={() => {
                    const idea = pickSuggestion(suggestionCursor, brief);
                    setSuggestionCursor((cursor) => cursor + 1);
                    setBrief(idea.brief);
                    setError("");
                  }}
                >
                  Suggest one
                </button>
              </div>
            </form>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-4 py-12">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="font-mono text-xs tracking-[0.16em] text-cyan">ON THE BENCH</p>
              <h2 className="mt-2 font-display text-4xl">Pick up where you stopped</h2>
            </div>
            {user ? (
              <Link to="/projects" className="text-sm underline">
                All projects
              </Link>
            ) : null}
          </div>
          {isPending ? <p className="mt-6 text-muted">Checking your desk…</p> : null}
          {!isPending && !user ? (
            <div className="mt-6 border border-dashed border-line bg-card px-5 py-8">
              <p className="max-w-xl text-muted">
                You can rank a plan without an account. Sign in when you want it waiting on your phone tomorrow, or when a teammate should see the same checklist.
              </p>
              <Link to="/login" search={{ next: "/" }} className="mt-4 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
                Create an account
              </Link>
            </div>
          ) : null}
          {user && projects && projects.length === 0 ? (
            <p className="mt-6 max-w-xl text-muted">Your bench is clear. Rank a plan, then save it. The checklist is what you will open at 11pm in the lab.</p>
          ) : null}
          {resume ? (
            <div className="mt-6 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
              <ProjectCard project={resume} />
              <div className="border border-line bg-ink p-5 text-paper">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-mono text-xs tracking-[0.16em] text-gold">NEXT SESSION</p>
                  <p className="font-mono text-xs text-gold">{deadlineLabel(resume.deadline)}</p>
                </div>
                {pace ? <p className="mt-3 text-sm text-[#f3c7bc]">{pace}</p> : null}
                <p className="mt-3 text-sm text-paper-2">{resume.title}</p>
                {resume.nextStepTitle ? (
                  <>
                    <h3 className="mt-2 font-display text-3xl">{resume.nextStepTitle}</h3>
                    {resume.nextStepDetail ? <p className="mt-2 text-sm text-paper-2">{resume.nextStepDetail}</p> : null}
                    {sessionFit(resume.nextStepMinutes, resume.nextStepTools) ? (
                      <p className="mt-2 font-mono text-xs text-gold">{sessionFit(resume.nextStepMinutes, resume.nextStepTools)}</p>
                    ) : null}
                    {resume.riskTitle ? (
                      <p className="mt-3 text-sm text-paper-2">
                        <span className="font-mono text-xs tracking-[0.14em] text-gold">{resume.riskStop ? "STOP " : "WATCH "}</span>
                        {resume.riskTitle}
                        {resume.riskDetail ? `. ${resume.riskDetail}` : ""}
                      </p>
                    ) : null}
                  </>
                ) : (
                  <h3 className="mt-2 font-display text-3xl">The chosen route is checked off.</h3>
                )}
                {resume.partsNeeded.length > 0 ? (
                  <p className="mt-3 text-sm text-paper-2">
                    Not in hand yet: {resume.partsNeeded.slice(0, 3).join(", ")}
                    {resume.partsNeeded.length > 3 ? `, and ${resume.partsNeeded.length - 3} more` : ""}.
                  </p>
                ) : (
                  <p className="mt-3 text-sm text-paper-2">Stock for this route is marked in hand.</p>
                )}
                {resume.nextPartId && resume.nextPartName ? (
                  <button
                    type="button"
                    disabled={stocking || checking || noting}
                    onClick={() => void receivePart(resume)}
                    className="mt-3 inline-flex min-h-11 max-w-full items-center border border-paper/40 px-3 py-2 text-left text-sm text-paper disabled:opacity-60"
                  >
                    {stocking ? "Saving…" : `I have ${resume.nextPartName}`}
                  </button>
                ) : null}
                <label className="mt-4 flex items-center justify-between gap-3 text-sm text-paper-2">
                  Due
                  <input
                    id="return-deadline"
                    type="date"
                    aria-label="Deadline"
                    value={resume.deadline ?? ""}
                    disabled={dating || checking || stocking || noting}
                    onChange={(event) => void saveDeadline(resume, event.target.value)}
                    className="h-11 border border-gold/40 bg-transparent px-2 text-sm text-paper [color-scheme:dark] disabled:opacity-60"
                  />
                </label>
                <p className="mt-3 font-mono text-xs text-gold">
                  {resume.checksDone} of {resume.stepCount} steps
                  {routeTimeLeft(resume.minutesLeft) ? ` · ${routeTimeLeft(resume.minutesLeft)}` : ""}
                  {resume.routeName ? ` · ${resume.routeName}` : ""}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  <Link
                    to="/projects/$id"
                    params={{ id: resume.id }}
                    search={{ focus: resume.nextStepTitle ? "tonight" : undefined }}
                    className="inline-flex h-11 items-center bg-gold px-4 text-sm text-ink"
                  >
                    {resume.nextStepTitle ? "Do this step" : "Open the work order"}
                  </Link>
                  {resume.nextStepId ? (
                    <button
                      type="button"
                      disabled={checking || stocking || noting}
                      onClick={() => void finishStep(resume)}
                      className="inline-flex h-11 items-center border border-gold px-4 text-sm text-gold disabled:opacity-60"
                    >
                      {checking ? "Saving…" : "Mark done"}
                    </button>
                  ) : null}
                </div>
                {resume.lastNote ? (
                  <p className="mt-4 text-sm text-paper-2">
                    <span className="font-mono text-xs tracking-[0.14em] text-gold">LAST NOTE </span>
                    {resume.lastNote}
                  </p>
                ) : null}
                <form
                  className="mt-3 flex flex-wrap gap-2"
                  onSubmit={(event) => {
                    event.preventDefault();
                    void leaveNote(resume);
                  }}
                >
                  <input
                    id="stop-note"
                    aria-label="Why you stopped"
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    maxLength={500}
                    placeholder="Why you stopped"
                    className="h-11 min-w-0 flex-1 border border-gold/40 bg-transparent px-3 text-sm text-paper placeholder:text-paper-2"
                  />
                  <button
                    type="submit"
                    disabled={noting || checking || stocking}
                    className="h-11 border border-gold px-3 text-sm text-gold disabled:opacity-60"
                  >
                    {noting ? "Saving…" : "Leave a note"}
                  </button>
                </form>
                {stepError ? <p className="mt-3 text-sm text-[#f3c7bc]">{stepError}</p> : null}
              </div>
            </div>
          ) : null}
          {projects && projects.length > 1 ? (
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              {projects.slice(1, 5).map((project) => (
                <ProjectCard key={project.id} project={project} />
              ))}
            </div>
          ) : null}
        </section>

        <BeginnerPlans
          tone="paper"
          onOpen={(plan) => {
            start(plan.brief, campus, plan.constraints);
          }}
        />

        <section className="border-t border-line bg-card">
          <div className="mx-auto grid max-w-6xl gap-8 px-4 py-12 md:grid-cols-3">
            {[
              ["01", "Rank the process", "Budget, size, material, load, water, and time reshuffle the routes while you drag the controls."],
              ["02", "Commit to one", "Save the plan. Park the other routes. The page becomes a work order instead of another comparison tab."],
              ["03", "Share the bench", "A team code puts the same checklist, stock list, and decision log in front of everyone on the project."],
            ].map(([n, title, copy]) => (
              <div key={n} className="border-t-4 border-gold pt-4">
                <p className="font-mono text-xs text-cyan">{n}</p>
                <h3 className="mt-2 font-display text-2xl">{title}</h3>
                <p className="mt-2 text-sm text-muted">{copy}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
    </Shell>
  );
}
