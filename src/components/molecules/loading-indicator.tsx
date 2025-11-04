import { Spinner } from "@/components/atoms/spinner";
import { cn } from "@/lib/utils";

interface LoadingIndicatorProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  color?: "blue" | "white" | "gray" | "green" | "red";
  centered?: boolean;
  fullScreen?: boolean;
  className?: string;
  messageClassName?: string;
}

export function LoadingIndicator({
  message = "読み込み中...",
  size = "md",
  color = "blue",
  centered = true,
  fullScreen = false,
  className,
  messageClassName,
}: LoadingIndicatorProps) {
  const containerClasses = cn(
    "flex flex-col items-center justify-center gap-4",
    {
      "min-h-screen": fullScreen,
      "min-h-[200px]": centered && !fullScreen,
    },
    className
  );

  const messageClasses = cn(
    "text-gray-600",
    {
      "text-sm": size === "xs" || size === "sm",
      "text-base": size === "md",
      "text-lg": size === "lg" || size === "xl",
    },
    messageClassName
  );

  return (
    <div className={containerClasses}>
      <Spinner size={size} color={color} />
      {message && <p className={messageClasses}>{message}</p>}
    </div>
  );
}
