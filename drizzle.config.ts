import { defineConfig } from "drizzle-kit";

// drizzle-kit does not read .env.local on its own; load it so `npm run db:migrate` just works.
try {
  process.loadEnvFile(".env.local");
} catch {
  // no .env.local (e.g. CI): rely on the real environment
}

const url = process.env.DATABASE_URL_UNPOOLED ?? process.env.DATABASE_URL ?? "";

export default defineConfig({
  schema: "./db/schema.ts",
  out: "./db/migrations",
  dialect: "postgresql",
  // Migrations use the direct (unpooled) Neon connection.
  dbCredentials: { url },
});
