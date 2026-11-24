# What is left to finish Launchmate

Honest as of 24 Nov 2026. "Real" means backed by the database and tested end to end.

## Real today
Landing page · account sign-up/sign-in · guided onboarding (saves progress on the device, then the business and your answers to the database) · Overview from real data · **Products** (add, edit, photos, stock with history, publish/archive/delete) · Domain setup with Agent Vault (owner token; needs a stored login and funded wallet to do real work) · session guards · tenant-safe business API.

## A. The product people will use (in order)
| # | Piece | Size | Needs from the owner |
|---|---|---|---|
| 1 | **Products**: add/edit with photos, price, stock; list and search. **Done (24 Nov)**: photos are stored in the database, resized in the browser (about 20 to 300 KB each). Move to R2 when volume grows or the public storefront needs a CDN | done | R2 credentials, later |
| 2 | **Public storefront** at `/s/<slug>` (home, product page, cart); later `<slug>.yourdomain` | L | The domain and Vercel wildcard setup |
| 3 | **Checkout and payments** with webhook-verified orders and stock deduction | L | Paystack account and keys |
| 4 | **Orders and fulfilment** screen, customer records | M | – |
| 5 | **Business agent**: free-text understanding, product extraction from text/photos, approvals before anything consequential | L | An AI provider key (provider is configurable) |
| 6 | **Account basics**: edit business profile, password reset, email verification | M | An email provider |
| 7 | **Finances**: sales, expenses, profit estimate by currency | M | – |

Rule while building: a screen only appears in the app once it runs on real data. No sample screens, no invented numbers.

## B. Hackathon (deadline 7 Dec 09:00 GMT)
1. About 0.062 CELO into the agent wallet, then `npm run erc8004:register` (dry run first).
2. About $3 USDC/USDT/USAT into the Agent Vault wallet, one stored website login, `config/agentvault-site.json`, then the sign-in and one paid Buy call on `/agent-vault`.
3. Deploy on Vercel (see `docs/DEPLOY.md`), real domain, entry fields: demo URL, video, screenshot, logo, description, X handles, payout wallet, agent wallet, ERC-8004 id.
4. **Named user** is 25% of the score. The owner chose not to name the merchant. Options that stay honest: ask the merchant again later, describe them without a name and accept the lost points, or use a different person who agrees to be named.
5. Reply to the AskBots review issues on the repo (4 Dec round).

## C. Before real customers
Tests for tenant isolation across every route · rate limiting on auth · security headers · error monitoring · database backups (and a separate Neon project from the other app's tables) · privacy policy and terms pages · accessibility pass.

## Suggested order for the next two weeks
1. Hackathon funding steps (B1, B2) the day the money is available.
2. Products (A1) then the public storefront (A2): this is what makes the product real to a merchant.
3. Deploy (B3) as soon as A2 exists, so the demo URL shows a real store.
4. Payments (A3) once the Paystack account is ready; the agent (A5) once an AI key exists.
