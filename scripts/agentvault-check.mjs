// Read-only check that Launchmate can reach Agent Vault with your API key.
//
//   npm run av:check
//
// Uses listTokens() only: no browser is opened, nothing is filled, nothing is paid.
// The API key is read from the environment (.env.local) and never printed. The catalog contains
// mock tokens only; we print counts and the websites of stored logins, no token values.
import { listTokens, SelfAgentPayError } from "@agentvault/playwright";

const need = ["SELF_AGENT_PAY_API_KEY", "SELF_AGENT_PAY_PROXY_URL", "SELF_AGENT_PAY_API_URL"];
const missing = need.filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing in .env.local: ${missing.join(", ")}`);
  console.error("See .env.example. Paste the key into .env.local yourself; never into chat.");
  process.exit(1);
}

try {
  const c = await listTokens();
  console.log("Connected to Agent Vault.");
  console.log(`  Cards visible to this key : ${c.cards.length}`);
  console.log(`  Addresses / identities    : ${c.addresses.length} / ${c.identity.length}`);
  console.log(`  Stored logins             : ${c.logins.length}`);
  for (const l of c.logins) {
    console.log(`    - ${l.website ?? l.label}${l.hasTotp ? " (2FA)" : ""}${l.hasEmail ? "" : " (no email on file)"}`);
  }
  if (c.wallets?.length) {
    for (const w of c.wallets) {
      console.log(`  Agent wallet              : ${w.name} on ${w.network}, tokens: ${w.tokens.join(", ")}${w.ungoverned ? "  [NO spending limits yet]" : ""}`);
    }
  } else {
    console.log("  Agent wallet              : not available to this key");
    if (c.walletNote) console.log(`    ${c.walletNote}`);
  }
} catch (e) {
  if (e instanceof SelfAgentPayError) {
    console.error(`Agent Vault refused: ${e.code ?? "error"} - ${e.message}`);
  } else {
    console.error("Could not reach Agent Vault:", e?.message ?? e);
  }
  process.exit(1);
}
// Let open handles drain before exiting (avoids a harmless libuv assertion on Windows).
await new Promise((r) => setTimeout(r, 300));
process.exit(0);
