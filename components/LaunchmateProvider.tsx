"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { agentReply, FINAL_MSG, QS, TASKS, type AnswerKey, type TaskStatus } from "@/lib/data";

export interface ChatMsg { u: boolean; text: string }
export interface Tx { date: string; desc: string; cat: string; amt: string; color: string }
type Group = "onboard" | "build" | "agent";

const BUILD_SPEED = Number(process.env.NEXT_PUBLIC_BUILD_SPEED ?? 1) || 1;
const stepMs = () => 1400 / BUILD_SPEED;
const STAGE_AFTER = [1, 2, 3, 4, 5, 5, 6];

interface Ctx {
  /* auth */
  signup: boolean;
  swapAuth: () => void;
  /* onboarding */
  answers: Partial<Record<AnswerKey, string>>;
  chat: ChatMsg[];
  qi: number;
  typing: boolean;
  draft: string;
  setDraft: (v: string) => void;
  startOnboarding: (name?: string) => void;
  answer: (text: string) => void;
  askRevise: () => void;
  /* build */
  buildStarted: boolean;
  tasks: TaskStatus[];
  stage: number;
  launched: boolean;
  domainSkipped: boolean;
  startBuild: () => void;
  approveDomain: () => void;
  rejectDomain: () => void;
  retryDomain: () => void;
  skipDomain: () => void;
  bizUrl: string;
  /* business state shared across screens */
  restock: "pending" | "approved" | "rejected";
  approveRestock: () => void;
  rejectRestock: () => void;
  extraTx: Tx[];
  addExpense: () => void;
  agentMsgs: ChatMsg[];
  agentDraft: string;
  setAgentDraft: (v: string) => void;
  agentSay: (text: string) => void;
  revoked: boolean;
  toggleRevoke: () => void;
  rules: boolean[];
  toggleRule: (i: number) => void;
}

const LaunchmateContext = createContext<Ctx | null>(null);

export function useLaunchmate(): Ctx {
  const c = useContext(LaunchmateContext);
  if (!c) throw new Error("useLaunchmate must be used inside <LaunchmateProvider>");
  return c;
}

export function LaunchmateProvider({ children }: { children: ReactNode }) {
  const router = useRouter();

  const [signup, setSignup] = useState(true);
  const [answers, setAnswers] = useState<Partial<Record<AnswerKey, string>>>({});
  const [chat, setChat] = useState<ChatMsg[]>([]);
  const [qi, setQi] = useState(0);
  const [typing, setTyping] = useState(false);
  const [draft, setDraft] = useState("");

  const [buildStarted, setBuildStarted] = useState(false);
  const [tasks, setTasks] = useState<TaskStatus[]>(() => TASKS.map(() => "queued"));
  const [stage, setStage] = useState(0);
  const [launched, setLaunched] = useState(false);
  const [domainSkipped, setDomainSkipped] = useState(false);

  const [restock, setRestock] = useState<Ctx["restock"]>("pending");
  const [extraTx, setExtraTx] = useState<Tx[]>([]);
  const [agentMsgs, setAgentMsgs] = useState<ChatMsg[]>([
    { u: false, text: "Adire & Co. is live. Ask me about your store, orders or finances." },
  ]);
  const [agentDraft, setAgentDraft] = useState("");
  const [revoked, setRevoked] = useState(false);
  const [rules, setRules] = useState([true, true, true, false]);

  /* ── timers, grouped so a flow can be restarted cleanly ── */
  const timers = useRef<Record<Group, number[]>>({ onboard: [], build: [], agent: [] });
  const later = useCallback((group: Group, fn: () => void, ms: number) => {
    timers.current[group].push(window.setTimeout(fn, ms));
  }, []);
  const clearGroup = useCallback((group: Group) => {
    timers.current[group].forEach(clearTimeout);
    timers.current[group] = [];
  }, []);
  useEffect(() => {
    const t = timers.current;
    return () => Object.values(t).forEach((ids) => ids.forEach(clearTimeout));
  }, []);

  /* ── onboarding ── */
  const startOnboarding = useCallback((name?: string) => {
    clearGroup("onboard");
    setChat([]); setQi(0); setAnswers({}); setDraft(""); setTyping(true);
    later("onboard", () => { setTyping(false); setChat([{ u: false, text: QS[0].q.replace("{name}", (name ?? "").trim().split(/s+/)[0] || "there") }]); }, 600);
  }, [clearGroup, later]);

  const answer = (text: string) => {
    if (typing || qi >= QS.length) return;
    const q = QS[qi];
    const next = qi + 1;
    setAnswers((a) => {
      const n = { ...a, [q.key]: text };
      if (q.key === "idea") n.cat = /skin/i.test(text) ? "Beauty & skincare" : /digital|template/i.test(text) ? "Digital products" : "Fashion & apparel";
      return n;
    });
    setChat((c) => c.concat({ u: true, text }));
    setQi(next); setTyping(true); setDraft("");
    later("onboard", () => {
      setTyping(false);
      setChat((c) => c.concat({ u: false, text: next < QS.length ? QS[next].q : FINAL_MSG }));
    }, 700);
  };

  const askRevise = () =>
    setChat((c) => c.concat({ u: false, text: "Of course — tell me what to change, or edit any field directly in the blueprint." }));

  /* ── build simulation ── */
  const setTask = useCallback((i: number, v: TaskStatus) => setTasks((ts) => ts.map((t, j) => (j === i ? v : t))), []);

  const step = useCallback((i: number) => {
    setTask(i, "running");
    later("build", () => {
      if (i === 5) { setTask(5, "approval"); return; }
      if (i === 6) { setTask(6, "done"); setStage(6); setLaunched(true); return; }
      setTask(i, "done"); setStage(STAGE_AFTER[i]);
      later("build", () => step(i + 1), 300);
    }, stepMs());
  }, [later, setTask]);

  const startBuild = useCallback(() => {
    clearGroup("build");
    setBuildStarted(true); setTasks(TASKS.map(() => "queued")); setStage(0); setLaunched(false); setDomainSkipped(false);
    later("build", () => step(0), 500);
    router.push("/build");
  }, [clearGroup, later, step, router]);

  const approveDomain = () => {
    setTask(5, "verifying");
    later("build", () => { setTask(5, "done"); later("build", () => step(6), 300); }, 2200);
  };
  const rejectDomain = () => setTask(5, "blocked");
  const retryDomain = () => setTask(5, "approval");
  const skipDomain = () => { setTask(5, "skipped"); setDomainSkipped(true); later("build", () => step(6), 300); };

  const bizUrl = domainSkipped ? "adireandco.launchmate.store" : stage >= 6 || tasks[5] === "done" ? "adireandco.com" : "adireandco.launchmate.store";

  /* ── business agent ── */
  const agentSay = (raw: string) => {
    const text = raw.trim();
    if (!text) return;
    setAgentDraft("");
    setAgentMsgs((m) => m.concat({ u: true, text }));
    later("agent", () => setAgentMsgs((m) => m.concat({ u: false, text: agentReply(text) })), 650);
  };

  const approveRestock = () => {
    setRestock("approved");
    setAgentMsgs((m) => m.concat({ u: false, text: "Approved. I placed the order with Itoku Textiles and recorded ₦64,000 under Materials." }));
  };
  const rejectRestock = () => {
    setRestock("rejected");
    setAgentMsgs((m) => m.concat({ u: false, text: "No problem — nothing was ordered or charged." }));
  };

  const value: Ctx = useMemo(() => ({
    signup, swapAuth: () => setSignup((s) => !s),
    answers, chat, qi, typing, draft, setDraft, startOnboarding, answer, askRevise,
    buildStarted, tasks, stage, launched, domainSkipped, startBuild, approveDomain, rejectDomain, retryDomain, skipDomain, bizUrl,
    restock, approveRestock, rejectRestock,
    extraTx, addExpense: () => setExtraTx((t) => [{ date: "Today", desc: "Packaging — kraft boxes", cat: "Packaging", amt: "−₦7,500", color: "#202723" }, ...t]),
    agentMsgs, agentDraft, setAgentDraft, agentSay,
    revoked, toggleRevoke: () => setRevoked((r) => !r),
    rules, toggleRule: (i: number) => setRules((r) => r.map((v, j) => (j === i ? !v : v))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }), [signup, answers, chat, qi, typing, draft, buildStarted, tasks, stage, launched, domainSkipped, bizUrl, restock, extraTx, agentMsgs, agentDraft, revoked, rules]);

  return <LaunchmateContext.Provider value={value}>{children}</LaunchmateContext.Provider>;
}
