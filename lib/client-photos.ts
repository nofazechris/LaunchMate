"use client";

/**
 * Shrinks a photo in the browser before upload: max 1400px on the long side, re-encoded as JPEG.
 * Re-encoding through a canvas also drops EXIF data (such as GPS location) from the file.
 */
export async function resizeToJpeg(file: File, maxSide = 1400, quality = 0.82): Promise<Blob> {
  let bmp: ImageBitmap;
  try {
    bmp = await createImageBitmap(file);
  } catch {
    throw new Error("We can't read that photo. Use a JPG, PNG or WebP image.");
  }
  const scale = Math.min(1, maxSide / Math.max(bmp.width, bmp.height));
  const w = Math.max(1, Math.round(bmp.width * scale));
  const h = Math.max(1, Math.round(bmp.height * scale));
  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Your browser can't process photos here.");
  ctx.fillStyle = "#FFFFFF"; // PNGs with transparency become white, not black
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(bmp, 0, 0, w, h);
  bmp.close();
  const blob = await new Promise<Blob | null>((res) => canvas.toBlob(res, "image/jpeg", quality));
  if (!blob) throw new Error("We couldn't prepare that photo.");
  return blob;
}

/** Resize then upload one photo to a product. Throws the server's message on failure. */
export async function uploadProductPhoto(productId: string, file: File): Promise<{ id: string }> {
  const blob = await resizeToJpeg(file);
  const form = new FormData();
  form.append("file", new File([blob], "photo.jpg", { type: "image/jpeg" }));
  const res = await fetch(`/api/products/${productId}/images`, { method: "POST", body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error ?? "The photo could not be uploaded.");
  return data.asset;
}
