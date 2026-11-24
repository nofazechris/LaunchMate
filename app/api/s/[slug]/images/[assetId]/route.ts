import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { productAssets, products } from "@/db/schema";
import { idSchema } from "@/server/products";
import { getStore, isOpen, viewerOwns } from "@/server/storefront";

type Ctx = { params: Promise<{ slug: string; assetId: string }> };

/**
 * A product photo for the public store. Only photos of PUBLISHED products in an OPEN store are
 * served to the public; the owner can also see them while previewing a closed store.
 */
export async function GET(_req: Request, { params }: Ctx) {
  const p = await params;
  const id = idSchema.safeParse(p.assetId);
  const store = await getStore(p.slug);
  if (!id.success || !store) return new Response("Not found", { status: 404 });

  const open = isOpen(store);
  if (!open && !(await viewerOwns(store.id))) return new Response("Not found", { status: 404 });

  const [row] = await db.select({ data: productAssets.data, mime: productAssets.mimeType }).from(productAssets)
    .innerJoin(products, eq(products.id, productAssets.productId))
    .where(and(eq(productAssets.id, id.data), eq(productAssets.businessId, store.id), eq(products.businessId, store.id), eq(products.status, "published"))).limit(1);
  if (!row?.data) return new Response("Not found", { status: 404 });

  return new Response(new Uint8Array(row.data), {
    headers: {
      "content-type": row.mime,
      "content-length": String(row.data.length),
      "cache-control": open ? "public, max-age=3600" : "private, no-store",
      "x-content-type-options": "nosniff",
      "content-disposition": "inline",
    },
  });
}
