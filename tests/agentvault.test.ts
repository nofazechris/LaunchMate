import assert from "node:assert/strict";
import { test } from "node:test";
import { getVaultStatus, maxPaymentCeiling, PaymentPolicyError, signInToSite, validatePayInput } from "../lib/agentvault/client.ts";

const good = { url: "https://gateway.usebuy.ai/v1/social/x/posts/search", maxUsd: "0.05", idempotencyKey: "launchmate-test-0001" };

test("payment policy: accepts a small payment to a Buy route", () => {
  assert.doesNotThrow(() => validatePayInput(good, 0.1));
});

test("payment policy: refuses anything above the ceiling, so the agent cannot raise its own limit", () => {
  assert.throws(() => validatePayInput({ ...good, maxUsd: "0.11" }, 0.1), PaymentPolicyError);
  assert.doesNotThrow(() => validatePayInput({ ...good, maxUsd: "0.10" }, 0.1));
});

test("payment policy: only Buy routes over https are payable", () => {
  assert.throws(() => validatePayInput({ ...good, url: "https://evil.example.com/pay" }), /Only Buy routes/);
  assert.throws(() => validatePayInput({ ...good, url: "http://gateway.usebuy.ai/x" }), /Only Buy routes/);
  assert.throws(() => validatePayInput({ ...good, url: "https://gateway.usebuy.ai.evil.com/x" }), /Only Buy routes/);
});

test("payment policy: rejects malformed amounts and idempotency keys", () => {
  for (const maxUsd of ["0", "-1", "abc", "0.0000001", "1e3", ""]) {
    assert.throws(() => validatePayInput({ ...good, maxUsd }, 100), PaymentPolicyError, maxUsd);
  }
  assert.throws(() => validatePayInput({ ...good, idempotencyKey: "short" }), PaymentPolicyError);
});

test("payment ceiling: defaults to $0.10 and rejects nonsense config", () => {
  assert.equal(maxPaymentCeiling({}), 0.1);
  assert.equal(maxPaymentCeiling({ AV_MAX_PAYMENT_USD: "0.25" }), 0.25);
  assert.throws(() => maxPaymentCeiling({ AV_MAX_PAYMENT_USD: "0" }), PaymentPolicyError);
  assert.throws(() => maxPaymentCeiling({ AV_MAX_PAYMENT_USD: "lots" }), PaymentPolicyError);
});

// ── Real calls to Agent Vault (read-only; no browser, no payment). Skipped without an API key. ──
const live = { skip: !process.env.SELF_AGENT_PAY_API_KEY && "SELF_AGENT_PAY_API_KEY not set" };

test("LIVE: Agent Vault accepts our key and reports wallet / login readiness", live, async () => {
  const s = await getVaultStatus();
  assert.equal(s.connected, true);
  console.log(`      walletReady=${s.walletReady} loginReady=${s.loginReady} logins=${s.logins.length}`);
});

test("LIVE: signing in to a site with no stored login reports no_login and opens no browser", live, async () => {
  const r = await signInToSite({
    loginUrl: "https://no-login-stored.invalid/login",
    identifierSelector: "#a", passwordSelector: "#b", submitSelector: "#c", successSelector: "#d", failureSelector: "#e", identifier: "email",
  });
  assert.equal(r.outcome, "no_login");
});
