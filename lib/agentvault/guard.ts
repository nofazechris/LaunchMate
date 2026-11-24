import { timingSafeEqual } from "node:crypto";

/**
 * These routes drive the OWNER's Agent Vault (sign in, spend). Until real accounts are wired in,
 * they are locked behind a shared secret (DEMO_ADMIN_TOKEN, .env.local / host env). With no
 * secret configured they are disabled, never open. Returns a Response to send, or null to go on.
 */
export function requireOwnerToken(req: Request, env: Record<string, string | undefined> = process.env): Response | null {
  const expected = env.DEMO_ADMIN_TOKEN;
  if (!expected || expected.length < 16) {
    return Response.json({ error: "Owner actions are disabled: set DEMO_ADMIN_TOKEN (16+ characters)." }, { status: 503 });
  }
  const given = req.headers.get("x-owner-token") ?? "";
  const a = Buffer.from(given);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) {
    return Response.json({ error: "Not authorised" }, { status: 401 });
  }
  return null;
}
