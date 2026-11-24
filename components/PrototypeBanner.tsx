"use client";

import { usePathname } from "next/navigation";
import { css } from "@/lib/css";

/**
 * The onboarding, build and dashboard screens still run on sample data: nothing on them is a real
 * transaction, registration or purchase. We say so, but quietly: a small pill that never covers
 * the layout. It goes away screen by screen as each one is backed by real data.
 */
const SAMPLE_SCREENS = new Set(["/world", "/store", "/products", "/orders", "/finances", "/agent", "/activity", "/settings"]);

export default function PrototypeBanner() {
  const path = usePathname();
  // Only the screens that still run on sample data. Landing, sign-up/in, onboarding, Overview and /agent-vault are real.
  const first = "/" + (path.split("/")[1] ?? "");
  if (!SAMPLE_SCREENS.has(first)) return null;
  return (
    <div
      role="note"
      title="This screen runs on sample data. No real store, payment, domain or transaction happens here. The live Agent Vault flow is at /agent-vault."
      style={css("position:fixed;right:16px;bottom:16px;z-index:50;background:#FBF3E6;color:#6B4A14;border:1px solid #EAD9BC;border-radius:999px;padding:3px 12px;font-size:12px;font-weight:500;white-space:nowrap;pointer-events:auto;cursor:help")}
    >
      Demo · sample data
    </div>
  );
}
