// Preload for `npm run test:live`: turns on the tests that talk to real services (Celo mainnet,
// Agent Vault) and loads .env.local if there is one. The default `npm test` never does this.
process.env.RUN_LIVE_TESTS = "1";
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local: tests that need a key will say so and skip
}
