# Agent Vault + x402 (now the PRIMARY track)

**Status (24 Nov 2026): integration BUILT and tested without money; no website login stored yet, no sign-in run, wallet unfunded, no payment made. Nothing Verified.** See RUNBOOK.md for the remaining steps.

**SDK install note:** `@agentvault/playwright` 0.0.1 is not on npm; Agent Vault hosts a tarball, which `package.json` lists by URL. The tarball was downloaded and inspected (no install scripts; deps `playwright-core`, `ws`; no process-spawning/eval). This machine's npm refuses remote tarballs, so here it is installed with `npm install --no-save` from the inspected file. Env vars: `SELF_AGENT_PAY_API_KEY`, `SELF_AGENT_PAY_PROXY_URL=wss://proxy.agentvault.io/v1`, `SELF_AGENT_PAY_API_URL=https://api.agentvault.io`. Check: `npm run av:check` (read-only `listTokens()`).

Why primary: the owner cannot get a chip passport before 7 Dec, so the Self Agent ID track is not winnable as planned (see SELF_AGENT_ID.md). Agent Vault has the same prizes and judging weights and does not require a Self registration (open question below).

## What Agent Vault is (https://docs.agentvault.io, a product of Self Labs)
- A vault holds the user's logins/cards. The agent only ever sees placeholder **tokens**; a proxy types the real value into the page at fill time. CAPTCHAs / 3-D Secure / SMS codes are handed to the human.
- Integrations: hosted **MCP server** (OAuth sign-in, no API key; 29 tools), self-run MCP (API key), **Playwright SDK** `@agentvault/playwright` (TypeScript, Node 20+, hosted tarball, API key), plain HTTP API.
- **Sign-in flow:** login must exist in the vault with its website set (the account holder adds it); agent calls `get_token_catalog` / `tokensForUrl`, fills `tokens.email` + `tokens.password` (+ `tokens.totp`), then confirms with `get_session_outcome` (never trust "nothing happened").
- **Wallet (x402):** Agent Vault creates and **holds the key** for an on-chain agent wallet on **Celo mainnet** (custodial; payments final; real funds). Fund with USDC / USDT / USAT; no CELO needed. It pays **x402 services on the `buy` marketplace only (not website checkouts)** via MCP `pay_request`, SDK `payRequest`, or `POST /v1/wallet/pay`. Agent cards set spend caps, merchant rules and an approval amount; the owner can approve each payment and withdraw.

## Plan for Launchmate
Real task for a merchant: **domain setup**. Launchmate's agent signs in to the merchant's registrar account through Agent Vault (merchant adds the login to the vault themselves; we never see the password) and checks domain availability/price; it also pays a real `buy` service by x402 from the Agent Vault wallet within a spending rule. Matches product spec Part 9 / 21.2. No card purchase required (optional; keep tiny).

## Only the owner can do (accounts, credentials, money)
1. Create an Agent Vault account (https://app.agentvault.io); enrolled projects get 3 months of Agent Vault Plus (per event page; confirm how to claim).
2. Add a real website login to the vault (their own credentials, typed into the dashboard).
3. Set up the Agent Vault wallet and fund it with a few dollars of USDC/USDT/USAT on Celo; set an agent card spending rule.
4. Create an API key (server secret) for the Playwright SDK, or connect the hosted MCP.

## Open questions for organizers (1 answered, 1 open)
1. ~~Is the Self Agent ID form field required on an Agent Vault entry?~~ **Answered by the admins 24 Nov 2026:** not required; only for the Verified Agent Payments (Self) track. Confirmed on the platform: `loops project fields` now shows `required: false` and it is no longer in `missing`.
2. The Agent Vault wallet is **custodial** (cannot sign ERC-8004 registration or tagged txs). Is it acceptable that x402 payments come from the Agent Vault wallet while the entry's *agent wallet* / ERC-8004 identity is a separate self-held wallet (`0x387c6EE644f472569d773a4FA9bB047007B9bB08`)?

## Evidence log
| Date/time | Track | Task | Network / chain ID | Wallet | Tx hash | Provider confirmation | Outcome | Link | Counts? |
|---|---|---|---|---|---|---|---|---|---|
| _none yet_ | | | | | | | | | |
