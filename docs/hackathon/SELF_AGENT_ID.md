# Self Agent ID

**Status: Researched only. Nothing registered, nothing verified.**

## Findings (https://docs.self.xyz/docs/agent-id/overview + registration-modes, read 24 Nov 2026)
- Binds an agent key to a human's passport proof on-chain via a **soulbound ERC-721** in Self's own registry (an ERC-8004 implementation with a Proof-of-Human extension). Celo mainnet registry: `0xaC3DF9ABf80d0F5c020C06B04Cced27763355944` (testnet registry is separate and accepts mock passports only; a real passport fails on testnet and vice versa).
- Human scans a QR in the **Self app** with their own passport; ZK proof is made on the phone; no personal data leaves it.
- An agent is verified when `hasHumanProof && isProofFresh`. Proofs expire at min(document expiry, registration + 365 days).
- Cap: 10 agents per human on mainnet; `SelfAgentVerifier` defaults to 1 per human unless configured.
- SDK: `@selfxyz/agent-sdk` (only official SDK). Verifier side: `SelfAgentVerifier` (.requireAge, .requireOFAC, .sybilLimit). REST: https://agent-api.self.xyz.
- Registration modes: `linked`, `wallet-free`, `privy`, `smartwallet` (server-generated EVM agent key, exportable), `ed25519`, `ed25519-linked`. The CLI defaults to **testnet**; SDK/A2A/MCP default to mainnet.
- **Nigeria (NG) is listed under "Full Support (DSC and CSCA)"** for e-passports (https://docs.self.xyz/docs/self-enterprise/reference/supported-countries/). This does not guarantee the owner's specific passport works; it must be a chip (NFC) e-passport.

## Open questions (must be answered from the SDK docs before registering)
1. Self's `linked`/`wallet-free` modes **generate the agent's EVM key server-side**. The hackathon needs ONE agent wallet that also holds the ERC-8004 identity. Can Self register an existing key (our `0x387c…`), or must we adopt the Self-generated (exportable) key as the agent wallet? Decide before funding or registering anything irreversible.
2. Does the Self registry registration count as the required "ERC-8004 agent ID", or must we also register at the Celo Identity Registry `0x8004A169…`? Until confirmed, plan for both.
3. Which disclosure config (age / OFAC) the protected service will require. OFAC check can fail for non-passport documents.

## Required from the owner (cannot be done by the agent)
Self app on a phone, the owner's real chip passport, and the owner scanning the QR themselves.

## Evidence log
| Date/time | Track | Task | Network / chain ID | Wallet | Tx hash | Provider confirmation | Outcome | Link | Counts? |
|---|---|---|---|---|---|---|---|---|---|
| _none yet_ | | | | | | | | | |
