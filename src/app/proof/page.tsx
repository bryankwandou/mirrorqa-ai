import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, ExternalLink, HeartPulse } from "lucide-react";
import { AgentLab } from "@/components/agent-lab";
import { Brand } from "@/components/brand";
import { GsapProofStage } from "@/components/gsap-proof-stage";
import { WalletProof } from "@/components/wallet-proof";

export const metadata: Metadata = { title: "Live Proof Lab", description: "Run MirrorQA's production AI browser workflow and verify its Solana devnet proof." };

export default function ProofPage() {
  return <main className="proof-page"><nav className="nav-wrap"><Brand /><Link className="back-link" href="/"><ArrowLeft size={14} /> Back to product</Link></nav><section className="proof-hero section-wrap"><GsapProofStage /></section><section className="proof-lab section-wrap"><div className="proof-lab-copy"><span className="section-index">Production proof lab</span><h2>Try the actual systems.</h2><p>The controls here call the deployed Groq endpoint, launch server-side Chromium, verify an Ed25519 wallet challenge, and resolve Memo transactions from Solana devnet.</p><div className="proof-reference-links"><a href="/api/health" target="_blank"><HeartPulse size={13} /> Open live health JSON</a><a href="https://explorer.solana.com/tx/2Avqy4GUvwduMcKc3FZdAoADga5YDexbwp9oTfKfbstur9cDHMEhsi8LVtLfkQxErDXFg56a8NjKdYZAXAuv7Hk6?cluster=devnet" target="_blank" rel="noreferrer">Open launch proof <ExternalLink size={13} /></a><a href="https://github.com/bryankwandou/mirrorqa-ai/actions" target="_blank" rel="noreferrer">Open CI history <ExternalLink size={13} /></a></div><aside><b>Honest MVP boundary</b><p>Persistent multi-tenant storage, organization auth, scheduling, and arbitrary-domain durable workers remain explicit post-MVP services—not simulated controls.</p></aside></div><div className="proof-tools"><AgentLab /><WalletProof /></div></section></main>;
}
