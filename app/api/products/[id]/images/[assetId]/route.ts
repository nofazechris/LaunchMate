import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, productAssets } from "@/db/schema";
import { errorResponse, HttpError } from "@/server/authz";
import { parseId, requireOwnBusiness } from "@/server/products";

type Ctx = { params: Promise<{ id: string; assetId: string }> };

/** Serves a photo to the owner of the business only. (Public storefront delivery comes with the storefront.) */
export async function GET(_req: Request, { params }: Ctx) {
  try {
    const { business } = await requireOwnBusiness();
    const p = await params;
    const [a] = await db.select().from(productAssets)
      .where(and(eq(productAssets.id, parseId(p.assetId)), eq(productAssets.productId, parseId(p.id)), eq(productAssets.businessId, business.id))).limit(1);
    if (!a?.data) throw new HttpError(404, "Not found");
    return new Response(new Uint8Array(a.data), {
      headers: {
        "content-type": a.mimeType, // set from the verified bytes at upload
        "content-length": String(a.data.length),
        "cache-control": "private, max-age=300",
        "x-content-type-options": "nosniff",
        "content-disposition": "inline",
      },
    });
  } catch (e) { return errorResponse(e); }
}

export async function DELETE(_req: Request, { params }: Ctx) {
  try {
    const { user, business } = await requireOwnBusiness();
    const p = await params;
    const gone = await db.delete(productAssets)
      .where(and(eq(productAssets.id, parseId(p.assetId)), eq(productAssets.productId, parseId(p.id)), eq(productAssets.businessId, business.id)))
      .returning({ id: productAssets.id });
    if (gone.length === 0) throw new HttpError(404, "Not found");
    await db.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "product.photo.delete", targetType: "product", targetId: p.id });
    return Response.json({ ok: true });
  } catch (e) { return errorResponse(e); }
}
