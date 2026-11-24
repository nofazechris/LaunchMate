"use client";

import { useMemo, useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { css } from "@/lib/css";
import { boxes } from "@/lib/data";
import { authClient } from "@/lib/auth-client";
import { IsoBoxes, IsoScene } from "@/components/Iso";
import { LogoMark } from "@/components/Logo";

const field = "font-size:15px;padding:12px 14px;border:1px solid #E8ECE8;border-radius:11px;outline:none;width:100%";
const label = "display:flex;flex-direction:column;gap:6px;font-size:13px;font-weight:500";

export default function AuthScreen({ mode, notice }: { mode: "signup" | "signin"; notice?: string }) {
  const signup = mode === "signup";
  const router = useRouter();
  const scene = useMemo(() => boxes(6, null).map((b) => ({ ...b, op: b.op ? 1 : 0 })), []);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    if (signup && name.trim().length < 2) return setError("Please enter your name.");
    if (password.length < 8) return setError("Your password needs at least 8 characters.");
    setBusy(true);
    try {
      const res = signup
        ? await authClient.signUp.email({ name: name.trim(), email: email.trim(), password })
        : await authClient.signIn.email({ email: email.trim(), password });
      if (res.error) {
        const msg = res.error.message ?? "";
        setError(
          /exist|already/i.test(msg) ? "An account with this email already exists. Try signing in."
          : /invalid|incorrect|password|credentials/i.test(msg) ? "That email or password is not right."
          : res.error.status && res.error.status >= 500 ? "We couldn't reach our database. Please try again shortly."
          : msg || "Something went wrong. Please try again.",
        );
        return;
      }
      router.push("/onboarding");
      router.refresh();
    } catch {
      setError("We couldn't complete that. Check your connection and try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={css("min-height:100vh;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));background:#FFFFFF")}>
      <div style={css("display:flex;flex-direction:column;padding:28px clamp(20px,4vw,56px);gap:40px")}>
        <Link href="/" style={css("display:flex;align-items:center;gap:10px;font-weight:600;font-size:17px;color:#202723")}>
          <LogoMark size={26} />Launchmate
        </Link>
        <div style={css("flex:1;display:flex;flex-direction:column;justify-content:center;gap:28px;max-width:400px;width:100%;margin:0 auto;animation:lmIn .4s ease-out")}>
          <div style={css("display:flex;flex-direction:column;gap:8px")}>
            <h1 style={css("margin:0;font-size:32px;letter-spacing:-.03em;font-weight:600")}>{signup ? "Create your account" : "Welcome back"}</h1>
            <span style={css("font-size:15px;color:#5E6862")}>
              {signup ? "Start your business in a few minutes. No card needed." : "Sign in to keep building your business."}
            </span>
          </div>

          {notice && <div role="alert" style={css("font-size:13px;line-height:1.5;padding:12px 14px;border-radius:11px;background:#FBF3E6;color:#6B4A14;border:1px solid #EAD9BC")}>{notice}</div>}

          <form onSubmit={submit} noValidate style={css("display:flex;flex-direction:column;gap:14px")}>
            {signup && (
              <label style={css(label)}>Full name
                <input className="fx-input" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" required style={css(field)} />
              </label>
            )}
            <label style={css(label)}>Email
              <input className="fx-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" required style={css(field)} />
            </label>
            <label style={css(label)}>Password
              <input className="fx-input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete={signup ? "new-password" : "current-password"} minLength={8} required style={css(field)} />
              {signup && <span style={css("font-weight:400;font-size:12px;color:#78817B")}>At least 8 characters.</span>}
            </label>
            {error && <div role="alert" style={css("font-size:13px;padding:10px 12px;border-radius:10px;background:#FCEEEE;color:#8E2F2F")}>{error}</div>}
            <button type="submit" disabled={busy} className="hv-green press-sm" style={{ ...css("margin-top:6px;background:#26734D;color:#FFFFFF;border:none;font-size:15px;font-weight:500;padding:14px;border-radius:11px;cursor:pointer"), opacity: busy ? 0.7 : 1 }}>
              {busy ? "Please wait…" : signup ? "Create account" : "Sign in"}
            </button>
          </form>

          <span style={css("font-size:14px;color:#5E6862")}>
            {signup ? "Already have an account?" : "New to Launchmate?"}{" "}
            <Link href={signup ? "/signin" : "/signup"} style={css("font-weight:500")}>{signup ? "Sign in" : "Create an account"}</Link>
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
          <span style={css("font-size:14px;color:#5E6862;line-height:1.5")}>Describe your idea and your agent helps you build the storefront, products and business basics.</span>
        </div>
      </div>
    </div>
  );
}
