import Link from "next/link";
import { count, eq } from "drizzle-orm";
import { db } from "@/db";
import { products } from "@/db/schema";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { boxes } from "@/lib/data";
import { css } from "@/lib/css";
import { requireSession } from "@/lib/session";
import { getBusinessForUser } from "@/server/business";

export const metadata = { title: "Overview · Launchmate" };

const card = "background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:20px;display:flex;flex-direction:column;gap:12px";

type Step = { title: string; note: string; state: "done" | "available" | "soon"; href?: string };

export default async function Page() {
  const { user } = await requireSession();
  const business = (await getBusinessForUser(user.id))!; // the dashboard layout guarantees one
  const [{ n: productCount }] = await db.select({ n: count() }).from(products).where(eq(products.businessId, business.id));

  const first = user.name.trim().split(/\s+/)[0];
  const base = process.env.STOREFRONT_BASE_DOMAIN;
  const told = Object.entries(business.profile.blueprint ?? {}).filter(([, v]) => v);
  const scene = boxes(1, null);

  const steps: Step[] = [
    { title: "Business profile saved", note: "Your answers are stored and editable.", state: "done" },
    { title: productCount > 0 ? `Add more products (${productCount} so far)` : "Add your products", note: "Add what you sell, with photos, prices and stock.", state: productCount > 0 ? "done" : "available", href: "/products" },
    { title: "Connect payments", note: "Take real payments through Paystack. Coming soon.", state: "soon" },
    { title: "Set up your domain", note: "Your agent signs in to your registrar through Agent Vault, without seeing your password. Early access.", state: "available", href: "/agent-vault" },
    { title: "Launch your store", note: "Publish when you are ready. Not available yet.", state: "soon" },
  ];
  const chip = { done: ["Done", "#E9F4EE", "#1F6B43"], available: ["Ready", "#EAF2F8", "#2F6A92"], soon: ["Not yet", "#F3F5F2", "#78817B"] } as const;

  return (
    <div style={css("padding:28px;display:flex;flex-direction:column;gap:16px;max-width:1100px;width:100%;animation:lmIn .35s ease-out")}>
      <div style={css("display:flex;flex-direction:column;gap:4px")}>
        <h1 style={css("margin:0;font-size:26px;letter-spacing:-.02em;font-weight:600")}>Welcome, {first}</h1>
        <span style={css("font-size:14px;color:#78817B")}>Here is where {business.name} stands.</span>
      </div>

      <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:12px;align-items:start")}>
        <div style={css(card)}>
          <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}>
            <span style={css("font-size:17px;font-weight:600")}>{business.name}</span>
            <span style={css("font-size:12px;padding:3px 9px;border-radius:999px;background:#FBF3E6;color:#8A5E1C;font-weight:500;text-transform:capitalize")}>{business.status}</span>
          </div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(130px,1fr));gap:12px;font-size:13px")}>
            <div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("color:#78817B")}>Category</span><span>{business.category || "Not set"}</span></div>
            <div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("color:#78817B")}>Country · currency</span><span>{business.country} · {business.currency}</span></div>
            <div style={css("display:flex;flex-direction:column;gap:2px")}><span style={css("color:#78817B")}>Products</span><span style={css("font-family:var(--font-mono)")}>{productCount}</span></div>
          </div>
          <div style={css("font-size:13px;color:#5E6862;line-height:1.5;padding-top:10px;border-top:1px solid #F0F2F0")}>
            Store address reserved: <span style={css("font-family:var(--font-mono);color:#202723")}>{base ? `${business.slug}.${base}` : business.slug}</span>
            <br />Your store is not live yet.
          </div>
        </div>

        <div aria-hidden style={css("position:relative;aspect-ratio:1/0.82;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;overflow:hidden;container-type:size")}>
          <IsoScene size={62} offset={8} transform="rotateX(58deg) rotateZ(45deg)" sway={14}>
            <IsoBoxes boxes={scene} variant="flat" />
          </IsoScene>
          <span style={css("position:absolute;left:12px;top:10px;font-size:12px;color:#5E6862;background:#FFFFFF;padding:3px 10px;border-radius:999px;border:1px solid #E8ECE8")}>Your plot · Idea</span>
        </div>
      </div>

      <div style={css(card)}>
        <span style={css("font-size:15px;font-weight:600")}>Next steps</span>
        {steps.map((s) => {
          const [label, bg, fg] = chip[s.state];
          const body = (
            <>
              <span style={{ width: 20, height: 20, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center", fontSize: 11, color: "#FFFFFF", background: s.state === "done" ? "#26734D" : "#FFFFFF", border: `1.5px solid ${s.state === "done" ? "#26734D" : "#D5DBD6"}` }}>{s.state === "done" ? "✓" : ""}</span>
              <span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}>
                <span style={css("font-size:15px;color:#202723")}>{s.title}</span>
                <span style={css("font-size:13px;color:#78817B;line-height:1.45")}>{s.note}</span>
              </span>
              <span style={{ fontSize: 12, padding: "3px 9px", borderRadius: 999, background: bg, color: fg, whiteSpace: "nowrap" }}>{label}</span>
            </>
          );
          const row = css("display:flex;align-items:center;gap:14px;padding:12px 0;border-top:1px solid #F0F2F0");
          return s.href ? <Link key={s.title} href={s.href} style={row}>{body}</Link> : <div key={s.title} style={row}>{body}</div>;
        })}
      </div>

      {told.length > 0 && (
        <div style={css(card)}>
          <span style={css("font-size:15px;font-weight:600")}>What you told us</span>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:12px")}>
            {told.map(([k, v]) => (
              <div key={k} style={css("display:flex;flex-direction:column;gap:3px;padding:12px 14px;border-radius:12px;background:#F8FAF8")}>
                <span style={css("font-size:12px;color:#78817B")}>{k}</span>
                <span style={css("font-size:14px;line-height:1.4")}>{v}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
