// Camera photos (often 4–10 MB) are too big for email and for upload limits.
// Resize + recompress in the browser before uploading. Small files and GIFs pass through unchanged.

const MAX_DIRECT_BYTES = 1024 * 1024; // 1 MB: no need to touch smaller files
const MAX_EDGE = 1600; // longest side in px; email content is ~640px wide, this keeps sharp retina quality
const JPEG_QUALITY = 0.85;

export async function prepareEmailImage(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.type === "image/gif") return file;
  if (file.size <= MAX_DIRECT_BYTES) return file;

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const width = Math.max(1, Math.round(bitmap.width * scale));
  const height = Math.max(1, Math.round(bitmap.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext("2d");
  if (!ctx) {
    bitmap.close();
    return file;
  }

  // PNG keeps transparency (logos); everything else becomes JPEG on a white background.
  const keepPng = file.type === "image/png";
  if (!keepPng) {
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, width, height);
  }
  ctx.drawImage(bitmap, 0, 0, width, height);
  bitmap.close();

  const outType = keepPng ? "image/png" : "image/jpeg";
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, outType, JPEG_QUALITY),
  );
  if (!blob || blob.size >= file.size) return file;

  const base = file.name.replace(/\.[^.]+$/, "") || "image";
  return new File([blob], `${base}.${keepPng ? "png" : "jpg"}`, { type: outType });
}
