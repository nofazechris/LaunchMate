import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "./schema";

// NOTE: no `server-only` import here so the Better Auth CLI can load this module.
// Never import this file from a client component.

/**
 * Pooled Neon connection (WebSocket driver, so real transactions work: stock
 * reservation, order creation, etc.). Migrations use DATABASE_URL_UNPOOLED.
 * The pool connects lazily, so a missing DATABASE_URL does not break `next build`.
 */
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

export const db = drizzle(pool, { schema });
export type Db = typeof db;
export type Tx = Parameters<Parameters<Db["transaction"]>[0]>[0];
