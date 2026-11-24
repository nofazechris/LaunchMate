import assert from "node:assert/strict";
import { test } from "node:test";
import { fromDataSuffix } from "@celo/attribution-tags";
import { custom, parseTransaction, type Hex } from "viem";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";
import { celoWalletClient, getAttributionCode } from "../lib/chain/celo.ts";

const CODE = "celo_b02f2c0e5298";

/** A transport that answers the few RPCs viem needs and captures the signed raw tx. No network. */
function capturingTransport() {
  const sent: Hex[] = [];
  const transport = custom({
    async request({ method, params }: { method: string; params?: unknown }) {
      if (method === "eth_chainId") return "0xa4ec"; // 42220
      if (method === "eth_sendRawTransaction") {
        sent.push((params as Hex[])[0]);
        return "0x" + "11".repeat(32);
      }
      throw new Error(`unexpected RPC ${method}`);
    },
  });
  return { transport, sent };
}

// Throwaway key generated in-process; holds no funds and never leaves this test.
const account = privateKeyToAccount(generatePrivateKey());
const fees = { gas: 21000n, nonce: 0, maxFeePerGas: 10n ** 9n, maxPriorityFeePerGas: 10n ** 9n };

test("plain transfer carries the attribution code in signed calldata", async () => {
  const { transport, sent } = capturingTransport();
  const wallet = celoWalletClient({ account, transport, code: CODE });
  await wallet.sendTransaction({ to: "0x000000000000000000000000000000000000dEaD", value: 1n, ...fees });
  assert.equal(sent.length, 1);
  const tx = parseTransaction(sent[0]);
  assert.equal(tx.chainId, 42220);
  assert.deepEqual(fromDataSuffix(tx.data ?? "0x")?.codes, [CODE]);
});

test("contract-style calldata keeps its arguments and still ends with the tag, exactly once", async () => {
  const { transport, sent } = capturingTransport();
  const wallet = celoWalletClient({ account, transport, code: CODE });
  const data: Hex = "0xa9059cbb" + "00".repeat(64) as Hex;
  await wallet.sendTransaction({ to: "0x000000000000000000000000000000000000dEaD", data, ...fees });
  const tx = parseTransaction(sent[0]);
  assert.ok(tx.data?.startsWith(data), "original calldata preserved at the front");
  assert.deepEqual(fromDataSuffix(tx.data ?? "0x")?.codes, [CODE], "one tag, no duplicates");
});

test("refuses to build a client without a valid code", () => {
  assert.throws(() => getAttributionCode({}), /ATTRIBUTION_CODE is not set/);
  assert.throws(() => getAttributionCode({ ATTRIBUTION_CODE: "myapp" }), /not of the form/);
  assert.equal(getAttributionCode({ ATTRIBUTION_CODE: CODE }), CODE);
});
