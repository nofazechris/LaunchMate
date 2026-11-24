"use client";

import { useEffect, useRef } from "react";
import { css } from "@/lib/css";
import { useActivityShort } from "@/lib/useActivityShort";
import { useLaunchmate } from "@/components/LaunchmateProvider";

const SUGGESTIONS = ["Show me today's orders", "Summarise my revenue this week", "Check my domain", "Add three products"];

export default function AgentScreen() {
  const { agentMsgs, agentDraft, setAgentDraft, agentSay, restock, approveRestock, rejectRestock, bizUrl } = useLaunchmate();
  const activity = useActivityShort();
  const bottom = useRef<HTMLDivElement>(null);
  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [agentMsgs.length]);

  const ctx: [string, string][] = [["Business", "Adire & Co."], ["Store", bizUrl], ["Orders today", "2"], ["Low stock", "Eleko Silk Scarf"], ["Currencies", "NGN, USD"]];
  const meta = (id: string, label: string, value: string, mono?: boolean) => (
    <div key={id} style={css("display:flex;flex-direction:column;gap:2px")}>
      <span style={css("color:#78817B")}>{label}</span>
      <span style={mono ? css("font-family:var(--font-mono)") : undefined}>{value}</span>
    </div>
  );

  return (
    <div data-screen-label="10 Business Agent" style={css("padding:24px 28px;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,320px);gap:16px;align-items:start;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;flex-direction:column;gap:14px;min-width:0")}>
        {agentMsgs.map((m, i) => (
          <div key={i} style={{ ...css("display:flex;animation:lmIn .3s ease-out"), justifyContent: m.u ? "flex-end" : "flex-start" }}>
            <div style={{ ...css("max-width:78%;padding:12px 16px;border-radius:16px;font-size:15px;line-height:1.5;border-style:solid;border-width:1px"), background: m.u ? "#EEF6F0" : "#FFFFFF", borderColor: m.u ? "#EEF6F0" : "#E8ECE8" }}>{m.text}</div>
          </div>
        ))}

        {restock === "pending" && (
          <div style={css("border:1px solid #EAD9BC;background:#FFFFFF;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:14px;max-width:560px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px")}>
              <span style={css("font-size:12px;font-weight:500;padding:4px 10px;border-radius:999px;background:#FBF3E6;color:#8A5E1C")}>Approval needed</span>
              <span style={css("font-size:12px;color:#78817B")}>Expires in 2 days</span>
            </div>
            <span style={css("font-size:17px;font-weight:600")}>Restock 20 scarf blanks</span>
            <span style={css("font-size:14px;color:#5E6862;line-height:1.5")}>Eleko Silk Scarf has 3 left and sells ~6 a week. This order covers about 3 weeks.</span>
            <div style={css("display:grid;grid-template-columns:repeat(3,1fr);gap:12px;font-size:13px;padding:12px 0;border-top:1px solid #F0F2F0;border-bottom:1px solid #F0F2F0")}>
              {meta("s", "Supplier", "Itoku Textiles")}{meta("a", "Amount", "₦64,000", true)}{meta("r", "Recorded as", "Materials")}
            </div>
            <div style={css("display:flex;gap:10px")}>
              <button onClick={approveRestock} className="hv-green" style={css("flex:1;font-size:14px;padding:11px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>Approve ₦64,000</button>
              <button onClick={rejectRestock} style={css("font-size:14px;padding:11px 16px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer")}>Reject</button>
            </div>
          </div>
        )}

        <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
          {SUGGESTIONS.map((label) => (
            <button key={label} onClick={() => agentSay(label)} className="hv-grey" style={css("font-size:13px;padding:8px 12px;border-radius:999px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer;color:#4C5550")}>{label}</button>
          ))}
        </div>

        <div style={css("position:sticky;bottom:16px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:8px 8px 8px 16px;display:flex;gap:8px;align-items:center;box-shadow:0 8px 24px rgba(32,39,35,.06)")}>
          <input value={agentDraft} onChange={(e) => setAgentDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") agentSay(agentDraft); }} placeholder="Ask your agent — e.g. Show me today's orders" style={css("flex:1;min-width:0;border:none;outline:none;font-size:15px;padding:8px 0;background:transparent;color:#202723")} />
          <button onClick={() => agentSay(agentDraft)} className="hv-green" style={css("font-size:14px;padding:10px 16px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>Send</button>
        </div>
        <div ref={bottom} />
      </div>

      <div style={css("display:flex;flex-direction:column;gap:12px;position:sticky;top:80px")}>
        <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:10px")}>
          <span style={css("font-size:13px;font-weight:600")}>Business context</span>
          {ctx.map(([k, v]) => (
            <div key={k} style={css("display:flex;justify-content:space-between;gap:12px;font-size:13px")}><span style={css("color:#78817B")}>{k}</span><span style={css("text-align:right")}>{v}</span></div>
          ))}
        </div>
        <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:18px;display:flex;flex-direction:column;gap:12px")}>
          <span style={css("font-size:13px;font-weight:600")}>Recent agent work</span>
          {activity.map((a) => (
            <div key={a.t} style={css("display:flex;flex-direction:column;gap:2px;font-size:13px")}><span style={css("line-height:1.4")}>{a.t}</span><span style={css("font-size:12px;color:#78817B")}>{a.time}</span></div>
          ))}
        </div>
      </div>
    </div>
  );
}
