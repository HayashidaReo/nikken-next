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
      {/* スタックレイアウト用のコンテナ: 固定サイズを指定して背景図形を安定させる */}
      <div className="relative w-[1020px] h-[390px]">
        {/* レイヤー1: 背景図形 */}
        <div className="absolute inset-0 z-0">
          <SkewedBackground className="w-full h-full">
            {/* SkewedBackgroundはchildrenをラップするが、ここでは背景としてのみ使用するため空要素を渡す */}
            <div />
          </SkewedBackground>
        </div>

        {/* レイヤー2: タイマーテキスト */}
        <div className="absolute inset-0 z-20 flex items-center justify-end pr-12">
          <div
            className={cn(
              "text-[26rem] leading-[0.9] font-bold tracking-tight",
              isTimerRunning ? "text-green-400" : "text-white"
            )}
          >
            {formatTime(timeRemaining)}
          </div>
        </div>
      </div>
    </div>
  );
}
