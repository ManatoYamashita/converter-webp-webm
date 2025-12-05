import clsx from "clsx";
import { RefObject } from "react";
import { Upload } from "lucide-react";

type UploadDropzoneProps = {
  dropRef: RefObject<HTMLLabelElement | null>;
  fileInputRef: RefObject<HTMLInputElement | null>;
  isDropActive: boolean;
  isConverting: boolean;
  isCompact?: boolean;
  supportedFormatsLabel: string;
  maxFiles: number;
  accept: string;
  onFilesAdded: (files: FileList | File[]) => void;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
};

export function UploadDropzone({
  dropRef,
  fileInputRef,
  isDropActive,
  isConverting,
  isCompact = false,
  supportedFormatsLabel,
  maxFiles,
  accept,
  onFilesAdded,
  onDragOver,
  onDragLeave,
  onDrop,
}: UploadDropzoneProps) {
  return (
    <label
      ref={dropRef}
      htmlFor="fileInput"
      aria-disabled={isConverting}
      onDragOver={(event) => {
        if (isConverting) return;
        onDragOver(event);
      }}
      onDragLeave={onDragLeave}
      onDrop={(event) => {
        if (isConverting) return;
        onDrop(event);
      }}
      className={clsx(
        "relative flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-slate-300 dark:border-dark-border-DEFAULT bg-slate-50/70 dark:bg-dark-bg-tertiary/50 p-8 text-center transition-colors",
        isCompact ? "h-[100px]" : "min-h-[220px]",
        isDropActive
          ? "border-brand-400 dark:border-brand-500 bg-brand-50/80 dark:bg-brand-900/20"
          : "hover:border-brand-400 dark:hover:border-brand-500 hover:bg-white dark:hover:bg-dark-bg-secondary",
        isConverting && "cursor-not-allowed opacity-60"
      )}
    >
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400 shadow-sm dark:shadow-none">
        <Upload className="h-7 w-7" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <span className="block text-base font-semibold text-slate-700 dark:text-dark-text-primary">
          Select or drag & drop images / videos
        </span>
        <p className="text-xs text-slate-500 dark:text-dark-text-secondary">
          {supportedFormatsLabel} · max: {maxFiles}
        </p>
      </div>
      <input
        ref={fileInputRef}
        id="fileInput"
        type="file"
        accept={accept}
        multiple
        disabled={isConverting}
        className="hidden"
        onChange={(event) => {
          if (event.target.files) {
            onFilesAdded(event.target.files);
            event.target.value = "";
          }
        }}
      />
      <button
        type="button"
        onClick={() => {
          if (isConverting) return;
          fileInputRef.current?.click();
        }}
        disabled={isConverting}
        className="rounded-full border border-brand-200 dark:border-brand-600 bg-white dark:bg-dark-bg-tertiary px-5 py-2 text-sm font-semibold text-brand-600 dark:text-brand-400 transition hover:border-brand-400 dark:hover:border-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isConverting ? "Converting..." : "Add more"}
      </button>
    </label>
  );
}
