# Launchmate

AI business-building agent: describe a business, upload your own stock, get a real online store, and run it from one place. Built for the Loops House *Agents Open for Business* hackathon on Celo.

> **Honest status:** the dashboard screens are a working prototype on sample data. The database, auth and agent foundations exist but are not yet connected to the UI, and **no hackathon integration (ERC-8004, Self Agent ID, Agent Vault, x402) is implemented or verified yet.** See [IMPLEMENTATION_STATUS.md](IMPLEMENTATION_STATUS.md) and [docs/hackathon/COMPLIANCE.md](docs/hackathon/COMPLIANCE.md).

## Stack
Next.js 16 (App Router, TypeScript) · Neon PostgreSQL · Drizzle ORM · Better Auth · Zod · provider-agnostic AI layer (`lib/ai`) · Tailwind-free inline design tokens (prototype).

## Setup
```bash
npm install
cp .env.example .env.local   # fill DATABASE_URL, DATABASE_URL_UNPOOLED, BETTER_AUTH_SECRET
npm run db:migrate           # applies db/migrations to Neon
npm run dev
```
`npm run typecheck` and `npm run build` should pass without env vars.

## Layout
- `app/` routes (marketing/auth/onboarding/dashboard prototype, `api/`)
- `components/` UI + the prototype state provider
- `db/` Drizzle schema, generated Better Auth schema, migrations
- `server/` authorization (`requireBusinessAccess`: tenant isolation, 404 to non-members)
- `lib/ai/` provider interface + adapters (swap via `AI_PROVIDER` / `AI_MODEL`)
- `docs/hackathon/` rules compliance, tracks, evidence logs

## Rules we hold ourselves to
Money is integer minor units with an explicit currency. Consequential actions need an approval bound to the exact operation. No success is reported before the provider or chain confirms it. No secrets in the repo.
