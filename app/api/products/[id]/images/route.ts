import { randomUUID } from "node:crypto";
import { and, count, eq } from "drizzle-orm";
import { db } from "@/db";
import { auditLogs, productAssets, products } from "@/db/schema";
import { MAX_IMAGE_BYTES, MAX_IMAGES_PER_PRODUCT, sniffImage } from "@/lib/images";
import { errorResponse, HttpError } from "@/server/authz";
import { parseId, requireOwnBusiness } from "@/server/products";

type Ctx = { params: Promise<{ id: string }> };

/** Upload one photo (multipart field "file"). The browser resizes first; we verify everything again. */
export async function POST(req: Request, { params }: Ctx) {
  try {
    const { user, business } = await requireOwnBusiness();
    const id = parseId((await params).id);

    const [p] = await db.select({ id: products.id }).from(products).where(and(eq(products.id, id), eq(products.businessId, business.id))).limit(1);
    if (!p) throw new HttpError(404, "Not found");

    const form = await req.formData().catch(() => null);
    const file = form?.get("file");
    if (!(file instanceof File)) throw new HttpError(400, "Choose a photo to upload");
    if (file.size > MAX_IMAGE_BYTES) throw new HttpError(413, "That photo is too large. Photos can be up to 2 MB.");

    const bytes = Buffer.from(await file.arrayBuffer());
    const mime = sniffImage(bytes); // what the bytes really are, ignoring the claimed type
    if (!mime) throw new HttpError(415, "Use a JPG, PNG or WebP photo.");

    const [{ n }] = await db.select({ n: count() }).from(productAssets).where(and(eq(productAssets.productId, id), eq(productAssets.businessId, business.id)));
    if (n >= MAX_IMAGES_PER_PRODUCT) throw new HttpError(409, `A product can have up to ${MAX_IMAGES_PER_PRODUCT} photos.`);

    const assetId = randomUUID();
    await db.insert(productAssets).values({
      id: assetId, productId: id, businessId: business.id,
      storageKey: `db:${assetId}`, data: bytes, mimeType: mime, sizeBytes: bytes.length, sortOrder: n,
    });
    await db.insert(auditLogs).values({ businessId: business.id, actorType: "user", actorId: user.id, action: "product.photo.add", targetType: "product", targetId: id });
    return Response.json({ asset: { id: assetId, mimeType: mime, sizeBytes: bytes.length } }, { status: 201 });
  } catch (e) { return errorResponse(e); }
}
