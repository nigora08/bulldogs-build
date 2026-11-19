import { analyze, type Blueprint, type BomLine, type PlanStep, type RoutePlan } from "./engine.ts";

export type Campus = "yale" | "open";

const SWAPS: ReadonlyArray<readonly [RegExp, string]> = [
  [/SEAS Cleanroom lithography was scored and left off the short list\.[^.]*\./gi, "A research cleanroom is not a student circuit service. Order a board from a fab and solder it on a bench."],
  [/CEID’s member printers are documented with PLA Basic\.[^.]*\./gi, "Most student FDM printers run PLA. Use that print to learn the shape, then seal a rigid shell."],
  [/A desktop fan test is not a structural sign-off\.[^.]*\./gi, "A desktop fan test is not a structural sign-off. Keep a spinning part guarded, and stay inside the printer you actually have."],
  [/Get CEID membership|Become a CEID member|Join CEID and print/gi, "Get shop induction"],
  [/CEID orientation is the gate[^.]*\./gi, "Shop induction is the gate. Confirm open hours before you go."],
  [/No required printer class per the FAQ\./gi, "Many shops still want a short induction before the first print."],
  [/FAQ: no extra class is required to use the printers\./gi, "Confirm whether your shop wants an induction before the first print."],
  [/Optional weekly training helps the first slice\./gi, "Take the first-timer session if the shop offers one."],
  [/CEID publishes PLA, which is a poor water barrier\./gi, "PLA is a poor water barrier."],
  [/Colors stocked at CEID vary\. Price is not the store price\./gi, "Filament colors and shop prices vary. This figure is retail, not a shelf price."],
  [/Confirm stock at the CEID Store\./gi, "Confirm what sheet the shop actually stocks."],
  [/CEID must still approve the sheet\./gi, "Your shop still has to approve the sheet."],
  [/FAQ cap\./gi, "shop thickness cap."],
  [/CEID sewing area is a maybe — models are not listed\./gi, "A sewing machine is a maybe. Ask before you count on it."],
  [/CEID does not publish a tooling charge on the pages reviewed\./gi, "Shops rarely publish a tooling charge. Ask before you assume the job is free."],
  [/No public rate on the pages reviewed\./gi, "No public rate. Ask before you book."],
  [/No public rate sheet was reviewed\./gi, "No public rate. Ask before you book."],
  [/Neither APC nor YSoA publishes a student resin price on the pages used here\./gi, "Resin price is whatever your shop charges. Ask. Ventilation is not optional."],
  [/Build volume on the FAQ is 256 mm cubed\./gi, "Stay inside the build volume posted on the machine you will actually use."],
  [/Stay inside 256 mm in every axis, including brim\./gi, "Stay inside the printer's build volume, including brim."],
  [/The 256 mm CEID build volume is a hard constraint from the FAQ\./gi, "The printer's build volume is a hard constraint. Measure it."],
  [/inside a known 256 mm volume/gi, "inside the printer you can actually book"],
  [/256 mm cubed|256 mm/gi, "the printer's build volume"],
  [/Print PLA on a member P1S\+/gi, "Print on the shop FDM printer"],
  [/Slice in Bambu Studio/gi, "Slice in the shop's software"],
  [/Bambu printers|Bambu printer/gi, "FDM printers"],
  [/Workday course plus the in-person session/gi, "required course plus the in-person session"],
  [/Membership, Workday course, in-person session\./gi, "Shop induction, the required course, and an in-person session."],
  [/Workday course/gi, "the required course"],
  [/\bWorkday\b/gi, "the training system"],
  [/per the APC page/gi, "so the stock can be clamped"],
  [/APC notes this too/gi, "Cast acrylic cracks less than extruded"],
  [/not a CEID price/gi, "not a shop price"],
  [/CEID Store/gi, "shop store"],
  [/Wright teaching shop/gi, "teaching shop"],
  [/CEID FAQ/gi, "the shop's printer notes"],
  [/the CEID FAQ/gi, "the shop notes"],
  [/CEID’s/gi, "the shop's"],
  [/CEID/gi, "your makerspace"],
  [/Wright Lab/gi, "a supervised machine shop"],
  [/\bWright\b/gi, "the teaching shop"],
  [/YSoA|Yale School of Architecture/gi, "an architecture fab lab"],
  [/Handsome Dan/gi, "the shop"],
  [/Bulldogs Build/gi, "this plan"],
  [/Yale pages/gi, "public shop pages"],
  [/Yale price/gi, "shop price"],
  [/at Yale/gi, "on campus"],
  [/Yale/gi, "campus"],
  [/Gibbs/gi, "the machine shop"],
  [/\bAPC\b/g, "the advanced shop"],
  [/\bSEAS\b/g, "a research core"],
  [/Bambu/gi, "the printer"],
];

export function deyale(text: string): string {
  let next = text;
  for (const [pattern, replacement] of SWAPS) next = next.replace(pattern, replacement);
  return next
    .replace(/\bnot a your makerspace price/gi, "not a shop price")
    .replace(/\bthe your makerspace\b/gi, "the shop")
    .replace(/\ba your makerspace\b/gi, "a shop")
    .replace(/\byour makerspace shop\b/gi, "shop")
    .replace(/\bthe the\b/gi, "the")
    .replace(/\bteaching shop teaching shop\b/gi, "teaching shop")
    .replace(/\bshop shop\b/gi, "shop")
    .replace(/[ \t]{2,}/g, " ")
    .replace(/ \./g, ".");
}

function mapStep(step: PlanStep): PlanStep {
  const kind = step.kind === "yale" ? "engineering" : step.kind;
  return {
    ...step,
    kind,
    title: deyale(step.title),
    detail: deyale(step.detail),
    advice: deyale(step.advice),
  };
}

function mapLine(line: BomLine): BomLine {
  return { ...line, note: deyale(line.note), costNote: deyale(line.costNote) };
}

function mapRoute(route: RoutePlan): RoutePlan {
  return {
    ...route,
    name: deyale(route.name),
    tagline: deyale(route.tagline),
    why: deyale(route.why),
    tradeoff: deyale(route.tradeoff),
    hours: deyale(route.hours),
    deadEnd: route.deadEnd ? deyale(route.deadEnd) : undefined,
    accessTier: route.accessTier === "external" ? "external" : "inquire",
    steps: route.steps.map(mapStep),
    bom: route.bom.map(mapLine),
    risks: route.risks.map((risk) => ({ ...risk, title: deyale(risk.title), detail: deyale(risk.detail) })),
    assumptions: route.assumptions.map(deyale),
  };
}

export function toOpenShop(plan: Blueprint): Blueprint {
  const assumptions = [
    "Open shop ranks processes a typical university makerspace, class lab, or careful home shop can approximate. It does not know which machines your building has.",
    "Bulldogs Build is the Yale pack, with CEID, Wright Lab, architecture labs, and the cores named on public Yale pages. Switch to it when you are building there.",
    ...plan.assumptions.map(deyale),
  ];
  return {
    ...plan,
    summary: deyale(plan.summary),
    readout: plan.readout.map(deyale),
    assumptions,
    aside: plan.aside
      ? deyale(plan.aside)
      : "Confirm the winning process with your shop before you buy stock. A ranked plan is a starting argument, not a booking.",
    routes: plan.routes.map(mapRoute),
    questions: plan.questions.map(deyale),
  };
}

export function analyzeForCampus(brief: string, constraints: Parameters<typeof analyze>[1], campus: Campus): Blueprint {
  const plan = analyze(brief, constraints);
  return campus === "open" ? toOpenShop(plan) : plan;
}
