"use client";

import Link from "next/link";
import { CheckCircle2, ExternalLink, ShieldAlert } from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

type SavedRun = { flow: { url: string; goal: string; maxSteps: string }; result: { mode: string; browser: string; screenshot: string; trace: Array<{ step: number; action: { type: string; elementDescription?: string; reasoning?: string }; guardrail: { allowed: boolean; code: string } }> } };

export function LiveRunResult() {
  const [saved, setSaved] = useState<SavedRun | null | undefined>();
  useEffect(() => { const value = sessionStorage.getItem("mirrorqa:last-run"); setSaved(value ? JSON.parse(value) : null); }, []);
  if (saved === undefined) return <div className="live-empty">Loading captured browser evidence…</div>;
  if (!saved) return <div className="live-empty"><ShieldAlert size={24} /><h2>No live run in this browser session.</h2><p>Start a new flow to execute Chromium and keep the resulting trace in this tab.</p><Link className="button primary" href="/flows/new">Start a live run</Link></div>;
  return <div className="live-result"><div className="page-title"><div><span className="eyebrow">{saved.result.mode} / {saved.result.browser}</span><h1>Live browser evidence</h1><p>{saved.flow.goal}</p></div><a className="button ghost" href={saved.flow.url} target="_blank" rel="noreferrer">Open target <ExternalLink size={14} /></a></div><div className="live-result-grid"><section><img className="live-shot" src={saved.result.screenshot} alt="Final screenshot captured by the live Playwright run" />{saved.result.trace.map((step, index) => <motion.article className="live-trace-card" key={step.step} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * .08 }}><span>{String(step.step).padStart(2,"0")}</span><div><div><b>{step.action.type}</b><code>{step.action.elementDescription || "run concluded"}</code></div><p>“{step.action.reasoning}”</p><small className={step.guardrail.allowed ? "positive" : "negative"}><CheckCircle2 size={13} /> {step.guardrail.code}</small></div></motion.article>)}</section><aside className="panel live-proof"><span className="eyebrow">Execution proof</span><dl><div><dt>Engine</dt><dd>{saved.result.browser}</dd></div><div><dt>Decision mode</dt><dd>Groq live</dd></div><div><dt>Steps</dt><dd>{saved.result.trace.length}</dd></div><div><dt>Safety</dt><dd className="positive">Enforced</dd></div><div><dt>Evidence</dt><dd>Real JPEG</dd></div></dl><Link href="/runs/demo">Open curated report →</Link></aside></div></div>;
}
