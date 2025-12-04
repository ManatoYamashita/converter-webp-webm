import clsx from "clsx";
import { Loader2 } from "lucide-react";

export type StickyConvertButtonProps = {
  hasItems: boolean;
  isConverting: boolean;
  onConvert: () => void;
};

export function StickyConvertButton({ hasItems, isConverting, onConvert }: StickyConvertButtonProps) {
  if (!hasItems) return null;

  const label = isConverting ? "Converting" : "Convert to WebP / WebM";

  return (
    <div aria-live="polite" className="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex justify-center pb-6">
      <button
        type="button"
        onClick={onConvert}
        disabled={isConverting}
        className={clsx(
          "pointer-events-auto w-[min(440px,calc(100%-32px))] rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-[0_16px_34px_rgba(33,150,243,0.34)] dark:shadow-[0_16px_34px_rgba(33,150,243,0.36)] transition transform animate-fade-in-up",
          isConverting
            ? "cursor-not-allowed opacity-70"
            : "hover:bg-brand-600 dark:hover:bg-brand-700 hover:shadow-xl dark:hover:shadow-lg"
        )}
      >
        <span className="flex items-center justify-center gap-2">
          {isConverting && <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />}
          {label}
        </span>
      </button>
    </div>
  );
}
