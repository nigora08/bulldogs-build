export interface OpenProcess {
  id: string;
  name: string;
  fit: string;
  watch: string;
  ask: string;
}

export const OPEN_PROCESSES: OpenProcess[] = [
  {
    id: "fdm",
    name: "FDM printer",
    fit: "Form studies, clips, jigs, and plastic that does not have to seal or carry a real load.",
    watch: "Layer lines leak and crack. Ask the build volume before you finish the model. PLA softens in a warm car.",
    ask: "Which filament is actually on the shelf, and is there an induction before the first job?",
  },
  {
    id: "laser",
    name: "CO2 laser cutter",
    fit: "Flat parts: plywood, cardboard, cast acrylic, and light mechanisms you can bolt together.",
    watch: "Kerf changes every hole. Never cut PVC. Cast acrylic and extruded acrylic do not behave the same.",
    ask: "What sheet thickness is allowed, and do you need a training course before you book?",
  },
  {
    id: "resin",
    name: "Resin printer",
    fit: "Small, detailed parts that stay indoors and do not see heat or a structural load.",
    watch: "Uncured resin is a skin and eye hazard. The wash and cure station matters as much as the printer.",
    ask: "Where do you dispose of solvent, and are you allowed to run a job unsupervised?",
  },
  {
    id: "cnc",
    name: "CNC mill",
    fit: "Plates, pockets, and parts whose holes have to line up. The right answer when plastic is too soft.",
    watch: "Workholding and tool stickout decide whether the part is possible. A drawing with units is the ticket in.",
    ask: "Student-run or staff-run? What stock can you bring, and what file format do they want?",
  },
  {
    id: "waterjet",
    name: "Waterjet or send-out plate",
    fit: "Flat metal or thick sheet when a laser cannot cut it and a mill would take all night.",
    watch: "Edge taper and a piercing hole are part of the design. Leave stock to clamp.",
    ask: "Is there a student rate, or should this be a board-house style outside order?",
  },
  {
    id: "professional",
    name: "Staff machine shop",
    fit: "Round parts, tight fits, and anything you should not learn on a live tool the week it is due.",
    watch: "They will change your design. Bring the function, the load, and the fits that actually matter.",
    ask: "How far ahead is the queue, and will they supply the stock?",
  },
  {
    id: "pcb",
    name: "Board house plus a solder bench",
    fit: "A real circuit. Order the board. Prototype the schematic on a module while the panels are in transit.",
    watch: "A campus cleanroom is not a wearable PCB service. Budget a week, not an evening.",
    ask: "Where are you allowed to solder, and do you have flux, a iron, and a way to inspect joints?",
  },
  {
    id: "proto",
    name: "Modules and hand tools",
    fit: "Prove the behavior before you spend a process on a pretty shell.",
    watch: "A protoboard is larger and less reliable than the final board. Do not demo it as the product.",
    ask: "Which tools can you check out tonight, and which stay in the shop?",
  },
];
