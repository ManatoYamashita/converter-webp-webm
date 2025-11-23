const ILLEGAL_CHARS = /[<>:"/\\|?*\x00-\x1f]/g;

export function sanitizeFilename(input: string | null | undefined): string {
  const base = (input ?? "").trim();
  if (!base) return "image";

  const cleaned = base.replace(ILLEGAL_CHARS, "").replace(/\s+/g, " ").trim();
  return cleaned.length > 0 ? cleaned : "image";
}

export const ALLOWED_EXTENSIONS = new Set([
  "jpg",
  "jpeg",
  "png",
  "svg",
  "heic",
  "heif",
  "avif",
  "tif",
  "tiff",
  "bmp",
  "gif",
  "mp4",
  "mov",
  "mkv",
  "avi",
  "webm",
  "m4v",
]);
export const MAX_FILES = 25;
export const MAX_FILE_SIZE_BYTES = 20 * 1024 * 1024;
