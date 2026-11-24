# Self Agent ID

**Status: Service gate implemented; DENIED path tested against mainnet. Nothing registered, SERVED path untested, nothing Verified.**

## Findings (https://docs.self.xyz/docs/agent-id/overview + registration-modes, read 24 Nov 2026)
- Binds an agent key to a human's passport proof on-chain via a **soulbound ERC-721** in Self's own registry (an ERC-8004 implementation with a Proof-of-Human extension). Celo mainnet registry: `0xaC3DF9ABf80d0F5c020C06B04Cced27763355944` (testnet registry is separate and accepts mock passports only; a real passport fails on testnet and vice versa).
- Human scans a QR in the **Self app** with their own passport; ZK proof is made on the phone; no personal data leaves it.
- An agent is verified when `hasHumanProof && isProofFresh`. Proofs expire at min(document expiry, registration + 365 days).
- Cap: 10 agents per human on mainnet; `SelfAgentVerifier` defaults to 1 per human unless configured.
- SDK: `@selfxyz/agent-sdk` (only official SDK). Verifier side: `SelfAgentVerifier` (.requireAge, .requireOFAC, .sybilLimit). REST: https://agent-api.self.xyz.
- Registration modes: `linked`, `wallet-free`, `privy`, `smartwallet` (server-generated EVM agent key, exportable), `ed25519`, `ed25519-linked`. The CLI defaults to **testnet**; SDK/A2A/MCP default to mainnet.
- **Nigeria (NG) is listed under "Full Support (DSC and CSCA)"** for e-passports (https://docs.self.xyz/docs/self-enterprise/reference/supported-countries/). This does not guarantee the owner's specific passport works; it must be a chip (NFC) e-passport.

## Implementation (24 Nov 2026)
- `lib/self/gate.ts` — `gateAgentRequest()`: reads the SDK's `SelfAgentVerifier.verify()` (signature recovery → registry read on Celo mainnet → proof freshness → provider → sybil → replay → rate limit). Fails **closed** on RPC errors/timeouts (8s). Policy: human-backed agents only, `sybilLimit(0)`, 30 req/min/agent.
- `app/api/services/enrich-product/route.ts` — order: (1) Self decision, (2) refuse if the service can't be delivered, (3) x402 payment via `withX402` (settles only if the handler returns <400). Unverified agents are denied and never shown a price.
- `tests/self-gate.test.ts` (real mainnet reads): unsigned → 401; validly signed but unregistered agent → denied (registry: "Agent not verified on-chain"); tampered body → denied; stalled/failing RPC → 503, never served.
- NOT tested: a registered human-verified agent being served and paying. That requires a real passport scan.
- Replay protection and rate limits are in memory per process (SDK limitation); fine for one instance, document if scaled.

## Answered: can our own wallet be the Self agent key?
No documented way. Every registration mode generates the agent key itself (`linked`, `wallet-free`, `privy`, `smartwallet` — server-generated, exportable via `exportKey()`) or uses an Ed25519 key. `new SelfAgent({privateKey})` signs with that exported key. **Plan: register with Self first, export the key, and make that address the single agent wallet** (ERC-8004 registration, tagged txs, x402 buyer). The wallet generated earlier (`0x387c…bB08`) is therefore probably superseded — **do not fund it**; confirm after the first real registration. `linked` mode lets the owner's own wallet own the NFT (owner can revoke); `wallet-free` makes the agent own it. Choose with the owner.

## Open questions
1. Does a Self-registry registration also satisfy the platform's "ERC-8004 agent ID" check, or must we also register at the Celo Identity Registry (`0x8004A169…`)? Plan for both until the platform's checklist says otherwise.
2. Which disclosure config (age / OFAC) to register with. OFAC can fail for non-passport documents; default age 0 unless a verifier needs more.

## Required from the owner (cannot be done by the agent)
Self app on a phone, the owner's real chip passport, and the owner scanning the QR themselves.

## Evidence log
| Date/time | Track | Task | Network / chain ID | Wallet | Tx hash | Provider confirmation | Outcome | Link | Counts? |
|---|---|---|---|---|---|---|---|---|---|
| _none yet_ | | | | | | | | | |
