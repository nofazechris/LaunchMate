# Implementation status (24 Nov 2026)

Statuses: Designed · Implemented · Configured · Tested · Production verified. "Tested" means run end-to-end, not type-checked.

| Feature | Status | Tested | Blocker |
|---|---|---|---|
| Prototype UI (all screens, static data) | Implemented | Click-through in browser | Not real product; no persistence |
| Neon database + Drizzle schema + migration `0000` | Implemented | Migration generated; **never applied** | Needs `DATABASE_URL` |
| Authentication (Better Auth on Neon) | Implemented (server only) | No | Needs DB + `BETTER_AUTH_SECRET`; sign-up screen not wired to it |
| Business workspace API (`/api/businesses`) | Implemented | No | Needs DB + auth |
| Tenant authz helper | Implemented | No | Needs DB; cross-business test not written |
| AI provider abstraction | Implemented | No | No provider/key chosen |
| AI agent, onboarding extraction, tools | Not started | – | AI provider |
| Product intake (text/voice/photo) | Not started | – | AI provider, object storage |
| Store generation, editor, hosted subdomain | Not started | – | – |
| Paystack, orders, webhooks | Not started | – | Paystack account |
| Domains | Not started | – | Registrar access |
| Finance | Not started | – | – |
| ERC-8004 | Not started | – | Enrolment, wallet, gas |
| Self Agent ID | Not started | – | Owner verification |
| Agent Vault | Not started | – | Account/SDK access |
| x402 | Not started | – | Wallet, PayTo registration |
| Celo attribution | Implemented | Unit-tested (signed tx calldata decoded); not verified on mainnet | First mainnet tx (tag itself confirmed by platform) |
| Textile FX / Altana | Deferred | – | – |

Hackathon-specific status lives in `docs/hackathon/COMPLIANCE.md`.
