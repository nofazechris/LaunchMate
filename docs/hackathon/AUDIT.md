# Implementation audit — 24 Nov 2026

Source of truth for rules: https://www.loops.house/agents-open-for-business (read 24 Nov 2026). Track pages and sponsor docs still need to be read before each integration (see TRACKS.md).

## 1. What exists
- Next.js 16 (App Router, TypeScript) port of the Claude Design prototype: sign-up, onboarding chat, simulated build, dashboard (overview, world, store, products, orders, finances, agent, activity, permissions).
- **All of that UI runs on static in-memory sample data.** None of it is backed by a database, auth or a real integration. It is a prototype, not product.
- Foundation added this session (written and type-checked, **not yet run against a database**): Neon + Drizzle schema and first migration, Better Auth config + route, tenant-scoped authz helper, `POST/GET /api/businesses`, provider-agnostic AI interface + one OpenAI-compatible adapter (untested), `.env.example`.
- No Supabase anywhere. No git repository yet.

## 2. Missing per hackathon rule
| Rule | State |
|---|---|
| 1 Celo mainnet (42220) | No chain code yet |
| 2 ERC-8004 registration | Not started. Needs agent wallet + gas on Celo mainnet |
| 3 Self Agent ID | Not started. Docs not yet read; country/ID support unchecked |
| 4 Public GitHub repo | **No repo.** Required at registration |
| 5 Attribution tag | **Not obtained.** Issued on enrollment; must be wired before first tx |
| 6 Code written from 20 Nov | All code so far is from 24 Nov. Needs git history to prove it |
| 7 Sponsored gas | N/A until a relayer is used |
| 8 Independent users | None. Requires a real merchant outside the team |
| 9 buy marketplace | Optional, not started |

## 3. Realistic tracks
- **Primary — Self Agent ID:** realistic *if* Self SDK access works and a human completes Self verification. Needs a real protected service + x402 payment.
- **Secondary — Agent Vault:** realistic, depends on Agent Vault access (page offers 3 months of Plus after enrolling) and one real website sign-in + x402 payment.
- **Altana / Textile FX:** deprioritised. The brief says do not dilute the two primary integrations; a project can win at most two tracks. Revisit only if P1/P2 are done.

## 4. Credentials / external access needed (only the owner can provide)
1. Enrol on the hackathon page (issues the attribution tag; needs the public repo URL).
2. Neon project: `DATABASE_URL` (pooled) and `DATABASE_URL_UNPOOLED`.
3. `BETTER_AUTH_SECRET`.
4. An AI provider + key (not chosen; interface is ready).
5. A Celo agent wallet, funded with a small amount of CELO/stablecoin by the owner — keys held by the owner, never pasted into chat or committed.
6. A Self identity verification by the human owner (their own document, their own device).
7. Agent Vault account/SDK access.
8. R2/S3 bucket, Paystack account, email provider (core product, later).

## 5. Can be done now vs blocked
- **Now (no external access):** repo hygiene, schema, authz, approvals model, product intake logic, storefront renderer, x402/Self adapter *boundaries*, docs.
- **Blocked on owner:** anything touching Neon, AI, Celo mainnet, Self, Agent Vault, enrolment.

## 6. Highest-risk blockers
1. Enrolment + public repo (tag must exist before the first mainnet tx).
2. Self Agent ID needs the owner's real identity verification — cannot be delegated or simulated.
3. "Named real user outside the team" is 25% of every track and cannot be manufactured.
4. 13 days remain (submission closes 7 Dec 09:00 GMT) against a very large product spec.

## 7. Order for remaining time
P0 eligibility (repo, enrol, tag, wallet, ERC-8004) → DB live + auth + real onboarding persisted → protected service + Self check + x402 (P1) → Agent Vault sign-in + x402 (P2) → one real merchant, real products, real order (P5) → README/evidence/demo (P6). Textile/Altana only with spare time.
