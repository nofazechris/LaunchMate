# What Launchmate is

**A store builder for Nigerian sellers that handles the technical part for them.** Think of it as what Shopify would be if it were built for a first-time seller in Lagos: naira first, phone first, and nobody has to configure anything.

## Principles (these decide what goes in the interface)
1. **The seller never needs to know how it works.** No "agent", "wallet", "DNS", "x402", "vault" or "API" in the seller's screens. Plain words: *your store, your address, your products, needs your attention.*
2. **We do the technical work; they do the deciding.** Setting up a domain, connecting a store, signing in to a registrar: that is our job, done for them. Anything that costs money or goes public waits for their clear yes, with the exact amount shown.
3. **Launchmate watches so they don't have to.** The seller opens one page and sees what needs them (low stock, missing price, missing photo). Real checks on real data, never invented.
4. **Only real things appear.** A screen exists only when it runs on real data. Anything not built says "Coming soon" or is not shown. No sample numbers, no fake activity.
5. **Honest about being early.** The landing page says what works today and what is still being built.

## Where the technical machinery lives (kept out of sight, kept for the record)
| Behind the scenes | Seller sees | Where in the repo |
|---|---|---|
| Secure sign-in through Agent Vault (passwords never seen) and x402 payments from its wallet, under a hard spending ceiling and with approval | "We set up your domain. You approve the price." | `lib/agentvault/`, operator console at `/admin/agent-vault` (owner token required) |
| ERC-8004 identity and tagged Celo transactions | nothing | `lib/chain/celo.ts`, `scripts/register-erc8004.mjs` |
| Self Agent ID gate for a paid service (the Self track is blocked for the owner: no chip passport) | nothing | `lib/self/gate.ts`, `app/api/services/enrich-product` |
| Stock movement ledger, tenant isolation, approvals table | "10 in stock", "needs your attention" | `app/api/products/**`, `db/schema.ts` |

The hackathon requirements are met in the machinery and shown in the demo video and docs, not in the seller interface.

## What is real today
Account, setup in a few questions, products with photos and stock, "needs your attention" from real data, a public store customers can browse, a cart and order requests with a seller Orders page (WhatsApp, fulfil updates stock), open/close control, and a store-address page that saves the domain the seller wants.

## What is not built yet (do not imply otherwise)
Card payments in the store (orders are requests: nobody is charged), customers list, finances, a subdomain per store, automatic domain purchase and setup, email/WhatsApp alerts. See docs/ROADMAP.md.
