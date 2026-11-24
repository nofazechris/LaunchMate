import "server-only";
import { sql } from "drizzle-orm";
import { db } from "@/db";

/**
 * Tells the sign-up / sign-in pages when the database is unreachable, so a broken backend is
 * visible instead of a form that silently fails. In production the wording is generic; in
 * development it names the missing setting.
 */
export async function dbNotice(): Promise<string | undefined> {
  if (!process.env.DATABASE_URL) {
    return process.env.NODE_ENV === "production"
      ? "Sign-up is temporarily unavailable. Please try again later."
      : "Database not connected: set DATABASE_URL in .env.local (Neon), then run `npm run db:migrate`.";
  }
  try {
    await Promise.race([db.execute(sql`select 1`), new Promise((_, rej) => setTimeout(() => rej(new Error("timeout")), 4000))]);
    return undefined;
  } catch (e) {
    console.error("database check failed", e instanceof Error ? e.message : e);
    return process.env.NODE_ENV === "production"
      ? "Sign-up is temporarily unavailable. Please try again later."
      : "Cannot reach the database. Check DATABASE_URL, and that the migration has been run (`npm run db:migrate`).";
  }
}
