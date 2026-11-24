"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { ORDERS, PAY } from "@/lib/data";

export default function OrdersScreen() {
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div data-screen-label="08 Orders" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px")}>
      <h1 style={css("margin:0;font-size:24px;font-weight:600;letter-spacing:-.02em")}>Orders</h1>
      <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden")}>
        {ORDERS.map((o) => {
          const isOpen = open === o.id;
          return (
            <div key={o.id}>
              <button onClick={() => setOpen(isOpen ? null : o.id)} aria-expanded={isOpen} className="hv-grey" style={{ ...css("width:100%;display:flex;flex-wrap:wrap;gap:8px 16px;padding:14px 20px;font-size:14px;align-items:center;border:none;border-bottom:1px solid #F0F2F0;text-align:left;cursor:pointer;color:#202723"), background: isOpen ? "#F8FAF8" : "#FFFFFF" }}>
                <span style={css("font-family:var(--font-mono);font-size:13px;color:#78817B;width:80px")}>{o.id}</span>
                <span style={css("flex:1 1 140px")}>{o.customer}</span>
                <span style={css("flex:1 1 160px;color:#4C5550")}>{o.product}</span>
                <span style={css("font-family:var(--font-mono);width:90px;text-align:right")}>{o.total}</span>
                <span style={{ ...css("font-size:12px;padding:3px 8px;border-radius:999px;white-space:nowrap"), background: PAY[o.pay][0], color: PAY[o.pay][1] }}>{o.pay}</span>
                <span style={css("font-size:13px;color:#4C5550;width:90px")}>{o.ful}</span>
              </button>
              {isOpen && (
                <div style={css("padding:18px 20px 22px;background:#F8FAF8;border-bottom:1px solid #E8ECE8;display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:20px;font-size:14px;animation:lmIn .25s ease-out")}>
                  <div style={css("display:flex;flex-direction:column;gap:4px")}><span style={css("font-size:12px;color:#78817B")}>Customer</span><span>{o.customer}</span><span style={css("color:#5E6862")}>{o.city}</span></div>
                  <div style={css("display:flex;flex-direction:column;gap:4px")}><span style={css("font-size:12px;color:#78817B")}>Payment confirmation</span><span style={css("line-height:1.45")}>{o.confirm}</span></div>
                  <div style={css("display:flex;flex-direction:column;gap:4px")}><span style={css("font-size:12px;color:#78817B")}>Agent activity</span><span style={css("color:#4C5550;line-height:1.45")}>{o.agent}</span></div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <span style={css("font-size:13px;color:#78817B")}>Orders count as paid only when the payment provider confirms — never just because a customer returned from checkout.</span>
    </div>
  );
}
