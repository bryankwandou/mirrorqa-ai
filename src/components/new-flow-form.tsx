"use client";

import { motion } from "framer-motion";
import { Check, LoaderCircle, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { personas } from "@/lib/data";

export function NewFlowForm() {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const form = new FormData(event.currentTarget);
    if (form.get("authorized") !== "on") {
      setError("Confirm that you are authorized to test this website.");
      return;
    }
    const persona = String(form.get("persona") || "");
    if (!personas.some((item) => item.key === persona)) {
      setError("Select one customer profile.");
      return;
    }
    setBusy(true);
    try {
      const flow = { url: form.get("url"), goal: form.get("goal"), maxSteps: form.get("maxSteps") };
      const response = await fetch("/api/browser/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ persona, goal: flow.goal, maxSteps: Number(flow.maxSteps) })
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "The browser run could not start.");
      sessionStorage.setItem("mirrorqa:last-run", JSON.stringify({ flow, result }));
      router.push("/runs/live");
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "The browser run failed.");
      setBusy(false);
    }
  }

  return <form className="flow-form" onSubmit={submit}>
    <section className="form-section"><span className="form-index">01</span><div><h2>Journey details</h2><p>The public MVP executes the authorized live fixture. Arbitrary domains require an isolated worker deployment.</p></div><div className="field-stack"><label>Starting URL<input name="url" type="url" defaultValue="https://mirrorqa-ai.vercel.app/fixture/checkout" readOnly required /></label><label>Customer goal<textarea name="goal" defaultValue="Start a free trial without completing a payment" rows={3} minLength={10} required /></label><label>Maximum steps<input name="maxSteps" type="number" defaultValue={5} min={3} max={5} required /></label></div></section>
    <section className="form-section"><span className="form-index">02</span><div><h2>Choose a perspective</h2><p>The selected profile drives the live model decision policy.</p></div><div className="persona-select">{personas.map((persona, index) => <label key={persona.key}><input name="persona" value={persona.key} type="radio" defaultChecked={index === 1} /><span className={`persona-number ${persona.color}`}>{persona.mark}</span><span><b>{persona.name}</b><small>{persona.note}</small></span><Check size={15} /></label>)}</div></section>
    <section className="attestation"><ShieldCheck size={21} /><label><input name="authorized" type="checkbox" /><span><b>I am authorized to test this website.</b><small>Every model proposal passes the deterministic payment and sensitive-data guardrail.</small></span></label></section>
    {error && <motion.p className="form-error" role="alert" initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}>{error}</motion.p>}
    <div className="form-actions"><Link className="button ghost" href="/flows">Cancel</Link><button className="button primary" type="submit" disabled={busy}>{busy ? <LoaderCircle className="spin" size={15} /> : null}{busy ? "Running live Chromium..." : "Register and start run"}</button></div>
  </form>;
}
