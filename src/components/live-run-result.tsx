"use client";

import { motion } from "framer-motion";
import { CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type TraceStep = { step: number; model?: string; action: { type: string; elementDescription?: string; reasoning?: string }; guardrail: { allowed: boolean; code: string } };
type RunResult = { screenshot: string; trace: TraceStep[] };
type SavedRun = { flow: { url: string; goal: string }; runs: Array<{ persona: { key: string; name: string; mark: string; color: string }; result: RunResult }> };

export function LiveRunResult() {
  const [saved, setSaved] = useState<SavedRun | null | undefined>();
  useEffect(() => { try { const value = sessionStorage.getItem("mirrorqa:last-run"); setSaved(value ? JSON.parse(value) : null); } catch { setSaved(null); } }, []);
  if (saved === undefined) return <div className="live-empty">Loading captured browser evidence...</div>;
  if (!saved) return <div className="live-empty"><ShieldAlert size={24} /><h2>No live run in this browser session.</h2><p>Start a new flow to execute Chromium and keep the resulting trace in this tab.</p><Link className="button primary" href="/flows/new">Start a live run</Link></div>;
  const totalSteps = saved.runs.reduce((sum, run) => sum + run.result.trace.length, 0);
  return <div className="live-result"><div className="page-title"><div><span className="eyebrow">Multi-persona / Playwright live</span><h1>Live browser evidence</h1><p>{saved.flow.goal}</p></div><a className="button ghost" href={saved.flow.url} target="_blank" rel="noreferrer">Open target <ExternalLink size={14} /></a></div><div className="live-result-grid"><section>{saved.runs.map((run, runIndex) => <motion.section className="persona-run" key={run.persona.key} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: runIndex * 0.1 }}><header><span className={`persona-number ${run.persona.color}`}>{run.persona.mark}</span><div><h2>{run.persona.name}</h2><p>{run.result.trace.length} steps / {run.result.trace[0]?.model || "Groq"}</p></div></header><img className="live-shot" src={run.result.screenshot} alt={`Final browser screenshot for ${run.persona.name}`} />{run.result.trace.map((step, index) => <motion.article className="live-trace-card" key={step.step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: runIndex * 0.1 + index * 0.05 }}><span>{String(step.step).padStart(2, "0")}</span><div><div><b>{step.action.type}</b><code>{step.action.elementDescription || "run concluded"}</code></div><p>“{step.action.reasoning}”</p><small className={step.guardrail.allowed ? "positive" : "negative"}><CheckCircle2 size={13} /> {step.guardrail.code}</small></div></motion.article>)}</motion.section>)}</section><aside className="panel live-proof"><span className="eyebrow">Execution proof</span><dl><div><dt>Personas</dt><dd>{saved.runs.length}</dd></div><div><dt>Engine</dt><dd>Chromium</dd></div><div><dt>Decision mode</dt><dd>Groq live</dd></div><div><dt>Total steps</dt><dd>{totalSteps}</dd></div><div><dt>Safety</dt><dd className="positive">Enforced</dd></div><div><dt>Evidence</dt><dd>{saved.runs.length} JPEG</dd></div></dl><Link href="/runs/demo">Open curated report →</Link></aside></div></div>;
}
