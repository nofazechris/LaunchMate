import "server-only";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/db";
import { businessMembers } from "@/db/schema";

export class HttpError extends Error {
  constructor(public status: number, message: string) { super(message); }
}

type Role = "owner" | "admin" | "staff";
const RANK: Record<Role, number> = { staff: 1, admin: 2, owner: 3 };

export async function requireUser() {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session) throw new HttpError(401, "Not signed in");
  return session.user;
}

/**
 * Every business-scoped operation goes through this. Knowing a business UUID grants nothing:
 * the user must be a member with at least `minRole`. Returns 404 (not 403) to non-members so
 * business IDs cannot be probed.
 */
export async function requireBusinessAccess(businessId: string, minRole: Role = "staff") {
  const user = await requireUser();
  const [m] = await db
    .select({ role: businessMembers.role })
    .from(businessMembers)
    .where(and(eq(businessMembers.businessId, businessId), eq(businessMembers.userId, user.id)))
    .limit(1);
  if (!m) throw new HttpError(404, "Business not found");
  if (RANK[m.role] < RANK[minRole]) throw new HttpError(403, "Insufficient permissions");
  return { user, role: m.role };
}

export function errorResponse(e: unknown) {
  if (e instanceof HttpError) return Response.json({ error: e.message }, { status: e.status });
  console.error(e);
  return Response.json({ error: "Internal error" }, { status: 500 });
}
