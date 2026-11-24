"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { boxes, STAGES, TASKS, TASK_META } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { useLaunchmate } from "@/components/LaunchmateProvider";

const kv = "display:flex;flex-direction:column;gap:3px";

export default function BuildScreen() {
  const { tasks, stage, launched, bizUrl, approveDomain, rejectDomain, retryDomain, skipDomain } = useLaunchmate();
  const [sel, setSel] = useState<number | null>(null);
  const scene = useMemo(() => boxes(stage, null), [stage]);

  const doneN = tasks.filter((t) => t === "done" || t === "skipped").length;
  const pct = Math.round((doneN / TASKS.length) * 100);

  return (
    <div data-screen-label="03 Build" style={css("padding:28px;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,340px),1fr));gap:20px;align-items:start;animation:lmIn .35s ease-out;max-width:1320px")}>
      <div style={css("display:flex;flex-direction:column;gap:16px;min-width:0")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>{launched ? "Your business is ready" : "Building Adire & Co."}</h1>
          <span style={css("font-size:14px;color:#78817B")}>
            {launched ? "Every step confirmed. Open any step to see what was done." : "Your agent is working. Click any step to see what it is doing and why."}
          </span>
        </div>

        <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;padding:14px;display:flex;flex-direction:column;gap:2px")}>
          {TASKS.map((t, i) => {
            const status = tasks[i];
            const m = TASK_META[status];
            const done = status === "done";
            return (
              <div key={t.title} style={css("display:flex;flex-direction:column")}>
                <button onClick={() => setSel((s) => (s === i ? null : i))} aria-expanded={sel === i} className="hv-grey" style={css("display:flex;align-items:center;gap:14px;padding:13px 10px;border:none;background:none;border-radius:10px;cursor:pointer;text-align:left;color:#202723")}>
                  <span style={{ ...css("width:22px;height:22px;border-radius:50%;flex-shrink:0;border-style:solid;border-width:1.5px;display:grid;place-items:center;color:#FFFFFF;font-size:11px;transition:background .3s"), background: m.dotBg, borderColor: m.dotBd, animation: m.anim }}>{m.mark}</span>
                  <span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}>
                    <span style={{ fontSize: 15, color: m.fg }}>{t.title}</span>
                    <span style={css("font-size:12px;color:#78817B")}>{status === "running" ? t.what : done ? t.result : ""}</span>
                  </span>
                  <span style={{ ...css("font-size:12px;padding:3px 9px;border-radius:999px;white-space:nowrap"), background: m.pillBg, color: m.pillFg }}>{m.label}</span>
                </button>

                {sel === i && (
                  <div style={css("margin:0 10px 10px 46px;display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:12px;font-size:13px;line-height:1.5;padding:14px;border-radius:12px;background:#F8FAF8;animation:lmIn .25s ease-out")}>
                    <div style={css(kv)}><span style={css("color:#78817B")}>What</span><span>{t.what}</span></div>
                    <div style={css(kv)}><span style={css("color:#78817B")}>Why</span><span>{t.why}</span></div>
                    <div style={css(kv)}><span style={css("color:#78817B")}>Data used</span><span>{t.data}</span></div>
                    <div style={css(kv)}><span style={css("color:#78817B")}>Result</span><span>{done ? t.result : "Not finished yet"}</span></div>
                  </div>
                )}

                {status === "approval" && (
                  <div style={css("margin:4px 4px 12px 46px;border:1px solid #EAD9BC;background:#FFFFFF;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;box-shadow:0 8px 24px rgba(197,139,52,.08)")}>
                    <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px")}>
                      <span style={css("font-size:12px;font-weight:500;padding:4px 10px;border-radius:999px;background:#FBF3E6;color:#8A5E1C")}>Approval needed</span>
                      <span style={css("font-size:12px;color:#78817B")}>Quote expires in 14:32</span>
                    </div>
                    <div style={css("display:flex;flex-direction:column;gap:4px")}>
                      <span style={css("font-size:19px;font-weight:600;letter-spacing:-.01em")}>Register adireandco.com</span>
                      <span style={css("font-size:14px;color:#5E6862;line-height:1.5")}>Your agent checks out on the registrar&apos;s site for you. Your card details and passwords are never shared with it.</span>
                    </div>
                    <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;font-size:13px;padding:14px 0;border-top:1px solid #F0F2F0;border-bottom:1px solid #F0F2F0")}>
                      {([["Registrar", "Partner registrar"], ["Price", "11.28 USD", 1], ["Term", "1 year"], ["Renews at", "16.98 USD / yr", 1], ["Paid via", "Agent Vault checkout"], ["Permission", "One-time, this quote only"]] as [string, string, number?][]).map(([k, v, mono]) => (
                        <div key={k} style={css("display:flex;flex-direction:column;gap:2px")}>
                          <span style={css("color:#78817B")}>{k}</span>
                          <span style={mono ? css("font-family:var(--font-mono)") : undefined}>{v}</span>
                        </div>
                      ))}
                    </div>
                    <div style={css("display:flex;gap:10px")}>
                      <button onClick={approveDomain} className="hv-green press" style={css("flex:1;font-size:14px;padding:12px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>Approve 11.28 USD</button>
                      <button onClick={rejectDomain} className="hv-grey" style={css("font-size:14px;padding:12px 18px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer")}>Reject</button>
                    </div>
                  </div>
                )}

                {status === "verifying" && (
                  <div style={css("margin:0 10px 10px 46px;font-size:13px;color:#2F6A92;padding:12px 14px;border-radius:12px;background:#EAF2F8;line-height:1.5;animation:lmIn .25s ease-out")}>
                    Payment sent. Waiting for the registrar to confirm — the domain won&apos;t show as yours until it&apos;s verified.
                  </div>
                )}

                {status === "blocked" && (
                  <div style={css("margin:0 10px 10px 46px;font-size:13px;padding:14px;border-radius:12px;background:#FCEEEE;color:#8E2F2F;display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;animation:lmIn .25s ease-out")}>
                    <span>Purchase rejected. Nothing was charged. Your store stays at adireandco.launchmate.store.</span>
                    <span style={css("display:flex;gap:8px")}>
                      <button onClick={retryDomain} style={css("font-size:13px;padding:7px 11px;border-radius:9px;border:1px solid #E8C9C9;background:#FFFFFF;cursor:pointer;color:#202723")}>Review again</button>
                      <button onClick={skipDomain} style={css("font-size:13px;padding:7px 11px;border-radius:9px;border:1px solid #E8C9C9;background:#FFFFFF;cursor:pointer;color:#202723")}>Launch without it</button>
                    </span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {launched && (
          <div style={css("background:#FFFFFF;border:1px solid #CFE3D6;border-radius:18px;padding:22px;display:flex;align-items:center;gap:18px;flex-wrap:wrap;animation:lmIn .4s ease-out")}>
            <span style={css("flex:1;min-width:220px;display:flex;flex-direction:column;gap:4px")}>
              <span style={css("font-size:17px;font-weight:600")}>Adire &amp; Co. is live</span>
              <span style={css("font-size:14px;color:#5E6862")}>Live at {bizUrl}</span>
            </span>
            <Link href="/overview" className="hv-green" style={css("font-size:14px;padding:12px 18px;border-radius:10px;background:#26734D;color:#FFFFFF;font-weight:500")}>Open dashboard</Link>
          </div>
        )}
      </div>

      <div style={css("display:flex;flex-direction:column;gap:12px;position:sticky;top:80px")}>
        <div aria-hidden style={css("position:relative;aspect-ratio:1/0.9;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;overflow:hidden;container-type:size")}>
          <IsoScene size={62} offset={8} transform="rotateX(58deg) rotateZ(45deg)" sway={14}>
            <IsoBoxes boxes={scene} variant="build" />
          </IsoScene>
          <span style={css("position:absolute;left:14px;top:12px;font-size:12px;color:#5E6862;background:#FFFFFF;padding:4px 10px;border-radius:999px;border:1px solid #E8ECE8;white-space:nowrap")}>Stage · {STAGES[stage]}</span>
        </div>
        <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;padding:18px;display:flex;flex-direction:column;gap:10px")}>
          <div style={css("display:flex;justify-content:space-between;font-size:13px")}>
            <span style={css("font-weight:600")}>Build progress</span><span style={css("color:#78817B")}>{doneN} of {TASKS.length} confirmed</span>
          </div>
          <div style={css("height:6px;border-radius:999px;background:#EEF1EE;overflow:hidden")}>
            <div style={{ ...css("height:100%;background:#26734D;border-radius:999px;transition:width .5s ease"), width: pct + "%" }} />
          </div>
          <span style={css("font-size:12px;color:#78817B;line-height:1.5")}>Steps only turn green after the service confirms them.</span>
        </div>
      </div>
    </div>
  );
}
