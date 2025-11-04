import { Card, CardContent } from "@/components/atoms/card";
import { LoadingIndicator } from "./loading-indicator";
import { cn } from "@/lib/utils";

interface LoadingCardProps {
  message?: string;
  size?: "xs" | "sm" | "md" | "lg" | "xl";
  className?: string;
  showCard?: boolean;
}

export function LoadingCard({
  message = "読み込み中...",
  size = "md",
  className,
  showCard = true,
}: LoadingCardProps) {
  const content = (
    <LoadingIndicator
      message={message}
      size={size}
      centered={true}
      className="py-6"
    />
  );

  if (!showCard) {
    return content;
  }

  return (
    <Card className={cn("max-w-4xl mx-auto", className)}>
      <CardContent className="p-6">{content}</CardContent>
    </Card>
  );
}
