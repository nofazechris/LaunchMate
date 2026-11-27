import Link from "next/link";
import { notFound } from "next/navigation";
import { css } from "@/lib/css";
import { formatMinor } from "@/lib/money";
import { getVisibleStore, listPublished } from "@/server/storefront";

export const dynamic = "force-dynamic";

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const slug = (await params).slug;
  const store = await getVisibleStore(slug);
  if (!store) return null; // closed (or missing): the layout shows the notice, and no product data is read
  const items = await listPublished(store.id);

  return (
    <div style={css("display:flex;flex-direction:column;gap:clamp(24px,4vw,40px)")}>
      <section style={css("display:flex;flex-direction:column;gap:10px;padding:clamp(8px,2vw,24px) 0")}>
        <h1 style={css("margin:0;font-size:clamp(30px,4.5vw,52px);line-height:1.05;letter-spacing:-.03em;font-weight:600;text-wrap:balance")}>{store.name}</h1>
        {store.description && <p style={css("margin:0;font-size:clamp(15px,1.4vw,18px);line-height:1.55;color:#5E6862;max-width:640px")}>{store.description}</p>}
      </section>

      {items.length === 0 ? (
        <p style={css("color:#78817B")}>Nothing here yet. Check back soon.</p>
      ) : (
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(min(45%,230px),1fr));gap:clamp(12px,2vw,24px)")}>
          {items.map((p) => {
            const soldOut = p.productType === "physical" && p.quantityOnHand === 0;
            return (
              <Link key={p.id} href={`/s/${slug}/p/${p.id}`} style={css("display:flex;flex-direction:column;gap:10px;color:#202723")}>
                <div style={css("position:relative;aspect-ratio:1;border-radius:16px;overflow:hidden;background:#F3F5F2;display:grid;place-items:center;color:#A3ABA5;font-size:13px")}>
                  {p.photoIds[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/s/${slug}/images/${p.photoIds[0]}`} alt={p.name} style={{ width: "100%", height: "100%", objectFit: "cover", opacity: soldOut ? 0.55 : 1 }} />
                  ) : (
                    "No photo"
                  )}
                  {soldOut && <span style={css("position:absolute;left:10px;top:10px;font-size:12px;padding:4px 10px;border-radius:999px;background:#FFFFFF;color:#5E6862;font-weight:500")}>Sold out</span>}
                </div>
                <div style={css("display:flex;justify-content:space-between;gap:2px 10px;align-items:baseline;flex-wrap:wrap")}>
                  <span style={css("font-size:15px;font-weight:500;line-height:1.3")}>{p.name}</span>
                  <span style={css("font-family:var(--font-mono);font-size:14px;white-space:nowrap")}>{formatMinor(p.priceMinor, p.currency)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
