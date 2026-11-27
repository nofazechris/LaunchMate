# Implementation status (27 Nov 2026)

Statuses: Designed · Implemented · Configured · Tested · Production verified. "Tested" means run end-to-end, not type-checked.

| Feature | Status | Tested | Blocker |
|---|---|---|---|
| Landing page (/) | Real: story sections, scroll-driven 3D, FAQ; features labelled Available / In progress | Browser, every section | – |
| Onboarding (guided flow, not AI) | Real: one question at a time, live plan and 3D plot, review step, progress saved on the device, then saved to Neon | Browser end to end (steps, skip, refresh-restore, create, redirect) | AI key for free-text understanding |
| Overview | Real: business summary, "needs your attention" computed from real products (out of stock, low stock, no price, no photo, no address choice), plain-language next steps | Browser and 20+ route checks | Alerts are shown on page load; email/WhatsApp alerts are not built |
| Domain (seller page) | Real: shows the reserved free address, saves the domain the seller wants (cleaned and validated). Automatic domain purchase and setup are NOT built | Route checks, validator unit tests | Registrar integration |
| Phone layout | Real: sidebar becomes a bottom tab bar under 820px; checked at 375px | Browser | – |
| Operator console (/admin/agent-vault) | Real but internal: Agent Vault sign-in and capped x402 payment. Hidden from sellers; needs an owner token | 16 unit tests + live read-only calls; no sign-in/payment yet | Stored login + funded wallet |
| Products | Real: create/edit, price in integer kobo, photos (JPG/PNG/WebP only, resized in the browser, stored in Neon), stock changed only by recorded movements, status draft/published/archived, search and filter | 37 end-to-end API checks against the real database (price exactness, 15 parallel stock removals never negative, fake/oversized/7th images refused, another user gets 404 on everything) plus UI run in the browser; 21 unit tests | Photos live in the database for now; move to object storage later |
| Public storefront (/s/<slug>) | Real: home, product pages with photo gallery, cart in the visitor's browser, order request checkout. Closed stores are invisible to the public; the owner sees a preview. The open/closed check runs in every page (a layout cannot hide page data in Next.js: found and fixed by the test) | Browser + storefront end-to-end script against the real database | Not yet on a custom domain or subdomain |
| Orders (seller) | Real: order requests with server-computed totals, WhatsApp link, status flow new → contacted → fulfilled/cancelled; fulfilling takes stock out atomically and all-or-nothing | End-to-end script | No payments yet: nobody is charged, the seller arranges payment |
| Payments, customers, finances, business agent | Not built. Nothing fake is shown | – | Paystack account |
| Neon database + Drizzle schema | Migrations `0000`–`0002` applied | Used by the end-to-end scripts | – |
| Authentication (Better Auth on Neon) | Real sign-up, sign-in and session guard | Browser and end-to-end scripts | Email verification and password reset need an email provider |
| Business workspace API (`/api/businesses`) | Real | Browser onboarding and end-to-end scripts | – |
| Tenant isolation | Every seller route is scoped to the signed-in owner's business | End-to-end scripts: another user gets 404 | – |
| AI provider abstraction | Implemented | No | No provider/key chosen |
| AI agent, onboarding extraction, tools | Not started | – | AI provider |
| Product intake (text/voice/photo) | Not started | – | AI provider, object storage |
| Store design editor, subdomain per store | Not built (stores live at `/s/<slug>`) | – | Domain |
| Paystack payments and webhooks | Not built | – | Paystack account |
| Domains | Not started | – | Registrar access |
| Finance | Not started | – | – |
| ERC-8004 | Implemented (script + agent file) | Dry run vs real registry; nothing sent | ~0.062 CELO gas in agent wallet |
| Self Agent ID (service gate; track not claimed) | Implemented | Offline tests plus an opt-in live registry check; the served path with a real agent is untested | Chip passport |
| Agent Vault | Implemented (module, routes, page) | 16 tests; live read-only calls; no sign-in or payment yet | Stored website login; ~$3 stablecoin in Agent Vault wallet |
| x402 seller | Implemented (`withX402`) | Not exercised | PayTo address, facilitator API key, funded buyer |
| Celo attribution | Implemented | Unit-tested (signed tx calldata decoded); not verified on mainnet | First mainnet tx (tag itself confirmed by platform) |
| Textile FX / Altana | Not implemented, not entered | – | – |

Hackathon-specific status lives in `docs/hackathon/COMPLIANCE.md`.
