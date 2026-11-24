import { withAttribution } from "@celo/attribution-tags";
import { createPublicClient, createWalletClient, http, type Account, type Transport } from "viem";
import { celo } from "viem/chains";

/**
 * Celo MAINNET (chain id 42220) is the only network that counts for the hackathon.
 * Testnet clients, if ever added, must live elsewhere and be named as such.
 */
export const CELO_MAINNET_ID = 42220;

/** Format guaranteed by ERC-8021 for our builder codes: celo_ + 12 lowercase hex. */
const CODE_RE = /^celo_[a-f0-9]{12}$/;

/**
 * The hackathon attribution code (public, not secret: it appears in every tagged tx).
 * Read from ATTRIBUTION_CODE. We refuse to build a wallet client without it, so a
 * transaction can never silently go out untagged.
 */
export function getAttributionCode(env: Record<string, string | undefined> = process.env): string {
  const code = env.ATTRIBUTION_CODE?.trim();
  if (!code) throw new Error("ATTRIBUTION_CODE is not set; refusing to build a wallet client that would send untagged transactions");
  if (!CODE_RE.test(code)) throw new Error(`ATTRIBUTION_CODE "${code}" is not of the form celo_<12 hex>`);
  return code;
}

export function celoPublicClient(rpcUrl = process.env.CELO_RPC_URL) {
  return createPublicClient({ chain: celo, transport: http(rpcUrl) });
}

/**
 * THE one place a Celo wallet client is built. Every sendTransaction / writeContract on it
 * carries the attribution suffix, so individual call sites cannot forget it. Do not construct
 * wallet clients anywhere else.
 */
export function celoWalletClient(opts: { account: Account; transport?: Transport; code?: string }) {
  const code = opts.code ?? getAttributionCode();
  return createWalletClient({
    account: opts.account,
    chain: celo,
    transport: opts.transport ?? http(process.env.CELO_RPC_URL),
  }).extend(withAttribution(code));
}
