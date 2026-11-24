"use client";

import { useEffect, useState } from "react";
import { css } from "@/lib/css";

interface Status {
  connected: boolean;
  walletReady: boolean;
  walletTokens: string[];
  walletUngoverned: boolean;
  logins: { website: string; hasEmail: boolean; hasTotp: boolean }[];
  loginReady: boolean;
  note?: string;
  error?: string;
}
interface Entry { at: string; what: string; result: string; tone: "ok" | "warn" | "bad" }

const TONE = { ok: ["#E9F4EE", "#1F6B43"], warn: ["#FBF3E6", "#8A5E1C"], bad: ["#FCEEEE", "#8E2F2F"] } as const;
const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px";
const input = "font-size:14px;padding:10px 12px;border:1px solid #E8ECE8;border-radius:10px;outline:none;background:#FFFFFF;width:100%";
const btn = "font-size:14px;padding:11px 16px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;cursor:pointer";

function Pill({ ok, label }: { ok: boolean | undefined; label: string }) {
  const [bg, fg] = ok ? TONE.ok : TONE.warn;
  return <span style={{ ...css("font-size:12px;padding:3px 9px;border-radius:999px;font-weight:500"), background: bg, color: fg }}>{label}</span>;
}

export default function AgentVaultScreen() {
  const [token, setToken] = useState("");
  const [status, setStatus] = useState<Status | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [log, setLog] = useState<Entry[]>([]);
  const [payUrl, setPayUrl] = useState("https://gateway.usebuy.ai/");
  const [maxUsd, setMaxUsd] = useState("0.05");
  const [approved, setApproved] = useState(false);
  const [payKey, setPayKey] = useState<string | null>(null);

  useEffect(() => { setToken(sessionStorage.getItem("owner-token") ?? ""); }, []);
  const add = (what: string, result: string, tone: Entry["tone"]) =>
    setLog((l) => [{ at: new Date().toLocaleTimeString(), what, result, tone }, ...l]);

  async function call(path: string, init?: RequestInit) {
    const res = await fetch(path, { ...init, headers: { "content-type": "application/json", "x-owner-token": token, ...(init?.headers ?? {}) } });
    return { ok: res.ok, status: res.status, data: await res.json().catch(() => ({})) };
  }

  async function check() {
    sessionStorage.setItem("owner-token", token);
    setBusy("check");
    const r = await call("/api/agentvault/status");
    setBusy(null);
    if (!r.ok) { setStatus(null); add("Check connection", r.data.error ?? `Failed (${r.status})`, "bad"); return; }
    setStatus(r.data);
    add("Check connection", "Connected to Agent Vault", "ok");
  }

  async function signIn() {
    setBusy("signin");
    const r = await call("/api/agentvault/signin", { method: "POST" });
    setBusy(null);
    const d = r.data;
    if (!r.ok) return add("Sign in", d.error ?? `Failed (${r.status})`, "bad");
    const map: Record<string, [string, Entry["tone"]]> = {
      signed_in: [`Signed in to ${d.host}. The agent never saw the password.`, "ok"],
      rejected: [`${d.host} rejected the sign-in.`, "bad"],
      needs_owner: [d.reason ?? "The site needs you to complete a step.", "warn"],
      no_login: [d.hint ?? "No login stored for this site.", "warn"],
      inconclusive: [d.hint ?? "Inconclusive. Not treated as success.", "warn"],
    };
    const [msg, tone] = map[d.outcome] ?? ["Unexpected answer.", "bad"];
    add("Sign in", msg, tone);
  }

  async function pay() {
    setBusy("pay");
    const key = payKey ?? "lm-" + crypto.randomUUID().replace(/-/g, "").slice(0, 24);
    setPayKey(key);
    const r = await call("/api/agentvault/pay", { method: "POST", body: JSON.stringify({ url: payUrl, maxUsd, confirmedMaxUsd: maxUsd, idempotencyKey: key }) });
    setBusy(null);
    const d = r.data;
    if (!r.ok) return add("Pay", d.error ?? `Failed (${r.status})`, "bad");
    if (d.outcome === "paid") { setPayKey(null); setApproved(false); return add("Pay", `Paid ${d.amount ?? "?"} ${d.token ?? ""} on ${d.network ?? "Celo"}. Transaction ${d.txHash ?? "(not returned)"}`, "ok"); }
    if (d.outcome === "awaiting_owner") return add("Pay", "Waiting for you to approve in the Agent Vault dashboard. Press Pay again afterwards to check (same payment, it cannot pay twice).", "warn");
    if (d.outcome === "unpaid") return add("Pay", d.message ?? "That route asked for no payment.", "warn");
    add("Pay", `Refused (${d.code}): ${d.message}${d.paymentMayHaveBeenSent ? " A payment may have been sent: check Agent Vault before retrying." : " Nothing was paid."}`, "bad");
  }

  return (
      <main style={css("max-width:860px;width:100%;padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out")}>
        <div style={css("display:flex;flex-direction:column;gap:4px")}>
          <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Operator tools: secure sign-in and payments</h1>
          <span style={css("font-size:14px;color:#78817B;line-height:1.5")}>Internal console for the Agent Vault integration (hackathon track). It signs in to one stored website login and pays one marketplace service, using placeholders only, under a hard spending ceiling and with your approval. Not part of the seller experience.</span>
        </div>

        <section style={css(card)}>
          <span style={css("font-size:15px;font-weight:600")}>1. Connect</span>
          <div style={css("display:flex;gap:8px")}>
            <input type="password" autoComplete="off" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Owner token (DEMO_ADMIN_TOKEN)" className="fx-input" style={css(input)} />
            <button onClick={check} disabled={!token || busy === "check"} style={css(btn)} className="hv-green">{busy === "check" ? "Checking…" : "Check connection"}</button>
          </div>
          {status && (
            <div style={css("display:flex;gap:8px;flex-wrap:wrap;align-items:center")}>
              <Pill ok={status.connected} label={status.connected ? "Connected" : "Not connected"} />
              <Pill ok={status.walletReady} label={status.walletReady ? `Wallet ready (${status.walletTokens.join(", ")})` : "Wallet not set up"} />
              <Pill ok={status.loginReady} label={status.loginReady ? `${status.logins.length} login(s): ${status.logins.map((l) => l.website).join(", ")}` : "No login stored"} />
              {status.walletUngoverned && <Pill ok={false} label="No spending limits on the wallet yet" />}
            </div>
          )}
          {status?.note && <span style={css("font-size:13px;color:#5E6862")}>{status.note}</span>}
        </section>

        <section style={css(card)}>
          <span style={css("font-size:15px;font-weight:600")}>2. Sign in to your registrar</span>
          <span style={css("font-size:13px;color:#5E6862;line-height:1.5")}>Uses the one site in <code>config/agentvault-site.json</code>. If the site asks for a code, you answer it; the agent cannot.</span>
          <div><button onClick={signIn} disabled={!status?.loginReady || busy === "signin"} className="hv-green" style={{ ...css(btn), opacity: status?.loginReady ? 1 : 0.5 }}>{busy === "signin" ? "Signing in…" : "Sign in with Agent Vault"}</button></div>
        </section>

        <section style={css(card)}>
          <span style={css("font-size:15px;font-weight:600")}>3. Pay a data service (x402, from your Agent Vault wallet)</span>
          <label style={css("font-size:12px;color:#78817B;display:flex;flex-direction:column;gap:6px")}>Buy service URL
            <input value={payUrl} onChange={(e) => setPayUrl(e.target.value)} className="fx-input" style={css(input)} />
          </label>
          <label style={css("font-size:12px;color:#78817B;display:flex;flex-direction:column;gap:6px;max-width:220px")}>Most to pay (USD)
            <input value={maxUsd} onChange={(e) => { setMaxUsd(e.target.value); setApproved(false); }} inputMode="decimal" className="fx-input" style={css(input)} />
          </label>
          <label style={css("display:flex;gap:10px;align-items:flex-start;font-size:14px;line-height:1.4")}>
            <input type="checkbox" checked={approved} onChange={(e) => setApproved(e.target.checked)} style={css("margin-top:3px")} />
            <span>I approve paying up to <b>${maxUsd || "0"}</b> from my Agent Vault wallet to <b>{(() => { try { return new URL(payUrl).host; } catch { return "…"; } })()}</b>. Payments are final.</span>
          </label>
          <div><button onClick={pay} disabled={!approved || !status?.walletReady || busy === "pay"} className="hv-green" style={{ ...css(btn), opacity: approved && status?.walletReady ? 1 : 0.5 }}>{busy === "pay" ? "Working…" : "Pay"}</button></div>
          <span style={css("font-size:12px;color:#78817B")}>Agent Vault will also ask you to approve a new seller and any amount over your limit. The wallet must hold USDC, USDT or USAT on Celo.</span>
        </section>

        <section style={css(card)}>
          <span style={css("font-size:15px;font-weight:600")}>What happened</span>
          {log.length === 0 && <span style={css("font-size:14px;color:#78817B")}>Nothing yet.</span>}
          {log.map((e, i) => (
            <div key={i} style={css("display:flex;gap:12px;align-items:flex-start;font-size:14px;padding:10px 0;border-top:1px solid #F0F2F0")}>
              <span style={css("width:70px;font-size:12px;color:#78817B;flex-shrink:0;padding-top:2px")}>{e.at}</span>
              <span style={css("width:130px;flex-shrink:0;font-weight:500")}>{e.what}</span>
              <span style={{ ...css("flex:1;padding:3px 10px;border-radius:10px;line-height:1.45;word-break:break-word"), background: TONE[e.tone][0], color: TONE[e.tone][1] }}>{e.result}</span>
            </div>
          ))}
        </section>
      </main>
  );
}
