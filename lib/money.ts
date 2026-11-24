/**
 * Money is stored as an integer count of MINOR units (kobo/cents). We never do arithmetic on
 * floats: a typed amount like "1,250.50" is parsed from its digits into whole minor units.
 */

/** "18500", "18,500", "18500.5", "₦18,500.50" -> 1850050. Returns null for anything unclear. */
export function parseMajorToMinor(input: string): number | null {
  const cleaned = input.replace(/[₦$,\s]/g, "");
  const m = /^(\d{1,9})(?:\.(\d{1,2}))?$/.exec(cleaned);
  if (!m) return null;
  const whole = Number(m[1]);
  const frac = Number((m[2] ?? "").padEnd(2, "0") || "0");
  return whole * 100 + frac;
}

/** 1850050 + "NGN" -> "₦18,500.50". Display only: never feed this back into calculations. */
export function formatMinor(minor: number | null | undefined, currency = "NGN"): string {
  if (minor === null || minor === undefined) return "No price";
  const whole = Math.trunc(minor / 100);
  const frac = String(minor % 100).padStart(2, "0");
  const sym = currency === "NGN" ? "₦" : currency === "USD" ? "$" : currency + " ";
  const grouped = String(whole).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return `${sym}${grouped}${frac === "00" ? "" : "." + frac}`;
}

/** 1850050 -> "18500.50" for editing in a form field. */
export function minorToInput(minor: number | null | undefined): string {
  if (minor === null || minor === undefined) return "";
  const frac = minor % 100;
  return frac === 0 ? String(Math.trunc(minor / 100)) : `${Math.trunc(minor / 100)}.${String(frac).padStart(2, "0")}`;
}
