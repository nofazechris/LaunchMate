"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { boxes } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { LogoMark } from "@/components/Logo";

type Key = "idea" | "audience" | "type" | "budget" | "name";
interface Step { key: Key; q: string; why: string; ph?: string; chips: string[]; choiceOnly?: boolean; optional?: boolean; long?: boolean }

const STEPS: Step[] = [
  { key: "idea", q: "What will you sell?", why: "This shapes your store plan and the first products we help you add.", ph: "e.g. Ready-to-wear dresses and native outfits for women", chips: ["Clothing and fashion", "Skincare and beauty", "Bags and accessories", "Digital products"], long: true },
  { key: "audience", q: "Who are your customers?", why: "Knowing who you sell to helps us choose the tone and layout of your store.", ph: "e.g. Women in Lagos aged 22–35 who shop on Instagram", chips: ["Young professionals in Lagos", "Gift buyers across Nigeria", "Customers abroad"], long: true },
  { key: "type", q: "Will you sell physical products, digital downloads, or both?", why: "Physical products need delivery details. Digital ones need protected downloads.", chips: ["Physical products", "Digital downloads", "Both"], choiceOnly: true },
  { key: "budget", q: "Roughly how much can you spend getting started?", why: "Optional. It helps us keep suggestions, like a custom domain, within reach.", chips: ["Under ₦50,000", "₦50,000 – ₦150,000", "Over ₦150,000", "Not sure yet"], optional: true, choiceOnly: true },
  { key: "name", q: "What is your business called?", why: "You can change this later. We use it to reserve your store address.", ph: "Your business name", chips: [] },
];

const CATEGORIES = ["Fashion & apparel", "Beauty & skincare", "Bags & accessories", "Home & lifestyle", "Digital products", "Other"];
const LABEL: Record<Key, string> = { idea: "What you sell", audience: "Your customers", type: "Product type", budget: "Starting budget", name: "Business name" };
const STAGE_LABEL = ["Empty plot", "Idea planted", "Taking shape", "Named"];

function guessCategory(idea: string): string {
  if (/cloth|fashion|wear|dress|shirt|native|outfit|ankara|aso|trouser|gown/i.test(idea)) return "Fashion & apparel";
  if (/skin|beauty|perfume|makeup|cosmetic|hair/i.test(idea)) return "Beauty & skincare";
  if (/\bbag|shoe|accessor|jewel|watch/i.test(idea)) return "Bags & accessories";
  if (/digital|template|ebook|e-book|course|download/i.test(idea)) return "Digital products";
  if (/home|decor|furniture|kitchen/i.test(idea)) return "Home & lifestyle";
  return "Other";
}

const input = "font-size:16px;padding:14px 16px;border:1px solid #E8ECE8;border-radius:12px;outline:none;background:#FFFFFF;width:100%;font-family:inherit;color:#202723";
const primary = "background:#26734D;color:#FFFFFF;border:none;font-size:15px;font-weight:500;padding:13px 22px;border-radius:12px;cursor:pointer";
const ghost = "background:none;border:none;color:#5E6862;font-size:14px;padding:13px 6px;cursor:pointer";

export default function Onboarding({ userId, userName }: { userId: string; userName: string }) {
  const router = useRouter();
  const storeKey = `lm-onboarding-v1:${userId}`;
  const [i, setI] = useState(0); // 0..STEPS.length-1 questions, STEPS.length = review
  const [answers, setAnswers] = useState<Partial<Record<Key, string>>>({});
  const [draft, setDraft] = useState("");
  const [review, setReview] = useState<Record<string, string>>({});
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Restore progress saved on this device.
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storeKey);
      if (raw) {
        const s = JSON.parse(raw) as { i?: number; answers?: Partial<Record<Key, string>>; review?: Record<string, string> };
        setAnswers(s.answers ?? {});
        setReview(s.review ?? {});
        const at = Math.min(Math.max(s.i ?? 0, 0), STEPS.length);
        setI(at);
        setDraft(at < STEPS.length ? (s.answers?.[STEPS[at].key] ?? "") : "");
      }
    } catch { /* ignore a corrupted draft */ }
    setLoaded(true);
  }, [storeKey]);
  useEffect(() => {
    if (loaded) localStorage.setItem(storeKey, JSON.stringify({ i, answers, review }));
  }, [loaded, storeKey, i, answers, review]);

  const reviewing = i >= STEPS.length;
  const step = reviewing ? null : STEPS[i];
  const first = userName.trim().split(/\s+/)[0] || "there";

  const filled = (["idea", "audience", "type", "name"] as Key[]).filter((k) => answers[k]?.trim()).length;
  const stage = filled === 0 ? 0 : filled === 1 ? 1 : filled < 4 ? 2 : 3;
  const scene = useMemo(() => boxes(stage, null), [stage]);

  const canContinue = step ? (step.optional || draft.trim().length >= (step.key === "name" ? 2 : 2)) : true;

  function next() {
    if (!step) return;
    setAnswers((a) => ({ ...a, [step.key]: draft.trim() }));
    setError(null);
    const to = i + 1;
    setI(to);
    setDraft(to < STEPS.length ? (answers[STEPS[to].key] ?? "") : "");
  }
  function back() {
    if (i === 0) return;
    if (step) setAnswers((a) => ({ ...a, [step.key]: draft.trim() }));
    const to = i - 1;
    setI(to);
    setDraft(answers[STEPS[to].key] ?? "");
  }

  const plan = {
    "Business name": review["Business name"] ?? answers.name ?? "",
    Category: review["Category"] ?? guessCategory(answers.idea ?? ""),
    Description: review["Description"] ?? answers.idea ?? "",
    "Target market": review["Target market"] ?? answers.audience ?? "",
    "Product type": review["Product type"] ?? answers.type ?? "",
    "Launch budget": review["Launch budget"] ?? answers.budget ?? "",
    "Brand direction": review["Brand direction"] ?? "",
  };
  const set = (k: string, v: string) => setReview((r) => ({ ...r, [k]: v }));

  async function create() {
    if (plan["Business name"].trim().length < 2) return setError("Please give your business a name.");
    setBusy(true);
    setError(null);
    try {
      const bp = Object.fromEntries(Object.entries(plan).map(([k, v]) => [k, v.trim()]));
      const res = await fetch("/api/businesses", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name: bp["Business name"], category: bp["Category"] || undefined, description: bp["Description"] || undefined, profile: { answers, blueprint: bp } }),
      });
      if (!res.ok && res.status !== 409) throw new Error((await res.json().catch(() => ({}))).error ?? "We couldn't save your business. Please try again.");
      localStorage.removeItem(storeKey);
      router.push("/overview");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "We couldn't save your business. Please try again.");
      setBusy(false);
    }
  }

  const summary = (Object.keys(LABEL) as Key[]).filter((k) => answers[k]?.trim());

  return (
    <div style={css("min-height:100vh;background:#F8FAF8;display:flex;flex-direction:column")}>
      <header style={css("height:64px;border-bottom:1px solid #E8ECE8;background:#FFFFFF;display:flex;align-items:center;padding:0 clamp(16px,3vw,32px);gap:16px")}>
        <span style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px")}><LogoMark />Launchmate</span>
        <span style={css("flex:1")} />
        <span style={css("font-size:12px;color:#78817B;display:flex;align-items:center;gap:6px")}>
          <span style={css("width:6px;height:6px;border-radius:50%;background:#268653")} />Progress saved on this device
        </span>
      </header>

      <div style={css("flex:1;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));max-width:1180px;width:100%;margin:0 auto;gap:clamp(16px,3vw,40px);padding:clamp(20px,4vw,48px) clamp(16px,3vw,32px)")}>
        {/* ── the guided flow ── */}
        <div style={css("display:flex;flex-direction:column;gap:28px;max-width:600px;width:100%")}>
          <div style={css("display:flex;flex-direction:column;gap:10px")}>
            <div style={css("display:grid;grid-template-columns:repeat(6,1fr);gap:5px")} aria-hidden>
              {Array.from({ length: STEPS.length + 1 }).map((_, n) => <span key={n} style={{ height: 4, borderRadius: 3, background: n <= i ? "#26734D" : "#DCE2DD", transition: "background .3s" }} />)}
            </div>
            <span style={css("font-size:13px;color:#78817B")}>{reviewing ? "Review" : `Step ${i + 1} of ${STEPS.length}`}</span>
          </div>

          {!reviewing && step && (
            <div key={step.key} style={css("display:flex;flex-direction:column;gap:22px;animation:lmIn .35s ease-out")}>
              <div style={css("display:flex;gap:14px;align-items:flex-start")}>
                <span style={css("width:34px;height:34px;border-radius:10px;background:#EEF6F0;flex-shrink:0;display:grid;place-items:center")}><span style={css("width:11px;height:11px;border-radius:3px;background:#26734D;transform:rotate(45deg)")} /></span>
                <div style={css("display:flex;flex-direction:column;gap:8px")}>
                  {i === 0 && <span style={css("font-size:15px;color:#5E6862")}>Hi {first}. A few quick questions, about two minutes, and we&apos;ll shape your business plan.</span>}
                  <h1 style={css("margin:0;font-size:clamp(26px,3vw,34px);line-height:1.15;letter-spacing:-.025em;font-weight:600;text-wrap:balance")}>{step.q}</h1>
                  <span style={css("font-size:14px;color:#78817B;line-height:1.5")}>{step.why}</span>
                </div>
              </div>

              {step.chips.length > 0 && (
                <div style={css("display:flex;gap:8px;flex-wrap:wrap")}>
                  {step.chips.map((c) => (
                    <button key={c} onClick={() => setDraft(c)} className="hv-chip" style={{ ...css("font-size:14px;padding:9px 14px;border-radius:999px;cursor:pointer;transition:background .15s"), border: `1px solid ${draft === c ? "#26734D" : "#CFE3D6"}`, background: draft === c ? "#EEF6F0" : "#FFFFFF", color: "#185C3B" }}>{c}</button>
                  ))}
                </div>
              )}

              {!step.choiceOnly && (step.long ? (
                <textarea value={draft} onChange={(e) => setDraft(e.target.value)} placeholder={step.ph} rows={3} className="fx-input" style={{ ...css(input), resize: "vertical", lineHeight: 1.5 }} autoFocus />
              ) : (
                <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter" && canContinue) next(); }} placeholder={step.ph} className="fx-input" style={css(input)} autoFocus />
              ))}

              <div style={css("display:flex;gap:10px;align-items:center")}>
                <button onClick={next} disabled={!canContinue} className="hv-green press" style={{ ...css(primary), opacity: canContinue ? 1 : 0.5 }}>{step.key === "name" ? "Review my plan" : "Continue"}</button>
                {i > 0 && <button onClick={back} style={css(ghost)}>Back</button>}
                {step.optional && <button onClick={() => { setDraft(""); next(); }} style={css(ghost)}>Skip</button>}
              </div>
            </div>
          )}

          {reviewing && (
            <div style={css("display:flex;flex-direction:column;gap:22px;animation:lmIn .35s ease-out")}>
              <div style={css("display:flex;flex-direction:column;gap:8px")}>
                <h1 style={css("margin:0;font-size:clamp(26px,3vw,34px);line-height:1.15;letter-spacing:-.025em;font-weight:600")}>Here&apos;s your business plan.</h1>
                <span style={css("font-size:14px;color:#78817B;line-height:1.5")}>This is only what you told us. Change anything now or later. Nothing is published and nothing is charged.</span>
              </div>
              <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(240px,1fr));gap:14px")}>
                {Object.entries(plan).map(([k, v]) => (
                  <label key={k} style={{ ...css("display:flex;flex-direction:column;gap:6px;font-size:12px;color:#78817B"), gridColumn: k === "Description" ? "1 / -1" : undefined }}>{k}{k === "Brand direction" ? " (optional)" : ""}
                    {k === "Category" ? (
                      <select value={v} onChange={(e) => set(k, e.target.value)} className="fx-input" style={css(input.replace("font-size:16px", "font-size:14px"))}>
                        {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                      </select>
                    ) : k === "Description" ? (
                      <textarea value={v} onChange={(e) => set(k, e.target.value)} rows={2} className="fx-input" style={{ ...css(input.replace("font-size:16px", "font-size:14px")), resize: "vertical" }} />
                    ) : (
                      <input value={v} onChange={(e) => set(k, e.target.value)} placeholder={k === "Brand direction" ? "e.g. warm, modern, handmade" : undefined} className="fx-input" style={css(input.replace("font-size:16px", "font-size:14px"))} />
                    )}
                  </label>
                ))}
              </div>
              {error && <div role="alert" style={css("font-size:13px;padding:10px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{error}</div>}
              <div style={css("display:flex;gap:10px;align-items:center")}>
                <button onClick={create} disabled={busy} className="hv-green press" style={{ ...css(primary), opacity: busy ? 0.7 : 1 }}>{busy ? "Creating…" : "Create my business"}</button>
                <button onClick={back} disabled={busy} style={css(ghost)}>Back</button>
              </div>
            </div>
          )}
        </div>

        {/* ── your plot + plan so far ── */}
        <aside style={css("display:flex;flex-direction:column;gap:14px;align-self:start;position:sticky;top:24px")}>
          <div aria-hidden style={css("position:relative;aspect-ratio:1/0.85;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:20px;overflow:hidden;container-type:size")}>
            <IsoScene size={62} offset={8} transform="rotateX(58deg) rotateZ(45deg)" sway={14}>
              <IsoBoxes boxes={scene} variant="build" />
            </IsoScene>
            <span style={css("position:absolute;left:14px;top:12px;font-size:12px;color:#5E6862;background:#FFFFFF;padding:4px 10px;border-radius:999px;border:1px solid #E8ECE8;white-space:nowrap")}>Your plot · {STAGE_LABEL[stage]}</span>
          </div>
          <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:16px 18px;display:flex;flex-direction:column;gap:10px")}>
            <span style={css("font-size:13px;font-weight:600")}>Your plan so far</span>
            {summary.length === 0 && <span style={css("font-size:13px;color:#78817B;line-height:1.5")}>Your answers appear here as you go. The plot above grows with them.</span>}
            {summary.map((k) => (
              <div key={k} style={css("display:flex;flex-direction:column;gap:2px;animation:lmIn .3s ease-out")}>
                <span style={css("font-size:11px;color:#78817B")}>{LABEL[k]}</span>
                <span style={css("font-size:14px;line-height:1.4")}>{answers[k]}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}
