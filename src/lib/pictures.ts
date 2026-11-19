export interface ShopPicture {
  src: string;
  alt: string;
}

function shot(file: string, alt: string): ShopPicture {
  return { src: `/shop/${file}`, alt };
}

/** A catalog photo for a project sentence. The same words always pick the same picture. */
export function pictureForBrief(text: string): ShopPicture {
  const brief = text.toLowerCase();
  if (/nameplate|letters|bookmark|coaster|badge|door tag|key tag/.test(brief)) return shot("nameplate.jpg", "A wooden nameplate");
  if (/visor|taillight|rain shield/.test(brief)) return shot("visor.jpg", "A clear rain visor over a bike light");
  if (/lid|cover|window/.test(brief)) return shot("lid.jpg", "A clear acrylic lid");
  if (/tray|bin|shelf/.test(brief)) return shot("tray.jpg", "A wooden parts tray");
  if (/stand|wedge|knob/.test(brief)) return shot("stand.jpg", "A small wooden stand");
  if (/clip|comb|stake|wrap/.test(brief)) return shot("clip.jpg", "A small cable clip");
  if (/\b(hook|hanger)\b/.test(brief)) return shot("hook.jpg", "A printed headphone hook");
  if (/box|enclos|housing|sensor|gasket|waterproof/.test(brief)) return shot("box.jpg", "A small sealed box");
  if (/laser/.test(brief)) return shot("laser.jpg", "A laser cutter");
  if (/print|fdm|pla|plastic/.test(brief)) return shot("printer.jpg", "A desktop 3D printer");
  if (/mill|cnc|metal|aluminum/.test(brief)) return shot("mill.jpg", "A benchtop mill");
  if (/sew|strap|textile/.test(brief)) return shot("sew.jpg", "Thread and a canvas strap");
  if (/circuit|pcb|board|led/.test(brief)) return shot("electronics.jpg", "An electronics bench");
  return shot("hand.jpg", "Calipers and a file");
}

/** A catalog photo for a shop process. */
export function pictureForProcess(processId: string): ShopPicture {
  const pictures: Record<string, ShopPicture> = {
    fdm: shot("printer.jpg", "A desktop 3D printer"),
    resin: shot("printer.jpg", "A desktop printer"),
    laser: shot("laser.jpg", "A laser cutter"),
    vinyl: shot("laser.jpg", "A flat cutting machine"),
    wood: shot("laser.jpg", "A wood shop"),
    cnc: shot("mill.jpg", "A benchtop mill"),
    lathe: shot("mill.jpg", "A metalworking machine"),
    waterjet: shot("metal.jpg", "A cut aluminum plate"),
    welding: shot("metal.jpg", "A metal part"),
    professional: shot("mill.jpg", "A machine shop"),
    pcb: shot("electronics.jpg", "An electronics bench"),
    proto: shot("hand.jpg", "Calipers and a file"),
    electronics: shot("electronics.jpg", "An electronics bench"),
    lithography: shot("electronics.jpg", "A clean bench"),
    sewing: shot("sew.jpg", "Thread and a canvas strap"),
    hand: shot("hand.jpg", "Calipers and a file"),
    store: shot("tray.jpg", "A parts tray"),
  };
  return pictures[processId] ?? shot("hand.jpg", "Shop tools");
}
