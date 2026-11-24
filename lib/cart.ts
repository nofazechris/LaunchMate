/**
 * The visitor's cart lives in their own browser (per store), as product ids and quantities only.
 * Names and prices are never stored here: they are fetched fresh from the store when needed.
 */
export interface CartLine { productId: string; quantity: number }

const key = (slug: string) => `lm-cart:${slug}`;

export function readCart(slug: string): CartLine[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(key(slug)) ?? "[]");
    if (!Array.isArray(raw)) return [];
    return raw
      .filter((l) => l && typeof l.productId === "string" && Number.isInteger(l.quantity) && l.quantity > 0)
      .slice(0, 30)
      .map((l) => ({ productId: l.productId, quantity: Math.min(99, l.quantity) }));
  } catch {
    return [];
  }
}

export function writeCart(slug: string, lines: CartLine[]) {
  localStorage.setItem(key(slug), JSON.stringify(lines));
  window.dispatchEvent(new Event("lm-cart"));
}

export function addToCart(slug: string, productId: string, quantity: number) {
  const lines = readCart(slug);
  const hit = lines.find((l) => l.productId === productId);
  if (hit) hit.quantity = Math.min(99, hit.quantity + quantity);
  else lines.push({ productId, quantity: Math.min(99, quantity) });
  writeCart(slug, lines);
}

export const cartCount = (lines: CartLine[]) => lines.reduce((n, l) => n + l.quantity, 0);
