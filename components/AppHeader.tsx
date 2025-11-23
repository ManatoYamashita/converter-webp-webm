export function AppHeader() {
  return (
    <header className="flex flex-col items-center text-center">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 dark:bg-dark-bg-tertiary text-brand-500 dark:text-brand-400">
        <svg
          aria-hidden="true"
          className="h-6 w-6"
          fill="none"
          stroke="currentColor"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="1.75"
          viewBox="0 0 24 24"
        >
          <path d="M7 17h10a4 4 0 0 0 .54-7.97 5 5 0 0 0-9.82-1.5A3.5 3.5 0 0 0 7 17Zm5-8v10" />
          <path d="m9 13 3 3 3-3" />
        </svg>
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
