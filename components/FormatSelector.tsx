import { clsx } from "clsx";
import type { FormatSelectorProps } from "./types";

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  disabled,
}: FormatSelectorProps) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary">
        Output Format
      </label>
      <div
        role="radiogroup"
        aria-label="Image output format"
        className="flex gap-3"
      >
        {(["webp", "jpg"] as const).map((format) => (
          <button
            key={format}
            type="button"
            role="radio"
            aria-checked={selectedFormat === format}
            onClick={() => onFormatChange(format)}
            disabled={disabled}
            className={clsx(
              "flex-1 rounded-2xl px-6 py-3 text-base font-semibold transition",
              selectedFormat === format
                ? "bg-brand-500 dark:bg-brand-600 text-white"
                : "border-2 border-brand-200 dark:border-brand-600 text-slate-600 dark:text-dark-text-secondary hover:border-brand-400",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            {format.toUpperCase()}
          </button>
        ))}
      </div>
    </div>
  );
}
