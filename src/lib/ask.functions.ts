import { createServerFn } from "@tanstack/react-start";
import { localExplain } from "@/lib/explain";

type AskInput = { quote: string; question: string; context: string };

export const explainPassage = createServerFn({ method: "POST" })
  .validator((input: AskInput) => {
    const quote = String(input?.quote ?? "").trim().slice(0, 800);
    const question = String(input?.question ?? "").trim().slice(0, 400);
    const context = String(input?.context ?? "").trim().slice(0, 1500);
    if (quote.length < 2) throw new Error("Select a little more text.");
    return { quote, question, context };
  })
  .handler(async ({ data }) => {
    const fallback = localExplain(data.quote, data.question, data.context);
    const apiKey = process.env.XAI_API_KEY;
    if (!apiKey) return { ok: true as const, text: fallback, source: "notes" as const };

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
