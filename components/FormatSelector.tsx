import { clsx } from "clsx";
import type { FormatSelectorProps } from "./types";

export function FormatSelector({
  selectedFormat,
  onFormatChange,
  disabled,
}: FormatSelectorProps) {
  const options: { value: FormatSelectorProps["selectedFormat"]; label: string }[] = [
    { value: "webp_webm", label: "WEBP / WEBM" },
    { value: "jpg_mp4", label: "JPG / MP4" },
  ];

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary">
        Output Format
      </label>
      <div
        role="radiogroup"
        aria-label="Output format for images and videos"
        className="flex gap-3"
      >
        {options.map((option) => (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={selectedFormat === option.value}
            onClick={() => onFormatChange(option.value)}
            disabled={disabled}
            className={clsx(
              "flex-1 rounded-2xl px-6 py-3 text-base font-semibold transition",
              selectedFormat === option.value
                ? "bg-brand-500 dark:bg-brand-600 text-white"
                : "border-2 border-brand-200 dark:border-brand-600 text-slate-600 dark:text-dark-text-secondary hover:border-brand-400",
              disabled && "opacity-60 cursor-not-allowed"
            )}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );
}
