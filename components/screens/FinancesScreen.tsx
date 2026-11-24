"use client";

import Link from "next/link";
import { css } from "@/lib/css";
import { useLaunchmate } from "@/components/LaunchmateProvider";

const ink = "#202723";
const btn = "font-size:13px;padding:7px 11px;border-radius:9px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer;color:#202723";

export default function FinancesScreen() {
  const { restock, extraTx, addExpense } = useLaunchmate();
  const approved = restock === "approved";

  const fin = [
    { cur: "NGN", rev: "₦486,500", exp: approved ? "₦206,300" : "₦142,300", net: approved ? "₦280,200" : "₦344,200" },
    { cur: "USD", rev: "$96.00", exp: "$11.28", net: "$84.72" },
  ];
  const txns = [
    ...extraTx,
    ...(approved ? [{ date: "Today", desc: "Restock — Itoku Textiles (approved)", cat: "Materials", amt: "−₦64,000", color: ink }] : []),
    { date: "Today", desc: "Order #LM-1048 · Tolu Adebayo", cat: "Sales", amt: "+₦18,500", color: "#268653" },
    { date: "Today", desc: "Order #LM-1047 · Kemi Bello", cat: "Sales", amt: "+₦64,000", color: "#268653" },
    { date: "20 Nov", desc: "Dye and fabric — Itoku market", cat: "Materials", amt: "−₦38,000", color: ink },
    { date: "20 Nov", desc: "Domain adireandco.com (1 yr)", cat: "Software", amt: "−$11.28", color: ink },
    { date: "19 Nov", desc: "Dispatch rider — weekly", cat: "Delivery", amt: "−₦12,500", color: ink },
    { date: "18 Nov", desc: "Refund #LM-1043", cat: "Refunds", amt: "−₦32,000", color: ink },
  ];

  return (
    <div data-screen-label="09 Finances" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
        <h1 style={css("margin:0;font-size:24px;font-weight:600;letter-spacing:-.02em")}>Finances</h1>
        <span style={css("font-size:13px;color:#78817B")}>Currencies shown separately. No conversion applied.</span>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:12px")}>
        {fin.map((f) => (
          <div key={f.cur} style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:16px")}>
            <span style={css("font-size:13px;font-weight:600;font-family:var(--font-mono)")}>{f.cur}</span>
            <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:12px")}>
              {([["Revenue", f.rev, ink], ["Expenses", f.exp, ink], ["Net", f.net, "#268653"]] as const).map(([k, v, color]) => (
                <div key={k} style={css("display:flex;flex-direction:column;gap:4px")}>
                  <span style={css("font-size:12px;color:#78817B")}>{k}</span>
                  <span style={{ ...css("font-size:20px;font-weight:600;font-family:var(--font-mono)"), color }}>{v}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column")}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin-bottom:10px")}>
          <span style={css("font-size:15px;font-weight:600")}>Transactions</span>
          <div style={css("display:flex;gap:8px")}>
            <button onClick={addExpense} style={css(btn)}>Record expense</button>
            <Link href="/agent" style={css(btn)}>Ask for a summary</Link>
          </div>
        </div>
        {txns.map((t, i) => (
          <div key={i} style={css("display:flex;flex-wrap:wrap;gap:6px 12px;padding:12px 0;border-top:1px solid #F0F2F0;font-size:14px;align-items:center;animation:lmIn .3s ease-out")}>
            <span style={css("color:#78817B;font-size:13px;width:70px")}>{t.date}</span>
            <span style={css("flex:1 1 200px")}>{t.desc}</span>
            <span style={css("font-size:12px;color:#5E6862;width:90px")}>{t.cat}</span>
            <span style={{ ...css("font-family:var(--font-mono);text-align:right;width:110px"), color: t.color }}>{t.amt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
