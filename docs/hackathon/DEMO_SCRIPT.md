# Demo video script (about 2 minutes)

Record only things that really happen. If a step fails on camera, keep it: an honest failure with a clear message is better than an edit that hides it. Do not show passwords, keys, `.env.local`, or the merchant's identity.

## Before recording (all real)
- App deployed (see docs/DEPLOY.md), with the real domain.
- Agent wallet registered on ERC-8004; transaction hash and 8004scan page ready to show.
- Agent Vault has one real website login stored and the wallet funded with a few dollars.
- Spending limit set on the Agent Vault agent card.

## Shots
1. **0:00 Landing page** (10s). Scroll the hero: "You bring the idea. We build the business." Say what it is in one sentence.
2. **0:10 Sign up and onboarding** (25s). Create an account, answer the guided questions, review the plan, create the business.
3. **0:35 Products** (20s). Add a product with a real photo, price and stock. Show it in the list and the stock history.
4. **0:55 Domain setup with Agent Vault** (40s). Open Domain setup. Check connection. Click sign in: show "Signed in … the agent never saw the password". Say what the agent sees (a placeholder), not the password.
5. **1:35 Paying within a limit** (25s). Pay one real Buy service by x402 with a small maximum. Show the approval and the resulting transaction hash.
6. **2:00 Proof** (15s). Show the ERC-8004 identity on 8004scan, and that the transaction carries the attribution tag.
7. **2:15 Honest close** (10s). "Early access: storefront and payments are next." Repo link on screen.

## Evidence to keep alongside the video
Transaction hashes (ERC-8004 registration, the x402 payment), the 8004scan link, the Agent Vault activity entry, and a screenshot of each real screen. Record them in docs/hackathon/AGENT_VAULT.md, ERC8004.md and ATTRIBUTION.md.
