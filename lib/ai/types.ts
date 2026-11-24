import type { z } from "zod";

/**
 * Provider-agnostic AI surface. The agent code talks only to this; adapters normalise
 * each vendor's differences. Capabilities not supported by a provider must throw
 * `AiCapabilityError` rather than silently degrade.
 */
export interface ChatMessage { role: "system" | "user" | "assistant"; content: string }

export interface AiUsage { inputTokens?: number; outputTokens?: number; durationMs: number }

export interface TextResult { text: string; usage: AiUsage }
export interface StructuredResult<T> { data: T; usage: AiUsage }

export interface AiProvider {
  readonly id: string;
  readonly model: string;
  generateResponse(messages: ChatMessage[]): Promise<TextResult>;
  generateStructuredOutput<T>(messages: ChatMessage[], schema: z.ZodType<T>): Promise<StructuredResult<T>>;
  // Declared now, implemented per provider when needed (and only after evaluation):
  // streamResponse, executeToolCall, analyseImage, transcribeAudio, generateEmbedding
}

export class AiCapabilityError extends Error {
  constructor(provider: string, capability: string) {
    super(`AI provider "${provider}" does not support ${capability}`);
  }
}
