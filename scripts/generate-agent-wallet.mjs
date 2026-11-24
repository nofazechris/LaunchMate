// Generates the Launchmate agent wallet on YOUR machine.
//
//   npm run wallet:generate            -> appends to .env.local
//   npm run wallet:generate -- <file>  -> appends to another env file
//
// The private key is written to the env file and NEVER printed. Only the public
// address is shown. Do not paste the key into chat, an issue, or a commit. .env.local
// is gitignored. Back the key up somewhere safe (password manager): if it is lost,
// the wallet and its ERC-8004 identity are lost.
import { existsSync, readFileSync, appendFileSync } from "node:fs";
import { generatePrivateKey, privateKeyToAccount } from "viem/accounts";

const target = process.argv[2] ?? ".env.local";

if (existsSync(target) && /^AGENT_PRIVATE_KEY=./m.test(readFileSync(target, "utf8"))) {
  console.error(`Refusing to overwrite: ${target} already contains AGENT_PRIVATE_KEY.`);
  console.error("Delete that line yourself first if you really want a new wallet (you will lose the old one).");
  process.exit(1);
}

const key = generatePrivateKey();
const account = privateKeyToAccount(key);

const prefix = existsSync(target) && !readFileSync(target, "utf8").endsWith("\n") ? "\n" : "";
appendFileSync(target, `${prefix}AGENT_PRIVATE_KEY=${key}\nAGENT_WALLET_ADDRESS=${account.address}\n`, { mode: 0o600 });

console.log("Agent wallet created.");
console.log(`  Public address : ${account.address}`);
console.log(`  Saved to       : ${target} (AGENT_PRIVATE_KEY + AGENT_WALLET_ADDRESS)`);
console.log("");
console.log("Next: back up AGENT_PRIVATE_KEY, then send a small amount of CELO to the address above (Celo mainnet).");
console.log("Never share the private key. The public address is safe to share.");
