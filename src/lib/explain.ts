import { EQUIPMENT } from "@/data/equipment";
import { plainify } from "@/lib/plain";

function mentions(blob: string, pattern: RegExp): boolean {
  return pattern.test(blob);
}

const SEAL = /\b(?:waterproof|gasket|sealed|sealing|seal|dunk|splash)\b/i;
const CLEANROOM = /\b(?:cleanroom|clean room|lithograph\w*|photolith\w*)\b/i;
const TRAINING = /\b(?:training|orientation|workday|membership)\b/i;
const PRINTER = /\b(?:pla|bambu|3d[\s-]?print\w*|printers?)\b/i;
const LASER = /\b(?:laser|acrylic|kerf|illustrator)\b/i;
const MONEY = /\b(?:budget|cost|price)\b|\$/i;
const ACCESS = /\b(?:restricted|appointment|architecture|ysoa|gibbs|wright)\b/i;

export function localExplain(quote: string, question: string, context: string, campus: "open" | "yale" = "open"): string {
  const blob = `${quote} ${question}`;
  const haystack = blob.toLowerCase();
  const yale = campus === "yale";
  const gear = EQUIPMENT.filter((item) => {
    const name = item.name.toLowerCase();
    if (haystack.includes(name)) return true;
    return name.split(/\s+/).some((word) => word.length > 5 && haystack.includes(word));
  }).slice(0, 2);

  if (gear.length) {
    const item = gear[0];
    const lead = question
      ? `On “${clip(quote)}”: ${item.name} is at ${item.facility}.`
      : `${item.name} is at ${item.facility}.`;
    return [
      lead,
      item.capabilities,
      `Training: ${item.training}`,
      `Who can use it: ${item.eligibility}`,
      item.alternativeNote ? `If you cannot get in: ${item.alternativeNote}` : "",
      "Availability is not verified, and this does not certify a design as safe.",
    ]
      .filter(Boolean)
      .join(" ");
  }

  if (mentions(blob, SEAL)) {
    return "A seal is a design goal, not a result. Use a rubber strip, screws, and a cable fitting, then leak-test with the electronics still out. Ordinary printer plastic soaks up water, so a plastic print is only a rehearsal of the shape. Nothing here promises the box is waterproof.";
  }
  if (mentions(blob, CLEANROOM)) {
    return yale
      ? "The SEAS clean room is a research lab for patterning chips with light, etch, and metal evaporation. It is not a walk-up place to make a student circuit board. Order the board from a factory and solder it at the CEID benches."
      : "A clean room is for patterning chips, not a walk-up place to make a student circuit board. Order the board from a factory and solder it in a general electronics shop.";
  }
  if (mentions(blob, TRAINING)) {
    return yale
      ? "CEID membership starts with a general orientation. The lasers need an online safety course and then an in-person session. The 3D printers do not require a class once you are a member. The machine shop is not walk-up: you ask. Wright Lab’s teaching shop wants an Environmental Health and Safety orientation plus a skills check. Architecture school machines are for architecture students."
      : "Ask your shop which machines need a class. Membership often does not cover the laser or the mill. Do not start a machine the shop has not cleared you on.";
  }
  if (mentions(blob, PRINTER)) {
    return yale
      ? "CEID’s member printers are Bambu machines that the FAQ lists as running ordinary PLA plastic, up to a 256 mm cube. That is fine for a shape check. It is a weak water barrier and a weak structural part. Optional help sessions exist; a required class does not."
      : "Ordinary printer plastic is for a shape check. It is a weak water barrier and a weak structural part. Confirm the material list and the bed size with your shop before you treat a print as the final part.";
  }
  if (mentions(blob, LASER)) {
    return yale
      ? "CEID’s lasers cut flat wood, acrylic, paper, cardboard, mat board, cork, and genuine leather, up to half an inch thick. Files are prepared in Illustrator. You need the online safety course and an in-person session. Term-time hours on the FAQ are Monday–Thursday evenings, and they change. Metal is not on that list."
      : "A laser cuts the flat stock your shop allows. Confirm thickness, materials, and whether you need a training session. Metal is often not allowed.";
  }
  if (mentions(blob, MONEY)) {
    return yale
      ? "Dollar figures are ordinary shop-around estimates, not CEID prices. The CEID store sells stock during staffed hours by credit card and does not take university purchasing cards. Their price list was not on the public page."
      : "Dollar figures are ordinary shop-around estimates, not your lab’s prices. Ask the shop what they stock and what you have to buy.";
  }
  if (mentions(blob, ACCESS)) {
    return yale
      ? "Not every Yale student can walk into every shop. Architecture equipment is for architecture students. The Wright Lab prototyping center is for researchers by appointment, and the building is mid-move. Gibbs is a professional machine shop: they cut the part, you do not run the machine. If a door is closed, the plan names a CEID fallback."
      : "Not every student can use every machine. If a door is closed, ask the shop what the walk-up fallback is before you redesign the part.";
  }

  const simplified = plainify(quote);
  if (question) {
    return `About “${clip(quote)}”: ${simplified === quote ? quote : simplified} ${clip(context, 320)} This stays a planning note. Confirm access and safety with the shop, and do not treat it as proof the part is strong or waterproof.`;
  }
  const yaleNote = yale
    ? "In this plan, that line is either a shop rule from a public Yale page or a general fabrication warning."
    : "In this plan, that line is a fabrication note for a shop this desk does not know by name.";
  return simplified === quote
    ? `${clip(quote, 280)} ${yaleNote} It is not a live booking, and it is not a safety certification.`
    : `${simplified} The original line was more technical. It is still a planning note, not a promise that a machine is free or that a part is safe.`;
}

function clip(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}
