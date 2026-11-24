import { randomInt } from "node:crypto";
import { z } from "zod";
import { db } from "@/db";
import { auditLogs, orderItems, orders } from "@/db/schema";
import { lineTotal, makeOrderCode, mergeLines, normalizePhone } from "@/lib/orders";
import { createLimiter } from "@/lib/rate-limit";
import { formatMinor } from "@/lib/money";
import { getStore, isOpen, listPublished } from "@/server/storefront";

type Ctx = { params: Promise<{ slug: string }> };

// Casual-abuse protection for a public form: per person and per store (per server process).
const perPerson = createLimiter({ windowMs: 10 * 60_000, max: 5 });
const perStore = createLimiter({ windowMs: 60 * 60_000, max: 60 });

const schema = z.object({
  customerName: z.string().trim().min(2, "Please enter your name").max(80),
  customerPhone: z.string().trim().max(30),
  deliveryAddress: z.string().trim().min(5, "Please enter your delivery address").max(300),
  note: z.string().trim().max(500).optional(),
  items: z.array(z.object({ productId: z.string().uuid(), quantity: z.number().int().min(1).max(99) })).min(1, "Your cart is empty").max(30),
});

/**
 * A customer asks to buy. We IGNORE any price the browser might send: every price and the total are
 * recomputed here from the products' current published prices. Nothing is charged, and stock is not
 * touched until the seller marks the order fulfilled.
 */
export async function POST(req: Request, { params }: Ctx) {
  const store = await getStore((await params).slug);
  if (!store || !isOpen(store)) return Response.json({ error: "This store isn't taking orders right now." }, { status: 404 });

  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "unknown";
  const a = perPerson.check(`${store.id}:${ip}`);
  const b = perStore.check(store.id);
  if (!a.ok || !b.ok) {
    return Response.json({ error: "Too many orders in a short time. Please try again in a few minutes." }, { status: 429, headers: { "retry-after": String(Math.ceil(Math.max(a.retryAfterMs, b.retryAfterMs) / 1000)) } });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: parsed.error.issues[0]?.message ?? "Please check your details." }, { status: 400 });
  const d = parsed.data;
  const phone = normalizePhone(d.customerPhone);
  if (!phone) return Response.json({ error: "Please enter a valid phone number, for example 0803 123 4567." }, { status: 400 });

  const lines = mergeLines(d.items);
  const catalogue = new Map((await listPublished(store.id)).map((p) => [p.id, p]));
  const priced: { productId: string; name: string; unit: number; qty: number }[] = [];
  for (const l of lines) {
    const p = catalogue.get(l.productId);
    if (!p || p.priceMinor === null) return Response.json({ error: "One of the items in your cart is no longer available. Please review your cart." }, { status: 409 });
    if (p.productType === "physical" && l.quantity > p.quantityOnHand) {
      return Response.json({ error: p.quantityOnHand === 0 ? `${p.name} is sold out.` : `Only ${p.quantityOnHand} of ${p.name} left.` }, { status: 409 });
    }
    priced.push({ productId: p.id, name: p.name, unit: p.priceMinor, qty: l.quantity });
  }
  const total = priced.reduce((s, l) => s + lineTotal(l.unit, l.qty), 0);

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = makeOrderCode((n) => randomInt(n));
    try {
      await db.transaction(async (tx) => {
        const [o] = await tx.insert(orders).values({
          businessId: store.id, code, customerName: d.customerName, customerPhone: phone,
          deliveryAddress: d.deliveryAddress, note: d.note || null, totalMinor: total, currency: store.currency,
        }).returning({ id: orders.id });
        await tx.insert(orderItems).values(priced.map((l) => ({ orderId: o.id, businessId: store.id, productId: l.productId, name: l.name, unitPriceMinor: l.unit, quantity: l.qty })));
        await tx.insert(auditLogs).values({ businessId: store.id, actorType: "customer", action: "order.request", targetType: "order", targetId: o.id, metadata: { code, total: formatMinor(total, store.currency), lines: priced.length } });
      });
      return Response.json({ code, total, currency: store.currency }, { status: 201 });
    } catch (e) {
      if (!/orders_code_uq|duplicate key/i.test(e instanceof Error ? e.message : "")) throw e; // only retry a code clash
    }
  }
  return Response.json({ error: "We couldn't place your order. Please try again." }, { status: 500 });
}
