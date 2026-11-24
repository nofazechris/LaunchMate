"use client";

import { css } from "@/lib/css";
import { ACTIVITY_FULL } from "@/lib/data";

const TONE: Record<string, [string, string]> = {
  Blocked: ["#FCEEEE", "#8E2F2F"],
  Verified: ["#EAF2F8", "#2F6A92"],
  Done: ["#E9F4EE", "#1F6B43"],
};

export default function ActivityScreen() {
  return (
    <div data-screen-label="11 Activity" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:24px;font-weight:600;letter-spacing:-.02em")}>Activity</h1>
        <span style={css("font-size:14px;color:#78817B")}>Everything your agent did, with approval and transaction records.</span>
      </div>
      <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden")}>
        {ACTIVITY_FULL.map((a) => {
          const [bg, fg] = TONE[a.outcome] ?? TONE.Done;
          return (
            <div key={a.time + a.t} style={css("display:flex;flex-wrap:wrap;gap:8px 18px;padding:14px 20px;border-bottom:1px solid #F0F2F0;font-size:14px;align-items:center")}>
              <span style={css("width:90px;font-size:13px;color:#78817B")}>{a.time}</span>
              <span style={css("flex:1 1 240px")}>{a.t}</span>
              <span style={{ ...css("font-size:12px;padding:3px 8px;border-radius:999px"), background: bg, color: fg }}>{a.outcome}</span>
              <span style={css("width:150px;font-size:12px;color:#5E6862")}>{a.approval}</span>
              <span style={css("width:110px;font-size:12px;color:#78817B;font-family:var(--font-mono)")}>{a.ref}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
