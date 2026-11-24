import Link from "next/link";
import { notFound } from "next/navigation";
import { and, asc, desc, eq } from "drizzle-orm";
import { db } from "@/db";
import { productAssets, productStockMovements, products } from "@/db/schema";
import ProductEditor from "@/components/products/ProductEditor";
import { css } from "@/lib/css";
import { minorToInput } from "@/lib/money";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";
import { idSchema } from "@/server/products";

export const metadata = { title: "Product · Launchmate" };

export default async function Page({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ photos?: string }> }) {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!;
  const id = idSchema.safeParse((await params).id);
  if (!id.success) notFound();

  const [p] = await db.select().from(products).where(and(eq(products.id, id.data), eq(products.businessId, business.id))).limit(1);
  if (!p) notFound(); // another business's id looks exactly like a missing one

  const assets = await db.select({ id: productAssets.id }).from(productAssets)
    .where(and(eq(productAssets.productId, p.id), eq(productAssets.businessId, business.id))).orderBy(asc(productAssets.sortOrder), asc(productAssets.createdAt));
  const movements = await db.select().from(productStockMovements)
    .where(and(eq(productStockMovements.productId, p.id), eq(productStockMovements.businessId, business.id))).orderBy(desc(productStockMovements.createdAt)).limit(20);
  const { photos } = await searchParams;

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:20px;max-width:1100px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:6px")}>
        <Link href="/products" style={css("font-size:13px;color:#5E6862")}>← Products</Link>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>{p.name}</h1>
      </div>
      <ProductEditor
        photoWarning={photos === "failed"}
        assets={assets}
        movements={movements.map((m) => ({ id: m.id, delta: m.delta, reason: m.reason, at: m.createdAt.toISOString() }))}
        product={{
          id: p.id, name: p.name, description: p.description ?? "", category: p.category ?? "", productType: p.productType === "digital" ? "digital" : "physical",
          price: minorToInput(p.priceMinor), sku: p.sku ?? "", lowStockThreshold: p.lowStockThreshold,
          status: p.status === "published" || p.status === "archived" ? p.status : "draft",
          quantityOnHand: p.quantityOnHand, currency: p.currency,
        }}
      />
    </div>
  );
}
