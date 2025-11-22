"use client";

import { useEffect, useRef, useState } from "react";
import Sortable, { SortableEvent } from "sortablejs";
import clsx from "clsx";
import { ALLOWED_EXTENSIONS, MAX_FILES, sanitizeFilename } from "@/lib/sanitizeFilename";

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
      return "Only JPG, JPEG, PNG, HEIC files are supported.";
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
      setFeedback({ tone: "error", text: "Error: Only JPG, JPEG, PNG, HEIC files are supported." });
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

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-12">
      <div className="w-full max-w-3xl rounded-3xl border border-slate-200 bg-white shadow-[0_24px_48px_rgba(15,23,42,0.12)]">
        <div className="flex flex-col gap-8 p-6 sm:p-10">
          <header className="flex flex-col items-center text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-brand-500">
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
            <h1 className="mt-4 text-2xl font-semibold text-slate-900 sm:text-3xl">Webplyzer - Batch WebP Converter</h1>
            <p className="mt-2 text-sm text-slate-500">Convert your images to WebP format</p>
          </header>

          <form className="flex flex-col gap-8" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-left">
              <span className="text-sm font-semibold text-slate-600">Base filename for converted images</span>
              <input
                value={baseName}
                onChange={(event) => setBaseName(event.target.value)}
                placeholder="e.g. product-image"
                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-800 outline-none transition focus:border-brand-400 focus:shadow-[0_0_0_4px_rgba(33,150,243,0.12)]"
              />
            </label>

            <label
              ref={dropRef}
              htmlFor="fileInput"
              onDragOver={(event) => {
                event.preventDefault();
                if (dropRef.current) {
                  dropRef.current.dataset.dropping = "true";
                }
              }}
              onDragLeave={() => {
                if (dropRef.current) {
                  delete dropRef.current.dataset.dropping;
                }
              }}
              onDrop={(event) => {
                event.preventDefault();
                if (dropRef.current) {
                  delete dropRef.current.dataset.dropping;
                }
                handleFilesAdded(event.dataTransfer.files);
              }}
              className={clsx(
                "relative flex min-h-[220px] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 p-8 text-center transition",
                dropRef.current?.dataset.dropping
                  ? "border-brand-400 bg-brand-50/80"
                  : "hover:border-brand-400 hover:bg-white"
              )}
            >
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white text-brand-500 shadow-sm">
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
                <span className="block text-base font-semibold text-slate-700">
                  Select or drag & drop images
                </span>
                <p className="text-xs text-slate-500">
                  JPG / JPEG / PNG · max: {MAX_FILES}
                </p>
              </div>
              <input
                ref={fileInputRef}
                id="fileInput"
                type="file"
                accept=".jpg,.jpeg,.png"
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
                className="rounded-full border border-brand-200 bg-white px-5 py-2 text-sm font-semibold text-brand-600 transition hover:border-brand-400 hover:bg-brand-50"
              >
                Add more
              </button>
            </label>

            {feedback && (
              <p
                className={clsx(
                  "rounded-2xl px-4 py-3 text-sm font-semibold",
                  feedback.tone === "success"
                    ? "bg-green-50 text-green-600"
                    : "bg-red-50 text-red-600"
                )}
              >
                {feedback.text}
              </p>
            )}

            {progress && (
              <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50 p-4">
                <div className="h-2 rounded-full bg-slate-200">
                  <div
                    className="h-2 rounded-full bg-brand-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
                <p className="text-xs font-medium text-slate-500">
                  Converting {progress.current}/{progress.total}
                </p>
              </div>
            )}

            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex flex-col items-start gap-1 sm:flex-row sm:items-center sm:gap-3">
                  <span className="text-sm font-semibold text-slate-600">Selected files</span>
                  <span className="text-xs text-slate-400">Drag to change the order</span>
                </div>
                <span className="text-sm font-semibold text-brand-600">
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
                      className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white/80 p-4 shadow-sm transition hover:shadow-md"
                    >
                      <div className="flex h-14 w-14 items-center justify-center overflow-hidden rounded-xl bg-slate-100">
                        <img
                          src={item.previewUrl}
                          alt={item.file.name}
                          className="h-full w-full object-cover"
                          draggable={false}
                        />
                      </div>
                      <div className="flex flex-1 flex-col gap-3">
                        <div className="flex items-start justify-between gap-3">
                          <p className="text-sm font-semibold text-slate-800">{item.file.name}</p>
                          <button
                            type="button"
                            onClick={() => handleRemove(item.id)}
                            disabled={isConverting}
                            className="flex h-8 w-8 items-center justify-center rounded-full border border-transparent text-slate-400 transition hover:border-slate-200 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-40"
                            aria-label="Remove"
                          >
                            ×
                          </button>
                        </div>
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span>{item.sizeLabel}</span>
                          <span className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-500">
                              {index + 1}
                            </span>
                            <button
                              type="button"
                              className="js-drag-handle flex items-center justify-center rounded-full border border-transparent px-3 py-1 text-xs font-semibold text-slate-400 transition hover:border-slate-200 hover:text-slate-600 active:cursor-grabbing disabled:cursor-not-allowed"
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
                <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-sm text-slate-400">
                  No files selected
                </div>
              )}
            </section>

            <button
              type="submit"
              disabled={!items.length || isConverting}
              className={clsx(
                "w-full rounded-full bg-brand-500 px-6 py-4 text-lg font-semibold text-white shadow-lg transition",
                !items.length || isConverting
                  ? "cursor-not-allowed opacity-60"
                  : "hover:bg-brand-600 hover:shadow-xl"
              )}
            >
              {isConverting
                ? `Converting${progress ? ` (${progress.current}/${progress.total})` : ""}`
                : "Convert to WebP"}
            </button>

            <footer className="text-center text-xs font-medium text-slate-400">
              © Webplyzer – Smart image optimization
            </footer>
          </form>
        </div>
      </div>
    </div>
  );
}
