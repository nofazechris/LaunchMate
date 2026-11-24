import { and, eq, sql } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, orderItems, orders, productStockMovements, products } from "@/db/schema";
import { errorResponse, HttpError } from "@/server/authz";
import { parseId, requireOwnBusiness } from "@/server/products";

type Ctx = { params: Promise<{ id: string }> };
const schema = z.object({ status: z.enum(["contacted", "fulfilled", "cancelled"]) });

/** Allowed moves. Fulfilled and cancelled are final. */
const NEXT: Record<string, string[]> = { new: ["contacted", "fulfilled", "cancelled"], contacted: ["fulfilled", "cancelled"], fulfilled: [], cancelled: [] };

/**
 * Move an order forward. Marking it fulfilled takes the items out of stock in the same transaction:
 * each removal is one atomic statement that refuses to go below zero, and the whole order is
 * undone if any item can't be covered.
 */
export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { user, business } = await requireOwnBusiness();
    const id = parseId((await params).id);
    const parsed = schema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, "Invalid status");
    const to = parsed.data.status;

    const result = await db.transaction(async (tx) => {
      const [o] = await tx.select().from(orders).where(and(eq(orders.id, id), eq(orders.businessId, business.id))).limit(1);
      if (!o) throw new HttpError(404, "Not found");
      if (!NEXT[o.status].includes(to)) throw new HttpError(409, `This order is already ${o.status}.`);

      if (to === "fulfilled") {
        const items = await tx.select().from(orderItems).where(and(eq(orderItems.orderId, id), eq(orderItems.businessId, business.id)));
        for (const it of items) {
          if (!it.productId) continue; // the product was deleted; nothing to deduct
          const [p] = await tx.select({ type: products.productType }).from(products).where(and(eq(products.id, it.productId), eq(products.businessId, business.id))).limit(1);
          if (!p || p.type !== "physical") continue; // digital items have no stock
          const [upd] = await tx.update(products)
            .set({ quantityOnHand: sql`${products.quantityOnHand} - ${it.quantity}` })
            .where(and(eq(products.id, it.productId), eq(products.businessId, business.id), sql`${products.quantityOnHand} >= ${it.quantity}`))
            .returning({ q: products.quantityOnHand });
          if (!upd) throw new HttpError(409, `Not enough stock for ${it.name}. Add stock first, then mark this order fulfilled.`);
          await tx.insert(productStockMovements).values({ productId: it.productId, businessId: business.id, delta: -it.quantity, reason: "sold", orderId: id, idempotencyKey: `order:${id}:${it.productId}` });
        }
      }
      const [updated] = await tx.update(orders).set({ status: to }).where(and(eq(orders.id, id), eq(orders.businessId, business.id))).returning({ status: orders.status });
      await tx.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: `order.${to}`, targetType: "order", targetId: id });
      return updated;
    });
    return Response.json(result);
  } catch (e) { return errorResponse(e); }
}
