import Link from "next/link";
import { notFound } from "next/navigation";
import { AddToCart, Gallery } from "@/components/store/StoreWidgets";
import { css } from "@/lib/css";
import { formatMinor } from "@/lib/money";
import { idSchema } from "@/server/products";
import { getPublished, getVisibleStore } from "@/server/storefront";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string; id: string }> }) {
  const p = await params;
  const store = await getVisibleStore(p.slug);
  if (!store) return null; // closed (or missing): nothing is read
  const id = idSchema.safeParse(p.id);
  if (!id.success) notFound();
  const product = await getPublished(store.id, id.data);
  if (!product) notFound(); // unpublished or someone else's: indistinguishable from missing

  const physical = product.productType === "physical";
  const soldOut = physical && product.quantityOnHand === 0;
  const few = physical && product.quantityOnHand > 0 && product.quantityOnHand <= product.lowStockThreshold;

  return (
    <div style={css("display:flex;flex-direction:column;gap:18px")}>
      <Link href={`/s/${p.slug}`} style={css("font-size:13px;color:#5E6862")}>← All products</Link>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:clamp(20px,4vw,56px);align-items:start")}>
        <Gallery slug={p.slug} ids={product.photoIds} alt={product.name} />
        <div style={css("display:flex;flex-direction:column;gap:18px")}>
          <div style={css("display:flex;flex-direction:column;gap:8px")}>
            {product.category && <span style={css("font-size:13px;color:#78817B")}>{product.category}</span>}
            <h1 style={css("margin:0;font-size:clamp(26px,3.4vw,38px);line-height:1.1;letter-spacing:-.025em;font-weight:600")}>{product.name}</h1>
            <span style={css("font-family:var(--font-mono);font-size:22px")}>{formatMinor(product.priceMinor, product.currency)}</span>
          </div>
          {few && <span style={css("font-size:13px;color:#8A5E1C;background:#FBF3E6;padding:6px 12px;border-radius:999px;align-self:flex-start")}>Only {product.quantityOnHand} left</span>}
          <AddToCart slug={p.slug} productId={product.id} max={physical ? product.quantityOnHand : null} soldOut={soldOut} />
          {product.description && <p style={css("margin:0;font-size:16px;line-height:1.65;color:#4C5550;white-space:pre-wrap")}>{product.description}</p>}
          {!physical && <p style={css("margin:0;font-size:13px;color:#78817B")}>Digital product: the seller will send it to you after your order is confirmed.</p>}
        </div>
      </div>
    </div>
  );
}
