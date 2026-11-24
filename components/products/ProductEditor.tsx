"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { uploadProductPhoto } from "@/lib/client-photos";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/images";

export interface EditorProduct {
  id: string; name: string; description: string; category: string; productType: "physical" | "digital";
  price: string; sku: string; lowStockThreshold: number; status: "draft" | "published" | "archived";
  quantityOnHand: number; currency: string;
}
export interface EditorAsset { id: string }
export interface EditorMovement { id: string; delta: number; reason: string; at: string }

const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px";
const input = "font-size:15px;padding:11px 13px;border:1px solid #E8ECE8;border-radius:11px;outline:none;background:#FFFFFF;width:100%;font-family:inherit;color:#202723";
const label = "display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500";
const btn = "background:#26734D;color:#FFFFFF;border:none;font-size:14px;font-weight:500;padding:11px 18px;border-radius:10px;cursor:pointer";
const ghost = "background:#FFFFFF;border:1px solid #E8ECE8;color:#202723;font-size:14px;padding:10px 16px;border-radius:10px;cursor:pointer";

const STATUS_NOTE = {
  draft: "Only you can see it.",
  published: "Visible to customers once your store is live. Your store is not live yet.",
  archived: "Hidden everywhere. You can bring it back any time.",
};
const REASON_LABEL: Record<string, string> = { initial: "Starting stock", received: "Stock received", adjustment: "Adjustment", correction: "Correction", sold: "Sold", refund: "Refund" };

export default function ProductEditor({ product, assets, movements, photoWarning }: { product: EditorProduct; assets: EditorAsset[]; movements: EditorMovement[]; photoWarning: boolean }) {
  const router = useRouter();
  const [f, setF] = useState(product);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(photoWarning ? { ok: false, text: "The product was saved, but a photo didn't upload. Add it again below." } : null);
  const [upBusy, setUpBusy] = useState(false);
  const [delta, setDelta] = useState("");
  const [reason, setReason] = useState("received");
  const [stockBusy, setStockBusy] = useState(false);
  const set = <K extends keyof EditorProduct>(k: K, v: EditorProduct[K]) => setF((x) => ({ ...x, [k]: v }));
  const sym = product.currency === "NGN" ? "₦" : product.currency + " ";
  const low = product.quantityOnHand <= product.lowStockThreshold;

  async function patch(body: Record<string, unknown>, okText: string) {
    setSaving(true);
    setMsg(null);
    const res = await fetch(`/api/products/${product.id}`, { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? "We couldn't save that." });
    setMsg({ ok: true, text: okText });
    router.refresh();
  }

  function saveDetails(e: FormEvent) {
    e.preventDefault();
    patch({ name: f.name, description: f.description, category: f.category, productType: f.productType, price: f.price, sku: f.sku, lowStockThreshold: Number(f.lowStockThreshold) || 0 }, "Saved.");
  }

  async function addPhotos(list: FileList | null) {
    if (!list || list.length === 0) return;
    const picked = Array.from(list).slice(0, MAX_IMAGES_PER_PRODUCT - assets.length); // copy before the input is cleared
    setUpBusy(true);
    setMsg(null);
    try {
      for (const file of picked) await uploadProductPhoto(product.id, file);
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: e instanceof Error ? e.message : "The photo could not be uploaded." });
    }
    setUpBusy(false);
  }

  async function removePhoto(id: string) {
    const res = await fetch(`/api/products/${product.id}/images/${id}`, { method: "DELETE" });
    if (!res.ok) return setMsg({ ok: false, text: "We couldn't remove that photo." });
    router.refresh();
  }

  async function adjust(e: FormEvent) {
    e.preventDefault();
    const n = Number(delta);
    if (!Number.isInteger(n) || n === 0) return setMsg({ ok: false, text: "Enter a whole number other than zero. Use a minus sign to remove stock." });
    setStockBusy(true);
    setMsg(null);
    const res = await fetch(`/api/products/${product.id}/stock`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ delta: n, reason, idempotencyKey: "ui-" + crypto.randomUUID().slice(0, 24) }) });
    const data = await res.json().catch(() => ({}));
    setStockBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? "We couldn't change the stock." });
    setDelta("");
    router.refresh();
  }

  async function remove() {
    if (!window.confirm(`Delete "${product.name}" permanently, with its photos and stock history? This can't be undone.`)) return;
    const res = await fetch(`/api/products/${product.id}`, { method: "DELETE" });
    if (!res.ok) return setMsg({ ok: false, text: "We couldn't delete the product." });
    router.push("/products");
    router.refresh();
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:16px")}>
      {msg && <div role="status" style={{ ...css("font-size:13px;padding:10px 12px;border-radius:10px"), background: msg.ok ? "#E9F4EE" : "#FCEEEE", color: msg.ok ? "#1F6B43" : "#8E2F2F" }}>{msg.text}</div>}

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:16px;align-items:start")}>
        <form onSubmit={saveDetails} style={css(card)}>
          <span style={css("font-size:15px;font-weight:600")}>Details</span>
          <label style={css(label)}>Name<input className="fx-input" value={f.name} onChange={(e) => set("name", e.target.value)} style={css(input)} /></label>
          <label style={css(label)}>Description<textarea className="fx-input" value={f.description} onChange={(e) => set("description", e.target.value)} rows={4} style={{ ...css(input), resize: "vertical", lineHeight: 1.5 }} /></label>
          <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:12px")}>
            <label style={css(label)}>Price ({product.currency})
              <div style={css("position:relative")}><span style={css("position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#78817B")}>{sym}</span>
                <input className="fx-input" value={f.price} onChange={(e) => set("price", e.target.value)} inputMode="decimal" style={{ ...css(input), paddingLeft: 30 }} /></div>
            </label>
            <label style={css(label)}>Category<input className="fx-input" value={f.category} onChange={(e) => set("category", e.target.value)} style={css(input)} /></label>
            <label style={css(label)}>Type
              <select className="fx-input" value={f.productType} onChange={(e) => set("productType", e.target.value as "physical" | "digital")} style={css(input)}><option value="physical">Physical product</option><option value="digital">Digital download</option></select>
            </label>
            <label style={css(label)}>SKU<input className="fx-input" value={f.sku} onChange={(e) => set("sku", e.target.value)} style={css(input)} /></label>
            <label style={css(label)}>Low-stock alert at<input className="fx-input" value={f.lowStockThreshold} onChange={(e) => set("lowStockThreshold", Number(e.target.value.replace(/\D/g, "")) || 0)} inputMode="numeric" style={css(input)} /></label>
          </div>
          <div><button type="submit" disabled={saving} className="hv-green" style={{ ...css(btn), opacity: saving ? 0.7 : 1 }}>{saving ? "Saving…" : "Save changes"}</button></div>
        </form>

        <div style={css("display:flex;flex-direction:column;gap:16px")}>
          <div style={css(card)}>
            <span style={css("font-size:15px;font-weight:600")}>Status</span>
            <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
              {(["draft", "published", "archived"] as const).map((s) => (
                <button key={s} type="button" disabled={saving} onClick={() => patch({ status: s }, s === "published" ? "Published." : s === "draft" ? "Moved to draft." : "Archived.")}
                  style={{ ...css("font-size:13px;padding:8px 14px;border-radius:999px;cursor:pointer;text-transform:capitalize;border-style:solid;border-width:1px"), background: product.status === s ? "#EEF6F0" : "#FFFFFF", borderColor: product.status === s ? "#26734D" : "#E8ECE8", color: product.status === s ? "#185C3B" : "#4C5550", fontWeight: product.status === s ? 600 : 400 }}>{s}</button>
              ))}
            </div>
            <span style={css("font-size:13px;color:#78817B;line-height:1.5")}>{STATUS_NOTE[product.status]}</span>
          </div>

          <div style={css(card)}>
            <div style={css("display:flex;justify-content:space-between;align-items:baseline")}>
              <span style={css("font-size:15px;font-weight:600")}>Stock</span>
              <span style={{ fontFamily: "var(--font-mono)", fontSize: 24, fontWeight: 600, color: low ? "#8A5E1C" : "#202723" }}>{product.quantityOnHand}</span>
            </div>
            {low && <span style={css("font-size:12px;padding:4px 10px;border-radius:999px;background:#FBF3E6;color:#8A5E1C;align-self:flex-start")}>{product.quantityOnHand === 0 ? "Out of stock" : "Low stock"}</span>}
            <form onSubmit={adjust} style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:flex-end")}>
              <label style={{ ...css(label), width: 110 }}>Change by<input className="fx-input" value={delta} onChange={(e) => setDelta(e.target.value)} placeholder="+10 or -2" inputMode="numeric" style={css(input)} /></label>
              <label style={{ ...css(label), flex: 1, minWidth: 140 }}>Reason
                <select className="fx-input" value={reason} onChange={(e) => setReason(e.target.value)} style={css(input)}><option value="received">Stock received</option><option value="adjustment">Adjustment</option><option value="correction">Correction</option></select>
              </label>
              <button type="submit" disabled={stockBusy} style={css(ghost)}>{stockBusy ? "…" : "Apply"}</button>
            </form>
            {movements.length > 0 && (
              <div style={css("display:flex;flex-direction:column;border-top:1px solid #F0F2F0")}>
                {movements.map((m) => (
                  <div key={m.id} style={css("display:flex;justify-content:space-between;gap:12px;padding:9px 0;border-bottom:1px solid #F0F2F0;font-size:13px")}>
                    <span style={css("color:#5E6862")}>{REASON_LABEL[m.reason] ?? m.reason} · {new Date(m.at).toLocaleDateString("en-GB", { day: "numeric", month: "short" })}</span>
                    <span style={{ fontFamily: "var(--font-mono)", color: m.delta > 0 ? "#1F6B43" : "#8E2F2F" }}>{m.delta > 0 ? "+" : ""}{m.delta}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div style={css(card)}>
        <div style={css("display:flex;justify-content:space-between;align-items:baseline;gap:8px;flex-wrap:wrap")}>
          <span style={css("font-size:15px;font-weight:600")}>Photos</span>
          <span style={css("font-size:12px;color:#78817B")}>{assets.length} of {MAX_IMAGES_PER_PRODUCT} · the first one is the cover. Photos are private until your store is live.</span>
        </div>
        <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          {assets.map((a, i) => (
            <div key={a.id} style={css("position:relative;width:120px;height:120px;border-radius:12px;overflow:hidden;border:1px solid #E8ECE8")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={`/api/products/${product.id}/images/${a.id}`} alt={`${product.name} photo ${i + 1}`} style={css("width:100%;height:100%;object-fit:cover")} />
              {i === 0 && <span style={css("position:absolute;left:6px;bottom:6px;font-size:10px;padding:2px 7px;border-radius:999px;background:rgba(255,255,255,.92);color:#185C3B;font-weight:500")}>Cover</span>}
              <button type="button" aria-label="Remove photo" onClick={() => removePhoto(a.id)} style={css("position:absolute;top:5px;right:5px;width:24px;height:24px;border-radius:50%;border:none;background:rgba(32,39,35,.75);color:#FFFFFF;cursor:pointer;font-size:14px;line-height:1")}>×</button>
            </div>
          ))}
          {assets.length < MAX_IMAGES_PER_PRODUCT && (
            <label style={{ ...css("width:120px;height:120px;border-radius:12px;border:1.5px dashed #CFE3D6;background:#F8FAF8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px;color:#26734D;cursor:pointer;text-align:center"), opacity: upBusy ? 0.6 : 1 }}>
              <span style={css("font-size:24px;line-height:1")}>{upBusy ? "…" : "+"}</span>{upBusy ? "Uploading" : "Add photo"}
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden disabled={upBusy} onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </div>
      </div>

      <div style={{ ...css(card), flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <span style={css("display:flex;flex-direction:column;gap:3px")}>
          <span style={css("font-size:14px;font-weight:600")}>Delete this product</span>
          <span style={css("font-size:13px;color:#78817B")}>Removes it with its photos and stock history. To hide it instead, archive it.</span>
        </span>
        <button type="button" onClick={remove} style={css("background:#FFFFFF;border:1px solid #F0D2D2;color:#D94B4B;font-size:14px;font-weight:500;padding:10px 16px;border-radius:10px;cursor:pointer")}>Delete</button>
      </div>
    </div>
  );
}
