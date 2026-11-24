import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { signInToSite, type SiteConfig } from "@/lib/agentvault/client";
import { requireOwnerToken } from "@/lib/agentvault/guard";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const siteSchema = z.object({
  loginUrl: z.string().url().startsWith("https://"),
  identifierSelector: z.string().min(1),
  passwordSelector: z.string().min(1),
  submitSelector: z.string().min(1),
  successSelector: z.string().min(1),
  failureSelector: z.string().min(1),
  identifier: z.enum(["email", "username"]),
  timeoutMs: z.number().int().min(3000).max(45000).optional(),
});

/** Signs in to the ONE site configured in config/agentvault-site.json. The caller cannot choose the site. */
export async function POST(req: Request) {
  const denied = requireOwnerToken(req);
  if (denied) return denied;

  let site: SiteConfig;
  try {
    const raw = JSON.parse(await readFile(path.join(process.cwd(), "config", "agentvault-site.json"), "utf8"));
    site = siteSchema.parse(raw);
  } catch {
    return Response.json({ error: "No valid config/agentvault-site.json. Copy the example and fill in your site's selectors." }, { status: 409 });
  }

  try {
    return Response.json(await signInToSite(site));
  } catch (e) {
    console.error("agentvault signin failed", e instanceof Error ? e.message : e);
    return Response.json({ error: "Sign-in could not be completed." }, { status: 502 });
  }
}
