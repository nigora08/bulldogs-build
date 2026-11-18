import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SignedIn, SignedOut, UserButton } from "@/lib/auth/gates";

const LINKS = [
  ["/", "Desk"],
  ["/plan", "Plan"],
  ["/projects", "Projects"],
  ["/teams", "Teams"],
  ["/bulldogs", "Bulldogs"],
] as const;

export function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="sticky top-0 z-40 border-b border-line bg-paper/95 backdrop-blur">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-4 py-3">
          <Link to="/" className="flex items-center gap-2">
            <DatumMark />
            <span className="leading-none">
              <span className="block font-mono text-[10px] tracking-[0.22em] text-cyan">BUILD DESK</span>
              <span className="mt-1 block font-display text-xl leading-none">Datum</span>
            </span>
          </Link>
          <nav className="flex flex-wrap items-center gap-1 text-sm" aria-label="Datum">
            {LINKS.map(([to, label]) => (
              <Link
                key={to}
                to={to}
                search={to === "/plan" ? { campus: "open" } : undefined}
                activeOptions={{ exact: to === "/" || to === "/plan" }}
                className="inline-flex h-11 items-center rounded-md px-3"
                activeProps={{ className: "bg-ink text-paper" }}
                inactiveProps={{ className: "text-ink hover:bg-paper-2" }}
              >
                {label}
              </Link>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <SignedOut>
              <Link to="/login" search={{ next: "/projects" }} className="inline-flex h-11 items-center rounded-md bg-ink px-4 text-sm text-paper">
                Sign in
              </Link>
            </SignedOut>
            <SignedIn>
              <UserButton />
            </SignedIn>
          </div>
        </div>
      </header>
      {children}
    </div>
  );
}

export function DatumMark() {
  return (
    <svg viewBox="0 0 36 36" className="h-9 w-9" aria-hidden="true">
      <rect width="36" height="36" rx="6" fill="#142033" />
      <path d="M8 26V10h8.2a7.2 7.2 0 0 1 0 14.4H12" fill="none" stroke="#F4F0E8" strokeWidth="2.2" />
      <path d="M18 18h10M23 13l5 5-5 5" fill="none" stroke="#C4A35A" strokeWidth="2.2" strokeLinejoin="round" />
    </svg>
  );
}
