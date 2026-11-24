/**
 * Turns whatever a seller types ("https://www.MyBrand.com.ng/shop", "mybrand.com ") into a plain
 * domain name, or null when it isn't a valid one. Pure, so it is easy to test.
 */
export function normalizeDomain(input: string): string | null {
  let d = input.trim().toLowerCase();
  d = d.replace(/^[a-z][a-z0-9+.-]*:\/\//, ""); // protocol
  d = d.replace(/[/?#].*$/, ""); // path, query, fragment
  d = d.replace(/:\d+$/, ""); // port
  d = d.replace(/^www\./, "").replace(/\.+$/, "");
  if (d.length < 4 || d.length > 253) return null;
  // one or more labels (letters, digits, inner hyphens) and an alphabetic top-level domain
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,24}$/.test(d)) return null;
  return d;
}
