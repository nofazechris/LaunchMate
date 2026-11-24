import { getVaultStatus } from "@/lib/agentvault/client";
import { requireOwnerToken } from "@/lib/agentvault/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const denied = requireOwnerToken(req);
  if (denied) return denied;
  try {
    return Response.json(await getVaultStatus());
  } catch (e) {
    console.error("agentvault status failed", e instanceof Error ? e.message : e);
    return Response.json({ connected: false, error: "Could not reach Agent Vault. Check SELF_AGENT_PAY_* settings." }, { status: 502 });
  }
}
