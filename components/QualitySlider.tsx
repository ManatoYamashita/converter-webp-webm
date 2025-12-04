import type { QualitySliderProps } from "./types";

export function QualitySlider({
  quality,
  onQualityChange,
  disabled,
}: QualitySliderProps) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor="quality-slider"
          className="text-sm font-semibold text-slate-600 dark:text-dark-text-secondary"
        >
          Quality
        </label>
        <span className="text-sm font-bold text-brand-500 dark:text-brand-400">
          {quality}
        </span>
      </div>
      <input
        id="quality-slider"
        type="range"
        min="70"
        max="100"
        step="1"
        value={quality}
        onChange={(e) => onQualityChange(Number(e.target.value))}
        disabled={disabled}
        aria-label="Image quality"
        aria-valuemin={70}
        aria-valuemax={100}
        aria-valuenow={quality}
        className="w-full h-2 rounded-full bg-slate-200 dark:bg-dark-border-DEFAULT appearance-none cursor-pointer
          [&::-webkit-slider-thumb]:appearance-none
          [&::-webkit-slider-thumb]:h-5
          [&::-webkit-slider-thumb]:w-5
          [&::-webkit-slider-thumb]:rounded-full
          [&::-webkit-slider-thumb]:bg-brand-500
          [&::-webkit-slider-thumb]:dark:bg-brand-600
          [&::-webkit-slider-thumb]:hover:scale-110
          [&::-webkit-slider-thumb]:transition
          [&::-moz-range-thumb]:h-5
          [&::-moz-range-thumb]:w-5
          [&::-moz-range-thumb]:rounded-full
          [&::-moz-range-thumb]:bg-brand-500
          [&::-moz-range-thumb]:dark:bg-brand-600
          [&::-moz-range-thumb]:border-0
          [&::-moz-range-thumb]:hover:scale-110
          [&::-moz-range-thumb]:transition
          disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-text-secondary">
        <span>Lower size</span>
        <span>Higher quality</span>
      </div>
    </div>
  );
}
