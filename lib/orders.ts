/** Pure helpers for customer orders. No I/O here, so they are easy to test. */

/**
 * Tidy a phone number as a customer might type it. Nigerian local numbers (0803…) become
 * international (+234803…) so the seller can open WhatsApp from it. Anything else must be 7–15
 * digits and is kept as typed. Returns null when it is not a plausible number.
 */
export function normalizePhone(raw: string): string | null {
  const d = raw.replace(/[\s().-]/g, "");
  if (!/^\+?\d{7,15}$/.test(d)) return null;
  if (/^0\d{10}$/.test(d)) return "+234" + d.slice(1);
  if (d.startsWith("0")) return null; // a leading 0 means a Nigerian local number, which is exactly 11 digits
  if (/^234\d{10}$/.test(d)) return "+" + d;
  return d;
}

/** Digits only, for wa.me links. */
export const whatsappDigits = (phone: string) => phone.replace(/\D/g, "");

/** Order codes avoid look-alike characters (no 0/O, 1/I). `rand(n)` must return an integer in [0, n). */
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
export function makeOrderCode(rand: (n: number) => number, length = 8): string {
  let out = "";
  for (let i = 0; i < length; i++) out += ALPHABET[rand(ALPHABET.length)];
  return out;
}

/** Whole minor units only. */
export function lineTotal(unitPriceMinor: number, quantity: number): number {
  return unitPriceMinor * quantity;
}

export interface OrderLine { productId: string; quantity: number }

/** Merge repeated products into one line and cap the quantity of each. */
export function mergeLines(lines: OrderLine[], maxPerLine = 99): OrderLine[] {
  const m = new Map<string, number>();
  for (const l of lines) m.set(l.productId, Math.min(maxPerLine, (m.get(l.productId) ?? 0) + l.quantity));
  return [...m].map(([productId, quantity]) => ({ productId, quantity }));
}
