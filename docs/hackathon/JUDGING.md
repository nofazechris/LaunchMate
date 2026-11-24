# Judging criteria → what we must prove

Published weights (Self Agent ID and Agent Vault tracks): integration quality 30% · innovation/value 30% · named user + real job 25% · real use 15%. A project that misses a track's mandatory requirement is not scored in that track. Status as of 24 Nov 2026 — nothing below is Verified yet.

## Primary: Self Agent ID — Verified Agent Payments
Mandatory: ERC-8004 identity · a service where the Self human-proof check changes who is served/paid/limited · x402 payments on Celo mainnet · Self agentId (mainnet).

| Criterion | What a judge needs to see | Where we are |
|---|---|---|
| Quality of integration (30%) | Self check is central, works on mainnet, judge can reproduce from README. Link to the **file and line** of the check (the entry form asks for it). | Check implemented: `lib/self/gate.ts` (`gateAgentRequest`) called first in `app/api/services/enrich-product/route.ts`. **Tested for DENIED only** (real mainnet registry reads). SERVED path untested — needs a real registered agent. |
| Innovation / value (30%) | One or two sentences: what the agent does, for whom, what Self makes possible. | Draft: *Launchmate sells product-copy enrichment only to human-backed agents, so a merchant's store agent can buy it pay-per-request without accounts, and abuse is capped per real person.* Needs the owner's agreement. |
| Named user + real job (25%) | A named person/business outside the team, the job done, time/money saved, where users and volume came from. | **Nothing yet.** Cannot be created by us. Needs a real merchant. |
| Real use (15%) | x402 payments made/received during the window; paid calls to services on buy count in our favour. | **Nothing yet.** Needs funded buyer + settled payments. |

## Secondary: Agent Vault — Online & Onchain Checkouts
Mandatory: Agent Vault sign-in (or checkout) on a real website without the agent seeing the password/card, within a spending rule, plus an x402 payment on Celo. Not started — Agent Vault account/SDK access needed. Entry field: x402 tx hash, website(s), spending rule.

## Required on every entry (from the platform's own field list)
Agent wallet · payout wallet · ERC-8004 agent ID · Self agentId · attribution tag (`celo_b02f2c0e5298`, done) · named user · team contacts · X handles · follow @Celo/@CeloDevs · repo URL · demo URL · video · screenshot · logo · tagline · description. Agent-Vault and Self tracks also want a public X post tagging @selfxyz and @Celo.

## Honesty rules (these protect us in review)
- Denied-case tests prove the gate refuses; they are not evidence of a served, paid request.
- x402 payments carry no attribution tag; the PayTo address is what gets counted, so register it.
- No fabricated users, volume or transactions; wallets we fund do not count as independent users.
