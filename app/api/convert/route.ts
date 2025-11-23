import JSZip from "jszip";
import sharp from "sharp";
import convert from "heic-convert";
import { ALLOWED_EXTENSIONS, MAX_FILES, sanitizeFilename } from "@/lib/sanitizeFilename";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

function getExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const baseName = sanitizeFilename(formData.get("base_name")?.toString());
    const files = formData.getAll("files") as File[];
    const fileIndexOverride = Number(formData.get("file_index"));

    if (!files.length) {
      return Response.json({ error: "no_file" }, { status: 400 });
    }

    if (files.length > MAX_FILES) {
      return Response.json({ error: "too_many_files" }, { status: 400 });
    }

    const converted: Array<{ name: string; buffer: Buffer }> = [];

    for (let index = 0; index < files.length; index += 1) {
      const file = files[index];
      const extension = getExtension(file.name);

      if (!ALLOWED_EXTENSIONS.has(extension)) {
        return Response.json({ error: "unsupported_file" }, { status: 400 });
      }

      const arrayBuffer = await file.arrayBuffer();
      let inputBuffer = Buffer.from(arrayBuffer);

      // Convert HEIC/HEIF to JPEG first, as sharp doesn't support HEIC natively
      if (extension === "heic" || extension === "heif") {
        const jpegBuffer = await convert({
          buffer: inputBuffer,
          format: "JPEG",
          quality: 1,
        });
        inputBuffer = Buffer.from(jpegBuffer);
      }

      const webpBuffer = await sharp(inputBuffer, { failOn: "none", animated: true })
        .rotate()
        .webp({ quality: 90, effort: 4, smartSubsample: true, nearLossless: false, alphaQuality: 90, animated: true })
        .toBuffer();

      const ordinal =
        Number.isFinite(fileIndexOverride) && files.length === 1
          ? Math.max(1, Math.trunc(fileIndexOverride))
          : index + 1;

      converted.push({
        name: `${baseName}_${ordinal}.webp`,
        buffer: webpBuffer,
      });
    }

    if (!converted.length) {
      return Response.json({ error: "no_valid_files" }, { status: 400 });
    }

    if (converted.length === 1) {
      const [single] = converted;
      const body = single.buffer.buffer.slice(
        single.buffer.byteOffset,
        single.buffer.byteOffset + single.buffer.byteLength
      ) as ArrayBuffer;

      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": "image/webp",
          "Content-Disposition": `attachment; filename="${single.name}"`,
          "Cache-Control": "no-store",
        },
      });
    }

    const zip = new JSZip();
    converted.forEach((file) => {
      zip.file(file.name, file.buffer);
    });

    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });
    const zipBody = zipBuffer.buffer.slice(
      zipBuffer.byteOffset,
      zipBuffer.byteOffset + zipBuffer.byteLength
    ) as ArrayBuffer;

    return new Response(zipBody, {
      status: 200,
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${baseName}_webp.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/convert] error", error);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
