import { useMemo } from "react";
import type { Constraints } from "@/lib/engine";
import { drawingDxf, drawingFileName, drawingSvg, suggestDrawing, type DrawPrim } from "@/lib/drawings";
import { pictureForBrief } from "@/lib/pictures";
import { ShopPhoto } from "@/components/shop-photo";

function download(name: string, contents: string, type: string) {
  const blob = new Blob([contents], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

function Prim({ prim, height }: { prim: DrawPrim; height: number }) {
  const y = (value: number) => height - value;
  const stroke = prim.layer === "cut" ? "#142033" : "#8a6a2f";
  const dash = prim.layer === "mark" ? "4 3" : undefined;
  if (prim.kind === "line") {
    return (
      <line
        x1={prim.x}
        y1={y(prim.y)}
        x2={prim.x2 ?? prim.x}
        y2={y(prim.y2 ?? prim.y)}
        fill="none"
        stroke={stroke}
        strokeWidth={0.7}
        strokeDasharray={dash}
      />
    );
  }
  if (prim.kind === "circle") {
    return <circle cx={prim.x} cy={y(prim.y)} r={prim.r ?? 1} fill="none" stroke={stroke} strokeWidth={0.7} strokeDasharray={dash} />;
  }
  return (
    <rect
      x={prim.x}
      y={y(prim.y + (prim.h ?? 0))}
      width={prim.w ?? 0}
      height={prim.h ?? 0}
      fill="none"
      stroke={stroke}
      strokeWidth={0.8}
      strokeDasharray={dash}
    />
  );
}

export function SuggestedDrawing({
  brief,
  constraints,
  title,
}: {
  brief: string;
  constraints: Constraints;
  title: string;
}) {
  const heading = /fabrication plan/i.test(title)
    ? brief.split(".")[0].trim().split(/\s+/).slice(0, 7).join(" ").replace(/\b(a|an|the|for|with|and)$/i, "").trim()
    : title;
  const drawing = useMemo(() => suggestDrawing(brief, constraints, heading), [brief, constraints, heading]);
  const photo = pictureForBrief(`${title} ${brief}`);
  const pad = 16;
  return (
    <section className="mt-8 border border-line bg-paper">
      <div className="grid gap-4 p-4 md:grid-cols-[minmax(0,1.1fr)_minmax(16rem,0.9fr)] md:p-5">
        <div className="grid gap-3">
          <ShopPhoto src={photo.src} alt={photo.alt} className="aspect-[2/1] border border-line" />
        <div className="border border-line bg-[#f4f0e8] p-3">
          <svg
            role="img"
            aria-label={`Suggested drawing, ${drawing.width} by ${drawing.height} millimeters`}
            viewBox={`${-pad} ${-pad} ${drawing.width + pad * 2} ${drawing.height + pad * 2}`}
            className="h-auto w-full"
          >
            {drawing.prims.map((prim, index) => (
              <Prim key={index} prim={prim} height={drawing.height} />
            ))}
          </svg>
        </div>
        </div>
        <div>
          <p className="font-mono text-xs tracking-[0.16em] text-cyan">SUGGESTED DRAWING</p>
          <h3 className="mt-2 font-display text-3xl leading-tight">{drawing.title}</h3>
          <p className="mt-2 font-mono text-xs text-[#8a6a2f]">
            {drawing.width} × {drawing.height} mm · {drawing.material}
          </p>
          <p className="mt-3 text-sm text-muted">{drawing.note}</p>
          <p className="mt-2 text-sm text-muted">Solid lines are cuts. Dashed lines are marks. Measure the real part before you trust a number.</p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              type="button"
              className="h-11 border border-ink px-3 text-sm"
              onClick={() => download(drawingFileName(drawing.title, "svg"), drawingSvg(drawing), "image/svg+xml")}
            >
              Download SVG
            </button>
            <button
              type="button"
              className="h-11 bg-ink px-3 text-sm text-paper"
              onClick={() => download(drawingFileName(drawing.title, "dxf"), drawingDxf(drawing), "application/dxf")}
            >
              Download DXF
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
