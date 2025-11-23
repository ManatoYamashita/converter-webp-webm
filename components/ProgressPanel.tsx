type ProgressPanelProps = {
  progressPercent: number;
  current: number;
  total: number;
};

export function ProgressPanel({ progressPercent, current, total }: ProgressPanelProps) {
  return (
    <div className="space-y-2 rounded-2xl border border-slate-200 dark:border-dark-border-DEFAULT bg-slate-50 dark:bg-dark-bg-tertiary p-4">
      <div className="h-2 rounded-full bg-slate-200 dark:bg-dark-border-DEFAULT">
        <div
          className="h-2 rounded-full bg-brand-500 dark:bg-brand-400 transition-all"
          style={{ width: `${progressPercent}%` }}
        />
      </div>
      <p className="text-xs font-medium text-slate-500 dark:text-dark-text-secondary">
        Converting {current}/{total}
      </p>
    </div>
  );
}
