import { describeTool } from "@/data/equipment";
import type { Blueprint, BomLine, Constraints, PlanStep, Risk, RoutePlan } from "@/lib/engine";

export type Campus = "yale" | "open";
export type BomStatus = "need" | "ordered" | "in_hand";

export interface ProjectSummary {
  id: string;
  title: string;
  campus: Campus;
  routeName: string | null;
  stepCount: number;
  checksDone: number;
  deadline: string | null;
  updatedAt: string;
  teamId: string | null;
  teamName: string | null;
  owner: boolean;
  nextStepId: string | null;
  nextStepTitle: string | null;
  nextStepDetail: string | null;
  nextStepMinutes: number | null;
  nextStepTools: string[];
  partsNeeded: string[];
}

export interface DecisionItem {
  id: string;
  body: string;
  createdAt: string;
  author: string;
}

export interface TeamSummary {
  id: string;
  name: string;
  role: "owner" | "member";
  members: number;
  inviteCode: string;
}

export interface TeamMember {
  id: string;
  name: string;
  role: "owner" | "member";
}

export function safeNext(value: unknown, fallback = "/projects"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.includes("\\") || value.includes("://")) return fallback;
  return value;
}

export function asBlueprint(value: unknown): Blueprint | null {
  if (!value || typeof value !== "object") return null;
  const plan = value as Partial<Blueprint>;
  if (typeof plan.title !== "string" || !Array.isArray(plan.routes)) return null;
  return {
    title: plan.title,
    summary: typeof plan.summary === "string" ? plan.summary : "",
    readout: Array.isArray(plan.readout) ? plan.readout.filter((item) => typeof item === "string") : [],
    assumptions: Array.isArray(plan.assumptions) ? plan.assumptions.filter((item) => typeof item === "string") : [],
    aside: typeof plan.aside === "string" ? plan.aside : null,
    questions: Array.isArray(plan.questions) ? plan.questions.filter((item) => typeof item === "string") : [],
    routes: plan.routes.filter(isRoute),
  };
}

function isRoute(value: unknown): value is RoutePlan {
  if (!value || typeof value !== "object") return false;
  const route = value as Partial<RoutePlan>;
  return typeof route.id === "string" && typeof route.name === "string" && Array.isArray(route.steps) && Array.isArray(route.bom);
}

export function routeSteps(route: RoutePlan | undefined): PlanStep[] {
  if (!route) return [];
  return route.steps.filter((step) => step && typeof step.id === "string" && typeof step.title === "string");
}

export function routeBom(route: RoutePlan | undefined): BomLine[] {
  if (!route) return [];
  return route.bom.filter((line) => line && typeof line.id === "string" && typeof line.item === "string");
}

export function routeRisks(route: RoutePlan | undefined): Risk[] {
  if (!route?.risks) return [];
  return route.risks.filter((risk) => risk && typeof risk.title === "string");
}

export function chosenRoute(plan: Blueprint | null, routeId: string | null): RoutePlan | undefined {
  if (!plan) return undefined;
  return plan.routes.find((route) => route.id === routeId) ?? plan.routes[0];
}

const OPEN_TOOL_LABELS: Record<string, string> = {
  "ext-cad": "CAD",
  "ceid-hand": "hand tools",
  "ceid-bambu": "a printer",
  "ceid-laser-large": "a laser",
  "ceid-laser-small": "a laser",
  "ceid-electronics": "an electronics bench",
  "ceid-store": "shop stock",
};

function toolLabels(ids: string[], campus: Campus): string[] {
  const labels = ids.map((id) => {
    if (campus === "open") return OPEN_TOOL_LABELS[id] ?? "";
    return describeTool(id).name.replace(/\s+/g, " ").trim().slice(0, 72);
  });
  return [...new Set(labels.filter((label) => label.length > 0))].slice(0, 2);
}

export function nextOpenStep(
  plan: Blueprint | null,
  routeId: string | null,
  doneIds: Iterable<string>,
  campus: Campus = "open",
): { id: string; title: string; detail: string; minutes: number | null; tools: string[] } | null {
  const done = new Set(doneIds);
  const step = routeSteps(chosenRoute(plan, routeId)).find((item) => !done.has(item.id));
  if (!step) return null;
  const detail = (step.detail || step.advice || "").replace(/\s+/g, " ").trim();
  const minutes = typeof step.minutes === "number" && step.minutes > 0 ? Math.round(step.minutes) : null;
  return {
    id: step.id,
    title: step.title.replace(/\s+/g, " ").trim().slice(0, 160),
    detail: detail.slice(0, 220),
    minutes,
    tools: toolLabels(step.tools ?? [], campus),
  };
}

/** One line for the return card: how long the step takes, and what you need in front of you. */
export function sessionFit(minutes: number | null, tools: string[]): string {
  const bits: string[] = [];
  if (minutes && minutes > 0) {
    if (minutes < 60) bits.push(`About ${minutes} min`);
    else if (minutes % 60 === 0) bits.push(`About ${minutes / 60} hour${minutes === 60 ? "" : "s"}`);
    else bits.push(`About ${Math.round(minutes / 6) / 10} hours`);
  }
  if (tools.length > 0) bits.push(tools.join(", "));
  return bits.join(" · ");
}

/** Stock on the chosen route that is not marked in hand. Unset lines still count as needed. */
export function partsStillOut(
  plan: Blueprint | null,
  routeId: string | null,
  statuses: Iterable<[string, BomStatus]>,
): string[] {
  const known = new Map(statuses);
  return routeBom(chosenRoute(plan, routeId))
    .filter((line) => (known.get(line.id) ?? "need") !== "in_hand")
    .map((line) => line.item.replace(/\s+/g, " ").trim().slice(0, 80))
    .filter((item) => item.length > 0)
    .slice(0, 6);
}

/** The project to reopen: soonest deadline that still has a step, otherwise the newest open one. */
export function pickReturnProject(projects: ProjectSummary[], now = new Date()): ProjectSummary | null {
  if (projects.length === 0) return null;
  const open = projects.filter((project) => project.nextStepTitle);
  const pool = open.length > 0 ? open : projects;
  const upcoming = pool
    .filter((project) => {
      const days = daysUntil(project.deadline, now);
      return days !== null && days >= 0;
    })
    .sort((a, b) => (daysUntil(a.deadline, now) ?? 0) - (daysUntil(b.deadline, now) ?? 0));
  return upcoming[0] ?? pool[0];
}

export function parseConstraints(input: unknown): Constraints {
  const raw = (input ?? {}) as Partial<Constraints>;
  const budget = Number(raw.budget);
  if (!Number.isFinite(budget) || budget < 0 || budget > 20000) throw new Error("Budget needs to be a number from 0 to 20000.");
  const size = oneOf(raw.size, ["handheld", "bench", "large"] as const, "bench");
  const material = oneOf(raw.material, ["any", "plastic", "acrylic", "wood", "metal"] as const, "any");
  const experience = oneOf(raw.experience, ["new", "some", "trained"] as const, "some");
  const precision = oneOf(raw.precision, ["loose", "normal", "tight"] as const, "normal");
  const stress = oneOf(raw.stress, ["light", "moderate", "structural"] as const, "moderate");
  const exposure = oneOf(raw.exposure, ["indoor", "splash", "immersion", "heat"] as const, "indoor");
  const time = oneOf(raw.time, ["evening", "week", "month"] as const, "week");
  return { budget: Math.round(budget), size, material, experience, precision, stress, exposure, time };
}

function oneOf<T extends string>(value: unknown, allowed: readonly T[], fallback: T): T {
  return typeof value === "string" && (allowed as readonly string[]).includes(value) ? (value as T) : fallback;
}

export function daysUntil(deadline: string | null, now = new Date()): number | null {
  if (!deadline || !/^\d{4}-\d{2}-\d{2}$/.test(deadline)) return null;
  const [year, month, day] = deadline.split("-").map(Number);
  const due = new Date(year, month - 1, day);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  return Math.round((due.getTime() - start.getTime()) / 86_400_000);
}

export function errorText(err: unknown): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "object" && err && "message" in err) {
    const message = (err as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) return message;
  }
  return "Something went wrong. Try again.";
}

export function deadlineLabel(deadline: string | null, now = new Date()): string {
  const days = daysUntil(deadline, now);
  if (days == null) return "No deadline";
  if (days < 0) return `${Math.abs(days)} day${days === -1 ? "" : "s"} past due`;
  if (days === 0) return "Due today";
  if (days === 1) return "Due tomorrow";
  return `${days} days left`;
}
