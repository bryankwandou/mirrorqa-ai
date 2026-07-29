import assert from "node:assert/strict";
import bs58 from "bs58";
import nacl from "tweetnacl";

const base = process.env.TEST_BASE_URL || "https://mirrorqa-ai.vercel.app";
const proof = process.env.SOLANA_PROOF_SIGNATURE || "2Avqy4GUvwduMcKc3FZdAoADga5YDexbwp9oTfKfbstur9cDHMEhsi8LVtLfkQxErDXFg56a8NjKdYZAXAuv7Hk6";
const checks = [];

async function request(name, path, options, expected) {
  const response = await fetch(`${base}${path}`, { signal: AbortSignal.timeout(120_000), ...options });
  const text = await response.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  assert.equal(response.status, expected, `${name}: ${response.status} ${text}`);
  checks.push({ name, status: response.status });
  return body;
}

const health = await request("health", "/api/health", undefined, 200);
assert.equal(health.ok, true);

const agent = await request("agent valid", "/api/agent/next-action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ persona: "price", goal: "Start a free trial safely", pageState: "Button: Start free", history: [] }) }, 200);
assert.equal(agent.mode, "groq-live");
await request("agent invalid", "/api/agent/next-action", { method: "POST", headers: { "content-type": "application/json" }, body: "{}" }, 400);

const pair = nacl.sign.keyPair();
const publicKey = bs58.encode(pair.publicKey);
const message = `MirrorQA wallet verification\nNetwork: Solana devnet\nWallet: ${publicKey}\nExpires: ${new Date(Date.now() + 300_000).toISOString()}`;
const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), pair.secretKey));
const wallet = await request("wallet valid", "/api/solana/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ publicKey, message, signature }) }, 200);
assert.equal(wallet.verified, true);
await request("wallet invalid", "/api/solana/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ publicKey: bs58.encode(nacl.sign.keyPair().publicKey), message, signature }) }, 401);

const receipt = await request("receipt valid", `/api/solana/receipt?signature=${proof}`, undefined, 200);
assert.equal(receipt.verified, true);
await request("receipt invalid", "/api/solana/receipt?signature=invalid", undefined, 400);

await request("unknown route", "/this-route-must-not-exist", undefined, 404);
console.log(JSON.stringify({ ok: true, base, checks }, null, 2));
