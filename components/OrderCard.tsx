"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { formatMinor } from "@/lib/money";
import { whatsappDigits } from "@/lib/orders";

export interface OrderView {
  id: string; code: string; status: "new" | "contacted" | "fulfilled" | "cancelled";
  customerName: string; customerPhone: string; deliveryAddress: string; note: string | null;
  totalMinor: number; currency: string; createdAt: string;
  items: { name: string; quantity: number; unitPriceMinor: number }[];
}

const CHIP: Record<string, [string, string, string]> = {
  new: ["New", "#FBF3E6", "#8A5E1C"], contacted: ["Contacted", "#EAF2F8", "#2F6A92"],
  fulfilled: ["Fulfilled", "#E9F4EE", "#1F6B43"], cancelled: ["Cancelled", "#F1F2F1", "#5E6862"],
};
const btn = "font-size:13px;padding:8px 13px;border-radius:9px;border:1px solid #E8ECE8;background:#FFFFFF;color:#202723;cursor:pointer";

export default function OrderCard({ o, storeName }: { o: OrderView; storeName: string }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [label, bg, fg] = CHIP[o.status];
  const first = o.customerName.split(/\s+/)[0];
  const wa = `https://wa.me/${whatsappDigits(o.customerPhone)}?text=${encodeURIComponent(`Hello ${first}, this is ${storeName} about your order ${o.code}.`)}`;

  async function move(status: "contacted" | "fulfilled" | "cancelled") {
    if (status === "fulfilled" && !window.confirm("Mark as fulfilled? This takes the items out of your stock.")) return;
    if (status === "cancelled" && !window.confirm("Cancel this order request?")) return;
    setBusy(true);
    setErr(null);
    const res = await fetch(`/api/orders/${o.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setErr(data.error ?? "We couldn't update this order.");
    router.refresh();
  }

  const open = o.status === "new" || o.status === "contacted";
  return (
    <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:12px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap")}>
        <span style={css("display:flex;gap:10px;align-items:center;flex-wrap:wrap")}>
          <span style={css("font-family:var(--font-mono);font-size:14px;letter-spacing:.06em")}>{o.code}</span>
          <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 999, background: bg, color: fg, fontWeight: 500 }}>{label}</span>
        </span>
        <span style={css("font-size:12px;color:#78817B")}>{new Date(o.createdAt).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}</span>
      </div>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:14px;font-size:14px")}>
        <div style={css("display:flex;flex-direction:column;gap:3px")}>
          <span style={css("font-size:12px;color:#78817B")}>Customer</span>
          <span style={css("font-weight:500")}>{o.customerName}</span>
          <a href={`tel:${o.customerPhone}`} style={css("color:#185C3B")}>{o.customerPhone}</a>
          <span style={css("color:#5E6862;line-height:1.45;white-space:pre-wrap")}>{o.deliveryAddress}</span>
          {o.note && <span style={css("color:#5E6862;font-style:italic")}>“{o.note}”</span>}
        </div>
        <div style={css("display:flex;flex-direction:column;gap:6px")}>
          <span style={css("font-size:12px;color:#78817B")}>Items</span>
          {o.items.map((it) => (
            <span key={it.name} style={css("display:flex;justify-content:space-between;gap:10px")}><span>{it.name} × {it.quantity}</span><span style={css("font-family:var(--font-mono)")}>{formatMinor(it.unitPriceMinor * it.quantity, o.currency)}</span></span>
          ))}
          <span style={css("display:flex;justify-content:space-between;gap:10px;font-weight:600;border-top:1px solid #F0F2F0;padding-top:6px")}><span>Total</span><span style={css("font-family:var(--font-mono)")}>{formatMinor(o.totalMinor, o.currency)}</span></span>
        </div>
      </div>
      {err && <div role="alert" style={css("font-size:13px;padding:9px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{err}</div>}
      <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
        <a href={wa} target="_blank" rel="noopener noreferrer" style={{ ...css(btn), background: "#E9F4EE", borderColor: "#CFE3D6", color: "#1F6B43", fontWeight: 500 }}>Message on WhatsApp</a>
        {o.status === "new" && <button disabled={busy} onClick={() => move("contacted")} style={css(btn)}>Mark contacted</button>}
        {open && <button disabled={busy} onClick={() => move("fulfilled")} style={css(btn)}>Mark fulfilled</button>}
        {open && <button disabled={busy} onClick={() => move("cancelled")} style={css(btn)}>Cancel</button>}
      </div>
    </div>
  );
}
