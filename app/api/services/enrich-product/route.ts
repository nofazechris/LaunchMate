import { NextResponse, type NextRequest } from "next/server";
import { z } from "zod";
import { getAiProvider } from "@/lib/ai";
import { gateAgentRequest } from "@/lib/self/gate";
import { paidHandler, X402ConfigError } from "@/lib/x402/paid-route";

const PATH = "/api/services/enrich-product";

const input = z.object({
  name: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(1000).optional(),
  category: z.string().trim().max(80).optional(),
});

const output = z.object({
  description: z.string().min(20).max(1200),
  suggestedCategory: z.string().max(80),
  missingFacts: z.array(z.string()).max(10),
});

/** The service itself. Runs only after Self + x402 both pass. */
async function enrich(req: NextRequest) {
  const parsed = input.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Invalid input" }, { status: 400 }); // < 400 rule: no charge
  const ai = getAiProvider();
  const { data } = await ai.generateStructuredOutput(
    [
      {
        role: "system",
        content:
          "You write truthful, persuasive ecommerce product copy. Use ONLY facts supplied. Never invent ingredients, certifications, medical claims, origin or warranties. List any important missing facts in missingFacts. Respond as JSON: {description, suggestedCategory, missingFacts[]}.",
      },
      { role: "user", content: JSON.stringify(parsed.data) },
    ],
    output,
  );
  return NextResponse.json(data);
}

export async function POST(req: NextRequest) {
  // 1. Who is asking? Self Agent ID decides. Unverified agents are denied and never see a price.
  const gate = await gateAgentRequest(req);
  if (!gate.ok) {
    console.info(JSON.stringify({ evt: "self_gate", decision: gate.decision, status: gate.status, error: gate.error }));
    return NextResponse.json({ decision: gate.decision, error: gate.error }, { status: gate.status });
  }

  // 2. Never ask for money for something we cannot deliver.
  try {
    getAiProvider();
  } catch {
    return NextResponse.json({ error: "Service temporarily unavailable" }, { status: 503 });
  }

  // 3. Verified agent: x402 payment is required, and settles only if the service succeeds.
  let paid;
  try {
    paid = paidHandler(PATH, enrich);
  } catch (e) {
    if (e instanceof X402ConfigError) return NextResponse.json({ error: "Payments are not configured" }, { status: 503 });
    throw e;
  }
  console.info(JSON.stringify({ evt: "self_verified", agentId: gate.agent.agentId }));
  return paid(req);
}
