import assert from "node:assert/strict";
import { test } from "node:test";
import { analyze, type Constraints } from "./engine.ts";
import { pickSuggestion, SUGGESTIONS } from "./suggestions.ts";

const base: Constraints = {
  budget: 100,
  size: "bench",
  material: "any",
  experience: "some",
  precision: "normal",
  stress: "moderate",
  exposure: "indoor",
  time: "week",
};

test("a river sensor enclosure does not lead with a printed box", () => {
  const plan = analyze(
    "I want to build a waterproof enclosure for an environmental sensor that will be deployed in a river.",
    base,
  );
  assert.notEqual(plan.routes[0].id, "fdm");
  assert.ok(plan.routes.some((route) => route.id === "laser" || route.id === "cnc"));
  assert.ok(plan.questions.some((question) => /cable|river|dunk|water/i.test(question)));
});

test("arm, circuit, acrylic organizer, and steel bracket are different plans", () => {
  const arm = analyze("Lightweight robotic arm with four linkages and hobby servos. Mostly flat parts I can bolt together.", {
    ...base,
    budget: 120,
  });
  const board = analyze("Custom wearable electronics PCB, a wrist-worn heart-rate board with a coin cell.", {
    ...base,
    size: "handheld",
    budget: 60,
  });
  const organizer = analyze("Laser-cut acrylic organizer with a clear lid and compartments.", { ...base, material: "acrylic" });
  const bracket = analyze("Load-bearing steel bracket for a shelf. Holes must line up.", {
    ...base,
    material: "metal",
    stress: "structural",
    experience: "trained",
    budget: 180,
  });
  assert.equal(board.routes[0].id, "pcb");
  assert.notEqual(bracket.routes[0].id, "fdm");
  assert.notEqual(bracket.routes[0].id, "laser");
  assert.notEqual(arm.routes[0].name, organizer.routes[0].name);
  assert.ok(arm.routes[0].bom.some((line) => /servo|plywood/i.test(line.item)));
  assert.ok(organizer.routes[0].bom.some((line) => /acrylic/i.test(line.item)));
  assert.ok(bracket.routes[0].equipmentIds.join(" ") !== organizer.routes[0].equipmentIds.join(" "));
});

test("a new student with one evening is steered off the slow shop", () => {
  const newbie = analyze("Load-bearing steel bracket.", {
    ...base,
    material: "metal",
    stress: "structural",
    experience: "new",
    time: "evening",
  });
  const shop = analyze("Load-bearing steel bracket.", {
    ...base,
    material: "metal",
    stress: "structural",
    experience: "trained",
    time: "month",
    budget: 250,
  });
  assert.notEqual(newbie.routes[0].id, "professional");
  const newbieCnc = newbie.routes.find((route) => route.id === "cnc");
  const shopCnc = shop.routes.find((route) => route.id === "cnc");
  assert.ok(newbieCnc && shopCnc);
  assert.ok(shopCnc.accessibility > newbieCnc.accessibility);
});

test("structural stress and a tight fit raise machining relative to a loose plastic case", () => {
  const brief = "A small instrument housing that must hold its shape.";
  const loose = analyze(brief, { ...base, precision: "loose", budget: 400, material: "plastic", stress: "light" });
  const tight = analyze(brief, { ...base, precision: "tight", budget: 200, material: "plastic", stress: "structural" });
  const looseCnc = loose.routes.find((route) => route.id === "cnc")?.rankScore ?? -1;
  const tightCnc = tight.routes.find((route) => route.id === "cnc")?.rankScore ?? -1;
  assert.ok(tightCnc > looseCnc, `${tightCnc} vs ${looseCnc}`);
});

test("suggest a project rotates ideas students can actually rank", () => {
  const first = pickSuggestion(0, "");
  const second = pickSuggestion(1, first.brief);
  assert.notEqual(first.brief, second.brief);
  assert.equal(SUGGESTIONS.length >= 8, true);
  const leads = new Set(SUGGESTIONS.map((idea) => analyze(idea.brief, idea.constraints).routes[0].id));
  assert.ok(leads.size >= 3, [...leads].join(", "));
});

test("later briefs stay different instead of repeating the first set", () => {
  const seen = new Set<string>();
  for (let index = 0; index < 80; index += 1) {
    const idea = pickSuggestion(index, "");
    assert.equal(seen.has(idea.brief), false, idea.brief);
    seen.add(idea.brief);
  }
  const again = pickSuggestion(80, "");
  assert.equal(seen.has(again.brief), false);
});
test("a typed budget past the slider changes cost fit", () => {
  const brief = "Laser-cut acrylic organizer.";
  const low = analyze(brief, { ...base, budget: 15, material: "acrylic" });
  const high = analyze(brief, { ...base, budget: 800, material: "acrylic" });
  const lowLaser = low.routes.find((route) => route.id === "laser");
  const highLaser = high.routes.find((route) => route.id === "laser");
  assert.ok(lowLaser && highLaser);
  assert.ok(highLaser.costScore > lowLaser.costScore);
});
