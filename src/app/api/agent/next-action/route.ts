import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { z } from "zod";
import { personaPolicies } from "@/lib/ai/personas";

const inputSchema = z.object({
  persona: z.string(),
  goal: z.string().min(5).max(500),
  pageState: z.string().min(5).max(12000),
  history: z.array(z.object({ action: z.string(), reasoning: z.string() })).max(20).default([])
});

const fallback = { action: { type: "conclude", outcome: "stuck", reasoning: "The live model is not configured, so I will not pretend an autonomous decision was made." } };

export async function POST(request: Request) {
  try {
    const input = inputSchema.parse(await request.json());
    if (!process.env.GROQ_API_KEY) return NextResponse.json({ ...fallback, mode: "safe-fallback" }, { status: 503 });
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const policy = personaPolicies[input.persona] ?? personaPolicies.impatient;
    const models = [...new Set([process.env.GROQ_MODEL || "llama-3.3-70b-versatile", "llama-3.1-8b-instant"])];
    let lastError: unknown;
    for (const model of models) {
      try {
        const completion = await groq.chat.completions.create({
          model,
          temperature: 0.15,
          max_completion_tokens: 220,
          response_format: { type: "json_object" },
          messages: [
            { role: "system", content: `You are a synthetic customer controlling a browser. Persona policy: ${policy}. Return only JSON: {"action":{"type":"click|type|scroll|wait|conclude","elementDescription":"optional","text":"optional","direction":"up|down optional","outcome":"goal_reached|abandoned_due_to_friction|stuck optional","reasoning":"specific first-person reason"}}. Never submit payment or real personal data. Ground the action only in supplied page state.` },
            { role: "user", content: JSON.stringify({ goal: input.goal, pageState: input.pageState, history: input.history }) }
          ]
        });
        const content = completion.choices[0]?.message?.content;
        if (!content) throw new Error("The model returned no action.");
        return NextResponse.json({ ...JSON.parse(content), mode: "groq-live", model });
      } catch (error) {
        lastError = error;
        if (!(error instanceof Error) || !error.message.includes("429")) throw error;
      }
    }
    throw lastError;
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Agent request failed." }, { status: 400 });
  }
}
