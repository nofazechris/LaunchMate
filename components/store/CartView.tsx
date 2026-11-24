"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { readCart, writeCart, type CartLine } from "@/lib/cart";
import { formatMinor } from "@/lib/money";

interface Item { id: string; name: string; priceMinor: number; currency: string; productType: string; quantityOnHand: number; coverId: string | null }

const input = "font-size:15px;padding:12px 14px;border:1px solid #E1E5E1;border-radius:11px;outline:none;background:#FFFFFF;width:100%;font-family:inherit;color:#202723";
const label = "display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500";

export default function CartView({ slug, storeName }: { slug: string; storeName: string }) {
  const router = useRouter();
  const [lines, setLines] = useState<CartLine[] | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => { setLines(readCart(slug)); }, [slug]);

  useEffect(() => {
    if (lines === null) return;
    if (lines.length === 0) { setItems([]); setLoading(false); return; }
    let live = true;
    fetch(`/api/s/${slug}/cart`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ids: lines.map((l) => l.productId) }) })
      .then((r) => r.json())
      .then((d) => { if (live) { setItems(d.items ?? []); setLoading(false); } })
      .catch(() => { if (live) setLoading(false); });
    return () => { live = false; };
    // refetch only when the set of products changes, not on every quantity tap
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug, lines?.map((l) => l.productId).join(",")]);

  // Drop anything that is no longer on sale, and keep quantities within stock.
  const rows = useMemo(() => (lines ?? []).flatMap((l) => {
    const it = items.find((i) => i.id === l.productId);
    if (!it) return [];
    const max = it.productType === "physical" ? it.quantityOnHand : 99;
    return [{ it, qty: Math.min(l.quantity, Math.max(max, 0)), max }];
  }), [lines, items]);
  const total = rows.reduce((s, r) => s + r.it.priceMinor * r.qty, 0); // whole minor units
  const currency = rows[0]?.it.currency ?? "NGN";
  const blocked = rows.some((r) => r.max === 0);

  function setQty(id: string, q: number) {
    const next = (lines ?? []).map((l) => (l.productId === id ? { ...l, quantity: q } : l)).filter((l) => l.quantity > 0);
    setLines(next);
    writeCart(slug, next);
  }

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (rows.length === 0 || blocked) return setError("Please remove sold-out items from your cart.");
    setBusy(true);
    try {
      const res = await fetch(`/api/s/${slug}/orders`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ customerName: name, customerPhone: phone, deliveryAddress: address, note, items: rows.map((r) => ({ productId: r.it.id, quantity: r.qty })) }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't place your order. Please try again.");
      writeCart(slug, []);
      router.push(`/s/${slug}/order/${data.code}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't place your order. Please try again.");
      setBusy(false);
    }
  }

  if (lines === null || loading) return <p style={css("color:#78817B")}>Loading your cart…</p>;
  if (rows.length === 0) {
    return (
      <div style={css("display:flex;flex-direction:column;gap:14px;align-items:flex-start")}>
        <p style={css("margin:0;font-size:16px;color:#5E6862")}>Your cart is empty.</p>
        <Link href={`/s/${slug}`} style={css("background:#202723;color:#FFFFFF;padding:12px 18px;border-radius:11px;font-size:14px;font-weight:500")}>Keep shopping</Link>
      </div>
    );
  }

  return (
    <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:clamp(20px,4vw,48px);align-items:start")}>
      <div style={css("display:flex;flex-direction:column;border-top:1px solid #E8ECE8")}>
        {rows.map(({ it, qty, max }) => (
          <div key={it.id} style={css("display:flex;gap:14px;padding:16px 0;border-bottom:1px solid #E8ECE8;align-items:center")}>
            <div style={css("width:72px;height:72px;border-radius:12px;overflow:hidden;background:#F3F5F2;flex-shrink:0")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              {it.coverId && <img src={`/api/s/${slug}/images/${it.coverId}`} alt="" style={css("width:100%;height:100%;object-fit:cover")} />}
            </div>
            <div style={css("flex:1;display:flex;flex-direction:column;gap:6px;min-width:0")}>
              <Link href={`/s/${slug}/p/${it.id}`} style={css("font-size:15px;font-weight:500;color:#202723")}>{it.name}</Link>
              <span style={css("font-size:14px;color:#5E6862")}>{formatMinor(it.priceMinor, it.currency)}{max === 0 && <b style={css("color:#8E2F2F;font-weight:500")}> · Sold out</b>}{max > 0 && max < 99 && qty >= max && <span style={css("color:#8A5E1C")}> · Only {max} available</span>}</span>
              <div style={css("display:flex;gap:10px;align-items:center")}>
                <div style={css("display:flex;align-items:center;border:1px solid #E1E5E1;border-radius:9px;overflow:hidden")}>
                  <button type="button" aria-label="Fewer" onClick={() => setQty(it.id, qty - 1)} style={css("width:32px;height:32px;border:none;background:#FFFFFF;cursor:pointer;font-size:16px")}>−</button>
                  <span style={css("min-width:28px;text-align:center;font-size:14px")}>{qty}</span>
                  <button type="button" aria-label="More" disabled={qty >= max} onClick={() => setQty(it.id, qty + 1)} style={{ ...css("width:32px;height:32px;border:none;background:#FFFFFF;cursor:pointer;font-size:16px"), opacity: qty >= max ? 0.35 : 1 }}>+</button>
                </div>
                <button type="button" onClick={() => setQty(it.id, 0)} style={css("background:none;border:none;color:#78817B;font-size:13px;cursor:pointer;text-decoration:underline")}>Remove</button>
              </div>
            </div>
            <span style={css("font-family:var(--font-mono);font-size:14px;white-space:nowrap")}>{formatMinor(it.priceMinor * qty, it.currency)}</span>
          </div>
        ))}
        <div style={css("display:flex;justify-content:space-between;padding:18px 0;font-size:17px;font-weight:600")}>
          <span>Total</span><span style={css("font-family:var(--font-mono)")}>{formatMinor(total, currency)}</span>
        </div>
      </div>

      <form onSubmit={submit} style={css("display:flex;flex-direction:column;gap:14px;background:#F8FAF8;border:1px solid #E8ECE8;border-radius:18px;padding:22px")}>
        <div style={css("display:flex;flex-direction:column;gap:6px")}>
          <span style={css("font-size:17px;font-weight:600")}>Send your order to {storeName}</span>
          <span style={css("font-size:13px;color:#5E6862;line-height:1.5")}>You won&apos;t be charged now. {storeName} will contact you to confirm your order and arrange payment and delivery.</span>
        </div>
        <label style={css(label)}>Your name<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required className="fx-input" style={css(input)} /></label>
        <label style={css(label)}>Phone number <span style={css("font-weight:400;color:#78817B;font-size:12px")}>So the seller can reach you on WhatsApp or by call</span>
          <input value={phone} onChange={(e) => setPhone(e.target.value)} inputMode="tel" autoComplete="tel" placeholder="0803 123 4567" required className="fx-input" style={css(input)} /></label>
        <label style={css(label)}>Delivery address<textarea value={address} onChange={(e) => setAddress(e.target.value)} rows={3} autoComplete="street-address" required className="fx-input" style={{ ...css(input), resize: "vertical" }} /></label>
        <label style={css(label)}>Note for the seller <span style={css("font-weight:400;color:#78817B;font-size:12px")}>Optional: size, colour, anything else</span><textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} className="fx-input" style={{ ...css(input), resize: "vertical" }} /></label>
        {error && <div role="alert" style={css("font-size:13px;padding:10px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{error}</div>}
        <button type="submit" disabled={busy || blocked} className="press" style={{ ...css("height:48px;border:none;border-radius:12px;background:#202723;color:#FFFFFF;font-size:15px;font-weight:500;cursor:pointer"), opacity: busy || blocked ? 0.6 : 1 }}>{busy ? "Sending…" : "Send order request"}</button>
      </form>
    </div>
  );
}
