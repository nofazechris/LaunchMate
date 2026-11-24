/** Upload rules for product photos. The browser resizes first; the server re-checks everything. */
export const MAX_IMAGE_BYTES = 2 * 1024 * 1024;
export const MAX_IMAGES_PER_PRODUCT = 6;

export type ImageMime = "image/jpeg" | "image/png" | "image/webp";

/**
 * Identify an image from its first bytes, ignoring whatever the client claimed. Only
 * JPEG, PNG and WebP are accepted: no SVG (can carry scripts), no GIF, no unknown formats.
 */
export function sniffImage(buf: Uint8Array): ImageMime | null {
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 && buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return "image/png";
  const riff = String.fromCharCode(buf[0], buf[1], buf[2], buf[3]) === "RIFF";
  const webp = String.fromCharCode(buf[8], buf[9], buf[10], buf[11]) === "WEBP";
  if (riff && webp) return "image/webp";
  return null;
}
