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

## Honest execution boundary

The public Vercel deployment demonstrates the real model call, deterministic pre-action guardrail, signed-wallet ownership check, and independently verified Solana devnet Memo receipt. Multi-minute Playwright execution belongs on an isolated container worker with durable orchestration and is not represented as active in the Vercel demo.
