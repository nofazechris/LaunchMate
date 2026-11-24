# Launchmate

AI business-building agent: describe a business, upload your own stock, get a real online store, and run it from one place. Built for the Loops House *Agents Open for Business* hackathon on Celo.

> **Honest status:** early access. Real today: landing page, sign-up/sign-in, guided onboarding that saves your business to Neon, Overview with a live "needs your attention" list, Products (photos and stock), a store-address page, and an internal operator console for the Agent Vault integration (see docs/PRODUCT.md for the positioning: sellers never see the technical side). Storefront, payments and the business agent are not built yet; see [docs/ROADMAP.md](docs/ROADMAP.md). No hackathon integration is *Verified* until a real mainnet transaction exists: see [docs/hackathon/COMPLIANCE.md](docs/hackathon/COMPLIANCE.md).

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
