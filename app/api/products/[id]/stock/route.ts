import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, productStockMovements, products } from "@/db/schema";
import { errorResponse, HttpError } from "@/server/authz";
import { parseId, requireOwnBusiness } from "@/server/products";

type Ctx = { params: Promise<{ id: string }> };

const schema = z.object({
  delta: z.number().int().min(-1_000_000).max(1_000_000).refine((n) => n !== 0, "Enter a number other than zero"),
  reason: z.enum(["received", "adjustment", "correction"]),
  /** Lets a retried request apply only once. */
  idempotencyKey: z.string().min(8).max(64).optional(),
});

/**
 * Change stock by a recorded movement. The update is a single atomic statement that refuses to go
 * below zero, so two requests at once can never oversell or double-apply.
 */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { user, business } = await requireOwnBusiness();
    const id = parseId((await params).id);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid stock change");
    const { delta, reason, idempotencyKey } = parsed.data;

    const result = await db.transaction(async (tx) => {
      if (idempotencyKey) {
        const [seen] = await tx.select({ id: productStockMovements.id }).from(productStockMovements)
          .where(and(eq(productStockMovements.businessId, business.id), eq(productStockMovements.idempotencyKey, idempotencyKey))).limit(1);
        if (seen) {
          const [p] = await tx.select({ q: products.quantityOnHand }).from(products).where(and(eq(products.id, id), eq(products.businessId, business.id))).limit(1);
          return { quantityOnHand: p?.q ?? 0, replay: true };
        }
      }
      const [updated] = await tx.update(products)
        .set({ quantityOnHand: sql`${products.quantityOnHand} + ${delta}` })
        .where(and(eq(products.id, id), eq(products.businessId, business.id), sql`${products.quantityOnHand} + ${delta} >= 0`))
        .returning({ q: products.quantityOnHand });
      if (!updated) {
        const [exists] = await tx.select({ id: products.id }).from(products).where(and(eq(products.id, id), eq(products.businessId, business.id))).limit(1);
        throw new HttpError(exists ? 400 : 404, exists ? "Stock can't go below zero." : "Not found");
      }
      await tx.insert(productStockMovements).values({ productId: id, businessId: business.id, delta, reason, idempotencyKey: idempotencyKey ?? null });
      await tx.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "product.stock", targetType: "product", targetId: id, metadata: { delta, reason } });
      return { quantityOnHand: updated.q, replay: false };
    });
    return Response.json(result);
  } catch (e) { return errorResponse(e); }
}
