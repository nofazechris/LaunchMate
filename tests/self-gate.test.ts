import assert from "node:assert/strict";
import { test } from "node:test";
import { SelfAgent } from "@selfxyz/agent-sdk";
import { generatePrivateKey } from "viem/accounts";
import { gateAgentRequest } from "../lib/self/gate.ts";

const URL_ = "http://localhost:3000/api/services/enrich-product";
const BODY = JSON.stringify({ name: "Indigo Market Tote" });
const signedHeaders = () => ({ "x-self-agent-signature": "0x00", "x-self-agent-timestamp": String(Date.now()) });
const request = (headers?: Record<string, string>, body = BODY) => new Request(URL_, { method: "POST", body, headers });

// ── Offline: how the gate turns a verifier's answer into a decision. The verifier is a stand-in
//    here, so these prove OUR logic only, not Self's registry. ──
type Answer = Awaited<ReturnType<Parameters<typeof gateAgentRequest>[1] extends infer V ? V extends { verify: (...a: never[]) => Promise<unknown> } ? V["verify"] : never : never>>;
const answering = (a: Record<string, unknown>) => ({ verify: async () => ({ agentAddress: "0x0", agentKey: "0x0", agentId: 0n, agentCount: 0n, nullifier: 0n, ...a }) as unknown as Answer });

test("unsigned request is denied before any payment is requested", async () => {
  const res = await gateAgentRequest(request());
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 401);
    assert.equal(res.decision, "denied");
  }
});

test("an agent the verifier does not accept is denied (401 for auth failures, 403 for policy)", async () => {
  const unverified = await gateAgentRequest(request(signedHeaders()), answering({ valid: false, error: "Agent not verified on-chain" }));
  assert.equal(unverified.ok, false);
  if (!unverified.ok) assert.deepEqual([unverified.decision, unverified.status], ["denied", 401]);
  const policy = await gateAgentRequest(request(signedHeaders()), answering({ valid: false, error: "Human has 13 agents (max 1)" }));
  if (!policy.ok) assert.deepEqual([policy.decision, policy.status], ["denied", 403]);
  else assert.fail("must not be served");
});

test("a rate-limited agent gets 429, and an accepted agent is served", async () => {
  const limited = await gateAgentRequest(request(signedHeaders()), answering({ valid: false, error: "Rate limit exceeded", retryAfterMs: 1000 }));
  if (!limited.ok) assert.deepEqual([limited.decision, limited.status], ["rate_limited", 429]);
  else assert.fail("must not be served");
  const served = await gateAgentRequest(request(signedHeaders()), answering({ valid: true, agentId: 7n, agentAddress: "0xabc", nullifier: 9n }));
  assert.equal(served.ok, true);
  if (served.ok) assert.equal(served.agent.agentId, "7");
});

test("a stalled or failing registry read fails CLOSED (never serves on an unknown)", async () => {
  const stalled = { verify: () => new Promise<never>(() => {}) };
  const failing = { verify: () => Promise.reject(new Error("rpc down")) };
  for (const v of [stalled, failing]) {
    const res = await gateAgentRequest(request(signedHeaders()), v, { timeoutMs: 200 });
    assert.equal(res.ok, false);
    if (!res.ok) assert.deepEqual([res.decision, res.status], ["unavailable", 503]);
  }
});

// ── Live: real read calls to the Self Agent ID registry on Celo mainnet (`npm run test:live`).
//    They prove the DENIED decisions. The SERVED path needs a human-verified registered agent. ──
const live = { skip: process.env.RUN_LIVE_TESTS !== "1" && "needs network: run `npm run test:live`" };

test("LIVE: a validly signed request from an unregistered agent is denied by the mainnet registry", live, async () => {
  const agent = new SelfAgent({ privateKey: generatePrivateKey(), network: "mainnet" });
  const headers = await agent.signRequest("POST", URL_, BODY);
  const res = await gateAgentRequest(request(headers));
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.decision, "denied");
    assert.ok([401, 403].includes(res.status), `status ${res.status}`);
  }
});

test("LIVE: a tampered body is rejected (the signature covers the exact bytes)", live, async () => {
  const agent = new SelfAgent({ privateKey: generatePrivateKey(), network: "mainnet" });
  const headers = await agent.signRequest("POST", URL_, BODY);
  const res = await gateAgentRequest(request(headers, JSON.stringify({ name: "Something else" })));
  assert.equal(res.ok, false);
});
