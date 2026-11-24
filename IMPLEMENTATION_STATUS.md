# Implementation status (24 Nov 2026)

Statuses: Designed · Implemented · Configured · Tested · Production verified. "Tested" means run end-to-end, not type-checked.

| Feature | Status | Tested | Blocker |
|---|---|---|---|
| Landing page (/) | Real: story sections, scroll-driven 3D, FAQ; features labelled Available / In progress | Browser, every section | – |
| Onboarding (guided flow, not AI) | Real: one question at a time, live plan and 3D plot, review step, progress saved on the device, then saved to Neon | Browser end to end (steps, skip, refresh-restore, create, redirect) | AI key for free-text understanding |
| Overview | Real: shows your business from the database, honest next steps, no fake figures | Browser | – |
| Products, storefront, orders, finances, agent | Not built. The old sample screens were deleted so nothing fake remains | – | See docs/ROADMAP.md |
| Neon database + Drizzle schema + migration `0000` | Implemented | Migration generated; **never applied** | Needs `DATABASE_URL` |
| Authentication (Better Auth on Neon) | Implemented end to end in code: real /signup and /signin, session guard on onboarding and dashboard | Redirects verified; sign-up needs the database | `DATABASE_URL` (Neon) + `npm run db:migrate` |
| Business workspace API (`/api/businesses`) | Implemented | No | Needs DB + auth |
| Tenant authz helper | Implemented | No | Needs DB; cross-business test not written |
| AI provider abstraction | Implemented | No | No provider/key chosen |
| AI agent, onboarding extraction, tools | Not started | – | AI provider |
| Product intake (text/voice/photo) | Not started | – | AI provider, object storage |
| Store generation, editor, hosted subdomain | Not started | – | – |
| Paystack, orders, webhooks | Not started | – | Paystack account |
| Domains | Not started | – | Registrar access |
| Finance | Not started | – | – |
| ERC-8004 | Implemented (script + agent file) | Dry run vs real registry; nothing sent | ~0.062 CELO gas in agent wallet |
| Self Agent ID (service gate) | Implemented | Denied path tested (mainnet reads); served path not | Owner passport scan to create a registered agent |
| Agent Vault | Implemented (module, routes, page) | 16 tests; live read-only calls; no sign-in or payment yet | Stored website login; ~$3 stablecoin in Agent Vault wallet |
| x402 seller | Implemented (`withX402`) | Not exercised | PayTo address, facilitator API key, funded buyer |
| Celo attribution | Implemented | Unit-tested (signed tx calldata decoded); not verified on mainnet | First mainnet tx (tag itself confirmed by platform) |
| Textile FX / Altana | Deferred | – | – |

Hackathon-specific status lives in `docs/hackathon/COMPLIANCE.md`.
