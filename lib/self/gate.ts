import { SelfAgentVerifier } from "@selfxyz/agent-sdk";

/**
 * Self Agent ID access decision for the paid Launchmate service.
 *
 * This is a REAL check: the SDK recovers the signer from the request signature, then reads the
 * Self Agent ID registry on Celo mainnet (no API key, no call to Self) and requires
 * hasHumanProof && isProofFresh, plus sybil / replay / rate-limit policy. A decision is made
 * BEFORE we ever ask for payment: unverified agents are denied and are never shown a price.
 *
 * Relative imports only, so tests can load this without the Next.js path alias.
 */
export type Decision = "served" | "denied" | "rate_limited" | "unavailable";

export type GateResult =
  | { ok: true; decision: "served"; agent: { agentId: string; address: string; nullifier: string } }
  | { ok: false; decision: Exclude<Decision, "served">; status: number; error: string };

let shared: SelfAgentVerifier | undefined;

/** Policy: human-backed agents only (mainnet registry). No age/nationality gate; many agents per human are allowed. */
export function defaultVerifier(): SelfAgentVerifier {
  shared ??= SelfAgentVerifier.create()
    .network("mainnet")
    .sybilLimit(0)
    .rateLimit({ perMinute: 30 })
    .build();
  return shared;
}

const AUTH_FAILURE = /header|signature|timestamp|replay|not verified on-chain|expired/i;

/** Max time to wait for the on-chain read. A stalled RPC must refuse the request, not hang it. */
const VERIFY_TIMEOUT_MS = 8000;

export async function gateAgentRequest(
  req: Request,
  verifier: Pick<SelfAgentVerifier, "verify"> = defaultVerifier(),
  opts: { timeoutMs?: number } = {},
): Promise<GateResult> {
  const h = req.headers;
  const signature = h.get("x-self-agent-signature");
  const timestamp = h.get("x-self-agent-timestamp");
  if (!signature || !timestamp) {
    return { ok: false, decision: "denied", status: 401, error: "Missing Self Agent ID headers (x-self-agent-signature, x-self-agent-timestamp)" };
  }

  const body = await req.clone().text(); // exact bytes: the signature covers them
  const url = new URL(req.url);

  let r;
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    r = await Promise.race([
      verifier.verify({
      signature,
      timestamp,
      method: req.method,
      url: url.pathname + url.search,
      body: body || undefined,
      keytype: h.get("x-self-agent-keytype") ?? undefined,
      agentKey: h.get("x-self-agent-key") ?? undefined,
      }),
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error("verification timed out")), opts.timeoutMs ?? VERIFY_TIMEOUT_MS);
      }),
    ]);
  } catch {
    // The registry could not be read (RPC failure). Fail CLOSED: never serve on an unknown.
    return { ok: false, decision: "unavailable", status: 503, error: "Could not verify Self Agent ID right now" };
  } finally {
    clearTimeout(timer);
  }

  if (!r.valid) {
    if (r.retryAfterMs) return { ok: false, decision: "rate_limited", status: 429, error: r.error ?? "Rate limited" };
    const status = r.error && AUTH_FAILURE.test(r.error) ? 401 : 403;
    return { ok: false, decision: "denied", status, error: r.error ?? "Agent not verified" };
  }

  return {
    ok: true,
    decision: "served",
    agent: { agentId: r.agentId.toString(), address: r.agentAddress, nullifier: r.nullifier.toString() },
  };
}
