// Registers the Launchmate agent on the ERC-8004 Identity Registry on Celo MAINNET (chain 42220).
//
//   npm run erc8004:register            -> DRY RUN (default): simulates, estimates gas, sends NOTHING
//   npm run erc8004:register -- --send  -> asks you to type "register", then sends the real transaction
//
// register(agentURI) mints the identity NFT to the SENDER and records the sender as the agent
// wallet, so it must be sent from the agent wallet (AGENT_PRIVATE_KEY). The transaction is built
// through lib/chain/celo.ts, so it carries the hackathon attribution tag. After it confirms we
// read the agentId from the Registered event (not the return value), decode the tag back from
// the mined transaction, and print public details only.
// Docs: https://docs.celo.org/build/agents/8004
import { appendFileSync, existsSync, readFileSync } from "node:fs";
import { createInterface } from "node:readline/promises";
import { verifyTx } from "@celo/attribution-tags";
import { createPublicClient, formatEther, http, parseAbi, parseEventLogs } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { celo } from "viem/chains";
import { celoWalletClient, getAttributionCode } from "../lib/chain/celo.ts";

const REGISTRY = "0x8004A169FB4a3325136EB29fA0ceB6D2e539a432"; // Celo mainnet Identity Registry (Celo docs + event skill agree)
const URI = process.env.AGENT_URI ?? "https://raw.githubusercontent.com/nofazechris/LaunchMate/main/public/agent.json";
const send = process.argv.includes("--send");
const abi = parseAbi([
  "function register(string agentURI) returns (uint256 agentId)",
  "event Registered(uint256 indexed agentId, string agentURI, address indexed owner)",
]);
const fail = (m) => { console.error("\n" + m); process.exit(1); };

// ── Preconditions ──
const key = process.env.AGENT_PRIVATE_KEY;
if (!key) fail("AGENT_PRIVATE_KEY is not set (.env.local).");
const account = privateKeyToAccount(key);
if (process.env.AGENT_WALLET_ADDRESS && process.env.AGENT_WALLET_ADDRESS.toLowerCase() !== account.address.toLowerCase()) {
  fail("AGENT_WALLET_ADDRESS does not match AGENT_PRIVATE_KEY. Fix .env.local before continuing.");
}
let code;
try { code = getAttributionCode(); } catch (e) { fail(e.message); }
if (process.env.SELF_AGENT_ID || process.env.ERC8004_AGENT_ID) {
  fail(`An agent id is already recorded (${process.env.ERC8004_AGENT_ID ?? "SELF_AGENT_ID"}). Refusing to register a second identity.`);
}

const client = createPublicClient({ chain: celo, transport: http(process.env.CELO_RPC_URL ?? "https://forno.celo.org") });
if ((await client.getChainId()) !== 42220) fail("RPC is not Celo mainnet (42220).");
if (!((await client.getCode({ address: REGISTRY }))?.length > 2)) fail("No contract at the registry address on this network.");

// The registration file must be reachable over HTTPS and look right, or the identity points at nothing.
let meta;
try {
  const res = await fetch(URI);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  meta = JSON.parse(await res.text());
} catch (e) {
  fail(`Cannot fetch the agent file at ${URI}: ${e.message}\nPush public/agent.json to GitHub first (or set AGENT_URI).`);
}
if (meta.type !== "https://eips.ethereum.org/EIPS/eip-8004#registration-v1") fail("agent.json has the wrong \"type\".");
if (!meta.name || !meta.description) fail("agent.json needs a name and description.");

// ── Simulate + price it ──
const { request } = await client.simulateContract({ account, address: REGISTRY, abi, functionName: "register", args: [URI] });
const gas = await client.estimateContractGas({ account, address: REGISTRY, abi, functionName: "register", args: [URI] });
const gasPrice = await client.getGasPrice();
const cost = gas * gasPrice;
const balance = await client.getBalance({ address: account.address });
const enough = balance >= (cost * 3n) / 2n;

console.log(send ? "REAL REGISTRATION" : "DRY RUN (nothing will be sent)");
console.log(`  Network        : Celo mainnet (42220)`);
console.log(`  Registry       : ${REGISTRY}`);
console.log(`  Agent wallet   : ${account.address}`);
console.log(`  Agent file     : ${URI}  ("${meta.name}")`);
console.log(`  Attribution tag: ${code}`);
console.log(`  Estimated gas  : ${gas} units ~ ${formatEther(cost)} CELO`);
console.log(`  Wallet balance : ${formatEther(balance)} CELO  ->  ${enough ? "enough" : "NOT ENOUGH (need about 1.5x the estimate)"}`);

if (!send) {
  console.log("\nSimulation succeeded. Re-run with --send when the wallet is funded to register for real.");
  await new Promise((r) => setTimeout(r, 300));
  process.exit(enough ? 0 : 2);
}
if (!enough) fail("Wallet balance is too low. Send CELO on the Celo network to the agent wallet and retry. Nothing was sent.");

// ── Human approval of this exact transaction ──
const rl = createInterface({ input: process.stdin, output: process.stdout });
const answer = (await rl.question('\nThis sends a REAL Celo mainnet transaction and cannot be undone. Type "register" to continue: ')).trim();
rl.close();
if (answer !== "register") fail("Cancelled. Nothing was sent.");

// ── Send (tagged) ──
const wallet = celoWalletClient({ account, code });
const hash = await wallet.writeContract({ ...request });
console.log(`\nSubmitted: ${hash}\nWaiting for confirmation...`);
const receipt = await client.waitForTransactionReceipt({ hash });
if (receipt.status !== "success") fail(`Transaction ${hash} did not succeed (status: ${receipt.status}). No identity was created.`);

const [registered] = parseEventLogs({ abi, eventName: "Registered", logs: receipt.logs });
if (!registered) fail(`Transaction ${hash} succeeded but no Registered event was found. Check celoscan before retrying.`);
const agentId = registered.args.agentId.toString();

// Independent proof the tag is on the mined transaction.
const tag = await verifyTx({ client, hash });
const tagged = !!tag?.codes?.includes(code);

if (existsSync(".env.local")) appendFileSync(".env.local", `${readFileSync(".env.local", "utf8").endsWith("\n") ? "" : "\n"}ERC8004_AGENT_ID=${agentId}\n`);
appendFileSync("docs/hackathon/evidence.jsonl", JSON.stringify({
  at: new Date().toISOString(), track: "erc8004", task: "register agent identity", chainId: 42220,
  wallet: account.address, txHash: hash, agentId, registry: REGISTRY, attributionTagOnChain: tagged, eligibleToCount: tagged,
}) + "\n");

console.log("\nRegistered on Celo mainnet.");
console.log(`  agentId        : ${agentId}`);
console.log(`  transaction    : ${hash}   https://celoscan.io/tx/${hash}`);
console.log(`  tag on-chain   : ${tagged ? "YES (" + code + ")" : "NO - investigate before sending anything else"}`);
console.log(`  verify         : https://8004scan.io  (search ${account.address})`);
console.log("\nNext: add the agentId to the platform entry, then update public/agent.json with the registrations entry and call setAgentURI if the file URL changes.");
await new Promise((r) => setTimeout(r, 300));
process.exit(tagged ? 0 : 3);
