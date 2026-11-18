import assert from "node:assert/strict";
import { test } from "node:test";
import { analyzeForCampus } from "./open-shop.ts";
import type { Constraints } from "./engine.ts";

const base: Constraints = {
  budget: 80,
  size: "bench",
  material: "any",
  experience: "some",
  precision: "normal",
  stress: "moderate",
  exposure: "splash",
  time: "week",
};

test("open shop keeps the ranking and strips Yale shop names from the plan", () => {
  const brief = "I want to build a waterproof enclosure for an environmental sensor that will be deployed in a river.";
  const yale = analyzeForCampus(brief, base, "yale");
  const open = analyzeForCampus(brief, base, "open");
  assert.equal(open.routes[0]?.id, yale.routes[0]?.id);
  assert.notEqual(open.routes[0]?.id, "fdm");
  const blob = JSON.stringify({ summary: open.summary, routes: open.routes, aside: open.aside, questions: open.questions });
  for (const word of ["CEID", "Yale", "Wright", "YSoA", "Bambu", "Gibbs", "Handsome"]) {
    assert.equal(blob.includes(word), false, word);
  }
  assert.match(open.assumptions[0] ?? "", /Open shop/);
  assert.match(open.assumptions[1] ?? "", /Bulldogs Build/);
});
