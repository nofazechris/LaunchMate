"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { boxes } from "@/lib/data";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { LogoMark } from "@/components/Logo";
import { useLaunchmate } from "@/components/LaunchmateProvider";

const field = "font-size:15px;padding:12px 14px;border:1px solid #E8ECE8;border-radius:11px;outline:none";
const label = "display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500";

export default function AuthScreen() {
  const { signup, swapAuth, startOnboarding } = useLaunchmate();
  const router = useRouter();
  const scene = useMemo(() => boxes(6, null).map((b) => ({ ...b, op: b.op ? 1 : 0 })), []);

  const toOnboard = () => {
    startOnboarding();
    router.push("/onboarding");
  };

  return (
    <div data-screen-label="01 Sign up" style={css("min-height:100vh;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));background:#FFFFFF")}>
      <div style={css("display:flex;flex-direction:column;padding:28px clamp(20px,4vw,56px);gap:40px")}>
        <span style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;color:#202723")}>
          <LogoMark size={26} />Launchmate
        </span>
        <div style={css("flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px;max-width:400px;width:100%;margin:0 auto;animation:lmIn .4s ease-out")}>
          <div style={css("display:flex;flex-direction:column;gap:8px")}>
            <h1 style={css("margin:0;font-size:32px;letter-spacing:-.03em;font-weight:600")}>{signup ? "Create your account" : "Welcome back"}</h1>
            <span style={css("font-size:15px;color:#5E6862")}>
              {signup ? "Start your business in a few minutes. No card needed." : "Sign in to keep running your business."}
            </span>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); toOnboard(); }} style={css("display:flex;flex-direction:column;gap:14px")}>
            {signup && (
              <label style={css(label)}>Full name
                <input className="fx-input" defaultValue="Funmi Okafor" autoComplete="name" style={css(field)} />
              </label>
            )}
            <label style={css(label)}>Email
              <input className="fx-input" defaultValue="funmi@adireandco.com" type="email" autoComplete="email" style={css(field)} />
            </label>
            <label style={css(label)}>
              <span style={css("display:flex;justify-content:space-between")}>
                Password
                {!signup && <span style={css("font-weight:400;color:#26734D;cursor:pointer")}>Forgot password?</span>}
              </span>
              <input className="fx-input" defaultValue="launchmate" type="password" autoComplete={signup ? "new-password" : "current-password"} style={css(field)} />
            </label>
            <button type="submit" className="hv-green press-sm" style={css("margin-top:6px;background:#26734D;color:#FFFFFF;border:none;font-size:15px;font-weight:500;padding:14px;border-radius:11px;cursor:pointer")}>
              {signup ? "Create account" : "Sign in"}
            </button>
            <div style={css("display:flex;align-items:center;gap:12px;font-size:12px;color:#78817B")}>
              <span style={css("flex:1;height:1px;background:#E8ECE8")} />or<span style={css("flex:1;height:1px;background:#E8ECE8")} />
            </div>
            <button type="button" onClick={toOnboard} className="hv-grey" style={css("background:#FFFFFF;border:1px solid #E8ECE8;font-size:15px;padding:13px;border-radius:11px;cursor:pointer;color:#202723")}>
              Continue with Google
            </button>
          </form>
          <span style={css("font-size:14px;color:#5E6862")}>
            {signup ? "Already have an account?" : "New to Launchmate?"}{" "}
            <button onClick={swapAuth} style={css("background:none;border:none;padding:0;color:#26734D;font-size:14px;cursor:pointer;font-weight:500")}>
              {signup ? "Sign in" : "Create an account"}
            </button>
          </span>
        </div>
        <span style={css("font-size:12px;color:#78817B")}>Your progress saves automatically. You can leave and come back anytime.</span>
      </div>

      <div style={css("background:#F8FAF8;border-left:1px solid #E8ECE8;display:flex;flex-direction:column;justify-content:center;align-items:center;padding:40px;gap:28px;min-height:420px")}>
        <div aria-hidden style={css("position:relative;width:min(100%,480px);aspect-ratio:1;container-type:size")}>
          <IsoScene size={60} offset={6} transform="rotateX(58deg) rotateZ(45deg)" sway={14}>
            <IsoBoxes boxes={scene} variant="flat" />
          </IsoScene>
        </div>
        <div style={css("display:flex;flex-direction:column;gap:6px;text-align:center;max-width:360px")}>
          <span style={css("font-size:18px;font-weight:600;letter-spacing:-.01em")}>Your business starts here.</span>
          <span style={css("font-size:14px;color:#5E6862;line-height:1.5")}>Describe your idea and watch your agent build the storefront, products and infrastructure.</span>
        </div>
      </div>
    </div>
  );
}
