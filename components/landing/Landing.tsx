"use client";

import { useEffect, useMemo, useRef, useState, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import Link from "next/link";
import { css } from "@/lib/css";
import { boxes } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { LogoMark } from "@/components/Logo";

/* ───────────── content ───────────── */

const HERO_STAGES: [string, string][] = [
  ["Idea", "You tell us what you sell."],
  ["Name", "Your store gets its name and its look."],
  ["Store", "Your storefront is set up for you."],
  ["Products", "Your products and prices go on the shelves."],
  ["Setup", "The technical parts, like your address and payments, are handled."],
  ["Open", "You're open for business."],
];

const PAINS: [string, string, string][] = [
  ["Too many tools", "A website builder, a payment account, a spreadsheet, a chat with every customer. Each one is another login and another thing to learn.", "01"],
  ["The technical wall", "Domains, hosting, checkout, product pages. You can lose weeks before you sell anything, or pay someone to do it for you.", "02"],
  ["Mistakes cost real naira", "One wrong click on a payment or a domain costs real money. You want help that stops and asks you first.", "03"],
];

const STEPS: [string, string, string][] = [
  ["Tell us what you sell", "Say it in your own words. No forms full of jargon, and no technical decisions.", "01"],
  ["We set it up for you", "Launchmate prepares your store, your address and your product listings. You look it over and change anything you like.", "02"],
  ["You approve, then sell", "Anything that costs money waits for your yes, with the exact amount shown. Then you're open.", "03"],
];

type Status = "Available" | "In progress";
const CAPS: [string, string, Status][] = [
  ["Set up for you", "Answer a few questions and your business profile is created. Change anything, any time.", "Available"],
  ["Your products, your photos", "Add what you sell with prices, stock and photos. Every stock change is recorded, so you never lose count.", "Available"],
  ["Keeps an eye on things", "Spots low stock, missing prices and missing photos, and tells you what needs your attention.", "Available"],
  ["Your own address", "A free Launchmate address for your store, and your own domain if you want one. We handle the setup.", "In progress"],
  ["A store that sells", "A fast, mobile-first storefront built from tested templates, ready to share with one link.", "In progress"],
  ["Payments that go to you", "Customers pay into your own account. An order counts as paid only when the payment provider confirms it.", "In progress"],
];

const WATCH: [string, string][] = [
  ["Running low", "Zip-front dress has 2 left"],
  ["No price yet", "3 products can't be bought"],
  ["Needs a photo", "Ankara skirt has no picture"],
];

const DESIGNED: [string, string, string][] = [
  ["Naira first", "Your business is set up in naira, and amounts in different currencies are never mixed.", "Built in"],
  ["Made for a phone", "Most sellers here run everything from a phone, so every screen is designed for one.", "Built in"],
  ["Setup done for you", "You never configure a server, a DNS record or a payment gateway. That's our job.", "Built in"],
  ["Your own payment account", "Customers pay into your account. Launchmate does not hold your money.", "In progress"],
];

const ROADMAP: [string, string[]][] = [
  ["Today", ["Create your account", "Set up your business in a few questions", "Add products with photos, prices and stock", "See what needs your attention"]],
  ["Next", ["Your own address and domain", "Your storefront, live with one link", "Payments and orders"]],
  ["Later", ["Customers and finances in one place", "Alerts by email or WhatsApp", "More countries and currencies"]],
];

const FAQ: [string, string][] = [
  ["Is Launchmate free?", "Yes. There is no subscription and no fee to create your business. The only paid extra is an optional custom domain, and you see its price before you approve anything."],
  ["Do I need technical skills?", "No. You tell us what you sell and we handle the technical setup. If something needs a decision, we ask you in plain words."],
  ["Can Launchmate spend my money without asking?", "No. Anything that costs money waits for your yes, and each yes covers one exact amount. You also set a spending limit that can't be raised without you."],
  ["Is my password safe?", "Yes. When Launchmate needs to sign in somewhere for you, it uses a secure vault. Launchmate itself never sees your password, and the website gets it directly from the vault."],
  ["Who holds my customers' payments?", "You do. Payments are designed to go into your own payment account. Launchmate is not a bank and does not hold your balance."],
  ["How is this different from other store builders?", "Launchmate is built for sellers in Nigeria and does the technical setup for you, instead of handing you a toolbox. It is early, so it does less today than mature platforms. The Features and Where we are sections say exactly what works."],
  ["Where can I use it?", "Launchmate is built for Nigeria first. It is in early access, so some parts are available today and others are still being built."],
];

/* ───────────── helpers ───────────── */

const wrap = "max-width:1240px;margin:0 auto;padding-left:clamp(16px,2.2vw,28px);padding-right:clamp(16px,2.2vw,28px)";
const eyebrow = "font-size:13px;font-weight:500;color:#26734D";
const h2 = "margin:0;font-size:clamp(30px,3.1vw,44px);line-height:1.08;letter-spacing:-.03em;font-weight:600;text-wrap:balance";
const lead = "margin:0;font-size:clamp(15px,1.3vw,18px);line-height:1.55;color:#5E6862;text-wrap:pretty";

/** Fades and lifts into place once, the first time it scrolls into view. */
function Reveal({ children, delay = 0, style }: { children: ReactNode; delay?: number; style?: CSSProperties }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { el.classList.add("in"); io.disconnect(); } }, { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return <div ref={ref} className="reveal" style={{ transitionDelay: `${delay}ms`, ...style }}>{children}</div>;
}

/** 0..1 progress through a tall section whose content is sticky. */
function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const on = () => {
      const el = ref.current;
      if (!el) return;
      const range = Math.max(1, el.offsetHeight - window.innerHeight);
      setP(Math.min(1, Math.max(0, -el.getBoundingClientRect().top / range)));
    };
    on();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); };
  }, [ref]);
  return p;
}

const Tag = ({ children }: { children: ReactNode }) => (
  <span style={css("font-size:11px;padding:3px 8px;border-radius:999px;background:#F3F5F2;color:#78817B;font-weight:500")}>{children}</span>
);

/* ───────────── page ───────────── */

export default function Landing() {
  const hero = useRef<HTMLElement>(null);
  const how = useRef<HTMLElement>(null);
  const heroP = useSectionProgress(hero);
  const howP = useSectionProgress(how);
  const heroStage = 1 + Math.min(5, Math.floor(heroP * 6));
  const step = Math.min(2, Math.floor(howP * 3));
  const [rot, setRot] = useState(0);
  const drag = useRef<{ x: number; r: number } | null>(null);
  const heroScene = useMemo(() => boxes(heroStage, null), [heroStage]);
  const howScene = useMemo(() => boxes([2, 4, 6][step], null), [step]);
  const endScene = useMemo(() => boxes(6, null).map((b) => ({ ...b, op: 1 })), []);

  const down = (e: PointerEvent) => { drag.current = { x: e.clientX, r: rot }; };
  const move = (e: PointerEvent) => { if (drag.current) setRot(Math.max(-28, Math.min(28, drag.current.r + (e.clientX - drag.current.x) * 0.25))); };
  const up = () => { drag.current = null; };

  const cta = (extra = "") => css(`background:#26734D;color:#FFFFFF;font-weight:500;border-radius:12px;${extra}`);
  const section = (extra = "") => ({ ...css(wrap), paddingTop: "clamp(64px,8vw,112px)", paddingBottom: "clamp(64px,8vw,112px)", ...css(extra) });

  return (
    <div style={css("background:#FFFFFF;color:#202723")}>
      <header style={css("position:sticky;top:0;z-index:20;height:64px;background:rgba(255,255,255,.94);backdrop-filter:blur(8px);border-bottom:1px solid #E8ECE8")}>
        <div style={{ ...css(wrap), height: "100%", display: "flex", alignItems: "center", gap: 28 }}>
          <Link href="/" style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;letter-spacing:-.01em;color:#202723;flex-shrink:0")}><LogoMark size={26} />Launchmate</Link>
          <nav style={css("flex:1;min-width:0;display:flex;gap:24px;font-size:14px;align-items:center;overflow:hidden;white-space:nowrap")}>
            <a href="#why" className="hide-sm" style={css("color:#4C5550")}>Why</a>
            <a href="#how" className="hide-sm" style={css("color:#4C5550")}>How it works</a>
            <a href="#features" className="hide-sm" style={css("color:#4C5550")}>Features</a>
            <a href="#faq" className="hide-sm" style={css("color:#4C5550")}>FAQ</a>
            <span style={css("flex:1")} />
            <Link href="/signin" style={css("color:#202723")}>Sign in</Link>
          </nav>
          <Link href="/signup" className="hv-green" style={cta("font-size:14px;padding:10px 16px;flex-shrink:0;white-space:nowrap")}>Start your store</Link>
        </div>
      </header>

      {/* ── hero: scroll to watch a business get built ── */}
      <section ref={hero} style={css("height:300vh;position:relative")}>
        <div style={{ ...css(wrap), position: "sticky", top: 64, height: "max(520px, calc(100vh - 64px))", display: "flex", flexWrap: "wrap", alignContent: "stretch", gap: "clamp(16px,2.5vw,32px)", paddingTop: "clamp(16px,2.2vw,28px)", paddingBottom: "clamp(16px,2.2vw,28px)" }}>
          <div style={css("flex:1 1 380px;max-width:560px;display:flex;flex-direction:column;justify-content:center;gap:clamp(14px,1.8vw,24px)")}>
            <div style={css("display:inline-flex;align-self:flex-start;align-items:center;gap:8px;padding:6px 12px;border-radius:999px;background:#EEF6F0;color:#185C3B;font-size:13px;font-weight:500")}>
              <span style={css("width:6px;height:6px;border-radius:50%;background:#26734D")} />Early access · built for Nigeria
            </div>
            <h1 style={css("margin:0;font-size:clamp(34px,4.3vw,62px);line-height:1.02;letter-spacing:-.035em;font-weight:600;text-wrap:balance")}>Start selling online. We handle the technical part.</h1>
            <p style={css(lead)}>Launchmate sets up your store, your address and your products, then keeps an eye on things for you. No tech skills needed, and nothing important happens without your say-so.</p>
            <div style={css("display:flex;gap:10px;flex-wrap:wrap")}>
              <Link href="/signup" className="hv-green" style={cta("font-size:15px;padding:13px 20px")}>Start your store</Link>
              <a href="#how" className="hv-grey" style={css("background:#FFFFFF;color:#202723;border:1px solid #E8ECE8;font-size:15px;font-weight:500;padding:13px 20px;border-radius:12px")}>See how it works</a>
            </div>
          </div>

          <div style={css("flex:1.3 1 380px;min-height:300px;position:relative;border-radius:24px;background:#F8FAF8;border:1px solid #E8ECE8;overflow:hidden")}>
            <div onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerLeave={up} aria-hidden style={css("position:absolute;inset:0;container-type:size;cursor:grab;touch-action:pan-y")}>
              <IsoScene size={60} offset={6} transform={`rotateX(58deg) rotateZ(${45 + rot}deg)`} transition="transform .5s cubic-bezier(.2,.8,.2,1)" sway={14}>
                <IsoBoxes boxes={heroScene} variant="build" />
              </IsoScene>
            </div>
            <div style={css("position:absolute;left:16px;top:16px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:12px;padding:10px 14px;display:flex;flex-direction:column;gap:2px;box-shadow:0 4px 16px rgba(32,39,35,.05);max-width:280px;pointer-events:none")}>
              <span style={css("font-family:var(--font-mono);font-size:11px;color:#26734D")}>STAGE 0{heroStage} / 06</span>
              <span style={css("font-size:14px;font-weight:600")}>{HERO_STAGES[heroStage - 1][0]}</span>
              <span style={css("font-size:12px;color:#78817B;line-height:1.4")}>{HERO_STAGES[heroStage - 1][1]}</span>
            </div>
            <div style={css("position:absolute;left:16px;right:16px;bottom:16px;display:flex;flex-direction:column;gap:8px;pointer-events:none")}>
              <div style={css("display:grid;grid-template-columns:repeat(6,1fr);gap:4px")}>
                {HERO_STAGES.map((_, n) => <span key={n} style={{ height: 3, borderRadius: 2, background: n < heroStage ? "#26734D" : "#DCE2DD", transition: "background .3s" }} />)}
              </div>
              <span style={css("font-size:12px;color:#78817B")}>{heroStage >= 6 ? "Drag to rotate · an illustration of the journey" : "Scroll to watch it build · an illustration of the journey"}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── why ── */}
      <section id="why" style={{ ...section(), scrollMarginTop: 64 }}>
        <Reveal style={css("display:flex;flex-direction:column;gap:14px;max-width:700px;margin-bottom:clamp(28px,3.5vw,48px)")}>
          <span style={css(eyebrow)}>Why Launchmate</span>
          <h2 style={css(h2)}>Selling online shouldn&apos;t need a tech team.</h2>
          <p style={css(lead)}>Most sellers don&apos;t fail for lack of ideas. They stall on the setup. Launchmate takes that weight off you.</p>
        </Reveal>
        <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:16px")}>
          {PAINS.map(([t, d, n], k) => (
            <Reveal key={n} delay={k * 120}>
              <div style={css("height:100%;background:#F8FAF8;border:1px solid #E8ECE8;border-radius:20px;padding:clamp(22px,2.4vw,30px);display:flex;flex-direction:column;gap:14px")}>
                <span style={css("font-family:var(--font-mono);font-size:30px;color:#CFE3D6;letter-spacing:-.02em")}>{n}</span>
                <span style={css("font-size:20px;font-weight:600;letter-spacing:-.015em;line-height:1.2")}>{t}</span>
                <span style={css("font-size:15px;line-height:1.55;color:#5E6862")}>{d}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── how it works: a sticky 3D scene that follows the steps ── */}
      <section id="how" ref={how} style={css("height:300vh;position:relative;background:#F8FAF8;border-top:1px solid #E8ECE8;border-bottom:1px solid #E8ECE8;scroll-margin-top:64px")}>
        <div style={{ ...css(wrap), position: "sticky", top: 64, height: "max(560px, calc(100vh - 64px))", display: "flex", flexWrap: "wrap", alignContent: "center", gap: "clamp(20px,3vw,48px)", paddingTop: 24, paddingBottom: 24 }}>
          <div style={css("flex:1 1 360px;max-width:520px;display:flex;flex-direction:column;gap:clamp(18px,2.4vw,30px);justify-content:center")}>
            <div style={css("display:flex;flex-direction:column;gap:12px")}>
              <span style={css(eyebrow)}>How it works</span>
              <h2 style={css(h2)}>From a sentence to a storefront, in three steps.</h2>
            </div>
            <div style={css("display:flex;flex-direction:column;gap:10px")}>
              {STEPS.map(([t, d, n], k) => (
                <div key={n} style={{ ...css("display:flex;gap:16px;padding:16px 18px;border-radius:16px;border-style:solid;border-width:1px;transition:background .3s,border-color .3s,opacity .3s"), background: step === k ? "#FFFFFF" : "transparent", borderColor: step === k ? "#E8ECE8" : "transparent", opacity: step === k ? 1 : 0.55 }}>
                  <span style={{ ...css("font-family:var(--font-mono);font-size:14px;padding-top:2px"), color: step === k ? "#26734D" : "#A3ABA5" }}>{n}</span>
                  <span style={css("display:flex;flex-direction:column;gap:5px")}>
                    <span style={css("font-size:18px;font-weight:600;letter-spacing:-.01em")}>{t}</span>
                    <span style={css("font-size:15px;line-height:1.5;color:#5E6862")}>{d}</span>
                  </span>
                </div>
              ))}
            </div>
          </div>

          <div style={css("flex:1.2 1 360px;min-height:380px;position:relative;border-radius:24px;background:#FFFFFF;border:1px solid #E8ECE8;overflow:hidden")}>
            <div aria-hidden style={css("position:absolute;inset:0;container-type:size")}>
              <IsoScene size={56} offset={-6} transform={`rotateX(58deg) rotateZ(${45 + howP * 40}deg)`} transition="transform .4s ease-out" sway={16}>
                <IsoBoxes boxes={howScene} variant="build" />
              </IsoScene>
            </div>
            <div style={css("position:absolute;left:16px;right:16px;bottom:16px")}>
              <div key={step} style={css("background:#FFFFFF;border:1px solid #E8ECE8;border-radius:16px;padding:16px 18px;box-shadow:0 10px 30px rgba(32,39,35,.07);display:flex;flex-direction:column;gap:10px;animation:lmIn .4s ease-out")}>
                <div style={css("display:flex;justify-content:space-between;align-items:center")}>
                  <span style={css("font-size:12px;color:#78817B")}>{["Step 1 · You tell us", "Step 2 · We set it up", "Step 3 · You approve"][step]}</span>
                  <Tag>Illustration</Tag>
                </div>
                {step === 0 && (
                  <>
                    <div style={css("border:1px solid #E8ECE8;border-radius:12px;padding:12px 14px;font-size:15px;line-height:1.5")}>I sell ready-to-wear outfits for women, mostly through Instagram.<span style={css("display:inline-block;width:2px;height:16px;background:#26734D;vertical-align:-3px;margin-left:2px;animation:lmPulse 1s infinite")} /></div>
                    <div style={css("display:flex;gap:6px;flex-wrap:wrap")}>
                      {["Fashion & apparel", "Sells on Instagram", "Physical products"].map((c) => <span key={c} style={css("font-size:12px;padding:4px 9px;border-radius:999px;background:#EEF6F0;color:#185C3B")}>{c}</span>)}
                    </div>
                  </>
                )}
                {step === 1 && (
                  <div style={css("display:flex;flex-direction:column;gap:7px")}>
                    {["Your store profile", "Your store address", "Your storefront", "Your product listings"].map((t, k) => (
                      <div key={t} style={css("display:flex;align-items:center;gap:10px;font-size:14px")}>
                        <span style={{ width: 16, height: 16, borderRadius: "50%", display: "grid", placeItems: "center", fontSize: 10, color: "#FFFFFF", background: k < 3 ? "#26734D" : "#FFFFFF", border: `1.5px solid ${k < 3 ? "#26734D" : "#D5DBD6"}` }}>{k < 3 ? "✓" : ""}</span>
                        <span style={{ color: k < 3 ? "#202723" : "#78817B" }}>{t}</span>
                      </div>
                    ))}
                  </div>
                )}
                {step === 2 && (
                  <>
                    <div style={css("display:flex;justify-content:space-between;align-items:center;font-size:15px;font-weight:600")}><span>Register yourbrand.com.ng</span><span style={css("font-size:11px;padding:3px 8px;border-radius:999px;background:#FBF3E6;color:#8A5E1C;font-weight:500")}>Needs your approval</span></div>
                    <div style={css("display:grid;grid-template-columns:1fr 1fr;gap:8px;font-size:13px;color:#5E6862")}>
                      <span>Price shown before you approve</span><span>Valid for this request only</span>
                      <span>Card details shared: none</span><span>You can reject</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── keeps an eye on things ── */}
      <section id="watch" style={{ ...section("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:clamp(28px,4vw,64px);align-items:center"), scrollMarginTop: 64 }}>
        <Reveal style={css("display:flex;flex-direction:column;gap:14px")}>
          <span style={css(eyebrow)}>Peace of mind</span>
          <h2 style={css(h2)}>Launchmate keeps an eye on things, so you don&apos;t have to.</h2>
          <p style={css(lead)}>Stock running low. A product with no price. A picture missing. You see what needs you in one place, in plain words, instead of finding out from a customer.</p>
        </Reveal>
        <Reveal delay={150}>
          <div style={css("background:#F8FAF8;border:1px solid #E8ECE8;border-radius:20px;padding:clamp(18px,2vw,24px);display:flex;flex-direction:column;gap:12px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center")}><span style={css("font-size:13px;font-weight:600")}>Needs your attention</span><Tag>Example</Tag></div>
            {WATCH.map(([t, d]) => (
              <div key={t} style={css("display:flex;gap:12px;align-items:center;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:14px;padding:12px 14px")}>
                <span style={css("width:8px;height:8px;border-radius:50%;background:#C58B34;flex-shrink:0")} />
                <span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}><span style={css("font-size:14px;font-weight:500")}>{t}</span><span style={css("font-size:12px;color:#78817B")}>{d}</span></span>
                <span style={css("font-size:12px;padding:6px 10px;border-radius:9px;border:1px solid #E8ECE8;color:#4C5550")}>Fix</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── trust: the agent with limits ── */}
      <section id="trust" style={{ ...section("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:clamp(28px,4vw,64px);align-items:center"), scrollMarginTop: 64 }}>
        <Reveal style={css("display:flex;flex-direction:column;gap:22px")}>
          <div style={css("display:flex;flex-direction:column;gap:12px")}>
            <span style={css(eyebrow)}>Trust</span>
            <h2 style={css(h2)}>Your store, your say.</h2>
            <p style={css(lead)}>Launchmate does the work, but you stay in charge. The limits are built in, not just promised.</p>
          </div>
          <div style={css("display:flex;flex-direction:column;border-top:1px solid #E8ECE8")}>
            {[
              ["You approve anything that costs money", "Each approval covers one exact amount and expires."],
              ["A spending limit you control", "Set a cap per payment. Launchmate can ask, but never override it."],
              ["Your passwords stay private", "Launchmate signs in through a secure vault, so it never sees them."],
              ["Everything is on record", "See what was done, when and why."],
            ].map(([t, d]) => (
              <div key={t} style={css("display:flex;flex-direction:column;gap:3px;padding:14px 0;border-bottom:1px solid #E8ECE8")}>
                <span style={css("font-size:15px;font-weight:600")}>{t}</span>
                <span style={css("font-size:14px;line-height:1.5;color:#5E6862")}>{d}</span>
              </div>
            ))}
          </div>
        </Reveal>

        <Reveal delay={150} style={css("display:flex;flex-direction:column;gap:14px")}>
          <div style={css("background:#F8FAF8;border:1px solid #E8ECE8;border-radius:20px;padding:clamp(18px,2vw,24px);display:flex;flex-direction:column;gap:14px")}>
            <div style={css("display:flex;justify-content:space-between;align-items:center")}><span style={css("font-size:13px;font-weight:600")}>How a password stays safe</span><Tag>Illustration</Tag></div>
            {[
              ["You save it once", "Typed by you into a secure vault, never into Launchmate.", "••••••••••"],
              ["Launchmate sees", "A placeholder that means nothing anywhere else.", "placeholder"],
              ["The website receives", "The real password, typed in by the vault at the last moment.", "signed in"],
            ].map(([a, b, c], k) => (
              <div key={a} style={css("display:flex;align-items:center;gap:14px;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:14px;padding:12px 14px")}>
                <span style={css("width:26px;height:26px;border-radius:50%;background:#EEF6F0;color:#185C3B;display:grid;place-items:center;font-size:12px;font-weight:600;flex-shrink:0")}>{k + 1}</span>
                <span style={css("flex:1;display:flex;flex-direction:column;gap:2px")}><span style={css("font-size:14px;font-weight:500")}>{a}</span><span style={css("font-size:12px;color:#78817B;line-height:1.4")}>{b}</span></span>
                <span style={css("font-family:var(--font-mono);font-size:12px;color:#4C5550")}>{c}</span>
              </div>
            ))}
          </div>
        </Reveal>
      </section>

      {/* ── features ── */}
      <section id="features" style={{ ...css("background:#F8FAF8;border-top:1px solid #E8ECE8;border-bottom:1px solid #E8ECE8;scroll-margin-top:64px") }}>
        <div style={section("display:flex;flex-direction:column;gap:clamp(28px,3vw,40px)")}>
          <Reveal style={css("display:flex;flex-direction:column;gap:12px;max-width:700px")}>
            <span style={css(eyebrow)}>Features</span>
            <h2 style={css(h2)}>Everything you need to sell, without the technical work.</h2>
            <p style={css(lead)}>Launchmate is in early access. Here is what works today and what we are building.</p>
          </Reveal>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr));gap:14px")}>
            {CAPS.map(([t, d, s], k) => (
              <Reveal key={t} delay={(k % 3) * 100}>
                <div style={css("height:100%;background:#FFFFFF;border:1px solid #E8ECE8;border-radius:18px;padding:clamp(20px,2.2vw,26px);display:flex;flex-direction:column;gap:10px")}>
                  <div style={css("display:flex;justify-content:space-between;align-items:center;gap:8px")}>
                    <span style={css("font-family:var(--font-mono);font-size:12px;color:#26734D")}>0{k + 1}</span>
                    <span style={{ ...css("font-size:11px;padding:3px 8px;border-radius:999px;font-weight:500"), background: s === "Available" ? "#E9F4EE" : "#F3F5F2", color: s === "Available" ? "#1F6B43" : "#78817B" }}>{s}</span>
                  </div>
                  <span style={css("font-size:18px;font-weight:600;letter-spacing:-.01em;line-height:1.25")}>{t}</span>
                  <span style={css("font-size:15px;line-height:1.5;color:#5E6862")}>{d}</span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── designed for ── */}
      <section style={section("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,380px),1fr));gap:clamp(28px,4vw,64px);align-items:start")}>
        <Reveal style={css("display:flex;flex-direction:column;gap:14px")}>
          <span style={css(eyebrow)}>Designed for how you sell</span>
          <h2 style={css(h2)}>Built around Nigerian sellers, not copied from somewhere else.</h2>
          <p style={css(lead)}>Pricing in naira, phones as the main screen, and your money going into your own account. Not an afterthought, the starting point.</p>
        </Reveal>
        <div style={css("display:flex;flex-direction:column;border-top:1px solid #E8ECE8")}>
          {DESIGNED.map(([t, d, s], k) => (
            <Reveal key={t} delay={k * 90}>
              <div style={css("display:flex;gap:16px;align-items:flex-start;padding:18px 0;border-bottom:1px solid #E8ECE8")}>
                <span style={css("flex:1;display:flex;flex-direction:column;gap:4px")}>
                  <span style={css("font-size:16px;font-weight:600")}>{t}</span>
                  <span style={css("font-size:14px;line-height:1.5;color:#5E6862")}>{d}</span>
                </span>
                <span style={{ ...css("font-size:11px;padding:3px 8px;border-radius:999px;font-weight:500;white-space:nowrap"), background: s === "Built in" ? "#E9F4EE" : "#F3F5F2", color: s === "Built in" ? "#1F6B43" : "#78817B" }}>{s}</span>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ── roadmap ── */}
      <section style={css("background:#F8FAF8;border-top:1px solid #E8ECE8;border-bottom:1px solid #E8ECE8")}>
        <div style={section("display:flex;flex-direction:column;gap:clamp(28px,3vw,40px)")}>
          <Reveal style={css("display:flex;flex-direction:column;gap:12px;max-width:700px")}>
            <span style={css(eyebrow)}>Where we are</span>
            <h2 style={css(h2)}>Early access, honestly.</h2>
            <p style={css(lead)}>We would rather tell you what is real than promise everything at once.</p>
          </Reveal>
          <div style={css("display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:14px")}>
            {ROADMAP.map(([when, items], k) => (
              <Reveal key={when} delay={k * 110}>
                <div style={{ ...css("height:100%;border-radius:18px;padding:22px;display:flex;flex-direction:column;gap:14px;border-style:solid;border-width:1px"), background: k === 0 ? "#FFFFFF" : "transparent", borderColor: k === 0 ? "#CFE3D6" : "#E8ECE8" }}>
                  <span style={{ ...css("font-size:13px;font-weight:600"), color: k === 0 ? "#26734D" : "#78817B" }}>{when}</span>
                  {items.map((t) => (
                    <div key={t} style={css("display:flex;gap:10px;font-size:15px;line-height:1.45")}>
                      <span style={{ width: 6, height: 6, borderRadius: "50%", background: k === 0 ? "#26734D" : "#C9D2CB", marginTop: 8, flexShrink: 0 }} />{t}
                    </div>
                  ))}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── faq ── */}
      <section id="faq" style={{ ...section("max-width:820px"), scrollMarginTop: 64 }}>
        <Reveal style={css("display:flex;flex-direction:column;gap:12px;margin-bottom:28px")}>
          <span style={css(eyebrow)}>Questions</span>
          <h2 style={css(h2)}>The things people ask first.</h2>
        </Reveal>
        <div style={css("display:flex;flex-direction:column;border-top:1px solid #E8ECE8")}>
          {FAQ.map(([q, a]) => (
            <details key={q} style={css("border-bottom:1px solid #E8ECE8")}>
              <summary style={css("cursor:pointer;padding:18px 0;font-size:17px;font-weight:500;display:flex;justify-content:space-between;gap:16px;align-items:center")}>{q}<span aria-hidden style={css("color:#26734D;font-size:20px;line-height:1")}>+</span></summary>
              <p style={css("margin:0 0 18px;font-size:15px;line-height:1.6;color:#5E6862;max-width:680px")}>{a}</p>
            </details>
          ))}
        </div>
      </section>

      {/* ── final call ── */}
      <section style={css("background:#F8FAF8;border-top:1px solid #E8ECE8;overflow:hidden")}>
        <div style={{ ...css(wrap), paddingTop: "clamp(72px,8vw,112px)", paddingBottom: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 22, textAlign: "center" }}>
          <Reveal style={css("display:flex;flex-direction:column;align-items:center;gap:18px")}>
            <h2 style={css("margin:0;font-size:clamp(34px,3.7vw,52px);line-height:1.05;letter-spacing:-.035em;font-weight:600;text-wrap:balance;max-width:760px")}>Your business deserves a real store.</h2>
            <p style={css("margin:0;font-size:18px;color:#5E6862")}>Start with a few questions. It takes about two minutes.</p>
            <Link href="/signup" className="hv-green" style={cta("font-size:15px;padding:14px 24px")}>Start your store</Link>
          </Reveal>
          <div aria-hidden style={css("position:relative;width:min(100%,640px);aspect-ratio:1/0.62;container-type:size;margin-top:8px")}>
            <IsoScene size={74} offset={14} transform="rotateX(58deg) rotateZ(45deg)" sway={16}>
              <IsoBoxes boxes={endScene} variant="flat" />
            </IsoScene>
          </div>
        </div>
      </section>

      <footer style={css("border-top:1px solid #E8ECE8;background:#FFFFFF")}>
        <div style={{ ...css(wrap), paddingTop: 28, paddingBottom: 28, display: "flex", justifyContent: "space-between", fontSize: 13, color: "#78817B", gap: 16, flexWrap: "wrap", alignItems: "center" }}>
          <span style={css("display:flex;align-items:center;gap:10px;font-weight:600;color:#202723")}><LogoMark size={20} />Launchmate <span style={css("font-weight:400;color:#78817B")}>© 2026</span></span>
          <span style={css("display:flex;gap:20px")}>
            <Link href="/signin" style={css("color:#5E6862")}>Sign in</Link>
            <Link href="/signup" style={css("color:#5E6862")}>Create account</Link>
            <a href="#faq" style={css("color:#5E6862")}>FAQ</a>
          </span>
          <span>Built for Nigerian sellers · Lagos and beyond</span>
        </div>
      </footer>
    </div>
  );
}
