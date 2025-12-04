export function ProgressPanel() {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm">
      <div className="w-[min(400px,calc(100%-32px))] rounded-2xl bg-white dark:bg-dark-bg-secondary p-6 shadow-xl">
        <div className="flex flex-col gap-4">
          <div className="h-2 rounded-full bg-slate-200 dark:bg-dark-border-DEFAULT overflow-hidden">
            <div className="h-2 rounded-full bg-brand-500 dark:bg-brand-400 animate-pulse w-full" />
          </div>
          <p className="text-sm font-medium text-center text-slate-600 dark:text-dark-text-secondary">
            Converting files, please wait...
          </p>
        </div>
      </div>
    </div>
  );
}
