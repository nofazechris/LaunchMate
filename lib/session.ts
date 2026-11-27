import "server-only";
import { headers } from "next/headers";
import { redirect, unstable_rethrow } from "next/navigation";
import { auth } from "@/lib/auth";

/**
 * Page guard for signed-in areas. Redirects to /signin when there is no session, and to
 * /signin?error=unavailable when sessions cannot be read at all (e.g. the database is down),
 * so a broken backend never looks like a logged-in user.
 */
export async function requireSession() {
  let session: Awaited<ReturnType<typeof auth.api.getSession>> | undefined;
  let failed = false;
  try {
    session = await auth.api.getSession({ headers: await headers() });
  } catch (e) {
    unstable_rethrow(e); // let Next.js internals (dynamic rendering, redirects) pass through
    failed = true;
    console.error("session lookup failed", e instanceof Error ? e.message : e);
  }
  if (failed) redirect("/signin?error=unavailable");
  if (!session) redirect("/signin");
  return session;
}
