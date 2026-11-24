import assert from "node:assert/strict";
import { test } from "node:test";
import { formatMinor, minorToInput, parseMajorToMinor } from "../lib/money.ts";
import { sniffImage } from "../lib/images.ts";

test("money: parses typed naira into exact kobo, never via floats", () => {
  assert.equal(parseMajorToMinor("18500"), 1850000);
  assert.equal(parseMajorToMinor("18,500"), 1850000);
  assert.equal(parseMajorToMinor("₦18,500.50"), 1850050);
  assert.equal(parseMajorToMinor("0.1"), 10);
  assert.equal(parseMajorToMinor("0.07"), 7);
  assert.equal(parseMajorToMinor("19.99"), 1999); // the classic float trap
  assert.equal(parseMajorToMinor("1.15"), 115);
});

test("money: refuses anything unclear", () => {
  for (const bad of ["", "abc", "-5", "1.234", "1e3", "12.", ".5", "1,2,3x", "9999999999"]) {
    assert.equal(parseMajorToMinor(bad), null, `"${bad}" should be refused`);
  }
});

test("money: formats and round-trips for editing", () => {
  assert.equal(formatMinor(1850050), "₦18,500.50");
  assert.equal(formatMinor(1850000), "₦18,500");
  assert.equal(formatMinor(5), "₦0.05");
  assert.equal(formatMinor(100, "USD"), "$1");
  assert.equal(formatMinor(null), "No price");
  assert.equal(minorToInput(1850050), "18500.50");
  assert.equal(minorToInput(1850000), "18500");
  assert.equal(parseMajorToMinor(minorToInput(1999)), 1999);
});

const pad = (b: number[]) => new Uint8Array([...b, ...new Array(16).fill(0)]);

test("images: identifies real formats from bytes, not from the claimed type", () => {
  assert.equal(sniffImage(pad([0xff, 0xd8, 0xff, 0xe0])), "image/jpeg");
  assert.equal(sniffImage(pad([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])), "image/png");
  const webp = new Uint8Array([0x52, 0x49, 0x46, 0x46, 0, 0, 0, 0, 0x57, 0x45, 0x42, 0x50, 0, 0, 0, 0]);
  assert.equal(sniffImage(webp), "image/webp");
});

test("images: refuses SVG, GIF, HTML, scripts and truncated files", () => {
  const enc = (s: string) => new TextEncoder().encode(s + " ".repeat(16));
  assert.equal(sniffImage(enc("<svg xmlns='http://www.w3.org/2000/svg'><script>alert(1)</script></svg>")), null);
  assert.equal(sniffImage(enc("GIF89a....")), null);
  assert.equal(sniffImage(enc("<html><script>alert(1)</script>")), null);
  assert.equal(sniffImage(new Uint8Array([0xff, 0xd8])), null);
  assert.equal(sniffImage(new Uint8Array(0)), null);
});
