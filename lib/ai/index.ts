import "server-only";
import { openAiCompatible } from "./openai-compatible";
import type { AiProvider } from "./types";

export * from "./types";

/**
 * Resolve the configured provider. Swapping models is an env change (AI_PROVIDER / AI_MODEL),
 * not a code change. Add adapters here as providers are evaluated.
 */
export function getAiProvider(): AiProvider {
  const provider = process.env.AI_PROVIDER;
  const model = process.env.AI_MODEL;
  if (!provider || !model) throw new Error("AI is not configured: set AI_PROVIDER and AI_MODEL (see .env.example)");

  switch (provider) {
    case "openai-compatible": {
      const baseUrl = process.env.AI_BASE_URL;
      const apiKey = process.env.AI_API_KEY;
      if (!baseUrl || !apiKey) throw new Error("AI_BASE_URL and AI_API_KEY are required for openai-compatible");
      return openAiCompatible({ id: provider, baseUrl, apiKey, model });
    }
    default:
      throw new Error(`Unknown AI_PROVIDER "${provider}"`);
  }
}
