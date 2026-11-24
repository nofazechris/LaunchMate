import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { nextCookies } from "better-auth/next-js";
import { db } from "@/db";

// Better Auth backed by Neon (via Drizzle). No Supabase Auth.
// NOTE: no `server-only` import so the Better Auth CLI can load this file.
export const auth = betterAuth({
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: { enabled: true, minPasswordLength: 8 },
  // Email verification / password-reset mail needs an email provider (see .env.example).
  plugins: [nextCookies()],
});
