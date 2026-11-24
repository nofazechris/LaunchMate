# Track selection

A project can win at most **two** tracks. We commit to two and do not dilute them.

| Track | Decision | Why |
|---|---|---|
| Self Agent ID — Verified Agent Payments | **Blocked** | Needs a chip passport; owner cannot obtain one before 7 Dec. Gate code kept; track not claimed unless organizers say otherwise |
| Agent Vault — Online & Onchain Checkouts | **Primary (switched 24 Nov)** | Website sign-in without seeing the password + a real x402 payment; no Self registration needed (pending organizer confirmation) |
| Altana Agent Wallets | Deferred | Needs a real onchain session-key; do not simulate caps in app code |
| Stablecoin Corridors (Textile FX) | Deferred | Needs a tagged mainnet cNGN conversion paid to an outside recipient |

Judging (published): Self Agent ID and Agent Vault — integration quality 30%, innovation/value 30%, named user + real job 25%, real use 15%.

## Before building each integration
Read the sponsor docs, identify SDK/API version, auth/approval needs, network/contracts, and what "success" means. Record findings in the track's evidence file. Nothing is to be invented: no SDK methods, endpoints or contract addresses that are not in official docs.

## Facts taken from the official event page (24 Nov 2026) — re-verify before use
- Celo mainnet only counts. Tag must be in every counted tx; x402 payments carry no tag, so register the PayTo address instead.
- Timeline: AskBots review 24 Nov and 4 Dec (posted as GitHub issues on our repo); submissions close 7 Dec 09:00 GMT.
