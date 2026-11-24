import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { agentMemory } from "@/db/schema";
import DomainForm from "@/components/DomainForm";
import { css } from "@/lib/css";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Domain · Launchmate" };

const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:14px";

export default async function Page() {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!;
  const [mem] = await db.select({ value: agentMemory.value }).from(agentMemory)
    .where(and(eq(agentMemory.businessId, business.id), eq(agentMemory.key, "preferred_domain"))).limit(1);
  const saved = (mem?.value as { domain?: string } | undefined)?.domain ?? null;
  const base = process.env.STOREFRONT_BASE_DOMAIN;

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:16px;max-width:760px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Your store address</h1>
        <span style={css("font-size:14px;color:#78817B;line-height:1.5")}>Where customers will find you online.</span>
      </div>

      <div style={css(card)}>
        <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}>
          <span style={css("font-size:15px;font-weight:600")}>Free Launchmate address</span>
          <span style={css("font-size:12px;padding:3px 9px;border-radius:999px;background:#FBF3E6;color:#8A5E1C;font-weight:500")}>Reserved</span>
        </div>
        <span style={css("font-family:var(--font-mono);font-size:16px")}>{base ? `${business.slug}.${base}` : business.slug}</span>
        <span style={css("font-size:13px;color:#5E6862;line-height:1.5")}>This is yours at no cost. It starts working when your store goes live, which isn&apos;t available yet.</span>
      </div>

      <div style={css(card)}>
        <div style={css("display:flex;flex-direction:column;gap:6px")}>
          <span style={css("font-size:15px;font-weight:600")}>Your own domain <span style={css("font-weight:400;color:#78817B")}>(optional)</span></span>
          <span style={css("font-size:14px;color:#5E6862;line-height:1.5")}>An address like <b>yourbrand.com.ng</b> makes your business look established. Tell us what you want and we&apos;ll handle the technical part for you.</span>
        </div>
        <DomainForm saved={saved} />
        {saved && <span style={css("font-size:13px;color:#5E6862;line-height:1.5")}>We&apos;ve noted <b>{saved}</b>. Automatic domain setup isn&apos;t open yet. When it is, we&apos;ll check it&apos;s available, show you the exact price, and only buy it after you say yes.</span>}
      </div>

      <div style={css(card)}>
        <span style={css("font-size:15px;font-weight:600")}>How it will work</span>
        {[
          ["You choose", "Tell us the name you want."],
          ["We check", "We look for it, and show you the price and renewal cost up front."],
          ["You approve", "Nothing is bought until you say yes to that exact price."],
          ["We set it up", "We connect it to your store. You don't touch any settings."],
        ].map(([t, d], k) => (
          <div key={t} style={css("display:flex;gap:14px;align-items:flex-start")}>
            <span style={css("width:24px;height:24px;border-radius:50%;background:#EEF6F0;color:#185C3B;display:grid;place-items:center;font-size:12px;font-weight:600;flex-shrink:0")}>{k + 1}</span>
            <span style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("font-size:14px;font-weight:500")}>{t}</span><span style={css("font-size:13px;color:#78817B;line-height:1.45")}>{d}</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}
