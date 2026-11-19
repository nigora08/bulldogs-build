import { useEffect, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { createTeam, joinTeam, listTeams } from "@/lib/studio.functions";
import { errorText, type TeamSummary } from "@/lib/studio";
import { useCurrentUserState } from "@/lib/auth/use-current-user";

export const Route = createFileRoute("/teams/")({ component: TeamsPage });

function TeamsPage() {
  const navigate = useNavigate();
  const { user, isPending } = useCurrentUserState();
  const [teams, setTeams] = useState<TeamSummary[] | null>(null);
  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function refresh() {
    listTeams()
      .then(setTeams)
      .catch((err: unknown) => setError(errorText(err)));
  }

  useEffect(() => {
    if (isPending || !user) return;
    refresh();
  }, [isPending, user]);

  if (!isPending && !user) {
    return (
      <Shell>
        <main className="mx-auto max-w-lg px-4 py-16">
          <h1 className="font-display text-4xl">Teams</h1>
          <p className="mt-3 text-muted">Sign in, then create a team or join one with a code.</p>
          <Link to="/login" search={{ next: "/teams" }} className="mt-5 inline-flex h-11 items-center bg-ink px-4 text-sm text-paper">
            Sign in
          </Link>
        </main>
      </Shell>
    );
  }

  return (
    <Shell>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <p className="font-mono text-xs tracking-[0.16em] text-cyan">SHARED BENCH</p>
        <h1 className="mt-2 font-display text-5xl">Teams</h1>
        <p className="mt-3 max-w-xl text-muted">
          A team sees the projects you share with it. The code is the invite. Send it in your group chat. Rotating the code later shuts the old one.
        </p>
        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <form
            className="border border-line bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              createTeam({ data: { name } })
                .then((result) => {
                  void navigate({ to: "/teams/$id", params: { id: result.id } });
                })
                .catch((err: unknown) => {
                  setError(errorText(err));
                  setBusy(false);
                });
            }}
          >
            <h2 className="font-display text-2xl">Start a team</h2>
            <label className="mt-3 block text-sm">
              Team name
              <input id="team-name" value={name} onChange={(event) => setName(event.target.value)} className="mt-1 h-11 w-full border border-line bg-paper px-3" placeholder="Senior design, bay 3" />
            </label>
            <button type="submit" disabled={busy} className="mt-3 h-11 bg-ink px-4 text-sm text-paper disabled:opacity-60">
              Create team
            </button>
          </form>
          <form
            className="border border-line bg-card p-4"
            onSubmit={(event) => {
              event.preventDefault();
              setBusy(true);
              setError("");
              joinTeam({ data: { code } })
                .then((result) => {
                  void navigate({ to: "/teams/$id", params: { id: result.id } });
                })
                .catch((err: unknown) => {
                  setError(errorText(err));
                  setBusy(false);
                });
            }}
          >
            <h2 className="font-display text-2xl">Join with a code</h2>
            <label className="mt-3 block text-sm">
              Code
              <input
                value={code}
                onChange={(event) => setCode(event.target.value.toUpperCase())}
                className="mt-1 h-11 w-full border border-line bg-paper px-3 font-mono tracking-[0.2em]"
                placeholder="ABCD2345"
                autoCapitalize="characters"
              />
            </label>
            <button type="submit" disabled={busy} className="mt-3 h-11 border border-ink px-4 text-sm disabled:opacity-60">
              Join team
            </button>
          </form>
        </div>
        {error ? <p className="mt-4 text-sm text-danger">{error}</p> : null}
        <div className="mt-8 grid gap-3 md:grid-cols-2">
          {(teams ?? []).map((team) => (
            <Link key={team.id} to="/teams/$id" params={{ id: team.id }} className="lift border border-line bg-card p-4">
              <p className="font-mono text-[10px] tracking-[0.16em] text-cyan">{team.role === "owner" ? "OWNER" : "MEMBER"}</p>
              <h3 className="mt-1 font-display text-2xl">{team.name}</h3>
              <p className="mt-2 text-sm text-muted">
                {team.members} {team.members === 1 ? "person" : "people"} · code {team.inviteCode}
              </p>
            </Link>
          ))}
        </div>
        {teams && teams.length === 0 ? <p className="mt-6 text-muted">No team yet. Create one for the group, then share a project into it from the project page.</p> : null}
      </main>
    </Shell>
  );
}
