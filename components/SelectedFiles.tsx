import { RefObject } from "react";
import { FileItem } from "./types";

type SelectedFilesProps = {
  items: FileItem[];
  isConverting: boolean;
  galleryRef: RefObject<HTMLDivElement>;
  onRemove: (id: string) => void;
};

export function SelectedFiles({ items, isConverting, galleryRef, onRemove }: SelectedFilesProps) {
  if (!items.length) {
    return (
      <div className="flex min-h-[160px] items-center justify-center rounded-2xl border border-dashed border-slate-200 dark:border-dark-border-DEFAULT bg-slate-50 dark:bg-dark-bg-tertiary text-sm text-slate-400 dark:text-dark-text-muted">
        No files selected
      </div>
    );
  }

  return (
    <div ref={galleryRef} className="flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
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
                onClick={() => onRemove(item.id)}
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
  );
}
