"use client";

import { css } from "@/lib/css";
import { RULE_LABELS } from "@/lib/data";
import { useLaunchmate } from "@/components/LaunchmateProvider";

export default function SettingsScreen() {
  const { revoked, toggleRevoke, rules, toggleRule } = useLaunchmate();

  const perm = revoked
    ? { status: "Revoked", bg: "#FCEEEE", fg: "#8E2F2F", btn: "Grant a new session", btnFg: "#26734D", btnBd: "#CFE3D6" }
    : { status: "Active", bg: "#E9F4EE", fg: "#1F6B43", btn: "Revoke agent access", btnFg: "#D94B4B", btnBd: "#F0D2D2" };
  const perms: [string, string][] = [
    ["Wallet", "Altana · non-custodial"], ["Agent identity", "Verified agent ID"], ["Spend cap", "50 USD per week"],
    ["Allowed services", "Domain registrar, checkout, suppliers"], ["Contract allowlist", "3 approved contracts"],
    ["Session expires", revoked ? "Revoked just now" : "28 Nov 2026"],
  ];

  return (
    <div data-screen-label="12 Permissions" style={css("padding:28px;display:flex;flex-direction:column;gap:16px;animation:lmIn .35s ease-out;max-width:960px")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:24px;font-weight:600;letter-spacing:-.02em")}>Agent permissions</h1>
        <span style={css("font-size:14px;color:#78817B")}>What your agent can do on its own, and what always needs you.</span>
      </div>

      <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:18px")}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap")}>
          <span style={css("display:flex;flex-direction:column;gap:4px")}>
            <span style={css("font-size:16px;font-weight:600")}>Agent wallet</span>
            <span style={css("font-size:13px;color:#78817B")}>Non-custodial — you hold the keys. The agent uses a limited session key.</span>
          </span>
          <span style={{ ...css("font-size:12px;padding:4px 10px;border-radius:999px;font-weight:500"), background: perm.bg, color: perm.fg }}>{perm.status}</span>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:14px")}>
          {perms.map(([k, v]) => (
            <div key={k} style={css("display:flex;flex-direction:column;gap:4px;padding:14px;border-radius:12px;background:#F8FAF8")}>
              <span style={css("font-size:12px;color:#78817B")}>{k}</span>
              <span style={css("font-size:14px;line-height:1.4")}>{v}</span>
            </div>
          ))}
        </div>
        <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
          <button onClick={toggleRevoke} style={{ ...css("font-size:14px;padding:11px 16px;border-radius:10px;border-style:solid;border-width:1px;background:#FFFFFF;cursor:pointer;font-weight:500"), borderColor: perm.btnBd, color: perm.btnFg }}>{perm.btn}</button>
          <button style={css("font-size:14px;padding:11px 16px;border-radius:10px;border:1px solid #E8ECE8;background:#FFFFFF;cursor:pointer")}>Change spend cap</button>
        </div>
      </div>

      <div style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:12px")}>
        <span style={css("font-size:16px;font-weight:600")}>Always ask me before</span>
        {RULE_LABELS.map((label, i) => (
          <button key={label} role="switch" aria-checked={rules[i]} onClick={() => toggleRule(i)} style={css("display:flex;justify-content:space-between;align-items:center;gap:16px;padding:12px 0;border:none;border-top:1px solid #F0F2F0;background:none;cursor:pointer;text-align:left;color:#202723;font-size:14px")}>
            <span>{label}</span>
            <span style={{ ...css("width:40px;height:24px;border-radius:999px;position:relative;flex-shrink:0;transition:background .2s"), background: rules[i] ? "#26734D" : "#D5DBD6" }}>
              <span style={{ ...css("position:absolute;top:3px;width:18px;height:18px;border-radius:50%;background:#FFFFFF;box-shadow:0 1px 3px rgba(0,0,0,.15);transition:left .2s"), left: rules[i] ? 19 : 3 }} />
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
