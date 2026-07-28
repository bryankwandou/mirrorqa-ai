# Security

- Every proposed click or input must pass `validateActionAgainstSafetyGuardrail` immediately before execution.
- Payment completion controls and sensitive identity or financial inputs are blocked deterministically.
- Model credentials stay in server environment variables.
- Wallet private keys are never requested or transmitted; users sign with their installed wallet.
- Devnet receipts are verified from RPC data, not trusted from client claims.
- Production browser workers need per-run isolated contexts, egress controls, private evidence storage, and append-only audit events.
