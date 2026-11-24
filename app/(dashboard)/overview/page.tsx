import Link from "next/link";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import { agentMemory, productAssets, products } from "@/db/schema";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { boxes } from "@/lib/data";
import { css } from "@/lib/css";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Overview · Launchmate" };

const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px";

type Alert = { tone: "warn" | "info"; title: string; detail: string; href: string; cta: string };
type Step = { title: string; note: string; state: "done" | "ready" | "soon"; href?: string };

const names = (list: string[]) => (list.length <= 3 ? list.join(", ") : `${list.slice(0, 3).join(", ")} and ${list.length - 3} more`);
const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`;

export default async function Page() {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!; // the dashboard layout guarantees one

  const live = await db.select().from(products).where(and(eq(products.businessId, business.id), ne(products.status, "archived")));
  const withPhoto = new Set(
    (await db.selectDistinct({ id: productAssets.productId }).from(productAssets).where(eq(productAssets.businessId, business.id))).map((r) => r.id),
  );
  const [domainMem] = await db.select({ value: agentMemory.value }).from(agentMemory)
    .where(and(eq(agentMemory.businessId, business.id), eq(agentMemory.key, "preferred_domain"))).limit(1);
  const hasDomainChoice = !!(domainMem?.value as { domain?: string } | undefined)?.domain;

  // What needs attention right now: computed from your real products each time you open this page.
  const physical = live.filter((p) => p.productType === "physical");
  const out = physical.filter((p) => p.quantityOnHand === 0);
  const low = physical.filter((p) => p.quantityOnHand > 0 && p.quantityOnHand <= p.lowStockThreshold);
  const noPrice = live.filter((p) => p.priceMinor === null);
  const noPhoto = live.filter((p) => !withPhoto.has(p.id));

  const alerts: Alert[] = [];
  if (live.length === 0) alerts.push({ tone: "info", title: "Add your first product", detail: "Your store needs something to sell. It takes a minute: a name, a price, and a photo.", href: "/products/new", cta: "Add a product" });
  if (out.length) alerts.push({ tone: "warn", title: `${plural(out.length, "product is", "products are")} out of stock`, detail: names(out.map((p) => p.name)), href: "/products", cta: "Update stock" });
  if (low.length) alerts.push({ tone: "warn", title: `${plural(low.length, "product is", "products are")} running low`, detail: names(low.map((p) => `${p.name} (${p.quantityOnHand} left)`)), href: "/products", cta: "Review" });
  if (noPrice.length) alerts.push({ tone: "warn", title: `${plural(noPrice.length, "product has", "products have")} no price`, detail: `${names(noPrice.map((p) => p.name))}. Customers can't buy without a price.`, href: "/products", cta: "Add prices" });
  if (noPhoto.length) alerts.push({ tone: "info", title: `${plural(noPhoto.length, "product has", "products have")} no photo`, detail: `${names(noPhoto.map((p) => p.name))}. Clear photos help customers trust what they buy.`, href: "/products", cta: "Add photos" });
  if (!hasDomainChoice) alerts.push({ tone: "info", title: "Choose your store address", detail: "Pick the web address you want customers to type.", href: "/domain", cta: "Choose" });

  const steps: Step[] = [
    { title: "Your business is set up", note: "Your details are saved and you can change them any time.", state: "done" },
    { title: live.length > 0 ? `Add more products (${live.length} so far)` : "Add your products", note: "What you sell, with photos, prices and stock.", state: live.length > 0 ? "done" : "ready", href: "/products" },
    { title: "Choose your store address", note: "Your free address is reserved. You can ask for your own domain too.", state: hasDomainChoice ? "done" : "ready", href: "/domain" },
    { title: "Take payments", note: "Customers pay into your own account. Coming soon.", state: "soon" },
    { title: "Open your store", note: "Share one link and start selling. Coming soon.", state: "soon" },
  ];
  const chip = { done: ["Done", "#E9F4EE", "#1F6B43"], ready: ["Ready", "#EAF2F8", "#2F6A92"], soon: ["Soon", "#F3F5F2", "#78817B"] } as const;

  const first = user.name.trim().split(/\s+/)[0];
  const base = process.env.STOREFRONT_BASE_DOMAIN;
  const scene = boxes(live.length > 0 ? 3 : 1, null);

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:16px;max-width:1100px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Welcome, {first}</h1>
        <span style={css("font-size:14px;color:#78817B")}>Here is where {business.name} stands.</span>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:12px;align-items:start")}>
        <div style={css(card)}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}>
            <span style={css("font-size:17px;font-weight:600")}>{business.name}</span>
            <span style={css("font-size:12px;padding:3px 9px;border-radius:999px;background:#FBF3E6;color:#8A5E1C;font-weight:500")}>Not live yet</span>
          </div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:12px;font-size:13px")}>
            <div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("color:#78817B")}>Category</span><span>{business.category || "Not set"}</span></div>
            <div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("color:#78817B")}>Currency</span><span>{business.currency}</span></div>
            <div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("color:#78817B")}>Products</span><span style={css("font-family:var(--font-mono)")}>{live.length}</span></div>
          </div>
          <div style={css("font-size:13px;color:#5E6862;line-height:1.5;padding-top:10px;border-top:1px solid #F0F2F0")}>
            Your store address: <span style={css("font-family:var(--font-mono);color:#202723")}>{base ? `${business.slug}.${base}` : business.slug}</span>
          </div>
        </div>

        <div aria-hidden style={css("position:relative;aspect-ratio:1/0.82;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden;container-type:size")}>
          <IsoScene size={62} offset={8} transform="rotateX(58deg) rotateZ(45deg)" sway={14}>
            <IsoBoxes boxes={scene} variant="flat" />
          </IsoScene>
          <span style={css("position:absolute;left:12px;top:10px;font-size:12px;color:#5E6862;background:#FFFFFF;padding:3px 10px;border-radius:999px;border:1px solid #E8ECE8")}>Your store · taking shape</span>
        </div>
      </div>

      <div style={css(card)}>
        <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap")}>
          <span style={css("font-size:15px;font-weight:600")}>Needs your attention</span>
          <span style={css("font-size:12px;color:#78817B")}>Checked when you open this page</span>
        </div>
        {alerts.length === 0 ? (
          <div style={css("display:flex;gap:12px;align-items:center;font-size:14px;color:#1F6B43;background:#E9F4EE;border-radius:12px;padding:14px")}>
            <span aria-hidden>✓</span>Everything looks good right now. Nothing needs you.
          </div>
        ) : (
          alerts.map((a) => (
            <div key={a.title} style={css("display:flex;gap:14px;align-items:center;justify-content:space-between;padding:12px 14px;border-radius:12px;background:#F8FAF8;flex-wrap:wrap")}>
              <span style={css("display:flex;gap:12px;align-items:flex-start;flex:1;min-width:220px")}>
                <span style={{ width: 8, height: 8, borderRadius: "50%", marginTop: 6, flexShrink: 0, background: a.tone === "warn" ? "#C58B34" : "#4285B5" }} />
                <span style={css("display:flex;flex-direction:column;gap:2px")}>
                  <span style={css("font-size:14px;font-weight:500")}>{a.title}</span>
                  <span style={css("font-size:13px;color:#5E6862;line-height:1.45")}>{a.detail}</span>
                </span>
              </span>
              <Link href={a.href} className="hv-grey" style={css("font-size:13px;padding:7px 12px;border-radius:9px;border:1px solid #E8ECE8;background:#FFFFFF;color:#202723;white-space:nowrap")}>{a.cta}</Link>
            </div>
          ))
        )}
      </div>

      <div style={css(card)}>
        <span style={css("font-size:15px;font-weight:600")}>Getting to your first sale</span>
        {steps.map((s) => {
          const [label, bg, fg] = chip[s.state];
          const body = (
            <>
              <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", fontSize: 11, color: "#FFFFFF", background: s.state === "done" ? "#26734D" : "#FFFFFF", border: `1.5px solid ${s.state === "done" ? "#26734D" : "#D5DBD6"}` }}>{s.state === "done" ? "✓" : ""}</span>
              <span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}>
                <span style={css("font-size:15px;color:#202723")}>{s.title}</span>
                <span style={css("font-size:13px;color:#78817B;line-height:1.45")}>{s.note}</span>
              </span>
              <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 999, background: bg, color: fg, whiteSpace: "nowrap" }}>{label}</span>
            </>
          );
          const row = css("display:flex;align-items:center;gap:14px;padding:12px 0;border-top:1px solid #F0F2F0");
          return s.href ? <Link key={s.title} href={s.href} style={row}>{body}</Link> : <div key={s.title} style={row}>{body}</div>;
        })}
      </div>
    </div>
  );
}
