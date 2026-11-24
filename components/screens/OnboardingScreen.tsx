"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { boxes, CTX, QS } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { LogoMark } from "@/components/Logo";
import { useLaunchmate } from "@/components/LaunchmateProvider";

export default function OnboardingScreen({ userName }: { userName: string }) {
  const { answers: a, chat, qi, typing, draft, setDraft, startOnboarding, answer, askRevise } = useLaunchmate();
  const router = useRouter();
  const [edits, setEdits] = useState<Record<string, string>>({});
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const bottom = useRef<HTMLDivElement>(null);

  // Landing here directly (or after a refresh) with nothing started: begin the conversation.
  const idle = chat.length === 0 && !typing;
  useEffect(() => { if (idle) startOnboarding(userName); }, [idle, startOnboarding, userName]);

  useEffect(() => { bottom.current?.scrollIntoView({ behavior: "smooth", block: "end" }); }, [chat.length, typing, qi]);

  const asking = qi < QS.length;
  const showChips = !typing && asking && chat.length > 0;
  const showBlueprint = !asking && !typing;
  const filled = CTX.filter(([k]) => a[k]).length;
  const pct = Math.round((filled / CTX.length) * 100);
  // The plot grows with what has actually been answered: nothing -> idea -> identity -> storefront draft.
  // (It is a picture of the plan, not a built store.)
  const stage = !filled ? 0 : filled < 3 ? 1 : filled < CTX.length || !showBlueprint ? 2 : 3;
  const scene = useMemo(() => boxes(stage, null), [stage]);
  const stageLabel = ["Empty plot", "Idea", "Identity", "Storefront draft"][stage];

  // Only what the owner actually told us. Nothing here is invented; every field is editable.
  const blueprint: [string, string][] = [
    ["Business name", a.name ?? ""], ["Category", a.cat ?? ""],
    ["Description", a.idea ?? ""], ["Target market", a.audience ?? ""],
    ["Product type", a.type ?? ""], ["Launch budget", a.budget ?? ""],
    ["Brand direction", ""],
  ];
  const val = (k: string, v: string) => edits[k] ?? v;

  async function createBusiness() {
    const bp = Object.fromEntries(blueprint.map(([k, v]) => [k, val(k, v).trim()]));
    if (bp["Business name"].length < 2) return setCreateError("Please give your business a name.");
    setCreating(true);
    setCreateError(null);
    try {
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: bp["Business name"], category: bp["Category"] || undefined, description: bp["Description"] || undefined, profile: { answers: a, blueprint: bp } }),
      });
      if (res.status === 409) { router.push("/overview"); router.refresh(); return; } // already has one
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? "Could not save your business.");
      router.push("/overview");
      router.refresh();
    } catch (e) {
      setCreateError(e instanceof Error ? e.message : "Could not save your business.");
    } finally {
      setCreating(false);
    }
  }

  const send = () => { const t = draft.trim(); if (t) answer(t); };

  return (
    <div data-screen-label="02 Onboarding" style={css("min-height:100vh;display:flex;flex-direction:column;background:#FFFFFF")}>
      <header style={css("height:60px;border-bottom:1px solid #E8ECE8;display:flex;align-items:center;padding:0 clamp(16px,3vw,28px);gap:16px;position:sticky;top:0;background:rgba(255,255,255,.95);backdrop-filter:blur(8px);z-index:5")}>
        <span style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px")}><LogoMark />Launchmate</span>
        <span style={css("font-size:13px;color:#78817B")}>New business</span>
        <span style={css("flex:1")} />
        <span style={css("font-size:12px;color:#78817B;display:flex;align-items:center;gap:6px")}>
          <span style={css("width:6px;height:6px;border-radius:50%;background:#268653")} />Progress saved
        </span>
      </header>

      <div style={css("flex:1;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px);max-width:1200px;width:100%;margin:0 auto")}>
        <div style={css("display:flex;flex-direction:column;gap:16px;padding:32px clamp(16px,3vw,40px) 140px;min-width:0")}>
          {chat.map((m, i) => (
            <div key={i} style={{ ...css("display:flex;gap:10px;animation:lmIn .3s ease-out"), justifyContent: m.u ? "flex-end" : "flex-start" }}>
              {!m.u && (
                <span style={css("width:28px;height:28px;border-radius:8px;background:#EEF6F0;flex-shrink:0;display:grid;place-items:center")}>
                  <span style={css("width:9px;height:9px;border-radius:3px;background:#26734D;transform:rotate(45deg)")} />
                </span>
              )}
              <div style={{ ...css("max-width:78%;padding:12px 16px;border-radius:16px;font-size:15px;line-height:1.55;border-style:solid;border-width:1px"), background: m.u ? "#EEF6F0" : "#FFFFFF", borderColor: m.u ? "#EEF6F0" : "#E8ECE8" }}>{m.text}</div>
            </div>
          ))}

          {typing && (
            <div style={css("display:flex;gap:10px;align-items:center")}>
              <span style={css("width:28px;height:28px;border-radius:8px;background:#EEF6F0")} />
              <span style={css("font-size:13px;color:#78817B;animation:lmPulse 1s infinite")}>Launchmate is thinking…</span>
            </div>
          )}

          {showChips && (
            <div style={css("display:flex;gap:8px;flex-wrap:wrap;padding-left:38px;animation:lmIn .3s ease-out")}>
              {QS[qi].chips.map((label) => (
                <button key={label} onClick={() => answer(label)} className="hv-chip" style={css("font-size:14px;padding:9px 14px;border-radius:999px;border:1px solid #CFE3D6;background:#FFFFFF;color:#185C3B;cursor:pointer;white-space:nowrap;transition:background .15s")}>{label}</button>
              ))}
            </div>
          )}

          {showBlueprint && (
            <div style={css("margin-left:38px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:16px;box-shadow:0 12px 32px rgba(32,39,35,.06);animation:lmIn .4s ease-out")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
                <span style={css("font-size:17px;font-weight:600;letter-spacing:-.01em")}>Business blueprint</span>
                <span style={css("font-size:12px;color:#78817B")}>Every field is editable</span>
              </div>
              <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:12px")}>
                {blueprint.map(([k, v]) => (
                  <label key={k} style={css("display:flex;flex-direction:column;gap:6px;font-size:12px;color:#78817B")}>{k}
                    <input className="fx-input" value={val(k, v)} onChange={(e) => setEdits((x) => ({ ...x, [k]: e.target.value }))} placeholder={k === "Brand direction" ? "Optional, e.g. warm, modern, handmade" : undefined} style={css("font-size:14px;color:#202723;padding:10px 12px;border:1px solid #E8ECE8;border-radius:10px;outline:none;background:#FFFFFF")} />
                  </label>
                ))}
              </div>
              <span style={css("font-size:13px;color:#5E6862;line-height:1.5")}>Next you&apos;ll add your own products. Nothing is published, and nothing is charged.</span>
              {createError && <div role="alert" style={css("font-size:13px;padding:10px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{createError}</div>}
              <div style={css("display:flex;gap:10px;justify-content:flex-end;flex-wrap:wrap")}>
                <button onClick={askRevise} className="hv-grey" style={css("font-size:14px;padding:11px 16px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer")}>Ask for revisions</button>
                <button onClick={createBusiness} disabled={creating} className="hv-green press" style={css("font-size:14px;padding:11px 18px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>{creating ? "Saving…" : "Create my business"}</button>
              </div>
            </div>
          )}
          <div ref={bottom} />
        </div>

        <aside style={css("border-left:1px solid #E8ECE8;background:#F8FAF8;padding:28px 22px;display:flex;flex-direction:column;gap:18px;position:sticky;top:60px;height:calc(100vh - 60px);overflow-y:auto")}>
          <div aria-hidden style={css("position:relative;flex-shrink:0;aspect-ratio:1/0.82;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden;container-type:size")}>
            <IsoScene size={62} offset={8} transform="rotateX(58deg) rotateZ(45deg)" sway={14}>
              <IsoBoxes boxes={scene} variant="build" />
            </IsoScene>
            <span style={css("position:absolute;left:12px;top:10px;font-size:12px;color:#5E6862;background:#FFFFFF;padding:3px 10px;border-radius:999px;border:1px solid #E8ECE8;white-space:nowrap")}>Your plot · {stageLabel}</span>
          </div>
          <div style={css("display:flex;flex-direction:column;gap:10px")}>
            <div style={css("display:flex;justify-content:space-between;font-size:13px")}><span style={css("font-weight:600")}>Your business</span><span style={css("color:#78817B")}>{pct}% complete</span></div>
            <div style={css("height:6px;border-radius:999px;background:#E4E9E5;overflow:hidden")}>
              <div style={{ ...css("height:100%;background:#26734D;border-radius:999px;transition:width .5s ease"), width: pct + "%" }} />
            </div>
          </div>
          {CTX.map(([k, label]) => (
            <div key={k} style={{ ...css("display:flex;flex-direction:column;gap:4px;padding:12px 14px;border-radius:12px;border-style:solid;border-width:1px;transition:background .3s,border-color .3s"), background: a[k] ? "#FFFFFF" : "transparent", borderColor: a[k] ? "#E8ECE8" : "#E4E9E5" }}>
              <span style={css("font-size:12px;color:#78817B")}>{label}</span>
              <span style={{ fontSize: 14, color: a[k] ? "#202723" : "#A3ABA5" }}>{a[k] || "Waiting for your answer"}</span>
            </div>
          ))}
        </aside>
      </div>

      <div style={css("position:fixed;left:0;right:0;bottom:0;padding:16px clamp(16px,3vw,28px);background:linear-gradient(rgba(255,255,255,0),#FFFFFF 40%);pointer-events:none")}>
        <div style={css("max-width:1200px;margin:0 auto;display:grid;grid-template-columns:minmax(0,1fr) minmax(0,340px)")}>
          <div style={css("padding:0 clamp(0px,2vw,12px);pointer-events:auto")}>
            <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:8px 8px 8px 16px;display:flex;gap:8px;align-items:center;box-shadow:0 8px 24px rgba(32,39,35,.06)")}>
              <button type="button" title="Upload logo or product images" aria-label="Upload logo or product images" style={css("width:34px;height:34px;border-radius:9px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer;font-size:12px;color:#5E6862;flex-shrink:0")}>+</button>
              <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }} placeholder={asking ? QS[qi].ph : "Ask for changes to your blueprint…"} style={css("flex:1;min-width:0;border:none;outline:none;font-size:15px;padding:8px 0;background:transparent;color:#202723")} />
              <button onClick={send} className="hv-green" style={css("font-size:14px;padding:10px 16px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer")}>Send</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
