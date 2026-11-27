# Deploying Launchmate on Vercel

## 1. Create the project
1. https://vercel.com/new → sign in → **Import** `nofazechris/LaunchMate`. The framework is detected as Next.js; leave the build settings alone.
2. Before the first deploy, add these **Environment Variables**. Values come from your own `.env.local` or the provider dashboards. **Never commit them.**

| Variable | Needed for | Value |
|---|---|---|
| `DATABASE_URL` | **Required.** Sign-up, dashboard, stores | The Neon **pooled** connection string (same one as in `.env.local`) |
| `BETTER_AUTH_SECRET` | **Required.** Sign-in | A new long random string, not your local one |
| `BETTER_AUTH_URL` | **Required.** Sign-in | The site's address, e.g. `https://your-project.vercel.app` (set it after the first deploy, then redeploy) |
| `DEMO_ADMIN_TOKEN` | `/admin/agent-vault` | New random string, 16+ characters. Without it the page's actions stay disabled |
| `SELF_AGENT_PAY_API_KEY` | Agent Vault | From Agent Vault → API keys |
| `SELF_AGENT_PAY_PROXY_URL` | Agent Vault | `wss://proxy.agentvault.io/v1` |
| `SELF_AGENT_PAY_API_URL` | Agent Vault | `https://api.agentvault.io` |
| `AV_MAX_PAYMENT_USD` | Spending ceiling | Optional, default `0.10` |

**Do NOT add `AGENT_PRIVATE_KEY` to Vercel.** The website never signs transactions; the ERC-8004 registration runs from your computer (`npm run erc8004:register`). Keeping the key off the host removes the biggest risk.

`DATABASE_URL_UNPOOLED` is only used to run migrations from your computer. The migrations are already applied to your database.

3. Deploy. The address Vercel gives you is the **demo URL**. Add it to the README ("Live demo"), to the GitHub repository's website field and to the hackathon entry.
4. Check it: create an account, add a product with a photo, open the store, and send an order request from a signed-out window.

The live site and your computer share one database if you use the same `DATABASE_URL`.

## 2. Custom domain (optional)
- Buy the domain at a registrar whose login is **email + password** (Porkbun, Namecheap, Name.com). Avoid ones that force an SMS code at every sign-in: the code always goes to you, not the agent.
- In Vercel → Project → Domains add the domain, then set `BETTER_AUTH_URL` to it and redeploy.
- Store the **registrar login in Agent Vault** (you type it in their dashboard). That is a real website the agent can sign in to for the demo. Read-only: no DNS changes by the agent without your approval.

## 3. What exists today
Stores are live at `<your-site>/s/<store-name>`. A subdomain per store (`merchant.yourdomain.com`) is **not built**, so do not tell anyone a store is available at a subdomain.

## Local note
`package.json` lists the Agent Vault SDK by URL so Vercel installs it. Some machines (including the development one) block remote tarballs: there, download the file, inspect it, install it with `npm install --no-save <path-to-tgz>`, and avoid other `npm install` runs.
