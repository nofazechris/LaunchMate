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

import { normalizeDomain } from "../lib/domain.ts";

test("domain: cleans what sellers actually type", () => {
  assert.equal(normalizeDomain("mybrand.com"), "mybrand.com");
  assert.equal(normalizeDomain("  MyBrand.com.ng  "), "mybrand.com.ng");
  assert.equal(normalizeDomain("https://www.MyBrand.com/shop?x=1"), "mybrand.com");
  assert.equal(normalizeDomain("www.ada-clothing.store."), "ada-clothing.store");
  assert.equal(normalizeDomain("shop.mybrand.ng:8080"), "shop.mybrand.ng");
});

test("domain: refuses things that are not domains", () => {
  for (const bad of ["", "mybrand", "my brand.com", "-bad.com", "bad-.com", "a..com", "http://", "mybrand.c", "mybrand.123", "javascript:alert(1)", "x".repeat(300) + ".com", "under_score.com"]) {
    assert.equal(normalizeDomain(bad), null, `"${bad.slice(0, 30)}" should be refused`);
  }
});

import { lineTotal, makeOrderCode, mergeLines, normalizePhone, whatsappDigits } from "../lib/orders.ts";
import { createLimiter } from "../lib/rate-limit.ts";

test("orders: phone numbers are tidied for WhatsApp, junk is refused", () => {
  assert.equal(normalizePhone("0803 123 4567"), "+2348031234567");
  assert.equal(normalizePhone("+234 803-123-4567"), "+2348031234567");
  assert.equal(normalizePhone("2348031234567"), "+2348031234567");
  assert.equal(normalizePhone("(0803) 123 4567"), "+2348031234567");
  assert.equal(normalizePhone("+447911123456"), "+447911123456");
  for (const bad of ["", "abc", "123", "08031234", "+23480312345678901234", "0803 123 456x", "<script>"]) assert.equal(normalizePhone(bad), null, bad);
  assert.equal(whatsappDigits("+2348031234567"), "2348031234567");
});

test("orders: codes use only unambiguous characters", () => {
  let n = 0;
  const code = makeOrderCode(() => n++ % 32);
  assert.equal(code.length, 8);
  assert.match(code, /^[A-HJ-NP-Z2-9]{8}$/);
  const many = Array.from({ length: 200 }, () => makeOrderCode((k) => Math.floor(Math.random() * k)));
  assert.ok(many.every((c) => !/[01OI]/.test(c)));
  assert.equal(new Set(many).size, 200); // no collisions in a small sample
});

test("orders: totals are exact integers and repeated products merge and cap", () => {
  assert.equal(lineTotal(1850050, 3), 5550150);
  assert.deepEqual(mergeLines([{ productId: "a", quantity: 2 }, { productId: "b", quantity: 1 }, { productId: "a", quantity: 3 }]), [{ productId: "a", quantity: 5 }, { productId: "b", quantity: 1 }]);
  assert.deepEqual(mergeLines([{ productId: "a", quantity: 90 }, { productId: "a", quantity: 90 }]), [{ productId: "a", quantity: 99 }]);
});

test("rate limit: blocks after the limit, recovers after the window", () => {
  let t = 1000;
  const lim = createLimiter({ windowMs: 60_000, max: 3, now: () => t });
  assert.ok(lim.check("ip1").ok && lim.check("ip1").ok && lim.check("ip1").ok);
  const blocked = lim.check("ip1");
  assert.equal(blocked.ok, false);
  assert.ok(blocked.retryAfterMs > 0 && blocked.retryAfterMs <= 60_000);
  assert.ok(lim.check("ip2").ok, "other callers are unaffected");
  t += 61_000;
  assert.ok(lim.check("ip1").ok, "allowed again after the window");
});
