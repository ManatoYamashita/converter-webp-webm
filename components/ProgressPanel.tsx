import { ConversionProgress } from "./types";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

export type ProgressPanelProps = {
  progress: ConversionProgress[];
};

export function ProgressPanel({ progress }: ProgressPanelProps) {
  const completedCount = progress.filter((p) => p.status === "completed").length;
  const totalCount = progress.length;

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/20 dark:bg-black/40 backdrop-blur-sm">
      <div className="w-[min(500px,calc(100%-32px))] max-h-[80vh] overflow-y-auto rounded-2xl bg-white dark:bg-dark-bg-secondary p-6 shadow-xl">
        <div className="flex flex-col gap-4">
          {/* 全体の進捗バー */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-semibold text-slate-700 dark:text-dark-text-primary">
                Overall Progress
              </p>
              <p className="text-sm font-medium text-brand-600 dark:text-brand-400">
                {completedCount} / {totalCount}
              </p>
            </div>
            <div className="h-2 rounded-full bg-slate-200 dark:bg-dark-border-DEFAULT overflow-hidden">
              <div
                className="h-2 rounded-full bg-brand-500 dark:bg-brand-400 transition-all duration-300"
                style={{ width: `${(completedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>

          {/* 個別ファイルの進捗 */}
          <div className="flex flex-col gap-2 max-h-[400px] overflow-y-auto">
            {progress.map((file) => (
              <div
                key={file.fileId}
                className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-dark-bg-tertiary"
              >
                {file.status === "pending" && (
                  <div className="h-5 w-5 rounded-full border-2 border-slate-300 dark:border-dark-border-DEFAULT" />
                )}
                {file.status === "converting" && (
                  <Loader2 className="h-5 w-5 text-brand-500 dark:text-brand-400 animate-spin" />
                )}
                {file.status === "completed" && (
                  <CheckCircle2 className="h-5 w-5 text-green-500 dark:text-green-400" />
                )}
                {file.status === "failed" && (
                  <XCircle className="h-5 w-5 text-red-500 dark:text-red-400" />
                )}

                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-slate-700 dark:text-dark-text-primary truncate">
                    {file.fileName}
                  </p>
                  {file.status === "failed" && file.error && (
                    <p className="text-xs text-red-600 dark:text-red-400 truncate">
                      {file.error}
                    </p>
                  )}
                </div>

                <div className="text-xs font-semibold text-slate-500 dark:text-dark-text-muted">
                  {file.status === "pending" && "Waiting"}
                  {file.status === "converting" && "Converting..."}
                  {file.status === "completed" && "Done"}
                  {file.status === "failed" && "Failed"}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
