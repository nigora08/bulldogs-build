import { DEFAULT_CONSTRAINTS, extract } from "@/lib/engine";

const SWAPS: [RegExp, string][] = [
  [/Advanced Prototyping Center/g, "Wright Lab prototyping shop"],
  [/photolithography/gi, "circuit patterning in a clean room"],
  [/filament 3D printing/gi, "plastic-strand printing"],
  [/FDM/g, "plastic-strand printing"],
  [/PLA Basic/g, "ordinary printer plastic"],
  [/PLA/g, "ordinary printer plastic"],
  [/cast acrylic/gi, "clear sheet plastic"],
  [/acrylic/gi, "clear sheet plastic"],
  [/gasketed/gi, "sealed with a rubber strip"],
  [/gasket/gi, "rubber seal"],
  [/O-ring/gi, "round rubber seal"],
  [/kerf/gi, "the slit the laser burns away"],
  [/waterjet/gi, "high-pressure water cutter"],
  [/clamshell/gi, "two-piece box"],
  [/Gerbers/g, "factory files for a circuit board"],
  [/gerbers/g, "factory files for a circuit board"],
  [/2-layer/g, "simple two-sided"],
  [/Arduino-class/g, "small hobby"],
  [/Arduino/g, "small circuit board"],
  [/servo/gi, "small motor"],
  [/CNC/g, "computer-controlled cutter"],
  [/CAM\b/g, "cutting instructions"],
  [/IP rating/g, "official water-resistance score"],
  [/press fit/gi, "a joint held by tightness"],
  [/build volume/gi, "largest size the printer can make"],
  [/membership/gi, "signing up"],
  [/Availability not verified/g, "Nobody has checked if it is free tonight"],
];

export function plainify(text: string): string {
  return SWAPS.reduce((current, [pattern, next]) => current.replace(pattern, next), text);
}

export function simplifyBrief(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  const signals = extract(trimmed, DEFAULT_CONSTRAINTS);
  if (signals.waterproof && signals.electronics) {
    return "I want a box for a small electronic sensor that can get splashed or briefly dunked. It needs a window and a sealed hole for a cable. A drawing alone does not prove it keeps water out.";
  }
  if (signals.pcb && signals.wearable) {
    return "I want a small circuit board I can wear on my wrist, with a battery and sensors. I need a place to solder it. A research clean room is probably the wrong shop.";
  }
  if (signals.pcb) {
    return "I want a custom circuit board. I will have it made off campus and solder it at Yale.";
  }
  if (signals.linkage && (signals.laserIntent || signals.load)) {
    return "I want a small robot arm made mostly of flat pieces a laser can cut, held together with bolts and a few small motors. It only lifts something light.";
  }
  if (signals.aero) {
    return "I want a small desktop wind-turbine model so I can compare blade shapes. It is a test model, not a fast spinning machine.";
  }
  if ((signals.acrylic || signals.optical) && signals.enclosure) {
    return "I want a clear plastic box for a classroom demo, so people can see inside, with a lid that comes off.";
  }
  if (signals.metal || signals.load) {
    return "I need a strong part, likely metal, that has to hold a load. I need the shop that can actually cut that, not a plastic printer.";
  }
  return plainify(trimmed);
}
