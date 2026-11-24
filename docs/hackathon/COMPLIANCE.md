# Hackathon compliance checklist

Status words: **Not started · In progress · Implemented (untested) · Verified** (independently confirmed on-chain / by provider). Nothing here is Verified yet.

## P0 — Eligibility
- [ ] Public GitHub repo created and resolving — **Not started** (no git repo yet; owner action)
- [ ] Event page reviewed — **Done 24 Nov 2026** (no event skill/install command is published on the page)
- [ ] Hackathon enrolment — **Not started** (owner action; issues the attribution tag)
- [ ] Attribution tag obtained — **Not started** (blocked on enrolment)
- [ ] Tag wired into the single tx-construction path *before* first tx — **Not started** (see ATTRIBUTION.md)
- [ ] Celo mainnet config (chain 42220) — **Not started**
- [ ] Agent wallet created securely — **Not started** (owner holds keys)
- [ ] ERC-8004 registration confirmed and independently verified on 8004scan — **Not started**
- [ ] x402 PayTo address registered (if selling a service) — **Not started**
- [x] Evidence docs started — this directory

## P1 — Self Agent ID (primary)
- [ ] Docs read: https://docs.self.xyz/docs/agent-id/overview — **Not started**
- [ ] Human-owner verification established — **Not started** (owner's own ID)
- [ ] Protected service whose access decision checks Self status — **Not started**
- [ ] x402 payment gating — **Not started**
- [ ] Allowed case tested — **Not started**; denied case tested — **Not started**

## P2 — Agent Vault (secondary)
- [ ] Docs read: https://docs.agentvault.io/ — **Not started**
- [ ] Real website sign-in through Agent Vault, agent never sees password/card — **Not started**
- [ ] Real x402 payment — **Not started**

## P3 Altana / P4 Textile FX — deliberately deferred (see AUDIT.md §3)

## P5 — Real user
- [ ] Named merchant outside the team completes a real task — **Not started**

## Rules that constrain how we build (enforced in code review)
No mock presented as real · no success message before provider/chain confirms · no untagged tx claimed as qualifying · no self-funded users · no secrets in repo · human approval for consequential actions (approval rows bind to exact operation via `agent_approvals.parameters_hash`).
