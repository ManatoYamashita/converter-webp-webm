import type { QualitySliderProps } from "./types";

export function QualitySlider({
  quality,
  onQualityChange,
  disabled,
}: QualitySliderProps) {
  // Calculate correct percentage for linear-gradient (min=70, max=100)
  const min = 70;
  const max = 100;
  const percentage = ((quality - min) / (max - min)) * 100;

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
        style={{
          '--value': percentage.toFixed(2),
        } as React.CSSProperties}
        className="quality-slider w-full h-2 rounded-full appearance-none cursor-pointer
          disabled:opacity-60 disabled:cursor-not-allowed"
      />
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-dark-text-secondary">
        <span>Lower size</span>
        <span>Higher quality</span>
      </div>
    </div>
  );
}
