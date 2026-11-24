"use client";

import { useEffect, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { NAV } from "@/lib/data";
import { LogoMark } from "@/components/Logo";
import { useLaunchmate } from "@/components/LaunchmateProvider";

export default function Shell({ children }: { children: ReactNode }) {
  const { buildStarted, launched, tasks, restock, bizUrl } = useLaunchmate();
  const pathname = usePathname();
  const router = useRouter();
  const page = pathname.split("/")[1] ?? "";

  // No business yet (fresh load) -> back to the start. Still building -> only the build screen is open.
  useEffect(() => {
    if (!buildStarted && !launched) router.replace("/");
    else if (!launched && page !== "build") router.replace("/build");
  }, [buildStarted, launched, page, router]);

  const items = (launched ? [] : [{ id: "build", label: "Build progress", divider: false }]).concat(NAV.map((n) => ({ ...n, divider: !!n.divider })));
  const title = page === "build" ? "Build progress" : NAV.find((n) => n.id === page)?.label ?? "";
  const live = launched;

  return (
    <div style={css("display:flex;min-height:100vh;background:#F8FAF8")}>
      <aside style={css("width:236px;flex-shrink:0;background:#FFFFFF;border-right:1px solid #E8ECE8;display:flex;flex-direction:column;padding:16px 12px;gap:18px;position:sticky;top:0;height:100vh")}>
        <Link href="/" style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px;padding:6px 8px;color:#202723")}>
          <LogoMark />Launchmate
        </Link>
        <div style={css("border:1px solid #E8ECE8;border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center")}>
          <span style={css("width:30px;height:30px;border-radius:8px;background:#E7EAF2;display:grid;place-items:center;font-size:12px;font-weight:600;color:#34467A")}>A&amp;</span>
          <span style={css("display:flex;flex-direction:column;gap:2px;min-width:0")}>
            <span style={css("font-size:14px;font-weight:500")}>Adire &amp; Co.</span>
            <span style={{ fontSize: 12, color: live ? "#268653" : "#C58B34", display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: live ? "#268653" : "#C58B34" }} />{live ? "Live" : "Building"}
            </span>
          </span>
        </div>
        <nav style={css("display:flex;flex-direction:column;gap:2px")}>
          {items.map((n) => {
            const active = page === n.id;
            const locked = !launched && n.id !== "build";
            const badge = n.id === "build" && tasks[5] === "approval" ? "Needs you" : n.id === "agent" && launched && restock === "pending" ? "1" : "";
            const style = {
              ...css("display:flex;align-items:center;justify-content:space-between;text-align:left;padding:9px 10px;border-radius:10px;border:none;font-size:14px;transition:background .15s"),
              background: active ? "#EEF6F0" : "transparent", color: locked ? "#B4BBB6" : active ? "#185C3B" : "#4C5550",
              fontWeight: active ? 500 : 400, cursor: locked ? "default" : "pointer",
            };
            const inner = (
              <>
                <span>{n.label}</span>
                {badge && <span style={css("font-size:11px;padding:2px 7px;border-radius:999px;background:#FBF3E6;color:#8A5E1C;font-weight:500")}>{badge}</span>}
              </>
            );
            return (
              <div key={n.id} style={css("display:flex;flex-direction:column")}>
                {n.divider && <span style={css("height:1px;background:#E8ECE8;margin:8px 4px")} />}
                {locked ? (
                  <button disabled style={style}>{inner}</button>
                ) : (
                  <Link href={`/${n.id}`} className="hv-nav" aria-current={active ? "page" : undefined} style={style}>{inner}</Link>
                )}
              </div>
            );
          })}
        </nav>
        <div style={css("margin-top:auto;display:flex;align-items:center;gap:10px;padding:14px 8px 4px;border-top:1px solid #E8ECE8")}>
          <span style={css("width:28px;height:28px;border-radius:50%;background:#EEF6F0;color:#185C3B;display:grid;place-items:center;font-size:12px;font-weight:600")}>FO</span>
          <span style={css("display:flex;flex-direction:column")}>
            <span style={css("font-size:13px;font-weight:500")}>Funmi Okafor</span>
            <span style={css("font-size:12px;color:#78817B")}>Owner</span>
          </span>
        </div>
      </aside>

      <main style={css("flex:1;min-width:0;display:flex;flex-direction:column")}>
        <div style={css("height:60px;border-bottom:1px solid #E8ECE8;background:#FFFFFF;display:flex;align-items:center;padding:0 28px;gap:14px;position:sticky;top:0;z-index:10")}>
          <span style={css("font-size:15px;font-weight:600")}>{title}</span>
          <span style={css("font-size:13px;color:#78817B;font-family:var(--font-mono);white-space:nowrap;overflow:hidden;text-overflow:ellipsis")}>{bizUrl}</span>
          <span style={css("flex:1")} />
          {launched ? (
            <Link href="/agent" className="hv-green" style={css("font-size:13px;padding:8px 12px;border-radius:10px;background:#26734D;color:#FFFFFF;font-weight:500;white-space:nowrap")}>Ask agent</Link>
          ) : (
            <button disabled title="Available once your business is live" style={css("font-size:13px;padding:8px 12px;border-radius:10px;border:none;background:#26734D;color:#FFFFFF;font-weight:500;white-space:nowrap;opacity:.5")}>Ask agent</button>
          )}
        </div>
        {children}
      </main>
    </div>
  );
}
