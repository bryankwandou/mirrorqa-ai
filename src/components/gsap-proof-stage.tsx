"use client";

import gsap from "gsap";
import { Bot, CheckCircle2, ShieldCheck, Wallet } from "lucide-react";
import { useEffect, useRef } from "react";

const stages = [
  { icon: Bot, label: "Groq decision", detail: "Grounded browser action" },
  { icon: ShieldCheck, label: "Guardrail", detail: "Checked before execution" },
  { icon: Wallet, label: "Wallet proof", detail: "Signed by the user" },
  { icon: CheckCircle2, label: "Devnet receipt", detail: "Verified independently" }
];

export function GsapProofStage() {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const context = gsap.context(() => {
      const timeline = gsap.timeline({ defaults: { ease: "power3.out" } });
      timeline.from("[data-proof-title]", { opacity: 0, y: 24, duration: 0.7 })
        .from("[data-proof-node]", { opacity: 0, y: 18, scale: 0.96, stagger: 0.12, duration: 0.55 }, "-=0.35")
        .from("[data-proof-line]", { scaleX: 0, transformOrigin: "left", stagger: 0.12, duration: 0.4 }, "-=0.45");
      gsap.to("[data-proof-pulse]", { scale: 1.18, opacity: 0.35, repeat: -1, yoyo: true, duration: 1.15, ease: "sine.inOut" });
    }, root);
    return () => context.revert();
  }, []);

  return <div className="proof-stage" ref={root}><div data-proof-title><span className="kicker"><i /> Live verification chain</span><h1>Do not trust the claim.<br />Verify every layer.</h1><p>Run the agent, inspect the browser evidence, prove wallet ownership, and resolve the receipt against Solana devnet.</p></div><div className="proof-chain">{stages.map((stage, index) => <div className="proof-chain-item" key={stage.label}>{index > 0 && <i data-proof-line />}<article data-proof-node><span><stage.icon size={20} /></span><b>{stage.label}</b><small>{stage.detail}</small>{index === stages.length - 1 && <em data-proof-pulse />}</article></div>)}</div></div>;
}
