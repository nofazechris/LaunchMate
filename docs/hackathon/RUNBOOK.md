# Funding-day runbook (what is built, what is left)

Everything below is already built and tested **without money**. Each step shows what it needs.
Nothing here is Verified until a real transaction exists. Keep secrets in `.env.local` only.

## Already done (no money needed)
- Agent Vault module (`lib/agentvault/client.ts`): sign-in through the vault, x402 payment to Buy routes with a hard USD ceiling (`AV_MAX_PAYMENT_USD`, default $0.10), honest outcomes. 16 tests pass; the live ones talk to the real Agent Vault (read-only).
- Page `/agent-vault` + routes `/api/agentvault/{status,signin,pay}`, locked by `DEMO_ADMIN_TOKEN` (generated in your `.env.local`). Pay requires you to tick an approval for the exact amount; the route re-checks it.
- ERC-8004: `public/agent.json` (live on GitHub raw), `npm run erc8004:register` — dry run passes against the real registry.
- Attribution tag wired into the single wallet client.

## Step A — needs ~0.062 CELO in the agent wallet (gas only)
1. Send CELO (Celo network) to `0x387c6EE644f472569d773a4FA9bB047007B9bB08` (check first/last 4 characters).
2. `npm run erc8004:register` (dry run, must say "enough").
3. `npm run erc8004:register -- --send`, type `register`. It sends a **tagged** tx, reads the agentId from the event, decodes the tag back from the mined tx, saves `ERC8004_AGENT_ID`, appends `docs/hackathon/evidence.jsonl`.
4. Check https://8004scan.io for the address. Put the agentId in the platform entry.

## Step B — needs nothing: finish the sign-in setup
1. In the Agent Vault dashboard add ONE real website login (your own account) and give the API key access to it. Add an email to the login.
2. Copy `config/agentvault-site.example.json` to `config/agentvault-site.json` and fill in that site's selectors (inspect its sign-in page).
3. `npm run av:check` should now list the login. Run the app (`npm run dev`), open `/agent-vault`, **Sign in with Agent Vault**. Expect "Signed in … agent never saw the password". Rejected / needs-you / inconclusive are reported as such, never as success.

## Step C — needs ~$3 of USDC/USDT/USAT on Celo in the Agent Vault wallet
1. Fund the wallet from the Agent Vault dashboard (Receive → address). No CELO needed.
2. In its Marketplace tab pick a cheap `buy` service that helps the domain task; paste its URL on `/agent-vault`, keep max ≤ $0.10, tick the approval, **Pay**. Approve the seller in the dashboard when asked.
3. Record the transaction hash, network, amount and service in `docs/hackathon/AGENT_VAULT.md` and the platform field "Agent Vault track details" (x402 tx hash, website(s), spending rule).

## Still missing for the platform entry (not code)
Demo URL (deploy, e.g. Vercel — also set `SELF_AGENT_PAY_*`, `DEMO_ADMIN_TOKEN`, install the SDK on the host) · walkthrough video · screenshots · logo · description/tagline · named user + real job · team contacts · X handles · follow @Celo/@CeloDevs · payout wallet · public X post tagging @selfxyz and @Celo · agent wallet field (`0x387c…bB08`).

## Gotchas
- `npm install <anything>` prunes the Agent Vault SDK (installed with `--no-save`). Reinstall: see `.env.example`.
- The Agent Vault wallet is custodial and can't sign the ERC-8004 tx; that is why the identity uses our own wallet. Admins have not yet answered whether that split is accepted.
