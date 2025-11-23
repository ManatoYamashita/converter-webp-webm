import clsx from "clsx";

export type StickyConvertButtonProps = {
  hasItems: boolean;
  isConverting: boolean;
  progressLabel: string;
};

export function StickyConvertButton({ hasItems, isConverting, progressLabel }: StickyConvertButtonProps) {
  if (!hasItems) return null;

  return (
    <div aria-live="polite" className="pointer-events-none">
      <button
        type="submit"
        disabled={isConverting}
        className={clsx(
          "pointer-events-auto fixed bottom-6 left-1/2 z-50 w-[min(440px,calc(100%-32px))] -translate-x-1/2 rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-[0_16px_34px_rgba(33,150,243,0.34)] dark:shadow-[0_16px_34px_rgba(33,150,243,0.36)] transition",
          isConverting
            ? "cursor-not-allowed opacity-70"
            : "hover:bg-brand-600 dark:hover:bg-brand-700 hover:shadow-xl dark:hover:shadow-lg"
        )}
      >
        {progressLabel}
      </button>
    </div>
  );
}
