"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { ORDERS, PAY, REV } from "@/lib/data";
import { useActivityShort } from "@/lib/useActivityShort";
import { useLaunchmate } from "@/components/LaunchmateProvider";

const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column";
const metrics = [
  { label: "Revenue (NGN)", value: "₦486,500", note: "+18% vs previous 14 days", color: "#268653" },
  { label: "Revenue (USD)", value: "$96.00", note: "8 digital sales", color: "#78817B" },
  { label: "Orders", value: "38", note: "2 pending fulfilment", color: "#8A5E1C" },
  { label: "Products", value: "5", note: "1 draft · 1 low stock", color: "#78817B" },
];

export default function OverviewScreen() {
  const { restock } = useLaunchmate();
  const activity = useActivityShort();
  const maxR = Math.max(...REV);

  return (
    <div data-screen-label="04 Overview" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px;width:100%")}>
      <div style={css("display:flex;align-items:flex-end;justify-content:space-between;gap:16px;flex-wrap:wrap")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Welcome back</h1>
          <span style={css("font-size:14px;color:#78817B")}>2 orders need fulfilment today</span>
        </div>
        <div style={css("display:flex;padding:3px;border-radius:12px;background:#FFFFFF;border:1px solid #E8ECE8")}>
          <span style={css("font-size:13px;padding:7px 12px;border-radius:9px;background:#EEF6F0;color:#185C3B;font-weight:500")}>Business Overview</span>
          <Link href="/world" style={css("font-size:13px;padding:7px 12px;border-radius:9px;color:#5E6862")}>Business World</Link>
        </div>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px")}>
        {metrics.map((m) => (
          <div key={m.label} style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:18px 20px;display:flex;flex-direction:column;gap:8px")}>
            <span style={css("font-size:13px;color:#78817B")}>{m.label}</span>
            <span style={css("font-size:26px;font-weight:600;letter-spacing:-.02em;font-family:var(--font-mono)")}>{m.value}</span>
            <span style={{ fontSize: 12, color: m.color }}>{m.note}</span>
          </div>
        ))}
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:12px")}>
        <div style={{ ...css(card), gap: 18, minWidth: 0 }}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px;flex-wrap:wrap")}>
            <span style={css("font-size:15px;font-weight:600")}>Revenue · NGN · 14 days</span>
            <span style={css("font-size:12px;color:#78817B")}>Verified payments only</span>
          </div>
          <div style={css("display:flex;align-items:flex-end;gap:6px;height:170px;border-bottom:1px solid #E8ECE8")}>
            {REV.map((v, i) => (
              <div key={i} title={"₦" + (v * 1000).toLocaleString("en-US")} className="hv-green" style={{ flex: 1, height: Math.max(2, (v / maxR) * 100) + "%", background: i === REV.length - 1 ? "#26734D" : "#BFD9C8", borderRadius: "5px 5px 0 0" }} />
            ))}
          </div>
          <div style={css("display:flex;justify-content:space-between;font-size:12px;color:#78817B")}><span>11 Nov</span><span>Today</span></div>
        </div>

        <div style={{ ...css(card), gap: 6, minWidth: 0 }}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;margin-bottom:6px")}>
            <span style={css("font-size:15px;font-weight:600")}>Recent orders</span>
            <Link href="/orders" style={css("font-size:13px")}>View all</Link>
          </div>
          {ORDERS.slice(0, 4).map((o) => (
            <div key={o.id} style={css("display:flex;gap:12px;align-items:center;font-size:14px;padding:10px 0;border-top:1px solid #F0F2F0")}>
              <span style={css("font-family:var(--font-mono);font-size:12px;color:#78817B;width:72px;flex-shrink:0")}>{o.id}</span>
              <span style={css("flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{o.customer}</span>
              <span style={css("font-family:var(--font-mono)")}>{o.total}</span>
              <span style={{ ...css("font-size:12px;padding:3px 8px;border-radius:999px;white-space:nowrap"), background: PAY[o.pay][0], color: PAY[o.pay][1] }}>{o.pay}</span>
            </div>
          ))}
        </div>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:12px")}>
        <div style={{ ...css(card), gap: 12 }}>
          <span style={css("font-size:15px;font-weight:600")}>Agent activity</span>
          {activity.map((a) => (
            <div key={a.t} style={css("display:flex;gap:12px;font-size:14px")}>
              <span style={css("width:7px;height:7px;border-radius:50%;background:#26734D;margin-top:7px;flex-shrink:0")} />
              <span style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("line-height:1.4")}>{a.t}</span><span style={css("font-size:12px;color:#78817B")}>{a.time}</span></span>
            </div>
          ))}
        </div>

        <div style={{ ...css(card), gap: 10 }}>
          <span style={css("font-size:15px;font-weight:600")}>Pending approvals</span>
          {restock === "pending" ? (
            <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;padding:12px;border-radius:12px;background:#F8FAF8")}>
              <span style={css("display:flex;flex-direction:column;gap:2px")}>
                <span style={css("font-size:14px;font-weight:500")}>Restock 20 scarf blanks</span>
                <span style={css("font-size:12px;color:#78817B")}>₦64,000 · supplier · expires in 2 days</span>
              </span>
              <Link href="/agent" className="hv-grey" style={css("font-size:13px;padding:7px 11px;border-radius:9px;border:1px solid #E8ECE8;background:#FFFFFF;color:#202723")}>Review</Link>
            </div>
          ) : (
            <span style={css("font-size:14px;color:#78817B")}>Nothing waiting on you.</span>
          )}
        </div>

        <div style={{ ...css(card), gap: 10 }}>
          <div style={css("display:flex;justify-content:space-between;align-items:center")}>
            <span style={css("font-size:15px;font-weight:600")}>Insight</span>
            <span style={css("font-size:11px;padding:3px 8px;border-radius:999px;background:#EAF2F8;color:#2F6A92")}>AI suggestion</span>
          </div>
          <span style={css("font-size:14px;line-height:1.5;color:#4C5550")}>The Eleko Silk Scarf sold out twice this month. Only 3 left — consider restocking before the weekend.</span>
          <span style={css("font-size:12px;color:#78817B")}>Based on your verified order history.</span>
        </div>
      </div>
    </div>
  );
}
