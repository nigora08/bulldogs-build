import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { ProjectCard } from "@/components/project-card";
import { deleteTeam, getTeam, rotateInvite } from "@/lib/studio.functions";
import { errorText } from "@/lib/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

type Loaded = Awaited<ReturnType<typeof getTeam>>;

export const Route = createFileRoute("/teams/$id")({ component: TeamPage });

function TeamPage() {
  const { id } = Route.useParams();
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [data, setData] = useState<Loaded | null>(null);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);

  function reload() {
    return getTeam({ data: { id } }).then(setData);
  }

  useEffect(() => {
    if (isPending || !user) return;
    let cancel = false;
    getTeam({ data: { id } })
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

  if (!isPending && !user) {
    return (
      <Shell>
        <main className="mx-auto max-w-lg px-4 py-16">
          <Link to="/login" search={{ next: `/teams/${id}` }} className="inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
            Sign in
          </Link>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-10">
        {error ? <p className="text-danger">{error}</p> : null}
        {!data && !error ? <p className="text-muted">Opening the team…</p> : null}
        {data ? (
          <>
            <p className="font-mono text-xs tracking-[0.16em] text-cyan">{data.team.role === "owner" ? "YOU CREATED THIS" : "YOU JOINED THIS"}</p>
            <h1 className="mt-2 font-display text-5xl">{data.team.name}</h1>
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <p className="border border-line bg-card px-4 py-3 font-mono text-lg tracking-[0.24em]">{data.team.inviteCode}</p>
              <button
                type="button"
                className="h-11 border border-ink px-4 text-sm"
                onClick={() => {
                  void navigator.clipboard.writeText(data.team.inviteCode).then(() => {
                    setCopied(true);
                    window.setTimeout(() => setCopied(false), 1600);
                  });
                }}
              >
                {copied ? "Copied" : "Copy code"}
              </button>
              {data.team.role === "owner" ? (
                <button
                  type="button"
                  className="h-11 border border-line px-4 text-sm"
                  onClick={() => {
                    rotateInvite({ data: { id } })
                      .then(() => reload())
                      .catch((err: unknown) => setError(errorText(err)));
                  }}
                >
                  New code
                </button>
              ) : null}
            </div>
            <p className="mt-3 max-w-xl text-sm text-muted">Anyone with the code can join and see projects shared here. A new code does not remove people who already joined.</p>
            <h2 className="mt-10 font-display text-3xl">People</h2>
            <ul className="mt-3 grid gap-2 sm:grid-cols-2">
              {data.members.map((member) => (
                <li key={member.id} className="border border-line bg-card px-4 py-3">
                  <span className="font-medium">{member.name}</span>
                  <span className="ml-2 font-mono text-xs text-muted">{member.role}</span>
                </li>
              ))}
            </ul>
            <div className="mt-10 flex items-end justify-between gap-3">
              <h2 className="font-display text-3xl">Shared projects</h2>
              <Link to="/plan" search={{ campus: "open" }} className="text-sm underline">
                New plan
              </Link>
            </div>
            {data.projects.length === 0 ? (
              <p className="mt-4 text-muted">Nothing shared yet. Open a project and set Share with to this team.</p>
            ) : (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {data.projects.map((project) => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
            )}
            {data.team.role === "owner" ? (
              <button
                type="button"
                className="mt-10 h-11 border border-danger px-4 text-sm text-danger"
                onClick={() => {
                  if (!window.confirm("Delete this team? Shared projects go back to private.")) return;
                  deleteTeam({ data: { id } })
                    .then(() => {
                      void navigate({ to: "/teams" });
                    })
                    .catch((err: unknown) => setError(errorText(err)));
                }}
              >
                Delete team
              </button>
            ) : null}
          </>
        ) : null}
      </main>
    </Shell>
  );
}
