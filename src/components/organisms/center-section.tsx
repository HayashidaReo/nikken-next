import { TimerDisplay } from "@/components/molecules/timer-display";

interface CenterSectionProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  className?: string;
}

export function CenterSection({
  timeRemaining,
  isTimerRunning,
  className = "",
}: CenterSectionProps) {
  return (
    <div className={`bg-gray-900 py-6 px-16 relative ${className}`}>

      {/* タイマー表示 */}
      <TimerDisplay
        timeRemaining={timeRemaining}
        isTimerRunning={isTimerRunning}
      />
    </div>
  );
}
