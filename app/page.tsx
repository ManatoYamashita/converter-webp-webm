"use client";

import { useEffect, useRef, useState } from "react";
import Sortable, { SortableEvent } from "sortablejs";
import clsx from "clsx";
import { ALLOWED_EXTENSIONS, MAX_FILES, sanitizeFilename } from "@/lib/sanitizeFilename";

const SITE_URL = "https://webplyzer.app";

type FileItem = {
  id: string;
  file: File;
  previewUrl: string;
  sizeLabel: string;
};

type Feedback =
  | {
      tone: "success" | "error";
      text: string;
    }
  | null;

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
      return "Only JPG, JPEG, PNG, SVG, HEIC files are supported.";
    default:
      return "Conversion failed. Please try again.";
  }
}

export default function HomePage() {
  const [items, setItems] = useState<FileItem[]>([]);
  const [baseName, setBaseName] = useState("image");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState<{ current: number; total: number } | null>(null);
  const [isDropActive, setIsDropActive] = useState(false);
  const [isUploaderVisible, setIsUploaderVisible] = useState(true);
  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      name: "Webplyzer",
      url: SITE_URL,
      description:
        "Convert JPG, JPEG, PNG, SVG, HEIC images to WebP with drag-and-drop, reordering, and sequential naming.",
      potentialAction: {
        "@type": "Action",
        name: "Convert images to WebP",
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
        "Batch convert images to WebP, maintain order, and export as ZIP for web performance optimization.",
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
      setFeedback({ tone: "error", text: "Error: You can upload up to 25 files" });
    } else if (rejectedUnsupported) {
      setFeedback({ tone: "error", text: "Error: Only JPG, JPEG, PNG, SVG, HEIC files are supported." });
    } else {
      setFeedback(null);
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
    setFeedback({ tone: "success", text: "File removed" });
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
      setFeedback({ tone: "error", text: "No files selected" });
      return;
    }

    const safeBaseName = sanitizeFilename(baseName);
    setIsConverting(true);
    setProgress({ current: 0, total: items.length });
    setFeedback(null);

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

      setFeedback({ tone: "success", text: "Conversion completed successfully." });
      setItems((prev) => {
        prev.forEach((item) => URL.revokeObjectURL(item.previewUrl));
        return [];
      });
    } catch (error) {
      if (error instanceof Error) {
        setFeedback({ tone: "error", text: error.message });
      } else {
        setFeedback({ tone: "error", text: "Conversion failed. Please try again." });
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

  return (
    <div
      className={clsx(
        "flex min-h-screen items-center justify-center bg-slate-100 dark:bg-dark-bg-primary px-4 py-12",
    hasItems && "pb-32"
      )}
    >
      <div className="relative w-full max-w-3xl rounded-3xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white dark:bg-dark-bg-secondary shadow-[0_24px_48px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_48px_rgba(0,0,0,0.4)]">
        <div className="flex flex-col gap-8 p-6 sm:p-10">
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
          />
          <header className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400">
              <svg
                aria-hidden="true"
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.75"
                viewBox="0 0 24 24"
              >
                <path d="M7 17h10a4 4 0 0 0 .54-7.97 5 5 0 0 0-9.82-1.5A3.5 3.5 0 0 0 7 17Zm5-8v10" />
                <path d="m9 13 3 3 3-3" />
              </svg>
            </span>
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-dark-text-primary sm:text-3xl">Webplyzer - Batch WebP Converter</h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-secondary">Convert your images to WebP format</p>
          </header>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-left">
              <span className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary">Base filename for converted images</span>
              <input
                value={baseName}
                onChange={(event) => setBaseName(event.target.value)}
                placeholder="e.g. product-image"
                className="w-full rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white dark:bg-dark-bg-tertiary px-4 py-3 text-base font-medium text-slate-800 dark:text-dark-text-primary outline-none transition focus:border-brand-400 dark:focus:border-brand-500 focus:shadow-[0_0_0_4px_rgba(33,150,243,0.12)] dark:focus:shadow-[0_0_0_4px_rgba(33,150,243,0.2)] placeholder:text-slate-400 dark:placeholder:text-dark-text-muted"
              />
            </label>

            <label
              ref={dropRef}
              htmlFor="fileInput"
              onDragOver={handleDropAreaDragOver}
              onDragLeave={handleDropAreaDragLeave}
              onDrop={handleDropAreaDrop}
              className={clsx(
                "relative flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 dark:border-dark-border-DEFAULT bg-slate-50/70 dark:bg-dark-bg-tertiary/50 p-8 text-center transition",
                isDropActive
                  ? "border-brand-400 dark:border-brand-500 bg-brand-50/80 dark:bg-brand-900/20"
                  : "hover:border-brand-400 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-dark-bg-secondary"
              )}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400 shadow-sm dark:shadow-none">
                <svg
                  aria-hidden="true"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.75"
                  viewBox="0 0 24 24"
                >
                  <path d="M12 16V4" />
                  <path d="m8 8 4-4 4 4" />
                  <path d="M20 16.5a4 4 0 0 0-.9-7.9 5 5 0 0 0-9.7-1.1A3.5 3.5 0 0 0 4 10.5a3.5 3.5 0 0 0 1 6.9Z" />
                </svg>
              </div>
              <div className="space-y-1">
                <span className="block text-base font-semibold text-slate-700 dark:text-dark-text-primary">
                  Select or drag & drop images
                </span>
                <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
                  JPG / JPEG / PNG / SVG / HEIC · max: {MAX_FILES}
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept=".jpg,.jpeg,.png,.svg,.heic,.heif"
                multiple
                className="hidden"
                onChange={(event) => {
                  if (event.target.files) {
                    handleFilesAdded(event.target.files);
                    event.target.value = "";
                  }
                }}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="rounded-full border border-brand-200 dark:border-brand-600 bg-white dark:bg-dark-bg-tertiary px-5 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400 transition hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20"
              >
                Add more
              </button>
            </label>

            {feedback && (
              <p
                className={clsx(
                  "rounded-2xl px-4 py-3 text-sm font-semibold",
                  feedback.tone === "success"
                    ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                )}
              >
                {feedback.text}
              </p>
            )}

            {progress && (
              <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-slate-50 dark:bg-dark-bg-tertiary p-4">
                <div className="h-2 rounded-full bg-slate-200 dark:bg-dark-border-DEFAULT">
                  <div
                    className="h-2 rounded-full bg-brand-500 dark:bg-brand-400 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-500 dark:text-dark-text-secondary">
                  Converting {progress.current}/{progress.total}
                </p>
              </div>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary">Selected files</span>
                  <span className="text-xs text-slate-400 dark:text-dark-text-muted">Drag to change the order</span>
                </div>
                <span className="text-sm font-semibold text-brand-600 dark:text-brand-400">
                  {items.length} items / max {MAX_FILES}
                </span>
              </div>

              {items.length > 0 ? (
                <div
                  ref={galleryRef}
                  className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1"
                >
                  {items.map((item, index) => (
                    <div
                      key={item.id}
                      data-id={item.id}
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white/80 dark:bg-dark-bg-tertiary/80 p-4 shadow-sm dark:shadow-none transition hover:shadow-md dark:hover:bg-dark-bg-tertiary"
                    >
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-slate-100 dark:bg-dark-bg-primary">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800 dark:text-dark-text-primary">{item.file.name}</p>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            disabled={isConverting}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-slate-400 dark:text-dark-text-muted transition hover:border-slate-200 dark:hover:border-dark-border-DEFAULT hover:text-slate-600 dark:hover:text-dark-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-text-secondary">
                          <span>{item.sizeLabel}</span>
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-primary text-xs font-semibold text-slate-500 dark:text-dark-text-secondary">
                              {index + 1}
                            </span>
                            <button
                              type="button"
                              className="js-drag-handle flex items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-slate-400 dark:text-dark-text-muted transition hover:border-slate-200 dark:hover:border-dark-border-DEFAULT hover:text-slate-600 dark:hover:text-dark-text-secondary active:cursor-grabbing disabled:cursor-not-allowed"
                              disabled={isConverting}
                              aria-label="Drag to change the order"
                            >
                              <span aria-hidden="true">⋮⋮</span>
                            </button>
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-dark-border-DEFAULT bg-slate-50 dark:bg-dark-bg-tertiary text-sm text-slate-400 dark:text-dark-text-muted">
                  No files selected
                </div>
              )}
            </section>

            <div className={clsx(hasItems && "h-0")}>
              <button
                type="submit"
                disabled={!items.length || isConverting}
                className={clsx(
                  hasItems
                    ? "fixed inset-x-4 bottom-6 z-30 rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-[0_14px_30px_rgba(33,150,243,0.3)] dark:shadow-[0_14px_30px_rgba(33,150,243,0.35)] transition md:left-1/2 md:right-auto md:w-[min(420px,calc(100%-32px))] md:-translate-x-1/2"
                    : "w-full rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-lg dark:shadow-md transition",
                  !items.length || isConverting
                    ? "cursor-not-allowed opacity-60"
                    : "hover:bg-brand-600 dark:hover:bg-brand-700 hover:shadow-xl dark:hover:shadow-lg"
                )}
              >
                {isConverting
                  ? `Converting${progress ? ` (${progress.current}/${progress.total})` : ""}`
                  : "Convert to WebP"}
              </button>
            </div>

            <footer className="text-center text-xs font-medium text-slate-400 dark:text-dark-text-muted">
              © Webplyzer – Smart image optimization
            </footer>
          </form>
          {hasItems && !isUploaderVisible && (
            <div className="pointer-events-auto fixed left-4 right-4 top-4 z-30 md:left-1/2 md:right-auto md:w-[min(420px,calc(100%-32px))] md:-translate-x-1/2">
              <div
                className={clsx(
                  "flex items-center justify-between rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white/95 dark:bg-dark-bg-secondary/95 px-4 py-3 shadow-lg dark:shadow-md backdrop-blur transition",
                  isDropActive && "border-brand-400 dark:border-brand-500 shadow-brand-500/20"
                )}
                onDragOver={(event) => {
                  event.preventDefault();
                  setIsDropActive(true);
                  dropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                }}
                onDragLeave={() => {
                  setIsDropActive(false);
                }}
                onDrop={(event) => {
                  event.preventDefault();
                  setIsDropActive(false);
                  handleFilesAdded(event.dataTransfer.files);
                }}
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400">
                    <svg
                      aria-hidden="true"
                      className="h-5 w-5"
                      fill="none"
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="1.75"
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 16V4" />
                      <path d="m8 8 4-4 4 4" />
                      <path d="M20 16.5a4 4 0 0 0-.9-7.9 5 5 0 0 0-9.7-1.1A3.5 3.5 0 0 0 4 10.5a3.5 3.5 0 0 0 1 6.9Z" />
                    </svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-slate-700 dark:text-dark-text-primary">
                      Drop files to add
                    </span>
                    <span className="text-xs text-slate-500 dark:text-dark-text-secondary">Scroll-free upload</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    dropRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
                    fileInputRef.current?.click();
                  }}
                  className="rounded-full border border-slate-200 dark:border-dark-border-DEFAULT px-3 py-1 text-xs font-semibold text-slate-600 dark:text-dark-text-secondary transition hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400"
                >
                  Upload
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
