"use client";

import * as React from "react";
import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { Play, Pause, RotateCcw } from "lucide-react";

interface TimerControlProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  onTimeChange: (newTime: number) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  className?: string;
}

type TimerAdjustType =
  | "minutes-up"
  | "minutes-down"
  | "seconds-up"
  | "seconds-down";

export function TimerControl({
  timeRemaining,
  isTimerRunning,
  onTimeChange,
  onStartTimer,
  onStopTimer,
  className,
}: TimerControlProps) {
  // 長押し用の状態管理
  const [pressTimer, setPressTimer] = React.useState<NodeJS.Timeout | null>(
    null
  );
  const [pressInterval, setPressInterval] =
    React.useState<NodeJS.Timeout | null>(null);

  // 長押し開始処理
  const handleMouseDown = React.useCallback(
    (type: TimerAdjustType) => {
      if (isTimerRunning) return;

      const adjustTime = () => {
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;

        let newTime = timeRemaining;

        switch (type) {
          case "minutes-up":
            if (minutes < 99) {
              newTime = (minutes + 1) * 60 + seconds;
            }
            break;
          case "minutes-down":
            if (minutes > 0) {
              newTime = (minutes - 1) * 60 + seconds;
            }
            break;
          case "seconds-up":
            const newSeconds = seconds + 1;
            const finalSeconds = newSeconds >= 60 ? 0 : newSeconds;
            newTime = minutes * 60 + finalSeconds;
            break;
          case "seconds-down":
            const downSeconds = seconds - 1;
            const finalDownSeconds = downSeconds < 0 ? 59 : downSeconds;
            newTime = minutes * 60 + finalDownSeconds;
            break;
        }

        onTimeChange(newTime);
      };

      // 最初の1回を実行
      adjustTime();

      // 300ms後に連続実行開始
      const timer = setTimeout(() => {
        const interval = setInterval(() => {
          adjustTime();
        }, 100);
        setPressInterval(interval);
      }, 300);
      setPressTimer(timer);
    },
    [isTimerRunning, timeRemaining, onTimeChange]
  );

  // 長押し終了処理
  const handleMouseUp = React.useCallback(() => {
    if (pressTimer) {
      clearTimeout(pressTimer);
      setPressTimer(null);
    }
    if (pressInterval) {
      clearInterval(pressInterval);
      setPressInterval(null);
    }
  }, [pressTimer, pressInterval]);

  // コンポーネントのクリーンアップ
  React.useEffect(() => {
    return () => {
      if (pressTimer) clearTimeout(pressTimer);
      if (pressInterval) clearInterval(pressInterval);
    };
  }, [pressTimer, pressInterval]);

  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>タイマー制御</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center space-x-6">
          <div className="text-center">
            {/* 固定高さタイマー表示 */}
            <div className="mb-4 h-16 flex items-center justify-center">
              <div className="text-4xl font-mono font-bold flex items-center justify-center space-x-2">
                {/* 分の表示と調整 */}
                <div className="flex items-center">
                  <span className="min-w-[3ch] text-center">
                    {minutes.toString().padStart(2, "0")}
                  </span>
                  {!isTimerRunning && (
                    <div className="flex flex-col ml-1">
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                        onMouseDown={() => handleMouseDown("minutes-up")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={() => handleMouseDown("minutes-up")}
                        onTouchEnd={handleMouseUp}
                      >
                        ▲
                      </button>
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                        onMouseDown={() => handleMouseDown("minutes-down")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={() => handleMouseDown("minutes-down")}
                        onTouchEnd={handleMouseUp}
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>

                <span className="text-gray-400">:</span>

                {/* 秒の表示と調整 */}
                <div className="flex items-center">
                  <span className="min-w-[3ch] text-center">
                    {seconds.toString().padStart(2, "0")}
                  </span>
                  {!isTimerRunning && (
                    <div className="flex flex-col ml-1">
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                        onMouseDown={() => handleMouseDown("seconds-up")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={() => handleMouseDown("seconds-up")}
                        onTouchEnd={handleMouseUp}
                      >
                        ▲
                      </button>
                      <button
                        className="text-xs text-gray-500 hover:text-gray-700 leading-none select-none"
                        onMouseDown={() => handleMouseDown("seconds-down")}
                        onMouseUp={handleMouseUp}
                        onMouseLeave={handleMouseUp}
                        onTouchStart={() => handleMouseDown("seconds-down")}
                        onTouchEnd={handleMouseUp}
                      >
                        ▼
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Button
                variant={isTimerRunning ? "destructive" : "default"}
                onClick={isTimerRunning ? onStopTimer : onStartTimer}
                size="lg"
              >
                {isTimerRunning ? (
                  <>
                    <Pause className="w-4 h-4 mr-2" />
                    停止
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    開始
                  </>
                )}
              </Button>

              <Button
                variant="outline"
                onClick={() => onTimeChange(180)}
                disabled={isTimerRunning}
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                リセット
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
