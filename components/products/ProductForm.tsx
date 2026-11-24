"use client";

import { useEffect, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { uploadProductPhoto } from "@/lib/client-photos";
import { MAX_IMAGES_PER_PRODUCT } from "@/lib/images";

const input = "font-size:15px;padding:11px 13px;border:1px solid #E8ECE8;border-radius:11px;outline:none;background:#FFFFFF;width:100%;font-family:inherit;color:#202723";
const label = "display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500";
const hint = "font-weight:400;font-size:12px;color:#78817B";

/** Create a product, with optional photos and starting stock. */
export default function ProductForm({ currency }: { currency: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [productType, setProductType] = useState<"physical" | "digital">("physical");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("");
  const [sku, setSku] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [busy, setBusy] = useState<null | "draft" | "publish">(null);
  const [error, setError] = useState<string | null>(null);
  const sym = currency === "NGN" ? "₦" : currency + " ";

  useEffect(() => {
    const urls = files.map((f) => URL.createObjectURL(f));
    setPreviews(urls);
    return () => urls.forEach(URL.revokeObjectURL);
  }, [files]);

  function pick(list: FileList | null) {
    if (!list) return;
    // Copy now: the input is cleared right after this call, which empties a live FileList.
    const picked = Array.from(list);
    setFiles((cur) => [...cur, ...picked].slice(0, MAX_IMAGES_PER_PRODUCT));
  }

  async function submit(e: FormEvent, publish: boolean) {
    e.preventDefault();
    setError(null);
    if (name.trim().length < 2) return setError("Give the product a name.");
    if (publish && !price.trim()) return setError("Add a price before publishing.");
    const qty = quantity.trim() === "" ? 0 : Number(quantity);
    if (!Number.isInteger(qty) || qty < 0) return setError("Stock must be a whole number, zero or more.");
    setBusy(publish ? "publish" : "draft");
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, description, category, productType, price, sku, quantity: qty, status: publish ? "published" : "draft" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error ?? "We couldn't save the product.");
      const id: string = data.product.id;
      // Photos go up after the product exists. If one fails, the product is still saved and the edit page lets you retry.
      let failed = false;
      for (const f of files) {
        try { await uploadProductPhoto(id, f); } catch { failed = true; }
      }
      router.push(failed ? `/products/${id}?photos=failed` : `/products/${id}`);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "We couldn't save the product.");
      setBusy(null);
    }
  }

  return (
    <form onSubmit={(e) => submit(e, false)} noValidate style={css("display:flex;flex-direction:column;gap:20px")}>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));gap:16px")}>
        <label style={{ ...css(label), gridColumn: "1 / -1" }}>Product name
          <input className="fx-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Ankara wrap dress" style={css(input)} autoFocus />
        </label>
        <label style={{ ...css(label), gridColumn: "1 / -1" }}>Description <span style={css(hint)}>What it is and what the customer gets. Only facts you know: sizes, materials, what is in the box.</span>
          <textarea className="fx-input" value={description} onChange={(e) => setDescription(e.target.value)} rows={4} style={{ ...css(input), resize: "vertical", lineHeight: 1.5 }} />
        </label>
        <label style={css(label)}>Price ({currency})
          <div style={css("position:relative")}>
            <span style={css("position:absolute;left:13px;top:50%;transform:translateY(-50%);color:#78817B;font-size:15px")}>{sym}</span>
            <input className="fx-input" value={price} onChange={(e) => setPrice(e.target.value)} inputMode="decimal" placeholder="0.00" style={{ ...css(input), paddingLeft: 30 }} />
          </div>
        </label>
        <label style={css(label)}>Starting stock <span style={css(hint)}>How many you have right now.</span>
          <input className="fx-input" value={quantity} onChange={(e) => setQuantity(e.target.value)} inputMode="numeric" placeholder="0" style={css(input)} />
        </label>
        <label style={css(label)}>Category <span style={css(hint)}>Optional</span>
          <input className="fx-input" value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. Dresses" style={css(input)} />
        </label>
        <label style={css(label)}>Type
          <select className="fx-input" value={productType} onChange={(e) => setProductType(e.target.value as "physical" | "digital")} style={css(input)}>
            <option value="physical">Physical product</option>
            <option value="digital">Digital download</option>
          </select>
        </label>
        <label style={css(label)}>SKU <span style={css(hint)}>Optional, your own code</span>
          <input className="fx-input" value={sku} onChange={(e) => setSku(e.target.value)} style={css(input)} />
        </label>
      </div>

      <div style={css("display:flex;flex-direction:column;gap:10px")}>
        <span style={css("font-size:13px;font-weight:500")}>Photos <span style={css(hint)}>Up to {MAX_IMAGES_PER_PRODUCT}. Clear, well-lit photos of the real product build trust. They are resized on your device.</span></span>
        <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          {previews.map((u, i) => (
            <div key={u} style={css("position:relative;width:92px;height:92px;border-radius:12px;overflow:hidden;border:1px solid #E8ECE8")}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={u} alt="" style={css("width:100%;height:100%;object-fit:cover")} />
              <button type="button" aria-label="Remove photo" onClick={() => setFiles((f) => f.filter((_, k) => k !== i))} style={css("position:absolute;top:4px;right:4px;width:22px;height:22px;border-radius:50%;border:none;background:rgba(32,39,35,.75);color:#FFFFFF;cursor:pointer;font-size:13px;line-height:1")}>×</button>
            </div>
          ))}
          {files.length < MAX_IMAGES_PER_PRODUCT && (
            <label style={css("width:92px;height:92px;border-radius:12px;border:1.5px dashed #CFE3D6;background:#F8FAF8;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:2px;font-size:12px;color:#26734D;cursor:pointer;text-align:center")}>
              <span style={css("font-size:22px;line-height:1")}>+</span>Add photo
              <input type="file" accept="image/jpeg,image/png,image/webp" multiple hidden onChange={(e) => { pick(e.target.files); e.target.value = ""; }} />
            </label>
          )}
        </div>
      </div>

      {error && <div role="alert" style={css("font-size:13px;padding:10px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{error}</div>}

      <div style={css("display:flex;gap:10px;align-items:center;flex-wrap:wrap")}>
        <button type="submit" disabled={!!busy} className="hv-green press" style={{ ...css("background:#26734D;color:#FFFFFF;border:none;font-size:15px;font-weight:500;padding:12px 20px;border-radius:11px;cursor:pointer"), opacity: busy ? 0.7 : 1 }}>{busy === "draft" ? "Saving…" : "Save as draft"}</button>
        <button type="button" disabled={!!busy} onClick={(e) => submit(e as unknown as FormEvent, true)} className="hv-grey" style={css("background:#FFFFFF;border:1px solid #CFE3D6;color:#185C3B;font-size:15px;font-weight:500;padding:12px 18px;border-radius:11px;cursor:pointer")}>{busy === "publish" ? "Publishing…" : "Save and publish"}</button>
        <Link href="/products" style={css("font-size:14px;color:#5E6862;padding:12px 6px")}>Cancel</Link>
      </div>
      <span style={css("font-size:12px;color:#78817B;line-height:1.5")}>Published products become visible to customers once your store is live. Your store is not live yet, so nothing is shown publicly today.</span>
    </form>
  );
}
