import Link from "next/link";
import { headers } from "next/headers";
import { and, count, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import StoreToggle from "@/components/StoreToggle";
import { css } from "@/lib/css";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Your store · Launchmate" };

const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:14px";

export default async function Page() {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!;
  const [{ n }] = await db.select({ n: count() }).from(products)
    .where(and(eq(products.businessId, business.id), eq(products.status, "published"), isNotNull(products.priceMinor)));
  const open = business.status === "live";

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  const url = `${proto}://${host}/s/${business.slug}`;

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:16px;max-width:760px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Your store</h1>
        <span style={css("font-size:14px;color:#78817B")}>What customers see, and when.</span>
      </div>

      <div style={css(card)}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}>
          <span style={css("font-size:15px;font-weight:600")}>{open ? "Your store is open" : "Your store is closed"}</span>
          <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 999, fontWeight: 500, background: open ? "#E9F4EE" : "#FBF3E6", color: open ? "#1F6B43" : "#8A5E1C" }}>{open ? "Open" : "Closed"}</span>
        </div>
        <span style={css("font-size:14px;color:#5E6862;line-height:1.5")}>
          {open
            ? `Customers can see your ${n} published ${n === 1 ? "product" : "products"} and send you order requests.`
            : n > 0
              ? `You have ${n} published ${n === 1 ? "product" : "products"} ready. Customers can't see them until you open your store.`
              : "Add and publish a product, then open your store."}
        </span>
        <StoreToggle open={open} canOpen={n > 0} />
      </div>

      <div style={css(card)}>
        <span style={css("font-size:15px;font-weight:600")}>Your store link</span>
        <span style={css("font-family:var(--font-mono);font-size:14px;word-break:break-all;background:#F8FAF8;border:1px solid #E8ECE8;border-radius:10px;padding:12px 14px")}>{url}</span>
        <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          <Link href={`/s/${business.slug}`} target="_blank" className="hv-grey" style={css("font-size:14px;padding:10px 16px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;color:#202723")}>{open ? "View my store" : "Preview my store"}</Link>
          <Link href="/domain" style={css("font-size:14px;padding:10px 6px;color:#185C3B")}>Get your own address</Link>
        </div>
        {!open && <span style={css("font-size:13px;color:#78817B;line-height:1.5")}>Only you can see the preview while your store is closed.</span>}
      </div>

      <div style={css(card)}>
        <span style={css("font-size:15px;font-weight:600")}>How orders work for now</span>
        <span style={css("font-size:14px;color:#5E6862;line-height:1.55")}>A customer picks products and sends you an order request with their name, phone and address. <b>Nobody is charged.</b> You contact them (there&apos;s a WhatsApp button), agree payment and delivery, then mark the order fulfilled and your stock updates. Payments inside the store are coming.</span>
        <Link href="/orders" style={css("font-size:14px;color:#185C3B;font-weight:500")}>Go to Orders →</Link>
      </div>
    </div>
  );
}
