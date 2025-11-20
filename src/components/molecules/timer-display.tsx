import { cn } from "@/lib/utils/utils";
import { formatTime } from "@/lib/utils/time-utils";
import { SkewedBackground } from "@/components/atoms";

interface TimerDisplayProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  className?: string;
}

export function TimerDisplay({
  timeRemaining,
  isTimerRunning,
  className = "",
}: TimerDisplayProps) {
  return (
    <div
      className={`absolute right-0 top-1/2 transform -translate-y-1/2 z-10 ${className}`}
    >
      <SkewedBackground className="pl-64 pr-10">
        <div className="text-right">
          <div
            className={cn(
              "text-[28rem] leading-[0.9] font-timer font-black",
              isTimerRunning ? "text-green-400" : "text-white"
            )}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </SkewedBackground>
    </div>
  );
}
