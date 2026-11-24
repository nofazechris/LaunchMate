# Deploying Launchmate on Vercel

## 1. Create the project
1. https://vercel.com/new → sign in → **Import** `nofazechris/LaunchMate`. Framework is detected as Next.js; leave build settings alone.
2. Before the first deploy, add the **Environment Variables** below (Project → Settings → Environment Variables). Values come from your own `.env.local` or the provider dashboards. **Never commit them.**

| Variable | Needed for | Notes |
|---|---|---|
| `DEMO_ADMIN_TOKEN` | `/admin/agent-vault` page + routes | 16+ chars. Without it those routes are disabled (safe default). Use a NEW random value for production, not your local one. |
| `SELF_AGENT_PAY_API_KEY` | Agent Vault | From Agent Vault → API keys. Server secret. |
| `SELF_AGENT_PAY_PROXY_URL` | Agent Vault | `wss://proxy.agentvault.io/v1` |
| `SELF_AGENT_PAY_API_URL` | Agent Vault | `https://api.agentvault.io` |
| `AV_MAX_PAYMENT_USD` | spending ceiling | optional, default `0.10` |
| `ATTRIBUTION_CODE` | tagged transactions | `celo_b02f2c0e5298` (public) |
| `BETTER_AUTH_SECRET` | auth routes | `openssl rand -base64 32`. Avoids a runtime error on `/api/auth`. |

**Do NOT add `AGENT_PRIVATE_KEY` to Vercel.** The website never signs transactions; the ERC-8004 registration runs from your computer (`npm run erc8004:register`). Keeping the key off the host removes the biggest risk.

Not needed yet: `DATABASE_URL*` (the database is not connected to the UI yet).

3. Deploy. Visit `/` (the landing page) and `/admin/agent-vault` (real, locked by the owner token). That URL is your **Demo URL** for the entry.

## 2. Domain + merchant subdomains
- Buy the domain at a registrar whose login is **email + password** (Porkbun, Namecheap, Name.com). Avoid ones that force an SMS code at every sign-in: the code always goes to you, not the agent. Don't buy it *through* Vercel for this demo (Vercel sign-in is usually GitHub OAuth, which Agent Vault can't fill).
- In Vercel → Project → Domains add `yourdomain.com` **and** `*.yourdomain.com`. Per Vercel's docs a wildcard needs DNS challenge access: switch the domain's **nameservers** to the ones Vercel shows (or delegate `_acme-challenge` to Vercel).
- Store the **registrar login in Agent Vault** (you type it in their dashboard). That same login is the real website the agent signs into for the hackathon demo: *"Launchmate's agent signs into the merchant's registrar to confirm the domain is registered and pointing at the store."* Read-only; no DNS changes by the agent without your approval.

## 3. What the domain does today vs later
- **Today:** the apex serves this app. `*.yourdomain.com` will reach it too, but **per-merchant storefronts are not built**: the store screens are a preview prototype. Do not tell anyone a merchant store is live at a subdomain until it is.
- **Later:** host-header routing (`merchant.yourdomain.com` → that merchant's storefront), the real storefront renderer, database-backed businesses (Neon).

## Local note
`package.json` lists the Agent Vault SDK by URL so Vercel installs it. Some machines (including this one) block remote tarballs: there, install the inspected tarball with `npm install --no-save <path-to-tgz>` and avoid other `npm install` runs.
