# Attribution tags (ERC-8021)

**Status: Implemented and unit-tested. No mainnet transaction sent yet, so nothing is Verified.**

Our code: `celo_b02f2c0e5298` (issued at enrolment; public, it appears in every tagged tx).

## How it is applied
- Single construction point: `lib/chain/celo.ts` → `celoWalletClient()`. It extends the viem wallet client with the official `@celo/attribution-tags` `withAttribution(code)`, so every `sendTransaction` / `writeContract` is tagged. Do not build wallet clients anywhere else.
- The code comes from `ATTRIBUTION_CODE`. The client refuses to build if it is missing or not `celo_<12 hex>`, so a tx cannot silently go out untagged.
- `withAttribution` merges rather than duplicates if a tag is already present (tested: exactly one tag).
- Chain is Celo mainnet (42220) only.

## Tests (`npm test`, no network)
Signs real transactions with a throwaway key through a capturing transport, parses the signed raw tx and decodes the suffix with `fromDataSuffix`:
1. Plain transfer → calldata decodes to `["celo_b02f2c0e5298"]`, chain id 42220.
2. Contract-style calldata → original arguments preserved at the front, one tag at the end.
3. Missing/invalid code → client refuses to build.

## Still to do (after the first real mainnet tx)
Run `verifyTx({ client, hash })` against the real transaction and record the result in the log below. A unit test is not proof of on-chain attribution.

## Code source (resolved 24 Nov 2026)
`loops project get -e agents-open-for-business` (signed in) returns `celo.attributionTag: celo_b02f2c0e5298` — the platform-issued tag. Per the event skill, use exactly this tag and never derive one with `codeFromRepo`/`codeFromHostname`. (Our own repo-derived value, `celo_2590bd6b9e76`, is irrelevant and must not be used.) The platform also returns the raw `dataSuffix` bytes: `0x63656c6f5f623032663263306535323938110080218021802180218021802180218021`.

## x402
x402 settlements on Celo currently carry no tag (the facilitator does not write them yet, per the Celo attribution docs). Register the PayTo address at hackathon registration instead.

## Evidence log
| Date/time | Tx hash | verifyTx result | Counts? |
|---|---|---|---|
| _none yet_ | | | |
