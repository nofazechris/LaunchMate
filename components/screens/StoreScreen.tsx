"use client";

import { useState } from "react";
import { css } from "@/lib/css";
import { PRODUCTS } from "@/lib/data";

const EDITS: [string, string][] = [
  ["Make the headline warmer", "Made by hand in Abeokuta, for everyday Lagos."],
  ["Focus on gifting", "The gift they'll actually carry."],
  ["Shorter headline", "Adire, made modern."],
];

export default function StoreScreen() {
  const [page, setPage] = useState(0);
  const [mobile, setMobile] = useState(false);
  const [published, setPublished] = useState(false);
  const [hero, setHero] = useState("Hand-dyed in Abeokuta. Carried everywhere.");

  const seg = (on: boolean) => ({ fontSize: 13, padding: "6px 10px", borderRadius: 8, border: "none", cursor: "pointer", color: "#202723", background: on ? "#EEF6F0" : "transparent" });

  return (
    <div data-screen-label="06 My Store" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
        <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
          {["Home", "Shop", "About", "Policies"].map((label, i) => (
            <button key={label} onClick={() => setPage(i)} style={{ ...css("font-size:13px;padding:7px 12px;border-radius:9px;border-style:solid;border-width:1px;cursor:pointer"), background: page === i ? "#FFFFFF" : "transparent", color: page === i ? "#202723" : "#78817B", borderColor: page === i ? "#E8ECE8" : "transparent" }}>{label}</button>
          ))}
        </div>
        <div style={css("display:flex;gap:8px;align-items:center")}>
          <div style={css("display:flex;padding:3px;border-radius:10px;background:#FFFFFF;border:1px solid #E8ECE8")}>
            <button onClick={() => setMobile(false)} style={seg(!mobile)}>Desktop</button>
            <button onClick={() => setMobile(true)} style={seg(mobile)}>Mobile</button>
          </div>
          <button onClick={() => setPublished(true)} className="hv-green" style={css("font-size:13px;padding:8px 14px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>{published ? "Published ✓" : "Publish changes"}</button>
        </div>
      </div>

      <div style={css("display:grid;grid-template-columns:minmax(0,1fr) minmax(0,280px);gap:12px;align-items:start")}>
        <div style={css("background:#EEF0EC;border-radius:18px;padding:24px;display:flex;justify-content:center")}>
          <div style={{ ...css("width:100%;background:#FFFFFF;border-radius:14px;overflow:hidden;box-shadow:0 10px 30px rgba(32,39,35,.08);transition:max-width .45s cubic-bezier(.2,.8,.2,1)"), maxWidth: mobile ? 390 : 1100 }}>
            <div style={css("display:flex;align-items:center;justify-content:space-between;padding:16px 22px;border-bottom:1px solid #EFEFEA")}>
              <span style={css("font-weight:600;letter-spacing:.08em;font-size:13px")}>ADIRE &amp; CO.</span>
              <span style={css("font-size:13px;color:#5E6862")}>Bag (0)</span>
            </div>
            <div style={css("min-height:260px;background:repeating-linear-gradient(135deg,#EEF0F5 0 10px,#E5E8F0 10px 20px);display:flex;align-items:flex-end;padding:24px")}>
              <div style={css("display:flex;flex-direction:column;gap:10px;max-width:420px")}>
                <span style={css("font-family:var(--font-mono);font-size:11px;color:#5E6862")}>[ hero photo — indigo totes on a market stall ]</span>
                <span style={css("font-size:28px;font-weight:600;letter-spacing:-.02em;line-height:1.1")}>{hero}</span>
                <span style={css("align-self:flex-start;font-size:14px;padding:10px 16px;background:#34467A;color:#FFFFFF;border-radius:8px")}>Shop the collection</span>
              </div>
            </div>
            <div style={css("padding:22px;display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:16px")}>
              {PRODUCTS.filter((p) => !p.draft).map((p) => (
                <div key={p.name} style={css("display:flex;flex-direction:column;gap:6px")}>
                  <div style={css("aspect-ratio:4/5;border-radius:8px;background:repeating-linear-gradient(135deg,#F3F5F2 0 8px,#ECEFEA 8px 16px);display:grid;place-items:center;font-family:var(--font-mono);font-size:10px;color:#78817B")}>product shot</div>
                  <span style={css("font-size:14px")}>{p.name}</span>
                  <span style={css("font-size:13px;color:#5E6862;font-family:var(--font-mono)")}>{p.price}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:14px")}>
          <span style={css("font-size:14px;font-weight:600")}>Edit with your agent</span>
          {EDITS.map(([label, line]) => (
            <button key={label} onClick={() => { setHero(line); setPublished(false); }} className="hv-grey" style={css("text-align:left;font-size:13px;padding:10px 12px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer;color:#202723;line-height:1.4")}>{label}</button>
          ))}
          <span style={css("height:1px;background:#E8ECE8")} />
          <span style={css("font-size:14px;font-weight:600")}>Theme</span>
          <div style={css("display:flex;gap:8px")}>
            <span style={css("width:28px;height:28px;border-radius:8px;background:#34467A;border:2px solid #FFFFFF;box-shadow:0 0 0 1.5px #34467A")} />
            <span style={css("width:28px;height:28px;border-radius:8px;background:#E1CFA8")} />
            <span style={css("width:28px;height:28px;border-radius:8px;background:#26734D")} />
          </div>
        </div>
      </div>
    </div>
  );
}
