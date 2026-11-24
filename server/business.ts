import "server-only";
import { and, eq } from "drizzle-orm";
import { db } from "@/db";
import { agentMemory, businessMembers, businesses } from "@/db/schema";

export const PROFILE_KEY = "onboarding_profile";

export interface OnboardingProfile {
  answers?: Record<string, string>;
  blueprint?: Record<string, string>;
}

/** The user's business (one per user for now), with the profile they entered during onboarding. */
export async function getBusinessForUser(userId: string) {
  const [row] = await db
    .select({ business: businesses, role: businessMembers.role })
    .from(businessMembers)
    .innerJoin(businesses, eq(businesses.id, businessMembers.businessId))
    .where(eq(businessMembers.userId, userId))
    .limit(1);
  if (!row) return null;

  const [mem] = await db
    .select({ value: agentMemory.value })
    .from(agentMemory)
    .where(and(eq(agentMemory.businessId, row.business.id), eq(agentMemory.key, PROFILE_KEY)))
    .limit(1);

  return { ...row.business, role: row.role, profile: (mem?.value ?? {}) as OnboardingProfile };
}
