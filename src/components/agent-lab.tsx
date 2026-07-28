"use client";

import { useState } from "react";
import { Bot, ExternalLink, LoaderCircle, Play, ShieldAlert } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { validateActionAgainstSafetyGuardrail } from "@/lib/browsing/safetyGuardrail";

export function AgentLab() {
  const [pageState, setPageState] = useState("Page title: Choose a plan. Buttons: Start free, Compare plans, Confirm subscription. Text: Starter $19/month. Usage overages are not explained.");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [busy, setBusy] = useState(false);
  const [browserBusy, setBrowserBusy] = useState(false);
  const [browserResult, setBrowserResult] = useState<{ mode?: string; trace?: Array<Record<string, unknown>>; screenshot?: string; error?: string } | null>(null);

  async function runAgent() {
    setBusy(true);
    const response = await fetch("/api/agent/next-action", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona: "price", goal: "Start a free trial without making a payment", pageState, history: [] }) });
    const data = await response.json();
    const action = data.action as { type?: string; elementDescription?: string; text?: string } | undefined;
    const guardrail = action ? validateActionAgainstSafetyGuardrail({ kind: action.type === "type" ? "type" : "click", label: action.elementDescription, value: action.text }) : null;
    setResult({ ...data, guardrail });
    setBusy(false);
  }

  async function runBrowser() {
    setBrowserBusy(true);
    const response = await fetch("/api/browser/run", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ persona: "price" }) });
    setBrowserResult(await response.json());
    setBrowserBusy(false);
  }

  return <section className="lab-card"><div className="lab-head"><span><Bot size={19} /></span><div><b>Live autonomous agent</b><small>Groq decisions with real Chromium execution</small></div><i className="live-pill">Production</i></div><button className="button primary" onClick={runBrowser} disabled={browserBusy}>{browserBusy ? <LoaderCircle className="spin" size={16} /> : <Play size={15} />} Run full browser workflow</button><AnimatePresence>{browserResult && <motion.div className="browser-result" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}><div><b>{browserResult.mode || "Run failed"}</b><small>{browserResult.trace?.length || 0} model-directed browser steps</small></div>{browserResult.screenshot && <img src={browserResult.screenshot} alt="Final live browser state captured by Playwright" />}<pre>{JSON.stringify(browserResult.error ? browserResult : browserResult.trace, null, 2)}</pre><a href="/fixture/checkout" target="_blank">Open live fixture <ExternalLink size={13} /></a></motion.div>}</AnimatePresence><details><summary>Test one model decision</summary><label>Current browser observation<textarea rows={5} value={pageState} onChange={(event) => setPageState(event.target.value)} /></label><button className="button ghost" onClick={runAgent} disabled={busy}>{busy ? <LoaderCircle className="spin" size={16} /> : <Play size={15} />} Run next decision</button>{result && <div className="agent-result"><span><ShieldAlert size={17} /></span><pre>{JSON.stringify(result, null, 2)}</pre></div>}</details></section>;
}
