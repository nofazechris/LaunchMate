import { and, count, eq, isNotNull } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, businesses, products } from "@/db/schema";
import { errorResponse, HttpError } from "@/server/authz";
import { requireOwnBusiness } from "@/server/products";

const schema = z.object({ status: z.enum(["live", "draft"]) });

/** Open or close the store. Opening is the owner's explicit decision, and needs something to sell. */
export async function PATCH(req: Request) {
  try {
    const { user, business } = await requireOwnBusiness();
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid request");

    if (parsed.data.status === "live") {
      const [{ n }] = await db.select({ n: count() }).from(products)
        .where(and(eq(products.businessId, business.id), eq(products.status, "published"), isNotNull(products.priceMinor)));
      if (n === 0) throw new HttpError(400, "Publish at least one product with a price before opening your store.");
    }
    await db.update(businesses).set({ status: parsed.data.status }).where(eq(businesses.id, business.id));
    await db.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: parsed.data.status === "live" ? "store.open" : "store.close", targetType: "business", targetId: business.id });
    return Response.json({ status: parsed.data.status });
  } catch (e) { return errorResponse(e); }
}
