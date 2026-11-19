import { briefAt } from "./briefs.ts";
import type { ExampleProject } from "./engine.ts";

export interface Suggestion extends ExampleProject {
  hook: string;
}

export const SUGGESTIONS: Suggestion[] = [
  {
    id: "bike-light",
    label: "Rainy ride to Science Hill",
    kicker: "Splash",
    hook: "A light you can actually leave on the bike when it rains.",
    brief:
      "A splash-proof housing for a bike taillight I ride to Science Hill. It needs a clear lens, a sealed battery door, and it should survive rain, not a dunk in the river.",
    constraints: { budget: 40, size: "handheld", material: "acrylic", experience: "new", exposure: "splash", stress: "light", precision: "normal", time: "week" },
  },
  {
    id: "crew-clip",
    label: "Seat clip for a rowing sensor",
    kicker: "Crew",
    hook: "A small clip that stays put when the boat flexes.",
    brief:
      "A small plastic clip that holds a phone-sized sensor on a rowing seat. Light load, it must not crack, and it will get splashed.",
    constraints: { budget: 30, size: "handheld", material: "plastic", experience: "some", exposure: "splash", stress: "moderate", precision: "normal", time: "evening" },
  },
  {
    id: "setlist",
    label: "A cappella setlist stand",
    kicker: "Laser",
    hook: "Flat parts you can cut in one evening and bolt together.",
    brief:
      "Laser-cut wooden setlist stand for an a cappella rehearsal. Flat parts, a slot for a phone, and it has to fold so I can carry it.",
    constraints: { budget: 35, size: "bench", material: "wood", experience: "new", exposure: "indoor", stress: "light", precision: "loose", time: "evening" },
  },
  {
    id: "pin",
    label: "Club pin that lights up",
    kicker: "Wearable",
    hook: "A tiny board and a shell you can wear on a jacket.",
    brief:
      "Custom PCB for a wearable club pin: a coin cell, one LED, about the size of a bottle cap, worn on a jacket.",
    constraints: { budget: 45, size: "handheld", material: "any", experience: "some", exposure: "indoor", stress: "light", precision: "normal", time: "week" },
  },
  {
    id: "optics-box",
    label: "See-through optics demo",
    kicker: "Class",
    hook: "A clear box so a section can watch the setup and not touch it.",
    brief:
      "Acrylic housing for a physics demo: a clear box with a removable lid so a class can see an optics setup, plus cable holes.",
    constraints: { budget: 70, size: "bench", material: "acrylic", experience: "new", exposure: "indoor", stress: "light", precision: "normal", time: "week" },
  },
  {
    id: "shelf",
    label: "Dorm shelf that will not sag",
    kicker: "Metal",
    hook: "A real bracket, not a plastic lookalike, for a loaded shelf.",
    brief:
      "Load-bearing steel bracket for a dorm shelf full of books. The holes have to line up, and it has to hold weight.",
    constraints: { budget: 160, size: "bench", material: "metal", experience: "trained", exposure: "indoor", stress: "structural", precision: "tight", time: "month" },
  },
  {
    id: "page",
    label: "Music-stand page turner",
    kicker: "Linkages",
    hook: "Four flat links and a hobby servo. A weekend mechanism.",
    brief:
      "Laser-cut page turner for a music stand: four linkages, one hobby servo, light payload, mostly flat parts I can bolt together.",
    constraints: { budget: 55, size: "bench", material: "wood", experience: "some", exposure: "indoor", stress: "light", precision: "normal", time: "week" },
  },
  {
    id: "iron-rest",
    label: "Stand that survives a hot iron",
    kicker: "Heat",
    hook: "Something that will not melt if a soldering iron leans on it.",
    brief:
      "A rest for a hot soldering iron on the electronics bench. It sees real heat, so printed plastic is the wrong material.",
    constraints: { budget: 40, size: "handheld", material: "metal", experience: "some", exposure: "heat", stress: "light", precision: "loose", time: "week" },
  },
  {
    id: "river-sonde",
    label: "Sensor that goes in a river",
    kicker: "Immersion",
    hook: "The hard one: a seal you can test before the electronics go in.",
    brief:
      "Waterproof enclosure for an environmental sensor that will sit in a river. Cable exit, clear window, and it has to survive immersion, not just rain.",
    constraints: { budget: 100, size: "handheld", material: "acrylic", experience: "some", exposure: "immersion", stress: "moderate", precision: "normal", time: "month" },
  },
  {
    id: "fan-blades",
    label: "Desktop fan-blade study",
    kicker: "Aero",
    hook: "Compare three blade shapes in a guarded fan stream. A model, not a turbine.",
    brief:
      "3D-printed wind turbine prototype, desktop scale, to compare blade shapes in a fan stream. It is a model, not a rooftop generator.",
    constraints: { budget: 25, size: "bench", material: "plastic", experience: "some", exposure: "indoor", stress: "light", precision: "loose", time: "evening" },
  },
];

export function pickSuggestion(cursor: number, currentBrief: string): Suggestion {
  const start = Math.max(0, cursor);
  for (let step = 0; step < 24; step += 1) {
    const idea = briefAt(start + step);
    if (idea.brief !== currentBrief) return { ...idea, hook: idea.kicker };
  }
  const idea = briefAt(start);
  return { ...idea, hook: idea.kicker };
}
