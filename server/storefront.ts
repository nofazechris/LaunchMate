import "server-only";
import { cache } from "react";
import { headers } from "next/headers";
import { unstable_rethrow } from "next/navigation";
import { and, asc, desc, eq, isNotNull } from "drizzle-orm";
import { db } from "@/db";
import { businesses, productAssets, products } from "@/db/schema";
import { auth } from "@/lib/auth";
import { getBusinessForUser } from "@/server/business";

export const SLUG_RE = /^[a-z0-9][a-z0-9-]{0,58}$/;

/** The store behind a public address, or null. Cached per request. */
export const getStore = cache(async (slug: string) => {
  if (!SLUG_RE.test(slug)) return null;
  const [b] = await db.select().from(businesses).where(eq(businesses.slug, slug)).limit(1);
  return b ?? null;
});

export const isOpen = (b: { status: string }) => b.status === "live";

/** True when the person looking at the page is signed in as the owner of this store (so they can preview it before it opens). */
export const viewerOwns = cache(async (businessId: string): Promise<boolean> => {
  try {
    const session = await auth.api.getSession({ headers: await headers() });
    if (!session) return false;
    const mine = await getBusinessForUser(session.user.id);
    return mine?.id === businessId;
  } catch (e) {
    unstable_rethrow(e); // never swallow Next.js internals
    return false;
  }
});

/**
 * The store, but only if this visitor may see it: it is open, or they own it.
 * EVERY storefront page must call this before reading any product or order data. A layout cannot
 * do this job: Next.js still renders a page's data (and ships it in the response) when the layout
 * chooses not to show its children.
 */
export const getVisibleStore = cache(async (slug: string) => {
  const store = await getStore(slug);
  if (!store) return null;
  return isOpen(store) || (await viewerOwns(store.id)) ? store : null;
});

/** What customers can see: published products with a price. Newest first. */
export async function listPublished(businessId: string) {
  const rows = await db.select().from(products)
    .where(and(eq(products.businessId, businessId), eq(products.status, "published"), isNotNull(products.priceMinor)))
    .orderBy(desc(products.createdAt));
  const photos = rows.length
    ? await db.select({ id: productAssets.id, productId: productAssets.productId }).from(productAssets)
        .where(eq(productAssets.businessId, businessId)).orderBy(asc(productAssets.sortOrder), asc(productAssets.createdAt))
    : [];
  const byProduct = new Map<string, string[]>();
  for (const a of photos) if (a.productId) byProduct.set(a.productId, [...(byProduct.get(a.productId) ?? []), a.id]);
  return rows.map((p) => ({ ...p, photoIds: byProduct.get(p.id) ?? [] }));
}

export async function getPublished(businessId: string, productId: string) {
  const all = await listPublished(businessId);
  return all.find((p) => p.id === productId) ?? null;
}
