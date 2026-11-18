import { EQUIPMENT } from "@/data/equipment";
import { plainify } from "@/lib/plain";

export function localExplain(quote: string, question: string, context: string): string {
  const blob = `${quote} ${question}`.toLowerCase();
  const gear = EQUIPMENT.filter((item) => {
    const name = item.name.toLowerCase();
    if (blob.includes(name)) return true;
    return name.split(/\s+/).some((word) => word.length > 5 && blob.includes(word.toLowerCase()));
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

  if (/waterproof|gasket|seal|dunk|splash/.test(blob)) {
    return "A seal is a design goal, not a result. The plan uses a rubber strip, screws, and a cable fitting in clear sheet plastic, then a leak test with the electronics still out. Ordinary printer plastic soaks up water, so a plastic print is only a rehearsal of the shape. Nothing here promises the box is waterproof.";
  }
  if (/cleanroom|lithograph|photolith/.test(blob)) {
    return "The SEAS clean room is a research lab for patterning chips with light, etch, and metal evaporation. It is not a walk-up place to make a student circuit board. Order the board from a factory and solder it at the CEID benches.";
  }
  if (/train|orientation|workday|membership/.test(blob)) {
    return "CEID membership starts with a general orientation. The lasers need an online safety course and then an in-person session. The 3D printers do not require a class once you are a member. The machine shop is not walk-up: you ask. Wright Lab’s teaching shop wants an Environmental Health and Safety orientation plus a skills check. Architecture school machines are for architecture students.";
  }
  if (/pla|bambu|3d print|printer/.test(blob)) {
    return "CEID’s member printers are Bambu machines that the FAQ lists as running ordinary PLA plastic, up to a 256 mm cube. That is fine for a shape check. It is a weak water barrier and a weak structural part. Optional help sessions exist; a required class does not.";
  }
  if (/laser|acrylic|kerf|illustrator/.test(blob)) {
    return "CEID’s lasers cut flat wood, acrylic, paper, cardboard, mat board, cork, and genuine leather, up to half an inch thick. Files are prepared in Illustrator. You need the online safety course and an in-person session. Term-time hours on the FAQ are Monday–Thursday evenings, and they change. Metal is not on that list.";
  }
  if (/budget|cost|price|\$/.test(blob)) {
    return "Dollar figures are ordinary shop-around estimates, not CEID prices. The CEID store sells stock during staffed hours by credit card and does not take university purchasing cards. Their price list was not on the public page.";
  }
  if (/restrict|appointment|architecture|ysoa|gibbs|wright/.test(blob)) {
    return "Not every Yale student can walk into every shop. Architecture equipment is for architecture students. The Wright Lab prototyping center is for researchers by appointment, and the building is mid-move. Gibbs is a professional machine shop: they cut the part, you do not run the machine. If a door is closed, the plan names a CEID fallback.";
  }

  const simplified = plainify(quote);
  if (question) {
    return `About “${clip(quote)}”: ${simplified === quote ? quote : simplified} ${clip(context, 320)} This stays a planning note. Confirm access and safety with the shop, and do not treat it as proof the part is strong or waterproof.`;
  }
  return simplified === quote
    ? `${clip(quote, 280)} In this plan, that line is either a shop rule from a public Yale page or a general fabrication warning. It is not a live booking, and it is not a safety certification.`
    : `${simplified} The original line was more technical. It is still a planning note, not a promise that a machine is free or that a part is safe.`;
}

function clip(text: string, max = 180): string {
  const clean = text.replace(/\s+/g, " ").trim();
  if (clean.length <= max) return clean;
  return `${clean.slice(0, max - 1)}…`;
}
