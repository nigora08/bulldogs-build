import type { Constraints } from "@/lib/engine";

export interface DrawPrim {
  layer: "cut" | "mark";
  kind: "line" | "rect" | "circle";
  x: number;
  y: number;
  x2?: number;
  y2?: number;
  w?: number;
  h?: number;
  r?: number;
}

export interface ShopDrawing {
  title: string;
  width: number;
  height: number;
  material: string;
  note: string;
  prims: DrawPrim[];
}

function hashText(text: string): number {
  let hash = 2166136261;
  for (const char of text) hash = Math.imul(hash ^ char.charCodeAt(0), 16777619);
  return hash >>> 0;
}

function envelope(size: Constraints["size"], hash: number): { w: number; h: number } {
  const long = size === "handheld" ? 84 + (hash % 5) * 12 : size === "large" ? 340 + (hash % 4) * 30 : 168 + (hash % 5) * 22;
  const ratio = 0.52 + ((hash >>> 5) % 4) * 0.08;
  return { w: long, h: Math.max(48, Math.round(long * ratio)) };
}

function materialCallout(material: Constraints["material"]): string {
  if (material === "wood") return "6 mm plywood";
  if (material === "acrylic") return "4.5 mm cast acrylic";
  if (material === "plastic") return "3 mm plastic sheet, or a printed blank";
  if (material === "metal") return "3 mm aluminum. A machine or waterjet, not a CO2 laser.";
  return "Sheet stock the shop will actually cut";
}

function rect(x: number, y: number, w: number, h: number, layer: DrawPrim["layer"] = "cut"): DrawPrim {
  return { kind: "rect", layer, x, y, w, h };
}

function circle(x: number, y: number, r: number, layer: DrawPrim["layer"] = "cut"): DrawPrim {
  return { kind: "circle", layer, x, y, r };
}

function line(x: number, y: number, x2: number, y2: number, layer: DrawPrim["layer"] = "mark"): DrawPrim {
  return { kind: "line", layer, x, y, x2, y2 };
}

function kindOf(brief: string): "hook" | "visor" | "plate" | "lid" | "tray" | "clip" | "stand" | "box" {
  const text = brief.toLowerCase();
  if (/nameplate|letters|bookmark|coaster|badge|door tag|key tag/.test(text)) return "plate";
  if (/visor|rain shield|taillight/.test(text)) return "visor";
  if (/lid|cover|window/.test(text)) return "lid";
  if (/tray|bin|shelf/.test(text)) return "tray";
  if (/stand|wedge|knob/.test(text)) return "stand";
  if (/clip|comb|stake|wrap/.test(text)) return "clip";
  if (/\b(hook|hanger)\b/.test(text)) return "hook";
  if (/box|enclos|housing|sensor|gasket|waterproof/.test(text)) return "box";
  return "plate";
}

function shape(kind: ReturnType<typeof kindOf>, w: number, h: number): { prims: DrawPrim[]; note: string } {
  const hole = 2.6;
  if (kind === "hook") {
    const back = Math.round(w * 0.34);
    return {
      note: "The back plate mounts to a desk edge. The throat is the opening the headphones pass through.",
      prims: [
        rect(0, 0, back, h),
        rect(back, Math.round(h * 0.62), w - back, Math.round(h * 0.38)),
        circle(back / 2, h * 0.22, hole),
        circle(back / 2, h * 0.78, hole),
        line(back, Math.round(h * 0.62), back, 0),
      ],
    };
  }
  if (kind === "visor") {
    return {
      note: "A flat shield. Bend or space it off the light after the cut. The two holes are for a zip tie or a screw.",
      prims: [
        rect(0, Math.round(h * 0.18), w, Math.round(h * 0.64)),
        circle(12, h / 2, hole),
        circle(w - 12, h / 2, hole),
        rect(w * 0.22, h * 0.34, w * 0.56, h * 0.28, "mark"),
      ],
    };
  }
  if (kind === "lid") {
    const inset = 10;
    return {
      note: "Outer line is the cut. The inner rectangle is a window to leave or to engrave, not a second cut, until you decide.",
      prims: [
        rect(0, 0, w, h),
        rect(inset, inset, w - inset * 2, h - inset * 2, "mark"),
        circle(8, 8, hole),
        circle(w - 8, 8, hole),
        circle(8, h - 8, hole),
        circle(w - 8, h - 8, hole),
      ],
    };
  }
  if (kind === "tray") {
    const wall = 8;
    return {
      note: "One flat. Fold or slot the walls if you cut them as separate strips. The center line is a divider, drawn, not cut.",
      prims: [
        rect(0, 0, w, h),
        rect(wall, wall, w - wall * 2, h - wall * 2, "mark"),
        line(w / 2, wall, w / 2, h - wall),
      ],
    };
  }
  if (kind === "clip") {
    return {
      note: "A flat clip. The slot is a cut. Test it in cardboard before the real sheet.",
      prims: [
        rect(0, 0, w, h),
        rect(w * 0.18, h * 0.38, w * 0.64, Math.max(6, h * 0.16)),
        circle(w * 0.12, h / 2, hole),
      ],
    };
  }
  if (kind === "stand") {
    return {
      note: "Two flats from one sheet: a foot and a back. The dashed line is where you separate them.",
      prims: [
        rect(0, 0, w, h),
        line(0, h * 0.42, w, h * 0.42),
        rect(w * 0.3, h * 0.55, w * 0.4, h * 0.12),
        circle(w * 0.2, h * 0.18, hole),
        circle(w * 0.8, h * 0.18, hole),
      ],
    };
  }
  if (kind === "box") {
    return {
      note: "A lid blank. Four corner holes, a cable hole, and a window to engrave or to cut once the seal plan is real.",
      prims: [
        rect(0, 0, w, h),
        circle(8, 8, hole),
        circle(w - 8, 8, hole),
        circle(8, h - 8, hole),
        circle(w - 8, h - 8, hole),
        circle(w * 0.78, h * 0.5, 6),
        rect(w * 0.16, h * 0.22, w * 0.42, h * 0.5, "mark"),
      ],
    };
  }
  return {
    note: "A flat plate with a hanging hole and an engraved label band. Change the letters after you measure the door or the face.",
    prims: [
      rect(0, 0, w, h),
      circle(w / 2, h - 8, 3),
      rect(10, h * 0.28, w - 20, h * 0.38, "mark"),
    ],
  };
}

/** A starting shop drawing for this brief. Same brief, same drawing. It is a suggestion, not a finished file. */
export function suggestDrawing(brief: string, constraints: Constraints, title = "Suggested part"): ShopDrawing {
  const hash = hashText(`${brief}|${constraints.size}|${constraints.material}`);
  const box = envelope(constraints.size, hash);
  const drawn = shape(kindOf(brief), box.w, box.h);
  return {
    title: title.replace(/\s+/g, " ").trim().slice(0, 80) || "Suggested part",
    width: box.w,
    height: box.h,
    material: materialCallout(constraints.material),
    note: drawn.note,
    prims: drawn.prims,
  };
}

function xml(text: string): string {
  return text.replace(/[&<>"]/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char] ?? char);
}

export function drawingSvg(drawing: ShopDrawing): string {
  const pad = 28;
  const width = drawing.width + pad * 2;
  const height = drawing.height + pad * 2 + 18;
  const y = (value: number) => pad + drawing.height - value;
  const parts = drawing.prims.map((prim) => {
    const stroke = prim.layer === "cut" ? "#142033" : "#8a6a2f";
    const dash = prim.layer === "mark" ? ' stroke-dasharray="3 2"' : "";
    if (prim.kind === "line") {
      return `<line x1="${pad + prim.x}" y1="${y(prim.y)}" x2="${pad + (prim.x2 ?? prim.x)}" y2="${y(prim.y2 ?? prim.y)}" fill="none" stroke="${stroke}" stroke-width="0.6"${dash}/>`;
    }
    if (prim.kind === "circle") {
      return `<circle cx="${pad + prim.x}" cy="${y(prim.y)}" r="${prim.r ?? 1}" fill="none" stroke="${stroke}" stroke-width="0.6"${dash}/>`;
    }
    return `<rect x="${pad + prim.x}" y="${y(prim.y + (prim.h ?? 0))}" width="${prim.w ?? 0}" height="${prim.h ?? 0}" fill="none" stroke="${stroke}" stroke-width="0.7"${dash}/>`;
  });
  const dimY = y(0) + 14;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}mm" height="${height}mm">
  <rect width="100%" height="100%" fill="#f4f0e8"/>
  <g>${parts.join("")}</g>
  <text x="${pad}" y="12" fill="#0c7c78" font-family="ui-monospace, monospace" font-size="4">${xml(drawing.title)} · ${xml(drawing.material)}</text>
  <text x="${pad}" y="${dimY}" fill="#8a6a2f" font-family="ui-monospace, monospace" font-size="3.5">${drawing.width} mm</text>
  <text x="${pad + drawing.width + 4}" y="${y(drawing.height / 2)}" fill="#8a6a2f" font-family="ui-monospace, monospace" font-size="3.5">${drawing.height} mm</text>
</svg>`;
}

function dxfPair(code: number, value: string | number): string {
  return `${code}\n${value}\n`;
}

export function drawingDxf(drawing: ShopDrawing): string {
  const entities: string[] = [];
  for (const prim of drawing.prims) {
    const layer = prim.layer === "cut" ? "CUT" : "MARK";
    if (prim.kind === "line") {
      entities.push(
        dxfPair(0, "LINE") + dxfPair(8, layer) + dxfPair(10, prim.x) + dxfPair(20, prim.y) + dxfPair(11, prim.x2 ?? prim.x) + dxfPair(21, prim.y2 ?? prim.y),
      );
    } else if (prim.kind === "circle") {
      entities.push(dxfPair(0, "CIRCLE") + dxfPair(8, layer) + dxfPair(10, prim.x) + dxfPair(20, prim.y) + dxfPair(40, prim.r ?? 1));
    } else {
      const w = prim.w ?? 0;
      const h = prim.h ?? 0;
      const corners = [
        [prim.x, prim.y, prim.x + w, prim.y],
        [prim.x + w, prim.y, prim.x + w, prim.y + h],
        [prim.x + w, prim.y + h, prim.x, prim.y + h],
        [prim.x, prim.y + h, prim.x, prim.y],
      ];
      for (const [x1, y1, x2, y2] of corners) {
        entities.push(dxfPair(0, "LINE") + dxfPair(8, layer) + dxfPair(10, x1) + dxfPair(20, y1) + dxfPair(11, x2) + dxfPair(21, y2));
      }
    }
  }
  entities.push(dxfPair(0, "TEXT") + dxfPair(8, "NOTE") + dxfPair(10, 0) + dxfPair(20, -8) + dxfPair(40, 3) + dxfPair(1, `${drawing.title} | ${drawing.material} | mm`));
  return `0\nSECTION\n2\nENTITIES\n${entities.join("")}0\nENDSEC\n0\nEOF\n`;
}

export function drawingFileName(title: string, ext: "svg" | "dxf"): string {
  const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "suggested-part";
  return `${slug}.${ext}`;
}
