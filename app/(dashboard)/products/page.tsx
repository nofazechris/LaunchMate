import Link from "next/link";
import { and, asc, desc, eq, ilike, inArray } from "drizzle-orm";
import { db } from "@/db";
import { productAssets, products } from "@/db/schema";
import { css } from "@/lib/css";
import { formatMinor } from "@/lib/money";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Products · Launchmate" };

const STATUSES = ["draft", "published", "archived"] as const;
type Status = (typeof STATUSES)[number];
const chip: Record<string, [string, string]> = { draft: ["#F3F5F2", "#78817B"], published: ["#E9F4EE", "#1F6B43"], archived: ["#F1F2F1", "#5E6862"] };

export default async function Page({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!;
  const { q, status } = await searchParams;
  const term = q?.trim().replace(/[%_]/g, "");
  const activeStatus = STATUSES.includes(status as Status) ? (status as Status) : undefined;

  const conds = [eq(products.businessId, business.id)];
  if (term) conds.push(ilike(products.name, `%${term}%`));
  if (activeStatus) conds.push(eq(products.status, activeStatus));
  const rows = await db.select().from(products).where(and(...conds)).orderBy(desc(products.createdAt)).limit(200);

  const photos = rows.length
    ? await db.select({ id: productAssets.id, productId: productAssets.productId }).from(productAssets)
        .where(and(eq(productAssets.businessId, business.id), inArray(productAssets.productId, rows.map((r) => r.id))))
        .orderBy(asc(productAssets.sortOrder), asc(productAssets.createdAt))
    : [];
  const cover = new Map<string, string>();
  for (const p of photos) if (p.productId && !cover.has(p.productId)) cover.set(p.productId, p.id);

  const filtered = !!(term || activeStatus);
  const pill = (active: boolean) =>
    css(`font-size:13px;padding:7px 13px;border-radius:999px;border-style:solid;border-width:1px;${active ? "background:#EEF6F0;border-color:#26734D;color:#185C3B;font-weight:600" : "background:#FFFFFF;border-color:#E8ECE8;color:#4C5550"}`);
  const href = (s?: string) => `/products?${new URLSearchParams({ ...(term ? { q: term } : {}), ...(s ? { status: s } : {}) }).toString()}`;

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:16px;max-width:1100px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Products</h1>
          <span style={css("font-size:14px;color:#78817B")}>The things you sell. Your own stock, your own photos.</span>
        </div>
        <Link href="/products/new" className="hv-green" style={css("background:#26734D;color:#FFFFFF;font-size:14px;font-weight:500;padding:11px 18px;border-radius:10px")}>Add product</Link>
      </div>

      <div style={css("display:flex;gap:10px;flex-wrap:wrap;align-items:center")}>
        <form action="/products" style={css("display:flex;gap:8px")}>
          {activeStatus && <input type="hidden" name="status" value={activeStatus} />}
          <input name="q" defaultValue={term ?? ""} placeholder="Search products" className="fx-input" style={css("font-size:14px;padding:9px 13px;border:1px solid #E8ECE8;border-radius:10px;outline:none;background:#FFFFFF;min-width:200px")} />
          <button style={css("font-size:14px;padding:9px 14px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer")}>Search</button>
        </form>
        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
          <Link href={href()} style={pill(!activeStatus)}>All</Link>
          {STATUSES.map((s) => <Link key={s} href={href(s)} style={{ ...pill(activeStatus === s), textTransform: "capitalize" }}>{s}</Link>)}
        </div>
      </div>

      {rows.length === 0 ? (
        <div style={css("background:#FFFFFF;border:1px dashed #CFE3D6;border-radius:18px;padding:clamp(28px,5vw,56px);display:flex;flex-direction:column;align-items:center;gap:12px;text-align:center")}>
          <span style={css("font-size:18px;font-weight:600")}>{filtered ? "No products match." : "No products yet."}</span>
          <span style={css("font-size:14px;color:#5E6862;max-width:420px;line-height:1.5")}>{filtered ? "Try a different search or filter." : "Add the first thing you sell: a name, a price, how many you have, and a photo or two."}</span>
          {!filtered && <Link href="/products/new" className="hv-green" style={css("background:#26734D;color:#FFFFFF;font-size:14px;font-weight:500;padding:11px 18px;border-radius:10px;margin-top:6px")}>Add your first product</Link>}
        </div>
      ) : (
        <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:14px")}>
          {rows.map((p) => {
            const low = p.productType === "physical" && p.quantityOnHand <= p.lowStockThreshold && p.status !== "archived";
            const [bg, fg] = chip[p.status] ?? chip.draft;
            const c = cover.get(p.id);
            return (
              <Link key={p.id} href={`/products/${p.id}`} className="hv-lift" style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;color:#202723;transition:transform .2s,box-shadow .2s")}>
                <div style={css("aspect-ratio:4/3;background:#F3F5F2;display:grid;place-items:center;color:#A3ABA5;font-size:13px")}>
                  {c ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={`/api/products/${p.id}/images/${c}`} alt={p.name} style={css("width:100%;height:100%;object-fit:cover")} />
                  ) : (
                    "No photo yet"
                  )}
                </div>
                <div style={css("padding:14px 16px;display:flex;flex-direction:column;gap:8px")}>
                  <div style={css("display:flex;justify-content:space-between;gap:8px;align-items:baseline")}>
                    <span style={css("font-size:15px;font-weight:500;line-height:1.3")}>{p.name}</span>
                    <span style={css("font-family:var(--font-mono);font-size:14px;white-space:nowrap")}>{formatMinor(p.priceMinor, p.currency)}</span>
                  </div>
                  <div style={css("display:flex;gap:6px;flex-wrap:wrap;font-size:12px")}>
                    <span style={{ padding: "3px 8px", borderRadius: 999, background: bg, color: fg, textTransform: "capitalize" }}>{p.status}</span>
                    <span style={{ padding: "3px 8px", borderRadius: 999, background: low ? "#FBF3E6" : "#F3F5F2", color: low ? "#8A5E1C" : "#4C5550" }}>{p.productType === "digital" ? "Digital" : p.quantityOnHand === 0 ? "Out of stock" : `${p.quantityOnHand} in stock`}</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
