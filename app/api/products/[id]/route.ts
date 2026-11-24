import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, productAssets, productStockMovements, products } from "@/db/schema";
import { errorResponse, HttpError } from "@/server/authz";
import { assertPublishable, parseId, priceToMinor, productFields, requireOwnBusiness } from "@/server/products";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { business } = await requireOwnBusiness();
    const id = parseId((await params).id);
    const [p] = await db.select().from(products).where(and(eq(products.id, id), eq(products.businessId, business.id))).limit(1);
    if (!p) throw new HttpError(404, "Not found");
    const assets = await db.select({ id: productAssets.id, mimeType: productAssets.mimeType, sizeBytes: productAssets.sizeBytes })
      .from(productAssets).where(and(eq(productAssets.productId, id), eq(productAssets.businessId, business.id))).orderBy(asc(productAssets.sortOrder), asc(productAssets.createdAt));
    const movements = await db.select().from(productStockMovements)
      .where(and(eq(productStockMovements.productId, id), eq(productStockMovements.businessId, business.id))).orderBy(desc(productStockMovements.createdAt)).limit(20);
    return Response.json({ product: p, assets, movements });
  } catch (e) { return errorResponse(e); }
}

export async function PATCH(req: Request, { params }: Ctx) {
  try {
    const { user, business } = await requireOwnBusiness();
    const id = parseId((await params).id);
    const parsed = productFields.partial().safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid product details");
    const d = parsed.data;

    const [current] = await db.select().from(products).where(and(eq(products.id, id), eq(products.businessId, business.id))).limit(1);
    if (!current) throw new HttpError(404, "Not found");

    const priceMinor = priceToMinor(d.price);
    assertPublishable(d.status, priceMinor === undefined ? current.priceMinor : priceMinor, d.name ?? current.name);

    const patch: Partial<typeof products.$inferInsert> = {};
    if (d.name !== undefined) patch.name = d.name;
    if (d.description !== undefined) patch.description = d.description || null;
    if (d.category !== undefined) patch.category = d.category || null;
    if (d.productType !== undefined) patch.productType = d.productType;
    if (priceMinor !== undefined) patch.priceMinor = priceMinor;
    if (d.sku !== undefined) patch.sku = d.sku || null;
    if (d.lowStockThreshold !== undefined) patch.lowStockThreshold = d.lowStockThreshold;
    if (d.status !== undefined) patch.status = d.status;
    if (Object.keys(patch).length === 0) return Response.json({ product: current });

    const [updated] = await db.update(products).set(patch).where(and(eq(products.id, id), eq(products.businessId, business.id))).returning();
    await db.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "product.update", targetType: "product", targetId: id, metadata: { fields: Object.keys(patch) } });
    return Response.json({ product: updated });
  } catch (e) { return errorResponse(e); }
}

/** Permanently deletes a product, its photos and stock history. */
export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { user, business } = await requireOwnBusiness();
    const id = parseId((await params).id);
    const gone = await db.delete(products).where(and(eq(products.id, id), eq(products.businessId, business.id))).returning({ id: products.id });
    if (gone.length === 0) throw new HttpError(404, "Not found");
    await db.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "product.delete", targetType: "product", targetId: id });
    return Response.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
