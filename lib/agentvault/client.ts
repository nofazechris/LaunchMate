import { chromium, listTokens, payRequest, SelfAgentPayError, tokensForUrl } from "@agentvault/playwright";

/**
 * Launchmate's only door to Agent Vault. Relative imports + no `server-only` so scripts and
 * tests can load it. Server-side only: it needs SELF_AGENT_PAY_API_KEY, which must never reach a
 * browser.
 *
 * Guarantees we enforce HERE (Agent Vault enforces its own on top):
 *  - the agent only ever handles mock tokens; we never read a password, card or code;
 *  - every payment has a hard USD ceiling (AV_MAX_PAYMENT_USD, default $0.10) and a human-
 *    visible reason; the agent cannot pick its own limit above the ceiling;
 *  - outcomes are reported exactly as the provider answered: we never claim success on
 *    "nothing happened".
 */

export const DEFAULT_MAX_PAYMENT_USD = 0.1;

export interface VaultStatus {
  connected: boolean;
  walletReady: boolean;
  walletTokens: string[];
  walletUngoverned: boolean;
  logins: { website: string; hasEmail: boolean; hasTotp: boolean }[];
  loginReady: boolean;
  note?: string;
}

export async function getVaultStatus(): Promise<VaultStatus> {
  const c = await listTokens();
  const w = c.wallets?.[0];
  const logins = c.logins.map((l) => ({ website: l.website ?? l.label, hasEmail: !!l.hasEmail, hasTotp: !!l.hasTotp }));
  return {
    connected: true,
    walletReady: !!w,
    walletTokens: w?.tokens ?? [],
    walletUngoverned: !!w?.ungoverned,
    logins,
    loginReady: logins.length > 0,
    note: c.walletNote,
  };
}

/* ───────────── sign in (the agent never sees the password) ───────────── */

export interface SiteConfig {
  /** The page that shows the sign-in form. */
  loginUrl: string;
  identifierSelector: string;
  passwordSelector: string;
  submitSelector: string;
  /** Present only when signed in (e.g. an account menu). */
  successSelector: string;
  /** Present when the site rejects the sign-in. */
  failureSelector: string;
  /** Which token fills the identifier field: decide from the field's visible label, not its name. */
  identifier: "email" | "username";
  timeoutMs?: number;
}

export type SignInOutcome =
  | { outcome: "signed_in"; host: string }
  | { outcome: "rejected"; host: string }
  | { outcome: "needs_owner"; host: string; reason: string } // code / CAPTCHA / bank check: the owner must act
  | { outcome: "no_login"; host: string; hint: string }
  | { outcome: "inconclusive"; host: string; hint: string };

export async function signInToSite(site: SiteConfig): Promise<SignInOutcome> {
  const host = new URL(site.loginUrl).host;
  const view = await tokensForUrl(site.loginUrl);
  const login = view.logins[0];
  if (!login) {
    return {
      outcome: "no_login",
      host,
      hint: view.relatedLogins.length
        ? `A login exists on a sibling host (${view.relatedLogins.map((r) => r.website ?? r.label).join(", ")}); use that host's sign-in URL.`
        : "No login for this site is visible to the API key. Add it in the Agent Vault dashboard and give the key access.",
    };
  }
  const tokens = login.tokens as Record<string, string | undefined>;
  const id = tokens[site.identifier];
  if (!id) return { outcome: "no_login", host, hint: `The stored login has no ${site.identifier} on file; add one in the dashboard.` };
  if (!tokens.password) return { outcome: "no_login", host, hint: "The stored login has no password token." };

  const browser = await chromium.launch();
  try {
    const page = await browser.newPage();
    await page.goto(site.loginUrl);
    await page.fill(site.identifierSelector, id);
    await page.fill(site.passwordSelector, tokens.password);
    await page.click(site.submitSelector);

    const timeout = site.timeoutMs ?? 20000;
    // Race the signed-in marker against the site's error element. Neither => inconclusive, never "success".
    const winner = await Promise.race([
      page.waitForSelector(site.successSelector, { state: "visible", timeout }).then(() => "ok" as const, () => null),
      page.waitForSelector(site.failureSelector, { state: "visible", timeout }).then(() => "fail" as const, () => null),
    ]);
    if (winner === "ok") return { outcome: "signed_in", host };
    if (winner === "fail") return { outcome: "rejected", host };

    const challenge = await page.detectChallenge().catch(() => undefined);
    if (challenge && "detected" in challenge && challenge.detected) {
      return { outcome: "needs_owner", host, reason: "The site is asking for a code or challenge. Only the account holder can answer it." };
    }
    return { outcome: "inconclusive", host, hint: "Neither the signed-in marker nor an error appeared. Do not treat this as success or as a wrong password." };
  } finally {
    await browser.close().catch(() => {});
  }
}

/* ───────────── pay a Buy service by x402 from the Agent Vault wallet ───────────── */

export class PaymentPolicyError extends Error {}

export function maxPaymentCeiling(env: Record<string, string | undefined> = process.env): number {
  const v = env.AV_MAX_PAYMENT_USD === undefined ? DEFAULT_MAX_PAYMENT_USD : Number(env.AV_MAX_PAYMENT_USD);
  if (!Number.isFinite(v) || v <= 0) throw new PaymentPolicyError("AV_MAX_PAYMENT_USD must be a positive number");
  return v;
}

/** Only Buy's gateway is payable through the wallet; anything else is refused before we call out. */
const ALLOWED_PAY_HOSTS = new Set(["gateway.usebuy.ai", "usebuy.ai"]);

export interface PayInput {
  url: string;
  method?: "GET" | "POST";
  body?: Record<string, unknown>;
  /** USD, at most 6 decimals, e.g. "0.05". */
  maxUsd: string;
  /** Stable key so a retry can never pay twice. */
  idempotencyKey: string;
  /** Wait for the owner to approve inside the call (Agent Vault asks them first). */
  waitForOwnerMs?: number;
}

export type PayOutcome =
  | { outcome: "paid"; txHash?: string; network?: string; amount?: string; token?: string; paymentId?: string; body?: string; idempotencyKey: string }
  | { outcome: "awaiting_owner"; idempotencyKey: string; message?: string }
  | { outcome: "unpaid"; idempotencyKey: string; message?: string }
  | { outcome: "refused"; code: string; message: string; paymentMayHaveBeenSent: boolean; idempotencyKey: string };

export function validatePayInput(p: PayInput, ceiling = maxPaymentCeiling()): void {
  const u = new URL(p.url);
  if (u.protocol !== "https:" || !ALLOWED_PAY_HOSTS.has(u.hostname)) throw new PaymentPolicyError(`Only Buy routes are payable (got ${u.hostname})`);
  if (!/^\d+(\.\d{1,6})?$/.test(p.maxUsd)) throw new PaymentPolicyError("maxUsd must be a decimal with at most 6 places");
  if (Number(p.maxUsd) <= 0) throw new PaymentPolicyError("maxUsd must be positive");
  if (Number(p.maxUsd) > ceiling) throw new PaymentPolicyError(`maxUsd ${p.maxUsd} exceeds the configured ceiling of ${ceiling}`);
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(p.idempotencyKey)) throw new PaymentPolicyError("idempotencyKey must be 8-64 letters, digits, - or _");
}

export async function payBuyService(p: PayInput): Promise<PayOutcome> {
  validatePayInput(p);
  const status = await getVaultStatus();
  if (!status.walletReady) {
    return { outcome: "refused", code: "wallet_not_ready", message: status.note ?? "No agent wallet is available to this key.", paymentMayHaveBeenSent: false, idempotencyKey: p.idempotencyKey };
  }
  const wallet = (await listTokens()).wallets![0];
  try {
    const r = await payRequest({
      card: wallet.card,
      url: p.url,
      method: p.method,
      body: p.body,
      maxAmount: p.maxUsd,
      idempotencyKey: p.idempotencyKey,
      wait: p.waitForOwnerMs ? { timeoutMs: p.waitForOwnerMs } : undefined,
    });
    if (r.outcome === "paid") {
      return { outcome: "paid", txHash: r.txHash, network: r.network, amount: r.amount, token: r.token, paymentId: r.paymentId, body: r.body, idempotencyKey: r.idempotencyKey };
    }
    if (r.outcome === "pending") return { outcome: "awaiting_owner", idempotencyKey: r.idempotencyKey, message: r.message };
    return { outcome: "unpaid", idempotencyKey: r.idempotencyKey, message: r.message };
  } catch (e) {
    if (e instanceof SelfAgentPayError) {
      const payment = (e as unknown as { payment?: { sent?: boolean } }).payment;
      return {
        outcome: "refused",
        code: String((e as unknown as { code?: string }).code ?? "error"),
        message: e.message,
        paymentMayHaveBeenSent: !!payment?.sent,
        idempotencyKey: p.idempotencyKey,
      };
    }
    throw e;
  }
}
