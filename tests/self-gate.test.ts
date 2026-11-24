import assert from "node:assert/strict";
import { test } from "node:test";
import { SelfAgent } from "@selfxyz/agent-sdk";
import { generatePrivateKey } from "viem/accounts";
import { gateAgentRequest } from "../lib/self/gate.ts";

/**
 * These tests make REAL read calls to the Self Agent ID registry on Celo mainnet
 * (https://forno.celo.org). They prove the DENIED decisions. They do not prove the SERVED
 * path: that needs a registered, human-verified agent, which only a real passport scan creates.
 */
const URL_ = "http://localhost:3000/api/services/enrich-product";
const BODY = JSON.stringify({ name: "Indigo Market Tote" });

test("unsigned request is denied before any payment is requested", async () => {
  const res = await gateAgentRequest(new Request(URL_, { method: "POST", body: BODY }));
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.status, 401);
    assert.equal(res.decision, "denied");
  }
});

test("validly SIGNED request from an agent that is not registered on mainnet is denied", async () => {
  // Fresh random key: a perfectly valid signature, but no Self Agent ID registration on-chain.
  const agent = new SelfAgent({ privateKey: generatePrivateKey(), network: "mainnet" });
  const headers = await agent.signRequest("POST", URL_, BODY);
  const res = await gateAgentRequest(new Request(URL_, { method: "POST", body: BODY, headers }));
  assert.equal(res.ok, false);
  if (!res.ok) {
    assert.equal(res.decision, "denied");
    assert.ok([401, 403].includes(res.status), `status ${res.status}`);
    console.log("      registry said:", res.error);
  }
});

test("tampered body is rejected (signature covers exact bytes)", async () => {
  const agent = new SelfAgent({ privateKey: generatePrivateKey(), network: "mainnet" });
  const headers = await agent.signRequest("POST", URL_, BODY);
  const res = await gateAgentRequest(new Request(URL_, { method: "POST", body: JSON.stringify({ name: "Something else" }), headers }));
  assert.equal(res.ok, false);
});

test("a stalled or failing registry read fails CLOSED (never serves on an unknown)", async () => {
  const req = () => new Request(URL_, { method: "POST", body: BODY, headers: { "x-self-agent-signature": "0x00", "x-self-agent-timestamp": String(Date.now()) } });
  const stalled = { verify: () => new Promise<never>(() => {}) };
  const failing = { verify: () => Promise.reject(new Error("rpc down")) };
  for (const v of [stalled, failing]) {
    const res = await gateAgentRequest(req(), v, { timeoutMs: 200 });
    assert.equal(res.ok, false);
    if (!res.ok) {
      assert.equal(res.decision, "unavailable");
      assert.equal(res.status, 503);
    }
  }
});
