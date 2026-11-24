import { randomBytes } from "node:crypto";
import { z } from "zod";
import { maxPaymentCeiling, payBuyService, PaymentPolicyError } from "@/lib/agentvault/client";
import { requireOwnerToken } from "@/lib/agentvault/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 120;

const input = z.object({
  url: z.string().url(),
  method: z.enum(["GET", "POST"]).default("GET"),
  body: z.record(z.string(), z.unknown()).optional(),
  maxUsd: z.string(),
  /** The owner must echo the exact amount they approved on screen. */
  confirmedMaxUsd: z.string(),
  idempotencyKey: z.string().optional(),
});

export async function POST(req: Request) {
  const denied = requireOwnerToken(req);
  if (denied) return denied;

  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid request" }, { status: 400 });
  const p = parsed.data;

  // Human approval is bound to the exact amount: a different amount is a different operation.
  if (p.confirmedMaxUsd !== p.maxUsd) {
    return Response.json({ error: "The confirmed amount does not match the amount to pay. Nothing was paid." }, { status: 400 });
  }

  try {
    const result = await payBuyService({
      url: p.url,
      method: p.method,
      body: p.body,
      maxUsd: p.maxUsd,
      idempotencyKey: p.idempotencyKey ?? "lm-" + randomBytes(12).toString("hex"),
      waitForOwnerMs: 100 * 1000, // inside maxDuration; if still pending the UI retries with the same idempotencyKey
    });
    return Response.json({ ...result, ceilingUsd: maxPaymentCeiling() });
  } catch (e) {
    if (e instanceof PaymentPolicyError) return Response.json({ error: e.message }, { status: 400 });
    console.error("agentvault pay failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "Payment could not be completed. Check Agent Vault before retrying; it may have been sent." }, { status: 502 });
  }
}
