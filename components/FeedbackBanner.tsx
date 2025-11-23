import clsx from "clsx";

type Feedback =
  | {
      tone: "success" | "error";
      text: string;
    }
  | null;

export function FeedbackBanner({ feedback }: { feedback: Feedback }) {
  if (!feedback) return null;

  return (
    <p
      className={clsx(
        "rounded-2xl px-4 py-3 text-sm font-semibold",
        feedback.tone === "success"
          ? "bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400"
          : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
      )}
    >
      {feedback.text}
    </p>
  );
}
