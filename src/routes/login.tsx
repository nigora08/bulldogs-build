import { useEffect, useState, type FormEvent } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { Shell } from "@/components/shell";
import { authClient, signIn } from "@/lib/auth/client";
import { GROK_PROVIDERS } from "@/lib/auth/providers";
import { useCurrentUserState } from "@/lib/auth/use-current-user";
import { errorText, safeNext } from "@/lib/studio";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    next: safeNext(search.next, "/projects"),
  }),
  component: LoginPage,
});

function rememberToken(response: Response) {
  const token = response.headers.get("set-auth-token");
  if (!token) return;
  try {
    window.sessionStorage.setItem("grok-auth.bearer-token", token);
  } catch {
    /* storage unavailable */
  }
}

function LoginPage() {
  const { next } = Route.useSearch();
  const { user, isPending } = useCurrentUserState();
  const [mode, setMode] = useState<"in" | "up">("up");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isPending && user) window.location.assign(next);
  }, [isPending, next, user]);

  if (isPending || user) {
    return (
      <Shell>
        <p className="mx-auto max-w-lg px-4 py-16 text-muted">Checking the session…</p>
      </Shell>
    );
  }

  async function submit(event: FormEvent) {
    event.preventDefault();
    setError("");
    if (password.length < 8) {
      setError("Use at least 8 characters.");
      return;
    }
    setBusy(true);
    try {
      if (mode === "up") {
        const display = name.trim();
        if (display.length < 2) throw new Error("Add the name your teammates should see.");
        const { error: signUpError } = await authClient.signUp.email({
          email: email.trim(),
          password,
          name: display,
          fetchOptions: { onSuccess: (ctx) => rememberToken(ctx.response) },
        });
        if (signUpError) throw new Error(signUpError.message ?? "Could not create the account.");
      } else {
        const { error: signInError } = await authClient.signIn.email({
          email: email.trim(),
          password,
          fetchOptions: { onSuccess: (ctx) => rememberToken(ctx.response) },
        });
        if (signInError) throw new Error(signInError.message ?? "Could not sign in.");
      }
      window.location.assign(next);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  }

  return (
    <Shell>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 py-12 lg:grid-cols-2">
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-cyan">YOUR BENCH</p>
          <h1 className="mt-3 font-display text-5xl leading-tight">Sign in to keep the plan.</h1>
          <p className="mt-4 max-w-md text-muted">
            Ranking a process works without an account. An account is how the checklist, the stock list, and your team survive a closed laptop.
          </p>
          <ul className="mt-6 space-y-2 text-sm text-muted">
            <li>Saved projects stay on this desk.</li>
            <li>A team code shares one project, not your whole account.</li>
            <li>Email works on any link. Google and X are there when that sign-in is available.</li>
          </ul>
        </div>
        <form className="form-card border border-line p-5" onSubmit={(event) => void submit(event)}>
          <div className="flex gap-2">
            <button type="button" className={`h-11 flex-1 ${mode === "up" ? "bg-ink text-paper" : "border border-line"}`} onClick={() => setMode("up")}>
              Create account
            </button>
            <button type="button" className={`h-11 flex-1 ${mode === "in" ? "bg-ink text-paper" : "border border-line"}`} onClick={() => setMode("in")}>
              Sign in
            </button>
          </div>
          {mode === "up" ? (
            <label className="mt-4 block text-sm">
              Name
              <input
                required
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                className="mt-1 h-11 w-full border border-line bg-paper px-3"
              />
            </label>
          ) : null}
          <label className="mt-4 block text-sm">
            Email
            <input
              required
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="email"
              className="mt-1 h-11 w-full border border-line bg-paper px-3"
            />
          </label>
          <label className="mt-4 block text-sm">
            Password
            <input
              required
              type="password"
              minLength={8}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete={mode === "up" ? "new-password" : "current-password"}
              className="mt-1 h-11 w-full border border-line bg-paper px-3"
            />
          </label>
          {error ? <p className="mt-3 text-sm text-danger">{error}</p> : null}
          <button type="submit" disabled={busy} className="mt-4 h-12 w-full bg-cyan text-paper disabled:opacity-60">
            {busy ? "Working…" : mode === "up" ? "Create account" : "Sign in"}
          </button>
          <div className="mt-5 grid gap-2">
            {GROK_PROVIDERS.map((provider) => (
              <button
                key={provider.providerId}
                type="button"
                className="h-11 border border-line bg-paper"
                onClick={() => void signIn(provider.providerId, { callbackURL: next, errorCallbackURL: "/login" })}
              >
                Continue with {provider.label}
              </button>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            <Link to="/" className="underline">
              Back to the desk
            </Link>
          </p>
        </form>
      </main>
    </Shell>
  );
}
