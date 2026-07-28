import assert from "node:assert/strict";
import bs58 from "bs58";
import nacl from "tweetnacl";

const baseUrl = process.env.MIRRORQA_URL || "https://mirrorqa-ai.vercel.app";
async function json(path, options) { const response = await fetch(`${baseUrl}${path}`, options); const body = await response.json(); assert.equal(response.ok, true, `${path}: ${JSON.stringify(body)}`); return body; }

const agent = await json("/api/agent/next-action", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ persona: "price", goal: "Start a free trial without completing payment", pageState: "Button: Start free. Price: $19 monthly.", history: [] }) });
assert.equal(agent.mode, "groq-live");
assert.ok(agent.action?.reasoning);

const pair = nacl.sign.keyPair();
const publicKey = bs58.encode(pair.publicKey);
const message = `MirrorQA wallet verification\nNetwork: Solana devnet\nWallet: ${publicKey}\nExpires: ${new Date(Date.now() + 300000).toISOString()}`;
const signature = bs58.encode(nacl.sign.detached(new TextEncoder().encode(message), pair.secretKey));
const ownership = await json("/api/solana/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ publicKey, message, signature }) });
assert.equal(ownership.verified, true);

if (process.env.SOLANA_PROOF_SIGNATURE) { const receipt = await json(`/api/solana/receipt?signature=${process.env.SOLANA_PROOF_SIGNATURE}`); assert.equal(receipt.verified, true); assert.equal(receipt.network, "devnet"); }
if (process.env.FULL_BROWSER_SMOKE === "1") { const browser = await json("/api/browser/run", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ persona: "price", goal: "Start a free trial without completing payment", maxSteps: 5 }) }); assert.equal(browser.mode, "playwright-live"); assert.ok(browser.trace.length >= 2); assert.ok(browser.screenshot.startsWith("data:image/jpeg;base64,")); }

console.log(JSON.stringify({ ok: true, baseUrl, agentModel: agent.model, walletOwnership: ownership.verified, receiptChecked: Boolean(process.env.SOLANA_PROOF_SIGNATURE), browserChecked: process.env.FULL_BROWSER_SMOKE === "1" }));
