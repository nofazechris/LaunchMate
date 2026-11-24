"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";

export default function DomainForm({ saved }: { saved: string | null }) {
  const router = useRouter();
  const [value, setValue] = useState(saved ?? "");
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    const res = await fetch("/api/domain", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify({ domain: value }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setMsg({ ok: false, text: data.error ?? "We couldn't save that." });
    setValue(data.domain ?? "");
    setMsg({ ok: true, text: data.domain ? `Saved. We'll look into ${data.domain} for you.` : "Removed." });
    router.refresh();
  }

  return (
    <form onSubmit={submit} style={css("display:flex;flex-direction:column;gap:12px;max-width:460px")}>
      <label style={css("display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500")}>The address you would like
        <input className="fx-input" value={value} onChange={(e) => setValue(e.target.value)} placeholder="yourbrand.com or yourbrand.com.ng" autoComplete="off" style={css("font-size:15px;padding:12px 14px;border:1px solid #E8ECE8;border-radius:11px;outline:none;background:#FFFFFF;width:100%")} />
      </label>
      {msg && <div role="status" style={{ ...css("font-size:13px;padding:9px 12px;border-radius:10px"), background: msg.ok ? "#E9F4EE" : "#FCEEEE", color: msg.ok ? "#1F6B43" : "#8E2F2F" }}>{msg.text}</div>}
      <div><button type="submit" disabled={busy} className="hv-green" style={{ ...css("background:#26734D;color:#FFFFFF;border:none;font-size:14px;font-weight:500;padding:11px 18px;border-radius:10px;cursor:pointer"), opacity: busy ? 0.7 : 1 }}>{busy ? "Saving…" : saved ? "Update" : "Save"}</button></div>
    </form>
  );
}
