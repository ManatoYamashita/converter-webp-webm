import { CloudUpload } from "lucide-react";

export function AppHeader() {
  return (
    <header className="flex flex-col items-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400">
        <CloudUpload className="h-6 w-6" aria-hidden="true" />
      </span>
      <h1 className="mt-4 text-2xl font-semibold text-slate-900 dark:text-dark-text-primary sm:text-3xl">
        Webplyzer - Batch WebP Converter
      </h1>
      <p className="mt-2 text-sm text-slate-500 dark:text-dark-text-secondary">
        Convert your images to WebP format
      </p>
    </header>
  );
}
