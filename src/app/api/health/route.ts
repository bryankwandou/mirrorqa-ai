import { Connection } from "@solana/web3.js";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  const startedAt = Date.now();
  let solana: { ok: boolean; slot?: number; error?: string };
  try {
    const connection = new Connection(process.env.SOLANA_RPC_URL || "https://api.devnet.solana.com", "confirmed");
    solana = { ok: true, slot: await connection.getSlot("confirmed") };
  } catch (error) {
    solana = { ok: false, error: error instanceof Error ? error.message : "RPC failed" };
  }
  const checks = { groqConfigured: Boolean(process.env.GROQ_API_KEY), chromiumConfigured: true, solana };
  const ok = checks.groqConfigured && checks.solana.ok;
  return NextResponse.json({ ok, service: "MirrorQA", environment: process.env.VERCEL_ENV || "local", checks, latencyMs: Date.now() - startedAt, timestamp: new Date().toISOString() }, { status: ok ? 200 : 503 });
}
