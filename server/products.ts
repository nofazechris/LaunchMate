import "server-only";
import { z } from "zod";
import { HttpError, requireUser } from "@/server/authz";
import { getBusinessForUser } from "@/server/business";
import { parseMajorToMinor } from "@/lib/money";

/**
 * Every product route starts here. It resolves the signed-in user's OWN business, and every
 * query after it filters by that business id. A product id from another business simply
 * isn't found (404), so ids can't be probed.
 */
export async function requireOwnBusiness() {
  const user = await requireUser();
  const business = await getBusinessForUser(user.id);
  if (!business) throw new HttpError(409, "Create your business first");
  return { user, business };
}

export const idSchema = z.string().uuid();
export function parseId(raw: string): string {
  const r = idSchema.safeParse(raw);
  if (!r.success) throw new HttpError(404, "Not found");
  return r.data;
}

/** Fields the owner can edit. Stock is deliberately NOT here: it only changes through movements. */
export const productFields = z.object({
  name: z.string().trim().min(2, "Give the product a name").max(120),
  description: z.string().trim().max(2000).optional(),
  category: z.string().trim().max(80).optional(),
  productType: z.enum(["physical", "digital"]).optional(),
  /** Price in major units as typed ("18,500.50"). Empty means no price yet. */
  price: z.string().trim().max(20).optional(),
  sku: z.string().trim().max(40).optional(),
  lowStockThreshold: z.number().int().min(0).max(100000).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
});

/** Turns the typed price into integer minor units: undefined = not provided, null = cleared. */
export function priceToMinor(price: string | undefined): number | null | undefined {
  if (price === undefined) return undefined;
  if (price === "") return null;
  const minor = parseMajorToMinor(price);
  if (minor === null) throw new HttpError(400, "Enter the price as a number, for example 18500 or 18,500.50");
  return minor;
}

export function assertPublishable(status: string | undefined, priceMinor: number | null | undefined, name: string | undefined) {
  if (status === "published" && (priceMinor === null || priceMinor === undefined)) {
    throw new HttpError(400, "Add a price before publishing");
  }
  if (status === "published" && !name) throw new HttpError(400, "Add a name before publishing");
}
