"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";

/** Open or close the store. Opening asks for a clear yes: it makes published products public. */
export default function StoreToggle({ open, canOpen }: { open: boolean; canOpen: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function set(status: "live" | "draft") {
    if (status === "live" && !window.confirm("Open your store? Anyone with your store link will be able to see your published products and send you orders.")) return;
    setBusy(true);
    setError(null);
    const res = await fetch("/api/store", { method: "PATCH", headers: { "content-type": "application/json" }, body: JSON.stringify({ status }) });
    const data = await res.json().catch(() => ({}));
    setBusy(false);
    if (!res.ok) return setError(data.error ?? "We couldn't change that.");
    router.refresh();
  }

  return (
    <div style={css("display:flex;flex-direction:column;gap:10px;align-items:flex-start")}>
      {open ? (
        <button onClick={() => set("draft")} disabled={busy} style={css("background:#FFFFFF;border:1px solid #E8ECE8;color:#202723;font-size:14px;font-weight:500;padding:11px 18px;border-radius:10px;cursor:pointer")}>{busy ? "Closing…" : "Close my store"}</button>
      ) : (
        <button onClick={() => set("live")} disabled={busy || !canOpen} className="hv-green" style={{ ...css("background:#26734D;color:#FFFFFF;border:none;font-size:14px;font-weight:500;padding:11px 18px;border-radius:10px;cursor:pointer"), opacity: busy || !canOpen ? 0.55 : 1 }}>{busy ? "Opening…" : "Open my store"}</button>
      )}
      {!open && !canOpen && <span style={css("font-size:13px;color:#8A5E1C")}>Publish at least one product with a price first.</span>}
      {error && <div role="alert" style={css("font-size:13px;padding:9px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{error}</div>}
    </div>
  );
}
