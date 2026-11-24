import type { CSSProperties } from "react";

/**
 * Turns a CSS declaration string ("display:flex;gap:8px") into a React style
 * object. Keeps the markup close to the original design while staying typed.
 */
export function css(src: string): CSSProperties {
  const out: Record<string, string> = {};
  for (const decl of src.split(";")) {
    const i = decl.indexOf(":");
    if (i < 0) continue;
    const prop = decl.slice(0, i).trim();
    const val = decl.slice(i + 1).trim();
    if (!prop || !val) continue;
    const key = prop.startsWith("--")
      ? prop
      : prop.replace(/^-/, "").replace(/-([a-z])/g, (_, c: string) => c.toUpperCase());
    out[key.startsWith("webkit") || key.startsWith("moz") ? key[0].toUpperCase() + key.slice(1) : key] = val;
  }
  return out as CSSProperties;
}
