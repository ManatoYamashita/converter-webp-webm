import JSZip from "jszip";
import sharp from "sharp";
import ffmpeg from "fluent-ffmpeg";
import heicConvert from "heic-convert";
import { ALLOWED_EXTENSIONS, MAX_FILES, sanitizeFilename } from "@/lib/sanitizeFilename";
import { writeFile, unlink } from "fs/promises";
import { tmpdir } from "os";
import { join } from "path";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const ffmpegBinary = process.env.FFMPEG_PATH;

if (ffmpegBinary) {
  ffmpeg.setFfmpegPath(ffmpegBinary);
}

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "mkv", "avi", "webm", "m4v"]);
const HEIC_EXTENSIONS = new Set(["heic", "heif"]);

function getExtension(name: string): string {
  const parts = name.split(".");
  return parts.length > 1 ? parts.pop()!.toLowerCase() : "";
}

function isVideoExtension(extension: string): boolean {
  return VIDEO_EXTENSIONS.has(extension);
}

function isHeicExtension(extension: string): boolean {
  return HEIC_EXTENSIONS.has(extension);
}

async function convertVideoToWebM(inputBuffer: Buffer): Promise<Buffer> {
  const tempInputPath = join(tmpdir(), `input-${Date.now()}-${Math.random().toString(36).slice(2)}`);
  const tempOutputPath = join(tmpdir(), `output-${Date.now()}-${Math.random().toString(36).slice(2)}.webm`);

  try {
    await writeFile(tempInputPath, inputBuffer);

    await new Promise<void>((resolve, reject) => {
      ffmpeg(tempInputPath)
        .videoCodec("libvpx-vp9")
        .audioCodec("libopus")
        .outputOptions([
          "-crf 30",
          "-b:v 0",
          "-b:a 128k",
          "-cpu-used 2",
        ])
        .output(tempOutputPath)
        .on("end", () => resolve())
        .on("error", (err) => reject(err))
        .run();
    });

    const { readFile } = await import("fs/promises");
    const outputBuffer = await readFile(tempOutputPath);
    return Buffer.from(outputBuffer);
  } finally {
    try {
      await unlink(tempInputPath);
    } catch {
      // Ignore cleanup errors
    }
    try {
      await unlink(tempOutputPath);
    } catch {
      // Ignore cleanup errors
    }
  }
}

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const baseName = sanitizeFilename(formData.get("base_name")?.toString());
    const files = formData.getAll("files") as File[];
    const fileIndexOverride = Number(formData.get("file_index"));
    const imageFormat = (formData.get("image_format")?.toString() || "webp") as "webp" | "jpg";
    const imageQuality = Math.min(100, Math.max(70, Number(formData.get("image_quality")) || 90));

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

      const isVideoFile = isVideoExtension(extension) || file.type.startsWith("video/");

      if (!ALLOWED_EXTENSIONS.has(extension) && !isVideoFile) {
        continue;
      }

      const arrayBuffer = await file.arrayBuffer();
      const inputBuffer = Buffer.from(arrayBuffer);

      const ordinal =
        Number.isFinite(fileIndexOverride) && files.length === 1
          ? Math.max(1, Math.trunc(fileIndexOverride))
          : index + 1;

      if (isVideoFile) {
        const webmBuffer = await convertVideoToWebM(inputBuffer);
        converted.push({
          name: `${baseName}_${ordinal}.webm`,
          buffer: webmBuffer,
        });
      } else {
        let processBuffer = inputBuffer;

        if (isHeicExtension(extension)) {
          const jpegBuffer = await heicConvert({
            buffer: inputBuffer,
            format: "JPEG",
            quality: 1,
          });
          processBuffer = Buffer.from(jpegBuffer);
        }

        let outputBuffer: Buffer;

        if (imageFormat === "jpg") {
          outputBuffer = await sharp(processBuffer, { failOn: "none" })
            .rotate()
            .jpeg({ quality: imageQuality })
            .toBuffer();
        } else {
          outputBuffer = await sharp(processBuffer, { failOn: "none" })
            .rotate()
            .webp({ quality: imageQuality })
            .toBuffer();
        }

        converted.push({
          name: `${baseName}_${ordinal}.${imageFormat === "jpg" ? "jpg" : "webp"}`,
          buffer: outputBuffer,
        });
      }
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

      const contentType = single.name.endsWith(".webm")
        ? "video/webm"
        : single.name.endsWith(".jpg")
        ? "image/jpeg"
        : "image/webp";

      return new Response(body, {
        status: 200,
        headers: {
          "Content-Type": contentType,
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
        "Content-Disposition": `attachment; filename="${baseName}_converted.zip"`,
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    console.error("[api/convert] error", error);
    return Response.json({ error: "internal_error" }, { status: 500 });
  }
}
