import type { AccessTier } from "@/data/equipment";

export interface Constraints {
  budget: number;
  size: "handheld" | "bench" | "large";
  material: "any" | "plastic" | "acrylic" | "wood" | "metal";
  experience: "new" | "some" | "trained";
  /** Optional so older saved briefs still load. Missing values use the defaults. */
  precision?: "loose" | "normal" | "tight";
  stress?: "light" | "moderate" | "structural";
  exposure?: "indoor" | "splash" | "immersion" | "heat";
  time?: "evening" | "week" | "month";
}

export const DEFAULT_CONSTRAINTS: Constraints = {
  budget: 100,
  size: "bench",
  material: "any",
  experience: "some",
  precision: "normal",
  stress: "moderate",
  exposure: "indoor",
  time: "week",
};

export function normalizeConstraints(input: Constraints): Required<Constraints> {
  return {
    budget: input.budget,
    size: input.size,
    material: input.material,
    experience: input.experience,
    precision: input.precision ?? "normal",
    stress: input.stress ?? "moderate",
    exposure: input.exposure ?? "indoor",
    time: input.time ?? "week",
  };
}

export interface BomLine {
  id: string;
  item: string;
  qty: number;
  unit: string;
  unitCost: number | null;
  costNote: string;
  note: string;
}

export interface PlanStep {
  id: string;
  title: string;
  detail: string;
  advice: string;
  tools: string[];
  minutes: number | null;
  kind: "yale" | "engineering" | "assumption";
}

export interface Risk {
  title: string;
  detail: string;
  severity: "watch" | "stop";
}

export interface RoutePlan {
  id: string;
  name: string;
  tagline: string;
  why: string;
  tradeoff: string;
  suitability: number;
  costScore: number;
  accessibility: number;
  difficulty: number;
  rankScore: number;
  hours: string;
  accessTier: AccessTier | "external";
  equipmentIds: string[];
  steps: PlanStep[];
  bom: BomLine[];
  risks: Risk[];
  assumptions: string[];
  deadEnd?: string;
}

export interface Blueprint {
  title: string;
  summary: string;
  readout: string[];
  assumptions: string[];
  aside: string | null;
  routes: RoutePlan[];
  questions: string[];
}

export interface ExampleProject {
  id: string;
  label: string;
  kicker: string;
  brief: string;
  constraints: Constraints;
}

export const EXAMPLES: ExampleProject[] = [
  {
    id: "waterproof",
    label: "Waterproof environmental sensor enclosure",
    kicker: "Flagship",
    brief:
      "I want to build a waterproof enclosure for an Arduino-based water-quality sensor. It should survive splashes and a short dunk in a stream, with a clear window and a sealed cable exit.",
    constraints: { budget: 80, size: "bench", material: "any", experience: "some" },
  },
  {
    id: "arm",
    label: "Laser-cut robotic arm",
    kicker: "Linkages",
    brief:
      "Laser-cut robotic arm with four linkages, hobby servos, and a light gripper. Bench-top, small payload, mostly flat parts I can bolt together.",
    constraints: { budget: 120, size: "bench", material: "any", experience: "some" },
  },
  {
    id: "pcb",
    label: "Custom PCB for a wearable device",
    kicker: "Electronics",
    brief:
      "Custom PCB for a wearable device: a wrist-worn heart-rate and temperature board with a coin-cell battery, about the size of a watch face.",
    constraints: { budget: 60, size: "handheld", material: "any", experience: "some" },
  },
  {
    id: "turbine",
    label: "3D-printed wind turbine",
    kicker: "Aero prototype",
    brief:
      "3D-printed wind turbine prototype, desktop scale, to compare blade shapes in a fan stream. It is a model, not a rooftop generator.",
    constraints: { budget: 50, size: "bench", material: "plastic", experience: "some" },
  },
  {
    id: "acrylic",
    label: "Acrylic housing for a physics experiment",
    kicker: "Clear box",
    brief:
      "Acrylic housing for a physics experiment: a clear box so a class can see an optics setup inside, with a removable lid and cable holes.",
    constraints: { budget: 70, size: "bench", material: "acrylic", experience: "new" },
  },
];

export const MORE_BRIEFS: ExampleProject[] = [
  {
    id: "bracket",
    label: "Steel bracket for a loaded shelf",
    kicker: "Metal",
    brief:
      "A steel bracket that has to hold a loaded shelf. It is a real structural part, not a plastic lookalike, and the holes need to line up.",
    constraints: { budget: 150, size: "bench", material: "metal", experience: "trained" },
  },
  {
    id: "sign",
    label: "Laser-cut wooden door sign",
    kicker: "Flat wood",
    brief: "A laser-cut wooden door sign for a student group, flat plywood, engraved letters, small enough to hang on a dorm door.",
    constraints: { budget: 40, size: "handheld", material: "wood", experience: "new" },
  },
  {
    id: "plate",
    label: "Aluminum mounting plate",
    kicker: "Sheet metal",
    brief: "An aluminum mounting plate with a precise hole pattern for a lab instrument. Flat sheet, no plastic, about the size of a laptop.",
    constraints: { budget: 200, size: "bench", material: "metal", experience: "some" },
  },
  {
    id: "case",
    label: "Handheld plastic instrument case",
    kicker: "Shape check",
    brief: "A handheld plastic case for a small instrument. I only need to check the shape and the snap fit before I commit to a harder process.",
    constraints: { budget: 30, size: "handheld", material: "plastic", experience: "new" },
  },
  {
    id: "board",
    label: "Two-layer audio amplifier board",
    kicker: "Circuit",
    brief: "A custom two-layer circuit board for a small audio amplifier. I will have the board made off campus and solder it at Yale.",
    constraints: { budget: 90, size: "handheld", material: "any", experience: "some" },
  },
  {
    id: "frame",
    label: "Desktop drone frame",
    kicker: "Aero",
    brief: "A desktop drone frame to compare arm stiffness. It is a model that should not fly fast, mostly flat carbon-looking plastic or wood.",
    constraints: { budget: 60, size: "bench", material: "any", experience: "some" },
  },
  {
    id: "optics",
    label: "Clear cover for a laser demo",
    kicker: "See-through",
    brief: "A clear cover so a class can watch a low-power laser demo without touching the optics. Removable lid, no metal.",
    constraints: { budget: 75, size: "bench", material: "acrylic", experience: "new" },
  },
  {
    id: "shaft",
    label: "Turned shaft for a winch",
    kicker: "Machine shop",
    brief: "A metal shaft for a small winch that has to take a real load. Round part, tight fit on a bearing, not a 3D print.",
    constraints: { budget: 220, size: "bench", material: "metal", experience: "trained" },
  },
  {
    id: "grip",
    label: "Soft jaw for a small gripper",
    kicker: "Light duty",
    brief: "A soft jaw for a small gripper on a bench robot. It only pinches a paper cup, so it can be printed plastic.",
    constraints: { budget: 25, size: "handheld", material: "plastic", experience: "some" },
  },
  {
    id: "panel",
    label: "Large plywood stage flat",
    kicker: "Oversize",
    brief: "A large plywood stage flat, taller than a person, with a few window cutouts. It will not fit on a desktop machine.",
    constraints: { budget: 180, size: "large", material: "wood", experience: "some" },
  },
];

interface Signals {
  waterproof: number;
  electronics: number;
  enclosure: number;
  pcb: number;
  wearable: number;
  aero: number;
  laserIntent: number;
  acrylic: number;
  wood: number;
  metal: number;
  plastic: number;
  load: number;
  precision: number;
  optical: number;
  linkage: number;
  outdoor: number;
  immersion: number;
  heat: number;
  constraints: Constraints;
}

function has(text: string, words: string[]): boolean {
  return words.some((word) => {
    const escaped = word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:$|[^a-z0-9])`, "i").test(text);
  });
}

function clamp(n: number): number {
  return Math.max(0, Math.min(100, Math.round(n)));
}

export function extract(brief: string, constraints: Constraints): Signals {
  const text = brief.toLowerCase();
  const c = normalizeConstraints(constraints);
  const material = c.material;
  const wetWords = has(text, ["waterproof", "water-tight", "watertight", "submers", "splash", "dunk", "marine", "rainproof", "river", "stream", "creek"]);
  const immersed = has(text, ["river", "stream", "creek", "underwater", "submerged", "submers", "immersion", "dunk"]) || c.exposure === "immersion";
  const splash = wetWords || c.exposure === "splash" || immersed;
  let precision = has(text, ["tolerance", "precision", "press-fit", "press fit"]) ? 0.85 : has(text, ["optics", "optical", "bearing"]) ? 0.45 : 0.2;
  if (c.precision === "tight") precision = Math.max(precision, 0.9);
  if (c.precision === "loose") precision = Math.min(precision, 0.15);
  let load = has(text, ["load-bearing", "load bearing", "structural", "payload", "robotic arm", "robot arm", "gripper", "bracket"]) ? 1 : 0;
  if (c.stress === "structural") load = 1;
  if (c.stress === "light") load = 0;
  return {
    waterproof: splash ? 1 : 0,
    electronics: has(text, ["arduino", "sensor", "circuit", "electronic", "pcb", "battery", "wearable", "microcontroller"]) ? 1 : 0,
    enclosure: has(text, ["enclosure", "housing", "case", "box", "shell", "organizer"]) ? 1 : 0,
    pcb: has(text, ["pcb", "printed circuit", "circuit board"]) ? 1 : 0,
    wearable: has(text, ["wearable", "wrist", "watch"]) ? 1 : 0,
    aero: has(text, ["wind", "turbine", "airfoil", "blade", "aerodynamic", "drone", "wing"]) ? 1 : 0,
    laserIntent: has(text, ["laser-cut", "laser cut", "laser"]) ? 1 : 0,
    acrylic: material === "acrylic" || has(text, ["acrylic", "plexiglass", "plexi", "optics", "optical"]) ? 1 : 0,
    wood: material === "wood" || has(text, ["plywood", "wood", "mdf"]) ? 1 : 0,
    metal: material === "metal" || has(text, ["aluminum", "aluminium", "steel", "metal bracket", "bracket"]) ? 1 : 0,
    plastic: material === "plastic" || has(text, ["pla", "petg", "3d-print", "3d print", "printed"]) ? 1 : 0,
    load,
    precision,
    optical: has(text, ["optic", "optics", "clear", "transparent", "window", "see-through"]) ? 1 : 0,
    linkage: has(text, ["arm", "linkage", "gripper", "joint"]) ? 1 : 0,
    outdoor: has(text, ["stream", "outdoor", "field", "waterproof", "splash", "river", "creek"]) || c.exposure === "splash" || c.exposure === "immersion" ? 1 : 0,
    immersion: immersed ? 1 : 0,
    heat: c.exposure === "heat" || has(text, ["heat", "hot", "oven", "sunlight"]) ? 1 : 0,
    constraints: c,
  };
}

function money(total: number, budget: number): number {
  if (total <= budget * 0.45) return 94;
  if (total <= budget * 0.8) return 84;
  if (total <= budget) return 72;
  if (total <= budget * 1.35) return 46;
  return 24;
}

function bomTotal(lines: BomLine[]): number {
  return lines.reduce((sum, line) => sum + (line.unitCost == null ? 0 : line.unitCost * line.qty), 0);
}

function experienceNudge(level: Constraints["experience"], trainedDelta: number, newDelta: number): number {
  if (level === "trained") return trainedDelta;
  if (level === "new") return newDelta;
  return 0;
}

const EST = "Market estimate, not a CEID price";
const UNKNOWN = "Yale price not published";

function step(
  id: string,
  title: string,
  detail: string,
  advice: string,
  tools: string[],
  minutes: number | null,
  kind: PlanStep["kind"],
): PlanStep {
  return { id, title, detail, advice, tools, minutes, kind };
}

function buildFdm(s: Signals): RoutePlan {
  const wet = s.waterproof > 0;
  const arm = s.linkage > 0 && s.laserIntent > 0;
  const aero = s.aero > 0;
  const wearable = s.wearable > 0;
  const c = s.constraints;
  let suitability = 42 + s.plastic * 22 + s.enclosure * 14 + s.aero * 30 + s.electronics * 8;
  suitability -= s.metal * 36 + s.waterproof * 16 + s.immersion * 22 + s.heat * 14 + s.load * 18 + s.precision * 12 + s.pcb * 6;
  if (c.size === "large") suitability -= 34;
  if (c.size === "handheld") suitability += 8;
  if (c.material === "acrylic" || c.material === "wood" || c.material === "metal") suitability -= 18;
  if (arm) suitability += 12;
  suitability += experienceNudge(c.experience, -4, 10);

  const name = aero
    ? "FDM blade prototypes"
    : arm
      ? "Printed joints, laser-ready flats"
      : wet
        ? "PLA form-and-fit shell"
        : wearable
          ? "Printed wearable shell"
          : "FDM plastic prototype";

  const bom: BomLine[] = aero
    ? [
        { id: "fdm-pla", item: "PLA for hubs and blades", qty: 1, unit: "180 g", unitCost: 7, costNote: EST, note: "Split blades to fit a 256 mm cube." },
        { id: "fdm-rod", item: "Shaft, 4 mm rod or bolt", qty: 1, unit: "pc", unitCost: 3, costNote: EST, note: "Metal shaft, not printed." },
        { id: "fdm-bear", item: "Small skate bearing", qty: 2, unit: "pc", unitCost: 4, costNote: EST, note: "Press only after a test coupon." },
      ]
    : wet
      ? [
          { id: "fdm-pla", item: "PLA Basic (form study only)", qty: 1, unit: "150 g", unitCost: 6, costNote: EST, note: "CEID publishes PLA, which is a poor water barrier." },
          { id: "fdm-gland", item: "Cable gland, prototype", qty: 1, unit: "pc", unitCost: 4, costNote: EST, note: "Check the seal on the real housing, not on PLA." },
        ]
      : [
          { id: "fdm-pla", item: "PLA Basic", qty: 1, unit: wearable ? "40 g" : "120 g", unitCost: wearable ? 3 : 5, costNote: EST, note: "Colors stocked at CEID vary. Price is not the store price." },
          { id: "fdm-fast", item: "M3 fasteners", qty: 1, unit: "set", unitCost: 6, costNote: EST, note: "Heat-set inserts only if you have tested them in PLA." },
        ];

  const steps: PlanStep[] = aero
    ? [
        step("cad", "Model one blade and a hub", "Keep the rotor inside 256 mm, or split blades and pin them on.", "A printed blade is a shape test. It is not a rated airfoil.", ["ext-cad"], 90, "engineering"),
        step("member", "Get CEID membership", "Orientation is the gate. FAQ: no extra class is required to use the printers.", "Optional weekly training helps the first slice.", ["ceid-bambu"], 60, "yale"),
        step("slice", "Slice in Bambu Studio", "Two walls is not enough for a spinning hub. Use more perimeters on the hub only.", "Print a 20 mm coupon before a full rotor.", ["ceid-bambu"], 30, "engineering"),
        step("print", "Print PLA on a member P1S+", "Build volume on the FAQ is 256 mm cubed. Orient blades to keep layer lines off the leading edge if you can.", "Staffed help exists; the printers themselves are a member tool.", ["ceid-bambu", "ceid-store"], 180, "yale"),
        step("balance", "Balance and shroud the test", "Spin by hand, then only in a guarded fan stream, goggles on.", "Stop if it walks, cracks, or sheds a blade. PLA gets brittle.", ["ceid-hand"], 45, "engineering"),
      ]
    : wet
      ? [
          step("intent", "Decide this print is a rehearsal", "Use PLA to learn the lid, window, and gland layout. Do not call the PLA part the waterproof housing.", "CEID’s published material for these machines is PLA Basic.", ["ext-cad"], 40, "assumption"),
          step("cad", "Model the split line", "Leave a groove you can later cut in acrylic. Fillets that trap water are a leak path.", "Dimension the real board, battery, and connector, not a guess, once you have them.", ["ext-cad"], 90, "engineering"),
          step("member", "Join CEID and print", "Membership, then slice. No required printer class per the FAQ.", "Confirm current studio hours; pages disagree on 24/7 versus open hours.", ["ceid-bambu"], 70, "yale"),
          step("fit", "Fit the electronics dry", "Check cable bend radius and USB access before you design the seal.", "Unpowered board only while you are still changing geometry.", ["ceid-electronics", "ceid-hand"], 40, "engineering"),
          step("transfer", "Move the design to a sealable process", "Take the working geometry to laser-cut cast acrylic or a machined lid.", "See the other routes. This one stops at form-and-fit on purpose.", ["ceid-laser-large"], 30, "engineering"),
        ]
      : [
          step("cad", "Model the part", arm ? "Print servo horns and spacers. Leave flat links for the laser so they stay stiff." : "Shell with screw bosses, 2–3 mm walls, and a service opening.", "Measure real parts. A datasheet drawing beats a memory.", ["ext-cad"], 80, "engineering"),
          step("member", "Become a CEID member", "Orientation, then the Bambu printers. Training is optional.", "Ask which filament colors are actually on the shelf.", ["ceid-bambu"], 60, "yale"),
          step("slice", "Slice conservatively", "Layer height 0.2 mm is a fair default. Slow the first layer.", c.size === "large" ? "A large part will not fit. Split it or change process." : "Stay inside 256 mm in every axis, including brim.", ["ceid-bambu"], 25, "engineering"),
          step("print", "Print and strip supports", "FAQ: supports are the same PLA, broken off by hand. Budget time to clean holes.", "Do not chase ±0.05 mm. The FAQ accuracy is a machine figure, not your assembly stack.", ["ceid-bambu"], 150, "yale"),
          step("fit", "Assemble and cycle it", arm ? "Check pinch points at every joint before the servo is powered." : "Close the shell on the real board.", "If a hole is tight, drill it. Do not force a screw into raw PLA.", ["ceid-hand"], 40, "engineering"),
        ];

  const risks: Risk[] = [
    {
      title: "PLA is not a promise",
      detail: wet
        ? "A PLA shell will take up water and will not stay sealed. Treat every printed wet-housing as a model."
        : "Layer lines are leak paths and crack starters. Do not claim outdoor durability from a PLA print.",
      severity: wet ? "stop" : "watch",
    },
    {
      title: "Build volume is 256 mm",
      detail: "That figure is from the CEID FAQ for the P1S+. Larger envelopes need a split, a different process, or another shop.",
      severity: c.size === "large" ? "stop" : "watch",
    },
  ];
  if (aero) {
    risks.push({
      title: "Spinning parts fail suddenly",
      detail: "Balance the rotor and guard the stream. This plan does not rate a tip speed. If it sheds a blade, someone is in the plane of the rotor.",
      severity: "stop",
    });
  }

  return {
    id: "fdm",
    name,
    tagline: wet ? "Right for learning the shape. Wrong as the final wet part." : "Fastest member-accessible plastic at CEID.",
    why: wet
      ? "You can hold the layout today on a machine you are allowed to use, then transfer a proven shape to a material that can actually be sealed."
      : aero
        ? "Blade camber is awkward to laser-cut. A member FDM printer is the direct way to compare shapes, inside a known 256 mm volume."
        : arm
          ? "Servos and spacers want thickness. Flat links want the laser. Printing only the bulky bits keeps the arm light and the flats stiff."
          : "CEID publishes a member FDM path in PLA with no required class, which fits a first plastic prototype.",
    tradeoff: wet
      ? "You will print twice in spirit: once in PLA to learn, again in acrylic or a machined lid to seal. Skipping the second step leaves the sensor unprotected."
      : "PLA accuracy on the FAQ is not a shop tolerance stack. Holes, clips, and press fits need a test coupon. Large parts do not fit.",
    suitability,
    costScore: money(bomTotal(bom), c.budget),
    accessibility: clamp(86 + experienceNudge(c.experience, 4, 2)),
    difficulty: clamp((aero ? 48 : wet ? 36 : 32) + experienceNudge(c.experience, -8, 8) + (c.size === "large" ? 20 : 0)),
    rankScore: 0,
    hours: aero ? "One afternoon to model, one evening to print, then a guarded spin test." : "A few hours of design plus a print measured in hours, not days.",
    accessTier: "member",
    equipmentIds: ["ceid-bambu", "ceid-store", "ceid-hand"],
    steps,
    bom,
    risks,
    assumptions: [
      wet ? "Assumes the printed part is a prototype, not the deployed housing." : "Assumes PLA Basic, the only model material the CEID FAQ lists for these printers.",
      "Filament cost is a retail estimate. The CEID Store price was not published.",
    ],
  };
}

function buildLaser(s: Signals): RoutePlan {
  const wet = s.waterproof > 0;
  const arm = s.linkage > 0;
  const clear = s.acrylic > 0 || s.optical > 0 || (s.enclosure > 0 && s.acrylic > 0);
  const metalBlocked = s.metal > 0 || s.constraints.material === "metal";
  const c = s.constraints;
  let suitability = 36 + s.laserIntent * 26 + s.acrylic * 22 + s.wood * 16 + s.enclosure * 12 + s.optical * 16;
  if (arm) suitability += 24;
  if (wet) suitability += 12;
  if (wet && s.enclosure) suitability += 8;
  if (s.immersion) suitability += 8;
  if (s.aero) suitability += 10;
  suitability -= s.metal * 32 + s.pcb * 10 + (metalBlocked ? 24 : 0);
  if (c.material === "plastic") suitability -= 8;
  suitability += experienceNudge(c.experience, 4, -4);

  const name = arm
    ? "Laser-cut linkages"
    : wet
      ? "Gasketed acrylic shell"
      : clear
        ? "Laser-cut clear housing"
        : s.aero
          ? "Laser-cut blade profiles"
          : "Laser-cut flat parts";

  const bom: BomLine[] = arm
    ? [
        { id: "las-ply", item: "Baltic birch plywood, 6 mm", qty: 1, unit: "600 × 400 mm", unitCost: 18, costNote: EST, note: "Cast acrylic if you would rather see the links. Confirm stock at the CEID Store." },
        { id: "las-servo", item: "Hobby servo", qty: 4, unit: "pc", unitCost: 9, costNote: EST, note: "Retail modules, not a Yale catalog item." },
        { id: "las-bolt", item: "M3 bolts, locknuts, spacers", qty: 1, unit: "set", unitCost: 8, costNote: EST, note: "Leave the laser kerf in the hole chart." },
      ]
    : wet
      ? [
          { id: "las-acr", item: "Cast acrylic, 4.5 mm", qty: 1, unit: "300 × 300 mm", unitCost: 16, costNote: EST, note: "Cast, not extruded, cracks less. APC notes this too; CEID must still approve the sheet." },
          { id: "las-gasket", item: "Silicone gasket cord, 2 mm", qty: 1, unit: "m", unitCost: 8, costNote: EST, note: "A groove does not make a seal by itself." },
          { id: "las-gland", item: "Cable gland", qty: 1, unit: "pc", unitCost: 4, costNote: EST, note: "Match the cable diameter." },
          { id: "las-fast", item: "Stainless M3 fasteners", qty: 1, unit: "set", unitCost: 6, costNote: EST, note: "Through-bolts beat plastic threads in acrylic." },
        ]
      : [
          { id: "las-acr", item: clear ? "Cast acrylic sheet, 4.5 mm" : "Plywood or acrylic sheet", qty: 1, unit: "sheet", unitCost: clear ? 18 : 14, costNote: EST, note: "Stay at or under 0.5 in. FAQ cap." },
          { id: "las-fast", item: "Fasteners or acrylic cement", qty: 1, unit: "set", unitCost: 7, costNote: EST, note: "Solvent cement needs ventilation. It is a general shop practice, not a Yale SOP pasted here." },
        ];

  const steps: PlanStep[] = arm
    ? [
        step("kin", "Sketch the four-bar", "Pin-to-pin lengths on paper first. A laser will cut a bad linkage perfectly.", "Keep the payload light. Plywood links buckle if you ask them to lift a laptop.", ["ext-cad"], 50, "engineering"),
        step("draw", "Draw profiles in Illustrator", "CEID lasers want Illustrator files. Offset holes for kerf after a test square in the real sheet.", "Label grain direction on plywood.", ["ext-cad", "ceid-laser-large"], 70, "yale"),
        step("train", "Finish laser training", "Workday PRG-FL-EHS-027, then the in-person CEID session. Bring the transcript.", "FAQ hours in term: Mon–Thu 5–9 pm. They change. Confirm.", ["ceid-laser-large", "ceid-laser-small"], 90, "yale"),
        step("cut", "Cut under 30 minutes a pass", "The FAQ asks members to keep each cut under half an hour. Split the job.", "Approved list is wood, acrylic, mat board, cardboard, paper, cork, genuine leather.", ["ceid-laser-large", "ceid-store"], 40, "yale"),
        step("build", "Bolt the arm and limit the travel", "Servos at the electronics benches or your bench. Add physical stops so a link cannot fold onto a finger.", "Power the servo last, at low speed.", ["ceid-electronics", "ceid-hand"], 80, "engineering"),
      ]
    : wet
      ? [
          step("seal", "Pick a seal you can test", "A face gasket in a groove, a cable gland, and stainless screws. No claimed IP rating.", "Plan a weep path so a leak is obvious and does not fill the box.", ["ext-cad"], 40, "engineering"),
          step("cad", "Model panels and the gland flat", "Window can be a clearer thinner sheet, gasketed, not solvent-welded over the sensor.", "Leave 5 mm of acrylic outside every screw.", ["ext-cad"], 90, "engineering"),
          step("ai", "Make the Illustrator file", "Hairline cuts, engraved labels for lid orientation. Kerf test first.", "0.5 in is the published thickness cap.", ["ceid-laser-large"], 50, "yale"),
          step("train", "Orientation plus laser training", "Membership, Workday course, in-person session.", "Do not book a cut night before both are done.", ["ceid-laser-large"], 90, "yale"),
          step("cut", "Cut cast acrylic", "Protective film: APC’s note (paper films finish better) is general practice. Confirm CEID wants film on or off.", "Stay on the approved material list.", ["ceid-laser-large", "ceid-store"], 30, "yale"),
          step("test", "Leak-test with no electronics", "Tissue inside, close the lid, dunk or spray, then open. Only then try a powered board in a dry run.", "A passing dunk is not a field certification.", ["ceid-hand"], 40, "engineering"),
        ]
      : s.aero
        ? [
            step("profile", "Pick a flat profile on purpose", "A laser cuts a silhouette, not a cambered blade. Use it to compare planforms, or as ribs, not as a finished airfoil.", "Camber still belongs on the FDM route.", ["ext-cad"], 40, "engineering"),
            step("draw", "Draw the rotor in Illustrator", "One blade, a hub plate, and a kerf coupon. Stay inside the 30-minute cut request.", "Plywood or acrylic only, half an inch max at CEID.", ["ceid-laser-large"], 50, "yale"),
            step("train", "Finish laser training", "Workday PRG-FL-EHS-027, then in person. Members only.", "Term-time FAQ hours are Monday–Thursday evenings. Confirm.", ["ceid-laser-large"], 90, "yale"),
            step("cut", "Cut and balance", "Identical blades should come from the same sheet face. Number them.", "Guard any spin test. A flat rotor is still a propeller.", ["ceid-laser-large", "ceid-hand", "ceid-store"], 40, "engineering"),
          ]
        : [
          step("measure", "Measure the thing inside", clear ? "Optics bench clearance, lid swing, and where hands reach." : "Overall envelope and how panels meet.", "If a dimension is a guess, it is labeled that way in your sketch.", ["ext-cad"], 30, "assumption"),
          step("joint", "Choose joints", clear ? "Screws and a gasketed lid stay reversible. Solvent welds are permanent and can craze a window." : "Finger joints or tabs. Account for kerf.", "Acrylic cracks if screws are too close to an edge.", ["ext-cad"], 50, "engineering"),
          step("file", "Export an Illustrator file", "CEID’s published workflow is Illustrator, edited before you sit down at the laser PC.", "Cut a 25 mm square and measure it.", ["ceid-laser-small"], 40, "yale"),
          step("train", "Get trained", "Online EHS module plus in-person. Members only.", "Term-time hours on the FAQ are evenings, four nights. Verify.", ["ceid-laser-large"], 90, "yale"),
          step("cut", "Cut, then assemble dry", "30-minute courtesy limit. Edges are sharp; deburr.", "Safety glasses stay on.", ["ceid-laser-large", "ceid-hand", "ceid-store"], 50, "yale"),
        ];

  const risks: Risk[] = [
    {
      title: metalBlocked ? "CEID lasers are not a metal shop" : "Thickness and material list are hard gates",
      detail: metalBlocked
        ? "The CEID FAQ material list does not include metal. A metal plate needs a different shop, not a favor at the laser."
        : "Half an inch and the approved list (wood, acrylic, mat board, cardboard, paper, cork, genuine leather). PVC and polycarbonate do not belong in a CO2 laser.",
      severity: "stop",
    },
    {
      title: wet ? "A gasket drawing is not waterproof" : "Kerf will lie to you",
      detail: wet
        ? "Seal it, then test it empty. Nothing in this plan certifies submersion, pressure, or a safe home for a powered board."
        : "Hole sizes change with focus, speed, and sheet. Fit pins to a coupon cut from the same sheet.",
      severity: wet ? "stop" : "watch",
    },
  ];

  return {
    id: "laser",
    name,
    tagline: metalBlocked ? "Poor fit — CEID’s published laser list is not metal." : "Best documented member path for flat acrylic and wood.",
    why: arm
      ? "You asked for a laser-cut arm. Flat links are exactly what the CEID beds are published to do, once you are trained."
      : wet
        ? "A bolted cast-acrylic clamshell with a real gasket is a plausible splash housing. PLA is not. The laser path is the one that matches the material."
        : clear
          ? "A class needs to see through the box. Laser-cut cast acrylic is the member process that keeps optical faces flat."
          : "Flat parts, a published material list, and a member training path make the laser the default when the geometry is 2D.",
    tradeoff: "Training is two real steps, hours are limited, and each job should be short. You cannot cut metal or thick stock on the published CEID rules. 3D shape has to be designed as flats.",
    suitability,
    costScore: money(bomTotal(bom), c.budget),
    accessibility: clamp(74 + experienceNudge(c.experience, 8, -8)),
    difficulty: clamp((arm ? 48 : wet ? 58 : 44) + experienceNudge(c.experience, -10, 10)),
    rankScore: 0,
    hours: "Design in an afternoon. Training may wait for the next in-person slot. Cutting itself is a short evening.",
    accessTier: "trained",
    equipmentIds: ["ceid-laser-large", "ceid-laser-small", "ceid-store", "ceid-hand"],
    steps,
    bom,
    risks,
    assumptions: [
      "Kerf is unknown until you cut a coupon. Drawings should say so.",
      "Sheet price is a retail estimate. Buy stock at the CEID Store or elsewhere; the store’s price list was not public.",
    ],
    deadEnd: metalBlocked ? "CEID will not be your cutter for metal. Use the waterjet or a machine shop route, and expect an access conversation." : undefined,
  };
}

function buildCnc(s: Signals): RoutePlan {
  const c = s.constraints;
  const wet = s.waterproof > 0;
  let suitability = 30 + s.precision * 28 + s.load * 22 + s.metal * 26 + (c.material === "metal" ? 18 : 0);
  if (wet && s.metal) suitability += 8;
  if (s.immersion) suitability += 10;
  if (s.aero) suitability += 8;
  suitability -= s.wearable * 12 + s.pcb * 16;
  if (c.material === "acrylic" && s.optical) suitability -= 6;
  suitability += experienceNudge(c.experience, 12, -16);

  const bom: BomLine[] = [
    {
      id: "cnc-stock",
      item: s.metal || c.material === "metal" ? "Aluminum plate or bar" : "Delrin or hardwood blank",
      qty: 1,
      unit: "blank",
      unitCost: s.metal || c.material === "metal" ? 28 : 16,
      costNote: EST,
      note: "Confirm the CEID shop will cut this alloy or plastic before you buy it.",
    },
    { id: "cnc-tool", item: "Shop tooling wear", qty: 1, unit: "allowance", unitCost: null, costNote: UNKNOWN, note: "CEID does not publish a tooling charge on the pages reviewed." },
  ];

  const steps: PlanStep[] = [
    step("draw", "Dimension a shop drawing", "Orthographic views, a material callout, and the fits that actually matter. “Pretty CAD” is not a drawing.", "Call out only the tight faces. Everything else stays loose.", ["ext-cad"], 120, "engineering"),
    step("ask", "Ask CEID about mill access", "FAQ: membership, then contact the CEID about the machine shop. Two CNC mills are documented; the make is not.", "If they say no, stop and use Gibbs or the teaching shop rather than improvising.", ["ceid-cnc"], 30, "yale"),
    step("cam", "CAM with their tools", "Feeds and speeds come from the shop, not from a blog, once you know the machine.", "Plan soft jaws or a vise stop. The first part holds the risk.", ["ceid-cnc"], 90, "assumption"),
    step("cut", "Cut supervised", "Deburr. Check the critical dimension before you unclamp.", "Safety glasses, closed-toe shoes, no gloves in a spinning tool.", ["ceid-cnc", "ceid-manual"], 120, "yale"),
    step("check", "Fit the mating part", wet ? "A machined lid can carry an O-ring groove. Test the seal empty." : "Assemble, then change the drawing if the fit is wrong. Do not “adjust by eye” silently.", "Record what you actually cut.", ["ceid-hand"], 40, "engineering"),
  ];

  return {
    id: "cnc",
    name: wet ? "Machined lid and pocket" : s.aero ? "Machined hub" : "CNC a critical part",
    tagline: "When a dimension or a load actually matters.",
    why: s.metal
      ? "Metal and a real fit push you off the laser and off PLA. CEID documents two CNC mills, with access by asking."
      : wet
        ? "An O-ring groove in a stiffer lid is the upgrade path if a gasketed acrylic box is not enough. Access is the tax."
        : s.aero
          ? "A printed rotor needs a round, repeatable hub. Milling that one part is more honest than printing a bearing seat."
          : "Use the mill for the one feature that would fail in sheet goods, not for the whole project.",
    tradeoff: "You may not be allowed to run the mill. The public FAQ says to inquire. Count on delay, supervision, and a simpler geometry than a desktop CAM demo.",
    suitability,
    costScore: money(bomTotal(bom), c.budget) - 6,
    accessibility: clamp(46 + experienceNudge(c.experience, 14, -14)),
    difficulty: clamp(68 + experienceNudge(c.experience, -12, 12)),
    rankScore: 0,
    hours: "Drawing plus an access conversation. Cutting is half a day if you are cleared, or longer if you are waiting.",
    accessTier: "inquire",
    equipmentIds: ["ceid-cnc", "ceid-manual", "ceid-lathe"],
    steps,
    bom,
    risks: [
      {
        title: "Access is not guaranteed",
        detail: "Documented machines are not the same thing as a yes. If CEID cannot clear you, the part does not exist yet — switch routes.",
        severity: "watch",
      },
      {
        title: "Tolerances are earned",
        detail: "No CEID page publishes a student tolerance. Do not promise a press fit until you have cut a coupon on that mill.",
        severity: "watch",
      },
    ],
    assumptions: ["Stock price is retail. Shop consumables are unpublished."],
    deadEnd: "If the shop says no, take a simpler redesign to the laser or ask Gibbs / the Wright teaching shop. Do not shop-hop without asking.",
  };
}

function buildWaterjet(s: Signals): RoutePlan {
  const c = s.constraints;
  let suitability = 22 + s.metal * 34 + s.load * 12 + (c.material === "metal" ? 16 : 0) - s.wearable * 10 - s.pcb * 10;
  if (s.enclosure && !s.metal) suitability -= 10;
  suitability += experienceNudge(c.experience, 6, -8);

  const bom: BomLine[] = [
    { id: "wj-plate", item: "Aluminum plate, 3–6 mm", qty: 1, unit: "300 × 200 mm", unitCost: 22, costNote: EST, note: "Leave about 5 cm of stock on two edges so it can be clamped, per the APC page." },
    { id: "wj-fee", item: "APC machine time", qty: 1, unit: "job", unitCost: null, costNote: UNKNOWN, note: "No public rate on the pages reviewed." },
  ];

  return {
    id: "waterjet",
    name: "Waterjet a metal plate",
    tagline: "Restricted. Real metal, blunt inside corners.",
    why: "The Flow NanoJet is the documented campus waterjet for non-architecture researchers, and it will cut aluminum and steel the CEID laser will not.",
    tradeoff: "Appointment, Yale-researcher rule, and a building that is mid-move. Inside corners are limited by a 0.4 mm or 1 mm jet. This is the wrong tool for a plastic enclosure.",
    suitability,
    costScore: 40,
    accessibility: clamp(24 + experienceNudge(c.experience, 6, -6)),
    difficulty: clamp(62 + experienceNudge(c.experience, -8, 6)),
    rankScore: 0,
    hours: "Email and a design review first. Cutting is quick once you are on the calendar. The calendar is not published here.",
    accessTier: "appointment",
    equipmentIds: ["apc-waterjet"],
    steps: [
      step("geom", "Respect the jet", "Fillet internal corners. Fine text will fail. Thickness up to about 10 cm is the published ceiling, not a suggestion to cut 10 cm.", "Banned: lead and cadmium. Awkward: brittle, layered, soaking, or very soft stock.", ["apc-waterjet"], 60, "engineering"),
      step("mail", "Email the APC", "Craig Miller is the published contact. Say you are asking whether a researcher appointment is even appropriate.", "Do not travel to WL105 without a reply. The room may have changed.", ["apc-waterjet"], 20, "yale"),
      step("draw", "Send a flat DXF and a material", "Clamp margin about 5 cm on two edges. State the alloy.", "Ask which nozzle they would actually use.", ["apc-waterjet"], 40, "yale"),
      step("cut", "Cut with them, not instead of them", "2019 workshop dates on the site are not a current class.", "Edge quality still needs a file.", ["apc-waterjet", "wl-research"], 60, "yale"),
    ],
    bom,
    risks: [
      {
        title: "You may not be eligible",
        detail: "The APC page says Yale researchers, by appointment. Enrollment alone does not put you on the machine. If the answer is no, redesign for CEID.",
        severity: "stop",
      },
      {
        title: "Location is in flux",
        detail: "WL105, the research shop, and a future AIDC (fall 2026 on the facilities page) all appear in Yale’s own pages. Confirm before you carry stock across campus.",
        severity: "watch",
      },
    ],
    assumptions: ["Material price is retail. Machine recharge is unknown."],
    deadEnd: "No appointment, no part. Fallback: CEID mill inquiry, Wright teaching shop after EHS orientation, or change the part to acrylic and use the CEID laser.",
  };
}

function buildPcb(s: Signals): RoutePlan {
  const c = s.constraints;
  const suitability = clamp(78 + s.pcb * 14 + s.wearable * 6 - (c.size === "large" ? 20 : 0));
  const bom: BomLine[] = [
    { id: "pcb-fab", item: "2-layer PCB, small panel", qty: 5, unit: "boards", unitCost: 18, costNote: EST, note: "Commercial fab. Not a Yale price. Five is a typical minimum." },
    { id: "pcb-parts", item: "Passives, sensor module, battery holder", qty: 1, unit: "kit", unitCost: 22, costNote: EST, note: "Buy extras. Tombstoning happens." },
    { id: "pcb-strap", item: "Strap or soft band", qty: 1, unit: "pc", unitCost: 6, costNote: EST, note: "CEID sewing area is a maybe — models are not listed." },
  ];
  return {
    id: "pcb",
    name: "Ordered PCB, soldered at CEID",
    tagline: "The board is made off campus. The bench is at Yale.",
    why: "A custom board is a file plus a fabricator. CEID’s documented electronics benches are where it becomes a wearable, after you are a member.",
    tradeoff: "You wait on the mail. A coin cell and skin contact add real safety work the gerbers do not show. This is not a medical device path.",
    suitability,
    costScore: money(bomTotal(bom), c.budget),
    accessibility: clamp(82 + experienceNudge(c.experience, 4, -4)),
    difficulty: clamp(56 + experienceNudge(c.experience, -10, 12)),
    rankScore: 0,
    hours: "Layout in a few evenings. Boards often take one to two weeks. Soldering is an afternoon.",
    accessTier: "external",
    equipmentIds: ["ext-pcb", "ceid-electronics", "ceid-sewing", "ceid-hand"],
    steps: [
      step("spec", "Write the electrical rules", "Battery chemistry, max voltage on the skin side, what is insulated, and what must never be. A heart-rate board is not a diagnosis.", "If it touches skin, isolation is a design requirement, not a finish.", ["ext-cad"], 50, "engineering"),
      step("layout", "Layout a 2-layer board", "Keep the outline watch-sized. Strain-relief the strap holes in the board shape.", "No Yale page reviewed here tells you a minimum trace. Use your fabricator’s rules.", ["ext-cad"], 180, "engineering"),
      step("order", "Order from a board house", "Gerbers, stackup, and a known 2-layer process. Five copies.", "This step is off campus on purpose.", ["ext-pcb"], 30, "engineering"),
      step("member", "CEID membership", "You need the studio to solder with their benches and to use stocked components.", "Confirm whether irons are staffed-hours only.", ["ceid-electronics"], 60, "yale"),
      step("solder", "Assemble one board", "Paste or an iron, then inspect every joint. Power through a current-limited supply before a coin cell.", "Goggles. No loose hair over the iron.", ["ceid-electronics"], 90, "yale"),
      step("wear", "Strap and strain relief", "Sewing or a commercial band. The cable or battery door cannot lever on a solder joint.", "Vinyl cutter is named at CEID if you need a flat graphic, model unconfirmed.", ["ceid-sewing", "ceid-vinyl"], 40, "assumption"),
    ],
    bom,
    risks: [
      {
        title: "Skin and batteries",
        detail: "Do not promise biocompatibility or electrical safety. Limit current, cover every conductor that can touch skin, and do not use a lithium cell you cannot disconnect.",
        severity: "stop",
      },
      {
        title: "Not a cleanroom project",
        detail: "The SEAS cleanroom is the wrong building for this wearable. It is listed below only so you do not waste a week asking.",
        severity: "watch",
      },
    ],
    assumptions: ["Fab and parts prices are ordinary retail, rounded. Yale does not sell you this board."],
  };
}

function buildProto(s: Signals): RoutePlan {
  const c = s.constraints;
  let suitability = 48 + s.electronics * 18 + s.pcb * 8 - s.wearable * 8;
  if (c.size === "handheld") suitability -= 6;
  const bom: BomLine[] = [
    { id: "proto-board", item: "Protoboard or perfboard", qty: 1, unit: "pc", unitCost: 6, costNote: EST, note: "Faster than a PCB, larger than a watch face." },
    { id: "proto-mod", item: "Modules and wire", qty: 1, unit: "set", unitCost: 20, costNote: EST, note: "Arduino-class module if that is what you named." },
  ];
  return {
    id: "proto",
    name: "Protoboard at the electronics bench",
    tagline: "No fab wait. Bigger and uglier.",
    why: s.pcb
      ? "If the custom board slips, a perfboard proves the circuit this week on a bench CEID actually lists."
      : "Your project is electronics-first. The documented campus resource is a workstation, not a gerber.",
    tradeoff: "It will not be watch-sized or pretty. Vibration and sweat will open a wire. Plan a second, tighter version if the circuit works.",
    suitability,
    costScore: money(bomTotal(bom), c.budget),
    accessibility: clamp(84 + experienceNudge(c.experience, 0, 4)),
    difficulty: clamp(34 + experienceNudge(c.experience, -6, 6)),
    rankScore: 0,
    hours: "An evening to wire, if the modules are in hand.",
    accessTier: "member",
    equipmentIds: ["ceid-electronics", "ceid-hand", "ceid-store"],
    steps: [
      step("block", "Draw the block diagram", "Power, sensor, compute, connector. One page.", "Mark what is a module versus what you thought was a chip.", ["ext-cad"], 30, "engineering"),
      step("join", "CEID orientation", "Membership unlocks the studio benches.", "Ask what components the store actually stocks this week.", ["ceid-electronics", "ceid-store"], 60, "yale"),
      step("wire", "Solder the proof", "Short wires, strain relief, a fuse or a current limit.", "Photograph the wiring before you enclose it.", ["ceid-electronics"], 80, "yale"),
      step("box", "Only then enclose it", s.waterproof ? "Do not seal a circuit you have not run in the open." : "A shell comes from the laser or FDM route.", "Test unsealed.", ["ceid-hand"], 20, "engineering"),
    ],
    bom,
    risks: [
      {
        title: "A bird’s nest is not a product",
        detail: "Fine for a bench test. Weak as a wearable or a dunked sensor. Move to a PCB or a gasketed box after it works.",
        severity: "watch",
      },
    ],
    assumptions: ["Module prices vary widely; $20 is a placeholder for a small sensor kit, not a quote."],
  };
}

function buildProfessional(s: Signals): RoutePlan {
  const c = s.constraints;
  let suitability = 26 + s.precision * 24 + s.metal * 22 + s.load * 16;
  suitability += experienceNudge(c.experience, 4, -4);
  const bom: BomLine[] = [
    { id: "gib-stock", item: "Stock for the shop to approve", qty: 1, unit: "blank", unitCost: 30, costNote: EST, note: "They may prefer to supply it. Ask." },
    { id: "gib-labor", item: "Machinist time", qty: 1, unit: "job", unitCost: null, costNote: UNKNOWN, note: "No public rate sheet was reviewed." },
  ];
  return {
    id: "professional",
    name: "Gibbs professional machining",
    tagline: "They cut it. You do not run the machine.",
    why: "When the part is metal, precise, or easy to ruin, a staffed professional shop is the honest Yale resource. Gibbs publishes CNC, plastics, and exotic metals.",
    tradeoff: "The shop has moved during construction (SCL 22 is the cores-directory note; Wright says temporary). Lead time is theirs. A vague CAD file goes to the back.",
    suitability,
    costScore: 36,
    accessibility: clamp(42 + experienceNudge(c.experience, 4, -4)),
    difficulty: clamp(58 + experienceNudge(c.experience, -6, 8)),
    rankScore: 0,
    hours: "A drawing this week, a conversation, then their queue. Not a same-night part.",
    accessTier: "professional",
    equipmentIds: ["gibbs", "wl-teaching"],
    steps: [
      step("dwg", "Make a machinist drawing", "Material, critical dimensions, and what may float. One PDF.", "If you cannot tolerance it, you are not ready to ask.", ["ext-cad"], 120, "engineering"),
      step("where", "Confirm the current room", "Do not navigate to an old door. Email first. Wright’s facilities page is the directory.", "Teaching shop is the supervised student alternative if Gibbs is the wrong queue.", ["gibbs", "wl-teaching"], 20, "yale"),
      step("review", "Design review with the shop", "Expect them to change a radius or a tool approach. Listen.", "EHS orientation applies to teaching-shop access.", ["gibbs", "wl-teaching"], 40, "yale"),
      step("recv", "Inspect on receipt", "Check the critical dims. Deburr is not always finished the way a rendering shows.", "Update your assembly model to the part you hold.", ["ceid-hand"], 30, "engineering"),
    ],
    bom,
    risks: [
      {
        title: "Queue and relocation",
        detail: "A professional shop under construction is not a backup printer. Have a CEID version of the design that still teaches you something if the queue slips.",
        severity: "watch",
      },
    ],
    assumptions: ["Labor cost is unknown. The $30 is stock only."],
    deadEnd: "If they cannot take student work right now, ask the teaching shop about supervision, or simplify and use CEID.",
  };
}

function buildCleanroom(s: Signals): RoutePlan {
  const c = s.constraints;
  const suitability = 18 + (s.pcb ? 8 : 0) + experienceNudge(c.experience, 6, -8);
  return {
    id: "cleanroom",
    name: "SEAS cleanroom lithography",
    tagline: "Almost certainly the wrong door.",
    why: "Only if you already have a lab sponsorship and a reason to pattern a wafer. A wrist PCB is not that reason.",
    tradeoff: "Restricted research core. Process categories are public; a student how-to is not. Choosing this stalls the wearable.",
    suitability,
    costScore: 20,
    accessibility: 8,
    difficulty: 90,
    rankScore: 0,
    hours: "Weeks of access negotiations, if anyone says yes. Not a class-week plan.",
    accessTier: "restricted",
    equipmentIds: ["seas-cleanroom"],
    steps: [
      step("stop", "Pause and name the sponsor", "Who is the PI, and is this process on their cleanroom registration? If you do not know, this route ends here.", "YINQE only lists the capability class.", ["seas-cleanroom"], 15, "yale"),
      step("alt", "Switch to a board house", "Two-layer gerbers solve the wearable. Lithography does not, for this brief.", "Come back to the cleanroom when the project is a device process, not a product shell.", ["ext-pcb", "ceid-electronics"], 10, "engineering"),
    ],
    bom: [{ id: "cr-unk", item: "Cleanroom supplies", qty: 1, unit: "unknown", unitCost: null, costNote: UNKNOWN, note: "Not estimated. You should not be buying them for this project." }],
    risks: [
      {
        title: "Do not show up to etch a board",
        detail: "Photolithography, plasma etch, and evaporators are named. Walk-up PCB milling is not. Treating the cleanroom as a makerspace will waste your time and theirs.",
        severity: "stop",
      },
    ],
    assumptions: ["Included so the restricted option is visible, not recommended."],
    deadEnd: "Fallback is immediate: order a board, solder at CEID.",
  };
}

function buildResin(s: Signals): RoutePlan {
  const c = s.constraints;
  let suitability = 24 + (c.size === "handheld" ? 16 : 0) + s.precision * 10 - s.load * 20 - s.waterproof * 18 - s.aero * 12;
  const bom: BomLine[] = [
    { id: "resin-unk", item: "Resin volume", qty: 1, unit: "job", unitCost: null, costNote: UNKNOWN, note: "Neither APC nor YSoA publishes a student resin price on the pages used here." },
  ];
  return {
    id: "resin",
    name: "Resin print (restricted shops)",
    tagline: "Detail is real. Access is not yours by default.",
    why: "Form 3-class printers exist at the APC and in YSoA. They are the wrong default for a CEID member who needs a tough part.",
    tradeoff: "APC does not offer printing as a stand-alone service. YSoA prioritizes architecture students. Resin is brittle and a poor structural or wet choice.",
    suitability,
    costScore: 30,
    accessibility: 16,
    difficulty: clamp(50 + experienceNudge(c.experience, -6, 8)),
    rankScore: 0,
    hours: "Depends entirely on someone else’s queue.",
    accessTier: "restricted",
    equipmentIds: ["ysoa-print", "apc-form3"],
    steps: [
      step("ask", "Ask before you model for resin", "CEID’s FAQ printers are PLA FDM. If you need resin, you need a yes from YSoA or APC first.", "Non-architecture 3D-print requests at YSoA print behind architecture jobs.", ["ysoa-print", "apc-form3"], 20, "yale"),
      step("or", "Or stay on PLA", "Most fit-checks survive that choice.", "Switch to the FDM route.", ["ceid-bambu"], 10, "engineering"),
    ],
    bom,
    risks: [
      {
        title: "Brittle and gated",
        detail: "Do not hinge a mechanism or a wet lid on a resin print you may not be allowed to run.",
        severity: "stop",
      },
    ],
    assumptions: ["No resin mass is estimated because the shop may decline the job."],
    deadEnd: "Print PLA at CEID, or laser-cut the flats.",
  };
}

function composite(route: RoutePlan): number {
  return route.suitability * 0.46 + route.accessibility * 0.24 + route.costScore * 0.16 + (100 - route.difficulty) * 0.14;
}

function ensureCampusPath(ranked: RoutePlan[]): RoutePlan[] {
  const top = ranked.slice(0, 3);
  const ok = (route: RoutePlan) => route.accessibility >= 45 && route.accessTier !== "restricted";
  if (top.some(ok)) return top;
  const fallback = ranked.find(ok);
  if (!fallback) return top;
  return [fallback, ...top.filter((route) => route.id !== fallback.id)].slice(0, 3);
}

function shortlist(ranked: RoutePlan[]): RoutePlan[] {
  const viable = ranked.filter((route) => route.suitability >= 30);
  const pool = viable.length >= 2 ? viable : ranked;
  return ensureCampusPath(pool);
}

function titleFor(s: Signals): string {
  if (s.waterproof && s.electronics) return "Sealed sensor enclosure";
  if (s.pcb && s.wearable) return "Wearable custom PCB";
  if (s.pcb) return "Custom circuit board";
  if (s.aero) return "Small wind-turbine prototype";
  if (s.linkage && (s.laserIntent || s.load)) return "Laser-cut robotic arm";
  if ((s.acrylic || s.optical) && s.enclosure) return "Clear experiment housing";
  if (s.load) return "Load-bearing prototype";
  if (s.enclosure) return "Custom enclosure";
  return "Fabrication plan";
}

function readoutFor(s: Signals): string[] {
  const labels: [number, string][] = [
    [s.waterproof, "Needs a water strategy"],
    [s.electronics, "Electronics inside"],
    [s.pcb, "Custom PCB"],
    [s.wearable, "Worn on the body"],
    [s.enclosure, "Enclosure or housing"],
    [s.linkage, "Linkages or joints"],
    [s.aero, "Aerodynamic shape"],
    [s.optical || s.acrylic, "Wants optical clarity"],
    [s.metal, "Metal called out"],
    [s.wood, "Wood called out"],
    [s.plastic, "Printed plastic called out"],
    [s.load, "Carries a load"],
    [s.laserIntent, "Laser-cut asked for"],
  ];
  const found = labels.filter(([flag]) => flag > 0).map(([, label]) => label);
  found.push(s.constraints.size === "handheld" ? "Handheld scale" : s.constraints.size === "large" ? "Large scale" : "Bench scale");
  return found;
}

function assumptionsFor(brief: string, s: Signals): string[] {
  const c = s.constraints;
  const lines = [
    `Size is ${c.size}. Materials budget is $${c.budget}. Experience is ${c.experience}. Precision is ${c.precision}, load is ${c.stress}, exposure is ${c.exposure}, and time is ${c.time}. Change the controls if that is wrong.`,
    "Dollar figures are general retail estimates except where a line says the Yale price was not published. They are not CEID Store prices.",
    "Availability is not verified for any machine. Hours on Yale pages are term snapshots, not a live calendar.",
  ];
  if (!/\d/.test(brief)) lines.push("No numeric dimensions were in the brief. Geometry is schematic until you measure the real parts.");
  if (s.waterproof) lines.push("Water resistance is a goal, not a result. This plan never certifies a seal.");
  if (s.immersion) lines.push("River, stream, or immersion was read as more than a splash. PLA is not the deployed housing.");
  if (s.electronics && !s.pcb) lines.push("Electronics are treated as a module you already chose, not a chip you are taping out.");
  if (c.material !== "any") lines.push(`Material control is locked to ${c.material}, which overrides a looser reading of the sentence.`);
  return lines;
}

export function prepList(route: RoutePlan, constraints: Constraints): string[] {
  const c = normalizeConstraints(constraints);
  const training =
    route.accessTier === "trained"
      ? "Finish the named training before you go. For the CEID laser that is the Workday course plus the in-person session."
      : route.accessTier === "member"
        ? "CEID orientation is the gate. Confirm whether the studio is open or staffed-hours only this term."
        : "Email the shop before you visit. A name on a Yale page is not permission to walk in.";
  return [
    "A drawing with units. Mark which dimensions are measured and which are still guesses.",
    c.precision === "tight"
      ? "A short list of the fits that must be tight. Call everything else loose so the shop can change it."
      : "Overall size, and how the part opens, closes, or bolts together.",
    c.exposure === "immersion" || c.exposure === "splash"
      ? "A sealing sketch: lid joint, gasket or O-ring, and how the cable leaves the box."
      : "The material you want, and a second choice if the shop rejects the first.",
    training,
    "One written question: can I run this process, what file do you want, and what will you not cut?",
  ];
}

function questionsFor(brief: string, s: Signals): string[] {
  const c = s.constraints;
  const questions: string[] = [];
  if (!/\d/.test(brief)) questions.push("What has to fit inside, and roughly how big is it?");
  if (s.electronics && s.waterproof && !has(brief, ["gland", "cable", "connector"])) {
    questions.push("How does the cable leave the box, and can that exit stay above the water?");
  }
  if (s.immersion && c.exposure !== "immersion") {
    questions.push("Is this a splash, a short dunk, or hours in the river? Set Water / heat to match.");
  }
  if (s.load && c.stress !== "structural") {
    questions.push("What does the part have to hold, and what happens if it breaks?");
  }
  if (!s.metal && !s.acrylic && !s.wood && !s.plastic && c.material === "any") {
    questions.push("Any material you cannot use, or one you already have?");
  }
  return questions.slice(0, 3);
}

const SLOW_ACCESS = new Set(["inquire", "appointment", "professional", "restricted"]);

function applyLiveConstraints(route: RoutePlan, s: Signals): RoutePlan {
  const c = s.constraints;
  let suitability = route.suitability;
  let accessibility = route.accessibility;
  let difficulty = route.difficulty;
  let costScore = route.costScore;
  const risks = [...route.risks];

  if (s.immersion && route.id === "fdm") {
    suitability -= 18;
    risks.push({
      title: "Do not deploy PLA in a river",
      detail: "Immersion wants a gasketed rigid shell or a machined lid, then a dunk test with the electronics still out. A printed box is only a fit check.",
      severity: "stop",
    });
  }
  if (c.exposure === "heat" && (route.id === "fdm" || route.id === "resin")) {
    suitability -= 16;
    risks.push({
      title: "Heat softens these plastics",
      detail: "PLA and many resins deform well below boiling water. If the part sees real heat, ask the shop about a material that survives it.",
      severity: "watch",
    });
  }
  if (c.precision === "tight") {
    if (route.id === "fdm" || route.id === "laser") suitability -= 12;
    if (route.id === "cnc" || route.id === "professional") suitability += 14;
    difficulty += 6;
  }
  if (c.precision === "loose" && (route.id === "fdm" || route.id === "laser")) suitability += 6;
  if (c.stress === "structural") {
    if (route.id === "fdm" || route.id === "resin") suitability -= 18;
    if (route.id === "laser") suitability -= 8;
    if (route.id === "cnc" || route.id === "waterjet" || route.id === "professional") suitability += 12;
  }
  if (c.stress === "light" && route.id === "fdm") suitability += 6;
  if (c.time === "evening" && SLOW_ACCESS.has(route.accessTier)) {
    suitability -= 14;
    accessibility -= 16;
  }
  if (c.time === "month" && SLOW_ACCESS.has(route.accessTier)) suitability += 6;
  if (c.experience === "new" && (route.accessTier === "restricted" || route.accessTier === "professional" || route.accessTier === "inquire")) {
    difficulty += 8;
    accessibility -= 6;
  }
  if (c.budget < 50 && (route.id === "professional" || route.id === "waterjet" || route.id === "cnc")) costScore -= 18;
  if (c.budget >= 250 && (route.id === "professional" || route.id === "cnc")) costScore += 8;

  return { ...route, suitability, accessibility, difficulty, costScore, risks };
}

function asideFor(s: Signals, routes: RoutePlan[]): string | null {
  if (s.pcb && !routes.some((route) => route.id === "cleanroom")) {
    return "SEAS Cleanroom lithography was scored and left off the short list. It is a research core, not a wearable PCB service. Solder a board-house PCB at CEID instead.";
  }
  if (s.waterproof && routes[0]?.id === "laser") {
    return "CEID’s member printers are documented with PLA Basic. That is why FDM is not the lead path for a wet housing: use it to learn the shape, then seal acrylic or a machined lid.";
  }
  if (s.aero) {
    return "A desktop fan test is not a structural sign-off. Keep the rotor guarded. The 256 mm CEID build volume is a hard constraint from the FAQ.";
  }
  return null;
}

export function analyze(brief: string, constraints: Constraints): Blueprint {
  const signals = extract(brief, constraints);
  const built = [buildFdm(signals), buildLaser(signals), buildCnc(signals)];
  const c = signals.constraints;
  const hard =
    signals.metal > 0 ||
    c.material === "metal" ||
    signals.load > 0 ||
    signals.precision > 0.7 ||
    c.stress === "structural" ||
    signals.immersion > 0;
  if (hard) {
    built.push(buildWaterjet(signals), buildProfessional(signals));
  }
  if (signals.constraints.size === "handheld" && signals.load === 0 && signals.waterproof === 0 && signals.aero === 0) {
    built.push(buildResin(signals));
  }
  if (signals.pcb) {
    built.push(buildPcb(signals), buildProto(signals), buildCleanroom(signals));
  } else if (signals.electronics && !signals.enclosure) {
    built.push(buildProto(signals));
  }
  const ranked = built
    .map((route) => applyLiveConstraints(route, signals))
    .map((route) => ({
      ...route,
      suitability: clamp(route.suitability),
      costScore: clamp(route.costScore),
      accessibility: clamp(route.accessibility),
      difficulty: clamp(route.difficulty),
    }))
    .map((route) => ({ ...route, rankScore: Math.round(composite(route)) }))
    .sort((a, b) => b.rankScore - a.rankScore || b.suitability - a.suitability);
  const routes = shortlist(ranked);
  const lead = routes[0];
  return {
    title: titleFor(signals),
    summary: lead ? `${titleFor(signals)} leans ${lead.name.toLowerCase()} first. ${lead.why}` : "Add a bit more detail.",
    readout: readoutFor(signals),
    assumptions: assumptionsFor(brief, signals),
    aside: asideFor(signals, routes),
    routes,
    questions: questionsFor(brief, signals),
  };
}

export function lineCost(line: BomLine, qty: number): number | null {
  if (line.unitCost == null) return null;
  return line.unitCost * qty;
}
