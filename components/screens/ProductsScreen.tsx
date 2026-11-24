"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { PRODUCTS } from "@/lib/data";

export default function ProductsScreen() {
  return (
    <div data-screen-label="07 Products" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
        <h1 style={css("margin:0;font-size:24px;font-weight:600;letter-spacing:-.02em")}>Products</h1>
        <div style={css("display:flex;gap:8px")}>
          <Link href="/agent" style={css("font-size:13px;padding:8px 12px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;color:#202723")}>Generate with agent</Link>
          <button style={css("font-size:13px;padding:8px 12px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>Add product</button>
        </div>
      </div>
      <div style={css("display:grid;grid-template-columns:repeat(auto-fill,minmax(220px,1fr));gap:12px")}>
        {PRODUCTS.map((p) => (
          <div key={p.name} className="hv-lift" style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden;display:flex;flex-direction:column;transition:transform .2s,box-shadow .2s")}>
            <div style={css("aspect-ratio:4/3;background:repeating-linear-gradient(135deg,#F3F5F2 0 8px,#ECEFEA 8px 16px);display:grid;place-items:center;font-family:var(--font-mono);font-size:11px;color:#78817B")}>{p.img}</div>
            <div style={css("padding:14px 16px;display:flex;flex-direction:column;gap:8px")}>
              <div style={css("display:flex;justify-content:space-between;gap:8px")}>
                <span style={css("font-size:15px;font-weight:500")}>{p.name}</span>
                <span style={css("font-family:var(--font-mono);font-size:14px")}>{p.price}</span>
              </div>
              <div style={css("display:flex;gap:6px;flex-wrap:wrap;font-size:12px")}>
                <span style={css("padding:3px 8px;border-radius:999px;background:#F3F5F2;color:#4C5550")}>{p.type}</span>
                <span style={{ padding: "3px 8px", borderRadius: 999, background: p.low ? "#FBF3E6" : "#F3F5F2", color: p.low ? "#8A5E1C" : "#4C5550" }}>{p.inv}</span>
                <span style={{ padding: "3px 8px", borderRadius: 999, background: p.draft ? "#F3F5F2" : "#E9F4EE", color: p.draft ? "#78817B" : "#1F6B43" }}>{p.pub}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
