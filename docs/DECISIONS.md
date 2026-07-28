# Architecture decisions

## Browser execution

Vercel hosts the web application and short-lived API requests. Real autonomous browser sessions require an isolated worker on a container platform because they can run for minutes, need Chromium, and must survive request timeouts. A production rollout should connect an Inngest orchestration function to that worker. The current public MVP does not disguise fixture screenshots as live captures.

## Model provider

The original contract specified Anthropic. The supplied credential is Groq, so the runnable MVP uses `llama-3.3-70b-versatile` through a server-only endpoint. Its output remains a proposal: deterministic code decides whether a browser action is allowed.

## Solana

Wallet ownership uses an expiring signed message. Public workflow proof uses the standard Memo program on Solana devnet and is paid and signed by the connected wallet. A server endpoint fetches and validates the transaction independently.
