import { and, eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agentMemory, auditLogs } from "@/db/schema";
import { normalizeDomain } from "@/lib/domain";
import { errorResponse, HttpError } from "@/server/authz";
import { requireOwnBusiness } from "@/server/products";

export const PREFERRED_DOMAIN_KEY = "preferred_domain";
const schema = z.object({ domain: z.string().max(300) });

/** Save (or clear, with an empty string) the domain the seller would like for their store. */
export async function PUT(req: Request) {
  try {
    const { user, business } = await requireOwnBusiness();
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Enter a domain");

    if (parsed.data.domain.trim() === "") {
      await db.delete(agentMemory).where(and(eq(agentMemory.businessId, business.id), eq(agentMemory.key, PREFERRED_DOMAIN_KEY)));
      return Response.json({ domain: null });
    }
    const domain = normalizeDomain(parsed.data.domain);
    if (!domain) throw new HttpError(400, "That doesn't look like a domain. Try something like yourbrand.com or yourbrand.com.ng.");

    await db.insert(agentMemory).values({ businessId: business.id, key: PREFERRED_DOMAIN_KEY, value: { domain }, source: "owner" })
      .onConflictDoUpdate({ target: [agentMemory.businessId, agentMemory.key], set: { value: { domain }, source: "owner" } });
    await db.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "domain.preference.save", targetType: "business", targetId: business.id });
    return Response.json({ domain });
  } catch (e) { return errorResponse(e); }
}
