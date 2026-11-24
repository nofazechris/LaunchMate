"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { addToCart, cartCount, readCart } from "@/lib/cart";

/** "Cart (2)" in the store header; updates as items are added. */
export function CartLink({ slug }: { slug: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    const update = () => setN(cartCount(readCart(slug)));
    update();
    window.addEventListener("lm-cart", update);
    window.addEventListener("storage", update);
    return () => { window.removeEventListener("lm-cart", update); window.removeEventListener("storage", update); };
  }, [slug]);
  return <Link href={`/s/${slug}/cart`} style={css("font-size:14px;color:#202723;display:flex;gap:6px;align-items:center;padding:8px 4px")}>Cart{n > 0 && <span style={css("min-width:20px;height:20px;border-radius:999px;background:#202723;color:#FFFFFF;font-size:12px;display:grid;place-items:center;padding:0 6px")}>{n}</span>}</Link>;
}

/** Quantity picker and the add button on a product page. */
export function AddToCart({ slug, productId, max, soldOut }: { slug: string; productId: string; max: number | null; soldOut: boolean }) {
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const cap = max === null ? 99 : Math.max(1, Math.min(99, max));
  if (soldOut) return <div style={css("padding:14px 16px;border-radius:12px;background:#F3F5F2;color:#5E6862;font-size:15px;text-align:center")}>Sold out</div>;
  return (
    <div style={css("display:flex;flex-direction:column;gap:12px")}>
      <div style={css("display:flex;gap:12px;align-items:center;flex-wrap:wrap")}>
        <div style={css("display:flex;align-items:center;border:1px solid #E1E5E1;border-radius:12px;overflow:hidden")}>
          <button type="button" aria-label="Fewer" onClick={() => { setQty((q) => Math.max(1, q - 1)); setAdded(false); }} style={css("width:42px;height:46px;border:none;background:#FFFFFF;font-size:18px;cursor:pointer")}>−</button>
          <span aria-live="polite" style={css("min-width:36px;text-align:center;font-size:16px")}>{qty}</span>
          <button type="button" aria-label="More" onClick={() => { setQty((q) => Math.min(cap, q + 1)); setAdded(false); }} style={css("width:42px;height:46px;border:none;background:#FFFFFF;font-size:18px;cursor:pointer")}>+</button>
        </div>
        <button type="button" onClick={() => { addToCart(slug, productId, qty); setAdded(true); }} className="press" style={css("flex:1;min-width:160px;height:46px;border:none;border-radius:12px;background:#202723;color:#FFFFFF;font-size:15px;font-weight:500;cursor:pointer")}>Add to cart</button>
      </div>
      {added && <Link href={`/s/${slug}/cart`} style={css("font-size:14px;color:#185C3B;font-weight:500")}>Added. View your cart →</Link>}
    </div>
  );
}

/** Large photo with thumbnails to switch between photos. */
export function Gallery({ slug, ids, alt }: { slug: string; ids: string[]; alt: string }) {
  const [i, setI] = useState(0);
  if (ids.length === 0) return <div style={css("aspect-ratio:1;border-radius:18px;background:#F3F5F2;display:grid;place-items:center;color:#A3ABA5;font-size:14px")}>No photo</div>;
  const src = (id: string) => `/api/s/${slug}/images/${id}`;
  return (
    <div style={css("display:flex;flex-direction:column;gap:10px")}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src(ids[i])} alt={`${alt} (photo ${i + 1} of ${ids.length})`} style={css("width:100%;aspect-ratio:1;object-fit:cover;border-radius:18px;background:#F3F5F2")} />
      {ids.length > 1 && (
        <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
          {ids.map((id, k) => (
            <button key={id} type="button" aria-label={`Show photo ${k + 1}`} onClick={() => setI(k)} style={{ ...css("width:64px;height:64px;padding:0;border-radius:10px;overflow:hidden;cursor:pointer;background:none;border-style:solid;border-width:2px"), borderColor: k === i ? "#202723" : "transparent" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src(id)} alt="" style={css("width:100%;height:100%;object-fit:cover")} />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
