"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { boxes } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { LogoMark } from "@/components/Logo";

const STAGES: [string, string][] = [
  ["Idea", "Your description becomes a structured business plan."],
  ["Identity", "Name, colours and brand mark take shape."],
  ["Storefront", "A fast storefront forms from a tested template."],
  ["Products", "Listings, prices and images fill the shelves."],
  ["Infrastructure", "Payments, records and your domain connect."],
  ["Launch", "Your business is live and taking orders."],
];

const STEPS: [string, string, string][] = [
  ["01", "Describe your idea", "Tell Launchmate what you want to sell and who you want to serve."],
  ["02", "Watch your business take shape", "Your agent builds your storefront, products and business basics, and asks before anything important."],
  ["03", "Launch and grow", "Approve key actions, launch your store and let Launchmate help you run it."],
];

type Status = "Available" | "In progress";
const CAPS: [string, string, Status][] = [
  ["Agent actions with limits", "Your agent signs in to your accounts through Agent Vault without ever seeing a password, and pays for services within a spending limit you set.", "Available"],
  ["AI business creation", "Turn a plain description into a structured business plan you can edit.", "In progress"],
  ["Storefront generation", "A fast, mobile-first store from tested templates, never unreviewed code.", "In progress"],
  ["Product management", "Listings, prices, variants and stock, written with you from your own products and photos.", "In progress"],
  ["Payments and orders", "An order counts as paid only when the payment provider confirms it.", "In progress"],
  ["Financial visibility", "Revenue, expenses and net position by currency, in plain language.", "In progress"],
];

const TRUST: [string, string][] = [
  ["You control your business", "Edit or undo anything the agent creates."],
  ["Purchases need approval", "Each approval covers one exact amount and expires."],
  ["Permissions are limited", "Spending caps and allowed services you can revoke anytime."],
  ["Passwords stay hidden", "Agent Vault types them into the site; the agent only sees placeholders."],
  ["Activity is visible", "See what the agent did, when and why."],
];

const wrap = "max-width:1240px;margin:0 auto;padding-left:clamp(16px,2.2vw,28px);padding-right:clamp(16px,2.2vw,28px)";
const eyebrow = "font-size:13px;font-weight:500;color:#26734D";
const h2 = "margin:0;font-size:clamp(30px,3.1vw,44px);line-height:1.08;letter-spacing:-.03em;font-weight:600;text-wrap:balance";

export default function Landing() {
  const hero = useRef<HTMLElement>(null);
  const [stage, setStage] = useState(1);
  const [rot, setRot] = useState(0);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const scene = useMemo(() => boxes(stage, null), [stage]);

  // The hero is a tall section with a sticky scene: scroll progress through it = build stage.
  useEffect(() => {
    const on = () => {
      const el = hero.current;
      if (!el) return;
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      const p = Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range));
      setStage(1 + Math.min(5, Math.floor(p * 6)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, []);

  const down = (e: PointerEvent) => { drag.current = { x: e.clientX, r: rot }; };
  const move = (e: PointerEvent) => { if (drag.current) setRot(Math.max(-28, Math.min(28, drag.current.r + (e.clientX - drag.current.x) * 0.25))); };
  const up = () => { drag.current = null; };

  const cta = (extra = "") => css(`background:#26734D;color:#FFFFFF;font-weight:500;border-radius:12px;${extra}`);

  return (
    <div style={css("background:#FFFFFF;color:#202723")}>
      <header style={css("position:sticky;top:0;z-index:20;height:64px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border-bottom:1px solid #E8ECE8")}>
        <div style={{ ...css(wrap), height: "100%", display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/" style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;letter-spacing:-.01em;color:#202723;flex-shrink:0")}><LogoMark size={26} />Launchmate</Link>
          <nav style={css("flex:1;min-width:0;display:flex;gap:24px;font-size:14px;align-items:center")}>
            <a href="#how" style={css("color:#4C5550")}>How it works</a>
            <a href="#features" style={css("color:#4C5550")}>Features</a>
            <span style={css("flex:1")} />
            <Link href="/signin" style={css("color:#202723")}>Sign in</Link>
          </nav>
          <Link href="/signup" className="hv-green" style={{ ...cta("font-size:14px;padding:10px 16px;flex-shrink:0;white-space:nowrap") }}>Start your business</Link>
        </div>
      </header>

      <section ref={hero} style={css("height:300vh;position:relative")}>
        <div style={{ ...css(wrap), position: "sticky", top: 64, height: "max(520px, calc(100vh - 64px))", display: "flex", flexWrap: "wrap", alignContent: "stretch", gap: "clamp(16px,2.5vw,32px)", paddingTop: "clamp(16px,2.2vw,28px)", paddingBottom: "clamp(16px,2.2vw,28px)" }}>
          <div style={css("flex:1 1 380px;max-width:560px;display:flex;flex-direction:column;justify-content:center;gap:clamp(14px,1.8vw,24px)")}>
            <div style={css("display:inline-flex;align-self:flex-start;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:#EEF6F0;color:#185C3B;font-size:13px;font-weight:500")}>
              <span style={css("width:6px;height:6px;border-radius:50%;background:#26734D")} />Early access · built for Nigeria
            </div>
            <h1 style={css("margin:0;font-size:clamp(34px,4.3vw,62px);line-height:1.02;letter-spacing:-.035em;font-weight:600;text-wrap:balance")}>You bring the idea. We build the business.</h1>
            <p style={css("margin:0;font-size:clamp(15px,1.3vw,18px);line-height:1.55;color:#5E6862;text-wrap:pretty")}>From your first product to your live storefront, Launchmate&apos;s AI business agent helps you build your online business and run it.</p>
            <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
              <Link href="/signup" className="hv-green" style={cta("font-size:15px;padding:13px 20px")}>Start your business</Link>
              <a href="#how" className="hv-grey" style={css("background:#FFFFFF;color:#202723;border:1px solid #E8ECE8;font-size:15px;font-weight:500;padding:13px 20px;border-radius:12px")}>See how it works</a>
            </div>
          </div>

          <div style={css("flex:1.3 1 380px;min-height:300px;position:relative;border-radius:24px;background:#F8FAF8;border:1px solid #E8ECE8;overflow:hidden")}>
            <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} aria-hidden style={css("position:absolute;inset:0;container-type:size;cursor:grab;touch-action:pan-y")}>
              <IsoScene size={60} offset={6} transform={`rotateX(58deg) rotateZ(${45 + rot}deg)`} transition="transform .5s cubic-bezier(.2,.8,.2,1)" sway={14}>
                <IsoBoxes boxes={scene} variant="build" />
              </IsoScene>
            </div>
            <div style={css("position:absolute;left:16px;top:16px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:12px;padding:10px 14px;display:flex;flex-direction:column;gap:2px;box-shadow:0 4px 16px rgba(32,39,35,.05);max-width:280px;pointer-events:none")}>
              <span style={css("font-family:var(--font-mono);font-size:11px;color:#26734D")}>STAGE 0{stage} / 06</span>
              <span style={css("font-size:14px;font-weight:600")}>{STAGES[stage - 1][0]}</span>
              <span style={css("font-size:12px;color:#78817B;line-height:1.4")}>{STAGES[stage - 1][1]}</span>
            </div>
            <div style={css("position:absolute;left:16px;right:16px;bottom:16px;display:flex;flex-direction:column;gap:8px;pointer-events:none")}>
              <div style={css("display:grid;grid-template-columns:repeat(6,1fr);gap:4px")}>
                {STAGES.map((_, i) => <span key={i} style={{ height: 3, borderRadius: 2, background: i < stage ? "#26734D" : "#DCE2DD", transition: "background .3s" }} />)}
              </div>
              <span style={css("font-size:12px;color:#78817B")}>{stage >= 6 ? "Drag to rotate" : "Scroll to watch it build · an illustration of the journey"}</span>
            </div>
          </div>
        </div>
      </section>

      <section id="how" style={css("background:#F8FAF8;border-top:1px solid #E8ECE8;border-bottom:1px solid #E8ECE8;scroll-margin-top:64px")}>
        <div style={{ ...css(wrap), paddingTop: "clamp(56px,7vw,96px)", paddingBottom: "clamp(56px,7vw,96px)", display: "flex", flexDirection: "column", gap: "clamp(28px,3.5vw,48px)" }}>
          <div style={css("display:flex;flex-direction:column;gap:12px;max-width:640px")}>
            <span style={css(eyebrow)}>How it works</span>
            <h2 style={css(h2)}>From a sentence to a storefront in three steps.</h2>
          </div>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px")}>
            {STEPS.map(([n, t, d]) => (
              <div key={n} style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:22px;display:flex;flex-direction:column;gap:10px")}>
                <span style={css("font-family:var(--font-mono);font-size:14px;color:#26734D")}>{n}</span>
                <span style={css("font-size:18px;font-weight:600;letter-spacing:-.01em")}>{t}</span>
                <span style={css("font-size:15px;line-height:1.5;color:#5E6862")}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section id="features" style={{ ...css(wrap), paddingTop: "clamp(56px,7vw,96px)", paddingBottom: "clamp(56px,7vw,96px)", display: "flex", flexDirection: "column", gap: "clamp(28px,3vw,40px)", scrollMarginTop: 64 }}>
        <div style={css("display:flex;flex-direction:column;gap:12px;max-width:640px")}>
          <span style={css(eyebrow)}>Capabilities</span>
          <h2 style={css(h2)}>Everything a new business needs, run by one agent.</h2>
          <span style={css("font-size:15px;color:#5E6862;line-height:1.5")}>Launchmate is in early access. Here is what works today and what we&apos;re building.</span>
        </div>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:1px;background:#E8ECE8;border:1px solid #E8ECE8;border-radius:18px;overflow:hidden")}>
          {CAPS.map(([t, d, s], i) => (
            <div key={t} style={css("background:#FFFFFF;padding:clamp(20px,2.2vw,28px);display:flex;flex-direction:column;gap:10px")}>
              <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}>
                <span style={css("font-family:var(--font-mono);font-size:12px;color:#26734D")}>0{i + 1}</span>
                <span style={{ ...css("font-size:11px;padding:3px 8px;border-radius:999px;font-weight:500"), background: s === "Available" ? "#E9F4EE" : "#F3F5F2", color: s === "Available" ? "#1F6B43" : "#78817B" }}>{s}</span>
              </div>
              <span style={css("font-size:18px;font-weight:600;letter-spacing:-.01em")}>{t}</span>
              <span style={css("font-size:15px;line-height:1.5;color:#5E6862")}>{d}</span>
            </div>
          ))}
        </div>
      </section>

      <section style={css("background:#F8FAF8;border-top:1px solid #E8ECE8;border-bottom:1px solid #E8ECE8")}>
        <div style={{ ...css(wrap), paddingTop: "clamp(56px,7vw,96px)", paddingBottom: "clamp(56px,7vw,96px)", display: "flex", flexDirection: "column", gap: 28, maxWidth: 900 }}>
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            <span style={css(eyebrow)}>Trust</span>
            <h2 style={css(h2)}>Your agent works for you. You stay in charge.</h2>
          </div>
          <div style={css("display:flex;flex-direction:column;border-top:1px solid #E8ECE8")}>
            {TRUST.map(([t, d]) => (
              <div key={t} style={css("display:flex;flex-wrap:wrap;gap:4px 16px;padding:16px 0;border-bottom:1px solid #E8ECE8;font-size:15px")}>
                <span style={css("font-weight:500;flex:0 0 220px")}>{t}</span>
                <span style={css("color:#5E6862;line-height:1.5;flex:1 1 220px")}>{d}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ ...css(wrap), paddingTop: "clamp(72px,8vw,112px)", paddingBottom: "clamp(72px,8vw,112px)", display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center" }}>
        <h2 style={css("margin:0;font-size:clamp(34px,3.7vw,52px);line-height:1.05;letter-spacing:-.035em;font-weight:600;text-wrap:balance;max-width:760px")}>Your idea deserves a real business.</h2>
        <p style={css("margin:0;font-size:18px;color:#5E6862")}>Start building with Launchmate.</p>
        <Link href="/signup" className="hv-green" style={cta("font-size:15px;padding:14px 24px")}>Start your business</Link>
      </section>

      <footer style={css("border-top:1px solid #E8ECE8")}>
        <div style={{ ...css(wrap), paddingTop: 24, paddingBottom: 24, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#78817B", gap: 12, flexWrap: "wrap" }}>
          <span>© 2026 Launchmate</span>
          <span>Built for first-time founders · Lagos and beyond</span>
        </div>
      </footer>
    </div>
  );
}
