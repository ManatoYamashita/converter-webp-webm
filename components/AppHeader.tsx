import clsx from "clsx";
import Image from "next/image";
import { HelpCircle } from "lucide-react";

type AppHeaderProps = {
  onHelpClick: () => void;
  isCompact?: boolean;
};

export function AppHeader({ onHelpClick, isCompact = false }: AppHeaderProps) {
  return (
    <header className="flex flex-col items-center text-center transition-all duration-200">
      <span
        className={clsx(
          "flex items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-tertiary transition-all duration-200",
          isCompact ? "h-8 w-8" : "h-12 w-12"
        )}
      >
        <Image
          src="/favicon.webp"
          alt=""
          width={24}
          height={24}
          className={clsx("transition-all duration-200", isCompact ? "h-4 w-4" : "h-6 w-6")}
        />
      </span>
      <h1
        className={clsx(
          "font-semibold text-slate-900 dark:text-dark-text-primary transition-all duration-200",
          isCompact ? "mt-2 text-lg" : "mt-4 text-2xl sm:text-3xl"
        )}
      >
        Converter WebP/WebM
      </h1>
      <div
        className={clsx(
          "flex items-center gap-2 overflow-hidden transition-all duration-200",
          isCompact ? "max-h-0 opacity-0 mt-0" : "max-h-20 opacity-100 mt-2"
        )}
      >
        <p className="text-sm text-slate-500 dark:text-dark-text-secondary">
          Convert images to WebP and videos to WebM
        </p>
        <button
          type="button"
          onClick={onHelpClick}
          className="flex items-center justify-center text-slate-400 dark:text-dark-text-muted hover:text-brand-500 dark:hover:text-brand-400 transition-colors"
          aria-label="Show help"
        >
          <HelpCircle className="h-4 w-4" />
        </button>
      </div>
    </header>
  );
}
