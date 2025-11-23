import clsx from "clsx";
import { Loader2 } from "lucide-react";

type FloatingUploaderProps = {
  isVisible: boolean;
  isDropActive: boolean;
  isUploading?: boolean;
  isConverting?: boolean;
  onDragOver: (event: React.DragEvent) => void;
  onDragLeave: () => void;
  onDrop: (event: React.DragEvent) => void;
  onClickUpload: () => void;
};

export function FloatingUploader({
  isVisible,
  isDropActive,
  isUploading = false,
  isConverting = false,
  onDragOver,
  onDragLeave,
  onDrop,
  onClickUpload,
}: FloatingUploaderProps) {
  if (!isVisible) return null;

  return (
    <div className="pointer-events-auto fixed left-4 right-4 top-4 z-30 md:left-1/2 md:right-auto md:w-[min(420px,calc(100%-32px))] md:-translate-x-1/2">
      <div
        className={clsx(
          "flex items-center justify-between rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-white/95 dark:bg-dark-bg-secondary/95 px-4 py-3 shadow-lg dark:shadow-md backdrop-blur transition-transform transition-[border-color,box-shadow,background-color] duration-200",
          isDropActive
            ? "scale-[1.02] border-brand-400 dark:border-brand-500 shadow-brand-500/30 dark:shadow-brand-500/25 bg-white dark:bg-dark-bg-secondary"
            : "scale-100",
          (isUploading || isConverting) && "cursor-not-allowed opacity-70"
        )}
        aria-disabled={isUploading || isConverting}
        onDragOver={(event) => {
          if (isUploading || isConverting) return;
          onDragOver(event);
        }}
        onDragLeave={onDragLeave}
        onDrop={(event) => {
          if (isUploading || isConverting) return;
          onDrop(event);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400">
            {isUploading || isConverting ? (
              <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            ) : (
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
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-semibold text-slate-700 dark:text-dark-text-primary">
              {isUploading || isConverting ? "Processing..." : "Drop files to add"}
            </span>
            <span className="text-xs text-slate-500 dark:text-dark-text-secondary">Scroll-free upload</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => {
            if (isUploading || isConverting) return;
            onClickUpload();
          }}
          disabled={isUploading || isConverting}
          className="rounded-full border border-slate-200 dark:border-dark-border-DEFAULT px-3 py-1 text-xs font-semibold text-slate-600 dark:text-dark-text-secondary transition hover:border-brand-300 dark:hover:border-brand-500 hover:text-brand-600 dark:hover:text-brand-400 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading || isConverting ? "Processing..." : "Upload"}
        </button>
      </div>
    </div>
  );
}
