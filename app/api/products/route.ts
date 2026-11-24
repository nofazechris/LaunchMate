import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, productAssets, productStockMovements, products } from "@/db/schema";
import { errorResponse, HttpError } from "@/server/authz";
import { assertPublishable, priceToMinor, productFields, requireOwnBusiness } from "@/server/products";

const createSchema = productFields.extend({
  /** Starting stock. Recorded as the first stock movement. */
  quantity: z.number().int().min(0).max(1_000_000).optional(),
});

/** List the signed-in user's products, newest first, with the id of each product's first photo. */
export async function GET(req: Request) {
  try {
    const { business } = await requireOwnBusiness();
    const url = new URL(req.url);
    const q = url.searchParams.get("q")?.trim();
    const status = url.searchParams.get("status");
    const conds = [eq(products.businessId, business.id)];
    if (q) conds.push(ilike(products.name, `%${q.replace(/[%_]/g, "")}%`));
    if (status && ["draft", "published", "archived"].includes(status)) conds.push(eq(products.status, status as "draft" | "published" | "archived"));

    const rows = await db.select().from(products).where(and(...conds)).orderBy(desc(products.createdAt)).limit(200);
    const cover = rows.length
      ? await db.select({ id: productAssets.id, productId: productAssets.productId })
          .from(productAssets)
          .where(and(eq(productAssets.businessId, business.id), inArray(productAssets.productId, rows.map((r) => r.id))))
          .orderBy(asc(productAssets.sortOrder), asc(productAssets.createdAt))
      : [];
    const firstPhoto = new Map<string, string>();
    for (const c of cover) if (c.productId && !firstPhoto.has(c.productId)) firstPhoto.set(c.productId, c.id);

    return Response.json({ products: rows.map((p) => ({ ...p, coverAssetId: firstPhoto.get(p.id) ?? null })) });
  } catch (e) { return errorResponse(e); }
}

/** Create a product. Draft by default; stock starts from a recorded movement. */
export async function POST(req: Request) {
  try {
    const { user, business } = await requireOwnBusiness();
    const parsed = createSchema.safeParse(await req.json().catch(() => null));
    if (!parsed.success) throw new HttpError(400, parsed.error.issues[0]?.message ?? "Invalid product details");
    const d = parsed.data;
    const priceMinor = priceToMinor(d.price);
    assertPublishable(d.status, priceMinor, d.name);
    const qty = d.quantity ?? 0;

    const created = await db.transaction(async (tx) => {
      const [p] = await tx.insert(products).values({
        businessId: business.id,
        name: d.name,
        description: d.description || null,
        category: d.category || null,
        productType: d.productType ?? "physical",
        priceMinor: priceMinor ?? null,
        currency: business.currency,
        quantityOnHand: qty,
        lowStockThreshold: d.lowStockThreshold ?? 3,
        sku: d.sku || null,
        status: d.status ?? "draft",
        ownerConfirmed: true,
        // Everything here was typed by the owner; nothing is AI-inferred or externally verified.
        provenance: Object.fromEntries(["name", "description", "category", "price", "sku"].filter((k) => (k === "price" ? d.price : (d as Record<string, unknown>)[k])).map((k) => [k, "merchant" as const])),
      }).returning();
      if (qty > 0) await tx.insert(productStockMovements).values({ productId: p.id, businessId: business.id, delta: qty, reason: "initial", idempotencyKey: `initial:${p.id}` });
      await tx.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "product.create", targetType: "product", targetId: p.id });
      return p;
    });
    return Response.json({ product: created }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
