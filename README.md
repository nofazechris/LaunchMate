# Launchmate

Online stores for sellers in Nigeria, with the technical work done for them. A seller answers a few questions, adds products and shares one link. Built for the Loops House *Agents Open for Business* hackathon on Celo.

**Live demo:** not deployed yet.

## What works today
Early access.

- Landing page, sign-up and sign-in, guided onboarding that saves the business
- Products with photos, naira prices and stock (every stock change is recorded)
- A public store at `/s/<store-name>`: product pages, cart and order requests
- A seller Orders page, and an Overview that lists what needs attention
- An operator page (`/admin/agent-vault`, locked by an owner token) for the Agent Vault integration

**Not built yet:** payments in the store, custom domains and a subdomain per store, email verification and password reset, customers, finances, and an AI agent. See [docs/ROADMAP.md](docs/ROADMAP.md).

## Hackathon status
Nothing is verified on Celo mainnet yet: this project has not sent a mainnet transaction.

| Item | State |
|---|---|
| **Agent Vault checkouts (the track being entered)** | Code built and unit-tested; read-only connection checked. No website sign-in or x402 payment made yet. [Notes](docs/hackathon/AGENT_VAULT.md) |
| ERC-8004 identity | Registration script ready, dry run passes. **Not registered.** [Notes](docs/hackathon/ERC8004.md) |
| Celo attribution tag (ERC-8021) | Added to every transaction the code can send; unit-tested. [Notes](docs/hackathon/ATTRIBUTION.md) |
| Self Agent ID payments | **Not claimed.** The access check exists in code, but the owner cannot complete Self's passport registration. [Notes](docs/hackathon/SELF_AGENT_ID.md) |
| Altana agentic wallets | **Not implemented, not entered** |
| Stablecoin Corridors (Textile FX) | **Not implemented, not entered** |

Full checklist: [docs/hackathon/COMPLIANCE.md](docs/hackathon/COMPLIANCE.md).

## Run it
Needs Node 20.9 or newer (developed on Node 24).

```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL, DATABASE_URL_UNPOOLED, BETTER_AUTH_SECRET
npm run db:migrate           # applies db/migrations to your Neon database
npm run dev
```

`npm run typecheck` and `npm run build` need no secrets.

The Agent Vault SDK is not on npm; `package.json` points to the file Agent Vault hosts. If your npm setup blocks remote files, see the note in [docs/DEPLOY.md](docs/DEPLOY.md).

## Tests
```bash
npm test               # no secrets and no network needed; live checks are skipped
npm run test:offline   # the same, with network access blocked to prove it
npm run test:live      # adds checks against Celo mainnet and Agent Vault (read-only, needs .env.local)
```

End-to-end checks of the product and storefront APIs are in `scripts/e2e/`. They need the dev server and a database, and create test accounts that `npm run e2e:cleanup` removes.

## Stack
Next.js 16 (App Router, TypeScript) · Neon PostgreSQL · Drizzle ORM · Better Auth · Zod · viem · a provider-agnostic AI interface (`lib/ai`, no provider chosen yet)

## Layout
- `app/` pages: landing, sign-in, onboarding, seller dashboard, public stores (`app/s/`), and `api/`
- `components/` interface
- `db/` schema and migrations
- `server/` and `lib/` business logic: authorization, products, orders, Celo, Agent Vault
- `tests/` and `scripts/` tests and command-line tools
- `docs/hackathon/` rules, track notes and evidence logs

## Rules we hold ourselves to
Money is stored as integer minor units with an explicit currency. Actions that spend money need an approval tied to the exact operation. No success is reported before the provider or chain confirms it. No secrets in the repository.
