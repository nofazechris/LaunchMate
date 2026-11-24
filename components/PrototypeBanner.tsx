"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { css } from "@/lib/css";

/**
 * The onboarding, build and dashboard screens are a design prototype running on sample data.
 * Nothing on them is a real transaction, registration or purchase. Say so, on every one of them.
 */
export default function PrototypeBanner() {
  const path = usePathname();
  if (path.startsWith("/agent-vault")) return null; // the one real, live screen
  return (
    <div role="note" style={css("background:#FBF3E6;color:#6B4A14;border-bottom:1px solid #EAD9BC;padding:8px 16px;font-size:13px;line-height:1.4;text-align:center")}>
      <b>Prototype with sample data.</b> This screen simulates the business build: no real store, payment, domain or transaction happens here.{" "}
      The real Agent Vault flow is on <Link href="/agent-vault" style={css("color:#6B4A14;text-decoration:underline;font-weight:500")}>its own page</Link>.
    </div>
  );
}
