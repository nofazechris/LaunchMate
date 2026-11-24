import { HTTPFacilitatorClient, x402ResourceServer, type RoutesConfig } from "@x402/core/server";
import { ExactEvmScheme } from "@x402/evm/exact/server";
import { withX402 } from "@x402/next";
import { isAddress } from "viem";
import type { NextRequest, NextResponse } from "next/server";

/** Celo MAINNET only. Celo's hosted facilitator; note the `api.` subdomain. */
export const FACILITATOR_URL = "https://api.x402.celo.org";
export const CELO_MAINNET_CAIP2 = "eip155:42220";
/** USDC on Celo mainnet (6 decimals); EIP-712 domain per Celo's x402 docs. */
const USDC = { address: "0xcebA9300f2b948710d2653dD7B07f33A8B32118C", extra: { name: "USDC", version: "2" } };

export class X402ConfigError extends Error {}

/**
 * Wrap a route handler so it is only run after a real x402 payment is verified, and settled only
 * if the handler succeeds (status < 400). If the seller is not configured we THROW rather than
 * serve for free, so a misconfiguration can never silently give the service away.
 */
export function paidHandler(
  path: string,
  handler: (req: NextRequest) => Promise<NextResponse>,
  env: Record<string, string | undefined> = process.env,
) {
  const payTo = env.X402_PAYTO_ADDRESS;
  const apiKey = env.X402_API_KEY;
  if (!payTo || !isAddress(payTo)) throw new X402ConfigError("X402_PAYTO_ADDRESS is missing or not a valid address");
  if (!apiKey) throw new X402ConfigError("X402_API_KEY is missing (needed by the facilitator to settle)");
  const amount = env.X402_PRICE_USDC_UNITS ?? "10000"; // $0.01
  if (!/^\d+$/.test(amount)) throw new X402ConfigError("X402_PRICE_USDC_UNITS must be an integer string of USDC base units");

  const facilitator = new HTTPFacilitatorClient({
    url: FACILITATOR_URL,
    createAuthHeaders: async () => {
      const h = { "X-API-Key": apiKey };
      return { verify: h, settle: h, supported: h };
    },
  });
  const server = new x402ResourceServer(facilitator);
  server.register("eip155:*", new ExactEvmScheme());

  const routes: RoutesConfig = {
    [path]: {
      accepts: [
        {
          scheme: "exact",
          network: CELO_MAINNET_CAIP2,
          payTo,
          price: { amount, asset: USDC.address, extra: USDC.extra },
        },
      ],
      description: "Launchmate product-copy enrichment for a verified, human-backed agent",
    },
  };

  return withX402(handler, routes, server);
}
