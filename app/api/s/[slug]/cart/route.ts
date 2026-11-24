import { z } from "zod";
import { getStore, isOpen, listPublished, viewerOwns } from "@/server/storefront";

type Ctx = { params: Promise<{ slug: string }> };
const schema = z.object({ ids: z.array(z.string().uuid()).max(30) });

/** Current name, price and stock for the products in a visitor's cart. Prices always come from here, never from the browser. */
export async function POST(req: Request, { params }: Ctx) {
  const store = await getStore((await params).slug);
  if (!store) return Response.json({ error: "Store not found" }, { status: 404 });
  if (!isOpen(store) && !(await viewerOwns(store.id))) return Response.json({ error: "Store not found" }, { status: 404 });
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "Invalid cart" }, { status: 400 });

  const want = new Set(parsed.data.ids);
  const items = (await listPublished(store.id)).filter((p) => want.has(p.id)).map((p) => ({
    id: p.id, name: p.name, priceMinor: p.priceMinor, currency: p.currency, productType: p.productType,
    quantityOnHand: p.quantityOnHand, coverId: p.photoIds[0] ?? null,
  }));
  return Response.json({ items });
}
