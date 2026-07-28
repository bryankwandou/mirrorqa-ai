# Architecture decisions

## Browser execution

Vercel hosts the web application and a bounded Chromium workflow using Playwright plus `@sparticuz/chromium`. The public fixture run performs a genuine observe, model-decide, validate, execute, recapture loop and returns a real screenshot. Arbitrary external targets and multi-minute scheduled sessions still require an isolated worker because they need durable execution, controlled egress, and longer timeouts.

## Model provider

The original contract specified Anthropic. The supplied credential is Groq, so the runnable MVP uses `llama-3.3-70b-versatile` through a server-only endpoint. Its output remains a proposal: deterministic code decides whether a browser action is allowed.

## Solana

Wallet ownership uses an expiring signed message. Public workflow proof uses the standard Memo program on Solana devnet and is paid and signed by the connected wallet. A server endpoint fetches and validates the transaction independently.
