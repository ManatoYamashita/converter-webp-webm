"use client";

import { useEffect, useRef, useState } from "react";
import Sortable, { SortableEvent } from "sortablejs";
import { X, Upload, Trash2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { AppHeader } from "@/components/AppHeader";
import { UploadDropzone } from "@/components/UploadDropzone";
import { ProgressPanel } from "@/components/ProgressPanel";
import { SelectedFiles } from "@/components/SelectedFiles";
import { StickyConvertButton } from "@/components/StickyConvertButton";
import { FloatingUploader } from "@/components/FloatingUploader";
import { FileItem } from "@/components/types";
import { ALLOWED_EXTENSIONS, MAX_FILES, sanitizeFilename } from "@/lib/sanitizeFilename";

const SITE_URL = "https://webplyzer.app";
const SUPPORTED_FORMATS_LABEL =
  "JPG / JPEG / PNG / AVIF / SVG / HEIC / HEIF / TIFF / BMP / GIF / MP4 / MOV / MKV / AVI / WEBM / M4V";
const ACCEPT_TYPES =
  ".jpg,.jpeg,.png,.avif,.svg,.heic,.heif,.tif,.tiff,.bmp,.gif,.mp4,.mov,.mkv,.avi,.webm,.m4v";

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function reorderList<T>(list: T[], fromIndex: number, toIndex: number): T[] {
  if (fromIndex === toIndex) return list;
  const updated = [...list];
  const [moved] = updated.splice(fromIndex, 1);
  if (!moved) return list;
  updated.splice(toIndex, 0, moved);
  return updated;
}

async function downloadMultiple(
  files: Array<{ blob: Blob; name: string }>,
  zipName: string
): Promise<void> {
  const { default: JSZip } = await import("jszip");
  const zip = new JSZip();
  files.forEach(({ blob, name }) => zip.file(name, blob));
  const blob = await zip.generateAsync({ type: "blob" });
  downloadBlob(blob, zipName);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function resolveErrorMessage(code: string | undefined): string {
  switch (code) {
    case "no_file":
      return "No files selected";
    case "too_many_files":
      return "Error: You can upload up to 25 files";
    case "no_valid_files":
      return "Conversion failed. Please try again.";
    case "unsupported_file":
      return "Only JPG, JPEG, PNG, AVIF, SVG, HEIC, HEIF, TIFF, BMP, GIF, MP4, MOV, MKV, AVI, WEBM, M4V files are supported.";
    default:
      return "Conversion failed. Please try again.";
  }
}

export default function HomePage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [baseName, setBaseName] = useState("image");
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [isUploaderVisible, setIsUploaderVisible] = useState(true);
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const dragDepthRef = useRef(0);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Webplyzer",
      url: SITE_URL,
      description:
        "Convert JPG, JPEG, PNG, AVIF, SVG, HEIC images to WebP and MP4, MOV, MKV, AVI, WEBM, M4V to WebM with drag-and-drop, reordering, and sequential naming.",
      potentialAction: {
        "@type": "Action",
        name: "Convert media to WebP/WebM",
        target: `${SITE_URL}/?action=convert`,
      },
      inLanguage: "en",
      publisher: {
        "@type": "Organization",
        name: "Webplyzer",
        url: SITE_URL,
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "SoftwareApplication",
      name: "Webplyzer",
      applicationCategory: "MultimediaApplication",
      operatingSystem: "Any",
      offers: {
        "@type": "Offer",
        price: "0",
        priceCurrency: "USD",
      },
      url: SITE_URL,
      description:
        "Batch convert images to WebP and videos to WebM, maintain order, and export as ZIP for web performance optimization.",
    },
  ];

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const dropRef = useRef<HTMLLabelElement | null>(null);
  const galleryRef = useRef<HTMLDivElement | null>(null);
  const sortableRef = useRef<Sortable | null>(null);
  const itemsRef = useRef<FileItem[]>([]);

  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  useEffect(() => {
    const el = galleryRef.current;

    if (!el || items.length === 0) {
      sortableRef.current?.destroy();
      sortableRef.current = null;
      return;
    }

    sortableRef.current?.destroy();
    sortableRef.current = Sortable.create(el, {
      animation: 200,
      handle: ".js-drag-handle",
      easing: "cubic-bezier(0.4, 0, 0.2, 1)",
      onEnd: (event: SortableEvent) => {
        const { oldIndex, newIndex } = event;
        if (
          typeof oldIndex !== "number" ||
          typeof newIndex !== "number" ||
          oldIndex === newIndex
        ) {
          return;
        }
        setItems((prev) => reorderList(prev, oldIndex, newIndex));
      },
    });

    return () => {
      sortableRef.current?.destroy();
      sortableRef.current = null;
    };
  }, [items.length]);

  useEffect(() => {
    return () => {
      itemsRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      sortableRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    const handleDragOver = (event: DragEvent) => {
      event.preventDefault();
    };
    const handleDragEnter = (event: DragEvent) => {
      event.preventDefault();
      dragDepthRef.current += 1;
      setIsDropActive(true);
    };
    const handleDragLeave = (event: DragEvent) => {
      event.preventDefault();
      dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
      if (dragDepthRef.current === 0) {
        setIsDropActive(false);
      }
    };
    const handleDrop = (event: DragEvent) => {
      event.preventDefault();
      dragDepthRef.current = 0;
      setIsDropActive(false);
      if (event.dataTransfer?.files?.length) {
        handleFilesAdded(event.dataTransfer.files);
      }
    };

    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("drop", handleDrop);
    };
  }, []);

  useEffect(() => {
    const target = dropRef.current;
    if (!target || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsUploaderVisible(entry.isIntersecting);
      },
      { threshold: 0.2 }
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
    };
  }, []);

  const handleFilesAdded = (files: FileList | File[]) => {
    const incoming = Array.from(files);
    if (!incoming.length) return;

    let blockedByLimit = false;
    let rejectedUnsupported = false;

    setItems((prev) => {
      const next = [...prev];

      for (const file of incoming) {
        if (next.length >= MAX_FILES) {
          blockedByLimit = true;
          break;
        }

        const extension = file.name.split(".").pop()?.toLowerCase() ?? "";
        if (!ALLOWED_EXTENSIONS.has(extension)) {
          rejectedUnsupported = true;
          continue;
        }

        const id = crypto.randomUUID();
        const previewUrl = URL.createObjectURL(file);

        next.push({
          id,
          file,
          previewUrl,
          sizeLabel: formatFileSize(file.size),
        });
      }

      return next;
    });

    if (blockedByLimit) {
      toast.error("Error: You can upload up to 25 files");
    } else if (rejectedUnsupported) {
      toast.error(
        "Error: Only JPG, JPEG, PNG, AVIF, SVG, HEIC, HEIF, TIFF, BMP, GIF, MP4, MOV, MKV, AVI, WEBM, M4V files are supported."
      );
    }
  };

  const handleRemove = (id: string) => {
    setItems((prev) => {
      const removed = prev.find((item) => item.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.previewUrl);
      }
      return prev.filter((item) => item.id !== id);
    });
    toast.success("File removed");
  };

  const handleClearAll = () => {
    if (items.length === 0) return;

    setItems((prev) => {
      prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
      return [];
    });
    toast.success("All files removed");
  };

  const handleDropAreaDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDropActive(true);
  };

  const handleDropAreaDragLeave = () => {
    setIsDropActive(false);
  };

  const handleDropAreaDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDropActive(false);
    handleFilesAdded(event.dataTransfer.files);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!items.length) {
      toast.error("No files selected");
      return;
    }

    const safeBaseName = sanitizeFilename(baseName);
    setIsConverting(true);
    setProgress({ current: 0, total: items.length });

    try {
      const converted: Array<{ blob: Blob; name: string }> = [];

      for (let index = 0; index < items.length; index += 1) {
        setProgress({ current: index + 1, total: items.length });
        const current = items[index];
        const formData = new FormData();
        formData.append("base_name", safeBaseName);
        formData.append("file_index", (index + 1).toString());
        formData.append("files", current.file, current.file.name);

        const response = await fetch("/api/convert", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const payload = (await response.json().catch(() => null)) as { error?: string } | null;
          const message = resolveErrorMessage(payload?.error);
          throw new Error(message);
        }

        const blob = await response.blob();
        converted.push({
          blob,
          name: `${safeBaseName}_${index + 1}.webp`,
        });
      }

      if (converted.length === 1) {
        downloadBlob(converted[0].blob, converted[0].name);
      } else {
        await downloadMultiple(converted, `${safeBaseName}_webp.zip`);
      }

      toast.success("Conversion completed successfully.");
      setItems((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
    } catch (error) {
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error("Conversion failed. Please try again.");
      }
  } finally {
    setIsConverting(false);
    setProgress(null);
  }
  };

  const progressPercent =
    progress && progress.total > 0
      ? Math.min(100, Math.round((progress.current / progress.total) * 100))
      : 0;

  const hasItems = items.length > 0;
  const progressLabel = isConverting
    ? `Converting${progress ? ` (${progress.current}/${progress.total})` : ""}`
    : "Convert to WebP / WebM";

  const handleFloatingDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDropActive(true);
    dropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  const handleFloatingDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setIsDropActive(false);
    handleFilesAdded(event.dataTransfer.files);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 dark:bg-dark-bg-primary px-4 py-12 pb-40 lg:pb-48">
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white dark:bg-dark-bg-secondary shadow-[0_24px_48px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)] animate-fade-in-up">
        <div className="flex flex-col gap-8 p-6 sm:p-10">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <div className="flex flex-col items-center text-center opacity-0 animate-fade-in-up-delay-1">
            <AppHeader onHelpClick={() => setIsHelpModalOpen(true)} />
          </div>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-left">
              <span className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary">
                Base filename for converted files
              </span>
              <input
                value={baseName}
                onChange={(event) => setBaseName(event.target.value)}
                placeholder="e.g. product-image"
                className="w-full rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white dark:bg-dark-bg-tertiary px-4 py-3 text-base font-medium text-slate-800 dark:text-dark-text-primary outline-none transition focus:border-brand-400 dark:focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(33,150,243,0.12)] dark:focus:shadow-[0_0_0_4px_rgba(33,150,243,0.2)] placeholder:text-slate-400 dark:placeholder:text-dark-text-muted"
              />
            </label>

            <div className={hasItems ? "transition-all duration-200" : "transition-all duration-200"} style={hasItems ? { height: "60%", minHeight: "140px" } : undefined}>
              <UploadDropzone
                dropRef={dropRef}
                fileInputRef={fileInputRef}
                isDropActive={isDropActive}
                supportedFormatsLabel={SUPPORTED_FORMATS_LABEL}
                maxFiles={MAX_FILES}
                accept={ACCEPT_TYPES}
                onFilesAdded={handleFilesAdded}
                onDragOver={handleDropAreaDragOver}
                onDragLeave={handleDropAreaDragLeave}
                onDrop={handleDropAreaDrop}
              />
            </div>

            {progress && (
              <ProgressPanel
                progressPercent={progressPercent}
                current={progress.current}
                total={progress.total}
              />
            )}

            <section className="space-y-4 opacity-0 animate-fade-in-up-delay-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary">
                    Selected files
                  </span>
                  <span className="text-xs text-slate-400 dark:text-dark-text-muted">Drag to change the order</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                    {items.length} items / max {MAX_FILES}
                  </span>
                  {items.length > 0 && (
                    <button
                      type="button"
                      onClick={handleClearAll}
                      disabled={isConverting}
                      className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-red-600 dark:text-red-400 transition hover:bg-red-50 dark:hover:bg-red-900/20 disabled:opacity-50 disabled:cursor-not-allowed"
                      aria-label="Clear all files"
                    >
                      <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                      Clear all
                    </button>
                  )}
                </div>
              </div>

              <SelectedFiles
                items={items}
                isConverting={isConverting}
                galleryRef={galleryRef}
                onRemove={handleRemove}
              />
            </section>

            <footer className="text-center text-xs font-medium text-slate-400 dark:text-dark-text-muted opacity-0 animate-fade-in-up-delay-3">
              © Webplyzer – Smart image optimization /{" "}
              <Link href="https://manapuraza.com" className="text-brand-500 dark:text-brand-400 hover:underline">
                ManatoYamashita
              </Link>
              {" "}&{" "}
              <Link href="https://3minute.vercel.app" className="text-brand-500 dark:text-brand-400 hover:underline">
                SHIN
              </Link>
            </footer>
          </form>

          {!isUploaderVisible && (
            <FloatingUploader
              isVisible
              isDropActive={isDropActive}
              onDragOver={handleFloatingDragOver}
              onDragLeave={handleDropAreaDragLeave}
              onDrop={handleFloatingDrop}
              onClickUpload={() => {
                dropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                fileInputRef.current?.click();
              }}
            />
          )}
        </div>
      </div>

      <StickyConvertButton hasItems={hasItems} isConverting={isConverting} progressLabel={progressLabel} />

      {isHelpModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 dark:bg-black/70 p-4 backdrop-blur-sm"
          onClick={() => setIsHelpModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[90vh] overflow-hidden rounded-2xl bg-white dark:bg-dark-bg-secondary shadow-2xl animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 z-10 flex items-center justify-between border-b border-slate-200 dark:border-dark-border-DEFAULT bg-white dark:bg-dark-bg-secondary px-6 py-4">
              <h2 className="text-xl font-semibold text-slate-900 dark:text-dark-text-primary">How to Use Webplyzer</h2>
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-full text-slate-400 dark:text-dark-text-muted hover:bg-slate-100 dark:hover:bg-dark-bg-tertiary hover:text-slate-600 dark:hover:text-dark-text-secondary transition-colors"
                aria-label="Close help"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="overflow-y-auto max-h-[calc(90vh-140px)] px-6 py-6 space-y-6">
              <section>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-dark-text-primary mb-3">How to Use</h3>
                <ol className="list-decimal list-inside space-y-2 text-sm text-slate-600 dark:text-dark-text-secondary">
                  <li>Upload images or videos (up to 25 files)</li>
                  <li>Drag and drop to reorder files as needed</li>
                  <li>Specify a base filename (default: &quot;image&quot;)</li>
                  <li>Click the &quot;Convert&quot; button</li>
                  <li>Single files download directly; multiple files are zipped</li>
                </ol>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-dark-text-primary mb-3">Supported Formats</h3>
                <div className="space-y-3 text-sm">
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-dark-text-primary mb-1">Images</p>
                    <p className="text-slate-600 dark:text-dark-text-secondary">JPG, JPEG, PNG, AVIF, SVG, HEIC, HEIF, TIFF, BMP, GIF</p>
                  </div>
                  <div>
                    <p className="font-semibold text-slate-700 dark:text-dark-text-primary mb-1">Videos</p>
                    <p className="text-slate-600 dark:text-dark-text-secondary">MP4, MOV, MKV, AVI, WEBM, M4V</p>
                  </div>
                </div>
              </section>

              <section>
                <h3 className="text-lg font-semibold text-slate-800 dark:text-dark-text-primary mb-3">Specifications</h3>
                <ul className="space-y-2 text-sm text-slate-600 dark:text-dark-text-secondary">
                  <li><span className="font-semibold text-slate-700 dark:text-dark-text-primary">Max files:</span> 25 files</li>
                  <li><span className="font-semibold text-slate-700 dark:text-dark-text-primary">Image output:</span> WebP format (quality 90)</li>
                  <li><span className="font-semibold text-slate-700 dark:text-dark-text-primary">Video output:</span> WebM format (VP9 + Opus)</li>
                  <li><span className="font-semibold text-slate-700 dark:text-dark-text-primary">Filename format:</span> {`<base>_<index>.webp`} or {`.webm`}</li>
                  <li><span className="font-semibold text-slate-700 dark:text-dark-text-primary">HEIC/HEIF support:</span> Converts Apple device photos seamlessly</li>
                </ul>
              </section>
            </div>

            <div className="sticky bottom-0 border-t border-slate-200 dark:border-dark-border-DEFAULT bg-white dark:bg-dark-bg-secondary px-6 py-4">
              <button
                type="button"
                onClick={() => setIsHelpModalOpen(false)}
                className="w-full rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-brand-600 dark:hover:bg-brand-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {isDropActive && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-brand-500/10 dark:bg-brand-400/10 backdrop-blur-sm animate-fade-in pointer-events-none">
          <div className="flex flex-col items-center gap-4 rounded-2xl border-2 border-dashed border-brand-400 dark:border-brand-500 bg-white/90 dark:bg-dark-bg-secondary/90 px-12 py-10 shadow-2xl">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-50 dark:bg-brand-900/30 text-brand-500 dark:text-brand-400">
              <Upload className="h-10 w-10" aria-hidden="true" />
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-brand-600 dark:text-brand-400">
                Drop files here
              </p>
              <p className="mt-2 text-sm text-slate-600 dark:text-dark-text-secondary">
                Release to upload your images or videos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
