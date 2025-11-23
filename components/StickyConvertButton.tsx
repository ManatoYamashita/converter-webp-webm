import clsx from "clsx";

type StickyConvertButtonProps = {
  hasItems: boolean;
  isConverting: boolean;
  progressLabel: string;
};

export function StickyConvertButton({ hasItems, isConverting, progressLabel }: StickyConvertButtonProps) {
  return (
    <div className={clsx(hasItems && "h-0")}>
      <button
        type="submit"
        disabled={!hasItems || isConverting}
        className={clsx(
          hasItems
            ? "fixed inset-x-4 bottom-6 z-30 rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-[0_14px_30px_rgba(33,150,243,0.3)] dark:shadow-[0_14px_30px_rgba(33,150,243,0.35)] transition md:left-1/2 md:right-auto md:w-[min(420px,calc(100%-32px))] md:-translate-x-1/2"
            : "w-full rounded-full bg-brand-500 dark:bg-brand-600 px-6 py-4 text-lg font-semibold text-white shadow-lg dark:shadow-md transition",
          !hasItems || isConverting
            ? "cursor-not-allowed opacity-60"
            : "hover:bg-brand-600 dark:hover:bg-brand-700 hover:shadow-xl dark:hover:shadow-lg"
        )}
      >
        {isConverting ? progressLabel : "Convert to WebP / WebM"}
      </button>
    </div>
  );
}
