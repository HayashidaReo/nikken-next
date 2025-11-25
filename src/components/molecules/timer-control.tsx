"use client";

import { Button } from "@/components/atoms/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/atoms/card";
import { ShortcutBadge } from "@/components/atoms/shortcut-badge";
import { TimeAdjuster } from "./time-adjuster";
import { Play, Pause, RotateCcw, Timer, Clock } from "lucide-react";

interface TimerControlProps {
  timeRemaining: number;
  isTimerRunning: boolean;
  timerMode: "countdown" | "stopwatch";
  onTimeChange: (newTime: number) => void;
  onStartTimer: () => void;
  onStopTimer: () => void;
  onTimerModeChange: (mode: "countdown" | "stopwatch") => void;
  defaultMatchTime?: number;
  className?: string;
}

export function TimerControl({
  timeRemaining,
  isTimerRunning,
  timerMode,
  onTimeChange,
  onStartTimer,
  onStopTimer,
  onTimerModeChange,
  defaultMatchTime = 180,
  className,
}: TimerControlProps) {
  return (
    <Card className={className}>
      <CardHeader className="p-4 pb-0">
        <div className="flex items-center gap-2">
          <CardTitle>タイマー制御</CardTitle>
          <ShortcutBadge shortcut="Double Space" className="text-xs" />
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="grid grid-cols-3 items-center">
          {/* 左: モード切り替えボタン */}
          <div className="flex justify-start">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                const newMode = timerMode === "countdown" ? "stopwatch" : "countdown";
                onTimerModeChange(newMode);
                // カウントダウンに切り替える時はデフォルト値、ストップウォッチは0秒
                onTimeChange(newMode === "countdown" ? defaultMatchTime : 0);
              }}
              disabled={isTimerRunning}
              className="gap-2"
            >
              {timerMode === "countdown" ? (
                <>
                  <Clock className="w-4 h-4" />
                  ストップウォッチ
                </>
              ) : (
                <>
                  <Timer className="w-4 h-4" />
                  カウントダウン
                </>
              )}
            </Button>
          </div>

          {/* 中央: タイマー */}
          <div className="flex justify-center">
            <div className="mb-0">
              <TimeAdjuster
                value={timeRemaining}
                onChange={onTimeChange}
                disabled={isTimerRunning}
                size="lg"
                longPressDelay={300}
                longPressInterval={80}
              />
            </div>
          </div>

          {/* 右: ボタン群 */}
          <div className="flex justify-end items-center space-x-2">
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
              onClick={() => onTimeChange(timerMode === "countdown" ? defaultMatchTime : 0)}
              disabled={isTimerRunning}
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              リセット
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
