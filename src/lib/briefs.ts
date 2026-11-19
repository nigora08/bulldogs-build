import type { Constraints, ExampleProject } from "@/lib/engine";

export interface BeginnerPlan extends ExampleProject {
  evening: string;
}

/** First projects: one process, new to the shop, small enough to finish. */
export const BEGINNER_PLANS: BeginnerPlan[] = [
  {
    id: "begin-nameplate",
    label: "Dorm door nameplate",
    kicker: "Flat letters",
    evening: "About one evening",
    brief:
      "A laser-cut wooden nameplate for a dorm door, with engraved letters and a hole for a hook. I am new to the shop and I have one evening. It only has to survive being bumped.",
    constraints: { budget: 20, size: "handheld", material: "wood", experience: "new", precision: "loose", stress: "light", exposure: "indoor", time: "evening" },
  },
  {
    id: "begin-hook",
    label: "Headphone hook",
    kicker: "First print",
    evening: "About one evening",
    brief:
      "A small plastic hook that holds headphones on the side of a desk. I am new to printing and I have one evening. Light load, indoor, no moving parts.",
    constraints: { budget: 15, size: "handheld", material: "plastic", experience: "new", precision: "loose", stress: "light", exposure: "indoor", time: "evening" },
  },
  {
    id: "begin-lid",
    label: "See-through demo lid",
    kicker: "Clear lid",
    evening: "About one week",
    brief:
      "A clear acrylic lid for a class demo so people can watch the setup and not touch it. Removable, a few cable holes, indoor only. I am new to the laser.",
    constraints: { budget: 40, size: "bench", material: "acrylic", experience: "new", precision: "normal", stress: "light", exposure: "indoor", time: "week" },
  },
  {
    id: "begin-visor",
    label: "Bike light visor",
    kicker: "Rain shield",
    evening: "About one week",
    brief:
      "A small clear visor that keeps rain off a bike taillight. Splash only, not a dunk. I am new to the shop and I can come back one more evening if the first cut is wrong.",
    constraints: { budget: 25, size: "handheld", material: "acrylic", experience: "new", precision: "loose", stress: "light", exposure: "splash", time: "week" },
  },
];

interface ObjectSeed {
  label: string;
  open: string;
  closer: string;
  constraints: Constraints;
}

interface PlaceSeed {
  short: string;
  phrase: string;
}

interface DemandSeed {
  sentence: string;
  patch: Partial<Constraints>;
}

const OBJECTS: ObjectSeed[] = [
  { label: "Nameplate", open: "A flat wooden nameplate with engraved letters", closer: "It only has to survive being bumped.", constraints: { budget: 25, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Headphone hook", open: "A small plastic hook for headphones", closer: "No moving parts.", constraints: { budget: 15, size: "handheld", material: "plastic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Sample tray", open: "A tray that holds six small lab samples in a row", closer: "It should wipe clean.", constraints: { budget: 30, size: "bench", material: "acrylic", experience: "new", stress: "light", precision: "normal", exposure: "indoor", time: "week" } },
  { label: "Phone stand", open: "A folding phone stand", closer: "It has to pack flat in a bag.", constraints: { budget: 20, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Cable comb", open: "A cable comb that tidies a handful of wires", closer: "Light duty, nothing structural.", constraints: { budget: 15, size: "handheld", material: "plastic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Bookend", open: "A simple bookend for a short shelf", closer: "Books, not a full case of equipment.", constraints: { budget: 30, size: "bench", material: "wood", experience: "some", stress: "moderate", precision: "loose", exposure: "indoor", time: "week" } },
  { label: "Filter frame", open: "A frame that holds a replaceable air filter", closer: "The filter itself is bought, not made.", constraints: { budget: 35, size: "bench", material: "acrylic", experience: "some", stress: "light", precision: "normal", exposure: "indoor", time: "week" } },
  { label: "Drill jig", open: "A coaster-sized jig for drilling one straight hole", closer: "The hole has to land where the hardware already is.", constraints: { budget: 20, size: "handheld", material: "wood", experience: "some", stress: "light", precision: "normal", exposure: "indoor", time: "evening" } },
  { label: "Badge shell", open: "A badge-sized shell for a coin cell and one LED", closer: "Worn on a jacket, indoor.", constraints: { budget: 40, size: "handheld", material: "plastic", experience: "some", stress: "light", precision: "normal", exposure: "indoor", time: "week" } },
  { label: "Gripper jaw", open: "A soft jaw for a small gripper", closer: "It only pinches a paper cup.", constraints: { budget: 20, size: "handheld", material: "plastic", experience: "some", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Sensor clip", open: "A clip that holds a phone-sized sensor on a clipboard", closer: "It will get splashed, not submerged.", constraints: { budget: 25, size: "handheld", material: "plastic", experience: "some", stress: "moderate", precision: "normal", exposure: "splash", time: "week" } },
  { label: "Demo cover", open: "A clear cover over a low-power optics demo", closer: "People should see the setup and not touch it.", constraints: { budget: 55, size: "bench", material: "acrylic", experience: "new", stress: "light", precision: "normal", exposure: "indoor", time: "week" } },
  { label: "Parts bin", open: "A small parts bin that stacks with a second copy", closer: "Indoor bench, light parts.", constraints: { budget: 20, size: "handheld", material: "plastic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Instrument knob", open: "A replacement knob for a bench instrument", closer: "It has to fit a shaft I already measured.", constraints: { budget: 15, size: "handheld", material: "plastic", experience: "some", stress: "light", precision: "normal", exposure: "indoor", time: "evening" } },
  { label: "Light visor", open: "A small visor that keeps rain off a taillight", closer: "Rain, not a river.", constraints: { budget: 25, size: "handheld", material: "acrylic", experience: "new", stress: "light", precision: "loose", exposure: "splash", time: "week" } },
  { label: "Plant marker", open: "A plant marker for a windowsill", closer: "It can get wet from watering.", constraints: { budget: 10, size: "handheld", material: "plastic", experience: "new", stress: "light", precision: "loose", exposure: "splash", time: "evening" } },
  { label: "Shelf lip", open: "A light plywood lip that keeps bottles from sliding off a shelf", closer: "Not a structural bracket.", constraints: { budget: 30, size: "bench", material: "wood", experience: "some", stress: "moderate", precision: "loose", exposure: "indoor", time: "week" } },
  { label: "Setlist clip", open: "A clip that holds a setlist on a music stand", closer: "It has to come off without tools.", constraints: { budget: 20, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
];

const PLACES: PlaceSeed[] = [
  { short: "Dorm door", phrase: "used on a dorm door" },
  { short: "Lab bench", phrase: "kept on a lab bench" },
  { short: "Rehearsal", phrase: "used in a rehearsal room" },
  { short: "Bike commute", phrase: "carried on a bike commute" },
  { short: "Class demo", phrase: "shown in a class demo" },
  { short: "Field kit", phrase: "packed in a field kit" },
];

const DEMANDS: DemandSeed[] = [
  { sentence: "I am new to the shop and I have one evening.", patch: { experience: "new", time: "evening" } },
  { sentence: "I can spend a week, and I have used the shop a few times.", patch: { experience: "some", time: "week" } },
  { sentence: "It has to fold flat so I can carry it.", patch: { size: "handheld", stress: "light" } },
  { sentence: "Leave a clear window so someone can see inside.", patch: { material: "acrylic" } },
  { sentence: "The holes have to line up with hardware I already own.", patch: { precision: "normal" } },
  { sentence: "It will see rain, not a dunk.", patch: { exposure: "splash" } },
];

const SPAN = OBJECTS.length * PLACES.length * DEMANDS.length;

function spanOf(mm: number): string {
  return `Keep the long side near ${mm} mm.`;
}

/** A different project for every index. Later laps change the target size so the sentence never repeats. */
export function briefAt(index: number): ExampleProject {
  const safe = Math.max(0, Math.floor(index));
  const round = Math.floor(safe / SPAN);
  const slot = (safe * 97) % SPAN;
  const object = OBJECTS[slot % OBJECTS.length];
  const place = PLACES[Math.floor(slot / OBJECTS.length) % PLACES.length];
  const demand = DEMANDS[Math.floor(slot / (OBJECTS.length * PLACES.length)) % DEMANDS.length];
  const mm = 70 + ((safe * 17) % 11) * 12;
  const brief = `${object.open}, ${place.phrase}. ${demand.sentence} ${object.closer} ${spanOf(mm)}`;
  const label = round === 0 ? object.label : `${object.label} · ${mm} mm`;
  return {
    id: `brief-${safe}`,
    label,
    kicker: place.short,
    brief,
    constraints: { ...object.constraints, ...demand.patch },
  };
}

export function takeBriefs(start: number, count: number): ExampleProject[] {
  return Array.from({ length: count }, (_, offset) => briefAt(start + offset));
}

const BEGINNER_OBJECTS: ObjectSeed[] = [
  { label: "Door tag", open: "A small wooden door tag with a name and one hanging hole", closer: "Letters can be engraved, not cut through.", constraints: { budget: 15, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Cable clip", open: "A plastic clip that holds one cable to a desk leg", closer: "It snaps on. No screws into the desk.", constraints: { budget: 12, size: "handheld", material: "plastic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Coaster", open: "A square wooden coaster with an engraved mark", closer: "It only has to survive a cold drink.", constraints: { budget: 10, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Bookmark", open: "A thin wooden bookmark with a corner cut", closer: "It lives in a paperback.", constraints: { budget: 8, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Key tag", open: "A small acrylic key tag with a split-ring hole", closer: "The hole has to clear a real ring.", constraints: { budget: 12, size: "handheld", material: "acrylic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Plant stake", open: "A flat stake that marks one windowsill plant", closer: "It can get wet from watering.", constraints: { budget: 10, size: "handheld", material: "acrylic", experience: "new", stress: "light", precision: "loose", exposure: "splash", time: "evening" } },
  { label: "Card stand", open: "A folded card stand for one index card", closer: "Two flats from one sheet.", constraints: { budget: 15, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Lid sketch", open: "A clear lid blank with four corner holes and a window mark", closer: "The window is drawn first, cut later if you still want it.", constraints: { budget: 30, size: "bench", material: "acrylic", experience: "new", stress: "light", precision: "normal", exposure: "indoor", time: "week" } },
  { label: "Sample tray", open: "A shallow tray for six small parts", closer: "Walls can be a second cut.", constraints: { budget: 25, size: "bench", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "week" } },
  { label: "Phone wedge", open: "A wooden wedge that holds a phone at a reading angle", closer: "No moving hinge on the first version.", constraints: { budget: 18, size: "handheld", material: "wood", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Badge plate", open: "A badge-sized plate for a pin back", closer: "The pin is bought, not made.", constraints: { budget: 15, size: "handheld", material: "acrylic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
  { label: "Cord wrap", open: "A flat wrap that keeps a charger cord in a loop", closer: "Light duty, indoor.", constraints: { budget: 10, size: "handheld", material: "plastic", experience: "new", stress: "light", precision: "loose", exposure: "indoor", time: "evening" } },
];

const BEGINNER_PLACES: PlaceSeed[] = [
  { short: "Dorm", phrase: "for a dorm room" },
  { short: "Desk", phrase: "for a desk you already have" },
  { short: "Window", phrase: "for a windowsill" },
  { short: "Bag", phrase: "to drop in a bag" },
  { short: "Lab", phrase: "for the edge of a lab bench" },
  { short: "Club", phrase: "for a club table" },
];

const BEGINNER_SPAN = BEGINNER_OBJECTS.length * BEGINNER_PLACES.length;

/** A new first-build every index. Later laps change the size so the sentence does not repeat. */
export function beginnerAt(index: number): BeginnerPlan {
  const safe = Math.max(0, Math.floor(index));
  const round = Math.floor(safe / BEGINNER_SPAN);
  const slot = (safe * 5) % BEGINNER_SPAN;
  const object = BEGINNER_OBJECTS[slot % BEGINNER_OBJECTS.length];
  const place = BEGINNER_PLACES[Math.floor(slot / BEGINNER_OBJECTS.length) % BEGINNER_PLACES.length];
  const mm = 60 + ((safe * 13) % 9) * 10;
  const label = round === 0 ? object.label : `${object.label} · ${mm} mm`;
  return {
    id: `beginner-${safe}`,
    label,
    kicker: place.short,
    evening: object.constraints.time === "week" ? "About one week" : "About one evening",
    brief: `${object.open}, ${place.phrase}. I am new to the shop. ${object.closer} ${spanOf(mm)}`,
    constraints: { ...object.constraints },
  };
}

export function takeBeginner(start: number, count: number): BeginnerPlan[] {
  return Array.from({ length: count }, (_, offset) => beginnerAt(start + offset));
}
