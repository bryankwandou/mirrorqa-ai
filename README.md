# MirrorQA AI

MirrorQA runs fixed synthetic-customer profiles against product journeys and keeps every friction finding tied to an observed step. This repository contains the public marketing site, evidence-first workspace, deterministic browser-action guardrail, live Groq decision endpoint, and Solana devnet proof workflow.

## Run locally

```bash
npm install
npm test
npm run type-check
npm run dev
```

Copy `.env.example` to `.env.local` and add `GROQ_API_KEY` to enable live agent decisions. Wallet ownership and Memo proofs are signed in Phantom or Solflare; no wallet private key is stored by the application.

Run `npm run test:production` to smoke-test the deployed Groq and wallet-signature APIs. Set `FULL_BROWSER_SMOKE=1` to include the production Chromium workflow and `SOLANA_PROOF_SIGNATURE` to verify a public devnet Memo receipt.

## Honest execution boundary

The public Vercel deployment demonstrates a real Groq-directed Playwright loop against the included live fixture, deterministic pre-action guardrail, signed-wallet ownership check, and independently verified Solana devnet Memo receipt. Arbitrary external targets and multi-minute scheduled runs still belong on an isolated worker with durable orchestration.
