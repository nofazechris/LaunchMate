import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { agentMemory, auditLogs, businessMembers, businesses } from "@/db/schema";
import { errorResponse, HttpError, requireUser } from "@/server/authz";
import { PROFILE_KEY } from "@/server/business";

const slugify = (s: string) =>
  s.toLowerCase().normalize("NFKD").replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40);

const text = z.string().trim().max(500);
const createSchema = z.object({
  name: z.string().trim().min(2).max(80),
  category: z.string().trim().max(80).optional(),
  description: z.string().trim().max(500).optional(),
  /** What the owner told us during onboarding; stored as editable business memory. */
  profile: z.object({ answers: z.record(z.string(), text).optional(), blueprint: z.record(z.string(), text).optional() }).optional(),
});

/** List the businesses the signed-in user belongs to. */
export async function GET() {
  try {
    const user = await requireUser();
    const rows = await db
      .select({ id: businesses.id, name: businesses.name, slug: businesses.slug, status: businesses.status, role: businessMembers.role })
      .from(businessMembers)
      .innerJoin(businesses, eq(businesses.id, businessMembers.businessId))
      .where(eq(businessMembers.userId, user.id));
    return Response.json({ businesses: rows });
  } catch (e) { return errorResponse(e); }
}

/** Create the user's business workspace; the creator becomes its owner. One per user for now. */
export async function POST(req: Request) {
  try {
    const user = await requireUser();
    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid business details");
    const { name, category, description, profile } = parsed.data;

    const base = slugify(name);
    if (base.length < 2) throw new HttpError(400, "Business name needs letters or numbers");

    const created = await db.transaction(async (tx) => {
      const [existing] = await tx.select({ id: businessMembers.businessId }).from(businessMembers).where(eq(businessMembers.userId, user.id)).limit(1);
      if (existing) throw new HttpError(409, "You already have a business");

      for (let attempt = 0; attempt < 5; attempt++) {
        const slug = attempt === 0 ? base : `${base}-${Math.random().toString(36).slice(2, 6)}`;
        const [taken] = await tx.select({ id: businesses.id }).from(businesses).where(eq(businesses.slug, slug)).limit(1);
        if (taken) continue;
        const [b] = await tx.insert(businesses).values({ name, slug, category, description }).returning();
        await tx.insert(businessMembers).values({ businessId: b.id, userId: user.id, role: "owner" });
        if (profile) await tx.insert(agentMemory).values({ businessId: b.id, key: PROFILE_KEY, value: profile, source: "owner" });
        await tx.insert(auditLogs).values({ businessId: b.id, actorType: "user", actorId: user.id, action: "business.create", targetType: "business", targetId: b.id });
        return b;
      }
      throw new HttpError(409, "Could not allocate a store address, try another name");
    });

    return Response.json({ business: created }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
