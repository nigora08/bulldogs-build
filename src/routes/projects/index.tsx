import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { listProjects } from "@/lib/studio.functions";
import { errorText, type ProjectSummary } from "@/lib/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/projects/")({ component: ProjectsPage });

function ProjectsPage() {
  const { user, isPending } = useCurrentUserState();
  const [projects, setProjects] = useState<ProjectSummary[] | null>(null);
  const [error, setError] = useState("");

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

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-xs tracking-[0.16em] text-cyan">SAVED</p>
            <h1 className="mt-2 font-display text-5xl">Projects</h1>
          </div>
          <Link to="/plan" search={{ campus: "open" }} className="inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
            New plan
          </Link>
        </div>
        {isPending ? <p className="mt-8 text-muted">Opening your bench…</p> : null}
        {!isPending && !user ? (
          <div className="mt-8 border border-line bg-card p-6">
            <p>Sign in to see the projects on this desk.</p>
            <Link to="/login" search={{ next: "/projects" }} className="mt-4 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
              Sign in
            </Link>
          </div>
        ) : null}
        {error ? <p className="mt-6 text-danger">{error}</p> : null}
        {projects && projects.length === 0 ? (
          <p className="mt-8 max-w-lg text-muted">Nothing saved yet. Rank a plan, then press Save to bench. That is the copy you and your team will check off.</p>
        ) : null}
        {projects && projects.length > 0 ? (
          <div className="mt-8 grid gap-3 md:grid-cols-2">
            {projects.map((project) => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : null}
      </main>
    </Shell>
  );
}
