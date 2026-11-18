import { createServerFn } from "@tanstack/react-start";
import { authMiddleware } from "@/lib/auth/middleware";
import { localExplain } from "@/lib/explain";

type AskInput = { quote: string; question: string; context: string; campus?: string };

const WINDOW_MS = 10 * 60 * 1000;
const PER_USER_MAX = 8;
const GLOBAL_MAX = 40;
const userHits = new Map<string, number[]>();
let globalHits: number[] = [];

function allowModelCall(userId: string): boolean {
  const now = Date.now();
  const mine = (userHits.get(userId) ?? []).filter((at) => now - at < WINDOW_MS);
  globalHits = globalHits.filter((at) => now - at < WINDOW_MS);
  if (mine.length >= PER_USER_MAX || globalHits.length >= GLOBAL_MAX) {
    if (mine.length === 0) userHits.delete(userId);
    else userHits.set(userId, mine);
    return false;
  }
  mine.push(now);
  globalHits.push(now);
  userHits.set(userId, mine);
  return true;
}

export const explainPassage = createServerFn({ method: "POST" })
  .middleware([authMiddleware])
  .validator((input: AskInput) => {
    const quote = String(input?.quote ?? "").trim().slice(0, 800);
    const question = String(input?.question ?? "").trim().slice(0, 400);
    const context = String(input?.context ?? "").trim().slice(0, 1500);
    const campus = input?.campus === "yale" ? "yale" as const : "open" as const;
    if (quote.length < 2) throw new Error("Select a little more text.");
    return { quote, question, context, campus };
  })
  .handler(async ({ data, context }) => {
    const fallback = localExplain(data.quote, data.question, data.context, data.campus);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey || !allowModelCall(context.userId)) {
      return { ok: true as const, text: fallback, source: "notes" as const };
    }

    const prompt = [
      "You help an engineering student read a fabrication plan. Answer in plain everyday words, in under 130 words.",
      "If they asked a question, answer it. Otherwise explain the highlighted passage.",
      "Do not invent machine models, prices, training names, or hours that are not in the context.",
      "Never say a design is waterproof, structurally sound, or safe. Say what must be confirmed with the shop.",
      "",
      `Plan context:\n${data.context || "None loaded yet."}`,
      "",
      `Highlighted:\n${data.quote}`,
      "",
      data.question ? `Question:\n${data.question}` : "No extra question. Explain the highlight.",
    ].join("\n");

    try {
      const res = await fetch("https://api.x.ai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "grok-4.5",
          max_tokens: 280,
          temperature: 0.3,
          messages: [{ role: "user", content: prompt }],
        }),
      });
      if (!res.ok) return { ok: true as const, text: fallback, source: "notes" as const };
      const body = (await res.json()) as { choices?: { message?: { content?: string } }[] };
      const text = body.choices?.[0]?.message?.content?.trim();
      if (!text) return { ok: true as const, text: fallback, source: "notes" as const };
      return { ok: true as const, text, source: "grok" as const };
    } catch {
      return { ok: true as const, text: fallback, source: "notes" as const };
    }
  });
