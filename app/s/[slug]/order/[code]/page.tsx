import Link from "next/link";
import { notFound } from "next/navigation";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import { css } from "@/lib/css";
import { formatMinor } from "@/lib/money";
import { getVisibleStore } from "@/server/storefront";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order sent", robots: { index: false } };

export default async function Page({ params }: { params: Promise<{ slug: string; code: string }> }) {
  const p = await params;
  const store = await getVisibleStore(p.slug);
  if (!store) return null; // closed (or missing): order details are not read
  if (!/^[A-Z2-9]{8}$/.test(p.code)) notFound();
  const [o] = await db.select().from(orders).where(and(eq(orders.code, p.code), eq(orders.businessId, store.id))).limit(1);
  if (!o) notFound();
  const items = await db.select().from(orderItems).where(eq(orderItems.orderId, o.id));
  const first = o.customerName.split(/\s+/)[0];

  return (
    <div style={css("display:flex;flex-direction:column;gap:22px;max-width:560px")}>
      <div style={css("display:flex;flex-direction:column;gap:10px")}>
        <span style={css("width:44px;height:44px;border-radius:50%;background:#E9F4EE;color:#1F6B43;display:grid;place-items:center;font-size:20px")}>✓</span>
        <h1 style={css("margin:0;font-size:clamp(26px,3.4vw,34px);letter-spacing:-.025em;font-weight:600")}>Thank you, {first}.</h1>
        <p style={css("margin:0;font-size:16px;line-height:1.6;color:#4C5550")}>Your order request has been sent to {store.name}. They&apos;ll contact you on <b>{o.customerPhone}</b> to confirm it and arrange payment and delivery. <b>You haven&apos;t been charged.</b></p>
      </div>
      <div style={css("display:flex;flex-direction:column;gap:4px;padding:16px 18px;border-radius:14px;background:#F8FAF8;border:1px solid #E8ECE8")}>
        <span style={css("font-size:12px;color:#78817B")}>Your order code. Keep it.</span>
        <span style={css("font-family:var(--font-mono);font-size:24px;letter-spacing:.08em")}>{o.code}</span>
      </div>
      <div style={css("display:flex;flex-direction:column;border-top:1px solid #E8ECE8")}>
        {items.map((it) => (
          <div key={it.id} style={css("display:flex;justify-content:space-between;gap:12px;padding:12px 0;border-bottom:1px solid #E8ECE8;font-size:15px")}>
            <span>{it.name} × {it.quantity}</span>
            <span style={css("font-family:var(--font-mono)")}>{formatMinor(it.unitPriceMinor * it.quantity, o.currency)}</span>
          </div>
        ))}
        <div style={css("display:flex;justify-content:space-between;padding:14px 0;font-weight:600;font-size:16px")}>
          <span>Total</span><span style={css("font-family:var(--font-mono)")}>{formatMinor(o.totalMinor, o.currency)}</span>
        </div>
      </div>
      <Link href={`/s/${p.slug}`} style={css("font-size:14px;color:#185C3B;font-weight:500")}>← Back to the store</Link>
    </div>
  );
}
