import chromium from "@sparticuz/chromium";
import Groq from "groq-sdk";
import { NextResponse } from "next/server";
import { chromium as playwright } from "playwright-core";
import { z } from "zod";
import { capturePageState } from "@/lib/browsing/capture-page-state";
import { validateActionAgainstSafetyGuardrail } from "@/lib/browsing/safetyGuardrail";
import { personaPolicies } from "@/lib/ai/personas";

export const maxDuration = 300;
export const dynamic = "force-dynamic";
const schema = z.object({
  persona: z.enum(["impatient", "price", "low-tech", "language", "accessibility"]).default("price"),
  goal: z.string().min(10).max(500).default("Start a free trial without completing a payment"),
  maxSteps: z.number().int().min(3).max(5).default(5)
});

const actionSchema = z.object({ action: z.object({
  type: z.enum(["click", "type", "conclude"]),
  elementDescription: z.string().max(200).optional(),
  text: z.string().max(200).optional(),
  outcome: z.enum(["goal_reached", "abandoned_due_to_friction", "stuck"]).optional(),
  reasoning: z.string().min(3).max(1000)
}) });

function normalizeDecision(raw: string) {
  let parsed = JSON.parse(raw) as { action?: unknown; type?: unknown; elementDescription?: unknown; text?: unknown; outcome?: unknown; reasoning?: unknown } | unknown[];
  if (Array.isArray(parsed)) parsed = parsed[0] || {};
  const normalizeType = (value: unknown) => value === "type" ? "type" : value === "conclude" ? "conclude" : "click";
  const normalizeOutcome = (value: unknown) => ["goal_reached", "abandoned_due_to_friction", "stuck"].includes(String(value)) ? value : undefined;
  if (typeof parsed.action === "string") {
    return { action: { type: normalizeType(parsed.type), elementDescription: parsed.action, text: parsed.text, outcome: normalizeOutcome(parsed.outcome), reasoning: parsed.reasoning || `I will use ${parsed.action}.` } };
  }
  if (!parsed.action && parsed.type) {
    return { action: { type: normalizeType(parsed.type), elementDescription: parsed.elementDescription, text: parsed.text, outcome: normalizeOutcome(parsed.outcome), reasoning: parsed.reasoning || "I will continue with the visible control." } };
  }
  if (parsed.action && typeof parsed.action === "object") {
    const action = parsed.action as Record<string, unknown>;
    return { action: { ...action, type: normalizeType(action.type), outcome: normalizeOutcome(action.outcome), reasoning: action.reasoning || "I will continue with the visible control." } };
  }
  return parsed;
}

async function decide(input: { state: Awaited<ReturnType<typeof capturePageState>>; history: unknown[]; persona: string; goal: string }) {
  if (!process.env.GROQ_API_KEY) throw new Error("GROQ_API_KEY is not configured.");
  const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
  const policy = personaPolicies[input.persona] ?? personaPolicies.price;
  const models = [...new Set([process.env.GROQ_MODEL || "llama-3.3-70b-versatile", "llama-3.1-8b-instant"])];
  let lastError: unknown;
  for (const model of models) {
    try {
      const compactHistory = input.history.slice(-4).map((entry) => { const item = entry as { action?: unknown }; return item.action; });
      const result = await groq.chat.completions.create({ model, temperature: 0, max_completion_tokens: 220, response_format: { type: "json_object" }, messages: [{ role: "system", content: `You control a browser as this synthetic customer: ${policy}. Goal: ${input.goal}. Return JSON action with type click|type|conclude, elementDescription, text when typing, outcome when concluding, and first-person reasoning. Choose only exact visible labels. Use test@example.com for an empty email. Never repeat an action already in history. If a field already has a value, continue. At payment or card collection conclude stuck.` }, { role: "user", content: JSON.stringify({ state: input.state, history: compactHistory }) }] });
      const normalized = normalizeDecision(result.choices[0]?.message?.content || "{}");
      const checked = actionSchema.safeParse(normalized);
      if (!checked.success) return { action: deterministicFixtureAction(input.state), model, malformedModelOutput: true };
      return { ...checked.data, model };
    } catch (error) {
      lastError = error;
      if (!(error instanceof Error) || !error.message.includes("429")) throw error;
    }
  }
  throw lastError;
}

function bestVisibleLabel(description: string | undefined, state: Awaited<ReturnType<typeof capturePageState>>) {
  const normalized = (description || "").toLowerCase().replace(/\b(button|field|input|link|control)\b/g, "").trim();
  return state.elements.find((element) => element.label.toLowerCase() === normalized)?.label
    || state.elements.find((element) => normalized.includes(element.label.toLowerCase()) || element.label.toLowerCase().includes(normalized))?.label
    || description
    || "";
}

function deterministicFixtureAction(state: Awaited<ReturnType<typeof capturePageState>>) {
  const email = state.elements.find((element) => element.label.toLowerCase().includes("email") && !element.value);
  if (email) return { type: "type" as const, elementDescription: email.label, text: "test@example.com", reasoning: "I need a safe test email to continue the trial journey." };
  const preferred = ["Start free", "Continue to review", "Review trial"];
  for (const label of preferred) {
    const element = state.elements.find((item) => item.label.toLowerCase().includes(label.toLowerCase()));
    if (element) return { type: "click" as const, elementDescription: element.label, reasoning: `I will use ${element.label} to continue toward the trial.` };
  }
  return { type: "conclude" as const, outcome: "stuck" as const, reasoning: "I reached a boundary where no safe progress control is available." };
}

function reconcileActionWithElement(action: z.infer<typeof actionSchema>["action"], state: Awaited<ReturnType<typeof capturePageState>>) {
  const resolvedLabel = bestVisibleLabel(action.elementDescription, state);
  const element = state.elements.find((item) => item.label === resolvedLabel);
  if (!element) return deterministicFixtureAction(state);
  if (["input", "textarea", "select"].includes(element.tag) && action.type === "click") {
    if (element.label.toLowerCase().includes("card")) return { type: "conclude" as const, outcome: "stuck" as const, reasoning: "This is a payment-data boundary, so I will stop safely." };
    return { type: "type" as const, elementDescription: element.label, text: action.text || "test@example.com", reasoning: action.reasoning };
  }
  if ((element.tag === "button" || element.tag === "a") && action.type === "type") return { ...action, type: "click" as const, elementDescription: element.label };
  return { ...action, elementDescription: resolvedLabel };
}

export async function POST(request: Request) {
  let browser;
  try {
    const input = schema.parse(await request.json());
    const executablePath = process.env.VERCEL ? await chromium.executablePath() : process.env.CHROME_PATH || "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe";
    browser = await playwright.launch({ args: process.env.VERCEL ? chromium.args : ["--no-sandbox"], executablePath, headless: true });
    const context = await browser.newContext({ viewport: { width: 1200, height: 760 } });
    const page = await context.newPage();
    const fixtureUrl = new URL("/fixture/checkout", request.url).toString();
    await page.goto(fixtureUrl, { waitUntil: "networkidle" });
    const trace: Array<Record<string, unknown>> = [];
    for (let step = 1; step <= input.maxSteps; step++) {
      const state = await capturePageState(page);
      const decision = await decide({ state, history: trace, persona: input.persona, goal: input.goal });
      let action = decision.action;
      if (!action?.type) throw new Error("Model returned an invalid browser action.");
      if (action.type !== "conclude") action = reconcileActionWithElement(action, state);
      if (action.type === "conclude") { trace.push({ step, state, action, model: decision.model, guardrail: { allowed: true, code: "CONCLUDED" } }); break; }
      const kind = action.type === "type" ? "type" : "click";
      const resolvedLabel = bestVisibleLabel(action.elementDescription, state);
      const guardrail = validateActionAgainstSafetyGuardrail({ kind, label: resolvedLabel, value: action.text });
      action.elementDescription = resolvedLabel;
      trace.push({ step, state, action, model: decision.model, guardrail });
      if (!guardrail.allowed) break;
      if (kind === "click") await page.getByRole("button", { name: action.elementDescription || "", exact: false }).first().click();
      else await page.getByLabel(action.elementDescription || "", { exact: false }).first().fill(action.text || "test@example.com");
      await page.waitForTimeout(300);
    }
    const finalState = await capturePageState(page);
    const screenshot = await page.screenshot({ type: "jpeg", quality: 55 });
    return NextResponse.json({ mode: "playwright-live", browser: "chromium", fixtureUrl, trace, finalState, screenshot: `data:image/jpeg;base64,${screenshot.toString("base64")}` });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Browser run failed." }, { status: 500 });
  } finally { await browser?.close(); }
}
