# Hackathon compliance checklist

Status words: **Not started · In progress · Implemented (untested) · Verified** (independently confirmed on-chain / by provider). Nothing here is Verified yet.

## P0 — Eligibility
- [x] Public GitHub repo created and resolving — https://github.com/nofazechris/LaunchMate (checked 24 Nov 2026)
- [x] Event page reviewed — **Done 24 Nov 2026** (no event skill/install command is published on the page)
- [x] Hackathon enrolment — **Done by owner (solo dev)**
- [x] Attribution tag obtained — `celo_b02f2c0e5298` (confirmed against the platform via `loops project get`)
- [x] Tag wired into the single tx-construction path *before* first tx — **Implemented + unit-tested; not yet verified on mainnet**
- [ ] Celo mainnet config (chain 42220) — **Not started**
- [x] Agent wallet created securely — `0x387c6EE644f472569d773a4FA9bB047007B9bB08` (owner holds the key; **unfunded**, balance 0 CELO)
- [ ] ERC-8004 registration confirmed and independently verified on 8004scan — **Not started**
- [ ] x402 PayTo address registered (if selling a service) — **Not started**
- [x] Evidence docs started — this directory

## P1 — Self Agent ID (primary)
- [x] Docs read (overview, registration modes, supported countries) — **Done; 3 open questions in SELF_AGENT_ID.md**
- [ ] Human-owner verification established — **Not started** (owner's own ID)
- [x] Protected service whose access decision checks Self status — **Implemented** (`lib/self/gate.ts`, `app/api/services/enrich-product`); denied path tested on mainnet, served path untested
- [~] x402 payment gating — **Implemented (`withX402`, Celo facilitator), never exercised**: needs PayTo address, facilitator API key, funded buyer
- [ ] Allowed case tested — **Not started** (needs a registered, human-verified agent); [x] denied case tested — **Done** (4 tests, real mainnet registry reads)

## P2 — Agent Vault (secondary)
- [ ] Docs read: https://docs.agentvault.io/ — **Not started**
- [ ] Real website sign-in through Agent Vault, agent never sees password/card — **Not started**
- [ ] Real x402 payment — **Not started**

## P3 Altana / P4 Textile FX — deliberately deferred (see AUDIT.md §3)

## P5 — Real user
- [ ] Named merchant outside the team completes a real task — **Not started**

## Rules that constrain how we build (enforced in code review)
No mock presented as real · no success message before provider/chain confirms · no untagged tx claimed as qualifying · no self-funded users · no secrets in repo · human approval for consequential actions (approval rows bind to exact operation via `agent_approvals.parameters_hash`).
