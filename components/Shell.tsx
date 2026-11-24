"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { NAV } from "@/lib/data";
import { authClient } from "@/lib/auth-client";
import { LogoMark } from "@/components/Logo";

const STATUS: Record<string, [string, string]> = {
  draft: ["Draft", "#C58B34"],
  building: ["Building", "#C58B34"],
  live: ["Live", "#268653"],
  suspended: ["Suspended", "#D94B4B"],
};

export default function Shell({ children, userName, business }: { children: ReactNode; userName: string; business: { name: string; status: string } }) {
  const pathname = usePathname();
  const router = useRouter();
  const page = pathname.split("/")[1] ?? "";
  const initials = userName.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const bizInitials = business.name.trim().split(/\s+/).map((p) => p[0]).slice(0, 2).join("").toUpperCase() || "?";
  const [statusLabel, statusColor] = STATUS[business.status] ?? STATUS.draft;
  const title = NAV.find((n) => n.id === page)?.label ?? "";

  async function signOut() {
    await authClient.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div style={css("display:flex;min-height:100vh;background:#F8FAF8")}>
      <aside style={css("width:236px;flex-shrink:0;background:#FFFFFF;border-right:1px solid #E8ECE8;display:flex;flex-direction:column;padding:16px 12px;gap:18px;position:sticky;top:0;height:100vh")}>
        <Link href="/overview" style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:16px;padding:6px 8px;color:#202723")}>
          <LogoMark />Launchmate
        </Link>
        <div style={css("border:1px solid #E8ECE8;border-radius:12px;padding:10px 12px;display:flex;gap:10px;align-items:center")}>
          <span style={css("width:30px;height:30px;border-radius:8px;background:#E7EAF2;display:grid;place-items:center;font-size:12px;font-weight:600;color:#34467A;flex-shrink:0")}>{bizInitials}</span>
          <span style={css("display:flex;flex-direction:column;gap:2px;min-width:0")}>
            <span style={css("font-size:14px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{business.name}</span>
            <span style={{ fontSize: 12, color: statusColor, display: "flex", alignItems: "center", gap: 5 }}>
              <span style={{ width: 6, height: 6, borderRadius: "50%", background: statusColor }} />{statusLabel}
            </span>
          </span>
        </div>
        <nav style={css("display:flex;flex-direction:column;gap:2px")}>
          {NAV.map((n) => {
            const active = page === n.id;
            return (
              <div key={n.id} style={css("display:flex;flex-direction:column")}>
                {n.divider && <span style={css("height:1px;background:#E8ECE8;margin:8px 4px")} />}
                <Link
                  href={`/${n.id}`}
                  className="hv-nav"
                  aria-current={active ? "page" : undefined}
                  style={{ ...css("display:flex;align-items:center;justify-content:space-between;padding:9px 10px;border-radius:10px;font-size:14px;transition:background .15s"), background: active ? "#EEF6F0" : "transparent", color: active ? "#185C3B" : "#4C5550", fontWeight: active ? 500 : 400 }}
                >
                  {n.label}
                </Link>
              </div>
            );
          })}
        </nav>
        <div style={css("margin-top:auto;display:flex;align-items:center;gap:10px;padding:14px 8px 4px;border-top:1px solid #E8ECE8")}>
          <span style={css("width:28px;height:28px;border-radius:50%;background:#EEF6F0;color:#185C3B;display:grid;place-items:center;font-size:12px;font-weight:600;flex-shrink:0")}>{initials}</span>
          <span style={css("display:flex;flex-direction:column;min-width:0;flex:1")}>
            <span style={css("font-size:13px;font-weight:500;overflow:hidden;text-overflow:ellipsis;white-space:nowrap")}>{userName}</span>
            <button onClick={signOut} style={css("background:none;border:none;padding:0;text-align:left;font-size:12px;color:#78817B;cursor:pointer")}>Sign out</button>
          </span>
        </div>
      </aside>

      <main style={css("flex:1;min-width:0;display:flex;flex-direction:column")}>
        <div style={css("height:60px;border-bottom:1px solid #E8ECE8;background:#FFFFFF;display:flex;align-items:center;padding:0 28px;gap:14px;position:sticky;top:0;z-index:10")}>
          <span style={css("font-size:15px;font-weight:600")}>{title}</span>
          <span style={css("flex:1")} />
          <Link href="/agent" className="hv-green" style={css("font-size:13px;padding:8px 12px;border-radius:10px;background:#26734D;color:#FFFFFF;font-weight:500;white-space:nowrap")}>Ask agent</Link>
        </div>
        {children}
      </main>
    </div>
  );
}
