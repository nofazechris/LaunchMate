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

## Open question: code vs repo name
Celo's builders guide says the platform derives codes from the GitHub `owner/repo` slug (`codeFromRepo`). `nofazechris/launchmate` hashes to `celo_2590bd6b9e76`, which is **not** our code, and no obvious variant (case, URL, `.git`, hostname) reproduces `celo_b02f2c0e5298`. So the enrolment was probably registered against a different repo URL or name. Confirm the repo URL on the enrolment page matches `github.com/nofazechris/LaunchMate`. We use the issued code as-is and have not added the repo-derivation assertion because it would fail.

## x402
x402 settlements on Celo currently carry no tag (the facilitator does not write them yet, per the Celo attribution docs). Register the PayTo address at hackathon registration instead.

## Evidence log
| Date/time | Tx hash | verifyTx result | Counts? |
|---|---|---|---|
| _none yet_ | | | |
