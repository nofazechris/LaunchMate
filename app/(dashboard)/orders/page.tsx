import { desc, eq, inArray } from "drizzle-orm";
import { db } from "@/db";
import { orderItems, orders } from "@/db/schema";
import OrderCard, { type OrderView } from "@/components/OrderCard";
import { css } from "@/lib/css";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Orders · Launchmate" };

export default async function Page() {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!;
  const rows = await db.select().from(orders).where(eq(orders.businessId, business.id)).orderBy(desc(orders.createdAt)).limit(100);
  const items = rows.length ? await db.select().from(orderItems).where(inArray(orderItems.orderId, rows.map((r) => r.id))) : [];

  const views: OrderView[] = rows.map((o) => ({
    id: o.id, code: o.code, status: o.status, customerName: o.customerName, customerPhone: o.customerPhone,
    deliveryAddress: o.deliveryAddress, note: o.note, totalMinor: o.totalMinor, currency: o.currency, createdAt: o.createdAt.toISOString(),
    items: items.filter((i) => i.orderId === o.id).map((i) => ({ name: i.name, quantity: i.quantity, unitPriceMinor: i.unitPriceMinor })),
  }));
  const fresh = views.filter((v) => v.status === "new").length;

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:16px;max-width:900px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Orders</h1>
        <span style={css("font-size:14px;color:#78817B")}>{views.length === 0 ? "Order requests from customers appear here." : `${fresh} new · ${views.length} in total`}</span>
      </div>
      {views.length === 0 ? (
        <div style={css("background:#FFFFFF;border:1px dashed #CFE3D6;border-radius:18px;padding:clamp(28px,5vw,48px);text-align:center;display:flex;flex-direction:column;gap:8px;align-items:center")}>
          <span style={css("font-size:17px;font-weight:600")}>No orders yet.</span>
          <span style={css("font-size:14px;color:#5E6862;max-width:420px;line-height:1.5")}>When your store is open and a customer sends an order request, it shows up here, and you can message them on WhatsApp.</span>
        </div>
      ) : (
        views.map((v) => <OrderCard key={v.id} o={v} storeName={business.name} />)
      )}
    </div>
  );
}
