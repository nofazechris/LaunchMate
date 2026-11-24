import { z } from "zod";
import type { AiProvider, ChatMessage } from "./types";

/**
 * Adapter for any OpenAI-compatible /chat/completions endpoint (OpenAI, and many hosted
 * open-model providers). STATUS: implemented, NOT yet tested against a live endpoint —
 * no AI credentials have been supplied and no provider has been chosen.
 */
export function openAiCompatible(opts: { id: string; baseUrl: string; apiKey: string; model: string }): AiProvider {
  async function call(messages: ChatMessage[], json: boolean) {
    const started = Date.now();
    const res = await fetch(`${opts.baseUrl.replace(/\/$/, "")}/chat/completions`, {
      method: "POST",
      headers: { "content-type": "application/json", authorization: `Bearer ${opts.apiKey}` },
      body: JSON.stringify({ model: opts.model, messages, ...(json ? { response_format: { type: "json_object" } } : {}) }),
    });
    if (!res.ok) throw new Error(`AI provider ${opts.id} responded ${res.status}`);
    const body = (await res.json()) as {
      choices: { message: { content: string } }[];
      usage?: { prompt_tokens?: number; completion_tokens?: number };
    };
    return {
      text: body.choices[0]?.message?.content ?? "",
      usage: { inputTokens: body.usage?.prompt_tokens, outputTokens: body.usage?.completion_tokens, durationMs: Date.now() - started },
    };
  }

  return {
    id: opts.id,
    model: opts.model,
    generateResponse: (messages) => call(messages, false),
    async generateStructuredOutput<T>(messages: ChatMessage[], schema: z.ZodType<T>) {
      const { text, usage } = await call(messages, true);
      // Never trust model output: it must pass the schema or the call fails.
      return { data: schema.parse(JSON.parse(text)), usage };
    },
  };
}
