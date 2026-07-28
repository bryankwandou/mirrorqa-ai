"use client";

import { useState } from "react";
import { Bot, LoaderCircle, Play, ShieldAlert } from "lucide-react";
import { validateActionAgainstSafetyGuardrail } from "@/lib/browsing/safetyGuardrail";

export function AgentLab() {
  const [pageState, setPageState] = useState("Page title: Choose a plan. Buttons: Start free, Compare plans, Confirm subscription. Text: Starter $19/month. Usage overages are not explained.");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);

  async function runAgent() {
    setBusy(true);
    const response = await fetch("/api/agent/next-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona: "price", goal: "Start a free trial without making a payment", pageState, history: [] }) });
    const data = await response.json();
    const action = data.action as { type?: string; elementDescription?: string; text?: string } | undefined;
    const guardrail = action ? validateActionAgainstSafetyGuardrail({ kind: action.type === "type" ? "type" : "click", label: action.elementDescription, value: action.text }) : null;
    setResult({ ...data, guardrail });
    setBusy(false);
  }

  return <section className="lab-card"><div className="lab-head"><span><Bot size={19} /></span><div><b>Live agent decision</b><small>Groq model, grounded in supplied page state</small></div><i className="live-pill">Server-side</i></div><label>Current browser observation<textarea rows={5} value={pageState} onChange={(event) => setPageState(event.target.value)} /></label><button className="button primary" onClick={runAgent} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Play size={15} />} Run next decision</button>{result && <div className="agent-result"><span><ShieldAlert size={17} /></span><pre>{JSON.stringify(result, null, 2)}</pre></div>}</section>;
}
